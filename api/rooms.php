<?php
// Phone buzzer rooms (US-52, D-80): players join the host's game from their own phones and follow
// the board live. Hostinger has no WebSockets and no cron, so phones poll about once a second.
//
// Host calls (the host token from `create` is the only key; it is never sent to phones):
//   POST /api/rooms.php?action=create   body { state, session }                         -> 201 { code, host_token, version }
//   POST /api/rooms.php?action=claim    body { code, host_token, session }              -> 200 { version }
//   POST /api/rooms.php?action=push     body { code, host_token, session, state }       -> 200 { version }
//   POST /api/rooms.php?action=release  body { code, host_token, session, contestant }  -> 200 { released, version }
//   push and release from a host session that is not the room's current one -> 409 { error, other_tab: true }
// Player calls (the room code is public: it is in the link and the QR code):
//   GET  /api/rooms.php?action=lobby&code=ABC234[&session=<host session>]       -> 200 { version, mode, players[, other_tab] }
//   POST /api/rooms.php?action=join     body { code, contestant, device_token? } -> 200 { device_token, you, version }
//   GET  /api/rooms.php?action=state&code=ABC234&since=<version>  header X-Device-Token
//        -> 200 { changed: false, version } when nothing changed since that version,
//           else { changed: true, version, you, players, state }
// players = [{ name, color, joined }] in the host's order; `contestant` / `you` is an index in it.
//
// Rules:
// - The host screen is the source of truth. `state` is the board as the phones may see it, built by
//   the host and rebuilt here from known fields only (room_state()): no questions, no answers, no
//   value of an unopened Kilo Meshakkal box (US-53) and no double-score mark (D-40) before its cell
//   is opened (D-80 p). The version goes up on every change the phones must see (push, join, release).
// - One device per name and one name per device (both unique in room_players): a second claim of a
//   name gets 409; a device that picks another name gives up its first one. The same device token
//   on the same name is a rejoin (a refreshed phone keeps its name).
// - One host tab at a time (BUG-52-02): every host page load has its own session id (32 hex
//   characters, not a secret). create and claim make it the room's session; push and release from any
//   other session are refused with 409 other_tab, so an older tab can never overwrite the board. The
//   newest tab that loaded (or tapped "Use this tab") wins. The host's lobby poll sends its session and
//   gets other_tab: true when another tab has taken over.
// - Replies carry the version stored by their own update (LAST_INSERT_ID(expr), per connection).
// - Tokens are 64 hex characters from random_bytes(); only their SHA-256 hashes are stored.
// - Rooms with no request for ROOM_IDLE_HOURS are deleted on the next rooms request (no cron).
// - A missing token gives 401, a wrong one 403, an unknown or expired room 404, bad input 400.
//   A database without the tables (sql/migrate-add-rooms.sql not run) gives 503.
require_once __DIR__ . '/db.php';

const ROOM_IDLE_HOURS = 6;
const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0 or 1: easy to read out and type
const ROOM_TOUCH_SECONDS = 60;     // a poll records the room's last request at most this often
const ROOM_BODY_MAX = 262144;      // bytes of a request body
const ROOM_STATE_MAX = 131072;     // bytes of the stored state (a 10 x 20 board with long names is far below)
const ROOM_MODES = ['players' => 6, 'teams' => 4]; // D-80 b: Players and Teams only, with their limits
const ROOM_SCREENS = ['board', 'question', 'final', 'results'];
const ROOM_MAX_POINTS = 50;        // board rows (any number of enabled point values; far above a real board)
const ROOM_MAX_CATEGORIES = 20;    // board columns
const ROOM_NAME_MAX = 30;          // contestant names (NAME_MAX in js/game.js)
const ROOM_LABEL_MAX = 100;        // category names: VARCHAR(100) name and name_ar in categories
const ROOM_FACE_MAX = 8;           // characters of a Kilo Meshakkal emoji
const ROOM_SCORE_MAX = 1000000000;

/** Run the request; a database without the room tables gives a clear 503. */
function rooms_main(): void
{
    try {
        $pdo = db();
        delete_idle_rooms($pdo);
        route_room_request($pdo);
    } catch (PDOException $e) {
        if (is_missing_table($e)) {
            error_log('BrainRush API: the room tables are missing (run sql/migrate-add-rooms.sql).');
            json_response(['error' => 'Phone buzzer is not set up on this server yet.'], 503);
        }
        throw $e;
    }
}

function route_room_request(PDO $pdo): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $action = $_GET['action'] ?? '';
    $routes = [
        'lobby' => ['GET', 'room_lobby'],
        'state' => ['GET', 'room_poll'],
        'create' => ['POST', 'room_create'],
        'claim' => ['POST', 'room_claim'],
        'push' => ['POST', 'room_push'],
        'release' => ['POST', 'room_release'],
        'join' => ['POST', 'room_join'],
    ];
    if (!is_string($action) || !isset($routes[$action])) {
        bad_request('action must be one of: ' . implode(', ', array_keys($routes)));
    }
    [$allowed, $handler] = $routes[$action];
    if ($method !== $allowed) {
        method_not_allowed([$allowed]);
    }
    if ($method === 'POST') {
        $length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
        if ($length > ROOM_BODY_MAX) {
            json_response(['error' => 'Request body is too large'], 413);
        }
        $handler($pdo, read_json_body());
    } else {
        $handler($pdo);
    }
}

// ---------------------------------------------------------------------------
// Rooms, codes and tokens
// ---------------------------------------------------------------------------

/** No cron on shared hosting: every rooms request first deletes the rooms idle for too long (players go with them). */
function delete_idle_rooms(PDO $pdo): void
{
    $pdo->exec('DELETE FROM game_rooms WHERE seen_at < NOW() - INTERVAL ' . ROOM_IDLE_HOURS . ' HOUR');
}

function new_token(): string
{
    return bin2hex(random_bytes(32));
}

function token_hash(string $token): string
{
    return hash('sha256', $token);
}

function is_token($value): bool
{
    return is_string($value) && preg_match('/^[0-9a-f]{64}$/', $value) === 1;
}

function new_room_code(): string
{
    $code = '';
    $last = strlen(ROOM_CODE_ALPHABET) - 1;
    for ($i = 0; $i < ROOM_CODE_LENGTH; $i++) {
        $code .= ROOM_CODE_ALPHABET[random_int(0, $last)];
    }
    return $code;
}

/** A room code from the query or body: trimmed, upper case, 6 characters of the alphabet; 400 otherwise. */
function require_room_code($value): string
{
    $code = is_string($value) ? strtoupper(trim($value)) : '';
    $pattern = '/^[' . ROOM_CODE_ALPHABET . ']{' . ROOM_CODE_LENGTH . '}$/';
    if (!preg_match($pattern, $code)) {
        bad_request('code must be a ' . ROOM_CODE_LENGTH . '-character room code');
    }
    return $code;
}

/** The live room with this code (404 when unknown or idle too long); records the request now and then. */
function find_room(PDO $pdo, string $code): array
{
    $stmt = $pdo->prepare(
        'SELECT id, host_hash, host_session, names, version, TIMESTAMPDIFF(SECOND, seen_at, NOW()) AS idle
           FROM game_rooms
          WHERE code = ? AND seen_at >= NOW() - INTERVAL ' . ROOM_IDLE_HOURS . ' HOUR'
    );
    $stmt->execute([$code]);
    $room = $stmt->fetch();
    if (!$room) {
        not_found('This game has ended or the code is wrong.');
    }
    $room['id'] = (int) $room['id'];
    $room['names'] = (int) $room['names'];
    $room['version'] = (int) $room['version'];
    if ((int) $room['idle'] >= ROOM_TOUCH_SECONDS) {
        $pdo->prepare('UPDATE game_rooms SET seen_at = NOW() WHERE id = ?')->execute([$room['id']]);
    }
    return $room;
}

/** 401 without the host token, 403 with a wrong one. */
function require_host(array $room, $token): void
{
    if ($token === null || $token === '') {
        json_response(['error' => 'The host token is missing.'], 401);
    }
    if (!is_token($token) || !hash_equals($room['host_hash'], token_hash($token))) {
        json_response(['error' => 'Only the host of this game can do that.'], 403);
    }
}

/** A host session id: 32 hex characters made by the host page; 400 otherwise. */
function require_session($value): string
{
    if (!is_string($value) || !preg_match('/^[0-9a-f]{32}$/', $value)) {
        bad_request('session must be the host page session id');
    }
    return $value;
}

/** 409 when another host tab has taken over the room since this one (BUG-52-02). */
function require_current_session(array $room, string $session): void
{
    if ($room['host_session'] !== $session) {
        json_response(['error' => 'This game is open in another tab.', 'other_tab' => true], 409);
    }
}

/** A contestant index of this room (0 .. names - 1); 400 otherwise. */
function require_contestant($value, array $room): int
{
    $index = parse_int($value);
    if ($index === null || $index < 0 || $index >= $room['names']) {
        bad_request('contestant must be a whole number from 0 to ' . ($room['names'] - 1));
    }
    return $index;
}

/** The version just stored by an UPDATE that set version = LAST_INSERT_ID(version + 1) on this connection. */
function stored_version(PDO $pdo): int
{
    return (int) $pdo->query('SELECT LAST_INSERT_ID()')->fetchColumn();
}

function bump_version(PDO $pdo, int $roomId): int
{
    $pdo->prepare('UPDATE game_rooms SET version = LAST_INSERT_ID(version + 1), seen_at = NOW() WHERE id = ?')->execute([$roomId]);
    return stored_version($pdo);
}

/** [contestant index => true] for the names claimed by a phone. */
function joined_indexes(PDO $pdo, int $roomId): array
{
    $stmt = $pdo->prepare('SELECT contestant FROM room_players WHERE room_id = ?');
    $stmt->execute([$roomId]);
    $joined = [];
    foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $index) {
        $joined[(int) $index] = true;
    }
    return $joined;
}

/** The stored state (decoded) and the name list with the joined flags. */
function room_view(PDO $pdo, array $room): array
{
    $stmt = $pdo->prepare('SELECT state FROM game_rooms WHERE id = ?');
    $stmt->execute([$room['id']]);
    $state = json_decode((string) $stmt->fetchColumn(), true);
    $joined = joined_indexes($pdo, $room['id']);
    $players = [];
    foreach ($state['contestants'] as $i => $c) {
        $players[] = ['name' => $c['name'], 'color' => $c['color'], 'joined' => isset($joined[$i])];
    }
    return [$state, $players];
}

// ---------------------------------------------------------------------------
// Host calls
// ---------------------------------------------------------------------------

function room_create(PDO $pdo, array $body): void
{
    $state = room_state($body['state'] ?? null, null);
    $session = require_session($body['session'] ?? null);
    $names = count($state['contestants']);
    $json = encode_state($state);
    $token = new_token();
    $insert = $pdo->prepare('INSERT INTO game_rooms (code, host_hash, host_session, names, state) VALUES (?, ?, ?, ?, ?)');
    for ($attempt = 0; $attempt < 5; $attempt++) {
        $code = new_room_code();
        try {
            $insert->execute([$code, token_hash($token), $session, $names, $json]);
            json_response(['code' => $code, 'host_token' => $token, 'version' => 1], 201);
        } catch (PDOException $e) {
            if (!is_duplicate_key($e)) {
                throw $e;
            }
            // that code is in use: draw another one
        }
    }
    json_response(['error' => 'Could not make a free room code. Please try again.'], 503);
}

/** This host tab takes over the room (a host page that loaded a saved Phone buzzer game, or "Use this tab"). */
function room_claim(PDO $pdo, array $body): void
{
    $room = find_room($pdo, require_room_code($body['code'] ?? null));
    require_host($room, $body['host_token'] ?? null);
    $session = require_session($body['session'] ?? null);
    $pdo->prepare('UPDATE game_rooms SET host_session = ?, seen_at = NOW() WHERE id = ?')->execute([$session, $room['id']]);
    json_response(['version' => $room['version']]);
}

function room_push(PDO $pdo, array $body): void
{
    $room = find_room($pdo, require_room_code($body['code'] ?? null));
    require_host($room, $body['host_token'] ?? null);
    $session = require_session($body['session'] ?? null);
    require_current_session($room, $session);
    $state = room_state($body['state'] ?? null, $room['names']);
    // The session is checked again in the UPDATE, so a claim between the SELECT and here still wins.
    $update = $pdo->prepare(
        'UPDATE game_rooms SET state = ?, version = LAST_INSERT_ID(version + 1), seen_at = NOW()
          WHERE id = ? AND host_session = ?'
    );
    $update->execute([encode_state($state), $room['id'], $session]);
    if ($update->rowCount() === 0) {
        json_response(['error' => 'This game is open in another tab.', 'other_tab' => true], 409);
    }
    json_response(['version' => stored_version($pdo)]);
}

function room_release(PDO $pdo, array $body): void
{
    $room = find_room($pdo, require_room_code($body['code'] ?? null));
    require_host($room, $body['host_token'] ?? null);
    require_current_session($room, require_session($body['session'] ?? null));
    $index = require_contestant($body['contestant'] ?? null, $room);
    $delete = $pdo->prepare('DELETE FROM room_players WHERE room_id = ? AND contestant = ?');
    $delete->execute([$room['id'], $index]);
    $released = $delete->rowCount() > 0;
    $version = $released ? bump_version($pdo, $room['id']) : $room['version'];
    json_response(['released' => $released, 'version' => $version]);
}

// ---------------------------------------------------------------------------
// Player calls
// ---------------------------------------------------------------------------

function room_lobby(PDO $pdo): void
{
    $room = find_room($pdo, require_room_code($_GET['code'] ?? null));
    [$state, $players] = room_view($pdo, $room);
    $reply = ['version' => $room['version'], 'mode' => $state['mode'], 'players' => $players];
    $session = $_GET['session'] ?? null; // the host's poll: has another tab taken over?
    if (is_string($session) && preg_match('/^[0-9a-f]{32}$/', $session)) {
        $reply['other_tab'] = $room['host_session'] !== $session;
    }
    json_response($reply);
}

function room_join(PDO $pdo, array $body): void
{
    $room = find_room($pdo, require_room_code($body['code'] ?? null));
    $index = require_contestant($body['contestant'] ?? null, $room);
    $token = $body['device_token'] ?? null;
    if ($token !== null && !is_token($token)) {
        bad_request('device_token must be the token this phone was given');
    }
    $token = $token ?? new_token();
    $hash = token_hash($token);

    $pdo->beginTransaction();
    try {
        $mine = $pdo->prepare('SELECT contestant FROM room_players WHERE room_id = ? AND device_hash = ?');
        $mine->execute([$room['id'], $hash]);
        $held = $mine->fetchColumn();
        if ($held !== false && (int) $held === $index) { // a rejoin: same phone, same name
            $pdo->commit();
            json_response(['device_token' => $token, 'you' => $index, 'version' => $room['version']]);
        }
        if ($held !== false) { // one name per phone: picking another one gives up the first
            $pdo->prepare('DELETE FROM room_players WHERE room_id = ? AND device_hash = ?')->execute([$room['id'], $hash]);
        }
        $pdo->prepare('INSERT INTO room_players (room_id, contestant, device_hash) VALUES (?, ?, ?)')
            ->execute([$room['id'], $index, $hash]);
        $version = bump_version($pdo, $room['id']);
        $pdo->commit();
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        if (is_duplicate_key($e)) {
            conflict('This name is already taken on another phone.');
        }
        throw $e;
    }
    json_response(['device_token' => $token, 'you' => $index, 'version' => $version]);
}

/** The phone's poll: the board when it changed since `since`, a small "no change" reply otherwise. */
function room_poll(PDO $pdo): void
{
    $room = find_room($pdo, require_room_code($_GET['code'] ?? null));
    $token = $_SERVER['HTTP_X_DEVICE_TOKEN'] ?? '';
    if ($token === '') {
        json_response(['error' => 'Pick your name first.'], 401);
    }
    $you = false;
    if (is_token($token)) {
        $stmt = $pdo->prepare('SELECT contestant FROM room_players WHERE room_id = ? AND device_hash = ?');
        $stmt->execute([$room['id'], token_hash($token)]);
        $you = $stmt->fetchColumn();
    }
    if ($you === false) { // released by the host, or claimed by another phone since
        json_response(['error' => 'This phone is no longer joined to the game. Pick your name again.'], 403);
    }
    $since = parse_int($_GET['since'] ?? null);
    if ($since !== null && $since === $room['version']) {
        json_response(['changed' => false, 'version' => $room['version']]);
    }
    [$state, $players] = room_view($pdo, $room);
    json_response([
        'changed' => true,
        'version' => $room['version'],
        'you' => (int) $you,
        'players' => $players,
        'state' => $state,
    ]);
}

// ---------------------------------------------------------------------------
// The phone state (D-80 p): rebuilt from known fields only
// ---------------------------------------------------------------------------

function encode_state(array $state): string
{
    $json = json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || strlen($json) > ROOM_STATE_MAX) {
        bad_request('state is too large');
    }
    return $json;
}

/**
 * Check the host's board for the phones and keep only what they may see. $names: the room's number
 * of contestants (a push may not change it), or null on create.
 */
function room_state($input, ?int $names): array
{
    if (!is_array($input) || array_is_list_safe($input)) {
        bad_request('state must be an object');
    }
    $mode = $input['mode'] ?? null;
    if (!is_string($mode) || !isset(ROOM_MODES[$mode])) {
        bad_request('state.mode must be players or teams');
    }
    $screen = $input['screen'] ?? null;
    if (!is_string($screen) || !in_array($screen, ROOM_SCREENS, true)) {
        bad_request('state.screen must be one of: ' . implode(', ', ROOM_SCREENS));
    }
    $contestants = state_contestants($input['contestants'] ?? null, ROOM_MODES[$mode]);
    if ($names !== null && count($contestants) !== $names) {
        bad_request('state.contestants must keep the ' . $names . ' names of this game');
    }
    $points = state_points($input['points'] ?? null);
    $categories = state_categories($input['categories'] ?? null);
    $cells = state_cells($input['cells'] ?? null, count($points), $categories, count($contestants));
    return [
        'mode' => $mode,
        'screen' => $screen,
        'contestants' => $contestants,
        'points' => $points,
        'categories' => $categories,
        'cells' => $cells,
    ];
}

/** True for a JSON array (a list); state objects must not be lists. */
function array_is_list_safe(array $value): bool
{
    return $value === [] || array_keys($value) === range(0, count($value) - 1);
}

function state_list($value, string $label, int $min, int $max): array
{
    if (!is_array($value) || !array_is_list_safe($value) || count($value) < $min || count($value) > $max) {
        bad_request("$label must be a list of $min to $max items");
    }
    return $value;
}

function state_object($value, string $label): array
{
    if (!is_array($value) || ($value !== [] && array_is_list_safe($value))) {
        bad_request("$label must be an object");
    }
    return $value;
}

/** Text of at most $max characters with no control characters; null allowed when $nullable. */
function state_text($value, string $label, int $max, bool $nullable)
{
    if ($value === null && $nullable) {
        return null;
    }
    if (!is_string($value) || trim($value) === '' || text_length($value) > $max || preg_match('/[\x00-\x1F\x7F]/u', $value) !== 0) {
        bad_request("$label must be text of 1 to $max characters");
    }
    return $value;
}

function state_bool($value, string $label): bool
{
    if (!is_bool($value)) {
        bad_request("$label must be true or false");
    }
    return $value;
}

function state_contestants($value, int $limit): array
{
    $list = state_list($value, 'state.contestants', 1, $limit);
    $out = [];
    foreach ($list as $i => $c) {
        $c = state_object($c, "state.contestants[$i]");
        $color = $c['color'] ?? null;
        if (!is_string($color) || !preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
            bad_request("state.contestants[$i].color must be a colour like #e5484d");
        }
        $score = $c['score'] ?? null;
        if (!is_int($score) || abs($score) > ROOM_SCORE_MAX) {
            bad_request("state.contestants[$i].score must be a whole number");
        }
        $out[] = [
            'name' => state_text($c['name'] ?? null, "state.contestants[$i].name", ROOM_NAME_MAX, false),
            'color' => strtolower($color),
            'score' => $score,
        ];
    }
    return $out;
}

function state_points($value): array
{
    $list = state_list($value, 'state.points', 1, ROOM_MAX_POINTS);
    foreach ($list as $i => $p) {
        if (!is_int($p) || $p < 1 || $p > ROOM_SCORE_MAX || ($i > 0 && $p <= $list[$i - 1])) {
            bad_request('state.points must be positive whole numbers in ascending order');
        }
    }
    return $list;
}

/** Columns: an unopened "Surprise me!" column (hidden) has no name; Kilo Meshakkal (mix) is named by the phone. */
function state_categories($value): array
{
    $list = state_list($value, 'state.categories', 1, ROOM_MAX_CATEGORIES);
    $out = [];
    foreach ($list as $i => $c) {
        $c = state_object($c, "state.categories[$i]");
        $hidden = state_bool($c['hidden'] ?? false, "state.categories[$i].hidden");
        $mix = state_bool($c['mix'] ?? false, "state.categories[$i].mix");
        $named = !$hidden && !$mix;
        $out[] = [
            'name' => $named ? state_text($c['name'] ?? null, "state.categories[$i].name", ROOM_LABEL_MAX, false) : null,
            'nameAr' => $named ? state_text($c['nameAr'] ?? null, "state.categories[$i].nameAr", ROOM_LABEL_MAX, true) : null,
            'hidden' => $hidden,
            'mix' => $mix,
        ];
    }
    return $out;
}

/**
 * The board, row by row (one cell per column). An unused Kilo Meshakkal box keeps its emoji and loses
 * its value; the double-score mark is kept only on a used or open cell; owner and Swap only on a used one.
 */
function state_cells($value, int $rows, array $categories, int $contestants): array
{
    $grid = state_list($value, 'state.cells', $rows, $rows);
    $out = [];
    foreach ($grid as $r => $row) {
        $row = state_list($row, "state.cells[$r]", count($categories), count($categories));
        $outRow = [];
        foreach ($row as $col => $cell) {
            $label = "state.cells[$r][$col]";
            $cell = state_object($cell, $label);
            $used = state_bool($cell['used'] ?? false, "$label.used");
            $open = !$used && state_bool($cell['open'] ?? false, "$label.open");
            $mix = $categories[$col]['mix'];
            $p = $cell['p'] ?? null;
            if (!$mix || $used) {
                if (!is_int($p) || $p < 1 || $p > ROOM_SCORE_MAX) {
                    bad_request("$label.p must be the cell's points");
                }
            } else {
                $p = null; // US-53: an unused Kilo Meshakkal box never tells its value
            }
            $face = $mix && !$used ? state_text($cell['face'] ?? null, "$label.face", ROOM_FACE_MAX, false) : null;
            $owner = null;
            if ($used && ($cell['owner'] ?? null) !== null) {
                $owner = $cell['owner'];
                if (!is_int($owner) || $owner < 0 || $owner >= $contestants) {
                    bad_request("$label.owner must be a contestant index or null");
                }
            }
            $swap = null;
            if ($used && ($cell['swap'] ?? null) !== null) {
                $s = state_object($cell['swap'], "$label.swap");
                $swapPoints = $s['points'] ?? null;
                if (!is_int($swapPoints) || $swapPoints < 1 || $swapPoints > ROOM_SCORE_MAX) {
                    bad_request("$label.swap.points must be positive");
                }
                $swap = [
                    'name' => state_text($s['name'] ?? null, "$label.swap.name", ROOM_LABEL_MAX, false),
                    'nameAr' => state_text($s['nameAr'] ?? null, "$label.swap.nameAr", ROOM_LABEL_MAX, true),
                    'points' => $swapPoints,
                ];
            }
            $x2 = ($used || $open) && state_bool($cell['x2'] ?? false, "$label.x2"); // D-40: hidden until opened
            $outRow[] = ['p' => $p, 'face' => $face, 'used' => $used, 'open' => $open, 'owner' => $owner, 'x2' => $x2, 'swap' => $swap];
        }
        $out[] = $outRow;
    }
    return $out;
}

rooms_main();

<?php
// Phone buzzer rooms (US-52, D-80): players join the host's game from their own phones and follow
// the board live. Hostinger has no WebSockets and no cron, so phones poll about once a second.
//
// Host calls (the host token from `create` is the only key; it is never sent to phones):
//   POST /api/rooms.php?action=create   body { state, session }                -> 201 { code, host_token, version, helpers }
//        helpers = the Admin switch for phone helpers, read now for the whole game (US-66)
//   POST /api/rooms.php?action=claim    body { code, host_token, session }              -> 200 { version }
//   POST /api/rooms.php?action=push     body { code, host_token, session, state }       -> 200 { version }
//   POST /api/rooms.php?action=release  body { code, host_token, session, contestant }  -> 200 { released, version }
//   POST /api/rooms.php?action=open_question   body { code, host_token, session, question, hint? }
//        -> 200 { seq, version, doubles } (hint = { en, ar } patterns such as "P _ _ _ _", never the answer;
//        doubles = the contestants whose armed ×2 now applies to this question, US-66)
//   POST /api/rooms.php?action=update_question body { code, host_token, session, seq, question } -> 200 { version }
//   POST /api/rooms.php?action=close_question  body { code, host_token, session, seq }         -> 200 { closed, version }
//   GET  /api/rooms.php?action=answers&code=&seq=&session=  header X-Host-Token
//        -> 200 { seq, open, answers: [{ contestant, text, ms }], helpers: [{ contestant, kind, target }] }
//        answers in arrival order (ms since the question opened); helpers = the uses on that question (US-66)
//   POST /api/rooms.php?action=start_bets  body { code, host_token, session, bet: { round, catName, catNameAr, scores } }
//        -> 200 { seq, version } (US-65: a Golden Goal bet round; the same open round again gives its seq back)
//   GET  /api/rooms.php?action=bets_status&code=&seq=&session=  header X-Host-Token
//        -> 200 { seq, open, revealed, count, players: [{ bet, joined }] }: who has bet, never an amount
//   POST /api/rooms.php?action=close_bets  body { code, host_token, session, seq }  -> 200 { closed, version, bets }
//        bets[i] = true when contestant i has bet (the final list once closed; never an amount)
//   POST /api/rooms.php?action=reveal_bets body { code, host_token, session, seq }  -> 200 { seq, amounts }
//        amounts[i] = contestant i's bet, or null when they did not bet (closes the round first)
//   POST /api/rooms.php?action=close  body { code, host_token, session }  -> 200 { closed: true } (New Game)
//   push, release, the question and bet calls and close from a host session that is not the room's
//   current one -> 409 { error, other_tab: true }
// Player calls (the room code is public: it is in the link and the QR code):
//   GET  /api/rooms.php?action=lobby&code=ABC234[&session=<host session>]
//        -> 200 { version, mode, players[, other_tab, helpers] }; helpers (the current host tab only, US-66):
//        null when they are off, else every use in the game [{ contestant, kind, seq, target }]
//   POST /api/rooms.php?action=join     body { code, contestant, device_token? } -> 200 { device_token, you, version }
//   POST /api/rooms.php?action=answer   body { code, device_token, seq, text }      -> 201 { seq, text }
//        409 { reason: 'duplicate' } for a second answer, 409 { reason: 'late' } once that question is closed,
//        409 { reason: 'frozen', remaining_ms } while a Freeze on this contestant runs (US-66)
//   POST /api/rooms.php?action=helper   body { code, device_token, kind, seq?, target? } -> 201 { kind, seq, target, until_ms, now }
//        US-66 (D-81): kind freeze (seq, target), hint (seq) or double (armed for the next question). 400 for
//        bad input; 409 { reason } for a rule break: off, used, goal, closed, open, sent, nohint, self,
//        not_in_room, target_sent, already_frozen, immune
//   POST /api/rooms.php?action=bet      body { code, device_token, seq, amount }    -> 201 { seq, amount }
//        400 outside 0 .. this contestant's limit; 409 { reason: 'duplicate' } for a second bet,
//        409 { reason: 'closed' } once the round is closed
//   GET  /api/rooms.php?action=state&code=ABC234&since=<version>  header X-Device-Token
//        -> 200 { changed: false, version, now } when nothing changed since that version,
//           else { changed: true, version, now, you, players, state, question, mine, bet }
//        question = the open (or last closed) question as the phones may see it, or null; mine = this
//        contestant's answer to it, or null; now = server time in ms (phones work out the countdown).
//        bet = the last Golden Goal bet round for this contestant only (category, own score, own limit,
//        own bet or null), or null: never another contestant's amount (US-65).
//        helpers = null when off, else { left: { freeze, hint, double }, double: null | 'armed' | 'on',
//        frozen: null | { by, untilMs }, hint: null | { en, ar }, targets: [index] } for this contestant (US-66)
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
// - Questions (US-64): the host opens a question (a new seq), may update it (pause, resume, reset)
//   and closes it (timer 0, answer shown, Back). The question payload is
//   rebuilt from known fields only (room_question()): never the answer, never the picture path (a
//   picture's file name can name the answer: hasImage only). One answer per contestant per seq, accepted
//   only while that seq is open (one atomic INSERT ... SELECT), stamped with server time in ms.
// - Phone helpers (US-66, D-81; ABC, Swap and ½ are Host control only): ❄ Freeze, 💡 Hint and ×2, each
//   once per contestant per game (the room_helpers key), only when the room was made with the Admin
//   switch on. A helper call locks the room row (SELECT ... FOR UPDATE), so it is checked against the
//   open question, other helpers and open_question one at a time. A Freeze runs on server time (Pause does
//   not stop it) and ends with its question. The hint patterns come from the host (q_hint, never in the
//   question JSON) and reach only the phone that used 💡. Every use bumps the version, so the phones see it.
// - Golden Goal bets (US-65, D-80 h, j, k): the host opens a bet round (b_seq) with the category and
//   the scores; the server works out each limit (D-48: score or the largest point value of the board,
//   whichever is higher) and accepts one whole-number bet per contestant while the round is open (one
//   atomic INSERT ... SELECT). The host sees who has bet (bets_status), never the amounts, until it
//   asks for them with reveal_bets after marking. A missing bet counts as 0 on the host (D-80 k).
//   A bet does not bump the version: the phone that sent it knows, and a refresh gets its own amount.
// - Tokens are 64 hex characters from random_bytes(); only their SHA-256 hashes are stored.
// - Rooms with no request for ROOM_IDLE_HOURS are deleted on the next rooms request (no cron).
// - A missing token gives 401, a wrong one 403, an unknown or expired room 404, bad input 400.
//   A database without the tables or columns (sql/migrate-add-rooms.sql not run) gives 503.
require_once __DIR__ . '/db.php';

const ROOM_IDLE_HOURS = 6;
const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0 or 1: easy to read out and type
const ROOM_TOUCH_SECONDS = 60;     // a poll records the room's last request at most this often
const ROOM_BODY_MAX = 262144;      // bytes of a request body
const ROOM_STATE_MAX = 131072;     // bytes of the stored state (a 10 x 20 board with long names is far below)
const ROOM_MODES = ['players' => 6, 'teams' => 4]; // D-80 b: Players and Teams only, with their limits
const ROOM_SCREENS = ['board', 'question', 'final', 'results'];
const ROOM_GOAL_STAGES = ['offer', 'bets', 'question']; // US-65: where Golden Goal is, for the phones
const ROOM_MAX_POINTS = 50;        // board rows (any number of enabled point values; far above a real board)
const ROOM_MAX_CATEGORIES = 20;    // board columns
const ROOM_NAME_MAX = 30;          // contestant names (NAME_MAX in js/game.js)
const ROOM_LABEL_MAX = 100;        // category names: VARCHAR(100) name and name_ar in categories
const ROOM_FACE_MAX = 8;           // characters of a Kilo Meshakkal emoji
const ROOM_SCORE_MAX = 1000000000;
const ROOM_TEXT_MAX = 2000;        // question text (the questions are far shorter)
const ROOM_ANSWER_MAX = 200;       // a typed answer (VARCHAR(200) in room_answers)
const ROOM_TIMER_MAX_MS = 600000;  // the timer input allows 5 to 600 seconds
const ROOM_HELPER_KINDS = ['freeze', 'hint', 'double']; // US-66 (D-81): the phone-only helpers
const ROOM_FREEZE_NO_TIMER_S = 10; // a Freeze on a question without a timer (the game has none today)
const ROOM_HINT_MAX = 600;         // characters of a hint pattern (an answer of 255 characters gives 509)
const ROOM_HINT_PATTERN = '/^[^\s_\x00-\x1F\x7F](?: [_ ])*$/u'; // "P _ _ _ _": one character, then only _ and gaps

/** Run the request; a database without the room tables gives a clear 503. */
function rooms_main(): void
{
    try {
        $pdo = db();
        delete_idle_rooms($pdo);
        route_room_request($pdo);
    } catch (PDOException $e) {
        // A missing table, or a missing column of a later phone sprint (42S22): the migration has not run.
        if (is_missing_table($e) || ($e->getCode() === '42S22' && (int) ($e->errorInfo[1] ?? 0) === 1054)) {
            error_log('BrainRush API: the room tables are missing or out of date (run sql/migrate-add-rooms.sql).');
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
        'open_question' => ['POST', 'room_open_question'],
        'update_question' => ['POST', 'room_update_question'],
        'close_question' => ['POST', 'room_close_question'],
        'answers' => ['GET', 'room_answers'],
        'answer' => ['POST', 'room_answer'],
        'start_bets' => ['POST', 'room_start_bets'],
        'bets_status' => ['GET', 'room_bets_status'],
        'close_bets' => ['POST', 'room_close_bets'],
        'reveal_bets' => ['POST', 'room_reveal_bets'],
        'bet' => ['POST', 'room_bet'],
        'helper' => ['POST', 'room_helper'],
        'close' => ['POST', 'room_close'],
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

/** Server time in milliseconds: the one clock for opening, answers and the phones' countdown. */
function now_ms(): int
{
    return (int) floor(microtime(true) * 1000);
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
        'SELECT id, host_hash, host_session, names, version, q_seq, q_open, q_opened_ms, b_seq, b_open, b_revealed, helpers,
                TIMESTAMPDIFF(SECOND, seen_at, NOW()) AS idle
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
    $room['q_seq'] = (int) $room['q_seq'];
    $room['q_open'] = (int) $room['q_open'] === 1;
    $room['q_opened_ms'] = (int) $room['q_opened_ms'];
    $room['b_seq'] = (int) $room['b_seq'];
    $room['b_open'] = (int) $room['b_open'] === 1;
    $room['b_revealed'] = (int) $room['b_revealed'] === 1;
    $room['helpers'] = (int) $room['helpers'] === 1;
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
    $helpers = phone_helpers_setting($pdo);
    $insert = $pdo->prepare('INSERT INTO game_rooms (code, host_hash, host_session, names, state, helpers) VALUES (?, ?, ?, ?, ?, ?)');
    for ($attempt = 0; $attempt < 5; $attempt++) {
        $code = new_room_code();
        try {
            $insert->execute([$code, token_hash($token), $session, $names, $json, $helpers ? 1 : 0]);
            json_response(['code' => $code, 'host_token' => $token, 'version' => 1, 'helpers' => $helpers], 201);
        } catch (PDOException $e) {
            if (!is_duplicate_key($e)) {
                throw $e;
            }
            // that code is in use: draw another one
        }
    }
    json_response(['error' => 'Could not make a free room code. Please try again.'], 503);
}

/**
 * US-66: helpers in this Phone buzzer game, read once when its room is made. The same rule as the host's
 * helpersOff: helpers_enabled on (a missing row is on) and phone_helpers_enabled on (a missing row is off).
 */
function phone_helpers_setting(PDO $pdo): bool
{
    $stmt = $pdo->query("SELECT name, value FROM settings WHERE name IN ('helpers_enabled', 'phone_helpers_enabled')");
    $values = [];
    foreach ($stmt->fetchAll() as $row) {
        $values[$row['name']] = (int) $row['value'];
    }
    return ($values['helpers_enabled'] ?? 1) !== 0 && ($values['phone_helpers_enabled'] ?? 0) === 1;
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
        if (!$reply['other_tab']) { // US-66: the host's scoreboard (used, left and armed helpers)
            $reply['helpers'] = $room['helpers'] ? helper_rows($pdo, $room['id'], null) : null;
        }
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
        json_response(['changed' => false, 'version' => $room['version'], 'now' => now_ms()]);
    }
    [$state, $players] = room_view($pdo, $room);
    [$question, $mine] = room_question_view($pdo, $room, (int) $you);
    $now = now_ms();
    json_response([
        'changed' => true,
        'version' => $room['version'],
        'now' => $now,
        'you' => (int) $you,
        'players' => $players,
        'state' => $state,
        'question' => $question,
        'mine' => $mine,
        'bet' => room_bet_view($pdo, $room, (int) $you),
        'helpers' => room_helper_view($pdo, $room, (int) $you, $question, $now),
    ]);
}

// ---------------------------------------------------------------------------
// Questions and answers (US-64)
// ---------------------------------------------------------------------------

/** The host's checks for the question calls: the room, the host token and the current host tab. */
function require_question_host(PDO $pdo, array $body): array
{
    $room = find_room($pdo, require_room_code($body['code'] ?? null));
    require_host($room, $body['host_token'] ?? null);
    require_current_session($room, require_session($body['session'] ?? null));
    return $room;
}

/** The question the phones see (or null) and this contestant's answer to it (or null). */
function room_question_view(PDO $pdo, array $room, int $contestant): array
{
    if ($room['q_seq'] === 0) {
        return [null, null];
    }
    $stmt = $pdo->prepare('SELECT question FROM game_rooms WHERE id = ?');
    $stmt->execute([$room['id']]);
    $question = json_decode((string) $stmt->fetchColumn(), true);
    if (!is_array($question)) {
        return [null, null];
    }
    $question['seq'] = $room['q_seq'];
    $question['open'] = $room['q_open'];
    $mine = $pdo->prepare('SELECT text FROM room_answers WHERE room_id = ? AND seq = ? AND contestant = ?');
    $mine->execute([$room['id'], $room['q_seq'], $contestant]);
    $text = $mine->fetchColumn();
    return [$question, $text === false ? null : (string) $text];
}

/**
 * A new question number: the earlier one is closed by it, its late answers are refused. US-66: the hint
 * patterns are kept beside it (q_hint), and every armed ×2 now applies to it (Golden Goal: spent, seq 0).
 */
function room_open_question(PDO $pdo, array $body): void
{
    $room = require_question_host($pdo, $body);
    $now = now_ms();
    $question = room_question($body['question'] ?? null, $now);
    $hint = $question['goal'] ? null : hint_patterns($body['hint'] ?? null);
    $pdo->beginTransaction();
    try {
        $update = $pdo->prepare(
            'UPDATE game_rooms SET q_seq = LAST_INSERT_ID(q_seq + 1), q_open = 1, q_opened_ms = ?, question = ?, q_hint = ?,
                    version = version + 1, seen_at = NOW()
              WHERE id = ? AND host_session = ?'
        );
        $update->execute([$now, encode_question($question), $hint, $room['id'], $body['session']]);
        if ($update->rowCount() === 0) {
            $pdo->rollBack();
            json_response(['error' => 'This game is open in another tab.', 'other_tab' => true], 409);
        }
        $seq = stored_version($pdo);
        $doubles = bind_doubles($pdo, $room['id'], $question['goal'] ? 0 : $seq);
        $pdo->commit();
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
    json_response(['seq' => $seq, 'version' => current_version($pdo, $room['id']), 'doubles' => $doubles]);
}

/** US-66: every armed ×2 applies to question $seq (0: spent by Golden Goal); returns the contestants on it. */
function bind_doubles(PDO $pdo, int $roomId, int $seq): array
{
    $pdo->prepare("UPDATE room_helpers SET seq = ? WHERE room_id = ? AND kind = 'double' AND seq IS NULL")
        ->execute([$seq, $roomId]);
    if ($seq === 0) {
        return [];
    }
    $stmt = $pdo->prepare("SELECT contestant FROM room_helpers WHERE room_id = ? AND kind = 'double' AND seq = ? ORDER BY contestant");
    $stmt->execute([$roomId, $seq]);
    return array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
}

/**
 * US-66: the host's hint patterns { en, ar } as stored JSON, or null. Each is null or "P _ _ _ _": one
 * character, then only "_" and gaps, so the server never holds more than the first character of an answer.
 */
function hint_patterns($input): ?string
{
    if ($input === null) {
        return null;
    }
    $hint = state_object($input, 'hint');
    $out = [];
    foreach (['en', 'ar'] as $lang) {
        $value = $hint[$lang] ?? null;
        if ($value !== null && (!is_string($value) || text_length($value) > ROOM_HINT_MAX || !preg_match(ROOM_HINT_PATTERN, $value))) {
            bad_request("hint.$lang must be a pattern such as \"P _ _ _ _\"");
        }
        $out[$lang] = $value;
    }
    return $out['en'] === null && $out['ar'] === null ? null : json_encode($out, JSON_UNESCAPED_UNICODE);
}

/** Pause, resume or reset on the open question: same seq, its answers, helpers and hint stay. */
function room_update_question(PDO $pdo, array $body): void
{
    $room = require_question_host($pdo, $body);
    $seq = parse_int($body['seq'] ?? null);
    if ($seq === null || $seq !== $room['q_seq'] || !$room['q_open']) {
        conflict('That question is closed.');
    }
    $question = room_question($body['question'] ?? null, now_ms());
    $update = $pdo->prepare(
        'UPDATE game_rooms SET question = ?, version = LAST_INSERT_ID(version + 1), seen_at = NOW()
          WHERE id = ? AND host_session = ? AND q_seq = ? AND q_open = 1'
    );
    $update->execute([encode_question($question), $room['id'], $body['session'], $seq]);
    if ($update->rowCount() === 0) {
        conflict('That question is closed.');
    }
    json_response(['version' => stored_version($pdo)]);
}

function room_close_question(PDO $pdo, array $body): void
{
    $room = require_question_host($pdo, $body);
    $seq = parse_int($body['seq'] ?? null);
    if ($seq === null || $seq < 1) {
        bad_request('seq must be the question number');
    }
    $update = $pdo->prepare(
        'UPDATE game_rooms SET q_open = 0, version = LAST_INSERT_ID(version + 1), seen_at = NOW()
          WHERE id = ? AND q_seq = ? AND q_open = 1'
    );
    $update->execute([$room['id'], $seq]);
    $closed = $update->rowCount() > 0;
    json_response(['closed' => $closed, 'version' => $closed ? stored_version($pdo) : $room['version']]);
}

/** The host's poll of one question's answers, in arrival order (server time). */
function room_answers(PDO $pdo): void
{
    $room = find_room($pdo, require_room_code($_GET['code'] ?? null));
    require_host($room, $_SERVER['HTTP_X_HOST_TOKEN'] ?? null);
    require_current_session($room, require_session($_GET['session'] ?? null));
    $seq = parse_int($_GET['seq'] ?? null);
    if ($seq === null || $seq < 1) {
        bad_request('seq must be the question number');
    }
    $stmt = $pdo->prepare(
        'SELECT contestant, text, received_ms FROM room_answers WHERE room_id = ? AND seq = ?
          ORDER BY received_ms, contestant'
    );
    $stmt->execute([$room['id'], $seq]);
    $answers = [];
    foreach ($stmt->fetchAll() as $row) {
        $answers[] = [
            'contestant' => (int) $row['contestant'],
            'text' => $row['text'],
            'ms' => $seq === $room['q_seq'] ? max(0, (int) $row['received_ms'] - $room['q_opened_ms']) : null,
        ];
    }
    $helpers = [];
    if ($room['helpers']) { // US-66: the tags of the Answers panel, in the same reply
        foreach (helper_rows($pdo, $room['id'], $seq) as $row) {
            $helpers[] = ['contestant' => $row['contestant'], 'kind' => $row['kind'], 'target' => $row['target']];
        }
    }
    json_response([
        'seq' => $seq,
        'open' => $seq === $room['q_seq'] && $room['q_open'],
        'answers' => $answers,
        'helpers' => $helpers,
    ]);
}

/** A phone's answer: once per contestant per question, only while that question is open. */
function room_answer(PDO $pdo, array $body): void
{
    $room = find_room($pdo, require_room_code($body['code'] ?? null));
    $token = $body['device_token'] ?? null;
    if (!is_token($token)) {
        json_response(['error' => 'Pick your name first.'], 401);
    }
    $stmt = $pdo->prepare('SELECT contestant FROM room_players WHERE room_id = ? AND device_hash = ?');
    $stmt->execute([$room['id'], token_hash($token)]);
    $you = $stmt->fetchColumn();
    if ($you === false) {
        json_response(['error' => 'This phone is no longer joined to the game. Pick your name again.'], 403);
    }
    $seq = parse_int($body['seq'] ?? null);
    if ($seq === null || $seq < 1) {
        bad_request('seq must be the question number');
    }
    $text = answer_text($body['text'] ?? null);
    $now = now_ms();
    refuse_if_frozen($pdo, $room['id'], $seq, (int) $you, $now);
    // Atomic: the row goes in only while this seq is the open question and no Freeze (US-66) holds this
    // contestant, so a close or a Freeze always wins.
    $insert = $pdo->prepare(
        "INSERT INTO room_answers (room_id, seq, contestant, text, received_ms)
         SELECT id, ?, ?, ?, ? FROM game_rooms WHERE id = ? AND q_seq = ? AND q_open = 1
            AND NOT EXISTS (SELECT 1 FROM room_helpers
                             WHERE room_id = ? AND kind = 'freeze' AND seq = ? AND target = ? AND until_ms > ?)"
    );
    try {
        $insert->execute([$seq, (int) $you, $text, $now, $room['id'], $seq, $room['id'], $seq, (int) $you, $now]);
    } catch (PDOException $e) {
        if (is_duplicate_key($e)) {
            json_response(['error' => 'You already sent an answer to this question.', 'reason' => 'duplicate'], 409);
        }
        throw $e;
    }
    if ($insert->rowCount() === 0) {
        refuse_if_frozen($pdo, $room['id'], $seq, (int) $you, $now); // a Freeze that came in meanwhile
        json_response(['error' => 'Too late: the question is closed.', 'reason' => 'late'], 409);
    }
    json_response(['seq' => $seq, 'text' => $text], 201);
}

/** A typed answer: control characters become spaces, trimmed, 1 to 200 characters; 400 otherwise. */
function answer_text($value): string
{
    if (!is_string($value)) {
        bad_request('text must be text');
    }
    $text = trim((string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value));
    if ($text === '') {
        bad_request('Type an answer first.');
    }
    if (text_length($text) > ROOM_ANSWER_MAX) {
        bad_request('An answer can be at most ' . ROOM_ANSWER_MAX . ' characters.');
    }
    return $text;
}

/** Question text may hold line breaks: control characters become spaces, then the usual text check. */
function question_text($value, string $label, int $max, bool $nullable)
{
    if (is_string($value)) {
        $value = trim((string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value));
        if ($value === '' && $nullable) {
            return null;
        }
    }
    return state_text($value, $label, $max, $nullable);
}

function current_version(PDO $pdo, int $roomId): int
{
    $stmt = $pdo->prepare('SELECT version FROM game_rooms WHERE id = ?');
    $stmt->execute([$roomId]);
    return (int) $stmt->fetchColumn();
}

function encode_question(array $question): string
{
    $json = json_encode($question, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || strlen($json) > ROOM_STATE_MAX) {
        bad_request('question is too large');
    }
    return $json;
}

/**
 * The question as the phones may see it, rebuilt from known fields only: never the answer and never the
 * picture's path. $now stamps the countdown (the phones count down from it with their clock offset).
 */
function room_question($input, int $now): array
{
    $q = state_object($input, 'question');
    $mix = state_bool($q['mix'] ?? false, 'question.mix');
    // US-65: the Golden Goal question has no points (each contestant plays for their bet) but its round
    $goal = state_bool($q['goal'] ?? false, 'question.goal');
    $goalRound = $q['goalRound'] ?? null;
    if ($goal && (!is_int($goalRound) || $goalRound < 1 || $goalRound > 1000)) {
        bad_request('question.goalRound must be the Golden Goal round');
    }
    if ($goal && $mix) {
        bad_request('question.mix must be false on the Golden Goal question');
    }
    $points = $q['points'] ?? null;
    if ($goal ? $points !== null : (!is_int($points) || $points < 1 || $points > ROOM_SCORE_MAX)) {
        bad_request($goal ? 'question.points must be null on the Golden Goal question' : 'question.points must be positive');
    }
    $timer = state_object($q['timer'] ?? null, 'question.timer');
    $total = $timer['totalMs'] ?? null;
    $left = $timer['remainingMs'] ?? null;
    if (!is_int($total) || $total < 1000 || $total > ROOM_TIMER_MAX_MS || !is_int($left) || $left < 0 || $left > $total) {
        bad_request('question.timer must have totalMs and remainingMs');
    }
    return [
        'catName' => $mix ? null : state_text($q['catName'] ?? null, 'question.catName', ROOM_LABEL_MAX, false),
        'catNameAr' => $mix ? null : state_text($q['catNameAr'] ?? null, 'question.catNameAr', ROOM_LABEL_MAX, true),
        'mix' => $mix,
        'subName' => $mix ? state_text($q['subName'] ?? null, 'question.subName', ROOM_LABEL_MAX, true) : null,
        'subNameAr' => $mix ? state_text($q['subNameAr'] ?? null, 'question.subNameAr', ROOM_LABEL_MAX, true) : null,
        'points' => $points,
        'goal' => $goal,
        'goalRound' => $goal ? $goalRound : null,
        'x2' => !$goal && state_bool($q['x2'] ?? false, 'question.x2'),
        'text' => question_text($q['text'] ?? null, 'question.text', ROOM_TEXT_MAX, false),
        'textAr' => question_text($q['textAr'] ?? null, 'question.textAr', ROOM_TEXT_MAX, true),
        'hasImage' => state_bool($q['hasImage'] ?? false, 'question.hasImage'),
        'timer' => [
            'totalMs' => $total,
            'remainingMs' => $left,
            'running' => state_bool($timer['running'] ?? false, 'question.timer.running'),
            'atMs' => $now,
        ],
    ];
}

// ---------------------------------------------------------------------------
// Golden Goal bets (US-65, D-80 h, j, k)
// ---------------------------------------------------------------------------

/** The stored bet round (category, round, scores and limits per contestant), or null. */
function room_bet_round(PDO $pdo, array $room): ?array
{
    if ($room['b_seq'] === 0) {
        return null;
    }
    $stmt = $pdo->prepare('SELECT bet FROM game_rooms WHERE id = ?');
    $stmt->execute([$room['id']]);
    $bet = json_decode((string) $stmt->fetchColumn(), true);
    return is_array($bet) && isset($bet['limits'], $bet['scores']) ? $bet : null;
}

/** The bet round as this contestant's phone sees it: their own score, limit and bet only. */
function room_bet_view(PDO $pdo, array $room, int $contestant): ?array
{
    $bet = room_bet_round($pdo, $room);
    if ($bet === null || !isset($bet['limits'][$contestant])) {
        return null;
    }
    $mine = $pdo->prepare('SELECT amount FROM room_bets WHERE room_id = ? AND bet_seq = ? AND contestant = ?');
    $mine->execute([$room['id'], $room['b_seq'], $contestant]);
    $amount = $mine->fetchColumn();
    return [
        'seq' => $room['b_seq'],
        'open' => $room['b_open'],
        'revealed' => $room['b_revealed'],
        'round' => (int) $bet['round'],
        'catName' => $bet['catName'],
        'catNameAr' => $bet['catNameAr'],
        'score' => (int) $bet['scores'][$contestant],
        'limit' => (int) $bet['limits'][$contestant],
        'mine' => $amount === false ? null : (int) $amount,
    ];
}

/** The bet round number of a call; 400 when it is not a positive whole number. */
function require_bet_seq($value): int
{
    $seq = parse_int($value);
    if ($seq === null || $seq < 1) {
        bad_request('seq must be the bet round number');
    }
    return $seq;
}

/**
 * A new bet round: the category and every contestant's score; the server works out each limit (D-48).
 * A refresh or a lost reply asks again for the same round: while that round is still open, its seq comes back.
 */
function room_start_bets(PDO $pdo, array $body): void
{
    $room = require_question_host($pdo, $body);
    $input = state_object($body['bet'] ?? null, 'bet');
    $round = $input['round'] ?? null;
    if (!is_int($round) || $round < 1 || $round > 1000) {
        bad_request('bet.round must be the Golden Goal round');
    }
    $scores = state_list($input['scores'] ?? null, 'bet.scores', $room['names'], $room['names']);
    foreach ($scores as $score) {
        if (!is_int($score) || abs($score) > ROOM_SCORE_MAX) {
            bad_request('bet.scores must be whole numbers, one per contestant');
        }
    }
    $catName = question_text($input['catName'] ?? null, 'bet.catName', ROOM_LABEL_MAX, false);
    $catNameAr = question_text($input['catNameAr'] ?? null, 'bet.catNameAr', ROOM_LABEL_MAX, true);
    $current = room_bet_round($pdo, $room);
    if ($room['b_open'] && $current !== null && (int) $current['round'] === $round) {
        json_response(['seq' => $room['b_seq'], 'version' => $room['version']]);
    }
    [$state] = room_view($pdo, $room);
    $largest = max($state['points']); // D-48: the largest value of this game's board
    $bet = [
        'round' => $round,
        'catName' => $catName,
        'catNameAr' => $catNameAr,
        'scores' => $scores,
        'limits' => array_map(fn (int $score): int => max($score, $largest), $scores),
    ];
    $update = $pdo->prepare(
        'UPDATE game_rooms SET b_seq = LAST_INSERT_ID(b_seq + 1), b_open = 1, b_revealed = 0, bet = ?,
                version = version + 1, seen_at = NOW()
          WHERE id = ? AND host_session = ?'
    );
    $update->execute([encode_question($bet), $room['id'], $body['session']]);
    if ($update->rowCount() === 0) {
        json_response(['error' => 'This game is open in another tab.', 'other_tab' => true], 409);
    }
    $seq = stored_version($pdo);
    bind_doubles($pdo, $room['id'], 0); // US-66: Golden Goal has started, an armed ×2 is spent
    json_response(['seq' => $seq, 'version' => current_version($pdo, $room['id'])]);
}

/** The host's poll during the bets: who has bet and who has a phone, never an amount. */
function room_bets_status(PDO $pdo): void
{
    $room = find_room($pdo, require_room_code($_GET['code'] ?? null));
    require_host($room, $_SERVER['HTTP_X_HOST_TOKEN'] ?? null);
    require_current_session($room, require_session($_GET['session'] ?? null));
    $seq = require_bet_seq($_GET['seq'] ?? null);
    $stmt = $pdo->prepare('SELECT contestant FROM room_bets WHERE room_id = ? AND bet_seq = ?');
    $stmt->execute([$room['id'], $seq]);
    $bet = [];
    foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $index) {
        $bet[(int) $index] = true;
    }
    $joined = joined_indexes($pdo, $room['id']);
    $players = [];
    for ($i = 0; $i < $room['names']; $i++) {
        $players[] = ['bet' => isset($bet[$i]), 'joined' => isset($joined[$i])];
    }
    $current = $seq === $room['b_seq'];
    json_response([
        'seq' => $seq,
        'open' => $current && $room['b_open'],
        'revealed' => $current && $room['b_revealed'],
        'count' => count($bet),
        'players' => $players,
    ]);
}

/** No more bets in this round (the question opens, or the host left Golden Goal); closing twice is harmless. */
function room_close_bets(PDO $pdo, array $body): void
{
    $room = require_question_host($pdo, $body);
    $seq = require_bet_seq($body['seq'] ?? null);
    $update = $pdo->prepare(
        'UPDATE game_rooms SET b_open = 0, version = LAST_INSERT_ID(version + 1), seen_at = NOW()
          WHERE id = ? AND b_seq = ? AND b_open = 1'
    );
    $update->execute([$room['id'], $seq]);
    $closed = $update->rowCount() > 0;
    $version = $closed ? stored_version($pdo) : $room['version'];
    // OBS-65-02: who has bet once the round is closed, the list that is scored (never an amount)
    $stmt = $pdo->prepare('SELECT contestant FROM room_bets WHERE room_id = ? AND bet_seq = ?');
    $stmt->execute([$room['id'], $seq]);
    $bets = array_fill(0, $room['names'], false);
    foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $index) {
        $bets[(int) $index] = true;
    }
    json_response(['closed' => $closed, 'version' => $version, 'bets' => $bets]);
}

/** After marking: the amounts, to the host only. It closes the round first; asking again gives the same answer. */
function room_reveal_bets(PDO $pdo, array $body): void
{
    $room = require_question_host($pdo, $body);
    $seq = require_bet_seq($body['seq'] ?? null);
    if ($seq > $room['b_seq']) {
        not_found('There is no such bet round in this game.');
    }
    if ($seq === $room['b_seq'] && ($room['b_open'] || !$room['b_revealed'])) {
        $pdo->prepare(
            'UPDATE game_rooms SET b_open = 0, b_revealed = 1, version = version + 1, seen_at = NOW()
              WHERE id = ? AND b_seq = ?'
        )->execute([$room['id'], $seq]);
    }
    $stmt = $pdo->prepare('SELECT contestant, amount FROM room_bets WHERE room_id = ? AND bet_seq = ?');
    $stmt->execute([$room['id'], $seq]);
    $amounts = array_fill(0, $room['names'], null); // null = no bet (the host counts it as 0, D-80 k)
    foreach ($stmt->fetchAll() as $row) {
        $amounts[(int) $row['contestant']] = (int) $row['amount'];
    }
    json_response(['seq' => $seq, 'amounts' => $amounts]);
}

/** A phone's bet: a whole number from 0 to this contestant's limit, once per round, only while it is open. */
function room_bet(PDO $pdo, array $body): void
{
    $room = find_room($pdo, require_room_code($body['code'] ?? null));
    $token = $body['device_token'] ?? null;
    if (!is_token($token)) {
        json_response(['error' => 'Pick your name first.'], 401);
    }
    $stmt = $pdo->prepare('SELECT contestant FROM room_players WHERE room_id = ? AND device_hash = ?');
    $stmt->execute([$room['id'], token_hash($token)]);
    $you = $stmt->fetchColumn();
    if ($you === false) {
        json_response(['error' => 'This phone is no longer joined to the game. Pick your name again.'], 403);
    }
    $you = (int) $you;
    $seq = require_bet_seq($body['seq'] ?? null);
    $bet = room_bet_round($pdo, $room);
    if ($bet === null || $seq !== $room['b_seq'] || !$room['b_open']) {
        json_response(['error' => 'Too late: the bets are closed.', 'reason' => 'closed'], 409);
    }
    // BUG-65-01: a contestant who has bet already gets 409 duplicate, whatever the second amount is.
    $sent = $pdo->prepare('SELECT 1 FROM room_bets WHERE room_id = ? AND bet_seq = ? AND contestant = ?');
    $sent->execute([$room['id'], $seq, $you]);
    if ($sent->fetchColumn() !== false) {
        json_response(['error' => 'You already bet in this round.', 'reason' => 'duplicate'], 409);
    }
    $limit = (int) $bet['limits'][$you];
    $amount = $body['amount'] ?? null;
    if (!is_int($amount) || $amount < 0 || $amount > $limit) {
        bad_request('Bet a whole number from 0 to ' . $limit . '.');
    }
    // Atomic: the row goes in only while this round is open, so a close always wins.
    $insert = $pdo->prepare(
        'INSERT INTO room_bets (room_id, bet_seq, contestant, amount, received_ms)
         SELECT id, ?, ?, ?, ? FROM game_rooms WHERE id = ? AND b_seq = ? AND b_open = 1'
    );
    try {
        $insert->execute([$seq, $you, $amount, now_ms(), $room['id'], $seq]);
    } catch (PDOException $e) {
        if (is_duplicate_key($e)) {
            json_response(['error' => 'You already bet in this round.', 'reason' => 'duplicate'], 409);
        }
        throw $e;
    }
    if ($insert->rowCount() === 0) {
        json_response(['error' => 'Too late: the bets are closed.', 'reason' => 'closed'], 409);
    }
    json_response(['seq' => $seq, 'amount' => $amount], 201);
}

// ---------------------------------------------------------------------------
// Phone helpers: ❄ Freeze, 💡 Hint, ×2 Double down (US-66, D-81)
// ---------------------------------------------------------------------------

/** The helper uses of a room, all of them ($seq null) or those of one question: [{ contestant, kind, seq, target, until_ms }]. */
function helper_rows(PDO $pdo, int $roomId, ?int $seq): array
{
    $sql = 'SELECT contestant, kind, seq, target, until_ms FROM room_helpers WHERE room_id = ?';
    $params = [$roomId];
    if ($seq !== null) {
        $sql .= ' AND seq = ?';
        $params[] = $seq;
    }
    $stmt = $pdo->prepare($sql . ' ORDER BY used_ms, contestant');
    $stmt->execute($params);
    $rows = [];
    foreach ($stmt->fetchAll() as $row) {
        $rows[] = [
            'contestant' => (int) $row['contestant'],
            'kind' => $row['kind'],
            'seq' => $row['seq'] === null ? null : (int) $row['seq'],
            'target' => $row['target'] === null ? null : (int) $row['target'],
            'until_ms' => $row['until_ms'] === null ? null : (int) $row['until_ms'],
        ];
    }
    return $rows;
}

/** 409 frozen (with the ms left) while a Freeze on this contestant runs on question $seq and it is still open. */
function refuse_if_frozen(PDO $pdo, int $roomId, int $seq, int $contestant, int $now): void
{
    // A Freeze ends with its question: on a closed one the answer is simply late.
    $stmt = $pdo->prepare(
        "SELECT MAX(h.until_ms) FROM room_helpers h
           JOIN game_rooms g ON g.id = h.room_id AND g.q_seq = h.seq AND g.q_open = 1
          WHERE h.room_id = ? AND h.kind = 'freeze' AND h.seq = ? AND h.target = ? AND h.until_ms > ?"
    );
    $stmt->execute([$roomId, $seq, $contestant, $now]);
    $until = $stmt->fetchColumn();
    if ($until !== null && $until !== false) {
        json_response([
            'error' => 'You are frozen: you can send your answer when the freeze ends.',
            'reason' => 'frozen',
            'remaining_ms' => (int) $until - $now,
        ], 409);
    }
}

/** [contestant index => true] for the contestants who answered question $seq. */
function answered_indexes(PDO $pdo, int $roomId, int $seq): array
{
    $stmt = $pdo->prepare('SELECT contestant FROM room_answers WHERE room_id = ? AND seq = ?');
    $stmt->execute([$roomId, $seq]);
    $sent = [];
    foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $index) {
        $sent[(int) $index] = true;
    }
    return $sent;
}

/**
 * Why $target cannot be frozen by $you on question $seq ('' when they can): themselves, not in the room,
 * has sent, already frozen on this question, or immune with ×2 on it.
 */
function freeze_block(int $you, int $target, int $seq, array $room, array $joined, array $sent, array $rows): string
{
    if ($target === $you) {
        return 'self';
    }
    if ($target < 0 || $target >= $room['names'] || !isset($joined[$target])) {
        return 'not_in_room';
    }
    if (isset($sent[$target])) {
        return 'target_sent';
    }
    foreach ($rows as $row) {
        if ($row['seq'] === $seq && $row['kind'] === 'freeze' && $row['target'] === $target) {
            return 'already_frozen';
        }
        if ($row['seq'] === $seq && $row['kind'] === 'double' && $row['contestant'] === $target) {
            return 'immune';
        }
    }
    return '';
}

/**
 * This contestant's helpers for their phone (null when the room has none): which are left, the ×2
 * (armed, or on the open question), a Freeze on them, their 💡 pattern on this question and whom they can freeze.
 */
function room_helper_view(PDO $pdo, array $room, int $you, ?array $question, int $now): ?array
{
    if (!$room['helpers']) {
        return null;
    }
    $rows = helper_rows($pdo, $room['id'], null);
    $seq = $room['q_seq'];
    $open = $question !== null && $room['q_open'] && empty($question['goal']);
    $view = ['left' => ['freeze' => true, 'hint' => true, 'double' => true], 'double' => null, 'frozen' => null, 'hint' => null, 'targets' => []];
    foreach ($rows as $row) {
        if ($row['contestant'] === $you) {
            $view['left'][$row['kind']] = false;
            if ($row['kind'] === 'double' && $row['seq'] === null) {
                $view['double'] = 'armed';
            } elseif ($row['kind'] === 'double' && $open && $row['seq'] === $seq) {
                $view['double'] = 'on';
            } elseif ($row['kind'] === 'hint' && $open && $row['seq'] === $seq) {
                $view['hint'] = stored_hint($pdo, $room['id']);
            }
        }
        if ($open && $row['kind'] === 'freeze' && $row['target'] === $you && $row['seq'] === $seq && $row['until_ms'] > $now) {
            $view['frozen'] = ['by' => $row['contestant'], 'untilMs' => $row['until_ms']];
        }
    }
    if ($open && $view['left']['freeze']) {
        $joined = joined_indexes($pdo, $room['id']);
        $sent = answered_indexes($pdo, $room['id'], $seq);
        for ($i = 0; $i < $room['names']; $i++) {
            if (freeze_block($you, $i, $seq, $room, $joined, $sent, $rows) === '') {
                $view['targets'][] = $i;
            }
        }
    }
    return $view;
}

/** The open question's hint patterns { en, ar } (either may be null), or null. */
function stored_hint(PDO $pdo, int $roomId): ?array
{
    $stmt = $pdo->prepare('SELECT q_hint FROM game_rooms WHERE id = ?');
    $stmt->execute([$roomId]);
    $hint = json_decode((string) $stmt->fetchColumn(), true);
    return is_array($hint) ? ['en' => $hint['en'] ?? null, 'ar' => $hint['ar'] ?? null] : null;
}

/** The contestant index of the phone with this device token: 401 without one, 403 when it is not joined. */
function require_player(PDO $pdo, array $room, $token): int
{
    if (!is_token($token)) {
        json_response(['error' => 'Pick your name first.'], 401);
    }
    $stmt = $pdo->prepare('SELECT contestant FROM room_players WHERE room_id = ? AND device_hash = ?');
    $stmt->execute([$room['id'], token_hash($token)]);
    $you = $stmt->fetchColumn();
    if ($you === false) {
        json_response(['error' => 'This phone is no longer joined to the game. Pick your name again.'], 403);
    }
    return (int) $you;
}

/** The messages of the helper refusals (the phone shows its own text for each reason). */
const HELPER_REFUSALS = [
    'off' => 'Helpers are turned off in this game.',
    'used' => 'You have already used this helper in this game.',
    'goal' => 'No helpers in Golden Goal.',
    'closed' => 'There is no open question.',
    'open' => 'Arm ×2 while no question is open.',
    'sent' => 'You have already sent your answer.',
    'nohint' => 'This question has no hint.',
    'self' => 'You cannot freeze yourself.',
    'not_in_room' => 'That player has not joined the game.',
    'target_sent' => 'That player has already sent an answer.',
    'already_frozen' => 'That player is already frozen on this question.',
    'immune' => 'That player has ×2 on this question and cannot be frozen.',
];

/**
 * A phone uses a helper (US-66). Every rule is checked here, with the room row locked, so helpers, answers
 * and open_question are taken one at a time. Freeze and Hint: on the open question, before this contestant
 * sent. ×2: armed while no question is open; it applies to the next question the host opens.
 */
function room_helper(PDO $pdo, array $body): void
{
    $room = find_room($pdo, require_room_code($body['code'] ?? null));
    $you = require_player($pdo, $room, $body['device_token'] ?? null);
    $kind = $body['kind'] ?? null;
    if (!is_string($kind) || !in_array($kind, ROOM_HELPER_KINDS, true)) {
        bad_request('kind must be one of: ' . implode(', ', ROOM_HELPER_KINDS));
    }
    $seq = null;
    $target = null;
    if ($kind !== 'double') {
        $seq = $body['seq'] ?? null;
        if (!is_int($seq) || $seq < 1) {
            bad_request('seq must be the question number');
        }
    }
    if ($kind === 'freeze') {
        $target = $body['target'] ?? null;
        if (!is_int($target)) {
            bad_request('target must be a contestant index');
        }
    }
    $refuse = function (string $reason) use ($pdo): void {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        json_response(['error' => HELPER_REFUSALS[$reason], 'reason' => $reason], 409);
    };
    if (!$room['helpers']) {
        $refuse('off');
    }
    $now = now_ms();
    $untilMs = null;
    $pdo->beginTransaction();
    try {
        $lock = $pdo->prepare('SELECT q_seq, q_open, question, state, b_seq FROM game_rooms WHERE id = ? FOR UPDATE');
        $lock->execute([$room['id']]);
        $live = $lock->fetch();
        if (!$live) {
            $pdo->rollBack();
            not_found('This game has ended or the code is wrong.');
        }
        $qSeq = (int) $live['q_seq'];
        $qOpen = (int) $live['q_open'] === 1;
        $question = json_decode((string) $live['question'], true);
        $state = json_decode((string) $live['state'], true);
        $rows = helper_rows($pdo, $room['id'], null);
        foreach ($rows as $row) {
            if ($row['contestant'] === $you && $row['kind'] === $kind) {
                $refuse('used');
            }
        }
        if ($kind === 'double') {
            if ($qOpen) {
                $refuse('open');
            }
            // Golden Goal (offer, bets, question) or the results: nothing left for a ×2
            if ((int) $live['b_seq'] > 0 || !is_array($state) || ($state['goal'] ?? null) !== null ||
                !in_array($state['screen'] ?? '', ['board', 'question'], true)) {
                $refuse('goal');
            }
        } else {
            if ($seq !== $qSeq || !$qOpen || !is_array($question)) {
                $refuse('closed');
            }
            if (!empty($question['goal'])) {
                $refuse('goal');
            }
            $sent = answered_indexes($pdo, $room['id'], $seq);
            if (isset($sent[$you])) {
                $refuse('sent');
            }
            if ($kind === 'hint' && stored_hint($pdo, $room['id']) === null) {
                $refuse('nohint');
            }
            if ($kind === 'freeze') {
                $reason = freeze_block($you, $target, $seq, $room, joined_indexes($pdo, $room['id']), $sent, $rows);
                if ($reason !== '') {
                    $refuse($reason);
                }
                $untilMs = $now + freeze_seconds($question) * 1000;
            }
        }
        $pdo->prepare('INSERT INTO room_helpers (room_id, contestant, kind, seq, target, until_ms, used_ms) VALUES (?, ?, ?, ?, ?, ?, ?)')
            ->execute([$room['id'], $you, $kind, $seq, $target, $untilMs, $now]);
        bump_version($pdo, $room['id']); // the phones (the target's too) see it on their next poll
        $pdo->commit();
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        if (is_duplicate_key($e)) {
            $refuse('used');
        }
        throw $e;
    }
    json_response(['kind' => $kind, 'seq' => $seq, 'target' => $target, 'until_ms' => $untilMs, 'now' => $now], 201);
}

/** A Freeze lasts a quarter of the question's timer, rounded (30 s -> 8 s, 20 s -> 5 s); 10 s without a timer. */
function freeze_seconds(array $question): int
{
    $total = $question['timer']['totalMs'] ?? null;
    if (!is_int($total) || $total < 1000) {
        return ROOM_FREEZE_NO_TIMER_S;
    }
    return max(1, (int) round($total / 4000));
}

/** New Game: the host closes the room (with its players, answers and bets); its phones then show "This game has ended." */
function room_close(PDO $pdo, array $body): void
{
    $room = require_question_host($pdo, $body);
    $pdo->prepare('DELETE FROM game_rooms WHERE id = ? AND host_session = ?')->execute([$room['id'], $body['session']]);
    json_response(['closed' => true]);
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
    $goal = $input['goal'] ?? null;
    if ($goal !== null && (!is_string($goal) || !in_array($goal, ROOM_GOAL_STAGES, true) || $screen !== 'final')) {
        bad_request('state.goal must be null or one of: ' . implode(', ', ROOM_GOAL_STAGES) . ' (on the final screen)');
    }
    return [
        'mode' => $mode,
        'screen' => $screen,
        'goal' => $goal,
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

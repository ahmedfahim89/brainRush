<?php
// POST /api/game-log.php  body { mode: 'players'|'teams'|'streak', players: [name, ...], categories: [id, ...] } -> 201 { logged: true }
// mode is optional and defaults to 'players'; players holds the player or team names.
// A Streak Challenge run (US-33) sends mode 'streak', one name (the challenger name) and no categories
// (its questions come from every category).
// Appends one line per started game to that day's log file, logs/game-YYYY-MM-DD.log:
//   <YYYY-MM-DD HH:MM, server time> | players: <name>, <name> | categories: <name>, <name>
//   <YYYY-MM-DD HH:MM, server time> | teams: <name>, <name> | categories: <name>, <name>
//   <YYYY-MM-DD HH:MM, server time> | streak: <name> | categories: all
// Category names come from the database, so the log never holds client-made category text.
// Public on purpose (every game start calls it); read_json_body() forces a CORS preflight.
require_once __DIR__ . '/db.php';

const GAME_LOG_DIR = __DIR__ . '/../logs';
const GAME_LOG_MAX_BY_MODE = ['players' => 6, 'teams' => 4, 'streak' => 1]; // MODES limits in js/game.js
const GAME_LOG_NAME_MAX = 30;      // NAME_MAX in js/game.js (D-22); also the challenger name
const GAME_LOG_MAX_CATEGORIES = 10; // categories_per_game upper bound

/** One log field: control characters (newlines, tabs) become spaces, so a name cannot forge a line. */
function log_text(string $text): string
{
    return trim((string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $text));
}

/** The game mode, one of the keys of GAME_LOG_MAX_BY_MODE; absent means 'players'. */
function read_mode($value): string
{
    if ($value === null) {
        return 'players';
    }
    if (!is_string($value) || !isset(GAME_LOG_MAX_BY_MODE[$value])) {
        bad_request('mode must be one of: ' . implode(', ', array_keys(GAME_LOG_MAX_BY_MODE)));
    }
    return $value;
}

/** Validated player or team names (1..limit of the mode, each 1-30 chars after trimming). */
function read_players($value, string $mode): array
{
    $max = GAME_LOG_MAX_BY_MODE[$mode];
    if ($mode === 'streak' && (!is_array($value) || count($value) !== 1)) {
        bad_request('streak mode takes exactly 1 name');
    }
    if (!is_array($value) || !$value || count($value) > $max) {
        bad_request("players must be a list of 1 to $max names");
    }
    return array_map(fn($name) => log_text(require_text($name, 'Player name', GAME_LOG_NAME_MAX)), array_values($value));
}

/** Names of the chosen categories, in the order chosen; 400 for unknown ids. */
function read_category_names(PDO $pdo, $value): array
{
    if (!is_array($value) || !$value || count($value) > GAME_LOG_MAX_CATEGORIES) {
        bad_request('categories must be a list of 1 to ' . GAME_LOG_MAX_CATEGORIES . ' ids');
    }
    $ids = [];
    foreach ($value as $raw) {
        $id = parse_int($raw);
        if ($id === null || $id < 1) {
            bad_request('categories must hold positive integer ids');
        }
        $ids[] = $id;
    }
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT id, name FROM categories WHERE id IN ($placeholders)");
    $stmt->execute($ids);
    $names = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    return array_map(function (int $id) use ($names): string {
        if (!isset($names[$id])) {
            bad_request("Category $id does not exist");
        }
        return log_text($names[$id]);
    }, $ids);
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        $body = read_json_body();
        $mode = read_mode($body['mode'] ?? null);
        $players = read_players($body['players'] ?? null, $mode);
        // A streak plays every category, so it sends none.
        $categories = $mode === 'streak' ? ['all'] : read_category_names(db(), $body['categories'] ?? null);

        if (!is_dir(GAME_LOG_DIR)) {
            mkdir(GAME_LOG_DIR, 0755, true);
        }
        $now = time(); // one clock reading, so a game started at midnight lands in the file its line names
        $file = GAME_LOG_DIR . '/game-' . date('Y-m-d', $now) . '.log';
        $line = sprintf(
            "%s | %s: %s | categories: %s\n",
            date('Y-m-d H:i', $now),
            $mode,
            implode(', ', $players),
            implode(', ', $categories)
        );
        // FILE_APPEND adds to today's file, or creates it with this first line if it does not exist yet.
        file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
        json_response(['logged' => true], 201);
        break;

    default:
        method_not_allowed(['POST']);
}

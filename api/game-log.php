<?php
// POST /api/game-log.php  body { players: [name, ...], categories: [id, ...] } -> 201 { logged: true }
// Appends one line per started game to that day's log file, logs/game-YYYY-MM-DD.log:
//   <YYYY-MM-DD HH:MM, server time> | players: <name>, <name> | categories: <name>, <name>
// Category names come from the database, so the log never holds client-made category text.
// Public on purpose (every game start calls it); read_json_body() forces a CORS preflight.
require_once __DIR__ . '/db.php';

const GAME_LOG_DIR = __DIR__ . '/../logs';
const GAME_LOG_MAX_PLAYERS = 6;    // MODES limit in js/game.js
const GAME_LOG_NAME_MAX = 30;      // NAME_MAX in js/game.js (D-22)
const GAME_LOG_MAX_CATEGORIES = 10; // categories_per_game upper bound

/** One log field: control characters (newlines, tabs) become spaces, so a name cannot forge a line. */
function log_text(string $text): string
{
    return trim((string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $text));
}

/** Validated player names (1..6, each 1-30 chars after trimming). */
function read_players($value): array
{
    if (!is_array($value) || !$value || count($value) > GAME_LOG_MAX_PLAYERS) {
        bad_request('players must be a list of 1 to ' . GAME_LOG_MAX_PLAYERS . ' names');
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
        $players = read_players($body['players'] ?? null);
        $categories = read_category_names(db(), $body['categories'] ?? null);

        if (!is_dir(GAME_LOG_DIR)) {
            mkdir(GAME_LOG_DIR, 0755, true);
        }
        $now = time(); // one clock reading, so a game started at midnight lands in the file its line names
        $file = GAME_LOG_DIR . '/game-' . date('Y-m-d', $now) . '.log';
        $line = sprintf(
            "%s | players: %s | categories: %s\n",
            date('Y-m-d H:i', $now),
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

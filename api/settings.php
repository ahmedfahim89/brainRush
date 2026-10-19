<?php
// GET  /api/settings.php  -> { categories_per_game, timer_seconds, banner_enabled, banner_text }
// PUT  /api/settings.php  body { categories_per_game?, timer_seconds?, banner_enabled?, banner_text? } -> updated settings
// Writes need admin access (require_admin: 401/403 otherwise).
require_once __DIR__ . '/db.php';

// Editable settings and their allowed integer range (values themselves live in the DB).
const SETTING_RULES = [
    'categories_per_game' => [1, 10],
    'timer_seconds'       => [5, 600],
    'banner_enabled'      => [0, 1], // "new questions" banner on the game setup screen
];

// Editable text settings and their maximum length in characters.
const TEXT_SETTING_RULES = [
    'banner_text' => 150,
];

/** Current settings: integers and text (null if a row is missing). */
function load_settings(PDO $pdo): array
{
    $rows = $pdo->query('SELECT name, value FROM settings')->fetchAll(PDO::FETCH_KEY_PAIR);
    $settings = [];
    foreach (array_keys(SETTING_RULES) as $name) {
        $settings[$name] = isset($rows[$name]) ? (int) $rows[$name] : null;
    }
    foreach (array_keys(TEXT_SETTING_RULES) as $name) {
        $settings[$name] = isset($rows[$name]) ? (string) $rows[$name] : null;
    }
    return $settings;
}

/** Validate the PUT body; returns [name => int|string] or sends 400. */
function validate_settings(array $body): array
{
    $updates = [];
    foreach (SETTING_RULES as $name => [$min, $max]) {
        if (!array_key_exists($name, $body)) {
            continue;
        }
        $value = parse_int($body[$name]);
        if ($value === null || $value < $min || $value > $max) {
            bad_request("$name must be a whole number between $min and $max");
        }
        $updates[$name] = $value;
    }
    foreach (TEXT_SETTING_RULES as $name => $maxChars) {
        if (array_key_exists($name, $body)) {
            $updates[$name] = require_text($body[$name], $name, $maxChars);
        }
    }
    if (!$updates) {
        bad_request('Provide at least one of: ' . implode(', ', array_merge(
            array_keys(SETTING_RULES), array_keys(TEXT_SETTING_RULES))));
    }
    return $updates;
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        json_response(load_settings(db()));
        break;

    case 'PUT':
        require_admin();
        $updates = validate_settings(read_json_body());
        $pdo = db();
        $stmt = $pdo->prepare(
            'INSERT INTO settings (name, value) VALUES (:name, :value)
             ON DUPLICATE KEY UPDATE value = VALUES(value)'
        );
        $pdo->beginTransaction();
        foreach ($updates as $name => $value) {
            $stmt->execute([':name' => $name, ':value' => (string) $value]);
        }
        $pdo->commit();
        json_response(load_settings($pdo));
        break;

    default:
        method_not_allowed(['GET', 'PUT']);
}

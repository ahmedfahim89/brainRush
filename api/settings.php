<?php
// GET  /api/settings.php  -> { categories_per_game, timer_seconds }
// PUT  /api/settings.php  body { categories_per_game?, timer_seconds? } -> updated settings
require_once __DIR__ . '/db.php';

// Editable settings and their allowed integer range (values themselves live in the DB).
const SETTING_RULES = [
    'categories_per_game' => [1, 10],
    'timer_seconds'       => [5, 600],
];

/** Current settings as integers (null if a row is missing). */
function load_settings(PDO $pdo): array
{
    $rows = $pdo->query('SELECT name, value FROM settings')->fetchAll(PDO::FETCH_KEY_PAIR);
    $settings = [];
    foreach (array_keys(SETTING_RULES) as $name) {
        $settings[$name] = isset($rows[$name]) ? (int) $rows[$name] : null;
    }
    return $settings;
}

/** Validate the PUT body; returns [name => int] or sends 400. */
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
    if (!$updates) {
        bad_request('Provide categories_per_game and/or timer_seconds');
    }
    return $updates;
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        json_response(load_settings(db()));
        break;

    case 'PUT':
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

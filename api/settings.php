<?php
// GET  /api/settings.php  -> { categories_per_game, timer_seconds, banner_enabled, banner_text, start_game_hidden, helpers_enabled, ads_enabled, final_round_enabled, daily_enabled, crossword_enabled, speed_enabled, ads_client, ads_slot }
// PUT  /api/settings.php  body { categories_per_game?, timer_seconds?, banner_enabled?, banner_text?, start_game_hidden?, helpers_enabled?, ads_enabled?, final_round_enabled?, daily_enabled?, crossword_enabled?, speed_enabled?, ads_client?, ads_slot? } -> updated settings
// Writes need admin access (require_admin: 401/403 otherwise).
// CHRISTMAS (US-55, D-66): also christmas_theme (0/1, missing row = 0) and christmas_banner_text (max 150, may be empty, missing row = "").
// Tournament (US-61, D-77 aa): also tournament_points, the point values a tournament match board uses,
// as an ascending comma list ("200,400,500"); "" (or a missing row) = the 3 lowest enabled values.
// Mokh Bot (US-63, D-79): also bot_accuracy, the bot's right tickets out of 10 (0..10 = 0..100%, missing row = 3).
require_once __DIR__ . '/db.php';

const TOURNAMENT_POINTS_MAX = 20; // at most this many values in tournament_points

/** "500, 200,200" -> "200,500" (ascending, no repeats); sends 400 on anything but whole numbers 1..1000000. */
function normalize_tournament_points($value): string
{
    if ($value === null) {
        return '';
    }
    if (!is_string($value)) {
        bad_request('tournament_points must be text such as "200,400,500"');
    }
    $value = trim($value);
    if ($value === '') {
        return '';
    }
    $list = [];
    foreach (explode(',', $value) as $part) {
        $n = parse_int(trim($part));
        if ($n === null || $n < 1 || $n > 1000000) {
            bad_request('tournament_points must list whole point values between 1 and 1000000, separated by commas');
        }
        $list[$n] = true;
    }
    if (count($list) > TOURNAMENT_POINTS_MAX) {
        bad_request('tournament_points can hold at most ' . TOURNAMENT_POINTS_MAX . ' values');
    }
    $values = array_keys($list);
    sort($values);
    return implode(',', $values);
}

// Editable settings and their allowed integer range (values themselves live in the DB).
const SETTING_RULES = [
    'categories_per_game' => [1, 10],
    'timer_seconds'       => [5, 600],
    'banner_enabled'      => [0, 1], // "new questions" banner on the game setup screen
    'start_game_hidden'   => [0, 1], // maintenance mode: hides Start Game and shows an overlay
    'helpers_enabled'     => [0, 1], // 3 choices, Swap and Skip; a missing row counts as on
    'ads_enabled'         => [0, 1], // AdSense banner on the Streak leaderboard (D-41); a missing row counts as off
    'final_round_enabled' => [0, 1], // final wager round before Results (US-44); a missing row counts as off
    'daily_enabled'       => [0, 1], // Daily Challenge button (US-43, D-74); a missing row counts as on
    'crossword_enabled'   => [0, 1], // Daily Crossword button (US-58, D-72 m); a missing row counts as off
    'speed_enabled'       => [0, 1], // Speed Round button (US-59, D-73); a missing row counts as off
    'christmas_theme'     => [0, 1], // CHRISTMAS (US-55): festive look on the game page; a missing row counts as off
    'bot_accuracy'        => [0, 10], // Mokh Bot (US-63, D-79): right tickets out of 10; a missing row counts as 3
];

// Editable text settings and their maximum length in characters.
const TEXT_SETTING_RULES = [
    'banner_text' => 150,
    'christmas_banner_text' => 150, // CHRISTMAS (US-55): greeting strip; empty = the game's built-in greeting
];

// CHRISTMAS (US-55): text settings that may be saved empty.
const EMPTY_TEXT_ALLOWED = ['christmas_banner_text'];

// AdSense IDs (D-41): public values that go into the page, so only their format is checked.
// Empty is allowed so the admin can clear them.
const AD_SETTING_RULES = [
    'ads_client' => ['/^(ca-pub-\d{10,20})?$/', 'ads_client must look like ca-pub-1234567890123456'],
    'ads_slot'   => ['/^\d{0,20}$/', 'ads_slot must be the ad unit number (digits only)'],
];

/** Current settings: integers and text (null if a row is missing). */
function load_settings(PDO $pdo): array
{
    $rows = $pdo->query('SELECT name, value FROM settings')->fetchAll(PDO::FETCH_KEY_PAIR);
    $settings = [];
    foreach (array_keys(SETTING_RULES) as $name) {
        $settings[$name] = isset($rows[$name]) ? (int) $rows[$name] : null;
    }
    foreach (array_merge(array_keys(TEXT_SETTING_RULES), array_keys(AD_SETTING_RULES)) as $name) {
        $settings[$name] = isset($rows[$name]) ? (string) $rows[$name] : null;
    }
    $settings['daily_enabled'] = $settings['daily_enabled'] ?? 1; // D-74: a missing row means on (it was always shown)
    $settings['crossword_enabled'] = $settings['crossword_enabled'] ?? 0; // US-58: a missing row means off
    $settings['speed_enabled'] = $settings['speed_enabled'] ?? 0; // US-59: a missing row means off
    // CHRISTMAS (US-55): a missing row means off / no custom greeting
    $settings['christmas_theme'] = $settings['christmas_theme'] ?? 0;
    $settings['christmas_banner_text'] = $settings['christmas_banner_text'] ?? '';
    $settings['bot_accuracy'] = $settings['bot_accuracy'] ?? 3; // US-63 (D-79): a missing row means 30%
    // US-61 (D-77 aa): a missing row means "" (the 3 lowest enabled values)
    $settings['tournament_points'] = isset($rows['tournament_points']) ? (string) $rows['tournament_points'] : '';
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
        if (!array_key_exists($name, $body)) {
            continue;
        }
        // CHRISTMAS (US-55): an empty greeting is allowed (EMPTY_TEXT_ALLOWED)
        $value = $body[$name];
        $emptyOk = in_array($name, EMPTY_TEXT_ALLOWED, true)
            && ($value === null || (is_string($value) && trim($value) === ''));
        $updates[$name] = $emptyOk ? '' : require_text($value, $name, $maxChars);
    }
    foreach (AD_SETTING_RULES as $name => [$pattern, $message]) {
        if (!array_key_exists($name, $body)) {
            continue;
        }
        if ($body[$name] !== null && !is_string($body[$name])) {
            bad_request("$name must be text");
        }
        $value = trim((string) $body[$name]);
        if (!preg_match($pattern, $value)) {
            bad_request($message);
        }
        $updates[$name] = $value;
    }
    if (array_key_exists('tournament_points', $body)) {
        $updates['tournament_points'] = normalize_tournament_points($body['tournament_points']); // US-61
    }
    if (!$updates) {
        bad_request('Provide at least one of: ' . implode(', ', array_merge(
            array_keys(SETTING_RULES), array_keys(TEXT_SETTING_RULES), array_keys(AD_SETTING_RULES), ['tournament_points'])));
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

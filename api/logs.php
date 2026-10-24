<?php
// GET /api/logs.php              -> every log file [{name, size, modified: 'YYYY-MM-DD HH:MM:SS'}], newest first
// GET /api/logs.php?file=<name>  -> { name, size, content, truncated }
// Read-only view of the .log and .txt files in the logs folder (game-log.php writes them).
// Admin only (require_admin): the logs hold player names. The folder itself is blocked
// from the web by .htaccess. Only plain file names from that folder are accepted, so a
// request cannot read files elsewhere (no paths, no "..").
require_once __DIR__ . '/db.php';

const LOGS_DIR = __DIR__ . '/../logs';
const LOG_NAME_PATTERN = '/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}\.(log|txt)$/';
const LOG_MAX_BYTES = 1048576; // 1 MB: a longer file shows its last 1 MB (the newest lines)

/** Every .log/.txt file in the logs folder, newest first (by modification time, then name). */
function list_logs(): array
{
    if (!is_dir(LOGS_DIR)) {
        return [];
    }
    $files = [];
    foreach (scandir(LOGS_DIR) as $name) {
        $path = LOGS_DIR . '/' . $name;
        if (!preg_match(LOG_NAME_PATTERN, $name) || !is_file($path)) {
            continue;
        }
        $files[] = ['name' => $name, 'size' => filesize($path), 'mtime' => filemtime($path)];
    }
    usort($files, fn(array $a, array $b): int => [$b['mtime'], $b['name']] <=> [$a['mtime'], $a['name']]);
    return array_map(fn(array $f): array => [
        'name'     => $f['name'],
        'size'     => $f['size'],
        'modified' => date('Y-m-d H:i:s', $f['mtime']),
    ], $files);
}

/** One log file's text; 400 for a name that is not a plain .log/.txt file name, 404 if absent. */
function read_log($name): array
{
    if (!is_string($name) || !preg_match(LOG_NAME_PATTERN, $name)) {
        bad_request('file must be a .log or .txt file name from the logs folder');
    }
    $path = LOGS_DIR . '/' . $name;
    if (!is_file($path)) {
        not_found('Log file not found');
    }
    $size = filesize($path);
    $truncated = $size > LOG_MAX_BYTES;
    $content = $truncated
        ? file_get_contents($path, false, null, $size - LOG_MAX_BYTES)
        : file_get_contents($path);
    return ['name' => $name, 'size' => $size, 'content' => (string) $content, 'truncated' => $truncated];
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        require_admin();
        if (isset($_GET['file'])) {
            json_response(read_log($_GET['file']));
        }
        json_response(list_logs());
        break;

    default:
        method_not_allowed(['GET']);
}

<?php
// BrainRush API helpers: PDO connection, JSON in/out, validation helpers,
// and a generic error handler that never leaks DSN, credentials or traces.

ini_set('display_errors', '0');
error_reporting(E_ALL);

// Turn PHP warnings/notices into exceptions so they hit the generic handler.
set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Any uncaught error: log a short line server-side, return a generic 500.
set_exception_handler(function (Throwable $e): void {
    // Message + location only (no trace: traces may contain constructor args).
    error_log(sprintf('BrainRush API error: %s in %s:%d', $e->getMessage(), $e->getFile(), $e->getLine()));
    json_response(['error' => 'Internal server error'], 500);
});

/** Send $data as JSON with the given HTTP status and stop. */
function json_response($data, int $code = 200): void
{
    if (!headers_sent()) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: no-store');
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

/** Shortcut for 400 responses. */
function bad_request(string $message): void
{
    json_response(['error' => $message], 400);
}

/** Shortcut for 404 responses. */
function not_found(string $message): void
{
    json_response(['error' => $message], 404);
}

/** Shortcut for 409 responses. */
function conflict(string $message): void
{
    json_response(['error' => $message], 409);
}

/** 405 with an Allow header listing the supported methods. */
function method_not_allowed(array $allowed): void
{
    if (!headers_sent()) {
        header('Allow: ' . implode(', ', $allowed));
    }
    json_response(['error' => 'Method not allowed'], 405);
}

/**
 * Decode the request body as a JSON object.
 * 415 unless Content-Type is application/json (forces a CORS preflight, so
 * cross-site form posts are rejected); 400 if the body is not a JSON object.
 */
function read_json_body(): array
{
    $contentType = (string) ($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '');
    $mediaType = strtolower(trim(explode(';', $contentType, 2)[0]));
    if ($mediaType !== 'application/json') {
        json_response(['error' => 'Content-Type must be application/json'], 415);
    }

    $raw = file_get_contents('php://input');
    $data = json_decode($raw === false ? '' : $raw, false);
    if (!($data instanceof stdClass)) {
        bad_request('Request body must be a JSON object');
    }
    // Re-decode as an associative array now that we know it is an object.
    return json_decode($raw, true);
}

/** Shared PDO connection (utf8mb4, exceptions, real prepared statements). */
function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $configFile = __DIR__ . '/config.php';
    $config = is_file($configFile) ? require $configFile : null;
    if (!is_array($config)) {
        error_log('BrainRush API: api/config.php is missing or invalid (copy api/config.example.php).');
        json_response(['error' => 'Server is not configured'], 500);
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $config['host'] ?? '127.0.0.1',
        (int) ($config['port'] ?? 3306),
        $config['dbname'] ?? 'brainrush'
    );
    $pdo = new PDO($dsn, $config['user'] ?? '', $config['password'] ?? '', [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

/**
 * Parse a whole number from a JSON int or a digit string ("300", "-5").
 * Returns null for floats, booleans, arrays, empty or non-numeric strings.
 */
function parse_int($value): ?int
{
    if (is_int($value)) {
        return $value;
    }
    if (is_string($value) && preg_match('/^\s*-?\d{1,10}\s*$/', $value)) {
        return (int) trim($value);
    }
    return null;
}

/** Read a positive integer id from the query string; 400 if absent/invalid. */
function require_query_id(string $name = 'id'): int
{
    $id = parse_int($_GET[$name] ?? null);
    if ($id === null || $id < 1) {
        bad_request("Query parameter '$name' must be a positive integer");
    }
    return $id;
}

/** Character length of a UTF-8 string (works without mbstring). */
function text_length(string $text): int
{
    return function_exists('mb_strlen') ? mb_strlen($text, 'UTF-8') : (int) preg_match_all('/./su', $text);
}

/** Validate a required text field: trimmed, non-empty, at most $maxChars. */
function require_text($value, string $label, int $maxChars): string
{
    if ($value !== null && !is_string($value)) {
        bad_request("$label must be text");
    }
    $text = trim((string) $value);
    if ($text === '') {
        bad_request("$label is required");
    }
    if (text_length($text) > $maxChars) {
        bad_request("$label must be at most $maxChars characters");
    }
    return $text;
}

/** MySQL error 1062: duplicate entry for a unique key. */
function is_duplicate_key(PDOException $e): bool
{
    return $e->getCode() === '23000' && (int) ($e->errorInfo[1] ?? 0) === 1062;
}

/** MySQL errors 1451/1452: foreign key constraint failed. */
function is_foreign_key_error(PDOException $e): bool
{
    return $e->getCode() === '23000' && in_array((int) ($e->errorInfo[1] ?? 0), [1451, 1452], true);
}

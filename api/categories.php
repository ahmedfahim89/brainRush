<?php
// GET    /api/categories.php             -> [{ id, name, name_ar, question_count }] sorted by name
// GET    /api/categories.php?playable=1  -> only playable categories: at least one question for
//                                        every enabled point value (D-31 amended)
// POST   /api/categories.php             body { name, name_ar? } -> 201 created category
// PUT    /api/categories.php?id=<id>     body { name, name_ar? } -> 200 renamed category
//                                        (name_ar left out = unchanged; null or "" = none)
// name_ar is the optional Arabic name the game shows when its interface is Arabic (null = none).
// It needs the categories.name_ar column (sql/migrate-add-category-name-ar.sql, run before this code).
// DELETE /api/categories.php?id=<id>     -> 200 (its questions are deleted by FK cascade)
// Writes need admin access (require_admin: 401/403 otherwise).
require_once __DIR__ . '/db.php';

const CATEGORY_NAME_MAX = 100;

function category_row(array $r): array
{
    return [
        'id'             => (int) $r['id'],
        'name'           => $r['name'],
        'name_ar'        => arabic_name_or_null($r['name_ar']),
        'question_count' => (int) $r['question_count'],
    ];
}

/** Stored Arabic name as the JSON sends it: null when there is none (NULL or blank). */
function arabic_name_or_null(?string $nameAr): ?string
{
    return $nameAr === null || trim($nameAr) === '' ? null : $nameAr;
}

/** Optional Arabic name: null/empty -> null; otherwise trimmed, one line, at most CATEGORY_NAME_MAX. */
function optional_arabic_name($value): ?string
{
    if ($value !== null && !is_string($value)) {
        bad_request('Arabic name must be text');
    }
    $text = trim((string) $value);
    if ($text === '') {
        return null;
    }
    if (text_length($text) > CATEGORY_NAME_MAX) {
        bad_request('Arabic name must be at most ' . CATEGORY_NAME_MAX . ' characters');
    }
    if (preg_match('/[\x00-\x1F\x7F]/', $text)) {
        bad_request('Arabic name must be a single line of text');
    }
    return $text;
}

function list_categories(PDO $pdo, bool $playableOnly): array
{
    // Playable = a question for every enabled point value (PLAYABLE_HAVING in db.php).
    $having = $playableOnly ? PLAYABLE_HAVING : '';
    $rows = $pdo->query(
        "SELECT c.id, c.name, c.name_ar, COUNT(q.id) AS question_count
           FROM categories c
           LEFT JOIN questions q ON q.category_id = c.id
           LEFT JOIN point_values pv ON pv.points = q.points
          GROUP BY c.id, c.name, c.name_ar
          $having
          ORDER BY c.name ASC"
    )->fetchAll();
    return array_map('category_row', $rows);
}

/** One category with its question count, or null. */
function find_category(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare(
        'SELECT c.id, c.name, c.name_ar, COUNT(q.id) AS question_count
           FROM categories c
           LEFT JOIN questions q ON q.category_id = c.id
          WHERE c.id = :id
          GROUP BY c.id, c.name, c.name_ar'
    );
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    return $row ? category_row($row) : null;
}

/**
 * Run an INSERT/UPDATE on the name, mapping the unique-key error to 409. The built-in Kilo Meshakkal
 * name (MIX_NAME in db.php, BUG-10-01, US-53) is taken too, so Setup never shows two tiles with that name.
 */
function save_category_name(PDOStatement $stmt, array $params, string $name): void
{
    if (mb_strtolower($name) === mb_strtolower(MIX_NAME)) {
        conflict("\"$name\" is the name of a built-in category");
    }
    try {
        $stmt->execute($params);
    } catch (PDOException $e) {
        if (is_duplicate_key($e)) {
            conflict("A category named \"$name\" already exists");
        }
        throw $e;
    }
}

function create_category(PDO $pdo, array $body): void
{
    $name = require_text($body['name'] ?? null, 'Name', CATEGORY_NAME_MAX);
    $nameAr = optional_arabic_name($body['name_ar'] ?? null);
    $stmt = $pdo->prepare('INSERT INTO categories (name, name_ar) VALUES (:name, :name_ar)');
    save_category_name($stmt, [':name' => $name, ':name_ar' => $nameAr], $name);
    json_response(find_category($pdo, (int) $pdo->lastInsertId()), 201);
}

function rename_category(PDO $pdo, int $id, array $body): void
{
    $name = require_text($body['name'] ?? null, 'Name', CATEGORY_NAME_MAX);
    $existing = find_category($pdo, $id);
    if ($existing === null) {
        not_found('Category not found');
    }
    // A client that sends only the name keeps the Arabic name.
    $nameAr = array_key_exists('name_ar', $body) ? optional_arabic_name($body['name_ar']) : $existing['name_ar'];
    $stmt = $pdo->prepare('UPDATE categories SET name = :name, name_ar = :name_ar WHERE id = :id');
    save_category_name($stmt, [':name' => $name, ':name_ar' => $nameAr, ':id' => $id], $name);
    json_response(find_category($pdo, $id));
}

function delete_category(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare('DELETE FROM categories WHERE id = :id');
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) {
        not_found('Category not found');
    }
    json_response(['deleted' => $id]);
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $playableOnly = ($_GET['playable'] ?? '') === '1';
        json_response(list_categories(db(), $playableOnly));
        break;

    case 'POST':
        require_admin();
        $body = read_json_body();
        create_category(db(), $body);
        break;

    case 'PUT':
        require_admin();
        $id = require_query_id();
        $body = read_json_body();
        rename_category(db(), $id, $body);
        break;

    case 'DELETE':
        require_admin();
        $id = require_query_id();
        delete_category(db(), $id);
        break;

    default:
        method_not_allowed(['GET', 'POST', 'PUT', 'DELETE']);
}

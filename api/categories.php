<?php
// GET    /api/categories.php             -> [{ id, name, question_count }] sorted by name
// GET    /api/categories.php?playable=1  -> only categories with a question for every point value
// POST   /api/categories.php             body { name } -> 201 created category
// PUT    /api/categories.php?id=<id>     body { name } -> 200 renamed category
// DELETE /api/categories.php?id=<id>     -> 200 (its questions are deleted by FK cascade)
require_once __DIR__ . '/db.php';

const CATEGORY_NAME_MAX = 100;

function category_row(array $r): array
{
    return [
        'id'             => (int) $r['id'],
        'name'           => $r['name'],
        'question_count' => (int) $r['question_count'],
    ];
}

function list_categories(PDO $pdo, bool $playableOnly): array
{
    // FK + uq_slot guarantee each question fills a distinct existing point value,
    // so "count of questions == count of point values" means every slot is filled.
    $having = $playableOnly
        ? 'HAVING COUNT(q.id) > 0 AND COUNT(q.id) = (SELECT COUNT(*) FROM point_values)'
        : '';
    $rows = $pdo->query(
        "SELECT c.id, c.name, COUNT(q.id) AS question_count
           FROM categories c
           LEFT JOIN questions q ON q.category_id = c.id
          GROUP BY c.id, c.name
          $having
          ORDER BY c.name ASC"
    )->fetchAll();
    return array_map('category_row', $rows);
}

/** One category with its question count, or null. */
function find_category(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare(
        'SELECT c.id, c.name, COUNT(q.id) AS question_count
           FROM categories c
           LEFT JOIN questions q ON q.category_id = c.id
          WHERE c.id = :id
          GROUP BY c.id, c.name'
    );
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    return $row ? category_row($row) : null;
}

/** Run an INSERT/UPDATE on the name, mapping the unique-key error to 409. */
function save_category_name(PDOStatement $stmt, array $params, string $name): void
{
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
    $stmt = $pdo->prepare('INSERT INTO categories (name) VALUES (:name)');
    save_category_name($stmt, [':name' => $name], $name);
    json_response(find_category($pdo, (int) $pdo->lastInsertId()), 201);
}

function rename_category(PDO $pdo, int $id, array $body): void
{
    $name = require_text($body['name'] ?? null, 'Name', CATEGORY_NAME_MAX);
    if (find_category($pdo, $id) === null) {
        not_found('Category not found');
    }
    $stmt = $pdo->prepare('UPDATE categories SET name = :name WHERE id = :id');
    save_category_name($stmt, [':name' => $name, ':id' => $id], $name);
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
        $body = read_json_body();
        create_category(db(), $body);
        break;

    case 'PUT':
        $id = require_query_id();
        $body = read_json_body();
        rename_category(db(), $id, $body);
        break;

    case 'DELETE':
        $id = require_query_id();
        delete_category(db(), $id);
        break;

    default:
        method_not_allowed(['GET', 'POST', 'PUT', 'DELETE']);
}

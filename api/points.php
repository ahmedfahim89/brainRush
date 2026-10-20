<?php
// GET    /api/points.php          -> [{ id, points, enabled, question_count }] ascending
// POST   /api/points.php          body { points } -> 201 created value (enabled)
// PUT    /api/points.php?id=<id>  body { enabled } -> 200; 409 when disabling the last enabled value
// DELETE /api/points.php?id=<id>  -> 200; 409 if questions still use it
// A disabled value is hidden from the game board; its questions stay in the database.
// Writes need admin access (require_admin: 401/403 otherwise).
require_once __DIR__ . '/db.php';

const MIN_POINTS = 1;
const MAX_POINTS = 1000000;

function list_points(PDO $pdo): array
{
    $rows = $pdo->query(
        'SELECT pv.id, pv.points, pv.enabled, COUNT(q.id) AS question_count
           FROM point_values pv
           LEFT JOIN questions q ON q.points = pv.points
          GROUP BY pv.id, pv.points, pv.enabled
          ORDER BY pv.points ASC'
    )->fetchAll();
    return array_map(fn(array $r): array => [
        'id'             => (int) $r['id'],
        'points'         => (int) $r['points'],
        'enabled'        => (bool) $r['enabled'],
        'question_count' => (int) $r['question_count'],
    ], $rows);
}

function create_point_value(PDO $pdo, array $body): void
{
    $points = parse_int($body['points'] ?? null);
    if ($points === null || $points < MIN_POINTS || $points > MAX_POINTS) {
        bad_request('Point value must be a whole number between ' . MIN_POINTS . ' and ' . MAX_POINTS);
    }
    try {
        $stmt = $pdo->prepare('INSERT INTO point_values (points) VALUES (:points)');
        $stmt->execute([':points' => $points]);
    } catch (PDOException $e) {
        if (is_duplicate_key($e)) {
            conflict("Point value $points already exists");
        }
        throw $e;
    }
    json_response(['id' => (int) $pdo->lastInsertId(), 'points' => $points, 'enabled' => true, 'question_count' => 0], 201);
}

function delete_point_value(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare('SELECT points FROM point_values WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $points = $stmt->fetchColumn();
    if ($points === false) {
        not_found('Point value not found');
    }
    $points = (int) $points;

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM questions WHERE points = :points');
    $stmt->execute([':points' => $points]);
    $used = (int) $stmt->fetchColumn();
    if ($used > 0) {
        conflict("Cannot delete $points: $used question(s) still use it. Delete or move those questions first.");
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM point_values WHERE id = :id');
        $stmt->execute([':id' => $id]);
    } catch (PDOException $e) {
        // A question was added between the check and the delete (FK RESTRICT).
        if (is_foreign_key_error($e)) {
            conflict("Cannot delete $points: questions still use it. Delete or move those questions first.");
        }
        throw $e;
    }
    json_response(['deleted' => $id]);
}

/** Enable or disable a value on the board. The board keeps at least one enabled value. */
function set_point_enabled(PDO $pdo, int $id, array $body): void
{
    $raw = $body['enabled'] ?? null;
    $enabled = is_bool($raw) ? (int) $raw : parse_int($raw);
    if ($enabled !== 0 && $enabled !== 1) {
        bad_request('enabled must be true or false');
    }

    $pdo->beginTransaction();
    // Lock the enabled rows so two disables at once cannot switch off the last one.
    $enabledIds = array_map('intval', $pdo->query(
        'SELECT id FROM point_values WHERE enabled = 1 FOR UPDATE'
    )->fetchAll(PDO::FETCH_COLUMN));
    $stmt = $pdo->prepare('SELECT points FROM point_values WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $points = $stmt->fetchColumn();
    if ($points === false) {
        $pdo->rollBack();
        not_found('Point value not found');
    }
    if ($enabled === 0 && $enabledIds === [$id]) {
        $pdo->rollBack();
        conflict("Cannot disable $points: it is the only enabled point value, and the board needs at least one.");
    }
    $stmt = $pdo->prepare('UPDATE point_values SET enabled = :enabled WHERE id = :id');
    $stmt->execute([':enabled' => $enabled, ':id' => $id]);
    $pdo->commit();

    foreach (list_points($pdo) as $row) {
        if ($row['id'] === $id) {
            json_response($row);
        }
    }
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        json_response(list_points(db()));
        break;

    case 'POST':
        require_admin();
        create_point_value(db(), read_json_body());
        break;

    case 'PUT':
        require_admin();
        $id = require_query_id();
        set_point_enabled(db(), $id, read_json_body());
        break;

    case 'DELETE':
        require_admin();
        $id = require_query_id();
        delete_point_value(db(), $id);
        break;

    default:
        method_not_allowed(['GET', 'POST', 'PUT', 'DELETE']);
}

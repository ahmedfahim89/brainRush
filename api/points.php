<?php
// GET    /api/points.php          -> [{ id, points, question_count }] ascending
// POST   /api/points.php          body { points } -> 201 created value
// DELETE /api/points.php?id=<id>  -> 200; 409 if questions still use it
require_once __DIR__ . '/db.php';

const MIN_POINTS = 1;
const MAX_POINTS = 1000000;

function list_points(PDO $pdo): array
{
    $rows = $pdo->query(
        'SELECT pv.id, pv.points, COUNT(q.id) AS question_count
           FROM point_values pv
           LEFT JOIN questions q ON q.points = pv.points
          GROUP BY pv.id, pv.points
          ORDER BY pv.points ASC'
    )->fetchAll();
    return array_map(fn(array $r): array => [
        'id'             => (int) $r['id'],
        'points'         => (int) $r['points'],
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
    json_response(['id' => (int) $pdo->lastInsertId(), 'points' => $points, 'question_count' => 0], 201);
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

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        json_response(list_points(db()));
        break;

    case 'POST':
        create_point_value(db(), read_json_body());
        break;

    case 'DELETE':
        $id = require_query_id();
        delete_point_value(db(), $id);
        break;

    default:
        method_not_allowed(['GET', 'POST', 'DELETE']);
}

<?php
// POST   /api/question-stats.php   body { question_id, outcome } -> 201 { question_id, outcome } (public)
// DELETE /api/question-stats.php   -> 200 { deleted: <rows removed> } (admin only: 401/403 otherwise)
// Other methods -> 405; without the question_stats table -> 503.
// Question difficulty stats (US-47, D-55). The POST is public: the game sends one outcome when a
// board question closes or a Streak question is answered (read_json_body() forces a CORS
// preflight). outcome is one of correct / wrong / nobody / timeout; the server adds 1 to that
// counter of the question (one row per question, created on its first outcome). Nothing else is
// stored: no name, no IP, no device id and no time. Accepted limitation (D-37 g): anyone can post
// counts, so the numbers can be faked; they are a hint for the admin, never used by the game.
// The Admin question list (GET api/questions.php) reads the counters; deleting a question deletes
// them (ON DELETE CASCADE). The DELETE is Admin's "Reset all stats" (change request after Sprint 11):
// it empties the table with DELETE FROM (not TRUNCATE, which needs the DDL privilege), so every
// question is back to 0 attempts.
require_once __DIR__ . '/db.php';

// The four outcomes of D-55, each a counter column of question_stats; only 'correct' is correct.
const STAT_OUTCOMES = ['correct', 'wrong', 'nobody', 'timeout'];
// Two first outcomes of one question at the same moment can deadlock InnoDB; such a send is retried.
const STAT_TRIES = 3;

/** Validate the body; returns [question id, outcome] or sends 400. */
function read_stat(array $body): array
{
    $questionId = parse_int($body['question_id'] ?? null);
    // INT UNSIGNED range: a larger id can't exist, and a strict sql_mode would reject it with a 500.
    if ($questionId === null || $questionId < 1 || $questionId > 4294967295) {
        bad_request('question_id must be a positive whole number');
    }
    $outcome = $body['outcome'] ?? null;
    if (!is_string($outcome) || !in_array($outcome, STAT_OUTCOMES, true)) {
        bad_request('outcome must be one of: ' . implode(', ', STAT_OUTCOMES));
    }
    return [$questionId, $outcome];
}

/**
 * Add 1 to the outcome's counter of the question: the row is created on the first outcome
 * (INSERT ... ON DUPLICATE KEY UPDATE). The SQL is fixed; the outcome only picks which bound
 * value is 1.
 */
function add_stat(PDO $pdo, int $questionId, string $outcome): void
{
    $params = [':question_id' => $questionId];
    foreach (STAT_OUTCOMES as $name) {
        $params[":$name"] = $name === $outcome ? 1 : 0;
    }
    for ($try = 1; ; $try++) {
        try {
            // Native prepares: a missing table already fails here, so this is inside the try too.
            $stmt = $pdo->prepare(
                'INSERT INTO question_stats (question_id, correct, wrong, nobody, timeout)
                 VALUES (:question_id, :correct, :wrong, :nobody, :timeout)
                 ON DUPLICATE KEY UPDATE
                   correct = correct + VALUES(correct), wrong = wrong + VALUES(wrong),
                   nobody = nobody + VALUES(nobody), timeout = timeout + VALUES(timeout)'
            );
            $stmt->execute($params);
            return;
        } catch (PDOException $e) {
            if (is_foreign_key_error($e)) {
                bad_request('This question does not exist (any more).');
            }
            if (is_missing_table($e)) {
                stats_unavailable();
            }
            // 1213 deadlock / 1205 lock wait timeout: the statement was rolled back, so it can run again.
            $code = (int) ($e->errorInfo[1] ?? 0);
            if ($try >= STAT_TRIES || !in_array($code, [1213, 1205], true)) {
                throw $e;
            }
        }
    }
}

/** 503 when the question_stats table is missing (sql/migrate-add-question-stats.sql not run yet). */
function stats_unavailable(): void
{
    error_log('BrainRush API: table question_stats is missing (run sql/migrate-add-question-stats.sql).');
    json_response(['error' => 'Question stats are not available right now.'], 503);
}

/** Remove every stats row (Admin "Reset all stats"); returns how many rows were removed. */
function reset_stats(PDO $pdo): int
{
    try {
        $stmt = $pdo->prepare('DELETE FROM question_stats');
        $stmt->execute();
        return $stmt->rowCount();
    } catch (PDOException $e) {
        if (is_missing_table($e)) {
            stats_unavailable();
        }
        throw $e;
    }
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        [$questionId, $outcome] = read_stat(read_json_body());
        add_stat(db(), $questionId, $outcome);
        json_response(['question_id' => $questionId, 'outcome' => $outcome], 201);
        break;

    case 'DELETE':
        require_admin();
        json_response(['deleted' => reset_stats(db())]);
        break;

    default:
        method_not_allowed(['POST', 'DELETE']);
}

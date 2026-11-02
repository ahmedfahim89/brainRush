<?php
// POST   /api/reports.php                    body { question_id, reason, note? } -> 201 { id }
// GET    /api/reports.php?all=1              -> open reports grouped by question (admin)
// PUT    /api/reports.php?question_id=<id>   -> Resolve: that question's open reports -> 'resolved' (admin)
// DELETE /api/reports.php?question_id=<id>   -> Dismiss: that question's open reports -> 'dismissed' (admin)
// Report a question (US-42, D-45). The POST is public: the game sends it from an open board
// question or an answered Streak question (read_json_body() forces a CORS preflight). A report
// stores only the question id, the reason, the note, the status and the time: no name, no IP,
// no device id and no hash of any of them. There is no rate limit by owner decision (D-45); the
// admin dismisses junk. Resolve and Dismiss keep the rows (status changes), so a question's
// history stays; deleting the question deletes its reports (ON DELETE CASCADE).
require_once __DIR__ . '/db.php';

// The six reasons of D-45, in the game's order; same values as the ENUM in sql/schema.sql.
const REPORT_REASONS = ['wrong_answer', 'typo', 'translation', 'outdated', 'picture', 'other'];
const REPORT_NOTE_MAX = 200; // REPORT_NOTE_MAX in js/game.js, VARCHAR(200) in the table

/** MySQL error 1146: the table does not exist (the migration has not run on this database). */
function is_missing_table(PDOException $e): bool
{
    return $e->getCode() === '42S02' && (int) ($e->errorInfo[1] ?? 0) === 1146;
}

/** Run a reports query; a database without question_reports gives a clear 503 instead of a 500. */
function with_reports_table(callable $action, string $missingMessage)
{
    try {
        return $action();
    } catch (PDOException $e) {
        if (is_missing_table($e)) {
            error_log('BrainRush API: table question_reports is missing (run sql/migrate-add-question-reports.sql).');
            json_response(['error' => $missingMessage], 503);
        }
        throw $e;
    }
}

/** The optional note: control characters (newlines, tabs) become spaces, trimmed, at most 200 characters. */
function report_note($value): string
{
    if ($value === null) {
        return '';
    }
    if (!is_string($value)) {
        bad_request('note must be text');
    }
    $note = trim((string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value));
    if (text_length($note) > REPORT_NOTE_MAX) {
        bad_request('note must be at most ' . REPORT_NOTE_MAX . ' characters');
    }
    return $note;
}

/** Validate and store one report; returns its id. */
function save_report(PDO $pdo, array $body): int
{
    $questionId = parse_int($body['question_id'] ?? null);
    // INT UNSIGNED range: a larger id can't exist, and a strict sql_mode would reject it with a 500.
    if ($questionId === null || $questionId < 1 || $questionId > 4294967295) {
        bad_request('question_id must be a positive whole number');
    }
    $reason = $body['reason'] ?? null;
    if (!is_string($reason) || !in_array($reason, REPORT_REASONS, true)) {
        bad_request('reason must be one of: ' . implode(', ', REPORT_REASONS));
    }
    $note = report_note($body['note'] ?? null);

    $stmt = $pdo->prepare('INSERT INTO question_reports (question_id, reason, note) VALUES (:question_id, :reason, :note)');
    try {
        $stmt->execute([':question_id' => $questionId, ':reason' => $reason, ':note' => $note]);
    } catch (PDOException $e) {
        if (is_foreign_key_error($e)) {
            bad_request('This question does not exist (any more).');
        }
        throw $e;
    }
    return (int) $pdo->lastInsertId();
}

/**
 * Open reports grouped by question, the question with the most open reports first (then the most
 * recent report): [{ question: {id, category_id, category_name, points, question, answer, image},
 * count, reasons: {reason: count}, reports: [{id, reason, note, created_at}] newest first, last_at }].
 */
function open_reports(PDO $pdo): array
{
    $rows = $pdo->query(
        "SELECT r.id, r.question_id, r.reason, r.note, r.created_at,
                q.category_id, c.name AS category_name, q.points, q.question, q.answer, q.image
           FROM question_reports r
           JOIN questions q ON q.id = r.question_id
           JOIN categories c ON c.id = q.category_id
          WHERE r.status = 'open'
          ORDER BY r.created_at DESC, r.id DESC"
    )->fetchAll();

    $groups = [];
    foreach ($rows as $r) {
        $id = (int) $r['question_id'];
        if (!isset($groups[$id])) {
            $groups[$id] = [
                'question' => [
                    'id'            => $id,
                    'category_id'   => (int) $r['category_id'],
                    'category_name' => $r['category_name'],
                    'points'        => (int) $r['points'],
                    'question'      => $r['question'],
                    'answer'        => $r['answer'],
                    'image'         => $r['image'] === '' ? null : $r['image'],
                ],
                'count'   => 0,
                'reasons' => [],
                'reports' => [],
                'last_at' => (string) $r['created_at'], // rows come newest first
            ];
        }
        $group = &$groups[$id];
        $group['count']++;
        $group['reasons'][$r['reason']] = ($group['reasons'][$r['reason']] ?? 0) + 1;
        $group['reports'][] = [
            'id'         => (int) $r['id'],
            'reason'     => $r['reason'],
            'note'       => $r['note'],
            'created_at' => (string) $r['created_at'],
        ];
        unset($group);
    }

    $list = array_values($groups);
    usort($list, fn(array $a, array $b): int =>
        [$b['count'], $b['last_at']] <=> [$a['count'], $a['last_at']]);
    // reasons as a JSON object even when empty (never happens: every group has 1+ report)
    return array_map(function (array $g): array {
        $g['reasons'] = (object) $g['reasons'];
        return $g;
    }, $list);
}

/** Resolve or Dismiss every open report of one question; 404 when it has none. */
function close_reports(PDO $pdo, int $questionId, string $status): void
{
    $stmt = $pdo->prepare(
        "UPDATE question_reports SET status = :status WHERE question_id = :question_id AND status = 'open'"
    );
    $stmt->execute([':status' => $status, ':question_id' => $questionId]);
    if ($stmt->rowCount() === 0) {
        not_found('This question has no open reports.');
    }
    json_response(['question_id' => $questionId, 'status' => $status, 'updated' => $stmt->rowCount()]);
}

const REPORTS_MISSING_ADMIN = 'Reports are not set up on this database yet: run sql/migrate-add-question-reports.sql.';

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        require_admin();
        if (($_GET['all'] ?? '') !== '1') {
            bad_request("Use GET ?all=1 to list the open reports");
        }
        json_response(with_reports_table(fn() => open_reports(db()), REPORTS_MISSING_ADMIN));
        break;

    case 'POST':
        $body = read_json_body();
        $id = with_reports_table(fn() => save_report(db(), $body), 'Reports are not available right now. Please try again later.');
        json_response(['id' => $id], 201);
        break;

    case 'PUT':
        require_admin();
        $questionId = require_query_id('question_id');
        with_reports_table(fn() => close_reports(db(), $questionId, 'resolved'), REPORTS_MISSING_ADMIN);
        break;

    case 'DELETE':
        require_admin();
        $questionId = require_query_id('question_id');
        with_reports_table(fn() => close_reports(db(), $questionId, 'dismissed'), REPORTS_MISSING_ADMIN);
        break;

    default:
        method_not_allowed(['GET', 'POST', 'PUT', 'DELETE']);
}

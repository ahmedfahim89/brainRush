<?php
// GET    /api/streaks.php          -> top 10 [{name, streak, date: 'YYYY-MM-DD'}]
// POST   /api/streaks.php          body { name, streak } -> 201 { rank, best }
// GET    /api/streaks.php?all=1    -> every run [{id, name, streak, created_at}], newest first
// DELETE /api/streaks.php?id=<id>  -> 200 { deleted: id }
// Streak Challenge leaderboard (US-33, US-34, D-37). Every finished run with a streak of 1 or
// more is stored; the top 10 shows the best run per person (the challenger name, compared
// case-insensitively by the table's _ci collation): the highest streak, and on equal streaks
// the earliest run. The top 10 and the POST are public, the game uses them (read_json_body()
// forces a CORS preflight); the full list and DELETE are admin only (require_admin), so the
// admin can remove junk or offensive names. Accepted limitation (D-37): the answers are in the
// question payload and the POST is public, so a determined user can fake a score.
require_once __DIR__ . '/db.php';

const STREAK_NAME_MAX = 30;  // NAME_MAX in js/game.js (D-22)
const STREAK_MAX = 100000;
const STREAK_TOP = 10;

// Best run per person: ROW_NUMBER() 1 = the highest streak, the earliest run on a tie.
// PARTITION BY compares with the column collation, so "ahmed fahim" and "Ahmed Fahim" are one person.
const STREAK_BEST_RUNS =
    'SELECT id, name, streak, created_at
       FROM (SELECT id, name, streak, created_at,
                    ROW_NUMBER() OVER (PARTITION BY name
                                       ORDER BY streak DESC, created_at ASC, id ASC) AS run_order
               FROM streaks) runs
      WHERE run_order = 1';

/** Top 10 people by their best run; on equal streaks the earlier run ranks higher. */
function top_streaks(PDO $pdo): array
{
    $rows = $pdo->query(STREAK_BEST_RUNS . ' ORDER BY streak DESC, created_at ASC, id ASC LIMIT ' . STREAK_TOP)->fetchAll();
    return array_map(fn(array $r): array => [
        'name'   => $r['name'],
        'streak' => (int) $r['streak'],
        'date'   => substr((string) $r['created_at'], 0, 10),
    ], $rows);
}

/** Every saved run for the admin list, newest first. */
function all_streaks(PDO $pdo): array
{
    $rows = $pdo->query('SELECT id, name, streak, created_at FROM streaks ORDER BY created_at DESC, id DESC')->fetchAll();
    return array_map(fn(array $r): array => [
        'id'         => (int) $r['id'],
        'name'       => $r['name'],
        'streak'     => (int) $r['streak'],
        'created_at' => (string) $r['created_at'],
    ], $rows);
}

/** The challenger name: control characters (newlines, tabs) become spaces, then 1-30 characters. */
function streak_name($value): string
{
    if (is_string($value)) {
        $value = (string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value);
        $value = (string) preg_replace('/ {2,}/', ' ', $value);
    }
    return require_text($value, 'Challenger name', STREAK_NAME_MAX);
}

/** Store one run; returns { rank, best }: the person's place among the best runs and their best streak. */
function save_streak(PDO $pdo, array $body): array
{
    $name = streak_name($body['name'] ?? null);
    $streak = parse_int($body['streak'] ?? null);
    if ($streak === null || $streak < 1 || $streak > STREAK_MAX) {
        bad_request('streak must be a whole number from 1 to ' . STREAK_MAX);
    }

    $stmt = $pdo->prepare('INSERT INTO streaks (name, streak) VALUES (:name, :streak)');
    $stmt->execute([':name' => $name, ':streak' => $streak]);

    // This person's best run (the one just saved, or an earlier better or equal one).
    $stmt = $pdo->prepare(
        'SELECT id, streak, created_at FROM streaks
          WHERE name = :name
          ORDER BY streak DESC, created_at ASC, id ASC LIMIT 1'
    );
    $stmt->execute([':name' => $name]);
    $best = $stmt->fetch();

    // Rank = 1 + the people whose best run ranks above it (same order as the top 10).
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM (' . STREAK_BEST_RUNS . ') best
          WHERE best.streak > :streak
             OR (best.streak = :same_streak
                 AND (best.created_at < :created OR (best.created_at = :same_created AND best.id < :id)))'
    );
    $stmt->execute([
        ':streak'       => $best['streak'],
        ':same_streak'  => $best['streak'],
        ':created'      => $best['created_at'],
        ':same_created' => $best['created_at'],
        ':id'           => $best['id'],
    ]);
    return ['rank' => (int) $stmt->fetchColumn() + 1, 'best' => (int) $best['streak']];
}

function delete_streak(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare('DELETE FROM streaks WHERE id = :id');
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) {
        not_found('Streak run not found');
    }
    json_response(['deleted' => $id]);
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (($_GET['all'] ?? '') === '1') {
            require_admin();
            json_response(all_streaks(db()));
        }
        json_response(top_streaks(db()));
        break;

    case 'POST':
        $body = read_json_body();
        json_response(save_streak(db(), $body), 201);
        break;

    case 'DELETE':
        require_admin();
        $id = require_query_id();
        delete_streak(db(), $id);
        break;

    default:
        method_not_allowed(['GET', 'POST', 'DELETE']);
}

<?php
// GET    /api/streaks.php              -> top 10 of all time [{name, streak, date: 'YYYY-MM-DD'}]
// GET    /api/streaks.php?period=week  -> top 10 of this week (Monday to Sunday, UTC as D-46), same shape
// GET    /api/streaks.php?period=all   -> the same as without period; any other period -> 400
// POST   /api/streaks.php              body { name, streak } -> 201 { rank, best, week_rank, week_best }
// GET    /api/streaks.php?all=1        -> every run [{id, name, streak, created_at}], newest first
// DELETE /api/streaks.php?id=<id>      -> 200 { deleted: id }
// Streak Challenge leaderboard (US-33, US-34, US-45, D-37). Every finished run with a streak of 1 or
// more is stored; a top 10 shows the best run per person (the challenger name, compared
// case-insensitively by the table's _ci collation): the highest streak, and on equal streaks
// the earliest run. The weekly top 10 only looks at the runs of the current game week
// (game_week_bounds() in db.php, GAME_TIME_ZONE). The top 10 and the POST are public, the game uses
// them (read_json_body() forces a CORS preflight); the full list and DELETE are admin only
// (require_admin), so the admin can remove junk or offensive names. Accepted limitation (D-37): the
// answers are in the question payload and the POST is public, so a determined user can fake a score.
require_once __DIR__ . '/db.php';

const STREAK_NAME_MAX = 30;  // NAME_MAX in js/game.js (D-22)
const STREAK_MAX = 100000;
const STREAK_TOP = 10;
const STREAK_PERIODS = ['all', 'week']; // GET ?period= (US-45); no period means 'all'

/**
 * Best run per person, as [sql, params]: ROW_NUMBER() 1 = the highest streak, the earliest run on
 * a tie. PARTITION BY compares with the column collation, so "ahmed fahim" and "Ahmed Fahim" are one
 * person. With $week ([from, to) as Unix times) only the runs of that week count. created_at is
 * stored in the database session's time zone, which FROM_UNIXTIME() also uses, so the bounds match.
 */
function best_runs(?array $week): array
{
    $where = $week ? ' WHERE created_at >= FROM_UNIXTIME(:week_from) AND created_at < FROM_UNIXTIME(:week_to)' : '';
    $sql = 'SELECT id, name, streak, created_at, UNIX_TIMESTAMP(created_at) AS created_ts
              FROM (SELECT id, name, streak, created_at,
                           ROW_NUMBER() OVER (PARTITION BY name
                                              ORDER BY streak DESC, created_at ASC, id ASC) AS run_order
                      FROM streaks' . $where . ') runs
             WHERE run_order = 1';
    return [$sql, $week ? [':week_from' => $week[0], ':week_to' => $week[1]] : []];
}

/** [from, to) of the current game week as Unix times (US-45, D-46). */
function current_week(): array
{
    [$from, $to] = game_week_bounds(game_now());
    return [$from->getTimestamp(), $to->getTimestamp()];
}

/**
 * Top 10 people by their best run (of all time, or of $week); on equal streaks the earlier run ranks
 * higher. `date` is the run's date in GAME_TIME_ZONE (UTC, D-46), so a run counted in "This week"
 * always shows a date inside that week, whatever the database's time zone. UNIX_TIMESTAMP() reads
 * created_at in the session time zone it was stored in. The ranking itself is unchanged (D-37).
 */
function top_streaks(PDO $pdo, ?array $week): array
{
    [$sql, $params] = best_runs($week);
    $stmt = $pdo->prepare($sql . ' ORDER BY streak DESC, created_at ASC, id ASC LIMIT ' . STREAK_TOP);
    $stmt->execute($params);
    return array_map(fn(array $r): array => [
        'name'   => $r['name'],
        'streak' => (int) $r['streak'],
        'date'   => game_date((int) $r['created_ts']),
    ], $stmt->fetchAll());
}

/** The ?period= of a public GET: 'all' (also when absent) or 'week'; 400 for anything else. */
function read_period(): string
{
    $period = $_GET['period'] ?? 'all';
    if (!is_string($period) || !in_array($period, STREAK_PERIODS, true)) {
        bad_request('period must be one of: ' . implode(', ', STREAK_PERIODS));
    }
    return $period;
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

/**
 * This person's place among the best runs (of all time, or of $week) and their best streak there,
 * as [rank, best]; null when they have no run in that period.
 */
function person_rank(PDO $pdo, string $name, ?array $week): ?array
{
    // This person's best run in the period (the one just saved, or an earlier better or equal one).
    $where = $week ? ' AND created_at >= FROM_UNIXTIME(:week_from) AND created_at < FROM_UNIXTIME(:week_to)' : '';
    $stmt = $pdo->prepare(
        'SELECT id, streak, created_at FROM streaks
          WHERE name = :name' . $where . '
          ORDER BY streak DESC, created_at ASC, id ASC LIMIT 1'
    );
    $stmt->execute([':name' => $name] + ($week ? [':week_from' => $week[0], ':week_to' => $week[1]] : []));
    $best = $stmt->fetch();
    if (!$best) {
        return null;
    }

    // Rank = 1 + the people whose best run ranks above it (same order as the top 10).
    [$sql, $params] = best_runs($week);
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM (' . $sql . ') best
          WHERE best.streak > :streak
             OR (best.streak = :same_streak
                 AND (best.created_at < :created OR (best.created_at = :same_created AND best.id < :id)))'
    );
    $stmt->execute($params + [
        ':streak'       => $best['streak'],
        ':same_streak'  => $best['streak'],
        ':created'      => $best['created_at'],
        ':same_created' => $best['created_at'],
        ':id'           => $best['id'],
    ]);
    return [(int) $stmt->fetchColumn() + 1, (int) $best['streak']];
}

/**
 * Store one run; returns { rank, best, week_rank, week_best }: the person's place and best streak
 * of all time and of this week (US-45). The week values are null only if the run fell outside the
 * week the server computed (a run saved on the stroke of Monday 00:00 UTC).
 */
function save_streak(PDO $pdo, array $body): array
{
    $name = streak_name($body['name'] ?? null);
    $streak = parse_int($body['streak'] ?? null);
    if ($streak === null || $streak < 1 || $streak > STREAK_MAX) {
        bad_request('streak must be a whole number from 1 to ' . STREAK_MAX);
    }

    $stmt = $pdo->prepare('INSERT INTO streaks (name, streak) VALUES (:name, :streak)');
    $stmt->execute([':name' => $name, ':streak' => $streak]);

    [$rank, $best] = person_rank($pdo, $name, null);
    $week = person_rank($pdo, $name, current_week());
    return ['rank' => $rank, 'best' => $best, 'week_rank' => $week[0] ?? null, 'week_best' => $week[1] ?? null];
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
        $period = read_period();
        json_response(top_streaks(db(), $period === 'week' ? current_week() : null));
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

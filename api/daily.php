<?php
// GET /api/daily.php -> { date: 'YYYY-MM-DD', number, seconds_to_next, questions: [question, ...] }
// Daily Challenge (US-43, D-46): the same DAILY_QUESTIONS questions for everyone on a day. The day
// is the date in GAME_TIME_ZONE (UTC, set in api/db.php). The first request of a day picks the
// questions and stores them in `daily_challenge` with INSERT IGNORE on the (date, position) primary
// key, then reads the set back, so two simultaneous first requests still give one set. A question is
// shaped as the Streak Challenge plays it (streak_question() in api/questions.php): its 3 choices,
// cut at the first bracket, come in an order that is the same for everyone on that day.
// number = days since DAILY_LAUNCH_DATE (live #1) + 1, the same on every database (FU-30).
// seconds_to_next = seconds until the next set (the next midnight in GAME_TIME_ZONE).
// Public and read-only for the player: the answers are in the payload, as in the Streak Challenge
// (D-37 g), and the result stays in the player's browser (a device-only lock, US-43).
// Errors are generic; a database without the table only breaks this endpoint (503).
require_once __DIR__ . '/db.php';
const QUESTIONS_INCLUDE_ONLY = true; // questions.php: define its functions, handle no request
require_once __DIR__ . '/questions.php';

const DAILY_QUESTIONS = 3;  // D-46: questions per Daily Challenge; the only place this count is set
const DAILY_LAUNCH_DATE = '2026-11-02'; // FU-30: the UTC date of live Daily #1; #N counts from it
const DAILY_PICK_TRIES = 3; // rounds of "fill the missing positions, read back" before giving up
const DAILY_UNAVAILABLE = 'The Daily Challenge is not available right now. Please try again later.';

const DAILY_SET_SELECT =
    'SELECT d.position, c.name AS category_name, c.name_ar AS category_name_ar,
            q.id, q.category_id, q.points, q.question, q.answer, q.question_ar, q.answer_ar,
            q.image, q.image_credit, q.wrong_1, q.wrong_2, q.wrong_1_ar, q.wrong_2_ar
       FROM daily_challenge d
       JOIN questions q ON q.id = d.question_id
       JOIN categories c ON c.id = q.category_id
      WHERE d.challenge_date = :date AND d.position <= :count
      ORDER BY d.position ASC';

/** The stored set of a day: position => question row (with category_name). */
function daily_set(PDO $pdo, string $date): array
{
    $stmt = $pdo->prepare(DAILY_SET_SELECT);
    $stmt->execute([':date' => $date, ':count' => DAILY_QUESTIONS]);
    $set = [];
    foreach ($stmt->fetchAll() as $r) {
        $set[(int) $r['position']] = $r;
    }
    return $set;
}

/**
 * Every question at an enabled point value, with the pools streak_choices() borrows wrong choices
 * from (same kind and category, then same kind): { rows: [row], pools: { kind: { all, byCategory } } }.
 * Loaded once per request, and only when a choice must be borrowed or a set must be picked.
 */
function daily_bank(PDO $pdo): array
{
    static $bank = null;
    if ($bank !== null) {
        return $bank;
    }
    $rows = $pdo->query(
        'SELECT ' . CELL_COLUMNS . ' FROM questions
          WHERE points IN (SELECT points FROM point_values WHERE enabled = 1) ORDER BY id ASC'
    )->fetchAll();
    $pools = [];
    foreach ($rows as $r) {
        $kind = question_kind($r);
        $pools[$kind]['all'][] = $r;
        $pools[$kind]['byCategory'][(int) $r['category_id']][] = $r;
    }
    $bank = ['rows' => $rows, 'pools' => $pools];
    return $bank;
}

function question_kind(array $r): string
{
    return $r['image'] === '' ? 'text' : 'picture';
}

/** The pools streak_choices() borrows from for this question: same category and kind, then same kind. */
function borrow_pools(PDO $pdo, array $r): array
{
    $kind = daily_bank($pdo)['pools'][question_kind($r)] ?? ['all' => [], 'byCategory' => []];
    return [$kind['byCategory'][(int) $r['category_id']] ?? [], $kind['all']];
}

/** The question's stored wrong options make 3 choices (and in Arabic too when it has Arabic). */
function has_stored_choices(array $r): bool
{
    $arabic = has_arabic($r);
    return stored_choices($r, $arabic, streak_choice($r['answer'], $arabic ? $r['answer_ar'] : null)) !== null;
}

/**
 * Ids for $count missing positions of a day, easiest first (by points). Random questions at enabled
 * point values that are not in the set yet and can get 3 choices. Preferred, in this order: stored
 * wrong options (their choices are the same for everyone), not used by an earlier Daily Challenge,
 * and a category the set doesn't have yet.
 */
function pick_daily_ids(PDO $pdo, array $set, int $count): array
{
    $used = array_flip(array_map('intval', $pdo->query('SELECT DISTINCT question_id FROM daily_challenge')->fetchAll(PDO::FETCH_COLUMN)));
    $taken = [];
    $categories = [];
    foreach ($set as $r) {
        $taken[(int) $r['id']] = true;
        $categories[(int) $r['category_id']] = true;
    }
    $candidates = [];
    foreach (shuffled(daily_bank($pdo)['rows']) as $r) {
        if (isset($taken[(int) $r['id']])) {
            continue;
        }
        $stored = has_stored_choices($r);
        $rank = ($stored ? 0 : 2) + (isset($used[(int) $r['id']]) ? 1 : 0);
        $candidates[] = ['rank' => $rank, 'row' => $r];
    }
    usort($candidates, fn(array $a, array $b): int => $a['rank'] <=> $b['rank']); // stable in PHP 8

    $picked = [];
    // First round: one question per category not in the set yet; second round: any category.
    foreach ([true, false] as $newCategoryOnly) {
        foreach ($candidates as $i => $candidate) {
            if (count($picked) === $count) {
                break 2;
            }
            $r = $candidate['row'];
            $category = (int) $r['category_id'];
            if ($newCategoryOnly && isset($categories[$category])) {
                continue;
            }
            if ($candidate['rank'] >= 2 && streak_choices($r, borrow_pools($pdo, $r)) === null) {
                continue; // cannot get 2 wrong choices
            }
            $picked[] = $r;
            $categories[$category] = true;
            unset($candidates[$i]);
        }
    }
    usort($picked, fn(array $a, array $b): int => (int) $a['points'] <=> (int) $b['points']);
    return array_map(fn(array $r): int => (int) $r['id'], $picked);
}

/** Store the picked ids at the given positions; rows that lost a race (or a deleted question) are ignored. */
function store_daily_ids(PDO $pdo, string $date, array $positions, array $ids): void
{
    $values = [];
    $params = [];
    foreach ($ids as $i => $id) {
        $values[] = '(?, ?, ?)';
        array_push($params, $date, $positions[$i], $id);
    }
    $pdo->prepare(
        'INSERT IGNORE INTO daily_challenge (challenge_date, position, question_id) VALUES ' . implode(', ', $values)
    )->execute($params);
}

/** The day's set, created on the first request: fills missing positions, then reads the set back. */
function ensure_daily_set(PDO $pdo, string $date): array
{
    $set = daily_set($pdo, $date);
    for ($try = 0; count($set) < DAILY_QUESTIONS && $try < DAILY_PICK_TRIES; $try++) {
        $missing = array_values(array_diff(range(1, DAILY_QUESTIONS), array_keys($set)));
        $ids = pick_daily_ids($pdo, $set, count($missing));
        if (!$ids) {
            break;
        }
        store_daily_ids($pdo, $date, array_slice($missing, 0, count($ids)), $ids);
        $set = daily_set($pdo, $date);
    }
    return $set;
}

/**
 * 3 choices as streak_choices() makes them, in an order that is the same for everyone on that day
 * (sorted by a hash of the date, the question and the choice), so friends compare the same A/B/C.
 * Null when the question cannot get 2 wrong choices.
 */
function daily_choices(PDO $pdo, array $r, string $date): ?array
{
    $arabic = has_arabic($r);
    $right = streak_choice($r['answer'], $arabic ? $r['answer_ar'] : null);
    $wrong = stored_choices($r, $arabic, $right) ?? borrow_choices($r, $arabic, $right, borrow_pools($pdo, $r));
    if ($wrong === null) {
        return null;
    }
    $all = [$right, $wrong[0], $wrong[1]];
    $key = fn(int $i): string => md5($date . '|' . $r['id'] . '|' . $i);
    $order = [0, 1, 2];
    usort($order, fn(int $a, int $b): int => strcmp($key($a), $key($b)));
    return [
        'choices' => array_map(fn(int $i): array => $all[$i], $order),
        'correct' => array_search(0, $order, true),
    ];
}

/**
 * #N of a day: days since DAILY_LAUNCH_DATE, plus 1, so every database gives the same number for a
 * date and deleting rows never shifts it (FU-30). A day before the launch date is #1.
 */
function daily_number(string $date): int
{
    $utc = new DateTimeZone('UTC');
    $launch = new DateTimeImmutable(DAILY_LAUNCH_DATE, $utc);
    $day = new DateTimeImmutable($date, $utc);
    $days = (int) $launch->diff($day)->format('%r%a');
    return max(0, $days) + 1;
}

/** The payload for the game day that holds $now; 503 when no full set can be made. */
function daily_challenge(PDO $pdo, DateTimeImmutable $now): array
{
    [$dayStart, $dayEnd] = game_day_bounds($now);
    $date = $dayStart->format('Y-m-d');
    $set = ensure_daily_set($pdo, $date);
    if (count($set) < DAILY_QUESTIONS) {
        error_log("BrainRush API: no full Daily Challenge set for $date (too few questions with 3 choices).");
        json_response(['error' => DAILY_UNAVAILABLE], 503);
    }
    $questions = [];
    foreach ($set as $r) {
        $choices = daily_choices($pdo, $r, $date);
        if ($choices === null) {
            error_log("BrainRush API: Daily Challenge question {$r['id']} has no 3 choices any more.");
            json_response(['error' => DAILY_UNAVAILABLE], 503);
        }
        $questions[] = streak_question($r, $r['category_name'], $choices, $r['category_name_ar']);
    }
    return [
        'date'            => $date,
        'number'          => daily_number($date),
        'seconds_to_next' => max(1, $dayEnd->getTimestamp() - $now->getTimestamp()),
        'questions'       => $questions,
    ];
}

// Included for its functions only (a test script may call daily_challenge() with another day).
if (defined('DAILY_INCLUDE_ONLY')) {
    return;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    method_not_allowed(['GET']);
}
try {
    json_response(daily_challenge(db(), game_now()));
} catch (PDOException $e) {
    // 1146: daily_challenge is missing (sql/migrate-add-daily-challenge.sql not run yet).
    if ((int) ($e->errorInfo[1] ?? 0) === 1146) {
        error_log('BrainRush API: table daily_challenge is missing (run sql/migrate-add-daily-challenge.sql).');
        json_response(['error' => DAILY_UNAVAILABLE], 503);
    }
    throw $e;
}

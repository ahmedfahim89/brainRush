<?php
// POST   /api/integration-quiz.php?batch=1       body { exclude?: [id, ...] }
//                                                  -> { questions: [question, ...] }, up to 20; [] if none left
// GET    /api/integration-quiz.php               -> top 10 of all time [{name, streak, date: 'YYYY-MM-DD'}]
// GET    /api/integration-quiz.php?period=week   -> top 10 of this week (Monday to Sunday, UTC), same shape
// GET    /api/integration-quiz.php?period=all    -> the same as without period; any other period -> 400
// POST   /api/integration-quiz.php               body { name, streak } -> 201 { rank, best, week_rank, week_best }
// GET    /api/integration-quiz.php?all=1         -> every run [{id, name, streak, created_at}], newest first
// DELETE /api/integration-quiz.php?id=<id>       -> 200 { deleted: id }
// Integration Quiz (integration-quiz.html, owner request 2026-11-10): a team quiz on software
// integration and APIs that plays like the Streak Challenge, with its own questions
// (integration_questions, loaded by SQL file only) and its own leaderboard (integration_scores).
// A question has the Streak question shape (streak_question() in questions.php) with the fixed
// category label INTEGRATION_LABEL, 1 point and no Arabic or picture, so js/game.js plays it as a
// Streak question. Its ids are their own id space: the game keeps them out of the played list,
// the question stats and reports of the public bank.
// The leaderboard is the Streak Challenge's (api/streaks.php) on another table: the same contract,
// rules and admin-only list and DELETE (require_admin). The batch and the top 10 are public, the
// quiz page uses them. Like the Streak Challenge (D-37) the answers are in the payload and the POST
// is public, so a determined user can fake a score; the admin deletes junk names.
const QUESTIONS_INCLUDE_ONLY = true; // questions.php: define its functions, handle no request
const STREAKS_INCLUDE_ONLY = true;   // streaks.php: the same
require_once __DIR__ . '/questions.php';
require_once __DIR__ . '/streaks.php';

const INTEGRATION_LABEL = 'Integration Quiz';
const INTEGRATION_SCORES = 'integration_scores';

/**
 * Up to STREAK_BATCH enabled questions that are not in $exclude (the run's questions so far), in
 * random order. Each gets its answer and 2 wrong options as 3 shuffled choices, cut like the
 * Streak's (choice_text()); a question whose choices look the same is skipped.
 */
function integration_batch(PDO $pdo, array $exclude): array
{
    $excluded = array_flip($exclude);
    $rows = $pdo->query(
        'SELECT id, question, answer, wrong_1, wrong_2 FROM integration_questions WHERE enabled = 1'
    )->fetchAll();

    $batch = [];
    foreach (shuffled($rows) as $r) {
        if (count($batch) >= STREAK_BATCH) {
            break;
        }
        if (isset($excluded[(int) $r['id']])) {
            continue;
        }
        $choices = integration_choices($r);
        if ($choices !== null) {
            $batch[] = integration_question($r, $choices);
        }
    }
    return $batch;
}

/**
 * { choices: [{text, text_ar: null}] x3 in random order, correct }, or null when the question or a
 * choice is empty or two choices clash (rows come from SQL files, which nothing checks on import).
 */
function integration_choices(array $r): ?array
{
    $all = [
        streak_choice($r['answer'], null),
        streak_choice($r['wrong_1'], null),
        streak_choice($r['wrong_2'], null),
    ];
    $empty = trim($r['question']) === '' || in_array('', array_column($all, 'text'), true);
    if ($empty || choices_clash($all[0], $all[1]) || choices_clash($all[0], $all[2]) || choices_clash($all[1], $all[2])) {
        return null;
    }
    $order = shuffled([0, 1, 2]);
    return [
        'choices' => array_map(fn(int $i): array => $all[$i], $order),
        'correct' => array_search(0, $order, true),
    ];
}

/** A quiz question in the Streak question shape (streak_question()). */
function integration_question(array $r, array $choices): array
{
    return [
        'id'               => (int) $r['id'],
        'category_name'    => INTEGRATION_LABEL,
        'category_name_ar' => null,
        'points'           => 1,
        'question'         => $r['question'],
        'question_ar'      => null,
        'image'            => null,
        'image_credit'     => null,
        'choices'          => $choices['choices'],
        'correct'          => $choices['correct'],
    ];
}

/** Run $action; a missing table (the migration has not run) becomes a clear 503. */
function with_quiz_tables(callable $action): void
{
    try {
        $action();
    } catch (PDOException $e) {
        if (is_missing_table($e)) {
            error_log('BrainRush API: an Integration Quiz table is missing (run sql/migrate-add-integration-quiz.sql).');
            json_response(['error' => 'The Integration Quiz is not set up on this server yet.'], 503);
        }
        throw $e;
    }
}

with_quiz_tables(function (): void {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_GET['batch'] ?? '') === '1') {
        $body = read_json_body();
        $exclude = parse_seen_ids($body['exclude'] ?? null, 'exclude');
        json_response(['questions' => integration_batch(db(), $exclude)]);
    }
    streak_board_request(INTEGRATION_SCORES);
});

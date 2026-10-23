<?php
// GET    /api/questions.php                          -> all questions
// GET    /api/questions.php?category_id=<id>         -> one category's questions
// GET    /api/questions.php?board=1&categories=3,1,2 -> board payload (requested order)
// POST   /api/questions.php?board=1                  body { categories: "3,1,2", seen?: [id, ...] }
//                                                          -> board payload that avoids seen questions
// POST   /api/questions.php?played=1                 body { categories: "3,1,2", seen?: [id, ...] }
//                                                          -> { played, total } for the setup progress bar
// POST   /api/questions.php?random=1                 body { exclude?: [id, ...], seen?: [id, ...] }
//                                                          -> { category: {id, name}, points, question }
//                                                          for the Swap helper (US-32); 409 if none left
// POST   /api/questions.php?streak=1                 body { exclude?: [id, ...], seen?: [id, ...] }
//                                                          -> { questions: [streak_question(), ...] }, up to
//                                                          20 for the Streak Challenge (US-33); [] if none left
// POST   /api/questions.php                          body { category_id, points, question, answer,
//                                                          question_ar?, answer_ar?, image?,
//                                                          image_credit?, wrong_1?, wrong_2?,
//                                                          wrong_1_ar?, wrong_2_ar? } -> 201
// PUT    /api/questions.php?id=<id>                  body: any of the POST fields -> 200
// DELETE /api/questions.php?id=<id>                  -> 200
// The full list (first two GETs) and all writes need admin access (require_admin: 401/403
// otherwise); only the board payload (GET or POST), the played count, the random question and
// the streak batch are public, they are what the game plays from.
//
// Question bank (D-31 amended): every question has a category and a point value, and a
// category may have any number of questions per point value. The board draws one
// random question per cell (category x point value) (US-30). The game sends the ids this
// browser already played (`seen`, oldest first): a cell draws from its unseen questions,
// and once all of them were played it takes the one played longest ago.
require_once __DIR__ . '/db.php';

const QUESTION_TEXT_MAX = 5000;
const BOARD_MAX_CATEGORIES = 50;
const BOARD_MAX_SEEN = 5000; // SEEN_MAX in js/game.js
const IMAGE_PATH_MAX = 255;
// Picture questions: a file in the repo under img/questions/. Only this shape is
// accepted, which blocks path traversal, other folders and external URLs.
const IMAGE_PATH_PATTERN = '/^img\/questions\/[a-z0-9][a-z0-9-]*\.(svg|jpg|jpeg|png|webp)$/D';

// Photo credit shown as a one-line caption under the picture, e.g. "Jane Doe / CC BY-SA 4.0".
const IMAGE_CREDIT_MAX = 255;

// "3 choices" helper (US-32): two wrong options per language, NULL = none yet.
const WRONG_OPTION_MAX = 255;

// Streak Challenge (US-33): questions per batch; the game asks for more when it runs low.
const STREAK_BATCH = 20;

/**
 * A text as the game shows it as a choice (choiceText() in js/game.js): cut at its first
 * bracket, English at " (" and Arabic at "(" with or without a space, so "Three (triplets)"
 * and "Pompeii (accept Herculaneum)" show as "Three" and "Pompeii".
 */
function choice_text(string $text, bool $arabic): string
{
    $at = strpos($text, $arabic ? '(' : ' (');
    $shown = trim($at === false ? $text : substr($text, 0, $at));
    return $shown === '' ? trim($text) : $shown;
}

/** Stored '' means "no picture" (or "no credit"); the JSON uses null for that. */
function image_or_null(string $image): ?string
{
    return $image === '' ? null : $image;
}

const QUESTION_SELECT =
    'SELECT q.id, q.category_id, c.name AS category_name, q.points, q.question, q.answer,
           q.question_ar, q.answer_ar, q.image, q.image_credit,
           q.wrong_1, q.wrong_2, q.wrong_1_ar, q.wrong_2_ar
       FROM questions q
       JOIN categories c ON c.id = q.category_id';

function question_row(array $r): array
{
    return [
        'id'            => (int) $r['id'],
        'category_id'   => (int) $r['category_id'],
        'category_name' => $r['category_name'],
        'points'        => (int) $r['points'],
        'question'      => $r['question'],
        'answer'        => $r['answer'],
        'question_ar'   => $r['question_ar'],
        'answer_ar'     => $r['answer_ar'],
        'image'         => image_or_null($r['image']),
        'image_credit'  => image_or_null($r['image_credit']),
        'wrong_1'       => $r['wrong_1'],
        'wrong_2'       => $r['wrong_2'],
        'wrong_1_ar'    => $r['wrong_1_ar'],
        'wrong_2_ar'    => $r['wrong_2_ar'],
    ];
}

// Columns of a question as the game plays it (board cell or Swap question), see board_cell().
const CELL_COLUMNS =
    'id, category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
     wrong_1, wrong_2, wrong_1_ar, wrong_2_ar';

/** A question as the game plays it: no category or points, those come from its cell. */
function board_cell(array $r): array
{
    return [
        'id'           => (int) $r['id'],
        'question'     => $r['question'],
        'answer'       => $r['answer'],
        'question_ar'  => $r['question_ar'],
        'answer_ar'    => $r['answer_ar'],
        'image'        => image_or_null($r['image']),
        'image_credit' => image_or_null($r['image_credit']),
        'wrong_1'      => $r['wrong_1'],
        'wrong_2'      => $r['wrong_2'],
        'wrong_1_ar'   => $r['wrong_1_ar'],
        'wrong_2_ar'   => $r['wrong_2_ar'],
    ];
}

function find_question(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare(QUESTION_SELECT . ' WHERE q.id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    return $row ? question_row($row) : null;
}

function list_questions(PDO $pdo): array
{
    if (!isset($_GET['category_id'])) {
        $rows = $pdo->query(QUESTION_SELECT . ' ORDER BY c.name ASC, q.points ASC, q.id ASC')->fetchAll();
        return array_map('question_row', $rows);
    }

    $categoryId = require_query_id('category_id');
    $stmt = $pdo->prepare('SELECT 1 FROM categories WHERE id = :id');
    $stmt->execute([':id' => $categoryId]);
    if (!$stmt->fetchColumn()) {
        not_found('Category not found');
    }
    $stmt = $pdo->prepare(QUESTION_SELECT . ' WHERE q.category_id = :id ORDER BY q.points ASC, q.id ASC');
    $stmt->execute([':id' => $categoryId]);
    return array_map('question_row', $stmt->fetchAll());
}

/** Parse "3,1,2" into a list of distinct positive ids (order kept); 400 otherwise. */
function parse_board_ids($raw): array
{
    if (!is_string($raw) || trim($raw) === '') {
        bad_request('categories must be a comma-separated list of category ids');
    }
    $ids = [];
    foreach (explode(',', $raw) as $part) {
        $part = trim($part);
        if (!preg_match('/^\d{1,10}$/', $part) || (int) $part < 1) {
            bad_request('categories must be a comma-separated list of positive integer ids');
        }
        $id = (int) $part;
        if (in_array($id, $ids, true)) {
            bad_request("Category id $id is listed more than once");
        }
        $ids[] = $id;
    }
    if (count($ids) > BOARD_MAX_CATEGORIES) {
        bad_request('Too many categories requested');
    }
    return $ids;
}

/**
 * Parse a list of question ids (the seen list, oldest first, or the Swap's exclude list),
 * at most BOARD_MAX_SEEN; 400 otherwise. $label names the field in the error.
 */
function parse_seen_ids($raw, string $label = 'seen'): array
{
    if ($raw === null) {
        return [];
    }
    if (!is_array($raw) || array_values($raw) !== $raw || count($raw) > BOARD_MAX_SEEN) {
        bad_request("$label must be a list of at most " . BOARD_MAX_SEEN . ' question ids');
    }
    foreach ($raw as $id) {
        if (!is_int($id) || $id < 1) {
            bad_request("$label must be a list of positive integer question ids");
        }
    }
    return $raw;
}

/**
 * { played, total }: total = questions a board can draw from these categories (enabled point
 * values only); played = how many of those are in $seen. Questions that were deleted, or whose
 * point value or category is no longer on the board, do not count.
 */
function played_count(PDO $pdo, array $ids, array $seen): array
{
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare(
        "SELECT q.id FROM questions q
           JOIN point_values pv ON pv.points = q.points AND pv.enabled = 1
          WHERE q.category_id IN ($placeholders)"
    );
    $stmt->execute($ids);
    $drawable = array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
    $seenRank = array_flip($seen);
    $played = count(array_filter($drawable, fn(int $id): bool => isset($seenRank[$id])));
    return ['played' => $played, 'total' => count($drawable)];
}

/**
 * One question of a cell's pool (rows with an 'id'): a random unseen one (US-30); when all
 * of them are in the seen list, the one seen longest ago. $seenRank = array_flip($seen).
 */
function draw_from_pool(array $pool, array $seenRank): array
{
    $fresh = array_values(array_filter($pool, fn(array $q): bool => !isset($seenRank[$q['id']])));
    if ($fresh) {
        return $fresh[random_int(0, count($fresh) - 1)];
    }
    usort($pool, fn(array $a, array $b): int => $seenRank[$a['id']] <=> $seenRank[$b['id']]);
    return $pool[0];
}

/** A random key of a non-empty array (random_int, like the board draw). */
function random_key(array $items)
{
    $keys = array_keys($items);
    return $keys[random_int(0, count($keys) - 1)];
}

/**
 * Board payload: { points: [...asc], categories: [{id, name, questions: {<points>: board_cell()}}] }
 * Every cell (category x point value) gets one random question from that cell's unseen
 * questions (US-30); when all of them are in $seen (oldest first), the one seen longest
 * ago. Cells hold different questions, so a board never repeats one.
 */
function board(PDO $pdo, array $ids, array $seen = []): array
{
    // Position in the seen list: a lower rank was played longer ago.
    $seenRank = array_flip($seen);

    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $stmt = $pdo->prepare("SELECT id, name FROM categories WHERE id IN ($placeholders)");
    $stmt->execute($ids);
    $names = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    $unknown = array_values(array_filter($ids, fn(int $id): bool => !array_key_exists($id, $names)));
    if ($unknown) {
        bad_request('Unknown category id(s): ' . implode(', ', $unknown));
    }

    // Disabled point values are not board rows; their questions are simply not drawn.
    $points = array_map('intval', $pdo->query('SELECT points FROM point_values WHERE enabled = 1 ORDER BY points ASC')->fetchAll(PDO::FETCH_COLUMN));

    $stmt = $pdo->prepare(
        'SELECT ' . CELL_COLUMNS . " FROM questions WHERE category_id IN ($placeholders) ORDER BY id ASC"
    );
    $stmt->execute($ids);
    $pools = [];
    foreach ($stmt->fetchAll() as $r) {
        $pools[(int) $r['category_id']][(int) $r['points']][] = board_cell($r);
    }

    $categories = [];
    foreach ($ids as $id) {
        $questions = [];
        $missing = [];
        foreach ($points as $p) {
            $pool = $pools[$id][$p] ?? [];
            if (!$pool) {
                $missing[] = $p;
                continue;
            }
            $questions[$p] = draw_from_pool($pool, $seenRank);
        }
        if ($missing) {
            bad_request("Category \"{$names[$id]}\" is missing questions for: " . implode(', ', $missing));
        }
        // Cast to object so it always encodes as a JSON object keyed by points.
        $categories[] = ['id' => $id, 'name' => $names[$id], 'questions' => (object) $questions];
    }
    return ['points' => $points, 'categories' => $categories];
}

/**
 * Swap helper (US-32): { category: {id, name}, points, question: board_cell() } from the whole
 * bank. A random playable category (PLAYABLE_HAVING, as categories.php?playable=1), then a random
 * enabled point value of it, then that cell's question by the board rule (draw_from_pool).
 * Excluded ids (the questions on the running board) are never drawn. Cells that still have an
 * unseen question come first, so a swap only repeats a question once the bank is played through.
 * 409 when no question is left to draw.
 */
function random_question(PDO $pdo, array $exclude, array $seen): array
{
    $seenRank = array_flip($seen);
    $excluded = array_flip($exclude);

    $names = $pdo->query(
        'SELECT c.id, c.name
           FROM categories c
           LEFT JOIN questions q ON q.category_id = c.id
           LEFT JOIN point_values pv ON pv.points = q.points
          GROUP BY c.id, c.name ' . PLAYABLE_HAVING
    )->fetchAll(PDO::FETCH_KEY_PAIR);

    // Drawable ids per cell (category x enabled point value), all and unseen only.
    $cells = [];
    $freshCells = [];
    if ($names) {
        $ids = array_map('intval', array_keys($names));
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $pdo->prepare(
            "SELECT q.id, q.category_id, q.points FROM questions q
               JOIN point_values pv ON pv.points = q.points AND pv.enabled = 1
              WHERE q.category_id IN ($placeholders)"
        );
        $stmt->execute($ids);
        foreach ($stmt->fetchAll() as $r) {
            $id = (int) $r['id'];
            if (isset($excluded[$id])) {
                continue;
            }
            $cells[(int) $r['category_id']][(int) $r['points']][] = ['id' => $id];
            if (!isset($seenRank[$id])) {
                $freshCells[(int) $r['category_id']][(int) $r['points']] = true;
            }
        }
    }
    $choices = $freshCells ?: $cells;
    if (!$choices) {
        conflict('There is no other question left to swap in.');
    }
    $categoryId = random_key($choices);
    $points = random_key($choices[$categoryId]);
    $picked = draw_from_pool($cells[$categoryId][$points], $seenRank);

    $stmt = $pdo->prepare('SELECT ' . CELL_COLUMNS . ' FROM questions WHERE id = :id');
    $stmt->execute([':id' => $picked['id']]);
    $row = $stmt->fetch();
    if (!$row) { // deleted by the admin a moment ago
        conflict('The question changed meanwhile. Please try again.');
    }
    return [
        'category' => ['id' => $categoryId, 'name' => $names[$categoryId]],
        'points'   => $points,
        'question' => board_cell($row),
    ];
}

/**
 * Streak Challenge batch (US-33): up to STREAK_BATCH questions from every category at an enabled
 * point value, never an excluded id (the run's questions so far). Unseen questions come first in
 * random order, then seen ones, the one seen longest ago first (the board rule, draw_from_pool).
 * Each one gets 3 choices (streak_choices()); a question that cannot get 2 wrong choices is skipped.
 * Returns [] once nothing is left to draw.
 */
function streak_batch(PDO $pdo, array $exclude, array $seen): array
{
    $seenRank = array_flip($seen);
    $excluded = array_flip($exclude);
    $names = $pdo->query('SELECT id, name FROM categories')->fetchAll(PDO::FETCH_KEY_PAIR);
    $rows = $pdo->query(
        'SELECT ' . CELL_COLUMNS . ' FROM questions
          WHERE points IN (SELECT points FROM point_values WHERE enabled = 1) ORDER BY id ASC'
    )->fetchAll();

    // Answers to borrow wrong choices from, by kind (picture or text) and by category, so a flag
    // question gets flag answers. The pool to draw from is keyed by id.
    $byKind = [];
    $byCategory = [];
    $pool = [];
    foreach ($rows as $r) {
        $kind = $r['image'] === '' ? 'text' : 'picture';
        $byKind[$kind][] = $r;
        $byCategory[$kind][(int) $r['category_id']][] = $r;
        $id = (int) $r['id'];
        if (!isset($excluded[$id])) {
            $pool[$id] = ['id' => $id, 'row' => $r];
        }
    }

    $batch = [];
    while ($pool && count($batch) < STREAK_BATCH) {
        $picked = draw_from_pool($pool, $seenRank);
        unset($pool[$picked['id']]);
        $r = $picked['row'];
        $kind = $r['image'] === '' ? 'text' : 'picture';
        $choices = streak_choices($r, [$byCategory[$kind][(int) $r['category_id']], $byKind[$kind]]);
        if ($choices !== null) {
            $batch[] = streak_question($r, $names[(int) $r['category_id']] ?? '', $choices);
        }
    }
    return $batch;
}

/** A streak question: the board_cell() fields it needs, its category and points, the choices and `correct`. */
function streak_question(array $r, string $categoryName, array $choices): array
{
    $cell = board_cell($r);
    return [
        'id'            => $cell['id'],
        'category_name' => $categoryName,
        'points'        => (int) $r['points'],
        'question'      => $cell['question'],
        'question_ar'   => has_arabic($r) ? $cell['question_ar'] : null,
        'image'         => $cell['image'],
        'image_credit'  => $cell['image_credit'],
        'choices'       => $choices['choices'],
        'correct'       => $choices['correct'],
    ];
}

/** The question has an Arabic version: both the Arabic question and the Arabic answer are filled. */
function has_arabic(array $r): bool
{
    return trim((string) $r['question_ar']) !== '' && trim((string) $r['answer_ar']) !== '';
}

/** One choice as the game shows it: {text, text_ar}, both cut by choice_text(); text_ar null without Arabic. */
function streak_choice(string $text, ?string $textAr): array
{
    return ['text' => choice_text($text, false), 'text_ar' => $textAr === null ? null : choice_text($textAr, true)];
}

/** Two choices look the same: equal English, or equal Arabic, after fold_text(). */
function choices_clash(array $a, array $b): bool
{
    if (fold_text($a['text']) === fold_text($b['text'])) {
        return true;
    }
    return $a['text_ar'] !== null && $b['text_ar'] !== null && fold_text($a['text_ar']) === fold_text($b['text_ar']);
}

/**
 * { choices: [{text, text_ar}] x3 in random order, correct: index of the answer }, or null when
 * the question cannot get 2 wrong choices. The stored wrong options are used when the question
 * has a complete pair (and the Arabic pair too when it has an Arabic version) that differs from
 * the answer; otherwise 2 answers are borrowed from $pools (borrow_choices()).
 */
function streak_choices(array $r, array $pools): ?array
{
    $arabic = has_arabic($r);
    $right = streak_choice($r['answer'], $arabic ? $r['answer_ar'] : null);
    $wrong = stored_choices($r, $arabic, $right) ?? borrow_choices($r, $arabic, $right, $pools);
    if ($wrong === null) {
        return null;
    }
    $all = [$right, $wrong[0], $wrong[1]];
    $order = shuffled([0, 1, 2]);
    return [
        'choices' => array_map(fn(int $i): array => $all[$i], $order),
        'correct' => array_search(0, $order, true),
    ];
}

/** The stored wrong options as 2 choices, or null when the pair is incomplete or clashes. */
function stored_choices(array $r, bool $arabic, array $right): ?array
{
    $filled = fn(string $column): bool => trim((string) $r[$column]) !== '';
    if (!$filled('wrong_1') || !$filled('wrong_2') || ($arabic && (!$filled('wrong_1_ar') || !$filled('wrong_2_ar')))) {
        return null;
    }
    $wrong = [
        streak_choice($r['wrong_1'], $arabic ? $r['wrong_1_ar'] : null),
        streak_choice($r['wrong_2'], $arabic ? $r['wrong_2_ar'] : null),
    ];
    // The API already checks this on save; rows loaded by SQL files are checked here.
    if (choices_clash($wrong[0], $wrong[1]) || choices_clash($wrong[0], $right) || choices_clash($wrong[1], $right)) {
        return null;
    }
    return $wrong;
}

/**
 * 2 answers of other questions as wrong choices: from the first pool (same category and kind),
 * then the next (same kind, any category). They need Arabic when the question has Arabic, and
 * must not clash with the answer or each other. A choice that appears inside the full answer
 * is skipped too, so an "(accept …)" alternative never shows up as a wrong choice. Null if fewer than 2.
 */
function borrow_choices(array $r, bool $arabic, array $right, array $pools): ?array
{
    $answers = [fold_text($r['answer']), $arabic ? fold_text($r['answer_ar']) : null];
    $chosen = [];
    foreach ($pools as $pool) {
        foreach (shuffled($pool) as $other) {
            if ((int) $other['id'] === (int) $r['id'] || ($arabic && !has_arabic($other))) {
                continue;
            }
            $choice = streak_choice($other['answer'], $arabic ? $other['answer_ar'] : null);
            $inAnswer = strpos($answers[0], fold_text($choice['text'])) !== false ||
                ($arabic && strpos($answers[1], fold_text($choice['text_ar'])) !== false);
            $clash = $inAnswer || choices_clash($choice, $right);
            foreach ($chosen as $taken) {
                $clash = $clash || choices_clash($choice, $taken);
            }
            if (!$clash) {
                $chosen[] = $choice;
                if (count($chosen) === 2) {
                    return $chosen;
                }
            }
        }
    }
    return null;
}

/** Copy of the list in random order (Fisher-Yates with random_int, like the board draw). */
function shuffled(array $items): array
{
    $items = array_values($items);
    for ($i = count($items) - 1; $i > 0; $i--) {
        $j = random_int(0, $i);
        [$items[$i], $items[$j]] = [$items[$j], $items[$i]];
    }
    return $items;
}

/** Optional text: null/empty -> null; otherwise trimmed and within $maxChars. */
function optional_text($value, string $label, int $maxChars): ?string
{
    if ($value !== null && !is_string($value)) {
        bad_request("$label must be text");
    }
    $text = trim((string) $value);
    if ($text === '') {
        return null;
    }
    if (text_length($text) > $maxChars) {
        bad_request("$label must be at most $maxChars characters");
    }
    return $text;
}

/** Optional picture path: null/empty -> '' (no picture); otherwise must match IMAGE_PATH_PATTERN. */
function optional_image($value): string
{
    if ($value !== null && !is_string($value)) {
        bad_request('Image path must be text');
    }
    $path = trim((string) $value);
    if ($path === '') {
        return '';
    }
    if (strlen($path) > IMAGE_PATH_MAX) {
        bad_request('Image path must be at most ' . IMAGE_PATH_MAX . ' characters');
    }
    if (!preg_match(IMAGE_PATH_PATTERN, $path)) {
        bad_request('Image path must look like img/questions/flag-japan.svg (lowercase letters, digits and hyphens; .svg, .jpg, .jpeg, .png or .webp)');
    }
    return $path;
}

/** Optional one-line text: like optional_text(), without line breaks, tabs or other control characters. */
function optional_line($value, string $label, int $maxChars): ?string
{
    $text = optional_text($value, $label, $maxChars);
    if ($text !== null && preg_match('/[\x00-\x1F\x7F]/', $text)) {
        bad_request("$label must be a single line of text");
    }
    return $text;
}

/** Optional photo credit: null/empty -> '' (no caption); otherwise one line of plain text. */
function optional_image_credit($value): string
{
    return optional_line($value, 'Image credit', IMAGE_CREDIT_MAX) ?? '';
}

/** Lower-case form for the "must differ" checks of the wrong options. */
function fold_text(string $text): string
{
    return function_exists('mb_strtolower') ? mb_strtolower($text, 'UTF-8') : strtolower($text);
}

/**
 * The two wrong options of one language (US-32): both or neither, one line each, different
 * from each other and from the answer, case-insensitive, both as typed and as the game shows
 * them (choice_text()). Returns [wrong_1, wrong_2] or [null, null].
 */
function wrong_options($first, $second, string $label, ?string $answer, bool $arabic): array
{
    $wrong1 = optional_line($first, "$label 1", WRONG_OPTION_MAX);
    $wrong2 = optional_line($second, "$label 2", WRONG_OPTION_MAX);
    if (($wrong1 === null) !== ($wrong2 === null)) {
        bad_request("Provide both $label 1 and $label 2, or neither");
    }
    if ($wrong1 === null) {
        return [null, null];
    }
    $shown = fn(string $text): string => fold_text(choice_text($text, $arabic));
    if (fold_text($wrong1) === fold_text($wrong2) || $shown($wrong1) === $shown($wrong2)) {
        bad_request("$label 1 and $label 2 must be different");
    }
    $answer = (string) $answer;
    $correct = [fold_text($answer), $shown($answer)];
    foreach ([1 => $wrong1, 2 => $wrong2] as $n => $wrong) {
        if (in_array(fold_text($wrong), $correct, true) || in_array($shown($wrong), $correct, true)) {
            bad_request("$label $n is the same as the answer");
        }
    }
    return [$wrong1, $wrong2];
}

/** Validate question fields; returns them keyed by column name, or sends 400. */
function validate_question(PDO $pdo, array $data): array
{
    $categoryId = parse_int($data['category_id'] ?? null);
    if ($categoryId === null || $categoryId < 1) {
        bad_request('category_id must be a positive integer');
    }
    $points = parse_int($data['points'] ?? null);
    if ($points === null || $points < 1) {
        bad_request('points must be a positive integer');
    }
    $question = require_text($data['question'] ?? null, 'Question', QUESTION_TEXT_MAX);
    $answer = require_text($data['answer'] ?? null, 'Answer', QUESTION_TEXT_MAX);
    $questionAr = optional_text($data['question_ar'] ?? null, 'Arabic question', QUESTION_TEXT_MAX);
    $answerAr = optional_text($data['answer_ar'] ?? null, 'Arabic answer', QUESTION_TEXT_MAX);
    // All-or-nothing so a revealed question never mixes languages.
    if (($questionAr === null) !== ($answerAr === null)) {
        bad_request('Provide both the Arabic question and the Arabic answer, or neither');
    }
    $image = optional_image($data['image'] ?? null);
    $imageCredit = optional_image_credit($data['image_credit'] ?? null);
    [$wrong1, $wrong2] = wrong_options(
        $data['wrong_1'] ?? null, $data['wrong_2'] ?? null, 'Wrong option', $answer, false
    );
    [$wrong1Ar, $wrong2Ar] = wrong_options(
        $data['wrong_1_ar'] ?? null, $data['wrong_2_ar'] ?? null, 'Arabic wrong option', $answerAr, true
    );
    // The 3 choices follow the question's language, so a question with an Arabic version
    // needs wrong options in both languages, or in neither.
    if ($wrong1Ar !== null && $questionAr === null) {
        bad_request('Arabic wrong options need the Arabic question and answer');
    }
    if ($wrong1Ar !== null && $wrong1 === null) {
        bad_request('Provide the English wrong options too');
    }
    if ($wrong1 !== null && $questionAr !== null && $wrong1Ar === null) {
        bad_request('This question has an Arabic version: provide the Arabic wrong options too');
    }

    $stmt = $pdo->prepare('SELECT 1 FROM categories WHERE id = :id');
    $stmt->execute([':id' => $categoryId]);
    if (!$stmt->fetchColumn()) {
        bad_request('Category not found');
    }
    $stmt = $pdo->prepare('SELECT 1 FROM point_values WHERE points = :points');
    $stmt->execute([':points' => $points]);
    if (!$stmt->fetchColumn()) {
        bad_request("Point value $points does not exist");
    }
    return [
        'category_id'  => $categoryId,
        'points'       => $points,
        'question'     => $question,
        'answer'       => $answer,
        'question_ar'  => $questionAr,
        'answer_ar'    => $answerAr,
        'image'        => $image,
        'image_credit' => $imageCredit,
        'wrong_1'      => $wrong1,
        'wrong_2'      => $wrong2,
        'wrong_1_ar'   => $wrong1Ar,
        'wrong_2_ar'   => $wrong2Ar,
    ];
}

/** Named parameters (":column" => value) of the validated fields. */
function question_params(array $fields): array
{
    $params = [];
    foreach ($fields as $column => $value) {
        $params[":$column"] = $value;
    }
    return $params;
}

/** Execute an INSERT/UPDATE of a question, mapping constraint errors to 409/400. */
function save_question(PDOStatement $stmt, array $params): void
{
    try {
        $stmt->execute($params);
    } catch (PDOException $e) {
        // uq_category_question_image: same text (case-insensitive) and picture already in this category.
        if (is_duplicate_key($e)) {
            conflict('The same question text and picture already exist in this category');
        }
        if (is_foreign_key_error($e)) {
            bad_request('Category or point value no longer exists');
        }
        throw $e;
    }
}

function create_question(PDO $pdo, array $body): void
{
    $fields = validate_question($pdo, $body);
    $stmt = $pdo->prepare(
        'INSERT INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                                wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
         VALUES (:category_id, :points, :question, :answer, :question_ar, :answer_ar, :image, :image_credit,
                 :wrong_1, :wrong_2, :wrong_1_ar, :wrong_2_ar)'
    );
    save_question($stmt, question_params($fields));
    json_response(find_question($pdo, (int) $pdo->lastInsertId()), 201);
}

function update_question(PDO $pdo, int $id, array $body): void
{
    $existing = find_question($pdo, $id);
    if ($existing === null) {
        not_found('Question not found');
    }
    // Fields not sent keep their current value.
    $merged = [];
    $columns = ['category_id', 'points', 'question', 'answer', 'question_ar', 'answer_ar', 'image', 'image_credit',
                'wrong_1', 'wrong_2', 'wrong_1_ar', 'wrong_2_ar'];
    foreach ($columns as $field) {
        $merged[$field] = array_key_exists($field, $body) ? $body[$field] : $existing[$field];
    }
    $fields = validate_question($pdo, $merged);
    $stmt = $pdo->prepare(
        'UPDATE questions
            SET category_id = :category_id, points = :points, question = :question, answer = :answer,
                question_ar = :question_ar, answer_ar = :answer_ar, image = :image,
                image_credit = :image_credit, wrong_1 = :wrong_1, wrong_2 = :wrong_2,
                wrong_1_ar = :wrong_1_ar, wrong_2_ar = :wrong_2_ar
          WHERE id = :id'
    );
    save_question($stmt, question_params($fields) + [':id' => $id]);
    json_response(find_question($pdo, $id));
}

function delete_question(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare('DELETE FROM questions WHERE id = :id');
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) {
        not_found('Question not found');
    }
    json_response(['deleted' => $id]);
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (($_GET['board'] ?? '') === '1') {
            $ids = parse_board_ids($_GET['categories'] ?? null);
            json_response(board(db(), $ids));
        }
        // The full list shows every answer, so only the admin page may read it.
        require_admin();
        json_response(list_questions(db()));
        break;

    case 'POST':
        if (($_GET['board'] ?? '') === '1') {
            // POST so a long seen list never hits URL length limits.
            $body = read_json_body();
            $ids = parse_board_ids($body['categories'] ?? null);
            json_response(board(db(), $ids, parse_seen_ids($body['seen'] ?? null)));
        }
        if (($_GET['played'] ?? '') === '1') {
            $body = read_json_body();
            $ids = parse_board_ids($body['categories'] ?? null);
            json_response(played_count(db(), $ids, parse_seen_ids($body['seen'] ?? null)));
        }
        if (($_GET['random'] ?? '') === '1') {
            $body = read_json_body();
            $exclude = parse_seen_ids($body['exclude'] ?? null, 'exclude');
            json_response(random_question(db(), $exclude, parse_seen_ids($body['seen'] ?? null)));
        }
        if (($_GET['streak'] ?? '') === '1') {
            $body = read_json_body();
            $exclude = parse_seen_ids($body['exclude'] ?? null, 'exclude');
            json_response(['questions' => streak_batch(db(), $exclude, parse_seen_ids($body['seen'] ?? null))]);
        }
        require_admin();
        $body = read_json_body();
        create_question(db(), $body);
        break;

    case 'PUT':
        require_admin();
        $id = require_query_id();
        $body = read_json_body();
        update_question(db(), $id, $body);
        break;

    case 'DELETE':
        require_admin();
        $id = require_query_id();
        delete_question(db(), $id);
        break;

    default:
        method_not_allowed(['GET', 'POST', 'PUT', 'DELETE']);
}

<?php
// GET    /api/questions.php                          -> all questions
// GET    /api/questions.php?category_id=<id>         -> one category's questions
// GET    /api/questions.php?board=1&categories=3,1,2 -> board payload (requested order)
// POST   /api/questions.php?board=1                  body { categories: "3,1,2", seen?: [id, ...] }
//                                                          -> board payload that avoids seen questions
// POST   /api/questions.php?played=1                 body { categories: "3,1,2", seen?: [id, ...] }
//                                                          -> { played, total } for the setup progress bar
// POST   /api/questions.php                          body { category_id, points, question, answer,
//                                                          question_ar?, answer_ar?, image?,
//                                                          image_credit? } -> 201
// PUT    /api/questions.php?id=<id>                  body: any of the POST fields -> 200
// DELETE /api/questions.php?id=<id>                  -> 200
// The full list (first two GETs) and all writes need admin access (require_admin: 401/403
// otherwise); only the board payload (GET or POST) and the played count are public, they are
// what the game plays from.
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

/** Stored '' means "no picture" (or "no credit"); the JSON uses null for that. */
function image_or_null(string $image): ?string
{
    return $image === '' ? null : $image;
}

const QUESTION_SELECT =
    'SELECT q.id, q.category_id, c.name AS category_name, q.points, q.question, q.answer,
           q.question_ar, q.answer_ar, q.image, q.image_credit
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

/** Parse the seen list: question ids, oldest first, at most BOARD_MAX_SEEN; 400 otherwise. */
function parse_seen_ids($raw): array
{
    if ($raw === null) {
        return [];
    }
    if (!is_array($raw) || array_values($raw) !== $raw || count($raw) > BOARD_MAX_SEEN) {
        bad_request('seen must be a list of at most ' . BOARD_MAX_SEEN . ' question ids');
    }
    foreach ($raw as $id) {
        if (!is_int($id) || $id < 1) {
            bad_request('seen must be a list of positive integer question ids');
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
 * Board payload: { points: [...asc], categories: [{id, name, questions: {<points>: {id, question, answer, question_ar, answer_ar, image, image_credit}}}] }
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
        "SELECT id, category_id, points, question, answer, question_ar, answer_ar, image, image_credit FROM questions WHERE category_id IN ($placeholders) ORDER BY id ASC"
    );
    $stmt->execute($ids);
    $pools = [];
    foreach ($stmt->fetchAll() as $r) {
        $pools[(int) $r['category_id']][(int) $r['points']][] = [
            'id'           => (int) $r['id'],
            'question'     => $r['question'],
            'answer'       => $r['answer'],
            'question_ar'  => $r['question_ar'],
            'answer_ar'    => $r['answer_ar'],
            'image'        => image_or_null($r['image']),
            'image_credit' => image_or_null($r['image_credit']),
        ];
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
            $fresh = array_values(array_filter($pool, fn(array $q): bool => !isset($seenRank[$q['id']])));
            if ($fresh) {
                $questions[$p] = $fresh[random_int(0, count($fresh) - 1)];
            } else {
                usort($pool, fn(array $a, array $b): int => $seenRank[$a['id']] <=> $seenRank[$b['id']]);
                $questions[$p] = $pool[0];
            }
        }
        if ($missing) {
            bad_request("Category \"{$names[$id]}\" is missing questions for: " . implode(', ', $missing));
        }
        // Cast to object so it always encodes as a JSON object keyed by points.
        $categories[] = ['id' => $id, 'name' => $names[$id], 'questions' => (object) $questions];
    }
    return ['points' => $points, 'categories' => $categories];
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

/** Optional photo credit: null/empty -> '' (no caption); otherwise one line of plain text. */
function optional_image_credit($value): string
{
    $credit = optional_text($value, 'Image credit', IMAGE_CREDIT_MAX);
    if ($credit === null) {
        return '';
    }
    // A caption is a single line: no line breaks, tabs or other control characters.
    if (preg_match('/[\x00-\x1F\x7F]/', $credit)) {
        bad_request('Image credit must be a single line of text');
    }
    return $credit;
}

/** Validate question fields; returns [category_id, points, question, answer, question_ar, answer_ar, image, image_credit] or sends 400. */
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
    return [$categoryId, $points, $question, $answer, $questionAr, $answerAr, $image, $imageCredit];
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
    [$categoryId, $points, $question, $answer, $questionAr, $answerAr, $image, $imageCredit] = validate_question($pdo, $body);
    $stmt = $pdo->prepare(
        'INSERT INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit)
         VALUES (:category_id, :points, :question, :answer, :question_ar, :answer_ar, :image, :image_credit)'
    );
    save_question($stmt, [
        ':category_id'  => $categoryId,
        ':points'       => $points,
        ':question'     => $question,
        ':answer'       => $answer,
        ':question_ar'  => $questionAr,
        ':answer_ar'    => $answerAr,
        ':image'        => $image,
        ':image_credit' => $imageCredit,
    ]);
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
    foreach (['category_id', 'points', 'question', 'answer', 'question_ar', 'answer_ar', 'image', 'image_credit'] as $field) {
        $merged[$field] = array_key_exists($field, $body) ? $body[$field] : $existing[$field];
    }
    [$categoryId, $points, $question, $answer, $questionAr, $answerAr, $image, $imageCredit] = validate_question($pdo, $merged);
    $stmt = $pdo->prepare(
        'UPDATE questions
            SET category_id = :category_id, points = :points, question = :question, answer = :answer,
                question_ar = :question_ar, answer_ar = :answer_ar, image = :image,
                image_credit = :image_credit
          WHERE id = :id'
    );
    save_question($stmt, [
        ':category_id'  => $categoryId,
        ':points'       => $points,
        ':question'     => $question,
        ':answer'       => $answer,
        ':question_ar'  => $questionAr,
        ':answer_ar'    => $answerAr,
        ':image'        => $image,
        ':image_credit' => $imageCredit,
        ':id'           => $id,
    ]);
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

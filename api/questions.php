<?php
// GET    /api/questions.php                          -> all questions
// GET    /api/questions.php?category_id=<id>         -> one category's questions
// GET    /api/questions.php?board=1&categories=3,1,2 -> board payload (requested order)
// POST   /api/questions.php                          body { category_id, points, question, answer,
//                                                          question_ar?, answer_ar? } -> 201
// PUT    /api/questions.php?id=<id>                  body: any of the POST fields -> 200
// DELETE /api/questions.php?id=<id>                  -> 200
// The full list (first two GETs) and all writes need admin access (require_admin: 401/403
// otherwise); only the board payload is public, it is what the game plays from.
//
// Question bank (D-31 amended): every question has a category and a point value, and a
// category may have any number of questions per point value. The board draws one
// random question per cell (category x point value) (US-30).
require_once __DIR__ . '/db.php';

const QUESTION_TEXT_MAX = 5000;
const BOARD_MAX_CATEGORIES = 50;

const QUESTION_SELECT =
    'SELECT q.id, q.category_id, c.name AS category_name, q.points, q.question, q.answer,
           q.question_ar, q.answer_ar
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
 * Board payload: { points: [...asc], categories: [{id, name, questions: {<points>: {question, answer, question_ar, answer_ar}}}] }
 * Every cell (category x point value) gets one random question from that cell's
 * questions (US-30). Cells hold different questions, so a board never repeats one.
 */
function board(PDO $pdo, array $ids): array
{
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
        "SELECT category_id, points, question, answer, question_ar, answer_ar FROM questions WHERE category_id IN ($placeholders) ORDER BY id ASC"
    );
    $stmt->execute($ids);
    $pools = [];
    foreach ($stmt->fetchAll() as $r) {
        $pools[(int) $r['category_id']][(int) $r['points']][] = [
            'question'    => $r['question'],
            'answer'      => $r['answer'],
            'question_ar' => $r['question_ar'],
            'answer_ar'   => $r['answer_ar'],
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
            $questions[$p] = $pool[random_int(0, count($pool) - 1)];
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

/** Validate question fields; returns [category_id, points, question, answer, question_ar, answer_ar] or sends 400. */
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
    return [$categoryId, $points, $question, $answer, $questionAr, $answerAr];
}

/** Execute an INSERT/UPDATE of a question, mapping constraint errors to 409/400. */
function save_question(PDOStatement $stmt, array $params): void
{
    try {
        $stmt->execute($params);
    } catch (PDOException $e) {
        // uq_category_question: same text (case-insensitive) already in this category.
        if (is_duplicate_key($e)) {
            conflict('This category already has this question');
        }
        if (is_foreign_key_error($e)) {
            bad_request('Category or point value no longer exists');
        }
        throw $e;
    }
}

function create_question(PDO $pdo, array $body): void
{
    [$categoryId, $points, $question, $answer, $questionAr, $answerAr] = validate_question($pdo, $body);
    $stmt = $pdo->prepare(
        'INSERT INTO questions (category_id, points, question, answer, question_ar, answer_ar)
         VALUES (:category_id, :points, :question, :answer, :question_ar, :answer_ar)'
    );
    save_question($stmt, [
        ':category_id' => $categoryId,
        ':points'      => $points,
        ':question'    => $question,
        ':answer'      => $answer,
        ':question_ar' => $questionAr,
        ':answer_ar'   => $answerAr,
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
    foreach (['category_id', 'points', 'question', 'answer', 'question_ar', 'answer_ar'] as $field) {
        $merged[$field] = array_key_exists($field, $body) ? $body[$field] : $existing[$field];
    }
    [$categoryId, $points, $question, $answer, $questionAr, $answerAr] = validate_question($pdo, $merged);
    $stmt = $pdo->prepare(
        'UPDATE questions
            SET category_id = :category_id, points = :points, question = :question, answer = :answer,
                question_ar = :question_ar, answer_ar = :answer_ar
          WHERE id = :id'
    );
    save_question($stmt, [
        ':category_id' => $categoryId,
        ':points'      => $points,
        ':question'    => $question,
        ':answer'      => $answer,
        ':question_ar' => $questionAr,
        ':answer_ar'   => $answerAr,
        ':id'          => $id,
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

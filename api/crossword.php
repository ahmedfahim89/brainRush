<?php
// GET /api/crossword.php -> { date: 'YYYY-MM-DD', number, seconds_to_next, width, height,
//   words: [{ n, row, col, dir: 'across'|'down', length, answer, question, question_ar,
//             category_name, category_name_ar }] }
// Daily Crossword (US-58, D-72): one grid per day for everyone. The day is the date in
// GAME_TIME_ZONE (UTC, api/db.php), as the Daily Challenge. The first request of a day builds the
// grid from the question bank (text questions at enabled point values; clue = question, word = the
// cleaned answer), stores it in `daily_crossword` with INSERT IGNORE on the date and reads it back,
// so two simultaneous first requests still give one grid. The stored layout holds the question ids,
// the words and their positions; the clue text is read here, so Admin fixes show. A question deleted
// after the grid was built keeps its word; its clue comes back as null (the game shows "Clue removed").
// number = days since CROSSWORD_LAUNCH_DATE + 1 (at least 1); seconds_to_next = to the next midnight.
// Public and read-only for the player: the answers are in the payload (D-37 g), progress stays in
// the player's browser. Errors are generic; a database without the table only breaks this endpoint.
require_once __DIR__ . '/db.php';
// daily.php: daily_bank() and question_kind(), and through it questions.php (choice_text()); no request.
const DAILY_INCLUDE_ONLY = true;
require_once __DIR__ . '/daily.php';

const CROSSWORD_MAX_WORDS = 10;  // D-72 e: words in a grid, at most
const CROSSWORD_MIN_WORDS = 6;   // fewer than this -> 503, nothing stored
const CROSSWORD_MAX_SIZE = 13;   // width and height, at most
const CROSSWORD_LAUNCH_DATE = '2026-11-20'; // D-72 n: UTC date of live crossword #1; move it if the deploy is later
const CROSSWORD_TRIES = 24;      // grids built per day (each with its own seed); the best one is kept
const CROSSWORD_WORD_PATTERN = '/^[A-Z]{3,10}$/D'; // CW_WORD_PATTERN in js/game.*.js checks the same: keep the two the same
const CROSSWORD_UNAVAILABLE = 'The Daily Crossword is not available right now. Please try again later.';

// Accented letters the cleaning folds when the intl Normalizer is missing (base letter => variants).
const CROSSWORD_FOLD = [
    'A' => 'ÀÁÂÃÄÅĀĂĄàáâãäåāăą', 'C' => 'ÇĆĈĊČçćĉċč', 'D' => 'ĎĐďđ', 'E' => 'ÈÉÊËĒĔĖĘĚèéêëēĕėęě',
    'G' => 'ĜĞĠĢĝğġģ', 'H' => 'ĤĦĥħ', 'I' => 'ÌÍÎÏĨĪĬĮİìíîïĩīĭįı', 'J' => 'Ĵĵ', 'K' => 'Ķķ',
    'L' => 'ĹĻĽĿŁĺļľŀł', 'N' => 'ÑŃŅŇñńņň', 'O' => 'ÒÓÔÕÖØŌŎŐòóôõöøōŏő', 'R' => 'ŔŖŘŕŗř',
    'S' => 'ŚŜŞŠśŝşšș', 'T' => 'ŢŤŦţťŧț', 'U' => 'ÙÚÛÜŨŪŬŮŰŲùúûüũūŭůűų', 'W' => 'Ŵŵ',
    'Y' => 'ÝŸŶýÿŷ', 'Z' => 'ŹŻŽźżž', 'SS' => 'ß', 'AE' => 'ÆæǢǣ', 'OE' => 'Œœ',
];

/** Latin letters without accents, upper case: "Pelé" -> "PELE". Other characters are kept. */
function crossword_fold(string $text): string
{
    static $map = null;
    if ($map === null) {
        $map = [];
        foreach (CROSSWORD_FOLD as $base => $variants) {
            foreach (preg_split('//u', $variants, -1, PREG_SPLIT_NO_EMPTY) as $char) {
                $map[$char] = $base;
            }
        }
    }
    $text = strtr($text, $map);
    if (class_exists('Normalizer')) {
        $decomposed = Normalizer::normalize($text, Normalizer::FORM_D);
        if (is_string($decomposed)) {
            $text = (string) preg_replace('/\p{Mn}+/u', '', $decomposed);
        }
    }
    return strtoupper($text);
}

/**
 * The grid word of an answer, or null when it can't be one (D-72 e): cut at the first " (", drop a
 * leading "The ", remove spaces, hyphens and apostrophes, fold accents, upper case; 3-10 letters A-Z.
 */
function crossword_word(string $answer): ?string
{
    $text = choice_text($answer, false);
    $text = (string) preg_replace('/^the\s+/iu', '', $text);
    $text = (string) preg_replace('/[\s\x{00A0}\-\x{2010}-\x{2015}\'\x{2018}\x{2019}\x{02BC}`]+/u', '', $text);
    $word = crossword_fold($text);
    return preg_match(CROSSWORD_WORD_PATTERN, $word) ? $word : null;
}

/** The word appears in its own clue (English or Arabic text), case- and accent-insensitive. */
function word_in_clue(string $word, array $r): bool
{
    foreach ([$r['question'], (string) $r['question_ar']] as $clue) {
        if ($clue !== '' && strpos(crossword_fold($clue), $word) !== false) {
            return true;
        }
    }
    return false;
}

/**
 * Candidate words of the bank: [{id, word}] from text questions at enabled point values (daily_bank()),
 * each answer cleaned by crossword_word(), never a word found in its own clue. Duplicates are kept
 * here; the builder uses one question per word.
 */
function crossword_candidates(PDO $pdo): array
{
    $candidates = [];
    foreach (daily_bank($pdo)['rows'] as $r) {
        if (question_kind($r) !== 'text' || trim($r['answer']) === '') {
            continue;
        }
        $word = crossword_word($r['answer']);
        if ($word !== null && !word_in_clue($word, $r)) {
            $candidates[] = ['id' => (int) $r['id'], 'word' => $word];
        }
    }
    return $candidates;
}

/** A repeatable random number generator for a seed: returns fn(int $max) -> 0..$max. */
function seeded_random(string $seed): callable
{
    $counter = 0;
    return function (int $max) use ($seed, &$counter): int {
        $value = hexdec(substr(md5($seed . '|' . $counter++), 0, 8)); // 0 .. 2^32-1
        return $max <= 0 ? 0 : $value % ($max + 1);
    };
}

/** Copy of the list in an order fixed by the seeded generator (Fisher-Yates). */
function seeded_shuffle(array $items, callable $random): array
{
    $items = array_values($items);
    for ($i = count($items) - 1; $i > 0; $i--) {
        $j = $random($i);
        [$items[$i], $items[$j]] = [$items[$j], $items[$i]];
    }
    return $items;
}

/**
 * Grid being built: cells "row,col" => [letter, across?, down?], placed words, letter index, bounds.
 * Coordinates are free (may go negative); the bounds keep it within CROSSWORD_MAX_SIZE.
 */
function empty_grid(): array
{
    return ['cells' => [], 'words' => [], 'byLetter' => [], 'bounds' => null];
}

function cell_key(int $row, int $col): string
{
    return $row . ',' . $col;
}

/**
 * Can $word go at (row, col) in $dir? Returns the number of crossings, or -1 when it can't:
 * a filled cell must hold the same letter and be part of a word in the other direction; an empty
 * cell must have no neighbour across the word's direction (no side-by-side words); the cells before
 * the first and after the last letter must be empty; the grid must stay within the size limit.
 */
function placement_crossings(array $grid, string $word, int $row, int $col, string $dir): int
{
    [$dr, $dc] = $dir === 'across' ? [0, 1] : [1, 0];
    $len = strlen($word);
    $cells = $grid['cells'];
    if (isset($cells[cell_key($row - $dr, $col - $dc)]) || isset($cells[cell_key($row + $dr * $len, $col + $dc * $len)])) {
        return -1;
    }
    $crossings = 0;
    for ($i = 0; $i < $len; $i++) {
        $r = $row + $dr * $i;
        $c = $col + $dc * $i;
        $cell = $cells[cell_key($r, $c)] ?? null;
        if ($cell !== null) {
            if ($cell[0] !== $word[$i] || $cell[$dir === 'across' ? 1 : 2]) {
                return -1;
            }
            $crossings++;
        } elseif (isset($cells[cell_key($r + $dc, $c + $dr)]) || isset($cells[cell_key($r - $dc, $c - $dr)])) {
            return -1;
        }
    }
    if ($crossings === $len) {
        return -1; // the word would add no new cell
    }
    $b = grown_bounds($grid['bounds'], $row, $col, $row + $dr * ($len - 1), $col + $dc * ($len - 1));
    if ($b[2] - $b[0] + 1 > CROSSWORD_MAX_SIZE || $b[3] - $b[1] + 1 > CROSSWORD_MAX_SIZE) {
        return -1;
    }
    return $crossings;
}

/** Bounds [minRow, minCol, maxRow, maxCol] grown to hold the two cells. */
function grown_bounds(?array $b, int $r1, int $c1, int $r2, int $c2): array
{
    if ($b === null) {
        return [$r1, $c1, $r2, $c2];
    }
    return [min($b[0], $r1), min($b[1], $c1), max($b[2], $r2), max($b[3], $c2)];
}

function bounds_area(array $b): int
{
    return ($b[2] - $b[0] + 1) * ($b[3] - $b[1] + 1);
}

function place_word(array $grid, array $candidate, int $row, int $col, string $dir): array
{
    [$dr, $dc] = $dir === 'across' ? [0, 1] : [1, 0];
    $word = $candidate['word'];
    $len = strlen($word);
    for ($i = 0; $i < $len; $i++) {
        $key = cell_key($row + $dr * $i, $col + $dc * $i);
        if (!isset($grid['cells'][$key])) {
            $grid['cells'][$key] = [$word[$i], false, false];
            $grid['byLetter'][$word[$i]][] = [$row + $dr * $i, $col + $dc * $i];
        }
        $grid['cells'][$key][$dir === 'across' ? 1 : 2] = true;
    }
    $grid['words'][] = ['question_id' => $candidate['id'], 'word' => $word, 'row' => $row, 'col' => $col, 'dir' => $dir, 'length' => $len];
    $grid['bounds'] = grown_bounds($grid['bounds'], $row, $col, $row + $dr * ($len - 1), $col + $dc * ($len - 1));
    return $grid;
}

/** The best spot for a word crossing the grid (most crossings, then smallest grid), or null. */
function best_placement(array $grid, string $word): ?array
{
    $best = null;
    for ($i = 0, $len = strlen($word); $i < $len; $i++) {
        foreach ($grid['byLetter'][$word[$i]] ?? [] as [$r, $c]) {
            $cell = $grid['cells'][cell_key($r, $c)];
            // Cross a placed across word with a down word and the other way round.
            $dir = $cell[1] ? 'down' : 'across';
            [$row, $col] = $dir === 'across' ? [$r, $c - $i] : [$r - $i, $c];
            $crossings = placement_crossings($grid, $word, $row, $col, $dir);
            if ($crossings < 1) {
                continue;
            }
            $dr = $dir === 'across' ? 0 : 1;
            $area = bounds_area(grown_bounds($grid['bounds'], $row, $col, $row + $dr * ($len - 1), $col + (1 - $dr) * ($len - 1)));
            if ($best === null || $crossings > $best['crossings'] || ($crossings === $best['crossings'] && $area < $best['area'])) {
                $best = ['row' => $row, 'col' => $col, 'dir' => $dir, 'crossings' => $crossings, 'area' => $area];
            }
        }
    }
    return $best;
}

/**
 * One greedy grid from the candidates in the given order: the first word of 5+ letters goes across,
 * then each word goes where it crosses best; passes repeat while words still fit, up to the maximum.
 * One question per word: a word already in the grid is skipped.
 */
function greedy_grid(array $candidates): array
{
    $grid = empty_grid();
    $start = 0;
    foreach ($candidates as $i => $candidate) {
        if (strlen($candidate['word']) >= 5) {
            $start = $i;
            break;
        }
    }
    if (!$candidates) {
        return $grid;
    }
    $grid = place_word($grid, $candidates[$start], 0, 0, 'across');
    $used = [$candidates[$start]['word'] => true];
    unset($candidates[$start]);
    do {
        $added = false;
        foreach ($candidates as $i => $candidate) {
            if (count($grid['words']) >= CROSSWORD_MAX_WORDS) {
                break 2;
            }
            if (isset($used[$candidate['word']])) {
                unset($candidates[$i]);
                continue;
            }
            $spot = best_placement($grid, $candidate['word']);
            if ($spot !== null) {
                $grid = place_word($grid, $candidate, $spot['row'], $spot['col'], $spot['dir']);
                $used[$candidate['word']] = true;
                unset($candidates[$i]);
                $added = true;
            }
        }
    } while ($added);
    return $grid;
}

/** The stored layout of a grid: trimmed to its words, top-left cell at (0, 0). */
function grid_layout(array $grid): array
{
    [$minRow, $minCol, $maxRow, $maxCol] = $grid['bounds'];
    $words = array_map(function (array $w) use ($minRow, $minCol): array {
        $w['row'] -= $minRow;
        $w['col'] -= $minCol;
        return $w;
    }, $grid['words']);
    return ['width' => $maxCol - $minCol + 1, 'height' => $maxRow - $minRow + 1, 'words' => $words];
}

/**
 * The day's layout built from the candidates, or null when no try reaches CROSSWORD_MIN_WORDS.
 * CROSSWORD_TRIES grids, each from the candidates in an order seeded by the date and the try;
 * the one with the most words wins, then the smallest area, then the earliest try. No database.
 */
function build_crossword_layout(array $candidates, string $date): ?array
{
    $best = null;
    for ($try = 0; $try < CROSSWORD_TRIES; $try++) {
        $order = seeded_shuffle($candidates, seeded_random("crossword|$date|$try"));
        $grid = greedy_grid($order);
        $count = count($grid['words']);
        if ($count < CROSSWORD_MIN_WORDS) {
            continue;
        }
        $area = bounds_area($grid['bounds']);
        if ($best === null || $count > $best['count'] || ($count === $best['count'] && $area < $best['area'])) {
            $best = ['count' => $count, 'area' => $area, 'grid' => $grid];
        }
    }
    return $best === null ? null : grid_layout($best['grid']);
}

/** The stored layout of a day, or null when none is stored yet. */
function stored_layout(PDO $pdo, string $date): ?array
{
    $stmt = $pdo->prepare('SELECT layout FROM daily_crossword WHERE puzzle_date = :date');
    $stmt->execute([':date' => $date]);
    $json = $stmt->fetchColumn();
    if ($json === false) {
        return null;
    }
    $layout = json_decode((string) $json, true);
    if (!is_array($layout) || !isset($layout['width'], $layout['height']) || !is_array($layout['words'] ?? null)) {
        error_log("BrainRush API: the stored Daily Crossword layout of $date is not valid JSON.");
        json_response(['error' => CROSSWORD_UNAVAILABLE], 503);
    }
    return $layout;
}

/** The day's layout, built and stored on the first request (INSERT IGNORE, then read back). */
function ensure_crossword(PDO $pdo, string $date): array
{
    $layout = stored_layout($pdo, $date);
    if ($layout !== null) {
        return $layout;
    }
    $candidates = crossword_candidates($pdo);
    $built = build_crossword_layout($candidates, $date);
    if ($built === null) {
        error_log('BrainRush API: no Daily Crossword of ' . CROSSWORD_MIN_WORDS . "+ words for $date (" . count($candidates) . ' candidate words).');
        json_response(['error' => CROSSWORD_UNAVAILABLE], 503);
    }
    $pdo->prepare('INSERT IGNORE INTO daily_crossword (puzzle_date, layout) VALUES (:date, :layout)')
        ->execute([':date' => $date, ':layout' => json_encode($built)]);
    return stored_layout($pdo, $date) ?? $built;
}

/** Clue numbers: each start cell, left to right and top to bottom, gets the next number. */
function clue_numbers(array $words): array
{
    $starts = [];
    foreach ($words as $w) {
        $starts[(int) $w['row'] * 1000 + (int) $w['col']] = true;
    }
    ksort($starts);
    $numbers = [];
    $n = 0;
    foreach (array_keys($starts) as $key) {
        $numbers[$key] = ++$n;
    }
    return $numbers;
}

/** id => question row (with the category names) for the layout's questions that still exist. */
function clue_rows(PDO $pdo, array $ids): array
{
    if (!$ids) {
        return [];
    }
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare(
        "SELECT q.id, q.question, q.question_ar, c.name AS category_name, c.name_ar AS category_name_ar
           FROM questions q JOIN categories c ON c.id = q.category_id
          WHERE q.id IN ($placeholders)"
    );
    $stmt->execute($ids);
    $rows = [];
    foreach ($stmt->fetchAll() as $r) {
        $rows[(int) $r['id']] = $r;
    }
    return $rows;
}

/** The words of a layout as the game plays them: numbered, with their clue text; across first. */
function crossword_words(PDO $pdo, array $layout): array
{
    $numbers = clue_numbers($layout['words']);
    $rows = clue_rows($pdo, array_values(array_unique(array_map(fn(array $w): int => (int) $w['question_id'], $layout['words']))));
    $nonEmpty = fn($text): ?string => $text === null || trim((string) $text) === '' ? null : (string) $text;
    $words = [];
    foreach ($layout['words'] as $w) {
        $r = $rows[(int) $w['question_id']] ?? null; // null: the question was deleted (clue removed)
        $words[] = [
            'n'                => $numbers[(int) $w['row'] * 1000 + (int) $w['col']],
            'row'              => (int) $w['row'],
            'col'              => (int) $w['col'],
            'dir'              => $w['dir'] === 'down' ? 'down' : 'across',
            'length'           => (int) $w['length'],
            'answer'           => (string) $w['word'],
            'question'         => $r === null ? null : $r['question'],
            'question_ar'      => $r === null ? null : $nonEmpty($r['question_ar']),
            'category_name'    => $r === null ? null : $r['category_name'],
            'category_name_ar' => $r === null ? null : $nonEmpty($r['category_name_ar']),
        ];
    }
    usort($words, fn(array $a, array $b): int => [$a['dir'] === 'down', $a['n']] <=> [$b['dir'] === 'down', $b['n']]);
    return $words;
}

/** #N of a day: days since CROSSWORD_LAUNCH_DATE, plus 1; a day before the launch date is #1. */
function crossword_number(string $date): int
{
    $utc = new DateTimeZone('UTC');
    $days = (int) (new DateTimeImmutable(CROSSWORD_LAUNCH_DATE, $utc))->diff(new DateTimeImmutable($date, $utc))->format('%r%a');
    return max(0, $days) + 1;
}

/** The payload for the game day that holds $now; 503 when no grid can be made. */
function daily_crossword(PDO $pdo, DateTimeImmutable $now): array
{
    [$dayStart, $dayEnd] = game_day_bounds($now);
    $date = $dayStart->format('Y-m-d');
    $layout = ensure_crossword($pdo, $date);
    return [
        'date'            => $date,
        'number'          => crossword_number($date),
        'seconds_to_next' => max(1, $dayEnd->getTimestamp() - $now->getTimestamp()),
        'width'           => (int) $layout['width'],
        'height'          => (int) $layout['height'],
        'words'           => crossword_words($pdo, $layout),
    ];
}

// Included for its functions only: a local check can call build_crossword_layout(crossword_candidates(db()), $date)
// for any date without storing anything, e.g. php -r "const CROSSWORD_INCLUDE_ONLY = 1; require 'api/crossword.php'; ...".
if (defined('CROSSWORD_INCLUDE_ONLY')) {
    return;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    method_not_allowed(['GET']);
}
try {
    json_response(daily_crossword(db(), game_now()));
} catch (PDOException $e) {
    // 1146: daily_crossword is missing (sql/migrate-add-daily-crossword.sql not run yet).
    if ((int) ($e->errorInfo[1] ?? 0) === 1146) {
        error_log('BrainRush API: table daily_crossword is missing (run sql/migrate-add-daily-crossword.sql).');
        json_response(['error' => CROSSWORD_UNAVAILABLE], 503);
    }
    throw $e;
}

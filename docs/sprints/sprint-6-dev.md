# Sprint 6 — Developer note (Question bank: US-30, D-31)

Story: US-30 Question bank (Must), with the amended US-19, US-20, US-21, US-24 and US-25. US-22 (coverage grid) is retired. Rules: D-31 in `docs/product-backlog.md`. Plan: sections 2, 3, 4 and the README/deploy parts of section 5 of the approved Sprint 6 plan.

## Files created / changed

| File | Status | Purpose |
|---|---|---|
| `sql/schema.sql` | changed | `questions` has no `points`, `uq_slot`, `idx_questions_points` or `fk_questions_points` any more; new `UNIQUE KEY uq_category_question (category_id, question(191))`. Seed: the 30 original questions without points plus the 120 from `docs/question-bank.md` (25 per category). Header says pre-Sprint 6 databases must use the migration. |
| `sql/schema-hosted.sql` | changed | Same tables and seed as `schema.sql` (identical after the CREATE/USE lines, checked with `diff`). |
| `sql/migrate-question-bank.sql` | new | One-off, re-runnable migration for existing databases (local and hosted). |
| `api/questions.php` | changed | No `points` anywhere; a `points` field in a body is ignored. List order `c.name, q.id`. `board()` draws per category. New 409 text. |
| `api/categories.php` | changed | Playable = `COUNT(q.id) > 0 AND COUNT(q.id) >= (SELECT COUNT(*) FROM point_values)`; comments updated. |
| `api/points.php` | changed | List returns `{id, points}` (no `question_count`); delete has no 409/FK logic, it returns 200 or 404. Header updated. |
| `js/admin.js` | changed | Points select, `freeSlots()`, `renderPointOptions()`, `startAddFor()`, `renderCoverage()` and the slot constants removed. New categories text and point-value messages (below). |
| `admin.html` | changed | Points field, Points column and the Coverage panel removed; one-line hint about the pool under the Questions heading. |
| `css/style.css` | changed | Removed dead rules: `.item-meta`, `.coverage-table*`, `.slot*`, `.legend`, `.legend-swatch` (only used by the removed UI). |
| `README.md` | changed | Question bank and random draw (How to play, Admin usage), refresh keeps the drawn board, migration for existing installs, 25 questions per category. |
| `docs/deploy-hostinger.md` | changed | Step 3 says 25 questions and points pre-Sprint 6 DBs to the migration. Step 8.4 has the Sprint 6 migration import in phpMyAdmin (backup, expected result, re-run, duplicate-entry fix). Step 8.5 mentions the 7-day JS/CSS cache and CDN purge. |
| `docs/sprints/sprint-6-dev.md` | new | This note. |

**Not changed:** `js/game.js`, `index.html`, `api/db.php`, `.htaccess`. `parseBoard()` / `isValidBoard()` only need `points` ascending and, per category, a `{question, answer}` for every point value. The board payload keeps exactly that shape, so the game page works unchanged. D-12 also holds unchanged: the board is fetched once at Start and kept in the saved game, so a refresh does not redraw.

## How the story is met

### Data model (US-24, US-30 "Data and rules")
- A question has only `category_id`, `question`, `answer`. `uq_category_question` makes the same text twice in one category impossible. It is case-insensitive through the table's `utf8mb4_unicode_520_ci` collation. It also keeps the seed's `INSERT IGNORE` idempotent and is the index behind `fk_questions_category` (ON DELETE CASCADE kept).
- There is no FK from questions to `point_values`, so adding or deleting a point value never touches a question.

### Board draw (US-25, US-30 "Drawing the board")
- `board()` loads all questions of the requested categories (`ORDER BY id`), groups them per category, and for each one:
  - if it has fewer than P questions (P = number of point values): 400 `Category "X" needs at least P questions (has M)`;
  - otherwise `shuffle_secure()` (Fisher–Yates with `random_int`) shuffles a copy, and the first P go to the point values in ascending order. The draw is distinct by construction, and the row order is random.
- Unknown or invalid ids still return 400 as before; the payload shape and category order are unchanged.

### Writes (US-21, US-25)
- `validate_question()` checks category, question and answer only. A sent `points` is never read.
- Duplicate key (SQLSTATE 23000 via `is_duplicate_key`) → 409 `This category already has this question`. FK error → 400 `Category no longer exists`.
- `DELETE points.php?id=` → 200 `{deleted}`, or 404 if the id does not exist.

### Admin (US-19, US-20, US-21, US-22 retired)
- **Categories table:** the count cell is `M questions (needs P)`. The status badge is `Playable`, or `Not playable: X more needed` (red `badge-missing`), or `Not playable: no point values` when P = 0. The summary line reads "… playable (at least as many questions as point values)".
- **Point values:** no per-value count. Add → "Point value V added. Each category now needs at least N questions to stay playable." Delete → "Point value V deleted. Each category now needs at least N questions to stay playable." The confirm before delete stays (D-18).
- **Questions:** the form is category + question + answer, and the table has columns Category / Question / Answer / Actions. The edit title is "Edit question (Category)". The delete confirm shows the category and the first 60 characters of the question. Success messages name the category. Button `aria-label`s use the shortened question text.
- Coverage panel removed.

### Migration (`sql/migrate-question-bank.sql`)
Order: (1) `ADD UNIQUE KEY IF NOT EXISTS uq_category_question`, so the category FK keeps an index; (2) `DROP FOREIGN KEY IF EXISTS fk_questions_points`; (3) `DROP INDEX IF EXISTS uq_slot, DROP INDEX IF EXISTS idx_questions_points, DROP COLUMN IF EXISTS points`; (4) TEMPORARY table `bank_seed(id, category_name, question, answer)` with the 120 rows, then `INSERT IGNORE INTO questions … SELECT … JOIN categories c ON c.name = b.category_name ORDER BY b.id`, then drop the temp table. No CREATE DATABASE/USE.
- `DROP FOREIGN KEY IF EXISTS`, `DROP INDEX IF EXISTS`, `DROP COLUMN IF EXISTS` and `ADD UNIQUE KEY IF NOT EXISTS` were **verified on the local MariaDB 10.4.32**: a second run only gives Notes 1061/1091, with exit code 0.
- phpMyAdmin compatibility: the file was split with phpMyAdmin's own `BufferedQuery` (the splitter its SQL import uses, from `C:\xampp\phpMyAdmin`) into the expected 8 statements. An import runs on one connection, so the temporary table lives for the whole import.
- If an old DB holds the same question text twice in one category, step 1 fails with `Duplicate entry … for key 'uq_category_question'` and nothing is changed (tested). The header gives a query that lists the duplicates.

## How to run / test

- New install: `mysql -u root -p < sql/schema.sql` (hosted: import `sql/schema-hosted.sql` into the selected DB).
- Existing install: back up, then `mysql -u root -p brainrush < sql/migrate-question-bank.sql` (hosted: phpMyAdmin Import with the DB selected).
- `php -S localhost:8000`, then:
  - `GET /api/questions.php?board=1&categories=1,2,3` several times: different questions/order, same shape;
  - `GET /api/categories.php?playable=1`;
  - admin page: add/edit/delete a question without points.

## Verification done

- `php -l` on every file in `api/`: no syntax errors.
- `node --check`: **not run, Node.js is not installed** on this machine (not on PATH, not in the usual install folders). Instead, `admin.html` and `index.html` were loaded in headless Chrome (temporary profile) against the PHP server. `admin.js` rendered every panel: the categories table showed "26 questions (needs 6)" / "Playable", and a 1-question test category showed "1 question (needs 6)" / "Not playable: 5 more needed". The question table had 4 columns, there was no coverage or points select, and the point list had no counts. The game setup listed all 6 categories, and the console had no JS errors.
- **Backup** of the local DB before any change: `C:/Users/NB28970/Desktop/claude/brainrush-backup-pre-sprint6.sql` (mysqldump, outside the repo).
- **Migration on the real local `brainrush` DB, run 3 times** (twice as planned, plus once after the line-ending normalisation): every run exit 0. Run 2 and run 3 only gave Notes and duplicate-skip warnings. The count was 155 after each run.
  - Before: 36 questions (6 per category: 5 slot questions + 1 Egypt question at 600), point values 100–600.
  - After: **155 questions**: Geography 26, Science 25, History 26, Sports 26, Movies 26, Technology 26. The local DB had been edited earlier: Science's 500 question (id 10; corrected in the rework, first written as "200") is "How many bones are in the adult human body?" (answer 206), which is also bank Science #2. `INSERT IGNORE` correctly skipped it, so Science gets 19 new rows. All 120 bank pairs are present verbatim.
  - `SHOW CREATE TABLE questions` afterwards: columns `id, category_id, question, answer`; `PRIMARY KEY (id)`, `UNIQUE KEY uq_category_question (category_id, question(191))`, `CONSTRAINT fk_questions_category … ON DELETE CASCADE`; no `points`, `uq_slot`, `idx_questions_points` or `fk_questions_points`.
- **Migration on a scratch DB with the pure pre-Sprint 6 seed** (old `schema.sql`): run twice → 150, 25 per category. After renaming Geography and deleting Movies, a third run added nothing (125 = 150 − Movies' 25 via cascade).
- **Fresh install:** `schema.sql` imported twice into a scratch DB → 150 questions, 25 per category, 150 distinct questions and 150 distinct answers, 5 point values, settings 5/30. `schema-hosted.sql` imported twice into a pre-created scratch DB → 150. All scratch DBs dropped; `brainrush` was never dropped.
- **API smoke test** (`php -S 127.0.0.1:8765`, stopped afterwards). Write checks used temporary categories and a temporary point value 700, all deleted again; the DB ended at 6 point values and 155 questions.
  - Board 10× for 5 categories: 10 different boards, shape and order OK, no repeat within a board.
  - POST with `points: 999` → 201, response without points. Same text in another case → 409 "This category already has this question". Same text in another category → 201. PUT to a duplicate text → 409.
  - Missing answer → 400; unknown category → 400.
  - Board with a 1-question category → 400 `Category "S6 Smoke A" needs at least 6 questions (has 1)`; it is absent from `playable=1`. At exactly P questions it becomes playable, and the board shows all P in varying order.
  - Add point value 700 → the category with 6 questions drops out of playable and its board gives 400 (needs 7, has 6). Delete 700 → 200; delete again → 404.

## Known limitations / notes for tester and PO

- **Near-duplicates in the owner's local DB** (not in the seed, so fresh installs are clean). These came from earlier local edits and the Egypt questions, and the migration does not remove them (D-31 only blocks exact text):
  - Science: "What is the only metal that is liquid at room temperature?" (Mercury, owner) vs bank "Which metal is a liquid at normal room temperature?" (Mercury). Both are in the Science pool and can land on the same board.
  - Geography: "Mount Fuji is located in which country?" (Japan, owner edit) vs bank "Which country is made up mainly of the islands of Honshu, …?" (Japan).
  The owner may want to edit or delete one of each pair in the admin page.
- The duplicate check compares the first 191 characters (index prefix). Two different questions that share their first 191 characters in one category would be refused with the duplicate message. That is unlikely with questions under ~250 characters.
- With 0 point values the server treats any category with ≥ 1 question as playable, but the admin shows it as not playable. This mismatch existed before Sprint 6 and is unchanged; a board needs point values anyway.
- Hosted: the deploy order is code first, then the migration right away. Between the two steps, admin saves of questions would fail (old table still has `points NOT NULL`); the game itself keeps working. The hosted DB user needs the `CREATE TEMPORARY TABLES` privilege, which Hostinger's default DB user has (not verifiable from here).
- `docs/questions-600.md` was not changed (not in my scope; plan section 5 lists it for the PO).
- After deploy, Hostinger/CDN may serve the old `admin.js` for up to 7 days: Ctrl+F5 and maybe a CDN purge (in the deploy guide).

---

## Rework 2026-10-11 (D-31 amended: points per question again, FU-13)

After reviewing Sprint 6 the owner asked to "show the question score value in the questions list" and chose to bring back a point value on each question. The rules are in the amended D-31, the rewritten US-30 and the re-amended US-19/20/21/24/25 and FU-13. Everything above this section describes the first version. Where it disagrees, this section wins.

### What changed

| File | Change |
|---|---|
| `sql/schema.sql`, `sql/schema-hosted.sql` | `questions.points INT UNSIGNED NOT NULL` is back, with `fk_questions_points` → `point_values(points)` ON UPDATE CASCADE ON DELETE RESTRICT. Keys: `UNIQUE uq_category_question (category_id, question(191))`, `KEY idx_questions_slot (category_id, points)`, `KEY idx_questions_points (points)`. There is no `uq_slot`. Seed: the 30 original rows with their original points, plus the 120 bank rows with the points from `docs/question-bank.md`, so 5 per (category, point value). The bodies are still identical (`diff`). |
| `sql/migrate-question-bank.sql` | Rewritten. It now converts the **pre-Sprint 6 slot schema**: (1) `ADD UNIQUE KEY IF NOT EXISTS uq_category_question`, `ADD KEY IF NOT EXISTS idx_questions_slot`; (2) `DROP INDEX IF EXISTS uq_slot`. `points`, `idx_questions_points` and `fk_questions_points` stay. (3) TEMPORARY `bank_seed(id, category_name, points, question, answer)` → `INSERT IGNORE … SELECT … JOIN categories c ON c.name = b.category_name JOIN point_values pv ON pv.points = b.points`. Rows are skipped when the category is renamed or deleted, the point value is missing, or the text is a duplicate. The header keeps "back up first", "run once", the duplicate-finder query, and a warning that a DB converted by the first version (no `points`) must be restored first. |
| `api/questions.php` | `points` is required again and must exist in `point_values` (400 otherwise). It is returned in rows. The list is ordered by `c.name, q.points, q.id`; per category by `q.points, q.id`. `board()` groups the questions per (category, points) and picks `random_int(0, n-1)` in each cell. A category with an empty cell gives 400 `Category "X" is missing questions for: 600` (all missing values, ascending). `shuffle_secure()` is removed. The FK error message is "Category or point value no longer exists". The 409 text is unchanged. The payload shape is unchanged. |
| `api/categories.php` | Playable = `COUNT(q.id) > 0 AND COUNT(DISTINCT q.points) = (SELECT COUNT(*) FROM point_values)`. The response shape is unchanged; the admin computes the missing values from the question list it already loads. |
| `api/points.php` | Back to the pre-Sprint 6 code: `question_count` per value, and deleting a used value gives 409 `Cannot delete V: N question(s) still use it. …` (plus the FK-race catch). Unknown id → 404. |
| `admin.html` | The Points select is back in the question form (next to Category). The Points column is back in the question table. The hint text is updated. The D-32 label "Max categories per game" is kept. |
| `js/admin.js` | `fillPointOptions()`: all point values, no free-slot filtering, placeholder "Choose points". Validation "Choose a point value." (or "Add a point value first."). `points` is sent on POST and PUT. The table has a Points column. Edit title, delete confirm, success messages and aria-labels mention the points again. New `missingPoints(categoryId)`. `isPlayable` = point values exist and none is missing. The categories table shows "M questions" and either "Playable" or "Not playable: missing V1, V2". The point values list shows "N questions" again. Add message: "Categories need at least one V question to stay playable." `neededText()` is removed. D-32 edits kept (`'Max categories per game'`, "A game can use up to N."). |
| `css/style.css` | `.item-meta` restored (used by the per-value counts). The coverage rules stay removed. D-32's `.cat-label.is-locked` is untouched. |
| `README.md`, `docs/deploy-hostinger.md` | Updated for the per-cell draw, the per-value counts, the 409 on used point values, "missing V", and what the migration keeps (`points`) and skips. |

`js/game.js` was not touched (only D-32 changed it). The board payload is unchanged, so `parseBoard()` still accepts it. The game setup rendered all 6 categories in headless Chrome.

### Local DB (FU-13)

1. MariaDB was running (10.4.32). The settings at that point were `categories_per_game = 6` and `timer_seconds = 30`.
2. Safety dump of the Sprint 6 v1 state: `C:/Users/NB28970/Desktop/claude/brainrush-backup-sprint6-v1.sql` (155 questions, no `points`).
3. Restored `brainrush` from `C:/Users/NB28970/Desktop/claude/brainrush-backup-pre-sprint6.sql`: 36 questions, point values 100–600. The restore set `categories_per_game` back to 3.
4. Ran the new migration twice. Both runs exited 0; run 2 gave only Notes 1061/1091/1051 plus duplicate-skip warnings. The count was 155 after each run.
5. Put the settings back: `categories_per_game = 6`, `timer_seconds = 30` (checked via `GET api/settings.php`).

Result: point values 100–600, **155 questions**.

| Category | Total | 100 | 200 | 300 | 400 | 500 | 600 |
|---|---|---|---|---|---|---|---|
| Geography | 26 | 5 | 5 | 5 | 5 | 5 | 1 |
| Science | 25 | 5 | 5 | 5 | 5 | 4 | 1 |
| History | 26 | 5 | 5 | 5 | 5 | 5 | 1 |
| Sports | 26 | 5 | 5 | 5 | 5 | 5 | 1 |
| Movies | 26 | 5 | 5 | 5 | 5 | 5 | 1 |
| Technology | 26 | 5 | 5 | 5 | 5 | 5 | 1 |

Per value: 100–400 → 30 each, 500 → 29, 600 → 6.
- The 6 Egypt questions (ids 31–36) are still at 600.
- Science 500 has 4: the owner's "How many bones are in the adult human body?" is id 10 at **500**, not 200 as FU-13 says. It replaced the seed's speed-of-light question. Bank Science #2 (same text, also 500) was skipped as a duplicate, so the owner's row keeps its own value. All categories are playable.

`SHOW CREATE TABLE questions` (local, after the migration): `id`, `category_id`, `points int(10) unsigned NOT NULL`, `question`, `answer`; `PRIMARY KEY (id)`, `UNIQUE KEY uq_category_question (category_id, question(191))`, `KEY idx_questions_points (points)`, `KEY idx_questions_slot (category_id, points)`, `fk_questions_category … ON DELETE CASCADE`, `fk_questions_points … REFERENCES point_values (points) ON UPDATE CASCADE` (RESTRICT on delete is the default and is not printed).

### Verification

- `php -l` on all files in `api/`: clean. `node --check` is still not possible (no Node.js).
- **Fresh install:** `schema.sql` imported twice into a scratch DB → 150 questions, exactly 5 per (category, points), 150 distinct questions and 150 distinct answers. All 120 bank rows match `docs/question-bank.md` verbatim, including their points (and the Science #5 "ultraviolet rays" wording). `schema-hosted.sql` imported twice into a pre-created DB → 150. Scratch DBs dropped.
- **Migration on a scratch restore of the pre-Sprint 6 backup:** two runs → 155, same per-cell counts as the local result above.
- **Skip test** (scratch restore, 500 removed, Geography renamed): 110 rows = 30 old + 80 bank rows (no 500s, no Geography).
- **v1 DB** (scratch restore of the Sprint 6 v1 dump): stops at step 1 with `ERROR 1072 Key column 'points' doesn't exist in table`; nothing changed (still 155 rows, no new keys).
- **API smoke test** on `php -S 127.0.0.1:8765` (stopped afterwards; the owner's server on :8000 was left running and still answers). Temporary data was cleaned up; the DB ended at 155 questions and settings 6/30.
  - 10 boards over all 6 categories: all 10 differ, every cell's question has that cell's category and points, no repeat on a board, shape unchanged.
  - POST without points → 400 "points must be a positive integer"; points 999 → 400 "Point value 999 does not exist"; PUT points 12345 → 400.
  - A second question in the same (category, points) → 201. In a 2-question cell, 8 boards gave a 4/4 split.
  - Duplicate text in another case and at other points → 409 "This category already has this question" (POST and PUT). The same text in another category → 201.
  - A board with a category missing values → 400 `Category "S6 Smoke A" is missing questions for: 200, 300, 400, 500, 600`, later `…: 600`. That category is absent from `playable=1` until every value has a question.
  - DELETE point value 600 (used) → 409 "Cannot delete 600: 8 question(s) still use it. …". Adding 700 → `question_count: 0`; every category drops out of playable and the board gives 400 (missing 700). DELETE 700 → 200.
- **Headless Chrome** (`admin.html`): Geography "26 questions" / "Playable"; a 1-question test category "1 question" / "Not playable: missing 100, 200, 400, 500, 600"; the point list shows "30 questions" etc.; the Points select lists all values; the question table has the Points column, sorted by category, points, id; there is no Coverage panel; "Max categories per game" is present; no JS console errors.

### Notes

- **Concurrent session (D-32):** no conflicts. All its edits I was told to keep are intact. It left `js/admin.js`, `admin.html` and `README.md` with LF line endings (the other files are CRLF). Git normalizes line endings on commit, so I did not convert them.
- FU-10 (near-duplicates in the local DB) still applies: Science "only metal liquid…" (600, Egypt set) vs bank "Which metal is a liquid…" (Science, bank value), and Geography "Mount Fuji…" (400) vs the bank Honshu question.
- Any admin edits made on the local DB between the first migration and this restore are gone. The v1 dump above holds them if needed.

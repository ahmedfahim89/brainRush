# BrainRush — Sprint Plan

Owner: Scrum Master. Inputs: `docs/spec.md`, `docs/product-backlog.md` (US-01..US-30, decisions D-01..D-32, follow-ups FU-01..FU-15).

**Overall status (2026-10-14):** Sprints 1-6 Done and shipped. Sprint 6 (Question bank) and D-32 (pick 1..N categories) were merged via PR #11 on 2026-10-11, and the hosted DB is migrated (FU-11). Follow-ups FU-10..FU-15 are all Done; no open items. Later owner requests were shipped outside the sprint cycle: Egypt questions (PR #13, #16), Arabic localization (PR #17, #19), the Gen Z set (PR #18) and the AI set (PR #20).

| Sprint | Goal | Status |
|---|---|---|
| 1 | Foundation (DB + API) | Done |
| 2 | Admin page (+ US-29 hosting) | Done |
| 3 | Game setup and dynamic board | Done |
| 4 | Question, timer, scoring, results, persistence | Done |
| 5 | Polish (FU-03, FU-04, FU-05, FU-08) | Done |
| 6 | Question bank: random questions per new game (US-30, D-31; D-32 alongside) | Done (accepted 2026-10-11 after rework); owner Chrome check, commit/PR and hosted migration (FU-11) open |

Flow per sprint: game-developer implements -> game-tester tests (max 2 fix loops) -> product-owner accepts -> scrum-master updates status -> commit on branch `sprint-N` + PR to `main`.

---

## Definition of Done (applies to every sprint)

1. Code follows the spec's file structure (`index.html`, `admin.html`, `css/`, `js/`, `api/`, `sql/`); no hard-coded board size, point values or timer length (D-01, D-05).
2. All PHP files pass `php -l`.
3. All SQL that uses input goes through PDO prepared statements with bound parameters; PDO uses `ERRMODE_EXCEPTION`.
4. All user/DB text is rendered with `textContent` / DOM APIs — never `innerHTML` with data.
5. No credentials committed: `api/config.php` is git-ignored; only `api/config.example.php` (placeholders) is tracked. API errors never expose DSN, credentials or stack traces.
6. Every acceptance criterion of the sprint's stories is verified by the tester; the test report (`docs/sprints/sprint-N-test-report.md`) has no open Critical/Major bugs.
7. Developer note written (`docs/sprints/sprint-N-dev.md`).
8. Product Owner accepted the sprint's stories.

**Environment note (updated after Sprint 1):** The environment is now available: XAMPP with PHP 8.0.30 (`C:/xampp/php/php.exe`) and MariaDB 10.4 (managed via phpMyAdmin). Runtime checks (`php -l`, loading `sql/schema.sql`, `curl` API calls, browser flows against `php -S localhost:8000`) are therefore **no longer PENDING** for future sprints; the tester must run them. Any check from earlier sprints still marked PENDING (environment) must be re-run and closed before the final PR merge. **Compatibility constraint (backlog D-17):** all code must stay PHP 8.0 and MariaDB 10.4 compatible (no PHP 8.1+ features such as enums, readonly properties or `never`; no SQL syntax unsupported by MariaDB 10.4).

---

## Sprint 1 — Foundation (DB + API)

**Goal:** A seeded database and a complete, secure JSON API that admin and game can build on.
**Stories:** US-24, US-25, US-26, US-28
**Dependencies:** none (first sprint). Git Sprint 0 setup (`.gitignore`, `main` branch) done by orchestrator beforehand.

**Developer tasks**
1. `sql/schema.sql` — create `brainrush` (utf8mb4); tables `settings`, `point_values`, `categories`, `questions` with `uq_slot (category_id, points)`, FK to categories ON DELETE CASCADE, FK to `point_values(points)` ON UPDATE CASCADE / ON DELETE RESTRICT; seed settings (5, 30), points 100–500, 6 categories x 5 questions.
2. `api/config.example.php` — placeholder DB host/name/user/password; confirm `api/config.php` is in `.gitignore`.
3. `api/db.php` — PDO connection (`ERRMODE_EXCEPTION`, utf8mb4), `json_response($data, $code)`, `read_json_body()`, generic 500 handler (no DSN/trace leak), 405 helper.
4. `api/settings.php` — GET; PUT with validation (categories_per_game 1–10, timer_seconds 5–600, integers) -> 400 on error.
5. `api/points.php` — GET (ascending); POST (positive int 1–1,000,000, duplicate -> 409, D-13); DELETE (in use -> 409).
6. `api/categories.php` — GET with question counts; `?playable=1` (has every point value); POST/PUT (trimmed, non-empty, max 100, unique case-insensitive -> 409, D-14); DELETE (cascade).
7. `api/questions.php` — GET `?category_id=`; GET `?board=1&categories=...` (shape per US-25, requested order, bad ids -> 400); POST/PUT (validation, SQLSTATE 23000 -> 409 "This category already has a <points> question"); DELETE.
8. `README.md` — stub with setup: install PHP/MySQL, run schema, copy `config.example.php` -> `config.php` and set own credentials, `php -S localhost:8000`, warning that admin is unprotected and must not be exposed publicly.
9. `docs/sprints/sprint-1-dev.md`.

**Tester focus:** `php -l` on all `api/*.php`; schema keys/FKs/seed counts; every endpoint's status codes (200/201/400/404/405/409/500); `playable=1` after adding a point value; board payload shape and order; SQL-injection string stored literally; no credentials/trace in error responses; `config.php` not tracked.

**Status:** Done

**Outcome:** US-24, US-25, US-26, US-28 accepted by the Product Owner (see `docs/sprints/sprint-1-test-report.md`). No carry-overs. Environment now available (XAMPP, PHP 8.0.30, MariaDB 10.4), so runtime checks are no longer PENDING from Sprint 2 onward; code must stay PHP 8.0 / MariaDB 10.4 compatible (D-17).

---

## Sprint 2 — Admin page

**Goal:** An admin can configure settings and point values and fully manage categories and questions, seeing coverage at a glance.
**Stories:** US-18, US-19, US-20, US-21, US-22, US-23, US-29 (added after the sprint, see Outcome)
**Dependencies:** Sprint 1 (all endpoints).

**Developer tasks**
1. `admin.html` — panels: Settings, Point values, Categories, Questions, Coverage grid; inline error/success areas per panel; link to game.
2. `css/style.css` — shared base styles (dark theme, readable text) + admin panels/tables/coverage grid.
3. `js/admin.js` — fetch wrapper that surfaces API `error` text inline (no raw JSON).
4. `js/admin.js` — Settings load/save with client + server validation messages.
5. `js/admin.js` — Point values list ascending, add, delete (409 shown inline).
6. `js/admin.js` — Categories list with "x / P" count, add, inline rename, delete with confirm warning about questions.
7. `js/admin.js` — Questions: category filter, table, Add/Edit form (points dropdown = free slots only when adding; edit can move to a free slot), delete with confirm, 409 inline.
8. `js/admin.js` — Coverage grid categories x point values, filled/empty marking, refreshed after every change.
9. `index.html` placeholder link to `admin.html` (full game page comes in Sprint 3).
10. `docs/sprints/sprint-2-dev.md`.

**Tester focus:** spec verification step 3 (add category, fill slots, duplicate -> 409, edit/delete, delete category); settings range errors; add 1000 -> new empty coverage column + category no longer playable; delete used point value blocked; all errors inline; no `innerHTML` with data; browser console free of JS errors.

**Status:** Done

**Outcome:** US-18, US-19, US-20, US-21, US-22, US-23 accepted by the Product Owner (see `docs/sprints/sprint-2-test-report.md`; 33/33 checks pass on PHP 8.0.30 / MariaDB 10.4, nothing PENDING). 1 fix loop (BUG-2-01, Minor cosmetic: category names wrapping mid-word at 1024 px; fixed and verified in re-test); no open Critical/Major/Minor bugs. No story carry-overs; two non-blocking follow-ups moved to Sprint 4: O-5 (long unbroken name in `.msg` causes horizontal page scroll) and O-4 (README note on `expose_php=Off`). New decisions: D-18 (every admin delete asks for a confirm; coverage cells may prefill forms), D-19 (admin targets desktop >= 1024 px; messages and long names must not make the page scroll horizontally).

**US-29 (Hosted deployment with protected admin):** a stakeholder request (D-20) that came in after the Sprint 2 stories were done. It was built on branch `hosting` (commit a0ae85c, merged to `main` via PR #3) and is recorded as part of Sprint 2. Work covered: Basic Auth on admin writes, with writes allowed only from loopback when no admin keys are set; `api/auth.php`; HTTPS redirect, header pass-through and blocked private paths in `.htaccess`; `sql/schema-hosted.sql`; and `docs/deploy-hostinger.md`. The tester passed 24 local checks and the live-deploy C-1 checklist (`docs/hosting-test-report.md`), and the PO **accepted** it on 2026-10-04. Follow-ups: the `password.txt` block in `.htaccess` was done on 2026-10-05; the deploy-guide note and the hosted `/password.txt` 403/404 check are in Sprint 4.

---

## Sprint 3 — Game setup and dynamic board

**Goal:** The host can configure a game (mode, names, colors, categories, timer) and start it on a correctly sized board with a live scoreboard.
**Stories:** US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-09
**Dependencies:** Sprint 1 (`settings.php`, `categories.php?playable=1`, `questions.php?board=1`); Sprint 2 for creating test data (e.g. point value 1000, 6 categories).

**Developer tasks**
1. `index.html` — screen containers: Setup, Board, Question, Results (latter two as empty shells); link to admin.
2. `js/game.js` — central `state` object + screen switcher; single `saveState()` / `loadState()` module writing to `localStorage` on every change (full restore behaviour accepted in Sprint 4, US-17).
3. `js/game.js` — Setup: Players/Teams toggle (6/4 limits, D-07 blocking message), Add/Remove entries (min 1), validation (required, unique trimmed case-insensitive, D-02).
4. `js/game.js` — 6-color palette, distinct auto-assignment, click swatch to cycle to next free color, freed colors reusable.
5. `js/game.js` — Load settings + playable categories; checklist "Select N categories"; exactly-N validation; not-enough-playable message + admin link, Start disabled (D-11).
6. `js/game.js` — Timer override field pre-filled from settings, 5–600 integer validation, stored in game state only.
7. `js/game.js` — Start Game: call board endpoint, error stays on setup with inputs intact, scores to 0, board data stored in state (D-12).
8. `js/game.js` + `css/style.css` — dynamic CSS grid `repeat(N, 1fr)`, header = categories in selection order, rows = point values ascending, label font scales for large values (10000).
9. `js/game.js` — Scoreboard strip in contestant colors, negative scores, +/- buttons stepping by smallest point value (D-05).
10. `docs/sprints/sprint-3-dev.md`.

**Tester focus:** 7 players / 5 teams blocked; mode switch with 5–6 names; empty/duplicate names; color distinctness and cycling; exactly-N rule; not-enough-playable path; timer validation; 5x5 and 6x6 (with 1000) boards; 10000 label fits; manual +/- step; XSS name rendered as text; API failure on Start.

**Status:** Done

**Outcome:** US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-09 accepted by the Product Owner (see `docs/sprints/sprint-3-test-report.md`; 44/44 checks pass on PHP 8.0.30 / MariaDB 10.4, nothing PENDING). 0 fix loops, 0 bugs. No story carry-overs; four non-blocking follow-ups (O-1..O-4) and one security item (`password.txt`) moved to Sprint 4. New decisions: D-21 (interim "Quit to setup" button, removed in Sprint 4), D-22 (contestant names max 30 characters), D-23 (when Start is disabled vs. errors on click), D-24 (setup form not saved on refresh). Environment incident: the local MariaDB crashed once and hung once during developer testing (restarted; crash dump at `C:\xampp\mysql\data\mysqld.dmp`); the tester did not reproduce it. If it recurs, check the dump and XAMPP MySQL error log before further sprint testing.

---

## Sprint 4 — Question, timer, scoring, results, persistence

**Goal:** A full game can be played end to end — questions with timer, scoring, colored cells, results with tie handling — surviving page refresh, with a final security sweep and finished README.
**Stories:** US-08, US-10, US-11, US-12, US-13, US-14, US-15, US-16, US-17, US-27
**Dependencies:** Sprint 3 (state, board, scoreboard, save/load layer).

**Developer tasks**
1. `js/game.js` — Open question from unused cell: "<Category> – <points>", large question text, hidden answer, Show Answer.
2. `js/game.js` — Countdown from game timer: number + shrinking bar, red at <= T/3, Web Audio beep at 0 and stop (D-03), Pause/Resume/Reset.
3. `js/game.js` — Per-contestant Correct (+p) / Wrong (-p) rows in color; once-per-contestant, single Correct, Wrong still allowed after Correct (D-08); no undo (D-06).
4. `js/game.js` — Back to Board: stop timer, mark cell used, owner color + small name or grey; disabled cells ignore clicks.
5. `js/game.js` — End Game with confirm (D-09); prominent offer when all N x P cells used (D-01).
6. `js/game.js` — Results: sorted by score desc, color, winner highlight, tie text "X and Y" / "X, Y and Z" (D-10); New Game clears saved state and reloads settings (D-15).
7. `js/game.js` — Persistence: restore board, scores, used cells/colors, timer length; open question reopens with scoring preserved and timer restarted (D-04); Results restored; corrupt/missing data -> Setup without JS error.
8. `css/style.css` — question screen large type, timer bar/red state, cell owner colors/grey, results/winner styles.
9. Security sweep across `js/game.js` and `js/admin.js`: no `innerHTML` with data; XSS payload test strings render as text.
10. `README.md` — final: full setup, how to play, admin usage, config/credentials and public-exposure warning kept.
11. `css/style.css` — carry-over from Sprint 2 (O-5, D-19): add `overflow-wrap: anywhere` to `.msg` so a very long unbroken name in a success/error message no longer makes the admin page scroll horizontally at >= 1024 px.
12. `README.md` — carry-over from Sprint 2 (O-4): add a hosting-hardening note recommending `expose_php=Off` (hides the `X-Powered-By: PHP/x.y.z` header). Part of the final README (task 10).
13. `css/style.css` — carry-over from Sprint 3 (O-1, Could): remove the unused `--cols: 5; --digits: 3;` fallbacks from `.board` (JS always sets them inline); no hard-coded board values remain.
14. `index.html` + `js/game.js` — carry-over from Sprint 3 (O-2, Must, US-10, D-21): remove the "Quit to setup" button and its handler once End Game and New Game exist; verify no remaining path discards a game without a confirm (End Game -> confirm -> Results -> New Game is the only way out).
15. `js/game.js` — carry-over from Sprint 3 (O-3, Should, US-17, D-22): `loadState()` rejects a saved game with any contestant name empty after trimming or longer than 30 characters and shows Setup without a JS error.
16. ~~`.htaccess` — deny `password.txt`~~ **Done 2026-10-05** (before Sprint 4): `password.txt` added to the `RewriteRule` block list and to the `FilesMatch` deny list. Developer only needs to keep it in place; must not open or print the file.
17. `docs/deploy-hostinger.md` — carry-over from Sprint 3 (security, US-29): document that `password.txt` (and any local credentials file) must never be uploaded to the host, and that `.htaccess` must be uploaded so the `password.txt` block is active.
18. `docs/sprints/sprint-4-dev.md`.

**Tester focus:** spec verification step 4 end to end; timer at 20 s (from override), red third, beep, pause/resume/reset; wrong then correct scoring and button disabling; grey cell; End Game early and auto-offer on full board (incl. 6x6); results winner/tie/single contestant; refresh on board, mid-question and on results; corrupt localStorage; `<img src=x onerror=alert(1)>` in category/question/answer/name in game and admin; console free of errors; re-check Sprint 2 O-5 in `admin.html` at 1024 px (add a 100-character unbroken category name: success message wraps, no horizontal page scroll; then delete it) and confirm the README mentions `expose_php=Off`; re-run any PENDING (environment) checks from Sprints 1–3 if PHP/MariaDB now available. Sprint 3 carry-overs: O-1 `.board` in `css/style.css` has no `--cols`/`--digits` fallbacks and 5x5, 6x6 and 1-column boards still render correctly; O-2 no "Quit to setup" button anywhere, and every route out of a game (End Game, New Game, refresh) either asks for confirm or goes through Results; O-3 hand-edit localStorage with an empty/whitespace name and a 31-character name -> Setup shown, no console error (30 characters still restores); O-4 visual check of Setup, Board, Question and Results at 1366x768 and 1920x1080 (no clipping, no unintended scroll, labels readable); security: locally and on the hosted site `/password.txt` returns 403 or 404 (never the content; tester must not open the file), and `docs/deploy-hostinger.md` lists it as never uploaded. If the local MariaDB crashes or hangs again, record it in the test report (Sprint 3 incident, not reproduced so far).

**Status:** Done

**Outcome:** US-08, US-10, US-11, US-12, US-13, US-14, US-15, US-16, US-17, US-27 accepted by the Product Owner (see `docs/sprints/sprint-4-test-report.md`; 55/55 runnable checks pass on PHP 8.0.30 / MariaDB 10.4; 1 PENDING: hosted `/password.txt` check, no hosted URL; 1 not run by instruction: `/password.txt` through `php -S`). 0 fix loops, 0 bugs (0 Critical / Major / Minor), 6 non-blocking observations. No story carry-overs; Sprint 2 and 3 carry-overs (O-1..O-5, `expose_php=Off` README note, `password.txt` deploy note) are done and verified. New decisions: D-25 (revealed answer stays shown after refresh), D-26 (End Game on a full board skips the confirm), D-27 (shared ranks on Results), D-28 (saved-game `version`, v1 board save migrated), D-29 (beep may be silent after a refresh with no click), D-30 (target screens 1366x768 and 1920x1080, no horizontal scroll). Environment incident ENV-4-01: second MariaDB InnoDB hang (recurrence of the Sprint 3 incident); it left test point value 1000 in the dev DB, so no category is playable until it is deleted (FU-06). Follow-ups FU-01..FU-07 are listed in "Follow-ups" below.

---

## Sprint 5 — Polish (follow-ups FU-03, FU-04, FU-05, FU-08)

**Goal:** Close the optional layout polish follow-ups from Sprint 4 (FU-03, FU-04, FU-05) and the Results-screen follow-up FU-08. Requested by the owner on 2026-10-05 (FU-08: "implement D-30", scoped to FU-08).
**Stories:** none (no new stories; backlog items FU-03, FU-04, FU-05, FU-08)
**Dependencies:** Sprint 4 (board, question and results screens).

**Developer tasks**
1. `css/style.css` + `js/game.js` — FU-03 (Should, D-30): 6x6 board + 6-contestant scoreboard fits 1366x768 with no page scroll (was 22 px over).
2. `css/style.css` + `js/game.js` — FU-04 (Could): question font scales down with text length so questions up to about 250 characters fit the question column at 1366x768. Long answers are not scaled (D-30).
3. `css/style.css` — FU-05 (Could): grey (unanswered) cells use the same points-label size as owned cells.
4. `css/style.css` — FU-08 (Could, D-30): Results with 6 contestants fits 1366x768 with no page scroll (was 3 px over); trim the Results spacing (`line-height: 1.15` on `.result-score`).
5. `docs/sprints/sprint-5-dev.md`.

**Tester focus:** 1366x768 viewport with 6x6 board and 6 contestants (no vertical or horizontal scroll); 250-character question; grey vs owned cell label size; Results with 6 contestants (no scroll) and ties of 3 or more; regression on the Sprint 4 flows.

**Status:** Done

**Outcome:** Flow: developer, tester, PO. The tester passed 18/18 checks with 0 bugs (see `docs/sprints/sprint-5-test-report.md`). The PO accepted FU-03, FU-04 and FU-05 on 2026-10-05. No carry-overs. Files changed: `css/style.css`, `js/game.js`; dev note `docs/sprints/sprint-5-dev.md`. D-30 amended (sizes mean the browser viewport).

**FU-08 (added after the first three):** on the owner's request ("implement D-30", scoped to FU-08), the developer added `line-height: 1.15` on `.result-score` in `css/style.css`. The tester passed 10/10 FU-08 checks with 0 bugs: Results with 6 contestants is now 768 px at 1366x768, and ties of 3 or more went from 818 to 768 px. The PO accepted FU-08 on 2026-10-05, and accepted OBS-8 (long-name tie headline wraps) and OBS-9 (all-W/M 30-character names) as limits under D-30. D-30 was amended again: Results with up to 6 contestants should fit 1366x768, and vertical scroll is accepted there when very long names make the tie headline or the rows wrap. FU-09 was widened so the owner's laptop check also covers Results with 6 contestants.

New open follow-up FU-09 (Owner) was added by the PO (see "Follow-ups" below).

---

## Sprint 6 — Question bank (US-30, D-31)

**Goal:** "Question bank — random questions per new game." Each category holds a bank of questions; every new game draws a random question for each board cell, so the same group can replay without seeing the same board. Owner decision D-31 (2026-10-11) replaces the old "exactly one question per category + point value slot" rule. **Reworked after owner review (2026-10-11):** the first version dropped the point value from questions and drew P distinct questions per category onto random rows. The owner asked to show the score value in the questions list and amended D-31: **each question has a point value again**, and each board cell draws one random question from that category's questions at that value (several questions allowed per category + value).
**Stories:** US-30 (new, Must; rewritten in the rework). Amendments to already-delivered stories: US-19, US-20, US-21, US-24, US-25 (re-amended in the rework). US-22 (coverage grid) stays **retired** by D-31 (no code left, not tested any more).
**Delivered alongside (not a Sprint 6 story):** D-32 (host picks 1..N categories; `categories_per_game` becomes "Max categories per game"; US-04 amended), built by another session in the same working tree. It touched `js/game.js`, `js/admin.js`, `admin.html`, `css/style.css` and `README.md`, and was regression-checked in the re-test (4 checks, all PASS: setup text and counter, ticking 1..N with the other boxes locking at N, Start with 0 blocked and with fewer than N working, admin label). It is noted by the PO, not part of the Sprint 6 acceptance.
**Dependencies:** Sprints 1-5 (schema, API, admin page, game page). The board payload keeps its shape and D-12 still holds (the board is drawn once at Start and kept in local state, so a refresh does not redraw). `index.html`, `api/db.php` and `.htaccess` are unchanged; the rework did not touch `js/game.js` (only D-32 did).

**Developer tasks (first version; superseded where the rework tasks below say otherwise)**
1. `sql/schema.sql` + `sql/schema-hosted.sql` — `questions` loses `points`, `uq_slot`, `idx_questions_points` and the FK to `point_values`; new `UNIQUE KEY uq_category_question (category_id, question(191))` (case-insensitive via collation); FK to categories ON DELETE CASCADE kept. Seed: 30 original questions plus 120 from `docs/question-bank.md` = 25 per category (150). Re-importable with no errors or duplicates. The two files stay identical after their CREATE DATABASE/USE lines.
2. `docs/question-bank.md` (PO content) — exactly 120 questions, 20 per category, no overlap with the seed or each other; Science #5 reworded at acceptance (OBS-5).
3. `sql/migrate-question-bank.sql` (new) — one-off, re-runnable migration for existing databases (local and hosted): add unique key, drop FK/slot key/`points` column, insert the 120 bank questions by category name with `INSERT IGNORE`. Aborts cleanly on an existing same-text duplicate in one category.
4. `api/questions.php` — no `points` anywhere (a `points` field in a body is ignored); duplicate text in a category -> 409 "This category already has this question"; `board()` draws P distinct questions per category with a secure shuffle and returns the same payload shape; category with M < P -> 400 `Category "X" needs at least P questions (has M)`.
5. `api/categories.php` — playable = at least 1 question and at least as many questions as point values.
6. `api/points.php` — list returns `{id, points}` only; delete has no 409/FK logic (200 or 404).
7. `admin.html` + `js/admin.js` — Points field/column and the Coverage panel removed; categories show "M questions (needs P)" and a red "Not playable: X more needed" badge; point-value add/delete messages state how many questions each category now needs; question form is category + question + answer.
8. `css/style.css` — remove admin-only rules left dead by the removed UI (`.item-meta`, `.coverage-table*`, `.slot*`, `.legend*`).
9. `README.md` + `docs/deploy-hostinger.md` — question bank and random draw, 25 questions per category, migration for existing installs (hosted: backup, phpMyAdmin import, `CREATE TEMPORARY TABLES` privilege, 7-day JS/CSS cache and CDN purge).
10. `docs/sprints/sprint-6-dev.md`.

**Rework tasks (2026-10-11, D-31 amended; as delivered, these win over tasks 1, 3-9)**
11. `sql/schema.sql` + `sql/schema-hosted.sql` — `questions.points INT UNSIGNED NOT NULL` is back with `fk_questions_points` to `point_values(points)` ON UPDATE CASCADE / ON DELETE RESTRICT. Keys: `uq_category_question (category_id, question(191))`, `idx_questions_slot (category_id, points)`, `idx_questions_points (points)`; no `uq_slot`. Seed: 30 original rows plus 120 bank rows with the points from `docs/question-bank.md` = 150 questions, exactly 5 per (category, value 100-500). Bodies stay identical in both files.
12. `docs/question-bank.md` (PO) — 4 questions per value 100-500 per category (20 per category), ranked by relative difficulty; Science #5 reworded.
13. `sql/migrate-question-bank.sql` — rewritten to convert the **pre-Sprint 6 slot schema** and keep `points`: add `uq_category_question` and `idx_questions_slot`, drop `uq_slot`, load the 120 bank rows (with points) by category name and point value with `INSERT IGNORE`. Skips renamed/deleted categories, missing point values and duplicate text; re-runnable; aborts cleanly on a same-text duplicate in a category and on a DB converted by the first version (which has no `points`; restore it first).
14. `api/questions.php` — `points` required again and must exist in `point_values` (400 otherwise), returned in rows; list ordered by category, points, id. `board()` picks `random_int` per (category, points) cell; a category with an empty cell gives 400 `Category "X" is missing questions for: 600` (all missing values, ascending). Payload shape unchanged. `shuffle_secure()` removed.
15. `api/categories.php` — playable = has questions and `COUNT(DISTINCT points)` equals the number of point values.
16. `api/points.php` — back to the pre-Sprint 6 behaviour: `question_count` per value; deleting a used value gives 409.
17. `admin.html` + `js/admin.js` — Points dropdown (required, "Choose a point value.") and Points column are back; categories show "M questions" and "Playable" or "Not playable: missing V1, V2"; point-value list shows per-value counts; add message "Categories need at least one V question to stay playable." No Coverage panel. D-32 edits kept.
18. `css/style.css` — `.item-meta` restored for the per-value counts; coverage rules stay removed.
19. `README.md` + `docs/deploy-hostinger.md` — per-cell draw, per-value counts, 409 on used point values, "missing V", what the migration keeps and skips.
20. **FU-13 (local DB, Done 2026-10-11):** safety dump of the first-version state (`brainrush-backup-sprint6-v1.sql`, outside the repo), restore of `brainrush-backup-pre-sprint6.sql`, migration run twice (155 questions, point values 100-600), settings put back to `categories_per_game = 6`, `timer_seconds = 30`. Science 500 has 4 questions (the owner's "How many bones" row is at 500), and each category has one 600 question (the Egypt set).
21. `docs/sprints/sprint-6-dev.md` — "Rework 2026-10-11" section.

**Tester focus (first run):** draw randomness and distinctness over repeated board requests; board payload shape and 400s; refresh keeps the drawn board (D-12) and New Game draws a fresh one; playable rule when adding/deleting a point value; case-insensitive duplicate 409; fresh install and migration (including re-run and duplicate abort) on scratch DBs; admin UI without points/coverage; US-29 auth regression; game-flow, 1366x768 / 1920x1080 and console regression.

**Tester focus (re-test after rework):** required and existing `points` (400s); several questions per (category, value); playable only when every value has a question; per-cell random draw (10 boards, every cell valid, no repeats, single-question pools fixed); 400 listing every missing value; delete of a used point value 409; fresh install (150, 5 per cell) and migration of the pre-Sprint 6 backup (36 to 155, re-run, skip test, duplicate abort, first-version DB refused); admin Points column, dropdown and per-value counts; bank content (4 per value, no duplicates); US-29 auth regression; D-32 regression; game cycle, Results, refresh, layout and console; local DB restored to its starting state.

**Definition of Done (Sprint 6, against the global DoD)**

| # | DoD item | Status |
|---|---|---|
| 1 | Spec file structure; no hard-coded board size, point values or timer | Met (playable rule compares with `COUNT(*)` of point values; admin "missing V" comes from the point-value list) |
| 2 | `php -l` clean on all `api/*.php` | Met (8 files, re-checked after the rework) |
| 3 | Prepared statements only | Met (`board()` builds only `?` placeholders) |
| 4 | `textContent` / DOM APIs only | Met (no `innerHTML` with data) |
| 5 | No credentials committed; `api/config.php` git-ignored | Met |
| 6 | Tester report, no open Critical/Major bugs | Met: first run 35 PASS; re-test after rework 36 PASS, 0 FAIL, 0 PENDING, 0 bugs, 5 observations (`docs/sprints/sprint-6-test-report.md`) |
| 7 | Developer note | Met (`docs/sprints/sprint-6-dev.md`, incl. "Rework 2026-10-11") |
| 8 | PO accepted | Met, re-accepted after rework 2026-10-11 |
| + | PHP 8.0 / MariaDB 10.4 compatible (D-17) | Met (tested on PHP 8.0.30, MariaDB 10.4.32) |
| + | Owner's local Chrome check | Met (before the PR, 2026-10-11) |
| + | Commit on `sprint-6` and PR to `main` (owner merges) | Met (PR #11, merged 2026-10-11) |
| + | Hosted migration and smoke check (FU-11) | Met (owner confirmed 2026-10-12) |

**Status:** Done and shipped (accepted 2026-10-11 after rework, merged via PR #11 on 2026-10-11, hosted DB migrated by 2026-10-12)

**Outcome:** The first version (no points on questions) was developed, tested (35 PASS) and accepted on 2026-10-11, then reworked after the owner's review (D-31 amended: points per question, per-cell random draw). The rework was re-tested (36 PASS, 0 FAIL, 0 PENDING, 0 bugs, 5 observations OBS-R1..OBS-R5) and **re-accepted by the Product Owner on 2026-10-11**: US-30 (rewritten, 17 criteria) and the re-amended US-19, US-20, US-21, US-24, US-25 accepted; US-22 stays retired. The first-version PO acceptance is superseded. Fresh install gives 150 questions (5 per category and value); the migration takes the pre-Sprint 6 local DB to 155 and is re-runnable. FU-13 (local DB restore and re-migration) is Done. No story carry-overs. D-31 as amended at the first acceptance still applies: a duplicate question text is rejected case- and accent-insensitively in the first 191 characters (OBS-2, OBS-3 of the first run). D-32 was delivered alongside and regression-checked (PASS).

**Shipping:** the owner checked the sprint locally in Chrome, then the work (including D-32) was merged to `main` via PR #11 on 2026-10-11. The hosted migration (FU-11) was confirmed by the owner on 2026-10-12. The follow-ups from the acceptance (FU-10, FU-12, FU-14, FU-15) are all done; see "Follow-ups (after Sprint 6)" below.

---

## Story coverage

| Sprint | Stories |
|---|---|
| 1 | US-24, US-25, US-26, US-28 |
| 2 | US-18, US-19, US-20, US-21, US-22 (retired in Sprint 6), US-23, US-29 |
| 3 | US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-09 |
| 4 | US-08, US-10, US-11, US-12, US-13, US-14, US-15, US-16, US-17, US-27 |
| 5 (polish) | none (follow-ups FU-03, FU-04, FU-05, FU-08) |
| 6 | US-30 (amends US-19, US-20, US-21, US-24, US-25; US-22 stays retired); D-32 (US-04 amended) delivered alongside |

All 30 stories appear exactly once; 29 are delivered (accepted) and US-22 is retired (D-31). The amended stories stay in the sprint that first delivered them; Sprint 6 changed their behaviour. Sprint 5 (polish) carries no stories, only follow-ups FU-03, FU-04, FU-05 and FU-08. US-29 (hosted deployment with protected admin) was built on the `hosting` branch after the Sprint 2 stories and is recorded as part of Sprint 2 (owner decision 2026-10-05). Its follow-ups were handled in Sprint 4: the `docs/deploy-hostinger.md` note is done; the hosted `/password.txt` smoke check was done by the owner on 2026-10-05 (FU-01). Notes: US-17 (persistence) is placed in Sprint 4 because its criteria cover the question and results screens; Sprint 3 builds the save/load layer as an enabler. US-27 (XSS) is accepted in Sprint 4 once all UI exists, but DoD item 4 enforces `textContent` from Sprint 2 onward. US-26 is accepted in Sprint 1 where all SQL lives; DoD item 3 keeps it enforced later.

---

## Follow-ups (after Sprint 5)

All sprints (1-5) are done. Sprint 5 (polish) added no stories. Full wording and priorities are in `docs/product-backlog.md` (FU-01..FU-09); this is the by-owner view.

**Owner / environment actions (no developer work)**

| ID | Priority | Action | Status |
|---|---|---|---|
| FU-01 | Must | After the redeploy, check the hosted `/password.txt` (and the other private paths from US-29) returns 403/404, status only, and record it in `docs/sprints/sprint-4-test-report.md`. The redeploy is not done until this passes. | Done 2026-10-05 |
| FU-02 | Must | Move `password.txt` out of the project folder (it is the web root; `php -S` serves it). | Won't do (owner decision 2026-10-05) |
| FU-06 | Must (environment) | Before the next session: restart MariaDB, delete the leftover point value 1000 (no questions) so categories are playable again, check the antivirus exclusion for `C:\xampp\mysql\data` (ENV-4-01). | Done 2026-10-05 |
| FU-07 | Could (environment) | Update or repoint the local XAMPP Apache checkout (`C:\xampp\htdocs\BrainRush`) before using it for end-to-end checks. | Done 2026-10-05 |
| FU-09 | Could | Owner: quick visual check of a 6x6 board with 6 players, and of the Results screen with 6 contestants, in a real windowed 1366x768 browser. A small scroll is accepted (D-30); raise a follow-up only if labels or owner names are hard to read. | Done 2026-10-05 (passed) |

**Developer polish**

| ID | Priority | Item | Status |
|---|---|---|---|
| FU-03 | Should | 6x6 board + 6-contestant scoreboard fits 1366x768 with no page scroll (D-30). | Done 2026-10-05 (Sprint 5) |
| FU-04 | Could | Question font scales with text length so questions up to about 250 characters fit at 1366x768. | Done 2026-10-05 (Sprint 5) |
| FU-05 | Could | Grey (unanswered) cells use the same points-label size as owned cells. | Done 2026-10-05 (Sprint 5) |
| FU-08 | Could | Results with 6 contestants fits 1366x768 with no page scroll (was 3 px over, existed before Sprint 5). Long-name ties may still scroll (D-30). Added by the PO. | Done 2026-10-05 (Sprint 5) |

**Open items after Sprint 5:** none. All follow-ups FU-01..FU-09 are closed (FU-02 won't do, by owner decision).

---

## Follow-ups (after Sprint 6)

Added by the PO at Sprint 6 acceptance and re-acceptance on 2026-10-11. Full wording is in `docs/product-backlog.md` ("Follow-ups after Sprint 6").

| ID | Priority | Owner | Item | Status |
|---|---|---|---|---|
| FU-10 | Should | Owner | Remove or reword one question of each local near-duplicate pair: Science "only metal that is liquid at room temperature" vs bank "metal liquid at normal room temperature" (Mercury); Geography "Mount Fuji is located in which country?" vs bank "islands of Honshu" question (Japan). Keep Science's only 600 question; Fuji (400) or the bank Japan question (200) can go. Repeat on the hosted DB if present. | Done (owner confirmed 2026-10-12) |
| FU-11 | Must | Owner (with Developer) | Hosted Sprint 6 migration: backup, deploy code, import `sql/migrate-question-bank.sql` right away, check `CREATE TEMPORARY TABLES` privilege, Ctrl+F5 and CDN purge, smoke check. The hosted redeploy is not done until this passes. | Done (owner confirmed 2026-10-12) |
| FU-12 | Could | Developer | "Cancel edit" visible in Add mode on the admin Questions form (pre-existing); add `.btn[hidden] { display: none; }`. | Done 2026-10-12 |
| FU-13 | Must (environment) | Developer | Local DB after the D-31 amendment: restore the pre-Sprint 6 backup and re-run the new migration (155 questions, point values 100-600, settings 6 / 30). | Done 2026-10-11 |
| FU-14 | Could | Owner | The 600 row is not random locally (one Egypt question per category); add more 600 questions in Admin to randomise it, without duplicating the bank. Not needed for playability. | Done 2026-10-12 (Egypt 600 questions) |
| FU-15 | Could | PO | Some bank difficulty ranks are debatable; kept for now, review after the owner has played. | Done 2026-10-14 (Brazil 400, Australia 500, bits in a byte 400) |

**Other Sprint 6 steps (not follow-ups):** the owner's local Chrome check and the PR to `main` are done (PR #11, merged 2026-10-11).

**Open items:** none (2026-10-14).

# BrainRush — Sprint Plan

Owner: Scrum Master. Inputs: `docs/spec.md`, `docs/product-backlog.md` (US-01..US-29, decisions D-01..D-30, follow-ups FU-01..FU-07).
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

**Outcome:** US-08, US-10, US-11, US-12, US-13, US-14, US-15, US-16, US-17, US-27 accepted by the Product Owner (see `docs/sprints/sprint-4-test-report.md`; 55/55 runnable checks pass on PHP 8.0.30 / MariaDB 10.4; 1 PENDING: hosted `/password.txt` check, no hosted URL; 1 not run by instruction: `/password.txt` through `php -S`). 0 fix loops, 0 bugs (0 Critical / Major / Minor), 6 non-blocking observations. No story carry-overs; Sprint 2 and 3 carry-overs (O-1..O-5, `expose_php=Off` README note, `password.txt` deploy note) are done and verified. New decisions: D-25 (revealed answer stays shown after refresh), D-26 (End Game on a full board skips the confirm), D-27 (shared ranks on Results), D-28 (saved-game `version`, v1 board save migrated), D-29 (beep may be silent after a refresh with no click), D-30 (target screens 1366x768 and 1920x1080, no horizontal scroll). Environment incident ENV-4-01: second MariaDB InnoDB hang (recurrence of the Sprint 3 incident); it left test point value 1000 in the dev DB, so no category is playable until it is deleted (FU-06). Follow-ups FU-01..FU-07 are listed in "After Sprint 4" below.

---

## Story coverage

| Sprint | Stories |
|---|---|
| 1 | US-24, US-25, US-26, US-28 |
| 2 | US-18, US-19, US-20, US-21, US-22, US-23, US-29 |
| 3 | US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-09 |
| 4 | US-08, US-10, US-11, US-12, US-13, US-14, US-15, US-16, US-17, US-27 |

All 29 stories appear exactly once and all 29 are delivered (accepted). US-29 (hosted deployment with protected admin) was built on the `hosting` branch after the Sprint 2 stories and is recorded as part of Sprint 2 (owner decision 2026-10-05). Its follow-ups were handled in Sprint 4: the `docs/deploy-hostinger.md` note is done; the hosted `/password.txt` smoke check is still open (FU-01, owner). Notes: US-17 (persistence) is placed in Sprint 4 because its criteria cover the question and results screens; Sprint 3 builds the save/load layer as an enabler. US-27 (XSS) is accepted in Sprint 4 once all UI exists, but DoD item 4 enforces `textContent` from Sprint 2 onward. US-26 is accepted in Sprint 1 where all SQL lives; DoD item 3 keeps it enforced later.

---

## After Sprint 4 / follow-ups

All planned sprints are done and no Sprint 5 is created. Full wording and priorities are in `docs/product-backlog.md` (FU-01..FU-07); this is the by-owner view.

**Owner / environment actions (no developer work)**

| ID | Priority | Action |
|---|---|---|
| FU-01 | Must | After the redeploy, check the hosted `/password.txt` (and the other private paths from US-29) returns 403/404, status only, and record it in `docs/sprints/sprint-4-test-report.md`. The redeploy is not done until this passes. |
| FU-02 | Must | Move `password.txt` out of the project folder (it is the web root; `php -S` serves it). |
| FU-06 | Must (environment) | Before the next session: restart MariaDB, delete the leftover point value 1000 (no questions) so categories are playable again, check the antivirus exclusion for `C:\xampp\mysql\data` (ENV-4-01). |
| FU-07 | Could (environment) | Update or repoint the local XAMPP Apache checkout (`C:\xampp\htdocs\BrainRush`) before using it for end-to-end checks. |

**Optional developer polish**

| ID | Priority | Item |
|---|---|---|
| FU-03 | Should | 6x6 board + 6-contestant scoreboard fits 1366x768 with no page scroll (22 px over today, D-30). |
| FU-04 | Could | Scale the question font with text length so questions up to about 250 characters fit at 1366x768. |
| FU-05 | Could | Grey (unanswered) cells use the same points-label size as owned cells. |

**Next step:** a small polish sprint (FU-03, FU-04, FU-05, all CSS/JS in `css/style.css` and `js/game.js`) can be planned if the owner wants it. It would need the owner's go-ahead and the usual flow (developer, tester, PO acceptance). It would add no new stories unless the PO writes them.

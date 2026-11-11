# BrainRush — Sprint Plan

Owner: Scrum Master. Inputs: `docs/spec.md`, `docs/product-backlog.md` (US-01..US-30 in Sprints 1-6, decisions D-01..D-32, follow-ups FU-01..FU-15; Epic E17 US-42..US-53 in Sprints 7-15, open owner questions FU-20..FU-24).

**Overall status (2026-10-19):** Sprints 1-6 Done and shipped. Sprint 6 (Question bank) and D-32 (pick 1..N categories) were merged via PR #11 on 2026-10-11, and the hosted DB is migrated (FU-11). Follow-ups FU-10..FU-15 are all Done; no open items. Later owner requests were shipped outside the sprint cycle: Egypt questions (PR #13, #16), Arabic localization (PR #17, #19), the Gen Z set (PR #18), the AI set (PR #20), the Egyptians set (`sql/add-egyptians-questions.sql`, PR #22, 2026-10-15), the game start log (`api/game-log.php` writes one line per started game with time, player names and categories to a daily `logs/game-YYYY-MM-DD.log`, blocked from the web; PR #24, deployed 2026-10-18) and the "new questions" banner (gold strip at the top of the setup screen; Admin > Game settings turns it on or off and sets its text, stored as `banner_enabled` / `banner_text` settings, no DB migration; branch `new-questions-banner`, 2026-10-19).

**Helpers (2026-10-23, outside the sprint cycle):** US-32 / D-36 (3 choices, Swap, Skip; once per contestant per game) implemented on branch `helpers` (`docs/sprints/helpers-dev.md`); game-tester verification next (max 2 fix loops), then the owner's local Chrome check before commit/PR. Needs `sql/migrate-add-wrong-options.sql` on every DB before the code; the wrong-option content (`sql/add-wrong-options.sql`) is produced in parallel and reviewed by the owner.

**Streak Challenge (2026-10-23, outside the sprint cycle):** US-33 / US-34 / D-37 (solo run of 3-choice questions until the first wrong answer or time's up, plus a shared top-10 leaderboard and an admin moderation list) implemented on branch `streak-mode` from main 4582c9d (`docs/sprints/streak-mode-dev.md`); game-tester verification next (max 2 fix loops), then the owner's local Chrome check before commit/PR. Needs `sql/migrate-add-streak.sql` (creates the `streaks` table) on every DB before the code; it reuses the helper's wrong options, so `sql/migrate-add-wrong-options.sql` must be there too.

**New features, Epic E17 (2026-11-02):** the owner approved US-42..US-52. They are planned as Sprints 7-15 (below, after Sprint 6), in the owner's order: Sprints 7-9 and 11 are the near-term groups (owner's "A" to "D"), Sprints 12-15 are one story each, later. On 2026-11-03 the owner added US-53 (Kilo Meshakkal category) as Sprint 10, ahead of the owner's group D (now Sprint 11). Sprints 7, 8 and 9 were built and PO-accepted on 2026-11-02; Sprint 9 is merged (PR #89), and Sprints 7 and 8 are pending the owner's local test and the hosted steps (Sprint 7: FU-25, FU-26; Sprint 8: FU-28, FU-29; Sprint 9 hosted and device steps: FU-32). Sprint 10 is in progress; Sprints 11-15 are not started. Each sprint lists the owner questions (FU-20..FU-24) that must be answered before development.

| Sprint | Goal | Status |
|---|---|---|
| 1 | Foundation (DB + API) | Done |
| 2 | Admin page (+ US-29 hosting) | Done |
| 3 | Game setup and dynamic board | Done |
| 4 | Question, timer, scoring, results, persistence | Done |
| 5 | Polish (FU-03, FU-04, FU-05, FU-08) | Done |
| 6 | Question bank: random questions per new game (US-30, D-31; D-32 alongside) | Done (accepted 2026-10-11 after rework); owner Chrome check, commit/PR and hosted migration (FU-11) open |
| 7 | Report a question (US-42) | Accepted by the PO 2026-11-02, pending the owner's local Chrome check (FU-25) and the hosted steps (FU-26); not committed |
| 8 | Daily Challenge, share, weekly leaderboard (US-43, US-46, US-45) | Accepted by the PO 2026-11-02, pending the owner's local Chrome check and commit (FU-28) and the hosted steps (FU-29); not committed |
| 9 | Final round with wagers (Golden Goal ⚽ tiebreaker), read aloud (US-44, US-48) | Accepted by the PO 2026-11-02, re-accepted 2026-11-03 after the D-51 change; Done and merged to `main` (PR #89, `c0eb4c9`); hosted and device steps (FU-32) open |
| 10 | Kilo Meshakkal category (US-53) | Accepted by the PO 2026-11-03 (D-54; BUG-10-01 fixed), pending the owner's local Chrome check and commit (FU-36) and the hosted and device steps (FU-37); not committed |
| 11 | Question difficulty stats (US-47) | Planned |
| 12 | Custom category for one game (US-50) | Cancelled by the owner 2026-11-11 |
| 13 | Arabic interface (US-49) | Accepted by the PO 2026-11-09 (ran before Sprint 12); pending the owner's local Chrome check and commit (FU-47), the hosted and device steps (FU-49) and the native review of the strings (FU-48); not committed. CR "Arabic category names" accepted 2026-11-09 (D-61); hosted migration before the code (FU-53) |
| 14 | Phone buzzers (US-52), spike first | Planned (later; not committed until the FU-24 spike) |
| 15 | Rewarded second chance in Streak (US-51) | Planned (later; blocked by FU-23) |

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

## Epic E17 — New features (Sprints 7-15, planned 2026-11-02)

The owner approved US-42..US-52 on 2026-11-02 and set this grouping and order. Full story text is in `docs/product-backlog.md` ("Epic E17"); owner questions are FU-20..FU-24 ("Open owner questions (new features)"). Sprints 7 and 8 are PO-accepted pending the owner steps (see their Status); Sprint 9 is Done and merged (PR #89). **US-53 (Kilo Meshakkal) was added on 2026-11-03 at the owner's request as Sprint 10, which is In progress**; Sprints 11-15 are **Planned** and not started. Sprint numbers continue from Sprint 6; the owner's labels were A = Sprint 7, B = Sprint 8, C = Sprint 9, D = Sprint 11 (it was Sprint 10 before US-53 was inserted), and the four "later" items are Sprints 12-15.

**Rules common to Sprints 7-15** (on top of the global Definition of Done)

- **Migration rule** (Sprints 7, 8, 11, and 15 if its marker is stored; Sprint 14 only if committed; Sprint 10 needs no migration): the migration file is re-runnable (`CREATE TABLE IF NOT EXISTS` or equivalent), is run twice on the local DB with no error, and is run on **every** DB (hosted: phpMyAdmin) **before** the new code is deployed. The same table goes into **both** `sql/schema.sql` and `sql/schema-hosted.sql` (bodies identical after their CREATE DATABASE/USE lines), as the Streak sprint did with `sql/migrate-add-streak.sql`. `docs/deploy-hostinger.md` gets the migration step, the upload list and the new table count. A DB without the new table must only break the new feature, never the game or Admin's other panels (FU-19).
- **Saved game** (D-28): any change to the saved board-game shape bumps the saved `version` and migrates or discards safely. Features with their own browser key (Streak `brainrush.streak`, D-37 h) leave the board save untouched.
- **Layout** (D-30, D-35, D-36): every new UI element fits 1366x768 and the 375x812 phone layout with no horizontal scroll, and does not push the board or question screens past one screen.
- **Public writes** (D-37 g): new public POST endpoints validate every field (400), never store names or raw IP, and accept that a determined user can fake data; admin-only reads and writes stay behind US-29 auth (401 without login).
- **Deploy hygiene:** after the pre-commit hook re-hashes js/css, check that `index.html` and `admin.html` point at the new file names (FU-16); purge the CDN cache on deploy. New static text that mentions data stored goes into `privacy.html`.
- **Owner questions** listed per sprint are answered and recorded in `docs/product-backlog.md` before the developer starts that sprint.

---

## Sprint 7 — Report a question (US-42)

**Goal:** Players and hosts can report a bad question from the game, and the admin and the question-bank-manager can see and act on the reports. (Owner's Sprint A.)
**Stories:** US-42
**Dependencies:** Streak Challenge code (Report is also offered on an answered Streak question); Admin Questions panel (the Reports panel links to a question's edit form); US-29 auth.
**Owner questions needed before development:** **FU-20**, answered 2026-11-02 (D-45): six reasons (wrong answer / typo / translation / outdated / picture problem / other) and no rate limit.

**Developer tasks**
1. `sql/migrate-add-question-reports.sql` (new) — `question_reports`: id, `question_id` (FK to `questions` ON DELETE CASCADE), `reason`, `note` (max 200), `status` (open / resolved / dismissed, default open), `created_at`; key on (`question_id`, `status`). Re-runnable; run on the local DB twice.
2. `sql/schema.sql` + `sql/schema-hosted.sql` — the same table, after `questions`/`streaks`; bodies identical.
3. `api/reports.php` (new) — POST (public): valid report -> 201 storing question id, reason, note and time (no names, no IP, no device id); bad id, reason or note over 200 characters -> 400; no rate limit (D-45); prepared statements only. GET `?all=1` (admin, grouped by question with count, reasons, notes) and PUT/DELETE for Resolve / Dismiss behind US-29 auth (401 without login).
4. `index.html` + `js/game.js` + `css/style.css` — "Report" control on an open board question and on an answered Streak question; small form (the six D-45 reasons, optional note with a 200-character counter), confirmation text, errors inline (400). Sending never stops the timer, never changes the score, and works with Swap/Skip/3 choices and in Arabic; no change to the saved game.
5. `admin.html` + `js/admin.js` — "Reports" panel: open reports grouped by question (count, reasons, notes), link to the question's edit form, Resolve / Dismiss with a plain-text confirm first (D-18), inline errors, text rendered with `textContent`.
6. `.claude/agents/question-bank-manager.md` — the agent's plan step lists open reports first, and reported questions are checked before new questions are added.
7. `privacy.html` — a short section on what a report stores (question id, reason, note and time; no name, IP or device id).
8. `README.md` + `docs/deploy-hostinger.md` — migration step before the code, upload list (`api/reports.php`), new table count.
9. `docs/sprints/sprint-7-dev.md`.

**Tester focus:** report from a board question and from a Streak question (201, row stored, timer and score unchanged, no name or IP in the row); every reason; note of 200 and 201 characters; bad id and bad reason (400); many reports in a row are all accepted (no rate limit, D-45); `<img src=x onerror=alert(1)>` in the note renders as text in Admin; Reports panel grouping, edit link, Resolve and Dismiss with confirm and Cancel; admin endpoints 401 without login; deleting a question removes its reports; migration run twice, and Admin/game with the table missing (only reports fail); report form at 1366x768 and 375x812 and in Arabic; no console errors; Privacy text; question-bank-manager plan lists open reports.

**Definition of Done (Sprint 7, on top of the global DoD)**
- `sql/migrate-add-question-reports.sql` runs on every DB, including the hosted one, **before** the code is deployed, and `question_reports` is added to both `sql/schema.sql` and `sql/schema-hosted.sql` (migration rule above).
- No names, IP or device id stored (checked in the DB by the tester); the six reasons and no rate limit match D-45.
- Admin Reports panel actions all use confirm (D-18); the question-bank-manager agent instruction is updated.

**Definition of Done (Sprint 7, as delivered)**

| # | DoD item | Status |
|---|---|---|
| 1 | Spec file structure; no hard-coded board size, point values or timer | Met (S6: `REPORT_NOTE_MAX` is a named constant in PHP and JS; the six reasons are fixed by D-45) |
| 2 | `php -l` clean on all `api/*.php` | Met (S1, incl. the new `api/reports.php`) |
| 3 | Prepared statements only | Met (S4; PO code check: INSERT and UPDATE are prepared, the only plain query is the constant SELECT of the open reports) |
| 4 | `textContent` / DOM APIs only | Met (S3, D2, G14: the `<img onerror>` note shows as text in the game and in Admin) |
| 5 | No credentials committed; `api/config.php` git-ignored | Met (S5; the 401 checks used a throwaway config outside the repo) |
| 6 | Tester report, no open Critical/Major bugs | Met: 80 checks, 75 PASS, 0 FAIL, 5 PENDING (owner steps D8, D9, O5, O6, O7). BUG-7-01 and BUG-7-02 (Minor) fixed in fix loop 1 and re-tested (RT1-RT11) (`docs/sprints/sprint-7-test-report.md`) |
| 7 | Developer note | Met (`docs/sprints/sprint-7-dev.md`, incl. "Fix loop 1" and "Contrast fixes") |
| 8 | PO accepted | Met 2026-11-02, pending the owner checks below |
| + | PHP 8.0 / MariaDB 10.4 compatible (D-17) | Met (tested on PHP 8.0.30, MariaDB 10.4.32) |
| + | Migration re-runnable, run twice locally; table in both schema files, bodies identical | Met (S8, S9) |
| + | No name, IP or device id stored; six reasons; no rate limit (D-45) | Met (S7, A1, A9, A10; `information_schema` lists only `id, question_id, reason, note, status, created_at`) |
| + | Reports panel actions confirm first (D-18); question-bank-manager updated; Privacy text | Met (D4, D5, O2, O1) |
| + | Layout 1366x768 and 375x812; saved game untouched; Swap, Skip, 3 choices, Arabic | Met (G6, G10-G13, G16, M1, M2, RT8, RT9) |
| + | A DB without the table breaks only the reports feature (FU-19 rule) | Met (A18, D6, G9, RT1) |
| + | Contrast fixes (owner request): `.btn-primary:hover` text and the Streak button hover | Met in code (PO check: `#303039` is the 12% gold tint over `#151c3d`; `.btn-primary:hover` keeps `#1a1a1a` and outranks `a:hover`). Not in the tester's report; the owner looks at both in FU-25 |
| + | Owner's local Chrome check, incl. the Admin delete refresh (D9) | Open (FU-25) |
| + | Commit on `sprint-7`, re-hash check (O6, FU-16 style) and PR to `main` (owner merges) | Open (FU-25) |
| + | Hosted migration before the code (O5), live 401 and CDN purge (O7), browser admin login (D8) | Open (FU-26) |

**Status:** Accepted by the PO 2026-11-02, pending the owner's local Chrome check (FU-25) and the hosted steps (FU-26). Not committed yet.

**Outcome:** US-42 accepted against all five criteria and the dependency line (migration before code, both schema files). The developer built the game form, `api/reports.php`, the Admin Reports panel, the question-bank-manager step, the Privacy section and the migration. One fix loop closed BUG-7-01 (Admin showed the load error and "No open reports." together) and BUG-7-02 (header links focusable behind the dialog; `setPageInert()` now also covers the double-score popup). The two hover colour fixes were made on the owner's request. New follow-ups: FU-25, FU-26 (owner steps) and FU-27 (player-facing text, Could).

PO decisions on the developer's open questions (no story change, D-45 stands):
1. **The Report form covers the board question while the timer runs:** keep. US-42 says sending must not stop the timer. The form is short and closes with Cancel, Escape or Back, and nothing is scored automatically at 0 (D-03).
2. **"Picture problem" on every question:** keep. D-45 sets one list of six reasons. On a text question nobody picks it, and the Admin panel shows "picture" next to photo questions.
3. **Resolve and Dismiss close all of a question's open reports:** keep. That is what US-42 asks for (reports grouped by question, Resolve / Dismiss per group). Closed reports are not shown anyway, so a group mixing junk and real reports loses nothing. Accepted side effect: a report filed after the panel loaded is closed with the group.
4. **Line breaks in a note become spaces:** keep. A note is one line of up to 200 characters.
5. **Resolved and dismissed reports stay in the DB but are not shown:** keep. US-42 lists open reports only, and `privacy.html` says a report is kept until its question is deleted, which matches. A history view or a cleanup would be a new story if the owner asks.
6. **`how-to-play.html`, `terms.html` and `llms.txt` don't mention Report:** follow-up FU-27 (Could). US-42 and the Epic rule only require `privacy.html`, which is done. But the Terms line "Found a wrong answer ... tell us at the contact address" should now point to Report as well.

---

## Sprint 8 — Daily Challenge, share, weekly leaderboard (US-43, US-46, US-45)

**Goal:** A shared daily 3-question run with a shareable result, sharing of the board game's final standings from the same module, and a weekly Streak top 10. (Owner's Sprint B; build in the order US-43, US-46, US-45.)
**Stories:** US-43, US-46, US-45
**Dependencies:** Streak engine (`streak_batch()`, `choice_text()`, 3 choices, `brainrush.streak` pattern, D-37); Results screen (US-46); `streaks.created_at` (US-45, no migration); US-40 app behaviour (sharing must work there).
**Owner questions needed before development:** **FU-21**, answered 2026-11-02 (D-46): the day changes at midnight UTC and a challenge has 3 questions. Both are set in one place, not hard-coded across files. US-46 and US-45 need none.

**Developer tasks**
1. `sql/migrate-add-daily-challenge.sql` (new) — `daily_challenge`: one row per (challenge date, position) with the `question_id` (FK to `questions`), `UNIQUE (challenge_date, position)` so two simultaneous first requests cannot create a duplicate set. Re-runnable; run locally twice.
2. `sql/schema.sql` + `sql/schema-hosted.sql` — the same table; bodies identical.
3. `api/daily.php` (new) — GET: for the UTC date (D-46), return today's set, creating it once on the first request (`INSERT IGNORE`, then read back, so a second request gets the same questions); questions at enabled point values, 3 shuffled choices through the Streak code, challenge number N, seconds until the next set. Count and time zone come from one place (constant or setting), no scattered literals. Generic errors only.
4. `js/share.js` (new) — one shared module: build text, call the phone share sheet if present, otherwise copy text plus site link and show "Copied". Used by US-43 and US-46; works inside the app (US-40). Page and script tags in `index.html`.
5. `index.html` + `js/game.js` + `css/style.css` — Daily Challenge entry on Setup next to Streak; run screen: 3 choices, setup timer, wrong or time's up scores 0 and moves on, no Pause, no Reset, no helpers; refresh keeps the remaining time (saved deadline, as D-37 d); Arabic toggle works in the run.
6. `js/game.js` — Daily result: "BrainRush Daily #N: 2/3" with a row of green/red squares and "Share"; a device that already played today sees today's result and a countdown to the next challenge (device-only lock, accepted limitation as D-37 g), stored in its own browser key so the board save is unchanged.
7. `js/game.js` — US-46: "Share" on Results builds "Team Red won BrainRush with 2300! Team Blue 1800, ..." plus the link; tie wording follows D-10; same module and "Copied" behaviour.
8. `api/streaks.php` — US-45: `?period=week` returns the weekly top 10 (Monday to Sunday, UTC as D-46, best run per person under D-37 rules); any other `period` value -> 400; default and `all` behaviour unchanged. No schema change.
9. `index.html` + `js/game.js` + `css/style.css` — leaderboard tabs "This week" / "All time"; the finished-run rank line shows both ranks; the ad slot stays as it is (D-41).
10. `how-to-play.html` + `README.md` + `docs/deploy-hostinger.md` — Daily Challenge, sharing, weekly tab; migration step before the code; upload list (`api/daily.php`, `js/share.js`).
11. `docs/sprints/sprint-8-dev.md`.

**Tester focus:** two requests at once get the same set with no duplicate rows; set changes at midnight UTC (D-46); 3 questions at enabled point values, 3 choices, timer, wrong/time-out scores 0, no Pause/helpers, refresh mid-question keeps the deadline; result text and squares; share sheet vs clipboard (and in the app); played-today screen with countdown; Arabic in the run; US-46 text for a single winner, a tie (D-10) and a negative-score game; `?period=week` on a Sunday/Monday boundary, `?period=bogus` -> 400, both ranks on the rank line, existing all-time tab unchanged; migration run twice and the Daily entry with the table missing (only Daily fails); 1366x768 and 375x812; no console errors.

**Definition of Done (Sprint 8, on top of the global DoD)**
- `sql/migrate-add-daily-challenge.sql` runs on every DB, including the hosted one, **before** the code is deployed, and `daily_challenge` is added to both `sql/schema.sql` and `sql/schema-hosted.sql` (migration rule above).
- 3 questions and the UTC day boundary follow D-46 and are each set in one place.
- US-45 needs no migration (verified: no schema change in the diff).

**Definition of Done (Sprint 8, as delivered)**

| # | DoD item | Status |
|---|---|---|
| 1 | Spec file structure; no hard-coded board size, point values or timer | Met (S6: the count is only `DAILY_QUESTIONS` in `api/daily.php` and the zone only `GAME_TIME_ZONE` in `api/db.php`; the browser takes the number of squares and the countdown from the server's answer) |
| 2 | `php -l` clean on all `api/*.php` | Met (S1, RT12, incl. the new `api/daily.php`) |
| 3 | Prepared statements only | Met (S4; PO code check: the day's set, `DATEDIFF` for #N, the `INSERT IGNORE` and the week filter are prepared. The only plain queries are constant SQL, and `LIMIT` is the constant `STREAK_TOP`) |
| 4 | `textContent` / DOM APIs only | Met (S3, RT12; squares, rows and share texts are built with `h()` / `textContent`) |
| 5 | No credentials committed; `api/config.php` git-ignored | Met (S5) |
| 6 | Tester report, no open Critical/Major bugs | Met: 87 checks, 83 PASS, 0 FAIL, 4 PENDING (owner steps S11, P1, P2, P3). BUG-8-01, BUG-8-02 and BUG-8-03 (Minor) fixed in fix loop 1 and re-tested (RT1-RT15) (`docs/sprints/sprint-8-test-report.md`) |
| 7 | Developer note | Met (`docs/sprints/sprint-8-dev.md`, incl. "Fix loop 1") |
| 8 | PO accepted | Met 2026-11-02, pending the owner checks below |
| + | PHP 8.0 / MariaDB 10.4 compatible (D-17) | Met (tested on PHP 8.0.30, MariaDB 10.4.32) |
| + | Migration re-runnable, run twice locally; `daily_challenge` in both schema files, bodies identical | Met (S7, S8) |
| + | 3 questions and the UTC day boundary per D-46, each set in one place | Met (S6, A4, A13; checked with PHP in Tokyo, Honolulu and UTC and with the DB in Cairo) |
| + | US-45 needs no migration | Met (S9: only `daily_challenge` in the SQL diff) |
| + | One set per day under simultaneous first requests | Met (A3: 12, 16 and 2 x 10 parallel processes, 3 rows each) |
| + | A DB without the table breaks only the Daily Challenge (FU-19 rule) | Met (A8, D15) |
| + | Layout 1366x768 and 375x812; board save, Streak save and double score untouched | Met (D16-D18, D20, E8, L6). The Daily question scrolls vertically on the phone, the same as the Streak one |
| + | Public writes: no new public write | Met (A7: `daily.php` is GET only; the Streak POST validation is unchanged, A11) |
| + | Owner's local Chrome check | Open (FU-28) |
| + | Commit on `sprint-8` with `js/share.js` staged, re-hash check (S11, FU-16 style) and PR to `main` (owner merges) | Open (FU-28) |
| + | Real Android device: share sheet and Back (P1) | Open (FU-28, optional; emulated in D10, D19, RT10) |
| + | Hosted migration before the code (P2), live smoke check and CDN purge (P3) | Open (FU-29) |

**Status:** Accepted by the PO 2026-11-02, pending the owner's local Chrome check and commit (FU-28) and the hosted steps (FU-29). Not committed yet.

**Outcome:** US-43, US-46 and US-45 accepted against all their criteria and the dependency lines (migration before code, both schema files, D-46 UTC and 3 questions, no migration for US-45, ad slot unchanged). The developer built `api/daily.php`, the `daily_challenge` table, the Daily run and result screens, `js/share.js` (used by both Share buttons), the Results Share text, `?period=week` and the leaderboard tabs with the two-rank line, plus the guide, Privacy, `llms.txt`, README and deploy-guide text. One fix loop closed BUG-8-01 (backlog said "10"), BUG-8-02 (a Sunday-night run showed Monday's date on a non-UTC DB; public dates are now UTC) and BUG-8-03 (an unfinished run from an earlier day came back after midnight; it now closes and offers the new challenge). New follow-ups: FU-28, FU-29 (owner steps) and FU-30 (fixed #N, Could). Recorded as D-47.

PO decisions on the developer's choices (no story change, D-46 stands):
1. **#N counts from the first day a database served a challenge:** keep for the launch. The live numbers are the ones players share, and they start at #1. If every question of the first day is deleted, the numbers shift, which is unlikely but avoidable, so FU-30 (Could) pins #1 to the live launch date once FU-29 has recorded it. *(FU-30 Done 2026-11-11, CR `cr-fu62-30-34-35`: #1 = 2026-11-02 UTC, D-62 b.)*
2. **The leaderboard opens on "All time":** keep. US-45 sets no default. The screen opens as before, and the rank line after a run already gives the weekly rank.
3. **The share sheet only on touch devices; desktop browsers copy and show "Copied":** keep. US-43 already says "the phone's share sheet", and "a device with a share sheet" in US-46 is read the same way (phone, tablet, the app). A host at a laptop wants text to paste into a chat, not the Windows share dialog. Both paths were tested (D10, D11).
4. **Setup timer; the button in any mode; hidden in maintenance and the Streak setup:** keep. US-43 says "with the setup timer", so comparing runs with different timers is an accepted limitation. The Daily is not a solo-only mode, and hiding it in maintenance follows `start_game_hidden`.
5. **Android Back asks, then ends the run with the rest at 0; no Leave on the website:** keep. This matches D-43 a. A web run is at most 3 timers long, and since the BUG-8-03 fix a run left over from an earlier day closes by itself, so no Leave control is needed.
6. **Side effects:** all kept. The played list avoids repeats in later games. The game log covers board games. A run counts for the day it started. Borrowed choices are a last resort: all local questions have stored options, and FU-29 has an optional live count. The Admin moderation list shows the stored time, while the public board shows the UTC date.

---

## Sprint 9 — Final round with wagers, read aloud (US-44, US-48)

**Goal:** The host can add an optional final wager round before Results, and the device can read questions aloud. (Owner's Sprint C.)
**Stories:** US-44, US-48
**Dependencies:** Sprint 4 (End Game, Results, scoring), D-36 `questions.php?random=1` (random bank question), `settings.php` (new `final_round_enabled` setting, no migration: a missing row means off, like `banner_enabled`); D-28 saved-game version.
**Owner questions needed before development:** **FU-22**, answered 2026-11-02 (D-48): TV-show style, a wager may go up to the contestant's score or the largest enabled point value, whichever is higher. US-48 needs none.

**Developer tasks**
1. `api/settings.php` + `admin.html` + `js/admin.js` — `final_round_enabled` (on/off, validated, off by default) in Admin > Game settings.
2. `index.html` + `js/game.js` — when the setting is on, End Game (and the full-board offer) offers "Play final round" or "Skip to results"; the D-09 / D-26 confirm rules stay.
3. `js/game.js` + `css/style.css` — final round screens: category shown first, then each contestant enters a wager one by one, masked, from 0 to the higher of their score and the largest enabled point value (D-48, read from the point values, not a literal); wagers hidden from the room; then the question opens via `questions.php?random=1` with the timer; Correct adds and Wrong subtracts that contestant's wager; every contestant scored once; then Results. Confirm the random endpoint's payload gives the category and the choices needed; if a small server change is needed, list it in the dev note.
4. `js/game.js` — saved game: wagers and scoring survive a refresh mid-round; saved `version` bumped with a safe migrate-or-discard of older saves (D-28).
5. `js/speech.js` (new) or section of `js/game.js` — US-48: speaker button on the question screen using the browser speech API; reads the question, and the choices when they are shown; second click stops; hidden when no voice is installed for that language (detect voices, handle late-loaded voice lists); reading never pauses the timer; stops on Back to Board, question close and refresh.
6. `index.html` + `js/game.js` + `css/style.css` — "Read questions automatically" setting, off by default; reading starts when a question opens. **Where it is stored is not stated in US-48:** this plan assumes an on-device preference (no migration); the PO confirms before development, and if it must be an Admin setting it goes with task 1.
7. `README.md` + `how-to-play.html` — final round and read-aloud notes (voice quality varies; Arabic voice often missing on Windows).
8. `docs/sprints/sprint-9-dev.md`.

**Tester focus:** setting off (no change to End Game) and on (offer shown, Skip goes straight to Results); wagers 0, exactly the score, above the score (blocked), a contestant below the largest point value, at 0 and below (may wager up to the largest point value, D-48); wagers masked and hidden; Correct/Wrong once per contestant; scores and Results after the round (ties D-10); refresh mid-wager and mid-question; old saved game (previous version) restored or discarded without a JS error; 6 contestants at 1366x768 and 375x812; speaker with an installed voice, with no voice (button hidden, check English and Arabic), second click stops, timer keeps running, automatic reading off by default and on when ticked; closing the question stops speech; no console errors.

**Definition of Done (Sprint 9, on top of the global DoD)**
- Saved-game version bumped and tested with an older save (D-28).
- Wager cap is the higher of the score and the largest enabled point value (D-48), read from the settings (no hard-coded 600).
- No migration needed (setting is a key/value row); verified by the tester on a DB that never had `final_round_enabled`.

**Definition of Done (Sprint 9, as delivered)**

| # | DoD item | Status |
|---|---|---|
| 1 | Spec file structure; no hard-coded board size, point values or timer | Met (S6: no literal 500, 600 or 900 in `game.js` or `speech.js`. The limit is `wagerLimit(g, score) = Math.max(score, largestPoints(g))` over `game.points`. The new `js/speech.js` is listed in the spec's file structure) |
| 2 | `php -l` clean on all `api/*.php` | Met (S1, RT14) |
| 3 | Prepared statements only | Met (S4; PO code check: the only API change is one `SETTING_RULES` entry in `api/settings.php`, written through the existing prepared statements) |
| 4 | `textContent` / DOM APIs only | Met (S3; PO code check: the wager list, the rows and the headings are built with `h()` / `textContent`) |
| 5 | No credentials committed; `api/config.php` git-ignored | Met (S5) |
| 6 | Tester report, no open Critical/Major bugs | Met: 131 checks, 126 PASS, 0 FAIL, 5 PENDING (owner or device steps A4, T4, R14, L4, S9), no open bug. BUG-9-01 and BUG-9-02 (Minor) fixed in fix loop 1 and re-tested (RT1-RT14); the D-50 rename (RN1-RN13) and the D-51 tiebreaker (RD1-RD26) re-tested (`docs/sprints/sprint-9-test-report.md`) |
| 7 | Developer note | Met (`docs/sprints/sprint-9-dev.md`, incl. "Fix loop 1", "Rename to Shoot Your Shot (D-50)" and "Tiebreaker change (D-51) and Golden Goal name") |
| 8 | PO accepted | Met 2026-11-02, re-accepted 2026-11-03 against the amended US-44 (D-52); merged to `main` (PR #89) |
| + | PHP 8.0 / MariaDB 10.4 compatible (D-17) | Met (tested on PHP 8.0.30, MariaDB 10.4.32) |
| + | Saved-game version bumped and tested with older saves (D-28) | Met (V1-V6: version 4; v3, v2 and v1 saves upgrade with `finalRound:false`; 30 invalid variants are discarded to Setup with no JS error) |
| + | Wager limit = the higher of the score and the largest enabled point value (D-48), not hard-coded | Met (F7-F10: 500 locally, 600 with 600 enabled, 400 with 500 and 600 disabled; scores 400, 0 and −200 all get the largest value) |
| + | No migration; checked on a DB that never had `final_round_enabled` | Met (A1, F1, A6: GET gives `null`, the game has no round, Admin shows the box unticked) |
| + | Layout 1366x768 and 375x812 with 6 contestants; speaker and Report add no height | Met (L1-L3, RT6-RT9. The phone question screen scrolls vertically, as a board question does) |
| + | US-48: speaker, hidden with no voice, second click stops, timer untouched, automatic reading off by default | Met (R1-R13; real speech with real clicks in R5 and R6) |
| + | D-51 tiebreaker: offered only on a tie for first, everyone bets, repeat rounds with a new question, Results with the tie on Skip or when no question is left; saved version 4 extended safely | Met (RD1-RD15, RD21-RD22; PO code check: `endGame()` needs `isTiedAtTop()`, the draw excludes the board's and earlier rounds' ids, and a 409 ends the game on Results. Swap-in ids are not excluded, see FU-35) |
| + | D-50 name: "Golden Goal ⚽" and "bet" in every player-facing text, ⚽ hidden from screen readers | Met (RD16-RD20) |
| + | Owner's local Chrome check | Done (FU-31; Sprint 9 was merged) |
| + | Commit on `sprint-9` with `js/speech.js` staged, re-hash check (S9, FU-16 style) and PR to `main` (owner merges) | Done: PR #89 merged (`c0eb4c9` on `main`) |
| + | Hosted deploy and CDN purge; live 401 without a login (A4) | Open (FU-32) |
| + | Real Android phone (T4), real Arabic voice (R14), real touch device (L4) | Open (FU-32; emulated or faked in T1-T3, R4, L2) |

**Status:** Done. Accepted by the PO 2026-11-02 and re-accepted 2026-11-03; **merged to `main` via PR #89 (`c0eb4c9`) on 2026-11-03**. The hosted and device steps (FU-32) are not recorded as done here. On 2026-11-03 the owner renamed the round for players to "Shoot Your Shot" and the amount to "bet" (D-50, wording only; a proposed scoring change was cancelled). Re-tested: 105 checks, 100 PASS, 0 FAIL, 5 PENDING. Later on 2026-11-03 the owner renamed it "Golden Goal ⚽" and made it a tiebreaker offered only on a tie for first, repeating while still tied (D-50 amended, D-51). Re-tested: 131 checks, 126 PASS, 0 FAIL, 5 PENDING, no open bug. **Re-accepted by the PO 2026-11-03** against the amended US-44 (D-52) and merged (PR #89). Still open: the hosted and device steps (FU-32).

**Outcome:** US-44 is accepted against all four criteria and the dependency line: browser only apart from the setting, wagers entered one by one and masked. US-48 is accepted against all four criteria (no server work). The developer built the `final_round_enabled` setting (Admin checkbox, validated 0-1, no migration), the offer, the wager and question screens with the D-48 limit, saved-game version 4, Android Back handling, `js/speech.js` with the speaker on every question screen, and the on-device "Read questions automatically" choice. The guide, Privacy, `llms.txt`, README, spec and deploy-guide texts were updated too. One fix loop closed BUG-9-01 (the setting was read when Setup loaded, not at Start) and BUG-9-02 (phone scoring rows grew when marked). New follow-ups: FU-31 and FU-32 (owner steps) and FU-33 (final round text polish, Could). Recorded as D-49.

PO decisions on the developer's choices (no story change, D-48 stands):
1. **The setting is taken at Start and saved with the game:** keep (D-49 a). "Given the setting is on, when the host ends the game" is read as "on for this game", the same as `helpers_enabled`. A round can't then appear or disappear in the middle of a game, and End Game needs no extra request. Since the BUG-9-01 fix the value is read at the click on Start.
2. **The largest value comes from the game's board:** keep (D-49 b). The board holds the enabled values at Start, so this meets D-48 ("read from the enabled point values"), and F10 tested it with 400, 500 and 600.
3. **The question is drawn at "Play final round":** keep (D-49 c). Showing the category before the wagers needs the question to be picked first. The text stays off the page until "Show the question" (F6).
4. **Several contestants can be Correct:** keep (D-49 d). US-44 says "every contestant is scored once". Everyone answers the final question, so D-08's single Correct, which is about a board cell, does not apply.
5. **No way to stop the round half-way on the website; only Android Back offers it:** keep (D-49 e). Every contestant has an answer to judge, and a missing one is marked Wrong. This is the same reasoning as D-47 f. A web "stop the round" control would be a new request if the owner asks.
6. **Masked text field with Show; the dots show the digit count; wagers readable with DevTools:** keep (D-49 f). US-44 asks for wagers hidden from the room, and F12 and F13 show that they are. The digit count and DevTools are the shared-screen trust level already accepted in D-37 g.
7. **The final question's timer restarts at full length after a refresh:** keep (D-49 g). This matches D-04 for board questions, and the wagers and marks survive, as US-44 asks.
8. **No helpers and no double score; Report and the speaker work:** keep (D-49 h). Helpers (D-36) and the double (D-40) belong to board cells. US-42 and US-48 apply to every open question.
9. **"Read questions automatically" is stored on the device:** confirmed (D-49 j). US-48 says only "a setting", and the plan's task 6 assumed this. Reading depends on each device's voices, so a per-device choice fits, and it needs no migration.
10. **Accepted limitations:** the browser may block automatic reading after a refresh until the first click; the speaker is hidden for Arabic on a PC with no Arabic voice (this is what US-48 says); final rounds are not written to the game log, which records started games only (D-49 i, k). Tester Info 2, 3 and 7 (solo "look away" text, the Swap wording on a failed draw, "+0" / "−0") go to FU-33 (Could).

**Change loop (2026-11-03, D-50 amended, D-51):** US-44 is re-accepted against its five amended criteria:
- **Offered only on a tie for first:** RD1-RD5, RD14.
- **Category first, D-48 limit, hidden bets, everyone bets:** RD6, RD12.
- **Random question, timer, each contestant marked once:** RD7, RD8.
- **Repeat rounds with a new question until the tie is broken or the host skips; the tie stands when no question is left:** RD9-RD11.
- **Refresh and saved game:** RD12, RD13.

The story sentence now states the tiebreaker purpose (D-52 d). PO decisions on the points raised (D-52):
1. **Android Back on a repeat offer goes to Results with the tie:** keep (D-52 a). It matches Skip, and the board can't be reopened on changed scores. **Back on a question where everyone is marked and the top is still tied** also goes to Results with no confirm. This is accepted for now, and FU-34 adds a confirm (D-43 a: a Back press is easily made by mistake).
2. **"Continue" while still tied:** accepted for this sprint. FU-34 renames it **"Next round"**, which says what happens next. Wording only.
3. **The US-44 story sentence:** changed to the tiebreaker purpose. The title stays "Final round with wagers (Golden Goal ⚽)".
4. **PO code check, new point:** the draw excludes the board's questions and earlier Golden Goal questions, but not a question brought in by Swap. That question is only avoided through the played list. FU-35 (Could) closes this gap in D-51 e. FU-33 now keeps only "+0" / "−0", since D-51 made its other two items lapse (D-52 f). FU-31 and FU-32 were amended so that the owner's test makes a tie.

*(FU-34 and FU-35 Done 2026-11-11, CR `cr-fu62-30-34-35`, PO accepted, D-62 c, d: "Next round", the app Back confirm on a still-tied question, and Swap questions excluded from the Golden Goal draw. The real-device Back check FU-66 was cancelled by the owner on 2026-11-11, D-63 c.)*

---

## Sprint 10 — Kilo Meshakkal category (US-53)

**Goal:** A built-in "Kilo Meshakkal (كيلو مشكل)" category: one board column whose boxes each hold a random question from a different category, show an emoji instead of the value, and hold the values in a random order. (Owner request 2026-11-03, D-53; technical design approved by the owner.)
**Stories:** US-53
**Dependencies:** Sprint 9 (merged to `main`, PR #89; branch `sprint-10` is cut from it); the US-30 board and pool code in `api/questions.php` (`PLAYABLE_HAVING`, `random_key()`, `draw_from_pool()`, `random_question()`, `board_cell()`); D-32 / D-33 Setup picker and "Surprise me!"; D-28 saved-game version (no bump needed, see DoD); `api/game-log.php`. **No DB migration.**
**Owner questions needed before development:** none. The design is approved. Each enabled value appears once in the mystery order, so the column total stays fair; the owner can still ask for repeats.

**Developer tasks**
1. `api/questions.php` — add `MIX_NAME = 'Kilo Meshakkal'`; `parse_board_ids()` also accepts `-1`, at most once (same duplicate rule); `-2` and other ids below 1 stay 400; document it in the header comment.
2. `api/questions.php` — `board()`: drop `-1` from the id list before the `categories` lookup and pool query; build the real columns as today and collect the drawn ids; then build the mix column and put it back at its requested position. Result: `{id: -1, name: MIX_NAME, mix: true, questions: {<p>: board_cell() + category_name}}`.
3. `api/questions.php` — new `mix_column(PDO $pdo, array $points, array $exclude, array $seenRank): array`, modelled on `random_question()`. For each enabled point value: only playable categories with a question at that value not already on the board; prefer categories with an unseen question; then prefer categories not yet used in this column; pick with `random_key()`, then the question with `draw_from_pool()`; add `category_name`. No question left for a value gives 400 naming the value (same wording style as "missing questions") and no board. Prepared statements only.
4. `api/game-log.php` — `read_category_names()` accepts `-1` and logs "Kilo Meshakkal"; `-1` twice and other ids below 1 stay 400.
5. `js/game.6ef41919.js` — constants `MIX = -1` and `MIX_NAME = 'Kilo Meshakkal'` next to `SURPRISE`; after `categories.php?playable=1` loads, and only when at least one category is playable, add `{id: MIX, name: MIX_NAME}` to the Setup list, sorted by name with the others; the tile shows its name only (the "كيلو مشكل · any category" hint was removed by the owner after acceptance), calls `toggleCategory(MIX, …)` and has `data-cat="-1"`; it counts toward `categories_per_game`; leave `MIX` out of the `questions.php?played=1` progress request; keep `MIX` in `s.selected` at load, like `SURPRISE`.
6. `js/game.6ef41919.js` — `resolveSelection()`: `MIX` passes through unchanged; Surprise's `free` list filters out `MIX`, so a hidden "?" column is always a real category. Kilo Meshakkal alone gives a 1-column board; with Surprise it gives Kilo Meshakkal + 1 hidden category.
7. `js/game.6ef41919.js` — `parseQuestion()` keeps an optional `catName` from `category_name` (non-empty string or null) and `isValidQuestion()` allows it as optional text; `activeQuestion()` sets `catName: q.catName ? MIX_NAME + ': ' + q.catName : category.name`, so the heading reads "Kilo Meshakkal: Football – 300" and the Report label gets the real category. `logGameStart()` keeps sending `c.id`.
8. `js/game.6ef41919.js` — `beginGame()`: for the mix column save `order` (a `shuffled()` copy of `board.points`) and `faces` (one emoji per box, no repeats, drawn from a `MIX_FACES` list). `isValidBoard()` accepts `order` and `faces` only on the `-1` column: `order` must be a permutation of `points`, `faces` the same length with non-empty strings; a mix column missing them is corrupt (Setup shown, US-17). Older saves have no `-1` column, so there is no `STORAGE_VERSION` bump.
9. `js/game.6ef41919.js` — `renderBoard()`: in row `i` the mix column renders the cell for value `order[i]`, so `cellKey(-1, value)` stays unique and scoring, the double cell, Swap and the used state stay keyed by value. `renderCell()`: an open mix box shows its emoji instead of the number, with `aria-label` / `title` "Kilo Meshakkal, mystery value" (never the points); a used box shows owner and value as usual. Emoji and source names are set with `textContent`.
10. `css/style.b8666cf7.css` — only the emoji box face `.cell-face` (sized like the point label) and the small Arabic hint on the Setup tile; existing tokens, no new colors; D-30 fit at 1366x768 and 375x812.
11. `how-to-play.html` — one bullet: questions from any category, values hidden behind emoji. `llms.txt` — one line if it lists the setup options. `README.md` — one line if it describes the Setup options. `docs/spec.md` already has the rule line (about line 132); the developer only checks that it still matches.
12. Tests and `docs/sprints/sprint-10-dev.md` — API checks (curl list in the tester focus) and a browser walkthrough; the dev note records that the ux-ui plugin's `check_no_emoji` gate flags the emoji and that this is a deliberate product choice (D-53), so the gate run records an exception.

**Tester focus**
- API (`php -S localhost:8000`): `{categories:"-1"}` returns one column, id -1, name "Kilo Meshakkal", one cell per enabled value, each with `category_name`, no duplicate ids; sources vary over several calls and are distinct within the column when there are enough categories; `"3,-1,1"` puts the mix column in the middle and none of its ids appear in columns 3 or 1; `"-1,-1"` and `"-2"` give 400; no question left for a value gives 400 naming the value; unseen questions come first; `game-log.php` with `[-1, 3]` gives 201 and the log line shows "Kilo Meshakkal"; `-1` twice and other ids below 1 give 400; `php -l` on both files.
- Setup: tile sorted under "K" with the hint; not shown with no playable category; counts toward and locks at N, tick-order badge; alone, with real categories, and with Surprise (Surprise never picks it).
- Board: emoji boxes with no numbers, a different emoji per box; values one of each enabled value in a shuffled order that differs between games; heading "Kilo Meshakkal: <source> – <points>"; Correct / Wrong score that value; used box shows value and owner (or grey); the label and tooltip never contain the points; Swap, Skip, 3 choices, Report (real category), double cell and Golden Goal work.
- Persistence: refresh keeps the same emoji, order and headings; a corrupt mix column (order not a permutation, `faces` missing or the wrong length) goes to Setup with no JS error; a save from before US-53 still loads.
- Admin: Kilo Meshakkal absent from Categories, the Questions filter and form, and the played progress; Streak and Daily untouched.
- Layout 1366x768 and 375x812 (6x6 board, 6 contestants); a source category name with HTML renders as text; no console errors.

**Definition of Done (Sprint 10, on top of the global DoD)**
- No DB migration and no new table; Kilo Meshakkal has no row in the `categories` table (checked in the diff and in Admin).
- The reserved id `-1` is accepted only by `parse_board_ids()` and `read_category_names()`; Surprise stays `0`.
- Saved game: no `STORAGE_VERSION` bump; older saves load and a corrupt mix column is discarded safely (D-28).
- The mystery value never appears in an open box's text, label or tooltip.
- The ux-ui `check_no_emoji` exception is recorded in the dev note (deliberate, D-53).

**Status:** Accepted by the PO 2026-11-03 (test report: 54 PASS, 0 FAIL, 4 PENDING; BUG-10-01 fixed after test; D-54). Pending the owner's local Chrome check and commit (FU-36) and the hosted and device steps (FU-37). Branch `sprint-10`, cut from `main` after the Sprint 9 merge (PR #89); not committed.

---

## Sprint 11 — Question difficulty stats (US-47)

**Goal:** Admin can see how often each question is answered correctly and spot questions at the wrong point value. (Owner's Sprint D.)
**Stories:** US-47
**Dependencies:** **Sprint 7 (US-42)**: reuse its admin panel pattern and `api/reports.php` conventions (public POST validation, rate limit style); Streak and board question flows.
**Owner questions needed before development:** none from FU-20..FU-24. **"Check value" band:** defined by the PO 2026-11-03 in D-55 (backlog): rank r of n enabled values ascending, centre `round(80 − 40 × (r − 1) / (n − 1))` (60 when n = 1), band centre ± 20 within 0–100; marked at 20+ attempts outside the band; disabled values get no mark; all four outcomes are attempts, only "correct" is correct.

**Developer tasks**
1. `sql/migrate-add-question-stats.sql` (new) — `question_stats`: `question_id` (primary key, FK to `questions` ON DELETE CASCADE) with counters for correct / wrong / nobody / timeout. Re-runnable; run locally twice.
2. `sql/schema.sql` + `sql/schema-hosted.sql` — the same table; bodies identical.
3. `api/question-stats.php` (new) — POST `{question_id, outcome}` (outcome: correct / wrong / nobody / timeout) adding to the counter with `INSERT ... ON DUPLICATE KEY UPDATE`; bad id or outcome -> 400; prepared statements; no names or IP.
4. `api/questions.php` — admin list also returns attempts and percent correct (`LEFT JOIN`, no row = 0 attempts); sort option by percent correct.
5. `js/game.js` — send one outcome when a board question closes and when a Streak question is answered, at most once per question per game (kept in game state; a save without the field simply counts none, no bump unless the developer prefers one, recorded in the dev note). A failed send never interrupts play.
6. `admin.html` + `js/admin.js` + `css/style.css` — Questions list columns "Attempts" and "% correct", sortable; "Check value" mark when attempts are 20 or more and the percentage is outside the band for that question's point value (threshold 20 as a named constant).
7. `README.md` + `docs/deploy-hostinger.md` — migration step before the code; upload list; new table count.
8. `docs/sprints/sprint-11-dev.md`.

**Tester focus:** each outcome from a board question and from a Streak question increments the right counter; a second send for the same question in one game is not sent; bad id and bad outcome (400); upsert under two quick requests; list shows attempts and percent, sort works, 0 attempts shows cleanly; "Check value" appears at 20 attempts only and follows the band; admin list works for a question with no stats row; stats removed with the question; send failure (API down) does not disturb play; Admin layout at >= 1024 px (D-19); migration run twice; Admin with the table missing; no console errors.

**Definition of Done (Sprint 11, on top of the global DoD)**
- `sql/migrate-add-question-stats.sql` runs on every DB, including the hosted one, **before** the code is deployed, and `question_stats` is added to both `sql/schema.sql` and `sql/schema-hosted.sql` (migration rule above).
- The "Check value" band is written down by the PO and has no hard-coded point values.
- Public-write limitation (fake counts) noted in the dev note and Privacy needs no change (no personal data stored).

**Status:** Accepted by the PO 2026-11-03 (test report: 72 checks, 68 PASS, 0 FAIL, 4 PENDING after the re-test; first run 62 PASS, 1 FAIL; BUG-11-01 (Minor, Admin Questions table 5 px too wide at 1024 px) fixed in fix loop 1 and re-tested; D-56). Pending the owner's local Chrome check and commit (FU-39) and the hosted migration, deploy and device steps (FU-40). Branch `sprint-11`, cut from `main` after the Sprint 10 merge (PR #90); not committed.

**Change request "Reset all stats" (owner, 2026-11-03):** Accepted by the PO 2026-11-03 (test report `docs/sprints/cr-reset-stats-test-report.md`: 59 checks, 56 PASS, 0 FAIL, 3 PENDING after the re-test; BUG-CR-01 (Minor, the success line never cleared) fixed and re-tested; D-57). Pending the owner's local Chrome check and commit (FU-45) and the hosted deploy (FU-46, no migration). Branch `cr-reset-stats`, cut from `main` after the Sprint 11 merge (PR #92); not committed.

---

## Sprint 12 — Custom category for one game (US-50) — CANCELLED 2026-11-11 (owner)

**Goal:** The host can add their own category (name plus one question and answer per enabled point value) to tonight's game, kept in the browser only. (Owner: later, its own sprint.)
**Stories:** US-50
**Dependencies:** Sprint 9 changed the saved-game version first (Sprint 10 makes no bump), so this sprint bumps it again from that base; Setup category picker (D-32 and D-33 "Surprise me!"); helpers (D-36); US-25 board payload shape; `api/game-log.php`.
**Owner questions needed before development:** none open (FU-20..FU-24 do not cover it). Should be re-checked with the PO when the sprint is picked up.

**Developer tasks**
1. `index.html` + `js/game.js` + `css/style.css` — "Add my own category" form on Setup: name plus one question and one answer for each enabled point value (taken from settings), checked with the same rules as the API (US-25, D-14 length and uniqueness against the chosen categories); counts as one of the N categories (D-32).
2. `js/game.js` — at Start, merge the custom column into the board in the browser; the board endpoint is called only with real category ids, and nothing custom is ever sent to the server. Custom column coexists with "Surprise me!" picks.
3. `api/game-log.php` + `js/game.js` — the game log records only the word "custom" for the column, never its name or text.
4. `js/game.js` — helpers on custom questions: 3 choices off (no wrong options), Swap still draws from the bank, Skip and the double score behave as for any cell.
5. `js/game.js` — save the category on the device (browser storage, size-checked with a clear message if full), and export/import as a file; import validates structure, length and point values, and rejects bad files without a JS error.
6. `js/game.js` — restore the custom column with the saved game after a refresh; bump the saved `version` and migrate or discard older saves safely (D-28).
7. `README.md` + `how-to-play.html` — custom category notes (kept on the device, nothing on the server).
8. `docs/sprints/sprint-12-dev.md`.

**Tester focus:** form validation (empty, too long, duplicate, missing a point value); custom plus real categories at the N limit; Start sends no custom data (check the network calls and the log line); helpers on the custom cell; refresh mid-game restores it; save, reload the page, reuse; export and import (valid, corrupt, oversized, `<img src=x onerror=alert(1)>` renders as text); storage full; 1366x768 and 375x812; no console errors.

**Definition of Done (Sprint 12, on top of the global DoD)**
- **Arabic (D-60, because Sprint 13 ran first):** every new or changed visible string (the "Add my own category" form, its validation messages, the save, export and import messages, tooltips and `aria-label`s) ships in **both English and Arabic** in `js/i18n.js`, through `t()` / `tn()`, with no hard-coded text. Tests include EN and AR, RTL and bidi isolation of the custom name, and D-30 layouts at 1366x768 and 375x812 in AR. New Arabic strings are AI-drafted (D-58 a) and added to the native review (FU-48).
- Nothing custom is sent to or stored on the server (verified in the API calls and the game log).
- Saved-game version bumped and tested with an older save (D-28).
- No migration needed.

**Status:** Planned (later)

---

## Sprint 13 — Arabic interface (US-49) — done early, before Sprint 12

**Goal:** The whole game can be switched between English and Arabic, right to left, with the choice remembered. (Owner: later, its own sprint. Size L.)
**Stories:** US-49
**Dependencies:** Planned **after** Sprints 7-12, but **it actually ran before Sprint 12** (PO decision D-60, 2026-11-09), so the US-50 custom category screens were not translated here; they must ship bilingual in Sprint 12. The existing Arabic question text and language button (earlier Arabic localization); D-30 layouts.
**Owner questions needed before development:** none open. Who supplies and reviews the Arabic UI strings is to be agreed (owner review, as for question content) before development starts.

**Developer tasks**
1. `js/game.js` + `index.html` — inventory every visible string on Setup, Board, Question, Results, Streak, Daily, Final round, Report and error messages; list it in the dev note.
2. `js/i18n.js` (new) — English and Arabic string tables and a lookup used by `js/game.js`; a missing Arabic string falls back to English; no text built from data with `innerHTML` (DoD 4).
3. `js/game.js` — replace hard-coded strings with lookups in small steps (screen by screen), keeping behaviour identical in English.
4. `index.html` + `js/game.js` — EN / AR switch in the header; choice saved on the device; `lang` and `dir` set on the page; questions show in Arabic first when AR, and a question without Arabic shows English with no error.
5. `css/style.css` — RTL layout (logical properties or `[dir=rtl]` rules) for board, scoreboard, question screen, results, leaderboard and forms; bidi isolation for player names and numbers (no mixed-direction glitches).
6. `css/style.css` — D-30 re-check: Setup, Board (6x6, 6 contestants), Question, Results and Streak fit 1366x768 and 375x812 in AR.
7. `README.md` + `how-to-play.html` — language switch note. The guide, Terms and Privacy pages stay English for now (per US-49).
8. `docs/sprints/sprint-13-dev.md`.

**Tester focus:** EN/AR on every screen with no leftover English string (list from task 1); choice remembered after refresh; RTL mirroring; Latin names, Arabic names and numbers mixed in the scoreboard and Results; every D-30 layout in AR at 1366x768, 1920x1080 and 375x812; saved game and open question restored in AR; question without Arabic; helpers, Streak, Daily, final round and Report flows in AR; English regression of all flows; no console errors.

**Definition of Done (Sprint 13, on top of the global DoD)**
- [x] A string inventory exists and every item is translated or deliberately left in English with a reason (293 keys, all with Arabic; in `docs/sprints/sprint-13-dev.md`). Arabic is AI-drafted (D-58 a) until the native review (FU-48).
- [x] English behaviour and layouts are unchanged (regression passed, test report 29/29, then fix loop 1 re-test 16/16).
- [x] No migration needed (no PHP, no SQL); saved game version unchanged. Remaining, not DoD of the code: owner Chrome check and commit (FU-47), hosted deploy and device check (FU-49), native review (FU-48). Global DoD "tester report has no open Critical/Major bugs" met (BUG-13-01 and BUG-13-02 fixed).

**Status:** Done (accepted by the PO 2026-11-09, after fix loop 1; 293 strings, no migration), pending the owner's local Chrome check and commit (FU-47), the hosted deploy and device check (FU-49) and the native review of the Arabic strings (FU-48). Branch `sprint-13`, not committed yet. **Outcome:** US-49 accepted; no carry-over stories; known issues: FU-50 (Arabic Setup 22 px taller on a phone, no action), FU-51 (`.gitignore` LF lines), FU-52 (local `question_stats` side effect); all three closed 2026-11-11 in CR `cr-fu61-50-51-52` (FU-51 fixed, FU-50 and FU-52 no action). **Ran before Sprint 12:** see the notes in Sprints 12 and 14 (D-60). Test report `docs/sprints/sprint-13-test-report.md`: 29/29 PASS, then fix loop 1 re-test 16/16 PASS; BUG-13-01 and BUG-13-02 fixed. Decisions D-58 to D-60; follow-ups FU-47 to FU-52. **Change request "Arabic category names"** (owner, 2026-11-09, on top of Sprint 13): accepted by the PO 2026-11-09 (D-61, amends D-59 b). Names in a new `categories.name_ar` column edited in Admin; Kilo Meshakkal's in `js/i18n.js`; Setup order stays English alphabetical. Test report section 9: 20/20 PASS, 0 FAIL, 1 PENDING (Admin at 375 px, FU-55); BUG-13-04 (Minor wording, Flags) to the native review (FU-54). This CR adds a migration and PHP changes, so the "no migration" DoD line above holds for US-49 only: on hosted, `sql/migrate-add-category-name-ar.sql` and then `sql/add-category-arabic-names.sql` run **before** the code (FU-53). Follow-ups FU-53 to FU-56. **CR FU-55 / FU-56** (Admin categories at 375 px; Arabic category names in the Start Game error and Admin Questions / Reports): accepted by the PO 2026-11-11 (test report `docs/sprints/cr-fu55-fu56-test-report.md`: 22 PASS, 0 FAIL, 0 bugs; no API, DB or PHP change). Committed and merged (PR #101); hosted deploy and phone check pending (FU-57). Not covered: game logs (FU-58, cancelled by the owner 2026-11-11: Admin is English, D-59 d), other Admin tables at 375 px (FU-59, done in the next CR). **CR FU-44 / FU-59** (Admin Questions compact at 801 to 1200 px with a show/hide columns button; Admin tables as cards up to 800 px): accepted by the PO 2026-11-11 (test report `docs/sprints/cr-fu44-fu59-test-report.md`: 27 PASS, 0 FAIL, then re-test all PASS; BUG-FU44-01, OBS-1, OBS-2 fixed; no API, DB or PHP change). Branch `cr-fu44-fu59`, merged (PR #102), deployed and live-verified 2026-11-11 (FU-60 Done). Not covered: 1201 to 1365 px keeps the full table (optional FU-61); the toggle is not remembered. *(Amended 2026-11-11 by FU-61, D-63 a: the compact layout now applies up to 1365 px.)* **CR FU-38** (Kilo Meshakkal id and name defined once in `api/db.php`, D-54 g; refactor, no behaviour change): accepted by the PO 2026-11-11 (test report `docs/sprints/cr-fu38-test-report.md`: 24 PASS, 0 FAIL; API output byte-identical to `main`; PHP change, no migration). Branch `cr-fu38`, merged (PR #103), deployed and live-verified 2026-11-11 (FU-63 Done). Not covered: the JS client keeps its own copy by design. Pre-existing BUG-FU38-01 (inner double space passes the built-in name guard) to FU-62 (Could), done in the next CR. **CR FU-62 / FU-30 / FU-34 / FU-35** (category name guard collapses whitespace; Daily #N from `DAILY_LAUNCH_DATE` 2026-11-02; Golden Goal "Next round" and app Back confirm on a still-tied question; Golden Goal draw excludes Swap questions): accepted by the PO 2026-11-11, all four items (test report `docs/sprints/cr-fu62-30-34-35-test-report.md`: 38 PASS, 0 FAIL, 2 PENDING for environment, 0 bugs; PHP change in `api/categories.php` and `api/daily.php`, no migration, optional saved-game field `used[key].swap.id`). Decisions D-62. Branch `cr-fu62-30-34-35`, merged (PR #105); not deployed yet, its deploy is folded into the consolidated deploy of FU-67 (FU-64 open; with the undeployed leaderboard css fix of PR #104). Not covered: a game in progress across the deploy keeps its earlier Swap questions drawable. FU-65 (Swap helper's own draw) and FU-66 (real-device Android Back) were cancelled by the owner on 2026-11-11 (D-63 c). **CR FU-61 / FU-50 / FU-51 / FU-52** (Admin Questions compact layout extended to 801 to 1365 px; `.gitignore` CRLF; FU-50 and FU-52 closed with no action): accepted by the PO 2026-11-11 (test report `docs/sprints/cr-fu61-50-51-52-test-report.md`: 22 PASS, 0 FAIL, 0 bugs; CSS, `admin.html` and admin JS comment changes and `.gitignore` only; no API, PHP, DB or migration). Decisions D-63 (amends the FU-44 range: compact layout up to 1365 px, not 1200; with the columns shown the table scrolls sideways only below about 950 px). FU-61 and FU-51 Done; FU-50 Done (no action); FU-52 closed (no action). Branch `cr-fu61-50-51-52`, not committed; owner check, commit and one consolidated deploy from `main` after the merge, including FU-64's undeployed set (FU-67). `package.json`, `package-lock.json`, `.claude/launch.json` and `googlebbe9a71d60b82d1a.html` stay uncommitted on purpose.

---

## Sprint 14 — Phone buzzers (US-52) — later, spike first

**Goal:** Decide with evidence whether phone buzzers can work on Hostinger shared hosting (no WebSockets), and build them only if the owner commits the story after the spike. (Owner: later, its own sprint.)
**Stories:** US-52 (**not committed** until the FU-24 spike result is accepted by the owner and the PO)
**Dependencies:** **FU-24** (technical spike on short polling: latency, server load, cleanup). If committed: Sprint 13 is already done, so the buzzer pages (`buzzer.html`, `js/buzzer.js`) and the new host-screen room code / QR strings must ship in English and Arabic through `js/i18n.js` (D-60), with RTL and Arabic tests; Setup/Question screens; Privacy page.
**Owner questions needed before development:** **FU-24** (spike) and, after it, the owner's go / no-go. Nothing in Phase 2 starts before that.

**Phase 1 — Spike (time-boxed, no application code merged)**
1. `docs/sprints/sprint-14-spike.md` — prototype of a room with short polling (a throwaway script, not merged): measure buzz-to-host latency, requests per second per room, and load on the shared host for 1, 5 and 10 phones.
2. Same note — fairness check (how often the order is wrong at about 0.5-1 s polling), cleanup options without cron (for example deleting idle rooms on request), and the tables needed.
3. Same note — go / no-go recommendation; the PO and owner decide, and the Scrum Master then either commits Phase 2 (and updates this sprint) or moves US-52 back to the backlog.

**Phase 2 — Outline only, to be refined after the spike (not committed)**
4. `sql/migrate-add-buzzer-rooms.sql` (new) + both schema files — room and buzz tables with a last-activity time; rooms idle for 6 h are deleted.
5. `api/rooms.php` (new) — create room (code), join (pick contestant), buzz, read buzz order; validation and rate limits; no personal data.
6. `buzzer.html` + `js/buzzer.js` (new) — phone page; `index.html` + `js/game.js` — room code and QR on the host screen, buzz order shown within about 1 s, host still scores; a QR approach that adds no external service.
7. `privacy.html`, `README.md`, `docs/deploy-hostinger.md`, `docs/sprints/sprint-14-dev.md`.

**Tester focus:** Phase 1: the spike note's numbers can be repeated and the recommendation follows from them. Phase 2 (if committed): room code and QR, join, first buzz order within about 1 s with several phones, host scoring unchanged, 6 h cleanup, bad codes and rate limits, load on the host, phone browsers (iOS Safari, Chrome Android), no console errors.

**Definition of Done (Sprint 14)**
- Phase 1: spike note delivered and the go / no-go decision recorded in the backlog. A "no-go" closes the sprint as Done with no code.
- Phase 2 (only if committed): global DoD, plus the migration rule above (migration before the code on every DB; both schema files updated).

**Status:** Planned (later; Phase 2 not committed)

---

## Sprint 15 — Rewarded second chance in Streak (US-51) — later, blocked

**Goal:** In a Streak run on the website, one wrong answer per run can be forgiven after the player watches a rewarded ad. (Owner: later, its own sprint.)
**Stories:** US-51
**Dependencies:** **FU-23** (blocked until H5 Games Ads approval, D-41); website only, never in the app (D-43, detection by `?source=twa`); AdSense consent setup; Streak and its leaderboard (D-37).
**Owner questions needed before development:** **FU-23** answered (approval received). The sprint does not start before that. Also to confirm with the PO: the story says the leaderboard row shows a marker, which needs a stored flag on the run, so this plan includes a small migration; if the owner prefers no marker, drop tasks 1-2 and 5.

**Developer tasks**
1. `sql/migrate-add-streak-second-chance.sql` (new) — add a "used second chance" flag to `streaks` (default 0), re-runnable (no error when the column already exists); run locally twice.
2. `sql/schema.sql` + `sql/schema-hosted.sql` — the same column in the `streaks` table; bodies identical.
3. `js/game.js` (+ the existing ads loader, D-41) — after a wrong answer, with ads on, a rewarded ad available and not in the app, offer "Watch an ad to continue" once per run; on completion continue with the next question; otherwise the run ends as now. Timer, refresh deadline and saved run (`brainrush.streak`) keep working; never offered in the app or with ads off or in maintenance mode.
4. `api/streaks.php` — accept the flag on POST (validated 0/1); the leaderboard returns it; the best-run query is unchanged otherwise (D-37).
5. `index.html` + `js/game.js` + `css/style.css` — small marker on a leaderboard row for a run that used a second chance; row text still reads as text for screen readers (D-37 j).
6. `privacy.html`, `how-to-play.html`, `README.md`, `docs/deploy-hostinger.md` — rewarded ad and consent notes; migration step before the code.
7. `docs/sprints/sprint-15-dev.md`.

**Tester focus:** offer appears once per run after a wrong answer (website, ads on); not in the app (`?source=twa`), not with ads off or maintenance mode; ad completed -> next question, ad closed or failed -> run ends; time's up case; refresh around the ad; marker on the leaderboard row; old rows without the flag; consent message behaviour in the EEA setup; migration run twice; Streak regression and 1366x768 / 375x812; no console errors.

**Definition of Done (Sprint 15, on top of the global DoD)**
- `sql/migrate-add-streak-second-chance.sql` runs on every DB, including the hosted one, **before** the code is deployed, and the column is added to both `sql/schema.sql` and `sql/schema-hosted.sql` (migration rule above).
- Nothing in the app ever loads or shows the rewarded ad (D-43), verified in the app build.
- H5 Games Ads approval confirmed by the owner before the hosted deploy.

**Status:** Planned (later; blocked by FU-23)

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
| 7 | US-42 (accepted 2026-11-02, pending owner checks FU-25 and FU-26) |
| 8 | US-43, US-46, US-45 (accepted 2026-11-02, pending owner checks FU-28 and FU-29) |
| 9 | US-44, US-48 (accepted 2026-11-02, re-accepted 2026-11-03 after D-51; merged, PR #89; owner step FU-32 still open) |
| 10 | US-53 (accepted 2026-11-03, pending owner checks FU-36 and FU-37) |
| 11 | US-47 (planned) |
| 12 | US-50 (cancelled 2026-11-11) |
| 13 | US-49 (done, accepted 2026-11-09) |
| 14 | US-52 (planned, later; spike first, not committed) |
| 15 | US-51 (planned, later; blocked by FU-23) |

Epic E17 (US-42..US-53): all 12 stories appear in exactly one of Sprints 7-15 (US-42..US-52 were approved on 2026-11-02; US-53 was added on 2026-11-03). Stories US-31..US-41 were delivered outside the sprint cycle (see the status paragraphs at the top) and have no sprint here.

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

---

## Change request "Free second chance in Streak" (US-54) — outside the sprint cycle, 2026-11-11

**Change request (owner, 2026-11-11):** every Streak Challenge run gets one free second chance after the first wrong pick or time-out: the streak is kept, the missed question is replaced by a new one. Streak Challenge only (D-65). Client-only (`game.js`, `i18n.js`, `index.html`, guide and `llms.txt`); US-51 (rewarded ad) stays planned in Sprint 15. Branch `streak-second-chance`. Dev and test notes: `docs/sprints/cr-us54-dev.md`, `docs/sprints/cr-us54-test-report.md`. **Status:** built; local Chrome test next, then PR for the owner.

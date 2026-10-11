# Sprint 6 - Test Report (Question bank: US-30, D-31)

Tester: Senior Tester (game-tester). Date: 2026-10-11. Scope: US-30 Question bank, the amended US-19, US-20, US-21, US-24 and US-25, and retired US-22 (Coverage), decision D-31 in `docs/product-backlog.md`. Developer note: `docs/sprints/sprint-6-dev.md`. Plan: Verification section of the approved Sprint 6 plan.

## Summary

**Environment:** Windows 11, Git Bash, XAMPP.
- PHP 8.0.30 CLI. MariaDB 10.4.32 (XAMPP). It was stopped; the tester started it and it answered `mysqladmin ping`.
- Branch `sprint-6`, uncommitted working tree (13 modified files plus 4 new: `docs/question-bank.md`, `docs/questions-600.md`, `docs/sprints/sprint-6-dev.md`, `sql/migrate-question-bank.sql`). Nothing committed, nothing pushed, no application code modified by the tester.
- Servers: PHP built-in server on `127.0.0.1:8765` (main tests) and, briefly, `127.0.0.1:8766` from a temporary copy of `api/` with a throwaway test admin login (auth check only). Both stopped; the temporary copy was deleted.
- Browser: in-app Browser pane (fixed 1024x768, devicePixelRatio 1.25). 1366x768 and 1920x1080 layout checks used same-origin iframes of that exact size (same method as the Sprint 5 report).
- Node.js is not installed, so `node --check` was not run. In its place `js/admin.js` and `js/game.js` were loaded and exercised in the browser: no JS errors (see row R9).
- Local `brainrush` DB: baseline 155 questions, point values 100-600, settings 3 / 30, `MD5` of all question rows recorded. After the tests all of that is identical (see Cleanup).
- Test data: obvious names ("Team A", "Team B", "Team A Short", "S6 ..."). No real personal data. The temporary admin test login was made up and lived only in the deleted temporary copy.

| Result | Count |
|---|---|
| PASS | 35 |
| FAIL | 0 |
| PENDING | 0 |
| Observations (non-blocking) | 7 |

Application bugs: 0 Critical, 0 Major, 0 Minor. Observations OBS-1 to OBS-7 below are for the PO.

## Static checks

- `php -l` on all 8 files in `api/` (`auth`, `categories`, `config`, `config.example`, `db`, `points`, `questions`, `settings`): no syntax errors.
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval(`, `new Function` in `js/*.js`, `index.html`, `admin.html`: only the two existing comments (`js/game.js:4`, `js/admin.js:2`). All admin output goes through the `h()` helper with `text`.
- SQL: every query with a value uses prepared statements. The only non-prepared `query()` calls are constant strings (`api/questions.php:45`, `:112`, `api/points.php:15`, `api/categories.php:29`). The IN-list placeholders in `board()` are generated `?` marks, not data.
- Hard-coded board sizes: none. The number of rows is `count($points)` (`api/questions.php:113`), "needs P" comes from `state.points.length` (`js/admin.js:397`). The category check uses `(SELECT COUNT(*) FROM point_values)`.
- Credentials: none in `js/`, `index.html`, `admin.html`, `css/`. `api/config.php` is ignored (`.gitignore:1`, `git check-ignore -v`). `password.txt` ignored. I did not open `password.txt`; I looked at `api/config.php` only with values masked (DB host/name and an empty DB password for local XAMPP; no admin login set, so local writes are allowed from localhost only).
- Dead references: every `byId('...')` id used in `js/admin.js` exists in `admin.html`; no removed id (points select, coverage) is referenced. The CSS classes removed from `css/style.css` (`.item-meta`, `.coverage-table*`, `.slot*`, `.legend`, `.legend-swatch`) are not used in `js/`, `index.html` or `admin.html` any more (the remaining `legend` hits are the HTML `<legend>` elements, styled by `.setup-block legend`).
- Docs wording: no leftover slot / coverage / points-dropdown rules in `README.md`, `docs/spec.md` (only struck-through history), `docs/deploy-hostinger.md`, `.claude/agents/product-owner.md`.

## Acceptance criteria

IDs: D = Data and rules, B = Drawing the board, P = Persistence, A = Admin, S = Data delivery (all US-30 sections). Amended stories are listed after.

### US-30

| # | Criterion | Result | Evidence |
|---|---|---|---|
| D1 | A question has only category, text and answer; no point value (admin and API) | PASS | `SHOW CREATE TABLE questions` on `brainrush`, the migrated scratch DB and both fresh installs: columns `id, category_id, question, answer`. API responses (POST/PUT/GET) contain no `points`. Admin form has Category / Question / Answer only (`question-category`, `question-text`, `question-answer`). |
| D2 | Playable = M >= P and M >= 1; listed by `categories.php?playable=1` and in game setup; M < P not listed | PASS | Temporary "Team A Short" with 3 and 5 questions: absent from `playable=1` and from the setup list in the browser (also "Team B Other" with 2). With exactly 6: present in both. After adding point value 700 (P=7) it dropped out again; after deleting 700 it was back. |
| D3 | Same text in same category, other case: 409 "This category already has this question", nothing changes (create and edit); same text in another category succeeds | PASS | POST `WHAT IS THE CAPITAL OF PERU (S6 TEST)?` vs existing `What is the capital of Peru (S6 test)?`: 409 with that message. Exact duplicate: 409. PUT of another question to `what is the CAPITAL of peru (s6 test)?`: 409, row unchanged. Same text lower case in another category: 201. Editing a question to its own text with changed case: 200 (no self-conflict). In the browser the duplicate add shows the red message "This category already has this question" and the table is unchanged. |
| D4 | Delete any point value: 200 and no question touched; add a point value: categories with M < new P stop being playable | PASS | POST 700: 201 (duplicate 409; 0 and "abc" 400). DELETE 700: `{"deleted":8}` 200; again: 404; without id: 400. Question count 163 before and after (no question touched). With 7 values the 6-question category was not playable and its board gave 400 "needs at least 7 questions (has 6)". Admin UI messages: "Point value 700 added. Each category now needs at least 7 questions to stay playable." / "... deleted. Each category now needs at least 6 ...". A real, used value (not only the temporary 700) was not deleted, to keep the DB ids unchanged; with no `points` column there is no code path that differs. |
| B1 | Start Game: server draws P distinct random questions per chosen category on the point rows in random order | PASS | 10 requests for categories 1-5: 10 different boards. Per category (10 requests each): 10 different draws; row-100 question varied (7 to 8 different questions in 10 requests). In the browser two real games with the same categories: 15 of 18 cells differ. |
| B2 | Board shape unchanged | PASS | Every response: top-level keys `points`, `categories`; `points` = `[100..600]` ascending; each category keys `id, name, questions`; `questions` is an object keyed by every point value with `{question, answer}` only; categories in the requested order (also 3,1). Every drawn question belongs to the requested category. `js/game.js` unchanged and plays the board. |
| B3 | No question twice on a board | PASS | 0 repeats in 10 full boards (5 categories x 6 rows) and in 30 single-category draws. |
| B4 | ~10 requests for a category with M > P: questions and/or order differ | PASS | See B1 (10 of 10 distinct per category). |
| B5 | Category with exactly P questions: all appear, random row order | PASS | "Team A Short" with exactly 6 questions: 6 requests, all six questions in each response, order different in every response. |
| B6 | Category with M < P in a board request: 400 "Category X needs at least P questions (has M)", no board | PASS | `Category "Team A Short" needs at least 6 questions (has 3)` with ids `10` and `1,10`. In the browser: select the category in setup, delete a question by API (6 to 5), click Start: "Could not start the game: Category "Team A Short" needs at least 6 questions (has 5)", the page stays on Setup. Unknown id 400, non-numeric 400, repeated id 400, missing `categories` 400. |
| P1 | Refresh mid-game: same drawn board, same used cells, no new draw | PASS | Played Geography 300 (Team B correct), refreshed on the board: saved `game.categories` is byte-identical to the one saved at Start; used cell `1:300` owned by Team B, scores kept, "Played 1 of 18". No `*.php` resource request after the reload (nothing fetched, no redraw). |
| P2 | Results then New Game with the same categories: fresh random board | PASS | End Game, Results ("Team B wins!"), New Game, same three categories in the same order: board differs in 15 of 18 cells. |
| A1 | Admin: no points field, no Points column, no Coverage panel; categories table "M questions (needs P)" and "X more needed" when M < P | PASS | DOM: form fields are `question-category`, `question-text`, `question-answer`; table headers Category / Question / Answer / Actions and Name / Questions / Status / Actions; no element with an id containing "coverage"; `h2` headings: Game settings, Point values, Categories, Questions. Rows: "26 questions (needs 6)  Playable"; "2 questions (needs 6)  Not playable: 4 more needed"; with P=7 "6 questions (needs 7)  Not playable: 1 more needed". Summary line "7 of 8 categories are playable (at least as many questions as point values). A game needs 3." Short states use the red badge. |
| S1 | Fresh install: `schema.sql` and `schema-hosted.sql` give 150 questions, 25 per category, no error and no duplicates on a second import; both files in sync | PASS | Scratch DBs (dropped afterwards). `schema.sql` (CREATE DATABASE/USE lines rewritten to the scratch name so `brainrush` was never touched) imported twice: exit 0 both times, 150 rows, 150 distinct (category, question), 150 distinct answers, 25 per category, settings 5 / 30, point values 100-500. `schema-hosted.sql` imported twice into a pre-created scratch DB: 150. The second runs only give Notes 1050 and duplicate-skip Warnings 1062. Content hash of (category, question, answer) is identical for the two installs. `diff` of everything from `CREATE TABLE IF NOT EXISTS settings` onward: identical; the files differ only in the header and the CREATE DATABASE/USE lines. |
| S2 | Migration of an existing DB: no `points`, no slot key, no FK to point_values; existing questions kept; 120 bank questions added by category name; renamed/deleted categories skipped; no double add | PASS | Backup restored into scratch DB `s6_mig` (the dump's `CREATE DATABASE`/`USE brainrush` lines were removed first so the real DB was not touched). Before: 36 questions, 6 per category, `points`, `uq_slot`, `idx_questions_points`, `fk_questions_points`. After run 1: 155 questions (Geography 26, Science 25, History 26, Sports 26, Movies 26, Technology 26), columns `id, category_id, question, answer`, `UNIQUE KEY uq_category_question`, FK to categories ON DELETE CASCADE only. The result matches the dev note and the local `brainrush` (content hash of category/question/answer identical, 155 rows). Science 25 = 6 existing + 20 bank - 1 (the "How many bones" question already existed and was skipped by `INSERT IGNORE`). Then renamed Geography and deleted Movies and ran again: exit 0, nothing added, Geography renamed category kept at 26, Movies gone (129 = 155 - 26). |
| S3 | Migration re-run: no error, count unchanged | PASS | Run 2 on `s6_mig`: exit 0, 155 rows. Output only Notes 1061 / 1091 / 1051 and duplicate-skip Warnings 1062. Note 1051 "Unknown table bank_seed" on every run comes from `DROP TEMPORARY TABLE IF EXISTS`; harmless. |
| S3b | Migration with a same-text duplicate in one category (allowed by the old slot model) aborts cleanly | PASS | Restored backup with a case-variant duplicate in Geography: step 1 fails with `ERROR 1062 ... uq_category_question`, exit 1, nothing changed (still 36 rows, `points` column still there). Matches the header text and the dev note. |
| S4 | `docs/question-bank.md`: exactly 120 questions, 20 per category, no question or answer duplicating the 30 seed questions, the 6 Egypt questions or each other | PASS | Parsed with a script: 120 rows, 20 each for Geography, Science, History, Sports, Movies, Technology. 0 duplicate questions and 0 duplicate answers (case-insensitive) against the 30 seed rows, the 6 Egypt rows in `docs/questions-600.md`, and within the bank. Longest question 123 characters; all plain ASCII. The rows in `sql/schema.sql` (30 seed + 120) and the 120 tuples in `sql/migrate-question-bank.sql` equal the markdown verbatim and in order (programmatic comparison). Facts: see "Content check" (no wrong fact found; OBS-5). |

### Amended stories

| # | Criterion | Result | Evidence |
|---|---|---|---|
| US-19 | Add a point value: message "each category now needs at least P questions"; delete: HTTP 200, no question changed or deleted | PASS | See D4. The old 409 "value still used by questions" is gone. |
| US-20 | Each category "M questions (needs P)"; M < P adds "X more needed" and is marked not playable | PASS | See A1. Singular form "1 question" is handled by `plural()`. |
| US-21 | Add / edit / delete a question in admin; table and the category count update | PASS | Browser, real clicks and form: added "UI test question for Team A?" to "Team B Other" without points: message "Question added (Team B Other).", count 2 to 3 ("3 more needed"). Edit (title "Edit question (Team B Other)", fields prefilled, button "Save changes"): changed the answer: "Question updated (Team B Other).", table row updated. Delete (confirm text "Delete this question from "Team B Other"? ... UI test question for Team A?"): "Question deleted (Team B Other).", count back to 2. |
| US-22 | Retired: no Coverage panel and no code | PASS | See A1 and Static checks. |
| US-24 | Schema: no `points` column; case-insensitive unique key on (category_id, question); FK to categories with CASCADE; no FK to point_values; seed 6 categories x 25 | PASS | See D1, S1. Deleting the temporary categories cascaded their questions (200). Case-insensitivity shown by D3. |
| US-25 | Endpoints and validation: `playable` rule; board shape and 400s; a `points` field in a body is not used; missing/empty fields, unknown category 400; 404s | PASS | POST with `"points":999`: 201, response has no `points`. PUT with `"points":123`: 200, no `points`. Missing answer 400 "Answer is required"; blank question 400; unknown category 400 "Category not found"; invalid JSON 400; PUT/DELETE unknown id 404; DELETE without id 400; PATCH 405. |
| Auth | Admin auth unchanged for writes | PASS | `api/db.php` is not changed in the diff. Run with a temporary copy of `api/` that has an admin login set: POST/PUT/DELETE without credentials 401 "Login required to change content." (questions, points); wrong password 401; correct login 201 / 409 / 200; GET (board) works without login; `auth.php` 401 without and 200 `{ok:true}` with credentials. With no admin set (the local config) writes work from localhost, as before. |

## Regression (game flow, admin, layout)

| # | Item | Result | Evidence |
|---|---|---|---|
| R1 | Setup lists only playable categories; names and tick order kept | PASS | Setup showed 7 categories (the 6 seed ones plus "Team A Short" at 6 questions); "Team B Other" (2 questions) hidden. Selection order drove the column order (Geography, Science, History). |
| R2 | Start Game builds a board of the right size | PASS | "2 players, 3 x 6 board, Played 0 of 18, Timer 30 s", 18 cells, rows 100-600. |
| R3 | Whole cycle: question, score, back to board | PASS | Click Geography 300: question screen "GEOGRAPHY - 300" with "What is the capital city of Brazil?" (the question stored in the saved board at that cell), timer 30. Show Answer: "Brasilia". Team B Correct (+300): Team B 300. Back to Board: cell shows "300 / Team B" owned colour, "Played 1 of 18". |
| R4 | Results | PASS | End Game (confirm): "Team B wins!", 1. Team B (Winner) 300, 2. Team A 0, New Game button. New Game returned to an empty Setup. |
| R5 | Refresh persistence (D-12) | PASS | See P1. |
| R6 | Layout unchanged at 1366x768 and 1920x1080 | PASS | Real board loaded in same-size iframes: 1366x768 docH 768, scrollWidth = clientWidth 1366 (no horizontal scroll); 1920x1080 docH 1080, no horizontal scroll. In the 1024x768 pane the board and the admin page have no horizontal scroll either (1024 / 1009). No game CSS was removed in this sprint (only admin-only rules); `js/game.js`, `index.html` unchanged. |
| R7 | Error path in the UI | PASS | See B6 (readable message on Setup). |
| R8 | Admin page loads all panels | PASS | Settings, Point values (no counts), Categories, Questions (with the new pool hint). Edit mode toggles correctly (title, button text). |
| R9 | No JS errors | PASS | `read_console_messages` on `admin.html` and `index.html`: only the two browser-logged network errors caused on purpose (the 409 duplicate and the 400 short category). No uncaught error or `unhandledrejection`. |
| R10 | Database restored, no test data left | PASS | See Cleanup. |

## Content check (`docs/question-bank.md`)

Every one of the 120 questions was read against general knowledge. **No factually wrong question or answer found.** Items checked with extra care and found correct:
- Geography: Algeria is the largest African country by area (since 2011, after Sudan split); "largest island, counting Australia as a continent" is Greenland; Brasilia (not Rio); Tigris through Baghdad; the Dead Sea shore is the lowest land point.
- Science: 206 bones; the bat is the only mammal capable of true powered flight; mercury is the only common metal liquid at room temperature (bromine is a non-metal, so "metal" is safe); Newton's laws 1687.
- History: Churchill for most of WWII (May 1940 onward) is fine; Hadrian's Wall begun AD 122; Pompeii AD 79 (Herculaneum accepted); Marie Curie first woman Nobel winner (1903); Mandela freed 1990, president 1994.
- Sports: highest single-dart score 60; marathon 42.195 km (the answer line covers 26.2 miles); decathlon 10 events; Fosbury Flop is the high jump; snooker black = 7.
- Movies: all film years, lines and characters checked (Casablanca 1942, Jaws 1975, Forrest Gump 1994, Shrek 2001, Gone with the Wind 1939, The Shining 1980).
- Technology: Bell patent 1876, Marconi 1901, Wright brothers 1903, transistor 1947, Engelbart mouse (1960s), Turing 1950, Gutenberg c. 1440, Google 1998.
Wording notes only (not errors): Geography #9 "Counting Australia as a continent ..." is clumsy but unambiguous; Sports #8 "scrum and a try" also fits rugby league, which the "Rugby" answer covers.

## Observations (not bugs)

- **OBS-1 (pre-existing, cosmetic): "Cancel edit" is visible in Add mode.** `#question-cancel` has `hidden` set (JS `qCancel.hidden = !editing`) but `.btn` sets `display: block`, so the button always shows. Confirmed identical in `HEAD` (`css/style.css` has no `.btn[hidden]` rule; `admin.html` has the same button and `admin.js` the same `qCancel.hidden = !editing` line). Not caused by Sprint 6; clicking it in add mode only clears the form. Could be fixed by a `.btn[hidden] { display: none; }` rule.
- **OBS-2 (accent-insensitive duplicates):** the unique key uses `utf8mb4_unicode_520_ci`, so it is accent-insensitive as well as case-insensitive. "Résumé test café?" is refused as a duplicate of "Resume test cafe?" with the same 409 message. Consistent with how category names already behave; arguably desirable. Noted for the PO.
- **OBS-3 (191-character index prefix, disclosed in the dev note):** two different questions that share their first 191 characters in one category are refused as duplicates. Reproduced with two 196-character questions that differ only in the last character: 409. Acceptable for a quiz (questions are normally far shorter).
- **OBS-4 (near-duplicates in the owner's local DB, disclosed in the dev note):** Science: "What is the only metal that is liquid at room temperature?" and bank "Which metal is a liquid at normal room temperature?" (both Mercury). Geography: "Mount Fuji is located in which country?" and the bank "Honshu ... islands" question (both Japan). Both pairs can land on the same board. Fresh installs are clean. The owner may want to delete one of each pair.
- **OBS-5 (content: a question gives a hint to another one):** the bank rule says "no question text gives away another question's answer". Science #5 ("... when the skin is exposed to sunlight?") contains the answer of Science #7 ("The skin") and the stem of #16 ("The Sun"). Only matters when both are drawn on one board. Not a fact error; the PO may reword #5, for example "Which vitamin does the human body make when exposed to ultraviolet rays?", which avoids both.
- **OBS-6 (cosmetic, DB):** `INSERT IGNORE` and the failed inserts burn AUTO_INCREMENT values (`questions` next id is now above 190, `categories` above 11, `point_values` above 8 on the local DB). No functional effect; ids simply have gaps.
- **OBS-7 (process):** `docs/sprint-plan.md` has no Sprint 6 entry yet (the plan assigns this to the scrum-master). The tester did not check it further. Also, the sprint-6 branch contains unrelated untracked `docs/questions-600.md` (the PO's 600 note); it was updated with a D-31 banner and is consistent.

## Not covered / limits

- `node --check` not run (Node not installed); covered by loading both scripts in the browser with no errors.
- The Browser pane cannot be resized; 1366x768 and 1920x1080 were measured in same-size iframes (R6). A look in a real 1366x768 laptop window is left to the owner's Chrome check.
- 0 point values and deleting a real used point value (for example the real 600) were not tested, to avoid changing the local DB ids. Deleting the temporary 700 exercised the same code.
- Hosted behaviour (phpMyAdmin import, `CREATE TEMPORARY TABLES` privilege on Hostinger, CDN cache of `admin.js`) cannot be verified here; the steps are in `docs/deploy-hostinger.md`.

## Cleanup

- Scratch databases `s6_mig`, `s6_dup`, `s6_fresh`, `s6_fresh_h`: created and dropped; `SHOW DATABASES` afterwards lists only `brainrush`, `information_schema`, `mysql`, `performance_schema`, `phpmyadmin`, `test`.
- `brainrush`: temporary categories "Team A Short" and "Team B Other" (with all test questions) deleted; temporary point value 700 deleted. Final state: 6 point values (100-600), 155 questions (Geography 26, Science 25, History 26, Sports 26, Movies 26, Technology 26), settings 3 / 30, and the `MD5` over all question rows equals the one taken before testing. The `brainrush` database was never dropped or re-imported. Only AUTO_INCREMENT counters moved (OBS-6).
- Backup `C:/Users/NB28970/Desktop/claude/brainrush-backup-pre-sprint6.sql`: untouched (8196 bytes, same timestamp).
- Browser `localStorage` and `sessionStorage` cleared. PHP servers on 8765 and 8766 stopped; the temporary copy of `api/` (with the throwaway admin login) and the temporary scripts deleted.
- MariaDB: started by the tester and **left running** (for the owner's Chrome check; stop with `C:/xampp/mysql/bin/mysqladmin.exe -u root shutdown`).
- No file in the project was changed by the tester other than this report; `git status` is the same as at the start plus this file.

## Bugs

None found (0 Critical, 0 Major, 0 Minor). See OBS-1 to OBS-7.

## Verdict

**READY FOR PO.**
- US-30: PASS on all criteria (data and rules, drawing, persistence, admin, data delivery).
- Amended US-19, US-20, US-21, US-24, US-25: PASS. US-22 retired: PASS (nothing left in UI, CSS or code).
- Regression: game flow (setup, draw, question, scoring, back to board, Results, New Game), refresh persistence (D-12), layout at 1366x768 / 1920x1080, admin write authentication and the console are all clean.
- Migration and fresh install behave as described in the dev note (155 on the local shape, 150 on a fresh install, re-runnable).
- For the PO to decide: OBS-4 (two local near-duplicate pairs to clean in admin), OBS-5 (reword one Science question if wanted), OBS-1 (pre-existing "Cancel edit" visibility, could be a Could-have follow-up).

## PO acceptance

Product Owner, 2026-10-11. Based on the dev note, this report and `docs/product-backlog.md` (US-30, D-31).

| Story | Decision | Reason |
|---|---|---|
| US-30 Question bank | **ACCEPTED** | All 16 criteria pass: D1–D4, B1–B6, P1–P2, A1 and S1–S4. Evidence includes the random, distinct draw with an unchanged payload, the 400 for a short category, D-12 on refresh, a fresh draw on New Game, case-insensitive 409, and point-value delete returning 200. Fresh install gives 150, re-runnable. The migration keeps existing questions (local 155) and aborts cleanly on a duplicate. Content is 120 = 6 x 20 with no overlap. |
| US-19 Point values (amended) | **ACCEPTED** | Add shows "Each category now needs at least N questions". Delete returns 200 and touches no question (D4). The old 409 is gone. |
| US-20 Categories (amended) | **ACCEPTED** | Shows "M questions (needs P)" and "Not playable: X more needed" in the red badge (A1). |
| US-21 Questions (amended) | **ACCEPTED** | Add, edit and delete work without points, counts update, and the 409 shows inline. A move or edit to a duplicate gives 409 (D3, real browser flow). |
| US-22 Coverage grid | **RETIRED** (D-31) | Confirmed removed from the UI, JS and CSS. Nothing left to test. |
| US-24 Schema and seed (amended) | **ACCEPTED** | No `points` column and no FK to point_values. Case-insensitive `uq_category_question`, CASCADE kept, 6 x 25 seed. Both schema files are in sync and re-runnable (S1). |
| US-25 API (amended) | **ACCEPTED** | Playable rule, board shape and 400s, ignored `points`, validation 400/404/405 all pass. Auth is unchanged (US-29 regression passes). |

Decisions recorded in the backlog (D-31 amendment, 2026-10-11):
- A `points` field in a question body is ignored.
- Short categories show "Not playable: X more needed".
- OBS-2: accent-insensitive duplicates are accepted (same as category names).
- OBS-3: the 191-character duplicate prefix is accepted.
- OBS-5: Science #5 is reworded to "Which vitamin does the human body make when exposed to ultraviolet rays?" (Vitamin D). The change is in `docs/question-bank.md`, both schema files, the migration and the local DB row (still 155 questions).

Follow-ups logged in the backlog ("Follow-ups after Sprint 6"):
- **FU-10 (Should, Owner):** the owner removes or rewords one question of each local near-duplicate pair in admin: Mercury (Science) and Japan (Geography). From OBS-4.
- **FU-11 (Must, Owner):** hosted migration. Back up, deploy the code, import the migration right away, check the `CREATE TEMPORARY TABLES` privilege and duplicate aborts, then Ctrl+F5, CDN purge and a smoke check. The hosted Sprint 6 redeploy is not done until this passes.
- **FU-12 (Could, Developer):** the "Cancel edit" button shows in Add mode. This existed before Sprint 6 (OBS-1).

No action needed:
- OBS-6: AUTO_INCREMENT gaps, cosmetic.
- OBS-7: the Sprint 6 entry in `docs/sprint-plan.md` is the scrum-master's task.

The tester's limits (`node --check` not run, 1366x768 measured in an iframe, hosted behaviour) are covered by the owner's local Chrome check before commit and by FU-11.

**Sprint 6: ACCEPTED.** The owner's local Chrome check is still required before any commit or push.

**Superseded 2026-10-11 (D-31 amended):** after reviewing Sprint 6, the owner brought back a point value on each question, with a random pick per (category, point value). US-30 was rewritten, and US-19, US-20, US-21, US-24 and US-25 were re-amended. This acceptance no longer stands. Those stories are re-opened, need re-work and re-test against the new criteria in `docs/product-backlog.md`, and need a new PO acceptance. The decisions and follow-ups above still apply as updated in the backlog: FU-10 to FU-12 are kept, FU-11 is updated, and FU-13 is new.

---

## Re-test after rework (2026-10-11)

Tester: Senior Tester (game-tester). Scope: the reworked Sprint 6 (D-31 amended: each question has a point value again, and every board cell draws one random question from that category's pool at that point value), the rewritten US-30, the re-amended US-19, US-20, US-21, US-24, US-25, FU-13, and a short regression of D-32 (host picks 1..N categories). Dev note: "Rework 2026-10-11" in `docs/sprints/sprint-6-dev.md`. **Everything above this section tested the first version; where it conflicts with this section, this section wins.**

### Summary

**Environment:** Windows 11, Git Bash, XAMPP. PHP 8.0.30 CLI, MariaDB 10.4.32 (already running). Branch `sprint-6`, uncommitted. My PHP server ran on `127.0.0.1:8767` (plus a temporary one on `:8768` for the auth check). The owner's server on `localhost:8000` was never touched and still answers 200. Browser: in-app pane (fixed 1024x768); 1366x768 and 1920x1080 were measured in same-size iframes, as before. Node.js is not installed (no `node --check`; the scripts were exercised in the browser instead).

| Result | Count |
|---|---|
| PASS | 36 |
| FAIL | 0 |
| PENDING | 0 |
| Observations (non-blocking) | 5 |

Application bugs: 0 Critical, 0 Major, 0 Minor. No application code was changed by the tester.

### Static checks

- `php -l` on all 8 files in `api/`: no syntax errors.
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`: only the two existing comments (`js/admin.js:4`, `js/game.js:4`). No credentials in `js/`, `index.html`, `admin.html`. `api/config.php` is git-ignored (`.gitignore:1`).
- SQL: all values go through prepared statements. `board()` builds only `?` placeholders. The playable rule is `COUNT(DISTINCT q.points) = (SELECT COUNT(*) FROM point_values)` (no hard-coded 5 or 6). Admin "missing V" is computed from `state.points` and the loaded question list.

### Acceptance criteria (US-30, rewritten)

Terms: cell pool = questions of one category at one point value.

| # | Criterion | Result | Evidence |
|---|---|---|---|
| D1 | Create/edit needs category, a point value that exists, text, answer; missing or unknown points give 400 | PASS | POST without `points`: 400 "points must be a positive integer". `points` "abc", 0, -5, 1.5, null: 400 (same text). Unknown value 999: 400 "Point value 999 does not exist". PUT with 999 or 12345: 400. PUT without `points` keeps the current value (200). PUT to another valid value (200 to 300 and back): 200. Responses include `points`. |
| D2 | A second question (different text) in the same category and point value is accepted | PASS | Second question at 100 in the temporary category: 201 (ids 175 and 178 both at 100). |
| D3 | Playable only when every point value has at least one question; not listed otherwise | PASS | Temporary category with 0, 1 and 5 of 6 values: absent from `categories.php?playable=1` and from the setup list. With all six: present (and offered in setup). Moving its only 200 question to 300 made it unplayable again ("missing questions for: 200"); moving it back restored it. Adding point value 700 made all categories unplayable (`[]`) until 700 was deleted. |
| D4 | Duplicate text in the same category (any case, any points): 409 "This category already has this question"; same text in another category succeeds | PASS | `WHAT IS THE CAPITAL OF PERU (S6R)?` at 200 vs the existing mixed-case text at 100: 409. Exact text at the same points: 409. PUT of another question to `WHAT is the capital of peru (S6R)?`: 409, row unchanged. Same text lower case in another category: 201. The UI shows the same message. |
| D5 | Delete a used point value: 409, nothing deleted; unused: 200; add: categories without that value become unplayable | PASS | DELETE 600 (7 questions): 409 "Cannot delete 600: 7 question(s) still use it. Delete or move those questions first.", value still listed. Temporary 700: POST 201 with `question_count` 0 (duplicate 409; 0 and "abc" 400); DELETE 200, again 404, without id 400. With a user login the used-value delete still gives 409. |
| B1 | Start draws, for every cell, one random question from that cell pool | PASS | 10 boards over all 6 categories (36 cells each): 10 distinct boards; every cell's question exists in that category with that cell's points and answer (0 wrong cells). Geography at 100 (pool of 5), 30 draws: all 5 questions appeared. Browser: the 30 saved cells of a 5x6 game were all verified against `questions.php` (0 wrong). |
| B2 | Shape unchanged; categories in requested order | PASS | Keys `points`, `categories`; `points` = `[100..600]`; each category has `id, name, questions` with an object keyed by every point value and `{question, answer}` only; the order follows the request (also 3,1). `js/game.js` parses and plays it (see regression). |
| B3 | No question twice on a board | PASS | 0 repeats over 10 boards x 36 cells. |
| B4 | About 10 requests differ | PASS | 10 of 10 distinct. In the browser, two games with the same 5 categories differ in 19 of 30 cells (the five 600 cells have a single question each, so they cannot differ). |
| B5 | A pool with exactly one question always lands in its cell | PASS | Geography 600 (one Egypt question): the same question in 10 of 10 draws. The temporary category's 200 cell (one question): 5 of 5. A 2-question cell (temporary category at 100): both questions appear, 11 and 9 over 20 draws. |
| B6 | Category with a missing value: 400 naming the category and every missing value, no board | PASS | Empty category: `Category "Team A Short" is missing questions for: 100, 200, 300, 400, 500, 600`. With 1 question: `...: 200, 300, 400, 500, 600`. With only 600 missing: `...: 600`. With value 700 added: `Category "Geography" is missing questions for: 700`. Unknown id, non-numeric id, repeated id, missing `categories`: 400. The Setup error path (readable "Could not start the game" message) was verified in the first run and `js/game.js` has no change for it. |
| P1 | Refresh mid-game keeps the same drawn board, used cells and scores; no new draw | PASS | 5x6 game, Science 500 answered Correct (+500), back to the board, reload: saved `game.categories` byte-identical to the one stored at Start, used cell `2:500` owned by the player, score 500, "Played 1 of 30", no `*.php` request after the reload. |
| P2 | New Game with the same categories draws a fresh board | PASS | End Game, Results ("Team A wins!", 500), New Game (saved game removed, empty Setup), the same 5 categories: 19 of 30 cells differ. |
| A1 | Admin: points dropdown with all values; Points column sorted by category, points, id; per-value counts; categories show count and "Not playable: missing V"; no Coverage panel | PASS | DOM: select `question-points` has "Choose points, 100..600". Question table headers Category / Points / Question / Answer / Actions, first rows Geography 100 in id order. Point list "100 32 questions" ... "600 7 questions". Categories "Geography 26 questions Playable" and "Team B Other 1 question Not playable: missing 100, 200, 400, 500, 600". Summary "7 of 8 categories are playable (at least one question for every point value). A game can use up to 6." Headings: Game settings, Point values, Categories, Questions. No element with an id containing "coverage". |
| S1 | Fresh install: both schema files give 150 questions, 5 per (category, value); second import no error, no duplicates; files in sync | PASS | Scratch DBs, dropped afterwards. `schema.sql` (CREATE DATABASE/USE rewritten to the scratch name, so `brainrush` was never touched) imported twice: exit 0 both times, 150 rows, 150 distinct (category, question), 150 distinct answers, exactly 30 (category, value) cells with 5 each, settings 5 / 30, values 100-500. `schema-hosted.sql` twice into a pre-created DB: 150. Content hash (category, points, question, answer) identical across the two. `diff` from `CREATE TABLE IF NOT EXISTS settings` onward: identical. `SHOW CREATE TABLE`: `points NOT NULL`, `uq_category_question`, `idx_questions_slot (category_id, points)`, `idx_questions_points`, `fk_questions_category` CASCADE, `fk_questions_points` ON UPDATE CASCADE; no `uq_slot`. |
| S2 | Migration of the pre-Sprint 6 slot DB: slot key gone, case-insensitive key present, `points` and FK kept, existing questions kept, bank rows added with points, skips without error | PASS | Backup restored into a scratch DB (CREATE DATABASE/USE lines removed first). 36 questions to 155; per-cell counts identical to the local DB and content hash identical to local `brainrush`. The 36 original rows (ids 1-36) keep category, points, text and answer (hash equal to the restored backup). Keys afterwards: `uq_category_question`, `idx_questions_slot`, `idx_questions_points`, both FKs; `uq_slot` gone. Skip test (scratch restore, all 500 questions and value 500 deleted, Geography renamed): exit 0, 110 rows = 30 old + 80 bank (no 500s, no Geography). |
| S3 | Migration re-run: no error, count unchanged | PASS | Run 2: exit 0, still 155; only Notes 1061 / 1091 / 1051 and duplicate-skip Warnings 1062. |
| S3b | Migration safety | PASS | (a) Same text twice in a category (allowed by the old slot model): step 1 fails with `ERROR 1062 ... uq_category_question`, exit 1, nothing changed (36 rows, `uq_slot` still there). (b) The Sprint 6 v1 dump (no `points`) stops at step 1 with `ERROR 1072 Key column 'points' doesn't exist`, exit 1, nothing changed (155 rows, no `points`), as the header warns. |
| S4 | `docs/question-bank.md`: 120 questions, 20 per category, 4 per value 100-500 in each category, no duplicates against seed, Egypt set or each other | PASS | Parsed: 120 rows; every category has 4 questions at each of 100, 200, 300, 400, 500; the `#` ids are unique per category. 0 duplicate questions and 0 duplicate answers (case-insensitive) against the 30 seed rows, the 6 Egypt rows and within the bank. All ASCII, longest question 123 characters. The 30 seed rows have one question per value 100-500 per category. The 120 rows in `schema.sql` and in the migration equal the markdown (question, answer, points) verbatim and in order, and the fresh-install DB equals the schema tuples. Science #5 is the reworded "ultraviolet rays" text at 400; the giveaway scan (answer words inside other questions) finds nothing. |

### Amended stories

| # | Criterion | Result | Evidence |
|---|---|---|---|
| US-19 | Point list with per-value counts; add shows "0 questions" and "Categories need at least one V question to stay playable"; duplicate 409, zero / negative / non-integer 400; unused delete 200; used delete blocked with inline 409 | PASS | See D5. UI: add 700 gives "Point value 700 added. Categories need at least one 700 question to stay playable." and "700 0 questions"; every category flips to "Not playable: missing 700". Delete 600 (confirm asked): red inline "Cannot delete 600: 7 question(s) still use it. Delete or move those questions first.", value still listed. Delete 700: "Point value 700 deleted.", list back to 100-600. |
| US-20 | Each category shows its question count and "Playable" or "Not playable: missing V1, V2" (all missing, ascending) | PASS | See A1. The missing list follows the data live in the UI: after adding a 200 question to the 1-question category "missing 100, 400, 500, 600"; after moving it to 400 "missing 100, 200, 500, 600". Singular "1 question" is handled. |
| US-21 | Add / edit / delete a question with points; table columns and sort; texts name the points | PASS | UI with real clicks: submit without points shows "Choose a point value."; added at 200: "Question added (Team B Other - 200).", row "Team B Other 200 ...", counts update (value 200: 31 to 32). Edit (title "Edit question (Team B Other - 200)", points and fields prefilled, "Save changes"): changed points to 400 and the answer: "Question updated (Team B Other - 400).", row moved to 400. Delete (confirm "Delete this 400 question from "Team B Other"? ..."): "Question deleted (Team B Other - 400)." |
| US-22 | Stays retired: no Coverage panel | PASS | See A1; no coverage markup or JS, and the coverage CSS rules stay removed. |
| US-24 | Schema: `points` column with FK to `point_values` ON UPDATE CASCADE / ON DELETE RESTRICT; case-insensitive unique key on (category_id, question); no `uq_slot`; seed 6 x 25 (5 per value) | PASS | See S1 and `SHOW CREATE TABLE` on the local DB (no `uq_slot`; FK to `point_values (points)` ON UPDATE CASCADE). Case-insensitivity shown by D4. Cascade delete of the temporary categories worked (200). |
| US-25 | Endpoints and validation; playable rule; board shape; points required on questions; `points.php` returns `question_count` and 409 for used values | PASS | See D1-D5 and B1-B6. Other validation unchanged: missing answer 400, blank question 400, unknown category 400, invalid JSON 400, unknown id 404, DELETE without id 400, PATCH 405. |
| Auth | Admin auth unchanged for writes | PASS | `api/db.php` and `api/auth.php` are unchanged in the diff. On a temporary copy of `api/` with a throwaway admin login set: POST questions, POST and DELETE points, and POST categories without credentials all gave 401 "Login required to change content."; wrong password 401; correct login 201 / 409 / 200; used-value delete with login 409; GET (board) open without login; `auth.php` 401 without and 200 with credentials. The temporary copy was deleted. |

### D-32 regression (host picks 1..N categories)

| # | Check | Result | Evidence |
|---|---|---|---|
| E1 | Setup text and counter | PASS | Setting N = 6 locally. Legend "Select up to 6 categories"; counter "0 of up to 6 selected. Columns follow the order you tick them.", then "1 of up to 6", "5 of up to 6", "6 of up to 6". Only playable categories are listed (7: the six seed ones plus a complete temporary one; the 1-question category was hidden). |
| E2 | Tick 1..N; the other boxes lock at N | PASS | Real clicks. 1 ticked: 0 disabled. 5 ticked: 0 disabled. 6 ticked: the one remaining box (Technology) disabled and styled `is-locked`, the six ticked boxes show tick-order badges 1-6. Unticking one: 5 ticked, 0 disabled again. |
| E3 | Start with 0 is blocked; Start with fewer than N works | PASS | 0 ticked, Start: "Select at least 1 category." (plus the form error line), stays on Setup. 5 of 6 ticked: board "1 player, 5 x 6 board, Played 0 of 30", columns in tick order (Geography, History, Movies, Science, Sports), all 30 cells valid. |
| E4 | Admin label | PASS | Settings label "Max categories per game"; categories summary ends "A game can use up to 6." |

### Regression (game flow, layout, console)

| # | Item | Result | Evidence |
|---|---|---|---|
| R1 | Question and score cycle | PASS | Click Science 500: "SCIENCE - 500", "How many bones are in the adult human body?", timer 30 counting down; Show Answer "206"; Correct (+500): score 500, Wrong disabled; Back to Board: cell owned in the player's colour, "Played 1 of 30". |
| R2 | Results and New Game | PASS | End Game (confirm): "Team A wins!", 1. Team A Winner 500; New Game: empty Setup, saved game removed. |
| R3 | Refresh persistence (D-12) | PASS | See P1. |
| R4 | Layout at 1366x768 and 1920x1080 | PASS | Real 5x6 board in same-size iframes: 1366x768 docH 768, no horizontal scroll (scrollWidth 1366); 1920x1080 docH 1080, no horizontal scroll. In the 1024x768 pane there is no horizontal scroll on the admin page or the board. |
| R5 | Console | PASS | Only the browser-logged 409 from the deliberate used-value delete. No uncaught error and no `unhandledrejection` on `admin.html` and `index.html`. |
| R6 | Database restored | PASS | See Cleanup. |

### Content check of the new point assignments

The 120 question and answer texts are unchanged from the first run, whose facts were all verified then. A script confirms that the markdown, both SQL files and the fresh-install DB hold the same rows. Point values 100-500 were ranked by relative difficulty within each category. Reading all 120 rows, the order is sensible in general (for example Science: gravity, Saturn and herbivores at 100; atomic number 1 and heart chambers at 400; seismology at 500). No factual error found. See OBS-R2 for a few debatable ranks.

### Observations (not bugs)

- **OBS-R1 (local data, the 600 row is not random):** in the local DB each category has one 600 question (the Egypt set), so those 6 cells never change between games. Science 500 has 4 questions instead of 5 (the owner's "How many bones ..." row is id 10 at 500). All categories are playable. This is expected and described in FU-13 and the dev note; a second 600 question per category would randomise that row.
- **OBS-R2 (difficulty ranks, subjective):** a few bank questions look easier or harder than their value: Geography 500 "capital of Brazil" (Brasilia, a common trap but widely known) against 400 "capital of Australia"; Technology 500 "decimal 5 in binary" (easy) against 300 "bits in a byte". Not errors. The PO may re-rank if wanted.
- **OBS-R3 (FU-13 wording, already noted by the developer):** FU-13 says the owner's "How many bones" row keeps value 200; the data shows 500. The migration result (Science 500 = 4) is right as built; only the backlog sentence is off.
- **OBS-R4 (pre-existing, FU-12):** the "Cancel edit" button is still visible in Add mode (seen again in the admin screenshot).
- **OBS-R5 (cosmetic, DB):** the test traffic advanced AUTO_INCREMENT counters again (questions next id 188, categories 12, point values 9). No functional effect.
- The earlier near-duplicate pairs (FU-10) are unchanged and still present locally (Mercury, Japan).

### Not covered

- Not re-run: 0 point values, 0 playable categories (D-11 message) and N larger than the number of playable categories. The setup code for those paths was not changed in this rework.
- `node --check` (no Node). Hosted behaviour (phpMyAdmin, `CREATE TEMPORARY TABLES`, CDN cache): FU-11.
- 1366x768 and 1920x1080 are iframe measurements; the owner's real-window Chrome check is still pending.

### Cleanup

- Scratch databases `s6r_mig`, `s6r_orig`, `s6r_dup`, `s6r_v1`, `s6r_fresh`, `s6r_fresh_h`: created and dropped. `SHOW DATABASES` afterwards: `brainrush`, `information_schema`, `mysql`, `performance_schema`, `phpmyadmin`, `test`.
- `brainrush`: temporary categories "Team A Short" and "Team B Other" (with their questions) and temporary point value 700 deleted. The final state equals the state at the start: 155 questions, point values 100-600, settings `categories_per_game` 6 and `timer_seconds` 30, per (category, value) counts unchanged (5 for 100-400; 500: 5 except Science 4; 600: 1), and the `MD5` over all question rows (id, category, points, question, answer) and over all categories is identical before and after. Only AUTO_INCREMENT counters moved (OBS-R5). The database was never dropped or re-imported.
- Backups in `C:/Users/NB28970/Desktop/claude/` (`brainrush-backup-pre-sprint6.sql`, `brainrush-backup-sprint6-v1.sql`): only read (sed-filtered copies were piped into scratch DBs); SHA-256 identical before and after.
- Servers: my `:8767` and `:8768` PHP servers stopped; the owner's `localhost:8000` server left running (200). The temporary copy of `api/` with the throwaway admin login, scripts and temp files were deleted. Browser storage cleared.
- MariaDB was already running; left running.
- No project file changed except this report.

### Bugs

None found (0 Critical, 0 Major, 0 Minor).

### Verdict (after rework)

**READY FOR PO.**
- US-30 (rewritten): PASS on all criteria (data and rules, per-cell draw, persistence, admin, fresh install, migration, content).
- US-19, US-20, US-21, US-24, US-25: PASS; US-22 stays retired.
- D-32 regression: PASS (1..N selectable, boxes lock at N and unlock, Start works with fewer than N and blocks at 0).
- Regression: game cycle, Results, refresh persistence, layout at 1366x768 and 1920x1080, admin write auth and the console are clean.
- For the PO: OBS-R1 (static 600 row locally), OBS-R2 (optional re-rank), OBS-R3 (FU-13 wording). The owner's local Chrome check is still required before commit or push.

## PO re-acceptance (2026-10-11)

Product Owner. Based on the "Rework 2026-10-11" section of the dev note, the "Re-test after rework" section above and the D-31 amendment in `docs/product-backlog.md`. This replaces the superseded "PO acceptance" section.

| Story | Decision | Reason |
|---|---|---|
| US-30 Question bank (rewritten) | **ACCEPTED** | All 17 criteria pass (D1–D5, B1–B6, P1–P2, A1, S1–S4 incl. S3b). The evidence covers: required, existing points; several questions per cell; the per-cell playable rule; case-insensitive 409 at any points; 409 for deleting a used point value; a random draw per cell that is always valid (10 boards, 0 wrong cells); single-question pools that are fixed; a 400 that lists every missing value; D-12 on refresh; a fresh draw on New Game; the admin view; and a fresh install with 5 per cell. The migration keeps `points` and the existing questions, skips rows cleanly, can be re-run, and refuses a v1 DB without changes. The bank has 4 per value per category. |
| US-19 (re-amended) | **ACCEPTED** | Shows per-value counts, the "Categories need at least one V question" message and the inline 409 for a used value. Deleting an unused value returns 200. |
| US-20 (re-amended) | **ACCEPTED** | Shows the count and "Playable" or "Not playable: missing V1, V2". The list follows live edits. |
| US-21 (re-amended) | **ACCEPTED** | The points dropdown lists all values and is required ("Choose a point value."). The Points column is sorted by category, points, id. A question can move between values. Messages name the points. |
| US-22 | **Stays RETIRED** | No coverage markup, JS or CSS remains. |
| US-24 (re-amended) | **ACCEPTED** | `points` NOT NULL with its FK (ON UPDATE CASCADE, delete restricted), `uq_category_question`, no `uq_slot`. The seed has 6 x 25, 5 per value, and the two schema files are in sync. |
| US-25 (re-amended) | **ACCEPTED** | Covers the playable rule, the board shape and its 400s, required points, `question_count` and the 409 in `points.php`. Other validation and auth are unchanged. |

D-32 regression (1..N categories) passes and is noted only; it is not part of this acceptance.

Observations:
- **OBS-R1:** logged as FU-14 (Could). The 600 row is fixed locally until more 600 questions are added.
- **OBS-R2:** logged as FU-15 (Could). PO decision: keep the ranks for now and review after the owner has played.
- **OBS-R3:** FU-13 sentence corrected (the owner's "How many bones" row is at 500). FU-13 is marked Done.
- **OBS-R4:** stays FU-12.
- **OBS-R5:** AUTO_INCREMENT gaps, no action.
- **FU-10:** still open. It now says which question of each local pair can safely go.

**Sprint 6 (rework): ACCEPTED.** Still open: the owner's local Chrome check before any commit or push, and the hosted migration (FU-11).

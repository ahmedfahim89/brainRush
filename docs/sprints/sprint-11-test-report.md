# Sprint 11: Question difficulty stats (US-47, D-55): test report

Tester: Senior Tester agent, 2026-11-03. Branch `sprint-11` (uncommitted working tree). No application code was changed; the only file written is this report.

## Summary

- **Environment:** Windows 11, PHP 8.0.30 (XAMPP), MariaDB (local `brainrush` DB, `question_stats` already migrated and empty), my own `C:/xampp/php/php.exe -S localhost:8012` from the repo root (stopped at the end), in-app browser (viewport about 746x630, device pixel ratio 1.25). The pane cannot be resized, so the game and Admin were loaded in same-origin iframes sized 1366x768, 1280x768, 1024x768 and 375x812 (no border for the width measurements) and measured with `scrollWidth`, `clientWidth` and `getBoundingClientRect`. In the game iframe `fetch` was wrapped to record every request: `POST game-log.php`, `streaks.php` and `reports.php` were answered by the wrapper (nothing written), `question-stats.php` and the rest went to the real server, so the counters were checked in the database. `window.confirm` was answered yes. The service worker of `localhost:8012` was unregistered. Local requests are admin-open on this PC, so Admin and its API worked without a login. Scratch scripts and the snapshot are in the system temp folder (`br-s11-test`), not in the repo. `api/config.php` and `InternalUse/` were not read.
- **Counts (first run):** 67 checks, 62 PASS, 1 FAIL, 4 PENDING. **After the re-test of fix loop 1 (see the last section): 72 checks, 68 PASS, 0 FAIL, 4 PENDING.**
- **Bugs:** 0 Critical, 0 Major, 1 Minor, **now fixed and re-tested** (BUG-11-01, Admin Questions table 5 px wider than its panel at 1024 px with a classic scrollbar; the page itself does not scroll).
- **Verdict: READY FOR PO**, with BUG-11-01 for the PO to accept or send back. Every acceptance criterion of US-47 and every decision in D-55 that can be run locally passes, and every Sprint 11 DoD item that can be run locally passes. The PENDING items need a commit, the hosted database or a device.

Things the developer did not report that I checked: the real Streak "time ran out while the page was closed" path (counted in the database), the Kilo Meshakkal box against the database (id 70 is a Science 400 question, the count landed on a 400-point question), an id already in `statsSent` (not re-sent, no duplicate in the list), a send blocked at network level and answered 500 (play unaffected), the 4 combinations of enabled point values in the real database (all 6 values, 100/300/500, only 100, none), the table renamed away while a game is played (two board outcomes got 503, play went on and scored), the Admin sort on the filtered list and with the keyboard, and the 1024 px table width with a real 15 px scrollbar.

State found at the start, and restored exactly (checked by diff at the end): `settings` (9 keys, `final_round_enabled` 1, `categories_per_game` 6, `timer_seconds` 30), `point_values` (100 to 500 enabled, 600 disabled), `streaks` (12 rows), `question_reports` (2 rows), `daily_challenge` (today's set present), `question_stats` (0 rows), `questions` (869 rows, max id 1715), `categories` (14 rows, max id 47), all AUTO_INCREMENT values (`questions` 1719, `categories` 50, `point_values` 13, `streaks` 12, `question_reports` 2), and the 7 `logs/*.log` files (byte-identical, no new file).

## Static checks

| ID | Check | Result | Evidence |
|---|---|---|---|
| S1 | `php -l` on every `api/*.php` | PASS | "No syntax errors detected" for all files, including `question-stats.php`, `questions.php`, `db.php`, `reports.php` |
| S2 | `node --check` on `js/game.f21a8035.js` and `js/admin.1df33c63.js` | PASS | exit 0 for both |
| S3 | No `innerHTML`, `insertAdjacentHTML`, `outerHTML` or `document.write` in the JS | PASS | grep finds only the comments saying "never innerHTML". The Admin cells, the tooltip and the hint are built with `h()` / `textContent` |
| S4 | SQL by string concatenation | PASS | `question-stats.php` uses one fixed prepared INSERT ... ON DUPLICATE KEY UPDATE; the outcome only picks which bound value is 1. `questions.php` builds the list SQL from constants plus the fixed `WHERE q.category_id = :id`, with the id bound; `sort` is compared with an allow-list |
| S5 | Credentials outside `api/config.php`; `api/config.php` git-ignored | PASS | `git check-ignore -v api/config.php` prints `.gitignore:1`; no password, key, token or secret in the diff or the new files. `.gitignore` gains `node_modules/` only |
| S6 | Hard-coded point values / board sizes / band numbers | PASS | the added JS has no literal 100 to 600 outside comments; the only literal 100 is the upper end of the percent scale. The band uses the named constants `BAND_TOP` 80, `BAND_SPREAD` 40, `BAND_HALF_WIDTH` 20 and `MIN_ATTEMPTS` 20. PHP has no band at all |
| S7 | CRLF and asset names | PASS | 0 LF-only lines in every changed or new file (11 files checked). `index.html` and `admin.html` point at the current `js/game.f21a8035.js`, `js/admin.1df33c63.js` and `css/style.f2b43475.css` |
| S8 | Docs match the behaviour | PASS | README (Admin Questions, "Four public writes"), `docs/deploy-hostinger.md` (eight tables, `question-stats.php` in the upload list, migration before the code in step 8.4), `docs/spec.md` (file list, table, API) agree with what I measured |
| S9 | Migration rule: table in both schema files, bodies identical, no hosted-only gap | PASS | `diff` of the text after `question_stats` in `sql/schema.sql` and `sql/schema-hosted.sql` is empty; the CREATE has no `CREATE DATABASE` / `USE` line, so it runs on whichever database is selected |
| S10 | After the real commit, `index.html` and `admin.html` point at the re-hashed JS and CSS (FU-16) | PENDING (after commit) | the three assets were edited in place under their old hashed names, so the names no longer match the content until the pre-commit hook runs |

Informational (not the sprint's files): `git status` also lists `package.json`, `package-lock.json` (Playwright tooling, `node_modules/` is now ignored), `.claude/launch.json` and `googlebbe9a71d60b82d1a.html`. None is in the dev note. The owner should decide before `git add` that the two `package*.json` files are meant to be committed.

## API checks (curl, own server on 8012)

| ID | Check | Result | Evidence |
|---|---|---|---|
| A1 | Each outcome adds 1 to its own counter | PASS | `POST question-stats.php` with `correct`, `wrong`, `nobody`, `timeout` for question 1 gave 201 each and the row went from none to 1/1/1/1 |
| A2 | The id as the string "1", and an extra key | PASS | both 201 (count 3 for correct after two more correct sends) |
| A3 | Validation (400) | PASS | id 0, -3, 1.5, "abc", `true`, `null`, `[1]`, missing, 4294967296: "question_id must be a positive whole number"; unknown id 999999: "This question does not exist (any more)."; outcome "Correct", "skip", an array, missing, `"correct; DROP TABLE questions"`: "outcome must be one of: correct, wrong, nobody, timeout"; `[]` and non-JSON: "Request body must be a JSON object". No row was written by any of them |
| A4 | Wrong method / content type | PASS | form-encoded 415; GET, PUT, DELETE 405 with `Allow: POST` |
| A5 | Upsert under quick parallel requests | PASS | 40 parallel curl POSTs on a question with no row: all 201, counter exactly 40. `php -S` is single threaded, so the real race was done with 20 parallel MySQL clients x 10 upserts of the same statement on a new id: exactly 200, no error |
| A6 | Admin list returns the stats | PASS | `GET questions.php`: 869 rows with `attempts`, `percent_correct`, `stats {correct, wrong, nobody, timeout}`. No row: `attempts` 0, `percent_correct` null, zeros. Question 1: 6 attempts, 50. Question 2: 40 attempts, 0. Question 3: 200 attempts, 100. `?category_id=1`: 96 rows in the old order |
| A7 | Sort by percent correct | PASS | `?category_id=1&sort=percent_correct`: 0, 50, 100, then the no-attempt rows last; `sort=bogus` 400 "sort must be 'percent_correct' or left out"; unknown category 404 |
| A8 | Stats removed with the question | PASS | a temporary question was created through the API, given a "nobody" count, deleted through the API (200): its stats row was gone and a new POST for that id gave 400 "does not exist" |
| A9 | Table missing (renamed away, then renamed back) | PASS | POST 503 "Question stats are not available right now."; `GET questions.php?category_id=1` 200 with 96 rows and `attempts`, `percent_correct`, `stats` all null; `reports.php?all=1`, `categories.php` and the board GET stayed 200 |
| A10 | Board payload and admin protection unchanged | PASS | `POST questions.php?board=1` returns the same shape with no stats fields; with a non-local Host header the list answers 403 "Admin changes are disabled" as before |
| A11 | Migration twice, and a clean hosted import | PASS | `sql/migrate-add-question-stats.sql` run twice on the local DB: exit 0 both times. A scratch DB took `sql/schema-hosted.sql` twice (exit 0), the migration on top (exit 0), 8 tables; `SHOW CREATE TABLE question_stats` is identical to the local one; dropping the table and running only the migration gives 8 tables again. The scratch DB was dropped |

## UI checks: board game (D-55 e)

| ID | Check | Result | Evidence |
|---|---|---|---|
| B1 | A new game saves `statsSent: []`; nothing is sent while a question is open or while someone is marked | PASS | saved game has `statsSent: []`; request log empty after opening a cell and marking Correct; the send happened on Back to Board |
| B2 | Someone Correct gives `correct` with the cell's id | PASS | question 40: `{"question_id":40,"outcome":"correct"}`, 201; DB row 40 = 1/0/0/0; the body holds only these two keys |
| B3 | Two Wrong gives `wrong` | PASS | question 77: `wrong`, DB 0/1/0/0 |
| B4 | Wrong then another Correct gives `correct` | PASS | question 42: `correct` |
| B5 | No mark gives `nobody` | PASS | question 650: `nobody` |
| B6 | Timer at 0 gives `timeout` | PASS | timer 5 s: after 6.5 s the status read "Time's up!", `current.timedOut` true in the saved game, nothing sent yet; Back to Board sent `timeout` for question 1449 |
| B7 | Time up, then a Wrong mark gives `wrong` | PASS | question 87: `wrong` (marks win over the timer) |
| B8 | Time up, then Reset, then a refresh still gives `timeout` | PASS | after Reset the timer showed 5 and `timedOut` stayed true; after the reload the question screen was restored with `timedOut` true; Back to Board sent `timeout` for 1454 |
| B9 | Skip with no mark gives `nobody` | PASS | Team A used Skip on question 656: `nobody`, the cell closed grey, the Skip helper was spent |
| B10 | Swap: the swapped-away question is not sent; the Swap question is | PASS | question 49 was timed out, then Swap: `timedOut` was cleared, no request for 49; Back to Board sent only `1445: nobody` (the Swap question, with its own timer) |
| B11 | Later +/- corrections send nothing | PASS | after the close, one subtract and one add click on the scoreboard: still one request in the log; `statsSent` unchanged |
| B12 | Kilo Meshakkal counts at the question's own value | PASS | box value 400 (heading "Kilo Meshakkal: Science – 400") sent id 70; the database says question 70 is Science, 400 points, and its row got `correct` 1 |
| B13 | At most one send per question per game | PASS | with a cell's question id added to `statsSent` in the save and a reload, closing that cell sent nothing and the id appears once in the list |
| B14 | A failed send (network error) never disturbs play | PASS | the request threw `TypeError`; the game returned to the board, the cell was closed (grey), the id is in `statsSent`, no uncaught error |
| B15 | A failed send (HTTP 500) never disturbs play | PASS | same result with a 500 answer |
| B16 | Table missing (503) never disturbs play | PASS | two cells closed with 503 answers: both cells used, scores 100 and 100, no error |
| B17 | A save from before US-47 (no `statsSent`) loads, plays and sends nothing | PASS | the save without the field restored to the board; one cell closed with Correct: no request; the list was not created |
| B18 | Broken `statsSent` / `timedOut` is discarded to Setup | PASS | `"x"`, `[0]`, `[3,3]`, `[1.5]`, `{}` and `timedOut: "yes"`: each ended on Setup, the save was removed, no JS error |
| B19 | Golden Goal sends nothing (D-55 i) | PASS | 0-0 tie, End Game, "Go for goal", bets of 100, question, Team A Correct, Team B Wrong, "See results": Results shown, no stats request |
| B20 | The Android Back path sends too | PASS (code review) | `confirmBackToBoard()` (js line 1048) and `onBackClick()` (line 4295) both call `backToBoard()`, the only function that sends for a board question; Skip uses it too (line 2452). Not run on a device |

## UI checks: Streak and Daily (D-55 f, i)

| ID | Check | Result | Evidence |
|---|---|---|---|
| ST1 | A new run saves `statsSent: []`; a right choice sends `correct` | PASS | question 380: `correct`, DB 1/0/0/0 |
| ST2 | A refresh after answering, and one on the next open question, send nothing more | PASS | the request log held one entry for 380 after both reloads; `statsSent` `[380]` |
| ST3 | A wrong choice sends `wrong`; `statsSent` holds both ids | PASS | question 91: `wrong`, run over, `statsSent` `[380, 91]` |
| ST4 | Time's up while the page is open sends `timeout` | PASS | deadline moved to 3 s ahead: after 4.5 s "Time's up!", run over, question 311 `timeout` |
| ST5 | Time ran out while the page was closed sends `timeout` | PASS | deadline set 5 s in the past and a reload: the run was over; the database row for question 618 shows timeout 1 (the request left before my request log was attached) |
| ST6 | A question left open by End run is not sent | PASS | one right answer (1406 `correct`), Next, End run on the open question 50: the leaderboard screen came up, no request for 50, DB has no row for 50 |
| D1 | Daily Challenge sends nothing | PASS | played today's three questions to the result (score 1/3): the only request was `questions.php?played=1` |

## UI checks: Admin Questions

| ID | Check | Result | Evidence |
|---|---|---|---|
| AD1 | Columns "Attempts" and "% correct" (sortable headers) and the hint line | PASS | headers: Category, Points, Question, Answer, Arabic, Picture?, Choices, Attempts, % correct, Actions; hint "Check value: 20+ attempts and % correct outside 100: 60–100% · 200: 50–90% · 300: 40–80% · 400: 30–70% · 500: 20–60%. Attempts and % correct come from board and Streak games." (600 is disabled, not listed) |
| AD2 | Attempts tooltip | PASS | "3 correct · 1 wrong · 1 nobody · 1 time's up" on a 6-attempt row |
| AD3 | A question with no stats row shows cleanly | PASS | attempts 0 and % "-" for the 700+ rows without data |
| AD4 | "Check value" only from 20 attempts, only outside the band, ends included | PASS | 100-point: 19 attempts at 0% no mark; 20 at 0% mark ("Expected 60–100% for 100"); 30 at 100% no mark. 200-point: 50% and 90% (20 attempts) no mark; 49% of 100 and 95% of 20 mark; 99 of 200 shows 50% and no mark. 300: 100% of 20 and of 200 mark. 400: 23% of 100 mark. 500: 20% of 20 no mark; 19% of 100 mark. 6 attempts at 50% no mark |
| AD5 | Disabled point value gets no mark, still shows its numbers | PASS | a 600-point question with 30 attempts and 0% shows "30" and "0%", no mark |
| AD6 | Sorting by each header, three clicks | PASS | % correct: 1st click lowest first (0, 0, ...) with no-attempt rows last; 2nd highest first (100 ...) with no-attempt rows last; 3rd back to the list order. Attempts: 1st most first (200, 200, 100, ...), 2nd fewest first (1, 1, ...), 3rd list order; no-attempt rows always last. `aria-sort` is ascending, descending or none, matching the arrow |
| AD7 | Sort works on the filtered list and by keyboard | PASS | 200-point filter ("Showing 157 of 869") sorted by % correct: 0, 0, 49, 50, 50, 90, 95, 100 and only 200-point rows; the header buttons are real buttons that take focus |
| AD8 | Bands follow the enabled values (D-55 a, c) | PASS | in the real database: 100-600 enabled: 60–100, 52–92, 44–84, 36–76, 28–68, 20–60, the 600 question (0%, 30 attempts) marked "Expected 20–60% for 600"; 100/300/500: 60–100, 40–80, 20–60 and 200/400/600 questions unmarked; only 100: 40–80 (100% at 100 is marked); none enabled: "no point value is enabled, so no question is marked" and no mark anywhere. Values restored afterwards |
| AD9 | Admin with the table missing | PASS | note "Attempts and % correct are not set up on this database yet: run sql/migrate-add-question-stats.sql."; all 869 rows load with "-" in both columns; Categories (14 rows) and Point values (6) panels load |
| AD10 | Other Admin panels | PASS | Settings (values read correctly, `final_round_enabled` on), Point values, Categories, Questions, Reports, Streak leaderboard and Game logs panels all rendered, no script error, no page scroll |
| AD11 | Admin layout at 1366 px (D-19) | PASS | iframe 1366 (no border): page 1351/1351, Questions table 1257/1257, nothing clipped |
| AD12 | Admin layout at 1024 px, page level (D-19) | PASS | page `scrollWidth` 1009 = `clientWidth` 1009 (with a 15 px classic scrollbar); no horizontal page scroll; 1280 px also fits (table 1171/1171) |
| AD13 | Admin Questions table fits at 1024 px with no inner scrollbar (dev note claim) | FAIL on the first run, PASS after fix loop 1 (RT1) | see BUG-11-01: with a classic 15 px scrollbar the table is 920 px in a 915 px panel, so the panel gets a 5 px inner horizontal scroll and the Actions column is cut by 5 px until scrolled |

## Regression and console

| ID | Check | Result | Evidence |
|---|---|---|---|
| R1 | Board game: Swap, Skip, 3 choices, double cell, Report, Golden Goal tie, Kilo Meshakkal | PASS | Swap and Skip (B9, B10), 3 choices (3 choices shown, only Team A can mark), the double popup (shown, timer waited at 30), the Report dialog (a send with a reason posted `{question_id, reason, note}` to the wrapper), Golden Goal (B19) and Kilo (B12) all behave as before; scores correct (Correct on a 200-point cell gave 200) |
| R2 | Console and script errors | PASS | no `error` or `unhandledrejection` event in any of my game or Admin runs. The browser console also lists errors that came from my own harness (an "Add player" click while a restored game was showing, my service-worker unregistering, and the two 503 answers I caused on purpose); none came from a user action |
| R3 | Game layout at 1366x768 and 375x812 | PASS | 1366x768: board, question and answer screens exactly 768 high, no horizontal scroll. 375x812: board 812 high, question 360 wide and no horizontal scroll (the question screen scrolls vertically as before: 1033 px, 1061 with the answer) |

## Pending items (owner or later)

| ID | Item | Result | Notes |
|---|---|---|---|
| S10 | `index.html` and `admin.html` point at the re-hashed JS and CSS after the commit (FU-16), then purge the CDN | PENDING (after commit) | |
| P1 | Hosted database: run `sql/migrate-add-question-stats.sql` in phpMyAdmin BEFORE the code, then the smoke check of `docs/deploy-hostinger.md` step 8.4 (play one question, see 1 attempt in Admin) | PENDING (owner) | I only tested the local DB and a scratch DB with the hosted schema file |
| P2 | Real touch device and the Android app (`?source=twa`): close a board question, answer a Streak question, Android Back on a board question | PENDING (environment) | no device available; the Android Back path was checked by reading the code (B20) |
| P3 | Owner's own Chrome at 1024 px: look at the Questions table (BUG-11-01) | PENDING (owner) | I measured it with a real 15 px scrollbar; browser zoom and Windows scaling can change it |

Owner notes, not checks: the dev note suggests an optional one-sentence addition to `privacy.html` ("We also count, per question, ... with nothing about who played"); the backlog says no change is needed, so I did not treat it as a defect. Anyone can post fake counts (D-37 g); there is no rate limit and no Admin reset, as the dev note says.

## Definition of Done (Sprint 11)

| DoD item | Result | Evidence |
|---|---|---|
| Migration runs on every DB before the code; `question_stats` is in both schema files | PASS (hosted run PENDING, P1) | A11, S9; deploy guide step 8.4 puts the migration before the code |
| The band is written down by the PO and has no hard-coded point values | PASS | D-55 in the backlog; S6; AD8 with four different enabled sets |
| Public-write limitation noted in the dev note; Privacy needs no change | PASS | dev note "Public-write limitation (D-37 g)" and "Privacy"; the stats row holds only an id and four counters |
| Global DoD: migration rule, no secrets, git-ignored config, no `innerHTML`, no hard-coded sizes | PASS | S3 to S9 |

## Bugs and findings

**BUG-11-01 (Minor)** The Admin Questions table is a little too wide at 1024 px, so the panel scrolls horizontally by 5 px.
- Steps: open `/admin.html` in a 1024 px wide window with a classic scrollbar (the default on Windows Chrome, 15 px), set Category and Points to "All"; measure `#questions-panel .table-wrap` (`scrollWidth` vs `clientWidth`).
- Expected: every column, Actions included, fits with no scrollbar in the panel (dev note: "At 1024 and 1366 every column now fits with no scrollbar"; D-19 only requires that the page does not scroll, which holds).
- Actual: the table is 920 px, the panel 915 px, so the Actions column ends at x 967 against the panel edge at 962 and a 5 px inner scrollbar appears. At 1280 and 1366 it fits exactly. The developer measured 930/930 in headless Chrome, which has overlay scrollbars (no 15 px lost).
- Where: `css/style.f2b43475.css`, the `#questions-panel .data-table th, td` padding rule and `.data-table td.stats-cell` (the new columns are what widened the table). A fix could trim another 6 to 10 px, for example narrower padding on the two stats columns or `white-space: normal` on one of the text columns.
- Impact: cosmetic; D-19 says narrower tables "may scroll horizontally inside their panel", so the PO may accept it.

**Informational (no action required)**
1. Skip keeps its existing penalty rule (half of the box value); I only checked that the outcome sent was `nobody` (D-55 e, "a Skip with no mark").
2. The timer note: "timer reached 0" is only noted while the page is open (the board timer is memory only and restarts after a refresh, D-04), so a question whose time ran out while the page was closed counts as `nobody` unless someone is marked. That follows D-55 e as written.
3. A question opened but never closed (New Game from elsewhere, tab closed) is not counted. Listed in the dev note.
4. Mixing real play with seeded counters: Admin percent comes from the same pooled counters (D-55 g); the data I seeded for the checks (35 rows) was removed.

## Cleanup done

- `question_stats`: all 36 rows of mine deleted (the table was empty at the start); the table and its definition are intact (renamed away twice for the missing-table tests and renamed back, `SHOW CREATE TABLE` unchanged).
- `questions`: the temporary question (id 1719) was created and deleted through the API; `AUTO_INCREMENT` set back to 1719. `questions` 869 rows, max id 1715.
- `point_values`: all values were switched in SQL for AD8 and set back to 100 to 500 enabled, 600 disabled.
- `settings`, `streaks`, `question_reports`, `daily_challenge`: never written (the stubbed POSTs wrote nothing). A `mysqldump` of these five tables plus `question_stats` taken after the cleanup is identical to the one taken before any test (`diff` empty); `categories` and `questions` counts and max ids, all AUTO_INCREMENT values and the settings and point lists are identical; the 7 log files are byte-identical (md5), no new log file.
- `git status` lists the same entries as at the start (plus this report); `md5sum` of `docs/*.md`, `api/*.php`, `js/*.js`, `css/*.css`, `admin.html` and `index.html` is unchanged.
- The scratch database `brainrush_s11t_scratch` was dropped. The test iframes, `localStorage`, `sessionStorage` and service worker registrations of `localhost:8012` were cleared. My server on port 8012 was stopped (PID 13712). The owner's port 8000 was never touched.

## Verdict

**READY FOR PO.** US-47 and decision D-55 pass everywhere they can be run locally: each board outcome (correct, wrong, nobody, timeout, Skip, Swap, Reset and refresh, Kilo Meshakkal, corrections not re-sent), the Streak outcomes (including the page-closed timeout and End run), nothing sent for Golden Goal and Daily Challenge, once per question per game, failed sends (network, 500, 503) never disturbing play, old and broken saves, the API (201, 400, 405, 415, upsert under load, cascade, missing table, migration twice), and Admin (columns, hint, tooltips, marks at the exact edges, bands for four different enabled sets, sorting, missing table, other panels, 1366 and 1024 layout at page level, game at 1366x768 and 375x812). 67 checks: 62 PASS, 1 FAIL, 4 PENDING. The one FAIL is BUG-11-01, a 5 px inner scroll of the Questions table at 1024 px with a classic scrollbar (Minor, the PO may accept it). The pending items are the hash after the commit, the hosted migration and smoke check, a real device and the Android app, and the owner's own look at 1024 px.

## Re-test (fix loop 1)

Re-tested 2026-11-03 after the developer's one-rule CSS fix for BUG-11-01 (`#questions-panel .data-table td.name-cell { min-width: 7rem; }` in `css/style.f2b43475.css`, see "Fix loop 1" in `docs/sprints/sprint-11-dev.md`). I changed no code; the only file written is this report. Same method as the first run (my own server on port 8012, iframes with no border so the real 15 px classic scrollbar costs width, snapshot of the database and logs taken at the start of this run). To be sure the iframe loaded the new CSS, I read the computed `min-width` of the Category cell (119 px, which is 7rem plus padding) before measuring.

| ID | Check | Result | Evidence |
|---|---|---|---|
| RT1 | AD13 again: at 1024 px the Questions table fits with no inner scrollbar and the Actions column is fully visible | PASS | window 1024, page 1009/1009; panel 915/915 (`scrollWidth` = `clientWidth`); table 915 px, its minimum (`width: min-content`) 886 px, so 29 px to spare (first run: 920 in 915); the Actions header ends at x 962 = the panel edge, both row buttons end at 887 and 954, inside it |
| RT2 | 1280 and 1366 px: no inner or page horizontal scroll, Actions visible | PASS | 1280: page 1265/1265, panel 1171/1171, Actions right edge 1218 = panel edge 1218, buttons end 1143 and 1210; 1366: page 1351/1351, panel 1257/1257, Actions 1304 = 1304, buttons 1229 and 1296; minimum table 886 px at every width; no script error |
| RT3 | Long category names wrap cleanly | PASS | at 1024 px "Cartoons & Childhood" (category filter with 32 rows) wraps to 2 lines in a 121 px cell, the text's right edge (140 px) is inside the cell edge (168 px), no overflow, panel still 915/915; "Food & Drink" stays on 1 line |
| RT4 | Other Admin tables unchanged | PASS | at 1024 px: Categories 915/915, Reports 915/915, Streak leaderboard 915/915, Game logs 915/915, all no inner scroll; their name cells keep `min-width` 153 px (9rem) and only the Questions table has 119 px; page 1009/1009 |
| RT5 | Questions list regression: hint line, marks, sorting | PASS | the hint line is unchanged (100: 60–100% ... 500: 20–60%); 17 seeded rows give the same marks as before (19 attempts no mark, exactly 20 attempts at 0% marked, 50% and 90% at 200 not marked, 49% and 95% marked, 99/200 shows 50% and is not marked, disabled 600 not marked, 12345 attempts at 100% on a 100-point question not marked); % correct sort: 0,0,0,0,19,20 ... then "-" last, then 100,100,100,100,95, then list order; Attempts sort: 12345, 200, 200, 100, 100, then 6, 19, 20, 20, then list order, `aria-sort` follows; sorting inside the 200 filter works (0, 49, 50, 50, 90, 95); the panel stays 915/915 after every change |
| RT6 | The narrower Category column does not make the rows worse | PASS (Info) | at 1024 px the Question column is 103 px wide with the fix against 91 px without it (simulated by injecting the old 9rem rule in the page), median row height 263 px against 287 px, tallest 632 against 780 |

**New totals: 72 checks, 68 PASS, 0 FAIL, 4 PENDING** (the 67 of the first run, with AD13 now PASS, plus RT2 to RT6). The four PENDING items are unchanged: the hash after the commit (S10), the hosted migration and smoke check (P1), a real device and the Android app (P2), and the owner's own look at 1024 px (P3, which should now show no inner scrollbar).

**BUG-11-01: FIXED and verified.** No new bug.

**Informational (no action required):** at 1024 px the Questions table rows are tall (median 263 px) because the new columns leave the Question column only about 103 px. This is the same before and after the fix (it was 91 px without it), and 1366 px is normal (median 90 px). The PO may want to know; D-19 only asks that the page does not scroll.

Data restored as found at the start of this re-test (checked by diff): the dump of `settings`, `point_values`, `streaks`, `question_reports`, `daily_challenge` and `question_stats` (0 rows) is identical; `questions` and `categories` counts and max ids, all AUTO_INCREMENT values, the settings and the point values are identical; the 7 `logs/*.log` files are byte-identical; `git status` and the md5 of the repo files are unchanged apart from this report. The 17 seeded `question_stats` rows were deleted, the test iframes, `localStorage` and service worker of `localhost:8012` were cleared, and my server on port 8012 was stopped.

## Verdict (after the re-test)

**READY FOR PO.** BUG-11-01 is fixed: the Questions table fits at 1024, 1280 and 1366 px with a real classic scrollbar, with the Actions column fully visible, and nothing else in Admin changed. 72 checks: 68 PASS, 0 FAIL, 4 PENDING (commit hash, hosted migration, real device and Android app, the owner's look at 1024 px).

## PO acceptance

**US-47 Question difficulty stats: ACCEPTED** (PO, 2026-11-03).
- Every acceptance criterion and every part of D-55 that can be run locally passes (72 checks, 68 PASS, 0 FAIL after the re-test): the board outcomes, Streak outcomes, Kilo Meshakkal at the question's own value, nothing sent for Golden Goal and Daily Challenge, once per question per game, failed sends never disturbing play, the API checks, the upsert, the cascade, the missing table, the migration run twice, and Admin marks at the exact band edges for four enabled sets. The DoD items pass (hosted migration run pending).
- BUG-11-01 (Minor) is fixed and re-tested (see "Re-test (fix loop 1)").
- Pending items: S10 (hash after the commit) and P3 (the owner's look at 1024 px) go to FU-39; P1 (hosted migration and smoke check) and P2 (touch device, Android app) go to FU-40.
- The developer's choices are accepted as D-56 in `docs/product-backlog.md`: no saved-game version bump, the band for 1 enabled value (40–80%), timeout only while the page is open, counts kept when a question is moved or edited, no Privacy change (anonymous counts per question), the API sort option, `is_missing_table()` in `api/db.php`, and the tall Questions rows at 1024 px (allowed by D-19; FU-44, Could).
- Found at acceptance: `docs/deploy-hostinger.md` step 8.4 lists only `index.html` and `admin.html`, but `how-to-play.html`, `about.html`, `contact.html`, `privacy.html` and `terms.html` also point at the re-hashed `css/style.*.css`. FU-40 gives the full upload list; FU-41 (Should) fixes the guide. Not a blocker: a Git deployment from `main` is not affected.
- Other follow-ups: FU-42 (Daily Challenge stats), FU-43 (Admin reset of a question's stats), all Could.
- Informational items 1 to 4 and the re-test note on row height need no further action.

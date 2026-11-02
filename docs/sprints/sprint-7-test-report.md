# Sprint 7: Report a question (US-42, D-45): test report

Tester: Senior Tester agent, 2026-11-02. Branch `sprint-7` (uncommitted). No application code was changed.

## Summary

- **Environment:** Windows 11, PHP 8.0.30 (XAMPP), MariaDB 10.4.32 (local `brainrush` DB, `question_reports` present), `php -S localhost:8000` from the repo root (already running, left running), in-app browser. A second `php -S localhost:8011` ran a throwaway copy of `db.php` and `reports.php` outside the repo for the 401 checks (stopped and deleted afterwards).
- **Viewports:** the in-app pane cannot be resized, so the game and Admin were loaded in a same-origin iframe sized 1366x768 (desktop) and 375x812 (phone). Media queries follow the iframe width. Layout was checked with `getBoundingClientRect` (overlap, `scrollWidth`/`scrollHeight`) plus screenshots checked by eye at reduced scale. Interaction was driven through `javascript_tool` (real `click()`, `requestSubmit()` and dispatched key events), results read from the DOM, `localStorage` and the DB.
- **Counts (after fix loop 1):** 80 checks, **75 PASS, 0 FAIL, 5 PENDING** (D8 browser admin login, D9 Admin delete refresh, O5 hosted migration, O6 re-hash after commit, O7 live 401 and CDN purge). First round: 69 checks, 63 PASS, 6 PENDING, 2 Minor bugs; both are now fixed and re-tested (see "Re-test (fix loop 1)"). 0 open bugs.
- **Verdict: READY FOR PO.** No Critical or Major bug, and BUG-7-01 and BUG-7-02 are fixed. The PENDING items need the owner (live DB and CDN, a configured admin login in the browser).

## Static checks

| ID | Check | Result | Evidence |
|---|---|---|---|
| S1 | `php -l` on every `api/*.php` (incl. new `reports.php`) | PASS | "No syntax errors detected" for all files |
| S2 | `node --check` on `js/game.ccf94860.js` and `js/admin.bfc53960.js` | PASS | no output, exit 0 |
| S3 | No `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `document.write` in game, admin JS or API | PASS | grep finds only the two header comments saying "never innerHTML" |
| S4 | SQL built by string concatenation | PASS | `reports.php` uses prepared statements with named parameters for INSERT and UPDATE. The only non-prepared query is the constant SELECT in `open_reports()` (no user input) |
| S5 | Credentials outside `api/config.php`; `api/config.php` ignored | PASS | `git check-ignore -v api/config.php` prints `.gitignore:1`. No password, key or token strings in `reports.php`, the migration or the game JS. `api/config.php` was not read |
| S6 | Hard-coded board sizes | PASS | none. `REPORT_NOTE_MAX` (200) is a named constant in PHP and JS. The six reasons are fixed by D-45 |
| S7 | No name, IP, device id or hash stored | PASS | no `REMOTE_ADDR`, `HTTP_USER_AGENT`, forwarded header or device field in `reports.php`. `information_schema` lists exactly `id, question_id, reason, note, status, created_at` |
| S8 | `question_reports` in both schema files; bodies identical; same definition as the migration | PASS | `diff` of `schema.sql` after `USE brainrush;` against `schema-hosted.sql` from its first CREATE TABLE: no difference. The table block equals the one in `migrate-add-question-reports.sql` |
| S9 | Migration runs twice with no error | PASS | on the local DB twice: exit 0 both times, table unchanged. On a scratch DB: `schema-hosted.sql` twice, the migration twice, then DROP TABLE and the migration twice again: all exit 0, six tables, `SHOW CREATE TABLE` as expected (FK `ON DELETE CASCADE`, both ENUMs, `note VARCHAR(200)`). Scratch DB dropped |

## API checks (curl, server on :8000)

| ID | Check | Result | Evidence |
|---|---|---|---|
| A1 | Each of the six reasons | PASS | `wrong_answer`, `typo`, `translation`, `outdated`, `picture`, `other` each give 201 `{"id":N}` |
| A2 | Note missing, `null`, `""` or only whitespace | PASS | 201, stored as empty |
| A3 | Note of 200 and 201 characters, padding | PASS | 200 gives 201, 201 gives 400 "note must be at most 200 characters". 200 characters plus trailing spaces gives 201 (trimmed) |
| A4 | Arabic note, emoji counted once | PASS | 199 x "ب" + one emoji = 200 gives 201 (`CHAR_LENGTH` 200, stored intact). 200 x "ب" + emoji = 201 gives 400. A 2 MB note gives 400 |
| A5 | Non-text note | PASS | number and array give 400 "note must be text" |
| A6 | Bad question id | PASS | 400 for 0, -1, 1.5, 3.0, 3e0, "abc", "", null, true, `[]`, missing and 4294967296. An id that does not exist (99999999) gives 400 "This question does not exist (any more)." The string "3" is accepted (201) |
| A7 | Bad reason | PASS | 400 for "spam", "Typo", "TYPO", "typo " (trailing space), "", null, `[]`, 5 and missing |
| A8 | Bad bodies and methods | PASS | `{}`, `[]`, broken JSON and an empty body give 400. Form-encoded body 415. PATCH 405. OPTIONS 405 |
| A9 | No rate limit (D-45) | PASS | 40 POSTs in a row, about 1 s apart or less (same second in the DB): 40 x 201. About 60 more over the run, no 429 |
| A10 | What is stored | PASS | extra fields `name`, `ip`, `device` in the body are ignored. `status:"resolved"`, `created_at` and `id` in the body are ignored (row is `open`, server time). `information_schema` shows no other column |
| A11 | Control characters and hostile text | PASS | `\n`, `\t`, NUL and BEL in a note become spaces. `<img src=x onerror=alert(1)>`, `<script>` and `x'; DROP TABLE question_reports;--` are stored as typed and the table is intact |
| A12 | GET, PUT, DELETE parameter checks | PASS | GET without `all=1` or with `all=0`: 400. PUT or DELETE with no id or id "abc": 400 |
| A13 | Resolve and Dismiss | PASS | PUT `question_id=5` 200 `{"status":"resolved","updated":2}`, again 404 "This question has no open reports." DELETE `question_id=3` 200 `dismissed` (58 rows), again 404. Unknown id 404. Rows are kept in the DB with the new status |
| A14 | `GET ?all=1` shape and order | PASS | `[{question{id,category_id,category_name,points,question,answer,image},count,reasons{},reports[{id,reason,note,created_at}],last_at}]`. Most reports first, then the latest report. After closing all reports it returns `[]` |
| A15 | Admin endpoints without login (US-29) | PASS | throwaway copy of `db.php` + `reports.php` with a test-only config (a generated admin hash, DB `root`, empty password) in a temp folder outside the repo: GET `?all=1`, PUT and DELETE without login give 401 with `WWW-Authenticate: Basic realm="BrainRush admin"`. Wrong password 401, wrong user 401. The right test login gives 200. The public POST still gives 201. The unauthenticated PUT/DELETE changed no row. The copy was deleted and the server stopped |
| A16 | Admin endpoints from a non-local host | PASS | on the real local config (no admin credentials set): `Host: example.com` or `X-Forwarded-For` gives 403 for GET. The public POST with `Host: example.com` still gives 201 |
| A17 | Deleting a question removes its reports | PASS | a temporary question (id 1719) got 3 reports; `DELETE questions.php?id=1719` gave `{"deleted":1719}` and the report count went 3 to 0. A POST for the deleted id gives 400. The temporary question was removed and `questions` AUTO_INCREMENT set back to 1719 |
| A18 | Table missing (renamed `question_reports` for a few minutes, then renamed back) | PASS | POST 503 "Reports are not available right now. Please try again later." GET `?all=1`, PUT and DELETE 503 "Reports are not set up on this database yet: run sql/migrate-add-question-reports.sql." A bad reason still gives 400 first. `categories.php`, `questions.php`, `settings.php` and `points.php` stay 200 |

## UI checks: game (1366x768)

| ID | Criterion | Result | Evidence |
|---|---|---|---|
| G1 | Report shows on an open board question, not on setup, board or results | PASS | hidden on setup and board (not rendered). Shown, 63x29 px, in the top right of the question panel |
| G2 | Form content | PASS | dialog `role="dialog"`, `aria-modal`, title "Report this question", "Category - points" line, six radio tiles in the D-45 order, optional note (`maxlength=200`, `dir="auto"`), "N / 200" counter, privacy line "Only the question, the reason, your note and the time are saved: no name.", Send report and Cancel. Focus goes to the first reason and `.game-main` becomes inert |
| G3 | Send with no reason | PASS | inline "Choose what is wrong with the question.", no request. The message clears when a reason is picked |
| G4 | Note over 200 characters | PASS | with `maxlength` removed by script, 201 characters show "201 / 200" and "The note can be at most 200 characters.", and no request is sent. 200 shows "200 / 200" (counter turns gold) |
| G5 | Valid report | PASS | one POST to `api/reports.php` with only `question_id`, `reason`, `note` (trimmed). The DB row has the right question id, reason, note, `open` and the time. Thank-you text replaces the form, focus goes to Close. Close or Cancel returns focus to Report. Reopening gives an empty form |
| G6 | Sending never stops the timer or changes the game | PASS | timer 300 s: 298 before, 295 with the dialog open, 294 after the send, and counting on. `contestants`, `used` and `current` in `brainrush.game` are identical before and after; `version` stays 3 |
| G7 | Escape and Cancel close the form | PASS | focus returns to Report |
| G8 | Double submit | PASS | three `requestSubmit()` calls in a row send one request (the button is disabled while sending) |
| G9 | Server error (table missing) | PASS | inline "The report could not be sent: Reports are not available right now. Please try again later.", the form stays open, Send is usable again, Cancel closes it and the game carries on (timer ran, scores unchanged). The game also starts normally with the table missing |
| G10 | 3 choices helper | PASS | after Team A used "3 choices", a report was sent; the A/B/C choices are unchanged, helpers and scores are unchanged |
| G11 | Swap helper | PASS | after Swap the heading is "Flags - 300 / Swapped from Flags - 200" and the form says "Flags - 300"; the POST carries the swap question's id (1020), not the original. Layout still fits (768, no overlap) |
| G12 | Skip helper | PASS | a report before Skip, then Skip: back on the board, Team A at -150, helpers used, dialog closed, no error. Leaving the question screen closes any open dialog |
| G13 | Arabic | PASS | question shown in Arabic (RTL): Report does not overlap the Arabic text, page height 768. An Arabic note with an emoji (27 characters) is counted and stored correctly. The note field has computed direction `rtl` |
| G14 | XSS in the note typed in the game | PASS | `<img src=x onerror=alert(1)> <script>alert(2)</script> "quote" 'q' &amp;` is stored literally. No `<img>` or `<script>` appears in the dialog and no alert fired (alert was hooked) |
| G15 | Time's up on a board question | PASS | after "Time's up!" Report still opens, and a dialog open when the timer ends stays open |
| G16 | Photo questions, no extra height, no overlap | PASS | Flags 100 and 300, Landmarks 200 and 500 and a Geography 500 text question: `scrollHeight` is 768 and `scrollWidth` 1366 in all. Report overlaps neither the heading text, the picture nor the question text. The question panel is 551.6 px tall with and without Report (flags 200), page height 768 either way. The button is absolutely positioned and the heading gets 85 px right padding |
| G17 | Old saved game with no question ids | PASS | ids removed from `brainrush.game` and the page reloaded: the question screen restores, Report stays hidden, no error. A normal saved game reloaded on a question shows Report again |
| G18 | Android Back closes the dialog | PASS (emulated, re-test) | tested in `?source=twa` mode, see RT10. A real Android device is still worth one look by the owner (FU-16 style check) |

## UI checks: game (phone, 375x812)

| ID | Criterion | Result | Evidence |
|---|---|---|---|
| M1 | Question screens, no horizontal scroll, Report clear of content | PASS | Geography, Flags and Landmarks questions: `scrollWidth` equals `clientWidth` (360 with the scrollbar). Report is 63x48 px at the top right, the heading is 43 px tall, no overlap with heading text, picture or question text. The board screen also has no horizontal scroll |
| M2 | Form on a phone | PASS | card 10 to 350 px wide, top 134, bottom 678 (with an error line 95 to 717). No scrolling inside the card. Reason tiles 48 to 61 px tall (two-line labels), Send and Cancel 48 px. Screenshot checked by eye. Sending works and the thank-you card fits |

## UI checks: Streak Challenge (1366x768)

| ID | Criterion | Result | Evidence |
|---|---|---|---|
| R1 | Hidden while the question is open | PASS | not rendered, heading has no right padding, page 768 |
| R2 | Shown once answered, right pick | PASS | after a right pick Report shows. The POST carries the answered question's id (553). `brainrush.streak` is identical before and after, and the count stays 1 |
| R3 | Enter inside the dialog does not go on | PASS | a document-level Enter with the dialog open left the same question. After Close, Next works |
| R4 | After a refresh, answered question | PASS | the answered question comes back with Next and Report visible |
| R5 | Next question hides Report again | PASS | the open question has no Report and no heading padding |
| R6 | Wrong pick (run over) | PASS | Report shown with "See results", dialog opens and Escape closes it, See results goes to the leaderboard |

## Admin (local host, 1366x900 iframe)

| ID | Criterion | Result | Evidence |
|---|---|---|---|
| D1 | Panel lists open reports grouped by question | PASS | heading "Reports (9 open reports on 7 questions)". Columns: question with category, points, "- picture" and answer; number of reports; one line per reason ("Typo: 1", "Translation: 1") in the game's order; notes with reason, time and note (newest first); actions. Most reported first, then latest report |
| D2 | Notes rendered as text | PASS | the `<img src=x onerror=alert(1)>` and `<script>` note is shown as text. `#reports-panel` contains no `<img>`. No alert. The Arabic note shows right to left |
| D3 | Edit question | PASS | the Questions filters switch to the question's category and points, the form title reads "Edit question (Geography - 600)", the text field has the question and its row is highlighted |
| D4 | Resolve with Cancel and OK (D-18) | PASS | confirm text: "Resolve the 2 open reports on this question? ... The reports leave this list." Cancel sends no request and the list is unchanged. OK sends `PUT reports.php?question_id=1020`, then reloads the list. Message "Resolved 2 open reports (Flags - 300)."; DB status `resolved` for both rows |
| D5 | Dismiss with Cancel and OK (D-18) | PASS | Cancel sends nothing. OK sends `DELETE reports.php?question_id=1309`, the list reloads, message "Dismissed 1 open report (Landmarks - 400)."; DB status `dismissed` |
| D6 | Table missing | PASS | only the Reports panel shows "Could not load the reports: Reports are not set up on this database yet: run sql/migrate-add-question-reports.sql." Categories (14 rows), Questions (869), the streak leaderboard and the other panels load normally |
| D7 | Empty state | PASS | "No open reports." row, and no count in the heading (seen while the table was missing, the same code path as an empty list; the API returns `[]`) |
| D8 | Admin login prompt in the browser | PENDING (environment) | the local config has no admin credentials, so Admin opens without a login. The 401 is proved by curl (A15). The owner confirms the browser login on the live site |
| D9 | Deleting a question or category in Admin refreshes the Reports panel | PENDING (not run) | not clicked, so as not to delete bank content. The code calls `loadReports()` after both deletes, and the cascade was verified through the API (A17) |

## Other Sprint 7 items

| ID | Criterion | Result | Evidence |
|---|---|---|---|
| O1 | Privacy page | PASS | new "Question reports" section (question number, reason, note up to 200 characters, date and time; no name, IP or device id; deleted with its question), in the contents with a working `#reports` anchor, date "2 November 2026" |
| O2 | question-bank-manager: plan lists open reports first | PASS | description, fixed fact, plan step 2 "Open reports first" with the SQL, brief item `REPORTED QUESTIONS (check these first)`, validate check and run report all updated. The step 2 SQL was run on the local DB with 7 test reports on 6 questions and returns the grouped list (reasons, notes, ordered by report count). It states reported questions are checked before new ones |
| O3 | README, deploy guide, spec | PASS | README: How to play 7, Admin "Reports", "Three public writes", deploy line. Deploy guide: six tables after import, `reports.php` in the upload list, step 8.4 with migration before code, smoke check and the 401 check. Spec: file list, DB, API, game, Admin, security |
| O4 | Console and script errors | PASS | no `error` or `unhandledrejection` events in the game (board, Streak, phone, Arabic), in Admin or on Privacy. The only console entries are the two "Failed to load resource ... 503" lines caused on purpose by the missing-table check |
| O5 | Migration run on the hosted DB before the code (DoD) | PENDING (environment) | owner step in phpMyAdmin, with the code deployed afterwards (deploy guide 8.4) |
| O6 | After commit: hook re-hashes the three assets and `index.html` and `admin.html` point at the new names (FU-16) | PENDING (after commit) | the three files were edited in place under their old hashed names; nothing is committed yet. Currently `index.html` and `admin.html` load `style.2a96d814.css`, `game.ccf94860.js` and `admin.bfc53960.js` correctly |
| O7 | Live: `GET /api/reports.php?all=1` without login answers 401 and a CDN purge | PENDING (environment) | only possible on the hosted site with credentials configured |

## Definition of Done (Sprint 7)

| DoD item | Result | Evidence |
|---|---|---|
| Migration re-runnable, run twice locally; table in both schema files; hosted run before code | PASS (hosted run PENDING) | S8, S9, O5 |
| No names, IP or device id stored (checked in the DB); six reasons and no rate limit match D-45 | PASS | S7, A1, A9, A10 |
| Reports panel actions all use confirm (D-18) | PASS | D4, D5 (Edit question changes nothing, so it has no confirm) |
| question-bank-manager instruction updated | PASS | O2 |
| Layout 1366x768 and 375x812; saved game untouched; works with Swap, Skip, 3 choices and Arabic | PASS | G6, G10 to G13, G16, M1, M2 |
| FU-19: only the reports feature breaks without its table | PASS | A18, D6, G9 |

## Bugs and findings

No Critical or Major bugs. Both Minor bugs below were fixed in fix loop 1 and verified in the re-test; no bug is open.

**BUG-7-01 FIXED, verified in the re-test (RT1 to RT3).** **BUG-7-01 (Minor, cosmetic)** Admin Reports panel shows a contradictory state when the table is missing. Steps: rename or drop `question_reports`, open `admin.html`. Expected: only the error line. Actual: the error "Could not load the reports: ..." is shown and the table below it still says "No open reports.", which reads as if there are none. `js/admin.bfc53960.js`: `renderReports()` runs at start (`renderReports();` before the login check) and the catch in `loadReports()` leaves that empty row in place. Fix idea: hide the table, or show "Reports unavailable." in the row, when the load fails.

**BUG-7-02 FIXED, verified in the re-test (RT4 to RT7).** **BUG-7-02 (Minor, accessibility)** The header links stay keyboard-focusable behind the open Report dialog. Steps: open a question, click Report, press Tab until focus leaves the form. Expected: focus stays in the dialog. Actual: `How to play`, `Terms`, `Privacy` and `Admin` (outside `.game-main`) can be focused behind the overlay, and Enter on one leaves the page (the game stays saved). `js/game.ccf94860.js:3018` makes only `dom.main` inert. This is the same pattern as the double-score popup (line 1678), so it is consistent, not new. Fix idea: also make the header and footer inert, or trap Tab inside the dialog.

**Informational (no action required)**
- **Untracked files not part of the story.** `package.json`, `package-lock.json` (Playwright dev dependency), `.claude/launch.json` and `googlebbe9a71d60b82d1a.html` (a Google verification file) are untracked. `.gitignore` now ignores `node_modules/`. The owner decides whether to commit them with this sprint.
- **Spam is possible by design (D-45).** No rate limit, public POST: anyone can file many reports. Dismiss closes all open reports of a question at once; a single report cannot be removed from the panel.
- **The dialog covers the board question** while open, and the timer keeps running (as required). Time can run out unseen on the board; nothing is auto-scored (D-03).
- **"Picture problem" is offered on text questions** too (D-45 lists six reasons for every question).
- **Live reports stay on live.** The question-bank-manager reads only the local DB; the owner checks the live Admin > Reports panel.
- **Time zone.** `created_at` is the DB server's clock (the local DB and PHP clocks differ by an hour); Admin shows the DB time as stored.
- **Admin at a 435 px wide window** has a few pixels of horizontal overflow on every panel (not only Reports); Admin is not in the phone scope (D-30).

## Re-test (fix loop 1)

Tester: Senior Tester agent, 2026-11-02, after the developer's "Fix loop 1" (`setPageInert()` in `js/game.ccf94860.js`, Reports panel render in `js/admin.bfc53960.js`). Same environment as above. Keyboard checks used real Tab, Shift+Tab and Escape key presses sent to the framed game (focus events were logged inside the page); `node --check` on both JS files is OK. The only code the fix touches is the inert handling for the Report dialog and the double-score popup, and the Admin Reports render.

| ID | Check | Result | Evidence |
|---|---|---|---|
| RT1 | BUG-7-01: table missing, Admin loads | PASS | `question_reports` renamed away: the Reports table body is empty (0 rows), the heading count is empty, and only "Could not load the reports: Reports are not set up on this database yet: run sql/migrate-add-question-reports.sql." shows. Categories (14 rows), Questions (869) and the streak leaderboard (4 rows) load as before. No script errors |
| RT2 | BUG-7-01: table restored | PASS | Reload clears the error line and loads the rows ("4 open reports on 3 questions"); a full page reload also loads with no error |
| RT3 | "No open reports." only after a successful empty load | PASS | after the last open report was dismissed in the UI the body reads "No open reports." with an empty count and the message is the dismiss confirmation; it never showed with the error |
| RT4 | BUG-7-02: Tab and Shift+Tab inside the Report dialog | PASS | with the dialog open, `.page-header`, `.game-main` and `.site-footer` are all `inert`. 14 real Tab presses and 8 Shift+Tab presses only visited the reason group, the note, Send report and Cancel (logged focus events), never a header or footer link. A script `focus()` on the header link does nothing |
| RT5 | Release and focus return (Report dialog) | PASS | Escape (real key), Cancel, and Send then Close each close the dialog, release all three regions, return focus to Report, and the header link is focusable again. Timer kept running (300 to 285 across the flows). Thank-you state also keeps all three inert until Close |
| RT6 | Double-score popup (D-40) | PASS | Flags 500 (the double cell): all three regions inert, focus on "Let's play", 8 Tab and 4 Shift+Tab presses stayed on it. The timer waited while the popup was open (300 and 300 after 2 s) and resumed after it (300 to 298). "Let's play" releases all three and focuses the question heading. Page 768 high |
| RT7 | Report in a Streak question | PASS | answered question: dialog open means all three inert and the header link cannot take focus. Escape closes it, focus returns to Report, regions released, the run's count unchanged (1), page 768 |
| RT8 | D-30 fit at 1366x768 | PASS | Geography 100, Flags 200, Landmarks 300 and the double cell: Report shown, no overlap with the heading text, `scrollHeight` 768 and `scrollWidth` 1366 on each. The Report card spans 147 to 621 and the page stays 768 |
| RT9 | Fit at 375x812 phone | PASS | double-score popup 226 to 586 px, Report card 134 to 678 px (tiles 48 to 61 px), `scrollWidth` equals `clientWidth` (360 with the scrollbar) in both. After closing, nothing is left inert |
| RT10 | Android Back in `?source=twa` mode (375 px wide) | PASS | `brainrushApp` is true, one history entry is armed after a tap. With the Report dialog open, Back closes only the dialog: no confirm was asked, the question stays open, the timer runs, focus returns to Report, nothing is inert. A second Back then asks the normal "Leave this question?" confirm (declined: the question stays, the entry is re-armed). With the double-score popup open, Back closes the popup, focuses the question heading and releases all three regions. No horizontal scroll |
| RT11 | Console and script errors | PASS | no `error` or `unhandledrejection` event in the game (board, double popup, Report, Streak, TWA mode) or in Admin. The only console errors are the "Failed to load resource ... 503" lines from the deliberate missing-table checks |

Re-test cleanup: `question_reports` truncated (0 rows, AUTO_INCREMENT 1) and the table rename undone; `streaks` still ids 1, 8, 9, 10 (no run saved this time, AUTO_INCREMENT 11); `questions` 869 rows, AUTO_INCREMENT 1719; `logs/game-2026-11-02.log` (my test game starts) deleted; `localStorage` for `localhost:8000` cleared. The dev server on :8000 was left running.

## Cleanup done

- `question_reports`: all test rows removed with `TRUNCATE` (0 rows, AUTO_INCREMENT back to 1, as before). The test rename of the table was undone.
- `streaks`: the one run saved by the Streak test ("Team A", 1) deleted; the four earlier rows (ids 1, 8, 9, 10) and AUTO_INCREMENT 11 are as found.
- `questions`: the temporary question was deleted; 869 rows and AUTO_INCREMENT 1719 as found. `settings` untouched.
- Scratch database `brainrush_t7` dropped. `logs/game-2026-11-02.log` (only my 4 game starts) deleted.
- The throwaway server copy on :8011 and its config were stopped and deleted; the temp files are gone. `api/config.php` and `InternalUse/` were not read or changed.
- The browser's `localStorage` for `localhost:8000` was cleared (saved board game, Streak run, played-questions list). The dev server on :8000 was left running as found.

## Verdict

**READY FOR PO.** Every US-42 acceptance criterion and every Sprint 7 DoD item that can be run locally passes, and both Minor bugs from the first round are fixed and re-tested. The remaining items are the owner's live steps (migration before code on the hosted DB, 401 and CDN purge on live, FU-16 hash check after the commit) and the browser admin login.

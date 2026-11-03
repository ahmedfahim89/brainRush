# Change request "Reset stats" (after Sprint 11): test report

Tester: Senior Tester agent, 2026-11-03. Branch `cr-reset-stats` (uncommitted working tree). No application code was changed; the only file written is this report.

## Summary

- **Environment:** Windows 11, PHP 8.0.30 (XAMPP), MariaDB (local `brainrush` DB, `question_stats` migrated). My own `C:/xampp/php/php.exe -S localhost:8012` from the repo root (the owner's port 8000 was never touched), plus a second server on 8014 started from a temp copy of `api/` outside the repo with a throwaway admin login (a throwaway `config.php` that points at the local XAMPP database; for the 401 path only). `api/config.php` and `InternalUse/` were not read. UI: the in-app browser (viewport about 978 px wide, device pixel ratio 1.25). The pane cannot be resized, so Admin was loaded in same-origin iframes of 1024, 1366, 700 and 375 px with no border, so the classic 15 px scrollbar costs width as on a real desktop (page `scrollWidth` = `clientWidth` = 1009 at "1024", 1351 at "1366"). In the iframe I wrapped `fetch` (to count requests and, for the error, old-API, null-stats and zero-count cases, to mock the DELETE or the list answer) and `window.confirm` (to answer yes or no and record the text). The service worker of `localhost:8012` was unregistered and its storage cleared.
- **Counts:** 48 checks, **45 PASS, 0 FAIL, 3 PENDING** (the commit hash, the hosted deploy, the owner's own browser).
- **Bugs:** 0 Critical, 0 Major, **1 Minor** (BUG-CR-01, a stale success line). Informational notes at the end.
- **Verdict: READY FOR PO**, with BUG-CR-01 for the PO to accept or send back. Everything in the design passes, including the 401 path, the missing-table 503, the reset of every row, the second reset giving 0, the public POST after a reset, the layout at 1024 (classic scrollbar) and 1366, and the old-API crash case.

Data at the start (snapshot taken before any test): `question_stats` 15 rows (the owner's counts, each row 1 attempt), `settings` (9 keys), `point_values` (100 to 500 enabled, 600 disabled), `questions` 873 rows, all tables `mysqldump`-ed (full dump, one row per INSERT), `AUTO_INCREMENT` of every table, and the md5 of the 7 `logs/*.log` files. All restored exactly, see "Cleanup".

## Static checks

| ID | Check | Result | Evidence |
|---|---|---|---|
| S1 | `php -l` on every `api/*.php` | PASS | no error for any file, including `question-stats.php` ("No syntax errors detected") |
| S2 | `node --check js/admin.b5e5aba1.js` | PASS | exit 0 |
| S3 | No `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `document.write` | PASS | the only grep hit is the header comment ("never innerHTML"). The new hint spans use `h()`, the text nodes `createTextNode`, the messages `showMessage` / `showSuccess` |
| S4 | SQL by string concatenation | PASS | `question-stats.php` has two `prepare()` calls: the fixed upsert and the fixed `DELETE FROM question_stats` (no TRUNCATE, no user input in it) |
| S5 | Secrets; `api/config.php` git-ignored | PASS | `git check-ignore -v api/config.php` prints `.gitignore:1:api/config.php`; the diff and the new dev note contain no password, key, token or connection string (the grep hits are prose in the README) |
| S6 | Hard-coded point values / board sizes | PASS | the added JS has no literal point value or board size; the new code only adds the prompt and tooltip texts as named constants |
| S7 | CRLF | PASS (with a note) | CR count = LF count (every line CRLF) in `README.md`, `admin.html`, `api/question-stats.php`, `css/style.ca3e62fe.css`, `docs/deploy-hostinger.md`, `docs/spec.md`, `js/admin.b5e5aba1.js` and the dev note (checked with `tr -cd`). `.gitignore` is the exception: 17 CR for 20 lines, the 3 lines added for `node_modules/` (a blank line, the comment, `node_modules/`) are LF-only. That change is not part of this change request (it is in the working tree since Sprint 11), see Informational 3 |
| S8 | Docs match the behaviour | PASS | README (Admin "Questions" item: "greyed out while no question has any attempts"; "Four public writes": admin rights for the reset), `docs/spec.md` (file line and the new API line: 200 `{deleted}`, 401/403, 503, 405 with `Allow: POST, DELETE`) and the dev note all agree with what I measured in A1 to A12 and U1 to U19 |
| S9 | Deploy guide bullet correct and complete | PASS | `docs/deploy-hostinger.md` section 8, "Reset stats": no database change, needs the Sprint 11 migration, uploads `api/question-stats.php`, the new hashed `js/admin.*.js` and `css/style.*.css` and **all seven pages that point at them**. I grepped the repo (outside `docs/`, `node_modules`, `.git`, `InternalUse`): exactly 7 files reference `css/style.*.css` (`index.html`, `admin.html`, `how-to-play.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html`) and only `admin.html` references `js/admin.*.js`. `sw.js`, `offline.html`, `manifest.webmanifest`, `sitemap.xml` and `llms.txt` do not name either file, so the list is complete. The smoke check (message text, greyed button, 401 on a login-less DELETE, 405 on GET) matches A3 to A7, A12 and U9 |
| S10 | After the real commit, the 7 pages point at the re-hashed JS and CSS (FU-16), then purge the CDN | PENDING (after commit) | both assets were edited in place under their old names (`admin.b5e5aba1.js`, `style.ca3e62fe.css`); all 7 pages still point at those names, which is consistent now |

## API checks (curl; own servers 8012 and 8014)

| ID | Check | Result | Evidence |
|---|---|---|---|
| A1 | GET, PUT, PATCH, HEAD, OPTIONS | PASS | all 405 with `Allow: POST, DELETE` (body `{"error":"Method not allowed"}`) |
| A2 | DELETE from a non-local host with no login configured | PASS | `Host: example.test` gives 403 "Admin changes are disabled: configure admin credentials..."; the table stayed at 15 rows |
| A3 | DELETE with no login (throwaway admin config on 8014) | PASS | 401 `{"error":"Login required to change content."}` with `WWW-Authenticate: Basic realm="BrainRush admin"`; rows 15 before and after |
| A4 | DELETE with a wrong password, and with a wrong user | PASS | both 401 "Login failed: wrong user name or password."; rows still 15 |
| A5 | DELETE with the right login | PASS | 200 `{"deleted":15}`, `Content-Type: application/json`; `SELECT COUNT(*)` gives 0 |
| A6 | A second reset | PASS | 200 `{"deleted":0}` |
| A7 | GET with the login | PASS | 405, `Allow: POST, DELETE` |
| A8 | The public POST works after a reset | PASS | on the empty table: `correct`, `wrong`, `nobody`, `timeout`, `correct` for question 66 gave 201 each, the row read 2/1/1/1 (a real new row created by the upsert) |
| A9 | The public POST still needs no login and still validates | PASS | on the server with a login configured, `{"question_id":0,"outcome":"correct"}` without a login gives 400 "question_id must be a positive whole number", not 401 |
| A10 | Reset with a local server and no login configured, after the POST test | PASS | 200 `{"deleted":1}` (the one row of the test) |
| A11 | Missing table (`question_stats` renamed away for a few seconds, then renamed back) | PASS | DELETE on 8012: 503 "Question stats are not available right now."; on 8014 without a login: 401 (the login check comes first); on 8014 with the login: 503; the POST: the same 503; `GET questions.php?category_id=1`: 200, `attempts`, `percent_correct` and `stats` all null (the list still loads). The error is logged to the server's stderr as before |
| A12 | The Admin list after a reset | PASS | `GET questions.php?category_id=1` after the reset: 96 rows, the first with `attempts` 0 and `percent_correct` null |

## UI checks: Admin Questions (in-app browser, iframes)

| ID | Check | Result | Evidence |
|---|---|---|---|
| U1 | At 1024 px (classic 15 px scrollbar), all questions listed: the button is on the hint line | PASS | hint box top 3239 to bottom 3283, button 3246 to 3276, right end at x 962 = the panel edge; the hint wraps to 2 lines in its column (47 to 843), the button sits to the right; the row is 915 wide and has no overflow (`scrollWidth` 915 = `clientWidth` 915) |
| U2 | At 1366 px | PASS | hint 3254 to 3299, button 3262 to 3291, right end at 1304 = the panel edge; row 1257/1257 |
| U3 | No page scroll and no inner table scroll (BUG-11-01 stays fixed) | PASS | 1024: page 1009/1009, `.table-wrap` 915/915; 1366: page 1351/1351, `.table-wrap` 1257/1257; the same with the success message shown, and the other tables (Categories, Reports, Streak leaderboard, Game logs) each have 0 px of overflow |
| U4 | Hint text unchanged | PASS | `textContent` is "Check value: 20+ attempts and % correct outside 100: 60–100% · 200: 50–90% · 300: 40–80% · 400: 30–70% · 500: 20–60%. Attempts and % correct come from board and Streak games." (the same string as in the Sprint 11 report, AD1) |
| U5 | The five bands are no-wrap | PASS | each of the five `.band` spans has one client rect (never split over two lines) at 1024 and 1366 |
| U6 | Same style as the Delete buttons | PASS | the button has `btn btn-small btn-danger`; no new colour in the CSS diff |
| U7 | Cancel on the confirm | PASS | `confirm` was asked once; no `DELETE` in the request log, the list (873 rows), the button and the message line unchanged |
| U8 | The confirm text | PASS | exactly "Reset the stats of every question? All attempts and % correct go back to 0. This cannot be undone." |
| U9 | Accept (real DELETE) | PASS | one `DELETE api/question-stats.php`, then the list reloaded (`points.php`, `categories.php`, `questions.php`); message "Stats reset: 15 questions cleared." (green, `msg-success`); all 873 rows show "0" and "-"; the button is disabled with the title "Nothing to reset: no question has any attempts yet."; clicking the disabled button sends nothing and does not ask |
| U10 | A double click sends once | PASS | real DELETE: two `click()` plus a `dblclick` gave one confirm and one DELETE, the button disabled during the request. With the DELETE delayed 800 ms (mock): the same, and the button is enabled again afterwards |
| U11 | Errors: 500, 503, 401, 403 (mocked answers) | PASS | the API's message is shown in red (`msg-error`), the list is unchanged (873 rows) and not reloaded (only the DELETE in the log), the button is enabled again; 401 and 403 also show the login banner, 500 and 503 do not; a later success clears the error and shows the success line |
| U12 | Singular, zero and an answer without a number | PASS | `{deleted:1}` gives "Stats reset: 1 question cleared.", 0 gives "0 questions cleared.", 2 gives "2 questions cleared.", `{}` gives "Stats reset." |
| U13 | Hidden when the stats are missing | PASS | all rows with `attempts`, `percent_correct` and `stats` null (table missing): "-" and "-" in every row, the migration note is shown, the button is hidden (computed `display: none`), the hint line is still shown |
| U14 | Disabled with no attempts anywhere | PASS | every row at 0 attempts: the button is visible, disabled, with the tooltip; no migration note |
| U15 | Old `api/questions.php` (the three stats fields removed): the live crash case | PASS | every row shows "-" / "-", the migration note is shown, the button is hidden; clicking each sort header three times gives **no error** (no `error` or `unhandledrejection` event, no console message); the list order is unchanged |
| U16 | Partly missing fields | PASS | one row without `stats`: that row shows "-" / "-", the note appears, the button is hidden, no error; rows with attempts but no `percent_correct`: "-" in the % column, no error |
| U17 | Keyboard | PASS | Tab from the Points filter goes straight to "Reset all stats"; the button then matches `:focus-visible` and shows the shared ring (`box-shadow` 3 px gold, `rgba(245, 197, 24, 0.45)`, the same as every button, `button:focus-visible` in the CSS); Enter opened the confirm |
| U18 | Narrow panels | PASS | at 700 px the button sits to the right of the hint (hint 47 to 519, button 531 to 638) with no overflow; at 375 px the button wraps below the text (button top 5144, hint bottom 5138) inside the 277 px row, page 360/360 |
| U19 | Reload after a successful reset fails (mock) | PASS (as documented) | the red line reads "Could not reach the server. Check that it is running." and the button is enabled again; this is the dev note's "known limitation" |

## Regression and console

| ID | Check | Result | Evidence |
|---|---|---|---|
| R1 | "Check value" marks | PASS | mocked rows: 100-point with 20 attempts at 0% is marked "Expected 60–100% for 100"; 19 attempts at 0% is not; 200-point at 50% (200 attempts) is not; at 49% (40 attempts) is marked "Expected 50–90% for 200" |
| R2 | Sorting by Attempts and % correct, three clicks each | PASS | % correct: ascending (0% first), descending (100% first), then back to the list order with `aria-sort` ascending, descending, none; Attempts: descending (200, 40, 20, 19, 1 ...), ascending (1 ...), none; rows without a value stay last |
| R3 | Add, edit and delete a question (real API, "CR test question for Team A?") | PASS | POST 201 "Question added (Geography - 100).", PUT with the form in edit mode (title "Edit question (Geography - 100)"), DELETE; the new row showed "0" and "-" for the stats; the row count returned to 873 |
| R4 | The other Admin panels | PASS | Settings, Point values, Categories (14 rows), Questions (873), Reports (1), Streak leaderboard (5), Game logs (7) all rendered, no error message, no overflow |
| R5 | Console and script errors | PASS | `read_console_messages` empty after the loads and the actions; my `error` and `unhandledrejection` listeners in the iframes recorded nothing in any run |

## Pending items

| ID | Item | Result | Notes |
|---|---|---|---|
| S10 | Hash after the commit (FU-16) | PENDING (after commit) | see S10 above |
| P1 | Hosted deploy: upload the 10 files of the new deploy bullet, then its smoke check (the reset, 401 for a login-less `curl -X DELETE`, 405 for a GET) and the CDN purge | PENDING (owner) | I only tested the local database; the real 401 was tested with a throwaway admin config on a copy of `api/` |
| P2 | The owner's own Chrome at 1024 px, and the reset on the owner's real data | PENDING (owner) | I measured with a real 15 px scrollbar; browser zoom and Windows scaling can differ |

## Bugs and findings

**BUG-CR-01 (Minor)** The "Stats reset: N questions cleared." line never goes away, so it can contradict the list.
- Steps: in Admin Questions, click "Reset all stats" and accept ("Stats reset: 15 questions cleared." appears). Then do anything else that reloads the list, or let players create counts and reload the list (in my run: mocked reset, then the list was reloaded from the real database, which has attempts again, and then I added, edited and deleted a question).
- Expected: the success line is a short-lived confirmation (or is cleared by the next action or reload), so it does not stay beside a list that shows attempts again.
- Actual: `#question-stats-reset-msg` keeps "Stats reset: 4 questions cleared." through the list reload and the question add, edit and delete, while the rows show attempts. It only changes at the next reset or a page refresh. The migration note next to it is cleared on every render, but this line is not (the dev note says it has its own line for that reason).
- Where: `js/admin.b5e5aba1.js`, `onStatsResetClick()` / `renderStatsHint()`; `runAction()` clears it only at the start of the next reset.
- Impact: cosmetic. Other Admin panels also keep their last message until the next action, so the PO may accept it. A fix could clear the line in `renderQuestions()` when any question has attempts, or on any other action.

**Informational (no action required)**
1. `OPTIONS` on `api/question-stats.php` answers 405, as before the change (the API is same-origin; no CORS preflight is needed for Admin).
2. The "Reset all stats" success line says "N questions cleared" where N is the number of stats rows removed (questions that had at least one attempt), not the number of attempts or of all questions. That matches the dev note and the README.
3. The working tree holds files that are not part of this change request: `.claude/launch.json`, `googlebbe9a71d60b82d1a.html`, `package.json`, `package-lock.json` and the `.gitignore` change (`node_modules/`), the same ones listed in the Sprint 11 report. The owner should decide before `git add`. The `.gitignore` additions are LF-only in a CRLF file (mixed line endings, harmless for git ignore rules; the owner may normalise them).
4. The hint line is two lines high at both 1024 and 1366 px (it was one full-width paragraph before, the same text). The button is vertically centred on it; nothing is clipped.

## Cleanup done

- `question_stats`: my resets deleted the owner's 15 rows twice (the curl run with the login, and the end-to-end browser run), and my POSTs created one test row. After each phase the table was rewritten from the start-of-run TSV in one transaction and compared (`diff` empty). The table was renamed away once for the 503 tests and renamed back; `SHOW CREATE TABLE` is unchanged.
- `questions`: the temporary question (id 1727) was created, edited and deleted through the API; `AUTO_INCREMENT` of `questions` had moved to 1728 and was set back to 1727 with `ALTER TABLE`.
- **Final check:** a new full `mysqldump` of the `brainrush` database (every table, including `AUTO_INCREMENT` values) is **identical** to the one taken at the start (`diff` empty): the same 15 `question_stats` rows with the same counts, `settings`, `point_values`, 873 `questions`.
- The 7 `logs/*.log` files are byte-identical (md5), and no new log file exists.
- My servers on 8012 and 8014 were stopped; the owner's 8000 was never touched and is still listening. The temp copy of `api/` with the throwaway admin config was deleted. The iframes, `localStorage`, `sessionStorage` and the service worker registrations of `localhost:8012` were cleared.
- Repo: `git status` is the same as at the start plus this report; `md5sum` of `api/question-stats.php`, `admin.html`, `js/admin.b5e5aba1.js` and `css/style.ca3e62fe.css` was taken after the run and no file was edited by me. Scratch files (snapshots, restore script) are in the system temp folder `br-cr-test`, outside the repo.

## Verdict

**READY FOR PO.** The design passes: the admin-only DELETE (401 without a login or with a wrong one, 403 from another computer when no login is configured, 503 for a missing table, 200 `{"deleted": N}` and 0 the second time, 405 for the other methods), the public POST unchanged and working after a reset, the button on the hint line at 1024 px with a classic scrollbar and at 1366 px with no page or table scroll and an unchanged hint text, the hidden, disabled, double-click, cancel, success and error states, keyboard use, and the old-API case that crashed live (now "-" with the migration note and no error). The deploy-guide bullet is correct and its upload list is complete. Regression of the Questions panel (marks, sorting, add, edit, delete) and the other Admin panels passes, with no console errors. 48 checks: 45 PASS, 0 FAIL, 3 PENDING (commit hash, hosted deploy, the owner's own browser). One Minor bug, BUG-CR-01, for the PO to accept or send back.

## Re-test (fix loop 1, BUG-CR-01)

Re-tested 2026-11-03 after the developer's change in `js/admin.b5e5aba1.js` only (`clearStatsResetSuccess()`, called from `renderQuestions()`, clears `#question-stats-reset-msg` only when it holds a `msg-success` message; see "Fix loop 1 (BUG-CR-01)" in `docs/sprints/cr-reset-stats-dev.md`). I changed no code; the only file written is this report. Same method as the first run (my own server on port 8012, 1024 px and 1366 px iframes with the real 15 px classic scrollbar, `fetch` and `confirm` wrapped in the iframe; the reset was real once and mocked for the repeated runs, the question add, edit and delete were real). A new snapshot was taken at the start of this run: it was identical to the end state of the first run (full `mysqldump`, the 15 owner rows of `question_stats`, md5 of the 7 logs).

| ID | Check | Result | Evidence |
|---|---|---|---|
| RT1 | The success line shows after a reset (real DELETE) | PASS | "Stats reset: 15 questions cleared." (class `msg-success`); one `DELETE`, then `GET questions.php`; the button disabled with its tooltip; the line is still there 1.5 s later (the reload inside the reset happens before the line is shown, so the line is not wiped) |
| RT2 | It clears after a reload | PASS | success line shown, then the Reload path (`refreshData`): line hidden |
| RT3 | It clears after a filter change | PASS | the Category filter and, separately, the Points filter: line hidden both times |
| RT4 | It clears after a sort | PASS | a click on the Attempts header and, separately, on the % correct header: line hidden |
| RT5 | It clears after add, opening Edit, saving an edit and delete of a question (real API, "CR retest question for Team A?") | PASS | each of the four was started with a fresh success line ("Stats reset: 8 / 9 / 10 / 11 questions cleared."): after add (POST) null, after clicking Edit null, after saving the edit (PUT) null, after delete null; the list went back to 873 rows |
| RT6 | An error message stays | PASS | after a 500 ("Boom test") and after a 401 ("Login required to change content."), the red line stayed through a filter change (category and points), a sort and a reload; the next reset replaces it (error then success: "Stats reset: 2 questions cleared."; success then 503: the red 503 line) |
| RT7 | Cancel on the confirm | PASS | the exact confirm text was asked once; no DELETE; an existing line is left as it was |
| RT8 | Double-click guard | PASS | `click()` twice plus a `dblclick` with the DELETE held 800 ms: one confirm, one DELETE, the button disabled meanwhile and enabled afterwards; "Stats reset: 1 question cleared." |
| RT9 | Old `api/questions.php` (stats fields removed) | PASS | every row "-" / "-", the migration note shown, the button hidden, the hint row shown; three clicks on each sort header gave no error; back on the real list the button is visible and enabled, rows show "0", "1 / 100%" and "1 / 0%" again |
| RT10 | Layout after the fix, with the success line shown | PASS | 1024 px: page 1009/1009, `.table-wrap` 915/915, the button on the hint line; 1366 px: page 1351/1351, `.table-wrap` 1258/1258, the button on the hint line; the hint text is the same string as before; the success line shows at both widths |
| RT11 | Static and console | PASS | `node --check` passes; `js/admin.b5e5aba1.js` has 1503 CR and 1503 LF (all CRLF); no `innerHTML`; no script error from my listeners in any run and no console error |

**New totals: 59 checks, 56 PASS, 0 FAIL, 3 PENDING** (the 48 of the first run, with the 45 PASS unchanged, plus RT1 to RT11). The three PENDING items are unchanged: the hash after the commit (S10), the hosted deploy and smoke check (P1), and the owner's own browser (P2).

**BUG-CR-01: FIXED and verified.** The success line shows after a reset and disappears on the next reload, filter change, sort, or question add, edit or delete; an error stays until the next reset. No new bug.

Data restored as found at the start of this re-test: the real reset deleted the owner's 15 `question_stats` rows once and they were re-inserted from the start-of-run TSV (`diff` empty); all other resets were mocked; the temporary question (id 1727) was created, edited and deleted, and `AUTO_INCREMENT` of `questions` (moved to 1728) was set back to 1727. A new full `mysqldump` of the `brainrush` database is **identical** to the start-of-run dump; the 7 `logs/*.log` files are byte-identical (md5), no new log file. My server on 8012 was stopped (the owner's 8000 was never touched and is still listening), and the iframes, storage and service worker of `localhost:8012` were cleared.

## Verdict (after the re-test)

**READY FOR PO.** BUG-CR-01 is fixed; no other behaviour changed. 59 checks: 56 PASS, 0 FAIL, 3 PENDING (commit hash, hosted deploy, the owner's own browser).

## PO acceptance

**Change request "Reset all stats" (US-47): ACCEPTED** (PO, 2026-11-03).
- It meets the owner's request: the button sits on the "Check value" line. The design passes (56 PASS, 0 FAIL after the re-test): the admin-only DELETE (401, 403, 200 `{"deleted": N}`, 0 the second time, 503, 405), the public POST unchanged, the hidden, disabled, confirm, cancel, double-click, success and error states, keyboard use, and the layout at 1024 px (classic scrollbar) and 1366 px with BUG-11-01 still fixed. The live crash case (old `api/questions.php`) now shows "-" with the migration note and no error.
- BUG-CR-01 is fixed (see "Re-test (fix loop 1, BUG-CR-01)").
- Pending items: S10 (hash after the commit) and P2 (the owner's own browser) go to FU-45; P1 (hosted deploy and smoke check) goes to FU-46.
- The design and its limits are recorded as D-57 in `docs/product-backlog.md`: no undo beyond the confirm and a phpMyAdmin export, the error shown when the reload after a reset fails, and no DB, game or Privacy change. US-47 gains one criterion for the reset. FU-43 stays open, narrowed to a reset of one question.
- Informational items 1 to 4 need no action. The non-CR files in the working tree and the LF-only `.gitignore` lines are the owner's call at the commit (FU-45 step 6).

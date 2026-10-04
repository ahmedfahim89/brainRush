# Sprint 2 — Test Report (Admin page)

Tester: Senior Tester (game-tester). Date: 2026-10-04. Stories: US-18, US-19, US-20, US-21, US-22, US-23.

## Summary

**Environment:** Windows 11, Git Bash, XAMPP.
- PHP 8.0.30 CLI, MariaDB 10.4.
- Branch `sprint-2`.
- My own server: `C:/xampp/php/php.exe -S localhost:8001` from the project root, stopped afterwards. The server on port 8000 belongs to someone else and was left running.
- UI driven in the Browser pane (viewport 1024x768) on `http://localhost:8001/admin.html` and `/index.html`.
- `window.confirm` and `window.alert` were replaced by recorders so that confirm text could be read and XSS execution detected. A `window.onerror` / `unhandledrejection` collector recorded JS errors.

| Result | Count |
|---|---|
| PASS | 33 |
| FAIL | 0 |
| PENDING | 0 |

Bugs: 0 Critical, 0 Major, 1 Minor cosmetic (BUG-2-01, fixed and verified in the re-test at the end). No application code was modified. The DB was restored to seed state (see Cleanup).

## Static checks performed
- `php -l` (PHP 8.0.30) on all 7 files in `api/`: no syntax errors. No PHP file changed in Sprint 2.
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval(` and `new Function` in `js/`, `admin.html` and `index.html`: **0 code hits**. The only match is the comment on line 2 of `js/admin.js`. All DOM building goes through `createElement`, `textContent` and `setAttribute` (helper `h()`).
- String-concatenated SQL: none in the JS. The PHP is unchanged since Sprint 1, which already passed.
- Hard-coded board values: `js/admin.js` has no literal point values, category counts or timer values.
  - P, free slots, coverage columns and the playable status all come from the API.
  - Client range limits are read from the `min`/`max` attributes in `admin.html`.
  - The only literals are `maxLength: 100` on the rename input (D-14 name limit) and the input ranges themselves. Both are validation bounds, not board size.
- Credentials: no `password`, `secret`, `token`, `api key` or `mysql:` in `js/`, `admin.html`, `index.html` or `css/`.
- `git check-ignore -v api/config.php` shows `.gitignore:1`. `git ls-files` lists only `api/config.example.php`. I did not read `api/config.php`.
- The server log of the 8001 run had no PHP warnings, notices, deprecations or 500s.

## Acceptance criteria

| # | Story | Criterion | Result | Evidence |
|---|---|---|---|---|
| 1 | US-18 | Admin page load shows current settings | PASS | After a reload the fields showed 6 and 20, which were the persisted values at that time. The initial load showed 5 / 30. |
| 2 | US-18 | Valid values (1–10, 5–600) saved, success message, persist after reload | PASS | Saved 1/5, 10/600 and 6/20. Each showed "Settings saved." (class `msg-success`), and `GET settings.php` returned the same values. After a page reload the form showed 6/20 and the summary read "A game needs 6." |
| 3 | US-18 | Out-of-range or non-integer value shows an inline error and changes nothing | PASS | Inline error for cpg 0, 11, 2.5, -1, `1e1` and empty; timer 4, 601, 30.5, `abc` and empty. Both fields invalid gives two lines (CSS `white-space: pre-line`). `GET settings.php` was unchanged after every attempt. Server side by curl: PUT cpg 11 gives 400, timer 4 gives 400, cpg 2.5 gives 400. |
| 4 | US-19 | Point values listed ascending with usage counts | PASS | List 100,200,300,400,500 with "6 questions" each. After adding 1000 the list is 100…500,1000 with "0 questions" on 1000. |
| 5 | US-19 | New positive integer is added, appears in the list and as a new coverage column | PASS | Typed 1000 and pressed Enter. The message read "Point value 1000 added…". The coverage header became `100,200,300,400,500,1000,Filled` and the 1000 cell was `slot-empty` for all 6 categories, with Filled "5 / 6". |
| 6 | US-19 | Duplicate (409), 0, negative, non-integer, empty, over-limit give an inline error | PASS | `0`, `-5`, `2.5`, `abc`, empty and `1000001` give "Point value must be a whole number between 1 and 1000000.", and the list stays unchanged. A duplicate `100` gives "Point value 100 already exists" (409 from the API, shown inline). curl: POST 0 gives 400, -1 gives 400, 100 gives 409. |
| 7 | US-19 | Unused value deletes and disappears | PASS | Added 2000 and deleted it. The message was "Point value 2000 deleted." The list and the coverage header went back to 100…1000. The confirm text was "Delete point value 2000?". |
| 8 | US-19 | Used value delete blocked with an inline 409 error, nothing deleted | PASS | Delete 300 (cancelled): nothing sent. Delete 300 (confirmed): the red inline message was "Cannot delete 300: 6 question(s) still use it. Delete or move those questions first." The list still had 300 and the count was unchanged. The same was shown for 1000 once it was filled. curl: DELETE `id=1` gives 409, `id=999` gives 404. |
| 9 | US-20 | Each category shows "x / P" | PASS | `5 / 5` at seed. After adding 1000 it showed `5 / 6` with a "1 missing" badge. With 1000 filled it showed `6 / 6` and "Playable". |
| 10 | US-20 | Non-empty unique name added or renamed inline, list updates | PASS | Added "Team A". Renamed it to "Team B" with the Save button, and "team b" case-only with Enter. All were listed immediately, and the coverage and dropdowns updated. Renamed back to "Team A". |
| 11 | US-20 | Empty or duplicate name (case-insensitive) gives an inline error | PASS | Add: empty and whitespace give "Category name is required."; `geography` and `GEOGRAPHY  ` give `A category named "…" already exists` (409); 101 characters gives "Name must be at most 100 characters". Rename: duplicate gives the 409 inline and the input stays open with the draft intact; empty gives "Category name is required."; Escape cancels and clears the message. curl: empty gives 400, duplicate gives 409, rename of unknown id gives 404. |
| 12 | US-20 | Delete shows a confirm warning that questions are deleted; confirm removes, cancel changes nothing | PASS | Confirm text: `Delete category "Team A"? Its 6 questions will also be deleted. This cannot be undone.` Cancel (XSS category): it stayed and the question count stayed at 43. Confirm: the category was gone, the question count fell 42 → 36 for Team A, and the dropdowns updated. A category with 0 questions shows a short confirm without a warning. |
| 13 | US-21 | Category filter shows only that category's rows | PASS | Filter "Team A" shows 6 rows (100…1000, all Team A). "All categories" shows all of them. |
| 14 | US-21 | Add form's points dropdown lists only the category's free slots | PASS | With no category it reads "Choose a category first" and is disabled. For Team A it listed 100,200,300,400,500,1000. After each add it shrank by one (…200,… → 1000). When full it reads "No free slots - category is full" and is disabled. Submitting a full category gives the inline "no free point slot" error. |
| 15 | US-21 | Valid save adds the row, and counts and coverage update | PASS | Six Team A questions were added (messages "Question added (Team A - 100)" etc.). The table grew 30 → 36, the form text fields cleared, and the category count and coverage updated. Required fields: "Choose a category." / "Question is required." / "Answer is required." inline, and a whitespace-only question is rejected. |
| 16 | US-21 | Filled slot (stale form or direct API) gives the inline 409 "This category already has a N question" | PASS | I built the Geography form with 1000 selected, POSTed Geography/1000 directly (201), then submitted the form. The inline message was "This category already has a 1000 question", the form kept its text, and the dropdown refreshed to "No free slots". curl POST to an occupied slot gives 409 with the same message. |
| 17 | US-21 | Edit persists, including moving to a free slot; moving to an occupied slot gives 409 | PASS | Edit loaded category, points, question and answer. The title read "Edit question (Team A - 100)" and the button "Save changes". Edit text persisted and the form returned to Add mode. Moved Team A 500 to 1000 (dropdown `500,1000`): it persisted, and the table and coverage updated. Moved Team A 200 to a slot occupied meanwhile via the API (500): the inline "This category already has a 500 question" appeared, the form stayed in edit mode with its values kept, and the dropdown refreshed to `200`. |
| 18 | US-21 | Delete with confirm removes the question | PASS | Cancel kept it (confirm text `Delete the 1000 question of "Team A"?`). Confirm gave "Question deleted (Team A - 1000)", the row disappeared, and Team A coverage went to 5 / 6. 404 on a stale delete is covered in row 21. |
| 19 | US-22 | Coverage grid marks each cell filled or empty | PASS | Categories x points, ascending, with a "Filled x / P" column. Filled: green with a check. Empty: dark with a dashed border and a dash (screenshot). Each cell has an `aria-label` / title "<cat> - <points>: filled/empty". Clicking an empty cell prefills the Add form (Science, 1000). Clicking a filled cell opens Edit. The grid refreshed after every change. |
| 20 | US-22 | A new point value gives a new empty column for every category, and those categories are no longer playable | PASS | After adding 1000: 6 `slot-empty` cells in the new column. `GET categories.php?playable=1` returned `[]`, and the summary read "0 of 6 categories are playable… A game needs 6." (status badges "1 missing"). After filling Geography 1000 only Geography (+ Team A) were playable. After filling all, 6/6 were playable. |
| 21 | US-23 | Every API validation / 409 / 404 error is shown inline in its panel, with no raw JSON or stack trace | PASS | Settings, Point values, Categories and Questions each use their own message area, and every error above appeared there. I simulated failures by stubbing `fetch`: a non-JSON 500 HTML body with a fake stack trace gives "Request failed (HTTP 500)."; a network failure gives "Could not reach the server. Check that it is running."; `{"error":"Internal server error"}` gives that text; a 400 JSON body without `error` gives "Request failed (HTTP 400)." No raw body reached the page. Stale 404: a category deleted behind the UI's back then clicked gives "Category not found" and the list reloads. |
| 22 | US-23 | A page-load failure is visible | PASS | I served a copy of `admin.html`, `js/` and `css/` without `api/` on a temporary port. The page showed "Could not load admin data: Request failed (HTTP 404)." (global banner) and "Could not load settings: Request failed (HTTP 404)." No JS exception. The temporary server and files were removed. |
| 23 | US-23 | Admin has a link back to the game, and the game page links to admin | PASS | Clicking "← Back to the game" opened `/index.html`. Clicking "Admin" on `index.html` opened `/admin.html`. |
| 24 | Focus | Spec step 3: add a category, fill all slots, duplicate gives 409 inline, edit and delete a question, delete a category | PASS | Rows 10, 14–18 and 12 together, run on "Team A" with 6 slots. |
| 25 | Focus | Settings range errors | PASS | Row 3. |
| 26 | Focus | Adding 1000 gives a new empty coverage column and the category is no longer playable; fill it for 6 categories | PASS | Rows 5 and 20. I then filled 1000 for all 6 seed categories through the form. `playable=1` returned all 6, and Filled read 6 / 6. |
| 27 | Focus | Deleting a used point value is blocked inline | PASS | Row 8. |
| 28 | Focus | XSS `<img src=x onerror=alert(1)>` as category, question and answer renders as text | PASS | I created the payload as a category name, then as question and answer (on Team A and on the payload category). It showed as literal text in the category table, coverage row header, both category dropdowns, the questions table (category, question and answer cells), the success messages, `aria-label`s and the delete confirm text. After every step: `document.querySelectorAll('img').length` was 0, the `alert` recorder was empty and the error collector was empty. |
| 29 | Focus | No `innerHTML` with data in `js/admin.js` | PASS | Static grep, 0 code hits. |
| 30 | Focus | Browser console free of JS errors | PASS | `window.onerror` and `unhandledrejection` collected 0 errors across the whole session, with no uncaught exceptions on load or on any action. The console showed only the browser's own "Failed to load resource" lines for deliberate 4xx responses (400, 404, 409 provoked by the tests) and a Chrome warning for a non-numeric value I set programmatically into a number input. Neither is an application defect. |
| 31 | DoD 2 | `php -l` passes on all PHP | PASS | 7 / 7 files. |
| 32 | DoD 5 | `api/config.php` git-ignored and untracked, no credentials in the front end | PASS | See Static checks. |
| 33 | DoD 1 | No hard-coded board size, points or timer in `js/admin.js` | PASS | See Static checks. The UI also showed the correct 6-column board when P changed to 6 and back. |

## Runtime test notes
- The API smoke suite (17 curl calls, status codes and exact messages) confirmed the contracts the UI depends on: 400, 404, 405 and 409 for settings, points, categories and questions. The full API suite stays in `sprint-1-test-report.md`, since the API is unchanged.
- The UI was driven with a mix of real pointer and keyboard actions (typing 1000, pressing Enter, clicking the link) and scripted DOM events on the real controls (button `click()`, input `value` plus `change`/`input`/`keydown`). Programmatic `maxlength` bypass was used to send a 101-character name, so the server's 400 message was shown inline.
- The server on port 8000 stayed up throughout and was never touched.

## Cleanup
- All test data was removed through the admin UI. Verified by API afterwards:
  - settings `categories_per_game=5`, `timer_seconds=30`
  - point values 100, 200, 300, 400, 500 (6 questions per value)
  - 6 categories (Geography, History, Movies, Science, Sports, Technology), 5 questions each, 30 questions total
  - `playable=1` returns all 6
- The categories "Team A", "Team C", "Stale Cat" and the XSS-named category, plus point values 1000 and 2000, are gone.
- Auto-increment counters advanced (for example the next category id is above 13). This is harmless.
- My server on port 8001 and the temporary server on 8003 were stopped. The temporary docroot was deleted. Port 8000 is untouched.

## Bugs

### BUG-2-01: Category names wrap mid-word in the questions table at 1024 px (Minor, cosmetic) - FIXED, verified in re-test
- **Where:** `css/style.css:184` (`.data-table td.name-cell { overflow-wrap: anywhere; }`) in combination with the wide `text-cell` columns (line 178).
- **Steps:** Open `/admin.html` at 1024 px width with the seed data and look at the Questions table.
- **Expected:** Category names such as "Technology" stay on one line, and long text wraps in the question/answer columns.
- **Actual:** The Category column collapses and breaks words mid-word ("Technolog" / "y"). `overflow-wrap: anywhere` lets the table shrink that column to almost nothing.
- **Impact:** Readability only. No function is affected, and the full name is available (the coverage grid shows a tooltip). A possible fix is `overflow-wrap: break-word` with `min-width` on the name column. This is not blocking.

### Observations (not bugs)
- **O-1:** After cancelling a delete confirm, the previous success or error message in that panel stays visible, as the cancel does not clear it. This is harmless.
- **O-2:** Deleting a point value asks for a confirm, although the story does not require it (documented developer deviation). This is accepted.
- **O-3:** The admin page assumes the 1024 px layout. Narrower than about 800 px the tables scroll horizontally inside `.table-wrap`. I did not test mobile widths.
- **O-4:** `X-Powered-By: PHP/8.0.30` is still sent (PHP setting `expose_php`), as noted in Sprint 1 (O-4).
- **O-5:** (found in the re-test) The `.msg` success/error line does not wrap a very long unbroken category name, so the page can scroll horizontally by a few dozen pixels. Suggested fix: `overflow-wrap: anywhere` on `.msg`. Not blocking.

## Verdict

**READY FOR PO.**
- All 33 Sprint 2 checks pass at runtime on PHP 8.0.30 and MariaDB 10.4 (US-18, US-19, US-20, US-21, US-22, US-23).
- No open Critical, Major or Minor bugs. BUG-2-01 was fixed and verified in the re-test below.
- No checks remain PENDING.

## Re-test: BUG-2-01 (fix: `css/style.css:185`)

**Result: FIXED / VERIFIED.** Fix under test: `.data-table td.name-cell { min-width: 9rem; overflow-wrap: anywhere; }`.

- **Environment:** my own `php -S localhost:8001` (PHP 8.0.30), browser at 1024 px width, seed data. I stopped that server afterwards. Port 8000 was not touched.
- **Questions table:** all 30 Category cells (for example "Technology") render on one line (measured: 1 line per cell, column about 153 px wide). Question text still wraps (23 of 60 text cells span two lines). Answers are unaffected.
- **Categories table and coverage grid:** no visual regression. With seed data the page has no horizontal overflow (scrollWidth 1009 = clientWidth).
- **Stress test:** I added a 100-character unbroken category name through the admin UI. It wraps inside its own cell (556 px wide, 2 lines) and the table stays within its panel. The page scrolled horizontally by about 70 px, but only because of the success message "Category ... added.", whose `.msg` element has `overflow-wrap: normal`. Without the message the page does not overflow. This is not caused by the fix and is tracked as O-5.
- **Console and server log:** no JS errors from the page load. The tab's console buffer still held 409/400/404 entries from the earlier test session. The 8001 server log for this run showed no 4xx/5xx except `/favicon.ico` (404), and no PHP warnings.
- **Cleanup:** the test category was deleted through the admin UI. `GET /api/categories.php` returns the 6 seed categories with 5 questions each, so the DB is at seed state.

## Product Owner acceptance

Product Owner, 2026-10-04. Basis: `docs/sprint-plan.md` (Sprint 2 + DoD), `docs/sprints/sprint-2-dev.md` (incl. Fixes), this report (incl. Re-test), spot-check of `admin.html`, `js/admin.js`, `css/style.css`.

| Story | Decision | Reason |
|---|---|---|
| US-18 Admin settings | **ACCEPTED** | Rows 1-3: current values load; 1/5, 10/600, 6/20 save with "Settings saved." and persist after reload; out-of-range/non-integer values give an inline error and change nothing (client and server, 400). |
| US-19 Manage point values | **ACCEPTED** | Rows 4-8: ascending list; 1000 added and appears as a new empty coverage column; 0/negative/non-integer/over-limit/duplicate (409) give inline errors; unused value deleted; used value blocked with inline 409 and nothing deleted. |
| US-20 Manage categories | **ACCEPTED** | Rows 9-12: "x / P" count follows P; add and inline rename update the list; empty and case-insensitive duplicate (409) give inline errors; delete confirm warns about the questions, Confirm removes them, Cancel changes nothing. |
| US-21 Manage questions | **ACCEPTED** | Rows 13-18: filter shows only that category; Add dropdown lists only free slots; valid save updates table, counts and coverage; stale-form/direct-API duplicate gives the exact 409 "This category already has a N question" inline; edit persists incl. a move to a free slot, move to an occupied slot gives 409; delete with confirm. |
| US-22 Coverage grid | **ACCEPTED** | Rows 19-20, 26: filled/empty cells clearly marked (color + symbol + label, not color alone); adding 1000 adds an empty column for every category and `playable=1` drops them until filled. |
| US-23 Admin usability | **ACCEPTED** | Rows 21-23: every validation/404/409 error is shown inline in its own panel; non-JSON 500, network failure and load failure show readable messages with no raw JSON or trace; links admin → game and game → admin work. |

Rulings on the developer's deviations:
- **Confirm on point-value delete:** accepted. It is consistent with category/question deletes, and a confirmed delete of a used value still reaches the API and shows the 409, so US-19 is fully met. Recorded as **D-18**.
- **Clickable coverage cells:** accepted. They only prefill the Add/Edit form and never write by themselves (covered by D-18).
- **Client-side category filtering:** accepted. US-21 specifies what the table shows, not how the data is fetched. The full list is needed anyway for free slots and coverage, and the data set is small. `?category_id=` stays available in the API.
- **Client-side range checks:** accepted. The limits are written once (`min`/`max` in `admin.html`), the server stays authoritative (verified 400s in row 3), and the labels are friendlier. These are validation bounds, not hard-coded board size (DoD 1 met).

Rulings on observations:
- **O-1** (old message stays after cancelling a delete): accepted as is. Harmless; nothing is sent.
- **O-2** (confirm on point delete): accepted, see D-18.
- **O-3** (admin designed for ≥ 1024 px, tables scroll inside `.table-wrap` below about 800 px): accepted as is. Recorded as **D-19** (admin is a desktop tool; mobile out of scope).
- **O-4** (`X-Powered-By` header): accepted as is. It is server configuration, already accepted in Sprint 1. Follow-up: the final README (Sprint 4, task 10) should recommend `expose_php=Off` as hosting hardening.
- **O-5** (`.msg` does not wrap a very long unbroken name, so the page scrolls by about 70 px): accepted as non-blocking (cosmetic, needs a 100-character unbroken name). Follow-up under **D-19**: add `overflow-wrap: anywhere` to `.msg` with the Sprint 4 CSS work (task 8). The tester re-checks it in Sprint 4.

Notes:
- BUG-2-01 (Minor, cosmetic) fixed and verified; no open Critical/Major/Minor bugs. All 33 checks pass at runtime on PHP 8.0.30 / MariaDB 10.4 with nothing PENDING. DoD 1-7 met; this section covers DoD 8.
- The XSS payload already renders as text across the whole admin UI (row 28). This is early evidence for US-27, which stays scheduled for acceptance in Sprint 4 once the game UI exists.
- Backlog updated: decisions **D-18** and **D-19** added. No new stories.

**Sprint 2: ACCEPTED.**

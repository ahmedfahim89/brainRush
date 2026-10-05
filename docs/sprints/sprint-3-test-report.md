# Sprint 3 - Test Report (Game setup and dynamic board)

Tester: Senior Tester (game-tester). Date: 2026-10-05. Stories: US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-09.

## Summary

**Environment:** Windows 11, Git Bash, XAMPP.
- PHP 8.0.30 CLI and MariaDB 10.4 (local `mysqld`, listening on 3306; it did not crash or hang during this session).
- Branch `sprint-3`, uncommitted working tree (`index.html` and `css/style.css` modified, `js/game.js` and the dev note new).
- Server: `C:/xampp/php/php.exe -S localhost:8000` from the project root. Port 8000 was not in use, so I started it and stopped it afterwards. A second temporary server on 8003 (no `api/`) was used for the load-failure test and also stopped; its temp dir was deleted.
- UI driven in the in-app Browser pane on `http://localhost:8000/` and `/admin.html`. The pane's viewport is small (about 800x455), so layout checks at 375, 1024, 1280, 1366 and 1920 px were done with same-origin iframes of those widths and measured with `getBoundingClientRect`. Screenshots of the board were taken at the pane size. `window.confirm` and `window.alert` were replaced by recorders, and `error` / `unhandledrejection` collectors recorded JS errors.
- Admin writes were accepted from localhost without credentials, so test data was created with `curl` and through the admin UI.

| Result | Count |
|---|---|
| PASS | 44 |
| FAIL | 0 |
| PENDING | 0 |
| Observations (non-blocking) | 4 |

Bugs: 0 Critical, 0 Major, 0 Minor, 0 Cosmetic. No application code was modified. The DB was restored to seed state (see Cleanup).

## Static checks

- `php -l` (PHP 8.0.30) on all 8 files in `api/` (`auth`, `categories`, `config.example`, `config`, `db`, `points`, `questions`, `settings`): no syntax errors. No PHP file changed in Sprint 3 (`git diff` touches only `css/style.css` and `index.html`; `js/game.js` is new).
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval(` and `new Function` in `js/*.js`, `index.html` and `admin.html`: the only hits are the comments on `js/game.js:4` and `js/admin.js:2`. All DOM building in `game.js` goes through `createElement` / `textContent` / `setAttribute` (helper `h()`, line 77).
- Network use in `js/game.js`: a single `fetch` (line 130) in `apiGet()`, with no `method`, body or XHR. The page therefore uses GET only. The three endpoints called are `settings.php`, `categories.php?playable=1` and `questions.php?board=1&categories=<ids>`.
- Hard-coded board values: no literal board size, point value or timer in `game.js`. Columns, rows, labels, N and the default timer come from the API. The remaining literals are spec-defined or UI limits: the mode limits 6 / 4 (`MODES`, lines 16-19, US-01), the 6-color palette (US-03), `NAME_MAX = 30` (see O-3), and the timer range, which is read from the `min="5" max="600"` attributes in `index.html:51` (single source).
- Credentials: no `password`, `secret`, `token`, `api key` or `mysql:` in `js/game.js`, `index.html` or `css/style.css`.
- `git check-ignore -v api/config.php` shows `.gitignore:1`. `git ls-files api` lists `config.example.php` and no `config.php`. I did not read `api/config.php` or `password.txt`.
- The server log for the run (`php -S` output) had no PHP warnings, notices, deprecations or 5xx responses. The only 4xx is `GET /favicon.ico` (404), which is not an application defect.

## Acceptance criteria

All rows were run at runtime on PHP 8.0.30 / MariaDB 10.4. "Real data" means real API responses; "injected" means a saved game written to `localStorage` to reach a board the seed data cannot produce.

| # | Story | Criterion | Result | Evidence |
|---|---|---|---|---|
| 1 | US-01 | Setup loads with Players selected by default and one empty name input | PASS | Fresh load: radio `players` checked, 1 entry row with empty input, "Remove" disabled, Setup visible and Board hidden, labels "Players (max 6)" / "Teams (max 4)". |
| 2 | US-01 | Players mode: at most 6 inputs, "Add" disabled at 6 | PASS | Clicked Add 8 times: exactly 6 rows, Add disabled. No 7th input can be created. |
| 3 | US-01 | Teams mode: at most 4 inputs, "Add" disabled at 4 | PASS | Teams with 4 entries: Add disabled, button reads "Add team", rows labelled "Team 1..". |
| 4 | US-01 | 5-6 names, switch to Teams: Start blocked with "Teams mode allows at most 4 teams" until extras removed (D-07) | PASS | 6 names then Teams: all 6 kept, message "Teams mode allows at most 4 teams. Remove 2 to continue.", Start and Add disabled. After removing one: "Remove 1 to continue.", Start still disabled. At 4 entries: message hidden, Start enabled. Switching back to Players re-enables Add. Names and colors preserved. |
| 5 | US-02 | Add shows a new input up to the limit; Remove removes it; at least 1 always remains | PASS | Removed entries down to 1: the last Remove button was disabled. Remove on a middle entry kept the others in order. |
| 6 | US-02 | Empty or whitespace-only name: no start, inline "Name is required" on that entry | PASS | Entry with `"   "`: error `Name is required` on that entry only, plus the form-level "The game cannot start yet..." message, focus moved to the entry, Setup stayed. Typing in the entry clears its error. |
| 7 | US-02 | Same name ignoring case and spaces ("Ann" and " ann "): no start, "Names must be unique" | PASS | Both entries showed "Names must be unique"; the game did not start. After changing the second to "Bob" it started. Stored names are trimmed. |
| 8 | US-02 | HTML in a name is rendered as literal text anywhere | PASS | Team names `<img src=x onerror=alert(1)>` and `<b>x</b>` (Teams mode): scoreboard text, `aria-label`s and the saved state show the literal strings. `document.querySelectorAll('img').length` = 0, no `<b>` inside `.score-name`, the alert recorder was empty, the error collector was empty. |
| 9 | US-03 | Entries auto-assigned distinct colors from a 6-color palette, shown as swatches | PASS | 6 entries gave 6 distinct colors (red, blue, green, orange, purple, cyan). Each row has a swatch button with a title and `aria-label`. |
| 10 | US-03 | Clicking a swatch moves to the next palette color not used by another entry; always distinct | PASS | With 4 entries (red, green, orange, blue): click 1 gave purple (skipping the used blue/green/orange), click 2 gave cyan, click 3 wrapped to red. Always 4 distinct colors. With all 6 taken, clicking changes nothing. |
| 11 | US-03 | Freed color is available again after Remove | PASS | Removed the entry holding blue, then clicked Add: the new entry got blue. |
| 12 | US-04 | Checklist shows only playable categories and the text "Select N categories" (N from settings) | PASS | Seed (N=5): legend "Select 5 categories", 6 playable categories listed. With N set to 6 via the API: "Select 6 categories". With only 4 categories having a 1000 question, the checklist listed exactly those 4 (the others disappeared). |
| 13 | US-04 | Fewer or more than N checked: no start, error says exactly N must be selected | PASS | 0, 3 and 6 ticked (N=5): "Select exactly 5 categories (k selected)." and Setup stayed. Unticking/ticking clears the error. 5 ticked starts. (N=6 with 5 ticked also blocked: "Select exactly 6 categories (5 selected).") |
| 14 | US-04 | Fewer than N playable: "Not enough playable categories - add questions in Admin" with link to `admin.html`, Start disabled (D-11) | PASS | Point value 1000 added with no questions: 0 playable, and with 4 of 6 filled: 4 playable. Both showed "Not enough playable categories - add questions in Admin. A game needs 5; k are playable..." with an "Admin" link to `admin.html`, and Start disabled. The em dash is rendered as in the story. |
| 15 | US-04 | Selection order drives the column order (story US-07 depends on it) | PASS | Ticked Movies, Geography, History, then Science, Sports: badges 1-5 shown, and the board header was Movies, Geography, History, Science, Sports. |
| 16 | US-05 | Timer field pre-filled from settings (30) | PASS | Fresh load: `#timer-input` = 30. |
| 17 | US-05 | Value outside 5-600 or non-integer: no start, inline error | PASS | Rejected with "Timer must be a whole number of seconds between 5 and 600.": 4, 601, 12.5, empty, -5, 1e2, abc. Accepted: 5, 600, 20. The error clears on typing. |
| 18 | US-05 | Override is used for the game, admin setting unchanged | PASS | Entered 20: board info "Timer 20 s", saved `timerSeconds` = 20. `GET settings.php` still returned `timer_seconds` 30. Boundary 5 also started (info "Timer 5 s"). (Per-question countdown itself is Sprint 4.) |
| 19 | US-06 | Valid setup: calls `questions.php?board=1&categories=<ids>` and shows the Board with all contestants at 0 | PASS | Board appeared, scoreboard "Ann ... 0", "Bob ... 0". Server log shows `GET /api/questions.php?board=1&categories=...`. Board data and state saved to `localStorage["brainrush.game"]`. |
| 20 | US-06 | API failure: error shown, host stays on Setup with inputs intact | PASS | `fetch` stubbed to return: network error, 400 JSON, 500 HTML with a fake stack trace/path, 200 non-JSON, JSON 500 without `error`, and a payload with the wrong ids. Each gave "Could not start the game: ..." (API text or "Request failed (HTTP 500)." / "The server sent an unexpected response/board."), Setup stayed, names, colors, 6 ticked categories and the timer value were unchanged, button back to "Start Game" and enabled. The fake path/trace never appeared. Real failure: deleted a question after Setup loaded, then Start gave `Could not start the game: Category "Technology" is missing questions for: 1000` with everything intact and no game saved. |
| 21 | US-07 | Header = N category names in selection order; P rows labelled with point values ascending | PASS | Real data: header Geography...Technology in tick order, rows 100,200,300,400,500,1000 (and later ...,10000). All labels come from the payload. |
| 22 | US-07 | N=6, points 100-500 + 1000: 6 columns x 6 rows | PASS | Real flow with N=6 and point 1000 (6 questions filled): board info "6 x 6 board", `--cols` = 6, 36 cells, 6 header cells, last row 1000. Seed (N=5): 25 cells, 5 columns. |
| 23 | US-07 | 10000 label fits in the cell without overflow or wrapping | PASS | Real data (6 cols x 7 rows incl. 10000) at 1024 and 1280 px, and injected boards: 6 cols at 1024, 5 cols at 1920, 10 cols at 1024 and 1366, 6 and 10 cols at 375, 1000000 label at 1024, 1 column. In every case the label box lies inside its cell, renders on one line, font scales (44 px at 1280/6 cols down to 22 px at 1024/10 cols), and the page has no horizontal scroll. A 60-character unbroken category name did not widen its column or the page. |
| 24 | US-09 | Strip lists every contestant in their color with name and score; negative scores with a minus sign | PASS | Cards use the setup colors with readable ink (white on red/blue/purple, dark on green/orange/cyan). Score -100 shown as "−100" (U+2212); a 30-character unbroken name and "−1234567" stay inside their cards at 1024 and 375 px. |
| 25 | US-09 | "+" / "-" change the score by the smallest point value; no cell color changes | PASS | Step 100 (board info "Corrections ±100"). Two minus: "−200", one plus: "−100". `aria-label` "Subtract 100 points from Ann", title "+100". The board cells' classes/styles were identical before and after. The new score is written to `localStorage`. |
| 26 | Focus | 7 players / 5 teams blocked | PASS | See rows 2 and 4. |
| 27 | Focus | Mode switch with 5-6 names | PASS | See row 4 (6 names and 5 names). |
| 28 | Focus | Empty / duplicate names | PASS | See rows 6-7. |
| 29 | Focus | Color distinctness and cycling | PASS | See rows 9-11. |
| 30 | Focus | Exactly-N rule | PASS | See row 13. |
| 31 | Focus | Not-enough-playable path | PASS | See row 14. Created by adding point value 1000 (no playable category), then filling 4 of 6, then all 6. |
| 32 | Focus | Timer validation | PASS | See rows 17-18. |
| 33 | Focus | 5x5 and 6x6 (with 1000) boards | PASS | See rows 21-22. |
| 34 | Focus | 10000 label fits | PASS | See row 23. |
| 35 | Focus | Manual +/- step | PASS | See row 25. |
| 36 | Focus | XSS name rendered as text | PASS | See row 8. |
| 37 | Focus | API failure on Start | PASS | See row 20. |
| 38 | Focus (enabler for US-17) | `saveState()` / `loadState()`: valid saved game restores to Board; corrupt or invalid data discarded, Setup shown with no JS error | PASS | Reload on the board restored header order, contestants, scores (including negative) and timer. 14 corrupt variants were each discarded (key removed) and Setup shown: bad JSON, `[]`, `null`, a string, `mode` = `__proto__`, string score, descending points, wrong version, `screen` = setup, duplicate colors, timer 3, 5 teams, a missing question, whitespace-only name. A valid game with `screen` = question/results restores to Board (acceptable for Sprint 3; full restore is Sprint 4). No console errors. |
| 39 | Dev deviation | "Quit to setup" with confirm | PASS | Cancel keeps the game and storage. Confirm clears storage and shows an empty Setup (1 empty entry, current settings reloaded). The confirm text is plain. |
| 40 | Load failure | Setup data cannot be loaded | PASS | Temporary server without `api/`: "Could not load the game setup: Request failed (HTTP 404). Try again" with a retry button, Start disabled, no JS exception. |
| 41 | DoD 2 | `php -l` passes on all PHP | PASS | 8 / 8 files. |
| 42 | DoD 4 | No `innerHTML` with data in `js/game.js` | PASS | See Static checks. |
| 43 | DoD 1 | No hard-coded board size, points or timer; game uses GET only; `admin.html` still works | PASS | See Static checks. `admin.html` (unchanged): loaded 5/30 then the Sprint 3 test data, added/removed point values, deleted two point values through the UI (confirm text "Delete point value 10000?" / "...1000?"), saved settings ("Settings saved."), coverage grid refreshed to 100-500. No JS errors. |
| 44 | DoD (console) | Browser console free of JS errors | PASS | `window.onerror` / `unhandledrejection` collected 0 errors on `index.html` and `admin.html` across the whole session. The console showed only (a) Chrome warnings for the non-numeric values I set programmatically into the number input ("abc", " 20 ") and (b) "Failed to load resource" 404 lines for the deliberate missing-`api/` test. None is an application defect. |

## Review of the developer's deviations and open points

None of them conflicts with an acceptance criterion.

| Item in the dev note | Assessment |
|---|---|
| "Quit to setup" button with confirm (not in any story) | No conflict. It behaves like D-15 and gives the host a way out until Sprint 4 adds End Game / New Game. Sprint 4 should decide whether to keep it (see O-2). |
| Setup form not persisted | No conflict. US-01 and US-05 describe the defaults on load, and US-17 only restores a started game. |
| Over-limit and not-enough-playable disable Start outright | Matches US-01 ("blocked with a message") and US-04 ("Start is disabled"). |
| Name max length 30 | Not in the spec or backlog; no conflict, but see O-3. |
| Corrections step from the loaded board's smallest point (D-12) | Consistent with D-05 and D-12. |
| Cell click shows a notice | Fine for Sprint 3 (US-11 is Sprint 4). |
| Saved game on `question`/`results` screens restores to Board | Fine for Sprint 3. Sprint 4 must replace it (US-17: question reopens with timer restarted, Results restored). |
| Known limitation: checklist not refreshed after a 400 on Start | Behaves as US-06 requires (error + inputs intact). Row 20 confirmed the 400 text is shown; the host must reload to refresh the list. Non-blocking. |
| Environment incident (MariaDB died / InnoDB hang) | I could not reproduce it: MariaDB was already running, answered all queries promptly and did not hang over about 100 writes and reads. I did not stop or restart it. The developer's recommendation (restart from the XAMPP control panel; check antivirus on `C:\xampp\mysql\data`) stands. |

## Observations (not bugs)

- **O-1:** `css/style.css` `.board` declares fallback custom properties `--cols: 5; --digits: 3;`. JS always overrides them inline (verified for 1, 5, 6 and 10 columns), so they never take effect. They look like hard-coded board values in a quick grep but are only defaults for an empty grid. Consider removing them for clarity.
- **O-2:** A saved game restores straight to the Board, and the only way out is "Quit to setup" (which loses the game). This is intended for Sprint 3; Sprint 4's End Game / New Game flow should revisit the Quit button so a host cannot discard a game by accident (the confirm helps).
- **O-3:** The 30-character name limit is enforced only by the input's `maxlength`, and `loadState()` does not check name length. It is client state only, so nothing server side is affected. The limit is not in the backlog; the PO may want to record it as a decision.
- **O-4:** The Browser pane is about 800x455, so full-size screenshots of the board are limited. Layout was verified by measurement in 375-1920 px iframes. A final visual check at a real laptop/projector size is suggested for the PO's acceptance review.

## Cleanup

Test data created through the API / admin UI and then removed:
- point values 1000 and 10000 (deleted through the admin UI with confirm),
- 12 test questions (Test Q n 1000 / 10000), deleted through the API,
- `categories_per_game` set to 6 for the 6x6 tests, set back to 5 through the admin UI.

Verified by API afterwards:
- settings `categories_per_game=5`, `timer_seconds=30`,
- point values 100, 200, 300, 400, 500 (6 questions each),
- 6 categories (Geography, History, Movies, Science, Sports, Technology) with 5 questions each (30 total), `playable=1` returns all 6.

Auto-increment counters advanced (harmless). Browser `localStorage["brainrush.game"]` was cleared. My server on port 8000 and the temporary server on 8003 were stopped, and the temp docroot was deleted. No git command that modifies anything was run. The working tree is unchanged by testing (only this report is added).

## Bugs

None found.

## Verdict

**READY FOR PO.**
- 44 / 44 checks pass at runtime on PHP 8.0.30 and MariaDB 10.4 (US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-09).
- No open Critical, Major, Minor or Cosmetic bugs; nothing PENDING or blocked.
- Four non-blocking observations are listed above for the PO / Sprint 4.

## Product Owner acceptance

Date: 2026-10-05. Inputs: backlog, sprint plan (Sprint 3 + DoD), dev note, this report. I spot-checked `js/game.js` (name validation, Start flow, board grid, step size, Quit), `index.html` and `css/style.css`.

| Story | Verdict | Reason |
|---|---|---|
| US-01 Choose play mode | ACCEPTED | Rows 1-4: defaults, 6 / 4 limits, D-07 blocking message keeps the entries. |
| US-02 Enter contestant names | ACCEPTED | Rows 5-8: min 1 entry, "Name is required", "Names must be unique" (trimmed, case-insensitive, D-02), HTML shown as text. |
| US-03 Distinct contestant colors | ACCEPTED | Rows 9-11: 6 distinct colors, cycling skips used colors, freed colors are reused. |
| US-04 Pick categories | ACCEPTED | Rows 12-15: playable-only list, "Select N categories", exactly-N error, D-11 message + Admin link + Start disabled. |
| US-05 Set timer for this game | ACCEPTED | Rows 16-18: pre-filled, 5-600 integer check, override kept in game state only, admin setting unchanged. The countdown using it is checked in Sprint 4 (US-12). |
| US-06 Start game | ACCEPTED | Rows 19-20: board endpoint called with ids in tick order, scores start at 0, every failure keeps Setup and inputs as they were with no raw body shown. |
| US-07 Dynamic board grid | ACCEPTED | Rows 21-23: header follows selection order, rows ascending, 5x5 and 6x6 from real data, 10000 (and 1000000) labels fit on one line from 375 to 1920 px. |
| US-09 Scoreboard and manual adjustment | ACCEPTED | Rows 24-25: cards in contestant colors, U+2212 minus, step = smallest board point (D-05, D-12), cells untouched. |

DoD 1-7 met (no hard-coded board size, points or timer; `php -l` clean; no `innerHTML` with data; `config.php` and `password.txt` ignored and untracked; 0 open bugs; dev note present). DoD 8: met by this section.

**Rulings on developer deviations**
1. "Quit to setup": kept for Sprint 3 only, **removed in Sprint 4** once End Game / New Game exist (D-21).
2. Name max 30 characters: **accepted as a business rule** (D-22). Restore must also reject longer names.
3. Start disabled outright for over-limit / not-enough-playable, other errors on click: **accepted** (D-23).
4. Setup form not saved across refresh: **accepted** (D-24).
5. Cell-click placeholder notice: **accepted for Sprint 3 only**. US-11 replaces it in Sprint 4 (no decision needed).
- Saved game on the question or results screen restores to the Board: accepted for Sprint 3. US-17 replaces this in Sprint 4.
- Checklist not refreshed after a 400 on Start: accepted as is. US-06 is met and a reload refreshes the list.

**Observations -> Sprint 4 follow-ups**
- O-1: remove the unused `--cols: 5; --digits: 3;` fallbacks from `.board` (with the Sprint 4 CSS task). Could.
- O-2: covered by D-21. Remove the Quit button when End Game ships, and check that no path discards a game without a confirm. Must, part of US-10.
- O-3: covered by D-22. `loadState()` rejects names that are empty after trimming or longer than 30 characters. Should, part of US-17.
- O-4: tester does a full-screen visual check of Setup, Board, Question and Results at 1366x768 and 1920x1080 (laptop/projector). Should. Not blocking for Sprint 3, because the layout was measured at 375-1920 px.
- Extra (PO): `password.txt` sits in the project root, which is the web root. It is git-ignored, but `docs/deploy-hostinger.md` must list it as never uploaded, and the hosted smoke test must confirm `/password.txt` returns 403/404 (US-29). Must.

**Sprint 3 verdict: ACCEPTED (8 / 8 stories).**

# US-58 Daily Crossword: test report

Branch `crossword` (uncommitted), tested 2026-11-20 by the senior tester against `docs/product-backlog.md` (Epic E19, US-58, D-72) and `docs/sprints/us-58-dev.md`. No application code was changed.

## Summary

**Environment:** Windows 11, PHP 8.0.30 (XAMPP, `php -S localhost:8011` from the repo root, stopped at the end), MariaDB on 3306 (local DB `brainrush`), Chrome via Playwright (repo `node_modules`, system Chrome channel). The owner's server on :8000 was not running and was not touched. The local config has no admin credentials, so the admin writes ran on the localhost path. `api/config.php` and `InternalUse/` were not read.

| Area | PASS | FAIL | PENDING |
|---|---|---|---|
| Acceptance criteria (table below, 49 rows) | 46 | 0 | 3 |
| Static checks (5 rows) | 5 | 0 | 0 |
| Scripted browser run (99 checks, 97 first pass; 2 regression lines were a test-script bug, re-run PASS) | 99 | 0 | 0 |
| Admin checkbox script | 6 | 0 | 0 |
| Grid rules, CLI over 420 dates (+ 60 distinct-date check, cleaning examples) | all | 0 | 0 |

**Bugs:** 0 Critical, 0 Major, 3 Minor (BUG-58-01, BUG-58-02, BUG-58-03).

**Verdict: READY FOR PO.** The story meets every acceptance criterion that could be run here. The three Minor items are cosmetic or documentation fixes and do not block acceptance. The PENDING rows need the owner or a device (phone share sheet, exact 13×13 layout, independent WCAG measurement).

Before go-live, move `CROSSWORD_LAUNCH_DATE` (`api/crossword.php:23`, currently '2026-11-20') to the real live date, as the dev note says. That is a release step, not a bug.

## Acceptance criteria

PASS = verified at runtime or by a direct check. "code" = verified by reading the code only. PENDING = not verifiable here.

| ID | Criterion (US-58) | Result | Evidence |
|---|---|---|---|
| C01 | Admin checkbox "Daily Crossword", loaded and saved like `final_round_enabled`; PUT with another value → 400, nothing saved | PASS | Admin script: loads checked (server 1), unticked + save → server 0, ticked + save → server 1. `PUT crossword_enabled=2` and `"x"` → 400 "must be a whole number between 0 and 1", stored value unchanged |
| C02 | No `crossword_enabled` row reads as 0 | PASS (code) | `api/settings.php:48` (`?? 0`). Row not removed live |
| C03 | Setting 0 → no button; 1 → button `#crossword-open-btn` next to Daily Challenge, hidden in maintenance and Streak setup | PASS | Setting 0 → button hidden after reload; 1 → shown; Streak setup → hidden (REG-02a). Maintenance hiding by code `js/game.4ca1f55c.js:1714` (same rule as Daily). Row placement: see BUG-58-01 |
| C04 | Click → GET + crossword screen; "Back" returns to setup and keeps progress | PASS | US58-03, US58-19a, US58-24a/b, US58-25d |
| C05 | Word candidates only from text questions at enabled point values | PASS | SQL: 1014 questions, 883 text (no picture), all text questions have an answer; 0 questions at disabled point values locally. Candidates via `daily_bank()`; 533 candidate words (matches dev note) |
| C06 | Cleaning order and examples ("The Beatles", "Spider-Man", "Pelé", "Paris (France)", "O'Neal") | PASS | CLI: BEATLES, SPIDERMAN, PELE, PARIS, ONEAL; also THE/leading "the", accents (Zürich, Ångström, Straße→STRASSE), Jean-Luc→JEANLUC |
| C07 | Kept only if `^[A-Z]{3,10}$` ("Ox", "Constantinople", "1969", "Apollo 11" dropped) | PASS | CLI: all four dropped; "Dr. Who" and "AT&T" dropped (full stop / ampersand) |
| C08 | One question per word; a word found in its own clue (EN or AR, case/accent-insensitive) is not used | PASS | Checker over 420 layouts: no repeated word or question id; no word inside its own clue |
| C09 | Picture questions, disabled point values and empty answers never appear | PASS | 131 picture questions excluded by `question_kind()`; empty answers excluded. Disabled-value rule by code (`daily_bank` filter), not exercised: no disabled values in local data |
| C10 | First request builds and stores with INSERT IGNORE then reads back; simultaneous first requests give one grid and one row | PASS | 8 parallel first requests on an empty table: identical payloads (compared without `seconds_to_next`), 1 row in `daily_crossword` |
| C11 | Same UTC day → identical layout; new puzzle at midnight UTC | PASS | Repeated and parallel requests identical; `build_crossword_layout` deterministic (checked 420 dates twice). 60 consecutive dates → 60 distinct layouts. Midnight rollover by code (`game_day_bounds`), not driven live |
| C12 | Stored grid: 6–10 words, ≤13×13, trimmed to the words, connected, every crossing shares a letter | PASS | 420 dates (2026-01-01 to 2027-02-24): 10 words every date, sides ≤13 (max 13×10, 10×13), trimmed, connected, all crossings match |
| C13 | No two words touch side by side; cell before first and after last letter empty | PASS | Checker: every maximal letter run in every row and column is exactly one word, 420 dates |
| C14 | Bank gives fewer than 6 words → 503 generic, no row stored; no table → 503; other methods → 405 | PASS | Table renamed → live 503 with the generic message (table restored at once). POST, PUT, DELETE, PATCH → 405 with `Allow: GET`. No-grid: `build_crossword_layout` returns null for a 5-candidate bank and the path does no INSERT. The live no-grid HTTP path was not driven (it needs the real bank changed) |
| C15 | Response has `date`, `number`, `seconds_to_next`, `width`, `height`, `words[]` (`n`, `row`, `col`, `dir`, `length`, `answer`, `question`, `question_ar`, `category_name`, `category_name_ar`); answers in payload | PASS | Live payload and the 13×10 / 10×13 payloads checked field by field |
| C16 | `#N` = days since `CROSSWORD_LAUNCH_DATE` + 1, at least 1 | PASS | CLI: 2026-11-19 → 1, 2026-11-20 → 1, 2026-11-21 → 2, 2026-12-01 → 12, 2027-11-20 → 366 |
| C17 | Clue numbers: standard reading order; one number for a cell that starts across and down | PASS | US58-06 (10 word starts, numbers match reading order in the DOM); CLI numbering check |
| C18 | Word cells white with the number in the corner; other cells dark and not selectable | PASS | US58-05a/b (56 white, 54 dark on 10×11), US58-06. Click on a dark cell ignored (`onCwGridClick`, by code) |
| C19 | Typed letter shows uppercase and cursor moves on; only A–Z (digits, symbols, Arabic ignored); phone keyboard works | PASS | US58-08b, 08c, 08d (lowercase), 22a–c (hidden input focus, phone `insertText` "c" → C, Arabic ignored) |
| C20 | Backspace clears the cell, or moves back one cell and clears it | PASS | US58-09a, 09b, 22d, 22e |
| C21 | Arrow keys move to the next white cell in that direction (skipping dark cells); direction follows the arrow's axis | PASS | US58-10a–c |
| C22 | Second click on a crossing switches direction; active word highlighted, current cell stronger | PASS | US58-11a (across → down), 11b (direction kept when the word runs that way). Highlight classes `is-word` / `is-current` present (visual inspection not done) |
| C23 | Clue panel: "n. text (length)", active clue highlighted and scrolled into view; clue click selects its first empty cell | PASS | US58-07a–c, US58-12. Scroll into view by code (`scrollClueIntoPanel`), not measured |
| C24 | On a phone (≤600 px) the active clue shows in a bar above the grid | PASS | US58-34 (375 px: bar above grid). The bar also shows on desktop (dev note: superset, accepted) |
| C25 | EN/AR toggle on the active clue; no toggle for a clue without Arabic | PASS | US58-31a–b (toggle switches to English, label "Show question in English" in Arabic UI), US58-31c (clue without Arabic: no toggle, English text; payload edited in the browser only) |
| C26 | Check word marks wrong letters red until changed; correct and empty not marked; free | PASS | US58-13a–d (1 wrong marked, only it, mark cleared on change, "No wrong letters" message) |
| C27 | Reveal letter: current cell revealed, locked, +1 hint; if current cell right, first empty/wrong cell of the word; whole word right → nothing, no hint | PASS | US58-14a–d (1 hint, locked, typing skips). The "whole word right costs nothing" branch by code (`onCwReveal`), not driven |
| C28 | Timer 0:00 at a new puzzle; starts on first letter or reveal; m:ss, h:mm:ss after an hour; stops when solved | PASS | US58-04a, 15 (0:00 → 0:02), 16f (stopped), 23a/b (no tick before the first letter). h:mm:ss format by code only |
| C29 | Auto-finish when every letter is right; grid read-only; result shows "Solved in", hints line, Share, "Next crossword in" | PASS | US58-16a–e, US58-18b (typing ignored after the finish) |
| C30 | Full but wrong grid → "Not quite: some letters are wrong." without detail | PASS | US58-26a–d (0 letters marked, still unfinished until the last correct letter) |
| C31 | Share: copy plus "Copied" on desktop, text per D-72 p with the site link | PASS | US58-17a/b: "Copied"; text "Mokh Rush Crossword #1: solved in 0:04 with 1 hint" + site link. Phone share sheet: C49 |
| C32 | Countdown to midnight UTC; at 0 shows "Play the new crossword" | PASS | US58-16d (countdown 07:23:07), US58-29a–d (hand-made save, countdown reaches 0, Play button, same-day Play returns to countdown) |
| C33 | Reload resumes from `localStorage` `brainrush.crossword`; finished puzzle shows result; earlier-date save discarded; corrupt save discarded | PASS | US58-25a–d (hints, revealed letter, cursor kept), US58-18a (result after reload), US58-28 (earlier date discarded), US58-27a (corrupt JSON dropped) |
| C34 | Arabic UI: every crossword string from `STRINGS.ar`; page RTL; grid `dir="ltr"`; language switch mid-puzzle keeps progress and timer | PASS | US58-30a–e (rtl, grid ltr, Arabic title, button, tools), US58-32 (switch to English keeps letter and timer). All `cw.*` keys used in the game exist in both languages. Arabic wording itself is FU-87 (native review) |
| C35 | 1366×768: 13×13-class grid, tools, timer and active clue visible without page scroll | PASS (partial) | US58-33-13x10 and 33-10x13 (page height 768 = viewport, tools and grid bottom inside). The live 10×11 grid is smaller. Exact 13×13 is C48 |
| C36 | 375 px: no sideways scroll; active-clue bar above grid; clue lists below | PASS | US58-34-13x10 and 34-10x13 (scrollWidth 375, grid 348 px, bar above, clues below). Live 10×11 at 375 px measured by the dev |
| C37 | Text and controls meet WCAG AA contrast | PENDING | Not re-measured here (no Python for the kit validators). Dev measured 20 colour pairs by formula (lowest reported 5.04:1) |
| C38 | Game-log: one `crossword` line per device per day on first letter or reveal; no name; `categories: all`; unknown modes still 400 | PASS | US58-21a/b (one POST, body `{"mode":"crossword"}`), US58-23a–c (no line on opening, one on first letter). API: `crossword` → 201, `bogus` → 400. Log line `crossword: - | categories: all` |
| C39 | `how-to-play.html` has a "Daily Crossword" section | PASS | `how-to-play.html:48` (TOC), `:258–269` (section) |
| C40 | `llms.txt` and `README.md` mention the mode; README mentions the migration | PASS | `llms.txt:13`; `README.md:76`, `:132` |
| C41 | Privacy page: device-storage line includes `brainrush.crossword`; log line for the crossword | PASS | `privacy.html:51` (log line: time only), `:68–69` (device storage) |
| C42 | `docs/deploy-hostinger.md` says to run `sql/migrate-add-daily-crossword.sql` BEFORE the code | PASS | `docs/deploy-hostinger.md:221`. The table count in the same guide is wrong: BUG-58-03 |
| C43 | `docs/spec.md` describes the mode and the API | PASS | `docs/spec.md:77`, `:107`, `:132`, `:179` |
| C44 | Regression: Daily Challenge still starts | PASS | REG-01 (opens its question screen) |
| C45 | Regression: Sudden Death Streak still starts; crossword button hidden in its setup | PASS | REG-02 (solo streak starts), REG-02a |
| C46 | Regression: a normal board game still starts | PASS | REG-03 (name + 6 categories → Start → board) |
| C47 | Regression: Integration Quiz page loads with no errors | PASS | REG-05 |
| C48 | Exact 13×13 grid fits 1366×768 with no page scroll | PENDING | No 13×13 bounding box in 420 dates (largest is 13 on one side). Only 13×10 and 10×13 were driven |
| C49 | Phone share sheet (`navigator.share`) on a phone | PENDING | Needs a phone. Desktop copy path verified (C31) |

Totals: 46 PASS, 0 FAIL, 3 PENDING (C37, C48, C49).

## Static checks

| ID | Check | Result | Evidence |
|---|---|---|---|
| S01 | `php -l` on all tracked PHP plus `api/crossword.php` | PASS | No syntax errors in any file |
| S02 | No `innerHTML` added with data | PASS | The only match in `js/game.4ca1f55c.js` is a comment (line 5). i18n and admin files unchanged in this respect |
| S03 | SQL: prepared statements, no concatenated values | PASS | `api/crossword.php` lines 313, 340, 369–373 use placeholders; the `IN` list is built from `?` marks only |
| S04 | No hard-coded board sizes beyond the documented constants | PASS (note) | `CROSSWORD_*` constants in `api/crossword.php:20–26`; the JS mirror `CW_MAX_SIZE = 13` (`js/game.4ca1f55c.js:108`) is documented as a mirror |
| S05 | No credentials in changed files; `api/config.php` in `.gitignore` | PASS | Pattern scan on the changed files (names only, no values printed); `.gitignore:1` ignores `api/config.php` |
| S06 | Asset names | Info | Names are the git blob ids of the committed files; they change on commit via `.githooks/hash-assets.sh`. Stale until then, as the dev note says |

## Bugs

No Critical or Major bugs.

### BUG-58-01: Minor (cosmetic). Crossword button wraps to a second line on desktop setup

- **Steps:** Open `http://localhost:8011/` (or any host) at 1366×768 with Daily Crossword on. Look at the "Who is playing?" row.
- **Expected:** "Daily Crossword" sits in the same line as "Daily Challenge" (AC: "next to the Daily Challenge button").
- **Actual:** Streak and Daily are on the first line; Daily Crossword wraps to a second line, left-aligned (y 293 px vs 243 px). At 375 px all three stack, which is fine.
- **Where:** `index.html:164` (button in the `mode-row` flex row). Screenshot: `C:\Users\NB28970\AppData\Local\Temp\claude\667ce54aa19d8ec0\c2f97b5b-ccf9-47d8-993c-176c93311a41\scratchpad\setup_desk.png`
- **Note:** Functionally correct and in the same group, so C03 is marked PASS. Fix is optional (for example a shorter label, or a smaller gap in the row).

### BUG-58-02: Minor. Client word check is looser than the server rule

- **Steps:** Code review. `isValidCrosswordWord` uses `CW_WORD_PATTERN`.
- **Expected:** Same rule as the server, `^[A-Z]{3,10}$` (`api/crossword.php:25`), per AC.
- **Actual:** `const CW_WORD_PATTERN = /^[A-Z]{1,13}$/;` (`js/game.4ca1f55c.js:110`, used at `:4481`). A save or payload with a 1–2 letter or 11–13 letter word would pass the client check. The server never produces such words today (420 dates checked), so nothing visible breaks.
- **Fix:** Use `/^[A-Z]{3,10}$/` in the client as well, or cite the server constant in the comment.

### BUG-58-03: Minor (docs). Deploy guide table count and list are wrong

- **Steps:** Read `docs/deploy-hostinger.md` step 5 (line 46) and compare with `sql/schema-hosted.sql`.
- **Expected:** The expected table list after the migration matches the schema (11 `CREATE TABLE` statements).
- **Actual:** The guide says "nine tables" and lists nine, without `integration_questions` and `integration_scores`. The committed guide said "eight" when the schema already had ten; this story moved the count to nine but did not fix the list.
- **Fix:** List all eleven tables, or write "all tables from the schema" and drop the count.

## Evidence files

- Browser run (final): `C:\Users\NB28970\AppData\Local\Temp\claude\667ce54aa19d8ec0\c2f97b5b-ccf9-47d8-993c-176c93311a41\scratchpad\ui_run3.txt`, results in `...\scratchpad\ui_results.json`
- Grid checker: `...\scratchpad\check_grids.php`; payloads and read-time checks: `...\scratchpad\make_payloads.php`
- Regression and Admin scripts: `...\scratchpad\ui_regress.js`, `...\scratchpad\ui_admin.js`

## Clean-up and state (restored)

- `crossword_enabled` = 1 (the dev's value). It was set to 0 and back to 1 during the tests. Other settings checked after the Admin save: unchanged.
- `daily_crossword`: empty, as the dev left it. The row for 2026-11-20 that my first request created was deleted.
- `daily_challenge`: the three rows for 2026-11-20 were created by my Daily Challenge check (DB time 18:27, the test) and were deleted. Earlier days untouched.
- `daily_crossword` was renamed once for the 503 check and renamed back the same minute.
- `logs/game-2026-11-20.log` was removed. It did not exist before my first request and held only test lines (`crossword: -`, `players: Team A`, `streak: Team A`).
- The test server on :8011 was stopped.
- No repo file was changed except this report.

## Re-test after fix loop 1

Re-test of the three Minor fixes from the dev's "Fix loop 1" section, then the crossword UI script and the regression script at 1366x768 and 375x812, EN and AR. Own test server on port 8011, stopped at the end. No code was changed.

### Fix verification

| Bug | Fix | Result | Evidence |
|---|---|---|---|
| BUG-58-01 | Setup mode buttons in a `.mode-extras` group (`index.html:160`, `css/style.261a29b4.css:519`) | FIXED, verified | Setup row script: 20 of 20 PASS (EN and AR, 1366 and 375, 1 to 4 players and Teams). At 1366 px with 1 player (Streak shown) all three buttons on one line (y 293); with 2 or more players or Teams (Streak hidden) Daily and Crossword share the toggle line (y 243). At 375 px they stack, every button inside the viewport, no sideways scroll (scrollWidth 375 in both languages) |
| BUG-58-02 | Client `CW_WORD_PATTERN` now `/^[A-Z]{3,10}$/` (`js/game.4ca1f55c.js:110`), same as `api/crossword.php:25` | FIXED, verified by code | Constant and comment checked. Not exercised with a crafted payload |
| BUG-58-03 | Deploy guide lists all eleven tables (`docs/deploy-hostinger.md:46`) | FIXED, verified | The line names `categories`, `daily_challenge`, `daily_crossword`, `integration_questions`, `integration_scores`, `point_values`, `question_reports`, `question_stats`, `questions`, `settings`, `streaks`: 11, the same as the 11 `CREATE TABLE` in `sql/schema-hosted.sql` |

Lint: `php -l api/crossword.php` clean; `node --check js/game.4ca1f55c.js` clean.

### Browser runs

| Run | Checks | PASS | FAIL | Notes |
|---|---|---|---|---|
| Crossword UI script, 1366x768 EN | 99 | 97 | 2 | The 2 FAILs are REG-02 and REG-03 at the end of the script, the same test-script problem as the first run (fresh context for Streak and board). Those modes pass in the regression run below |
| Crossword UI script, 375x812 EN | 99 | 97 | 2 | Same 2 script-side regression lines. The phone input, layout and timer checks PASS |
| Arabic crossword screen, 1366x768 and 375x812 | 10 | 10 | 0 | RTL page, grid LTR, no page overflow (1366: no page scroll, tools bottom 716 px; 375: no sideways scroll, grid inside), timer starts on first letter, Back keeps the letter, no page errors |
| Regression (Daily Challenge, Streak with crossword hidden in its setup, normal board, Integration Quiz) × EN/AR × 1366/375 | 20 | 20 | 0 | Fresh context per mode |
| Setup row (see BUG-58-01 above) | 20 | 20 | 0 | |

Admin checkbox script was not re-run in this loop. Admin files were not changed and the setup-row change does not touch them.

### Totals for the re-test

- New FAILs: none. Product checks that ran: all PASS.
- The 4 FAILs are the crossword script's own regression lines (REG-02, REG-03 at each size). They are script problems, not product problems; the same modes pass in the regression run.
- Criteria table (C01 to C49) unchanged: 46 PASS, 0 FAIL, 3 PENDING (C37 WCAG measurement, C48 exact 13x13 layout, C49 phone share sheet).
- Bugs: BUG-58-01, BUG-58-02 and BUG-58-03 are fixed and verified. No new bugs.

**Verdict: READY FOR PO** (unchanged). The three Minor bugs are closed. The three PENDING items still need a device or the owner.

### State after the re-test

- `crossword_enabled` = 1 (unchanged).
- `daily_crossword`: empty (the row my requests created was deleted).
- `daily_challenge` for 2026-11-20: the rows created by my Daily Challenge checks were deleted.
- `logs/game-2026-11-20.log`: removed. It held only test lines (`crossword: -`, `players: Team A`, `streak: Team A`).
- Test server on port 8011: stopped.

## PO acceptance

**US-58 Daily Crossword: ACCEPTED** (Product Owner, 2026-11-20).

- All 49 criteria are met or covered: 46 PASS, 0 FAIL. BUG-58-01, BUG-58-02 and BUG-58-03 (Minor) are fixed and re-tested, and no bug is open.
- PENDING items, closed or moved:
  - **C37** is closed. The dev measured 20 colour pairs with the WCAG formula (the lowest is 5.04:1), and the ux-ui `verify_states` gate passed on `index.html` after the fix loop (142 element-states, AA).
  - **C48** is closed. The 13 × 10 and 10 × 13 grids were driven at 1366 × 768 and at 375 px, so each maximum dimension was tested. An exact 13 × 13 grid never came up in 420 dates.
  - **C49** moves to the live smoke check on a phone (FU-90), because `navigator.share` needs HTTPS.
- Developer open points, decided in D-72 s to v:
  - The active-clue bar at every width is accepted, and the AC is amended.
  - The Arabic plural forms in the share line are accepted (FU-87).
  - The plain-substring self-clue rule is kept.
  - `CROSSWORD_LAUNCH_DATE` is set to the live date in the PR (FU-90).
- The extra strings go to the native review (FU-87).
- Next: the owner's local check and commit (FU-89), then the PR and the hosted deploy, with the migration run first (FU-90).

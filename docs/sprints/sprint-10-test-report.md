# Sprint 10: Kilo Meshakkal (كيلو مشكل) category (US-53, D-53): test report

Tester: Senior Tester agent, 2026-11-03. Branch `sprint-10` (nothing committed). No application code was changed; the only file written is this report.

## Summary

- **Environment:** Windows 11, PHP 8.0.30 (XAMPP), MariaDB on 3306 (local `brainrush` DB), `C:/xampp/php/php.exe -S localhost:8000` from the repo root (started by me, stopped afterwards), in-app browser (viewport about 800x600, device pixel ratio 1.25). The pane cannot be resized, so the game was loaded in same-origin iframes sized 1920x1080, 1366x768 and 375x812 and measured with `getBoundingClientRect`, `scrollWidth` and `scrollHeight` (same method as Sprint 9). `window.confirm` was stubbed to answer yes and record the text (helper and End Game confirms). The browser's service worker was unregistered before each load, because the pane's service worker served `offline.html` to iframe loads. Local requests are admin-open on this PC, so the Admin page and `PUT settings.php` / `points.php` worked without a login. Scratch scripts are in the system temp folder, not in the repo.
- **Counts:** 58 checks, **54 PASS, 0 FAIL, 4 PENDING**.
- **Bugs:** 0 Critical, 0 Major, **1 Minor** (BUG-10-01, outside the acceptance criteria; the PO may accept it).
- **Verdict: READY FOR PO.** Every acceptance criterion of US-53 and every Sprint 10 DoD item that can be run locally passes. The 4 pending items need a commit, a data change or a device.

Items the developer did not verify, all now tested: Golden Goal with a Kilo Meshakkal column (A: Kilo alone; B: `3,-1,1`; repeat round 2), 3 choices and Skip on a mix box, the Report label on a mix box, the Admin pages, 1920x1080, Kilo + Surprise, and the API edge cases (`-1`, `3,-1,1`, `-1,-1`, `-2`, game-log `[-1,3]`).

State found at the start, and left as found (checked by diff at the end): `settings` (9 keys, `categories_per_game` 6, `final_round_enabled` 1), `categories` (14 rows), `point_values` (100 to 500 enabled, 600 disabled), `reports.php?all=1` (empty list), `streaks.php` (3 rows, no run of mine saved), `questions` 869 rows, `logs/` (7 files; `game-2026-11-03.log` 202 bytes). `git status` lists the same 14 entries as at the start, plus this report.

Side effects I could not undo (harmless, listed for honesty): the `categories` AUTO_INCREMENT moved past 49 (BUG-10-01 probe, row deleted) and the `point_values` AUTO_INCREMENT past 12 (a temporary value 700 for A8, row deleted). Only SQL could reset them; no row is left.

## Static checks

| ID | Check | Result | Evidence |
|---|---|---|---|
| S1 | `php -l` on every `api/*.php` | PASS | "No syntax errors detected" for all 14 files, including `questions.php` and `game-log.php` |
| S2 | `node --check js/game.6ef41919.js` | PASS | exit 0 |
| S3 | No `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `document.write` in the game, admin or other JS | PASS | grep finds none. The emoji, the hint, the source category name and the headings are set with `textContent` / `h()` (also proved at run time, see B15) |
| S4 | SQL by string concatenation | PASS | the diff has only prepared statements with `?` placeholders (`mix_column`, `category_columns`, `played_count`, `read_category_names`). The two `query()` calls run fixed SQL with no input (`point_values`, `playable_names`) |
| S5 | Credentials outside `api/config.php`; `api/config.php` git-ignored | PASS | `git check-ignore -v api/config.php` prints `.gitignore:1`. No key, token or password string in the diff. `api/config.php` and `InternalUse/` were not read |
| S6 | Hard-coded board sizes and point values | PASS | no literal 100 to 600 or category count in the diff outside comments. Rows come from `points`, columns from the request, faces from `points.length` |
| S7 | Docs and static pages | PASS (Info 4) | `how-to-play.html` has the one bullet (text, "Kilo Meshakkal" with the Arabic in a `lang="ar" dir="rtl"` span); `docs/spec.md` line 132 matches the behaviour I saw. `llms.txt` and `README.md` do not list the Setup options (no "Surprise" in either), so no line is needed |
| S8 | After the real commit, `index.html` / `how-to-play.html` point at the re-hashed `js/game.*.js` and `css/style.*.css` (FU-16) | PENDING (after commit) | the JS and CSS were edited in place under their old hashed names (`game.6ef41919.js`, `style.b8666cf7.css`), so the names no longer match the content until the pre-commit hook runs. Now the pages load and work |
| S9 | No DB migration, no row in `categories` (DoD) | PASS | the diff has no `sql/` file and no schema change; `categories.php`, `admin.html` and `js/admin.*.js` are untouched; `GET categories.php` and the Admin lists have no Kilo Meshakkal row (U7, B14) |

## API checks (curl and `fetch`)

| ID | Check | Result | Evidence |
|---|---|---|---|
| A1 | `POST questions.php?board=1` `{"categories":"-1"}` | PASS | 20 calls, all 200: one column `id:-1`, `name:"Kilo Meshakkal"`, `mix:true`, 5 cells keyed 100..500 (the enabled values), each cell has `category_name` plus the usual board cell fields, no duplicate ids |
| A2 | Sources vary and are distinct inside the column | PASS | every one of the 20 calls had 5 different source categories; over the 20 calls all 14 playable categories appeared |
| A3 | `"3,-1,1"` | PASS | 30 calls: columns `[3,-1,1]` every time, 5 cells each, 15 distinct question ids (no id of the mix column in columns 3 or 1) |
| A4 | Other positions and a full board | PASS | `-1,3` and `3,-1` (10 distinct cells); `1,2,3,4,5,-1` and `-1,1,2,3,4,5` (30 cells, 30 distinct ids) |
| A5 | Validation (400) | PASS | `-1,-1` and `-1,3,-1` give "Category id -1 is listed more than once"; `-2`, `0`, `-0`, `--1`, `1,-1,x`, `-10000000000`, a Unicode minus give "categories must be a comma-separated list of positive integer ids (or -1 for Kilo Meshakkal)"; empty gives the old message; `99999,-1` and `-1,99999` give "Unknown category id(s): 99999"; `3,-1,3` still reports the duplicate id 3. A JSON array or a number for `categories` is 400 (as before) |
| A6 | GET form and `played=1` | PASS | `GET ?board=1&categories=2,-1` 200 with Science then Kilo Meshakkal; `-1,-1` and `-2` 400. `played=1`: `"-1"` gives `{played:0,total:0}`; `"1,-1"` with seen `[1,2]` gives `{played:2,total:81}` (the same as `"1"`); `-1,-1` and `-2` 400 |
| A7 | Unseen questions come first (US-30) | PASS | with every question "seen" except one 300-point question in History and one in AI, the 300 box was one of those two in 20/20 calls, and the 5 sources were still distinct every time. With every question seen the board still builds (200) |
| A8 | No question for a value: 400 naming the value, no board | PASS (variant) | with a temporary point value 700 (no questions): `-1` gives `"Kilo Meshakkal" is missing questions for: 100, 200, 300, 400, 500, 700` and `3,-1` gives `Category "History" is missing questions for: 700`, both 400. The mix message lists every value because with an enabled value that no category covers no category is playable at all (existing `PLAYABLE_HAVING` rule). The row was deleted afterwards |
| A9 | `game-log.php` accepts -1 | PASS | `[-1,3]` 201 "Kilo Meshakkal, History"; `[-1]` 201; `[3,-1,1]` 201 "History, Kilo Meshakkal, Geography"; `["-1",3]` 201. Log lines checked in the file; the client's own game starts (Kilo alone, 5 to 6 columns) wrote "categories: Kilo Meshakkal" |
| A10 | `game-log.php` rejects | PASS | `[-1,-1]` and `[-1,3,-1]` 400 "Kilo Meshakkal is listed more than once"; `[-2]`, `[0,3]`, `[-1.5]` 400 "categories must hold positive integer ids (or -1 for Kilo Meshakkal)"; `[99999,-1]` 400 "Category 99999 does not exist" |
| A11 | Admin API cannot touch -1 | PASS (BUG-10-01 Minor) | `PUT` and `DELETE categories.php?id=-1` 400 "Query parameter 'id' must be a positive integer"; `POST questions.php` with `category_id:-1` 400; `GET questions.php?category_id=-1` 400. But a real category named "Kilo Meshakkal" can be created (BUG-10-01) |
| A12 | PHP errors | PASS | the server log has no warning, notice, deprecation or 5xx; only the expected 400s |
| A13 | The "no question left after the exclusions" path | PENDING (data) | cannot be reached through the API on this bank (it would need almost every question at one value on the board). A8 covers the 400 and its wording; the developer called `mix_column()` directly with every 300-point question excluded (dev note), which I did not repeat |

## UI checks: Setup

| ID | Criterion | Result | Evidence |
|---|---|---|---|
| U1 | Tile under "K" with the hint | PASS | tile order: Surprise, AI, Cartoons, Egyptians, Flags, Food & Drink, Gen Z, Geography, History, **Kilo Meshakkal**, Landmarks, Movies, Science, Sports, Technology, Who Am I?; text "Kilo Meshakkal" + "كيلو مشكل · any category", the Arabic in `lang="ar" dir="rtl"`; input id `cat-mix`, `data-cat="-1"`; screenshot checked (the hint sits on its own line, muted) |
| U2 | Not shown with no playable category | PASS | with the `categories.php?playable=1` answer replaced by `[]` before the scripts ran: "No playable categories yet.", no tiles at all, Start disabled |
| U3 | Counts as one of N, tick-order badge, locked at N | PASS | N=6: ticked first, badge 1, "1 of up to 6"; with 5 more ticked, "6 of up to 6", 10 other tiles locked and disabled (the mix tile stays unlocked and ticked), a 7th tick ignored; unticking the mix renumbers the others 1 to 5. N=2 (setting changed and restored): Kilo + Surprise = 2 of 2 with badges 1 and 2, all 14 others locked, a 3rd tick ignored |
| U4 | Alone gives a 1-column board | PASS | "1 x 5 board", one column "Kilo Meshakkal" |
| U5 | Kilo + Surprise (either order, and in the middle) | PASS | `[-1, 0]` gives columns `[-1, 12 hidden]` ("Kilo Meshakkal", "?"); `[0, -1]` gives `[32 hidden, -1]`; `[14, 0, -1]` gives `[14, 47 hidden, -1]`. The hidden column is always a real category |
| U6 | Surprise alone never picks it | PASS | 8 games: `30/6/3, 16/6/4, 5/14/6, 14/4/2, 3/6/14, 16/6/2, 47/6/1, 2/47/14`, all ids above 0, always 3 columns (plus the code: the draw uses `s.playable`, which has no -1) |
| U7 | Played-questions progress | PASS | the request uses `s.playable` (the real categories) whatever is ticked; ticking Kilo, History or Surprise changes nothing in the bar ("1% of the questions played on this device" for the same seen list in all five states) |

## UI checks: Board and question

| ID | Criterion | Result | Evidence |
|---|---|---|---|
| B1 | Column in its tick-order position, one box per enabled value | PASS | `[3,-1,1]`: History, Kilo Meshakkal, Geography, 5 rows, 15 distinct ids; `[14,30,-1,16,27,23]`: mix third; `[-1,3]` in Teams mode (3 teams): mix first |
| B2 | Emoji instead of the value, a different emoji per box, no digit anywhere | PASS | 5 distinct emoji per game; cell `outerHTML` is `<button class="board-cell" aria-label="Kilo Meshakkal, mystery value" title="Kilo Meshakkal, mystery value"><span class="cell-points cell-face" aria-hidden="true">...`; no digit in text, label, title or any attribute |
| B3 | Every value once, shuffled, changes between games | PASS | `order` was a permutation of 100..500 every time; 12 games in a row: 12 different orders, 12 different emoji sets, 0 ascending. With 600 enabled (temporary): 6 boxes, order `[200,100,600,500,400,300]`, 6 distinct emoji, page 768 high |
| B4 | Heading "Kilo Meshakkal: <source> – <points>" | PASS | "Kilo Meshakkal: Technology – 400", "...: Landmarks – 500", "...: Movies – 500", "...: Flags – 100" |
| B5 | Correct / Wrong score the box's value; used box shows value, owner colour and name, or grey | PASS | Correct (+400) gave Team A 400 and the box "400 / Team A" in the owner's colour, `aria-label` "Kilo Meshakkal, 400 points, won by Team A", disabled; the other boxes kept their emoji; Wrong on a swapped box scored the swap's value; a box closed with no Correct is grey ("no correct answer") |
| B6 | Double-score cell (D-40) | PASS | the double cell was on the mix column (`-1:100`): popup "Double score!", timer waited at 30, Correct gave +200 and the used box shows "x2 / 100 / Team B"; labels "plus 200 points (double score)" |
| B7 | Swap | PASS | confirm text as usual; the heading became "Gen Z – 200" with "Swapped from Kilo Meshakkal – 500"; a refresh kept it; the used box shows the struck 500 and "Gen Z – 200", label "swapped to Gen Z – 200" |
| B8 | Skip | PASS | confirm "Team A loses 100 points (half of 200) and the question closes for everyone"; score -100; box grey; kept after a refresh |
| B9 | 3 choices | PASS | A, B, C shown (Arabic choices on an Arabic-first question), only Team A can answer; the same order after a refresh (`choiceOrder` saved); 1366x768 with 6 players: still 768 high before and after Show Answer |
| B10 | Report names the real source category | PASS | the dialog line reads "Kilo Meshakkal: Technology – 400"; the request that Send makes is `{"question_id":458,"reason":"wrong_answer","note":""}` and question 458 is a Technology 400 question in the bank. I sent the request into a stubbed `fetch`, so **no row was written** (nothing to clean up); the real endpoint is unchanged code and was only checked for payload |
| B11 | Golden Goal (US-44, D-51) with a Kilo column | PASS | (1) Kilo alone, 300/300 tie on a full board: "End Game and show results" opens "It's a tie! Golden Goal?"; refresh on the offer kept it; **Go for goal** drew "Science" with `exclude` = all 5 mix ids (and the drawn id is not among them); bets, refresh mid-bets (Team A locked, "Team B, what's your bet?"), question "Golden Goal - Science", refresh on the question, both Correct gave "Continue"; (2) "Still tied! Golden Goal again?", round 2 drew a new question with `exclude` = the 5 mix ids + round 1 id, `usedIds [69,722]`, bets 100 / 0, A Correct, B Wrong, Results "Team A wins!" (400 / 300), refresh on Results kept it, New Game returned to Setup with nothing saved; (3) `[3,-1,1]`: End Game confirm "15 questions have not been played", offer on the 0/0 tie, the draw `exclude` held all 15 board ids |
| B12 | Golden Goal text hides nothing about the mix | PASS | heading, offer and Results never mention the box values |
| B13 | Teams mode | PASS | "3 teams, 2 x 5 board", columns `[-1,3]`, a refresh on the board, no error |
| B14 | Admin: not in Categories, the Questions filter or form | PASS | `admin.html` page text and HTML contain no "kilo", "meshakkal" or "كيلو"; the category list has the 14 real rows; `question-category` (form), `question-filter`, `question-points` and `question-points-filter` selects list only real categories and points; the Admin log viewer shows the log files (a game's line names "Kilo Meshakkal") |
| B15 | Source names are text, never HTML | PASS | a saved `catName` of `<img src=x onerror=window.__pwn=1>` shows as the literal text in the heading ("Kilo Meshakkal: <img src=x ...> – 100"), no `img` element, `window.__pwn` never set |
| B16 | Streak and Daily untouched | PASS (Daily by diff) | Streak: starts, shows a Flags question with 3 choices, calls `questions.php?streak=1` and `game-log.php` (run abandoned, nothing saved). Daily: `api/daily.php` and the Daily JS are not in the diff (I did not open it, to avoid creating rows for a new UTC day) |

## Saved game (D-28, no version bump)

| ID | Check | Result | Evidence |
|---|---|---|---|
| P1 | Refresh at several points | PASS | on the board with all boxes closed, on the board with used boxes (same emoji and order, byte-identical `order` and `faces`), on an open question (same heading), on the double popup (heading kept, popup not shown again), with 3 choices shown, after a Swap, on the question after a Swap, on Results, on the Golden Goal offer, bets and question, and in Teams mode. No `error` or `unhandledrejection` event in any run. The saved version stays 4 |
| P2 | Tampered saves go to Setup with no JS error | PASS | 27 variants, each ends on Setup with the save removed and no error: `order` with a duplicate, as strings, one short, one too long, missing, null entry, float entry, an object, negative; `faces` missing, one short, one extra, an empty string, a number, null, an object; `order` or `faces` on a real column; the `-1` column twice; `catName` as a number; used key `-1:999`, `-2:100`, `-01:100`; `current` on `-1` with points 999; `double` `-1:999` and `-2:100`; `hidden` as a string on the mix column |
| P3 | Valid variants still restore | PASS | baseline, an ascending `order`, repeated emoji, questions with no `catName`, a used `-1:300` box, a `current` on `-1:300` (question screen, heading "Kilo Meshakkal: Movies - 300"), `double` `-1:300`, `hidden: true` on the mix column, all load with no error |
| P4 | A save from before US-53 loads | PASS | a `[3,1]` game saved with no `catName` keys at all and an open question: restored on the question ("History - 100"), no mix column, no error |

## Layout (D-30)

| ID | Check | Result | Evidence |
|---|---|---|---|
| L1 | 1366x768, 6 players, 6 columns with Kilo third | PASS | board page exactly 768 high, `scrollWidth` 1366 = `clientWidth`, cells 212x70, no cell overflows; emoji font 44.2px (400 weight) against 44.2px (800) for the numbers, 61 px wide against 74; question screens (a mix box with a long heading, with 3 choices, after Show Answer) all 768 high, no horizontal scroll. The longest heading "Kilo Meshakkal: Cartoons & Childhood - 500" wraps to 2 lines (text ends at 468, Report starts at 592), still 768 |
| L2 | 375x812 | PASS | Setup: no horizontal scroll (360 = 360), the Kilo tile 64 px high against 48 px for the others (the 2-line hint), nothing clipped; 6-column board with 6 players: 891 px high (the same as the board without Kilo), cells 52x48, emoji 18.9px like the numbers, nothing overflows; mix question screen: no horizontal scroll, heading and Report do not overlap (even with the longest category name), page 1634 px (scrolls vertically like any phone question screen) |
| L3 | 1920x1080 | PASS (Info 1) | board 1080 high, no scroll, cells 248x109, emoji 44.2px like the numbers (label size is fixed), no overflow, Setup 1905 = 1905 wide (the page scrolls vertically, 1417 px, as with every Setup). A mix question was 1080 high, and 1106 with the answer shown because that answer ("USA (accept United States, America)") wraps to a second line; the same screen with a normal Flags 100 question stayed 1080 |
| L4 | Emoji sized like a point label | PASS | same computed `font-size` at 1920, 1366 and 375 widths; weight 400 (no faux bold) |

## Console and regression

| ID | Check | Result | Evidence |
|---|---|---|---|
| M1 | Console and script errors | PASS | `read_console_messages` (errors only) returned none; no `error` or `unhandledrejection` event in any iframe run; the network list shows no 4xx/5xx in the game's own requests (two `ERR_ABORTED` on `game-log.php` came from my harness replacing the iframe right after Start; the lines were written, status 201) |
| M2 | Board game regression (no Kilo) | PASS | `[3,1]`, `[3,1]` in Teams, Surprise alone: board, open, Report dialog, helpers, End Game, Results, New Game unchanged |
| M3 | Guide bullet | PASS | present once, in "Setting up a game", after Surprise me! |
| M4 | Real touch device (coarse pointer) and the Android app (`?source=twa`) | PENDING (environment) | the phone rules were measured at 375x812 only; no device was available. The diff does not touch `sw.js` or the TWA code |
| M5 | Hash re-run on the real commit | PENDING (after commit) | see S8 |

## Pending items

| ID | Item | Result | Notes |
|---|---|---|---|
| S8 / M5 | `index.html` and `how-to-play.html` link the re-hashed `game.*.js` / `style.*.css` after the commit, then purge the CDN (FU-16) | PENDING (after commit) | `game.6ef41919.js` and `style.b8666cf7.css` were edited in place |
| A13 | The 400 when exclusions leave no question at a value | PENDING (data) | wording and 400 verified through A8; the exhaustion itself was only checked by the developer with a direct call |
| M4a | Real touch device | PENDING (environment) | |
| M4b | The Android app | PENDING (environment) | |

## Definition of Done (Sprint 10)

| DoD item | Result | Evidence |
|---|---|---|
| No DB migration, no new table, no `categories` row | PASS | S9, A11, B14 |
| Reserved id -1 accepted only by `parse_board_ids()` and `read_category_names()`; Surprise stays 0 | PASS | A5, A9, A10 (every other endpoint I tried answers 400 for -1); U5, U6 |
| Saved game: no `STORAGE_VERSION` bump; older saves load; a corrupt mix column is discarded safely (D-28) | PASS | P1 to P4 |
| The mystery value never appears in an open box's text, label or tooltip | PASS | B2 |
| The ux-ui `check_no_emoji` exception recorded in the dev note (D-53) | PASS | the dev note's "Known limitations" says the gate flags `MIX_FACES` and that this is a deliberate product choice. The gate itself was not run here |

## Bugs and findings

No Critical or Major bugs. One Minor bug.

**BUG-10-01 (Minor, outside the acceptance criteria, optional)** The reserved name is not protected: an admin can create a real category called "Kilo Meshakkal". Steps: `POST /api/categories.php` with `{"name":"Kilo Meshakkal"}`. Expected: 409 or 400, because the built-in column already owns the name (Admin is meant to have no way to clash with it). Actual: 201 `{"id":49,"name":"Kilo Meshakkal","question_count":0}`; it appears in `GET categories.php` and, once it has a question at every enabled value, Setup would show two tiles named "Kilo Meshakkal" (the real one with id 49 and the built-in one with id -1; ids differ, so nothing crashes and the game log would show the same name twice). The probe row was deleted (`DELETE categories.php?id=49`, 200). Where: `api/categories.php` (the create and rename handlers; the duplicate-name check only compares with existing rows). Fix idea: reject the name `Kilo Meshakkal` (case-insensitive, also with the rename) in `categories.php`, using the same constant as `MIX_NAME`. No acceptance criterion asks for it, and the AC "cannot be renamed, deleted or given questions" is met for the built-in column.

**Informational (no action required)**
1. **1920x1080:** with 6 players a mix question whose answer wraps to two lines is 26 px taller than 1080 once Show Answer is clicked. A normal question with a one-line answer fits. This is the existing "few unusually long questions" exception of D-30 / D-35, not something Kilo adds, but the heading text is slightly longer on a mix box (Kilo prefix), so very long category names plus long questions are the worst case. L1 shows the longest category name still fits at 1366x768.
2. **Lenient parsing:** `"-01"` and `" -1 "` are accepted as -1 (and `"01"` already was a valid id before this sprint). Harmless.
3. **Existing behaviour, not new:** `game-log.php` accepts the same real category twice (`[3,3]` gives 201), and the board API rejects it. Only -1 got the "listed more than once" rule in the log.
4. **Guide example:** the sentence "Kilo Meshakkal: Football - 300" uses a category that does not exist in this bank (it is the AC's example); it is only an example.
5. **A8 message:** when an enabled point value has no questions at all, the "missing questions for" list for Kilo Meshakkal names every value (no category is playable), unlike the real-column message that names only the missing one. Accurate, only wider than needed.
6. **Setup tile height:** the Kilo tile is 64 px at 1366x768 and 1920x1080 and on the phone (the dev note says 65), the others 44 to 48 px. Setup scrolls anyway; nothing is clipped.
7. **Developer's decisions:** the order "different categories first, then unseen" is what the acceptance criteria need (A2 and A7 pass together, 20/20 each). The 12-emoji list (🍿 and 🎁 in place of two Unicode 14 emoji) renders on this PC; I did not check older Windows. Decision 6 (a Swapped Kilo box shows "Swapped from Kilo Meshakkal - 200") works as described.

## Cleanup done

- `logs/`: `game-2026-11-03.log` restored byte-identical (202 bytes, three lines) from a copy taken before the tests, after my API and browser games added lines; the other six log files compared identical (`cmp`). No new log file exists.
- `settings`: `categories_per_game` was set to 2 for U3 and put back to 6; all keys byte-identical to the snapshot (diff of `settings.php`).
- `point_values`: 600 enabled for B3 and disabled again, and the temporary 700 deleted; `points.php` identical to the snapshot (AUTO_INCREMENT moved, see Summary).
- `categories`: the probe category (id 49) deleted; `categories.php` identical to the snapshot (AUTO_INCREMENT moved).
- `question_reports`: nothing written (the Report request went into a stubbed `fetch`); `reports.php?all=1` unchanged. `questions` still 869 rows; `streaks` unchanged (the Streak run was abandoned).
- Browser `localStorage`, `sessionStorage` and the service worker registrations for `localhost:8000` cleared and the test iframes removed. The test server on :8000 (started by me) was stopped. `api/config.php` and `InternalUse/` were not read. Scratch files are in the system temp folder only.

## Verdict

**READY FOR PO.** US-53 meets every acceptance criterion that can be run locally: the Setup tile and its hint, the N limit and badge, Surprise alone and combined, the API (`-1`, `3,-1,1`, `-1,-1`, `-2`, game-log `[-1,3]`), the emoji boxes with no value in text, label or tooltip, the heading and Report label, Correct / Wrong, Swap, Skip, 3 choices, the double cell, Golden Goal, refresh at every point, 27 tampered saves, the Admin pages, and the 1366x768, 375x812 and 1920x1080 layouts. 58 checks: 54 PASS, 0 FAIL, 4 PENDING (hash after commit, the data-exhaustion 400, a real touch device, the Android app). One Minor optional bug (BUG-10-01, the reserved name can be created as a real category) is for the PO to accept or send back.

## Fix after test

**BUG-10-01 fixed (2026-11-03).** `api/categories.php`: `save_category_name()` now rejects the reserved name "Kilo Meshakkal" (case-insensitive, constant `CATEGORY_MIX_NAME`) before the INSERT or UPDATE runs, with 409 `"<name>" is the name of a built-in category`, for both create and rename. Checked with curl: `POST categories.php` `{"name":"kilo meshakkal"}` → 409; `PUT categories.php?id=3` `{"name":"Kilo Meshakkal"}` → 409; `GET categories.php?playable=1` → 200. The PO read the change in code. Not re-run by the tester; the Admin form message is part of the owner's walkthrough (FU-36 step 4).

## PO acceptance

**US-53 Kilo Meshakkal category: ACCEPTED** (PO, 2026-11-03).
- Every acceptance criterion that can be run locally passes (54 PASS, 0 FAIL), including the ones the developer did not verify (Golden Goal, Skip, 3 choices, Report label, Admin, 1920x1080). The DoD items pass.
- BUG-10-01 is fixed (see above).
- Pending items: S8 / M5 (hash after the commit) go to FU-36; M4a / M4b (touch device, Android app) go to FU-37. A13 (the exhaustion 400) is accepted as covered: A8 checks the 400 and its wording, and the developer reached the path with a direct `mix_column()` call.
- The developer's decisions are accepted as D-54 in `docs/product-backlog.md` (different categories before unseen inside the column, the 12-emoji list and its cycle over 12 values, no ascending order, Swap wording, the 409, the reserved name). The name constant now has three copies; FU-38 (Could) moves it to `api/db.php`.
- Informational items 1 to 6 need no action.

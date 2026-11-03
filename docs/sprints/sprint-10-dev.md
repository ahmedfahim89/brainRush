# Sprint 10: Kilo Meshakkal (كيلو مشكل) category (US-53, D-53): developer note

Branch `sprint-10`, 2026-11-03. Design: the owner-approved plan `nifty-wishing-snowflake.md` (written against the Sprint 8/9 file names); acceptance criteria: `docs/product-backlog.md` US-53 and D-53; spec: `docs/spec.md` (the "Kilo Meshakkal" tile bullet). The final round is Golden Goal since Sprint 9 and works with a Kilo Meshakkal column on the board.

**No migration.** Kilo Meshakkal is a built-in category with the reserved id **`-1`** (`MIX_ID` in PHP, `MIX` in JS). It has no row in `categories`, so Admin, the played-progress bar, the Streak and the Daily Challenge are untouched. Real ids are positive and Surprise stays `0` (client only).

## Stories implemented
- **US-53 Kilo Meshakkal category.**
  - **Setup.**
    - When at least one real category is playable, a "Kilo Meshakkal" tile sits in the category list, sorted by name with the others (under "K"). It shows the name only: the small "كيلو مشكل · any category" second line was removed at the owner's request after acceptance (2026-11-03), with its `mixTileName()`, `MIX_NAME_AR` and `.cat-mix-hint`.
    - It is a normal tile (`data-cat="-1"`, input id `cat-mix`): it counts toward `categories_per_game`, gets a tick-order badge and locks at N.
    - It stays ticked when Setup reloads, like Surprise.
    - `s.playable` is still the real categories only; the tile list is built by the new `setupTiles(s)`. So the played-progress request and the "Surprise me!" draw never include it, without any extra filter.
  - **Board request.** `POST questions.php?board=1` takes `-1` in `categories`, at most once, in any position. The column comes back as `{id: -1, name: "Kilo Meshakkal", mix: true, questions: {<points>: board_cell() + category_name}}`, in its requested position.
  - **The draw (`mix_column()`).** For each enabled value it takes a question from any playable category (`PLAYABLE_HAVING`), never one already on the board (the real columns are built first and their ids excluded).
    - It prefers a category not used yet in the column, then a category that still has an unseen question at that value (US-30), and draws the question by the board rule (`draw_from_pool`).
    - The values with the fewest "unseen" categories are drawn first, and values with none are drawn last, so the two preferences rarely clash (see Decisions 1).
    - When a value has nothing left: 400 `"Kilo Meshakkal" is missing questions for: 300`, and no board.
  - **Mystery boxes.**
    - At Start, `beginGame()` → `dealMixColumn()` gives the column:
      - `order`, a shuffled copy of `board.points`, so each value appears once (never the plain ascending order);
      - `faces`, one emoji per row from `MIX_FACES`, without repeats.
    - Row `i` renders the box of value `order[i]` with emoji `faces[i]`.
    - An open box shows only the emoji, with `aria-label` and `title` "Kilo Meshakkal, mystery value". A used box shows its value, owner color and name, or grey, like any box.
  - **Question.** The heading reads "Kilo Meshakkal: Football – 300". The Report label is the same, so a report names the real source category.
    - `parseQuestion()` keeps `catName` from `category_name`, and `activeQuestion()` builds the heading for the `-1` column only.
    - Correct and Wrong score the box's value; the double cell doubles it as usual.
  - **Saved game, no `STORAGE_VERSION` bump.**
    - `order` and `faces` are saved with the column, and `catName` with each question.
    - `isValidMixColumns(g)` (called from `isValidGame()`) requires, on the `-1` column, `order` = a permutation of the board's points and `faces` = non-empty strings of the same length. A column missing them is discarded to Setup (US-17).
    - `isValidBoard()` rejects `order` / `faces` on any other column. `isValidQuestion()` accepts `catName` as optional text, so saves from before this story still load.
  - **Swap, Skip, 3 choices, Report, the double cell (D-40) and Golden Goal (US-44)** are keyed by value and need no change.
    - The one fix needed: `isBoardCellKey()` only matched `^\d+:\d+$`. It now accepts `-1:300`. Without that, a used or double Kilo Meshakkal box would have made the save corrupt on refresh.
    - Golden Goal's draw excludes `boardQuestionIds(g)`, which includes the mix column's questions.
  - **Game log.** `game-log.php` accepts `-1` and logs it as "Kilo Meshakkal" in its place. `-1` twice → 400 "Kilo Meshakkal is listed more than once"; `0`, `-2` and other ids below 1 → 400.

## Files created / changed
- `api/questions.php`:
  - `MIX_ID` / `MIX_NAME`;
  - `parse_board_ids()` accepts `-1` once;
  - `board()` split into `board()` + `category_columns()` (the old body, unchanged) + the new `mix_column()`;
  - new `playable_names()`, now also used by `random_question()` (same query as before);
  - `played_count()` ignores `-1` (and returns `{0, 0}` for `-1` alone instead of an empty `IN ()`);
  - header comment.
- `api/game-log.php`: `GAME_LOG_MIX_ID` / `GAME_LOG_MIX_NAME`; `read_category_names()` accepts `-1` once and only queries the real ids.
- `js/game.6ef41919.js` (edited in place):
  - constants `MIX`, `MIX_NAME`, `MIX_FACES` and the state comment;
  - `activeQuestion()`, `isValidBoard()`, the new `isValidMixColumns()`, `isValidQuestion()`, `isBoardCellKey()` and `isValidGame()`;
  - Setup: `renderCategories()`, the new `setupTiles()`, and the `s.selected` filter in `loadSetupData()`;
  - `parseQuestion()`, the `resolveSelection()` doc comment, `beginGame()`, the new `dealMixColumn()`, `renderBoard()` and `renderCell(category, points, face)`.
- `css/style.b8666cf7.css` (edited in place): `.cell-points.cell-face` (the emoji keeps the label's `--label-size`, without faux bold). Existing tokens only.
- `how-to-play.html`: one bullet under "Setting up a game", after Surprise me!.

Not touched: `sql/` (no schema change), `api/categories.php`, `admin.html` / `js/admin.*.js`, `index.html`, `sw.js`. As agreed, `docs/spec.md`, `docs/product-backlog.md` and `docs/sprint-plan.md` were left to the other agent. `llms.txt`, `README.md` and `docs/deploy-hostinger.md` were outside my file list; the coordinator may want a line in each (deploy: code only, no migration).

## Asset names
- `js/game.6ef41919.js` and `css/style.b8666cf7.css` were edited **in place under their current names**; no new JS/CSS file. The pre-commit hook re-hashes them and updates `index.html` (and `how-to-play.html` / other pages that link the CSS). After the commit, check that the pages point at the new names (FU-16), then purge the CDN.

## How to run / test
1. MariaDB running; `C:/xampp/php/php.exe -S localhost:8000` from the project root.
2. Game: tick **Kilo Meshakkal** alone, add 2 players, **Start Game**. The board has one "Kilo Meshakkal" column of emoji boxes. Open one: the heading reads "Kilo Meshakkal: <source> – <points>". Mark Correct, Back to Board: the box shows its value and owner. Refresh: the same emoji and order come back.
3. Try Kilo Meshakkal + Surprise me! (a "?" column plus Kilo Meshakkal), Surprise me! alone (never Kilo Meshakkal), and 6 columns with Kilo Meshakkal in the middle.
4. API: `curl -s -X POST "http://localhost:8000/api/questions.php?board=1" -H "Content-Type: application/json" -d "{\"categories\":\"3,-1,1\"}"`.

## Verification done
- `C:/xampp/php/php.exe -l` (PHP 8.0.30) on `api/questions.php` and `api/game-log.php`: no syntax errors. `node --check js/game.6ef41919.js`: OK.
- **API** (MariaDB running on 3306; `C:/xampp/php/php.exe -S localhost:8000` from the repo root in the background, stopped afterwards; scratch scripts in `%TEMP%\br10`, not in the repo). The local DB has 100-500 enabled.
  - `POST questions.php?board=1` `{categories: "-1"}` → 200: one column, id `-1`, name "Kilo Meshakkal", `mix: true`, 5 cells, each with a `category_name`. Over 13 calls the sources varied and were 5 different categories every time (for example "Egyptians, Geography, Cartoons & Childhood, Gen Z, Who Am I?").
  - `"3,-1,1"` → 200, columns in the order `[3, -1, 1]`, 0 duplicate question ids across the 15 cells (9 calls), the mix sources 5/5 distinct each time.
  - `GET questions.php?board=1&categories=2,-1` → Science 5 cells | Kilo Meshakkal 5 cells.
  - `"-1,-1"` → 400 "Category id -1 is listed more than once". `"-2"`, `"0"`, `"-0"`, `"--1"`, `"1,-1,x"` → 400 "categories must be a comma-separated list of positive integer ids (or -1 for Kilo Meshakkal)".
  - `questions.php?played=1`: `"-1"` → `{played: 0, total: 0}`; `"1,-1"` gives the same as `"1"` (`{2, 81}`).
  - **No question left:** calling `mix_column()` directly with every 300-point question excluded → `{"error":"\"Kilo Meshakkal\" is missing questions for: 300"}` (400 via `bad_request`).
  - **Unseen first:** with every question "seen" except one 300-point question in each of 2 categories, the 300 box drew one of those 2 in **20/20** runs. The first version of the draw order got 19/20: values with no unseen question were drawn first and could take both of those categories. They are now drawn last.
  - `game-log.php`: `[-1, 3]` → 201, logged as "categories: Kilo Meshakkal, History". `[-1]` → 201; `[3, -1, 1]` → 201, "History, Kilo Meshakkal, Geography". `[-1, -1]` → 400 "Kilo Meshakkal is listed more than once". `[-2]` and `[0, 3]` → 400.
- **Headless system Chrome** (the repo's Playwright, scratch script in `%TEMP%\br10`): **34/35 passed.** The one failure was the script, not the code: it expected a used box's text to start with its value, and that box was the double cell, whose text starts with the "×2" tag.
  - **Setup:** the tile is under "K" (after History, before Landmarks), with the hint text and `lang="ar" dir="rtl"`; its tick-order badge reads 1.
  - **Board (Kilo Meshakkal alone):**
    - one column `-1`;
    - `order` a permutation of 100-500 and not ascending (e.g. `[400,100,500,200,300]`);
    - 5 distinct faces;
    - every question has `catName`;
    - the cells show the faces in row order, with label and title "Kilo Meshakkal, mystery value" and no digit anywhere.
  - **Question:** heading "Kilo Meshakkal: Food & Drink – 400". In that run the box was also the double cell: Correct gave +800, and the used box shows 400, ×2, "won by Ann". A refresh kept the column byte-identical, and a refresh on an open question kept its heading. Report button shown.
  - **Swap** on a box: "Movies – 200 Swapped from Kilo Meshakkal – 200"; the swapped used box survives a refresh.
  - **Corrupt saves** → Setup, save removed: `order` not a permutation; `faces` one short; `order` missing; an empty face; `order` / `faces` on a real column.
  - **Kilo Meshakkal + Surprise:** `[23 (hidden), -1]`. **Surprise alone**, 6 games: never an id below 1.
  - **1366x768, 6 players, 6 columns** with Kilo Meshakkal 3rd: page exactly 768 high, no horizontal scroll. The emoji has the same computed font size as the numbers (44.2px) and is narrower (61 vs 74 px); nothing overflows its cell.
  - **375x812** (touch): no horizontal scroll on Setup or the 3-column board, and labels and emoji fit their cells.
  - No page or console errors.
- **Cleanup:**
  - `logs/game-2026-11-03.log` was restored byte-identical (202 bytes) from a copy taken before the tests; my API and browser games had added lines to it.
  - No other DB writes: no report was sent, and no streak or daily run was played.
  - The test server was stopped. MariaDB is left running.

## Decisions made (for the PO)
1. **Different categories take priority over unseen questions inside the column.** The plan listed "unseen first, then not used yet". The acceptance criteria make different categories a hard rule ("with at least as many playable categories as point values, every box has a different source category"). Unseen-first would break that rule once part of the bank is played. So a box takes a category not used yet in the column, and among those one with an unseen question. The values with the fewest unseen options are drawn first, so the two rules clash only on a nearly played-through bank.
2. **Emoji list.** I used the plan's examples, except 🫠 and 🪩. Both are Unicode 14 and show as an empty box on Windows 10, so I used 🍿 and 🎁 instead. The list is now 🎲 🔥 👀 🤯 🍿 💀 😭 ✨ 🍉 🧃 🎯 🎁. With more than 12 enabled values the faces repeat in a cycle (they can't all be distinct).
3. **Never the plain ascending order.** A shuffle of 5 values is ascending 1 time in 120, so `dealMixColumn()` shuffles again in that case (the AC says "not ascending").
4. **Where the save check lives.** `parseBoard()` validates the server's board with `isValidBoard()` before Start adds `order` / `faces`. So the "mix column needs order and faces" check is in `isValidMixColumns()`, called from `isValidGame()`, and `isValidBoard()` only rejects them on other columns. The result is the same as the plan's.
5. **The name constant is repeated in `api/game-log.php`** (`GAME_LOG_MIX_*`), because `api/db.php` was outside my file list. Moving `MIX_ID` / `MIX_NAME` to `db.php` later would leave one copy on the server.
6. **Swapping a Kilo Meshakkal box** shows "Swapped from Kilo Meshakkal – 200" (the original box's value is revealed once it has been opened anyway).
7. **The mix column's 409.** It is built with two queries (the ids, then the picked rows). If the admin deletes a picked question in between, the board request returns 409 "The questions changed meanwhile. Please try again.", like the Swap draw.

## Known limitations
- **Setup tile height:** the hint's second line makes the Kilo Meshakkal tile 65 px instead of 44 px at 1366x768, and its grid row grows with it. On the phone it is 65 px instead of 48 px. Setup may scroll (D-30), and nothing is clipped.
- **Emoji look** depends on the device's emoji font (Segoe UI Emoji on Windows, Noto on Android, Apple on iOS).
- **The ux-ui plugin's `check_no_emoji` gate** will flag the emoji in `MIX_FACES`. They are a deliberate product choice (D-53), so the gate run should record an exception rather than "fix" it.
- **Not verified here:**
  - Golden Goal with a Kilo Meshakkal column on the board (I checked by reading the code: its draw excludes `boardQuestionIds(g)`, which includes the mix column);
  - 3 choices and Skip on a mix box (they use only the value and the question);
  - sending a Report (I skipped it so as not to write a `question_reports` row; the label comes from the checked heading);
  - the Admin pages (they read the `categories` table, which has no Kilo Meshakkal row);
  - the Android app;
  - a 1920x1080 projector.

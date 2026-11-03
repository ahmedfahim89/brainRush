# Sprint 11: Question difficulty stats (US-47, D-55): developer note

Branch `sprint-11`, 2026-11-03, cut from `main` after the Sprint 10 merge. Plan: `docs/sprint-plan.md` "Sprint 11 — Question difficulty stats (US-47)", tasks 1-8, under the Epic E17 common rules. PO decision D-55 (band, outcomes, what counts) is followed where it is more detailed than the plan; D-37 g (public writes accepted) applies to the new POST.

## Stories implemented
- **US-47 Question difficulty stats.**
  - **Game, board question (D-55 e).** When a board question closes (Back to Board, Skip, or Android Back after its confirm), the game sends one outcome for the question on screen, decided from the marks at that moment:
    - anyone marked Correct → `correct`;
    - else anyone marked Wrong → `wrong`;
    - else the timer reached 0 → `timeout`;
    - else → `nobody` (also a Skip with no mark).
    - The "timer reached 0" note is `current.timedOut` in the saved game, so a Reset or a refresh doesn't undo it. A Swap clears it: the swapped-away question is **not** sent and the Swap question is (with its own timer).
    - Later +/- corrections on the board send nothing. The double score (D-40) changes nothing. Kilo Meshakkal boxes send their own question's id, so the count lands on the question's own point value (D-55 h).
  - **Game, Streak (D-55 f).** A right choice → `correct`, a wrong choice → `wrong`, time's up → `timeout` (also when the time ran out while the page was closed). A question left open by **End run** is not sent. A refresh on an answered question sends nothing again.
  - **Not counted (D-55 i).** Golden Goal questions and Daily Challenge questions send nothing (no code path calls the send there).
  - **At most once per question per game.** The board game and the Streak run each keep `statsSent: [question ids]`, saved with them. An id already in the list is never sent again. A new game or run starts with `[]`.
  - **Failed sends never interrupt play.** The send is fire-and-forget (`fetch(...).catch(() => {})`, `keepalive`), after the id is recorded. A 400, 500, 503 or network error changes nothing in the game.
  - **API.** `POST api/question-stats.php` (public) `{question_id, outcome}` → 201. It adds 1 to the counter with `INSERT ... ON DUPLICATE KEY UPDATE`.
  - **Admin.** The Questions table has two new sortable columns:
    - **Attempts**: the four outcomes added up. The tooltip shows "12 correct · 5 wrong · 2 nobody · 1 time's up".
    - **% correct**: `round(100 × correct / attempts)`, or "-" with 0 attempts.
    - **Check value** under the % when attempts ≥ 20 and the % is outside the band of the question's value. The tooltip reads "Expected 50–90% for 200", and screen readers get it as hidden text.
    - A hint line above the table: "Check value: 20+ attempts and % correct outside 100: 60–100% · 200: 50–90% · 300: 40–80% · 400: 30–70% · 500: 20–60%. Attempts and % correct come from board and Streak games."
    - Clicking a header sorts by it: the first click gives the most attempts or the lowest % first, the second reverses, and the third returns to the list order. Questions with no attempts always stay last, and equal values keep the list order. `aria-sort` is set on the header; the arrows are decoration.
    - Sorting applies to the filtered list.

## Decisions
- **Band (D-55 a-c), in `js/admin.*.js` only.** Named constants `BAND_TOP = 80`, `BAND_SPREAD = 40`, `BAND_HALF_WIDTH = 20` and `MIN_ATTEMPTS = 20`. `valueBands()` sorts the **enabled** point values from the loaded point list. The centre is `round(BAND_TOP − BAND_SPREAD × i / (n − 1))` for the 0-based index `i`, and for `n = 1` it is the middle, `round(BAND_TOP − BAND_SPREAD / 2)` = 60. So there is no separate "60" literal. The band is centre ± 20, kept within 0–100, ends included. No point value appears in the code.
- **Disabled values (D-55 c):** no band, so no mark; attempts and % still show. The bands follow the point values loaded with the page, so enabling or disabling a value and reloading recomputes them.
- **The mark compares the shown whole number (D-55 b).** The API rounds once (`(int) round(...)` in PHP) and Admin compares that value. So 99/200 = 49.5% shows "50%" and is not marked for 200.
- **Saved game: no `STORAGE_VERSION` bump** (it stays 4); Streak `STREAK_VERSION` stays 1. `statsSent` and `current.timedOut` are optional fields:
  - A save from before US-47 has no `statsSent`. It loads and plays as before, but sends nothing for the rest of that game or run, which the plan allows ("a save without the field simply counts none"). New games send.
  - A save with a broken `statsSent` (not a list of distinct positive integers, or longer than `SEEN_MAX`) or a non-boolean `timedOut` is discarded to Setup like any corrupt save (D-28, US-17).
- **Admin list (task 4).** `GET api/questions.php` (and `?category_id=`) uses a `LEFT JOIN question_stats` and adds `attempts`, `percent_correct` and `stats {correct, wrong, nobody, timeout}`. A question with no row has 0 attempts, and `percent_correct` is null then.
  - Without the table (error 1146) the same list is read without the join, and the three fields are null. Admin then shows "-" and the note "Attempts and % correct are not set up on this database yet: run sql/migrate-add-question-stats.sql." Nothing else breaks (FU-19 rule).
  - `&sort=percent_correct` sorts on the server (lowest first, then most attempts, no attempts last); any other `sort` → 400. Admin itself sorts in the browser, because it loads the whole list once and filters it there.
- **`is_missing_table()` moved from `api/reports.php` to `api/db.php`** so both endpoints share it (same body; `reports.php` behaviour unchanged).
- **The upsert SQL is fixed text.** The outcome only decides which of the four bound values is 1, so no column name is ever built from input. A deadlock or lock timeout (1213/1205) on two simultaneous first outcomes is retried up to 3 times. None happened in the race test below.
- **Response:** 201 `{question_id, outcome}`. An unknown question → 400 (FK error caught, like reports); the table missing → 503 "Question stats are not available right now."; other methods → 405 (`Allow: POST`).
- **Layout (D-19).** The two columns made the Questions table 78px too wide at 1024px; Actions needed the table's own scrollbar. The page itself never scrolled.
  - Fix: the "% correct" header and the mark may wrap, and the Questions table's cells have 0.45rem side padding (was 0.6rem; other tables are unchanged).
  - At 1024 and 1366 every column now fits with no scrollbar (`scrollWidth 930 = clientWidth 930` at 1024).
- **Privacy:** `privacy.html` is unchanged. A stats row holds only a question id and four counters: no name, IP, device id or time, so no personal data. The page lists what is kept about players and makes no claim that only those things exist. *Optional for the owner:* one sentence under "On our server", such as "We also count, per question, how often it was answered right, wrong, by nobody or too late, with nothing about who played."
- **Public-write limitation (D-37 g):** the POST is public and the game's payload holds the question ids, so anyone can post fake counts for any question, with no rate limit, just like reports (D-45). The counts are a hint for the admin ("check it", D-55 b) and never change the game. A burst of fake posts can be undone in phpMyAdmin (`UPDATE` / `DELETE FROM question_stats WHERE question_id = …`); there is no Admin reset button (not in US-47).

## Files created / changed
- **New** `sql/migrate-add-question-stats.sql`. It runs `CREATE TABLE IF NOT EXISTS question_stats` with:
  - `question_id INT UNSIGNED` as the primary key, with `fk_stats_question` → `questions(id) ON DELETE CASCADE`;
  - `correct`, `wrong`, `nobody`, `timeout`, each `INT UNSIGNED NOT NULL DEFAULT 0`;
  - `utf8mb4_unicode_520_ci`.

  It has no CREATE DATABASE/USE line. **Run it on every DB before the code.**
- `sql/schema.sql`, `sql/schema-hosted.sql`: the same table, after `daily_challenge`. The bodies after the CREATE DATABASE/USE lines are identical (checked with `diff`).
- **New** `api/question-stats.php`: `POST` only (see above). Validation follows `api/reports.php`: `question_id` is `parse_int` 1..4294967295, and `outcome` must be an exact match with `STAT_OUTCOMES`.
- `api/questions.php`:
  - `QUESTION_SELECT` is split into `QUESTION_COLUMNS` + `QUESTION_FROM` (same SQL).
  - `list_questions()` is rewritten (filters, order and the 404 are as before), with the new `question_rows_with_stats()` and `listed_question()`.
  - `STAT_COLUMNS` and the header comment.
- `api/db.php`: `is_missing_table()` (moved here). `api/reports.php`: its own copy removed.
- `js/game.f21a8035.js` (edited in place; the hook re-hashes it):
  - `STAT` outcome names and `sendQuestionStat()` (next to `postGameLog()`).
  - `onBoardTimeUp()` and `boardOutcome()` after `showQuestion()`.
  - `showQuestion()` and `onResetClick()` pass `onBoardTimeUp` as the timer's `onExpire`.
  - `backToBoard()` sends; `useSwap()` clears `timedOut`; `streakAnswer()` sends.
  - `beginGame()` and `startStreakRun()` start `statsSent: []`.
  - `isValidStatsSent()` is used by `isValidGame()` and `isValidStreak()`; `isValidCurrent()` checks `timedOut`.
  - The state comments are updated.
- `admin.html`: the hint line `#question-stats-hint`, the note `#question-stats-msg`, and two sortable `<th>` with `.sort-btn` buttons (`#sort-attempts-head`, `#sort-percent-head`).
- `js/admin.1df33c63.js` (edited in place):
  - The band constants and `STATS_SORTS`.
  - The section "Difficulty stats": `valueBands()`, `bandText()`, `needsCheck()`, `renderStatsHint()`, `attemptsCell()`, `percentCell()`, `sortedByStats()`, `renderSortButtons()`, `onSortClick()`.
  - `renderQuestions()` uses them; the empty row spans 10 columns; `state.statsSort`; the sort buttons are bound.
- `css/style.f2b43475.css` (edited in place): `.badge-check` (warning colours of `.msg-warning`), `.stats-cell`, the Questions-table cell padding and `.sort-btn` with its arrows. These are existing tokens and no new colours.
- `README.md`: the Admin "Questions" item, "Four public writes" under Security, and the deploy line.
- `docs/deploy-hostinger.md`:
  - Step 3: eight tables after a fresh import.
  - Step 4: `question-stats.php` in the upload list.
  - Step 8.4: a new "Question difficulty stats (Sprint 11)" step with the migration before the code, the upload list, the smoke check and the note on older saves.
- `docs/spec.md`: the file structure, Database, API and Admin "Questions panel" lines.

Not touched: `privacy.html` (see Decisions), `.htaccess` (it blocks paths and doesn't allow-list endpoints, so the new file is served like the others), `sw.js` (it never caches `api/`), `index.html` (no new game UI), `how-to-play.html` and `llms.txt` (nothing player-facing changed).

**New file to `git add`:** `api/question-stats.php`, `sql/migrate-add-question-stats.sql` and this note. There is no new JS or CSS file.

## Asset names
- `js/game.f21a8035.js`, `js/admin.1df33c63.js` and `css/style.f2b43475.css` were edited **in place under their current names**, so the local test in Chrome needs no rename. On commit the pre-commit hook re-hashes them and rewrites `index.html`, `admin.html` and the other pages that use `style.*.css`. Afterwards, check that `index.html` and `admin.html` point at the new names (FU-16).
- All changed and new files use CRLF in the working tree (checked: 0 LF-only lines in each).

## How to run / test
1. MariaDB running; run `C:/xampp/mysql/bin/mysql.exe -u root brainrush < sql/migrate-add-question-stats.sql`. This is already done locally, and the table is empty.
2. Start `C:/xampp/php/php.exe -S localhost:8000` from the project root.
3. Play a board game. Mark someone Correct and go **Back to Board**, let a timer run out, use Skip and Swap. Play a Streak run.
4. Open Admin → **Questions** and choose "All categories" / "All points". Check the **Attempts** and **% correct** columns and their tooltips, sort by each header, and read the hint line. A "Check value" mark needs 20+ attempts, so for a quick look seed a row in phpMyAdmin, for example `INSERT INTO question_stats VALUES (<id of a 200 question>, 0, 20, 0, 0);` (marked: 0% is outside 50–90%), then delete it.

## Verification done
All against my own `php -S localhost:8011` (the owner's 8000 server was left alone), PHP 8.0.30 and MariaDB 10.4.32.
- **Lint:** `php -l` passes on `api/question-stats.php`, `api/questions.php`, `api/db.php`, `api/reports.php` and `api/mcp.php`. `node --check` passes on both JS files. `api/questions.php` still loads in include-only mode for `api/mcp.php` (`streak_batch()` present).
- **Before the migration (table missing):**
  - POST → 503 "Question stats are not available right now."
  - The admin list → 200 with all 96 rows of category 1, with `attempts`, `percent_correct` and `stats` null. `reports.php?all=1` → 200.
  - (The first run gave 500, because native prepares fail inside `prepare()`, which was outside the `try`. That is fixed and re-tested.)
- **Migration:** run twice on the local DB, exit 0 both times; the second run gives only "Note 1050: Table 'question_stats' already exists".
  - A scratch DB (`brainrush_s11scratch`) took `sql/schema-hosted.sql` twice (exit 0) and the migration on top (exit 0), for **8 tables**. Its `SHOW CREATE TABLE question_stats` is identical to the local one. The scratch DB was dropped.
- **curl, `POST api/question-stats.php`:**
  - Each of `correct`, `wrong`, `nobody` and `timeout` → 201, and each counter went +1. id as the string "1" → 201.
  - These give 400: id 0, -3, 1.5, "abc", `true`, missing, 4294967296, an unknown id (999999, "does not exist"); outcome "Correct", "skip", an array or missing; a `[]` body; non-JSON.
  - Form-encoded → 415. GET and PUT → 405.
- **Upsert under load:**
  - 2 × 40 requests (20 at a time) on ids with no row → all 201, counts 40/40.
  - 30 mixed outcomes at once → 7/8/8/7.
  - Because `php -S` serves one request at a time, the real race was run with **20 parallel PHP processes × 25 upserts** of the same SQL on a fresh id → exactly 500, with 0 retries and 0 deadlocks.
- **Admin list API:**
  - `?category_id=1` keeps its order and adds the fields: no row → 0 / null / zeros; q1 → 4 / 25%.
  - `?sort=percent_correct` → 23, 25, 100, 100, 100, … with the questions that have no attempts last.
  - `?sort=bogus` → 400 and an unknown category → 404. A non-local Host → 403, as before.
  - The board payload is unchanged.
- **Cascade:** a temporary question created through the API was given a count and deleted through the API; its stats row was gone (0 rows).
- **Headless Chrome (Playwright with system Chrome; scripts outside the repo). The stats POST was intercepted and recorded; `game-log.php` and the Streak save were answered by the test, so no log line or leaderboard row was written.**
  - **Game script, 48 checks, all PASS** (board, saves, Golden Goal, Streak and Daily below; plus 2 more in the missing-table run):
    - A new game saves `statsSent: []`. Nothing is sent while a question is open.
    - Correct → `correct` with the cell's id; the body is only `{question_id, outcome}`.
    - Two Wrong → `wrong`; Wrong then Correct → `correct`; no mark → `nobody`.
    - Timer at 0 → `timedOut: true` saved → `timeout`. Time up, then Reset and a refresh → still `timeout`. Time up, then Wrong → `wrong`.
    - Skip with no mark → `nobody`.
    - Swap after a time-up: `timedOut` cleared, a single POST for the Swap question (`nobody`), and the swapped-away id is never sent.
    - A Kilo Meshakkal box → its source question's id (Food & Drink).
    - +/- corrections → nothing. An id already in `statsSent` → not sent again (after a refresh).
    - The send aborted (network) or answered 500 → back on the board, the cell closed, the game saved.
    - End to end without interception: 201, and the DB row for question 624 got `correct = 1`.
    - With the table renamed away: the send got 503 and play went on (the next cell was scored and closed).
    - No uncaught JS error.
  - **Saves:**
    - A save with `statsSent` removed loads on the board, sends nothing and gets no list.
    - `statsSent` as `"x"`, `[0]`, `[3,3]`, `[1.5]` or `{}`, and `timedOut: "yes"`, are each discarded to Setup with no JS error.
  - **Golden Goal** (`final_round_enabled` was already 1; I did not change it): a 0-0 tie, bets of 100, then Correct / Wrong → Results. **Nothing was sent.**
  - **Streak:**
    - A new run saves `statsSent: []`. Right → `correct`.
    - A refresh after answering, and a refresh on the open next question → nothing more.
    - Wrong → `wrong`, and `statsSent` holds both ids.
    - Time up → `timeout`.
    - End run with a question open → only the earlier answered question was sent.
  - **Daily Challenge** played to its result → nothing sent. Today's set already existed, so no `daily_challenge` row was written.
  - **Admin, 68 checks at 1366 and 1024 px, all PASS** (after the layout fix), using seeded test counters:
    - The headers include Attempts and % correct, and the hint line is exact for 100–500 (600 is disabled and not listed).
    - Marks for 14 cases:
      - 19 attempts at 0% → no mark; exactly 20 at 0% → mark.
      - 50% and 90% for 200 (band ends) → no mark; 49% and 95% → mark.
      - 99/200 → shows 50%, no mark.
      - 100% at 100 → no mark; 100% at 200 and 300 → mark; 23% at 400 → mark.
      - Disabled 600 at 0% with 30 attempts → 30 / 0%, no mark.
      - 1 attempt → no mark.
    - The tooltips read "Expected 50–90% for 200" and "0 correct · 10 wrong · 5 nobody · 5 time's up". A question with no row shows "0" and "-".
    - No horizontal page scroll at either width.
    - Sorting: % ascending with no attempts last, then descending, then back to the list order. Attempts → 500 first. Sorting works within the 200 filter and by keyboard (Enter); `aria-sort` follows.
    - **Bands from other enabled sets** (the points response was changed in the browser, not in the DB):
      - 100/300/500 → 60–100 / 40–80 / 20–60.
      - 100–600 → 60–100 / 52–92 / 44–84 / 36–76 / 28–68 / 20–60, with the 600 question then marked "Expected 20–60% for 600".
      - Only 100 → 40–80 (and 100% at 100 is marked, 200 questions get none).
      - 200/400 → 60–100 / 20–60.
      - None enabled → "no point value is enabled", no marks.
    - Table missing (renamed): the note names the migration, all 869 rows load with "-", and the Categories and Point values panels load.
    - No JS or console error.
  - Screenshots checked at 1024 and 1366: every column, Actions included, is visible with no scrollbar.
- **Not run:** a 401 check with a throwaway admin config. This sprint adds no admin-only endpoint, and the question list keeps its existing `require_admin()`.

## Data restored
Snapshot taken before any test: `settings`, `point_values`, `streaks`, `question_reports` and `daily_challenge` (mysqldump), the counts and max ids of `questions` and `categories`, and copies of every `logs/*.log`.
- `question_stats`: all 14 test rows deleted (ids 1, 2, 3, 4, 6 from curl; 31, 42, 43, 44, 189, 265, 609, 610 seeded for Admin; 624 from the end-to-end run). Before deleting I checked that no other row existed, so the owner had added none meanwhile. **The table stays, empty, as after the migration.**
- `questions`: the temporary cascade question (id 1719) was deleted through the API, and `AUTO_INCREMENT` was set back to 1719.
- The two renames of `question_stats` (missing-table tests) were reverted.
- After cleanup, a new dump of the five tables is **identical** to the snapshot (`diff` empty). The `questions` / `categories` / `daily_challenge` counts are identical, and all 7 log files are byte-identical (no new log file). Settings were never changed (`final_round_enabled` is still 1).
- My server on port 8011 was stopped. The test scripts and screenshots are in `%TEMP%\br-s11-tools`, outside the repo.

## Known limitations
- Counts can be faked by anyone (public POST, D-37 g); there is no rate limit and no Admin reset.
- A board outcome reflects how the host judged (US-47 risk). Board "correct" means anyone in the room knew it, and Streak has 3 choices, so both read higher than a solo free answer; the band's width allows for it (D-55 g).
- A board question left open when the game is abandoned (New Game from elsewhere, closed tab) never closes, so it is not counted.
- A game or run saved before this deploy sends no stats until a new one starts.
- The counters are `INT UNSIGNED` (about 4.29 billion per outcome).

## Fix loop 1 (BUG-11-01)

**Bug.** At 1024 px with a classic 15 px scrollbar (Windows Chrome), the Admin Questions table was 920 px inside a 915 px panel, so a 5 px inner horizontal scroll cut the Actions column. My first measurement missed it: Playwright's headless mode passes `--hide-scrollbars`, so the page was 1024 px wide instead of 1009.

**Fix (one rule, `css/style.f2b43475.css`, edited in place):** `#questions-panel .data-table td.name-cell { min-width: 7rem; }`. Only the Questions table's Category cell gets a smaller minimum; the shared rule (9rem) still applies to the other tables. There is no change to columns, text, colours, hover or focus rules.
- At 7rem the cell has 104 px for text. Every category name up to "Food & Drink" (101 px) still fits on one line. "Cartoons & Childhood" (168 px) wraps onto two lines, as it already did at 9rem.
- At 1280 and 1366 the table is wider than its minimum anyway, so the Category column stays 140-146 px wide (was 162-165).

**Measured** (Chrome with its real classic scrollbar: Playwright with `--hide-scrollbars` removed, so the viewport is 15 px narrower; all categories and points; "min table" = the table at `width: min-content`):

| Window | Panel | Min table before | Headroom before | Min table after | Headroom after |
|---|---|---|---|---|---|
| 1024 | 915 | 920 | **-5** (inner scroll) | 886 | **+29** |
| 1280 | 1171 | 920 | +251 | 886 | +285 |
| 1366 | 1257 | 920 | +337 | 886 | +371 |

- After the fix, at every width the table equals the panel (no inner scroll) and the page does not scroll (`scrollWidth` = viewport: 1009, 1265, 1351).
- Worst case with stats: two seeded rows (12345 and 99999 attempts, both marked "Check value") give the same 886 px minimum and the same headroom. Screenshots at 1024 and 1366 show every column, Actions included, inside the panel.

**Data:** a fresh snapshot was taken at the start of this loop. The two seeded rows were deleted. After cleanup the dump of `settings`, `point_values`, `streaks`, `question_reports`, `daily_challenge` and `question_stats` (0 rows) is identical to the snapshot, as are the counts, every AUTO_INCREMENT and all 7 log files. My port-8011 server was stopped.

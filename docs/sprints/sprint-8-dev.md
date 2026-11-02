# Sprint 8: Daily Challenge, share, weekly leaderboard (US-43, US-46, US-45, D-46): developer note

Branch `sprint-8`, 2026-11-02. Plan: `docs/sprint-plan.md` "Sprint 8 — Daily Challenge, share, weekly leaderboard", tasks 1-11, under the Epic E17 common rules. Built in the order US-43, US-46, US-45. Owner decision D-46 (FU-21): the day changes at **midnight UTC** (date, #N and countdown), and a challenge has **3 questions**. Each is set in one place:
- the time zone is `GAME_TIME_ZONE = 'UTC'` in `api/db.php`;
- the count is `DAILY_QUESTIONS = 3` in `api/daily.php`.

The browser takes both from the server's answer. It has no "3" and no time zone of its own: the number of squares is the number of questions it got, and the countdown is the server's `seconds_to_next`.

## Stories implemented
- **US-43 Daily Challenge.**
  - **Entry.** **📅 Daily Challenge** sits next to the Players / Teams toggle (and the Streak button), in any mode and with any number of players. It is hidden in maintenance mode and while the Streak setup is open. It uses the setup timer, checked like the board game's; a bad timer gives the inline error and starts nothing.
  - **The set.** `GET api/daily.php` works out today's date in UTC. On the day's first request it picks the questions and stores them in `daily_challenge` with `INSERT IGNORE` on the `(challenge_date, position)` primary key, then reads the set back. So simultaneous first requests still give one set, with no duplicate rows. The picks:
    - questions at enabled point values that can get 3 choices;
    - questions with stored wrong options first, so their choices are the same for everyone;
    - questions not used on an earlier day first;
    - one per category where possible;
    - ordered by points (easiest first).
  - **Choices.** They are cut at the first bracket like the Streak ones (`streak_question()` / `stored_choices()` reused). Their A/B/C order comes from a hash of the date, the question and the choice, so friends compare the same letters.
  - **Number.** `number` = days since the first stored day + 1, so #1 is the first day this database served a challenge (local and live each start at #1).
  - **Run.** The Streak layout of the question screen: "Daily Challenge #N", "Question 2/3", 3 choice buttons, the timer.
    - There is no Pause, Reset, Show Answer, scoring panel, helpers or End run.
    - Right shows "Correct!". A wrong pick or time's up shows "Wrong! / Time's up! The right answer was B, …" and scores 0. **Next question** goes on (Enter too), and **See result** after the last.
    - Arabic comes first when present; the language button switches the question, the choices and the feedback.
    - Report (US-42) appears once a question is answered.
    - Each opened question is added to the played list.
    - The run is saved under its own key `brainrush.daily` with a wall-clock deadline, so a refresh keeps the question and the time left. The board save (`brainrush.game`, version unchanged) and `brainrush.streak` are untouched.
  - **Result screen** (`#screen-daily`): "BrainRush Daily #N: 2/3", a row of green/red squares (with an `aria-label` "Question 1 right, …"), a short note ("Perfect!" on a full score), **Share**, **New Game** and "Next Daily Challenge in HH:MM:SS" (to midnight UTC). At 0 it shows "A new Daily Challenge is ready!" and **Play the new challenge**, which reuses the last timer.
  - **Played today.** A device that finished today's challenge gets the result and the countdown again from the Daily button, also after a reload. A refresh on the result screen keeps it. This is a device-only lock (accepted as D-37 g): clearing the site data allows a replay.
  - **Android app (US-40).** Back on an open Daily question asks "Leave today's Daily Challenge? …". OK ends the run and the questions left score 0; Cancel keeps it with the timer running. Back on an answered question acts as Next, and on the result it acts as New Game.
- **US-46 Share the game result.** **Share** sits next to New Game on Results. The texts:
  - one winner: "Team Red won BrainRush with 300! Team Blue 100, Team Green −200."
  - a tie (D-10 wording): "It's a tie between Ann and Bob in BrainRush with 100 each! Cy 0."
  - everyone tied: "It's a tie between Ann, Bob and Cy in BrainRush with 0 each!"

  Scores use the screen's minus sign. Both Share buttons go through the new `js/share.js`:
  - It adds the page's canonical URL (`https://brainrush.integration.ninja/`, read from `<link rel="canonical">`, not typed in JS).
  - On a touch device with the Web Share API (phones, and the Android app, which is Chrome), the share sheet opens. Closing the sheet (AbortError) shows nothing.
  - Otherwise, including desktop Chrome on Windows, which has a share dialog of its own, the text is copied and **Copied** shows for 4 seconds in a `role="status"` span.
- **US-45 Weekly streak leaderboard.**
  - **API.** `GET api/streaks.php?period=week` returns this week's top 10, Monday 00:00 to Monday 00:00 UTC (`game_week_bounds()`), with the same best-run-per-person rule (D-37). `?period=all` and no period behave as before. Any other value → 400 (`bogus`, empty, `WEEK`, `period[]=`).
  - **POST.** It now also answers `week_rank` and `week_best`.
  - **Screen.** The leaderboard has two pill toggle buttons, **This week** / **All time** (`aria-pressed`). All time shows first, so the screen opens as before. The list's `aria-label` follows the tab, and an empty week reads "No streaks this week yet. Be the first!".
  - **Rank line.** "You are #3 this week and #13 of all time." ("Your best is still B." first, as before).
  - **No schema change.** It uses `streaks.created_at`. The ad slot is unchanged (D-41).

## Files created / changed
- **New** `sql/migrate-add-daily-challenge.sql`: `CREATE TABLE IF NOT EXISTS daily_challenge` with:
  - `challenge_date DATE`, `position TINYINT UNSIGNED`, `question_id INT UNSIGNED`, `created_at`;
  - **PRIMARY KEY (challenge_date, position)**, which is the plan's unique key;
  - `UNIQUE uq_daily_question (challenge_date, question_id)`, so a question appears at most once a day;
  - `KEY idx_daily_question`, and `fk_daily_question` → `questions` ON DELETE CASCADE;
  - `utf8mb4_unicode_520_ci`.

  **Run twice on the local DB**; it needs to run on live **before** the code.
- `sql/schema.sql`, `sql/schema-hosted.sql`: the same table after `question_reports`. The bodies after the CREATE DATABASE/USE lines are identical (checked with `diff`).
- **New** `api/daily.php`: GET only (others → 405).
  - It includes `questions.php` with `QUESTIONS_INCLUDE_ONLY`, like `mcp.php`.
  - Main functions: `ensure_daily_set()`, `pick_daily_ids()`, `store_daily_ids()`, `daily_choices()`, `daily_number()`.
  - A missing table (error 1146), or no full set possible, gives 503 "The Daily Challenge is not available right now. Please try again later."; the details go only to the error log.
  - `DAILY_INCLUDE_ONLY` lets a test script call `daily_challenge()` for another day, as `questions.php` does.
- `api/db.php`: `GAME_TIME_ZONE`, `game_now()`, `game_day_bounds()`, `game_week_bounds()`.
- `api/streaks.php`: `best_runs(?week)` replaces the `STREAK_BEST_RUNS` constant, and `read_period()`, `current_week()` and `person_rank()` are new. The week filter is `created_at >= FROM_UNIXTIME(:from) AND < FROM_UNIXTIME(:to)`: `FROM_UNIXTIME` uses the same DB session time zone that `CURRENT_TIMESTAMP` stored the run in, so the UTC bounds match on a DB in any time zone (the local one is Africa/Cairo, +2).
- **New** `js/share.js`: `window.BrainRushShare.share(text, statusNode)` and `siteUrl()`.
- `index.html`:
  - the Daily button (`#daily-open-btn`);
  - ids for the Streak panel's label and hint;
  - Results **Share** and its status;
  - the leaderboard tabs;
  - `#screen-daily`;
  - `<script src="js/share.js">` before `game.js`.
- `js/game.0887b978.js` (edited in place):
  - The "Daily Challenge" section: save/load/validate, `fetchDaily()`, `onDailyOpen()`, `startDaily()`, the run and the result, the countdown, `restoreSavedDaily()`.
  - `renderRunLang()` / `renderRunChoices()` are shared by the Streak and the Daily runs (the Streak behaviour is unchanged), together with `setRunPanelTexts()` and `showWrongFeedback()`.
  - The Share section with `resultsShareText()`.
  - The leaderboard tabs and the two-rank line.
  - `goBack()`, `onKeyDown()`, `toggleLang()` and `reportTarget()` know the Daily run.
- `css/style.864c7129.css` (edited in place): `.lb-tabs` / `.lb-tab`, `.share-status`, `.btn-daily`, the Daily result styles, and the phone rules (48px tabs, smaller squares).
- `how-to-play.html`:
  - a new "📅 Daily Challenge" section (also in the contents);
  - Share in "Ending the game";
  - the weekly tab in the Streak section.
- `privacy.html`: "In your browser" says the Daily result stays on the device, and that Share sends nothing to us.
- `llms.txt`: the Daily Challenge, sharing and the weekly tab.
- `README.md`: How to play items 8-9, the leaderboard tabs, Refresh-safe, a Security note on the public `daily.php`, and the deploy line.
- `docs/deploy-hostinger.md`: step 3 (seven tables), the step 4 upload list (`daily.php`, `js/share.*.js`), and the new Sprint 8 migration step in 8.4 (before the code, upload list, smoke check).
- `docs/spec.md`: file structure, Database, API (`daily.php`, `streaks.php?period=`, the POST answer) and the game screens.

Not touched: `.htaccess` (it blocks paths and has no endpoint allow-list), `sw.js` (it never caches `api/` or js), `admin.html` / `js/admin.*.js` (no admin feature in this sprint), `terms.html`.

## Asset names (owner: before and after the commit)
- `js/game.0887b978.js` and `css/style.864c7129.css` were edited **in place under their current names**, so the local Chrome test needs no rename.
- `js/share.js` is a **new, unhashed** file.
- `.githooks/hash-assets.sh` only renames files that `git ls-files` lists, so **`js/share.js` must be staged (`git add js/share.js`) before the commit**. The pre-commit hook then:
  - renames it to `js/share.<hash>.js`;
  - renames the two edited files to their new hashes;
  - rewrites the references in every tracked `*.html` (only `index.html` loads `share.js`).

  If `js/share.js` is left unstaged, it is not committed and the live page would 404 on it.
- After the commit, check that `index.html` points at the new `js/game.*.js`, `js/share.*.js` and `css/style.*.css` (FU-16). Deploy order: migration on live first (phpMyAdmin), then the code, then purge the CDN (deploy guide 8.4).

## How to run / test
1. MariaDB running; `C:/xampp/mysql/bin/mysql.exe -u root brainrush < sql/migrate-add-daily-challenge.sql` (already done locally; the table is empty).
2. `C:/xampp/php/php.exe -S localhost:8000` from the project root, then open `http://localhost:8000/`.
3. Setup → **📅 Daily Challenge**: answer the 3 questions (try a wrong one, let one time out, refresh mid-question, switch to English), then check the result, **Share** ("Copied"; paste it), and **New Game** → **Daily Challenge** again (the result and countdown, no new run).
4. Results of a board game → **Share** (one winner, a tie, negative scores).
5. Streak setup → 🏆 leaderboard: **This week** / **All time**; finish a run to see both ranks.
6. To replay the Daily Challenge on the same device: delete `brainrush.daily` in DevTools > Application > Local Storage. To get a fresh set for today: `DELETE FROM daily_challenge WHERE challenge_date = UTC_DATE();`.

## Verification done
- `php -l` (PHP 8.0.30): `api/db.php`, `api/daily.php` and `api/streaks.php` have no syntax errors, and neither do `questions.php`, `mcp.php` and `reports.php`, which share the helpers. `node --check` on `js/game.0887b978.js` and `js/share.js`: OK.
- **Migration:**
  - Run twice on the local DB: exit 0 both times. The second run only gives the note "Table 'daily_challenge' already exists".
  - `SHOW CREATE TABLE` matches the file. Both schema files have the same table, and `diff` of their bodies shows only the expected header lines.
- **API (curl and PHP CLI against a temporary `php -S localhost:8011`, stopped afterwards):**
  - The first GET created 3 rows; the payload had `date`, `number` 1, `seconds_to_next` and 3 questions with 3 choices.
  - **Race:** `php -S` serialises requests, so 8 PHP CLI processes started on one barrier called `daily_challenge()` for an empty test day. All 8 got the same 3 ids, and the table held exactly 3 rows.
  - **UTC boundary** (PHP run with `date.timezone=Asia/Tokyo` to prove the PHP zone doesn't matter):
    - `2030-01-07T23:59:59Z` → 2030-01-07, `seconds_to_next` 1;
    - `2030-01-08T01:30+02:00` → still 2030-01-07;
    - `2030-01-08T00:00:00Z` and `2030-01-07T20:00-05:00` → 2030-01-08, a new set and #N+1.
  - **Refill:** a removed position was refilled with a new, different question. A real cascade: a temporary question in a day's set was deleted, and its row went with it. `questions` AUTO_INCREMENT was reset to 1719.
  - POST, PUT, DELETE and OPTIONS → 405.
  - **Table renamed away:** GET → 503 with the generic text.
  - **Weekly:** `game_week_bounds()` puts Sun 2026-11-01 23:59:59Z in the week of 26 Oct, and Mon 00:00Z in the week of 2 Nov. On the DB (Cairo +2):
    - a run at 01:59:59 local (Sunday 23:59:59 UTC) is not in `?period=week`;
    - a run at 02:00:00 local is;
    - all-time has both.
  - The POST gives `{rank, best, week_rank, week_best}`; the person match is case-insensitive in both periods.
  - `?period=` with `bogus`, empty, `WEEK` or `period[]=week` → 400. No period and `all` give the same list as before.
- **Headless Chrome (Playwright with system Chrome; scratch scripts outside the repo, deleted). 110 of 114 checks passed.** The 4 failures are test expectations, explained below: the clipboard check expected LF line breaks (Windows returns CRLF), and 3 page-height checks counted the existing footer.
  - **Daily, 1366x768.**
    - Setup: the button is on the mode row, also in Teams mode, and hidden in the Streak setup and in maintenance mode.
    - A bad timer gives the inline error, and nothing is saved.
    - The run's ids match the DB positions. It shows "Daily Challenge #1" and "Question 1/3"; there is no Pause/Reset, scoring, helpers, End run or Show Answer, and Report appears only once answered.
    - **The page height is exactly 768** on the open and the answered state of a text question, a Landmarks photo with the longest answer (Muhammad Ali Mosque) and a Flags SVG.
    - Arabic comes first; the toggle switches the question and the choices, and the language is saved.
    - Right, wrong and time's up give `results` [true, false, false]. A refresh 2.2 s into a 6 s question showed 4 s left.
    - The result reads "BrainRush Daily #1: 1/3" with squares green, red, red; the countdown ticks and is within 5 s of the real time to midnight UTC.
    - Share gives "Copied", and the clipboard reads `BrainRush Daily #1: 1/3`, the squares 🟩🟥🟥, then the link. (The check itself failed: Windows hands the clipboard back with CRLF, and the text is otherwise exact.)
    - A refresh on the result keeps it. New Game → Daily again shows today's result, also after a reload. A device clock that runs ahead (`nextAt` moved into the past) still shows today's result after the server's answer.
    - `brainrush.game` stays null.
  - **Phone 375x812 (touch).**
    - No horizontal scroll on setup, any question or the result, and the result fits 812 high. The Daily button is 48px.
    - A stubbed `navigator.share` got exactly `{text: "BrainRush Daily #1: 2/3\n🟩🟥🟩\nhttps://brainrush.integration.ninja/"}`, with no "Copied". An AbortError showed nothing.
    - The question pages scroll vertically on the phone, as the Streak run does. The panel stacks under the question and the Daily panel has one button fewer (no End run), so nothing is added.
  - **App mode** (`?source=twa`): Back + Cancel keeps the question; Back + OK ends at 0/3; Back on the result goes to setup.
  - **Table missing in the browser:** the Daily button shows the generic error and setup stays; a board game still starts. The only console line is the expected 503.
  - **Report on a Daily question:** posts that question's id (the request was routed, so nothing was stored).
  - **The Streak after a Daily run:** "Streak" label, its hint and End run are back.
  - **US-46:** single winner, tie (and the Results headline still reads "It's a tie between Ann and Bob"), negative scores, everyone at 0, six players in rank order, and Share after a refresh on Results all gave the exact texts above. On the phone, Share is 55px and there is no horizontal scroll.
  - **US-45:**
    - All time is shown first with 10 rows, in the unchanged "1. Name · N questions · 2 Nov 2026" format.
    - This week showed only the two runs after Monday 00:00 UTC; `aria-pressed` and the list label follow the tab.
    - A real run gave "You are #3 this week and #13 of all time.", and the This week tab highlights that person.
    - On the phone the tabs are 48px, with no horizontal scroll.
  - **The 3 height checks that failed are the existing footer, not the sprint's UI.** At 1366x768:
    - **Results with 6 players:** the screen content ends at 743px. The Share button is in the New Game row and adds no height.
    - **Leaderboard from setup:** the content ends at 653px.
    - **Leaderboard after a run** (headline, rank line, tabs, 10 rows, buttons): the content ends at about 741px.

    In all three the page is taller only because of the site footer (US-41, 105px plus its margin). It is shown on these screens and hidden only on the board and question screens, as before this sprint. The board and question screens were not changed in height (see above).
  - No script errors on any page.
- **Cleanup:**
  - `daily_challenge` is empty: every row was a test row, including the 2030 test days.
  - My 12 `streaks` rows (ids 11-22, names "zz …") were deleted, AUTO_INCREMENT is back to 11, and the 4 earlier rows are untouched.
  - `start_game_hidden` is back to 0.
  - `logs/game-2026-11-02.log` was cut back to its one line from before my tests (10:25).
  - The existing `question_reports` row (11:25, before this work) was left as it was.
  - The test server was stopped and the scratch files deleted. MariaDB is left running.

## Known limitations
- **Device-only lock (accepted, D-37 g):** clearing the site data, another browser or a private window allows another go. The answers are in the payload, as for the Streak.
- **The timer is the setup timer**, as the plan says, so players may compare results played with different timers.
- **Borrowed choices:** questions without a complete stored pair of wrong options are only picked when no question with one is left. Their borrowed wrong choices are drawn per request, so they can differ between players. All 869 local questions have stored options.
- **#N** counts from the first day a database served a challenge. If all of that first day's questions were later deleted (cascade), the numbering would shift.
- **Not logged:** Daily runs are not written to the game log (`game-log.php` is unchanged).
- **Leaderboard dates** are the UTC date since fix loop 1 (BUG-8-02). The Admin "Streak leaderboard" list still shows `created_at` as the DB stores it.
- **Copied text on Windows** comes back with CRLF line breaks; messaging apps show it the same.
- **A run across midnight UTC:** a run started before midnight UTC and finished after it is kept under the day it started.

## Fix loop 1

Fixes for 2 of the 3 Minor bugs in `docs/sprints/sprint-8-test-report.md`. The coordinator fixes BUG-8-01 (backlog wording).

- **BUG-8-03: an unfinished Daily run from an earlier day came back after midnight with fresh timers.**
  - `restoreSavedDaily()` in `js/game.0887b978.js` now checks a saved, unfinished run against its `nextAt` (the next midnight UTC, from the server's `seconds_to_next`). If the day is over, the run is closed (the questions not answered score 0) and its result screen opens. Because the countdown is already over, it shows "A new Daily Challenge is ready!" and **Play the new challenge**.
  - **Play the new challenge** asks the server for today's challenge, so the server's UTC date decides. If the server still says the same date, the result stays with a fresh countdown (unchanged behaviour).
  - The new `closeDaily(run)` holds the "score the rest 0, done" step, now shared with the end of a normal run and with Android Back's "Leave".
  - An unfinished run of the current day is still restored on its question, as before. The played-today lock is unchanged: it compares the saved date with the server's date.
- **BUG-8-02: a Sunday-night run (UTC) showed Monday's date on a non-UTC database.**
  - `GET api/streaks.php` now returns `date` as the run's date in `GAME_TIME_ZONE` (UTC, D-46) on both tabs, through one new helper, `game_date()` in `api/db.php`.
  - `best_runs()` also selects `UNIX_TIMESTAMP(created_at)`, which reads the stored time in the session time zone it was written in, the same rule as the week filter's `FROM_UNIXTIME()`.
  - The ranking, the best-run rule and the order (D-37) are unchanged; so are the POST answer and the Admin list.

Re-check (`php -l` on `api/db.php` and `api/streaks.php`; `node --check` on the game JS; a temporary `php -S localhost:8012`, stopped afterwards; headless system Chrome with a scratch script outside the repo, deleted): **15/15 passed.**
- **BUG-8-03:**
  - A run left unanswered on question 2, with its saved date set one day back and `nextAt` in the past, now opens on its result after a reload: `[true, false, false]`, "1/3", "A new Daily Challenge is ready!" and the Play button.
  - Play started today's run (date 2026-11-02 from the server) with the last timer (30). It finished at 3/3 with the countdown.
  - Daily again after New Game showed that result, with no new run.
  - An unfinished run of today was still restored on its question.
- **BUG-8-02** (local DB on Africa/Cairo, +2), checked with curl and in the browser:
  - A run at `2026-11-02 01:59:59` local (Sunday 23:59:59 UTC) now reads "1 Nov 2026" in All time and is not in This week.
  - A run at `2026-11-09 01:59:59` local (Sunday 8 Nov, 23:59:59 UTC) is in This week and reads "8 Nov 2026".
  - The earlier rows keep their dates (23 and 26 Oct), and the order of both lists is unchanged.
  - The POST still gives `{rank, best, week_rank, week_best}` (`#2` / week `#1` for the test run).
- **Regression:**
  - The Daily question at 1366x768 is 768 high, with "Question 1/3" and 3 choices.
  - Both leaderboard tabs work.
  - A streak of 0 gives "Only streaks of 1 or more go on the leaderboard.", and a run of 1 gives "You are #4 this week and #8 of all time."
  - No console errors.
- **Cleanup:** back to the state the tester recorded.
  - `daily_challenge` is empty.
  - `streaks` has ids 1, 8, 9 and 10, AUTO_INCREMENT 11.
  - `question_reports` has only id 1, AUTO_INCREMENT 2.
  - `questions` AUTO_INCREMENT is 1719, and `start_game_hidden` is 0.
  - `logs/game-2026-11-02.log` is back to its one 10:25 line.

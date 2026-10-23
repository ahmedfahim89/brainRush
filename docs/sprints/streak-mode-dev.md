# Streak Challenge (US-33, US-34, D-37): developer note

Change request outside the sprint cycle, branch `streak-mode` (from `main` 4582c9d, which already has the helpers, PR #51, and the wrong options for all 761 questions, PR #52), 2026-10-23.
Plan: owner-approved "Solo Streak Challenge + shared streak leaderboard". Its "ON HOLD" box overrides the body: reuse the helper's wrong-option columns, Admin fields, API checks and `choice_text()`; the migration only creates `streaks`; IDs US-33, US-34, D-37.

## Stories implemented
- **US-33 Streak Challenge.**
  - Setup: Players mode with exactly 1 entry shows "Start Streak Challenge" and "Streak leaderboard". The first click swaps the player row and the category picker for "First name" + "Last name" (1-30 characters; a one- or two-word player name is prefilled) and hides Start Game. "Back to a normal game" undoes it. The second click, or Enter in a name field, starts the run with the setup timer (same `validateTimer()`). Maintenance mode hides both buttons.
  - Questions come from `POST questions.php?streak=1` in batches of 20. When fewer than 5 are queued, the next batch is fetched in the background with the run's ids (played and queued) excluded. When nothing is left, the run ends with its streak. Every opened question is marked seen.
  - The question screen gets a `streak` class. Show Answer, Pause/Reset, the scoring panel and the helpers are hidden (CSS). A new `#streak-panel` sits in the scoring panel's column: the name with the player's color, "Streak N", 3 choice buttons (A/B/C, reusing the `.choice` look), a feedback line, Next question / See results, and End run.
  - A right pick adds 1, turns green and shows "Next question" (focused, so Enter works; Enter elsewhere on the page works too). A wrong pick or time's up ends the run: the pick turns red, the answer green, the feedback names the right answer, and "See results" appears. End run asks for confirmation, then saves.
  - Refresh: the run is saved under its own key, `brainrush.streak`, and validated on load (`isValidStreak()`). The open question keeps a wall-clock `deadline`; on restore the timer counts to it, capped at one full timer, so editing storage can't add time. If it already passed, the run ends as time's up. An answered question comes back answered. The board game's `brainrush.game` state and its checks are untouched.
- **US-34 Streak leaderboard.**
  - Game over: a streak of 1 or more is posted to `api/streaks.php`, then `#screen-leaderboard` shows "First Last: N in a row!" (or "No streak this time"), "You are #R on the leaderboard." (with "Your best is still B." first when an earlier run was better), the top 10 ("1. Ahmed Fahim  13 questions · 18 Oct 2026", this person highlighted), and Play again / New Game. If the save fails, an error with "Try again" shows, and the run stays in storage until it is saved. Leaving the screen first asks whether to drop it.
  - The setup "Streak leaderboard" button opens the same screen without the headline, with "Back".
  - Admin: a new "Streak leaderboard" panel lists every run (name, streak, date and time, newest first) with Delete (confirm first) and a Reload button. It loads on its own, so a DB without the table only breaks this panel.

## Files created / changed
- **New** `sql/migrate-add-streak.sql`: `CREATE TABLE IF NOT EXISTS streaks` (`first_name`/`last_name` `VARCHAR(30)`, `streak INT UNSIGNED`, `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`, keys `idx_streaks_person`, `idx_streaks_streak`, `utf8mb4_unicode_520_ci`). **Run on the local DB** (twice, no error). It is needed on live before the code.
- `sql/schema.sql`, `sql/schema-hosted.sql`: the same table, after `questions`.
- **New** `api/streaks.php`:
  - Public `GET`: top 10, best run per person via `ROW_NUMBER() OVER (PARTITION BY first_name, last_name ORDER BY streak DESC, created_at, id)`. The `_ci` collation makes the grouping case-insensitive.
  - Public `POST` → 201 `{rank, best}`. Control characters become spaces and repeated spaces collapse, then `require_text(…, 30)`. The streak is `parse_int` 1..100000.
  - Admin `GET ?all=1` and `DELETE ?id=` (404 for an unknown id).
- `api/questions.php`: `POST ?streak=1` → `streak_batch()`.
  - The pool is every question at an enabled point value, read with `CELL_COLUMNS`/`board_cell()`, minus `exclude`. The order comes from repeated `draw_from_pool()` calls (unseen first at random, then oldest seen). `parse_seen_ids($raw, 'exclude')` checks both lists.
  - `streak_choices()`: the stored pair is used when complete (and the Arabic pair when the question has Arabic) and it doesn't clash. Otherwise `borrow_choices()` takes 2 answers from the same category and kind (picture vs text), then any category of that kind. They need Arabic when the question has it, and must be distinct from the answer and each other after `fold_text()`. A borrowed choice that appears inside the full answer is skipped too, so an "(accept X)" alternative can't show up as a wrong choice. Questions still short of 2 are skipped.
  - All texts go through `choice_text()`. The choices are shuffled on the server with a new `shuffled()` (Fisher-Yates with `random_int`), and `correct` is the answer's index.
- `api/game-log.php`: mode `streak` (1 name "First Last", up to 61 characters, no categories) → `… | streak: First Last | categories: all`.
- `index.html`: ids on the player and category fieldsets, `#streak-block` (name fields), `#streak-btn` / `#streak-board-btn`, `#streak-panel` in the question layout, `#screen-leaderboard`.
- `js/game.6819355e.js` (edited in place; the hook re-hashes it):
  - The Streak Challenge sections: setup, run, leaderboard.
  - Small refactors: `renderQuestionText()` and `renderLangButton()` are split out of `renderQuestionLang()`, and `postGameLog()` out of `logGameStart()`.
  - `startTimer(seconds, remainingMs?, onExpire?)`, `showTimerAt()` and `timer.onExpire`. The board game's calls are unchanged.
  - `showScreen()` toggles `ALL_SCREENS`. `SCREENS`, used by the saved-game check, is unchanged.
  - `toggleLang()` and `onPauseClick()` have streak guards, and `newGame()` also clears the run.
- `css/style.6240296b.css` (edited in place): the setup name fields, the streak button, the `.question.streak` hiding rules, the streak panel and choice states, and compact leaderboard rows. `.result-row.is-me` shares the winner highlight. There are phone rules too.
- `admin.html`, `js/admin.45dd5b1c.js`: the Streak leaderboard panel (`loadStreaks()`, `renderStreaks()`, `deleteStreak()`).
- Docs:
  - `docs/product-backlog.md`: Epic E12 with US-33 and US-34, a status row and D-37.
  - `docs/spec.md`: file structure, DB, API, game screen 5, Admin and security.
  - `docs/sprint-plan.md`: status line.
  - `docs/deploy-hostinger.md`: migration step, upload list, five tables after a fresh import.
  - `README.md`: How to play item 6, refresh note, Admin usage, public writes, deploy line.
  - `how-to-play.html`: a "Streak Challenge (solo)" section, also in the contents.
  - `llms.txt`.
  - `terms.html`: "Your data" now mentions the leaderboard names.

Not touched: `.htaccess` (it blocks paths and doesn't allow-list endpoints, so `api/streaks.php` is served like the others) and `.claude/agents/question-producer.md`.

## How to run / test
1. `C:/xampp/mysql/bin/mysql.exe -u root brainrush < sql/migrate-add-streak.sql` (already done locally).
2. `C:/xampp/php/php.exe -S localhost:8000` from the project root, then open `http://localhost:8000/`.
3. Setup with 1 player: Start Streak Challenge, enter names, click again. Pick answers, refresh mid-question, let the time run out, try End run, Play again, and the setup leaderboard. In Admin, use the Streak leaderboard panel.

## Verification done
- `php -l` on `api/questions.php`, `api/streaks.php` and `api/game-log.php`: no syntax errors (PHP 8.0, XAMPP).
- curl against a temporary `php -S localhost:8010` (stopped afterwards):
  - **`questions.php?streak=1`:**
    - Batches of 20, with every question drawn exactly once (761 in 39 batches) when `exclude` grows, then `[]`.
    - Every question has 3 choices that are distinct (EN, and AR when the question has Arabic). `text_ar` is set exactly when `question_ar` is, no choice text contains "accept"/"يقبل", and `choices[correct]` is the start of the stored answer.
    - With `seen` = all but 25 ids, only unseen ones are drawn. With all seen, the oldest 20 come in seen order.
    - `correct` is uniform (413/396/391 over 1200).
    - `exclude` as a string, `seen:[0]` or a `[]` body → 400.
  - **Borrowing:** I cleared the pairs of questions 1 (Paris), 997 (USA flag), 275 (half pair) and 1274 (Eiffel Tower photo, Arabic pair incomplete), backing them up to a scratch table. All 4 got borrowed choices from their own category and kind, with Arabic. I restored the pairs afterwards (0 mismatches, 761/761 complete pairs) and dropped the scratch table.
  - **`streaks.php`:**
    - Missing, blank or 31-character last name → 400. Streak 0, 100001 or 2.5 → 400. A non-text name → 400. Not JSON → 415.
    - "test fahim" 5, then "Test Fahim" 7, then "TEST FAHIM" 7 → one row, streak 7, the earliest of the two 7s. A name with `\n`/`\t` is stored with spaces.
    - Admin `?all=1` and `DELETE` with a non-local Host → 403. `PUT` → 405. `DELETE` → 200, and again → 404.
  - **`game-log.php`:** `streak` + 1 name → 201 and the line `streak: Test Logname | categories: all`. 2 names or a 62-character name → 400. An unknown mode lists `streak`.
- Browser: headless Chrome with a test harness outside the repo (an iframe at 1366x768 and 375x812, driven by script). 55/55 checks passed:
  - Button visibility for 1 player, 2 players and Teams. Prefill, Back to a normal game, and the missing-name and bad-timer errors.
  - The streak layout hides scoring, Show Answer and Pause/Reset. No page scroll at 1366x768 on a question or on the leaderboard with 10 rows.
  - Arabic first, and the toggle switches the choices. A right pick gives +1 and Next. Enter loads the next question.
  - Refresh keeps the count, the question and the time left (27 s left after 3 s). A deadline pushed 1 hour ahead in storage is capped at 30.
  - 24 questions in a row cross a batch with no repeats.
  - A wrong pick shows red/green and See results, and is kept after a refresh. The leaderboard shows the headline, rank and highlighted row, and the run is cleared from storage after saving.
  - Play again works. End run shows "Your best is still 23". Time's up ends the run. A streak of 0 is not saved.
  - The setup leaderboard opens with Back. The board game still shows scoring, Show Answer and Pause, and Back to Board works.
  - Phone: no horizontal scroll, and the panel stacks under the question.
  - No JS errors.
  - Admin panel (headless): it lists the runs, and Delete confirms, deletes and reloads.
  - Screenshots checked by eye: setup, a text question in Arabic, a lost question, a photo question, the leaderboard and the phone view.
- Cleanup:
  - All test rows deleted from `streaks` (empty, AUTO_INCREMENT reset).
  - My test lines removed from `logs/game-2026-10-23.log`; the earlier lines are kept.
  - Temp harness files and Chrome profiles deleted.

## Known limitations
- **Fake scores (accepted, D-37 g).** The answers are in the batch payload and the POST is public, so a determined user can fake a score. The admin deletes such rows.
- **No rate limit on the POST.** Same as the game log.
- **Weak borrowed choices.** Borrowed wrong choices are random answers from the same category, so they can be easy to rule out (e.g. "Paris" vs "The Amazon"). Today every question has a stored pair, so this fallback is unused.
- **Accent-insensitive names.** A "person" is matched by the `utf8mb4_unicode_520_ci` collation, which is accent-insensitive as well as case-insensitive ("José" = "Jose"). The game's own row highlight compares lowercase text only.
- **Run date is server time.** It is the DB server's date (`created_at`), as the plan says, so it can differ from the player's local date around midnight.
- **A refresh on the leaderboard screen goes back to setup** (the leaderboard isn't saved). An unsaved run (failed POST) comes back and is saved again.

## Fix loop 1

Fixes for the 3 Minor bugs in `docs/sprints/streak-mode-test-report.md`.

- **BUG-ST-01: leaderboard row text.**
  - The meta span now starts with "· ", and a space text node separates the rank, the name and the meta. A row's text (`textContent` and `innerText`), and so what a screen reader reads, is exactly "1. First Last · N questions · DD Mon YYYY".
  - The layout is unchanged: the name is on the left and "· N questions · date" on the right, on one line, and the own-row highlight is kept. Spaces between flex items are not drawn. `renderLeaderboardRows()` in `js/game.6819355e.js`.
- **BUG-ST-02: game log message.**
  - In streak mode, `read_players()` in `api/game-log.php` now answers 400 "streak mode takes exactly 1 name ("First Last")" for 0, 2 or more names, or when `players` is missing.
  - Players and teams keep their message.
- **BUG-ST-03: full stop in the Arabic feedback.**
  - `showStreakFeedback(text, kind, answer)` now adds the right answer in its own `<bdi>` with `dir`/`lang` (rtl/ar or ltr/en, following the language toggle), followed by a separate "." text node. The English full stop now sits after the Arabic answer instead of at its left edge.
  - The text is still set with `textContent` / `h()` only.

Re-check:
- `php -l api/game-log.php`: no syntax errors.
- curl against a temporary `php -S localhost:8010`: 2 names, `[]` and a missing `players` in streak mode each gave the new 400; players mode still says "players must be a list of 1 to 6 names".
- Headless Chrome, 1366x768:
  - Arabic feedback: the answer is in `<bdi dir="rtl" lang="ar">` followed by "."; I checked by eye on a screenshot. After the language toggle, the answer is in `<bdi dir="ltr">` with the English text.
  - Leaderboard row text: "1. Fix Checker · 1 question · 23 Oct 2026". The name is on the left and the meta on the right, on one line, and the leaderboard still fits 1366x768.
- Cleanup: the test run removed from `streaks` (empty again, AUTO_INCREMENT reset), my "streak: Fix Checker" lines removed from `logs/game-2026-10-23.log`, the server stopped and the temp files deleted.

## Owner change 2026-10-23: streak buttons beside the mode toggle

The owner noticed that "Start Streak Challenge" at the bottom of setup is easy to miss: it sits below the fold at 1366x768 (Start Game is ~1060px down) and much further down on phones.
- `index.html`: "Streak Challenge (solo)" (`#streak-open-btn`) and "Streak leaderboard" (`#streak-board-btn`) now sit in a new `.mode-row`, next to the Players / Teams toggle. They wrap under it on narrow screens.
- The bottom `#streak-btn` "Start Streak Challenge" (always primary now) only shows while the streak setup is open, in Start Game's place.
- The streak setup gets its own "Streak leaderboard" button (`#streak-block-board-btn`) next to "Back to a normal game".
- `js`:
  - `onStreakClick` is split into `onStreakOpen` (open button) and `onStreakStart` (bottom button / Enter).
  - `updateStreakButtons()` shows the open and leaderboard buttons only in Players mode with 1 entry while the streak setup is closed.
  - Leaderboard Back focuses the button that opened it (`leaderboardOpener`).
- `css`: `.mode-row` (flex, wrap, 0.5rem gap).
- Checked in the browser pane:
  - At 1366x768 the buttons are on the toggle row (180px from the top). At 375x812 they are at 241 and 292px; no horizontal scroll.
  - Open, then the leaderboard, then Back keeps the name fields. Back to a normal game restores the toggle buttons.
  - With 2 players, or in Teams mode, the buttons are hidden.
  - No console errors.
- On a phone, the streak setup's start button sits about 220px below the first screen. Enter in a name field also starts the run.

## Owner change 2026-10-23: leaderboard button only in the streak setup

- The "Streak leaderboard" button is removed from the mode row. The streak setup already has one, so the main page only shows "Streak Challenge (solo)" beside the toggle.
- The streak setup's button (now `#streak-board-btn`) reads "🏆 Streak leaderboard"; the emoji is `aria-hidden`.
- It has a new `.btn-leaderboard` style: gold text, a 2px gold border, a soft gold gradient and a glow, with a stronger glow on hover.
- JS: the second button reference and `leaderboardOpener` are removed again; Back focuses `#streak-board-btn`.
- Checked in the browser pane: the main row shows only the challenge button. In the streak setup the leaderboard button is gold and glowing, opens the leaderboard (rows load), and Back returns focus to it.

## Owner change 2026-10-23: one Challenger name field

- Setup: one input `#streak-name` labelled "Challenger name" (with `#streak-name-error`) replaces "First name" + "Last name". It is required, 1-30 characters after trimming and collapsing spaces (NAME_MAX, D-22, as player names). When empty, it is prefilled from the player's typed name (cleaned, cut to 30). It gets the focus on open, and Enter in it starts the run (the existing `onStart` path). The `.streak-names` two-field layout is gone; the field uses `.field` plus `.streak-name-field` (max 24rem wide).
- The question screen's name line already had the id `streak-name`, so it is now `#streak-run-name` (class `.streak-name` and its look are unchanged). This avoids two elements with one id.
- Saved run (`brainrush.streak`): `name` instead of `firstName`/`lastName`. A run saved in the old shape fails validation and is discarded (the feature is not released). Play again, the headline ("Name: N in a row!"), the own-row highlight (lowercase compare) and the game log use `name`.
- `api/streaks.php`: body `{ name, streak }`; GET → `{name, streak, date}`; `?all=1` → `{id, name, streak, created_at}`. Best run per person is `ROW_NUMBER() OVER (PARTITION BY name ...)`, case-insensitive through the `_ci` collation. 400 "Challenger name is required" / "Challenger name must be at most 30 characters". Control characters still become spaces.
- `api/game-log.php`: a streak sends one name of up to 30 characters (`GAME_LOG_STREAK_NAME_MAX` removed); 400 "streak mode takes exactly 1 name"; line `… | streak: <name> | categories: all`.
- DB: `streaks.name VARCHAR(30) NOT NULL` + `KEY idx_streaks_name (name)` replace `first_name`/`last_name`/`idx_streaks_person` in `sql/migrate-add-streak.sql`, `sql/schema.sql` and `sql/schema-hosted.sql` (the table is not on live yet, so the definition changed in place). The local table was converted in place: `name` added and filled with `CONCAT(first_name, ' ', last_name)` cut to 30, old columns and index dropped, new index added. The existing row ("Ahmed Fahim", 2) is kept. `SHOW CREATE TABLE streaks` now matches a table created from the migration (checked in a scratch database, dropped afterwards; the migration also ran twice there without error).
- Admin: the Streak leaderboard panel shows `run.name`; the hint in `admin.html` now says one row per challenger name.
- Texts: `docs/product-backlog.md` (US-33, US-34, D-37, with an "Amended 2026-10-23 (owner)" note), `docs/spec.md`, `docs/deploy-hostinger.md`, `README.md`, `how-to-play.html`, `terms.html` and `llms.txt` say "challenger name". Leaderboard rows read "Name · N questions · DD Mon YYYY".
- Checked:
  - `php -l` on `api/streaks.php` and `api/game-log.php`: no errors.
  - curl on a temporary server: POST with `name` → 201. "zz test runner" and "ZZ TEST RUNNER" counted as one person with the best run. Tabs and double spaces are cleaned. Missing, blank, 31-character, non-text or old `first_name`/`last_name` body → 400. Streak 0 → 400. GET and `?all=1` return the new shapes. game-log: a 30-character streak name → 201, 31 → 400, 0 or 2 names → 400, players mode unchanged.
  - Headless Chrome run of the real page: label, prefill, focus, empty and too-long errors, Enter start, saved `name` key, refresh keeps the run, headline, rank, highlighted own row, Play again, and an old-shape saved run is discarded. No script errors. The admin table lists runs by name.
  - The test rows and test log lines were removed afterwards.

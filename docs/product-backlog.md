# BrainRush — Product Backlog

Owner: Product Owner. Source of truth: `docs/spec.md`.
Priority: **Must** (needed for a playable, safe release) / **Should** (strongly expected) / **Could** (nice to have).

Terms: "contestant" = a player or a team (identical rules; only the limits and labels differ). "N" = `categories_per_game` setting. "Point values" = all rows of `point_values`, sorted ascending. "Board" = N columns × (number of point values) rows.

---

## Epic E1 — Game Setup

### US-01 Choose play mode (Must)
As a host, I want to choose Players or Teams mode, so that the game fits how my group plays.
- **Given** the setup screen, **when** it loads, **then** a Players/Teams toggle is shown with Players selected by default and one empty name input.
- **Given** Players mode, **when** the host adds names, **then** at most 6 inputs can exist ("Add" is disabled at 6).
- **Given** Teams mode, **when** the host adds names, **then** at most 4 inputs can exist ("Add" is disabled at 4).
- **Given** 5 or 6 names were entered in Players mode, **when** the host switches to Teams, **then** "Start Game" is blocked with a message "Teams mode allows at most 4 teams" until extra entries are removed (see D-07).

### US-02 Enter contestant names (Must)
As a host, I want to add and remove contestant names, so that everyone who plays is on the scoreboard.
- **Given** the setup screen, **when** the host clicks "Add", **then** a new name input appears (up to the mode limit); **when** the host clicks "Remove" on an entry, **then** it disappears, but at least 1 entry always remains.
- **Given** any entry is empty or whitespace-only, **when** the host clicks "Start Game", **then** the game does not start and an inline error "Name is required" is shown on that entry.
- **Given** two entries have the same name ignoring case and surrounding spaces (e.g. "Ann" and " ann"), **when** the host clicks "Start Game", **then** the game does not start and an inline error "Names must be unique" is shown.
- **Given** a name containing HTML such as `<b>x</b>`, **when** it is shown anywhere in the game, **then** it is rendered as literal text.

### US-03 Distinct contestant colors (Must)
As a host, I want each contestant to get a distinct color, so that the board shows at a glance who won each cell.
- **Given** a 6-color palette, **when** entries are added, **then** each entry is auto-assigned a color not used by any other entry, shown as a swatch.
- **Given** an entry's swatch, **when** the host clicks it, **then** its color changes to the next palette color not used by another entry (colors always stay distinct).
- **Given** an entry is removed, **when** a new entry is added, **then** the freed color is available again.

### US-04 Pick categories (Must)
As a host, I want to pick 1 to N categories from the playable ones, so that the board has as many columns as I chose, up to the configured maximum. *(Amended 2026-10-11, D-32: was "exactly N".)*
- **Given** the setup screen, **when** it loads, **then** it shows a checklist containing only playable categories (from `categories.php?playable=1`) and the text "Select up to N categories" with N from settings.
- **Given** N categories are checked, **then** the unchecked boxes are disabled until one is unchecked. *(Added 2026-10-11, D-32.)*
- **Given** 0 categories are checked, **when** the host clicks "Start Game", **then** the game does not start and an error says at least 1 must be selected. **Given** 1 to N are checked, **then** the game starts with that many columns, in tick order. *(Amended 2026-10-11, D-32: was "fewer or more than N → error that exactly N must be selected".)*
- **Given** no playable category exists, **when** setup loads, **then** a message says "No playable categories — add questions in Admin" with a link to `admin.html`, and Start is disabled. *(Amended 2026-10-11, D-32: was "fewer than N playable categories".)*

### US-05 Set timer for this game (Should)
As a host, I want to override the timer for this game, so that I can adapt to the group without changing admin settings.
- **Given** settings `timer_seconds = 30`, **when** setup loads, **then** the timer field is pre-filled with 30.
- **Given** the host enters a value outside 5–600 or a non-integer, **when** they click "Start Game", **then** the game does not start and an inline error is shown.
- **Given** the host sets 20, **when** the game is played, **then** every question countdown starts at 20 and the admin setting is unchanged.

### US-06 Start game (Must)
As a host, I want "Start Game" to load the board questions, so that play can begin.
- **Given** valid setup, **when** the host clicks "Start Game", **then** the app calls `questions.php?board=1&categories=<ids>` and shows the Board screen with all contestants at score 0.
- **Given** the API call fails, **when** the host clicks "Start Game", **then** an error message is shown and the host stays on setup with inputs intact.

### US-31 Surprise me! (Should)
As a host, I want a "Surprise me!" choice in the category list, so that the game can pick random categories for us, alone or as a mystery column next to our picks. *(Added 2026-10-22, D-33.)*
- **Given** at least one playable category, **when** setup loads, **then** a "Surprise me!" tile is shown first in the category list. It counts as one of the N selections, gets a tick-order badge and is locked at N like the other boxes.
- **Given** only "Surprise me!" is ticked, **when** the host starts, **then** the board has 3 random playable categories (fewer when N or the number of playable categories is smaller).
- **Given** "Surprise me!" is ticked with other categories, **when** the host starts, **then** it becomes 1 random playable category that is not already picked, in the column of its tick order.
- **Given** every playable category is already picked as well as "Surprise me!", **when** the host clicks Start, **then** an error says so and the host stays on setup with inputs intact.
- **Given** a randomly picked column, **then** its board header shows "?" until a question in that column is opened; from then on (also after a refresh) it shows the real name. The question screen always shows the real name.

---

## Epic E2 — Board

### US-07 Dynamic board grid (Must)
As a host, I want the board built from configuration, so that any number of categories and point values works.
- **Given** N selected categories and P point values, **when** the board is shown, **then** it has a header row with the N category names (in selection order) and P rows of cells labeled with the point values in ascending order.
- **Given** settings N=6 and point values 100,200,300,400,500,1000, **when** a game starts, **then** the board is 6 columns × 6 rows.
- **Given** a point value of 10000, **when** the board is shown, **then** the label fits inside its cell without overflow or wrapping (font scales down).

### US-08 Answered cell state and color (Must)
As a host, I want used cells disabled and colored by the winner, so that everyone sees who took each question.
- **Given** a question where contestant X was marked Correct, **when** the host returns to the board, **then** that cell is disabled, filled with X's color and shows X's name in small text.
- **Given** a question where nobody was marked Correct, **when** the host returns to the board, **then** that cell is disabled and grey.
- **Given** a disabled cell, **when** the host clicks it, **then** nothing happens.

### US-09 Scoreboard and manual adjustment (Must)
As a host, I want a scoreboard with correction buttons, so that I can fix scoring mistakes.
- **Given** the board, **when** it is shown, **then** a strip lists every contestant in their color with name and current score; negative scores are shown with a minus sign.
- **Given** a contestant's "+" / "−" button, **when** the host clicks it, **then** the score changes by the smallest configured point value (see D-05) and no cell color changes.

### US-10 End game (Must)
As a host, I want to end the game at any time, and be offered to end it when the board is done, so that we can see the winner.
- **Given** the board with unused cells, **when** the host clicks "End Game" and confirms, **then** the Results screen is shown; unused cells are ignored.
- **Given** the last unused cell has just been marked used, **when** the board is shown, **then** the app prominently offers "End Game" (all cells used — regardless of board size, see D-01).

---

## Epic E3 — Question & Timer

### US-11 Open a question (Must)
As a host, I want clicking a cell to show its question large, so that everyone can read it.
- **Given** an unused cell, **when** the host clicks it, **then** a question screen shows "<Category> – <points>" and the question text in large type, with the answer hidden.
- **Given** the question screen, **when** the host clicks "Show Answer", **then** the stored answer is revealed.

### US-12 Countdown timer (Must)
As a host, I want an automatic countdown, so that answers are time-boxed.
- **Given** a game timer of T seconds, **when** a question opens, **then** a countdown starts at T automatically and shows a number and a shrinking bar.
- **Given** the countdown, **when** remaining time ≤ T/3, **then** the number and bar turn red.
- **Given** the countdown, **when** it reaches 0, **then** the timer stops at 0 and shows "Time's up!" without any sound, and scoring buttons stay usable (see D-03).
- **Given** a running timer, **when** the host clicks "Pause", **then** it stops; **when** "Resume", **then** it continues from the same value; **when** "Reset", **then** it returns to T and runs.

### US-13 Back to board (Must)
As a host, I want to return to the board, so that the next question can be picked.
- **Given** an open question, **when** the host clicks "Back to Board", **then** the timer stops, the cell is marked used (colored or grey per US-08) and the board is shown.

---

## Epic E4 — Scoring

### US-14 Correct / Wrong per contestant (Must)
As a host, I want to mark each contestant Correct or Wrong, so that points are awarded or deducted.
- **Given** a 300-point question, **when** it opens, **then** each contestant has a row in their color with "✓ Correct (+300)" and "✗ Wrong (−300)".
- **Given** the host clicks Wrong for A, **then** A's score decreases by 300 (may go below 0) and both of A's buttons disable.
- **Given** the host clicks Correct for B, **then** B's score increases by 300, B becomes the cell owner, B's buttons disable and every other contestant's Correct button disables.
- **Given** B was marked Correct, **when** the host clicks Wrong for an unscored contestant C, **then** C loses 300 (spec allows Wrong for remaining contestants).
- **Given** any question, **then** each contestant can be scored at most once, and at most one contestant can be marked Correct.

---

## Epic E5 — Results

### US-15 Results and winner (Must)
As a host, I want a results screen, so that we know who won.
- **Given** the game ended, **when** Results is shown, **then** contestants are listed by score descending with their color and the single highest scorer is highlighted as winner.
- **Given** two or more contestants share the highest score, **then** all of them are highlighted and the text reads "It's a tie between X and Y" (3+ names: "X, Y and Z").
- **Given** a single contestant, **then** that contestant is the winner.

### US-16 New game (Must)
As a host, I want to start a new game, so that we can play again.
- **Given** the Results screen, **when** the host clicks "New Game", **then** saved game state is cleared and the empty Setup screen is shown with current settings.

---

## Epic E6 — Persistence

### US-17 Survive page refresh (Must)
As a host, I want the game state saved locally, so that an accidental refresh doesn't lose the game.
- **Given** a game in progress on the board, **when** the page is refreshed, **then** the board, used cells/colors, contestants, colors, scores and timer length are restored exactly.
- **Given** a question was open, **when** the page is refreshed, **then** the same question reopens with the scoring already done preserved and the timer restarted at full length (see D-04).
- **Given** the Results screen, **when** refreshed, **then** Results is shown again.
- **Given** no saved game (or corrupt saved data), **when** the page loads, **then** Setup is shown with no JS error.

---

## Epic E7 — Admin

### US-18 Admin settings (Must)
As an admin, I want to edit categories-per-game and default timer, so that games fit our needs.
- **Given** the admin page, **when** it loads, **then** the current values are shown.
- **Given** categories_per_game in 1–10 and timer_seconds in 5–600, **when** saved, **then** a success message is shown and the values persist after reload.
- **Given** an out-of-range or non-integer value, **when** saved, **then** an inline error is shown and nothing is changed.

### US-19 Manage point values (Must)
As an admin, I want to add and delete point values, so that the board scale can change.
- **Given** the point values panel, **then** values are listed ascending, each with the number of questions that use it.
- **Given** a new positive integer not yet in the list (e.g. 1000), **when** added, **then** it appears in the list with 0 questions, and every category without a 1000 question becomes not playable ("missing 1000", US-20). *(Amended 2026-10-11, D-31 amended: was "a new row/column in the coverage grid"; the grid stays retired.)*
- **Given** a duplicate, zero, negative or non-integer value, **when** added, **then** an inline error is shown (duplicate → 409).
- **Given** a value with no questions, **when** delete is confirmed, **then** it is deleted (HTTP 200) and disappears.
- **Given** a value still used by questions, **when** delete is confirmed, **then** it is blocked with a clear inline error (HTTP 409) and nothing is deleted. *(Re-instated 2026-10-11, D-31 amended: the first Sprint 6 version had retired this rule.)*

### US-20 Manage categories (Must)
As an admin, I want to add, rename and delete categories, so that content stays fresh.
- **Given** the categories panel, **then** each category shows its total question count (e.g. "25 questions") and a status: "Playable" when it has at least one question for every point value, otherwise "Not playable: missing V1, V2" listing every point value with no question, ascending (e.g. "Not playable: missing 600"). *(Amended 2026-10-11, D-31 amended: was a count "x / P"; the first Sprint 6 version showed "M questions (needs P)" / "X more needed".)*
- **Given** a non-empty unique name, **when** added or renamed inline, **then** the list updates.
- **Given** an empty name or a name already used (case-insensitive), **when** saved, **then** an inline error is shown (duplicate → 409).
- **Given** a category with questions, **when** the admin clicks delete, **then** a confirm dialog warns its questions will also be deleted; **on confirm** the category and its questions are removed; **on cancel** nothing changes.

### US-21 Manage questions (Must)
As an admin, I want to add, edit and delete questions, so that each category has a pool of questions per point value to draw from. *(Amended 2026-10-11, D-31 amended: each question has a point value again, but any number of questions may share a category and point value; the former one-per-slot and free-slot criteria stay retired.)*
- **Given** the questions panel, **then** the table has columns Category / Points / Question / Answer and is sorted by category name, then points ascending, then id; **when** a category filter is chosen, **then** it shows only that category's questions in the same order.
- **Given** the Add/Edit form, **then** it has a category dropdown, a required points dropdown listing **all** point values ascending (no free-slot filtering), and question and answer fields.
- **Given** valid category, existing point value, non-empty question and answer, **when** saved, **then** the question appears in the table, even if the category already has questions at that point value, and the category status (US-20) and point-value counts (US-19) update.
- **Given** no point value is chosen, **when** saved, **then** an inline error is shown and nothing is saved.
- **Given** a category that already has a question with the same text ignoring case (e.g. via a stale form or direct API call), **when** a question is saved with that text in that category, **then** an inline error "This category already has this question" is shown (HTTP 409) and nothing changes. The same text in a different category is allowed.
- **Given** an existing question, **when** edited (including moving it to another category or point value), **then** changes persist; an edit that would duplicate another question's text in the target category gives the 409 error.
- **Given** a question, **when** deleted and confirmed, **then** it is removed.

### US-22 Coverage grid (Should) — RETIRED 2026-10-11 by D-31
**Retired:** there is no longer one question per slot, so the grid is removed from the admin page (the owner disliked the slot UI). Its purpose, seeing which categories need more content, is covered by the categories status "Not playable: missing V" (US-20) and the per-value counts in the point values panel (US-19). It stays retired under the D-31 amendment of 2026-10-11. The criteria below are kept for history only and are not tested any more.

As an admin, I want a categories × points grid, so that I can see which slots are missing.
- **Given** categories and point values, **when** the coverage grid is shown, **then** each cell is visibly marked filled or empty.
- **Given** a newly added point value, **then** a new empty column/row appears for every category, and categories lacking it are no longer playable in game setup.

### US-23 Admin usability (Should)
As an admin, I want clear errors and navigation, so that I can work without guessing.
- **Given** any API validation or 409 error, **then** the message is shown inline next to the relevant panel (no silent failure, no raw JSON/stack trace).
- **Given** the admin page, **then** a link back to the game is visible; the game page has a link to admin.

---

## Epic E8 — API & Data

### US-24 Schema and seed (Must)
As a developer/host, I want a schema with seed data, so that the game is playable immediately after install.
- **Given** an empty MariaDB 10.4 server, **when** `sql/schema.sql` is run, **then** database `brainrush` (utf8mb4) exists with tables settings, point_values, categories, questions; settings are categories_per_game=5, timer_seconds=30; point values 100–500; 6 categories (Geography, Science, History, Sports, Movies, Technology) each with 25 questions, 5 per point value: the original seed question plus 4 from `docs/question-bank.md`, with the points listed there. *(Amended 2026-10-11, D-31 amended: was 5 questions each, one per point value.)*
- **Given** the schema, **then** `questions` has a required `points` column with an FK to point_values(points) ON UPDATE CASCADE, ON DELETE RESTRICT; a case-insensitive unique key on (category_id, question); an FK to categories with ON DELETE CASCADE; and **no** unique key on (category_id, points). *(Amended 2026-10-11, D-31 amended: the slot key `uq_slot` is removed; the points column and its FK stay.)*
- **Given** the schema has already been imported, **when** `sql/schema.sql` (or `sql/schema-hosted.sql`) is imported again, **then** it completes without errors and creates no duplicate rows (still 150 questions). Added 2026-10-11 (D-31).

### US-25 API endpoints and validation (Must)
As a front-end, I want consistent JSON endpoints, so that the UI can rely on them.
- **Given** any endpoint, **then** responses are JSON with an appropriate HTTP status (200/201 success, 400 validation, 404 not found, 405 wrong method, 409 conflict, 500 server error with a generic message).
- **Given** `categories.php?playable=1`, **then** only categories with at least one question for every point value are returned (and none when there are no point values). *(Rule unchanged from Sprint 1; the first Sprint 6 version briefly used a count rule, reverted by the D-31 amendment of 2026-10-11.)*
- **Given** `questions.php?board=1&categories=1,2`, **then** the response is `{ points: [...ascending], categories: [{id, name, questions: {<points>: {question, answer}}}] }` in the requested order, each cell filled by a random draw per US-30; unknown or non-numeric ids → 400; a category with no question for some point value → 400 (US-30).
- **Given** missing/empty name/question/answer, missing or nonexistent points on a question, nonexistent category, or settings out of range, **then** the API returns 400 with a readable `error` message and changes nothing. *(Amended 2026-10-11, D-31 amended: `points` on a question is required again and must exist in point_values.)*
- **Given** `points.php` GET, **then** each value includes its question count; **given** DELETE of a value still used by questions, **then** 409 with a readable `error` and nothing deleted.

---

## Epic E9 — Security

### US-26 SQL injection protection (Must)
As the owner, I want all SQL parameterised, so that the database cannot be injected.
- **Given** the PHP code, **then** every query with input uses PDO prepared statements with bound parameters (no string-concatenated input), and PDO uses `ERRMODE_EXCEPTION`.
- **Given** input like `'; DROP TABLE questions; --` as a category name, **when** saved, **then** it is stored literally and no table is affected.

### US-27 XSS protection (Must)
As the owner, I want user text rendered safely, so that scripts cannot run.
- **Given** a category/question/answer/contestant name `<img src=x onerror=alert(1)>`, **when** shown in game or admin, **then** it displays as text and no script runs.
- **Given** the JS code, **then** data is rendered via `textContent` / DOM APIs, never `innerHTML` with data.

### US-28 No secrets in git (Must)
As the owner, I want credentials kept out of the repository, so that nothing leaks to GitHub.
- **Given** the repo, **then** `api/config.php` is listed in `.gitignore` and not tracked; `api/config.example.php` contains placeholders only.
- **Given** the README, **then** it explains copying the example config, setting own credentials, and how admin writes are protected (amended by D-20: admin credentials for public hosting, loopback-only writes otherwise).
- **Given** an API error, **then** the response never includes DB credentials, DSN or stack traces.

### US-29 Hosted deployment with protected admin (Must)
As the owner, I want to deploy BrainRush to Hostinger shared hosting as a public staging site with the admin side password-protected, so that stakeholders can play it after each sprint without anyone else changing content (see D-20).
- **Given** admin credentials are configured in `api/config.php`, **when** a POST/PUT/DELETE is sent to any `api/*.php` without credentials or with a wrong username/password, **then** the API returns 401 with header `WWW-Authenticate: Basic` and a JSON `error`, and nothing is changed.
- **Given** admin credentials are configured, **when** a write is sent with the correct credentials, **then** it behaves as before (200/201/400/409 per US-25).
- **Given** no admin credentials are configured, **when** a write is local — client address is loopback (127.0.0.1 / ::1) **and** the `Host` is `localhost` / `127.0.0.1` / `[::1]` **and** no `X-Forwarded-For` / `X-Real-IP` / `Forwarded` header is present — **then** it succeeds as before; **when** any of these does not hold (other address, custom host name such as `brainrush.local`, or a proxy), **then** the API returns 403 with a human-readable `error` (e.g. "Admin changes are disabled: configure admin credentials in api/config.php") and nothing is changed.
- **Given** any configuration, **when** GET requests are sent (settings, points, categories incl. `?playable=1`, questions incl. `?board=1`), **then** they work without credentials and the game is fully playable. Answers being readable via GET is an accepted limitation (D-20).
- **Given** a protected deployment, **when** `admin.html` loads, **then** the browser prompts for login before any data can be changed; **when** the login is cancelled or fails, **then** an inline message (e.g. "Login required to change content") is shown in the admin page, never raw JSON or a blank page.
- **Given** the repo, **then** admin credentials exist only in the git-ignored `api/config.php` as username + `password_hash()` output (no plain-text password anywhere); `api/config.example.php` shows placeholder keys and how to generate the hash.
- **Given** a request to a non-localhost host over HTTP, **then** `.htaccess` redirects it (301) to HTTPS; localhost / `php -S` is not affected.
- **Given** the hosted site, **then** the `Authorization` header reaches PHP (Basic Auth works under Hostinger's Apache/LiteSpeed), directory listing is disabled, and web requests to `sql/`, `docs/`, `.claude/`, `README.md` and `api/config*.php` return 403 or 404 (no content shown).
- **Given** an existing empty database on the host, **when** `sql/schema-hosted.sql` is imported via phpMyAdmin, **then** it succeeds without errors and produces the same tables, keys and seed data as `sql/schema.sql`; it contains no `CREATE DATABASE` or `USE` statement. Any schema change must update both files in the same sprint.
- **Given** `docs/deploy-hostinger.md`, **then** it covers: creating the database and user in hPanel, phpMyAdmin import, which files to upload (and which to exclude), creating `api/config.php` with DB settings and admin hash, enabling HTTPS/SSL, a smoke test (game plays, admin write prompts for login, blocked paths return 403/404) and the redeploy-after-sprint steps (without overwriting `api/config.php` or live data).

---

## Epic E10 — Question bank

### US-30 Question bank (Must)
As a host, I want each new game to draw a random question for every board cell from a pool per category and point value, so that the same group can play again without seeing the same board (D-31, added 2026-10-11; **rewritten 2026-10-11 by the D-31 amendment**: questions keep a point value, and the pool is per (category, point value)).

Terms: a "cell pool" = all questions of one category with one point value.

*Data and rules*
- **Given** the admin or the API, **when** a question is created or edited, **then** it has a category, a required point value that exists in `point_values`, a question text and an answer; a missing or unknown point value → 400.
- **Given** a category and point value that already have a question, **when** another question (different text) is saved for the same category and point value, **then** it succeeds (201/200): there is no one-per-slot limit.
- **Given** a category with at least one question for every point value, **then** it is playable and listed by `categories.php?playable=1` and in game setup; **when** any point value has no question in that category, **then** it is not listed.
- **Given** a category with a question "What is the capital of Peru?", **when** a question "what is the capital of peru?" is saved (create or edit) in the same category, at any point value, **then** the API returns 409 "This category already has this question" and nothing changes; **when** the same text is saved in another category, **then** it succeeds.
- **Given** a point value used by at least one question, **when** it is deleted, **then** the API returns 409 and nothing is deleted; **given** an unused point value, **when** deleted, **then** 200. **When** a point value is added, **then** every category without a question at that value stops being playable (no question is touched).

*Drawing the board*
- **Given** valid setup with N categories, **when** the host clicks "Start Game", **then** for every cell (category x point value) the server picks one question at random from that cell pool.
- **Given** the board response, **then** its shape is unchanged: `{ points: [...ascending], categories: [{id, name, questions: {<points>: {question, answer}}}] }`, categories in the requested order, exactly one question per category and point value, so the game page works without change.
- **Given** any board, **then** every cell's question belongs to that cell's category and has that cell's point value, and no question appears twice.
- **Given** cell pools with more than one question (e.g. the seed, 5 per pool), **when** the same board request is sent about 10 times, **then** the questions differ between responses (pure random; no play history, so a question from the previous game may appear again).
- **Given** a cell pool with exactly one question, **when** a board is drawn, **then** that question is always in that cell.
- **Given** a board request that includes a category with no question for some point value (e.g. stale setup or direct API call), **then** the API returns 400 with a readable message naming the category and the missing point value(s), and no board.

*Persistence (D-12, US-17)*
- **Given** a game in progress, **when** the page is refreshed, **then** the same drawn board (same question and answer in every cell, same used cells) is restored and no new draw happens; admin edits during the game do not change it.
- **Given** the Results screen, **when** the host clicks "New Game" and starts again with the same categories, **then** a fresh random board is drawn.

*Admin*
- **Given** the admin page, **then** the question form has a points dropdown with all point values (US-21); the question table has a Points column, sorted by category, then points, then id; the point values panel shows per-value question counts (US-19); the categories table shows the question count and "Not playable: missing V" (US-20); and the Coverage panel is gone (US-22 stays retired).

*Data delivery*
- **Given** a fresh install, **when** `sql/schema.sql` or `sql/schema-hosted.sql` is imported, **then** there are 150 questions, 25 per seed category and 5 per (category, point value). They are the 30 original seed questions with their original points plus the 120 from `docs/question-bank.md`, with question, answer and points copied verbatim. **When** imported a second time, **then** no error and still 150 (no duplicates). Both files stay in sync (US-29).
- **Given** an existing database in the pre-Sprint 6 slot schema (Sprints 1–5, including admin-added questions such as the 600 Egypt questions), **when** `sql/migrate-question-bank.sql` is run, **then** the slot unique key (category_id, points) is gone; the case-insensitive (category_id, question) key exists; `points` and its FK to point_values stay; and every existing question is kept with its category, points, text and answer. The 120 bank questions are added with their points to the seed categories found by name. Bank rows are skipped, without an error, when their category was renamed or deleted, when their point value no longer exists, or when the same text is already in that category.
- **Given** the migration has already run, **when** it is run again, **then** it completes without errors and the question count does not change.
- **Given** `docs/question-bank.md`, **then** it lists exactly 120 questions, 20 per seed category and 4 per point value 100–500 in each category, with no question or answer duplicating the seed questions, the 6 questions in `docs/questions-600.md` or each other.

## Epic E11 — Player help

### US-35 How to play guide (Should)
As a player, I want a guide that explains how to play, so that new players and hosts can learn the rules without asking. *(Added 2026-10-23, D-38.)*
- **Given** the game page, **then** the header shows a "How to play" link next to Admin; it opens `how-to-play.html` in a new tab, so a running game is not interrupted.
- **Given** the guide, **then** it explains in English: the host's role, a quick start, setup (players/teams, colors, categories, Surprise me!, timer, played questions), the board, answering (timer, pictures, Arabic/English, "(accept …)"), scoring with an example, ending the game and ties, and a short FAQ.
- **Given** the guide, **then** it names no category and no admin-set limit or default (max categories, default timer), so it stays correct when the admin changes them.
- **Given** the guide, **then** it has a contents list that jumps to each section, a "Back to the game" link, and it reads well at 1366x768 and on a phone.

### US-36 Terms of Service (Should)
As the site owner, I want a Terms of Service page, so that players know the rules for using the site and what data it keeps. *(Added 2026-10-23, D-39.)*
- **Given** the game page, **then** the header shows "How to play · Terms · Admin"; Terms opens `terms.html` in a new tab, so a running game is not interrupted. The guide's header links to it too.
- **Given** the Terms page, **then** it shows a "Last updated" date and covers, in English: what the terms are, who runs the site (Ahmed Fahim, with a contact email), using the game, fair use, questions and content (possible mistakes, translations, photo licences, trademarks), the data it keeps, no warranty, changes to the terms, and contact.
- **Given** the "Your data" section, **then** it matches what the game stores: the game start log on the server (date and time, player or team names, categories); the running game and the played-questions list in the browser, with only question ids sent to the server; no accounts, ads or tracking cookies; and the host's own technical logs.
- **Given** the Terms page, **then** players never have to accept anything to play. It has a contents list and a "Back to the game" link, and it reads well at 1366x768 and on a phone.

---

## Epic E11 — Helpers

### US-32 Helpers: 3 choices, Swap, Skip (Should)
As a contestant, I want three helpers I can each use once per game, so that I can get out of a hard question: see 3 possible answers, swap the question for another one, or skip it for half the points. *(Added 2026-10-23, D-36.)*

Terms: the "helper user" = the contestant who used a helper on the open question. The "chips" = the 3 small helper buttons on each scoring row (ABC = 3 choices, ⇄ = Swap, ½ = Skip).

*Availability (all helpers)*
- **Given** a new game, **then** every contestant has all 3 helpers, each usable once in that game. The board's ± buttons never give a helper back.
- **Given** an open question that nobody has been scored on and whose answer is not shown, **when** a contestant clicks one of their unused chips, **then** a confirm asks e.g. "Use Swap for Team Red? …". Cancel changes nothing; OK uses the helper (no undo, D-06).
- **Given** a contestant used a helper on the open question, **then** only that contestant can still be scored (the other rows' Correct and Wrong are disabled) and only that contestant can use more helpers on it (they may stack, e.g. Swap and then 3 choices).
- **Given** someone was scored on the open question, or the answer was shown, **then** every chip is disabled for that question. A disabled chip has a tooltip saying why (already used, not after scoring, not after the answer, only X can use helpers, no choices yet).
- **Given** the board, **then** each scoreboard card shows the 3 helper symbols; a used helper is dimmed and struck through.
- **Given** a helper was used, **when** the page is refreshed, **then** the used helpers, the helper user, the choice order and a swapped question are restored; the timer restarts at full length (D-04).

*3 choices*
- **Given** a question with wrong options, **when** the host uses 3 choices, **then** 3 options labelled A/B/C are shown under the question in random order: the answer and the 2 wrong options, each cut at its first bracket (English at " (", Arabic at "(" with or without a space before it), so "Three (triplets)" shows as "Three" and no option gives itself away by an explanation, an "(accept …)" note or an English gloss. The full answer still shows under Show Answer. The order is saved, so a refresh shows the same A/B/C.
- **Given** the 3 choices are shown on a text question, **then** the question screen switches to a compact layout (smaller question font, tight choice rows, short choices side by side, smaller timer and answer), so at 1366x768 with 6 contestants it fits with no page scroll, also after Show Answer, except for a few unusually long questions (D-30).
- **Given** the choices are shown, **when** the host switches the language, **then** the options switch to that language (same order).
- **Given** the answer is shown, **then** the right option is highlighted green.
- **Given** a question without wrong options, **then** the 3 choices chip is disabled with the tooltip "this question has no choices yet".

*Swap*
- **When** the host uses Swap, **then** a random question is drawn from the whole bank: a random playable category (same rule as `categories.php?playable=1`), a random enabled point value, never a question on this board, unseen questions first, otherwise the one seen longest ago. It replaces the open question: the heading is "Category – points" with a small "Swapped from History – 300" note, the picture (if any) and its credit are shown, the timer restarts, and Correct/Wrong use the new points. The new question is marked as seen.
- **Given** a swapped question, **when** the host returns to the board, **then** the original cell closes with the swapped question's result (the Correct contestant's color, or grey).
- **Given** the swap request fails (network error, or 409 when no question is left), **then** an error is shown on the question screen and the helper stays available.
- **Given** 3 choices were used before a Swap, **then** the choices apply to the new question too (a fresh order), if it has wrong options.

*Skip*
- **When** the host uses Skip on a question worth P points (the swapped value after a Swap), **then** the helper user loses `Math.round(P / 2)` points, the cell closes grey for everyone and the board is shown.

*Data and API*
- **Given** `sql/migrate-add-wrong-options.sql`, **when** it runs (also twice), **then** `questions` has `wrong_1`, `wrong_2`, `wrong_1_ar`, `wrong_2_ar` (`VARCHAR(255) NULL`) after `image_credit`; both schema files have them too.
- **Given** the admin list and the board payload, **then** each question has the 4 fields (null when empty).
- **Given** a create or update, **then** wrong options are optional, trimmed, one line, at most 255 characters; each language's pair is both-or-nothing, the two differ (case-insensitive) and neither equals the answer, both as typed and as shown in the game (cut at the first bracket); Arabic wrong options need the Arabic question and the English wrong options; a question with an Arabic version and English wrong options needs the Arabic ones. Anything else → 400 with a readable message.
- **Given** `POST questions.php?random=1` with `{ exclude, seen }` (lists of question ids, as the board's `seen`), **then** it returns `{ category: {id, name}, points, question }` (question as a board cell), never an excluded id; with nothing left to draw → 409. Malformed lists → 400. Public, like the board.

*Admin*
- **Given** the question form, **then** it has optional "Wrong option 1/2" and "Arabic wrong option 1/2" fields, filled on edit and checked like the API before sending; the questions table has a "Choices" column (✓ / -; "✓ (no Arabic)" when an Arabic question lacks Arabic options).

*Player guide*
- **Given** `how-to-play.html` (US-35), **then** it has a "Helpers" section (in the contents too): 3 helpers per game, each once, what 3 choices, Swap and Skip do, when they can be used (before anyone is marked and before the answer is shown), that the question is then the helper user's alone, that ABC is greyed out without choices, and that helpers are not given back; the Quick start and Scoring parts point to it. `llms.txt` mentions the helpers. *(Added 2026-10-23.)*

---

## Epic E12 — Streak Challenge

### US-33 Streak Challenge (Should)
As a solo player, I want to answer random questions one after another until I get one wrong, so that I can see how long a streak I can build. *(Added 2026-10-23, D-37.)*

*Setup*
- **Given** Players mode with exactly 1 entry, **then** setup shows "Streak Challenge (solo)" beside the Players / Teams toggle, so it is seen without scrolling, also on phones, where it wraps under the toggle. With 2 or more players, or in Teams mode, it is hidden. In maintenance mode it is hidden like Start Game. *(Amended 2026-10-23, owner: moved from the bottom of the page, next to Start Game, to the mode toggle; the "Streak leaderboard" button is only in the streak setup.)*
- **When** the player clicks "Streak Challenge (solo)", **then** one "Challenger name" field replaces the player row, the category picker is hidden (it is ignored), Start Game is replaced by "Start Streak Challenge", and "Back to a normal game" undoes it. The streak setup also has a gold, highlighted "🏆 Streak leaderboard" button next to "Back to a normal game". When the field is empty, the player's typed name is pre-filled into it (spaces tidied, cut to 30 characters), and the field gets the focus. *(Amended 2026-10-23 (owner): one "Challenger name" field replaces first + last name.)*
- **When** the player clicks "Start Streak Challenge" (or presses Enter in the challenger name field), **then** the challenger name must be 1–30 characters after trimming and collapsing spaces (D-22, as player names) and the timer valid (same rule as the board game); otherwise inline errors and no start. The run starts with the setup timer and is logged in the game log as `streak: <challenger name> | categories: all`.

*Questions*
- **Given** a run, **then** its questions come from every category at an enabled point value, unseen ones first (in random order), then the ones seen longest ago; a run never repeats a question. Each opened question is added to the device's played list, so later boards avoid it too.
- **Given** a question, **then** it shows "Category – points", its picture and credit if any, the question text, the language button for Arabic (Arabic first, as on the board) and 3 choices A/B/C in the server's random order: the answer and 2 wrong ones, each cut at its first bracket like the 3 choices helper (D-36 f). The stored wrong options are used when the question has a complete pair (the Arabic pair too when it has Arabic). Otherwise 2 answers of other questions of the same category and kind (picture or text) are borrowed, then of any category of that kind; a question that still has fewer than 2 is skipped. The choices follow the language button.
- **Given** fewer than 5 queued questions, **then** the next batch of 20 is fetched in the background with the run's questions excluded. When none is left, the run ends with its streak.

*Answering*
- **When** the player taps the right choice before the time runs out, **then** the streak goes up by 1, the choice turns green, "Correct! Your streak is N." shows and a "Next question" button appears (Enter works too).
- **When** the player taps a wrong choice, or the timer reaches 0, **then** the run is over: the tapped choice turns red, the right one green, the feedback names the right answer ("Wrong!" or "Time's up!") and "See results" appears.
- **Given** an open question, **when** the player clicks "End run" and confirms, **then** the run ends and its streak is saved.
- **Given** a run, **then** there is no Pause, Reset, Show Answer, scoring panel or helper on the question screen; the streak panel (name, "Streak N", choices, feedback, Next / See results, End run) takes the scoring panel's column. It fits 1366x768 with no page scroll (D-30) and stacks under the question on phones.
- **Given** a run, **when** the page is refreshed, **then** the run comes back with its count, queue and open question, and the timer keeps the time left (a saved deadline, capped at one full timer). A question answered before the refresh comes back answered. An invalid saved run is discarded. The board game's saved state and its checks are unchanged.

### US-34 Streak leaderboard (Should)
As a player, I want a shared leaderboard of the longest streaks, so that I can compare my best run with everyone else's. *(Added 2026-10-23, D-37.)*
- **Given** a run ends with a streak of 1 or more, **then** it is saved on the server (challenger name, streak, server date and time). A streak of 0 is not saved ("Only streaks of 1 or more go on the leaderboard.").
- **Given** the run was saved, **then** the leaderboard screen shows "Name: N in a row!" (or "No streak this time"), "You are #R on the leaderboard." (with "Your best is still B." first when an earlier run was better), the top 10 rows like "Ahmed Fahim · 13 questions · 18 Oct 2026" (Name · N questions · DD Mon YYYY) with this person's row highlighted, and "Play again" (same name and timer) and "New Game" (back to setup). If saving fails, an error with "Try again" is shown; the run stays saved in the browser until it works.
- **Given** the streak setup, **when** the player clicks "🏆 Streak leaderboard", **then** the same screen opens without the headline and with a "Back" button that returns to the setup as it was.
- **Given** several runs by one person, **then** the top 10 shows only their best one. A person is the challenger name compared case-insensitively ("ahmed fahim" = "Ahmed Fahim"). On equal streaks the earlier run ranks higher. The date is the run's date, not "5 days ago".
- **Given** `GET api/streaks.php`, **then** it returns the top 10 `[{name, streak, date: "YYYY-MM-DD"}]` (public). **Given** `POST api/streaks.php` `{name, streak}` (public, JSON only), **then** control characters in the name become spaces; a missing, empty or over-30-character name ("Challenger name is required" / "… must be at most 30 characters"), or a streak that is not a whole number from 1 to 100000, gives 400; a valid run gives 201 `{rank, best}`.
- **Given** the admin page, **then** a "Streak leaderboard" panel lists every run (name, streak, date and time, newest first) with Delete (confirm first, D-18). `GET ?all=1` and `DELETE ?id=` need admin access (401/403 otherwise, US-29); an unknown id gives 404.
- **Given** `sql/migrate-add-streak.sql`, **when** it runs (also twice), **then** the `streaks` table exists; both schema files have it too.
- **Given** the player guide (US-35), the Terms "Your data" section (US-36) and `llms.txt`, **then** they describe the Streak Challenge and the challenger name it stores. *(Amended 2026-10-23 (owner): one "Challenger name" field replaces first + last name, in the API, the `streaks` table (`name`), the admin list and the texts.)*

## Epic E13 — Double score

### US-37 Double score question (Should)
As a contestant, I want one hidden question on the board to be worth double, so that the game has a surprise that can turn the scores around. *(Added 2026-10-25, D-40.)*
- **Given** a new board game starts, **then** exactly one random cell of the board is the double-score cell. Nothing on the board, the board info line or the scoreboard shows which one until it is opened.
- **When** the host opens the double-score cell, **then** a popup "×2 Double score!" says a correct answer earns +2p instead of +p and a wrong answer costs the normal −p. The timer waits until the popup is closed ("Let's play", or Escape); keyboard focus stays on the popup while it is open.
- **Given** the double-score question is open, **then** its heading shows a gold "×2 Double score" badge and every Correct button reads "Correct (+2p)" and is a gold button with white text instead of green; Wrong still reads "Wrong (−p)".
- **When** a contestant is marked Correct, **then** they get 2 × p; **when** marked Wrong, **then** they lose p (no double).
- **Given** a Swap on the double-score cell, **then** the double stays: Correct earns 2 × the new question's points, Wrong costs its normal points. A Skip costs half the normal points (no double).
- **Given** the double-score cell has been played, **then** it shows a small "×2" in its corner on the board.
- **Given** a refresh, **then** the double-score cell is kept (saved with the game); a refresh on the open double question shows the badge but not the popup again. A game saved before this feature has no double-score cell. The Streak Challenge has none.
- **Given** the player guide (US-35) and `llms.txt`, **then** they describe the double-score question. The guide has its own "×2 Double score" section (in the contents list, after Helpers) with an example, plus short pointers from The board and Scoring.

## Epic E14 — Ads

### US-38 Ads on the Streak leaderboard (Should)
As the site owner, I want a Google AdSense banner on the Streak leaderboard screen, so that the site can earn money without disturbing play. *(Added 2026-10-25, D-41; Results banner removed the same day by owner decision.)*
- **Given** Admin > Game settings, **then** there is a "Show ads" checkbox, an AdSense publisher ID field (`ca-pub-` + 10–20 digits) and an ad unit slot ID field (digits). A wrong format, or ads on with an empty ID, shows an error and saves nothing; the API returns 400 for the same cases. Both IDs may be cleared.
- **Given** ads are off, or an ID is missing, or maintenance mode is on, **then** no request goes to `googlesyndication.com` and no ad area is shown anywhere.
- **Given** ads are on, **when** the Streak leaderboard opens (after a run or from the setup screen), **then** the AdSense script loads once and a responsive banner labelled "Advertisement" shows under the buttons, with clear space between them. Setup, Board, Question and Results screens never show an ad and never load the script, so Google's consent message can't cover the winner announcement.
- **Given** the banner was filled once, **when** the screen opens again, **then** the same banner is shown; it is never refreshed.
- **Given** the site runs on this computer (localhost), **then** AdSense runs in test mode (`data-adbreak-test`, `data-adtest`).
- **Given** an ad blocker or no network, **then** the ad area hides itself and the game works as before.
- **Given** the site pages, **then** a Privacy Policy page (`privacy.html`) holds the former "Your data" section of the Terms plus an "Ads and cookies" section, and is linked as "Privacy" in the game, guide and Terms headers and in `llms.txt`.

## Epic E15 — Search and sharing

### US-39 Search engine and link-preview basics (Should)
As the site owner, I want BrainRush to describe itself to search engines and link previews, so that people searching for trivia or quiz games can find it and shared links look good. *(Added 2026-10-25, D-42.)*
- **Given** the game page, **then** its title is "BrainRush – Free Online Trivia Quiz Game for Parties, Teams & Family", it has a meta description, a canonical URL (`https://brainrush.integration.ninja/`), Open Graph and Twitter card tags with `img/og-image.png` (1200×630), and a JSON-LD block (`WebSite` + `WebApplication`, free, English and Arabic).
- **Given** the setup screen, **then** a short visible line under "New game" says what BrainRush is and links to How to play.
- **Given** the guide, Terms and Privacy pages, **then** each has a descriptive title, a meta description and a canonical URL; the guide also has Open Graph tags.
- **Given** the admin page, **then** it carries `noindex, nofollow`.
- **Given** the site root, **then** `robots.txt` blocks `/api/` and points to `sitemap.xml`, which lists the game, guide, Privacy and Terms pages.

## Epic E16 — Android app

### US-40 Android app via a Trusted Web Activity (Should)
As a player with an Android phone, I want BrainRush as an app from Google Play, so that I can open it from my home screen and play full screen. *(Added 2026-10-26, D-43. Step 1 is the web side below; the `android/` wrapper project and the Play release follow.)*
- **Given** the site root, **then** `manifest.webmanifest` names the app "BrainRush" (name and short name), with `start_url` `./?source=twa`, `scope` `./`, `display` standalone, theme and background colour `#0b1026`, and icons of 192 and 512 px (purpose any) plus a 512 px maskable icon whose artwork stays inside the safe zone. The game, guide, Terms and Privacy pages link it and carry `<meta name="theme-color">`. Chrome DevTools shows the manifest with no errors.
- **Given** `/.well-known/assetlinks.json`, **then** it is served with status 200 as JSON and holds a `delegate_permission/common.handle_all_urls` statement for the package `ninja.integration.brainrush`. Before the app is tested, the placeholder fingerprint is replaced by the upload key's SHA-256; the Play App Signing SHA-256 is added once Play Console shows it, and the Hostinger CDN is purged after each upload.
- **Given** the hosted site, **then** `/android/` and every file under it return 403, the manifest is sent as `application/manifest+json`, and `sw.js` is sent with `Cache-Control: no-cache`.
- **Given** a page load (navigation) that fails because there is no connection, **then** the self-contained `offline.html` shows "You're offline" with a **Try again** button that reloads the page. The service worker (`sw.js`, at the root) caches only `offline.html`, loads every page from the network first, and never caches or answers `api/` calls or any other file. `offline.html` is `noindex` and not in the sitemap.
- **Given** the app opens the site (`?source=twa`, or the referrer `android-app://ninja.integration.brainrush`), **then** the tab remembers app mode in `sessionStorage` (`brainrush.app`) while it navigates (`js/app.js`, loaded by the game, guide, Terms and Privacy pages), and: no ad is shown and the AdSense script is never loaded; the Admin link and its separator are hidden in the header, and the setup messages for a missing category or incomplete settings show no link to the admin page. *(Amended 2026-10-26, owner, fix loop 1:)* links to the site's own pages that open a new tab on the website (`target="_blank"`, e.g. How to play, Terms, Privacy) open in the same app window, so app mode carries over; "Back to the game" on a guide page lands in app mode with the running game restored. Links to other sites keep opening outside the app. *(Amended 2026-10-26, owner:)* the setup screen has no "New game" heading and no home intro text (D-42), so the app starts at "Who is playing?"; the website keeps both. *(Amended 2026-10-26, owner, device test BUG-01:)* Arabic question, answer and choice text is marked `translate="no"`, so Chrome does not offer to translate it over the question.
- **Given** the app, **when** the player presses the Android Back button, **then** an open double-score popup closes (the timer resumes); an open board question first asks "Leave this question? It will be closed without points and cannot be opened again." ("…It will be closed and cannot be opened again." once someone was scored): OK goes back to the board as **Back to Board** does, Cancel stays on the question with its timer running *(amended 2026-10-26, owner, fix loop 1; the on-screen Back to Board button is unchanged)*; the board asks the End Game confirm (D-09) and stays on Cancel; Results goes to a new setup; an open Streak Challenge question asks the "End the run now?" confirm, and after a wrong answer goes on to the leaderboard; the leaderboard goes back to setup (asking first if the streak was not saved); the Streak setup closes back to a normal game setup. On the setup screen, Back leaves the app (after a visit to a guide page in the app, it first goes back through the pages visited, as browser history does). A refresh keeps this working. **Known limitation:** when the app starts on a restored game, Chrome lets the page add its history entry only after the first tap, so Back before any tap leaves the app; the game stays saved and is restored on the next start.
- **Given** the website (not the app), **then** ads, the Admin link and the Back button behave as before.
- **Given** a phone up to 600px wide, **then** buttons (including the Streak answers), text and number fields, the board cells, the helper chips, the score ± buttons, the colour circles, the mode toggle, the category tiles and the header links are at least 48px tall (and the round controls and header links 48px wide); a 6 × 6 board with 6 players needs no more page scroll at 375x812 than before. Text links inside a sentence (the "How to play" link in the setup intro) are exempt, as WCAG 2.5.8 allows for inline links. Wider screens (D-30) are unchanged.
- **Given** the Privacy Policy and the Terms, **then** each has an "Android app" section: the app is this same site in Chrome, it saves the same data as the website, and it shows no ads.

---

## Story status

| Sprint | Stories | Status |
|---|---|---|
| 1 | US-24, US-25, US-26, US-28 | Accepted |
| 2 | US-18, US-19, US-20, US-21, US-22, US-23, US-29 | Accepted (US-29 hosted `/password.txt` check done 2026-10-05, FU-01) |
| 3 | US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-09 | Accepted |
| 4 | US-08, US-10, US-11, US-12, US-13, US-14, US-15, US-16, US-17, US-27 | Accepted 2026-10-05 |
| 5 (polish) | No stories; follow-ups FU-03, FU-04, FU-05, FU-08 | Accepted 2026-10-05 |
| 6 | US-30 (with amendments to US-19, US-20, US-21, US-24, US-25; US-22 retired) | Accepted 2026-10-11 after rework. The first version was accepted, then re-opened when D-31 was amended (points per question again); the rework was re-tested with 36 PASS. Hosted migration done (FU-11, owner confirmed 2026-10-12). |
| Helpers (outside the sprint cycle, branch `helpers`) | US-32 | Implemented 2026-10-23 (`docs/sprints/helpers-dev.md`); in test. The wrong-option content (`sql/add-wrong-options.sql`) is produced separately and reviewed by the owner. |
| Streak Challenge (outside the sprint cycle, branch `streak-mode`) | US-33, US-34 | Accepted with follow-ups 2026-10-23 (`docs/sprints/streak-mode-test-report.md`: 61 PASS, 0 FAIL, 2 PENDING; the 3 Minor bugs fixed in fix loop 1 and checked in code by the PO). Open: FU-16 to FU-19. Needs `sql/migrate-add-streak.sql` before the code. |

US-01 to US-21 and US-23 to US-30 accepted. US-22 retired 2026-10-11 by D-31. US-31 shipped (PR #46). US-32 in test. US-35 (player guide) and US-36 (Terms of Service) added 2026-10-23. US-33 and US-34 (Streak Challenge) accepted with follow-ups 2026-10-23. US-37 (double score question) added 2026-10-25, branch `double-score`. US-38 (ads) added 2026-10-25, branch `ads`. US-39 (search and sharing) added 2026-10-25, branch `seo`. US-40 (Android app, web side first) added 2026-10-26, branch `android-twa`. Open items are listed under "Follow-ups after Sprint 4", "Follow-ups after Sprint 6" and "Follow-ups after the Streak Challenge".

---

## Decisions

Where the spec is silent or ambiguous, the PO chose the simplest party-game behaviour:

| ID | Topic | Decision |
|---|---|---|
| D-01 | "all 25 cells" (spec, Board → End Game) | Board size is dynamic, so End Game is auto-offered when **all cells** (N × number of point values) are used. "25" was the 5×5 default example only. |
| D-02 | Unique names | Compared after trimming, case-insensitive. Players and teams follow the same rules. |
| D-03 | Timer at 0 | Stops at 0 and shows "Time's up!"; nothing is auto-scored or auto-closed. The host can still score and must click "Back to Board". **Amended 2026-10-06:** the beep at 0 is removed (owner found it annoying); the timer is silent. |
| D-04 | Refresh with question open | Question reopens with scoring done so far preserved; timer restarts at full length. |
| D-05 | Manual ± adjust step | Equals the smallest configured point value (dynamic, no hard-coded 100). Manual adjusts never change cell ownership/color. |
| D-06 | Opened cell | Once opened, a cell is always marked used on "Back to Board" (grey if no Correct). No "cancel" of a question. Scoring marks inside a question cannot be undone; use the manual ± buttons. |
| D-07 | Mode switch with too many names | Entries are not deleted automatically; Start is blocked with a message until the host removes extras. |
| D-08 | Wrong after Correct | Allowed for contestants not yet scored on that question (spec only disables other Correct buttons). |
| D-09 | End Game early | Requires a confirm dialog; unused cells are ignored. |
| D-10 | Ties | All contestants sharing the top score (including all at 0 or all negative) are co-winners. |
| D-11 | Not enough playable categories | Setup shows a message with a link to Admin; Start disabled. **Amended 2026-10-11 (D-32):** this now applies only when no category is playable; with fewer than N playable the host simply starts a smaller board. |
| D-12 | Admin changes during a game | A running game uses the board loaded at Start (stored in local state); admin edits apply to the next game. |
| D-13 | Point value validation | Positive integer 1–1,000,000; duplicates → 409. |
| D-14 | Category name | Non-empty after trimming, max 100 characters, unique case-insensitive (duplicate → 409). |
| D-15 | New Game | Clears all saved state including names; settings are reloaded from the API. |
| D-16 | Contestants mid-game | Adding/removing contestants after Start is not supported. |
| D-17 | Target database / runtime | The target database is **MariaDB 10.4** (MySQL 8 is no longer a target; changed 2026-10-04). The reference environment is XAMPP (MariaDB 10.4 + PHP 8.0, managed via phpMyAdmin). All SQL and PHP must stay compatible with **MariaDB 10.4** and **PHP 8.0** (no PHP 8.1+ features; no SQL syntax or collations missing on MariaDB 10.4). Schema must be importable via phpMyAdmin as well as the `mysql` CLI. **Amended 2026-10-04 (D-20):** code must also run on the newer managed MariaDB version Hostinger provides — use standard SQL only (no version-specific syntax, functions or collations; utf8mb4 with a collation available on both). |
| D-18 | Admin deletes | Every admin delete (point value, category, question) asks for a plain-text confirm first; Cancel sends nothing. A confirmed delete of a used point value still reaches the API and shows the 409 inline (US-19). Admin conveniences that only prefill forms (e.g. clickable coverage cells) are allowed. Added 2026-10-04 (Sprint 2). **Amended 2026-10-11 (D-31):** deleting a point value no longer returns 409 and the coverage grid is removed; the confirm-before-delete rule still applies. **Re-amended 2026-10-11 (D-31 amended):** the point-value 409 is back (a used value cannot be deleted); the coverage grid stays removed. |
| D-19 | Admin layout | The admin page targets desktop/laptop widths (≥ 1024 px). Narrower widths may scroll tables horizontally inside their panel; mobile layout is out of scope. Messages and long unbroken names must not make the whole page scroll horizontally at ≥ 1024 px (follow-up for Sprint 2 O-5, fix with the Sprint 4 CSS work). Added 2026-10-04 (Sprint 2). |
| D-20 | Admin protection / hosting | Stakeholder decision 2026-10-04, **reverses** the spec rule "Admin page is not password-protected". BrainRush is deployed to Hostinger shared hosting as a public staging site and redeployed after each sprint. Admin writes (POST/PUT/DELETE on `api/*.php`) need HTTP Basic Auth when credentials (username + password hash) are set in `api/config.php`; with none set, writes are loopback-only (403 otherwise), so the public site fails closed. GET stays open; answers readable via the API is **accepted** as a known party-game limitation. Hosted site must use HTTPS. Details in US-29; US-28 README criterion amended accordingly. **Amended 2026-10-04 (US-29 acceptance):** "local" means loopback address **and** local `Host` (`localhost` / `127.0.0.1` / `[::1]`) **and** no forwarding headers; anything else (custom local host names, reverse proxies) needs admin keys. Half-configured or non-hash admin keys fail closed with 500 + hint. |
| D-21 | "Quit to setup" on the board | Interim Sprint 3 escape only. In Sprint 4 it is **removed** once End Game (US-10, confirm per D-09) and New Game (US-16) exist: the single way out of a game is End Game → Results → New Game, so a host cannot throw a game away without seeing the results. Added 2026-10-05 (Sprint 3). |
| D-22 | Contestant name length | Max **30 characters** after trimming, the same for players and teams. Enforced by the setup input (`maxlength`). A restored saved game with a longer name counts as invalid (Setup is shown, see US-17 corrupt-data rule). Added 2026-10-05 (Sprint 3). |
| D-23 | When Start is disabled | Start is disabled outright, with a visible reason, only for blocks the host has to fix structurally: too many entries for the mode (D-07), not enough playable categories (D-11), setup data failed to load (retry offered), and while the Start request is running. Field errors (names, category count, timer) are checked on click, all shown at once inline, and focus moves to the first problem. Added 2026-10-05 (Sprint 3). |
| D-24 | Setup form on refresh | Not saved. Refreshing during setup shows the defaults again (Players, one empty entry, timer from settings, current playable categories). Only a started game is saved (US-17). Added 2026-10-05 (Sprint 3). |
| D-25 | Revealed answer on refresh | Once "Show Answer" was clicked, the answer stays shown after a refresh mid-question (the room has already seen it). Extends D-04. Added 2026-10-05 (Sprint 4). |
| D-26 | End Game on a full board | The D-09 confirm applies only while unused cells remain. When every cell is used, both End Game buttons (board bar and the "all played" offer) go straight to Results. New Game on Results needs no confirm. Added 2026-10-05 (Sprint 4). |
| D-27 | Ranks on Results | Equal scores share a rank (standard competition ranking: 1, 1, 3). Equal scores are listed in setup order. Winner/tie text follows D-10. Added 2026-10-05 (Sprint 4). |
| D-28 | Saved-game versions | The saved game carries a `version`. A Sprint 3 (v1) save on the board is upgraded and restored; any other older or unknown version is discarded (Setup shown, US-17 corrupt-data rule). Any future change to the saved shape must bump the version and either migrate or discard safely. Added 2026-10-05 (Sprint 4). |
| D-29 | Beep after refresh | Browsers block audio until the user interacts with the page. After a refresh mid-question with no click or key press, the beep at 0 may be silent. The visible "Time's up!" is the guaranteed signal. Accepted as a known limitation and documented in the README; no "enable sound" prompt. Added 2026-10-05 (Sprint 4). **Obsolete 2026-10-06:** the beep was removed (see D-03). |
| D-30 | Game screen layout | Targets laptop 1366x768 and projector 1920x1080. Never a horizontal scroll. Vertical scroll is acceptable on Setup (a form), for unusually long question/answer text, and while the "all played" offer is shown. Board + scoreboard should fit one 1366x768 screen up to 6 rows and 6 contestants (met in Sprint 5, FU-03). Added 2026-10-05 (Sprint 4). **Amended 2026-10-05 (Sprint 5):** sizes mean the browser viewport (inner window). A windowed browser with tabs and an address bar has less height and may scroll a little; that is accepted, as are boards with more than 6 rows. Results with up to 6 contestants should also fit 1366x768 (met by FU-08). Vertical scroll there is accepted when very long names make the tie headline or the rows wrap. **Amended 2026-10-06 (iOS):** phones are supported as a best effort. Up to 600px wide the game page uses a compact layout (no horizontal scroll; a 6 × 6 board with 6 players fits a 375x812 phone with little or no scrolling). A phone held sideways scrolls vertically. Hover styles apply only to devices with a real pointer, and form fields stay at 16px or more on touch screens (no iOS zoom). The admin page stays desktop-only (D-19). |
| D-31 | Question bank (replaces "one question per slot") | Owner decision 2026-10-11, **replaces** the spec rule "exactly one question per category + point value slot". Questions belong only to a category and have no point value; a category is a pool. Playable = at least as many questions as there are point values (and at least one). On each new game the server draws, per chosen category, as many random, distinct questions as there are point values and places them on the rows in random order. Pure random, no play history. An exact duplicate question text in the same category (case-insensitive) → 409 "This category already has this question". Deleting a point value is no longer blocked by questions. The admin coverage grid is removed (US-22 retired); the categories table shows "M questions (needs P)" / "X more needed". The board payload shape is unchanged and D-12 still holds: the board drawn at Start is kept in local state, so a refresh does not redraw. Accepted consequence: the point value no longer reflects a question's difficulty, so bank questions are written at a similar, moderate level. Details in US-30; US-19, US-20, US-21, US-24, US-25 and D-18 amended. **Amended 2026-10-11 (Sprint 6 acceptance):** (a) a `points` field sent with a question is ignored, not rejected; (b) a short category shows "Not playable: X more needed"; (c) the duplicate check is accent-insensitive as well as case-insensitive (DB collation, same as category names), and it compares the first 191 characters only. Both are accepted, since questions are normally far shorter (OBS-2, OBS-3); (d) bank Science #5 is reworded to "Which vitamin does the human body make when exposed to ultraviolet rays?" (Vitamin D), so it no longer hints at Science #7 "The skin" or #16 "The Sun" (OBS-5). The change is applied in `docs/question-bank.md`, both schema files, the migration and the local DB. **D-31 amended 2026-10-11 (owner, after reviewing Sprint 6: "show the question score value in the questions list"; asked to clarify, the owner chose to bring back a point value on each question).** This replaces the "no point value" parts above:
| D-32 | Number of categories per game | Owner decision 2026-10-11, **replaces** "pick exactly N". `categories_per_game` (N) is the **maximum**: the host picks at least 1 and at most N playable categories, and the board has that many columns (in tick order). Once N are ticked, the other boxes are disabled. The setting keeps its name and 1–10 range; the admin label reads "Max categories per game". Start is blocked for categories only when none is playable (D-11 amended). The server board endpoint is unchanged (it never enforced N). US-04 amended. |
- Each question has a required point value that must exist in `point_values`. A category may have **any number of questions per point value**: a bank per (category, point value), not one question per slot (`uq_slot` stays removed).
- On each new game, every board cell (category x point value) gets one random question from that category's questions with that point value. Pure random, no history. The payload shape is unchanged and D-12 holds.
- Playable = at least one question for every point value (the pre-Sprint 6 rule).
- Deleting a point value still used by questions → 409 again.
- Admin:
  - The question form has a points dropdown listing all point values, with no free-slot filtering.
  - The questions list has a Points column, sorted by category, then points, then id.
  - The categories table shows the question count and "Not playable: missing V1, V2".
  - The point values panel shows per-value question counts again.
  - The coverage grid stays removed (US-22 stays retired). The owner disliked the slot UI, and the categories status plus the per-value counts cover its purpose.
- Duplicate text in the same category → 409, unchanged and regardless of points. Items (c) and (d) above still apply.
- (a) is superseded: `points` is required and validated, not ignored. (b) is superseded by "missing V".
- The difficulty consequence above no longer applies: bank questions carry points ranked by difficulty within their category (`docs/question-bank.md`, 4 per value per category).
- The migration converts the pre-Sprint 6 slot schema and keeps `points`.
- The local DB, already converted by the first Sprint 6 migration (no `points`), is not a supported source. Restore it from the pre-Sprint 6 backup, then run the new migration (FU-13).

Details: US-30 (rewritten), with US-19, US-20, US-21, US-24, US-25 and D-18 re-amended. |
| D-33 | "Surprise me!" | Owner decision 2026-10-22. One tile in the category list with two behaviours: ticked alone it picks **3** random playable categories (capped by N and by the number of playable categories); ticked with other picks it takes one slot and becomes **1** random playable category not already picked. The draw happens in the browser at Start; the board API and the game log are unchanged and see real category ids. Randomly picked columns show "?" on the board until one of their questions is opened (saved with the game, so a refresh keeps it). US-31. |
| D-34 | Photo credit under picture questions | Owner decision 2026-10-22, for the CC BY / CC BY-SA photos of the Landmarks set. New column `questions.image_credit` (`VARCHAR(255) NOT NULL DEFAULT ''`, `''` = no caption; migration `sql/migrate-add-image-credit.sql`, before the code). The API returns it as `image_credit` (null when empty) in the admin list and the board payload and accepts it on create/update (optional, trimmed, max 255, one line of plain text, else 400). The question screen shows it as a small muted one-line caption "Photo: <credit>" right under the picture, as text, left-to-right in both languages; it takes the picture's bottom margin, so the picture size and the 1366x768 layout are unchanged. No caption for text questions or an empty credit (Flags). Admin: optional "Image credit" field under the image path; the list is unchanged. Format: `<author> / <licence>`, e.g. `Jane Doe / CC BY-SA 4.0`. |
| D-35 | Bigger photos in picture questions | Owner decision 2026-10-22, for the Landmarks photos. A photo (a picture that is not an `.svg`; flags stay as they are) gets a compact question layout: the language button sits on the prompt's line, the timer digits (2rem) and the answer text are smaller, the spacing is tighter, and the "Time's up!" line only takes room once time is up. The room goes to the photo: `clamp(7rem, calc(100vh - 25.2rem), 58.5vh)` on screens wider than 960px, about 340px tall at 1366x768 (flags 215px) and 632px at 1920x1080 (flags 528px); the owner first asked for bigger photos (280px), then for 20% more. A one- or two-line answer still fits with no page scroll; the two three-line answers (Big Ben, Muhammad Ali Mosque) scroll a little, as does a two-line answer once "Time's up!" shows, as D-30 accepts. The photo credit caption (D-34) is 0.6875rem (owner: one size smaller). |
| D-36 | Helpers (3 choices, Swap, Skip) | Owner decisions 2026-10-23. Every contestant gets 3 helpers per game, each usable once: **3 choices** (the answer plus 2 wrong options, A/B/C in random order), **Swap** (replace the open question) and **Skip** (lose half its value instead of risking all of it). (a) Wrong options are **stored per question** in English and Arabic (`questions.wrong_1`, `wrong_2`, `wrong_1_ar`, `wrong_2_ar`, `VARCHAR(255) NULL`; migration `sql/migrate-add-wrong-options.sql`, before the code) and written by the question-producer (`sql/add-wrong-options.sql`, reviewed by the owner per set). The 3 choices chip is greyed out on a question without them. (b) Using a helper makes the question **that contestant's only**: the other scoring rows are disabled, and only that contestant can use more helpers on it. (c) Helpers are allowed only before anyone is scored on the question and before the answer is shown; each use is confirmed first (no undo, D-06); the ± buttons do not restore them. (d) **Swap** draws from the **whole bank**: a random playable category, a random enabled point value, never a question on the current board, unseen first, otherwise the one seen longest ago (`POST questions.php?random=1`). It is scored at the new question's value, and the original cell closes with the new question's result. (e) **Skip** subtracts `Math.round(points / 2)` (at the swapped value after a Swap) and **closes the question for everyone**: the cell turns grey. (f) **Amended 2026-10-23 (fix loop 1):** every choice is shown cut at its first bracket: English at " (", Arabic at "(" with or without a space. This covers the correct answer ("Three (triplets)" → "Three"; "(accept …)" notes go too) and also the wrong options, because some Arabic wrong options carry an English gloss like their answers. So no option stands out by its brackets. The full answer still shows under Show Answer. The API rejects an option that equals the answer, typed or cut. The saved game goes to version 3; version 2 saves are upgraded with all helpers available (D-28). (g) Layout (**amended 2026-10-23, fix loop 1**):
- **Chips:** icon-sized chips (ABC, ⇄, ½) on the scoring rows and 3 small symbols on each scoreboard card.
- **Scoring rows:** the columns stay 1 : 1 as before. A row fits on one line at 1366x768 with 6 contestants (D-30) through compact rows: 0.92rem Correct/Wrong buttons, 1.5rem chips, tighter gaps.
- **Text question with 3 choices:** a compact layout like D-35's photo one. The question font is smaller, the choice rows are tight, choices of up to 24 characters sit side by side, the timer digits are 2rem, "Time's up!" takes room only once time is up, and the answer is smaller. In the 761-question sweep at 1366x768, 4 English views with the answer shown scroll: 1 long Egyptians question by 2 px, and 3 Landmarks photos with long answers, which D-35 already lists. No Arabic view scrolls.
- **Picture question with 3 choices:** the choices sit side by side, and the picture gives up their height.

US-32. |
| D-37 | Streak Challenge and leaderboard | Owner decisions 2026-10-23. (a) A solo mode, offered only in Players mode with exactly 1 player; it needs a challenger name (1–30 characters). *(Amended 2026-10-23 (owner): one "Challenger name" field replaces first + last name.)* (b) Questions are fully random from every category at an enabled point value, unseen first; the category picker is ignored, which keeps the leaderboard fair. (c) **3 multiple-choice answers**, so there is no self-judging. They reuse the helper's stored wrong options and its "cut at the first bracket" rule (D-36); a question without a complete pair borrows 2 answers from the same category and kind (picture or text), then from any category of that kind, and is skipped if it still has fewer than 2. The server shuffles the choices. (d) A wrong answer **or time's up** ends the run; "End run" ends it early. Timer = the setup timer; no Pause or Reset, and a refresh keeps the remaining time (saved deadline), so neither can be used to cheat. The helpers are not offered. (e) The leaderboard is **shared on the server** (`streaks` table, `sql/migrate-add-streak.sql` before the code): every run of 1 or more is stored; the top 10 shows the best run per person (challenger name, case-insensitive), the earlier run first on a tie, as "Name · N questions · 18 Oct 2026" (server date of the run). (f) Admin can delete runs (moderation of junk or offensive names, D-18 confirm). (g) **Accepted limitation:** the answers are in the payload and the POST is public, so a determined user could fake a score (same as the game log and the public board API). (h) The run is saved in its own browser key (`brainrush.streak`), so the board game's saved state (D-28) is unchanged. (i) **Added 2026-10-23 (PO acceptance):** a person is matched by the DB collation, so the match is accent-insensitive as well as case-insensitive ("José Fahim" = "Jose Fahim"), as for category names and duplicate questions (D-31 c). Accepted. The screen's own-row highlight compares lowercase text only, so an accent variant may not be highlighted. A player ranked below the top 10 gets the rank line but no highlighted row. (j) The leaderboard row reads "1. Ahmed Fahim · 13 questions · 18 Oct 2026" as text (screen readers). On screen the name sits left and "· 13 questions · 18 Oct 2026" right, which meets US-34. (k) The best-run query uses `ROW_NUMBER() OVER` (standard SQL window function, MariaDB 10.2+), allowed under D-17 once the hosted version is confirmed (FU-17). US-33, US-34. |
| D-38 | Player guide | Owner decision 2026-10-23. A separate static page `how-to-play.html` (no JS), in English only, with its own `css/guide.css` on top of the shared stylesheet. The game header links to it in a new tab, so a running game and an open question's timer are not touched. It names no category and no admin-set limit or default. It describes the game without helpers; a helpers section follows once that feature lands. US-35. |
| D-39 | Terms of Service | Owner decision 2026-10-23. A separate static page `terms.html`, in English only, with no JS and no CSS of its own (it reuses the guide styles). It is linked as "Terms" in the game header (new tab) and in the guide's header. Players don't accept anything: there is no checkbox, and Start is not affected. It names the owner, Ahmed Fahim, with the contact ahmedfahim89@gmail.com. A short "Your data" section replaces a separate privacy page. There is no governing-law clause. US-36. |
| D-40 | Double score question | Owner decision 2026-10-25. At Start the browser picks one random cell of the board (`game.double`, "<categoryId>:<points>", saved with the game; the saved version stays 3 and a save without it simply has no double, like `helpersOff`). It stays secret until opened; a popup then announces it and holds the timer. Only a Correct is doubled (`2 × p`); a Wrong costs `p`. The double belongs to the cell, so after a Swap the new question's points are doubled; Skip stays `Math.round(p / 2)`. The ± corrections are unchanged. Client-only: no API, DB or game-log change. US-37. |
| D-41 | Ads | Owner decision 2026-10-25. Google AdSense, set up for H5 Games Ads (AdMob is for native apps only). For now only a responsive display banner on the Streak leaderboard screen (the Results banner was dropped the same day so that the consent message never covers the winner announcement); interstitial/rewarded `adBreak` placements need a separate H5 Games Ads approval and can reuse the loader later. Off by default: the `ads_enabled`, `ads_client` and `ads_slot` settings (no migration; a missing row means off) are set in Admin. Maintenance mode also turns ads off. Test mode on localhost. A separate `privacy.html` now holds the Terms' "Your data" section (amends D-39) with an "Ads and cookies" section. Consent for the EEA/UK/CH uses AdSense's own Privacy & messaging, so there is no consent code. ads.txt goes on the root domain (`integration.ninja`), not in this repo, because Google reads it from the root domain. US-38. |
| D-42 | Search and sharing | Owner decision 2026-10-25. No hashtags or `meta keywords` (Google ignores both). Instead: descriptive titles and meta descriptions, canonical URLs (the game's is `/`, not `/index.html`), one visible intro line on the setup screen, Open Graph/Twitter tags with a 1200×630 `img/og-image.png`, a static JSON-LD block (`WebSite` + `WebApplication`) on the game page, `noindex` on admin, `robots.txt` (blocks `/api/` only, so crawlers can read admin's `noindex`) and a hand-kept `sitemap.xml`. Google Search Console is set up by the owner. US-39. |
| D-43 | Android app | Owner decisions 2026-10-26. BrainRush ships on Android as a **Trusted Web Activity** (TWA): a thin wrapper that opens the live site full screen in Chrome, so every web deploy updates the app and there is one codebase (Capacitor and native Kotlin were considered and not chosen). Package name **`ninja.integration.brainrush`** (permanent after the first Play upload). **No ads in the app at launch**: AdSense stays on the website only, and the Play listing says "Contains ads: No". The wrapper project lives in the **`android/`** subfolder of this repository, blocked on the web by `.htaccess` (Git deploy copies it); signing keys stay outside the repository and are git-ignored with the build output. The app is recognised by `?source=twa` (the manifest's start URL) or the `android-app://ninja.integration.brainrush` referrer, remembered per tab in `sessionStorage`. The first release adds four phone polish items: touch targets of at least 48dp, an offline page (a service worker that caches only that page, never `api/`), the Admin link hidden in the app, and Android Back handling. **Amended 2026-10-26 (owner, fix loop 1):** (a) Back on an open board question asks before closing it (a Back press is easily made by mistake, D-06); (b) in the app, links to the site's own pages open in the same window instead of a new tab, so app mode (no ads, no Admin) carries over. For this the guide, Terms and Privacy pages load one small shared script, `js/app.js` (amends D-38 and D-39 "no JS": on the website it changes nothing). (c) Accepted risk: anyone can add `?source=twa` to a website URL to hide the ads and the Admin link; it only affects ad revenue, since admin access is protected by the server (D-20). (d) Known limitation: Back before the first tap on a game restored at app start leaves the app (Chrome only lets a page add history after a user tap); the game stays saved. (e) The app hides the "New game" heading and the home intro (D-42 text for website visitors and search engines). US-40. |

---

## Follow-ups after Sprint 4

| ID | Item | Priority | Owner | Status |
|---|---|---|---|---|
| FU-01 | Hosted smoke check after the Sprint 4 redeploy: `/password.txt` (and the other private paths in US-29) return 403 or 404, status only, never the content. Record the result in `docs/sprints/sprint-4-test-report.md`. The Sprint 4 redeploy is not done until this passes. If it ever returns 200, take the file off the host at once, change every credential in it, and report it per the Celfocus incident process. | Must | Owner | Done 2026-10-05 (owner confirmed) |
| FU-02 | Move `password.txt` out of the project folder. It is the web root, and `php -S` serves every file there (`.htaccess` only protects Apache and the host). | Must | Owner | Won't do (owner decision 2026-10-05). The file stays git-ignored and blocked by `.htaccess`; `php -S` still serves it locally. |
| FU-03 | Make the 6x6 board + 6-contestant scoreboard fit 1366x768 with no page scroll (now 22 px over), per D-30. | Should | Developer | Done 2026-10-05 (Sprint 5) |
| FU-04 | Long question text: scale the question font down with text length so questions up to about 250 characters fit the question column at 1366x768. | Could | Developer | Done 2026-10-05 (Sprint 5). Long answers are not scaled (D-30). |
| FU-05 | Grey (unanswered) cells: use the same points-label size as owned cells. | Could | Developer | Done 2026-10-05 (Sprint 5) |
| FU-06 | Housekeeping before the next session: restart MariaDB, then delete the leftover point value 1000 (no questions) so categories are playable again; check the antivirus exclusion for `C:\xampp\mysql\data` (ENV-4-01, second InnoDB hang). | Must (environment) | Owner / Developer | Done 2026-10-05: MariaDB restarted, point value 1000 deleted, antivirus exclusion checked (owner confirmed). |
| FU-07 | Local XAMPP Apache serves an older checkout (`C:\xampp\htdocs\BrainRush`); update it or point it at this repo before relying on it for end-to-end checks. | Could (environment) | Owner | Done 2026-10-05 (owner confirmed) |
| FU-08 | Results with 6 contestants is 3 px over at 1366x768 (existed before Sprint 5). Trim the Results spacing slightly so it fits with no page scroll. | Could | Developer | Done 2026-10-05 (Sprint 5). Long-name ties may still scroll (D-30). |
| FU-09 | Quick visual check of a 6x6 board with 6 players, and of the Results screen with 6 contestants, in a real windowed browser on a 1366x768 laptop. Expect a small scroll, which D-30 accepts. Raise a follow-up only if labels or owner names are hard to read. | Could | Owner | Done 2026-10-05: passed (owner confirmed); no follow-up. |

## Follow-ups after Sprint 6

| ID | Item | Priority | Owner | Status |
|---|---|---|---|---|
| FU-10 | Near-duplicate questions in the owner's local DB (OBS-4), from earlier admin edits and not in the seed, so fresh installs are clean. Both pairs can land on one board. In Admin, edit or delete one question of each pair. (1) Science: "What is the only metal that is liquid at room temperature?" vs bank "Which metal is a liquid at normal room temperature?" (both Mercury). (2) Geography: "Mount Fuji is located in which country?" vs bank "Which country is made up mainly of the islands of Honshu, ...?" (both Japan). Each category stays playable after a delete, because the bank gives every point value 100–500 at least 4 more questions. Check the point value of the question you keep, and do not delete a category's only 600 question. Per the rework dev note, the owner's Science Mercury question is at 600 locally (Science's only 600 question; check in Admin) and the bank one is at 400. Remove or reword the bank one, or reword the 600 one; do not delete the 600 one. Fuji is at 400 and the bank Japan question at 200, so either can go. Repeat on the hosted DB if the same pairs exist there. Do this after FU-13 (local DB restored and re-migrated). *(Still valid under the D-31 amendment of 2026-10-11.)* | Should | Owner | Done (owner confirmed 2026-10-12): handled in local Admin during the post-Sprint 6 cleanup. |
| FU-11 | Hosted Sprint 6 migration (Hostinger, steps in `docs/deploy-hostinger.md` 8.4 and 8.5). (1) Back up the hosted DB with a phpMyAdmin export. (2) Deploy the code. (3) Import `sql/migrate-question-bank.sql` in phpMyAdmin right away. Until then the old slot key still blocks a second question at the same category and point value; the game keeps working. (4) If the import fails on the temporary table, check that the DB user has the `CREATE TEMPORARY TABLES` privilege. If it fails with a duplicate entry on `uq_category_question`, fix the duplicates listed by the query in the file header and re-run. (5) Ctrl+F5 and purge the CDN cache so the new `admin.js` is served (7-day cache). (6) Smoke check: the question count rose by up to 120; the questions list shows a Points column; the categories show the count and "Playable" or "Not playable: missing V"; the point values panel shows counts; deleting a used point value gives 409; there is no Coverage panel; two new games draw different boards; admin writes still prompt for login (US-29). The Sprint 6 hosted redeploy is not done until this passes. **Updated 2026-10-11 (D-31 amended):** the migration now converts the old slot schema and **keeps** `points`. It only drops the slot key, adds the (category, question) key and adds the bank with points. The hosted DB was never migrated with the first Sprint 6 version, so it is a supported source as is. | Must | Owner (with Developer) | Done (owner confirmed 2026-10-12): the hosted DB is migrated. |
| FU-12 | "Cancel edit" is visible in Add mode on the admin Questions form (OBS-1). This existed before Sprint 6: `.btn` sets `display: block`, so `hidden` has no effect. Fix it with a `.btn[hidden] { display: none; }` rule. Clicking it in add mode only clears the form. *(Unaffected by the D-31 amendment.)* | Could | Developer | Done 2026-10-12: `.btn[hidden] { display: none; }` added to the stylesheet (it also replaces the answer-button-only rule). |
| FU-13 | Local DB after the D-31 amendment: the owner's local `brainrush` was converted by the first Sprint 6 migration, which dropped `points`, so the original point values are lost there. Restore the pre-Sprint 6 backup (`brainrush-backup-pre-sprint6.sql`, outside the repo), then run the new `sql/migrate-question-bank.sql`. Expected result: point values 100–600 and 155 questions, with the 600 Egypt questions kept at 600. The owner's local "How many bones ..." question (id 10) is at **500**; it replaced the seed's speed-of-light question. Bank Science #2 has the same text, also at 500, and is skipped as a duplicate. So Science has 4 questions at 500 locally instead of 5, which is fine. Any admin edits the owner made after the backup must be re-applied. *(Corrected 2026-10-11, re-test OBS-R3: an earlier version said 200.)* | Must (environment) | Developer | Done 2026-10-11. The local DB was restored and re-migrated twice: 155 questions, point values 100–600, settings put back to 6 / 30. A safety dump of the v1 state is in `brainrush-backup-sprint6-v1.sql`, outside the repo. |
| FU-14 | The 600 row is not random locally (re-test OBS-R1). Each seed category has only its one Egypt question at 600, so those 6 cells are the same in every game. To randomise the row, add more 600 questions per category in Admin. Any new question must not duplicate the bank (see `docs/question-bank.md` rules). This is not needed for playability. The hosted DB is the same if the 600 row is added there. | Could | Owner | Done 2026-10-12: Egypt 600 questions added via `sql/add-egypt-questions.sql` and `sql/add-egypt-600-questions.sql`, 4 per seed category locally. Import both on the hosted DB to get the same there. |
| FU-15 | Difficulty ranks of bank questions (re-test OBS-R2). Some ranks are debatable: Geography 500 "capital of Brazil" vs 400 "capital of Australia", and Technology 500 "decimal 5 in binary" vs 300 "bits in a byte". PO decision 2026-10-11: keep them as they are and review after the owner has played some games. A re-rank changes `docs/question-bank.md`, both schema files and the migration, and existing DBs only via Admin. | Could | PO | Done 2026-10-14 (owner decision after play): capital of Brazil 500 → 400, capital of Australia 400 → 500, bits in a byte 300 → 400; binary stays at 500. Changed on the live DB by the owner in Admin and on the local DB, and in `docs/question-bank.md`, both schema files and the migration. |

## Follow-ups after the Streak Challenge

| ID | Item | Priority | Owner | Status |
|---|---|---|---|---|
| FU-16 | Local Chrome walkthrough before commit (fix loop 1 was not re-tested by the tester). Check: (1) a wrong pick or time's up on an Arabic question shows "Wrong! The right answer was B, <Arabic answer>." with the full stop after the Arabic text; (2) a leaderboard row shows the name left and "· N questions · DD Mon YYYY" right, on one line, with your row highlighted, and no page scroll at 1366x768 with 10 rows; (3) a 1-player streak run end to end, plus one board game. After the pre-commit hook re-hashes the js/css, check that `index.html` and `admin.html` point at the new file names. | Must | Owner | Open |
| FU-17 | Hosted MariaDB version before the deploy: in phpMyAdmin run `SELECT VERSION();`. It must be 10.2 or later for `ROW_NUMBER() OVER` in `api/streaks.php` (D-17, D-37 k). If it is older, do not deploy; the developer replaces the query with a standard GROUP BY. | Must | Owner | Open |
| FU-18 | Hosted deploy order and smoke check. (1) Import `sql/migrate-add-streak.sql` in phpMyAdmin **before** the code. (2) Upload `api/questions.php`, `api/streaks.php`, `api/game-log.php`, the re-hashed js/css, `index.html`, `admin.html`, `how-to-play.html`, `terms.html` and `llms.txt`; purge the CDN cache. (3) With admin credentials set in `api/config.php`: `GET api/streaks.php?all=1` and `DELETE api/streaks.php?id=1` without a login give **401** (status only, US-29); with the login, the Admin "Streak leaderboard" panel lists runs and Delete works. (4) `GET api/streaks.php` is public and returns at most 10 rows. (5) Play one streak run of 1 or more on the live site, check it appears with the right date, then delete it in Admin if it was a test. | Must | Owner | Open |
| FU-19 | Admin page against a DB without the `streaks` table (tester PENDING): only the Streak leaderboard panel shows an error; the other panels work. Check locally on a scratch copy of the DB, or accept it as covered by FU-18 step 1 (the migration runs first). | Could | Developer | Open |

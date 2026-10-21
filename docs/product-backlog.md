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

US-01 to US-21 and US-23 to US-30 accepted. US-22 retired 2026-10-11 by D-31. Open items are listed under "Follow-ups after Sprint 4" and "Follow-ups after Sprint 6".

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

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
As a host, I want to pick exactly N categories from the playable ones, so that the board has the configured number of columns.
- **Given** the setup screen, **when** it loads, **then** it shows a checklist containing only playable categories (from `categories.php?playable=1`) and the text "Select N categories" with N from settings.
- **Given** fewer or more than N categories are checked, **when** the host clicks "Start Game", **then** the game does not start and an error states that exactly N must be selected.
- **Given** fewer than N playable categories exist, **when** setup loads, **then** a message says "Not enough playable categories — add questions in Admin" with a link to `admin.html`, and Start is disabled.

### US-05 Set timer for this game (Should)
As a host, I want to override the timer for this game, so that I can adapt to the group without changing admin settings.
- **Given** settings `timer_seconds = 30`, **when** setup loads, **then** the timer field is pre-filled with 30.
- **Given** the host enters a value outside 5–600 or a non-integer, **when** they click "Start Game", **then** the game does not start and an inline error is shown.
- **Given** the host sets 20, **when** the game is played, **then** every question countdown starts at 20 and the admin setting is unchanged.

### US-06 Start game (Must)
As a host, I want "Start Game" to load the board questions, so that play can begin.
- **Given** valid setup, **when** the host clicks "Start Game", **then** the app calls `questions.php?board=1&categories=<ids>` and shows the Board screen with all contestants at score 0.
- **Given** the API call fails, **when** the host clicks "Start Game", **then** an error message is shown and the host stays on setup with inputs intact.

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
- **Given** the countdown, **when** it reaches 0, **then** a beep plays (Web Audio), the timer stops at 0, and scoring buttons stay usable (see D-03).
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
- **Given** the point values panel, **then** values are listed ascending.
- **Given** a new positive integer not yet in the list (e.g. 1000), **when** added, **then** it appears in the list and as a new row/column in the coverage grid.
- **Given** a duplicate, zero, negative or non-integer value, **when** added, **then** an inline error is shown (duplicate → 409).
- **Given** a value with no questions, **when** deleted, **then** it disappears.
- **Given** a value still used by questions, **when** delete is attempted, **then** it is blocked with a clear inline error (HTTP 409) and nothing is deleted.

### US-20 Manage categories (Must)
As an admin, I want to add, rename and delete categories, so that content stays fresh.
- **Given** the categories panel, **then** each category shows a count "x / P" (questions / number of point values).
- **Given** a non-empty unique name, **when** added or renamed inline, **then** the list updates.
- **Given** an empty name or a name already used (case-insensitive), **when** saved, **then** an inline error is shown (duplicate → 409).
- **Given** a category with questions, **when** the admin clicks delete, **then** a confirm dialog warns its questions will also be deleted; **on confirm** the category and its questions are removed; **on cancel** nothing changes.

### US-21 Manage questions (Must)
As an admin, I want to add, edit and delete questions, so that each slot has content.
- **Given** the questions panel, **when** a category filter is chosen, **then** the table shows only that category's question / answer / points.
- **Given** the Add form, **when** a category is selected, **then** the points dropdown shows only that category's free slots.
- **Given** valid category, points, non-empty question and answer, **when** saved, **then** the question appears in the table and the counts/coverage update.
- **Given** a slot already filled (e.g. via a stale form or direct API call), **when** saved, **then** an inline error "This category already has a 300 question" is shown (HTTP 409).
- **Given** an existing question, **when** edited (including moving to another free slot), **then** changes persist; moving to an occupied slot gives the 409 error.
- **Given** a question, **when** deleted and confirmed, **then** it is removed.

### US-22 Coverage grid (Should)
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
- **Given** an empty MariaDB 10.4 server, **when** `sql/schema.sql` is run, **then** database `brainrush` (utf8mb4) exists with tables settings, point_values, categories, questions; settings are categories_per_game=5, timer_seconds=30; point values 100–500; 6 categories (Geography, Science, History, Sports, Movies, Technology) each with 5 questions.
- **Given** the schema, **then** `questions` has unique key (category_id, points), FK to categories with ON DELETE CASCADE and FK to point_values(points) with ON DELETE RESTRICT.

### US-25 API endpoints and validation (Must)
As a front-end, I want consistent JSON endpoints, so that the UI can rely on them.
- **Given** any endpoint, **then** responses are JSON with an appropriate HTTP status (200/201 success, 400 validation, 404 not found, 405 wrong method, 409 conflict, 500 server error with a generic message).
- **Given** `categories.php?playable=1`, **then** only categories with a question for every point value are returned.
- **Given** `questions.php?board=1&categories=1,2`, **then** the response is `{ points: [...ascending], categories: [{id, name, questions: {<points>: {question, answer}}}] }` in the requested order; unknown or non-numeric ids → 400.
- **Given** missing/empty name/question/answer, nonexistent category or points, or settings out of range, **then** the API returns 400 with a readable `error` message and changes nothing.

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

## Decisions

Where the spec is silent or ambiguous, the PO chose the simplest party-game behaviour:

| ID | Topic | Decision |
|---|---|---|
| D-01 | "all 25 cells" (spec, Board → End Game) | Board size is dynamic, so End Game is auto-offered when **all cells** (N × number of point values) are used. "25" was the 5×5 default example only. |
| D-02 | Unique names | Compared after trimming, case-insensitive. Players and teams follow the same rules. |
| D-03 | Timer at 0 | Beeps and stops at 0; nothing is auto-scored or auto-closed. The host can still score and must click "Back to Board". |
| D-04 | Refresh with question open | Question reopens with scoring done so far preserved; timer restarts at full length. |
| D-05 | Manual ± adjust step | Equals the smallest configured point value (dynamic, no hard-coded 100). Manual adjusts never change cell ownership/color. |
| D-06 | Opened cell | Once opened, a cell is always marked used on "Back to Board" (grey if no Correct). No "cancel" of a question. Scoring marks inside a question cannot be undone; use the manual ± buttons. |
| D-07 | Mode switch with too many names | Entries are not deleted automatically; Start is blocked with a message until the host removes extras. |
| D-08 | Wrong after Correct | Allowed for contestants not yet scored on that question (spec only disables other Correct buttons). |
| D-09 | End Game early | Requires a confirm dialog; unused cells are ignored. |
| D-10 | Ties | All contestants sharing the top score (including all at 0 or all negative) are co-winners. |
| D-11 | Not enough playable categories | Setup shows a message with a link to Admin; Start disabled. |
| D-12 | Admin changes during a game | A running game uses the board loaded at Start (stored in local state); admin edits apply to the next game. |
| D-13 | Point value validation | Positive integer 1–1,000,000; duplicates → 409. |
| D-14 | Category name | Non-empty after trimming, max 100 characters, unique case-insensitive (duplicate → 409). |
| D-15 | New Game | Clears all saved state including names; settings are reloaded from the API. |
| D-16 | Contestants mid-game | Adding/removing contestants after Start is not supported. |
| D-17 | Target database / runtime | The target database is **MariaDB 10.4** (MySQL 8 is no longer a target; changed 2026-10-04). The reference environment is XAMPP (MariaDB 10.4 + PHP 8.0, managed via phpMyAdmin). All SQL and PHP must stay compatible with **MariaDB 10.4** and **PHP 8.0** (no PHP 8.1+ features; no SQL syntax or collations missing on MariaDB 10.4). Schema must be importable via phpMyAdmin as well as the `mysql` CLI. **Amended 2026-10-04 (D-20):** code must also run on the newer managed MariaDB version Hostinger provides — use standard SQL only (no version-specific syntax, functions or collations; utf8mb4 with a collation available on both). |
| D-18 | Admin deletes | Every admin delete (point value, category, question) asks for a plain-text confirm first; Cancel sends nothing. A confirmed delete of a used point value still reaches the API and shows the 409 inline (US-19). Admin conveniences that only prefill forms (e.g. clickable coverage cells) are allowed. Added 2026-10-04 (Sprint 2). |
| D-19 | Admin layout | The admin page targets desktop/laptop widths (≥ 1024 px). Narrower widths may scroll tables horizontally inside their panel; mobile layout is out of scope. Messages and long unbroken names must not make the whole page scroll horizontally at ≥ 1024 px (follow-up for Sprint 2 O-5, fix with the Sprint 4 CSS work). Added 2026-10-04 (Sprint 2). |
| D-20 | Admin protection / hosting | Stakeholder decision 2026-10-04, **reverses** the spec rule "Admin page is not password-protected". BrainRush is deployed to Hostinger shared hosting as a public staging site and redeployed after each sprint. Admin writes (POST/PUT/DELETE on `api/*.php`) need HTTP Basic Auth when credentials (username + password hash) are set in `api/config.php`; with none set, writes are loopback-only (403 otherwise), so the public site fails closed. GET stays open; answers readable via the API is **accepted** as a known party-game limitation. Hosted site must use HTTPS. Details in US-29; US-28 README criterion amended accordingly. **Amended 2026-10-04 (US-29 acceptance):** "local" means loopback address **and** local `Host` (`localhost` / `127.0.0.1` / `[::1]`) **and** no forwarding headers; anything else (custom local host names, reverse proxies) needs admin keys. Half-configured or non-hash admin keys fail closed with 500 + hint. |

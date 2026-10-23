# BrainRush — Trivia Board Game (PHP + MariaDB)

## Context
Greenfield project in `C:\Users\NB28970\Desktop\claude\BrainRush` (folder is empty). Build a Jeopardy-style party trivia game: a host runs the game on one screen, players/teams answer out loud, and the host awards or deducts points manually. Plus an admin page to manage categories and questions. Stack: HTML/CSS/vanilla JS front end, PHP (PDO) JSON API, MariaDB 10.4. User will install PHP + MariaDB locally before development (built-in `php -S` server is enough; XAMPP also works).

Decisions confirmed with user:
- Admin manages categories; host picks N of them at game setup (N configurable, default 5).
- **Nothing hard-coded about board size**: number of categories, the list of point values (e.g. 100…500 today, 100…10000 tomorrow) and the timer length are all configuration stored in the DB and editable in admin.
- ~~Exactly **one question per category + point value slot** (enforced by DB unique key).~~ Changed 2026-10-11 (D-31, amended 2026-10-11): each question still has a point value, but a category may have **any number of questions per point value** (a question bank per category + point value). For each new game, every board cell gets a **random** question from that category's questions with that point value (pure random, no play history). An exact duplicate question text in the same category (case-insensitive) is rejected (409). (The first D-31 version, with no point value on questions, was replaced the same day.)
- Each player/team gets a color; an answered cell is filled with the color of whoever answered it correctly.
- ~~Admin page is **not** password-protected.~~ Changed 2026-10-04 (D-20): admin **write** operations are protected by HTTP Basic Auth when admin credentials are configured; otherwise writes are allowed only from localhost. See Security notes.

## Delivery team: 6 project agents
The work is done by a simulated Scrum team, defined as project subagents in `BrainRush/.claude/agents/` (Markdown with frontmatter: `name`, `description`, `tools`, `model`, and a system prompt body). The product spec in the rest of this plan is the input to the Product Owner.

| File | Agent | Role | Tools | Output |
|---|---|---|---|---|
| `product-owner.md` | **product-owner** | Owns BrainRush business rules (players/teams limits, dynamic board, ~~one question per slot~~ question bank per category + point value (changed 2026-10-11, D-31 amended), scoring +/−, timer, cell coloring, winner/tie, admin rules). Turns this spec into a product backlog of user stories with acceptance criteria (Given/When/Then); answers rule questions from other agents; accepts/rejects sprint results against acceptance criteria. | Read, Write, Edit, Glob, Grep | `docs/product-backlog.md` |
| `scrum-master.md` | **scrum-master** | Reads the backlog, splits it into ordered sprints with goals, story list, task breakdown, dependencies and Definition of Done; tracks status after each sprint. Does not write code. | Read, Write, Edit, Glob, Grep | `docs/sprint-plan.md` (status updated per sprint) |
| `game-developer.md` | **game-developer** | Senior full-stack game developer (PHP 8 + PDO, MariaDB, vanilla JS/HTML/CSS). Implements only the stories of the current sprint, following the architecture/security rules below (prepared statements, `textContent`, no hard-coded board size). Writes a short sprint dev note. | Read, Write, Edit, Glob, Grep, Bash | code + `docs/sprints/sprint-N-dev.md` |
| `game-tester.md` | **game-tester** | Senior QA. After each sprint, verifies every acceptance criterion: `php -l` on all PHP, API checks with `curl`, UI flows in the browser pane (setup limits, dynamic grid, timer, scoring, colors, refresh restore, results/tie, admin CRUD + 409s). Reports bugs with steps to reproduce; does not fix code. | Read, Glob, Grep, Bash, browser tools | `docs/sprints/sprint-N-test-report.md` |
| `question-producer.md` | **question-producer** | Trivia content producer (added 2026-10-18, outside the sprint flow). Writes question sets with answers, `(accept X)` variants and Arabic text, checks every answer in 2+ reputable sources, assigns point values by relative difficulty and balances categories, then packages the set as an idempotent SQL file and loads it into the local DB. ~~No multiple-choice distractors (the host judges spoken answers).~~ Changed 2026-10-23 (D-36): every question gets 2 plausible wrong options in English and Arabic for the "3 choices" helper (same type and length as the answer, never also correct; similar-looking flags for flag questions). | Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch | `sql/add-<set>-questions.sql` + `docs/question-sets/<set>-review.md` |
| `question-bank-manager.md` | **question-bank-manager** | Question bank manager (added 2026-10-23, outside the sprint flow). Keeps the bank at 10 questions per category and enabled point value: measures the gaps in the local DB, plans a batch of 10 (largest gap first, at most 4 per category), briefs the question-producer, checks the batch on a scratch copy of the DB, and after the owner's review applies removals to `docs/question-sets/rejected-answers.md`, loads the batch locally and commits it. Never touches the live DB; pushes only after the owner confirms. | Read, Write, Edit, Glob, Grep, Bash, WebFetch | `sql/add-auto-<date>-questions.sql` + `docs/question-sets/auto-<date>-review.md` (written by the producer) + run report |

### Workflow (I orchestrate)
1. **product-owner** → writes `docs/product-backlog.md` from this plan.
2. **scrum-master** → writes `docs/sprint-plan.md`. Expected shape (SM decides final split):
   - Sprint 1 – Foundation: schema + seed, `db.php`/`config.php`, all API endpoints.
   - Sprint 2 – Admin: settings, point values, categories, questions, coverage grid.
   - Sprint 3 – Game setup + dynamic board + player colors + localStorage.
   - Sprint 4 – Question screen, configurable timer, scoring, cell coloring, results, README.
3. For each sprint: **game-developer** implements → **game-tester** tests → if bugs, back to developer (max 2 fix loops) → **product-owner** accepts → **scrum-master** updates status → **commit & push** (below).
4. I summarize each sprint's result to you before starting the next one.

### Automatic question top-up
A Claude desktop scheduled task (`brainrush-question-topup`, Mon/Wed/Fri 09:00, runs while the app is open) runs **question-bank-manager** (plan) -> **question-producer** (writes the batch) -> **question-bank-manager** (validate) in the worktree `../BrainRush-auto-questions`. A run does nothing while an earlier batch is still in that worktree, and nothing is loaded, committed or pushed until the owner has reviewed the batch. The owner then tells a session which questions to remove; the manager applies that in "review" mode, and the owner opens the PR and imports on live as for other question sets.

### Git / GitHub (`https://github.com/ahmedfahim89/brainRush`)
- Sprint 0 setup: `git init -b main`, add remote `origin`, `.gitignore` (excludes `api/config.php`; a `api/config.example.php` with placeholder values is committed instead, so no DB credentials ever reach GitHub). First commit on `main`: agents, docs (backlog + sprint plan), `.gitignore`, README stub → push `main`.
- Each sprint: branch `sprint-N` (from the previous sprint's branch), commit the sprint's code + dev note + test report with message `Sprint N: <sprint goal>` (+ Co-Authored-By trailer), push, and open a PR to `main` with `gh pr create` listing stories done and test results — so you review/merge (org policy: AI code is human-reviewed before merge).
- I'll check `git ls-remote` first; if the remote repo already has commits I'll pull/rebase onto them rather than overwrite. Push uses your existing git credentials — if auth fails I'll stop and ask you to log in (`gh auth login`).

Note: project agents are loaded at session start; if they aren't picked up right after creation, I'll either ask you to reload the session or run them as `general-purpose` agents with the agent file's prompt. Testing that needs PHP/MariaDB waits until you've installed them — until then the tester runs static checks only and flags the rest as pending.

## File structure
```
BrainRush/
  .claude/agents/       # product-owner.md, scrum-master.md, game-developer.md, game-tester.md, question-producer.md, question-bank-manager.md
  docs/                 # product-backlog.md, sprint-plan.md, sprints/sprint-N-{dev,test-report}.md
  index.html            # game (setup → board → question → results), single page
  admin.html            # admin CRUD page
  css/style.css         # shared styles (dark board, gold scores, big readable text)
  js/game.js            # game state machine, board, timer, scoring
  js/admin.js           # admin CRUD UI
  api/config.example.php # DB settings template (committed); copied to api/config.php (git-ignored)
  api/db.php            # PDO connection helper + json_response()/read_json_body()
  api/settings.php      # GET/PUT game settings (categories_per_game, timer_seconds)
  api/points.php        # GET/POST/DELETE point values (the board's y-axis)
  api/categories.php    # GET list (?playable=1 → only categories with at least one question for every point value), POST, PUT, DELETE
  api/questions.php     # GET list (?category_id=), GET for board (?board=1&categories=1,2,...), POST, PUT, DELETE
  api/game-log.php      # POST: one log line per started game (players, teams or a streak run)
  api/streaks.php       # Streak Challenge leaderboard: GET top 10, POST a run; GET ?all=1 / DELETE (admin)
  sql/schema.sql        # tables + sample seed data (5–6 categories × 5 questions)
  sql/schema-hosted.sql # same tables + seed, no CREATE DATABASE/USE (phpMyAdmin import on hosting)
  .htaccess             # HTTPS redirect, Authorization pass-through, access blocks (hosted deploy)
  docs/deploy-hostinger.md # deployment guide (Hostinger shared hosting)
  README.md             # setup steps
```

## Database (`sql/schema.sql`)
```sql
CREATE DATABASE IF NOT EXISTS brainrush CHARACTER SET utf8mb4;
settings(name VARCHAR(50) PK, value VARCHAR(255))      -- categories_per_game=5, timer_seconds=30
point_values(id PK AI, points INT UNSIGNED UNIQUE NOT NULL)  -- seeded 100,200,300,400,500
categories(id PK AI, name VARCHAR(100) UNIQUE NOT NULL, created_at)
questions(id PK AI, category_id FK→categories ON DELETE CASCADE,
          points INT UNSIGNED NOT NULL,   -- FK→point_values(points) ON UPDATE CASCADE, ON DELETE RESTRICT
          question TEXT NOT NULL, answer TEXT NOT NULL,
          UNIQUE KEY uq_category_question (category_id, question(191)))   -- case-insensitive (_ci collation)
```
Changed 2026-10-23 (D-36, helpers): `questions` also has `wrong_1`, `wrong_2`, `wrong_1_ar`, `wrong_2_ar` (`VARCHAR(255) NULL`, after `image_credit`), the two wrong options per language of the "3 choices" helper; NULL = none yet. Existing databases get them from `sql/migrate-add-wrong-options.sql` (run before the code); `sql/add-wrong-options.sql` fills them in.

New 2026-10-23 (D-37, Streak Challenge): `streaks(id PK AI, name VARCHAR(30), streak INT UNSIGNED, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, KEY idx_streaks_name (name), KEY idx_streaks_streak (streak))`, one row per finished run of 1 or more. The `_ci` collation makes "one person" (the challenger name) case-insensitive. (Owner change 2026-10-23: one `name` column replaces `first_name` + `last_name`.) Existing databases get it from `sql/migrate-add-streak.sql` (run before the code).

Changed 2026-10-11 (D-31, amended 2026-10-11): ~~`UNIQUE KEY uq_slot (category_id, points)`~~ is removed, so a category may have several questions per point value. `points` and its FK stay. The new unique key blocks duplicate question text within a category. Existing databases are converted by `sql/migrate-question-bank.sql`, which keeps all existing questions and their points.

Seed: settings defaults, point values 100–500, and Geography, Science, History, Sports, Movies, Technology ~~each with one question per point value~~ each with 5 questions per point value, 25 in total (changed 2026-10-11, D-31 amended: the original seed question plus 4 from `docs/question-bank.md` per value), so the game is playable immediately.

Board size is derived at runtime: columns = `categories_per_game`, rows = all `point_values` sorted ascending. A category is "playable" only if it has a question for every point value, so changing the scale (e.g. adding 1000…10000) automatically shows which categories need more questions. Deleting a point value that still has questions is blocked with a clear error (409). Changed 2026-10-11 (D-31, amended 2026-10-11): these two rules are unchanged. New: when a game starts, each cell gets a random question from the questions of that category and point value.

## API (PHP, JSON in/out)
- `db.php`: PDO with `ERRMODE_EXCEPTION`, prepared statements everywhere; helpers `json_response($data, $code)` and `read_json_body()`; method routing via `$_SERVER['REQUEST_METHOD']`.
- Validation: name/question/answer non-empty, points exists in `point_values`, category exists; settings: categories_per_game 1–10, timer_seconds 5–600. ~~Duplicate slot → catch SQLSTATE 23000 → HTTP 409 "This category already has a 300 question".~~ Changed 2026-10-11 (D-31, amended): duplicate question text in the same category → catch SQLSTATE 23000 → HTTP 409 "This category already has this question". Several questions may share a category and point value.
- `categories.php?playable=1` returns only categories with every point value filled (used by game setup).
- `questions.php?board=1&categories=...` returns `{ points: [...], categories: [{id, name, questions: {points: {question, answer}}}] }` for the board (includes answer so host can reveal it). Changed 2026-10-11 (D-31, amended): same shape; each cell is a random pick from that category's questions with that point value; a category missing a point value → 400.
- Changed 2026-10-23 (D-36): every question (admin list and board cell) also carries `wrong_1`, `wrong_2`, `wrong_1_ar`, `wrong_2_ar` (null when empty). On create/update they are optional, one line, max 255; each language's pair is both-or-nothing, the two differ and neither is the answer (case-insensitive, both as typed and as the game shows a choice: cut at the first " (", or "(" in Arabic); Arabic ones need the Arabic question and the English ones; a question with Arabic and English wrong options needs the Arabic ones. Otherwise 400.
- New 2026-10-23 (D-36): `POST questions.php?random=1` body `{ exclude: [ids], seen: [ids] }` (public, for the Swap helper) → `{ category: {id, name}, points, question }`: a random playable category (same rule as `categories.php?playable=1`, shared as `PLAYABLE_HAVING` in `db.php`), a random enabled point value, unseen first, otherwise the one seen longest ago, never an excluded id; nothing left → 409.
- New 2026-10-23 (D-37): `POST questions.php?streak=1` body `{ exclude?: [ids], seen?: [ids] }` (public, for the Streak Challenge) → `{ questions: [{id, category_name, points, question, question_ar, image, image_credit, choices: [{text, text_ar}] ×3, correct}] }`, up to 20, `[]` when nothing is left. All questions at enabled point values minus `exclude`, unseen first in random order, then the ones seen longest ago. Choices are cut by `choice_text()` and shuffled on the server; `correct` is the answer's index. Wrong choices: the stored pair when complete (and the Arabic pair when the question has Arabic), otherwise 2 answers borrowed from the same category and kind (picture or text), then from any category of that kind, distinct after `fold_text()`; a question that can't get 2 is skipped.
- New 2026-10-23 (D-37): `api/streaks.php`. `GET` (public) → top 10 `[{name, streak, date: "YYYY-MM-DD"}]`, the best run per person (per challenger name: highest streak, earliest run on a tie). `POST` (public, JSON) `{name, streak}` → 201 `{rank, best}`; the challenger name 1–30 characters with control characters turned into spaces ("Challenger name is required" otherwise), streak 1–100000, else 400. `GET ?all=1` (every run `{id, name, streak, created_at}`, newest first) and `DELETE ?id=` need admin access (`require_admin()`).
- Changed 2026-10-23 (D-37): `api/game-log.php` also takes mode `streak` with one name, the challenger name (up to 30 characters, as player names), and no categories; the line reads `… | streak: <name> | categories: all`.

## Game page (`index.html` + `js/game.js`)
Screens toggled by JS (single page, state held in a JS object, also saved to `localStorage` so an accidental refresh doesn't lose the game):

1. **Setup**
   - Mode toggle: Players (max 6) / Teams (max 4).
   - Dynamic name inputs with "Add"/"Remove" (min 1 … max per mode); reject empty/duplicate names.
   - Each player/team auto-assigned a distinct color from a 6-color palette (shown as a swatch, clickable to change).
   - Category picker: checklist of playable categories, select at least 1 and up to `categories_per_game` (loaded from settings). Changed 2026-10-11 (D-32): was "exactly `categories_per_game`".
   - "Surprise me!" tile first in the picker (D-33): alone it picks 3 random playable categories; with other picks it adds 1 random category in its slot. Random columns show "?" on the board until one of their questions is opened.
   - Timer seconds field pre-filled from settings (`timer_seconds`), host can override for this game.
   - "Start Game" → fetch board questions.
2. **Board**
   - CSS grid built dynamically: `grid-template-columns: repeat(N, 1fr)` — header row = selected category names (x-axis); one row per point value ascending (y-axis). Works for any number of categories/point values; font size scales for large numbers (e.g. 10000).
   - Answered cells are disabled and filled with the color of the player/team that answered correctly (with their name shown small in the cell). If nobody answered correctly, the cell is grey.
   - Scoreboard strip below with each player/team name + current score (negative allowed). Small ±manual adjust buttons for corrections.
   - "End Game" button (also auto-offered when all 25 cells used).
3. **Question modal / screen**
   - Shows "Geography – 300" and the question text in large type.
   - Countdown of the configured length starts automatically (visual bar + number; turns red in the last third; stops silently with "Time's up!" when it hits 0). Pause/Resume and Reset buttons.
   - "Show Answer" button reveals the stored answer.
   - Per player/team row (in their color): **✓ Correct (+300)** and **✗ Wrong (−300)** buttons; host may score several wrong attempts. Each player can be scored once per question; once someone is marked correct, other "Correct" buttons disable and that player becomes the cell's owner/color.
   - "Back to Board" marks the cell as used.
   - Helpers (added 2026-10-23, D-36 / US-32): each scoring row has 3 icon-sized chips, each usable once per game per contestant and only before anyone is scored and before the answer is shown (confirm first). **3 choices** (ABC) shows the answer and 2 wrong options as A/B/C in a saved random order, in the question's language, each cut at its first bracket, with a compact question layout so it fits 1366x768; **Swap** (⇄) replaces the question with a random one from the whole bank (new heading with a "Swapped from …" note, new points, timer restarts; the cell closes with its result); **Skip** (½) subtracts half the points and closes the cell grey. After a helper only its user can be scored. Scoreboard cards show the helpers left.
4. **Results**
   - Players sorted by score, winner highlighted (ties handled: "It's a tie between X and Y"). "New Game" resets state.
5. **Streak Challenge** (added 2026-10-23, D-37 / US-33, US-34)
   - Players mode with exactly 1 entry shows "Streak Challenge (solo)" beside the Players / Teams toggle. It swaps the player row and the category picker for one "Challenger name" field (1–30 characters after trimming, prefilled from the player's name when empty), and Start Game becomes "Start Streak Challenge", which starts the run with the setup timer.
   - The question screen gets a `streak` class: no Show Answer, Pause/Reset, scoring panel or helpers; a streak panel (name, "Streak N", 3 choice buttons, feedback, Next / See results, End run) takes the scoring panel's column. Batches of 20 come from `questions.php?streak=1`; the next batch is fetched when fewer than 5 are queued, excluding the run's questions. Opened questions are marked seen.
   - A right pick: +1, green, "Next question" (Enter works). A wrong pick or time's up ends the run (pick red, answer green, "See results"). "End run" saves early. The run is saved under its own localStorage key `brainrush.streak` (validated on load) with a wall-clock deadline, so a refresh keeps the count and the time left; the board game's saved state is unchanged.
   - Game over: runs of 1 or more are posted to `streaks.php`, then `screen-leaderboard` shows "Name: N in a row!", the rank, the top 10 ("Name · N questions · DD Mon YYYY", e.g. "Ahmed Fahim · 13 questions · 18 Oct 2026", this person highlighted), "Play again" and "New Game". The highlighted "🏆 Streak leaderboard" button in the streak setup opens the same screen with "Back".

## Admin page (`admin.html` + `js/admin.js`)
- **Settings panel**: categories per game, default timer seconds — saved via `settings.php`.
- **Point values panel**: list of point values (board rows) with the number of questions per value; add new value (e.g. 1000, 10000), delete unused ones (a used value → 409).
- **Categories panel**: list with question count ~~(x / number of point values)~~ and status "Playable" or "Not playable: missing 600" listing the point values without a question (changed 2026-10-11, D-31 amended), add, rename (inline edit), delete (confirm dialog warns it deletes its questions).
- **Questions panel**: filter by category; table of category / points / question / answer, sorted by category, then points, then id; Add/Edit form (category dropdown, points dropdown ~~showing only free slots when adding~~ listing all point values, question textarea, answer input); delete with confirm. Changed 2026-10-11 (D-31 amended): no free-slot filtering, since several questions may share a point value. Changed 2026-10-23 (D-36): the form has optional "Wrong option 1/2" and "Arabic wrong option 1/2" fields (checked like the API), and the table has a "Choices" column (✓ / -) to track which questions have them.
- ~~Coverage grid view: categories × points showing which slots are filled — makes it easy to see what's missing.~~ Removed 2026-10-11 (D-31, kept removed by the amendment): the categories status and the per-value counts show what is missing.
- **Streak leaderboard panel** (added 2026-10-23, D-37): every saved run (name, streak, date and time, newest first) with Delete (confirm first, D-18), so junk or offensive names can be removed.
- Errors from API (409 duplicates, validation) shown inline.
- Link back to the game.

## Security notes
- All SQL via prepared statements; all user text rendered with `textContent` (no `innerHTML` of data) to avoid XSS.
- `api/config.php` is git-ignored and holds the real credentials; the committed `api/config.example.php` holds placeholders only (admin keys empty). README tells the user to copy it and set their own.
- **Admin auth (D-20, changed 2026-10-04)**: write requests (POST/PUT/DELETE on `api/*.php`) require HTTP Basic Auth when admin credentials (username + `password_hash`) are configured in the git-ignored `api/config.php`. Missing/wrong credentials → 401 with a `WWW-Authenticate: Basic` challenge. When no admin credentials are configured, writes are allowed only from loopback (127.0.0.1 / ::1) with a local `Host` (`localhost` / `127.0.0.1` / `[::1]`) and no proxy/forwarding headers, otherwise 403 with a human-readable message — local play/dev works unchanged and a public deploy fails closed.
- GET endpoints stay open because the game needs them. Known, accepted limitation: questions and answers are readable via the API by anyone who knows the URL (acceptable for a party game).
- Public writes (added 2026-10-23, D-37): the game log and `POST streaks.php` need no login (JSON only, every field validated). Accepted limitation: a determined user can post a fake streak; the admin deletes such rows. Listing every run and deleting one need admin access.
- Hosted deployments (public staging on Hostinger shared hosting, redeployed after each sprint) must use HTTPS. `.htaccess` forces HTTPS on non-localhost hosts, passes the `Authorization` header to PHP, disables directory listing and blocks web access to `sql/`, `docs/`, `.claude/`, `README.md` and `api/config*.php`. Deployment steps in `docs/deploy-hostinger.md`; database imported via phpMyAdmin from `sql/schema-hosted.sql` (no `CREATE DATABASE`/`USE`, kept in sync with `sql/schema.sql`).
- README describes local setup, admin credential setup and links the deployment guide.

## Verification
1. Install PHP + MariaDB 10.4 (e.g. XAMPP), run `mysql -u root -p < sql/schema.sql`, set credentials in `api/config.php`.
2. Start server from project root: `php -S localhost:8000`.
3. Admin (`http://localhost:8000/admin.html`): add a category, add questions for all slots, try a duplicate slot (expect 409 message), edit/delete a question, delete a category. Change settings to 6 categories / 20 s, add point value 1000 → coverage grid shows new empty column; fill it for 6 categories. Changed 2026-10-11 (D-31, amended): there is no coverage grid and a second question per slot is allowed. Instead, add questions for every point value to a new category (including two at the same value), try a duplicate question text (expect 409), add point value 1000 and check that the categories panel shows "missing 1000", and try to delete a used point value (expect 409). Full checks in US-30.
4. Game (`http://localhost:8000/`): try 7 players / 5 teams (blocked), pick 6 categories → board is 6 × 6 with 100…1000; open a cell → timer counts down from 20 and stops at 0 with "Time's up!"; mark one wrong (−) and one correct (+) → cell takes the correct player's color; a cell with no correct answer turns grey; refresh mid-game (state restored); finish board → results show correct winner/tie.
5. Use the built-in browser pane to click through the flow and check the console for JS errors.

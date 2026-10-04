# BrainRush — Trivia Board Game (PHP + MariaDB)

## Context
Greenfield project in `C:\Users\NB28970\Desktop\claude\BrainRush` (folder is empty). Build a Jeopardy-style party trivia game: a host runs the game on one screen, players/teams answer out loud, and the host awards or deducts points manually. Plus an admin page to manage categories and questions. Stack: HTML/CSS/vanilla JS front end, PHP (PDO) JSON API, MariaDB 10.4. User will install PHP + MariaDB locally before development (built-in `php -S` server is enough; XAMPP also works).

Decisions confirmed with user:
- Admin manages categories; host picks N of them at game setup (N configurable, default 5).
- **Nothing hard-coded about board size**: number of categories, the list of point values (e.g. 100…500 today, 100…10000 tomorrow) and the timer length are all configuration stored in the DB and editable in admin.
- Exactly **one question per category + point value slot** (enforced by DB unique key).
- Each player/team gets a color; an answered cell is filled with the color of whoever answered it correctly.
- ~~Admin page is **not** password-protected.~~ Changed 2026-10-04 (D-20): admin **write** operations are protected by HTTP Basic Auth when admin credentials are configured; otherwise writes are allowed only from localhost. See Security notes.

## Delivery team: 4 project agents
The work is done by a simulated Scrum team, defined as project subagents in `BrainRush/.claude/agents/` (Markdown with frontmatter: `name`, `description`, `tools`, `model`, and a system prompt body). The product spec in the rest of this plan is the input to the Product Owner.

| File | Agent | Role | Tools | Output |
|---|---|---|---|---|
| `product-owner.md` | **product-owner** | Owns BrainRush business rules (players/teams limits, dynamic board, one question per slot, scoring +/−, timer, cell coloring, winner/tie, admin rules). Turns this spec into a product backlog of user stories with acceptance criteria (Given/When/Then); answers rule questions from other agents; accepts/rejects sprint results against acceptance criteria. | Read, Write, Edit, Glob, Grep | `docs/product-backlog.md` |
| `scrum-master.md` | **scrum-master** | Reads the backlog, splits it into ordered sprints with goals, story list, task breakdown, dependencies and Definition of Done; tracks status after each sprint. Does not write code. | Read, Write, Edit, Glob, Grep | `docs/sprint-plan.md` (status updated per sprint) |
| `game-developer.md` | **game-developer** | Senior full-stack game developer (PHP 8 + PDO, MariaDB, vanilla JS/HTML/CSS). Implements only the stories of the current sprint, following the architecture/security rules below (prepared statements, `textContent`, no hard-coded board size). Writes a short sprint dev note. | Read, Write, Edit, Glob, Grep, Bash | code + `docs/sprints/sprint-N-dev.md` |
| `game-tester.md` | **game-tester** | Senior QA. After each sprint, verifies every acceptance criterion: `php -l` on all PHP, API checks with `curl`, UI flows in the browser pane (setup limits, dynamic grid, timer, scoring, colors, refresh restore, results/tie, admin CRUD + 409s). Reports bugs with steps to reproduce; does not fix code. | Read, Glob, Grep, Bash, browser tools | `docs/sprints/sprint-N-test-report.md` |

### Workflow (I orchestrate)
1. **product-owner** → writes `docs/product-backlog.md` from this plan.
2. **scrum-master** → writes `docs/sprint-plan.md`. Expected shape (SM decides final split):
   - Sprint 1 – Foundation: schema + seed, `db.php`/`config.php`, all API endpoints.
   - Sprint 2 – Admin: settings, point values, categories, questions, coverage grid.
   - Sprint 3 – Game setup + dynamic board + player colors + localStorage.
   - Sprint 4 – Question screen, configurable timer, scoring, cell coloring, results, README.
3. For each sprint: **game-developer** implements → **game-tester** tests → if bugs, back to developer (max 2 fix loops) → **product-owner** accepts → **scrum-master** updates status → **commit & push** (below).
4. I summarize each sprint's result to you before starting the next one.

### Git / GitHub (`https://github.com/ahmedfahim89/brainRush`)
- Sprint 0 setup: `git init -b main`, add remote `origin`, `.gitignore` (excludes `api/config.php`; a `api/config.example.php` with placeholder values is committed instead, so no DB credentials ever reach GitHub). First commit on `main`: agents, docs (backlog + sprint plan), `.gitignore`, README stub → push `main`.
- Each sprint: branch `sprint-N` (from the previous sprint's branch), commit the sprint's code + dev note + test report with message `Sprint N: <sprint goal>` (+ Co-Authored-By trailer), push, and open a PR to `main` with `gh pr create` listing stories done and test results — so you review/merge (org policy: AI code is human-reviewed before merge).
- I'll check `git ls-remote` first; if the remote repo already has commits I'll pull/rebase onto them rather than overwrite. Push uses your existing git credentials — if auth fails I'll stop and ask you to log in (`gh auth login`).

Note: project agents are loaded at session start; if they aren't picked up right after creation, I'll either ask you to reload the session or run them as `general-purpose` agents with the agent file's prompt. Testing that needs PHP/MariaDB waits until you've installed them — until then the tester runs static checks only and flags the rest as pending.

## File structure
```
BrainRush/
  .claude/agents/       # product-owner.md, scrum-master.md, game-developer.md, game-tester.md
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
  api/categories.php    # GET list (?playable=1 → only categories with every point value filled), POST, PUT, DELETE
  api/questions.php     # GET list (?category_id=), GET for board (?board=1&categories=1,2,...), POST, PUT, DELETE
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
          UNIQUE KEY uq_slot (category_id, points))
```
Seed: settings defaults, point values 100–500, and Geography, Science, History, Sports, Movies, Technology each with one question per point value so the game is playable immediately.

Board size is derived at runtime: columns = `categories_per_game`, rows = all `point_values` sorted ascending. A category is "playable" only if it has a question for every point value, so changing the scale (e.g. adding 1000…10000) automatically shows which categories need more questions. Deleting a point value that still has questions is blocked with a clear error (409).

## API (PHP, JSON in/out)
- `db.php`: PDO with `ERRMODE_EXCEPTION`, prepared statements everywhere; helpers `json_response($data, $code)` and `read_json_body()`; method routing via `$_SERVER['REQUEST_METHOD']`.
- Validation: name/question/answer non-empty, points exists in `point_values`, category exists; settings: categories_per_game 1–10, timer_seconds 5–600. Duplicate slot → catch SQLSTATE 23000 → HTTP 409 "This category already has a 300 question".
- `categories.php?playable=1` returns only categories with every point value filled (used by game setup).
- `questions.php?board=1&categories=...` returns `{ points: [...], categories: [{id, name, questions: {points: {question, answer}}}] }` for the board (includes answer so host can reveal it).

## Game page (`index.html` + `js/game.js`)
Screens toggled by JS (single page, state held in a JS object, also saved to `localStorage` so an accidental refresh doesn't lose the game):

1. **Setup**
   - Mode toggle: Players (max 6) / Teams (max 4).
   - Dynamic name inputs with "Add"/"Remove" (min 1 … max per mode); reject empty/duplicate names.
   - Each player/team auto-assigned a distinct color from a 6-color palette (shown as a swatch, clickable to change).
   - Category picker: checklist of playable categories, must select exactly `categories_per_game` (loaded from settings).
   - Timer seconds field pre-filled from settings (`timer_seconds`), host can override for this game.
   - "Start Game" → fetch board questions.
2. **Board**
   - CSS grid built dynamically: `grid-template-columns: repeat(N, 1fr)` — header row = selected category names (x-axis); one row per point value ascending (y-axis). Works for any number of categories/point values; font size scales for large numbers (e.g. 10000).
   - Answered cells are disabled and filled with the color of the player/team that answered correctly (with their name shown small in the cell). If nobody answered correctly, the cell is grey.
   - Scoreboard strip below with each player/team name + current score (negative allowed). Small ±manual adjust buttons for corrections.
   - "End Game" button (also auto-offered when all 25 cells used).
3. **Question modal / screen**
   - Shows "Geography – 300" and the question text in large type.
   - Countdown of the configured length starts automatically (visual bar + number; turns red in the last third; beep via Web Audio when it hits 0). Pause/Resume and Reset buttons.
   - "Show Answer" button reveals the stored answer.
   - Per player/team row (in their color): **✓ Correct (+300)** and **✗ Wrong (−300)** buttons; host may score several wrong attempts. Each player can be scored once per question; once someone is marked correct, other "Correct" buttons disable and that player becomes the cell's owner/color.
   - "Back to Board" marks the cell as used.
4. **Results**
   - Players sorted by score, winner highlighted (ties handled: "It's a tie between X and Y"). "New Game" resets state.

## Admin page (`admin.html` + `js/admin.js`)
- **Settings panel**: categories per game, default timer seconds — saved via `settings.php`.
- **Point values panel**: list of point values (board rows); add new value (e.g. 1000, 10000), delete unused ones.
- **Categories panel**: list with question count (x / number of point values), add, rename (inline edit), delete (confirm dialog warns it deletes its questions).
- **Questions panel**: filter by category; table of question / answer / points; Add/Edit form (category dropdown, points dropdown showing only free slots when adding, question textarea, answer input); delete with confirm.
- Coverage grid view: categories × points showing which slots are filled — makes it easy to see what's missing.
- Errors from API (409 duplicates, validation) shown inline.
- Link back to the game.

## Security notes
- All SQL via prepared statements; all user text rendered with `textContent` (no `innerHTML` of data) to avoid XSS.
- `api/config.php` is git-ignored and holds the real credentials; the committed `api/config.example.php` holds placeholders only (admin keys empty). README tells the user to copy it and set their own.
- **Admin auth (D-20, changed 2026-10-04)**: write requests (POST/PUT/DELETE on `api/*.php`) require HTTP Basic Auth when admin credentials (username + `password_hash`) are configured in the git-ignored `api/config.php`. Missing/wrong credentials → 401 with a `WWW-Authenticate: Basic` challenge. When no admin credentials are configured, writes are allowed only from loopback (127.0.0.1 / ::1) with a local `Host` (`localhost` / `127.0.0.1` / `[::1]`) and no proxy/forwarding headers, otherwise 403 with a human-readable message — local play/dev works unchanged and a public deploy fails closed.
- GET endpoints stay open because the game needs them. Known, accepted limitation: questions and answers are readable via the API by anyone who knows the URL (acceptable for a party game).
- Hosted deployments (public staging on Hostinger shared hosting, redeployed after each sprint) must use HTTPS. `.htaccess` forces HTTPS on non-localhost hosts, passes the `Authorization` header to PHP, disables directory listing and blocks web access to `sql/`, `docs/`, `.claude/`, `README.md` and `api/config*.php`. Deployment steps in `docs/deploy-hostinger.md`; database imported via phpMyAdmin from `sql/schema-hosted.sql` (no `CREATE DATABASE`/`USE`, kept in sync with `sql/schema.sql`).
- README describes local setup, admin credential setup and links the deployment guide.

## Verification
1. Install PHP + MariaDB 10.4 (e.g. XAMPP), run `mysql -u root -p < sql/schema.sql`, set credentials in `api/config.php`.
2. Start server from project root: `php -S localhost:8000`.
3. Admin (`http://localhost:8000/admin.html`): add a category, add questions for all slots, try a duplicate slot (expect 409 message), edit/delete a question, delete a category. Change settings to 6 categories / 20 s, add point value 1000 → coverage grid shows new empty column; fill it for 6 categories.
4. Game (`http://localhost:8000/`): try 7 players / 5 teams (blocked), pick 6 categories → board is 6 × 6 with 100…1000; open a cell → timer counts down from 20 and beeps at 0; mark one wrong (−) and one correct (+) → cell takes the correct player's color; a cell with no correct answer turns grey; refresh mid-game (state restored); finish board → results show correct winner/tie.
5. Use the built-in browser pane to click through the flow and check the console for JS errors.

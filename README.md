# BrainRush

A Jeopardy-style trivia party game. One host runs the game on a shared screen (TV or projector). Players or teams answer out loud, and the host awards or deducts points. An admin page manages the categories, questions, point values and settings.

Stack: plain HTML/CSS/vanilla JavaScript, a PHP 8 (PDO) JSON API and MariaDB 10.4. No frameworks, no build step and no external CDNs.

Project documents: `docs/spec.md`, `docs/product-backlog.md` and `docs/sprint-plan.md`. Developer and test notes for each sprint are in `docs/sprints/`.

## Setup (local)

1. **Install** PHP 8.0+ (with the `pdo_mysql` extension enabled) and MariaDB 10.4. XAMPP provides both.
2. **Create the database.** This creates `brainrush`, its tables and sample data: 6 categories with 25 questions each (5 per point value), point values 100–500, 5 categories per game and a 30-second timer.
   ```
   mysql -u root -p < sql/schema.sql
   ```
   The script is safe to re-run: it only creates missing tables and inserts missing seed rows. With phpMyAdmin, import `sql/schema.sql` from the **Import** tab.

   **Existing install (created before Sprint 6)?** Do not re-run `schema.sql`; it does not change existing tables. Back up the database first (`mysqldump -u root -p brainrush > brainrush-backup.sql`, kept outside the project folder, or phpMyAdmin **Export**), then run the question-bank migration once:
   ```
   mysql -u root -p brainrush < sql/migrate-question-bank.sql
   ```
   It removes the old one-question-per-slot limit, keeps every existing question with its category and points, and adds the 120 new questions with their points to the seed categories it finds by name (rows whose category or point value no longer exists are skipped). A database already converted by the first Sprint 6 version of this script (no `points` column) must be restored from its pre-Sprint 6 backup first. It is safe to run again: a second run changes nothing. With phpMyAdmin, select the `brainrush` database and import the file from the **Import** tab.
3. **Configure credentials.** Copy `api/config.example.php` to `api/config.php` and set your own database host, port, name, user and password.
   `api/config.php` is git-ignored, so never commit real credentials. For local use, leave the two admin keys empty (see Security below).
4. **Start the server** from the project root:
   ```
   php -S localhost:8000
   ```
   (On XAMPP: `C:\xampp\php\php.exe -S localhost:8000`.) Then open:
   - the game: `http://localhost:8000/`
   - the admin page: `http://localhost:8000/admin.html`
   - the API: `http://localhost:8000/api/` (for example `/api/settings.php`)
5. **Turn on the git hook** once per clone (only needed if you commit):
   ```
   git config core.hooksPath .githooks
   ```

### Asset file names (cache busting)

The host caches JavaScript and CSS for 7 days. To make sure browsers always get the current version, each file name contains a hash of the file's content, for example `js/game.dfec3b1c.js`. The pre-commit hook (`.githooks/pre-commit`, which runs `.githooks/hash-assets.sh`) renames every changed `js/*.js` and `css/*.css` file and updates the `<script>`/`<link>` tags in the HTML pages. Files that did not change keep their names.

- Edit the file under its current name. Don't rename it by hand and don't write the hash anywhere else.
- To add a new file, create it without a hash (`js/foo.js`), reference it under that name in the HTML, and `git add` both. The hook renames the file and updates the reference.
- The hook only sees staged content. It runs on a plain `git commit` or `git commit -a`. To rename by hand, stage your changes and run `sh .githooks/hash-assets.sh`.

## How to play

Players read the guide at `how-to-play.html`, linked as "How to play" in the game's header. Keep it in step with the rules below. The Terms of Service are at `terms.html`, linked as "Terms" in the header. Keep its "Your data" section in step whenever the game starts storing something new (game log, browser storage).

1. **Setup.** Choose **Players** (up to 6) or **Teams** (up to 4), then enter the names. Names must be unique and at most 30 characters.
   - Each entry gets its own color. Click the color circle to switch to the next free color.
   - Tick between 1 and the configured maximum number of categories (admin setting "Max categories per game"). The board columns follow the order you tick them.
   - Optionally change the timer for this game only (5–600 seconds). The admin setting is not changed.
   - Click **Start Game**.
2. **Board.** Columns are the chosen categories; rows are the point values, smallest first. Click a cell to open its question.
   - **Question bank.** A category can hold several questions for each point value. When a new game starts, the server picks one of them for every cell (category × point value), so the same group can play again with new questions. Each browser remembers the questions it has opened: the draw takes unseen questions first, and only when a cell has none left does the one seen longest ago come back. "Forget played questions" on the setup screen clears that list. Each question keeps its own point value, so a 500 question is still meant to be harder than a 100 one.
   - The scoreboard below the board shows every player or team. Use **+ / −** to correct a score; each click is one step of the smallest point value. Corrections never change cell colors.
3. **Question.** The question appears in large type (a picture question shows its picture above the text), and a countdown starts automatically.
   - The number and the bar turn red in the last third. At 0 the timer stops and shows "Time's up!" (no sound); nothing is scored automatically.
   - Use **Pause/Resume** and **Reset** as needed. **Show Answer** reveals the answer.
   - Mark each player or team **✓ Correct (+points)** or **✗ Wrong (−points)**. Each can be scored once per question, and only one can be correct. Wrong answers can still be marked after someone was correct. Marks cannot be undone inside a question; use the scoreboard **+ / −** instead.
   - **Back to Board** marks the cell as played. It takes the color and name of whoever answered correctly, or turns grey if nobody did. Played cells cannot be opened again.
4. **End Game.** Click **End Game** at any time; while questions are still open, it asks for a confirmation first. When every cell has been played, the board offers **End Game and show results**.
5. **Results.** Players or teams are listed by score, and the winner is highlighted. If several share the top score, all of them are highlighted and the text reads "It's a tie between X and Y". **New Game** clears the finished game and returns to an empty setup with the current admin settings.

**Refresh-safe.** The running game (the drawn board, played cells, scores, colors and timer length) is saved in the browser's `localStorage`. After an accidental refresh, the same screen and the same questions come back (no new draw). An open question reopens with its scoring kept, and its timer restarts at full length. The setup form itself is not saved.

## Admin usage (`admin.html`)

- **Game settings:** categories per game (1–10) and the default timer (5–600 seconds).
- **Point values:** these are the board rows, each with its number of questions. Add values such as 1000 or 10000, or delete unused ones. A value that still has questions cannot be deleted. **Disable** hides a value from the board (e.g. disable 600 and the board shows 100–500) without deleting its questions; **Enable** brings it back. At least one value must stay enabled. A database from before this feature needs `sql/migrate-disable-points.sql` first.
- **Categories:** each shows its number of questions and a status. A category is *playable*, and offered in game setup, when it has at least one question for every enabled point value; otherwise it shows "Not playable: missing 600" (the values without a question). You can add, rename inline, or delete; deleting a category also deletes its questions, after a confirmation.
- **Questions:** filter by category, then add, edit or delete. Each question has a category, a point value (any value; several questions may share a category and value), a question text and an answer. The list is sorted by category, then points. More questions per cell mean more variety between games. The same question text twice in one category is refused (not case-sensitive).
- A game already running keeps the board it drew at Start. Admin changes apply to the next game.

## Security

**Changing content needs admin rights.** This covers adding, editing or deleting categories, questions, point values and settings, both on the admin page and through any `POST`/`PUT`/`DELETE` to `api/*.php`. Two setups are supported, chosen in `api/config.php`:

- **Local (admin keys empty).** Leave `admin_user` and `admin_password_hash` empty. Changes are then allowed only from the computer running BrainRush (`localhost` / `127.0.0.1` / `::1`). Requests from any other computer get **403** "Admin changes are disabled…". A public site without an admin login therefore stays read-only. The address must also be `localhost` / `127.0.0.1` / `[::1]` with no proxy in between: a custom local host name (e.g. `brainrush.local`) or a local reverse proxy counts as remote, so set admin keys in that case.
- **Public / hosted (admin keys set).** Set `admin_user`, and set `admin_password_hash` to the output of `password_hash()` (never the plain password). Create the hash without it landing in your shell history:
  ```
  php -r "echo password_hash(trim(fgets(STDIN)), PASSWORD_DEFAULT), PHP_EOL;"
  ```
  Then type the password and press Enter (it is visible on screen while you type, so do this unobserved and clear the screen afterwards). Paste the printed `$2y$…` line in **single quotes**. The browser then asks for this login when `admin.html` opens. Wrong or missing credentials get **401** and nothing changes. A hosted site must use **HTTPS**, which the included `.htaccess` enforces.

**Do not expose the admin side publicly without admin keys and HTTPS.** Without keys, writes are refused from other computers. With keys but plain HTTP, the login would travel unencrypted.

Other rules:
- **Reading is open.** The game page and every `GET` endpoint work without a login, because the game needs them. Questions *and answers* can be read through the API by anyone who knows the URL. That is accepted for a party game (D-20), so don't put secrets in questions.
- **Credentials live only in `api/config.php`.** That file is git-ignored; `api/config.example.php` holds placeholders only. Never commit, e-mail or paste real database or admin credentials. Keep any personal notes with passwords (for example a local `password.txt`) **outside** the project folder. It is git-ignored and blocked by `.htaccess`, but it must never be uploaded or served.
- `.htaccess` (Apache/LiteSpeed) disables directory listings, passes the login header to PHP, and blocks web access to `sql/`, `docs/`, `.claude/`, `README.md`, `password.txt`, `api/config*.php` and `api/db.php`. SVG files (question pictures) are served with a strict `Content-Security-Policy` and `nosniff`, so a script inside an SVG cannot run when the file is opened directly.
- **The PHP built-in server (`php -S`) ignores `.htaccess`.** It serves every file in the project folder, including the private ones listed above. Use it only on your own computer, bound to `localhost`, and never as a public server.
- The game renders all names, categories, questions and answers as plain text (`textContent`), so HTML or script typed into them is shown literally. The API uses prepared statements only.

### Hosting hardening

- **Hide the PHP version.** Set `expose_php = Off` in `php.ini`, or in the host's PHP settings, so responses no longer carry an `X-Powered-By: PHP/x.y.z` header. On Hostinger: hPanel → **Advanced → PHP Configuration → PHP options**; switch off `expose_php` if listed, or ask support. The app works the same either way.
- Keep `display_errors = Off` on public servers. BrainRush never puts error details in API responses, but PHP's own warnings could.
- Upload `.htaccess` together with the code; it carries the HTTPS redirect and the access blocks.

**Deploying to Hostinger** (public staging site): follow [`docs/deploy-hostinger.md`](docs/deploy-hostinger.md). The database for phpMyAdmin import is `sql/schema-hosted.sql`; it is the same as `sql/schema.sql`, minus `CREATE DATABASE`/`USE`, and the two files must be kept in sync. To bring an existing hosted database from before Sprint 6 up to date, import `sql/migrate-question-bank.sql` (see the deploy guide).

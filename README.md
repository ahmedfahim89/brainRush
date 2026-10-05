# BrainRush

A Jeopardy-style trivia party game. One host runs the game on a shared screen (TV or projector). Players or teams answer out loud, and the host awards or deducts points. An admin page manages the categories, questions, point values and settings.

Stack: plain HTML/CSS/vanilla JavaScript, a PHP 8 (PDO) JSON API and MariaDB 10.4. No frameworks, no build step and no external CDNs.

Project documents: `docs/spec.md`, `docs/product-backlog.md` and `docs/sprint-plan.md`. Developer and test notes for each sprint are in `docs/sprints/`.

## Setup (local)

1. **Install** PHP 8.0+ (with the `pdo_mysql` extension enabled) and MariaDB 10.4. XAMPP provides both.
2. **Create the database.** This creates `brainrush`, its tables and sample data: 6 categories with 5 questions each, point values 100–500, 5 categories per game and a 30-second timer.
   ```
   mysql -u root -p < sql/schema.sql
   ```
   The script is safe to re-run: it only creates missing tables and inserts missing seed rows. With phpMyAdmin, import `sql/schema.sql` from the **Import** tab.
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

## How to play

1. **Setup.** Choose **Players** (up to 6) or **Teams** (up to 4), then enter the names. Names must be unique and at most 30 characters.
   - Each entry gets its own color. Click the color circle to switch to the next free color.
   - Tick exactly the number of categories the game asks for. The board columns follow the order you tick them.
   - Optionally change the timer for this game only (5–600 seconds). The admin setting is not changed.
   - Click **Start Game**.
2. **Board.** Columns are the chosen categories; rows are the point values, smallest first. Click a cell to open its question.
   - The scoreboard below the board shows every player or team. Use **+ / −** to correct a score; each click is one step of the smallest point value. Corrections never change cell colors.
3. **Question.** The question appears in large type, and a countdown starts automatically.
   - The number and the bar turn red in the last third. A beep sounds at 0 and the timer stops; nothing is scored automatically.
   - Use **Pause/Resume** and **Reset** as needed. **Show Answer** reveals the answer.
   - Mark each player or team **✓ Correct (+points)** or **✗ Wrong (−points)**. Each can be scored once per question, and only one can be correct. Wrong answers can still be marked after someone was correct. Marks cannot be undone inside a question; use the scoreboard **+ / −** instead.
   - **Back to Board** marks the cell as played. It takes the color and name of whoever answered correctly, or turns grey if nobody did. Played cells cannot be opened again.
4. **End Game.** Click **End Game** at any time; while questions are still open, it asks for a confirmation first. When every cell has been played, the board offers **End Game and show results**.
5. **Results.** Players or teams are listed by score, and the winner is highlighted. If several share the top score, all of them are highlighted and the text reads "It's a tie between X and Y". **New Game** clears the finished game and returns to an empty setup with the current admin settings.

**Refresh-safe.** The running game (board, played cells, scores, colors and timer length) is saved in the browser's `localStorage`. After an accidental refresh, the same screen comes back. An open question reopens with its scoring kept, and its timer restarts at full length. The setup form itself is not saved.

The browser only allows sound after you have clicked or pressed a key on the page. If the page was just refreshed during a question and nobody has clicked yet, that countdown ends silently.

## Admin usage (`admin.html`)

- **Game settings:** categories per game (1–10) and the default timer (5–600 seconds).
- **Point values:** these are the board rows. Add values such as 1000 or 10000, or delete unused ones. A value that still has questions cannot be deleted.
- **Categories:** each shows "questions / point values". You can add, rename inline, or delete; deleting a category also deletes its questions, after a confirmation.
- **Questions:** filter by category, then add, edit or delete. A category has exactly one question per point value; the points list only offers free slots.
- **Coverage grid:** categories × point values. A category is *playable*, and offered in game setup, only when every slot is filled. After adding a new point value, fill it for enough categories.
- A game already running keeps the board it loaded at Start. Admin changes apply to the next game.

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
- `.htaccess` (Apache/LiteSpeed) disables directory listings, passes the login header to PHP, and blocks web access to `sql/`, `docs/`, `.claude/`, `README.md`, `password.txt`, `api/config*.php` and `api/db.php`.
- **The PHP built-in server (`php -S`) ignores `.htaccess`.** It serves every file in the project folder, including the private ones listed above. Use it only on your own computer, bound to `localhost`, and never as a public server.
- The game renders all names, categories, questions and answers as plain text (`textContent`), so HTML or script typed into them is shown literally. The API uses prepared statements only.

### Hosting hardening

- **Hide the PHP version.** Set `expose_php = Off` in `php.ini`, or in the host's PHP settings, so responses no longer carry an `X-Powered-By: PHP/x.y.z` header. On Hostinger: hPanel → **Advanced → PHP Configuration → PHP options**; switch off `expose_php` if listed, or ask support. The app works the same either way.
- Keep `display_errors = Off` on public servers. BrainRush never puts error details in API responses, but PHP's own warnings could.
- Upload `.htaccess` together with the code; it carries the HTTPS redirect and the access blocks.

**Deploying to Hostinger** (public staging site): follow [`docs/deploy-hostinger.md`](docs/deploy-hostinger.md). The database for phpMyAdmin import is `sql/schema-hosted.sql`; it is the same as `sql/schema.sql`, minus `CREATE DATABASE`/`USE`, and the two files must be kept in sync.

# BrainRush

Jeopardy-style trivia party game (HTML/CSS/JS + PHP + MariaDB).

See `docs/spec.md`, `docs/product-backlog.md` and `docs/sprint-plan.md`. Game and admin pages arrive in later sprints; full usage instructions will be completed in Sprint 4.

## Setup

1. **Install** PHP 8 (with the `pdo_mysql` extension enabled) and MariaDB 10.4 (e.g. XAMPP).
2. **Create the database** (creates `brainrush`, its tables and sample data — 6 categories x 5 questions):
   ```
   mysql -u root -p < sql/schema.sql
   ```
   The script is safe to re-run: it only creates missing tables and inserts missing seed rows.
3. **Configure credentials**: copy `api/config.example.php` to `api/config.php` and set your own database host, user and password.
   `api/config.php` is git-ignored — never commit real credentials. For local use you can leave the two admin keys empty (see Security below).
4. **Start the server** from the project root:
   ```
   php -S localhost:8000
   ```
   Then open `http://localhost:8000/`. API endpoints live under `http://localhost:8000/api/` (e.g. `/api/settings.php`).

## Security

**Changing content needs admin rights.** This covers adding, editing or deleting categories, questions, point values and settings, both on the admin page and through any `POST`/`PUT`/`DELETE` to `api/*.php`. Two setups are supported, chosen in `api/config.php`:

- **Local (admin keys empty).** Leave `admin_user` and `admin_password_hash` empty. Changes are then allowed only from the computer running BrainRush (`localhost` / `127.0.0.1` / `::1`). Requests from any other computer get **403** "Admin changes are disabled…". A public site without an admin login therefore stays read-only. The address must also be `localhost` / `127.0.0.1` / `[::1]` with no proxy in between: a custom local host name (e.g. `brainrush.local`) or a local reverse proxy counts as remote, so set admin keys in that case.
- **Public / hosted (admin keys set).** Set `admin_user`, and set `admin_password_hash` to the output of `password_hash()` (never the plain password). Create the hash without it landing in your shell history:
  ```
  php -r "echo password_hash(trim(fgets(STDIN)), PASSWORD_DEFAULT), PHP_EOL;"
  ```
  Then type the password and press Enter (it is visible on screen while you type, so do this unobserved and clear the screen afterwards). Paste the printed `$2y$…` line in **single quotes**. The browser then asks for this login when `admin.html` opens. Wrong or missing credentials get **401** and nothing changes. A hosted site must use **HTTPS**, which the included `.htaccess` enforces.

Other rules:
- **Reading is open.** The game page and every `GET` endpoint work without a login, because the game needs them. Questions *and answers* can be read through the API by anyone who knows the URL. That is accepted for a party game (D-20), so don't put secrets in questions.
- **Credentials live only in `api/config.php`.** That file is git-ignored; `api/config.example.php` holds placeholders only. Never commit, e-mail or paste real database or admin credentials.
- `.htaccess` (Apache/LiteSpeed) disables directory listings, passes the login header to PHP, and blocks web access to `sql/`, `docs/`, `.claude/`, `README.md`, `api/config*.php` and `api/db.php`. The PHP built-in server (`php -S`) ignores `.htaccess`, so use it only locally.

**Deploying to Hostinger** (public staging site): follow [`docs/deploy-hostinger.md`](docs/deploy-hostinger.md). The database for phpMyAdmin import is `sql/schema-hosted.sql`; it is the same as `sql/schema.sql`, minus `CREATE DATABASE`/`USE`, and the two files must be kept in sync.

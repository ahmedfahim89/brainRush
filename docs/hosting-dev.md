# Hosting — Developer notes

Work done outside the sprint plan (not a sprint; Sprint 3 is untouched).

## US-29 — Hosted deployment

Story: US-29 "Hosted deployment with protected admin". Decisions D-17 (amended) and D-20. Target: Hostinger shared hosting (LiteSpeed or Apache, PHP 8.x, managed MariaDB, HTTPS).

### Files created / changed

| File | Status | Purpose |
|---|---|---|
| `api/db.php` | changed | Adds `app_config()`, which loads `api/config.php` once and is now shared by `db()` and the auth code. Adds `require_admin()`, `admin_denial()`, `request_basic_credentials()` and `is_local_request()` (see Rules below). |
| `api/categories.php`, `api/questions.php`, `api/points.php`, `api/settings.php` | changed | `require_admin()` is the first call in every `POST`/`PUT`/`DELETE` branch, before reading the body or touching the database. `GET` is unchanged. |
| `api/auth.php` | new | `GET` → `200 {ok:true}` when the caller may write (same rules), else 401/403. Any other method → 405. |
| `api/config.example.php` | changed | Adds `admin_user` and `admin_password_hash` (both empty, meaning local-only) and explains how to generate the hash without shell history. |
| `.htaccess` | new | Disables directory listings. Passes `Authorization` through (`CGIPassAuth` plus a `RewriteRule E=HTTP_AUTHORIZATION` fallback). Redirects to HTTPS with a 301 except on localhost / 127.0.0.1 / [::1]. Blocks `sql/`, `docs/`, `.claude/`, `.git*`, `README.md`, `api/config*.php` and `api/db.php` with 403. A `FilesMatch` fallback works without `mod_rewrite`. |
| `sql/schema-hosted.sql` | new | Same tables and seed as `schema.sql`, without `CREATE DATABASE`/`USE`, for phpMyAdmin import. Has a "keep in sync" header. |
| `sql/schema.sql` | changed | "Keep in sync" header comment only. |
| `admin.html`, `js/admin.js`, `css/style.css` | changed | Login notice (`#auth-banner`) with a "Log in" / "Check again" button, `checkAuth()` on load, 401/403 handling in `runAction()`, readable fallback text for 401/403 responses without JSON. |
| `docs/deploy-hostinger.md` | new | Step-by-step deployment and redeploy guide for non-experts. |
| `README.md` | changed | "Security warning" replaced by a "Security" section with the new rules and a link to the guide. |
| `docs/hosting-dev.md` | new | This note. |

### Rules implemented (`require_admin()`)

1. **Admin keys configured** (`admin_user` or `admin_password_hash` non-empty):
   - Credentials come from `PHP_AUTH_USER`/`PHP_AUTH_PW`. If those are absent, the code parses `Basic …` from `HTTP_AUTHORIZATION` or `REDIRECT_HTTP_AUTHORIZATION` (strict base64, split at the first `:` so passwords may contain colons).
   - The user is checked with `hash_equals`, the password with `password_verify`. Both always run, so timing does not reveal a valid user name.
   - Missing credentials → 401 "Login required to change content." Wrong credentials → 401 "Login failed: wrong user name or password." Both come with `WWW-Authenticate: Basic realm="BrainRush admin", charset="UTF-8"`.
   - The client IP plays no part in this mode.
2. **Half-configured or a non-hash value** (for example a plain password pasted as the "hash"): 500 with a human message pointing at the two keys, plus a server log line. The log line contains no values. This fails closed instead of silently returning 401 forever.
3. **Not configured** (both empty, or `config.php` missing): writes are allowed only for a local request, otherwise 403 "Admin changes are disabled: configure admin credentials in api/config.php (see docs/deploy-hostinger.md)."
4. Credentials are never logged or echoed. `auth.php` returns only `{ok:true}`.

### Admin page behaviour

- On load, `checkAuth()` calls `GET api/auth.php` alongside the data loads. On a protected site the 401 challenge makes the browser show its login prompt straight away. After a successful login the browser re-sends the credentials with every later `api/` request.
- If the prompt is cancelled or fails (401), or writes are disabled (403), a yellow notice explains it. The tables and coverage grid still load, so the page stays usable read-only. The notice's button retries the check, which brings the prompt back on a 401.
- Every later write that gets 401/403 shows the server's message inline in its panel, as before, and updates the notice. A successful write hides the notice.

### How to test

Local (no admin keys):
1. `C:/xampp/php/php.exe -S localhost:8000` from the project root, then open `http://localhost:8000/admin.html`. No prompt appears and saving works as before.
2. `curl -i http://localhost:8000/api/auth.php` → `200 {"ok":true}`.

Protected mode:
1. Generate a hash (see `api/config.example.php`) and set both admin keys in your local `api/config.php`.
2. `curl -i -X PUT -H "Content-Type: application/json" -d "{\"timer_seconds\":30}" http://localhost:8000/api/settings.php` → 401 with `WWW-Authenticate`.
3. Run the same with `-u <user>` (curl prompts for the password) → 200.
4. Open `admin.html`: the browser asks for the login. Cancel shows the notice, and saving shows "Login required to change content." inline.

Hosted: follow the checklist in `docs/deploy-hostinger.md` §7.

### Verification performed

- **`php -l`** passes on every PHP file (`auth`, `categories`, `config.example`, `db`, `points`, `questions`, `settings`; `config.php` was syntax-checked without being displayed).
- **Unconfigured, loopback** (real project, `php -S localhost:8002`):
  - `auth.php` → 200; all GETs → 200.
  - Category POST/PUT/DELETE → 201/200/200; settings PUT → 200; `auth.php` POST → 405.
  - Loopback with an `X-Forwarded-For` header or a non-local `Host` → 403.
- **Configured and remote cases** were run against a throwaway harness in the temp folder (`php -S localhost:8003`, deleted afterwards). It held copies of `api/*.php`, a test-only `config.php` that `require`d the real one (values never printed) and merged in test admin keys, and a router that could fake `REMOTE_ADDR` and simulate CGI header passing. Production code has no test hooks. Results:
  - **No or wrong credentials:** all 9 write routes → 401 with the challenge header; wrong user and wrong password → 401; data unchanged.
  - **Correct credentials, from a fake remote IP:** create/rename/delete category, create/move/delete question, add/delete point value and settings PUT all work. 400, 409 and 415 still surface.
  - **CGI simulation (no `PHP_AUTH_*`):** the header only in `HTTP_AUTHORIZATION` or `REDIRECT_HTTP_AUTHORIZATION` → 200. Lower-case `basic` works. Bad base64, `Bearer` or no header → 401.
  - **Not configured, remote** (203.0.113.5, 127.0.0.2, or remote with a spoofed `X-Forwarded-For: 127.0.0.1`) → 403, with or without credentials. `::1` and `127.0.0.1` → 200.
  - **Plain-text "hash" or only a user set** → 500 with the hint. The log has no secrets.
- **`.htaccess` on a real Apache 2.4.58** (a temporary separate XAMPP `httpd` instance on 127.0.0.1:8004 with `AllowOverride All`, `Options Indexes` and mod_php, serving a temp copy of the site; the running XAMPP Apache was not touched):
  - Served normally: `/`, `index.html`, `admin.html`, CSS, JS, `api/settings.php`.
  - 403: `sql/*`, `docs/*`, `.claude/*`, `README.md`, `.gitignore`, `.htaccess`, `api/config.php`, `api/config.example.php`, `api/db.php`, path tricks (`//`, `/./`, `/x/../`), and directory listings (`/css/`, `/api/`).
  - HTTPS redirect: a non-local `Host` → 301 to `https://<host><uri>` (query kept). `X-Forwarded-Proto: https` skips the redirect. `localhost`, `[::1]` and `LOCALHOST` are not redirected; `localhost.evil.test` is.
  - The `Authorization` header reaches PHP (`HTTP_AUTHORIZATION` set via the rewrite rule), and Basic Auth gives 401 / 200 as above.
  - **Without `mod_rewrite` and `mod_version`:** no 500 errors. The `FilesMatch` fallback still blocks config, `db.php`, `.md`, `.sql` and `.git*` files.
- **Admin UI, headless Chrome:** a test-only harness page drove `admin.html` in an iframe. The router removed the challenge header to simulate a cancelled prompt, because headless Chrome cannot answer one.
  - **Configured, no login:** the notice reads "Login required…" with a "Log in" button, the data tables render (6 categories), and a settings save or category add shows "Login required to change content." inline.
  - **Not configured, remote:** the notice shows the 403 message with "Check again", and saves show it inline.
  - **Loopback:** no notice, "Settings saved.", category added.
- **`schema-hosted.sql`:** imported through mysqli into a temporary database whose default collation differs (`utf8mb4_general_ci`) on the local MariaDB 10.4.32. It ran twice without errors; the second run only gave the expected `INSERT IGNORE` duplicate warnings. `SHOW CREATE TABLE` was identical to the real DB for all 4 tables, the seed data was identical (6 categories, 30 questions), and the temp DB was dropped. Both files' bodies are byte-identical below their headers.
- **Cleanup:** all test rows were deleted and the DB is back to seed state (settings 5/30, points 100–500, 6 × 5 questions). Auto-increment counters have advanced, which is harmless. The temp harnesses, the test Apache config and the scripts were deleted, and the test servers (ports 8002, 8003, 8004) were stopped.
  - One leftover: the first headless Chrome run (before the challenge header was removed) got stuck waiting for a login prompt that headless mode cannot show. Its processes, with profile `%TEMP%\brainrush-chrome-prof`, were **not** killed because of the "do not kill browser processes" instruction. They are harmless and can be ended in Task Manager; then delete that folder.

### MariaDB compatibility (D-17 amendment)

- `utf8mb4_unicode_520_ci` exists in MariaDB 10.4, 10.6, 10.11 and 11.x. Newer servers may use a different *default* collation (e.g. `uca1400` in 11.x), but every table sets its collation explicitly, so the database default does not matter. This was tested with a differing default.
- The upsert in `settings.php` (`INSERT … ON DUPLICATE KEY UPDATE value = VALUES(value)`) is supported on all MariaDB versions. MariaDB has not deprecated `VALUES()` in this context; only MySQL 8.0.20+ did, and MySQL is no longer a target.
- The schema uses only `CREATE TABLE IF NOT EXISTS`, `INSERT IGNORE` and `SET @var = (SELECT …)`. phpMyAdmin imports run in one session, so the user variables work.
- Only MariaDB 10.4 was available locally. Newer versions were reviewed statically.

### Deviations from the requested design

1. **The loopback rule is stricter.** A write counts as local only if `REMOTE_ADDR` is loopback **and** the `Host` header is `localhost`/`127.0.0.1`/`[::1]` **and** no `X-Forwarded-For`/`X-Real-IP`/`Forwarded` header is present.
   Reason: behind a local reverse proxy (nginx → Apache, some shared hosts, containers) every visitor arrives as 127.0.0.1. With the plain rule, an unconfigured public site would be open to everyone. Forwarding headers are never used to *grant* access.
   Effect: local access via a custom host name (e.g. a `brainrush.local` vhost) needs admin keys.
2. **Half-configured admin keys or a non-hash value return 500** with a hint, rather than 401. A plain password pasted as the "hash" would otherwise lock the admin out with a misleading prompt.
3. **The example config ships with empty admin keys** rather than fake placeholder strings, so a copied example behaves as "local only" instead of "always 401". The comment shows example values and the hash command.
4. **Hash command with double quotes** (`php -r "echo password_hash(trim(fgets(STDIN)), PASSWORD_DEFAULT), PHP_EOL;"`). It contains no `$`, so it works the same in bash, cmd.exe and PowerShell; the single-quoted form fails in cmd.exe.
5. **`.htaccess` also blocks `.htaccess` and `api/db.php`**, and adds a `FilesMatch` fallback (`config*.php`, `db.php`, `*.md`, `*.sql`, `.git*`, `.ht*` in any folder) for servers without `mod_rewrite`.

### Known limitations

- **No rate limiting or lockout** for login attempts. bcrypt makes each guess slow (~50–100 ms), and HTTPS protects the credentials in transit. Use a long, unique password.
- **Basic Auth has no logout.** Credentials stay cached until the browser is closed. Use a private window on shared computers.
- **CSRF:** the browser re-sends cached Basic credentials. A cross-site form post (`text/plain`) passes `require_admin()` but is rejected by `read_json_body()` (415) before any change. JSON, PUT and DELETE requests need a CORS preflight, which the API never grants.
- **Without `mod_rewrite`** (not the case on Hostinger) there is no HTTPS redirect, and non-`.md`/`.sql` files under `.claude/` (e.g. a stray `settings.local.json` uploaded by FTP) would be readable. That file is git-ignored, so Git deployment never ships it, and the guide says not to upload `.claude/`.
- **Answers readable via GET** remains accepted (D-20).
- **Not tested on LiteSpeed or Hostinger itself** (not available here). The directives used (`RewriteRule [E=…]`, `[F]`, `[R=301]`, `FilesMatch`, `Options -Indexes`) are the standard ones LiteSpeed supports. The first live deployment must run the checklist in `docs/deploy-hostinger.md` §7.
- **Tested on PHP 8.0.30 only.** Newer 8.x versions on Hostinger were reviewed but not run.
- `docs/sprint-plan.md` was not updated (Scrum Master's job).

### Manual steps for the owner

- Create the Hostinger database, run the phpMyAdmin import, upload or Git-deploy the files, create `api/config.php` on the server with the DB settings, `admin_user` and the hash, and enable SSL, all as described in `docs/deploy-hostinger.md`. Then run the §7 checklist.
- Optional locally: add admin keys to your own `api/config.php` to try protected mode. Leave them empty to keep the old local behaviour.

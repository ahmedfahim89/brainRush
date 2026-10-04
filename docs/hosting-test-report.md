# Hosting (US-29) — Test Report

Tester: Senior Tester (game-tester). Date: 2026-10-04. Story: US-29 "Hosted deployment with protected admin" (decisions D-17 amended, D-20). Branch `hosting`. This is not a sprint; Sprint 3 is untouched.

## Summary

**Environment:** Windows 11, Git Bash, XAMPP, PHP 8.0.30 CLI, MariaDB 10.4.
- Branch `hosting` (changes uncommitted in the working tree).
- Unconfigured runs used my own server `C:/xampp/php/php.exe -S localhost:8001` from the project root. The server on port 8000 belongs to someone else and was never touched.
- A second server, `php -S 192.168.1.56:8005`, was bound to this machine's LAN address. Requests to it arrive with a genuine non-loopback `REMOTE_ADDR`. It served the real project, was unconfigured (so writes fail closed) and was stopped afterwards.
- Configured runs used a throwaway harness in the temp folder:
  - copies of `api/*.php`;
  - a test-only `config.php` that `require`s the real one (never opened or printed) and overrides `admin_user` and `admin_password_hash` with a generated throwaway login;
  - a router to simulate a CGI setup (no `PHP_AUTH_*`) and a cancelled login prompt (challenge header removed).
  - Ports 8003 and 8006. The harness, the generated password and the servers were deleted or stopped afterwards.
- UI driven in the Browser pane on `http://localhost:8001/admin.html`, `http://192.168.1.56:8005/admin.html` and the harness. The viewport was narrow (about 366 px) and mobile layout is out of scope (D-19). `window.confirm` was replaced by a recorder, because a native dialog blocks the tool.
- Not tested, by instruction or by lack of an environment: Hostinger/LiteSpeed, a real Apache with `.htaccess`, the native browser Basic Auth prompt, phpMyAdmin import. These are **PENDING (live deploy)**.

| Result | Count |
|---|---|
| PASS | 24 |
| FAIL | 0 |
| PENDING | 6 (all need the live deploy or a real Apache) |

Bugs: 0 Critical, 0 Major, 1 Minor (documentation gap, BUG-29-01). Four observations (O-1 to O-4) for the PO. No application code was modified. The DB was restored to seed state (see Cleanup).

## Static checks performed

- `php -l` (PHP 8.0.30) on `api/auth.php`, `categories.php`, `questions.php`, `points.php`, `settings.php`, `db.php`, `config.example.php`: no syntax errors. `api/config.php` was syntax-checked only (output is just "No syntax errors"); I did not read it.
- Write paths: `grep` for `case 'POST'|'PUT'|'DELETE'` against `require_admin` shows **every** write branch calls `require_admin()` as its first statement, before `read_json_body()`, `require_query_id()` or `db()`.

  | File | Write branches, each starting with `require_admin()` |
  |---|---|
  | `categories.php` | POST, PUT, DELETE |
  | `questions.php` | POST, PUT, DELETE |
  | `points.php` | POST, DELETE |
  | `settings.php` | PUT |

  `auth.php` is GET-only. Any other method gives 405 without auth. The runtime tests below confirm that unauthorised requests get 401/403 even with a wrong Content-Type or an invalid id, so the check really runs before body validation.
- Credential handling (`api/db.php:197-260`): the user name is compared with `hash_equals`, the password with `password_verify`. Both always run. Nothing is echoed. The only `error_log` lines are a fixed text with no values. `auth.php` returns only `{ok:true}`. The server log of the harness run (including a run with a plain-text "hash" in the config) contained no password or hash.
- Credentials and hostnames in the repo: a grep of the working tree and `git grep` (excluding `api/config.php`) for bcrypt hashes (`$2y$…`), `mysql:` DSNs, Hostinger hostnames and `u<digits>_` names found only the placeholders in `docs/deploy-hostinger.md` (`u123456789_…`, `YOUR_DB_PASSWORD`, `quizmaster`) and the empty keys in `api/config.example.php`.
- `git check-ignore -v api/config.php` shows `.gitignore:1`. `git ls-files` does not list `api/config.php`, only `api/config.example.php`.
- `innerHTML`, `outerHTML`, `insertAdjacentHTML` and `document.write` in `js/`, `admin.html` and `index.html`: no code hits. The only match is the comment on line 2 of `js/admin.js`.
- String-concatenated SQL: none. Interpolated fragments are constants (`$having`) or `?` placeholders built from a count. All values go through prepared statements.
- Hard-coded board sizes: none in this change.
- `sql/schema-hosted.sql` against `sql/schema.sql`:
  - `grep -i "create database|^use "` on `schema-hosted.sql` matches only the sentence in its header comment, no statements.
  - From `-- Key/value game settings` (line 16 / 14) to the end, the two files are identical (`diff` after normalising line endings). The only differences are the header comments, the `CREATE DATABASE`/`USE` lines and line endings (CRLF in the working tree from `core.autocrlf=true`, LF in the index). The dev note's "byte-identical" holds once committed.
- `.htaccess` review: see row 19 and O-3.

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Configured: POST/PUT/DELETE without credentials or with a wrong user or password gives 401 + `WWW-Authenticate: Basic` + JSON `error`, nothing changed | PASS | All 9 write routes (categories POST/PUT/DELETE, questions POST/PUT/DELETE, points POST/DELETE, settings PUT) were tested three ways: no credentials, correct user with a wrong password, wrong user with the correct password. 27 requests, all 401. Header: `WWW-Authenticate: Basic realm="BrainRush admin", charset="UTF-8"`. Bodies: "Login required to change content." and "Login failed: wrong user name or password." Fingerprint of settings, points, categories and questions (GETs) was identical before and after. The delete/put requests targeted real seed ids, and none of them was applied. |
| 2 | Configured: correct credentials behave as before (200/201/400/409/…) | PASS | Category POST 201, PUT 200, DELETE 200; point POST 201, DELETE 200; question POST 201, DELETE 200; settings PUT 200. Also 400 (empty name, bad id), 409 (duplicate category, occupied slot), 404 (unknown category) and 415 (wrong content type). Successful writes also worked with `X-Forwarded-For` and a non-local `Host` (the client address plays no part when credentials are set). |
| 3a | Not configured: write from loopback succeeds as before | PASS | On `localhost:8001` (`::1`): category POST 201 / PUT 200 / DELETE 200, question POST 201 / DELETE 200, point POST 201 / DELETE 200, settings PUT 200; also 400 (empty name), 409 (duplicate name, duplicate point), 404 (unknown id). The admin UI works as well (row 20). |
| 3b | Not configured: write from any other address gives 403 with a human message, nothing changed | PASS | **Genuine non-loopback address:** server bound to the LAN IP: PUT settings and POST category gave 403, and the data was unchanged. **Header variants on loopback:** all 9 write routes gave 403 for each of `X-Forwarded-For`, `X-Real-IP`, `Forwarded` and a non-local `Host` (`brainrush.example.test`). `Host: localhost.evil.test` also gave 403. Message: "Admin changes are disabled: configure admin credentials in api/config.php (see docs/deploy-hostinger.md)." The check runs before body validation (a `text/plain` POST gave 403, not 415). `127.0.0.1` and `[::1]` hosts: writes allowed (200 on `[::1]`; `127.0.0.1:8001` does not connect, because `php -S localhost` binds `::1` only on this PC; not an app issue). `auth.php` gave 403 for a non-local request. |
| 4 | Any configuration: GET endpoints work without credentials | PASS | settings, points, categories, `categories?playable=1`, questions, `questions?board=1&categories=1,2[,3]` all return 200 unconfigured (with and without a non-local Host or `X-Forwarded-For`), and 200 configured without credentials. **Note:** the game page (`index.html`) is still the "board coming soon" placeholder (Sprint 3), so "game fully playable" cannot be exercised yet. The endpoints the game will use are verified. |
| 5a | Protected deployment: `admin.html` makes the browser prompt for login on load | PENDING (live deploy) | `js/admin.js` calls `GET api/auth.php` on load (confirmed in the network log: `auth.php`, `settings`, `points`, `categories`, `questions`). Against the configured harness, `auth.php` returns 401 + the Basic challenge, so a real browser would prompt. The native prompt cannot be driven with the available tools and was not shown. Check on the live site (guide §7). |
| 5b | Login cancelled or failed: inline message, never raw JSON or a blank page | PASS | Harness with the challenge header removed (simulates Cancel): the page loads with the yellow notice "Login required to change content. … Click "Log in" … to enter the admin user name and password." with a "Log in" button. The tables still render (42 rows) and no `{"error"` text is in the page. Clicking **Save settings** adds the inline red message "Login required to change content." in the Settings panel. Real 403 (LAN host, unconfigured): the notice shows the 403 text with "Check again", and Save shows it inline. Settings and categories stay readable. |
| 6 | Credentials only in git-ignored `api/config.php` as user + `password_hash()` output; example shows placeholder keys and how to generate the hash | PASS | See static checks. `config.example.php` has `admin_user` / `admin_password_hash` (empty) and a comment with the hash command and the single-quote warning. No plain-text password anywhere. The repo has no hash either. Authentication only accepts a bcrypt hash: a plain-text value gives 500 (row 18). |
| 7 | Non-localhost host over HTTP: `.htaccess` redirects (301) to HTTPS, localhost unaffected | PENDING (live deploy) | Static review of the rules (`RewriteCond %{HTTPS} !=on`, `X-Forwarded-Proto !=https`, host not `localhost|127.0.0.1|[::1]`, `[R=301,L]`) looks correct and is wrapped in `<IfModule mod_rewrite.c>`. The developer's temp Apache 2.4.58 run was **not** re-run by me, and `php -S` ignores `.htaccess`. Verify on Hostinger (guide §7). |
| 8a | Hosted site: the `Authorization` header reaches PHP | PENDING (live deploy) | The PHP side is verified (row 16). `.htaccess` has `CGIPassAuth On` plus the `E=HTTP_AUTHORIZATION` rewrite fallback. Whether LiteSpeed on Hostinger passes it needs the live check (`curl -u … api/auth.php`, guide §7). |
| 8b | Directory listing off, and `sql/`, `docs/`, `.claude/`, `README.md`, `api/config*.php` return 403/404 | PENDING (live deploy) | Static review: `Options -Indexes`; rewrite rules `^(sql|docs|\.claude)(/|$)`, `^\.git`, `^README\.md$`, `^api/(config[^/]*|db)\.php$` all `[F]`; plus a `FilesMatch` fallback (`config*.php`, `db.php`, `*.md`, `*.sql`, `.git*`, `.ht*`) for servers without `mod_rewrite`. Not executed by me. |
| 9a | `sql/schema-hosted.sql`: no `CREATE DATABASE` / `USE`, same tables, keys and seed as `schema.sql` | PASS | Statements absent (only the header sentence mentions them). Bodies are identical (4 tables, `uq_*` keys, FKs, 5 point values, 6 categories, 30 questions, settings 5/30). The "keep in sync" header is in both files. |
| 9b | Import of `schema-hosted.sql` into an empty hosted DB through phpMyAdmin succeeds | PENDING (live deploy) | I did not import it (no DB-admin credentials are available to me, and I did not read `api/config.php`). The developer reports a clean import into a temp DB on MariaDB 10.4 with a different default collation, run twice. Verify in phpMyAdmin on Hostinger. |
| 10 | `docs/deploy-hostinger.md` covers DB + user in hPanel, phpMyAdmin import, upload (and exclusions), `config.php` with DB settings + admin hash, HTTPS/SSL, smoke test, redeploy without overwriting config or data | PASS | All parts are present and in a sensible order (see "Deploy guide review" below). Placeholders only. The hash command keeps the password out of the command line and shell history (row 22). Two small clarity notes in O-2 and BUG-29-01. |
| 11 | The guide's menu names, option names and limits match the real hPanel (PHP Configuration, Security → SSL, Git deployment into an empty folder, `localhost` DB host, file permission 600/644 advice) | PENDING (live deploy) | Cannot be checked offline. Names may differ by plan. Walk through the guide once on the real account. |
| 12 | `php -l` on all PHP files | PASS | 8 files (incl. `config.php`), no syntax errors. |
| 13 | Every write path calls `require_admin()` before any DB work | PASS | See static checks, plus the runtime proof in rows 1 and 3b: no write reached the DB without authorisation, and the 403/401 came before 400/415/404. |
| 14 | Credentials compared safely and never logged or echoed | PASS | `hash_equals` + `password_verify`, both always evaluated. A grep of the harness server log for the test password and for the plain-text "hash" value returned 0 matches. The only log line is the fixed misconfiguration text. |
| 15 | No credentials or hostnames committed; `api/config.php` still git-ignored | PASS | See static checks. |
| 16 | `Authorization` header parsing for CGI/FastCGI setups (`HTTP_AUTHORIZATION`, `REDIRECT_HTTP_AUTHORIZATION`) | PASS | Router simulation with `PHP_AUTH_*` removed: correct credentials 200; wrong password 401 "Login failed"; no header 401; `Bearer` 401; invalid base64 401; lower-case `basic` 200. Control run with `PHP_AUTH_*` **and** `HTTP_AUTHORIZATION` both removed: correct credentials gave 401, so the earlier 200s really came from the fallback. Edge cases: `user:` with an empty password 401 "Login failed", `:` 401, no colon 401. |
| 17 | `api/auth.php` behaviour | PASS | Unconfigured loopback: 200 `{"ok":true}`; non-local: 403. Configured: no credentials 401 + challenge, correct 200. `POST` gives 405 with `Allow: GET`. |
| 18 | Misconfiguration fails closed with a human message and no values logged | PASS | Plain-text value as the hash, only `admin_user` set, only the hash set: each 500 "Admin login is not set up correctly on the server: check admin_user and admin_password_hash in api/config.php." No write was applied. |
| 19 | `.htaccess` rules are sensible and wrapped so they cannot 500 on a missing module | PASS | (static) Module-specific directives sit in `<IfModule>` (`mod_version`, `mod_rewrite`, `mod_authz_core` with a 2.2 fallback). The redirect never fires for localhost, and a forwarded-proto header only skips it. See O-3 for the `AllowOverride` caveat. |
| 20 | Admin UI, unconfigured and local: no prompt, no console errors, Sprint 2 flows still work | PASS | `localhost:8001/admin.html`: no notice (`#auth-banner` hidden), 0 console messages. Settings save: "Settings saved." Add category `<img src=x onerror=alert(1)> QA`: added and shown as text (0 `img` elements). Rename: "Category renamed to "QA Test Cat"." Add question (QA Test Cat, 100): "Question added…". Delete category: confirm text "Delete category "QA Test Cat"? Its 1 question will also be deleted. This cannot be undone." and then "deleted". |
| 21 | README describes the new security model accurately | PASS | The Security section matches the behaviour (local vs hosted modes, hash command, open GETs, `.htaccess` blocks, link to the guide). One gap: BUG-29-01. |
| 22 | Hash command does not leak the password into shell history | PASS | `php -r "echo password_hash(trim(fgets(STDIN)), PASSWORD_DEFAULT), PHP_EOL;"` takes the password from stdin, so the command line contains no secret. I ran it with piped input (output starts `$2y$10$`). It has no `$` in the double-quoted string, so it is the same in bash, cmd.exe and PowerShell. See O-2 for the on-screen echo. |
| 23 | Existing GET behaviour and Sprint 2 API behaviour unchanged | PASS | 400/404/409/415 messages the same as the Sprint 2 report; `?playable=1` and `?board=1` return 200; 30 questions at the end. |
| 24 | Server stops and cleanup | PASS | See Cleanup. |
| 25 | Redeploy steps do not overwrite `api/config.php` or live data | PASS | Guide §8: merge to `main`, export a backup, Git "Deploy" or upload changed files (never `config.php`, never the whole `api/`), re-import the schema only if the dev note says so (with the warning about re-added sample rows), Ctrl+F5, quick re-check. |
| 26 | DB restored to seed state | PASS | Settings 5/30, points 100–500, 6 categories x 5 questions, 30 questions, none with a "QA" name. |

(Rows 12–26 are the extra checks requested in the task. The 30 result rows (1, 2, 3a, 3b, 4, 5a, 5b, 6, 7, 8a, 8b, 9a, 9b, 10, 11, 12–26) give PASS 24, FAIL 0, PENDING 6 (rows 5a, 7, 8a, 8b, 9b, 11).)

## Deploy guide review (docs/deploy-hostinger.md)

- Order is sound: PHP version and SSL, DB and user, phpMyAdmin import, upload (Git or File Manager/FTP), `config.php`, optional Force HTTPS/CDN, checklist, redeploy, troubleshooting.
- PHP 8.0 or newer is stated, with a fallback to 8.0. `pdo_mysql` is called out. The guide says to use `schema-hosted.sql` and not `schema.sql`.
- The upload table lists what to upload and what not to (`sql/`, `docs/`, `.claude/`, `.git/`, `README.md`, the local `api/config.php`), and notes that the hidden `.htaccess` must be included. It explains that a Git deploy ships `docs/` etc. and that `.htaccess` blocks them.
- The `config.php` template has placeholders only, with the single-quote warning for the `$2y$` hash. The behaviour with empty admin keys is explained.
- The checklist covers: game and HTTPS, login prompt, cancel notice, log in, save, wrong password, blocked paths (`sql/`, `api/config*.php`, `api/db.php`, `docs/`, `README.md`, `.claude/`, `/css/` listing) and two `curl` checks without a password in history. It matches `.htaccess` and the real API messages ("Login required to change content.", `{"ok":true}`).
- The troubleshooting table maps each real server message (401 loop, 403 disabled, 500 admin setup, "Server is not configured", "Internal server error") to a cause and a fix.
- Not verifiable offline: hPanel labels and the "Git deploys only into an empty folder" statement (row 11).

## Bugs

### BUG-29-01 — Minor — Local-only rule is stricter than documented
- **Where:** `api/db.php:268-282` (`is_local_request()`); `README.md` Security section; `docs/deploy-hostinger.md`.
- **Steps:** Unconfigured admin keys. Open the site through a local virtual host name (for example `http://brainrush.local/` served by XAMPP Apache, which still arrives from `127.0.0.1`) or behind a local reverse proxy that adds `X-Forwarded-For`. Try to save a setting.
- **Expected (US-29 AC3, README):** a write from loopback succeeds.
- **Actual:** 403 "Admin changes are disabled…", because the code also requires a `Host` of `localhost` / `127.0.0.1` / `[::1]` and no forwarding header. This is a deliberate, safe deviation (documented in `docs/hosting-dev.md`, "Deviations" 1; it keeps a site behind a local proxy closed). But the README and the deploy guide only say "localhost / 127.0.0.1 / ::1", with no mention that other local host names need the admin keys, and the story text says "from loopback".
- **Suggested fix:** one sentence in the README Security section and in the troubleshooting table: "To use a custom local host name, set the admin keys." The PO may also want to amend the US-29 wording to match.

## Observations (no action required, for the PO)

- **O-1 (design deviation to accept):** AC3 literally says writes from loopback succeed. The implementation additionally requires a local `Host` and no proxy headers (fail closed). I verified it works as the developer described, and I consider it the right behaviour. Please confirm.
- **O-2 (usability):** the hash command echoes the typed password on screen (stdin is not hidden). It is not saved in history, but should not be run with someone watching. Optionally say so in the guide.
- **O-3 (hosting risk):** `.htaccess` guards missing modules with `<IfModule>`, but `Options -Indexes`, `CGIPassAuth`, the `FilesMatch` `Require` block and the rewrite rules need the host to allow overrides (`Options`, `AuthConfig`, `FileInfo`). On a host that restricts `AllowOverride`, Apache would return 500 for the whole site. Hostinger normally allows them, and the developer's Apache 2.4.58 test used `AllowOverride All`. The first live deploy covers this. Also, the HTTPS redirect target is built from the request `Host` header (low impact: a browser cannot be made to send a forged `Host`).
- **O-4 (known limitations, accepted by D-20 or documented):** no login rate limiting, no Basic Auth logout, answers readable via GET. `docs/spec.md` still contains the old wording "`api/config.php` holds placeholder credentials only" (it means `config.example.php`; it was there before this change).
- The headless Chrome profile the developer left behind (`%TEMP%\brainrush-chrome-prof`, plus `brainrush-server.log`) is still there. It is harmless; delete it manually when its processes are ended.

## Cleanup

- All test rows (categories "QA Test Cat", "QA Auth Cat"; point values 600 and 777; questions in those categories) were deleted. Settings were reset to 5/30 after the UI save test.
- Final state, read through the API: settings `{"categories_per_game":5,"timer_seconds":30}`; points 100, 200, 300, 400, 500; 6 categories (Geography, History, Movies, Science, Sports, Technology) with 5 questions each; 30 questions in total; none contain "QA". Auto-increment counters advanced (harmless).
- Servers on ports 8001, 8003, 8005 and 8006 were stopped. The harness folder in the temp directory (copies of the API, the generated test login, logs) was deleted. Port 8000 (not mine) is still running, untouched. No browser processes were killed.
- `api/config.php` was never read or modified. No application code was modified. The only file written in the repo is this report.

## Verdict

**READY FOR PO.** No Critical or Major bugs, and every criterion that can be tested here passes. The release of the hosted site still depends on the 6 PENDING (live deploy) items (rows 5a, 7, 8a, 8b, 9b, 11). The owner must run the checklist in `docs/deploy-hostinger.md` §7 on the first deployment, and the PO should decide on O-1 and BUG-29-01 (one documentation sentence).

## Product Owner acceptance

Product Owner, 2026-10-04. Basis: US-29, D-17, D-20 in `docs/product-backlog.md`; `docs/spec.md`; `docs/hosting-dev.md` (incl. Deviations); this report; spot-check of the BUG-29-01 fix in `README.md` (Security, "Local (admin keys empty)") and `docs/deploy-hostinger.md` (Troubleshooting, "Admin changes are disabled…" row).

| Criterion (US-29) | Decision | Reason |
|---|---|---|
| AC1 Configured: no/wrong credentials → 401 + challenge, nothing changed | **MET** | Row 1: 27 requests on all 9 write routes, all 401 with `WWW-Authenticate: Basic`, data unchanged. |
| AC2 Configured: correct credentials behave as before | **MET** | Row 2: 200/201 plus 400/404/409/415 unchanged; client address plays no part. |
| AC3 Not configured: local writes succeed, others 403 | **MET** (amended wording) | Rows 3a, 3b: loopback with a local `Host` works; genuine LAN address, proxy headers and non-local `Host` give 403 with the human message, before body validation. |
| AC4 GETs open in any configuration | **MET** | Row 4. Full game play is verified in Sprint 3/4; the endpoints it needs are proven here. |
| AC5 Login prompt on load; cancel/fail shows inline message | **Partly MET, rest PENDING** | 5b met (notice + inline message, tables still readable, no raw JSON). 5a (native prompt) PENDING (live deploy); `auth.php` returns the 401 challenge on load. |
| AC6 Credentials only as hash in git-ignored `config.php`; example shows keys + hash command | **MET** | Rows 6, 15, 22: no plain password or hash in the repo; `config.php` ignored and untracked. |
| AC7 HTTPS 301 on non-localhost | **PENDING (live deploy)** | Row 7: rules reviewed; developer verified on Apache 2.4.58. |
| AC8 `Authorization` reaches PHP; listing off; blocked paths 403/404 | **PENDING (live deploy)** | Rows 8a, 8b: PHP fallback parsing proven (row 16); `.htaccess` reviewed; developer verified on Apache 2.4.58. |
| AC9 `schema-hosted.sql`: no `CREATE DATABASE`/`USE`, identical tables + seed; phpMyAdmin import | **Partly MET, rest PENDING** | 9a met. 9b (phpMyAdmin import on Hostinger) PENDING; developer import into a differing-collation DB ran twice cleanly. |
| AC10 Deploy guide content | **MET** | Rows 10, 25; hPanel labels (row 11) PENDING (live deploy). |

Rulings on the developer's deviations:
- **1. Stricter local rule (O-1, BUG-29-01):** accepted. It fails closed behind a local reverse proxy, which the plain loopback rule would leave open on a public site, and forwarding headers never grant access. US-29 AC3, D-20 and the spec Security notes are amended to "loopback address **and** local `Host` **and** no forwarding headers". BUG-29-01 is **closed**: both the README and the deploy-guide troubleshooting row now say that only `localhost` / `127.0.0.1` / `[::1]` with no proxy count as local and that `brainrush.local` needs admin keys (spot-checked).
- **2. 500 with a hint for half-configured or non-hash admin keys:** accepted. It is a server misconfiguration, not a login failure. It fails closed, logs no values (row 18) and the guide's troubleshooting table maps the message to a fix. Recorded in the D-20 amendment.
- **3. Empty admin keys in `config.example.php`:** accepted. A copied example then means "local only" instead of "always 401", and empty values are placeholders (US-28, AC6). The comment shows the key format and the hash command.
- **4. Double-quoted hash command:** accepted. It contains no `$`, works the same in bash, cmd.exe and PowerShell, and keeps the password out of the command line and history (row 22).
- **5. Extra `.htaccess` blocks (`.htaccess`, `api/db.php`, `FilesMatch` fallback):** accepted. They go beyond AC8 in the safe direction and degrade without 500s when modules are missing.

Rulings on observations:
- **O-1:** accepted, see deviation 1.
- **O-2** (hash command shows the typed password on screen): accepted. It is not stored in history, and the owner runs it once on their own computer. Follow-up F-1 (docs, before the first deploy): in `docs/deploy-hostinger.md` step 5.1 and the README, replace "waits silently" with a note that the password is visible while typing, so run it unobserved and clear the screen afterwards.
- **O-3** (`AllowOverride` restriction would 500 the whole site; redirect target built from `Host`): accepted as a hosting risk. Hostinger allows these overrides, and the first item of the §7 checklist (the home page loads over HTTPS) detects it immediately. The `Host`-based redirect is low impact, as the tester notes. Follow-up F-2 (docs, before the first deploy): add a troubleshooting row "Whole site shows 500 right after uploading `.htaccess`: the host restricts overrides; check the error log, or temporarily rename `.htaccess` to confirm, and contact hosting support".
- **O-4:** no rate limiting and no Basic Auth logout are accepted known limitations (documented in the dev note, README and guide; mitigated by bcrypt, HTTPS and a long password). Readable answers via GET are accepted by D-20. The stale spec wording is fixed: `docs/spec.md` Security notes now say that `api/config.php` is git-ignored and holds the real credentials, and that `api/config.example.php` holds the placeholders.

Treatment of the 6 PENDING (live deploy) rows (5a, 7, 8a, 8b, 9b, 11): accepted **conditionally**. Everything that can be verified offline passes, and the developer's real Apache 2.4.58 run covers the `.htaccess` logic. The remaining risk is host-specific (LiteSpeed, hPanel), and the §7 checklist covers it.

Conditions:
- **C-1:** on the first deployment, the owner runs the whole `docs/deploy-hostinger.md` §7 checklist plus the phpMyAdmin import (row 9b) and notes any hPanel label differences (row 11). The result is recorded briefly in `docs/hosting-test-report.md` (date and pass/fail per item). If any item fails, US-29 reopens. The site must not be shared with stakeholders until the admin-login and blocked-file checks pass.
- **C-2:** F-1 and F-2 (one sentence or row each in the docs) are done before the first deploy. Neither blocks the merge.
  - **Update 2026-10-04:** C-2 met. F-1 done in `docs/deploy-hostinger.md` step 5.1 and `README.md` (password visible while typing; clear the screen). F-2 done: troubleshooting row for "500 after uploading `.htaccess`" added to `docs/deploy-hostinger.md`.

Notes:
- No open Critical or Major bugs. BUG-29-01 is closed (docs). 24 PASS, 0 FAIL.
- The leftover headless Chrome profile (`%TEMP%\brainrush-chrome-prof`) is a local cleanup item for the owner, not a product issue.
- Backlog updated: US-29 AC3 reworded and D-20 amended. `docs/spec.md` Security notes updated (loopback rule, O-4 wording). No new stories. `docs/sprint-plan.md` is left to the Scrum Master.

**US-29: CONDITIONALLY ACCEPTED** (conditions C-1 live §7 checklist + phpMyAdmin import on first deploy; C-2 docs follow-ups F-1/F-2 before first deploy).

## Live deploy check (condition C-1)

Date: 2026-10-04. Site deployed by the owner to Hostinger by manual file upload (PHP 8.3.33 reported by the server, Hostinger CDN `hcdn` in front). Checked by the orchestrator with read-only `curl` requests only; no login was used and no data was changed.

| Row | Check | Result | Evidence |
|---|---|---|---|
| 7 | `http://` redirects to HTTPS | PASS | `http://…/admin.html` → `301` to `https://…/admin.html`. |
| 8a | `Authorization` header reaches PHP | PASS | `auth.php` with a deliberately wrong login returns `401` "Login failed: wrong user name or password." (not "Login required"), so PHP received and checked the credentials. |
| 8b | Blocked paths and directory listing | PASS | `403` for `/sql/schema.sql`, `/sql/schema-hosted.sql`, `/sql/`, `/docs/spec.md`, `/docs/`, `/README.md`, `/.htaccess`, `/api/config.php`, `/api/config.example.php`, `/api/db.php`, `/.claude/agents/…`, `/.git/config`, and listings of `/api/`, `/css/`, `/js/`. Public files (`/`, `/index.html`, `/admin.html`, `/css/style.css`, `/js/admin.js`) return `200`. |
| 9b | `schema-hosted.sql` imported | PASS | `settings.php` returns 5 / 30; `points.php` returns 100–500 with 6 questions each; `categories.php?playable=1` returns the 6 seed categories with 5 questions each; `questions.php` returns 30 rows; the board endpoint returns a full 5 × 5 board. |
| — | Writes refused without login | PASS | `auth.php`, `POST points.php` and `DELETE categories.php` without credentials return `401` + `WWW-Authenticate: Basic realm="BrainRush admin"` and a JSON error; point values were unchanged afterwards. |
| 5a | Browser login prompt on `admin.html`; logged-in save works | PASS | Confirmed by the owner: `admin.html` shows the browser's username/password prompt; after logging in, editing a question's answer was saved. |
| 11 | hPanel labels match the guide | PASS | The owner deployed by following the guide and reported no differences. |

Observations:
- **L-1:** the host runs PHP 8.3, not 8.0. All checks pass on it. D-17 (PHP 8.0 compatible code) still holds, as 8.0-compatible code runs on 8.3.
- **L-2:** `X-Powered-By: PHP/8.3.33` is still sent (known, O-4 from Sprint 1; README note scheduled in Sprint 4). On Hostinger it can be turned off in hPanel → PHP Configuration (`expose_php`).

**C-1 met.** All live-deploy rows (5a, 7, 8a, 8b, 9b, 11) pass. No PENDING items remain.

**US-29: ACCEPTED** (Product Owner conditions C-1 and C-2 both met, 2026-10-04).

# Deploying BrainRush to Hostinger (shared hosting)

This guide puts BrainRush online as a **public staging site**. Anyone with the link can play the game. Only you, with the admin login, can change categories, questions, point values and settings (US-29, D-20).

Everything below uses **placeholders**. Replace them with your own values and never write real passwords into this file, the repository or a chat:

| Placeholder | Meaning |
|---|---|
| `your-domain.example` | your domain or sub-domain on Hostinger |
| `u123456789_brainrush` | the database name hPanel creates (Hostinger adds a `u…_` prefix) |
| `u123456789_brainuser` | the database user hPanel creates |
| `YOUR_DB_PASSWORD` | the database user's password (you choose it in hPanel) |
| `quizmaster` | the admin login name you choose |

You need:
- A Hostinger plan with PHP and MySQL/MariaDB databases, and a domain or sub-domain attached to it.
- On your own computer, PHP once, to create the admin password hash. XAMPP's `C:\xampp\php\php.exe` is enough. If your plan has SSH, you can run the same command on the server instead. Do **not** use an online "hash generator": that would send your password to a stranger's website.

---

## 1. Website settings: PHP version and SSL (HTTPS)

1. In **hPanel → Websites → Manage** (for your domain), open **Advanced → PHP Configuration**.
2. Choose **PHP 8.x** (8.0 or newer). BrainRush is developed and tested on PHP 8.0. Newer 8.x versions are expected to work; if anything misbehaves, switch to 8.0 here.
   Keep the default extensions. `pdo_mysql` must stay enabled (it is on by default).
3. Open **Security → SSL** and install or activate the free SSL certificate for your domain. It can take a few minutes to become active.
   BrainRush's `.htaccess` sends every `http://` visitor to `https://`. Until SSL is active, the browser shows a certificate warning, so do this step first.

## 2. Create the database and its user

1. In hPanel open **Databases → Management** (called "MySQL Databases" on some plans).
2. Under **Create a new MySQL database and database user**, enter:
   - Database name, e.g. `brainrush`. hPanel turns it into something like `u123456789_brainrush`.
   - User name, e.g. `brainuser`. It becomes `u123456789_brainuser`.
   - A **strong password**. Use a password manager; this is not your admin password.
3. Click **Create**. Write down the **full** database name, the **full** user name and the password. You need them in step 5.
4. The database **host** is usually `localhost` on Hostinger shared hosting. Use exactly what hPanel shows in the database list (some plans show an address such as `127.0.0.1`).

## 3. Import the tables and sample questions (phpMyAdmin)

1. In the database list, click **Enter phpMyAdmin** next to your new database.
2. In the left sidebar, click your database (`u123456789_brainrush`) so it is selected.
3. Open the **Import** tab, click **Choose file** and pick **`sql/schema-hosted.sql`** from the project.
   Do **not** use `sql/schema.sql`. It contains `CREATE DATABASE`/`USE`, which shared hosting does not allow.
4. Leave the other options as they are and click **Import** (or **Go**).
5. Expected result: a green success message, and four tables in the sidebar: `categories`, `point_values`, `questions`, `settings`.
   The sample data has 6 categories with 5 questions each and point values 100–500.

## 4. Upload the website files

Pick **one** of the two ways below. Either way, the files go into the domain's **`public_html`** folder, or into a sub-folder of it if you want BrainRush at `https://your-domain.example/some-folder/`.

### Option A: Git deployment from GitHub (recommended, easiest to redeploy)

1. In hPanel open **Advanced → Git**.
2. Repository: this project's GitHub URL, `https://github.com/<owner>/<repo>.git`. Branch: **`main`** (only reviewed and merged code).
   For a **private** repository, hPanel shows an SSH key. Add it in GitHub under **Settings → Deploy keys** (read-only), and use the `git@github.com:<owner>/<repo>.git` address.
3. Install path: leave it **empty** to deploy into `public_html`, or enter a sub-folder name.
   Hostinger only deploys into an **empty** folder. Delete the default `default.php` / `index.php` placeholder from `public_html` first (File Manager).
4. Click **Create**, then **Deploy**.

Git deployment copies the **whole repository**, including `docs/`, `sql/`, `.claude/` and `README.md`. That is expected: `.htaccess` blocks web access to all of them (you will check this in step 7). `api/config.php` and `password.txt` are git-ignored, so they are not in the repository and a deploy never creates, uploads or overwrites them. Keep it that way: never force-add (`git add -f`) a credentials file.

### Option B: File Manager or FTP

Upload only what the website needs. Keep the folder structure:

| Upload | Do **not** upload |
|---|---|
| `.htaccess` (a hidden file; make sure your FTP client or File Manager shows hidden files) | `sql/` (import it through phpMyAdmin instead) |
| `index.html`, `admin.html` | `docs/`, `.claude/`, `.git/`, `.gitignore`, `README.md` |
| `css/` (whole folder) | **`api/config.php` from your computer** (it holds your *local* database settings; create a new one on the server in step 5) |
| `js/` (whole folder) | **`password.txt`**, and any other local file with passwords or notes (never, under any name) |
| `api/` (all `.php` files: `auth.php`, `categories.php`, `config.example.php`, `db.php`, `points.php`, `questions.php`, `settings.php`) | |

In hPanel, **Files → File Manager** can upload a `.zip` and extract it. Zip the files from the left column, upload the zip into `public_html`, extract it, then delete the zip. Build the zip from the left column only. Do **not** zip the whole project folder: that would pull in `password.txt` and your local `api/config.php`.

**`.htaccess` must be uploaded.** It forces HTTPS and blocks `sql/`, `docs/`, `README.md`, `api/config*.php` and `password.txt`. Without it these blocks are not active. The `password.txt` rule is only a safety net in case such a file ever lands on the server by mistake. The real rule is that it is never uploaded. If you find one on the server, delete it in File Manager and change every password it contained.

## 5. Create `api/config.php` on the server

This file holds the database login and the admin login. It exists **only on the server**: never commit it, e-mail it or paste it into a chat.

1. **Create the admin password hash on your computer.** Open a terminal (Command Prompt, PowerShell or Git Bash) and run:
   ```
   C:\xampp\php\php.exe -r "echo password_hash(trim(fgets(STDIN)), PASSWORD_DEFAULT), PHP_EOL;"
   ```
   (or `php -r "…"` if `php` is on your PATH). The command waits without a prompt. **Type the admin password and press Enter.** The password **is visible on screen** while you type, so make sure nobody is watching, and clear the window afterwards (`cls` in cmd/PowerShell, `clear` in Git Bash). It prints one line that starts with `$2y$`; that line is the hash. The password itself is not stored in your shell history.
   Pick a long, unique password (for example four or five random words). Leading and trailing spaces are ignored.
2. In **File Manager**, open `public_html/api/` (or `<sub-folder>/api/`), create a **new file** named `config.php`, and paste the following. Fill in your values:
   ```php
   <?php
   return [
       'host'     => 'localhost',
       'port'     => 3306,
       'dbname'   => 'u123456789_brainrush',
       'user'     => 'u123456789_brainuser',
       'password' => 'YOUR_DB_PASSWORD',

       'admin_user'          => 'quizmaster',
       'admin_password_hash' => 'PASTE_THE_$2y$..._LINE_HERE',
   ];
   ```
   - Keep the **single quotes** around the hash. With double quotes PHP would change the `$` parts and the login would never work.
   - Do **not** put the plain admin password anywhere in this file. Only the hash goes here.
   - If `admin_user` and `admin_password_hash` are left empty, the public site refuses every change with a "configure admin credentials" message. The site stays safe, but you cannot edit content.
3. Save. Optional hardening: set the file permission to `600`. If the site then shows "Server is not configured", set it back to `644`.

## 6. Optional: Hostinger "Force HTTPS" and CDN

- **Force HTTPS** in hPanel is fine to enable. `.htaccess` already does the same redirect.
- If the **Hostinger CDN** is enabled and admin changes do not show up in the game, purge the CDN cache once. The API already tells caches not to store its answers.

## 7. Verification checklist

Do these checks in a normal browser window, replacing `your-domain.example`.

**Game and HTTPS**
- [ ] `https://your-domain.example/` shows the BrainRush page.
- [ ] `http://your-domain.example/` (plain http) ends up on `https://…`.
- [ ] `https://your-domain.example/api/settings.php` shows something like `{"categories_per_game":5,"timer_seconds":30}`. This proves PHP and the database work.

**Admin login**
- [ ] `https://your-domain.example/admin.html`: the browser asks for a **user name and password** right away.
- [ ] Click **Cancel**. The page still shows categories and questions, with a yellow notice "Login required to change content…". There is no raw JSON and no blank page.
- [ ] Click **Log in** in the notice and enter the admin user and password. The notice disappears.
- [ ] Change "Default timer" and click **Save settings**. You should see "Settings saved." Set it back afterwards.
- [ ] A wrong password makes the browser ask again. After Cancel, the notice says "Login failed: wrong user name or password."

**Blocked files.** Each of these must show **403 Forbidden** or **404 Not Found**, never file contents:
- [ ] `https://your-domain.example/sql/schema.sql` and `/sql/schema-hosted.sql`
- [ ] `https://your-domain.example/api/config.php`, `/api/config.example.php`, `/api/db.php`
- [ ] `https://your-domain.example/docs/spec.md` and `/README.md` (Git deployment only; with Option B they do not exist → 404)
- [ ] `https://your-domain.example/.claude/agents/game-developer.md` (Git deployment only)
- [ ] `https://your-domain.example/password.txt` (403 from `.htaccess` if a file were there by mistake, otherwise 404; it must never show content)
- [ ] `https://your-domain.example/css/` (directory listing disabled → 403)

**Optional command-line checks** (any terminal with `curl`):
```
curl -i -X POST https://your-domain.example/api/categories.php -H "Content-Type: application/json" -d "{\"name\":\"x\"}"
```
Expected: `401` with `WWW-Authenticate: Basic …` and `{"error":"Login required to change content."}`. Nothing is created.
```
curl -i -u quizmaster https://your-domain.example/api/auth.php
```
curl asks for the password, so it is not saved in history. Expected: `200` and `{"ok":true}`.

## 8. Redeploy after each sprint

The database content and `api/config.php` belong to the live site. A redeploy only replaces the code.

1. Wait until the sprint's pull request is **merged into `main`**.
2. Back up the live content first (strongly recommended). In phpMyAdmin, select the database → **Export** → **Quick** → **Go**. Keep the `.sql` file somewhere private.
3. Update the code:
   - **Git deployment:** hPanel → **Advanced → Git** → **Deploy**. You can also set up the auto-deploy webhook shown there. `api/config.php` is untouched because it is not in the repository.
   - **File Manager/FTP:** upload the changed files from the list in step 4 and overwrite the old ones, including `.htaccess` whenever it changed. **Never** upload or overwrite `api/config.php`, never upload `password.txt` or other local credential files, and never delete the whole `api/` folder.
4. Database changes: only if that sprint's dev note (`docs/sprints/sprint-N-dev.md`) says the schema changed.
   - **Do not** re-import `schema-hosted.sql` "just in case". It never overwrites existing rows, but it **re-adds any sample category or question you deleted**. It also cannot change existing tables. A schema change comes with its own instructions or migration script in the dev note.
5. Open the site and press **Ctrl+F5** (hard refresh) so the browser loads the new JavaScript and CSS. Then repeat the quick checks: the game loads, admin asks for the login, a save works, and `/sql/schema.sql` and `/password.txt` are blocked (403/404).
   A game that was running in a browser before the redeploy is restored if its saved data is still valid. Otherwise that browser simply shows a fresh setup.

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| The login prompt keeps coming back even with the right password | The `Authorization` header does not reach PHP. Check that `.htaccess` was uploaded to the same folder as `index.html` (it is hidden in many FTP clients). Test with `curl -i -u quizmaster https://your-domain.example/api/auth.php`. |
| "Admin changes are disabled: configure admin credentials…" | `admin_user` / `admin_password_hash` are empty in `api/config.php` (step 5). Locally this also happens when you open BrainRush through a custom host name (e.g. `brainrush.local`) or a proxy — only `localhost` / `127.0.0.1` / `[::1]` count as local. |
| "Admin login is not set up correctly on the server…" | One of the two admin keys is empty, or the hash is not a `password_hash()` line. Re-create the hash and keep it in single quotes. |
| "Server is not configured" | `api/config.php` is missing, in the wrong folder, or has a PHP syntax error (for example a missing quote or comma). |
| Every API call says "Internal server error" | Usually wrong database settings: check the full `u…_` database name, user, password and host from hPanel. hPanel's error logs show the detail. BrainRush never shows it in the browser. |
| Whole site shows "500 Internal Server Error" right after uploading `.htaccess` | The server rejects a directive in `.htaccess` (overrides not allowed). Rename it to `htaccess.off` in File Manager: if the site loads again, `.htaccess` is the cause. Contact Hostinger support and ask them to allow `.htaccess` overrides (`AllowOverride All`) — do not run the site without it, because it blocks `sql/`, `docs/` and `api/config.php` and forces HTTPS. |
| Browser certificate warning | SSL is not active yet (step 1). Wait or re-install it in hPanel. |
| How do I log out? | Basic Auth has no logout button. Close all windows of that browser, or use a private window for admin work on shared computers. |
| How do I change the admin password? | Create a new hash (step 5.1) and replace the `admin_password_hash` line in `api/config.php`. |

**Known and accepted:** questions **and answers** can be read through the API (`/api/questions.php`) by anyone who knows the URL. That is fine for a party game (D-20), but don't store anything secret in questions.

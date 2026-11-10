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
5. Expected result: a green success message, and eight tables in the sidebar: `categories`, `daily_challenge` (the Daily Challenge questions of each day, empty at first), `point_values`, `question_reports` (reports from the game, empty at first), `question_stats` (how often each question was answered right, empty at first), `questions`, `settings`, `streaks` (the Streak Challenge leaderboard, empty at first).
   The sample data has 6 categories with 25 questions each (5 per point value) and point values 100–500.
   This step is for a **new, empty** database only. A database that was imported before Sprint 6 is updated with `sql/migrate-question-bank.sql` instead (step 8.4).

## 4. Upload the website files

Pick **one** of the two ways below. Either way, the files go into the domain's **`public_html`** folder, or into a sub-folder of it if you want BrainRush at `https://your-domain.example/some-folder/`.

### Option A: Git deployment from GitHub (recommended, easiest to redeploy)

1. In hPanel open **Advanced → Git**.
2. Repository: this project's GitHub URL, `https://github.com/<owner>/<repo>.git`. Branch: **`main`** (only reviewed and merged code).
   For a **private** repository, hPanel shows an SSH key. Add it in GitHub under **Settings → Deploy keys** (read-only), and use the `git@github.com:<owner>/<repo>.git` address.
3. Install path: leave it **empty** to deploy into `public_html`, or enter a sub-folder name.
   Hostinger only deploys into an **empty** folder. Delete the default `default.php` / `index.php` placeholder from `public_html` first (File Manager).
4. Click **Create**, then **Deploy**.

Git deployment copies the **whole repository**, including `docs/`, `sql/`, `.claude/`, `android/` and `README.md`. That is expected: `.htaccess` blocks web access to all of them (you will check this in step 7). `api/config.php` and `password.txt` are git-ignored, so they are not in the repository and a deploy never creates, uploads or overwrites them. Keep it that way: never force-add (`git add -f`) a credentials file.

### Option B: File Manager or FTP

Upload only what the website needs. Keep the folder structure:

| Upload | Do **not** upload |
|---|---|
| `.htaccess` (a hidden file; make sure your FTP client or File Manager shows hidden files) | `sql/` (import it through phpMyAdmin instead) |
| `index.html`, `admin.html`, `how-to-play.html`, `llms.txt`, `terms.html`, `integration-quiz.html` (the hidden Integration Quiz page, section 13) | `docs/`, `.claude/`, `.git/`, `.gitignore`, `README.md` |
| `css/` (whole folder) | **`api/config.php` from your computer** (it holds your *local* database settings; create a new one on the server in step 5) |
| `img/` (whole folder, including `img/questions/` with the question pictures) | |
| `js/` (whole folder, including `js/share.*.js` and `js/speech.*.js`) | **`password.txt`**, and any other local file with passwords or notes (never, under any name) |
| `api/` (all `.php` files: `auth.php`, `categories.php`, `config.example.php`, `daily.php`, `db.php`, `game-log.php`, `points.php`, `question-stats.php`, `questions.php`, `reports.php`, `settings.php`, `streaks.php`, `integration-quiz.php`) | `logs/` (the server writes its own daily `logs/game-YYYY-MM-DD.log`) |
| `manifest.webmanifest`, `sw.js`, `offline.html`, and the hidden folder `.well-known/` (with `assetlinks.json`), for the Android app (section 11) | `android/` (the Android app project; it is built on your computer, never served) |

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
- [ ] `https://your-domain.example/android/` and `/android/twa-manifest.json` (Git deployment only, once the Android app project exists)
- [ ] `https://your-domain.example/password.txt` (403 from `.htaccess` if a file were there by mistake, otherwise 404; it must never show content)
- [ ] `https://your-domain.example/logs/game-YYYY-MM-DD.log` with today's date, after one game was started (game start log; read it in File Manager, never over the web)
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
   - **File Manager/FTP:** upload the changed files from the list in step 4 and overwrite the old ones, including `.htaccess` whenever it changed. A changed JavaScript or CSS file has a new name (for example `js/game.dfec3b1c.js`), so upload it together with **every page that points at it**:
     - `css/style.*.css` is used by all seven pages: `index.html`, `admin.html`, `how-to-play.html`, `about.html`, `contact.html`, `privacy.html` and `terms.html`.
     - `js/app.*.js` is used by all of them except `admin.html`.
     - `css/guide.*.css` is used by `how-to-play.html`, `about.html`, `contact.html`, `privacy.html` and `terms.html`.
     - `js/game.*.js`, `js/share.*.js` and `js/speech.*.js` are used by `index.html`; `js/admin.*.js` is used by `admin.html`.
     - The hidden `integration-quiz.html` (section 13) also uses `css/style.*.css`, `js/i18n.*.js`, `js/speech.*.js` and `js/game.*.js`: upload it whenever one of them changes.
     - Delete the old `js/`/`css/` file only **after** every page that used it is uploaded: a page still on the old name loses its styling or script (404). To check, search the pages for the old name, or compare their `<link>`/`<script>` names with `main`.
     - Question pictures in `img/questions/` are **not** content-hashed: upload new ones as they are, and give a changed picture a **new file name** (and update its question in Admin), because browsers and the CDN may keep showing the old copy of an unchanged name for days.
     - **Never** upload or overwrite `api/config.php`, never upload `password.txt` or other local credential files, and never delete the whole `api/` folder.
4. Database changes: only if that sprint's dev note (`docs/sprints/sprint-N-dev.md`) says the schema changed.
   - **Do not** re-import `schema-hosted.sql` "just in case". It never overwrites existing rows, but it **re-adds any sample category or question you deleted**. It also cannot change existing tables. A schema change comes with its own instructions or migration script in the dev note.
   - **Picture questions: import `sql/migrate-add-image.sql` once, BEFORE the code update in step 3.** It adds the `image` column to `questions` and replaces the duplicate key `uq_category_question` with `uq_category_question_image` (category + question text + picture), because flag questions all share the same prompt text. The new code reads the `image` column, so deploying it first breaks the game and admin until the migration runs; the old code keeps working with the migrated table.
     1. Back up first (step 2).
     2. In phpMyAdmin, select your database in the left sidebar, open **Import**, choose **`sql/migrate-add-image.sql`** and click **Import** (or **Go**).
     3. Expected result: a green success message. Under **Structure**, `questions` has an `image` column (`varchar(255)`, default empty); under **Indexes**, `uq_category_question` is gone and `uq_category_question_image` exists. Existing questions get an empty image and play as before.
     4. It is safe to import again by mistake: a second run only reports notes and changes nothing.
     5. Upload `img/questions/` with the code (Git deployment includes it; with FTP, see the upload table in section 4).
   - **Photo credits (D-34): import `sql/migrate-add-image-credit.sql` once, BEFORE the code update in step 3**, and after `migrate-add-image.sql`. It adds the `image_credit` column to `questions` (the caption under a picture, "Photo: <author> / <licence>"). The new code reads it, so deploying the code first breaks the game and admin until the migration runs; the old code keeps working with the migrated table. Expected result: a green success message and, under **Structure**, an `image_credit` column (`varchar(255)`, default empty). Existing questions get an empty credit and show no caption. Safe to import again. Import a question set that fills in credits (e.g. `sql/add-landmarks-questions.sql`) only **after** this migration.
   - **Helpers (D-36, US-32): wrong options for "3 choices".** Order matters:
     1. Back up first (step 2).
     2. Import **`sql/migrate-add-wrong-options.sql`** once, **BEFORE** the code update in step 3. It adds `wrong_1`, `wrong_2`, `wrong_1_ar`, `wrong_2_ar` (`varchar(255)`, NULL allowed) after `image_credit` in `questions`. The new code reads them, so deploying the code first breaks the game and admin until the migration runs; the old code keeps working with the migrated table. Expected result: a green success message and the 4 columns under **Structure**. Safe to import again.
     3. Update the code (step 3). With File Manager/FTP upload `api/db.php`, `api/categories.php`, `api/questions.php`, `index.html`, `admin.html` and the new hashed `js/game.*.js`, `js/admin.*.js` and `css/style.*.css`, then delete the old js/css files they replace.
     4. Import **`sql/add-wrong-options.sql`** (the reviewed wrong options). Until then every question has none, so the game works and the 3 choices chip is simply greyed out; Swap and Skip work right away.
     5. Smoke check: open a question, use 3 choices for a player (A/B/C shown), and check that the admin questions table shows ✓ in the Choices column.
   - **Streak Challenge (US-33, US-34, D-37): import `sql/migrate-add-streak.sql` once, BEFORE the code update in step 3**, and after `migrate-add-wrong-options.sql` (the streak's choices use the wrong options). It only creates the `streaks` table (the leaderboard runs). The new `api/streaks.php` reads and writes it, so deploying the code first breaks the leaderboard until the migration runs; the old code ignores the table.
     1. Back up first (step 2).
     2. In phpMyAdmin, select your database, open **Import**, choose **`sql/migrate-add-streak.sql`** and click **Import** (or **Go**). Expected result: a green success message and a new, empty `streaks` table (`id`, `name`, `streak`, `created_at`). Safe to import again.
     3. Update the code (step 3). With File Manager/FTP upload `api/questions.php`, `api/streaks.php` (new), `api/game-log.php`, `index.html`, `admin.html` and the new hashed `js/game.*.js`, `js/admin.*.js` and `css/style.*.css`, plus `how-to-play.html`, `terms.html` and `llms.txt`; then delete the old js/css files they replace. No `.htaccess` change is needed.
     4. Smoke check: in setup with exactly 1 player, click **Start Streak Challenge**, enter a challenger name, answer one question right and one wrong, and check that **See results** shows the run on the leaderboard. In Admin, **Streak leaderboard** lists the run; delete it there (it asks for a login, US-29).
   - **Report a question (Sprint 7, US-42, D-45): import `sql/migrate-add-question-reports.sql` once, BEFORE the code update in step 3.** It only creates the `question_reports` table (question id, reason, note, status, time; no name, IP or device id), with a foreign key to `questions` that deletes a question's reports with it. The new `api/reports.php` reads and writes it. Deployed first, the code still runs: the game and the other Admin panels work, but sending a report shows "Reports are not available right now" and the Admin **Reports** panel says the migration is missing. The old code ignores the table.
     1. Back up first (step 2).
     2. In phpMyAdmin, select your database, open **Import**, choose **`sql/migrate-add-question-reports.sql`** and click **Import** (or **Go**). Expected result: a green success message and a new, empty `question_reports` table (`id`, `question_id`, `reason`, `note`, `status`, `created_at`); the database now has six tables. Safe to import again (a second run only gives the note "Table 'question_reports' already exists").
     3. Update the code (step 3). With File Manager/FTP upload `api/reports.php` (new), `index.html`, `admin.html`, `privacy.html` and the new hashed `js/game.*.js`, `js/admin.*.js` and `css/style.*.css`; then delete the old js/css files they replace. No `.htaccess` change is needed. Check that the live `index.html` and `admin.html` point at the new js/css names, then purge the CDN cache (step 6).
     4. Smoke check: open a board question, click **Report**, pick a reason, send it, and check that the timer kept running. In Admin, **Reports** lists it (it asks for the login, US-29); **Dismiss** it there. `https://your-domain.example/api/reports.php?all=1` without the login must answer 401.
   - **Daily Challenge, sharing and the weekly leaderboard (Sprint 8, US-43, US-46, US-45, D-46): import `sql/migrate-add-daily-challenge.sql` once, BEFORE the code update in step 3.** It only creates the `daily_challenge` table (one row per day and position with a question id; a foreign key to `questions` deletes a question's rows with it). The new `api/daily.php` reads and writes it. Deployed first, the code still runs: the game, the Streak Challenge and Admin work, but **Daily Challenge** shows "The Daily Challenge is not available right now". The old code ignores the table. The weekly leaderboard tab needs no database change (it uses `streaks.created_at`).
     1. Back up first (step 2).
     2. In phpMyAdmin, select your database, open **Import**, choose **`sql/migrate-add-daily-challenge.sql`** and click **Import** (or **Go**). Expected result: a green success message and a new, empty `daily_challenge` table (`challenge_date`, `position`, `question_id`, `created_at`); the database now has seven tables. Safe to import again (a second run only gives the note "Table 'daily_challenge' already exists").
     3. Update the code (step 3). With File Manager/FTP upload `api/daily.php` (new), `api/db.php`, `api/streaks.php`, `index.html`, `how-to-play.html`, `privacy.html`, `llms.txt`, the new hashed `js/game.*.js` and `css/style.*.css`, and the new `js/share.*.js`; then delete the old js/css files they replace. No `.htaccess` change is needed. Check that the live `index.html` points at the new js/css names (including `js/share.*.js`), then purge the CDN cache (step 6).
     4. Smoke check: `https://your-domain.example/api/daily.php` answers JSON with `date` (today in UTC), `number`, `seconds_to_next` and 3 questions, and a second call gives the same questions. On the setup screen click **📅 Daily Challenge**, answer the 3 questions, check the result line and squares, click **Share** ("Copied" on a computer), then open the Daily Challenge again: it shows the result and a countdown. Open the Streak leaderboard and switch between **This week** and **All time**; `api/streaks.php?period=bogus` must answer 400.
   - **Golden Goal (final round, a tiebreaker) and read aloud (Sprint 9, US-44, US-48, D-48, D-50, D-51): no database change.** The new `final_round_enabled` setting is a key/value row in `settings`; a database without the row counts it as off, and Admin creates the row the first time **Save settings** is clicked.
     1. Update the code (step 3). With File Manager/FTP upload `api/settings.php`, `index.html`, `admin.html`, `how-to-play.html`, `privacy.html`, `llms.txt`, the new hashed `js/game.*.js`, `js/admin.*.js` and `css/style.*.css`, and the new `js/speech.*.js`; then delete the old js/css files they replace. No `.htaccess` change is needed. Check that the live `index.html` points at the new js/css names (including `js/speech.*.js`) and `admin.html` at the new `js/admin.*.js`, then purge the CDN cache (step 6).
     2. Smoke check: `https://your-domain.example/api/settings.php` lists `"final_round_enabled":null` (or 0/1 once saved). In Admin turn on **Golden Goal: a tiebreaker question with bets, offered only when players are tied for first** and save. Start a new game with two players, give both the same score, click **End Game**: the game asks **It's a tie! Golden Goal?** with **Go for goal** / **Skip to results**. Play it (bets, question, Correct/Wrong, See results or Continue). Without a tie, End Game goes straight to Results. On an English question, the 🔊 button reads it aloud (a computer without an Arabic voice shows no speaker on Arabic questions). Turn Golden Goal off again in Admin if the owner wants it off by default.
     3. A game saved in a browser before this deploy (saved version 3) is upgraded and goes on without Golden Goal.
   - **Question difficulty stats (Sprint 11, US-47, D-55): import `sql/migrate-add-question-stats.sql` once, BEFORE the code update in step 3.** It only creates the `question_stats` table (one row per question with four counters: correct, wrong, nobody, timeout; no name, IP, device id or time), with a foreign key to `questions` that deletes a question's counters with it. The new `api/question-stats.php` writes it and the Admin question list (`api/questions.php`) reads it. Deployed first, the code still runs: the game plays as before (a failed send never interrupts it) and Admin lists every question, but the **Attempts** and **% correct** columns show "-" with a note naming the migration. The old code ignores the table.
     1. Back up first (step 2).
     2. In phpMyAdmin, select your database, open **Import**, choose **`sql/migrate-add-question-stats.sql`** and click **Import** (or **Go**). Expected result: a green success message and a new, empty `question_stats` table (`question_id`, `correct`, `wrong`, `nobody`, `timeout`); the database now has eight tables. Safe to import again (a second run only gives the note "Table 'question_stats' already exists").
     3. Update the code (step 3). With File Manager/FTP upload `api/question-stats.php` (new), `api/questions.php`, `api/db.php`, `api/reports.php`, the new hashed `js/game.*.js`, `js/admin.*.js` and `css/style.*.css`, and **all seven pages that point at them**: `index.html`, `admin.html`, `how-to-play.html`, `about.html`, `contact.html`, `privacy.html` and `terms.html` (the five info pages changed only their stylesheet name). Delete the old js/css files only after all seven are uploaded. No `.htaccess` change is needed. Check that all seven live pages point at the new js/css names, then purge the CDN cache (step 6).
     4. Smoke check: play one board question to the end (mark a player Correct, then **Back to Board**). In Admin (it asks for the login), **Questions** shows that question with 1 attempt and 100%, and the line above the list shows the band of each enabled value ("Check value: 20+ attempts and % correct outside 100: 60–100% · 200: 50–90% · …"). `https://your-domain.example/api/question-stats.php` opened in the browser (a GET) must answer 405. Then remove the smoke-test count in phpMyAdmin (SQL: `DELETE FROM question_stats;` right after the deploy, before players add real counts) if you want the stats to start from zero.
     5. A game or Streak run saved in a browser before this deploy keeps going but sends no stats for the rest of that game (no saved-game version change); new games send them.
   - **Reset stats (change request after Sprint 11): no database change.** Admin gets a **Reset all stats** button on the "Check value: …" line above the Questions table; it empties `question_stats` through the new admin-only `DELETE api/question-stats.php`. It needs the Sprint 11 migration above (without the table the button stays hidden).
     1. Update the code (step 3). With File Manager/FTP upload `api/question-stats.php`, the new hashed `js/admin.*.js` and `css/style.*.css`, and **all seven pages that point at them**: `index.html`, `admin.html`, `how-to-play.html`, `about.html`, `contact.html`, `privacy.html` and `terms.html` (the stylesheet name changed in all seven; `admin.html` also has the button). Delete the old `js/admin.*.js` and `css/style.*.css` only after all seven are uploaded. Check that the live pages point at the new names, then purge the CDN cache (step 6).
     2. Smoke check: in Admin (with the login), **Questions** → **Reset all stats** → confirm: the message reads "Stats reset: N questions cleared.", every question shows 0 attempts and the button is greyed out. `DELETE https://your-domain.example/api/question-stats.php` without the login (for example `curl -X DELETE …`) must answer 401, and a GET must still answer 405. The reset cannot be undone, so back up first (step 2) if the counts matter.
   - **Arabic interface and Arabic category names (Sprint 13, US-49, and its change request): import `sql/migrate-add-category-name-ar.sql` once, BEFORE the code update in step 3, then `sql/add-category-arabic-names.sql`.** The migration adds one optional column, `categories.name_ar` (VARCHAR(100), NULL). Unlike the stats migration, this one is required first: the new `api/categories.php`, `api/questions.php` and `api/daily.php` select the column, so without it Setup, the board, Streak and the Daily Challenge fail. The old code ignores the column, so importing it early is harmless.
     1. Back up first (step 2).
     2. In phpMyAdmin, select your database, open **Import**, choose **`sql/migrate-add-category-name-ar.sql`** and click **Import** (or **Go**). Expected result: a green success message; under **Structure**, `categories` has a new `name_ar` column after `name`. Safe to import again (MariaDB `ADD COLUMN IF NOT EXISTS`; a second run only gives a note).
     3. Import **`sql/add-category-arabic-names.sql`** the same way. It fills `name_ar` for the 14 current categories, matched by their English name (live and local ids differ); a category not in the file is skipped, and a name already set in Admin is never overwritten. Safe to import again.
     4. Update the code (step 3). With File Manager/FTP upload `api/categories.php`, `api/questions.php`, `api/daily.php`, the new hashed `js/game.*.js`, `js/admin.*.js`, `js/share.*.js` and `css/style.*.css`, the new hashed `js/i18n.*.js` (new in Sprint 13), `llms.txt`, and **all seven pages that point at them**: `index.html`, `admin.html`, `how-to-play.html`, `about.html`, `contact.html`, `privacy.html` and `terms.html`. Delete the old js/css files only after all seven are uploaded. No `.htaccess` change is needed. Check that the live pages point at the new js/css names (including `js/i18n.*.js` in `index.html`), then purge the CDN cache (step 6).
     5. Smoke check: `https://your-domain.example/api/categories.php?playable=1` lists `"name_ar"` for every category (for example `"Geography"` with `"جغرافيا"`). On the game page click **عربي**: the Setup tiles, the board column headers and the question heading show the Arabic names ("كيلو مشكّل" for Kilo Meshakkal); click **EN** and everything is English again. In Admin, **Categories** has an **Arabic name** column, and **Rename** shows an Arabic field next to the name.
     6. A game, Streak run or Daily Challenge saved in a browser before this deploy keeps going (no saved-game version change); in Arabic it shows the English category names until a new game is started.
   - **Integration Quiz (owner request 2026-11-10): import `sql/migrate-add-integration-quiz.sql` once, BEFORE the code update in step 3.** It only creates two new tables, `integration_questions` and `integration_scores`; nothing else changes. The steps, loading the questions and the checks are in section 13.
   - **Sprint 6 (question bank): import `sql/migrate-question-bank.sql` once.** Questions keep their point value, but a category may now hold several questions per value, and each new game draws one at random for every board cell. Do this right after the code update in step 3. Until then the old one-per-slot key still blocks a second question at the same category and point value; the game keeps working.
     1. Back up first (step 2). The migration changes the `questions` table.
     2. In phpMyAdmin, click your database in the left sidebar so it is selected, open **Import**, choose **`sql/migrate-question-bank.sql`** and click **Import** (or **Go**). The file has no `CREATE DATABASE`/`USE`, so it runs on the selected database.
     3. Expected result: a green success message. Under **Structure** → **Indexes** for `questions`, `uq_slot` is gone and `uq_category_question` and `idx_questions_slot` exist; the `points` column stays. Each of the 6 sample categories gains up to 20 questions, 4 per point value 100–500 (a category that still has only its 5 sample questions ends up with 25, 5 per value). Every existing question is kept with its points.
     4. It is safe to import again by mistake: it then only reports notes and adds nothing. A category you renamed or deleted, or a point value you deleted, does not get the new questions.
     5. If it stops at the first step with **"Duplicate entry … for key uq_category_question"**, one category has the same question text twice (the old model allowed that). Nothing has changed at that point. The file header has a query that lists the duplicates; edit or delete one of each pair, then import again.
5. Open the site. You don't need a hard refresh. JavaScript and CSS are cached for up to 7 days, but every changed file gets a new name with a content hash (see "Asset file names" in `README.md`), so browsers and the CDN load it fresh. If a page still shows old content, check that the live pages (`index.html`, `admin.html` and the five info pages: `how-to-play.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html`) reference the same `js/…`/`css/…` names as `main`. If they do not, the deploy did not run. If they do, press **Ctrl+F5**, and purge the Hostinger CDN cache (step 6) if that does not help. Then repeat the quick checks: the game loads, admin asks for the login, a save works, and `/sql/schema.sql` and `/password.txt` are blocked (403/404).
   A game that was running in a browser before the redeploy is restored if its saved data is still valid. Otherwise that browser simply shows a fresh setup.

## 9. Ads (Google AdSense, US-38, D-41)

The code ships with ads **off**, so you can deploy it before AdSense approves the site. There is no database change.

1. **Deploy the code** (section 8, step 3). With File Manager/FTP, upload `api/settings.php`, `index.html`, `admin.html`, `privacy.html` (new), `terms.html`, `how-to-play.html`, `llms.txt`, `.htaccess`, the new site icon files `img/logo.svg`, `img/favicon-32.png` and `img/apple-touch-icon.png`, and the new hashed `js/game.*.js`, `js/admin.*.js` and `css/style.*.css`, then delete the old js/css files they replace. Check that `https://brainrush.integration.ninja/privacy.html` opens.
2. **Apply for AdSense** at adsense.google.com. Under **Sites**, add the **root domain `integration.ninja`**: AdSense lists root domains, and it covers `brainrush.integration.ninja`.
3. **Create ads.txt on the root domain.** Google reads it from `https://integration.ninja/ads.txt`, not from the BrainRush folder.
   1. Find your publisher ID: AdSense → **Account → Settings → Account information** (`pub-` and 16 digits), or **Sites → integration.ninja → ads.txt snippet**, which shows the whole line.
   2. Create a plain-text file named exactly `ads.txt` with this one line, using your own ID: `google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0`. Use `pub-…` here, not `ca-pub-…`. `f08c47fec0942fa0` is Google's fixed ID, the same for everyone.
   3. In hPanel, open **File Manager** for the **`integration.ninja`** website (not the `brainrush` subdomain) and put `ads.txt` in its `public_html/` folder.
   4. Open `https://integration.ninja/ads.txt` in a private window. It must show the line as plain text (status 200), with at most one redirect. If it shows an old copy or 404, purge the CDN cache (section 6).
   5. AdSense → **Sites** shows the ads.txt status. It can take a few days to change to **Authorized**.
4. **Consent messages:** AdSense → **Privacy & messaging** → create and publish the **European regulations** message (EEA/UK/Switzerland) and the **US state regulations** message. Enter `https://brainrush.integration.ninja/privacy.html` as the privacy policy URL. The AdSense script shows these messages itself; there is no code for them.
5. **After approval:** AdSense → **Ads → By ad unit → Display ads** → **Responsive** → create it, then copy the number from `data-ad-slot="…"`.
6. **Turn ads on:** Admin → **Game settings** → enter the publisher ID (`ca-pub-…`) and the slot ID, tick **Show ads**, and save. Open **Streak leaderboard** from the setup screen (or finish a Streak Challenge run): the banner shows under the buttons. That is also when a first-time European visitor sees the consent message. A new ad unit can take up to an hour to show real ads; until then the area may stay blank.
7. **Optional, later: H5 Games Ads** (interstitial and rewarded ads, for example between questions). This needs a separate approval. With an approved AdSense account, apply with Google's H5 Games Ads form (adsense.google.com/start/h5-beta/). The loader already defines `adBreak`/`adConfig`, so only the placements need code.

To turn ads off, untick **Show ads**. Maintenance mode also hides them.

## 10. Search engines and link previews (US-39, D-42)

1. **Deploy the code** (section 8, step 3). With File Manager/FTP upload `index.html`, `how-to-play.html`, `terms.html`, `privacy.html`, `admin.html`, `llms.txt`, the new `robots.txt`, `sitemap.xml` and `img/og-image.png`, and the new hashed `css/style.*.css` (delete the old one). Check that `https://brainrush.integration.ninja/robots.txt` and `/sitemap.xml` open.
2. **Google Search Console** (search.google.com/search-console, same Google account as AdSense):
   1. **Add property** → **URL prefix** → `https://brainrush.integration.ninja/`.
   2. Verify with **HTML file**: download Google's `google….html` file and upload it unchanged into the BrainRush folder in File Manager (next to `index.html`), then click **Verify**. **Keep the file there**: deleting it un-verifies the site. A Git deploy does not remove it, because it is not in the repository.
   3. **Sitemaps** → enter `sitemap.xml` → **Submit**. The status should become **Success**.
   4. **URL inspection** → paste `https://brainrush.integration.ninja/` → **Request indexing**. Do the same for `/how-to-play.html`.
   5. Google needs days to a few weeks to index a new site. **Performance** then shows which searches find BrainRush.
3. **Optional checks:**
   - Structured data: search.google.com/test/rich-results with the game URL. It should find the `WebSite` and `WebApplication` items with no errors.
   - Link preview: paste the game URL into a WhatsApp chat to yourself. It should show the BrainRush picture, title and description. WhatsApp and Facebook cache previews, so a link shared before this deploy may show the old (empty) preview for a while.
4. **Keep the sitemap current:** when a page's text changes noticeably, update its `<lastmod>` date in `sitemap.xml`. Add a new public page to the sitemap too.

## 11. Android app (US-40, D-43)

The Android app is a Trusted Web Activity: it opens this site full screen in Chrome, so every web deploy also updates the app. This web part can go live on its own, before the app exists. There is no database change.

1. **Deploy the code** (section 8, step 3). With File Manager/FTP upload:
   - the new files at the site root: `manifest.webmanifest`, `sw.js`, `offline.html`;
   - the hidden folder **`.well-known/`** with `assetlinks.json` (show hidden files, as for `.htaccess`);
   - the icons `img/icon-192.png`, `img/icon-512.png` and `img/icon-maskable-512.png`;
   - **`.htaccess`** (it now blocks `android/`, sends the manifest and `assetlinks.json` with the right types, and gives `sw.js` `no-cache`);
   - `index.html`, `how-to-play.html`, `terms.html`, `privacy.html`, `admin.html` (it shares the stylesheet), `sitemap.xml`, and the new hashed `js/game.*.js`, `js/app.*.js` (new: app mode, loaded by the game, guide, Terms and Privacy pages) and `css/style.*.css`; then delete the old js/css files they replace.
2. **Purge the Hostinger CDN cache** (section 6), so the new `sw.js`, `manifest.webmanifest` and `assetlinks.json` are served instead of a missing or old copy.
3. **Checks** in Chrome on a computer:
   - `https://brainrush.integration.ninja/manifest.webmanifest` opens. DevTools (F12) → **Application → Manifest** shows no errors and all three icons, including the maskable one.
   - **Application → Service workers** shows `sw.js` as activated. Tick **Offline** there and reload: the "You're offline" page shows. Untick it again.
   - `https://brainrush.integration.ninja/.well-known/assetlinks.json` opens with status 200 as JSON. With Git deployment, `/android/` returns 403 once the app project exists.
   - `https://brainrush.integration.ninja/?source=twa` in a new tab: the Admin link is hidden, the Streak leaderboard shows no ad, and How to play / Terms / Privacy open in the same tab. A normal tab without `?source=twa` is unchanged.
4. **Signing fingerprint in `assetlinks.json` (before the app is tested).** Since 2026-10-26 the file in the repository holds the upload key's fingerprint (also listed in `android/README.md`), so steps 1 and 2 are done; step 3 is still open. Chrome only opens the app without a URL bar when the file lists the SHA-256 fingerprint of the key that signed the app.
   1. When the Android project is created, Bubblewrap creates the upload key (outside the repository) and prints its SHA-256 fingerprint (`AB:CD:…`, 32 pairs). `bubblewrap fingerprint generateAssetLinks` writes a ready `assetlinks.json` with it. `keytool -list -v -keystore <keystore file>` also shows it.
   2. Replace the placeholder with that fingerprint, merge it through a pull request, deploy, and **purge the CDN** again.
   3. After the first upload to Play Console, copy the **App signing key certificate** SHA-256 (Play Console → your app → **App integrity** → **App signing**) into `sha256_cert_fingerprints` as a second entry. Apps installed from Google Play are signed with that key, so without it they show a URL bar. Deploy and **purge the CDN** again.
   4. Check the live file in a private window (status 200, the right fingerprints), then with Google's checker: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://brainrush.integration.ninja&relation=delegate_permission/common.handle_all_urls` must list the package `ninja.integration.brainrush`.
   Fingerprints are public and safe to commit. The keystore and its passwords are not: keep them outside the repository and back them up.
5. **Later changes.** A changed `offline.html` needs a new `CACHE` version in `sw.js` (for example `brainrush-offline-v2`), or phones keep showing the old copy. A changed icon needs a new file name, like the question pictures.

## 12. About and Contact pages (US-41, D-44)

1. **Deploy the code** (section 8, step 3). With File Manager/FTP upload the new `about.html` and `contact.html`, the changed `index.html`, `how-to-play.html`, `terms.html`, `privacy.html`, `sitemap.xml` and `llms.txt`, and the new hashed `css/style.*.css` (delete the old one). No database change.
2. Check that `https://brainrush.integration.ninja/about.html` and `/contact.html` open, and that the footer links work on the game's setup screen and on the guide.
3. In Google Search Console, **Sitemaps** → open `sitemap.xml` → it is read again on its own; to speed it up, use **URL inspection** → **Request indexing** for the two new pages.

## 13. Integration Quiz (hidden team page)

`integration-quiz.html` is a Sudden Death quiz with its own questions and its own leaderboard, for the team. It is not in `sitemap.xml` or `llms.txt`, nothing links to it, and it has `noindex`: share the link `https://brainrush.integration.ninja/integration-quiz.html` yourself. Do not submit it in Search Console.

1. **Back up** the database (section 8, step 2).
2. **Create the tables, BEFORE the code.** In phpMyAdmin, select your database, open **Import**, choose **`sql/migrate-add-integration-quiz.sql`** and click **Import** (or **Go**). Expected result: a green success message and two new, empty tables: `integration_questions` (`id`, `question`, `answer`, `wrong_1`, `wrong_2`, `enabled`, `created_at`) and `integration_scores` (`id`, `name`, `streak`, `created_at`). Safe to import again. Deployed without them, the page opens but **Start the quiz** shows "The Integration Quiz is not set up on this server yet."
3. **Deploy the code** (section 8, step 3). With File Manager/FTP upload `integration-quiz.html` (new), `api/integration-quiz.php` (new), `api/streaks.php`, `api/game-log.php`, the new hashed `js/game.*.js` and `js/i18n.*.js`, and the two pages that point at them, `index.html` and `integration-quiz.html`. Delete the old js files only after both are uploaded, then purge the CDN cache (section 6). No `.htaccess` change is needed.
4. **Load the questions.** Copy `sql/add-integration-quiz-questions.example.sql` on your computer, replace its two placeholder rows with your questions (the file explains the format: question, answer and two wrong choices per row), and import your copy the same way as step 2. `INSERT IGNORE` skips a question text that is already there, so you can add rows to the same file and import it again. There is no Admin tab for these questions: to change or remove one, edit it in phpMyAdmin (`integration_questions` → **Browse**), or set `enabled` to `0` to keep it out of the quiz.
5. **Smoke check:** open the page, enter a challenger name, answer one question right and one wrong, and check that **See results** shows the run on the **Integration Quiz leaderboard** (This week and All time). Open the public game: its **Streak leaderboard** does not show that name. `https://your-domain.example/api/integration-quiz.php?period=bogus` must answer 400.
6. **Remove a junk name** from the quiz leaderboard: as admin, `DELETE https://your-domain.example/api/integration-quiz.php?id=<id>` (the ids come from `GET …/api/integration-quiz.php?all=1`, also admin only; both ask for the admin login), or delete the row in phpMyAdmin (`integration_scores` → **Browse** → **Delete**). Admin's **Streak leaderboard** panel lists the public runs only.

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

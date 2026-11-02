# Sprint 7: Report a question (US-42, D-45): developer note

Branch `sprint-7`, 2026-11-02. Plan: `docs/sprint-plan.md` "Sprint 7 — Report a question (US-42)", tasks 1-9, under the Epic E17 common rules. Owner decision D-45 (FU-20): six reasons (wrong answer / typo / translation / outdated / picture problem / other), an optional note of up to 200 characters, **no rate limit**. A row holds only `question_id`, `reason`, `note`, `status` and `created_at`: no name, IP, device id or hash of any of them.

## Stories implemented
- **US-42 Report a question.**
  - **Game.** A small **Report** button sits in the top right corner of the question panel. It shows on an open board question (after a Swap it reports the swap question, the one on screen) and on a Streak question once it is answered (hidden while the Streak question is open). It is absolutely positioned and the heading keeps clear of it (`padding-right`), so it adds no height (D-30). On phones it is 48px tall and the heading is as tall, so nothing sits under it (US-40).
  - **Form.** Report opens a dialog over the screen, built like the double-score popup (`role="dialog"`, `aria-modal`, `.game-main` inert while open). It has "Category – points", the six reasons as radio tiles (2 columns), an optional note (`maxlength=200`, `dir="auto"` for Arabic) with an "N / 200" counter, one line on what is saved, and **Send report** / **Cancel**.
  - **Validation.** No reason, or a note over 200 characters, gives an inline error and sends nothing. A server error (400/503) shows inline as "The report could not be sent: <API message>", and the form stays open. On 201 a thank-you replaces the form, with **Close**. Escape, Cancel, Close and the Android Back button close the dialog, and focus returns to Report.
  - **Nothing in the game changes.** The timer keeps running behind the dialog. Scores, helpers, the saved game (`brainrush.game`, version unchanged) and the saved run (`brainrush.streak`) are never touched. The form state is memory only. While the dialog is open, Enter does not trigger the Streak "Next question" shortcut.
  - **API.** `POST api/reports.php` (public) → 201. A bad id, an unknown question, a bad reason or a note over 200 characters → 400. There is no rate limit.
  - **Admin.** A new **Reports** panel lists the open reports grouped by question, most reported first:
    - the question with its category, points and answer; the number of reports; one line per reason ("Typo: 2"); the notes with their reason and time (newest first).
    - **Edit question** sets the Questions filters to the question's category and points and opens it in the edit form.
    - **Resolve** / **Dismiss** close all of that question's open reports after a plain-text confirm (D-18). Cancel sends nothing.
    - Errors show inline. The panel loads on its own, so a database without the table only breaks this panel.
    - All text is set with `textContent`.
  - **question-bank-manager.** Its plan mode now starts with "Open reports first" (step 2, with the SQL). The brief gives the producer a `REPORTED QUESTIONS (check these first)` list: each one is fact-checked before any new question is written, and the verdict and exact fix go into a "Reported questions" section of the review doc. Validate mode checks that section, and the run report lists the reported questions first.
  - **Privacy page.** A new "Question reports" section says what a report stores and that no name, IP or device id is kept. It is also in the contents; the date is now 2 November 2026.

## Files created / changed
- **New** `sql/migrate-add-question-reports.sql`. It runs `CREATE TABLE IF NOT EXISTS question_reports` with:
  - `id`, `question_id INT UNSIGNED`;
  - `reason ENUM('wrong_answer','typo','translation','outdated','picture','other')`;
  - `note VARCHAR(200) NOT NULL DEFAULT ''`;
  - `status ENUM('open','resolved','dismissed') DEFAULT 'open'`;
  - `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`;
  - `KEY idx_reports_question_status (question_id, status)`, `fk_reports_question` → `questions(id) ON DELETE CASCADE`, `utf8mb4_unicode_520_ci`.

  **Run on the local DB twice**; it needs to run on live **before** the code.
- `sql/schema.sql`, `sql/schema-hosted.sql`: the same table, after `streaks`. The bodies after the CREATE DATABASE/USE lines are identical (checked with `diff`).
- **New** `api/reports.php`:
  - `POST` (public, `read_json_body()`): body `{question_id, reason, note?}` → 201 `{id}`.
    - `question_id` is `parse_int` 1..4294967295; a question that doesn't exist → 400 (FK error 1452 caught).
    - `reason` must be one of `REPORT_REASONS` (exact match).
    - `note`: missing or null means `''`; it must be text. Control characters become spaces, then it is trimmed and may be at most 200 characters (`text_length`, so an emoji counts as 1).
  - `GET ?all=1` (admin): the grouped open reports (shape in `docs/spec.md`). A GET without `all=1` → 400.
  - `PUT ?question_id=` → Resolve, `DELETE ?question_id=` → Dismiss (admin). Both set the status of that question's open reports and keep the rows; they answer 200 `{question_id, status, updated}`, or 404 "This question has no open reports."
  - A missing table (error 1146) → 503 with a clear message (public: "Reports are not available right now…"; admin: names the migration) instead of a generic 500.
  - Prepared statements only.
- `index.html`: `#report-btn` in `.question-main`, after the heading; `#report-overlay` (the dialog) next to `#double-overlay`, outside `<main>`.
- `js/game.ccf94860.js` (edited in place; the hook re-hashes it):
  - The "Report a question" section: `reportTarget()`, `updateReportButton()`, `openReport()`, `closeReport()`, `onReportSubmit()`, `updateReportCount()`, `bindReportEvents()`.
  - `updateReportButton()` is called after `showScreen('question')` in `showQuestion()` and `showStreakQuestion()`, and in `streakAnswer()`.
  - `showScreen()` closes the dialog when leaving the question screen. `onKeyDown()` (Escape, Enter guard) and `goBack()` (Android Back) know the dialog.
- `css/style.2a96d814.css` (edited in place):
  - The Report button, the heading padding, and the overlay, card, reason tiles, counter and privacy line.
  - Phone rules inside the 600px block.
  - Admin: `.report-q-meta` and `.cell-list`.
- `admin.html`: the Reports panel (`#reports-panel`, after Questions).
- `js/admin.bfc53960.js` (edited in place):
  - The Reports section: `loadReports()`, `renderReports()`, cell builders, `editReportedQuestion()` and `closeReports()`.
  - `REPORT_REASONS` labels and `EN_DASH`.
  - The panel loads at start and on login retry, and reloads after a question or category delete (cascade).
- `.claude/agents/question-bank-manager.md`: the description, the fixed fact on reports, plan step 2 (open reports, with the SQL), steps renumbered 3-7, the brief's first item, the validate check and the run report's first item.
- `privacy.html`: the "Question reports" section, its contents entry and the date.
- `README.md`: How to play item 7, the Admin "Reports" item, "Three public writes" under Security, and the deploy line.
- `docs/deploy-hostinger.md`:
  - Step 3: six tables after a fresh import.
  - Step 4: `reports.php` in the upload list.
  - Step 8.4: a new "Report a question (Sprint 7)" migration step (before the code, upload list, smoke check, 401 check).
- `docs/spec.md`: the file structure, Database, API, game screen (Report), Admin (Reports panel) and Security sections.

Not touched: `.htaccess` (it blocks paths and doesn't allow-list endpoints, so `api/reports.php` is served like the others), `sw.js` (it never caches `api/`), `how-to-play.html`, `terms.html` and `llms.txt`.

## Asset names (owner: before and after the commit)
- `js/game.ccf94860.js`, `js/admin.bfc53960.js` and `css/style.2a96d814.css` were edited **in place under their current names**. `index.html`, `admin.html` and the other pages still reference those names, so the local test in Chrome needs no rename and no script run. I did not run `.githooks/hash-assets.sh`: it uses `git mv`/`git add`, and the hook does the rename at commit time anyway.
- On commit, `.githooks/pre-commit` (with `git config core.hooksPath .githooks`) renames the three changed files to their new staged-blob hashes and rewrites the references in every tracked `*.html`: `index.html`, `admin.html`, `privacy.html`, and the guide pages that share `style.*.css`. After the commit, check that `index.html` and `admin.html` point at the new names (FU-16). If the hook did not run, stage the changes and run `sh .githooks/hash-assets.sh` once, as the README says.
- Deploy: import the migration on live **first** (phpMyAdmin), then deploy the code, then purge the CDN (deploy guide 8.4).

## How to run / test
1. MariaDB running; `C:/xampp/mysql/bin/mysql.exe -u root brainrush < sql/migrate-add-question-reports.sql` (already done locally; the table is empty).
2. `C:/xampp/php/php.exe -S localhost:8000` from the project root, then open `http://localhost:8000/`.
3. Start a board game and open a question.
   - Click **Report**: try Send with no reason, pick each reason, and type a note (the counter shows N / 200). Send and check that the timer kept running and the scores didn't change. Also try it after 3 choices, after a Swap, and in English and Arabic.
   - In a Streak Challenge, Report shows once you have answered.
4. Admin → **Reports**: check the grouping, **Edit question**, and **Resolve** / **Dismiss** with Cancel and with OK.

## Verification done
- `php -l api/reports.php`: no syntax errors (PHP 8.0, XAMPP). `node --check` on both edited JS files: OK.
- **Migration:**
  - Run twice on the local DB: exit 0 both times; the second run only gives the note "Table 'question_reports' already exists".
  - `sql/schema-hosted.sql` imported twice into a scratch database, then the migration on top: no error, 6 tables. Its `SHOW CREATE TABLE question_reports` matches the migrated local table except AUTO_INCREMENT (test rows). Scratch DB dropped.
- **Table missing (before the migration, and in the browser with the table renamed):**
  - POST → 503 "Reports are not available right now…", and `?all=1` → 503 naming the migration.
  - The game's form shows that error inline, and the game goes on.
  - Admin shows the error in the Reports panel only; Questions, Streak leaderboard and the other panels load. `categories.php` stays 200.
- **curl against a temporary `php -S localhost:8010` (stopped afterwards):**
  - Each of the six reasons → 201.
  - Note of 200 characters → 201, 201 → 400. The same with 200 Arabic characters sent from a UTF-8 file (199 "ب" + an emoji = 200 → 201, stored byte-exact; 201 → 400).
  - A note padded with spaces is trimmed. `\n` and `\t` are stored as spaces. `<img src=x onerror=alert(1)>` is stored as typed.
  - id as the string "3" → 201.
  - These give 400: id 0, -1, 1.5, "abc", missing, 4294967296, and an unknown id. So do reason "spam", "Typo", missing or an array, a numeric note, and a `[]` body.
  - Form-encoded body → 415. PATCH → 405.
  - **No rate limit:** 30 reports in a row → 30 × 201.
  - `?all=1`: groups ordered by count, with the per-reason counts and the notes. `PUT ?question_id=1` → 200 `updated: 10`, again → 404. `DELETE ?question_id=5` → 200 `dismissed` (30), again → 404. No or bad `question_id` → 400.
  - Admin endpoints with a non-local Host → 403, and the POST still → 201.
  - **401 without login:** with a throwaway copy of `db.php` + `reports.php` and a test-only config (admin hash of a throwaway password) in a temp folder outside the repo:
    - GET `?all=1`, PUT and DELETE without login → 401 with `WWW-Authenticate: Basic`.
    - A wrong password → 401; the test login → 200; the public POST → 201.
    - The copy was deleted afterwards. The real `api/config.php` was not read or changed.
  - **Cascade:** a temporary question with 3 reports was deleted through `questions.php` and its reports were gone (0 rows).
  - **Stored columns:** `information_schema` lists only `id, question_id, reason, note, status, created_at`.
- **Headless Chrome (Playwright with system Chrome; a test script outside the repo). Final run: 79 of 80 checks passed.** The one failure was a mistake in the test's DB query, which only looked at reports made in that run. The dismissed group had been reported in an earlier run, and the DB showed it `dismissed`.
  - Board, 1366x768:
    - Report is hidden on setup and the board, and shown on the question.
    - With Report, the page height is 768 for a text question, a Landmarks photo and a Flags SVG. The question panel's height with and without the button is identical.
    - The button overlaps neither the heading text nor the picture or question text below it.
    - Focus goes to the first reason, and main is inert. The timer ran on while the form was open (30 → 28) and after the send.
    - The no-reason error goes away when a reason is picked. A 201-character note (maxlength bypassed by script) shows "201 / 200", gives an inline error and sends no request. A routed server 400 is shown inline and the form stays open.
    - The XSS note was sent with only `question_id`, `reason`, `note`, and with the open question's id.
    - Close returns focus to Report, and the saved `brainrush.game` is byte-identical before and after. Escape and Cancel close the form.
    - A refresh on the question shows Report again.
    - 3 choices plus a Correct mark, then a report: the score and the saved game are unchanged, and the choices are still shown.
    - The English toggle plus an Arabic note: the bytes are stored correctly.
    - After a Swap, the swap question's id is posted, with an empty note `""`. Skip works after a report.
  - Phone, 375x812 (mobile, touch):
    - No horizontal scroll on a text and a photo question. The Report button is 48px and clear of the heading and the content.
    - The form fits the screen (top 140, bottom 672). Every reason tile is 48px, and sending works.
  - Streak, 1366x768:
    - Report is hidden on the open question and shown once answered. The page fits 768.
    - The answered question's id is posted. `brainrush.streak` and the count are unchanged.
    - After a refresh the answered question still shows Report. Enter inside the dialog does not move on to the next question. The next (open) question hides Report again.
  - Admin:
    - Groups are sorted by count. The heading reads "(N open reports on M questions)".
    - The `<img onerror>` note is shown as text, with no `<img>` element in the panel.
    - Edit question opens "Edit question (Geography - 300)" with the row highlighted.
    - Resolve: the confirm with Cancel sends no request; OK resolves it in the DB, and the question leaves the list. Dismiss is confirmed and dismissed in the DB.
  - No script errors on any page. Only the expected "Failed to load resource" lines from the deliberate 400/503 responses were ignored.
  - I checked these screenshots by eye: the form at 1366x768, Landmarks, the Streak question, the phone question and form, and the admin panel with an Arabic note.
- **Cleanup:**
  - All test rows deleted from `question_reports` (empty, AUTO_INCREMENT 1). The temporary question's id was given back (`questions` AUTO_INCREMENT 1719 again). No `streaks` rows were made.
  - `logs/game-2026-11-02.log` deleted: it held only my 10 test game starts.
  - The test servers were stopped and the scratch files deleted.
  - MariaDB, which I started with `mysqld --standalone`, is left running for the owner's test.

## Known limitations
- **Spam (accepted, D-45).** There is no rate limit and the POST is public, so anyone can file many reports. Dismiss closes all open reports of a question in one go; single reports can't be removed from the panel.
- **Live reports stay on live.** The question-bank-manager reads only the local DB. The owner checks the live Admin > Reports panel (the run report reminds them).
- **The dialog covers the board question while open.** The timer keeps running behind it (as required), so time can run out unseen on the board. Nothing is auto-scored at 0 (D-03).
- **"Picture problem" is offered on every question**, as D-45 lists six reasons; on a text question it is simply not the right pick.
- **Notes are one line.** Line breaks become spaces on the server. The textarea's `maxlength` counts UTF-16 units, so emoji count double while typing; the server limit (200 characters) is never exceeded.
- **Old saved games.** A board game saved before the board sent question ids has nothing to report, so Report stays hidden there.
- **Closing the dialog while "Sending..."** doesn't cancel the request; its result is just not shown.
- **Resolved and dismissed reports** stay in the table (history) but are not shown anywhere in Admin.

## Fix loop 1

Fixes for the 2 Minor bugs in `docs/sprints/sprint-7-test-report.md`.

- **BUG-7-01: Admin Reports panel shows the error and "No open reports."**
  - `init()` no longer renders the empty Reports table before the load. The table body stays empty until `loadReports()` has data.
  - When the load fails, `loadReports()` empties `state.reports`, the table body and the count in the heading, so only the error line shows.
  - "No open reports." now only shows after a successful load with nothing open. `js/admin.bfc53960.js`.
- **BUG-7-02: header links focusable behind the Report dialog.**
  - New `setPageInert(on)` in `js/game.ccf94860.js` makes everything behind a popup inert together, or releases it: the page header, `.game-main` and the site footer (`dom.pageBehind`).
  - The Report dialog (`openReport()` / `closeReport()`) and the double-score popup (`showDoublePopup()` / `closeDoublePopup()`) both use it, in place of `dom.main.inert`.
  - No layout change (inert has no visual effect), and Android Back still closes the popup first (`goBack()` is unchanged).

Re-check: `node --check` on both JS files OK. Headless Chrome (system Chrome, Playwright, scratch script outside the repo) against a temporary `php -S localhost:8010`: **18/18 passed**.
- **Report dialog (1366x768).**
  - Header, main and footer are inert while it is open. 25 Tabs never leave the dialog, and the header link can't take focus.
  - Cancel, Escape, and Send then Close all return focus to Report and release all three. The header link is focusable again.
  - The question still fits 768.
- **Double-score popup (1366x768).** The same three are inert and 10 Tabs stay on the popup. "Let's play" releases them and focuses the heading.
- **Android app mode** (`?source=twa`, 375x812). Back closes the Report dialog, the question stays open, nothing is left inert, and there is no horizontal scroll.
- **Admin, table renamed away.** The Reports table body and the count are empty, and only the error line shows (the other panels as before). With the table back: rows load with no error. After the reports are deleted, Reload shows "No open reports.".
- **No console errors.** Only the expected "Failed to load resource" from the deliberate 503 was ignored.
- **Cleanup.**
  - `question_reports` emptied (AUTO_INCREMENT 1) and the table rename undone.
  - `logs/game-2026-11-02.log` deleted: it held only my 2 test game starts.
  - Server stopped and the scratch files deleted.

## Contrast fixes (owner request, 2026-11-02)

The design-system state gate (`verify_states`) flagged two hover states that were already on `main`. The owner asked for both to be fixed in this sprint. Both changes are in `css/style.2a96d814.css`:
- **Start playing link (guide pages):** `a:hover { color: #ffe27a }` overrode `.btn-primary`'s dark text, so hovering the gold "Start playing" link showed light yellow on gold (1.08:1). `.btn-primary:hover` now keeps `color: #1a1a1a`. This fixes About, Contact, How to play, Privacy and Terms.
- **Sudden Death Streak button:** the hover background `rgba(245, 197, 24, 0.12)` became `#303039`. That is the same colour opaque: a 12% gold tint over the setup panel `#151c3d`. Nothing looks different, and contrast tools now measure the real background.

Re-check: `verify_states` passes on index.html (94 element states), admin.html (92), privacy.html (78), about.html, contact.html, how-to-play.html and terms.html. In the browser, the hover colours are `rgb(48, 48, 57)` behind gold text on the streak button, and `rgb(26, 26, 26)` text on `rgb(255, 216, 74)` for Start playing.

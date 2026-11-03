# Change request "Reset stats" (after Sprint 11): developer note

Branch `cr-reset-stats`, 2026-11-03, cut from `main` after the Sprint 11 merge (PR #92). Owner request (2026-11-03): "in the same line of 'Check value: 20+ …' add a button to purge question_stats". It builds on US-47 / D-55 / D-56. FU-43 (a reset for **one** question) stays open: this button resets **all** questions. The backlog and the sprint plan are not edited; the PO records the decision.

## What was built
- **API: `DELETE api/question-stats.php`, admin only.**
  - It calls `require_admin()` first, like every other admin write, so it gives 401 without a login (403 from another computer when no login is configured). This happens before the database is touched.
  - It runs `DELETE FROM question_stats` as a prepared statement. It does not use TRUNCATE, so the database user needs no DDL privilege.
  - It returns 200 `{"deleted": <rows removed>}`. A second reset gives `{"deleted": 0}`.
  - A missing table gives 503 "Question stats are not available right now." This is the POST's message. The 503 code is now shared in `stats_unavailable()`.
  - The public POST is unchanged. GET and the other methods still give 405, and the `Allow` header is now `POST, DELETE`. The header comment lists both methods.
- **Admin: a "Reset all stats" button** sits on the hint line above the Questions table.
  - Layout:
    - The hint `<p id="question-stats-hint">` and the button share a flex row `#question-stats-row` (`.stats-hint-row`). The text takes the rest of the width and wraps inside its column; the button sits at the right end.
    - On a panel narrower than 20rem of text plus the button, the button wraps below the text.
    - The button uses the existing `btn btn-small btn-danger` style (the Delete buttons), so it adds no new colours. Its keyboard focus ring is the shared `button:focus-visible` gold ring.
  - When it shows:
    - It is **hidden** while any listed question has no stats fields. This is the "-" / migration-note state: the table is missing, or the API is older.
    - It is **disabled** when no question has any attempts, with the tooltip "Nothing to reset: no question has any attempts yet."
    - It is also disabled while a reset runs. A `state.statsResetting` guard means a double click sends one request only.
  - A click opens `window.confirm('Reset the stats of every question? All attempts and % correct go back to 0. This cannot be undone.')`, as in the other confirms (D-18).
  - On success the list reloads (`refreshData()`) and a new message line `#question-stats-reset-msg` under the row shows "Stats reset: N questions cleared." ("1 question" when there is one). It has its own line because `#question-stats-msg` (the migration note) is cleared on every render.
  - On error the API's message is shown on that line and the list is not reloaded. A 401 or 403 also shows the login notice, through the shared `runAction()`.
  - All text is set with `textContent` / `h()`.
- **Hint line wrapping.** Each band such as "200: 50–90%" is now a no-wrap `<span class="band">`, so at 1024 px a line no longer breaks between "20–" and "60%". The hint's `textContent` is exactly the same as before.
- **Robustness, as found on live today.** Live briefly ran the new Admin JS with an old `api/questions.php`, which has no `attempts` field, and Admin crashed with "Cannot read properties of undefined (reading 'correct')".
  - The new `hasStats(q)` is `q.attempts != null && !!q.stats`. It treats a missing field (`undefined`) like `null`.
  - It is used in `attemptsCell()`, `percentCell()` (also `percent_correct == null`), `needsCheck()`, the sort's "no value" test, the migration-note check (`statsMissing()`) and the button's hidden and disabled logic.
  - With such an API, Admin shows "-" in both columns with the migration note and hides the button. Sorting still works.

## Files changed
- `api/question-stats.php`: the header comment, `stats_unavailable()`, `reset_stats()`, the `DELETE` case and `Allow: POST, DELETE`.
- `admin.html`:
  - the row `#question-stats-row` around the existing hint;
  - the button `#question-stats-reset`, which starts `hidden`;
  - the message line `#question-stats-reset-msg`;
  - the comment.
- `js/admin.b5e5aba1.js`, edited in place (the pre-commit hook re-hashes it):
  - the constants `STATS_RESET_PROMPT` and `STATS_RESET_EMPTY`, and `state.statsResetting`;
  - three new `dom` entries;
  - `hasStats()`, `statsMissing()`, `renderStatsReset()` and `onStatsResetClick()`;
  - `renderStatsHint()` hides the row and builds the band spans;
  - the null/undefined handling above, and the click binding.
- `css/style.ca3e62fe.css`, edited in place: `.stats-hint-row` (flex row, its `[hidden]`, the hint's flex basis, the button's `flex: none`) and `.stats-hint-row .band { white-space: nowrap; }`. It adds no colours.
- `README.md`: the Admin "Questions" item and the "Four public writes" admin-rights sentence.
- `docs/spec.md`: the file-structure line of `api/question-stats.php`, and a new API line.
- `docs/deploy-hostinger.md`: section 8, step 4, a "Reset stats (change request after Sprint 11)" bullet. It needs no database change, gives the upload list and the smoke check.
- New: this note.

There is no new JS or CSS file, no SQL change and no change to the game (`js/game.*.js`). `privacy.html` is unchanged, because nothing new is stored.

**Asset names:** `js/admin.b5e5aba1.js` and `css/style.ca3e62fe.css` were edited in place under their current names. On commit the hook re-hashes both and rewrites the seven pages that use `style.*.css`, plus `admin.html` for the JS. Afterwards, check that the pages point at the new names (FU-16).

## How to run / test
1. Start `C:/xampp/php/php.exe -S localhost:8000` from the project root, and open `http://localhost:8000/admin.html`. Local requests need no login when none is configured.
2. Play a board question to the end (or have some counts already). In **Questions**, the line "Check value: …" has **Reset all stats** at its right end.
3. Click it. Cancel the confirm and nothing happens. Accept, and the message reads "Stats reset: N questions cleared.", every row shows 0 / "-", and the button is greyed out with a tooltip.
4. Note: this really deletes your local counts. Back them up first if you want to keep them, for example with `mysqldump -u root brainrush question_stats`.

## Verification done
All runs used my own `php -S localhost:8011`; the owner's port-8000 server was left alone. PHP 8.0.30, MariaDB 10.4.32.
- **Lint:** `php -l api/question-stats.php` passes, and `node --check js/admin.b5e5aba1.js` passes.
- **CRLF:** every changed file has CR on every line. No `innerHTML`, `insertAdjacentHTML`, `outerHTML` or `document.write` was added.
- **curl, local server (no admin login configured):**
  - GET, PUT and PATCH → 405 with `Allow: POST, DELETE`.
  - DELETE with a non-local `Host` → 403 "Admin changes are disabled…".
  - The POST still validates (id 0 → 400).
- **curl, 401 path:** a copy of `api/` in a temp folder outside the repo, with a throwaway `config.php` (local XAMPP root, a throwaway admin user and hash), on port 8013. The real `api/config.php` was not read. The copy was deleted afterwards.
  - DELETE with no login → 401 with `WWW-Authenticate: Basic realm="BrainRush admin"`.
  - A wrong password → 401. The rows were untouched (15 before, 15 after).
  - The right login → 200 `{"deleted":15}`, and the table is empty. Again → 200 `{"deleted":0}`.
  - GET with the login → 405. A public POST → 201.
  - With the table renamed away: DELETE → 503 "Question stats are not available right now." on 8011 (the error is logged), and still 401 without a login on 8013, so the login check comes first.
- **Headless Chrome (Playwright, system Chrome, `--hide-scrollbars` removed so the classic 15 px scrollbar is real): 47 checks at 1366 px and 47 at 1024 px, all PASS.** The script is outside the repo. The writes are mocked, except for the end-to-end run below.
  - Live data: the button reads "Reset all stats" and is visible, enabled, and with no tooltip.
  - Layout:
    - The button is on the same line as the hint text (the boxes overlap vertically) and inside the row, with no row overflow.
    - No page scroll: `scrollWidth` = `clientWidth` = 1351 / 1009.
    - The Questions table still has no inner scroll at either width (BUG-11-01 stays fixed).
    - The hint text is exactly as before, and each of the five bands sits on one line.
  - Keyboard: Tab from the Points filter reaches the button, and `:focus-visible` gives the gold 3 px ring. Enter opens the confirm with the exact text. **Cancel → no request**, and the list and button are unchanged.
  - Double click: two `click()` calls plus a forced `dblclick` while the DELETE is held open → one confirm and one DELETE, and the button is disabled meanwhile. Afterwards: "Stats reset: 7 questions cleared." (mock), and "1 question cleared." in the singular.
  - Errors 500, 503 and 401: the API message is shown in red. The list is unchanged and not reloaded, and the button is enabled again. A 401 also shows the login notice.
  - Old API (the three stats fields removed from the response): every row is "-|-", with the migration note, the button hidden and the hint still shown. Clicking both sort headers gives **no JS error**. This is the live crash case.
  - Stats null (table missing): the same, with the button hidden.
  - All counts 0: the button is visible but disabled, with the tooltip "Nothing to reset: no question has any attempts yet.", and there is no note.
  - No enabled point value (mocked): the hint "Check value: no point value is enabled, so no question is marked." and no JS error.
  - **End to end (real DELETE, 1366):** the button is enabled, then Confirm → "Stats reset: 15 questions cleared." Every row shows "0|-", the button is disabled with its tooltip, exactly one DELETE was sent, and there was no JS error.
- Screenshots of the line at 1024 and 1366 (enabled, focused and disabled) were checked: the text wraps to two lines in its column, and the button sits at the right end, with nothing clipped.

## Data restored
- At the start I took a snapshot (mysqldump) of `question_stats`, `settings` and `point_values`, a TSV of the 15 `question_stats` rows (the owner's counts) and MD5s of `logs/*`.
- The two real resets (curl with the login, and the browser end-to-end run) and the test POST each took a fresh TSV right before. After each, the table was rewritten from that TSV in one transaction.
- The rows were compared with the start snapshot after each restore, and were identical.
- The missing-table test renamed `question_stats` away for about a second and back.
- **Final check:** a new dump of `question_stats`, `settings` and `point_values` is **identical** to the start snapshot (`diff` empty). That is the same 15 owner rows with the same counts.
  - The table has its original name.
  - All 7 log files are byte-identical, and there is no new log file.
  - My servers on 8011 and 8013 were stopped. The test script and screenshots are in `%TEMP%\br-cr-reset`, outside the repo.

## Known limitations
- The reset cannot be undone. The confirm says so; a phpMyAdmin export (deploy step 2) is the only backup.
- It resets every question. A reset for one question is still FU-43.
- If the reset succeeds but the reload after it fails (for example the network drops), the reload's error is shown instead of the success line. The counts are gone either way; Reload or a page refresh shows them.
- The button needs the Sprint 11 table. Without it, the button stays hidden (and the API answers 503).

## Fix loop 1 (BUG-CR-01)

**Bug (Minor).** The line "Stats reset: N questions cleared." in `#question-stats-reset-msg` never cleared. It stayed through list reloads and question add, edit and delete, even when the rows showed attempts again.

**Fix (`js/admin.b5e5aba1.js`, edited in place):** a new `clearStatsResetSuccess()`, called from `renderQuestions()`.
- It clears the line only when it holds a success message (`msg-success`).
- The reset itself reloads the list *before* it shows the success line, so the line appears after a reset. The next render of the list clears it: a reload, add, edit (opening the form), delete, filter change or sort.
- An error message stays, as before, until the next reset clears it in `runAction()`.
- No HTML, CSS or API change.

**Re-tested** on my own `php -S localhost:8011`, headless system Chrome with the classic scrollbar, at 1366 and 1024 px. The question writes and the reset were mocked, except in the end-to-end run.
- **BUG-CR-01, 12 checks per width, all PASS:**
  - The success line is shown after the reset and is still there once it settles.
  - It is cleared by a filter change, a sort click, an add (mocked POST, then a real reload), opening Edit, and a delete (mocked).
  - An error (500) stays through a filter change and a sort.
  - Only mocked writes were sent, and there was no JS error.
- **Regression:** the earlier 47 checks per width all PASS, including the double-click guard (one confirm and one DELETE, the button disabled meanwhile), cancel, the errors, the old-API case and the layout. The real end-to-end reset passed 6 of 6: "Stats reset: 15 questions cleared.", every row at 0 / "-", the button disabled, and one DELETE.
- `node --check` passes, and the file is CRLF on every line.

**Data.** At the start of this loop I took a new snapshot: `question_stats` (the owner's same 15 rows), `settings` and `point_values`, plus the log MD5s.
- The real reset was restored right away from a TSV taken just before it, and the rows were identical.
- At the end the dump of the three tables was identical to the snapshot. `questions` still has 873 rows (the writes were mocked), and the 7 log files are unchanged.
- My port-8011 server was stopped. The test scripts (`ui-test.js` and `ui-fix1.js`) are in `%TEMP%\br-cr-reset`, outside the repo.

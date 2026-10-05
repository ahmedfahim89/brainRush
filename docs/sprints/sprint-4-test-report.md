# Sprint 4 - Test Report (Question, timer, scoring, results, persistence)

Tester: Senior Tester (game-tester). Date: 2026-10-05. Stories: US-08, US-10, US-11, US-12, US-13, US-14, US-15, US-16, US-17, US-27, plus the carry-overs from Sprints 2 and 3 (O-5, O-4 expose_php, O-1, O-2, O-3, `password.txt` deploy note).

## Summary

**Environment:** Windows 11, Git Bash, XAMPP.
- PHP 8.0.30 CLI and MariaDB 10.4 (local `mysqld` on 3306). Apache (`httpd`) was already running on port 80.
- Branch `sprint-4`, uncommitted working tree (`README.md`, `css/style.css`, `docs/deploy-hostinger.md`, `index.html`, `js/game.js` modified; `docs/sprints/sprint-4-dev.md` new). No PHP, SQL or `.htaccess` file changed (`git diff --stat` shows only those 5 files).
- Server: `C:/xampp/php/php.exe -S localhost:8000` from the project root. I also started a second one on port 8001 after the DB incident (see ENV-4-01). Both were stopped at the end.
- UI driven in the in-app Browser pane on `http://localhost:8000/` and `/admin.html`. Real clicks were used for opening a cell, Show Answer and Back to Board (which also unlock audio). The rest of each flow was driven with `element.click()` and form events on the live page, with `window.confirm` / `window.alert` replaced by recorders and `error` / `unhandledrejection` collectors installed. The pane is about 800x600, so layout checks at 1366x768 and 1920x1080 used same-origin `srcdoc` iframes of those sizes, measured with `getBoundingClientRect` / `scrollWidth` / `scrollHeight`, plus scaled screenshots.
- Admin writes were accepted from localhost without credentials, so test data was created with `curl`.
- Test data used: obvious names (`Ann`, `Bob`, `Cy`, `Di`, `Ed`, `Flo`, `Solo`) and the XSS string `<img src=x onerror=alert(1)>` as a category, question, answer and contestant name.

| Result | Count |
|---|---|
| PASS | 55 |
| FAIL | 0 |
| PENDING | 1 (hosted site `/password.txt`, no hosted URL) |
| Environment incident | 1 (ENV-4-01: MariaDB InnoDB hang, recurrence of the Sprint 3 incident) |
| Not run, by instruction | 1 (`/password.txt` through `php -S`) |
| Observations (non-blocking) | 6 |

Application bugs: 0 Critical, 0 Major, 0 Minor. No application code was modified and nothing was committed.

**Attention, DB left not fully restored.** The incident ENV-4-01 left one test row in the dev database: point value 1000 (id 22) with no questions. Until it is removed, no category is playable (`categories.php?playable=1` returns `[]`) and Setup shows the "Not enough playable categories" message. See Cleanup for the recovery steps.

## Static checks

- `php -l` (PHP 8.0.30) on all 8 files in `api/`: no syntax errors. No PHP file changed in Sprint 4.
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval(`, `new Function` and `http(s)://` in `js/*.js`, `index.html`, `admin.html` and `css/style.css`: the only hits are the comments at `js/game.js:4` and `js/admin.js:2`. All DOM building goes through `h()` (`createElement` + `textContent` / `setAttribute`, `js/game.js:107`), `createTextNode`, and `style` properties set from the fixed palette.
- Network use: `apiGet()` (`js/game.js:157`) is the only `fetch`, with no method or body (GET only), so the game still works on the hosted site without the admin login.
- Hard-coded board values: none in `js/game.js`. The remaining literals are spec/UI limits: modes 6 / 4 (`MODES`, line 20), the 6-color palette, `NAME_MAX = 30` (D-22), and the timer range read from the input's `min`/`max`. Board columns, rows, labels and the point step all come from the API payload.
- `css/style.css`: `.board` has no `--cols` / `--digits` fallbacks (lines 322-348; JS sets `--cols`, `--rows`, `--digits` inline). `.msg` has `overflow-wrap: anywhere` (line 114).
- Credentials: `git check-ignore -v` shows `api/config.php` at `.gitignore:1` and `password.txt` at `.gitignore:6`. `git ls-files api` lists `config.example.php` and no `config.php`. I did not open `api/config.php` or `password.txt`. No credential-like text in `js/game.js`, `index.html`, `css/style.css`, `README.md` or `docs/deploy-hostinger.md`.
- "Quit" appears nowhere in `index.html`, `js/`, `css/` or `README.md`.
- PHP server log (port 8000 and 8001): no PHP warnings, notices or deprecations. The only 5xx is the lock wait timeout caused by ENV-4-01 (see below).

## Acceptance criteria

"Runtime" means executed against real API data on PHP 8.0.30 / MariaDB 10.4 in the browser. "Injected" means a saved game written to `localStorage` to reach a state the seed data cannot produce.

| # | Story | Criterion | Result | Evidence |
|---|---|---|---|---|
| 1 | US-08 | Correct contestant X: cell disabled, filled with X's color, X's name in small text | PASS | Bob correct on Geography 100: cell `disabled`, computed `rgb(62, 123, 250)` (Bob's blue), `background-image: none`, text "100 / Bob", `aria-label` "Geography, 100 points, won by Bob", owner name has `text-overflow: ellipsis`, no child elements in the name (no HTML). Also verified with 6 players (36 cells, each colored by owner). |
| 2 | US-08 | Nobody correct: cell disabled and grey | PASS | Science 200 opened and closed with no marks: `rgb(75, 81, 99)`, muted text, `aria-label` "no correct answer", saved as `{owner: null}`. |
| 3 | US-08 | Click on a disabled cell does nothing | PASS | Clicking the used Geography 100 cell kept the Board screen. `openQuestion()` also guards used cells and a non-board screen (lines 949-954). Clicking another cell while a question was open did not change the question. |
| 4 | US-10 | End Game with unused cells: confirm, then Results; unused cells ignored | PASS | Confirm text "End the game now? 23 questions have not been played and will be ignored." (plain text). Accepting showed Results (3 rows, correct order), focus on New Game, saved screen `results`. |
| 5 | US-10 | Cancel on the confirm keeps the game | PASS | Cancel: Board still shown, saved screen `board`, state unchanged. |
| 6 | US-10 | Last cell used (5x5): End Game prominently offered | PASS | At 24/25 no offer. After the 25th: "All 25 questions have been played." with "End Game and show results"; focus moved to that button; the button went to Results. |
| 7 | US-10 | Same on a 6x6 board (D-01), and the offer survives a refresh | PASS | 6 players, 6 categories x 6 rows (100..1000, from real data): hidden at 35/36, "All 36 questions have been played." at 36/36, banner still shown after a page refresh, 36 disabled cells. |
| 8 | US-10 | Same on a 1-column board (D-01, any size) | PASS | N=1: 1 x 6 board, 6 cells, `--cols` 1, `--rows` 6, no horizontal scroll, "All 6 questions have been played." after the last cell. |
| 9 | US-10 / D-09 | Developer choice: with every cell used, both End Game buttons skip the confirm | PASS | Banner button (5x5) and the top End Game button (6x6): 0 confirms, straight to Results. See PO review. |
| 10 | US-11 | Unused cell opens a question screen: "<Category> – <points>" (en dash), large question text, answer hidden | PASS | Real click on Geography 100: heading "Geography – 100" (U+2013), text "What is the capital city of France?" at 41 px (1366 wide) / 51 px (1920), answer block hidden, "Show Answer" visible, focus on the heading. |
| 11 | US-11 | "Show Answer" reveals the stored answer | PASS | Real click: "Paris" shown, button hidden, focus on the answer, `answerShown` saved. |
| 12 | US-12 | Countdown starts automatically at T (game override 20 s), number and shrinking bar | PASS | Setup timer 20 gave "Timer 20 s" in the board info; the question started at 20 with bar `scaleX(1)`, about 15 after 5 s, `scaleX(0.73)` at 5.3 s. |
| 13 | US-12 | Number and bar red at remaining <= T/3 | PASS | After Reset, not red at 6.7 s left; turned red at 13.44 s elapsed (6.56 s left, bar `scaleX(0.33)`). Number `rgb(255, 107, 107)` and bar the same, versus gold `rgb(245, 197, 24)` before. |
| 14 | US-12 / D-03 | At 0: beep (Web Audio), timer stops at 0, scoring buttons stay usable | PASS | After a gesture: value 0, "Time's up!", bar `scaleX(0)`, Pause disabled, exactly 1 oscillator started (hooked `createOscillator`/`start`), still 1 two seconds later, all 6 scoring buttons still enabled, nothing auto-scored or closed. The audible output itself cannot be heard from the test harness; the beep code only runs when the `AudioContext` state is `running`. |
| 15 | US-12 | Pause stops, Resume continues from the same value | PASS | Paused at 15: value and bar identical after 3 s, button reads "Resume". After Resume it counted on (13 after 2 s). The 0 was reached at 23.0 s = 20 s + 3 s pause. |
| 16 | US-12 | Reset returns to T and runs (also from 0, and re-arms the beep) | PASS | Reset while running and from "Time's up!": value back to 19-20 within 1.2 s, "Time's up!" cleared, Pause enabled again, not red. Two separate resets each produced their own beep. |
| 17 | US-12 / D-04 | Known limitation: refresh with no click afterwards, the beep is silent | PASS (documented) | Refresh mid-question, no gesture: at 0 "Time's up!" shown, 0 oscillators created, no console warning or error. Matches the dev note and the README. See PO review. |
| 18 | US-13 | Back to Board stops the timer, marks the cell used (colored or grey), shows the board | PASS | Real click: Board shown, cell colored (row 1) or grey (row 2), "Played 1 of 25", scores kept (Ann −100 / Bob 100 / Cy −100), timer stopped (no tick after leaving). |
| 19 | US-14 | Row per contestant in their color with "✓ Correct (+p)" and "✗ Wrong (−p)" | PASS | 100-pt and 300-pt questions: "✓ Correct (+100)" / "✗ Wrong (−100)" and "(+300)" / "(−300)" (U+2212 minus), name chip and left border in the contestant color, current score shown. |
| 20 | US-14 | Wrong for A: score drops (may go below 0), both of A's buttons disable | PASS | Ann 0 → −100, A's buttons disabled, B and C's four buttons still enabled; the mark stays highlighted (red). |
| 21 | US-14 | Correct for B: score rises, B becomes owner, B's buttons disable, every other Correct disables | PASS | Bob 0 → 100, B disabled, C's Correct disabled; closing gave Bob's colored cell. |
| 22 | US-14 / D-08 | Wrong still allowed for an unscored contestant after a Correct | PASS | Cy marked Wrong after Bob's Correct: −100; focus then moved to Back to Board. |
| 23 | US-14 | Each contestant scored at most once; at most one Correct; no undo | PASS | Disabled Correct C / A's buttons ignored clicks (scores unchanged); saved marks `{1: wrong, 2: correct, 3: wrong}`. Code guards in `markContestant()` (lines 1043-1054) also block repeats. 6-player game: one Correct per question, never two. |
| 24 | US-15 | Results sorted by score descending with colors; the single top scorer highlighted | PASS | Bob 100, Ann 0, Cy −100: order correct, color swatch and left border per row, "Bob wins!", only Bob has the Winner badge / gold highlight. 6-player game: Cy 3000, Flo 2400, Ed 2200, Di 2100, Bob 1500, Ann 1400. |
| 25 | US-15 | Two share the top: both highlighted, "It's a tie between X and Y" | PASS | Ann 200, Bob 200, Di 100, Cy 0 → "It's a tie between Ann and Bob", both highlighted. |
| 26 | US-15 | Three or more: "X, Y and Z" | PASS | Three players at 0 → "It's a tie between Ann, Bob and Cy", all three highlighted. |
| 27 | US-15 | Single contestant is the winner | PASS | "Solo wins!" with the Winner badge. |
| 28 | US-15 / D-10 | All-zero and all-negative ties are co-wins | PASS | All 0 (row 26), and Ann −100 / Cy −100 / Bob −300 → "It's a tie between Ann and Cy". |
| 29 | US-15 | Developer choice: shared ranks 1, 1, 3, setup order for equal scores | PASS | Ranks "1.", "1.", "3.", "4." in row 25 and "1.", "1.", "3." in row 28. See PO review. |
| 30 | US-16 | New Game clears the saved game and shows an empty Setup with current settings (D-15) | PASS | After New Game: `localStorage` key `null`, 1 empty entry, Players mode, timer 30, 0 categories ticked. With `categories_per_game` changed to 6 through the API while on Results, New Game showed "Select 6 categories" and 7 playable categories (settings and categories reloaded). |
| 31 | US-17 | Refresh on the board restores board, used cells/colors, contestants, scores, timer length | PASS | After reload: 2 used cells (blue and grey), scores 0 / 100 / −100 (including a manual + correction), names (incl. the XSS name as text), "Timer 20 s", "Played 2 of 25". |
| 32 | US-17 / D-04 | Refresh with a question open: same question, scoring preserved, timer restarted at full length | PASS | Reloaded mid-question (answer shown, 3 marks): same "Geography – 100", scores −100 / 100 / −100, the 3 marks still highlighted and disabled, answer still shown, timer counting down from 20 (15 five seconds after load). Injected question save: timer showed 20 right after load. |
| 33 | US-17 | Refresh on Results shows Results again | PASS | Results, 3 rows, same winner text, after reload. |
| 34 | US-17 | No saved game, or corrupt data: Setup, no JS error | PASS | No save: Setup (fresh load and New Game). 47 injected variants run in iframes, 0 JS errors, every invalid variant removed the key and showed Setup (see row 45 for the list). |
| 35 | US-17 | Developer choice: Sprint 3 (v1) board save is migrated | PASS | v1 board save restored to Board and rewritten as `version: 2`; a v1 save with `screen: results` was discarded. |
| 36 | US-27 | Category / question / answer / contestant name `<img src=x onerror=alert(1)>` in the game shows as text | PASS | Real data: category, question, answer (`<b>bold</b><img ...>`) and a player name. Board header, question heading, question text, answer, scoring rows, scoreboard, owned cell and Results all literal. `document.querySelectorAll('img').length` = 0, `<b>` count 0, alert recorder empty, error collector empty. |
| 37 | US-27 | Same in admin | PASS | `/admin.html` with the XSS category and question: literal in the categories table, coverage grid, filter option and questions table (22 literal occurrences, 0 `img`, 0 `b`), no alert. |
| 38 | US-27 | Data rendered through `textContent` / DOM APIs, never `innerHTML` | PASS | See Static checks. |
| 39 | Focus | 7 players / 5 teams blocked | PASS (code review) | `addEntry()` returns at the mode limit and `renderMode()` disables Add and blocks Start (`js/game.js:506`, `422-435`); the setup code is unchanged from Sprint 3 where it passed at runtime (rows 2-4 there). `loadState()` also rejects 5 teams (row 45). |
| 40 | Focus | Spec verification step 4 end to end | PASS | 6 players, 6 categories, 6 rows (100..1000): wrong and correct marks, cell colors and grey cells, refresh on board and mid-question, finish the board, results with winner and tie text. Timer at 20 s was exercised in the 5x5 game, row 12-16. |
| 41 | Carry-over O-5 | Admin at 1024 px: 100-character unbroken category name, success message wraps, no horizontal scroll; then delete | PASS | 1024 px iframe of `admin.html`: message height 91 px, `overflow-wrap: anywhere`, `scrollWidth` = `clientWidth` = 1009, also after the delete message. Added and deleted through the admin UI (confirm stub accepted). |
| 42 | Carry-over O-4 (Sprint 2) | README mentions `expose_php=Off` | PASS | `README.md:78-80`, section "Hosting hardening": `expose_php = Off`, hides `X-Powered-By`; Hostinger path hedged ("if listed, or ask support"). |
| 43 | Carry-over O-1 | `.board` has no `--cols` / `--digits` fallbacks; 5x5, 6x6 and 1-column boards render | PASS | CSS has only a comment (line 342). 5x5 (5 columns), 6x6 (6 columns, 36 cells) and 1 x 6 (958 px wide cells, label 44 px, no scroll) all rendered. |
| 44 | Carry-over O-2 / D-21 | No "Quit to setup" anywhere; every route out of a game asks for confirm or goes through Results | PASS | No Quit text or handler. Routes: End Game (confirm while cells are open, Results otherwise) then New Game; refresh restores the game (Board / Question / Results); the Admin header link leaves the page but the saved game is restored on return. No path clears `localStorage` except New Game and discarding corrupt data. |
| 45 | Carry-over O-3 / D-22 | Empty/whitespace name or 31 characters: Setup, no console error; 30 characters restores | PASS | 30 characters restored to Board. Discarded with 0 JS errors: 31 characters, empty, whitespace-only, duplicate names ignoring case (`Ann` / ` ann `), name as object, `null` contestant, string score, float score, timer 3 and 601, descending points, a missing question, duplicate colors and category ids, no contestants, no categories, 5 teams, `mode` = `__proto__`, bogus used key, non-canonical key `01:100`, unknown owner, owner as string, `used` as array / missing / cell `null`, question screen without `current`, board with `current`, `current` on a used cell, two Corrects, bad mark value, mark for an unknown contestant, `marks` null, `answerShown` string, v1 with results, version 3, invalid JSON, `null`, `[]`, `"x"`, `42`, empty string. 47 of 47 variants gave the expected screen, 0 errors. `screen: setup` in a save is also discarded. |
| 46 | Carry-over O-4 (Sprint 3) | Visual check of Setup, Board, Question, Results at 1366x768 and 1920x1080 | PASS (with observations) | No horizontal scroll on any of the 10 screen/size combinations. Board 5x5 and 6x6, question (typical), results and 1920 setup fit; see OBS-2 to OBS-4 for the vertical-scroll cases. Screenshots of a 6x6 board with 6 players (owned and grey cells, 1000 labels), the question screen (answer shown, 6 rows, marks) and Results were reviewed. |
| 47 | Security | `.htaccess` blocks `password.txt` (RewriteRule + FilesMatch) | PASS | `.htaccess:36` `RewriteRule ^password\.txt$ - [F,L]` and `.htaccess:43` FilesMatch list includes `password\.txt`. I read only `.htaccess`, never `password.txt`. |
| 48 | Security | `docs/deploy-hostinger.md` lists `password.txt` as never uploaded and `.htaccess` as required | PASS | Table row "**`password.txt`** ... (never, under any name)", "Build the zip from the left column only", "**`.htaccess` must be uploaded**", Git deployment note that it is git-ignored, the `/password.txt` 403/404 smoke item, and the redeploy notes. |
| 49 | Security | Apache (already on port 80): `/password.txt` and other private paths return 403, status only | PASS | `http://localhost/BrainRush/` is a separate checkout under `C:\xampp\htdocs\BrainRush` (branch `us-29-sprint2-record`, not this working tree) whose `.htaccess` is byte-identical to this one. Status-only `curl -s -o /dev/null -w "%{http_code}"`: `password.txt`, `PASSWORD.TXT`, `password.txt%20`, `api/../password.txt` (with `--path-as-is`), `README.md`, `sql/schema.sql`, `docs/spec.md`, `api/config.php`, `api/db.php`, `.git/config`, `css/` all 403; `index.html` 200. No response body was printed. |
| 50 | Security | Hosted site `/password.txt` returns 403 or 404 | PENDING (hosted) | No hosted URL available. The owner runs it with the deploy guide's smoke test after the redeploy. |
| 51 | DoD | `php -l` passes on all PHP | PASS | 8 / 8 files. |
| 52 | DoD | `api/config.php` and `password.txt` git-ignored and untracked | PASS | See Static checks. |
| 53 | DoD | No hard-coded board size, points or timer; no credentials outside `api/config.php` | PASS | See Static checks. |
| 54 | DoD | Game endpoints work (GET only) | PASS | `settings.php`, `points.php`, `categories.php`, `categories.php?playable=1` and `questions.php?board=1&categories=...` answered 200 with the expected data in every game start (about 12 games). Game start with ids in tick order returned the matching board. |
| 55 | DoD | Console free of JS errors | PASS | `error` / `unhandledrejection` collectors recorded 0 events across about 150 flows on `index.html` and `admin.html`, and `read_console_messages` returned no entries on both pages (no autoplay warning either). |
| 56 | Re-run | PENDING (environment) checks from Sprints 1-3 | PASS | None are open: the Sprint 1-3 reports and the hosting report each end with 0 PENDING (the hosted rows were closed there). Nothing to re-run. |

**Environment incident, not counted:** see ENV-4-01.

**Not run, by instruction:** `/password.txt` through `php -S` (it ignores `.htaccess` and would serve the file). Rows 47-49 cover it statically and through Apache.

## Review of the developer's open choices (for PO)

| Choice in the dev note | Tester assessment |
|---|---|
| The revealed answer stays shown after a refresh (`answerShown` saved) | Works as described (row 32). Spec only requires scoring to be kept (D-04). Low risk. PO to confirm. |
| End Game skips the confirm when every cell is used | Works (row 9). D-09 asks for a confirm only for ending early. PO to confirm. |
| Shared ranks 1, 1, 3 and setup order for equal scores | Works (rows 25, 28, 29). Not in the spec. PO to confirm; the alternative is 1, 2, 3 with only the highlight showing the tie. |
| Sprint 3 saves are upgraded (v1 to v2) | Works (row 35), only for a v1 board save. Matters only for games running on the staging site at redeploy. |
| Beep silent after a refresh with no click | Reproduced (row 17). Browser autoplay policy. The visual "Time's up!" still appears and the README says so. Not fixable in code without a user gesture. PO to accept as a known limitation, or add a "click to enable sound" hint if wanted. |

## Observations (not bugs)

- **OBS-1 (cosmetic):** a grey (unanswered) cell shows its points label larger than an owned cell's label, because owned cells use 70% size to fit the owner's name. Visible in the 6x6 screenshot; both are readable and rows keep equal height.
- **OBS-2:** a 6x6 board with 6 players at 1366x768 has a 22 px page scroll (document 790 px, scoreboard bottom 756 px; dev note says 744 px and a fit). With the "all played" banner on screen the scoreboard sits below the fold (document 903 px), as the dev note admits. At 1920x1080 everything fits.
- **OBS-3:** question text above about 110 characters at 1366x768 makes the left (question) column taller than the screen, so the page scrolls vertically. A typical 81-character question with a short answer fits (document 768 px). The Back to Board button in the right column stays at y = 598. The API allows 5000 characters, so extreme texts scroll regardless. The dev note's worst case of 643 px is not reproducible with a 141-character question (751 px) or a 246-character question with a 243-character answer (1138 px).
- **OBS-4:** Setup at 1366x768 needs a vertical scroll to reach Start Game (Start bottom at 928 px) with 6 categories and a player entry. Normal for a form, and fits at 1920x1080.
- **OBS-5:** `php -S` serves every file in the project folder, including the git-ignored `password.txt` in the web root. `.htaccess` protects Apache and the hosted site, not `php -S`. The developer already recommends moving the file out of the project folder, and the README warns about it. I support that recommendation (not tested by design).
- **OBS-6:** the XAMPP Apache serves a separate older checkout (`C:\xampp\htdocs\BrainRush`, branch `us-29-sprint2-record`), not this working tree. Row 49 therefore proves the (identical) `.htaccess` rules, not this branch's files. Do not read it as an end-to-end Sprint 4 check on Apache.

## Environment incident ENV-4-01 (MariaDB InnoDB hang; Sprint 3 incident recurred)

Not an application bug, recorded as the plan requires.
- While cleaning up, `DELETE /api/points.php?id=22` (point value 1000) never returned. All earlier deletes (12 questions, 1 category) had succeeded in the same minute.
- `SHOW FULL PROCESSLIST` showed one connection (`DELETE FROM point_values WHERE id = ?`, thread 481) in state "Updating" for over 12 minutes, holding 1 row lock, with no lock wait. `SHOW ENGINE INNODB STATUS` showed its OS thread waiting more than 400 s for an X-latch on a buffer-pool page that another writer holds in SX mode (`buf0flu.cc:1140`, page flushing). The error log shows repeated "A long semaphore wait" warnings and an InnoDB Monitor dump.
- Reads and other pages still work. A later `DELETE` of the same row from the second server (port 8001) hit the 50 s lock wait timeout and the API logged an HTTP 500 with the SQL error only in the server log (no DB details in the response path I could observe).
- `KILL 481` marks the thread "Killed" but it cannot leave the latch wait. The process `mysqld` was not stopped or restarted by me. I used the MariaDB command-line client without a password as the local `root` account for diagnostics only (read-only, plus the one `KILL` of my own stuck query).
- Recommendation (same as the Sprint 3 note): restart MariaDB from the XAMPP control panel, and check the antivirus exclusion for `C:\xampp\mysql\data`.

## Cleanup

Test data created and removed:
- 6 questions at 1000 points for categories 1-6, the XSS category (id 30) with its 6 questions, and the 100-character category: all deleted (API 200; the 100-character one through the admin UI).
- `categories_per_game` was set to 6 and 1 for the 6x6 and 1-column tests, and set back to 5 (timer 30) through the API.
- Browser `localStorage["brainrush.game"]` cleared. Servers on ports 8000 and 8001 stopped.

**Still to do (blocked by ENV-4-01):** delete the point value 1000 (id 22, `question_count` 0). After restarting MariaDB, either use the admin page (Point values, delete 1000, confirm) or `DELETE /api/points.php?id=22`. Until then the board rows are 100-500 plus an empty 1000 row, so no category is playable.

Verified by API afterwards: settings 5 / 30; categories Geography, History, Movies, Science, Sports, Technology with 5 questions each; point values 100, 200, 300, 400, 500, and the leftover 1000. Auto-increment counters advanced (harmless). No git command that modifies anything was run; the working tree is unchanged by testing (only this report is added).

## Bugs

None found (0 Critical, 0 Major, 0 Minor).

## Verdict

**READY FOR PO**, with conditions that are not code defects:
- 55 / 55 runnable checks pass (US-08, US-10, US-11, US-12, US-13, US-14, US-15, US-16, US-17, US-27 and the carry-overs O-1, O-2, O-3, O-4 and O-5). 0 FAIL, 0 open bugs.
- PENDING: hosted `/password.txt` must be 403 or 404 on the live site (owner, after the redeploy). Local Apache returned 403 for all private paths.
- Before the next session: restart MariaDB and delete the leftover point value 1000 (see Cleanup).
- Six observations (OBS-1 to OBS-6) and the five open choices above are for the PO to review.

## Product Owner acceptance

Date: 2026-10-05. Inputs: backlog, sprint plan (Sprint 4 + DoD), dev note, this report. Spot-checked `js/game.js` (End Game confirm, v1 migration, rank code).

| Story | Verdict | Reason |
|---|---|---|
| US-08 Answered cell state and color | ACCEPTED | Rows 1-3: owner color + name (as text), grey when nobody was correct, disabled cells ignore clicks. |
| US-10 End game | ACCEPTED | Rows 4-9: confirm with count, Cancel keeps the game, offer at 5x5 / 6x6 / 1-column (D-01) and it survives a refresh. Quit removed (row 44, D-21). |
| US-11 Open a question | ACCEPTED | Rows 10-11: "Category – points", large text, answer hidden until Show Answer. |
| US-12 Countdown timer | ACCEPTED | Rows 12-17: override T, red at <= T/3, one beep + stop at 0 with scoring usable (D-03), Pause/Resume/Reset. Silent beep after refresh with no click accepted (D-29). |
| US-13 Back to board | ACCEPTED | Row 18: timer stops, cell colored/grey, scores kept. |
| US-14 Correct / Wrong | ACCEPTED | Rows 19-23: +/-p, negatives, single Correct, Wrong after Correct (D-08), once per contestant, no undo. |
| US-15 Results and winner | ACCEPTED | Rows 24-29: sorted, colored, single winner, 2-way / 3-way tie text, single contestant, zero/negative ties (D-10), shared ranks (D-27). |
| US-16 New game | ACCEPTED | Row 30: storage cleared, empty Setup, settings and categories reloaded (D-15). |
| US-17 Survive page refresh | ACCEPTED | Rows 31-35, 45: board, question (marks, answer state, timer restart) and results restored; 47 corrupt variants go to Setup with 0 errors; v1 upgrade (D-28). |
| US-27 XSS protection | ACCEPTED | Rows 36-38: payload literal in game and admin, 0 `img`, no alert, no `innerHTML` with data. |

Carry-overs: O-1, O-2, O-3, O-5, O-4 (Sprint 2, `expose_php`) and the US-29 deploy-guide `password.txt` note: **done** (rows 41-44, 47-48). O-4 (Sprint 3 visual check): **done**, with observations ruled below. Hosted `/password.txt` (row 50): **open as FU-01**. The owner runs it in the smoke test after the redeploy and records the result here. It does not block Sprint 4 stories (it is a US-29 follow-up), but the redeploy is not complete until it passes.

DoD met (rows 51-55; 0 open bugs; dev note present).

**Rulings on the developer's open choices**
1. Answer stays shown after a refresh: **accepted** (D-25).
2. End Game skips the confirm on a full board: **accepted** (D-26).
3. Shared ranks 1, 1, 3: **accepted** (D-27).
4. Sprint 3 saves upgraded: **accepted** (D-28).
5. Silent beep after refresh with no click: **accepted as a known limitation**, no extra prompt (D-29).

**Observations**
- OBS-1 grey label larger: FU-05 (Could).
- OBS-2 6x6 + 6 players scrolls 22 px at 1366x768: FU-03 (Should). Scroll with the "all played" offer shown is acceptable (D-30).
- OBS-3 long questions scroll at 1366x768: acceptable per D-30; FU-04 (Could) to scale the font.
- OBS-4 Setup scrolls at 1366x768: acceptable, no follow-up (D-30).
- OBS-5 `php -S` serves `password.txt`: FU-02 (Must, owner): move the file out of the project folder.
- OBS-6 Apache serves an older checkout: FU-07 (Could). Environment: ENV-4-01 cleanup is FU-06.

**Sprint 4 verdict: ACCEPTED (10 / 10 stories).** Open: FU-01 (hosted check) and FU-02 / FU-06 (owner actions).

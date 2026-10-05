# Sprint 5 - Test Report (Polish: FU-03, FU-04, FU-05)

Tester: Senior Tester (game-tester). Date: 2026-10-05. Scope: follow-ups FU-03 (Should), FU-04 (Could) and FU-05 (Could) from `docs/product-backlog.md`, decision D-30, and OBS-1..OBS-3 of `docs/sprints/sprint-4-test-report.md`. Developer note: `docs/sprints/sprint-5-dev.md`.

## Summary

**Environment:** Windows 11, Git Bash, XAMPP.
- PHP 8.0.30 CLI and MariaDB 10.4. The PHP dev server was already running on `http://localhost:8000` (not restarted or duplicated).
- Branch `sprint-5`, uncommitted working tree. Application changes: `css/style.css` (42 lines changed) and `js/game.js` (14 lines added). `git diff --stat` shows no PHP, SQL, `index.html` or `.htaccess` change. The docs edits (`product-backlog.md`, `sprint-plan.md`, `sprint-4-test-report.md`) and `sprint-5-dev.md` were ignored as instructed.
- Browser: the in-app Browser pane has a fixed 1024x768 viewport (device pixel ratio 1.25) and no resize tool was available. Layout checks at 1366x768 and 1920x1080 (and the other sizes listed below) therefore used same-origin iframes of the exact size loading the real `/index.html`. Inside an iframe, `vh`, `vw`, media queries and `documentElement.scrollHeight` all refer to the iframe viewport, so the numbers are the same as in a real window of that size. Measurements: `getBoundingClientRect`, `getComputedStyle`, `scrollHeight`/`scrollWidth` against `clientHeight`/`clientWidth`.
- 6x6 boards: the dev database has only 5 point values (100-500) and `categories_per_game` = 5, so 6x6 and other board shapes were reached by writing synthetic v2 saved games (`{version: 2, screen, game}`) to `localStorage` before loading the iframe. **The database was not changed** (settings 5 / 30 and point values 100-500 before and after). The regression flow used the real API with a real 5x5 game.
- Baseline comparison: to judge "not worse than before" I rebuilt the Sprint 4 stylesheet in the page by reversing every hunk of `git diff css/style.css` on the current file, and ran the same saved games against both. The baseline reproduced OBS-1 (grey label 44.2 px vs owned 30.9 px) and OBS-2 (6x6 + 6 players: document 802 px at 1366x768), so it is a faithful "before".
- Test data: obvious names (`Team A` to `Team F`, `Category 1` to `Category 6`), generated text. No real personal data, no credentials. `password.txt` and `api/config.php` were not opened.

| Result | Count |
|---|---|
| PASS | 18 |
| FAIL | 0 |
| PENDING | 0 |
| Observations (non-blocking) | 7 |

Application bugs: 0 Critical, 0 Major, 0 Minor. No application code was modified and nothing was committed or pushed.

## Static checks

- `php -l` on all `api/*.php`: no syntax errors (and no PHP file changed in Sprint 5).
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval(`, `new Function`, `http(s)://` in `js/*.js`, `index.html`, `css/style.css`: only the two existing comments (`js/game.js:4`, `js/admin.js:2`). The new code sets `--q-scale` with `style.setProperty('--q-scale', String(number))` (`js/game.js:967`) and `data-screen` from the fixed `SCREENS` names (`js/game.js:390`). No data reaches markup.
- Hard-coded board values: none added. The new constants are `QUESTION_FULL_SIZE_CHARS = 150` and `QUESTION_MIN_SCALE = 0.5` (presentation tuning, not board size). CSS `--row-min`/`--row-max`/`--cat-h` are size limits; the number of rows and columns still comes only from inline `--cols` / `--rows` / `--digits` set by JS.
- Credentials: `git check-ignore -v` shows `api/config.php` (`.gitignore:1`) and `password.txt` (`.gitignore:6`) ignored; `git ls-files api` lists `config.example.php` and no `config.php`.
- Saved-game shape unchanged (still version 2, same keys): confirmed by the live flow below; `--q-scale` and `data-screen` are never saved.

## Acceptance criteria

"Viewport" means the iframe size. `docH` = `documentElement.scrollHeight`, "over" = `docH` minus viewport height. Label sizes are computed `font-size` of `.cell-points`.

| # | Item | Criterion | Result | Evidence |
|---|---|---|---|---|
| 1 | FU-03 | 6x6 board, 6 contestants, owned + grey + open cells, fits 1366x768 with no vertical scroll | PASS | docH **768** (over 0). Rows 62.6 px, board bottom 637.8, scoreboard bottom 751. Baseline (Sprint 4 CSS): docH 802, over 34 with this data. |
| 2 | FU-03 | Same at 1920x1080 | PASS | docH 1080 (over 0), rows at the 110.5 px cap, scoreboard bottom 1038. Also fits at 1920x900 (docH 900), 2560x1440 (1440) and 1280x720 (720). |
| 3 | FU-03 / D-30 | No horizontal scroll at any size | PASS | `scrollWidth - clientWidth` = 0 in every board, question, results, setup and admin case run: 1366x768, 1920x1080, 1366x650, 1366x600, 1280x720, 1024x768, 800x600, 600x800, 1920x900, 2560x1440. |
| 4 | FU-03 | Owned cells (owner names) and point labels stay readable; no content overflow in cells | PASS | At 1366x768, owned/grey label 27.9 px, owner name 14.2 px, open label 44.2 px. At 1920x1080: 30.9 / 16.1 / 44.2. `scrollHeight`/`scrollWidth` vs client size: 0 overflowing cells in every board case (about 20 cases x 2 sizes). Reads fine in the 1366x768 screenshot (names under labels, equal rows). See OBS-3 for the row-minimum case. |
| 5 | FU-03 | Robust to content: 29-30 character names, 3-line category headers, many columns, teams mode | PASS | 1366x768, each docH 768 (over 0): 30-character names (rows 58.5), long category names (rows 56.6), 8 columns x 6 rows, 4 teams. All 0 overflowing cells. Baseline for the same data: 852 and 838. |
| 6 | FU-03 | Boards with fewer rows/players do not look worse than before | PASS | 5x5 with 1, 3 and 6 players: docH 768; rows 76.8 px (baseline 73.7, docH 770). 6x3 / 4x3 with 2 players: rows 110.5 px (the same cap as before), scoreboard right under the board (bottom 681.4 px, identical to baseline at both sizes). 1x1 with label 10000: label 44.2 px, no overflow, scoreboard 443.4 (identical to baseline). 1x6, 6x6 none played, 35 of 36 played: docH 768. |
| 7 | FU-03 / D-30 | "All played" offer on a 6x6 board (scroll accepted per D-30) | PASS (with observation) | 1366x768: docH 774 (over 6; the dev note says 7), rows at the 2.75rem minimum (46.8 px). Baseline was docH 903 (over 135). 1920x1080: docH 1080. Acceptable per D-30. |
| 8 | FU-04 | Question of about 250 characters fits the question column at 1366x768, no page scroll | PASS | Typical text (words) with a short answer: 150 / 200 / 230 / 250 / 260 / 300 chars: docH 768 for all; column bottom 683 / 686 / 665 / 653 / 649 / 665. Font 41 / 35.5 / 33.1 / 31.8 / 31.2 / 29.0 px. Baseline: docH 819 (200 chars), 922 (250), 1024 (300). With a 60-character answer the column bottom is 699 at 250 chars (docH 768). |
| 9 | FU-04 | Short questions keep the large size | PASS | 20 / 81 / 120 / 150 chars: computed font 41 px at 1366 and 51 px at 1920, `--q-scale` 1 (identical to baseline, same column bottoms). 151 chars gives 40.9 px (smooth, no jump). |
| 10 | FU-04 | Same at 1920x1080 | PASS | 20 to 400 chars with a 10 or 60 character answer: docH 1080 in all 18 cases (fonts 51 px down to 31.2 px). |
| 11 | FU-05 | Grey (unanswered) cells use the same label size as owned cells | PASS | Computed `font-size` of `.cell-points`: grey = owned = **27.9 px** (1366x768, 6x6), **30.94 px** (1920x1080), 30.94 px on the real 5x5 board at 1024x768. Open cells stay 44.2 px. Baseline grey was 44.2 px (OBS-1 confirmed fixed). |
| 12 | Regression | Normal flow: setup, board, open question, timer, Correct / Wrong, back to board, End Game, results, New Game | PASS | Real API, 3 teams, 5 categories, timer 6 s. Started game: 5x5 board, 25 cells. Real click on Geography 100: `data-screen="question"`, heading "Geography - 100", countdown ran 6 to 0. Team A Wrong (-100), Team B Correct (+100), answer shown ("Paris"). Back to Board: `data-screen="board"`, cell owned by Team B ("100 / Team B"), "Played 1 of 25". Second cell opened and closed with no marks: grey, "Played 2 of 25". End Game (confirm accepted): Results "Team B wins!", order Team B 100, Team C 0, Team A -100. New Game: empty Setup, `localStorage` key removed. |
| 13 | Regression | Refresh persistence (board, question, results) | PASS | Reload mid-question: same question, marks and scores kept, answer still shown, timer restarted, `--q-scale` set. Reload on the board: 2 used cells, scores kept. Reload on Results: "Team B wins!". Saved game stays `{version: 2, screen, game}` (no `data-screen` or `--q-scale` in storage). |
| 14 | Regression | No console / JS errors | PASS | `error` and `unhandledrejection` collectors empty through the whole flow (page and iframes); `read_console_messages` empty on `index.html` and `admin.html`. |
| 15 | Regression | One-screen board layout is limited to the board screen | PASS | Setup, Question, Results show `body` display `block` and `data-screen` setup / question / results. Setup docH 905 at 1366x768 (identical to Sprint 4, form scroll acceptable per D-30) and 1080 at 1920. `admin.html`: no console errors, no horizontal scroll (docH 3505 / 3427, not changed). |
| 16 | Regression | Long question then short question: no stale font scale; board is back to one screen | PASS | 6x6 board in a 1366x768 iframe: open 250-char cell (31.7 px, docH 768), show answer (768), Back to Board (docH 768); open a 40-char cell (41.0 px, `--q-scale` reset), Back to Board (768). 11 used cells, owned/grey labels 27.7 / 27.7, no overflow, no error. |
| 17 | Regression | Results with 6 contestants | PASS (with observation) | 1366x768: docH 771 (over 3, already existing and disclosed, not in FU-03..05 scope; see OBS-5). 1920x1080: 1080. |
| 18 | DoD | `php -l` clean, no credentials in code, `api/config.php` and `password.txt` ignored, database unchanged | PASS | See Static checks. Settings and point values identical before and after. |

## Observations (not bugs)

- **OBS-1 (long answers, D-30):** answers are not scaled. At 1366x768 a 250-character question with a 120-character answer ends at 790 px (docH 807, over 39); at 150 characters with a 120-character answer docH is 837. With a 60-character answer (normal words) everything fits. Acceptable per D-30 and the dev note. An answer that is one unbroken 100-character word wraps by character and scrolls too.
- **OBS-2 (scale is based on length only):** two pathological cases still scroll at 1366x768. A 250-character string with no spaces (docH 948) and a short question with 20 line breaks (docH 1417, scale stays 1 because the text is short). Not realistic for a quiz question and outside the "about 250 characters" criterion. A 5000-character question is clamped at scale 0.5 (docH 2622) and scrolls, as expected.
- **OBS-3 (small windows, row minimum):** when the free height is below what a 6x6 board needs, rows stop at 2.75rem and the page scrolls (no overlap, 0 overflowing cells): 1366x650 over 23 (a windowed laptop browser), 1366x600 over 73, 1024x768 over 11. At the minimum, labels are 19 px and owner names 9.7 px, small but legible; at 1280x720 the board still fits (names 11.9 px). The dev note discloses this. Targets of D-30 are the full 1366x768 and 1920x1080 viewports, which pass.
- **OBS-4 (question screen narrower than 1366):** a 250-character question at 1024x768 gives docH 937 and at 800x600 docH 1029 (font 23.8 px and 21.1 px). Not a D-30 target; no horizontal scroll.
- **OBS-5 (Results, 6 contestants):** 3 px over at 1366x768 (docH 771). Existed before (Sprint 4), disclosed, not part of this sprint. The dev note suggests a small spacing trim if the PO wants it.
- **OBS-6 (more than 6 rows):** a 6-column x 8-row board with 6 players is 15 px over at 1366x768 (was 182 px). D-30 only promises up to 6 rows.
- **OBS-7 (environment):** the in-app Browser pane is 1024x768 and has no resize tool in this session, so the 1366x768 and 1920x1080 figures come from exact-size iframes. A last visual check on a real 1366x768 laptop window (with browser chrome) is left to the PO, see OBS-3 for what to expect.

## Cleanup

- Database: not changed.
- `localStorage["brainrush.game"]` removed (New Game and the harness cleanup); test iframes removed; no files created in the project other than this report.
- Browser pane left at its own 1024x768 viewport (it was never resized). No server was started or stopped.

## Bugs

None found (0 Critical, 0 Major, 0 Minor).

## Verdict

**READY FOR PO.**
- FU-03: PASS. The 6x6 board with 6 contestants now fits 1366x768 exactly (docH 768, was 802) and 1920x1080 (1080), with no horizontal scroll, readable labels and owner names, and no cell overflow. Smaller boards are unchanged or slightly better.
- FU-04: PASS. Questions of about 250 characters fit at 1366x768 and 1920x1080; short questions keep 41 / 51 px.
- FU-05: PASS. Grey and owned labels are the same size (27.9 px at 1366x768, 30.9 px at 1920x1080).
- Regression: the full game flow, refresh persistence and the console are clean.
- Known, accepted limits for the PO to confirm: long answers (OBS-1), the "all played" offer 6 px over (row 7), and small windows (OBS-3).

## FU-08 addendum: Results with 6 contestants fits 1366x768

Tester: Senior Tester. Date: 2026-10-05. Change under test: one CSS line, `line-height: 1.15` on `.result-score` (`css/style.css:627`). Dev note: FU-08 section of `docs/sprints/sprint-5-dev.md`. No JS, HTML or API change (`git diff --stat -- css js` shows only the two Sprint 5 files).

**Method.** Same as above: exact-size same-origin iframes (1366x768 and 1920x1080) of the real `/index.html`, loaded with synthetic v2 saved games in localStorage (database untouched; settings 5 / 30 and point values 100-500 before and after). For a baseline I injected `.result-score { line-height: inherit }` into the iframe, which restores the pre-FU-08 rule. Real-API flow done in the Browser pane. Names are obvious test names (`Team A`..`Team F`, generated 30-character strings).

| Result | Count |
|---|---|
| PASS | 10 |
| FAIL | 0 |
| Observations | 2 (both Minor, edge cases) |

| # | Criterion | Result | Evidence |
|---|---|---|---|
| F1 | Results, 6 contestants, one winner: no vertical scroll at 1366x768 | PASS | docH **768** (over 0), body height 713 px, New Game bottom 688. Result rows are 60.6 px (baseline 69.8 px). Slack to the viewport is about 55 px, so this is not a marginal fit. Baseline on the same data: body 768.1 px, so it sat on the edge (`scrollHeight` rounds to 768); I could not reproduce the 3 px over from Sprint 4/5 with this data, but the improvement is clear in the row height. |
| F2 | Same at 1920x1080, no horizontal scroll | PASS | docH 1080 in all 17 cases listed below; `scrollWidth - clientWidth` = 0 in every case at both sizes; 0 rows wider than their row. |
| F3 | 6 contestants with ties still fit 1366x768 | PASS | 2-way tie 768; 3-way tie **768** (baseline 818, 50 over); 6-way tie at 0 **768** (baseline 818); 6-way tie at -100 768. Headline height 98 px for the 2-line cases, New Game bottom 737. |
| F4 | 1-5 contestants, teams mode | PASS | 1, 2, 3, 4, 5 players: docH 768 at 1366 and 1080 at 1920, New Game bottom 334 / 404 / 475 / 546 / 617. 4 teams with a winner and with a 3-way tie, and 3 teams with 30-character names: 768 / 1080. |
| F5 | Winner / tie text and highlights (D-10) | PASS | Single: "Team D wins!", 1 row highlighted, 1 Winner badge. 2-way: "It's a tie between Team A and Team B", 2 highlighted. 3-way: "Team A, Team B and Team C", 3. All six at 0 and all six at -100: "... Team E and Team F", 6 highlighted (zero and negative ties are co-wins). 1 contestant: "Solo wins!". |
| F6 | Ranks and order (D-27) | PASS | Single winner 1-6. 2-way tie: ranks "1. 1. 3. 4. 5. 6."; 3-way: "1. 1. 1. 4. 5. 6."; all tied: six times "1."; 4 teams 3-way: "1. 1. 1. 4.". Sorted by score descending including -10000 / 12300 / 0 / 7 / -4500. Scores with minus sign (U+2212) and large values do not wrap. |
| F7 | Realistic 30-character names | PASS | Six 30-character names (letters and spaces/hyphen) with a single winner: docH 768 at 1366x768, 1080 at 1920; names stay on one line in rows (60.6 px). Three teams with 30-character names: 768. |
| F8 | Regression: 6x6 board, 6 players, owned / grey / open cells | PASS | 1366x768 docH **768**, scoreboard bottom 751, 0 overflowing cells; 1920x1080 docH 1080, scoreboard bottom 1038. Unchanged from the first run. |
| F9 | Regression: FU-05 and FU-04 | PASS | Owned = grey label: 27.9 px at 1366x768 and 30.9 px at 1920x1080 (open 44.2 px). Question 40 chars 41.0 px (51.0 at 1920), 150 chars 41.0 px, 250 chars 31.8 px (39.5 at 1920), `--q-scale` 1 / 1 / 0.775; docH 768 / 1080, no horizontal scroll. |
| F10 | Real-API flow to Results and New Game, no console errors | PASS | 6 contestants, 5 categories, timer 5 s, real clicks on Start Game and New Game. Played 4 cells (Team A and B Correct, Team C Wrong, one unmarked). End Game (confirm accepted) gave "It's a tie between Team A and Team B", ranks "1. 1. 3. 3. 3. 6.", Team C last at -100. Page refresh on Results restored the same screen. New Game cleared the saved game and showed an empty Setup. `error` / `unhandledrejection` collectors and `read_console_messages`: no entries. |

Cases run in F1-F7 (each at both sizes): 6p winner, 6p 2-way tie, 6p 3-way tie, 6p all tie at 0, 6p all tie at -100, 6p mixed large / negative scores, 6p 30-character winner, 6p 30-character 2-way tie, 6p 30-character W/M winner, 5p, 4p, 3p, 2p, 1p, 4 teams 3-way tie, 4 teams winner, 3 teams 30-character winner.

### Edge cases confirmed (observations)

| ID | Case | Measured | Severity | Assessment |
|---|---|---|---|---|
| OBS-8 | Two-way tie between two near-30-character names, 6 contestants | At 1366x768 the headline wraps to 3 lines (147.5 px, normal 2-line tie 98 px); docH **811** (over **43**, dev measured 46), New Game bottom 786. At 1920x1080 it fits (1080). Baseline was 866 (over 98), so FU-08 helps but does not cover this. | **Minor** | Requires two contestants who both have about 30-character names and tie for first, with a full 6-person table. Nothing is cut off: the page scrolls to the New Game button; no data loss, no horizontal scroll. Fix would need a headline scale like FU-04 (JS), outside the "trim spacing" scope. |
| OBS-9 | Six 30-character names made only of W and M | At 1366x768 names wrap inside the rows (row 89.5 px, headline 98 px); docH **935** (over **167**, dev measured 170). At 1920x1080 it fits (1080). Unchanged from the baseline (also 935), as FU-08 cannot help here. | **Minor (cosmetic)** | Worst-case glyph widths in all six names; not a realistic quiz setup. Names stay readable, 0 horizontal scroll, 0 rows wider than their row. |

Neither case is a defect of the FU-08 change, and neither is within D-30's promise (6 contestants with normal names). I recommend the PO accepts both as known limits, same class as OBS-1 and OBS-2.

### FU-08 notes
- Visual check by screenshot was not possible in this session (the pane was re-sized to about 366x698 by the environment and screenshots timed out), so the "looks right" check rests on the measured geometry: rank / swatch / name / badge / score rows have equal heights (min = max = 60.6 px in every case), highlights and badges counts are correct, and no row overflows. The developer reports a visual review of the 6-player and 2-way-tie screens.
- Cleanup: database not changed; `localStorage["brainrush.game"]` empty (New Game); test iframes removed; the temporary section file was written outside the project. I did not resize the viewport.

### FU-08 verdict

**READY FOR PO (FU-08 PASS).** 10 of 10 checks pass, 0 bugs, 2 Minor observations (OBS-8, OBS-9) for the PO to accept as limits.

## PO acceptance

PO, 2026-10-05. Sprint 5 (polish) is **accepted**.

| Item | Verdict | Reason |
|---|---|---|
| FU-03 | ACCEPTED | 6x6 + 6 contestants fits 1366x768 (docH 768, was 802) and 1920x1080 with no horizontal scroll and no cell overflow. It also holds with 30-character names, 3-line headers and teams. Smaller boards are unchanged or better (rows 1-6). The "all played" offer is 6 px over, which D-30 allows (row 7). |
| FU-04 | ACCEPTED | Questions of about 250 characters fit at 1366x768 and 1920x1080, and questions of 150 characters or fewer keep the full size (rows 8-10, 16). Long answers (OBS-1) and pathological text (OBS-2) may scroll, which D-30 allows. |
| FU-05 | ACCEPTED | Grey labels are the same size as owned labels at both target sizes (row 11). Fixes OBS-1 from Sprint 4. |

No regressions: game flow, refresh persistence and the console are clean, and the saved-game shape is unchanged (rows 12-15, 18).

Accepted limits: OBS-1, OBS-2, OBS-3, OBS-4 and OBS-6 fall within D-30. D-30 now says the sizes mean the browser viewport.

New follow-ups in `docs/product-backlog.md`:
- FU-08 (Could): Results with 6 contestants is 3 px over (OBS-5).
- FU-09 (Could, owner): a real laptop window check (OBS-7).

### FU-08 (added 2026-10-05)

| Item | Verdict | Reason |
|---|---|---|
| FU-08 | ACCEPTED | Results with 6 contestants fits 1366x768 (docH 768) and 1920x1080, with about 55 px to spare (F1-F2). Ties of 3 or more also fit now (818 to 768, F3). Ranks and winner/tie text follow D-10 and D-27 (F5-F6). The board and FU-04/05 show no regression, and the real flow has no console errors (F8-F10). |

- **OBS-8 and OBS-9:** both accepted as known limits. D-30 now says that on Results, long names that wrap the headline or the rows may cause a vertical scroll. Neither case is realistic, nothing is cut off, and there is no horizontal scroll. Fixing them would need headline scaling in JS, which isn't worth it. No new follow-up.
- **Visual check:** the tester could not take screenshots. The developer's visual review and the tester's measurements (equal row heights) are enough for this one-line change. FU-09 now includes a look at the Results screen.

# Test report: CR FU-44 / FU-59 (branch cr-fu44-fu59, uncommitted)

Environment: Windows 11, PHP 8.0.30 (`php -S localhost:8000`, already running, left running), MariaDB (XAMPP, already running), Chrome-based browser pane, DPR 1.25. Widths emulated with same-origin iframes of `/admin.html` (media queries evaluate against the iframe width). Admin opens without login on localhost. No code modified. No PHP file changed (no `php -l` needed).

Counts: PASS 27, FAIL 0, PENDING 1, observations/bugs 3 (all Minor).

## FU-59 (375, 601, 700, 800 px)

| Check | Result | Evidence |
|---|---|---|
| Questions/Reports/Streaks/Logs render as cards with column labels, 375 | PASS | thead hidden (Questions keeps sort bar); every body cell has data-label (0 unlabelled, 0 hidden cells) |
| No sideways scroll, all 5 tables, 375/601/700/800 | PASS | table width = wrap width = scrollWidth (278 / 492 / 591 / 691); page scrollWidth <= viewport |
| Every column's data reachable | PASS | 0 cells hidden, 0 cells outside the wrap, at all 4 widths |
| Table buttons >= 40 px (Edit, Delete, Resolve, Dismiss, Edit question, streak Delete, log link, category buttons, sort buttons) | PASS | min 40 px at 375/601/700/800; sort buttons 40 px |
| Points list, Reload, Reset all stats >= 40 px at 375 | PASS | 0 buttons under 40 px at 375 (Points Disable/Enable/Delete 40) |
| Same buttons >= 40 px at 601/700/800 | PASS with note | 29 px at 601-800 (Points, Reload x3, Reset all stats). Matches the dev note and CSS (`max-width: 600px` only), but your request listed 601-800 too; see OBS-1 |
| Categories: no sideways scroll 375-800, FU-55 cards | PASS | 278/278, 492/492, 591/591, 691/691; Rename/Delete/Save/Cancel 40 px |
| Add form stacked <= 600, one row above | PASS | 375: 3 controls stacked, full width, 42 px tall. 601 and 800: flex-wrap nowrap, controls on the same row |
| Questions sort (Attempts, % correct) at 375 | PASS | order changed (0% first ascending, then attempts descending), aria-sort ascending/descending |
| Edit, Cancel edit, Save at 375 (TEST row) | PASS | card gets is-editing gold tint; Cancel clears it; Save changed answer, message "Question updated (AI - 100)." |
| Delete question (TEST row) | PASS | row removed (9 to 8) |
| Reports Resolve and Dismiss at 375 | PASS | "Resolved 2 open reports", "Dismissed 1 open report", list shows "No open reports." |
| Streaks delete run (TEST Team A) | PASS | 7 to 6 rows, "Streak run of TEST Team A deleted." |
| Logs open a log | PASS | row is-open gold tint, content shown |
| Points add/delete (TEST value 700) | PASS | added and deleted from the list |
| Category add / rename / delete (TEST Cat) | PASS | all three worked, no scroll |
| Long text wraps inside card (question, answer, URL-like string) | PASS | 0 cells overflow the wrap |

## FU-44 (Questions table, 801-1920 px)

Note on 801 px: the iframe was 801 px wide but DPR 1.25 makes the CSS width 800.8 px, so `min-width: 801px` did not match. 802 px used as the proxy for the bottom of the range (see BUG-FU44-01).

| Check | Result | Evidence |
|---|---|---|
| 802, 1024, 1200: Arabic, Picture?, Choices hidden (7 columns) | PASS | 7 visible header columns |
| Row heights compact (all 879 rows) | PASS | 1024: median 115 / max 263 px (dev note 115 / 238 for the Question column; row height incl. buttons). 1200: median 90 / max 189 (note 90 / 189). Note's "before" values were 238 and 139 |
| Toggle button visible only 802-1200 | PASS | display block at 802, 1024, 1200; none at 800, 1201, 1280, 1366, 1920 |
| Toggle shows the 3 columns, toggles back | PASS | 10 columns, aria-pressed "true"; again 7, "false" |
| Keyboard operable | PASS | Real Enter and Space key presses on the focused button toggled the columns and aria-pressed. tabIndex 0, aria-controls="questions-table" resolves |
| All content reachable | PASS | with the toggle all values visible; at 802 with columns shown the table scrolls sideways (838 in 694), as documented |
| 1201-1365: as dev note | PASS | 10 columns, no toggle; 1201 median 139 / max 312 (note: 139), 1280 median 115 |
| 1366, 1920: unchanged | PASS | 10 columns, no toggle, no sideways scroll; 1366 median 90 / max 213 (note 90 / 213), 1920 median 65 / max 115. CSS diff shows no rule outside 801-1200 and max-width 800 that affects these widths |

## Regression

| Check | Result | Evidence |
|---|---|---|
| Admin loads, all panels render | PASS | settings, points, categories, questions, reports, streaks, logs all populated |
| Arabic names: Questions category cell | PASS | "AI / الـAI" (span dir rtl, lang ar) |
| Arabic names: Reports "English (Arabic) - points" | PASS | "AI (الـAI) – 100" |
| Game index.html loads; CSS/JS 200 | PASS | 6 local assets 200, page scrollWidth <= viewport |
| Setup to Board smoke (EN) | PASS | name "Team A", 5 categories, Start Game opened "1 player, 5 x 5 board, Played 0 of 25" with category headers and 100-point cells |
| Console errors | PENDING (environment) | The browser tool returned only "An unknown error occurred when fetching the script" on the game page (all local assets returned 200; probably an external script blocked, not investigated). Iframe console is not captured, so no admin JS error check was possible beyond all functions working |

## Bugs and observations

- BUG-FU44-01 (Minor): gap at fractional widths between 800 and 801 px. CSS uses `max-width: 800px` for cards and `min-width: 801px` for the FU-44 block; a viewport of 800.01-800.99 CSS px (browser zoom 110/125 percent, fractional DPR, reproduced here at iframe 801 px with DPR 1.25) matches neither, so the Questions table shows all 10 columns, no toggle, and scrolls sideways (885 in 692). Fix idea: `@media (min-width: 800.02px)` or `not all and (max-width: 800px)` for the FU-44 block. Files: css/style.9589cecb.css, the `@media (min-width: 801px) and (max-width: 1200px)` block.
- OBS-1 (Minor, spec ambiguity): Points list, Reload and Reset all stats are 29 px at 601-800 px (40 px only up to 600 px, as the dev note and CSS state). If 40 px is wanted for 601-800 (landscape phones, small tablets), extend that rule to 800.
- OBS-2 (Info): at 1024 the "Show Arabic..." button is 29 px tall and its label does not change with state (state is conveyed by aria-pressed only and no visual pressed style was checked).

## Cleanup and side effects

Removed all temporary rows (TEST question, its 2 reports and the 1 report on an existing question, TEST Team A streak, TEST point 700, TEST categories) and the temporary log `game-2099-01-01.log`. Starting the game smoke test created `logs/game-2026-11-11.log` (Team A), which I deleted. The local browser's saved Team A game in progress (localStorage) was backed up and restored. Final counts: 879 questions, 14 categories, 6 point values, 1 report (pre-existing, dismissed). Auto-increment moved (rows deleted, values not reset): questions 1736 to 1737, categories 52 to 53, point_values 21 to 22, question_reports 2 to 5, streaks 14 to 15. Servers were not started or stopped by me.

## Verdict

READY FOR PO (with BUG-FU44-01 and OBS-1 as optional Minor follow-ups).

## Re-test (after the developer's fixes for BUG-FU44-01, OBS-1, OBS-2)

Same harness (assets re-fetched with cache reload). All PASS.

| Check | Result | Evidence |
|---|---|---|
| FU-44 switch at 800 vs 801 | PASS | 800: cards (toggle hidden). 801 (800.8 CSS px here, the old gap): not cards, 7 columns, toggle 40 px, no sideways scroll (692/692). BUG-FU44-01 fixed |
| 802 / 1024 / 1200 / 1201 / 1366 unchanged | PASS | 802, 1024, 1200: 7 columns, toggle shown, no scroll; 1201, 1366: 10 columns, no toggle, no scroll |
| Points, Reload, Reset all stats >= 40 px at 375, 601, 800 | PASS | 0 buttons under 40 px in main at all three widths; no table overflow. OBS-1 fixed |
| Toggle 40 px tall, label switches, aria-pressed, keyboard | PASS | 40 px; label "Show ..." to "Hide Arabic, Picture and Choices columns" with aria-pressed true and 10 columns on Enter; back to "Show", false on Space. OBS-2 fixed |
| FU-59 at 375 still works | PASS | sort % correct (aria-sort ascending), Edit (gold card) and Cancel edit, Delete of a TEST row (9 to 8); row buttons 40 px; no overflow |
| Console errors on admin.html | PASS with note | Only "An unknown error occurred when fetching the script" (3x), the same message as on the game page earlier; looks like a tool/environment artifact (no admin function failed), not traced to a file. No other errors |

Cleanup: the TEST question was deleted; 879 questions again. questions auto-increment 1737 to 1738 (cumulative with the first run). No other rows or files created.

Verdict: READY FOR PO.

## PO acceptance (2026-11-11)

- **FU-59: ACCEPTED.** Every Admin table fits at 375, 601, 700 and 800 px with no sideways scroll, all values reachable as labelled cards, all buttons at least 40 px up to 800 px (OBS-1 fixed), sorting and every row action work at 375 px. Desktop unchanged.
- **FU-44: ACCEPTED.** At 1024 px the median Questions row drops from 238 to 115 px (all 879 questions); the hidden columns are one keyboard-operable click away; no sideways scroll at 1024 (BUG-11-01 holds); 1366 px and above unchanged; the 800 / 801 px gap is closed (BUG-FU44-01 fixed).
- Console: "An unknown error occurred when fetching the script" seen only in the tester's browser tool (all assets 200, all functions work, the developer saw none). Not blocking; the owner confirms a clean console in real Chrome in FU-60 step 5.
- Not covered / follow-ups: 1201 to 1365 px keeps the full table (FU-61, optional, default no); the toggle is not remembered across loads (owner default, no follow-up); minor accessibility note: the label changes and `aria-pressed` is also set (works; dropping `aria-pressed` is optional). FU-58 cancelled by the owner (Admin is English, D-59 d).
- Next: owner local Chrome check, commit and deploy (FU-60).

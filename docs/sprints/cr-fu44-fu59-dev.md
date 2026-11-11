# CR FU-44 / FU-59: developer note

Branch `cr-fu44-fu59`. Items: FU-44 (Admin Questions rows at about 1024 px) and FU-59 (Admin tables on phones, Categories at 601 to 680 px), see the Follow-ups table in `docs/product-backlog.md`. Admin only: no API, database, game or saved-game change. No PHP file changed, so there is nothing to `php -l`. No new file. `node --check js/admin.*.js` passes.

## Files changed

- `admin.html`: class `card-table` on the Questions, Reports, Streaks and Logs tables; id `questions-table`; class `col-extra` on the Arabic, Picture? and Choices headers; new button `#question-cols-toggle` in the Questions filter row.
- `js/admin.70239570.js`: `labelCells()` copies each column name into the cells' `data-label` (called at the end of `renderQuestions`, `renderReports`, `renderStreaks`, `renderLogs`); `onColsToggle()` for the new button; cell classes `card-wide` (long text: question, answer, report question, notes, log file name) and `col-extra`.
- `css/style.9589cecb.css`: the FU-55 categories card rules now apply up to 800 px (the add form still stacks only up to 600 px); a new `max-width: 800px` card block for the four other tables; a `max-width: 800px` rule for 40 px small buttons; a block for FU-44 above 800 px up to 1200 px (`not all and (max-width: 800px)` with a nested `max-width: 1200px`).

## FU-59: Admin tables up to 800 px

Up to 800 px every Admin table shows each row as a card, the same pattern as the FU-55 categories:

- Questions, Reports, Streaks, Logs: each value has its column name above it in small capitals. Long text (question, answer, report question block, notes, log file name) takes the full width; short values (category, points, Arabic, picture, choices, attempts, % correct; report count and reasons; streak and date; size and modified) sit side by side (2 per row at 375 px, 4 or more on wider screens). The buttons take a full row, each at least 40 px tall. In the Questions cards the question and answer come first.
- Questions sort: the header row is hidden, but the two sort buttons stay above the cards as a "Sort by" bar (40 px tall), so sorting still works on a phone.
- Categories: the FU-55 cards are now used up to 800 px. The table needs about 775 px (680 px content plus the panel padding), so it scrolled sideways from 601 to about 775 px, not only to 680 px.
- Up to 800 px (the card range) every small button in the Admin panels is at least 40 px: the Points list Disable / Enable / Delete, Reload (Reports, Streaks, Logs) and Reset all stats.
- Editing row (Questions) and open log (Logs) keep their gold highlight on the whole card.

Measured with Chrome (Playwright, `channel: chrome`, touch at 375) against `php -S localhost:8000` and the local DB (879 questions, default filter AI / 100 = 8 rows; 3 temporary reports and 1 temporary streak, all removed afterwards). "Box / content" is the table area width and the width of what is inside it; content larger than the box means sideways scrolling.

| Width | Table | Before (box / content, smallest button) | After |
|---|---|---|---|
| 375 | Points list | buttons 30 px | 40 px |
| 375 | Categories | 281 / 281, 40 px (FU-55) | 281 / 281, 40 px (unchanged) |
| 375 | Questions | 281 / 886, 30 px | 281 / 281, 40 px (cards about 450 px tall) |
| 375 | Reports | 281 / 613, 30 px | 281 / 281, 40 px |
| 375 | Streaks | 281 / 528, 30 px | 281 / 281, 40 px |
| 375 | Logs | 281 / 420 | 281 / 281, file link 40 px tall |
| 601 | Categories | 507 / 680, 30 px | 507 / 507, 40 px |
| 601 | Questions | 507 / 886 | 507 / 507 (cards 321 px) |
| 601 | Reports | 507 / 613 | 507 / 507 |
| 601 | Streaks | 507 / 528 | 507 / 507 |
| 680 | Categories | 586 / 680 | 586 / 586 |
| 1024, 1366 | Categories, Reports, Streaks, Logs | fit, rows 46 / 41 px | identical |

The page itself never scrolls sideways (page width = viewport at every width).

Checked working at 375 px: sort by % correct (aria-sort updates), category filter, Edit (form fills, card highlighted) and Cancel edit, open a log file (card highlighted, viewer shown), Dismiss a report (list goes from 2 to 1, success message), Delete a streak run. No script errors.

Pagination: the Admin lists have none (every list is shown in full, the Questions list is narrowed by the two filters), so there was nothing to keep.

## FU-44: Questions rows above 800 px, up to 1200 px

Above 800 px and up to 1200 px the Arabic, Picture? and Choices columns (short Yes / - / check-mark flags) are hidden and Edit sits above Delete, so the Question and Answer columns get the room. A button "Show Arabic, Picture and Choices columns" (only shown in this range, 40 px tall, `aria-pressed`, keyboard reachable, `aria-controls` the table) brings the three columns back; once pressed it reads "Hide Arabic, Picture and Choices columns". Not remembered across page loads. From 1201 px on nothing changes; up to 800 px the cards show every value.

Measured with all 879 questions shown (filters "all"):

| Width | Before: median / tallest row, Question column | After (default) | After, columns shown with the button |
|---|---|---|---|
| 801 | 287 / 780 px, 91 px, and the table scrolled sideways (886 in 707) | 189 / 460 px, 134 px, no sideways scroll | 287 / 780 px, 91 px, scrolls (838 in 707) |
| 1024 | 238 / 558 px, 110 px | 115 / 238 px, 230 px | 189 / 460 px, 130 px |
| 1200 | 139 / 312 px, 186 px | 90 / 189 px, 306 px | 115 / 287 px, 207 px |
| 1366 | 90 / 213 px, 258 px | identical (button hidden, 10 columns) | n/a |

With the default filter (8 AI questions at 100) the 1024 rows go from median 238 / max 263 to 90 / 115 px. BUG-11-01 still holds: no sideways scroll at 1024 in either state.

## How to test

1. Start XAMPP MariaDB and `php -S localhost:8000` in the project folder; open `http://localhost:8000/admin.html`.
2. DevTools device mode 375x812: Points buttons are 40 px; Questions, Reports, Streaks and Logs show cards with labels and do not scroll sideways; "Sort by Attempts / % correct" sorts; Edit, Delete, Resolve, Dismiss, Delete run and opening a log all work.
3. 650 px wide: Categories show as cards (Rename / Delete visible), no sideways scroll.
4. 1024 px: Questions shows 7 columns and the "Show Arabic, Picture and Choices columns" button; Tab to it, press Enter, the 3 columns come back; press again to hide.
5. 1366 px: everything as before, no toggle button.

## Known limitations

- Cards are taller than table rows; at 375 px a question card is about 450 px (10 values plus buttons). The filters keep the list short.
- Above 800 px, up to 1200 px, the three columns are hidden by default; their values are one click away, but not visible at a glance.
- At 801 to about 980 px, showing the three columns brings back the old sideways scroll of the Questions table (as before this change).
- The FU-55 categories cards now also appear from 601 to 800 px (instead of a scrolling table); the categories add form stays on one row there.

## Open questions for the owner

- FU-44 range: 1201 to 1365 px (for example a 1280 px laptop) keeps the full 10-column table, median row 139 px at 1201. Raising the upper limit to 1365 px would make those rows compact too; kept at 1200 as asked.
- Should the "Show Arabic, Picture and Choices columns" choice be remembered (localStorage)? Not done to keep it simple.

## Fixes (test report `docs/sprints/cr-fu44-fu59-test-report.md`)

- **BUG-FU44-01** (gap between 800 and 801 px at fractional widths): the FU-44 block is now `@media not all and (max-width: 800px)` with a nested `@media (max-width: 1200px)`, the exact opposite of the card query, so at any width (for example 800.5 px with browser zoom or a high-DPI scale) either the cards or the FU-44 table applies. Chosen over `800.02px`, which still leaves a tiny gap (800 to 800.02). Nested `@media` works in every current browser. Test limit: headless Chrome gives whole-pixel viewports (an 800.5 px iframe is laid out at 801 px), so a true 800.5 px width could not be produced; the queries are complementary by construction, and 800 / 801 px switch cleanly (cards at 800, FU-44 table at 801).
- **OBS-1**: the small Admin buttons (Points list, Reload, Reset all stats) are at least 40 px up to 800 px (the card range), not only up to 600 px.
- **OBS-2**: the columns button is 40 px tall and its label changes with its state ("Show ..." / "Hide Arabic, Picture and Choices columns"), in addition to `aria-pressed`. Note for the owner: the ARIA guidance for toggle buttons is a fixed label with `aria-pressed`; with a changing label a screen reader says "Hide ... columns, pressed". It works, but if wanted we can drop `aria-pressed` and keep only the changing label.

Re-measured after the fixes (Chrome, default filter AI / 100; table box / content; smallest button in px):

| Width | Layout | Tables (Categories, Questions, Reports, Streaks, Logs) | Points / Reload / Reset / row buttons | Columns button |
|---|---|---|---|---|
| 375 | cards | 281/281 each | 40 / 40 / 40 / 40 | hidden |
| 601 | cards | 507/507 each | 40 / 40 / 40 / 40 | hidden |
| 800 | cards | 706/706 each | 40 / 40 / 40 / 40 | hidden |
| 800.5 | (rounds to 801 in headless Chrome) | see 801 | | |
| 801 | FU-44 table | 707/707 each, Questions median row 164 px | 30 (desktop size) | 40 px, Show/Hide label |
| 1024 | FU-44 table | 930/930 each; all 879 questions: median 115 / tallest 238 px, Question column 230 px | 30 | 40 px, Show/Hide label |
| 1200 | FU-44 table | 1106/1106 each | 30 | 40 px, Show/Hide label |
| 1366 | desktop, unchanged | 1272/1272 each; all questions: median 90 / tallest 213 px, Question column 258 px, 10 columns (same as before the CR) | 30 | hidden |

Console: `admin.html` opened at each width above; no script errors, no console errors or warnings.

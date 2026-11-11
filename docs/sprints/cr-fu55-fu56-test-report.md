# Test report: CR FU-55 / FU-56 (branch cr-fu55-fu56, uncommitted)

Environment: Windows, php -S localhost:8000 and MariaDB (both already running, left running), Chromium browser pane. Viewports emulated with same-origin iframes (iframe is border-box, so widths of 377/603 gave true 375/601 viewports). No code modified. PHP not changed, so no php -l needed. Static: no innerHTML with data (only comments), new DOM built with h()/createTextNode, no credentials added.

Counts: PASS 22, FAIL 0, PENDING 0 (1 item verified by code review only).

## FU-55 Admin at 375x812
| Check | Result | Evidence |
|---|---|---|
| Add form stacked, usable | PASS | 3 controls at y 2078/2128/2179, each 278 wide, 42 tall |
| Cards show name, Arabic name, count, status | PASS | 2x2 grid per row; screenshot checked |
| Rename/Delete >= 40px, on screen | PASS | 131x40 at x 50-321 (panel 278 wide) |
| Save/Cancel >= 40px, on screen | PASS | 124x40, inputs 257x42 |
| No sideways scroll on categories table | PASS | scrollWidth 278 = clientWidth 278; page 358 vs 375 |
| Rename row works | PASS | renamed TEST category, list updated; Cancel closes row |
| Add / Rename / Delete work | PASS | created TEST category, renamed, deleted; DB count back to 14 |
| Desktop 1366 / 1024 | PASS | form one row, category rows 45px, tables fit, no sideways scroll |
| 601 | PASS | form one row, rows 45px; categories table scrolls sideways (679 in 492) which is outside the new 600px rule (media query cannot apply) |
| Points list at 375 | PASS | buttons 29px, inside panel; unchanged |
| Questions / Reports / Streaks at 375 | PASS | no new breakage; tables scroll inside their panel (885/422/528 in 278) as before; page has no overflow |

## FU-56
| Check | Result | Evidence |
|---|---|---|
| AR Start Game error names Arabic category | PASS | real 400 via temp point 999999: `تعذّر بدء اللعبة: Category "⁨أعلام⁩" is missing questions for: 999999` (bidi isolates U+2068/2069 present) |
| Kilo Meshakkal name | PASS | `"⁨كيلو مشكّل⁩" is missing questions for: 100, ..., 999999` |
| English unchanged | PASS | `Category "Flags" ...`, `"Kilo Meshakkal" ...`; EN/AR toggle while shown updates text |
| Unknown names stay as sent | PASS (code review) | localCategoryNames only replaces quoted names of Setup categories and Kilo Meshakkal; not run-tested (no unknown name reachable from UI) |
| Questions table Category cell | PASS | English then `<span dir=rtl lang=ar class=cat-ar>` (e.g. AI / الـAI); row grows 45 to 65px; table width unchanged |
| Reports "English (Arabic) – points" | PASS | `AI (الـAI) – 200` |
| Reports no brackets without Arabic | PASS | `TEST NoAr – 100` |
| Reports redraw after category list loads | PASS | categories.php delayed 1.5s: early `AI – 200`, later `AI (الـAI) – 200` |
| Questions table, category without Arabic name | not exercised in UI (filter attempt did not isolate rows); code path is `nameAr ? span : null`, h() skips null | PASS (code review) |
| Regression AR: Setup, Board, Question | PASS | Kilo Meshakkal board and question rendered RTL; no JS errors |
| Regression EN: Question view | PASS | restored game rendered in EN (Report, timer, scoring) |
| Console | PASS | only the two expected 400s from the deliberate error tests, plus one unrelated "error fetching the script" (not from app files; all app assets 200) |

Golden Goal and Results screens not exercised (smoke only requested).

## Bugs
None. Observations (not bugs): at 601-ish tablet width the categories table still scrolls sideways (as before; media rule is 600px max); Points/Questions/Reports/Streaks buttons stay 29-30px on phone (developer already recorded this as out of scope).

## Cleanup
Temp rows (TEST category and question, 2 reports, point value 999999) deleted; counts match original: categories 14, questions 879, point_values 6, question_reports 1. AUTO_INCREMENT counters advanced (categories, questions, reports, point_values) and cannot be reset without schema edits. One game log line created by the Start test (logs/game-2026-11-11.log, gitignored) was removed. MariaDB and php left running (were already running). No screenshots saved to disk; visual checks via pane screenshots (375 cards, AR board/question, EN question).

## Verdict: READY FOR PO

## PO acceptance (2026-11-11)
- **FU-55: ACCEPTED.** The Categories panel is usable at 375x812: stacked add form, cards with no sideways scroll, Rename / Delete and Save / Cancel on screen at 40 px; add / rename / delete work; 601, 1024 and 1366 px unchanged. The other Admin tables on a phone were outside the item's scope and are recorded as FU-59 (Could).
- **FU-56: ACCEPTED.** Arabic names appear in the Arabic Start Game error (server text stays English, D-59 a; bidi isolates keep the order), and in Admin Questions and Reports, with English unchanged and no API change. Two checks by code review only (unknown name, category without Arabic name in Questions) are acceptable for a Could item. Game logs stay English pending an owner decision (FU-58); D-61 f amended.
- 0 bugs. Next: owner local check, commit and deploy (FU-57, no migration).

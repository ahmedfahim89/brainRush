# Test report: CR FU-61 / FU-51 / FU-52 (branch cr-fu61-50-51-52)

Environment: Windows, system Chrome via Playwright, `php -S localhost:8000` and local MariaDB (both already running, left running), 879 questions, both filters "all". No code modified. Temp script and TEST question removed (879 questions again).

Result: 22 PASS, 0 FAIL, 0 PENDING. Verdict: READY FOR PO.

## FU-61 measurements (default state / columns shown)

Median / tallest row in px; "box/content" = wrapper width / table width.

| Width | Cols | Default med/max, box/content, button | Shown med/max, box/content |
|---|---|---|---|
| 375 | cards | 446/569, 281/281, none | n/a |
| 600 | cards | 321/370, 506/506, none | n/a |
| 800 | cards | 296/345, 706/706, none | n/a |
| 801 | 7 | 189/460, 707/707, 40px | 10 cols, 287/780, 707/838 (scrolls) |
| 1024 | 7 | 115/238, 930/930, 40px | 189/460, 930/930 |
| 1200 | 7 | 90/189, 1106/1106, 40px | 115/287, 1106/1106 |
| 1201 | 7 | 90/189, 1107/1107, 40px | 115/287, 1107/1107 |
| 1280 | 7 | 90/164, 1186/1186, 40px | 115/238, 1186/1186 |
| 1365 | 7 | 82/139, 1271/1271, 40px | 90/189, 1271/1271 |
| 1366 | 10 | 90/213, 1272/1272, no button | n/a |
| 1920 | 10 | 66/115, 1826/1826, no button | n/a |

These match the dev note exactly. Page `scrollWidth` equals the viewport at every width.

## Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | 800 and below: cards unchanged | PASS | 375/600/800 show 2-column card rows, button hidden; 375 rows are `display:grid`, first label "Category" |
| 2 | 801 to 1365: 7 columns, 40 px toggle | PASS | table above |
| 3 | Label Show/Hide and aria-pressed switch | PASS | false/Show to true/Hide at every width 801 to 1365 |
| 4 | Keyboard | PASS | at 1280, focus + Enter gave pressed true/Hide, Space gave false/Show |
| 5 | Edit above Delete | PASS | at 1280 Edit top 612, Delete top 648 |
| 6 | 1366 and 1920 identical to the FU-44 numbers | PASS | 90/213 and 66/115, 10 columns, no button |
| 7 | No table or page sideways scroll, 801 to 1365, default state | PASS | content = box everywhere |
| 8 | Same, columns shown | PASS with the known exception | 1000 and above: no scroll (906 vs 906 at 1000). Scrolls at 801 (838>707) and 900 (838>806); 950 (856=856) and 980 (886=886) do not. The dev note's "801 to about 980" is slightly pessimistic: the real limit is about 900 to 950 |
| 9 | Other Admin panels unchanged at 375, 1280, 1366 | PASS | every non-Questions panel (height, width, scrollWidth, table rows/width/display) is identical with the old CSS from `git show HEAD:` and the new CSS |
| 10 | FU-55/FU-59 phone cards at 375 intact | PASS | see 1; no sideways scroll |
| 11 | Add, Edit, Delete of a TEST question at 1280 | PASS | "Question added (AI - 100)", edit saved, delete confirm dialog accepted, row gone, DB back to 879 |
| 12 | index.html loads; Setup to Board (EN, 1280) | PASS (light smoke) | title OK, 1 default entry filled, 5 categories ticked, Start enabled, the board rendered (34 cells matched) |
| 13 | Console errors on admin.html and index.html | PASS | 0 errors or warnings at all widths; the "unknown error" artifact did not appear |
| 14 | The three comment changes are comment-only | PASS | `git diff` of admin.html and admin js shows comment lines only |
| 15 | CSS diff is minimal | PASS | only the comment and `1200px` to `1365px` |

## FU-51 `.gitignore`

| # | Check | Result | Evidence |
|---|---|---|---|
| 16 | Every line CRLF | PASS | 20 lines, 20 end in CR (`grep -c`); `git ls-files --eol`: `i/lf w/crlf` |
| 17 | `git diff .gitignore` shows only the 3 added lines | PASS | blank line, `# Node tooling (Playwright)`, `node_modules/` |
| 18 | `git check-ignore -v node_modules` | PASS | `.gitignore:20:node_modules/` |
| 19 | node_modules not shown as untracked | PASS | `git status` does not list it (the folder exists) |
| 20 | Nothing else in the file changed | PASS | diff shows no other hunk |

## Repo state and FU-52

| # | Check | Result | Evidence |
|---|---|---|---|
| 21 | Only the 4 expected files changed plus new docs | PASS | modified: `.gitignore`, `admin.html`, CSS, admin js. Untracked: the dev note, plus the 4 known unrelated files (`.claude/launch.json`, `googlebbe9a71d60b82d1a.html`, `package.json`, `package-lock.json`) |
| 22 | question_stats unchanged | PASS | 34 rows; 363, 364, 365, 715 each correct 1, wrong 0, nobody 0, timeout 0, as in the dev note |

## Bugs

None. Observations (not bugs):

- Dev note limitation wording: with columns shown the table scrolls sideways only up to about 900 px (not 980 px); at 950 px it fits.
- The Setup-to-Board smoke started a board game once, so a local game record may exist (the tester did not check; this is not a question_stats change, which stays as in the dev note).
- Docs still say 1200 px in the backlog, sprint plan and the FU-44 documents (the dev note already lists this).

## PO acceptance (2026-11-11)

| Item | Verdict | Reason |
|---|---|---|
| FU-61 | ACCEPTED | Compact layout 801 to 1365 px, 1366+ and 800- unchanged, toggle and keyboard work, other panels identical, no console errors (checks 1-15). With the columns shown the table scrolls sideways only below about 950 px (check 8; the FU-44 dev note said about 980). |
| FU-51 | ACCEPTED | Every `.gitignore` line CRLF, content unchanged, `node_modules/` still ignored (checks 16-20). The four untracked files stay uncommitted on purpose and are not part of FU-51. |
| FU-50 | Done, no action | Informational (D-59 f); nothing changed. |
| FU-52 | Closed, no action | The rows no longer match the Sprint 13 report, so the restore was rightly not run; DB unchanged (check 22). "Reset all stats" (D-57) clears them if wanted. |

Backlog: FU-61, FU-51, FU-50 Done; FU-52 closed; FU-65 and FU-66 cancelled (owner); FU-44 amended; D-62 d amended; D-63 added. Follow-up: FU-67 (owner check, commit, one consolidated deploy from `main` that includes FU-64's undeployed set; Must). The historical FU-44 dev note and test report keep 1200 px as written.

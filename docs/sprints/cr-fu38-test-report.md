# FU-38 test report (Kilo Meshakkal constants in db.php)

Branch `cr-fu38`, uncommitted change, tested 2026-11-11. Environment: PHP 8.0.30 (XAMPP), MariaDB, existing `php -S localhost:8000` reused; a second `php -S localhost:8001` serving `git archive main api` (same DB) was started for a side-by-side comparison and stopped afterwards. Browser: Claude browser pane (viewport about 736 px).

Summary: 24 PASS, 0 FAIL, 0 PENDING. Verdict: **READY FOR PO**.

## Checks
| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | `MIX_ID` / `MIX_NAME` defined once in PHP | PASS | Only `api/db.php:191-192` have `const`; no `define()` elsewhere. |
| 2 | No leftover `GAME_LOG_MIX_*` / `CATEGORY_MIX_NAME` in code | PASS | Only in `docs/product-backlog.md`, `sprint-10-dev.md`, `sprint-10-test-report.md`, and the dev note (history / PO-owned). |
| 3 | `php -l` on every `api/*.php` (16 files) | PASS | All "No syntax errors". |
| 4 | Every entry point loads without "already defined" / "undefined constant" warnings | PASS | curl on auth, categories, daily, db, game-log (405), integration-quiz, logs, mcp (GET 405, POST tools/list 200), points, question-stats (405), questions, reports (400 as designed), settings, streaks: no PHP notice in any body (display_errors=STDOUT). The 8000 server's stderr is not reachable (started by someone else); the 8001 server log was clean. |
| 5 | GET board `-1`, `3,-1,1`, `-1,-1`, `-1,1,-1`, `-2`, `0`, `abc`, `-1,99999`, `1,-2`, `-1,0`, ` -1`, `-1,` | PASS | 200 / 400 as expected (mix alone one column with 5 cells and `name_ar` null; mix in the middle; duplicate 400 "listed more than once"; invalid 400 with "(or -1 for Kilo Meshakkal)"; unknown 400). Output identical to main (`diff` empty). |
| 6 | POST board `"-1,2"`, `"-1,-1"`, `"abc"`, numeric `-1` | PASS | Identical to main (numeric -1 gives 400 "comma-separated list of category ids" on both). |
| 7 | Missing-questions error (temp enabled point 9999) | PASS | 400 `"Kilo Meshakkal" is missing questions for: 100, 200, 300, 400, 500, 9999`, same on main. Row deleted. |
| 8 | POST played `-1`, `3,-1`, `-1,-1`, `-2` | PASS | 200 `{0,0}`, 200 `{0,60}`, 400, 400; identical to main. |
| 9 | game-log `[-1,3]`, `[3,-1,1]`, `["-1",3]` | PASS | 201; lines "Kilo Meshakkal, History" and "History, Kilo Meshakkal, Geography"; identical to main's log lines. |
| 10 | game-log `[-1,-1]`, `[-2]`, `[0,-1]`, `[-1,99999]` | PASS | 400 "Kilo Meshakkal is listed more than once" / "categories must hold positive integer ids (or -1 for Kilo Meshakkal)" / same / "Category 99999 does not exist"; identical to main. |
| 11 | categories POST `Kilo Meshakkal`, lower, UPPER, padded | PASS | 409 `"<trimmed name>" is the name of a built-in category` for all four. |
| 12 | categories PUT rename to `Kilo Meshakkal`, `kILO mESHAKKAL`, padded lower | PASS | 409 same message; identical to main on port 8001. |
| 13 | Setup shows Kilo Meshakkal tile (EN) | PASS | In the category list between Hist. and Landmarks (alphabetical). |
| 14 | Setup shows tile (AR) | PASS | Shown as "كيلو مشكّل", page `ar` / `rtl`. |
| 15 | EN game with Kilo Meshakkal + History starts | PASS | Board "2 x 5", columns KILO MESHAKKAL, HISTORY; cell opens as "KILO MESHAKKAL: GEN Z - 100" with a question. |
| 16 | AR game with Kilo Meshakkal alone starts | PASS | Board "1 x 5", column heading and cell question "كيلو مشكّل: كرتون زمان - 500x2" render. |
| 17 | Streak and Daily load | PASS | Daily Challenge #10 question 1/3 rendered; Streak panel and leaderboard render; streak batch API returns questions. (Did not play a streak run, to avoid a leaderboard row.) |
| 18 | Admin loads category list; rejects `Kilo Meshakkal` | PASS | 14 of 14 categories playable; adding the name shows `"Kilo Meshakkal" is the name of a built-in category`; list unchanged. |
| 19 | Console: index.html, admin.html | PASS | No JS errors. Only the known tool artifact ("unknown error fetching the script"), the tool's suppressed confirm() dialog, and the expected 409 resource line from check 18. |
| 20 | Static: credentials, `innerHTML`, SQL concatenation | PASS | The diff adds only constants and a comparison; no new SQL or DOM code. `api/config.php` already ignored. |

## Bugs
- BUG-FU38-01 (Minor, pre-existing, not introduced by FU-38, identical on main): a name with two inner spaces such as `Kilo  Meshakkal` (and `Kilo Meshakkal2`) is accepted as a category (201), because the check is only trim plus case-insensitive. Setup would then show a near-duplicate tile. `api/categories.php` `save_category_name()`. Not a regression; the PO can decide whether to ignore it.

No Critical or Major bugs.

## Cleanup
- Temp categories created by check 11 (ids 55 and 56) deleted; temp point value 9999 deleted; no `Meshakkal` rows remain.
- `logs/game-2026-11-11.log` did not exist before and held only test lines (FU38TEST, Team A); it was deleted. The 8001 server's own log went to a temp dir outside the repo.
- Auto-increment moved: `categories` 55 -> 57, `point_values` 24 -> 25. No other table touched.
- Only the 8001 server was stopped; the 8000 server and MariaDB were left running.
- Browser localStorage was cleared on localhost during tests (local only).
- No code modified.

## PO acceptance (2026-11-11)
- **FU-38: ACCEPTED.** The constants are defined once in `api/db.php` and used by the three API files; every entry point loads cleanly; responses and log lines are byte-identical to `main`; Setup, board, Streak, Daily and Admin work in EN and AR. Meets D-54 (g) with no behaviour change. The JS copy in `js/game.js` stays by design (comment points at `api/db.php`).
- **BUG-FU38-01:** not a regression, does not block. Recorded as FU-62 (Could): collapse inner whitespace before the built-in name check; "Kilo Meshakkal2" is a distinct name and stays allowed. Cosmetic, Admin-only.
- Remaining: owner local Chrome check, commit and hosted deploy, FU-63 (no migration; upload the four PHP files together).

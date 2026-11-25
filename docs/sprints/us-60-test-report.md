# US-60 Speed Round leaderboard: test report

Branch `speed-leaderboard` (uncommitted), dev notes `docs/sprints/us-60-dev.md`, story US-60 and decision D-76 in `docs/product-backlog.md`. No application code was changed by this test.

## Summary

- **Environment:** Windows 11, XAMPP PHP (`C:/xampp/php/php.exe -S localhost:8021`, plus `localhost:8022` for the admin-login check, both stopped at the end), MariaDB on 3306 (already running), Browser pane (Chromium). Database `brainrush` (local copy).
- **Result:** 52 PASS, 2 FAIL, 7 PENDING (61 checks).
- **Verdict: NEEDS FIXES.** BUG-60-01 (Major) breaks the board for any saved US-59 result, which is already live.

## Acceptance checks

| # | Criterion | Result | Evidence |
|---|---|---|---|
| A1 | GET with no runs returns 200 `[]` | PASS | curl, `[]` 200 |
| A2 | `?period=week` and `?period=all` return 200 | PASS | curl; browser network log shows both requests from the tabs |
| A3 | `?period=month` returns 400 | PASS | `{"error":"period must be one of: all, week"}` 400 |
| A4 | POST `{name,streak}` returns 201 `{rank,best,week_rank,week_best}` | PASS | curl 201; browser POST 201 |
| A5 | streak 0 or "abc" returns 400 | PASS | curl 400 |
| A6 | Empty name returns 400; 31 characters returns 400; 30 characters returns 201 | PASS | curl 400, 400, 201 |
| A7 | Invalid JSON returns 400; PUT returns 405 | PASS | curl 400, 405. A POST with no Content-Type returns 415 (same as Streak, not a bug) |
| A8 | Best run per name, case-insensitive | PASS | "Team A" 3 then "team a" 5 gives one row, "team a" 5 |
| A9 | Earlier run wins a tie | PASS | "team a" 5 (id 2) ranks above "Team B" 5 (id 3) |
| A10 | Admin `GET ?all=1` and `DELETE` return 401 without login, 401 on wrong password, 200 with login | PASS | Run on a throwaway copy of `api/` on port 8022 with a test-only admin login (the real `api/config.php` was not edited). Localhost without admin config is admitted by design (`is_local_request`, same as Streak) |
| A11 | Admin list with login: 200; `id=abc` 400; missing id 404 | PASS | curl on port 8022 |
| A12 | Table missing returns 503 with a clear message | PASS | Renamed `speed_scores` for one request, got 503 "The Speed Round leaderboard is not set up on this server yet.", table restored |
| A13 | `streaks.php` and `integration-quiz.php` unchanged (200) | PASS | curl; Streak period=bad still 400 |
| A14 | Hosted config with admin credentials set: 401 without login | PENDING (environment) | Local config has no admin credentials, so the real config could not be tested. Check on the hosted server |
| N1 | Name step appears before the 3-2-1 countdown | PASS | Screenshot: Speed Round card with Challenger name, Back, Start; countdown only after Start |
| N2 | Empty name shows "Challenger name is required" | PASS | Screenshot |
| N3 | Arabic error shows in Arabic | PASS | "اسم المتحدّي مطلوب" |
| N4 | Field max 30 | PASS | maxlength 30; 41 typed gives 30 characters; `dir="auto"` |
| N5 | Back on the name step starts no run | PASS | No countdown, no POST, back to setup |
| N6 | Enter submits | PASS | Enter started the run |
| N7 | Every run asks (Play again) | PASS | Play again opens the name step, prefilled |
| N8 | Prefill from last name used (localStorage) | PASS | "Team A" prefilled after a Streak/Speed run; Arabic run prefilled too |
| N9 | First-run rules shown above the field | PASS | Rules shown on the first popup of the session |
| N10 | Reload on the name step returns to it | PENDING | Not exercised |
| R1 | Score 1 or more: POST and rank line | PASS | POST 201, "You are #1 this week and #1 of all time." |
| R2 | "Your best is still N." when an earlier run was better | PASS | "Your best is still 5." (same person, case-insensitive) |
| R3 | Score 0 is not saved, shows the 0-run message | PASS | No POST; "Only runs with 1 or more correct answers go on the leaderboard." |
| R4 | Save failure shows "Your score could not be saved: ..." and Try again | PASS | Simulated network failure (see notes). Text: "Could not reach the server. Check that it is running." |
| R5 | Try again saves | PASS | POST 201 after Try again; row saved |
| R6 | Reload of a pending result sends it again | PASS | Reload after failed save sent POST 201 and showed the rank line |
| R7 | Play again with an unsaved score asks "Your score of N was not saved. Leave it unsaved?" (OK path) | PASS | Logged text matches; OK proceeds to the name step |
| R8 | Same prompt, Cancel stays on the result | PENDING | Cancel branch not exercised |
| R9 | Play again and New Game are disabled while saving | PENDING | Not exercised |
| R10 | Reload keeps a saved result | PASS | Reload showed "1 correct answer" and rank line |
| R11 | Version 1 save (no name) shows its result without a rank line and does not crash | PASS | Result shows "3 correct answers", "9 away from your best (12)" |
| R12 | Version 1 save: opening the board does not crash | FAIL | BUG-60-01 |
| R13 | Version 1 started run is dropped | PENDING | Code read only (`loadSpeed`, `game.30c7287b.js:4730`) |
| B1 | Board from setup (🏆 beside Speed Round) | PASS | Title, rows "· 5 correct · 25 Nov 2026", tabs, Back returns to setup, no ad |
| B2 | This week / All time tabs | PASS | Requests `period=week` and `period=all` |
| B3 | Board from result: headline, highlighted row, rank line, Back to result | PASS | "Team A: 1 correct!", rank line, own row highlighted |
| B4 | No ad on the Speed board | PASS | No ad slot in the DOM or screenshot |
| B5 | Streak board unchanged | PASS | Streak run saved (streak 1), "Team A: 1 in a row!", "You are #1 this week and #6 of all time.", row highlighted |
| B6 | Streak name step unchanged | PASS | Same prefill rule as `main` (first Players row). Code compared with `git show main:js/game.30c7287b.js` |
| B7 | Integration Quiz UI | PENDING | Only the endpoint was checked (A13) |
| L1 | Arabic name step (labels, rules, buttons RTL) | PASS | Screenshot |
| L2 | Arabic result line and buttons | PASS | "ترتيبك #5 هذا الأسبوع و#5 على الإطلاق." |
| L3 | Arabic board: headline, rows, highlight | PASS | Screenshot |
| L4 | Arabic name stored as UTF-8 | PASS | `HEX(name)` of the stored row gives the UTF-8 bytes of "فريق أ" |
| L5 | Arabic copy review | Out of scope | FU-102 (native review) |
| V1 | 320 px: setup and name step, no sideways scroll | PASS | scrollWidth = clientWidth; name card fits (screenshot) |
| V2 | 375 px: setup and name step, no sideways scroll | PASS | scrollWidth = clientWidth |
| V3 | 1366x768: setup row (Speed and 🏆 on one line) and name step | PASS | Screenshot, scaled |
| V4 | 320 and 375 px: result and board | PENDING | Not checked (dev notes report a Playwright check) |
| C1 | No console errors in the Speed flow | FAIL | BUG-60-01 (uncaught TypeError); BUG-60-02 (404 for a question image) |
| S1 | `speed_enabled` off hides the Speed button and its 🏆 | PASS | Set to 0 for one reload: both hidden (`setup` check). Restored to 1 |
| S2 | Admin "Speed leaderboard" panel lists runs (name, correct, played, Delete) | PASS | Screenshot on the local admin page |
| S3 | Admin delete removes a Speed run | PASS | "Speed Round run of Team A deleted." and row removed |

Counts: PASS 52, FAIL 2 (R12, C1), PENDING 7 (A14, N10, R8, R9, R13, B7, V4).

## Bugs

### BUG-60-01 (Major): board from an old version 1 result crashes and shows "null"

- **Steps:** (1) Open the game on a fresh browser profile. (2) In the console, run `localStorage.setItem('brainrush.speed', JSON.stringify({version:1,best:12,bestAt:1795637000000,run:null,last:{score:3,prevBest:12,newBest:false,name:'Team A',save:'saved',saved:{rank:1,best:5,week_rank:1,week_best:5}},onResult:true}))`. (3) Reload. The result shows "3 correct answers". (4) Click "Leaderboard".
- **Expected:** the board lists the rows and the headline has no name (or a neutral line). No rank line, and no text about the 0-run rule.
- **Actual:** the list is empty; the headline reads "null: 3 correct!"; the line reads "Only runs with 1 or more correct answers go on the leaderboard." Console: `Uncaught (in promise) TypeError: Cannot read properties of null (reading 'toLowerCase') at renderLeaderboardRows (js/game.30c7287b.js:4185)`. Switching language raises the same error (`refreshScreen`, line 7203).
- **Where:** `js/game.30c7287b.js:4185` (`const me = result ? result.name.toLowerCase() : null;`). Also `:4085` (headline uses `result.name`) and `:4097` (the 0-run line shown when there is no save).
- **Who it hits:** any user with a US-59 Speed result saved on the device before this change (live 2026-11-25). The fix is a guard for a null `result.name` (no headline, no rank line for `save: 'none'`).

### BUG-60-02 (Minor, pre-existing, not in this diff): question image missing

- **Steps:** Load the game and open a Speed or normal question that uses `img/questions/landmark-one-world-trade-center.jpg`.
- **Expected:** the image loads. **Actual:** 404. The file is not in `img/questions/` and the repo has no diff for `img/`. Owner to add the file or clear the image field of that question.

### BUG-60-03 (Minor): Speed API messages say "Streak"

- `DELETE /api/speed-scores.php?id=999` (admin) returns `{"error":"Streak run not found"}` (404). Source: `api/streaks.php:176`, shared by the Speed table.
- `GET /api/speed-scores.php?all=1` without login returns `{"error":"Login required to change content."}` (401). Source: `api/db.php:293`. Wording only; the status codes are right.
- **Fix:** pass the board name into `delete_streak()` and the message, or use neutral wording.

### BUG-60-04 (Minor, owner decision): two personal-best lines on one result

- After a run that scores 1 when the device best is 0 and the leaderboard best for the name is 5, the result shows "New personal best!" and "Your best is still 5.". Both are correct in their own terms (device best vs leaderboard best), but the wording may confuse players. Owner to decide whether to keep both or change the leaderboard line.

## Notes on the test method

- The browser tool dismisses `window.confirm`, so "End run" (which asks "End the run now?") did nothing until the test page's `window.confirm` was stubbed to return true. Test-harness only. The app is fine in a real browser.
- The save failure was simulated by stubbing `window.fetch` for one POST to `speed-scores.php`. The reload check then used the real server.
- Admin 401 checks used a throwaway copy of `api/` in the scratchpad with a test-only admin login. No real credential was used, and `api/config.php` was not read for its values or edited.
- Question answers were chosen by reading the question. Some runs ended with a score of 0 on purpose.

## Restoration of test data

- `speed_scores`: was empty before testing. Test rows removed (all my runs); AUTO_INCREMENT reset to 1.
- `streaks`: one test row (id 30, "Team A") removed; AUTO_INCREMENT restored to 30. Table compared with the snapshot: identical.
- `settings`: `speed_enabled` set to 0 for one check and back to 1. Whole table compared with the snapshot: identical.
- `logs/game-2026-11-25.log`: restored from the snapshot (14 lines, byte-identical). `logs/game-2026-11-20.log` unchanged. No 26 November log was created.
- **Not restored:** `question_stats` counters. The table has no timestamps and I took no snapshot before testing, so the exact counters I changed cannot be reconstructed. About 6 correct answers and possibly 1 wrong answer were recorded (Speed and Streak answers, as US-59 does). Local test data only; the owner can accept or reset those rows.
- Test browser: the `brainrush.*` keys in localStorage were set and cleared during the test (the version 1 record, the challenger name). This is the test profile only.

## Verdict

**NEEDS FIXES.** BUG-60-01 (Major) must be fixed before the owner's local check (FU-100) and the hosted deploy (FU-101). BUG-60-02 to BUG-60-04 can be fixed in the same change or accepted by the owner. Pending items (A14, N10, R8, R9, R13, B7, V4) need the owner's check or a hosted smoke test (FU-101).

## PO acceptance (2026-11-26)

**US-60: ACCEPTED with follow-ups** (D-76 k to p).

- **Owner request met:** a Speed board on the Streak logic (the same API on table `speed_scores`, best run per name, This week / All time, the rank line). The name is asked in the Speed popup before the countdown. Ranking is by correct answers.
- **BUG-60-01 (Major), fixed (fix loop 1):** the developer re-checked it in Chrome. The PO checked the code: `loadSpeed()` maps a result with no save state to name null and save `none`; `speedBoardResult()` returns null unless a named run is pending or saved; the board's headline and rows guard a missing name. Every caller of `speedBoardResult()` runs only when a result exists. The tester has **not** re-run it yet. FU-104 (Must) does this before the commit, not before the acceptance.
- **BUG-60-03 (Minor), fixed:** neutral 404 "Run not found" (`api/streaks.php`). The shared 401 wording stays (D-76 m).
- **R12, C1 (FAIL):** closed by the BUG-60-01 fix, pending FU-104. The question-image 404 in C1 existed before US-60 (BUG-60-02, now FU-106).
- **PENDING rows:** N10, R8, R13 and V4 are covered by the developer's browser run. R9 passes on code (Play again and New Game are disabled while saving). B7 is covered by the developer's Integration Quiz check plus A13. A14 moves to the hosted smoke check (FU-101). The Admin list order (newest first) was checked in code (`ORDER BY created_at DESC`).
- **BUG-60-04:** owner decision, FU-105. The PO recommends "Your leaderboard best is still N." for Speed only.
- **Not restored:** the local `question_stats` counters bumped by the developer's and the tester's runs. Local data only; the owner can keep or reset them.
- **Follow-ups:** FU-104 (Must, Tester), FU-105 (Could, Owner), FU-106 (Could, Owner), plus the existing FU-100 to FU-103.

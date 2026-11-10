# Integration Quiz: test report

Tester: Senior Tester agent, 2026-11-10. Worktree BrainRush-integration-quiz, branch integration-quiz (uncommitted).
Environment: PHP built-in server on localhost:8005, MariaDB/MySQL (root, db brainrush), browser tool (viewport 494x239; 1366x768 and 375x667 checked in same-origin iframes).
Test data: integration_questions had 2 placeholder rows (example SQL) plus 5 of my own (one disabled, one with clashing choices); scores used "Team A".."Team H".

## Summary
PASS 33, FAIL 0, PENDING 1 (admin guard at runtime). Bugs: 0 Critical, 0 Major, 2 Minor, 1 Info.
Verdict: **READY FOR PO** (the minor wording bug is optional to fix).

## Results
| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | php -l on api/*.php | PASS | no syntax errors |
| 2 | integration-quiz.html has noindex | PASS | `<meta name="robots" content="noindex">` |
| 3 | Not in sitemap.xml / llms.txt | PASS | only the domain name `brainrush.integration.ninja` matches "integration"; no quiz URL |
| 4 | Not linked from any page | PASS | grep of all html/js/xml/txt/json: only itself and the game js/i18n mention it; its own links are privacy/terms only |
| 5 | Setup opens straight to name field | PASS | only screen-setup visible, activeElement = streak-name, no "back to a normal game" button |
| 6 | Validation: empty / 31 chars name | PASS | "Challenger name is required" / "must be at most 30 characters", stays on setup |
| 7 | Run plays only integration questions, "Question N" heading | PASS | headings QUESTION 1..6, texts only from integration_questions, panel title "Integration Quiz", requests only integration-quiz.php + game-log.php |
| 8 | Right answer counts | PASS | streak 1,2,3 shown, "Correct! Your streak is 2." |
| 9 | Wrong answer ends run | PASS | "Wrong! The right answer was C, ..." then See results; leaderboard saved Team G with 1 |
| 10 | Time's up ends run | PASS | timer 5 s: "Time's up! ..." then See results |
| 11 | End run | PASS | confirm text shown; streak 1 saved; streak 0 saves nothing (no POST) |
| 12 | Refresh mid-run restores | PASS | reload at Question 4 shows same question, streak 3, timer running, key brainrush.integrationQuiz |
| 13 | Run over removes saved key | PASS | key gone on leaderboard |
| 14 | Leaderboard save + rank | PASS | "You are #2 this week and #2 of all time"; ties keep earliest run; names case-insensitive |
| 15 | Week/All tabs show only integration scores | PASS | no Fahim/Tester1/PROD-Test etc. on either tab |
| 16 | Play again | PASS | new run, name kept, game-log posted |
| 17 | New Game | PASS | returns to quiz setup (name field focused), not a board |
| 18 | Back (lb-back) from setup-opened leaderboard | PASS | returns to setup |
| 19 | Question pool exhausted | PASS | perfect run of all 6 valid questions ends cleanly and saves streak 6 |
| 20 | Empty integration_questions | PASS (wording: BUG-IQ-01) | start-msg "There are no questions to play yet.", stays on setup |
| 21 | Missing table | PASS | batch returns 503 "The Integration Quiz is not set up on this server yet." |
| 22 | Disabled / clashing-choice rows skipped | PASS | batch never contained ids 7, 8 |
| 23 | Batch API: bad exclude | PASS | 400 for "x" and for [-1,"a"]; {} and no body field OK; non-JSON 400 |
| 24 | Bad period | PASS | ?period=month 400 "period must be one of: all, week" |
| 25 | Invalid name / streak POST | PASS | 400 for empty, blank, 31 chars, streak 0, -1, "x", 1.5, 100001; 201 for valid |
| 26 | Unknown method / id | PASS | PUT 405; DELETE ?id=99999 404 |
| 27 | Admin list ?all=1 and DELETE work | PASS | list returned, DELETE id=1 returned {"deleted":1} (local request, admin open when no credentials are configured, same as streaks.php) |
| 28 | Admin guards present in code | PASS (code) / PENDING (runtime) | require_admin() before ?all=1 and DELETE in streak_board_request() (api/streaks.php). Runtime denial with credentials set not exercised (would need to edit api/config.php) |
| 29 | Table name injection | PASS | every SQL builder goes through streak_table() whitelist ['streaks','integration_scores'], table passed by constants only, never from the request |
| 30 | Public streaks.php unchanged | PASS | same 400/404 messages, same top-10 output, public board shows its own 4 names |
| 31 | Public Sudden Death on index.html | PASS | uses POST questions.php?streak=1 and streaks.php; Arabic/English toggle still present; no integration names on week or all tabs |
| 32 | Saved board game survives quiz play | PASS | real 2-player board game saved to brainrush.game (11651 chars) is byte-identical after running and saving a quiz run, and still restores on index.html; brainrush.seen unchanged; index.html, admin.html, app.js not modified |
| 33 | No stats / seen / report writes | PASS | question_stats totals 33/33 rows and question_reports 1 row, unchanged; no question-stats.php or reports.php requests; no Report button; streaks table unchanged (6 rows, max id 12) |
| 34 | Layout 1366x768 and 375 | PASS | no horizontal overflow on setup, leaderboard, question; at 1366x768 the question screen fits without scrolling (End run at y 488); at 375 widths 302 px, the question screen scrolls vertically (770 px) |
| 35 | Console errors | PASS (env noise) | only "An unknown error occurred when fetching the script" on both index.html and the quiz, never requested sw.js on the server; no JS exceptions; the one warning is the tool suppressing confirm() |
| 36 | game-log accepts mode integration | PASS | log lines "integration: Team A | categories: Integration Quiz" |

## Bugs
- **BUG-IQ-01 (Minor)**: the quiz page shows Streak Challenge wording in two messages. Repro: set every integration question to enabled=0, open /integration-quiz.html, enter a name, press Start. Expected "Could not start the Integration Quiz ..." Actual "Could not start the Streak Challenge: There are no questions to play yet." The same leak applies to `streak.fix` ("The Streak Challenge cannot start yet. Please fix the errors above.") shown when the name is invalid. Source: js/i18n.6f7ba094.js lines 230-231 used via js/game.cd2d8d45.js (no iq.* variant).
- **BUG-IQ-02 (Minor / observation)**: pressing Start very soon after page load (while the settings request is still loading, button disabled) is silently ignored: no message and no request. Repro: load /integration-quiz.html, type a name and click Start immediately; nothing happens, a second click works. Likely same on the public page; cosmetic.
- **INFO-IQ-03**: the leaderboard GET ?period=all fires twice when a run ends or the board opens (seen in request log). Harmless, likely inherited from the Streak code.

## Cleanup
integration_questions and integration_scores truncated (0 rows each). streaks (6 rows) / question_stats (33) / question_reports (1) verified unchanged; nothing deleted in other tables. logs/ folder created by game-log tests removed from the worktree. No commits, main checkout and other worktrees untouched. Server on port 8005 stopped (below).

## Verdict
READY FOR PO.

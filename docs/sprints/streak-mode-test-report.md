# Streak Challenge (US-33, US-34, D-37): test report

Tester: Senior Tester agent, 2026-10-23. Branch `streak-mode` (uncommitted). No application code was changed.

## Summary

- **Environment:** Windows 11, PHP 8.0.30 (XAMPP), MariaDB 10.4.32 (local `brainrush` DB, `streaks` table present), `php -S localhost:8020` from the repo root (stopped afterwards), in-app browser.
- **Viewports:** the in-app pane cannot be resized, so the game was loaded in a same-origin iframe sized 1366x768 (desktop) and 375x812 (mobile preset equivalent). Media queries follow the iframe width. Screenshots were checked by eye at a reduced scale. Assertions were made through `javascript_tool` (DOM and `localStorage`).
- **Counts:** 63 checks, **61 PASS, 0 FAIL, 2 PENDING** (not testable locally, see the end of the table). 3 Minor findings, none blocking.
- **Verdict: READY FOR PO** (no Critical or Major bug; the Minor items are optional polish).

## Static checks

| Check | Result | Evidence |
|---|---|---|
| `php -l` api/questions.php, api/streaks.php, api/game-log.php (and every other api file) | PASS | "No syntax errors detected" |
| `api/config.php` in `.gitignore` | PASS | `git check-ignore api/config.php` prints it |
| No `innerHTML`, `insertAdjacentHTML` or `document.write` in game or admin JS | PASS | grep finds only the header comments |
| SQL built by string concatenation | PASS | `api/streaks.php` uses prepared statements. The only concatenated parts are the constant `STREAK_BEST_RUNS` and the integer constant `STREAK_TOP` |
| Credentials outside `api/config.php` | PASS | none found in the new files |
| Hard-coded board sizes in the streak code | PASS | batch size 20 and refill at 5 are named constants (`STREAK_BATCH`, `STREAK_REFILL_AT`) |
| `sql/migrate-add-streak.sql` runs twice without error | PASS | ran twice against the local DB |
| `streaks` table in `sql/schema.sql` and `sql/schema-hosted.sql` | PASS | `schema.sql:89`, `schema-hosted.sql:87`, same columns and keys as the migration |

## API checks (curl and a PHP script, server on :8020)

| Check | Result | Evidence |
|---|---|---|
| `POST questions.php?streak=1` returns 20 questions | PASS | `{exclude: []}` gives 20 |
| 3 distinct choices, valid `correct` | PASS | all 761 questions checked across 39 batches: 0 problems. `correct` spread 258/250/253 |
| `choices[correct]` is the stored answer (cut at the first bracket) and the other two are the stored `wrong_1`/`wrong_2` | PASS | compared with the DB for all 761: 0 mismatches. No bracket or "accept" text in any choice |
| Arabic choices exactly when the question has Arabic | PASS | `question_ar` set and every `text_ar` filled for all 761 (all have Arabic); null otherwise |
| `exclude` respected, no repeats, ends with `[]` | PASS | 761 unique ids in 39 batches, then empty. Batch 2 overlap with batch 1: 0 |
| `seen` respected | PASS | with all but 5 ids seen, the 5 unseen come first. With all seen, the oldest-seen come first in the same order |
| Validation | PASS | `exclude:"x"`, `seen:[0]`, `seen:"a"`, `exclude:[1.5]`, `exclude:[-1]`, a non-JSON body, and an empty `[]` body all give 400 |
| `streaks.php` POST, missing, blank or whitespace first or last name | PASS | 400 "First name is required" / "Last name is required" |
| Bad streak | PASS | missing, 0, -1, "abc", 2.5, null, 100001: 400. 100000: 201 |
| Name over 30 characters, non-text name, non-JSON content type | PASS | 400, 400, 415. 30 Arabic characters: 201, 31: 400 |
| Control characters in names | PASS | `Line\nTab\tX` is stored as `Line Tab X` |
| Best per person, case-insensitive, with the run date | PASS | "team tester" 5, "Team Tester" 7, "TEAM TESTER" 7, "Team Tester" 2 leave one top-10 row with 7. On a tie, the earlier person ranks first and a later equal run does not move them (rank 1 stayed 1) |
| `rank` and `best` in the 201 response | PASS | e.g. `{"rank":2,"best":4}`. Rank 13 or more is reported correctly outside the top 10 |
| `GET` returns the top 10 as `{first_name, last_name, streak, date: "YYYY-MM-DD"}` | PASS | |
| Admin `GET ?all=1` and `DELETE` with a non-local Host | PASS | 403 (admin disabled for non-local hosts). Local host: 200 |
| `DELETE` unknown id, bad id, no id | PASS | 404, 400, 400. A known id: 200 `{deleted}` |
| `PUT` | PASS | 405 |
| `game-log.php` mode `streak` | PASS | 1 name gives 201 and the line `streak: Test Logname \| categories: all`. 2 names or none give 400. An unknown mode lists `streak`. `players`/`teams` still validate categories |
| Accent-insensitive person match (known limitation) | PASS (as documented) | "Jose" and "José" are one person, best 4 |

## UI checks: US-33 setup

| Criterion | Result | Evidence |
|---|---|---|
| Streak button and Streak leaderboard show only with exactly 1 entry in Players mode | PASS | 1 player: both visible. 2 players: hidden. Back to 1 (Remove): visible. Teams mode (1 team): hidden. Back to Players: visible |
| Maintenance mode hides both (and Start Game) | PASS | `start_game_hidden=1` hid all three and showed the overlay. The setting was restored to 0 |
| First click swaps the player row and category picker for First/Last name, hides Start Game | PASS | |
| Prefill from a one or two-word player name | PASS | "Team A" gives first "Team", last "A" |
| "Back to a normal game" undoes it, name kept | PASS | |
| First and last name required (1-30), inline errors, no start | PASS | both empty, last blank, first blank each show the field error and the summary message. `maxlength` is 30 |
| Timer validated like the board game | PASS | timer 3 shows "Timer must be a whole number of seconds between 5 and 600." and does not start |
| Enter in a name field starts the run | PASS | real Return key press |
| Start is logged as `streak: First Last \| categories: all` | PASS | log lines, including one per Play again |
| Start failure keeps setup and inputs | PASS | blocked `questions.php`: "Could not start the Streak Challenge: ...", fields intact, nothing stored |

## UI checks: US-33 questions and answering (1366x768)

| Criterion | Result | Evidence |
|---|---|---|
| Question shows "Category - points", picture, text, language button, Arabic first, 3 choices A/B/C | PASS | screenshots of text and photo questions |
| No Pause, Reset, Show Answer, scoring panel or helpers | PASS | all have no layout box in a streak question |
| Streak panel in the scoring column, name with the player colour, "Streak N" | PASS | |
| Right pick gives +1, choice green, "Correct! Your streak is N.", Next focused | PASS | |
| Next opens a new question (button and Enter, once only) | PASS | real Return key press advanced exactly 1 question. A document-level Enter also works |
| Wrong pick ends the run: pick red, answer green, "Wrong! The right answer was X.", See results, End run hidden | PASS | screenshot and state |
| Time's up ends the run (timer 5 s) | PASS | "Time's up!", answer green, See results. The timer does nothing after an answer |
| Refresh while open keeps count, question and time left | PASS | 51 s before, 50 s after the reload. Deadline-based |
| Refresh after a right answer comes back answered with Next | PASS | |
| Refresh after a wrong pick or time's up comes back with See results | PASS | |
| Refresh while loading the next batch | PASS | delayed `fetch` 3 s, empty queue: the answered question returns with a working Next and the queue is refilled |
| End run asks for confirmation, then saves | PASS | text "End the run now? Your streak of N is saved..."; with 0 the text says nothing is saved. Declining does nothing |
| Arabic toggle switches question and choices, direction `rtl`/`ltr`, saved across a refresh | PASS | EN and AR choice lists equal the batch data |
| More than 20 questions: refill, no repeats | PASS | 45 in a row, then all 761 in one run: 761 unique, the run ended with "761 in a row!" and was saved. Batches were fetched in the background |
| Fewer than 5 queued triggers the next batch with the run's ids excluded | PASS | network log and a zero-duplicate result |
| No page scroll at 1366x768 | PASS | all 761 questions, each in Arabic and English (1,522 views): `scrollHeight` equal to 768 and no horizontal overflow. The leaderboard with 10 rows is also 768 |
| Console errors | PASS | no page errors, unhandled rejections or `console.error` calls. The only console entries were two `ERR_CONNECTION_REFUSED` lines caused by deliberately stopping the server |

## UI checks: US-34 leaderboard

| Criterion | Result | Evidence |
|---|---|---|
| A streak of 0 is not saved | PASS | "No streak this time", "Only streaks of 1 or more go on the leaderboard.", no POST, nothing in the table |
| Saved run: headline "First Last: N in a row!" and "You are #R on the leaderboard." | PASS | |
| "Your best is still B." first when an earlier run was better | PASS | "Your best is still 46. You are #1 on the leaderboard." |
| Top 10, this person highlighted, case-insensitively | PASS | run as "team tester" highlights "Team Tester" (`is-me`) |
| Row shows name, "N questions" and the run date, e.g. "23 Oct 2026" | PASS (see BUG-ST-01) | name left, "46 questions · 23 Oct 2026" right |
| Play again (same names and timer) and New Game | PASS | Play again starts with the same name and 60 s. New Game returns to setup |
| Failed save: error with "Try again", the run stays stored | PASS | server stopped before See results: "Your streak could not be saved: Could not reach the server... Try again". Run stayed in `brainrush.streak` |
| Try again saves it and clears the stored run | PASS | (with a rejecting `fetch`, then restored) rank line shown, key removed |
| Leaving with an unsaved run asks first | PASS | Play again with a failed save asks "Your streak of 3 was not saved. Leave it unsaved?". Declining stays |
| Unsaved run survives a refresh | PASS | reloaded while the server was up: the run came back on See results |
| Setup "Streak leaderboard": no headline, Back returns to the setup as it was | PASS | typed name, streak fields and timer kept. A refresh on the leaderboard returns to setup, as documented |
| Names rendered as text | PASS | `<img ...>` and `<b>` in a saved name, in tampered question text, in choices and in the admin panel show as text, no script ran |
| Mobile (375x812): no horizontal scroll, panel stacks under the question, choices tappable, leaderboard rows stack | PASS | screenshot and rects; choices about 47 px high |

## Focus areas

| Area | Result | Evidence |
|---|---|---|
| Tampered `brainrush.streak` | PASS | 22 invalid variants all discarded to the setup and the key removed: bad JSON, version, empty or over-long names, bad colour, timer 1 or 99999, `over` not boolean, count above played or negative, current question not in the played list, 2 choices, `correct` 3, wrong pick while not over, bad `picked`, `ar` without Arabic text, missing Arabic choice, non-numeric deadline, negative `leftMs`, queue over 100, `[]`, `null`. A deadline 1 hour ahead is capped to the timer (59 s). A passed deadline restores as "Time's up!" with See results |
| Race: End run while loading the next batch | PASS | the run saved 46 once, the question screen did not reopen, no stray question |
| Race: double-click a choice | PASS | count 1, second click ignored. Also right click followed by a wrong click in the same tick keeps the first |
| Race: double-click Next or See results | PASS | one question opened; one POST to `streaks.php` (one row) |
| Failed batch while loading the next question | PASS | "Could not load the next question: ... Try Next again.", Next re-enabled, works once the server answers |
| Board game regression | PASS | see next table |

## Board game regression

| Check | Result | Evidence |
|---|---|---|
| Board starts, 3 categories, 18 cells | PASS | |
| A board question after a streak run shows scoring and no streak panel | PASS | no `streak` class, panel hidden, scoring, Pause/Reset and Show Answer visible |
| Pause and Resume freeze the timer | PASS | 51 s stayed 51 s while paused |
| Reset restarts the timer | PASS | 60 s |
| Helper 3 choices | PASS | three A/B/C choices shown, the ABC chip disabled |
| Helper Swap | PASS | new question "Swapped from History - 100", Swap disabled |
| Helper Skip | PASS | 600-point question skipped: -300, "No helpers left", back to the board |
| Scoring (Correct +100) | PASS | -300 became -200, cell closed |
| Restore a saved board game after a refresh | PASS | scoreboard identical, closed cells kept. An open board question restarts at the full timer |
| A stale `brainrush.streak` next to a saved board game | PASS | the board game is restored; New Game clears both keys |
| End Game, Results, New Game | PASS | |

## Admin (local host)

| Check | Result | Evidence |
|---|---|---|
| "Streak leaderboard" panel lists the runs (name, streak, date and time, newest first) with Delete and Reload | PASS | 18 rows, newest first, columns Name, Streak, Played, Actions |
| Delete asks for confirmation | PASS | declining keeps all rows (18) |
| Confirming removes the run | PASS | 17 rows, "Streak run of Mob Tester deleted." |

## Not tested

| Check | Result | Note |
|---|---|---|
| 401/403 for a real (non-local) host with admin credentials configured | PENDING (environment) | locally the 403 comes from the non-local-host rule. The 401 path needs `api/config.php` credentials, and none were used |
| The Admin panel against a DB without the `streaks` table, and the hosted MariaDB version | PENDING (environment) | not exercised so as to leave the local schema untouched. The leaderboard query uses `ROW_NUMBER() OVER`, which needs MariaDB 10.2 or later (local 10.4.32). Confirm the hosted version before deploy |

## Bugs and findings

No Critical or Major bugs.

**BUG-ST-01 (Minor, cosmetic)** Leaderboard row text. Steps: finish a run, read a row's text. Expected: "Ahmed Fahim · 13 questions · 18 Oct 2026" (US-34 wording). Actual: the name and "13 questions · 18 Oct 2026" are separate spans, the name on the left and the count and date on the right, with no "·" between the name and the count (`textContent` reads "1.Team Tester46 questions · 23 Oct 2026"). The on-screen layout is clean and matches the dev note ("1. Ahmed Fahim  13 questions · 18 Oct 2026"), so this is a wording question for the PO. Fix idea: add a visually hidden " · " for screen readers. `js/game.6819355e.js:2592-2598`.

**BUG-ST-02 (Minor, cosmetic)** Wrong message in `api/game-log.php` for a streak. Steps: `POST game-log.php {"mode":"streak","players":["A","B"]}`. Expected: a clear message. Actual: 400 "players must be a list of 1 to 1 names". Only seen by API callers.

**BUG-ST-03 (Minor, cosmetic)** Bidi in the feedback line. Steps: answer wrong or let time run out on an Arabic question. Actual: "Time's up! The right answer was A, <Arabic>." is one left-to-right sentence, so the closing full stop lands at the left edge of the Arabic text. Readable, only untidy. `js/game.6819355e.js:2380-2382`.

**Informational (no action required)**
- The DB clock and the PHP clock differ locally by one hour (log lines say 08:xx, `created_at` says 09:xx). The run date is the DB server's date, as documented.
- A player ranked below the top 10 gets the rank line ("You are #13") but no highlighted row, because the list shows only 10 rows.
- `js/game.6819355e.js`, `css/style.6240296b.css` and `js/admin.45dd5b1c.js` are edited in place under their old hashed names, as the dev note says. After the pre-commit hook re-hashes them, confirm `index.html` and `admin.html` point at the new names.
- Accent-insensitive person matching is the documented limitation (D-37).

## Cleanup done

- `streaks` table: all test rows removed with `TRUNCATE`. It was empty before, and the count is 0.
- `logs/game-2026-10-23.log`: my 14 lines removed (13 `streak:` lines and one board-game line). The 11 earlier lines are intact.
- Maintenance setting restored to 0. Dev server on :8020 stopped, and no process is listening on it.

## Verdict

**READY FOR PO.** All acceptance criteria that can be run locally pass, including the focus areas.

## PO acceptance (2026-10-23)

| Story | Verdict | Reason |
|---|---|---|
| US-33 Streak Challenge | **ACCEPTED with follow-ups** | Every setup, question, answering, layout and refresh criterion passes: solo Players mode only, first and last name, 3 choices from the stored wrong options (borrowing tested), all categories with unseen first, wrong pick or time's up ends the run, no repeats across batches, 1366x768 with no page scroll, phone stacking. BUG-ST-02 (game-log message) and BUG-ST-03 (Arabic full stop) fixed in fix loop 1. The PO checked the code: `read_players()` now gives 400 "streak mode takes exactly 1 name" first, and `showStreakFeedback()` puts the answer in its own `<bdi>` with `dir`/`lang` and a separate ".". The text is still set with `textContent` only. |
| US-34 Streak leaderboard | **ACCEPTED with follow-ups** | Save, rank, best-per-person (case-insensitive), tie order, run date, top 10, Try again, setup view with Back, API validation and admin delete all pass. BUG-ST-01 is fixed: `renderLeaderboardRows()` adds "· " to the meta and space text nodes, so a row reads "1. Ahmed Fahim · 13 questions · 18 Oct 2026". The PO corrected the guide and Terms wording: only streaks of 1 or more are saved, only the top 10 is public, and the start log stores the streak name. |

Follow-ups (backlog): FU-16 is the owner's Chrome check of the fix loop 1 changes and the re-hashed file names. FU-17 checks that the hosted MariaDB is 10.2 or later for `ROW_NUMBER()`. FU-18 covers the deploy order, the hosted 401 with admin credentials and a live smoke check. FU-19 checks Admin without the `streaks` table. D-37 is amended with (i) accent-insensitive matching, (j) the row text and (k) the window function. Nothing is shipped until FU-16 passes, and FU-17 must pass before the live deploy.

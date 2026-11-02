# Sprint 8: Daily Challenge, share, weekly leaderboard (US-43, US-46, US-45, D-46): test report

Tester: Senior Tester agent, 2026-11-02. Branch `sprint-8` (nothing committed). No application code was changed.

## Summary

- **Environment:** Windows 11, PHP 8.0.30 (XAMPP), MariaDB 10.4.32 (local `brainrush` DB, time zone Africa/Cairo, +2), `php -S localhost:8000` from the repo root (already running, left running), in-app browser. For concurrency and time checks, PHP CLI scripts outside the repo called `daily_challenge()` through `DAILY_INCLUDE_ONLY`. A scratch database `brainrush_t8` (dropped afterwards) was used for the schema and migration checks. A scratch git repo outside the project was used to try the pre-commit hook.
- **Viewports:** the in-app pane cannot be resized, so the game was loaded in same-origin iframes sized 1366x768 (desktop) and 375x812 (phone). Layout was checked with `getBoundingClientRect`, `scrollWidth` and `scrollHeight`. Clipboard, "Copied" and the touch share sheet were checked with **real clicks** in the top-level page (not an iframe) with `navigator.share` and `(pointer: coarse)` stubbed where a phone was needed. Android Back was emulated in `?source=twa` mode with `history.back()` after a real tap.
- **Counts (after fix loop 1):** 87 checks, **83 PASS, 0 FAIL, 4 PENDING** (S11 re-hash after the real commit, P1 real Android device, P2 hosted migration before code, P3 live smoke check and CDN purge). All four need the owner or a device. First round: 72 checks, 68 PASS, 4 PENDING, 3 Minor bugs; all three are now fixed and re-tested (RT1 to RT15, see "Re-test (fix loop 1)").
- **Bugs:** 0 Critical, 0 Major, 0 open. The three Minor bugs of the first round (BUG-8-01 stale backlog text, BUG-8-02 a Sunday-night run shown with Monday's date in "This week", BUG-8-03 an unfinished Daily run from an earlier day restored after midnight) are fixed and verified.
- **Verdict: READY FOR PO.** Every acceptance criterion and DoD item that can be run locally passes, and all three Minor bugs are fixed and re-tested. Decisions for the PO are listed under "Developer decisions".

Existing data found, and left exactly as found: `question_reports` 1 row (id 1, question 877, `dismissed`, 11:25:17, AUTO_INCREMENT 2); `streaks` 4 rows (ids 1, 8, 9, 10, AUTO_INCREMENT 11); `daily_challenge` empty; `questions` 869 rows, AUTO_INCREMENT 1719; `point_values` 100 to 600 all enabled; `start_game_hidden` 0; `logs/game-2026-11-02.log` 51 bytes (one line, 10:25).

## Static checks

| ID | Check | Result | Evidence |
|---|---|---|---|
| S1 | `php -l` on every `api/*.php` (incl. new `daily.php`) | PASS | no syntax errors in any file |
| S2 | `node --check` on `js/game.0887b978.js` and `js/share.js` | PASS | exit 0, no output |
| S3 | No `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `document.write` in game JS, share JS or API | PASS | grep finds nothing. Squares, rows and texts are built with `h()` / `textContent` |
| S4 | SQL built by string concatenation | PASS | `daily.php` and `streaks.php` use prepared statements with named parameters. The only plain queries are constants (`SELECT DISTINCT question_id FROM daily_challenge`, the enabled-points bank, the admin list). The `LIMIT` is the constant `STREAK_TOP`. The `INSERT IGNORE` uses `?` placeholders |
| S5 | Credentials outside `api/config.php`; `api/config.php` git-ignored | PASS | `git check-ignore -v api/config.php` prints `.gitignore:1`. No password, key or token strings in `daily.php`, `share.js`, the migration or the new JS. `api/config.php` and `InternalUse/` were not read |
| S6 | Hard-coded counts, time zone or board sizes | PASS | the count 3 is only `DAILY_QUESTIONS` (`api/daily.php:18`); "UTC" is only `GAME_TIME_ZONE` (`api/db.php:194`). The JS has no 3 and no zone: squares and "Question 2/3" come from `questions.length`, the countdown from `seconds_to_next`. `DAILY_MAX_QUESTIONS = 20` in JS is only a sanity cap on what the server sends. (The static copy in `how-to-play.html`, `llms.txt` and `README.md` says "3 questions" and "midnight UTC" in prose; that cannot come from code, see Findings.) |
| S7 | `daily_challenge` in both schema files; bodies identical; same definition as the migration | PASS | `diff` of `schema.sql` after `USE brainrush;` against `schema-hosted.sql` from its first `CREATE TABLE`, header comments and blank lines ignored: no difference. The git diff of both files only adds the table (no removed line). `SHOW CREATE TABLE` from the migration, from `schema-hosted.sql` on a scratch DB and on the local DB are identical (PK `(challenge_date, position)`, `uq_daily_question`, `idx_daily_question`, `fk_daily_question ... ON DELETE CASCADE`, `utf8mb4_unicode_520_ci`) |
| S8 | Migration run twice (migration rule) | PASS | on the local DB: exit 0 both times. On the scratch DB: `schema-hosted.sql` twice (exit 0, 7 tables), then `DROP TABLE daily_challenge` and the migration twice (exit 0) |
| S9 | US-45 needs no migration (DoD) | PASS | the SQL diff touches only `daily_challenge`; `streaks` is unchanged. The week filter uses `created_at` |
| S10 | Pre-commit hook handles the new `js/share.js` | PASS | in a scratch repo, `git add` of `share.js`, `game.0887b978.js`, `style.864c7129.css` and `index.html`, then `.githooks/hash-assets.sh`: `share.js` became `share.28bcd18c.js`, the two edited files got new hashes, and `index.html` now points at the three new names (the comment mention of `js/share.js` is rewritten too). Needs `git add js/share.js` before the commit, as the dev note says |
| S11 | After the real commit, `index.html` points at the new `js/game.*.js`, `js/share.*.js`, `css/style.*.css` (FU-16) | PENDING (after commit) | nothing is committed yet. Now `index.html` loads `css/style.864c7129.css`, `js/share.js` and `js/game.0887b978.js` and works |
| S12 | Docs and static pages | PASS (BUG-8-01 Minor) | README items 8-9 and the Security note, deploy guide (seven tables, upload list with `daily.php` and `js/share.*.js`, step 8.4 with the migration before the code and a smoke check), spec (files, DB, API, screens), `how-to-play.html` (Daily section, Share, weekly tab), `privacy.html` (Daily result stays in the browser, Share sends nothing to us) and `llms.txt` all describe the feature. `.htaccess` has no allow-list that would block `api/daily.php` or `js/share.js`. One stale sentence remains in the backlog (BUG-8-01) |

## API checks (curl and PHP CLI)

| ID | Check | Result | Evidence |
|---|---|---|---|
| A1 | `GET api/daily.php` shape | PASS | 200, `Cache-Control: no-store`; `{date:"2026-11-02", number:1, seconds_to_next, questions:[3]}`. Each question has `id`, `category_name`, `points`, `question`, `question_ar`, `image`, `image_credit`, `choices` (3 x `{text,text_ar}`) and `correct`. Three rows appear in `daily_challenge`. `seconds_to_next` 41903 at 12:21:37 UTC equals the time to 00:00 UTC |
| A2 | Same set on later requests | PASS | three more GETs: identical body (same md5). `?date=2020-01-01` is ignored (the date cannot be chosen by the client) |
| A3 | Concurrent first requests, one set, no duplicate rows | PASS | `php -S` serves one request at a time, so the race was run with PHP CLI processes released by one barrier timestamp. **12 processes** on an empty day: all 12 answers identical (same ids, same choice order), 3 rows. **16 processes** on another empty day: 16 identical answers, 3 rows. **20 processes on two empty days at once** (10 each): each day 10 identical answers, 3 rows per day. **Partial set** (positions 2 and 3 deleted) with 12 processes: all identical, the two positions refilled once, 3 rows |
| A4 | UTC day boundary (date, #N, countdown) | PASS | with `date.timezone` set to Asia/Tokyo, Pacific/Honolulu and UTC (same results each time): `2030-01-07T23:59:59Z` gives day 07, `seconds_to_next` 1; `23:59:59.999Z` day 07; `2030-01-08T01:30+02:00` day 07 (1800 s left); `2030-01-08T00:00:00Z` and `T00:00:00+00:00` give day 08, #N+1, a new set, 86400 s; `2030-01-07T20:00-05:00` gives day 08 (82800 s). #N is 1163 for 2030-01-07 (1162 days after the first stored day, +1) |
| A5 | Questions at enabled point values only | PASS | `point_values` 300, 500 and 600 set to disabled (restored afterwards), 6 new days created: every question is 100, 200 or 400 points (18 of 18) |
| A6 | Set quality | PASS | the 3 questions are in increasing points (100, 600, 600; 100, 100, 200 ...), in different categories in the sets inspected (6 sets with their categories listed, and the rest by ids), and no question was repeated across the days made while unused questions remained. Choices are cut at the first bracket ("The Mosque of Muhammad Ali", not the "(accept ...)" list). The A/B/C order comes from the date hash and is the same for every request |
| A7 | Methods | PASS | POST, PUT, DELETE, OPTIONS, PATCH and HEAD give 405 |
| A8 | `daily_challenge` missing: only Daily fails | PASS | table renamed for a minute (then renamed back): `daily.php` gives 503 `{"error":"The Daily Challenge is not available right now. Please try again later."}` with no details. `categories.php`, `questions.php?random=1`, `settings.php`, `points.php` and `streaks.php` (both periods) give 200 |
| A9 | `?period=week` on the Sunday/Monday boundary | PASS | DB in Cairo (+2), rows stored at 01:59:59 local (Sunday 23:59:59 UTC) is **not** in the week; 02:00:00 local (Monday 00:00:00 UTC) **is**; 2026-11-09 01:59:59 local (Sunday 23:59:59 UTC, end of the week) **is**; 2026-11-09 02:00:00 local (next Monday) is **not**. All four are in `?period=all` |
| A10 | `?period=` validation | PASS | 400 `{"error":"period must be one of: all, week"}` for `bogus`, empty, `WEEK`, `%20week`, `week%00`, `weeks`, `month` and `period[]=week`. `?period=all` and no period give 200 and the same list. `period=week&period=all` takes the last (`all`) |
| A11 | POST answer and ranks | PASS | 201 `{rank, best, week_rank, week_best}`: e.g. "Team E" 1 gives `{rank:2,best:7,week_rank:3,week_best:2}` (the earlier run of the same person with a different case, "team e", counts, D-37); a new name gives its own ranks; a streak of 50 gives rank 1 and week_rank 1. 400 for empty or missing name, streak 0, "x", 100001, and `{}`; 415 for a form body |
| A12 | All-time list unchanged | PASS | `streaks.php` and `?period=all` give the same list, the same shape `{name, streak, date}` and the same order (highest streak, earliest run on a tie, one row per person). `?all=1` still works |
| A13 | `game_week_bounds()` | PASS | PHP run under Asia/Tokyo: Sun 2026-11-01 23:59:59Z gives the week of Mon 26 Oct; Mon 11-02 00:00Z the week of 2 Nov; Sun 11-08 23:59:59Z still 2 Nov; Mon 11-09 00:00Z the next week; `-05:00` and `+02:00` offsets convert first; 2026-12-31 and 2027-01-03 23:59:59Z give the week of 28 Dec; 2027-01-04 00:00Z starts a new one |
| A14 | Weekly best run per person, tie order | PASS | the week list shows one row per person (case-insensitive), the person's best run **inside the week**, and on equal streaks the earlier run first (id order inside one second) |

## UI checks: Daily Challenge (US-43)

| ID | Criterion | Result | Evidence |
|---|---|---|---|
| D1 | Entry: "Daily Challenge" next to Players / Teams and Streak; any mode; hidden in maintenance and the Streak setup | PASS | 1366x768: the button is 180x42 at the right of the Streak button (532 to 792, then 800 to 980), same row. Teams mode: visible and enabled and starts a run. Streak setup open: `hidden`. `start_game_hidden=1` (restored to 0): both Daily and Streak hidden |
| D2 | Uses the setup timer; bad timer gives the inline error and starts nothing | PASS | timer 4, 601, 99999, "abc", empty, 30.5 and -3: "Timer must be a whole number of seconds between 5 and 600." plus "The Daily Challenge cannot start yet. Please fix the errors above."; no `brainrush.daily` saved; stays on setup. Timer 5 and 30 start the run and the countdown uses that value |
| D3 | Run screen: 3 questions, 3 choices, no Pause, Reset, Show Answer, helpers, scoring panel or End run | PASS | "Daily Challenge #1", "Question 1/3" (then 2/3, 3/3), exactly 3 choice buttons A/B/C, and `timer-pause`, `timer-reset`, `answer-btn`, helper chips and `streak-end` are not rendered. The panel hint says "Today's 3 questions are the same for everyone. A wrong answer or time's up scores 0." |
| D4 | Right scores, wrong or time's up scores 0 and moves on | PASS | right: "Correct!"; wrong: "Wrong! The right answer was C, ..." with the right and the picked choice marked and the choices disabled; time's up (waited 31 s on a 30 s timer): "Time's up! The right answer was C, ...", status "Time's up!". `results` was `[false, true, false]` for wrong, right, time's up. **Next question** (button or Enter) goes on with a full timer; **See result** after the last |
| D5 | Refresh keeps the deadline | PASS | reload with 12.8 s left: the saved `deadline` is identical before and after and the timer reads 12. An answered question comes back answered (feedback, Next, Report). A deadline moved into the past in storage and reloaded: the question is scored 0 as "Time's up!". A deadline moved far into the future is pulled back to one full timer |
| D6 | Arabic in the run | PASS | Arabic first when present (RTL question and choices); the language button switches question, choices and the feedback sentence; the language is kept across a reload; the English view is LTR. Picture questions too |
| D7 | Report (US-42) on a Daily question | PASS | Report appears only once answered (hidden while open). A real report from Daily question 390 stored one row with `question_id` 390 (test row removed). The dialog closes with Escape and Close |
| D8 | Result text and squares | PASS | "BrainRush Daily #1: 1/3", three squares in order red, green, red (`is-wrong`/`is-right`, `rgb(255,107,107)` / `rgb(76,209,138)`), `aria-label` "Question 1 wrong, Question 2 right, Question 3 wrong". A 3/3 run adds "Perfect!". An abandoned run (0/3) gives three red squares. The score count is `results.length`, never a literal |
| D9 | Share copies text plus link ("Copied") | PASS | real click: "Copied" in a `role="status"` span (the 4 s clear was seen on the error message of the same function; the code path is shared). The text passed to the clipboard was exactly `BrainRush Daily #1: 1/3` + newline + `🟥🟩🟥` + newline + `https://brainrush.integration.ninja/` (the canonical link, read from the page) |
| D10 | Phone share sheet | PASS | with `navigator.share` stubbed and `(pointer: coarse)` true, a real click calls `share({text})` once with that same text and shows no "Copied" and no clipboard write. `AbortError` (sheet closed) shows nothing and copies nothing. `NotAllowedError` falls back to the clipboard and shows "Copied" |
| D11 | Desktop browser that also has `navigator.share` | PASS (see decision 3) | with `navigator.share` stubbed but no coarse pointer, Share copies ("Copied") and does not call the sheet. This is the developer's decision; see "Developer decisions" |
| D12 | Played-today lock | PASS | after the result, New Game then Daily Challenge shows the same result and the countdown (no new run, `results` unchanged, also after a reload). A refresh on the result screen keeps the result screen. A different saved date (yesterday) lets a new run start |
| D13 | Countdown and the new day | PASS | "Next Daily Challenge in 11:34:08" at 12:25:52 UTC (equals the time to 00:00 UTC), ticking each second. With `nextAt` 4 s ahead: it reaches "A new Daily Challenge is ready!" and shows **Play the new challenge**; with yesterday's date saved, that button starts today's challenge with the previous timer (20 s), `results` empty |
| D14 | Corrupt or tampered `brainrush.daily` | PASS | invalid JSON, `{}`, `null`, `[]`, wrong version, too many results, bad question index, empty questions, non-numeric deadline and `correct: 9` are all discarded (key removed) and the setup opens with no error; no script error |
| D15 | Table missing, UI | PASS | Daily click: "Could not open the Daily Challenge: The Daily Challenge is not available right now. Please try again later.", stays on setup, button back to "Daily Challenge" and enabled, nothing saved. A board game (random categories) starts and a question opens normally. Only console line: the expected 503 |
| D16 | Picture questions at 1366x768 | PASS | a flag (200), a landmark with the longest answer (300) and a flag (400), open and answered, Arabic and English: `scrollHeight` 768 and `scrollWidth` 1366 in all 6 states; image 345x216 to 458x340; Report (63x29) does not overlap the heading or the image |
| D17 | Result screen layout | PASS | 1366x768: page 768 high, no horizontal scroll, Share 121x55 and New Game 168x55 in one row, squares 44 px. 375x812: page 812, no horizontal scroll, squares 37 px, buttons 55 px |
| D18 | Phone (375x812) setup and run | PASS | setup: Daily button 180x48, Streak button 260x48, no horizontal scroll. Question screens: no horizontal scroll (`scrollWidth` 360 = `clientWidth`); choices 302x48; Next 302x55. The question screen is 968 to 1070 px high and scrolls vertically, **the same as a Streak question on the phone (1070 px)**, so the Daily run adds no height |
| D19 | Android app mode (`?source=twa`), Back | PASS (emulated) | `brainrushApp` true; one history entry armed after the first tap. Back on an open question asks "Leave today's Daily Challenge? The questions you haven't answered score 0, and you can play it only once today."; Cancel keeps the question and the timer runs (109 to 105); OK ends the run at "BrainRush Daily #1: 0/3" with three red squares. Back on an answered question acts as Next (no confirm) and Back on the result goes to setup (`onResult` false, `done` stays true) |
| D20 | Board save, Streak and the double score untouched | PASS | a Daily run leaves `brainrush.game` null and saved version stays 3 for a board game; after a Daily run, the Streak panel shows "Streak Challenge", "Streak", its original hint and **End run**, and the Daily button is hidden while the Streak setup is open; the double-score popup (Surprise board, 400 points) shows "x2 Double score!", the page and header are inert and the timer waits (30, 30) then runs (29) after "Let's play" |

## UI checks: Share the game result (US-46)

| ID | Criterion | Result | Evidence |
|---|---|---|---|
| E1 | Single winner | PASS | `Team Red won BrainRush with 2300! Team Blue 1800, Team Green 900.` + newline + link (matches the AC example). A real board game played in the UI gave `Team Red won BrainRush with 100! Team Blue 0, Team Green −100.` |
| E2 | Tie, D-10 wording | PASS | 100, 100, 0 gives `It's a tie between Team Red and Team Blue in BrainRush with 100 each! Team Green 0.` The Results headline reads "It's a tie between Team Red and Team Blue". Tie not in first place of the setup order (0, 100, 100) gives `... between Team Blue and Team Green ... Team Red 0.` |
| E3 | Everyone tied | PASS | all 0: `It's a tie between Team Red, Team Blue and Team Green in BrainRush with 0 each!` (no trailing list); all 300 likewise |
| E4 | Negative scores | PASS | −100, −200, −300: `Team Red won BrainRush with −100! Team Blue −200, Team Green −300.`; tie at −200: `... with −200 each! Team Green −300.` The minus is the screen's "−" |
| E5 | One contestant and six contestants | PASS | one: `Team Red won BrainRush with 100!` + link (no stray punctuation). Six, in rank order: `Team Red won BrainRush with 2300! Team Blue 1800, Team Green 900, Team Orange −200, Team Purple −300, Team Cyan −1200.` |
| E6 | Clipboard vs share sheet, same module | PASS | the Results Share button goes through `js/share.js` like the Daily one: "Copied" in `#results-share-status` (`role="status"`) on a computer. The sheet and AbortError paths are the same code (D10) |
| E7 | Also after a refresh on Results | PASS | every case above was run after loading the page with a saved Results screen |
| E8 | Layout | PASS | 1366x768 and 375x812 with 6 players: no horizontal scroll, Share (120x55) sits beside New Game (171x55) in one row at the same top; the Results page height comes from the existing footer (857 and 881 px), not from Share |

## UI checks: Weekly Streak leaderboard (US-45)

| ID | Criterion | Result | Evidence |
|---|---|---|---|
| L1 | Two tabs "This week" / "All time" | PASS | two `button type=button` with `aria-pressed`, inside `role="group"` "Leaderboard period"; All time pressed on open (the screen opens as before); the list's `aria-label` follows the tab ("Top 10 streaks this week" / "of all time") |
| L2 | Week tab shows the best run per person of the week | PASS | with test runs on both sides of Monday 00:00 UTC, the tab lists only the in-week runs (one per person, best first), in the unchanged row format "1. Team H · 50 questions · 2 Nov 2026"; switching back gives the 10-row all-time list |
| L3 | Empty week | PASS | "No streaks this week yet. Be the first!" (list label "Top 10 streaks this week") |
| L4 | Both ranks on a finished run | PASS | a real Streak run for "Team E": "Your best is still 7. You are #5 this week and #3 of all time." (checked against the API ranks: week rank 5, all-time rank 3). With no week rank only "You are #N of all time." is shown (code path) |
| L5 | Highlight of the player's own row | PASS | the player's row has `is-me` in both tabs, matched case-insensitively ("team e" on All time, "Team E" on This week) |
| L6 | Layout | PASS | 1366x768: tabs 103x32 and 94x32, no horizontal scroll, the week tab fits 768. 375x812: tabs 107x48 and 98x48 (touch targets), no horizontal scroll. Screenshot at phone width checked by eye |
| L7 | Existing all-time behaviour unchanged | PASS | same rows, order, format, ranks and `Your best is still N.` sentence (A12); the Streak run, the End run confirm and the leaderboard from setup (Back) work as before |
| L8 | Ad slot unchanged (D-41) | PASS | the `#ad-leaderboard` aside is not in the diff; ads are off locally (`ads_enabled` 0) so no slot is shown |

## Regression and console

| ID | Check | Result | Evidence |
|---|---|---|---|
| R1 | Board game: setup, start, board, question, scoring, Back to Board, End Game, Results | PASS | played with "Team Red", "Team Blue", "Team Green" and "Team A": correct and wrong scoring, Results ranks and "Team Red wins!" are as before |
| R2 | Double score (D-40) | PASS | see D20 |
| R3 | Report (US-42) on a board question | PASS | Report visible on an open board question, dialog opens (page inert), Escape closes it, page stays 768 high |
| R4 | Streak Challenge | PASS | start, right and wrong picks, "End run" confirm, the run is saved and the leaderboard opens with the rank line; "Streak" label and hint return after a Daily run (D20) |
| R5 | Setup with the new button at 1366x768 and 375x812 | PASS | no overlap, no horizontal scroll (setup is a scrolling page as before) |
| R6 | Console and script errors | PASS | no `error` or `unhandledrejection` event in the game (board, Streak, Daily, share, leaderboard, phone, TWA mode). The only console error is the expected 503 from the deliberate missing-table check |
| R7 | Admin, `.htaccess`, `sw.js`, `terms.html` | PASS | not changed in this sprint (git status), so no new Admin behaviour; no Admin panel reads `daily_challenge`, so it cannot break when the table is missing |

## Pending items (need the owner or a device)

| ID | Item | Result | Notes |
|---|---|---|---|
| P1 | Real Android device: share sheet in the app (US-40) and the system Back button | PENDING (environment) | emulated here (D10, D19). A phone with the app installed is the real proof |
| P2 | Hosted DB: migration run before the code (DoD, deploy guide 8.4) | PENDING (environment) | owner step in phpMyAdmin; the file is re-runnable (S8) |
| P3 | Live: `GET /api/daily.php` smoke check, `?period=bogus` gives 400, hash check of the deployed `index.html`, CDN purge | PENDING (environment) | after the deploy (guide 8.4 and 6) |
| S11 | Hook run on the real commit | PENDING (after commit) | the scratch-repo run passed (S10) |

(S11 is counted once, under Static checks.)

## Definition of Done (Sprint 8)

| DoD item | Result | Evidence |
|---|---|---|
| `sql/migrate-add-daily-challenge.sql` is re-runnable, run twice locally, and written to run on every DB before the code; `daily_challenge` in both `schema.sql` and `schema-hosted.sql` (bodies identical) | PASS (hosted run PENDING) | S7, S8, P2 |
| 3 questions and the UTC day boundary follow D-46 and are each set in one place | PASS | S6, A4 (`DAILY_QUESTIONS` in `api/daily.php`, `GAME_TIME_ZONE` in `api/db.php`; the browser takes both from the server's answer) |
| US-45 needs no migration (no schema change in the diff) | PASS | S9 |
| A DB without the new table breaks only the Daily feature (migration rule, FU-19) | PASS | A8, D15 |
| Layout 1366x768 and 375x812 with no horizontal scroll; board and question screens not pushed past one screen | PASS | D16 to D18, E8, L6 (the Daily question screen on the phone scrolls vertically like the Streak one, which is the existing behaviour) |
| Saved game: board save untouched, Daily in its own key | PASS | D20 (`brainrush.game` stays null or version 3; `brainrush.daily` is separate) |
| Public writes: no new public write; the existing POST validates every field | PASS | `daily.php` is GET only (A7); POST validation A11 |
| Deploy hygiene: re-hash and `index.html` names, privacy text | PASS (re-hash PENDING) | S10, S11, S12 |
| `php -l` clean, prepared statements, `textContent` only, no credentials committed, `config.php` ignored | PASS | S1 to S5 |

## Developer decisions (for the PO)

None of these contradicts an acceptance criterion except the third, which is a judgment call on one sentence.

1. **#N starts at 1 on the first day a database served a challenge** (local and live each count from their own first day). The AC only says "#N". If the first day's questions are all deleted (the cascade removes their rows), the numbering shifts by that day. Fine for a launch; the owner may want a fixed start date if live and local numbers should agree.
2. **"All time" is the default tab**, "This week" is listed first. US-45 says only that the tabs exist; no contradiction. The PO may prefer the week as the default, since a weekly board is the new draw.
3. **The share sheet opens only on touch devices** (a coarse pointer and the Web Share API); desktop Chrome and Edge on Windows or macOS, which do have a share dialog, copy and show "Copied" (D11). US-46 reads "Given a device with a share sheet, then that sheet opens. Otherwise the text is copied". Taken literally, a Windows desktop has a sheet; the developer reads "device with a share sheet" as phones and tablets. I tested both paths and they work; the PO should confirm the reading (the cost of the other reading is a system dialog on a laptop).
4. **Daily button rules:** shown in any mode and with any number of players; hidden in maintenance mode and during the Streak setup; uses the setup timer (so friends who play with different timers compare results that are not like for like).
5. **Android Back:** open question asks to leave (the rest score 0), answered question acts as Next, result acts as New Game. There is no Back or "Leave" on the web, only in the app (see BUG-8-03).
6. **Side effects worth knowing:** Daily questions are added to the device's played list (so later board games and runs avoid them until "Forget played questions"); Daily runs are not written to the game log; a run that crosses midnight UTC stays under the day it started; questions without stored wrong options (none locally; unknown live) could get different borrowed choices per player, as the dev note says; the app asks the server once per Daily open, so the result cannot be shown offline.

## Bugs and findings

No Critical or Major bugs. Three Minor, all fixed in fix loop 1 and verified (see "Re-test (fix loop 1)").

**BUG-8-01 FIXED, verified in the re-test (RT1). BUG-8-01 (Minor, documentation)** The backlog still says "10" in the first US-43 criterion. Steps: open `docs/product-backlog.md` line 445. Expected: "A second request at the same moment gets the same 3, with no duplicate row" (D-46 changed 10 to 3 and the other lines of the story were updated). Actual: "... gets the same 10, with no duplicate row." File: `docs/product-backlog.md:445`. No behaviour is affected (the code and the other texts say 3).

**BUG-8-02 FIXED, verified in the re-test (RT4, RT5, RT11, RT12). BUG-8-02 (Minor, known limitation in the dev note)** A run saved on Sunday 22:00 to 23:59 UTC can appear in "This week" with Monday's date on a database that is not on UTC. Steps: with the local DB (Africa/Cairo, +2), insert a streak run at `2026-11-09 01:59:59` (Sunday 23:59:59 UTC) and open Streak leaderboard, "This week". Expected: a run in the week of 2 to 8 November shows a date inside it. Actual: it is listed in the week but its date reads "9 Nov 2026". Cause: the row's `date` is the DB's local date (`substr(created_at, 0, 10)`), while the weekly bounds are UTC (`api/streaks.php`, `top_streaks()` and `best_runs()`). The week filter itself is correct (A9). A DB already on UTC (the hosted one is likely so, to be confirmed by the owner) is not affected; D-37 already accepted dates as the DB shows them. Fix idea if wanted: select `created_at` converted to UTC, or show no day for the weekly tab.

**BUG-8-03 FIXED, verified in the re-test (RT2, RT3, RT6 to RT10). BUG-8-03 (Minor, UX)** An unfinished Daily run from an earlier day is restored after midnight with fresh timers, and the web has no way to leave it, so today's challenge stays out of reach until the old run is played out. Steps: start a Daily run, answer question 1, close the tab; open the site on a later day (emulated: set `date` and `deadline` of the saved `brainrush.daily` one day back, then reload). Expected: the old run is closed (the unanswered questions score 0) and the setup, or "A new Daily Challenge is ready!", is shown. Actual: the page reopens on the old question, scores it "Time's up!", and **Next question** opens question 2 of the old challenge with a full timer (30 s); the player must play or time out all remaining questions of yesterday's challenge (up to 2 x the timer) before New Game and the new challenge. In the Android app Back asks to leave; on the web there is no Leave control (D-46/US-43 give no End run). Where: `restoreSavedDaily()` (about line 3780 of `js/game.0887b978.js`) restores any unfinished run without comparing it with `nextAt`. Fix idea: if `Date.now() >= saved.nextAt` on restore, fill the unanswered results with false and show the result screen (which already offers "Play the new challenge").

**Informational (no action required)**
- **Leaderboard page height:** at 1366x768 the all-time leaderboard with 10 rows is 813 px high (the existing footer starts at 708); the tabs add 32 px plus margin. Without the tabs the page would still be about 773 px by the same measure, so this is the existing footer behaviour, and the leaderboard is not a board or question screen. The week tab with few rows fits 768.
- **Static copy repeats the numbers:** `how-to-play.html`, `llms.txt` and `README.md` say "3 questions" and "midnight UTC". They cannot be generated from code; if the owner changes D-46 later, these three texts and `index.html`'s comment need a manual edit along with `DAILY_QUESTIONS` and `GAME_TIME_ZONE`.
- **HEAD requests** to `api/daily.php` answer 405, like the other POST-or-GET endpoints that only declare GET.
- **Refilled positions are not re-sorted by points:** after a question of a stored day is deleted, the refilled position may be easier or harder than its neighbours (the first pick of a day is sorted by points). Rare and harmless.
- **Red and green squares** are told apart by colour only on screen (the `aria-label` and the shared emoji text carry the result). The AC asks for green and red.
- **Untracked files not part of the story:** `package.json`, `package-lock.json`, `.claude/launch.json` and `googlebbe9a71d60b82d1a.html` are untracked; `.gitignore` now ignores `node_modules/`. The owner decides whether to commit them. `js/share.js` must be staged before the commit (S10).

## Re-test (fix loop 1)

Tester: Senior Tester agent, 2026-11-02, after the developer's "Fix loop 1" in `docs/sprints/sprint-8-dev.md` (`closeDaily()` and the changed `restoreSavedDaily()` in `js/game.0887b978.js`; `game_date()` in `api/db.php`; `top_streaks()` and `best_runs()` in `api/streaks.php`; the backlog sentence). Same environment and method as above (dev server on :8000, in-app browser with iframes sized 1366x768 and a real-click top-level page for Android Back, DB in Africa/Cairo +2). No code was changed. The original repro steps were used for each bug.

| ID | Check | Result | Evidence |
|---|---|---|---|
| RT1 | BUG-8-01: backlog US-43 criterion says 3 | PASS | `docs/product-backlog.md:445` now reads "gets the same 3, with no duplicate row"; no "same 10" is left in `docs/*.md` |
| RT2 | BUG-8-03, original repro: start a Daily run, answer question 1, move the saved `date` and `deadline` one day back, reload | PASS | the page opens on the **result** screen: "BrainRush Daily #1: 1/3", squares green, red, red, "A new Daily Challenge is ready!" and the **Play the new challenge** button. Saved run: `done` true, `onResult` true, `results` [true, false, false]. No old question and no fresh timer appear. No script error |
| RT3 | BUG-8-03: Play the new challenge | PASS | the server's date (2026-11-02, #1) differs from the saved date (2026-11-01), so a new run starts at "Question 1/3" with the previous timer (30 s) and empty results |
| RT4 | BUG-8-02, API: dates in UTC (DB in Cairo, test rows) | PASS | stored 2026-11-02 01:59:59 (Sunday 23:59:59 UTC) reads `"2026-11-01"` and is not in `?period=week`; 2026-11-02 02:00:00 reads 2026-11-02 and is in the week; 2026-11-09 01:59:59 (Sunday 23:59:59 UTC) reads **2026-11-08** and is in the week (was 11-09); 2026-11-02 00:30:00 reads 2026-11-01; 2026-10-31 23:59:59 reads 2026-10-31; 2026-07-01 02:30:00 (Cairo summer time, +3) reads 2026-06-30, so the real zone rules are used. Earlier rows keep their dates (23 and 26 Oct). Same on both tabs |
| RT5 | BUG-8-02, UI: both leaderboard tabs | PASS | All time and This week list the same UTC dates as the API ("7. Team H · 4 questions · 2 Nov 2026", "Team C · 3 questions · 8 Nov 2026" in the week tab, "Team F · 7 questions · 30 Jun 2026"); format, row order, `aria-pressed`, list label and highlight are unchanged; a date shown in "This week" is always inside Monday to Sunday |
| RT6 | Normal end of a Daily run (`finishDaily()` now uses `closeDaily()`) | PASS | a run played out (wrong, right, wrong) shows "BrainRush Daily #1: 1/3", the squares in order, "Next Daily Challenge in 11:13:51" (equals the time to 00:00 UTC) and no Play button; saved `done` true, `current` null, `results` 3 long |
| RT7 | Played-today lock and countdown | PASS | reload on the result keeps it and the countdown goes on; New Game then Daily Challenge shows the same result and countdown, with `results` unchanged (no new run) |
| RT8 | A restored unfinished run from today | PASS | answered question 1, reload: the run opens on "Question 2/3" with the saved deadline unchanged (timer 29) and `results` [false]; it is not closed (`nextAt` is still ahead) |
| RT9 | Ready state when the server still says the same day | PASS | with `nextAt` 3 s ahead on the result screen: after 4 s it shows "A new Daily Challenge is ready!" and the Play button; Play gets the same server date, so the result stays and the countdown comes back (11:13:28), Play hidden, `results` unchanged |
| RT10 | Android Back "Leave" in `?source=twa` (after a real tap, one history entry armed) | PASS | on an open question 2/3, Back with Cancel keeps the question and shows the confirm text once; Back with OK ends the run: "BrainRush Daily #1: 1/3", squares green, red, red, `current` null, countdown running, no Play button; Back on the result goes to setup (`onResult` false, `done` true); Daily again shows the same result. (A first attempt without a real tap left the page, which is the documented "no entry before the first tap" limitation) |
| RT11 | Rank line and the Streak save | PASS | a real Streak run "Team J" (right, then wrong) saved 1: "Team J: 1 in a row!" and "You are #4 this week and #12 of all time." (3 week runs above, 11 all-time runs above, checked against the DB); the player's own row is highlighted on This week. POST answers `{rank, best, week_rank, week_best}`: "Team H" 4 gives `{7, 4, 2, 4}`, "team b" 1 gives `{6, 4, 1, 4}` (case-insensitive person, D-37); streak 0 and an empty name still give 400 |
| RT12 | Ranking, order and validation unchanged | PASS | the all-time order is the same as before the fix (highest streak, earliest run first, one row per person); `?period=bogus` gives 400; no period equals `?period=all`; `php -l` clean on every `api/*.php` and `node --check` OK on the game JS; no `innerHTML` |
| RT13 | Admin streak list | PASS | `GET ?all=1` and the Admin Streak panel (14 rows) still show `created_at` as the DB stores it (local time, e.g. "2026-11-09 02:00:00" and "2026-11-02 14:47:21"), with Delete and the same newest-first order. Informational: Admin shows the DB's local time while the public board shows the UTC date; that is by design of the fix |
| RT14 | Other callers of `closeDaily()` | PASS | the abandoned run (Back Leave, RT10) and the expired run on reload (RT2) both give three result squares as designed. The board game, Report, Streak and the double score are not touched by the fix and passed in the first round (the Streak run in RT11 passed again) |
| RT15 | Console and script errors | PASS | no `error` or `unhandledrejection` event in any iframe or page in this loop. The browser's console buffer still shows the single 503 line from the first round's deliberate missing-table check |

Re-test cleanup: `daily_challenge` emptied (0 rows, as found); `streaks` test rows (ids 11 to 20, "Team A" to "Team J") deleted, ids 1, 8, 9, 10 untouched, AUTO_INCREMENT back to 11; `question_reports` still only id 1 (11:25:17, `dismissed`), AUTO_INCREMENT 2; `questions` 869 rows, AUTO_INCREMENT 1719; `start_game_hidden` 0; `logs/game-2026-11-02.log` cut back to its one 10:25 line (51 bytes); the browser's `localStorage` and `sessionStorage` for `localhost:8000` cleared and the test iframes removed. `api/config.php` and `InternalUse/` were not read or changed. The dev server on :8000 was left running.

## Cleanup done (first round)

- `daily_challenge`: all test rows deleted (the real day and the 2030 test days); 0 rows, as found. The table was renamed away twice for the missing-table checks and renamed back.
- `streaks`: my test runs (ids 11 and up: "Team A" to "Team H", "team e", "Team E", "Team Z") deleted; the four earlier rows (ids 1, 8, 9, 10) are untouched; AUTO_INCREMENT set back to 11.
- `question_reports`: my test report (id 2, question 390, "Team A test note") deleted; the one earlier row (id 1, 11:25:17, `dismissed`) is untouched; AUTO_INCREMENT back to 2.
- `point_values`: 300, 500 and 600 re-enabled (all six enabled as found). `settings.start_game_hidden` back to 0.
- `logs/game-2026-11-02.log`: my seven test lines removed; back to the single 10:25 line (51 bytes).
- Scratch database `brainrush_t8` dropped; the temp folder with my scripts and the scratch git repo deleted. The browser's `localStorage` for `localhost:8000` cleared and the test iframes removed. `api/config.php` and `InternalUse/` were not read or changed. `git status` still lists the same 24 entries as at the start. The dev server on :8000 was left running as found.

## Verdict

**READY FOR PO.** US-43, US-46 and US-45 meet every acceptance criterion that can be run locally, and every Sprint 8 DoD item passes except the steps only the owner can do (hosted migration before the code, the hash check after the commit, the live smoke check and a real Android phone). The three Minor bugs of the first round are fixed and re-tested (87 checks, 83 PASS, 0 FAIL, 4 PENDING); no bug is open.

# US-59 Speed Round: test report (D-73)

Branch `speed-round` (uncommitted), tested 2026-11-25. Tester: Senior Tester (verify only; no application code changed).

## Summary

- **Environment:** Windows 11; PHP 8.0.30 on `localhost:8011` (own server, started and stopped by the tester on three passes); MariaDB already running (not touched). Chrome driven through the repo's Playwright (`node_modules`) for layout, flows and reruns; the browser pane for manual steps. `question-stats.php` and `game-log.php` were stubbed (201) in every browser run, so no stats rows and no log lines were written. `settings.php` GET was stubbed to `speed_enabled: 1` in the failure and rerun flows, so those runs wrote nothing either. Nothing ran on `localhost:8000`.
- **Totals after fix loop 1 (acceptance-criteria tables, 88 rows):** 82 PASS, 0 FAIL, 6 PENDING (environment). Of the 82 PASS rows, 14 rest on code review or static checks only (marked "(code)"); M1 and M3 are partial runs. The re-test after fix loop 1 is in its own section below.
- **Bugs:** BUG-59-03 (time left lost on reload without pagehide) and BUG-59-02 (failure-line copy) were fixed in fix loop 1 and re-tested PASS. BUG-59-04 (countdown politeness) was applied. BUG-59-01 is a PO note only (D-73 o). No Critical or Major bugs.
- **Verdict: READY FOR PO.** The owner should decide on the Minor items; none blocks the story. The PENDING items need a phone, an Android app, a screen reader or the live site.

## D-73 traceability (rules a to r)

| Rule | What it says | Where it is checked | Result |
|---|---|---|---|
| a | Score = correct answers | R1 | PASS |
| b | One clock, 30 s start, never above 60 s | C1, C8 | PASS |
| c | Time by speed: 2 s / 4 s / 6 s / slower = +5 / +3 / +2 / +1 | C2 to C5, C6 | PASS |
| d | Wrong answer: −3 s, correct choice shown, no score change | C7 | PASS |
| e | Run ends at 0; open question at time-out sends no stat; right and wrong answers sent and marked seen | C11, T1, T2, T3 | PASS |
| f | Personal best only, on the device; no leaderboard | R2, R3, R11 | PASS |
| g | Anti-cheat as Streak (checked in the browser) | Code: the correct index travels in the question payload, as in the Streak (D-37 g). No server check added. | PASS (code) |
| h | Questions from `questions.php?streak=1`, 3 choices, pictures included | Calls seen as `api/questions.php?streak=1`; 3 choices in state; picture questions in F1 to F4 | PASS |
| i | Fair timing: picture start on load, freeze during feedback, pause on hidden tab, time kept over a reload | F1 to F9 (F9 fixed in loop 1) | PASS |
| j | One saved solo run; starting a Speed Round never wipes a Streak | M1, M2 | PASS |
| k | Entry: button, NEW badge, rules card once, 3-2-1 countdown | E1 to E7 | PASS |
| l | Result: big score, best line, fastest and average, Play again, Share | R1 to R10 | PASS |
| m | Constants block marked "playtest and tune" | Row O1 (`js/game.3d7ac9bd.js:117` and the block at L119-135) | PASS |
| n | Fastest and average over correct answers; "–" when none | R6 | PASS |
| o | "+N s" shows the tier value even when the cap absorbs part of it | Row O2; PO may revisit (BUG-59-01 below) | PASS (PO note) |
| p | The language picked stays for the next questions of the run | Row O3 | PASS |
| q | End run button with a frozen-clock confirm; Android Back does the same | Row O4 (End run); Android Back: P1 | PASS (End run); Back PENDING |
| r | No Report button during a run; no read-aloud beyond the open question | Row O5 (Report hidden; read-aloud code) | PASS |

## Acceptance criteria and rules

### Static and API

| # | Check | Result | Evidence |
|---|---|---|---|
| S1 | `php -l` on all `api/*.php` | PASS (code) | 17 files, no syntax errors |
| S2 | No `innerHTML` with data in the new code | PASS (code) | Diff grep: none added; the Speed code uses `textContent` and text nodes |
| S3 | No concatenated SQL in the API diff | PASS (code) | Diff grep: none |
| S4 | No credentials in the diff | PASS (code) | Diff grep: none |
| S5 | No hard-coded board sizes or limits outside the constants block | PASS (code) | Numbers are in `SPEED_*` constants (`js/game.3d7ac9bd.js` L119-135) |
| S6 | `api/config.php` is git-ignored | PASS (code) | `.gitignore:1` |
| S7 | No emoji in added lines (HTML, i18n, JS, CSS) | PASS (code) | Scan of the added lines: 0 code points in emoji ranges |
| A1 | `GET settings.php` with no row returns `speed_enabled: 0` | PASS | Returned 0 before any PUT |
| A2 | `PUT speed_enabled=2` returns 400 | PASS | `speed_enabled must be a whole number between 0 and 1` |
| A3 | `PUT speed_enabled="yes"` returns 400 | PASS | Same message |
| A4 | `PUT speed_enabled=1` and `=0` return 200 and persist | PASS | Response and GET both show the value |
| A5 | `POST game-log.php {mode:"speed"}` returns 201; a name sent with it is ignored | PASS | 201; line logged as `speed: - \| categories: all` |
| A6 | `POST game-log.php {mode:"bogus"}` returns 400, listing `speed` | PASS | `mode must be one of: players, teams, streak, integration, crossword, speed` |
| A7 | Admin checkbox saves (UI) and reloads with the saved value | PASS | Playwright: PUT returned 200; after reload the box was unticked |

### Entry (US-59 "Admin and entry")

| # | Check | Result | Evidence |
|---|---|---|---|
| E1 | `speed_enabled` 0: button hidden | PASS | `#speed-open-btn` hidden |
| E2 | `speed_enabled` 1: button shown in the setup row | PASS | Visible next to Daily Challenge; pane screenshot |
| E3 | NEW badge on a device that has not played | PASS | `#speed-new` visible |
| E4 | NEW badge gone after the first run | PASS | Pane: after a real run `brainrush.speed.seen = 1` and the badge is hidden |
| E5 | Rules card (three lines) on the first run only | PASS | "Answer fast to earn time / Wrong costs 3 s / Every correct answer is a point" |
| E6 | 3-2-1 countdown before a run | PASS | Countdown shows "3", then the run starts |
| E7 | Later runs and Play again: countdown only | PASS | Play again: no card (pane and Playwright) |
| E8 | First batch fails: stays on setup with a message, no run | PASS | "Could not start the Speed Round: Internal server error"; no run saved |
| E9 | Button hidden in maintenance mode and in Streak setup | PASS (code) | `dom.speedOpenBtn.hidden = !s \|\| down \|\| s.streak \|\| !s.speedOn` (L1800); `down = state.setup.maintenance` (L1775); Streak setup shows no button |

### Clock (D-73 b, c, d, e)

| # | Check | Result | Evidence |
|---|---|---|---|
| C1 | Starts at 30 s | PASS | Stored `leftMs` 30000 at the start |
| C2 | Answer in 2 s or less: +5 s, "Lightning!" | PASS | Answered at 0.91 s: +5 s |
| C3 | 2 to 4 s: +3 s, "Quick!" | PASS | Answered at 3.2 s: +3 s |
| C4 | 4 to 6 s: +2 s, "Nice!" | PASS | Answered at 5.35 s: +2 s |
| C5 | Slower: +1 s, "Correct!" | PASS | Answered at 7.0 s and 18.7 s: +1 s each |
| C6 | Tier boundaries inclusive (`ms <= maxS*1000`) | PASS (code) | `speedTier` (L4680); boundaries not hit exactly in a run |
| C7 | Wrong answer: −3 s, red pick, green correct choice, score unchanged | PASS | Clock 33.08 → 30.08; `is-wrong` and `is-right` set; score 1 → 1 |
| C8 | Clock capped at 60 s | PASS | Nine fast answers: 60.000 s exactly |
| C9 | Clock frozen during ~0.8 s feedback | PASS | Timer text and `leftMs` unchanged over 800 ms |
| C10 | Red under 10 s | PASS | `is-low` set when the display reaches 10 (remaining under 10 s) |
| C11 | Run ends at 0; open question shows "Time's up!", then the result | PASS | Time's up text shown; result after ~0.8 s |
| C12 | Mid-run batch fails: clock frozen, "Try again" shown | PASS | "Could not load the next question: Internal server error Try again."; clock 35 → 35 over 1.5 s |

### Fair timing (D-73 i)

| # | Check | Result | Evidence |
|---|---|---|---|
| F1 | Picture question: clock starts when the picture has loaded | PASS | Picture delayed 4.5 s: question visible at 2.65 s, clock starts at 4.05 s (on load) |
| F2 | Picture fails to load: question starts at once | PASS | Image aborted: clock starts 35 ms after visible |
| F3 | Picture never loads: question starts after 5 s | PASS | Image delayed 12 s: clock starts 4.98 s after visible |
| F4 | SVG flag questions (62 in the bank) use the same path | PASS | Flag injected as the first question of each batch; wait and cap as above |
| F5 | Hidden tab pauses under "Paused / Tap to resume"; clock unchanged | PASS | Hidden for 3 s: `leftMs` 48.284 before and after; card stays until the tap |
| F6 | Paused time not counted for the answer time | PASS (code) | `freezeSpeedClock` stores `elapsedMs`; `goSpeedLive` resets `speedShownAt` |
| F7 | Normal reload mid-run: back paused with the same time left | PASS | Reload at ~40 s: restored `leftMs` 39.6086 s, unchanged after 3 s; score 10 kept |
| F8 | Next pictures prefetched | PASS (code) | `addToQueue` and `prefetchSpeedImages` |
| F9 | Reload after the page closed with no pagehide: time left kept | PASS (fixed in loop 1) | Before the fix: reopened at 9.7 s. After: paused at 20 s (see Re-test R1) |

### Stats, seen and logging (D-73 e, f, US-47)

| # | Check | Result | Evidence |
|---|---|---|---|
| T1 | `markSeen` for each answered question | PASS | `brainrush.seenQuestions` holds the three answered IDs |
| T2 | `question-stats` for correct and wrong answers | PASS | Payloads: `outcome: correct`, `wrong`, `correct` for the three answers |
| T3 | No `question-stats` for the question open at time-out | PASS | Time-out question (ID 1681) sent nothing and was not marked seen |
| T4 | One `game-log` line per run, mode `speed`, no name, `categories: all` | PASS | Payload `{"mode":"speed"}`; server line `speed: - \| categories: all` |
| T5 | Stats and log use fetch with `keepalive` where specified | PASS (code) | `sendQuestionStat` (L2071) |

### Results (D-73 f, l and the US-59 result list)

| # | Check | Result | Evidence |
|---|---|---|---|
| R1 | Big score = correct answers | PASS | Score 10 shown; "10 correct" wording |
| R2 | "New personal best!" when beaten | PASS | First run 1, then 10 |
| R3 | "N away from your best (B)" | PASS | "10 away from your best (10)" with score 0; "8 away" with score 2 |
| R4 | "You matched your best (N)!" | PASS (code) | `speed.tiedBest` path, `r.score === r.prevBest`; not hit in a run |
| R5 | "No correct answers this time" with a zero score | PASS | Shown at 0 correct with no best |
| R6 | Fastest and average over correct answers; "–" when none | PASS | Fastest 0.3 s, average 0.9 s; "–" with none |
| R7 | Play again is one tap, countdown only | PASS | Single click → 3-2-1 |
| R8 | Share EN with correct answers | PASS | "Mokh Rush Speed Round: 2 correct, fastest 0.3 s" + site link (rerun); zero-correct form "Mokh Rush Speed Round: 0 correct" + link |
| R9 | Share AR | PASS | "جولة السرعة في مخ رش: إجابة صحيحة واحدة، الأسرع ‪0.1‬ ث" + link |
| R10 | New Game on the result: setup again | PASS | Setup shown; `brainrush.streak` kept |
| R11 | Personal best stored on the device only (`brainrush.speed`) | PASS | No request carries it; privacy page says so |

### Other modes (US-59 "Saved runs" and regression)

| # | Check | Result | Evidence |
|---|---|---|---|
| M1 | Starting a Speed Round does not wipe a saved Streak run | PASS (code, partial run) | Speed paths never call `newGame`, `streak = null` or `saveStreak`. A reload with a Streak run in progress restored it (ID 643). The UI cannot start a Speed Round with a live Streak run (the only exits end it), so the start itself is checked by code only. |
| M2 | Only one saved solo run restored (`brainrush.lastSolo`) | PASS | With `lastSolo=streak`, the reload restored the Streak run and not the finished Speed result |
| M3 | Board game still works | PASS (partial) | 6 categories ticked, start, board cell opened, the `players` game-log line posted. Scoring and the board's answer stat were not exercised. |
| M4 | Streak Challenge still works | PASS | Started with "Team A", answer counted (count 1), stat sent |
| M5 | Daily Challenge still works | PASS | Opens and an answer is recorded. The Daily sends no `question-stats` on this branch, and `main` has the same three callers (board, Streak, Speed), so this is not a regression. |
| M6 | Daily Crossword loads | PASS | Grid of 54 cells (run skipped in the rerun; the earlier run created and then removed today's row) |
| M7 | Integration Quiz loads | PASS | Page title shown, no errors (quiz not played) |
| M8 | Admin: Speed Round checkbox loads its saved value and saves | PASS | See A7 |

### Layout and access (US-59 "Language, layout, docs")

| # | Check | Result | Evidence |
|---|---|---|---|
| L1 | Arabic: RTL and `speed.*` strings only | PASS | `dir=rtl`; rules card, question, feedback, result all Arabic (screenshots) |
| L2 | Arabic signed seconds read left to right | PASS (code) | `signed()` wraps the number in the `ltr()` isolate (`js/game.3d7ac9bd.js` L569-571); "−3 ث" in the Arabic feedback |
| L3 | 375 px: no sideways scroll on every Speed screen | PASS | `scrollWidth - clientWidth = 0` on setup, rules, countdown, question, feedback, paused, result, EN and AR |
| L4 | 1366x768: no sideways scroll | PASS | Same checks, EN and AR |
| L5 | Reduced motion: no animation on the float or the countdown; texts still shown | PASS | `animation-name: none`; flows pass under reduced motion |
| L6 | aria-live | PASS (attributes) | Feedback line `aria-live=polite`; float `aria-hidden`; countdown `assertive` (see observations). Screen reader itself: PENDING (P3). |
| L7 | Keyboard play | PASS | Enter on Start; Tab moves to a choice; Enter answers it (rerun) |
| L8 | No console or page errors | PASS | Every flow empty, apart from the `ERR_FAILED` lines from the image abort I forced |
| L9 | WCAG AA contrast of the new pairs | PASS | Measured: text 8.84, NEW 11.54, gain 8.53, loss 5.98 (lowest), best 9.67, stats 8.42, rules 14.75 (all over 4.5) |

### Owner choices (D-73 m to r)

| # | Check | Result | Evidence |
|---|---|---|---|
| O1 | (m) Constants block marked "playtest and tune" | PASS | Comment `PLAYTEST AND TUNE` at `js/game.3d7ac9bd.js:117`; constants at L119-135 |
| O2 | (o) "+N s" shows the tier value at the cap | PASS (PO may revisit) | Nine fast answers: the last one showed "Lightning! +5 s" while the clock gained 0.8 s and stopped at 60.000 s. This is the documented choice; see the observation below. |
| O3 | (p) The language picked stays for the next questions | PASS | Rerun: Q1 (Arabic) switched to English with the question's language button; Q2 opened in English; `run.lang` is `en` |
| O4 | (q) End run with a frozen-clock confirm | PASS | Pane: clock held at 25 for 1.5 s while the confirm was open; Cancel continued the run; OK showed the result with score 0. Android Back: P1. |
| O5 | (r) No Report button during a run | PASS | Rerun: `#report-btn` hidden and `can-report` absent on a Speed question; End run visible. Read-aloud limited to the open question: PASS (code, `goSpeedLive` and `stopReading` on feedback). |
| (n) | Fastest and average over correct answers | See R6 | |

### Pending (environment)

| # | Check | Result | Reason |
|---|---|---|---|
| P1 | Android Back on a question, on the rules card, on Paused | PENDING | No Android app or device here |
| P2 | Phone share sheet (`navigator.share`) | PENDING | Needs a phone on HTTPS; desktop copy path tested |
| P3 | Screen reader announcements | PENDING | No screen reader run |
| P4 | Live site: new hashes served, `speed_enabled` accepted, one run on a phone | PENDING | After deploy |
| P5 | Gate scripts (`lint_hardcodes`, `check_no_emoji`, `validate_contrast`, `gate.mjs`) | PENDING | Not run (Python scripts; the developer did not run them either) |
| P6 | 320 px nav overlap reported by the developer | PENDING (out of scope) | Pre-existing header; not retested |

## Bugs

### BUG-59-03 (Minor, edge case, reproduced; FIXED in fix loop 1, re-tested PASS): time left lost when the page closes with no pagehide

- **Severity:** Minor. A normal reload is fine (pagehide pauses the run first, F7). The loss happens only when the page goes away while a question is live and no `pagehide` or hidden-tab event ran (for example a crash or a forced close while visible).
- **Steps to reproduce (run in the tester's Playwright, `flow2.js`):**
  1. Start a Speed Round on the game page, tap Start, wait until a question is live. Save the `brainrush.speed` value.
  2. Open a non-app page on the same origin (`/robots.txt`). Write that run back into `brainrush.speed` with `run.deadline = Date.now() + 20000`, `run.leftMs = 20000`, `run.started = true`. Do not open the game page.
  3. Wait 10 s. Open `/`.
- **Expected:** the run comes back paused with about 20 s left (AC: "a reload mid-run … the same time left").
- **Actual:** `leftMs` 9698 (about 9.7 s): the 10 s the page was closed were counted.
- **Where:** `js/game.3d7ac9bd.js` `restoreSpeedRun` L5265-5267 (`run.leftMs = deadline - Date.now()` when no pause was saved).
- **Suggested fix (for the developer):** save `leftMs` periodically while live (for example each second or on `visibilitychange`), and restore from it rather than from the wall-clock deadline.

### BUG-59-02 (Minor, copy; FIXED in fix loop 1, re-tested PASS): missing sentence break in the mid-run failure line

- **Steps to reproduce:** as C12 (a later batch fails mid-run; the Playwright `failpath.js` run).
- **Expected:** "Could not load the next question: <reason>. Try again."
- **Actual:** "Could not load the next question: Internal server error Try again."
- **Where:** `js/i18n.a7643303.js` L362 (EN) and L772 (AR), `speed.nextFailed` has no separator after `{reason}`.

## Observations (not bugs; for the PO or the developer)

- **D-73 o (BUG-59-01, now a PO note):** a capped correct answer still floats the full tier, "+5 s", while the clock gained 0.8 s and stopped at 60.000 s (the AC says "gains +5 s … up to the cap"). This is the documented choice, so it is recorded as a PASS. The PO may prefer the real gain shown instead (the float text comes from `tier.addS`, `js/game.3d7ac9bd.js` ~L4995).
- **BUG-59-04 (recommendation, applied in fix loop 1):** the 3-2-1 countdown `#speed-count` was `aria-live="assertive"`; it is now `polite` (`index.html` L111, checked in the DOM, re-test R6). Not checked with a screen reader (P3).
- After a run the question screen keeps the `speed` class while hidden (for example "screen question streak speed" on the Streak setup). No effect seen: the Streak start clears it, and the Speed check needs the question screen to be visible.
- The Daily Challenge sends no `question-stats` on this branch, the same as `main`. Outside US-59; not changed.
- The developer's measured contrast values match the tester's measurement (lowest 5.98:1, the loss text).

## What was changed on the machine, and restored

- **Settings:** `speed_enabled` row created and changed during the tests; deleted at the end. Snapshot before the tests: 13 rows, no `speed_enabled`. After both passes: identical.
- **Daily Challenge:** 3 `daily_challenge` rows for 2026-11-25 created by the first regression pass; deleted (none existed before). Now 15 rows, as before.
- **Daily Crossword:** 1 `daily_crossword` row for 2026-11-25 created by the first regression pass; deleted. Now 1 row, as before. The rerun skipped Daily and Crossword.
- **Logs:** `logs/game-2026-11-25.log` created by the tester's curl check (2 lines); deleted. It did not exist before.
- **question_stats:** 149 rows before and after; the dumps are identical.
- **streaks:** 17 rows before and after.
- **Test server:** `localhost:8011` stopped at the end of each pass. MariaDB left running as found.
- **Browser profiles:** the browser pane's storage for `localhost:8011` still holds test data (`brainrush.speed`, `brainrush.streak`); it is the tester's profile, not the owner's. The Playwright runs used fresh profiles.
- **Git:** read-only commands only (`status`, `diff`, `show main:…`, `check-ignore`).

## Re-test after fix loop 1

Developer notes: "Fix loop 1" in `docs/sprints/us-59-dev.md`. Tested on `localhost:8011` (own server, stopped afterwards), with stats, game log and settings stubbed; the `settings.php` GET returned `speed_enabled: 1`. The Daily load created today's rows; they were deleted afterwards (see the restore note).

| # | Check | Result | Evidence |
|---|---|---|---|
| R1 | BUG-59-03 original repro: live run saved, page left, 10 s, reopened | PASS | Seeded run with 20 s left; reopened paused with `leftMs` 20000, clock showing 20 (was 9.7 s before the fix) |
| R2 | `leftMs` saved about every 1 s while live | PASS | Sampled every 150 ms over 3.6 s: 4 distinct values, 30000 → 26995 |
| R3 | Restore uses the saved value, paused; normal reload keeps time | PASS | Reload at 39.2 s: paused, `leftMs` 39200.4 before and after, score 2 kept |
| R4 | BUG-59-02 EN: sentence break in the failure line | PASS | "Could not load the next question: Internal server error. Try again." |
| R5 | BUG-59-02 AR: sentence break in the failure line | PASS | "تعذّر تحميل السؤال التالي: Internal server error. حاول مرة أخرى." |
| R6 | BUG-59-04: `#speed-count` is `aria-live="polite"` | PASS | DOM attribute (not checked with a screen reader, P3) |
| R7 | Regression: start, 3-2-1, live question | PASS | Question live after the countdown |
| R8 | Regression: two correct answers | PASS | Score 2 |
| R9 | Regression: hidden tab → paused card, clock unchanged | PASS | Timer 40 → 40 over 2.5 s |
| R10 | Regression: reload mid-run → paused, score and time kept | PASS | See R3 |
| R11 | Regression: resume | PASS | Overlay closed, run continues |
| R12 | Regression: time-out → "Time's up!" → result | PASS | Result shown; score 2, "New personal best!", fastest 0.1 s, average 0.2 s |
| R13 | Regression: Play again → countdown only, then live | PASS | No rules card; question live |
| R14 | Regression: End run (confirm OK) → result | PASS | Result shown |
| R15 | Regression: one game-log `speed` line per run (2 runs) | PASS | Two `{"mode":"speed"}` payloads |
| R16 | Regression: Streak starts and counts a correct answer | PASS | Count 1 after a correct answer. A first attempt read 0 because it picked a wrong choice (Streak counts consecutive correct answers); that was a test-design error, not an app defect. |
| R17 | Regression: Daily Challenge loads with a question and choices | PASS | Opened and showed choices |
| R18 | No page errors in the Speed, Streak and Daily flows | PASS | None. The failure flows (R4, R5) log the browser's own "Failed to load resource: 500" line for the batch I forced to fail; no app error. |

**Re-test totals:** 18 checks, 18 PASS, 0 FAIL.

**Totals after fix loop 1:** 82 PASS, 0 FAIL, 6 PENDING across the 88 acceptance-criteria rows (F9 moved from FAIL to PASS). The re-test checks are listed above and are not added to that count.

**Restore:** the `speed_enabled` row was not written (settings GET stubbed). The Daily load created 3 `daily_challenge` rows for 2026-11-25; deleted. `daily_crossword` unchanged (1 row). `question_stats` (149) and `streaks` (17) unchanged, dumps identical. `settings` table identical to the snapshot. No `logs/game-2026-11-25.log`. Test server on 8011 stopped. MariaDB untouched. No git changes.

## Verdict

**READY FOR PO.** No Critical or Major bugs open. Every US-59 acceptance criterion and every D-73 rule (a to r) was exercised or checked in code. BUG-59-03 and BUG-59-02 were fixed in fix loop 1 and re-tested; BUG-59-04 was applied. The "+N s at the cap" point (D-73 o) is a PO decision. The PENDING items (Android Back, phone share sheet, screen reader, live site, gate scripts) need the owner or the deploy.

## PO acceptance (2026-11-25)

**US-59 Speed Round: ACCEPTED with follow-ups.**

- **Results:** every acceptance criterion passes, with 0 FAIL and no open Critical or Major bug. The owner's choices are met: the score is the number of correct answers (R1); the best is kept on the device only, with no leaderboard (R11); anti-cheat is at Streak level (g); questions come from all point values at random from the Streak pool (h).
- **Code-only and partial rows:** the 14 code-only PASS rows and the partial runs M1 and M3 are accepted (D-73 v).
- **BUG-59-01:** keep the tier value in the "+N s" float (D-73 s). The clock stops at the cap as the AC requires.
- **Developer choices:** n to r and the other choices in the dev note are accepted (D-73 t, u). The Android Back part depends on FU-92.
- **Streak failure lines:** the same missing sentence break is outside US-59. It is a separate small change (D-73 w, FU-97).
- **PENDING rows:**
  - P1 Android Back: FU-92.
  - P2 phone share sheet: FU-93.
  - P3 screen reader: FU-94.
  - P4 live check: FU-95.
  - P5 gate scripts: FU-96.
  - P6 320 px nav overlap, which predates this story: FU-99.
- **Next step:** the owner's local Chrome test and commit (FU-98), then the PR and deploy (FU-95). The Arabic review is FU-91.

# US-59 Speed Round — developer notes (2026-11-25)

Branch `speed-round` (from `main` 29c1f51), uncommitted. Story US-59, decision D-73, epic E20, follow-ups FU-91 to FU-99. Plan approved by the owner on 2026-11-25.

## What was built

A new solo mode. One clock for the whole run: it starts at 30 s and holds 60 s at most. A correct answer is a point and adds time by how fast it came (2 s or less +5 s, 4 s or less +3 s, 6 s or less +2 s, slower +1 s). A wrong answer takes 3 s off and shows the correct choice. The run ends at 0. The personal best is kept on the device only. There is no leaderboard, no new table and no migration.

### Rules and where they live (`js/game.*.js`)

| Rule | Implementation |
|---|---|
| All numbers in one block, "playtest and tune" | `SPEED_START_S`, `SPEED_CAP_S`, `SPEED_TIERS`, `SPEED_WRONG_S`, `SPEED_LOW_S`, `SPEED_FEEDBACK_MS`, `SPEED_COUNTDOWN_S`, `SPEED_IMAGE_WAIT_MS` (top of the file, after the crossword constants) |
| One global clock, capped | the shared `timer` with `seconds = SPEED_CAP_S`; the time left is `run.leftMs` while stopped and `run.deadline` (wall clock) while running |
| Time by speed / wrong −3 s | `speedAnswer()` → `speedTier(ms)` → `extendDeadline(ms)` (new, moves the timer's end, clamped 0..cap) |
| Red under 10 s | `startTimer` / `showTimerAt` take an optional `lowMs`; `renderTimer` uses it (other modes keep the last-third rule unchanged) |
| Stopwatch from when the question is visible | `armSpeedQuestion()` → `whenImageReady()` (image `load`/`error`, or after 5 s) → `goSpeedLive()`; `.is-waiting` hides the question until then |
| Prefetch next pictures | `addToQueue()` (as Streak) plus `prefetchSpeedImages()` for the next 3 after a reload |
| Freeze during feedback | `speedAnswer()` freezes the clock (`freezeSpeedClock()`); `afterSpeedFeedback()` after 0.8 s opens the next question |
| Hidden tab → Paused | `onSpeedVisibility()` / `pagehide` → `pauseSpeed()` → `enterSpeedPause()`; `onSpeedResume()`; paused time is never counted (`elapsedMs` and `leftMs` are stored at the pause) |
| Reload keeps the time left | `restoreSavedSpeed()` / `restoreSpeedRun()`: opens the question under the Paused card with the saved `leftMs` (saved at the pause, and every second while the clock runs: `saveSpeedProgress()`, fix loop 1) |
| markSeen for answered questions | in `speedAnswer()` |
| Stats: correct and wrong, not the time-out | `sendQuestionStat()` in `speedAnswer()`; `onSpeedTimeUp()` sends nothing |
| One saved solo run at a time | `markSoloRun()` writes `brainrush.lastSolo` when a Streak, Daily or Speed run starts; `init()` restores that mode first, then the usual order |
| Never wipe `brainrush.streak` | Speed paths never call `newGame()`; `onSpeedNewGame()` goes to setup directly |
| Entry button | `#speed-open-btn` in `.mode-extras` (high-voltage emoji, no NEW badge: D-73 z); `updateStreakButtons()` shows it when `speed_enabled` is 1; `loadSpeedSeen()` / `markSpeedSeen()` (`brainrush.speed.seen`) now only decide the rules card |
| Rules card once, then 3-2-1 | `startSpeedRun()` → `showSpeedIntro()` (first run) or `startSpeedCountdown()` |
| Float +N s / −3 s, speed label, aria-live | `showSpeedFeedback()`: `#speed-delta` (aria-hidden) and the polite `#streak-feedback` line |
| Result | `finishSpeed()` → `renderSpeedResult()`; best line (fastest/average removed by the owner, D-73 y) |
| Play again / Share | `onSpeedAgain()` (countdown only); `onSpeedShare()` → `BrainRushShare.share` |
| Game log | `beginSpeedRun()` → `postGameLog({ mode: 'speed' })` |

Every dispatcher knows the new mode: `speedOnScreen()` is checked in `goBack`, `toggleLang`, `onRunNext` ("Try again" after a failed batch), `onRunEnd`, `refreshQuestion`, `refreshScreen` and `speechParts`; `streakOnScreen()` and `dailyOnScreen()` return false while it is on screen; `setStreakLayout()` removes the speed classes so they never leak into Streak, Daily or board questions. `reportTarget()` needs no change: it returns null in the Speed Round.

### Server

- `api/settings.php`: `speed_enabled` in `SETTING_RULES` (0/1); a missing row reads as 0.
- `api/game-log.php`: mode `speed` (1, `categories: all`, logged with no name, like `crossword`). Without `GAME_LOG_NO_NAME` every speed line would have been a 400.
- `api/questions.php`: unchanged.

## Files changed

- `api/settings.php`, `api/game-log.php`
- `js/game.3d7ac9bd.js`, `js/i18n.a7643303.js` (`speed.*` EN + AR), `js/admin.a6625261.js`, `css/style.e9159325.css` (hashes renamed by the hook at commit)
- `index.html` (button, overlay, `#speed-delta`, `#screen-speed`), `admin.html` (checkbox)
- `how-to-play.html` (`#speed` section and contents), `privacy.html` (`brainrush.speed`), `llms.txt`, `README.md`
- `docs/product-backlog.md` (E20, US-59, D-73, status row, FU-91), `docs/sprint-plan.md` (CR entry), `docs/deploy-hostinger.md` (upload list), this note

## How to run and test

1. Admin > Game settings: tick **Speed Round**, Save (locally no row exists until then).
2. Setup: the **Speed Round** button shows with NEW. Tap it: rules card, Start, 3-2-1, the first question.
3. Answer fast (+5 s), slow (+1 s), wrong (−3 s, correct choice shown). The clock never goes above 60 s and turns red under 10 s.
4. Switch tabs: Paused card, the clock has not moved. Reload mid-run: Paused card, same time left.
5. Let the clock run out: Time's up, then the result (score, best line). Play again: countdown only. Share: "Mokh Rush Speed Round: N correct" (copied on desktop).
6. EN / AR switch, 375 px, reduced motion. `logs/game-<today>.log` gets `speed: - | categories: all`.

### Verified by the developer (2026-11-25, `php -S localhost:8010`, Chrome via Playwright)

- `php -l` on both PHP files: no syntax errors. `node --check` on `game`, `i18n`, `admin` JS: OK.
- curl: `GET settings.php` has `speed_enabled: 0` with no row; `POST game-log.php {mode:"speed"}` → 201 with the line `speed: - | categories: all`; `{mode:"bogus"}` → 400 listing `speed`. (Locally there are no admin credentials, so `PUT settings.php` is open by design.)
- Driven run: NEW badge shown, then gone after the first run; rules card with the three lines; countdown; right answers 30 → 35 → 40 ("Lightning! +5 s"); wrong 39 → 36 ("Wrong! −3 s. The right answer was A, …"); `statsSent` 3 for 3 answers; hidden tab → Paused, clock unchanged after 2 s; reload → Paused with the identical `leftMs`; End run confirm → result "3 correct answers / New personal best! / Fastest answer: 0.3 s · Average: 0.4 s"; Play again → countdown, no card; a 1.5 s clock → red, time's up → result with `newBest: false`, run cleared; a saved `brainrush.streak` value survived the Speed Round and its New Game; Arabic RTL panel; 375 px: no sideways scroll; Integration Quiz and Admin pages load with no console errors; no console errors in any run.
- Second driven run (stats and game log stubbed, reduced motion, Arabic, 375 px): a photo question went live about 1 ms after its picture completed loading; a clock at 58 s plus a fast right answer stopped at 60 s (`leftMs` 60000); 3 answered questions gave exactly 3 stat POSTs, none for the question open when the clock ran out. The Arabic "−3 ث" float and the "خطأ! −3 ث." line render the same as a `<bdi dir="ltr">` reference. The batch held no SVG flag question, so that case is covered by the check `image.complete` (loaded or broken, both start) but was not driven.
- UX gates (`verify_states` through the receipt runner, receipts written): `index.html` "Checked 152 element-state(s) … OK: every interactive element passes WCAG AA in default, hover, and focus."; `admin.html` 107 OK; `how-to-play.html` 90 OK; `privacy.html` 78 OK. The new Speed Round elements are hidden in the static page, so they were most likely not among the states measured. `verify_reduced_motion` on `index.html`: "OK: 1 file(s): policy present, motion stopped under reduce, no content lost." `verify_overflow` on `index.html`: FAIL at 320 px, "a.nav-link "How to play" overlaps a.nav-link "Admin"" in the header nav, whose markup and CSS this story does not change.
- Formula-measured contrast (WCAG) of the new pairs: NEW badge `--bg` on `--gold` 11.54:1; `--gold` on `--panel` 10.18:1; `--success` on `--panel` (+N s, Lightning line) 8.53:1; `--danger` on `--panel` (−3 s, wrong line, red clock) 5.98:1; `--gold` on `--bg` (countdown, big score) 11.54:1; `--success` on `--bg` (New personal best) 9.67:1; `--muted` on `--bg` (stats) 8.42:1; `--text` on `--panel` (cards) 14.75:1.
- Not run: `lint_hardcodes`, `check_no_emoji`, `validate_contrast` and the `gate.mjs` wrapper (Python scripts; this machine has no Python, and `gate.mjs` exits silently on Windows). Checked by hand instead: no emoji in any new Speed Round line, no hex or rgb colour in the new CSS block (tokens only).
- Not verified: the phone share sheet (needs HTTPS), the Android app's Back button, a screen reader.

## Known limitations and choices for the PO

- Fastest and average count **correct** answers only ("–" when none).
- The "+N s" shown is the tier's value even when the 60 s cap absorbs part of it.
- The question starts in Arabic when it has Arabic (as Streak); the language the player switches to **stays for the rest of the run** (added so an English player doesn't lose time on every question).
- An **End run** button is shown (as in Streak); its confirm freezes the clock. Android Back on a question does the same; on the rules card or countdown it cancels the run; on Paused it asks to end.
- No Report button during a run (it would sit on a running clock).
- A picture that has not loaded after 5 s starts its question anyway.
- If a batch fails to load mid-run, the clock stays frozen and "Try again" shows.
- Android app: the rules card and the countdown lie over the setup screen, which is the Back root, so Back there leaves the app (the run has not started; nothing is lost).
- A reload during the countdown restarts the countdown (or the rules card when it was never dismissed).
- Arabic strings are AI-drafted: native review FU-91.
- After the commit, the tester should confirm every page points at the new hashes.

## Fix loop 1 (2026-11-25)

The test report is `docs/sprints/us-59-test-report.md`. BUG-59-01 (the "+N s" float at the cap) is left as documented in D-73 o.

### BUG-59-03 (Minor): time left lost when the page closes with no pagehide
- **Cause:** while the clock ran, only the wall-clock `deadline` was saved, so a page that closed without `pagehide` or a hidden-tab event lost the time it was away.
- **Fix in `js/game.3d7ac9bd.js`:**
  - `goSpeedLive()` starts `saveSpeedProgress()` every `SPEED_SAVE_MS` (1000, in the constants block). It writes the time left (`run.leftMs`, clamped to the cap) and moves the open question's `elapsedMs` on. The stopwatch then restarts from that point, so no time is counted twice.
  - `freezeSpeedClock()`, `stopSpeedTimers()` and `onSpeedTimeUp()` stop the saver (`stopSpeedSaver()`).
  - `restoreSpeedRun()` no longer uses `deadline − now`. It uses the saved `leftMs`, clamped to the cap, and the run comes back paused as after a normal reload. A crash gives back at most about 1 s that was not played.
- **Verified (Playwright, `php -S localhost:8010`, stats/game log/settings stubbed):**
  - While live, the saved `leftMs` went 30000 → 27989 after 2.6 s, with `elapsedMs` 2011 and the clock showing 28.
  - The tester's repro (leave to `/robots.txt`, seed `leftMs` 20000 with `deadline` now + 20 s, wait 10 s, reopen `/`) came back paused with `leftMs` 20000 and the clock at 20. It was 9.7 s before the fix.
  - After a resume and 1.2 s live, the saved value was 18998.
  - End run → result, run cleared, no console errors.

### BUG-59-02 (Minor copy): no sentence break after the failure reason
- **Fix:** the house pattern for "{reason}" in the middle of a sentence is to pass `sentence(errorText(err))`, which adds a full stop only when the reason has none (as `swap.failed` and `final.loadFailed` do). The speed caller in `nextSpeedQuestion()` now does this. The `speed.nextFailed` strings (EN and AR) are unchanged.
- **Verified** with a forced 500 on the second batch:
  - EN: "Could not load the next question: Internal server error. Try again."
  - AR: "تعذّر تحميل السؤال التالي: Internal server error. حاول مرة أخرى."
- **Streak has the same defect, not changed:** `streak.nextFailed` and `streak.nextFailedChance` are called with a bare `errorText()` (`js/game.3d7ac9bd.js`, Streak `nextStreakQuestion`). Their strings are not identical to the speed one, so they are left as they are on `main`. The same one-word change (`sentence(...)`) would fix them if the PO wants it.

### BUG-59-04 (recommendation): countdown announced politely
- `#speed-count` in `index.html` is now `aria-live="polite"`. Verified in the DOM. Not checked with a screen reader.

### Gates after the fix
- `verify_states` on `index.html` (receipt runner): "Checked 152 element-state(s) … OK: every interactive element passes WCAG AA in default, hover, and focus." Receipt written.
- `php -l` was not needed (no PHP change). `node --check` on `js/game.3d7ac9bd.js`: OK.

### State
- No DB or log writes: stats, game log and settings were stubbed in the browser. Afterwards there was no `speed_enabled` row, the question_stats total was unchanged and there was no new log file.
- The :8010 server was stopped by its process id.

## Owner change at the local test (2026-11-25, D-73 y)
The owner asked to remove the fastest-answer and average labels. Removed: the `#speed-stats` line (index.html), its CSS rule, the `speed.stats` and `speed.shareNone` strings (EN, AR), `fastestMs`/`avgMs` from the saved result, and "fastest X s" from the Share text (now "Mokh Rush Speed Round: N correct"). The guide sentence was updated. `run.times` is still recorded per correct answer (it is part of the saved-run check) but no longer shown. Older saved results that still carry `fastestMs`/`avgMs` load fine (extra fields are ignored).

## Owner change at the local test (2026-11-25, D-73 z)
The owner asked to remove the NEW badge and put a high-voltage emoji before "Speed Round". The button is now `<span aria-hidden="true">&#9889;</span> Speed Round`, the same pattern as the Daily Challenge emoji button. Removed: `#speed-new`, the `.speed-new` and `.speed-icon` CSS, the `speed.new` strings (EN, AR) and the `dom.speedNew` code. `brainrush.speed.seen` stays: it still decides whether the rules card shows. The test notes above that mention the NEW badge describe the build before this change.

## Owner change at the local test (2026-11-25, D-73 aa)
The clock now starts at 45 s (`SPEED_START_S` = 45, was 30). The guide, llms.txt and README say 45 seconds. The test notes above that mention 30 s describe the build before this change.

## Owner change at the local test (2026-11-25, D-73 ab)

- `js/game.*.js`: `playBeep(hz, seconds)` makes one square-wave beep with Web Audio (one `AudioContext` for the page, made on the first beep, 10 ms fade in and 50 ms fade out so it does not click). `startSpeedCountdown()` plays a 440 Hz, 0.18 s beep on each of 3, 2, 1 and an 880 Hz, 0.6 s beep as the run starts. Constants `SPEED_BEEP_HZ`, `SPEED_BEEP_S`, `SPEED_GO_HZ`, `SPEED_GO_S`, `SPEED_BEEP_GAIN` (0.15). Any audio error is caught; the numbers still show.
- Checked in Chrome on :8000 (Play again): four beeps at 440, 440, 440, 880 Hz about 1 s apart, audio context running, no console errors.

## Owner change at the local test (2026-11-25, D-73 ac)

- `js/game.*.js`: `fetchStreakBatch(exclude, useSeen = true)`; Speed Round calls it with `useSeen = false`, so the request body is `{ exclude }` only and the server draws at random. The `markSeen` call after a Speed answer is removed. The Streak Challenge is unchanged (still sends `seen`).
- Checked in Chrome on :8000: the batch request body had only `exclude`; after 2 answers the seen list length was unchanged (1 before, 1 after); played + queued ids in the run had no duplicate.

## Owner change at the local test (2026-11-25, D-73 ad)

- `css/style.*.css`: `.question.speed .timer.is-low .timer-value` runs `speed-shake` (0.5 s, infinite: a few px side to side with a small tilt). Scoped to Speed Round, so the board timer and the Streak are unchanged; `animation: none` under `prefers-reduced-motion`. No JS change: `.is-low` is already set below 10 s.
- Checked in Chrome on :8000: at 44 s no animation; at 5 s `animationName` = `speed-shake` with a moving transform.

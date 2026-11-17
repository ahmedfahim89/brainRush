# US-57 Earn the second chance: dev note

Branch `us-57-earn-chance` (from `main` 1be15da), 2026-11-17. Client-only: no API, database or PHP change. The rule is the owner's of 2026-11-17 (D-69 as amended, FU-82 closed).

## What changed

| File | Change |
|---|---|
| `js/game.c92df248.js` | Constants `CHANCE_FIRST_AT = 5`, `CHANCE_NEXT_AFTER = 10`, `CHANCE_MAX = 2` (next to the other `STREAK_*` constants). The run keeps `chances: {earned, used, progress, earnedAt}` instead of `secondChanceUsed` (all 0 at the start). New helpers `runChances`, `justEarnedChance`, `upgradeChances`, `chanceGoal`, `chancesLeft`, `isValidChances`, `countTowardChance`, `renderChanceCounter`. `streakAnswer`: a right answer moves the counter and can earn a chance (`earnedAt` = the streak then); a miss ends the run when no chance is held. `nextStreakQuestion(true)`: `used += 1`, `progress = 0`. `isStreakPending`, `isValidStreakCurrent`: "a chance held" instead of "not used yet". `fillChancePopup`: plural text with the number held. `renderDailyPanel` hides the new line. |
| `index.html` | `#streak-chances` (`aria-live="polite"`) in `.streak-head` under the count; setup and question hints updated; US-54 popup comment. |
| `css/style.ff07abe8.css` | `.streak-chances` (own row, aligned to the end like the count, `--muted`), `.streak-chances-held.has-chance` (`--gold`). Existing tokens only. |
| `js/i18n.c8df9c4b.js` | EN + AR: new `chance.next`, `chance.held` (plural), `chance.none`, `streak.correctChance`; `chance.text` and `chance.textNone` are now plural on the number of chances held (`{n}`), with the streak as `{streak}`; `streak.setupHint` and `streak.hintChance` describe the new rule. Arabic AI-drafted, pending native review (D-58 a). |
| `how-to-play.html`, `llms.txt` | The new rule replaces "one second chance per run". |
| `docs/product-backlog.md` | US-57 rewritten with the owner rule; D-69 amended; D-65 and US-54 notes; FU-82 Done; status table row. |
| `docs/sprint-plan.md` | US-57 status line. |

## Decisions I made

1. **Chances held only show once one has been earned.** A fresh run shows just "Next chance: 0/5"; from the 1st chance on, the line adds "1 chance", "2 chances" or "No chances left" (after "·"). "No chances left" on a run that never had one read wrong. Once both are earned only the held count shows.
2. **Earn feedback survives a refresh**: derived from `chances.earnedAt` (the streak when the last chance was earned): "+1 second chance!" shows when the open question was answered right and the streak equals `earnedAt`. Changed in fix loop 1 (was a stored `chanceEarned` flag, BUG US57-01).
3. **Older saves** are upgraded on load and saved again in the new shape: US-54 `secondChanceUsed: false` -> `{earned 1, used 0, progress 0}`, `true` -> `{1, 1, 0}`; a save with neither (before US-54) -> `{0, 0, 0}`. No `STREAK_VERSION` bump (D-56 a). A US-54 save waiting on the popup still opens it.
4. **Arabic "+1"**: the Arabic earn line says "حصلت على فرصة ثانية!" ("you got a second chance") rather than a signed "+1", so no LTR isolate is needed. The counter's "3/5" is wrapped in `ltr()` (D-58 c).
5. **Integration Quiz** never counts or shows chances (`INTEGRATION` guard; the page has no `#streak-chances`, so the game uses its stand-in). Its saves get the `chances` field but it is never used.

## How I tested

PHP built-in server on port 8010 (stopped afterwards), local MariaDB, Playwright with Chrome. Every write was faked in the browser (game log, question stats, leaderboard and Integration Quiz saves), so the local DB was not changed; the test browsers were fresh profiles.

- 33 scripted checks, all PASS: fresh run 0/5; earn at 5 (feedback, 0/10, "1 chance", kept after a refresh); a miss does not move the counter; popup "You have 1 second chance." (and "2 second chances" at 15 with no misses), kept after a refresh; Use keeps the streak, restarts the counter at 0/10, "No chances left"; 2nd chance at 17 after using at 7; no further earning; a 3rd miss and a miss with 0 held end the run (no popup); holding 1 at 7/10, miss and Use -> 0/10.
- Invalid saves discarded: earned 3, used > earned, progress = goal, progress after both earned, fractions, a non-object (fix loop 1 adds more cases, below). US-54 saves: unused and pending -> popup, upgraded in storage; used -> 0/10 and "No chances left"; used with a pending miss -> discarded (as before).
- Arabic at 375x812: counter and popup in Arabic, RTL; screenshots at 1366x768 and 375x812 fit.
- Daily Challenge: the line is hidden. Integration Quiz: no counter, a miss ends the run.
- `node --check` on both JS files. No PHP touched, so no `php -l`.

## Not verified

- The UX gate (Windows workaround) on `index.html` and `how-to-play.html` was not run.
- Screen-reader announcements of the new `aria-live` line (checked only in markup).
- Native review of the new Arabic strings (D-58 a).
- The hashed file names are unchanged; the pre-commit hook renames them.

## Fix loop 1 (2026-11-17)

### US57-01 (Minor): a stored `chanceEarned` flag could show a false "+1 second chance!"
Fixed by dropping the flag and deriving the line from the state. `chances` now also holds `earnedAt`, the streak when the last chance was earned (0 = none, or a US-54 save). The line shows when the open question was answered right, a chance has been earned and `streak === earnedAt`. A later right answer always raises the streak above `earnedAt`, and a miss plus Use leaves it unanswered or wrong, so only the earning answer matches. This also covers the case where both chances are earned (progress stays 0), which a check like "progress === 0" cannot tell apart.

`isValidChances(c, count)` is stricter and keeps the save self-consistent: `earnedAt` is a whole number no greater than the streak; 0 when nothing is earned; otherwise 0 (US-54 save) or at least 5; and `progress <= streak - earnedAt` (the counter can never hold more right answers than the streak has gained since the last earn). A `chanceEarned` field in a save is now ignored. US-54 saves upgrade with `earnedAt: 0`.

New checks, all PASS: a forged earn (progress 1 at `earnedAt` = streak, the tester's case) discards the run; an injected `chanceEarned: true` shows plain "Correct! Your streak is 12."; a right answer at streak 18 with both chances earned shows no "+1" after a refresh; a consistent earn at this answer shows "+1". Also discarded: missing `earnedAt`, `earnedAt` above the streak, `earnedAt` with nothing earned, `earnedAt` below 5, progress above the right answers since the earn.

### O-3 (not reproduced): the saved run vanished
I found no path in the US-57 changes that drops a valid run. What I checked:
- The run is validated only once, in `loadStreak()` at page load. A run can only vanish with `streak = null` + `saveStreak()` (`newGame`, `confirmDropUnsaved`, `finishStreak` after a save, the boot `catch` when `restoreStreak` throws) or through a failed validation on reload.
- In-between states the game writes all validate: right after an earn (progress 0, `earnedAt` = streak); a pending miss with a chance held (`over` false, `chancesLeft > 0`); Use while the next question loads (nothing changes until the new question is shifted in, then `used + 1`, `progress = 0` and the new question are saved together); a failed load (still pending); a miss with 0 held (`over` true at once).
- Enter: with the popup open, `#streak-next` is hidden so `onKeyDown` does nothing, and Enter on the focused **Use** button is a normal click. `upgradeChances` only runs for saves without `chances` and catches storage errors without removing anything.
- Random play test (scenario G): a "Team E" run driven by a seeded mix of right and wrong answers, Enter, Next, Use and refreshes (including refreshes with the popup open and right after earning), checking after every step that the save is still there unless the leaderboard screen is up. 4 seeds, up to 120 steps (streak up to 49, both chances earned and used): no vanished run.
- A run with streak 0 that ends saves nothing to the leaderboard (no POST) but does open the leaderboard screen. Note also the existing boot `catch` (US-33) that silently drops a run when `restoreStreak` throws. No error was seen in any test (page errors are logged).

### No real writes during the tests
Port 8010, stopped afterwards. Every non-GET API request was faked in Playwright except the two read-only batch POSTs (`questions.php?streak=1`, `integration-quiz.php?batch=1`). A listener also recorded any write that reached PHP: 0. Service workers were blocked. Before and after snapshots (row counts and `CHECKSUM TABLE` of `streaks`, `integration_scores`, `question_stats`, `question_reports`, `questions`, `settings`, plus the `logs/` file sizes) are identical.

## CR hearts (2026-11-17)

Owner request 2026-11-17 (D-71), branch `chance-hearts` (from `main` 8cd5e2c): gray hearts that turn red when a chance is earned, like game lives, with an animation when a heart turns red or a life is used. Client-only.

### What changed

| File | Change |
|---|---|
| `js/game.5537349d.js` | `renderChanceCounter` now shows "Next chance: x/5" (while a goal is open) and `CHANCE_MAX` hearts from the start of the run: `chancesLeft(run)` red, the rest gray, red first (inline start, so the right in Arabic). New `chanceHearts` (the `role="img"` group with its `aria-label`) and `heartIcon` (inline SVG built with `createElementNS`: shape, shine, crack; `aria-hidden`). New memory-only `chanceFx` ({kind, left}): set when `countTowardChance` earns in `streakAnswer` ('gain') and when `nextStreakQuestion(true)` spends a chance ('lose'); read and cleared by the next render, which adds `fx-gain` / `fx-lose` to the heart that changed. The class is dropped on the heart's own `animationend`, so showing the line again never replays it. The line is rebuilt only when its content (count, label, counter text) changes. |
| `css/style.fb4210d4.css` | Tokens `--heart-on` / `--heart-off`. `.streak-chances` is a flex row aligned to the end; `.chance-hearts`, `.chance-heart` (1.6rem), the pop (`heart-gain`, `heart-fill-on`) and break (`heart-lose`, `heart-fill-off`, `heart-crack`) keyframes; `prefers-reduced-motion` turns them off. `.streak-chances-held` removed. |
| `js/i18n.20ce31e2.js` | EN + AR: `chance.hearts` ("Second chances: {n} of {max}", Arabic AI-drafted, D-58 a). `chance.held` and `chance.none` removed (no other use; the popup has its own `chance.text` / `chance.textNone`). |
| `index.html` | Comment on `#streak-chances` only. |
| `how-to-play.html` | The held-count sentence is replaced by one on the hearts (red = ready, gray = not earned yet or used). `llms.txt` had no "1 chance" wording: unchanged. |
| `docs/product-backlog.md` | US-57 CR note; D-71; D-70 a marked as replaced. |

### Decisions I made

1. **Order in the line**: "Next chance: 0/5" first, then the hearts at the end edge, right under the streak number (like lives under a score). Once both chances are earned only the hearts remain.
2. **Colours**: `--heart-on` #ff4d5e and `--heart-off` #6c7599 work on both the navy panel and the Christmas pine panel (5.1 / 4.4 and 3.7 / 3.2 :1), so christmas.css needs no override. There is no light theme in the project. A small white shine on red hearts gives a cue beyond colour.
3. **Break animation**: a shake, a crack line (drawn in the panel colour) across the heart, a shrink with partial fade, and the fill fading from red to gray, 0.55 s. The pop: scale 0.6 -> 1.35 -> 1 with a red glow, 0.5 s. Transforms and filter only; measured: no layout change.
4. **One announcement**: before, the whole `aria-live` line was rebuilt on every panel render (each answer, Next, switching the question language). Now it is rebuilt only when its text or label changes, so the live region announces each change once (screen reader not tried, FU-86 still open).
5. **Line height**: the hearts make the line 27 px at both widths, the same with or without the counter text.

### How I tested

PHP built-in server on port 8010 behind a test router that answers every non-GET API call itself (only `questions.php?streak=1` and `integration-quiz.php?batch=1` pass), and Playwright with Chrome faking the same calls (45 faked, 0 reached PHP; the router log has only GETs and the two batch POSTs). Server stopped afterwards. DB snapshot (row counts and `CHECKSUM TABLE` of `streaks`, `integration_scores`, `question_stats`, `question_reports`, `questions`, `settings`, plus the `logs/` sizes) identical before and after.

32 scripted checks, all PASS: fresh run 2 gray, label "Second chances: 0 of 2", no animation, no "chance(s)" text; earn at 5: first heart red with the pop running, label 1 of 2, "Next chance: 0/10"; no layout shift during the pop (positions measured during and after); fits 1366x768; Next and a hide/show of the line do not replay; refresh shows 1 red with no animation; miss: popup with the heart still red; Use: the heart breaks to gray, label 0 of 2; 2nd earn after a use pops; switching to Arabic does not replay, Arabic label, red heart on the right; 375x812: 2 red at 15 (pop on the 2nd), no overflow, refresh with no animation, using one of 2 breaks the 2nd heart; Arabic at 375 fits; reduced motion: colour change only (`animation-name: none`); the Integration Quiz page has no hearts. `node --check` on both JS files; no PHP touched.

### Not verified

- Screen reader reading of the hearts' label and the live line (FU-86).
- Native review of `chance.hearts` in Arabic (D-58 a; to add to FU-84).
- The UX gate on `index.html` and `how-to-play.html`.
- The Christmas look was checked by adding `theme-christmas` to the page by hand (screenshot), not with the setting on.

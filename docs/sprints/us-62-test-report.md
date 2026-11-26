# US-62 Mokh Bot in Tournament mode: test report (D-78)

Tester: Senior Tester (verification only, no production code changed).
Worktree: `C:/Users/NB28970/Desktop/claude/BrainRush-tournament-bot`, branch `tournament-bot` (uncommitted; testing changed no worktree file).
Spec: `C:/Users/NB28970/.claude/plans/in-the-tournament-mode-velvety-clarke.md`, US-62 and D-78 (a to t) in `docs/product-backlog.md`, dev note `docs/sprints/us-62-dev.md`.
Date: 2026-11-26.

## Summary

- **Environment:** PHP 8.0.30 built-in server on `localhost:8016` (worktree), stopped after the run. A second server on `localhost:8017` serving `git archive HEAD` (pre-bot build) was used for the old-save and human-only Golden Goal comparison, also stopped. MariaDB (XAMPP) running. The owner's `:8000` was not touched. Browser: installed Chrome driven by Playwright, a fresh profile per context. `game-log.php`, `question-stats.php` and `reports.php` POSTs were intercepted in the browser (recorded, answered 200), so nothing was written to the shared DB; the worktree has no `logs/` folder after the run.
- **Playwright:** the worktree has no `node_modules`. Playwright was required read-only from the shared checkout's `node_modules`. No branch was switched and nothing was written there.
- **Static checks:** `php -l` clean (no PHP changed). `node --check` clean on both JS files. No `innerHTML` with data in the diff. No SQL concatenation (no PHP changed). No hard-coded board size. No secret-like strings in the added lines. `api/config.php` is git-ignored.
- **Runtime:** over 110 scripted checks: draws for 3 to 8 humans with 13 draws each, bot matches at 3 and 5 humans, the bot's answer (right, both wrong options, "I don't know…"), reloads at each stage, a bot win of a match and of the tournament, Golden Goal (bot and human-only), old-save load, 12 broken-save cases, layout at 1366x768 / 375 / 320 px in EN and AR, contrast from computed styles, reduced motion, Players mode after a bot tournament.
- **Counts (90 rows, tables below):** PASS 81 (row 4 is "PASS (N/A)"; row 9 is PASS with a note, see OBS-1), FAIL 3 (rows 10, 58, 82), PENDING 5, N/A 1.
- **Bugs:** 0 Critical, 0 Major, 4 Minor (BUG-62-01 to BUG-62-04). BUG-62-01 is an AA contrast failure on an acceptance criterion.
- **Verdict: NEEDS FIXES.** No Critical or Major defect. The fixes are small: BUG-62-01 (AA contrast of the waiting contestant's name) and BUG-62-03 (misleading "Thinking…" during the double popup). BUG-62-02 needs a PO decision (the bot's Golden Goal bet is always 0 on a 200-limit board). BUG-62-04 is gate housekeeping (the new CSS adds 10 hard-coded findings).
- **Observation, not a bug (per brief):** the robot emoji is written as an escape in source, see OBS-1.

## Data hygiene

- Test browser contexts are private and ephemeral. Game-log, question-stats and reports POSTs are intercepted and recorded in the test, not stored. Only read endpoints of the shared API were hit (categories, questions, settings). No settings were toggled.
- Worktree: no tracked file was changed by testing; `logs/` not created; screenshots and scripts are in the scratchpad.
- **Owner action:** to serve the HEAD build on `:8017` I copied the worktree's `api/config.php` into the scratchpad `us62/head/api/` folder (contents never read or printed). It holds local DB settings and should be deleted; the tester's tools cannot remove it without approval.

## Acceptance checks

Legend: PASS / FAIL / PENDING / N/A. "Code" means code review only.

### Static and gates

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | `php -l` on all tracked PHP | PASS | Clean; no PHP changed in this diff |
| 2 | `node --check` on the game and i18n files | PASS | Both parse |
| 3 | No `innerHTML` with data | PASS | No `innerHTML` in the added lines |
| 4 | No string-concatenated SQL | PASS (N/A) | No PHP changed |
| 5 | No hard-coded board size | PASS | Only timings and the D-78 constants (`BOT_*`, `COIN_*`) |
| 6 | No secrets in the added lines | PASS | Keyword scan: 0 hits |
| 7 | `api/config.php` git-ignored | PASS | `.gitignore` lists it |
| 8 | Robot emoji and `check_no_emoji` (source) | PASS (escape) | Source uses `\u{1F916}`, `String.fromCodePoint(0x1f916)` and `&#129302;`; the gate does not decode escapes. See OBS-1 |
| 9 | `check_no_emoji` on the changed docs | PASS | The robot literal in the docs is the owner exception (D-78 e); HEAD backlog already has 153 findings. See OBS-1 |
| 10 | `lint_hardcodes` on the stylesheet | FAIL (Minor) | HEAD 238 findings, now 248: +10, all inside the added hunk (lines 2008 to 2077). See BUG-62-04 |
| 11 | `validate_contrast` | PENDING (environment) | Needs a DTCG colours file this project does not have. Contrast measured on rendered styles instead (rows 75 to 78) |

### Draw (D-78 a)

| # | Check | Result | Evidence |
|---|---|---|---|
| 12 | 3 humans: bot fills the only bye | PASS | 13 draws; bot in `BYE_ORDER` slot 0 every time |
| 13 | 4 humans: no bot | PASS | 13 draws; no bot entry, no bye |
| 14 | 5 humans: one bot in one of 3 byes; 2 byes left | PASS | 13 draws; bot slots `{0:2, 1:6, 3:5}`; 2 real byes each time |
| 15 | 6 humans: one bot in one of 2 byes | PASS | 13 draws; slots `{0:6, 3:7}` |
| 16 | 7 humans: bot in the only bye | PASS | 13 draws; slot 0 |
| 17 | 8 humans: no bot | PASS | 13 draws |
| 18 | Shuffle moves the bot | PASS | The bot's slot varies across Shuffles at 5 and 6 humans (13 each); at 3 and 7 there is one bye, so it cannot move |
| 19 | Bot id = humans + 1; a free palette colour | PASS | 3 humans: id 4, `#f08c2e` (the first colour not in use) |
| 20 | Name collision: human "Mokh Bot 🤖" gives "Mokh Bot 🤖 2" | PASS | Read from the saved entries |
| 21 | Name follows a language switch | PASS | Match board: "مخ بوت 🤖 يقول" after switching to Arabic; the bracket label not separately checked |
| 22 | Game log holds human names only | PASS | `game-log.php` body `{"mode":"tournament","players":["Team A","Team B","Team C"]}` |
| 23 | Bot wins a match: it advances | PASS | Bracket: "Mokh Bot 🤖, goes through"; in the Final |

### Bot match (turn-based)

| # | Check | Result | Evidence |
|---|---|---|---|
| 24 | Coin flip lands on "X starts" once | PASS | "Team B starts" and "Mokh Bot 🤖 starts" in runs; `coinShown` saved true |
| 25 | Reload after the flip does not replay it | PASS | Overlay hidden after reload |
| 26 | Reduced motion: no spin | PASS | Class `coin shows-a`, animation `none`, result text shown |
| 27 | Default: the coin spins, then closes by itself | PASS | Class `coin is-spinning lands-a`, animation `coin-spin-a`; closed after the flip |
| 28 | Turn banner "X's turn" in the contestant's colour | PASS | "Team A's turn" on its red `rgb(229,72,77)`; "Mokh Bot 🤖's turn Choosing a question…" |
| 29 | Human's turn: bot row "Waiting", no buttons | PASS | Note "Waiting"; Correct and Wrong hidden; chips hidden |
| 30 | Bot's turn: human row locked "Mokh Bot 🤖's question"; bot row "Thinking…" | PASS | Human buttons disabled; bot note as stated |
| 31 | Bot's turn: the host cannot open a cell (click or Enter) | PASS | Cell click and focused Enter both leave the board in place (`is-locked`) |
| 32 | Bot picks a random open cell, highlighted, then opens it | PASS | Highlight, then Thinking 1.1 s later (spec ~1.2 s, plus highlight and open animation) |
| 33 | Thinking for 3 to 6 s, then "says: <answer>" | PASS | Thinking to bubble: 2995, 3069 and 4494 ms in three runs |
| 34 | Bot scored about 1.5 s after the bubble | PASS | Bubble to Back enabled: 1519 ms |
| 35 | Right answer: the real answer, cut at its first bracket | PASS | Runtime: the bubble equals the expected text from the saved question and roll (`ANSWER-right`, "The Terminator") |
| 36 | Wrong answer: a stored wrong option (`wrong_1` or `wrong_2`), cut the same way | PASS | Runtime: `ANSWER-opt1` ("Maleficent") and `ANSWER-opt2` ("Apple") match the saved options |
| 37 | Wrong answer with no stored option: "I don't know…" | PASS | Runtime: `optionIndex: null` gives "Mokh Bot 🤖 says: I don't know…" and the bot is scored wrong |
| 38 | Bot never uses helpers | PASS | Bot row chips hidden; tooltip `helper.notBot` |
| 39 | Bot never answers on the human's turn | PASS | Thinking and bubble appear only on bot turns in every timeline |
| 40 | Human cannot be scored on the bot's turn | PASS | Human Correct and Wrong are disabled in the DOM; `markContestant` guard (code) |
| 41 | Back to Board disabled until the bot is scored | PASS | Disabled through Thinking and bubble, enabled after the mark |
| 42 | Skip passes the turn | PASS | Runtime: Skip chip on the human's turn ends the question; turn 2 to 4 (bot) |
| 43 | Bot's own questions send no question stats; human's do | PASS | 2 human questions gave 2 stat posts; 2 bot questions gave 0 |
| 44 | Reload mid-Thinking keeps roll and turn | PASS | Roll identical before and after; turn 4 to 4; no coin replay |
| 45 | Reload after the mark keeps the answer | PASS | Bubble text identical; `marks` kept |
| 46 | Reload during the pick window (1.2 s) | PASS | Turn 4 to 4; coin not replayed; the bot picks again |
| 47 | Reload during the bubble, before the mark | PASS | Same answer after reload ("التهرب الضريبي" before and after); the bot shows "Thinking…" again first (3 to 6 s), then the same answer. See OBS-2 |
| 48 | Interface language switch mid-Thinking | PASS | "يفكّر…" in Arabic (dir=rtl); bubble "مخ بوت 🤖 يقول: …"; back to English |
| 49 | Question language toggle and Show Answer during Thinking | PASS | Bubble present afterwards; bot scored; Back enabled |
| 50 | Report opened and closed during Thinking | PASS | Overlay opened and closed; bot unaffected |
| 51 | End Game on the bot's turn: nothing fires later | PASS | Tournament save JSON identical before and 4.5 s after End Game; screen stayed where End Game left it (the Golden Goal offer for a 0-0 tie; the match screen in another run) |
| 52 | Pause: countdown stops, the bot still answers (D-78 m) | PASS | Timer 40 to 40 over 1.5 s; bubble appeared; Back enabled after the mark |
| 53 | Timer 5 s: the bot scores before the timer ends | PASS | Bot scored 4494 ms after its question opened (5 s timer); bubble at about 3.1 s |
| 54 | Double cell on the bot's pick: popup, answer after "Let's play", double points | PASS | Popup shown; no bubble until "Let's play"; bubble 3704 ms after OK; bot scored 400 on a right answer to a 200 double. Forced with a save edit. See BUG-62-03 for the "Thinking" label during the popup |
| 55 | Keyboard on the bot's turn: Enter on a focused cell | PASS | Ignored (see 31). A full keyboard walk was not done |
| 56 | Android Back during the coin flip skips it to its end | PENDING (not run) | `goBack` calls `finishCoin` (code only) |

### Golden Goal, regression, results

| # | Check | Result | Evidence |
|---|---|---|---|
| 57 | Level bot match goes to Golden Goal; the bot's bet locks by itself | PASS | End Game at 0-0: "Golden Goal ⚽?" offer; wager list "Bet locked by the bot" |
| 58 | Bot's bet: 0 to half its limit, rounded to 100 | FAIL (Minor) | Bot bet 0 in every run on the 200-limit board: `floor(rand * 100 / 100) * 100` is always 0. See BUG-62-02 |
| 59 | Bot marks itself in Golden Goal | PASS | Bot marked "wrong" in one run and "correct" in another, with no click; "Next round" enabled |
| 60 | Human v human match unchanged: no turn, coin or banner; steal kept; both rows open | PASS | No `turn`/`coinShown` saved; both rows enabled; wrong on row 1 and correct on row 2 gave Team A -100, Team B +100 |
| 61 | Human-only Golden Goal (4 humans) identical to HEAD | PASS | Same script on `:8017` (HEAD) and `:8016`: "Still tied! Golden Goal ⚽ again?", round 2, all rows open |
| 62 | Helpers work on the human's own turn; the bot row has none | PASS | Human chips enabled; "3 choices" gave 3 choices; bot row chips hidden, note "Waiting" |
| 63 | Bot wins a match by End Game and advances | PASS | "Mokh Bot 🤖 wins 200 – −100"; in the Final |
| 64 | Bot wins the tournament | PASS | "Mokh Bot 🤖 wins the tournament!"; 1st place |
| 65 | Standings, played matches and share text include the bot | PASS | Standings 1st Mokh Bot 🤖; matches list it; share text "Mokh Bot 🤖 won the Mokh Rush tournament!" |
| 66 | Old save without a bot still loads and plays | PASS | HEAD-built 3-human save (a bye, no bot) loads on the bracket and plays a human match with no bot rules |
| 67 | Broken bot saves are discarded (control: a valid save loads) | PASS | Control kept; 11 broken cases went to setup: 2 bots; bot with 4 humans; bot in slot a; bot in a non-bye slot; bot id missing; `turn` on a non-contestant; `turn` on a human match; `coinShown` string; `botRoll.right` string; `optionIndex` 3; `coinShown` on a human match |
| 68 | Players mode after a bot tournament has no bot rules | PASS | 4 players: names, Correct enabled, helper chips visible, a mark applied |
| 69 | Past tournaments list | N/A | Removed by D-77 z; nothing to record |

### Language, layout, contrast, console

| # | Check | Result | Evidence |
|---|---|---|---|
| 70 | 1366x768: board with banner, no vertical scroll | PASS | Vertical overflow 0 px |
| 71 | 1366x768: bot question (Thinking), no vertical scroll | PASS | Vertical overflow 0 px |
| 72 | 1366x768: bubble with a stress answer (110 characters), EN | PASS | Bubble wraps to 2 lines (61 px high); no overflow |
| 73 | 1366x768: bubble with a stress answer, AR | PASS | Bubble 2 lines; no overflow |
| 74 | 1366x768: Golden Goal bot question, EN and AR (after the question-language toggle) | PASS | Bubble present in both; no vertical or horizontal overflow |
| 75 | 375 px and 320 px: board, no horizontal scroll | PASS | Horizontal overflow 0 px at both widths |
| 76 | 320 px Arabic board: RTL, no horizontal scroll | PASS | `dir=rtl`; horizontal overflow 0 px |
| 77 | 375 px Arabic question and bubble | PASS | Bubble box mirrored (97 to 329 of 375 px); horizontal overflow 0 px |
| 78 | 320 px coin flip: no horizontal scroll | PASS | Horizontal overflow 0 px; vertical overflow 5 px (not in the spec's 320 px rule; see OBS-3) |
| 79 | Contrast: bubble, Thinking (rest and pulse trough), banner, locked cells | PASS | Bubble 14.75:1; Thinking 6.45:1 at rest and 4.68:1 at the trough; banner ink 4.81 to 10.52:1 on all 8 palette colours (lowest 4.56:1 on `#9b5de5`); locked open cell label 4.71:1 (opacity 0.6) |
| 80 | Contrast: "Waiting" note | PASS | 6.45:1 |
| 81 | Contrast: waiting row score (opacity 0.55) | PASS | Bot row score 4.92:1 |
| 82 | Contrast: waiting row name (opacity 0.55) | FAIL (Minor) | Bot row name 3.18:1; human row name 2.53:1 (bot's turn). Both below AA 4.5:1: the name is ink on its palette chip, and 0.55 opacity dims the text and the chip together. See BUG-62-01 |
| 83 | Arabic strings native review (D-58 a, FU-110) | PENDING (owner) | AI-drafted; native review not done |
| 84 | Console errors and page errors | PASS | No console or page error in any run (about 30 browser sessions) |
| 85 | Emoji shows on screen (coin face, bubble, banner) | PASS | Coin face "🤖"; bubble "مخ بوت 🤖"; see OBS-1 |
| 86 | Docs: `how-to-play.html` `#tournament`, `docs/spec.md`, `llms.txt` describe the bot | PASS | Present in the diff; content read in the diff |
| 87 | FU-111 owner's Chrome check on port 8005 | PENDING (owner) | Not done here |
| 88 | FU-112 deploy and CDN purge | PENDING (owner) | Out of scope |
| 89 | Shuffle redraw keeps all invariants (no two byes meet, every human once) | PASS | Checked in the 13-draw runs of rows 12 to 17 |
| 90 | Tournament save version unchanged | PASS | `TOURNAMENT_VERSION` 1 in the diff: no bump; old save loads (row 66) |

Totals (90 rows): PASS 81, FAIL 3 (rows 10, 58, 82), PENDING 5 (rows 11, 56, 83, 87, 88), N/A 1 (row 69).

Note on counting: row 10 is BUG-62-04, row 58 is BUG-62-02, row 82 is BUG-62-01. BUG-62-03 comes from row 54 (its PASS covers the answer timing after "Let's play", the Thinking label is the defect).

## Bugs

All Minor. No Critical or Major defect.

### BUG-62-01 (Minor): waiting contestant's name fails AA

- **Steps:** 3 humans; Start match; the coin lands. (a) Let the coin land on the bot's turn and read the human row's name (`.srow.is-waiting .srow-name`). (b) On the human's turn, read the bot row's name in the same way.
- **Expected:** text contrast at least 4.5:1 (WCAG AA), an acceptance criterion ("contrast WCAG AA").
- **Actual:** name at opacity 0.55 measures 3.18:1 on the bot row (human's turn) and 2.53:1 on the human row (bot's turn). The name is ink on its palette chip, and the 0.55 opacity dims the text and the chip together, so it fails on every colour measured. The plain-text waiting score (4.92:1) passes. The `.srow.is-out` precedent uses the same opacity, but the new feature is not exempt.
- **Where:** `css/style.fb1be6f7.css:2025` (`.srow.is-waiting .srow-name, .srow.is-waiting .srow-score, .srow.is-waiting .srow-tally { opacity: 0.55; }`).
- **Suggested fix:** keep the waiting look with a colour token that meets 4.5:1 for the name (or raise the opacity until the composite reaches 4.5:1 on the palette chips).

### BUG-62-02 (Minor, PO decision): the bot's Golden Goal bet is always 0 on a 200-limit board

- **Steps:** 3 humans; Start match (bot match); End Game at 0-0; "Golden Goal ⚽?" offer; Go for goal. Read the bot's wager line.
- **Expected:** a random amount from 0 to half its limit, rounded to 100 (US-62 acceptance, D-78 i). On a 200 limit that is 0 or 100.
- **Actual:** the bot bets 0 every run (three runs). `Math.floor((Math.random() * half) / 100) * 100` with `half = 100` is always 0. A bot can only bet when its limit is 300 or more, and then only in steps below the half.
- **Where:** `js/game.bcd1d64c.js:8197` (`placeBotBet`); the limit comes from `wagerLimit` (the larger of the score and the largest points, here 200).
- **Note:** the dev chose rounding down (D-78 o) so the bet never exceeds half, which is safe. The PO should decide: round to the nearest hundred (0 or 100 here), or keep rounding down and accept that the bot bets nothing on small boards.

### BUG-62-03 (Minor): "Thinking…" shows on the bot's row while the double-score popup is open

- **Steps:** 3 humans. Force the double cell on the bot's turn: in the `brainrush.tournament` save, set `game.double` to the first unused cell key `catId:points`, reload, and wait for the bot to open it. The double popup ("Let's play") stays up.
- **Expected:** nothing on the bot's row, or "Waiting", until the bot starts after "Let's play" (D-78 n).
- **Actual:** the row shows the pulsing "Thinking…" while the popup is up. The answer does not start until "Let's play" (no bubble before OK; bubble 3704 ms after OK). The label is misleading only; no functional break.
- **Where:** `js/game.bcd1d64c.js:8158` (`updateBotRow`, the branch `botSaid !== open && mark === null`), reached from `renderScoringRows` in `showQuestion` before `armBotAnswer` runs.

### BUG-62-04 (Minor): `lint_hardcodes` gains 10 findings in the new CSS

- **Steps:** `python3 -I <plugin>/scripts/lint_hardcodes.py css/style.fb1be6f7.css`.
- **Expected:** no new hard-coded values; the dev note says the stylesheet "uses such values throughout" (the project gate already fails on `main`: 238 findings).
- **Actual:** 248 findings now; all 10 new ones are inside the added hunk (`@@ -2007,0 +2008,70 @@`): `999px` (2012), `3px` and `0.7s` (2019), `1.2s` (2027), `12px` (2037), `2px` (2038), `4px` (2054), `1.6s` (2061 and 2062), `0.3s` (2066).
- **Where:** `css/style.fb1be6f7.css:2012` to `2066`.

## Observations (not bugs)

- **OBS-1: the robot emoji is an escape in source (owner exception D-78 e).** It is written as `\u{1F916}` in `js/i18n.79f363c2.js` (both tables), `String.fromCodePoint(0x1f916)` in `js/game.bcd1d64c.js:235` (coin face), and `&#129302;` in `how-to-play.html`. The gate passes because it does not decode escapes, not because an allow-list exists. The emoji renders correctly on screen (coin face, bubble, banner). Reported as an observation per the brief. The allow-list step the plan asked for was not done (the dev note says the gate has no such setting), so the docs carry the literal robot: +10 findings in `docs/product-backlog.md` and +1 in `docs/spec.md`. The owner exception covers it, and the docs already carry 153 gate findings on HEAD (⚽, 🏆, ✓).
- **OBS-2: reload during the bubble restarts "Thinking…".** The bot shows "Thinking…" for another 3 to 6 s after a reload in that window, then the same answer. The spec's "same roll, answer and turn" holds; the bot's second "thinking" is a UX choice to confirm with the PO.
- **OBS-3: the 320 px coin overlay scrolls 5 px vertically.** The spec's 320 px rule covers sideways scroll only, so this is not counted.
- **OBS-4: Back to Board is disabled on the bot's question until the bot scores (D-78 l).** Confirmed; the wait is at most about 7.5 s.
- **OBS-5: the double popup holds the bot's answer until "Let's play" (D-78 n).** Confirmed (row 54).
- **OBS-6: the locked board cells sit at opacity 0.6 on the bot's turn.** Label contrast 4.71:1, so it passes AA.

## Not run / pending

- Row 11 `validate_contrast` (environment: no DTCG colours file). Row 56 Android Back during the coin (code only). Row 55 full keyboard walk. Row 83 native Arabic review (FU-110). Row 87 owner's Chrome check (FU-111). Row 88 deploy (FU-112).

## Verdict

**NEEDS FIXES.** Zero Critical or Major defects; four Minor bugs:

1. BUG-62-01 (AA contrast of the waiting contestant's name) is an acceptance criterion and should be fixed.
2. BUG-62-03 (misleading "Thinking…" under the double popup) should be fixed; small.
3. BUG-62-02 (the bot bets nothing on a 200 board) needs the PO's decision on rounding.
4. BUG-62-04 is gate housekeeping: the new CSS adds 10 hard-coded findings.

Otherwise the bot flow works end to end: draw, coin, turns, lock, bot pick, the three answer kinds, self-score, reloads, Golden Goal, bot wins, standings, share text, old and broken saves, Players mode, layout and RTL.

## Re-test after fix loop 1

Scope (as requested): verify BUG-62-01 to BUG-62-04 and OBS-2 after the developer's fix loop 1, then a short regression. Own port 8018 (worktree), stopped by PID afterwards. No production edits, no DB writes (game-log, question-stats and reports POSTs intercepted), `:8000` and the shared checkout untouched, no `api/config.php` copied. Environment note: MariaDB was not running after the session restart (the categories and settings APIs returned 500); it was started from `C:/xampp/mysql/bin` and the API then responded. No data was written.

Playwright again read-only from the shared checkout's `node_modules`. The HEAD comparison (old 3-human bye save built on HEAD) was skipped as requested; the old-save check uses a 4-human save from the current build, which has the pre-bot (US-61) shape.

### Fix verification

| # | Check | Result | Evidence |
|---|---|---|---|
| R1 | BUG-62-01: waiting row not dimmed | PASS | Waiting row name opacity 1 (was 0.55) |
| R2 | BUG-62-01: waiting name chip contrast (AA 4.5) | PASS | Name chip 4.81:1 (red, "Team A") to 7.61:1 (bot chip); every chip on the board at or above 4.5:1 |
| R3 | BUG-62-01: waiting score contrast | PASS | 7.43:1 |
| R4 | BUG-62-02: bot bet 0 to floor(limit/2), nearest 100, capped at the limit | PASS | 6 runs on a 200 limit: bets 100, 0, 0, 100, 0, 100 (always 0 or 100, never above 200). A Golden Goal regression run: bot bet 100, a reload-valid save |
| R5 | BUG-62-03: no "Thinking…" while the double popup is open | PASS | Popup open 2.5 s: no Thinking label, no bubble. After "Let's play": Thinking, then the answer |
| R6 | BUG-62-04: `lint_hardcodes` on the new CSS | FAIL (Minor, reduced) | Down from +10 to +5 new findings; all five are durations in the added block (lines 2019 `0.7s`, 2029 `1.2s`, 2063 and 2064 `1.6s`, 2068 `0.3s`). Stylesheet total 243 (HEAD 238). See BUG-62-04 below |
| R7 | OBS-2: reload during the bubble | PASS | Same answer on reload, shown after 56 ms (no new Thinking). Scored correct about 1.6 s later |
| R8 | Thinking text contrast after the fix (regression of the palette) | PASS | 6.45:1 at rest, 4.68:1 at the pulse trough |

Note on the earlier layout FAIL in the batch (CONTRAST-bubble-thinking-waiting): a test artefact, the Thinking element was not present when it measured (the bubble had already appeared). Thinking contrast was measured on its own (R8) and passes.

### Short regression

| # | Check | Result | Evidence |
|---|---|---|---|
| G1 | Full bot match with turns (4 questions) | PASS | 13 of 13 checks: coin once, no replay after reload, board locked and host clicks/Enter ignored on the bot's turn, Waiting row on the human's turn, turn alternates (4 to 3 to 4 to 3 to 4), bot scored by itself, no console errors |
| G2 | Golden Goal with the bot | PASS | Bot bet 100 (locked by itself), bot marked "wrong" by itself, human marked "correct"; no console errors |
| G3 | Human-vs-human match (no turn, coin or banner; steal kept; both rows open) | PASS | bot3 run: HVH rules, steal kept (Team C -100, Team B +100), results |
| G4 | Human-only Golden Goal (4 humans) | PASS | All rows open, "Next round", no bot text |
| G5 | Bot wins a match and the tournament; standings, played matches, share text; log holds human names; no stale bot after the tournament | PASS | "Mokh Bot 🤖 wins the tournament!"; share text names the bot; game log human names only |
| G6 | Old save (pre-bot shape, 4 humans) reloads and plays | PASS | Reloads on the bracket; no turn, coin or banner; a question plays. The 3-human HEAD-built save was not re-run (HEAD skipped) |
| G7 | Players mode after a bot tournament | PASS | 4 players: names, Correct enabled, helper chips visible, a mark applied |
| G8 | Helpers on the human's own turn; bot row has none; Skip | PASS | 3 choices gives 3 options; bot row "Waiting", chips hidden; turn passes to the bot |
| G9 | Reload during the pick window; stall checks (Report, Show Answer, language toggle, I-don't-know path) | PASS | Turn kept, coin not replayed; "I don't know…" scored wrong by the bot |
| G10 | Layout 1366x768 (board, bot question) | PASS | No vertical overflow |
| G11 | Layout 375 px and 320 px (EN and AR) | PASS | No horizontal overflow; Arabic bubble box 111 to 329 of 375 px |
| G12 | Console | PASS | No console or page error in any re-test run |

### Remaining bugs after the re-test

- **BUG-62-04 (Minor, reduced, not closed):** `lint_hardcodes` still reports 5 new durations in the added CSS (243 in total, HEAD 238). The dev note says the project has no duration tokens. The PO or dev should either add one duration token or accept the five with a `ds-allow-hardcode` comment. BUG-62-01, BUG-62-02, BUG-62-03 are fixed and verified above.
- No Critical or Major bug. Verdict after the re-test: READY FOR PO, with BUG-62-04 (gate) as a Minor item for the owner to accept or fix.

### Counts (re-test)

PASS 19 (R1 to R5, R7, R8 = 7; G1 to G12 = 12), FAIL 1 (R6, BUG-62-04 reduced to five durations), PENDING 0. The layout artefact is not counted.

## PO acceptance (2026-11-26)

**US-62 Mokh Bot in Tournament mode: ACCEPTED with follow-ups** (D-78 u to y in `docs/product-backlog.md`).

- Every acceptance criterion of US-62 is met: draw, coin, turns, board lock, bot pick, the three answer kinds, self-score, reloads, Golden Goal, bot wins, standings and share text, old and broken saves, human v human unchanged, RTL and layout. BUG-62-01 (AA contrast), BUG-62-02 (Golden Goal bet) and BUG-62-03 (Thinking under the double popup) are fixed and verified (R1 to R5); OBS-2 is fixed (R7).
- Developer choices D-78 l to t: confirmed as built (D-78 u).
- BUG-62-04: accepted as is, no follow-up. The 5 findings are animation durations; the project has no duration tokens and the stylesheet had 238 findings on `main` (D-78 w).
- OBS-1: the emoji exception is limited to the robot in the bot's name, written as an escape in source and as a literal in the docs; it is not a general way around the no-emoji gate (D-78 v, clarifying e).
- OBS-3 (5 px vertical scroll of the coin at 320 px): accepted (D-78 x).
- Pending rows: 55 (Tab walk) and 56 (Android Back during the coin) added to FU-111; 83 stays FU-110; 87 and 88 are FU-111 and FU-112; row 11 is replaced by the measured contrast (D-78 y).
- Owner action from the first run: delete the copy of `api/config.php` that the tester put in the scratchpad `us62/head/api/` folder (local DB settings): FU-113.
- The owner confirms the escape approach instead of the allow-list asked for in the plan at FU-111 (4).
- Next: FU-110 (Arabic review), FU-111 (owner's local check), then commit, PR and deploy (FU-112).

# US-63 Mokh Bot accuracy meter and smart board play: test report (D-79)

Tester: Senior Tester (verification only, no production code changed).
Worktree: `C:/Users/NB28970/Desktop/claude/BrainRush-bot-accuracy`, branch `bot-accuracy` (uncommitted; testing changed no worktree file except this report).
Spec: `C:/Users/NB28970/.claude/plans/in-the-tournament-mode-velvety-clarke.md` (Verification section and Owner decisions), US-63 and D-79 (a to i, developer choices j to l) in `docs/product-backlog.md`, dev note `docs/sprints/us-63-dev.md`.
Date: 2026-11-27.

## Summary

- **Environment:** PHP 8.0.30 built-in server on `localhost:8006` (the worktree), stopped after the run. A second server on `localhost:8007` serving `git archive origin/main` (admin.html, css, js only, no `api/config.php`) was used for the baseline layout and gate comparison, also stopped. MariaDB (XAMPP) running. Browser: the installed Google Chrome driven over the DevTools protocol from a scratchpad script (Node's built-in WebSocket; no npm package installed), a fresh profile per test set, viewports set per check. `game-log.php`, `question-stats.php` and `reports.php` POSTs were intercepted and answered 200 (not stored). `js/game` randomness was forced per test (see Method).
- **Static checks:** `php -l` on all 17 tracked PHP files: clean. `node --check` on `js/game.895be07b.js` and `js/admin.d7addc60.js`: clean. No `innerHTML`, no SQL concatenation, no secret-like strings and no hard-coded board size in the added lines. `api/config.php` is git-ignored (`.gitignore:1`). The file was not opened or printed.
- **Gates:** the plugin's Python scripts, same counts as `origin/main` (table below). No finding on the new CSS lines (255 to 259).
- **Runtime:** 40 forced bot rounds (faces 1 to 10 at 0, 30, 70 and 100%), 18 smart-pick cases, 4 Golden Goal runs, the Admin checks (rows 15 to 27), the API probes (rows 10 to 14), and the old-save, Arabic, reload, level-freeze and human-only regressions.
- **Counts (65 rows):** PASS 63, FAIL 1, PENDING 1 (see the table). Bugs: 0 Critical, 0 Major, 1 Minor (BUG-63-01, pre-existing). Four observations (OBS-63-01 to 04), not bugs.
- **Verdict: READY FOR PO.** No Critical or Major defect. BUG-63-01 is a Minor layout issue already on `origin/main`; the PO decides whether it goes into US-63 or a follow-up. The Admin slider and the new box fit at 320 px; the page-level sideways scroll does not come from this story.

## Data hygiene

- **Shared DB write, restored:** `api/settings.php` `bot_accuracy` was written for the tests (PUT 7, 0, 10, 3, 7, 0). The row was **deleted at the end of the run** with a scratch helper (`DELETE ... WHERE name = 'bot_accuracy'`); `GET settings.php` then returns the default `"bot_accuracy":3`. A later re-check (a second server start for row 30) also found the row absent. The row did not exist before the run (the dev note says so; I did not read the table before my first PUT, so this is taken from the dev note plus the default read).
- **Other DB writes:** none. Tournament setup posts to `game-log.php` and the board/Golden Goal draws to `questions.php` (reads) were the only traffic; the write endpoints were stubbed.
- Test tournaments live only in browser `localStorage` (scratch Chrome profiles under the scratchpad). The worktree has no new files other than this report.
- Test names only: Team A, Team B, Team C, Team D.

## Method (how the bot's dice were checked)

- **Forced faces:** a `Math.random` override reads a per-tab flag (set through `sessionStorage`), so each bot roll is face `f` in 1..10 (`(f - 0.5) / 10`). The bot turn is put in the saved match (`turn: 4`, `coinShown: true`, `botTickets` as tested, scores reset, no used cells) and the page is reloaded. The bot's answer bubble, the saved `botRoll`, the question in the save and the score after the mark are read from the DOM and `localStorage`.
- **Host action:** after the bot's mark the runner presses **Back to Board** (`#back-btn`), as a host does (D-78 l).
- **Mechanical check:** every round is compared with the dice rule (D-79 b): right face = the stored answer; wrong face = `wrong_1` (face T+1, T+3, ...) or `wrong_2` (T+2, T+4, ...), in the question's language; "I don't know..." for the rest. The score must move by the cell value (+ for right, - for wrong or IDK).

## Acceptance checks

Legend: PASS / FAIL / PENDING. "Code" means code review only.

### Static and gates

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | `php -l` on all tracked PHP (17 files) | PASS | No syntax errors |
| 2 | `node --check` on the game and admin JS | PASS | Both parse |
| 3 | No `innerHTML`, SQL concatenation, secrets or hard-coded board size in the added lines | PASS | Keyword scan of `git diff -U0`: 0 hits each |
| 4 | `api/config.php` git-ignored | PASS | `.gitignore:1` |
| 5 | `lint_hardcodes` on `css/style.e64ad66b.css` | PASS (count) | 243 on the worktree, 243 on `origin/main`; no finding on added lines 255 to 259 |
| 6 | `lint_hardcodes` on `js/game.895be07b.js`, `js/admin.d7addc60.js`, `admin.html` | PASS (count) | 17 / 17, 0 / 0, 0 / 0 (worktree / origin/main) |
| 7 | `check_no_emoji` on the changed source, pages and public text | PASS (count) | admin.js 8 / 8, game.js 15 / 15, how-to-play.html 7 / 7, admin.html 0 / 0, llms.txt 0 / 0, css 1 / 1 (worktree / origin/main); no new dash or emoji in the added lines |
| 8 | Contrast (`contrast.py` on the tokens) | PASS | Value "70%" (`--text` on `--panel`) 14.75:1; label and hint (`--muted`) 7.43:1; gold slider on panel 10.18:1 (3:1 needed); focus ring (gold at 45% over the panel, composited) about 3.04:1 (3:1 needed), borderline, see OBS-63-04 |
| 9 | `validate_contrast` (DTCG colours file) | PENDING (environment) | The project has no DTCG colours file; replaced by row 8 |

### API (`api/settings.php`)

| # | Check | Result | Evidence |
|---|---|---|---|
| 10 | Missing row: `GET` shows `bot_accuracy` 3 | PASS | After the row was deleted: `"bot_accuracy":3` |
| 11 | `PUT` 0, 7 and 10: 200, and `GET` shows the value | PASS | Each PUT 200; GET reflected each value |
| 12 | `PUT` 11, -1, 5.5, 3.0, true, null and `[7]`: 400 "bot_accuracy must be a whole number between 0 and 10" | PASS | 400 each, same message |
| 13 | A rejected PUT saves nothing (also a mixed body) | PASS | `{"bot_accuracy":11,"timer_seconds":25}` gave 400; afterwards `timer_seconds` 30 and `bot_accuracy` 7 as before; same for 5.5, -1 and "x" |
| 14 | `PUT` with `"7"` (a string) | PASS (observation) | 200, stored as 7; the same shared `parse_int` accepts `"30"` for `timer_seconds`; see OBS-63-01 |

### Admin (`admin.html`, `js/admin.d7addc60.js`)

| # | Check | Result | Evidence |
|---|---|---|---|
| 15 | Slider: `type=range`, min 0, max 100, step 10, label for the slider, output for the slider, hint via `aria-describedby` | PASS | Read from the DOM at 1366 px |
| 16 | Loads at the saved value with a live "70%" and the hint | PASS | API 7: "70%", "Out of 10 answers: 7 right, 2 wrong, 1 I don't know." |
| 17 | Keyboard: Home to 0%, End to 100%, ArrowRight and ArrowLeft step 10, PageUp and PageDown step 10 | PASS | Real key events; focus stays on the slider; `aria-valuetext` follows |
| 18 | Live "%" and hint at all 11 steps (0% to 100%) | PASS | 0: 0/5/5; 30: 3/4/3; 50: 5/3/2; 70: 7/2/1; 100: 10/0/0 (all 11 checked) |
| 19 | Save sends only `{"bot_accuracy":3}` for 30%; message "Mokh Bot accuracy saved: 30%. New tournament matches use it." | PASS | Request body captured by the stub; message text read from `#bot-accuracy-msg` |
| 20 | Reload keeps the saved 30% and the hint | PASS | After reload: 30, "30%", "3 right, 4 wrong, 3 I don't know." |
| 21 | 400 from the API shows a visible error in the bot box | PASS | "bot_accuracy must be a whole number between 0 and 10" in `.msg-error` |
| 22 | D-79 l: an unsaved slider move (80%) is reset by the main Settings Save | PASS | Main Save body has no `bot_accuracy`; the form refilled from the answer: slider back to 30% |
| 23 | Focus indicator on the slider | PASS | Keyboard focus: `:focus-visible` true; `outline: none` with the site `--focus` box-shadow (gold, 3px); composited about 3.04:1 (row 8) |
| 24 | Layout at 1366 x 768: no sideways scroll; label and "n%" on one line | PASS | scrollWidth 1351 = clientWidth 1351; label top 262, "n%" top 260 |
| 25 | Layout at 375 px: no sideways scroll; label and "n%" on one line | PASS | scrollWidth 375 = clientWidth 375; label top 228, "n%" top 226 |
| 26 | Layout at 320 px: the new Mokh Bot box adds no width | PASS | Box and settings form share the column edge (324 px, same as the other settings); the slider and the label/"n%" line fit in it |
| 26a | Layout at 320 px: the page has no sideways scroll | FAIL (pre-existing) | Page scrollWidth 347 vs 320. The overflow starts in `section#settings-panel` (right edge 346) and is identical on `origin/main`. See BUG-63-01 |
| 27 | Console and exceptions clean during the Admin run | PASS | No messages, no exceptions |

### Bot answers (dice, D-79 a to e)

| # | Check | Result | Evidence |
|---|---|---|---|
| 28 | Match start reads `bot_accuracy`: 30% gives `botTickets` 3, 70% gives 7 | PASS | Real starts through the UI: saved match `botTickets: 3` (Admin 30%) and `botTickets: 7` (Admin 70%) |
| 29 | Settings read fails at match start: `botTickets` 3 (not Admin's 7) | PASS | Settings GET stubbed to 500 with Admin at 70%: saved `botTickets: 3` |
| 30 | Missing row: 30% in Admin and 3 for the match | PASS | Row absent (server restarted for the check, no write): Admin shows 30%, `GET` 3; a fresh match started through the UI saved `botTickets: 3` |
| 31 | Dice mapping at 0, 30, 70 and 100%: every face 1 to 10 | PASS | 40 of 40 rounds match the rule (`verify-bot`); 0%: faces 1 to 5 wrong, 6 to 10 IDK; 30%: 1 to 3 right, 4 to 7 wrong, 8 to 10 IDK; 70%: 1 to 7 right, 8 to 9 wrong, 10 IDK; 100%: 10 of 10 right |
| 32 | Right face: the real answer, scored Correct | PASS | 20 right rounds: text = stored answer (Arabic-first question); bot +points each time |
| 33 | Wrong face: `wrong_1` and `wrong_2` alternate, scored Wrong, points lost | PASS | 11 wrong rounds (6 `wrong_1`, 5 `wrong_2`); bot -points each time |
| 34 | "I don't know" face: "I don't know…", scored Wrong, points lost | PASS | 9 IDK rounds: "I don't know…"; bot -points each time |
| 35 | 0% never right; 100% always right | PASS | 0%: 0 right in 10 faces; 100%: 10 right in 10 faces |
| 36 | Reload mid-question keeps the same roll | PASS | Roll saved on open: wrong option 1; after reload with the face forced to 1, the same roll (`right: false, optionIndex: 1`) |
| 37 | Level frozen per match: a match at 70% still rolls 7 after Admin is set to 0% | PASS | Face 8 gave wrong option 1 (7 tickets), not IDK (0 tickets) |
| 38 | Old save without `botTickets`: plays at 30% and stays without the key | PASS | Face 4 gave wrong option 1 (3 tickets; at 7 it would be right); `hasOwnProperty('botTickets')` false after the round |
| 39 | Arabic interface: bot name, "says" and "I don't know" in Arabic | PASS | "مخ بوت يقول: لا أعرف…" (bidi isolates from the existing name helper), score -600 |
| 40 | Each question has a fresh roll | PASS (code) | `rollBot`/`rollBotFinal` call `Math.random` per question. An unforced sample was not run |
| 41 | A question without stored wrong options shows "I don't know…" for a wrong face | PASS (code) | `hasChoices` requires `wrong_1` and `wrong_2`; the sampled bank questions all had both |

### Smart board play (D-79 i and j)

| # | Check | Result | Evidence |
|---|---|---|---|
| 42 | At 30%, level or ahead: the lowest open value | PASS | 3 tickets, 0-0: 200; 3 tickets, bot 200 vs 0: 200; 0% level: 200; 5 tickets level: 200 |
| 43 | At 30% (and 0% and 50%), behind: the highest open value | PASS | 3 tickets, bot 0 vs 200: 600; 5 tickets behind: 600; 0% behind: 600 |
| 44 | Above 50%, always the highest open value | PASS | 6 tickets level: 600; 7 tickets ahead: 600; 10 tickets ahead: 600 |
| 45 | 5 and 6 tickets boundary | PASS | 5 level: lowest (200); 6 level: highest (600) |
| 46 | When the chosen value is used up, the next value | PASS | 3 tickets level with 200 used: 400; 7 tickets with 600 used: 400 |
| 47 | The value choice is re-checked before every pick | PASS (code) | `botChooseCell(g)` reads the live scores on each call; each case above uses a fresh save |
| 48 | The hidden double cell is never read | PASS (code) | `botChooseCell` has no reference to `g.double` (the only reads are in the render and the save validator) |
| 49 | Kilo Meshakkal (D-79 j): not opened while other cells are open; opened at random when only it is open | PASS | 0 of 17 picks with other cells open were in the Kilo Meshakkal column; with only it open, the bot opened a box (`catId -1`) |

### Golden Goal (D-79 h)

| # | Check | Result | Evidence |
|---|---|---|---|
| 50 | Limit 1000 at 70%: the bot bets 700 | PASS | Tie at 1000; human bet 100; saved `wagers {"2":100,"4":700}`; survives a reload |
| 51 | Capped, not a hundred: limit 650 at 100%: the bot bets 650 | PASS | Saved `4: 650` (700 capped to 650); survives a reload; the match is not discarded |
| 52 | 0%: the bot bets 0 and still answers | PASS | Saved `4: 0`; wrong answer, score unchanged |
| 53 | Limit 600 at 30%: the bet is 200 | PASS | Saved `4: 200`. The spec's "limit 200 at 30% gives 100" is not reachable on the default board (see OBS-63-03) |
| 54 | The Golden Goal answer uses the meter | PASS | 70%, face 8: wrong option 1 (700 lost); 100%, face 1: right (+650); 0%, face 1: wrong option 1 |
| 55 | The Golden Goal question shows its stored wrong options | PASS | Question with "Bhutan" and "Sri Lanka" as `wrong_1`/`wrong_2` |

### Regression

| # | Check | Result | Evidence |
|---|---|---|---|
| 56 | Human v human 4-team match: no `turn`, `coinShown` or `botTickets` in the saved game | PASS | Saved keys: mode, contestants, timerSeconds, helpersOff, points, categories, used, double, finalRound, final, statsSent, current |
| 57 | `TOURNAMENT_VERSION` stays 1 | PASS | `js/game.895be07b.js:216` is 1; no diff line touches it |
| 58 | Steal in human v human matches unchanged | PASS (code) | The diff touches only bot paths and the bot-only validity check; the steal path was not played in the browser |
| 59 | Old tournament saves and human v human saves load | PASS | Rows 38 and 56 |

### Docs

| # | Check | Result | Evidence |
|---|---|---|---|
| 60 | `how-to-play.html` (#tournament-bot): the setting (0% to 100%, 30% default), the smart play, the bet; no "easy" or "a third of the time" | PASS | Read in the worktree (lines 258 to 266) |
| 61 | `llms.txt`: the bot line says the admin sets its level; no "usually wrong" | PASS | Line 7 |
| 62 | `docs/spec.md`: the Mokh Bot accuracy item and the Admin slider | PASS | Lines 201 and 206 |
| 63 | `docs/deploy-hostinger.md`: redeploy entry, no migration, `api/settings.php` with the js, smoke check `"bot_accuracy":3` | PASS | Lines 243 to 245 |
| 64 | Product backlog: US-63, D-79 and the superseded D-78 f, i, o | PASS | `docs/product-backlog.md` lines 821 to 823 and the D-79 row |

Counts: PASS 63, FAIL 1 (row 26a), PENDING 1 (row 9).

## Bugs

### BUG-63-01 (Minor): Admin page scrolls sideways at 320 px (pre-existing)

- **Steps:** open `http://localhost:8006/admin.html` at a 320 px viewport width (any width where the page is 320 wide).
- **Expected:** no sideways scroll (D-30: sideways scroll at 320 px is a defect).
- **Actual:** `document.documentElement.scrollWidth` is 347 with a 320 px viewport. The overflow starts in the settings column (`section#settings-panel`, right edge 346, `#settings-grid` and the settings form at 324). The same page on `origin/main` gives 347 as well.
- **Scope:** not caused by US-63. The new Mokh Bot box does not add width (it sits in the same column as the other settings). Fix or follow-up is the PO's call.
- **File:** `admin.html` (the Point values and Game settings panel) and `css/style.e64ad66b.css` (the settings column width at narrow viewports).

## Observations (not bugs)

- **OBS-63-01: `"7"` (a string) is accepted by `PUT settings.php`.** `parse_int` is shared by all integer settings (`timer_seconds: "30"` is also accepted). The dev note says "parse_int refuses ... text"; that is inaccurate for numeric strings. No change needed for US-63; the note could be corrected.
- **OBS-63-02: mixed language in the bot's bubble.** The answer follows the question's language (Arabic first when the question has Arabic, as for human questions), while "Mokh Bot says:" and "I don't know…" follow the interface language. On the English interface an Arabic-first question gives "Mokh Bot says: الأنوف". This is the existing question language rule, not new; the owner may want to confirm it.
- **OBS-63-03: the example "limit 200 at 30% gives 100" cannot happen on the default board.** The limit is `max(score, largest enabled row)`, so it is at least 600 with rows 200 to 600. The formula was verified at 600 (gives 200). The 200-limit case only appears if the admin enables just the 200 row.
- **OBS-63-04: focus ring contrast is borderline.** The site's `--focus` token (gold at 45%) composites to about 3.04:1 against the panel. It passes 3:1 but only just. It is a site token, not new in US-63.

## Not covered

- Layout of the bot's match board at 375 and 320 px (not in the US-63 criteria).
- An unforced `Math.random` sample of bot rolls (each face was forced instead; the mapping is exact per face).
- Steal in a human v human match played in the browser (code review only, row 58).
- The owner's local Chrome check and the Android app (outside this story).
- `validate_contrast` (row 9): replaced by the measured contrast in row 8.
- Process cleanup: the headless Chrome instances started by the test scripts were asked to close (`Browser.close`) and their launchers killed. A PowerShell process listing was denied by the auto-mode classifier and was not retried; instead, `netstat` shows no listener on the test debug ports 9301 to 9396 at the end. The PHP servers on 8006 and 8007 were stopped by PID (each confirmed as php.exe) and the ports are free.

## Verdict

**READY FOR PO.** No Critical or Major defect. Every D-79 rule, the Admin slider, the API validation, the dice, the smart picks, the Golden Goal bet and the compatibility rules pass in the browser. BUG-63-01 (Minor, pre-existing on `origin/main`) is the PO's call. The owner's local check and the commit remain with the owner.

## PO acceptance (2026-11-27)

- **US-63: ACCEPTED.** Every acceptance criterion has a PASS row (Admin 15 to 27, API 10 to 14, dice 28 to 41, smart play 42 to 49, Golden Goal 50 to 55, compatibility 56 to 59, docs 60 to 64). Row 26a fails for a reason that was already on `origin/main`, not caused by US-63. Row 9 is pending because of the environment; row 8 covers it.
- **BUG-63-01:** not fixed in US-63; logged as FU-114 (Could, Developer).
- **D-79 j, k, l:** accepted. The owner confirms them at the local check (FU-115), else names a small CR. Recorded as D-79 m.
- **OBS-63-01:** no code change (shared `parse_int`, D-79 o). The dev note wording is to be corrected.
- **OBS-63-02:** existing question-language rule (D-79 p); the owner confirms at FU-115.
- **OBS-63-03:** the example is right but is only reachable with just the 200 row. The US-63 criterion and D-79 h now also give the default-board case (600 at 30% gives 200).
- **OBS-63-04:** site token, passes 3:1; no change.
- **Next:** FU-115 (the owner's local check), then FU-116 (commit, PR, deploy; no migration).

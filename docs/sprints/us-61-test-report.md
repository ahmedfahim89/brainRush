# US-61 Tournament mode: test report (D-77)

Tester: Senior Tester (verification only, no production code changed).
Worktree: `C:/Users/NB28970/Desktop/claude/BrainRush-tournament`, branch `tournament-mode` (uncommitted).
Date: 2026-11-26.

## Summary

- **Environment:** PHP 8 built-in server on `localhost:8016` (stopped after the run). MariaDB via XAMPP (shared local DB, used with care). Browser: headless Chrome on the DevTools protocol with a private profile (not the owner's profile). The Browser pane was used only for the first look; the browser viewport cannot be resized below ~500 px, so narrow and 1366 checks use an iframe of the exact width inside the test page (same origin, same CSS media queries).
- **Static checks:** `php -l api/game-log.php` clean. No `innerHTML` with data (only comments say "never innerHTML"). No string-concatenated SQL in the touched PHP. `api/config.php` is in `.gitignore`. No hard-coded board size: the 3-row cut and the bye table are the D-77 rules (`TOURNAMENT_ROWS = 3`, `BYE_ORDER`), not seed data.
- **Counts (acceptance-level rows):** PASS 66, FAIL 0, PENDING 4, NOTE 1 (see the table). Notes are under each block.
- **Bugs:** none confirmed. Three observations for the PO are listed below (not counted as bugs).
- **Verdict: READY FOR PO.** The PENDING items are native Arabic review (FU-107), the owner's own Chrome check (FU-108), hosted deploy (FU-109), and a full keyboard walk.

## Data hygiene (done, verified)

- Before any play: dumped `question_stats`, `settings` and `point_values` (the table the dev calls `points`) to the scratchpad (`backup-full.sql`). Counts before: question_stats 225 rows, settings and point_values as found (final_round_enabled 0, christmas_theme 0, all 6 point values enabled).
- During testing, the matches sent question stats: question_stats grew to 313 rows. This is from my test matches. The dev's 11 earlier counts were already inside the 225 rows.
- Toggles: `point_values` 200 disabled for one match and then re-enabled; `christmas_theme` set to 1 for one bracket check and back to 0; `final_round_enabled` set to 1 for the Golden Goal regression checks and back to 0.
- **Restore:** imported `backup-full.sql`. The full-dump diff against the backup is 0 lines. Result: question_stats 225 rows; final_round_enabled 0; christmas_theme 0; point_values 6 of 6 enabled.
- Note: `CHECKSUM TABLE` returned the same value before and after even though the rows changed, so it was not used as proof. The mysqldump diff is the evidence.
- `logs/` in the worktree did not exist before the first tournament Start (created 11:44 UTC by my test). It held only my test game-log lines (15 `tournament:` lines with names "Team A" to "Team H" and the test categories). The folder was deleted. The two curl tests of the name limits (2 and 9 names) returned 400 and wrote no lines.
- The test browser profile (localStorage for tournaments, language, and the test state) is private to this run and was closed. The owner's browser profile was not touched.

## Acceptance checks

Legend: PASS / FAIL / PENDING. "Evidence" is the check that was run.

### Setup (Tournament mode, D-77 j, n, q)

| # | Check | Result | Evidence |
|---|---|---|---|
| S1 | Third radio "Tournament (max 8)" | PASS | Radio `mode=tournament` and label text read in the DOM |
| S2 | Add button reads "Add contestant"; disabled at 8 | PASS | 8 rows, `#entry-add.disabled == true` |
| S3 | Start with fewer than 3 names: field error, click time | PASS | `#entry-min-error` role=alert "A tournament needs at least 3 contestants"; screen stays on setup |
| S4 | D-07: switching to Players with 8 entries | PASS | Switch allowed (per D-07 entries are kept); `#entry-limit-msg` "Players mode allows at most 6 players. Remove 2 to continue." |
| S5 | Start blocked while over the Players limit | PASS | Players with 8 names: Start stays on setup, start-msg shown, no `brainrush.game` written |
| S6 | 8 distinct colours in Tournament mode (pink, lime added) | PASS | Swatch colours: red, blue, green, orange, purple, cyan, pink rgb(240,107,181), lime rgb(163,209,60) |
| S7 | Colours back to 6 when leaving Tournament mode | PASS | 8 entries, first two removed, switch to Players: pink and lime rows get free palette colours; 6 distinct |
| S8 | Streak button hidden in Tournament mode | PASS | `#streak-btn` and `#streak-open-btn` not visible |
| S9 | Past tournaments button only in Tournament mode, with a record | PASS | Hidden in Players; visible in Tournament after a record exists |
| S10 | Daily / Crossword / Speed buttons | PASS (Players) / PENDING (Tournament) | Players: crossword and speed visible, daily hidden because `daily_enabled = 0`. Tournament-mode visibility of these buttons was not read in this run |

### Draw and bracket (D-77 a, g, k)

Read from `brainrush.tournament` after each Shuffle (20 shuffles per size, all invariants checked: byes only in the D-77 g positions, no match with two empty slots, every entry exactly once in round 1, later slots equal to the feeder winners).

| # | Entries | Bye positions (0-based round-1 matches) | Result | Evidence |
|---|---|---|---|---|
| D3 | 3 | 0 (bracket of 4) | PASS | 20/20 shuffles |
| D4 | 4 | none | PASS | 20/20 |
| D5 | 5 | 0, 1, 3 (bracket of 8) | PASS | 20/20 |
| D6 | 6 | 0, 3 | PASS | 20/20 |
| D7 | 7 | 0 | PASS | 20/20 |
| D8 | 8 | none | PASS | 20/20 |
| D9 | all sizes | byes never face each other in round 1 | PASS | invariant held in all runs |
| D10 | all sizes | Shuffle visible before the first match | PASS | `#bracket-shuffle` visible |
| D11 | 3 entries | Shuffle hidden after the first match | PASS | After Continue, `#bracket-shuffle` not visible; Start match and End tournament visible |
| D12 | 3, 5, 8 | "Next" tag and "Next: Final, X v Y" text | PASS | `#bracket-next` text |

Observation O1 (for the PO, not a bug): with 5 entries (3 byes in a bracket of 8), the two byes at quarter-finals 1 and 2 feed the same semi-final. Those two entrants both have a bye and meet in semi-final 1. That is unavoidable with 3 byes over 4 quarter-finals, and the rule "byes never meet" holds for round 1. Confirm this reading of D-77 g.

### Match board (D-77 b, e, i, f)

| # | Check | Result | Evidence |
|---|---|---|---|
| M1 | Start match posts the board; the board shows 3 value rows | PASS | Rows 100, 200, 300; info "Semi-final 2 · 2 contestants · 3 × 3 board" |
| M2 | Lowest 3 enabled values (200 disabled in the DB) | PASS | `game.points` [100, 300, 400]; cells 100/300/400; 200 re-enabled after (verified) |
| M3 | Per-match reset: scores 0, helpers 3 each, new double cell | PASS | Final board: scores 0; helpers `{choices, swap, skip}` each; double "16:300" (new) |
| M4 | End Game ends the match (confirm D-09) | PASS | Confirm "End the game now? 8 questions have not been played…"; result "Team A wins 100 – 0" |
| M5 | Match result: Continue only, then bracket | PASS | Continue leads to bracket; winner moved on with ✓ and "goes through" |
| M6 | Tie 0 – 0 with `final_round_enabled` = 0: Golden Goal offer | PASS | "It's a tie! Golden Goal ⚽?…"; buttons: "Go for goal" only; `#final-skip` hidden |
| M7 | Tie with `final_round_enabled` = 1: Skip still hidden inside a tournament | PASS | Same offer, `#final-skip` hidden (override holds) |
| M8 | Golden Goal bets, lock, question, decision | PASS | Bets 100 and 200 locked; marks wrong/correct; "Team B wins 100 – −200 after Golden Goal" |
| M9 | Golden Goal bet cap 300 (largest value) | PASS | Offer text "bet from 0 up to their score or 300, whichever is higher" |
| M10 | Coin toss when no question is left (409 simulated in the page) | PASS (simulated 409) | Fetch to `questions.php?random=1` answered 409 in the page; "Team H wins 0 – 0 on a coin toss", note "Coin toss: Team H goes through" |
| M11 | Back on the Golden Goal offer: ignored | PASS | Android Back with `?source=twa`: still on the offer |
| M12 | Back on the Golden Goal question: confirm; level match goes to next round, never a tie result | PASS | "Close this Golden Goal question? …"; dismiss stays; accept gives round 2 offer (not a tie result) |
| M13 | Back on a board (match): as End Game, confirm | PASS | "End the game now?" confirm; dismiss stays on the board |
| M14 | Start match failure shows a message and allows retry | PASS | Simulated 500: "Could not start the match: boom. Try again."; Start re-enabled; retry reaches the board |

Observation O2 (not a bug): the failure text includes the server's error text as-is. The simulated text was "boom". Check that real API error messages are user-safe.

### Results (D-77 h, k)

| # | Entries | Standings (rank, name) | Result | Evidence |
|---|---|---|---|---|
| R3 | 3 | 1 Team C, 2 Team B, 3 Team A | PASS | Results text |
| R5 | 5 | 1 A, 2 E, 3 B, 3 D, 5 C | PASS | Competition ranking 1,2,3,3,5 |
| R8 | 8 | 1 E, 2 G, 3 F, 3 D, 5 B, 5 C, 5 H, 5 A | PASS | 1,2,3,3,5,5,5,5; matches listed with scores and "after Golden Goal" |
| R9 | 3 | Share text | PASS | Captured: "Team B won the Mokh Rush tournament! 2nd Team A, 3rd Team C" + site link |
| R10 | all | New Game keeps history | PASS | Past list count kept after New Game |
| R11 | 3 | Results → setup; history updated | PASS | Finished tournament written to `brainrush.tournaments` (newest first) |

### Past tournaments (D-77 n)

| # | Check | Result | Evidence |
|---|---|---|---|
| P1 | List newest first | PASS | `finishedAt` descending after seeding and saves |
| P2 | Open a row: results with Share and Back, no New Game | PASS | Buttons "Back", "Share" |
| P3 | Delete asks first (D-18): dismiss keeps, accept removes | PASS | Dismiss: 20 rows kept. Accept: 19 rows |
| P4 | Cap 20; the oldest dropped | PASS | 19 seeded + one finish = 20; the next finish (5 entries) = 20, the oldest seed dropped |
| P5 | Corrupt entry dropped on load and written back | PASS | Seeded `{corrupt: true}`: after reload 19 stored, corrupt gone |
| P6 | Corrupt `brainrush.tournament` discarded to setup | PASS | Garbage value: setup opens, key removed |

### Reload, Android Back, End tournament, game log (D-77 l, m)

| # | Check | Result | Evidence |
|---|---|---|---|
| L1 | Reload restores bracket, board, open question, Golden Goal offer, Golden Goal wager, Golden Goal question, match result, results, Past list, Past row | PASS | Each checked with a reload and the screen list |
| L2 | Android Back on match result → Continue (bracket) | PASS | `?source=twa`, one tap, history.back |
| L3 | Back on bracket: End tournament confirm; dismiss keeps; accept discards, history unchanged | PASS | Dismiss kept the tournament. Accept: key removed, history 20 → 20 |
| L4 | Back on results → setup | PASS | Setup shown; tournament key removed |
| L5 | Back on Past list → setup; Back on Past row → Past list | PASS | Observed both |
| L6 | End tournament (button) discards without saving | PASS | Key removed, no history entry |
| L7 | One game-log line per tournament, at Start; matches not logged | PASS | 15 `tournament:` lines, one per Start (timestamps match my Start actions); none per match |
| L8 | `api/game-log.php` name limits for `tournament` | PASS (2 and 9 names) / PASS (3 and 8 via the app's own Starts, 201) | curl: 2 names → 400, 9 names → 400 |

### Language, layout, accessibility (D-77 r, j; "layout at 1366x768", 375, 320)

| # | Check | Result | Evidence |
|---|---|---|---|
| G1 | Arabic switch re-renders the four new screens; RTL mirrored | PASS | `dir=rtl`; bracket title "البطولة"; grid mirrored in screenshot |
| G2 | Arabic wording reviewed by a native speaker | PENDING | FU-107 (owner review) |
| G3 | Bracket, 8 entries, 1366x768: no vertical or horizontal scroll | PASS | docSH 764 = viewport 764; no overflow |
| G4 | Results, 8 entries, 1366x768: no scroll | PASS | docSH 764 = viewport 764 |
| G5 | Match board 1366x768 | PASS | docSH = viewport |
| G6 | Christmas theme on, bracket 1366x768 | PASS | No scroll; theme restored to 0 afterwards |
| G7 | Bracket and results at 375 px and 320 px: no sideways scroll | PASS | Iframe 371 and 316 px: scrollWidth 356 and 301; vertical scroll only |
| G8 | Arabic bracket at 375 and 320 px | PASS | No sideways scroll, RTL |
| G9 | Setup with 8 entries at 1366x768 | NOTE (not counted) | Scrolls (docSH 1709). The baseline Players setup with 6 names also scrolls (1565). Not a regression |
| G10 | Keyboard focus and ARIA on new controls | PENDING (partial) | Checked: `#entry-min-error` role=alert; mode radio label text; native buttons with text (Start match, Shuffle, End tournament, Continue, Share, New Game, Past, Delete). Not done: a full Tab walk and focus-ring check |

### Regression

| # | Check | Result | Evidence |
|---|---|---|---|
| X1 | Players game starts and reaches the board; saves as version 4 | PASS | `brainrush.game` version 4 |
| X2 | Players game, Golden Goal on: Skip visible; Skip → tie results | PASS | "Go for goal" and "Skip to results"; results "It's a tie between…" |
| X3 | Saved Players Golden Goal (v4) reloads on the offer | PASS | Reload → screen-final, version 4 |
| X4 | Teams game starts and reaches the board | PASS | Board shown, version 4 |
| X5 | Streak, Crossword, Speed buttons visible in Players | PASS | streak, crossword, speed visible |
| X6 | Streak, Daily, Speed game play | PENDING | Only the buttons were checked, not played |
| X7 | Tournament does not write `brainrush.game` | PASS | `brainrush.game` absent during tournament matches |

## Bugs

No confirmed bugs. No FAIL rows.

Observations for the PO (not counted):
- **O1:** 5 entries: two byes meet in semi-final 1 (see above). Please confirm this reading of D-77 g.
- **O2:** Start-match failure shows the server's error text. Check real API messages are user-safe.
- **O3:** Setup with 8 entries scrolls at 1366x768 (same as the baseline setup with 6 names).

## Not covered in this run

- The owner's own Chrome check on the owner's port (FU-108).
- Hosted deploy and CDN purge (FU-109).
- Arabic native review (FU-107).
- Keyboard walk with focus ring (G10).
- Streak, Daily and Speed games played end to end (X6).
- Tournament-mode visibility of Daily, Crossword and Speed buttons (S10).
- A real 409 from the API (the coin toss used a page-level 409).
- Android Back on the question screen inside a match (only the board and the Golden Goal question were checked).

## Verdict

**READY FOR PO.** All checked acceptance rows pass. The PENDING rows are the native Arabic review, the owner's Chrome check, the deploy steps, and a full keyboard walk, all as listed in FU-107 to FU-109 plus G10 and X6.

# US-61 Tournament mode: developer notes

Story: US-61 (Epic E21), decision D-77 (a to r). Branch `tournament-mode` (worktree `BrainRush-tournament`), from `main` d24b826. No migration and no new setting; one server change in `api/game-log.php`.

## Files changed

| File | Change |
|---|---|
| `js/game.480e525c.js` | Tournament mode: setup (third mode, 8 colours, minimum 3, Past tournaments button), draw and bracket, match boards, forced Golden Goal and coin toss, match result, tournament results, Past tournaments, save/restore, Android Back, language refresh. New section "Tournament (US-61, D-77)" before "Read aloud". |
| `js/i18n.fa40ed1b.js` | `mode.tournament`, `entry.*.tournament`, `color.pink`, `color.lime`, `board.contestants.tournament`, `final.rule.tournament`, `final.hint.tournament` and all `tournament.*` strings, in English and Arabic (the Arabic is an AI draft, FU-107). |
| `css/style.ba1c892a.css` | Tournament block at the end: bracket, match result, tournament results, Past list, the 3-way mode toggle on phones, footer hidden on the bracket and results screens. Logical properties, so Arabic mirrors without extra rules (one RTL rule for the name alignment). |
| `index.html` | Tournament radio, `entry-min-error`, Past tournaments button (with "Add contestant" in a new `.entry-actions` row), 4 new screens: `screen-bracket`, `screen-match`, `screen-tresults`, `screen-past`. |
| `api/game-log.php` | Mode `tournament`, 3 to 8 names (`GAME_LOG_MIN_BY_MODE`); the header comment shows the new line. |
| `how-to-play.html` | New `#tournament` section in the contents; the setup section mentions it. |
| `llms.txt`, `about.html`, `privacy.html`, `README.md`, `docs/spec.md`, `docs/deploy-hostinger.md` | Tournament described; privacy says finished tournaments keep contestant names on the device (and the start logs all names); deploy has a "Tournament (US-61, D-77)" upload section. |

No new JS or CSS file was added, so nothing needs a `git add` beyond the normal hashed renames by the pre-commit hook. The hook renames `js/game.*.js`, `js/i18n.*.js` and `css/style.*.css` at commit and updates the 8 pages that load them.

## How the acceptance criteria are met

**Setup.**
- `MODES.tournament = { limit: 8, key: 'tournament' }`. The add button reads "Add contestant" and is disabled at 8.
- Name checks are the existing ones. Fewer than 3 names at Start shows the field error "A tournament needs at least 3 contestants" (`#entry-min-error`, cleared when the count or the mode changes). Switching to Players or Teams with too many entries reuses D-07.
- Palette: `PALETTE` keeps the 6 colours. `TOURNAMENT_COLORS` adds pink `#f06bb5` (6.7:1 with the `#0b1026` ink) and lime `#a3d13c` (10.5:1).
- `paletteFor(mode)` serves `isValidContestants`, `firstFreeColor` and `cycleColor`. `paletteEntry` knows all 8.
- `normalizeColors()` runs on every `renderEntries`. Outside Tournament mode, an entry on pink, lime or a repeated colour gets a free colour of the 6. With more entries than colours, the rest stay until removed; Start is blocked anyway.
- The Streak save check still uses the 6.
- Categories and timer are the normal pickers. `resolveSelection` runs once, at Start. The tournament stores the column ids and the Surprise ids (`hidden`), and each match board marks those columns `hidden` again, so they show "?".
- The Daily, Crossword and Speed buttons are unchanged. The Streak button needs Players mode, so it is hidden.

**Draw and bracket.**
- `drawBracket` shuffles the entries into a bracket of 4 or 8. Byes take the second slot of first-round matches in `BYE_ORDER` (`{4: [0], 8: [0, 3, 1]}`, 0-based).
- Checked in the browser: 3 entries give A v bye, B v C; 5 entries give bye, bye, play, bye.
- A bye match is decided at once (`way: 'bye'`), and `advanceBracket` fills the later rounds from the winners.
- `screen-bracket` shows one column per round with match cards: the match name, swatch, name, score once played, a ✓ and bold gold for the winner (plus hidden ", goes through"), the loser struck through (plus hidden ", out"), "To be decided" for unknown slots, "Name – bye" for byes, and "after Golden Goal" / "coin toss" notes.
- The next match (`nextMatch`: first round top to bottom, then the next round) is highlighted with a "Next" tag and named under the bracket.
- Shuffle shows until the first match starts (`started`). End tournament asks "End the tournament? It will not be saved.", then runs `newGame()`; nothing is written to Past tournaments.

**Match.**
- Start match posts `questions.php?board=1` with the columns and `seen: loadSeen()`, then `parseBoard`.
- `cutRows` keeps `points.slice(0, TOURNAMENT_ROWS)` and deletes the other values' questions from every column, Kilo Meshakkal included.
- After the cut come `hidden`, `preloadImages`, `dealMixColumn` and `pickDoubleCell`, so the Kilo Meshakkal order and the ×2 cell only use the kept rows. The enabled values are whatever the board API sends at each match start.
- Start match is disabled ("Loading...") while the request runs. A failure shows "Could not start the match: … Try again." on the bracket.
- The match game is a normal board game with `mode: 'tournament'`, the two contestants (entry ids, names and colours), scores 0, fresh helpers, `helpersOff` as at Start, the setup timer, `finalRound: true` and `statsSent: []`. The board, question, helpers (a Swap keeps its own value), Report, read aloud, stats and the played list run on the existing code.
- The board info line starts with the match name ("Semi-final 2 · 2 contestants · 3 × 3 board · …").
- `endGame()` (D-09 confirm while cells remain, or the full-board button): a tie goes to `openFinalOffer`, because `finalRound` is true. Otherwise `finishMatch('score')` sends the higher score through, negative scores included.
- Golden Goal in a match:
  - Skip is hidden and `onFinalSkip` is guarded.
  - The rule and hint use `final.*.tournament`.
  - The bet cap is `wagerLimit` on the match board's points.
  - The last button reads "See match result"; while still tied it offers "Next round", as D-51.
  - `finishFinal` → `finishMatch('goal')`.
  - A 409 (no question left) → `finishMatch('coin')`, which draws the winner at random.
  - A load failure says "Try again." without "skip to the results".
- Match result (`screen-match`): the match name, "Sara wins 300 – 200" ("after Golden Goal" / "on a coin toss"), and "Coin toss: Sara goes through" for a coin toss. Continue is the only button; it goes to the bracket, or to the results after the final.

**Final results and standings.**
- After the final, `finishMatch` sets `finishedAt` and adds the tournament to Past tournaments.
- `standingsOf` gives the champion tier 0, then the losers of each round from the final back: 2nd, 3rd, 5th.
- The rank is competition ranking (1 + the number of entries in better tiers), and rows keep bracket order. Byes are never losses.
- Checked in the browser: 3 entries give 1st, 2nd, 3rd; 5 give 1st, 2nd, 3rd, 3rd, 5th; 8 give 1st, 2nd, 3rd, 3rd, 5th ×4.
- `screen-tresults`: "<Name> wins the tournament!", the standings and every played match ("Quarter-final 1 ✓ Sara 300 – 200 Omar", with the way noted), plus Share and New Game.
- Share text, checked in the browser: "Sara won the Mokh Rush tournament! 2nd Ali, 3rd Omar" plus the site link, through `BrainRushShare`.
- New Game is `newGame()`: setup per D-15, and the Past tournaments list is kept.

**Past tournaments.**
- `brainrush.tournaments` holds `{startedAt, finishedAt, entries, rounds}` records, newest first, at most 20. A 21st drops the oldest. Saving the same tournament again replaces its record, so a save repeated after a crash is harmless.
- Records failing `isValidRecord`, and duplicates, are dropped on load and the list is written back.
- The "Past tournaments" button shows on setup in Tournament mode once one record exists. Hidden in maintenance and in the Streak setup.
- The list (`screen-past`) shows "date, time · champion · N contestants". A row opens that tournament on `screen-tresults` with Share and Back, without New Game. Delete asks first (D-18).

**Refresh, Back and log.**
- See "Save format" below. Checked in the browser, each reload comes back where it was: bracket, match board, open match question, Golden Goal offer, Golden Goal question, match result, tournament results, Past list and a Past row.
- Corrupt `brainrush.tournament` and `brainrush.tournaments` values are discarded to setup.
- Android Back in `goBack()`:
  - bracket → End tournament confirm
  - match board / question → as a normal game (`endGame`, `confirmBackToBoard`)
  - Golden Goal offer and bets in a match → ignored
  - Golden Goal question in a match → confirm ("Close this Golden Goal question? …"), then the next round if still level, else the match result; never a tie result
  - match result → Continue
  - tournament results → setup (as New Game), or the Past list for a Past row
  - Past list → setup

  These were checked with `?source=twa`, real taps and `history.back()`.
- Game log: one `postGameLog({mode: 'tournament', players: <all names>, categories: <column ids>})` at Start; `beginMatch` never logs.
- `api/game-log.php`: `'tournament' => 8` with `GAME_LOG_MIN_BY_MODE['tournament'] = 3`. Checked with curl: 2 names → 400, 3 → 201, 8 → 201, 9 → 400, and players mode is unchanged.

**Language, layout, docs.**
- Every new text is a `tournament.*` (or mode-keyed) string in both tables. The four new screens re-render on a language switch (`refreshScreen`).
- The bracket grid follows the page direction, so it mirrors in Arabic.
- Checked with an 8-entry bracket and 8-entry results at 1366x768, in English, in Arabic and with the Christmas theme on: `scrollHeight == innerHeight` and no sideways scroll. The footer is hidden on these two screens, as on the board.
- At 375 and 320 px the rounds stack and the results go to one column, with no sideways scroll. The setup's 3-way toggle fits 320 px by putting "(max N)" under each mode name below 600 px.
- A match board fits 1366x768 like a normal board.
- Docs: listed in the table above.

## Save format (developer choice)

The brief expected the match to live in `brainrush.game` with new screens in `SCREENS`. Instead:
- The whole running tournament is one value under its own key, `brainrush.tournament`: `{ version: 1, screen, tournament, game }`, where `game` is the match board or null.
- While a tournament runs, `saveState()` writes that key, so every existing `saveState()` call in the board, question and Golden Goal code saves the match inside the tournament.
- `finishMatch` updates the bracket, drops the match board and shows the match result in one `setItem`, so a reload can neither replay nor lose a match.

Consequences:
- `brainrush.game`, its `STORAGE_VERSION` (4) and `migrateSaved` are unchanged, so existing Players, Teams and Golden Goal saves load as before (checked: a Players game saves as version 4 and reloads).
- `loadState()` now refuses a `brainrush.game` whose mode is `tournament`, which can only happen by tampering.
- `SCREENS` (the plain save whitelist) is unchanged. The new screens are in `ALL_SCREENS` through `TOURNAMENT_VIEWS`, and `TOURNAMENT_SCREENS` lists the screens a tournament save may hold.
- `isValidTournament` checks:
  - the entries: 3–8, unique names and the 8 colours
  - the columns
  - the bracket size and round lengths
  - the byes exactly as D-77 g, and every entry exactly once in round 1
  - each later slot equal to its feeder's winner
  - results: the winner is in the match and has the higher score, and a coin toss only on a tie
  - `playing` equal to the next match, and `last` a played match
- `isValidTournamentScreen` checks that the screen fits the state and that the match board passes `isValidGame` and `isValidScreenFor` with the current match's two contestants.
- `beginGame` (a normal game) clears any tournament key, and `newGame()` clears both.
- `init()` restores the tournament right after the board game and before the solo runs. The Past view is restored last, just before `startSetup()`, so every saved solo run (Speed, Daily, Streak, Crossword) is loaded into memory first.
- The Past list being open is kept in `sessionStorage` (`brainrush.tournamentPastView`), so a reload on the list or a Past row comes back there (with setup behind it in Tournament mode). A new visit starts on setup.

## Other developer choices for the PO

- New colours: Pink `#f06bb5` and Lime `#a3d13c`. In the screenshots lime reads clearly apart from green `#2fb36d` and gold `#f5c518`. Arabic names: وردي, ليموني.
- The board's End Game button keeps its label in a match, and its confirm is the normal D-09 text.
- The Golden Goal offer in a match keeps the normal lead text ("… are tied for first on 0 …").
- Back on the Golden Goal question of a match asks before closing it. A level match then goes to the next round; a decided one goes to the match result.
- After End tournament or New Game, setup opens in Players mode (D-15 "empty setup"). Past tournaments shows once Tournament is selected.
- Share lists every place, 5th included ("… 3rd Ali and Mona, 5th Bo and Cy"); the AC example stops at 3rd because it has 4 entries.
- The Past row's date is the finish time, in local time ("26 Nov 2026, 18:40").
- The tournament-start log uses the resolved column ids (Surprise already drawn), as a normal game does.
- After the **final**, the match result view is shown first, like any other match, and its Continue opens the tournament results. D-77 (k) can be read either way.

## How to run and test

1. Start MariaDB and `C:/xampp/php/php.exe -S localhost:8015 -t <worktree>`, then open `http://localhost:8015/`.
2. Choose Tournament, add 3, 5 or 8 contestants, pick categories and press Start Game.
3. Play matches: open a cell, mark Correct, then End Game. A 0–0 End Game goes to Golden Goal even with Golden Goal off in Admin.
4. Android Back: open `index.html?source=twa`, tap once, then use the browser Back.
5. `php -l api/game-log.php`: no syntax errors. `node --check` on `js/game.*.js` and `js/i18n.*.js`: OK.
6. The worktree has no `package.json` or lint scripts; only `.githooks` (the hash hook).

What was run, in headless Chrome over CDP against port 8015:
- setup errors
- the 3-, 5- and 8-entry draws, including byes and Shuffle
- the match board cut (`points` [100, 200, 300] with the Kilo Meshakkal order inside them, the double cell on a kept row)
- reloads on every tournament screen
- forced Golden Goal with `final_round_enabled` = 0, the coin toss (a 409 for `random=1` injected in the page)
- the full tournaments to their results, Share, Past tournaments open and delete
- Android Back on each screen
- the mode switch back to Players with the colour normalisation
- a normal Players game save and reload, and End Game → Results with Golden Goal off
- corrupt saves
- the Integration Quiz loading

No page exceptions. Screenshots: 1366x768, 375, 320, Arabic and the Christmas theme.

The test game-log lines went to the worktree's `logs/` folder (git-ignored), which did not exist before; it was deleted afterwards. No setting was changed.

**Database side effect (not reverted).** The test matches sent **11 question outcomes** (`POST api/question-stats.php`, all "correct") to the shared local MariaDB, so `question_stats` (US-47) has 11 extra "correct" counts. They all went to the first board cell of a match, the **AI (category 14) 100-point** questions. MariaDB has no binary or general log here, so the exact rows cannot be identified and were not reverted. Admin "Reset all stats" would wipe real data, so it was not used. The later checks (`s6`) sent no stats.

## Known limitations

- The Arabic strings are AI-drafted (FU-107).
- A small question bank can repeat questions across matches. The played list (unseen first) is the only guard; the board API has no `exclude` (accepted in D-77 o).
- As for any restored game, Android Back after a reload works only after the first tap (the known D-43 limitation).
- FU-108 (the owner's Chrome check on port 8005) and FU-109 (PR and deploy) are still open.

# US-63 Mokh Bot accuracy meter and smart board play: developer notes

Story: US-63 (Epic E21), decision D-79 (owner a to i, developer choices j to l). Branch `bot-accuracy` (worktree `BrainRush-bot-accuracy`), from `main` 39a21a2, built 2026-11-27. No migration. One server file changes (`api/settings.php`). Plan: `in-the-tournament-mode-velvety-clarke.md` (approved by the owner 2026-11-26).

## Files changed

| File | Change |
|---|---|
| `api/settings.php` | `bot_accuracy` in `SETTING_RULES` as `[0, 10]` (right tickets out of 10); `load_settings` reads a missing row as 3. |
| `admin.html` | A "Tournament: Mokh Bot" box under "Tournament board" in the Point values panel: `#bot-accuracy-form` with a labelled range slider `#setting-bot-accuracy` (0 to 100, step 10), an `<output>` with the live "n%", the hint `#setting-bot-accuracy-hint` (linked by `aria-describedby`) and a **Save bot accuracy** button. |
| `js/admin.d7addc60.js` | `setBotAccuracy` (from `fillSettings`), `botAccuracyTickets`, `renderBotAccuracy` (live "n%", `aria-valuetext` and the hint, on `input`), `onBotAccuracySubmit` (sends only `{ bot_accuracy }`). |
| `css/style.e64ad66b.css` | 4 rules after `.points-side .setting-group`: the box's top margin, the label and "n%" on one line, the slider without the text-field padding, border and background (`accent-color: var(--gold)`). Tokens and rem only. |
| `js/game.895be07b.js` | `BOT_ACCURACY` and `BOT_FINAL_ACCURACY` removed; `BOT_TICKETS` (10) and `BOT_TICKETS_DEFAULT` (3) added. The setting read at match start, `botTickets` on the match board, the dice, the bet and the smart pick (below). |
| `how-to-play.html` | `#tournament-bot`: no more "easy" or "a third of the time"; two new points (the Admin level, the smart play) and the bet follows the level. |
| `llms.txt` | The bot line: the admin sets its level; no more "usually wrong". |
| `docs/spec.md` | The Mokh Bot paragraph points to a new "Mokh Bot accuracy and smart play" item; the Admin Point values panel mentions the slider. |
| `docs/product-backlog.md` | US-63, the story status row, D-79; D-78 f, i and o marked superseded; a "Changed by US-63" line under US-62. |
| `docs/deploy-hostinger.md` | A "Mokh Bot accuracy" redeploy entry (no migration, `api/settings.php` with the js, smoke check). |

No new JS or CSS file. The hashed assets were edited in place; the pre-commit hook renames `game`, `admin` and `style` at commit time and rewrites the pages.

## How it works (function names)

**Setting.** `bot_accuracy` is stored as right tickets 0 to 10 (70% = 7), so the 10% steps need no extra check. `parse_int` refuses 5.5, `true` and non-numeric text such as "x", so those get 400 (a numeric string such as "7" is accepted as 7, as for every whole-number setting, shared `parse_int`) with the usual "must be a whole number between 0 and 10". The save already upserts, so the first Save creates the row.

**Admin.** The slider works in percent and the API in tickets: `botAccuracyTickets` = value / 10, `setBotAccuracy` = tickets x 10 (anything invalid or missing shows 30%). The hint uses the same split as the game: wrong = ceil((10 - right) / 2), "I don't know" = the rest.

**Match start.** `onStartMatch` already read `settings.php` once per match; it now resolves `{ allowed, tickets }` (`botTicketSetting`: a whole number 0..10, else 3; a failed read gives `{ [], 3 }`). `beginMatch(ref, board, allowed, hidden, tickets)` sets `g.botTickets` only on a bot match (next to `turn` and `coinShown`), so a human v human match board is unchanged. `isValidGame` accepts an optional `botTickets` (`isValidBotTickets`), and `isValidTournamentScreen` refuses one on a match without the bot. `TOURNAMENT_VERSION` stays 1; a save without it plays at 3 (`botTickets(g)`).

**Dice.** `botRoll(q, tickets)`: `face = 1 + floor(random * 10)`; `wrong = ceil((10 - tickets) / 2)`; `face <= tickets` right (`optionIndex: null`); `face <= tickets + wrong` wrong with `optionIndex = 1 + (face - tickets - 1) % 2`, or `null` when `!hasChoices(q)`; otherwise "I don't know" (`optionIndex: null`). The saved shape `{ right, optionIndex: 1 | 2 | null, said? }` is unchanged, so `isValidBotRoll`, `botAnswerText` and the scoring need no change. `rollBot(g, ...)` and `rollBotFinal(g, q)` both use `botTickets(g)`; the two `rollBotFinal` callers (`onFinalOpen`, `armBotAnswer`) now pass `g`.

**Bet.** `placeBotBet`: `min(limit, round(limit * tickets / 10 / 100) * 100)` with `limit = wagerLimit(g, c.score)`. Always a whole number from 0 to the limit, so `isValidWager` holds.

**Smart pick.** `botPickCell` now calls `botChooseCell(g)`. It lists the open cells outside the Kilo Meshakkal column; `goHigh` = more than 5 tickets, or the bot's score below the other contestant's (`otherContestant`); it takes the highest or lowest open value and a random category with that value. `g.double` is never read. The highlight, `openCellWithFx` and the timings are unchanged; nothing new is saved.

## Developer choices for the PO (D-79 j to l)
- **Kilo Meshakkal (j).** Its boxes show an emoji and their values are shuffled down the column (US-53), so the host cannot see what a box is worth. Picking "the highest value" there would use hidden knowledge, the same as knowing the double cell. The bot therefore chooses among the other columns, and opens a Kilo Meshakkal box, at random, only when no other cell is open. A board of only Kilo Meshakkal plays it at random.
- **Where the slider lives (k).** Under "Tournament board" in the Point values panel, in its own box with its own Save, like the tournament board. It applies to matches started after the save; a match already running keeps its level.
- **Main Save (l).** Saving the Game settings form refills the whole Admin from the answer, so an unsaved slider move is reset to the saved value (the tournament board ticks behave the same).
- No new user-facing Arabic: the Admin page and the guide are English only, and the game strings are unchanged. So no review follow-up.

## How to run and test
- `php -S localhost:8006` from the worktree (XAMPP MariaDB running).
- **Ticket mapping and bet** (node one-off that pulls the real `botRoll`, `placeBotBet`, `botTickets` and `botChooseCell` source out of `js/game.895be07b.js` and runs it with a fixed `Math.random` for each face 1..10):
  - right/wrong/IDK: 0 -> 0/5/5, 1 -> 1/5/4, 2 -> 2/4/4, 3 -> 3/4/3, 4 -> 4/3/3, 5 -> 5/3/2, 6 -> 6/2/2, 7 -> 7/2/1, 8 -> 8/1/1, 9 -> 9/1/0, 10 -> 10/0/0. The wrong faces alternate options 1, 2, 1, 2...; with no stored options a wrong face is `optionIndex: null`.
  - Bets: limit 1000 at 7 -> 700; limit 200 at 3 -> 100; limit 350 at 10 -> 350 (capped); limit 500 at 0 -> 0. `botTickets`: missing -> 3, 11 -> 3, 7 -> 7.
  - Picks (values 100/200/300, two columns plus Kilo Meshakkal): 3 level or ahead -> the 100s, 3 behind -> the 300s, 5 behind -> 300s, 5 level -> 100s, 6 ahead -> 300s, 7 with the 300s used -> 200s, only Kilo Meshakkal open -> its boxes at random.
- **API** (curl): `GET` -> `"bot_accuracy":3` (no row); `PUT` 11, -1, 5.5, `"x"` and `true` -> 400 "bot_accuracy must be a whole number between 0 and 10"; `PUT 7` -> 200 and `GET` gives 7. Local admin has no credentials, so PUT works from localhost.
- **Admin** (Playwright, installed Chrome, 1366x768): loads at 30% with "Out of 10 answers: 3 right, 4 wrong, 3 I don't know."; 4 x ArrowRight -> 70%, "7 right, 2 wrong, 1 I don't know.", `aria-valuetext` "70%"; Save -> "Mokh Bot accuracy saved: 70%. New tournament matches use it."; reload -> 70%; 0% -> "0 right, 5 wrong, 5"; 100% -> "10 right, 0 wrong, 0". No console errors.
- **Game** (Playwright, `game-log.php`, `question-stats.php` and `reports.php` POSTs stubbed so the DB was not written): a 3-contestant tournament, the bot match saved `botTickets: 7` (from the 70% setting). Then the save was edited (bot's turn, scores, `botTickets`) and reloaded, and the bot's pick read from the save:
  - 3 tickets level -> 200 row (lowest), 3 categories seen; 3 ahead -> 200 row; 3 behind -> 600 row; 7 level -> 600 row; 7 with the 600 row used -> 400 row.
  - An old save without `botTickets` loads on the board, plays as 3 (lowest row when level) and stays without `botTickets`.
  - 10 tickets: 4 of 4 right; 0 tickets: 0 of 4 right.
  - A save with `botTickets: 11` is discarded (invalid), as any invalid save.
  - Reload mid-question: the same `botRoll`.
- After the tests the `bot_accuracy` row was deleted again from the local DB (it did not exist before; the setting is new), `GET` shows 3, and the server was stopped.
- `php -l api/settings.php`: no syntax errors. `node --check` on `js/game.895be07b.js` and `js/admin.d7addc60.js`: OK.
- Gates (the plugin scripts, run with Python; `scripts/gate.mjs` is not in this repo, see the known limitations):
  - `lint_hardcodes.py`: `css/style.e64ad66b.css` 243 findings, the same 243 on `origin/main`; the added CSS lines alone: OK. `admin.html` and `js/admin.d7addc60.js`: OK on both. `js/game.895be07b.js`: 17 on both.
  - `check_no_emoji.py` on the 5 changed source files: 24 findings, the same 24 on `origin/main` (older dashes); the added lines have no dash or emoji.
  - `validate_contrast.py` cannot read this CSS (no DTCG colours file). Measured with the plugin's `contrast.py`: the "70%" (`--text` on `--panel`) 14.75:1, label and hint (`--muted` on `--panel`) 7.43:1, the gold slider on `--panel` 10.18:1 (non-text, 3:1 needed).

## Known limitations
- The Golden Goal bet in a real level match and the Kilo Meshakkal pick were checked in the node one-off on the shipped code, not in the browser.
- `scripts/gate.mjs` does not exist in this repo, so the gates were run as the plugin's Python scripts directly.
- The bot's level is read when a match starts; changing it in Admin does not change a match that is already running (by design).

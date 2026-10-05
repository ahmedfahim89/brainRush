# Sprint 4 — Developer note (Question, timer, scoring, results, persistence)

Stories: US-08, US-10, US-11, US-12, US-13, US-14, US-15, US-16, US-17, US-27. Plus the carry-overs from Sprint 2 (O-4, O-5) and Sprint 3 (O-1, O-2, O-3, `password.txt` deploy note).

## Files created / changed

| File | Status | Purpose |
|---|---|---|
| `index.html` | changed | The board bar now has **End Game** instead of "Quit to setup", plus a new "all questions played" offer. The Question and Results screens are built out from their Sprint 3 shells. |
| `js/game.js` | changed | Question screen, timer + beep, scoring, used cells, End Game, Results, New Game, and storage v2 with restore of every screen. The setup code is unchanged. |
| `css/style.css` | changed | Question/timer/scoring styles, owner-colored and grey cells, the board-done offer and results/winner styles. Row height now scales with the number of rows. `.msg` gets `overflow-wrap: anywhere` (O-5). The `--cols`/`--digits` fallbacks are removed (O-1). The `.shell` rule is removed. |
| `README.md` | rewritten | Final README: setup, how to play, admin usage, security/credentials, the public-exposure warning, a `php -S` warning, and the `expose_php=Off` hardening note (O-4). |
| `docs/deploy-hostinger.md` | changed | `password.txt` must never be uploaded and `.htaccess` must be uploaded. Adds the `/password.txt` 403/404 checklist item and redeploy notes. |
| `docs/sprints/sprint-4-dev.md` | new | This note. |

**No PHP, SQL or `.htaccess` changes.** `.htaccess` keeps the `password.txt` blocks added on 2026-10-05 (task 16). The game still uses only `GET` endpoints, so it works on the hosted site without the admin login. `js/admin.js` and `admin.html` are unchanged; the US-27 sweep found nothing to fix (see below).

## How it works

### Game state (stored shape v2)
`state.game` gains two fields:
- `used`: `{ "<categoryId>:<points>": { owner: <contestantId> | null } }`. `null` means nobody was correct, so the cell is grey.
- `current`: `null`, or the open question `{ catId, points, marks: { "<contestantId>": "correct" | "wrong" }, answerShown }`.

Scores are applied to `contestants[].score` at click time. `saveState()` runs after every change (open, mark, show answer, back, end, manual ±). The saved record is `{version: 2, screen, game}`.

### US-11 Open a question
- An unused cell is a normal button. Clicking it sets `current` and shows the Question screen.
- The heading reads `<Category> – <points>` (en dash). The question text is large (`clamp(1.6rem, 3vw, 3rem)`) and the answer is hidden.
- **Show Answer** reveals the stored answer and hides the button. `answerShown` is saved, so after a refresh the answer stays revealed if it already was.
- Focus moves to the heading when a question opens and to the answer when it is revealed.

### US-12 Timer
- The countdown starts automatically at `game.timerSeconds`, which is the per-game override from setup.
- It is computed from an end timestamp (`performance.now()`) and checked every 100 ms, so it does not drift when the browser throttles timers.
- It shows the whole seconds left (rounded up) and a bar (`transform: scaleX(remaining / total)`).
- At remaining ≤ T/3 (compared in ms), `.timer.is-low` turns the number and bar red.
- At 0 (D-03):
  - the timer stops;
  - "Time's up!" is shown;
  - one Web Audio beep plays (880 Hz square wave, 0.8 s, with a fade-in and fade-out);
  - nothing is scored or closed, and the scoring buttons stay usable.
- **Pause/Resume** is one toggle that keeps the remaining time. It is disabled at 0.
- **Reset** returns to T and runs again (and re-arms the beep).
- **Audio unlock:** browsers block audio until the user interacts with the page. The `AudioContext` is created/resumed on the first `pointerdown`/`keydown` anywhere on the page. Opening a cell is such a click, so in normal play the beep always works. `beep()` never creates a context itself, which avoids the autoplay console warning. See Known limitations.

### US-14 Scoring
- Each contestant gets a row with a left border and name chip in their color, their current score, and **"✓ Correct (+p)"** and **"✗ Wrong (−p)"** (with a U+2212 minus).
- Rules (enforced in `markContestant()` and mirrored by the disabled state in `updateScoringRows()`):
  - a marked contestant's two buttons are disabled;
  - once anyone is Correct, every Correct button is disabled;
  - Wrong stays enabled for contestants not yet scored (D-08);
  - at most one Correct per question;
  - no undo (D-06).
- The mark given stays highlighted (filled green/red) while disabled, so the host can see who got what.
- After a click, focus moves to the next enabled scoring button, or to **Back to Board** if none is left.

### US-13 / US-08 Back to Board and cell states
- **Back to Board** stops the timer and records `used[key] = { owner: <Correct contestant id> | null }`. It clears `current`, re-renders the board and saves.
- A used cell is a `disabled` button, so clicks do nothing. `openQuestion()` also ignores used cells, a non-board screen, or an already open question.
- An **owned** cell is filled with the owner's palette color (`background-image: none` removes the default gradient) and uses the readable ink color. It shows the points (label 70% size) and the owner's name in small text, with an ellipsis if too long.
- An **unanswered** cell is grey (`#4b5163`) with muted text.
- The `aria-label` says "won by X" or "no correct answer".
- The board info line now shows "Played k of M".

### US-10 End Game
- **End Game** is always in the board bar.
- While cells are still open, it asks `confirm("End the game now? N questions have not been played and will be ignored.")` (D-09). Cancel keeps the game.
- When all N × P cells are used (any board size, D-01), a gold banner appears above the board: "All M questions have been played." with **End Game and show results**. Focus moves to it after the last question.
- With every cell used, neither button asks for a confirm, because nothing is being thrown away.

### US-15 Results
- Contestants are sorted by score, highest first. Equal scores keep the setup order and share a rank (1, 1, 3).
- Each row shows the rank, a color swatch and left border, the name and the score.
- Everyone on the top score is highlighted (gold border and glow, with a "Winner" badge), per D-10. That includes all-zero and all-negative ties.
- The headline reads "X wins!" for one winner (also for a single contestant), or "It's a tie between X and Y" / "X, Y and Z" for a tie.

### US-16 New Game
Clears the game and `localStorage`, then shows an empty Setup that reloads settings and playable categories from the API (D-15). No confirm is needed, because the results were already shown.

### US-17 Persistence
- `loadState()` validates everything before using it:
  - the Sprint 3 checks (mode, contestants, timer, ascending points, every question present);
  - **contestant names** must be non-empty after trimming, at most 30 characters (O-3 / D-22) and unique ignoring case;
  - category ids must be unique;
  - every `used` key must name a real cell in canonical form, and every owner must be `null` or an existing contestant;
  - `current` must point to an unused cell, with marks only for existing contestants, only `correct`/`wrong`, and at most one `correct`;
  - the screen must match: `question` needs an open question, `board`/`results` must not have one.
- If any check fails (or the JSON is invalid), the key is removed and Setup is shown with no JS error. As a last safety net, `init()` wraps the restore in try/catch and falls back to Setup.
- Restore by screen:
  - Board: used cells, colors, scores and timer length.
  - Question: the same question, with its marks, scores and answer state. The timer restarts at full length (D-04).
  - Results: the same results.
- **v1 migration:** a Sprint 3 save (v1, always on the board) gets `used: {}` and `current: null` and is restored. Games running on the staging site at redeploy time therefore survive. Any other v1 shape is discarded.

### Task 14 / D-21: no way to discard a game without confirm
- The "Quit to setup" button, its handler and its DOM reference are removed.
- The only ways out of a running game are:
  - **End Game** (with a confirm while cells are open) → **Results** → **New Game**;
  - a refresh, which restores the game.
- The header's Admin link leaves the page, but the game stays saved and is restored when the host comes back.

### US-27 Security sweep
- `js/game.js` and `js/admin.js` have no `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval` or `new Function`. The only matches are comments.
- All data goes through `textContent` (the `h()` helper), `createTextNode`, attributes, or `style` properties set from the fixed palette.
- No URL is ever built from data. There are no external URLs or CDNs.
- `confirm()` texts are plain strings.

### CSS carry-overs
- **O-5 (D-19):** `.msg { overflow-wrap: anywhere; }`.
- **O-1:** `.board` no longer declares `--cols: 5; --digits: 3;`. JS sets `--cols`, `--rows` (new) and `--digits` inline from the board data.
- **Layout (O-4 visual check):**
  - The cell `min-height` is now `clamp(3rem, 48vh / rows, 6.5rem)`, so a 6-row board plus a 6-player scoreboard fits in 1366×768.
  - The question screen is two equal columns (question + timer + answer | scoring + Back), stacked below 960 px.

## How to run / test
1. Load the DB and configure `api/config.php` (see README).
2. From the project root, run `C:/xampp/php/php.exe -S localhost:8000`.
3. Open `http://localhost:8000/`.
4. For a 6 × 6 board, use Admin: add point value 1000, fill the 1000 slot of all 6 categories and set categories per game to 6.
5. For the timer: enter 20 in the setup timer field. Click anything once before the countdown ends if the page was just refreshed (audio unlock).

## Verification performed
- **`php -l`**: passes on all `api/*.php` files (PHP 8.0.30). No PHP was changed.
- **Static sweep**: no `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`document.write`/`eval` in `js/`, `index.html` or `admin.html` (only comments match), and no `http(s)://` URLs in the JS/HTML/CSS. Node is not installed, so JS syntax was checked by running the page in Chrome.
- **Browser harness (game).** A temporary same-origin page drove `index.html` in a 1366×768 iframe under headless Chrome, using `--virtual-time-budget` so timer waits run fast and deterministically. The page was deleted afterwards. **136/136 checks passed.** No JS errors, `console.error` calls or unhandled rejections were captured, and Chrome logged no console lines.
  - **Real API game:** 3 players (one named `<img src=x onerror=alert(1)>`), 5 categories and timer 20. The board shows 25 cells, End Game is visible, there is no Quit button and storage is v2 with empty `used`.
  - **Question:** the heading is `Geography – 100`, the question text matches, the answer is hidden. Show Answer reveals it and `answerShown` is saved.
  - **Timer:**
    - starts at 20, about 15 after 5 s, not red at 7.2 s left, red at 6.5 s left;
    - Pause holds its value for 3 s and Resume continues;
    - at 0: stops, shows "Time's up!", bar at `scaleX(0)`, Pause disabled, and exactly **1 beep** (a fake `AudioContext` counted `osc.start`), with no repeat after 1 more second;
    - the scoring buttons stay enabled at 0;
    - Reset goes back to 20 and runs.
  - **Scoring:**
    - Wrong A gives −100 and disables both of A's buttons; the others stay enabled.
    - Correct B gives +100, disables B and C's Correct; C's Wrong stays enabled. Wrong C then gives −100.
    - The disabled Correct C button is ignored.
    - The marks saved are `{1:wrong, 2:correct, 3:wrong}`.
  - **Refresh mid-question:** the same question reopens, the marks/scores are preserved, the answer is still shown, and the timer is back at 20.
  - **Back to Board:**
    - the cell is disabled, with computed background = B's color and no gradient, and B's name as literal text (no `img` element);
    - clicking it does nothing;
    - the scoreboard shows −100 / 100 / −100.
    - A second cell left unscored turns grey (computed `rgb(75, 81, 99)`), and the info line shows "Played 2 of 25".
  - **Refresh on the board:** used cells, colors, scores and "Timer 20 s" are restored. Manual + does not change cells.
  - **End Game:** Cancel keeps the board; Confirm shows Results. "`<img…>` wins!" is shown; the order is 100 / −100 / −100 with ranks 1, 2, 2 and one winner highlighted. A refresh shows Results again.
  - **New Game:** shows Setup and clears storage. Setup is empty (1 blank entry, Players, timer 30 from settings). A refresh then still shows Setup.
  - **Full board:**
    - A 5 × 5 board with 24/25 used shows no offer. Playing the last cell shows "All 25 questions have been played.", focuses the offer button, and the button goes to Results without a confirm.
    - A 2-way tie shows the tie text with both highlighted.
    - A 6 × 6 board (with 1000) fully used shows 36 cells and the offer; End Game asks no confirm.
  - **Ties:** a 3-way tie at 0 gives "It's a tie between A, B and C" (3 highlighted); an all-negative tie gives "A and C"; a single contestant gives "Solo wins!".
  - **O-3:** a 30-character name restores. Each of these 19 corrupt variants is discarded and Setup shown:
    - a 31-character name, an empty name, a whitespace name, duplicate names (`Ann`/` ann`);
    - a bogus used key, a non-canonical key `01:100`, an unknown owner, `used` as an array, missing `used`;
    - question screen without `current`, board screen with `current`, `current` on a used cell;
    - two Corrects, a bad mark value, a mark for an unknown contestant;
    - v1 on results, version 3, invalid JSON, `null`.
  - **v1 migration:** a Sprint 3-style save restores the board and is rewritten as v2.
  - **XSS in a restored question:** the category, question, answer and contestant name are all `<img src=x onerror=alert(1)>`. Heading, question and answer show as literal text, there are no `img` elements on the page, and the board header is literal.
  - **Layout:**
    - no horizontal scroll on Setup, Board, Question and Results at 1366×768, nor on Board and Question at 1920×1080;
    - at 1366×768, the question layout bottom is 479 px, and 643 px in the worst case (6 contestants, 10000 points, long question, answer shown);
    - board + scoreboard bottom is 736 px (5×5) and 744 px (6×6) with 6 players;
    - a 1-column board with a 10000 label fits.
- **Browser harness (admin, US-27 + O-5), 12/12 passed:**
  - **XSS:** a category `<img src=x onerror=alert(1)>` and a question with question `<img…>` / answer `<b>bold</b><img…>` were created via the API. They appear as literal text in the categories table, coverage grid, filter option and questions table, and no `img`/`b` elements are created.
  - **O-5:** at 1024 px, adding a 100-character unbroken name shows a success message that wraps (91 px tall) with no horizontal page scroll (`scrollWidth` = `clientWidth` = 1009).
  - **Cleanup:** both test categories were deleted (200). The DB is back to seed data (settings 5/30, points 100–500, 6 categories × 5 questions); auto-increment counters have advanced.
- **Screenshots** (headless Chrome, 1366×768 and 1920×1080) of the Question screen (6 contestants, marks given, answer shown), a 5 × 6 board with owned and grey cells and 6 scoreboard cards, a fully played 6 × 6 board with the offer, and Results were reviewed by eye. Three findings were fixed:
  - owned cells kept the gradient: `background-image: none` added;
  - the answer box was huge because `pre-wrap` on the `<p>` rendered the HTML indentation: `pre-wrap` now applies only to the value span;
  - rows with an owner name grew taller than the others: the owned-cell label is now smaller.
- **MariaDB:** it stayed up for the whole session (same process, no restart, no hang). The Sprint 3 incident did not recur.
- The `php -S` server I started was stopped. MariaDB was already running and is left running.

## Deviations / decisions
- **The answer's revealed state persists across a refresh.** The spec only requires scoring to be preserved (D-04). Hiding an answer the room has already seen would be odd.
- **End Game asks for a confirm only while cells are still open.** D-09 covers ending *early*; with the board done, both End Game buttons go straight to Results. New Game needs no confirm because Results were already shown.
- **Ranks are shared on equal scores** (1, 1, 3), and equal scores keep the setup order. This is not in the spec.
- **Storage version bumped to 2, with v1 migration.** Only the Sprint 3 board shape is migrated.
- **Saved duplicate names (ignoring case) count as corrupt.** Setup can never produce them (D-02).
- **Owned cells show the points label at 70% size** plus the owner's name, so all rows keep the same height.
- **Cell height scales with the number of rows** (`48vh / rows`, clamped from 3 to 6.5 rem), so board + scoreboard fit one 1366×768 screen for 5 and 6 rows.

## Known limitations / open for the tester
- **Beep after a refresh.** If the page is refreshed during a question and nobody clicks or presses a key before the countdown ends, the beep is silent; the visual "Time's up!" still appears. This is the browser autoplay policy (no audio before a user gesture). In normal play the cell click unlocks audio.
- **`/password.txt` under `php -S`.** The PHP built-in server ignores `.htaccess`. A `password.txt` exists in the project root (git-ignored and not tracked; I did not open or request it), so under `php -S localhost:8000` the URL `/password.txt` would be **served**. The local 403 check therefore has to be done through XAMPP Apache, where `.htaccess` applies. The hosted site is covered by `.htaccess` and by the "never upload" rule in the deploy guide. **Recommendation for the owner:** move `password.txt` out of the project folder. The README now says so and warns that `php -S` serves every file.
- **Hosted checks are still open for the tester:** `/password.txt` must return 403 or 404 on the live site.
- With the "all questions played" banner shown, a 6-row board at 1366×768 pushes the scoreboard slightly below the fold. The End Game offer itself is at the top.
- The timer is not saved, by design (D-04). Switching screens or refreshing restarts it.
- The README's Hostinger path for `expose_php` is hedged ("if listed, or ask support"), because hPanel's PHP options vary by plan.

# Sprint 5 — Developer note (Polish: FU-03, FU-04, FU-05)

Items: FU-03 (Should), FU-04 (Could), FU-05 (Could) from the follow-ups table in `docs/product-backlog.md` (see D-30 and OBS-1..OBS-3 in `docs/sprints/sprint-4-test-report.md`). No new stories.

## Files created / changed

| File | Status | Purpose |
|---|---|---|
| `css/style.css` | changed | One-screen board layout (FU-03), cell-height-aware label sizes, shared label size for owned and grey cells (FU-05), and a length-based question font scale (FU-04). `.game-main` bottom padding is now 1rem instead of 2rem. |
| `js/game.js` | changed | `showScreen()` sets `body[data-screen]` for the CSS. `showQuestion()` sets `--q-scale` on the question text from its length (new `questionScale()`, `QUESTION_FULL_SIZE_CHARS = 150`, `QUESTION_MIN_SCALE = 0.5`). |
| `docs/sprints/sprint-5-dev.md` | new | This note. |

**Not changed:** `index.html`, the API, the DB and `.htaccess`. The saved-game shape is unchanged: it is still `{version: 2, screen, game}` with the same `game` keys, so there is no version bump (D-28). `--q-scale` and `data-screen` are presentation only and are never saved. No PHP was touched, so `php -l` was not needed.

## How each item is met

### FU-03: 6x6 board + 6-contestant scoreboard fits 1366x768
- **Before:** each row's height was `clamp(3rem, 48vh / rows, 6.5rem)`. That is a guess at the free space, and owned cells (label + owner name) could push a row taller than the guess. The page ended up 22 px over (OBS-2).
- **Now the board takes the height that is left:**
  - While the board is shown (`body[data-screen="board"]`), `body`, `.game-main` and `#screen-board` form a flex column with `min-height: 100vh`.
  - The board is the flexible item (`flex: 1 0 0`). Header, bar, the "all played" offer and the scoreboard keep their natural height. The board gets the rest.
  - The board rows are `grid-template-rows: auto repeat(var(--rows), 1fr)`, so all rows are always the same height.
  - `1fr` never goes below a cell's `min-height` (`--row-min: 2.75rem`). Below that the page scrolls instead of overlapping anything.
- **Few rows or a large screen:** the board stops growing at `--row-max` (6.5rem per row, the same cap as before) through `max-height`. The scoreboard sits right under the board, so 1, 3 or 5 rows look the same as in Sprint 4.
- **Content can no longer make a row taller:**
  - Each cell is a size container (`container-type: size`), so the label and owner name are sized from the cell's real height (`cqh`).
  - Open label: `min(2.6rem, width rule, 90cqh)`.
  - Used label: `min(0.7 x label, 55cqh)`.
  - Owner name: `min(old clamp, 28cqh)`.
  - Label + gap + owner line always fit the cell. The width rule from Sprint 4 (digits x column width) is unchanged, so 10000 still never overflows.
- Every board block gets `width: 100%`. In a flex column, `margin: 0 auto` would otherwise shrink-wrap them. Their `max-width: 90rem` and centering still apply.
- `.game-main` bottom padding goes from 2rem to 1rem (on all screens), leaving 17 px more for the board.
- **Horizontal scroll:** none. Nothing new is wider than before, and the board width rule is unchanged.

### FU-04: long questions shrink to fit
- **Scale:** `questionScale(text)` returns 1 up to 150 characters. Above that it returns `sqrt(150 / length)`, never below 0.5. Text area grows with length x font size squared, so a 1/sqrt scale keeps the block roughly the same height.
- **CSS:** `font-size: max(1.15rem, clamp(1.6rem, 3vw, 3rem) * var(--q-scale, 1))`. The viewport-based size from Sprint 4 is kept and only multiplied, so short questions keep today's large size (41 px at 1366, 51 px at 1920).
- **Resulting sizes at 1366x768:** 200 chars 35.5 px, 250 chars 31.7 px, 400 chars 25.1 px.
- **Long answers:** still not scaled. They may scroll, which is acceptable per D-30.

### FU-05: grey cells use the owned-cell label size
- The size rule moved from `.is-owned .cell-points` to `.is-used .cell-points`, which covers owned and grey cells.
- **Measured:** owned 27.7 px = grey 27.7 px at 1366x768 (6x6), and owned 30.9 px = grey 30.9 px at 1920x1080. Open cells stay at the full 44.2 px.

## How to run / test
1. Load the DB and configure `api/config.php` (see the README).
2. From the project root, run `C:/xampp/php/php.exe -S localhost:8000`.
3. Open `http://localhost:8000/`.
4. **6 x 6 board:** in Admin, add a sixth point value, fill that slot in all six categories, and set categories per game to 6. Start a game with 6 players. Open DevTools device mode at 1366 x 768 and check `document.documentElement.scrollHeight === 768`.
5. **FU-04:** add or edit a question with about 250 characters and open it at 1366 x 768. The question column should end above the bottom of the screen, with the answer shown.

## Verification performed
- **Static checks:**
  - `js/game.js` still has no `innerHTML` or the like.
  - `--q-scale` is set from a number with `style.setProperty`, and `data-screen` from the fixed `SCREENS` names.
  - No external URLs.
  - Node is not installed, so JS was checked by running the page in Chrome.
- **Browser harness.** A temporary same-origin page (deleted afterwards) wrote synthetic v2 saved games to `localStorage`. It loaded `index.html` in exact-size iframes (1366x768 and 1920x1080) under headless Chrome 154 and measured the layout.
  - The dev DB was not changed.
  - The "Setup" case used the real API with nothing saved.
  - The previous `localStorage` value was restored afterwards.
- **Measured results** (`docH` = `documentElement.scrollHeight`; "over" = `docH` minus the viewport height):

| Case | 1366x768 | 1920x1080 |
|---|---|---|
| **6x6, 6 players, owned + grey + open cells (FU-03)** | docH **768** (0 over), rows 62.5 px, scoreboard bottom 751 | docH 1080, rows 110.5 (cap), scoreboard bottom 1039 |
| 6x6, 6 players, point labels up to 1000 | 768, 0 over | 1080, 0 over |
| 6x6, 6 players with 29-30 character names (names wrap in the cards) | 768, 0 over (rows 58.4) | 1080, 0 over |
| 6x6, long category names (3-line headers) | 768, 0 over (rows 56.4) | 1080, 0 over |
| 6x6, 6 players, all played (offer shown) | 775, **7 over** (rows at the 2.75rem minimum) | 1080, 0 over |
| 8x6, 6 players | 768, 0 over | 1080, 0 over |
| 5x5, 3 players / 6 players | 768 / 768 (rows 76.7) | 1080 / 1080 (rows 110.5) |
| 6x3, 2 players | 768 (rows 110.5, scoreboard right under the board) | 1080 |
| 1x1, 1 player, label 10000 | 768, label 44.2 px, no overflow | 1080 |
| Question, 40 / 81 / 120 / 150 chars, answer shown | 768 for all (column bottom 479 / 581 / 632 / 683) | 1080 for all |
| Question, 151 / 200 / 250 / 300 / 400 chars, answer shown | 768 for all (column bottom 682 / 642 / **654** / 666 / 658) | 1080 for all |
| Question, 250 chars of very long words | 768 (bottom 694) | 1080 |
| Question, 250 chars + 60-character answer | 768 (bottom 699) | 1080 |
| Question, 150 chars (full size) + 60-character answer | 768 (bottom 729) | 1080 |
| Results, 6 contestants | 771, 3 over (see Known limitations) | 1080 |
| Setup (real API) | 905 (form scroll, acceptable per D-30) | 1080 |

  - **No horizontal scroll** (`scrollWidth - clientWidth = 0`) in any case. That includes the extra narrow checks: 6x6 board and 250-character question at 1024x768, 800x600 and 600x800.
  - **No cell content overflow** (`scrollHeight`/`scrollWidth` vs `clientHeight`/`clientWidth`) in any board case.
  - **Live flow** at both sizes: from the restored board, click an open cell, mark Correct, click Back to Board.
    - The question shows (`data-screen="question"`, 41 px / 51 px font).
    - The board comes back at docH 768 / 1080.
    - The save is still version 2 with keys `mode, contestants, timerSeconds, points, categories, used, current`.
    - No JS errors.
- **Screenshots** (headless Chrome, real viewport) were reviewed by eye:
  - 6x6 with 1000 labels at 1366x768 and 1920x1080;
  - 6x6 fully played with the offer at 1366x768;
  - 6x3 with 2 players at 1366x768;
  - question with 40 and 250 characters at 1366x768, and 250 characters at 1920x1080.

  Owned and grey labels are the same size, rows are equal, and short questions keep the large font.

## Deviations / decisions
- **Layout scope.** The flex layout applies only while the board is shown (`body[data-screen="board"]`), so Setup, Question and Results keep their normal block layout.
- **Container query units.** The cells use `container-type: size` and `cqh` units. These are supported in current Chrome, Edge, Firefox and Safari.
- **Bottom padding** of the game page is 1rem on every screen (was 2rem).
- **FU-04 threshold.** The scale starts at 150 characters, not lower. Measurements showed that 150 characters at full size already fit at 1366x768 with a short answer (bottom 683 px), so shorter questions keep the full size.

## Known limitations / open for the tester
- **"All played" offer.** With the offer shown, a 6x6 board at 1366x768 is still 7 px over, because rows hit the 2.75rem minimum. That is far better than the 135 px from Sprint 4 (document 903 px), and acceptable per D-30. Lowering the minimum further would make the owner names too small.
- **Owner names at the row minimum.** When rows reach the minimum (all-played offer at 1366x768, or narrow windows), owner names are about 10 px and used labels 19 px. They are readable on a laptop but small.
- **Results with 6 contestants** was 3 px over at 1366x768. This is fixed by FU-08 (see below).
- **Long answers** are not scaled and may still make the question screen scroll (D-30).
- **Size measured in a 768 px-high viewport.** "1366x768" here means the browser viewport, as in the Sprint 4 tests. A windowed browser on a 1366x768 laptop has less height (tabs and address bar). The board then shrinks to the row minimum and scrolls a little below it.

## FU-08: Results with 6 contestants fits 1366x768

Added after the PO accepted FU-03..FU-05. The change is CSS only (`css/style.css`); there are no JS, HTML, API or saved-shape changes.

### What changed
- **The change:** `.result-score` gets `line-height: 1.15`.
- **Why rows were tall:** the 1.8rem score used the body line height of 1.45. Its line box (44 px) set the height of every result row, although the name and rank need less.
- **Effect:**
  - Each row goes from about 71 px to 61 px, so 6 rows save about 60 px.
  - Padding, gaps, fonts, the winner headline and the New Game button are unchanged, so the screen looks the same, only slightly tighter.
  - Rank sharing (D-27), the tie text and the highlights (D-10) are untouched.

### Measured
Same method as above: a temporary same-origin iframe page with synthetic v2 saves under headless Chrome 154, deleted afterwards. `docH` = `documentElement.scrollHeight`.

| Case | 1366x768 | 1920x1080 |
|---|---|---|
| **Results, 6 players, one winner** | docH **768** (was 771), 0 over, New Game bottom 690 | docH 1080, New Game bottom 694 |
| Results, 6 players, 2-way tie ("It's a tie between Alice and Bob", ranks 1 1 3 4 5 6, 2 highlighted) | 768 | 1080 |
| Results, 6-way tie at 0 (2-line headline, 6 highlighted, all rank 1) | 768 (New Game bottom 739) | 1080 |
| Results, 6 players with 30-character names, one winner | 768 | 1080 |
| Results, 1 / 2 / 3 / 4 / 5 players | 768 each | 1080 each |
| Results, 4 teams, 3-way tie | 768 | 1080 |
| Results, 6 players, 30-character names, **2-way tie** | 814, 46 over (3-line headline) | 1080 |
| Results, 6 players, 30-character names made only of W/M (widest glyphs) | 938, 170 over (names wrap inside the rows) | 1080 |
| **Re-check: board 6x6, 6 players, owned/grey/open cells** | **768**, rows 62.5, scoreboard bottom 751, no cell overflow | 1080, rows 110.5, scoreboard bottom 1039 |

- **No horizontal scroll** and no row content wider than its row in any case.
- **Screenshots reviewed:**
  - 6 players at 1366x768 and 1920x1080;
  - the 30-character 2-way tie at 1366x768.

  Rows, badges, swatches and scores are aligned and long names stay on one line.
- **FU-03/04 not affected.** The change only touches `.result-score`, which is used nowhere else. The board was re-measured as shown. The question screen has no shared rule with it.

### Known limitations (FU-08)
- **Long names in a tie.** A tie between contestants with near-30-character names makes the headline wrap to 3 lines at 1366x768, which pushes New Game 46 px below the fold. Fixing that would need the headline to scale with its length (like FU-04, a JS change) or a wider Results column. Neither is in FU-08's "trim the spacing" scope.
- **Very wide names** (30 characters of W/M) wrap inside the rows and scroll. They are still readable with no horizontal scroll.

# Sprint 3 — Developer note (Game setup and dynamic board)

Stories: US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-09.

## Files created / changed

| File | Status | Purpose |
|---|---|---|
| `index.html` | rewritten | Game page with four screen containers: Setup, Board (board and scoreboard), and Question and Results (empty shells for Sprint 4). Links to Admin. |
| `js/game.js` | new | Central `state`, screen switcher, `saveState()`/`loadState()` persistence layer, setup logic, Start Game, board and scoreboard. Vanilla JS with no dependencies. |
| `css/style.css` | changed | The old game placeholder rules are replaced by game styles: setup blocks, mode toggle, entry rows with swatches, category checklist, board grid, label scaling and scoreboard cards. Admin rules are untouched. |
| `docs/sprints/sprint-3-dev.md` | new | This note. |

**No PHP or SQL changes.** The game uses only the existing `GET` endpoints: `settings.php`, `categories.php?playable=1` and `questions.php?board=1&categories=…`. That means it works on the hosted site without the admin login (US-29 / D-20). `admin.html` and `admin.js` are unchanged.

## How it works

### State and screens
- `state = { screen, setup, game }`.
  - `setup` is the form being filled in. It lives in memory only.
  - `game` is the running game: `{ mode, contestants: [{id, name, color, score}], timerSeconds, points, categories: [{id, name, questions}] }`.
- `showScreen(name)` shows exactly one of `setup`, `board`, `question` and `results`, then calls `saveState()`.

### Persistence (enabler for US-17)
- `saveState()` writes `{version: 1, screen, game}` to `localStorage["brainrush.game"]`. It runs on Start, on every screen change and on every score change. It removes the key when there is no game. Storage errors (full or disabled) are ignored, so the game still works without them.
- `loadState()` validates everything before using it:
  - version and screen;
  - mode;
  - contestants: 1 to the mode limit, unique ids and colors, colors from the palette, integer scores;
  - timer within the input's min/max;
  - points: positive and strictly ascending;
  - every category has a question/answer for every point value.

  Invalid JSON, a wrong shape or a wrong version is deleted, and Setup is shown with no JS error.
- In Sprint 3 a valid saved game always restores to the Board screen. Sprint 4 extends restore to Question and Results (US-17, D-04).

### Setup
- **US-01 Mode.** A Players/Teams toggle (radio buttons) with Players as the default. The limits come from one `MODES` table (6 / 4) and are also shown in the labels. "Add" is disabled at the limit.
  - **D-07:** switching to Teams with 5 or 6 entries keeps the entries. It shows "Teams mode allows at most 4 teams. Remove N to continue." and disables Start until enough entries are removed.
- **US-02 Names.** Add and Remove buttons; Remove is disabled when only one entry is left. Names are limited to 30 characters (`maxlength`).
  - On Start, every entry is checked. An empty or whitespace-only name shows "Name is required" inline. Names that match after trimming, ignoring case, show "Names must be unique" inline on every entry involved (D-02).
  - Typing in an entry clears its error.
- **US-03 Colors.** A 6-color palette: red, blue, green, orange, purple and cyan. Grey (unanswered cells, Sprint 4) and gold (the UI accent) are left out on purpose.
  - A new entry gets the first color no other entry uses.
  - Clicking a swatch moves to the next palette color that is not used by another entry. With all 6 colors taken, it stays the same. Colors are always distinct.
  - A removed entry's color is free again for the next new entry.
- **US-04 Categories.**
  - The legend reads "Select N categories", with N taken from `categories_per_game`.
  - The checklist shows only `categories.php?playable=1`.
  - A live counter shows "k of N selected". Each ticked category shows a badge with its position, because the board columns follow the order categories were ticked.
  - Clicking Start with a count other than N shows "Select exactly N categories (k selected)."
  - **D-11:** if fewer than N categories are playable, the page shows "Not enough playable categories — add questions in Admin", plus a link to `admin.html` and the counts, and Start is disabled. If the settings themselves are missing, the page shows an error with an Admin link and Start is disabled.
- **US-05 Timer.** The field is pre-filled from `timer_seconds`. On Start it must be a whole number within the input's `min`/`max` attributes (5–600, written once in the HTML); otherwise an inline error is shown. The value is stored only in `game.timerSeconds`, and the admin setting is never written. The board info line shows "Timer N s".
- **US-06 Start Game.**
  - All errors are shown together, and focus moves to the first problem.
  - When everything is valid, the page calls `questions.php?board=1&categories=<ids in tick order>`. The button reads "Starting..." and is disabled while the request runs.
  - The response is checked: ids match the request in order, and every point value has a question.
  - Any failure (network error, API 400/500 or an unexpected payload) shows "Could not start the game: <reason>" on Setup. No input is touched.
  - On success, every contestant starts at score 0. The board data is stored in the game state (D-12), so later admin edits do not affect the running game.

### Board (US-07)
- The board is a CSS grid with `grid-template-columns: repeat(var(--cols), minmax(0, 1fr))`. JS sets `--cols` to N. The `minmax(0, …)` form of `1fr` keeps long names from widening a column.
- The header row holds the category names in selection order. It is followed by one row per point value in ascending order. Rows, columns and labels all come from the board payload; nothing is hard-coded (D-01).
- **Label scaling:** JS also sets `--digits`, the longest label length. The label font size is `min(2.6rem, cell width / (digits × 0.62 + 1))`, where cell width is derived from `--cols` and the viewport. Labels also have `white-space: nowrap`. A 10000 label therefore fits on one line at any column count. Header names scale with the column width and wrap or hyphenate inside their cell.
- Cells are buttons with an `aria-label` such as "Science, 300 points". Opening a question is US-11 (Sprint 4); for now a click shows the notice "Opening questions is coming in the next sprint."

### Scoreboard (US-09)
- Each contestant is shown as a card in their own color, with a readable ink color. The card shows the name, the score, and "−" / "+" buttons.
- Negative scores use a minus sign (U+2212, the same character as the "Wrong (−300)" labels).
- The step is the smallest point value of this game's board (D-05). Buttons have labels like "Subtract 100 points from Ann".
- A change updates only the score and saves the state. Cells are never touched.

### Safety
- Every name, category, message and link is built with `createElement` / `textContent` through a small `h()` helper (the same helper as `admin.js`). The game code has no `innerHTML`, `insertAdjacentHTML` or `document.write`.
- `confirm()` text is plain.
- API errors show the API's `error` text, or "Request failed (HTTP n)". A raw response body is never shown.

## How to run / test
1. Load the DB and configure `api/config.php` (README / Sprint 1).
2. From the project root, run `C:/xampp/php/php.exe -S localhost:8000`.
3. Open `http://localhost:8000/`.
4. For a 6 × 6 board: in Admin, add point value 1000, fill the 1000 slot of all 6 categories and set categories per game to 6.

## Verification performed
- **`php -l`** passes on all `api/*.php`. No PHP was changed.
- **Static checks:** the only matches for `innerHTML`, `insertAdjacentHTML`, `document.write` and `outerHTML` in `js/` are comments. There are no external URLs or CDNs. The game calls `fetch` only for `GET`.
- **curl:** `settings.php`, `categories.php?playable=1`, `points.php` and `questions.php?board=1&categories=2,1` return the expected shapes.
- **Browser:** a temporary same-origin harness page (deleted afterwards) drove `index.html` in an iframe under headless Chrome. **All 109 checks passed** with no JS errors, console errors or unhandled rejections:
  - **Defaults:** Setup is shown, Players is selected, there is one empty input with Remove disabled, the timer is 30, the legend reads "Select 5 categories", 6 categories are listed and Start is enabled.
  - **Player limit and colors:** a 7th player is blocked, with Add disabled at 6. The 6 auto-assigned colors are distinct, and clicking a swatch with all colors taken changes nothing.
  - **Teams with 6 entries (D-07):** the entries are kept, the "Teams mode allows at most 4 teams…" message is shown, and Start and Add are disabled. Removing entries updates the message: at 5 it asks to remove 1, and at 4 it disappears and Start is enabled. Add is disabled at 4.
  - **Color reuse:** a removed entry's color is reused, swatch cycling stays distinct and keeps focus, and switching back to Players works.
  - **Name rules:** a whitespace-only name gives "Name is required", typing clears it, and "Ann" vs " ann " gives "Names must be unique" on both.
  - **Category count:** 0 or 6 selected (with N = 5) gives the exactly-N error, and the selection-order badges are correct.
  - **Timer:** 4, 601, 12.5, empty, -5 and 1e2 are each rejected inline.
  - **Start failures:** a network error, an API 400 (its text shown) and a non-JSON 500 (shows "HTTP 500", never the body) each keep Setup open with names, categories and timer intact.
  - **Start success:** the board appears, the header follows tick order, the board is 5 × 5 with 5 grid columns and rows 100–500, and the scoreboard shows both contestants at 0 in their setup colors.
  - **XSS:** the names `<img src=x onerror=alert(1)>` and `<b>x</b>` show as literal text, and no `img` or `b` element is created.
  - **Timer setting:** the board shows "Timer 20 s", and the admin `timer_seconds` is still 30.
  - **Manual adjust:** − twice gives "−200" and + gives "100". The step is 100, the cells are unchanged and the scores are saved.
  - **Refresh:** the board, the header order and the scores (including the negative one) are restored.
  - **Quit to setup:** Cancel keeps the game. Confirm clears storage and shows an empty Setup with current settings.
  - **Corrupt storage:** 8 variants (bad JSON, `__proto__` mode, `[]`, `null`, a string score, descending points, a wrong version, screen "setup") are each discarded and Setup is shown.
  - **Label fit:** injected saved boards with points up to 10000 were loaded at 1024 px with 10 and 6 columns, at 1920 px with 5, at 1366 px with 10, and at 375 px with 6 and 10. Every label fits on one line inside its cell, and the page never scrolls horizontally, also with a very long unbroken category name.
  - **6 × 6 with real API data:** point 1000 was added, 6 questions were filled and N was set to 6. The legend reads "Select 6 categories" and the board is 6 × 6 with a 1000 row.
  - **Not enough playable (N = 7):** the message and the `admin.html` link are shown, and Start is disabled.
  - **Category missing a value:** after deleting one 1000 question, that category disappears from the checklist.
- **Screenshots** (headless Chrome) of Setup at 1280 px, a 5 × 5 board with 4 contestants including a negative score, and a 10 × 8 board at 1024 px were reviewed by eye. One finding was fixed: headers broke mid-word at 10 columns (the scale was tuned and `hyphens: auto` added).
- **Environment incident (local MariaDB, not caused by the app):**
  - During the first harness's cleanup the local `mysqld` died. It left `C:\xampp\mysql\data\mysqld.dmp` at 12:00 and no shutdown entry in the log. I restarted it the way XAMPP does (`mysqld --defaults-file=mysql\bin\my.ini --standalone`, detached) and deleted the test rows through the API.
  - On a second full run, InnoDB hung. A page latch held by the page flusher (`buf0flu.cc`) was never released, so a plain `INSERT … ON DUPLICATE KEY UPDATE` on `settings` waited more than 10 minutes. `mysql_error.log` shows "A long semaphore wait" and repeated monitor dumps. The 600 s fatal threshold did not abort the server, so I force-stopped that instance (the one I had started) and restarted it. Crash recovery rolled back the stuck upsert.
  - A final UI-only harness run (no DB writes, 98/98) confirmed the CSS tweak.
  - **Final state:** seed data (settings 5/30, points 100–500, 6 categories × 5 questions). No test rows remain, and auto-increment counters have advanced. MariaDB is left running as a detached process.
  - **Recommendation:** if InnoDB hangs again, restart MariaDB from the XAMPP control panel. If it keeps happening, check antivirus or file-locking on `C:\xampp\mysql\data`.

## Deviations / decisions
- **"Quit to setup" button on the board** (with a confirm). Without it, a saved game would keep the host on the board after every refresh until Sprint 4 brings End Game and New Game. It behaves like D-15: everything is cleared and settings are reloaded. Sprint 4 may keep it or replace it with End Game.
- **The setup form is not persisted.** Only a started game is saved, so a refresh during setup shows the defaults again: Players mode, one empty name and the timer from settings, as US-01 and US-05 describe.
- **Over-limit and not-enough-playable disable Start outright** and show a message. Other problems (names, category count, timer) are reported when Start is clicked, as the stories describe.
- **Name max length is 30 characters**, which the spec does not define. This keeps scoreboard cards and future cell owner labels readable.
- **Corrections step from the game's own points** (D-12): it is the smallest point value of the board loaded at Start, not a live reload.
- **A cell click on the board shows a notice** until the question screen exists (Sprint 4).

## Known limitations
- The Question and Results screens are empty shells. Clicking a cell does not open a question yet, and there is no End Game yet (US-08, US-10–US-17 are Sprint 4).
- The board is tuned for desktop/projector widths. It also works without horizontal scroll at 375 px, but tall boards scroll vertically.
- If admin data changes between loading Setup and clicking Start (for example, a category loses a question), the API's 400 message is shown and the checklist is not refreshed automatically. Reloading the page refreshes it.
- The page needs a modern browser (ES2017, `fetch`, CSS `min()` / custom properties).

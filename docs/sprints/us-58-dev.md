# US-58 Daily Crossword: dev note

Branch `crossword`, 2026-11-20. Story US-58 (Epic E19), decisions D-72 (owner a-d, PO e-r), follow-ups FU-87 and FU-88.

## What was built

**Database.** A new table, `daily_crossword(puzzle_date DATE PK, layout TEXT, created_at)`, holds one row per UTC day. `layout` is JSON: `width`, `height` and `words [{question_id, word, row, col, dir, length}]`. The new table is in `sql/migrate-add-daily-crossword.sql` and in both schema files, in the same place (after `daily_challenge`). The migration was run on the local DB. `crossword_enabled` needs no migration because a missing row counts as off.

**Server (`api/crossword.php`, GET only, 405 otherwise).**
- Constants at the top: `CROSSWORD_MAX_WORDS` (10), `CROSSWORD_MIN_WORDS` (6), `CROSSWORD_MAX_SIZE` (13), `CROSSWORD_LAUNCH_DATE` ('2026-11-20') and `CROSSWORD_TRIES` (24 grids built per day).
- Word source: `daily_bank()` from `api/daily.php` (which also loads `questions.php`). That gives every question at an enabled point value, with `CELL_COLUMNS`. Only text questions (`question_kind()`) with a non-empty answer are used.
- Cleaning (`crossword_word()`), in this order:
  1. `choice_text($answer, false)`, which cuts at the first " (".
  2. Drop a leading "The " (any case).
  3. Remove spaces, hyphens (including the Unicode dashes) and apostrophes (', ’, ‘, ʼ, `).
  4. Fold accents. A built-in map is used because the local PHP has no intl. `Normalizer` is used too when it exists.
  5. Uppercase, then keep the word only if it matches `^[A-Z]{3,10}$`.
  A word found in its own English or Arabic clue (case- and accent-insensitive substring) is skipped.
- Builder: the date seeds an md5 counter RNG and a Fisher-Yates shuffle, so there is no global `mt_srand`.
  - Greedy placement. The first word of 5 or more letters goes across. Each next word goes where it crosses the most words, with the smallest bounding box as the tie-break.
  - Passes repeat while words still fit, up to 10 words. One question per word (duplicates are skipped).
  - A placement is rejected if:
    - a crossing letter differs, or the cell already holds a word in the same direction;
    - an empty cell of the new word has a neighbour across its direction (no side-by-side words);
    - the cell before the first letter or after the last letter is filled (no end-to-end words);
    - the grid would grow past 13 × 13;
    - the word adds no new cell.
  - 24 tries, each with its own seed. The winner has the most words, then the smallest area, then is the earliest try. A day with no grid of 6 or more words gets a 503 with the generic message, and nothing is stored.
- Storage follows the Daily pattern: read the row; if there is none, build, `INSERT IGNORE`, then read it back. A missing table (1146) gives a 503, as in Daily. A corrupt stored layout also gives a 503, and is written to the error log.
- Response: `{date, number, seconds_to_next, width, height, words: [{n, row, col, dir, length, answer, question, question_ar, category_name, category_name_ar}]}`.
  - Across words come first, by number.
  - Clue numbers are worked out at read time, left to right and top to bottom; a shared start cell gets one number.
  - The clue text is joined from `questions` at read time. For a question deleted later, `question`, `question_ar`, `category_name` and `category_name_ar` come back as `null`, and the word stays. The game then shows "Clue removed: use Reveal letter." (D-72 f).
  - `number` = days since `CROSSWORD_LAUNCH_DATE` + 1, at least 1.
- Checking without touching the table: define `CROSSWORD_INCLUDE_ONLY` and include the file. You can then call `build_crossword_layout(crossword_candidates(db()), 'YYYY-MM-DD')` for any date; it uses no database writes.

**Settings, log and Admin.**
- `api/settings.php` has `crossword_enabled` (0/1, anything else is a 400). A missing row reads as 0.
- `api/game-log.php` accepts mode `crossword`. It reads no `players` and logs `crossword: - | categories: all` (no name, D-72 o). Unknown modes still get a 400.
- Admin > Game settings has a "Daily Crossword" checkbox (`admin.html`, `js/admin.*.js`), loaded and saved like Golden Goal.

**Game page (`index.html`, `js/game.*.js`, `css/style.*.css`, `js/i18n.*.js`).**
- `#crossword-open-btn` sits next to the Daily Challenge button. It follows the same rules (hidden in maintenance mode and in the Streak setup, disabled while loading) and also needs `crossword_enabled === 1`.
- `#screen-crossword` was added to `ALL_SCREENS`. The site footer is hidden on it, as on the board, to save height.
- Layout:
  - Head: the title "Daily Crossword #N", a timer (m:ss, or h:mm:ss after an hour), the hints count and Back.
  - Under the head, the active-clue bar across the full width. It shows "3 Across · Category", the clue with "(5)" and the EN/AR toggle.
  - Below that, the grid (always `dir="ltr"`) with Check word, Reveal letter and a status line under it, and the Across/Down clue lists next to it. The clue lists scroll inside their panel on desktop and come after the grid on phones (≤ 760 px, one column).
- Typing goes through one hidden `<input>` placed on the current cell (16 px font, so iOS doesn't zoom). It always holds one space, so a phone's Backspace fires an input event.
  - Desktop keys are handled in `keydown`, which runs first in `onKeyDown` while the crossword is being played: letters, Backspace/Delete and the arrows. Fields other than the hidden input are left alone.
  - Phone keyboards send `input` events. Only A–Z count; digits, symbols and Arabic letters are ignored.
- Behaviour is as in the AC:
  - Typing skips revealed (locked) cells.
  - Backspace clears the current cell, or goes back one cell and clears it.
  - Arrows skip dark cells, and the direction follows the arrow's axis.
  - Clicking a cell keeps the direction when it can. A second click on the same cell switches the direction.
  - Clicking a clue selects its first empty cell.
  - Check word marks wrong letters (red and struck through). The mark is cleared when the letter changes. Check is free.
  - Reveal letter follows the AC rules. Each reveal costs 1 hint, and a word that is all right reveals nothing.
  - A full but wrong grid says "Not quite: some letters are wrong."
  - When every letter is right the puzzle finishes by itself. The grid becomes read-only, and the result shows "Solved in m:ss", the hints, Share and "Next crossword in HH:MM:SS". At 0 the countdown is replaced by "Play the new crossword".
- The timer runs on wall-clock time from `startedAt`, which is set by the first letter typed or revealed. The game-log line is sent at that moment, once per day (`logged`).
- Device save `brainrush.crossword` holds `{version, date, number, nextAt, width, height, words, cells, revealed, wrong, hints, startedAt, solvedMs, done, logged, onScreen, cur}`.
  - The save is checked in full on load: the grid must be consistent, the letters must be A–Z, revealed cells must be right, `hints === revealed.length`, the cursor must be on a word, and a save marked done must be solved. A save that fails any check is dropped.
  - A save from an earlier date is replaced when today's puzzle loads.
  - On reload, an open crossword screen comes back on the same day. After `nextAt` the page goes to setup instead.
  - Back keeps the progress, with no confirm. Android Back does the same.
- Clue language follows D-72 g: per-clue toggle in memory only (`cwLang`). By default a clue is in Arabic in the Arabic interface when the question has Arabic text.
- A language switch redraws the screen through a `refreshScreen` branch and keeps the progress and the timer.
- All text is set with `textContent` and `createElement` (`h()`). There is no `innerHTML`.
- Integration Quiz page: the missing crossword elements become hidden stand-ins (the existing `addStandIns`), and there is no crossword restore there.

**Docs.**
- `how-to-play.html`: a new "Daily Crossword" section and a TOC entry.
- `llms.txt`: one bullet, and the guide line.
- `README.md`: item 12, and a rule about the public read.
- `privacy.html`: the log line for the crossword (time only), and a device-storage paragraph for `brainrush.crossword`.
- `docs/deploy-hostinger.md`: a migration bullet that says to import BEFORE the code, the table list (nine tables), and `crossword.php` in the upload list.
- `docs/spec.md` and the backlog were already updated by the PO. I did not change them.

## Files

New:
- `api/crossword.php`
- `sql/migrate-add-daily-crossword.sql`
- `docs/sprints/us-58-dev.md`

Changed:
- `sql/schema.sql`, `sql/schema-hosted.sql`
- `api/settings.php`, `api/game-log.php`
- `index.html`, `admin.html`, `how-to-play.html`, `privacy.html`
- `js/game.4ca1f55c.js`, `js/i18n.acc7336b.js`, `js/admin.fcf45ed5.js`, `css/style.261a29b4.css`. These were edited in place; the pre-commit hook renames them.
- `llms.txt`, `README.md`, `docs/deploy-hostinger.md`

Remember `git add api/crossword.php sql/migrate-add-daily-crossword.sql docs/sprints/us-58-*.md` before the commit.

## How to run and test

1. Run the migration: `mysql -u root brainrush < sql/migrate-add-daily-crossword.sql`. It is already done on this machine's DB.
2. Admin > Game settings > tick **Daily Crossword** > Save. It is already on locally (`crossword_enabled = 1`).
3. Open the game. **Daily Crossword** shows next to Daily Challenge.
4. To check dates without storing anything, run this from the repo root:
   `php -r "const CROSSWORD_INCLUDE_ONLY = 1; require 'api/crossword.php'; print_r(build_crossword_layout(crossword_candidates(db()), '2026-12-01'));"`

### Verification done (real output)

- `php -l` reports "No syntax errors detected" for `api/crossword.php`, `api/settings.php`, `api/game-log.php` and `api/daily.php`. `node --check` passes for `js/game.4ca1f55c.js`, `js/i18n.acc7336b.js` and `js/admin.fcf45ed5.js`.
- Cleaning examples:
  - "The Beatles" → BEATLES, "Spider-Man" → SPIDERMAN, "Pelé" → PELE, "Paris (France)" → PARIS, "O'Neal" → ONEAL, "Ñandú" → NANDU, "Brontë" → BRONTE.
  - "Ox", "Constantinople", "1969" and "Apollo 11" → dropped.
- Local bank: **533 candidate words (520 unique)** out of 1014 questions.
- 30 dates (2026-11-20 to 2026-12-19): **every date gives 10 words**. Sizes range from 8x13 to 13x10. An independent checker passed every grid: crossings match, every run of letters is exactly one word (so there is no side-by-side or end-to-end touching), size ≤ 13, 6–10 words, no duplicate word. 30 dates took 0.62 s in total.
- Small banks (random subsets, 20 dates each): 10, 20, 40 and 80 candidates all reached 6 or more words on 20/20 dates. Five words, or seven words with no shared letters, give `null` (that is the 503 path).
- HTTP on `php -S localhost:8010`:
  - Two GETs return an identical layout.
  - Two parallel first requests on an empty table: 1 row, identical payloads.
  - The payload rule check passes (10 words, 10x11, numbering in reading order, connected, no stray runs).
  - POST, PUT and DELETE → 405 with `Allow: GET`. With the table renamed → 503 "The Daily Crossword is not available right now. Please try again later."
  - `settings.php` PUT `crossword_enabled` 2 or "x" → 400; 1 → saved. A missing row read back as 0.
  - `game-log.php` `{mode:"crossword"}` → 201 with the line `crossword: - | categories: all`. `mode:"bogus"` → 400.
- Browser (Playwright with headless Chrome, port 8010). No page errors on the game, the Integration Quiz or Admin.
  - At 1366x657 (a 1366x768 screen with the browser's own bars) and at 1366x768: no page scroll (`scrollHeight` = viewport height). With a 10x11 grid the cells are 30 px.
  - At 375 px: no sideways scroll (`scrollWidth` 375). The cells are 32.6 px, and the clue bar sits above the grid with the lists below it.
  - In Arabic, `html dir=rtl` and the grid stays `dir=ltr`. The clues show in Arabic with the "show in English" toggle.
  - Typing, Check (1 wrong letter marked, then cleared once fixed), Reveal ("1 hint", 1 revealed cell), the arrows, a reload mid-puzzle (it resumes with the letters and hints), and a full but wrong grid ("Not quite") all work.
  - Solved by real typing after a 3.2 s pause: "Solved in 0:03" (solvedMs 3874).
  - Share copied "Mokh Rush Crossword #1: solved in 0:00 with 1 hint" plus the site link. That test run was scripted and fast, which is why it shows 0:00. In Arabic it copied "كلمات مخ رش المتقاطعة #1: حُلّت في 0:00 مع تلميح واحد".
  - A reload after solving and the button after solving both show the result, not the grid. The countdown at 0 shows "Play the new crossword".
  - Phone input events: an `insertText` "a" types A, and `deleteContentBackward` clears it.
  - Setting off → button hidden; setting on → visible; Streak setup → hidden (and so is Daily).
- Contrast: Python is **not installed** on this machine, so the plugin's `lint_hardcodes.py` and `validate_contrast.py` could not run. `validate_contrast.py` also checks only the kit's own token file. Instead I measured every new colour pair with the WCAG formula, and **all 20 pass**. Examples: the wrong letter #a30000 on the gold current cell is 5.04:1; the revealed letter #1e3a8a on gold is 6.35:1; muted text on panel-2 is 6.45:1; the current-cell ring on gold is 11.54:1.
- Clean-up after testing: my game-log test lines and the test `daily_crossword` row were removed. The row is rebuilt the same on the next request because the build is deterministic. `crossword_enabled` was left at 1 as asked. The 8010 server was stopped.

## Known limitations and open points

- **`CROSSWORD_LAUNCH_DATE` is '2026-11-20'** (today). Move it in the PR to the real live date, so live starts at #1 (D-72 n).
- **The active-clue bar shows on every screen size**, not only on phones. At 1366x768 it is what keeps the active clue and its EN/AR toggle in view while the clue lists scroll. The AC says "also shows" on phones, so this is a superset. The PO may want to confirm.
- **Strings beyond the AC:**
  - The head shows the hints count during play ("No hints" / "1 hint").
  - Check word gives feedback: "No wrong letters in this word so far." or "2 wrong letters, marked in red.".
  These are extra items for **FU-87**, the native Arabic review.
- **Arabic plurals.** The Arabic share line uses the full set of Arabic plural forms (مع تلميح واحد / مع تلميحين / مع 3 تلميحات ...). D-72 p's draft used "مع 2 تلميح". This is for FU-87.
- **Self-clue rule.** The rule is a plain substring, as the AC says, so a short word inside a longer clue word also drops the question (for example ART in "party"). This removes a few candidates. It is harmless with the current bank.
- **Clue toggle labels.** The EN/AR toggle reuses the existing `lang.showArabic` / `lang.showEnglish` strings ("Show question in Arabic"), so it needs no new translation.
- **Accessibility.** The grid cells are plain divs. Screen-reader users type through the hidden input, whose label reads "3 Across: clue text". A fuller grid role model is not in scope.
- **Highlight contrast.** The active-word highlight (#ffe9a3 on white) is a mild cue. The current cell has a dark ring (11.5:1) and the active clue is in the bar and the list, so the highlight is not the only cue.
- **Settings.** Turning the setting off only hides the button (D-72 m). A device with an open crossword screen still restores it on reload the same day.
- **UX gates.** The plugin's browser gates (`verify_states` and the others, through `gate.mjs`) were not run, because `gate.mjs` is a no-op on this Windows box (see memory) and Python is missing. The Playwright checks above measured the layout directly instead.

## Fix loop 1

Fixes for the three Minor bugs in `docs/sprints/us-58-test-report.md`.

- **BUG-58-01 (setup row): fixed.** Streak, Daily Challenge and Daily Crossword now sit in their own flex group, `.mode-extras`, inside `.mode-row` (`index.html` and `css/style.*.css`).
  - Why the old layout wrapped: at 1366 px the row is 875 px wide, but the toggle and the three buttons need about 927 px (933 px in Arabic). The last button therefore wrapped on its own.
  - Now the group moves as one unit. With 1 player (Streak shown) the three buttons sit together on one line under the toggle. When they fit (no Streak button), they sit beside it.
  - Measured at 1366x768 with 1 player: all three buttons at y 293, in English (x 245 / 514 / 703) and in Arabic. At 375 px they stack as before, and `scrollWidth` is 375 in both languages.
  - Shrinking the buttons instead would have left only about 6 px to spare, so I didn't.
- **BUG-58-02 (client word rule): fixed.** `CW_WORD_PATTERN` in `js/game.*.js` is now `/^[A-Z]{3,10}$/`, the same as `CROSSWORD_WORD_PATTERN` in `api/crossword.php`. Each constant has a comment pointing at the other. JS can't read a PHP constant, so the two stay paired copies.
- **BUG-58-03 (deploy guide): fixed.** `docs/deploy-hostinger.md` step 5 now says "eleven tables" and lists all eleven from `sql/schema-hosted.sql`, including `integration_questions` and `integration_scores`.

Re-checked:
- `php -l api/crossword.php` reports no syntax errors, and `node --check js/game.4ca1f55c.js` passes.
- Crossword screen: still no page scroll (`scrollHeight` = viewport height at 1366x657 and 1366x768; tools bottom at 605 / 716). The timer counts (0:02 after 2.6 s).
- State: the test server ran on port 8010 and was stopped. The re-measure run added two `crossword` log lines and rebuilt today's `daily_crossword` row; both were removed afterwards. `crossword_enabled` is still 1.

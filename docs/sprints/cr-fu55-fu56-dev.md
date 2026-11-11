# CR FU-55 / FU-56: developer note

Branch `cr-fu55-fu56`. Items: FU-55 (Admin categories at 375 px) and FU-56 (Arabic category names in server errors and Admin lists), see the Follow-ups table in `docs/product-backlog.md`, D-59 and D-61. No API, database or saved-game change. No PHP file changed, so there is nothing to `php -l`. No new file.

## Files changed

- `css/style.f36528ff.css`: a `@media (max-width: 600px)` block for the Categories panel (FU-55) and the small `.cat-ar` rule for the Arabic names in the lists (FU-56).
- `js/admin.3f451fba.js`: `arabicNameOf()` / `arabicNameSpan()`; the Category cell of the Questions table and the category line of the Reports table show the Arabic name; `refreshData()` re-renders the Reports list once the category list is in.
- `js/game.4bcddacf.js`: `localCategoryNames()`, used only by the "Could not start the game" message.

## FU-55: Admin categories on a phone

Measured with Chrome (Playwright, `channel: chrome`) at 375x812, touch, against `php -S localhost:8000` with the local DB (14 categories), with the Rename row open on the first category.

| What | Before | After |
|---|---|---|
| Add form | 3 controls on one row: English and Arabic fields 100 px wide each, placeholders cut off ("New categ", "(optional)") | Stacked: English field, Arabic field, Add button, each 281 px wide and 42 px tall |
| Categories table | Scrolls sideways inside the panel: 680 px of content in a 281 px box | No sideways scroll (281 / 281): each row is a card (name and Arabic name; count and status; buttons) |
| Rename / Delete buttons | At x = 577 to 717, off screen until the table is scrolled; 30 px tall | On screen, 133 px wide, 40 px tall |
| Rename row | Arabic field partly clipped; Save / Cancel off screen (x = 577 to 697), 30 px tall | English and Arabic fields full width (261 px, 42 px tall); Save and Cancel side by side, 126 px wide, 40 px tall |
| Page width | 375 (no page-level overflow) | 375 |

Desktop and tablet are unchanged: every new rule is inside `max-width: 600px`. At 1366, 1024 and 601 px the add form is still one row, the category rows are still 46 px, and every table has the same width and scroll as without the change.

Not changed (outside FU-55, recorded for the owner): on a phone the Points list buttons and the buttons in the Questions, Reports and Streak tables are still 30 px tall, and those tables still scroll sideways inside their panel (Questions 886 px, Reports 422 px, Streaks 528 px, Logs 420 px in a 281 px box), as they did before. Admin is not a D-30 view; raise a follow-up if phone admin use needs them.

## FU-56: category names in Arabic

### Server errors seen by players

Only two server messages name a category, both from `POST api/questions.php?board=1` at Start Game: `Category "X" is missing questions for: ...` (line 383) and `"Kilo Meshakkal" is missing questions for: ...` (line 454). They reach a player through the Setup message "تعذّر بدء اللعبة: <server text>" (for example when the admin removes questions while Setup is open). Other category messages are admin-only (`categories.php`) or answer malformed requests (`game-log.php`, the id checks), which the game never sends.

Change (D-59 a kept: the API text stays English): when the interface is Arabic, the client replaces a quoted English name it knows (a Setup category, or Kilo Meshakkal) by its Arabic name from `name_ar` / `cat.mixName`, wrapped in bidi isolates so the English sentence keeps its word order. Names without an Arabic name, and any other server text, are shown as sent. The message is built at render time, so switching EN / AR while it is shown updates it. English is untouched.

Result (real server error, produced by adding a temporary enabled point value 999999 after Setup loaded, then removed):

- AR, Flags: `تعذّر بدء اللعبة: Category "أعلام" is missing questions for: 999999` (renders in the right order; screenshot checked)
- AR, Kilo Meshakkal only: `تعذّر بدء اللعبة: "كيلو مشكّل" is missing questions for: 100, 200, 300, 400, 500, 999999`
- EN: `Could not start the game: Category "Flags" is missing questions for: 999999` (as before)

### Admin lists

- Questions table: the Category cell shows the English name with the Arabic name under it (right to left) when the category has one. At 1366 px a one-line row becomes 20 px taller (46 to 66 px); the table width is unchanged at 1366, 1024 and 601 px (BUG-11-01 still holds).
- Reports table: `Flags (أعلام) – 300`; no brackets when there is no Arabic name. The reports load on their own, so they are drawn again once the category list arrives (checked with the category list delayed by 800 ms).
- The Arabic name comes from the category list Admin already loads (`categories.php`), by `category_id`; no API change.

### Open question for the owner (not implemented)

- **Game logs** are plain text files written by `api/game-log.php` at game start (`... | categories: Flags, Kilo Meshakkal`) and shown as they are in Admin. Showing Arabic names there means either changing the log line format (only new lines would have them, and the files are also read outside Admin) or parsing the text in Admin to match names (fragile: names can contain commas and may have been renamed since). Both are a design call, so the logs keep English names for now.
- Smaller things left English on purpose (Admin is English, D-59 d): the category drop-downs (filter and question form), success and confirm messages, and the Categories table header.

## How to test

1. Start XAMPP MariaDB and `php -S localhost:8000` in the project folder; open `http://localhost:8000/admin.html` (local requests need no login when no admin credentials are configured).
2. FU-55: DevTools device mode 375x812. Categories: the add form is stacked; each category is a card with Rename / Delete visible; Rename shows both fields full width with Save / Cancel below; no sideways scroll in the panel. Back at 1366 px everything looks as before.
3. FU-56 Admin: the Questions table shows e.g. "Cartoons & Childhood" with "كرتون زمان" under it; a reported question shows "Flags (أعلام) – 300" in Reports; a category without an Arabic name shows only English.
4. FU-56 game: open `index.html`, switch to عربي, pick Flags and Kilo Meshakkal, add 2 players. In Admin add an enabled point value no question has (e.g. 999999), then click Start in the game: the message names "أعلام" (and in English "Flags"). Delete the temporary point value afterwards.

## Known limitations

- The swap is by exact quoted name; a category renamed in Admin after Setup loaded is shown in English (Setup still holds the old name).
- The surrounding server sentence stays English, as D-59 a decides.

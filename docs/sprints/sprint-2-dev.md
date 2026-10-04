# Sprint 2 — Developer note (Admin page)

Stories: US-18, US-19, US-20, US-21, US-22, US-23.

## Files created / changed

| File | Status | Purpose |
|---|---|---|
| `admin.html` | new | Admin page. Panels for Settings, Point values, Categories, Questions and Coverage. Each panel has its own inline message area, plus one global area for load failures. Links back to the game. |
| `css/style.css` | new | Shared styles: dark theme, gold accents, buttons and forms, inline error/success messages. Also admin panels, tables, badges, the coverage grid and the game placeholder. |
| `js/admin.js` | new | All admin logic (vanilla JS, no dependencies). |
| `index.html` | new | Placeholder game page with a link to `admin.html`. The real game arrives in Sprint 3. |
| `docs/sprints/sprint-2-dev.md` | new | This note. |

**API: no changes.** The frontend uses the Sprint 1 contracts exactly as documented in `sprint-1-dev.md`.

## How it works

- **Fetch wrapper** `api(path, method, body)`: sends JSON with `Content-Type: application/json`. On a non-2xx response it throws `ApiError` carrying the API's `error` text and the HTTP status. If the body is not JSON or the network fails, it shows a readable generic message instead. Raw JSON and server output never reach the page.
- **`runAction()`**: wraps every write. It clears the panel message, disables the triggering button while the request runs, and shows any error inline in that panel. On 404/409 it also reloads the data, because the page was probably out of date. For example, after a stale-form 409 the points dropdown drops the slot that is now taken.
- **Single reload after every change** `refreshData()`: runs `GET points.php`, `categories.php` and `questions.php` in parallel, then re-renders the point list, the category table with its "x / P" counts and status, the category dropdowns, the questions table and the coverage grid. Coverage and counts are therefore always current (US-22).
- **No hard-coded board values.** P (the number of point values), the free slots, the coverage columns and the playable status all come from the API. "A game needs N" uses `categories_per_game` from settings. Client-side range checks read the `min`/`max` attributes of the inputs, so the limits are written once in `admin.html`; the server still validates them independently.
- **Rendering** uses only `createElement` / `textContent` through a small `h()` helper. The code contains no `innerHTML`, `insertAdjacentHTML` or `document.write`. `confirm()` dialogs show plain text.

### Per story
- **US-18 Settings**: loads the current values. On save, the client checks for a whole number within 1–10 or 5–600 and shows an inline error without sending anything if the value is invalid. Otherwise it sends `PUT settings.php` and shows "Settings saved." on success.
- **US-19 Point values**: listed in ascending order with how many questions use each value. Adding a value is checked on the client first (whole number 1–1,000,000); a duplicate gets a 409 shown inline. Delete asks for confirmation; a value still in use gets the 409 "Cannot delete 300: … still use it" shown inline. Adding a value immediately adds an empty coverage column and updates the playable status.
- **US-20 Categories**: a table with name, "x / P", a Playable / "n missing" badge, Rename and Delete. A summary line reads "k of m categories are playable … A game needs N." Rename is inline: an input with Save and Cancel, where Enter saves and Escape cancels. Text typed during a rename survives re-renders. An empty name is rejected on the client; a duplicate (case-insensitive, checked by the server) gets a 409 inline. The delete confirmation warns "Its n questions will also be deleted"; Cancel changes nothing.
- **US-21 Questions**: a filter ("All categories" or one category) controls the table, which shows category, points, question, answer and Edit/Delete.
  - In the Add form, the points dropdown lists only the selected category's free slots. With no category chosen it is disabled; when the category is full it says "No free slots".
  - Edit fills the form and lists the question's own slot plus the free slots. Changing the category is allowed, and so is moving to a free slot. A 409 (stale form or occupied slot) is shown inline and the form keeps its values.
  - Delete asks for confirmation. Choosing a filter while in add mode also preselects that category in the form.
- **US-22 Coverage grid**: rows are categories, columns are point values in ascending order, plus a "Filled x / P" column. Filled slots are green with a check mark; empty slots are red with a dashed border and a dash. Each cell is a button: an empty cell prefills the Add form with that category and points, and a filled cell opens it for editing. Labels and titles state filled or empty for accessibility.
- **US-23 Usability**: every error appears inline in its panel. A failure to load the page data appears in a global banner. "Back to the game" is shown in the admin header, and the placeholder `index.html` links to Admin.

## How to run / test
1. The database must be loaded and `api/config.php` configured (see README / Sprint 1).
2. From the project root, run `C:/xampp/php/php.exe -S localhost:8000`.
3. Open `http://localhost:8000/admin.html`.

## Verification performed
- `php -l` passes on all `api/*.php` (no PHP files were changed this sprint).
- I ran curl smoke tests on `php -S localhost:8000` covering every call the UI makes:
  - category create gives 201; a duplicate in different case gives 409;
  - question create gives 201; an occupied slot gives 409 "This category already has a 100 question"; moving to another slot gives 200;
  - point 1000 gives 201, again 409, after which `playable=1` returns empty;
  - deleting a used point gives 409, deleting an unused one gives 200;
  - settings out of range give 400; renaming to an existing name gives 409; category delete gives 200.
- **Browser check**: Node and browser-automation tools were not available, so I ran a temporary same-origin harness page in headless Chrome, which drove `admin.html` inside an iframe (form submits, button clicks, auto-confirm). All 36 checks passed with no JS errors. They covered:
  - settings load, client range error, save 6/20 persisted, then restored to 5/30;
  - point value rejected for a non-integer, 1000 added with 6 empty coverage cells and "0 of 6 playable", duplicate 409 inline, used value delete 409 inline, unused value deleted;
  - category: empty name rejected, `<b>` name rendered literally, case-insensitive duplicate 409, inline rename with 409 then success via Enter, delete cancel keeps it, the confirm text warns about questions, confirm deletes it;
  - questions: free-slot dropdown (6, then 5 after an add), XSS payload rendered as text, filter, required-field errors, edit moving 100 to 200, stale-form 409 inline with the dropdown refreshed and form values kept, coverage-cell prefill, delete.

  The harness was deleted afterwards. It is not part of the deliverable.
- **Cleanup**: all test data was removed, so the DB is back to seed state (settings 5/30, points 100–500, 6 categories x 5 questions). Auto-increment counters have advanced, which is harmless.

## Deviations / decisions
- **Point value delete asks for a confirm** even though the story does not require it, for consistency and to prevent accidental clicks. A used value still reaches the server and shows the 409, as US-19 requires.
- **Coverage cells are clickable** (prefill add or edit). This is small, convenient and not required.
- **Client-side checks duplicate the server rules** for whole numbers and ranges, giving friendlier labels such as "Categories per game" instead of `categories_per_game`. The server remains authoritative.
- **Data handling**: questions are loaded in full once per refresh, and the category filter is applied on the client, because the free-slot dropdown and the coverage grid need every question anyway. `?category_id=` is not used.

## Known limitations
- The admin page has no authentication, by design; the README warns against exposing it publicly.
- Concurrent edits from two tabs are not live-synced. Stale data is corrected on the next action (any 404/409 triggers a reload).
- Long category names are truncated with an ellipsis in the coverage grid; the full name is shown as a tooltip.
- The page needs a modern browser (ES2017 `async`/`await`, `fetch`, `HTMLFormElement` features).

## Fixes

### BUG-2-01: Category names wrap mid-word in the questions table at 1024 px
- **Cause:** `.data-table td.name-cell { overflow-wrap: anywhere; }` makes the cell's min-content width about one character. The auto table layout then gave almost all the width to the two `text-cell` columns, and short names such as "Technology" broke mid-word.
- **Fix (CSS only, `css/style.css`):** added `min-width: 9rem` to `.data-table td.name-cell` and kept `overflow-wrap: anywhere`. Normal names fit on one line. A very long unbroken name (up to 100 characters) still wraps inside its cell and does not widen the table. Question and answer text still wraps as before.
- **Other uses of the class:** `name-cell` is also used in the Categories table (both the name and the inline rename input). The 9rem minimum is narrower than that column already is, so nothing changes there. The coverage grid uses its own `.coverage-table` / `th.cat-name` rules and is not affected. No JS or HTML changed.
- **Verification:** I loaded a static copy of the questions-table markup with the real stylesheet in headless Edge at 1024x768:
  - "Technology" with long question/answer text: the cell is 153 px wide on 1 line. With the old rule it was 103 px on 2 lines, which reproduces the bug.
  - A 100-character unbroken name wraps inside the cell, and the table stays at the container width (no horizontal scroll).
  - The test page was deleted afterwards. No PHP changed, so `php -l` was not needed.

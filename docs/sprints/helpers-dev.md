# Helpers (US-32, D-36) — developer note

Change request outside the sprint cycle, branch `helpers` (from `main` 5982cba), 2026-10-23.
Plan: owner-approved "Helpers" plan (3 choices, Swap, Skip; once per contestant per game).

## Stories implemented
- **US-32 Helpers** (new, D-36), with all its rules:
  - Each contestant starts with 3 helpers, each usable once per game; the board's ± buttons do not restore them.
  - Helpers can be used only while the question is open, before anyone is scored and before the answer is shown. Each use asks for confirmation. After a helper, only its user can be scored and only its user can use more helpers on that question (stacking works, e.g. Swap then 3 choices, or Swap then Skip).
  - **3 choices** (chip "ABC"): A/B/C in a random order that is saved (same after a refresh), in the shown language, re-rendered on the language switch. All 3 options are cut at their first bracket (English " (", Arabic "("), see Fixes. The correct option turns green once the answer is shown. The chip is disabled with the tooltip "this question has no choices yet" when the question has no wrong options.
  - **Swap** (chip "⇄"): `POST questions.php?random=1` with `exclude` = every question id on the board and `seen` = the played list. The new question gets the heading "Category – points" with a small "Swapped from History – 300" note, its picture and credit, a restarted timer, and new points for Correct/Wrong/Skip. It is marked as seen. The original cell closes with the new question's result. While loading, the chip shows "…" and scoring waits. On an error (network, 409) a message is shown and the helper is kept. If the answer was shown during the request, the result is dropped and the helper is kept.
  - **Skip** (chip "½"): subtracts `Math.round(points / 2)` (the swapped value after a Swap), closes the cell grey and returns to the board.
  - Scoreboard cards show the 3 helper symbols; used ones are dimmed and struck through (with a hidden "Helpers left: …" text and tooltip).

## Files created / changed
- **New** `sql/migrate-add-wrong-options.sql`: `ADD COLUMN IF NOT EXISTS wrong_1, wrong_2, wrong_1_ar, wrong_2_ar VARCHAR(255) NULL` after `image_credit`. Safe to run again. **Run on the local DB** (twice, no error) and needed on live before the code.
- `sql/schema.sql`, `sql/schema-hosted.sql`: the same 4 columns plus a comment line.
- `api/db.php`: new `PLAYABLE_HAVING` constant (the playable rule, moved from `categories.php`), so `categories.php?playable=1` and the Swap draw use the same SQL.
- `api/categories.php`: uses `PLAYABLE_HAVING` (behaviour unchanged).
- `api/questions.php`:
  - The 4 fields in `QUESTION_SELECT` / `question_row()` (admin list), and in the board cells through the new `CELL_COLUMNS` + `board_cell()` (shared by `board()` and the Swap).
  - `draw_from_pool()` extracted from `board()` (unseen first, else the one seen longest ago) and reused by the Swap. `random_key()` uses `random_int`.
  - New `random_question()` for `POST ?random=1`: a random playable category, then a random enabled point value, then the cell rule. Excluded ids are never drawn. Cells that still have an unseen question are preferred across the whole bank. Nothing left → 409 "There is no other question left to swap in."
  - `parse_seen_ids()` takes a field label, so `exclude` errors name `exclude`.
  - Validation: `optional_line()` (one-line `optional_text()`; `optional_image_credit()` now uses it, same messages), `wrong_options()` per language (both or neither, max 255, one line, different from each other and from the answer, case-insensitive, both as typed and as cut by `choice_text()`; see Fixes). Cross-language rules: Arabic options need the Arabic question and the English options; a question with Arabic and English options needs the Arabic ones. `validate_question()` now returns the fields keyed by column, and `question_params()` builds the named parameters for INSERT/UPDATE. The update merge list includes the 4 fields.
  - Header comment lists the new endpoint and fields.
- `js/game.adffddea.js` (edited in place; the pre-commit hook re-hashes it):
  - State: `contestant.helpers`, `current.by`, `current.choiceOrder`, `current.swap` (documented at the top of `state`). `STORAGE_VERSION = 3`. `migrateSaved()` migrates step by step (v1 → v2 → v3; v2 contestants get all helpers).
  - Validation: `isValidHelpers()` in `isValidContestants()`, `isValidQuestion()` (shared by the board and the swap question; wrong options via `isOptionalText()`), `isValidHelperUse()` in `isValidCurrent()`. `by` must be a real contestant. A choice order (a permutation of 0..2) or a swap needs that contestant's helper to be marked used. With `by` set, only `by` can have marks, and `by` without a choice order or swap is rejected, so a tampered save is discarded.
  - `parseQuestion()` (extracted from `parseBoard()`, reused for the Swap) keeps the wrong options only as complete pairs, the Arabic ones only with an Arabic question.
  - `activeQuestion(g)` is used by `showQuestion()`, `renderQuestionLang()` (through `renderChoices()`), `toggleLang()`, `renderScoringRows()`, `markContestant()` and the helpers. `backToBoard()` is unchanged.
  - Scoring rows: 3 helper chips per row (`updateHelperChip()` / `helperBlockReason()` give the disabled state and the tooltip). `updateScoringRows()` disables Correct/Wrong for everyone but `cur.by`. The chips are also re-checked when the answer is shown.
- `index.html`: `#question-choices` (after the language button), `#helper-msg`, and a hint line explaining the chips.
- `css/style.19c4f0ef.css` (edited in place): chips, choices list, swap note, scoreboard helper symbols, `.srow.is-out`. Compact scoring rows keep a row with the chips on one line at 1366x768 with the 1 : 1 columns (see Fixes, BUG-H-02). With a picture, the choices are 3 columns in a smaller font, and on screens wider than 960px the picture gives up their height. Phone (≤600px): name + chips + score on the first line, Correct/Wrong below.
- `admin.html`, `js/admin.f7367b2c.js`: "Wrong option 1/2" (after the answer) and "Arabic wrong option 1/2" (after the Arabic answer). They are filled on edit, cleared on reset, checked on the client by the same rules as the API, and sent in the payload (`''` = none). New "Choices" column: ✓, "✓ (no Arabic)", or -.
- Docs: `docs/product-backlog.md` (US-32 under the new Epic E11, story status row, D-36), `docs/spec.md` (delivery-team row of the question-producer, Database, API, question screen, Admin), `docs/sprint-plan.md` (status line), `docs/deploy-hostinger.md` (deploy order in "Redeploy", step 4).

Not touched, as agreed: `sql/add-wrong-options.sql`, `docs/question-sets/*`, `.claude/agents/question-producer.md`.

## Local test data
Before the content existed, I set wrong options on these local questions through the API (PUT), not in any repo SQL file:

| id | Category | Points | Note |
|---|---|---|---|
| 1 | Geography | 100 | Paris (text, Arabic) |
| 37 | Geography | 100 | Pacific Ocean |
| 58 | Science | 100 | Saturn |
| 275 | Science | 100 | Coronavirus, answer has "(accept …)" |
| 997 | Flags | 100 | USA flag (SVG picture), answer has "(accept …)" |
| 1274 | Landmarks | 100 | Eiffel Tower (photo + credit) |

Meanwhile the parallel content step loaded wrong options for **all 761** local questions (EN and AR; basic checks found no pair with equal options, no option equal to the answer, no half pairs, no control characters, and max length 60). The 6 above kept my test values at first; in fix loop 1 they were reset to the values of `sql/add-wrong-options.sql` (see Fixes, item 4). To see the greyed-out 3 choices chip locally, add a question without wrong options in Admin (or restore a v2 save).

## How to run / test
1. `C:/xampp/mysql/bin/mysql.exe -u root brainrush < sql/migrate-add-wrong-options.sql` (already done locally).
2. `C:/xampp/php/php.exe -S localhost:8000` from the project root; open `http://localhost:8000/`.
3. Start a game with 6 players, open a cell and try each chip. Things to check: the confirm, the disabled rows, A/B/C and the language switch, a refresh keeps the order, Swap (heading note, new points, timer, picture questions), Skip (−50%, grey cell), blocking after a score or after Show Answer, and the scoreboard symbols.

## Verification done
- `php -l` on every `api/*.php` file: no syntax errors (PHP 8.0, XAMPP).
- curl against `php -S localhost:8000`:
  - The board payload (GET and POST) and the admin list include `wrong_1/2(_ar)`.
  - `?random=1`:
    - `{}` returns `{category, points, question}`.
    - Excluding every id → 409.
    - `seen` = all ids but 1274 → always 1274 (5/5).
    - Excluding 1274 with everything else seen → a seen question (oldest of its cell).
    - 30 draws with `exclude:[1]` never return id 1 and spread over 10 categories.
    - A temporary non-playable category (1 question) is never drawn; it was created and deleted again, and the count is back to 761.
    - `exclude` not a list → 400 naming `exclude`; `seen:[0]` → 400; text/plain → 415; `[]` body → 400.
  - Validation 400s on PUT/POST:
    - One option only (EN or AR).
    - Two equal options (case/space-insensitive).
    - An option equal to the answer ("PARIS"), or to the answer without "(accept …)" ("usa" for "USA (accept …)", and the Arabic stripped answer).
    - English options on an Arabic question without Arabic options; Arabic options without English ones.
    - A line break; a non-string; 256 characters.
    - Valid saves → 200. Clearing with `""`/`null` → all 4 null.
- Browser (headless Chrome 1366x768, 1920x1080 and a 375x812 iframe, with a test harness outside the repo that writes saved games and clicks through the page):
  - 1366x768 with 6 players, no page scroll in any case tested:
    - The board with the scoreboard symbols.
    - A text question with 3 choices, in EN and AR.
    - A photo with choices (photo 340 → 285px).
    - A flag with Swap + choices + a two-line Arabic answer (flag 216 → 161px).
    - A photo with Swap + choices.
    - A restored v2 save.
  - Scoring rows stay one line (52px).
  - Phone 375px: no horizontal scroll; name, chips and score on line 1, buttons on line 2.
  - Scripted flow, all as expected, no JS errors:
    - 3 choices disables the other rows and chips, keeps its order after a reload and switches to Arabic.
    - Swap shows the busy chip, the new heading and points, restarts the timer and marks the question seen. Correct gives the swapped points, and the original cell takes the owner.
    - Skip −100 on a 200 cell turns the cell grey.
    - The chips are disabled after a Wrong and after Show Answer.
    - Swap with a network failure, and with a 409, keeps the helper and shows the message.
    - Swap then Skip −250 on a 500.
    - A question without options → chip disabled with the tooltip.
    - Tampered saves (a choice order without the helper used; another contestant's mark after a helper) → discarded to Setup.
  - Admin:
    - Edit fills the 4 fields.
    - Client errors for half / duplicate / equal-to-answer / missing Arabic.
    - A valid save works.
    - The Choices column shows ✓ for 761 rows.

## Known limitations
- At 1920x1080, a **flag** question whose answer takes 2 lines already scrolled 22px before this change (accepted by D-30). With 3 choices it scrolls 34px when an option wraps to 2 lines (44px before fix loop 1). Photos and 1366x768 fit.
- The chips are 1.5rem (25px), small for touch on phones (best effort per D-30).
- A Swap after 3 choices keeps the choices for the new question (new order) when it has wrong options; otherwise no choices are shown. The helper is used either way.
- Swap only avoids the questions on the current board and prefers unseen ones. A question swapped in earlier in the same game is in the seen list, so it only comes back once the whole bank was played.
- Questions without wrong options (e.g. new ones added in Admin without them) keep the 3 choices chip greyed out. That is by design (D-36 a).
- Not tested in a real (non-headless) Chrome window; the owner's local Chrome check is still to do.

## Fixes (fix loop 1, from `docs/sprints/helpers-test-report.md`)

How I measured: a sweep page outside the repo restores a saved game for every one of the 761 questions on the real game page, at 1366x768 with 6 players, and counts the pages that scroll. "Choices" means 3 choices used with the answer shown. "No answer" means 3 choices used before Show Answer. "Plain" means no helper and the answer shown. Main was measured from `HEAD` (5982cba) copies of `index.html`, `css/style.19c4f0ef.css` and `js/game.adffddea.js`.

| Sweep, 1366x768, 761 questions | main | before the fixes | after the fixes |
|---|---|---|---|
| Plain, English | 19 | 27 | **19** (the same ids as main) |
| Plain, Arabic | 0 | 0 | **0** |
| Choices, English | – | 428 | **4** (518: +2px; Landmarks 1279, 1297, 1312: long answers, which D-35 already lists) |
| Choices, Arabic | – | 268 | **0** |
| No answer, English | – | 184 | **0** |
| No answer, Arabic | – | 58 | **0** |

- **BUG-H-01 (Major), fixed.** When 3 choices are shown on a text question, `.question-main.has-choices` with `.question-image[hidden] ~ …` gives the question screen a compact layout like D-35:
  - The question font is `clamp(1.4rem, 2.5vw, 2.6rem)` × the FU-04 scale, with tighter spacing and a smaller language button.
  - The choice rows are tight (`clamp(1.05rem, 1.5vw, 1.5rem)`). When every choice has at most 24 characters (`CHOICES_SHORT_CHARS`), game.js sets `.is-short` and the 3 choices sit side by side.
  - The timer digits are 2rem, and "Time's up!" takes room only once time is up.
  - The answer is smaller (`clamp(1.15rem, 1.9vw, 1.9rem)`, as for photos).

  Pictures keep their rules: Flags 0 views over, Landmarks 3 views over, down from 7.
- **BUG-H-02 (Minor), fixed.** The question layout is back to `1fr 1fr`. The scoring row instead fits through:
  - Correct/Wrong buttons at 0.92rem.
  - 1.5rem chips with a 0.65rem font.
  - Row gap 0.35rem, name basis 5rem.

  Rows stay one line (50px) for typical names. Plain questions overflow exactly as on main: 19 English, the same ids, and 0 Arabic.
- **BUG-H-03 (Minor), fixed.** The Swap error adds a full stop only when the error text has none. A 500 now reads "Could not swap the question: Internal server error. The helper was not used."
- **Item 4, test rows reset.** The content session's `sql/add-wrong-options.sql` is in its worktree, `.claude/worktrees/amazing-dewdney-a49cb7`, which I only read. I set the 4 option fields of ids 1, 37, 58, 275, 997 and 1274 to NULL, then ran that file on the local DB; it only fills empty fields. The 6 rows now hold the file's values. Ids 58 and 275 changed: 58 is now Jupiter/Uranus, and 275 has a different Arabic option 2. No question has empty options (0).
- **Item 5, cut at the first bracket.** The game shows every choice cut at its first bracket: English at " (", Arabic at "(" with or without a space. Examples: "Three (triplets)" → "Three", "Pompeii (accept Herculaneum)" → "Pompeii", "لَف (Love)" → "لَف". This is `choiceText()` in game.js, and `choice_text()` in questions.php with the same rule. Show Answer still shows the full answer. **The wrong options are cut the same way.** That goes beyond the request, for a reason: 80 Arabic questions have wrong options with an English gloss in brackets, like their answers ("المعلومات الآلية (Automated information)"). Cutting only the answer would have made it the only option without brackets. English wrong options have no brackets, so nothing changes there. The API, and the Admin client checks, now reject a wrong option equal to the answer, or two wrong options equal to each other, both as typed and as cut. A SQL check found no current question that breaks the new rule. curl: "three" or "Three (twins)" for "Three (triplets)" → 400, "Four (4)" next to "Four" → 400, Arabic "باريس" for "باريس(Paris)" → 400, a valid option → 201. The test category was deleted again, so there are still 761 questions.

Re-checked after the fixes:
- `php -l` on all `api/*.php` files: no errors.
- The scripted flow at 1366x768, unchanged and still no JS errors.
- The Admin flow: fill on edit, the client errors, and a valid save.
- Layout scenarios at 1366x768, 1920x1080 and 375px: no scroll at 1366, apart from the sweep cases above; no horizontal scroll on the phone.

- BUG-H-05 (after the re-test): on screens up to 600px wide the 3 choices are always one per line, for photos and short text choices alike (`@media (max-width: 600px)` block in the CSS), so short Arabic names are no longer split mid-word.

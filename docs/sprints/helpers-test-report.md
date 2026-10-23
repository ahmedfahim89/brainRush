# Helpers (US-32, D-36): test report

Tester: game-tester (Senior Tester). Date: 2026-10-23. Branch `helpers`, uncommitted working tree (base `main` 5982cba).
Inputs: `docs/product-backlog.md` (US-32, D-36), the owner-approved plan (Rules + Verification), `docs/sprints/helpers-dev.md`.

## Summary

**Verdict (first test): NEEDS FIXES** (1 Major layout bug, 3 Minor findings). **Updated verdict after fix loop 1: READY FOR PO**, see section 8.

Environment
- Windows 11, PHP 8.0 (XAMPP) `php -S localhost:8000` from the repo root, local MariaDB `brainrush` (761 questions, 13 categories, 6 point values 100-600).
- Browser: the Browser pane (Chrome 152). The pane cannot be resized, so the 1366x768 and 375x812 checks ran in a same-origin iframe of exactly that size (media queries see the iframe size) with a harness injected through the pane's JavaScript tool; the game itself was the real page, driven by real DOM clicks. Real mouse clicks were used in the pane at its native 1024x768 and in the Admin.
- A native `window.confirm` is auto-cancelled by the pane (it returns false). The Cancel path was therefore tested with the real native dialog, and the OK path by replacing `window.confirm` in the iframe with a stub that records the message and returns true.
- Static and API results were checked directly. A second `php -S` on port 8001 served a `git archive HEAD` copy (temp dir, outside the repo, deleted afterwards) only to get a layout baseline.

Counts (criteria in the tables below): **PASS 68, FAIL 1, PENDING 0** (69 criteria).

Test data and cleanup
- Temporary data: category "ZZ Tester Temp" with 6 questions without wrong options (Team A-F names in games), a few temporary questions for the validation checks, point value 600 disabled and re-enabled once.
- All removed. Final DB state: 761 questions, 0 without wrong options, 13 categories, all 6 point values enabled. The migration was run twice against the local DB (no error, columns already there). PHP servers stopped. No repo file was changed, nothing committed (only this report was added).
- The Browser pane's localStorage for localhost:8000 still holds a test game and seen list. Harmless, but clear it in your own browser profile if you use the pane.

## 1. Static checks

| # | Check | Result | Evidence |
|---|---|---|---|
| S1 | `php -l` on `api/*.php` | PASS | auth, categories, config.example, config, db, game-log, points, questions, settings: no syntax errors |
| S2 | `innerHTML` with data | PASS | grep finds only the two header comments saying it is never used (`js/game.adffddea.js:5`, `js/admin.f7367b2c.js:4`). A saved Swap question with `<img onerror>` / `<b>` text renders as text in the heading and question (checked `innerHTML`: `&lt;img ...&gt;`) |
| S3 | String-concatenated SQL | PASS | only `query()` calls with constants (`QUESTION_SELECT`, `PLAYABLE_HAVING`, `CELL_COLUMNS`); every value goes through prepared parameters or `intval`/`array_fill` placeholders |
| S4 | Hard-coded board sizes | PASS | no literal category/point counts added; the 3 helpers are fixed by the spec (`HELPER_KEYS`) |
| S5 | Credentials outside `api/config.php`; `api/config.php` ignored | PASS (with note) | `git check-ignore` confirms `api/config.php`; no secrets in the changed files. See BUG-H-04 for the untracked `InternalUse/` folder |

## 2. API checks (curl)

| # | Criterion | Result | Evidence |
|---|---|---|---|
| A1 | Migration `sql/migrate-add-wrong-options.sql` runs twice | PASS | two runs, no error; `SHOW COLUMNS`: `wrong_1`, `wrong_2`, `wrong_1_ar`, `wrong_2_ar` VARCHAR(255) NULL, after `image_credit` |
| A2 | Schema files have the columns | PASS | `git diff sql/schema.sql sql/schema-hosted.sql`: the 4 columns plus a comment |
| A3 | Board payload (GET and POST) includes `wrong_1/2(_ar)` | PASS | GET `?board=1&categories=1,2` and POST `?board=1` cells contain all 4 fields (Arabic ones filled) |
| A4 | Admin list includes the 4 fields | PASS | `GET questions.php` rows and POST/PUT responses contain them (null when empty) |
| A5 | `?random=1` with `{}` returns `{category, points, question}` | PASS | random category, points in 100-600, cell-shaped question |
| A6 | `exclude` is never drawn | PASS | exclude every id other than 1274 (5 runs): always 1274. 40 draws with `exclude:[1]`: never id 1, spread over 12 categories and all six values |
| A7 | `seen` prefers unseen | PASS | seen = all ids but 1274 (5 runs): always 1274 |
| A8 | All seen: oldest seen of the picked cell | PASS | exclude 1274 + seen = all ids ascending: returned id 5, the lowest id of that Geography 500 cell |
| A9 | Never draws a non-playable category | PASS | temporary category with 1 question (not in `playable=1`): excluding all other ids gives 409; 40 normal draws never returned it |
| A10 | Disabled point value never drawn | PASS | 600 disabled: 40 draws, only 100-500; re-enabled afterwards |
| A11 | 409 when nothing is left | PASS | exclude all ids: `{"error":"There is no other question left to swap in."}` [409] |
| A12 | 400 on bad input | PASS | `exclude:"1"`, `[0]`, `["a"]` (message names `exclude`), `seen:{"a":1}`, `seen:[1.5]`, body `[]`, malformed JSON: all 400; `Content-Type: text/plain`: 415 |
| A13 | `?random=1` is public | PASS | works without admin credentials (local, no admin configured); a plain GET with `random=1` falls to the admin list (unchanged) |
| A14 | POST/PUT: half pair (EN, either field) | PASS | 400 "Provide both Wrong option 1 and Wrong option 2, or neither" |
| A15 | POST/PUT: half pair (AR) | PASS | 400 "Provide both Arabic wrong option 1 and ..." |
| A16 | Duplicates (case/space-insensitive), EN and AR | PASS | 400 "... must be different" |
| A17 | Option equals the answer, also with "(accept ...)" removed, EN | PASS | `alpha (ACCEPT A)` and `ALPHA` vs answer `Alpha (accept A)`: 400 |
| A18 | Option equals the Arabic answer, also stripped of "(يُقبل: ...)" and "(يقبل: ...)" | PASS | all 400 "... is the same as the answer" |
| A19 | Arabic rules | PASS | Arabic options without Arabic question: 400; without English options: 400; English options on an Arabic question without Arabic options: 400; PUT clearing only the Arabic pair: 400; PUT removing the Arabic question while Arabic options exist: 400 |
| A20 | Format limits | PASS | line break 400, non-string 400, 256 characters 400, 255 characters 201 |
| A21 | Valid saves and clearing | PASS | POST full EN+AR 201; PUT valid 200; `""`/`null` on all four clears them to null; PUT 404 for an unknown id; duplicate question 409; missing answer 400 |
| A22 | `categories.php?playable=1` unchanged by the refactor | PASS | temp category listed only when it has all six values; the same SQL (`PLAYABLE_HAVING`) drives the Swap |

## 3. UI checks: game (1366x768, 6 players "Team A-F")

| # | Criterion | Result | Evidence |
|---|---|---|---|
| G1 | New game: every contestant has 3 helpers; scoreboard shows the 3 symbols | PASS | board cards show "ABC / swap / half" with hidden text "Helpers left: 3 choices, Swap, Skip" |
| G2 | The board's +/- buttons never restore a helper | PASS | Team A +,+,-,- : score changed, helpers unchanged |
| G3 | Each helper once per contestant per game | PASS | after use the chip is disabled with the tooltip "already used in this game" (also after a refresh and after leaving the question); Team B used all three in one game and all stayed off on later questions |
| G4 | A confirm for every helper, with the right text | PASS | "Use 3 choices for Team A? The answer is shown among 3 choices. Only Team A can answer this question then." / "Use Swap for Team B? A random question from any category replaces this one, with a new timer. ..." / "Use Skip for Team C? Team C loses 250 points (half of 500) and the question closes for everyone." |
| G5 | Cancel changes nothing | PASS | real native dialog (auto-cancelled) and stub returning false: helper still true, no `by`, saved state unchanged |
| G6 | Other rows disabled after a helper | PASS | after Team A used 3 choices: rows B-F show Correct, Wrong and all chips disabled and `is-out`; tooltip "only Team A can use helpers on this question" |
| G7 | Blocked after someone was scored | PASS | after Team D Wrong: every chip disabled, tooltip "not after someone was scored" |
| G8 | Blocked after the answer is shown | PASS | after Show Answer every chip disabled, tooltip "not after the answer is shown"; the user can still be scored |
| G9 | The same contestant can stack helpers | PASS | Team B: Swap, then 3 choices, then Skip on one question (score -50, the swapped value 100 / 2); Team A: 3 choices then Swap (fresh order for the new question, Skip at 600 gave -300) |
| G10 | 3 choices: A/B/C in random order, in the shown language | PASS | A/B/C list under the question, Arabic RTL (`dir=rtl lang=ar`) and English LTR |
| G11 | The order is kept after a refresh | PASS | Statue of Liberty question: before reload C (answer), after reload same A/B/C and `choiceOrder` [1,2,0] in the save; the timer restarts at full length |
| G12 | EN/AR toggle switches the options | PASS | same order, English text and `dir=ltr`, then back to Arabic |
| G13 | "(accept ...)" is stripped from the correct option | PASS | USA flag: option "USA" (EN) and "الولايات المتحدة الأمريكية" (AR) while the answer box shows the full text with the accept part |
| G14 | The right option turns green when the answer is shown | PASS | computed colours: answer option green background/border, others unchanged; not green before the answer |
| G15 | 3 choices chip greyed out without wrong options | PASS | temporary question: chip disabled, tooltip "this question has no choices yet", aria-label "(this question has no choices yet)", click does not open a confirm |
| G16 | Swap: new heading, note, new value | PASS | "CARTOONS & CHILDHOOD – 100" + small "Swapped from Science – 200"; Correct/Wrong show (+/-100) |
| G17 | Swap: timer restarts | PASS | 21 s left, Swap, 30 s immediately |
| G18 | Swap: new question marked seen | PASS | seen list gained the swapped id (and the original cell's id, as before) |
| G19 | Swap: original cell takes the new question's result | PASS | Team D Correct on a swapped question: original cell History 200 owned by Team D, +100 applied; a Skip left the original cell grey |
| G20 | Swap: picture question works | PASS | swap drawn through the real endpoint (retried until a picture): Landmarks 600 photo with credit "Photo: Wilfredor / CC0" shown; stacked choices fit |
| G21 | Swap: API failure keeps the helper | PASS | network error, 409, malformed payload, 500: message under "Scoring" "Could not swap the question: ... The helper was not used.", helper still true, question unchanged, chip usable again |
| G22 | Swap: race handling | PASS | Back to Board during the request: result dropped, helper kept, no error; Show Answer during the request: "The answer was shown meanwhile, so the Swap was not used.", helper kept |
| G23 | Swap while 3 choices were used and the new question has none | PASS | choices block hidden, helper stays used (documented behaviour); survives a refresh |
| G24 | Skip: minus round(50%) | PASS | 200 cell with Skip -100 (dev note); History 500: -250; after a Swap to 600: -300 |
| G25 | Skip: grey cell, back to the board | PASS | cell "no correct answer", grey (rgb 75,81,99), board shown, `current` null |
| G26 | Scoreboard helper symbols update | PASS | used symbols dimmed and struck; "Team B ... No helpers left" text after the third use |
| G27 | A v2 save (old shape) still restores | PASS | v2 board save: restored on the board with all helpers; v2 save with an open question and a mark: restored on the question; both re-saved as v3 |
| G28 | A tampered v3 save is discarded | PASS | 10 tampered saves discarded to Setup (choice order without the helper used, another contestant marked after a helper, `by` without order/swap, order not a permutation, unknown `by`, missing helper key, non-boolean helper, negative swap points, external swap image, non-text wrong option); a valid save with HTML text is kept and rendered as text |
| G29 | No JS console errors | PASS | window `error`, `unhandledrejection` and `console.error` hooks recorded nothing across all flows; the pane console shows no errors on `/` or `/admin.html` |
| G30 | No page scroll on the question screen at 1366x768 (6 players) | **FAIL** | see BUG-H-01: with 3 choices and the answer shown, 695 of 1522 question views overflow (up to 1073 px tall) |
| G31 | Scoring rows stay on one line at 1366x768 | PASS | row height 52 px in every case, also with 30-character names |
| G32 | Mobile 375x812: no horizontal scroll, row layout | PASS | scroll width 360 of 375 (vertical scrollbar), name + chips + score on line 1, Correct/Wrong on line 2; 6 players fit; chips are 27 px (known, best effort per D-30) |
| G33 | Mobile board: scoreboard helper symbols | PASS | cards wrap 2 per row, symbols visible |

## 4. UI checks: Admin

| # | Criterion | Result | Evidence |
|---|---|---|---|
| D1 | The 4 fields exist and fill on edit | PASS | Paris question: Lyon/Marseille + ليون/مرسيليا; USA flag: Liberia/Malaysia + Arabic; cleared on "Cancel edit" |
| D2 | Client validation | PASS | half EN/AR, duplicates, equal to answer (also stripped), Arabic without Arabic question, Arabic without English, English with Arabic question but no Arabic options, over 255: all show a message in `#questions-msg` and send no request |
| D3 | A save works | PASS | typed two options with the real keyboard, clicked "Save changes": "Question updated", API returns the options |
| D4 | Choices column shows ✓ / - | PASS | 761 rows ✓, the 6 temporary rows "-"; a row turned ✓ after the save. The "✓ (no Arabic)" variant is only reviewed in code (`choicesLabel`, `js/admin.f7367b2c.js` near line 688), because the validation prevents creating that state |

## 5. Regression

| # | Criterion | Result | Evidence |
|---|---|---|---|
| R1 | Surprise me! | PASS | with 3 picks + Surprise: hidden category tile "Surprise category", reveal on open; Swap from it shows "Swapped from <real name> - 100" |
| R2 | Picture questions with credit | PASS | Landmarks photo and credit caption, flag SVG; choices fit on pictures |
| R3 | No-repeat seen list and played bar | PASS | "Played 5 of 36" counts only board questions; setup shows the played-questions bar ("Less than 1%"); swapped-in ids are added to the list |
| R4 | Normal scoring without helpers | PASS | Wrong, Wrong, Correct on one question: labels (+/-200), Correct disables others, owner colour, results screen ranking correct |
| R5 | Layout of the plain question screen vs `main` | PASS with Minor | most questions unchanged; see BUG-H-02 for 9 more overflowing ones |

## 6. Bugs

### BUG-H-01 (Major): question screen scrolls at 1366x768 with 6 players when 3 choices are used on a text question
- Plan / D-30 requirement: "must still fit 1366x768 with 6 contestants". The dev note only tested a few short questions; the stress sweep below shows it is the normal case.
- Steps: start a 6-player game (e.g. Geography, Food & Drink, ...), open a cell whose question is about 80 characters or longer (for example Food & Drink question id 571, "What is the name of Egypt's classic breakfast dish ..."), use **3 choices** for any team, click **Show Answer**. The page now scrolls (857 px content in a 768 px window); the answer box is cut off at the bottom. Same for Arabic questions.
- Expected: no page scroll (the plain question screen at 1366x768 fits: 741 of 761 questions are exactly 768 px on `main`).
- Actual: sweep over all 761 questions with 3 choices and the answer shown, 6 players, 1366x768:
  - English: 425 of 761 overflow; Arabic (the default language when present): 270 of 761 overflow.
  - By category, overflowing English views: Egyptians 124 of 162, Gen Z 95 of 132, Movies 65, Sports 66, Food & Drink 62, AI 60, Technology 53, History 51, Geography 42, Science 39, Cartoons 30 (all of these categories lose the fit); Flags 0 of 106 and Landmarks 8 of 92 (4 pictures, the photo shrinks).
  - Overflow is typically +38 px (806) for questions of 80-105 characters, +89 px (857) for 3-line questions, up to +300 px (1073).
  - Before the answer is shown the choices alone also overflow for about 10 percent (+42 px, 810, for 3-line questions), e.g. ids 723, 1414, 726, 732.
  - Stacking Swap + choices adds the "Swapped from" note and was not worse in the samples.
- Cause: text questions have no compact mode when `#question-choices` is shown. Only picture questions get the smaller choices and the shorter picture (`css/style.19c4f0ef.css:705-709`); a text question keeps its large font (`clamp(...)` question text) plus three full-size choice rows (`.choice` 1.1-1.6rem, `css/style.19c4f0ef.css:683-702`) plus the answer box.
- Suggested fix direction (for the developer): a `has-choices` compact rule for text questions (smaller question font and choice padding, or choices in 3 columns when they are short), then re-run the sweep.
- Impact: the host has to scroll the page to read the whole answer box on most questions after using 3 choices; Correct/Wrong and Back to Board stay visible in the right column.

### BUG-H-02 (Minor): the wider scoring column makes 9 more plain questions overflow than on `main`
- Cause: `.question-layout` columns changed from `1fr 1fr` to `1fr 1.12fr` (`css/style.19c4f0ef.css:581`), so the question column is about 5 percent narrower.
- Steps: 6 players, 1366x768, open a long English question without any helper (e.g. ids 1172, 1196, 728, 505, 512, 517, 902, 917, 1103) and show the answer. Page height 802-813 px.
- Expected: same as `main`, where these fit (768).
- Actual: 28 questions overflow in the long-question subset (454 questions tested) against 20 on `main` (HEAD 5982cba, measured the same way, all 761 questions). 19 of them also overflow on `main` (the already known D-30 cases); 9 are new; 1278 (a photo) is no longer over.
- Impact: small (+35-45 px, only on very long questions), but it hits users who never use a helper.

### BUG-H-03 (Minor): Swap error text can run into the next sentence
- File: `js/game.adffddea.js:1668`.
- Steps: make the swap request return a 500 (`{"error":"Internal server error"}`, no final punctuation).
- Actual: "Could not swap the question: Internal server error The helper was not used." (no full stop between the two sentences). Messages that end with a full stop (network, 409) read correctly.
- Expected: the helper-kept sentence separated from the error text, e.g. always add a full stop when the error text has none.

### BUG-H-04 (Minor, repository hygiene, outside the helpers code): `InternalUse/` is untracked and not ignored
- `git status` lists `?? InternalUse/`. The folder contains a `config.php` and a `password.txt` (contents not read or reproduced here). `.gitignore` lists `api/config.php` and `/password.txt` only.
- Risk: `git add -A` or `git add .` would stage them for the PR. Not caused by this change request, but it will be on the helpers branch's working tree when the owner commits. Recommend adding `InternalUse/` to `.gitignore` (or moving it out of the repo) before committing, and checking the folder with the Celfocus security contact (information.security@celfocus.com) if it holds real credentials.

### Observations (no bug)
- At the pane's native 1024x768 the scoring row wraps (Wrong under the name); expected below the 1366 design width (D-30 targets 1366x768 and phones).
- The heading with the "Swapped from ..." note wraps onto two lines for long category names at about 1024 px; at 1366 it fits.
- Helper chips are 27 px, small for touch (already listed by the developer).
- Native confirm dialogs could not be accepted in the pane; the OK path was verified with a recording stub (the dialog text is the one a user sees).
- `index.html` still points to the existing hashed asset names (CSS and JS were edited in place): the pre-commit hook must re-hash them, otherwise the live CDN/browser cache keeps the old assets (see the live-site caching note in the project memory).

## 7. Verdict

**NEEDS FIXES.** All US-32 functional rules, the API and Admin criteria passed. The single failing criterion is the 1366x768 no-scroll rule (BUG-H-01, Major); BUG-H-02 to BUG-H-04 are Minor and can ride along. After the layout fix, re-run: the 761-question sweep with 3 choices and the answer shown (English and Arabic), plus the plain-question sweep for BUG-H-02.

## 8. Re-test after fix loop 1 (2026-10-23)

Scope: the developer's "Fixes" section in `docs/sprints/helpers-dev.md` (BUG-H-01 compact layout, BUG-H-02 columns back to 1fr 1fr, BUG-H-03 full stop, test rows 1/37/58/275/997/1274 reset, new cut-at-first-bracket rule for every choice) and the updated D-36 (f)(g) / US-32.
Environment: same as section 1 (`php -S localhost:8000`, local MariaDB, Browser pane with 1366x768 and 375x812 same-origin iframes). Own sweeps on the real game page, 6 players "Team A-F", no code changed, nothing committed.

| # | Criterion | Result | Evidence |
|---|---|---|---|
| RT1 | BUG-H-01: 3 choices + Show Answer, EN, 761 questions at 1366x768 | PASS | 761 views; only 1279, 1297, 1312 (Landmarks photos, 798-801 px) overflow. Allowed set was 518, 1279, 1297, 1312; 518 fit in my run. Before the fix: 425 |
| RT2 | BUG-H-01: same, Arabic (default language) | PASS | 761 Arabic views, 0 overflow (before: 270) |
| RT3 | BUG-H-02: no helper, answer shown, EN and AR | PASS | EN 19 overflow (ids 489, 493, 502, 503, 508, 513, 518, 522, 554, 738, 742, 743, 745, 746, 749, 980, 1094, 1279, 1297), the same known D-30 cases as `main`; AR 0. The 9 new overflowing ids from the first test (1172, 1196, 728, 505, 512, 517, 902, 917, 1103) now fit |
| RT4 | BUG-H-03: full stop only when missing | PASS | 500 "Internal server error" gives "... Internal server error. The helper was not used."; 409 and network messages unchanged; "Something broke!" keeps its own "!" and is not doubled up; the helper stays available in all four |
| RT5 | Bracket cut in the game | PASS | all three options cut at the first bracket, the Show Answer box keeps the full answer: id 20 AR "لَف (Love)" with AR options "ليت (Let)", "إيس (Ace)" shows ليت / إيس / لَف, EN Let / Ace / Love; id 55 "The Tigris (dijla river)" shows "The Tigris"; id 239 AR "Rizz (ريز)" shows "Rizz"; id 275 "A coronavirus (accept SARS-CoV-2)" shows "A coronavirus" in EN and "فيروس كورونا" in AR; id 6 "Carbon dioxide (CO2)" shows "Carbon dioxide"; id 238 AR "المحتالون (Impostors)" shows "المحتالون". The right option still turns green |
| RT6 | Bracket cut over the whole bank | PASS | applying the stated rule (EN " (", AR "(") to all 761 questions, both languages: 0 shown options with a bracket left, 0 questions with two equal shown options. The local rows 1/37/58/275/997/1274 hold the content file's values; 761 questions all with options |
| RT7 | Bracket cut in the API | PASS | all 400: "three", "THREE" and "Three (twins)" for answer "Three (triplets)"; two options equal after the cut ("Four (4)" + "Four", "Four (a)" + "Four (b)"); Arabic "باريس" and "باريس (Paris2)" for "باريس(Paris)"; two Arabic options equal after the cut; "usa" for "USA (accept America)"; PUT that makes an existing option equal the new cut answer. 201: "Four (4)" + "Five" for "Three (triplets)", and an Arabic question with glossed options. English "Three(x)" (no space) is not cut, so "Three" is allowed there, which matches the stated rule |
| RT8 | Bracket cut in the Admin | PASS | same cases in the form: client messages ("must not be the answer itself", "must be different", Arabic variants), no request sent; edit fills the options; a valid save works; Choices column ✓ for all rows |
| RT9 | Helper flows regression | PASS | confirm texts, 3 choices (order kept after refresh, EN/AR toggle, green on reveal, other rows disabled, no scroll), Swap (new heading with note, timer 30, 2 chips left), Swap then Skip (-200 at the swapped 400, cell grey, board), blocking after Wrong and after Show Answer, scoreboard "Helpers left" text, Swap failures keep the helper (500, 409, network); no JS errors |
| RT10 | Surprise me!, picture questions, seen list | PASS | hidden tile, reveal on open; Swap to a photo question shows the picture and credit "Photo: CEphoto, Uwe Aranas / CC BY-SA 3.0", choices and answer fit (768 px); seen list holds board and swapped ids, "Played 4 of 36" counts board questions only; original cell takes the swapped result |
| RT11 | v2 save restore, tampered v3 saves | PASS | v2 board and v2 open-question saves restore (re-saved as v3, all helpers); 3 tampered saves (choice order without helper used, other contestant marked, non-boolean helper) are discarded to Setup |
| RT12 | Phone layout 375x812 | PASS (see BUG-H-05) | no horizontal scroll (360 of 360), rows 89 px (name + chips + score, then Correct/Wrong), chips 26-30 px (known limit), choices shown |
| RT13 | Cleanup | PASS | temp category deleted; DB 761 questions, 0 without wrong options, 0 Arabic questions without Arabic options, 13 categories, 6 point values enabled; `php -S` stopped |

### New finding

**BUG-H-05 (Minor): Arabic choices break inside words on a phone.**
- Steps: 375px wide, open a text question whose 3 options are short (each at most 24 characters, so game.js sets `.is-short` and the choices go side by side), e.g. a History question with Arabic options "جيسي جاكسون / مالكوم إكس / مارتن لوثر كينغ الابن", use 3 choices.
- Actual: three columns of about 100 px; `overflow-wrap: anywhere` splits names mid-word (for example "جاكسو / ن") and one option takes 4 lines.
- Expected: whole words stay together (stack the options on phones, or only use the side-by-side mode above a width threshold). `css/style.19c4f0ef.css:717` (`.is-short` 3 columns) and the `.choice` `overflow-wrap`; the same 3-column rule is not limited to wide screens.
- Impact: readability on phones only; no data or scoring effect. Not a blocker.

### Status of earlier bugs

| Bug | Status |
|---|---|
| BUG-H-01 (Major) | Fixed, verified by RT1, RT2 |
| BUG-H-02 (Minor) | Fixed, verified by RT3 |
| BUG-H-03 (Minor) | Fixed, verified by RT4 |
| BUG-H-04 (Minor, `InternalUse/` untracked and not ignored) | OPEN, the owner's to handle before committing (still `?? InternalUse/` in `git status`) |
| BUG-H-05 (Minor, phone word breaks) | FIXED after the re-test: on screens up to 600px wide the 3 choices are always one per line (css phone block); checked at 375x812 on the History question (Jesse Jackson / Malcolm X / MLK, AR): 3 full-width rows of 30px, no word breaks, no horizontal scroll. Desktop 1366x768 unchanged (3 across, no page scroll). |

### Final count after the re-test
- Section 1-5 first test: 68 PASS, 1 FAIL (G30). G30 (no page scroll at 1366x768) is now PASS (RT1-RT3).
- Re-test rows RT1-RT13: 13 PASS.
- **Final: 82 PASS, 0 FAIL, 0 PENDING** (82 criteria). Open: BUG-H-04 and BUG-H-05, both Minor.

### Verdict after fix loop 1: **READY FOR PO**
No functional or layout criterion fails. The owner should still handle BUG-H-04 before committing, and may decide whether BUG-H-05 needs a second fix loop or can wait.

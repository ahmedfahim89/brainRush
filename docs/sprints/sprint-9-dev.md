# Sprint 9: Final round with wagers, read aloud (US-44, US-48, D-48): developer note

Branch `sprint-9`, 2026-11-02. Plan: `docs/sprint-plan.md` "Sprint 9 — Final round with wagers, read aloud", tasks 1-8, under the Epic E17 common rules. Owner decision D-48 (FU-22): a contestant may wager from 0 up to **their score or the largest enabled point value, whichever is higher**. The limit has no literal anywhere:
- the largest value is `largestPoints(g)` = `Math.max(...game.points)`, the board's point values, which the server sends as the enabled ones when the game starts;
- the limit is `wagerLimit(g, score)` = `Math.max(score, largestPoints(g))` in `js/game.a5e62052.js`.

On the local DB the enabled values are 100-500 (600 is disabled), so the tests below show 500.

**No migration.** `final_round_enabled` is a key/value row in `settings`, like `banner_enabled` and `ads_enabled`: a missing row reads as `null` and counts as off. Admin writes the row on the first **Save settings**.

## Stories implemented
- **US-44 Final round with wagers.**
  - **Setting.** Admin > Game settings has "Final round with wagers before the results" (off by default). `api/settings.php` validates it as 0 or 1 (anything else → 400). The game takes the setting into the game at Start (`game.finalRound`), like `helpers_enabled`: a game already running keeps what it started with.
  - **Offer.** With the setting on, **End Game** (after the D-09 confirm while cells are left) and **End Game and show results** on a full board (no confirm, D-26) open the new `#screen-final` instead of Results. It shows "One last question before the results…", the rule with the board's largest value ("…up to their score or 500, whichever is higher"), **Play final round** and **Skip to results**. Skip goes straight to Results. With the setting off, End Game goes to Results as before.
  - **Category first.** **Play final round** draws the question with `POST questions.php?random=1` (the Swap draw: board questions excluded, unseen first). The screen then shows only its **category**; the question text is not put on the page until **Show the question**. A failed draw shows the error inline with Skip still available.
  - **Wagers, one at a time, masked.**
    - The contestants are listed with their score and **Locked** / **Now** / **Waiting**; no amount is ever shown.
    - The one on turn (setup order) gets "Ann, enter your wager", "From 0 to 900. Everyone else, please look away from the screen.", a masked field, **Show** (reveals the digits to the person typing; masked again for the next one) and **Lock in wager** (Enter works).
    - A wager is a whole number from 0 to `wagerLimit`. Anything else gives "Enter a whole number from 0 to 900." (the typed value is never repeated). Arabic-Indic digits count.
    - Once everyone is locked in: "All wagers are locked in." and **Show the question**.
  - **The question.** It opens on the normal question screen: "Final round – Flags", picture, Arabic first with the language button, the timer with Pause/Reset, Show Answer, Report (US-42) and the speaker (US-48). There are no helpers and no double score.
    - The scoring panel reads "Final round" with its own hint. Each row has **✓ Correct** / **✗ Wrong** without amounts.
    - A mark adds or subtracts that contestant's wager and only then shows it ("+45" / "−1200"). Several contestants may be Correct.
    - Each contestant is marked once. **See results** is enabled once everyone is marked; Results use the usual ranking and the D-10 tie wording.
  - **Refresh.** Everything is saved with the game: `game.final` = `{stage, category, question, wagers, marks, answerShown, lang}`, stage `offer` → `wager` → `question` → `done`. A refresh brings back the offer, the wagers so far (the same contestant on turn), the question with its marks, or Results. The question's timer restarts at full length, like a board question (D-04).
  - **Saved version (D-28).** `STORAGE_VERSION` is now **4**.
    - A version 3 save (and v2 / v1 through the existing steps) is upgraded with `finalRound: false, final: null`, so that game goes on and ends without a final round.
    - Version 4 saves are validated strictly: a known stage; real contestants; wagers in setup order; each wager within the D-48 limit at the time it was entered (a marked wager is taken back out of the score to check); marks only once every wager is in; a final round only with `finalRound` true. Anything else, like any unknown version, is discarded to a fresh Setup without a JS error.
  - **Android app (US-40).** Back on the offer returns to the board (undoes End Game). Back during the wagers asks "Stop the final round and show the results? The wagers are dropped and no score changes."; OK → Results. Back on the final question asks "…Players not scored yet keep their score."; OK → Results with the marks so far.
- **US-48 Read the question aloud.**
  - **Speaker.** A **🔊** button sits in the question panel's top right corner, next to Report, so it adds no height. It is on every question screen: board, final round, Streak and Daily Challenge. It reads the question in the language shown, and the choices when they are shown ("A: Paris", …): the 3 choices helper on a board question, and always on a Streak or Daily question. While it reads, it is gold (`aria-pressed="true"`, tooltip "Stop reading"), and a **second click stops** it.
  - **No voice → hidden.** The button shows only when the browser has a voice for the shown language. It is checked again when the language is switched and when the browser's voice list arrives late (`voiceschanged`; Chrome fills it after load). Headless Chrome on this PC has 3 English Microsoft voices and no Arabic one, so an Arabic question has no speaker until it is switched to English.
  - **Timer.** Reading never touches the timer.
  - **Stops** on a second click, a language switch, Back to Board, Next or any other screen (`showScreen`), the double-score popup and a refresh or leaving the page (`pagehide`).
  - **"Read questions automatically"** (setup screen, under the timer, off by default) starts the reading when a question opens. On a double-score cell it starts after **Let's play**. A restored answered Streak/Daily question is not read again. The checkbox is hidden when the browser has no speech synthesis at all.
  - **Voices.** `js/speech.js` picks a voice per language: a voice on the device first (an online voice would send the text to the browser maker), the system default before others.
  - **Where the preference lives.** As the plan assumed, it is an on-device preference (`localStorage` `brainrush.readAloud` = `'1'`), not an admin setting. The code made this the natural fit: whether reading helps depends on the device's voices and the room, and an admin setting would need a settings row and would apply to every device. No migration.

## Files created / changed
- `api/settings.php`: `final_round_enabled` in `SETTING_RULES` (0-1) and the header comment. No other API change.
  - `questions.php?random=1` already returns everything the round needs: `{category: {id, name}, points, question}`, with the answer and the Arabic version. The final round does not use the drawn `points` or the wrong options. **No server change was needed.**
- `admin.html` + `js/admin.5bbca9b4.js` (edited in place): the checkbox, its hint, filling it (`=== 1`, a missing row = off) and sending it with **Save settings**.
- `index.html`:
  - the "Read questions automatically" field in the Timer fieldset;
  - `#question-main`, with a `.question-tools` wrapper for `#speak-btn` and the existing `#report-btn`;
  - ids `scoring-hint` (and the comment) on the scoring panel;
  - the new `#screen-final` (offer, category, wager list, wager form, ready);
  - `<script src="js/speech.js">` before `game.js`.
- **New** `js/speech.js`: `window.BrainRushSpeech = { supported(), hasVoice(lang), speak(parts, onDone), stop(), onVoicesChanged(cb) }`. It has no game logic.
- `js/game.a5e62052.js` (edited in place):
  - **Saved game.** `STORAGE_VERSION` 4, the v3 → v4 step in `migrateSaved()`, `isValidFinal()` / `isValidWager()`, and `isValidScreenFor()` for the `final` screen and the final question.
  - **Game flow.** `SCREENS` gains `final`. `endGame()` offers the round, and `showResults()` is new. `restoreGame()` handles the final screens.
  - **Shared question code.** `renderTextAndAnswer()` was split out of `renderQuestionLang()`. `renderAnswerState(shown)` now takes a parameter. `setScoringPanelTexts()` and `onBackClick()` are new. `showAnswer()`, `toggleLang()`, `onResetClick()`, `goBack()` and `reportTarget()` know the final question.
  - **New section "Final round (US-44, D-48)".** `largestPoints()`, `wagerLimit()`, `openFinalOffer()`, `renderFinal()`, the wager list, turn and masking, `onWagerSubmit()`, `onFinalPlay()` / `onFinalSkip()` / `onFinalOpen()`, `showFinalQuestion()`, `renderFinalRows()` / `markFinal()`, `finishFinal()`, `onFinalLeave()` / `onFinalBack()`.
  - **New section "Read aloud (US-48)".** `speechParts()`, `updateSpeakButton()`, `startReading()` / `stopReading()`, `onQuestionShown()`, `autoRead()`, `initReadAloud()`. `showQuestion(holdReading)` holds the reading while the double-score popup opens first.
- `css/style.56810955.css` (edited in place):
  - `.question-tools` now holds the absolute position that `.report-btn` had.
  - The heading padding for `.can-speak` and for `.can-report.can-speak`.
  - `.speak-btn`, `.read-aloud-field`, the final round styles and `.srow-wager`.
  - Phone rules: a 48px speaker and checkbox row, and the wager field on its own line with Show and Lock in under it.
- `how-to-play.html`:
  - a new "Final round with wagers" section, in the contents after "Ending the game", with a worked example (the board's top value of 500 is stated as an example, as the other examples state points);
  - two speaker bullets in "Answering a question".
- `privacy.html`: one paragraph in "In your browser":
  - the wagers stay in the saved game;
  - the read-aloud choice stays on the device;
  - reading uses the device's voices, and online voices of some browsers get the question text.
- `llms.txt`: the speaker and the final round.
- `README.md`: the final round under End Game, item 10 Read aloud, Refresh-safe (version 4), and the Admin setting.
- `docs/spec.md`: file structure (`js/speech.js`), the API note, Game page items 8-9, and the Admin settings panel.
- `docs/deploy-hostinger.md`: the Sprint 9 step in section 8 (no migration, upload list with `js/speech.*.js`, smoke check).

Not touched: `sql/` (no schema change, so no change to `sql/schema.sql` / `sql/schema-hosted.sql`), `api/questions.php`, `.htaccess`, `sw.js`, `terms.html`.

## Asset names (owner: before and after the commit)
- `js/game.a5e62052.js`, `js/admin.5bbca9b4.js` and `css/style.56810955.css` were edited **in place under their current names**, so the local Chrome test needs no rename.
- `js/speech.js` is a **new, unhashed** file. `.githooks/hash-assets.sh` only renames files that `git ls-files` lists, so **`js/speech.js` must be staged (`git add js/speech.js`) before the commit**. The pre-commit hook then renames it to `js/speech.<hash>.js` and rewrites the reference in `index.html`. If it is left unstaged, it is not committed and the live page would 404 on it (the game would still run, without the speaker).
- After the commit, check that `index.html` points at the new `js/game.*.js`, `js/speech.*.js` and `css/style.*.css`, and `admin.html` at the new `js/admin.*.js` (FU-16). Deploy: code only (no migration), then purge the CDN.

## How to run / test
1. MariaDB running; `C:/xampp/php/php.exe -S localhost:8000` from the project root.
2. Admin (`http://localhost:8000/admin.html`) → Game settings → tick **Final round with wagers before the results** → Save.
3. Game: start a new game with 2-6 players, score a few questions (or use **+ / −**), **End Game** → **Play final round**. Try a wager above the limit, exactly the score, 0, and one for a player at 0 or below (up to the largest value). Refresh during the wagers and on the question. Mark everyone, then **See results**. Also try **Skip to results**, and a full board.
4. Read aloud: open an English question and click **🔊**; click again to stop. An Arabic question has no speaker on a Windows PC without an Arabic voice. Tick **Read questions automatically** on setup and open a question.
5. To return to the starting state: untick the setting and save, or delete the row (`DELETE FROM settings WHERE name = 'final_round_enabled';`).

## Verification done
- `php -l api/settings.php` (PHP 8.0.30): no syntax errors. `node --check` on `js/game.a5e62052.js`, `js/admin.5bbca9b4.js` and `js/speech.js`: OK.
- **API** (curl against a temporary `php -S localhost:8019`, stopped afterwards):
  - GET on the DB without the row: `"final_round_enabled":null`.
  - PUT `2`, `"yes"` or `-1` → 400 "final_round_enabled must be a whole number between 0 and 1", nothing stored.
  - PUT `1` → 200, row stored.
- **Headless system Chrome (Playwright; scratch scripts outside the repo, in `%TEMP%\br9`, not committed).**
  - **Final round flow, 50/50 passed** (1366x768, players Ann 900, Bob 0, Cy −200 via **+ / −**):
    - the save is v4 with `finalRound` true;
    - the D-09 confirm text is unchanged;
    - the offer names 500 (600 is disabled) and survives a refresh;
    - the category is shown and the question text is nowhere on the page; the drawn question is not one of the board's;
    - Ann's limit is 900 (her score). 901, `12.5` and `-5` are blocked with an error that doesn't repeat the input; 900 is accepted;
    - the field is masked (`-webkit-text-security: disc`, type text), and Show / masked again works;
    - after a refresh mid-wager, Bob is still on turn. His limit is 500; 501 is blocked; `٠` (Arabic zero) gives 0. Cy at −200 gets 500;
    - Show the question: heading "Final round – Egyptians", no helper chips, buttons without amounts, See results disabled, the question in the seen list;
    - Ann Wrong → 0 with "−900". After a refresh mid-question her mark is kept. Bob and Cy are both Correct (Cy 300);
    - Results "Cy wins!" (also after a refresh); the save has stage `done`;
    - full board → the offer with no confirm (D-26); **Skip** → Results with `final` null; tie text "It's a tie between Ann and Bob" (D-10);
    - Cancel on the D-09 confirm stays on the board. A tie created by the final round uses the D-10 text;
    - setting at 0 → End Game goes straight to Results.
  - **Old and corrupt saves, 9/9:**
    - a v3 save on the board is upgraded to v4 (`finalRound` false), and End Game → Results;
    - a v3 save on an open question is restored;
    - a v2 save is upgraded through v3 to v4 with helpers;
    - version 5, a wager above the limit, a final round with `finalRound` false, and a final question with a missing wager are all discarded to Setup;
    - no JS errors.
  - **Layout, 6 contestants:**
    - **1366x768:**
      - The content bottoms are 300px (offer), 462px (wagers) and 401px (all locked); no horizontal scroll.
      - The final question (random) with all 6 marked and the answer shown is exactly 768 high, with 50px rows (the same height as board rows).
      - With injected questions, answer shown: the 216-character text question is 768 high in English and Arabic.
      - The two longest Landmarks answers (Big Ben, Muhammad Ali Mosque) are 796 in English and 768 in Arabic. They are **796 as board questions too, with or without the speech feature**: this is the existing D-35 case, not this sprint.
    - **375x812 (touch):** no horizontal scroll on the offer, the wagers, the question (before and after marking) or Results. The wager content ends at 690px. The wager field is 52px tall with a 23.8px font, and Show and Lock in are 48px. The scoring buttons are 60px. The read-aloud row on setup is 48px.
    - Two of my first-run checks failed on the test script, not on the code: a "< 50px" row threshold, where board rows are also 50px, and the phone checkbox measured after setup was hidden. Re-measured as above.
  - **App mode (`?source=twa`), 5/5:**
    - Back on the offer → board, `final` null;
    - Back on the wagers asks: Cancel stays, OK → Results without a round;
    - Back on the final question asks, then Results: Bob, unscored, keeps 0, and Ann keeps her +100.
  - **Read aloud.** A recording stub of `speechSynthesis` was used; the real getVoices list is kept unless a test replaces it. **28/28:**
    - The checkbox is shown and off by default, and nothing is read on open.
    - On an Arabic question with no Arabic voice the speaker is hidden; after switching to English it shows. A click reads the question with "Microsoft David", `en-US`, and the button is pressed.
    - **The timer went 30 → 28 over 2.1 s while reading.**
    - A second click cancels; the end of the reading releases the button.
    - With the 3 choices helper it reads the question plus "A: DeepMind", "B: Mistral AI", "C: OpenAI".
    - Back to Board and `pagehide` cancel the reading.
    - Automatic reading on: it reads when a question opens. An Arabic question without a voice reads nothing, and the double cell reads nothing while the popup is open. The choice persists.
    - No voices: hidden. Then a late `voiceschanged` makes it appear. A (fake) Arabic voice: shown for Arabic and read with that voice. A language switch stops the reading.
    - Streak: question + 3 choices; End run stops it. Final question: read.
    - Without `speechSynthesis` at all, both the checkbox and the speaker are hidden.
    - No page errors.
  - **Real speech (no stub):** in a Streak question, a click → `start`, and `speechSynthesis.speaking` is true. A second click → `error: interrupted`, released. A third click read all 4 parts to `end` within 20 s, and the button was released.
  - **Regression, 10/10:**
    - Daily Challenge: the speaker reads each question with its 3 choices, and the result screen is reached.
    - Admin: the checkbox shows the DB value. Unticking and saving stores 0, a reload shows it off, and ticking again stores 1; the other settings are unchanged.
  - **Heading check:** the longest category ("Cartoons & Childhood") on the double cell with both the speaker and Report: 1366x768 is still 768 high, and the "×2 Double score" badge wraps to the second line, as it already did with Report alone. On the phone the heading takes 3 lines (94px); the phone question screen scrolls anyway.
  - **DB without the row** (row deleted at the end): GET gives `null`; a new game has `finalRound` false and End Game → Results; the Admin checkbox is unticked; no errors.
- **Cleanup:** back to the state found.
  - The `final_round_enabled` row is deleted, and the settings are as found (banner text byte-identical, checked by HEX).
  - `logs/game-2026-11-02.log` was restored from the copy taken before the tests (51 bytes, 1 line).
  - `streaks` has ids 1, 8, 9 and 10, AUTO_INCREMENT 11 (no run of 1 or more was saved). `question_reports` has only id 1, AUTO_INCREMENT 2.
  - `daily_challenge` has today's 3 rows only (the Daily run read them; no new rows). `questions` AUTO_INCREMENT is 1719.
  - The test server was stopped. MariaDB is left running.

## Decisions made (for the PO)
1. **The setting is taken at Start**, like `helpers_enabled`, and saved in the game. Turning it on mid-game does not change a running game; the Admin hint says "in new games". The other option, reading it at End Game, would add a request and a failure path to End Game.
2. **"Largest enabled point value" = the largest value on this game's board.** That is the enabled values when the game started (the board payload), so it cannot change under a running game and needs no request.
3. **The question is drawn when Play is clicked**, before the wagers, so the category can be shown first. The question text stays off the page until **Show the question**.
4. **Several contestants can be Correct** on the final question (TV style, everyone answers on paper), unlike D-08 on the board. Each is marked once, and the amount appears only once marked.
5. **See results waits until everyone is marked** ("every contestant is scored once"). On the website there is no way to stop the round half-way; Android Back offers it with a confirm (D-43).
6. **The masking** uses `-webkit-text-security` on a text field, so Chrome does not offer to save a "password". A browser without it gets a password field. **Show** helps the person typing avoid a typo, because a locked wager cannot be changed.
7. **The final question's timer restarts at full length after a refresh** (D-04, same as board questions). The wagers and marks survive, as US-44 asks.
8. **The final question has no helpers and no double score**; Pause, Reset, Show Answer, the language button and Report work as on the board.
9. **The read-aloud preference is on-device** (the plan's assumption holds; see US-48 above). The checkbox sits in the setup Timer box, the setting nearest to "how a question is played".
10. **The speaker reads choice letters as "A: …"** in both languages, matching the screen.

## Known limitations
- **Speech needs a click first.** Chrome lets a page speak only after the user has clicked on it, so after a refresh on an open question the automatic reading may stay silent until the speaker is clicked. Opening a question by clicking a cell counts as a click.
- **No Arabic voice on many Windows PCs:** the speaker is hidden on Arabic questions there (as US-48 accepts). Voice quality and speed vary by device.
- **Masked dots show how many digits** were typed. The wagers are in the browser's saved game (local storage), so a determined player with DevTools could read them; this is the same trust level as the rest of a shared-screen game.
- **A locked wager cannot be changed**: Show exists to check it first.
- **On a phone the speaker and Report narrow the heading**, so long category names wrap one line earlier (the question screen scrolls on phones already). At 1366x768 the height is unchanged.
- **The random draw's 409** ("There is no other question left to swap in.") would show inside "Could not load the final question: …". It is reachable only when the whole bank, minus the board, is empty. The wording is from the Swap helper; I left the server unchanged.
- **Final rounds are not written to the game log** (it logs started games only).
- **Deploy guide line 1:** `docs/deploy-hostinger.md` line 1 had a stray table row (`| js/ (whole folder, including js/share.*.js) |`) before the title, from an earlier change. I left it, but the coordinator has since moved it back into the upload table and added `js/speech.*.js` there (see Fix loop 1).

## Fix loop 1

Fixes for the two Minor bugs in `docs/sprints/sprint-9-test-report.md`.

- **BUG-9-01: the game settings were read when Setup loaded, not when Start Game was clicked.**
  - `onStart()` in `js/game.a5e62052.js` now reads `settings.php` again, in parallel with the board request, through the new `refreshStartSettings(s)`. Both `final_round_enabled` and `helpers_enabled` are updated from that answer, so the game really takes them at Start, as decision 1 and the Admin hint say.
  - `refreshStartSettings()` never rejects. If the request fails or the answer is not a JSON object, it keeps the values Setup loaded, so the start never breaks because of it. The start still waits only for the slower of the two requests.
- **BUG-9-02: at 375x812 a final-round scoring row grew from 74 to 129 px when marked.**
  - `renderFinalRows()` now puts the wager and the score in one `.srow-tally` block.
  - On wide screens it sits inline as before ("+45 45").
  - In the phone rules it is a column: the wager is small (0.8rem) above the score. A mark therefore adds no width, and Correct and Wrong stay side by side.
- **Deploy guide (coordinator):** the stray first line of `docs/deploy-hostinger.md` was moved back into the upload table, and `js/speech.*.js` was added to it. I did not edit that file in this loop.

Re-check: `node --check js/game.a5e62052.js` OK. I ran a temporary `php -S localhost:8019` (stopped afterwards) and headless system Chrome with a scratch script outside the repo. **13/13 passed.**
- **BUG-9-01:**
  - Setup was loaded with the final round and helpers on; then `PUT settings.php` turned both off; then Start. The saved game has `finalRound: false` and `helpersOff: true`, and End Game goes to Results.
  - The reverse (both turned on after Setup loaded) gives `finalRound: true`, helper chips on a question, and the offer at End Game.
  - With `settings.php` aborted at Start, the game starts with the values Setup loaded. With a 500 HTML answer it also falls back to the loaded value (off).
- **BUG-9-02 at 375x812, 6 contestants, wagers +1400, −500, +500, −499, +0, −500:**
  - Row heights before and after marking are 74 px each, unchanged.
  - The buttons are 60 px tall, and Correct and Wrong are on the same line in every row.
  - Nothing is clipped (no element's scrollWidth exceeds its clientWidth), and there is no row or page horizontal scroll. The offer has no horizontal scroll either.
- **Regression:**
  - 1366x768, 6 contestants, all marked and the answer shown: the page is exactly 768 high and every row is 50 px.
  - Setting off: End Game goes to Results.
  - No console or page errors. The only console lines from the deliberately aborted or 500 settings requests were filtered out of this check.
- **Seen, not changed:** on the phone a long name such as "Alexandria Team" breaks mid-word in its name chip. It does so before the row is marked too, and the board's scoring rows behave the same way.
- **Cleanup**, back to the state the tester recorded:
  - no `final_round_enabled` row, and every settings value byte-identical by HEX;
  - `logs/game-2026-11-02.log` restored (51 bytes);
  - `streaks` ids 1, 8, 9 and 10, AUTO_INCREMENT 11;
  - `question_reports` only id 1, AUTO_INCREMENT 2;
  - `daily_challenge` today's 3 rows;
  - `questions` 869 rows, AUTO_INCREMENT 1719;
  - `point_values` 100-500 enabled and 600 disabled.

## Rename to Shoot Your Shot (D-50)

Owner change request, recorded as D-50. Everything players and hosts see now calls the final round **Shoot Your Shot** and the amount a **bet**. Rules, code identifiers (`finalRound`, `final_round_enabled`, `game.final`, `wagers`, the `final-*` ids and CSS classes) and the saved-game version (4) are unchanged. Only text changed, so no version bump.

**Strings changed** (old → new):
- **Game: offer** (`index.html`, `js/game.a5e62052.js`)
  - Title: "Final round" → "Shoot your shot?" (`renderFinal()` sets it per step).
  - Lead: "One last question before the results. Everyone wagers points on it: a right answer wins the wager, a wrong one loses it." → "One last question before the results, and everyone bets on it. Get it right and win your bet, get it wrong and lose it."
  - Rule: "Each player wagers from 0 up to their score or 500, whichever is higher. The category is shown before the wagers." → "Each player can bet from 0 up to their score or 500, whichever is higher. You see the category before you bet."
  - Button: "Play final round" → "Take the shot". "Skip to results" and "Loading..." are unchanged.
  - Error: "Could not load the final question: …" → "Could not load the question: …".
- **Game: bets**
  - Title: "Final round" → "Shoot Your Shot".
  - List label (aria): "Wagers" → "Bets".
  - Chips: "✓ Locked" → "✓ Bet locked", "Now" → "Your turn"; "Waiting" is unchanged.
  - Prompt: "Ann, enter your wager" → "Ann, what's your bet?".
  - Hint: "From 0 to 500. Everyone else, please look away from the screen." → "Your bet (up to 500). Everyone else, look away!".
  - Button: "Lock in wager" → "Lock in bet"; "Show" is unchanged.
  - When all are in: "All wagers are locked in." → "All bets are in!". "Show the question" is unchanged.
  - The error "Enter a whole number from 0 to 500." is unchanged (it never named the wager).
- **Game: question**
  - Heading (also the Report label): "Final round – Flags" → "Shoot Your Shot – Flags".
  - Scoring title: "Final round" → "Shoot Your Shot".
  - Hint: "… Correct adds their wager, Wrong subtracts it. Score each one once, then see the results." → "… Correct wins their bet, Wrong loses it. Mark each one once, then see the results."
  - Button labels (aria): "…, plus/minus their wager" → "…, plus/minus their bet".
  - Live status: "…, wager 300, …" → "…, bet 300, …".
- **Game: Android Back confirms**
  - "Stop the final round and show the results? Players not scored yet keep their score." → "Stop Shoot Your Shot and show the results? Players not marked yet keep their score."
  - "Stop the final round and show the results? The wagers are dropped and no score changes." → "Stop Shoot Your Shot and show the results? The bets are dropped and no score changes."
- **Admin** (`admin.html`; `js/admin.5bbca9b4.js` has no visible text for it, so it is unchanged)
  - Label: "Final round with wagers before the results" → "Shoot Your Shot: a last question with bets before the results".
  - Hint: → 'When on, End Game asks "Shoot your shot?" in new games ("Take the shot" or "Skip to results"). Each player can bet from 0 up to their score or the largest point value, whichever is higher.'
- **`how-to-play.html`**
  - Contents link and section: "Final round with wagers" (`#final`) → "Shoot Your Shot" (`#shoot-your-shot`). Nothing else linked to `#final`.
  - The text uses "bet": "Can bet up to" and "Bets" in the example table, "Shoot your shot?" / "Take the shot", "whose bet is locked".
- **`privacy.html`:** "The final round wagers are saved…" → "The bets of Shoot Your Shot are saved…".
- **`llms.txt`:** "an optional final round: everyone secretly wagers points" → 'an optional "Shoot Your Shot" round: everyone secretly bets points'; the guide line says "Shoot Your Shot".
- **`README.md`, `docs/spec.md`, `docs/deploy-hostinger.md`:** the same names and labels. The spec's item 8 notes that the code keeps `final` / `wager`. `docs/spec.md` had LF line endings when I came back to it after the break; I converted it back to CRLF.

**"wager" left in the user-facing files** (case-insensitive grep), each invisible to players:
- `index.html`: an HTML comment, and the element ids, classes and `for` / `aria-describedby` / `aria-controls` references (`final-wager-*`).
- `admin.html`: an HTML comment.
- `privacy.html`: an HTML comment.
- `js/game.a5e62052.js`: comments, identifiers (`wagerLimit`, `WAGER_PATTERN`, `finalWager*`, `f.wagers`, the stage `'wager'`, `srow-wager`) and the local variable `wager`. All the text it shows says "bet".
- `docs/spec.md`: the saved-game keys `wager` / `wagers` in backticks and the note that the code keeps them.
- `how-to-play.html`, `llms.txt`, `README.md` (text) and `docs/deploy-hostinger.md`: none.

**Re-check** (temporary `php -S localhost:8019`, stopped afterwards; headless system Chrome with a scratch script outside the repo): **22/23 passed.** The one failure is the 404 for `/favicon.ico` that Chrome asks for by itself when it shows the plain-text `llms.txt` (a test artefact; the game pages had no errors).
- **1366x768 and 375x812, 6 contestants, one at 1400** (every text above checked exactly):
  - The offer buttons are one line (55 px), with no horizontal scroll.
  - The bet chips are the same height before and after "✓ Bet locked" (37 px desktop, 35 px phone, so no wrap).
  - The "Lock in bet" button is 52 px (desktop) and 48 px (phone). The bet screen ends at 444 px (desktop) and 569 px (phone).
  - Final question: rows are 50 px (desktop) and 74 px (phone), unchanged after marking. The desktop page is exactly 768 high, with no horizontal scroll.
- **App mode:** both Back confirms show the new texts.
- **Admin:** the new label (44 px) and hint, with no "wager".
- **Guide:** the contents link goes to `#shoot-your-shot` (heading "Shoot Your Shot", scrolled into view); `#final` is gone; no "wager" in the page text.
- **Other pages:** no visible "wager" in the text of `index.html`, `admin.html`, `privacy.html` or `llms.txt`.

**Data:** when I came back after the break, the DB had `final_round_enabled` = 1 and `logs/game-2026-11-02.log` was 589 bytes, from use after fix loop 1. I kept a copy of that log outside the repo (`%TEMP%\br9\log-found-2026-11-03.log`). I then restored the state the tester recorded:
- no `final_round_enabled` row, and the other settings byte-identical;
- the log back to its 51-byte line;
- `streaks` 1, 8, 9 and 10 (AUTO_INCREMENT 11);
- `question_reports` 1 (AUTO_INCREMENT 2);
- `daily_challenge` the 3 rows of 2026-11-02;
- `questions` 869 rows (AUTO_INCREMENT 1719);
- `point_values` 100-500 enabled and 600 disabled.

No log file for 2026-11-03 was created.

## Tiebreaker change (D-51) and Golden Goal name

Owner change loop, 2026-11-03: D-50 (amended), the new D-51, the amended US-44 and the approved plan (`ask-the-product-owner-agent-scalable-pike.md`). The round is now **Golden Goal ⚽**, a tiebreaker; the amount is still a **bet**. The D-48 limit, D-49 and the saved version (4) are unchanged. Version 4 was never released, so it was extended without a bump.

**Rules as built** (`js/game.a5e62052.js`):
- **When.** End Game (after the D-09 confirm) and the full-board button (no confirm, D-26) offer Golden Goal only when `game.finalRound` is on **and** `isTiedAtTop(g)`: 2 or more contestants share the top score, at any value, 0 and negative included. Otherwise they go straight to Results.
  - `isTiedAtTop()` uses the new `topContestants(g)`, which `renderResults()` and the US-46 share text now use too. So there is one D-10 rule and no second ranking.
- **A round.** Everyone bets and is marked, as before. Once everyone is marked, the big button reads **See results**, or **Continue** while the top is still shared.
  - **Continue** (`nextFinalRound()`) opens the next round's offer: "Still tied! Golden Goal ⚽ again?", naming who is still level and on what score.
  - **Go for goal** draws a new question with `exclude` = the board's question ids plus every earlier final question (`final.usedIds`), the same way the board and Swap avoid repeats. Bets start fresh from the current scores, with the same D-48 limit.
  - Headings: round 1 "Golden Goal ⚽ – Flags", then "Golden Goal ⚽ – round 2 – Flags" and so on. The bet screen title and the scoring panel title carry the counter too.
- **No question left.** A 409 from `questions.php?random=1` ends the game on Results with the D-10 tie wording. Other errors stay on the offer with "Could not load the question: … Try again, or skip to the results."
  - `apiCall()` now puts the HTTP status on its errors (`err.status`), so a 409 can be told apart from a network or server error. No server change.
- **Skip.** Results with the tie wording, in any round.
- **Saved game.** `final.round` (1, 2, …) and `final.usedIds` (one question id per round drawn so far; the offer of round N has N−1).
  - Validated: whole numbers, distinct ids, the count matching the round, the current question among them, and an offer only while the top is shared. Anything else is discarded to Setup, as before.
  - A v4 save from before this change (no `round`) is read as round 1.
  - A refresh in round 2+ restores the offer, the bets or the question with its marks.
- **Android Back.**
  - The first offer goes back to the board (undoes End Game).
  - A repeat offer goes to Results, as Skip, because the board is over.
  - The bets of any round ask "Stop Golden Goal and show the results? The bets of this round are dropped and no score changes."
  - The question of any round asks "Stop Golden Goal and show the results? Players not marked yet keep their score."
- **The ⚽ is decorative.**
  - In markup it sits in `<span aria-hidden="true">` (`setGoalText()` in JS; the static title in `index.html`; the Admin label; the guide heading and contents link).
  - It is never in an aria-label, the live status, the Report label ("Golden Goal – round 2 – Flags") or a confirm. Screen readers say "Golden Goal".

**Strings changed** (the D-50 list as the checklist; Shoot Your Shot → Golden Goal):
- **Offer.**
  - Title: "Shoot your shot?" → "It's a tie! Golden Goal ⚽?"; a repeat round: "Still tied! Golden Goal ⚽ again?".
  - Lead (now in JS, `#final-lead`): "Ann and Bob are tied for first on 300. One more question decides it: everyone bets, get it right and win your bet, get it wrong and lose it."
  - Repeat lead: "Ann and Bob are still level on 200. Round 2 brings a new question, and everyone bets again from their current score."
  - Button: "Take the shot" → "Go for goal" ("Skip to results" and the rule line are unchanged).
- **Bets.** The title "Shoot Your Shot" → "Golden Goal ⚽" ("… – round 2"). "Sara, what's your bet?", "Your bet (up to 500). Everyone else, look away!", "Lock in bet", "✓ Bet locked", "Your turn", "Waiting" and "All bets are in!" are unchanged.
- **Question.**
  - Heading: "Shoot Your Shot – Flags" → "Golden Goal ⚽ – Flags" ("Golden Goal ⚽ – round 2 – Flags").
  - Scoring title: → "Golden Goal" ("Golden Goal – round 2").
  - Hint: "… Mark each one once, then see the results." → "… Mark each one once."
  - The button gains "Continue". The Report label is "Golden Goal – …".
- **Confirms:** "Stop Shoot Your Shot …" → "Stop Golden Goal …"; the bets one now says "The bets of this round are dropped…".
- **Admin.**
  - Label: → "Golden Goal ⚽: a tiebreaker question with bets, offered only when players are tied for first".
  - Hint: → 'When on, and 2 or more players are tied for first when a new game ends, End Game asks "It's a tie! Golden Goal?" ("Go for goal" or "Skip to results"). Everyone bets from 0 up to their score or the largest point value, whichever is higher. Rounds repeat while the tie lasts. With no tie, the results show as usual.'
- **`how-to-play.html`:** the section is now "Golden Goal ⚽" at `#golden-goal` (`#shoot-your-shot` and its link are removed; the contents link is updated). It covers tie only, everyone plays, Continue and the repeat rounds with a new question, the end when no question is left, and a new tie example.
- **`privacy.html`** (name only), **`llms.txt`** (a tiebreaker that repeats while the tie lasts), **`README.md`**, **`docs/spec.md`**, **`docs/deploy-hostinger.md`** (heading and smoke check: make a tie).

**Grep of the user-facing files** (case-insensitive; `index.html`, `admin.html`, `js/admin.5bbca9b4.js`, `js/game.a5e62052.js`, `how-to-play.html`, `privacy.html`, `llms.txt`, `README.md`, `docs/spec.md`, `docs/deploy-hostinger.md`):
- **"shoot":** one hit, "Troubleshooting" (a heading in the deploy guide), which is not the round.
- **"wager":** none visible or read by screen readers. The hits left are:
  - HTML comments in `index.html`, `admin.html` and `privacy.html`;
  - element ids, classes and the attributes that point at them (`final-wager-*`);
  - JS comments and identifiers;
  - the saved-game key names in `docs/spec.md`.

  The browser check below also found no "shoot" or "wager" in the visible text or aria-labels of the game, Admin, guide or Privacy pages.

**Checks** (temporary `php -S localhost:8019`, stopped afterwards; headless system Chrome with a scratch script outside the repo): **44/44 passed**, one of them a placeholder whose real check is A1. No console or page errors.
- **No tie:** End Game goes to Results (the D-09 confirm is unchanged); a full board goes to Results with no confirm.
- **Ties:**
  - 2-way (300/300/0): the offer's title, lead, buttons and rule are exact, and the screen-reader title is "It's a tie! Golden Goal ?". Skip gives "It's a tie between Ann and Bob".
  - 3-way at 0 and negative (−200/−200/−300): offered with the right names and score.
- **A tie broken in round 1:** "See results", then "Ann wins!", and the save has stage `done`.
- **Still tied, rounds 2 and 3:**
  - "Continue", then the repeat offer, saved as `{stage: offer, round: 2, usedIds: [1 id]}`.
  - Round 2 bet limits come from the current scores. A refresh mid-bets and mid-question kept round 2, the bets and a mark.
  - Heading "Golden Goal ⚽ – round 2 – Sports". Round 3's question was different from rounds 1 and 2 and not on the board, with `usedIds` holding 3 ids. The tie was broken in round 3, giving "See results" and "Ann wins!".
- **Labels:** the Report label "Golden Goal – Food & Drink" and the live status "Ann marked correct, bet 0, score 0" have no ball.
- **Draw errors:** a stubbed 500 stays on the offer with the message and Skip; a stubbed 409 gives Results with the tie and `final` null.
- **Saves:** a v4 save without `round` is read as round 1. `usedIds` not matching the round, and an offer without a tie, are discarded to Setup.
- **Setting off with a tie:** Results.
- **Android Back (`?source=twa`):**
  - first offer → board;
  - round 2 offer → Results with the tie;
  - round 2 bets: confirm, Cancel stays;
  - round 2 question: confirm, then Results, where the unmarked player keeps their score.
- **6 contestants (a 6-way tie at 0, two rounds):**
  - **1366x768:** the offer ends at 329 px and the bets at 462 px. The round 2 question is exactly 768 high, the heading "Golden Goal ⚽ – round 2 – Science" fits its panel, and rows stay 50 px after marking.
  - **375x812:** no horizontal scroll. The heading fits its panel, rows stay 74 px after marking, and buttons are 60 px.
- **Admin:** the label shows the ball, while the screen-reader text is "Golden Goal : a tiebreaker question with bets, offered only when players are tied for first"; the hint says "tied for first".
- **Guide:** the contents link goes to `#golden-goal` and scrolls there. `#shoot-your-shot` is gone. The text has no "shoot" or "wager", and it explains tie only and repeats.
- **Regression:** the Daily Challenge with the speaker (3 questions, result) and the Admin save (off, then on) pass 10/10.

**Data:** I recorded the state at the start of this loop and restored exactly it. The owner's data is kept:
- `final_round_enabled` = 1, all settings byte-identical by HEX;
- `logs/game-2026-11-02.log` byte-identical (653 bytes at the start of this loop);
- `daily_challenge`, `question_reports`, `questions` and `point_values` unchanged.

My tests created a `logs/game-2026-11-03.log`, which I deleted. A `streaks` row (id 11, a 5-character name, streak 20, 2026-11-03 01:03:40, AUTO_INCREMENT now 12) appeared during my run but not through my test server: its log has no Streak POST. It looks like the owner's own play on another server, so I left it.

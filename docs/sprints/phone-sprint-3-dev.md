# Phone Sprint 3: Golden Goal bets on phones (US-65): developer notes

Branch `phone-buzzer`, worktree `BrainRush-phone-buzzer`, on top of phone Sprints 1 and 2 (merged in `main`). Story US-65, decisions D-80 h, j (FU-117: bet limit = the Host control rule, D-48), k, l, m, p, s, ao, ap; US-44, D-48, D-51. Not committed.

## What was built

**Golden Goal in a Phone buzzer game (host)**
- **Go for goal** draws the question as before, then opens a **bet round** on the server (`start_bets`) with the category and every contestant's score.
  - The server works out each limit: D-48, the score or the board's largest point value, whichever is higher.
- **The wait screen** replaces the masked one-by-one entry. It shows:
  - the category and "**Waiting for players to bet (n/N)**";
  - each name with its score and **✓ Bet sent**, **Waiting** or **Waiting (no phone)**, never an amount;
  - **Continue without missing bets** (with a confirm that names the missing ones);
  - **Phones n/N**, which opens the share panel, so Release, rejoin and a late join work during the wait.
- The host polls `bets_status` every 1 s. It returns booleans only.
- **All bets in:** the question opens by itself (US-65 AC, plan task 3).
- **Continue without missing bets:** the question opens earlier, and each missing bet counts as 0 (D-80 k).
- **Either way:**
  - the bet round is closed on the server (`close_bets`);
  - the question opens through the Sprint 2 calls (`open_question`);
  - phones get the question and a text box, never the answer, and a picture stays on the host;
  - the **Answers from phones** panel lists the answers in arrival order;
  - the question closes at timer 0, Show Answer, Next round, See results, and Back/leave.
- **Deferred scoring (no leak through the scores):**
  - In a Phone buzzer game a mark records Correct / Wrong only. The score does not move, the row shows no bet, and the button stays disabled.
  - After the **last mark** the host asks for the amounts (`reveal_bets`, host token only). It fills every wager (missing = 0) and scores everyone at once as US-44: Correct adds, Wrong subtracts.
  - The rows then show "+437" / "−250" / "0", the button reads "Next round" or "See results", and the tie is checked on the new scores (D-51).
  - Until then no amount is on the host screen, in the host's network replies or in its saved game.
  - A failed reveal shows "Could not get the bets: … Trying again..." and retries every 3 s.
  - Leaving with Android Back during the question reveals first. The marked contestants get their bets; the unmarked keep their score, as in Host control.
- **Repeat round (D-51):** **Next round**, then the offer, then **Go for goal** opens a new bet round. The phones show a fresh, empty bet screen with the new score, range and "round 2".
- **Host refresh:**
  - during the wait: the same bet round resumes, with no new round, and the bets already sent are kept and counted;
  - during the question: the marks are kept, the phones' question comes back (a D-04 timer restart), and the bets are closed again in case that call was lost;
  - between the last mark and the reveal: the reveal runs on restore.
- **Back from the bet wait** (Android Back, confirm, then Results): the bet round is closed on the server, and a late bet gets 409.
- **New Game** closes the room (`close`). The phones then show "This game has ended." (D-80 s, deferred to here).

**The phone**
- **Offer:** the status line reads "Golden Goal: there is a tie at the top. Wait for the host."
- **The bet screen:**
  - "Golden Goal ⚽ (– round n)", "Category: …", "Your score: …";
  - "A whole number from 0 to N. Only you see it.";
  - a numeric box and **Lock in bet**.
- **Checks on the phone:** a whole number from 0 to its own limit, and Arabic-Indic digits are accepted. Outside the range it shows "Enter a whole number from 0 to N." and does not send.
- **Once sent:** "Bet locked: 437. Wait for the others." The form goes and the bet stays locked after a refresh (the server sends this phone's own amount back).
- **A bet after the close:** "Too late: the bets are closed, so your bet is 0."
- **The bets closed:** "The bets are closed. Your bet: X." or "You did not bet, so you play for 0."
- **The question:** the Sprint 2 view with the heading "Golden Goal ⚽ – Category", the line "Your bet: X", and no points.
- **After the question closes:** "Wait while the host marks the answers. Your bet: X."
- **After the reveal**, the phone's own result:
  - "Correct! You won your bet: +437."
  - "Wrong: you lost your bet: −250."
  - "Your bet was 0, so your score stays."
- **Results:** the **game over** card shows "Game over", "Sara wins!" or the D-10 tie line, and the final standings (shared scores share a rank; "you" is marked). The board and the scores list are hidden.
- **A room that is closed or has expired** (404 for a phone that was in the game): "**This game has ended.**", the standings it last had (when it had seen the results), and **Join another game**.
  - A code that never worked keeps "This game has ended or the code is wrong." on the code screen.
- **Language:** the whole flow works in EN and AR, right to left, with numbers isolated (D-60).

**Unchanged**
- **Host control Golden Goal:** masked entry, wagers scored at the mark, and 0 rooms calls (regression run below).
- **Tournament Golden Goal and Mokh Bot:** `phoneOn()` is false there, so none of the new branches run (regression run below).
- **Helpers in phone mode:** still governed by `phone_helpers_enabled` (D-80 ap). Golden Goal has no helpers anyway.

## API (`api/rooms.php`)

| Call | Auth | What |
|---|---|---|
| `POST ?action=start_bets` `{code, host_token, session, bet: {round, catName, catNameAr, scores[]}}` | host + current tab | New bet round `seq` (`b_seq = LAST_INSERT_ID(b_seq + 1)`). Limits = max(score, largest of the room's `state.points`). Idempotent: the same Golden Goal `round` while a round is still open returns its `seq`. 200 `{seq, version}`. |
| `GET ?action=bets_status&code=&seq=&session=` + `X-Host-Token` | host + current tab | `{seq, open, revealed, count, players: [{bet, joined}]}`. No number per contestant. |
| `POST ?action=close_bets` `{…, seq}` | host + current tab | `{closed, version}`; closing twice is harmless. |
| `POST ?action=reveal_bets` `{…, seq}` | host + current tab | Closes the round if it is still open, marks it revealed, then returns `{seq, amounts: [int or null]}` (null = no bet). Asking again gives the same answer. 404 for a round that does not exist. |
| `POST ?action=bet` `{code, device_token, seq, amount}` | device token | 201 `{seq, amount}`. 400 for anything but a JSON whole number from 0 to this contestant's limit (−1, 1.5, "12", "abc", null, limit + 1). 409 `reason: 'duplicate'` for a second bet. 409 `reason: 'closed'` when the round is closed or replaced. |
| `POST ?action=close` `{code, host_token, session}` | host + current tab | Deletes the room with its players, answers and bets. 200 `{closed: true}`. |
| `GET ?action=state` | device token | Also `bet`: this contestant's view of the last round `{seq, open, revealed, round, catName, catNameAr, score, limit, mine}`. The phone's own amount only, never another's. |

**Other server changes**
- **A bet is atomic:** `INSERT … SELECT … WHERE b_seq = ? AND b_open = 1`, so a close always wins over a bet in flight.
- **Versions:** a bet does not bump the version (like an answer). `start_bets`, `close_bets` and `reveal_bets` do.
- **The question payload** accepts `goal: true` with `points: null` and `goalRound`. A board question still needs points, and a Golden Goal question with points gets 400.
- **The state** has an optional `goal` stage (`offer` / `bets` / `question`), allowed only on the `final` screen.
- **A database without the new columns** gets the same 503 "Phone buzzer is not set up on this server yet." as one without the tables. SQLSTATE 42S22 / 1054 is now mapped too, checked on MariaDB.

## Data

- `sql/migrate-add-rooms.sql`, `sql/schema.sql` and `sql/schema-hosted.sql` (the two schema bodies are still byte-identical; checked with diff):
  - New table `room_bets`: `room_id`, `bet_seq`, `contestant`, `amount INT UNSIGNED`, `received_ms`. The primary key is (room, bet_seq, contestant), so there is one bet per contestant per round. Deleting the room deletes its bets.
  - New `game_rooms` columns: `b_seq`, `b_open`, `b_revealed` and `bet` (JSON: the round, the category, and the scores and limits per contestant).
- The migration adds the columns with `ADD COLUMN IF NOT EXISTS`.
- **Local:** `C:/xampp/mysql/bin/mysql.exe -u root brainrush < sql/migrate-add-rooms.sql`. It was run **twice** with no errors; `SHOW COLUMNS` and `SHOW CREATE TABLE room_bets` match.
- **Saved game (browser):** still version 5. The Golden Goal object of a Phone buzzer game may carry `betSeq`, `phoneSeq`, `revealed` and `timedOut`.
  - `isValidFinal` has a phone-only branch, chosen by `g.control === 'phone'` and not `phoneOn()`, because validation runs before the game is loaded: wagers stay empty until `revealed`, then every wager is present and ≥ 0.
  - Host control and tournament saves take the unchanged strict path.

## Files changed

| File | What |
|---|---|
| `api/rooms.php` | The 6 new actions, `bet` in the state, the `goal` question flag, the `goal` state stage, and 503 for missing columns. |
| `sql/migrate-add-rooms.sql`, `sql/schema.sql`, `sql/schema-hosted.sql` | `room_bets` and the bet-round columns. |
| `js/game.b9add461.js` | Golden Goal hooks (`renderFinal`, `refreshFinal`, `onFinalPlay`, `onFinalOpen`, `showFinalQuestion` timer, `showFinalAnswer`, `updateFinalRows`, `markFinal`, `finishFinal`, `nextFinalRound`, `onFinalLeave`, `onFinalBack`, `onResetClick`, `restoreGame`, `refreshQuestion`, `newGame`), all behind `phoneOn()` / `phoneBetsHidden()`. The Sprint 2 question calls now use `phoneHolder()` (the board question or the Golden Goal round), which behaves the same for board questions. New section "Phone buzzer: Golden Goal bets". `isValidPhoneFinal()`. `goal` in `phonePayload`. |
| `index.html` | `#final-phone` wait block (count, hint, message, Continue, Phones). |
| `css/style.0ba46723.css` | Wait block styles (theme tokens). |
| `join.html`, `js/join.e7f30eb8.js`, `css/join.9594bd94.css` | Bet card, bet line on the question, game over card, "This game has ended." screen. |
| `js/i18n.c8f82b64.js` | 12 host strings (`final.phone*`, `final.marked*`, `final.reveal*`) and 26 phone strings (`jb.*`, `over.*`, `join.ended*`, `join.again`, `join.status.goalOffer`, `jq.yourBet`), each in EN and AR. The AR strings are AI-drafted and wait for native review (D-58 a, FU-121). |
| `how-to-play.html` | New section "Playing with phones (Phone buzzer)" with a contents link; the intro mentions typed answers. |
| `privacy.html` | Golden Goal bets are stored with the room; New Game deletes the room. |
| `README.md` | How to play item 17. |
| `docs/deploy-hostinger.md` | Phone Sprint 3 redeploy: migration first, files, smoke check with 3 or more real phones. |

**Not changed**
- `sw.js`: it names no asset (the join page's files are cached network-first as they load) and `api/` is never cached.
- Asset names: the hashed files were edited in place. The pre-commit hook renames them and updates `index.html`, `join.html` and the other pages, so stage all of them (D-80 u, Sprint 1 note 7).

## How to run locally

1. Run the migration (above).
2. From the worktree root run `C:/xampp/php/php.exe -S localhost:8007` and open `http://localhost:8007/`. Admin `final_round_enabled` must be on (it is, locally).
3. Choose Players or Teams and **Phone buzzer**, start, and join from 2 or more tabs or phones.
4. Get a tie for first: mark everyone Wrong on one cell, then **End Game**.
5. **Go for goal**. Bet on the phones: the question opens once all bets are in (or use **Continue without missing bets**). Answer on the phones, mark on the host, and **See results** or **Next round**.
6. **New Game**: the phones say "This game has ended."

## Verification

All runs were against `php -S localhost:8007` on the local MariaDB, with headless Chrome via Playwright (from the main checkout's `node_modules`, read only). The scripts are in the session scratchpad.

- **Lint:** `php -l api/rooms.php` reports no errors. `node --check` passes on `js/game.*.js`, `js/join.*.js`, `js/i18n.*.js` and `sw.js`.

**API suite, 62/62 PASS** (`s3api.js`)
- Before any round: `bet` is null and a bet gets 409 closed.
- A `goal` stage is accepted on the final screen and refused on the board screen (400).
- `start_bets`:
  - seq 1, and the same open round again gives the same seq (idempotent);
  - no host token gives 401, another tab gives 409 `other_tab`, and the wrong number of scores gives 400.
- **D-48 limits:**
  - score 700 gives a limit of 700;
  - score 200 gives 600 (the largest point value);
  - score −300 gives 600.
- **Bets:**
  - −1, 1.5, "abc", "12" (a string), 701 and null all get 400; John's 601 against his limit of 600 gets 400;
  - a bet for another round gets 409 closed, and no device token gets 401;
  - 437 gets 201, and a second bet gets 409 duplicate;
  - 600, exactly the limit with a score of 200, gets 201.
- **Leaks:**
  - other phones' state holds no other amount;
  - `bets_status` gives (2/4) with `bet` / `joined` flags and no number;
  - the lobby holds no amount;
  - `bets_status` and `reveal_bets` with a device token as the host token give 401 / 403.
- A refreshed phone gets its own amount back.
- **Release during the wait:** the rejoined phone sees the name's bet locked, and its second bet gets 409.
- **The close:** `close_bets` closes the round; closing twice is harmless, and a bet after it gets 409 closed.
- **The reveal:**
  - `reveal_bets` gives `[437, 600, null, null]`, and asking again gives the same answer;
  - from another tab it gives 409, and for an unknown round 404;
  - after the reveal John's state still holds only his own amount.
- **The Golden Goal question:** `goal: true` with `points: null` gets 200; a Golden Goal question with points gets 400 and a board question without points still gets 400. The phone payload has no answer, and an answer to it gets 201.
- **Repeat round:**
  - seq 2, an open screen with `mine` null, a new limit of 1137 and round 2;
  - a bet for the old round gets 409, and the whole score (1137) gets 201;
  - the status of round 1 is now closed.
- An unchanged poll after a bet stays the small "no change" reply.
- **`close`:** another tab gets 409, no token 401, and the current tab 200; the phone then gets 404. GET `bet` gives 405.

**Browser suite, 46/46 PASS** (`s3e2e.js`: host 1366x768; phones at 375x812, 320x640 and 375x812; Lea has no phone)
- The offer status on the phones.
- **Go for goal:**
  - the host shows the wait, "(0/4)", with no bet field and no Show button;
  - the bet screen reaches all 3 phones in **1.5 s**;
  - the phone shows Golden Goal, the category, its score −100 and the range 0 to 600;
  - the host list shows Waiting ×3 and Lea "Waiting (no phone)".
- **Bets on the phones:**
  - 601 and −5 are refused on the phone;
  - 437 locks, and the host shows (1/4) and "Bet sent" with no amount on screen;
  - a refreshed phone shows its bet locked;
  - "٢٥٠" (Arabic-Indic digits) is accepted as 250.
- **Release and rejoin during the wait:** Release from the wait's Phones button, then the rejoined phone gets the bet screen again.
- **Host refresh during the wait:** (2/4) with the same `betSeq` and no new `start_bets`.
- **No amount leaks** (timestamps stripped before the search):
  - no other phone's state payload holds 437 (or 250 on Mo's);
  - nor do the host's `bets_status`, lobby and answers replies, or the host's saved game.
- **Continue without missing bets:** the question opens on the host and the phones, with the heading "Golden Goal ⚽ – Egyptians" and "Your bet: 437". No phone showed "Wait while the host marks the answers" before the question arrived (a check on the order of the bets close and the question open).
- **The question:**
  - the phone payload has `goal: true` and no answer fields;
  - the answers are listed in arrival order;
  - Show Answer sends the phones to "Wait while the host marks… Your bet: 437";
  - a late answer gets 409.
- **Marking and the reveal:**
  - after 3 of 4 marks the scores are unchanged, no bet shows, Back is disabled, and the saved wagers are empty;
  - a host refresh keeps the 3 marks;
  - the first reveal was blocked on purpose: the message shows and the button reads "Revealing the bets...";
  - the retry then shows **+437, −250, +100, 0** and the scores **337, −350, 0, −100**, with "See results".
- **Phone results:** Sara sees "Correct! … +437" and John "Wrong … −250". John's payloads still never hold 437.
- **The end of the game:**
  - Results: the game over card shows "Sara wins!" with 4 ranked rows, and the board is hidden;
  - New Game sends `close`, and all 3 phones show "This game has ended." with the standings;
  - **Join another game** opens an empty code screen.
- **Game 2: repeat round, one phone in Arabic:**
  - with all bets in, the question opens by itself (840 ms after the last bet);
  - Pause on the host freezes the phone's countdown with "Paused" (29 s stays 29 s for 1.5 s), and Resume restarts it;
  - in AR at 320 px the question is RTL with no sideways scroll;
  - both correct gives "Next round", and the new bet screen reads "round 2" with an empty box and score 0;
  - the AR bet screen has `⁦600⁩` isolated;
  - the round is scored −600 / +50, Ben wins, and the AR game over card has no sideways scroll.
- No console errors. The only one seen came from the reveal blocked on purpose.

**Extra suite, 11/11 PASS** (`s3extra.js`)
- **Teams:**
  - Golden Goal with a 5 s timer: at timer 0 the question closes on the phone, and a later answer gets 409 late;
  - reveal blocked, everyone marked, then a host refresh: the reveal runs on restore (+300 / −500, scores 200 / −600), and `timedOut` is saved;
  - Red wins, and the phones show the game over card.
- **Expired room** (aged 7 h in SQL): the phone shows "This game has ended." with the standings.
- **6 players at 1366x768** (one name 30 characters long): the wait fits; Continue ends at 515 px with no sideways scroll.
  - Host in AR: RTL, with "(⁦0/6⁩)" isolated.
- **Android Back from the bet wait** (app mode, `?source=twa`): confirm, then Results. The server's round is closed, and a bet gets 409.
- No console errors.

**Regressions**
- **Integration Quiz page** (it loads the same `game.js` without the Golden Goal markup; `addStandIns()` gives the missing elements detached stand-ins): loads and starts with no console errors.

| Run | Result |
|---|---|
| Host control: double cell plus a full Golden Goal (`gg-full.js`) | Masked bets, "See results", "Sara wins!", **0 rooms calls**, no errors |
| Tournament Golden Goal (`s3tourney.js`) | 9/9: a level match goes to Golden Goal with no Skip, the masked host entry, no wait block and no Answers panel, scored at the mark (+100 on the first mark), match result, **0 rooms calls**; a Mokh Bot tournament (3 entries) restores with the bot and no `control` field, 0 rooms calls |
| Sprint 2 API suite | 28/28 |
| Sprint 2 browser suite | 26/26 (see the note below) |
| Sprint 1 suite | 48/48; the first run had one timing check at 1870 ms against a 1.5 s threshold, under load, and the rerun was 1367 ms |
| Sprint 1 second suite (Tournament, Teams, wide boards, service worker) | 22/22 |

- **The Sprint 2 browser suite** was run with `phone_helpers_enabled` turned on in that browser only, by rewriting the `settings.php` response, as in Sprint 2's CR 3 runs (the shared DB stays 0).
- Its 3 Golden Goal checks asserted "Golden Goal stays on the host" and were dropped, because this sprint replaces that behaviour on purpose.

**Screenshots checked:** the phone bet screen in AR at 320 px, the game over card at 320 px, the Golden Goal question in AR, and the host wait with 6 players in EN and AR at 1366x768. The two wait buttons were stacked off-centre; they are now centred on one line.

**Cleanup:** my test rooms were closed by the suites (New Game, or `close` in the API suite) or are left to expire. Other rooms in the shared local DB were not touched. The scratch database used to check the 42S22 code was dropped.

## Deviations and decisions

1. **The question opens by itself when all bets are in,** as the AC and plan task 3 say. It opens about 1 s after the last bet (the host's poll), and the timer starts at once. If the owner prefers a "Show the question" step (as in Host control), it is a one-line change in `pollBets()`.
2. **The scores change only after the last mark.** US-65 says the bets are revealed "when the host has marked everyone". With US-44's per-mark scoring a score change would give each bet away. So in a Phone buzzer game the marks are recorded first and everyone is scored at once at the reveal. The result is the same as US-44.
3. **The phone receives its own amount** (`bet.mine`), so a refreshed phone shows its bet locked, as the AC asks. No phone ever receives another contestant's amount, and `bets_status` and the lobby hold none. The brief says "no amounts in any phone payload"; I read that as other phones' payloads (tester focus wording).
4. **Limits are worked out on the server** from the scores sent in `start_bets` and the room's point values, so the server can refuse a bet over the limit with 400 (FU-117, D-48).
5. **`reveal_bets` also closes the round** if it is still open, and can be asked again. That makes the retry and the refresh-before-reveal case safe.
6. **Phones n/N in the wait block.** The board bar's Phones button is not on the Golden Goal screen, so the wait has its own button. Release, rejoin and late joins work during the wait.
7. **Room closed on New Game only.** Results keeps the room, so the phones show the standings; New Game deletes it. If the `close` call fails, the room expires after 6 h as before. On 404 a phone shows "This game has ended." and keeps the standings it had.
8. **On the phone, "Wait while the host marks the answers" shows only once this round's Golden Goal question has reached it.** Before that the card says the bets are closed, because the board push and the question open can arrive in either order.
9. **The phone's result is worked out from its own score change** after the reveal (+bet or −bet). The phone is never told the marks. Until the new scores arrive (about one push) it keeps "Wait while the host marks…".
10. **Missing columns give 503.** A small hardening in `rooms_main()`; it covers a server where the code is deployed before the migration.

## Known limitations / for the tester

1. **Live smoke test (DoD).** It still has to be done on Hostinger with 3 or more real phones, recording the observed delay and any server errors (`docs/deploy-hostinger.md`, Phone Sprint 3 step 3). It goes with FU-119 / FU-120.
2. **Arabic review.** The new AR strings are AI-drafted and wait for native review (FU-121).
3. **A bet in flight when the host continues:** fixed in Fix round 1 (OBS-65-02).
4. *(Replaced by BUG-65-03 in Fix round 1.)*
5. **Teams with real phones, and the real QR scan,** remain owner and device checks (FU-118 style).

## Fix round 1 (test report `docs/sprints/phone-sprint-3-test.md`)

### BUG-65-01: a second bet over the limit got 400 instead of 409 duplicate
- **Cause:** `room_bet()` checked the amount before it looked for an earlier bet.
- **Fix** (`api/rooms.php`): the order is now closed round (409 `closed`), then an earlier bet from this contestant (409 `duplicate`), then the amount (400). The insert stays atomic, so a race still ends in 409.

### BUG-65-02: the phone's card kept the round-start score after the reveal
- **Fix** (`js/join.*.js`, `renderBetView()`): "Your score" shows the score the bet was based on until the reveal, then the current score, as on the board.

### BUG-65-03: in Arabic a negative score in a sentence read "100−"
- **What I found:** the text already had an isolate (`⁦−100⁩`). In Chrome the minus is drawn left of the digits; I measured it by glyph position on the host offer, the bet list and the phone card. Without the isolate, the same text puts the minus on the right ("100−"). My own earlier note (limitation 4) came from reading small screenshots by eye.
- **Fix** (`js/i18n.*.js`, `ltr()`): a signed value (a leading minus, plus or hyphen) now also gets a left-to-right mark inside the isolate (`⁦‎−100⁩`). The mark alone keeps the sign on the number's left, so it holds even where the isolate is not honoured. This is checked: plain text gives the sign on the right, the mark alone gives it on the left.
- **Scope:** one helper, used by `formatScore()` and `signed()` in `game.js` and `join.js`. English returns plain text as before. Unsigned values (`0`, `600`, `0/6`) are unchanged.
- **Checked places** (new suite `s3bidi.js`, 11/11, each measured by glyph position):
  - **Host:** the scoreboard, the Golden Goal offer ("برصيد −100") and repeat offer ("برصيد −200"), the bet list, the scoring rows (+100) and Results (−200).
  - **Phone:** the bet card ("رصيدك: −100"), the score cards and the game-over list.
  - **English:** the offer is plain "on −100", with no isolate or mark.

### OBS-65-02: a bet sent just before Continue counted, though the confirm named that player as missing
- **Fix** (two small parts, `js/game.*.js` and `api/rooms.php`):
  1. **Continue** first asks `bets_status` again, so the confirm names who is missing right now. The confirm reads "Continue without the missing bets? Not in yet: {names}. Anyone whose bet is not in when you continue plays for a bet of 0."
  2. `close_bets` now returns the final who-bet list (`bets: [true/false]`, never an amount). The host then shows "Playing for a bet of 0 (no bet sent): {names}." on the question screen, which matches the 0s at the reveal exactly.
  - A bet sent while the dialog is open still counts. The confirm's wording allows for it, and the notice after the close shows the final list.
- **Strings:** `final.phoneContinueConfirm` (reworded) and `final.phoneZero` (new), in EN and AR (AI-drafted, FU-121).

### OBS-65-01
Not changed, as instructed: the bet belongs to the name. The PO decides.

### Re-run after the fixes (port 8007)

| Suite | Result |
|---|---|
| API (`s3api.js`) | **65/65**. New: 18b/18c, a second bet over the limit or negative gives 409 duplicate; 32, `close_bets` returns `[true, true, false, false]` with no amount; 34b, an over-limit bet after the close gives 409 closed |
| Browser (`s3e2e.js`) | **49/49**. New: 18b, the confirm names only Lea; 18c, "Playing for a bet of 0 … Lea."; 30b, the card shows "Your score: 337" after the reveal |
| Extra (`s3extra.js`) | **13/13**, run 3 times. New: 12-13, Hal bets straight before Continue, so the confirm and the notice name only Ivo, and the scores are +10 / +20 / 0. The first run had a test-only race (check 7 aged the room before one phone had seen the results); the test now waits for that phone |
| Arabic signs (`s3bidi.js`) | **11/11** |
| Host control Golden Goal (`gg-full.js`) | pass, 0 rooms calls, no errors |
| Tournament and Mokh Bot (`s3tourney.js`) | 9/9 |
| Sprint 2 API / browser | 28/28 and 26/26 |
| Sprint 1 / second suite | 48/48 and 22/22 |
| Integration Quiz page | no console errors |

`php -l api/rooms.php` reports no errors, and `node --check` passes on the three changed JS files.

**Files changed in this round:** `api/rooms.php`, `js/game.b9add461.js`, `js/join.e7f30eb8.js`, `js/i18n.c8f82b64.js`, `docs/sprints/phone-sprint-3-dev.md`.

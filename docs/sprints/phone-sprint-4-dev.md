# Phone Sprint 4: phone-only helpers ❄ Freeze, 💡 Hint, ×2 Double down (US-66): developer notes

Branch `phone-buzzer`, worktree `BrainRush-phone-buzzer`, on top of phone Sprints 1 to 3 (merged in `main`). Story US-66, decision D-81 (closes FU-125). Not committed.

## What was built

**Scope**
- A Phone buzzer game has **no ABC, ⇄ or ½ chips** anywhere:
  - The host scoring rows hide them (`g.control === 'phone'`), and `helperBlockReason` refuses them, so `useHelper` cannot run.
  - The phones never get 3 choices.
- Host control and Tournament keep `HELPER_KEYS` and every host helper code path unchanged.
- **The switch:** `create` reads Admin `phone_helpers_enabled` (a missing row is off) together with `helpers_enabled` (a missing row is on). It stores the result in `game_rooms.helpers` and returns it as `helpers`.
  - The host sets `g.helpersOff = !helpers` for the game, so the host and the server always agree.
  - When it is off, every helper call gets 409 `off`, the phones show no chips, and the host shows no helper line.

**Server (`api/rooms.php`)**
- **New player action** `POST ?action=helper {code, device_token, kind, seq?, target?}`.
  - It returns 201 `{kind, seq, target, until_ms, now}`.
  - The device token works as for `answer`: missing gives 401, unknown gives 403.
  - Bad input gives 400: an unknown kind, a seq that is not a JSON integer of 1 or more, or a target that is not a JSON integer.
  - A rule break gives 409 `{error, reason}`. The reasons:
    - `off`: helpers are off in this game.
    - `used`: this helper was already used in the game (also caught by the primary key).
    - `goal`: Golden Goal.
    - `closed`: no open question, or the wrong seq.
    - `open`: ×2 armed while a question is open.
    - `sent`: the user has already sent an answer.
    - `nohint`: the question has no pattern.
    - `self`: the user picked themselves.
    - `not_in_room`: the target has not joined, or the index is out of range.
    - `target_sent`: the target has already sent an answer.
    - `already_frozen`: the target is already frozen on this question.
    - `immune`: the target has ×2 on this question.
  - The checks run in a transaction that starts with `SELECT … FROM game_rooms … FOR UPDATE`. That serializes helper calls against each other and against `open_question`. Two players freezing the same target at once gives one 201 and one `already_frozen`.
- **Freeze**
  - It lasts `round(timer.totalMs / 4000)` s, so 30 s gives 8 s and 20 s gives 5 s. It runs on server time: `until_ms` is set when the freeze is used, and Pause does not touch it.
  - `answer` refuses with 409 `{reason: 'frozen', remaining_ms}` while a freeze on that contestant runs **on the open question**. The insert also carries a `NOT EXISTS` freeze condition, so a freeze that arrives mid-request still wins.
  - Once the question is closed, the answer is `late`, not `frozen`: a freeze ends with its question.
- **Hint**
  - `open_question` takes an optional `hint: {en, ar}` and checks it on the server against `/^[^\s_\x00-\x1F\x7F](?: [_ ])*$/u`: one character, then only `_` and gaps. So the server can never hold more than the first character of an answer.
  - It is stored in the new column `game_rooms.q_hint`, not in the question JSON that goes to every phone. A pause or resume (`update_question`) does not touch it.
  - Golden Goal questions store no hint.
- **×2**
  - It is armed with `seq` NULL.
  - `open_question` binds every armed ×2 to the new seq, in the same transaction, and returns `doubles: [index…]`.
  - On a Golden Goal question, and in `start_bets`, armed ×2s are spent (`seq` 0), never applied.
  - Arming is refused with `goal` when the stored state is on the final or results screen, has a Golden Goal stage, or a bet round has ever started.
- **Phone `state`**
  - It has a new `helpers` field: null when helpers are off. Otherwise it holds:
    - `left: {freeze, hint, double}`;
    - `double`: null, `'armed'` or `'on'` (on the open question);
    - `frozen`: null or `{by, untilMs}`;
    - `hint`: null or `{en, ar}`, only for the contestant with a hint row on the open seq;
    - `targets`: who this player can freeze now.
  - Every helper use bumps the version, so the target phone sees its freeze on the next poll.
- **Host polls**
  - `answers` adds `helpers: [{contestant, kind, target}]` for that seq, in the same reply.
  - The host's `lobby` poll (only for the room's current host session) adds every use in the game, `[{contestant, kind, seq, target}]`, so the scoreboard and lobby panel show used, left and armed.
- **The old owner CR 3 path is removed:**
  - `room_question` no longer validates or stores `by`, `byHelper` or `choices`;
  - `room_question_view` no longer strips choices per phone;
  - a `choices` field from an old client is ignored.

**Host (`js/game.*.js`)**
- `PHONE_HELPER_KEYS` and `PHONE_HELPERS` hold the chips ❄, 💡 and ×2.
- The uses are kept in **`g.phoneHelpers`**: `[{contestant, kind, seq, target}]`, validated by `isValidPhoneHelpers`. They are saved with the game, so a refresh keeps them.
  - `mergePhoneHelpers()` merges the rows from the lobby poll, the `open_question` reply and the answers poll.
  - A row is never removed, and an older lobby reply never turns a bound ×2 back into an armed one.
  - It then saves the game and redraws the scoreboard, the scoring rows, the Answers panel and the lobby panel.
- `renderHelpersLeft` → `renderPhoneHelpersLeft` in phone games: ❄ 💡 ×2, used ones dimmed, an armed ×2 in gold. The screen-reader text is "Helpers left: … (×2 armed for the next question)".
- The lobby panel shows **"×2 armed"** next to the name.
- `phoneQuestion` no longer sends choices.
  - `phoneHint()` builds the EN and AR patterns from the **main** answers: `choiceText()`, without the part in brackets.
  - `hintPattern()`: `Array.from`, combining marks (Arabic tashkeel) removed, whitespace collapsed.
- `phoneGoalQuestion` sends no hint.
- **Scoring rows:**
  - A contestant with ×2 on the question gets a gold **×2** tag.
  - Their Correct button shows the doubled amount (`correctPointsFor`: x4 on the double cell).
  - `markContestant` uses `correctPointsFor` for a Correct. Wrong stays at the normal points.
  - Until the `open_question` reply arrives, an armed ×2 counts as on (the race of a very fast mark).
- **Answers panel tags:** "❄ froze X", "❄ frozen by X", "💡 Hint", "×2".
  - A contestant with a tag but no answer yet gets a row with "No answer yet", so the frozen player shows too.
- The old `phoneUpdateQuestion` call in `useChoices` and the `phoneOpenQuestion` call in `useSwap` are removed. Neither can run in a phone game now.

**Phone (`join.html`, `js/join.*.js`, `css/join.*.css`)**
- **Question screen:**
  - A chip row with ❄ Freeze and 💡 Hint, each after a `confirm`. The Freeze confirm says how many seconds.
  - ❄ then opens a **picker** of the server's `targets`, taking a fresh poll at once because answers don't bump the version. Tapping a name freezes them, and the phone says "You froze Mo."
  - "×2 on this question" shows when it applies.
  - The **hint line** "Hint: P _ _ _ _" sits above the answer box:
    - It uses the phone's language, falling back to the other one.
    - `dir` follows the pattern's first character (Latin or digits read LTR inside Arabic, D-60).
    - Each word is a box, so a line breaks between words.
  - **Frozen:** a banner "❄ Frozen by John: 7 s" counts down on the existing 250 ms ticker, using the server clock offset.
    - Send is disabled and the box stays editable.
    - Send unlocks by itself at 0.
    - A 409 `frozen` shows "You are frozen: send your answer when the freeze ends."
  - The chips disable at once after Send.
- **Board:**
  - A **×2 Double down** chip, after a confirm, is shown only when the board is on screen: no open question, no Golden Goal, no results.
  - Once armed it is replaced by "×2 armed for the next question".
- **Player card:** a helpers line (❄ 💡 ×2), with used ones struck through and an armed ×2 in gold.
- Refusals show a short message per reason (`jh.err.*`).
- The old ABC path (`renderChoices`, `onChoice`, `#jq-choices`, `.jq-choice*` CSS, `jq.choices`) is removed.
- **Refresh:** everything comes back from the server `state`: left, armed or on ×2, freeze with its time left, the hint pattern, and the used chips.

**Strings (`js/i18n.*.js`)**
- EN and AR are added for:
  - `phoneHelper.*` (host);
  - `answers.froze`, `answers.frozenBy` and `answers.noAnswer`;
  - `jh.*` (phone) and `jq.frozen`.
- The AR strings are AI-drafted and still need a native review (FU-121).

**Other files**
- Host CSS (`css/style.*.css`):
  - `.score-helper.is-armed`, `.srow-x2`;
  - `.answer-tags` / `.answer-tag`, with the Answers row grid now 4 columns;
  - `.answer-row.is-pending`, `.room-player-x2`.
- `how-to-play.html` (#phones): a new "Helpers on the phones" item. It covers:
  - once each per game, the confirm, the scoreboard view and the Admin switch;
  - Freeze: the length, real time and immunity;
  - Hint: the pattern, EN/AR, private;
  - ×2: the board, x2 / x4, Wrong at normal points;
  - no helpers in Golden Goal, and ABC / Swap / ½ for Host control only.
  - The ❄ and 💡 emoji are used only on chips and the banner (D-81), not in the guide text.
- `README.md` (item 18, plus a line in item 16) and `docs/deploy-hostinger.md` (the phone Sprint 4 deploy steps).
- `sql/migrate-add-rooms.sql`, `sql/schema.sql`, `sql/schema-hosted.sql`: see Migration. The additions to the two schema files are identical (checked with diff).
- Asset names: the hashed files were edited in place: `js/game.*.js`, `js/join.*.js`, `js/i18n.*.js`, `css/style.*.css` and `css/join.*.css`. The pre-commit hook renames them and updates `index.html`, `join.html` and the other pages, so stage all of them together with the pages. `api/config.php` was not touched.

## Migration
- **New table `room_helpers`:**
  - Columns: `room_id`, `contestant`, `kind` VARCHAR(8), `seq` (NULL = ×2 armed, 0 = spent by Golden Goal), `target`, `until_ms`, `used_ms`.
  - PK `(room_id, contestant, kind)`: one use per helper per game. A room is one game: New Game closes it (`close`), and the next Start makes a new room, so no game number is needed in the key.
  - Index `(room_id, seq, target)`, and an FK with ON DELETE CASCADE.
- **New `game_rooms` columns:** `helpers TINYINT(1)` and `q_hint TEXT`, added with `ADD COLUMN IF NOT EXISTS` for databases that ran an earlier copy.
- **Local:** `C:/xampp/mysql/bin/mysql.exe -u root brainrush < sql/migrate-add-rooms.sql`. It was run **twice** with no errors, and `SHOW CREATE TABLE room_helpers` and `SHOW COLUMNS` match.
- **Hosted (FU-127):** import the same file in phpMyAdmin **before** uploading the code. Without it every rooms call answers 503, because `find_room` reads `helpers`. Then tick **Helpers in Phone buzzer mode** in live Admin.

## How to run locally
1. Run the migration (above). In Admin, tick **Helpers in Phone buzzer mode**. The local DB is back at 0 after my tests.
2. From the worktree root run `C:/xampp/php/php.exe -S localhost:8007` and open `http://localhost:8007/`.
3. Choose Players, **Phone buzzer**, start, and join from 3 tabs or phones (one name without a phone helps check the picker).
4. **×2:** arm it on one phone from the board. The host scoreboard and the Phones panel show it armed.
5. **Freeze and Hint:** open a cell. Freeze from a second phone (the ×2 player is not in the list) and use Hint on the third. Watch the banner and the Answers panel tags. Mark the ×2 player Correct for double points.

## Verification
All runs were against `php -S localhost:8007` on the local MariaDB, with headless Chrome through Playwright (the main checkout's `node_modules`, read only). The scripts are in the session scratchpad, `…/scratchpad/s4/`.

**Lint**
- `php -l api/rooms.php` reports no errors.
- `node --check` passes on `js/game.*.js`, `js/join.*.js`, `js/i18n.*.js` and `sw.js`.

**The Admin switch**
- `phone_helpers_enabled` was 0 locally. I set it to **1** for the "on" runs and **back to 0** afterwards (checked with SELECT).
- The suites with the switch on ran while it was 1, in the shared local DB.

| Suite | Result |
|---|---|
| API, helpers off (`s4api.js off`) | **7/7** |
| API, helpers on (`s4api.js on`) | **66/66** |
| Browser, helpers on (`s4e2e.js`) | **44/44** |
| Browser, helpers off (`s4off.js`) | **5/5** |
| Host control helpers (`hc-helpers.js`) | **11/11** |
| Host control Golden Goal (`gg-full.js`) | Unchanged, **0 rooms calls**, no errors |
| Tournament and Mokh Bot (`s3tourney.js`) | **9/9** |
| Sprint 3 API (`s3api.js`) | **65/65** |
| Sprint 3 browser (`s3e2e.js`, helpers on) | **49/49** |
| Sprint 2 API (`s2api-us66.js`) | **28/28** |
| Sprint 2 browser (`s2e2e-us66.js`) | **20/20** |
| Sprint 1 (`e2e-us66.js`) | **48/48** |
| Integration Quiz page | Loads, no console errors |

**API, helpers off (7/7)**
- `create` returns `helpers: false`, and the phone state has `helpers: null`.
- Arm, hint and freeze all get 409 `off`.
- The host lobby has `helpers: null`, and the answers poll has `helpers: []`.

**API, helpers on (66/66)**
- **Input and tokens:**
  - a bad kind gives 400, no token 401, an unknown token 403;
  - a string seq or target gives 400; GET gives 405; a closed room gives 404.
- **×2:**
  - armed (201), then a second arm gets 409 `used`;
  - the version is bumped, and the host lobby shows it with seq null; the public lobby has no `helpers` field;
  - `open_question` returns `doubles: [0]`, and the phone shows `double: 'on'`;
  - arming during a question gets 409 `open`;
  - on the next question it is spent (`doubles: []`).
- **Hint validation:** `Paris`, `P _ r _ s` and `_ _` as a hint all get 400.
- **The freeze picker:** the targets leave out the user, the ×2 player and the player with no phone. A player who used their own freeze is still a target.
- **Freeze refusals:** `immune`, `self`, `not_in_room` (no phone, or index 9), and `closed` (another seq).
- **The freeze race:** two players freeze the same target at once: one 201 and one `already_frozen`.
- **Freeze lengths:** 8 s at 30 s and 5 s at 20 s.
- **The frozen player:**
  - their state shows `frozen {by, untilMs}`;
  - their answer gets 409 `frozen` with `remaining_ms` between 6000 and 8000;
  - after a pause (`update_question`) the end time is unchanged;
  - after the freeze ends, their answer gets 201.
- **The second freeze** on the same player gets `already_frozen`, and a second freeze by the same user gets `used`.
- **Hint:**
  - two hints at once by one player: one 201 and one `used`;
  - only that player's state has `{en: 'P _ _ _ _', ar: 'ب _ _ _ _'}`;
  - no other phone's response, and not the public lobby, holds `_ _ _`.
- **After sending:** hint and freeze get `sent`, and the player who has sent is out of the picker.
- **The answers poll** returns exactly the double, freeze and hint rows of the seq.
- **The close:**
  - after `close_question` there is no freeze and no targets;
  - an answer after the close is `late`, not `frozen`. This was a real bug, fixed in `refuse_if_frozen`, which now requires the open question;
  - the freeze does not carry over to the next question.
- **No hint** on a question without one gives `nohint`.
- **Golden Goal:**
  - arming at the offer gets `goal`;
  - `start_bets` spends an armed ×2 (seq 0);
  - the Golden Goal question returns `doubles: []`;
  - a hint there gets `goal`;
  - the Golden Goal state has no targets, hint or ×2.

**Browser, helpers on (44/44)**
- The setup: a host at 1366x768, and phones at 375x812 (Sara), 320x640 (John) and 375x812 (Mo). Lea has no phone.
- **Board:**
  - The ×2 chip shows, and so does the player card helpers line.
  - The host scoreboard shows ❄ 💡 ×2, with no ABC.
  - Arming asks for a confirm, then shows "×2 armed for the next question", and the chip is gone.
  - The host scoreboard turns gold within one lobby poll, and the Phones panel says "×2 armed".
  - A phone refresh keeps it armed.
- **Question 1:**
  - The host row shows the ×2 tag and **Correct +200** on a 100 cell; John's row stays +100. There are no ABC, ⇄ or ½ chips.
  - The `open_question` request body holds the pattern and never the answer.
  - The chips show on all phones, and Sara's phone says "×2 on this question".
  - John's ❄: the confirm says "8 seconds", and the picker holds **Mo only**. Then "You froze Mo.", and the chip is used.
  - Mo's banner reads "❄ Frozen by John: 8 s". Send is disabled and the box is editable.
  - Mo's 💡 shows the pattern of the real question (for example `T _ _ _ _   _ _ _ _ _`) LTR, and his typed text is kept.
  - Sara's and John's responses never hold the pattern or the answer, and Mo's never holds the answer.
- **The host Answers panel** tags John "❄ froze Mo", Mo "❄ frozen by John" with 💡, and Sara ×2 (pending rows "No answer yet").
- **Refreshes:**
  - A host Pause leaves the freeze counting down.
  - A refreshed frozen phone keeps its banner, pattern and used chips.
  - A host refresh keeps the tags and the doubled Correct.
- **The freeze ends:** the banner goes, Send works, and Mo's answer is accepted.
- **Marks:**
  - Sara's chips disable right after she sends.
  - Sara Correct gives **+200** and Mo Wrong gives **−100**, on the scoring rows and on the board.
  - After that, Sara's ×2 is used, not armed.
  - The host scoreboard's used and left flags are right for Sara, John and Mo.
- **Question 2, John's phone in AR at 320 px:**
  - The chips read تجميد and تلميح.
  - The hint shows the AR answer's pattern, `dir="rtl"` for an Arabic first letter.
  - There is no sideways scroll, neither with the hint nor with the frozen banner "❄ جمّدك Sara: 7 ث".
  - Sara's picker holds John and Mo.
  - **Show Answer** closes the question and the banner on the phone.
- **Game 2 (Golden Goal):**
  - Ann arms ×2 and both are Wrong on the cell. Ben then arms ×2, and the host ends the game.
  - The offer shows no ×2 chip on either phone.
  - After the bets, the Golden Goal question has no chips and no ×2 line.
  - The host's saved Ben ×2 has seq 0 (spent).
  - The host Golden Goal rows have no ×2 tags.
- No console errors.

**Browser, helpers off (5/5)**
- A Phone buzzer game has no ×2 chip and no player-card helpers line.
- The host scoreboard helpers line is hidden.
- The question has no phone chips and no host chips, and the saved game has `helpersOff: true`.

**Host control helpers (11/11)**
- The scoreboard shows ABC ⇄ ½, the scoring-row chips show, and there is no ×2 tag.
- The Correct label is unchanged.
- ABC shows 3 choices and John is out; Swap brings a new question; ½ costs half and closes the cell.
- The used flags are right, and the saved game has no `phoneHelpers` and `control: 'host'`.
- A refresh keeps the game.
- **0 `rooms.php` calls** and no errors.

**Earlier suites**
- **`gg-full.js`:** the double-cell popup and gold Correct, masked bets, "Sara wins!", 0 rooms calls, no errors.
- **`s3e2e.js`** ran with the switch on.
- **`s2api-us66.js`:** a copy of Sprint 2's suite with the 2 choices checks inverted. Choices are now dropped, and a `choices` field is ignored.
- **`s2e2e-us66.js`:** a copy where cells 2 to 4 (the ABC, Swap and Skip phone checks, removed on purpose by US-66) became one check: "no ABC / Swap / Skip chips on the host rows".
- **`e2e-us66.js`:** Sprint 1's leak regex rejects any `"double"` key in the state. The phone's own `helpers.double` and `helpers.left.double` (the ×2 helper, not the hidden double cell) now trip it, so the regex is applied to the state without `helpers`. Everything else is unchanged.

**Screenshots checked:** the AR phone at 320 px with the hint, and with the frozen banner.

**Cleanup:** the test rooms were closed by the suites or are left to expire. Other rooms in the shared local DB were not touched.

## Deviations and decisions
1. **The switch also needs `helpers_enabled`.** The server's rule is `helpers_enabled` on AND `phone_helpers_enabled` on, as in the host's `helpersOff`. The host then takes the server's answer from `create`, so the two can never disagree. The AC names only `phone_helpers_enabled`; with the global helpers switch off, a phone game has no helpers either.
2. **There is no "timer off" in the game.** The timer is 5 to 600 s, so the 10 s branch (`ROOM_FREEZE_NO_TIMER_S`) is defensive code only and is not reachable from the UI. A 5 s timer gives a 1 s freeze (round(1.25)).
3. **Column names.** `used_ms` (server ms, like `received_ms`) replaces the plan's `used_at`. `seq` 0 marks a ×2 spent by Golden Goal. The hint patterns are in a separate column, `q_hint`, never in the question JSON.
4. **The Freeze flow:** a confirm on the ❄ chip, then the picker; tapping a name sends with no second confirm. The AC reads "taps ❄ and confirms, then a picker lists…". A player who used their own Freeze can still be frozen; only the four AC exclusions apply.
5. **Arming ×2** is allowed whenever no question is open on the board or question screen. That includes after Show Answer, before Back to Board, when the server has closed the question. It is refused once Golden Goal has been offered or a bet round has ever started in the room.
6. **Answers panel:** a contestant with a helper tag and no answer gets a "No answer yet" row, so "frozen by X" is visible before the frozen player answers.
7. **The scoring row of a ×2 player** shows the doubled Correct amount and a ×2 tag. The host sees what a Correct will give.
8. **The lobby helper list** goes only to the room's current host session. The public lobby is unchanged.
9. **A renewed room** (a room that expired after 6 idle hours, while a game is still on) is a new room. Its helper uses start empty and the host clears `g.phoneHelpers`, so everyone has all three again.

## Known limitations / for the tester
1. **A very fast mark.** If the host marks the ×2 player Correct before the `open_question` reply arrives (about 100 ms), the host counts the armed ×2 as on. It is on in practice, unless it was armed in the same instant the question opened; then the server binds it to the next question.
2. **The live smoke test** with 3 or more real phones (`docs/deploy-hostinger.md`, phone Sprint 4) and the native Arabic review of the new strings (FU-121) are still to do (FU-127).
3. **Old test scripts:** the Sprint 1 and Sprint 2 suites need the adapted copies above.
4. **Struck-through emoji.** On the phone player card a used ❄ is struck through and dimmed (opacity 0.35). The line-through is hard to see on an emoji, so the dimming is what shows.

## Fix round 1 (test report `docs/sprints/phone-sprint-4-test.md`: 48 PASS, 0 FAIL, 12 PENDING)

**BUG-66-01 (Minor): the ABC / ⇄ / ½ buttons were still in the DOM in a phone game: fixed**
- **The cause:** `renderScoringRows` built the three buttons for every row and only hid their container. In a phone game `helperBlockReason` gave them the label "helpers are turned off", even with phone helpers on.
- **The fix** (`js/game.*.js`):
  - A Phone buzzer game no longer builds the buttons or their `.srow-helpers` container.
  - `updateScoringRows` updates only the chips that exist.
  - `useHelper` refuses phone games directly.
  - `helperBlockReason` is back to its Host control form, so "helpers are turned off" appears only when helpers really are off.
- Host control is unchanged (`hc-helpers.js` 11/11).
- `s4e2e.js` check 8 now asserts that no `.srow-helpers` or `.helper-chip` element exists and that the page has no "helpers are turned off" text. `s4off.js` checks the same.

**BUG-66-02 (needs confirmation): a host reload on a paused question restarts the timer: pre-existing, not changed**
- **Reproduced in Host control** with no phone code running (`bug02.js`, 0 `rooms.php` calls): paused at 27 with "Resume", then after a reload **29 and running** ("Pause").
- **The cause:** `showQuestion` always calls `startTimer(g.timerSeconds, …)`. That is decision **D-04** ("Refresh with question open: … timer restarts at full length"). The line is not part of the US-66 changes.
- The phone code only follows the host's timer: `phoneRestoreQuestion` sends the restarted countdown.
- If the owner wants a paused question to stay paused after a reload, that is a new CR to D-04 for all modes.

**Re-runs** (local 8007, `phone_helpers_enabled` set to 1 for the runs, then **back to 0**)

| Suite | Result |
|---|---|
| API, helpers on | 66/66 |
| Browser `s4e2e.js` | 44/44 |
| Golden Goal with helpers (inside `s4e2e.js`) | checks 38 to 41 pass |
| Host control helpers | 11/11 |
| Host control Golden Goal (`gg-full.js`) | unchanged, 0 rooms calls, no errors |
| Tournament and Mokh Bot (`s3tourney.js`) | 9/9 |
| Helpers off, UI | 5/5 |
| Helpers off, API | 7/7 |

- **Golden Goal with helpers (checks 38 to 41):**
  - no ×2 chip at the offer;
  - no chips on the Golden Goal question;
  - Ben's ×2, armed when Golden Goal started, is spent (seq 0);
  - no ×2 tags on the host's Golden Goal rows.
- **Tournament and Mokh Bot:** a level match goes to Golden Goal, the masked entry, no Answers panel, 0 rooms calls, and the bot tournament restores.
- `node --check js/game.*.js` passes.
- OBS-66-02 (×2 can be armed on the screen of a closed question) is left as it is, for the PO.

## Test script update (2026-11-27)

`hc-helpers.js` (developer scratchpad `s4`) now checks the owner changes D-81 t and u: Skip marks the user Wrong for half at once and stays on the question (Wrong shows the half, Correct off, others out), Show Answer and Hide Answer work after a Skip, a reload keeps the skipped question, and Back to Board takes nothing more. Result: **18/18**, 0 rooms calls, no console errors.

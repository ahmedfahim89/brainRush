# Phone Sprint 2: questions and answers on phones (US-64): developer notes

Branch `phone-buzzer`, worktree `BrainRush-phone-buzzer`, on top of phone Sprint 1 (cf612df). Story US-64, decision D-80 (e to g, m, p). Not committed.

`docs/sprint-plan.md` and D-80 y still say that phone Sprints 2 and 3 are deferred by the owner. This sprint was started on the coordinator's instruction of 2026-11-27. I did not change the plan's status; that is for the scrum-master or the PO.

## What was built

**The question on the phones**
- In a Phone buzzer game, opening a cell sends the question to the phones as a new question number (`seq`). The phones get:
  - the category, or "Kilo Meshakkal: source category";
  - the points and the ×2 mark;
  - the English and Arabic text;
  - the 3 choices once the helper is used;
  - the countdown.
- The countdown is the host's timer, stamped with server time. Phones count down using their offset from the server clock, which comes in every poll.
- Pause, Resume, Reset and closing the double popup reach the phones within about 150 ms, plus one poll.

**When the question closes**
- It closes when the host's timer reaches 0, and on Show Answer, Back to Board and Skip. New Game cannot be reached while a question is open.
- A Swap opens a new number. Answers to the old one are late and are no longer listed.
- After a close, the phones go straight back to the board (US-64: within about 1 s). For 3 s the board's status line says "The question is closed.", or "Too late" when the phone's answer was refused.

**The phone question screen**
- It shows the heading, the text and the countdown with a bar, turning red in the last third, plus "Paused" and "Time's up".
- The text shows in Arabic first when the question has Arabic (as US-49), with an English / Arabic button.
- Below that are a text box (200 characters at most) and **Send**.
- The first answer sent is locked: the box and Send are disabled and the message reads "Answer sent: ...".
- A second answer gets 409 from the server. "Too late" shows when the question was closed before the answer arrived.
- A refreshed phone comes back on the open question, still locked; `mine` in the state is per contestant.
- The typed text and the focus survive updates: the view is built once per question number and then updated in place.

**3 choices on the phones**
- They show as buttons, in the host's on-screen order. Tapping one fills the box, and the player still taps Send, as the US-64 AC says.
- Nothing in the payload marks the right option.

**The host's Answers panel**
- "Answers from phones" sits above the scoring rows on a board question in a Phone buzzer game.
- It is kept compact so Back to Board stays on screen at 1366x768 with 6 players (D-30):
  - the scoring hint is hidden while the panel shows;
  - each answer is one line, ellipsised, with the full text in the tooltip;
  - the list shows about 3 rows and scrolls inside.
- Each answer shows the name in the contestant's colour, the answer as text (never HTML) and "+3.2 s" since the question opened, all from server time, in arrival order.
- The host polls it every 1 s while the question is open, and once more after it closes.
- It never scores. The host still uses Correct / Wrong. A contestant with no phone is marked by hand as before.
- A host refresh mid-question brings the panel back. If the question is still open, the phones' countdown restarts with the host's, as D-04 does on the host.

**Out of scope or unchanged**
- **Golden Goal:** unchanged in Phone buzzer mode (phone Sprint 3). There is no question call and no panel, and phones show "Golden Goal is being played on the host screen."
- **Host control:** unchanged, with 0 rooms calls.
- **Tournament:** unchanged.

## API (`api/rooms.php`)

| Call | Auth | What |
|---|---|---|
| `POST ?action=open_question` `{code, host_token, session, question}` | host + current tab | New `seq` (`LAST_INSERT_ID(q_seq + 1)`), the question is open, opened time = server ms. 200 `{seq, version}`. |
| `POST ?action=update_question` `{…, seq, question}` | host + current tab | Same seq, answers kept (3 choices, Pause, Resume, Reset). 409 when that seq is closed. |
| `POST ?action=close_question` `{…, seq}` | host + current tab | 200 `{closed, version}`. Closing twice is harmless. |
| `GET ?action=answers&code=&seq=&session=` + `X-Host-Token` | host + current tab | `{seq, open, answers: [{contestant, text, ms}]}` in arrival order (server time). |
| `POST ?action=answer` `{code, device_token, seq, text}` | device token | 201 `{seq, text}`. 409 `reason: 'duplicate'` for a second answer. 409 `reason: 'late'` once the seq is closed or replaced. 400 when empty or over 200 characters. |
| `GET ?action=state` | device token | Now also has `now` (server ms), `question` (the open or last-closed question with `seq` and `open`) and `mine`. |

**How an answer is checked**
- One atomic `INSERT … SELECT … WHERE q_seq = ? AND q_open = 1`: no row inserted means late, a duplicate key means duplicate. A close therefore always wins over an answer in flight, and the phone's clock plays no part.
- Answer text: control characters become spaces, then it is trimmed and counted in characters, 1 to 200.

**What the phones receive** (`room_question()`)
- The question payload is rebuilt from known fields only. Answer fields (`answer`, `answer_ar`, `wrong_*`) and the picture path are dropped even if the host sends them.

**Other rules**
- Another host tab gets 409 `other_tab` on every question call, so the Sprint 1 rule that the newest tab wins still holds.
- An answer does not bump the room version. The phone that sent it knows already, and a refresh gets `mine`.

## Data

- `sql/migrate-add-rooms.sql`, `sql/schema.sql` and `sql/schema-hosted.sql` (the two schema bodies are still identical):
  - New table `room_answers`: `room_id`, `seq`, `contestant`, `text VARCHAR(200)`, `received_ms`. The primary key is (room, seq, contestant); there is an index for arrival order; deleting the room deletes its answers.
  - New `game_rooms` columns: `q_seq`, `q_open`, `q_opened_ms` and `question`.
- The migration adds the columns with `ADD COLUMN IF NOT EXISTS` for a database that ran the Sprint 1 copy.
- **Local:** `C:/xampp/mysql/bin/mysql.exe -u root brainrush < sql/migrate-add-rooms.sql`. It has been run twice with no errors.

## Files changed

| File | What |
|---|---|
| `api/rooms.php` | The 5 new actions, `now`, `question` and `mine` in the state, `room_question()` / `question_text()` / `answer_text()`. |
| `sql/migrate-add-rooms.sql`, `sql/schema.sql`, `sql/schema-hosted.sql` | `room_answers` and the question columns. |
| `js/game.78c2221f.js` | `apiCall` keeps the reply body on errors (`error.data`). `phonePayload` gives Golden Goal as `final`. `current.phoneSeq` is saved and validated. Hooks in `openQuestion`, `useSwap`, `useChoices`, `onBoardTimeUp`, `showAnswer`, `backToBoard` (also Skip), `newGame`, `restoreGame`, `pauseTimer` / `resumeTimer`, `refreshQuestion`. New section "Phone buzzer: questions and answers" (queued calls, answers poll, Answers panel). |
| `index.html` | `#answers-panel` in the scoring section. |
| `join.html`, `js/join.d2eda833.js`, `css/join.65369f06.css` | The phone question screen. |
| `css/style.020b81cb.css` | Answers panel styles (theme tokens). |
| `js/i18n.c6802bfd.js` | 20 EN + 20 AR strings (`answers.*`, `jq.*`). The AR strings are AI-drafted and wait for native review (D-58 a). |
| `privacy.html` | Typed answers are saved with the room and deleted with it. |
| `README.md` | How to play item 16. |
| `docs/deploy-hostinger.md` | Phone Sprint 2 redeploy: migration first, files, smoke check. |

`sw.js` needs no change: `api/` is never cached, and the join page's files stay network-first in `brainrush-join-v1`.

## How to run locally

1. Run the migration (above).
2. From the worktree root run `C:/xampp/php/php.exe -S localhost:8007` and open `http://localhost:8007/`.
3. Choose Phone buzzer and start a game. Open the panel's link in 2 or more tabs or phones, and pick the names.
4. Open a cell: the phones show the question.

## Verification

All runs were against `php -S localhost:8007`. The server was stopped afterwards and the test rooms deleted.

**API suite, 28/28 PASS**
- Before any question: `question` is null and an answer is late.
- `open_question` gives seq 1.
- The raw state response never holds the answer, `answer_ar`, the wrong options or the picture path, even when the host sends them on purpose.
- `hasImage` is kept, and line breaks become spaces. The timer carries the server stamp.
- The first answer gets 201, trimmed, with HTML kept as text. A second answer gets 409 duplicate. 201 characters gets 400, an empty answer 400, and no token 401.
- After a pause update, an answer is still accepted, including 200 multibyte characters, and the phone sees the paused timer and its `mine`.
- The answers poll is in arrival order with `ms`. Without the host token it gets 401; from another tab, 409 `other_tab`.
- After a close, an answer gets 409 late and is not listed. Updating a closed question gets 409.
- The next question is seq 2, and the old seq is late. `mine` is reset, and the choices have only `text` / `textAr`.
- A choices list of a length other than 3 gets 400.
- `open_question` and `close_question` from the older tab get 409 `other_tab`.

**Browser suite, 29/29 PASS** (host 1366 px, phones at 375 and 320 px, a 3-player game where one player has no phone)
- The question appears on both phones in 1.0 to 1.7 s from the click on the cell. That includes the 400 ms cell-open animation and up to one 1 s poll. The host shows the Answers panel, "Waiting for answers...".
- Sending locks the phone.
- Typing survives a host update: the text and the focus are kept.
- Pause freezes the phone countdown and shows "Paused", and an answer is still accepted.
- The host lists both answers in arrival order with "+x s". The HTML answer shows as text.
- A refreshed phone comes back locked with its answer. A refreshed host gets the panel back.
- Show Answer sends the phones back to the board in about 0.3 s, with the "closed" status line.
- Correct / Wrong scoring and cell colours are unchanged. The player with no phone is marked by hand.
- No phone network response holds the answer fields or a picture path.
- 3 choices: the same texts in the same order on the host and the phone. Tapping fills the box without sending; Send sends. No answer mark is in the payload.
- Swap: the new question arrives with an empty, open box, and the old answers are no longer listed.
- Skip closes the question on the phones.
- In Arabic the question view is right to left, with no sideways scroll at 375 and 320 px.
- A full 6-cell game was played with answers typed on phones.
- An answer after Back to Board gets 409 late.
- At timer 0 (a 5 s timer) the question closes on the phone.
- Golden Goal in Phone buzzer mode: no question call and no panel; the phone shows the board with the Golden Goal status, and Golden Goal ends on Results.
- No console errors.

**Extra suite, 12/12 PASS**
- **6 players at 1366x768**, with a 30-character name and a 200-character unbroken answer: no sideways scroll, and Back to Board stays on screen (763 px in EN, 739 px in AR).
  - Found and fixed: the first panel pushed Back to Board to 1068 px. Host control with 6 players is at 710 px.
- **"Too late" on the phone:** the phone's polls were held, the host pressed Show Answer, then the phone sent. It shows "Too late: the question was closed.", then the board with the same status line.
- **Double cell:** the phone shows the "Double score" badge.
- **Kilo Meshakkal box:** `open_question` returns 200, and the phone heading reads "Kilo Meshakkal: <source> – <points>".
- **Solo modes** (they share the timer code): a Streak question and a Speed Round question play, and the Integration Quiz page loads, with no console errors.

**Regressions**
- Sprint 1 suite: 48/48. It has a new check that Host control shows no Answers panel. Two checks were updated on purpose:
  - The phone now shows the question view instead of the "A question is open" status line.
  - The state may now hold a `question` key, the phone question object; the answer-field checks are unchanged.
- Second Sprint 1 suite: 22/22 (Tournament, Teams, wide boards, service worker).
- Fix-round suite: 25/25 (saved places, two host tabs, versions, 30-character name).
- Host control: double cell plus full Golden Goal, ending on "Sara wins!", with 0 rooms calls.

**Screenshots checked:** the phone question view in Arabic at 320 px, and the host panel. One bug found this way was fixed: the board stayed visible under the open question, because `.join-board` did not honour `[hidden]`.

## Deviations and decisions

1. **No picture path on phones.** A picture's file name can name the answer (for example a flag's file), which would put the answer in the network response. Phones get `hasImage: true` and show "Look at the host screen for the picture." Showing pictures on phones would need opaque picture URLs, a later change request.
2. **The 3 choices hold the answer text by design** (D-80 g puts the options on the phones). They are in the host's order with no mark of the right one.
3. **Choice tap fills, it does not send.** The coordinator's brief said "fill and send"; the US-64 AC says the player still taps Send. I followed the AC. Auto-send would be a one-line change.
4. **Back to the board straight away when the question closes.** I first held a "closed" screen for 2.5 s, but that broke the AC "back to the live board within about 1 s". Now the board's status line says "The question is closed." (or "Too late") for 3 s.
5. **Reset after timer 0 does not reopen the question.** The question closed at 0 (D-80 m), so later answers stay late, even if the host resets the timer.
6. **Golden Goal is unchanged in Phone buzzer mode**, as the brief asked (phone Sprint 3).
7. **The phone shows the question in Arabic first** when it has Arabic, whatever the phone's interface language, as the host does (US-49). The English / Arabic button switches it.
8. **Times are relative to the opening on the server**, so a pause counts in "+x s". The order is server arrival order; a slow phone loses about one poll interval (US-64 risk note).
9. **Live latency is still not measured** (FU-120), as accepted by the coordinator.
10. **A failed `open_question` is not retried.** On a network or server error the phones do not get that question. The warning shows on the Phones button of the board bar, not on the question screen. The host can still judge by voice, and the next question opens normally. A retry could be a small follow-up.
11. **The Answers panel shows about 3 answers at a time** and scrolls for more, so Back to Board stays on screen with 6 players (D-30). Long answers are cut to one line, with the full text in the tooltip.

## Fix round 1 (test report `docs/sprints/phone-sprint-2-test.md`)

### BUG-64-01 (Minor): the phone said "A question is open" after the question had closed
- **Cause:** while the host still shows a closed question (timer 0, or Show Answer before Back to Board), the phone's status line came from the host's screen name (`question`).
- **Fix** (`js/join.d2eda833.js`, new `boardStatus()`): on the question screen with `question.open === false`, the status line now says "The question is closed." ("Too late: the question was closed." when this phone's answer was refused).
- After Back to Board it says "Waiting for the host to pick a question." again. The 3 s note right after a close is unchanged.

### BUG-64-02 (Minor): the 3 choices helper on a question with no wrong answers: pre-existing, no change
- The same code is on pre-phone `main` (b3d0bed). There, `helperBlockReason()` returns `helper.noChoices` when `hasChoices(q)` is false, and `useHelper()` returns before `useChoices()`. The helper is therefore **not spent**, which matches the tester's own note that the save still shows `helpers.choices: true`.
- The ABC chip stays visible but disabled (US-32), with the tooltip "3 choices: this question has no choices yet". The "disappears" in the report is that dimmed, disabled chip.
- **Checked in Host control:**
  - the first cell's wrong answers were removed in the save;
  - after a reload the chip is visible and disabled with that tooltip;
  - a forced click does nothing, `helpers.choices` stays true and no choices show.
- **On phones**, `phoneQuestion()` sends choices only when `hasChoices(q)`, so phones never get an empty choice list.
- **Not changed:** the smallest safe fix the coordinator described (disable the chip when there are no choices) is exactly what the code already does.

### Re-checked pending items (new suite, 13/13 PASS)
- **BUG-64-01, timer 0:**
  - With a 5 s timer, the host stays on the question past 0. 10 s later the phone status reads "The question is closed.".
  - After Back to Board it reads "Waiting for the host to pick a question.".
- **"Too late" after Show Answer, Back to Board and Skip** (the phone's polls held, the host acts, then the phone sends):
  - each time the phone shows "Too late: the question was closed." on the question, then the same text on the board's status line;
  - after Show Answer the status keeps "Too late" while the host stays on the question.
- **Row 9, 3 choices:** run on a question that has 2 wrong answers, found in the saved board (AI 100).
  - The ABC chip is offered, and the phone shows 3 buttons with the host's texts in the host's order.
  - A tap fills the box and Send is still needed; the tapped choice arrives in the host's Answers panel.
- **BUG-64-02 in Host control:** as described above.
- **No console errors.**

### Re-run suites (port 8007, server stopped and test rooms deleted afterwards)
API 28/28, browser 29/29, extra 12/12, Sprint 1 48/48, Sprint 1 second suite 22/22 (includes the Tournament regression: a match restored after a reload with no rooms call, and Mokh Bot), fix-round 25/25, and Host control double cell plus Golden Goal (0 rooms calls).

**File changed:** `js/join.d2eda833.js` only.

## Owner change requests (local check, 2026-11-27)

### CR 1: Answers panel under the scoring rows
- **Owner's finding:** next to the question, the panel was narrow, about 3 rows showed, and "+15.3 s" collided with the scrollbar.
- **Change:** `#answers-panel` now sits under the contestant rows and above Back to Board, at the full width of the scoring column (`index.html`).
- **Answer rows** are a 3-column grid (`css/style.020b81cb.css`):
  - the name, up to 10rem, ellipsised;
  - the answer text, one line with the full text in the tooltip;
  - the time, `max-content` and `nowrap`.
- **Scrollbar:** `scrollbar-gutter: stable` keeps it off the times, so a time is never clipped.
- **Height (D-30):** `fitAnswersList()` in `js/game.78c2221f.js` caps the list to the room left above the bottom of the window, so Back to Board stays on screen.
  - When everything fits, nothing is capped.
  - The list never goes below about 2 rows (44 px); it scrolls inside instead.
  - A layout that scrolls anyway (narrow, stacked) keeps the whole list.
  - The fit runs again on resize.
- **Unchanged:** the scoring hint is still hidden while the panel shows (fix-round layout).
- **Checked:** EN and AR at 1366x768, 1024x768 and 800x600, with 6 players, a 30-character name and a 200-character answer.
  - **All sizes:** the panel is under the rows at full width, no shown time is clipped, and there is no sideways scroll.
  - **1366x768:** Back to Board ends at 762 px in EN and AR. With the tall 30-character row, about 2.5 answer rows show and the list scrolls.
  - **3 players:** every answer row shows with no scrolling.
  - **1024 and 800 wide:** the page already scrolls (the stacked layout), and the list is not capped.

### CR 2: the helper's contestant is the only one who can answer (partly reversed by CR 3 below)
*Superseded: the lock of the other phones, the 409 `locked` refusal and the `q_by` column were removed by CR 3. Only the per-device filtering of the 3 choices remains.*
**Host rule mirrored** (`markContestant` / `isValidHelperUse`): once a contestant uses a helper, `cur.by` is set and only that contestant can be scored on the question. Per helper:

| Helper | Host today | Phones now |
|---|---|---|
| 3 choices | `cur.by` = user; only they can be scored | The question carries `by` and `byHelper: 'choices'`. Only that contestant's phone receives the 3 choices: the server filters them per device in `room_question_view`, so other phones get `choices: null`. The other phones are locked with "{name} is using 3 choices: only {name} can answer this question." |
| Swap | `cur.by` = user; only they can be scored on the new question | The new question (new seq) carries `by` and `byHelper: 'swap'`. Other phones are locked with "{name} used Swap: only {name} can answer this question." |
| ½ Skip | Closes the question (`backToBoard`) | The question closes on every phone, as before. No lock is needed. |

**Server** (`api/rooms.php`):
- New column `game_rooms.q_by`, set by `open_question` and `update_question`.
- The answer INSERT also needs `q_by IS NULL OR q_by = you`, so the check is atomic. An answer from anyone else after that point gets 409 `reason: 'locked'`, and the phone shows the lock message.
- Answers sent before the helper was used stay in the room and in the host's panel. The phone that sent one keeps "Answer sent".
- `question.by` must be a contestant index of the room and `byHelper` must be `choices` or `swap` (400 otherwise).

**Schema:** `q_by TINYINT UNSIGNED NULL` is in `sql/migrate-add-rooms.sql` (also as `ADD COLUMN IF NOT EXISTS`), `sql/schema.sql` and `sql/schema-hosted.sql`. The bodies are still identical, and the migration was run twice locally.

**Strings:** `jq.lockedChoices` and `jq.lockedSwap` in EN and AR (AI-drafted, D-58 a). I used a colon instead of the dash in the brief: the repo's text rules flag em dashes.

**Host control and Golden Goal:** unchanged.

**Checked:**
- 3 choices by John: John's phone gets 3 buttons.
- Sara's phone:
  - shows the lock message, with the box locked and no buttons;
  - every state payload it got after the helper has `"choices":null`;
  - the server refuses its answer with 409 locked.
- Mo answered before the helper: he keeps "Answer sent", and the host lists Mo then John (not Sara).
- Swap by Sara:
  - John sees "Sara used Swap: only Sara can answer this question.", also in Arabic;
  - John's API answer gets 409 locked;
  - Sara's answer is accepted.
- Skip closes the question on the phones.

### CR suite and regressions
- **New CR suite:** 20/20 PASS.
- **Re-run:** API 28/28, browser 29/29, extra 12/12, Sprint 2 fix round 13/13, Sprint 1 48/48, Sprint 1 second suite 22/22 (Tournament), Sprint 1 fix round 25/25, and Host control double cell plus Golden Goal (0 rooms calls).
- **Cleanup:** port 8007 stopped and the test rooms deleted.

**Files changed for the CRs:**
- `api/rooms.php`
- `sql/migrate-add-rooms.sql`, `sql/schema.sql`, `sql/schema-hosted.sql`
- `js/game.78c2221f.js`, `js/join.d2eda833.js`, `js/i18n.c6802bfd.js`
- `index.html`, `css/style.020b81cb.css`

### Owner direction 2026-11-27: helpers in Phone buzzer games are an Admin setting, off by default

**Why:** with everyone answering at once, helpers open loopholes. The owner will study the rules later. Until then the helpers are switched off in Phone buzzer games.

**The setting**
- Admin > Game settings > **Helpers in Phone buzzer mode** (key `phone_helpers_enabled`), stored like the other flags.
  - `api/settings.php`: rule `[0, 1]`; a missing row means off.
  - `admin.html` and `js/admin.1bb89f58.js`: checkbox, load and save.
  - The label and hint are English only, like the rest of Admin (D-59 d). There is no game-side text, so no AR string was needed.
- **Seed row:** `('phone_helpers_enabled', '0')` is in `sql/schema.sql` and `sql/schema-hosted.sql` (bodies still identical). `sql/migrate-add-rooms.sql` adds it with `INSERT IGNORE`. The migration was run twice locally, and the row is 0.

**How the game uses it** (`js/game.78c2221f.js`)
- At Start, a Phone buzzer game gets `helpersOff: true` unless both `helpers_enabled` and `phone_helpers_enabled` are on. This reuses the existing per-game helpers-off rule:
  - the ABC, Swap and ½ chips are hidden on the question screen and the scoreboard;
  - no helper can be used, so no helper data reaches the phones.
- The value is taken when the game starts and saved with it, like `helpers_enabled`.
- Host control and Tournament ignore the setting.

### CR 3, used only when the setting is ON (reverses part of CR 2)

**3 choices**
- The options go only to the phone of the contestant who used the helper. The question carries `by` (sent only for 3 choices), and the server sets `choices: null` in every other phone's state.
- The other phones keep their normal box, can send, and show no lock message.

**Swap:** the new question (a new seq) goes to every phone, and everyone can answer it.

**Skip:** closes the question for everyone, as before.

**Server (`api/rooms.php`)**
- The 409 `locked` refusal and the `q_by` column are removed, from the migration and both schemas as well. The local column was dropped.
- Answers are refused only as duplicate or late.

**Host scoring**
- New function `helperLimitsScoring(g)` returns `g.control !== 'phone'`. It is used in `markContestant`, `updateScoringRows` and `isValidHelperUse`.
- In a Phone buzzer game the host can score anyone after a helper, and a save with that state still loads. The helper is spent only by its user.
- Host control keeps the US-32 rule: after a helper, only its user can be scored.

**Strings:** the lock strings of CR 2 are removed.

**Not changed:** the "New Game keeps the last Game control choice" item was withdrawn by the owner, so D-80 v stands. No change was made.

### Open follow-up (owner to decide): helper rules in Phone buzzer games
Helpers stay off by default until the owner settles their rules. With the setting ON, the known loopholes are:
1. A player uses **3 choices** or **Swap** after an opponent has already sent a correct answer.
   - Swap throws that answer away: a new question number, and the old answers are no longer listed.
   - 3 choices gives the user the options while the others already answered without them.
2. **½ Skip** closes the question for everyone, including players who were still typing, and only its user pays half the points.
3. Answers sent before **3 choices** stay in the list, and the host may score them. That is now allowed (CR 3), but it lets a player wait for the options before answering.
4. Helpers are still "once per game per contestant, before anyone is scored". On phones, "scored" happens later than "answered", so a helper can come after answers are in.

### Checks
**New setting suite** (`phone_helpers_enabled`, port 8009): 8/8 PASS.
- The API default is 0.
- **Setting OFF:** a Phone buzzer game has no helper chips, on the question screen or the scoreboard, and saves `helpersOff: true`. Host control still has all the chips.
- **Setting ON:** a Phone buzzer game shows the chips.
- **Admin:** the checkbox shows the saved value. Saving ON survives a reload, and the API returns 1. Saving back to the original value (0) survives a reload. The shared local DB is back at 0.
- No console errors.

**New CR 3 suite** (setting turned ON in that browser only, by rewriting the `settings.php` GET response, so the shared DB was not touched): 14/14 PASS. One of the three runs timed out once while waiting for the Swap question on the phone (a timing flake: the Swap draw comes from the server); the other two runs passed 14/14.
- 3 choices used by John: only John's phone gets the options. Sara's payloads hold `"choices":null`, her box stays open with no lock, she can send, the host can score her, and the helper is spent by John only. A host reload with Sara scored after John's helper restores the question.
- Swap used by Sara: John gets the new question, can answer, and can be scored.
- Host control: after Ana's helper, Ben is greyed out, as before.

**Re-run on port 8009** (the helper suites also with the setting ON in their own browser):

| Suite | Result |
|---|---|
| CR 1 layout rows of the CR suite | 6/6 (the old CR 2 section stops on its obsolete lock check) |
| API | 28/28 |
| Browser | 29/29 |
| Extra | 12/12 |
| Sprint 2 fix round | 13/13 |
| Sprint 1 | 48/48 |
| Sprint 1 second suite (Tournament) | 22/22 |
| Sprint 1 fix round | 25/25 |
| Host control double cell + Golden Goal | pass, 0 rooms calls |

The CR 2 lock checks of the CR suite are obsolete; the CR 3 suite replaces them. The coordinator's server on 8007 was not touched. Mine on 8009 was stopped afterwards. Test rooms were not deleted this time, because the local DB is shared with the owner's live room; they expire after 6 h idle.

**Files changed for this direction:**
- `api/settings.php`, `admin.html`, `js/admin.1bb89f58.js`
- `js/game.78c2221f.js`, `js/join.d2eda833.js`, `js/i18n.c6802bfd.js`
- `api/rooms.php`
- `sql/migrate-add-rooms.sql`, `sql/schema.sql`, `sql/schema-hosted.sql`
- `README.md`, `docs/deploy-hostinger.md`

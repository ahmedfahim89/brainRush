# Phone Sprint 2 (US-64, questions and answers on phones): test report

Branch `phone-buzzer`, worktree `BrainRush-phone-buzzer` (uncommitted). Tester run on 2026-11-27. No code was changed. Servers on `localhost:8007` and `localhost:8008` were started for the run and stopped by PID afterwards. MariaDB 10.4 was up. The local migration had already run (`room_answers`, and `q_seq`, `q_open`, `q_opened_ms`, `question` in `game_rooms`).

Note: `docs/sprint-plan.md` and D-80 still say Sprint 2 is "Deferred by the owner until they ask". The coordinator asked for this test; the status is for the PO to update.

## Summary

- **Environment:** Windows 11, PHP 8.0.30, MariaDB 10.4 (utf8mb4), Chrome-based browser pane. Host on `localhost:8007`. Phones in separate storages: `[::1]:8007` (Team A, Arabic), `localhost:8008` (Team B, Arabic), `[::1]:8008` (Team C, English), and a late phone (Team D) on the host origin. A 6-player game was used. Layout checks were done in same-origin iframes (1366x768 host, 375 px phone). The tool's clicks are coarse, so some phone and host steps used DOM clicks on the real controls, and some API calls were made with a device token from the page (noted per row).
- **Counts (21 criteria rows):** PASS 18, FAIL 1, PENDING 2.
- **Bugs:** BUG-64-01 (Minor, status line says open after close), BUG-64-02 (Minor, a 3-choices helper can be spent with no effect). No Major bugs found.
- **Verdict: NEEDS FIXES (Minor).** Core answer flow, locking, duplicates, late refusal, takeover and the layouts all pass. Fix BUG-64-01 before PO acceptance. The 3-choices button view on phones is still unverified (PENDING).

## Acceptance criteria (US-64, `docs/product-backlog.md`)

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Opening a cell shows the question on every joined phone within about 1 s: category, points, text, countdown, text box, Send | PASS | Host opened AI 100 and Cartoons 100. Team A (AR) and Team C (EN) showed the question with countdown, box and Send in the next screenshot. Team B (AR, in background) showed it after a fresh load. Late joiner Team D saw "Egyptians – 100", "Seconds left 7", "Your answer", "Send". Exact 1 s timing not measured (tool gaps 2 to 5 s). |
| 2 | Payload never holds the answer, before or after close (checked in the network response) | PASS | After close: state responses of Team B contained no answer text (the Arabic answer "فروزن / ملكة الثلج" and "Snow Queen" not present), no `answer`, `wrong_*` or picture-path keys. Server whitelist confirmed in code (`room_question()`, `question_text()`). Before close: the same whitelist applies; the body was not captured during the open state. |
| 3 | Answer locks on the phone ("Answer sent: …"), box and Send disabled; second answer from the same device refused (409) and not listed | PASS | Team A sent "Frozen" (locked, "أرسلت الإجابة: Frozen"). Team C sent "Let It Go" ("Answer sent: Let It Go"). Repeat sends via the API from the same device returned 409 `reason: "duplicate"` and were not listed (checked for Team A and Team B). |
| 4 | Accepted only while the question number is open; late after timer 0, Show Answer, Back, Skip, Swap; "Too late" on the phone; server time decides | PASS | Timer 0: Team C's answer after close → 409 `late`. Swap: an answer to the old seq → 409 `late`. Skip: server `q_open = 0`. Back to Board and Show Answer: closes (answers refused, per the dev suite; Show Answer seen on the host "Answers are closed."). Phone "Too late" wording not re-checked in this run. |
| 5 | Pause pauses the phones' countdown and answers are still accepted | PASS | Host Pause: Team B and Team C showed "Paused" ("متوقف مؤقتاً" / "Paused"). Team A, Team B and Team C answered while paused (accepted, 201). |
| 6 | Host Answers panel lists answers in arrival order (name in colour, text, "+x s") | PASS | Panel: "Team B Frozen +17.9 s", "Team C Let It Go +28.9 s", then "Team A Frozen". Parallel send (below): B then C, server order. Panel shows colours and times. |
| 7 | Host still judges with ✓ / ✗; the panel never scores | PASS | Team B Correct (+100) → score 100, panel unchanged. Scoring rows and Wrong buttons present for every contestant. |
| 8 | Answer text as text, never HTML; at most 200 characters (longer → 400) | PASS | `<b>Pyramids</b>` shown literally on the phone ("أُرسلت الإجابة: <b>Pyramids</b>") and on the host panel. 200 characters accepted (201). 201 characters → 400 "An answer can be at most 200 characters." Empty → 400. |
| 9 | 3 choices appear on phones as buttons; tapping one fills the box; Send still needed | PENDING | Host helper "3 choices" was applied, but the question (AI 200) has no two wrong answers in the bank, so neither the host nor the phones show options (BUG-64-02). Not verified with a question that has options. |
| 10 | Swap: phones show the new question with an empty box; old answers dropped | PASS | Swap on AI 200 → seq 2 "History – 600, Swapped from AI – 200". Team A's phone: `mine: null`, box empty, History shown. Answer to old seq 1 → 409 late. Host panel reset to the new question. |
| 11 | Skip closes the question on the phones | PASS | Skip on the host → `q_open = 0` (DB). Phone state reports `open: false` (server). A new cell opened right after the Skip became seq 2 (open). |
| 12 | After close, phones go back to the live board within about 1 s | FAIL (status text) | Phones returned to the board after close. The status line then reads "A question is open on the host screen." (wrong), see BUG-64-01. |
| 13 | Phone refresh during an open question rejoins on it, with a sent answer still locked | PASS | Team A reloaded during seq 3: "أُرسلت الإجابة: Eagle" locked, Send disabled, countdown shown. |
| 14 | Host refresh mid-question restores the panel | PASS | Host iframe reloaded with seq 3 open: Answers panel "Team A – Eagle +12.2 s" and the question restored. |
| 15 | A contestant with no joined device can still be marked Correct or Wrong | PASS | Teams E and F (no device) keep their Correct / Wrong buttons in the scoring rows; scoring unchanged. |
| 16 | AR: question screen RTL, Arabic question first, names and numbers isolated | PASS | Team A and Team B (AR phones): `dir="rtl"`, the Arabic question text first, the English / Arabic switch, the timer isolated. |
| 17 | Host Control: question screen unchanged, no Answers panel, 0 rooms.php calls | PASS | Host Control game started (0 calls); a Host-control question opened: `answersPanelVisible: false`, `rooms_calls_while_open: 0`, `rooms_calls_after_back: 0`. |
| 18 | Golden Goal in phone mode unchanged (no question call, no panel, phones show the status) | PASS | Tie among 6 teams → Golden Goal screen ("Go for goal" / "Skip to results"). Skip to results → Results and New Game worked. Phone shows "الهدف الذهبي يلعب على شاشة المقدّم" (Golden Goal is played on the host screen) without answer data. |
| 19 | Tournament unchanged | PENDING | Not re-run in this round (the Sprint 1 round and the dev suite cover it). |
| 20 | 6 players at 1366x768 with Back to Board still visible, no sideways scroll | PASS | Host in a 1366x768 iframe, 6 players, question open with the Answers panel: Back to Board at y 573 to 628 (inside 768), `scrollWidth` 1366 = `clientWidth` 1366. |
| 21 | Sprint 1 flows still work (joins, claimed names, lobby, refresh, Release, takeover) | PASS | Three phones joined by name; the second host tab takes over and the old tab shows the notice; the first host reloads with one tab and claims with no notice; the room survives host reloads. Release not re-run in this round. |

Counts: 21 rows: PASS 18, FAIL 1 (row 12), PENDING 2 (rows 9 and 19).

## Edge cases

| Case | Result | Evidence |
|---|---|---|
| Two phones answering within about 50 ms | PASS | Team B and Team C sent from two curl processes in parallel: both 201; server times 1795737916929 and 1795737916959 (30 ms apart), stored in that order; the panel lists them in that order. |
| Host opens a new cell quickly after closing one | PASS | Skip (seq 1 closed), then immediately a new cell: seq 2, 200 points, open. Earlier: Show Answer then a new cell (seq 1 → 2) worked. |
| A phone that was offline while the question opened | PARTIAL | Team D joined after seq 3 opened: it showed the question with countdown and an answer box, and its answer was accepted (201). Team B had been in the background while seq 1 opened: after it was fronted it showed the board with the wrong status (BUG-64-01) and no question view, because the question had already closed. A real offline network drop was not simulated. |
| The losing host tab during an open question | PASS | Second host tab (new page load) claimed the room during seq 4. The first tab showed "Open in another tab" (blocking notice). A phone answer to seq 4 (Team C, 201) appeared in the winner's panel ("Takeover C, +15.4 s"). |

## Bugs

### BUG-64-01 (Minor): the phone's status line says the question is open after it has closed

- **Where:** `js/join.d2eda833.js:443` (`dom.status.textContent = … t('join.status.' + g.screen)`); the host sends `screen: "question"` while the host still shows its question screen (`js/game.78c2221f.js` `phonePayload`, screen = `state.screen`). The question is closed on the server (`question.open: false`).
- **Steps to reproduce:**
  1. Host opens a question in a Phone buzzer game.
  2. Let the timer reach 0 (or press Skip), but do not press Back to Board. The host still shows the question screen.
  3. On a phone (or after a phone is fronted again from the background), the board's status line reads "A question is open on the host screen." Server state: `question.open: false`, `state.screen: "question"`.
- **Expected:** "The question is closed." (or "Too late") while the answers are closed; "Waiting for the host to pick a question." after Back to Board.
- **Actual:** the status line says the question is open, although answers are refused.
- **Impact:** misleading text on phones; players may keep trying to answer. Minor.

### BUG-64-02 (Minor): the 3-choices helper can be spent on a question with no two wrong answers

- **Where:** `js/game.78c2221f.js:3185` (`useChoices`): it sets `choiceOrder` and the helper is used up, but `phoneQuestion()` (line 9257) and the host show options only when `hasChoices(q)` is true (`js/game.78c2221f.js:2908`).
- **Steps:** before anyone is scored, open AI 200 (no wrong answers in the bank) and click the ABC chip. The chip disappears, the saved game shows `helpers.choices: true`, but no options appear on the host or the phones.
- **Expected:** the chip is not offered for a question without options, or it says so.
- **Actual:** the helper is spent with no effect. This looks pre-existing (host logic), but the phone path inherits it.

## Observations (not bugs)

- Helpers (3 choices, Swap, Skip) are once per game and only before anyone is scored. Expected by the rules; the chips grey out after the first score.
- The host Answers panel scrolls inside its box with 3 or more answers; the 200-character answer is cut to one line with the full text in the tooltip (as the developer noted).
- The late phone (Team D) joined in the host's origin (`localhost:8007`), a separate device from the other origins. Fine for the test.
- Client clicks on cells sometimes need two clicks (the first only focuses). Not a product issue; noted for the tool.

## Not verified (PENDING)

- 3 choices as buttons on the phone, and tap-to-fill (row 9): needs a question with two wrong answers. Suggested check: any Arabic or English question with `wrong_1` / `wrong_2`.
- Tournament unchanged (row 19): not re-run here.
- Exact timing of the 1 s update, and a real offline phone (drop the network, then return): not measured.
- Phone wording "Too late" after Show Answer, Back and Skip (row 4): the server refusal is verified, the phone text was not captured in this round.
- Live-host latency and a real-phone smoke test (dev notes say deferred to the deploy).

## Test data and cleanup

- Rooms created in the local `brainrush` DB: TQ8STK, HZNXT5, KW3HGT (plus earlier rooms from the Sprint 1 round). They expire after 6 h idle.
- Test names only: "Team A" to "Team F", and "Alpha" to "Foxtrot" in the Host-control game.
- Both PHP servers (8007 and 8008) were stopped by PID. No code in the worktree was modified.

## Verdict

**NEEDS FIXES (Minor).** No Major bugs. Fix BUG-64-01 (status text must follow `question.open`, not the host screen). BUG-64-02 can be a follow-up (hide the helper when the question has no options). Then re-run row 9 (3 choices on phones) with a question that has options, and the Tournament check. The core US-64 answer loop works on phones, including lock, duplicates, late refusal, arrival order, HTML-as-text, 200-character cap, Swap, Skip, Pause, refresh and takeover.

## PO acceptance (2026-11-27)

**US-64: ACCEPTED with follow-ups.** No Major bug.
- **BUG-64-01: fixed** in fix round 1 (`boardStatus()` in `js/join.*.js`, checked in code by the PO; developer suite 13/13). It has not been re-run by the tester, so the owner checks it at the local check (FU-122 step 9).
- **BUG-64-02: no change.** It is pre-existing on `main` and works as intended (US-32): the chip is disabled with its tooltip, and the helper is not spent.
- **Pending rows:**
  - Row 9 (3 choices on phones) and the "Too late" wording passed in the developer's fix-round suite.
  - Row 19 (Tournament) passed in the re-run Sprint 1 second suite (22/22).
  - The live 1 s timing stays with FU-120.
- **The developer's deviations are decided in D-80 aa to al.**
  - A choice tap fills the box and does not send.
  - Pictures are not sent to phones; they show "Look at the host screen".
  - Both are accepted as built. The owner can change either with a small change request at the local check.
- **Follow-ups:**
  - FU-122: the owner's local check before the commit.
  - FU-123: the hosted migration and deploy, which can be combined with FU-119.
  - FU-124: retry a failed question open (Could).
  - FU-121: extended for the new Arabic strings.

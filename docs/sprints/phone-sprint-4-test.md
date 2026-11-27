# Phone Sprint 4 (US-66, phone-only helpers ❄ Freeze, 💡 Hint, ×2 Double down): test report

Branch `phone-buzzer`, worktree `BrainRush-phone-buzzer` (uncommitted). Tester run on 2026-11-27. No application code was changed. The dev note is `docs/sprints/phone-sprint-4-dev.md`; the criteria are US-66 and D-81 in `docs/product-backlog.md`; the tester focus is in `docs/sprint-plan.md` (Phone Sprint 4).

## Summary

- **Environment:** Windows 11, PHP 8.0.30 (`C:/xampp/php/php.exe`), local MariaDB (`brainrush`, migration already applied, `room_helpers` present). Server `php -S localhost:8007` from the worktree, already running; it listens on `[::1]:8007` only (`127.0.0.1` does not answer).
- **Admin switch:** `phone_helpers_enabled` set to **1** for the "on" runs (through `mysql`, confirmed with SELECT) and set back to **0** at the end (confirmed). `helpers_enabled` stayed 1 (its original value).
- **Browser setup:** one browser tab only, so the "three join tabs" were not run as three live tabs. Each phone was a top-level page on its own origin (`a.localhost` = Team A, `b.localhost` = Team B, `[::1]` = Team C in Arabic), and the host was on `c.localhost`. Those origins keep separate storage, so each phone has its own device token. The owner's saved game on `localhost:8007` was not touched. The phone tabs were moved between by navigation, and the host's timer was paused while the phones acted. The mobile width was checked with same-origin iframes (320 px and 375 px).
- **Native dialogs:** the browser suppresses `confirm()` (it returns false). The tester overrode `window.confirm` on the page to accept, so each chip's confirm was accepted, the same as tapping OK. The confirm text was captured for the ×2 chip; the Freeze and Hint confirm text was not captured.
- **Scripts (scratchpad):** `C:/Users/NB28970/AppData/Local/Temp/claude/e4f6c4f93721a950/cb43d48c-4f49-479e-8638-38afbf8ba9d8/scratchpad/s4api.mjs` (68 API checks, 68 PASS, against `[::1]:8007`, with test names "Team A/B/C/K1/K2" only).
- **Test rooms:** API rooms ZQPLG7, G36MKF, DYS9GK, APYWTE (closed or left to expire). UI rooms 4L4FPC, 7ULU4H and 8B6J8E were ended with New Game, and the Host control game was a no-room game. No owner room was touched.
- **Counts (60 rows):** PASS 48, FAIL 0, PENDING 12. Bugs: BUG-66-01 (Minor), BUG-66-02 (Minor, needs confirmation). Observations: OBS-66-01 to OBS-66-03 (PO decisions).
- **Verdict: READY FOR PO**, with the two Minor bugs to fix or accept. No Critical or Major bug was found. The PENDING rows (Golden Goal, Tournament, the switch-off UI run, the owner's live smoke test and the native Arabic review) still have to be done before the release.

## Acceptance criteria (US-66 / D-81)

| # | Criterion | Steps | Result | Evidence |
|---|---|---|---|---|
| 1 | Phone game: no ABC, ⇄ or ½ chips on the phones or on the visible host rows | Phone game, helpers on; host scoreboard and phones read | PASS | Visible host rows show only ❄ 💡 ×2 helper badges. Phones show ❄ Freeze, 💡 Hint and ×2 only. Hidden buttons remain in the DOM: see BUG-66-01. |
| 2 | Host control: ABC, Swap and ½ shown; no ❄ 💡 ×2 | Host control game, one question opened | PASS | Visible buttons "3 choices / Swap / Skip for Team A and B" (labels without the "turned off" text). No ❄, 💡 or ×2 text on the page. Behaviour of ABC, Swap and ½ was not re-run; the dev's `hc-helpers.js` run is not repeated here. |
| 3 | Tournament (with Mokh Bot) unchanged | Not run | PENDING | Sprint 3 left this open too. Needs a tournament run. |
| 4 | Switch on at Start: each contestant gets ❄ 💡 ×2, each once | Start with the switch at 1 | PASS | create returns `helpers: true`. Phone state `helpers.left` all true. Board chips shown on all phones. |
| 5 | Switch off: server refuses helper use (409 `off`), phone state has no helpers | API, switch at 0 | PASS | SW1 `helpers:false`, SW2 `helpers:null`, SW3 409 `off`. |
| 6 | Switch off: no chips and no host helper line in the UI | UI run with the switch at 0 | PENDING | Not run in the UI this session (the API side is PASS). |
| 7 | Switch read once at create (a later change does not affect a running game) | API: room created on, switch set to 0, helper used; room created off | PASS | SW4a–c: the room created with the switch on still gives 201 for the ×2 and freeze rules and 201 for the hint after the flip. SW1–SW3: a room created off refuses with 409 `off`. |
| 8 | Helpers used only from the contestant's own phone, each after a confirm | Taps on the phones; host has no chips | PASS | The ×2 chip shows a confirm (text captured: "Use ×2 Double down on the next question? … cannot be cancelled. Once per game."). Freeze and Hint confirms were accepted through the override; their text was not captured. |
| 9 | Host scoreboard shows used / left / armed per contestant | Host board after arming, using, and marking | PASS | "Helpers left: Freeze, Hint (×2 armed for the next question)" for Team A; used helpers struck through; the Phones panel and lobby show armed. |
| 10 | Golden Goal: no phone chips; server refuses helper use (409 `goal`) | Golden Goal in a phone game | PENDING | Not run this session. The dev note reports a browser run and an API run. |
| 11 | ×2 armed when Golden Goal starts is spent, not applied | Golden Goal with an armed ×2 | PENDING | Not run this session. Needs a tie at the top to offer Golden Goal. |
| 12 | Freeze picker excludes self | Team B's picker on Q2 | PASS | Team B's picker lists only Team A (not Team B). API F2 409 `self`. |
| 13 | Freeze picker excludes a player who has sent | API: Team C sent, then Team B freezes Team C | PASS | A2 409 `sent` (freezer who sent), A3 409 `target_sent`. The picker exclusion was not seen in the UI. |
| 14 | Freeze picker excludes a player already frozen on this question | Team B's picker on Q2 after Team A froze Team C | PASS | Team C is missing from Team B's picker. API F7 409 `already_frozen`. |
| 15 | ×2 makes a player immune (missing from picker; API 409 `immune`) | Team A's ×2 on Q1; Team B's ×2 on Q2 | PASS | Team B is missing from Team A's picker on Q2 (×2 on Q2). API F5 and F8 409 `immune`. |
| 16 | Freeze lasts round(timer ÷ 4): 30 s → 8 s, 20 s → 5 s | API with 30 s and 20 s timers; DB check | PASS | F4 8000 ms, F13 5000 ms. DB `until_ms - used_ms` = 8000 for the UI freeze. |
| 17 | Timer off → 10 s | Not reachable | PENDING | The server rejects any question timer under 1000 ms (`api/rooms.php:801`), and the game has no timer-off setting (dev deviation 2). See OBS-66-01. |
| 18 | Target phone shows "❄ Frozen by …" banner with countdown | UI: Team B freezes Team A (EN); Team C freezes Team B (AR) | PASS | EN: "❄ Frozen by Team B: 5 s". AR: "❄ جمّدك Team A: 5 ث" (earlier run). The 5 s shown is the elapsed time of the navigation; the 8 s stored value is confirmed in the DB. |
| 19 | Send disabled during the freeze; the answer box stays editable | UI read during the freeze | PASS | `Send` disabled = true; text inputs disabled = false. |
| 20 | Server 409 `frozen` with remaining ms during the freeze; accepted after | API F11 during (remaining 7795 ms); UI after the freeze | PASS | F11 409 `frozen` remaining 6000–8000. F12 201. UI: "Answer sent: Test answer A" after the freeze ended. |
| 21 | A host pause does not stop the freeze | Host paused, then freeze; API pause call | PASS | P1: `until_ms` unchanged after `update_question`. UI: the freeze on Team A (by Team B) counted down while the host showed "Paused". |
| 22 | Question close ends the freeze; no carry-over | API: close during a freeze; next question | PASS | F15 closed; F16 409 `late` (not `frozen`); F17 no freeze and no targets; F19 the next question takes an answer (201). |
| 23 | Each refusal shows as a short message on the phone | Phone-side messages | PENDING | The reason codes are checked on the server (see row 46). The on-phone messages were not triggered in the UI. |
| 24 | Hint pattern, EN: first character and "_" per other character, gaps kept | UI Team A on AI "Bots" (EN); API H9 | PASS | UI: "Hint: B _ _ _". API H9 for "N _ _   _ _ _ _" exact. `UK` → `U _` is the same function path; checked by formula, not by a `UK` question. |
| 25 | Hint pattern, AR from the main AR answer, RTL, letters and digits LTR | UI Team C (AR) on AI "الترجمة المصاحبة (…)" | PASS | UI: "تلميح: ا _ _ _ _ _ _   _ _ _ _ _ _ _ _" (main answer, bracket part removed; 6 + 8 underscores). The line has `dir="rtl"`. |
| 26 | Fallback to the other language when the main answer is missing | Question with no AR answer | PENDING | Not run; no such question was picked. |
| 27 | Only my phone shows the pattern; other phones and payloads never have the pattern or the answer | API: pattern in Team B's and Team C's state, the public lobby, host answers poll | PASS | H2 (only Team B's state has it), H3 (other phones), H4 (public lobby), T2 and L1 (host answers poll). UI: the pattern does not appear on the Team B or Team C page. |
| 28 | After 💡, the player can type any answer; second use and use after sending refused | API H5 (second use 409 `used`), A2 (sent) | PASS | The after-sent refusal uses the same `sent` check as Freeze (A2). |
| 29 | Full answer never sent to the server or phones | Code review and API payloads | PASS | `room_question` has no answer field (`api/rooms.php:780-827`); the hint is only the pattern, checked by `ROOM_HINT_PATTERN` (`:114`), stored in `q_hint`; the host sends `hint` in `open_question`. No answer text found in any payload read. |
| 30 | ×2 armed only while no question is open | API C7 (409 `open`); UI board chip | PASS | C7 409 `open`. UI: the chip is on the board after Back to Board. See OBS-66-02 for the closed-question screen. |
| 31 | Armed ×2 shown on the host lobby and scoreboard, not cancellable | UI | PASS | "×2 armed for the next question" on the phone; host scoreboard "×2 armed"; the confirm says it cannot be cancelled. |
| 32 | A second arm gives 409 | API C3 | PASS | 409 `used`. |
| 33 | The ×2 applies to the next question and is spent whether or not the player answers | API O1 (doubles [0]), O2 (doubles []); UI: Team B's ×2 bound to Q2 | PASS | Team A's ×2 spent on Q1 with no answer from Team A on Q1 (UI). |
| 34 | Correct x2 on a normal cell | UI: Team A Correct on the 100 cell | PASS | Score 200 (+200 on 100). Team B Correct on 300 with ×2: +600 (Q2). |
| 35 | Correct x4 on the hidden double cell | Room 2: double cell "14:500"; Team A ×2 | PASS | Button label "Correct for Team A, plus 2000 points (double score) (×2 Double down)". Team B (no ×2) Correct on the same double cell: +1000 applied. Team A's +2000 was not applied: the mark locked after Wrong (OBS-66-03). |
| 36 | Wrong with ×2 costs the normal points | Room 2: Team A Wrong on the double cell with ×2 | PASS | Score −500 (normal). Not doubled. |
| 37 | Not marked → score unchanged | Room 1: Team C not marked on the first question | PASS | Team C stays 0 after the other marks. |
| 38 | Answers panel tags: ❄ froze X, ❄ frozen by X, 💡, ×2 | Host Answers panel on Q2 | PASS | "❄ froze Team C", "❄ frozen by Team B", "💡 Hint", "×2"; the frozen player with no answer shows "No answer yet". API T1. |
| 39 | Refresh keeps helpers left, ×2, freeze, hint, tags | Phones navigated away and back; host navigated away and back | PASS | Team A's hint and used chips kept; Team C's freeze banner resumed after navigation; armed ×2 text kept; host tags kept. The host timer after a reload: OBS-66-03 / BUG-66-02. |
| 40 | Each helper once per game; chip disabled after use | UI: Hint chip disabled after use; API V/H5 | PASS | Hint chip greyed after use; ×2 chip replaced by the armed text; API `used` on a second use. |
| 41 | Helper `helper` action: 401 without a device token, 403 for a token not in the room | API V1, V2 | PASS | 401 and 403. |
| 42 | Bad input gives 400 (kind, seq and target types, seq 0) | API V3–V6 | PASS | 400 for unknown kind, string seq, string target, seq 0. |
| 43 | GET on `helper` gives 405 | API V7 | PASS | 405. |
| 44 | 409 reason codes: off, used, goal, closed, open, sent, nohint, self, not_in_room, target_sent, already_frozen, immune, frozen, late | API suite | PASS | C1 closed, C3 used, C7 open, F1 closed, F2 self, F3 not_in_room, F5/F8 immune, F7 already_frozen, A2 sent, A3 target_sent, F11 frozen, F16 late, H5 used, H7 nohint, SW3 off. `goal` checked by code only (Golden Goal not run). |
| 45 | Unique key (one use per contestant and kind per game) | API: second use of each kind | PASS | C3 (×2) and H5 (hint) give 409 `used`; the database key is in the migration (`room_helpers` PK). The simultaneous race was not run here (the dev note reports it). |
| 46 | Room migration: `room_helpers` in the migrate file and both schema files; re-runnable | `grep`, `diff` of the blocks; local table check | PASS | `room_helpers` in `sql/migrate-add-rooms.sql`, `sql/schema.sql` and `sql/schema-hosted.sql`; the `room_helpers` blocks of the two schema files are identical; `ADD COLUMN IF NOT EXISTS` for `helpers` and `q_hint`. The migration was not re-run in this session. |
| 47 | Prepared statements; names as text, never HTML | Static: `innerHTML` grep, SQL grep | PASS | No `innerHTML` with data in `js/game.6ed2351f.js` or `js/join.d0e2bd19.js` (only comments). Helper SQL uses prepared statements. Runtime check with an HTML-like name: PENDING (not run). |
| 48 | ❄ and 💡 as escapes in source (D-81 i) | Grep | PASS | Code uses `String.fromCodePoint(0x2744)` and `0x1f4a1`; literal characters appear only in comments. |
| 49 | AR: chips, picker, banner, hint, armed text and refusal messages in Arabic, RTL | Team C phone (AR) on the board and question | PASS | "تجميد", "تلميح", "×2 مُفعّلة للسؤال التالي", "جمّدك"; the picker "من تجمّد؟"; hint dir=rtl. The AR refusal messages: row 23 (PENDING). |
| 50 | 375 × 812 with no sideways scroll | Same-origin iframe at 375 px (EN board) | PASS | scrollWidth 360 = clientWidth 360. Question screen checked by screenshot only. |
| 51 | 320 px with no sideways scroll | Same-origin iframe at 320 px (EN board) | PASS | scrollWidth 305 = clientWidth 305. The AR question screen at 320 px was not measured. |
| 52 | how-to-play.html #phones explains the helpers | Read `#phones` | PASS | "Helpers on the phones" section: once each, Freeze length and ×2 immunity, Hint pattern EN/AR and private, ×2 armed from the board with x2 / x4 and normal Wrong, no helpers in Golden Goal, the Admin switch, ABC / Swap / ½ for Host control only. No emoji in the guide text. |
| 53 | Native Arabic review of the new strings (FU-121) | Not possible here | PENDING (owner) | The AR strings are AI-drafted. |
| 54 | Live Hostinger smoke test with 3 or more real phones (FU-127) | Not possible here | PENDING (owner) | Owner's step. |
| 55 | Console: no JS errors | Read console on the host and phone pages | PASS | Only the generic "An unknown error occurred when fetching the script" (environmental, same as Sprint 3). No Uncaught or TypeError. |
| 56 | Host refresh keeps the Answers tags and the doubled Correct | Host navigated away and back on Q2 | PASS | Tags and "×2" on the scoring row still shown. |
| 57 | Deviation 1 (`helpers_enabled` also gates phone helpers) | Not run with `helpers_enabled` = 0 | PENDING (PO decision) | Decision only; see the deviations below. |
| 58 | Deviation 9 (a renewed room resets helper uses) | Not run | PENDING | Needs a room renewed after 6 idle hours. |
| 59 | Setting off: no ❄ 💡 ×2 on the phone or the host | UI | PENDING | Same as row 6. |
| 60 | Hint with a bracketed answer and an Arabic answer with tashkeel | Formula check (node) on the bank answers used | PASS | Bracketed main answer "البوتات (…)" → "ا _ _ _ _ _ _". The tashkeel marks are removed before counting (`hintPattern`). |

## Bugs

### BUG-66-01 (Minor): hidden ABC / ⇄ / ½ buttons stay in the DOM of phone games, labelled "helpers are turned off"

- **Where:** `js/game.6ed2351f.js:3125` (helper buttons are built for every row), `js/game.6ed2351f.js:3152` (the `srow-helpers` container is hidden for phone games, but kept), `js/game.6ed2351f.js:3227` (the label `helper.off` is returned for phone games, so it reads "helpers are turned off" even when helpers are on).
- **Steps to reproduce:**
  1. Admin switch `phone_helpers_enabled` = 1. Host: Players, Phone buzzer, two names, one category, Start Game.
  2. Open a question on the host. Find "3 choices for Team A".
- **Expected:** no ABC, ⇄ or ½ element in a phone game (US-66: "no ABC, ⇄ or ½ chips anywhere").
- **Actual:** the three buttons per contestant are in the DOM inside a `hidden` container with the label "3 choices for Team A (helpers are turned off)". They are not visible (`display:none`), but a search or the accessibility tree finds them, and the text is wrong because helpers are on.
- **Suggested fix:** do not build the helper buttons for phone games (or keep them out of the DOM); the label text should not describe the switch.

### BUG-66-02 (Minor, needs confirmation): a host reload of a paused question starts the timer again

- **Where:** host timer restore (`js/game.6ed2351f.js`, near the `pagehide` listener at line ~6073 and the restore of a board question). Not in the US-66 code path; probably pre-existing.
- **Steps to reproduce:**
  1. Open a question on the host; press Pause at 27 s (the button reads "Resume"; the phones show "Paused").
  2. Navigate the host page away and back to the same origin.
- **Expected:** the question is still paused at about 27 s, with "Resume" shown.
- **Actual:** after the return the host shows "Seconds left 29" and the button reads "Pause" (running). The phones' state after the reload was not read, so the mismatch is seen on the host only.
- **Action:** check on `main` whether this is pre-existing. If it is, record it as a follow-up, not a US-66 bug.

## Observations (not bugs; PO decisions)

- **OBS-66-01 (timer off):** the AC says timer off → 10 s. The server rejects a question timer under 1000 ms (`api/rooms.php:801`), and the game has no timer-off option, so the 10 s branch can't be reached (dev deviation 2). PO: confirm that the 10 s rule can stay as dead code.
- **OBS-66-02 (×2 on the closed-question screen):** after Show Answer or the timer ending, before Back to Board, the phone shows the "×2 Double down" chip on "The question is closed." The server accepts arming when the screen is `question` and no question is open (`api/rooms.php:1268-1275`). The AC says "armed from the board". The dev note (deviation 5) allows it. PO: accept or restrict to the board screen.
- **OBS-66-03 (marks lock after one choice):** once a host has marked a contestant Correct or Wrong on a question, both buttons are disabled for that contestant, so the mark cannot be changed. This is existing behaviour, not US-66, but it stopped the test from observing Team A's applied x4 (the label shows +2000; Team B's applied x2 on the same double cell shows +1000).
- **Deviation 4 (no second confirm on the picker name):** accepted. The AC asks for a confirm on the ❄ chip and then the picker; no second confirm is needed.
- **Deviation 1 (`helpers_enabled` also gates phone helpers):** not run with `helpers_enabled` = 0. PO decision, as the dev note says.

## Not run in this session (carried as PENDING)

- Golden Goal with helpers (rows 10, 11, 59 partly) and the Tournament regression (row 3).
- The UI with the switch off (rows 6, 59) and the on-phone refusal messages (row 23).
- The fallback to the other language (row 26), the runtime HTML name check (row 47) and the renewed-room reset (row 58).
- The AR question screen at 320 px (only the EN board was measured).
- The live smoke test with 3+ phones and the native Arabic review (owner: FU-127, FU-121).

## Verdict

**READY FOR PO.** No Critical or Major bug was found. Two Minor bugs: BUG-66-01 (hidden phone-game helper buttons and their label) and BUG-66-02 (needs confirmation whether it is pre-existing). Fix or accept both. Before the PO accepts US-66, the Golden Goal and Tournament regressions and the switch-off UI run should be done (PENDING rows), because the Definition of Done asks for them.

## Re-test 1 (after the developer's fix round 1)

Re-test run on 2026-11-27 on the same setup (local 8007, host on `c.localhost`, phones on `a.localhost`, `b.localhost`, `[::1]` (Arabic); one browser tab, so phones were navigated in turn). `phone_helpers_enabled` was set to 1 for the on-runs and is back to **0** (confirmed by SELECT at the end). Rooms used: 9A7P9F (Golden Goal), P7LCJG (on, AR 320 px), TYFBGB (switch off), and a tournament bracket (not started). The test-origin localStorage on `c.localhost` and `[::1]` was cleared between runs; the owner's `localhost:8007` storage was not touched.

### BUG-66-01 (hidden ABC / ⇄ / ½ in phone games): FIXED, verified

- Host page of a phone game with helpers on: `.srow-helpers` count 0, `.helper-chip` count 0, no "helpers are turned off" text in the page or any `aria-label`. The host's helper line ("Helpers left: Freeze, Hint, Double down", ❄ 💡 ×2) is still there.
- Host control: not re-run after the fix. The pre-fix host control check (ABC / Swap / Skip visible, no ❄ 💡 ×2) passed; the developer reports `hc-helpers.js` 11/11 after the fix. Post-fix host control: PENDING (tester did not re-run).

### BUG-66-02 (host reload restarts a paused timer): not a US-66 bug

- Reproduced by the developer in Host control with no phone code running: `showQuestion` restarts the timer (decision D-04). I did not re-run it. Recorded as existing behaviour, not a US-66 defect. Owner decision if a paused question should stay paused after a reload (new CR to D-04 for all modes).

### Re-test results

| # | Item | Steps | Result | Evidence |
|---|---|---|---|---|
| R1 | BUG-66-01 re-test (phone game: no ABC / ⇄ / ½ DOM, no "turned off" label) | Host page of room 9A7P9F with helpers on, question open | PASS | 0 `.srow-helpers`, 0 `.helper-chip`, no "turned off" text. Helper line present. |
| R2 | Golden Goal: no phone chips at the bet screen and the GG question | Room 9A7P9F: tie of 0 (End Game), Go for goal, Continue without missing bets | PASS | Phone A (bets): 3 `.jh-chip` elements in the DOM, none visible (`offsetParent` null). Phone B (GG question, Geography): 0 visible chips. The Scores card shows only the used badges. |
| R3 | Golden Goal: an armed ×2 is spent when GG starts | Team A armed ×2 on the board before End Game | PASS | DB: `room_helpers` row (Team A, kind `double`) has `seq = 0`; `b_seq` 1. |
| R4 | Golden Goal: server refuses helper use | Phone B, `fetch` helper with a valid token on the GG question | PASS | hint 409 `goal`; freeze 409 `goal`; double 409 `open` (question open). |
| R5 | Golden Goal: host rows show no ×2 tags | Host GG screen | PASS | Golden Goal rows show Correct / Wrong only. |
| R6 | Switch off: no chips on the phone, no helper line on the host | Room TYFBGB created with `phone_helpers_enabled` = 0; Team A joined | PASS | Phone: 0 visible chips; no "Helpers left" line. Host: no "Helpers left" text, no `.score-helpers` / `.srow-helpers` / `.helper-chip` visible. Note OBS-66-04. |
| R7 | On-phone refusal messages (each reason has a message, EN and AR) | Static: `jh.err.*` keys in `js/i18n.c2a5d0ae.js` (EN lines 657–669, AR lines 1307 on) | PASS (static) | Every refusal key used by the phone exists in EN and AR; `jh.err.failed` covers network errors. |
| R8 | On-phone refusal messages triggered in the UI | Race needed: a target sends between a picker opening and the tap | PENDING | Not run: one browser tab cannot hold a picker open while another phone answers (the answer would need the other phone's token). The reason codes are covered by the API suite (row 44). |
| R9 | Language fallback (hint in the other language when the answer is missing) | Code: `hintText()` in `js/join.d0e2bd19.js:808-815` returns the phone's language, else the other | PENDING | Code path checked; no bank question with a missing answer was run in the UI. |
| R10 | AR at 320 px on the question screen (board, hint, freeze picker) | Same-origin iframe (320 px) on `[::1]` with Team C, Arabic | PASS | `scrollWidth` 305 = `clientWidth` 305. The hint line wraps onto two lines with no overflow. The picker "من تجمّد؟" lists Team A and Team B with no overflow. |
| R11 | Tournament / Mokh Bot regression | Tournament setup with 3 contestants and AI | PARTIAL, PENDING | No "Game control" section and no phone radio in Tournament setup (unchanged). The bracket shows "Team B v Mokh Bot 🤖" and Start match. The match did not start in this run (the start flow was not completed). The developer's `s3tourney.js` 9/9 is the only evidence. |
| R12 | Renewed-room reset (a room renewed after 6 idle hours starts with no helper uses) | Would need the room's `seen_at` set 7 h back in the DB and a host action | PENDING | Not run (time and single-tab limits). |
| R13 | Owner-only: native Arabic review (FU-121), live smoke test with 3+ real phones (FU-127) | — | PENDING (owner) | Not possible here. |

### Observations from the re-test

- **OBS-66-04 (phone, switch off):** with the switch off, the phone still builds three `.jh-chip` elements (hidden, `offsetParent` null). They are not visible, so the criterion holds visually. Same class as BUG-66-01 on the phone side; low priority.
- **Host control after the fix:** not re-run by the tester (see above).

### Re-test counts

- Items R1–R13: PASS 8 (R1–R6, R7 static, R10), PENDING 5 (R8, R9, R11 partial, R12, R13 owner-only), FAIL 0. R11 counts as PENDING because the tournament match did not start.
- Bugs: BUG-66-01 fixed (verified). BUG-66-02 closed as not US-66 (D-04). No new bugs found in this re-test.
- Phone helpers Admin switch: back to 0.

## PO acceptance (2026-11-27)

**US-66: ACCEPTED with follow-ups.** No Critical or Major bug, 0 FAIL in both runs. BUG-66-01 is fixed and verified (R1). Golden Goal (R2 to R5) and the switch-off UI (R6) passed. Rulings are recorded as D-81 j to s in `docs/product-backlog.md`:
- **Deviations:**
  - 1: `helpers_enabled` also gates phone helpers. Accepted (k).
  - 2: no timer-off option exists. Accepted (l).
  - 3: column names. Accepted (n).
  - 4, 6, 7, 8 and 9: accepted (o).
  - 5: see OBS-66-02 below.
- **OBS-66-01:** the 10 s timer-off rule stays as a server guard and is not testable today. Accepted (l).
- **OBS-66-02:** arming ×2 on a closed question's screen. Accepted, because no question is open, which is the rule that matters. The AC is reworded (m).
- **OBS-66-03:** marks lock after one choice. This is existing behaviour, not part of US-66. The applied x4 goes to the owner's check (p).
- **OBS-66-04:** hidden phone chips with the switch off. Not visible, so accepted. The clean-up is FU-128, Could (q).
- **BUG-66-02:** this is D-04 behaviour, not a US-66 bug. A CR to D-04 is needed only if the owner asks (r).
- **PENDING rows** go to the owner's local check FU-129 (s):
  - Tournament match start (row 3 / R11);
  - Host control after the fix;
  - on-phone refusal messages (R8);
  - hint language fallback (R9);
  - an HTML-like name (row 47).
- **Owner-only, still open:** native Arabic review (FU-121) and the live smoke test with 3+ real phones (FU-127).

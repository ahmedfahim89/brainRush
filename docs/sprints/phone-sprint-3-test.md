# Phone Sprint 3 (US-65, Golden Goal bets on phones): test report

Branch `phone-buzzer`, worktree `BrainRush-phone-buzzer` (uncommitted). Tester run on 2026-11-27. No application code was changed. The dev note is `docs/sprints/phone-sprint-3-dev.md`.

Note: the `docs/sprint-plan.md` entry for Phone Sprint 3 still says "In progress". The status line is for the PO to update.

## Summary

- **Environment:** Windows 11, PHP 8.0.30 (`C:/xampp/php/php.exe`), local MariaDB with `sql/migrate-add-rooms.sql` already run. The server `php -S localhost:8007` was already running from the worktree and was used as is. Not run: `localhost:8008`.
- **Browser:** the Browser pane was limited to `localhost:8007`, so there was one real UI phone (Team A, reused by name) and the other phones were simulated with real device tokens through curl and node. The 375 px width is an emulated iframe (375x590), not a real device. Only one origin was available, so the phones were not in separate storages.
- **Owner's saved game:** the saved game of this browser on `localhost:8007` (`brainrush.game`, `brainrush.seenQuestions`, `brainrush.phone`) was moved aside before testing and restored afterwards. The host page was not reloaded after the restore, so the owner's room (RFX4V9) was not touched.
- **Test rooms:** 7MWDPE (API suite, closed), PCMPD4 (aged 7 h, removed by the server), FWR49N and 837292 (New Game, closed). All four are absent from `game_rooms`.
- **Scripts (scratchpad):** `s3api.mjs` (40 API checks, 39 PASS, 1 FAIL = BUG-65-01) and `s3api2.mjs` (release, rejoin, the negative-score limit, reveal with a missing bet).
- **Counts (35 rows):** PASS 27, FAIL 3, PENDING 5. Observations: OBS-65-01 and OBS-65-02.
- **Bugs:** BUG-65-01 (Minor), BUG-65-02 (Minor), BUG-65-03 (Minor, pre-existing on `origin/main`). No Critical or Major bug.
- **Verdict: READY FOR PO**, with the three Minor bugs to fix or accept. The live Hostinger smoke test with 3 or more real phones and the native Arabic review remain PENDING (owner).

## Acceptance criteria and tester focus (US-65, `docs/product-backlog.md`)

| # | Criterion | Steps | Result | Evidence |
|---|---|---|---|---|
| 1 | Bet screen per phone: category, own score, allowed range 0 to the limit | Golden Goal in phone mode; open Team A on the phone (EN, then AR at 375 px) | PASS | EN: "Category: Movies", "Your score: -100", "A whole number from 0 to 600". AR at 375: "رصيدك: 350-", "عدد صحيح من 0 إلى 600". |
| 2 | Limit = D-48: max(score, largest enabled point value) | API: points 100/200/300, scores 700 / 100 / -50 | PASS | `s3api.mjs`: A limit 700, B 300 (max(100,300)), C limit 300 for score -50. Browser: score -100 gives 600. |
| 3 | Bet over the limit gives 400 | API bet 701 (limit 700); browser types 601 and 601 in AR | PASS | API 400 "Bet a whole number from 0 to 700." Browser: "Enter a whole number from 0 to 600." (EN) and "أدخل عددًا صحيحًا من 0 إلى 600." (AR); nothing sent. |
| 4 | Negative, non-integer, string, null give 400 | API -1, 1.5, "12", "abc", null; browser -5 | PASS | All 400. Browser shows the same message and does not send. |
| 5 | Second bet gives 409 | API: bet 437, then bet 5 from the same device | PASS | 409 `reason: "duplicate"`. |
| 6 | Second bet over the limit gives 409 (locked) | API: bet 437, then bet 9999 | FAIL | Gives 400 instead of 409, BUG-65-01. |
| 7 | Sent bet is locked; still locked after a phone refresh | Browser: lock 437, reload the phone; AR: lock 600 | PASS | "Bet locked: 437. Wait for the others." before and after reload. Form gone. |
| 8 | Host: "Waiting for players to bet (n/N)", each name bet sent / waiting, no amounts | Host wait screen, reload during the wait | PASS | (1/3), then (2/3) with "Bet sent" / "Waiting"; a host reload kept (2/3). No amount in the host DOM (only rgb colour false positives). |
| 9 | Amounts never in the host's replies or other phones' payloads before reveal | API: state of B, lobby, `bets_status` after bets 437 (A) and 250 (B) | PASS | No 437 in B's or C's state, the lobby or the status reply. The host saved game holds `"wagers":{}` before the reveal. |
| 10 | Continue without missing bets: missing = 0 | Browser: Team C has no bet, tap Continue | PASS | Confirm "Continue without the missing bets? Team C will play for a bet of 0." Reveal gives `[null,250,300]`. Game 2 (AR) confirm "سيلعب Team C برهان 0". |
| 11 | Release and rejoin during the wait | API: release Team B, old token polls and bets, rejoin with a new token | PASS | Old token gets 403 on poll and bet. Rejoin shows `mine: 250`, the same token returns `you: 1`. UI not run. See OBS-65-01. |
| 12 | Host refresh during the wait keeps bets | Browser: reload the host at (2/3) | PASS | Same round, bets still counted, no new round. |
| 13 | All bets in: the question opens by itself | Game 2 (Teams): third bet sent | PASS | The round-2 question opened with no button press. |
| 14 | Question on phones with text box; answers in arrival order; late rejected | Browser: Team A sends "Agatha Christie"; API: Team B "Poirot"; Show Answer; API: Team C late | PASS | Host panel: Team A then Team B ("+9.6 s", "+27.3 s"). Late answer gives 409 `reason: "late"`, "Too late: the question is closed.". |
| 15 | The answer is never sent to phones | Code review and payloads of B and C after close | PASS | `room_question()` whitelist has no answer field. No answer text in the payloads. |
| 16 | Results scored as US-44 (Correct adds, Wrong subtracts) | Game 1: +437 / -250 / 0 (Team C no bet). Game 2: +600 / -100 / -50 | PASS | Game 1: 337 / -350 / -100. Game 2: 250 / -200 / -150. |
| 17 | Scores move only after the last mark (deviation 2) | Game 1: two marks, then the third | PASS | Scores stayed at -100 after two marks; the reveal ran on the third mark. Accepted deviation. |
| 18 | Repeat round when still tied | Game 2: B and C tie at -100 after the marks | PASS | "Still tied! … Round 2" offer. Next round, Go for goal: new bet screen "Round 2", score -350 for A, empty box. |
| 19 | Old-round bet gives 409 | API: bet on round 1 after round 2 opened | PASS | 409 `reason: "closed"`. |
| 20 | Game-over screen with standings on Results | Game 1 and Game 2 Results, phone game-over card | PASS | "Team A wins!", ranked rows, "you" marker. EN at 375 and AR at 375. |
| 21 | New Game: phones show "This game has ended." | Host New Game; phone reload | PASS | EN and AR ("انتهت هذه اللعبة."). API: state gives 404 after close. |
| 22 | Expired room (6 h idle) | API: `seen_at` set 7 h back in the local DB | PASS | Poll gives 404 and the row is deleted. The UI path is the same as the closed-room screen. |
| 23 | Teams mode | Game 2 with three teams | PASS | Join by team, bets, reveal, repeat round, game over. |
| 24 | AR / RTL, numbers isolated | AR bet screen, AR error, AR offer and results, digits "٢٥٠" and "٦٠٠" | PASS with note | Arabic-Indic digits accepted. The negative score is mis-rendered, see BUG-65-03. |
| 25 | Mobile width 375x812 | Phone pages in a 375x590 iframe | PASS | Bet screen, board, game over and ended screen fit with no sideways scroll. Emulated width only. |
| 26 | No console errors | Read console messages | PASS with caveat | No Uncaught, TypeError or ReferenceError. The generic "An unknown error occurred when fetching the script" (34 messages, also on the static guide page `how-to-play.html`) is environmental and not attributed to the sprint code. |
| 27 | Regression: Host control Golden Goal (masked entry, no rooms calls) | Host control game, two players, End Game (all 0), Go for goal | PASS | Masked "Team A, how much is your bet?" with Show and Lock in, unchanged. No rooms.php request after the Host control game started (the network log buffer is partial). |
| 28 | Regression: Tournament Golden Goal and Mokh Bot unchanged | Not run in the browser | PENDING | Code gate `phoneOn()` requires `!tourney` and `control === 'phone'` (`js/game.b9add461.js:8956`): PASS by review only. |
| 29 | Host refresh during the question and before the reveal | Not run | PENDING | Code path only. |
| 30 | A bet sent about 1 s before Continue still counts | Not reproduced | PENDING (PO decision) | Race by design. See OBS-65-02. |
| 31 | Phone result card after the reveal shows the current score | Browser: Team A after the reveal | FAIL | "Your score: -100" stays while the board shows 337, BUG-65-02. The result line "Correct! You won your bet: +437." is correct. |
| 32 | Arabic negative score shown as "100-" (minus after the digits) | AR host offer and repeat offer, AR phone bet card | FAIL | BUG-65-03 (Minor, pre-existing on `origin/main`). |
| 33 | Live Hostinger smoke test with 3 or more real phones | Not possible locally | PENDING (owner) | FU-119, FU-120. |
| 34 | Native Arabic review of the new strings | Not possible locally | PENDING (owner) | FU-121. |
| 35 | Static checks: `php -l`, no `innerHTML` with data, prepared SQL, `api/config.php` ignored | Lint, grep, `.gitignore` | PASS | `php -l` passes on `api/rooms.php` and `api/config.php`. `innerHTML` occurs only in comments. The room SQL uses prepared statements. `api/config.php` is in `.gitignore`. |

Counts: 35 rows, PASS 27, FAIL 3 (rows 6, 31, 32), PENDING 5 (rows 28, 29, 30, 33, 34).

Developer deviations, judged:
- **Scoring after the last mark:** accepted. US-65 says the reveal happens when everyone has been marked, and the result matches US-44.
- **Each phone gets its own amount (`bet.mine`):** accepted. No other amount is sent to any phone or to the host before the reveal.
- **Question auto-opens at 3/3:** accepted (US-65 criterion).
- **Room closes on New Game only (D-80 s):** accepted. Results keeps the room, so the phones show the standings.

## Bugs

### BUG-65-01 (Minor): a second bet over the limit gives 400, not 409

- **Where:** `api/rooms.php:927-928` (amount validation) runs before the duplicate check at line 939.
- **Steps to reproduce:**
  1. A phone with a limit of 700 bets 437 (201).
  2. The same phone bets 9999 with the same round.
- **Expected:** 409 `reason: "duplicate"` (a sent bet is locked, US-65).
- **Actual:** 400 "Bet a whole number from 0 to 700.".
- **Suggested fix:** check for this contestant's existing bet in the round before validating the amount.

### BUG-65-02 (Minor): the phone's bet card keeps the round-start score after the reveal

- **Where:** `js/join.e7f30eb8.js:810` (`t('jb.score', { score: formatScore(b.score) })`); `b.score` is the round-start score from `room_bet_view()` (`api/rooms.php:762-785`).
- **Steps to reproduce:**
  1. Finish a Golden Goal round with marks and the reveal (Team A bet 437, Correct).
  2. Look at the phone card.
- **Expected:** the current score (337), or a label that the score is the one from when the bets were placed.
- **Actual:** "Your score: -100" while the board shows 337.

### BUG-65-03 (Minor, pre-existing on `origin/main`): a negative Arabic score renders as "100-"

- **Where:** `formatScore()` plus `ltr()`: `js/game.b9add461.js:778` and `js/join.e7f30eb8.js:143`. The offer sentence uses it in `renderFinal` (`js/game.b9add461.js:6860-6863`, `final.lead1`).
- **Steps to reproduce:**
  1. Arabic UI, Golden Goal offer or repeat offer with negative scores (e.g. -100).
  2. Read "برصيد 100-" on the host, or "رصيدك: 100-" on the phone's bet card.
- **Expected:** the minus before the digits, as in "−100" in the score cards.
- **Actual:** the minus renders after the digits in the sentence.
- **Pre-existing:** the same `formatScore`, `ltr` and `final.lead1` call exist on `origin/main`. The phone bet line is a new surface, but the mechanism is not new. Not fixed in this sprint; the PO decides.

## Observations (PO decisions)

- **OBS-65-01:** a bet belongs to the contestant name (`room_bet_view` keys by contestant index). If the host releases a name and another phone claims it, that phone shows "Bet locked: 250". This is fine for a rejoin on the same phone; the PO should confirm it for a different person.
- **OBS-65-02:** a bet sent up to about 1 s before "Continue without missing bets" still counts. The confirm names the missing players from the last poll. This is the dev's documented limitation 3. Accept, or close the round before the confirm.

## Environment

- Windows 11, PHP 8.0.30, MariaDB (local), `php -S localhost:8007` from the worktree (already running).
- Browser pane limited to `localhost:8007`; phones simulated through curl and node with real device tokens; 375 px width emulated by an iframe.
- Owner's saved game moved aside and restored; no room of the owner touched.
- Test names only: "Team A", "Team B", "Team C".
- No commits, no branch switch, no code change.

## Re-test 1

Re-test run on the same worktree and port 8007, after Fix round 1 (dev note `docs/sprints/phone-sprint-3-dev.md`, "Fix round 1"). No code changed, no commit. The owner's saved game and phone entry were moved aside again for the browser tests and restored afterwards; no owner room was touched.

Static: `php -l api/rooms.php` passes; `node --check` passes on `js/game.b9add461.js`, `js/join.e7f30eb8.js` and `js/i18n.c8f82b64.js`; `innerHTML` appears only in comments.

| # | Item | Steps | Result | Evidence |
|---|---|---|---|---|
| R1 | BUG-65-01: a second bet over the limit gives 409 duplicate | API: bet 437, then 5, 9999, -1, "abc" from the same device; a bet on a wrong round | PASS | All four second bets give 409 `duplicate`; the wrong round gives 409 `closed`. Script `s3api3.mjs`. |
| R2 | BUG-65-01 after the close: an over-limit bet gives 409 closed | API: close_bets, then bet 99999 | PASS | 409 `closed`. |
| R3 | close_bets returns who has bet, never an amount | API: close_bets after two bets | PASS | `{"closed":true,"bets":[true,true,false]}`; no amount in the reply. |
| R4 | BUG-65-02: the phone card shows the current score after the reveal | Browser, Team A (Arabic): the card before the reveal, then after the reveal and Show Answer | PASS | Before the reveal "رصيدك: 0"; after the reveal "رصيدك: 437", and the board shows 437. |
| R5 | BUG-65-03: an Arabic negative score keeps its sign on the left (phone surfaces) | Browser, Team B phone (Arabic), after the reveal with a lost bet of 250 | PASS (DOM; visual at 800 px is ambiguous) | Bet card "رصيدك: −250" and result line "إجابة خاطئة: خسرت رهانك: −250." Both text nodes contain U+200E before U+2212, as `ltr()` now adds. |
| R6 | BUG-65-03: the host offer and repeat offer with a negative score | Not reached: the tie in this run was at 0 | PENDING | Same `ltr()` helper, so it should pass; check on a negative tie. |
| R7 | OBS-65-02: Continue names only the players whose bet is not in | Browser: Team A bet 437, Team B bet 250 (API), Team C no bet; Continue | PASS | Confirm: "لم يصل بعد رهان: Team C. من لم يصل رهانه عند المتابعة يلعب برهان 0." Team A and Team B are not named. |
| R8 | OBS-65-02: the notice after the close lists the zero bets | Browser, after the question opened | PASS | "يلعب برهان 0 (لم يُرسل رهانًا): Team C." on the question screen. |
| R9 | Row 29a: host refresh during the Golden Goal question | Browser: mark Team A correct, reload the host | PASS | After the reload the Team A mark is still shown, scores unchanged, timer running. |
| R10 | Row 29b: host refresh between the last mark and the reveal | Browser: the reveal request blocked in the test page, Team C marked (the last mark), the reveal fails ("تعذّر جلب الرهانات ... نحاول من جديد"), then reload the host | PASS | After the reload the reveal ran on restore: Team A 437 (+437), Team B -250, Team C 0 (no bet). |
| R11 | Host refresh during the bet wait keeps the bets (regression of row 12) | Browser: reload at (2/3) | PASS | Same round, both sent bets still shown. |
| R12 | Host control Golden Goal regression (masked entry, no rooms calls) | Browser: Host control, two players, End Game (tie at 0), Go for goal | PASS | Masked "Team A, how much is your bet?" with Show and Lock in. No rooms.php request after the Host control game started (the log is partial). |
| R13 | Tournament Golden Goal and Mokh Bot unchanged (row 28) | Not run in the browser this round | PENDING | The code gate `phoneOn()` is unchanged. The dev's `s3tourney.js` (9/9) was not re-run by me. |
| R14 | API suite re-run | `s3api3.mjs`, 12/12 | PASS | Covers R1 to R3. |

Re-test counts: 14 items. PASS 12 (R5 on DOM evidence), FAIL 0, PENDING 2 (R6, R13).

New bugs found in this re-test: none.

Notes for the PO:
- The host offer with a negative score (BUG-65-03, host side, R6) is the only part of the three Minor bugs not seen on screen in this run. Check it on a negative tie at the owner's local check, or in the next re-test.
- Row 28 (Tournament, Mokh Bot) stays PENDING. A short browser run of a tournament with Golden Goal is needed before release.
- Tool note: one Browser pane coordinate click missed the Golden Goal offer button; the same action worked with a DOM click. This is a test-tool issue, not an app bug.

## Verdict

**READY FOR PO.** No Critical or Major bug. Fix or accept BUG-65-01 (400 vs 409), BUG-65-02 (stale score on the bet card) and BUG-65-03 (Arabic negative score, pre-existing). The live Hostinger smoke test with 3 or more real phones (FU-119, FU-120) and the native Arabic review (FU-121) are owner gates. The Tournament and Mokh Bot browser regression (rows 28 and 29) is still to be run.

## PO acceptance (2026-11-27)

**US-65: ACCEPTED with follow-ups.** No Critical or Major bug. Accepted is not Done: the release (live smoke test, owner's release acceptance) stays open.
- **BUG-65-01, BUG-65-02, BUG-65-03 and OBS-65-02: fixed** in fix round 1 and passed in Re-test 1 (R1 to R5, R7, R8).
- **Pending rows:**
  - R6 (host offer with a negative Arabic score): same `ltr()` helper as R5, measured by the developer (`s3bidi.js`, 11/11, host offer included). Accepted; the owner sees it in FU-126 step 12.
  - Row 28 / R13 (Tournament and Mokh Bot): accepted on the developer's `s3tourney.js` (9/9 before and after fix round 1) and the `phoneOn()` gate. The owner runs a Tournament Golden Goal in FU-126 step 3.
  - Row 29 passed in Re-test 1 (R9, R10). Row 30 closed by the OBS-65-02 fix.
  - Rows 33 (live smoke test, 3+ real phones) and 34 (native Arabic review) go to FU-127 and FU-121.
- **The developer's deviations and OBS-65-01 are decided in D-80 as to ay.**
  - Scores move only after the last mark; each phone gets only its own amount; the question opens by itself when all bets are in; the room closes on New Game only; a separate Phones button on the bet wait. All accepted as built.
  - OBS-65-01: the bet belongs to the name, so a reclaimed name shows its bet locked. Accepted; hiding the amount after a release is a small CR if the owner wants it.
- **Follow-ups:**
  - FU-126: the owner's local check before the commit.
  - FU-127: the release (one hosted migration, deploy, live smoke test with 3+ real phones), combining FU-119, FU-120 and FU-123.
  - FU-121: extended for the new Arabic strings; a gate for the live release.

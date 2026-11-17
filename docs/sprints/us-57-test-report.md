# US-57 Earn the second chance: test report

Branch `us-57-earn-chance` (uncommitted), tested 2026-11-17 by the game-tester. Saved from the tester's messages (its rules do not let it write report files).

## Result

| Pass | Checks | Fail | Pending | N/A |
|---|---|---|---|---|
| First pass | 41 PASS | 1 (US57-01) | 5 | 1 |
| Retest after fix loop 1 | 33 PASS | 0 | - | - |

**Verdict: ready for PO.** US57-01 is fixed. The UX gate was run separately (below).

## First pass (summary)

- **Rule:** fresh run 0/5 with nothing held; a miss with 0 chances ends the run without the popup; earn at 5 ("+1 second chance!", "0/10 · 1 chance"); a miss does not move the counter; the popup says how many chances are held and keeps the streak; Use resets the counter to 0/10 and keeps the streak; the 2nd chance comes 10 correct answers after the Use (streak 18); with no misses, 2 chances at 15 and the counter hidden; two misses each open the popup, a 3rd ends the run; time-out at 7/10 then Use gives 0/10. All PASS.
- **Saves:** refresh keeps streak, chances and counter, including with the popup open (focus on Use); 7 kinds of invalid `chances` are discarded; US-54 saves upgrade (unused → 1 held, used → none held); a pre-US-54 save loads at 0/5. All PASS.
- **Keyboard:** Escape does nothing in the popup; Enter on Use uses the chance; Enter after a right answer goes on. PASS.
- **Arabic:** RTL, numbers isolated, plural forms, popup. PASS. The Arabic earn line says "حصلت على فرصة ثانية!" instead of "+1" (developer decision).
- **Layout:** 375x812 EN and AR, 1366x768 AR, and (retest) 1366x768 EN all fit with no horizontal overflow. PASS.
- **Other modes:** the Integration Quiz shows no counter or popup, and a miss ends the run; the Daily Challenge hides the counter and is unchanged; the leaderboard shows no chance marker. PASS.
- **Static:** `php -l` and `node --check` pass, no `innerHTML` with data added, the 5/10/2 come only from the named constants. PASS.

### Bug

| ID | Severity | Summary | Status |
|---|---|---|---|
| US57-01 | Minor | A saved run with a forged `current.chanceEarned = true` kept the run and showed a false "+1 second chance!" after a refresh | Fixed in fix loop 1: the flag is gone; the line comes from `chances.earnedAt`, and inconsistent saves are discarded |

### Observations

- O-3: once a saved run vanished during testing; not reproduced by the tester. The developer's seeded random-play test (4 runs, up to 120 steps, refreshes and Use included) found no path that drops a valid run.
- The counter is its own line under the streak count, not on the same line.

## Retest after fix loop 1

- US57-01 replay: no "+1" line, run kept; an injected `chanceEarned` field is ignored; a forged earn and 8 invalid `earnedAt` values are discarded; a valid control is kept. PASS.
- Regression: earn at 5 and refresh (still "+1"); popup at 8 and refresh; Use at 8 then 2nd chance at 18; 2 held at 15 and refresh; no "+1" at 16; two popups then "No chances left"; both US-54 upgrades. PASS.
- A29 English 1366x768. PASS.
- Isolation: every write call was blocked (game log, question stats, played); the DB snapshot and `logs/` were identical before and after.

## Not covered

- Integration Quiz path to 5 correct answers: the local bank has only 2 questions.
- Native review of the new Arabic strings (D-58 a).
- Screen reader announcement of the new live counter line.

## UX gate

`verify_states` through the Windows runner, 2026-11-17: `index.html` 130 element states and `how-to-play.html` 84 element states, all pass WCAG AA in default, hover and focus (receipts written). Fix loop 1 changed no page.

## Side effect of the first pass

About 27 question-stat POSTs from the first pass reached the local DB (`question_stats`); the questions they touched were not recorded. The 3 test leaderboard rows and the test game log were removed. The live site is not affected.

## PO acceptance (2026-11-17)

**US-57: ACCEPTED.** Every AC that can be checked now passes: start at 0, earn at 5 then 10 more, max 2, a used chance restarts the counter and keeps the streak, the counter and held count show, the popup says how many chances are left, refresh and invalid saves work, US-54 saves upgrade, Integration Quiz and Daily unchanged, no leaderboard marker, EN and AR texts, layouts and UX gate. US57-01 is fixed and retested. The US-56 AC does not apply until US-56 is built.

Developer decisions (D-70): (1) held count only from the first earned chance: accepted; (2) Arabic earn line without "+1": accepted, part of the native review; (3) counter on its own line under the streak: accepted, owner confirms in the local test; (4) US-54 saves upgrade as 1 earned: accepted; (5) not covered: Integration Quiz 5-correct path goes to the live smoke check (FU-85), native Arabic review FU-84, screen reader FU-86. None blocks. O-3 not reproduced; the owner watches for it. Follow-ups: FU-83 (owner local Chrome test, then commit), FU-84, FU-85 (deploy), FU-86. Status: accepted, awaiting the owner's local test.

## CR hearts (2026-11-17)

Owner request: two heart slots instead of the "1 chance / 2 chances" text (gray = not earned or used, red = held), a pop when a heart turns red and a break when a life is used. Branch `chance-hearts`. Tested by the game-tester, with every write call answered in the browser.

**Result: 58 PASS, 0 FAIL, 4 pending.**

- Fresh run: 2 gray hearts, "Second chances: 0 of 2", "Next chance: 0/5". Earn at 5: the 1st heart pops red, "0/10". Miss: popup, heart stays red. Use: the heart breaks to gray, "0 of 2". 10 correct after the Use: pop, counter gone. 2 red at 15; two Uses break heart 2 then heart 1; a miss at 0 ends the run. PASS.
- Animations play only on the live earn or use: not on a refresh, Next, a language switch or the popup opening. No layout shift (layout-shift total 0). Reduced motion: colour change only. PASS.
- Labels correct at every step in EN and AR; SVGs aria-hidden, group role="img"; the live line is not rebuilt when nothing changed. Arabic: red fills from the right. 1366x768 and 375x812 fit. Christmas theme (settings response overridden in the browser, no DB write) looks right. PASS.
- Integration Quiz and Daily Challenge show no hearts. No references left to the removed keys `chance.held` / `chance.none`. No emoji added; `php -l` and `node --check` pass. PASS.

Observations:

- H-01: after a run ends by a miss with 0 chances, the line stays visible with gray hearts. Accepted as intended: the hearts show the run's state, as the "No chances left" text did.
- H-02: under reduced motion no `animationend` fires, so the animation class stayed on the heart. Fixed after the test: no animation class is added under reduced motion (one line in `renderChanceCounter`, `node --check` passes).
- H-03: a language switch rebuilds the line, so it may be read out once in the new language. Accepted.
- I-01: opening the Daily Challenge (a GET) created today's 3 `daily_challenge` rows in the local DB, which the app does on the first Daily load of the day anyway. Left in place.

Pending: screen reader (FU-86), native Arabic review of `chance.hearts` (FU-84), the real Christmas Admin toggle (not switched to avoid a DB write).

UX gate: `verify_states` passes on `index.html` (130 element states) and `how-to-play.html` (84), WCAG AA in default, hover and focus.

### PO acceptance, CR hearts (2026-11-17)

**CR hearts on US-57: ACCEPTED.** All the owner's points are met and tested: 2 heart slots from the start of the run, red = held and gray = not earned or used, the pop on an earn and the break on a Use, only on the live event, no layout shift, reduced motion respected, EN and AR (red from the right), both widths, Christmas look, no hearts in the Integration Quiz or Daily Challenge, removed keys unused.

H-01 intended; H-02 fix accepted (owner checks it in FU-83); H-03 and I-01 accepted. Developer decisions (line order, colours, animations, one announcement) accepted, recorded in D-71 f. US-57 ACs rewritten for the hearts. Pending, not blocking: FU-83 (owner local test, now with the hearts, animations and the real Christmas toggle), FU-84 (`chance.hearts` added, removed keys dropped), FU-85 (live smoke check with hearts), FU-86 (hearts label). Status: CR hearts accepted, awaiting the owner's local test.

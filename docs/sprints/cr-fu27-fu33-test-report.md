# Test report: CR cr-fu27-fu33 (FU-27 Report text, FU-33 Golden Goal bet 0)

Date 2026-11-11. Branch `cr-fu27-fu33` (uncommitted). Tester: Senior Tester agent.

## Environment
- Windows 11, XAMPP PHP + MariaDB (I started MariaDB myself; it was not running; shut down afterwards), `php -S localhost:8011`, in-app browser. Server stopped afterwards.
- Admin setting `final_round_enabled` was already 1 (no change, nothing to restore).
- Writes stubbed in the page (game-log, question-stats, streak writes); board question reads passed through. Not stubbed: opening the Daily Challenge created today's 3 `daily_challenge` rows. I deleted them; counts before/after identical (daily_challenge 6, question_stats 33, question_reports 1, no new game log file).
- No application code changed. Static checks: only front-end JS and static text changed; no PHP touched, so no `php -l` needed.

## Summary
PASS 14, FAIL 0, PENDING 0 (one limitation: 375px/1366px checked by measuring in same-size iframes, not a visual window resize).

## FU-33 Golden Goal
Test: 3 teams (Team A, B, C), A and B tied for first on 100 via +, C on 0. End Game, Go for goal, bets A=0, B=400, C=200.

| Check | Result | Evidence |
|---|---|---|
| Unmarked rows show nothing | PASS | `.srow-wager` text "" for all three before marking |
| Bet 0, Correct, EN | PASS | text "0", class `is-correct`, green rgb(76,209,138) |
| Bet 0, Wrong, EN | PASS | text "0", class `is-wrong`, red rgb(255,107,107) (second game) |
| Bet 0, Correct, AR UI (rtl) | PASS | text LRI+"0"+PDI, screenshot shows plain 0, no sign |
| Bet 0, Wrong, AR UI | PASS | LRI+"0"+PDI, red, screenshot confirmed |
| 400 / 200 still signed | PASS | "+400" (green), "−200" (red) in EN and AR (LRI/PDI wrapped, LTR) |
| Refresh mid-round keeps rows | PASS | after reload: "0", "+400", "−200" with the same classes |
| Row colour unchanged | PASS | classes `is-correct`/`is-wrong` as before; 0 row is green/red |
| Screen-reader status unchanged | PASS | EN "Team A marked wrong, bet 0, score 100", "Team B marked correct, bet 400, score 500", "Team C marked wrong, bet 200, score −200"; AR equivalents show "الرهان 0" etc. |

Observation (not a bug): a team can only be marked once, so Correct and Wrong for the 0 bet were tested in two separate games.

## FU-27 text
| Check | Result | Evidence |
|---|---|---|
| how-to-play Report bullet in "Answering a question", last item, Report bold | PASS | section h2 "Answering a question"; bullet text and `<strong>Report</strong>` rendered; screenshot |
| Links `#streak`, `#daily` work | PASS | click scrolls to the targets (top 17px); headings Sudden Death Streak / Daily Challenge |
| Contents and Quick start unchanged | PASS | git diff: one added line only; contents hrefs intact |
| Layout 375px and 1366px | PASS | no horizontal overflow (scrollWidth = clientWidth); bullet width 279 / 650 px. Measured in iframes |
| terms.html line, Report bold | PASS | "Found a wrong answer or a missing photo credit? Please use **Report** on the question screen, or tell us at the contact address below." fontWeight 700 |
| llms.txt line present and consistent | PASS | line 15, served at /llms.txt; wording matches the how-to-play text (Streak and Daily, once answered) |
| Report is offered where the text says | PASS | board question open: Report visible. Streak: hidden before answer, visible after picking. Daily: hidden before, visible after picking. (Golden Goal question also shows Report, not mentioned in the text; "on the question screen" covers it.) |

## Regression
| Check | Result | Evidence |
|---|---|---|
| Board game: setup, start, open tile, Show Answer, Correct, back, End Game, Results | PASS | winner screen "Team A wins!" with 100 / 0; Golden Goal path also reached Results (Team B 500, Team A 100, Team C −200) |
| Console errors | PASS | no app console errors; all network requests 200. The browser tool reported 3 "unknown error occurred when fetching the script" entries that match no failed request (tooling noise) |

## Bugs
None found.

## Verdict
READY FOR PO

## PO acceptance
2026-11-11, Product Owner.
- **FU-27: ACCEPTED.** The how-to-play, terms and llms.txt lines match the row, add no claims about stored data, and the tester saw Report where the text says it is. Naming the Daily Challenge as well as the Streak goes beyond the row but is accepted: Report really is offered on an answered Daily question (`reportTarget()`, test row "Report is offered where the text says"), and leaving it out would make the text less accurate. Not naming Golden Goal is fine; "on the question screen" covers it.
- **FU-33 item 2: ACCEPTED.** A marked bet of 0 shows "0" (Correct and Wrong, EN and AR, after a refresh); other bets keep their sign; the screen-reader status and the row colours are unchanged. Items 1 and 3 lapsed with D-51 (D-52 f).
- Backlog: FU-27 and FU-33 Done; the Story status rows now show the follow-ups the owner closed today and the Sprint 12 / US-50 cancellation.

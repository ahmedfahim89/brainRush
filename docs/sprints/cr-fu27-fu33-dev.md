# FU-27 and FU-33: developer note

Change request outside the sprint cycle, branch `cr-fu27-fu33`, 2026-11-11. Two small follow-ups from the backlog; no rule, API, DB or saved-game change.

## Items implemented
- **FU-27 Player-facing text for Report (US-42).** Static pages only; no new claims about stored data (`privacy.html` stays the only place for that).
  - `how-to-play.html`: one new bullet at the end of "Answering a question": a wrong or unclear question can be reported with **Report** on the question screen (on a Streak or Daily Challenge question, once it is answered). It links to `#streak` and `#daily`, which exist. No new section, so the Contents list and the Quick start links are unchanged.
  - `terms.html`: "Found a wrong answer or a missing photo credit? Please use **Report** on the question screen, or tell us at the contact address below."
  - `llms.txt`: one feature line about the Report button (Streak and Daily Challenge once answered).
  - The backlog row names the Streak only. The code (`reportTarget()` in `js/game.*.js`) also offers Report on a Daily Challenge question once it is answered, so the text names both to stay accurate.
- **FU-33 item 2 (Golden Goal bet of 0).** A marked bet of 0 showed "+0" or "−0" in the scoring row. A new helper `finalDelta(mark, wager)` in `js/game.*.js` returns "" before the mark, plain "0" for a bet of 0, and "+N" / "−N" otherwise (still wrapped by `ltr()`, so it stays left to right in Arabic). Items 1 and 3 lapsed with D-51 (D-52 f).
  - Other paths checked: the screen-reader status `final.statusCorrect` / `final.statusWrong` (EN and AR in `js/i18n.*.js`) already shows the bet without a sign, so "bet 0" was already right; the Results share text (`resultsShareText`) uses final scores only, no delta; `js/share.*.js` formats no delta. No change there.

## Files changed
- `js/game.38d934d9.js` (hashed asset edited in place; the pre-commit hook re-hashes it and rewrites the HTML references)
- `how-to-play.html`, `terms.html`, `llms.txt`
- `docs/product-backlog.md` (FU-27 and FU-33 marked Done)
- `docs/sprints/cr-fu27-fu33-dev.md` (this note)

No CSS, PHP, SQL or i18n file changed. Line endings kept as found (CRLF for the JS file and `llms.txt`, LF for the HTML pages and the backlog).

## How it was verified
- `node --check js/game.38d934d9.js`: no syntax error.
- `finalDelta` and `signed` were taken from the edited file and run in Node with English and Arabic `ltr()`: correct/0 and wrong/0 give "0"; correct/400 "+400"; wrong/200 "−200"; unmarked "". In Arabic the same values come wrapped in LRI/PDI. Saved bets are always integers (`isValidWager`), so the `=== 0` check also holds after a refresh.
- The static text changes add one list item or a few words to existing elements; the D-30 game layout (question screen) is not touched.
- No PHP touched, so no `php -l` needed. No server was started and the local DB was not used.

## Known limitations
- The row keeps its green / red mark colour on a "0", as the Correct / Wrong mark itself is shown; only the text changed.

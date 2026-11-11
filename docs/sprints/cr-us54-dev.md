# CR US-54: free second chance in the Streak Challenge: developer notes

Branch `streak-second-chance` (2026-11-11). Owner request, D-64. Client-only, Streak Challenge only.

## Files changed
- `js/game.*.js`: `secondChanceUsed` in the run (optional on load, so older saves count as unused); `isStreakPending()`; `streakAnswer` leaves `over = false` on the first miss; `onStreakSecondChance()` -> `nextStreakQuestion(true)` (the flag is set only when the new question opens, so a failed load does not burn the chance); `renderStreakButtons()` / `setSecondChanceButton()`; Enter, Android Back and focus handling; validation allows a lost `current` while the chance is unused; Daily Challenge panel hides the button.
- `index.html`: `#streak-second-chance` button, hint key `streak.hintChance`. `integration-quiz.html` is untouched (the code tolerates the missing button; `INTEGRATION` never offers the chance).
- `js/i18n.*.js`: `streak.secondChance`, `streak.hintChance`, reworded `streak.setupHint` (English and Arabic).
- `how-to-play.html`, `llms.txt`, `docs/spec.md`, `docs/product-backlog.md` (US-54, D-64).

## Not changed
`api/streaks.php`, `api/game-log.php`, `api/questions.php`, the leaderboard (no marker).

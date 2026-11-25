# US-60 Speed Round leaderboard: developer notes

Branch `speed-leaderboard` (from `main` 55b54a3), uncommitted. Owner request 2026-11-25, decision D-76, story US-60 in `docs/product-backlog.md`.

## What changed

**Server (reuses the Streak leaderboard, no copy)**
- New table `speed_scores`: the columns and keys of `streaks` (`id`, `name` VARCHAR(30), `streak` INT UNSIGNED = the run's correct answers, `created_at`, keys on `name` and `streak`).
- `api/streaks.php`: `speed_scores` added to the `STREAK_TABLES` whitelist; header comments name the new includer. No logic change.
- New `api/speed-scores.php`: `STREAKS_INCLUDE_ONLY`, then `streak_board_request('speed_scores')`. Public GET (top 10, `?period=week|all`) and POST `{name, streak}`; admin-only `GET ?all=1` and `DELETE ?id=`. A missing table returns 503 with a clear message (same pattern as the Integration Quiz).

**Game (`index.html`, `js/game.*.js`, `js/i18n.*.js`, `css/style.*.css`)**
- Name step: the Speed popup's first part (`#speed-intro`) is now a form. It shows the rules (first run on this device only), a "Challenger name" field (prefilled, the Streak's checks and messages, `dir="auto"` in Arabic), and Back and Start. Enter submits. Every run asks before the 3-2-1 countdown. Back (the button or Android Back) drops the run.
- Prefill order: the run's own name (after a reload on the name step), then `localStorage` `brainrush.challengerName` (written when a Streak or Speed run starts; not by the Integration Quiz), then the first Players-row name.
- Saved run: `SPEED_VERSION` is now 2. `run.name` is null until Start, and a started run must have a name. The result gains `name`, `save` (`none` | `pending` | `saved` | `dropped`) and `saved` (the server reply). A version 1 save keeps its personal best, drops its run (it has no name) and shows its result without a rank line.
- Result: when a run ends with 1 or more correct answers, it is posted to `speed-scores.php`. While it saves, the line reads "Saving your score...", and Play again and New Game are disabled. Then it shows the rank line (the Streak's wording: "You are #2 this week and #7 of all time.") or the failure with Try again. A pending save is sent again when the result is shown after a reload. Leaving an unsaved result asks "Your score of N was not saved. Leave it unsaved?". A score of 0 is not saved and shows "Only runs with 1 or more correct answers go on the leaderboard."
- Leaderboard screen: one screen for both boards. `LB_BOARDS` holds each board's text keys, and `lbBoard` holds the board on show. The heading's `data-i18n` key is swapped, so a language switch keeps it, and the page's own key is restored for the Streak (and the Integration Quiz's `iq.leaderboard`). The API, rows ("· 18 correct ·"), empty texts, list label, headline and Try again follow the board. The load counter is bumped on open, so a late response from the other board is dropped. The Speed board shows Back only (to its result, or to setup). Android Back on it never runs the Streak's New Game. No ad on the Speed board.
- Entry points: "🏆 Leaderboard" on the result, and an icon-only 🏆 button right of the Speed Round button on setup (`#speed-board-btn` in `#speed-pair`, aria-label and tooltip "Speed leaderboard", hidden with the Speed button). Shared helpers were factored out of the Streak code: `rankText()`, `isValidRankReply()`, `showSaveFailure()` and `validateNameField()`.
- i18n: new `speed.*` keys in EN and AR (`nameHint`, `leaderboard`, `boardBtn`, `lbHeadline`, `lbSaving`, `lbSaveFailed`, `lbOnlyOne`, `lbEmpty`, `lbEmptyWeek`, `lbTopAll`, `lbTopWeek`, `unsaved`). The Arabic needs the owner's review (FU-102).

**Admin (`admin.html`, `js/admin.*.js`)**
- The Streak panel code is now generic (`RUN_BOARDS`: `streaks`, `speed`). It adds a **Speed leaderboard** panel (name, correct, played, Delete with confirm). The Streak panel behaves as before.

**SQL and docs**
- `sql/migrate-add-speed-scores.sql` (new, idempotent), `sql/schema.sql`, `sql/schema-hosted.sql`.
- `docs/product-backlog.md` (US-60, D-76, status row, FU-100 to FU-103), `docs/sprint-plan.md` (change request section), the Admin "Speed Round" setting hint (no longer says nothing is saved on the server), `docs/spec.md`, `how-to-play.html` (#speed), `privacy.html` (the leaderboard entry and the remembered name; "Last updated" set to 26 November 2026), `llms.txt`, `README.md`, `docs/deploy-hostinger.md` (table list, upload list, new "Speed leaderboard" redeploy step).

## Files

New (need `git add` before the commit): `api/speed-scores.php`, `sql/migrate-add-speed-scores.sql`, `docs/sprints/us-60-dev.md`. There are no new js/css files.

Changed: `docs/sprint-plan.md`, `api/streaks.php`, `index.html`, `admin.html`, `how-to-play.html`, `privacy.html`, `llms.txt`, `README.md`, `js/game.30c7287b.js`, `js/i18n.b0de0bd3.js`, `js/admin.a29fa091.js`, `css/style.7d9260e9.css`, `sql/schema.sql`, `sql/schema-hosted.sql`, `docs/spec.md`, `docs/product-backlog.md`, `docs/deploy-hostinger.md`.

Expected hashes after the pre-commit hook (from `git hash-object` on the current files; they change if anything else is edited before the commit):

| Now | After the hook |
|---|---|
| `js/game.30c7287b.js` | `js/game.a2183a0c.js` (after fix loop 1; was e34d4257) |
| `js/i18n.b0de0bd3.js` | `js/i18n.6c5c7eba.js` |
| `js/admin.a29fa091.js` | `js/admin.962f09ef.js` |
| `css/style.7d9260e9.css` | `css/style.4c4c80aa.css` |

The hook rewrites the references in all 8 pages (`index`, `admin`, `how-to-play`, `about`, `contact`, `privacy`, `terms`, `integration-quiz`). I did not run `hash-assets.sh` (it does `git mv` / `git add`).

## Migration order

1. Local: done (`mysql -u root brainrush < sql/migrate-add-speed-scores.sql`, run twice to confirm it is idempotent).
2. Hosted: import `sql/migrate-add-speed-scores.sql` in phpMyAdmin **before** uploading the code. Without the table the API answers 503 and the result shows "could not be saved".

## How to test locally

- Dev server I used: `C:/xampp/php/php.exe -S localhost:8011 -t .` (port 8011, so the owner's :8000 is untouched). Admin 401 was checked on a throwaway copy of `api/` on port 8012, whose `config.php` wraps the real one and adds a test-only login. The real `api/config.php` was not edited, and its contents were never displayed.
- curl (all as expected): GET `[]` then the top 10 (best per name, case-insensitive: "US60 Tester" 7 then "us60 tester" 9 gave one row with 9; the earlier of two 9s ranks first); `?period=week` and `?period=all` 200; `?period=month` 400; POST 201 `{rank, best, week_rank, week_best}`; streak 0 or "abc" 400; empty name 400; 31-character name 400; body not JSON 400; PUT 405; `?all=1` and DELETE without a login 401, wrong password 401; with the login, list 200, DELETE 200, then 404, `id=abc` 400; table renamed away gives 503. `streaks.php` and `integration-quiz.php` still answer 200.
- Browser (Playwright with system Chrome, scripts in the session scratchpad): 51 checks in the main run: 50 pass, and 1 over-strict layout check of mine fails ("trophy on the toggle row"; see the layout note below). 10 more for the Streak regression and Admin, all pass. Covered: the 🏆 beside the Speed button, the board from setup (title, rows "· N correct ·", tabs, list label, no ad, Back focus), Streak board title and rows unchanged; the name step (rules on the first run, prefill, required error, Back = no run, maxlength 30); a run of 2 correct gives the POST body `{"name":"PW Tester","streak":2}`, the rank line, `save: 'saved'` persisted and the result fitting 1366x768; the board from the result (headline, highlighted row, Arabic texts, back to English, Back to the result); a POST failure gives Try again, a reload sends it again, Try again saves; leaving unsaved asks (Cancel stays, OK drops); score 0 sends no POST and shows the only-one line; a reload on the name step returns to it; a v1 result shows without a rank line and no POST; a v1 started run is dropped with best 12 kept; 375 and 320 px with no sideways scroll on setup, name step, result and board; integration-quiz.html has no JS errors and keeps its own title key; the Streak save failure and Try again still work and leave the name for the Speed prefill; Admin lists Speed runs with card labels and deletes one.
- Layout note: at 1366 px the solo buttons already sat on the line below the Players/Teams toggle before this change. In English, with all four solo buttons on, they fit on that line with the 🏆. In Arabic, Speed and 🏆 wrap together to a third line (FU-103).

## UX gates

- `lint_hardcodes.py` on the added lines of the CSS, index, admin and both JS files: OK (no hardcoded values). The whole-file run flags 236 values that were there before; the house rem pattern is used.
- `check_no_emoji.py` on the added lines: 2 findings, both the 🏆 in `index.html` (setup button and result button). This is the existing pattern of the Streak board button, which the owner allowed. Nothing else (no dashes).
- Contrast (measured with the plugin's `contrast.py`): label and hint 7.43:1, field error 9.76:1, input 16.00:1, trophy on setup 6.23:1, Leaderboard button on the result 7.18:1, its hover 4.99:1, rank line 16.72:1, Back 12.80:1, Start 10.68:1. All AA.
- `verify_states` and `verify_overflow` through the Windows runner, with receipts written (exit 0) on every edited page: index.html 160 element-states AA, admin.html 110, how-to-play.html 90, privacy.html 78; overflow OK at 320/414/1280 on all four. These static-page gates do not open the popup or the result, which the Playwright run covered.

## Known limitations and choices for the owner

- D-76 e to j: one card for the rules and the name, with a visible Back; the icon-only 🏆 on setup; the result keeps its own screen; no ad on the Speed board; the remembered name; no name in the game log.
- A reload while the POST is in flight can save the run twice (the same as the Streak). The board shows the best per name, so the rank is unaffected.
- The public POST can be faked (D-37). The admin deletes junk names in the new panel.
- Not exercised: Android Back on the name step and on the Speed board (it only runs inside the app; code read only, see FU-92).
- An Arabic 375 px look at the name step and the result (save failure line) showed no sideways scroll and the field with `dir="auto"`.
- My test runs added 9 increments to the local `question_stats` counters (Speed and Streak answers send their outcome, which is existing US-59 behaviour; the question open at time's up sends none). They cannot be undone exactly, because the table only holds totals. The test rows in `speed_scores` and `streaks` and my game log lines were removed.

## Fixes (fix loop 1, test report `docs/sprints/us-60-test-report.md`)

- **BUG-60-01 (Major), fixed** in `js/game.*.js`. A result saved before US-60 crashed the Speed board. Causes: a null name (`toLowerCase` on null), the headline "null: 3 correct!" and the line "Only runs with 1 or more ...".
  - `loadSpeed()` now treats any result without a save state (version 1, or a version 2 result missing `save`) as "not on the board": name null, save `none`, saved null. Its best is kept.
  - `speedBoardResult()` returns null when the result has no name or is not pending or saved (`none`, `dropped`). The board then shows no headline, no rank line and no highlighted row, as when opened from setup.
  - `renderLeaderboardHead()` and `renderLeaderboardRows()` guard a missing name themselves, so a language switch cannot throw either.
  - Back from the Speed board now returns to the result whenever the result screen is open (`speed.onResult`), even with no headline.
  - The result's line "Only runs with 1 or more correct answers ..." shows only for a score of 0.
  - Re-tested in Chrome: the tester's repro (version 1, `name: 'Team A'`, `save: 'saved'`), version 1 with no name, and version 1 with `save: 'none'`. All three give no error, no headline, no rank line and no highlighted row; the rows list; EN to AR to EN switches cleanly; Back returns to the result. The same shapes under version 2: no name and `save: 'none'` behave the same way, and a named saved result correctly shows its headline, rank and row. A normal saved result still shows "team a: 5 correct!" and "You are #1 this week and #1 of all time.". The full main run is 50 of 51 again (the one failure is still my over-strict trophy-row check). Game log and question-stats writes were blocked in these runs.
- **BUG-60-03 (Minor), fixed** in `api/streaks.php`: `delete_streak()` now answers 404 "Run not found" for all three tables. Streak, Integration Quiz and Admin only check the status code, so nothing else changes. The 401 "Login required to change content." comes from `api/db.php` and is shared by every admin endpoint; left as is.
- **BUG-60-04 (Minor), open question for the owner:** after a run, the result can show "New personal best!" (the device's best) and "Your best is still 5." (that name's leaderboard best) together. Both are true, but the wording may confuse. Options: keep it, or reword the leaderboard line (for example "Your leaderboard best is still 5.").
- **BUG-60-02** (missing image `landmark-one-world-trade-center.jpg`) was already there before US-60 and is not in this change.
- **Data:** the Team A row I seeded for the test was removed. `speed_scores` is empty again (it was empty when I started). `streaks` (17 rows, max id 28), `question_stats` (total 223) and the game logs are unchanged.


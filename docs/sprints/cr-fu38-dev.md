# Change request FU-38 (Kilo Meshakkal constants in one place): developer note

Branch `cr-fu38`, 2026-11-11, cut from `main` after PR #102. FU-38 / D-54 (g): the Kilo Meshakkal id (`-1`) and name (`'Kilo Meshakkal'`) were defined three times on the PHP side. This is a refactor: **no behaviour change**. The backlog and the sprint plan are not edited; the PO records the decision.

## What changed
- **`api/db.php`**: new shared pair `MIX_ID = -1` and `MIX_NAME = 'Kilo Meshakkal'`, after `PLAYABLE_HAVING`, with a comment that names its users (questions.php, game-log.php, categories.php) and the game's own copy in `js/game.js`.
- **`api/questions.php`**: removed its `MIX_ID` / `MIX_NAME` definitions; the header comment now says `MIX_ID` is in db.php. All usages keep the same names.
- **`api/game-log.php`**: removed `GAME_LOG_MIX_ID` / `GAME_LOG_MIX_NAME`; their usages in `read_category_names()` now use `MIX_ID` / `MIX_NAME`. The header comment points at db.php.
- **`api/categories.php`**: removed `CATEGORY_MIX_NAME`; `save_category_name()` uses `MIX_NAME`, and its doc comment points at db.php.
- **`js/game.*.js`**: values unchanged (`MIX = -1`, `MIX_NAME = 'Kilo Meshakkal'`, a separate runtime). Only its comment changed: it must match `MIX_ID` / `MIX_NAME` in `api/db.php`.

Each of the three API files loads db.php with `require_once __DIR__ . '/db.php'` before any use. `daily.php`, `integration-quiz.php` and `mcp.php` include `questions.php` and db.php, always with `require_once`, so the constants are defined once only. No other PHP file defines `MIX_ID` or `MIX_NAME`.

Stale references checked: `sql/`, `admin*`, `README.md`, `docs/spec.md`, `docs/deploy-hostinger.md`, `how-to-play.html`, `js/i18n.*.js` and CSS name Kilo Meshakkal but not the old constants or their files. The older sprint notes (`sprint-10-dev.md`, `sprint-10-test-report.md`) and the backlog / sprint plan still name the old constants. They are history or PO-owned, so I left them as they are.

## Before / after comparison
A PHP CLI capture script ran the same requests against `php -S localhost:8000` (with MariaDB) before and after the edit. It normalised the random parts (board questions, log times, new category ids). Then `diff` compared the two outputs: they were **identical**. Captured output (the same before and after):

| Request | Result |
|---|---|
| GET board `categories=-1` | 200, one column `{id: -1, name: "Kilo Meshakkal", name_ar: null, mix: true}`, values 100-500, each cell has `category_name` / `category_name_ar` |
| GET board `3,-1,1` | 200, columns History, Kilo Meshakkal, Geography (mix in the middle) |
| POST board `{categories: "-1,2"}` | 200, Kilo Meshakkal then Science |
| GET board `-1,-1` | 400 "Category id -1 is listed more than once" |
| GET board `-2`, `0`, `abc` | 400 "categories must be a comma-separated list of positive integer ids (or -1 for Kilo Meshakkal)" |
| GET board `-1,99999` | 400 "Unknown category id(s): 99999" |
| GET board `-1` with a temporary enabled value 9999 with no questions | 400 "\"Kilo Meshakkal\" is missing questions for: 100, 200, 300, 400, 500, 9999" |
| POST played `-1` / `3,-1` / `-1,-1` | 200 `{played:0,total:0}` / 200 `{played:0,total:60}` / 400 "Category id -1 is listed more than once" |
| POST game-log `[-1,3]`, `[3,-1,1]` | 201; log lines "players: FU38TEST \| categories: Kilo Meshakkal, History" and "... History, Kilo Meshakkal, Geography" |
| POST game-log `[-1,-1]` | 400 "Kilo Meshakkal is listed more than once" |
| POST game-log `[-2]`, `[0,-1]` | 400 "categories must hold positive integer ids (or -1 for Kilo Meshakkal)" |
| POST category "Kilo Meshakkal", "kilo meshakkal", "KILO MESHAKKAL", "  Kilo Meshakkal  " | 409 "\"<trimmed name as sent>\" is the name of a built-in category" |
| PUT (rename a temporary "FU38 TEST category") to "Kilo Meshakkal", "kILO mESHAKKAL" | 409, same message |

Clean-up: the temporary point value 9999 and the TEST category were deleted, and the FU38TEST lines were removed from today's game log. The script then checked that no TEST row or value 9999 was left. Only the tables' AUTO_INCREMENT counters moved on.

`php -l` passes on `api/db.php`, `api/questions.php`, `api/game-log.php`, `api/categories.php`, and also on `daily.php`, `integration-quiz.php` and `mcp.php`, which include questions.php. `daily.php` and `integration-quiz.php` still answer 200, and `mcp.php` answers 405 to GET, as before.

## How to test
1. `php -l` the four changed PHP files.
2. With the local server running, repeat the requests in the table above with curl. Use a throwaway player name in the game-log calls, then remove those lines from `logs/game-<today>.log`. Delete any TEST category you create.
3. Play a game in the browser with Kilo Meshakkal ticked: the board, the headings and the game log line are as before.

## Known limitations
- The JS client still has its own copy (`MIX` / `MIX_NAME` in `js/game.js`), because it cannot read a PHP constant. Its comment points at `api/db.php`, so both copies must be changed together.

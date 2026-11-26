# Phone Sprint 1: rooms, joining and the live board (US-52): developer notes

Branch `phone-buzzer` (worktree `BrainRush-phone-buzzer`). Story US-52, decision D-80 (a to p). Not committed: the owner checks locally first.

## What was built

- **Game control (setup).** A "Game control" block under the categories with **Host control** (default) and **Phone buzzer**. It shows only in Players and Teams modes. It is hidden in Tournament mode (and so with Mokh Bot) and in the Streak setup. The choice is saved with the game as `game.control`.
- **Room at Start.** With Phone buzzer, Start Game first makes a room (`api/rooms.php?action=create`) with the board as the phones may see it, then starts the game. If the room cannot be made, setup stays with every input kept and shows "The phone room could not be made: … Try again, or choose Host control to play without phones." (US-06 behaviour.)
- **Share and lobby panel.** It opens when the game starts and closes with **Close**, Escape, a tap beside the card or Android Back. It shows:
  - A QR code, drawn in the browser as SVG by the new `js/qrcode.js`.
  - The room code and the join link `join.html?room=CODE`, which holds no token.
  - **Copy link**.
  - Each name as **Joined** or **Waiting**, with **Release** on a joined name. Release asks for a confirm first (D-18).
  - A **Phones n/N** button on the board bar opens the panel again. The host polls who has joined every 2 s, and only while the tab is visible.
- **Live board to phones.**
  - `saveState()` schedules a push after 250 ms (debounced). The push is sent only when the phone payload (`phonePayload()`) changed since the last one sent, so the timer, the reading and other host-only changes send nothing.
  - One push at a time. A failed push is retried after 5 s and shows a warning in the panel.
  - If the room has expired (404), a new room is made, its code is shown in the panel, and the players join again.
- **Host control unchanged.** Every new path goes through `phoneOn()` (`control === 'phone'`, not a tournament, not the Integration Quiz). Host control makes no rooms call; this was checked in the network log.
- **Join page** (`join.html`, `js/join.js`, `css/join.css`).
  - Room code form: shown when the link has no code, and with "This game has ended or the code is wrong." for an unknown or expired room.
  - Name picker: claimed names are greyed out and disabled. A name lost to a race gives "That name was just taken on another phone."
  - Read-only live board: category names, values, Kilo Meshakkal emoji, owner colours, grey for nobody, Swap labels, the ×2 on a played double cell, the open cell outlined. Below it, the scores with "you" marked.
  - Polling: the state every 1 s and the lobby every 2 s. It stops while the tab is hidden and backs off on errors, showing "Connection lost. Trying again...".
  - The device token is kept in `localStorage` (`brainrush.phone`, with the room code), so a refreshed phone rejoins. A released phone (403) goes back to the names with "The host released your name. Pick it again."
  - EN / AR switch, right to left in Arabic.
- **No leaks (D-80 p).**
  - The phone payload is built from known fields only. It never includes questions, answers, `order`, `faces`, `double` or tokens.
  - An unused Kilo Meshakkal box has its emoji and `p: null`.
  - `x2` is sent only on a used or open cell.
  - An unopened "Surprise me!" column has no name.
  - `api/rooms.php` rebuilds the state from the same whitelist and enforces these rules again, so a wrong host cannot leak them either.

## Files

| File | Status | What |
|---|---|---|
| `sql/migrate-add-rooms.sql` | new | `game_rooms` (code, host token hash, number of names, state JSON, version, created/seen times) and `room_players` (room, contestant index, device token hash; unique per room on both, so there is one device per name and one name per device; cascade delete). Re-runnable. |
| `sql/schema.sql`, `sql/schema-hosted.sql` | changed | Same two tables, after `speed_scores`; the bodies are still identical. |
| `api/rooms.php` | new | Actions `create`, `push`, `release` (host token), `lobby`, `join`, `state` (player). Details below. |
| `js/qrcode.js` | new | Small QR encoder (byte mode, level M, versions 1 to 15, best mask), based on Project Nayuki's MIT library and credited in the header. Returns an `<svg>` built with DOM calls. |
| `join.html`, `js/join.js`, `css/join.css` | new | The phone page. |
| `js/game.e2b6a35c.js` | changed | Game control, `STORAGE_VERSION` 5 (v4 saves migrate to `control: 'host'`), `isValidControl()`, `newBoardGame()` split from `beginGame()`, the Phone buzzer section (`phoneOn`, `phonePayload`, `createRoom`, push, lobby poll, panel, release), hooks in `saveState`, `newGame`, `restoreGame`, `renderGame`, `goBack`, `onKeyDown`, the language switch. |
| `index.html` | changed | Game control fieldset, `#room-btn` on the board bar, `#room-overlay` panel, `js/qrcode.js` before `game.js`. |
| `css/style.4669c09a.css` | changed | Game control, room button and panel styles (theme tokens). |
| `js/i18n.eee71543.js` | changed | 54 EN + 54 AR strings (`control.*`, `room.*`, `join.*`, `start.roomFailed`). The AR strings are AI-drafted and wait for native review (D-58 a). |
| `sw.js` | changed | See "Service worker" below. |
| `privacy.html` | changed | New section "Playing with phones" and a contents link; date 27 November 2026. |
| `README.md` | changed | How to play item 15 (Phone buzzer). |
| `docs/deploy-hostinger.md` | changed | Phone Sprint 1 redeploy steps: migrate first, files, CDN purge, smoke check, latency check. |
| `api/config.php` | local only | Copied from the main checkout so the worktree runs (git-ignored, never committed). |

## API (`api/rooms.php`)

| Call | Auth | Answer |
|---|---|---|
| `POST ?action=create` `{state}` | none (public, like the game log) | 201 `{code, host_token, version}`. `host_token` is only ever returned here. |
| `POST ?action=push` `{code, host_token, state}` | host token | 200 `{version}`. 401 missing / 403 wrong token, 404 room, 400 bad state or a different number of names. |
| `POST ?action=release` `{code, host_token, contestant}` | host token | 200 `{released, version}`. |
| `GET ?action=lobby&code=` | none (the code is in the link) | 200 `{version, mode, players: [{name, color, joined}]}`. |
| `POST ?action=join` `{code, contestant, device_token?}` | device token is optional (made here) | 200 `{device_token, you, version}`. 409 "This name is already taken on another phone." The same token on the same name is a rejoin. Another name moves the phone and frees the first. |
| `GET ?action=state&code=&since=` with header `X-Device-Token` | device token | 200 `{changed:false, version}` (29 bytes) or `{changed:true, version, you, players, state}`. 401 without a token, 403 when the token holds no name (released). |

- Rooms with no request for 6 hours are deleted at the start of every rooms request; the SELECT also ignores them, so the room answers 404 even before the delete.
- A poll records the room's last request at most once a minute, so polls are not writes.
- Codes are 6 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, drawn with `random_int`; on a clash the server draws again.
- Tokens are 64 hex characters from `random_bytes(32)`. Only their SHA-256 hashes are stored, and they are compared with `hash_equals`.
- Bodies are limited to 256 KB (413) and the stored state to 128 KB. The board may have up to 20 columns and 50 rows, and category names up to 100 characters (the `categories.name` / `name_ar` width), so no real board is refused.
- POSTs need `application/json` (415).
- A missing table gives 503 "Phone buzzer is not set up on this server yet."
- All SQL uses prepared statements. The only interpolated values are integer constants.

## Service worker

The hash hook rewrites asset names only in `*.html`, so `sw.js` never names an asset. Install still caches only `offline.html` (`CACHE` stays v2). A join page that loads is kept in `brainrush-join-v1` together with the scripts and styles it loads (requests whose referrer is `join.html`), all network first. The cached page therefore always matches the cached files, and older hashed copies of a file are deleted. When a join page cannot load, the cached one is served, and the phone keeps its name and reconnects by itself; any other page gets `offline.html`. `api/` (with `api/rooms.php`) returns early and is never cached. The game page's assets are untouched, as before.

## How to run locally

1. Migration, once: `C:/xampp/mysql/bin/mysql.exe -u root brainrush < sql/migrate-add-rooms.sql` (already run on the local DB, twice).
2. The worktree needs `api/config.php` (already copied from the main checkout).
3. `C:/xampp/php/php.exe -S localhost:8007` from the worktree root, then open `http://localhost:8007/`.
4. Choose Players or Teams, enter names, tick categories, choose **Phone buzzer**, Start. Open the panel's link in other tabs or browsers. A phone on the same Wi-Fi needs the PC's LAN address instead of `localhost`, for example `php -S 0.0.0.0:8007`, then open `http://<pc-ip>:8007/`. The QR code follows the address the host page was opened with.

## Verification done

- `php -l api/rooms.php`: no errors. `node --check` passes on every changed or new JS file and on `sw.js`.
- Migration run twice on the local MariaDB 10.4: no errors. `SHOW CREATE TABLE` matches. The schema bodies are byte-identical (diff).
- **curl against `php -S localhost:8007`:** create 201, with the host token never echoed elsewhere.
  - Lobby: 200, lower-case code accepted, unknown code 404.
  - Join: 200. Join of the same name from another phone 409. Rejoin with the same token 200, same version. Index out of range 400.
  - State: no token 401, wrong token 403, valid 200 with the whitelisted state (an injected `answer` field and the `questions` key were dropped, Kilo value nulled, x2 removed on an unused cell, hidden column name removed). `since` unchanged gives `{"changed":false,"version":2}` (29 bytes).
  - Push: 200 (version +1). Wrong token 403, no token 401, fewer names 400.
  - Release: wrong token 403, valid 200, then the released phone's state 403 and another phone can take the name. A phone switching names frees the first.
  - Errors: GET create 405 with `Allow: POST`, unknown action 400, form post 415, 5 teams 400, tournament mode 400, state as a list 400. Arabic names round-trip.
  - Idle cleanup: a room aged 7 h by SQL is deleted (room and players) by the next unrelated request.
- **QR code:** 35 texts (URLs of 1 to 400 bytes, Arabic included, versions 1 to 15) were encoded and decoded with the independent decoder jsQR (installed in a temp folder only, not vendored). All decoded exactly. A real phone scan is still for the tester (QR codes on a screen).
- **Headless Chrome end to end** (Playwright from the main checkout's `node_modules`, read only): host 1366x768, phone 1 at 375x812, phone 2 at 320x640. **47/47 PASS:**
  - Setup: Game control is shown in Players and Teams, hidden in Tournament, defaults to Host control.
  - Host control regression: a game started, a cell played and marked, and the page reloaded, with **0 rooms.php requests**. The save is v5 `control: 'host'`. A hand-made v4 save restores on the board and is saved as v5.
  - Room and panel: the room is made, and the panel shows the code, link, QR SVG and 3 waiting names. The link holds no token.
  - Joining: the phone shows the names as buttons, with an HTML-like name shown as text. Phone 2 sees the claimed name disabled. The host shows 2 joined and "Phones 2/3".
  - Live board:
    - An open cell is outlined on the phones, with the status "A question is open on the host screen."
    - After Correct and Back to Board, the phone shows the owned cell in the owner's colour **824 ms** later.
    - The phone board has no buttons.
    - A score change reaches the phones.
  - Payload: there are no question or answer fields, no `order`, `faces`, `double` or token. Unused Kilo boxes have `p: null`. There is no x2 on unused, unopened cells. An unchanged poll is under 60 bytes.
  - Refresh and Release: a refreshed phone rejoins as the same name. Release sends that phone back to the names with the message, and the name is free again.
  - Arabic: the page is RTL with Arabic status text. There is no sideways scroll at 375 or 320 px, in either language.
  - Host reload: the host keeps the room and the joined count.
  - Bad links: an unknown code shows the ended message and no board; no code shows the code form.
  - Pushes and errors: 5 pushes in the whole run (debounced). No console errors apart from the expected 403/404 resource lines.
- Screenshots checked: the host panel, the phone in Arabic at 375 px and in English at 320 px, and the Game control in Arabic. This check found one bug, now fixed: an owned cell kept the cell gradient over the owner colour (`background-image: none` was added).
- The Integration Quiz page (shares `game.js`) loads with no console errors.
- **Second headless run, 22/22 PASS:**
  - Tournament regression: 3 contestants (Mokh Bot fills the bye). A match is started and the page reloaded; the match is restored with no `control` field, no room button and 0 rooms requests.
  - Teams Phone buzzer game: 4 teams and 6 categories. The panel says "one phone per team" and the picker asks "Which team are you?". A second phone sees the claimed team disabled, and the server refuses a second claim with 409.
  - Board width: a 6-column board, and a 10-column board (the Admin maximum for categories per game) with long English and Arabic names, 5-digit values, a Swap label and a 30-character name, made through the API. Both have no sideways scroll at 320 and 375 px in EN and AR.
  - Service worker: `offline.html` is in `brainrush-offline-v2`; `join.html`, `js/join.js`, `css/join.css`, `style.css` and `i18n.js` are in `brainrush-join-v1`; nothing from `api/` is cached. Offline, a reload shows the cached join page with "Connection lost"; back online, the board returns as the same team.
- Found and fixed in that run: on the 10-column board the values were cut off. The value size now follows the column width and the longest value (`--pts`, `--digits`), as on the host board; a normal board keeps 1rem. Phone cells also got `role="img"`, so screen readers read their label (the visible text is `aria-hidden`).

## Latency (local; live check pending)

These numbers are from the local `php -S` server, not the live host. Delay is the time from a host score change to the phone update (5 changes per run, all joined phones). Requests per minute are the phones' rooms requests over 30 s, times 2.

| Join tabs | Joined | Delay avg / median / max | Phone requests per minute |
|---|---|---|---|
| 1 | 1 | 756 / 761 / 804 ms | 58 |
| 5 | 5 | 819 / 771 / 1362 ms | 290 |
| 10 | 6 (Players max) + 4 on the name list | 850 / 870 / 1306 ms | 468 |

- The delay is mostly the 250 ms push debounce plus half of the 1 s poll on average.
- The host adds about 30 requests per minute (lobby every 2 s) plus one push per change.
- **Still to do on the live host (US-52 criterion):** measure the same with 1, 5 and 10 tabs on Hostinger after the deploy and add the numbers here. `docs/deploy-hostinger.md` lists it as step 5. If the delay is well over 1 s, or the host shows errors, the PO and owner decide before phone Sprint 2.

## Known limitations and deviations

1. **Latency on the live host not measured yet.** That needs the deploy. Local numbers are above.
2. **Room creation is public.** As with the game log, anyone can create rooms. There is no rate limit, but requests are capped at 256 KB, stored room state at 128 KB, and deleted after 6 h idle.
3. **The `lobby` call is public.** The name picker needs the names before a phone has a token, so anyone with the room code sees the names, colours and who has joined. The board and scores need the device token. The plan listed no host-only lobby call. The host uses this same public `lobby` call for its joined / waiting list, so no extra host call was added.
4. **If room creation fails, the game does not start.** Setup stays with a message; the host can retry or choose Host control. Starting without a room was the other option. This choice keeps "Phone buzzer" meaning phones are really available.
5. **New Game does not close the room.** The room is left to expire after 6 h. Closing it and the "game ended" phone screen are phone Sprint 3 polish. Until then the phones keep showing the last board, with "Game over." once the host reaches Results.
6. **Service worker** (see above): `join.html` and its files are cached when they load (network first), not as an install precache list, because the hashed names change on every commit and the hook only rewrites HTML. A phone that never loaded the join page has no cached copy.
7. **New files must be staged before the commit hook runs.** `join.html`, `js/join.js`, `js/qrcode.js` and `css/join.css` must be staged, so that `.githooks/hash-assets.sh` renames them and rewrites their references in `index.html` and `join.html`.
8. **The ×2 mark reaches the phones when the host opens the double cell** (the host announces it then too), never before (D-80 p: not sent until that cell is opened).
9. **The 10-tab latency run joined only 6 tabs.** Players mode allows 6 names, so the other 4 tabs polled the lobby every 2 s instead of the state every 1 s.
10. **Live CDN check.** On the live host, confirm that two consecutive `state` responses are not served from the Hostinger CDN cache. The API sends `Cache-Control: no-store`, but a cached poll would show one phone another phone's board and name.
11. **Side effects on the local database.** The test games wrote game-log lines and question stats to the local DB (as noted in FU-52). The test rooms were deleted.

## Fix round 1 (test report `docs/sprints/phone-sprint-1-test.md`)

### BUG-52-01 (Major): an unknown code wiped the saved place of a live room
- `js/join.js` now keeps one place per room: `brainrush.phone` = `{ "<CODE>": { token, at } }`.
- `savePlace(code, null)` forgets only that room. A 404 (unknown or expired code) therefore never touches another room's place, and a malformed code touches nothing.
- Places older than 12 h are pruned on read; rooms expire after 6 h idle. A place's age is refreshed when its board first loads on a page.
- The first build's single `{ code, token }` value is still read, so a phone joined before the fix keeps its name.

### BUG-52-02 (Major): two host tabs overwrote each other
The fix uses a host session: the newest tab wins.

**Session id and claim**
- Each host page load makes a random 32-hex session id (`HOST_SESSION`, memory only, not a secret).
- `create` stores it as the room's `host_session`.
- New `POST ?action=claim { code, host_token, session }`: a page that restores a saved Phone buzzer game takes the room over. Pushes wait for this claim.

**Server checks**
- `push` and `release` need the room's current session. Any other session gets `409 { other_tab: true }`.
- The push UPDATE also has `WHERE host_session = ?`, so a claim that lands between the read and the write still wins.
- The host's lobby poll sends `&session=` and gets `other_tab: true` when another tab has taken over. The losing tab learns within about 2 s, even if it makes no change.

**The losing tab**
- It stops pushing, polling and saving to `localStorage`, so it cannot overwrite the newer tab's save either.
- It shows a blocking notice (EN and AR):
  - title "Open in another tab";
  - text "This game is open in another tab, so changes here no longer reach the phones. Carry on in the other tab, or play here instead.";
  - one button, **Use this tab**.
- **Use this tab** reloads the page, which restores the latest saved game and claims the room. The other tab is then told the same way.

**Host control:** unchanged. `phone.blocked` is only ever set by a Phone buzzer game.

**Schema:** a new column, `game_rooms.host_session CHAR(32) NULL`.
- It is in `sql/migrate-add-rooms.sql`, `sql/schema.sql` and `sql/schema-hosted.sql`; the two schema bodies are still identical.
- The migration also has `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, for a database that ran the first copy.
- The local database was migrated twice with no errors.

**Known edge:** a change made in the older tab in the up-to-2 s window after another tab took over is saved only in that window and is lost when the newer tab saves. The phones are never overwritten. The older tab only gets back in with **Use this tab**, which reloads the latest save.

### BUG-52-03 (Minor): push and release replied with the version read before the update
- `push` and `bump_version` (used by `join` and `release`) now set `version = LAST_INSERT_ID(version + 1)`.
- They then reply with `SELECT LAST_INSERT_ID()`, the version stored by their own update on this connection.
- A rejoin does not write anything, so it still replies with the current version.

### Files changed in this round
- `api/rooms.php`
- `sql/migrate-add-rooms.sql`, `sql/schema.sql`, `sql/schema-hosted.sql`
- `js/game.e2b6a35c.js`, `js/join.js`, `js/i18n.eee71543.js` (3 EN + 3 AR strings, `room.taken*`)
- `index.html` (`#room-taken-overlay`)
- `css/style.4669c09a.css`

### Re-test (headless Chrome against `php -S localhost:8007`; server stopped and test rooms deleted afterwards)

**New fix suite: 25/25 PASS**
- API:
  - 10 parallel pushes reply with the distinct stored versions 2 to 11, and the lobby then shows 11.
  - A push without a session: 400.
  - After another session's claim, the older session's push and release: 409 `other_tab`.
  - The lobby answers `other_tab` true for the older session and false for the newer one.
  - A claim with a wrong host token: 403.
- Row 10:
  - After `?room=ZZZZZZ` (404) and a malformed code, the live room's place is kept, and reopening the room rejoins as the same name with no picking.
  - A plain refresh rejoins.
  - An old single-place save rejoins.
  - Two rooms are stored side by side.
- Row 29:
  - Tab A starts the game and plays a cell. Tab B opens the same game, and tab A shows the notice.
  - Tab B plays a cell and the phone shows both cells; 2.5 s later still both (nothing overwritten).
  - The save holds tab B's game.
  - Tab A's **Use this tab** reloads with both cells, and tab B shows the notice.
  - Tab A's next cell reaches the phone.
  - The notice shows in Arabic.
  - No console errors.
- Row 31: with a 30-character unbroken name, the picker, board and scores have no sideways scroll at 375 px, in EN and in AR.

**Earlier suites re-run**
- First suite: 47/47 PASS. This includes the Host control regression (0 rooms calls), the v4 save migration, joining, the live board, payload checks, refresh, Release, AR at 375 and 320 px, and bad codes.
- Second suite: 22/22 PASS. This includes the Tournament regression, the Teams case (4 teams, one phone per team in the UI, 409 from the server), 6- and 10-column boards at 320 and 375 px in EN and AR, and the service worker offline path.
- The only console lines are the expected 403/404 statuses and missing local question pictures (`img/questions/*.svg` not on this machine), which existed before this work.

## Fix round 2 (tester's "Re-test 1")

### Golden Goal "Show results" in a Phone buzzer game: not a bug, same as main
- **What was compared:** the same steps were run in Host control and Phone buzzer on this branch, and in Host control on `origin/main` (42da5e7). For `main`, a read-only `git archive` copy was served on port 8008 from the scratchpad and deleted afterwards.
- **Steps:** a tied game, Golden Goal bets entered, both contestants marked Wrong, then Show answer.
- **Result:** all six runs behave the same. They are bets 100/100 and 100/200, in each of the three setups.
- **How the end button works:** it is `#back-btn`. It is disabled only until every contestant is marked, then enabled.
  - Its label is **Next round** when the scores are still level (D-51; equal bets, both wrong).
  - Otherwise it is **See results**. In Arabic that label is "عرض النتائج", which reads as "Show results".
  - The buttons that stay disabled are the Correct and Wrong buttons of the rows already marked, by design.
- **Likely cause of the report:** an equal-bet tie labels the button "Next round", or the disabled Correct/Wrong buttons were the ones checked. The Phone buzzer code does not touch Golden Goal: it only reads the screen name for the phones' status line.
- **No change made.**

### Host control regression: double cell and a full Golden Goal
Run with a one-column board, so the double cell is on it, on this branch and on `origin/main`. Both runs give the same results:
- the double popup shows;
- the Correct button is gold;
- the ×2 mark stays on the played cell;
- both scores end at −2100, so the game is tied;
- Golden Goal bets of 100 and 200, then Sara Correct and John Wrong;
- the end button reads "See results" and is enabled;
- Results shows "Sara wins!";
- 0 rooms requests and no page errors.

### BUG-52-04 (Minor): a 30-character unbroken name overflowed the Arabic lobby panel
- **Cause:** the `.room-players` grid track grew to the name's full width.
- **Fix:** `grid-template-columns: minmax(0, 1fr)` and `min-width: 0` on `.room-player`. The name now truncates with an ellipsis, and the Joined / Waiting status and Release stay inside the row.
- **Measured:** the panel's scroll width now equals its visible width (`.room-card` scrollWidth / clientWidth) at both sizes, with the name waiting and after it joined, in Arabic. Before the fix the card was wider than its space.

| Host window | Before (waiting / joined) | After |
|---|---|---|
| 1366 px | 632/576 and 680/576 | 576/576 |
| 375 px | 626/353 and 674/353 | 353/353 |

- **Phone score card:** `.jb-score` now also has `min-width: 0`. The 30-character name already wrapped inside the card at 375 px in Arabic (card 171/171, name 151/151); this keeps it so.
- **Files:** `css/style.4669c09a.css`, `css/join.css`.
- **Sanity re-run:** the first suite passes again, 47/47.

Servers on 8007 and 8008 were stopped and the test rooms deleted.

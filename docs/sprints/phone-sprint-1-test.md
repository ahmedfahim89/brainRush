# Phone Sprint 1 (US-52, Phone buzzer: rooms, joining, live board): test report

Branch `phone-buzzer` (worktree `BrainRush-phone-buzzer`, uncommitted). Story US-52, decision D-80. Tester run on 2026-11-27. No code was changed.

## Summary

- **Environment:** Windows 11, PHP 8.0.30 (`php -S`), MariaDB 10.4 local (utf8mb4), Chrome-based browser pane. Servers on `localhost:8007` (main) and `localhost:8008` (second origin). Phones were simulated by separate origins and tabs (`[::1]:8007` top-level, `localhost:8008` top-level, and same-origin iframes in the host page). **No physical phone was used**, so the QR scan and the live-host latency are PENDING.
- **Counts (38 checks):** PASS 27, FAIL 2, PENDING 9.
- **Bugs:** 2 Major (BUG-52-01, BUG-52-02), 1 Minor (BUG-52-03). Observations OBS-52-01 and OBS-52-02 are notes, not bugs.
- **Verdict: NEEDS FIXES.** Two Major bugs break the acceptance criterion "a refreshed phone rejoins as the same name" (in a mis-typed-code case) and can silently drop a host's board and score changes.

## Acceptance criteria (US-52, `docs/product-backlog.md` lines 515 to 555)

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Setup: "Game control" (Host control default, Phone buzzer) under the categories in Players and Teams; saved with the game and restored on reload | PASS | Fieldset visible in Players and Teams, `host:true` by default. Started a phone game and reloaded the host: saved game has `control: "phone"`, room restored, Phones button shown. New Game resets the choice to Host control (expected: per game). |
| 2 | Tournament (with or without Mokh Bot): no Game control | PASS | Tournament selected: fieldset `hidden`, `display:none`. Mokh Bot not started separately; same tournament branch (`controlBlock.hidden` when `s.mode === 'tournament'`, `js/game.e2b6a35c.js:1801`). |
| 3 | Host control: plays as before (Golden Goal, Swap, Skip, 3 choices, double, Kilo), no room, zero rooms.php calls | PENDING | Partial PASS: Host control game started, a cell played and marked, Back to Board, page reloaded. A fetch counter on the host page recorded **0** `rooms.php` calls; Phones button hidden; saved game `control: "host"`, `room: null`. Golden Goal, Swap, Skip, 3 choices, double and Kilo were not played under Host control in this run. |
| 4 | Phone buzzer: on Start a room is created; panel shows QR, room code, join link; QR drawn locally; link and QR hold only the code | PASS (panel); PENDING (scan) | Rooms KAD6C2, R5MJDZ, PLRLCC created (201). Panel shows QR SVG, code, `http://localhost:8007/join.html?room=CODE`, Copy link. The link carries no token. QR is drawn by `js/qrcode.js` (no external request seen). A real phone scan is PENDING. |
| 5 | Panel lists each name as Joined or Waiting; the host can show or hide it | PASS | Joined/Waiting labels update within 2 s of a join or release. Close, reopen via the Phones button. Phones counter 0/2, 1/2, 2/2 matches. |
| 6 | Nobody joins: the game still plays and the host scores by hand | PASS | Teams room PLRLCC, 0 joined. Opened a cell, Team A Correct (+100), Back to Board. Pushes 200, score 100 on the host. |
| 7 | Phone shows the host's names as buttons; no account; no typing | PASS | Name list on `join.html?room=…` for both origins. |
| 8 | A claimed name is greyed out on other phones; the server refuses a second claim (409) | PASS | UI "Taken" and disabled. API: second claim 409; race test: 12 devices claim one name at once, 1 gets 200, 11 get 409. |
| 9 | One device per name; Teams: one device per team | PASS (Players); PENDING (Teams UI) | Players verified in the UI. Teams: API 409 and max-4-teams 400 verified; a second Teams phone in the UI was not repeated (the developer's notes cover it). |
| 10 | Refresh rejoins as the same name, without picking again | FAIL | Plain refresh works: a reloaded phone showed "You are Team B" (same-origin iframe reloaded). **Fails after the phone opens an unknown room code on the same origin**: its saved place is deleted (see BUG-52-01). |
| 11 | Release (with confirm) frees the name; the released phone returns to the name list; another device can take it | PASS | Release: confirm (native `window.confirm`; a dismissed confirm keeps the name). Released phone shows "The host released your name. Pick it again." Name then claimable again. API: release 200, `released:false` on repeat, released token state 403. |
| 12 | Unknown or expired code: "This game has ended or the code is wrong." and no board | PASS | Codes `abc`, `ABC0EF`, `ABCDEFG`, `<b>x</b>`, `ZZZZZZ` all show the message, no board. Expired: a room aged 7 h returns 404 and is deleted with its players (DB check). |
| 13 | Phone board is read-only, owner colours, grey for nobody, scores with colours | PASS | Seen on phones: owned cells in owner colour with owner name, used Kilo box with no owner in grey, scores with "You" marker. |
| 14 | Tapping a phone cell does nothing | PENDING | Not tapped in this run (only host picks). |
| 15 | Phone state hides open Kilo values and the double cell until opened; no questions or answers | PASS | Captured the host's push bodies (`rooms.php` POST): keys only `mode, screen, contestants, points, categories, cells`; no question, answer, order, faces or double keys. Open Kilo box: `face` + `open:true`, no `p`. Unused Kilo boxes: no `p`. Hidden column: no name until opened. Server rebuild also tested by curl (injected `answer`, `questions` removed; hidden name and Kilo value nulled). The double-cell mark was not observed in this run (no double cell drawn); the server strips `x2` on unused cells (tested). |
| 16 | Board and scores update on phones within about 1 s | PENDING | Live updates confirmed: open cell reached a phone while the host was on the question; owner colour and score reached phones after Back to Board and after a Correct mark. Screenshots between host action and phone check were 2 to 5 s apart (tool latency), so the ~1 s figure is not measured here. Developer's local figure: 824 ms (dev notes). Live-host measurement: see the separate PENDING row. |
| 17 | The host screen is the source of truth; the server keeps only what phones need | PASS | Push body contains only the whitelisted fields; the server rebuilds the state (`room_state()`). |
| 18 | API: host calls need the host token, player calls the device token; 401 missing, 403 wrong, 404 unknown room, 400 bad input | PASS | Curl battery: create 201; lobby 200 (lower-case OK), 404 unknown, 400 bad code, 405 wrong method; join 200 / 409 / 400; state 401 no token, 403 wrong or released token; push 401 / 403 / 400 (fewer names); release 401 / 403 / 400; 413 body over 256 KB; 415 non-JSON content type; 400 bad JSON. |
| 19 | Prepared statements only; names as text, never HTML | PASS | Code review: PDO prepared statements; only integer constants interpolated (`INTERVAL 6 HOUR`). XSS name `<img src=x onerror=alert(1)>` (28 chars) shown as text on the host panel, board, scores, the phone picker, phone board and phone scores; no `img` element created in the phone DOM. |
| 20 | Unchanged-version poll returns a small "no change" reply | PASS | `{"changed":false,"version":3}`, 29 bytes. |
| 21 | A room idle over 6 h, with its players, is deleted on the next rooms request | PASS | Room aged 7 h: lobby 404, rooms and players removed (no orphans). Room aged 5 h 59 min survives. |
| 22 | `sql/migrate-add-rooms.sql` creates the tables; both schema files include them; import before code on Hostinger | PASS | Tables `game_rooms` and `room_players` present in the local DB. Schema files reviewed (developer). Hostinger import is a deploy step (PENDING at deploy). |
| 23 | Service worker never caches `api/rooms.php`; new join assets cached | PASS | `sw.js:80` returns early for `API_URL`; API responses carry `Cache-Control: no-store`. Browser cache behaviour not re-tested. |
| 24 | AR and RTL on the join pages | PASS | Arabic on join pages at 375 px and 320 px: `dir="rtl"`, `lang="ar"`, status and board text in Arabic, names isolated. |
| 25 | No horizontal scroll on the join page at 375 px and 320 px (EN and AR) | PASS | `scrollWidth == clientWidth` in EN and AR: 360/360 and 305/305. |
| 25b | AR and no-scroll on the host setup and lobby panel | PENDING | Host setup and panel were checked in EN only. |
| 26 | Latency check on the live host with 1, 5 and 10 tabs (delay and requests per minute) | PENDING | Needs the Hostinger deploy. Local numbers are in the developer notes. |
| 27 | Host reload keeps the room and the joined count | PASS | Host reloaded mid-game: room KAD6C2 restored, Phones counter kept. |
| 28 | No console errors from the app | PASS | Every app request returned 200 (network log). No app JS errors. |
| 28b | Console messages "An unknown error occurred when fetching the script." | PENDING | Appears on the host page and on the join page, although all app requests succeed. Not attributable to the app from this run; re-check in a normal Chrome profile. |
| 29 | Two host tabs on one device | FAIL | BUG-52-02: the second tab overwrites the first tab's board and score changes, in the room and on phones. |
| 30 | Malformed room codes (`abc`, `ABC0EF`, 7 characters, `<b>`) | PASS | Friendly message, not a raw error (see row 12). |
| 31 | A 30-character unbroken name on the phone picker and scores (EN and AR, 375 px) | PENDING | 30-character name wraps correctly on the host (setup, board, score card, results). Not yet joined on a phone. |
| 32 | Many rapid host actions: pushes stay serialised, no 4xx | PASS | 15 parallel push calls by curl: all 200, final version consistent. UI pushes during the run: all 200. |
| 33 | New Game while phones are joined | PASS (documented limitation) | After New Game the old room stays live for up to 6 h; its phones keep the board with "Game over." (OBS-52-02). |

Counts: PASS 27, FAIL 2 (rows 10, 29), PENDING 9 (rows 3, 4 scan, 9 Teams UI, 14, 16, 25b, 26, 28b, 31).

## Bugs

### BUG-52-01 (Major): an unknown or expired code deletes the saved place of a live game

- **Where:** `js/join.js:120-127` (`savePlace` removes the one storage key whatever room it belongs to), `js/join.js:252-258` (`forgetToken`), `js/join.js:260-265` (`gameEnded`), `js/join.js:211` (404 calls `gameEnded`).
- **Steps to reproduce:**
  1. On a phone (one browser origin), open `join.html?room=KAD6C2` and tap a free name. `localStorage['brainrush.phone']` holds `{code, token}`.
  2. On the same origin, open `join.html?room=ZZZZZZ` (valid format, unknown room, so the server returns 404).
  3. Check `localStorage['brainrush.phone']`: it is removed (observed: `NONE`).
  4. Reload `join.html?room=KAD6C2`: the name list shows the phone's own name as "Taken" and the phone can't rejoin without the host releasing the name.
- **Expected:** the saved place stays. Only the room whose code matches the stored code should be forgotten.
- **Actual:** the saved place of the other, still-live game is deleted.
- **Impact:** breaks "a refreshed phone rejoins as the same name". A phone that mistypes a code can lose its seat; another phone may take the name meanwhile.
- **Note:** this was reproduced with a 404 code. The 400 path (malformed code) was not isolated.

### BUG-52-02 (Major): two host tabs on one device overwrite each other's board and scores

- **Where:** `js/game.e2b6a35c.js:941` (`saveState`), `js/game.e2b6a35c.js:8906` (`schedulePush`), `api/rooms.php:241-249` (`room_push` accepts any push with the host token; no version check).
- **Steps to reproduce:**
  1. Start a Phone buzzer game (room R) in host tab A on `http://localhost:8007/`.
  2. Open a second tab B on the same origin (it loads the same saved game).
  3. In tab A: open AI 100, Back to Board (push).
  4. In tab B, which was loaded before step 3: open Egyptians 300, Back to Board (push).
  5. Observed: the room (`game_rooms.state`) has AI 100 unused again (`cells[0][1].used = false`) and tab B shows AI 100 grey-white. Then tab A's End Game push replaces the room state, and phones show Egyptians 300 as unused: tab B's change is lost on phones.
- **Expected:** a second host on the same game should not overwrite newer state. For example, the push should carry the version it was built from, and a stale push should be refused or the tab should reload.
- **Actual:** last writer wins, silently, on both the host's saved game and the phones.
- **Impact:** silent loss of board and score changes. Host control has the same last-writer-wins on its own localStorage (pre-existing), but in phone mode the loss reaches the phones.

### BUG-52-03 (Minor): push and join replies can report a stale version

- **Where:** `api/rooms.php:248` (`json_response(['version' => $room['version'] + 1])` uses the version read before the update), `api/rooms.php:292` (a rejoin returns the version read before the request).
- **Steps:** send two pushes in parallel (curl). Each reply is computed from the row read earlier, so with concurrent writes a reply may not match the stored version.
- **Expected:** the version written to the database is returned (for example, re-read it after the update, or use `UPDATE ... RETURNING` equivalent).
- **Actual:** the reply is computed from the pre-read version. In this run all 15 parallel pushes returned 200 and the final version was consistent with the number of writes, so there is no visible effect yet. Low risk, but the reply should match the stored version.

## Observations (not bugs)

- **OBS-52-01 (security note, matches the developer's known limitations 2 and 3):** `action=create` and `action=lobby` are public, with no rate limit. Anyone who knows a 6-character code (about 10^9 codes) can read the names and who has joined. The board and scores still need the device token. Consider a throttle before go-live.
- **OBS-52-02 (known limitation 5):** New Game leaves the old room live for up to 6 h. Its phones keep showing the last board with "Game over.". Acceptable for Sprint 1; polish in Sprint 3 as planned.
- **New Game resets the Game control to Host control** (per game). Expected.
- **Host lobby poll** runs every 2 s while the host tab is visible, even with the panel closed. This matches the developer's note ("only while the tab is visible"). Roughly 30 requests per minute on the host.
- **Tool note (not the app):** clicks inside cross-origin iframes landed on a different row than drawn, so phone taps were done on top-level phone pages instead. No app defect was seen on top-level pages.

## Not verified and why (PENDING)

- **Live-host latency for 1, 5 and 10 tabs** (row 26): needs the Hostinger deploy (`docs/deploy-hostinger.md`, step 5).
- **Real QR scan on a phone** (row 4): the QR encodes the correct join URL, but a phone camera scan was not possible here.
- **Golden Goal, Swap, Skip, 3 choices, double cell and Kilo under Host control** (row 3): not played in this run; Host control start, play and reload were verified with zero room calls.
- **Teams UI with a second device** (row 9), **tapping a phone cell** (row 14), **Host setup and panel in Arabic** (row 25b), **a 30-character name on a phone** (row 31), **unattributed console message** (row 28b).
- **Expired-room screen after a real 6 h expiry**: tested by aging the row in the DB and by the same 404 path used for unknown codes.

## Test data and cleanup

- Test rooms were created in the local `brainrush` database (`game_rooms` and `room_players`). They expire after 6 h idle. No production or hosted data was touched.
- Test names only: "Team A", "Team B", a 30-character "W" name, and an HTML-like name for the XSS check.
- Both PHP servers (`localhost:8007` and `localhost:8008`) were stopped by PID after the run. No code in the worktree was modified.

## Verdict

**NEEDS FIXES.** Fix BUG-52-01 (keep the saved place; forget only the matching room) and BUG-52-02 (a push must not overwrite newer state, or a second host must be blocked). Then re-run rows 10 and 29. Pending items can be closed on the live host with 3 or more real phones before the PO accepts.

## Re-test 1 (after fix round 1)

Same worktree and rules: no code changed, server on 8007 started in the background and stopped by PID afterwards. The local DB already had the `host_session` column. Test rooms PVQC8E, FLSWYW and L72MWB were created. The room PLRLCC from the first run was no longer in the DB; it was created under an hour earlier, so this was not idle expiry (most likely the developer's test cleanup on the same local DB).

### Summary

- BUG-52-01 (Major): fixed. Row 10 PASS.
- BUG-52-02 (Major): fixed. Row 29 PASS for the takeover and notice. The 2 s window test stays PENDING.
- BUG-52-03 (Minor): fixed. Stored-version replies PASS.
- New: BUG-52-04 (Minor). The Arabic host lobby panel overflows with a 30-character unbroken name.
- Verdict: READY FOR PO (conditional). No Major bug open. The PENDING items below must be closed before the owner merge or accepted by the PO.

### Re-run results

| Row | Re-test | Result | Evidence |
|---|---|---|---|
| 10 | Refresh rejoins as the same name; the saved place survives an unknown code | PASS | Joined PVQC8E on a phone (place stored under the room code). Opened `join.html?room=ZZZZZZ` on the same origin: place kept. Reload of PVQC8E: "You are Team B"; the DB shows that device's token hash on contestant 1. |
| 29 | Two host tabs: newest wins, older tab blocked, "Use this tab" takes over | PASS | Tab 4 loaded the saved game and claimed the room. Tab 2 showed "Open in another tab" with **Use this tab** within about 3 s. Takeover worked both ways (DB `host_session` changed each time). A fake-session claim from tab 2 gave the notice. |
| 29b | The 2 s window: a change in the older tab just after takeover | PENDING | Not isolated: tool latency is 1 s or more per call, so the older tab had already shown the notice before my click. Phones and DB were never overwritten in any run. |
| 31 | 30-character unbroken name | PASS (phone); FAIL (host panel, BUG-52-04) | Phone at 375 px: no page scroll in EN (360/360) or AR (dir rtl, 360/360). In AR the name wraps in the header and is clipped in the small score card (cosmetic). Host Arabic lobby panel: BUG-52-04. |
| 3 | Host control: 0 rooms.php calls; Kilo, 3 choices, swap, skip | PASS | Fetch counter on the host page: 0 calls from Start through idle time, Kilo box open (value shown), ABC (3 choices), swap ("Swapped from Kilo Meshakkal"), skip (cell greyed, half points), Back to Board. Reload and restore: no calls. Phones button hidden; saved game `control: "host"`, `room: null`. |
| 3b | Host control: Golden Goal and double cell | PENDING | Not reached in a Host-control game. A phone-mode Golden Goal was reached (see GG below). |
| 9b | Teams: one device per team in the UI | PENDING | Not re-run with two phones. Teams with no joins still plays (Team A scored 100, pushes 200). |
| 14 | Tapping a cell on a phone does nothing | PASS | Tapped a board cell on a joined phone: no change, no request (network log: only page loads). |
| 25b | Arabic host setup and lobby panel, no sideways scroll | FAIL (panel) | Host Arabic UI works (phones button, panel labels in Arabic). Lobby panel overflows (BUG-52-04). |
| 26 | Live-host latency | PENDING | Needs the Hostinger deploy. |
| 4b | Real QR scan | PENDING | Needs a phone camera. |
| 16 | About 1 s updates | PENDING | Live updates seen again (open cell, owner colour, score, AI 100 after takeover). Exact timing not measured. |
| 30a | Host refresh flow | PASS | Tab 2 reloaded with a question open: question restored; Team A Correct and Back to Board pushed; DB version 9 to 10; owner session matched. |
| 30b | Single host tab reload does not lock out | PASS | Tab 2 reloaded with tab 4 parked on a non-game page: claimed with the new session, no notice, host kept working. |
| BUG-52-03 | Stored versions on push | PASS | 10 parallel pushes returned distinct stored versions 3 to 12; final lobby version 12. Join and release reply with the stored version (13, 14). |
| API | Session rules | PASS | Push without session 400; short session 400; claim with wrong token 403, no token 401; after takeover the old session's push and release get 409 `other_tab`; lobby `other_tab` true for the old session, false for the new one. |
| GG | Golden Goal in phone mode | PASS (partly); open question | A tie opened the Golden Goal: the host enters masked bets as today. The phone shows "The Golden Goal is played on the host screen." (no leak). Both bets locked, question shown, both marked wrong: "Show results" stayed disabled, even after Show answer. Developer to confirm whether that is intended; not checked against Host control. |

### BUG-52-04 (Minor): Arabic host lobby panel overflows with a 30-character unbroken name

- Where: the room card and `room-player-name` in the Phones panel (`#room-overlay`), Arabic (`dir="rtl"`).
- Steps: host page in Arabic; Phone buzzer game with a 30-"W" name; tap the phones button; the panel opens.
- Measured: `.room-card` scrollWidth 631 / clientWidth 576; `.room-player-name` 513 / 489; horizontal scrollbar in the card; the status text is pushed out and clipped.
- Expected: the name wraps or truncates inside the card and the status stays visible.
- Impact: cosmetic, panel only. Real names with spaces wrap normally.

### Observations (not bugs)

- A visit to `ZZZZZZ` on the same origin keeps the place for `PVQC8E`. Places are now stored per room (`brainrush.phone = {"CODE": {token, at}}`).
- Port 8008 was stopped after the first run; the second phone origin was `[::1]:8007` in this round.
- The console message "An unknown error occurred when fetching the script." did not appear in this round's app pages.
- Clicks inside cross-origin iframes are unreliable in the tool; phone taps were done on top-level pages or by DOM click in same-origin iframes.

### Open items after Re-test 1

- BUG-52-04 (Minor): wrap or truncate the name in the Arabic room card.
- Row 29b: the 2 s window is still not isolated; a short test with two real tabs on the live host would close it.
- Row 3b: Golden Goal and double cell under Host control, not reached.
- Row 9b: Teams with two phones in the UI.
- Golden Goal in phone mode: "Show results" stayed disabled; developer to confirm intent.
- Rows 4b, 26 and the 1 s timing: need a real phone and the live host.
- Test rooms PVQC8E, FLSWYW and L72MWB remain in the local DB and expire after 6 h. Both PHP servers are stopped.

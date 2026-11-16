# CR US-55 Christmas theme: test report

Branch `christmas-theme` (uncommitted work, tested as found). Backlog: `docs/product-backlog.md` Epic E18, US-55 (~lines 554-573) and D-66 (~line 697). Developer notes: `docs/sprints/cr-us55-christmas-dev.md`.

## Summary

| Item | Result |
|---|---|
| Environment | Windows 11, PHP 8.0.30 (XAMPP), MySQL/MariaDB (XAMPP, database `brainrush`), `php -S localhost:8011` (own port, stopped after testing), Browser pane (Chromium, 800x600 pane). Viewports 1366x768, 1920x1080 and 375x812 were emulated with same-origin iframes at their real width (layout is real; screenshots scaled for the pane). |
| UX gate scripts | `validate_contrast.py`, `lint_hardcodes.py`, `check_no_emoji.py` **could not run**: Python is not installed (the `python` command is only a Microsoft Store alias). `scripts/gate.mjs` depends on them. Equivalent manual checks were done (see C12, C16). |
| Criteria checked | 24 rows: 18 backlog rows (C1-C16, including C3b and C3c) and D-66 (a)-(f), plus the focus checks listed below |
| PASS | 22 (C8 and C16 have a noted gap: first-paint timing not measured; the Python gates not run) |
| FAIL | 1 (C12 contrast: BUG-55-01 and BUG-55-03) |
| PENDING (environment) | 1 (C9 reduced motion runtime emulation) plus the three Python UX gates (see C16) |
| Bugs | 3 Minor (BUG-55-01, BUG-55-02, BUG-55-03). 0 Critical, 0 Major. Observations OBS-55-01..07 are not bugs. |
| Verdict | **NEEDS FIXES** (small CSS fixes for BUG-55-02 and BUG-55-03; BUG-55-01 needs an owner decision because `js/game.*.js` must stay unchanged). |

Counts: one row per criterion in the table below. C4 and C8 combine runtime and code-review evidence; C9 is PENDING; the three Python UX gates are PENDING and their manual equivalents are in C12 and C16.

## Acceptance criteria (US-55 and D-66)

| # | Criterion (short) | Result | Evidence |
|---|---|---|---|
| C1 | Admin > Game settings has checkbox "Christmas theme" (`christmas_theme`, 0/1) and text field "Christmas greeting" (`christmas_banner_text`, max 150); loaded and saved like banner | PASS | `admin.html` lines 43-50 inside `CHRISTMAS` block. Admin with rows on: checkbox checked, greeting `Season greetings from Team A <b>bold</b>` loaded after reload. Admin save with theme off and empty greeting: "Settings saved.", DB rows `christmas_theme`=0 and `christmas_banner_text`=''. Admin save with theme on: "Settings saved.", rows written, `banner_text` unchanged. Only the two Christmas rows change on save. |
| C2 | No `christmas_theme` / `christmas_banner_text` row: GET returns 0 and empty greeting; game page shows no theme | PASS | Rows deleted (baseline state). `GET api/settings.php` returned `"christmas_theme":0,"christmas_banner_text":""`. Game page: no `theme-christmas` class, no snow, greeting `hidden`, `theme-color` `#0b1026`. Admin: checkbox unchecked, greeting empty. |
| C3 | PUT with theme not 0/1, or greeting > 150 chars: 400 and nothing saved; exactly 150 saved | PASS | PUT `2`, `"abc"`, `true`, `1.5`, `null` for theme: all 400 "christmas_theme must be a whole number between 0 and 1". Greeting 151 ASCII: 400 "at most 150 characters". 151 Arabic: 400. 150 ASCII, 150 Arabic and 149 letters + one emoji (150 characters, 153 bytes): 200 and stored. A rejected PUT saved nothing (GET after showed previous value). Theme 0 and 1 accepted. POST returns 405 (see OBS-55-01). |
| C3b | Empty / blank greeting allowed (`""`, spaces, `null`) and stored as '' | PASS | 200, stored `""`. `banner_text: ""` is still 400 (unchanged rule). Number and array greeting: 400 "must be text". |
| C3c | Greeting is text, not HTML | PASS | `<b>Ho</b> & <img src=x onerror=...>` stored and returned as-is; on the game page it shows as literal text (`textContent`). Admin shows the stored text literally. |
| C4 | Theme off = as before: no `theme-christmas` class, no snow, no strip, `theme-color` unchanged, no console errors | PASS (see OBS-55-03 on console) | Theme off on game page: body class `game`, 0 flakes, `#xmas-greeting` hidden and empty, `theme-color` `#0b1026`, `localStorage` key removed. All `css/christmas.css` selectors are scoped under `.theme-christmas` (checked by grep: no unscoped selector; `@keyframes` only referenced from scoped rules). `js/game.c535b134.js` and `css/style.c30ef865.css` are untouched (`git diff --stat`). |
| C5 | Theme on: `body.theme-christmas`; deep pine palette, red accent, gold kept for points and primary buttons; string of lights under header; Santa hat on logo; snow behind content (`aria-hidden`, no click blocking) | PASS (see BUG-55-02 for the hat at 375 px) | Screenshots at 1366, 1920 and 375 (EN and AR): palette, lights under the header edge, hat on logo, snow behind content. Snow layer: `aria-hidden="true"`, `pointer-events:none`, `z-index:-1`, 22 flakes (12 on phones). Click targets on setup (7 visible controls): `elementFromPoint` returns the control or its child in every case. |
| C6 | Greeting strip on setup: admin text, or built-in EN "Merry Christmas from Mokh Rush!" / AR "عيد ميلاد مجيد من مخ رش!" when empty; switches with language | PASS | Empty greeting EN: "Merry Christmas from Mokh Rush!". Switch to AR (`lang=ar`, `dir=rtl`): Arabic default shown (AR to EN is covered by the dev notes, not re-run). Custom text gets `dir="auto"`. 150 characters with no spaces wraps inside the strip at 375 px, no horizontal overflow (see OBS-55-02). |
| C7 | `<meta name="theme-color">` festive when on | PASS | On: `#0b2318`. Off: restored to `#0b1026` (captured at script load). |
| C8 | Returning player: theme applied from last known state before settings call completes; removed when switched off since | PASS (first-paint timing not measured) | Code: `js/christmas.js` lines 166-167 apply `brainrush.christmas` synchronously when the script runs (first element of body), before its `fetch`. Runtime: stale flag `1` with theme off: class removed, flag removed after the settings call. Flag absent with theme on: theme applied and flag `1` saved. Settings call failing (test copy of the script pointing to a missing URL, flag `1`): theme kept with built-in greeting, flag kept (the "last known state" path). First paint itself was not measured with a throttled network. |
| C9 | `prefers-reduced-motion: reduce`: snow does not animate (or is hidden), rest of theme stays | PENDING (environment) | CSS present in live stylesheet: `.theme-christmas .xmas-snow {display:none}` and `.theme-christmas .page-header::after {animation:none}`, nothing else touched. The browser's OS preference is off and the tool cannot emulate it, so the runtime check was not done. |
| C10 | Emojis allowed in greeting strip, beside header title and as board accents; decorative ones `aria-hidden="true"` | PASS | Greeting emoji spans `aria-hidden="true"`; title tree span `aria-hidden="true"`; board-info tree is CSS `content` with empty alternative text (`content: "..." / ""`). |
| C11 | Setup, board, question popup, helpers, Golden Goal, Daily, Streak readable and usable at 1366x768, 1920x1080 and 375 px, EN and AR | PASS (coverage note) | Setup: all 6 combinations (1366, 1920, 375 in EN and AR; screenshots for EN and AR, audits for all). Board: all 6 (screenshots at 1366 EN, 375 EN and 375 AR; audits for the rest). Question with helper chips: all 6 (audits; screenshots at 1366, 375). Streak question: 375 EN, 375 AR, 1920 EN and 1366 EN (audits). Daily question: 1366 AR, 375 AR (audits; 1366 AR screenshot). Double-score overlay and Golden Goal screen forced visible (DOM unhide, text filled), 1366 EN and 375 EN; the real Golden Goal wager flow was not played. Streak leaderboard: 1366 EN. No horizontal overflow in any run. Readable in all runs; the only audit failures are the player-colour name (BUG-55-01). |
| C12 | Text, point values and buttons meet WCAG AA (4.5:1 normal, 3:1 large and UI parts) in the new palette | FAIL (BUG-55-01 Minor, BUG-55-03 Minor) | Manual computation of 17 palette pairs (node, WCAG formula): all text pairs pass (lowest: muted on panel-2 6.94:1; danger on panel 6.30:1; gold on open cell 6.21:1; primary-button ink 10.68:1; greeting white on red 6.95:1 to 8.27:1). Runtime audit (every visible text node, nearest opaque background) on setup, board and question in all 6 viewport/language combinations, plus Streak, Daily, leaderboard, double overlay and Golden Goal in the combinations listed in C11: the only failure is the player name on the default red player card (3.91:1, BUG-55-01). UI boundary `#3f7a57` on panel-2 is 2.31:1 (BUG-55-03). |
| C13 | Other pages (Admin, guide, About, Contact, Privacy, Terms, Integration Quiz, offline page) unchanged with theme on | PASS | Theme on: `how-to-play.html`, `integration-quiz.html`, `offline.html`, `admin.html`, `about.html` have no theme class, no snow, no Christmas script or CSS, `theme-color` unchanged. Static grep only (not run in a browser): `contact.html`, `privacy.html`, `terms.html` have no Christmas reference. Admin shows the Christmas fields, as intended. |
| C14 | All theme styling in `css/christmas.css` (scoped), game logic in `js/christmas.js`; `js/game.*.js` and `css/style.*.css` unchanged; every hook marked `CHRISTMAS` | PASS | `git diff --stat`: only `admin.html`, `api/settings.php`, `docs/product-backlog.md`, `index.html`, `js/admin.750e5b72.js` changed; `js/game.c535b134.js` and `css/style.c30ef865.css` have no diff. Hooks: `index.html` (3 hooks, `CHRISTMAS` comment before each), `admin.html` (block comments), `js/admin.750e5b72.js` (comment before each block, inline comments on the dom entries and PUT keys), `api/settings.php` (header comment, rule lines, `EMPTY_TEXT_ALLOWED`, `load_settings` defaults, empty-greeting branch). New files are untracked (see C16 note). |
| C15 | Dev notes include removal checklist (files, hooks, SQL line) | PASS | `docs/sprints/cr-us55-christmas-dev.md` lines 69-83: 9 steps covering the two asset files, `index.html`, `admin.html`, `js/admin.*.js`, `api/settings.php` (including restoring the `TEXT_SETTING_RULES` loop), the `DELETE FROM settings WHERE name IN ('christmas_theme','christmas_banner_text')` line, the grep check, the docs and deploy. Checklist and code match. |
| C16 | Dependencies: no-emoji exception only for Christmas files and greeting; both assets content-hashed by the pre-commit hook | PASS (with notes); gate runs PENDING | Emoji scan (Node, Extended_Pictographic, equivalent of `check_no_emoji.py`): Christmas files only (`js/christmas.js` lines 24-25 literal snow and snowman characters; the rest of the Christmas emoji are `\u{...}` escapes). Pre-existing emoji outside the theme exist at HEAD too (see OBS-55-04). Hash hook `.githooks/hash-assets.sh` processes `git ls-files` only: the two new files must be `git add`ed before the commit (dev notes say so; see OBS-55-05). Not tested: Android app picking up the theme (out of scope for this sprint). |
| D-66 a | Admin toggle, not date-based; no redeploy | PASS | Toggle saves and takes effect on the next page load; no code change needed to switch on/off (C1, C2). |
| D-66 b | Festive look and greeting only; game rules, scoring and screen behaviour unchanged | PASS | `js/game.*.js` untouched; game flows (Players, board, question scoring, helpers, Streak, Daily) ran normally with the theme on. |
| D-66 c | No Christmas question category | PASS | Category list (14 playable) has no Christmas category. |
| D-66 d | Game page only; other pages unchanged | PASS | See C13. |
| D-66 e | Emojis allowed as an exception to the house rule | PASS | See C10, C16. |
| D-66 f | Built to be removed | PASS | See C14, C15. |

## Focus checks requested

| Area | Result | Evidence |
|---|---|---|
| API validation (0/1, 150 limit, empty allowed, greeting as text) | PASS | C3, C3b, C3c. |
| Admin load / save | PASS | C1 (including the client-side 151-character check: "Christmas greeting must be at most 150 characters.", no PUT sent). |
| Theme off = identical to today | PASS | C4 (runtime and CSS scoping; a pixel comparison against HEAD was not done). |
| Theme on visuals (palette, lights, hat, snow behind content, greeting EN/AR, theme-color) | PASS (see BUG-55-02) | C5 to C7. |
| No flash for returning players; removal when switched off | PASS (first paint not timed) | C8. |
| `prefers-reduced-motion` | PENDING (environment) | C9. |
| Readability at 1366, 1920, 375 in EN and AR RTL | PASS (coverage note) | C11. |
| No console errors | PASS with caveat | No JS exception was observed in any run. The browser console showed 1-3 messages "An unknown error occurred when fetching the script" on the game page with the theme on, with the theme off, and on the About page (which loads no Christmas code). Every network request returned 200 (the only 404 came from my own test of the failing settings URL). Treated as environment noise (OBS-55-03). |
| Other pages unchanged with theme on | PASS | C13. |
| UX gates | PENDING (Python missing) for `validate_contrast.py`, `lint_hardcodes.py`, `check_no_emoji.py`; manual equivalents done | Contrast: C12 (manual). Hardcoded values: `css/christmas.css` uses hex colours as overrides of `:root` tokens, the same pattern as `css/style.c30ef865.css`; the gate would flag them, which is expected for this override file, not a new defect (not verified by the gate). Emoji: C16 scan. |

## Bugs

### BUG-55-01 (Minor): white player name on the default red player card fails AA

- **Severity:** Minor. Pre-existing (the colour and the ink come from `js/game.c535b134.js`, which this CR must not change), but it appears on the board, question and Streak screens with the theme on, and C12 says text must meet AA in the theme.
- **Steps:** 1. Open `http://localhost:8011/index.html` with the theme on (Admin, tick "Christmas theme", Save). 2. Keep the default player (colour red), name "Team A". 3. Tick any 3 categories and press Start Game. 4. Read the name on the red player card on the board, or on the question screen scoring panel.
- **Expected:** text contrast at least 4.5:1 (name is 17 px, not bold enough to count as large text).
- **Actual:** white `#ffffff` on `#e5484d` = 3.91:1. The colour and ink are inline player colours from `game.js`; no theme rule touches this card, so the CR does not change it (theme-off run not repeated).
- **File:** `js/game.c535b134.js:122` (`{ value: '#e5484d', name: 'color.red', ink: '#ffffff' }`).
- **Suggested action:** owner decision. Options: (a) accept as pre-existing for now; (b) darken the red player colour or use dark ink for it in `game.js` (a change outside this CR, which would need its own sign-off because the CR promises `js/game.*.js` is unchanged); (c) a theme-only CSS override targeting the inline colour, which is fragile and not recommended.

### BUG-55-02 (Minor): Santa hat tip is clipped at the top edge on phones

- **Severity:** Minor (cosmetic).
- **Steps:** 1. Theme on. 2. Open the game page at 375 px wide (or at 375x812 in the browser). 3. Look at the top of the header logo.
- **Expected:** the whole hat is visible.
- **Actual:** `.page-header h1::before` is placed at `top: -0.85rem` (about 14.5 px), but the header's top padding at 375 px is about 10.2 px, so about 4 px of the hat box is above the top of the page and the tip is cut off. At 800 px and wider the 1rem padding is enough and the hat is whole.
- **File:** `css/christmas.css:82-92` (`top: -0.85rem`). Suggested fix: a phone-width rule (`@media (max-width: 600px)`) that moves the hat down (for example `top: -0.5rem`) or adds top padding to the header in the theme.

### BUG-55-03 (Minor): UI borders below 3:1 on the panel backgrounds

- **Severity:** Minor. WCAG 1.4.11 (non-text contrast 3:1) applies where the border is needed to see the control. The category tiles and the buttons are also identified by their label text and the native checkbox, so this is advisory, but the dev notes state UI parts meet 3:1 and this pair was not measured.
- **Steps:** 1. Theme on. 2. Open setup. 3. Measure the border colour of `.cat-label` (category tiles) and `.btn` (on `--panel-2`), and `.setup-block` (on `--panel`).
- **Expected:** at least 3:1 against the background behind it.
- **Actual:** `--border #3f7a57` (`css/christmas.css:15`) gives 2.31:1 on `--panel-2` `#1a3f2a` (tiles, buttons) and 2.81:1 on `--panel` `#12301f` (fieldsets). It is 3.26:1 only on the page background.
- **Suggested fix:** in the theme block set `--border` to `#5a9a72` (3.52:1 on panel-2, 4.29:1 on panel, 4.97:1 on the page background, computed in Node), then re-run the audit.

## Observations (not bugs)

- **OBS-55-01 Endpoint wording.** `POST api/settings.php` returns 405. The backlog says "`PUT`/`POST` ... then → 400". The endpoint has only ever accepted GET and PUT, so the wording should be corrected to PUT. No code change needed.
- **OBS-55-02 Long greeting.** A 150-character greeting with no spaces wraps inside the strip and does not overflow, but at 375 px the strip is about 288 px tall and pushes the setup content down. Within the spec; consider a shorter recommended length in the Admin hint if the owner wants the setup screen to stay compact (D-30).
- **OBS-55-03 Console messages.** "An unknown error occurred when fetching the script" appears 1-3 times on the game page with the theme on and off, and on the About page, which loads no Christmas code, with no failing request. Treated as environment. Confirm in a clean browser profile (PENDING).
- **OBS-55-04 Emoji outside the theme already at HEAD.** `index.html` (💀, 📅, 🏆 on the Streak, Daily and leaderboard buttons, lines 160, 162, 182), `js/game.c535b134.js` (⚽ in a comment and in a helper string; line 102 and line 4268 comment), `js/i18n.c8df9c4b.js` (🔊 in the read-aloud hint, lines 108 and 456). These are not from this CR, so the no-emoji gate was not clean before the CR either. D-66 only excepts the Christmas files.
- **OBS-55-05 New files must be staged.** `.githooks/hash-assets.sh` only processes `git ls-files`. If `css/christmas.css` and `js/christmas.js` are not `git add`ed before the commit, they are served unhashed and cached for 7 days by the host. The dev notes say to stage them; keep this in the PR checklist.
- **OBS-55-06 Double settings call and always-loaded files.** The game page now fetches `api/settings.php` twice and loads `css/christmas.css` and `js/christmas.js` even with the theme off. Both are harmless and documented in the dev notes, but "identical to today" is true in look and behaviour, not in network requests.
- **OBS-55-07 Admin error display.** The `maxlength="150"` attribute blocks typing a 151st character, so the Admin's client-side check is only reachable programmatically. The server's 400 message is not displayed in a UI run (API checked directly).

## Test data and cleanup (restored to the state found)

- **Settings table:** recorded before testing (10 rows, no Christmas rows). Restored to the same 10 rows; the table dump matches the snapshot exactly (`diff` empty).
- **Game logs:** the 11 existing `logs/game-*.log` files were checksummed before testing and are byte-identical after. Test games created `logs/game-2026-11-16.log` (12 lines, all test game lines), which did not exist before; removed.
- **Database writes from play:** no answers were submitted, so no question statistics were written; `game-log.php` wrote only to the log file. No Streak or Daily results were saved.
- **Browser storage:** test-only `brainrush.*` keys on `localhost:8011` removed.
- **Server:** `php -S localhost:8011` stopped after testing.
- **Repository:** no file changed by testing. `git status` is the same as at the start (same 5 modified tracked files and the same untracked files); branch still `christmas-theme`; nothing committed.
- **Admin access:** no admin credentials are configured in the local `api/config.php`, so Admin writes were allowed for loopback requests only (the `is_local_request` path). The credentialed Admin path was not tested.
- **Test names:** only "Team A" and generic test text were used. No personal data appears in this report. The leaderboard and game-log rows already in the local database were not copied here.

## Verdict

**NEEDS FIXES.** No Critical or Major issues; the CR's behaviour is correct (API validation, Admin load/save, theme on/off, no-flash fallback, other pages unchanged, game code untouched). Before PO acceptance:

1. BUG-55-02: adjust the hat position for phones (`css/christmas.css`).
2. BUG-55-03: lighten `--border` in `css/christmas.css` to `#5a9a72` (or similar), re-run the audit, and add the two pairs to the dev notes' contrast table.
3. BUG-55-01: owner decision (accept as pre-existing, or allow a `game.js` palette change under its own sign-off).
4. PENDING items to run on a machine with Python and a clean browser: the three UX gates (`validate_contrast.py`, `lint_hardcodes.py`, `check_no_emoji.py`), reduced motion emulation, and a first-paint timing check.

## PO acceptance (2026-11-16)

**US-55 Christmas theme: ACCEPTED with follow-ups.**

- Fix loop 1 (lead, `css/christmas.css`): BUG-55-02 fixed (`@media (max-width: 600px)` hat at `top: -0.5rem`; at 375x812 in Chrome the hat top is -8.5 px against the h1 top 10.2 px, so it is fully inside the page). BUG-55-03 fixed (`--border` `#5a9a72`: 3.52:1 on panel-2, 4.29 on panel, 4.97 on bg; dev notes table updated). Both checked in code by the PO.
- C12: met for everything the theme styles. BUG-55-01 is pre-existing in `js/game.*.js`, which this CR must not change; moved to FU-75 for an owner decision (D-67 a).
- C9, C8 first paint and the Python gates: not blocking. The reduced-motion rule is present and scoped; the `verify_states` gate passed on `index.html` (130 states) and `admin.html` (107). The runtime checks go to the owner's local Chrome check FU-76 (D-67 b).
- OBS-55-01: backlog wording corrected to `PUT`. OBS-55-02, -04, -06, -07 accepted as is (D-67 c). OBS-55-03 and OBS-55-05 are steps in FU-76.
- Follow-ups: FU-75 (red player card contrast), FU-76 (owner local check and commit, stage the two new files first), FU-77 (hosted deploy), FU-78 (removal CR after Christmas).

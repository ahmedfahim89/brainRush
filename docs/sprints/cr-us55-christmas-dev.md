# CR US-55: Christmas theme: developer notes

Branch `christmas-theme` (2026-11-16). Owner request, D-66. Game page (`index.html`) only. Built to be removed after Christmas: see the removal checklist at the end.

## What it does
- **Admin > Game settings** has a checkbox "Christmas theme on the game page" (`christmas_theme`, 0/1) and a text field "Christmas greeting" (`christmas_banner_text`, max 150 characters, may be empty). They load and save with the other settings.
- **API**: `GET api/settings.php` always returns both keys; a missing row gives `christmas_theme: 0` and `christmas_banner_text: ""` (no migration). `PUT` rejects a theme other than 0/1 and a greeting over 150 characters with 400 and saves nothing; an empty or blank greeting is saved as `""`.
- **Game page** (theme on): `body.theme-christmas`; deep pine palette with a red accent, gold kept for point values and primary buttons; red header edge with a string of twinkling lights under it; a Santa hat on the header logo and a tree emoji beside the title; a snow edge along the board's category row and a tree before the board info line; a light snowfall layer behind the content; a red greeting strip on the setup screen; `<meta name="theme-color">` set to `#0b2318`.
- **Greeting**: the admin text, rendered with `textContent` (an HTML greeting shows as literal text). Empty: "Merry Christmas from Mokh Rush!" in English, "عيد ميلاد مجيد من مخ رش!" in Arabic, following `BrainRushI18n.lang()`. It switches when the player changes EN / AR. A custom text gets `dir="auto"`.
- **No flash**: `js/christmas.js` is the first element of `<body>`. It reads `brainrush.christmas` from localStorage (try/catch) and adds the class before the first paint. Then it calls `api/settings.php` itself (`cache: 'no-store'`). On returns the full theme and saves `1`. Off removes the class, the added elements and the saved state, and restores theme-color. If the settings call fails, the last known state stays, with the built-in greeting.
- **Snow**: 22 `❄` flakes (12 on phones up to 600 px) in a `position: fixed; z-index: -1` layer, inserted as the first child of `<body>`. It is painted above the page background and below every element of the page, so it never covers text or controls. `aria-hidden="true"`, `pointer-events: none`. Under `prefers-reduced-motion: reduce` the layer is hidden and the lights stop twinkling. The rest of the theme stays.
- **Decorative emojis** (D-66): the greeting strip's emojis and the title tree are `aria-hidden="true"` spans. The board-info tree is CSS `content: "…" / ""` (empty alternative text).

## Files
New (both content-hashed by the pre-commit hook at commit time):
- `css/christmas.css`: all styling, every selector scoped under `.theme-christmas`.
- `js/christmas.js`: all game-side logic.

Changed (each hook carries a `CHRISTMAS` comment):
- `index.html`: the stylesheet link in `<head>`, the script as the first element of `<body>`, and `<p id="xmas-greeting">` after `#new-banner`.
- `admin.html`: the checkbox, label, text field and hint in Game settings (between `<!-- CHRISTMAS ... -->` and `<!-- /CHRISTMAS -->`).
- `js/admin.*.js`: 2 `dom` entries, 3 lines in `fillSettings`, the greeting length check in `onSettingsSubmit`, `christmasError` in the errors list, 2 keys in the PUT body.
- `api/settings.php`: header comment line, `christmas_theme` in `SETTING_RULES`, `christmas_banner_text` in `TEXT_SETTING_RULES`, the `EMPTY_TEXT_ALLOWED` constant, the 2 default lines in `load_settings()`, the empty-greeting branch in the `TEXT_SETTING_RULES` loop of `validate_settings()`.

Not changed: `js/game.*.js`, `css/style.*.css`, `js/i18n.*.js`, the other pages, `sw.js`, `.htaccess`, the schema.

**Commit note:** `git add css/christmas.css js/christmas.js` before committing. The hook only hashes tracked files. It then renames them to `christmas.<hash>.*` and rewrites the two links in `index.html`.

CSP: the site sends no Content-Security-Policy for pages (`.htaccess` sets one only for `.svg` files), so the inline `style.setProperty` on the flakes and the `data:` SVG of the Santa hat are fine. No inline `<script>` or `<style>` was added.

## Palette and contrast (WCAG AA)
Overrides of the `:root` variables: `--bg #0b2318`, `--panel #12301f`, `--panel-2 #1a3f2a`, `--border #5a9a72` (was `#3f7a57`, raised for BUG-55-03), `--text #f2f7f3`, `--muted #b4cdbd`, `--danger #ff8a8a` (lighter than `#ff6b6b` to stay above 4.5:1 on the green panels). Gold `#f5c518` / `#c99d00` and success `#4cd18a` are unchanged. Overrides of the hard-coded `style.css` colours: header `#0e1433` → `#0f2a1b`; fields, timer and played tracks `#0e1433` → `#0d2618`; link hover `#ffe27a` and primary hover `#ffd84a` → `#ffe066`; the new-banner gradient's `#ffe27a` → `#ffe066`; overlays `rgba(5, 8, 22, 0.88)` → `rgba(4, 16, 9, 0.9)`; open board cells `#1f2a6b → #161f57` → `#1d4a30 → #153a25`; and the opaque hover tints `#303039` → `#2d421e`, `#584f32` → `#4b551d`, `#24306a` → `#24573a`. Played cells keep their owner colour and the grey from `style.css`.

Measured ratios (node script, WCAG formula):
| Foreground | Backgrounds (ratio) |
|---|---|
| text `#f2f7f3` | bg 15.28, panel 13.19, panel-2 10.83, header 14.17, streak-choice hover 7.75 |
| muted `#b4cdbd` | bg 9.79, panel 8.45, panel-2 6.94 |
| gold `#f5c518` | bg 10.16, panel 8.77, panel-2 7.20, header 9.42, cell top/bottom 6.21 / 7.74, streak/daily hover 6.75, leaderboard hover 4.92 |
| danger `#ff8a8a` | bg 7.30, panel 6.30, panel-2 5.17 |
| success `#4cd18a` | panel 7.35, panel-2 6.04 |
| white (greeting) | `#9e0f1c` 8.27, `#b3121f` 6.95 |
| `#1a1a1a` (primary buttons) | gold 10.68, hover `#ffe066` 13.35 |
| border `#5a9a72` (UI parts) | bg 4.97, panel 4.29, panel-2 3.52 (tester-computed) |

The ux-ui plugin gates (`validate_contrast`, `lint_hardcodes`, `check_no_emoji`) were not available in this agent session. The tester should run them on `css/christmas.css`. `check_no_emoji` is expected to flag `js/christmas.js` and `css/christmas.css` by design (D-66).

## How to run / test
1. `php -S localhost:8000` from the repo root (MariaDB running). Open `admin.html` > Game settings, tick "Christmas theme", optionally enter a greeting, then Save.
2. Reload `index.html`. You should see the theme, the greeting (or the built-in one when empty), EN/AR switching and RTL. Clear the box, save and reload: the page is as before (no class, no snow, no strip, theme-color `#0b1026`).
3. Reduced motion (DevTools > Rendering > prefers-reduced-motion: reduce): no snow, steady lights.

## Verification done (on `php -S localhost:8010`, Chrome via Playwright)
- `php -l api/settings.php`: no syntax errors.
- API: GET with no rows → `"christmas_theme":0`, `"christmas_banner_text":""`. PUT `christmas_theme: 2` / `"abc"` → 400. PUT 151 characters → 400 "christmas_banner_text must be at most 150 characters", nothing saved. Exactly 150 (149 × é + 🎄) → 200, saved with `CHAR_LENGTH` 150. Empty, blank and null → 200, saved `""`. A number → 400. `banner_text: ""` is still 400 (unchanged rule).
- Game page, theme on: body class, theme-color `#0b2318`, greeting `<b>Ho Ho Ho</b> & <img …>` shown as literal text (only 3 `SPAN` children, the 2 emoji spans `aria-hidden`), snow `aria-hidden="true"`, `pointer-events: none`, `z-index: -1`, 22 flakes. `elementFromPoint` on Add player / Streak / Daily returns the buttons; under the lights it returns `main`. No console errors.
- Default greeting EN → AR → EN on the language switch: "Merry Christmas from Mokh Rush!" / "عيد ميلاد مجيد من مخ رش!".
- Reduced motion: snow layer `display: none`.
- Returning player with the settings call delayed 1.5 s: class already present at DOMContentLoaded. Stale saved `1` with the setting off: class present at DOMContentLoaded, removed when the call returns, saved state cleared.
- Theme off: no class, no snow, no title emoji, greeting hidden and empty, theme-color `#0b1026`, nothing saved, no console errors.
- Screens at 1366x768, 1920x1080 and 375x812, in EN and AR: setup, board, question (with the scoring panel and helper chips), the double-score popup, Golden Goal offer, Streak question and Daily Challenge question. All readable, and no console errors on any run.
- Admin: loads unchecked/empty with no rows. 151 characters → "Christmas greeting must be at most 150 characters.", not sent. Save on + text → "Settings saved.", values survive a reload. A DB diff before/after the save shows only the two Christmas rows changed.

## Known limitations
- The settings are fetched twice on the game page (once by `game.js`, once by `christmas.js`). This is the price of keeping `game.js` untouched, and the call is tiny.
- The snowfall is hidden, not slowed, under reduced motion.
- The Christmas settings rows were deleted again after testing (the local DB had none before). The test games wrote only lines in `logs/game-2026-11-16.log` (git-ignored, every line a test game), so I deleted that file.

## Removal checklist (after Christmas, separate CR)
1. Delete `css/christmas.<hash>.css` and `js/christmas.<hash>.js`.
2. `index.html`: remove the `CHRISTMAS` comment and `<link rel="stylesheet" href="css/christmas.<hash>.css">` in `<head>`, the `CHRISTMAS` comment and `<script src="js/christmas.<hash>.js">` at the top of `<body>`, and the `CHRISTMAS` comment and `<p id="xmas-greeting" …>` after `#new-banner`.
3. `admin.html`: remove everything from `<!-- CHRISTMAS (US-55, D-66) … -->` to `<!-- /CHRISTMAS -->` in Game settings.
4. `js/admin.*.js` (search `CHRISTMAS`): the 2 `dom` entries (`settingChristmasTheme`, `settingChristmasText`); the 3 lines in `fillSettings`; the 4 lines that compute `christmasText` / `christmasError` in `onSettingsSubmit`; `christmasError /* CHRISTMAS */,` in the errors list; the 2 keys in the PUT body.
5. `api/settings.php` (search `CHRISTMAS`): the header comment line; `'christmas_theme'` in `SETTING_RULES`; `'christmas_banner_text'` in `TEXT_SETTING_RULES`; the `EMPTY_TEXT_ALLOWED` constant and its comment; the 2 default lines and their comment in `load_settings()`. In `validate_settings()`, put the `TEXT_SETTING_RULES` loop back to:
   ```php
   if (array_key_exists($name, $body)) {
       $updates[$name] = require_text($body[$name], $name, $maxChars);
   }
   ```
6. Database (local and live): `DELETE FROM settings WHERE name IN ('christmas_theme','christmas_banner_text');`
7. Check: `grep -rni "christmas\|xmas" --exclude-dir=node_modules --exclude-dir=docs .` finds nothing. `php -l api/settings.php`, then Admin save and the game page work.
8. Docs: mark US-55 / D-66 removed in `docs/product-backlog.md` (and the story status table), and update `docs/deploy-hostinger.md` / the sprint-plan status line as usual.
9. Deploy: `index.html`, `admin.html`, the new hashed `admin.*.js` and `api/settings.php`. Remove the two christmas assets from the server. Players' saved `brainrush.christmas` key is harmless once the script is gone.

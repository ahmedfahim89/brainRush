# CR "Mokh Rush rename" (D-64) - developer notes

Owner-approved 2026-11-11. Branch `rename-mokh-rush` (worktree `BrainRush-rename`, from `main` a3d3d58). Not committed: the owner checks it in Chrome first (FU-68). The pre-commit hook re-hashes the changed js/css at commit time; the hashed names were left as they are.

## What changed

### 1. Logo (Concept A)
- `img/logo.svg`: replaced with Concept A (512 viewBox, comment now "Mokh Rush icon").
- New PNGs (new names because of the 7-day image cache), rendered with Playwright from `docs/design/logo-concepts/concept-a.svg` / `concept-a-maskable.svg` (script kept in `%TEMP%/mokh-logo/export.js`, not in the repo):

| File | Size | Notes |
|---|---|---|
| `img/mokh-favicon-32.png` | 32x32 | transparent corners |
| `img/mokh-apple-touch-icon.png` | 180x180 | transparent corners, like the old one |
| `img/mokh-icon-192.png` | 192x192 | |
| `img/mokh-icon-512.png` | 512x512 | |
| `img/mokh-icon-maskable-512.png` | 512x512 | full bleed, mark inside the 80% safe circle |
| `img/mokh-logo-512.png` | 512x512 | JSON-LD `image` |
| `img/mokh-logo-wordmark.png` | 1060x260 | navy rounded panel, icon + gold "Mokh Rush" (same layout as `logo-wordmark.png`) |
| `img/mokh-og-image.png` | 1200x630 | same layout as `og-image.png`: gold frame, icon, "Mokh Rush", "Free trivia quiz game", "Parties · Teams · Family · English & Arabic" |

- The old PNGs stay in `img/` and are no longer referenced. `logo-wordmark.png` was not referenced by any shipped file before either (only by external uses such as the AdSense consent message).
- `offline.html`: its inline logo now uses the Concept A shapes; `sw.js` cache bumped to `brainrush-offline-v2` so phones fetch the new offline page.

### 2. Image references
All pages (index, how-to-play, about, contact, privacy, terms, admin, integration-quiz) point favicon / apple-touch-icon / og:image / JSON-LD `image` at the `mokh-*` files. Also `manifest.webmanifest`, `android/twa-manifest.json` (`iconUrl`, `maskableIconUrl`), `android/app/src/main/res/raw/web_app_manifest.json`, `api/mcp.php` server icons, and `.htaccess` (`/favicon.ico` and `/apple-touch-icon.png` rewrites).

### 3. Text
- Pages: `<title>`, h1, og/twitter titles, `og:site_name`, og:image alt ("a gold brain with speed streaks"), JSON-LD `name`, footer and body copy.
- `js/i18n.*.js`: new key `app.name` (EN "Mokh Rush", AR "مخ رش"); `share.won`, `share.tie`, `daily.score` in EN use "Mokh Rush", in AR "مخ رش". Header comment updated.
- `index.html`: the h1 brand text is `<span data-i18n="app.name">`, so `apply()` swaps it. `js/game.*.js` `applyStaticTexts()` sets `document.title` to `t('app.name')` in Arabic and back to the page's own English title in English (amends D-59 d for this one title; see D-64 b). The Integration Quiz is fixed English and keeps its static title.
- `js/game|share|speech|app|admin.*.js`, `css/style.*.css`, `css/guide.*.css`: header comments.
- `manifest.webmanifest` name / short_name; Android `name` / `launcherName` in `android/twa-manifest.json`, `android/app/build.gradle`, raw `web_app_manifest.json`; `android/README.md` title.
- `api/mcp.php`: server title and description, tool titles/descriptions, instructions, result texts. `mcp/trivia-card.html`: `<title>`, `.brand`, App name, comments.
- `api/db.php`: `ADMIN_REALM` = 'Mokh Rush admin', header comment.
- `llms.txt`, `robots.txt`, `sitemap.xml`, `sw.js`, `.htaccess`: titles / comment headers.
- Docs: `README.md` (title, a "formerly BrainRush" line, product name, icon file names), `docs/spec.md` (title, PO line, share/Daily texts; folder paths stay), `docs/claude-connector.md` (connector name; the plugin's own name "BrainRush Trivia" stays until the mod repository is renamed), `docs/product-backlog.md` (title, US-39/40/43/46 and footer texts, D-64, FU-67 status, FU-68 to FU-72).

## Kept on purpose (remaining "BrainRush" in shipped files)
`grep -rn "BrainRush"` over html, js, css, api, mcp, manifest, llms.txt, robots, sitemap, sw.js, .htaccess, android finds only:
- JS globals `BrainRushI18n`, `BrainRushShare`, `BrainRushSpeech` (game, i18n, share, speech js).
- `api/config.example.php` and `api/config.php` header comments (config files were not to be touched).
- Server log prefixes in `error_log()` calls ("BrainRush API:", "BrainRush MCP error:") in daily, db, integration-quiz, mcp, question-stats, questions, reports. Not player-visible; kept so old and new log lines grep the same, and to keep untouched PHP files out of the deploy.

Lower-case identifiers also kept: `brainrush.*` localStorage keys, `brainrush-offline-*` cache names, DB `brainrush`, domain and canonical URLs, Android package and keystore, MCP tool names, URI and server name.

## Verified
- `php -l api/mcp.php` and `api/db.php`: "No syntax errors detected" (both).
- `node --check` on every js file and `sw.js`: OK. The three manifests parse as JSON.
- curl on http://localhost:8001: all 9 pages, manifest, llms.txt, sw.js, `mcp/trivia-card.html`, `img/logo.svg` and the 8 `mokh-*` PNGs return 200.
- MCP: `tools/list` returns `show_brainrush_trivia | Play Mokh Rush trivia` and `brainrush_trivia_questions | Mokh Rush trivia questions`; `initialize` returns server `brainrush-trivia`, title "Mokh Rush Trivia", icons `mokh-icon-512.png`, `mokh-icon-192.png`, `logo.svg`.
- Playwright (Chrome, fresh profile): every page's title, h1, footer, icon links and og:image use Mokh Rush and the new files; the header logo loads. Game page: "عربي" gives title and h1 "مخ رش" with `dir=rtl` (also after reload); "EN" restores "Mokh Rush" and the full English title and removes `brainrush.lang`. Share strings: "X won Mokh Rush with 100!", "It's a tie between A and B in Mokh Rush with 100 each!", "Mokh Rush Daily #12: 2/3", AR "فاز X في مخ رش بنتيجة 100!", "تحدي مخ رش اليومي #12: 2/3". Screenshots of the EN and AR header and of `offline.html` were looked at.
- Each exported PNG was opened and inspected (one text-wrapping problem in the wordmark was fixed).
- The only console error is a 404 for `/favicon.ico` on `offline.html`. It happens because `php -S` ignores the `.htaccess` rewrite, and it is the same on `main`.

## Not verified
- A full board game and a Daily played to the Results/Share screen in the UI (the strings were checked through `t()` only). Saved state surviving the branch switch: the keys are unchanged, but the owner's real state was not tested (FU-68).
- Admin login realm prompt (Basic auth is not used locally when the admin keys are empty).
- The maskable icon on a real Android launcher, the Android build (FU-71), link-preview rendering of the og image, and the hosted site (FU-69).
- Doctrine gates and the design-critic review of the final mark were not run in this step.
- `sed` turned the edited files' working-copy line endings from CRLF to LF. `core.autocrlf=true` normalises them, so `git diff` shows only the real line changes.

## Fix pass: logo revision A2 and Arabic footer (2026-11-11)
The design critic rejected the first Concept A drawing (accidental face, smeared favicon, box-in-box header). The owner approved revision A2 (`docs/design/logo-concepts/concept-a2*.svg`, `revision-a2.html`). The render script is in `%TEMP%/mokh-a2/export-a2.js`.

### Changes
- `img/logo.svg` = `concept-a2.svg` (app icon tile, comment "Mokh Rush icon"). New `img/mokh-mark.svg` = `concept-a2-mark.svg` (frameless header mark, viewBox 366.5 x 244, about 1.5:1). New `img/mokh-favicon.svg` = `concept-a2-favicon.svg` (32-unit small-size drawing).
- Re-exported, same names: `mokh-favicon-32.png` from the favicon SVG; `mokh-apple-touch-icon.png` (180), `mokh-icon-192.png`, `mokh-icon-512.png`, `mokh-logo-512.png` from `concept-a2.svg`; `mokh-icon-maskable-512.png` from `concept-a2-maskable.svg`. `mokh-logo-wordmark.png` (1060x260, transparent): frameless mark plus gold "Mokh Rush", no pill. `mokh-og-image.png` (1200x630): the A2 og mockup from `revision-a2.html`, rendered with the shipped mark file (no edge frame, frameless mark, gold "Mokh Rush", "Team trivia, buzzer speed").
- Header on index, how-to-play, about, contact, privacy, terms, admin and integration-quiz: `<img class="brand-logo" src="img/mokh-mark.svg" width="54" height="36">`. In `css/style.*.css`, `.brand-logo` is now `width: auto; height: 2.2rem` (height-driven); the RTL margin rule is unchanged.
- Every page with a header: the SVG favicon link is now `img/mokh-favicon.svg` (it was `img/logo.svg`), next to the 32 px PNG link. `.htaccess` already rewrites `/favicon.ico` to `img/mokh-favicon-32.png`, so it is unchanged.
- `offline.html`: the inline art is the A2 mark (viewBox of `mokh-mark.svg`, `.logo` 6.75rem x 4.5rem). `sw.js` stays at `brainrush-offline-v2`, which is not live yet.
- `mcp/trivia-card.html` has no logo (its brand is text only), so it is unchanged.
- `index.html` footer: `&copy; 2026 <span data-i18n="app.name">Mokh Rush</span> &middot; Ahmed Fahim`, so Arabic shows "مخ رش". The og:image alt text now mentions the new tagline.
- The mark points right, against the Arabic reading direction, and is deliberately not mirrored in RTL (D-64 c).
- Backlog: D-64 now covers A2, the header mark, the favicon and the no-mirror note. The FU-69 upload list adds `img/mokh-mark.svg` and `img/mokh-favicon.svg`, and FU-68 step 2 adds the footer.

### Verified
- I opened all 8 PNGs. Sizes: 32, 180, 192, 512, 512, 512, 1060x260, 1200x630. I also checked the favicon at 8x zoom and at real 32/16 px.
- Playwright at 1366x768 and 375x812 on the game page, guide, About, Contact, Privacy, Terms and Integration Quiz:
  - The header mark renders at 56.2 x 37.4 px (ratio 1.502, the same as the viewBox), loads, and nothing overflows.
  - The SVG favicon link is `img/mokh-favicon.svg`.
- On the game page, Arabic shows title, h1 and footer "مخ رش" (footer "© 2026 مخ رش · Ahmed Fahim"), with no overflow at either width; EN brings back "Mokh Rush". I looked at screenshots of the EN/AR header at both widths, the AR footer and `offline.html`.
- Admin was checked with curl: it uses `mokh-mark.svg` (54x36) and `mokh-favicon.svg`.
- curl: `logo.svg`, `mokh-mark.svg`, `mokh-favicon.svg` (`image/svg+xml`) and all 8 `mokh-*.png` return 200.
- `node --check` passes on `js/game.*.js` and `js/i18n.*.js`. I did not change any JS in this pass.
- The only console error is again the `/favicon.ico` 404 from `php -S` on `offline.html` (`.htaccess` is not applied locally).

## Critic final verdict and apple-touch fix (2026-11-11)
- Design-critic on A2: ACCEPT WITH FIXES. The earlier face, smear, box-in-box, og frame, streak and wordmark findings are fixed; the favicon outline is partly fixed.
- New Major: `img/mokh-apple-touch-icon.png` had 1456 non-opaque corner pixels, so iOS would draw black corners. It is now re-exported from `docs/design/logo-concepts/concept-a2-maskable.svg` at 180x180 with system Chrome (Playwright `channel: 'chrome'`), full bleed: 0 non-opaque pixels, checked visually.
- Minor items left for the owner are listed in FU-74.

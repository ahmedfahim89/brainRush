# CR "Mokh Rush rename" (D-64) - test report

Tester: game-tester. Date: 2026-11-11. Branch `rename-mokh-rush` (uncommitted), served at http://localhost:8001 (PHP dev server, local DB). Browser: the Browser pane (Chromium, 1024x768 viewport; 1366x768 and 375x812 checked with same-origin iframes). PHP 8 at `C:/xampp/php/php.exe` (not on the bash PATH).

## Summary
11 criteria: 10 PASS, 1 PASS with notes (9), 0 FAIL, 0 PENDING for this environment. Items that cannot be tested here (real Android launcher, Android build, hosted site, link previews, admin Basic-auth realm) are listed at the end.
No code was changed. `api/config.php` was not opened and is git-ignored (`git check-ignore` confirms).

## Results

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | "Mokh Rush" on every page; no visible "BrainRush" | PASS | Tab titles (live): index "Mokh Rush – Free Online Trivia Quiz Game...", how-to-play "How to Play Mokh Rush...", about "About Mokh Rush...", contact, privacy "Privacy Policy – Mokh Rush", terms, admin "Mokh Rush - Admin", integration-quiz "Mokh Rush Integration Quiz", offline "You're offline – Mokh Rush". h1 brand "Mokh Rush" on all (offline shows brand in body text and title). Footer "© 2026 Mokh Rush · Ahmed Fahim". og:title, og:site_name, twitter, JSON-LD `name` = Mokh Rush on index, how-to-play, about (the other six pages never had og/twitter/JSON-LD tags; same on `main`). I fetched each page and stripped script/style: 0 body-text matches of "brain rush/brainrush", and the only attribute matches are the canonical/og:image URLs (domain kept by decision). All shipped JS has "BrainRush" only as globals. |
| 2 | Icons, og:image, manifests, mcp icons point to `mokh-*` and return 200; header logo renders | PASS | `<link rel=icon>` (svg + `mokh-favicon-32.png`), apple-touch `mokh-apple-touch-icon.png`, og:image `mokh-og-image.png`, JSON-LD image `mokh-logo-512.png` on all 8 pages. `manifest.webmanifest`, `android/twa-manifest.json`, raw `web_app_manifest.json`, `api/mcp.php` initialize icons (mokh-icon-512/192 + logo.svg), `.htaccess` rewrites all use the new names. curl: all 22 URLs checked (9 pages, manifest, llms.txt, sw.js, trivia-card, logo.svg, 8 PNGs) = 200. Screenshots: header shows the new gold brain mark on index (EN + AR) and offline. |
| 3 | Arabic UI brand, title, RTL, reload, back to EN | PASS | Click العربية: title "مخ رش", h1 "مخ رش", `dir=rtl lang=ar`, `brainrush.lang` set. After reload: same. Click EN: title back to full English title, h1 "Mokh Rush", `brainrush.lang` removed, `dir=ltr`. Screenshot of AR header: brand right, logo right of it, RTL correct. Static pages stay "Mokh Rush" (as planned). |
| 4 | Real board game to Results, Share EN + AR, Daily share EN + AR | PASS | Played UI flows (start game, open cell, show answer, mark correct, back to board, End Game, Golden Goal offer, skip). Clipboard intercepted. **Tie EN:** "It's a tie between Team A and Team B in Mokh Rush with 100 each!" + site link. **Tie AR:** "تعادل في مخ رش بين ⁨Team A⁩ و⁨Team B⁩ بنتيجة ⁦100⁩ لكلٍّ منهم!" (bidi isolates intact; screenshot of Results in RTL fine). **Win EN:** "Team A won Mokh Rush with 200! Team B 0." **Win AR:** "فاز ⁨Team A⁩ في مخ رش بنتيجة ⁦200⁩! ⁨Team B⁩ ⁦0⁩." **Daily EN:** "Mokh Rush Daily #10: 1/3" + squares. **Daily AR:** "تحدي مخ رش اليومي #10: 1/3" + squares; on-screen Daily heading also Arabic. Tab title stayed "مخ رش" in AR throughout. Note: desktop Share copies to clipboard; the real clipboard was blocked by the pane ("Could not copy" shown once), so I stubbed `navigator.clipboard.writeText` to capture the text. |
| 5 | Saved state survives; identifiers unchanged | PASS | Diff review: no change to `brainrush.*` keys (`brainrush.game`, `.streak`, `.daily`, `.lang`, `.seenQuestions` all present at runtime), `STORAGE_KEY`, JS globals, `CACHE_PREFIX = 'brainrush-offline-'`, MCP tool names / `ui://brainrush/...` / server name `brainrush-trivia`, domain/canonical URLs, Android `packageId`/`applicationId` `ninja.integration.brainrush`, host, keystore path. Only sw.js `CACHE` bumped to `brainrush-offline-v2` (intended). Runtime on 8001: game written, reload returned straight to the board; a streak started in AR was restored after reload on the question screen with name/queue intact; the Daily result persisted. Real owner state on the live origin is untested (FU-68). |
| 6 | MCP | PASS | `initialize`: server name `brainrush-trivia`, title "Mokh Rush Trivia", description and instructions say Mokh Rush. `tools/list`: `show_brainrush_trivia` title/annotation "Play Mokh Rush trivia", `brainrush_trivia_questions` "Mokh Rush trivia questions", resourceUri `ui://brainrush/trivia-card` unchanged. `resources/read` of the card: "Mokh Rush trivia", `.brand` Mokh Rush, no "BrainRush". Opening `mcp/trivia-card.html` directly logs a `{{SITE}}` module-specifier error: expected (placeholder is replaced by mcp.php) and unrelated to this CR. |
| 7 | Manifests, TWA | PASS | `manifest.webmanifest` name/short_name "Mokh Rush". `twa-manifest.json` name/launcherName "Mokh Rush", `build.gradle` name/launcherName "Mokh Rush", `applicationId 'ninja.integration.brainrush'` unchanged, raw web_app_manifest.json updated. |
| 8 | PNG review | PASS | Dimensions (`file`): favicon-32 32x32, apple-touch 180x180, icon-192 192x192, icon-512 512x512, maskable-512 512x512 (RGB, full bleed), logo-512 512x512, wordmark 1060x260, og-image 1200x630. All opened and viewed: gold brain with three speed streaks on navy, clean edges; the 32 px favicon reads as a gold blob with streaks (acceptable); maskable mark spans roughly x 66-410 of 512, farthest corner about 190 px from the centre, so inside the 205 px (80%) safe circle; wordmark "Mokh Rush" in gold with icon, no clipping; og-image has gold frame, icon, "Mokh Rush", tagline, no text overflow. |
| 9 | php -l; console errors | PASS (notes) | `php -l api/mcp.php` and `api/db.php`: No syntax errors. Console on all pages: no JS errors from this CR. Known `/favicon.ico` 404 on offline.html: offline.html has no `<link rel=icon>` on `main` either (checked `git show HEAD:offline.html`), so it is pre-existing. See BUG-CR-01 for two transient 500s. |
| 10 | Regression and layouts | PASS | Normal board game, Golden Goal offer, Streak (EN/AR), Daily (EN/AR) all ran with no errors. Layout via iframes: 1366 and 375 in EN and AR, no horizontal overflow (scrollWidth = clientWidth), 0 header elements outside the viewport; header height 78 px (1366) / 101 px (375) unchanged. Screenshots at 375 EN and AR show logo + name + language switch fitting. |
| 11 | grep "BrainRush" in shipped files | PASS | Remaining: JS globals `BrainRushI18n/Share/Speech` (game, i18n, share, speech), `error_log` prefixes in api/daily, db, integration-quiz, mcp, question-stats, questions, reports, header comments in `api/config.example.php` (and config.php, not opened). Also `.githooks/hash-assets.sh`, `.claude/agents/*` and `sql/*` comments (not shipped to players; the SQL and agent headers are history by plan). No visible text, no title, no manifest. README.md was excluded from the grep on purpose (docs). |

## Bugs

### BUG-CR-01 (Minor, not reproducible) - two 500s on first page load
- Steps: first navigation to http://localhost:8001/ in a fresh browser tab.
- Actual: `api/settings.php` and `api/categories.php?playable=1` returned 500 once (the two console errors); every later request returned 200, and 30 curl calls to the same endpoints (15 rounds) were all 200.
- Expected: 200.
- Likely cause: DB cold start or a connection race on the dev machine at the start of the session; the diff touches only `api/db.php` comment and `ADMIN_REALM`, `api/mcp.php` text, so it is unlikely to be related. Not investigated further (no code or log access besides curl). Recommend the owner glance at the PHP error log if it recurs.

No other bugs found.

## Observations (not defects)
- In the Arabic UI the footer still reads "© 2026 Mokh Rush · Ahmed Fahim" in Latin (it is static, as planned: only the h1 and title use `app.name`). The brand therefore shows both "مخ رش" (header) and "Mokh Rush" (footer) on the AR screen. Confirm that is what the owner wants; if not, the footer needs an `app.name` binding.
- Old PNGs (`icon-*.png`, `og-image.png` etc.) stay in `img/` unreferenced, as the dev notes say.
- Line endings: LF in the working copy; git normalises (warnings only).

## PENDING / not testable here
- Admin Basic-auth realm prompt ("Mokh Rush admin"): no admin credentials are set locally, so the prompt never appears (code review only: `api/db.php` `ADMIN_REALM`).
- Maskable icon on a real launcher, Android build / `bubblewrap update` (FU-71), social link-preview rendering of the og image, hosted site and CDN cache (FU-69/FU-70), owner's real saved state on the live origin (FU-68).
- Doctrine gates and design-critic review of the mark (not part of this test).

## Verdict
READY FOR PO

## Re-test (fix pass: logo A2, header mark, SVG favicon, Arabic footer)
Same environment (http://localhost:8001, Browser pane). No code changed, no git writes.

| # | Check | Result | Evidence |
|---|---|---|---|
| R1 | Header mark on every branded page | PASS | All 8 pages (index, how-to-play, about, contact, privacy, terms, admin, integration-quiz) loaded in a real browser at 1366x768 and 375x812: `img.brand-logo` (`img/mokh-mark.svg`) is 56.2 x 37.4 px everywhere (ratio 1.50, not squashed), image loaded, no horizontal overflow (scrollWidth <= clientWidth). Screenshots looked at: index EN and AR at 375, admin at 375: mark sits beside the name, RTL margin flips correctly; the mark is not mirrored in RTL (as documented in D-64 c). |
| R2 | Favicon | PASS | Every page has `rel=icon img/mokh-favicon.svg` plus `img/mokh-favicon-32.png`; both URLs, `mokh-mark.svg` and `logo.svg` return 200. Looked at 32 px PNG, SVG at 16/32/128 px: reads as a gold brain with speed bars on navy, no longer smeared; at 16 px it is a small blob but still recognisable. The SVG favicon is frameless (no tile). |
| R3 | Arabic footer, title, h1; reload; bidi | PASS | AR: title "مخ رش", h1 "مخ رش", footer "© 2026 مخ رش · Ahmed Fahim" (`<span data-i18n="app.name">`), `dir=rtl`; still correct after reload. EN restores the full English title, h1 "Mokh Rush", footer "© 2026 Mokh Rush · Ahmed Fahim". Footer screenshot in RTL: reads right to left as "© 2026 مخ رش · Ahmed Fahim", correct order. |
| R4 | Re-exported PNGs | PASS | Sizes: 32, 180, 192, 512, 512 (maskable), 512, 1060x260, 1200x630. All opened: brain in profile with a face-left silhouette and three speed bars, no accidental face; icons on the gold-framed navy tile; wordmark is frameless on transparent (corner alpha 0). Maskable measured on a canvas: farthest gold pixel is 196.2 px from the centre, limit (80% circle) 204.8 px, so inside (tight, 8.6 px margin). og-image 1200x630, edge pixels are navy gradient (no gold frame), tagline "Team trivia, buzzer speed". |
| R5 | offline.html | PASS | Screenshot at 375 wide: A2 mark about 108x72 px (6.75rem x 4.5rem), correct aspect, not stretched, title "You're offline" below. |
| R6 | Regression smoke | PASS | EN board game with Team A/B to Results: share text "Team A won Mokh Rush with 300! Team B 0." + link. Daily share in AR: "تحدي مخ رش اليومي #10: 1/3" + squares. Streak setup opens (name field and Start button visible). `.brand-logo` is used only in the header `<h1>` of the 8 pages and the CSS rules (style.css lines 66, 1575); the other uses are in `docs/design` mock pages; no other images affected. Console: no new errors (only the earlier one-off 500s, the `{{SITE}}` card note, and a canvas warning caused by my own measurement script). |
| R7 | BUG-CR-01 cold start | NOT REPRODUCED | I cannot restart the DB or PHP server. After idle gaps (3 requests, 20 s apart) `api/settings.php` returned 200 each time in about 0.02 s; fresh page loads in this pass showed no 500. Treated as a one-off, Minor, left open for the owner to watch. |

New bugs: none.

Note: the maskable margin (about 4% of the radius) is small but within the safe zone; no action needed.

### Re-test verdict
READY FOR PO

## PO acceptance (2026-11-11)
**ACCEPTED** (D-64).
- The test and the re-test pass. The English name is "Mokh Rush" everywhere. In Arabic, the game page shows "مخ رش" in the h1, tab title, footer and share/Daily lines, and the static pages stay English. The logo is A2. The kept identifiers are unchanged, and the shipped files contain "BrainRush" only in JS globals, `error_log` prefixes and config comments.
- The D-59 d exception (Arabic `<title>` on the game page) is recorded in D-64 b, and D-59 now carries an amendment note.
- `error_log` prefixes staying "BrainRush" are agreed. BUG-CR-01 is closed as not reproduced.
- Deferred: FU-73 (mod titles, separate repository) and FU-74 (quoted doctrine-gate output and critic verdict on A2). Owner steps: FU-68 (local check and commit), FU-69 (one deploy including FU-67's set), FU-70 (AdSense logo), FU-71 (bubblewrap/APK and launcher check), FU-72 (native review of "مخ رش").

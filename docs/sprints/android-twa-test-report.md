# Android app, web side (US-40, D-43): test report

Tester: mobile-tester (Senior Mobile Tester). Date: 2026-10-26. Branch `android-twa`, uncommitted working tree (base `main` 7960c40).
Inputs: `docs/product-backlog.md` (US-40, D-43), the plan `check-with-the-mobile-developer-lucky-eich.md` (step 1), the `git diff` and the new untracked files (`manifest.webmanifest`, `sw.js`, `offline.html`, `.well-known/assetlinks.json`, `img/icon-*.png`).

## Summary

**Recommendation: CONDITIONAL GO for the web side (step 1) to be merged and deployed. NO-GO for starting the Play release until the conditions below are met.** No Critical or Major defect is open that is reproduced on a real run. One Major defect is provisional (BUG-02, reproduced in a Chrome tab, not yet checked in a real TWA).

Conditions
1. Decide BUG-02 (links with `target="_blank"` in a TWA) by testing a signed build. If a Custom Tab or a new tab opens without the app flag, fix before the first Play upload (the "Contains ads: No" declaration depends on it).
2. Decide BUG-01 (a few controls 0.5 to 1.2px under 48px): fix, or change the criterion.
3. After the commit, check that `index.html`, `how-to-play.html`, `terms.html`, `privacy.html` and `admin.html` reference the NEW hashed `game.*.js` / `style.*.css` names (see Risks, hash hook). Not checkable before the commit.
4. Before the app is tested: real SHA-256 in `assetlinks.json` and the `.htaccess`, CDN and 403 checks on the hosted site (not testable here).

Environments
- Windows 11, PHP 8.0 built-in server. Dev server `http://localhost:8005` (worktree, bound to `::1` only, so the emulator cannot reach it). For the emulator I started a second `php -S 127.0.0.1:8008` on the same worktree (read-only use) and stopped it afterwards. For the "before" baseline I served `git archive HEAD` from a temp folder on port 8006 (API calls forwarded to 8005), also stopped and deleted.
- Desktop and phone-size checks: headless Chrome driven over CDP by Node scripts (`%TEMP%\brainrush-twa-test\`). 1366x768 and 375x812 (mobile emulation) and 411x810.
- Real Android: emulator `Medium_Phone_API_37.0` (Android 37, 1080x2400, 420 dpi, user build), Chrome 145.0.7632.218, page `http://10.0.2.2:8008/?source=twa`. The real Android Back key was sent with `adb shell input keyevent 4`. Taps were CDP touch events (real input events with user activation); one run was repeated with a real `adb shell input tap`. Page state was read over CDP (`adb forward` to `chrome_devtools_remote`). Native `confirm()` dialogs were answered over CDP, so "cancel" and "OK" were both exercised.
- Data: player names "TEST-QA", "TEST-QA1..6". Streak saves: **none reached the database**. In the emulator `POST api/streaks.php` was intercepted and answered by the test harness; the headless runs never finished a streak with a score. `GET` leaderboard rows are untouched (checked: only the 2 pre-existing rows).
- Clean-up done: `logs/game-2026-10-26.log` (created by my runs) deleted; my lines (all "TEST-QA...") removed from `logs/game-2026-10-25.log`, which keeps its one older entry. `logs/` is git-ignored. Emulator shut down (`adb emu kill`), `font_scale` back to 1.0, adb port forward removed, my PHP servers 8006/8008 stopped (8005 left running). No repository file was changed, staged or committed (`git status` identical to the start).

What this does and does not prove: a Chrome tab on the emulator is not a TWA. It proves the web code (history, popstate, Back, app flag, offline page, layout) on real Chrome for Android 37. It does not prove: the full-screen TWA shell, Digital Asset Links verification, how a TWA treats `target="_blank"` links and the Custom Tab fallback, the `android-app://` referrer, or the Play build.

Counts: **PASS 52 | FAIL 1 (BUG-01, minor) | OBSERVATION 6 | NOT RUN / BLOCKED 9** (see section 9).

## 1. Website mode (`http://localhost:8005/`): unchanged

| # | Check | Result | Evidence |
|---|---|---|---|
| 1.1 | Admin link present in header | PASS | nav text "How to play · Terms · Privacy · Admin"; `sessionStorage brainrush.app` is null |
| 1.2 | Leaderboard ad logic as before (ads forced on by intercepting `settings.php`) | PASS | Identical to baseline: AdSense script requested once, `adsbygoogle` defined, `<ins>` created, same slot state. Baseline (8006) gives the same result |
| 1.3 | No history entries pushed | PASS | Full flow setup, board, question, back to board, End Game (confirm), results, new game: `history.length` stays 2 (about:blank + page), `history.state` null at every step. On the emulator (no `?source`): Streak setup opens, `history.length` stays 1 |
| 1.4 | Layout 1366x768 unchanged (D-30) | PASS | Setup, board and question screens: all measured rectangles identical to baseline (page height 1181, board `[26,154,1315,464]`, score cards, back button, helper chip 31x26, timer). Filled setup and board screenshots are byte-identical to baseline. Initial setup screenshot differs by hash only (caret blink); the two images look identical |
| 1.5 | Setup `?source=TWA`, `?source=twa2` stay in website mode | PASS | flag null, Admin link present |

## 2. App mode (`?source=twa`)

| # | Check | Result | Evidence |
|---|---|---|---|
| 2.1 | Admin link and its separator hidden | PASS | nav innerHTML has only the three links with `&middot;` between them; no `a[href="admin.html"]` anywhere in the header. Also on the emulator |
| 2.2 | No AdSense script ever loaded on the leaderboard | PASS | with ads forced on: 0 requests to `googlesyndication`, no `<script src*=adsbygoogle>`, `window.adsbygoogle` undefined, no `<ins>`; same after the guide round trip. `settings.php` is still fetched once (harmless) |
| 2.3 | `brainrush.app` persists across in-app navigation to how-to-play, terms, privacy and back | PASS | flag "1" on each guide page, "Back to the game" lands on `/index.html` (no query) with Admin still hidden and flag "1". Guide pages have no Admin link |
| 2.4 | Detection variants | PASS | `?source=twa` and `?x=1&source=twa` on; `?source=TWA`, `twa2` off |
| 2.5 | Referrer `android-app://ninja.integration.brainrush` | NOT RUN (runtime) | Chrome via CDP does not let me send an `android-app://` referrer (`document.referrer` stays empty). The regex was unit-checked: accepts the exact package with or without `/`; rejects `...brainrush.evil/`, `...brainrushx`, `com.evil`, an https URL that contains the string |
| 2.6 | Spoofing | OBSERVATION | Anyone can add `?source=twa` on the website to hide ads and Admin. Revenue effect only, no security impact (admin is protected by the server) |

## 3. PWA basics

| # | Check | Result | Evidence |
|---|---|---|---|
| 3.1 | Manifest valid | PASS | Chrome `Page.getAppManifest` errors `[]`. `name` and `short_name` "BrainRush", `id` `./`, `start_url` `./?source=twa`, `scope` `./`, `display` standalone, theme and background `#0b1026` (matches the CSS), icons relative |
| 3.2 | Icons reachable, real sizes | PASS | 192x192, 512x512 (purpose any), 512x512 maskable; all HTTP 200 `image/png`; sizes match the declared ones (PNG header) |
| 3.3 | Maskable safe zone | PASS | maskable icon fully opaque; gold artwork bounding box x 151-360, y 91-420 of 512, 0 gold pixels outside the central 80% circle. The "any" icons keep the rounded gold frame with transparent corners |
| 3.4 | Installable | PASS | `Page.getInstallabilityErrors` returns `[]` |
| 3.5 | Manifest link and theme-color on all 4 pages | PASS | index has the link (its theme-color already existed), guide, terms, privacy have both |
| 3.6 | Service worker registers, scope `/`, activated, controls page after reload | PASS | |
| 3.7 | Caches only `offline.html` | PASS | `caches.keys()` = `brainrush-offline-v1` holding exactly `/offline.html`, also after playing a game with API traffic. `caches.match('api/settings.php')` empty |
| 3.8 | Offline navigation shows `offline.html` | PASS | True offline (my own test server stopped, so the service worker's fetch really fails): `/`, `/index.html`, `/how-to-play.html`, `/privacy.html`, `/?source=twa`, an unknown URL all show "You're offline", URL unchanged. (`Network.emulateNetworkConditions` offline does not reach the service worker, so it was not used.) |
| 3.9 | `api/` never answered from cache | PASS | offline: navigating to `api/settings.php` shows the browser error page, not offline.html; `fetch('api/settings.php')` rejects, also with `cache:'force-cache'` |
| 3.10 | `offline.html` has noindex, Try again, no external assets | PASS | `<meta name="robots" content="noindex">`, button 154x55 px, inline CSS and logo only, not in `sitemap.xml` |
| 3.11 | Try again | PASS | offline: click keeps the offline page; server back: click returns the real page (original URL reloaded) |
| 3.12 | HTTP types and headers on the dev server | PASS (limited) | manifest `application/manifest+json`, assetlinks `application/json`, sw.js 200. `php -S` ignores `.htaccess`, so the `no-cache` header and 403 rules are static-review only (section 7) |

## 4. Touch targets at 375x812 (new vs baseline `main`)

Method: every visible `button, a, input, label.cat-label` and mode toggle on each screen measured with `getBoundingClientRect` (baseline: 26 of 28 targets under 48 on the empty setup, 41 of 43 on a full setup, 53 of 53 on the board, 38 of 39 on the question).

| # | Screen | Result | Evidence |
|---|---|---|---|
| 4.1 | Setup (empty, 6 players + 6 categories) | PASS (with BUG-01 notes) | all fields, buttons, swatches (48x48), Remove, category tiles, mode toggle, timer field, Add player, Start, Forget played: >= 48. Exceptions: header link "Terms" 45.5x47.5; inline text link "How to play" in the intro 85.8x21 |
| 4.2 | Streak setup and Streak leaderboard | PASS (same exceptions) | all buttons and fields >= 48 |
| 4.3 | Board (6 players, 6x6) | PASS (BUG-01) | End Game 48 high, score +/- buttons 48x48. Board cells 54x46.8 (unchanged on purpose, per the plan) |
| 4.4 | Question (board game, 6 players) | PASS | helper chips 48x48 circles, Correct/Wrong, Pause/Reset, Show Answer, Back to Board all >= 48 |
| 4.5 | Streak question | FAIL (BUG-01) | the three answer buttons are 316.9x46.8 |
| 4.6 | Results, leaderboard after run | PASS | |
| 4.7 | Board still fits vs before | PASS | page height with 6 players and 36 cells: **946 px now vs 959 px before** (both scroll; 13 px less). Board bottom 611 vs 610, cells identical 54x47, score cards 97 vs 102 px tall |
| 4.8 | Question screen with 6 players | OBSERVATION | page height 1649 px vs 1489 px before (+160 px): the scoring list grew from 581 to 790 px because of the 48px chips and buttons. Expected consequence, but Correct/Wrong of the last player is now about two screens down |

## 5. Real Android Back (emulator, Chrome tab, app mode)

"Exit" = Chrome went to the launcher (`topResumedActivity` = Nexus launcher, page target gone).

| # | Screen / action | Result | Evidence |
|---|---|---|---|
| 5.1 | Setup root, no tap yet | PASS | Back exits (launcher). `history.length` 1 |
| 5.2 | Setup root after a tap | PASS | exits; still no entry pushed (hist 1, state null) |
| 5.3 | Streak setup | PASS | first tap pushes one entry (hist 2, `history.state.brainrushBack`). Back closes the Streak setup to normal setup. Back again exits. Note: the name field is auto-focused, so with the soft keyboard open the **first Back only hides the keyboard** (normal Android; two presses needed) |
| 5.4 | Leaderboard opened from the Streak setup | PASS | Back goes to the Streak setup, Back to setup root, Back exits |
| 5.5 | Board: End Game confirm cancelled, twice | PASS | confirm text "End the game now? 18 questions have not been played..." each time, screen stays `board`, entry restored (hist 2, state set) so Back keeps working |
| 5.6 | Board: confirm accepted, then Results, then new setup | PASS | board to results; Back on results to a new setup root (history entry removed); Back exits |
| 5.7 | Question (board game) | PASS (as specified) | Back returns to the board with **no confirm**; the cell is marked used. See OBS-1 / BUG-03 |
| 5.8 | Double-score popup | PASS | first Back closes only the popup (question stays, timer resumes, 119 s shown); second Back goes to the board |
| 5.9 | Streak question, count 0: End run confirm cancelled twice, then accepted | PASS | "End the run now? You have no streak yet..." ; accepted: leaderboard "No streak this time", nothing saved; Back to setup root; Back exits |
| 5.10 | Streak: one right answer, wrong answer, Back on the lost question (without "See results") | PASS | leaderboard "TEST-QA: 1 in a row!", exactly 1 save request (intercepted); Back to setup root; Back exits |
| 5.11 | Streak: Back during the question with streak 1 (confirm accepted) | PASS | "Your streak of 1 is saved..." leaderboard after run, 1 save request, then Back to root, exit |
| 5.12 | Leaderboard after a run whose save failed (500) | PASS | "Your streak could not be saved... Try again"; Back asks "Your streak of 1 was not saved. Leave it unsaved?"; cancelled twice stays and still works; accepted goes to setup root; Back exits |
| 5.13 | Refresh (`Page.reload`) on board, question, results, root, no tap after the reload | PASS | the pushed entry survives the reload: board Back shows the confirm; question Back goes to the board; results Back to new setup; root Back exits. A reload while on Streak setup resets to the root (the Streak setup is not saved), the stale entry removes itself, Back exits at once |
| 5.14 | After a real `adb input tap` (not CDP) | PASS | same result as 5.3 |
| 5.15 | Cold start (new tab at the start URL) with a saved game on the board, **no tap yet** | OBSERVATION (BUG-04) | Back exits the app instead of the End Game confirm (history is empty until the first tap; the game stays saved) |
| 5.16 | Same, after one tap on non-interactive text | PASS | entry pushed on the tap, Back shows the End Game confirm |
| 5.17 | Website mode on the device: no entry pushed | PASS | see 1.3 |
| 5.18 | Maintenance overlay, Back at "ended" Swap/Skip flows | NOT RUN | not part of this pass |

`target="_blank"` (known point b), Chrome tab, app mode: tapping "Terms" opens a **new tab** (`window.opener` false because of `rel="noopener"`). The new tab has `sessionStorage brainrush.app` = null and `document.referrer` = the http page, not the app. So the new tab is in website mode; the guide pages themselves show no Admin link or ads, but "Back to the game" / "Start playing" there loads the game in website mode (Admin link, and ads on the leaderboard when ads are on). How a TWA treats these links (stays in the TWA, or opens a Custom Tab) is not testable here. See BUG-02.

## 6. Arabic RTL and large font

| # | Check | Result | Evidence |
|---|---|---|---|
| 6.1 | Arabic question, 375 px (headless) and 411 px (emulator) | PASS | `dir="rtl"` `lang="ar"`, computed direction rtl, `text-align: start` (right edge), 27.2 px, no horizontal overflow; ABC choices rtl; "English" toggle present. Screenshot `fs2-question.png` |
| 6.2 | 200% text (root font 17 to 34 px; the site sizes everything in rem, only `html` uses px) | PASS with OBSERVATION | Arabic question wraps and stays right-aligned, board fits (layout 411 px). Setup screen is 565 px wide (Streak button, mode toggle, category tiles) and the question's **Reset** button ends at 448 px, so both scroll sideways. Identical on baseline `main` (measured), so not caused by this change |
| 6.3 | Android system font scale 2.0 | BLOCKED/NOT EFFECTIVE | with `font_scale 2.0` only the Android UI grew; Chrome 145 on this image rendered the page at the same size (root still 17 px), so the CSS injection above was used. Reset to 1.0 |

## 7. Static review (not executable under `php -S`)

| # | Item | Result | Notes |
|---|---|---|---|
| 7.1 | `.htaccess` block rule | PASS | `^(sql\|docs\|logs\|\.claude\|android)(/\|$)` [F,L]. The rule fires before the file exists, so `/android/` is 403 even before the project exists (the doc says "once the project exists"; harmless). **Not run:** `php -S` returns 200 for `/android/` (falls back to index) |
| 7.2 | `AddType application/manifest+json .webmanifest` and `application/json .json` | PASS | inside `<IfModule mod_mime.c>`; a global `.json` type is harmless here (only `assetlinks.json` and the manifest) |
| 7.3 | `sw.js` no-cache | PASS | `<FilesMatch "^sw\.js$">` with `Header set` inside `<IfModule mod_headers.c>`; `set` (not `append`) should override a server-wide 7-day js rule. Chrome also revalidates a service worker script itself (at most 24 h), so the risk is the Hostinger CDN edge copy: purge after deploy as documented |
| 7.4 | Nothing blocks `/.well-known/` | PASS | `\.git` rules match names starting `.git`, the FilesMatch list matches `.git*`/`.ht*` only; `.well-known` and `assetlinks.json` match none. HTTPS redirect only rewrites http to https (the Digital Asset Links checker needs no redirect on the https URL) |
| 7.5 | `.gitignore` | PASS | `git check-ignore`: `android/**/build/`, `*.keystore`, `*.jks`, `.gradle/`, `local.properties`, `*.apk`, `*.aab`, `*.idsig` ignored; `twa-manifest.json`, `android/README.md`, `gradlew`, `AndroidManifest.xml` not ignored; manifest, `sw.js`, `.well-known/assetlinks.json` not ignored |
| 7.6 | `assetlinks.json` | PASS (placeholder) | valid JSON, package `ninja.integration.brainrush`, `delegate_permission/common.handle_all_urls`, fingerprint is the placeholder `REPLACE_WITH_SHA256_FROM_BUBBLEWRAP`. A deploy with the placeholder is harmless but the app will show a URL bar until it is replaced |
| 7.7 | Docs vs code | PASS | README, `deploy-hostinger.md` section 11, section 4 table and checklist, US-40 and D-43 match the files and behaviour tested (relative `start_url`, `brainrush.app`, `CACHE` version note, CDN purge, `sw.js` at root). Privacy and Terms "Android app" sections exist, ToC links `#app` resolve, "last updated" and sitemap `lastmod` bumped to 26 Oct, `offline.html` not in sitemap |
| 7.8 | Other Admin links in app mode | OBSERVATION | `js/game.865c053e.js` creates two more links to `admin.html` in error states (`renderNotEnough` line ~1066: no playable category; `showLoadError` line ~1110: settings incomplete). They are not in the header, so the criterion is met, but an app user could see "Admin" in those rare states (suspected, not reproduced) |

## 8. Automation

Test scripts (outside the repo): `%TEMP%\brainrush-twa-test\` (`lib.mjs`, `game.mjs`, `emu.mjs`; `t_desktop`, `t_app`, `t_hist`, `t_touch`, `t_pwa`, `t_sw2`, `t_rtl`, `t_fs_cmp`, `e2`, `e5`, `e7`, `e8`, `e9`, `e11`, `e12`). Run with `node <script>.mjs` (Chrome headless or the emulator with `adb forward tcp:9222 localabstract:chrome_devtools_remote`). Evidence: PNGs in the same folder (`offline-page-real.png`, `emu-double.png`, `emu-streak-q.png`, `emu-blank-tab.png`, `fs200-question.png`, `touch-board-8005.png`, `touch-board-8006.png`, ...). These are throwaway harnesses, not suites for the repo. Reruns: the emulator runs were repeated at least twice in part (5.3 and 5.4 run 2 times), all stable; the early failures were harness problems (the on-screen keyboard shifting tap coordinates), not product defects.

## 9. Not covered / blocked

- NOT RUN: TWA shell (full screen, no URL bar, wrong-fingerprint behaviour, Custom Tab fallback, splash): needs the `android/` project and a signed build.
- NOT RUN: Digital Asset Links check, live `assetlinks.json` with the real fingerprint, CDN copy, `/android/` 403 and `sw.js` `no-cache` and manifest MIME on the hosted site (needs Hostinger).
- NOT RUN: `android-app://` referrer at runtime (2.5); TWA handling of `target="_blank"` (BUG-02).
- NOT RUN: Android 8 and tablet, rotation mid-question or mid-streak, process death, offline during a streak save (plan items for the TWA phase), maintenance mode and banner with Back, TalkBack.
- BLOCKED: Android system font scale 2.0 (Chrome ignored it); iOS (out of scope for this change; not applicable, TWA is Android only).
- The new hashes: `css/style.*.css` and `js/game.*.js` were edited in place under their old hashed names; the pre-commit hook has not run yet.

## 10. Defects

### BUG-01: Streak answer buttons, board cells and the "Terms" header link are 0.5 to 1.2 px under 48 px at 375 px width
- Environment: working tree `android-twa`, Chrome headless at 375x812 (mobile emulation); same values at 411 px on the emulator.
- Severity: Minor
- Priority rationale: US-40 says buttons are at least 48 px tall on phones up to 600 px; the shortfall is 1.2 px (2.5%), no real usability impact, easy fix. Streak answers are the main control of the Streak Challenge, so worth fixing for the release.
- Prerequisites / test data: none.
- Steps to reproduce:
  1. Open `/?source=twa` at 375x812, tap "Sudden Death Streak", enter "TEST-QA", Start.
  2. Measure the three answer buttons (`button.streak-choice`).
  3. Also measure the header link "Terms" and, on a 6x6 board, `button.board-cell`.
- Expected result: buttons at least 48 px tall (US-40, "buttons ... at least 48px tall"); round controls 48 px wide. (The plan says board cells keep their size; they are not listed in US-40.)
- Actual result: streak answers 316.9 x 46.8; board cells 54 x 46.8; "Terms" link 45.5 wide x 47.5 tall (padding is vertical only, so it is also narrower than 48); the inline link "How to play" in the setup intro is 21 px tall (inline text link, not listed in the criterion).
- Reproducibility: Always.
- Evidence: `%TEMP%\brainrush-twa-test\touch-new.txt`, `touch-board-8005.png`.
- Suspected area: `css/style.*.css` inside `@media (max-width:600px)`: `.streak-choice` and `.board-cell` have no `min-height` (46.75 px = 2.75rem at 17 px); `.page-header .nav-link { padding: 0.75rem 0 }` has no horizontal padding or min-width (suspected).

### BUG-02 (provisional Major): app mode can be lost when a header or guide link opens in a new tab
- Environment: Chrome 145 tab on emulator Medium_Phone_API_37.0 (Android 37), page `http://10.0.2.2:8008/?source=twa`. A real TWA was NOT tested.
- Severity: Major (provisional: depends on how a TWA treats `target="_blank"`; Minor if the TWA keeps these links in the app)
- Priority rationale: D-43 and the Play declaration "Contains ads: No" assume no ads in the app. If the guide opens in a Custom Tab or new tab without the flag, "Back to the game" there loads the game in website mode (Admin link, AdSense on the leaderboard when ads are on). Needs one tap on a header link, so it is easy to reach.
- Prerequisites / test data: ads enabled in Admin (or the test harness) to see an ad.
- Steps to reproduce:
  1. Open `/?source=twa`. Tap "Terms" (`target="_blank" rel="noopener"`).
  2. In the new tab read `sessionStorage.getItem('brainrush.app')` and `document.referrer`.
  3. Tap "Back to the game" in that tab; open the Streak leaderboard.
- Expected result: the app stays in app mode (US-40: "the tab remembers app mode ... while it navigates"; no ads).
- Actual result: new tab, `window.opener` false, flag `null`, referrer = the site page (not `android-app://`). Back in the game from there it is website mode.
- Reproducibility: Always (3/3 in a Chrome tab).
- Evidence: `emu-blank-tab.png`, run output of `e9.mjs`.
- Suspected area: `index.html:56` and the guide pages' header links (`target="_blank" rel="noopener"`), `js/game.*.js` `detectApp()` (the referrer fallback does not help, because only the first navigation carries the `android-app://` referrer).

### BUG-03: Android Back on a board question silently uses up the question (no confirm)
- Environment: emulator Chrome tab, app mode, as above.
- Severity: Minor (it is what US-40 specifies: "a question goes back to the board, as Back to Board does")
- Priority rationale: Back is a very common accidental gesture (edge swipe); the cell is lost for everyone in a party game and cannot be reopened. Product decision, not a code defect.
- Prerequisites / test data: 2 players "TEST-QA1/2", 3 categories, any timer.
- Steps to reproduce:
  1. Start a game, open any cell (question screen).
  2. Press Android Back.
- Expected result: per US-40, the board is shown (as Back to Board).
- Actual result: board is shown, the cell is marked used (used cells: 1 to 2 in my runs), no score awarded, no confirm. The streak question, in contrast, asks "End the run now?".
- Reproducibility: Always.
- Evidence: log of `e2.mjs` (S6), `emu-double.png`.
- Suspected area: `js/game.*.js` `goBack()`, branch `state.screen === 'question'` calling `backToBoard()`.

### BUG-04: After a cold start with a saved game, Back before the first tap leaves the app
- Environment: emulator Chrome tab, app mode.
- Severity: Minor
- Priority rationale: needs a relaunch with a saved game and an immediate Back; no data is lost (the game is restored on the next start); after one tap everything works. Cause is Chrome's rule that pages cannot add history without a user tap.
- Prerequisites / test data: a saved game on the board.
- Steps to reproduce:
  1. Start a game to the board, close the tab, open `/?source=twa` again (board restored).
  2. Without tapping, press Back.
- Expected result: the End Game confirm (US-40: "the board asks the End Game confirm").
- Actual result: the app exits. After a tap on any text, Back shows the confirm.
- Reproducibility: Always (2 of 2; the tap variant 1 of 1).
- Evidence: `e8.mjs` output.
- Suspected area: `js/game.*.js` `syncBack()` (`navigator.userActivation.hasBeenActive` guard, "entry is added only once the page has had a tap").

## 11. Observations (no defect)

- OBS-1: see BUG-03.
- OBS-2: Streak setup: with the soft keyboard open the first Back only closes the keyboard.
- OBS-3: question screen with 6 players is 160 px taller (4.8).
- OBS-4: 200% text makes the setup and the Reset button scroll sideways; pre-existing.
- OBS-5: other Admin links in rare error states (7.8); `?source=twa` can be added by anyone (2.6).
- OBS-6: the plan says `start_url` `/?source=twa`, the manifest and US-40 use `./?source=twa`; consistent with the criterion, and fine for a root deploy.

## 12. Risks

- Hash hook: `style.50db26ae.css` and `game.865c053e.js` were changed in place. If the commit skips the pre-commit hook, the live site would serve changed files under old names, hidden for up to 7 days by browser and CDN caches (the problem D-43 and the caching memory describe). Check the HTML references after the commit.
- `assetlinks.json` holds a placeholder until the key exists; the wrong fingerprint shows a URL bar. The CDN must be purged after every change to it.
- The Back handling relies on browser behaviour (popstate, `history.forward()`, user-activation rule). It is correct on Chrome 145 / Android 37 here; other Chrome versions and Android 8 were not tested. The real TWA could behave differently (BUG-02, history in a TWA).
- A service worker only helps for page loads; a connection lost in the middle of a game (API failure) is not covered by the offline page.

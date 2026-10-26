# Android app (TWA) on device: test report (US-40, D-43)

Tester: mobile-tester (Senior Mobile Tester). Date: 2026-10-26. Branch `android-wrapper` (uncommitted), first test of the real signed APK. Follows `docs/sprints/android-twa-test-report.md` (web side, Chrome tab).

## Summary

**TWA verification result: VERIFIED.** The app opens the site full screen with no URL bar and no Custom Tab toolbar; Android reports the domain as verified; the page sees `display-mode: standalone` and `document.referrer = android-app://ninja.integration.brainrush/`; the live `assetlinks.json` holds the same SHA-256 as the installed APK's signature.

Results: **PASS 41 | FAIL 3 (all Minor) | BLOCKED 2 | NOT RUN 7** (list in "Not covered").

**Recommendation: CONDITIONAL GO for an internal Play test track.** No Critical or Major defect. Conditions:
1. Play App Signing key: once Play Console shows its SHA-256, add it to `/.well-known/assetlinks.json`, purge the Hostinger CDN, and re-run section 2 on a build installed from the Play track. A Play-signed build will show a URL bar until this is done (the upload key only verifies sideloaded or upload-signed builds).
2. Owner decision on the "Running in Chrome" snackbar (OBS-1), which Chrome shows on every cold start until the user taps "Got it".
3. Decide BUG-01, BUG-02, BUG-03 (all Minor): fix or accept. **Owner decision 2026-10-26:** BUG-01 fixed (Arabic text marked `translate="no"`, re-test on the device pending); BUG-02, BUG-03 and OBS-1 accepted for now.

### Environment
- Emulator `Medium_Phone_API_37.0`: `google/sdk_gphone64_x86_64/emu64xa:17/CE2A.260420.051.A2` user build, API 37, 1080x2400, 420 dpi, Google Play image. Chrome **145.0.7632.218** (Trichrome 763221838). Chrome had no first-run screens (already set up).
- APK `android/app-release-signed.apk`: `ninja.integration.brainrush`, versionName 1 / versionCode 1, minSdk 24, targetSdk 36, apkSigningVersion 3. Installed signature `FD:1D:BC:B3:22:53:FA:1F:4F:38:C9:EB:99:9A:BF:E1:DF:E1:ED:C9:9F:BB:ED:A8:08:41:F3:48:9F:55:27:B1` = the fingerprint in `twa-manifest.json` and in the live `assetlinks.json` (fetched with curl: 200, `application/json`).
- Backend: PRODUCTION `https://brainrush.integration.ninja`. Live settings at test time: `ads_enabled: 0`.
- Method: real input (`adb input tap`, `keyevent 4`), page state read over `chrome_devtools_remote` (CDP). CDP was also used to (a) answer a streak POST locally so nothing could be saved, (b) rewrite the `settings.php` response on the device only for the ad check, (c) block ad requests. Native confirm dialogs were read with uiautomator and answered with real taps (the page's JS is blocked while a native dialog is open).
- Scripts and evidence: `C:\Users\NB28970\brainrush-twa-device-test\` (`scripts\`, `shots\`).

### Live server activity (list of what I started)
- **Board game: 1.** Players "TEST-QA1", "TEST-QA2", categories Flags + Landmarks, about 13:46 device time (EEST). 3 questions opened, no points scored, ended to Results, never saved anywhere.
- **Streak runs started: 3** (each posts a game log): "TEST-QA-A" (ended at 0), "TEST-QA-B" (20 correct, then a wrong answer), "TEST-QA-C" (1 correct, then a wrong answer). Between about 14:01 and 14:13 device time.
- **Streaks saved to the leaderboard: none.** I checked `GET api/streaks.php` before and after every streak run: always the same 2 pre-existing rows. For B and C the save POST was intercepted by the harness and never reached the server. (The "#1 on the leaderboard" text seen in B comes from my fake response.)
- Admin never opened. No server data changed. Ads: the AdSense script was never loaded in the app; in the control run its request was blocked on the device before leaving it, so no ad traffic was generated.
- Clean-up: site storage for the origin cleared, app uninstalled, Chrome re-enabled, airplane mode off, font scale 1.0, display size and density reset, rotation 0 (portrait), emulator shut down (`adb emu kill`). `accelerometer_rotation` was left at 0 (I did not record its original value; the emulator default is off).

## Acceptance criteria (US-40 app items, D-43 amendments)

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Install of signed APK; signature matches `assetlinks.json` | PASS | `adb install -r` Success; `pm get-app-links`: Signatures `FD:1D:...27:B1` |
| 2 | Opens full screen, no URL bar or Custom Tab toolbar (TWA verified) | PASS | `04-after-20s.png`, `5-warm-relaunch.png`; `pm get-app-links` -> `brainrush.integration.ninja: verified`; page: `matchMedia('(display-mode: standalone)')` true; `document.referrer` = `android-app://ninja.integration.brainrush/` (this also proves the D-43 referrer path at runtime, which the web report could not); logcat `TWALauncherActivity: Using url from Manifest ... ?source=twa`, `TwaLauncher: Launching Trusted Web Activity.`; top activity `TranslucentCustomTabActivity` |
| 3a | App mode: no Admin link, no "New game" heading, no home intro | PASS | `04-after-20s.png`; DOM: no `a[href="admin.html"]`, `#setup-title` and `.site-intro` `display:none`; header "How to play · Terms · Privacy" |
| 3b | No ad on the Streak leaderboard, AdSense never loaded | PASS | `3-app-leaderboard-ads-forced-on.png`. Live ads are off, so I rewrote `settings.php` on the device to `ads_enabled:1` (valid-format IDs): app mode = 0 script tags, 0 `<ins>`, `window.adsbygoogle` undefined, 0 ad requests. Control (flag removed, same window): script tag + `<ins>` + request to `googlesyndication` (blocked by me). `3-control-website-ad.png` |
| 3c | How to play / Terms / Privacy open in the same window, no new tab or Custom Tab | PASS | `3-howto.png`, `3-terms.png`, `3-privacy.png`; one page target each, same task, `target` attribute empty, flag `brainrush.app`=1 on each |
| 3d | "Back to the game" returns to the game in app mode | PASS | from all three guides: `/index.html`, flag 1, no Admin link, no "New game" |
| 3e | Links to other sites stay outside the app | PASS | Google partner-sites link on Privacy opens in a Custom Tab (toolbar, `3-external-link.png`); Back closes it to Privacy |
| 4a | Back on setup root leaves the app | PASS | before any tap, and after taps |
| 4b | Back after guide visits goes back through the pages, then leaves | PASS | privacy, index, terms, index, how-to-play, `/?source=twa`, then launcher (6 presses, 7th leaves) |
| 4c | Streak setup closes to a normal setup | PASS | `4-streak-setup.png`; note: with the soft keyboard open the first Back only hides the keyboard (normal Android) |
| 4d | Streak leaderboard from setup: Back to Streak setup | PASS | `3-streak-leaderboard-noad.png` |
| 4e | Board: End Game confirm; Cancel stays (twice) | PASS | native dialog "End the game now? 10 questions have not been played and will be ignored." `4-board-back-dialog.png` |
| 4f | Board question: "Leave this question?"; Cancel stays with timer running; OK back to board, cell used | PASS | `4-question-leave-dialog.png`, `4-after-leave-ok.png`; timer 18 -> 16 after Cancel; board shows the cell as used |
| 4g | Double-score popup: Back closes the popup only, timer resumes | PASS | `4-double-popup.png`; timer 29 -> 26 after Back; next Back asks the Leave confirm |
| 4h | Results: Back goes to a new setup | PASS | `4-results.png`, `4-after-results-back.png`; saved game cleared; next Back leaves the app |
| 4i | Streak question: Back asks "End the run now?"; Cancel stays; OK ends | PASS | count 0 "...nothing is saved." (Cancel, then OK to leaderboard "No streak this time"); count 1 "...Your streak of 1 is saved to the leaderboard." (Cancel). `4-streak-endrun-dialog*.png` |
| 4j | After a wrong answer, Back goes to the leaderboard; Back again to setup; Back leaves | PASS | `4-streak-lost-question.png`, `4-streak-lb-after-lost.png` |
| 4k | Known limitation (d): Back before the first tap on a restored game leaves the app | PASS (as documented) after force-stop; see BUG-02 for the process-death variant | |
| 5 | Offline page (US-40): navigation fails offline -> "You're offline" + Try again | PASS | `6-offline-navigate-privacy.png` (full screen in the app); Try again offline stays, online reloads the original page (`privacy.html`) |
| 6 | Android Back leaves state consistent after all the above | PASS | no Back press left a stuck screen |

## Other scenarios executed

| Scenario | Result | Evidence |
|---|---|---|
| Cold start (Chrome process killed) | PASS | 2.9 to 4.7 s to a ready page on the emulator; very first launch ever about 13 s (Chrome's first process start); warm/hot under 1 s. Splash visible meanwhile |
| HOME then relaunch (board) | PASS | board identical, Chrome pid unchanged |
| `am kill` of app and Chrome while backgrounded, board | PASS | `5-after-kill-board.png`: COLD start, board and used cells identical |
| Same, board question open | PASS | question reopens, timer restarts at full length (D-04) `5-question-after-kill.png` |
| Same, streak question | PASS | deadline kept: 106 s left before, 95 s after about 12 s away (matches "saved deadline", US-33) `5-streak-after-kill.png` |
| `force-stop` of app and Chrome, board | PASS | board restored, history reset to 1 |
| Rotation mid-question (board, photo) and mid-streak, back to portrait | PASS with BUG-03 | state, count and question kept, no reload; `5-rotate-landscape-streak.png` |
| Offline at launch (airplane on, cold start) | PASS | game page loads from Chrome's HTTP cache, then "Could not load the game setup ... Try again"; offline Try again keeps the message; online Try again loads 15 categories and the timer `6-offline-launch.png`, `6-offline-try-again-recovered.png` |
| Connection lost mid-streak (queue 6 left, 20 correct answers) | PASS | no error until the queue is empty, then "Could not load the next question: Could not reach the server..." with Next/End run, answered question kept; Next offline repeats the message; airplane off, Next loads a new batch (queue 19). `6-offline-midstreak.png`. Wording: see OBS-3 |
| Fallback: Chrome disabled | PASS (documented behaviour) | Android system dialog "App Unavailable: This app is unavailable because Chrome is blocked" `7-fallback-chrome-disabled.png`; logcat `TWAProviderPicker: Found no TWA providers, using first browser: null`; Chrome re-enabled, app works again. Fallback to another browser's Custom Tab: NOT RUN (no other browser on the image) |
| Deep links (verified `https` host) | PASS | cold `https://.../how-to-play.html`: opens in the app, app mode (referrer android-app, no Admin); warm root; unknown path -> site's own 404 page in the app; `?source=twa&x=<script>` -> setup, no script effect; `http://` -> https in the app; other host `https://example.com/` and `https://brainrush.integration.ninja.evil.example/` open in Chrome, not the app |
| Arabic question RTL (board photo and streak, portrait) | PASS | right-aligned text, choices with letter on the right, "English" toggle `5-question-after-kill.png`, `8-translate-prompt.png`, `4-streak-question.png` |
| Android display size larger (density 600, 288 css px wide) | PASS | no horizontal scroll, setup renders `8-display-size-large-setup.png` |
| System font scale 2.0 | BLOCKED (no effect) | status bar grew, page text did not: root stays 17 px, layout identical `8-fontscale2-setup.png`. See OBS-2 |
| Tablet-sized screen (simulated with `wm size 1600x2560`, density 240; same emulator, not a tablet) | PASS | 1067 css px, no horizontal scroll, sensible layout `9-tablet-size-simulated-setup.png` |
| Splash | PASS | `02-first-launch.png`: lightning-bolt icon centred on `#0b1026`, status bar the same colour |
| Launcher icon and name | PASS | `9-app-drawer-search.png`: bolt centred on dark circle, not clipped by the mask; label "BrainRush" |
| Status and navigation bar | PASS | pixels: status bar `#0b1026` (theme colour), navigation bar `#000000` (`twa-manifest.json`) |
| Crashes, ANR | PASS | `logcat -b crash` empty; no FATAL, ANR or "has died" for the app or Chrome in the whole run |
| Personal data in logcat | PASS | 0 hits for the test names |
| Manifest (static) | OBSERVATION | `allowBackup="true"` (the app stores nothing itself; Chrome holds the data); notification service not exported (`@bool/enableNotification`); only `LauncherActivity` and the file-provider (not exported) |

## Automation

No test code added to the repository. Throwaway device scripts (Node, CDP + adb) in `C:\Users\NB28970\brainrush-twa-device-test\scripts\`: `lib.mjs` (adb, CDP, real taps, typing), `dlg.mjs` (native dialog via uiautomator), `launch.mjs`, `t3*.mjs` (app mode, ads), `t4*.mjs`, `b*.mjs`, `e*.mjs`, `sa*/sb*/sc*/sd*.mjs` (Back and streak), `l*.mjs` (lifecycle), `o*.mjs` (offline), `dl*.mjs` (deep links). Not suites for the repo. Flaky or harness problems met: text typing into the first focused field sometimes failed (fixed by waiting for the keyboard); one native confirm was auto-answered by CDP `Page.enable` (my harness, not the product; those Back checks were redone with real dialogs); the question timer is wall-clock, so slow scripted steps let it run out (re-run quickly).

## Defects

### BUG-01: Chrome shows "Translate page? Arabic to English" over an Arabic question in the app
- Environment: build 1 (signed APK), emulator Medium_Phone_API_37.0, Android 37, Chrome 145.0.7632.218, live backend.
- Severity: Minor
- Priority rationale: Arabic questions are a core part of the content (D-30 and the Arabic banks). The sheet covers the bottom of the screen and takes the first Back press, so a Back to leave the question needs a second press. It appeared once in about 5 Arabic question sessions, so it is not constant; users can dismiss it.
- Prerequisites / test data: a streak run or board game whose question is in Arabic (default language here).
- Steps to reproduce:
  1. Start a Streak run (name "TEST-QA-x") and play several Arabic questions.
  2. Press Android Back on a question screen.
- Expected result: Back asks "End the run now?" (US-40).
- Actual result: uiautomator shows a Chrome bottom sheet "Translate page? Arabic to English / Translate"; the Back press only dismissed it; no End-run dialog.
- Reproducibility: Once (seen once in 5 Arabic sessions; text captured from the UI dump, no screenshot of the sheet).
- Evidence: UI dump text (`sbe.mjs` first run output); `8-translate-prompt.png` is taken after the sheet was dismissed (shows the Arabic question).
- Suspected area: page markup of the Arabic question/choices (`lang="ar"` on text within an English page, no `translate="no"`); suspected only.

### BUG-02: Back before the first tap after Chrome process death reloads the page instead of leaving the app
- Environment: as above.
- Severity: Minor
- Priority rationale: needs process death plus Back before any tap; no data lost. But the documented known limitation (D-43 d) says Back "leaves the app"; here it reloads the page once (a board question's timer restarts at full length, D-04), then the next Back leaves. Chrome keeps the old navigation entries of the task after process death.
- Prerequisites / test data: a game saved on the board; one tap on the page (so an entry was pushed).
- Steps to reproduce:
  1. Start a board game, tap on the board text once (history entry pushed).
  2. HOME, `adb shell am kill ninja.integration.brainrush`, `adb shell am kill com.android.chrome`.
  3. Relaunch the app (state COLD; board restored; `history.length` 2).
  4. Without tapping, press Back.
- Expected result: per D-43 (d) the app is left (or the End Game confirm).
- Actual result: app stays; page reloads (`navigation type back_forward`, state restored, history length unchanged); with a question open the timer restarted. After a force-stop instead of an am-kill the behaviour is as documented (Back leaves).
- Reproducibility: 2 of 2 (one board question, one board).
- Evidence: output of `l7.mjs` and `e2.mjs`; `5-after-back-no-tap.png`.
- Suspected area: `js/game.*.js` `syncBack()` (history entry restored by Chrome while `userActivation` is false); suspected.

### BUG-03: Photo question in landscape shows ghost fragments of the picture left of it
- Environment: as above, rotation to landscape (`user_rotation 1`).
- Severity: Minor
- Priority rationale: landscape on a phone is secondary (portrait is the main use), only photo questions (Landmarks), and the question is still answerable; it may be an emulator GPU artefact, to be checked on a real device.
- Prerequisites / test data: board game with Landmarks.
- Steps to reproduce:
  1. Open a Landmarks question (Arabic Colosseum question) in portrait.
  2. Rotate to landscape.
- Expected result: one clean picture.
- Actual result: picture is 218x145 css px in a 914x363 viewport; blurry slivers of the same picture appear to its left. Also present in a CDP compositor capture, so it is in the page rendering path, not only the screen grab. Portrait is clean. Answers and timer are below the fold in landscape.
- Reproducibility: Always (3 of 3 rotations).
- Evidence: `5-rotate-landscape-question.png`, `5-rotate-landscape-question-b.png`, `5-landscape-cdp-capture.png`.
- Suspected area: `.question-image` with `filter: drop-shadow(...)` and `object-fit: contain` in `css/style.*.css` (suspected; not confirmed).

## Observations (no defect, for the owner)
- OBS-1: Chrome's TWA disclosure "Running in Chrome / Got it" appears at the bottom on every cold start (about 3 s, covers the bottom of the page) until the user taps "Got it"; after that it did not return in my runs. This is Chrome behaviour for a TWA without notification delegation (D-43: notifications off); I cannot tell how it behaves for a Play-installed build. `5-disclosure-visible.png`.
- OBS-2: Android system font size has no effect on page text (root `17px`, same as in a Chrome tab). Pages that use px roots do not follow the OS setting; users depend on Chrome's own settings. An accessibility gap to decide, not covered by US-40.
- OBS-3: Offline messages inside the app say "Could not reach the server. Check that it is running." (developer wording). For players, "check your connection" would read better. `6-offline-midstreak.png`.
- OBS-4: native dialogs for Back confirms are titled "brainrush.integration.ninja says" (Chrome standard for `confirm()`).
- OBS-5: the hidden "New game" heading is still exposed in the accessibility tree as the setup section's name (by design, `aria-labelledby`); TalkBack would announce "New game" while it is not visible. Not tested with TalkBack.
- OBS-6: Chrome keeps the TWA's whole navigation stack across process death, so history length and Back depth differ from a fresh start (basis of BUG-02).
- OBS-7: `?source=twa` can be added by anyone to hide ads and Admin (accepted risk, D-43 c). Deep link to `/admin.html` was not opened (rule: no Admin).

## Not covered / blocked
- NOT RUN: wrong-fingerprint negative test (needs a differently signed build).
- NOT RUN: Play App Signing key (not created yet); a Play-installed build.
- NOT RUN: Android 8 and real tablet (only the API 37 image is installed; no downloads authorized). The tablet-size result is a screen-size simulation on the same image.
- NOT RUN: real hardware, TalkBack, low-memory and slow-network profiles beyond airplane mode, incoming call and permission-dialog interruptions (the app requests no permissions), jank and memory measurements.
- BLOCKED: system font scale 2.0 (no effect on page text); Custom Tab fallback through another browser (no other browser installed).
- Not applicable: iOS. Notifications (disabled by D-43).
- Not tested: a streak with Arabic at the longest answers on small displays beyond the screens captured; the maintenance banner with Back; admin flows.

## Risks
- Play-signed build will show a URL bar until the Play App Signing SHA-256 is in `assetlinks.json` and the CDN purged (condition 1).
- "Contains ads: No" holds: the AdSense script was never requested in the app, including after guide round trips and deep links. It depends on `js/app.js` staying in app mode; the live ads switch is off today, so the simulated-settings check is what proves it.
- First cold start on a fresh install is slow on the emulator (about 13 s, splash only); real devices should be faster but were not measured.
- Chrome-dependent behaviour (Translate sheet, "Running in Chrome", history after process death) can change with Chrome versions; only 145 was tested.

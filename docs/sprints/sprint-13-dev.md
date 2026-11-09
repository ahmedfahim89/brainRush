# Sprint 13: Arabic interface (US-49): developer note

Branch `sprint-13`, 2026-11-09. Plan: `docs/sprint-plan.md` "Sprint 13 — Arabic interface (US-49)", tasks 1-8. Story: US-49 in `docs/product-backlog.md`. Not committed (the orchestrator commits).

## Stories implemented
- **US-49 Arabic interface.**
  - **EN / AR switch** at the end of the game page's header: two small pill buttons, "EN" and "عربي", each named in its own language (`aria-label` "English" / "العربية", `aria-pressed`). On a phone it sits on the logo's line, with an invisible 48 px tap area (US-40) that adds no height, so the header stays 101 px (375 wide) and 78 px (desktop), exactly as before.
  - **Saved on the device** as `brainrush.lang` = `ar`. Choosing English removes the key, so English stays the default (no browser-language detection). An unknown value falls back to English.
  - **`lang` and `dir`.** `js/i18n.js` is loaded in `<head>`, so an Arabic page is `<html lang="ar" dir="rtl">` from its first paint. English keeps `lang="en"` with no `dir` attribute, as before.
  - **Every label, button, message, confirm, tooltip and `aria-label`** of Setup, Board, Question, Helpers, Double score, Results, Share, Streak, Leaderboard, Daily Challenge, Golden Goal, Report, Read aloud and the error messages comes from the string tables (inventory below: 293 keys, all translated).
  - **Live switch at any time,** also mid-question: the static texts are swapped, then the screen on show is drawn again in the new language (`onLanguageChanged()` in `js/game.js`). Nothing saved changes (game, Streak run, Daily Challenge), the running timer is not reset, and typed names, the bet being typed and ticked categories stay. An open question keeps the language it is shown in. Error messages on screen are shown again in the new language (they are kept as functions, `setText()`), as are the setup load error, field errors and the "Time's up!" line. The switch cannot be reached while the double-score popup or the Report form is open (the page behind is inert).
  - **Questions.** Unchanged rule: Arabic first when the question has Arabic, in both interface languages (that was already the behaviour), with the question's own language button. A question without Arabic shows English with no language button and no error. Its 3 choices are English then.
  - **RTL layout** (`css/style.css`): grids and flex rows mirror by themselves. Only the rules with a physical left or right got an `html[dir="rtl"]` twin (borders of messages, rows and cards, margins, the timer and played bars' growth side, the ×2 tag, the Report/speaker corner and the heading's room for them, text alignment of scores and forms). The coloured edge of scoring rows, result rows, bet cards and the Streak name is now set with `border-inline-start-color` (the same left edge in English, the right edge in Arabic). Letter spacing is 0 on Arabic labels (it pulls joined letters apart).
  - **Bidi isolation.** In Arabic, player names, category names and the run's name are wrapped in FSI…PDI (`iso()`), and signed numbers (scores, +400, −200, the countdown) in LRI…PDI (`ltr()`), so "Team Red!", "Who Am I?" and "−200" never flip. One-line labels cut with "…" (board cell owner, swapped-to category) get `dir="auto"` instead, so a long Latin name loses its end, not its start. Name inputs get `dir="auto"` in Arabic. In English both helpers return the text unchanged, so English text is byte-identical.
  - **Share text** (Results and Daily) is written in the interface language; the site link is unchanged.

## Decisions
- **String tables in one file, `js/i18n.js`** (`window.BrainRushI18n`): `t(key, params)` with `{name}` placeholders; `n(key, count)` for plurals with `Intl.PluralRules` (Arabic zero/one/two/few/many/other); a missing Arabic string or plural form falls back to English, an unknown key returns the key. Static texts of `index.html` carry `data-i18n="key"` / `data-i18n-attr="attr:key"`; the English text stays in the HTML (no-JS, search engines, D-42).
- **Numbers stay in Western digits (0-9)** in Arabic, as on the board, the scores and the admin settings. Bets typed in Arabic-Indic digits were already accepted (`westernDigits()`).
- **Golden Goal and Sudden Death are translated** as their Arabic football terms, "الهدف الذهبي" and "سلسلة الموت المفاجئ"; the helpers are "ثلاثة خيارات" / "تبديل" / "تخطّي" (fix loop 1). The owner may prefer the English names: they are single entries in the table (`final.name`, `streak.openBtn`, `helper.*`).
- **Saved game version unchanged** (still 4; Streak 1, Daily 1): the language is not stored in the game, so D-28 does not apply.
- **English layout guard:** the new rules are all `html[dir="rtl"]`/`html[lang="ar"]` rules, except three selector changes that change nothing in English: `.mode-option span` became `.mode-option > span` (the mode labels now have an inner `<span data-i18n>`), and `.game .page-header nav { margin-inline-start: auto }` keeps the links next to the switch (game page only; the guide pages are untouched).
- **share.js** reads the two status texts ("Copied", "Could not copy…") from the tables when `js/i18n.js` is there, else English.
- **Privacy:** `privacy.html` now says the interface language is saved only in the browser, next to the read-aloud choice (README rule on new browser storage). Terms defers to Privacy, so it is unchanged.

## Deliberately left in English (with the reason)
| Item | Reason |
|---|---|
| Player names, questions, answers, wrong options | Data, shown as stored (owner instruction). Category names are now shown in Arabic (change request below); a category without an Arabic name falls back to English |
| Error texts sent by the server (`error` field of the API) | Server messages; the API is not localized. Browser-made errors ("Could not reach the server", "unexpected response", HTTP code) are translated |
| "Photo: <credit>" under a picture | A licence attribution; the line is `lang="en" dir="ltr"` and the credits are Latin |
| A / B / C choice letters and the helper chips ABC, ⇄, ½ | Symbols; kept the same as the English guide, the scoring hint and what read aloud says |
| "EN", "عربي", "English", "العربية" (switch and question language button) | Each language is named in its own language |
| "BrainRush", "Jeopardy" (setup intro) | Brand / proper names |
| Page `<title>`, meta description, Open Graph and JSON-LD | SEO texts (D-42), not shown on the page |
| "New questions" banner text | Typed by the admin (data) |
| Footer "© 2026 BrainRush · Ahmed Fahim" | Brand and name |
| OK / Cancel of the confirm dialogs | Drawn by the browser in its own language |
| `offline.html`, guide, Terms, Privacy, About, Contact, Admin | Stay English (US-49 / owner); they do not load `js/i18n.js` |
| Internal error "The saved run has no question." | Never shown (caught; the app falls back to Setup) |

## Files created / changed
- **New** `js/i18n.js`: string tables, lookup, plurals, `iso()`/`ltr()`, `apply()`, `setLang()`, page `lang`/`dir`.
- `index.html`: `<script src="js/i18n.js">` in `<head>`; the EN / AR switch in the header; `data-i18n` / `data-i18n-attr` on every static text (mixed-content labels got an inner `<span>`).
- `js/game.30601c74.js` (edited in place; the hook re-hashes it): every visible string through `t()`/`tn()`; `MODES` and `PALETTE` hold keys; `plural()`, `MONTHS`, `FINAL_NAME` and the DOM-read `STREAK_PANEL_TEXT`/`SCORING_PANEL_TEXT` replaced; `formatScore()`/`signed()` isolate signed numbers; `textError()` + `errorText()` keep browser-made errors re-translatable; `setText()`/`refreshTexts()`; new section "Interface language (US-49)" (`applyStaticTexts`, `onLanguageChanged`, `refreshSetup`, `refreshScreen`, `refreshQuestion`, `refreshFinal`); small extractions `renderRunHeading()`, `renderWagerPrompt()`, `renderDailyTexts()`, `setFinalPanelTexts()`, `ownDirection()`, `setTimeUp()`, `sentence()`, `showLeaderboardLoading()`; `border-inline-start-color` for the row edges.
- `js/share.28bcd18c.js` (in place): status texts from the tables.
- `css/style.4a59deab.css` (in place): the switch, the RTL block, the `.mode-option > span` scoping.
- `how-to-play.html`: one line on the EN / AR switch (the guide stays English). `README.md`: How to play item 11. `llms.txt`: one line. `privacy.html`: the language choice in browser storage. `docs/spec.md`: `js/i18n.js` in the file structure.

**New files to `git add`:** `js/i18n.js` (the hook only renames tracked files: add it before the commit, and it gets its hashed name and `index.html` its new reference) and this note. No PHP, SQL or migration. `admin.html` and the guide pages reference `style.*.css`, which the hook rewrites as usual.

All changed and new files use CRLF (checked: 0 LF-only lines).

## How to run / test
1. MariaDB running; `C:/xampp/php/php.exe -S localhost:8000` from the project root.
2. Click **عربي** in the header: the page turns right to left. Play a board game (helpers, double score, Golden Goal with a tie), a Streak run, the Daily Challenge, Report a question, Share. Switch EN / AR in the middle of a question: the timer keeps going.
3. Refresh: the language stays. Click **EN**: everything is as before.

## Verification done
All against my own `php -S localhost:8013` (the owner's 8000 server was not touched), PHP 8.0.30, MariaDB 10.4.32, headless Chrome (system Chrome through the project's Playwright; scripts in `%TEMP%\br-s13-tools`, outside the repo). Game log, question stats, Streak saves, reports and `daily.php` were answered by the scripts, so nothing was written to the DB or the logs.
- **Lint:** `node --check` on `js/i18n.js`, `js/game.*.js`, `js/share.*.js`. No PHP file was touched, so no `php -l` was needed.
- **Fixtures:** one real board (6 contestants with Latin and Arabic names, "Team Red!", 5 categories + Kilo Meshakkal), 20 Streak questions and one Golden Goal question, then injected as saved states so every screen renders the same before and after: setup, setup with errors, board, 6 question variants (Arabic, 3 choices EN/AR, picture, double + Swap), Report form, double-score popup, results, results with a tie, Golden Goal offer (round 1 and 2), bets, Golden Goal question, Streak open and lost, Daily question and result, leaderboard (21 screens).
- **English regression (before vs after, 1366x768 and 375x812, 42 renders):** the visible text, every `aria-label`/`title`/`placeholder`/`alt` and the screen-reader-only texts are **identical** outside the header; header height (78 / 101 px), page width and page height are **identical** on every screen; no JS error. Pixel comparison of the main area: identical except (a) the setup screen, where sub-pixel anti-aliasing changed in the text runs now wrapped in spans (no shift), and (b) a 1 px column at the end of the masked timer bar, which differs between two runs of the same code too (timing). Interactive English check, **33/33 PASS**: setup errors, board info, cell labels, Correct/Wrong buttons and labels, the Skip confirm, helpers left, End Game confirm, winner, share text "Ann won BrainRush with 0! Bob −50." + link and "Copied", Daily hint, feedback, squares label and the Daily share text, all character for character as before.
- **Arabic (63 renders: 1366x768, 375x812, 1920x1080):** no JS error, no horizontal overflow, and on every screen the page is **no taller than in English**. The D-30 one-screen views (board with 6x5 and 6 contestants, every question variant, Golden Goal question, Streak, Daily question, leaderboard) fit 1366x768 and 1920x1080 exactly as in English; on 375x812 the same screens scroll by the same or a smaller amount than in English. Screenshots reviewed for mirroring and bidi.
- **Leftover English scan:** every Latin word on all Arabic screens is data (names, categories, questions, choices), the brand, "EN"/"English" or the ABC chip.
- **Bidi measured, not only looked at:** glyph positions confirm "−200"/"−100" (minus left of the digits) on the scoreboard, results, bets and scoring rows, "+400" in the double-score text and Correct button, and "Team Red!" in the bets list.
- **Live switch:** all 19 non-popup screens rendered in English, switched to Arabic, and compared with a fresh Arabic load: identical (the only extra is the hidden board behind Results, now also redrawn in Arabic); switched AR → EN: identical to a fresh English load except the timer and countdown having ticked on (the timer is not reset).
- **Arabic flows, 77/77 PASS:** validation messages; switching keeps typed names and re-translates errors; board info; a question without Arabic shows English with no language button; 3 choices / Swap / Skip confirms and blocked-helper reasons; marks; cell owner; Arabic question opens in Arabic; switching mid-question keeps the timer and the question's language; Report (missing reason, sent, thanks; the report body is unchanged); refresh keeps Arabic and the open question; End Game confirm (plural); Golden Goal offer, bet errors (re-shown after a switch), a bet typed as "٥" saved as 5, the final question and See results; winner; share text in Arabic + link, "تم النسخ"; Streak name error, panel, wrong-answer feedback, leaderboard headline, rank line, week tab; Daily panel, score line, countdown and switching it; a network error on setup in Arabic, re-shown in English, Try again recovers; the choice is saved, survives a reload, English removes the key, a bad value falls back to English; how-to-play, Terms, Privacy, About, Contact and Admin stay English/LTR with Arabic chosen.
- **Bug found and fixed during testing:** in `share.js`, the new label helper was first named `text`, which the `share(text, status)` parameter shadowed, so every copy reported "Could not share the result." (it would have broken English sharing too). Renamed to `label`; both share checks pass.

## Data restored
Snapshot before any test: `mysqldump` of `settings`, `point_values`, `streaks`, `question_reports`, `daily_challenge`, `question_stats`; the counts and max ids of `questions` and `categories`; every table's `AUTO_INCREMENT`; copies of the 7 `logs/*.log`. After all tests the dump is **identical**, the counts and `AUTO_INCREMENT`s are identical, the 7 log files are byte-identical and no new log file exists. Nothing was written (all writes were answered by the test scripts; today's Daily set was faked so no `daily_challenge` row was created). MariaDB was not running when I started; I started it and **left it running** for the owner's localhost:8000. My port-8013 server is stopped.

## Known limitations
- Error texts sent by the server stay English inside Arabic sentences ("تعذّر بدء اللعبة: <server text>").
- A category without an Arabic name (`categories.name_ar` empty) shows its English name in Arabic (change request below).
- Switching during a sub-second request ("Starting...", "Loading...") shows the button's normal label until that request ends.
- The OK / Cancel buttons of confirms follow the browser's language.
- The Arabic share text contains invisible bidi marks around names and scores (they keep names and minus signs right in chat apps).
- Default is English; the browser language is not used to pick Arabic automatically (owner's call).
- On a 375 px phone a wide negative score nearly touches the + button on the scoreboard card; it does the same in English (not changed here).
- The Arabic strings are AI-drafted Modern Standard Arabic and need review by the owner or an Arabic speaker (table below). Points in screen-reader labels use the singular "نقطة" (right for 100, 200, …), not every Arabic plural form.

## String inventory (task 1)
Every visible string of the game page, by key (`js/i18n.js`). All 293 have Arabic; the items deliberately left in English are listed above. Plural entries show their forms (Arabic: zero / one / two / few / many / other). `{x}` is filled in by the game.

| # | Key | Screen | English | Arabic |
|---|---|---|---|---|
| 1 | `nav.howToPlay` | Header/footer | How to play | طريقة اللعب |
| 2 | `nav.terms` | Header/footer | Terms | الشروط |
| 3 | `nav.privacy` | Header/footer | Privacy | الخصوصية |
| 4 | `nav.admin` | Header/footer | Admin | الإدارة |
| 5 | `nav.about` | Header/footer | About | عن اللعبة |
| 6 | `nav.contact` | Header/footer | Contact | تواصل معنا |
| 7 | `nav.site` | Header/footer | Site | روابط الموقع |
| 8 | `lang.group` | Header / question | Language | اللغة |
| 9 | `maintenance.text` | Maintenance overlay | Poor AI agents are working late tonight to deliver the cool features you asked for. The game will be playable again within 24 hours. | وكلاء الذكاء الاصطناعي المساكين يسهرون الليلة لتجهيز الميزات الرائعة التي طلبتموها. ستعود اللعبة متاحة خلال 24 ساعة. |
| 10 | `common.loading` | Common | Loading... | جارٍ التحميل... |
| 11 | `common.tryAgain` | Common | Try again | حاول مرة أخرى |
| 12 | `common.newGame` | Common | New Game | لعبة جديدة |
| 13 | `common.share` | Common | Share | مشاركة |
| 14 | `common.back` | Common | Back | رجوع |
| 15 | `list.sep` | Common | ,  | ،  |
| 16 | `list.and` | Common |  and  |  و |
| 17 | `date.months` | Leaderboard | Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec | يناير,فبراير,مارس,أبريل,مايو,يونيو,يوليو,أغسطس,سبتمبر,أكتوبر,نوفمبر,ديسمبر |
| 18 | `date.format` | Leaderboard | {d} {m} {y} | {d} {m} {y} |
| 19 | `err.generic` | Errors | Something went wrong. | حدث خطأ ما. |
| 20 | `err.network` | Errors | Could not reach the server. Check that it is running. | تعذّر الوصول إلى الخادم. تأكد من أنه يعمل. |
| 21 | `err.http` | Errors | Request failed (HTTP {status}). | فشل الطلب (HTTP {status}). |
| 22 | `err.response` | Errors | The server sent an unexpected response. | أرسل الخادم ردًا غير متوقع. |
| 23 | `err.board` | Errors | The server sent an unexpected board. | أرسل الخادم لوحة غير متوقعة. |
| 24 | `err.question` | Errors | The server sent an unexpected question. | أرسل الخادم سؤالًا غير متوقع. |
| 25 | `err.questions` | Errors | The server sent unexpected questions. | أرسل الخادم أسئلة غير متوقعة. |
| 26 | `err.leaderboard` | Errors | The server sent an unexpected leaderboard. | أرسل الخادم لوحة صدارة غير متوقعة. |
| 27 | `err.daily` | Errors | The server sent an unexpected Daily Challenge. | أرسل الخادم تحديًا يوميًا غير متوقع. |
| 28 | `err.noQuestions` | Errors | There are no questions to play yet. | لا توجد أسئلة للعب بعد. |
| 29 | `setup.title` | Setup | New game | لعبة جديدة |
| 30 | `setup.intro` | Setup | Free Jeopardy-style trivia quiz game for parties, classrooms and family nights: questions in English and Arabic, players or teams on one shared screen. | لعبة مسابقات ثقافية مجانية على طريقة Jeopardy للحفلات والفصول الدراسية والسهرات العائلية: أسئلة بالعربية والإنجليزية، ولاعبون أو فرق أمام شاشة واحدة مشتركة. |
| 31 | `setup.who` | Setup | Who is playing? | من سيلعب؟ |
| 32 | `setup.playMode` | Setup | Play mode | نوع اللعب |
| 33 | `setup.colorHint` | Setup | Click a color circle to switch to the next free color. | اضغط على دائرة اللون للانتقال إلى اللون المتاح التالي. |
| 34 | `setup.start` | Setup | Start Game | ابدأ اللعبة |
| 35 | `setup.starting` | Setup | Starting... | جارٍ البدء... |
| 36 | `mode.players` | Setup | Players | لاعبون |
| 37 | `mode.teams` | Setup | Teams | فرق |
| 38 | `mode.limit` | Setup | (max {n}) | (حتى {n}) |
| 39 | `entry.add.players` | Setup | Add player | إضافة لاعب |
| 40 | `entry.add.teams` | Setup | Add team | إضافة فريق |
| 41 | `entry.label.players` | Setup | Player {n} | اللاعب {n} |
| 42 | `entry.label.teams` | Setup | Team {n} | الفريق {n} |
| 43 | `entry.placeholder` | Setup | {label} name | اسم {label} |
| 44 | `entry.colorTitle` | Setup | {color} - click for the next free color | {color}: اضغط للون المتاح التالي |
| 45 | `entry.colorLabel` | Setup | {label} color {color}. Click for the next free color. | لون {label}: {color}. اضغط للون المتاح التالي. |
| 46 | `entry.remove` | Setup | Remove | حذف |
| 47 | `entry.removeLabel` | Setup | Remove {label} | حذف {label} |
| 48 | `entry.tooMany.players` | Setup | Players mode allows at most {limit} players. Remove {extra} to continue. | الحد الأقصى في وضع اللاعبين هو {limit}. احذف {extra} للمتابعة. |
| 49 | `entry.tooMany.teams` | Setup | Teams mode allows at most {limit} teams. Remove {extra} to continue. | الحد الأقصى في وضع الفرق هو {limit}. احذف {extra} للمتابعة. |
| 50 | `entry.required` | Setup | Name is required | الاسم مطلوب |
| 51 | `entry.unique` | Setup | Names must be unique | يجب ألا تتكرر الأسماء |
| 52 | `color.red` | Setup | Red | أحمر |
| 53 | `color.blue` | Setup | Blue | أزرق |
| 54 | `color.green` | Setup | Green | أخضر |
| 55 | `color.orange` | Setup | Orange | برتقالي |
| 56 | `color.purple` | Setup | Purple | بنفسجي |
| 57 | `color.cyan` | Setup | Cyan | سماوي |
| 58 | `cat.legend` | Setup | Select categories | اختر الفئات |
| 59 | `cat.legendMax` | Setup | one: Select up to {n} category / other: Select up to {n} categories | one: اختر فئة واحدة / two: اختر حتى فئتين / few: اختر حتى {n} فئات / many: اختر حتى {n} فئة / other: اختر حتى {n} فئة |
| 60 | `cat.loading` | Setup | Loading categories... | جارٍ تحميل الفئات... |
| 61 | `cat.none` | Setup | No playable categories yet. | لا توجد فئات قابلة للعب بعد. |
| 62 | `cat.surprise` | Setup | Surprise me! | فاجئني! |
| 63 | `cat.surpriseHint` | Setup | Tick alone for {n} random categories, or add it to your picks for 1 mystery category. | اخترها وحدها لتحصل على فئات عشوائية عددها {n}، أو أضفها إلى اختياراتك لتحصل على فئة غامضة واحدة. |
| 64 | `cat.notEnoughStart` | Setup | No playable categories — add questions in  | لا توجد فئات قابلة للعب — أضف أسئلة من صفحة  |
| 65 | `cat.notEnoughEnd` | Setup | . A category is playable when it has a question for every enabled point value. | . تكون الفئة قابلة للعب عندما يكون فيها سؤال لكل قيمة نقاط مفعّلة. |
| 66 | `cat.count` | Setup | {k} of up to {n} selected. Columns follow the order you tick them. | اخترت {k} من {n} كحد أقصى. ترتيب الأعمدة يتبع ترتيب اختيارك. |
| 67 | `cat.countNoMax` | Setup | {k} selected. | اخترت {k}. |
| 68 | `cat.atLeast` | Setup | Select at least 1 category. | اختر فئة واحدة على الأقل. |
| 69 | `cat.tooMany` | Setup | one: Select up to {n} category ({k} selected). / other: Select up to {n} categories ({k} selected). | one: اختر فئة واحدة فقط (اخترت {k}). / two: اختر حتى فئتين (اخترت {k}). / few: اختر حتى {n} فئات (اخترت {k}). / many: اختر حتى {n} فئة (اخترت {k}). / other: اختر حتى {n} فئة (اخترت {k}). |
| 70 | `cat.allPicked` | Setup | Every playable category is already picked — untick one, or untick Surprise me! | كل الفئات القابلة للعب مختارة بالفعل — ألغِ اختيار إحداها، أو ألغِ اختيار «فاجئني!» |
| 71 | `timer.legend` | Setup | Timer | المؤقت |
| 72 | `timer.label` | Setup | Seconds per question (this game only) | عدد الثواني لكل سؤال (لهذه اللعبة فقط) |
| 73 | `timer.invalid` | Setup | Timer must be a whole number of seconds between {min} and {max}. | يجب أن يكون المؤقت عددًا صحيحًا من الثواني بين {min} و{max}. |
| 74 | `readAloud.label` | Setup | Read questions automatically | قراءة الأسئلة تلقائيًا |
| 75 | `readAloud.hint` | Setup | On this device, when a question opens. The 🔊 button on a question reads it any time. | على هذا الجهاز، عند فتح السؤال. وزر 🔊 في السؤال يقرؤه في أي وقت. |
| 76 | `played.legend` | Setup | Played questions | الأسئلة الملعوبة |
| 77 | `played.bar` | Setup | Questions played | الأسئلة الملعوبة |
| 78 | `played.reset` | Setup | Forget played questions | مسح سجل الأسئلة الملعوبة |
| 79 | `played.count` | Setup | one: Played {n} question on this device. / other: Played {n} questions on this device. | zero: لم يُلعب أي سؤال على هذا الجهاز بعد. / one: لُعب سؤال واحد على هذا الجهاز. / two: لُعب سؤالان على هذا الجهاز. / few: لُعبت {n} أسئلة على هذا الجهاز. / many: لُعب {n} سؤالًا على هذا الجهاز. / other: لُعب {n} سؤال على هذا الجهاز. |
| 80 | `played.lessThan1` | Setup | Less than 1% | أقل من 1% |
| 81 | `played.percent` | Setup | {label} of the questions played on this device. | لُعب {label} من الأسئلة على هذا الجهاز. |
| 82 | `played.confirm` | Setup | Forget the played questions? Questions you have already seen can come up again. | مسح سجل الأسئلة الملعوبة؟ قد تظهر مرة أخرى أسئلة رأيتها من قبل. |
| 83 | `load.incomplete` | Setup | The game settings are incomplete (categories per game is missing). | إعدادات اللعبة غير مكتملة (عدد الفئات لكل لعبة غير محدد). |
| 84 | `load.failed` | Setup | Could not load the game setup: {reason} | تعذّر تحميل إعداد اللعبة: {reason} |
| 85 | `load.openAdmin` | Setup | Open Admin | افتح صفحة الإدارة |
| 86 | `start.fix` | Setup | The game cannot start yet. Please fix the errors above. | لا يمكن بدء اللعبة بعد. يُرجى تصحيح الأخطاء أعلاه. |
| 87 | `start.failed` | Setup | Could not start the game: {reason} | تعذّر بدء اللعبة: {reason} |
| 88 | `board.title` | Board | Game board | لوحة اللعب |
| 89 | `board.scoreboard` | Board | Scoreboard | لوحة النتائج |
| 90 | `board.end` | Board | End Game | إنهاء اللعبة |
| 91 | `board.doneBtn` | Board | End Game and show results | إنهاء اللعبة وعرض النتائج |
| 92 | `board.contestants.players` | Board | one: {n} player / other: {n} players | one: لاعب واحد / two: لاعبان / few: {n} لاعبين / many: {n} لاعبًا / other: {n} لاعب |
| 93 | `board.contestants.teams` | Board | one: {n} team / other: {n} teams | one: فريق واحد / two: فريقان / few: {n} فرق / many: {n} فريقًا / other: {n} فريق |
| 94 | `board.size` | Board | {cols} × {rows} board | لوحة {cols} × {rows} |
| 95 | `board.played` | Board | Played {used} of {total} | لُعب {used} من {total} |
| 96 | `board.timer` | Board | Timer {s} s | المؤقت {s} ث |
| 97 | `board.corrections` | Board | Corrections {step} | التصحيح {step} |
| 98 | `board.surpriseCat` | Board | Surprise category | فئة مفاجئة |
| 99 | `board.allPlayed` | Board | All {n} questions have been played. | لُعبت كل الأسئلة ({n}). |
| 100 | `board.endConfirm` | Board | one: End the game now? {n} question has not been played and will be ignored. / other: End the game now? {n} questions have not been played and will be ignored. | one: إنهاء اللعبة الآن؟ سؤال واحد لم يُلعب وسيُتجاهل. / two: إنهاء اللعبة الآن؟ سؤالان لم يُلعبا وسيُتجاهلان. / few: إنهاء اللعبة الآن؟ {n} أسئلة لم تُلعب وستُتجاهل. / many: إنهاء اللعبة الآن؟ {n} سؤالًا لم تُلعب وستُتجاهل. / other: إنهاء اللعبة الآن؟ {n} سؤال لم تُلعب وستُتجاهل. |
| 101 | `cell.label` | Board | {cat}, {points} points | {cat}، {points} نقطة |
| 102 | `cell.mix` | Board | {name}, mystery value | {name}، قيمة غامضة |
| 103 | `cell.double` | Board | , double score | ، نقاط مضاعفة |
| 104 | `cell.swapped` | Board | , swapped to {swap} | ، استُبدل بسؤال {swap} |
| 105 | `cell.won` | Board | , won by {name} | ، فاز به {name} |
| 106 | `cell.none` | Board | , no correct answer | ، لا إجابة صحيحة |
| 107 | `score.minus` | Board | Subtract {step} points from {name} | اخصم {step} من {name} |
| 108 | `score.plus` | Board | Add {step} points to {name} | أضف {step} إلى {name} |
| 109 | `helpers.left` | Board | Helpers left: {list} | المساعدات المتبقية: {list} |
| 110 | `helpers.none` | Board | No helpers left | لا مساعدات متبقية |
| 111 | `double.title` | Double popup | ×2 Double score! | ×2 نقاط مضاعفة! |
| 112 | `double.ok` | Double popup | Let's play | هيا نلعب |
| 113 | `double.text` | Double popup | A correct answer earns {win} instead of {normal}. A wrong answer costs the normal {loss}. | الإجابة الصحيحة تكسب {win} بدلًا من {normal}. والإجابة الخاطئة تخصم {loss} كالمعتاد. |
| 114 | `question.picture` | Question | Question picture | صورة السؤال |
| 115 | `question.choices` | Question | Choices | الخيارات |
| 116 | `question.double` | Question | ×{factor} Double score | ×{factor} نقاط مضاعفة |
| 117 | `question.swappedFrom` | Question | Swapped from {cat} | بدلًا من {cat} |
| 118 | `question.leaveMarked` | Question | Leave this question? It will be closed and cannot be opened again. | مغادرة هذا السؤال؟ سيُغلق ولا يمكن فتحه مرة أخرى. |
| 119 | `question.leaveUnmarked` | Question | Leave this question? It will be closed without points and cannot be opened again. | مغادرة هذا السؤال؟ سيُغلق دون نقاط ولا يمكن فتحه مرة أخرى. |
| 120 | `lang.showEnglish` | Header / question | Show question in English | اعرض السؤال بالإنجليزية |
| 121 | `lang.showArabic` | Header / question | Show question in Arabic | اعرض السؤال بالعربية |
| 122 | `timer.secondsLeft` | Question | Seconds left | الثواني المتبقية |
| 123 | `timer.pause` | Question | Pause | إيقاف مؤقت |
| 124 | `timer.resume` | Question | Resume | استئناف |
| 125 | `timer.reset` | Question | Reset | إعادة ضبط |
| 126 | `timer.up` | Question | Time's up! | انتهى الوقت! |
| 127 | `answer.show` | Question | Show Answer | اعرض الإجابة |
| 128 | `answer.label` | Question | Answer | الإجابة |
| 129 | `scoring.title` | Question | Scoring | احتساب النقاط |
| 130 | `scoring.hint` | Question | Each player or team can be scored once. Only one can be correct. Helpers, once per game before anyone is scored: ABC 3 choices, ⇄ swap, ½ skip for half the points. | تُحتسب إجابة كل لاعب أو فريق مرة واحدة، ولا تصح إلا إجابة واحدة. المساعدات، مرة واحدة في كل لعبة وقبل احتساب أي إجابة: ABC ثلاثة خيارات، ⇄ تبديل، ½ تخطّي بنصف النقاط. |
| 131 | `scoring.back` | Question | Back to Board | العودة إلى اللوحة |
| 132 | `score.correctBtn` | Question | ✓ Correct ({amount}) | ✓ صحيح ({amount}) |
| 133 | `score.wrongBtn` | Question | ✗ Wrong ({amount}) | ✗ خطأ ({amount}) |
| 134 | `score.correctLabel` | Question | Correct for {name}, plus {n} points | صحيح لـ{name}، زائد {n} نقطة |
| 135 | `score.doubleNote` | Question |  (double score) |  (نقاط مضاعفة) |
| 136 | `score.wrongLabel` | Question | Wrong for {name}, minus {n} points | خطأ لـ{name}، ناقص {n} نقطة |
| 137 | `score.markedCorrect` | Question | {name} marked correct | احتُسبت إجابة {name} صحيحة |
| 138 | `score.markedWrong` | Question | {name} marked wrong | احتُسبت إجابة {name} خاطئة |
| 139 | `speak.label` | Question | Read the question aloud | اقرأ السؤال بصوت عالٍ |
| 140 | `speak.stop` | Question | Stop reading | أوقف القراءة |
| 141 | `report.button` | Report | Report | إبلاغ |
| 142 | `report.buttonLabel` | Report | Report a problem with this question | الإبلاغ عن مشكلة في هذا السؤال |
| 143 | `helper.choices` | Helpers | 3 choices | ثلاثة خيارات |
| 144 | `helper.swap` | Helpers | Swap | تبديل |
| 145 | `helper.skip` | Helpers | Skip | تخطّي |
| 146 | `helper.chipLabel` | Helpers | {helper} for {name} | {helper} لـ{name} |
| 147 | `helper.chipLabelReason` | Helpers | {helper} for {name} ({reason}) | {helper} لـ{name} ({reason}) |
| 148 | `helper.off` | Helpers | helpers are turned off | المساعدات متوقفة |
| 149 | `helper.loading` | Helpers | loading a new question | جارٍ تحميل سؤال جديد |
| 150 | `helper.waitSwap` | Helpers | wait for the swap | انتظر انتهاء التبديل |
| 151 | `helper.used` | Helpers | already used in this game | استُخدمت في هذه اللعبة |
| 152 | `helper.afterAnswer` | Helpers | not after the answer is shown | غير متاحة بعد عرض الإجابة |
| 153 | `helper.afterScore` | Helpers | not after someone was scored | غير متاحة بعد احتساب أي إجابة |
| 154 | `helper.onlyBy` | Helpers | only {name} can use helpers on this question | وحده {name} يمكنه استخدام المساعدات في هذا السؤال |
| 155 | `helper.noChoices` | Helpers | this question has no choices yet | لا خيارات لهذا السؤال بعد |
| 156 | `helper.ask` | Helpers | Use {helper} for {name}?  | هل تستخدم مساعدة «{helper}» لـ{name}؟  |
| 157 | `helper.askSkip` | Helpers | {name} loses {half} points (half of {points}) and the question closes for everyone. | يخسر {name} {half} نقطة (نصف {points}) ويُغلق السؤال للجميع. |
| 158 | `helper.askSwap` | Helpers | A random question from any category replaces this one, with a new timer. | يحل محل هذا السؤال سؤال عشوائي من أي فئة، بمؤقت جديد. |
| 159 | `helper.askChoices` | Helpers | The answer is shown among 3 choices. | تظهر الإجابة بين 3 خيارات. |
| 160 | `helper.askOnly` | Helpers |  Only {name} can answer this question then. |  بعدها يجيب {name} وحده عن هذا السؤال. |
| 161 | `swap.failed` | Helpers | Could not swap the question: {reason} The helper was not used. | تعذّر تبديل السؤال: {reason} لم تُستخدم المساعدة. |
| 162 | `swap.answerShown` | Helpers | The answer was shown meanwhile, so the Swap was not used. | عُرضت الإجابة في الأثناء، لذلك لم يُستخدم التبديل. |
| 163 | `results.title` | Results | Results | النتائج |
| 164 | `results.wins` | Results | {name} wins! | الفوز لـ{name}! |
| 165 | `results.tie` | Results | It's a tie between {names} | تعادل بين {names} |
| 166 | `results.winner` | Results | Winner | الفائز |
| 167 | `share.unavailable` | Results / Daily (share) | Sharing is not available right now. | المشاركة غير متاحة الآن. |
| 168 | `share.failed` | Results / Daily (share) | Could not share the result. | تعذّرت مشاركة النتيجة. |
| 169 | `share.copied` | Results / Daily (share) | Copied | تم النسخ |
| 170 | `share.copyFailed` | Results / Daily (share) | Could not copy. Your browser blocked it. | تعذّر النسخ. منعه المتصفح. |
| 171 | `share.won` | Results / Daily (share) | {name} won BrainRush with {score}! | فاز {name} في BrainRush بنتيجة {score}! |
| 172 | `share.tie` | Results / Daily (share) | It's a tie between {names} in BrainRush with {score} each! | تعادل في BrainRush بين {names} بنتيجة {score} لكلٍّ منهم! |
| 173 | `streak.openBtn` | Streak | Sudden Death Streak | سلسلة الموت المفاجئ |
| 174 | `streak.solo` | Streak | (solo) | (فردي) |
| 175 | `streak.legend` | Streak | Streak Challenge | تحدي السلسلة |
| 176 | `streak.setupHint` | Streak | Questions come from every category. Pick 1 of 3 answers before the time runs out: one wrong answer or time's up ends the run. Your streak goes on the shared leaderboard with your name. | الأسئلة من كل الفئات. اختر إجابة من 3 قبل انتهاء الوقت: إجابة خاطئة واحدة أو انتهاء الوقت يُنهي الجولة. تُسجَّل سلسلتك باسمك في لوحة الصدارة المشتركة. |
| 177 | `streak.nameLabel` | Streak | Challenger name | اسم المتحدّي |
| 178 | `streak.cancel` | Streak | Back to a normal game | العودة إلى لعبة عادية |
| 179 | `streak.leaderboard` | Streak | Streak leaderboard | لوحة صدارة السلاسل |
| 180 | `streak.start` | Streak | Start Streak Challenge | ابدأ تحدي السلسلة |
| 181 | `streak.nameRequired` | Streak | Challenger name is required | اسم المتحدّي مطلوب |
| 182 | `streak.nameTooLong` | Streak | Challenger name must be at most {max} characters | يجب ألا يتجاوز عدد أحرف اسم المتحدّي {max} |
| 183 | `streak.fix` | Streak | The Streak Challenge cannot start yet. Please fix the errors above. | لا يمكن بدء تحدي السلسلة بعد. يُرجى تصحيح الأخطاء أعلاه. |
| 184 | `streak.failed` | Streak | Could not start the Streak Challenge: {reason} | تعذّر بدء تحدي السلسلة: {reason} |
| 185 | `streak.count` | Streak | Streak | السلسلة |
| 186 | `streak.hint` | Streak | Pick the right answer before the time runs out. One wrong answer ends the run. | اختر الإجابة الصحيحة قبل انتهاء الوقت. إجابة خاطئة واحدة تُنهي الجولة. |
| 187 | `streak.correct` | Streak | Correct! Your streak is {n}. | صحيح! سلسلتك الآن {n}. |
| 188 | `streak.nextFailed` | Streak | Could not load the next question: {reason} Try Next again. | تعذّر تحميل السؤال التالي: {reason} اضغط «السؤال التالي» مرة أخرى. |
| 189 | `streak.end` | Streak | End run | إنهاء الجولة |
| 190 | `streak.endConfirm` | Streak | End the run now? Your streak of {n} is saved to the leaderboard. | إنهاء الجولة الآن؟ ستُحفظ سلسلتك ({n}) في لوحة الصدارة. |
| 191 | `streak.endConfirmNone` | Streak | End the run now? You have no streak yet, so nothing is saved. | إنهاء الجولة الآن؟ ليست لديك سلسلة بعد، لذلك لن يُحفظ شيء. |
| 192 | `run.next` | Streak / Daily | Next question | السؤال التالي |
| 193 | `run.seeResults` | Streak / Daily | See results | عرض النتائج |
| 194 | `run.wrong` | Streak / Daily | Wrong! | خطأ! |
| 195 | `run.rightWas` | Streak / Daily |  The right answer was {letter},  |  الإجابة الصحيحة كانت {letter}،  |
| 196 | `choice.right` | Streak / Daily | , the right answer | ، الإجابة الصحيحة |
| 197 | `choice.yours` | Streak / Daily | , your answer | ، إجابتك |
| 198 | `lb.period` | Leaderboard | Leaderboard period | فترة لوحة الصدارة |
| 199 | `lb.week` | Leaderboard | This week | هذا الأسبوع |
| 200 | `lb.all` | Leaderboard | All time | كل الأوقات |
| 201 | `lb.topAll` | Leaderboard | Top 10 streaks of all time | أفضل 10 سلاسل على الإطلاق |
| 202 | `lb.topWeek` | Leaderboard | Top 10 streaks this week | أفضل 10 سلاسل هذا الأسبوع |
| 203 | `lb.again` | Leaderboard | Play again | العب مرة أخرى |
| 204 | `lb.loading` | Leaderboard | Loading the leaderboard... | جارٍ تحميل لوحة الصدارة... |
| 205 | `lb.headline` | Leaderboard | {name}: {n} in a row! | {name}: {n} على التوالي! |
| 206 | `lb.noStreak` | Leaderboard | No streak this time | لا سلسلة هذه المرة |
| 207 | `lb.saving` | Leaderboard | Saving your streak... | جارٍ حفظ سلسلتك... |
| 208 | `lb.best` | Leaderboard | Your best is still {best}.  | أفضل نتيجة لك ما زالت {best}.  |
| 209 | `lb.rankWeek` | Leaderboard | You are #{week} this week and #{rank} of all time. | ترتيبك #{week} هذا الأسبوع و#{rank} على الإطلاق. |
| 210 | `lb.rank` | Leaderboard | You are #{rank} of all time. | ترتيبك #{rank} على الإطلاق. |
| 211 | `lb.saveFailed` | Leaderboard | Your streak could not be saved: {reason}  | تعذّر حفظ سلسلتك: {reason}  |
| 212 | `lb.onlyOne` | Leaderboard | Only streaks of 1 or more go on the leaderboard. | لا تدخل لوحة الصدارة إلا السلاسل من 1 فأكثر. |
| 213 | `lb.emptyWeek` | Leaderboard | No streaks this week yet. Be the first! | لا توجد سلاسل هذا الأسبوع بعد. كن أول من يسجّل! |
| 214 | `lb.empty` | Leaderboard | No streaks yet. Be the first! | لا توجد سلاسل بعد. كن أول من يسجّل! |
| 215 | `lb.failed` | Leaderboard | Could not load the leaderboard: {reason} | تعذّر تحميل لوحة الصدارة: {reason} |
| 216 | `lb.questions` | Leaderboard | one: {n} question / other: {n} questions | one: سؤال واحد / two: سؤالان / few: {n} أسئلة / many: {n} سؤالًا / other: {n} سؤال |
| 217 | `lb.unsaved` | Leaderboard | Your streak of {n} was not saved. Leave it unsaved? | لم تُحفظ سلسلتك ({n}). هل تغادر دون حفظها؟ |
| 218 | `lb.againFailed` | Leaderboard | Could not start a new run: {reason} | تعذّر بدء جولة جديدة: {reason} |
| 219 | `ad.label` | Leaderboard | Advertisement | إعلان |
| 220 | `daily.name` | Daily | Daily Challenge | التحدي اليومي |
| 221 | `daily.number` | Daily | Daily Challenge #{n} | التحدي اليومي #{n} |
| 222 | `daily.question` | Daily | Question | السؤال |
| 223 | `daily.hint` | Daily | one: Today's {n} question is the same for everyone. A wrong answer or time's up scores 0. / other: Today's {n} questions are the same for everyone. A wrong answer or time's up scores 0. | one: سؤال اليوم هو نفسه للجميع. الإجابة الخاطئة أو انتهاء الوقت تُحتسب 0. / other: أسئلة اليوم ({n}) هي نفسها للجميع. الإجابة الخاطئة أو انتهاء الوقت تُحتسب 0. |
| 224 | `daily.correct` | Daily | Correct! | صحيح! |
| 225 | `daily.seeResult` | Daily | See result | عرض النتيجة |
| 226 | `daily.fix` | Daily | The Daily Challenge cannot start yet. Please fix the errors above. | لا يمكن بدء التحدي اليومي بعد. يُرجى تصحيح الأخطاء أعلاه. |
| 227 | `daily.failed` | Daily | Could not open the Daily Challenge: {reason} | تعذّر فتح التحدي اليومي: {reason} |
| 228 | `daily.leave` | Daily | Leave today's Daily Challenge? The questions you haven't answered score 0, and you can play it only once today. | مغادرة التحدي اليومي؟ الأسئلة التي لم تُجب عنها تُحتسب 0، ولا يمكنك لعبه إلا مرة واحدة اليوم. |
| 229 | `daily.score` | Daily | BrainRush Daily #{n}: {right}/{total} | تحدي BrainRush اليومي #{n}: {right}/{total} |
| 230 | `daily.squareRight` | Daily | Question {n} right | السؤال {n} صحيح |
| 231 | `daily.squareWrong` | Daily | Question {n} wrong | السؤال {n} خطأ |
| 232 | `daily.perfect` | Daily | Perfect!  | نتيجة كاملة!  |
| 233 | `daily.note` | Daily | Everyone gets the same questions today. Share your result and compare with your friends. | الجميع يحصلون اليوم على الأسئلة نفسها. شارك نتيجتك وقارنها بنتائج أصدقائك. |
| 234 | `daily.next` | Daily | Next Daily Challenge in {time} | التحدي اليومي التالي بعد {time} |
| 235 | `daily.ready` | Daily | A new Daily Challenge is ready! | تحدٍّ يومي جديد جاهز! |
| 236 | `daily.playNew` | Daily | Play the new challenge | العب التحدي الجديد |
| 237 | `daily.newFailed` | Daily | Could not load the new Daily Challenge: {reason} | تعذّر تحميل التحدي اليومي الجديد: {reason} |
| 238 | `final.name` | Golden Goal | Golden Goal | الهدف الذهبي |
| 239 | `final.round` | Golden Goal |  – round {n} |  – الجولة {n} |
| 240 | `final.tieBefore` | Golden Goal | It's a tie!  | تعادل!  |
| 241 | `final.tieAfter` | Golden Goal | ? | ؟ |
| 242 | `final.stillBefore` | Golden Goal | Still tied!  | ما زال التعادل قائمًا!  |
| 243 | `final.stillAfter` | Golden Goal |  again? |  مرة أخرى؟ |
| 244 | `final.lead1` | Golden Goal | {names} are tied for first on {score}. One more question decides it: everyone bets, get it right and win your bet, get it wrong and lose it. | التعادل في الصدارة بين {names} برصيد {score}. سؤال واحد إضافي يحسم الأمر: الجميع يراهنون، من يُصِب يربح رهانه ومن يُخطئ يخسره. |
| 245 | `final.lead2` | Golden Goal | {names} are still level on {score}. Round {n} brings a new question, and everyone bets again from their current score. | ما زال التعادل قائمًا بين {names} برصيد {score}. الجولة {n} تأتي بسؤال جديد، ويراهن الجميع من جديد من رصيدهم الحالي. |
| 246 | `final.rule.players` | Golden Goal | Each player can bet from 0 up to their score or {max}, whichever is higher. You see the category before you bet. | يمكن لكل لاعب أن يراهن من 0 حتى رصيده أو {max}، أيهما أعلى. تظهر الفئة قبل الرهان. |
| 247 | `final.rule.teams` | Golden Goal | Each team can bet from 0 up to their score or {max}, whichever is higher. You see the category before you bet. | يمكن لكل فريق أن يراهن من 0 حتى رصيده أو {max}، أيهما أعلى. تظهر الفئة قبل الرهان. |
| 248 | `final.play` | Golden Goal | Go for goal | سدِّد نحو الهدف |
| 249 | `final.skip` | Golden Goal | Skip to results | تخطَّ إلى النتائج |
| 250 | `final.category` | Golden Goal | Category | الفئة |
| 251 | `final.bets` | Golden Goal | Bets | الرهانات |
| 252 | `final.show` | Golden Goal | Show | إظهار |
| 253 | `final.lock` | Golden Goal | Lock in bet | ثبِّت الرهان |
| 254 | `final.allIn` | Golden Goal | All bets are in! | اكتملت كل الرهانات! |
| 255 | `final.open` | Golden Goal | Show the question | اعرض السؤال |
| 256 | `final.betLocked` | Golden Goal | ✓ Bet locked | ✓ تم تثبيت الرهان |
| 257 | `final.yourTurn` | Golden Goal | Your turn | دورك |
| 258 | `final.waiting` | Golden Goal | Waiting | في الانتظار |
| 259 | `final.scoreLabel` | Golden Goal | score  | الرصيد  |
| 260 | `final.ask` | Golden Goal | {name}, what's your bet? | {name}، كم رهانك؟ |
| 261 | `final.betHint` | Golden Goal | Your bet (up to {limit}). Everyone else, look away! | رهانك (حتى {limit}). وعلى الباقين ألا ينظروا! |
| 262 | `final.betError` | Golden Goal | Enter a whole number from 0 to {limit}. | أدخل عددًا صحيحًا من 0 إلى {limit}. |
| 263 | `final.loadFailed` | Golden Goal | Could not load the question: {reason} Try again, or skip to the results. | تعذّر تحميل السؤال: {reason} حاول مرة أخرى، أو تخطَّ إلى النتائج. |
| 264 | `final.hint.players` | Golden Goal | Every player answers, for example on paper. Correct wins their bet, Wrong loses it. Mark each one once. | يجيب كل لاعب، على ورقة مثلًا. «صحيح» يربح رهانه و«خطأ» يخسره. احتسب لكل واحد مرة واحدة. |
| 265 | `final.hint.teams` | Golden Goal | Every team answers, for example on paper. Correct wins their bet, Wrong loses it. Mark each one once. | يجيب كل فريق، على ورقة مثلًا. «صحيح» يربح رهانه و«خطأ» يخسره. احتسب لكل فريق مرة واحدة. |
| 266 | `final.continue` | Golden Goal | Continue | متابعة |
| 267 | `final.correctBtn` | Golden Goal | ✓ Correct | ✓ صحيح |
| 268 | `final.wrongBtn` | Golden Goal | ✗ Wrong | ✗ خطأ |
| 269 | `final.correctLabel` | Golden Goal | Correct for {name}, plus their bet | صحيح لـ{name}، يربح رهانه |
| 270 | `final.wrongLabel` | Golden Goal | Wrong for {name}, minus their bet | خطأ لـ{name}، يخسر رهانه |
| 271 | `final.statusCorrect` | Golden Goal | {name} marked correct, bet {bet}, score {score} | احتُسبت إجابة {name} صحيحة، الرهان {bet}، الرصيد {score} |
| 272 | `final.statusWrong` | Golden Goal | {name} marked wrong, bet {bet}, score {score} | احتُسبت إجابة {name} خاطئة، الرهان {bet}، الرصيد {score} |
| 273 | `final.leave.players` | Golden Goal | Stop Golden Goal and show the results? Players not marked yet keep their score. | إيقاف الهدف الذهبي وعرض النتائج؟ اللاعبون الذين لم تُحتسب إجاباتهم يحتفظون برصيدهم. |
| 274 | `final.leave.teams` | Golden Goal | Stop Golden Goal and show the results? Teams not marked yet keep their score. | إيقاف الهدف الذهبي وعرض النتائج؟ الفرق التي لم تُحتسب إجاباتها تحتفظ برصيدها. |
| 275 | `final.backConfirm` | Golden Goal | Stop Golden Goal and show the results? The bets of this round are dropped and no score changes. | إيقاف الهدف الذهبي وعرض النتائج؟ تُلغى رهانات هذه الجولة ولا يتغير أي رصيد. |
| 276 | `report.title` | Report | Report this question | الإبلاغ عن هذا السؤال |
| 277 | `report.legend` | Report | What is wrong? | ما المشكلة؟ |
| 278 | `report.reason.wrong_answer` | Report | Wrong answer | الإجابة خاطئة |
| 279 | `report.reason.typo` | Report | Typo | خطأ إملائي |
| 280 | `report.reason.translation` | Report | Translation | الترجمة |
| 281 | `report.reason.outdated` | Report | Outdated | معلومة قديمة |
| 282 | `report.reason.picture` | Report | Picture problem | مشكلة في الصورة |
| 283 | `report.reason.other` | Report | Other | سبب آخر |
| 284 | `report.note` | Report | Note (optional) | ملاحظة (اختيارية) |
| 285 | `report.privacy` | Report | Only the question, the reason, your note and the time are saved: no name. | يُحفظ السؤال والسبب وملاحظتك والوقت فقط، دون أي اسم. |
| 286 | `report.send` | Report | Send report | إرسال البلاغ |
| 287 | `report.sending` | Report | Sending... | جارٍ الإرسال... |
| 288 | `report.cancel` | Report | Cancel | إلغاء |
| 289 | `report.thanks` | Report | Thank you! Your report was sent to the admin. | شكرًا لك! أُرسل بلاغك إلى المشرف. |
| 290 | `report.close` | Report | Close | إغلاق |
| 291 | `report.chooseReason` | Report | Choose what is wrong with the question. | اختر المشكلة في السؤال. |
| 292 | `report.noteTooLong` | Report | The note can be at most {max} characters. | يجب ألا يتجاوز عدد أحرف الملاحظة {max}. |
| 293 | `report.failed` | Report | The report could not be sent: {reason} | تعذّر إرسال البلاغ: {reason} |

## Fix loop 1 (BUG-13-01, BUG-13-02, wording suspects of the test report, section 5)

**Changes (Arabic and RTL only; every English table entry is unchanged):**
- **BUG-13-01** (`js/game.30601c74.js`, `updateReportCount()`): the Report note counter is now `ltr(length + ' / ' + REPORT_NOTE_MAX)`. Arabic reads "9 / 200" left to right; in English `ltr()` returns the text unchanged.
- **BUG-13-02** (`js/i18n.js`): the Skip chip's name is the noun **"تخطّي"** (was "تخطٍّ"). The helper confirm now names the helper as a quoted object: `helper.ask` = "هل تستخدم مساعدة «{helper}» لـ{name}؟ ", which is grammatical for all three helpers ("مساعدة «ثلاثة خيارات»", "«تبديل»", "«تخطّي»"). The scoring hint uses the same noun ("½ تخطّي بنصف النقاط"). The Golden Goal button `final.skip` stays the imperative **"تخطَّ إلى النتائج"**. That is the consistent split the tester suggested: the noun names the helper, the verb is the action on a button.
- `timer.reset`: "إعادة" became **"إعادة ضبط"**.
- `final.rule.players` / `final.rule.teams`: the same second sentence for both, **"تظهر الفئة قبل الرهان."** (was "ترى الفئة قبل أن تراهن." / "ترون الفئة قبل الرهان.").
- `share.won`: **"فاز {name} في BrainRush بنتيجة {score}!"**.
- **Number-plus-noun frames** (report item 6), reworded so that any number reads correctly, not only today's values:
  - `entry.tooMany.players`: "الحد الأقصى في وضع اللاعبين هو {limit}. احذف {extra} للمتابعة."
  - `entry.tooMany.teams`: "الحد الأقصى في وضع الفرق هو {limit}. احذف {extra} للمتابعة."
  - `cat.surpriseHint`: "اخترها وحدها لتحصل على فئات عشوائية عددها {n}، أو …"
  - `streak.nameTooLong`: "يجب ألا يتجاوز عدد أحرف اسم المتحدّي {max}"
  - `report.noteTooLong`: "يجب ألا يتجاوز عدد أحرف الملاحظة {max}."
  - The plural tables (`n()`) were already right for every count and are unchanged.
- Not changed, left for the owner's or a native speaker's review (report items 3, 4, 7, 8, 10): `timer.pause`, the Sudden Death name, the maintenance joke, `final.lead1`, the screen-reader-only score labels. BUG-13-03 (`.gitignore` line endings) is not Sprint 13 work and was left alone.
- The inventory below is regenerated from the fixed `js/i18n.js` (still 293 keys, all with Arabic, placeholders checked against English).

**What I ran** (my own `php -S localhost:8013`, never 8000; headless system Chrome via the repo's Playwright; the same scripts as before in `%TEMP%\br-s13-tools`, all writes answered by the scripts):
- `node --check` on `js/i18n.js` and `js/game.30601c74.js`.
- **Arabic flows: 82/82 PASS** (the 77 earlier checks plus 5 new ones):
  - The Reset button reads "إعادة ضبط".
  - With 9 characters typed, the Report counter's text is LRI "9 / 200" PDI, and the measured glyph positions put the "9" left of the "200".
  - Skip on a fresh question: the confirm starts "هل تستخدم مساعدة «تخطّي» لـ" and contains "يخسر".
  - The Golden Goal bet rule ends "أيهما أعلى. تظهر الفئة قبل الرهان.".
  - The Arabic share text starts "فاز " ("فاز ⁨Ahmed⁩ في BrainRush بنتيجة 5! …"); the copied status is still "تم النسخ".
  - The 3-choices confirm now reads "هل تستخدم مساعدة «ثلاثة خيارات» لـ…".
- **Live lookup** of every other reworded string in an Arabic page (`entry.tooMany.*`, `cat.surpriseHint` as shown in the setup tile, `streak.nameTooLong`, `report.noteTooLong`, `final.rule.teams`, `scoring.hint`): all show the new text with their numbers filled in.
- **English regression:**
  - The interactive check is **33/33 PASS**, with exact original wording.
  - All 42 English renders (21 screens at 1366x768 and 375x812): the text dump outside the header (including the report counter "0 / 200" and the aria/title texts) is **identical** to the pre-sprint baseline. Header height, page width and height are identical. No JS error.
- **Arabic layout:** 63 renders (1366x768, 375x812, 1920x1080): no JS error, no horizontal overflow, and no screen is taller than before the fix.
- **Data:** a fresh snapshot was taken before these runs. Afterwards the dump of `settings`, `point_values`, `streaks`, `question_reports`, `daily_challenge` and `question_stats` is identical, as are the `questions`/`categories` counts and every `AUTO_INCREMENT`. The 7 log files are byte-identical, with no new file. Nothing was written.
- My port-8013 server is stopped; MariaDB is still running for the owner's localhost:8000.
- `js/i18n.js`, `js/game.30601c74.js` and this note are CRLF (0 LF-only lines).

## Change request: Arabic category names (2026-11-09)

Owner request: show the category names in Arabic when the interface is Arabic, Gen Z style for the fun categories. Owner decisions: stored in the database as a new nullable `categories.name_ar` column, editable in Admin, so a new category is translated without code.

**What it does**
- **Game:** in Arabic, every place that shows a category name uses its Arabic name: Setup tiles, board column headers (and the cells' screen-reader labels), the question heading, the "Swapped from …" note and the small swapped-to label on a closed cell, the Kilo Meshakkal heading ("كيلو مشكّل: تاريخ – 100"), Golden Goal (bet screen and question heading), Streak and Daily Challenge headings, and the Report form's label. A category without an Arabic name shows its English name. Results and Share show no category name, so they are unchanged. English is unchanged.
- **Only the label changes.** Ids, ticks, column order, Surprise me ("?" until opened, then the Arabic name), the game log and the played count use ids as before. The Arabic name is stored next to the English one in the saved game (`nameAr`, `catNameAr`, `category_name_ar`), so a live EN / عربي switch redraws it without a request. Saved-game versions are unchanged (still 4, Streak 1, Daily 1): the new fields are optional, and a game, run or Daily saved before this change loads and shows the English names in Arabic (checked).
- **Kilo Meshakkal** has no DB row, so its Arabic name "كيلو مشكّل" is one entry in `js/i18n.js` (`cat.mixName`; English "Kilo Meshakkal", so English is byte-identical). The owner can set it back to the Latin name there.
- **Bidi:** names stay FSI-isolated (`iso()`); the swapped-to label keeps `dir="auto"`.
- **Setup tile order** stays the API's order (by English name) in both languages, so ticks and tiles don't move on a language switch. In Arabic the list therefore isn't alphabetical.
- **Admin** (stays English): the add form has an **Arabic name (optional)** field (`dir="rtl" lang="ar"`, max 100) with a one-line hint; the table has an **Arabic name** column ("-" when none); **Rename** edits both names (Enter saves, Escape cancels). When only the Arabic name changes, the message reads "Arabic name of "X" saved.".
- **API:** `api/categories.php` returns `name_ar` (null when none). POST and PUT accept it (optional; trimmed; at most 100 characters; one line; empty or null clears it). A PUT without `name_ar` keeps the current one, so an older client never wipes it. Public payloads: board columns `name_ar` (Kilo Meshakkal `null`), Kilo Meshakkal cells `category_name_ar`, the Swap/Golden Goal draw `category.name_ar`, and Streak and Daily questions `category_name_ar`. No fallback for a missing column: the migration runs first (deploy guide).

**Arabic names (for owner review)**

| English | Arabic | Note |
|---|---|---|
| Gen Z | جيل زد | How Arab youth write "Gen Z" |
| AI | الـAI | Egyptian youth write the English acronym with "الـ"; MSA alternative: ذكاء اصطناعي |
| Egyptians | إحنا المصريين | "Us Egyptians", Egyptian dialect |
| Food & Drink | أكل وشرب | Everyday Egyptian, short |
| Cartoons & Childhood | كرتون زمان | "Old-days cartoons", the nostalgic phrase |
| Who Am I? | أنا مين؟ | Egyptian dialect for "Who am I?" |
| Geography | جغرافيا | MSA |
| Science | علوم | MSA |
| History | تاريخ | MSA |
| Sports | رياضة | MSA |
| Movies | أفلام | MSA |
| Technology | تكنولوجيا | MSA |
| Flags | أعلام | MSA |
| Landmarks | معالم | MSA |
| Kilo Meshakkal (built in) | كيلو مشكّل | The name itself in Arabic script (`js/i18n.js`) |

**Files**
- **New:** `sql/migrate-add-category-name-ar.sql` (idempotent `ADD COLUMN IF NOT EXISTS name_ar VARCHAR(100) NULL AFTER name`; must run on live **before** the code), `sql/add-category-arabic-names.sql` (idempotent; matched by English name; fills only empty `name_ar`, so Admin edits are never overwritten).
- **Changed:** `sql/schema.sql`, `sql/schema-hosted.sql` (the column, for new installs); `api/categories.php`, `api/questions.php`, `api/daily.php`; `js/game.30601c74.js` (`localName()`, `columnName()`, `finalCategoryName()`, `runHeading()`; parse/validate the optional Arabic fields); `js/i18n.js` (`cat.mixName`); `admin.html`, `js/admin.15ab8dd0.js`; `README.md` (item 11, Admin Categories, deploy line), `docs/spec.md` (data model), `docs/deploy-hostinger.md` (new Sprint 13 entry: migration, names file, upload list, smoke check). `how-to-play.html` and `llms.txt` do not mention category names, so they are unchanged. No CSS change was needed.
- **New files to `git add`:** the two SQL files (and `js/i18n.js` as before).

**What I ran**
- Local DB (owner's MariaDB): backed up `categories` (`mysqldump` to `%TEMP%\br-cr-catar\categories-backup.sql`), then ran the migration **twice** and the names file **twice** (idempotent: no error, same result). Only the column and the 14 values were added; `questions` checksum and `categories` AUTO_INCREMENT (50) are unchanged.
- `php -l` on the three PHP files: no errors. `node --check` on `js/game.*.js`, `js/i18n.js`, `js/admin.*.js`.
- curl on my own `php -S localhost:8016` (never 8000): `categories.php?playable=1`, board POST with Kilo Meshakkal, `random=1`, `streak=1` all carry the Arabic names. Daily tested from the CLI with `DAILY_INCLUDE_ONLY` on an existing day (2026-11-03), so no new `daily_challenge` row. Admin writes on a temporary category: create with an Arabic name (trimmed, UTF-8 checked with `HEX()`), a PUT without `name_ar` keeps it, change, clear with `""` and `null`, non-text 400, 101 characters 400, 100 accepted, a newline 400, duplicate name 409, SQL-looking text stored as text. Then deleted, and AUTO_INCREMENT set back to 50.
- Headless Chrome (repo Playwright, scripts in `%TEMP%\br-cr-catar`; game log, stats, reports, streak saves, daily and admin writes were answered by the scripts): **75/75 PASS**. English tiles, headers, cell label and Kilo Meshakkal heading unchanged. Arabic tiles, headers, cell and mix labels, question heading, live switch EN/AR (setup ticks kept, mid-question, board swapped-to label), Swap (heading, swapped-from note, Report label, board label), Kilo Meshakkal heading, reload, an old save without the Arabic fields, Surprise me, Streak, Daily (with and without `category_name_ar`) including the Report label, Golden Goal (bets, switch, question heading, old save fallback), Admin (field attributes, column, rename row, POST/PUT bodies). No JS error anywhere.
- **Layout (D-30):** 6-column board with the longest Arabic names, Arabic vs English: 1366x768 and 1920x1080 fit one screen as in English, with no clipped header. The Arabic header row is lower than the English one (61 vs 71 px; 44 vs 74 px at 375x812), and the 375x812 page is 30 px shorter than in English. No horizontal overflow. Screenshots reviewed (setup 375, board 1366/375, Kilo Meshakkal question, Admin rename).
- **Data restored / untouched:** dump of `settings`, `point_values`, `streaks`, `question_reports`, `daily_challenge`, `question_stats` and `categories` identical before and after the test runs; the `logs/*.log` files are byte-identical. My port-8016 server is stopped; MariaDB is still running for the owner's localhost:8000.
- All changed and new files are CRLF.

**Gaps / limitations**
- The Gen Z names are my picks and need the owner's review (table above).
- The Admin page itself was not checked at 375 px (the add form's two fields share one row).
- Error messages sent by the server still use the English category name (for example "Category "X" is missing questions…").
- The Admin question list, reports and game logs keep the English names (Admin stays English).

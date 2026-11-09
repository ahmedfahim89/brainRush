# Sprint 13 test report: Arabic interface (US-49)

Tester: Senior Tester agent, 2026-11-09. Branch `sprint-13` (uncommitted work). No application code was modified, nothing committed, pushed or stashed.

## Summary

- **Environment:** Windows 11, PHP 8.0 (XAMPP) `php -S localhost:8014` (my own; the owner's 8000 was not used), MariaDB running, system Chrome through the project's Playwright (headless). Scripts and screenshots are in `%TEMP%\t13` (outside the repo).
- **English regression baseline:** `git archive HEAD` extracted to a temp dir and served by a small static server on 8015 (API proxied to my 8014). No stash, no checkout.
- **Data safety:** every write endpoint (`game-log`, `question-stats`, `streaks` POST, `reports` POST, `daily.php` GET) was answered by the test scripts; only read-only calls reached the server. One stray script (a zoom screenshot helper without the stubs) did write one line to a new `logs/game-2026-11-09.log`; I deleted that file. Final check: the 7 original log files are md5-identical to before, no new log file, leaderboard unchanged. My two servers were stopped. MariaDB was left running.
- **Counts:** PASS 29 of 29 checks (rows below), FAIL 0 blocking, 2 Minor bugs open (BUG-13-01, BUG-13-02), 3 observations; PENDING (not testable here) 3.
- **Verdict: READY FOR PO** (with two Minor defects that the owner may accept or have fixed, and the Arabic wording review in section 5).

## 1. Acceptance criteria and DoD

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | EN / AR switch in the header changes every label, message, button on Setup, Board, Question, Results, Streak (and Helpers, Daily, Golden Goal, Report, Leaderboard) | PASS | Live switch EN to AR and back on 27 states (setup, setup errors, streak setup and name error, streak question and answered, leaderboard, Daily question and result, board, question, after 3 choices, answer shown, marked, board again, Golden Goal offer, wagers, bet error, partial bets, all in, GG question, GG marked, after GG, Results). In each: `dir=rtl`, zero English UI words left (scan of visible text, `aria-label`, `title`, `placeholder`, `alt`, screen-reader text against the vocabulary of the English table), and the EN round trip is identical to the state before. Plus fresh AR loads of 3 viewports x 3 scenarios. |
| 2 | No leftover English except the documented deliberate ones | PASS | Remaining Latin text in AR screens is only data (names, category names incl. Kilo Meshakkal, questions), "BrainRush", "Jeopardy" (setup intro), "EN"/"English", ABC chip and A/B/C letters, footer copyright, `Photo:` credit, `<title>`/meta. Static grep of `js/game.*.js`: no visible string literal outside `t()`/`tn()` (only the never-shown internal error "The saved run has no question."). `i18n.js`: 293 EN keys, 293 AR keys, none missing or extra. |
| 3 | Choice remembered after refresh | PASS | Click AR, key `brainrush.lang=ar`, reload: still RTL and Arabic. Click EN removes the key. Bad value `fr` falls back to English. `i18n.js` is a `<head>` script, so `lang`/`dir` are set before body parsing. |
| 4 | AR is right to left, mirrored | PASS | `lang=ar dir=rtl`; board, scoreboard (the plus and minus buttons swap sides, see OBS-1), question layout, Report/speaker corner, timer, score rows, results rows, bet cards, Streak head, leaderboard tabs reviewed in screenshots at 3 viewports. English keeps `lang=en` and no `dir` attribute. |
| 5 | Mixed Latin/Arabic names and numbers correct (scoreboard, Results, scoring rows, bets, Golden Goal, share) | PASS | Glyph positions measured (Range rects): "Team Red!" and "Ahmed أحمد" read left to right inside the isolate on board, scoring rows, results, GG offer, wagers, bet list and results winner; Arabic-only names stay RTL. Minus is left of its digits for "−200", "−300", "(−100)" on board, scoring rows, results; "+200"/"+100" left of digits in the double-score popup and Correct button (zoomed 3x screenshot confirms). Exception: BUG-13-01. |
| 6 | D-30 layouts in AR at 1366x768 | PASS | 6x5 and 6x6 board (the 6th row simulated by a stubbed board response) with 6 contestants, Question (Arabic, swapped, double, 3 choices), Streak, Daily, Golden Goal offer/wagers/question: page height equals the viewport (768) exactly as in English. Results with 6 contestants is 858 px in both languages (same as HEAD). |
| 7 | D-30 layouts in AR at 1920x1080 | PASS | Every screen above is 1080/1080, identical to English. |
| 8 | D-30 layouts in AR at 375x812 | PASS | No horizontal overflow on any screen. AR is never taller than EN except the leaderboard (OBS-2). Board 6x6 with 6 contestants: 930 px in both languages (scrolls, as in English). Question 1610 vs 1610, swapped 1678 vs 1682, GG question 1106 vs 1128, Streak 912 vs 940, Daily 912 vs 954. |
| 9 | Saved game and open question restored in AR | PASS | Reload on the open question in AR: question screen, Arabic text, Arabic buttons restored. Reload on the board: restored in AR. Reload on the Golden Goal offer in AR: restored. |
| 10 | Question without Arabic: English, no error | PASS | Board response stubbed with no Arabic for category AI, interface in AR: English text, `lang-btn` hidden, no error message, text `dir=ltr`, 3 choices and answer in English. |
| 11 | Questions show Arabic first | PASS | The Arabic question opens in Arabic in both interface languages; its language button still works in AR. |
| 12 | Helpers in AR | PASS | 3 choices (confirm text, "only X can answer" locks, used chip), Swap ("بدلًا من ..." note, swapped cell label), Skip (confirm with the half points), blocked reasons ("غير متاحة بعد عرض الإجابة", "وحده ... يمكنه ..."). |
| 13 | Double score in AR | PASS | Popup title/text/button, question tag, Correct button "(+200)" and aria label "(نقاط مضاعفة)". |
| 14 | Streak in AR | PASS | Setup, name error, panel, correct and wrong feedback, leaderboard headline, rank line, week/all tabs and aria label, plural question counts, dates in Arabic months. |
| 15 | Daily in AR | PASS | Panel, hint, answered state, result line and squares, share, reload shows the same result, "play again same day" screen. |
| 16 | Golden Goal in AR | PASS | Offer (6 and 3 contestants), rules, wagers, bet error, a bet typed as "٥" accepted, partial bets, all in, question, scoring, back to results. Typed bet "12" survives a switch. |
| 17 | Report in AR | PASS | Form, missing-reason error, sent (stubbed), thanks, close. The overlay is inert so the switch cannot be clicked while it is open (documented). A server answer in the wrong shape shows the Arabic "unexpected response" text. |
| 18 | Switching language mid-game | PASS | Mid-question EN to AR: timer 28 to 27 (not reset), same question, language button label unchanged, question language toggle works. Setup: typed names and ticked category kept, error re-translated. Board: info line and cell labels re-translated. Network error on Setup re-shown in the new language, Try again recovers. |
| 19 | Share text | PASS | AR clipboard text: "الفوز في BrainRush لـ...؟ بنتيجة 100! ... −100." plus the site link; status "تم النسخ". EN text and "Copied" unchanged. Contains invisible bidi marks (known, documented). |
| 20 | Settings-driven screens in AR | PASS | Maintenance overlay text, "played questions" panel and reset button, read-aloud field, load error all translated; the admin banner text stays as typed (data). |
| 21 | No console errors | PASS | 0 page errors and 0 console errors in all runs (the only message is the browser's own network failure line when I aborted a request on purpose). |
| 22 | No innerHTML built from data | PASS | `grep innerHTML/insertAdjacentHTML/outerHTML` in `js/game.*.js`, `js/i18n.js`, `js/share.*.js`: only two comments. |
| 23 | English regression: text and layout unchanged vs committed HEAD | PASS | Same deterministic scenarios (seeded `Math.random`, recorded API answers) on HEAD (via `git archive`) and the working tree, English, 1366x768 and 375x812: 22 + 12 + 15 steps per viewport. Visible text, every `aria-label`/`title`/`placeholder`/`alt`, bounding boxes of header, board, cells, scoreboard, rows, question layout, results, Golden Goal, Streak, Daily, footer, popups; page width and height; confirm dialog texts; share status; posted request bodies: all identical. Only differences: a collapsed HTML newline in the scoring hint and the 💀 emoji now in its own span (same rendering), plus ordering/timing of the leaderboard load. Also 6x6 board runs at 1366, 1920, 375 (HEAD vs working tree identical). |
| 24 | Other pages stay English/LTR with AR chosen | PASS | how-to-play, terms, privacy, about, contact, admin: `lang=en`, no `dir`. |
| 25 | CRLF line endings | PASS | Byte count of LF-only lines is 0 in `js/i18n.js`, `js/game.*.js`, `js/share.*.js`, `css/style.*.css`, `index.html`, `how-to-play.html`, `privacy.html`, `README.md`, `llms.txt`, `docs/spec.md`, `docs/sprints/sprint-13-dev.md`. Exception: `.gitignore` (BUG-13-03, not a sprint 13 change). |
| 26 | README / how-to-play / llms / privacy / spec edits accurate | PASS | README item 11, the guide line, the llms line, the privacy sentence (language saved only in the browser) and the spec file list were checked against the tested behaviour (key name, English removes the key, timer keeps running, typed names and bets stay, Share in the interface language, pages that stay English). |
| 27 | `git diff --stat` shows only intended files | PASS (with note) | Modified: README, spec, how-to-play, index, game js, share js, css, llms, privacy; new: `js/i18n.js`, the dev note. Also in the working tree but **not part of Sprint 13** (dated 2026-10-25 to 2026-11-01): `.gitignore` (adds `node_modules/`), `package.json`, `package-lock.json`, `.claude/launch.json`, `googlebbe9a71d60b82d1a.html`. Do not `git add -A` blindly. `js/i18n.js` must be `git add`-ed before the commit so the hook can hash it. No PHP, SQL, `sw.js`, admin or guide page other than the one line was touched. |
| 28 | Static checks | PASS | `node --check` on the 3 JS files; no PHP changed (no `php -l` needed); no credentials in the diff; `api/config.php` is ignored; no hard-coded board sizes or point lists in the JS; saved game version unchanged (no migration needed). |
| 29 | DoD: string inventory, English unchanged, no migration | PASS | Inventory of 293 strings in the dev note plus the "left in English" table, all confirmed; see rows 2, 23, 28. |

PENDING (environment): (a) a real browser-language Arabic OS/voices check of read aloud in AR; (b) real device (phone, Android app wrapper) rendering of Arabic fonts; (c) the owner's or an Arabic speaker's review of the strings (section 5). None blocks the PO.

## 2. Bugs

### BUG-13-01 (Minor): report note counter reads "200 / N" in Arabic
- **Steps:** AR, open any question, click Report, type 9 characters in the note.
- **Expected:** the counter reads as in English, "9 / 200" (count first), or both numbers isolated left to right.
- **Actual:** `js/game.30601c74.js:4615`, `dom.reportCount.textContent = length + ' / ' + REPORT_NOTE_MAX;` is plain concatenation. The spaces around "/" are neutral characters, so in an RTL page the order flips and it displays "200 / 9" (seen in the screenshot of the form). English is correct.
- **Fix hint:** wrap in `ltr()` (`ltr(length + ' / ' + REPORT_NOTE_MAX)`).

### BUG-13-02 (Minor): ungrammatical Arabic in the Skip confirm
- **Steps:** AR, open a question, click the half-points chip for a contestant.
- **Expected:** a grammatical question.
- **Actual:** "هل تستخدم تخطٍّ لـTeam A؟" ("Use Skip for Team A?"): after the verb the noun should be accusative; the chip name `helper.skip` = "تخطٍّ" (tanween kasra, nominal form) does not fit in that frame. Same issue for `helper.ask` with the other chips is acceptable ("ثلاثة خيارات", "تبديل"). Suggested `helper.skip` = "تخطّي" or "تجاوز", and check the frame `helper.ask` ("هل تستخدم {helper} لـ{name}؟"). Single table entries in `js/i18n.js`.

### BUG-13-03 (Minor, process, not from this sprint): `.gitignore` has mixed line endings
- `.gitignore` has 17 CRLF lines and 3 LF-only lines (the three lines added on 2026-11-01 for `node_modules/`). Git warns "LF will be replaced by CRLF". Harmless, but the repo rule is CRLF. This change is not Sprint 13 work and is uncommitted; decide whether to commit it with this sprint.

## 3. Observations (no action required)
- **OBS-1** On the scoreboard card the minus button is on the right and plus on the left in AR (a plain mirror of the English order). Numbers and signs themselves are LTR. A design choice for the owner.
- **OBS-2** AR leaderboard on a 375x812 phone with 3 rows is 55 px taller than English (867 vs 812, the rank sentence wraps one more line), so it scrolls where English just fits. With a full top 10 both scroll. The Leaderboard is not one of the D-30 one-screen views.
- **OBS-3** In AR a streak/daily "wrong" sentence keeps the Latin choice letter ("كانت A،") by design (A/B/C letters are documented symbols). The no-Arabic question text is left aligned inside the RTL page (it is English, `dir=ltr`), which is correct.

## 4. Static check results
| Check | Result |
|---|---|
| `node --check` (i18n, game, share) | PASS |
| innerHTML with data | none |
| String-concatenated SQL | n/a, no PHP touched |
| Hard-coded board sizes | none in JS (board size comes from the API) |
| Credentials outside `api/config.php` | none; `api/config.php` is in `.gitignore` and untracked |
| Table completeness | 293 EN = 293 AR keys |
| Physical left/right CSS rules without an RTL twin | none found that matter; only the decorative new-banner shine animation (`left` keyframes) is unmirrored |

## 5. Arabic wording: suspect strings (AI-drafted, needs a native review)
Overall the Arabic is correct and natural; these are the ones I would look at.
1. `helper.skip` "تخطٍّ" and the frame in `helper.ask`/`final.skip` "تخطَّ إلى النتائج": inconsistent forms of the same word (noun with tanween vs imperative). Prefer one: "تخطّي" for the chip and "تخطَّ" for the button. See BUG-13-02.
2. `timer.reset` "إعادة" alone means "repeat/again"; "إعادة ضبط" is clearer next to "إيقاف مؤقت".
3. `timer.pause` "إيقاف مؤقت" is fine but reads like a noun label ("temporary stop"); "إيقاف مؤقت" is standard, keep unless the owner prefers "إيقاف".
4. `streak.openBtn` "سلسلة الموت المفاجئ": literal but understandable; the owner already noted the English names could stay (dev note).
5. `final.rule.players` ("ترى الفئة قبل أن تراهن") vs `final.rule.teams` ("ترون الفئة قبل الرهان"): different phrasing for the same sentence; harmonise.
6. Plural frames with a digit: `entry.tooMany.*` "بـ{limit} لاعبين", `cat.surpriseHint` "{n} فئات", `streak.nameTooLong` "{max} حرفًا", `report.noteTooLong` "{max} حرف": correct for the current values (3-10, 30, 200); a limit of 1, 2 or 11+ would need other forms. Fine today.
7. `maintenance.text` "المساكين" ("the poor ones") keeps the joke of the English text; check the tone with the owner.
8. `final.lead1` "من يُصِب يربح رهانه ومن يُخطئ يخسره": correct but a little literary for a party game; "من يجب بشكل صحيح..." is plainer. Optional.
9. `share.won` "الفوز في BrainRush لـ{name} بنتيجة {score}!": a noun phrase, understandable; "فاز {name} في BrainRush بنتيجة {score}!" would be closer to the English and to everyday chat.
10. `score.correctLabel`/`score.wrongLabel` ("زائد/ناقص {n} نقطة") are for screen readers only; fine.

## 6. Verdict

**READY FOR PO.** Every acceptance criterion and the Sprint 13 DoD pass in my own runs; English is pixel-position and text identical to the committed HEAD; Arabic fits every D-30 layout at the three sizes; there are no console errors. Two Minor defects (BUG-13-01 counter direction, BUG-13-02 Skip wording) and the native-speaker wording review remain; none blocks acceptance. Before committing: `git add js/i18n.js`, and leave out the unrelated untracked/modified files listed in row 27.

## 7. Re-test (fix loop 1)

**Environment:** PHP 8.0 (`php -S localhost:8014`, my own server; the committed HEAD was extracted with `git archive` into a temp dir and served on 8015 with its `/api/` calls forwarded to 8014), MariaDB running, system Chrome through the repo's Playwright, 1366x768 and 375x812. Branch `sprint-13` untouched (no stash, checkout, commit or code change). `InternalUse/` and `api/config.php` not touched. Scripts and screenshots are in `%TEMP%\br-s13-rt` (outside the repo).

| # | Check | Result | Evidence |
|---|---|---|---|
| R1 | BUG-13-01: Report counter reads "N / 200" left to right in AR | PASS | `js/game.30601c74.js:4615` is `ltr(length + ' / ' + REPORT_NOTE_MAX)`. With 9 characters typed, the text is LRI "9 / 200" PDI and the measured glyph positions put the "9" left of the "200" (1366 and 375). Screenshot `ar375-report.png` shows "9 / 200". |
| R2 | Counter unchanged in EN | PASS | EN working tree shows "0 / 200"-style text identical to HEAD (report-screen text, attributes and layout compared; only the random question and the timer tick differ). |
| R3 | BUG-13-02: Skip confirm grammatical | PASS | Real dialog: "هل تستخدم مساعدة «تخطّي» لـTeam A؟ يخسر Team A 50 نقطة (نصف 100) ويُغلق السؤال للجميع." |
| R4 | helper.skip / helper.ask / final.skip consistent | PASS | Chip name/aria/title "تخطّي"; 3-choices confirm "مساعدة «ثلاثة خيارات»", swap "مساعدة «تبديل»"; scoring hint "½ تخطّي بنصف النقاط"; Golden Goal button (imperative) "تخطَّ إلى النتائج". Noun for the helper, verb for the button, as proposed. |
| R5 | timer.reset | PASS | Button reads "إعادة ضبط"; EN "Reset" unchanged. |
| R6 | final.rule.players / teams | PASS | Players rule rendered: "...أو 500، أيهما أعلى. تظهر الفئة قبل الرهان." Teams rule has the identical second sentence (table check and `t()`). |
| R7 | share.won | PASS | Copied text: "فاز ⁨Team A⁩ في BrainRush بنتيجة ⁦100⁩! ⁨Team B⁩ ⁦0⁩." + link. Tie text unchanged. EN share text identical to HEAD. |
| R8 | entry.tooMany.* | PASS | Teams, rendered live: "الحد الأقصى في وضع الفرق هو 4. احذف 2 للمتابعة." (6 entries switched to Teams). Players text checked through `t()` (the Players-mode message cannot be triggered: the limit is the add-button cap): "الحد الأقصى في وضع اللاعبين هو 6. احذف 2 للمتابعة." Layout fine at 375 (screenshot `ar375-setupErrTeams.png`). |
| R9 | cat.surpriseHint | PASS | Live in the setup tile: "اخترها وحدها لتحصل على فئات عشوائية عددها 3، أو أضفها إلى اختياراتك لتحصل على فئة غامضة واحدة." |
| R10 | streak.nameTooLong | PASS (via lookup) | The input has `maxlength` 30, so the error cannot be shown through the UI (a 40-character entry is cut to 30 and starts the run, as in English). `t()` gives "يجب ألا يتجاوز عدد أحرف اسم المتحدّي 30". |
| R11 | report.noteTooLong | PASS (via lookup) | The note has `maxlength` 200, so also unreachable in the UI. `t()` gives "يجب ألا يتجاوز عدد أحرف الملاحظة 200." |
| R12 | No layout regression in AR, 1366x768 and 375x812 | PASS | No horizontal overflow on any of the 10 screens (setup, streak block, setup errors Players/Teams, board, question, Report form, Golden Goal offer, tie results, winner results). Page heights: equal to EN or smaller on all but two 375-wide screens (setup 2514 vs 2492, +22 px, the setup screen has no D-30 one-screen rule); board/final/results exactly 768 / 812 as EN. Header 78 / 101 px unchanged. Screenshots reviewed (Report form, Golden Goal offer, setup errors). |
| R13 | English identical to HEAD | PASS | Same scenario on HEAD (`git archive`) and the working tree in EN at both sizes: visible text, every aria-label/title/placeholder, page width/height, header height, confirm dialogs, helper chip labels, scoring hint, Golden Goal rule, share texts, Reset label, entry limit message: all identical on the 10 screens. Only differences: the random question and one timer tick. |
| R14 | 293 EN / AR keys, placeholders intact | PASS | `STRINGS.en` 293, `STRINGS.ar` 293, none missing or extra; every `{placeholder}` of every English entry (plural forms included) appears in the Arabic one, no extras. |
| R15 | No console errors | PASS | 0 page errors and 0 console errors in all six scenario runs (AR, EN, HEAD x 2 sizes). `node --check` on `js/i18n.js` and `js/game.*.js` passes. |
| R16 | CRLF intact | PASS | 0 LF-only lines in `js/i18n.js`, `js/game.30601c74.js`, `js/share.28bcd18c.js`, `css/style.4a59deab.css`, `index.html`, the dev note. |

**Counts:** 16 PASS, 0 FAIL, 0 PENDING. BUG-13-01 and BUG-13-02: **FIXED / verified**. BUG-13-03 (`.gitignore` mixed line endings) is not Sprint 13 work and stays open as a process note.

**Observations:** (a) "احذف 2 للمتابعة" (remove 2 to continue) is grammatical, a native review could prefer "احذف اثنين". (b) The sections 5 items not touched by the developer (timer.pause, Sudden Death name, maintenance joke, final.lead1, screen-reader labels) remain for the owner's native review.

**Test side effect (my fault, stated for the owner):** the HEAD copy's page loaded my 8014 API through a catch-all route that overrode my write stubs, so the four HEAD games sent real writes to the local database: four `question-stats` increments and four lines in a new `logs/game-2026-11-09.log`. I deleted that new log file (the other 7 logs are byte-identical to before). I cannot undo the stats without database access (I did not use `api/config.php`). Rows now differing from the pre-test snapshot: question 363 (correct 1), 364 (nobody 1), 715 (nobody 1) are new, and 365 went from correct 1 to 2. To restore, run on the local DB: `DELETE FROM question_stats WHERE question_id IN (363,364,715); UPDATE question_stats SET correct = 1 WHERE question_id = 365;`. The AR and working-tree EN runs wrote nothing (stubs applied). Servers on 8014 and 8015 are stopped.

## 8. Verdict after fix loop 1

**READY FOR PO.** Both bugs are fixed and verified; the reworded strings render correctly in Arabic with real values; English is identical to HEAD; no regressions or console errors.

## PO acceptance

PO, 2026-11-09. **US-49 Arabic interface: ACCEPTED**, pending the owner's local Chrome check and commit (FU-47) and the hosted and device steps (FU-49).

| Acceptance criterion / DoD | Verdict | Basis |
|---|---|---|
| EN / AR switch changes every label, message and button on Setup, Board, Question, Results and Streak; choice remembered on the device | Met | Rows 1-3, 12-20; R13 |
| AR is right to left, questions show in Arabic first, D-30 layouts fit 1366x768 and 375x812 | Met | Rows 4, 6-8, 11; R12. The 375 px Setup is 22 px taller than English; Setup is not a D-30 one-screen view (D-59 f, FU-50) |
| A question without Arabic shows English with no error | Met | Row 10 |
| Names and numbers show correctly in AR | Met | Row 5; BUG-13-01 fixed (R1, R2) |
| DoD: string inventory, every item translated or left in English with a reason | Met | Dev note inventory (293 keys) and "Deliberately left in English" table; rows 2, 29; R14 |
| DoD: English behaviour and layouts unchanged | Met | Row 23; R13 |
| DoD: no migration, saved-game version unchanged | Met | Row 28; the language is not in the saved game (D-59 e) |
| Global DoD: no `innerHTML` from data, no secrets, CRLF, no console errors | Met | Rows 21, 22, 25, 28; R15, R16 |

Decisions recorded in `docs/product-backlog.md`: D-58 (AI-drafted Arabic accepted pending native review; game terms translated; Western digits), D-59 (server error texts and category names stay English; no browser-language auto-detect; other pages stay English; accepted observations), D-60 (new screens, starting with the Sprint 12 custom category, must be bilingual). Follow-ups FU-47 to FU-52: local Chrome check and commit, native string review (including `timer.pause`, the Sudden Death name, the maintenance joke, `final.lead1`, the screen-reader labels and "احذف 2"), hosted deploy with real-device Arabic font and read-aloud voice, the 375 px Setup height (informational), BUG-13-03 `.gitignore` line endings, and the local `question_stats` side effect of the re-test.

## 9. Category Arabic names CR

Tester: Senior Tester agent, 2026-11-09, on top of Sprint 13 (branch `sprint-13`, uncommitted). No application code changed, nothing committed, stashed or checked out. `InternalUse/` and `api/config.php` not touched or printed.

**Environment:** PHP 8.0 (XAMPP) `php -S localhost:8017` (my own; not 8000), the owner's local MariaDB, system Chrome through the repo's Playwright (headless). The committed HEAD was extracted with `git archive` into a temp dir and served by a read-only static server on 8018 (GET only; POST answers 405). Every `/api/` call from the HEAD page and from the working-tree page was answered from recorded fixtures inside the test script, so no write could reach any server. Scripts and screenshots are in `%TEMP%\t17` (outside the repo).

**Data safety:** before and after the runs, `CHECKSUM TABLE` of `question_stats`, `settings`, `streaks`, `question_reports`, `daily_challenge`, `categories`, `questions`, `point_values` is identical, and the 8 `logs/*.log` files are md5-identical. The only DB writes were my own temporary category "Team A Temp" (created and deleted through the API and the Admin UI), after which `categories` AUTO_INCREMENT was set back to 50 (14 rows). The idempotency test of the SQL files ran on a throwaway database `br_t17` (dropped afterwards), not on the owner's data. Servers on 8017 and 8018 are stopped.

**Counts:** PASS 20 of 20 checks (rows C1 to C20), FAIL 0, PENDING 1 part (Admin at 375 px, not requested and not run); 1 Minor wording bug (BUG-13-04), 4 observations.

| # | Check | Result | Evidence |
|---|---|---|---|
| C1 | Local DB has `categories.name_ar` and the 14 names | PASS | `SHOW COLUMNS`: `name_ar varchar(100) NULL` after `name`; 14 rows, none empty; the hex of every stored value equals the UTF-8 bytes of the literal in `sql/add-category-arabic-names.sql` (14 of 14, 0 mismatches). |
| C2 | Migration idempotent | PASS | On a scratch DB with the old `categories` table: `sql/migrate-add-category-name-ar.sql` run twice, no error, one `name_ar` column. |
| C3 | Names SQL idempotent, matched by name, never overwrites | PASS | Run twice on the scratch DB: Geography and Who Am I? filled; a category not in the file ("Custom X") stays NULL; a name set by hand ("AI") is kept; `gen z` (different case) matches under the `_ci` collation. |
| C4 | `categories.php` returns `name_ar` | PASS | `GET ?playable=1`: 14 entries, each with its Arabic name; `GET` without filter: 14 of 14 non-null. |
| C5 | POST/PUT validation and UTF-8 | PASS | POST with surrounding spaces stored trimmed (201, exact string back, UTF-8 round trip through the API and DB, sent from Node because the Windows shell mangles non-ASCII curl arguments). Validation: number 400 "must be text", 101 characters 400, 100 accepted, line break 400, whitespace-only and `""` and `null` clear it (200, `null`), duplicate English name 409, unknown id 404, missing name 400, SQL-looking text stored as text and the table untouched. |
| C6 | PUT without `name_ar` keeps it | PASS | PUT `{name}` only: `name_ar` unchanged; PUT with a new `name_ar` changes it. |
| C7 | Board/random/streak/daily payloads | PASS | `?board=1` (POST and GET): column `name_ar` for each real category, Kilo Meshakkal column `name_ar: null` and its 5 cells carry `category_name` + `category_name_ar` (for example Technology / تكنولوجيا); `?random=1`: `category.name_ar`; `?streak=1`: 20 questions all with the `category_name_ar` key; Daily: `daily_challenge()` called from the CLI for the existing 2026-11-03 set (no new row): Flags, AI, Technology with their Arabic names. |
| C8 | Game shows Arabic names in AR | PASS | Setup tiles (14 + Kilo Meshakkal, FSI-isolated, API order kept), 6 board headers, cell labels ("إحنا المصريين، 100 نقطة", mix box "كيلو مشكّل، قيمة غامضة"), question heading, Swap (heading + "بدلًا من إحنا المصريين – 100", Report label, swapped-to label on the board with `dir=auto`), Kilo Meshakkal heading "كيلو مشكّل: أنا مين؟ – 100", Golden Goal (bet screen and question heading), Streak, Daily and its Report label. Live EN/AR switch redraws each without a request and keeps ticks. |
| C9 | English fallback when empty | PASS | Daily payload without `category_name_ar`: English heading and Report label in AR; old saved game (no `nameAr`/`catNameAr`) loads in AR with English names (mix name still Arabic); old Golden Goal save shows the English name. No JS errors. |
| C10 | English unchanged vs HEAD | PASS | Same seeded scenario on HEAD (`git archive`) and the working tree, EN, at 1366x768 and 375x812, 11 steps each (setup, filled setup, board, question incl. double popup, Swap, answer and Report form, board after Swap, Kilo Meshakkal question, Streak question, Daily question): visible text, every `aria-label`/`title`/`placeholder`/`alt`, rects of header, board, cells, scoreboard, rows, question, setup, footer, page width/height, confirm texts: all identical (the EN/عربي switch itself, a Sprint 13 element, was excluded from the text comparison; it makes no rect difference). |
| C11 | Ids, ticks, Surprise me, saved games | PASS | Saved game ids unchanged (`[16,30,23,47,14,-1]`), `nameAr` stored next to `name`, saved-game `version` field present and unchanged; `game-log` POST carries ids only (no Arabic category name); `question-stats` POST ids only; Surprise me: headers "?" until opened, then the Arabic name; ticks kept across a language switch. |
| C12 | 6-column board, longest Arabic names, D-30 | PASS | Columns إحنا المصريين, كرتون زمان, أكل وشرب, أنا مين؟, الـAI, كيلو مشكّل, with 2 and with 6 contestants. 1366x768: page 768/768, no clipped header, header row 61 px (EN 71). 1920x1080: 1080/1080. 375x812: no horizontal overflow, header row 44 px (EN 74), page height equal to EN with 2 contestants (812) and 30 px shorter with 6 (862 vs 892, scrolls as in EN). Screenshot reviewed. |
| C13 | Admin add/rename Arabic field | PASS | Live against my server with a temporary category: add with padded Arabic shows "added" and a row with the trimmed Arabic name; Rename with only the Arabic changed shows 'Arabic name of "Team A Temp" saved.'; the PUT body carries both fields and the DB keeps the Arabic when the English changes; clearing the Arabic field clears it; Escape cancels. Field is `dir=rtl lang=ar maxlength=100`; Arabic cell is RTL, "-" when none. Deleted afterwards. |
| C14 | Admin pages at 1366 and 1024 | PASS | Categories (14 rows, 5 columns) and Questions (rows load) work; page not wider than the viewport, tables not scrolling sideways at either width; 0 console errors. Admin at 375 not run: **PENDING**. |
| C15 | SQL schema files | PASS | `sql/schema.sql` and `sql/schema-hosted.sql` both add `name_ar VARCHAR(100) NULL` after `name`, same position as the migration; the hosted file keeps no `CREATE DATABASE`/`USE`. |
| C16 | `deploy-hostinger.md` | PASS (with note) | Migration first, then the names file, then the code, smoke check, saved-game note: correct and consistent with the code (the new endpoints select `name_ar`, so the order matters). The text calls the new file "hashed `js/i18n.*.js`" while the file in the tree is `js/i18n.js`; correct only after the commit hook hashes it (OBS-C3). |
| C17 | Sprint 13 spot check | PASS | EN to AR switch sets `lang=ar dir=rtl`, key `brainrush.lang=ar`, persists across reload, setup text Arabic, EN removes the key and `dir`; the developer's own 75-step script re-run by me against 8017 with its stubs: 75 of 75 pass (setup, board, question, Swap, mix, reload, old saves, Surprise me, Streak, Daily with/without Arabic, Golden Goal, Admin). |
| C18 | No console errors | PASS | 0 page errors and 0 console errors in every run (EN, AR, HEAD, Admin, all viewports). |
| C19 | CRLF | PASS | 0 LF-only lines in `api/categories.php`, `api/questions.php`, `api/daily.php`, `admin.html`, `js/admin.*.js`, `js/game.*.js`, `js/i18n.js`, `js/share.*.js`, `css/style.*.css`, both schema files, both new SQL files, `deploy-hostinger.md`, `README.md`, `spec.md`, the dev note. |
| C20 | Static | PASS | `php -l` on all `api/*.php`: no errors. PHP uses prepared statements (no string-built SQL from input). No `innerHTML`/`insertAdjacentHTML`/`outerHTML` in game, admin, i18n and share JS (only comments). No hard-coded board sizes. No credentials in the diff; `api/config.php` is ignored. |

### Bugs

**BUG-13-04 (Minor, wording): "أعلام" for Flags is ambiguous.** In Arabic, أعلام is the plural of علم (flag) and also of "eminent person" (أعلام الأدب, "notable figures"). On a bare setup tile or column header a player may read the category as famous people. Suggest "أعلام الدول". Where: the Flags line of `sql/add-category-arabic-names.sql` and the `name_ar` of "Flags" in the local DB. Not blocking; the owner can change it in Admin without code.

### Observations (no action required)
- **OBS-C1** Gen Z names reviewed: "جيل زد" fine; "الـAI" fine (youth usage; the tatweel before Latin letters renders correctly in RTL, see the screenshot); "إحنا المصريين" is Egyptian dialect and will read as such to other Arab players, which suits the fun tone but is a deliberate regional choice; "أكل وشرب" natural; "أنا مين؟" natural (MSA would be "من أنا؟"); "كيلو مشكّل" spelled correctly with the shadda ("assorted kilo", the sweets-shop phrase).
- **OBS-C2** "كرتون زمان" means "old-days cartoons" and drops "Childhood" of "Cartoons & Childhood"; if the category holds childhood topics beyond cartoons, "كرتون وطفولة" would be closer. Owner's call.
- **OBS-C3** `js/i18n.js` is unhashed in the tree (the Sprint 13 note says the commit hook hashes it once it is `git add`-ed); `deploy-hostinger.md` and the dev note already assume the hashed name, so the commit must go through the hook and `index.html` must point at the hashed file when uploaded.
- **OBS-C4** `random_question()` in `api/questions.php` calls `arabic_names($pdo)` (one extra small query) per Swap/Golden Goal draw; negligible. The migration-first order is mandatory: there is no fallback for a missing column (documented in the deploy guide). Server error messages still use the English category name, and Admin lists keep English names (documented by the developer, accepted).

### Verdict (Category Arabic names CR)

**READY FOR PO.** The DB column and the 14 names load idempotently, the API validates and keeps/clears the Arabic name correctly, every place that shows a category name shows the Arabic one in AR and falls back to English, English is identical to HEAD, 6-column boards with the longest names fit D-30 at 1366, 1920 and 375, Admin works at 1366 and 1024, and no data was left changed. One Minor wording bug (BUG-13-04) and the native review of the Gen Z names remain for the owner. Before the commit: `git add js/i18n.js sql/add-category-arabic-names.sql sql/migrate-add-category-name-ar.sql`; keep the unrelated files from row 27 out.

### PO acceptance (Category Arabic names CR)

PO, 2026-11-09. **Change request "Arabic category names" (US-49): ACCEPTED**, pending the owner's local Chrome check and commit (FU-47, plus the two SQL files) and the hosted migration before the code (FU-53).

| Owner requirement | Verdict | Basis |
|---|---|---|
| Category names in Arabic wherever a name shows when the UI is Arabic; English unchanged | Met | C8, C10, C11 |
| Stored in a new `categories.name_ar` column, editable in Admin (not a client table) | Met | C1, C4-C6, C13, C15 |
| Fun categories in Gen Z style, plain ones in MSA | Met, pending native review | Dev note table; OBS-C1, OBS-C2; BUG-13-04 (Minor) to FU-54 |
| Setup tile order stays English alphabetical in both languages | Met | C8, C11 |
| Kilo Meshakkal's Arabic name in `js/i18n.js` | Met | C8, C9 |
| Fallback to English, old saves load, no saved-game version change | Met | C9, C11 |
| Idempotent migration and names file, no data overwritten | Met | C2, C3 |
| D-30 layouts with the longest names | Met | C12 |
| Global DoD: prepared statements, no `innerHTML` from data, no secrets, CRLF, no console errors | Met | C18-C20 |

Decision recorded in `docs/product-backlog.md`: D-61 (amends D-59 b). Follow-ups: FU-53 (Must, hosted migration first, then the code), FU-54 (Should, native review of the names incl. BUG-13-04 and "كرتون زمان"), FU-55 (Could, Admin at 375 px), FU-56 (Could, server errors and Admin lists keep English names).

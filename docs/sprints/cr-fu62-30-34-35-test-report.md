# Test report: CR cr-fu62-30-34-35 (FU-62, FU-30, FU-34, FU-35)

Environment: local XAMPP PHP + MariaDB (reused), Chrome via browser tool, 2026-11-11. Viewport of the tool is ~800 px; 375 px checked in a 375 px iframe. Confirm dialogs were stubbed (`window.confirm`) to record text and choose OK/Cancel. App mode via `?source=twa`.

Result: 38 PASS, 0 FAIL, 2 PENDING (environment). No bugs.

## Static
| Check | Result | Evidence |
|---|---|---|
| `php -l` all api/*.php; `node --check` both JS | PASS | no errors |
| `final.continue` left anywhere in code/HTML | PASS | only in sprint-13-dev.md history table and the dev note |
| No new innerHTML, string SQL, hard-coded board sizes, credentials | PASS | diff has none; `api/config.php` is in `.gitignore` |
| Asset hashes unchanged in file names | INFO | the pre-commit hook re-hashes (game-developer agent note) |

## FU-62
| Check | Result | Evidence |
|---|---|---|
| POST 'Kilo  Meshakkal' (2 spaces) | PASS | 409 built-in |
| tab, NBSP, ideographic space, padded, 'KILO   meshakkal' | PASS | all 409 |
| PUT rename to 'Kilo  Meshakkal' | PASS | 409 |
| 'Kilo Meshakkal2' | PASS | 201 (deleted after) |
| 'TEST  X   Y' stored collapsed | PASS | stored hex = "TEST X Y" |
| Duplicate check: 'TEST X Y' and 'TEST<NBSP>X  Y' | PASS | 409 already exists |
| Rename 'TEST  Z   Q' stored 'TEST Z Q'; rename another to it | PASS | 200 then 409 |
| Only NBSP / ideographic / spaces name | PASS | 400 "Name is required". New behaviour (before: stored invisible name); acceptable, better than an invisible category |
| Arabic name unchanged | PASS | 'اختبار  اثنين' kept with both spaces on create and rename |
| Existing categories unaffected | PASS | GET lists the same 14; unknown id PUT gives 404 |
| Admin UI shows 409 text | PASS | categories-msg: "Kilo Meshakkal" is the name of a built-in category |

## FU-30
Today's date cannot be injected without editing code, so `daily_number()` (the real lines 196-205 of api/daily.php plus the constant) was run with the PHP CLI for other dates.
| Check | Result | Evidence |
|---|---|---|
| Live API today | PASS | `"number":10` |
| 2026-11-02 / 11-01 / 10-01 / 2000-01-01 | PASS | 1 / 1 / 1 / 1 (never 0 or negative) |
| 2026-12-31 / 2027-11-02 / 2028-03-01 | PASS | 60 / 366 / 486 (leap year correct) |
| Number independent of DB | PASS | by code: function takes no PDO, no query; deleting rows/questions cannot shift it (the dev's TEST-row scenario was not repeated) |
| UI Daily label EN and AR | PASS | "Daily Challenge #10" / "التحدي اليومي #10" |
| Daily plays 3 questions, result screen | PASS | "BrainRush Daily #10: 1/3", Share, countdown; saved in `brainrush.daily` |

## FU-34 (app mode)
| Check | Result | Evidence |
|---|---|---|
| Not all marked: button 'See results', disabled | PASS | |
| All marked and tied: 'Next round' / 'الجولة التالية' | PASS | |
| After tie broken: 'See results' | PASS | |
| Back, all marked and tied: confirm EN text | PASS | "Stop Golden Goal and show the results? The tie stands." |
| Same in AR | PASS | "إيقاف الهدف الذهبي وعرض النتائج؟ يبقى التعادل قائمًا." |
| Cancel stays; second Back asks again (re-armed) | PASS | 2 confirms, still on question |
| OK -> Results with tie | PASS | "tie between TEST A and TEST B", stage `done` |
| Back with someone unmarked | PASS | old text "Players not marked yet keep their score." then Results |
| Back after tie broken | PASS | no confirm, "TEST A wins!" |
| Back in normal browser unchanged | PASS (code review only) | popstate handling returns at `if (!isApp ...)` (game.js:1085); `onFinalLeave` is reached only from there. Not run in a second non-app tab |
| 375 px EN and AR | PASS | button 298x55, scrollWidth = clientWidth (356), no overflow, RTL ok |
| 1280 px | PENDING (environment) | tool viewport is ~800 px; the button fills the panel with room to spare there |

## FU-35
| Check | Result | Evidence |
|---|---|---|
| Swapped cell saves id | PASS | `used[..].swap.id` = 673 / 1582 |
| Golden Goal round 1 exclude holds swap id | PASS | board 15 ids + swap id; drawn 1005 not in list |
| Round 2 exclude holds swap id and round-1 id | PASS | ends `...,1582,1005` |
| Reload mid-game resumes | PASS | board, "Sports – 400", helper state intact |
| Old save without `swap.id` loads | PASS | board shown |
| Invalid `swap.id` ("x") | PASS | save rejected, Setup shown (same as other invalid saves) |

## Regression
| Check | Result | Evidence |
|---|---|---|
| Normal game EN through Results (no tie) | PASS | "TEST A wins!" |
| Normal game AR through Results | PASS | "الفوز لـ TEST A!" |
| Streak starts, a correct answer counts | PASS | (not submitted to the leaderboard) |
| Setup, Admin load | PASS | |
| Console index/admin | PASS | only the known "unknown error fetching the script" artefact |
| Android real-device Back | PENDING (environment) | cannot be tested here; Back was driven with `history.back()` in `?source=twa` |

## Observation (not a bug of this CR)
Questions open in Arabic text with an "English" toggle while the interface is EN (Board, Daily, Golden Goal) in this browser profile. Untouched by this diff; probably the profile's language preference. Not investigated.

## Bugs
None.

## Cleanup
- Categories: temp rows 60, 63, 64 deleted. Auto-increment of `categories` moved 60 -> 65 (ids 61-64 consumed; failed inserts also burn ids). The next real category gets id 65.
- `question_stats` restored to its exact earlier content (rows 263, 264, 673, 1582 removed, 721 back to 1); diff clean.
- `logs/game-2026-11-11.log` (6 test lines, created by this run) removed.
- `daily_challenge` and `streaks` unchanged (3 days, 6 runs). Browser localStorage and sessionStorage cleared. Servers were already running and left running.

## Verdict: READY FOR PO
Open questions for the PO already in the dev note (launch date 2026-11-02 is the UTC date of live #1; NBSP-only name now 400) are acceptable from a test view.

## PO acceptance (2026-11-11)
| Item | Decision | Reason |
|---|---|---|
| FU-62 | ACCEPTED | Every whitespace variant of "Kilo Meshakkal" gives 409 on create and rename; "Kilo Meshakkal2" allowed; names stored collapsed; duplicate check uses the collapsed name. The 400 for a name of only no-break / ideographic spaces is accepted (better than an invisible tile; D-62 a). |
| FU-30 | ACCEPTED | `DAILY_LAUNCH_DATE` 2026-11-02 matches live Daily #10 on 2026-11-11; edge dates and the #1 floor correct; `daily_number()` no longer reads the DB (D-62 b). |
| FU-34 | ACCEPTED | "Next round" EN/AR; app Back confirm text, Cancel (re-armed) and OK (tie) correct; other Back cases unchanged; app mode only, as D-43 a; spec updated. Real-device Back and 1280 px pending for environment only: real-device check FU-66 (D-62 c). |
| FU-35 | ACCEPTED | Swap ids saved and sent in `exclude` for round 1 and 2; old saves load; invalid field rejected. A game in progress across the deploy keeps its earlier Swap questions drawable (accepted); the Swap helper's own draw is out of scope (FU-65) (D-62 d). |

Backlog: FU-62, FU-30, FU-34, FU-35 Done; D-62 added; D-47 a and D-52 amended. Follow-ups: FU-64 (owner check, commit, deploy; Must), FU-65 (Swap helper exclusion; Could), FU-66 (real-device Android Back; Should).

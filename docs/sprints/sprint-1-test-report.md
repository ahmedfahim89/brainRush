# Sprint 1 — Test Report (Foundation: DB + API)

Tester: Senior Tester (game-tester). Date: 2026-10-04. Stories: US-24, US-25, US-26, US-28.

## Summary

**Initial run:** Windows 11, Git Bash, no PHP or MySQL. Static checks and code review only. All runtime checks were PENDING (environment).

**Re-test (this revision):** XAMPP on the same machine.
- PHP 8.0.30 CLI (ZTS, x64) with `pdo_mysql` and `mbstring`
- MariaDB 10.4.32
- API served by `php -S localhost:8000 -t <project root>`

Every check that was PENDING has now been run. The developer's fixes for BUG-1-01..04 are verified.

| Result | Count |
|---|---|
| PASS | 27 |
| FAIL | 0 |
| PENDING | 0 |

Runtime curl suite: 113 requests. 113 behaved as expected. 2 of them first showed as FAIL because of a client-side encoding problem in the test tool (see Re-test, R-4). They pass when sent as raw UTF-8.

Bugs: 4 Minor bugs were found in the initial run (BUG-1-01..04). All 4 are **fixed and verified**. No new bugs. There are 3 new observations (O-4..O-6).

## Static checks performed
- `php -l` (PHP 8.0.30) on every file in `api/`: **no syntax errors** (re-test). I grepped for PHP 8.1+ features (`enum`, `readonly`, `never`, `array_is_list`, `new` in initializers, first-class callables) and found none. The only hits were `preg_match`, which is a false positive.
- I grepped for string-concatenated SQL. Only two SQL strings are built at runtime: `$having` in `api/categories.php` is a fixed literal, and `$placeholders` in `api/questions.php` contains only `?` characters. All input goes through bound parameters. No placeholder name is used twice in one statement, which matters because `EMULATE_PREPARES=false`.
- I checked for hard-coded board sizes, point values and timer values. The only ones are seed data and the validation bounds required by D-13/D-14 and the settings ranges. No JS/HTML exists yet, so there is no `innerHTML` to check.
- I grepped for credentials. The only `password` hit is the placeholder in `api/config.example.php`. `api/config.php` now exists locally for the re-test, is git-ignored, and was not read into this report.
- Git: the branch is `sprint-1`. `git check-ignore -v api/config.php` confirms the file is ignored by `.gitignore:1`, and `git ls-files` shows no tracked `api/config.php`.
- I checked the seed SQL by hand. There are exactly 30 question rows (6 categories x 5). This was confirmed at runtime.
- MySQL 8 / MariaDB compatibility (initial review, now confirmed on MariaDB 10.4):
  - The FK `questions.points -> point_values(points)` references the UNIQUE NOT NULL index `uq_points`, and the types match.
  - `SET @x = (SELECT ...)` works.
  - `ON DUPLICATE KEY UPDATE value = VALUES(value)` works on MariaDB. It is deprecated, with a warning only, on MySQL 8.0.20+.

## Acceptance criteria

| # | Story | Criterion | Result | Evidence |
|---|---|---|---|---|
| 1 | US-24 | Database `brainrush` created with utf8mb4 | PASS | `SHOW CREATE DATABASE` gives `utf8mb4 COLLATE utf8mb4_unicode_520_ci`. All 4 tables report `utf8mb4_unicode_520_ci` in `information_schema.TABLES` |
| 2 | US-24 | Tables settings, point_values, categories, questions | PASS | All 4 tables were created on the scratch DB `brainrush_test` |
| 3 | US-24 | Settings seeded categories_per_game=5, timer_seconds=30 | PASS | `SELECT * FROM settings` and `GET settings.php` both return `{"categories_per_game":5,"timer_seconds":30}` |
| 4 | US-24 | Point values 100–500 seeded | PASS | `GET points.php` returns 100..500 ascending |
| 5 | US-24 | 6 named categories, each with 5 questions | PASS | 6 categories, 30 questions, `GROUP BY` shows 5 per category |
| 6 | US-24 | Unique key (category_id, points) | PASS | `POST` to an occupied slot returns 409 (test 51) |
| 7 | US-24 | FK to categories ON DELETE CASCADE | PASS | I deleted a category that had a question. Afterwards `GET questions.php?category_id=<id>` returned 404 (tests 104-106) |
| 8 | US-24 | FK to point_values(points) ON DELETE RESTRICT (+ ON UPDATE CASCADE) | PASS | Deleting a value in use returns 409 (tests 32, 46). Deleting it once unused returns 200 (test 68) |
| 9 | US-24 | `mysql < sql/schema.sql` runs cleanly on an empty server; re-run is idempotent | PASS | I loaded the schema into `brainrush_test` (DB name replaced), with no errors. A second load gave only Notes 1007/1050 and Warnings 1062 from `INSERT IGNORE`. Data stayed at 6/30/5. The scratch DB was dropped afterwards |
| 10 | US-25 | JSON responses with the right status codes (200/201/400/404/405/409/500 with a generic message) | PASS | The curl suite covers every code. 405 includes the `Allow` header (`GET, POST, PUT, DELETE` / `GET, PUT` / `GET, POST, DELETE`). Responses send `Content-Type: application/json; charset=utf-8`. 500 is covered in row 26 |
| 11 | US-25 | `categories.php?playable=1` returns only categories with a question for every point value | PASS | After adding 1000: `[]` (test 37). After adding a Geography/1000 question: Geography only (test 43). After removing 1000: all 6 (test 69). `playable=0` returns all categories |
| 12 | US-25 | Board payload shape `{points:[asc], categories:[{id,name,questions:{<points>:{question,answer}}}]}` | PASS | The wire output matches exactly, and `questions` is a JSON object keyed by points. With 1000 present, `points` was `[100,200,300,400,500,1000]` (test 45) |
| 13 | US-25 | Board categories returned in requested order | PASS | `categories=2,1` returns Science then Geography (test 70) |
| 14 | US-25 | Unknown or non-numeric board ids → 400 | PASS | Tests 71-76 cover unknown, non-numeric, empty, missing, duplicate and 0. An incomplete category also gives 400 (test 44, documented deviation) |
| 15 | US-25 | Missing/empty name, question or answer → 400, nothing changed | PASS | Tests 52, 53, 56, 62, 82, 83, 103 |
| 16 | US-25 | Nonexistent category or points on question save → 400 | PASS | Tests 54, 55 |
| 17 | US-25 | Settings out of range or not an integer → 400, nothing changed | PASS | Tests 04-11. Test 09 sent a valid timer together with an invalid cpg and got 400. Test 12 then showed the timer unchanged |
| 18 | US-25 / D-13 | Point value 1–1,000,000 → 201; duplicate → 409; delete of a value in use → 409; unknown id → 404 | PASS | Tests 18-25, 32-35. Boundaries: 0 and 1,000,001 give 400, 1,000,000 gives 201. Floats and negatives give 400 |
| 19 | US-25 / D-14 | Category name trimmed, non-empty, max 100; case-insensitive duplicate → 409; rename/delete unknown id → 404; delete cascades | PASS | Tests 80-85, 99-107. Surrounding spaces are trimmed, 100 chars gives 201, 101 gives 400. Renaming a category to a different case of its own name gives 200 |
| 20 | US-25 | Occupied slot → 409 "This category already has a <points> question" (POST and PUT move) | PASS | Test 51 (POST) and test 59 (PUT move) both return the exact message |
| 21 | US-25 | Runtime curl suite: every endpoint × 200/201/400/404/405/409; `playable=1` after adding 1000; board shape and order on the wire | PASS | See Re-test R-2 |
| 22 | US-26 | Every query with input uses PDO prepared statements; `ERRMODE_EXCEPTION` | PASS | Code review, plus row 23 at runtime |
| 23 | US-26 | `'; DROP TABLE questions; --` as category name is stored literally | PASS | Test 96 returned 201. The stored bytes are `HEX(name)=273B2044524F50...2D2D`, which is the literal string. `questions` is still intact (test 98) |
| 24 | US-28 | `api/config.php` in `.gitignore` and not tracked; example contains placeholders only | PASS | `git check-ignore`, `git ls-files`, `config.example.php` |
| 25 | US-28 | README explains copying the config, setting your own credentials, and the public-exposure warning | PASS | `README.md` Setup step 3 and "Security warning" |
| 26 | US-28 | API errors never include credentials, DSN or stack traces | PASS | See Re-test R-5. A wrong DB password gives 500 `{"error":"Internal server error"}`. A missing config gives 500 `{"error":"Server is not configured"}`. The body contains no SQLSTATE, DSN, path, password or trace. The server log has message + file:line only and no password |
| 27 | DoD 2 | `php -l` passes on all `api/*.php` | PASS | PHP 8.0.30: "No syntax errors detected" for all 7 files |

## Re-test (2026-10-04, XAMPP)

### R-1 Schema load on MariaDB 10.4.32
- I loaded `sql/schema.sql` with `brainrush` replaced by `brainrush_test`. It loaded cleanly. A second load was idempotent: only Notes and Warnings, with counts unchanged at 6 categories, 30 questions and 5 point values.
- **520 collation on MariaDB 10.4:** `utf8mb4_unicode_520_ci` is accepted. Comparison results on the scratch DB:

  | Comparison | `utf8mb4_unicode_520_ci` | `utf8mb4_unicode_ci` |
  |---|---|---|
  | `'Food 🍕' = 'Food 🍔'` | 0 (different) | 1 (equal) |
  | `'Cafe' = 'Café'` | 1 (accent folding, documented) | — |

  Inserting both emoji names into `categories` succeeded. A lowercase `food 🍕` was rejected with 1062. This confirms the fix and that names stay case-insensitive.
- The scratch DB was dropped.

### R-2 Curl suite (`php -S localhost:8000`)
I sent 108 scripted requests against the seed DB, plus 5 raw-UTF-8 requests (R-4).

| Area | Tests | Notes |
|---|---|---|
| settings.php | 01-16 | GET; PUT single and both keys; string digits accepted. 400 for 4, 601, 2.5, `true`, `"abc"`, cpg 0 and 11, and `{}`. A mixed valid/invalid body is atomic. POST/DELETE give 405. text/plain gives 415 |
| points.php | 17-36, 40-41, 46, 68 | 201/409/400 boundaries. Invalid JSON and arrays give 400. A missing or text/plain Content-Type gives 415. `application/json; charset=utf-8` is accepted. Delete: in use gives 409, unknown 404, `abc` or no id 400, unused 200. PUT gives 405 |
| playable | 37-39, 43, 69 | Correct for the states: 1000 added, one category filled to 1000, and 1000 removed |
| questions.php | 42, 44-45, 47-67 | List all and by category (404 unknown, 400 non-numeric). POST: 201, 409 occupied, 400 for missing/blank/non-text/unknown category or points, 415, 400 for `[]`. PUT: edit, move to another category, 409 when moving to an occupied slot, 400 for empty answer, 404 for unknown id, 400 for no id. DELETE: 200 then 404. PATCH gives 405 |
| board | 44-45, 70-79 | Shape, order, incomplete category gives 400, unknown/non-numeric/empty/missing/duplicate/0 give 400, `board=0`/`board=true` behave as normal list |
| categories.php | 80-108 | Trim, case-insensitive 409, empty/missing 400, 100/101 char boundary, 400 for array/scalar/null body, 415 for text/plain and form-urlencoded, SQLi literal, rename 200/409/404/400, cascade delete, unknown 404, PATCH 405 |

The server log shows no 500s, PHP warnings or notices during the suite.

### R-3 Verification of the developer's fixes

| Bug | Result | Evidence |
|---|---|---|
| BUG-1-01 emoji false duplicate | **FIXED** | `Emoji Test 🍕` and `Emoji Test 🍔` both return 201. `emoji test 🍕` returns 409. `Café` after `Cafe` returns 409, which is the documented accent folding. SQL-level comparison is in R-1 |
| BUG-1-02 cross-site simple POST | **FIXED** | `text/plain`, `application/x-www-form-urlencoded` and a missing Content-Type all return **415** `"Content-Type must be application/json"` on POST and PUT (tests 16, 28, 29, 57, 89, 90). Nothing was created. `application/json; charset=utf-8` is accepted (test 30) |
| BUG-1-03 JSON array accepted as object | **FIXED** | `[]`, `["x"]`, `[1000]`, `"x"`, `null` and invalid JSON all return 400 `"Request body must be a JSON object"` (tests 26, 27, 58, 86-88). `{}` still reaches field validation (tests 11, 25, 83) |
| BUG-1-04 board on any `board` value | **FIXED** | `board=0&categories=1`, `board=0` and `board=true&categories=1` return the normal question list with 200 (tests 77-79). `board=1` gives the board |

### R-4 Test-harness note: non-ASCII arguments on Windows
On the first run, tests 92 (`Food 🍔` expected 201, got 409) and 95 (`Café` expected 409, got 400) failed. The cause was the test tool, not the API. On this Windows setup, non-ASCII characters in `curl -d` and `mysql -e` command-line arguments are not passed as UTF-8. The emoji arrived as literal `??`: the DB stored `HEX 466F6F64203F3F` = `Food ??`. The `é` arrived as a byte that is not valid UTF-8, so the JSON was invalid.

I re-sent the same names as raw UTF-8 files with `--data-binary @file`. The results were correct (R-3, BUG-1-01). A CJK name `日本 Test` also gave 201 and round-trips intact. These two tests are counted as PASS.

### R-5 Error-leak test (without touching `api/config.php`)
I did not edit `api/config.php` and did not stop MariaDB. Instead, I copied the unchanged `api/*.php` endpoint files into two temporary document roots and served them on ports 8001 and 8002:
- **8001** used a temporary `config.php` built from `config.example.php` placeholders, with a deliberately wrong password.
  - `GET settings.php`, `GET categories.php` and `GET questions.php?board=1&categories=1` each returned `500 {"error":"Internal server error"}`.
  - I grepped the body for the password, `mysql:`, `password`, `SQLSTATE`, `#0` and `.php`, with 0 matches.
  - Server log: `BrainRush API error: SQLSTATE[HY000] [1045] Access denied for user ... (using password: YES) in ...db.php:107`. It has the message and location only, with no password and no trace.
- **8002** had no `config.php`. `GET categories.php` returned `500 {"error":"Server is not configured"}`, and the log had the copy-the-example hint.

Both temporary directories were deleted afterwards.

### R-6 Cleanup
- All three PHP servers were stopped. I confirmed port 8000 is closed.
- I restored the `brainrush` DB with `DROP DATABASE brainrush` and then loaded `sql/schema.sql`. Verified state: 6 categories, 30 questions, point values 100..500, `categories_per_game=5`, `timer_seconds=30`.
- `brainrush_test` does not exist.

## Bugs

All bugs from the initial run are fixed (see R-3). The original descriptions are kept for traceability.

### BUG-1-01: Category names that differ only by emoji are rejected as duplicates (Minor) — FIXED
- **Where:** `sql/schema.sql` collation was `utf8mb4_unicode_ci`. It is now `utf8mb4_unicode_520_ci`.
- **Steps:** `POST {"name":"Food 🍕"}`, then `POST {"name":"Food 🍔"}`.
- **Expected:** 201 for both. **Was:** 409, because UCA 4.0.0 gives all supplementary characters the same weight.
- **Re-test:** 201 for both on MariaDB 10.4.32. An existing DB with the old collation must be recreated, as the dev notes say.

### BUG-1-02: The API accepts cross-site "simple" POST requests (Minor, security hardening) — FIXED
- **Where:** `api/db.php` `read_json_body()`.
- **Re-test:** a non-JSON Content-Type returns 415 and nothing is written.

### BUG-1-03: `read_json_body()` accepts a JSON array as "a JSON object" (Minor) — FIXED
- **Where:** `api/db.php` `read_json_body()`.
- **Re-test:** arrays, scalars, `null` and invalid JSON return 400 "Request body must be a JSON object".

### BUG-1-04: Board mode triggers on any `board` parameter value (Minor) — FIXED
- **Where:** `api/questions.php` GET dispatch now checks `($_GET['board'] ?? '') === '1'`.
- **Re-test:** `board=0` and `board=true` return the normal list.

### Observations (not bugs)
- **O-1:** The seed is "re-runnable", but re-running brings back seed rows the admin has deleted or renamed. This matches the README wording.
- **O-2:** `set_error_handler` turns every notice and deprecation into a 500. On PHP 8.0.30 the full suite produced no notices or deprecations. Re-check if the host PHP version changes.
- **O-3:** `.claude/settings.local.json` is in the Sprint 0 commit history. It has no credentials and is now git-ignored.
- **O-4 (new):** Responses include `X-Powered-By: PHP/8.0.30`. This is PHP/server configuration (`expose_php`), not application code. Hosts may want `expose_php=Off` as hardening.
- **O-5 (new):** Failed inserts (409) use up AUTO_INCREMENT ids, so ids have gaps. This is standard InnoDB behaviour and harmless.
- **O-6 (new):** Not covered by the spec, fine. A board request when there are zero point values returns 200 with an empty board. Setup cannot reach this state.

## Verdict

**READY FOR PO.**
- All 27 Sprint 1 acceptance checks pass at runtime on PHP 8.0.30 and MariaDB 10.4.32.
- All 4 Minor bugs from the initial run are fixed and verified.
- No new bugs were found.
- No checks remain PENDING.

## PO acceptance

Product Owner, 2026-10-04. Basis: `docs/sprint-plan.md` (Sprint 1), `docs/sprints/sprint-1-dev.md`, this report.

| Story | Decision | Reason |
|---|---|---|
| US-24 Schema and seed | **ACCEPTED** | Rows 1-9 pass at runtime: utf8mb4 DB, 4 tables, seed 5/30, points 100-500, 6x5 questions, `uq_slot`, CASCADE/RESTRICT FKs, idempotent re-run. |
| US-25 API endpoints and validation | **ACCEPTED** | Rows 10-21 pass (113-request curl suite): status codes, `playable=1`, board shape/order, 400/409 validation with nothing changed. Deviations accepted: board rejects incomplete categories (400) — fits D-12 and prevents holes; `GET points.php` returns objects; 415 for non-JSON bodies. |
| US-26 SQL injection protection | **ACCEPTED** | Rows 22-23: all input bound via PDO prepared statements, `ERRMODE_EXCEPTION`; `'; DROP TABLE questions; --` stored literally. |
| US-28 No secrets in git | **ACCEPTED** | Rows 24-26: `api/config.php` ignored and untracked, example has placeholders, README setup + exposure warning, 500s leak no DSN/credentials/trace. |

Notes:
- All 4 Minor bugs fixed and verified; no open Critical/Major bugs. DoD met.
- New decision **D-17** recorded in the backlog: code must stay compatible with MySQL 8 **and** MariaDB 10.4 (XAMPP reference, phpMyAdmin) and PHP 8.0. Sprint 1 was verified on the reference environment (PHP 8.0.30, MariaDB 10.4.32). MySQL 8 was reviewed statically only (`utf8mb4_unicode_520_ci` and `VALUES()` exist there; `VALUES()` only raises a deprecation warning) — a MySQL 8 schema-load smoke test is a non-blocking follow-up.
- Observations O-1..O-6 accepted as is; no backlog change needed.

**Sprint 1: ACCEPTED.**

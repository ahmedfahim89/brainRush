# Sprint 1 — Developer note (Foundation: DB + API)

Stories: US-24, US-25, US-26, US-28.

## Files created / changed

| File | Purpose |
|---|---|
| `sql/schema.sql` | DB `brainrush` (utf8mb4 / utf8mb4_unicode_520_ci), tables, keys, FKs, seed |
| `api/config.example.php` | Placeholder credentials template (returns an array) |
| `api/db.php` | PDO connection, `json_response()`, `read_json_body()`, error/405 helpers, validation helpers |
| `api/settings.php` | GET / PUT settings |
| `api/points.php` | GET / POST / DELETE point values |
| `api/categories.php` | GET (+ `?playable=1`) / POST / PUT / DELETE categories |
| `api/questions.php` | GET list / board, POST / PUT / DELETE questions |
| `README.md` | Setup section + public-exposure warning (stub extended) |
| `.gitignore` | Unchanged — already ignores `api/config.php` and `.claude/settings.local.json` |

## Schema (US-24)
- `settings(name PK, value)` seeded `categories_per_game=5`, `timer_seconds=30`.
- `point_values(id, points INT UNSIGNED UNIQUE)` seeded 100–500.
- `categories(id, name VARCHAR(100) UNIQUE, created_at)`; `_ci` collation makes the unique name case-insensitive (D-14).
- `questions(id, category_id, points, question TEXT, answer TEXT)` with `UNIQUE uq_slot (category_id, points)`, FK `category_id` -> `categories(id)` ON DELETE CASCADE, FK `points` -> `point_values(points)` ON UPDATE CASCADE ON DELETE RESTRICT.
- Seed: Geography, Science, History, Sports, Movies, Technology x 5 questions each (30).
- Re-runnable: `CREATE TABLE IF NOT EXISTS` + `INSERT IGNORE` (never overwrites existing data).

## API (US-25)
All responses are JSON. Errors are `{ "error": "<readable message>" }`. Ids for PUT/DELETE are passed as `?id=<id>` in the query string; bodies are JSON objects. Integers may be sent as JSON numbers or digit strings; floats/booleans are rejected.

| Endpoint | Behaviour |
|---|---|
| `GET settings.php` | `{categories_per_game, timer_seconds}` (ints) |
| `PUT settings.php` | Body with one or both keys; `categories_per_game` 1–10, `timer_seconds` 5–600 whole numbers -> 200 updated settings; otherwise 400, nothing changed (validated before any write, written in a transaction) |
| `GET points.php` | `[{id, points, question_count}]` ascending |
| `POST points.php` | `{points}` whole number 1–1,000,000 -> 201; else 400; duplicate -> 409 "Point value 1000 already exists" (D-13) |
| `DELETE points.php?id=` | 200 `{deleted}`; unknown id 404; used by questions -> 409 "Cannot delete 300: 5 question(s) still use it…" |
| `GET categories.php` | `[{id, name, question_count}]` sorted by name |
| `GET categories.php?playable=1` | Only categories whose question count equals the number of point values (and > 0) |
| `POST categories.php` | `{name}` trimmed, non-empty, max 100 chars -> 201; else 400; duplicate (case-insensitive) -> 409 |
| `PUT categories.php?id=` | Rename, same rules; unknown id 404 |
| `DELETE categories.php?id=` | 200; questions removed by FK cascade; unknown id 404 |
| `GET questions.php[?category_id=]` | `[{id, category_id, category_name, points, question, answer}]`; unknown category 404; invalid id 400 |
| `GET questions.php?board=1&categories=3,1,2` | `{points:[asc], categories:[{id, name, questions:{"100":{question, answer}, …}}]}` in requested order; empty / non-numeric / duplicate / unknown ids -> 400 |
| `POST questions.php` | `{category_id, points, question, answer}`; question/answer trimmed non-empty (max 5000 chars); nonexistent category or point value -> 400; occupied slot -> 409 "This category already has a 300 question" -> 201 |
| `PUT questions.php?id=` | Any subset of the POST fields (others keep current values), same validation; moving to an occupied slot -> 409; unknown id 404 |
| `DELETE questions.php?id=` | 200; unknown id 404 |
| Any unsupported method | 405 with `Allow` header |
| Any unexpected error | 500 `{"error":"Internal server error"}`; missing config -> 500 "Server is not configured" |

## Security (US-26, US-28)
- PDO: `ERRMODE_EXCEPTION`, `EMULATE_PREPARES=false`, utf8mb4. Every query with input is a prepared statement with bound parameters. Only two SQL strings are built dynamically and neither contains input: the `HAVING` clause for `playable=1` (fixed literal) and the `IN (?,?,…)` placeholder list for the board.
- Unique-key violations detected via SQLSTATE 23000 + MySQL code 1062 -> 409; FK violations (1451/1452) -> 409/400.
- `display_errors` off; PHP warnings converted to exceptions; global exception handler logs only message + file:line to the server log (no trace, which could hold constructor args) and returns a generic 500 — no DSN, credentials or stack trace in responses.
- `api/config.php` is git-ignored; `api/config.example.php` has placeholders only.

## Deviations / decisions taken
- **Board endpoint rejects incomplete categories**: if a requested category lacks a question for some point value, 400 `Category "X" is missing questions for: 1000`. The spec only demands 400 for unknown/non-numeric ids; this prevents a board with holes if admin data changed after setup loaded.
- The board endpoint does not enforce that the number of ids equals `categories_per_game` (setup validates that, US-04); it caps the request at 50 ids.
- `GET points.php` returns objects `{id, points, question_count}` (not a bare number list) so the admin can delete by id and show usage.
- `GET settings.php` returns `null` for a missing settings row instead of a hard-coded default (D-01/D-05: no hard-coded values).
- `GET questions.php` without `category_id` returns all questions (filter is optional).

## How to run / test
1. `mysql -u root -p < sql/schema.sql`
2. `cp api/config.example.php api/config.php` and set credentials.
3. `php -S localhost:8000` from the project root.
4. Examples:
   ```
   curl -i localhost:8000/api/settings.php
   curl -i -X PUT -H "Content-Type: application/json" localhost:8000/api/settings.php -d '{"timer_seconds":20}'
   curl -i -X POST -H "Content-Type: application/json" localhost:8000/api/points.php -d '{"points":1000}'        # 201, again -> 409
   curl -i "localhost:8000/api/categories.php?playable=1"                   # now empty until 1000 slots filled
   curl -i "localhost:8000/api/questions.php?board=1&categories=2,1"
   curl -i -X POST -H "Content-Type: application/json" localhost:8000/api/categories.php -d "{\"name\":\"'; DROP TABLE questions; --\"}"
   curl -i -X DELETE localhost:8000/api/points.php?id=1                     # 409 (in use)
   ```

## Verification performed / known limitations
- **PHP and MySQL are not installed on this machine**: `php -l`, running `schema.sql` and curl smoke tests could **not** be executed. All code was reviewed manually instead (syntax, PHP 8.0 compatibility — no 8.1-only features such as `never` or `array_is_list`, prepared statements, status codes). These checks are PENDING (environment).
- Requires the `pdo_mysql` extension; `mbstring` is optional (a PCRE fallback counts characters).
- Collation `utf8mb4_unicode_520_ci` also treats accented/unaccented letters as equal for category-name uniqueness (e.g. "Cafe" vs "Café" -> 409); acceptable and stricter than required.
- `ON DUPLICATE KEY UPDATE value = VALUES(value)` is deprecated (still supported) in MySQL 8.0.20+; chosen for MariaDB compatibility.
- No CSRF/auth on the API — admin is unprotected by design (README warns not to expose publicly).

## Fixes (test report `docs/sprints/sprint-1-test-report.md`)

| Bug | Fix | Files |
|---|---|---|
| BUG-1-01 (Minor) Emoji-only differences in category names gave a false 409 | Database and all tables now use `utf8mb4_unicode_520_ci`. Supplementary characters such as emoji get distinct weights, and names stay case-insensitive. Accent folding ("Cafe" = "Café") remains, as documented. An existing database created with the old collation must be dropped and recreated, because `CREATE ... IF NOT EXISTS` does not change it. | `sql/schema.sql` |
| BUG-1-02 (Minor, hardening) Cross-site `text/plain` form POSTs were accepted | `read_json_body()` now requires the media type `application/json` (parameters like `; charset=utf-8` are allowed) and returns **415** `"Content-Type must be application/json"` otherwise. This applies to every POST/PUT. Clients must send `Content-Type: application/json`; the curl examples above were updated. | `api/db.php` |
| BUG-1-03 (Minor) A JSON array body was treated as an object | The body is first decoded with objects kept as objects. Anything that is not a JSON object (an array such as `[]` or `["x"]`, a scalar, `null`, or invalid JSON) returns 400 `"Request body must be a JSON object"`. `{}` is still accepted and fails field validation as before. | `api/db.php` |
| BUG-1-04 (Minor) Board mode was triggered by any `board` value | Board mode now turns on only for `board=1`, the same rule as `playable=1`. Any other value returns the normal question list. | `api/questions.php` |

These fixes were reviewed by hand only. `php -l` and the runtime checks are still PENDING (environment).

# BrainRush

Jeopardy-style trivia party game (HTML/CSS/JS + PHP + MySQL).

See `docs/spec.md`, `docs/product-backlog.md` and `docs/sprint-plan.md`. Game and admin pages arrive in later sprints; full usage instructions will be completed in Sprint 4.

## Setup

1. **Install** PHP 8 (with the `pdo_mysql` extension enabled) and MySQL 8 or MariaDB.
2. **Create the database** (creates `brainrush`, its tables and sample data — 6 categories x 5 questions):
   ```
   mysql -u root -p < sql/schema.sql
   ```
   The script is safe to re-run: it only creates missing tables and inserts missing seed rows.
3. **Configure credentials**: copy `api/config.example.php` to `api/config.php` and set your own database host, user and password.
   `api/config.php` is git-ignored — never commit real credentials.
4. **Start the server** from the project root:
   ```
   php -S localhost:8000
   ```
   Then open `http://localhost:8000/`. API endpoints live under `http://localhost:8000/api/` (e.g. `/api/settings.php`).

## Security warning

The admin page and the API that edits categories, questions and settings are **not password-protected** (by design, for a local party game). Run BrainRush only on your own machine or a trusted local network — **do not expose it publicly** on the internet.

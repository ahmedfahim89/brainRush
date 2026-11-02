-- BrainRush migration: Report a question
--
-- Adds the `question_reports` table (US-42, D-45). A player or host reports a problem with a
-- question from the game: one row per report with the question id, the reason (one of six), an
-- optional note of up to 200 characters, a status and the time. Nothing else is stored: no name,
-- no IP address, no device id and no hash of any of them (D-45). There is no rate limit; the
-- admin resolves or dismisses reports in Admin > Reports. Deleting a question deletes its reports
-- (ON DELETE CASCADE). idx_reports_question_status serves the "open reports per question" list
-- and the foreign key.
-- New installs use sql/schema.sql or sql/schema-hosted.sql, which already include it.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-question-reports.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (CREATE TABLE IF NOT EXISTS).
-- Run it BEFORE deploying the matching code: api/reports.php reads and writes this table.

CREATE TABLE IF NOT EXISTS question_reports (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  question_id INT UNSIGNED NOT NULL,
  reason      ENUM('wrong_answer', 'typo', 'translation', 'outdated', 'picture', 'other') NOT NULL,
  note        VARCHAR(200) NOT NULL DEFAULT '',
  status      ENUM('open', 'resolved', 'dismissed') NOT NULL DEFAULT 'open',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_question_status (question_id, status),
  CONSTRAINT fk_reports_question
    FOREIGN KEY (question_id) REFERENCES questions (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

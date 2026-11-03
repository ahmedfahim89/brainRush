-- BrainRush migration: Question difficulty stats
--
-- Adds the `question_stats` table (US-47, D-55). The game sends one outcome when a board question
-- closes or a Streak question is answered: correct, wrong, nobody or timeout. The server adds it to
-- that question's counter (one row per question, INSERT ... ON DUPLICATE KEY UPDATE). Admin >
-- Questions shows the attempts (the four counters added up) and the % correct, and marks
-- "Check value" when a question with 20 or more attempts is outside the band for its point value.
-- Only the four counters are stored: no name, no IP address, no device id and no time.
-- Deleting a question deletes its counters (ON DELETE CASCADE).
-- New installs use sql/schema.sql or sql/schema-hosted.sql, which already include it.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-question-stats.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (CREATE TABLE IF NOT EXISTS).
-- Run it BEFORE deploying the matching code: api/question-stats.php writes this table and the
-- Admin question list (api/questions.php) reads it.

CREATE TABLE IF NOT EXISTS question_stats (
  question_id INT UNSIGNED NOT NULL,
  correct     INT UNSIGNED NOT NULL DEFAULT 0,
  wrong       INT UNSIGNED NOT NULL DEFAULT 0,
  nobody      INT UNSIGNED NOT NULL DEFAULT 0,
  timeout     INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (question_id),
  CONSTRAINT fk_stats_question
    FOREIGN KEY (question_id) REFERENCES questions (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- BrainRush migration: Daily Challenge
--
-- Adds the `daily_challenge` table (US-43, D-46). Every day (the UTC date, D-46) the first player
-- who opens the Daily Challenge makes api/daily.php pick that day's questions; every later player
-- gets the same ones. One row per (challenge_date, position) with the question id. The primary key
-- on (challenge_date, position) is the unique key that stops two simultaneous first requests from
-- creating two sets: the API inserts with INSERT IGNORE and then reads the set back.
-- uq_daily_question keeps a question from appearing twice on the same day. Deleting a question
-- deletes its rows (ON DELETE CASCADE); the API refills a missing position on the next request.
-- Nothing about the player is stored: the result stays in the player's browser.
-- New installs use sql/schema.sql or sql/schema-hosted.sql, which already include it.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-daily-challenge.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (CREATE TABLE IF NOT EXISTS).
-- Run it BEFORE deploying the matching code: api/daily.php reads and writes this table.

CREATE TABLE IF NOT EXISTS daily_challenge (
  challenge_date DATE             NOT NULL,
  position       TINYINT UNSIGNED NOT NULL,
  question_id    INT UNSIGNED     NOT NULL,
  created_at     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (challenge_date, position),
  UNIQUE KEY uq_daily_question (challenge_date, question_id),
  KEY idx_daily_question (question_id),
  CONSTRAINT fk_daily_question
    FOREIGN KEY (question_id) REFERENCES questions (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

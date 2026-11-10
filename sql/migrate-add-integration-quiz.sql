-- BrainRush migration: Integration Quiz
--
-- Adds the two tables of the Integration Quiz (integration-quiz.html, owner request 2026-11-10):
-- a team quiz on software integration and APIs that plays like the Streak Challenge (3 choices,
-- the timer, one wrong answer or time's up ends the run) but has its own questions and its own
-- leaderboard, apart from the public question bank and the public streak board.
--   integration_questions  the quiz's questions, each with its answer and 2 wrong choices.
--                          Loaded by SQL file only (no admin tab): copy
--                          sql/add-integration-quiz-questions.example.sql and fill it in.
--                          enabled = 0 keeps a question out of the quiz without deleting it.
--                          uq_integration_question blocks the same question text twice
--                          (case-insensitive via _ci, first 191 characters), so INSERT IGNORE
--                          files can be imported again.
--   integration_scores     one row per finished run with a streak of 1 or more; the same
--                          columns, keys and rules as `streaks` (sql/migrate-add-streak.sql).
-- New installs use sql/schema.sql or sql/schema-hosted.sql, which already include both tables.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-integration-quiz.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (CREATE TABLE IF NOT EXISTS).
-- Run it BEFORE deploying the matching code: api/integration-quiz.php reads and writes these tables.

CREATE TABLE IF NOT EXISTS integration_questions (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  question   TEXT         NOT NULL,
  answer     VARCHAR(255) NOT NULL,
  wrong_1    VARCHAR(255) NOT NULL,
  wrong_2    VARCHAR(255) NOT NULL,
  enabled    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_integration_question (question(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

CREATE TABLE IF NOT EXISTS integration_scores (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(30)  NOT NULL,
  streak     INT UNSIGNED NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_integration_scores_name (name),
  KEY idx_integration_scores_streak (streak)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

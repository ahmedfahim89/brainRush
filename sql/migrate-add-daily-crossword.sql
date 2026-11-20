-- BrainRush migration: Daily Crossword
--
-- Adds the `daily_crossword` table (US-58, D-72). Every day (the UTC date, D-46) the first player
-- who opens the Daily Crossword makes api/crossword.php build that day's grid from the question
-- bank; every later player gets the same grid. One row per day: `layout` is JSON with the grid size
-- and the words {question_id, word, row, col, dir, length}. The clue text is read from `questions`
-- when the grid is requested, so Admin fixes show; a question deleted later keeps its word in that
-- day's grid. The primary key on puzzle_date stops two simultaneous first requests from storing two
-- grids: the API inserts with INSERT IGNORE and then reads the row back.
-- Nothing about the player is stored: progress and the result stay in the player's browser.
-- The setting crossword_enabled needs no migration: a missing row counts as off.
-- New installs use sql/schema.sql or sql/schema-hosted.sql, which already include it.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-daily-crossword.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (CREATE TABLE IF NOT EXISTS).
-- Run it BEFORE deploying the matching code: api/crossword.php reads and writes this table.

CREATE TABLE IF NOT EXISTS daily_crossword (
  puzzle_date DATE     NOT NULL,
  layout      TEXT     NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (puzzle_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

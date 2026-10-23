-- BrainRush migration: Streak Challenge leaderboard
--
-- Adds the `streaks` table for the solo Streak Challenge (owner request 2026-10-23,
-- US-33 / US-34 / D-37). Every finished run with a streak of 1 or more is one row. The
-- game's leaderboard shows the best run per person: the challenger name, compared
-- case-insensitively through the _ci collation; on equal streaks the earliest run wins.
-- The wrong choices of streak questions reuse the helper's wrong_1/wrong_2 columns
-- (sql/migrate-add-wrong-options.sql), so this file only creates the table.
-- New installs use sql/schema.sql or sql/schema-hosted.sql, which already include it.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-streak.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (CREATE TABLE IF NOT EXISTS).
-- Run it BEFORE deploying the matching code: api/streaks.php reads and writes this table.

CREATE TABLE IF NOT EXISTS streaks (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(30)  NOT NULL,
  streak     INT UNSIGNED NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_streaks_name (name),
  KEY idx_streaks_streak (streak)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

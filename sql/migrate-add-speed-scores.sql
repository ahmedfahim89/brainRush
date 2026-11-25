-- BrainRush migration: Speed Round leaderboard
--
-- Adds the `speed_scores` table for the shared Speed Round leaderboard (owner request 2026-11-25,
-- US-60 / D-76). Every finished Speed Round with 1 or more correct answers is one row: the
-- challenger name entered before the countdown and the run's correct answers. It has the same
-- columns, keys and rules as `streaks` (sql/migrate-add-streak.sql); the `streak` column holds the
-- correct answers, so api/speed-scores.php reuses the Streak Challenge's leaderboard code
-- (api/streaks.php). The game's leaderboard shows the best run per person (the name, compared
-- case-insensitively through the _ci collation); on equal scores the earliest run wins.
-- New installs use sql/schema.sql or sql/schema-hosted.sql, which already include it.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-speed-scores.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (CREATE TABLE IF NOT EXISTS).
-- Run it BEFORE deploying the matching code: api/speed-scores.php reads and writes this table.

CREATE TABLE IF NOT EXISTS speed_scores (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(30)  NOT NULL,
  streak     INT UNSIGNED NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_speed_scores_name (name),
  KEY idx_speed_scores_streak (streak)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

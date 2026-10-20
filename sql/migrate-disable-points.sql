-- BrainRush migration: disable point values
--
-- Adds an on/off switch to each point value. A disabled value is hidden from the game
-- board (e.g. disable 600 and the board shows 100-500 only); its questions stay in the
-- database and come back when the value is enabled again. Toggle it in
-- Admin > Point values. Existing values stay enabled (DEFAULT 1).
-- New installs use sql/schema.sql or sql/schema-hosted.sql, which already include this column.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-disable-points.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (MariaDB 10.4+ IF NOT EXISTS on columns).
-- Run it BEFORE deploying the matching code: the API selects this column.

ALTER TABLE point_values
  ADD COLUMN IF NOT EXISTS enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER points;

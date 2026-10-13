-- BrainRush migration: Arabic localization of questions
--
-- Adds optional Arabic text to each question. A question with both columns filled is
-- revealed in Arabic first, with a button to switch to English. New installs use
-- sql/schema.sql or sql/schema-hosted.sql, which already include these columns.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-arabic.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (MariaDB 10.4+ ADD COLUMN IF NOT EXISTS).
-- Run it BEFORE deploying the matching code: the API selects these columns.

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS question_ar TEXT NULL AFTER answer,
  ADD COLUMN IF NOT EXISTS answer_ar   TEXT NULL AFTER question_ar;

-- BrainRush migration: wrong options for the "3 choices" helper
--
-- Adds two optional wrong options per question, in English and in Arabic (owner request
-- 2026-10-23, US-32 / D-36). The "3 choices" helper shows the answer plus these two in a
-- random order. NULL means "no wrong options yet": the helper is greyed out on that
-- question. They are all-or-nothing per language (the API enforces it).
-- New installs use sql/schema.sql or sql/schema-hosted.sql, which already include them.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-wrong-options.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (MariaDB 10.4+ ADD COLUMN IF NOT EXISTS).
-- Run it BEFORE deploying the matching code: the API selects these columns.
-- Run it BEFORE sql/add-wrong-options.sql, which fills them in.

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS wrong_1    VARCHAR(255) NULL AFTER image_credit,
  ADD COLUMN IF NOT EXISTS wrong_2    VARCHAR(255) NULL AFTER wrong_1,
  ADD COLUMN IF NOT EXISTS wrong_1_ar VARCHAR(255) NULL AFTER wrong_2,
  ADD COLUMN IF NOT EXISTS wrong_2_ar VARCHAR(255) NULL AFTER wrong_1_ar;

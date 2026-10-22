-- BrainRush migration: photo credit for picture questions
--
-- Adds an optional photo credit to each question (owner request 2026-10-22). A picture
-- question with a non-empty image_credit shows it as a small caption under the picture,
-- e.g. "Photo: Jane Doe / CC BY-SA 4.0" (attribution for CC BY / CC BY-SA photos such as
-- the Landmarks set). '' means no caption, so text questions and the Flags set (public
-- domain SVGs) are unchanged. NOT NULL DEFAULT '' like the image column.
-- New installs use sql/schema.sql or sql/schema-hosted.sql, which already include it.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-image-credit.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (MariaDB 10.4+ ADD COLUMN IF NOT EXISTS).
-- Run it BEFORE deploying the matching code: the API selects this column.
-- Run it BEFORE sql/add-landmarks-questions.sql, which fills in the Landmarks credits.

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS image_credit VARCHAR(255) NOT NULL DEFAULT '' AFTER image;

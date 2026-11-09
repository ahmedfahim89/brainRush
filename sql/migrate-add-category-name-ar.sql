-- BrainRush migration: Arabic category names
--
-- Adds an optional Arabic name to each category. When the game's interface is Arabic, a category
-- with an Arabic name shows it (Setup tiles, board column headers, question headings, Golden Goal,
-- Streak and Daily Challenge); without one it shows the English name. The admin fills it in
-- Admin > Categories. New installs use sql/schema.sql or sql/schema-hosted.sql, which already
-- include this column. sql/add-category-arabic-names.sql then fills it for the existing categories.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-category-name-ar.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (MariaDB 10.4+ ADD COLUMN IF NOT EXISTS).
-- Run it BEFORE deploying the matching code: the API selects this column.

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS name_ar VARCHAR(100) NULL AFTER name;

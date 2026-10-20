-- BrainRush migration: picture questions
--
-- Adds an optional picture to each question. A question with a non-empty image path
-- (e.g. img/questions/flag-japan.svg) shows that picture above the question text;
-- everything else about it plays like a text question. The image files live in the
-- repository under img/questions/ (there is no upload feature). New installs use
-- sql/schema.sql or sql/schema-hosted.sql, which already include this column and key.
--
-- Uniqueness now includes the image: flag questions all share the same prompt text
-- ("Which country does this flag belong to?"), so (category, question) alone would reject the
-- second flag. The column is NOT NULL DEFAULT '' (not NULL) on purpose: NULLs never
-- collide in a unique key, so with NULL two identical text questions would both be
-- accepted; with '' text questions stay de-duplicated as before.
-- fk_questions_category stays covered by idx_questions_slot (category_id, points).
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
--   local:   mysql -u root brainrush < sql/migrate-add-image.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.
-- Safe to run again (MariaDB 10.4+ IF [NOT] EXISTS on columns and keys).
-- Run it BEFORE deploying the matching code: the API selects this column.

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS image VARCHAR(255) NOT NULL DEFAULT '' AFTER answer_ar;

ALTER TABLE questions
  DROP INDEX IF EXISTS uq_category_question,
  ADD UNIQUE KEY IF NOT EXISTS uq_category_question_image (category_id, question(191), image(191));

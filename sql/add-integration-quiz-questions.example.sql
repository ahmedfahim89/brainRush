-- BrainRush Integration Quiz: questions (EXAMPLE, the two rows below are placeholders)
--
-- How to use it:
--   1. Copy this file, e.g. to sql/add-integration-quiz-questions.sql.
--   2. Replace the two placeholder rows with your own questions (as many rows as you like).
--   3. Import it: locally   mysql -u root brainrush < sql/add-integration-quiz-questions.sql
--                 hosted    phpMyAdmin -> select the database -> Import the file
-- The tables must exist first (sql/migrate-add-integration-quiz.sql).
--
-- One row per question: (question, answer, wrong_1, wrong_2).
--   question  the question text (shown as typed).
--   answer    the right answer; wrong_1 and wrong_2 are the two wrong choices. The quiz shows the
--             three in a random order as A, B and C. Each may be up to 255 characters and none may
--             be empty. Text from " (" on is not shown, so "REST (Representational State Transfer)"
--             shows as "REST". Keep the three different from each other: a question whose choices
--             look the same is skipped.
--   enabled   optional, 1 by default; set it to 0 later (phpMyAdmin) to take a question out of
--             the quiz without deleting it.
-- Write a single quote inside a text as two: 'What''s ...'.
-- INSERT IGNORE skips a question whose text is already in the table (not case-sensitive), so the
-- file can be imported again after adding rows at the end.
-- No CREATE DATABASE / USE line: it runs on whichever database is selected.

INSERT IGNORE INTO integration_questions (question, answer, wrong_1, wrong_2) VALUES
  ('Placeholder question 1: replace this text with your own question?', 'The right answer', 'A wrong answer', 'Another wrong answer'),
  ('Placeholder question 2: replace this text with your own question?', 'The right answer', 'A wrong answer', 'Another wrong answer');

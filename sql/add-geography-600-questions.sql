-- BrainRush: Geography 600 questions (owner request 2026-10-20)
--
-- Adds 2 questions to the existing "Geography" category, both at 600 (the
-- hardest value): a desert (the Rub al Khali) and a country (Nepal, by its
-- flag). Drafted as 3; the owner removed the Challenger Deep question and it
-- was not replaced. The difficulty matches the existing Geography 600 row
-- (Lesotho, Bab el-Mandeb, Qattara Depression). No answer repeats an answer in
-- the bank, and no question names an existing answer (for example, the desert
-- question does not name Saudi Arabia, Yemen or the UAE). Every row comes with its Arabic question and answer. Review doc
-- and fact-check sources: docs/question-sets/geography-600-review.md.
--
-- Requires sql/migrate-add-arabic.sql (or a schema that already has question_ar /
-- answer_ar). Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-geography-600-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. No category is created: a row is skipped when the
-- Geography category was renamed or deleted, when point value 600 does not
-- exist, or when the category already has that question (INSERT IGNORE +
-- uq_category_question).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS geo600_seed;

CREATE TEMPORARY TABLE geo600_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO geo600_seed (category_name, points, question, answer, question_ar, answer_ar) VALUES
  ('Geography', 600, 'What is the name of the vast desert in the south of the Arabian Peninsula that holds the largest continuous area of sand in the world?', 'The Rub al Khali (accept the Empty Quarter)',
   'ما اسم الصحراء الشاسعة في جنوب شبه الجزيرة العربية، التي تضم أكبر مساحة متصلة من الرمال في العالم؟', 'الربع الخالي'),
  ('Geography', 600, 'Which Asian country has the only national flag in the world that is neither a rectangle nor a square, shaped like two stacked triangular pennants?', 'Nepal',
   'أي دولة آسيوية لديها العلم الوطني الوحيد في العالم الذي ليس مستطيلًا ولا مربعًا، إذ يتكوّن من رايتين مثلثتين إحداهما فوق الأخرى؟', 'نيبال');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar
  FROM geo600_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS geo600_seed;

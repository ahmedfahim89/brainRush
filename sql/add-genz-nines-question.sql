-- BrainRush: Gen Z "dressed to the nines" question (owner request 2026-10-28)
--
-- Adds 1 question to the existing "Gen Z" category at 500 (owner's choice; it was
-- first drafted at 600). It asks the meaning of the English idiom "dressed
-- to the nines" (dressed very smartly, in one's best clothes; Cambridge and
-- Merriam-Webster dictionaries). The row has its Arabic question and answer and
-- 2 wrong options in English and Arabic for the "3 choices" helper.
--
-- Requires sql/migrate-add-arabic.sql and sql/migrate-add-wrong-options.sql (or a
-- schema that already has question_ar / answer_ar and wrong_1 / wrong_2 /
-- wrong_1_ar / wrong_2_ar). Run it on whichever database is selected (there is no
-- USE line):
--   local:   mysql -u root brainrush < sql/add-genz-nines-question.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. Nothing is created, updated or deleted except the new
-- question row. It is skipped when the Gen Z category or the 500 point value does
-- not exist, or when the category already has that question (INSERT IGNORE + the
-- unique key).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS genz_nines_seed;

CREATE TEMPORARY TABLE genz_nines_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  wrong_1       VARCHAR(255) NOT NULL,
  wrong_2       VARCHAR(255) NOT NULL,
  wrong_1_ar    VARCHAR(255) NOT NULL,
  wrong_2_ar    VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO genz_nines_seed (category_name, points, question, answer, question_ar, answer_ar, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Gen Z', 500, 'At the end of a "Get Ready With Me" video, the creator is "dressed to the nines". What does that mean?', 'Dressed very smartly and elegantly (accept in their best clothes, dressed up, glammed up, very fancy)',
   'في نهاية فيديو "Get Ready With Me" (استعد معي)، تظهر صانعة المحتوى "dressed to the nines". ماذا يعني هذا التعبير؟', 'تلبس بأناقة شديدة وفي أبهى حلة (يُقبل: لابسة أحسن هدومها، متشيكة جدًا)',
   'Dressed in clothes that are far too big', 'Dressed in mismatched, clashing colours', 'تلبس ملابس واسعة جدًا عليها', 'تلبس ألوانًا غير متناسقة');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM genz_nines_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS genz_nines_seed;

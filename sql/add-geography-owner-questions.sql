-- BrainRush: Geography questions the owner added on the live site (2026-10-27)
--
-- Adds 3 questions to the existing "Geography" category (no new category). The
-- owner wrote them in the live admin page; this file copies them as they are on
-- live (live ids 1194-1196) so the local bank and a fresh install match live.
-- Text questions only (image = ''). Every row has its Arabic question and answer
-- and 2 wrong options in English and Arabic for the "3 choices" helper.
--
-- Count per point value: 300 = 1, 500 = 1, 600 = 1 (3).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql and
-- sql/migrate-add-wrong-options.sql (or a schema that already has question_ar /
-- answer_ar, the image column with the uq_category_question_image key, and
-- wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar). Run it on whichever database is
-- selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-geography-owner-questions.sql
--   hosted:  already there (added through the admin page); running it is a no-op
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when the "Geography" category does not exist,
-- when its point value does not exist, or when the category already has that
-- question (INSERT IGNORE + the uq_category_question_image unique key, image = ''
-- for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS geography_owner_seed;

CREATE TEMPORARY TABLE geography_owner_seed (
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

INSERT INTO geography_owner_seed (category_name, points, question, answer, question_ar, answer_ar, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Geography', 300, 'Which African country borders Spain through the cities of Ceuta and Melilla?', 'Morocco',
   'ما الدولة الأفريقية التي تحدها إسبانيا عبر مدينتي سبتة ومليلية؟', 'المغرب',
   'Tunisia', 'Algeria', 'تونس', 'الجزائر'),
  ('Geography', 500, 'Which country has the largest number of islands in the world?', 'Sweden',
   'ما الدولة التي تمتلك أكبر عدد من الجزر في العالم؟', 'السويد',
   'Indonesia', 'Philippines', 'إندونيسيا', 'الفلبين'),
  ('Geography', 600, 'Which strait separates Asia from North America?', 'Bering Strait',
   'ما المضيق الذي يفصل بين قارتي آسيا وأمريكا الشمالية؟', 'مضيق بيرينغ',
   'Strait of Gibraltar', 'Strait of Malacca', 'مضيق جبل طارق', 'مضيق ملقا');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, '',
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM geography_owner_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS geography_owner_seed;

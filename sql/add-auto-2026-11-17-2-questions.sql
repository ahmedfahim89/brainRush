-- BrainRush: automatic top-up batch 2026-11-17 (2)
-- (question-bank-manager brief, AUTO BATCH 2026-11-17-2, dated 2026-11-17;
-- owner override: Flags only)
--
-- Adds 6 picture questions to the existing Flags category (no new category), one per
-- point value, bringing every Flags cell to 10. Written to the owner's standing
-- preference of 2026-11-11 (easier; flags cannot be "recent", so well-known countries
-- were chosen). IDs 1117-01 to 1117-06.
--   Flags 100 = Ukraine      (img/questions/flag-ukraine.svg, public domain)
--   Flags 200 = Croatia      (img/questions/flag-croatia.svg, public domain)
--   Flags 300 = Libya        (img/questions/flag-libya.svg, public domain)
--   Flags 400 = Uruguay      (img/questions/flag-uruguay.svg, public domain)
--   Flags 500 = Iran         (img/questions/flag-iran.svg, public domain)
--   Flags 600 = Philippines  (img/questions/flag-philippines.svg, public domain)
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the image
-- licences: docs/question-sets/auto-2026-11-17-2-review.md.
--
-- Count per point value: 100 = 1, 200 = 1, 300 = 1, 400 = 1, 500 = 1, 600 = 1 (6).
-- Per category: Flags 6.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-17-2-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/flag-ukraine.svg, flag-croatia.svg, flag-libya.svg,
-- flag-uruguay.svg, flag-iran.svg and flag-philippines.svg with it (new file names).
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_17_2_seed;

CREATE TEMPORARY TABLE auto_2026_11_17_2_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  image         VARCHAR(255) NOT NULL,
  image_credit  VARCHAR(255) NOT NULL,
  wrong_1       VARCHAR(255) NOT NULL,
  wrong_2       VARCHAR(255) NOT NULL,
  wrong_1_ar    VARCHAR(255) NOT NULL,
  wrong_2_ar    VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO auto_2026_11_17_2_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Flags', 100, 'Which country does this flag belong to?', 'Ukraine',
   'إلى أي دولة ينتمي هذا العلم؟', 'أوكرانيا', 'img/questions/flag-ukraine.svg', '',
   'Sweden', 'Kazakhstan', 'السويد', 'كازاخستان'),  -- 1117-01

  ('Flags', 200, 'Which country does this flag belong to?', 'Croatia (accept Hrvatska)',
   'إلى أي دولة ينتمي هذا العلم؟', 'كرواتيا', 'img/questions/flag-croatia.svg', '',
   'Serbia', 'Paraguay', 'صربيا', 'باراغواي'),  -- 1117-02

  ('Flags', 300, 'Which country does this flag belong to?', 'Libya',
   'إلى أي دولة ينتمي هذا العلم؟', 'ليبيا', 'img/questions/flag-libya.svg', '',
   'Sudan', 'Algeria', 'السودان', 'الجزائر'),  -- 1117-03

  ('Flags', 400, 'Which country does this flag belong to?', 'Uruguay',
   'إلى أي دولة ينتمي هذا العلم؟', 'الأوروغواي', 'img/questions/flag-uruguay.svg', '',
   'Argentina', 'Greece', 'الأرجنتين', 'اليونان'),  -- 1117-04

  ('Flags', 500, 'Which country does this flag belong to?', 'Iran (accept Islamic Republic of Iran)',
   'إلى أي دولة ينتمي هذا العلم؟', 'إيران (يُقبل: جمهورية إيران الإسلامية)', 'img/questions/flag-iran.svg', '',
   'Tajikistan', 'Iraq', 'طاجيكستان', 'العراق'),  -- 1117-05

  ('Flags', 600, 'Which country does this flag belong to?', 'The Philippines (accept Philippines)',
   'إلى أي دولة ينتمي هذا العلم؟', 'الفلبين', 'img/questions/flag-philippines.svg', '',
   'Czech Republic', 'Malaysia', 'التشيك', 'ماليزيا');  -- 1117-06

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_17_2_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_17_2_seed;

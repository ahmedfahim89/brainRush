-- BrainRush: automatic top-up batch 2026-10-26 (question-bank-manager brief, AUTO BATCH)
--
-- Adds 4 text questions to an existing category (no new category), towards 10 per
-- category and point value:
--   Who Am I? 100, 200, 300, 400 = 1 each (pop music, Arabic literature, painting,
--                                  travel/exploration), clue style "... Who am I?"
-- The owner removed the 3 Cartoons & Childhood 600 and the 2 Food & Drink questions
-- on 2026-10-26 (see the review doc and docs/question-sets/rejected-answers.md).
-- The brief's Landmarks 600 picture slot is NOT filled: this scheduled run had no
-- approval for network access, so no photo could be downloaded or licence-checked.
-- See docs/question-sets/auto-2026-10-26-review.md.
-- FACT-CHECK STATUS: the web fact-check could not be run in this scheduled run (web
-- search and fetch were blocked for lack of approval). Every fact here is a widely
-- documented, stable fact, but the 2-source check is still pending; the review doc
-- lists the sources to confirm before this file is loaded.
-- Text questions only (image = ''). Every row has its Arabic question and answer and
-- 2 wrong options in English and Arabic for the "3 choices" helper.
--
-- Count per point value: 100 = 1, 200 = 1, 300 = 1, 400 = 1 (4).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql and
-- sql/migrate-add-wrong-options.sql (or a schema that already has question_ar /
-- answer_ar, the image column with the uq_category_question_image key, and
-- wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar). Run it on whichever database is
-- selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-10-26-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question (INSERT IGNORE + the
-- uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_10_26_seed;

CREATE TEMPORARY TABLE auto_2026_10_26_seed (
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

INSERT INTO auto_2026_10_26_seed (category_name, points, question, answer, question_ar, answer_ar, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 100, 'I am the American singer known as the "King of Pop". I made the moonwalk dance famous, and my 1982 album was called "Thriller". Who am I?', 'Michael Jackson',
   'أنا المطرب الأمريكي الملقب بـ"ملك البوب". اشتهرت برقصة "المون ووك"، وألبومي الصادر عام 1982 اسمه "ثريلر". من أنا؟', 'مايكل جاكسون',
   'Prince', 'Elvis Presley', 'برنس', 'إلفيس بريسلي'),

  ('Who Am I?', 200, 'I am an Egyptian novelist. In 1988 I became the first Arab writer to win the Nobel Prize in Literature, and my best-known works include the "Cairo Trilogy". Who am I?', 'Naguib Mahfouz',
   'أنا روائي مصري. في عام 1988 أصبحت أول كاتب عربي يفوز بجائزة نوبل في الأدب، ومن أشهر أعمالي "الثلاثية". من أنا؟', 'نجيب محفوظ',
   'Taha Hussein', 'Tawfiq al-Hakim', 'طه حسين', 'توفيق الحكيم'),

  ('Who Am I?', 300, 'I was a Dutch painter of the 19th century. I painted "The Starry Night" and a famous series of "Sunflowers", and in 1888 I cut my own ear with a razor. Who am I?', 'Vincent van Gogh (accept Van Gogh)',
   'كنت رسامًا هولنديًا في القرن التاسع عشر. رسمت لوحة "ليلة النجوم" وسلسلة شهيرة من لوحات "عباد الشمس"، وفي عام 1888 جرحت أذني بموسى حلاقة. من أنا؟', 'فنسنت فان جوخ (يُقبل: فان جوخ)',
   'Rembrandt', 'Johannes Vermeer', 'رامبرانت', 'يوهانس فيرمير'),

  ('Who Am I?', 400, 'I was a Muslim scholar born in Tangier in 1304. I left home for the Hajj in 1325 and kept travelling for almost 30 years, from West Africa to China. Who am I?', 'Ibn Battuta',
   'كنت عالمًا مسلمًا وُلدت في طنجة عام 1304. خرجت من بلدي للحج عام 1325 وواصلت الترحال قرابة 30 عامًا، من غرب أفريقيا حتى الصين. من أنا؟', 'ابن بطوطة',
   'Ibn Khaldun', 'Ibn Jubayr', 'ابن خلدون', 'ابن جبير');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, '',
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_10_26_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_10_26_seed;

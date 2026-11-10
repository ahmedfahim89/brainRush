-- BrainRush: automatic top-up batch 2026-11-06 (question-bank-manager brief, AUTO BATCH)
--
-- Adds 5 questions to existing categories (no new category), towards 10 per
-- category and point value:
--   Who Am I? 200 = 1 (Beethoven), 500 = 1 (Houdini), clue style "... Who am I?"
--   Cartoons & Childhood 400 = 1 (Remy, "Ratatouille")
--   Landmarks 500 = 1 picture question (Karnak Temple, the Great Hypostyle Hall,
--                   img/questions/landmark-karnak-temple.jpg, Commons photo by
--                   Vyacheslav Argenberg, CC BY 4.0, credit in image_credit)
--   Food & Drink 400 = 1 (pine nuts)
-- The 2026-11-06 run had no web access and only wrote drafts. This file was written
-- on 2026-11-10 (owner request) after the fact-check. The owner removed 4 drafts on
-- 2026-11-10 (Frida Kahlo, Mansa Musa, Boots, Mr. Potato Head), and the AI 500 draft
-- (AGI) was dropped because Science 600 already asks what "AGI" stands for.
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the photo
-- licence: docs/question-sets/auto-2026-11-06-review.md.
--
-- Count per point value: 200 = 1, 400 = 2, 500 = 2 (5).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-06-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-karnak-temple.jpg with it.
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_06_seed;

CREATE TEMPORARY TABLE auto_2026_11_06_seed (
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

INSERT INTO auto_2026_11_06_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 200, 'I was a composer born in Bonn in 1770. I kept composing even after I lost almost all my hearing, and my Ninth Symphony ends with the famous "Ode to Joy". Who am I?', 'Ludwig van Beethoven (accept Beethoven)',
   'كنت مؤلفًا موسيقيًا وُلدت في مدينة بون عام 1770. واصلت التأليف حتى بعد أن فقدت سمعي كله تقريبًا، وتنتهي سيمفونيتي التاسعة بـ"نشيد الفرح" الشهير. من أنا؟', 'لودفيغ فان بيتهوفن (يُقبل: بيتهوفن)', '', '',
   'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'فولفغانغ أماديوس موتسارت', 'يوهان سيباستيان باخ'),  -- 1106-01

  ('Who Am I?', 500, 'I was a magician and escape artist, born Erik Weisz in 1874. I became world famous for escaping from handcuffs, straitjackets and a locked tank of water, and I died on Halloween in 1926. Who am I?', 'Harry Houdini (accept Houdini)',
   'كنت ساحرًا وفنان هروب، وُلدت باسم إريك فايس عام 1874. اشتهرت في العالم كله بالهروب من الأصفاد والسترات المقيِّدة ومن خزان ماء مغلق، وتوفيت في ليلة الهالوين عام 1926. من أنا؟', 'هاري هوديني (يُقبل: هوديني)', '', '',
   'Harry Blackstone', 'Howard Thurston', 'هاري بلاكستون', 'هوارد ثورستون'),  -- 1106-02

  ('Cartoons & Childhood', 400, 'In the Pixar film "Ratatouille" (2007), what is the name of the young rat who dreams of becoming a great chef in a famous French restaurant?', 'Remy',
   'في فيلم بيكسار "راتاتوي" (2007)، ما اسم الفأر الصغير الذي يحلم بأن يصبح طاهيًا عظيمًا في مطعم فرنسي شهير؟', 'ريمي', '', '',
   'Emile', 'Django', 'إميل', 'جانغو'),  -- 1106-03

  ('Landmarks', 500, 'Which landmark is this?', 'Karnak Temple (accept Karnak, the Karnak Temple Complex, the Temple of Amun at Karnak)',
   'ما هذا المعلم؟', 'معبد الكرنك (يُقبل: الكرنك، مجمع معابد الكرنك)', 'img/questions/landmark-karnak-temple.jpg', 'Vyacheslav Argenberg / CC BY 4.0',
   'Luxor Temple', 'Edfu Temple', 'معبد الأقصر', 'معبد إدفو'),  -- 1106-04

  ('Food & Drink', 400, 'Which nuts are crushed with basil, garlic, Parmesan cheese and olive oil to make the classic green pesto sauce of Genoa?', 'Pine nuts (accept pignoli, pine kernels)',
   'أي نوع من المكسرات يُهرس مع الريحان والثوم وجبن البارميزان وزيت الزيتون لصنع صلصة البيستو الخضراء الشهيرة من جنوة؟', 'الصنوبر (يُقبل: حب الصنوبر)', '', '',
   'Walnuts', 'Cashews', 'عين الجمل', 'الكاجو');  -- 1106-05

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_06_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_06_seed;

-- BrainRush: automatic top-up batch 2026-11-01 (question-bank-manager brief, AUTO BATCH)
--
-- Adds 5 questions to existing categories (no new category), towards 10 per
-- category and point value:
--   Who Am I? 100 = 1 (Mother Teresa), 500 = 1 (Coco Chanel),
--             600 = 1 (Huda Shaarawi), clue style "... Who am I?"
--   Cartoons & Childhood 200 = 1 (Sonic)
--   Landmarks 600 = 1 picture question (the Pantheon, Rome,
--                   img/questions/landmark-pantheon-rome.jpg, Commons photo by
--                   Wilfredor, CC0, credit in image_credit)
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the photo
-- licence: docs/question-sets/auto-2026-11-01-review.md.
--
-- Count per point value: 100 = 1, 200 = 1, 500 = 1, 600 = 2 (5).
-- The owner's review (2026-11-01) removed 6 questions (Yogi Bear and its
-- replacement the Hundred Acre Wood, Sigmund Freud, Saint-Exupery, sturgeon,
-- computer vision) and moved the Pantheon from 500 to 600. See the review doc.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-01-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-pantheon-rome.jpg with it.
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_01_seed;

CREATE TEMPORARY TABLE auto_2026_11_01_seed (
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

INSERT INTO auto_2026_11_01_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 100, 'I was a Catholic nun who spent my life helping the poorest people of Calcutta. I founded the Missionaries of Charity in 1950 and won the Nobel Peace Prize in 1979. Who am I?', 'Mother Teresa (accept Saint Teresa of Calcutta)',
   'كنت راهبة كاثوليكية كرّست حياتي لمساعدة أفقر الناس في كلكتا. أسست جمعية "مرسلات المحبة" عام 1950، وفزت بجائزة نوبل للسلام عام 1979. من أنا؟', 'الأم تيريزا (يُقبل: القديسة تيريزا من كلكتا)', '', '',
   'Sister Emmanuelle', 'Mother Cabrini', 'الأخت إيمانويل', 'الأم كابريني'),

  ('Who Am I?', 500, 'I was a fashion designer. I made the simple "little black dress" famous, and in the 1920s I launched a perfume called "No. 5" that still carries my name. Who am I?', 'Coco Chanel (accept Gabrielle Chanel, Chanel)',
   'كنت مصممة أزياء. جعلت "الفستان الأسود الصغير" البسيط مشهورًا، وفي عشرينيات القرن العشرين أطلقت عطرًا اسمه "رقم 5" ما زال يحمل اسمي. من أنا؟', 'كوكو شانيل (يُقبل: غابرييل شانيل، شانيل)', '', '',
   'Elsa Schiaparelli', 'Jeanne Lanvin', 'إلسا سكياباريلي', 'جان لانفان'),

  ('Who Am I?', 600, 'I was an Egyptian pioneer of women''s rights. In 1923 I founded the Egyptian Feminist Union, and on my return from a women''s conference in Rome I removed my face veil in public at the train station. Who am I?', 'Huda Shaarawi (accept Hoda Shaarawi)',
   'كنت رائدة مصرية في الدفاع عن حقوق المرأة. عام 1923 أسست الاتحاد النسائي المصري، وعند عودتي من مؤتمر نسائي في روما رفعت النقاب عن وجهي علنًا في محطة القطار. من أنا؟', 'هدى شعراوي', '', '',
   'Doria Shafik', 'Safiya Zaghloul', 'درية شفيق', 'صفية زغلول'),

  ('Cartoons & Childhood', 200, 'Which blue hedgehog, the video game hero created by Sega in 1991, runs at super speed and collects golden rings?', 'Sonic (accept Sonic the Hedgehog)',
   'ما اسم القنفذ الأزرق، بطل ألعاب الفيديو الذي ابتكرته شركة سيغا عام 1991، والذي يركض بسرعة خارقة ويجمع الحلقات الذهبية؟', 'سونيك (يُقبل: سونيك القنفذ)', '', '',
   'Tails', 'Knuckles', 'تيلز', 'ناكلز'),

  ('Landmarks', 600,'Which landmark is this?', 'The Pantheon (accept the Pantheon in Rome, Santa Maria ad Martyres)',
   'ما هذا المعلم؟', 'البانثيون (يُقبل: البانثيون في روما، كنيسة سانتا ماريا آد مارتيريس)', 'img/questions/landmark-pantheon-rome.jpg', 'Wilfredor / CC0',
   'The Maison Carree', 'The Temple of Hephaestus', 'ميزون كاريه', 'معبد هيفايستوس');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_01_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_01_seed;

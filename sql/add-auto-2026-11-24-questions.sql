-- BrainRush: automatic top-up batch 2026-11-24
-- (question-bank-manager brief, AUTO BATCH 2026-11-24, dated 2026-11-24)
--
-- Adds 4 text questions to existing categories (no new category, no pictures).
-- Written to the owner's standing preference of 2026-11-11: easier questions, mostly
-- on subjects from 2000 onwards. IDs 1124-01 to 1124-04.
--   AI 600 = facial recognition (airport e-gates and police cameras); replaces "The Mitchells
--     vs. the Machines", removed by the owner on 2026-11-24 for an easier question.
--   Cartoons & Childhood 600 = a red panda ("Turning Red", Pixar, 2022).
--   Who Am I? 500 = Hugh Jackman (Wolverine from "X-Men" 2000, "The Greatest Showman" 2017),
--     600 = Rafael Nadal (Mallorca, first French Open 2005, 14 French Open titles, retired 2024).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc and fact-check sources:
-- docs/question-sets/auto-2026-11-24-review.md.
--
-- Count per point value: 500 = 1, 600 = 3 (4).
-- Per category: AI 1, Cartoons & Childhood 1, Who Am I? 2.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-24-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_24_seed;

CREATE TEMPORARY TABLE auto_2026_11_24_seed (
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

INSERT INTO auto_2026_11_24_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('AI', 600, 'Which AI technology do airport e-gates use to check that the traveller in front of the camera is the person in the passport photo, and police use to spot wanted people in crowds?', 'Facial recognition (accept face recognition, face scanning)',
   'ما تقنية الذكاء الاصطناعي التي تستخدمها البوابات الإلكترونية في المطارات للتأكد من أن المسافر الواقف أمام الكاميرا هو نفسه صاحب الصورة في جواز السفر، وتستخدمها الشرطة لرصد المطلوبين وسط الزحام؟', 'التعرّف على الوجه (يُقبل: بصمة الوجه)', '', '',
   'Emotion recognition', 'Motion detection', 'التعرّف على المشاعر', 'استشعار الحركة'),  -- 1124-01

  ('Cartoons & Childhood', 600, 'In the 2022 Pixar film "Turning Red", 13-year-old Mei Lee turns into a giant fluffy animal whenever she gets too excited or upset. What kind of animal?', 'A red panda (accept a giant red panda)',
   'في فيلم بيكسار "تيرنينغ ريد" (Turning Red) عام 2022، تتحوّل الفتاة مي لي ذات الثلاثة عشر عامًا إلى حيوان ضخم كثيف الفرو كلما تحمّست أو انزعجت كثيرًا. ما هذا الحيوان؟', 'باندا حمراء (يُقبل: باندا حمراء عملاقة)', '', '',
   'A red fox', 'A raccoon', 'ثعلب أحمر', 'راكون'),  -- 1124-02

  ('Who Am I?', 500, 'I am an Australian actor. I first played the clawed mutant Wolverine in "X-Men" (2000), and I played the circus showman P.T. Barnum in the hit musical "The Greatest Showman" (2017). Who am I?', 'Hugh Jackman (accept Jackman)',
   'أنا ممثل أسترالي. أدّيت لأول مرة دور المتحوّل ذي المخالب "وولفرين" في فيلم "إكس-مِن" (X-Men) عام 2000، وأدّيت دور صاحب السيرك بي تي بارنوم في الفيلم الموسيقي الناجح "ذا غريتست شومان" (The Greatest Showman) عام 2017. من أنا؟', 'هيو جاكمان (يُقبل: جاكمان)', '', '',
   'Chris Hemsworth', 'Russell Crowe', 'كريس هيمسوورث', 'راسل كرو'),  -- 1124-03

  ('Who Am I?', 600, 'I am a Spanish tennis player from the island of Mallorca. I won my first French Open in 2005, aged 19, and went on to win it 14 times in all. I played my last match at the Davis Cup in November 2024. Who am I?', 'Rafael Nadal (accept Nadal, Rafa)',
   'أنا لاعب تنس إسباني من جزيرة مايوركا. فزت ببطولة فرنسا المفتوحة لأول مرة عام 2005 وعمري 19 عامًا، ثم فزت بها 14 مرة في المجموع. ولعبت آخر مباراة لي في كأس ديفيز في نوفمبر 2024. من أنا؟', 'رافائيل نادال (يُقبل: نادال، رافا)', '', '',
   'Carlos Alcaraz', 'Novak Djokovic', 'كارلوس ألكاراز', 'نوفاك ديوكوفيتش');  -- 1124-04

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_24_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_24_seed;

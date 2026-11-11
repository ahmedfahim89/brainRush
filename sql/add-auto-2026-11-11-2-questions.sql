-- BrainRush: automatic top-up batch 2026-11-11, second batch of the day
-- (question-bank-manager brief, AUTO BATCH, 2026-11-11)
--
-- Adds 2 questions to existing categories (no new category), towards 10 per
-- category and point value:
--   Who Am I? 100 = 1 (J.K. Rowling), clue style "... Who am I?"
--   Cartoons & Childhood 200 = 1 (The Pink Panther)
-- The owner removed 8 of the 10 drafted questions on 2026-11-11 (1111-02 to 1111-04
-- and 1111-06 to 1111-10, including the Galata Tower picture). They are listed in the
-- review doc and in docs/question-sets/rejected-answers.md. No picture question is left.
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc and fact-check sources:
-- docs/question-sets/auto-2026-11-11-2-review.md.
--
-- Count per point value: 100 = 1, 200 = 1 (2).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-11-2-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- No image files to deploy (text questions only, image = '').
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_11_2_seed;

CREATE TEMPORARY TABLE auto_2026_11_11_2_seed (
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

INSERT INTO auto_2026_11_11_2_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 100, 'I am a British writer. In 1997 I published my first novel, about an orphan boy who finds out on his 11th birthday that he is a wizard. It grew into a series of seven books and eight films. Who am I?', 'J.K. Rowling (accept Rowling, Joanne Rowling)',
   'أنا كاتبة بريطانية. في عام 1997 نشرت روايتي الأولى عن صبي يتيم يكتشف في عيد ميلاده الحادي عشر أنه ساحر، ثم كبرت القصة لتصبح سلسلة من سبعة كتب وثمانية أفلام. من أنا؟', 'جيه كيه رولينغ (يُقبل: رولينغ)', '', '',
   'Enid Blyton', 'Jacqueline Wilson', 'إنيد بلايتون', 'جاكلين ويلسون'),  -- 1111-01

  ('Cartoons & Childhood', 200, 'Which cartoon big cat first appeared in the animated opening titles of a 1963 comedy film about the theft of a famous diamond, and then starred in his own cartoons?', 'The Pink Panther (accept Pink Panther)',
   'أي قط كبير كرتوني ظهر أول مرة في عناوين البداية المتحركة لفيلم كوميدي من عام 1963 عن سرقة ماسة شهيرة، ثم صار بطلًا لرسوم متحركة خاصة به؟', 'النمر الوردي', '', '',
   'Top Cat', 'Snagglepuss', 'توب كات', 'سناغلبوس');  -- 1111-05

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_11_2_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_11_2_seed;

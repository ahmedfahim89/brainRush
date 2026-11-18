-- BrainRush: Food & Drink questions the owner added on the live site (2026-11-18)
--
-- Adds 5 questions to the existing "Food & Drink" category (no new category). The
-- owner wrote them in the live admin page; this file copies them as they are on
-- live (live ids 1441-1445) so the local bank and a fresh install match live.
-- Text questions only (image = ''). Every row has its Arabic question and answer
-- and 2 wrong options in English and Arabic for the "3 choices" helper.
--
-- Count per point value: 200 = 2, 300 = 1, 400 = 2 (5).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql and
-- sql/migrate-add-wrong-options.sql (or a schema that already has question_ar /
-- answer_ar, the image column with the uq_category_question_image key, and
-- wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar). Run it on whichever database is
-- selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-food-drink-owner-questions.sql
--   hosted:  already there (added through the admin page); running it is a no-op
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when the "Food & Drink" category does not exist,
-- when its point value does not exist, or when the category already has that
-- question (INSERT IGNORE + the uq_category_question_image unique key, image = ''
-- for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS food_drink_owner_seed;

CREATE TEMPORARY TABLE food_drink_owner_seed (
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

INSERT INTO food_drink_owner_seed (category_name, points, question, answer, question_ar, answer_ar, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Food & Drink', 200, 'Which type of pepper is used to make the original Tabasco sauce?', 'Tabasco pepper',
   'من أي نوع من الفلفل يتم تصنيع صلصة تاباسكو الأصلية؟', 'فلفل تاباسكو',
   'Jalapeño pepper', 'Habanero pepper', 'فلفل هالبينو', 'فلفل هابانيرو'),
  ('Food & Drink', 200, 'Which ingredient gives Peri-Peri sauce its signature heat?', 'African Bird''s Eye Chili',
   'ما هو المكون الأساسي الذي يمنح صلصة بيري بيري طعمها الحار؟', 'الفلفل الأفريقي عين الطائر',
   'Black pepper', 'Ginger', 'الفلفل الأسود', 'الزنجبيل'),
  ('Food & Drink', 300, 'What is the origin of Peri-Peri sauce?', 'Portugal and Mozambique',
   'ما هو أصل صلصة بيري بيري (Peri-Peri)؟', 'البرتغال وموزمبيق',
   'Mexico and Brazil', 'India and Pakistan', 'المكسيك والبرازيل', 'الهند وباكستان'),
  ('Food & Drink', 400, 'Which part of the cinnamon tree is used to make cinnamon?', 'Inner bark',
   'من أي جزء من شجرة القرفة يتم استخراج القرفة؟', 'اللحاء الداخلي',
   'Roots', 'Seeds', 'الجذور', 'البذور'),
  ('Food & Drink', 400, 'From which type of plant is natural vanilla obtained?', 'An orchid',
   'من أي نوع من النباتات يتم استخراج الفانيليا الطبيعية؟', 'زهرة الأوركيد',
   'A White wood tree', 'A cactus', 'شجرة الخشب الابيض', 'نبات الصبار');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, '',
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM food_drink_owner_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS food_drink_owner_seed;

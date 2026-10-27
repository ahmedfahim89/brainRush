-- BrainRush: Food & Drink nutrition question set (owner request 2026-10-27)
--
-- Adds 8 text questions to the existing "Food & Drink" category, all on food
-- facts, nutrition and food composition: which food is rich in a vitamin or
-- mineral, and what natural substance a food contains (caffeine, lactose,
-- gluten). The owner's review removed 10 of the 18 drafted questions and set
-- the point values of the rest (see the review doc).
-- Every row has its Arabic question and answer and 2 wrong options in English
-- and Arabic for the "3 choices" helper. Review doc and fact-check sources:
-- docs/question-sets/food-nutrition-review.md.
--
-- Count per point value: 200 = 3, 300 = 3, 400 = 1, 500 = 1 (8).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql and
-- sql/migrate-add-wrong-options.sql (or a schema that already has question_ar /
-- answer_ar, the image column with the uq_category_question_image key, and
-- wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar). Run it on whichever database is
-- selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-food-nutrition-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. No category is created and nothing is updated or
-- deleted. A row is skipped when the Food & Drink category was renamed or
-- deleted, when its point value does not exist, or when the category already has
-- that question (INSERT IGNORE + the uq_category_question_image unique key,
-- image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS food_nutrition_seed;

CREATE TEMPORARY TABLE food_nutrition_seed (
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

INSERT INTO food_nutrition_seed (category_name, points, question, answer, question_ar, answer_ar, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Food & Drink', 200, 'Which natural stimulant, found in coffee, tea and energy drinks, helps keep people awake?', 'Caffeine',
   'أي مادة منبهة طبيعية، توجد في القهوة والشاي ومشروبات الطاقة، تساعد الناس على السهر واليقظة؟', 'الكافيين',
   'Nicotine', 'Taurine', 'النيكوتين', 'التورين'),
  ('Food & Drink', 200, 'Which mineral, plentiful in milk, cheese and yoghurt, is the main mineral in our bones and teeth?', 'Calcium',
   'أي معدن، يكثر في اللبن والجبن والزبادي، هو المعدن الأساسي في العظام والأسنان؟', 'الكالسيوم',
   'Sodium', 'Zinc', 'الصوديوم', 'الزنك'),
  ('Food & Drink', 200, 'Lack of which mineral, found in red meat, liver and lentils, is the most common nutritional cause of anaemia?', 'Iron',
   'نقص أي معدن، يوجد في اللحوم الحمراء والكبدة والعدس، هو أكثر الأسباب الغذائية شيوعًا للأنيميا (فقر الدم)؟', 'الحديد',
   'Zinc', 'Magnesium', 'الزنك', 'المغنيسيوم'),

  ('Food & Drink', 300, 'Which yellow fruit is famous for being rich in the mineral potassium?', 'Banana (accept bananas)',
   'أي فاكهة صفراء مشهورة بأنها غنية بمعدن البوتاسيوم؟', 'الموز',
   'Lemon', 'Pineapple', 'الليمون', 'الأناناس'),
  ('Food & Drink', 300, 'Which root vegetable, rich in beta-carotene that the body turns into vitamin A, is famously said to help you see in the dark?', 'Carrot (accept carrots)',
   'أي خضار جذري، غني بالبيتا كاروتين الذي يحوّله الجسم إلى فيتامين أ، يُقال إنه يساعد على الرؤية في الظلام؟', 'الجزر',
   'Beetroot', 'Radish', 'البنجر', 'الفجل'),
  ('Food & Drink', 300, 'What is the name of the natural sugar in milk that people with an intolerance to it find hard to digest?', 'Lactose',
   'ما اسم السكر الطبيعي الموجود في اللبن، الذي يصعب هضمه على من يعانون من عدم تحمّله؟', 'اللاكتوز',
   'Fructose', 'Maltose', 'الفركتوز', 'المالتوز'),

  ('Food & Drink', 400, 'Which tropical fruit, popular in Egypt as a juice, has about four times as much vitamin C as an orange?', 'Guava',
   'أي فاكهة استوائية، يحب المصريون عصيرها، تحتوي على نحو أربعة أضعاف فيتامين سي الموجود في البرتقال؟', 'الجوافة',
   'Mango', 'Papaya', 'المانجو', 'البابايا'),

  ('Food & Drink', 500, 'Which protein, found in wheat, barley and rye, must be avoided by people with coeliac disease?', 'Gluten',
   'أي بروتين، يوجد في القمح والشعير والجاودار، يجب أن يتجنبه مرضى السيلياك؟', 'الجلوتين',
   'Casein', 'Albumin', 'الكازين', 'الألبومين');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, '',
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM food_nutrition_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS food_nutrition_seed;

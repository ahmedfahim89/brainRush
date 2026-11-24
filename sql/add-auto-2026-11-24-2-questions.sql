-- BrainRush: automatic top-up batch 2026-11-24-2
-- (question-bank-manager brief, AUTO BATCH 2026-11-24-2, dated 2026-11-24; second batch of the day,
-- target 13 questions per category x point value)
--
-- Adds 10 questions to existing categories (no new category): 8 text questions and 2 picture
-- questions (Flags 100 and Landmarks 200). Written to the owner's standing preference of
-- 2026-11-11: easier questions, mostly on subjects from 2000 onwards. IDs 1124-2-01 to 1124-2-10.
--   AI 100 = the number plate (AI traffic cameras), Cartoons & Childhood 100 = "Moana" (2016),
--   Flags 100 = Cyprus (picture, img/questions/flag-cyprus.svg), Food & Drink 100 = shawarma,
--   Who Am I? 100 = Ronaldinho, Landmarks 200 = Palm Jumeirah (picture,
--   img/questions/landmark-palm-jumeirah.jpg), Technology 300 = Quick Response (QR code),
--   History 500 = King Charles III (crowned 6 May 2023), Movies 500 = Vin Diesel (Dom Toretto),
--   Gen Z 600 = Wordle.
-- Every row has its Arabic question and answer and 2 wrong options in English and Arabic for
-- the "3 choices" helper. Review doc, fact-check sources and image licences:
-- docs/question-sets/auto-2026-11-24-2-review.md.
--
-- Count per point value: 100 = 5, 200 = 1, 300 = 1, 500 = 2, 600 = 1 (10).
-- Per category: AI 1, Cartoons & Childhood 1, Flags 1, Food & Drink 1, Who Am I? 1,
-- Landmarks 1, Technology 1, History 1, Movies 1, Gen Z 1.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- The two picture files must be deployed with it: img/questions/flag-cyprus.svg and
-- img/questions/landmark-palm-jumeirah.jpg.
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-24-2-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_24_2_seed;

CREATE TEMPORARY TABLE auto_2026_11_24_2_seed (
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

INSERT INTO auto_2026_11_24_2_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('AI', 100, 'Traffic cameras can use AI to read which part of a car, so that its owner can be sent a fine for speeding?', 'The number plate (accept licence plate, license plate, registration plate)',
   'يمكن لكاميرات المرور أن تستخدم الذكاء الاصطناعي لقراءة أي جزء من السيارة، حتى تُرسَل مخالفة السرعة إلى صاحبها؟', 'لوحة الأرقام (يُقبل: لوحة السيارة، النمرة)', '', '',
   'The tyres', 'The headlights', 'الإطارات', 'المصابيح الأمامية'),  -- 1124-2-01

  ('Cartoons & Childhood', 100, 'Which 2016 Disney animated film is named after a brave teenage girl from a Polynesian island who sails across the ocean to save her people, singing "How Far I''ll Go"?', 'Moana (accept Vaiana)',
   'ما فيلم ديزني للرسوم المتحركة الصادر عام 2016، الذي يحمل اسم فتاة شجاعة من جزيرة في بولينيزيا تُبحر عبر المحيط لتنقذ شعبها، وتغني أغنية "How Far I''ll Go"؟', 'موانا (يُقبل: فايانا)', '', '',
   'Mulan', 'Pocahontas', 'مولان', 'بوكاهونتاس'),  -- 1124-2-02

  ('Flags', 100, 'Which country does this flag belong to?', 'Cyprus',
   'إلى أي دولة ينتمي هذا العلم؟', 'قبرص', 'img/questions/flag-cyprus.svg', '',
   'Malta', 'Greece', 'مالطا', 'اليونان'),  -- 1124-2-03

  ('Food & Drink', 100, 'Which Middle Eastern street food is made of thin slices of meat or chicken shaved off a tall, slowly turning vertical spit, and wrapped in bread with garlic sauce?', 'Shawarma (accept shawerma, doner kebab, gyros)',
   'ما أكلة الشارع الشرق أوسطية المصنوعة من شرائح رفيعة من اللحم أو الدجاج تُقطَع من سيخ عمودي طويل يدور ببطء، وتُلفّ في الخبز مع صوص الثوم؟', 'الشاورما (يُقبل: دونر كباب، جيرو)', '', '',
   'Kofta', 'Kibbeh', 'الكفتة', 'الكبة'),  -- 1124-2-04

  ('Who Am I?', 100, 'I am a South American footballer, famous for my big smile and my magical tricks with the ball. I won the World Cup in 2002, and the Ballon d''Or in 2005 while I was playing for Barcelona. Who am I?', 'Ronaldinho (accept Ronaldinho Gaucho)',
   'أنا لاعب كرة قدم من أمريكا الجنوبية، اشتهرت بابتسامتي العريضة ومهاراتي السحرية بالكرة. فزت بكأس العالم عام 2002، وبالكرة الذهبية عام 2005 حين كنت ألعب لبرشلونة. من أنا؟', 'رونالدينيو (يُقبل: رونالدينيو غاوتشو)', '', '',
   'Kaka', 'Rivaldo', 'كاكا', 'ريفالدو'),  -- 1124-2-05

  ('Landmarks', 200, 'Which landmark is this?', 'Palm Jumeirah (accept The Palm, the Palm Jumeirah island)',
   'ما هذا المعلم؟', 'نخلة جميرا (يُقبل: النخلة، جزيرة النخلة جميرا)', 'img/questions/landmark-palm-jumeirah.jpg', 'NASA, Tim Kopra / Public domain',
   'The World Islands', 'Bluewaters Island', 'جزر العالم', 'جزيرة بلووترز'),  -- 1124-2-06

  ('Technology', 300, 'QR codes are the square barcodes you scan with your phone to open a restaurant menu or a website. What does "QR" stand for?', 'Quick Response (accept Quick Response code)',
   'رموز QR هي المربعات التي تمسحها بكاميرا هاتفك لتفتح قائمة الطعام في مطعم أو موقعًا إلكترونيًا. ماذا يعني الاختصار "QR"؟', 'الاستجابة السريعة (Quick Response)', '', '',
   'Quick Read', 'Quick Reference', 'القراءة السريعة', 'المرجع السريع'),  -- 1124-2-07

  ('History', 500, 'On 6 May 2023, who was crowned king at Westminster Abbey, in the first coronation held there for 70 years?', 'King Charles III (accept Charles III, King Charles, Charles)',
   'في 6 مايو 2023، من الذي تُوِّج ملكًا في كنيسة وستمنستر، في أول تتويج يُقام فيها منذ 70 عامًا؟', 'الملك تشارلز الثالث (يُقبل: تشارلز الثالث، الملك تشارلز، تشارلز)', '', '',
   'King George VI', 'King Edward VIII', 'الملك جورج السادس', 'الملك إدوارد الثامن'),  -- 1124-2-08

  ('Movies', 500, 'In the "Fast & Furious" films, starting in 2001, which actor plays Dominic "Dom" Toretto, the bald street racer who is always talking about "family"?', 'Vin Diesel (accept Diesel)',
   'في أفلام "Fast & Furious" (السريع والغاضب) منذ عام 2001، أي ممثل يؤدي دور دومينيك "دوم" توريتو، سائق السباقات الأصلع الذي لا يكفّ عن الحديث عن "العائلة"؟', 'فين ديزل (يُقبل: ديزل)', '', '',
   'Jason Statham', 'Tyrese Gibson', 'جيسون ستاثام', 'تايريس جيبسون'),  -- 1124-2-09

  ('Gen Z', 600, 'Which daily online word game became a viral craze in early 2022, giving players six tries to guess a hidden five-letter word, with green and yellow squares as clues?', 'Wordle',
   'ما لعبة الكلمات اليومية على الإنترنت التي انتشرت بجنون في أوائل 2022، وتمنح اللاعب ست محاولات لتخمين كلمة مخفية من خمسة أحرف، مع مربعات خضراء وصفراء كتلميحات؟', 'ووردل (Wordle)', '', '',
   'Connections', 'Spelling Bee', 'كونيكشنز', 'سبيلينغ بي');  -- 1124-2-10

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_24_2_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_24_2_seed;

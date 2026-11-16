-- BrainRush: automatic top-up batch 2026-11-16 (4)
-- (question-bank-manager brief, AUTO BATCH 2026-11-16-4, dated 2026-11-16)
--
-- Adds 9 questions to existing categories (no new category). Written to the owner's
-- standing preference of 2026-11-11: easier questions, mostly on subjects from 2000
-- onwards. IDs 1116-31 to 1116-40 (1116-34 removed by the owner 2026-11-16).
--   Who Am I? 200 = Keanu Reeves (film), 400 = Rihanna (music),
--     500 = Lewis Hamilton (motor sport).
--   Cartoons & Childhood 400 = Dracula ("Hotel Transylvania", 2012),
--     600 = a koala (Buster Moon in "Sing", 2016).
--   Food & Drink 600 = Dalgona coffee (2020 social media trend).
--   AI 100 = an arm (factory robot arms).
--   Landmarks 400 = 1 picture question (The Shard, completed 2012,
--     img/questions/landmark-the-shard.jpg, Lewis Hulbert / CC BY-SA 4.0).
--   Flags 500 = 1 picture question (Bangladesh, img/questions/flag-bangladesh.svg,
--     public domain).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the image
-- licences: docs/question-sets/auto-2026-11-16-4-review.md.
--
-- Count per point value: 100 = 1, 200 = 1, 400 = 3, 500 = 2, 600 = 2 (9).
-- Per category: Who Am I? 3, Cartoons & Childhood 2, Food & Drink 1, AI 1, Landmarks 1,
-- Flags 1.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-16-4-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-the-shard.jpg and img/questions/flag-bangladesh.svg
-- with it (new file names).
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_16_4_seed;

CREATE TEMPORARY TABLE auto_2026_11_16_4_seed (
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

INSERT INTO auto_2026_11_16_4_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 200, 'I am a Hollywood actor. I played Neo in "The Matrix" (1999), and in "John Wick" (2014) I played a retired hitman who takes revenge on the gangsters who killed the puppy his late wife left him. Who am I?', 'Keanu Reeves (accept Reeves, Keanu)',
   'أنا ممثل في هوليوود. لعبت دور "نيو" في فيلم "ذا ماتريكس" (The Matrix) عام 1999، وفي فيلم "جون ويك" (John Wick) عام 2014 لعبت دور قاتل مأجور معتزل ينتقم من العصابة التي قتلت الجرو الذي تركته له زوجته الراحلة. من أنا؟', 'كيانو ريفز (يُقبل: ريفز، كيانو)', '', '',
   'Tom Cruise', 'Jason Statham', 'توم كروز', 'جيسون ستاثام'),  -- 1116-31

  ('Who Am I?', 400, 'I am a singer from the Caribbean island of Barbados. My 2007 hit "Umbrella" won me my first Grammy, and in 2017 I launched my own make-up brand, Fenty Beauty. Who am I?', 'Rihanna (accept Robyn Rihanna Fenty, Robyn Fenty)',
   'أنا مغنية من جزيرة باربادوس في البحر الكاريبي. فازت أغنيتي الناجحة "أمبريلا" (Umbrella) عام 2007 بأول جائزة غرامي لي، وفي عام 2017 أطلقت علامتي الخاصة لمستحضرات التجميل "فنتي بيوتي" (Fenty Beauty). من أنا؟', 'ريهانا (يُقبل: روبن ريهانا فنتي)', '', '',
   'Beyonce', 'Nicki Minaj', 'بيونسيه', 'نيكي ميناج'),  -- 1116-32

  ('Who Am I?', 500, 'I am a racing driver. I made my Formula 1 debut with McLaren in 2007, won my first world title with them in 2008, and in 2025 I left Mercedes to drive for Ferrari. Who am I?', 'Lewis Hamilton (accept Hamilton)',
   'أنا سائق سباقات. بدأت مشواري في الفورمولا 1 مع فريق ماكلارين عام 2007، وفزت معه بأول لقب عالمي لي عام 2008، وفي عام 2025 تركت مرسيدس لأقود لفريق فيراري. من أنا؟', 'لويس هاميلتون (يُقبل: هاميلتون)', '', '',
   'Sebastian Vettel', 'Fernando Alonso', 'سيباستيان فيتل', 'فرناندو ألونسو'),  -- 1116-33

  ('Cartoons & Childhood', 400, 'In the 2012 animated film "Hotel Transylvania", which famous monster runs a hotel where monsters can hide from humans, and is an over-protective father to his teenage-looking daughter Mavis?', 'Dracula (accept Count Dracula, Drac)',
   'في فيلم الرسوم المتحركة "فندق ترانسلفانيا" (Hotel Transylvania) عام 2012، أي وحش شهير يدير فندقًا يختبئ فيه الوحوش من البشر، وهو أب شديد الخوف على ابنته مافيس؟', 'دراكولا (يُقبل: الكونت دراكولا)', '', '',
   'Frankenstein', 'The Mummy', 'فرانكنشتاين', 'المومياء'),  -- 1116-35

  ('Cartoons & Childhood', 600, 'In the 2016 animated film "Sing", the theatre owner Buster Moon, who holds a singing contest to save his theatre, is what kind of animal?', 'A koala (accept koala bear)',
   'في فيلم الرسوم المتحركة "غنّوا" (Sing) عام 2016، ما نوع الحيوان الذي يمثله صاحب المسرح "باستر مون"، الذي ينظّم مسابقة غناء لإنقاذ مسرحه؟', 'كوالا (يُقبل: دب الكوالا)', '', '',
   'A raccoon', 'A sloth', 'راكون', 'كسلان'),  -- 1116-36

  ('Food & Drink', 600, 'Which frothy coffee drink, made by whipping instant coffee, sugar and hot water and spooning it over milk, went viral on social media in 2020 and is named after a Korean sugar candy?', 'Dalgona coffee (accept Dalgona, whipped coffee)',
   'ما مشروب القهوة الرغوي، الذي يُحضَّر بخفق القهوة سريعة الذوبان مع السكر والماء الساخن ثم وضعه فوق الحليب، وانتشر بشكل واسع على مواقع التواصل عام 2020، ويحمل اسم حلوى سكرية كورية؟', 'قهوة دالغونا (يُقبل: دالغونا، القهوة المخفوقة)', '', '',
   'Affogato', 'Flat white', 'أفوغاتو', 'فلات وايت'),  -- 1116-37

  ('AI', 100, 'Many of the robots that weld and paint cars in factories are shaped like a giant version of which part of the human body?', 'An arm (accept robot arm, robotic arm)',
   'كثير من الروبوتات التي تلحم السيارات وتطليها في المصانع تشبه نسخة عملاقة من أي جزء من جسم الإنسان؟', 'الذراع (يُقبل: ذراع روبوتية)', '', '',
   'A leg', 'A finger', 'الساق', 'الإصبع'),  -- 1116-38

  ('Landmarks', 400, 'Which landmark is this?', 'The Shard (accept the Shard London Bridge, London Bridge Tower)',
   'ما هذا المعلم؟', 'ذا شارد (يُقبل: برج ذا شارد، برج لندن بريدج)', 'img/questions/landmark-the-shard.jpg', 'Lewis Hulbert / CC BY-SA 4.0',
   'One World Trade Center', 'The Gherkin', 'مركز التجارة العالمي الأول', 'ذا غيركن'),  -- 1116-39

  ('Flags', 500, 'Which country does this flag belong to?', 'Bangladesh',
   'إلى أي دولة ينتمي هذا العلم؟', 'بنغلاديش', 'img/questions/flag-bangladesh.svg', '',
   'Japan', 'Palau', 'اليابان', 'بالاو');  -- 1116-40

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_16_4_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_16_4_seed;

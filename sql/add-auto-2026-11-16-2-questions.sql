-- BrainRush: automatic top-up batch 2026-11-16 (2)
-- (question-bank-manager brief, AUTO BATCH 2026-11-16-2, drafted in a live session)
--
-- Adds 9 text questions to existing categories (no new category). Written to the owner's
-- standing preference of 2026-11-11: easier questions, mostly on subjects from 2000
-- onwards. IDs 1116-11 to 1116-19.
--   Who Am I? 100 = Amr Diab, 200 = Justin Bieber, 300 = Robert Downey Jr., 400 = Angela Merkel.
--   Cartoons & Childhood 500 = Toothless, 600 = Dory's species (regal blue tang).
--   Food & Drink 600 = Cronut.
--   AI 500 = Microsoft (OpenAI investment).
--   Movies 500 = La La Land (2017 Oscars mix-up).
-- The Landmarks 600 picture slot of the brief is NOT filled: it needs a freely licensed
-- image downloaded from Commons, which has not been done.
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc and fact-check sources:
-- docs/question-sets/auto-2026-11-16-2-review.md.
--
-- Count per point value: 100 = 1, 200 = 1, 300 = 1, 400 = 1, 500 = 3, 600 = 2 (9).
-- Per category: Who Am I? 4, Cartoons & Childhood 2, Food & Drink 1, AI 1, Movies 1.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-16-2-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_16_2_seed;

CREATE TEMPORARY TABLE auto_2026_11_16_2_seed (
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

INSERT INTO auto_2026_11_16_2_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 100, 'I am an Egyptian pop singer nicknamed "El Hadaba". My songs include "Nour El Ein" and "Tamally Maak", and I am one of the biggest stars in the Arab world. Who am I?', 'Amr Diab (accept Diab)',
   'أنا مطرب مصري لقبي "الهضبة". من أغنياتي "نور العين" و"تملي معاك"، وأنا من أكبر نجوم العالم العربي. من أنا؟', 'عمرو دياب (يُقبل: دياب)', '', '',
   'Tamer Hosny', 'Mohamed Mounir', 'تامر حسني', 'محمد منير'),  -- 1116-11

  ('Who Am I?', 200, 'I am a Canadian singer. A talent manager found me through my YouTube videos when I was a young teenager, and my 2010 hit "Baby" became one of the most watched videos on YouTube. Who am I?', 'Justin Bieber (accept Bieber)',
   'أنا مغنٍّ كندي. اكتشفني مدير أعمال موهوب من خلال فيديوهاتي على يوتيوب وأنا مراهق صغير، وأصبحت أغنيتي "بيبي" (Baby) عام 2010 من أكثر الفيديوهات مشاهدة على يوتيوب. من أنا؟', 'جاستن بيبر (يُقبل: بيبر)', '', '',
   'Shawn Mendes', 'The Weeknd', 'شون مينديز', 'ذا ويكند'),  -- 1116-12

  ('Who Am I?', 300, 'I am the American actor who played Tony Stark in "Iron Man" (2008). In 2024 I won my first Oscar, Best Supporting Actor, for playing Lewis Strauss in "Oppenheimer". Who am I?', 'Robert Downey Jr. (accept Robert Downey, Downey)',
   'أنا الممثل الأمريكي الذي لعب دور توني ستارك في فيلم "الرجل الحديدي" (Iron Man) عام 2008. وفي عام 2024 فزت بأول أوسكار لي، أفضل ممثل مساعد، عن دور لويس شتراوس في فيلم "أوبنهايمر". من أنا؟', 'روبرت داوني جونيور (يُقبل: روبرت داوني، داوني)', '', '',
   'Chris Evans', 'Mark Ruffalo', 'كريس إيفانز', 'مارك روفالو'),  -- 1116-13

  ('Who Am I?', 400, 'I was born in Hamburg but grew up in East Germany, and I trained as a physicist. In 2005 I became the first woman Chancellor of Germany and I served until 2021. Who am I?', 'Angela Merkel (accept Merkel)',
   'وُلدت في هامبورغ لكنني نشأت في ألمانيا الشرقية، ودرست الفيزياء. وفي عام 2005 أصبحت أول امرأة تتولى منصب مستشار ألمانيا، وبقيت فيه حتى عام 2021. من أنا؟', 'أنجيلا ميركل (يُقبل: ميركل)', '', '',
   'Theresa May', 'Ursula von der Leyen', 'تيريزا ماي', 'أورسولا فون دير لاين'),  -- 1116-14

  ('Cartoons & Childhood', 500, 'In the 2010 DreamWorks film "How to Train Your Dragon", what is the name of the black Night Fury dragon who becomes Hiccup''s best friend?', 'Toothless',
   'في فيلم دريم ووركس "كيف تدرب تنينك" (How to Train Your Dragon) عام 2010، ما اسم التنين الأسود من فصيلة "نايت فيوري" الذي يصبح أعز أصدقاء هيكاب؟', 'تووثليس (يُقبل: بلا أسنان)', '', '',
   'Stormfly', 'Hookfang', 'ستورمفلاي', 'هوكفانغ'),  -- 1116-15

  ('Cartoons & Childhood', 600, 'In the 2016 Pixar film "Finding Dory", what type of fish is Dory, the forgetful blue fish with a yellow tail?', 'A regal blue tang (accept blue tang, Pacific blue tang)',
   'في فيلم بيكسار "البحث عن دوري" (Finding Dory) عام 2016، ما نوع السمكة دوري، السمكة الزرقاء ناسية الأشياء ذات الذيل الأصفر؟', 'سمكة التانغ الزرقاء الملكية (يُقبل: التانغ الأزرق)', '', '',
   'A clownfish', 'An angelfish', 'سمكة المهرّج', 'سمكة الملاك'),  -- 1116-16

  ('Food & Drink', 600, 'Which pastry, a hybrid of a French pastry and a doughnut, was invented in 2013 by chef Dominique Ansel in New York and had customers queuing around the block?', 'The Cronut (accept Cronut)',
   'ما اسم الحلوى التي تجمع بين معجنات فرنسية ودونات، والتي ابتكرها الشيف دومينيك أنسل في نيويورك عام 2013، وجعلت الزبائن يقفون في طوابير طويلة أمام المخبز؟', 'الكرونات (يُقبل: كرونت)', '', '',
   'The Cruffin', 'The Duffin', 'الكرافن', 'الدافن'),  -- 1116-17

  ('AI', 500, 'Which tech giant, maker of the Windows operating system and the Xbox console, invested 1 billion dollars in OpenAI in 2019 and committed billions more in January 2023?', 'Microsoft',
   'ما الشركة التقنية العملاقة، صانعة نظام ويندوز وجهاز إكس بوكس، التي استثمرت مليار دولار في أوبن إيه آي (OpenAI) عام 2019 والتزمت بمليارات إضافية في يناير 2023؟', 'مايكروسوفت', '', '',
   'Google', 'Amazon', 'جوجل', 'أمازون'),  -- 1116-18

  ('Movies', 500, 'At the 2017 Oscars, which musical film was wrongly announced as the Best Picture winner, before the mistake was corrected and "Moonlight" was named the real winner?', 'La La Land',
   'في حفل الأوسكار عام 2017، ما الفيلم الغنائي الذي أُعلن خطأً فائزًا بجائزة أفضل فيلم، قبل أن يُصحَّح الخطأ ويُعلن أن الفائز الحقيقي هو "مونلايت"؟', 'لا لا لاند', '', '',
   'Whiplash', 'The Greatest Showman', 'ويبلاش', 'ذا غريتست شومان');  -- 1116-19

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_16_2_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_16_2_seed;

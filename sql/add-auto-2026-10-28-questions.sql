-- BrainRush: automatic top-up batch 2026-10-28 (question-bank-manager brief, AUTO BATCH)
--
-- Adds 6 questions to existing categories (no new category), towards 10 per
-- category and point value (10 written; the owner removed 4 on 2026-10-28, not replaced):
--   Who Am I? 200, 300, 400 = 1 each (Bruce Lee, Louis Pasteur, Tariq ibn Ziyad),
--                                  clue style "... Who am I?"
--   Cartoons & Childhood 500, 600 = 1 each (Samir magazine, LEGO)
--   Landmarks 600 = 1 picture question (Hagia Sophia, img/questions/landmark-hagia-sophia.jpg,
--                   Commons photo by Arild Vagen, CC BY-SA 3.0, credit in image_credit)
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the photo
-- licence: docs/question-sets/auto-2026-10-28-review.md.
--
-- Count per point value: 200 = 1, 300 = 1, 400 = 1, 500 = 1, 600 = 2 (6).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-10-28-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-hagia-sophia.jpg with it.
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_10_28_seed;

CREATE TEMPORARY TABLE auto_2026_10_28_seed (
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

INSERT INTO auto_2026_10_28_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 200, 'I was a martial artist and actor raised in Hong Kong. I founded my own fighting style, Jeet Kune Do, and died in 1973, just days before my film "Enter the Dragon" opened. Who am I?', 'Bruce Lee',
   'كنت فنان قتال وممثلًا نشأت في هونغ كونغ. أسست أسلوبي القتالي الخاص "جيت كون دو"، ومت عام 1973 قبل أيام قليلة من عرض فيلمي "دخول التنين". من أنا؟', 'بروس لي', '', '',
   'Jackie Chan', 'Jet Li', 'جاكي شان', 'جت لي'),

  ('Who Am I?', 300, 'I was a 19th-century chemist and microbiologist. In 1885 my rabies vaccine saved a boy bitten by a rabid dog, and a way of heating milk to kill germs is named after me. Who am I?', 'Louis Pasteur (accept Pasteur)',
   'كنت كيميائيًا وعالم أحياء دقيقة في القرن التاسع عشر. عام 1885 أنقذ لقاحي ضد داء الكلَب صبيًا عضّه كلب مسعور، وتحمل اسمي طريقة لتسخين الحليب لقتل الجراثيم. من أنا؟', 'لويس باستير (يُقبل: باستير)', '', '',
   'Robert Koch', 'Joseph Lister', 'روبرت كوخ', 'جوزيف ليستر'),

  ('Who Am I?', 400, 'I was a Muslim commander. In 711 I crossed from North Africa, defeated the Visigoth king Roderic and began the Muslim conquest of Spain. A famous rock at the entrance to the Mediterranean is named after me. Who am I?', 'Tariq ibn Ziyad (accept Tariq)',
   'كنت قائدًا مسلمًا. عام 711 عبرت من شمال أفريقيا، وهزمت لذريق ملك القوط الغربيين، وبدأت فتح الأندلس. ويحمل اسمي جبل شهير عند مدخل البحر المتوسط. من أنا؟', 'طارق بن زياد (يُقبل: طارق)', '', '',
   'Musa ibn Nusayr', 'Uqba ibn Nafi', 'موسى بن نصير', 'عقبة بن نافع'),

  ('Cartoons & Childhood', 500, 'Which Egyptian children''s comics magazine, first published by Dar Al-Hilal in 1956, called itself a magazine "for boys and girls from 8 to 88"?', 'Samir (accept Magallet Samir)',
   'ما اسم مجلة القصص المصورة المصرية للأطفال التي أصدرتها دار الهلال لأول مرة عام 1956، وكان شعارها أنها "للأولاد والبنات من سن 8 إلى 88"؟', 'سمير (يُقبل: مجلة سمير)', '', '',
   'Mickey', 'Alaa El-Din', 'ميكي', 'علاء الدين'),

  ('Cartoons & Childhood', 600, 'The name of the LEGO toy company is short for two Danish words, "leg godt". What do they mean in English?', 'Play well (accept play good)',
   'اسم شركة ألعاب "ليغو" اختصار لكلمتين دنماركيتين هما "ليغ غودت". ما معناهما؟', 'العب جيدًا (يُقبل: العب بشكل جيد)', '', '',
   'Build well', 'Play together', 'ابنِ جيدًا', 'العبوا معًا'),

  ('Landmarks', 600, 'Which landmark is this?', 'Hagia Sophia (accept Ayasofya, Aya Sofia, the Hagia Sophia Grand Mosque)',
   'ما هذا المعلم؟', 'آيا صوفيا (يُقبل: جامع آيا صوفيا الكبير)', 'img/questions/landmark-hagia-sophia.jpg', 'Arild Vagen / CC BY-SA 3.0',
   'The Blue Mosque', 'The Suleymaniye Mosque', 'المسجد الأزرق', 'جامع السليمانية');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_10_28_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_10_28_seed;

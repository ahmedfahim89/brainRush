-- BrainRush: automatic top-up batch 2026-11-18
-- (question-bank-manager brief, AUTO BATCH 2026-11-18, dated 2026-11-18)
--
-- Adds 10 questions to existing categories (no new category). Written to the owner's
-- standing preference of 2026-11-11: easier questions, mostly on subjects from 2000
-- onwards. IDs 1118-01 to 1118-10.
--   Who Am I? 100 = David Beckham (football), 200 = Salt Bae (viral chef, 2017).
--   AI 400 = text-to-speech (the robotic narrator voice of short videos),
--     500 = the Entity (rogue AI in "Mission: Impossible - Dead Reckoning", 2023).
--   Cartoons & Childhood 400 = "Hannah Montana" (Disney Channel, 2006),
--     500 = Beyblade (spinning-top toys and anime, 2001).
--   Food & Drink 500 = Lotus (Biscoff biscuits and spread), 600 = Sriracha.
--   Landmarks 600 = 1 picture question (Gardens by the Bay, opened 2012,
--     img/questions/landmark-gardens-by-the-bay.jpg, Balon Greyjoy / CC0).
--   Movies 600 = the Black Pearl ("Pirates of the Caribbean", 2003).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the image
-- licence: docs/question-sets/auto-2026-11-18-review.md.
--
-- Count per point value: 100 = 1, 200 = 1, 400 = 2, 500 = 3, 600 = 3 (10).
-- Per category: Who Am I? 2, AI 2, Cartoons & Childhood 2, Food & Drink 2, Landmarks 1,
-- Movies 1.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-18-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-gardens-by-the-bay.jpg with it (new file name).
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_18_seed;

CREATE TEMPORARY TABLE auto_2026_11_18_seed (
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

INSERT INTO auto_2026_11_18_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 100, 'I am an English footballer famous for my curling free kicks. I wore the number 7 shirt for Manchester United and England, and I am married to "Posh Spice" from the Spice Girls. Who am I?', 'David Beckham (accept Beckham)',
   'أنا لاعب كرة قدم إنجليزي اشتهرت بركلاتي الحرة المقوّسة. ارتديت القميص رقم 7 مع مانشستر يونايتد ومنتخب إنجلترا، وأنا متزوج من "بوش سبايس" (Posh Spice) عضوة فرقة "سبايس غيرلز" (Spice Girls). من أنا؟', 'ديفيد بيكهام (يُقبل: بيكهام)', '', '',
   'Wayne Rooney', 'Steven Gerrard', 'واين روني', 'ستيفن جيرارد'),  -- 1118-01

  ('Who Am I?', 200, 'I am a butcher and steakhouse owner. In 2017 a short video of me slicing a steak and then sprinkling salt from my fingertips down my bent arm went viral and gave me my nickname. Who am I?', 'Salt Bae (accept Nusret Gokce, Nusret)',
   'أنا جزّار وصاحب مطاعم ستيك. في عام 2017 انتشر فيديو قصير لي وأنا أقطّع قطعة ستيك ثم أرشّ الملح من أطراف أصابعي على ذراعي المثنية، فمنحني لقبي الشهير. من أنا؟', 'سولت باي (يُقبل: نصرت غوكتشه، نصرت)', '', '',
   'CZN Burak', 'Gordon Ramsay', 'الشيف بوراك', 'غوردون رامزي'),  -- 1118-02

  ('AI', 400, 'What do we call the AI technology that reads written words out loud in a computer voice, like the robotic narrator voice heard on many short social media videos?', 'Text-to-speech (accept TTS, speech synthesis)',
   'ماذا نسمّي تقنية الذكاء الاصطناعي التي تقرأ الكلمات المكتوبة بصوت عالٍ بصوت حاسوبي، مثل صوت الراوي الآلي الذي نسمعه في كثير من الفيديوهات القصيرة على مواقع التواصل؟', 'تحويل النص إلى كلام (يُقبل: TTS، تركيب الكلام)', '', '',
   'Speech-to-text', 'Voice recognition', 'تحويل الكلام إلى نص', 'التعرّف على الصوت'),  -- 1118-03

  ('AI', 500, 'In the 2023 film "Mission: Impossible - Dead Reckoning Part One", what name is given to the rogue AI that Tom Cruise''s character, Ethan Hunt, fights against?', 'The Entity (accept Entity)',
   'في فيلم "المهمة المستحيلة - الحساب الأخير: الجزء الأول" (Mission: Impossible - Dead Reckoning Part One) عام 2023، ما الاسم الذي يُطلق على الذكاء الاصطناعي الخارج عن السيطرة الذي تحاربه شخصية توم كروز، إيثان هانت؟', 'الكيان (The Entity)', '', '',
   'The Machine', 'The Architect', 'الآلة', 'المهندس'),  -- 1118-04

  ('Cartoons & Childhood', 400, 'Which Disney Channel series, first shown in 2006, starred Miley Cyrus as a schoolgirl who secretly lives a double life as a famous pop star in a blonde wig?', 'Hannah Montana',
   'ما مسلسل قناة ديزني الذي عُرض لأول مرة عام 2006، وأدّت فيه مايلي سايرس دور تلميذة تعيش سرًا حياة مزدوجة كنجمة بوب شهيرة ترتدي باروكة شقراء؟', 'هانا مونتانا', '', '',
   'iCarly', 'Lizzie McGuire', 'آي كارلي', 'ليزي ماغواير'),  -- 1118-05

  ('Cartoons & Childhood', 500, 'Which battling spinning-top toys from Japan, with their own anime series from 2001, were launched by pulling a ripcord while shouting "3, 2, 1, Let it rip!"?', 'Beyblade (accept Beyblades)',
   'ما ألعاب البلبل (الخذروف) القتالية اليابانية، التي كان لها مسلسل أنمي خاص بها منذ عام 2001، وكانت تُطلق بسحب شريط مع الصياح: "3، 2، 1، انطلق!" (Let it rip)؟', 'بي بليد (Beyblade)', '', '',
   'Bakugan', 'Yu-Gi-Oh!', 'باكوغان', 'يو-غي-يو'),  -- 1118-06

  ('Food & Drink', 500, 'Which brand of crunchy caramelised biscuit, first baked in Belgium in 1932 and often served with coffee, is also sold as a spread and became a hugely popular flavour for cheesecakes and desserts?', 'Lotus (accept Lotus Biscoff, Biscoff, speculoos)',
   'ما علامة البسكويت المكرمل المقرمش، الذي خُبز لأول مرة في بلجيكا عام 1932 ويُقدَّم غالبًا مع القهوة، ويُباع أيضًا كزبدة للدهن، وأصبح نكهة شهيرة جدًا للتشيز كيك والحلويات؟', 'لوتس (يُقبل: لوتس بيسكوف، بيسكوف، سبيكولوس)', '', '',
   'Oreo', 'McVitie''s', 'أوريو', 'ماكفيتيز'),  -- 1118-07

  ('Food & Drink', 600, 'Which hot chilli sauce, sold in a clear squeeze bottle with a green cap and a rooster on the label, is named after a seaside town in Southeast Asia?', 'Sriracha (accept sriracha sauce, rooster sauce)',
   'ما صلصة الفلفل الحار التي تُباع في زجاجة شفافة تُعصر بغطاء أخضر وعليها صورة ديك، وتحمل اسم بلدة ساحلية في جنوب شرق آسيا؟', 'سريراتشا (يُقبل: صلصة سريراتشا، صلصة الديك)', '', '',
   'Tabasco', 'Peri-peri', 'تاباسكو', 'بيري بيري'),  -- 1118-08

  ('Landmarks', 600, 'Which landmark is this?', 'Gardens by the Bay (accept the Supertree Grove, the Supertrees)',
   'ما هذا المعلم؟', 'حدائق الخليج في سنغافورة (Gardens by the Bay) (يُقبل: الأشجار العملاقة، سوبرتري)', 'img/questions/landmark-gardens-by-the-bay.jpg', 'Balon Greyjoy / CC0',
   'The Metropol Parasol', 'Jewel Changi Airport', 'متروبول باراسول', 'جويل مطار شانغي'),  -- 1118-09

  ('Movies', 600, 'In the "Pirates of the Caribbean" films, starting in 2003, what is the name of Captain Jack Sparrow''s ship with black sails?', 'The Black Pearl (accept Black Pearl)',
   'في أفلام "قراصنة الكاريبي" (Pirates of the Caribbean) التي بدأت عام 2003، ما اسم سفينة القبطان جاك سبارو ذات الأشرعة السوداء؟', 'اللؤلؤة السوداء (Black Pearl)', '', '',
   'The Flying Dutchman', 'Queen Anne''s Revenge', 'الهولندي الطائر', 'انتقام الملكة آن');  -- 1118-10

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_18_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_18_seed;

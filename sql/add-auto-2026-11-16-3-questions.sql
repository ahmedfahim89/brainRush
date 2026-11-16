-- BrainRush: automatic top-up batch 2026-11-16 (3)
-- (question-bank-manager brief, AUTO BATCH 2026-11-16-3)
--
-- Adds 10 questions to existing categories (no new category). Written to the owner's
-- standing preference of 2026-11-11: easier questions, mostly on subjects from 2000
-- onwards. IDs 1116-21 to 1116-30.
--   Who Am I? 100 = Jackie Chan (film), 500 = Gordon Ramsay (food TV),
--     600 = Mohamed ElBaradei (diplomacy, 2005 Nobel Peace Prize).
--   Cartoons & Childhood 200 = "Masha and the Bear" (2009), 300 = Merida ("Brave", 2012),
--     500 = EVE ("WALL-E", 2008).
--   Food & Drink 400 = hazelnuts (Nutella), 500 = wasabi.
--   AI 600 = Stargate (January 2025 AI infrastructure project).
--   Landmarks 600 = 1 picture question (Taipei 101, completed 2004,
--     img/questions/landmark-taipei-101.jpg, AngMoKio / CC BY-SA 3.0).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the image
-- licence: docs/question-sets/auto-2026-11-16-3-review.md.
--
-- Count per point value: 100 = 1, 200 = 1, 300 = 1, 400 = 1, 500 = 3, 600 = 3 (10).
-- Per category: Who Am I? 3, Cartoons & Childhood 3, Food & Drink 2, AI 1, Landmarks 1.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-16-3-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-taipei-101.jpg with it (new file name).
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_16_3_seed;

CREATE TEMPORARY TABLE auto_2026_11_16_3_seed (
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

INSERT INTO auto_2026_11_16_3_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 100, 'I am a martial arts film star from Hong Kong, famous for doing my own dangerous stunts and for funny fight scenes. I starred with Chris Tucker in the "Rush Hour" films. Who am I?', 'Jackie Chan (accept Chan)',
   'أنا نجم أفلام فنون قتالية من هونغ كونغ، اشتهرت بأداء مشاهدي الخطرة بنفسي وبمشاهد القتال المضحكة. شاركت كريس تاكر بطولة سلسلة أفلام "ساعة الذروة" (Rush Hour). من أنا؟', 'جاكي شان (يُقبل: شان)', '', '',
   'Jet Li', 'Donnie Yen', 'جيت لي', 'دوني ين'),  -- 1116-21

  ('Who Am I?', 500, 'I am a Scottish-born chef, famous for my temper and for shouting at cooks on TV shows such as "Hell''s Kitchen" and "Kitchen Nightmares". My London restaurant won three Michelin stars in 2001. Who am I?', 'Gordon Ramsay (accept Ramsay)',
   'أنا طاهٍ اسكتلندي المولد، مشهور بعصبيتي وبالصراخ على الطهاة في برامج تلفزيونية مثل "مطبخ الجحيم" (Hell''s Kitchen) و"كوابيس المطبخ" (Kitchen Nightmares). حصل مطعمي في لندن على ثلاث نجوم ميشلان عام 2001. من أنا؟', 'جوردون رامزي (يُقبل: رامزي)', '', '',
   'Jamie Oliver', 'Heston Blumenthal', 'جيمي أوليفر', 'هستون بلومنثال'),  -- 1116-22

  ('Who Am I?', 600, 'I am an Egyptian lawyer and diplomat. From 1997 to 2009 I led the International Atomic Energy Agency, the UN''s nuclear watchdog, and in 2005 the agency and I shared the Nobel Peace Prize. Who am I?', 'Mohamed ElBaradei (accept ElBaradei, El Baradei)',
   'أنا محامٍ ودبلوماسي مصري. ترأست الوكالة الدولية للطاقة الذرية، الجهة الرقابية النووية التابعة للأمم المتحدة، من 1997 إلى 2009، وفي عام 2005 تقاسمت أنا والوكالة جائزة نوبل للسلام. من أنا؟', 'محمد البرادعي (يُقبل: البرادعي)', '', '',
   'Boutros Boutros-Ghali', 'Amr Moussa', 'بطرس بطرس غالي', 'عمرو موسى'),  -- 1116-23

  ('Cartoons & Childhood', 200, 'Which Russian cartoon, first shown in 2009 and hugely popular on YouTube, follows a mischievous little girl and the big bear, a retired circus star, whom she never stops pestering?', 'Masha and the Bear (accept Masha)',
   'ما الكرتون الروسي الذي عُرض لأول مرة عام 2009 وحقق شعبية هائلة على يوتيوب، ويحكي عن طفلة صغيرة شقية ودبّ ضخم، نجم سيرك متقاعد، لا تتوقف عن إزعاجه؟', 'ماشا والدب (يُقبل: ماشا)', '', '',
   'Peppa Pig', 'Shaun the Sheep', 'بيبا بيغ', 'الخروف شون'),  -- 1116-24

  ('Cartoons & Childhood', 300, 'In the Pixar film "Brave" (2012), what is the name of the red-haired Scottish princess whose mother is turned into a bear by a witch''s spell?', 'Merida (accept Princess Merida)',
   'في فيلم بيكسار "شجاعة" (Brave) عام 2012، ما اسم الأميرة الاسكتلندية ذات الشعر الأحمر التي تتحوّل أمها إلى دبّة بسبب تعويذة ساحرة؟', 'ميريدا (يُقبل: الأميرة ميريدا)', '', '',
   'Ariel', 'Elinor', 'آرييل', 'إلينور'),  -- 1116-25

  ('Cartoons & Childhood', 500, 'In the Pixar film "WALL-E" (2008), what is the name of the sleek white robot sent to Earth to search for plant life, whom the little trash-collecting robot falls in love with?', 'EVE (accept Eve)',
   'في فيلم بيكسار "وول-إي" (WALL-E) عام 2008، ما اسم الروبوت الأبيض الأنيق الذي أُرسل إلى الأرض للبحث عن النباتات، والذي يقع روبوت جمع القمامة الصغير في حبه؟', 'إيف', '', '',
   'AUTO', 'M-O', 'أوتو', 'إم-أو'),  -- 1116-26

  ('Food & Drink', 400, 'Nutella, the famous chocolate spread made by the Italian company Ferrero, gets its flavour from cocoa and which roasted nut?', 'Hazelnuts (accept hazelnut, filberts)',
   'نوتيلا، كريمة الشوكولاتة الشهيرة التي تصنعها شركة فيريرو الإيطالية، تستمد نكهتها من الكاكاو ومن أي نوع من المكسرات المحمّصة؟', 'البندق', '', '',
   'Almonds', 'Peanuts', 'اللوز', 'الفول السوداني'),  -- 1116-27

  ('Food & Drink', 500, 'Which hot green paste, served with sushi, is made from the grated stem of a Japanese plant, though most restaurants outside Japan serve horseradish dyed green instead?', 'Wasabi',
   'ما المعجون الأخضر الحار الذي يُقدَّم مع السوشي، ويُصنع من الساق المبشورة لنبات ياباني، مع أن معظم المطاعم خارج اليابان تقدّم بدلًا منه فجلًا حارًا ملوّنًا بالأخضر؟', 'الواسابي', '', '',
   'Miso', 'Karashi', 'الميسو', 'الكاراشي'),  -- 1116-28

  ('AI', 600, 'What name was given to the AI data-centre project, worth up to 500 billion dollars, that OpenAI, SoftBank and Oracle announced at the White House in January 2025?', 'Stargate (accept the Stargate Project)',
   'ما الاسم الذي أُطلق على مشروع مراكز بيانات الذكاء الاصطناعي، بقيمة تصل إلى 500 مليار دولار، الذي أعلنته أوبن إيه آي (OpenAI) وسوفت بنك وأوراكل في البيت الأبيض في يناير 2025؟', 'ستارغيت (يُقبل: مشروع ستارغيت)', '', '',
   'Skynet', 'Apollo', 'سكاي نت', 'أبولو'),  -- 1116-29

  ('Landmarks', 600, 'Which landmark is this?', 'Taipei 101 (accept the Taipei 101 tower, the Taipei World Financial Center)',
   'ما هذا المعلم؟', 'تايبيه 101 (يُقبل: برج تايبيه 101)', 'img/questions/landmark-taipei-101.jpg', 'AngMoKio / CC BY-SA 3.0',
   'Jin Mao Tower', 'Shanghai Tower', 'برج جين ماو', 'برج شنغهاي');  -- 1116-30

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_16_3_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_16_3_seed;

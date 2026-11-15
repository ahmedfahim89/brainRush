-- BrainRush: automatic top-up batch 2026-11-16
-- (question-bank-manager brief, AUTO BATCH, 2026-11-16)
--
-- Adds 10 questions to existing categories (no new category). Written to the owner's
-- standing preference of 2026-11-11: easier questions, mostly on subjects from 2000
-- onwards. IDs 1116-01 to 1116-10.
--   Cartoons & Childhood 400 = 1 (Lotso, "Toy Story 3" 2010), 600 = 2 (Mr. Ping,
--     "Kung Fu Panda" 2008, and a platypus, "Phineas and Ferb" 2007).
--   Food & Drink 600 = 2 (paella, durian).
--   Who Am I? 500 = 1 (Zaha Hadid), 600 = 2 (Magdi Yacoub, Hassan Shehata).
--   AI 600 = 1 (Pepper, SoftBank's 2014 humanoid robot).
--   Landmarks 600 = 1 picture question (the Gherkin, London, opened 2004,
--     img/questions/landmark-gherkin.jpg, Diliff / CC BY-SA 3.0).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the image
-- licence: docs/question-sets/auto-2026-11-16-review.md.
--
-- Count per point value: 400 = 1, 500 = 1, 600 = 8 (10).
-- Per category: Cartoons & Childhood 3, Food & Drink 2, Who Am I? 3, AI 1, Landmarks 1.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-16-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-gherkin.jpg with it (new file name).
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_16_seed;

CREATE TEMPORARY TABLE auto_2026_11_16_seed (
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

INSERT INTO auto_2026_11_16_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Cartoons & Childhood', 400, 'In the Pixar film "Toy Story 3" (2010), what is the name of the cuddly pink teddy bear who smells of strawberries but secretly rules Sunnyside Daycare like a tyrant?', 'Lotso (accept Lots-o''-Huggin'' Bear)',
   'في فيلم بيكسار "قصة لعبة 3" (Toy Story 3) عام 2010، ما اسم الدبدوب الوردي اللطيف الذي تفوح منه رائحة الفراولة، لكنه يحكم حضانة "سانيسايد" سرًّا كطاغية؟', 'لوتسو', '', '',
   'Big Baby', 'Stinky Pete', 'بيغ بيبي', 'ستينكي بيت'),  -- 1116-01

  ('Cartoons & Childhood', 600, 'In the "Kung Fu Panda" films, what is the name of the goose who runs a noodle shop and raised the panda hero as his son?', 'Mr. Ping (accept Ping)',
   'في أفلام "كونغ فو باندا"، ما اسم الإوزّ صاحب مطعم النودلز الذي ربّى بطل الباندا كأنه ابنه؟', 'السيد بينغ (يُقبل: بينغ)', '', '',
   'Master Shifu', 'Master Oogway', 'المعلم شيفو', 'المعلم أوغواي'),  -- 1116-02

  ('Cartoons & Childhood', 600, 'In the cartoon "Phineas and Ferb", the boys'' pet Perry is secretly a spy known as "Agent P". What kind of animal is he?', 'A platypus (accept duck-billed platypus)',
   'في كرتون "فينياس وفيرب"، الحيوان الأليف "بيري" جاسوس سرّي يُعرف باسم "العميل P". ما نوع هذا الحيوان؟', 'خُلد الماء (يُقبل: البلاتيبوس، منقار البط)', '', '',
   'An otter', 'A beaver', 'ثعلب الماء', 'القندس'),  -- 1116-03

  ('Food & Drink', 600, 'Which Spanish rice dish from Valencia, often made with chicken, rabbit or seafood, takes its name from the wide, shallow pan it is cooked in?', 'Paella',
   'ما طبق الأرز الإسباني القادم من فالنسيا، الذي يُطبخ غالبًا بالدجاج أو الأرانب أو المأكولات البحرية، ويحمل اسم المقلاة الواسعة الضحلة التي يُطبخ فيها؟', 'الباييلا', '', '',
   'Arroz negro', 'Arroz con pollo', 'أروث نيغرو', 'أروث كون بويو'),  -- 1116-04

  ('Food & Drink', 600, 'Which spiky tropical fruit from Southeast Asia smells so strong that it is banned on Singapore''s trains and in many hotels?', 'Durian',
   'ما الفاكهة الاستوائية الشائكة من جنوب شرق آسيا، التي رائحتها قوية جدًا لدرجة أنها ممنوعة في قطارات سنغافورة وفي كثير من الفنادق؟', 'الدوريان', '', '',
   'Jackfruit', 'Rambutan', 'الجاك فروت', 'الرامبوتان'),  -- 1116-05

  ('Who Am I?', 500, 'I was an Iraqi-born British architect, famous for flowing, curved buildings such as the Heydar Aliyev Center in Baku. In 2004 I became the first woman to win the Pritzker Prize, architecture''s top award. Who am I?', 'Zaha Hadid (accept Hadid)',
   'كنت مهندسة معمارية بريطانية من أصل عراقي، اشتهرت بمبانٍ منحنية انسيابية مثل مركز حيدر علييف في باكو. وفي عام 2004 أصبحت أول امرأة تفوز بجائزة بريتزكر، أرفع جائزة في العمارة. من أنا؟', 'زها حديد (يُقبل: حديد)', '', '',
   'Kazuyo Sejima', 'Gae Aulenti', 'كازويو سيجيما', 'غاي أولينتي'),  -- 1116-06

  ('Who Am I?', 600, 'I am an Egyptian heart surgeon. I led the heart transplant programme at Harefield Hospital in England and was knighted in 1992. In 2009 I opened a heart centre in Upper Egypt that treats patients for free. Who am I?', 'Magdi Yacoub (accept Sir Magdi Yacoub, Yacoub)',
   'أنا جرّاح قلب مصري. قدت برنامج زراعة القلب في مستشفى هيرفيلد في إنجلترا، ومُنحت لقب "سير" عام 1992. وفي عام 2009 افتتحت مركزًا للقلب في صعيد مصر يعالج المرضى مجانًا. من أنا؟', 'مجدي يعقوب (يُقبل: السير مجدي يعقوب)', '', '',
   'Mohamed Ghoneim', 'Hamdi El-Sayed', 'محمد غنيم', 'حمدي السيد'),  -- 1116-07

  ('Who Am I?', 600, 'I am an Egyptian football coach. I led Egypt to three Africa Cup of Nations titles in a row, the first coach ever to do so, and at the 2009 Confederations Cup my team beat the world champions. Who am I?', 'Hassan Shehata (accept Shehata)',
   'أنا مدرب كرة قدم مصري. قدت منتخب مصر للفوز بكأس الأمم الأفريقية ثلاث مرات متتالية، وكنت أول مدرب يحقق ذلك، وفي كأس القارات 2009 هزم فريقي بطل العالم. من أنا؟', 'حسن شحاتة (يُقبل: شحاتة)', '', '',
   'Mahmoud El-Gohary', 'Hossam El-Badry', 'محمود الجوهري', 'حسام البدري'),  -- 1116-08

  ('AI', 600, 'Which humanoid robot, unveiled by the Japanese company SoftBank in 2014 and often seen greeting customers in shops, was designed to read people''s emotions?', 'Pepper',
   'ما اسم الروبوت الشبيه بالإنسان الذي كشفت عنه شركة سوفت بنك اليابانية عام 2014، وكثيرًا ما يُرى وهو يرحّب بالزبائن في المتاجر، وقد صُمّم ليقرأ مشاعر الناس؟', 'بيبر', '', '',
   'NAO', 'Ameca', 'ناو', 'أميكا'),  -- 1116-09

  ('Landmarks', 600, 'Which landmark is this?', 'The Gherkin (accept 30 St Mary Axe, the Swiss Re Building)',
   'ما هذا المعلم؟', 'ذا غيركن (يُقبل: مبنى الخيارة، 30 سانت ماري آكس)', 'img/questions/landmark-gherkin.jpg', 'Diliff / CC BY-SA 3.0',
   'The Shard', 'The Walkie-Talkie', 'ذا شارد', 'ووكي توكي');  -- 1116-10

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_16_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_16_seed;

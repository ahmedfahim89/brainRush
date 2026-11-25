-- BrainRush: automatic top-up batch 2026-11-25-2
-- (question-bank-manager brief, AUTO BATCH dated 2026-11-25; second batch of the day)
--
-- File name: the brief asked for sql/add-auto-2026-11-25-questions.sql, but that file already
-- holds the first 2026-11-25 batch (Autopilot, Bluey, Thailand, ...), which is committed and
-- loaded locally. This batch follows the same-day precedent (add-auto-2026-11-24-2-questions.sql)
-- and uses the "-2" suffix and IDs 1125-2-01 to 1125-2-10, so nothing earlier is overwritten.
--
-- Adds 10 questions to existing categories (no new category): 6 text and 4 picture questions.
-- Written to the owner's standing preference of 2026-11-11: easier questions, mostly on
-- subjects from 2000 onwards, and to the owner's request of 2026-11-25 (Who Am I? pioneers,
-- picture allowed).
--   AI 400 = Akinator (2007 genie guessing game; moved from 300 by the owner).
--   AI 400 = bias (AI bias, e.g. the hiring tool Amazon dropped in 2018).
--   Cartoons & Childhood 400 = Sadness ("Inside Out", 2015; moved from 300 by the owner).
--   Cartoons & Childhood 500 = Marlin ("Finding Nemo", 2003; moved from 400 by the owner).
--   Flags 300 = Singapore (picture, img/questions/flag-singapore.svg).
--   Flags 400 = Ghana (picture, img/questions/flag-ghana.svg).
--   Landmarks 400 = One World Trade Center (picture, img/questions/landmark-one-world-trade-center.jpg).
--   Food & Drink 600 = Prime (Logan Paul and KSI's drink, 2022).
--   Technology 600 = the Galaxy Note 7 (2016 recall).
--   Who Am I? 300 = Steve Jobs (picture, img/questions/person-steve-jobs.jpg).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and image sources:
-- docs/question-sets/auto-2026-11-25-2-review.md.
--
-- Count per point value: 300 = 2, 400 = 5, 500 = 1, 600 = 2 (10).
-- Per category: AI 2, Cartoons & Childhood 2, Flags 2, Landmarks 1, Food & Drink 1,
-- Technology 1, Who Am I? 1.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-25-2-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy these new image files with it (new names, nothing replaced):
--   img/questions/flag-singapore.svg, img/questions/flag-ghana.svg,
--   img/questions/landmark-one-world-trade-center.jpg, img/questions/person-steve-jobs.jpg
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_25_2_seed;

CREATE TEMPORARY TABLE auto_2026_11_25_2_seed (
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

INSERT INTO auto_2026_11_25_2_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit,
                                    wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('AI', 400, 'Which online game, starring a cartoon genie in a turban, uses AI to guess the character you are thinking of by asking you yes-or-no questions?',
   'Akinator',
   'ما اللعبة الإلكترونية التي يظهر فيها جني كرتوني يرتدي عمامة، وتستخدم الذكاء الاصطناعي لتخمين الشخصية التي تفكر فيها بطرح أسئلة تجيب عنها بنعم أو لا؟',
   'أكيناتور (Akinator)', '', '',
   'Cleverbot', 'Talking Tom', 'كليفربوت', 'توكينغ توم'),  -- 1125-2-01
  ('AI', 400, 'When an AI treats some groups of people unfairly because of the data it learned from, for example favouring men over women when sorting job applications, what is this problem called?',
   'Bias (accept AI bias, algorithmic bias, discrimination, AI discrimination)',
   'عندما يعامل الذكاء الاصطناعي بعض فئات الناس بشكل غير عادل بسبب البيانات التي تعلّم منها، مثل تفضيل الرجال على النساء عند فرز طلبات التوظيف، ماذا تُسمى هذه المشكلة؟',
   'التحيز (يُقبل: تحيز الذكاء الاصطناعي، التحيز الخوارزمي، التمييز)', '', '',
   'Hallucination', 'Glitch', 'الهلوسة', 'الخلل التقني'),  -- 1125-2-02
  ('Cartoons & Childhood', 400, 'In the Pixar film "Inside Out" (2015), five emotions live inside the head of a girl called Riley. Joy is yellow and Anger is red. What is the name of the blue emotion?',
   'Sadness',
   'في فيلم بيكسار "Inside Out" (قلبًا وقالبًا) عام 2015، تعيش خمسة مشاعر داخل رأس فتاة اسمها رايلي. شعور الفرح لونه أصفر، وشعور الغضب لونه أحمر. ما اسم الشعور ذي اللون الأزرق؟',
   'حزن (Sadness)', '', '',
   'Fear', 'Disgust', 'خوف', 'قرف'),  -- 1125-2-03
  ('Cartoons & Childhood', 500, 'In the 2003 Pixar film about a little clownfish who is taken from his home on the Great Barrier Reef, what is the name of his nervous, over-protective father, who crosses the ocean with Dory to find him?',
   'Marlin',
   'في فيلم بيكسار الصادر عام 2003 عن سمكة مهرج صغيرة تُخطف من بيتها في الحاجز المرجاني العظيم، ما اسم أبيها القلق شديد الحرص، الذي يعبر المحيط مع "دوري" ليجده؟',
   'مارلن (Marlin)', '', '',
   'Gill', 'Crush', 'جيل', 'كراش'),  -- 1125-2-04
  ('Flags', 300, 'Which country does this flag belong to?',
   'Singapore',
   'إلى أي دولة ينتمي هذا العلم؟',
   'سنغافورة', 'img/questions/flag-singapore.svg', '',
   'Indonesia', 'Turkey', 'إندونيسيا', 'تركيا'),  -- 1125-2-05
  ('Flags', 400, 'Which country does this flag belong to?',
   'Ghana',
   'إلى أي دولة ينتمي هذا العلم؟',
   'غانا', 'img/questions/flag-ghana.svg', '',
   'Bolivia', 'Cameroon', 'بوليفيا', 'الكاميرون'),  -- 1125-2-06
  ('Landmarks', 400, 'Which landmark is this?',
   'One World Trade Center (accept 1 WTC, the Freedom Tower, the World Trade Center)',
   'ما هذا المعلم؟',
   'مركز التجارة العالمي الأول (يُقبل: برج الحرية، مركز التجارة العالمي)', 'img/questions/landmark-one-world-trade-center.jpg', 'Christian David / CC BY-SA 4.0, resized',
   'Willis Tower', 'Shanghai Tower', 'برج ويليس', 'برج شنغهاي'),  -- 1125-2-07
  ('Food & Drink', 600, 'Which sports drink brand, sold in brightly coloured bottles, was launched in 2022 by the YouTube stars and boxers Logan Paul and KSI?',
   'Prime (accept Prime Hydration)',
   'ما العلامة التجارية لمشروب الرياضيين، التي تُباع في زجاجات ملونة زاهية، وأطلقها نجما يوتيوب والملاكمان لوغان بول وKSI عام 2022؟',
   'برايم (Prime)', '', '',
   'Gatorade', 'Powerade', 'جاتوريد', 'باوريد'),  -- 1125-2-08
  ('Technology', 600, 'In 2016, which Samsung smartphone was recalled worldwide and then stopped for good, after its batteries overheated and some phones caught fire?',
   'The Galaxy Note 7 (accept Note 7, Galaxy Note7)',
   'في عام 2016، أي هاتف ذكي من سامسونج سُحب من الأسواق حول العالم ثم أُوقف إنتاجه نهائيًا، بعد أن سخنت بطارياته واشتعلت النار في بعض الأجهزة؟',
   'جالاكسي نوت 7 (يُقبل: نوت 7)', '', '',
   'The Galaxy S7', 'The Galaxy Note 5', 'جالاكسي إس 7', 'جالاكسي نوت 5'),  -- 1125-2-09
  ('Who Am I?', 300, 'Who is this American pioneer of personal computers and smartphones?',
   'Steve Jobs (accept Jobs)',
   'من هو هذا الرائد الأمريكي في صناعة الحواسيب الشخصية والهواتف الذكية؟',
   'ستيف جوبز (يُقبل: جوبز)', 'img/questions/person-steve-jobs.jpg', 'Photo: Matthew Yohe, CC BY-SA 3.0, cropped and resized',
   'Bill Gates', 'Steve Wozniak', 'بيل غيتس', 'ستيف وزنياك');  -- 1125-2-10

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_25_2_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_25_2_seed;

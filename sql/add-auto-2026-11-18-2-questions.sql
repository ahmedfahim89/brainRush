-- BrainRush: automatic top-up batch 2026-11-18 (second batch of the day)
-- (question-bank-manager brief, AUTO BATCH 2026-11-18-2, dated 2026-11-18)
--
-- Adds 10 questions to existing categories (no new category). Written to the owner's
-- standing preference of 2026-11-11: easier questions, mostly on subjects from 2000
-- onwards. IDs 1118-11 to 1118-20 (1118-01 to 1118-10 are the first batch of the day).
--   Who Am I? 300 = Nancy Ajram (singer), 400 = Khaby Lame (social media),
--     500 = James Cameron (film director), 600 = Ahmed Khaled Tawfik (writer).
--   AI 600 = "Westworld" (HBO series, 2016).
--   Cartoons & Childhood 100 = "Frozen" (Disney, 2013).
--   Food & Drink 300 = KFC (11 herbs and spices).
--   Landmarks 400 = 1 picture question (the London Eye, opened 2000,
--     img/questions/landmark-london-eye.jpg, King of Hearts / CC BY-SA 4.0).
--   Movies 500 = Quidditch ("Harry Potter" films, 2001 to 2011).
--   Gen Z 600 = ASMR (autonomous sensory meridian response).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the image
-- licence: docs/question-sets/auto-2026-11-18-2-review.md.
--
-- Count per point value: 100 = 1, 300 = 2, 400 = 2, 500 = 2, 600 = 3 (10).
-- Per category: Who Am I? 4, AI 1, Cartoons & Childhood 1, Food & Drink 1, Landmarks 1,
-- Movies 1, Gen Z 1.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-18-2-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-london-eye.jpg with it (new file name).
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_18_2_seed;

CREATE TEMPORARY TABLE auto_2026_11_18_2_seed (
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

INSERT INTO auto_2026_11_18_2_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 300, 'I am a Lebanese pop singer. My hit song "Akhasmak Ah" made me a star in 2003, and I later sat on the judging panel of the TV talent show "Arab Idol". Who am I?', 'Nancy Ajram (accept Nancy)',
   'أنا مطربة بوب لبنانية. جعلتني أغنيتي "أخاصمك آه" نجمة عام 2003، ثم أصبحت لاحقًا عضوة في لجنة تحكيم برنامج المواهب التلفزيوني "عرب آيدول" (Arab Idol). من أنا؟', 'نانسي عجرم (يُقبل: نانسي)', '', '',
   'Haifa Wehbe', 'Elissa', 'هيفاء وهبي', 'إليسا'),  -- 1118-11

  ('Who Am I?', 400, 'I was born in Senegal and grew up in Italy. After losing my factory job in 2020, I became world famous for short silent videos in which I mock over-complicated "life hacks" by showing the easy way with my open hands. Who am I?', 'Khaby Lame (accept Khaby, Khabane Lame)',
   'وُلدتُ في السنغال ونشأتُ في إيطاليا. بعد أن فقدتُ عملي في مصنع عام 2020، اشتهرتُ في العالم كله بفيديوهات قصيرة صامتة أسخر فيها من "حيل الحياة" المعقّدة، فأُظهر الطريقة السهلة بيديّ المفتوحتين. من أنا؟', 'خابي لام (يُقبل: خابي، خابان لام)', '', '',
   'Zach King', 'Charli D''Amelio', 'زاك كينغ', 'تشارلي داميليو'),  -- 1118-12

  ('Who Am I?', 500, 'I am a film director. I made "Titanic" (1997) and "Avatar" (2009), and in 2012 I dived alone in a small submarine to the deepest point of the ocean. Who am I?', 'James Cameron (accept Cameron)',
   'أنا مخرج سينمائي. أخرجتُ فيلمَي "تايتانيك" (Titanic) عام 1997 و"أفاتار" (Avatar) عام 2009، وفي عام 2012 غصتُ وحدي في غوّاصة صغيرة إلى أعمق نقطة في المحيط. من أنا؟', 'جيمس كاميرون (يُقبل: كاميرون)', '', '',
   'Peter Jackson', 'Ridley Scott', 'بيتر جاكسون', 'ريدلي سكوت'),  -- 1118-13

  ('Who Am I?', 600, 'I was an Egyptian doctor and horror writer. My pocket-novel hero Dr. Refaat Ismail came to Netflix in 2020 in "Paranormal" ("Ma Wara'' El Tabia"), and my novel "Utopia" imagined a gated city for the rich. Who am I?', 'Ahmed Khaled Tawfik (accept Ahmed Khaled Towfik, Tawfik)',
   'كنتُ طبيبًا وكاتب رعب مصريًا. وصل بطل رواياتي للجيب، الدكتور رفعت إسماعيل، إلى نتفليكس عام 2020 في مسلسل "ما وراء الطبيعة" (Paranormal)، وتخيّلتُ في روايتي "يوتوبيا" مدينة مسوّرة للأغنياء. من أنا؟', 'أحمد خالد توفيق (يُقبل: توفيق)', '', '',
   'Nabil Farouk', 'Alaa Al Aswany', 'نبيل فاروق', 'علاء الأسواني'),  -- 1118-14

  ('AI', 600, 'Which HBO series, first shown in 2016, is set in a Wild West theme park where rich guests are served by lifelike AI robots called "hosts"?', 'Westworld',
   'ما مسلسل HBO الذي عُرض لأول مرة عام 2016، وتدور أحداثه في مدينة ملاهٍ على طراز الغرب الأمريكي القديم، يخدم فيها الزوارَ الأثرياء روبوتاتُ ذكاء اصطناعي تشبه البشر تُسمّى "المضيفين" (hosts)؟', 'ويستوورلد (Westworld)', '', '',
   'Humans', 'Altered Carbon', 'هيومنز', 'ألترد كاربون'),  -- 1118-15

  ('Cartoons & Childhood', 100, 'Which 2013 Disney animated film follows two royal sisters, Anna and Elsa, and features the hit song "Let It Go"?', 'Frozen',
   'ما فيلم ديزني للرسوم المتحركة الذي صدر عام 2013 ويروي قصة أختين من الأسرة المالكة، آنا وإلسا، ومن أغانيه الشهيرة أغنية "Let It Go"؟', 'فروزن (يُقبل: ملكة الثلج)', '', '',
   'Tangled', 'Moana', 'تانجلد', 'موانا'),  -- 1118-16

  ('Food & Drink', 300, 'Which fried chicken chain, whose logo shows the face of its white-haired, bearded founder, keeps the blend of 11 herbs and spices in its Original Recipe a secret?', 'KFC (accept Kentucky Fried Chicken, Kentucky)',
   'ما سلسلة مطاعم الدجاج المقلي التي يظهر على شعارها وجه مؤسسها ذي الشعر الأبيض واللحية، وتحتفظ بسرّية خلطة الأعشاب والتوابل الإحدى عشرة في وصفتها الأصلية؟', 'كنتاكي (يُقبل: KFC، كنتاكي فرايد تشيكن)', '', '',
   'Popeyes', 'Texas Chicken', 'بوبايز', 'تكساس تشيكن'),  -- 1118-17

  ('Landmarks', 400, 'Which landmark is this?', 'The London Eye (accept the Millennium Wheel)',
   'ما هذا المعلم؟', 'عين لندن (London Eye) (يُقبل: عجلة الألفية)', 'img/questions/landmark-london-eye.jpg', 'King of Hearts / CC BY-SA 4.0',
   'The Singapore Flyer', 'The High Roller', 'سنغافورة فلاير', 'هاي رولر'),  -- 1118-18

  ('Movies', 500, 'In the "Harry Potter" films, what is the name of the sport played on flying broomsticks, in which Harry plays as Seeker and must catch the Golden Snitch?', 'Quidditch',
   'في أفلام "هاري بوتر" (Harry Potter)، ما اسم الرياضة التي تُلعب على المكانس الطائرة، ويلعب فيها هاري في مركز الباحث (Seeker) وعليه أن يمسك بالكرة الذهبية الطائرة (Golden Snitch)؟', 'كويدتش (Quidditch)', '', '',
   'Gobstones', 'Quodpot', 'غوبستونز', 'كوودبوت'),  -- 1118-19

  ('Gen Z', 600, 'What does "ASMR" stand for, the name for the relaxing tingles some people feel from videos of whispering, tapping and crunching?', 'Autonomous sensory meridian response',
   'ماذا يعني اختصار "ASMR"، وهو اسم الإحساس المريح بالوخز الذي يشعر به بعض الناس عند مشاهدة فيديوهات الهمس والنقر والقرمشة؟', 'الاستجابة الحسية الذاتية الزوالية (Autonomous Sensory Meridian Response)', '', '',
   'Audio sensory mood relaxation', 'Automatic sound meditation response', 'الاسترخاء الحسي الصوتي للمزاج', 'استجابة التأمل الصوتي التلقائية');  -- 1118-20

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_18_2_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_18_2_seed;

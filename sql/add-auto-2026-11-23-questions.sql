-- BrainRush: automatic top-up batch 2026-11-23
-- (question-bank-manager brief, AUTO BATCH 2026-11-23, dated 2026-11-23)
--
-- Adds 10 questions to existing categories (no new category). Written to the owner's
-- standing preference of 2026-11-11: easier questions, mostly on subjects from 2000
-- onwards. IDs 1123-01 to 1123-10.
--   Who Am I? 100 = Kylian Mbappe (2018 and 2022 World Cup finals, Real Madrid 2024),
--     300 = Ahmed Helmy ("Leib Eyal", "Zaki Chan", "1000 Mabrouk"),
--     400 = Bruno Mars ("Just the Way You Are" 2010, Super Bowl 2014, "Uptown Funk").
--   AI 300 = bots (automated fake social media accounts), 400 = "Free Guy" (2021),
--     500 = the Turing test (1950).
--   Cartoons & Childhood 300 = the Day of the Dead ("Coco", 2017),
--     400 = Gru ("Despicable Me", 2010), 500 = a frying pan ("Tangled", 2010).
--   Landmarks 600 = 1 picture question (the Allianz Arena, Munich, opened 2005,
--     img/questions/landmark-allianz-arena.jpg, Manuel Núñez Salinas / CC BY 2.0, cropped).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the image
-- licence: docs/question-sets/auto-2026-11-23-review.md.
--
-- Count per point value: 100 = 1, 300 = 3, 400 = 3, 500 = 2, 600 = 1 (10).
-- Per category: Who Am I? 3, AI 3, Cartoons & Childhood 3, Landmarks 1.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-23-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-allianz-arena.jpg with it (new file name).
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_23_seed;

CREATE TEMPORARY TABLE auto_2026_11_23_seed (
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

INSERT INTO auto_2026_11_23_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 100, 'I am a French footballer. At 19 I scored in the 2018 World Cup final, which France won, and in the 2022 final I scored a hat-trick against Argentina. In 2024 I joined Real Madrid. Who am I?', 'Kylian Mbappe (accept Mbappe)',
   'أنا لاعب كرة قدم فرنسي. سجّلت هدفًا في نهائي كأس العالم 2018 وعمري 19 عامًا وفازت فرنسا باللقب، وفي نهائي 2022 سجّلت ثلاثية (هاتريك) في مرمى الأرجنتين. وفي عام 2024 انتقلت إلى ريال مدريد. من أنا؟', 'كيليان مبابي (يُقبل: مبابي)', '', '',
   'Antoine Griezmann', 'Karim Benzema', 'أنطوان غريزمان', 'كريم بنزيمة'),  -- 1123-01

  ('Who Am I?', 300, 'I am an Egyptian comedy actor. I first became famous as the host of the children''s TV show "Leib Eyal" ("Kids'' Play"), then starred in hit comedies such as "Zaki Chan" (2005) and "1000 Mabrouk" ("1000 Congratulations", 2009). Who am I?', 'Ahmed Helmy (accept Helmy)',
   'أنا ممثل كوميدي مصري. اشتهرت أولًا كمقدّم لبرنامج الأطفال "لعب عيال"، ثم قمت ببطولة أفلام كوميدية ناجحة مثل "زكي شان" (2005) و"1000 مبروك" (2009). من أنا؟', 'أحمد حلمي (يُقبل: حلمي)', '', '',
   'Mohamed Henedy', 'Mohamed Saad', 'محمد هنيدي', 'محمد سعد'),  -- 1123-02

  ('Who Am I?', 400, 'I am an American singer born in Honolulu, Hawaii. My hits include "Just the Way You Are" (2010), I headlined the Super Bowl halftime show in 2014, and I sang on Mark Ronson''s hit "Uptown Funk". Who am I?', 'Bruno Mars (accept Peter Hernandez)',
   'أنا مغنٍّ أمريكي وُلدت في هونولولو بولاية هاواي. من أغنياتي الناجحة "Just the Way You Are" عام 2010، وكنت النجم الرئيسي لعرض استراحة السوبر بول عام 2014، وغنّيت في أغنية مارك رونسون الشهيرة "Uptown Funk". من أنا؟', 'برونو مارس (يُقبل: بيتر هيرنانديز)', '', '',
   'Justin Timberlake', 'The Weeknd', 'جاستن تيمبرليك', 'ذا ويكند'),  -- 1123-03

  ('AI', 300, 'What do we call fake social media accounts that are run automatically by computer programs, often to post spam or to boost likes and followers?', 'Bots (accept bot accounts, social bots)',
   'ماذا نسمّي الحسابات المزيّفة على وسائل التواصل الاجتماعي التي تديرها برامج كمبيوتر تلقائيًا، وغالبًا ما تُستخدم لنشر الرسائل المزعجة أو لزيادة الإعجابات والمتابعين؟', 'البوتات (يُقبل: حسابات البوت، الحسابات الآلية)', '', '',
   'Trolls', 'Hackers', 'المتصيّدون', 'الهاكرز'),  -- 1123-04

  ('AI', 400, 'In which 2021 comedy does Ryan Reynolds play Guy, a cheerful bank teller who discovers he is a computer-controlled background character in a video game, and starts to think for himself?', 'Free Guy',
   'في أي فيلم كوميدي عام 2021 يؤدي رايان رينولدز دور "غاي"، موظف البنك المرح الذي يكتشف أنه شخصية ثانوية يتحكم فيها الكمبيوتر داخل لعبة فيديو، فيبدأ في التفكير بنفسه؟', 'فري غاي (Free Guy)', '', '',
   'Ready Player One', 'Jumanji: Welcome to the Jungle', 'ريدي بلاير وان', 'جومانجي: مرحبًا بكم في الغابة'),  -- 1123-05

  ('AI', 500, 'In 1950, a British mathematician proposed a test of whether a machine can think: a judge chats by text with a hidden person and a hidden computer, and the machine passes if the judge cannot tell which is which. What is this test called?', 'The Turing test (accept the imitation game)',
   'في عام 1950 اقترح عالم رياضيات بريطاني اختبارًا لمعرفة هل تستطيع الآلة أن تفكّر: يتحادث حَكَم كتابيًا مع شخص مخفيّ وكمبيوتر مخفيّ، وتنجح الآلة إذا لم يستطع الحَكَم التمييز بينهما. ما اسم هذا الاختبار؟', 'اختبار تورينج (يُقبل: لعبة المحاكاة)', '', '',
   'The Lovelace test', 'The Rorschach test', 'اختبار لوفليس', 'اختبار رورشاخ'),  -- 1123-06

  ('Cartoons & Childhood', 300, 'In the 2017 Pixar film "Coco", young Miguel is magically sent to the spirit world where his late ancestors live, during which Mexican holiday?', 'The Day of the Dead (accept Dia de los Muertos, Dia de Muertos)',
   'في فيلم بيكسار "كوكو" (Coco) عام 2017، ينتقل الصبي ميغيل بشكل سحري إلى عالم الأرواح حيث يعيش أجداده الراحلون، وذلك خلال أي عيد مكسيكي؟', 'يوم الموتى (يُقبل: ديا دي لوس مويرتوس)', '', '',
   'Cinco de Mayo', 'Mexican Independence Day', 'سينكو دي مايو', 'عيد الاستقلال المكسيكي'),  -- 1123-07

  ('Cartoons & Childhood', 400, 'In the animated film "Despicable Me" (2010), what is the name of the bald supervillain who plans to steal the Moon but ends up adopting three orphan girls?', 'Gru',
   'في فيلم الرسوم المتحركة "أنا الحقير" (Despicable Me) عام 2010، ما اسم الشرير الأصلع الذي يخطط لسرقة القمر، لكنه ينتهي بتبنّي ثلاث فتيات يتيمات؟', 'جرو (Gru)', '', '',
   'Vector', 'Dr. Nefario', 'فيكتور', 'دكتور نيفاريو'),  -- 1123-08

  ('Cartoons & Childhood', 500, 'In Disney''s "Tangled" (2010), which kitchen item does Rapunzel use as a weapon to knock out the thief Flynn Rider when he climbs into her tower?', 'A frying pan (accept a pan, a skillet)',
   'في فيلم ديزني "رابونزل" (Tangled) عام 2010، ما أداة المطبخ التي تستخدمها رابونزل سلاحًا لتُفقد اللص فلين رايدر وعيه عندما يتسلّق إلى برجها؟', 'مقلاة (يُقبل: طاسة)', '', '',
   'A rolling pin', 'A wooden spoon', 'نشّابة العجين', 'ملعقة خشبية'),  -- 1123-09

  ('Landmarks', 600, 'Which landmark is this?', 'The Allianz Arena (accept Bayern Munich''s stadium, Munich Football Arena, Fussball Arena Munchen)',
   'ما هذا المعلم؟', 'ملعب أليانز أرينا (يُقبل: ملعب بايرن ميونخ، ملعب ميونخ لكرة القدم)', 'img/questions/landmark-allianz-arena.jpg', 'Manuel Núñez Salinas / CC BY 2.0, cropped',
   'Wembley Stadium', 'Signal Iduna Park', 'ملعب ويمبلي', 'ملعب سيغنال إيدونا بارك');  -- 1123-10

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_23_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_23_seed;

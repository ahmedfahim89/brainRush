-- BrainRush: automatic top-up batch 2026-11-17
-- (question-bank-manager brief, AUTO BATCH 2026-11-17, dated 2026-11-17)
--
-- Adds 10 questions to existing categories (no new category). Written to the owner's
-- standing preference of 2026-11-11: easier questions, mostly on subjects from 2000
-- onwards. IDs 1117-01 to 1117-10.
--   Who Am I? 300 = Lady Gaga (music), 600 = Stan Lee (comics and Marvel films).
--   AI 200 = a watermark (labelling AI-made pictures), 300 = an AI agent.
--   Cartoons & Childhood 200 = "Baby Shark" (2016 song, 10 billion YouTube views in 2022),
--     300 = Dash ("The Incredibles", 2004).
--   Food & Drink 400 = Starbucks (logo and founding).
--   Landmarks 500 = 1 picture question (Abraj Al Bait, completed 2012,
--     img/questions/landmark-abraj-al-bait.jpg, King Eliot / CC BY-SA 4.0).
--   Movies 500 = Robert Pattinson (Edward Cullen in "Twilight", 2008).
--   Gen Z 600 = BeReal (Apple's iPhone App of the Year 2022).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the image
-- licence: docs/question-sets/auto-2026-11-17-review.md.
--
-- Count per point value: 200 = 2, 300 = 3, 400 = 1, 500 = 2, 600 = 2 (10).
-- Per category: Who Am I? 2, AI 2, Cartoons & Childhood 2, Food & Drink 1, Landmarks 1,
-- Movies 1, Gen Z 1.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-17-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-abraj-al-bait.jpg with it (new file name).
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_17_seed;

CREATE TEMPORARY TABLE auto_2026_11_17_seed (
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

INSERT INTO auto_2026_11_17_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 300, 'I am an American pop star. My 2008 hits "Just Dance" and "Poker Face" made me famous, and in 2019 I won an Oscar for the song "Shallow" from "A Star Is Born", in which I starred with Bradley Cooper. Who am I?', 'Lady Gaga (accept Gaga, Stefani Germanotta)',
   'أنا نجمة بوب أمريكية. اشتهرت بأغنيتيّ "جاست دانس" (Just Dance) و"بوكر فيس" (Poker Face) عام 2008، وفي عام 2019 فزت بجائزة الأوسكار عن أغنية "شالو" (Shallow) من فيلم "ولادة نجمة" (A Star Is Born) الذي شاركت في بطولته مع برادلي كوبر. من أنا؟', 'ليدي غاغا (يُقبل: غاغا، ستيفاني جيرمانوتا)', '', '',
   'Katy Perry', 'Beyonce', 'كاتي بيري', 'بيونسيه'),  -- 1117-01

  ('Who Am I?', 600, 'I was an American comic-book creator. I co-created Spider-Man and the X-Men for Marvel Comics in the 1960s, and until my death in 2018 I made short cameo appearances in many Marvel films, such as "Iron Man" (2008). Who am I?', 'Stan Lee',
   'كنت مبتكرًا أمريكيًا للقصص المصورة. شاركت في ابتكار "سبايدر مان" و"إكس من" (X-Men) لدار مارفل للقصص المصورة في ستينيات القرن العشرين، وحتى وفاتي عام 2018 كنت أظهر ظهورًا قصيرًا كضيف شرف في كثير من أفلام مارفل، مثل "آيرون مان" (Iron Man) عام 2008. من أنا؟', 'ستان لي', '', '',
   'Jack Kirby', 'Steve Ditko', 'جاك كيربي', 'ستيف ديتكو'),  -- 1117-02

  ('AI', 200, 'To show that a picture was made by AI, many AI image makers add a hidden or visible mark to it, a bit like the logo printed across stock photos. What is this kind of mark called?', 'A watermark (accept digital watermark, AI watermark)',
   'لإظهار أن الصورة صُنعت بالذكاء الاصطناعي، تضيف كثير من أدوات صنع الصور بالذكاء الاصطناعي علامة مخفية أو ظاهرة عليها، تشبه الشعار المطبوع على الصور التي تبيعها مواقع الصور. ماذا تُسمّى هذه العلامة؟', 'علامة مائية (يُقبل: علامة مائية رقمية)', '', '',
   'A barcode', 'A QR code', 'باركود', 'رمز QR'),  -- 1117-03

  ('AI', 300, 'What is the name for an AI that does not just chat with you but carries out tasks for you on its own, such as filling in forms or booking a flight?', 'An AI agent (accept agent, agentic AI)',
   'ما اسم الذكاء الاصطناعي الذي لا يكتفي بالدردشة معك، بل ينفّذ المهام نيابةً عنك من تلقاء نفسه، مثل ملء النماذج أو حجز رحلة طيران؟', 'وكيل ذكاء اصطناعي (يُقبل: وكيل، الذكاء الاصطناعي الوكيل)', '', '',
   'A chatbot', 'A search engine', 'روبوت دردشة', 'محرك بحث'),  -- 1117-04

  ('Cartoons & Childhood', 200, 'Which children''s song by the Korean brand Pinkfong, with its catchy "doo doo doo doo doo doo" chorus, became the first YouTube video to reach 10 billion views, in January 2022?', 'Baby Shark (accept Baby Shark Dance)',
   'ما أغنية الأطفال من إنتاج العلامة الكورية "بينكفونغ" (Pinkfong)، ذات اللازمة الشهيرة "دو دو دو دو دو دو"، التي أصبحت أول فيديو على يوتيوب يصل إلى 10 مليارات مشاهدة في يناير 2022؟', 'بيبي شارك (يُقبل: Baby Shark Dance)', '', '',
   'The Wheels on the Bus', 'Johny Johny Yes Papa', 'عجلات الحافلة', 'جوني جوني يس بابا'),  -- 1117-05

  ('Cartoons & Childhood', 300, 'In the Pixar film "The Incredibles" (2004), what is the name of the family''s son whose superpower is running at super speed?', 'Dash (accept Dash Parr, Dashiell)',
   'في فيلم بيكسار "الخارقون" (The Incredibles) عام 2004، ما اسم ابن العائلة الذي قوته الخارقة هي الجري بسرعة فائقة؟', 'داش (يُقبل: داش بار)', '', '',
   'Jack-Jack', 'Bolt', 'جاك جاك', 'بولت'),  -- 1117-06

  ('Food & Drink', 400, 'Which coffee chain, founded at Pike Place Market in Seattle in 1971, has a green logo showing a twin-tailed mermaid, or siren?', 'Starbucks',
   'ما سلسلة المقاهي التي تأسست في سوق "بايك بليس" بمدينة سياتل عام 1971، ويُظهر شعارها الأخضر حورية بحر بذيلين؟', 'ستاربكس', '', '',
   'Costa Coffee', 'Tim Hortons', 'كوستا كوفي', 'تيم هورتنز'),  -- 1117-07

  ('Landmarks', 500, 'Which landmark is this?', 'Abraj Al Bait (accept the Makkah Royal Clock Tower, the Mecca Clock Tower, the Clock Towers)',
   'ما هذا المعلم؟', 'أبراج البيت (يُقبل: برج الساعة، برج ساعة مكة الملكي)', 'img/questions/landmark-abraj-al-bait.jpg', 'King Eliot / CC BY-SA 4.0',
   'Kingdom Centre', 'Al Faisaliah Tower', 'برج المملكة', 'برج الفيصلية'),  -- 1117-08

  ('Movies', 500, 'Which actor played the vampire Edward Cullen in the "Twilight" films, starting in 2008?', 'Robert Pattinson (accept Pattinson)',
   'من الممثل الذي أدى دور مصاص الدماء إدوارد كولين في أفلام "الشفق" (Twilight) بدءًا من عام 2008؟', 'روبرت باتينسون (يُقبل: باتينسون)', '', '',
   'Taylor Lautner', 'Zac Efron', 'تايلور لوتنر', 'زاك إيفرون'),  -- 1117-09

  ('Gen Z', 600, 'Which photo app, Apple''s iPhone App of the Year in 2022, alerts its users at a random moment each day and gives them two minutes to post a photo taken with both the front and back cameras?', 'BeReal (accept Be Real)',
   'ما تطبيق الصور، الذي اختارته آبل تطبيق العام للآيفون في 2022، وينبّه مستخدميه في لحظة عشوائية كل يوم ويمنحهم دقيقتين لنشر صورة ملتقطة بالكاميرتين الأمامية والخلفية معًا؟', 'بي ريل (BeReal)', '', '',
   'Lemon8', 'Locket', 'ليمون8', 'لوكيت');  -- 1117-10

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_17_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_17_seed;

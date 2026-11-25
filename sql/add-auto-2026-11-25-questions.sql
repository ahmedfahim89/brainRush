-- BrainRush: automatic top-up batch 2026-11-25
-- (question-bank-manager brief, AUTO BATCH 2026-11-25 RERUN, dated 2026-11-25)
--
-- Adds 10 questions to existing categories (no new category): 8 text and 2 picture
-- questions. Written to the owner's standing preference of 2026-11-11: easier questions,
-- mostly on subjects from 2000 onwards. IDs 1125-01 to 1125-10.
--   AI 200 = Tesla Autopilot (driver-assistance system).
--   Cartoons & Childhood 200 = Bluey (2018).
--   Flags 200 = Thailand (picture, img/questions/flag-thailand.svg).
--   Who Am I? 200 = Jason Statham.
--   Landmarks 300 = Buckingham Palace (picture, img/questions/landmark-buckingham-palace.jpg).
--   Food & Drink 500 = Philips (Airfryer, 2010).
--   Technology 500 = Amazon (Kindle, 2007).
--   History 600 = 2002 (euro notes and coins).
--   Movies 600 = Maximus ("Gladiator", 2000).
--   Science 600 = the Higgs boson (CERN, 2012).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and image sources:
-- docs/question-sets/auto-2026-11-25-review.md.
--
-- Count per point value: 200 = 4, 300 = 1, 500 = 2, 600 = 3 (10).
-- Per category: AI 1, Cartoons & Childhood 1, Flags 1, Who Am I? 1, Landmarks 1,
-- Food & Drink 1, Technology 1, History 1, Movies 1, Science 1.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-25-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/flag-thailand.svg and img/questions/landmark-buckingham-palace.jpg
-- with it.
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_25_seed;

CREATE TEMPORARY TABLE auto_2026_11_25_seed (
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

INSERT INTO auto_2026_11_25_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit,
                                  wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('AI', 200, 'Tesla cars can steer within a lane and keep their distance from other cars using cameras and AI, while the driver keeps watching. What is this driver-assistance system called?',
   'Autopilot (accept Tesla Autopilot, Full Self-Driving, FSD)',
   'تستطيع سيارات تسلا التوجيه داخل المسار والحفاظ على المسافة من السيارات الأخرى باستخدام الكاميرات والذكاء الاصطناعي، مع بقاء السائق منتبهًا. ما اسم هذا النظام المساعد للسائق؟',
   'الطيار الآلي (يُقبل: القيادة الذاتية الكاملة)', '', '',
   'Sentry Mode', 'Ludicrous Mode', 'وضع الحراسة', 'وضع لوديكرس'),  -- 1125-01
  ('Cartoons & Childhood', 200, 'Which cartoon, first shown in 2018, follows a blue heeler puppy, her little sister Bingo and the cartoon uses dog friendly colors?',
   'Bluey',
   'ما اسم المسلسل الكرتوني الذي بدأ عرضه عام 2018 ويحكي عن جروة زرقاء اللون وأختها الصغيرة بينغو، ويستخدم ألوانًا صديقة للكلاب؟',
   'بلوي (Bluey)', '', '',
   'Puppy Dog Pals', 'PAW Patrol', 'بابي دوغ بالز', 'باو باترول'),  -- 1125-02
  ('Flags', 200, 'Which country does this flag belong to?',
   'Thailand (accept Siam)',
   'إلى أي دولة ينتمي هذا العلم؟',
   'تايلاند', 'img/questions/flag-thailand.svg', '',
   'Costa Rica', 'Netherlands', 'كوستاريكا', 'هولندا'),  -- 1125-03
  ('Who Am I?', 200, 'I am a British actor and a former competitive diver. I starred in "The Transporter" (2002) and I play Deckard Shaw in the "Fast & Furious" films. Who am I?',
   'Jason Statham (accept Statham)',
   'أنا ممثل بريطاني ولاعب غوص تنافسي سابق. قمت ببطولة فيلم "The Transporter" (2002)، وأؤدي دور ديكارد شو في أفلام "Fast & Furious". من أنا؟',
   'جيسون ستاثام (يُقبل: ستاثام)', '', '',
   'Tom Hardy', 'Gerard Butler', 'توم هاردي', 'جيرارد بتلر'),  -- 1125-04
  ('Landmarks', 300, 'Which landmark is this?',
   'Buckingham Palace (accept Buckingham)',
   'ما هذا المعلم؟',
   'قصر باكينغهام', 'img/questions/landmark-buckingham-palace.jpg', 'Suicasmo / CC BY-SA 4.0, resized',
   'Kensington Palace', 'Hampton Court Palace', 'قصر كنسينغتون', 'قصر هامبتون كورت'),  -- 1125-05
  ('Food & Drink', 500, 'Which European company introduced the Airfryer, a gadget that cooks crispy food with hot air and little or no oil, at the IFA fair in Berlin in 2010?',
   'Philips (accept Royal Philips)',
   'أي شركة أوروبية قدمت جهاز "إير فراير" الذي يطهو الطعام المقرمش بالهواء الساخن وبقليل من الزيت أو بدونه، في معرض IFA ببرلين عام 2010؟',
   'فيليبس', '', '',
   'Siemens', 'Electrolux', 'سيمنز', 'إلكترولوكس'),  -- 1125-06
  ('Technology', 500, 'Which company launched the Kindle e-reader in November 2007?',
   'Amazon (accept Amazon.com)',
   'أي شركة أطلقت جهاز القراءة الإلكتروني "كيندل" في نوفمبر 2007؟',
   'أمازون', '', '',
   'Barnes and Noble', 'Apple', 'بارنز آند نوبل', 'أبل'),  -- 1125-07
  ('History', 600, 'In which year did euro banknotes and coins enter circulation in 12 European countries, replacing money such as the French franc and the German mark?',
   '2002 (accept 1 January 2002)',
   'في أي عام بدأ تداول أوراق وعملات اليورو النقدية في 12 دولة أوروبية، لتحل محل عملات مثل الفرنك الفرنسي والمارك الألماني؟',
   '2002 (يُقبل: 1 يناير 2002)', '', '',
   '1999', '2004', '1999', '2004'),  -- 1125-08
  ('Movies', 600, 'In the 2000 film "Gladiator", what is the name of the Roman general, played by Russell Crowe?',
   'Maximus (accept Maximus Decimus Meridius)',
   'في فيلم "Gladiator" (المصارع) عام 2000، ما اسم القائد الروماني الذي يؤدي دوره راسل كرو؟',
   'ماكسيموس (يُقبل: ماكسيموس ديسيموس ميريديوس)', '', '',
   'Commodus', 'Proximo', 'كومودوس', 'بروكسيمو'),  -- 1125-09
  ('Science', 600, 'In 2012, scientists at CERN announced the discovery of a particle nicknamed the "God particle". What is its scientific name?',
   'The Higgs boson (accept Higgs, Higgs particle)',
   'في عام 2012 أعلن علماء في مركز سيرن (CERN) اكتشاف جسيم يُلقَّب بـ"جسيم الإله". ما اسمه العلمي؟',
   'بوزون هيغز (يُقبل: جسيم هيغز، هيغز)', '', '',
   'The graviton', 'The neutrino', 'الغرافيتون', 'النيوترينو');  -- 1125-10

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_25_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_25_seed;

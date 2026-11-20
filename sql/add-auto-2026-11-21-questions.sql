-- BrainRush: automatic top-up batch 2026-11-21
-- (question-bank-manager brief, AUTO BATCH 2026-11-21, dated 2026-11-21)
--
-- Adds 10 questions to existing categories (no new category). Written to the owner's
-- standing preference of 2026-11-11: easier questions, mostly on subjects from 2000
-- onwards. IDs 1121-01 to 1121-10.
--   Who Am I? 100 = Shah Rukh Khan ("My Name Is Khan" 2010, "Pathaan" and "Jawan" 2023),
--     200 = Beyonce ("Crazy in Love" 2003, "Single Ladies" 2008).
--   Cartoons & Childhood 200 = "PAW Patrol" (2013), 600 = a macaw (Blu in "Rio", 2011).
--   AI 100 = a person's voice (AI voice-cloning phone scams),
--     200 = subtitles (YouTube's automatic captions).
--   Food & Drink 500 = mochi, 600 = Basque cheesecake.
--   Landmarks 500 = 1 picture question (Tokyo Skytree, opened 2012,
--     img/questions/landmark-tokyo-skytree.jpg, Akonnchiroll / CC0).
--   Movies 600 = the Professor ("Money Heist", 2017).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the image
-- licence: docs/question-sets/auto-2026-11-21-review.md.
--
-- Count per point value: 100 = 2, 200 = 3, 500 = 2, 600 = 3 (10).
-- Per category: Who Am I? 2, AI 2, Cartoons & Childhood 2, Food & Drink 2, Landmarks 1,
-- Movies 1.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-21-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-tokyo-skytree.jpg with it (new file name).
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_21_seed;

CREATE TEMPORARY TABLE auto_2026_11_21_seed (
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

INSERT INTO auto_2026_11_21_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 100, 'I am an Indian film star known as the "King of Bollywood". I starred in "My Name Is Khan" (2010), and in 2023 my action films "Pathaan" and "Jawan" were huge box-office hits. Who am I?', 'Shah Rukh Khan (accept Shahrukh Khan, SRK, King Khan)',
   'أنا نجم سينما هندي يلقّبونني "ملك بوليوود". قمت ببطولة فيلم "اسمي خان" (My Name Is Khan) عام 2010، وفي عام 2023 حقق فيلما الأكشن "باثان" (Pathaan) و"جوان" (Jawan) نجاحًا ضخمًا في شباك التذاكر. من أنا؟', 'شاروخان (يُقبل: شاه روخ خان، SRK، كينج خان)', '', '',
   'Salman Khan', 'Aamir Khan', 'سلمان خان', 'عامر خان'),  -- 1121-01

  ('Cartoons & Childhood', 600, 'In the 2011 animated film "Rio", Blu is a pet bird from Minnesota who never learned to fly and is thought to be the last male of his rare blue species. What kind of bird is he?', 'A macaw (accept Spix''s macaw, blue macaw)',
   'في فيلم الرسوم المتحركة "ريو" (Rio) عام 2011، "بلو" طائر أليف من ولاية مينيسوتا لم يتعلّم الطيران قط، ويُعتقد أنه آخر ذكر من نوعه الأزرق النادر. ما نوع هذا الطائر؟', 'طائر المكاو (يُقبل: مكاو سبيكس، المكاو الأزرق)', '', '',
   'A toucan', 'A cockatoo', 'طائر الطوقان', 'طائر الكوكاتو'),  -- 1121-02

  ('AI', 100, 'Scammers can use AI to clone a person''s what, from a short clip posted online, and then phone that person''s family pretending to be them and asking for money?', 'Their voice (accept voice, voice cloning)',
   'يستطيع المحتالون استخدام الذكاء الاصطناعي لاستنساخ ماذا لدى الشخص، من مقطع قصير منشور على الإنترنت، ثم يتصلون هاتفيًا بعائلته منتحلين شخصيته ويطلبون المال؟', 'صوته (يُقبل: الصوت، استنساخ الصوت)', '', '',
   'Their phone number', 'Their face', 'رقم هاتفه', 'وجهه'),  -- 1121-03

  ('Food & Drink', 500, 'Which chewy Japanese sweet is made from steamed sticky rice pounded into a soft dough, and is often wrapped around a small ball of ice cream?', 'Mochi (accept mochi ice cream, daifuku)',
   'ما الحلوى اليابانية المطاطية المصنوعة من الأرز اللزج المطهو على البخار والمدقوق حتى يصبح عجينة طرية، وغالبًا ما تُلفّ حول كرة صغيرة من الآيس كريم؟', 'موتشي (يُقبل: موتشي آيس كريم، دايفوكو)', '', '',
   'Taiyaki', 'Dorayaki', 'تاياكي', 'دوراياكي'),  -- 1121-04

  ('Landmarks', 500, 'Which landmark is this?', 'Tokyo Skytree (accept the Skytree, Tokyo Sky Tree)',
   'ما هذا المعلم؟', 'برج طوكيو سكاي تري (يُقبل: سكاي تري، Tokyo Skytree)', 'img/questions/landmark-tokyo-skytree.jpg', 'Akonnchiroll / CC0',
   'Tokyo Tower', 'CN Tower', 'برج طوكيو', 'برج سي إن'),  -- 1121-05

  ('Movies', 600, 'In the series "Money Heist" ("La Casa de Papel"), what nickname does the gang use for the quiet mastermind who recruits them and plans every detail of the robbery?', 'The Professor (accept Professor, El Profesor, Sergio Marquina)',
   'في مسلسل "لا كاسا دي بابيل" (Money Heist)، ما اللقب الذي تُطلقه العصابة على العقل المدبّر الهادئ الذي جمع أفرادها ويخطط لكل تفاصيل السرقة؟', 'البروفيسور (يُقبل: الأستاذ، El Profesor، سيرخيو ماركينا)', '', '',
   'The Doctor', 'The Captain', 'الدكتور', 'الكابتن'),  -- 1121-06

  ('AI', 200, 'YouTube uses AI to listen to a video and write the spoken words on the screen automatically. What are these on-screen words called?', 'Subtitles (accept captions, closed captions, auto-captions)',
   'يستخدم يوتيوب الذكاء الاصطناعي للاستماع إلى الفيديو وكتابة الكلام المنطوق على الشاشة تلقائيًا. ماذا تُسمّى هذه الكلمات التي تظهر على الشاشة؟', 'الترجمة المصاحبة (يُقبل: الترجمة، Subtitles، Captions)', '', '',
   'Thumbnails', 'Hashtags', 'الصور المصغّرة', 'الهاشتاغات'),  -- 1121-07

  ('Cartoons & Childhood', 200, 'Which cartoon, first shown in 2013, follows a team of rescue puppies, each with its own vehicle, led by a boy called Ryder?', 'PAW Patrol (accept Paw Patrol)',
   'ما الكرتون الذي بدأ عرضه عام 2013، ويتابع فريقًا من الجراء المنقذة، لكل منها مركبتها الخاصة، بقيادة صبي اسمه رايدر؟', 'باو باترول (PAW Patrol)', '', '',
   'Bluey', 'Puppy Dog Pals', 'بلوي', 'بابي دوغ بالز'),  -- 1121-08

  ('Who Am I?', 200, 'I am an American singer who first became famous in the girl group Destiny''s Child. My solo hits include "Crazy in Love" (2003) and "Single Ladies (Put a Ring on It)" (2008). Who am I?', 'Beyonce (accept Beyonce Knowles)',
   'أنا مغنية أمريكية اشتهرت أولًا مع فرقة الفتيات "ديستنيز تشايلد" (Destiny''s Child). من أغنياتي المنفردة الناجحة "Crazy in Love" عام 2003 و"Single Ladies" عام 2008. من أنا؟', 'بيونسيه (يُقبل: بيونسيه نولز)', '', '',
   'Rihanna', 'Alicia Keys', 'ريانا', 'أليشيا كيز'),  -- 1121-09

  ('Food & Drink', 600, 'What is the name of the crustless cheesecake with a dark, burnt-looking top, first made at the La Vina bar in San Sebastian, that became a dessert craze around the world?', 'Basque cheesecake (accept burnt Basque cheesecake, San Sebastian cheesecake)',
   'ما اسم التشيز كيك الخالي من قاعدة البسكويت وذي السطح الداكن الذي يبدو محروقًا، الذي صُنع أول مرة في مطعم "لا بينيا" (La Vina) في مدينة سان سيباستيان، ثم أصبح موضة حلويات حول العالم؟', 'تشيز كيك الباسك (يُقبل: تشيز كيك الباسك المحروق، تشيز كيك سان سيباستيان)', '', '',
   'New York cheesecake', 'Japanese cheesecake', 'تشيز كيك نيويورك', 'التشيز كيك الياباني');  -- 1121-10

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_21_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_21_seed;

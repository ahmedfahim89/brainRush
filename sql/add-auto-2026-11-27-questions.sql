-- BrainRush: automatic top-up batch 2026-11-27
-- (question-bank-manager brief, AUTO BATCH 2026-11-27, dated 2026-11-27)
--
-- Adds 10 questions to existing categories (no new category): 6 text and 4 picture
-- questions. Written to the owner's standing preference of 2026-11-11 (easier, mostly
-- from 2000 onwards), the request of 2026-11-25 (pioneers in Who Am I?) and the request
-- of 2026-11-26 (Cartoons & Childhood beyond Pixar). IDs 1127-01 to 1127-10.
--   AI 300 = the AI action figure trend (ChatGPT, April 2025).
--   AI 500 = screenwriters (2023 Hollywood writers' strike over AI).
--   Cartoons & Childhood 300 = the Krusty Krab ("SpongeBob SquarePants", Nickelodeon).
--   Cartoons & Childhood 600 = Harley Quinn ("Batman: The Animated Series", 1992).
--   Flags 500 = Albania (picture, img/questions/flag-albania.svg).
--   Flags 600 = Cambodia (picture, img/questions/flag-cambodia.svg).
--   Landmarks 500 = the CN Tower (picture, img/questions/landmark-cn-tower.jpg).
--   Landmarks 600 = the Guggenheim Museum Bilbao (picture,
--                   img/questions/landmark-guggenheim-bilbao.jpg).
--   Who Am I? 400 = Talaat Harb (text, banking and industry, Egypt).
--   Who Am I? 500 = Shigeru Miyamoto (text, video games, Japan).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and image sources:
-- docs/question-sets/auto-2026-11-27-review.md.
--
-- Count per point value: 300 = 2, 400 = 1, 500 = 4, 600 = 3 (10).
-- Per category: AI 2, Cartoons & Childhood 2, Flags 2, Landmarks 2, Who Am I? 2.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-27-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/flag-albania.svg, img/questions/flag-cambodia.svg,
-- img/questions/landmark-cn-tower.jpg and img/questions/landmark-guggenheim-bilbao.jpg
-- with it.
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_27_seed;

CREATE TEMPORARY TABLE auto_2026_11_27_seed (
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

INSERT INTO auto_2026_11_27_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit,
                                  wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('AI', 300, 'In April 2025, a viral trend saw people ask ChatGPT to turn their photo into which kind of toy, shown inside plastic packaging with tiny accessories?',
   'An action figure (accept action figure doll, doll, toy figure)',
   'في أبريل 2025 انتشرت موضة يطلب فيها الناس من ChatGPT تحويل صورهم إلى أي نوع من الألعاب، معروضة داخل علبة بلاستيكية مع إكسسوارات صغيرة؟',
   'مجسم أكشن فيجر (يُقبل: دمية، مجسم لعبة)', '', '',
   'A jigsaw puzzle', 'A teddy bear', 'لعبة بازل', 'دبدوب'),  -- 1127-01
  ('AI', 500, 'In 2023, which group of Hollywood workers went on strike for almost five months, partly to stop studios using AI to write or rewrite scripts?',
   'Screenwriters (accept writers, the Writers Guild, WGA)',
   'في عام 2023، أي فئة من العاملين في هوليوود أضربت عن العمل قرابة خمسة أشهر، ومن أسباب الإضراب منع الاستوديوهات من استخدام الذكاء الاصطناعي في كتابة السيناريوهات أو إعادة كتابتها؟',
   'كتّاب السيناريو (يُقبل: الكتّاب، نقابة الكتّاب الأمريكية)', '', '',
   'Stunt performers', 'Film editors', 'مؤدو المشاهد الخطرة', 'مونتيرو الأفلام'),  -- 1127-02
  ('Cartoons & Childhood', 300, 'In "SpongeBob SquarePants", what is the name of the fast-food restaurant where SpongeBob works as a fry cook?',
   'The Krusty Krab (accept Krusty Krab)',
   'في مسلسل الرسوم المتحركة "سبونج بوب"، ما اسم مطعم الوجبات السريعة الذي يعمل فيه سبونج بوب طاهيًا؟',
   'كراستي كراب (Krusty Krab)', '', '',
   'The Chum Bucket', 'The Salty Spitoon', 'تشم باكيت', 'سولتي سبيتون'),  -- 1127-03
  ('Cartoons & Childhood', 600, 'Which jester-costumed villain, the Joker''s sidekick and girlfriend, was created for the cartoon "Batman: The Animated Series" in 1992, before joining the comics and the "Suicide Squad" films?',
   'Harley Quinn (accept Harleen Quinzel, Harley)',
   'ما اسم الشريرة التي ترتدي زي المهرّجين، مساعدة الجوكر وحبيبته، التي ابتُكرت لمسلسل الرسوم المتحركة "Batman: The Animated Series" عام 1992، قبل أن تنتقل إلى القصص المصورة وأفلام "Suicide Squad"؟',
   'هارلي كوين (يُقبل: هارلين كوينزل، هارلي)', '', '',
   'Poison Ivy', 'Catwoman', 'بويزن آيفي', 'كات وومان'),  -- 1127-04
  ('Flags', 500, 'Which country does this flag belong to?',
   'Albania',
   'إلى أي دولة ينتمي هذا العلم؟',
   'ألبانيا', 'img/questions/flag-albania.svg', '',
   'Montenegro', 'Serbia', 'الجبل الأسود', 'صربيا'),  -- 1127-05
  ('Flags', 600, 'Which country does this flag belong to?',
   'Cambodia (accept Kampuchea)',
   'إلى أي دولة ينتمي هذا العلم؟',
   'كمبوديا', 'img/questions/flag-cambodia.svg', '',
   'Laos', 'Thailand', 'لاوس', 'تايلاند'),  -- 1127-06
  ('Landmarks', 500, 'Which landmark is this?',
   'The CN Tower (accept CN Tower, the Toronto tower)',
   'ما هذا المعلم؟',
   'برج سي إن (يُقبل: برج CN، برج تورونتو)', 'img/questions/landmark-cn-tower.jpg', 'Photo: Diego Delso, CC BY-SA 3.0, resized',
   'The Space Needle', 'The Sky Tower', 'برج سبيس نيدل', 'برج سكاي تاور'),  -- 1127-07
  ('Landmarks', 600, 'Which landmark is this?',
   'The Guggenheim Museum Bilbao (accept Guggenheim Bilbao, the Bilbao Guggenheim)',
   'ما هذا المعلم؟',
   'متحف غوغنهايم بلباو (يُقبل: غوغنهايم بلباو)', 'img/questions/landmark-guggenheim-bilbao.jpg', 'Photo: Jules Verne Times Two / julesvernex2.com, CC BY-SA 4.0, resized',
   'The Walt Disney Concert Hall', 'The Dancing House', 'قاعة والت ديزني للحفلات', 'البيت الراقص'),  -- 1127-08
  ('Who Am I?', 400, 'I was an Egyptian economist. In 1920 I led the founding of Banque Misr, a bank owned by Egyptians, whose companies included the film studio Studio Misr. A square in downtown Cairo carries my name and my statue. Who am I?',
   'Talaat Harb (accept Talaat Harb Pasha, Harb)',
   'كنت اقتصاديًا مصريًا. في عام 1920 قدت تأسيس بنك مصر، بنكًا وطنيًا برأس مال مصري، ومن شركاته استوديو مصر للسينما. ويحمل اسمي وتمثالي ميدان شهير في وسط القاهرة. من أنا؟',
   'طلعت حرب (يُقبل: طلعت حرب باشا)', '', '',
   'Osman Ahmed Osman', 'Ahmed Abboud', 'عثمان أحمد عثمان', 'أحمد عبود'),  -- 1127-09
  ('Who Am I?', 500, 'I am a Japanese video game designer. I created Mario, who first appeared in "Donkey Kong" (1981), and the "Legend of Zelda" games, and I co-produced "The Super Mario Bros. Movie" (2023). Who am I?',
   'Shigeru Miyamoto (accept Miyamoto)',
   'أنا مصمم ألعاب فيديو ياباني. ابتكرت شخصية ماريو التي ظهرت أول مرة في لعبة "Donkey Kong" عام 1981، وسلسلة ألعاب "The Legend of Zelda"، وشاركت في إنتاج فيلم "The Super Mario Bros. Movie" عام 2023. من أنا؟',
   'شيغيرو مياموتو (يُقبل: مياموتو)', '', '',
   'Hideo Kojima', 'Satoru Iwata', 'هيديو كوجيما', 'ساتورو إيواتا');  -- 1127-10

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_27_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_27_seed;

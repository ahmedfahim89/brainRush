-- BrainRush: automatic top-up batch 2026-11-11 (question-bank-manager brief, AUTO BATCH)
--
-- Adds 5 questions to existing categories (no new category), towards 10 per
-- category and point value:
--   Who Am I? 400 = 1 (Omar Khayyam), clue style "... Who am I?"
--   Cartoons & Childhood 500 = 1 (Fulla doll)
--   Landmarks 400 = 1 picture question (Empire State Building,
--                   img/questions/landmark-empire-state-building.jpg, Commons photo by
--                   Sam Valadi, CC BY 2.0, credit in image_credit)
--   AI 500 = 1 (jailbreak)
--   Food & Drink 500 = 1 (mastic)
-- The scheduled 2026-11-11 run had no web access and only wrote drafts. The fact-check,
-- the pictures and this file were done later on 2026-11-11 with the owner present.
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the photo
-- licences: docs/question-sets/auto-2026-11-11-review.md.
-- The owner removed 5 of the 10 questions on 2026-11-11 (1111-01, 1111-02, 1111-04,
-- 1111-05, 1111-08); the remaining rows keep their IDs.
--
-- Count per point value: 400 = 2, 500 = 3 (5).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-11-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-empire-state-building.jpg with it.
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_11_seed;

CREATE TEMPORARY TABLE auto_2026_11_11_seed (
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

INSERT INTO auto_2026_11_11_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 400, 'I was a Persian mathematician and astronomer, born in Nishapur in 1048. I helped make a very accurate solar calendar, but I am best remembered for my four-line poems, the "Rubaiyat". Who am I?', 'Omar Khayyam (accept Khayyam)',
   'كنت عالم رياضيات وفلك فارسيًا وُلدت في نيسابور عام 1048. شاركت في وضع تقويم شمسي دقيق جدًا، لكن الناس يتذكرونني أكثر برباعياتي الشعرية. من أنا؟', 'عمر الخيام (يُقبل: الخيام)', '', '',
   'Jalal al-Din Rumi', 'Ferdowsi', 'جلال الدين الرومي', 'الفردوسي'),  -- 1111-03

  ('Cartoons & Childhood', 500, 'Which doll in a headscarf, launched in 2003 by a Syrian toy company, was sold across the Arab world as a modest alternative to the famous American fashion doll?', 'Fulla',
   'ما اسم الدمية التي ترتدي الحجاب، وأطلقتها عام 2003 شركة ألعاب سورية، وبيعت في أنحاء العالم العربي كبديل محتشم لدمية الأزياء الأمريكية الشهيرة؟', 'فلة', '', '',
   'Razanne', 'Sara', 'رزان', 'سارا'),  -- 1111-06

  ('Landmarks', 400, 'Which landmark is this?', 'The Empire State Building',
   'ما هذا المعلم؟', 'مبنى إمباير ستيت', 'img/questions/landmark-empire-state-building.jpg', 'Sam Valadi / CC BY 2.0',
   'The Chrysler Building', 'One World Trade Center', 'مبنى كرايسلر', 'مركز التجارة العالمي الواحد'),  -- 1111-07

  ('AI', 500, 'What word, first used for removing the limits on an iPhone, is also used when people trick an AI chatbot with clever prompts into ignoring its safety rules?', 'Jailbreak (accept jailbreaking)',
   'ما الكلمة التي استُخدمت أولًا لإزالة القيود عن هواتف آيفون، وتُستخدم أيضًا عندما يخدع الناس روبوت محادثة ذكيًا بأوامر ذكية ليتجاهل قواعد الأمان الخاصة به؟', 'كسر الحماية (يُقبل: الجيلبريك)', '', '',
   'Rooting', 'Spoofing', 'الروت', 'الانتحال'),  -- 1111-09

  ('Food & Drink', 500, 'Which fragrant resin from a tree grown on the Greek island of Chios is used across the Middle East to flavour milk puddings and stretchy Arabic ice cream (booza)?', 'Mastic (accept mastiha, mistika)',
   'ما الراتنج العطري الذي يُستخرج من شجرة تُزرع في جزيرة خيوس اليونانية، ويُستخدم في الشرق الأوسط لتنكيه حلويات الحليب والبوظة العربية المطاطية؟', 'المستكة (يُقبل: المسطكى)', '', '',
   'Frankincense', 'Gum arabic', 'الكندر', 'الصمغ العربي');  -- 1111-10

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_11_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_11_seed;

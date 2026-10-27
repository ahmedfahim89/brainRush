-- BrainRush: automatic top-up batch 2026-10-27 (question-bank-manager brief, AUTO BATCH)
--
-- Adds 6 questions to existing categories (no new category), towards 10 per
-- category and point value:
--   Cartoons & Childhood 600 = 2 (Egyptian Ramadan song, Rubik's Cube)
--   Who Am I? 100, 600 = 1 each (silent film, architecture), clue style "... Who am I?"
--   Landmarks 600 = 1 picture question (Sacre-Coeur, img/questions/landmark-sacre-coeur.jpg,
--                   Commons photo by Pedro Szekely, CC BY-SA 2.0, credit in image_credit)
--   Food & Drink 400 = 1 (Arabic coffee spice)
-- 10 were written; the owner removed 4 on 2026-10-27 (Garfield's owner, Florence
-- Nightingale, Ibn Rushd, peach Melba), not replaced. See the review doc and
-- docs/question-sets/rejected-answers.md.
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the photo
-- licence: docs/question-sets/auto-2026-10-27-review.md.
--
-- Count per point value: 100 = 1, 400 = 1, 600 = 4 (6).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-10-27-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-sacre-coeur.jpg with it.
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_10_27_seed;

CREATE TEMPORARY TABLE auto_2026_10_27_seed (
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

INSERT INTO auto_2026_10_27_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Cartoons & Childhood', 600, 'Which Egyptian singer was the first to sing "Ramadan Gana" ("Ramadan Has Come"), the song still played on radio and TV every year to welcome the holy month?', 'Mohamed Abdel Muttalib (accept Abdel Muttalib, Abdel Motaleb)',
   'أي مطرب مصري كان أول من غنى "رمضان جانا"، الأغنية التي ما زالت تُذاع كل عام في الراديو والتلفزيون لاستقبال الشهر الكريم؟', 'محمد عبد المطلب (يُقبل: عبد المطلب)', '', '',
   'Mohamed Qandil', 'Mohamed Rushdi', 'محمد قنديل', 'محمد رشدي'),

  ('Cartoons & Childhood', 600, 'The Rubik''s Cube, the twisting puzzle toy with six coloured faces, was invented in 1974 by Erno Rubik, a young teacher of architecture and design. In which country?', 'Hungary',
   'اخترع إرنو روبيك، وهو مدرس شاب للعمارة والتصميم، لعبة "مكعب روبيك" ذات الأوجه الستة الملونة عام 1974. في أي دولة؟', 'المجر', '', '',
   'Poland', 'Austria', 'بولندا', 'النمسا'),

  ('Who Am I?', 100, 'I was a British comic actor of silent films. My most famous character, "The Tramp", wore a bowler hat, baggy trousers and a small toothbrush moustache, and carried a cane. Who am I?', 'Charlie Chaplin (accept Chaplin)',
   'كنت ممثلًا كوميديًا بريطانيًا في عصر السينما الصامتة. أشهر شخصياتي "المتشرد"، الذي يرتدي قبعة مستديرة وبنطالًا واسعًا وشاربًا صغيرًا، ويحمل عصا. من أنا؟', 'تشارلي شابلن (يُقبل: شابلن)', '', '',
   'Buster Keaton', 'Harold Lloyd', 'باستر كيتون', 'هارولد لويد'),

  ('Who Am I?', 600, 'I was an Egyptian architect who revived building with mud brick for the poor. I designed the village of New Gourna in Upper Egypt and wrote the book "Architecture for the Poor". Who am I?', 'Hassan Fathy',
   'كنت مهندسًا معماريًا مصريًا أحييت البناء بالطوب اللبن من أجل الفقراء. صممت قرية القرنة الجديدة في صعيد مصر، وكتبت كتاب "عمارة الفقراء". من أنا؟', 'حسن فتحي', '', '',
   'Ramses Wissa Wassef', 'Abdel Wahed El-Wakil', 'رمسيس ويصا واصف', 'عبد الواحد الوكيل'),

  ('Landmarks', 600, 'Which landmark is this?', 'The Sacre-Coeur Basilica (accept Sacre-Coeur, the Basilica of the Sacred Heart)',
   'ما هذا المعلم؟', 'بازيليك القلب المقدس (يُقبل: ساكري كور)', 'img/questions/landmark-sacre-coeur.jpg', 'Pedro Szekely / CC BY-SA 2.0',
   'Notre-Dame de la Garde', 'Notre-Dame de Fourviere', 'نوتردام دو لا غارد', 'نوتردام دو فورفيير'),

  ('Food & Drink', 400, 'Traditional Arabic coffee (gahwa), served in small cups as a sign of hospitality, gets its signature flavour mainly from which spice, added generously when the coffee is brewed?', 'Cardamom (accept green cardamom, hail, hal)',
   'القهوة العربية التقليدية، التي تُقدَّم في فناجين صغيرة رمزًا للكرم، تأخذ نكهتها المميزة أساسًا من أي بهار يُضاف إليها بسخاء أثناء تحضيرها؟', 'الهيل (يُقبل: الحبهان)', '', '',
   'Cumin', 'Star anise', 'الكمون', 'اليانسون النجمي');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_10_27_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_10_27_seed;

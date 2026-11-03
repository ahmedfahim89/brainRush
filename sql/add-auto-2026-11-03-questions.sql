-- BrainRush: automatic top-up batch 2026-11-03 (question-bank-manager brief, AUTO BATCH)
--
-- Adds 4 questions to existing categories (no new category), towards 10 per
-- category and point value:
--   Who Am I? 300 = 1 (Mike Tyson), clue style "... Who am I?"
--   Cartoons & Childhood 200 = 1 (Olive Oyl), 300 = 1 (Tamagotchi)
--   AI 500 = 1 (Sam Altman)
-- The owner removed 6 drafted questions on 2026-11-03 (Hippocrates, Ibn Khaldun,
-- Roald Amundsen, the Omnitrix, Huey, Dewey and Louie, and the Potala Palace picture).
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc and fact-check sources:
-- docs/question-sets/auto-2026-11-03-review.md.
--
-- Count per point value: 200 = 1, 300 = 2, 500 = 1 (4).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-03-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_03_seed;

CREATE TEMPORARY TABLE auto_2026_11_03_seed (
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

INSERT INTO auto_2026_11_03_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 300, 'I am an American boxer nicknamed "Iron Mike". In 1986, at just 20, I won my first world heavyweight title, and in 1997 I was disqualified for biting Evander Holyfield''s ear. Who am I?', 'Mike Tyson (accept Tyson)',
   'أنا ملاكم أمريكي ألقب بـ"مايك الحديدي". عام 1986، وأنا في العشرين فقط، فزت بأول لقب عالمي لي في الوزن الثقيل، وعام 1997 استُبعدت من النزال لأنني عضضت أذن إيفاندر هوليفيلد. من أنا؟', 'مايك تايسون (يُقبل: تايسون)', '', '',
   'Lennox Lewis', 'George Foreman', 'لينوكس لويس', 'جورج فورمان'),

  ('Cartoons & Childhood', 200, 'In the "Popeye" cartoons, what is the name of Popeye''s tall, skinny girlfriend, whom he often has to rescue from the bully Bluto?', 'Olive Oyl (accept Olive)',
   'في كرتون "باباي"، ما اسم حبيبة باباي الطويلة النحيفة التي يضطر كثيرًا إلى إنقاذها من المتنمّر بلوتو؟', 'أوليف أويل (يُقبل: زيتونة، أوليف)', '', '',
   'Betty Boop', 'Daisy Duck', 'بيتي بوب', 'ديزي داك'),

  ('Cartoons & Childhood', 300, 'Which egg-shaped digital pet, launched by the toy company Bandai in 1996, had to be fed and cleaned up after, or it would get sick and die?', 'Tamagotchi',
   'ما اسم الحيوان الأليف الرقمي على شكل بيضة، الذي أطلقته شركة الألعاب "بانداي" عام 1996، وكان لا بد من إطعامه وتنظيفه وإلا مرض ومات؟', 'تاماغوتشي', '', '',
   'Neopets', 'Nintendogs', 'نيوبتس', 'نينتندوغز'),

  ('AI', 500, 'In November 2023, which boss of the company behind ChatGPT was suddenly fired by its board, then agreed to return as CEO within a week?', 'Sam Altman (accept Altman)',
   'في نوفمبر 2023، أي رئيس للشركة المطوّرة لـ ChatGPT أقاله مجلس إدارتها فجأة، ثم اتفق على العودة رئيسًا تنفيذيًا خلال أقل من أسبوع؟', 'سام ألتمان (يُقبل: ألتمان)', '', '',
   'Greg Brockman', 'Mira Murati', 'غريغ بروكمان', 'ميرا موراتي');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_03_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_03_seed;

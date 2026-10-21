-- BrainRush: Science question set 2 (owner request 2026-10-21)
--
-- Adds 12 questions to the existing "Science" category: 5 at 300, 2 at 400,
-- 3 at 500 and 2 at 600. Drafted as 18, the owner then removed 6 without
-- replacement (iris, whale shark, Pasteur, Halley's Comet, polar bear,
-- smallpox). Familiarity comes first: every subject is something a
-- typical adult knows from school, everyday life or the news (the human body,
-- space, animals, basic chemistry, famous scientists and discoveries). A higher
-- value asks a less obvious fact about something familiar, never jargon, a
-- formula, a precise number or an obscure scientist. Sub-topics are spread
-- across the values (body, space, animals, chemistry and physics, scientists
-- and medicine). No answer repeats an answer in the bank, and no question names
-- an existing answer. Text questions only (image stays ''). Every row comes with
-- its Arabic question and answer. Review doc and fact-check sources:
-- docs/question-sets/science-2-review.md.
--
-- Count per point value: 300 = 5, 400 = 2, 500 = 3, 600 = 2 (12).
--
-- Requires sql/migrate-add-arabic.sql (or a schema that already has question_ar /
-- answer_ar). Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-science-2-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. No category is created: a row is skipped when the
-- Science category was renamed or deleted, when its point value does not exist,
-- or when the category already has that question (INSERT IGNORE + the
-- uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS science2_seed;

CREATE TEMPORARY TABLE science2_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO science2_seed (category_name, points, question, answer, question_ar, answer_ar) VALUES
  ('Science', 300, 'What is the fastest animal on land?', 'The cheetah',
   'ما أسرع حيوان على اليابسة؟', 'الفهد الصياد (الشيتا، يُقبل: الفهد)'),
  ('Science', 300, 'Which pair of organs cleans the blood and turns its waste into urine?', 'The kidneys (accept kidney)',
   'ما زوج الأعضاء الذي ينقّي الدم ويحوّل فضلاته إلى بول؟', 'الكليتان (يُقبل: الكلى، الكلية)'),
  ('Science', 300, 'Which light gas makes party balloons float, and makes your voice sound squeaky if you breathe it in?', 'Helium',
   'أي غاز خفيف يجعل بالونات الحفلات تطفو في الهواء، ويجعل صوتك رفيعًا ومضحكًا إذا استنشقته؟', 'الهيليوم'),
  ('Science', 300, 'What do we call it when the Moon passes between the Sun and the Earth and blocks out the Sun?', 'A solar eclipse (accept eclipse)',
   'ماذا نسمي الظاهرة التي يمر فيها القمر بين الشمس والأرض فيحجب قرص الشمس؟', 'كسوف الشمس (يُقبل: الكسوف)'),
  ('Science', 300, 'Which scientist of the ancient world is said to have jumped out of his bath shouting "Eureka!"?', 'Archimedes',
   'أي عالِم من العصور القديمة يُروى أنه قفز من حوض الاستحمام وهو يصيح "وجدتها!" (يوريكا)؟', 'أرخميدس'),

  ('Science', 400, 'Which shellfish is best known for making pearls?', 'The oyster (accept pearl oyster)',
   'أي حيوان بحري ذي صدفة يشتهر بصنع اللؤلؤ؟', 'المحار (يُقبل: محار اللؤلؤ)'),
  ('Science', 400, 'Which scientist was put on trial by the Church in 1633 for teaching that the Earth moves around the Sun?', 'Galileo Galilei (accept Galileo)',
   'أي عالِم حاكمته الكنيسة عام 1633 لأنه علّم أن الأرض تدور حول الشمس؟', 'غاليليو غاليلي (يُقبل: غاليليو، جاليليو)'),

  ('Science', 500, 'The smallest bone in the human body is found in which part of the body?', 'The ear (accept middle ear)',
   'في أي جزء من جسم الإنسان توجد أصغر عظمة فيه؟', 'الأذن (يُقبل: الأذن الوسطى)'),
  ('Science', 500, 'Which planet in our Solar System is the farthest from the Sun?', 'Neptune',
   'ما الكوكب الأبعد عن الشمس في مجموعتنا الشمسية؟', 'نبتون'),
  ('Science', 500, 'Which poisonous gas, with no colour or smell, is given off when fuel burns badly in heaters and car engines?', 'Carbon monoxide (accept CO)',
   'أي غاز سام، لا لون له ولا رائحة، ينبعث عندما يحترق الوقود احتراقًا ناقصًا في المدافئ ومحركات السيارات؟', 'أول أكسيد الكربون (يُقبل: CO)'),

  ('Science', 600, 'The "funny bone" in your elbow is not a bone at all. What is it really?', 'A nerve (accept the ulnar nerve)',
   'عندما يرتطم الجزء الداخلي من الكوع بشيء نشعر بلسعة كالكهرباء تسري حتى الأصابع. يُسمّى هذا الموضع بالإنجليزية "العظمة المضحكة"، لكنه ليس عظمة. ما هو في الحقيقة؟', 'عصب (يُقبل: العصب الزندي)'),
  ('Science', 600, 'Which metal conducts electricity better than any other metal?', 'Silver',
   'أي معدن هو الأفضل في توصيل الكهرباء بين جميع المعادن؟', 'الفضة');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar
  FROM science2_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS science2_seed;

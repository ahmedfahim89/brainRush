-- BrainRush: Gen Z question set 2 (owner request 2026-10-20)
--
-- Adds 11 questions to the existing "Gen Z" category: 3 at 300, 3 at 400,
-- 4 at 500 and 1 at 600 (none at 100 or 200). Drafted as 16, the owner then
-- removed 5 without replacement. Familiarity comes first: every answer is a
-- famous, global piece of Gen Z culture, and the higher values are harder
-- because they ask a less obvious fact about it, not because the subject is
-- obscure. Every row comes with its Arabic question and answer. Review doc and
-- fact-check sources:
-- docs/question-sets/genz-2-review.md.
--
-- Requires sql/migrate-add-arabic.sql (or a schema that already has question_ar /
-- answer_ar). Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-genz-2-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. No category is created: a row is skipped when the
-- Gen Z category was renamed or deleted, when its point value does not exist, or
-- when the category already has that question (INSERT IGNORE +
-- uq_category_question).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS genz2_seed;

CREATE TEMPORARY TABLE genz2_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO genz2_seed (category_name, points, question, answer, question_ar, answer_ar) VALUES
  ('Gen Z', 300, 'In slang, what does "GOAT" stand for, as in "he is the GOAT"?', 'Greatest of all time',
   'في العامية، إلى ماذا يرمز الاختصار "GOAT"، كما في قولهم "هو الـGOAT"؟', 'الأعظم على مر العصور (Greatest of all time)'),
  ('Gen Z', 300, 'In the phone game "Angry Birds", which animals steal the birds'' eggs?', 'Pigs (accept green pigs, the Bad Piggies)',
   'في لعبة الهاتف "Angry Birds" (الطيور الغاضبة)، أي حيوانات تسرق بيض الطيور؟', 'الخنازير (يُقبل: الخنازير الخضراء)'),
  ('Gen Z', 300, 'Which toothy little monster doll, sold in surprise "blind boxes" by Pop Mart, became a worldwide craze in 2025?', 'Labubu',
   'أي دمية على شكل وحش صغير بأسنان بارزة، تُباع في علب مغلقة لا تعرف ما بداخلها من شركة Pop Mart، أصبحت هوسًا عالميًا عام 2025؟', 'لابوبو (Labubu)'),

  ('Gen Z', 400, 'In Gen Z slang, if someone says a film is "mid", what do they mean?', 'It is average or mediocre (accept so-so, meh, nothing special, not very good)',
   'في عامية الجيل Z، إذا قال أحدهم إن فيلمًا ما "mid"، فماذا يقصد؟', 'أنه عادي أو متوسط المستوى (يُقبل: مش قد كده، لا شيء مميز، ليس جيدًا جدًا)'),
  ('Gen Z', 400, 'Which music streaming app, launched in Lebanon in 2012, was the first legal music streaming service in the Arab world?', 'Anghami',
   'أي تطبيق لبث الموسيقى، انطلق في لبنان عام 2012، كان أول خدمة قانونية لبث الموسيقى في العالم العربي؟', 'أنغامي (Anghami)'),
  ('Gen Z', 400, 'The viral chocolate bar that took over social media in 2024 is filled with pistachio cream and which crunchy shredded pastry?', 'Kunafa (accept knafeh, konafa, kataifi)',
   'لوح الشوكولاتة الذي اجتاح وسائل التواصل الاجتماعي عام 2024 محشو بكريمة الفستق وبأي عجينة مقرمشة على شكل خيوط رفيعة؟', 'الكنافة (يُقبل: عجينة الكنافة)'),

  ('Gen Z', 500, 'On social media, what does "OOTD" stand for?', 'Outfit of the day',
   'على وسائل التواصل الاجتماعي، ماذا يعني الاختصار "OOTD"؟', 'إطلالة اليوم (Outfit of the day)'),
  ('Gen Z', 500, 'What does "Despacito", the title of the 2017 hit by Luis Fonsi and Daddy Yankee, mean in English?', 'Slowly (accept slow, nice and slow)',
   'ماذا تعني كلمة "Despacito"، عنوان أغنية لويس فونسي ودادي يانكي الناجحة عام 2017؟', 'ببطء (يُقبل: على مهل، بالراحة)'),
  ('Gen Z', 500, 'Which messaging app was founded in 2013 by the brothers Pavel and Nikolai Durov?', 'Telegram',
   'أي تطبيق مراسلة أسسه الأخوان بافل ونيكولاي دوروف عام 2013؟', 'تيليجرام (Telegram)'),
  ('Gen Z', 500, 'In the series "Money Heist" ("La Casa de Papel"), the robbers'' code names are all names of what?', 'Cities (accept city names)',
   'في مسلسل "البروفيسور" ("La Casa de Papel")، الأسماء الحركية لأفراد العصابة كلها أسماء ماذا؟', 'مدن (يُقبل: أسماء مدن)'),

  ('Gen Z', 600, 'What does the name of the battle royale game "PUBG" stand for?', 'PlayerUnknown''s Battlegrounds (accept Player Unknown Battlegrounds)',
   'إلى ماذا يرمز اسم لعبة الباتل رويال "PUBG" (ببجي)؟', 'PlayerUnknown''s Battlegrounds (ساحات معارك اللاعب المجهول)');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar
  FROM genz2_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS genz2_seed;

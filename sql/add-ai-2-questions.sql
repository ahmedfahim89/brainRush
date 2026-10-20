-- BrainRush: AI question set 2 (owner request 2026-10-20, rewritten the same day)
--
-- Adds 6 questions to the existing "AI" category: 2 at 200, 2 at 400, 1 at 500
-- and 1 at 600 (none at 100 or 300). The owner rejected the first draft, then
-- several later questions, as too unfamiliar to players, so this set sticks to
-- famous AI products, companies, people and events: Google Maps, bank fraud
-- checks, Grammarly, Mark Zuckerberg, The New York Times' AI lawsuit and
-- Nvidia's co-founder. Every row comes with its Arabic question and answer.
-- Review doc and fact-check sources:
-- docs/question-sets/ai-2-review.md.
--
-- Requires sql/migrate-add-arabic.sql (or a schema that already has question_ar /
-- answer_ar). Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-ai-2-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. No category is created: a row is skipped when the AI
-- category was renamed or deleted, when its point value does not exist, or when
-- the category already has that question (INSERT IGNORE + uq_category_question).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS ai2_seed;

CREATE TEMPORARY TABLE ai2_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO ai2_seed (category_name, points, question, answer, question_ar, answer_ar) VALUES
  ('AI', 200, 'Which Google app uses AI to predict traffic jams and find you the fastest driving route?', 'Google Maps (accept Waze, also owned by Google)',
   'أي تطبيق من جوجل يستخدم الذكاء الاصطناعي لتوقّع الزحام المروري وإيجاد أسرع طريق لك بالسيارة؟', 'خرائط جوجل (Google Maps) (يُقبل: ويز Waze، المملوك أيضًا لجوجل)'),
  ('AI', 200, 'Your bank''s AI watches your card payments and blocks any that look unusual. What crime is it trying to stop?', 'Fraud (accept card fraud, scams, theft)',
   'يراقب الذكاء الاصطناعي في بنكك مدفوعات بطاقتك ويوقف أي عملية تبدو غير معتادة. ما الجريمة التي يحاول منعها؟', 'الاحتيال (يُقبل: النصب، السرقة)'),

  ('AI', 400, 'Which writing app, with a green "G" logo, uses AI to fix your spelling and grammar and suggest a better tone?', 'Grammarly',
   'أي تطبيق للكتابة، شعاره حرف "G" باللون الأخضر، يستخدم الذكاء الاصطناعي لتصحيح الإملاء والقواعد واقتراح نبرة أفضل؟', 'جرامرلي (Grammarly)'),
  ('AI', 400, 'Which tech billionaire, whose company changed its name to Meta in 2021, announced the Meta AI assistant in 2023?', 'Mark Zuckerberg (accept Zuckerberg)',
   'أي ملياردير في عالم التقنية، غيّرت شركته اسمها إلى "ميتا" عام 2021، أعلن عن المساعد الذكي "Meta AI" عام 2023؟', 'مارك زوكربيرغ'),

  ('AI', 500, 'In December 2023, which famous American newspaper sued two big tech companies, saying millions of its articles had been used to train AI chatbots without permission?', 'The New York Times (accept NYT)',
   'في ديسمبر 2023، أي صحيفة أمريكية شهيرة رفعت دعوى قضائية على شركتي تقنية كبيرتين، قائلة إن ملايين من مقالاتها استُخدمت لتدريب روبوتات المحادثة الذكية دون إذن؟', 'نيويورك تايمز'),

  ('AI', 600, 'Which tech boss, famous for his black leather jacket, co-founded Nvidia?', 'Jensen Huang (accept Jensen)',
   'أي رئيس شركة تقنية، يشتهر بسترته الجلدية السوداء، شارك في تأسيس شركة إنفيديا؟', 'جنسن هوانغ (يُقبل: جنسن)');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar
  FROM ai2_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS ai2_seed;

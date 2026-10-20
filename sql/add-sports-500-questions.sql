-- BrainRush: Sports 500 questions (owner request 2026-10-20)
--
-- Adds 2 questions to the existing "Sports" category, both at 500: one on
-- football (Maradona's "Hand of God" goal at the 1986 World Cup) and one on
-- tennis (Novak Djokovic's tenth Australian Open). Drafted as 3, the owner then
-- removed the Jesse Owens question without replacement. Each one asks a less
-- obvious fact about a famous player or event. No answer repeats an answer in
-- the bank, and no question names an existing Sports answer (for example, none
-- names Messi, Muhammad Ali, Federer, Usain Bolt or tennis). Every row comes
-- with its Arabic question and answer. Review doc and fact-check sources:
-- docs/question-sets/sports-500-review.md.
--
-- Count per point value: 500 = 2.
--
-- Requires sql/migrate-add-arabic.sql (or a schema that already has question_ar /
-- answer_ar). Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-sports-500-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. No category is created: a row is skipped when the
-- Sports category was renamed or deleted, when point value 500 does not exist,
-- or when the category already has that question (INSERT IGNORE +
-- uq_category_question).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS sports500_seed;

CREATE TEMPORARY TABLE sports500_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO sports500_seed (category_name, points, question, answer, question_ar, answer_ar) VALUES
  ('Sports', 500, 'At the 1986 World Cup, against which country did Diego Maradona score his famous "Hand of God" goal?', 'England (accept the England national team)',
   'في كأس العالم 1986، في مرمى أي منتخب سجّل دييغو مارادونا هدفه الشهير "يد الله"؟', 'إنجلترا (يُقبل: منتخب إنجلترا)'),
  ('Sports', 500, 'Which player won his tenth Australian Open men''s singles title in 2023?', 'Novak Djokovic (accept Djokovic)',
   'أي لاعب فاز بلقبه العاشر في فردي الرجال ببطولة أستراليا المفتوحة عام 2023؟', 'نوفاك ديوكوفيتش (يُقبل: جوكوفيتش)');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar
  FROM sports500_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS sports500_seed;

-- BrainRush: Technology questions (owner request 2026-10-21)
--
-- Adds 6 text questions to the existing "Technology" category: 4 at 500 and
-- 2 at 600. Drafted as 11; the owner removed 5 (the moth "bug", Bluetooth,
-- ARPANET, the first SMS, Sega/Dreamcast) and they were not replaced. The
-- difficulty of each value matches the existing Technology questions at that
-- value in the local DB: hard but answerable by a keen general-trivia player,
-- built on well-known companies, inventions, firsts and terms (no product
-- feature names, model trivia or minor executives). The set covers computing
-- (Moore's law), the internet (eBay), phones and gadgets (Motorola, the iPod,
-- the microwave oven) and companies (Kodak). No answer repeats an answer in
-- the bank, no answer is named in an existing question, and no question names
-- an existing answer (for example, the iPod question does not name Apple). Every row comes with its Arabic question and
-- answer. Review doc and fact-check sources:
-- docs/question-sets/technology-review.md.
--
-- Requires sql/migrate-add-arabic.sql and sql/migrate-add-image.sql (or a schema
-- that already has question_ar / answer_ar, the image column and the
-- uq_category_question_image key). These are text questions, so image is ''.
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-technology-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. No category is created: a row is skipped when the
-- Technology category was renamed or deleted, when its point value does not
-- exist, or when the category already has that question with that image
-- (INSERT IGNORE + uq_category_question_image).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS technology_seed;

CREATE TEMPORARY TABLE technology_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  image         VARCHAR(255) NOT NULL DEFAULT '',
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO technology_seed (category_name, points, question, answer, question_ar, answer_ar, image) VALUES
  -- 500
  ('Technology', 500, 'While working on radar equipment in the 1940s, engineer Percy Spencer noticed that a snack bar in his pocket had melted. Which kitchen appliance did he go on to invent?', 'The microwave oven (accept microwave)',
   'أثناء عمله على أجهزة الرادار في أربعينيات القرن العشرين، لاحظ المهندس بيرسي سبنسر أن قطعة حلوى في جيبه قد ذابت. أي جهاز من أجهزة المطبخ اخترعه بعد ذلك؟', 'فرن الميكروويف (يُقبل: الميكروويف)', ''),
  ('Technology', 500, 'Which music player, launched in October 2001, was sold with the slogan "1,000 songs in your pocket"?', 'The iPod (accept iPod Classic)',
   'أي مشغل موسيقى، أُطلق في أكتوبر 2001، رُوّج له بشعار "1000 أغنية في جيبك"؟', 'آيبود (iPod)', ''),
  ('Technology', 500, 'In 1973, engineer Martin Cooper made the first public call from a handheld mobile phone. Which company did he work for?', 'Motorola',
   'في عام 1973، أجرى المهندس مارتن كوبر أول مكالمة علنية من هاتف محمول يُحمل باليد. في أي شركة كان يعمل؟', 'موتورولا (Motorola)', ''),
  ('Technology', 500, 'Which online auction website, founded in 1995 as AuctionWeb, famously sold a broken laser pointer as one of its very first items?', 'eBay',
   'أي موقع للمزادات على الإنترنت، تأسس عام 1995 باسم "AuctionWeb"، اشتهر ببيع مؤشر ليزر معطل كواحدة من أولى السلع التي بيعت عليه؟', 'إيباي (eBay)', ''),
  -- 600
  ('Technology', 600, 'Which "law", named after a co-founder of Intel, says that the number of transistors on a computer chip doubles about every two years?', 'Moore''s law',
   'أي "قانون"، يحمل اسم أحد مؤسسي شركة إنتل، ينص على أن عدد الترانزستورات في شريحة الحاسوب يتضاعف كل عامين تقريبًا؟', 'قانون مور', ''),
  ('Technology', 600, 'Which photography company, founded by George Eastman, launched the cheap Brownie camera in 1900 and later filed for bankruptcy as digital photography took over?', 'Kodak (accept Eastman Kodak)',
   'أي شركة تصوير، أسسها جورج إيستمان، أطلقت كاميرا "براوني" الرخيصة عام 1900، ثم أشهرت إفلاسها لاحقًا مع انتشار التصوير الرقمي؟', 'كوداك (يُقبل: إيستمان كوداك)', '');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image
  FROM technology_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS technology_seed;

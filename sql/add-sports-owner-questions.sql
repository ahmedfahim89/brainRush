-- BrainRush: Sports questions the owner added on the live site (2026-11-01)
--
-- Adds 4 questions to the existing "Sports" category (no new category). The
-- owner wrote them in the live admin page; this file copies them from live
-- (live ids 1258-1261) so the local bank and a fresh install match live.
-- Text questions only (image = ''). Every row has its Arabic question and answer
-- and 2 wrong options in English and Arabic for the "3 choices" helper.
-- The English text is kept exactly as on live (including the curly quotes in the
-- tennis question) so the unique key matches and a hosted run stays a no-op.
-- One difference from live: live id 1260 (tennis) has the basketball question's
-- Arabic text by mistake; this file has the correct Arabic. Fix it on live in the
-- admin page. The owner then moved the tennis question from 500 to 300
-- (2026-11-01); this file has it at 300.
--
-- Count per point value: 100 = 2, 200 = 1, 300 = 1 (4).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql and
-- sql/migrate-add-wrong-options.sql (or a schema that already has question_ar /
-- answer_ar, the image column with the uq_category_question_image key, and
-- wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar). Run it on whichever database is
-- selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-sports-owner-questions.sql
--   hosted:  already there (added through the admin page); running it is a no-op
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when the "Sports" category does not exist,
-- when its point value does not exist, or when the category already has that
-- question (INSERT IGNORE + the uq_category_question_image unique key, image = ''
-- for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS sports_owner_seed;

CREATE TEMPORARY TABLE sports_owner_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  wrong_1       VARCHAR(255) NOT NULL,
  wrong_2       VARCHAR(255) NOT NULL,
  wrong_1_ar    VARCHAR(255) NOT NULL,
  wrong_2_ar    VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO sports_owner_seed (category_name, points, question, answer, question_ar, answer_ar, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Sports', 100, 'How many players does a football (soccer) team have on the field at the start of a match?', '11',
   'كم عدد اللاعبين في فريق كرة القدم داخل الملعب في بداية المباراة؟', '11',
   '10', '12', '10', '12'),
  ('Sports', 200, 'Which country hosted the 2022 FIFA World Cup?', 'Qatar',
   'أي دولة استضافت كأس العالم لكرة القدم عام 2022؟', 'قطر',
   'Russia', 'Brazil', 'روسيا', 'البرازيل'),
  ('Sports', 300, 'In which sport are terms such as “serve” and “backhand” used?', 'Tennis',
   'في أي رياضة تُستخدم مصطلحات مثل «الإرسال» و«الضربة الخلفية»؟', 'التنس',
   'Basketball', 'Baseball', 'كرة السلة', 'البيسبول'),
  ('Sports', 100, 'How many points is a successful shot from beyond the three-point arc worth in basketball?', '3 points',
   'كم نقطة تُمنح للتسديدة الناجحة من خارج قوس الثلاث نقاط في كرة السلة؟', '3 نقاط',
   '4 points', '2 points', '4 نقاط', 'نقطتان');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, '',
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM sports_owner_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS sports_owner_seed;

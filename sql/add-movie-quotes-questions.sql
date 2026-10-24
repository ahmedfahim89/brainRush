-- BrainRush: Movies "famous quotes" set (owner request 2026-10-24, reworked twice 2026-10-24)
--
-- Adds 3 questions to the existing "Movies" category (no new category). Each
-- question gives a well-known line and asks which film, film series or TV
-- series it comes from.
--
-- Second rework, owner decision 2026-10-24: of the earlier 18 questions only
-- Groot (Guardians of the Galaxy, 100) is kept, unchanged (id 1541 in the local
-- DB). The other 17 were deleted by the owner. Added at the owner's request:
-- "May the odds be ever in your favor" (The Hunger Games) and "Winter is
-- coming" (Game of Thrones). Movies already has questions that name both
-- titles, so each new row sits at the same point value as one of them, which
-- keeps the pair off the same board:
--   The Hunger Games at 400, with the Katniss Everdeen / Jennifer Lawrence question.
--   Game of Thrones at 200, with the Mother of Dragons question (the Lannister
--   400 and Hodor 600 questions also name the series and can still share a board).
-- Text questions only (image = ''). Every row has its Arabic question and answer
-- and 2 wrong options in English and Arabic for the "3 choices" helper. Review
-- doc: docs/question-sets/movie-quotes-review.md.
--
-- Count per point value: 100 = 1, 200 = 1, 400 = 1 (3).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql and
-- sql/migrate-add-wrong-options.sql (or a schema that already has question_ar /
-- answer_ar, the image column with the uq_category_question_image key, and
-- wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar). Run it on whichever database is
-- selected (there is no USE line):
--   local:   mysql --default-character-set=utf8mb4 -u root brainrush < sql/add-movie-quotes-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when the Movies category was renamed or
-- deleted, when its point value does not exist, or when the category already
-- has that question (INSERT IGNORE + the uq_category_question_image unique key,
-- image = '' for text questions). So the kept Groot row is skipped on a
-- database that already has it, and added on one that does not.

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS movie_quotes_seed;

CREATE TEMPORARY TABLE movie_quotes_seed (
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

INSERT INTO movie_quotes_seed (category_name, points, question, answer, question_ar, answer_ar, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Movies', 100, '"I am Groot" is almost the only thing a walking tree says in which 2014 superhero film?', 'Guardians of the Galaxy (accept Guardians)',
   'عبارة "I am Groot" ("أنا غروت") تكاد تكون الكلمات الوحيدة التي تقولها شجرة تمشي في أي فيلم أبطال خارقين من عام 2014؟', 'حراس المجرة (Guardians of the Galaxy)',
   'Captain America: The Winter Soldier', 'X-Men: Days of Future Past', 'كابتن أمريكا: جندي الشتاء', 'رجال إكس: أيام الماضي المستقبلي'),

  ('Movies', 200, '"Winter is coming." This line is from which TV series that ran from 2011 to 2019?', 'Game of Thrones (accept A Song of Ice and Fire, the books it is based on)',
   'من أي مسلسل تلفزيوني عُرض من 2011 إلى 2019 هذه العبارة الشهيرة: "Winter is coming." ("الشتاء قادم")؟', 'صراع العروش (Game of Thrones)',
   'Vikings', 'The Witcher', 'الفايكنج', 'ذا ويتشر'),

  ('Movies', 400, '"May the odds be ever in your favor." This line is from which film series?', 'The Hunger Games (accept Hunger Games or any of its films)',
   'من أي سلسلة أفلام هذه العبارة الشهيرة: "May the odds be ever in your favor." ("فلتكن الاحتمالات في صالحكم دائمًا")؟', 'مباريات الجوع (The Hunger Games)',
   'Divergent', 'The Maze Runner', 'المتباينة', 'عدّاء المتاهة');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, '',
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM movie_quotes_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS movie_quotes_seed;

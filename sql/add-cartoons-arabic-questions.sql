-- BrainRush: Cartoons & Childhood, Arabic and Egyptian set (owner request 2026-10-23)
--
-- Adds 3 questions to the existing "Cartoons & Childhood" category (no new
-- category), one each at 200, 300 and 500, on Arabic and Egyptian cartoons and
-- childhood: the singer of an Egyptian cartoon's theme songs, a classic
-- Egyptian Eid song, and the singer of many dubbed-cartoon theme songs. The
-- 400 (Romeo's Blue Skies) and 600 (Mazinger Z) were removed at the owner's
-- request. Bakkar is never named (it is an Egyptians 200 answer) and Spacetoon
-- is never named (Cartoons & Childhood 200 answer). Text questions only
-- (image = ''). Every
-- row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc and fact-check sources:
-- docs/question-sets/cartoons-arabic-review.md.
--
-- Count per point value: 200 = 1, 300 = 1, 500 = 1 (3).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql and
-- sql/migrate-add-wrong-options.sql (or a schema that already has question_ar /
-- answer_ar, the image column with the uq_category_question_image key, and
-- wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar). Run it on whichever database is
-- selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-cartoons-arabic-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when the "Cartoons & Childhood" category does
-- not exist (it comes from sql/add-cartoons-questions.sql), when its point
-- value does not exist, or when the category already has that question
-- (INSERT IGNORE + the uq_category_question_image unique key, image = '' for
-- text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS cartoons_arabic_seed;

CREATE TEMPORARY TABLE cartoons_arabic_seed (
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

INSERT INTO cartoons_arabic_seed (category_name, points, question, answer, question_ar, answer_ar, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Cartoons & Childhood', 200, 'Which singer, nicknamed "El King", sang the theme songs of the Egyptian cartoon about a Nubian boy and his goat, Rashida?', 'Mohamed Mounir (accept Mounir)',
   'أي مطرب، يلقّبه جمهوره بـ"الكينج"، غنّى تترات مسلسل الكرتون المصري عن الطفل النوبي وعنزته رشيدة؟', 'محمد منير',
   'Ali El Haggar', 'Medhat Saleh', 'علي الحجار', 'مدحت صالح'),

  ('Cartoons & Childhood', 300, 'Which Egyptian singer recorded "Ahlan bel Eid" ("Welcome, Eid"), the cheerful holiday song composed by Gamal Salama that is still played at every Eid?', 'Safaa Abu El Saud (accept Safaa Abou El Seoud)',
   'أي مطربة مصرية غنّت "أهلًا بالعيد"، أغنية العيد المبهجة من ألحان جمال سلامة التي ما زالت تُذاع في كل عيد؟', 'صفاء أبو السعود',
   'Fayza Ahmed', 'Najat El Saghira', 'فايزة أحمد', 'نجاة الصغيرة'),

  ('Cartoons & Childhood', 500, 'Which Syrian singer sang the Arabic theme songs of many dubbed cartoons, including "Detective Conan" and "Hunter x Hunter"?', 'Rasha Rizk (accept Racha Rizk)',
   'أي مطربة سورية غنّت الشارات العربية لكثير من الرسوم المتحركة المدبلجة، ومنها "المحقق كونان" و"القناص"؟', 'رشا رزق',
   'Assala Nasri', 'Mayada El Hennawy', 'أصالة نصري', 'ميادة الحناوي');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, '',
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM cartoons_arabic_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS cartoons_arabic_seed;

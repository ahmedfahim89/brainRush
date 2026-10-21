-- BrainRush: Movies question set 2 (owner request 2026-10-21)
--
-- Adds 17 questions to the existing "Movies" category. Drafted as 25 (5 at each
-- of 200 to 600), the owner then removed 8 without replacement. At each point
-- value, 2 questions are about Game of Thrones, Ted Lasso, Superman or Marvel
-- (never two on the same franchise at one value): Game of Thrones 3 (200, 400,
-- 600), Marvel 3 (200, 400, 600), Superman 2 (300, 500) and Ted Lasso 2 (300,
-- 500). The rest are globally famous films and series (Titanic, Kung Fu Panda,
-- Fast and Furious, Friends, Breaking Bad, Inception, Peaky Blinders).
-- Familiarity comes first: a higher value asks a less obvious fact about
-- something famous, not an obscure subject. No answer repeats an answer in the
-- bank, and no question names an existing answer. Text questions only (image
-- stays ''). Every row comes with its Arabic question and answer. Review doc
-- and fact-check sources: docs/question-sets/movies-2-review.md.
--
-- Count per point value: 200 = 3, 300 = 3, 400 = 4, 500 = 3, 600 = 4 (17).
--
-- Requires sql/migrate-add-arabic.sql (or a schema that already has question_ar /
-- answer_ar). Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-movies-2-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. No category is created: a row is skipped when the
-- Movies category was renamed or deleted, when its point value does not exist,
-- or when the category already has that question (INSERT IGNORE + the
-- uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS movies2_seed;

CREATE TEMPORARY TABLE movies2_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO movies2_seed (category_name, points, question, answer, question_ar, answer_ar) VALUES
  ('Movies', 200, 'In "Game of Thrones", which character is known as the "Mother of Dragons"?', 'Daenerys Targaryen (accept Daenerys, Dany, Khaleesi)',
   'في مسلسل "صراع العروش" (Game of Thrones)، أي شخصية تُلقَّب بـ"أم التنانين"؟', 'دينيريس تارغاريان (يُقبل: دينيريس، داني، الخاليسي)'),
  ('Movies', 200, 'In the Marvel films, which scientist turns into the Hulk when he gets angry?', 'Bruce Banner (accept Banner, Dr. Banner)',
   'في أفلام مارفل، ما اسم العالِم الذي يتحول إلى "هالك" عندما يغضب؟', 'بروس بانر (يُقبل: بانر، الدكتور بانر)'),
  ('Movies', 200, 'Which actor played Jack in the 1997 film "Titanic"?', 'Leonardo DiCaprio (accept DiCaprio)',
   'أي ممثل أدى دور "جاك" في فيلم "تايتانيك" عام 1997؟', 'ليوناردو دي كابريو (يُقبل: دي كابريو)'),

  ('Movies', 300, 'In the series "Ted Lasso", which single word is written on the yellow sign that Ted hangs in the team''s locker room?', 'Believe',
   'في مسلسل "تيد لاسو" (Ted Lasso)، ما الكلمة الوحيدة المكتوبة على اللافتة الصفراء التي يعلّقها تيد في غرفة ملابس الفريق؟', 'Believe (آمِن)'),
  ('Movies', 300, 'What is the name of Superman''s home planet?', 'Krypton',
   'ما اسم الكوكب الذي جاء منه سوبرمان؟', 'كريبتون'),
  ('Movies', 300, 'In "Kung Fu Panda", what is the name of the clumsy panda who becomes the Dragon Warrior?', 'Po',
   'في فيلم "كونغ فو باندا"، ما اسم الباندا الأخرق الذي يصبح "محارب التنين"؟', 'بو'),

  ('Movies', 400, 'In "Game of Thrones", which rich and powerful family has a golden lion as its sigil?', 'House Lannister (accept the Lannisters, Lannister)',
   'في مسلسل "صراع العروش"، أي عائلة ثرية وقوية يحمل شعارها أسدًا ذهبيًا؟', 'آل لانيستر (يُقبل: لانيستر، عائلة لانيستر)'),
  ('Movies', 400, 'Which actor played Steve Rogers, also known as Captain America, in the Marvel films?', 'Chris Evans',
   'أي ممثل أدى دور ستيف روجرز، المعروف بـ"كابتن أمريكا"، في أفلام مارفل؟', 'كريس إيفانز'),
  ('Movies', 400, 'Which "Fast and Furious" star, who played Brian O''Conner, died in a car crash in 2013?', 'Paul Walker',
   'أي نجم من نجوم سلسلة "Fast and Furious" (السريع والغاضب)، أدى دور براين أوكونر، تُوفي في حادث سيارة عام 2013؟', 'بول ووكر'),
  ('Movies', 400, 'In the sitcom "Friends", what is the name of the coffee shop where the friends hang out?', 'Central Perk',
   'في المسلسل الكوميدي "فريندز" (Friends)، ما اسم المقهى الذي يقضي فيه الأصدقاء أوقاتهم؟', 'سنترال بيرك (Central Perk)'),

  ('Movies', 500, 'Which actor played Superman in "Man of Steel" (2013)?', 'Henry Cavill',
   'أي ممثل أدى دور سوبرمان في فيلم "رجل من فولاذ" (Man of Steel) عام 2013؟', 'هنري كافيل'),
  ('Movies', 500, 'In the series "Ted Lasso", which club hires Ted as its new manager?', 'AFC Richmond (accept Richmond)',
   'في مسلسل "تيد لاسو"، أي نادٍ يعيّن تيد مديرًا فنيًا جديدًا له؟', 'إيه إف سي ريتشموند (يُقبل: ريتشموند)'),
  ('Movies', 500, 'Which TV chemistry teacher, played by Bryan Cranston, becomes a drug lord under the name "Heisenberg"?', 'Walter White (accept Walt, Mr. White)',
   'أي معلم كيمياء في مسلسل تلفزيوني، أدى دوره براين كرانستون، يصبح زعيمًا لتجارة المخدرات تحت اسم "هايزنبرغ"؟', 'والتر وايت (يُقبل: والت، مستر وايت)'),

  ('Movies', 600, 'In "Game of Thrones", the gentle giant Hodor only ever says "Hodor". Which short phrase, shouted in a famous scene, did the name come from?', 'Hold the door',
   'في مسلسل "صراع العروش"، لا يقول العملاق الطيب "هودور" سوى كلمة "هودور". من أي عبارة إنجليزية قصيرة، صُرخ بها في مشهد شهير، جاء هذا الاسم؟', 'Hold the door (أمسِك الباب)'),
  ('Movies', 600, 'In the Marvel films, how many Infinity Stones does Thanos collect to wipe out half of all life in the universe?', 'Six',
   'في أفلام مارفل، كم عدد أحجار اللانهاية التي يجمعها ثانوس ليمحو نصف الكائنات الحية في الكون؟', 'ستة'),
  ('Movies', 600, 'In "Inception" (2010), what small object does Cobb use as his totem to tell a dream from reality?', 'A spinning top (accept top)',
   'في فيلم "إنسبشن" (Inception) عام 2010، ما الشيء الصغير الذي يستخدمه "كوب" كتعويذة (طوطم) ليميّز الحلم من الواقع؟', 'نحلة دوّارة (يُقبل: نحلة، خذروف، بلبل)'),
  ('Movies', 600, 'Which Irish actor plays gang leader Thomas Shelby in "Peaky Blinders"?', 'Cillian Murphy',
   'أي ممثل أيرلندي يؤدي دور زعيم العصابة توماس شيلبي في مسلسل "بيكي بلايندرز" (Peaky Blinders)؟', 'كيليان مورفي');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar
  FROM movies2_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS movies2_seed;

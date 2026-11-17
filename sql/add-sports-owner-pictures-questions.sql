-- BrainRush: "Who is this?" Sports picture questions the owner added on the live site (2026-11-17)

-- Adds 13 picture questions to the existing "Sports" category (no new category).
-- The owner wrote them in the live admin page and uploaded the photos; this file
-- copies them from live (live ids 1175, 1392, 1393, 1394, 1395, 1396, 1397, 1398, 1399, 1400, 1401, 1402, 1403) so the local bank and
-- a fresh install match live. Photos are in img/questions/athlete-*.jpg (copied from live).
-- Credits are copied as typed on live. Some are incomplete ("NA", "Public"): see
-- the open items in the PR.
--
-- Count per point value: 100 = 3, 200 = 3, 300 = 3, 400 = 1, 500 = 1, 600 = 2 (13).
--
-- Requires the migrations for question_ar / answer_ar, image, image_credit and
-- wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar. Run it on whichever database is selected:
--   local:   mysql -u root brainrush < sql/add-sports-owner-pictures-questions.sql
--   hosted:  already there (added through the admin page); running it is a no-op
-- Safe to run again: INSERT IGNORE + the uq_category_question_image key; image_credit
-- is only filled where it is still ''.

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS sports_pic_seed;

CREATE TEMPORARY TABLE sports_pic_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  image         VARCHAR(255) NOT NULL,
  wrong_1       VARCHAR(255) NOT NULL,
  wrong_2       VARCHAR(255) NOT NULL,
  wrong_1_ar    VARCHAR(255) NOT NULL,
  wrong_2_ar    VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO sports_pic_seed (category_name, points, question, answer, question_ar, answer_ar, image, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Sports', 100, 'Who is this legendary footballer?', 'Pelé',
   'من هو لاعب كرة القدم الأسطوري هذا؟', 'بيليه', 'img/questions/athlete-pele.jpg',
   'Ronaldo', 'Ronaldinho', 'رونالدو', 'رونالدينيو'),
  ('Sports', 100, 'Who is this football superstar?', 'Lionel Messi',
   'من هو نجم كرة القدم هذا؟', 'ليونيل ميسي', 'img/questions/athlete-messi.jpg',
   'Gabriel Batistuta', 'Diego Maradona', 'غابرييل باتيستوتا', 'دييجو مارادونا'),
  ('Sports', 100, 'Who is this football superstar?', 'Cristiano Ronaldo',
   'من هو نجم كرة القدم هذا؟', 'كريستيانو رونالدو', 'img/questions/athlete-cristiano-ronaldo.jpg',
   'Lionel Messi', 'Neymar', 'ليونيل ميسي', 'نيمار'),
  ('Sports', 200, 'Who is this Olympic swimming champion?', 'Michael Phelps',
   'من هو بطل السباحة الأولمبي هذا؟', 'مايكل فيلبس', 'img/questions/athlete-michael-phelps.jpg',
   'Ryan Lochte', 'Ian Thorpe', 'رايان لوكتي', 'إيان ثورب'),
  ('Sports', 200, 'Who is this tennis champion?', 'Novak Djokovic',
   'من هو بطل التنس هذا؟', 'نوفاك دجوكوفيتش', 'img/questions/athlete-novak-djokovic.jpg',
   'Roger Federer', 'Andy Murray', 'روجر فيدرر', 'آندي موراي'),
  ('Sports', 200, 'Who is this legendary footballer?', 'Diego Maradona',
   'من هو لاعب كرة القدم الأسطوري هذا؟', 'دييجو مارادونا', 'img/questions/athlete-maradona.jpg',
   'Lionel Messi', 'Gabriel Batistuta', 'ليونيل ميسي', 'جابرييل باتيستوتا'),
  ('Sports', 300, 'Who is this basketball legend?', 'Michael Jordan',
   'من هو أسطورة كرة السلة هذا؟', 'مايكل جوردان', 'img/questions/athlete-michael-jordan.jpg',
   'Kobe Bryant', 'LeBron James', 'كوبي براينت', 'ليبرون جيمس'),
  ('Sports', 300, 'Who is this legendary boxing champion?', 'Muhammad Ali',
   'من هو بطل الملاكمة الأسطوري هذا؟', 'محمد علي', 'img/questions/athlete-muhammad-ali.jpg',
   'Mike Tyson', 'George Foreman', 'مايك تايسون', 'جورج فورمان'),
  ('Sports', 300, 'Who is this world-famous sprinter?', 'Usain Bolt',
   'من هو العداء الشهير هذا؟', 'يوسين بولت', 'img/questions/athlete-usain-bolt.jpg',
   'Carl Lewis', 'Justin Gatlin', 'كارل لويس', 'جاستن جاتلين'),
  ('Sports', 400, 'Who is this tennis legend?', 'Roger Federer',
   'من هو أسطورة التنس هذا؟', 'روجر فيدرر', 'img/questions/athlete-roger-federer.jpg',
   'Rafael Nadal', 'Novak Djokovic', 'رافاييل نادال', 'نوفاك دجوكوفيتش'),
  ('Sports', 500, 'Who is this legendary golfer?', 'Tiger Woods',
   'من هو لاعب الجولف الأسطوري هذا؟', 'تايجر وودز', 'img/questions/athlete-tiger-woods.jpg',
   'Jack Nicklaus', 'Rory McIlroy', 'جاك نيكلوس', 'روري ماكلروي'),
  ('Sports', 600, 'Who is this NBA basketball superstar?', 'LeBron James',
   'من هو نجم كرة السلة في دوري NBA هذا؟', 'ليبرون جيمس', 'img/questions/athlete-lebron-james.jpg',
   'Stephen Curry', 'Kevin Durant', 'ستيفن كاري', 'كيفن دورانت'),
  ('Sports', 600, 'Who is this tennis legend?', 'Serena Williams',
   'من هي أسطورة التنس هذه؟', 'سيرينا ويليامز', 'img/questions/athlete-serena-williams.jpg',
   'Venus Williams', 'Maria Sharapova', 'فينوس ويليامز', 'ماريا شارابوفا');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM sports_pic_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS sports_pic_seed;

-- Credits (as on live), only where still empty.
DROP TEMPORARY TABLE IF EXISTS sports_pic_credit;
CREATE TEMPORARY TABLE sports_pic_credit (
  image        VARCHAR(255) NOT NULL,
  image_credit VARCHAR(255) NOT NULL,
  PRIMARY KEY (image)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
INSERT INTO sports_pic_credit (image, image_credit) VALUES
  ('img/questions/athlete-pele.jpg', 'Public'),
  ('img/questions/athlete-messi.jpg', 'CC BY-SA 3.0'),
  ('img/questions/athlete-cristiano-ronaldo.jpg', 'Creative Commons Attribution-Share Alike 3.0 Unported'),
  ('img/questions/athlete-michael-phelps.jpg', 'Creative Commons Attribution 3.0 Brazil License'),
  ('img/questions/athlete-novak-djokovic.jpg', 'Creative Commons Attribution 4.0 International'),
  ('img/questions/athlete-maradona.jpg', 'NA'),
  ('img/questions/athlete-michael-jordan.jpg', 'Lipofsky Basketballphoto.com'),
  ('img/questions/athlete-muhammad-ali.jpg', 'NA'),
  ('img/questions/athlete-usain-bolt.jpg', 'Creative Commons Attribution-Share Alike 2.0 Generic'),
  ('img/questions/athlete-roger-federer.jpg', 'Creative Commons Attribution 2.0 Generic'),
  ('img/questions/athlete-tiger-woods.jpg', 'Creative Commons Attribution-Share Alike 2.0 Generic'),
  ('img/questions/athlete-lebron-james.jpg', 'Creative Commons Attribution 2.0 Generic'),
  ('img/questions/athlete-serena-williams.jpg', 'Creative Commons Attribution 2.0');

UPDATE questions q
  JOIN sports_pic_credit c ON c.image = q.image
   SET q.image_credit = c.image_credit
 WHERE q.image_credit = '';

DROP TEMPORARY TABLE IF EXISTS sports_pic_credit;

-- BrainRush: Landmarks picture question set (owner request 2026-10-22)
--
-- Adds a new "Landmarks" category, the second picture category after Flags. Drafted as 72
-- questions, 12 at each of 100, 200, 300, 400, 500 and 600 (the owner keeps about 8 per
-- value). 66 are picture questions with the same prompt ("Which landmark is this?") and a
-- photo from img/questions/landmark-*.jpg (the image column). The answer is the landmark's
-- name only (no city or country, so a revealed answer cannot give away a Geography or
-- History answer). 6 are text questions about landmarks (image ''): Mount Rushmore (200),
-- the Paris obelisk (300), Uluru (400), the Colossus of Rhodes (500), the Mausoleum at
-- Halicarnassus and the Avenue of Sphinxes (600). The set mixes world landmarks with
-- Egyptian and Arab ones. Every row comes with its Arabic question and answer.
-- Review doc, fact-check sources and image licences (all photos are from Wikimedia Commons,
-- public domain, CC0, CC BY or CC BY-SA, with attribution in the review doc):
-- docs/question-sets/landmarks-review.md.
--
-- Kept after the owner's review (2026-10-22, 26 removed, not replaced): 46 questions,
-- 100 = 12, 200 = 10, 300 = 10, 400 = 6, 500 = 5, 600 = 3. 44 are picture questions; the
-- 2 text questions left are Mount Rushmore (200) and the Paris obelisk (300). The draft
-- notes above describe the 72-question draft.
--
-- Photo credits: at the end, every picture row gets its image_credit ("<author> / <licence>",
-- shown as a caption under the photo, the attribution CC BY / CC BY-SA asks for).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql and
-- sql/migrate-add-image-credit.sql (or a schema that already has question_ar / answer_ar,
-- the image and image_credit columns and the uq_category_question_image key). Run
-- migrate-add-image-credit.sql FIRST: without the column, the credit UPDATE at the end stops
-- with "Unknown column 'q.image_credit'" (the questions are inserted, the credits are not;
-- run the migration, then this file again). Run it on whichever database is selected
-- (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-landmarks-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy the img/questions/landmark-*.jpg files with it.
-- It is safe to run again. The Landmarks category is created only if it does not exist
-- (INSERT IGNORE + uq_category_name). A row is skipped when the Landmarks category was
-- renamed or deleted, when its point value does not exist, or when the category already has
-- that question with that image (INSERT IGNORE + uq_category_question_image). If it is run
-- before sql/migrate-add-image.sql, the question insert stops with "Unknown column 'image'"
-- and only the empty Landmarks category is created. An empty category is not offered for
-- play. Run the migration, then run this file again. Credits are only written where
-- image_credit is still '' (a credit edited on the admin page is kept).

SET NAMES utf8mb4;

INSERT IGNORE INTO categories (name) VALUES ('Landmarks');

DROP TEMPORARY TABLE IF EXISTS landmarks_seed;

CREATE TEMPORARY TABLE landmarks_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  image         VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO landmarks_seed (category_name, points, question, answer, question_ar, answer_ar, image) VALUES
  ('Landmarks', 100, 'Which landmark is this?', 'The Pyramids of Giza (accept the Giza pyramids, the Pyramids)',
   'ما هذا المعلم؟', 'أهرامات الجيزة (يُقبل: الأهرامات)', 'img/questions/landmark-pyramids-giza.jpg'),
  ('Landmarks', 100, 'Which landmark is this?', 'The Eiffel Tower',
   'ما هذا المعلم؟', 'برج إيفل', 'img/questions/landmark-eiffel-tower.jpg'),
  ('Landmarks', 100, 'Which landmark is this?', 'The Statue of Liberty',
   'ما هذا المعلم؟', 'تمثال الحرية', 'img/questions/landmark-statue-of-liberty.jpg'),
  ('Landmarks', 100, 'Which landmark is this?', 'The Taj Mahal (accept the Taj)',
   'ما هذا المعلم؟', 'تاج محل', 'img/questions/landmark-taj-mahal.jpg'),
  ('Landmarks', 100, 'Which landmark is this?', 'The Great Wall of China (accept the Great Wall)',
   'ما هذا المعلم؟', 'سور الصين العظيم', 'img/questions/landmark-great-wall.jpg'),
  ('Landmarks', 100, 'Which landmark is this?', 'The Leaning Tower of Pisa (accept the Tower of Pisa)',
   'ما هذا المعلم؟', 'برج بيزا المائل (يُقبل: برج بيزا)', 'img/questions/landmark-leaning-tower-pisa.jpg'),
  ('Landmarks', 100, 'Which landmark is this?', 'Big Ben (accept the Elizabeth Tower, the Houses of Parliament, the Palace of Westminster)',
   'ما هذا المعلم؟', 'ساعة بيج بن (يُقبل: برج إليزابيث، مبنى البرلمان البريطاني، قصر وستمنستر)', 'img/questions/landmark-big-ben.jpg'),
  ('Landmarks', 100, 'Which landmark is this?', 'The Sydney Opera House',
   'ما هذا المعلم؟', 'دار أوبرا سيدني', 'img/questions/landmark-sydney-opera-house.jpg'),
  ('Landmarks', 100, 'Which landmark is this?', 'The Burj Khalifa',
   'ما هذا المعلم؟', 'برج خليفة', 'img/questions/landmark-burj-khalifa.jpg'),
  ('Landmarks', 100, 'Which landmark is this?', 'The Colosseum (accept the Flavian Amphitheatre)',
   'ما هذا المعلم؟', 'الكولوسيوم (يُقبل: مدرج فلافيان)', 'img/questions/landmark-colosseum.jpg'),
  ('Landmarks', 100, 'Which landmark is this?', 'Christ the Redeemer',
   'ما هذا المعلم؟', 'تمثال المسيح الفادي', 'img/questions/landmark-christ-the-redeemer.jpg'),
  ('Landmarks', 100, 'Which landmark is this?', 'The White House',
   'ما هذا المعلم؟', 'البيت الأبيض', 'img/questions/landmark-white-house.jpg'),

  ('Landmarks', 200, 'Which landmark is this?', 'Abu Simbel (accept the Abu Simbel temples)',
   'ما هذا المعلم؟', 'معبد أبو سمبل (يُقبل: أبو سمبل)', 'img/questions/landmark-abu-simbel.jpg'),
  ('Landmarks', 200, 'Which landmark is this?', 'The Cairo Tower',
   'ما هذا المعلم؟', 'برج القاهرة', 'img/questions/landmark-cairo-tower.jpg'),
  ('Landmarks', 200, 'Which landmark is this?', 'The Golden Gate Bridge',
   'ما هذا المعلم؟', 'جسر البوابة الذهبية (جولدن جيت)', 'img/questions/landmark-golden-gate-bridge.jpg'),
  ('Landmarks', 200, 'Which landmark is this?', 'Stonehenge',
   'ما هذا المعلم؟', 'ستونهنج', 'img/questions/landmark-stonehenge.jpg'),
  ('Landmarks', 200, 'Which landmark is this?', 'The Arc de Triomphe (accept the Arch of Triumph)',
   'ما هذا المعلم؟', 'قوس النصر', 'img/questions/landmark-arc-de-triomphe.jpg'),
  ('Landmarks', 200, 'Which landmark is this?', 'The Acropolis (accept the Parthenon)',
   'ما هذا المعلم؟', 'الأكروبوليس (يُقبل: البارثينون)', 'img/questions/landmark-acropolis.jpg'),
  ('Landmarks', 200, 'Which landmark is this?', 'Tower Bridge',
   'ما هذا المعلم؟', 'جسر البرج (تاور بريدج)', 'img/questions/landmark-tower-bridge.jpg'),
  ('Landmarks', 200, 'Which landmark is this?', 'Petra (accept Al-Khazneh, the Treasury)',
   'ما هذا المعلم؟', 'البتراء (يُقبل: الخزنة)', 'img/questions/landmark-petra.jpg'),
  ('Landmarks', 200, 'Which landmark is this?', 'The Louvre (accept the Louvre Pyramid, the Louvre Museum)',
   'ما هذا المعلم؟', 'متحف اللوفر (يُقبل: هرم اللوفر)', 'img/questions/landmark-louvre-pyramid.jpg'),
  ('Landmarks', 200, 'Which mountain memorial in South Dakota, USA, has the giant carved faces of four US presidents?', 'Mount Rushmore (accept Mount Rushmore National Memorial)',
   'أي نصب جبلي في ولاية داكوتا الجنوبية الأمريكية نُحتت فيه وجوه عملاقة لأربعة رؤساء أمريكيين؟', 'جبل راشمور (يُقبل: نصب جبل راشمور الوطني)', ''),

  ('Landmarks', 300, 'Which landmark is this?', 'The Mosque of Muhammad Ali (accept the Alabaster Mosque, the Cairo Citadel, the Citadel of Saladin)',
   'ما هذا المعلم؟', 'مسجد محمد علي (يُقبل: جامع المرمر، قلعة صلاح الدين، القلعة)', 'img/questions/landmark-muhammad-ali-mosque.jpg'),
  ('Landmarks', 300, 'Which landmark is this?', 'The Citadel of Qaitbay (accept Qaitbay Fort)',
   'ما هذا المعلم؟', 'قلعة قايتباي', 'img/questions/landmark-qaitbay-citadel.jpg'),
  ('Landmarks', 300, 'Which landmark is this?', 'The Bibliotheca Alexandrina (accept the Library of Alexandria)',
   'ما هذا المعلم؟', 'مكتبة الإسكندرية', 'img/questions/landmark-bibliotheca-alexandrina.jpg'),
  ('Landmarks', 300, 'Which landmark is this?', 'Saint Basil''s Cathedral (accept St Basil''s)',
   'ما هذا المعلم؟', 'كاتدرائية القديس باسيل', 'img/questions/landmark-st-basils-cathedral.jpg'),
  ('Landmarks', 300, 'Which landmark is this?', 'The Brandenburg Gate',
   'ما هذا المعلم؟', 'بوابة براندنبورغ', 'img/questions/landmark-brandenburg-gate.jpg'),
  ('Landmarks', 300, 'Which landmark is this?', 'The Sagrada Familia',
   'ما هذا المعلم؟', 'كنيسة ساغرادا فاميليا', 'img/questions/landmark-sagrada-familia.jpg'),
  ('Landmarks', 300, 'Which landmark is this?', 'The Trevi Fountain',
   'ما هذا المعلم؟', 'نافورة تريفي', 'img/questions/landmark-trevi-fountain.jpg'),
  ('Landmarks', 300, 'Which landmark is this?', 'Marina Bay Sands',
   'ما هذا المعلم؟', 'مارينا باي ساندز', 'img/questions/landmark-marina-bay-sands.jpg'),
  ('Landmarks', 300, 'Which landmark is this?', 'The Temple of Hatshepsut (accept Deir el-Bahari)',
   'ما هذا المعلم؟', 'معبد حتشبسوت (يُقبل: الدير البحري)', 'img/questions/landmark-hatshepsut-temple.jpg'),
  ('Landmarks', 300, 'Which kind of ancient Egyptian monument, a tall four-sided stone pillar with a pyramid-shaped tip, has stood in the Place de la Concorde in Paris since 1836?', 'An obelisk',
   'أي نوع من الآثار المصرية القديمة، وهو عمود حجري طويل رباعي الأضلاع ينتهي بقمة هرمية، يقف في ميدان الكونكورد في باريس منذ عام 1836؟', 'مسلة', ''),

  ('Landmarks', 400, 'Which landmark is this?', 'The Kuwait Towers',
   'ما هذا المعلم؟', 'أبراج الكويت', 'img/questions/landmark-kuwait-towers.jpg'),
  ('Landmarks', 400, 'Which landmark is this?', 'The Dubai Frame',
   'ما هذا المعلم؟', 'برواز دبي (يُقبل: إطار دبي)', 'img/questions/landmark-dubai-frame.jpg'),
  ('Landmarks', 400, 'Which landmark is this?', 'Stanley Bridge',
   'ما هذا المعلم؟', 'كوبري ستانلي', 'img/questions/landmark-stanley-bridge.jpg'),
  ('Landmarks', 400, 'Which landmark is this?', 'The Grand Egyptian Museum (accept the GEM)',
   'ما هذا المعلم؟', 'المتحف المصري الكبير', 'img/questions/landmark-grand-egyptian-museum.jpg'),
  ('Landmarks', 400, 'Which landmark is this?', 'The Alhambra',
   'ما هذا المعلم؟', 'قصر الحمراء', 'img/questions/landmark-alhambra.jpg'),
  ('Landmarks', 400, 'Which landmark is this?', 'Florence Cathedral (accept the Duomo, Santa Maria del Fiore)',
   'ما هذا المعلم؟', 'كاتدرائية فلورنسا (يُقبل: الدومو، سانتا ماريا ديل فيوري)', 'img/questions/landmark-florence-cathedral.jpg'),

  ('Landmarks', 500, 'Which landmark is this?', 'The Baron Empain Palace (accept Qasr El Baron, the Baron Palace)',
   'ما هذا المعلم؟', 'قصر البارون (يُقبل: قصر البارون إمبان)', 'img/questions/landmark-baron-empain-palace.jpg'),
  ('Landmarks', 500, 'Which landmark is this?', 'Montaza Palace (accept the Haramlik, Montaza Gardens)',
   'ما هذا المعلم؟', 'قصر المنتزه (يُقبل: الحرملك، حدائق المنتزه)', 'img/questions/landmark-montaza-palace.jpg'),
  ('Landmarks', 500, 'Which landmark is this?', 'The Museum of the Future',
   'ما هذا المعلم؟', 'متحف المستقبل', 'img/questions/landmark-museum-of-the-future.jpg'),
  ('Landmarks', 500, 'Which landmark is this?', 'Kingdom Centre (accept Kingdom Centre Tower, Burj Al Mamlaka)',
   'ما هذا المعلم؟', 'برج المملكة (يُقبل: مركز المملكة)', 'img/questions/landmark-kingdom-centre.jpg'),
  ('Landmarks', 500, 'Which landmark is this?', 'The Hungarian Parliament Building (accept the Budapest Parliament)',
   'ما هذا المعلم؟', 'مبنى البرلمان المجري (يُقبل: برلمان بودابست)', 'img/questions/landmark-hungarian-parliament.jpg'),

  ('Landmarks', 600, 'Which landmark is this?', 'The Petronas Towers (accept the Petronas Twin Towers)',
   'ما هذا المعلم؟', 'برجا بتروناس التوأمان', 'img/questions/landmark-petronas-towers.jpg'),
  ('Landmarks', 600, 'Which landmark is this?', 'Neuschwanstein Castle',
   'ما هذا المعلم؟', 'قلعة نويشفانشتاين', 'img/questions/landmark-neuschwanstein.jpg'),
  ('Landmarks', 600, 'Which landmark is this?', 'The Louvre Abu Dhabi',
   'ما هذا المعلم؟', 'متحف اللوفر أبوظبي', 'img/questions/landmark-louvre-abu-dhabi.jpg');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image
  FROM landmarks_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS landmarks_seed;

-- Photo credits (caption under the picture, "Photo: <credit>"), from the image table of
-- docs/question-sets/landmarks-review.md: "<author> / <licence>". Matched by image path, so
-- they also apply if the category is renamed. Only empty credits are filled, so a credit
-- edited on the admin page is never overwritten when this file runs again.
DROP TEMPORARY TABLE IF EXISTS landmarks_credits;

CREATE TEMPORARY TABLE landmarks_credits (
  image  VARCHAR(255) NOT NULL,
  credit VARCHAR(255) NOT NULL,
  PRIMARY KEY (image)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO landmarks_credits (image, credit) VALUES
  ('img/questions/landmark-pyramids-giza.jpg', 'Ricardo Liberato / CC BY-SA 2.0'),
  ('img/questions/landmark-eiffel-tower.jpg', 'Benh LIEU SONG / Public domain'),
  ('img/questions/landmark-statue-of-liberty.jpg', '銀河市長 / CC BY-SA 4.0'),
  ('img/questions/landmark-taj-mahal.jpg', 'Yann; edited by King of Hearts / CC BY-SA 4.0'),
  ('img/questions/landmark-great-wall.jpg', 'CEphoto, Uwe Aranas / CC BY-SA 3.0'),
  ('img/questions/landmark-leaning-tower-pisa.jpg', 'PaestumPaestum / CC BY 4.0'),
  ('img/questions/landmark-big-ben.jpg', 'Colin / CC BY-SA 4.0'),
  ('img/questions/landmark-sydney-opera-house.jpg', 'Thomas Adams / CC BY-SA 4.0'),
  ('img/questions/landmark-burj-khalifa.jpg', 'Laika ac / CC BY-SA 2.0'),
  ('img/questions/landmark-colosseum.jpg', 'Anil Öztas / CC BY 4.0'),
  ('img/questions/landmark-christ-the-redeemer.jpg', 'Arne Müseler / CC BY-SA 3.0 DE'),
  ('img/questions/landmark-white-house.jpg', 'Diego Delso / CC BY-SA 3.0'),
  ('img/questions/landmark-abu-simbel.jpg', 'Diego Delso / CC BY-SA 4.0'),
  ('img/questions/landmark-cairo-tower.jpg', 'Jorge Láscar / CC BY 2.0'),
  ('img/questions/landmark-golden-gate-bridge.jpg', 'Frank Schulenburg / CC BY-SA 4.0'),
  ('img/questions/landmark-stonehenge.jpg', 'Diego Delso / CC BY-SA 4.0'),
  ('img/questions/landmark-arc-de-triomphe.jpg', 'Wilfredor / CC0'),
  ('img/questions/landmark-acropolis.jpg', 'A.Savin / CC BY-SA 3.0'),
  ('img/questions/landmark-tower-bridge.jpg', 'The Cosmonaut / CC BY-SA 2.5 CA'),
  ('img/questions/landmark-petra.jpg', 'Diego Delso / CC BY-SA 3.0'),
  ('img/questions/landmark-louvre-pyramid.jpg', 'Maksim Sokolov (maxergon.com) / CC BY-SA 4.0'),
  ('img/questions/landmark-muhammad-ali-mosque.jpg', 'kallerna / CC BY-SA 3.0'),
  ('img/questions/landmark-qaitbay-citadel.jpg', 'لا روسا / CC BY-SA 3.0'),
  ('img/questions/landmark-bibliotheca-alexandrina.jpg', 'Ahmedsalahemam / CC BY-SA 4.0'),
  ('img/questions/landmark-st-basils-cathedral.jpg', 'Юрий Д.К. / CC BY 4.0'),
  ('img/questions/landmark-brandenburg-gate.jpg', 'Thomas Wolf, www.foto-tw.de / CC BY-SA 3.0'),
  ('img/questions/landmark-sagrada-familia.jpg', 'Wikipsico43 / CC BY-SA 4.0'),
  ('img/questions/landmark-trevi-fountain.jpg', 'Wilfredor / CC0'),
  ('img/questions/landmark-marina-bay-sands.jpg', 'Basile Morin / CC BY-SA 4.0'),
  ('img/questions/landmark-hatshepsut-temple.jpg', 'Diego Delso / CC BY-SA 4.0'),
  ('img/questions/landmark-kuwait-towers.jpg', 'Criselda Rayo / CC BY-SA 4.0'),
  ('img/questions/landmark-dubai-frame.jpg', 'Rennboot / CC BY 3.0'),
  ('img/questions/landmark-stanley-bridge.jpg', 'Шухрат Саъдиев / CC BY-SA 4.0'),
  ('img/questions/landmark-grand-egyptian-museum.jpg', 'Holger Uwe Schmitt / CC BY-SA 4.0'),
  ('img/questions/landmark-alhambra.jpg', 'Jebulon / Public domain'),
  ('img/questions/landmark-florence-cathedral.jpg', 'Petar Milošević / CC BY-SA 4.0'),
  ('img/questions/landmark-baron-empain-palace.jpg', 'amr moustafa shalaby / CC BY 3.0'),
  ('img/questions/landmark-montaza-palace.jpg', 'Murat Özsoy 1958 / CC BY-SA 4.0'),
  ('img/questions/landmark-museum-of-the-future.jpg', 'Александр Сигачёв / CC BY-SA 4.0'),
  ('img/questions/landmark-kingdom-centre.jpg', 'Wajahat Mahmood / CC BY-SA 2.0'),
  ('img/questions/landmark-hungarian-parliament.jpg', 'Lynx1211 / CC BY-SA 4.0'),
  ('img/questions/landmark-petronas-towers.jpg', 'Marcin Konsek / CC BY-SA 4.0'),
  ('img/questions/landmark-neuschwanstein.jpg', 'Wilfredor / CC0'),
  ('img/questions/landmark-louvre-abu-dhabi.jpg', 'Francesco Bini / CC BY-SA 4.0');

UPDATE questions q
  JOIN landmarks_credits lc ON lc.image = q.image
   SET q.image_credit = lc.credit
 WHERE q.image_credit = '';

DROP TEMPORARY TABLE IF EXISTS landmarks_credits;

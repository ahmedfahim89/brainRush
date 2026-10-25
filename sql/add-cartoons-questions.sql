-- BrainRush: Cartoons & Childhood question set (owner request 2026-10-22)
--
-- Adds a new "Cartoons & Childhood" category (Arabic display idea: kartoon zaman)
-- for adults who grew up in the Arab world in the 1980s-2000s. Drafted as 12 per
-- point value (100-600) so the owner can remove 30-50% and keep about 8 per value.
-- Each value mixes Arabic-dubbed anime (Captain Majid, Grendizer, Detective Conan,
-- Adnan wa Lina, Sally, Remi, Hamtaro, Pokemon, Digimon, Slam Dunk and more),
-- Egyptian and Arab children's TV and radio (Iftah Ya Simsim, Alam Simsim, Bougy
-- wa Tamtam, Mama Nagwa, Abla Fadila, Spacetoon, the Egyptian "Mickey" comics),
-- classic TV cartoons (Tom and Jerry, Looney Tunes, Popeye, The Smurfs,
-- Scooby-Doo, The Flintstones, Tintin, He-Man and more) and Disney/Pixar films not
-- already in the bank. Familiar titles only: a higher value asks a less obvious
-- fact about a well-known show, never an obscure show. Bakkar is never named
-- because it is already an Egyptians answer. No answer repeats an answer in the bank.
-- Text questions only (image stays ''). Every row comes with its Arabic question
-- and answer. Review doc and fact-check sources:
-- docs/question-sets/cartoons-review.md.
--
-- Count per point value: 100 = 9, 200 = 3, 300 = 4, 400 = 4, 500 = 3, 600 = 1 (24).
-- Drafted as 72 (12 per value); the owner removed 52 on 2026-10-22. Four new
-- 400s were added on 2026-10-22 (Donatello at the owner's request, Hassouna from
-- Bakkar, Dee Dee, Tinker Bell) so the category is playable. A Cheshire Cat 400
-- was swapped for Hassouna at the owner's request. The Hassouna question does not
-- name Bakkar or Rashida (Bakkar is an Egyptians 200 answer).
--
-- Requires sql/migrate-add-arabic.sql and sql/migrate-add-image.sql (or a schema
-- that already has question_ar / answer_ar and the image column). Run it on
-- whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-cartoons-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. The category is created only if it does not exist
-- (INSERT IGNORE + the unique category name). A row is skipped when its point
-- value does not exist, or when the category already has that question
-- (INSERT IGNORE + the uq_category_question_image unique key, image = '' for
-- text questions).

SET NAMES utf8mb4;

INSERT IGNORE INTO categories (name) VALUES ('Cartoons & Childhood');

DROP TEMPORARY TABLE IF EXISTS cartoons_seed;

CREATE TEMPORARY TABLE cartoons_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO cartoons_seed (category_name, points, question, answer, question_ar, answer_ar) VALUES
  ('Cartoons & Childhood', 100, 'In the Arab world, the anime "Captain Tsubasa" was known by what name?', 'Captain Majid (accept Captain Majed, Kabtin Majid)',
   'بأي اسم عُرف الأنمي "كابتن تسوباسا" في العالم العربي؟', 'كابتن ماجد'),
  ('Cartoons & Childhood', 100, 'In the anime that follows young trainer Ash Ketchum, what is the name of his yellow electric partner?', 'Pikachu',
   'في الأنمي الذي يتابع المدرب الصغير آش كيتشم، ما اسم رفيقه الأصفر الكهربائي؟', 'بيكاتشو'),
  ('Cartoons & Childhood', 100, 'What was the name of the Arabic version of "Sesame Street", made in the Gulf from 1979 and shown across the Arab world?', 'Aalam Simsim (accept Open Sesame)',
   'ما اسم النسخة العربية من برنامج "شارع السمسم"، التي أُنتجت في الخليج منذ عام 1979 وعُرضت في أنحاء العالم العربي؟', 'عالم سمسم (يقبل افتح يا سمسم)'),
  ('Cartoons & Childhood', 100, 'What are the little blue creatures called who live in mushroom houses and are always chased by the wizard Gargamel?', 'The Smurfs (accept Al-Sanafer)',
   'ما اسم المخلوقات الزرقاء الصغيرة التي تعيش في بيوت على شكل فطر ويطاردها الساحر الشرير شرشبيل دائمًا؟', 'السنافر'),
  ('Cartoons & Childhood', 100, 'What food does Popeye the Sailor eat from a can to get his super strength?', 'Spinach',
   'ما الطعام الذي يأكله البحّار باباي من العلبة ليحصل على قوته الخارقة؟', 'السبانخ'),
  ('Cartoons & Childhood', 100, 'Which cartoon rabbit is famous for asking "What''s up, Doc?"', 'Bugs Bunny',
   'أي أرنب كرتوني تشتهر عبارته "ما الأخبار يا دكتور؟" (What''s up, Doc)؟', 'باغز باني'),
  ('Cartoons & Childhood', 100, 'Which cartoon, first made by MGM in 1940, follows a house cat who almost never catches the clever little rodent he chases?', 'Tom and Jerry',
   'أي كرتون، صنعته شركة MGM لأول مرة عام 1940، يحكي عن قط منزلي لا ينجح تقريبًا أبدًا في الإمساك بالقارض الصغير الذكي الذي يطارده؟', 'توم وجيري'),
  ('Cartoons & Childhood', 100, 'Which wooden puppet''s nose grows longer every time he tells a lie?', 'Pinocchio',
   'أي دمية خشبية يطول أنفها كلما كذبت؟', 'بينوكيو'),
  ('Cartoons & Childhood', 100, 'In which 2009 Pixar film does an old man tie thousands of balloons to his house and fly away?', 'Up',
   'في أي فيلم من إنتاج بيكسار عام 2009 يربط رجل عجوز آلاف البالونات ببيته ويطير به؟', '"Up" (فوق)'),

  ('Cartoons & Childhood', 200, 'Which Arab children''s TV channel, launched in 2000, sorted its cartoons into "planets" such as Action Planet and Adventure Planet?', 'Spacetoon',
   'أي قناة أطفال عربية انطلقت عام 2000 وقسّمت برامجها الكرتونية إلى "كواكب" مثل كوكب الأكشن وكوكب المغامرات؟', 'سبيستون'),
  ('Cartoons & Childhood', 200, 'In the Egyptian Arabic "Mickey" comics, which Disney character is called "Batout"?', 'Donald Duck (accept Donald)',
   'في مجلة "ميكي" المصرية، أي شخصية من شخصيات ديزني اسمها "بطوط"؟', 'دونالد داك (Donald Duck)'),
  ('Cartoons & Childhood', 200, 'In Disney''s 1961 film about Pongo, Perdita and their spotted puppies, which villain wants a coat made from the puppies'' fur?', 'Cruella de Vil (accept Cruella)',
   'في فيلم ديزني عام 1961 عن الكلبين بونغو وبيرديتا وجرائهما المرقطة، أي شريرة تريد أن تصنع معطفًا من فراء الجراء؟', 'كرويلا دي فيل (يُقبل: كرويلا)'),

  ('Cartoons & Childhood', 300, 'In "Detective Conan", the boy detective is really a teenage detective shrunk by a poison. What is his real name?', 'Shinichi Kudo (accept Shinichi, Jimmy Kudo)',
   'في "المحقق كونان"، المحقق الصغير هو في الحقيقة محقق شاب تقلّص جسمه بسبب سم. ما اسمه الحقيقي؟', 'شينيتشي كودو (يُقبل: شينيتشي)'),
  ('Cartoons & Childhood', 300, 'In "Grendizer", what is the name of the exiled space prince who pilots the giant robot?', 'Duke Fleed (accept Daisuke, Daisuke Umon)',
   'في "غرندايزر"، ما اسم الأمير الفضائي المنفي الذي يقود الروبوت العملاق؟', 'دوق فليد (يُقبل: دايسكي)'),
  ('Cartoons & Childhood', 300, 'Which Egyptian puppet series by Mahmoud Rahmy, first shown in 1983, had Younes Shalaby and Hala Fakher voicing its two title siblings?', 'Bougy wa Tamtam (Bougy and Tamtam)',
   'أي مسلسل عرائس مصري من تأليف وإخراج محمود رحمي، بدأ عرضه عام 1983، أدى فيه يونس شلبي وهالة فاخر صوتَي الأخوين بطلَي العمل؟', 'بوجي وطمطم'),
  ('Cartoons & Childhood', 300, 'In Disney''s "Lady and the Tramp", what food do the two dogs share in the famous moonlit dinner scene?', 'Spaghetti (accept spaghetti and meatballs)',
   'في فيلم ديزني "السيدة والصعلوك"، ما الطعام الذي يتقاسمه الكلبان في مشهد العشاء الشهير تحت ضوء القمر؟', 'السباغيتي (يُقبل: السباغيتي بكرات اللحم)'),

  ('Cartoons & Childhood', 400, 'What is the name of the Ninja Turtle who wears a purple mask?', 'Donatello (accept Donnie)',
   'ما اسم سلحفاة النينجا التي ترتدي القناع البنفسجي؟', 'دوناتيلو (يُقبل: دوني)'),
  ('Cartoons & Childhood', 400, 'In the Egyptian cartoon about a brave Nubian boy and his goat, what is the name of the boy''s mischievous friend?', 'Hassouna (accept Hassona, Hassuna)',
   'في مسلسل الكرتون المصري عن الطفل النوبي الشجاع وعنزته، ما اسم صديقه المشاغب؟', 'حسونة'),
  ('Cartoons & Childhood', 400, 'In "Dexter''s Laboratory", what is the name of the boy genius''s tall, ballet-loving older sister who keeps asking "What does this button do?"', 'Dee Dee',
   'في كرتون "مختبر دكستر"، ما اسم الأخت الكبرى للعبقري الصغير، الطويلة المحبة للباليه، التي تسأل دائمًا "ماذا يفعل هذا الزر؟"', 'دي دي'),
  ('Cartoons & Childhood', 400, 'In Disney''s "Peter Pan", what is the name of the tiny glowing fairy whose pixie dust helps Wendy and her brothers fly to Never Land?', 'Tinker Bell (accept Tink)',
   'في فيلم ديزني "بيتر بان"، ما اسم الجنية الصغيرة المضيئة التي يساعد غبارها السحري ويندي وأخويها على الطيران إلى "نيفرلاند"؟', 'تينكر بيل (يُقبل: تينك)'),

  ('Cartoons & Childhood', 500, 'Which singer and composer, who died in 1966, recorded the classic Egyptian children''s songs "Mama Zamanha Gaya" and "Zahab El Leil"?', 'Mohamed Fawzi (accept Mohamed Fawzy)',
   'أي مطرب وملحن، رحل عام 1966، غنّى أغاني الأطفال المصرية الخالدة "ماما زمانها جاية" و"ذهب الليل"؟', 'محمد فوزي'),
  ('Cartoons & Childhood', 500, 'In "The Powerpuff Girls", sugar, spice and everything nice were mixed with which accidental extra ingredient?', 'Chemical X',
   'في كرتون "فتيات القوة" (The Powerpuff Girls)، ما المكوّن الإضافي الذي أُضيف بالخطأ إلى السكر والتوابل وكل شيء لطيف؟', 'المادة الكيميائية إكس (Chemical X)'),
  ('Cartoons & Childhood', 500, 'What breed of dog is Scooby-Doo?', 'A Great Dane',
   'ما سلالة الكلب سكوبي دو؟', 'الدنماركي الكبير (Great Dane)'),

  ('Cartoons & Childhood', 600, 'Which singer, who died in 2022, sang the famous Arabic opening song of "Grendizer"?', 'Sami Clark (accept Sammy Clark)',
   'أي مطرب، رحل عام 2022، غنّى شارة البداية العربية الشهيرة لكرتون "غرندايزر"؟', 'سامي كلارك');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, ''
  FROM cartoons_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS cartoons_seed;

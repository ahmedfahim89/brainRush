-- BrainRush: automatic top-up batch 2026-11-12
-- (question-bank-manager brief, AUTO BATCH, 2026-11-12)
--
-- Adds 13 questions to existing categories (no new category). Written to the owner's
-- standing preference of 2026-11-11: easier questions, mostly on subjects from 2000
-- onwards. IDs 1112-01 to 1112-15; 1112-07 and 1112-08 are not in this file (removed
-- by the owner, see the review doc).
--   Who Am I? 200 = 1 (Adele), 300 = 1 (Serena Williams), 400 = 1 (Malala Yousafzai),
--     500 = 1 (Jeff Bezos): music, sport, activism and business, clue style "... Who am I?"
--     The owner kept 1112-03 and 1112-10 knowingly, although they match older entries
--     in docs/question-sets/rejected-answers.md.
--   Cartoons & Childhood 300 = 1 (the Minions), 400 = 1 (Stitch, "Lilo & Stitch" 2002).
--     1112-06 replaced Toothless at the owner's request; 1112-07 (Oggy) and 1112-08
--     (fox, "Zootopia") were removed by the owner on 2026-11-12 and not replaced.
--   Landmarks picture questions: 400 = 1 (La Bombonera, 1112-13, replaces the Maracana
--     at the owner's request, img/questions/landmark-la-bombonera.jpg, CC BY-SA 4.0),
--     500 = 2 (the Beijing National Stadium, "Bird's Nest", 1112-09,
--     img/questions/landmark-beijing-national-stadium.jpg, CC0; Al Bayt Stadium,
--     1112-15, img/questions/landmark-al-bayt-stadium.jpg, CC BY-SA 4.0. Qatar has no
--     freedom of panorama for buildings: owner flag, see the review doc).
--   AI 400 = 1 (IBM Watson on "Jeopardy!", 2011)
--   Sports 200 = 1 (Camp Nou), 300 = 1 (Lusail Stadium), 500 = 1 (Stadium 974): famous
--     stadiums added at the owner's request, text only.
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc, fact-check sources and the image
-- licences: docs/question-sets/auto-2026-11-12-review.md.
--
-- Count per point value: 200 = 2, 300 = 3, 400 = 4, 500 = 4 (13).
-- Per category: Who Am I? 4, Cartoons & Childhood 2, Landmarks 3, AI 1, Sports 3.
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql,
-- sql/migrate-add-image-credit.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar, the image and image_credit columns with the
-- uq_category_question_image key, and wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar).
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-auto-2026-11-12-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy img/questions/landmark-beijing-national-stadium.jpg,
-- img/questions/landmark-la-bombonera.jpg and img/questions/landmark-al-bayt-stadium.jpg
-- with it (new file names).
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when its category or point value does not exist,
-- or when the category already has that question with that image (INSERT IGNORE +
-- the uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_12_seed;

CREATE TEMPORARY TABLE auto_2026_11_12_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  image         VARCHAR(255) NOT NULL,
  image_credit  VARCHAR(255) NOT NULL,
  wrong_1       VARCHAR(255) NOT NULL,
  wrong_2       VARCHAR(255) NOT NULL,
  wrong_1_ar    VARCHAR(255) NOT NULL,
  wrong_2_ar    VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO auto_2026_11_12_seed (category_name, points, question, answer, question_ar, answer_ar, image, image_credit, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Who Am I?', 200, 'I am a British singer. My first four albums were named after my age when I made them: "19", "21", "25" and "30". My hits include "Rolling in the Deep" and "Hello". Who am I?', 'Adele (accept Adele Adkins)',
   'أنا مغنية بريطانية. سمّيت ألبوماتي الأربعة الأولى بعمري وقت صنعها: "19" و"21" و"25" و"30". ومن أشهر أغنياتي "Rolling in the Deep" و"Hello". من أنا؟', 'أديل (يُقبل: أديل أدكينز)', '', '',
   'Amy Winehouse', 'Ellie Goulding', 'إيمي واينهاوس', 'إيلي غولدينغ'),  -- 1112-01

  ('Who Am I?', 300, 'I am an American tennis player. I won 23 Grand Slam singles titles, the last of them at the 2017 Australian Open, which I won while I was pregnant. Who am I?', 'Serena Williams (accept Serena)',
   'أنا لاعبة تنس أمريكية. فزت بـ23 لقبًا في فردي بطولات "غراند سلام" الأربع الكبرى، وكان آخرها بطولة أستراليا المفتوحة عام 2017 التي فزت بها وأنا حامل. من أنا؟', 'سيرينا ويليامز (يُقبل: سيرينا)', '', '',
   'Venus Williams', 'Maria Sharapova', 'فينوس ويليامز', 'ماريا شارابوفا'),  -- 1112-02

  ('Who Am I?', 400, 'I campaigned for girls'' right to go to school. In 2012 a gunman shot me on my school bus, but I survived, and in 2014, at 17, I shared the Nobel Peace Prize. Who am I?', 'Malala Yousafzai (accept Malala)',
   'ناضلت من أجل حق الفتيات في الذهاب إلى المدرسة. في عام 2012 أطلق مسلح النار عليّ في حافلة المدرسة لكني نجوت، وفي عام 2014، وعمري 17 عامًا، تقاسمت جائزة نوبل للسلام. من أنا؟', 'ملالا يوسفزاي (يُقبل: ملالا)', '', '',
   'Greta Thunberg', 'Nadia Murad', 'غريتا تونبرغ', 'نادية مراد'),  -- 1112-03

  ('Who Am I?', 500, 'In 1994 I started an online bookshop in the garage of my house near Seattle, and it grew into one of the world''s biggest companies. In 2021 I flew into space on a rocket built by my own company, Blue Origin. Who am I?', 'Jeff Bezos (accept Bezos)',
   'في عام 1994 بدأت متجرًا لبيع الكتب عبر الإنترنت في مرآب بيتي قرب سياتل، فكبر حتى صار من أكبر شركات العالم. وفي عام 2021 طرت إلى الفضاء على صاروخ صنعته شركتي "بلو أوريجين". من أنا؟', 'جيف بيزوس (يُقبل: بيزوس)', '', '',
   'Richard Branson', 'Jack Ma', 'ريتشارد برانسون', 'جاك ما'),  -- 1112-04

  ('Cartoons & Childhood', 300, 'In the animated film "Despicable Me" (2010), what are the small yellow helpers in goggles and blue overalls called, who chatter in a funny made-up language and go crazy for bananas?', 'The Minions (accept Minions)',
   'في فيلم الرسوم المتحركة "أنا الحقير" (Despicable Me) عام 2010، ما اسم المساعدين الصغار الصُّفر الذين يرتدون نظارات واقية وأفرولات زرقاء، ويثرثرون بلغة مضحكة مخترعة ويجنّون بالموز؟', 'المينيونز', '', '',
   'The Rabbids', 'The Oompa Loompas', 'الرابيدز', 'الأومبا لومبا'),  -- 1112-05

  ('Cartoons & Childhood', 400, 'In a 2002 Disney film, which mischievous blue alien, created as "Experiment 626", is adopted from an animal shelter as a pet dog by a little girl called Lilo?', 'Stitch',
   'في فيلم من إنتاج ديزني عام 2002، ما اسم الكائن الفضائي الأزرق المشاغب، الذي صُنع باسم "التجربة 626"، وتتبناه طفلة صغيرة اسمها ليلو من ملجأ للحيوانات على أنه كلب؟', 'ستيتش', '', '',
   'Jumba', 'Gantu', 'جامبا', 'غانتو'),  -- 1112-06

  ('Landmarks', 500, 'Which landmark is this?', 'The Beijing National Stadium (accept the Bird''s Nest, the Beijing Olympic Stadium)',
   'ما هذا المعلم؟', 'استاد بكين الوطني (يُقبل: عش الطائر، الاستاد الأولمبي في بكين)', 'img/questions/landmark-beijing-national-stadium.jpg', 'Balon Greyjoy / CC0',
   'The Allianz Arena', 'Wembley Stadium', 'أليانز أرينا', 'ملعب ويمبلي'),  -- 1112-09

  ('AI', 400, 'In 2011, which AI computer system, named after the founder of the company that built it, beat two of the greatest champions of the American TV quiz show "Jeopardy!"?', 'Watson (accept IBM Watson)',
   'في عام 2011، أي نظام حاسوبي للذكاء الاصطناعي، يحمل اسم مؤسس الشركة التي صنعته، هزم اثنين من أعظم أبطال برنامج المسابقات التلفزيوني الأمريكي "جيوباردي!"؟', 'واتسون (يُقبل: آي بي إم واتسون)', '', '',
   'Deep Blue', 'AlphaGo', 'ديب بلو', 'ألفاغو'),  -- 1112-10

  ('Sports', 200, 'What is the name of FC Barcelona''s home stadium, first opened in 1957?', 'Camp Nou (accept Spotify Camp Nou, Nou Camp)',
   'ما اسم ملعب نادي برشلونة، الذي افتُتح لأول مرة عام 1957؟', 'كامب نو (يُقبل: سبوتيفاي كامب نو)', '', '',
   'Mestalla', 'San Siro', 'ميستايا', 'سان سيرو'),  -- 1112-11

  ('Sports', 300, 'Which stadium, just north of Doha, hosted the final of the 2022 World Cup on 18 December 2022?', 'Lusail Stadium (accept Lusail, Lusail Iconic Stadium)',
   'أي ملعب، شمال الدوحة، استضاف المباراة النهائية لكأس العالم 2022 يوم 18 ديسمبر 2022؟', 'استاد لوسيل (يُقبل: لوسيل)', '', '',
   'Khalifa International Stadium', 'Education City Stadium', 'استاد خليفة الدولي', 'استاد المدينة التعليمية'),  -- 1112-12

  ('Landmarks', 400, 'Which landmark is this?', 'La Bombonera (accept Estadio Alberto J. Armando, the Boca Juniors stadium)',
   'ما هذا المعلم؟', 'لا بومبونيرا (يُقبل: ملعب ألبرتو خ. أرماندو، ملعب بوكا جونيورز)', 'img/questions/landmark-la-bombonera.jpg', 'ProtoplasmaKid / CC BY-SA 4.0',
   'El Monumental', 'Signal Iduna Park', 'ملعب مونومنتال', 'ملعب سيغنال إيدونا بارك'),  -- 1112-13

  ('Sports', 500, 'Which 2022 World Cup stadium was built partly from recycled shipping containers, so that it could be taken apart after the tournament?', 'Stadium 974 (accept 974, Ras Abu Aboud Stadium)',
   'أي ملعب من ملاعب كأس العالم 2022 بُني جزئيًّا من حاويات شحن معاد تدويرها، بحيث يمكن تفكيكه بعد البطولة؟', 'استاد 974 (يُقبل: استاد راس أبو عبود)', '', '',
   'Al Janoub Stadium', 'Ahmad bin Ali Stadium', 'استاد الجنوب', 'استاد أحمد بن علي'),  -- 1112-14
  ('Landmarks', 500, 'Which landmark is this?', 'Al Bayt Stadium (accept Al Bayt)',
   'ما هذا المعلم؟', 'استاد البيت', 'img/questions/landmark-al-bayt-stadium.jpg', 'Codas / CC BY-SA 4.0, cropped',
   'Al Thumama Stadium', 'King Fahd International Stadium', 'استاد الثمامة', 'استاد الملك فهد الدولي');  -- 1112-15

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image, image_credit,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image, s.image_credit,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM auto_2026_11_12_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS auto_2026_11_12_seed;

-- BrainRush: Egyptians, 2020s drama set (owner request 2026-10-24)
--
-- Adds 18 questions to the existing "Egyptians" category (no new category) on
-- Egyptian TV series and films released between 2020 and 2026 only, mostly
-- characters and cast ("which character does actor X play", "which actor plays
-- character Z"), plus a few story questions. Works: El Leaaba (2020), El Kebir
-- Awi season 6 (2022), El Sett (2025), Gaafar El Omda (2023), Paranormal (2020),
-- Kira & El Gin (2022), El Ekhtiyar (2020), Ashghal Shaqqa (2024), Taht El
-- Wesaya (2023), El Ekhtiyar 2 (2021), Leabet Newton (2021), Waahed Tani (2022),
-- Khally Balak Men Zizi (2021), Neamet El Afokato (2024), El Hareefa (2024) and
-- El Fetewa (2020). Popular Ramadan hits sit at the low values, supporting
-- characters and less famous works at the high values. Amir Karara (El Mansi)
-- and El Hashashin are already Egyptians answers, so they are never named.
-- Text questions only (image = ''). Every row has its Arabic question and answer
-- and 2 wrong options in English and Arabic for the "3 choices" helper. Review
-- doc and fact-check sources: docs/question-sets/egyptians-drama-2020s-review.md.
--
-- Count per point value: 100 = 3, 200 = 3, 300 = 3, 400 = 3, 500 = 3, 600 = 3 (18).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql and
-- sql/migrate-add-wrong-options.sql (or a schema that already has question_ar /
-- answer_ar, the image column with the uq_category_question_image key, and
-- wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar). Run it on whichever database is
-- selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-egyptians-drama-2020s-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when the "Egyptians" category does not exist
-- (it comes from sql/add-egyptians-questions.sql), when its point value does not
-- exist, or when the category already has that question (INSERT IGNORE + the
-- uq_category_question_image unique key, image = '' for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS egyptians_drama_2020s_seed;

CREATE TEMPORARY TABLE egyptians_drama_2020s_seed (
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

INSERT INTO egyptians_drama_2020s_seed (category_name, points, question, answer, question_ar, answer_ar, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Egyptians', 100, 'In the comedy series "El Leaaba" (The Game, 2020), what is the name of Hesham Maged''s character, the lifelong rival of the character played by Shiko?', 'Mazo',
   'في المسلسل الكوميدي "اللعبة" (2020)، ما اسم الشخصية التي يؤديها هشام ماجد، المنافس الدائم منذ الطفولة للشخصية التي يؤديها شيكو؟', 'مازو',
   'Waseem', 'Saadoun', 'وسيم', 'سعدون'),
  ('Egyptians', 100, 'In season 6 of "El Kebir Awi" (Ramadan 2022), what is the name of El Kebir''s new wife, played by Rahma Ahmed?', 'Marbouha',
   'في الجزء السادس من مسلسل "الكبير أوي" (رمضان 2022)، ما اسم الزوجة الجديدة للكبير التي أدت دورها رحمة أحمد؟', 'مربوحة',
   'Mabrouka', 'Nefisa', 'مبروكة', 'نفيسة'),
  ('Egyptians', 100, 'In "El Sett" (2025), directed by Marwan Hamed, Mona Zaki plays which legendary Egyptian singer?', 'Umm Kulthum',
   'في فيلم "الست" (2025) من إخراج مروان حامد، تجسد منى زكي شخصية أي مطربة مصرية أسطورية؟', 'أم كلثوم',
   'Layla Mourad', 'Najat El Saghira', 'ليلى مراد', 'نجاة الصغيرة'),

  ('Egyptians', 200, 'In the 2023 Ramadan series "Gaafar El Omda", Hala Sedki plays Gaafar''s sharp-tongued mother, El Hagga Wasifa. What is her famous nickname?', 'Safsaf',
   'في مسلسل رمضان "جعفر العمدة" (2023)، تؤدي هالة صدقي دور الحاجة وصيفة، والدة جعفر السليطة اللسان. ما لقبها الشهير؟', 'صفصف',
   'Sousou', 'Fifi', 'سوسو', 'فيفي'),
  ('Egyptians', 200, 'Which actor plays Dr. Refaat Ismail, a 1960s blood specialist, in "Paranormal" (Ma Wara'' El Tabia), Netflix''s first original Egyptian series (2020)?', 'Ahmed Amin',
   'أي ممثل يؤدي دور الدكتور رفعت إسماعيل، أستاذ أمراض الدم في الستينيات، في "ما وراء الطبيعة"، أول مسلسل مصري أصلي على نتفليكس (2020)؟', 'أحمد أمين',
   'Ahmed Dawood', 'Amr Youssef', 'أحمد داود', 'عمرو يوسف'),
  ('Egyptians', 200, 'In the 2022 film "Kira & El Gin", set during the 1919 revolution against British rule, which actor plays El Gin?', 'Ahmed Ezz',
   'في فيلم "كيرة والجن" (2022)، الذي تدور أحداثه خلال ثورة 1919 ضد الاحتلال البريطاني، أي ممثل يؤدي دور الجن؟', 'أحمد عز',
   'Ahmed Malek', 'Asser Yassin', 'أحمد مالك', 'آسر ياسين'),

  ('Egyptians', 300, 'In the 2020 Ramadan series "El Ekhtiyar" (The Choice), which actor plays Hesham Ashmawy, the army officer who turns terrorist?', 'Ahmed El Awady',
   'في مسلسل رمضان "الاختيار" (2020)، أي ممثل يؤدي دور هشام عشماوي، ضابط الجيش الذي تحول إلى إرهابي؟', 'أحمد العوضي',
   'Ahmed Salah Hosny', 'Eyad Nassar', 'أحمد صلاح حسني', 'إياد نصار'),
  ('Egyptians', 300, 'In the 2024 Ramadan comedy "Ashghal Shaqqa", Hesham Maged plays Hamdy, a new father of twins. What kind of doctor is Hamdy?', 'A forensic doctor (forensic medicine)',
   'في المسلسل الكوميدي "أشغال شقة" (رمضان 2024)، يؤدي هشام ماجد دور حمدي، الأب الجديد لتوأم. ما تخصص حمدي الطبي؟', 'طبيب شرعي (الطب الشرعي)',
   'A paediatrician', 'A dentist', 'طبيب أطفال', 'طبيب أسنان'),
  ('Egyptians', 300, 'In the 2023 Ramadan series "Taht El Wesaya" (Under Guardianship), Mona Zaki plays Hanan, a widow who takes over her late husband''s trade to support her children. What is the trade?', 'Fishing (she runs his fishing boat)',
   'في مسلسل رمضان "تحت الوصاية" (2023)، تؤدي منى زكي دور حنان، الأرملة التي تتولى مهنة زوجها الراحل لتعول أطفالها. ما هذه المهنة؟', 'الصيد (تدير مركب الصيد الخاص به)',
   'Carpentry', 'Butchery', 'النجارة', 'الجزارة'),

  ('Egyptians', 400, 'In "El Ekhtiyar 2" (Ramadan 2021), which actor plays Zakaria Younes, the National Security officer?', 'Karim Abdel Aziz',
   'في مسلسل "الاختيار 2" (رمضان 2021)، أي ممثل يؤدي دور زكريا يونس، ضابط الأمن الوطني؟', 'كريم عبد العزيز',
   'Ahmed Mekky', 'Yasser Galal', 'أحمد مكي', 'ياسر جلال'),
  ('Egyptians', 400, 'In the 2021 Ramadan series "Leabet Newton" (Newton''s Cradle), Mona Zaki plays Hana. What is the name of her husband, played by Mohamed Mamdouh?', 'Hazem',
   'في مسلسل رمضان "لعبة نيوتن" (2021)، تؤدي منى زكي دور "هنا". ما اسم زوجها الذي يؤدي دوره محمد ممدوح؟', 'حازم',
   'Badr', 'Wael', 'بدر', 'وائل'),
  ('Egyptians', 400, 'In Ahmed Helmy''s 2022 comedy "Waahed Tani" (Another One), where does his character Mustafa work as a social worker?', 'In a prison (the Prison Authority)',
   'في فيلم أحمد حلمي الكوميدي "واحد تاني" (2022)، أين تعمل شخصيته مصطفى كأخصائي اجتماعي؟', 'في السجن (مصلحة السجون)',
   'In a hospital', 'In a school', 'في مستشفى', 'في مدرسة'),

  ('Egyptians', 500, 'In the 2021 Ramadan series "Khally Balak Men Zizi" (Watch Out for Zizi), what is Zizi''s real first name?', 'Zeinab',
   'في مسلسل رمضان "خلي بالك من زيزي" (2021)، ما الاسم الحقيقي لزيزي؟', 'زينب',
   'Aziza', 'Zahra', 'عزيزة', 'زهرة'),
  ('Egyptians', 500, 'In the 2024 Ramadan series "Neamet El Afokato", which actor plays Salah, the husband who betrays Neama, played by Mai Omar?', 'Ahmed Zaher',
   'في مسلسل رمضان "نعمة الأفوكاتو" (2024)، أي ممثل يؤدي دور صلاح، الزوج الذي يخون نعمة التي تؤدي دورها مي عمر؟', 'أحمد زاهر',
   'Emad Ziada', 'Ahmed Salah Hosny', 'عماد زيادة', 'أحمد صلاح حسني'),
  ('Egyptians', 500, 'In the 2024 football film "El Hareefa", which actor plays Majed, the gifted player forced to move from a private school to a public one?', 'Nour El Nabawy',
   'في فيلم كرة القدم "الحريفة" (2024)، أي ممثل يؤدي دور ماجد، اللاعب الموهوب الذي يُجبر على الانتقال من مدرسة خاصة إلى مدرسة حكومية؟', 'نور النبوي',
   'Ahmed Ghazi', 'Ahmed Malek', 'أحمد غزي', 'أحمد مالك'),

  ('Egyptians', 600, 'In the series "El Leaaba" (The Game, 2020), which actor plays Mr. Basiouny, the husband of Shwikar?', 'Samy Maghawry',
   'في مسلسل "اللعبة" (2020)، أي ممثل يؤدي دور مستر بسيوني، زوج شويكار؟', 'سامي مغاوري',
   'Bayoumi Fouad', 'Mohamed Tharwat', 'بيومي فؤاد', 'محمد ثروت'),
  ('Egyptians', 600, 'In the 2020 Ramadan series "El Fetewa" (The Ruffian), set in old Cairo''s El Gamaleya, what is the family name of Hassan, the hero played by Yasser Galal?', 'El Gabaly (Hassan Ahmed El Gabaly)',
   'في مسلسل رمضان "الفتوة" (2020)، الذي تدور أحداثه في حي الجمالية بالقاهرة القديمة، ما اسم عائلة حسن، البطل الذي يؤدي دوره ياسر جلال؟', 'الجبالي (حسن أحمد الجبالي)',
   'Abu Shedid', 'El Naggar', 'أبو شديد', 'النجار'),
  ('Egyptians', 600, 'In the 2022 film "Kira & El Gin", "El Gin" (the jinn) is the nickname of one of the two heroes. What is his first name?', 'Abdel Qader (Abdel Qader Shehata El Gin)',
   'في فيلم "كيرة والجن" (2022)، "الجن" هو لقب أحد البطلين. ما اسمه الأول؟', 'عبد القادر (عبد القادر شحاتة الجن)',
   'Ahmed', 'Abdel Hamid', 'أحمد', 'عبد الحميد');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, '',
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM egyptians_drama_2020s_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS egyptians_drama_2020s_seed;

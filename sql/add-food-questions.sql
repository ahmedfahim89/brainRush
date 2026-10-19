-- BrainRush: Food & Drink question set (owner request 2026-10-19)
--
-- Adds a new "Food & Drink" category with 22 questions: 5 at 100, 4 at 200,
-- 4 at 300, 3 at 400, 3 at 500 and 3 at 600. After review the owner removed
-- the sandwich, goulash, mate, Andes, ceviche, umami, mace and injera
-- questions and swapped ciabatta for focaccia. The set mixes Egyptian dishes
-- and food history (koshari, ful medames, karkadeh, Om Ali, fesikh, dukkah and the
-- Fatimid ban on molokhia) with world dishes, drinks, breads and cheeses, spices
-- and food history, with several sub-topics at every point value. Every row
-- comes with its Arabic question and answer. The fact-check log is in
-- docs/question-sets/food-review.md.
--
-- Requires sql/migrate-add-arabic.sql (or a schema that already has question_ar /
-- answer_ar). Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-food-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. The Food & Drink category is created only if it does
-- not exist. A row is skipped when its category was renamed or deleted, when its
-- point value does not exist, or when the category already has that question
-- (INSERT IGNORE + uq_category_question).

SET NAMES utf8mb4;

INSERT IGNORE INTO categories (name) VALUES ('Food & Drink');

DROP TEMPORARY TABLE IF EXISTS food_seed;

CREATE TEMPORARY TABLE food_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO food_seed (category_name, points, question, answer, question_ar, answer_ar) VALUES
  ('Food & Drink', 100, 'Which popular Egyptian street dish mixes rice, macaroni and chickpeas, topped with spicy tomato sauce and crispy fried onions?', 'Koshari (accept koshary, kushari)',
   'أي أكلة شعبية مصرية تجمع الأرز والمكرونة والحمص، وتُغطّى بصلصة الطماطم الحارة والبصل المقلي المقرمش؟', 'الكشري'),
  ('Food & Drink', 100, 'What is the name of Egypt''s classic breakfast dish of slow-cooked fava beans, usually eaten with oil, cumin and baladi bread?', 'Ful medames (accept ful, foul)',
   'ما اسم طبق الإفطار المصري الكلاسيكي من البقول المطهوة على نار هادئة طوال الليل في "القِدرة"، ويُؤكل عادةً بالزيت والكمون والعيش البلدي؟', 'الفول المدمس (يُقبل: الفول)'),
  ('Food & Drink', 100, 'Which Italian dish is a flat round of dough baked with tomato and cheese on top, with the Margherita as its classic version?', 'Pizza',
   'أي طبق إيطالي عبارة عن عجينة مستديرة مسطحة تُخبز وفوقها الطماطم والجبن، ونسخته الكلاسيكية هي "مارجريتا"؟', 'البيتزا'),
  ('Food & Drink', 100, 'Which fizzy drink was invented in 1886 by John Pemberton, a pharmacist in Atlanta?', 'Coca-Cola (accept Coke)',
   'أي مشروب غازي اخترعه الصيدلي جون بيمبرتون في مدينة أتلانتا الأمريكية عام 1886؟', 'كوكاكولا (يُقبل: كوكا)'),
  ('Food & Drink', 100, 'What is the name of the long, thin French loaf with a crisp golden crust?', 'Baguette',
   'ما اسم الخبز الفرنسي الطويل الرفيع ذي القشرة الذهبية المقرمشة؟', 'الباجيت'),

  ('Food & Drink', 200, 'Which deep-red drink, served hot or iced across Egypt, is made from the dried red flowers of the roselle, a kind of hibiscus?', 'Karkadeh (accept karkade, hibiscus tea)',
   'أي مشروب أحمر داكن يُشرب ساخنًا أو مثلجًا في كل أنحاء مصر، ويُصنع من الأزهار الحمراء المجففة لنبات الروزيلا، أحد أنواع الهيبسكس؟', 'الكركديه'),
  ('Food & Drink', 200, 'Which dish is made of vinegared rice with raw fish or other toppings, often rolled in a sheet of seaweed?', 'Sushi (accept maki)',
   'أي طبق يتكون من أرز متبّل بالخل مع السمك النيء أو إضافات أخرى، وكثيرًا ما يُلف في ورقة من الطحالب البحرية؟', 'السوشي (يُقبل: ماكي)'),
  ('Food & Drink', 200, 'Which flaky, buttery pastry has a name that is the French word for "crescent"?', 'Croissant',
   'أي معجنات هشة بالزبدة اسمها هو الكلمة الفرنسية التي تعني "الهلال"؟', 'الكرواسون'),
  ('Food & Drink', 200, 'Which bright yellow spice, ground from the underground stem of a plant in the ginger family, gives many curries their golden colour?', 'Turmeric (accept kurkum)',
   'أي توابل صفراء زاهية تُطحن من الساق الأرضية لنبات من فصيلة الزنجبيل، وتمنح كثيرًا من أطباق الكاري لونها الذهبي؟', 'الكركم'),

  ('Food & Drink', 300, 'Which Egyptian dessert, often called Egyptian bread pudding, is made of pastry baked in sweet hot milk with nuts and raisins?', 'Om Ali (accept Umm Ali)',
   'أي حلوى مصرية، يسمّيها البعض "بودنج الخبز المصري"، تُصنع من الرقاق أو العجين المخبوز في الحليب الساخن المُحلّى مع المكسرات والزبيب؟', 'أم علي'),
  ('Food & Drink', 300, 'Which Italian dessert of coffee-soaked ladyfingers and mascarpone cream has a name meaning "pick me up"?', 'Tiramisu',
   'أي حلوى إيطالية من بسكويت الأصابع المنقوع في القهوة وكريمة الماسكاربوني، يعني اسمها حرفيًا "ارفعني" أي "انعشني"؟', 'التيراميسو'),
  ('Food & Drink', 300, 'Which costly red spice is made from the dried stigmas of a crocus flower, picked by hand?', 'Saffron',
   'أي توابل حمراء غالية الثمن تُصنع من المياسم المجففة لزهرة الكروكوس، وتُقطف يدويًا؟', 'الزعفران'),
  ('Food & Drink', 300, 'Bubble tea, the sweet drink with chewy tapioca pearls, was created in the 1980s in which place?', 'Taiwan',
   'في أي مكان ابتُكر "البابل تي"، المشروب الحلو بكرات التابيوكا المطاطية، في ثمانينيات القرن العشرين؟', 'تايوان'),

  ('Food & Drink', 400, 'Which salted and fermented grey mullet do Egyptians traditionally eat on the spring holiday of Sham El Nessim?', 'Fesikh (accept feseekh)',
   'ما اسم سمك البوري المملح المخمّر الذي يأكله المصريون تقليديًا في عيد شم النسيم؟', 'الفسيخ'),
  ('Food & Drink', 400, 'Which salty cheese from Cyprus is firm enough to be grilled or fried without melting?', 'Halloumi (accept hellim)',
   'أي جبنة مالحة من قبرص متماسكة بما يكفي لتُشوى أو تُقلى دون أن تذوب؟', 'الحلوم (الحلومي)'),
  ('Food & Drink', 400, 'Which popular flavouring comes from the cured seed pods of a tropical climbing orchid?', 'Vanilla',
   'أي نكهة شهيرة تُستخرج من القرون المعالَجة لنبات أوركيد استوائي متسلق؟', 'الفانيليا'),

  ('Food & Drink', 500, 'Which Egyptian dry mix of coarsely ground nuts or seeds with spices like coriander and cumin is eaten as a dip for bread?', 'Dukkah (accept do''a, duqqa)',
   'أي خلطة مصرية جافة من المكسرات أو البذور المطحونة خشنًا مع توابل مثل الكزبرة والكمون، تُغمس فيها قطع العيش؟', 'الدُّقة'),
  ('Food & Drink', 500, 'The word "mocha" comes from Mokha, a historic coffee-exporting port in which country?', 'Yemen',
   'كلمة "موكا" مأخوذة من "المخا"، الميناء التاريخي لتصدير البن. في أي دولة يقع هذا الميناء؟', 'اليمن'),
  ('Food & Drink', 500, 'Which flat Italian bread, often topped with olive oil and herbs, takes its name from the Latin word for "hearth"?', 'Focaccia',
   'أي خبز إيطالي مسطح، يُغطّى عادةً بزيت الزيتون والأعشاب، يأتي اسمه من الكلمة اللاتينية التي تعني "الموقد"؟', 'الفوكاتشا'),

  ('Food & Drink', 600, 'Which Fatimid caliph of Egypt banned the eating of molokhia in the early 11th century, along with other foods?', 'Al-Hakim bi-Amr Allah (accept al-Hakim)',
   'أي خليفة فاطمي حكم مصر منع أكل الملوخية في أوائل القرن الحادي عشر الميلادي، ضمن أطعمة أخرى؟', 'الحاكم بأمر الله'),
  ('Food & Drink', 600, 'The Caesar salad is named after the restaurant owner Caesar Cardini. In which Mexican city was it created, in the 1920s?', 'Tijuana',
   'سلطة السيزر تحمل اسم صاحب المطعم سيزر كارديني. في أي مدينة مكسيكية ابتُكرت في عشرينيات القرن العشرين؟', 'تيخوانا'),
  ('Food & Drink', 600, 'Earl Grey tea is flavoured with the oil of which citrus fruit?', 'Bergamot (accept bergamot orange)',
   'شاي "إيرل جراي" مُنكّه بزيت أي ثمرة حمضية؟', 'البرغموت');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar
  FROM food_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS food_seed;

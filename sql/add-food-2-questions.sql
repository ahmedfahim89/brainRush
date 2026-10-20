-- BrainRush: Food & Drink question set 2 (owner request 2026-10-20)
--
-- Adds 15 questions to the existing "Food & Drink" category: 100 x5, 200 x4,
-- 300 x2, 400 x1, 500 x2, 600 x1. Drafted as 30 (5 per value); the owner then
-- removed 15 (pad thai, kimchi, matcha, almond/marzipan, pho, horchata, ricotta,
-- cloves, bouillabaisse, oolong, panettone, mole, kopi luwak, Stilton, Maillard
-- reaction) and they were not replaced. Egyptian items: ta'meya, basbousa, sugar
-- cane juice, sahlab, fattah, freekeh and the Epiphany taro. None of the topics
-- the owner removed from the first set (sandwich, goulash, mate, Andes, ceviche,
-- umami, mace, injera, ciabatta) is used. Every row comes with its Arabic
-- question and answer. Review doc and fact-check sources:
-- docs/question-sets/food-2-review.md.
--
-- Requires sql/migrate-add-arabic.sql (or a schema that already has question_ar /
-- answer_ar). Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-food-2-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. No category is created: a row is skipped when the
-- Food & Drink category was renamed or deleted, when its point value does not
-- exist, or when the category already has that question (INSERT IGNORE +
-- uq_category_question).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS food2_seed;

CREATE TEMPORARY TABLE food2_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO food2_seed (category_name, points, question, answer, question_ar, answer_ar) VALUES
  ('Food & Drink', 100, 'Which deep-fried green patties, made in Egypt from crushed fava beans and fresh herbs, are a breakfast favourite tucked into baladi bread?', 'Ta''meya (accept taameya, falafel)',
   'ما اسم الأقراص الخضراء المقلية في الزيت، التي تُصنع في مصر من الفول المجروش والخضرة الطازجة، وتُؤكل في الإفطار داخل العيش البلدي؟', 'الطعمية (يُقبل: الفلافل)'),
  ('Food & Drink', 100, 'Which dish of minced beef, shaped into a flat patty and served in a bun, takes its name from a German port city?', 'Hamburger (accept burger)',
   'أي طبق من اللحم البقري المفروم، يُشكَّل على هيئة قرص مسطح ويُقدَّم داخل خبزة مستديرة، يأخذ اسمه من مدينة ميناء ألمانية؟', 'الهامبرجر (يُقبل: البرجر)'),
  ('Food & Drink', 100, 'Which strong coffee is made by forcing very hot water at high pressure through finely ground beans, and is served in small "shots"?', 'Espresso',
   'أي قهوة قوية تُحضَّر بدفع ماء شديد السخونة تحت ضغط عالٍ عبر البن المطحون ناعمًا، وتُقدَّم في جرعات صغيرة تُسمى "شوت"؟', 'الإسبريسو'),
  ('Food & Drink', 100, 'Which snack is made by heating dried corn kernels until the moisture inside turns to steam and they burst into white, fluffy puffs?', 'Popcorn',
   'أي وجبة خفيفة تُصنع بتسخين حبات الذرة المجففة حتى تتحول الرطوبة داخلها إلى بخار، فتنفجر وتصبح منفوشة بيضاء هشة؟', 'الفشار'),
  ('Food & Drink', 100, 'Which creamy dip is made of cooked, mashed chickpeas blended with tahini, lemon juice and garlic?', 'Hummus (accept hummus bi tahini)',
   'أي غموس كريمي شهير في الشرق الأوسط يُصنع من حبوب مسلوقة مهروسة تُخلط مع الطحينة وعصير الليمون والثوم؟', 'الحمص بالطحينة (يُقبل: الحمص)'),

  ('Food & Drink', 200, 'Which Egyptian cake is made of semolina, baked, then soaked in sweet syrup and cut into diamonds or squares?', 'Basbousa (accept harissa, namoura)',
   'أي حلوى مصرية تُصنع من السميد، تُخبز ثم تُسقى بالشربات وتُقطَّع على شكل معيّنات أو مربعات؟', 'البسبوسة (يُقبل: الهريسة، النمّورة)'),
  ('Food & Drink', 200, 'Which tall, sweet grass is fed through presses in juice shops all over Egypt to make one of the country''s most popular drinks?', 'Sugar cane (accept sugarcane)',
   'أي نبات طويل حلو المذاق يُعصر بالمكابس في محلات العصير في كل أنحاء مصر ليُصنع منه أحد أشهر المشروبات في البلد؟', 'قصب السكر'),
  ('Food & Drink', 200, 'Which salty white cheese, cured in brine and often crumbled over a Greek salad, is made mainly from sheep''s milk?', 'Feta',
   'أي جبنة بيضاء مالحة تُحفظ في الماء المملح، وكثيرًا ما تُفتَّت فوق السلطة اليونانية، وتُصنع أساسًا من حليب الغنم؟', 'جبنة الفيتا'),
  ('Food & Drink', 200, 'Which sweet, warm spice is the dried inner bark of a tropical tree, sold ground or rolled into sticks called quills?', 'Cinnamon (accept cassia)',
   'أي توابل دافئة ذات رائحة حلوة هي اللحاء الداخلي المجفف لشجرة استوائية، وتُباع مطحونة أو ملفوفة على شكل أعواد؟', 'القرفة (يُقبل: الكاسيا)'),

  ('Food & Drink', 300, 'Which thick, hot milky drink, traditionally thickened with flour made from orchid tubers, is a winter favourite in Egypt, topped with nuts and raisins?', 'Sahlab (accept salep)',
   'أي مشروب ساخن كثيف من الحليب، يُكثَّف تقليديًا بدقيق مصنوع من درنات نبات الأوركيد، ويُعد من مشروبات الشتاء المفضلة في مصر، ويُزيَّن بالمكسرات والزبيب؟', 'السحلب'),
  ('Food & Drink', 300, 'Which rich custard dessert is topped with a thin, hard layer of caramelised sugar, and has a name meaning "burnt cream"?', 'Creme brulee (accept burnt cream)',
   'أي حلوى غنية من الكاسترد تعلوها طبقة رقيقة صلبة من السكر المكرمل، ويعني اسمها "الكريمة المحروقة"؟', 'كريم بروليه'),

  ('Food & Drink', 400, 'Which Egyptian festive dish layers crisp bread and rice with meat and a garlic and vinegar sauce, and is traditionally eaten at Eid al-Adha?', 'Fattah (accept fatta, fatteh)',
   'أي طبق مصري احتفالي يتكوّن من طبقات من العيش المحمَّص والأرز مع اللحم وصلصة الثوم والخل، ويُؤكل تقليديًا في عيد الأضحى؟', 'الفتة'),

  ('Food & Drink', 500, 'What is the name of young green wheat that is roasted over fire, rubbed and often cracked, and is used in Egypt as a stuffing for pigeons?', 'Freekeh (accept frik, farik)',
   'ما اسم القمح الأخضر الصغير الذي يُشوى على النار ثم تُنزع قشوره ويُجرش غالبًا، ويُستخدم في مصر حشوةً للحمام؟', 'الفريك'),
  ('Food & Drink', 500, 'What is the name of the scale, devised by a pharmacist in 1912, that measures how hot chilli peppers are?', 'The Scoville scale (accept Scoville heat units, SHU)',
   'ما اسم المقياس الذي وضعه صيدلي عام 1912 لقياس مدى حرارة (حرّاقية) الفلفل الحار؟', 'مقياس سكوفيل'),

  ('Food & Drink', 600, 'Which starchy root vegetable do Egyptian Copts traditionally eat at the feast of the Epiphany (Eid El Ghitas), cooked in a green sauce of chard and coriander?', 'Taro (accept qolqas, colocasia)',
   'أي خضار جذري نشوي يأكله الأقباط في مصر تقليديًا في عيد الغطاس، مطبوخًا في صلصة خضراء من السلق والكزبرة؟', 'القلقاس');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar
  FROM food2_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS food2_seed;

-- BrainRush: Sports football transfers question set (owner request 2026-10-29)
--
-- Adds 18 questions to the existing "Sports" category (no new category), all about
-- footballers' club moves: "which club did X join after Y", "which club did X retire
-- at", "which club did X join in <year>". Only completed, permanent moves and official,
-- final retirements, each with a year in the question. A mix of Egyptian players
-- (Aboutrika, Hossam Hassan, Elneny, Salah, Trezeguet, Mido, Hazem Emam, Ahmed Hassan)
-- and world stars (Cristiano Ronaldo, Neymar, Maradona, Suarez, Rooney, Eto'o, Xavi,
-- Ronaldo Nazario, Henry, Iniesta). Every answer is a different club. Uses 2 of the
-- owner's 3 examples (Ronaldo to Juventus, Aboutrika to Al Ahly) as given and the
-- Rooney/Derby County example reworded with its year.
-- Every row has its Arabic question and answer and 2 wrong options in English and
-- Arabic for the "3 choices" helper. Review doc and fact-check sources:
-- docs/question-sets/sports-football-transfers-review.md.
--
-- Count per point value: 100 = 3, 200 = 3, 300 = 3, 400 = 3, 500 = 3, 600 = 3 (18).
--
-- Requires sql/migrate-add-arabic.sql and sql/migrate-add-wrong-options.sql (or a schema
-- that already has question_ar / answer_ar and wrong_1 / wrong_2 / wrong_1_ar /
-- wrong_2_ar). Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-sports-football-transfers-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. Nothing is created, updated or deleted except new question
-- rows. A row is skipped when its category or point value does not exist, or when the
-- Sports category already has that question (INSERT IGNORE + the unique key on
-- category, question and image, image = '' for these text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS sports_football_transfers_seed;

CREATE TEMPORARY TABLE sports_football_transfers_seed (
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

INSERT INTO sports_football_transfers_seed (category_name, points, question, answer, question_ar, answer_ar, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Sports', 100, 'Which club did Cristiano Ronaldo join in 2018, after nine seasons at Real Madrid?', 'Juventus (accept Juve)',
   'أي نادٍ انضم إليه كريستيانو رونالدو عام 2018 بعد تسعة مواسم مع ريال مدريد؟', 'يوفنتوس (يُقبل: اليوفي)',
   'AC Milan', 'Bayern Munich', 'ميلان', 'بايرن ميونخ'),
  ('Sports', 100, 'Which club did Mohamed Aboutrika join in January 2004, after leaving Tersana?', 'Al Ahly',
   'أي نادٍ انضم إليه محمد أبوتريكة في يناير 2004 بعد رحيله عن الترسانة؟', 'الأهلي',
   'Zamalek', 'Ismaily', 'الزمالك', 'الإسماعيلي'),
  ('Sports', 100, 'Which club did Neymar join from Barcelona in 2017, for a then world-record fee of 222 million euros?', 'Paris Saint-Germain (accept PSG)',
   'أي نادٍ انضم إليه نيمار قادمًا من برشلونة عام 2017 مقابل 222 مليون يورو، وهو رقم قياسي عالمي وقتها؟', 'باريس سان جيرمان (يُقبل: بي إس جي)',
   'Manchester United', 'Real Madrid', 'مانشستر يونايتد', 'ريال مدريد'),

  ('Sports', 200, 'In the summer of 2000, Egypt striker Hossam Hassan and his twin brother Ibrahim made a shock move to which Egyptian club?', 'Zamalek',
   'في صيف عام 2000، فجّر مهاجم منتخب مصر حسام حسن وتوأمه إبراهيم مفاجأة كبيرة بانتقالهما إلى أي نادٍ مصري؟', 'الزمالك',
   'Ismaily', 'El Mokawloon', 'الإسماعيلي', 'المقاولون العرب'),
  ('Sports', 200, 'Which Italian club did Diego Maradona join from Barcelona in 1984?', 'Napoli (accept SSC Napoli)',
   'أي نادٍ إيطالي انضم إليه دييغو مارادونا قادمًا من برشلونة عام 1984؟', 'نابولي',
   'AS Roma', 'Fiorentina', 'روما', 'فيورنتينا'),
  ('Sports', 200, 'Which London club did Egyptian midfielder Mohamed Elneny join in January 2016?', 'Arsenal',
   'أي نادٍ لندني انضم إليه لاعب الوسط المصري محمد النني في يناير 2016؟', 'آرسنال',
   'Chelsea', 'Tottenham', 'تشيلسي', 'توتنهام'),

  ('Sports', 300, 'Which Swiss club signed Mohamed Salah from El Mokawloon (Arab Contractors) in 2012?', 'FC Basel (accept Basel)',
   'أي نادٍ سويسري تعاقد مع محمد صلاح قادمًا من المقاولون العرب عام 2012؟', 'بازل (يُقبل: إف سي بازل)',
   'FC Zurich', 'Young Boys', 'زيورخ', 'يونغ بويز'),
  ('Sports', 300, 'Which club did Uruguayan striker Luis Suarez join in September 2020, after Barcelona let him go?', 'Atletico Madrid (accept Atleti)',
   'أي نادٍ انضم إليه المهاجم الأوروغوياني لويس سواريز في سبتمبر 2020 بعدما استغنى عنه برشلونة؟', 'أتلتيكو مدريد',
   'Juventus', 'Sevilla', 'يوفنتوس', 'إشبيلية'),
  ('Sports', 300, 'Which English club did Egyptian winger Trezeguet join from the Turkish club Kasimpasa in 2019?', 'Aston Villa (accept Villa)',
   'أي نادٍ إنجليزي انضم إليه الجناح المصري تريزيجيه قادمًا من نادي قاسم باشا التركي عام 2019؟', 'أستون فيلا',
   'West Ham United', 'Newcastle United', 'وست هام يونايتد', 'نيوكاسل يونايتد'),

  ('Sports', 400, 'At which club did Wayne Rooney end his playing career, retiring in January 2021 to become its manager?', 'Derby County (accept Derby)',
   'في أي نادٍ أنهى واين روني مسيرته كلاعب، حين اعتزل في يناير 2021 ليصبح مدربًا للفريق؟', 'ديربي كاونتي (يُقبل: ديربي)',
   'DC United', 'Everton', 'دي سي يونايتد', 'إيفرتون'),
  ('Sports', 400, 'In 2009, Samuel Eto''o left Barcelona in a swap deal that took Zlatan Ibrahimovic the other way. Which club did Eto''o join?', 'Inter Milan (accept Inter, Internazionale)',
   'عام 2009 غادر صامويل إيتو برشلونة في صفقة تبادلية انتقل فيها زلاتان إبراهيموفيتش في الاتجاه المعاكس. إلى أي نادٍ انضم إيتو؟', 'إنتر ميلان (يُقبل: الإنتر)',
   'Manchester City', 'AC Milan', 'مانشستر سيتي', 'ميلان'),
  ('Sports', 400, 'Which club did Spanish midfielder Xavi Hernandez join after leaving Barcelona in 2015?', 'Al Sadd',
   'أي نادٍ انضم إليه لاعب الوسط الإسباني تشافي هيرنانديز بعد رحيله عن برشلونة عام 2015؟', 'السد',
   'Al Rayyan', 'New York City FC', 'الريان', 'نيويورك سيتي'),

  ('Sports', 500, 'Which Belgian club did Egyptian striker Mido join in 2000, at the age of 17, to start his career in Europe?', 'Gent (accept KAA Gent)',
   'أي نادٍ بلجيكي انضم إليه المهاجم المصري ميدو عام 2000 وهو في السابعة عشرة، لتبدأ مسيرته في أوروبا؟', 'جينت',
   'Club Brugge', 'Standard Liege', 'كلوب بروج', 'ستاندار لييج'),
  ('Sports', 500, 'Which European club did the Brazilian striker Ronaldo Nazario join from Cruzeiro in 1994?', 'PSV Eindhoven (accept PSV)',
   'أي نادٍ أوروبي انضم إليه المهاجم البرازيلي رونالدو نازاريو قادمًا من كروزيرو عام 1994؟', 'بي إس في آيندهوفن (يُقبل: آيندهوفن)',
   'Feyenoord', 'Benfica', 'فينورد', 'بنفيكا'),
  ('Sports', 500, 'Which club did Thierry Henry play for last, before he retired in December 2014?', 'New York Red Bulls (accept the Red Bulls)',
   'لأي نادٍ لعب تييري هنري في آخر محطة بمسيرته، قبل أن يعتزل في ديسمبر 2014؟', 'نيويورك ريد بولز',
   'LA Galaxy', 'New York City FC', 'لوس أنجلوس غالاكسي', 'نيويورك سيتي'),

  ('Sports', 600, 'Which Italian club did Egyptian midfielder Hazem Emam join in 1996?', 'Udinese',
   'أي نادٍ إيطالي انضم إليه لاعب الوسط المصري حازم إمام عام 1996؟', 'أودينيزي',
   'Parma', 'Lazio', 'بارما', 'لاتسيو'),
  ('Sports', 600, 'Which club did Egyptian midfielder Ahmed Hassan join on a free transfer from Besiktas in 2006?', 'Anderlecht (accept RSC Anderlecht)',
   'أي نادٍ انضم إليه لاعب الوسط المصري أحمد حسن في صفقة انتقال حر من بشكتاش عام 2006؟', 'أندرلخت',
   'Galatasaray', 'Club Brugge', 'غلطة سراي', 'كلوب بروج'),
  ('Sports', 600, 'Which Japanese club did Spanish midfielder Andres Iniesta join in 2018, after 22 years at Barcelona?', 'Vissel Kobe (accept Kobe)',
   'أي نادٍ ياباني انضم إليه لاعب الوسط الإسباني أندريس إنييستا عام 2018 بعد 22 عامًا في برشلونة؟', 'فيسل كوبي (يُقبل: كوبي)',
   'Sagan Tosu', 'Urawa Red Diamonds', 'ساغان توسو', 'أوراوا ريد دايموندز');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar,
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM sports_football_transfers_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS sports_football_transfers_seed;

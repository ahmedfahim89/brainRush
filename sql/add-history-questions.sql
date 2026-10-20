-- BrainRush: History questions (owner request 2026-10-20)
--
-- Adds 9 questions to the existing "History" category: 2 at 300, 5 at 400,
-- 1 at 500 and 1 at 600. Drafted as 14; the owner removed 5 (Marco Polo,
-- Hammurabi, the Romanovs, the Minoans, Justinian) and they were not replaced.
-- The difficulty of each value matches the existing History questions at that
-- value in the local DB. The set covers ancient (Sparta, Hannibal), medieval
-- (Al-Azhar, Harun al-Rashid, Amr ibn al-As) and modern (Nixon, 1952, Poland,
-- Ahmed Urabi) history, with 6 of the 9 from Egypt and the Arab world. No
-- answer repeats an answer in the bank, no answer is named in an existing
-- question, and no question names an existing answer (for example, the Nixon
-- question does not name the United States). Every row comes with its Arabic question and
-- answer. Review doc and fact-check sources: docs/question-sets/history-review.md.
--
-- Requires sql/migrate-add-arabic.sql (or a schema that already has question_ar /
-- answer_ar). Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-history-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. No category is created: a row is skipped when the
-- History category was renamed or deleted, when its point value does not
-- exist, or when the category already has that question (INSERT IGNORE +
-- uq_category_question).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS history_seed;

CREATE TEMPORARY TABLE history_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO history_seed (category_name, points, question, answer, question_ar, answer_ar) VALUES
  -- 300
  ('History', 300, 'Which mosque in Egypt, founded in the 10th century, grew into one of the oldest universities in the world and a leading centre of Sunni Islamic learning?', 'Al-Azhar (accept Al-Azhar Mosque, Al-Azhar University)',
   'أي مسجد في مصر، تأسس في القرن العاشر الميلادي، تحوّل إلى واحدة من أقدم الجامعات في العالم ومنارة كبرى للعلوم الإسلامية السنية؟', 'الجامع الأزهر (جامعة الأزهر)'),
  ('History', 300, 'Which president resigned in 1974 because of the Watergate scandal?', 'Richard Nixon',
   'أي رئيس استقال من منصبه عام 1974 بسبب فضيحة "ووترغيت"؟', 'ريتشارد نيكسون'),
  -- 400
  ('History', 400, 'Which Greek city-state sent its King Leonidas with 300 of its soldiers to hold the pass of Thermopylae against the Persians in 480 BC?', 'Sparta (accept the Spartans)',
   'أي دولة مدينة إغريقية أرسلت ملكها ليونيداس ومعه 300 من جنودها للدفاع عن ممر ثيرموبيلاي في وجه الفرس عام 480 قبل الميلاد؟', 'إسبرطة'),
  ('History', 400, 'Which general from Carthage, in what is now Tunisia, crossed the Alps with war elephants in 218 BC to invade Italy?', 'Hannibal (accept Hannibal Barca)',
   'أي قائد من قرطاج، في تونس حاليًا، عبر جبال الألب مع فيلة الحرب عام 218 قبل الميلاد لغزو إيطاليا؟', 'هانيبال (حنبعل)'),
  ('History', 400, 'Which Abbasid caliph, who ruled from 786 to 809, appears in many tales of the "One Thousand and One Nights"?', 'Harun al-Rashid (accept Haroun al-Rashid)',
   'أي خليفة عباسي، حكم من عام 786 إلى عام 809 ميلادية، يظهر في كثير من حكايات "ألف ليلة وليلة"؟', 'هارون الرشيد'),
  ('History', 400, 'In which year did the Free Officers seize power in Egypt and force the king to give up his throne?', '1952',
   'في أي عام استولى الضباط الأحرار على السلطة في مصر وأجبروا الملك على التنازل عن العرش؟', '1952'),
  ('History', 400, 'On 1 September 1939, Germany started World War II in Europe by invading which country?', 'Poland',
   'في 1 سبتمبر 1939، بدأت ألمانيا الحرب العالمية الثانية في أوروبا بغزو أي دولة؟', 'بولندا'),
  -- 500
  ('History', 500, 'Which Arab commander led the Muslim conquest of Egypt from 639 and founded the city of Fustat?', 'Amr ibn al-As (accept Amr ibn al-Aas)',
   'أي قائد عربي قاد الفتح الإسلامي لمصر بدءًا من عام 639 ميلادية، وأسس مدينة الفسطاط؟', 'عمرو بن العاص'),
  -- 600
  ('History', 600, 'Which Egyptian army officer confronted Khedive Tawfiq at Abdeen Palace in 1881 and led the nationalist revolt that bears his name?', 'Ahmed Urabi (accept Orabi, Arabi Pasha)',
   'أي ضابط مصري واجه الخديوي توفيق أمام قصر عابدين عام 1881، وقاد الثورة الوطنية التي تحمل اسمه؟', 'أحمد عرابي');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar
  FROM history_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS history_seed;

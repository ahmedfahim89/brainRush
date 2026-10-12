-- BrainRush: more Egypt questions for the 600 row (FU-14, owner request 2026-10-12)
--
-- Adds 13 Egypt-themed 600 questions so each seed category has 4 at 600 and the
-- 600 row is drawn at random like the others: 3 for Science, 2 for every other
-- category. Import sql/add-egypt-questions.sql first if it is not on the
-- database yet; this file does not depend on it, but the 4-per-category target
-- assumes both.
--
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-egypt-600-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. A row is skipped when its category was renamed or
-- deleted, when the 600 point value does not exist, or when the category
-- already has that question (INSERT IGNORE + uq_category_question).

DROP TEMPORARY TABLE IF EXISTS egypt_600_seed;

CREATE TEMPORARY TABLE egypt_600_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO egypt_600_seed (category_name, points, question, answer) VALUES
  ('Geography', 600, 'What is the name of the huge depression in Egypt''s Western Desert, one of the lowest points in Africa?', 'The Qattara Depression'),
  ('Geography', 600, 'What is the highest mountain in Egypt, near Saint Catherine''s Monastery?', 'Mount Catherine (accept Gebel Katherina)'),

  ('Science', 600, 'Which scholar, who worked in Fatimid Egypt around the year 1000, wrote the "Book of Optics" and is often called the father of optics?', 'Ibn al-Haytham (accept Alhazen)'),
  ('Science', 600, 'Which Egyptian-American geologist helped NASA choose the landing sites for the Apollo Moon missions?', 'Farouk El-Baz'),
  ('Science', 600, 'The Rhind Papyrus, copied around 1550 BC, is one of the oldest surviving texts on which subject?', 'Mathematics'),

  ('History', 600, 'Which pharaoh tried to replace Egypt''s many gods with the worship of a single sun god, the Aten?', 'Akhenaten'),
  ('History', 600, 'Which Macedonian general took control of Egypt after the death of Alexander the Great and founded a dynasty that ruled for about 300 years?', 'Ptolemy I (accept Ptolemy Soter)'),

  ('Sports', 600, 'In which year did Egypt host and win the Africa Cup of Nations, beating Ivory Coast on penalties in the final?', '2006'),
  ('Sports', 600, 'Which Egyptian wrestler won Olympic gold in Greco-Roman wrestling at the 2004 Athens Games?', 'Karam Gaber'),

  ('Movies', 600, 'Which Egyptian singer and film star of the 1950s and 60s was nicknamed "The Dark-Skinned Nightingale"?', 'Abdel Halim Hafez'),
  ('Movies', 600, 'Which Egyptian actress was known as the "Cinderella of Arabic Cinema"?', 'Soad Hosny'),

  ('Technology', 600, 'Which of the Seven Wonders of the Ancient World stood on an island off Egypt''s coast and guided ships into harbour?', 'The Lighthouse of Alexandria (accept Pharos)'),
  ('Technology', 600, 'What was the name of Egypt''s first communications satellite, launched in 1998?', 'Nilesat 101 (accept Nilesat)');

INSERT IGNORE INTO questions (category_id, points, question, answer)
SELECT c.id, pv.points, e.question, e.answer
  FROM egypt_600_seed e
  JOIN categories c ON c.name = e.category_name
  JOIN point_values pv ON pv.points = e.points
 ORDER BY e.id;

DROP TEMPORARY TABLE IF EXISTS egypt_600_seed;

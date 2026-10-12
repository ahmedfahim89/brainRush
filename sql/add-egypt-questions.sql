-- BrainRush: Egypt question set (owner request 2026-10-12)
--
-- Adds 32 Egypt-themed questions to the seed categories, one per category and
-- point value from 100 to 600. History 300 and Technology 100, 400 and 500 were
-- dropped in review, so those cells get none.
--
-- Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-egypt-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. A row is skipped when its category was renamed or
-- deleted, when its point value does not exist (for example 600 on a database
-- without that row), or when the category already has that question (INSERT
-- IGNORE + uq_category_question).

DROP TEMPORARY TABLE IF EXISTS egypt_seed;

CREATE TEMPORARY TABLE egypt_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO egypt_seed (category_name, points, question, answer) VALUES
  ('Geography', 100, 'What is the capital city of Egypt?', 'Cairo'),
  ('Geography', 200, 'Which sea forms Egypt''s northern coast?', 'The Mediterranean Sea'),
  ('Geography', 300, 'Which canal, opened in 1869, lets ships sail between Europe and Asia without going around Africa?', 'The Suez Canal'),
  ('Geography', 400, 'Which city in southern Egypt is home to the Valley of the Kings and Karnak Temple?', 'Luxor'),
  ('Geography', 500, 'Which huge man-made lake in southern Egypt, formed in the 1960s, is one of the largest of its kind in the world?', 'Lake Nasser'),
  ('Geography', 600, 'Which remote oasis in Egypt''s Western Desert, near the Libyan border, is famous for its ancient Oracle of Amun?', 'Siwa Oasis'),

  ('Science', 100, 'Which animal, known as the "ship of the desert", has carried goods across Egypt for centuries?', 'The camel'),
  ('Science', 200, 'Which beetle did ancient Egyptians treat as sacred and link with the rising sun?', 'The scarab (accept dung beetle, Al-Ja''ran)'),
  ('Science', 300, 'Which reptile did ancient Egyptians worship as the god Sobek?', 'The crocodile'),
  ('Science', 400, 'The ancient Egyptian calendar had 12 months of 30 days. How many extra days were added to complete the year?', '5'),
  ('Science', 500, 'Which Egyptian-born scientist won the 1999 Nobel Prize in Chemistry for his work on femtochemistry?', 'Ahmed Zewail'),
  ('Science', 600, 'What is the name of the hot, dusty spring wind that blows across Egypt, whose name is Arabic for "fifty"?', 'The Khamsin'),

  ('History', 100, 'Which queen of Egypt had famous love affairs with Julius Caesar and Mark Antony?', 'Cleopatra'),
  ('History', 200, 'Which boy pharaoh''s almost untouched tomb was found by Howard Carter in 1922?', 'Tutankhamun (accept King Tut)'),
  ('History', 400, 'Which pharaoh built the great rock-cut temples of Abu Simbel?', 'Ramesses II (accept Ramses the Great)'),
  ('History', 500, 'Which woman ruled Egypt as pharaoh for about 20 years and was often shown wearing a false beard?', 'Hatshepsut'),
  ('History', 600, 'Which ancient Egyptian architect designed the Step Pyramid at Saqqara and was later worshipped as a god of medicine?', 'Imhotep'),

  ('Sports', 100, 'Which Egyptian footballer joined Liverpool in 2017 and became known as the "Egyptian King"?', 'Mohamed Salah'),
  ('Sports', 200, 'What is the nickname of Egypt''s national football team?', 'The Pharaohs'),
  ('Sports', 300, 'Which Egyptian football club was named African "Club of the Century" by CAF in 2000?', 'Al Ahly'),
  ('Sports', 400, 'In which racket sport, played indoors against four walls, have Egyptian players won many world titles?', 'Squash'),
  ('Sports', 500, 'Egypt won the very first Africa Cup of Nations. In which year was it held?', '1957'),
  ('Sports', 600, 'Which Egyptian goalkeeper, aged 45, became the oldest player to appear at a FIFA World Cup, in 2018?', 'Essam El-Hadary'),

  ('Movies', 100, 'Which 1999 action film starring Brendan Fraser is about an ancient Egyptian priest brought back to life?', 'The Mummy'),
  ('Movies', 200, 'Which Agatha Christie mystery, filmed in 1978 and 2022, has Hercule Poirot solving a murder on an Egyptian river cruise?', 'Death on the Nile'),
  ('Movies', 300, 'Which actor, born to Egyptian parents, won the Best Actor Oscar for playing Freddie Mercury in "Bohemian Rhapsody"?', 'Rami Malek'),
  ('Movies', 400, 'Which Egyptian comedy star, nicknamed "El Zaeem" (The Leader), starred in "Terrorism and Kebab" (1992)?', 'Adel Imam'),
  ('Movies', 500, 'Which Egyptian film director received a lifetime achievement award at the Cannes Film Festival in 1997?', 'Youssef Chahine'),
  ('Movies', 600, 'Which Egyptian actress was known as the "Lady of the Arabic Screen"?', 'Faten Hamama'),

  ('Technology', 200, 'What is the name of the ancient Egyptian writing system that used pictures and symbols?', 'Hieroglyphs (accept hieroglyphics)'),
  ('Technology', 300, 'Which stone, cut from local quarries, was the main building material of the Giza pyramids?', 'Limestone'),
  ('Technology', 600, 'How tall was the Great Pyramid of Giza when it was built, to the nearest 10 metres?', 'About 150 metres (146.6 m, accept 140-150)');

INSERT IGNORE INTO questions (category_id, points, question, answer)
SELECT c.id, pv.points, e.question, e.answer
  FROM egypt_seed e
  JOIN categories c ON c.name = e.category_name
  JOIN point_values pv ON pv.points = e.points
 ORDER BY e.id;

DROP TEMPORARY TABLE IF EXISTS egypt_seed;

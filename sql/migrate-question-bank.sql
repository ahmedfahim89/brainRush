-- BrainRush migration: question bank (Sprint 6, D-31 amended 2026-10-11 / US-30)
--
-- For a database created BEFORE Sprint 6, where each question was pinned to a
-- (category, point value) slot by the unique key uq_slot. Afterwards a category may
-- hold any number of questions per point value, and each new game draws one random
-- question per board cell. New installs use sql/schema.sql or sql/schema-hosted.sql
-- instead and do not need this file.
--
-- NOT for a database converted by the first Sprint 6 version of this file (its
-- questions table has no points column): restore the pre-Sprint 6 backup first,
-- then run this file. On such a database step 1 stops with "Key column 'points'
-- doesn't exist in table" and nothing is changed.
--
-- BACK UP THE DATABASE FIRST (phpMyAdmin: Export; locally: mysqldump).
-- Run it ONCE per database:
--   local:   mysql -u root brainrush < sql/migrate-question-bank.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It has no CREATE DATABASE / USE line, so it runs on whichever database is
-- selected. It is safe to run again: every step uses MariaDB's IF [NOT] EXISTS
-- forms (MariaDB 10.4 and newer), and on a re-run they only report notes.
--
-- What it does:
--   1. Adds the unique key (category_id, question) and the plain index
--      (category_id, points) first, so fk_questions_category keeps an index after
--      uq_slot is dropped.
--      If this step fails with "Duplicate entry", a category holds the same question
--      text twice (allowed under the old slot model). Nothing has been changed at
--      that point. Find the duplicates with
--        SELECT category_id, LEFT(question, 191) AS q, COUNT(*) FROM questions
--         GROUP BY category_id, q HAVING COUNT(*) > 1;
--      edit or delete one of each pair, then run the file again.
--   2. Drops the one-question-per-slot key uq_slot. The points column, its index
--      and its FK to point_values stay; every existing question keeps its
--      category, points, text and answer.
--   3. Adds the 120 questions from docs/question-bank.md with their points to the
--      seed categories, matched by name. A row is skipped when its category was
--      renamed or deleted, when its point value no longer exists, or when the
--      category already has that question (INSERT IGNORE + unique key).

-- 1. New keys (uq_category_question also blocks duplicate texts per category)
ALTER TABLE questions
  ADD UNIQUE KEY IF NOT EXISTS uq_category_question (category_id, question(191)),
  ADD KEY IF NOT EXISTS idx_questions_slot (category_id, points);

-- 2. Allow several questions per category and point value
ALTER TABLE questions
  DROP INDEX IF EXISTS uq_slot;

-- 3. Question bank: 20 questions per seed category (4 per point value 100-500),
--    copied verbatim
DROP TEMPORARY TABLE IF EXISTS bank_seed;

CREATE TEMPORARY TABLE bank_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO bank_seed (category_name, points, question, answer) VALUES
  ('Geography', 100, 'Which is the largest ocean on Earth?', 'The Pacific Ocean'),
  ('Geography', 100, 'Which is the largest hot desert in the world?', 'The Sahara'),
  ('Geography', 100, 'Which U.S. state is made up entirely of islands?', 'Hawaii'),
  ('Geography', 100, 'In which mountain range is Mount Everest?', 'The Himalayas'),
  ('Geography', 200, 'Reykjavik is the capital city of which island country?', 'Iceland'),
  ('Geography', 200, 'Which narrow strait separates Spain from Africa?', 'The Strait of Gibraltar'),
  ('Geography', 200, 'Which is the coldest, driest and windiest continent on Earth?', 'Antarctica'),
  ('Geography', 300, 'What is the capital city of Canada?', 'Ottawa'),
  ('Geography', 300, 'Counting Australia as a continent, which is the largest island in the world?', 'Greenland'),
  ('Geography', 300, 'The Rialto Bridge is a famous landmark in which Italian city?', 'Venice'),
  ('Geography', 300, 'Which salt lake (not a true sea) lets swimmers float with ease?', 'The Dead Sea'),
  ('Geography', 400, 'What is the capital city of Australia?', 'Canberra'),
  ('Geography', 400, 'What is the capital city of Turkey?', 'Ankara'),
  ('Geography', 400, 'Which South American country takes its name from the Spanish word for "equator"?', 'Ecuador'),
  ('Geography', 400, 'Table Mountain is located in which South African city?', 'Cape Town'),
  ('Geography', 500, 'What is the largest country in Africa by area?', 'Algeria'),
  ('Geography', 500, 'In which country is the ancient rock-cut city of Petra?', 'Jordan'),
  ('Geography', 500, 'Which river flows through the city of Baghdad?', 'The Tigris (Dijlah)'),
  ('Geography', 500, 'What is the capital city of Brazil?', 'Brasilia'),

  ('Science', 100, 'What force keeps the Moon in orbit around the Earth?', 'Gravity'),
  ('Science', 100, 'Which planet is best known for its large, bright system of rings?', 'Saturn'),
  ('Science', 100, 'What name is given to animals that eat only plants?', 'Herbivores'),
  ('Science', 100, 'Which scientist developed the theory of relativity?', 'Albert Einstein'),
  ('Science', 200, 'Which planet is the largest in our Solar System?', 'Jupiter'),
  ('Science', 200, 'Which blood cells carry oxygen around the body?', 'Red blood cells'),
  ('Science', 200, 'Which naturalist is famous for the theory of evolution by natural selection?', 'Charles Darwin'),
  ('Science', 300, 'Which scientist published the three laws of motion in 1687?', 'Isaac Newton'),
  ('Science', 300, 'What is the largest organ of the human body?', 'The skin'),
  ('Science', 400, 'Which vitamin does the human body make when exposed to ultraviolet rays?', 'Vitamin D'),
  ('Science', 400, 'Which chemical element has the atomic number 1?', 'Hydrogen'),
  ('Science', 400, 'How many chambers does the human heart have?', 'Four'),
  ('Science', 400, 'Which metal is a liquid at normal room temperature?', 'Mercury'),
  ('Science', 500, 'What is the most abundant gas in Earth''s atmosphere?', 'Nitrogen'),
  ('Science', 500, 'How many bones are in the adult human body?', '206'),
  ('Science', 500, 'Which organ of the human body produces insulin?', 'The pancreas'),

  ('History', 100, 'Who was the first person to walk on the Moon?', 'Neil Armstrong'),
  ('History', 100, 'Which American civil rights leader gave the "I Have a Dream" speech in 1963?', 'Martin Luther King Jr.'),
  ('History', 100, 'Which South African leader was freed from prison in 1990 and elected president in 1994?', 'Nelson Mandela'),
  ('History', 200, 'Which French emperor was defeated at the Battle of Waterloo in 1815?', 'Napoleon Bonaparte'),
  ('History', 200, 'Who was the British Prime Minister for most of World War II?', 'Winston Churchill'),
  ('History', 200, 'Which Roman city was buried by the eruption of Mount Vesuvius in AD 79?', 'Pompeii (accept Herculaneum)'),
  ('History', 300, 'In which year did Christopher Columbus first reach the Americas?', '1492'),
  ('History', 300, 'Which queen ruled the United Kingdom from 1837 to 1901?', 'Queen Victoria'),
  ('History', 300, 'In which US city was President John F. Kennedy assassinated in 1963?', 'Dallas'),
  ('History', 300, 'Genghis Khan founded which empire?', 'The Mongol Empire'),
  ('History', 400, 'In which year did the Titanic sink on its first voyage?', '1912'),
  ('History', 400, 'Who was the first woman to win a Nobel Prize?', 'Marie Curie'),
  ('History', 400, 'In which year did World War I begin?', '1914'),
  ('History', 500, 'What was the name of the first artificial satellite, launched by the Soviet Union in 1957?', 'Sputnik 1 (accept Sputnik)'),
  ('History', 500, 'Who was the first emperor of Rome?', 'Augustus (accept Octavian)'),

  ('Sports', 100, 'How many rings are on the Olympic flag?', 'Five'),
  ('Sports', 100, 'How many minutes does a standard football (soccer) match last, not counting stoppage time?', '90'),
  ('Sports', 200, 'How many holes are played in a standard round of golf?', '18'),
  ('Sports', 300, 'In which city were the first modern Olympic Games held, in 1896?', 'Athens'),
  ('Sports', 400, 'Which martial art''s name means "empty hand"?', 'Karate'),
  ('Sports', 400, 'How long is an Olympic swimming pool, in metres?', '50 metres'),
  ('Sports', 500, 'How long is a marathon, to the nearest whole kilometre?', '42 km'),
  
  ('Movies', 100, 'Which Disney animated film features a lion cub named Simba?', 'The Lion King'),
  ('Movies', 100, 'What is the name of the cowboy toy in "Toy Story"?', 'Woody'),
  ('Movies', 100, 'What is the name of the green ogre who stars in a 2001 DreamWorks animated film?', 'Shrek'),
  ('Movies', 100, 'Which DC Comics superhero is also known as the Dark Knight?', 'Batman'),
  ('Movies', 200, 'In the Harry Potter films, which school house is Harry sorted into?', 'Gryffindor'),
  ('Movies', 200, 'Which fictional British secret agent has the code number 007?', 'James Bond'),
  ('Movies', 300, 'Which 1975 film is about a great white shark attacking swimmers at the beach town of Amity Island?', 'Jaws'),
  ('Movies', 300, 'Which actor played Captain Jack Sparrow in "Pirates of the Caribbean"?', 'Johnny Depp'),
  ('Movies', 400, 'What is the name of the hidden African nation that is home to Black Panther?', 'Wakanda'),
  ('Movies', 400, 'Who directed "Pulp Fiction" (1994)?', 'Quentin Tarantino'),

  ('Technology', 100, 'Who co-founded Microsoft with Paul Allen in 1975?', 'Bill Gates'),
  ('Technology', 100, 'Which company created the PlayStation games console?', 'Sony'),
  ('Technology', 100, 'What is the common name for unwanted bulk email, also the name of a canned meat?', 'Spam'),
  ('Technology', 100, 'Larry Page and Sergey Brin founded which company in 1998?', 'Google'),
  ('Technology', 200, 'What does "GPS" stand for?', 'Global Positioning System'),
  ('Technology', 200, 'Who invented the telephone, in 1876?', 'Alexander Graham Bell'),
  ('Technology', 200, 'Which brothers made the first airplane flight in 1903?', 'The Wright brothers (Orville and Wilbur)'),
  ('Technology', 200, 'Which company created the Game Boy and the Super Mario games?', 'Nintendo'),
  ('Technology', 300, 'In computing, what does "RAM" stand for?', 'Random Access Memory'),
  ('Technology', 300, 'What does "PDF" stand for?', 'Portable Document Format'),
  ('Technology', 300, 'How many bits make up one byte?', '8'),
  ('Technology', 400, 'Who invented the electromechanical "Bombe" machine that cracked German Enigma ciphers?', 'Alan Turing'),
  ('Technology', 400, 'Which computer input device did Douglas Engelbart invent in the 1960s?', 'The mouse'),
  ('Technology', 500, 'How is the decimal number 5 written in binary?', '101');

INSERT IGNORE INTO questions (category_id, points, question, answer)
SELECT c.id, pv.points, b.question, b.answer
  FROM bank_seed b
  JOIN categories c ON c.name = b.category_name
  JOIN point_values pv ON pv.points = b.points
 ORDER BY b.id;

DROP TEMPORARY TABLE IF EXISTS bank_seed;

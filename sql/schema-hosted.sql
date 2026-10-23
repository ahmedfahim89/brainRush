-- BrainRush schema + seed data -- HOSTED variant (phpMyAdmin import, e.g. Hostinger)
-- Import into an EXISTING, empty database: in phpMyAdmin select the database
-- first, then Import this file. It has no CREATE DATABASE / USE statement
-- because shared hosting creates the database (and its prefixed name) for you.
--
-- KEEP IN SYNC: the tables and seed data below must stay identical to
-- sql/schema.sql (everything after its "USE brainrush;" line). Any schema change
-- must update both files in the same sprint (US-29).
--
-- Safe to re-run: tables are only created if missing and seed rows use INSERT IGNORE,
-- so existing data (including admin changes to settings) is never overwritten.
-- Standard SQL for MariaDB 10.4 and newer (10.6 / 10.11 / 11.x).
--
-- This file is for NEW installs. A database created before Sprint 6 (one question
-- per category and point value, key uq_slot) must import sql/migrate-question-bank.sql
-- once instead (D-31).

-- Key/value game settings (categories_per_game, timer_seconds, banner_enabled, banner_text, start_game_hidden)
CREATE TABLE IF NOT EXISTS settings (
  name  VARCHAR(50)  NOT NULL,
  value VARCHAR(255) NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- Board rows (y-axis). Any set of positive values is allowed.
CREATE TABLE IF NOT EXISTS point_values (
  id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  points  INT UNSIGNED NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1, -- 0 = hidden from the board, its questions are kept
  PRIMARY KEY (id),
  UNIQUE KEY uq_points (points)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- Board columns (x-axis). The _ci collation makes the unique name case-insensitive.
CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- Question bank (D-31, amended 2026-10-11): every question has a point value, and a
-- category may have any number of questions per point value (no one-per-slot key).
-- Each new game draws, per board cell (category x point value), one random question
-- from that cell's questions. uq_category_question_image blocks the same question
-- text with the same picture twice in one category (case-insensitive via _ci;
-- compares the first 191 characters of each) and keeps the seed INSERT IGNORE
-- idempotent. Flag questions share one prompt text, so the key includes image.
-- image is NOT NULL DEFAULT '' (not NULL, which never collides in a unique key) so
-- text questions are still de-duplicated. A non-empty image (img/questions/...)
-- makes it a picture question, shown above the text. idx_questions_slot serves
-- the per-cell lookups and fk_questions_category. image_credit ('' = none) is the
-- photo credit shown as a caption under the picture, e.g. "Jane Doe / CC BY-SA 4.0".
-- wrong_1/wrong_2 (and the _ar pair) are the two wrong options of the "3 choices"
-- helper (US-32); NULL = none yet, so the helper is greyed out on that question.
CREATE TABLE IF NOT EXISTS questions (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id INT UNSIGNED NOT NULL,
  points      INT UNSIGNED NOT NULL,
  question    TEXT         NOT NULL,
  answer      TEXT         NOT NULL,
  question_ar TEXT         NULL,
  answer_ar   TEXT         NULL,
  image       VARCHAR(255) NOT NULL DEFAULT '',
  image_credit VARCHAR(255) NOT NULL DEFAULT '',
  wrong_1     VARCHAR(255) NULL,
  wrong_2     VARCHAR(255) NULL,
  wrong_1_ar  VARCHAR(255) NULL,
  wrong_2_ar  VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_category_question_image (category_id, question(191), image(191)),
  KEY idx_questions_slot (category_id, points),
  KEY idx_questions_points (points),
  CONSTRAINT fk_questions_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_questions_points
    FOREIGN KEY (points) REFERENCES point_values (points)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- Streak Challenge leaderboard (US-33, US-34, D-37): one row per finished run with a
-- streak of 1 or more. The game shows the best run per person (the challenger name,
-- case-insensitive via the _ci collation); on equal streaks the earliest run wins.
CREATE TABLE IF NOT EXISTS streaks (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(30)  NOT NULL,
  streak     INT UNSIGNED NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_streaks_name (name),
  KEY idx_streaks_streak (streak)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO settings (name, value) VALUES
  ('categories_per_game', '5'),
  ('timer_seconds', '30'),
  ('banner_enabled', '0'),
  ('start_game_hidden', '0'),
  ('banner_text', 'New questions added - try them now!');

INSERT IGNORE INTO point_values (points) VALUES
  (100), (200), (300), (400), (500);

INSERT IGNORE INTO categories (name) VALUES
  ('Geography'), ('Science'), ('History'), ('Sports'), ('Movies'), ('Technology');

SET @geo  = (SELECT id FROM categories WHERE name = 'Geography');
SET @sci  = (SELECT id FROM categories WHERE name = 'Science');
SET @hist = (SELECT id FROM categories WHERE name = 'History');
SET @spo  = (SELECT id FROM categories WHERE name = 'Sports');
SET @mov  = (SELECT id FROM categories WHERE name = 'Movies');
SET @tech = (SELECT id FROM categories WHERE name = 'Technology');

-- 25 questions per category, 5 per point value: the 5 original seed questions
-- (one per value), then the 20 from docs/question-bank.md with their points
-- (Sprint 6, US-30), copied verbatim.
INSERT IGNORE INTO questions (category_id, points, question, answer) VALUES
  (@geo, 100, 'What is the capital city of France?', 'Paris'),
  (@geo, 200, 'Which is the longest river in South America?', 'The Amazon'),
  (@geo, 300, 'Which country has the largest land area in the world?', 'Russia'),
  (@geo, 400, 'Mount Kilimanjaro is located in which country?', 'Tanzania'),
  (@geo, 500, 'What is the smallest country in the world by area?', 'Vatican City'),

  (@sci, 100, 'What gas do plants absorb from the air for photosynthesis?', 'Carbon dioxide (CO2)'),
  (@sci, 200, 'What is the chemical symbol for gold?', 'Au'),
  (@sci, 300, 'Which planet is known as the Red Planet?', 'Mars'),
  (@sci, 400, 'What is the hardest natural substance on Earth?', 'Diamond'),
  (@sci, 500, 'Approximately how fast does light travel in a vacuum, in km per second?', 'About 300,000 km/s (299,792 km/s)'),

  (@hist, 100, 'In which year did World War II end?', '1945'),
  (@hist, 200, 'Who was the first President of the United States?', 'George Washington'),
  (@hist, 300, 'Which ancient civilization built Machu Picchu?', 'The Inca'),
  (@hist, 400, 'In which year did the Berlin Wall fall?', '1989'),
  (@hist, 500, 'Which Portuguese explorer was the first European to reach India by sea?', 'Vasco da Gama'),

  (@spo, 100, 'How many players does a football (soccer) team have on the field?', '11'),
  (@spo, 200, 'In which sport would you perform a slam dunk?', 'Basketball'),
  (@spo, 300, 'Which country won the first FIFA World Cup in 1930?', 'Uruguay'),
  (@spo, 400, 'How many points is a touchdown worth in American football (before the extra point)?', '6'),
  (@spo, 500, 'In tennis, what is the term for a score of zero?', 'Love'),

  (@mov, 100, 'Which movie features a clownfish searching for his son?', 'Finding Nemo'),
  (@mov, 200, 'Who directed the movie "Jurassic Park" (1993)?', 'Steven Spielberg'),
  (@mov, 300, 'In "The Matrix", which pill does Neo take?', 'The red pill'),
  (@mov, 400, 'What is the name of the hobbit played by Elijah Wood in "The Lord of the Rings"?', 'Frodo Baggins'),
  (@mov, 500, 'Which film was the first to win the Academy Award for Best Picture?', 'Wings (1927)'),

  (@tech, 100, 'What does "CPU" stand for?', 'Central Processing Unit'),
  (@tech, 200, 'Which company created the iPhone?', 'Apple'),
  (@tech, 300, 'What does "HTML" stand for?', 'HyperText Markup Language'),
  (@tech, 400, 'In what year was the first version of Linux released?', '1991'),
  (@tech, 500, 'Who is credited with inventing the World Wide Web?', 'Tim Berners-Lee'),

  -- Question bank (docs/question-bank.md)
  (@geo, 100, 'Which is the largest ocean on Earth?', 'The Pacific Ocean'),
  (@geo, 100, 'Which is the largest hot desert in the world?', 'The Sahara'),
  (@geo, 100, 'Which U.S. state is made up entirely of islands?', 'Hawaii'),
  (@geo, 100, 'In which mountain range is Mount Everest?', 'The Himalayas'),
  (@geo, 200, 'Which country is made up mainly of the islands of Honshu, Hokkaido, Kyushu and Shikoku?', 'Japan'),
  (@geo, 200, 'Reykjavik is the capital city of which island country?', 'Iceland'),
  (@geo, 200, 'Which narrow strait separates Spain from Africa?', 'The Strait of Gibraltar'),
  (@geo, 200, 'Which is the coldest, driest and windiest continent on Earth?', 'Antarctica'),
  (@geo, 300, 'What is the capital city of Canada?', 'Ottawa'),
  (@geo, 300, 'Counting Australia as a continent, which is the largest island in the world?', 'Greenland'),
  (@geo, 300, 'The Rialto Bridge is a famous landmark in which Italian city?', 'Venice'),
  (@geo, 300, 'Which salt lake, whose shore is the lowest point on land on Earth, lets swimmers float with ease?', 'The Dead Sea'),
  (@geo, 500, 'What is the capital city of Australia?', 'Canberra'),
  (@geo, 400, 'What is the capital city of Turkey?', 'Ankara'),
  (@geo, 400, 'Which South American country takes its name from the Spanish word for "equator"?', 'Ecuador'),
  (@geo, 400, 'Table Mountain overlooks which South African city?', 'Cape Town'),
  (@geo, 500, 'What is the largest country in Africa by area?', 'Algeria'),
  (@geo, 500, 'In which country is the ancient rock-cut city of Petra?', 'Jordan'),
  (@geo, 500, 'Which river flows through the city of Baghdad?', 'The Tigris'),
  (@geo, 400, 'What is the capital city of Brazil?', 'Brasilia'),

  (@sci, 100, 'What force keeps the Moon in orbit around the Earth?', 'Gravity'),
  (@sci, 100, 'Which planet is best known for its large, bright system of rings?', 'Saturn'),
  (@sci, 100, 'What name is given to animals that eat only plants?', 'Herbivores'),
  (@sci, 100, 'Which scientist developed the theory of relativity?', 'Albert Einstein'),
  (@sci, 200, 'Which planet is the largest in our Solar System?', 'Jupiter'),
  (@sci, 200, 'What is the only mammal capable of true powered flight?', 'The bat'),
  (@sci, 200, 'Which blood cells carry oxygen around the body?', 'Red blood cells'),
  (@sci, 200, 'Which naturalist is famous for the theory of evolution by natural selection?', 'Charles Darwin'),
  (@sci, 300, 'Which part of a human cell contains most of its DNA?', 'The nucleus'),
  (@sci, 300, 'Which scientist published the three laws of motion in 1687?', 'Isaac Newton'),
  (@sci, 300, 'What is the largest organ of the human body?', 'The skin'),
  (@sci, 300, 'Which star is closest to Earth?', 'The Sun'),
  (@sci, 400, 'Which vitamin does the human body make when exposed to ultraviolet rays?', 'Vitamin D'),
  (@sci, 400, 'Which chemical element has the atomic number 1?', 'Hydrogen'),
  (@sci, 400, 'How many chambers does the human heart have?', 'Four'),
  (@sci, 400, 'Which metal is a liquid at normal room temperature?', 'Mercury'),
  (@sci, 500, 'What is the most abundant gas in Earth''s atmosphere?', 'Nitrogen'),
  (@sci, 500, 'How many bones are in the adult human body?', '206'),
  (@sci, 500, 'Which organ of the human body produces insulin?', 'The pancreas'),
  (@sci, 500, 'What is the scientific study of earthquakes called?', 'Seismology'),

  (@hist, 100, 'Who was the first person to walk on the Moon?', 'Neil Armstrong'),
  (@hist, 100, 'Which American civil rights leader gave the "I Have a Dream" speech in 1963?', 'Martin Luther King Jr.'),
  (@hist, 100, 'Which South African leader was freed from prison in 1990 and elected president in 1994?', 'Nelson Mandela'),
  (@hist, 100, 'Which English king had six wives?', 'Henry VIII'),
  (@hist, 200, 'Which French emperor was defeated at the Battle of Waterloo in 1815?', 'Napoleon Bonaparte'),
  (@hist, 200, 'Who was the British Prime Minister for most of World War II?', 'Winston Churchill'),
  (@hist, 200, 'Which ship carried the Pilgrims from England to North America in 1620?', 'The Mayflower'),
  (@hist, 200, 'Which Roman city was buried by the eruption of Mount Vesuvius in AD 79?', 'Pompeii (accept Herculaneum)'),
  (@hist, 300, 'In which year did Christopher Columbus first reach the Americas?', '1492'),
  (@hist, 300, 'Which queen ruled the United Kingdom from 1837 to 1901?', 'Queen Victoria'),
  (@hist, 300, 'In which US city was President John F. Kennedy assassinated in 1963?', 'Dallas'),
  (@hist, 300, 'Genghis Khan founded which empire?', 'The Mongol Empire'),
  (@hist, 400, 'In which year did the Titanic sink on its first voyage?', '1912'),
  (@hist, 400, 'Who was the main author of the US Declaration of Independence?', 'Thomas Jefferson'),
  (@hist, 400, 'Who was the first woman to win a Nobel Prize?', 'Marie Curie'),
  (@hist, 400, 'In which year did World War I begin?', '1914'),
  (@hist, 500, 'Which defensive wall did the Romans begin building across northern England in AD 122?', 'Hadrian''s Wall'),
  (@hist, 500, 'What was the name of the first artificial satellite, launched by the Soviet Union in 1957?', 'Sputnik 1 (accept Sputnik)'),
  (@hist, 500, 'In which year was the Magna Carta sealed by King John?', '1215'),
  (@hist, 500, 'Who was the first emperor of Rome?', 'Augustus (accept Octavian)'),

  (@spo, 100, 'In which sport do players try to score a strike by knocking down all ten pins with one ball?', 'Ten-pin bowling (accept bowling)'),
  (@spo, 100, 'How many rings are on the Olympic flag?', 'Five'),
  (@spo, 100, 'How many minutes does a standard football (soccer) match last, not counting stoppage time?', '90'),
  (@spo, 100, 'In baseball, what is it called when a batter hits the ball over the outfield fence in fair territory?', 'A home run'),
  (@spo, 200, 'How many holes are played in a standard round of golf?', '18'),
  (@spo, 200, 'In which sport do teams form a scrum and score a try?', 'Rugby'),
  (@spo, 200, 'How many events make up an Olympic decathlon?', '10'),
  (@spo, 200, 'Which boxer, born Cassius Clay, called himself "The Greatest"?', 'Muhammad Ali'),
  (@spo, 300, 'In which city were the first modern Olympic Games held, in 1896?', 'Athens'),
  (@spo, 300, 'The Stanley Cup is the championship trophy in which sport?', 'Ice hockey'),
  (@spo, 300, 'What colour is the jersey worn by the overall leader of the Tour de France?', 'Yellow'),
  (@spo, 300, 'In which sport do competitors use a foil, an epee or a sabre?', 'Fencing'),
  (@spo, 400, 'In which athletics event do competitors throw a heavy metal ball from the shoulder?', 'The shot put'),
  (@spo, 400, 'Which martial art''s name means "empty hand"?', 'Karate'),
  (@spo, 400, 'The "Fosbury Flop" is a technique used in which athletics event?', 'The high jump'),
  (@spo, 400, 'How long is an Olympic swimming pool, in metres?', '50 metres'),
  (@spo, 500, 'What is the highest score possible with a single dart?', '60 (treble 20)'),
  (@spo, 500, 'How long is a marathon, to the nearest whole kilometre?', '42 km (exactly 42.195 km, accept 26.2 miles)'),
  (@spo, 500, 'In snooker, how many points is the black ball worth?', '7'),
  (@spo, 500, 'The America''s Cup is a famous trophy in which sport?', 'Sailing (accept yacht racing)'),

  (@mov, 100, 'Which Disney animated film features a lion cub named Simba?', 'The Lion King'),
  (@mov, 100, 'What is the name of the cowboy toy in "Toy Story"?', 'Woody'),
  (@mov, 100, 'What is the name of the green ogre who stars in a 2001 DreamWorks animated film?', 'Shrek'),
  (@mov, 100, 'Which DC Comics superhero is also known as the Dark Knight?', 'Batman'),
  (@mov, 200, 'In the Harry Potter films, which school house is Harry sorted into?', 'Gryffindor'),
  (@mov, 200, 'What is the name of the talking snowman in Disney''s "Frozen"?', 'Olaf'),
  (@mov, 200, 'Which fictional British secret agent has the code number 007?', 'James Bond'),
  (@mov, 200, 'Which 1994 film features the line "My mama always said life was like a box of chocolates"?', 'Forrest Gump'),
  (@mov, 300, 'In "The Wizard of Oz" (1939), what is the name of Dorothy''s dog?', 'Toto'),
  (@mov, 300, 'Which 1975 film is about a great white shark attacking swimmers at the beach town of Amity Island?', 'Jaws'),
  (@mov, 300, 'Which actor played Captain Jack Sparrow in "Pirates of the Caribbean"?', 'Johnny Depp'),
  (@mov, 300, 'Which Pixar film follows a lonely trash-compacting robot left on a deserted Earth?', 'WALL-E'),
  (@mov, 400, 'What is the name of the hidden African nation that is home to Black Panther?', 'Wakanda'),
  (@mov, 400, 'Who directed "Pulp Fiction" (1994)?', 'Quentin Tarantino'),
  (@mov, 400, 'In "Star Wars", what is the name of Han Solo''s ship?', 'The Millennium Falcon'),
  (@mov, 400, 'In "Back to the Future", which make of car is turned into a time machine?', 'A DeLorean'),
  (@mov, 500, 'Which 1942 film features the line "Here''s looking at you, kid"?', 'Casablanca'),
  (@mov, 500, 'In "The Godfather", what is the family name of Don Vito?', 'Corleone'),
  (@mov, 500, 'What is the name of the snowbound hotel in "The Shining" (1980)?', 'The Overlook Hotel'),
  (@mov, 500, 'Which 1939 film set during the American Civil War stars Vivien Leigh as Scarlett O''Hara?', 'Gone with the Wind'),

  (@tech, 100, 'Who co-founded Microsoft with Paul Allen in 1975?', 'Bill Gates'),
  (@tech, 100, 'Which company created the PlayStation games console?', 'Sony'),
  (@tech, 100, 'What is the common name for unwanted bulk email, also the name of a canned meat?', 'Spam'),
  (@tech, 100, 'Larry Page and Sergey Brin founded which company in 1998?', 'Google'),
  (@tech, 200, 'What does "GPS" stand for?', 'Global Positioning System'),
  (@tech, 200, 'Who was granted the first US patent for the telephone, in 1876?', 'Alexander Graham Bell'),
  (@tech, 200, 'Which brothers made the first powered, controlled airplane flight in 1903?', 'The Wright brothers (Orville and Wilbur)'),
  (@tech, 200, 'Which company created the Game Boy and the Super Mario games?', 'Nintendo'),
  (@tech, 300, 'In computing, what does "RAM" stand for?', 'Random Access Memory'),
  (@tech, 300, 'What does "PDF" stand for?', 'Portable Document Format'),
  (@tech, 400, 'How many bits make up one byte?', '8'),
  (@tech, 300, 'Which popular programming language was named after a British comedy group, not a snake?', 'Python'),
  (@tech, 400, 'Which British mathematician proposed a famous test of machine intelligence in 1950?', 'Alan Turing'),
  (@tech, 400, 'Which German inventor introduced movable-type printing to Europe around 1440?', 'Johannes Gutenberg'),
  (@tech, 400, 'Which computer input device did Douglas Engelbart invent in the 1960s?', 'The mouse'),
  (@tech, 400, 'Which Scottish inventor''s improvements to the steam engine helped power the Industrial Revolution?', 'James Watt'),
  (@tech, 500, 'Who is often called the first computer programmer, for her notes on Charles Babbage''s Analytical Engine?', 'Ada Lovelace'),
  (@tech, 500, 'Which Italian inventor sent the first radio signal across the Atlantic Ocean in 1901?', 'Guglielmo Marconi'),
  (@tech, 500, 'How is the decimal number 5 written in binary?', '101'),
  (@tech, 500, 'Which tiny electronic switch, invented in 1947, replaced the vacuum tube and is the basic building block of computer chips?', 'The transistor');

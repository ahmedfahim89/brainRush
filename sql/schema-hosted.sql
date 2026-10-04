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

-- Key/value game settings (categories_per_game, timer_seconds)
CREATE TABLE IF NOT EXISTS settings (
  name  VARCHAR(50)  NOT NULL,
  value VARCHAR(255) NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- Board rows (y-axis). Any set of positive values is allowed.
CREATE TABLE IF NOT EXISTS point_values (
  id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  points INT UNSIGNED NOT NULL,
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

-- Exactly one question per (category, point value) slot.
CREATE TABLE IF NOT EXISTS questions (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id INT UNSIGNED NOT NULL,
  points      INT UNSIGNED NOT NULL,
  question    TEXT         NOT NULL,
  answer      TEXT         NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_slot (category_id, points),
  KEY idx_questions_points (points),
  CONSTRAINT fk_questions_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_questions_points
    FOREIGN KEY (points) REFERENCES point_values (points)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO settings (name, value) VALUES
  ('categories_per_game', '5'),
  ('timer_seconds', '30');

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
  (@tech, 500, 'Who is credited with inventing the World Wide Web?', 'Tim Berners-Lee');

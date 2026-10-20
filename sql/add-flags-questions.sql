-- BrainRush: Flags picture question set (owner request 2026-10-20)
--
-- Adds a new "Flags" category, the first picture category: 53 questions, 9 at each
-- of 100, 200, 300, 400 and 600 and 8 at 500 (the owner dropped Oman), from the owner's list.
-- Every row has the same prompt ("Which country does this flag belong to?") and
-- shows a national flag from img/questions/ (the image column). The answer is the
-- country name. Look-alike flags were left out on purpose (Chad/Romania,
-- Indonesia/Monaco/Poland, Ireland/Cote d'Ivoire, Australia/New Zealand,
-- Senegal/Mali, Iceland, Bahrain, Palestine, Tunisia, Ecuador/Venezuela,
-- Luxembourg, Slovenia/Slovakia). Every row comes with its Arabic question and
-- answer. Review doc, image sources and licences:
-- docs/question-sets/flags-review.md.
--
-- Requires sql/migrate-add-arabic.sql and sql/migrate-add-image.sql (or a schema
-- that already has question_ar / answer_ar, the image column and the
-- uq_category_question_image key). Run it on whichever database is selected (there
-- is no USE line):
--   local:   mysql -u root brainrush < sql/add-flags-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- Deploy the img/questions/flag-*.svg files with it.
-- It is safe to run again. The Flags category is created only if it does not exist
-- (INSERT IGNORE + uq_category_name). A row is skipped when the Flags category was
-- renamed or deleted, when its point value does not exist, or when the category
-- already has that question with that image (INSERT IGNORE +
-- uq_category_question_image). If it is run before sql/migrate-add-image.sql, the
-- question insert stops with "Unknown column 'image'" and only the empty Flags
-- category is created. An empty category is not offered for play. Run the
-- migration, then run this file again.

SET NAMES utf8mb4;

INSERT IGNORE INTO categories (name) VALUES ('Flags');

DROP TEMPORARY TABLE IF EXISTS flags_seed;

CREATE TEMPORARY TABLE flags_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  image         VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO flags_seed (category_name, points, question, answer, question_ar, answer_ar, image) VALUES
  ('Flags', 100, 'Which country does this flag belong to?', 'Japan',
   'إلى أي دولة ينتمي هذا العلم؟', 'اليابان', 'img/questions/flag-japan.svg'),
  ('Flags', 100, 'Which country does this flag belong to?', 'Canada',
   'إلى أي دولة ينتمي هذا العلم؟', 'كندا', 'img/questions/flag-canada.svg'),
  ('Flags', 100, 'Which country does this flag belong to?', 'USA (accept United States, America)',
   'إلى أي دولة ينتمي هذا العلم؟', 'الولايات المتحدة الأمريكية (يُقبل: أمريكا، الولايات المتحدة)', 'img/questions/flag-usa.svg'),
  ('Flags', 100, 'Which country does this flag belong to?', 'United Kingdom (accept UK, Great Britain, Britain)',
   'إلى أي دولة ينتمي هذا العلم؟', 'المملكة المتحدة (يُقبل: بريطانيا، بريطانيا العظمى)', 'img/questions/flag-united-kingdom.svg'),
  ('Flags', 100, 'Which country does this flag belong to?', 'Egypt',
   'إلى أي دولة ينتمي هذا العلم؟', 'مصر', 'img/questions/flag-egypt.svg'),
  ('Flags', 100, 'Which country does this flag belong to?', 'China (accept People''s Republic of China)',
   'إلى أي دولة ينتمي هذا العلم؟', 'الصين (يُقبل: جمهورية الصين الشعبية)', 'img/questions/flag-china.svg'),
  ('Flags', 100, 'Which country does this flag belong to?', 'France',
   'إلى أي دولة ينتمي هذا العلم؟', 'فرنسا', 'img/questions/flag-france.svg'),
  ('Flags', 100, 'Which country does this flag belong to?', 'Brazil',
   'إلى أي دولة ينتمي هذا العلم؟', 'البرازيل', 'img/questions/flag-brazil.svg'),
  ('Flags', 100, 'Which country does this flag belong to?', 'Saudi Arabia (accept KSA)',
   'إلى أي دولة ينتمي هذا العلم؟', 'المملكة العربية السعودية (يُقبل: السعودية)', 'img/questions/flag-saudi-arabia.svg'),

  ('Flags', 200, 'Which country does this flag belong to?', 'Germany',
   'إلى أي دولة ينتمي هذا العلم؟', 'ألمانيا', 'img/questions/flag-germany.svg'),
  ('Flags', 200, 'Which country does this flag belong to?', 'Italy',
   'إلى أي دولة ينتمي هذا العلم؟', 'إيطاليا', 'img/questions/flag-italy.svg'),
  ('Flags', 200, 'Which country does this flag belong to?', 'Turkey (accept Turkiye)',
   'إلى أي دولة ينتمي هذا العلم؟', 'تركيا', 'img/questions/flag-turkey.svg'),
  ('Flags', 200, 'Which country does this flag belong to?', 'Spain',
   'إلى أي دولة ينتمي هذا العلم؟', 'إسبانيا', 'img/questions/flag-spain.svg'),
  ('Flags', 200, 'Which country does this flag belong to?', 'India',
   'إلى أي دولة ينتمي هذا العلم؟', 'الهند', 'img/questions/flag-india.svg'),
  ('Flags', 200, 'Which country does this flag belong to?', 'Russia (accept Russian Federation)',
   'إلى أي دولة ينتمي هذا العلم؟', 'روسيا (يُقبل: روسيا الاتحادية)', 'img/questions/flag-russia.svg'),
  ('Flags', 200, 'Which country does this flag belong to?', 'UAE (accept United Arab Emirates, Emirates)',
   'إلى أي دولة ينتمي هذا العلم؟', 'الإمارات العربية المتحدة (يُقبل: الإمارات)', 'img/questions/flag-uae.svg'),
  ('Flags', 200, 'Which country does this flag belong to?', 'Morocco',
   'إلى أي دولة ينتمي هذا العلم؟', 'المغرب', 'img/questions/flag-morocco.svg'),
  ('Flags', 200, 'Which country does this flag belong to?', 'Argentina',
   'إلى أي دولة ينتمي هذا العلم؟', 'الأرجنتين', 'img/questions/flag-argentina.svg'),

  ('Flags', 300, 'Which country does this flag belong to?', 'Mexico',
   'إلى أي دولة ينتمي هذا العلم؟', 'المكسيك', 'img/questions/flag-mexico.svg'),
  ('Flags', 300, 'Which country does this flag belong to?', 'Greece',
   'إلى أي دولة ينتمي هذا العلم؟', 'اليونان', 'img/questions/flag-greece.svg'),
  ('Flags', 300, 'Which country does this flag belong to?', 'Switzerland',
   'إلى أي دولة ينتمي هذا العلم؟', 'سويسرا', 'img/questions/flag-switzerland.svg'),
  ('Flags', 300, 'Which country does this flag belong to?', 'Portugal',
   'إلى أي دولة ينتمي هذا العلم؟', 'البرتغال', 'img/questions/flag-portugal.svg'),
  ('Flags', 300, 'Which country does this flag belong to?', 'Sweden',
   'إلى أي دولة ينتمي هذا العلم؟', 'السويد', 'img/questions/flag-sweden.svg'),
  ('Flags', 300, 'Which country does this flag belong to?', 'Netherlands (accept Holland)',
   'إلى أي دولة ينتمي هذا العلم؟', 'هولندا', 'img/questions/flag-netherlands.svg'),
  ('Flags', 300, 'Which country does this flag belong to?', 'Qatar',
   'إلى أي دولة ينتمي هذا العلم؟', 'قطر', 'img/questions/flag-qatar.svg'),
  ('Flags', 300, 'Which country does this flag belong to?', 'Kuwait',
   'إلى أي دولة ينتمي هذا العلم؟', 'الكويت', 'img/questions/flag-kuwait.svg'),
  ('Flags', 300, 'Which country does this flag belong to?', 'Norway',
   'إلى أي دولة ينتمي هذا العلم؟', 'النرويج', 'img/questions/flag-norway.svg'),

  ('Flags', 400, 'Which country does this flag belong to?', 'South Korea (accept Republic of Korea)',
   'إلى أي دولة ينتمي هذا العلم؟', 'كوريا الجنوبية', 'img/questions/flag-south-korea.svg'),
  ('Flags', 400, 'Which country does this flag belong to?', 'Lebanon',
   'إلى أي دولة ينتمي هذا العلم؟', 'لبنان', 'img/questions/flag-lebanon.svg'),
  ('Flags', 400, 'Which country does this flag belong to?', 'Kenya',
   'إلى أي دولة ينتمي هذا العلم؟', 'كينيا', 'img/questions/flag-kenya.svg'),
  ('Flags', 400, 'Which country does this flag belong to?', 'Algeria',
   'إلى أي دولة ينتمي هذا العلم؟', 'الجزائر', 'img/questions/flag-algeria.svg'),
  ('Flags', 400, 'Which country does this flag belong to?', 'Nigeria',
   'إلى أي دولة ينتمي هذا العلم؟', 'نيجيريا', 'img/questions/flag-nigeria.svg'),
  ('Flags', 400, 'Which country does this flag belong to?', 'Belgium',
   'إلى أي دولة ينتمي هذا العلم؟', 'بلجيكا', 'img/questions/flag-belgium.svg'),
  ('Flags', 400, 'Which country does this flag belong to?', 'Denmark',
   'إلى أي دولة ينتمي هذا العلم؟', 'الدنمارك', 'img/questions/flag-denmark.svg'),
  ('Flags', 400, 'Which country does this flag belong to?', 'Colombia',
   'إلى أي دولة ينتمي هذا العلم؟', 'كولومبيا', 'img/questions/flag-colombia.svg'),
  ('Flags', 400, 'Which country does this flag belong to?', 'South Africa',
   'إلى أي دولة ينتمي هذا العلم؟', 'جنوب أفريقيا', 'img/questions/flag-south-africa.svg'),

  ('Flags', 500, 'Which country does this flag belong to?', 'Jordan',
   'إلى أي دولة ينتمي هذا العلم؟', 'الأردن', 'img/questions/flag-jordan.svg'),
  ('Flags', 500, 'Which country does this flag belong to?', 'Vietnam (accept Viet Nam)',
   'إلى أي دولة ينتمي هذا العلم؟', 'فيتنام', 'img/questions/flag-vietnam.svg'),
  ('Flags', 500, 'Which country does this flag belong to?', 'Pakistan',
   'إلى أي دولة ينتمي هذا العلم؟', 'باكستان', 'img/questions/flag-pakistan.svg'),
  ('Flags', 500, 'Which country does this flag belong to?', 'Iraq',
   'إلى أي دولة ينتمي هذا العلم؟', 'العراق', 'img/questions/flag-iraq.svg'),
  ('Flags', 500, 'Which country does this flag belong to?', 'Jamaica',
   'إلى أي دولة ينتمي هذا العلم؟', 'جامايكا', 'img/questions/flag-jamaica.svg'),
  ('Flags', 500, 'Which country does this flag belong to?', 'Finland',
   'إلى أي دولة ينتمي هذا العلم؟', 'فنلندا', 'img/questions/flag-finland.svg'),
  ('Flags', 500, 'Which country does this flag belong to?', 'Cuba',
   'إلى أي دولة ينتمي هذا العلم؟', 'كوبا', 'img/questions/flag-cuba.svg'),
  ('Flags', 500, 'Which country does this flag belong to?', 'Chile',
   'إلى أي دولة ينتمي هذا العلم؟', 'تشيلي', 'img/questions/flag-chile.svg'),

  ('Flags', 600, 'Which country does this flag belong to?', 'Bhutan',
   'إلى أي دولة ينتمي هذا العلم؟', 'بوتان', 'img/questions/flag-bhutan.svg'),
  ('Flags', 600, 'Which country does this flag belong to?', 'Nepal',
   'إلى أي دولة ينتمي هذا العلم؟', 'نيبال', 'img/questions/flag-nepal.svg'),
  ('Flags', 600, 'Which country does this flag belong to?', 'Sri Lanka',
   'إلى أي دولة ينتمي هذا العلم؟', 'سريلانكا', 'img/questions/flag-sri-lanka.svg'),
  ('Flags', 600, 'Which country does this flag belong to?', 'Kazakhstan',
   'إلى أي دولة ينتمي هذا العلم؟', 'كازاخستان', 'img/questions/flag-kazakhstan.svg'),
  ('Flags', 600, 'Which country does this flag belong to?', 'Brunei (accept Brunei Darussalam)',
   'إلى أي دولة ينتمي هذا العلم؟', 'بروناي (يُقبل: بروناي دار السلام)', 'img/questions/flag-brunei.svg'),
  ('Flags', 600, 'Which country does this flag belong to?', 'Mongolia',
   'إلى أي دولة ينتمي هذا العلم؟', 'منغوليا', 'img/questions/flag-mongolia.svg'),
  ('Flags', 600, 'Which country does this flag belong to?', 'Kyrgyzstan (accept Kyrgyz Republic, Kirghizia)',
   'إلى أي دولة ينتمي هذا العلم؟', 'قيرغيزستان (يُقبل: قرغيزستان)', 'img/questions/flag-kyrgyzstan.svg'),
  ('Flags', 600, 'Which country does this flag belong to?', 'Laos (accept Lao PDR)',
   'إلى أي دولة ينتمي هذا العلم؟', 'لاوس', 'img/questions/flag-laos.svg'),
  ('Flags', 600, 'Which country does this flag belong to?', 'Turkmenistan',
   'إلى أي دولة ينتمي هذا العلم؟', 'تركمانستان', 'img/questions/flag-turkmenistan.svg');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, s.image
  FROM flags_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS flags_seed;

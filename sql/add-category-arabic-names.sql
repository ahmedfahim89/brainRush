-- BrainRush: Arabic names for the existing categories.
--
-- Requires sql/migrate-add-category-name-ar.sql (or a schema that already has categories.name_ar).
-- Rows are matched by their English name, so ids do not matter and it works on the hosted
-- database too (a name that is not there is simply skipped). Only categories with no Arabic name
-- yet are filled: a name entered in the admin is never overwritten. Safe to run again.
--   local:   mysql -u root brainrush < sql/add-category-arabic-names.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- The built-in Kilo Meshakkal column has no row here: its Arabic name is in js/i18n.js.

SET NAMES utf8mb4;

CREATE TEMPORARY TABLE category_ar_seed (
  name    VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO category_ar_seed (name, name_ar) VALUES
-- Plain categories: Modern Standard Arabic
('Geography', 'جغرافيا'),
('Science', 'علوم'),
('History', 'تاريخ'),
('Sports', 'رياضة'),
('Movies', 'أفلام'),
('Technology', 'تكنولوجيا'),
('Flags', 'أعلام'),
('Landmarks', 'معالم'),
-- Fun categories: casual Gen Z wording
('Gen Z', 'جيل زد'),
('AI', 'الـAI'),
('Egyptians', 'إحنا المصريين'),
('Food & Drink', 'أكل وشرب'),
('Cartoons & Childhood', 'كرتون زمان'),
('Who Am I?', 'أنا مين؟');

UPDATE categories c
  JOIN category_ar_seed s ON s.name = c.name
   SET c.name_ar = s.name_ar
 WHERE c.name_ar IS NULL OR TRIM(c.name_ar) = '';

DROP TEMPORARY TABLE category_ar_seed;

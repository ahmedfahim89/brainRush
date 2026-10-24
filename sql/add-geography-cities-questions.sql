-- BrainRush: Geography "where is this city?" set (owner request 2026-10-24)
--
-- Adds 18 questions to the existing "Geography" category (no new category), 3 at
-- each enabled point value (100-600), all on one theme: the player names the
-- country a city is in ("Where is Bangkok located?", "In which country is
-- Tehran?"). Low values are famous capitals; high values are lesser-known
-- capitals or major non-capital cities. Every answer is a country that is not
-- an answer anywhere else in the bank (so no Flags, Geography or History
-- country is repeated), and no city is one already named in the bank. No city
-- name contains its country's name, in English or Arabic. Text questions only
-- (image = ''). Every row has its Arabic question and answer and 2 wrong
-- options in English and Arabic for the "3 choices" helper (neighbouring or
-- regional countries). Review doc and fact-check sources:
-- docs/question-sets/geography-cities-review.md.
--
-- Count per point value: 100 = 3, 200 = 3, 300 = 3, 400 = 3, 500 = 3, 600 = 3 (18).
--
-- Requires sql/migrate-add-arabic.sql, sql/migrate-add-image.sql and
-- sql/migrate-add-wrong-options.sql (or a schema that already has question_ar /
-- answer_ar, the image column with the uq_category_question_image key, and
-- wrong_1 / wrong_2 / wrong_1_ar / wrong_2_ar). Run it on whichever database is
-- selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-geography-cities-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. Nothing is created, updated or deleted except new
-- question rows. A row is skipped when the "Geography" category does not exist,
-- when its point value does not exist, or when the category already has that
-- question (INSERT IGNORE + the uq_category_question_image unique key, image = ''
-- for text questions).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS geography_cities_seed;

CREATE TEMPORARY TABLE geography_cities_seed (
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

INSERT INTO geography_cities_seed (category_name, points, question, answer, question_ar, answer_ar, wrong_1, wrong_2, wrong_1_ar, wrong_2_ar) VALUES
  ('Geography', 100, 'Where is Bangkok located? Name the country.', 'Thailand',
   'أين تقع مدينة بانكوك؟ اذكر اسم الدولة.', 'تايلاند',
   'Vietnam', 'Cambodia', 'فيتنام', 'كمبوديا'),
  ('Geography', 100, 'In which country is the city of Dublin?', 'Ireland (accept Republic of Ireland, Eire)',
   'في أي دولة تقع مدينة دبلن؟', 'أيرلندا (يُقبل: جمهورية أيرلندا)',
   'United Kingdom', 'Iceland', 'المملكة المتحدة', 'آيسلندا'),
  ('Geography', 100, 'Damascus is the capital city of which country?', 'Syria',
   'دمشق هي عاصمة أي دولة؟', 'سوريا',
   'Lebanon', 'Jordan', 'لبنان', 'الأردن'),

  ('Geography', 200, 'Prague is a city in which European country?', 'Czechia (accept Czech Republic)',
   'براغ مدينة في أي دولة أوروبية؟', 'التشيك (يُقبل: جمهورية التشيك)',
   'Slovakia', 'Austria', 'سلوفاكيا', 'النمسا'),
  ('Geography', 200, 'In which country is Tehran?', 'Iran',
   'في أي دولة تقع مدينة طهران؟', 'إيران',
   'Iraq', 'Afghanistan', 'العراق', 'أفغانستان'),
  ('Geography', 200, 'Where is Khartoum located? Name the country.', 'Sudan',
   'أين تقع مدينة الخرطوم؟ اذكر اسم الدولة.', 'السودان',
   'South Sudan', 'Chad', 'جنوب السودان', 'تشاد'),

  ('Geography', 300, 'Kuala Lumpur is a city in which country?', 'Malaysia',
   'كوالالمبور مدينة في أي دولة؟', 'ماليزيا',
   'Indonesia', 'Singapore', 'إندونيسيا', 'سنغافورة'),
  ('Geography', 300, 'In which country is Muscat?', 'Oman (accept Sultanate of Oman)',
   'في أي دولة تقع مدينة مسقط؟', 'عُمان (يُقبل: سلطنة عُمان)',
   'Yemen', 'Bahrain', 'اليمن', 'البحرين'),
  ('Geography', 300, 'Caracas is a city in which South American country?', 'Venezuela',
   'كاراكاس مدينة في أي دولة من دول أمريكا الجنوبية؟', 'فنزويلا',
   'Colombia', 'Ecuador', 'كولومبيا', 'الإكوادور'),

  ('Geography', 400, 'Where is Bucharest located? Name the country.', 'Romania',
   'أين تقع مدينة بوخارست؟ اذكر اسم الدولة.', 'رومانيا',
   'Hungary', 'Bulgaria', 'المجر', 'بلغاريا'),
  ('Geography', 400, 'In which country is Addis Ababa, home of the African Union''s headquarters?', 'Ethiopia',
   'في أي دولة تقع مدينة أديس أبابا، حيث مقر الاتحاد الأفريقي؟', 'إثيوبيا',
   'Kenya', 'Eritrea', 'كينيا', 'إريتريا'),
  ('Geography', 400, 'In which country is the city of Accra?', 'Ghana',
   'في أي دولة تقع مدينة أكرا؟', 'غانا',
   'Nigeria', 'Ivory Coast', 'نيجيريا', 'ساحل العاج'),

  ('Geography', 500, 'Dubrovnik, the walled old town on the Adriatic coast, is in which country?', 'Croatia',
   'دوبروفنيك، البلدة القديمة المسوّرة على ساحل البحر الأدرياتيكي، تقع في أي دولة؟', 'كرواتيا',
   'Montenegro', 'Albania', 'الجبل الأسود', 'ألبانيا'),
  ('Geography', 500, 'Baku, on the shore of the Caspian Sea, is the capital of which country?', 'Azerbaijan',
   'باكو، الواقعة على شاطئ بحر قزوين، هي عاصمة أي دولة؟', 'أذربيجان',
   'Kazakhstan', 'Turkmenistan', 'كازاخستان', 'تركمانستان'),
  ('Geography', 500, 'Dakar is a city in which West African country?', 'Senegal',
   'داكار مدينة في أي دولة من دول غرب أفريقيا؟', 'السنغال',
   'Mali', 'Mauritania', 'مالي', 'موريتانيا'),

  ('Geography', 600, 'Ljubljana is the capital city of which country?', 'Slovenia',
   'ليوبليانا هي عاصمة أي دولة؟', 'سلوفينيا',
   'Slovakia', 'Serbia', 'سلوفاكيا', 'صربيا'),
  ('Geography', 600, 'The historic city of Samarkand, with its famous Registan square, is in which country?', 'Uzbekistan',
   'مدينة سمرقند التاريخية، الشهيرة بساحة ريجستان، تقع في أي دولة؟', 'أوزبكستان',
   'Tajikistan', 'Kyrgyzstan', 'طاجيكستان', 'قيرغيزستان'),
  ('Geography', 600, 'Where is Asuncion located? Name the country.', 'Paraguay',
   'أين تقع مدينة أسونسيون؟ اذكر اسم الدولة.', 'باراغواي',
   'Uruguay', 'Bolivia', 'أوروغواي', 'بوليفيا');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar, image,
                              wrong_1, wrong_2, wrong_1_ar, wrong_2_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar, '',
       s.wrong_1, s.wrong_2, s.wrong_1_ar, s.wrong_2_ar
  FROM geography_cities_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS geography_cities_seed;

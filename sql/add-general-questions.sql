-- BrainRush: general question set (owner request 2026-10-19)
--
-- Adds 146 general (no theme) questions to the nine existing categories. The
-- question-producer suggested 5 per category and point value (270); the owner
-- removed 124 in review. Review docs and fact-check sources:
-- docs/question-sets/general-*-review.md. Every row comes with its Arabic
-- question and answer. Count per category, 100 / 200 / 300 / 400 / 500 / 600:
--   Geography:  5 / 5 / 4 / 2 / 1 / 2  (19)
--   Science:    5 / 5 / 3 / 3 / 3 / 2  (21)
--   History:    4 / 4 / 4 / 2 / 2 / 2  (18)
--   Sports:     4 / 4 / 3 / 2 / 1 / 1  (15)
--   Movies:     4 / 1 / 2 / 1 / 0 / 0  (8)
--   Technology: 5 / 3 / 2 / 3 / 0 / 0  (13)
--   Gen Z:      5 / 4 / 3 / 2 / 1 / 1  (16)
--   AI:         3 / 2 / 3 / 1 / 0 / 2  (11)
--   Egyptians:  5 / 5 / 5 / 4 / 3 / 3  (25)
--
-- Requires sql/migrate-add-arabic.sql (or a schema that already has question_ar /
-- answer_ar). Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-general-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. No category is created: a row is skipped when its
-- category or point value does not exist, or when the category already has that
-- question (INSERT IGNORE + uq_category_question).

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS general_seed;

CREATE TEMPORARY TABLE general_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO general_seed (category_name, points, question, answer, question_ar, answer_ar) VALUES
  ('Geography', 100, 'Which is the longest river in Africa?', 'The Nile',
   'ما هو أطول نهر في أفريقيا؟', 'نهر النيل'),
  ('Geography', 100, 'What is the capital city of Lebanon?', 'Beirut',
   'ما هي عاصمة لبنان؟', 'بيروت'),
  ('Geography', 100, 'Which famous copper statue, holding a torch high, has stood in New York Harbor since 1886?', 'The Statue of Liberty',
   'أي تمثال نحاسي شهير يرفع شعلة عاليًا، ويقف في ميناء نيويورك منذ عام 1886؟', 'تمثال الحرية'),
  ('Geography', 100, 'Which is the second largest ocean on Earth?', 'The Atlantic Ocean',
   'ما هو ثاني أكبر محيط على وجه الأرض؟', 'المحيط الأطلسي'),
  ('Geography', 100, 'In which city is the Kaaba, the holiest site in Islam?', 'Mecca (accept Makkah)',
   'في أي مدينة تقع الكعبة المشرفة، أقدس بقاع الإسلام؟', 'مكة المكرمة'),

  ('Geography', 200, 'Which famous waterfalls lie on the border between the US state of New York and the Canadian province of Ontario?', 'Niagara Falls',
   'أي شلالات شهيرة تقع على الحدود بين ولاية نيويورك الأمريكية ومقاطعة أونتاريو الكندية؟', 'شلالات نياجرا'),
  ('Geography', 200, 'Which sea lies between northeast Africa and the Arabian Peninsula, with resorts such as Hurghada and Sharm El Sheikh?', 'The Red Sea',
   'أي بحر يقع بين شمال شرق أفريقيا وشبه الجزيرة العربية، وتطل عليه منتجعات مثل الغردقة وشرم الشيخ؟', 'البحر الأحمر'),
  ('Geography', 200, 'What is the capital city of the Netherlands?', 'Amsterdam',
   'ما هي عاصمة هولندا؟', 'أمستردام'),
  ('Geography', 200, 'The Burj Khalifa skyscraper stands in which city?', 'Dubai',
   'في أي مدينة تقع ناطحة السحاب "برج خليفة"؟', 'دبي'),
  ('Geography', 200, 'Which large island country off the southeast coast of Africa is the only place where lemurs live in the wild?', 'Madagascar',
   'أي دولة جزرية كبيرة قبالة الساحل الجنوبي الشرقي لأفريقيا هي المكان الوحيد الذي تعيش فيه حيوانات الليمور في البرية؟', 'مدغشقر'),

  ('Geography', 300, 'What is the capital city of Morocco?', 'Rabat',
   'ما هي عاصمة المغرب؟', 'الرباط'),
  ('Geography', 300, 'Which is the smallest and shallowest of the world''s five oceans?', 'The Arctic Ocean',
   'ما هو أصغر محيطات العالم الخمسة وأقلها عمقًا؟', 'المحيط المتجمد الشمالي'),
  ('Geography', 300, 'Which is the largest lake in Africa?', 'Lake Victoria',
   'ما هي أكبر بحيرة في أفريقيا؟', 'بحيرة فيكتوريا'),
  ('Geography', 300, 'Which city, once called Constantinople, stands on two continents, Europe and Asia?', 'Istanbul',
   'أي مدينة، كانت تُعرف باسم القسطنطينية، تقع على قارتين هما أوروبا وآسيا؟', 'إسطنبول'),

  ('Geography', 400, 'What is the capital city of New Zealand?', 'Wellington',
   'ما هي عاصمة نيوزيلندا؟', 'ويلينغتون'),
  ('Geography', 400, 'Lima is the capital city of which country?', 'Peru',
   'ليما هي عاصمة أي دولة؟', 'بيرو'),

  ('Geography', 500, 'Which European river flows through four capital cities: Vienna, Bratislava, Budapest and Belgrade?', 'The Danube',
   'أي نهر أوروبي يمر بأربع عواصم هي فيينا وبراتيسلافا وبودابست وبلغراد؟', 'نهر الدانوب'),

  ('Geography', 600, 'Which African kingdom is completely surrounded by just one other country?', 'Lesotho',
   'أي مملكة أفريقية تحيط بها دولة واحدة فقط من جميع الجهات؟', 'ليسوتو'),
  ('Geography', 600, 'Which narrow strait, whose Arabic name means "Gate of Tears", lies between the Arabian Peninsula and the Horn of Africa?', 'Bab el-Mandeb',
   'أي مضيق ضيق يفصل بين جنوب غرب شبه الجزيرة العربية والقرن الأفريقي، بين اليمن وجيبوتي؟', 'مضيق باب المندب'),

  ('Science', 100, 'What is the chemical formula of water?', 'H2O',
   'ما هي الصيغة الكيميائية للماء؟', 'H2O'),
  ('Science', 100, 'At sea level, at what temperature in degrees Celsius does water boil?', '100 degrees Celsius',
   'عند مستوى سطح البحر، عند أي درجة حرارة مئوية يغلي الماء؟', '100 درجة مئوية'),
  ('Science', 100, 'Which pair of organs do humans use to breathe?', 'The lungs',
   'ما زوج الأعضاء الذي يستخدمه الإنسان في التنفس؟', 'الرئتان'),
  ('Science', 100, 'What is the largest animal known to have ever lived on Earth?', 'The blue whale',
   'ما هو أكبر حيوان معروف عاش على وجه الأرض على الإطلاق؟', 'الحوت الأزرق'),
  ('Science', 100, 'As traditionally counted, how many colours are there in a rainbow?', 'Seven',
   'وفق العدّ التقليدي، كم عدد ألوان قوس قزح؟', 'سبعة'),

  ('Science', 200, 'Which reddish-brown metal is the most common choice for electrical wires in homes?', 'Copper',
   'أي معدن بني مائل إلى الحمرة هو الأكثر استخدامًا في الأسلاك الكهربائية بالمنازل؟', 'النحاس'),
  ('Science', 200, 'What is the name of the galaxy that contains our Solar System?', 'The Milky Way',
   'ما اسم المجرة التي تضم مجموعتنا الشمسية؟', 'مجرة درب التبانة'),
  ('Science', 200, 'Which is the largest living bird in the world?', 'The ostrich',
   'ما هو أكبر طائر حي في العالم؟', 'النعامة'),
  ('Science', 200, 'What is the name for the process in which a liquid slowly turns into a gas, like a puddle drying in the sun?', 'Evaporation',
   'ما اسم العملية التي يتحول فيها السائل ببطء إلى غاز، مثل جفاف بركة ماء تحت الشمس؟', 'التبخر'),
  ('Science', 200, 'Which instrument do scientists use to see things too small for the eye, such as cells?', 'A microscope',
   'ما الجهاز الذي يستخدمه العلماء لرؤية الأشياء الأصغر من أن تراها العين، مثل الخلايا؟', 'المجهر (الميكروسكوب)'),

  ('Science', 300, 'Which Scottish scientist discovered penicillin in 1928?', 'Alexander Fleming',
   'أي عالم اسكتلندي اكتشف البنسلين عام 1928؟', 'ألكسندر فليمنغ'),
  ('Science', 300, 'What is the longest bone in the human body?', 'The femur (thigh bone)',
   'ما هو أطول عظم في جسم الإنسان؟', 'عظم الفخذ'),
  ('Science', 300, 'How many teeth are there in a full adult set, including the wisdom teeth?', '32',
   'كم عدد الأسنان في الطقم الكامل لدى الإنسان البالغ، بما فيها ضروس العقل؟', '32'),

  ('Science', 400, 'Which planet is the hottest in our Solar System?', 'Venus',
   'ما هو أسخن كوكب في مجموعتنا الشمسية؟', 'كوكب الزهرة'),
  ('Science', 400, 'What is the chemical symbol for sodium?', 'Na',
   'ما هو الرمز الكيميائي لعنصر الصوديوم؟', 'Na'),
  ('Science', 400, 'What is the green pigment in plants that captures light energy?', 'Chlorophyll',
   'ما هي الصبغة الخضراء في النباتات التي تلتقط طاقة الضوء؟', 'الكلوروفيل (اليخضور)'),

  ('Science', 500, 'What is the largest internal organ of the human body?', 'The liver',
   'ما هو أكبر عضو داخلي في جسم الإنسان؟', 'الكبد'),
  ('Science', 500, 'Which blood type is known as the "universal donor" type?', 'O negative',
   'أي فصيلة دم تُعرف بفصيلة "المتبرع العام"؟', 'O سالب'),
  ('Science', 500, 'Which gas, with the chemical formula O3, forms a layer high in the atmosphere that blocks much of the Sun''s UV rays?', 'Ozone',
   'أي غاز، صيغته الكيميائية O3، يشكل طبقة في أعالي الغلاف الجوي تحجب جزءًا كبيرًا من الأشعة فوق البنفسجية القادمة من الشمس؟', 'الأوزون'),

  ('Science', 600, 'Which chemical element makes up the largest share of the Earth''s crust by mass?', 'Oxygen',
   'أي عنصر كيميائي يشكل النسبة الأكبر من كتلة القشرة الأرضية؟', 'الأكسجين'),
  ('Science', 600, 'Which Persian scholar wrote "The Canon of Medicine", used as a medical textbook in Europe for centuries?', 'Ibn Sina (accept Avicenna)',
   'أي عالم فارسي ألّف كتاب "القانون في الطب" الذي ظل مرجعًا طبيًا في جامعات أوروبا لقرون؟', 'ابن سينا'),

  ('History', 100, 'Which artist painted the "Mona Lisa"?', 'Leonardo da Vinci',
   'أي فنان رسم لوحة "الموناليزا"؟', 'ليوناردو دا فينشي'),
  ('History', 100, 'Which famous iron tower was built for the 1889 World''s Fair?', 'The Eiffel Tower',
   'أي برج حديدي شهير بُني خصيصًا للمعرض العالمي عام 1889؟', 'برج إيفل'),
  ('History', 100, 'Which famous ancient monument at Giza has the body of a lion and the head of a human?', 'The Great Sphinx (accept the Sphinx)',
   'أي أثر قديم شهير في الجيزة له جسد أسد ورأس إنسان؟', 'تمثال أبو الهول'),
  ('History', 100, 'Who led Germany''s Nazi Party and ruled the country during World War II?', 'Adolf Hitler',
   'من قاد الحزب النازي في ألمانيا وحكم البلاد خلال الحرب العالمية الثانية؟', 'أدولف هتلر'),

  ('History', 200, 'Which stone slab, found in Egypt in 1799, carries the same decree in three scripts and helped unlock ancient Egyptian writing?', 'The Rosetta Stone',
   'أي لوح حجري، عُثر عليه في مصر عام 1799، يحمل المرسوم نفسه بثلاث كتابات، وساعد على فك رموز الكتابة المصرية القديمة؟', 'حجر رشيد'),
  ('History', 200, 'Which leader used non-violent protest, including the 1930 Salt March, to fight British rule in his country?', 'Mahatma Gandhi (accept Mohandas Gandhi)',
   'أي زعيم استخدم الاحتجاج السلمي، ومنه "مسيرة الملح" عام 1930، لمقاومة الحكم البريطاني في بلاده؟', 'المهاتما غاندي'),
  ('History', 200, 'Which Egyptian president signed a peace treaty with Israel in 1979?', 'Anwar Sadat (accept Mohamed Anwar El Sadat)',
   'أي رئيس مصري وقّع معاهدة السلام مع إسرائيل عام 1979؟', 'محمد أنور السادات'),
  ('History', 200, 'Which cosmonaut became the first person in space, in April 1961?', 'Yuri Gagarin',
   'أي رائد فضاء أصبح أول إنسان يصعد إلى الفضاء، في أبريل 1961؟', 'يوري غاغارين'),

  ('History', 300, 'Which US president issued the Emancipation Proclamation in 1863?', 'Abraham Lincoln',
   'أي رئيس أمريكي أصدر "إعلان تحرير العبيد" عام 1863؟', 'أبراهام لينكولن'),
  ('History', 300, 'Which ancient Egyptian queen, whose name means "the beautiful one has come", is famous for her painted bust?', 'Nefertiti',
   'أي ملكة مصرية قديمة، يعني اسمها "الجميلة أتت"، تشتهر بتمثالها النصفي الملوّن؟', 'نفرتيتي'),
  ('History', 300, 'Which Caribbean country did Fidel Castro lead from 1959?', 'Cuba',
   'أي دولة في البحر الكاريبي قادها فيدل كاسترو بدءًا من عام 1959؟', 'كوبا'),
  ('History', 300, 'Which city was the target of the first atomic bomb ever used in war?', 'Hiroshima',
   'أي مدينة استُهدفت بأول قنبلة ذرية تُستخدم في حرب؟', 'هيروشيما'),

  ('History', 400, 'Whose expedition of 1519 to 1522 made the first voyage around the world, although he was killed on the way?', 'Ferdinand Magellan',
   'من هو المستكشف الذي قامت حملته (1519-1522) بأول رحلة بحرية حول العالم، رغم أنه قُتل في أثنائها؟', 'فرديناند ماجلان'),
  ('History', 400, 'Which empire reached its peak under Suleiman the Magnificent in the 16th century?', 'The Ottoman Empire',
   'أي إمبراطورية بلغت ذروتها في عهد السلطان سليمان القانوني في القرن السادس عشر؟', 'الدولة العثمانية (الإمبراطورية العثمانية)'),

  ('History', 500, 'Which 1919 treaty, signed in the Hall of Mirrors, set the peace terms for Germany after World War I?', 'The Treaty of Versailles',
   'أي معاهدة وُقّعت عام 1919 في قاعة المرايا، وحددت شروط السلام المفروضة على ألمانيا بعد الحرب العالمية الأولى؟', 'معاهدة فرساي'),
  ('History', 500, 'Which ancient city on the Euphrates is traditionally said to have had the Hanging Gardens, one of the Seven Wonders?', 'Babylon',
   'أي مدينة قديمة على نهر الفرات يُقال تقليديًا إنها ضمّت الحدائق المعلقة، إحدى عجائب الدنيا السبع؟', 'بابل'),

  ('History', 600, 'Which Mamluk sultan of Egypt won the Battle of Ain Jalut in 1260?', 'Qutuz (Saif al-Din Qutuz)',
   'أي سلطان مملوكي لمصر انتصر في معركة عين جالوت عام 1260؟', 'سيف الدين قطز'),
  ('History', 600, 'Which French scholar announced in 1822 that he had deciphered ancient Egyptian writing?', 'Jean-Francois Champollion',
   'أي عالم فرنسي أعلن عام 1822 أنه فك رموز الكتابة المصرية القديمة؟', 'جان فرانسوا شامبليون'),

  ('Sports', 100, 'In football (soccer), which player is the only one allowed to handle the ball inside his own penalty area?', 'The goalkeeper',
   'في كرة القدم، من هو اللاعب الوحيد المسموح له بلمس الكرة بيديه داخل منطقة جزاء فريقه؟', 'حارس المرمى'),
  ('Sports', 100, 'Which boxer, born Cassius Clay, called himself "The Greatest"?', 'Muhammad Ali',
   'أي ملاكم، وُلد باسم كاسيوس كلاي، أطلق على نفسه لقب "الأعظم"؟', 'محمد علي كلاي'),
  ('Sports', 100, 'In which sport do two teams of six players hit a ball over a high net using their hands and arms?', 'Volleyball',
   'في أي رياضة يضرب فريقان من ستة لاعبين الكرة فوق شبكة عالية بأيديهم وأذرعهم؟', 'الكرة الطائرة'),
  ('Sports', 100, 'How often are the Summer Olympic Games normally held?', 'Every four years',
   'كل كم سنة تُقام الألعاب الأولمبية الصيفية عادةً؟', 'كل أربع سنوات'),

  ('Sports', 200, 'Which Spanish football club has played its home games at the Bernabeu stadium since 1947?', 'Real Madrid',
   'أي نادٍ إسباني لكرة القدم يلعب مبارياته على أرضه في ملعب "البرنابيو" منذ عام 1947؟', 'ريال مدريد'),
  ('Sports', 200, 'Which American swimmer won eight gold medals at the 2008 Beijing Olympics?', 'Michael Phelps',
   'أي سبّاح أمريكي فاز بثماني ميداليات ذهبية في أولمبياد بكين 2008؟', 'مايكل فيلبس'),
  ('Sports', 200, 'Which basketball legend led the Chicago Bulls to six NBA championships in the 1990s?', 'Michael Jordan',
   'أي أسطورة في كرة السلة قاد فريق شيكاغو بولز للفوز بست بطولات في دوري NBA خلال التسعينيات؟', 'مايكل جوردان'),
  ('Sports', 200, 'In which sport do you score a "strike" by knocking down all ten pins with your first ball?', 'Bowling (ten-pin bowling)',
   'في أي رياضة تحقق "سترايك" عندما تُسقط الأقماع العشرة كلها برميتك الأولى؟', 'البولينج'),

  ('Sports', 300, 'Which Brazilian footballer, known by a single name, won the World Cup three times, in 1958, 1962 and 1970?', 'Pele',
   'أي لاعب كرة قدم برازيلي، يُعرف باسم واحد فقط، فاز بكأس العالم ثلاث مرات، في 1958 و1962 و1970؟', 'بيليه'),
  ('Sports', 300, 'Which Swiss tennis player won the Wimbledon men''s singles title eight times?', 'Roger Federer',
   'أي لاعب تنس سويسري فاز بلقب فردي الرجال في بطولة ويمبلدون ثماني مرات؟', 'روجر فيدرر'),
  ('Sports', 300, 'Which city hosted the 2016 Summer Olympics, the first Games held in South America?', 'Rio de Janeiro',
   'أي مدينة استضافت الألعاب الأولمبية الصيفية عام 2016، أول دورة أولمبية تُقام في أمريكا الجنوبية؟', 'ريو دي جانيرو'),

  ('Sports', 400, 'Which French football star was sent off for headbutting Marco Materazzi in the 2006 World Cup final?', 'Zinedine Zidane',
   'أي نجم كرة قدم فرنسي طُرد بسبب نطحه للإيطالي ماركو ماتيراتزي في نهائي كأس العالم 2006؟', 'زين الدين زيدان'),
  ('Sports', 400, 'In tennis, what is the term for a score of 40-40 in a game?', 'Deuce',
   'في التنس، ما المصطلح الذي يُطلق على نتيجة 40-40 في الشوط؟', '"ديوس" (Deuce)'),

  ('Sports', 500, 'Which Dutch football club, famous for "Total Football", won three European Cups in a row from 1971 to 1973?', 'Ajax (Ajax Amsterdam)',
   'أي نادٍ هولندي لكرة القدم، اشتهر بأسلوب "الكرة الشاملة"، فاز بكأس أوروبا للأندية الأبطال ثلاث مرات متتالية من 1971 إلى 1973؟', 'أياكس أمستردام'),

  ('Sports', 600, 'In which sport did Egypt''s Ahmed Elgendy win Olympic gold at the Paris 2024 Games?', 'Modern pentathlon',
   'في أي رياضة فاز المصري أحمد الجندي بالميدالية الذهبية في أولمبياد باريس 2024؟', 'الخماسي الحديث'),

  ('Movies', 100, 'Which film series features Luke Skywalker, Darth Vader and the Jedi Knights?', 'Star Wars',
   'أي سلسلة أفلام تضم شخصيات لوك سكايووكر ودارث فيدر وفرسان الجيداي؟', 'حرب النجوم (Star Wars)'),
  ('Movies', 100, 'In "Toy Story", what is the name of the space ranger toy who says "To infinity and beyond!"?', 'Buzz Lightyear',
   'في فيلم "حكاية لعبة"، ما اسم لعبة حارس الفضاء التي تقول "إلى اللانهاية وما بعدها!"؟', 'باز لايتيير (Buzz Lightyear)'),
  ('Movies', 100, 'Which 1992 Disney film features a street boy from Agrabah, a magic lamp and a wish-granting Genie?', 'Aladdin',
   'أي فيلم من ديزني صدر عام 1992 يحكي عن فتى شوارع من مدينة "أغرابا" ومصباح سحري وجني يحقق الأمنيات؟', 'علاء الدين'),
  ('Movies', 100, 'Which Hollywood star, nicknamed "The Rock", was a famous wrestler before becoming an actor?', 'Dwayne Johnson',
   'أي نجم هوليوودي، يُلقب بـ"ذا روك" (الصخرة)، كان مصارعًا مشهورًا قبل أن يصبح ممثلًا؟', 'دوين جونسون'),

  ('Movies', 200, 'Which 2001 Pixar film is set in a city powered by the screams of children frightened by monsters?', 'Monsters, Inc.',
   'أي فيلم من إنتاج بيكسار عام 2001 تدور أحداثه في مدينة تستمد طاقتها من صرخات الأطفال الذين تخيفهم الوحوش؟', 'شركة المرعبين المحدودة (Monsters, Inc.)'),

  ('Movies', 300, 'Which Australian actor won a posthumous Oscar for playing the Joker in a 2008 film?', 'Heath Ledger',
   'أي ممثل أسترالي فاز بجائزة الأوسكار بعد وفاته عن دور "الجوكر" في فيلم صدر عام 2008؟', 'هيث ليدجر'),
  ('Movies', 300, 'Which director made "Inception" (2010), "Interstellar" (2014) and "Oppenheimer" (2023)?', 'Christopher Nolan',
   'أي مخرج قدّم أفلام "إنسبشن" (2010) و"إنترستيلر" (2014) و"أوبنهايمر" (2023)؟', 'كريستوفر نولان'),

  ('Movies', 400, 'Which actress played Hermione Granger in all eight Harry Potter films?', 'Emma Watson',
   'أي ممثلة أدت دور "هيرميون غرينجر" في أفلام هاري بوتر الثمانية؟', 'إيما واتسون'),

  ('Technology', 100, 'Which free online encyclopedia, launched in 2001, can be edited by anyone?', 'Wikipedia',
   'أي موسوعة مجانية على الإنترنت، أُطلقت عام 2001، يمكن لأي شخص تعديل مقالاتها؟', 'ويكيبيديا'),
  ('Technology', 100, 'Which tablet computer did Steve Jobs unveil in January 2010?', 'The iPad',
   'ما اسم الحاسوب اللوحي الذي كشف عنه ستيف جوبز في يناير 2010؟', 'آيباد (iPad)'),
  ('Technology', 100, 'What do we call a harmful program that copies itself and spreads from one computer to another?', 'A computer virus',
   'ماذا نسمي البرنامج الضار الذي ينسخ نفسه وينتشر من حاسوب إلى آخر؟', 'فيروس الحاسوب'),
  ('Technology', 100, 'Which keyboard key do you hold down to type a capital letter?', 'Shift',
   'أي مفتاح في لوحة المفاتيح تضغط عليه مع الحرف لكتابته بالحرف الإنجليزي الكبير؟', 'مفتاح Shift'),
  ('Technology', 100, 'What does "PC" stand for?', 'Personal computer',
   'ماذا يعني الاختصار "PC"؟', 'الحاسوب الشخصي (Personal Computer)'),

  ('Technology', 200, 'What does "SMS" stand for, the service used to send text messages between phones?', 'Short Message Service (accept Short Messaging Service)',
   'ماذا يعني الاختصار "SMS"، الخدمة المستخدمة لإرسال الرسائل النصية بين الهواتف؟', 'خدمة الرسائل القصيرة (Short Message Service)'),
  ('Technology', 200, 'Which American inventor gave us the phonograph in 1877 and a long-lasting electric light bulb in 1879?', 'Thomas Edison',
   'أي مخترع أمريكي قدّم للعالم الفونوغراف عام 1877 ومصباحًا كهربائيًا يدوم طويلًا عام 1879؟', 'توماس إديسون'),
  ('Technology', 200, 'Which Finnish company made the famous 3310 mobile phone, released in 2000?', 'Nokia',
   'أي شركة فنلندية صنعت هاتف 3310 المحمول الشهير، الذي صدر عام 2000؟', 'نوكيا'),

  ('Technology', 300, 'Which Chinese e-commerce giant did Jack Ma co-found in 1999?', 'Alibaba (Alibaba Group)',
   'أي عملاق صيني للتجارة الإلكترونية شارك جاك ما في تأسيسه عام 1999؟', 'علي بابا'),
  ('Technology', 300, 'What are the small files that websites save in your browser to remember you, named after a sweet snack?', 'Cookies',
   'ما اسم الملفات الصغيرة التي تحفظها المواقع في متصفحك لتتذكرك، وتحمل اسم نوع من الحلويات؟', 'الكوكيز (ملفات تعريف الارتباط)'),

  ('Technology', 400, 'In a web address starting with "https", what does the letter "s" stand for?', 'Secure',
   'في عنوان الموقع الذي يبدأ بـ"https"، ماذا يعني الحرف "s"؟', 'آمن (Secure)'),
  ('Technology', 400, 'What do the letters of the computer company "IBM" stand for?', 'International Business Machines',
   'ماذا تعني حروف اسم شركة الحواسيب "IBM"؟', 'International Business Machines (آلات الأعمال الدولية)'),
  ('Technology', 400, 'Which storage disk, usually holding 1.44 MB, is still used as the "Save" icon in many programs?', 'The floppy disk',
   'أي قرص تخزين، كان يتسع عادةً لـ1.44 ميغابايت، لا يزال يُستخدم رمزًا لزر "حفظ" في كثير من البرامج؟', 'القرص المرن (الفلوبي ديسك)'),

  ('Gen Z', 100, 'In Gen Z slang, made popular by the game "Among Us", what does calling someone "sus" mean?', 'Suspicious (accept suspect, shady)',
   'في عامية الجيل Z التي انتشرت بفضل لعبة "Among Us"، ماذا يعني أن تصف شخصًا بأنه "sus"؟', 'مشبوه (يُقبل: مريب)'),
  ('Gen Z', 100, 'Which Colombian singer performed "Waka Waka (This Time for Africa)", the official song of the 2010 FIFA World Cup?', 'Shakira',
   'أي مغنية كولومبية قدّمت أغنية "Waka Waka (This Time for Africa)"، الأغنية الرسمية لكأس العالم 2010؟', 'شاكيرا'),
  ('Gen Z', 100, 'Which cartoon character lives in a pineapple under the sea in Bikini Bottom?', 'SpongeBob SquarePants (accept SpongeBob)',
   'أي شخصية كرتونية تعيش داخل ثمرة أناناس تحت البحر في مدينة "بيكيني بوتوم"؟', 'سبونج بوب'),
  ('Gen Z', 100, 'Which online platform lets players create and play millions of games, and uses a currency called Robux?', 'Roblox',
   'أي منصة إلكترونية تتيح للاعبين صنع ملايين الألعاب ولعبها، وتستخدم عملة اسمها "Robux"؟', 'روبلوكس (Roblox)'),
  ('Gen Z', 100, 'What is the # symbol called when it is used to tag a topic on social media?', 'A hashtag',
   'ما اسم الرمز # عندما يُستخدم لوسم موضوع على مواقع التواصل الاجتماعي؟', 'هاشتاج (وسم)'),

  ('Gen Z', 200, 'In video captions like "POV: you are the new kid at school", what does "POV" stand for?', 'Point of view',
   'في تعليقات الفيديوهات مثل "POV: أنت الطالب الجديد في المدرسة"، ماذا يعني الاختصار "POV"؟', 'وجهة النظر (Point of view)'),
  ('Gen Z', 200, 'In the 2022 Netflix series, which daughter of the Addams family solves a murder mystery at Nevermore Academy?', 'Wednesday (accept Wednesday Addams)',
   'في مسلسل نتفليكس عام 2022، أي ابنة لعائلة آدامز تحل لغز جرائم قتل في أكاديمية "نيفرمور"؟', 'وينزداي (وينزداي آدامز)'),
  ('Gen Z', 200, 'In which endless-running phone game does a graffiti artist dash along train tracks to escape an inspector and his dog?', 'Subway Surfers',
   'في أي لعبة جري لا تنتهي على الهاتف يهرب رسّام جرافيتي على قضبان القطارات من مفتش وكلبه؟', 'صب واي سيرفرس (Subway Surfers)'),
  ('Gen Z', 200, 'Which small three-armed spinning toy was the must-have school craze of 2017?', 'The fidget spinner',
   'أي لعبة صغيرة دوّارة بثلاث أذرع كانت هوس طلاب المدارس عام 2017؟', 'الفيدجت سبينر (Fidget spinner)'),

  ('Gen Z', 300, 'In slang, if someone tells you to "spill the tea", what do they want you to share?', 'Gossip (accept the latest news, the secrets, the truth)',
   'في العامية، إذا قال لك أحدهم "spill the tea"، ماذا يريدك أن تحكي له؟', 'النميمة وآخر الأخبار (يُقبل: الأسرار، الحقيقة)'),
  ('Gen Z', 300, 'Which 2012 song by PSY, famous for its horse-riding dance, became the first YouTube video to reach one billion views?', 'Gangnam Style',
   'أي أغنية للمغني "ساي" عام 2012، تشتهر برقصة ركوب الخيل، أصبحت أول فيديو على يوتيوب يصل إلى مليار مشاهدة؟', 'جانجنام ستايل (Gangnam Style)'),
  ('Gen Z', 300, 'Which anime ninja in an orange outfit dreams of becoming Hokage, the leader of the Hidden Leaf Village?', 'Naruto (accept Naruto Uzumaki)',
   'أي نينجا في الأنمي يرتدي زيًا برتقاليًا ويحلم بأن يصبح "الهوكاجي"، قائد قرية "الورقة المخفية"؟', 'ناروتو (ناروتو أوزوماكي)'),

  ('Gen Z', 400, 'Which hugely addictive 2013 phone game, where you tap to fly a bird between green pipes, was pulled from app stores by its creator in 2014?', 'Flappy Bird',
   'أي لعبة هاتف شديدة الإدمان صدرت عام 2013، تنقر فيها لتطير بعصفور بين أنابيب خضراء، سحبها صانعها من متاجر التطبيقات عام 2014؟', 'فلابي بيرد (Flappy Bird)'),
  ('Gen Z', 400, 'In 2015, Oxford Dictionaries chose an emoji instead of a word as its Word of the Year. Which emoji was it?', 'Face with Tears of Joy (accept the laughing-crying emoji)',
   'في عام 2015، اختارت قواميس أكسفورد رمزًا تعبيريًا (إيموجي) بدلًا من كلمة ليكون كلمة العام. أي إيموجي كان؟', 'الوجه الضاحك بدموع الفرح 😂'),

  ('Gen Z', 500, 'What name is given to the Egyptian street-music style, full of auto-tune and electronic beats, made famous by songs like "Bent El Geran"?', 'Mahraganat (accept mahragan, electro-shaabi)',
   'ما اسم نوع موسيقى الشارع المصرية، المليء بالأوتوتيون والإيقاعات الإلكترونية، الذي اشتهر بأغانٍ مثل "بنت الجيران"؟', 'المهرجانات'),

  ('Gen Z', 600, 'What was the name of the 2013 viral video craze in which one masked person dances alone until the bass drops and the whole room goes wild?', 'The Harlem Shake',
   'ما اسم موجة الفيديوهات المنتشرة عام 2013 التي يرقص فيها شخص مقنّع وحده، ثم عند ارتفاع الإيقاع ينفجر الجميع في الرقص؟', 'هارلم شيك (Harlem Shake)'),

  ('AI', 100, 'In which 1984 film does Arnold Schwarzenegger play a killer robot sent back in time by an evil AI?', 'The Terminator (accept Terminator)',
   'في أي فيلم عام 1984 يلعب أرنولد شوارزنيجر دور روبوت قاتل يرسله ذكاء اصطناعي شرير عبر الزمن إلى الماضي؟', 'المدمر (The Terminator)'),
  ('AI', 100, 'What do we call a small flying robot, often with a camera, that can film from the sky and even follow you by itself?', 'A drone',
   'ماذا نسمي الروبوت الطائر الصغير، الذي يحمل كاميرا غالبًا، ويصوّر من السماء بل ويتبعك وحده؟', 'طائرة درون (طائرة بدون طيار)'),
  ('AI', 100, 'During video calls on apps like Microsoft Teams or Google Meet, AI can blur or replace which part of your picture?', 'The background',
   'أثناء مكالمات الفيديو على تطبيقات مثل Microsoft Teams أو Google Meet، أي جزء من الصورة يستطيع الذكاء الاصطناعي أن يطمسه أو يستبدله؟', 'الخلفية'),

  ('AI', 200, 'Early AI image makers were famous for one funny mistake when drawing people. They often gave them too many what?', 'Fingers',
   'اشتهرت أدوات رسم الصور بالذكاء الاصطناعي في بداياتها بخطأ مضحك عند رسم البشر، فكثيرًا ما كانت تعطيهم عددًا زائدًا من ماذا؟', 'الأصابع'),
  ('AI', 200, 'In which 2004 film does Will Smith play a Chicago detective who distrusts the helpful robots of the year 2035?', 'I, Robot',
   'في أي فيلم عام 2004 يلعب ويل سميث دور محقق في شيكاغو لا يثق في الروبوتات المساعدة في عام 2035؟', 'أنا روبوت (I, Robot)'),

  ('AI', 300, 'Which British TV series of stand-alone episodes, now on Netflix, is famous for dark stories about where technology could take us?', 'Black Mirror',
   'أي مسلسل بريطاني بحلقات منفصلة، يُعرض الآن على نتفليكس، يشتهر بقصص قاتمة عما قد تقودنا إليه التكنولوجيا؟', 'المرآة السوداء (Black Mirror)'),
  ('AI', 300, 'What was the nickname of the cartoon paperclip assistant that popped up in old versions of Microsoft Office?', 'Clippy (accept Clippit)',
   'ما اسم الدلع لمشبك الورق الكرتوني المساعد الذي كان يظهر في الإصدارات القديمة من برامج مايكروسوفت أوفيس؟', 'كليبي (Clippy)'),
  ('AI', 300, 'Which car safety feature uses a camera to watch the road markings and gently steers you back if you drift out of your lane?', 'Lane keeping assist (accept lane assist, lane keep assist)',
   'أي ميزة أمان في السيارات تستخدم كاميرا لمراقبة خطوط الطريق، وتعيد توجيه السيارة بلطف إذا انحرفت عن حارتك؟', 'مساعد الحفاظ على الحارة (Lane assist)'),

  ('AI', 400, 'What do we call the huge buildings full of computer servers where AI systems are trained and run?', 'Data centres (accept data centers, server farms)',
   'ماذا نسمي المباني الضخمة المليئة بخوادم الكمبيوتر التي تُدرَّب فيها أنظمة الذكاء الاصطناعي وتعمل؟', 'مراكز البيانات'),

  ('AI', 600, 'Which University of Toronto scientist, often called a "godfather of AI", shared the 2024 Nobel Prize in Physics?', 'Geoffrey Hinton',
   'أي عالم في جامعة تورونتو، يُلقَّب غالبًا بأحد "آباء الذكاء الاصطناعي"، تقاسم جائزة نوبل في الفيزياء عام 2024؟', 'جيفري هينتون'),
  ('AI', 600, 'What does "GPU" stand for, the type of computer chip most used to train AI?', 'Graphics processing unit',
   'ماذا يعني الاختصار "GPU"، نوع رقائق الكمبيوتر الأكثر استخدامًا في تدريب الذكاء الاصطناعي؟', 'وحدة معالجة الرسوميات (Graphics processing unit)'),

  ('Egyptians', 100, 'In which 1999 comedy does Mohamed Henedy play a jobless young man who travels to the Netherlands to start a new life?', 'Hamam fi Amsterdam (Hamam in Amsterdam)',
   'في أي فيلم كوميدي عام 1999 يلعب محمد هنيدي دور شاب عاطل يسافر إلى هولندا ليبدأ حياة جديدة؟', 'همام في أمستردام'),
  ('Egyptians', 100, 'Which singer and actor wrote and starred in the 2007 film "Omar w Salma", playing the college playboy Omar?', 'Tamer Hosny',
   'أي مطرب وممثل كتب فيلم "عمر وسلمى" عام 2007 وقام ببطولته في دور الشاب الجامعي العابث "عمر"؟', 'تامر حسني'),
  ('Egyptians', 100, 'What is the name of the gossipy widow puppet who became an Egyptian TV star, with her own show on CBC from 2014?', 'Abla Fahita',
   'ما اسم الدمية الأرملة كثيرة الكلام عن الناس التي أصبحت نجمة تلفزيونية في مصر، ولها برنامج خاص على قناة CBC منذ عام 2014؟', 'أبلة فاهيتا'),
  ('Egyptians', 100, 'Complete the Egyptian proverb, meaning live within your means: "Ala ad lehafak ..." ("As far as your blanket reaches ...")', 'Med reglek ("... stretch your legs"): "Ala ad lehafak med reglek"',
   'أكمل المثل المصري: "على قد لحافك ..."', 'مد رجليك ("على قد لحافك مد رجليك")'),
  ('Egyptians', 100, 'In the 2007 comedy "Keda Reda", Ahmed Helmy plays identical brothers who pretend to be one man called Reda. How many brothers are there?', 'Three (triplets)',
   'في الفيلم الكوميدي "كده رضا" عام 2007، يلعب أحمد حلمي دور إخوة متطابقين يتظاهرون بأنهم رجل واحد اسمه رضا. كم عدد الإخوة؟', 'ثلاثة (توائم ثلاثة)'),

  ('Egyptians', 200, 'Which 2015 action film follows four brothers from a poor Cairo district, led by Ahmed Ezz, who live as thieves?', 'Welad Rizk (Sons of Rizk)',
   'أي فيلم أكشن عام 2015 يتابع أربعة إخوة من حي فقير في القاهرة، بقيادة أحمد عز، يعيشون على السرقة؟', 'ولاد رزق'),
  ('Egyptians', 200, 'Which action star, known for doing his own stunts, played the title role in "Ibrahim Labyad" (2009) and starred in "Mafia" (2002)?', 'Ahmed El Sakka',
   'أي نجم أكشن، معروف بأدائه المشاهد الخطرة بنفسه، لعب دور البطولة في فيلم "إبراهيم الأبيض" (2009) وفيلم "مافيا" (2002)؟', 'أحمد السقا'),
  ('Egyptians', 200, 'Which TV comedy-theatre show, led by Ashraf Abdel Baky from 2014, made stars of young actors like Ali Rabie and Mostafa Khater?', 'Masrah Masr (accept Teatro Masr, its earlier name)',
   'أي عرض مسرحي كوميدي تلفزيوني، بقيادة أشرف عبد الباقي منذ عام 2014، صنع نجومية ممثلين شباب مثل علي ربيع ومصطفى خاطر؟', 'مسرح مصر (يُقبل: تياترو مصر، اسمه الأول)'),
  ('Egyptians', 200, 'Complete the Egyptian saying, meaning "that will never happen": "Bokra fel ..." ("Tomorrow, in ...")', 'Meshmesh ("... apricot season"): "Bokra fel-meshmesh"',
   'أكمل المثل المصري: "بكرة في ..."', 'المشمش ("بكرة في المشمش")'),
  ('Egyptians', 200, 'In Samir Ghanem''s Ramadan riddle shows (Fawazir) of the 1980s, what was the name of his tiny character in a green suit and huge yellow shoes?', 'Fatouta',
   'في فوازير رمضان التي قدّمها سمير غانم في الثمانينيات، ما اسم شخصيته الصغيرة جدًا ذات البدلة الخضراء والحذاء الأصفر الضخم؟', 'فطوطة'),

  ('Egyptians', 300, 'Which 2007 film follows Mansour El Hefny, who takes over as ruler of an island community in Upper Egypt after his father dies?', 'El Gezira (The Island)',
   'أي فيلم عام 2007 يتابع منصور الحفني، الذي يصبح كبير جزيرة في صعيد مصر بعد وفاة أبيه؟', 'الجزيرة'),
  ('Egyptians', 300, 'Which Tunisian-born actress plays Ola, a Cairo pharmacist desperate to marry before she turns 30, in the 2010 series "Ayza Atgawez"?', 'Hend Sabry',
   'أي ممثلة تونسية الأصل تلعب دور "علا"، الصيدلانية القاهرية التي تريد الزواج قبل أن تبلغ الثلاثين، في مسلسل "عايزة أتجوز" عام 2010؟', 'هند صبري'),
  ('Egyptians', 300, 'In which 2024 Ramadan series is the story told of Hassan el-Sabbah, the 11th-century leader of a secret sect of assassins?', 'El Hashashin (The Assassins)',
   'في أي مسلسل رمضاني عام 2024 تُروى قصة حسن الصباح، زعيم طائفة سرية من القتلة في القرن الحادي عشر؟', 'الحشاشين'),
  ('Egyptians', 300, 'Complete the Egyptian proverb, meaning once bitten, twice shy: "Elli yetlesa'' men el-shorba ..." ("Whoever gets burned by the soup ...")', 'Yenfokh fel-zabady ("... blows on the yoghurt"): "Elli yetlesa'' men el-shorba yenfokh fel-zabady"',
   'أكمل المثل المصري: "اللي يتلسع من الشوربة ..."', 'ينفخ في الزبادي ("اللي يتلسع من الشوربة ينفخ في الزبادي")'),
  ('Egyptians', 300, 'In "El Feel El Azraq", what is the first name of the psychiatrist played by Karim Abdel Aziz?', 'Yehia (Dr. Yehia Rashed)',
   'في فيلم "الفيل الأزرق"، ما الاسم الأول للطبيب النفسي الذي أداه كريم عبد العزيز؟', 'يحيى (د. يحيى راشد)'),

  ('Egyptians', 400, 'Which 1968 comedy, based on a Youssef El-Sebai novel, follows a clerk who buys pills of good and bad morals from a strange shop?', 'Ard El Nefaq (Land of Hypocrisy)',
   'أي فيلم كوميدي عام 1968، مأخوذ عن رواية ليوسف السباعي، يتابع موظفًا يشتري حبوبًا للأخلاق الحسنة والسيئة من محل غريب؟', 'أرض النفاق'),
  ('Egyptians', 400, 'Which actor created and starred as Wanees, a father determined to raise his children on good values, in the 1994 series "Yawmeyat Wanees"?', 'Mohamed Sobhi',
   'أي ممثل قدّم شخصية "ونيس"، الأب المصمم على تربية أبنائه على القيم، في مسلسل "يوميات ونيس" عام 1994؟', 'محمد صبحي'),
  ('Egyptians', 400, 'In which 1985 comedy play does a man on the run hide in a rich family''s house, where his uncle is the cook, and end up as the daughter''s stand-in husband?', 'El Wad Sayed El Shaghal (Sayed the Servant Boy)',
   'في أي مسرحية كوميدية عام 1985 يختبئ رجل هارب في بيت عائلة ثرية يعمل خاله طباخًا فيه، وينتهي به الأمر "محللًا" لابنة صاحب البيت؟', 'الواد سيد الشغال'),
  ('Egyptians', 400, 'Complete the Egyptian proverb, said when someone ruins what they tried to fix: "Gah yekahhalha ..." ("He came to put kohl on her eyes ...")', 'Amaha ("... and blinded her"): "Gah yekahhalha amaha"',
   'أكمل المثل المصري: "جه يكحلها ..."', 'عماها ("جه يكحلها عماها")'),

  ('Egyptians', 500, 'Which actress was so famous for playing the meddling mother-in-law that films such as "Hamati Malak" (My Mother-in-Law Is an Angel) were built around her?', 'Mary Mounib',
   'أي ممثلة اشتهرت بدور الحماة المتدخلة حتى صُنعت حولها أفلام مثل "حماتي ملاك"؟', 'ماري منيب'),
  ('Egyptians', 500, 'Complete the Egyptian proverb, meaning punish one person to scare the rest: "Edrab el-marbout ..." ("Beat the tied-up one ...")', 'Yekhaf el-sayeb ("... and the loose one will be scared"): "Edrab el-marbout yekhaf el-sayeb"',
   'أكمل المثل المصري: "اضرب المربوط ..."', 'يخاف السايب ("اضرب المربوط يخاف السايب")'),
  ('Egyptians', 500, 'In the 1957 comedy "Ibn Hamido", the fishermen''s chief Hanafi boasts that his word never falls to the ground, then gives in to his wife. What famous phrase does he say?', '"Khalas, tenzel el-marra di" ("Fine, it falls this time")',
   'في الفيلم الكوميدي "ابن حميدو" عام 1957، يتفاخر الريس حنفي بأن كلمته لا تنزل الأرض أبدًا، ثم يرضخ لزوجته. ما العبارة الشهيرة التي يقولها؟', '"خلاص، تنزل المرة دي"'),

  ('Egyptians', 600, 'Which actor, who played hundreds of roles, was nicknamed "Shareer El Shasha" (the Villain of the Screen) and "the Anthony Quinn of the East"?', 'Mahmoud El-Meligy',
   'أي ممثل، أدى مئات الأدوار، لُقّب بـ"شرير الشاشة" و"أنتوني كوين الشرق"؟', 'محمود المليجي'),
  ('Egyptians', 600, 'Which 1980 spy series tells the story of Gomaa El Shawan, an Egyptian double agent who fooled Israel''s Mossad?', 'Domoo'' fi Oyoon Waqiha (Tears in Insolent Eyes)',
   'أي مسلسل جاسوسية عام 1980 يحكي قصة جمعة الشوان، العميل المزدوج المصري الذي خدع الموساد الإسرائيلي؟', 'دموع في عيون وقحة'),
  ('Egyptians', 600, 'Complete the Egyptian proverb, about a mother who scolds her son but will not let others wish him harm: "Ad''i ala ebni ..." ("I pray against my son ...")', 'W''akrah elli ye''ool amin ("... and hate whoever says amen"): "Ad''i ala ebni w''akrah elli ye''ool amin"',
   'أكمل المثل المصري: "أدعي على ابني ..."', 'وأكره اللي يقول آمين ("أدعي على ابني وأكره اللي يقول آمين")');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar
  FROM general_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS general_seed;

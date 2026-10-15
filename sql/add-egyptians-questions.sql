-- BrainRush: Egyptians question set (owner request 2026-10-15)
--
-- Adds a new "Egyptians" category with 56 questions (100-600; 10 per point value,
-- except 9 at 400 and 7 at 600): 7 on Egyptian films, 9 on Egyptian actors and
-- actresses, 6 on Egyptian plays, 6 on Egyptian TV series, 18 on the story and
-- characters of films, plays and series (one of each per point value), and 10
-- "complete the proverb" questions on Egyptian proverbs. A proverb question gives the start of the proverb and the answer is its ending;
-- the English text has the proverb in Latin letters with a translation. Every
-- row comes with its Arabic question and answer.
--
-- Requires sql/migrate-add-arabic.sql (or a schema that already has question_ar /
-- answer_ar). Run it on whichever database is selected (there is no USE line):
--   local:   mysql -u root brainrush < sql/add-egyptians-questions.sql
--   hosted:  phpMyAdmin -> select the database -> Import this file
-- It is safe to run again. The Egyptians category is created only if it does not
-- exist. A row is skipped when its point value does not exist, or when the
-- category already has that question (INSERT IGNORE + uq_category_question).

SET NAMES utf8mb4;

INSERT IGNORE INTO categories (name) VALUES ('Egyptians');

DROP TEMPORARY TABLE IF EXISTS egyptians_seed;

CREATE TEMPORARY TABLE egyptians_seed (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  points        INT UNSIGNED NOT NULL,
  question      TEXT         NOT NULL,
  answer        TEXT         NOT NULL,
  question_ar   TEXT         NOT NULL,
  answer_ar     TEXT         NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

INSERT INTO egyptians_seed (category_name, points, question, answer, question_ar, answer_ar) VALUES
  ('Egyptians', 100, 'In which 1998 Mohamed Henedy comedy does a young man from Upper Egypt win a scholarship to a famous university in Cairo?', 'Saidi fil Gamaa El Amrekeya (An Upper Egyptian at the American University)',
   'في أي فيلم كوميدي لمحمد هنيدي عام 1998 يحصل شاب من الصعيد على منحة للدراسة في جامعة شهيرة بالقاهرة؟', 'صعيدي في الجامعة الأمريكية'),
  ('Egyptians', 100, 'Which comedy star had a whole series of films named after him, such as "... in the Army", "... in the Police" and "... in the Navy"?', 'Ismail Yassin',
   'أي نجم كوميدي حملت سلسلة كاملة من الأفلام اسمه، مثل "... في الجيش" و"... في البوليس" و"... في الأسطول"؟', 'إسماعيل ياسين'),
  ('Egyptians', 100, 'Which Egyptian actor played the title role in the 1965 Hollywood film "Doctor Zhivago"?', 'Omar Sharif',
   'أي ممثل مصري لعب دور البطولة في الفيلم الهوليوودي "دكتور زيفاجو" عام 1965؟', 'عمر الشريف'),
  ('Egyptians', 100, 'Complete the Egyptian proverb, said about shameless people: "Elli ekhtasho ..." ("Those who felt shame ...")', 'Mato ("... died"): "Elli ekhtasho mato"',
   'أكمل المثل المصري: "اللي اختشوا ..."', 'ماتوا ("اللي اختشوا ماتوا")'),
  ('Egyptians', 100, 'Complete the Egyptian proverb, meaning every mother thinks her child is beautiful: "El-erd fi ein ommo ..." ("The monkey, in its mother''s eyes, is ...")', 'Ghazal ("... a gazelle"): "El-erd fi ein ommo ghazal"',
   'أكمل المثل المصري: "القرد في عين أمه ..."', 'غزال ("القرد في عين أمه غزال")'),
  ('Egyptians', 100, 'Which 1973 comedy play about a class of unruly students and their new teacher starred Adel Imam, Saeed Saleh and Younes Shalaby?', 'Madrasat El Moshaghebeen (School of Troublemakers)',
   'أي مسرحية كوميدية عام 1973 عن فصل من الطلاب المشاغبين ومعلمتهم الجديدة قام ببطولتها عادل إمام وسعيد صالح ويونس شلبي؟', 'مدرسة المشاغبين'),
  ('Egyptians', 100, 'In which comedy series does Ahmed Mekky play El Kebir, the mayor of the village of El Mazareeta?', 'El Kebir Awi',
   'في أي مسلسل كوميدي يلعب أحمد مكي دور "الكبير"، عمدة قرية المزاريطة؟', 'الكبير أوي'),
  ('Egyptians', 100, 'In the film "El Limby" (2002), what is the name of El Limby''s mother, played by Abla Kamel?', 'Faransa (France)',
   'في فيلم "اللمبي" (2002)، ما اسم أم اللمبي التي أدت دورها عبلة كامل؟', 'فرنسا'),
  ('Egyptians', 100, 'In the play "Madrasat El Moshaghebeen", which actor, as Morsi El Zanaty, shouts "Morsi ibn el-moallem El Zanaty ethazam ya regala!"?', 'Saeed Saleh',
   'في مسرحية "مدرسة المشاغبين"، أي ممثل، في دور مرسي الزناتي، يصيح: "مرسي ابن المعلم الزناتي اتهزم يا رجالة"؟', 'سعيد صالح'),
  ('Egyptians', 100, 'In the series "El Kebir Awi", what is the name of El Kebir''s twin brother, who grew up in America?', 'Johnny',
   'في مسلسل "الكبير أوي"، ما اسم الأخ التوأم للكبير الذي نشأ في أمريكا؟', 'جوني'),

  ('Egyptians', 200, 'Which 2002 comedy is named after the slurring, street-smart character played by Mohamed Saad?', 'El Limby',
   'أي فيلم كوميدي عام 2002 يحمل اسم الشخصية الشعبية ثقيلة اللسان التي أداها محمد سعد؟', 'اللمبي'),
  ('Egyptians', 200, 'In which 2010 Ahmed Helmy film does an Egyptian come home after 20 years in America and insist on using only his Egyptian passport?', 'Asal Eswed (Black Honey)',
   'في أي فيلم لأحمد حلمي عام 2010 يعود مصري إلى بلده بعد 20 عامًا في أمريكا ويصر على استخدام جواز سفره المصري فقط؟', 'عسل إسود'),
  ('Egyptians', 200, 'Which Egyptian actress is married to the comedian Ahmed Helmy?', 'Mona Zaki',
   'أي ممثلة مصرية متزوجة من الفنان الكوميدي أحمد حلمي؟', 'منى زكي'),
  ('Egyptians', 200, 'Which Egyptian actor calls himself "Number One", after his 2018 hit song of the same name?', 'Mohamed Ramadan',
   'أي ممثل مصري يلقب نفسه بـ"نمبر وان"، على اسم أغنيته الشهيرة عام 2018؟', 'محمد رمضان'),
  ('Egyptians', 200, 'Complete the Egyptian proverb, meaning children take after their parents: "Ibn el-wezz ..." ("The gosling is ...")', 'Awwam ("... a swimmer"): "Ibn el-wezz awwam"',
   'أكمل المثل المصري: "ابن الوز ..."', 'عوام ("ابن الوز عوام")'),
  ('Egyptians', 200, 'In which 1976 play does Adel Imam play Sarhan Abdel Basir, a naive man called as a witness after his neighbour is murdered?', 'Shahed Ma Shafsh Haga (A Witness Who Saw Nothing)',
   'في أي مسرحية عام 1976 يلعب عادل إمام دور سرحان عبد البصير، الرجل الساذج الذي يُستدعى للشهادة بعد مقتل جارته؟', 'شاهد ما شافش حاجة'),
  ('Egyptians', 200, 'Which Egyptian Ramadan cartoon follows a Nubian boy and his pet goat, Rashida?', 'Bakkar',
   'أي مسلسل كرتون مصري في رمضان يحكي عن طفل نوبي وعنزته "رشيدة"؟', 'بكار'),
  ('Egyptians', 200, 'In "Saidi fil Gamaa El Amrekeya", what is the first name of the Upper Egyptian student played by Mohamed Henedy?', 'Khalaf',
   'في فيلم "صعيدي في الجامعة الأمريكية"، ما الاسم الأول للطالب الصعيدي الذي أداه محمد هنيدي؟', 'خلف'),
  ('Egyptians', 200, 'In "Madrasat El Moshaghebeen", Younes Shalaby''s character Mansour is the son of which member of the school staff?', 'The headmaster (El Nazer, accept Abdel Moaty)',
   'في مسرحية "مدرسة المشاغبين"، شخصية منصور التي أداها يونس شلبي هي ابن مَن من العاملين في المدرسة؟', 'الناظر (يُقبل: عبد المعطي)'),
  ('Egyptians', 200, 'In "Lan A''eesh fi Gelbab Abi", what is the name of Abdel Ghafour El-Borai''s only son?', 'Abdel Wahab',
   'في مسلسل "لن أعيش في جلباب أبي"، ما اسم الابن الوحيد لعبد الغفور البرعي؟', 'عبد الوهاب'),

  ('Egyptians', 300, 'In which 2014 film, based on Ahmed Mourad''s novel, does Karim Abdel Aziz play a psychiatrist who returns to work in the "8 West" ward?', 'El Feel El Azraq (The Blue Elephant)',
   'في أي فيلم عام 2014، مأخوذ عن رواية أحمد مراد، يلعب كريم عبد العزيز دور طبيب نفسي يعود للعمل في قسم "8 غرب"؟', 'الفيل الأزرق'),
  ('Egyptians', 300, 'Which 1997 box-office hit, starring singer Mohamed Fouad with Mohamed Henedy, has the name of a Suez Canal city in its title?', 'Ismailia Rayeh Gay',
   'أي فيلم حقق نجاحًا كبيرًا عام 1997، من بطولة المطرب محمد فؤاد مع محمد هنيدي، يحمل عنوانه اسم مدينة على قناة السويس؟', 'إسماعيلية رايح جاي'),
  ('Egyptians', 300, 'Which actor played two Egyptian presidents, in "Nasser 56" (1996) and "Days of Sadat" (2001)?', 'Ahmed Zaki',
   'أي ممثل جسّد شخصية رئيسين مصريين، في فيلمي "ناصر 56" (1996) و"أيام السادات" (2001)؟', 'أحمد زكي'),
  ('Egyptians', 300, 'Complete the Egyptian proverb, said when someone judges without knowing the full story: "Elli ma ye''rafsh ye''ool ..." ("Whoever doesn''t know says ...")', '''Ads ("... lentils"): "Elli ma ye''rafsh ye''ool ''ads"',
   'أكمل المثل المصري: "اللي ما يعرفش يقول ..."', 'عدس ("اللي ما يعرفش يقول عدس")'),
  ('Egyptians', 300, 'Complete the Egyptian proverb, meaning getting into something is easier than getting out: "Dokhool el-hammam mesh zay ..." ("Going into the bathhouse is not like ...")', 'Khorogo ("... coming out of it"): "Dokhool el-hammam mesh zay khorogo"',
   'أكمل المثل المصري: "دخول الحمام مش زي ..."', 'خروجه ("دخول الحمام مش زي خروجه")'),
  ('Egyptians', 300, 'In which 1979 play, starring Saeed Saleh and Ahmed Zaki, do grown-up children scheme to stop their father from leaving their mother?', 'El Eyal Kebret (The Kids Grew Up)',
   'في أي مسرحية عام 1979، من بطولة سعيد صالح وأحمد زكي، يتآمر الأبناء الكبار لمنع أبيهم من ترك أمهم؟', 'العيال كبرت'),
  ('Egyptians', 300, 'Which actor plays the army officer Ahmed El Mansi in the 2020 Ramadan series "El Ekhtiyar" (The Choice)?', 'Amir Karara',
   'أي ممثل يلعب دور الضابط أحمد المنسي في مسلسل رمضان "الاختيار" عام 2020؟', 'أمير كرارة'),
  ('Egyptians', 300, 'In "Asal Eswed", what is the full name of the character played by Ahmed Helmy, a name that is itself a joke about being Egyptian?', 'Masry Sayed El Araby',
   'في فيلم "عسل إسود"، ما الاسم الكامل للشخصية التي أداها أحمد حلمي، وهو اسم يحمل في ذاته نكتة عن كونه مصريًا؟', 'مصري سيد العربي'),
  ('Egyptians', 300, 'In "Madrasat El Moshaghebeen", what is the full name of the troublemakers'' leader, played by Adel Imam?', 'Bahgat El Abasiry',
   'في مسرحية "مدرسة المشاغبين"، ما الاسم الكامل لزعيم الطلاب المشاغبين الذي أداه عادل إمام؟', 'بهجت الأباصيري'),
  ('Egyptians', 300, 'In "Lan A''eesh fi Gelbab Abi", what is the name of Abdel Ghafour El-Borai''s wife, played by Abla Kamel?', 'Fatma',
   'في مسلسل "لن أعيش في جلباب أبي"، ما اسم زوجة عبد الغفور البرعي التي أدت دورها عبلة كامل؟', 'فاطمة'),

  ('Egyptians', 400, 'Which 1991 film, named after a Cairo neighbourhood, stars Mahmoud Abdel Aziz as Sheikh Hosny, a blind man who behaves as if he can see?', 'El Kit Kat',
   'أي فيلم عام 1991، يحمل اسم حي في القاهرة، يلعب فيه محمود عبد العزيز دور الشيخ حسني، الرجل الكفيف الذي يتصرف كأنه يرى؟', 'الكيت كات'),
  ('Egyptians', 400, 'Which actress and singer, nicknamed "the Darling of Egyptian Cinema", sang the patriotic song "Ya Habibti Ya Masr"?', 'Shadia',
   'أي ممثلة ومطربة، لُقبت بـ"دلوعة السينما المصرية"، غنت الأغنية الوطنية "يا حبيبتي يا مصر"؟', 'شادية'),
  ('Egyptians', 400, 'Which Egyptian actor was nicknamed both "the Beast of the Screen" and "the King of the Third Class" (Malek El Terso)?', 'Farid Shawqi',
   'أي ممثل مصري لُقب بـ"وحش الشاشة" و"ملك الترسو"؟', 'فريد شوقي'),
  ('Egyptians', 400, 'Complete the Egyptian proverb, meaning stay away from trouble: "El-bab elli ygilak meno el-reeh ..." ("The door the wind comes to you through ...")', 'Seddo w''estereeh ("... close it and rest"): "El-bab elli ygilak meno el-reeh seddo w''estereeh"',
   'أكمل المثل المصري: "الباب اللي يجيلك منه الريح ..."', 'سده واستريح ("الباب اللي يجيلك منه الريح سده واستريح")'),
  ('Egyptians', 400, 'Which comedy play stars Fouad El-Mohandes as a strict father who worries about every young man who comes near his daughters?', 'Sek Ala Banatak',
   'أي مسرحية كوميدية يلعب فيها فؤاد المهندس دور أب صارم يقلق من كل شاب يقترب من بناته؟', 'سك على بناتك'),
  ('Egyptians', 400, 'In which 1996 series does Nour El-Sherif play Abdel Ghafour El-Borai, a poor scrap dealer who becomes a rich merchant?', 'Lan A''eesh fi Gelbab Abi',
   'في أي مسلسل عام 1996 يلعب نور الشريف دور عبد الغفور البرعي، تاجر الخردة الفقير الذي يصبح تاجرًا ثريًا؟', 'لن أعيش في جلباب أبي'),
  ('Egyptians', 400, 'In "El Feel El Azraq", which actor plays Sherif, the psychiatrist''s old friend accused of killing his wife?', 'Khaled El Sawy',
   'في فيلم "الفيل الأزرق"، أي ممثل يلعب دور شريف، الصديق القديم للطبيب النفسي والمتهم بقتل زوجته؟', 'خالد الصاوي'),
  ('Egyptians', 400, 'In the play "El Eyal Kebret", how many children does the father have?', '4 (three sons, Sultan, Kamal and Atef, and a daughter, Sahar)',
   'في مسرحية "العيال كبرت"، كم عدد أبناء الأب؟', '4 (ثلاثة أبناء: سلطان وكمال وعاطف، وابنة: سحر)'),
  ('Egyptians', 400, 'In "El Kebir Awi", what is the name of El Kebir''s wife, played by Donia Samir Ghanem?', 'Hedeya',
   'في مسلسل "الكبير أوي"، ما اسم زوجة الكبير التي أدت دورها دنيا سمير غانم؟', 'هدية'),

  ('Egyptians', 500, 'Which 1975 film, based on a Naguib Mahfouz novel, is named after the Cairo cafe whose young regulars are arrested by the secret police?', 'El Karnak',
   'أي فيلم عام 1975، مأخوذ عن رواية لنجيب محفوظ، يحمل اسم مقهى في القاهرة يعتقل البوليس السري رواده من الشباب؟', 'الكرنك'),
  ('Egyptians', 500, 'Which actor played Saladin in Youssef Chahine''s 1963 epic "El Nasser Salah El Din"?', 'Ahmed Mazhar',
   'أي ممثل لعب دور صلاح الدين في ملحمة يوسف شاهين "الناصر صلاح الدين" عام 1963؟', 'أحمد مظهر'),
  ('Egyptians', 500, 'Which Egyptian actress of the 1950s and 60s was nicknamed "the Marilyn Monroe of the East"?', 'Hend Rostom',
   'أي ممثلة مصرية من الخمسينيات والستينيات لُقبت بـ"مارلين مونرو الشرق"؟', 'هند رستم'),
  ('Egyptians', 500, 'Complete the Egyptian proverb, meaning old habits never die: "Yemoot el-zammar ..." ("The piper dies ...")', 'W''sawab''o betel''ab ("... and his fingers still play"): "Yemoot el-zammar w''sawab''o betel''ab"',
   'أكمل المثل المصري: "يموت الزمار ..."', 'وصوابعه بتلعب ("يموت الزمار وصوابعه بتلعب")'),
  ('Egyptians', 500, 'Complete the Egyptian proverb, meaning you cannot feel someone''s pain from a distance: "Elli eido fel-maya ..." ("The one whose hand is in the water ...")', 'Mesh zay elli eido fel-nar ("... is not like the one whose hand is in the fire")',
   'أكمل المثل المصري: "اللي إيده في المية ..."', 'مش زي اللي إيده في النار ("اللي إيده في المية مش زي اللي إيده في النار")'),
  ('Egyptians', 500, 'Which comedy play about two infamous Alexandria sisters, starring Shadia and Soheir El-Babli, was Shadia''s only stage play?', 'Raya w Sekina',
   'أي مسرحية كوميدية عن شقيقتين شهيرتين من الإسكندرية، من بطولة شادية وسهير البابلي، كانت المسرحية الوحيدة لشادية؟', 'ريا وسكينة'),
  ('Egyptians', 500, 'Which long-running series by Osama Anwar Okasha, named after a Cairo district, follows the rivalry between Saleem El-Badry and Soliman Ghanem?', 'Layali El Helmeya',
   'أي مسلسل طويل لأسامة أنور عكاشة، يحمل اسم حي في القاهرة، يتابع الصراع بين سليم البدري وسليمان غانم؟', 'ليالي الحلمية'),
  ('Egyptians', 500, 'In "El Kit Kat", what is the name of blind Sheikh Hosny''s son, played by Sherif Mounir?', 'Youssef',
   'في فيلم "الكيت كات"، ما اسم ابن الشيخ حسني الكفيف الذي أداه شريف منير؟', 'يوسف'),
  ('Egyptians', 500, 'In "El Eyal Kebret", Saeed Saleh has the famous line "Enta geet ya ...?" ("Are you back, ...?"). Complete it with the father''s first name.', 'Ramadan ("Enta geet ya Ramadan?")',
   'في مسرحية "العيال كبرت"، من أشهر إفيهات سعيد صالح: "انت جيت يا ...؟". أكملها باسم الأب.', 'رمضان ("انت جيت يا رمضان؟")'),
  ('Egyptians', 500, 'In "Layali El Helmeya", which actress plays Nazek El-Selehdar?', 'Safia El Emary',
   'في مسلسل "ليالي الحلمية"، أي ممثلة أدت دور نازك السلحدار؟', 'صفية العمري'),

  ('Egyptians', 600, 'Complete the Egyptian proverb, said about someone who has no luck: "Get el-hazina tefrah ..." ("The sad woman came to be happy ...")', 'Ma la''etlahash matrah ("... and found no place to do it")',
   'أكمل المثل المصري: "جت الحزينة تفرح ..."', 'ما لقيتلهاش مطرح ("جت الحزينة تفرح ما لقيتلهاش مطرح")'),
  ('Egyptians', 600, 'Complete the Egyptian proverb, a warning against marrying for money: "Ya wakhed el-erd ala malo ..." ("You who take the monkey for its money ...")', 'Yerooh el-mal w''yefdal el-erd ala haloh ("... the money goes and the monkey stays as it is")',
   'أكمل المثل المصري: "يا واخد القرد على ماله ..."', 'يروح المال ويفضل القرد على حاله ("يا واخد القرد على ماله يروح المال ويفضل القرد على حاله")'),
  ('Egyptians', 600, 'What was the name of the 1960s comedy trio of Samir Ghanem, George Sidhom and El-Deif Ahmed?', 'Tholathy Adwaa El Masrah (The Three Lights of the Theatre)',
   'ما اسم الفرقة الكوميدية الثلاثية في الستينيات المكونة من سمير غانم وجورج سيدهم والضيف أحمد؟', 'ثلاثي أضواء المسرح'),
  ('Egyptians', 600, 'The TV spy hero Raafat El-Haggan was based on a real Egyptian agent who lived undercover in Israel. What was the agent''s real name?', 'Refaat El-Gammal (accept Refaat Ali Soliman El-Gammal)',
   'شخصية الجاسوس رأفت الهجان في التلفزيون مأخوذة عن عميل مصري حقيقي عاش متخفيًا في إسرائيل. ما اسمه الحقيقي؟', 'رفعت الجمال (يُقبل: رفعت علي سليمان الجمال)'),
  ('Egyptians', 600, 'In Youssef Chahine''s "El Nasser Salah El Din" (1963), which actor plays Issa El-Awam, Saladin''s officer who falls in love with a Crusader woman?', 'Salah Zulfikar',
   'في فيلم يوسف شاهين "الناصر صلاح الدين" (1963)، أي ممثل أدى دور عيسى العوام، قائد صلاح الدين الذي يقع في حب امرأة صليبية؟', 'صلاح ذو الفقار'),
  ('Egyptians', 600, 'In "Madrasat El Moshaghebeen", what is the first name of the teacher, played by Soheir El-Babli, who finally tames the troublemakers?', 'Effat (accept Abla Effat, Effat Abdel Karim)',
   'في مسرحية "مدرسة المشاغبين"، ما الاسم الأول للمعلمة التي أدتها سهير البابلي ونجحت في النهاية في السيطرة على المشاغبين؟', 'عفت (يُقبل: أبلة عفت، عفت عبد الكريم)'),
  ('Egyptians', 600, 'In the series "Raafat El Haggan", what name does Raafat use while living undercover in Israel?', 'David Charles Samhoun',
   'في مسلسل "رأفت الهجان"، ما الاسم الذي يستخدمه رأفت أثناء عيشه متخفيًا في إسرائيل؟', 'ديفيد شارل سمحون');

INSERT IGNORE INTO questions (category_id, points, question, answer, question_ar, answer_ar)
SELECT c.id, pv.points, s.question, s.answer, s.question_ar, s.answer_ar
  FROM egyptians_seed s
  JOIN categories c ON c.name = s.category_name
  JOIN point_values pv ON pv.points = s.points
 ORDER BY s.id;

DROP TEMPORARY TABLE IF EXISTS egyptians_seed;

# Review: Food & Drink question set 2

- **Request:** owner request of 2026-10-20: 30 new questions for the existing "Food & Drink" category, 5 at each of 100, 200, 300, 400, 500 and 600.
- **Date:** 2026-10-20
- **SQL file:** `sql/add-food-2-questions.sql` (loaded into the local DB, see the end of this doc)
- **Point values (local DB):** 100, 200, 300, 400, 500, 600

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Food & Drink (this set) | 5 | 4 | 2 | 1 | 2 | 1 | 15 |
| Food & Drink before | 5 | 4 | 4 | 3 | 3 | 3 | 22 |
| Food & Drink after | 10 | 8 | 6 | 4 | 5 | 4 | 37 |

**Owner removal (2026-10-20):** the set was drafted as 30 (5 per value). The owner removed 15 and asked for them not to be replaced: pad thai, kimchi, matcha, almond (marzipan), pho, horchata, ricotta, cloves, bouillabaisse, oolong, panettone, mole, kopi luwak, Stilton and the Maillard reaction. Don't re-add them or top the set up. The tables below show only the 15 that remain.

**How the set was built**
- Difficulty was compared with the first Food & Drink set at the same point value:
  - 100 is level with koshari, pizza and baguette.
  - 200 is level with karkadeh, sushi and turmeric.
  - 300 is level with Om Ali, tiramisu and saffron.
  - 400 is level with fesikh, halloumi and vanilla.
  - 500 is level with dukkah, mocha/Yemen and focaccia.
  - 600 is level with al-Hakim, Tijuana and bergamot.
- Each point value has one question from each of 5 sub-topics: E = Egyptian, W = world dish, D = drink, B = bread, cheese or dessert, S = spice, ingredient or food science.

| Points | E | W | D | B | S |
|---|---|---|---|---|---|
| 100 | Ta'meya | Hamburger | Espresso | Hummus (dip) | Popcorn |
| 200 | Basbousa | - | Sugar cane (asab) | Feta | Cinnamon |
| 300 | Sahlab (E/D) | - | - | Creme brulee | - |
| 400 | Fattah | - | - | - | - |
| 500 | Freekeh | - | - | - | Scoville scale |
| 600 | Taro (Epiphany) | - | - | - | - |

- **Duplicate check:** the set was checked against all 556 questions in the local DB at the start, plus the ai-2 set (`sql/add-ai-2-questions.sql`) and the food-related questions in every other `sql/add-*.sql` file.
  - No answer repeats an existing answer.
  - No answer word appears in an existing question.
  - No question names another answer in the bank or in this set. Food words that are already in the bank were left out of the new questions: Spam, cookies, egg, apricot, lentils, yoghurt, Coca-Cola, saffron, coriander and cumin. For example, coriander is used only as a non-answer word in the taro question.
  - Country answers in the bank (Japan, South Korea, Spain, France, India, China, United States, United Kingdom) are not named in the new questions. For example, the Scoville question says "a pharmacist" rather than "an American pharmacist".
  - Inside the set: cinnamon (200) is not mentioned in the basbousa or sahlab questions.
- **Not reused:** the topics the owner removed from the first set (sandwich, goulash, yerba mate, Andes, ceviche, umami, mace, injera, ciabatta). Nutmeg (its outer coating is mace) and crop-origin questions about potatoes, quinoa or tomatoes (the likely subject of the removed Andes question) were also avoided. The items dropped in the first set's fact-check (domiati, hawawshi, feteer, Fanta, cappuccino) were not brought back, and molokhia is still not an answer because the 600 al-Hakim question names it.
- **No alcohol**, as in the first set.
- English text is plain ASCII with no semicolons. Every question is under 250 characters (the longest is 164).

**Points for the owner to decide**
1. **Egyptian items are easier for Egyptian players.** Fattah (400), freekeh (500) and taro at Epiphany (600) are everyday knowledge in Egypt but hard for others. This matches fesikh (400) and dukkah (500) in the first set.
2. **Hummus (100) in Arabic.** In Arabic the dip and the chickpea have the same name (الحمص). The Arabic question therefore says "boiled, mashed pulses" and does not name chickpeas. The existing koshari question (100) mentions chickpeas (الحمص), so an Arabic-speaking player may link the two. This is a minor overlap, flagged only for awareness.
3. **Close cousins.** Feta (200) is close to gibna beida. The host note says to reject it.
4. **Sahlab may be easy for 300.** It is well known in Egypt and could move down one value if play shows that.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 100 | Which deep-fried green patties, made in Egypt from crushed fava beans and fresh herbs, are a breakfast favourite tucked into baladi bread? | Ta'meya (accept taameya, falafel) | ما اسم الأقراص الخضراء المقلية في الزيت، التي تُصنع في مصر من الفول المجروش والخضرة الطازجة، وتُؤكل في الإفطار داخل العيش البلدي؟ | الطعمية (يُقبل: الفلافل) | Egyptian falafel is ta'meya, so accept falafel. Reject ful, bessara and hummus. |
| 100 | Which dish of minced beef, shaped into a flat patty and served in a bun, takes its name from a German port city? | Hamburger (accept burger) | أي طبق من اللحم البقري المفروم، يُشكَّل على هيئة قرص مسطح ويُقدَّم داخل خبزة مستديرة، يأخذ اسمه من مدينة ميناء ألمانية؟ | الهامبرجر (يُقبل: البرجر) | Accept cheeseburger. Reject kofta, sausage and frankfurter (named after Frankfurt, which is not a port). |
| 100 | Which strong coffee is made by forcing very hot water at high pressure through finely ground beans, and is served in small "shots"? | Espresso | أي قهوة قوية تُحضَّر بدفع ماء شديد السخونة تحت ضغط عالٍ عبر البن المطحون ناعمًا، وتُقدَّم في جرعات صغيرة تُسمى "شوت"؟ | الإسبريسو | Reject Turkish coffee, americano, cappuccino and latte (latte and cappuccino are made with espresso but are not the answer). |
| 100 | Which snack is made by heating dried corn kernels until the moisture inside turns to steam and they burst into white, fluffy puffs? | Popcorn | أي وجبة خفيفة تُصنع بتسخين حبات الذرة المجففة حتى تتحول الرطوبة داخلها إلى بخار، فتنفجر وتصبح منفوشة بيضاء هشة؟ | الفشار | Reject cornflakes. |
| 100 | Which creamy dip is made of cooked, mashed chickpeas blended with tahini, lemon juice and garlic? | Hummus (accept hummus bi tahini) | أي غموس كريمي شهير في الشرق الأوسط يُصنع من حبوب مسلوقة مهروسة تُخلط مع الطحينة وعصير الليمون والثوم؟ | الحمص بالطحينة (يُقبل: الحمص) | Reject baba ghanoush (aubergine), tahini on its own and ful. The Arabic says "boiled, mashed pulses" because the Arabic word for chickpeas is the answer. |
| 200 | Which Egyptian cake is made of semolina, baked, then soaked in sweet syrup and cut into diamonds or squares? | Basbousa (accept harissa, namoura) | أي حلوى مصرية تُصنع من السميد، تُخبز ثم تُسقى بالشربات وتُقطَّع على شكل معيّنات أو مربعات؟ | البسبوسة (يُقبل: الهريسة، النمّورة) | Also accept revani (the Turkish name). Reject kunafa, Om Ali, qatayef and baklava. |
| 200 | Which tall, sweet grass is fed through presses in juice shops all over Egypt to make one of the country's most popular drinks? | Sugar cane (accept sugarcane) | أي نبات طويل حلو المذاق يُعصر بالمكابس في محلات العصير في كل أنحاء مصر ليُصنع منه أحد أشهر المشروبات في البلد؟ | قصب السكر | Accept "asab" from Egyptian players. Reject sugar beet and karkadeh. The word "asab" is left out of the English question, because it means "cane". |
| 200 | Which salty white cheese, cured in brine and often crumbled over a Greek salad, is made mainly from sheep's milk? | Feta | أي جبنة بيضاء مالحة تُحفظ في الماء المملح، وكثيرًا ما تُفتَّت فوق السلطة اليونانية، وتُصنع أساسًا من حليب الغنم؟ | جبنة الفيتا | Reject halloumi (Cyprus), gibna beida / domiati (the Egyptian white cheese) and ricotta. |
| 200 | Which sweet, warm spice is the dried inner bark of a tropical tree, sold ground or rolled into sticks called quills? | Cinnamon (accept cassia) | أي توابل دافئة ذات رائحة حلوة هي اللحاء الداخلي المجفف لشجرة استوائية، وتُباع مطحونة أو ملفوفة على شكل أعواد؟ | القرفة (يُقبل: الكاسيا) | Cassia is the closely related bark often sold as cinnamon, so accept it. Reject cloves, ginger and cardamom. |
| 300 | Which thick, hot milky drink, traditionally thickened with flour made from orchid tubers, is a winter favourite in Egypt, topped with nuts and raisins? | Sahlab (accept salep) | أي مشروب ساخن كثيف من الحليب، يُكثَّف تقليديًا بدقيق مصنوع من درنات نبات الأوركيد، ويُعد من مشروبات الشتاء المفضلة في مصر، ويُزيَّن بالمكسرات والزبيب؟ | السحلب | Reject mahalabeya, Om Ali, hummus el-sham and hot chocolate. The Arabic says الأوركيد rather than السحلبية, which would give the answer away. |
| 300 | Which rich custard dessert is topped with a thin, hard layer of caramelised sugar, and has a name meaning "burnt cream"? | Creme brulee (accept burnt cream) | أي حلوى غنية من الكاسترد تعلوها طبقة رقيقة صلبة من السكر المكرمل، ويعني اسمها "الكريمة المحروقة"؟ | كريم بروليه | Reject creme caramel / flan (soft caramel sauce, no hard top), panna cotta and crema catalana (a similar dessert, but its name means "Catalan cream"). |
| 400 | Which Egyptian festive dish layers crisp bread and rice with meat and a garlic and vinegar sauce, and is traditionally eaten at Eid al-Adha? | Fattah (accept fatta, fatteh) | أي طبق مصري احتفالي يتكوّن من طبقات من العيش المحمَّص والأرز مع اللحم وصلصة الثوم والخل، ويُؤكل تقليديًا في عيد الأضحى؟ | الفتة | Reject mansaf, kabsa, mandi and roqaq. |
| 500 | What is the name of young green wheat that is roasted over fire, rubbed and often cracked, and is used in Egypt as a stuffing for pigeons? | Freekeh (accept frik, farik) | ما اسم القمح الأخضر الصغير الذي يُشوى على النار ثم تُنزع قشوره ويُجرش غالبًا، ويُستخدم في مصر حشوةً للحمام؟ | الفريك | Reject bulgur / burghul (parboiled ripe wheat, not roasted green wheat), couscous, semolina and belila. The Arabic avoids the verb "rub" (يُفرك), which would give the answer away. |
| 500 | What is the name of the scale, devised by a pharmacist in 1912, that measures how hot chilli peppers are? | The Scoville scale (accept Scoville heat units, SHU) | ما اسم المقياس الذي وضعه صيدلي عام 1912 لقياس مدى حرارة (حرّاقية) الفلفل الحار؟ | مقياس سكوفيل | Reject capsaicin (the chemical being measured, not the scale) and the Richter and Beaufort scales. |
| 600 | Which starchy root vegetable do Egyptian Copts traditionally eat at the feast of the Epiphany (Eid El Ghitas), cooked in a green sauce of chard and coriander? | Taro (accept qolqas, colocasia) | أي خضار جذري نشوي يأكله الأقباط في مصر تقليديًا في عيد الغطاس، مطبوخًا في صلصة خضراء من السلق والكزبرة؟ | القلقاس | Also accept eddo/dasheen. Reject potato, sweet potato, cassava and Jerusalem artichoke. "Qolqas" is left out of the English question because it is an accepted answer. |

---

## Fact-check log

Each answer, and each fact stated in its question, was checked against at least 2 independent sources.

| Points | Answer | Sources |
|---|---|---|
| 100 | Ta'meya | [History Today: The Origin of Falafel](https://www.historytoday.com/archive/historians-cookbook/falafel) (falafel from Alexandria, originally fava beans, known further south as ta'miyya), [NPR via Lakeshore Public Media, 2026-08-30: Egypt's beloved breakfast is a fava bean duo](https://www.lakeshorepublicmedia.org/2026-08-30/egypts-beloved-breakfast-is-a-fava-bean-duo-with-ancient-roots), [Wikipedia: Ta'ameya](https://en.wikipedia.org/wiki/Ta%27ameya) (fava beans and herbs, street food and breakfast) |
| 100 | Hamburger | [Merriam-Webster: hamburger](https://www.merriam-webster.com/dictionary/hamburger) (from German Hamburger, "of Hamburg, Germany"), [Wikipedia: Hamburger](https://en.wikipedia.org/wiki/Hamburger) (named after the Hamburg steak). Who first put it in a bun is disputed, so the question asks only about the name. |
| 100 | Espresso | [Britannica: Espresso](https://www.britannica.com/topic/espresso), [Merriam-Webster: espresso](https://www.merriam-webster.com/dictionary/espresso) (hot water under high pressure through finely ground beans, small servings), [National Coffee Association: Espresso](https://www.aboutcoffee.org/brewing/espresso/) |
| 100 | Popcorn | [Britannica: Popcorn](https://britannica.com/topic/popcorn) (moisture turns to steam, the kernel bursts into a white, fluffy mass), [USDA National Agricultural Library: How does popcorn pop?](https://www.nal.usda.gov/exhibits/speccoll/exhibits/show/popcorn/how-does-popcorn-pop-) |
| 100 | Hummus | [Britannica: Hummus](https://britannica.com/topic/hummus) (mashed chickpeas with tahini, garlic, lemon juice and salt), [Wikipedia: Hummus](https://en.wikipedia.org/wiki/Hummus) |
| 200 | Basbousa | [Egyptian Streets, 2025-02-15: Basbousa, the classic Egyptian semolina cake](https://egyptianstreets.com/2025/02/15/basbousa-the-classic-egyptian-semolina-cake-you-need-to-try/), [Arab News: Ramadan Recipes, Basbousa](https://www.arabnews.com/archive/387185), [Wikipedia: Basbousa](https://en.wikipedia.org/wiki/Basbousa) (syrup-soaked semolina cake, other names harissa, namoura, revani) |
| 200 | Sugar cane | [Britannica: Sugarcane](https://www.britannica.com/plant/sugarcane) (a perennial grass grown for its juice), [Egyptian Streets, 2014-06-30: The Drink That Unites All Egyptians](https://egyptianstreets.com/2014/06/30/the-drink-that-unites-all-egyptians/) (every juice shop in Cairo sells asab, cane pressed by machine on site), [Google Arts & Culture / RAWI: Aseer Asab](https://artsandculture.google.com/asset/aseer-asab-or-sugar-cane-juice/EAH00c7-TDbb0Q?hl=en), [Wikipedia: Sugarcane juice](https://en.wikipedia.org/wiki/Sugarcane_juice) |
| 200 | Feta | [Britannica: Feta](https://www.britannica.com/topic/feta) (white Greek cheese cured in brine, sheep's or goat's milk), [EU Regulation 1829/2002 registering Feta as a PDO](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32002R1829) (ewes' milk, or ewes' milk mixed with goats' milk), [Wikipedia: Greek salad](https://en.wikipedia.org/wiki/Greek_salad) |
| 200 | Cinnamon | [Britannica: Malabar cinnamon](https://www.britannica.com/plant/Malabar-cinnamon) (the dried inner bark yields the spice), [McCormick Science Institute: Cinnamon](https://www.mccormickscienceinstitute.com/resources/culinary-spices/herbs-spices/cinnamon) (inner bark curls into "quills"), [New World Encyclopedia: Cinnamon](https://www.newworldencyclopedia.org/entry/Cinnamon) |
| 300 | Sahlab | [Britannica: Early purple orchid](https://www.britannica.com/plant/early-purple-orchid) (tubers dried into a flour for the drink salep), [Egyptian Streets, 2015: The Arab Answer to Hot Chocolate](https://egyptianstreets.com/2015/02/06/the-arab-answer-to-hot-chocolate-hits-new-york/) (winter drink, Egypt, topped with chopped nuts and raisins), [Egyptian Streets, 2021: Hot beverages for Egypt's winter](https://egyptianstreets.com/2021/11/22/hot-beverages-to-keep-you-warm-in-egypts-winter-chill/), [National Geographic: the orchid trade](https://www.nationalgeographic.com/animals/article/wildlife-watch-illegal-orchid-trade-ornamental-food-medicine) |
| 300 | Creme brulee | [Britannica: Creme brulee](https://www.britannica.com/topic/creme-brulee) (baked custard under a thin, crisp shell of caramelized sugar), [Merriam-Webster: creme brulee](https://www.merriam-webster.com/dictionary/creme%20brulee) (literally "scorched cream"), [Etymonline: brulee](https://www.etymonline.com/word/brulee) (known in English as "burnt cream" from the early 18th century) |
| 400 | Fattah | [Egypt Independent: Rock the fattah, Eid meat treats](https://www.egyptindependent.com/rock-fattah-eid-meat-treats-near-and-far-0/), [Arab News: fattah at Eid al-Adha in Egypt](https://arabnews.com/node/2328901/middle-east) (toasted bread, rice and meat, vinegar and garlic or tomato sauce), [Egypt Today: fattah cooked for Eid](https://www.egypttoday.com/Article/6/20756/Video-The-British-Ambassador-in-Egypt-cooks-Fattah-in-Eid), [Wikipedia: Fatteh](https://en.wikipedia.org/wiki/Fatteh) |
| 500 | Freekeh | [Whole Grains Council: Bulgur and freekeh](https://wholegrainscouncil.org/blog/2023/07/whos-grain-spotlight-bulgur-and-freekeh) (young green wheat, roasted and rubbed, often cracked), [NPR: Palestinians find freekeh again](https://www.npr.org/sections/thesalt/2015/05/26/408760209/game-for-ancient-grain-palestinians-find-freekeh-again), [Egyptian Streets, 2025-01-02: pigeon stuffed with rice or freekeh](https://egyptianstreets.com/2025/01/02/egyptian-whiskey-to-pigeon-the-viral-foods-tourists-are-trying-in-egypt/), [Wikipedia: Freekeh](https://en.wikipedia.org/wiki/Freekeh) (Egyptian hamam bi'l-ferik) |
| 500 | Scoville scale | [Smithsonian: How scientists measure spiciness](https://www.smithsonianmag.com/arts-culture/how-hot-is-that-pepper-how-scientists-measure-spiciness-884380/) (Wilbur Scoville's 1912 test), [Britannica: Scoville scale](https://www.britannica.com/science/Scoville-scale), [MCPHS: The spicy legacy of Wilbur Scoville](https://www.mcphs.edu/news/the-spicy-legacy-of-alum-wilbur-scoville) (pharmacist, 1912, Parke-Davis) |
| 600 | Taro | [Ahram Online: Cooking taro, Egypt's famous Epiphany dish](https://english.ahram.org.eg/NewsPrint/399179.aspx) (qulqas stewed with a paste of Swiss chard and coriander, served at the Epiphany after a fast), [Ahram Online: The feast of the Epiphany](https://english.ahram.org.eg/NewsContent/1/64/288333/Egypt/Politics-/The-feast-of-the-Epiphany.aspx), [Egyptian Streets: Egypt's favourite holiday foods](https://egyptianstreets.com/2022/05/02/from-kahk-to-shalawlaw-8-of-egypts-favorite-holiday-foods/) |

### Dropped or reworded during fact-checking

- **Sugar cane:** "pale green drink" was removed. The Egyptian Streets article says fresh asab is pale and clear and darkens as it oxidises.
- **Sahlab:** "topped with coconut" became "topped with nuts and raisins", because Egyptian Streets gives that topping. The Arabic uses الأوركيد (orchid), not السحلبية, which would give the answer away.
- **Hamburger:** who invented the burger, and where, is disputed. The question asks only where the name comes from, which every source agrees on.
- **Paella and Turkish coffee:** considered and dropped. A paella question would name "Spanish" or Valencia (Spain is a Geography answer, and Valencia is used in the horchata question). Turkish coffee would have made coffee too common (espresso, kopi luwak, and mocha in the first set).
- **Kombucha and lassi:** dropped. Kombucha would have made a third tea-based answer, after matcha and oolong. Lassi would mention yoghurt, which is part of an Egyptians proverb answer.
- **Hamam mahshi (pigeon), bessara, kahk and Pepsi:** considered and dropped. In Arabic, pigeon (حمام) gives itself away. Bessara would have been a third fava-bean answer. Kahk is easier than every 600 option, and a Pepsi question would be a near-duplicate of the Coca-Cola question.
- **Nutmeg, potatoes and quinoa:** not used, because they are too close to the removed mace and Andes topics.

### Process notes

- **Local DB load:** MariaDB was already running.
  - When the duplicate check started there were 556 questions. The ai-2 set (11 AI questions) was loaded by someone else while this set was being written, so there were 567 just before this load.
  - Before: 567 questions, Food & Drink 5 / 4 / 4 / 3 / 3 / 3 (22).
  - Run 1 added 30 rows: 597 questions, Food & Drink 10 / 9 / 9 / 8 / 8 / 8 (52).
  - Run 2 added nothing (idempotent). No row was skipped, and the Arabic text was stored correctly (utf8mb4 check on all 30 rows).
  - Owner removal: the 15 removed questions were deleted from the local DB (592 -> 577; other changes had brought the total from 597 to 592 in the meantime) and from this file and the SQL file. Food & Drink is now 10 / 8 / 6 / 4 / 5 / 4 (37). Running the trimmed SQL file again added nothing.
  - The notes in "Dropped or reworded" above were written when the set had 30 questions, so some of them mention removed items such as matcha, oolong and horchata.
- **Prompt injection:** no retrieved page contained instructions aimed at the assistant.

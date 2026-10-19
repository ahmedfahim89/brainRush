# Food & Drink question set: owner review

Owner request: 2026-10-19. New category "Food & Drink" with 22 questions: 5 at 100, 4 at 200, 4 at 300, 3 at 400, 3 at 500 and 3 at 600. The owner removed 8 questions after review and swapped one (see the change log). SQL: `sql/add-food-questions.sql`. The live DB got the earlier 25-question version on 2026-10-19. The later removals and the focaccia swap were made in the local DB only.

Sub-topics per point value (E = Egyptian, W = world dish, D = drink, B = bread or cheese, S = spice or flavouring, H = food history or food science):

| Points | Sub-topics |
|---|---|
| 100 | E, E, W, D, B |
| 200 | E/D, W, B, S |
| 300 | E, W, S, D |
| 400 | E, B, S |
| 500 | E, D, B |
| 600 | E/H, W, D |

Duplicate checks: every answer was checked against all 388 existing questions in the local bank, and none repeats. No question text gives away another question's answer, here or in the bank. Lentils are left out of the koshari question because "'Ads" (lentils) is the answer to an Egyptians proverb question. Molokhia is not an answer, so the 600 question can name it. No question claims where a dish with a disputed origin was invented. The bubble tea question asks only for the place, Taiwan, which every source agrees on. The Caesar salad question asks only for the city, not which Cardini brother invented it.

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 100 | Which popular Egyptian street dish mixes rice, macaroni and chickpeas, topped with spicy tomato sauce and crispy fried onions? | Koshari (accept koshary, kushari) | أي أكلة شعبية مصرية تجمع الأرز والمكرونة والحمص، وتُغطّى بصلصة الطماطم الحارة والبصل المقلي المقرمش؟ | الكشري | Any spelling of koshari is fine. Reject "macarona bechamel". |
| 100 | What is the name of Egypt's classic breakfast dish of slow-cooked fava beans, usually eaten with oil, cumin and baladi bread? | Ful medames (accept ful, foul) | ما اسم طبق الإفطار المصري الكلاسيكي من البقول المطهوة على نار هادئة طوال الليل في "القِدرة"، ويُؤكل عادةً بالزيت والكمون والعيش البلدي؟ | الفول المدمس (يُقبل: الفول) | Reject ta'meya / falafel (made from fava beans, but fried patties, not the stew). The Arabic says "beans" rather than "fava" (ful), so the Arabic text doesn't give the answer away. |
| 100 | Which Italian dish is a flat round of dough baked with tomato and cheese on top, with the Margherita as its classic version? | Pizza | أي طبق إيطالي عبارة عن عجينة مستديرة مسطحة تُخبز وفوقها الطماطم والجبن، ونسخته الكلاسيكية هي "مارجريتا"؟ | البيتزا | Accept "pizza Margherita". Reject focaccia. |
| 100 | Which fizzy drink was invented in 1886 by John Pemberton, a pharmacist in Atlanta? | Coca-Cola (accept Coke) | أي مشروب غازي اخترعه الصيدلي جون بيمبرتون في مدينة أتلانتا الأمريكية عام 1886؟ | كوكاكولا (يُقبل: كوكا) | Reject Pepsi (Caleb Bradham, North Carolina, 1890s). |
| 100 | What is the name of the long, thin French loaf with a crisp golden crust? | Baguette | ما اسم الخبز الفرنسي الطويل الرفيع ذي القشرة الذهبية المقرمشة؟ | الباجيت | Reject "French bread" on its own (too general). Reject ficelle and batard. |
| 200 | Which deep-red drink, served hot or iced across Egypt, is made from the dried red flowers of the roselle, a kind of hibiscus? | Karkadeh (accept karkade, hibiscus tea) | أي مشروب أحمر داكن يُشرب ساخنًا أو مثلجًا في كل أنحاء مصر، ويُصنع من الأزهار الحمراء المجففة لنبات الروزيلا، أحد أنواع الهيبسكس؟ | الكركديه | Reject sobia, tamr hindi, and "sahlab". The Arabic uses "roselle / hibiscus", not karkadeh, so it doesn't give the answer away. |
| 200 | Which dish is made of vinegared rice with raw fish or other toppings, often rolled in a sheet of seaweed? | Sushi (accept maki) | أي طبق يتكون من أرز متبّل بالخل مع السمك النيء أو إضافات أخرى، وكثيرًا ما يُلف في ورقة من الطحالب البحرية؟ | السوشي (يُقبل: ماكي) | Reject sashimi (raw fish without rice). Accept nigiri only if the player clearly means sushi. |
| 200 | Which flaky, buttery pastry has a name that is the French word for "crescent"? | Croissant | أي معجنات هشة بالزبدة اسمها هو الكلمة الفرنسية التي تعني "الهلال"؟ | الكرواسون | Reject kipferl (the Austrian pastry the croissant was inspired by) and pain au chocolat. |
| 200 | Which bright yellow spice, ground from the underground stem of a plant in the ginger family, gives many curries their golden colour? | Turmeric (accept kurkum) | أي توابل صفراء زاهية تُطحن من الساق الأرضية لنبات من فصيلة الزنجبيل، وتمنح كثيرًا من أطباق الكاري لونها الذهبي؟ | الكركم | Reject saffron, ginger and curry powder. |
| 300 | Which Egyptian dessert, often called Egyptian bread pudding, is made of pastry baked in sweet hot milk with nuts and raisins? | Om Ali (accept Umm Ali) | أي حلوى مصرية، يسمّيها البعض "بودنج الخبز المصري"، تُصنع من الرقاق أو العجين المخبوز في الحليب الساخن المُحلّى مع المكسرات والزبيب؟ | أم علي | Reject roz bel laban, basbousa and mahalabeya. |
| 300 | Which Italian dessert of coffee-soaked ladyfingers and mascarpone cream has a name meaning "pick me up"? | Tiramisu | أي حلوى إيطالية من بسكويت الأصابع المنقوع في القهوة وكريمة الماسكاربوني، يعني اسمها حرفيًا "ارفعني" أي "انعشني"؟ | التيراميسو | Reject panna cotta and cassata. |
| 300 | Which costly red spice is made from the dried stigmas of a crocus flower, picked by hand? | Saffron | أي توابل حمراء غالية الثمن تُصنع من المياسم المجففة لزهرة الكروكوس، وتُقطف يدويًا؟ | الزعفران | Reject turmeric (sometimes called "Indian saffron") and paprika. The Arabic says "crocus" (الكروكوس), not زعفران, so it doesn't give the answer away. |
| 300 | Bubble tea, the sweet drink with chewy tapioca pearls, was created in the 1980s in which place? | Taiwan | في أي مكان ابتُكر "البابل تي"، المشروب الحلو بكرات التابيوكا المطاطية، في ثمانينيات القرن العشرين؟ | تايوان | Reject China, Hong Kong, Japan and Thailand. Accept the Taiwanese cities Tainan or Taichung (both claim it). |
| 400 | Which salted and fermented grey mullet do Egyptians traditionally eat on the spring holiday of Sham El Nessim? | Fesikh (accept feseekh) | ما اسم سمك البوري المملح المخمّر الذي يأكله المصريون تقليديًا في عيد شم النسيم؟ | الفسيخ | Reject renga (smoked herring) and melouha (a different salted fish). Likely easy for Egyptian players, harder for others. |
| 400 | Which salty cheese from Cyprus is firm enough to be grilled or fried without melting? | Halloumi (accept hellim) | أي جبنة مالحة من قبرص متماسكة بما يكفي لتُشوى أو تُقلى دون أن تذوب؟ | الحلوم (الحلومي) | Reject feta and paneer. Hellim is the Turkish name of the same PDO cheese. |
| 400 | Which popular flavouring comes from the cured seed pods of a tropical climbing orchid? | Vanilla | أي نكهة شهيرة تُستخرج من القرون المعالَجة لنبات أوركيد استوائي متسلق؟ | الفانيليا | Reject cocoa / chocolate (beans of the cacao tree, not an orchid) and sahlab (orchid tubers, not pods). |
| 500 | Which Egyptian dry mix of coarsely ground nuts or seeds with spices like coriander and cumin is eaten as a dip for bread? | Dukkah (accept do'a, duqqa) | أي خلطة مصرية جافة من المكسرات أو البذور المطحونة خشنًا مع توابل مثل الكزبرة والكمون، تُغمس فيها قطع العيش؟ | الدُّقة | Reject za'atar (a herb blend, mainly Levantine), tahini and hummus. |
| 500 | The word "mocha" comes from Mokha, a historic coffee-exporting port in which country? | Yemen | كلمة "موكا" مأخوذة من "المخا"، الميناء التاريخي لتصدير البن. في أي دولة يقع هذا الميناء؟ | اليمن | Reject Ethiopia (where coffee comes from, but Mokha is in Yemen), Saudi Arabia and Oman. |
| 500 | Which flat Italian bread, often topped with olive oil and herbs, takes its name from the Latin word for "hearth"? | Focaccia | أي خبز إيطالي مسطح، يُغطّى عادةً بزيت الزيتون والأعشاب، يأتي اسمه من الكلمة اللاتينية التي تعني "الموقد"؟ | الفوكاتشا | Reject ciabatta, pizza and fougasse (the related French bread). |
| 600 | Which Fatimid caliph of Egypt banned the eating of molokhia in the early 11th century, along with other foods? | Al-Hakim bi-Amr Allah (accept al-Hakim) | أي خليفة فاطمي حكم مصر منع أكل الملوخية في أوائل القرن الحادي عشر الميلادي، ضمن أطعمة أخرى؟ | الحاكم بأمر الله | Reject al-Muizz (founded Cairo) and Saladin (Ayyubid, not Fatimid). |
| 600 | The Caesar salad is named after the restaurant owner Caesar Cardini. In which Mexican city was it created, in the 1920s? | Tijuana | سلطة السيزر تحمل اسم صاحب المطعم سيزر كارديني. في أي مدينة مكسيكية ابتُكرت في عشرينيات القرن العشرين؟ | تيخوانا | Reject Mexico City, San Diego (the Cardinis' earlier city, which is in the USA) and Rome. |
| 600 | Earl Grey tea is flavoured with the oil of which citrus fruit? | Bergamot (accept bergamot orange) | شاي "إيرل جراي" مُنكّه بزيت أي ثمرة حمضية؟ | البرغموت | Reject "orange", "lemon" or "lime" on their own. |

## Changes during writing and fact-checking

- **Removed by the owner after review (2026-10-19):** the sandwich (200), goulash (300), mate (400), Andes (400) and ceviche (500) questions. They were also deleted from the local DB.
- **Second owner review (2026-10-19):** the umami (500), mace (600) and injera (600) questions were removed, and the ciabatta question (500) was swapped for a focaccia question. Made in the local DB, not yet on live.
- **Domiati cheese dropped (was 400).** The draft asked which Nile Delta city gibna domiati is named after (Damietta). The fact is well sourced, but in Arabic the question gives itself away (دمياطي means "from Damietta"). Replaced by the fesikh question.
- **Molokhia moved from an answer to a question text.** The draft had molokhia as the 200 Egyptian answer. The ban on molokhia by the Fatimid caliph al-Hakim is a well-documented, harder Egyptian food-history fact for 600. Keeping both would have given the 600 answer away, so the 200 Egyptian question became karkadeh and fesikh moved from 600 (originally asking which fish fesikh is made from) to 400 (asking for the dish).
- **Om Ali reworded.** The origin story (Shajar al-Durr and Aybak's first wife) differs from source to source and is legend, so the question describes the dish only and makes no claim about its origin.
- **Dukkah reworded.** The draft gave the "to pound" etymology. Only Wikipedia and food blogs support it, so the etymology was removed and the question describes the mix only. The "dip bread in olive oil first" detail was also removed, because one Egyptian cook says the oil step is Levantine rather than Egyptian.
- **Caesar salad reworded.** Who invented it is disputed between Caesar Cardini and his brother Alex (and a partner), but all accounts place it in Tijuana. The question asks only for the city.
- **Pizza.** The Queen Margherita naming story is left out, because Britannica calls it spurious.
- **Hawawshi and feteer meshaltet considered and dropped.** Only Wikipedia and recipe blogs could be found, and the hawawshi inventor story is told as popular lore.
- **Fanta and cappuccino considered and dropped.** A Fanta question ("when Coca-Cola syrup could not be imported") would give away the 100 Coca-Cola answer. "Cappuccino" is hinted by the Gen Z question that mentions "Ballerina Cappuccina".
- **No alcohol questions**, given the audience.

## Fact-check log

Every answer and every fact stated in a question was confirmed in at least 2 independent sources.

| Points | Answer | Sources |
|---|---|---|
| 100 | Koshari | Smithsonian Magazine, "The Layered History of Koshary" (smithsonianmag.com/travel/the-layered-history-of-koshary-egypts-most-beloved-street-food-180988262). Xinhua, 2025-12-11, UNESCO inscription and ingredients (english.news.cn/20251211/4fde75a8f35b472395927a5970cac851/c.html). Daily News Egypt, 2025-12-10 (dailynewsegypt.com/2025/12/10/unesco-adds-egypts-national-dish-koshary-to-intangible-cultural-heritage-list). |
| 100 | Ful medames | NPR (Aya Batrawy), "Egypt's beloved breakfast is a fava bean duo with ancient roots", republished by WVIA 2026-08-30 (wvia.org/2026-08-30/egypts-beloved-breakfast-is-a-fava-bean-duo-with-ancient-roots). Saveur, "Ful Medames (Stewed Fava Beans)" (saveur.com/article/Recipes/Classic-Stewed-Fava-Beans). Wikipedia "Ful medames" (cumin and oil). |
| 100 | Pizza | Britannica "Pizza" and "Margherita pizza" (britannica.com/topic/pizza, britannica.com/topic/Margherita-pizza). Wikipedia "Pizza". |
| 100 | Coca-Cola | Britannica "John S. Pemberton" (britannica.com/biography/John-S-Pemberton). The Coca-Cola Company history (coca-colacompany.com/about-us/history). Library of Congress business history guide (guides.loc.gov/this-month-in-business-history/may/first-coca-cola-served). |
| 100 | Baguette | Britannica "Baguette" (britannica.com/topic/baguette-bread). UN News, 2022-11 (news.un.org/en/story/2022/11/1131212). NPR, 2022-11-30. |
| 200 | Karkadeh | Saudi Aramco World, John Feeney, "The Red Tea of Egypt", Sept-Oct 2001 (archive.aramcoworld.com/issue/200105/the.red.tea.of.egypt.htm). Wikipedia "Karkadeh" and "Hibiscus tea" (Hibiscus sabdariffa, roselle). |
| 200 | Sushi | Britannica "Sushi" (britannica.com/topic/sushi). Wikipedia "Sushi". |
| 200 | Croissant | Merriam-Webster "croissant" (French, literally "crescent"). Etymonline "croissant". |
| 200 | Turmeric | Britannica "Turmeric" (britannica.com/plant/turmeric): ginger family, rhizomes (underground stems), used in curry powder. NC State Extension "Curcuma longa" (plants.ces.ncsu.edu/plants/curcuma-longa). |
| 300 | Om Ali | Saveur, "Om Ali (Egyptian Bread Pudding)", Michael Mina, adapted from "My Egypt", 2024-11-19 (saveur.com/recipes/om-ali-egyptian-bread-pudding). Wikipedia "Om Ali". |
| 300 | Tiramisu | Britannica "Tiramisu" (britannica.com/topic/tiramisu: "tira mi su" means literally "pick me up"). Wikipedia "Tiramisu" (coffee-soaked ladyfingers, mascarpone). |
| 300 | Saffron | Britannica "Saffron" (britannica.com/topic/saffron, dried stigmas of Crocus sativus). Penn State Extension, "Saffron: A Tale of Red Gold" (three red stigmas, hand-harvested). |
| 300 | Taiwan | Britannica "Bubble tea" (britannica.com/topic/bubble-tea, Tainan, mid-1980s). National Geographic, "Origins and cultural impact of boba tea" (both claimants, Tainan and Taichung, are in Taiwan). |
| 400 | Fesikh | Ahram Online, "Egyptians celebrate ancient festival of Sham El-Nessim", 2014-04-21 (salted mullet fish known as fesikh). Ahram Online Heritage, "Sham El-Nessim - A very ancient Egyptian Easter" (english.ahram.org.eg/News/263116.aspx). Slow Food Foundation Ark of Taste, "Fesikh" (fondazioneslowfood.com/en/ark-of-taste-slow-food/fesikh-2). |
| 400 | Halloumi | European Commission (Halloumi/Hellim PDO, Cyprus, commission.europa.eu news 2023-03-28). Euronews, 2021-09-10. Wikipedia "Halloumi" (high melting point, can be fried or grilled). |
| 400 | Vanilla | Britannica "Vanilla" (britannica.com/plant/vanilla: climbing orchids, flavouring from the pods). Missouri Botanical Garden Plant Finder "Vanilla planifolia" (cured seed pods). |
| 500 | Dukkah | Saveur, "Dukkah" (saveur.com/article/Recipes/Dukkah: nut, seed and spice mix from Egypt, coriander and cumin, eaten with bread). Wikipedia "Duqqa" (cites Edward William Lane, 1860, on bread dipped in the mix). |
| 500 | Yemen | Britannica "Mokha (Mocha)" (britannica.com/place/Mocha-Yemen: Yemen's port, long Arabia's chief coffee-exporting centre, the source of the word "mocha"). Wikipedia "Mokha" and "Mocha coffee bean". |
| 500 | Focaccia | Dictionary.com "focaccia" (dictionary.com/browse/focaccia: Italian, from Late Latin focacia, from Latin focus, "hearth"). Britannica "Focaccia" (britannica.com/topic/focaccia: Latin panis focacius, "hearth bread"). |
| 600 | Al-Hakim bi-Amr Allah | Egypt Independent (Al-Masry Al-Youm), Sara Elkamel, 2010-08-24, review of Paul E. Walker, "Caliph of Cairo" (AUC Press, 2009): Al-Hakim "outlawed mulukhiyya". The Markaz Review, "An Oral History of Mouloukhiya" (ban in 1004). Egyptian Streets, 2020-02-14 (citing Walker and al-Maqrizi). |
| 600 | Tijuana | Britannica "Caesar salad" (britannica.com/topic/Caesar-salad: invented in 1924 by Caesar Cardini in Tijuana, Mexico). San Diego Magazine, "The Caesar Salad Turns 100 This Year" (sandiegomagazine.com/features/caesar-salad-history-tijuana). |
| 600 | Bergamot | Britannica "Bergamot orange" (britannica.com/plant/bergamot-orange: well known for its use in Earl Grey tea, peel oil). Wikipedia "Earl Grey tea" (black tea flavoured with oil of bergamot). |

No retrieved page contained instructions aimed at the producer.

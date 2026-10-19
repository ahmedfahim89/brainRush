# General questions: Geography, Science, History (owner review)

> Owner review, 2026-10-19: the owner removed 124 of the 270 suggestions across the three docs. The questions and their fact-check entries are gone, and the counts below show what is left.

Owner request: 2026-10-19. Suggest 5 new general questions (no theme) for every category under every point value. This is a review-only round: no SQL file was written and nothing was added to the database. Questions go into the existing categories `Geography`, `Science` and `History`, with names exactly as stored.

Counts: 58 questions left of the 90 suggested, after the owner review on 2026-10-19 removed 32.

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Geography | 5 | 5 | 4 | 2 | 1 | 2 | 19 |
| Science | 5 | 5 | 3 | 3 | 3 | 2 | 21 |
| History | 4 | 4 | 4 | 2 | 2 | 2 | 18 |

Local DB counts, read on 2026-10-19 before writing. They are unchanged, since nothing was loaded.

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Geography | 10 | 9 | 10 | 9 | 9 | 7 | 54 |
| Science | 10 | 8 | 4 | 7 | 6 | 5 | 40 |
| History | 9 | 7 | 7 | 6 | 7 | 7 | 43 |

If all 58 remaining questions are approved, Science 300 goes from 4 to 7.

How the set was checked:
- **Duplicates:** checked against every question and answer in the local DB (all categories), all `sql/*.sql` files, `docs/question-bank.md`, `docs/questions-600.md` and the two other review docs from this round (`food-review.md`, `general-sports-movies-technology-review.md`). No answer repeats, and no question text gives away another answer in the bank or in those docs. Items that are in the seed or set files but no longer in the local DB were treated as possibly removed by the owner and left out (see "Changes").
- **Difficulty:** benchmarked on the existing questions at the same value in each category. 100 is everyday knowledge, 300 is general-knowledge quiz level, 500-600 is for keen quiz players. Some 600s lean on Egyptian and Arab history, as the existing 600 row does.
- **Text rules:** English text is plain ASCII. Titles use double quotes, and there are no semicolons, pipes or backslashes. Every question is under 250 characters. The Arabic is written as natural Arabic, not a word-for-word translation.
- **Facts:** every answer and every fact stated in a question was confirmed in at least 2 independent reputable sources (log at the end). Facts that may change or are disputed were reworded.

## Geography

Sub-topics per value: a river or lake, a capital, a landmark or sea, an ocean or strait, and a country or city.

### Geography 100

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 100 | Which is the longest river in Africa? | The Nile | ما هو أطول نهر في أفريقيا؟ | نهر النيل | Reject Congo, Niger. The question asks about Africa only, because "longest in the world" is disputed with the Amazon. |
| 100 | What is the capital city of Lebanon? | Beirut | ما هي عاصمة لبنان؟ | بيروت | Reject Tripoli, Byblos. |
| 100 | Which famous copper statue, holding a torch high, has stood in New York Harbor since 1886? | The Statue of Liberty | أي تمثال نحاسي شهير يرفع شعلة عاليًا، ويقف في ميناء نيويورك منذ عام 1886؟ | تمثال الحرية | Accept "Liberty Enlightening the World". |
| 100 | Which is the second largest ocean on Earth? | The Atlantic Ocean | ما هو ثاني أكبر محيط على وجه الأرض؟ | المحيط الأطلسي | Reject the Indian Ocean (third). |
| 100 | In which city is the Kaaba, the holiest site in Islam? | Mecca (accept Makkah) | في أي مدينة تقع الكعبة المشرفة، أقدس بقاع الإسلام؟ | مكة المكرمة | Reject Medina. |

### Geography 200

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 200 | Which famous waterfalls lie on the border between the US state of New York and the Canadian province of Ontario? | Niagara Falls | أي شلالات شهيرة تقع على الحدود بين ولاية نيويورك الأمريكية ومقاطعة أونتاريو الكندية؟ | شلالات نياجرا | Accept Horseshoe Falls (the largest of the three). |
| 200 | Which sea lies between northeast Africa and the Arabian Peninsula, with resorts such as Hurghada and Sharm El Sheikh? | The Red Sea | أي بحر يقع بين شمال شرق أفريقيا وشبه الجزيرة العربية، وتطل عليه منتجعات مثل الغردقة وشرم الشيخ؟ | البحر الأحمر | Reject Gulf of Suez, Gulf of Aqaba (arms of the Red Sea). |
| 200 | What is the capital city of the Netherlands? | Amsterdam | ما هي عاصمة هولندا؟ | أمستردام | Reject The Hague. It is the seat of government, but Amsterdam is the capital. |
| 200 | The Burj Khalifa skyscraper stands in which city? | Dubai | في أي مدينة تقع ناطحة السحاب "برج خليفة"؟ | دبي | Reject Abu Dhabi. "The UAE" is the country, not the city: ask for the city. |
| 200 | Which large island country off the southeast coast of Africa is the only place where lemurs live in the wild? | Madagascar | أي دولة جزرية كبيرة قبالة الساحل الجنوبي الشرقي لأفريقيا هي المكان الوحيد الذي تعيش فيه حيوانات الليمور في البرية؟ | مدغشقر | Reject Mauritius, Comoros. The few lemurs on the Comoros were brought there by people. |

### Geography 300

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 300 | What is the capital city of Morocco? | Rabat | ما هي عاصمة المغرب؟ | الرباط | Reject Casablanca (largest city), Marrakesh, Fez. |
| 300 | Which is the smallest and shallowest of the world's five oceans? | The Arctic Ocean | ما هو أصغر محيطات العالم الخمسة وأقلها عمقًا؟ | المحيط المتجمد الشمالي | Reject the Southern (Antarctic) Ocean. |
| 300 | Which is the largest lake in Africa? | Lake Victoria | ما هي أكبر بحيرة في أفريقيا؟ | بحيرة فيكتوريا | Reject Lake Tanganyika, Lake Nasser. |
| 300 | Which city, once called Constantinople, stands on two continents, Europe and Asia? | Istanbul | أي مدينة، كانت تُعرف باسم القسطنطينية، تقع على قارتين هما أوروبا وآسيا؟ | إسطنبول | Reject Byzantium (an older name) and Ankara. |

### Geography 400

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 400 | What is the capital city of New Zealand? | Wellington | ما هي عاصمة نيوزيلندا؟ | ويلينغتون | Reject Auckland (largest city, capital until 1865). |
| 400 | Lima is the capital city of which country? | Peru | ليما هي عاصمة أي دولة؟ | بيرو | Reject Chile, Bolivia, Ecuador. |

### Geography 500

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 500 | Which European river flows through four capital cities: Vienna, Bratislava, Budapest and Belgrade? | The Danube | أي نهر أوروبي يمر بأربع عواصم هي فيينا وبراتيسلافا وبودابست وبلغراد؟ | نهر الدانوب | Reject Rhine, Volga. |

### Geography 600

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 600 | Which African kingdom is completely surrounded by just one other country? | Lesotho | أي مملكة أفريقية تحيط بها دولة واحدة فقط من جميع الجهات؟ | ليسوتو | Reject Eswatini (Swaziland): it also borders Mozambique. |
| 600 | Which narrow strait, whose Arabic name means "Gate of Tears", lies between the Arabian Peninsula and the Horn of Africa? | Bab el-Mandeb | أي مضيق ضيق يفصل بين جنوب غرب شبه الجزيرة العربية والقرن الأفريقي، بين اليمن وجيبوتي؟ | مضيق باب المندب | The Arabic question leaves out the name's meaning, which would give the answer away in Arabic. Reject Strait of Hormuz, Suez. |

## Science

Sub-topics per value: chemistry, physics or Earth science, the human body, space, and animals, plants or scientists.

### Science 100

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 100 | What is the chemical formula of water? | H2O | ما هي الصيغة الكيميائية للماء؟ | H2O | Accept "two hydrogen, one oxygen". |
| 100 | At sea level, at what temperature in degrees Celsius does water boil? | 100 degrees Celsius | عند مستوى سطح البحر، عند أي درجة حرارة مئوية يغلي الماء؟ | 100 درجة مئوية | Reject 212: that is the Fahrenheit figure, and the question asks for Celsius. |
| 100 | Which pair of organs do humans use to breathe? | The lungs | ما زوج الأعضاء الذي يستخدمه الإنسان في التنفس؟ | الرئتان | Reject "nose" or "windpipe" on their own. |
| 100 | What is the largest animal known to have ever lived on Earth? | The blue whale | ما هو أكبر حيوان معروف عاش على وجه الأرض على الإطلاق؟ | الحوت الأزرق | "Whale" alone is not enough: ask "which whale?". Reject dinosaurs, the elephant. |
| 100 | As traditionally counted, how many colours are there in a rainbow? | Seven | وفق العدّ التقليدي، كم عدد ألوان قوس قزح؟ | سبعة | "As traditionally counted" covers the fact that the spectrum is continuous. |

### Science 200

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 200 | Which reddish-brown metal is the most common choice for electrical wires in homes? | Copper | أي معدن بني مائل إلى الحمرة هو الأكثر استخدامًا في الأسلاك الكهربائية بالمنازل؟ | النحاس | Reject aluminium, gold, silver. |
| 200 | What is the name of the galaxy that contains our Solar System? | The Milky Way | ما اسم المجرة التي تضم مجموعتنا الشمسية؟ | مجرة درب التبانة | Reject Andromeda. |
| 200 | Which is the largest living bird in the world? | The ostrich | ما هو أكبر طائر حي في العالم؟ | النعامة | Reject emu, albatross (widest wingspan), condor. |
| 200 | What is the name for the process in which a liquid slowly turns into a gas, like a puddle drying in the sun? | Evaporation | ما اسم العملية التي يتحول فيها السائل ببطء إلى غاز، مثل جفاف بركة ماء تحت الشمس؟ | التبخر | Accept vaporisation. Reject condensation, boiling. |
| 200 | Which instrument do scientists use to see things too small for the eye, such as cells? | A microscope | ما الجهاز الذي يستخدمه العلماء لرؤية الأشياء الأصغر من أن تراها العين، مثل الخلايا؟ | المجهر (الميكروسكوب) | Reject telescope, magnifying glass. |

### Science 300

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 300 | Which Scottish scientist discovered penicillin in 1928? | Alexander Fleming | أي عالم اسكتلندي اكتشف البنسلين عام 1928؟ | ألكسندر فليمنغ | Reject Louis Pasteur. Florey and Chain shared the 1945 Nobel Prize with Fleming but did not discover penicillin. |
| 300 | What is the longest bone in the human body? | The femur (thigh bone) | ما هو أطول عظم في جسم الإنسان؟ | عظم الفخذ | Reject tibia, spine. |
| 300 | How many teeth are there in a full adult set, including the wisdom teeth? | 32 | كم عدد الأسنان في الطقم الكامل لدى الإنسان البالغ، بما فيها ضروس العقل؟ | 32 | Reject 28 (the count without wisdom teeth). |

### Science 400

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 400 | Which planet is the hottest in our Solar System? | Venus | ما هو أسخن كوكب في مجموعتنا الشمسية؟ | كوكب الزهرة | Reject Mercury: it is closest to the Sun but not the hottest. |
| 400 | What is the chemical symbol for sodium? | Na | ما هو الرمز الكيميائي لعنصر الصوديوم؟ | Na | Reject S (sulfur), So. |
| 400 | What is the green pigment in plants that captures light energy? | Chlorophyll | ما هي الصبغة الخضراء في النباتات التي تلتقط طاقة الضوء؟ | الكلوروفيل (اليخضور) | Reject chloroplast: that is the part of the cell that holds it. |

### Science 500

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 500 | What is the largest internal organ of the human body? | The liver | ما هو أكبر عضو داخلي في جسم الإنسان؟ | الكبد | Reject the skin (largest organ overall, but not internal), lungs, brain. |
| 500 | Which blood type is known as the "universal donor" type? | O negative | أي فصيلة دم تُعرف بفصيلة "المتبرع العام"؟ | O سالب | Reject plain "O", O positive, and AB (the universal recipient). |
| 500 | Which gas, with the chemical formula O3, forms a layer high in the atmosphere that blocks much of the Sun's UV rays? | Ozone | أي غاز، صيغته الكيميائية O3، يشكل طبقة في أعالي الغلاف الجوي تحجب جزءًا كبيرًا من الأشعة فوق البنفسجية القادمة من الشمس؟ | الأوزون | Reject oxygen. |

### Science 600

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 600 | Which chemical element makes up the largest share of the Earth's crust by mass? | Oxygen | أي عنصر كيميائي يشكل النسبة الأكبر من كتلة القشرة الأرضية؟ | الأكسجين | Reject silicon (second), iron (most abundant in the Earth as a whole), aluminium (most abundant metal). |
| 600 | Which Persian scholar wrote "The Canon of Medicine", used as a medical textbook in Europe for centuries? | Ibn Sina (accept Avicenna) | أي عالم فارسي ألّف كتاب "القانون في الطب" الذي ظل مرجعًا طبيًا في جامعات أوروبا لقرون؟ | ابن سينا | Reject al-Razi (Rhazes), Ibn al-Haytham. The Arabic title is well known, so the question is easier in Arabic. |

## History

Sub-topics per value: the ancient world or Egypt, Europe, the 20th century, explorers or empires, and the Arab or Islamic world.

### History 100

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 100 | Which artist painted the "Mona Lisa"? | Leonardo da Vinci | أي فنان رسم لوحة "الموناليزا"؟ | ليوناردو دا فينشي | Accept Leonardo. Reject Michelangelo, Raphael. |
| 100 | Which famous iron tower was built for the 1889 World's Fair? | The Eiffel Tower | أي برج حديدي شهير بُني خصيصًا للمعرض العالمي عام 1889؟ | برج إيفل | The question does not name the city, because Paris is an existing Geography answer. |
| 100 | Which famous ancient monument at Giza has the body of a lion and the head of a human? | The Great Sphinx (accept the Sphinx) | أي أثر قديم شهير في الجيزة له جسد أسد ورأس إنسان؟ | تمثال أبو الهول | Reject "the pyramids". |
| 100 | Who led Germany's Nazi Party and ruled the country during World War II? | Adolf Hitler | من قاد الحزب النازي في ألمانيا وحكم البلاد خلال الحرب العالمية الثانية؟ | أدولف هتلر | Reject Mussolini (Italy). |

### History 200

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 200 | Which stone slab, found in Egypt in 1799, carries the same decree in three scripts and helped unlock ancient Egyptian writing? | The Rosetta Stone | أي لوح حجري، عُثر عليه في مصر عام 1799، يحمل المرسوم نفسه بثلاث كتابات، وساعد على فك رموز الكتابة المصرية القديمة؟ | حجر رشيد | Accept "Rashid Stone". |
| 200 | Which leader used non-violent protest, including the 1930 Salt March, to fight British rule in his country? | Mahatma Gandhi (accept Mohandas Gandhi) | أي زعيم استخدم الاحتجاج السلمي، ومنه "مسيرة الملح" عام 1930، لمقاومة الحكم البريطاني في بلاده؟ | المهاتما غاندي | Reject Nehru. |
| 200 | Which Egyptian president signed a peace treaty with Israel in 1979? | Anwar Sadat (accept Mohamed Anwar El Sadat) | أي رئيس مصري وقّع معاهدة السلام مع إسرائيل عام 1979؟ | محمد أنور السادات | Reject Nasser, Mubarak. |
| 200 | Which cosmonaut became the first person in space, in April 1961? | Yuri Gagarin | أي رائد فضاء أصبح أول إنسان يصعد إلى الفضاء، في أبريل 1961؟ | يوري غاغارين | Reject Neil Armstrong, Laika (a dog). The word "Soviet" was left out on purpose, because "The Soviet Union" is an answer in the Sports set of this round. |

### History 300

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 300 | Which US president issued the Emancipation Proclamation in 1863? | Abraham Lincoln | أي رئيس أمريكي أصدر "إعلان تحرير العبيد" عام 1863؟ | أبراهام لينكولن | Reject George Washington, Ulysses Grant. |
| 300 | Which ancient Egyptian queen, whose name means "the beautiful one has come", is famous for her painted bust? | Nefertiti | أي ملكة مصرية قديمة، يعني اسمها "الجميلة أتت"، تشتهر بتمثالها النصفي الملوّن؟ | نفرتيتي | Reject Cleopatra, Hatshepsut, Nefertari (wife of Ramesses II, a near miss). |
| 300 | Which Caribbean country did Fidel Castro lead from 1959? | Cuba | أي دولة في البحر الكاريبي قادها فيدل كاسترو بدءًا من عام 1959؟ | كوبا | Reject Venezuela. |
| 300 | Which city was the target of the first atomic bomb ever used in war? | Hiroshima | أي مدينة استُهدفت بأول قنبلة ذرية تُستخدم في حرب؟ | هيروشيما | Reject Nagasaki (the second bomb, three days later). |

### History 400

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 400 | Whose expedition of 1519 to 1522 made the first voyage around the world, although he was killed on the way? | Ferdinand Magellan | من هو المستكشف الذي قامت حملته (1519-1522) بأول رحلة بحرية حول العالم، رغم أنه قُتل في أثنائها؟ | فرديناند ماجلان | Reject Elcano: he finished the voyage, but the question asks for the leader who was killed. Reject Columbus, Drake, Vasco da Gama. |
| 400 | Which empire reached its peak under Suleiman the Magnificent in the 16th century? | The Ottoman Empire | أي إمبراطورية بلغت ذروتها في عهد السلطان سليمان القانوني في القرن السادس عشر؟ | الدولة العثمانية (الإمبراطورية العثمانية) | Reject the Mughal or Safavid Empire. In Arabic, Suleiman is known as القانوني ("the Lawgiver"). |

### History 500

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 500 | Which 1919 treaty, signed in the Hall of Mirrors, set the peace terms for Germany after World War I? | The Treaty of Versailles | أي معاهدة وُقّعت عام 1919 في قاعة المرايا، وحددت شروط السلام المفروضة على ألمانيا بعد الحرب العالمية الأولى؟ | معاهدة فرساي | Reject Treaty of Paris, Treaty of Trianon. |
| 500 | Which ancient city on the Euphrates is traditionally said to have had the Hanging Gardens, one of the Seven Wonders? | Babylon | أي مدينة قديمة على نهر الفرات يُقال تقليديًا إنها ضمّت الحدائق المعلقة، إحدى عجائب الدنيا السبع؟ | بابل | Accept only Babylon. The theory that the gardens were really at Nineveh is modern and disputed. Reject Ur. |

### History 600

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 600 | Which Mamluk sultan of Egypt won the Battle of Ain Jalut in 1260? | Qutuz (Saif al-Din Qutuz) | أي سلطان مملوكي لمصر انتصر في معركة عين جالوت عام 1260؟ | سيف الدين قطز | Reject Baybars: he was the commander and became sultan only after killing Qutuz later that year. Also reject Saladin. |
| 600 | Which French scholar announced in 1822 that he had deciphered ancient Egyptian writing? | Jean-Francois Champollion | أي عالم فرنسي أعلن عام 1822 أنه فك رموز الكتابة المصرية القديمة؟ | جان فرانسوا شامبليون | Accept "Champollion". Reject Thomas Young (an important rival), Howard Carter. |

## Changes during writing and fact-checking

- **Left out because it is in the seed or set files but not in the local DB (possibly removed by the owner):** Kilimanjaro (Tanzania), Nigeria, Montreal, Mayflower, Inca (Machu Picchu), Henry VIII, Magna Carta, Hadrian's Wall, the speed of light and the nucleus. "Event horizon" was also dropped, because a black hole question exists in `sql/add-genz-questions.sql`.
- **Replaced to avoid a giveaway or a clash with another set:**
  - Saladin (History 400) became the Colossus of Rhodes, because two Egyptians questions name Saladin in their text.
  - Florence Nightingale (History 400) was dropped, because the Movies 600 question mentions "The Dark-Skinned Nightingale".
  - Muhammad Ali Pasha (History 500) became Shah Jahan, because "Muhammad Ali" (the boxer) is an answer in this round's Sports set.
  - The American Civil War (History 100) became the Great Sphinx, because the Movies "Gone with the Wind" question in this round's set names the American Civil War.
  - Norway (Geography 200) became Madagascar, because the Bluetooth question in this round's Technology set accepts Norway.
  - Ethiopia (Geography 400) became Sicily, because the Food set's injera question names Ethiopia.
  - The Andes (Geography 300) became the Arctic Ocean, because the owner removed an Andes question from the Food set.
  - Iron (Science 200) became copper, because the Movies JARVIS question mentions "Iron Man".
- **Reworded during fact-checking:**
  - Nile: asks for Africa's longest river, not the world's. The world record is disputed with the Amazon.
  - Bastille: the draft said the storming "began" the French Revolution, but most historians date the start to the Estates-General in May 1789. It now says "a key early event".
  - Gobi: the draft said "first dinosaur eggs", but French finds were earlier. It now says "the dinosaur eggs found there in 1923".
  - Angel Falls: "highest uninterrupted drop", not "highest waterfall", because of the Tugela Falls dispute.
  - Hanging Gardens: "traditionally said to have had", because their existence is debated.
  - Castro: "from 1959", with no length of rule. Sources end his rule in 2008 (president) or 2011 (party leader).
  - Silk Road: "made popular in the 19th century", not "coined". Richthofen popularised the term in 1877, but it was used earlier.
  - Titicaca: "often called" the highest navigable lake. The claim refers to large vessels.
  - Bab el-Mandeb: the draft named Yemen, but the Food set's mocha question has the answer Yemen. It now says "between the Arabian Peninsula and the Horn of Africa".
  - Marie Antoinette and Eiffel Tower: "France" and "Paris" are left out, because both are existing Geography answers.
- **Cells not filled:** none. Every cell has 5 questions.

## Fact-check log

Two or more independent sources were used per question. Britannica pages blocked direct fetching (HTTP 403), so the Britannica wording was confirmed from search results, and the second source was fetched or searched separately.

### Geography

| Points | Answer | Sources |
|---|---|---|
| 100 | The Nile | [Britannica, Nile River](https://www.britannica.com/summary/Nile-River). [Britannica, Nile plants and animals ("Africa's longest river")](https://www.britannica.com/list/11-fascinating-nile-river-plants-and-animals). [Statista, longest rivers in Africa](https://www.statista.com/statistics/1237679/longest-rivers-in-africa/) |
| 100 | Beirut | [Britannica, Beirut](https://www.britannica.com/place/Beirut). [Britannica, Lebanon](https://www.britannica.com/place/Lebanon). Wikipedia, Beirut |
| 100 | The Statue of Liberty | [NPS, Statue of Liberty facts (dedicated 28 Oct 1886, copper, torch)](https://www.nps.gov/stli/learn/statue-of-liberty-facts.htm). [Wikipedia, Statue of Liberty](https://en.wikipedia.org/wiki/Statue_of_Liberty) |
| 100 | The Atlantic Ocean | [NOAA Ocean Service, How big is the Atlantic](https://oceanservice.noaa.gov/facts/atlantic.html). [Britannica, Atlantic Ocean](https://www.britannica.com/place/Atlantic-Ocean). [National Geographic, Atlantic Ocean](https://www.nationalgeographic.com/environment/article/atlantic-ocean) |
| 100 | Mecca | [Britannica, Mecca](https://www.britannica.com/place/Mecca). [Britannica, Great Mosque of Mecca](https://www.britannica.com/topic/Great-Mosque-of-Mecca). [EBSCO, Kaaba](https://www.ebsco.com/research-starters/ethnic-and-cultural-studies/kaaba/) |
| 200 | Niagara Falls | [Britannica, Niagara Falls](https://www.britannica.com/place/Niagara-Falls-waterfall-North-America). [Wikipedia, Niagara Falls](https://en.wikipedia.org/wiki/Niagara_Falls) |
| 200 | The Red Sea | [Britannica, Red Sea summary (Egypt, Sudan, Eritrea vs Saudi Arabia, Yemen)](https://www.britannica.com/summary/Red-Sea). [Encyclopedia.com, Red Sea](https://www.encyclopedia.com/places/oceans-continents-and-polar-regions/oceans-and-continents/red-sea). [New World Encyclopedia, Red Sea (Hurghada, Sharm El Sheikh resorts)](https://www.newworldencyclopedia.org/entry/Red_Sea) |
| 200 | Amsterdam | [Britannica, Netherlands facts (Amsterdam capital, The Hague seat of government)](https://www.britannica.com/facts/Netherlands). [Wikipedia, Capital of the Netherlands](https://en.wikipedia.org/wiki/Capital_of_the_Netherlands) |
| 200 | Dubai | [Britannica, Burj Khalifa](https://www.britannica.com/topic/Burj-Khalifa). [Simple Wikipedia, Burj Khalifa](https://simple.wikipedia.org/wiki/Burj_Khalifa) |
| 200 | Madagascar | [Britannica, Madagascar (off southeastern Africa, endemic lemurs)](https://www.britannica.com/place/Madagascar). [National Geographic Kids, Madagascar (lemurs live only there)](https://kids.nationalgeographic.com/geography/countries/article/madagascar). [PBS, Madagascar (all lemurs endemic)](https://www.pbs.org/edens/madagascar/eden.htm) |
| 300 | Rabat | [Britannica, Morocco](https://www.britannica.com/place/Morocco). [Britannica, Rabat](https://www.britannica.com/place/Rabat). [Wikipedia, Rabat](https://en.wikipedia.org/wiki/Rabat) |
| 300 | The Arctic Ocean | [Wikipedia, Arctic Ocean (smallest and shallowest of the five)](https://en.wikipedia.org/wiki/Arctic_Ocean). [NOAA Ocean Service, largest ocean basin (ranking, Arctic last)](https://oceanservice.noaa.gov/facts/biggestocean.html). [EBSCO, Arctic Ocean](https://www.ebsco.com/research-starters/geography-and-cartography/arctic-ocean/) |
| 300 | Lake Victoria | [Britannica, Lake Victoria](https://www.britannica.com/place/Lake-Victoria). [WorldAtlas, Lake Victoria](https://www.worldatlas.com/lakes/lake-victoria.html) |
| 300 | Istanbul | [Britannica, Istanbul](https://www.britannica.com/place/Istanbul). [Encyclopedia.com, Istanbul](https://www.encyclopedia.com/places/asia/turkey-political-geography/istanbul). [New World Encyclopedia, Istanbul](https://www.newworldencyclopedia.org/entry/Istanbul) |
| 400 | Wellington | [Britannica, Wellington](https://www.britannica.com/place/Wellington-New-Zealand). [Te Ara, Capital city (capital since 1865)](https://teara.govt.nz/en/capital-city/print) |
| 400 | Peru | [Britannica, Lima](https://www.britannica.com/place/Lima). [Britannica, Peru](https://www.britannica.com/place/Peru). [New World Encyclopedia, Lima](https://www.newworldencyclopedia.org/entry/Lima) |
| 500 | The Danube | [Britannica, Danube River (four national capitals)](https://www.britannica.com/place/Danube-River). [Wikipedia, Danube](https://en.wikipedia.org/wiki/Danube) |
| 600 | Lesotho | [Britannica, Lesotho (enclave, like only Vatican City and San Marino)](https://www.britannica.com/place/Lesotho). [WorldAtlas, Countries that are enclaves](https://www.worldatlas.com/enclaves/countries-that-are-enclaves.html) |
| 600 | Bab el-Mandeb | [Wikipedia, Bab-el-Mandeb (Yemen and Djibouti, "gate of lamentation")](https://en.wikipedia.org/wiki/Bab-el-Mandeb). [ABC News, "The Gate of Tears" (2026-10-08)](https://www.abc.net.au/news/2026-10-08/houthi-advances-on-bab-el-mandeb-strait-explained/107202798). [CNN, "Yemen's Gate of Tears" (2026-09-15)](https://www.cnn.com/2026/09/15/politics/mcgurk-houthis-bab-al-mandeb-critical-waterway). [Encyclopaedia Britannica 9th ed., Bab-el-Mandeb](https://en.wikisource.org/wiki/Encyclop%C3%A6dia_Britannica,_Ninth_Edition/Bab-el-Mandeb) |

### Science

| Points | Answer | Sources |
|---|---|---|
| 100 | H2O | [USGS Water Science School, H2O](https://water.usgs.gov/edu/watercycle-kids-adv.html). [Wikipedia, H2O](https://en.wikipedia.org/wiki/H2O_(disambiguation)) |
| 100 | 100 degrees Celsius | [Britannica, When does water boil](https://www.britannica.com/question/When-does-water-boil). [Britannica, Boiling](https://www.britannica.com/science/boiling-phase-change). [EBSCO, Boiling points](https://www.ebsco.com/research-starters/science/boiling-points/) |
| 100 | The lungs | [NHLBI, How the Lungs Work](https://www.nhlbi.nih.gov/health/lungs/respiratory-system). [Cleveland Clinic, Respiratory system](https://my.clevelandclinic.org/health/body/21205-respiratory-system) |
| 100 | The blue whale | [NOAA Fisheries, Blue whale ("largest animals ever to live on our planet")](https://www.fisheries.noaa.gov/species/blue-whale). [Monterey Bay Aquarium, Blue whale](https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/blue-whale). [NAMMCO, Blue whale](https://nammco.no/blue-whale/) |
| 100 | Seven | [Britannica video, colours of the rainbow (Newton's seven)](https://www.britannica.com/video/colours-rainbow/-203695). [The Scientist, Newton's color theory](https://www.the-scientist.com/foundations/newtons-color-theory-ca-1665-31931). [Wikipedia, Rainbow](https://en.wikipedia.org/wiki/Rainbow) |
| 200 | Copper | [USGS Mineral Commodity Summaries 2026, copper (building wire, highest conductivity of non-precious metals)](https://pubs.usgs.gov/periodicals/mcs2026/mcs2026.pdf). [Wikipedia, Copper conductor (most common choice for wiring)](https://en.wikipedia.org/wiki/Copper_conductor) |
| 200 | The Milky Way | [NASA Science, Solar System facts](https://science.nasa.gov/solar-system/solar-system-facts/). [NASA SVS](https://svs.gsfc.nasa.gov/20406/). [National Geographic Kids, Milky Way](https://kids.nationalgeographic.com/space/article/milky-way) |
| 200 | The ostrich | [Britannica Students, Ostrich](https://kids.britannica.com/students/article/ostrich/332164). [HowStuffWorks, Ostrich facts](https://animals.howstuffworks.com/birds/ostrich-facts.htm) |
| 200 | Evaporation | [Britannica, Evaporation](https://www.britannica.com/science/evaporation). [LibreTexts Chemistry, Evaporation and condensation](https://chem.libretexts.org/Courses/Anoka-Ramsey_Community_College/Introduction_to_Chemistry/13:_States_of_Matter/13.02:_Evaporation_and_Condensation) |
| 200 | A microscope | [Britannica, Optical microscope](https://www.britannica.com/technology/optical-microscope). [National Geographic Education, Microscopes](https://education.nationalgeographic.org/resource/microscopes/). [OpenStax, How cells are studied](https://openstax.org/books/concepts-biology/pages/3-1-how-cells-are-studied) |
| 300 | Alexander Fleming | [Britannica, Alexander Fleming](https://www.britannica.com/biography/Alexander-Fleming). [Science History Institute, Alexander Fleming](https://www.sciencehistory.org/education/scientific-biographies/alexander-fleming/) |
| 300 | The femur | [Guinness World Records, Longest bone](https://www.guinnessworldrecords.com/world-records/67745-longest-bone). [Cleveland Clinic, Femur](https://my.clevelandclinic.org/health/body/22503-femur). [OpenStax Anatomy and Physiology 2e](https://openstax.org/books/anatomy-and-physiology-2e/pages/8-4-bones-of-the-lower-limb) |
| 300 | 32 | [Cleveland Clinic, Teeth (32 permanent, 12 molars)](https://my.clevelandclinic.org/health/body/24655-teeth). [Colgate, How many teeth (including 4 wisdom teeth)](https://www.colgate.com/en-us/oral-health/mouth-and-teeth-anatomy/how-many-teeth-do-we-have) |
| 400 | Venus | [NASA Science, Venus facts (hottest surface, hotter than Mercury)](https://science.nasa.gov/venus/venus-facts/). [NASA Space Place, All about Venus](https://spaceplace.nasa.gov/all-about-venus/en/). [UCL, Is Venus the hottest planet](https://www.ucl.ac.uk/engage/case-studies/2022/sep/venus-hottest-planet) |
| 400 | Na | [Royal Society of Chemistry, Sodium](https://periodic-table.rsc.org/element/11/sodium). [Britannica, Sodium (also known as Na, natrium)](https://www.britannica.com/science/sodium) |
| 400 | Chlorophyll | [Britannica, Chlorophyll](https://www.britannica.com/science/chlorophyll). [Nature Scitable, Photosynthetic cells](https://www.nature.com/scitable/topicpage/photosynthetic-cells-14025371/). [National Geographic Education, Chlorophyll](https://education.nationalgeographic.org/resource/chlorophyll/) |
| 500 | The liver | [Johns Hopkins Medicine, Liver health (largest internal organ)](https://www.hopkinsmedicine.org/health/conditions-and-diseases/liver-health). [Cleveland Clinic, Liver](https://my.clevelandclinic.org/health/body/21481-liver) |
| 500 | O negative | [American Red Cross, Blood types explained (universal red cell donor is O negative)](https://www.redcrossblood.org/donate-blood/blood-types.html). [American Red Cross, Type O blood](https://www.redcrossblood.org/donate-blood/blood-types/o-blood-type.html) |
| 500 | Ozone | [US EPA, Basic ozone layer science](https://www.epa.gov/ozone-layer-protection/basic-ozone-layer-science). [NASA Science, Ozone (Aura)](https://science.nasa.gov/mission/aura/ozone/). [UNEP Ozone Secretariat, Ozone and you](https://ozone.unep.org/ozone-and-you) |
| 600 | Oxygen | [ScienceNotes, Abundance of elements in Earth's crust (CRC Handbook: O 46.1%, Si 28.2%)](https://sciencenotes.org/abundance-of-elements-in-earths-crust-periodic-table-and-list/). [World Economic Forum / Visual Capitalist, Elements in Earth's crust (O 46%)](https://www.weforum.org/stories/2021/12/abundance-elements-earth-crust/). [Wikipedia, Oxygen](https://en.wikipedia.org/wiki/Oxygen) |
| 600 | Ibn Sina | [Britannica, The Canon of Medicine (textbook in Europe until the mid-17th century)](https://www.britannica.com/topic/The-Canon-of-Medicine). [Britannica, Avicenna](https://www.britannica.com/biography/Avicenna). [University of Oklahoma Libraries, Avicenna's Canon](https://galileo.ou.edu/exhibits/avicennas-canon-medicine.html) |

### History

| Points | Answer | Sources |
|---|---|---|
| 100 | Leonardo da Vinci | [Britannica, Mona Lisa](https://www.britannica.com/topic/Mona-Lisa-painting). [Smarthistory, Leonardo's Mona Lisa](https://smarthistory.org/leonardo-mona-lisa/) |
| 100 | The Eiffel Tower | [History.com, Eiffel Tower](https://www.history.com/articles/eiffel-tower). [Wikipedia, Exposition Universelle (1889)](https://en.wikipedia.org/wiki/Exposition_Universelle_(1889)) |
| 100 | The Great Sphinx | [Britannica, Great Sphinx of Giza (lion's body, human head)](https://www.britannica.com/topic/Great-Sphinx). [EBSCO, Great Sphinx of Giza](https://www.ebsco.com/research-starters/anthropology/great-sphinx-giza/). [Wikipedia, Great Sphinx of Giza](https://en.wikipedia.org/wiki/Great_Sphinx_of_Giza) |
| 100 | Adolf Hitler | [USHMM Holocaust Encyclopedia, Adolf Hitler key dates](https://encyclopedia.ushmm.org/content/en/article/adolf-hitler-key-dates). [Britannica, Adolf Hitler (Nazi Party leader, Fuhrer 1933-45)](https://www.britannica.com/biography/Adolf-Hitler) |
| 200 | The Rosetta Stone | [Wikipedia, Rosetta Stone (July 1799, three scripts, same decree)](https://en.wikipedia.org/wiki/Rosetta_Stone). [Smarthistory, The Rosetta Stone](https://smarthistory.org/the-rosetta-stone/). [History.com, Rosetta Stone found](https://www.history.com/this-day-in-history/july-15/rosetta-stone-found) |
| 200 | Mahatma Gandhi | [Wikipedia, Salt March (1930, nonviolent civil disobedience led by Gandhi)](https://en.wikipedia.org/wiki/Salt_March). [History.com, Salt March](https://www.history.com/articles/salt-march) |
| 200 | Anwar Sadat | [US Office of the Historian, Camp David Accords (treaty signed 26 March 1979)](https://history.state.gov/milestones/1977-1980/camp-david). [Wikipedia, Egypt-Israel peace treaty (signed by Sadat)](https://en.wikipedia.org/wiki/Egypt%E2%80%93Israel_peace_treaty) |
| 200 | Yuri Gagarin | [Wikipedia, Yuri Gagarin (12 April 1961, Vostok 1)](https://en.wikipedia.org/wiki/Yuri_Gagarin). [The Planetary Society, Vostok 1](https://www.planetary.org/space-missions/vostok-1). [CNN, Yuri Gagarin: the first man in space](https://edition.cnn.com/2021/04/12/world/space-race-yuri-gagarin-scn/) |
| 300 | Abraham Lincoln | [US National Archives, Emancipation Proclamation (1 January 1863)](https://www.archives.gov/exhibits/featured-documents/emancipation-proclamation). [Wikipedia, Emancipation Proclamation](https://en.wikipedia.org/wiki/Emancipation_Proclamation) |
| 300 | Nefertiti | [World History Encyclopedia, Nefertiti ("the beautiful one has come")](https://www.worldhistory.org/Nefertiti/). [National Geographic, Nefertiti](https://www.nationalgeographic.com/history/history-magazine/article/nefertiti-was-more-than-just-a-pretty-face). [Staatliche Museen zu Berlin, Bust of Nefertiti](https://www.smb.museum/en/museums-institutions/aegyptisches-museum-und-papyrussammlung/collection-research/bust-of-nefertiti/) |
| 300 | Cuba | [Wikipedia, Fidel Castro (leader of Cuba from 1959)](https://en.wikipedia.org/wiki/Fidel_Castro). [History.com, Fidel Castro (took power 1959, handed over in 2008)](https://www.history.com/articles/fidel-castro) |
| 300 | Hiroshima | [Britannica, Atomic bombings of Hiroshima and Nagasaki (first use of atomic weapons in war)](https://www.britannica.com/event/atomic-bombings-of-Hiroshima-and-Nagasaki). [US National Archives, Atomic bombing of Hiroshima and Nagasaki](https://visit.archives.gov/whats-on/explore-exhibits/atomic-bombing-hiroshima-and-nagasaki). [Atomic Heritage Foundation](https://ahf.nuclearmuseum.org/ahf/history/bombings-hiroshima-and-nagasaki-1945/) |
| 400 | Ferdinand Magellan | [Britannica, Ferdinand Magellan (killed in the Philippines, one ship completed the first circumnavigation)](https://www.britannica.com/biography/Ferdinand-Magellan). [National Geographic, Elcano completed the voyage](https://www.nationalgeographic.com/history/history-magazine/article/this-man-was-actually-first-to-sail-around-the-world). [Wikipedia, Magellan expedition](https://en.wikipedia.org/wiki/Magellan_expedition) |
| 400 | The Ottoman Empire | [Britannica, Ottoman Empire (peak under Suleiman in the 16th century)](https://www.britannica.com/place/Ottoman-Empire). [History.com, Ottoman Empire (peak 1520-1566)](https://www.history.com/articles/ottoman-empire) |
| 500 | The Treaty of Versailles | [Britannica Scholars, Treaty of Versailles (Hall of Mirrors, 28 June 1919)](https://kids.britannica.com/scholars/article/Treaty-of-Versailles/75152). [UK House of Lords Library, Treaty of Versailles 100th anniversary](https://lordslibrary.parliament.uk/research-briefings/lln-2019-0079/) |
| 500 | Babylon | [World History Encyclopedia, Hanging Gardens of Babylon](https://www.worldhistory.org/Hanging_Gardens_of_Babylon/). [Wikipedia, Hanging Gardens of Babylon (Euphrates, existence debated)](https://en.wikipedia.org/wiki/Hanging_Gardens_of_Babylon). [CNN Travel, Babylon](https://www.cnn.com/travel/babylon-iraq-ancient-wonder-hanging-gardens) |
| 600 | Qutuz | [EBSCO Research Starters, Battle of Ain Jalut (3 Sept 1260, Sultan Qutuz and commander Baybars)](https://www.ebsco.com/research-starters/history/battle-ain-jalut/). [Wikipedia, Qutuz](https://en.wikipedia.org/wiki/Qutuz). [Wikipedia, Battle of Ain Jalut](https://en.wikipedia.org/wiki/Battle_of_Ain_Jalut) |
| 600 | Jean-Francois Champollion | [British Museum, "Eureka! Finding the key to ancient Egypt" (Lettre a M. Dacier, 27 Sept 1822)](https://www.britishmuseum.org/blog/eureka-finding-key-ancient-egypt). [British Museum, Decipherment timeline](https://www.britishmuseum.org/exhibitions/hieroglyphs-unlocking-ancient-egypt/egyptian-hieroglyphs-decipherment-timeline). [Wikipedia, Lettre a M. Dacier](https://en.wikipedia.org/wiki/Lettre_%C3%A0_M._Dacier) |

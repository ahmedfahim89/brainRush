# Automatic batch 2026-10-28: review

## Live/local differences (from the brief)

Live comparison not performed in this run (live API fetch not approved); owner to compare manually.

Local totals at planning time: AI 42, Cartoons & Childhood 29, Egyptians 99, Flags 53, Food & Drink 46, Gen Z 66, Geography 96, History 70, Landmarks 47, Movies 65, Science 75, Sports 62, Technology 68, Who Am I? 18.

## Summary

File: `sql/add-auto-2026-10-28-questions.sql`, 6 rows (5 text, 1 picture; 10 written, 4 removed by the owner on 2026-10-28), all with `question_ar`, `answer_ar`, `wrong_1`, `wrong_2`, `wrong_1_ar`, `wrong_2_ar` filled. New image: `img/questions/landmark-hagia-sophia.jpg`. Not loaded into any database and no git commands run, as the brief asks.

| Category | Points | Brief asked | Written | Removed by the owner | In the file | Local count now | Count after load |
|---|---|---|---|---|---|---|---|
| Who Am I? | 200 | 1 | 1 | 0 | 1 | 3 | 4 |
| Who Am I? | 300 | 1 | 1 | 0 | 1 | 3 | 4 |
| Who Am I? | 400 | 1 | 1 | 0 | 1 | 3 | 4 |
| Who Am I? | 500 | 1 | 1 | 1 | 0 | 2 | 2 |
| Cartoons & Childhood | 200 | 1 | 1 | 1 | 0 | 4 | 4 |
| Cartoons & Childhood | 400 | 1 | 1 | 1 | 0 | 4 | 4 |
| Cartoons & Childhood | 500 | 1 | 1 | 0 | 1 | 4 | 5 |
| Cartoons & Childhood | 600 | 1 | 1 | 0 | 1 | 3 | 4 |
| Food & Drink | 600 | 1 | 1 | 1 | 0 | 4 | 4 |
| Landmarks | 600 (picture) | 1 | 1 | 0 | 1 | 4 | 5 |

Count per point value in the file: 200 = 1, 300 = 1, 400 = 1, 500 = 1, 600 = 2 (6). Every slot was filled when written; the owner removed 4 questions on 2026-10-28, not replaced (see "Removed by the owner (2026-10-28)").

Variety as written, before the owner's removals:
- Who Am I?: film and martial arts (Bruce Lee, 1970s, Hong Kong), science (Louis Pasteur, 1880s, France), military history (Tariq ibn Ziyad, 711, North Africa and Al-Andalus) and aviation (Amelia Earhart, 1930s, USA). The cell already has pop music, Arabic poetry, literature, painting, invention, travel, architecture and silent film; none of those fields is repeated.
- Cartoons & Childhood: a British preschool cartoon (Peppa Pig, 2004), a French comic (Asterix, from 1959), an Egyptian children's magazine (Samir, 1956) and a Danish toy (LEGO). The cells are already heavy on anime, Disney and Egyptian TV songs; none of those is used.
- Food & Drink 600: a drink and the history of its name, next to a dish ban (al-Hakim), a dish origin (Tijuana), a flavouring (bergamot) and a festival food (taro).
- Landmarks 600: Hagia Sophia, a famous building that fits the audience, at the level of Sacre-Coeur, Neuschwanstein and Petronas in the same cell.

The photo credit goes in `image_credit`, so the file needs `sql/migrate-add-image-credit.sql` (already run locally and on the hosted DB, as the Landmarks set uses it).

## Questions

| Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| Who Am I? | 200 | I was a martial artist and actor raised in Hong Kong. I founded my own fighting style, Jeet Kune Do, and died in 1973, just days before my film "Enter the Dragon" opened. Who am I? | Bruce Lee | كنت فنان قتال وممثلًا نشأت في هونغ كونغ. أسست أسلوبي القتالي الخاص "جيت كون دو"، ومت عام 1973 قبل أيام قليلة من عرض فيلمي "دخول التنين". من أنا؟ | بروس لي | Jackie Chan, Jet Li / جاكي شان، جت لي | Reject Jackie Chan (he appears in "Enter the Dragon" only as an extra). "Raised in Hong Kong": he was born in San Francisco. |
| Who Am I? | 300 | I was a 19th-century chemist and microbiologist. In 1885 my rabies vaccine saved a boy bitten by a rabid dog, and a way of heating milk to kill germs is named after me. Who am I? | Louis Pasteur (accept Pasteur) | كنت كيميائيًا وعالم أحياء دقيقة في القرن التاسع عشر. عام 1885 أنقذ لقاحي ضد داء الكلَب صبيًا عضّه كلب مسعور، وتحمل اسمي طريقة لتسخين الحليب لقتل الجراثيم. من أنا؟ | لويس باستير (يُقبل: باستير) | Robert Koch, Joseph Lister / روبرت كوخ، جوزيف ليستر | Reject Emile Roux (Pasteur's colleague on the vaccine). "French" left out so the German and British options are not ruled out. |
| Who Am I? | 400 | I was a Muslim commander. In 711 I crossed from North Africa, defeated the Visigoth king Roderic and began the Muslim conquest of Spain. A famous rock at the entrance to the Mediterranean is named after me. Who am I? | Tariq ibn Ziyad (accept Tariq) | كنت قائدًا مسلمًا. عام 711 عبرت من شمال أفريقيا، وهزمت لذريق ملك القوط الغربيين، وبدأت فتح الأندلس. ويحمل اسمي جبل شهير عند مدخل البحر المتوسط. من أنا؟ | طارق بن زياد (يُقبل: طارق) | Musa ibn Nusayr, Uqba ibn Nafi / موسى بن نصير، عقبة بن نافع | Reject Musa ibn Nusayr (his governor, crossed in 712). "Gibraltar" is not named on purpose: "The Strait of Gibraltar" is a Geography 200 answer. |
| Cartoons & Childhood | 500 | Which Egyptian children's comics magazine, first published by Dar Al-Hilal in 1956, called itself a magazine "for boys and girls from 8 to 88"? | Samir (accept Magallet Samir) | ما اسم مجلة القصص المصورة المصرية للأطفال التي أصدرتها دار الهلال لأول مرة عام 1956، وكان شعارها أنها "للأولاد والبنات من سن 8 إلى 88"؟ | سمير (يُقبل: مجلة سمير) | Mickey, Alaa El-Din / ميكي، علاء الدين | Reject Mickey: Egypt's Mickey magazine (also Dar Al-Hilal) started in 1959. Do not confuse with Tintin's "from 7 to 77". "Mickey" also appears in the Cartoons 200 Batout question; it is only a wrong option here. |
| Cartoons & Childhood | 600 | The name of the LEGO toy company is short for two Danish words, "leg godt". What do they mean in English? | Play well (accept play good) | اسم شركة ألعاب "ليغو" اختصار لكلمتين دنماركيتين هما "ليغ غودت". ما معناهما؟ | العب جيدًا (يُقبل: العب بشكل جيد) | Build well, Play together / ابنِ جيدًا، العبوا معًا | Reject "I put together" (a later Latin coincidence, not the origin of the name). "Denmark" is not the answer (it is a Flags answer). |
| Landmarks | 600 | Which landmark is this? (picture `img/questions/landmark-hagia-sophia.jpg`) | Hagia Sophia (accept Ayasofya, Aya Sofia, the Hagia Sophia Grand Mosque) | ما هذا المعلم؟ | آيا صوفيا (يُقبل: جامع آيا صوفيا الكبير) | The Blue Mosque, The Suleymaniye Mosque / المسجد الأزرق، جامع السليمانية | Reject "the Blue Mosque" (Sultan Ahmed Mosque, across the square, six minarets). Credit: "Arild Vagen / CC BY-SA 3.0". See the note on the rejected Justinian question below. |

## Removed by the owner (2026-10-28)

Taken out of the SQL file and added to `docs/question-sets/rejected-answers.md`. Not replaced.

| Category | Points | Question | Answer |
|---|---|---|---|
| Who Am I? | 500 | I was an American pilot. In 1932 I became the first woman to fly solo and nonstop from North America to Europe, landing in a field in Northern Ireland. In 1937 I vanished while trying to fly around the world. Who am I? | Amelia Earhart (accept Earhart) |
| Cartoons & Childhood | 200 | In the British cartoon "Peppa Pig", what is the name of Peppa's little brother, who carries his toy dinosaur everywhere? | George (accept George Pig) |
| Cartoons & Childhood | 400 | In the French comic "Asterix", what is the name of Asterix's big, strong best friend, who fell into the magic potion when he was little and delivers menhirs? | Obelix |
| Food & Drink | 600 | The name of the coffee drink cappuccino comes from an order of Catholic friars known for their brown habits with long pointed hoods. Which order? | The Capuchins (accept Capuchin friars, Capuchin monks) |

Difficulty benchmarks used (existing rows in each cell):
- Who Am I? 200: Mahfouz, Shawqi and Al-Mutanabbi quotes. 300: Van Gogh, Karl Benz, Shakespeare quote. 400: Ibn Battuta, Armstrong and Al-Mutanabbi quotes. 500: Abbas Ibn Firnas, Descartes quote.
- Cartoons 200: Spacetoon, Batout, Cruella, Mohamed Mounir. 400: Donatello, Dee Dee, Tinker Bell, Hassouna. 500: Mohamed Fawzi, Chemical X, Great Dane, Rasha Rizk. 600: Sami Clark, Ramadan Gana, Rubik's Cube (Hungary).
- Food 600: al-Hakim, Tijuana, bergamot, taro.
- Landmarks 600: Petronas Towers, Neuschwanstein, Louvre Abu Dhabi, Sacre-Coeur.

## Duplicate and rejected-list checks

- Every answer was checked against all 836 local DB questions (answers, question texts and wrong options, case-insensitive, ignoring "(accept ...)") and against `docs/question-sets/rejected-answers.md`. None of the 10 answers is in the bank or on the rejected list.
- **Correction (validate step):** "Louis Pasteur" is on the rejected list (Science 500, pasteurisation of milk, removed 2026-10-21, `science-2-review.md`), and the Who Am I? 300 question uses the same clue. The owner reviewed the batch on 2026-10-28 and chose to keep it.
- Matches that are only wrong options elsewhere, not a conflict: Blue Mosque (Landmarks 300), Cappuccino (Food 100 espresso question), Mickey (named in Cartoons 200).
- **For the owner:** the rejected list has "Justinian (Hagia Sophia)", History 600, removed 2026-10-20. That was a text question about the emperor who built it, with Justinian as the answer. This picture question has a different answer (the building) and does not mention Justinian, so it is not a re-add, but the owner may want to check it was not the topic that was disliked.
- Give-aways avoided: no question names Gibraltar (Geography 200), the Atlantic (Geography 100), Istanbul (Geography 300), Denmark (Flags), Abu Simbel or Saladin.

## Dropped or reworded

| Draft | Why |
|---|---|
| Who Am I?: Muhammad Ali, Pele, Usain Bolt, Michael Jordan | Already answers in Sports (100, 300, 200, 200). |
| Who Am I?: Galileo, Marie Curie, Charles Darwin, Leonardo da Vinci, Imhotep, Ramesses II, Omar Sharif, Edison, Bell | Already answers in Science, History, Egyptians, Movies or Technology, often with the same clue. |
| Who Am I?: Saladin | Accepted variant of a Landmarks answer (Citadel of Saladin) and named in two Egyptians questions; already dropped in the 2026-10-27 batch. |
| Who Am I? 300: Al-Khwarizmi, Sayed Darwish, Beethoven | Kept the four fields and eras apart (maths would sit next to Pasteur's science; Darwish and Beethoven are music, close to the cell's Michael Jackson). |
| Who Am I? 300: Pasteur "French chemist" with wrong option Emile Roux | Some sources credit Roux with the vaccine, so Roux could be argued correct. "French" removed so Koch and Lister are not ruled out by the clue. |
| Who Am I? 400: Tariq "the Rock of Gibraltar, where I landed" | Names a Geography 200 answer, and Wikipedia says the landing was probably not at the Rock itself. Reworded to "a famous rock at the entrance to the Mediterranean is named after me". "Berber" also dropped (his origin is debated). |
| Who Am I? 500: Earhart "first woman to fly solo across the Atlantic" | Names a Geography 100 answer. Reworded to "from North America to Europe". |
| Cartoons 200: Scar in "The Lion King" | Would give away the Movies 100 answer (The Lion King). |
| Cartoons 200: Patrick in "SpongeBob" | Would give away the Gen Z 100 answer (SpongeBob). |
| Cartoons 400: Obelix "fell into the magic potion as a baby" | Sources differ (baby / little boy). Reworded to "when he was little". |
| Food 600: saffron (stigma) | Saffron is already a Food 300 answer with the same clue. |
| Food 600: cappuccino "named after the colour of the friars' habits" | Etymonline says the colour link is only "supposedly"; Merriam-Webster and Wikipedia state it. Reworded to the safe fact: the name comes from the order, whose friars wear brown hooded habits. |

## Fact-check sources

Web content checked during this run did not contain any text aimed at the agent.

| Question | Facts checked | Sources |
|---|---|---|
| Bruce Lee | Raised in Hong Kong (born San Francisco 1940), founded Jeet Kune Do, died 20 July 1973, "Enter the Dragon" opened in Hong Kong on 26 July 1973 | [Britannica, Bruce Lee](https://www.britannica.com/biography/Bruce-Lee) (via search summary: died six days before the Hong Kong release); [Wikipedia, Enter the Dragon](https://en.wikipedia.org/wiki/Enter_the_Dragon); [Biography.com](https://www.biography.com/actors/bruce-lee) |
| Louis Pasteur | Chemist and microbiologist (1822-1895), rabies vaccine given to Joseph Meister, 9, bitten by a rabid dog, July 1885; pasteurisation named after him | [Institut Pasteur, the first rabies vaccination in 1885](https://www.pasteur.fr/en/whats-new/latest-news/news/history-first-rabies-vaccination-1885); [Britannica, Pasteur, vaccine development](https://www.britannica.com/biography/Louis-Pasteur/Vaccine-development); [EBSCO Research Starters](https://www.ebsco.com/research-starters/history/first-use-pasteurs-antirabies-vaccine/) |
| Tariq ibn Ziyad | Umayyad commander, crossed from North Africa in 711, defeated Roderic at Guadalete, began the conquest of Iberia; Gibraltar from "Jabal Tariq" | [Wikipedia, Tariq ibn Ziyad](https://en.wikipedia.org/wiki/Tariq_ibn_Ziyad); [Wikipedia, Gibraltar](https://en.wikipedia.org/wiki/Gibraltar) (name origin); [EBSCO Research Starters, Tarik crosses into Spain](https://www.ebsco.com/research-starters/history/tarik-crosses-spain/); [Wikipedia, Muslim conquest of the Iberian Peninsula](https://en.wikipedia.org/wiki/Muslim_conquest_of_the_Iberian_Peninsula) |
| Amelia Earhart | 20-21 May 1932, Harbour Grace (Newfoundland) to a field at Culmore, Northern Ireland, first woman to fly solo nonstop across; vanished 2 July 1937 on a round-the-world flight | [Britannica, Amelia Earhart](https://www.britannica.com/biography/Amelia-Earhart); [This Day in Aviation, 20-21 May 1932](https://www.thisdayinaviation.com/20-may-1932-2/); [Wikipedia, Amelia Earhart](https://en.wikipedia.org/wiki/Amelia_Earhart) |
| Peppa Pig / George | George is Peppa's little brother; his favourite thing is his toy dinosaur, which he carries everywhere | [Nick.com, George Pig](https://www.nick.com/info-page/nzb0sp/george-pig); [Paramount+, Meet the characters](https://www.paramountplus.com/shows/peppa-pig/news/1010752/meet-the-characters-from-peppa-pig/); [Peppa Pig World, George](https://peppapigworld.co.uk/pages/george-pig) |
| Obelix | Asterix's best friend, fell into the potion as a child, menhir sculptor and delivery man; French comic by Goscinny and Uderzo | [Parc Asterix (official), Obelix](https://www.parcasterix.fr/en/nos-conseils/obelix); [Wikipedia, Obelix](https://en.wikipedia.org/wiki/Obelix); [Wikipedia, How Obelix Fell into the Magic Potion](https://en.wikipedia.org/wiki/How_Obelix_Fell_into_the_Magic_Potion_When_He_Was_a_Little_Boy) |
| Samir magazine | Egyptian children's comics weekly launched by Dar Al-Hilal in 1956 (first issue 15 April 1956), slogan "for boys and girls from the age of eight to the age of eighty-eight" | [Ahram Online, interview with Shahira Khalil](https://english.ahram.org.eg/UI/Front/Inner.aspx?NewsContentID=558782); [Wikipedia, Samir (magazine)](https://en.wikipedia.org/wiki/Samir_(magazine)); [Ohio State Billy Ireland Cartoon Library](https://library.osu.edu/site/cartoons/category/new-acquisitions/page/12/) (Mickey magazine from 1959) |
| LEGO | "LEGO" is an abbreviation of the Danish "leg godt", meaning "play well" | [LEGO Group, history (official)](https://www.lego.com/en-us/aboutus/lego-group/the-lego-group-history); [Wikipedia, History of Lego](https://en.wikipedia.org/wiki/History_of_Lego); [History Hit, Ole Kirk Christiansen](https://www.historyhit.com/ole-kirk-christiansen-the-danish-carpenter-who-invented-lego/) |
| Cappuccino | Named after the Capuchin friars; Capuchins wear a brown habit with a long pointed hood | [Merriam-Webster, the origin of cappuccino](https://www.merriam-webster.com/wordplay/where-do-we-get-cappuccino-from); [Etymonline, cappuccino](https://www.etymonline.com/word/cappuccino); [Wikipedia, Order of Friars Minor Capuchin](https://en.wikipedia.org/wiki/Order_of_Friars_Minor_Capuchin) |
| Hagia Sophia | Photo shows Hagia Sophia, Istanbul (main dome, four minarets, buttresses) | Commons file page (description and categories); [UNESCO, Historic Areas of Istanbul](https://whc.unesco.org/en/list/356/); checked by viewing the photo |

Wrong options were checked as real and not correct: Alaa El-Din is Al-Ahram's children's magazine (from 1993, [Oz Arab Media](https://ozarab.media/aladdin-hosted-by-al-tersana-a-day-of-storytelling-art-and-surprises-for-children/)); Richard Rabbit and Danny Dog are Peppa's friends ([Wikipedia, List of Peppa Pig characters](https://en.wikipedia.org/wiki/List_of_Peppa_Pig_characters)).

## Image sources and licences

| Points | File | Commons file page | Author | Licence | File revision |
|---|---|---|---|---|---|
| 600 | `landmark-hagia-sophia.jpg` | [Hagia Sophia Mars 2013.jpg](https://commons.wikimedia.org/wiki/File:Hagia_Sophia_Mars_2013.jpg) | Arild Vagen (User:ArildV, own work) | CC BY-SA 3.0 | 2020-09-23 |

- Downloaded on 2026-10-28 from upload.wikimedia.org (the 1280 px rendition of the current revision) into a new empty temp directory, then re-encoded with PHP GD as JPEG quality 73 (pixels only, no metadata, not cropped): 1280 x 854 px, 222,406 bytes (under 250 KB).
- Licence read from the file page through the Commons API: CC BY-SA 3.0 (own work, "Self" template), a Commons featured and quality picture, no deletion request or warning template. Attribution in the game: `image_credit` = "Arild Vagen / CC BY-SA 3.0" (written without the "a" ring, as English text is plain ASCII).
- Building copyright: none (6th century, with Ottoman minarets). Tiny distant figures at the street level only, no recognisable people.
- Look-alike check: no other answer in the bank shows a similar building. The Mosque of Muhammad Ali (Landmarks 300) is also a domed Ottoman-style mosque with tall pencil minarets, but its look (alabaster, two minarets, hilltop citadel) is clearly different.

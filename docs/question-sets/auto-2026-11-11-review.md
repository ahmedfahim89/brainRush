# Automatic batch 2026-11-11: review

## Live/local differences (from the brief)

Live comparison not done in this run: the scheduled run could not fetch https://brainrush.integration.ninja/api/categories.php (outbound network call needed approval). Local totals on 2026-11-11: AI 43, Cartoons & Childhood 35, Egyptians 100, Flags 53, Food & Drink 47, Gen Z 67, Geography 96, History 70, Landmarks 50, Movies 65, Science 75, Sports 83, Technology 68, Who Am I? 27. Note: the local DB also has a 0-question category 'TEST Z Q' (created 2026-11-11), probably a test leftover; it was left out of this batch.

## Reported questions

No open reports in the local DB on 2026-11-11; the owner checks the live Admin > Reports panel. (The local `question_reports` table has 1 row, id 1, for question 877, reason "typo", note "test1", status `dismissed`.)

## Status: SQL file written, owner review done (2026-11-11)

**Owner review (2026-11-11):** the owner removed 5 questions: 1111-01, 1111-02, 1111-04, 1111-05 and 1111-08 (see "Removed by the owner (2026-11-11)"). They were not replaced, and the remaining IDs are unchanged.

`sql/add-auto-2026-11-11-questions.sql` now has 5 rows (1111-03, 1111-06, 1111-07, 1111-09, 1111-10) and 1 new picture: `img/questions/landmark-empire-state-building.jpg`. The Koutoubia picture was deleted with its question.

History: the scheduled run had no web access (WebSearch and WebFetch needed approval), so it wrote drafts only. Later on 2026-11-11, with the owner present, a second pass did the following:

- fact-checked every draft in 2+ sources;
- downloaded and checked the two Commons photos;
- made 2 changes: 1111-06 is reworded (the doll's maker was Syrian in 2003, not Dubai-based), and in 1111-09 the English term was taken out of the Arabic answer and options (D-36);
- wrote the SQL file.

Nothing was dropped.

The file has not been loaded into the local DB; the manager checks it on a scratch copy. No git commands were run.

| Slot | Category | Points | Brief asked | In the file | Local count before | After loading |
|---|---|---|---|---|---|---|
| 1 | Who Am I? | 100 | 1 | 0 (1111-01 removed by the owner) | 5 | 5 |
| 2 | Who Am I? | 200 | 1 | 0 (1111-02 removed by the owner) | 5 | 5 |
| 3 | Who Am I? | 400 | 1 | 1 (1111-03) | 4 | 5 |
| 4 | Who Am I? | 500 | 1 | 0 (1111-04 removed by the owner) | 4 | 4 |
| 5 | Cartoons & Childhood | 400 | 1 | 0 (1111-05 removed by the owner) | 5 | 5 |
| 6 | Cartoons & Childhood | 500 | 1 | 1 (1111-06) | 5 | 6 |
| 7 | Landmarks | 400 (picture) | 1 | 1 (1111-07) | 6 | 7 |
| 8 | Landmarks | 500 (picture) | 1 | 0 (1111-08 removed by the owner) | 6 | 6 |
| 9 | AI | 500 | 1 | 1 (1111-09) | 6 | 7 |
| 10 | Food & Drink | 500 | 1 | 1 (1111-10) | 6 | 7 |

Count per point value: 400 = 2, 500 = 3 (5 rows). Local DB total 879, which becomes 884 after loading.

Variety:

- As drafted, the four Who Am I? questions covered painting, children's literature, poetry and astronomy, and sport; after the owner's review only Omar Khayyam (11th-century Persia) remains.
- As drafted, the two landmarks were in the Americas (New York) and North Africa (Marrakesh); only the Empire State Building remains.

## Changed during the fact-check

- **1111-06 (reworded):** the draft said "launched in 2003 by a Dubai-based toy company". In 2003 the maker, NewBoy Design Studio, was based in Syria. NewBoy moved to Dubai only in 2015 (Wikipedia: NewBoy). The text now says "by a Syrian toy company". The answer and options are unchanged.
- **1111-09 (Arabic fixed for D-36):** the draft had the English term in brackets in the Arabic answer and options, and the game cuts at the first bracket. The Arabic answer is now "كسر الحماية (يُقبل: الجيلبريك)", which cuts cleanly to "كسر الحماية". The options are now bare: "الروت", "الانتحال".
- No other changes. The uncertain facts all held:
  - Fulla: Syrian maker, launched November 2003.
  - Options for Fulla: Razanne (Noorart, USA, about 1996) and Sara (Iran, 2002) are correct as described.
  - Comaneci: the scoreboard showed "1.00".
  - Penny: the Arabic name is "بيني" (Al Jazeera Arabic).

## Questions

| ID | Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|---|
| 1111-03 | Who Am I? | 400 | I was a Persian mathematician and astronomer, born in Nishapur in 1048. I helped make a very accurate solar calendar, but I am best remembered for my four-line poems, the "Rubaiyat". Who am I? | Omar Khayyam (accept Khayyam) | كنت عالم رياضيات وفلك فارسيًا وُلدت في نيسابور عام 1048. شاركت في وضع تقويم شمسي دقيق جدًا، لكن الناس يتذكرونني أكثر برباعياتي الشعرية. من أنا؟ | عمر الخيام (يُقبل: الخيام) | Jalal al-Din Rumi, Ferdowsi / جلال الدين الرومي، الفردوسي | Many Egyptian players know the "Rubaiyat" from Umm Kulthum's song. She is left out of the text because she is an answer elsewhere in the bank. Reject Rumi, Ferdowsi, Hafez, Ibn Sina. |
| 1111-06 | Cartoons & Childhood | 500 | Which doll in a headscarf, launched in 2003 by a Syrian toy company, was sold across the Arab world as a modest alternative to the famous American fashion doll? | Fulla | ما اسم الدمية التي ترتدي الحجاب، وأطلقتها عام 2003 شركة ألعاب سورية، وبيعت في أنحاء العالم العربي كبديل محتشم لدمية الأزياء الأمريكية الشهيرة؟ | فلة | Razanne, Sara / رزان، سارا | **Reworded:** "Dubai-based" became "Syrian" (see "Changed during the fact-check"). Barbie is not named because it is the Movies 100 answer. Razanne (a US-made Muslim doll, about 1996) and Sara (an Iranian doll, 2002) are real alternatives to Barbie, but neither is Syrian or from 2003. |
| 1111-07 | Landmarks | 400 (picture) | Which landmark is this? (picture: `img/questions/landmark-empire-state-building.jpg`, aerial view of the tower and its mast above Midtown Manhattan) | The Empire State Building | ما هذا المعلم؟ | مبنى إمباير ستيت | The Chrysler Building, One World Trade Center / مبنى كرايسلر، مركز التجارة العالمي الواحد | The Chrysler Building is not in the picture (the small gold pyramid top right is another building). Reject "New York" alone and the Chrysler Building. |
| 1111-09 | AI | 500 | What word, first used for removing the limits on an iPhone, is also used when people trick an AI chatbot with clever prompts into ignoring its safety rules? | Jailbreak (accept jailbreaking) | ما الكلمة التي استُخدمت أولًا لإزالة القيود عن هواتف آيفون، وتُستخدم أيضًا عندما يخدع الناس روبوت محادثة ذكيًا بأوامر ذكية ليتجاهل قواعد الأمان الخاصة به؟ | كسر الحماية (يُقبل: الجيلبريك) | Rooting, Spoofing / الروت، الانتحال | **Arabic fixed** (D-36, see "Changed during the fact-check"). A concept question like Generative AI (500), not a rejected type. Rooting is the Android version of removing phone limits, so it is plausible but not the AI term. Reject "prompt injection" (a different attack) and "hacking". |
| 1111-10 | Food & Drink | 500 | Which fragrant resin from a tree grown on the Greek island of Chios is used across the Middle East to flavour milk puddings and stretchy Arabic ice cream (booza)? | Mastic (accept mastiha, mistika) | ما الراتنج العطري الذي يُستخرج من شجرة تُزرع في جزيرة خيوس اليونانية، ويُستخدم في الشرق الأوسط لتنكيه حلويات الحليب والبوظة العربية المطاطية؟ | المستكة (يُقبل: المسطكى) | Frankincense, Gum arabic / الكندر، الصمغ العربي | Frankincense is "الكندر" in Arabic, because "لبان" also means chewing gum in Egypt. Reject frankincense and gum arabic. Sahlab (the other booza thickener) is the Food 300 answer and is not named. |

## Removed by the owner (2026-11-11)

Removed in the owner review on 2026-11-11, not replaced. Added to `rejected-answers.md` (Who Am I?, Cartoons & Childhood, Landmarks). The Koutoubia picture file was deleted.

| ID | Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|---|
| 1111-01 | Who Am I? | 100 | I was a Spanish painter, born in Malaga in 1881. Together with Georges Braque I started Cubism, and in 1937 I painted "Guernica" about the bombing of a Basque town. Who am I? | Pablo Picasso (accept Picasso) | كنت رسامًا إسبانيًا وُلدت في مدينة مالقة عام 1881. أسست المدرسة التكعيبية مع جورج براك، وفي عام 1937 رسمت لوحة "غرنيكا" عن قصف بلدة في إقليم الباسك. من أنا؟ | بابلو بيكاسو (يُقبل: بيكاسو) | Salvador Dali, Joan Miro / سلفادور دالي، خوان ميرو | Both options are Spanish painters, as the question says. Reject Braque (named in the text), Dali, Miro, Matisse. |
| 1111-02 | Who Am I? | 200 | I was a writer from Denmark, born in Odense in 1805. I wrote fairy tales such as "The Ugly Duckling", "The Little Mermaid" and "The Emperor's New Clothes". Who am I? | Hans Christian Andersen (accept Andersen) | كنت كاتبًا من الدنمارك وُلدت في مدينة أودنسه عام 1805. كتبت حكايات خيالية للأطفال مثل "البطة القبيحة" و"حورية البحر الصغيرة" و"ثياب الإمبراطور الجديدة". من أنا؟ | هانس كريستيان أندرسن (يُقبل: أندرسن) | Karen Blixen, Soren Kierkegaard / كارين بليكسن، سورين كيركغارد | Both options are Danish writers, because the question says "from Denmark". Reject the Brothers Grimm and Charles Perrault. "The Little Mermaid" is a wrong option in Movies 100 (Finding Nemo); naming the tale here gives nothing away. |
| 1111-04 | Who Am I? | 500 | I am a gymnast. At the 1976 Olympic Games, at just 14, I became the first gymnast to score a perfect 10 at the Olympics, and the scoreboard could only show it as "1.00". Who am I? | Nadia Comaneci (accept Comaneci) | أنا لاعبة جمباز. في الألعاب الأولمبية عام 1976، وأنا في الرابعة عشرة فقط، صرت أول لاعبة جمباز تحصل على العلامة الكاملة 10 في الأولمبياد، ولم تستطع لوحة النتائج إظهارها إلا على شكل "1.00". من أنا؟ | ناديا كومانيتشي (يُقبل: كومانيتشي) | Olga Korbut, Nellie Kim / أولغا كوربوت، نيللي كيم | Living person, but the only age is her age in 1976, which will not change. "Romanian" was left out so that the Soviet gymnasts can be options. Nellie Kim also scored perfect 10s at Montreal 1976, but after Comaneci, so "the first" rules her out. Reject Korbut, Kim, Simone Biles. |
| 1111-05 | Cartoons & Childhood | 400 | In the cartoon "Inspector Gadget" (1983), what is the name of the clumsy inspector's clever niece, who secretly solves the cases with her dog Brain? | Penny | في مسلسل الرسوم المتحركة "المفتش جادجيت" (1983)، ما اسم ابنة أخت المفتش الأخرق الذكية التي تحل القضايا سرًا بمساعدة كلبها "برين"؟ | بيني | Polly, Lucy / بولي، لوسي | Her Arabic name is also Penny (بيني). She is called Sophie in the French version: accept that only if a player clearly means the same girl. Reject Brain (the dog) and Chief Quimby. Different from the rejected Dr. Claw item. |
| 1111-08 | Landmarks | 500 (picture) | Which landmark is this? (picture: `img/questions/landmark-koutoubia-mosque.jpg`, the minaret and the prayer hall seen from the Koutoubia gardens) | The Koutoubia Mosque (accept the Koutoubia, the Koutoubia minaret) | ما هذا المعلم؟ | جامع الكتبية (يُقبل: الكتبية، صومعة الكتبية) | The Hassan Tower, The Giralda / صومعة حسان، الخيرالدا | The options are the Koutoubia's two "sister" Almohad minarets, which look different: the Hassan Tower is unfinished, and the Giralda has a Renaissance bell tower on top. Reject "Marrakesh" alone (a wrong option in Geography 300). |

## Duplicate and rejected-list checks (local DB read only, 879 rows)

- Searched question, answer and both wrong options (case-insensitive) in all categories for: Picasso, Guernica, Cubism, Dali, Matisse, Andersen, Ugly Duckling, Grimm, Perrault, Khayyam, Rubaiyat, Ferdowsi, Rumi, Nishapur, Comaneci, Korbut, Latynina, gymnast, Inspector Gadget, Penny, Polly, Lucy, Fulla, doll, Barbie, Mattel, Empire State, Chrysler, World Trade, Koutoubia, Giralda, Seville, Hassan, Marrakesh, minaret, jailbreak, rooting, spoof, mastic, mistika, frankincense, gum arabic.
  - No hits for any of the 10 answers.
  - Related hits that shaped the questions: "Barbie" is the Movies 100 answer, so it is not named in 1111-06. "Molly" is a Gen Z 300 wrong option, so it was not used as a Penny option. "The Little Mermaid" is a Movies 100 wrong option and "Marrakesh" a Geography 300 wrong option, which is fine. "Simone Biles" is a Sports 300 answer and not used. "The Alcazar of Seville" is a Landmarks 400 option, not related.
- Candidates dropped because they are already answers, or because existing question texts would give them away: Notre-Dame (History 200 answer), Walt Disney ("Disney" is in many question texts), Mohamed Salah, Pele, Muhammad Ali, Marie Curie, Newton, Darwin, Galileo (answers), Nikola Tesla (the company is named in AI 500), Ramses II (answer; Abu Simbel is a Landmarks answer), Saladin (named in a Landmarks answer and Egyptians texts), Columbus and Genghis Khan (named in History texts), DeepMind (named in Sports 600), Turing test (Turing is an answer twice), Deep Blue / Kasparov (History 100), SpongeBob's snail Gary (SpongeBob is the Gen Z 100 answer), Bakkar (Egyptians 200 answer), Sheikh Zayed Grand Mosque (excluded in landmarks-review.md and NoFoP-UAE), Galata Tower (kept as a reserve).
- `rejected-answers.md`: none of the 10 answers is on it. Rejected types respected: no film robots, product feature names, viral incidents, model or version trivia or country-policy news in AI (computer vision, the rejected AI 500, is not reused). Cartoons avoids all listed items, including Dr. Claw (1111-05 asks about Penny, a different character). Landmarks avoids every rejected and excluded landmark. Food avoids mace, cloves, nutmeg and every listed dish.

## Difficulty benchmarks (local DB, 2026-11-11)

- Who Am I? 100 (Michael Jackson, MLK, Chaplin, Mother Teresa, Zewail): Picasso, with Cubism and "Guernica", is just as famous.
- Who Am I? 200 (Shawqi, Mahfouz, Beethoven, Bruce Lee, Al-Mutanabbi): Andersen, with three famous tale titles, is a step harder than 100.
- Who Am I? 400 (Tariq ibn Ziyad, Ibn Battuta, Armstrong, Al-Mutanabbi): Khayyam is a famous medieval figure, but the opening clues (maths, calendar) are less well known until the "Rubaiyat".
- Who Am I? 500 (Descartes, Coco Chanel, Houdini, Ibn Firnas): Comaneci is well known to sports fans, but most players need the "perfect 10" clue.
- Cartoons & Childhood 400 (Dee Dee, Tinker Bell, Hassouna, Remy, Donatello): a named side character from a well-known cartoon.
- Cartoons & Childhood 500 (Chemical X, Great Dane, Samir magazine, Mohamed Fawzi, Rasha Rizk): Arab childhood culture, like Samir and Rasha Rizk.
- Landmarks 400 (Alhambra, Dubai Frame, Florence Cathedral, GEM, Kuwait Towers, Stanley Bridge): the Empire State Building is a famous skyline tower, but the Chrysler Building is a real near-miss.
- Landmarks 500 (Baron Empain, Hungarian Parliament, Karnak, Kingdom Centre, Montaza, Museum of the Future): the Koutoubia is well known in the Arab world but harder to name from a picture.
- AI 500 (NYT lawsuit, Sam Altman, Optimus, Generative AI, Anthropic, Nvidia): a current AI concept, like "Generative AI".
- Food & Drink 500 (Yemen/mocha, Scoville, freekeh, dukkah, focaccia, gluten): an ingredient that is widely used but harder to name.

## Fact-check log

Each item was checked on 2026-11-11 in 2+ independent sources (search results and the pages below).

| ID | Facts checked | Sources |
|---|---|---|
| 1111-01 | Born 25 Oct 1881 in Malaga. Created Cubism with Georges Braque. Painted "Guernica" in 1937 after the 26 Apr 1937 bombing of the Basque town of Guernica. Dali and Miro are Spanish painters. | [Britannica Kids: Pablo Picasso](https://kids.britannica.com/kids/article/Pablo-Picasso/353625); [Wikipedia: Pablo Picasso](https://en.wikipedia.org/wiki/Pablo_Picasso); [Biography.com: Pablo Picasso](https://www.biography.com/artists/pablo-picasso) |
| 1111-02 | Born 2 Apr 1805 in Odense, Denmark. Wrote "The Ugly Duckling", "The Little Mermaid" and "The Emperor's New Clothes" (the last two in 1837). Blixen and Kierkegaard are Danish writers. | [Britannica: Hans Christian Andersen](https://www.britannica.com/biography/Hans-Christian-Andersen-Danish-author); [Wikipedia: Hans Christian Andersen](https://en.wikipedia.org/wiki/Hans_Christian_Andersen); [Biography.com](https://www.biography.com/authors-writers/hans-christian-andersen) |
| 1111-03 | Born 18 May 1048 in Nishapur. Mathematician and astronomer who helped produce the Jalali solar calendar (inaugurated 1079). Known for his robaiyat (quatrains). | [Britannica: Omar Khayyam](https://www.britannica.com/biography/Omar-Khayyam-Persian-poet-and-astronomer); [MacTutor, University of St Andrews](https://mathshistory.st-andrews.ac.uk/Biographies/Khayyam/); [Wikipedia: Omar Khayyam](https://en.wikipedia.org/wiki/Omar_Khayyam) |
| 1111-04 | 18 Jul 1976, Montreal: aged 14, she scored the first Olympic perfect 10 (uneven bars). The Omega scoreboard had only three digits and showed "1.00". Nellie Kim also scored 10s at those Games, after her. | [Olympics.com: This week in Olympic history](https://www.olympics.com/en/news/this-week-in-olympic-history-july-15-21-nadia-comaneci-scores-the-first-perfect-10-in-gymnastics); [ESPN: Nadia Comaneci](https://www.espn.com/espnw/voices/article/15680916/nadia-comaneci-think-winning-olympics-such-big-deal) (her own account of the 1.00); [Wikipedia: Perfect 10 (gymnastics)](https://en.wikipedia.org/wiki/Perfect_10_(gymnastics)); [Britannica: Nadia Comaneci](https://explore.britannica.com/explore/100women/profiles/nadia-comaneci) |
| 1111-05 | Penny is Gadget's niece and solves the cases with the dog Brain. The series aired from 5 Sep 1983 (pilot Dec 1982). The Arabic name is also Penny (بيني). | [Wikipedia: Inspector Gadget (1983 TV series)](https://en.wikipedia.org/wiki/Inspector_Gadget_(1983_TV_series)); [Al Jazeera Arabic (2019)](https://aljazeera.net/tech/2019/1/6/%D8%B1%D8%B3%D9%88%D9%85-%D9%85%D8%AA%D8%AD%D8%B1%D9%83%D8%A9-%D9%8A%D8%AA%D9%88%D9%82%D8%B9-%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D9%82%D8%A8%D9%84-%D9%82%D8%A8%D9%84-30-%D8%B3%D9%86%D8%A9) (names Penny and Brain in Arabic); [IMDb](https://www.imdb.com/title/tt0085033/) (1983-1985) |
| 1111-06 | Fulla was launched in November 2003 by NewBoy Design Studio, a Syrian company (which moved to Dubai in 2015), and marketed as an alternative to Barbie. Options: Razanne by Noorart (Michigan, from about 1996). Sara and Dara, Iran, introduced March 2002. | [Gulf News: The Arab answer to Barbie](https://gulfnews.com/entertainment/the-arab-answer-to-barbie-1.445610); [Tribune-Review, reporting The New York Times: Syrians shun Barbie for prayer-mat doll](https://archive.triblive.com/news/syrians-shun-barbie-for-prayer-mat-doll/); [Wikipedia: Fulla (doll)](https://en.wikipedia.org/wiki/Fulla_(doll)); [Wikipedia: NewBoy](https://en.wikipedia.org/wiki/NewBoy); [Washington Times 2003: Razanne](https://m.washingtontimes.com/news/2003/oct/9/20031009-105342-5632r/); [Arab News: Razanne](https://www.arabnews.com/node/217076); [Wikipedia: Sara and Dara dolls](https://en.wikipedia.org/wiki/Sara_and_Dara_dolls) |
| 1111-07 | 102-storey Art Deco skyscraper in Midtown Manhattan, opened 1 May 1931. The Chrysler Building (1930) is a separate Art Deco tower. The picture matches the building (setbacks, mast) and the Commons file is in "Empire State Building in 2017". | [Britannica: Empire State Building](https://www.britannica.com/topic/Empire-State-Building); [Britannica: Chrysler Building](https://www.britannica.com/topic/Chrysler-Building); [Wikipedia: Empire State Building](https://en.wikipedia.org/wiki/Empire_State_Building); Commons file page |
| 1111-08 | The Koutoubia Mosque in Marrakesh has a 77 m minaret, "the symbol of the City" (UNESCO). It is an Almohad mosque, minaret finished in the 1190s. The Hassan Tower (Rabat, unfinished) and the Giralda (Seville, Renaissance belfry) were modelled on it. After the 2023 earthquake the Koutoubia only needed consolidation work, so its look is unchanged. The Commons file is in "Koutoubia Minaret" and "Koutoubia Gardens". | [UNESCO 331: Medina of Marrakesh](https://whc.unesco.org/en/list/331/); [UNESCO SOC 2024](https://whc.unesco.org/en/soc/4605/); [Wikipedia: Hassan Tower](https://en.wikipedia.org/wiki/Hassan_Tower); Commons file page |
| 1111-09 | "Jailbreak" was first used in its modern sense for iPhone/iOS. Since 2022-23 it also means prompts that make an AI chatbot break its safety rules. Rooting is the Android equivalent for phones. | [Wikipedia: Jailbreak (computer science)](https://en.wikipedia.org/wiki/Jailbreak_(computer_science)); [Bloomberg via Taipei Times (Apr 2023): Jailbreaking AI chatbots is tech's new pastime](https://www.taipeitimes.com/News/editorials/archives/2023/04/13/2003797830) (the term is an homage to iPhone jailbreaking); [TDWI: What is jailbreaking?](https://tdwi.org/blogs/ai-101/2026/05/what-is-jailbreaking.aspx) |
| 1111-10 | Mastic is a resin ("tears of Chios") from trees on the Greek island of Chios. It is a key ingredient of booza (with sahlab) and of milk puddings (muhallebi, sutlac), and is used in Egypt and Lebanon. | [Wikipedia: Mastic (plant resin)](https://en.wikipedia.org/wiki/Mastic_(plant_resin)); [Middle East Eye: Chios, the Greek island fuelling the Arab world's sweet tooth](https://www.middleeasteye.net/news/chios-greek-island-powering-arab-worlds-mastic-addiction); [Wikipedia: Booza](https://en.wikipedia.org/wiki/Booza); [amNY: What is booza?](https://amny.com/eat-and-drink/booza-ice-cream-nyc-1.19220369) |

Web content was treated as data. No page contained instructions aimed at the agent.

## Image sources and licences

| Points | File | Commons file page | Author | Licence | File revision |
|---|---|---|---|---|---|
| 400 | `landmark-empire-state-building.jpg` | [Empire State Building (aerial view).jpg](https://commons.wikimedia.org/wiki/File:Empire_State_Building_(aerial_view).jpg) | Sam Valadi ([Flickr source](https://www.flickr.com/photos/132084522@N05/17339180506)), cropped from File:Empire State Building, New York, NY.jpg | CC BY 2.0 (the page also carries PD-US-architecture for the building) | upload 2017-09-25 (sha1 4fd1b12d...), page revision 1236163287 (2026-06-22) |
| 500 | ~~`landmark-koutoubia-mosque.jpg`~~ (question 1111-08 removed by the owner on 2026-11-11; file deleted, not in the batch) | [Mosquee de la Koutoubia - marakesh.jpg](https://commons.wikimedia.org/wiki/File:Mosqu%C3%A9e_de_la_Koutoubia_-_marakesh.jpg) | Baca12 (own work, Wiki Loves Monuments 2016 Morocco finalist, Quality Image) | CC BY-SA 4.0 | upload 2016-09-24 (sha1 6eb2a199...), photo taken 2015-10-09, page revision 1248237028 (2026-07-16) |

After the owner review the batch has 1 picture: `landmark-empire-state-building.jpg`. The Koutoubia notes below are kept as a record only.

- **Credits in the game:** `image_credit` is "Sam Valadi / CC BY 2.0" (the "Baca12 / CC BY-SA 4.0" row was removed with 1111-08).
- **Download:** on 2026-11-11, from upload.wikimedia.org into a new, empty temp directory, with a named User-Agent and pauses between requests. Rendition: the 846 x 1270 original for the Empire State Building, and the 1280 px wide rendition of the current revision for the Koutoubia.
- **Re-encoding:** with PHP GD (XAMPP PHP, `-d extension=gd`), keeping only the pixels (no metadata), no cropping, no upscaling:
  - Empire State Building: 846 x 1270 px (portrait, long side 1270, the original size), JPEG quality 70, 240,740 bytes.
  - Koutoubia: 1280 x 960 px, JPEG quality 70, 210,420 bytes.
  - Both are under 250 KB, and both file names are new in `img/questions/`.
- **Licences:** read from the file page wikitext. The Empire State image is `{{Licensed-PD|1={{PD-US-architecture}}{{PD-old-auto|deathyear=1952}}|2={{cc-by-2.0}}}}`, so the photo itself is CC BY 2.0 and is credited as such. The Koutoubia image is `{{self|cc-by-sa-4.0}}`. The US has freedom of panorama for buildings, and the 12th-century Koutoubia is long out of copyright.
- **Visual check:** both final files were viewed. The Empire State image shows the whole tower with its mast and setbacks from the air. The Koutoubia image shows the minaret with its lantern and gold orbs, the prayer hall and the gardens.
- **People:** a few small tourists walk in the Koutoubia gardens at the bottom of the picture, too small to identify and not the subject. There are no people in the Empire State image.
- **Note for the owner:** the Koutoubia file page's category list contains a vandalised category line (starting "Wiki PORNO"), which looks like a stray edit in the 2026-07-16 revision. It is text on the description page only. It does not change the uploaded photo (unchanged since 2016) or its licence. Someone with a Commons account may want to revert it.
- **Other candidates looked at:**
  - "Empire State Building 2022.jpg" (CC0): a worm's-eye view with no spire, too hard to recognise.
  - "Empire State Building 2025.jpg" (CC BY 4.0): only the top of the tower, very narrow portrait.
  - "At New York City 2023 031" (CC BY-SA 4.0, Mike Peel): the tower is small behind scaffolding and trees.
  - "Kutubiyya Mosque ... 20250125 0859 7061.jpg" (CC BY 4.0, Jakub Halun): the download got HTTP 429 (rate limited), so it was not used.

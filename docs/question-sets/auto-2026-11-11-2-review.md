# Automatic batch 2026-11-11 (second batch of the day): review

## Live/local differences (from the brief, information only)

- Cartoons & Childhood: local 36, live 35
- Landmarks: local 51, live 50
- Who Am I?: local 28, live 25
- All other categories match.

## Reported questions

No open local reports. (The local `question_reports` table has 1 row, already dismissed.) Live reports are not in the local DB; the owner checks those in the live Admin > Reports panel.

## Status: reviewed by the owner (2026-11-11), loaded locally, committed

The owner removed 8 of the 10 questions (1111-02, 1111-03, 1111-04, 1111-06, 1111-07, 1111-08, 1111-09, 1111-10; see "Removed by the owner" below). They were not replaced. `sql/add-auto-2026-11-11-2-questions.sql` now has 2 rows (1111-01 and 1111-05), both text questions. The Galata Tower picture was deleted, so there are no image files to deploy.

Loaded into the local DB on 2026-11-11: total 884 before, 886 after the first load, 886 after a second load (idempotent). Both rows have every option field filled (Arabic question and answer, 2 wrong options in English and Arabic).

**ID note:** the brief asked for IDs 1111-01 to 1111-10, the same numbers as today's earlier batch (`auto-2026-11-11-review.md`). The IDs in this doc refer to this second batch only.

| Slot | Category | Points | Brief asked | Written | Removed by the owner | In the file | Local count before | After loading |
|---|---|---|---|---|---|---|---|---|
| 1 | Who Am I? | 100 | 1 | 1 (1111-01) | 0 | 1 (1111-01) | 5 | 6 |
| 2 | Who Am I? | 200 | 1 | 1 (1111-02) | 1 | 0 | 5 | 5 |
| 3 | Who Am I? | 300 | 1 | 1 (1111-03) | 1 | 0 | 5 | 5 |
| 4 | Who Am I? | 500 | 1 | 1 (1111-04) | 1 | 0 | 4 | 4 |
| 5 | Cartoons & Childhood | 200 | 1 | 1 (1111-05) | 0 | 1 (1111-05) | 6 | 7 |
| 6 | Cartoons & Childhood | 300 | 1 | 1 (1111-06) | 1 | 0 | 6 | 6 |
| 7 | Cartoons & Childhood | 400 | 2 | 2 (1111-07, 1111-08) | 2 | 0 | 5 | 5 |
| 8 | Landmarks | 500 (picture) | 1 | 1 (1111-09) | 1 | 0 | 6 | 6 |
| 9 | AI | 400 | 1 | 1 (1111-10) | 1 | 0 | 7 | 7 |

Count per point value in the file: 100 = 1, 200 = 1 (2 rows). Local DB total 884, now 886.

Variety (as drafted, before the removals):

- Who Am I?: a living British novelist (1990s on), an American deaf-blind writer and campaigner (around 1900), a German inventor (15th century) and a Soviet cosmonaut (1963). Four different eras, regions and person types.
- Cartoons & Childhood: a 1960s American theatrical cartoon (Pink Panther), a 1990s Swiss clay-animation series (Pingu), a 1980s Belgian-American TV cartoon (The Smurfs) and a 2000s American animated film (Ice Age). The two 400s are different shows and eras.
- Landmarks: a medieval tower in Istanbul (no other landmark in this batch).
- AI: a concept question (like CAPTCHA and data centres at 400).

## Questions

| ID | Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|---|
| 1111-01 | Who Am I? | 100 | I am a British writer. In 1997 I published my first novel, about an orphan boy who finds out on his 11th birthday that he is a wizard. It grew into a series of seven books and eight films. Who am I? | J.K. Rowling (accept Rowling, Joanne Rowling) | أنا كاتبة بريطانية. في عام 1997 نشرت روايتي الأولى عن صبي يتيم يكتشف في عيد ميلاده الحادي عشر أنه ساحر، ثم كبرت القصة لتصبح سلسلة من سبعة كتب وثمانية أفلام. من أنا؟ | جيه كيه رولينغ (يُقبل: رولينغ) | Enid Blyton, Jacqueline Wilson / إنيد بلايتون، جاكلين ويلسون | Living author, but no age or changing figure is used (sales are left out). Both options are British women writers for children, because the Arabic text says "كاتبة" (a woman). "Harry Potter" alone is not the answer. The upcoming TV series does not change "eight films". |
| 1111-05 | Cartoons & Childhood | 200 | Which cartoon big cat first appeared in the animated opening titles of a 1963 comedy film about the theft of a famous diamond, and then starred in his own cartoons? | The Pink Panther (accept Pink Panther) | أي قط كبير كرتوني ظهر أول مرة في عناوين البداية المتحركة لفيلم كوميدي من عام 1963 عن سرقة ماسة شهيرة، ثم صار بطلًا لرسوم متحركة خاصة به؟ | النمر الوردي | Top Cat, Snagglepuss / توب كات، سناغلبوس | "Pink" is left out of the question so it does not give the answer away. The film premiered in December 1963 (US release 1964). Snagglepuss is a pink Hanna-Barbera lion, the closest look-alike. Reject Inspector Clouseau (the film's detective). |

## Removed by the owner (2026-11-11)

Taken out of the SQL file and added to `docs/question-sets/rejected-answers.md`. Not replaced. The picture file `img/questions/landmark-galata-tower.jpg` was deleted.

| ID | Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|---|
| 1111-02 | Who Am I? | 200 | I was a writer and campaigner who lost my sight and hearing as a baby. My teacher, Anne Sullivan, taught me words by spelling them into my hand, starting with "water", and in 1904 I graduated from university. Who am I? | Helen Keller (accept Keller) | كنت كاتبة وناشطة فقدت البصر والسمع وأنا رضيعة. علّمتني معلمتي آن سوليفان الكلمات بتهجئتها بأصابعها في كفّي، وكانت أولاها كلمة "ماء"، وفي عام 1904 تخرجت في الجامعة. من أنا؟ | هيلين كيلر (يُقبل: كيلر) | Laura Bridgman, Eleanor Roosevelt / لورا بريدجمان، إليانور روزفلت | Laura Bridgman is the classic near-miss: an earlier deaf-blind American woman, educated at the Perkins School, where Anne Sullivan also studied. Reject Anne Sullivan (named in the text). The "first deaf-blind graduate" claim is left out because sources differ on how wide it is. |
| 1111-03 | Who Am I? | 300 | I was a goldsmith. Around 1450, in the German city of Mainz, I built a printing press that used movable metal letters, and the famous Bible I printed carries my name. Who am I? | Johannes Gutenberg (accept Gutenberg) | كنت صائغ ذهب. نحو عام 1450، في مدينة ماينتس الألمانية، صنعت مطبعة تستخدم حروفًا معدنية متحركة، والكتاب المقدس الشهير الذي طبعته يحمل اسمي. من أنا؟ | يوهانس غوتنبرغ (يُقبل: غوتنبرغ) | Johann Fust, William Caxton / يوهان فوست، ويليام كاكستون | Johann Fust was Gutenberg's Mainz backer and later took over his press. William Caxton brought printing to England (he learned it in Cologne). "Around 1450" is used because the exact start date is uncertain. Reject Fust, Caxton. |
| 1111-04 | Who Am I? | 500 | I was a factory worker and an amateur parachutist. In June 1963 I became the first woman to travel into space, orbiting the Earth 48 times in almost three days. Who am I? | Valentina Tereshkova (accept Tereshkova) | كنت عاملة في مصنع وهاوية للقفز بالمظلات. في يونيو 1963 أصبحت أول امرأة تسافر إلى الفضاء، ودرت حول الأرض 48 مرة في نحو ثلاثة أيام. من أنا؟ | فالنتينا تيريشكوفا (يُقبل: تيريشكوفا) | Svetlana Savitskaya, Sally Ride / سفيتلانا سافيتسكايا، سالي رايد | Living person, no age used. "Soviet" and "Vostok 6" are left out so that Sally Ride (first American woman in space, 1983) stays a fair option. Savitskaya was the second woman in space (1982). Reject Gagarin (a man, a wrong option in Who Am I? 400). |
| 1111-06 | Cartoons & Childhood | 300 | Which clay-animated penguin, star of a children's TV series from the 1990s, speaks only a made-up penguin language and is famous for honking "Noot noot!"? | Pingu | ما اسم البطريق المصنوع من الصلصال، بطل مسلسل الأطفال التلفزيوني في التسعينيات، الذي لا يتكلم إلا بلغة بطاريق مخترعة ويشتهر بصيحته "نوت نوت!"؟ | بينغو | Pororo, Mumble / بورورو، مامبل | "Swiss" is left out so the options (Pororo, a Korean cartoon penguin from 2003, and Mumble from "Happy Feet") are not ruled out by the text. The pilot was in 1986 but the series ran from 1990, hence "from the 1990s". Reject Pinga (his little sister). |
| 1111-07 | Cartoons & Childhood | 400 | In the cartoon series first shown in 1981, what is the name of the cat who helps the evil wizard Gargamel hunt the little blue creatures? | Azrael (accept Harhour, his Arabic name) | في مسلسل الرسوم المتحركة الذي بدأ عرضه عام 1981، ما اسم القط الذي يساعد الساحر الشرير شرشبيل في مطاردة المخلوقات الزرقاء الصغيرة؟ | هرهور (يُقبل: أزرائيل) | Figaro, Salem / فيغارو، سالم | "The Smurfs" is not named, because it is the Cartoons 100 answer (that question already names Gargamel). Arabic players know him as هرهور. Figaro (Pinocchio's cat) and Salem (Sabrina's cat) are famous cartoon/TV cats. Lucifer was avoided (a rejected answer). |
| 1111-08 | Cartoons & Childhood | 400 | In the animated film "Ice Age" (2002), what is the name of the chatty, clumsy sloth who travels with Manny the mammoth? | Sid | في فيلم الرسوم المتحركة "العصر الجليدي" (2002)، ما اسم حيوان الكسلان الثرثار الأخرق الذي يرافق الماموث ماني؟ | سيد | Diego, Crash / دييغو، كراش | Different from the rejected Scrat item (Cartoons 200, the acorn). Diego is the sabre-toothed cat in the same film, Crash one of the possum brothers from the sequels. Reject Scrat, Diego. |
| 1111-09 | Landmarks | 500 (picture) | Which landmark is this? (picture: `img/questions/landmark-galata-tower.jpg`, the tower lit up at night, October 2025) | The Galata Tower (accept Galata Kulesi) | ما هذا المعلم؟ | برج غلطة (يُقبل: برج جالاتا) | The Maiden's Tower, The Torre del Oro / برج الفتاة، برج الذهب | Galata Tower was the reserve named in today's first batch. Options: the Maiden's Tower (Istanbul, a small tower on an islet) and the Torre del Oro (Seville, a 12-sided Almohad tower), both real towers that look different. Accept "Galata" alone. Reject "Istanbul" alone (a Geography answer), the Maiden's Tower. |
| 1111-10 | AI | 400 | What do we call a being that is part human and part machine, for example a person whose body has been boosted with built-in electronic parts? | A cyborg | ماذا نسمي الكائن الذي هو جزء إنسان وجزء آلة، مثل شخص زُوِّد جسمه بأجزاء إلكترونية مدمجة تقوّي قدراته؟ | سايبورغ (يُقبل: كائن سيبراني) | An android, A clone / أندرويد، مستنسخ | A concept question, not a film robot, product feature or news item. Reject "android" (an all-machine robot built to look human) and "robot". The word is short for "cybernetic organism" (1960), left out of the text because it gives the answer away. |

## Duplicate and rejected-list checks (local DB read only, 884 rows)

- Searched question, answer and both wrong options (case-insensitive) in all categories for every answer and option: Rowling, Blyton, Jacqueline Wilson, Keller, Bridgman, Roosevelt, Gutenberg, Fust, Caxton, Tereshkova, Savitskaya, Sally Ride, Pink Panther, Top Cat, Snagglepuss, Pingu, Pororo, Mumble, Azrael, Harhour, Figaro, Salem, Ice Age, Sid, Diego, Crash, Galata, Maiden's Tower, Torre del Oro, cyborg, clone.
  - No hits for any of the 10 answers or 20 options. The only hits are substrings in unrelated rows (Fustat, Jerusalem, "car crash", Galatasaray) and Gargamel in the Cartoons 100 text, which is why 1111-07 does not name the Smurfs.
- Candidates dropped because they are already answers elsewhere, or because existing texts would give them away: Gandhi, Napoleon, Einstein, Archimedes, Cleopatra, Tutankhamun, Harun al-Rashid, Ibn al-Haytham, Usain Bolt, Cristiano Ronaldo, Messi (answers); Agatha Christie and Maradona (named in Movies / Sports texts); Abu, Scar, Shifu, Boo (their films Aladdin, The Lion King, Kung Fu Panda and Monsters, Inc. are Movies answers, and Shifu is a wrong option); Beyblade (Gen Z wrong option); Mario (named in a Technology text); DeepSeek (named in a Geography text); algorithm (Gen Z 100 answer); neural network (named in Science 100); Android (Technology answer).
- `rejected-answers.md` (including today's 5 rejections): none of the 10 answers is on it. Today's earlier answers (Omar Khayyam, Fulla, Empire State Building, Jailbreak, Mastic) are not repeated. AI avoids the rejected types (film robots, product feature names, viral incidents, model or version trivia, country-policy news). Cartoons avoids all listed items (Scrat, Lucifer, Fred Flintstone and others). Landmarks avoids every rejected and excluded landmark (Galata Tower is not on the excluded list).

## Difficulty benchmarks (local DB, 2026-11-11)

- Who Am I? 100 (Michael Jackson, "I have a dream", Zewail, Chaplin, Mother Teresa): Rowling with the boy-wizard clue is as easy.
- Who Am I? 200 (Shawqi quote, Mahfouz, Beethoven, Bruce Lee, Al-Mutanabbi quote): Helen Keller is world famous; "water" and Anne Sullivan are the well-known clues.
- Who Am I? 300 (Shakespeare quote, Tyson, Karl Benz, Pasteur, Van Gogh): Gutenberg is an inventor like Benz; the "Bible carries my name" clue lands late.
- Who Am I? 500 (Descartes quote, Coco Chanel, Houdini, Ibn Firnas): Tereshkova is famous for one fact but her name is hard to recall.
- Cartoons & Childhood 200 (Cruella, Olive Oyl, Batout/Donald, Spacetoon, Sonic, Mohamed Mounir): the Pink Panther is very well known in Egypt (النمر الوردي); the 1963 film clue is the challenge.
- Cartoons & Childhood 300 (Shinichi Kudo, Duke Fleed, spaghetti, Tamagotchi, Bougy wa Tamtam, Safaa Abu El Saud): Pingu is a well-known but older children's show.
- Cartoons & Childhood 400 (Dee Dee, Tinker Bell, Hassouna, Remy, Donatello): both are named side characters of famous cartoons, like Dee Dee and Remy.
- Landmarks 500 (Baron Empain, Hungarian Parliament, Karnak, Kingdom Centre, Montaza, Museum of the Future): Galata Tower is famous but harder to name from a night photo.
- AI 400 (CAPTCHA, Apple Intelligence, data centres, Bixby, AI slop, Zuckerberg, Grammarly): "cyborg" is a known word, but players have to produce it from a definition.

## Fact-check log

Each item was checked on 2026-11-11 in 2+ independent sources (search results and the pages below). Britannica pages returned HTTP 403 to the fetch tool, so Britannica-based search snippets were used where noted.

| ID | Facts checked | Sources |
|---|---|---|
| 1111-01 | British author. "Harry Potter and the Philosopher's Stone" published 26 June 1997 (Bloomsbury), her first novel. Harry learns he is a wizard on his 11th birthday. Seven books (1997-2007), eight films (2001-2011, the last book split in two). | [Britannica: Harry Potter](https://www.britannica.com/topic/Harry-Potter); [Wikipedia: Harry Potter](https://en.wikipedia.org/wiki/Harry_Potter); [J.K. Rowling official site](https://www.jkrowling.com/); [SparkNotes: Rowling background](https://www.sparknotes.com/lit/harrypotter/context/) |
| 1111-02 | Lost sight and hearing at 19 months after an illness. Anne Sullivan arrived in 1887 and spelled "w-a-t-e-r" into her hand at the water pump. Entered Radcliffe College in 1900, BA cum laude in 1904. Laura Bridgman: earlier deaf-blind woman taught at Perkins. | [American Foundation for the Blind: Helen Keller biography](https://afb.org/about-afb/history/helen-keller/biography-and-chronology/biography); [AFB: Education 1894-1904](https://afb.org/about-afb/history/online-museums/helen-keller-museum/education); [Wikipedia: Helen Keller](https://en.wikipedia.org/wiki/Helen_Keller) |
| 1111-03 | Goldsmith trained in Mainz. Print shop running in Mainz by about 1450, with movable metal type. 42-line "Gutenberg Bible" finished by about 1455. Johann Fust was his Mainz backer and took over the equipment in 1455. | [EBSCO Research Starters: Johannes Gutenberg](https://www.ebsco.com/research-starters/biography/johannes-gutenberg); [World History Encyclopedia: Johannes Gutenberg](https://www.worldhistory.org/Johannes_Gutenberg/); [Library of Congress blog](https://blogs.loc.gov/international-collections/2018/06/alphabet-venture/); [Biography.com](https://www.biography.com/inventors/a45975535/johannes-gutenberg) |
| 1111-04 | 16 June 1963, Vostok 6: first woman in space, 48 orbits in about 71 hours (almost three days). Former textile-factory worker and amateur parachutist (her parachuting got her into the programme). Savitskaya flew in 1982, Sally Ride in 1983. | [Space.com: Valentina Tereshkova](https://www.space.com/21571-valentina-tereshkova.html); [History.com: first woman in space](https://www.history.com/this-day-in-history/june-16/first-woman-in-space); [Astronomy.com](https://www.astronomy.com/today-in-the-history-of-astronomy/june-16-1963-valentina-tereshkova-is-the-first-woman-in-space/); [Wikipedia: Vostok 6](https://en.wikipedia.org/wiki/Vostok_6); Britannica (search snippet) |
| 1111-05 | The animated Pink Panther was made by DePatie-Freleng for the opening titles of Blake Edwards' "The Pink Panther" (first released December 1963), a comedy about a jewel thief and the "Pink Panther" diamond. The first short, "The Pink Phink" (1964), won the Oscar. | [Wikipedia: Pink Panther (character)](https://en.wikipedia.org/wiki/Pink_Panther_(character)); [Wikipedia: The Pink Panther (1963 film)](https://en.wikipedia.org/wiki/The_Pink_Panther_(1963_film)); [IMDb: The Pink Panther (1963) trivia](https://www.imdb.com/title/tt0057413/trivia/); [Cartoon Research](https://cartoonresearch.com/index.php/the-art-of-the-pink-panther-movie-titles/) |
| 1111-06 | Swiss stop-motion clay series by Otmar Gutmann. Pilot 1986, series on Swiss TV 1990-2000, then BBC 2003-2006. Speaks invented "Penguinese", honks "Noot noot". | [SWI swissinfo.ch: Pingu wird 40 Jahre alt](https://www.swissinfo.ch/ger/die-besten-inhalte-der-srg/wahrzeichen-des-schweizer-trickfilms-pingu-wird-40-jahre-alt/91395132); [Wikipedia: Pingu](https://en.wikipedia.org/wiki/Pingu); [Stop Motion Magazine](https://stopmotionmagazine.com/world-famous-clay-penguin-pingu-otmar-gutmann/) |
| 1111-07 | Azrael is Gargamel's cat in Hanna-Barbera's "The Smurfs" (from 12 Sept 1981). In the Arabic dub Gargamel is شرشبيل and his cat هرهور. | [Wikipedia: Gargamel](https://en.wikipedia.org/wiki/Gargamel); [Wikipedia: The Smurfs (1981 TV series)](https://en.wikipedia.org/wiki/The_Smurfs_(1981_TV_series)); [IMDb: The Smurfs (1981-1989)](https://www.imdb.com/title/tt0081933/); [Arabic Wikipedia: شرشبيل](https://ar.wikipedia.org/wiki/%D8%B4%D8%B1%D8%B4%D8%A8%D9%8A%D9%84); [Al Wasat News](https://www.alwasatnews.com/news/download/300321.html) (Arabic names) |
| 1111-08 | "Ice Age" released 15 March 2002. Sid the sloth (John Leguizamo) travels with Manfred/Manny the mammoth (Ray Romano) and Diego the sabre-tooth (Denis Leary). Crash and Eddie appear in the sequels. | [RogerEbert.com review](https://www.rogerebert.com/reviews/ice-age-2002); [Variety review](https://variety.com/2002/film/awards/ice-age-1200550827/); [Wikipedia: Ice Age (2002 film)](https://en.wikipedia.org/wiki/Ice_Age_(2002_film)) |
| 1111-09 | Genoese tower of 1348 in Galata (Beyoglu), Istanbul, later an Ottoman fire lookout. 66.90 m to the top of the cone. Restored in 2020 and reopened as the Galata Tower Museum. The photo (October 2025) shows the current state. | [Turkish Ministry of Culture and Tourism: Galata Tower Museum](https://muze.gov.tr/muze-detay?SectionId=GLT04&DistId=MRK) and its official brochure; [Wikipedia: Galata Tower](https://en.wikipedia.org/wiki/Galata_Tower); Commons file page |
| 1111-10 | Cyborg: a being with both biological and artificial (machine) parts. The word is short for "cybernetic organism", coined in 1960 by Manfred Clynes and Nathan Kline. Different from an android (a robot that looks human). | [EBSCO Research Starters: Cyborg](https://www.ebsco.com/research-starters/communication-and-mass-media/cyborg-cybernetic-organism/); [SF Encyclopedia: Cyborgs](https://sf-encyclopedia.com/entry/cyborgs); [Wikipedia: Cyborg](https://en.wikipedia.org/wiki/Cyborg) |

Web content was treated as data. No page contained instructions aimed at the agent.

## Image sources and licences

**Removed:** the owner removed the Galata Tower question (1111-09) on 2026-11-11 and `img/questions/landmark-galata-tower.jpg` was deleted. The notes below are kept for the record only.

| Points | File | Commons file page | Author | Licence | File revision |
|---|---|---|---|---|---|
| 500 | `landmark-galata-tower.jpg` | [Galata Kulesi 2025.jpg](https://commons.wikimedia.org/wiki/File:Galata_Kulesi_2025.jpg) | Çokiyi (own work, Wiki Loves Monuments 2025 Turkey) | CC BY-SA 4.0 | upload 2025-10-30 (sha1 722d2d76...), photo taken 2025-10-18, page revision 1158241885 (2026-02-02) |

- **Credit in the game:** `image_credit` is "Çokiyi / CC BY-SA 4.0". The user name has a non-ASCII "Ç"; it is kept exact for the attribution (the column is utf8mb4). Change it to "Cokiyi" if the owner prefers plain ASCII.
- **Download:** on 2026-11-11, from upload.wikimedia.org into a new, empty temp directory, with a named User-Agent and pauses between requests. The original is 1822 x 2186 px and its sha1 matches the Commons file page.
- **Re-encoding:** with PHP GD (XAMPP PHP, `-d extension=gd`), pixels only (no EXIF/metadata), no cropping: 1067 x 1280 px (portrait, long side 1280), JPEG quality 80, 185,589 bytes (under 250 KB). The file name is new in `img/questions/`.
- **Licence:** read from the file page wikitext: `{{self|cc-by-sa-4.0}}`. The tower dates from 1348, long out of copyright.
- **Visual check:** the final file was viewed. It shows the whole tower lit at night, with the conical roof, the arched gallery and the stone body, a building on the left and trees at the bottom. No people.
- **Other candidates looked at:** "Galata Tower, Istanbul, Turkiye.jpg" (CC BY 4.0, 2021: black and white, framed by dark buildings), "Galata 1.jpg" (CC0, 2024: the tower under scaffolding), "Galata Tower 4.jpg" and "Galata Tower 7.jpg" (2022: worm's-eye close-ups, no roof), "TARIHI GALATA KULESI.jpg" (2019: tower hidden behind a tulip and a tree).

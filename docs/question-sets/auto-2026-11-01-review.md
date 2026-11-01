# Automatic batch 2026-11-01: review

## Live/local differences (from the brief)

No comparison this run. The live `/api/categories.php` could not be fetched because the scheduled run had no approval for the network call.

Local totals per category at planning time: AI 42, Cartoons & Childhood 31, Egyptians 99, Flags 53, Food & Drink 46, Gen Z 67, Geography 96, History 70, Landmarks 48, Movies 65, Science 75, Sports 80, Technology 68, Who Am I? 21.

## Status

Drafted in the scheduled run without web access. Fact-checked and completed later the same day, after the owner joined the session and approved web access. All 10 rows pass the fact-check (two were reworded, see "Dropped or reworded"). The picture slot is filled. Not loaded into any database and no git commands run, as the brief asks.

Owner's review (2026-11-01): Yogi Bear was replaced with the Hundred Acre Wood, which the owner then removed as well; Sigmund Freud, Saint-Exupery, sturgeon and computer vision were removed (see "Removed by the owner (2026-11-01)"); the Pantheon picture question moved from Landmarks 500 to Landmarks 600. The batch now has 5 rows.

## Summary

File: `sql/add-auto-2026-11-01-questions.sql`, 5 rows (4 text, 1 picture), all with `question_ar`, `answer_ar`, `wrong_1`, `wrong_2`, `wrong_1_ar`, `wrong_2_ar` filled. New image: `img/questions/landmark-pantheon-rome.jpg`.

| Category | Points | Brief asked | In the file | Local count now | Count after load |
|---|---|---|---|---|---|
| Who Am I? | 100 | 1 | 1 | 4 | 5 |
| Who Am I? | 500 | 2 | 1 (Freud removed by the owner) | 2 | 3 |
| Who Am I? | 600 | 1 | 1 | 3 | 4 |
| Cartoons & Childhood | 200 | 1 | 1 | 4 | 5 |
| Cartoons & Childhood | 400 | 1 | 0 (removed by the owner) | 4 | 4 |
| Cartoons & Childhood | 600 | 1 | 0 (removed by the owner) | 4 | 4 |
| Food & Drink | 600 | 1 | 0 (removed by the owner) | 4 | 4 |
| AI | 500 | 1 | 0 (removed by the owner) | 5 | 5 |
| Landmarks | 500 (picture) | 1 | 0 (moved to 600 by the owner) | 5 | 5 |
| Landmarks | 600 (picture) | 0 | 1 | 5 | 6 |

Count per point value in the file: 100 = 1, 200 = 1, 500 = 1, 600 = 2 (5).

Variety:
- Who Am I?: charity (Mother Teresa, 20th century, India), fashion (Coco Chanel, France) and women's rights (Huda Shaarawi, Egypt). The category already has pop music, silent film, martial arts, Arabic poetry, literature, painting, invention, science, travel, conquest, philosophy, aviation and architecture; none of these fields is repeated.
- Cartoons & Childhood: a video game hero (Sonic, 200). The 400 slot is empty: the owner removed Yogi Bear and its replacement, the Hundred Acre Wood. The cells are already heavy on anime, Disney, Egyptian TV songs and toy origins, so none of those is used.
- Landmarks 600 (moved from 500 by the owner): an ancient European building, next to two towers (Petronas, and Taipei 101 only as a wrong option), a castle (Neuschwanstein), a museum (Louvre Abu Dhabi) and two places of worship (Sacre-Coeur, Hagia Sophia). Unique key checked: the cell's rows all use "Which landmark is this?" but each with its own image, so (category, question, image) does not collide. The wrong options (the Maison Carree, the Temple of Hephaestus) are not answers in Landmarks 600.

Difficulty benchmarks (existing rows in each cell):
- Who Am I? 100: Michael Jackson, Chaplin, Zewail, MLK quote. 500: Abbas Ibn Firnas, Descartes quote. 600: Hassan Fathy, Shawqi and Al-Mutanabbi quotes.
- Cartoons 200: Cruella, Batout, Spacetoon, Mohamed Mounir. 400: Donatello, Dee Dee, Tinker Bell, Hassouna. 600: LEGO, Rubik's Cube, Ramadan Gana, Sami Clark.
- Food 600: al-Hakim, Tijuana, bergamot, taro.
- AI 500: NYT lawsuit, Optimus, Generative AI, Anthropic, Nvidia.
- Landmarks 500: Baron Empain Palace, Hungarian Parliament, Kingdom Centre, Montaza Palace, Museum of the Future. Landmarks 600 (where the Pantheon now sits): Petronas Towers, Neuschwanstein, Louvre Abu Dhabi, Sacre-Coeur, Hagia Sophia.

## Questions

| Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| Who Am I? | 100 | I was a Catholic nun who spent my life helping the poorest people of Calcutta. I founded the Missionaries of Charity in 1950 and won the Nobel Peace Prize in 1979. Who am I? | Mother Teresa (accept Saint Teresa of Calcutta) | كنت راهبة كاثوليكية كرّست حياتي لمساعدة أفقر الناس في كلكتا. أسست جمعية "مرسلات المحبة" عام 1950، وفزت بجائزة نوبل للسلام عام 1979. من أنا؟ | الأم تيريزا (يُقبل: القديسة تيريزا من كلكتا) | Sister Emmanuelle, Mother Cabrini / الأخت إيمانويل، الأم كابريني | Reject Sister Emmanuelle (nun who worked with Cairo's rubbish collectors, often compared to Mother Teresa). "India" left out: it is a Geography 600 answer. Mother Teresa is a wrong option in History 400 (first woman to win a Nobel Prize); not a conflict. |
| Who Am I? | 500 | I was a fashion designer. I made the simple "little black dress" famous, and in the 1920s I launched a perfume called "No. 5" that still carries my name. Who am I? | Coco Chanel (accept Gabrielle Chanel, Chanel) | كنت مصممة أزياء. جعلت "الفستان الأسود الصغير" البسيط مشهورًا، وفي عشرينيات القرن العشرين أطلقت عطرًا اسمه "رقم 5" ما زال يحمل اسمي. من أنا؟ | كوكو شانيل (يُقبل: غابرييل شانيل، شانيل) | Elsa Schiaparelli, Jeanne Lanvin / إلسا سكياباريلي، جان لانفان | Reject Christian Dior. "Paris" and "French" left out: Paris and France are Geography answers. Options are women because the Arabic clue is feminine. |
| Who Am I? | 600 | I was an Egyptian pioneer of women's rights. In 1923 I founded the Egyptian Feminist Union, and on my return from a women's conference in Rome I removed my face veil in public at the train station. Who am I? | Huda Shaarawi (accept Hoda Shaarawi) | كنت رائدة مصرية في الدفاع عن حقوق المرأة. عام 1923 أسست الاتحاد النسائي المصري، وعند عودتي من مؤتمر نسائي في روما رفعت النقاب عن وجهي علنًا في محطة القطار. من أنا؟ | هدى شعراوي | Doria Shafik, Safiya Zaghloul / درية شفيق، صفية زغلول | Reject Saiza (Ceza) Nabarawi: she unveiled with Shaarawi at the station but did not found the Union, so she is not used as an option. Doria Shafik founded Bint al-Nil (1948). "Cairo" left out (Geography 100 answer). |
| Cartoons & Childhood | 200 | Which blue hedgehog, the video game hero created by Sega in 1991, runs at super speed and collects golden rings? | Sonic (accept Sonic the Hedgehog) | ما اسم القنفذ الأزرق، بطل ألعاب الفيديو الذي ابتكرته شركة سيغا عام 1991، والذي يركض بسرعة خارقة ويجمع الحلقات الذهبية؟ | سونيك (يُقبل: سونيك القنفذ) | Tails, Knuckles / تيلز، ناكلز | Reject Shadow (a black hedgehog from later games). Tails (a fox) and Knuckles (an echidna) are Sonic's friends from the later games. Sega is only a wrong option in Technology. Mario was not used: the Technology 200 question names "Super Mario". |
| Landmarks | 600 | Which landmark is this? (picture `img/questions/landmark-pantheon-rome.jpg`) | The Pantheon (accept the Pantheon in Rome, Santa Maria ad Martyres) | ما هذا المعلم؟ | البانثيون (يُقبل: البانثيون في روما، كنيسة سانتا ماريا آد مارتيريس) | The Maison Carree, The Temple of Hephaestus / ميزون كاريه، معبد هيفايستوس | Reject "the Pantheon in Paris" (a different, 18th-century building). The inscription "M AGRIPPA ... FECIT" is visible in the photo, which helps but does not name the building. Credit: "Wilfredor / CC0". |

## Removed by the owner (2026-11-01)

These are taken out of the SQL file and added to `rejected-answers.md`. They were not replaced, except Yogi Bear (replaced in the same slot by the Hundred Acre Wood, which the owner then removed too).

| Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| Cartoons & Childhood | 400 | Which cartoon bear, who wears a hat and tie and lives in Jellystone Park, boasts that he is "smarter than the average bear" and keeps stealing picnic baskets? | Yogi Bear (accept Yogi) | ما اسم الدب الكرتوني الذي يرتدي قبعة وربطة عنق ويعيش في حديقة جيليستون، ويتباهى بأنه "أذكى من الدب العادي"، ولا يكف عن سرقة سلال النزهات؟ | الدب يوغي (يُقبل: يوغي) | Boo-Boo Bear, Paddington Bear / الدب بوبو، الدب بادينغتون | Replaced by the owner with the Hundred Acre Wood question. |
| Cartoons & Childhood | 400 | In the "Winnie-the-Pooh" stories, what is the name of the forest where Pooh, Piglet and their friends live? | The Hundred Acre Wood (accept Hundred Acre Wood, 100 Acre Wood) | في قصص "ويني ذا بوه"، ما اسم الغابة التي يعيش فيها بوه وبيغلت وأصدقاؤهما؟ | غابة المئة فدان (يُقبل: غابة الفدادين المئة) | The Enchanted Wood, The Wild Wood / الغابة المسحورة، الغابة البرية | Replaced Yogi Bear (owner's request), then removed by the owner too (2026-11-01). Reject "Ashdown Forest" (the real forest in Sussex that inspired it) and "Five Hundred Acre Wood" (the real wood inside it). The Enchanted Wood is Enid Blyton's Faraway Tree wood, the Wild Wood is Badger's wood in "The Wind in the Willows". New angle: the rejected Eeyore question (Cartoons 300) asked for a character, this one asks for the place. |
| Cartoons & Childhood | 600 | Which writer and pilot wrote and illustrated "The Little Prince" (1943), the story of a boy who has come to Earth from his tiny planet? | Antoine de Saint-Exupery (accept Saint-Exupery) | أي كاتب وطيار ألّف ورسم كتاب "الأمير الصغير" (1943)، قصة صبي جاء إلى الأرض من كوكبه الصغير؟ | أنطوان دو سانت إكزوبيري (يُقبل: سانت إكزوبيري) | Jules Verne, Albert Camus / جول فيرن، ألبير كامو | "French" left out (France is a Geography 500 answer); all three options are French writers anyway. 1943 is the first edition (New York, in English and French). |
| Food & Drink | 600 | True caviar is the salted eggs (roe) of which kind of fish, found mainly around the Caspian and Black Seas? | Sturgeon (accept beluga) | الكافيار الحقيقي هو البيض المملّح لأي نوع من الأسماك، يعيش أساسًا حول بحر قزوين والبحر الأسود؟ | سمك الحفش (يُقبل: البيلوغا) | Grey mullet, Cod / البوري، سمك القد | Accept beluga, sevruga or osetra (sturgeon species). Reject salmon: FAO counts roe from any fish outside the sturgeon family only as a caviar "substitute". Grey mullet roe is batarekh, cod roe is used for taramasalata. |
| Who Am I? | 500 | I was an Austrian doctor in Vienna and the founder of psychoanalysis. My book "The Interpretation of Dreams" argued that dreams reveal our hidden wishes. Who am I? | Sigmund Freud (accept Freud) | كنت طبيبًا نمساويًا في فيينا ومؤسس التحليل النفسي. وفي كتابي "تفسير الأحلام" قلت إن الأحلام تكشف رغباتنا الخفية. من أنا؟ | سيغموند فرويد (يُقبل: فرويد) | Alfred Adler, Carl Jung / ألفريد أدلر، كارل يونغ | Reject Jung (Swiss, founded analytical psychology) and Adler (Freud's Viennese colleague who broke away). No year given for the book: it came out in November 1899 but is dated 1900. |
| AI | 500 | Which field of AI teaches computers to understand photos and video, for example so that a self-driving car can spot people and road signs? | Computer vision (accept machine vision) | ما اسم مجال الذكاء الاصطناعي الذي يعلّم الحواسيب فهم الصور والفيديو، مثلًا كي تتعرف السيارة ذاتية القيادة على المشاة وإشارات الطريق؟ | الرؤية الحاسوبية (يُقبل: رؤية الآلة) | Natural language processing, Speech recognition / معالجة اللغات الطبيعية، التعرف على الكلام | Accept image recognition at the host's discretion (a task within computer vision). Reject "deep learning" or "machine learning" (methods, not the field). |

## Duplicate and rejected-list checks

- Every answer was checked against all 861 local DB questions (answers, question texts and wrong options, case-insensitive) and against `docs/question-sets/rejected-answers.md`. None of the answers is in the bank or on the rejected list ("Pantheon" appears nowhere in either).
- Matches that are only wrong options elsewhere, not a conflict: Mother Teresa (History 400), Sega (Technology 100 and 200). The Temple of Hephaestus is also a wrong option in Landmarks 200 (Acropolis); it is only a wrong option here too.
- Give-aways avoided: no question names Paris, France, India, Cairo, Japan, Barbie, Super Mario, Disney or Hanna-Barbera.
- Rejected types respected: AI 500 is not a film robot, product feature name, viral incident, model or version trivia, or country-policy news.

## Dropped or reworded

| Draft | Why |
|---|---|
| Who Am I?: Einstein, Gandhi, Champollion, Napoleon, Cleopatra, Columbus, Edison, Newton, Bill Gates, Mandela, Messi, Ronaldo, Salah, Umm Kulthum, Omar Sharif | Already answers in Science, History, Technology, Sports, Egyptians or Movies. |
| Who Am I?: Walt Disney | Many Cartoons questions name "Disney". |
| Who Am I?: Agatha Christie | Named in a Movies 200 question. |
| Who Am I?: Picasso, Mozart, Beethoven | Painting and music are already in the category (Van Gogh, Michael Jackson). |
| Who Am I? 500: Alfred Nobel | 19th-century chemist and inventor, too close to Pasteur and Karl Benz in the category. |
| Who Am I? 100: Mother Teresa "in Calcutta, India" | "India" is a Geography 600 answer. Reworded to "Calcutta". |
| Who Am I? 500: Chanel "fashion designer in Paris" | "Paris" is a Geography 100 answer. Removed. |
| **Who Am I? 500: Chanel "in 1921 I launched a perfume called No. 5" (fact-check)** | Sources differ on the year: Britannica's main article and Wikipedia say 1921, Britannica Kids and EBSCO say 1922. Reworded to "in the 1920s", which both dates fit. |
| Who Am I? 600: Shaarawi "at Cairo's railway station" | "Cairo" is a Geography 100 answer. Reworded to "the train station". |
| Cartoons 200: Mario; Ken (Barbie) | The Technology 200 question names "Super Mario"; "Barbie" is a Movies 100 answer. |
| Cartoons 400: Toy Story, Shrek, Smurfs (Azrael), Tom and Jerry (Spike) | Would give away Movies 100 and Cartoons 100 answers. |
| Cartoons 600: teddy bear (Theodore Roosevelt) | Third toy-origin question in a cell that already has LEGO and the Rubik's Cube. |
| Cartoons 600: Saint-Exupery "French writer" | "France" is a Geography 500 answer. Removed. |
| **Cartoons 600: "from his tiny asteroid" (fact-check)** | Britannica says the prince comes from a tiny planet, "possibly" asteroid B-612 (in the book the narrator only thinks it is). Reworded to "his tiny planet". |
| AI 500: Turing test, Deep Blue / Kasparov, ELIZA, AGI | Alan Turing is a History 100 answer, Deep Blue is named in History 100, ELIZA is a Technology 600 answer, AGI is a Science 600 answer. |
| Landmarks 500: Notre-Dame de Paris | "Notre-Dame" is a History 200 answer. |
| **Cartoons 400: Yogi Bear (owner, 2026-11-01)** | Replaced at the owner's request on 2026-11-01 with a Winnie-the-Pooh question in the same slot (the Hundred Acre Wood). Yogi Bear is in "Removed by the owner (2026-11-01)" and in `rejected-answers.md`. |
| Landmarks 500 photo: "Pantheon in Rome (1).jpg" (Krzysztof Golik, CC BY-SA 4.0, a Commons quality image) | Downloaded and viewed, then rejected: several tourists with recognisable faces stand in the foreground. Replaced with the CC0 photo below. |

## Fact-check sources

Web content checked during this run did not contain any text aimed at the agent.

| Question | Facts checked | Sources |
|---|---|---|
| Mother Teresa | Catholic nun; served "the poorest of the poor" in Calcutta; Missionaries of Charity instituted 7 October 1950; Nobel Peace Prize 1979; canonised 4 September 2016 as Saint Teresa of Calcutta | [EBSCO Research Starters, Mother Teresa](https://www.ebsco.com/research-starters/history/mother-teresa/); [Wikipedia, Mother Teresa](https://en.wikipedia.org/wiki/Mother_Teresa); [CBS News, Mother Teresa becomes a saint](https://www.cbsnews.com/amp/pictures/mother-teresa-saint-missionaries-of-charity-india) |
| Coco Chanel | Little black dress introduced in 1926 (American Vogue's "Ford" comparison); No. 5 developed with Ernest Beaux in 1921 (some sources say 1922, hence "the 1920s"); perfume carries her name | [Britannica, Coco Chanel](https://www.britannica.com/biography/Coco-Chanel); [Britannica, little black dress](https://www.britannica.com/topic/little-black-dress); [Wikipedia, Chanel No. 5](https://en.wikipedia.org/wiki/Chanel_No._5); [CNN Style, How Coco Chanel changed women's fashion](https://edition.cnn.com/style/article/coco-chanel-fashion-50-years); [Britannica Kids](https://kids.britannica.com/students/article/Coco-Chanel/319252) and [EBSCO](https://www.ebsco.com/research-starters/history/coco-chanel) (1922) |
| Sigmund Freud | Austrian, trained in Vienna as a physician and neurologist, founder of psychoanalysis; "The Interpretation of Dreams" (1899, dated 1900): dreams are disguised wish fulfilments | [Britannica, Sigmund Freud](https://www.britannica.com/biography/Sigmund-Freud); [Britannica, The Interpretation of Dreams](https://www.britannica.com/topic/The-Interpretation-of-Dreams); [Encyclopedia.com, The Interpretation of Dreams](https://www.encyclopedia.com/arts/culture-magazines/interpretation-dreams) |
| Huda Shaarawi | Egyptian feminist; founded the Egyptian Feminist Union in 1923 (meeting at her home, March 1923); led the delegation to the IWSA congress in Rome (May 1923); on return removed her face veil in public at the Cairo train station, followed by Saiza Nabarawi | [Britannica, Huda Sharawi](https://www.britannica.com/biography/Huda-Sharawi); [Encyclopedia.com, Shaarawi, Huda](https://www.encyclopedia.com/history/encyclopedias-almanacs-transcripts-and-maps/shaarawi-huda) (quotes Margot Badran's introduction to "Harem Years"); [Emory University, Postcolonial Studies, Shaarawi](https://scholarblogs.emory.edu/postcolonialstudies/2014/06/12/shaarawi-huda/); [Wikipedia, Saiza Nabarawi](https://en.wikipedia.org/wiki/Saiza_Nabarawi) |
| Sonic | Sega's blue hedgehog mascot, first game 1991 (June 1991), runs at supersonic speed, collects gold rings | [Britannica, Sonic the Hedgehog](https://www.britannica.com/topic/Sonic-the-Hedgehog) (Sega mascot, 1991, "speedy blue" hedgehog); [Wikipedia, Sonic the Hedgehog (1991 video game)](https://en.wikipedia.org/wiki/Sonic_the_Hedgehog_(1991_video_game)) (speed, gold rings); [SEGA Universe, Sonic the Hedgehog (1991)](https://segauniverse.com/games/sonic-the-hedgehog-53551/) |
| Hundred Acre Wood | In A. A. Milne's Winnie-the-Pooh stories, Pooh and his friends live in the Hundred Acre Wood, based on Five Hundred Acre Wood in Ashdown Forest, East Sussex | [Wikipedia, Hundred Acre Wood](https://en.wikipedia.org/wiki/Hundred_Acre_Wood); [Smithsonian Magazine, fire in the forest that inspired the Hundred Acre Wood](https://www.smithsonianmag.com/smart-news/fire-tore-through-forest-inspired-winnie-poohs-hundred-acre-wood-180972082/); [Ashdown Forest (official), Winnie-the-Pooh](https://ashdownforest.org/explore/winnie-the-pooh/); [Wikipedia, Winnie-the-Pooh](https://en.wikipedia.org/wiki/Winnie-the-Pooh). Wrong options: [Wikipedia, The Faraway Tree](https://en.wikipedia.org/wiki/The_Faraway_Tree) and [Enid Blyton Society, The Enchanted Wood (1939)](https://www.enidblytonsociety.co.uk/book-details.php?id=215); [Wikipedia, The Wind in the Willows](https://en.wikipedia.org/wiki/The_Wind_in_the_Willows) (Badger lives in the Wild Wood) and [Britannica, Kenneth Grahame](https://www.britannica.com/biography/Kenneth-Grahame) |
| The Little Prince | Written and illustrated by Antoine de Saint-Exupery, French aviator; first published April 1943 (New York, English and French); the prince comes from a tiny planet, possibly asteroid B-612 | [Britannica, The Little Prince](https://www.britannica.com/topic/The-Little-Prince) (via search summary; the page returned 403 when fetched); [Britannica, Antoine de Saint-Exupery](https://www.britannica.com/biography/Antoine-de-Saint-Exupery); [The Morgan Library and Museum, Le petit prince manuscript](https://www.themorgan.org/literary-historical/131761); [Wikipedia, Antoine de Saint-Exupery](https://en.wikipedia.org/wiki/Antoine_de_Saint-Exup%C3%A9ry) |
| Caviar | Caviar is the processed, salted roe of the sturgeon (family Acipenseridae); traditionally from the Caspian and Black Seas; beluga, osetra and sevruga are sturgeon caviars; FAO treats other fish roe as substitutes | [Britannica, Sturgeon](https://www.britannica.com/animal/sturgeon-fish); [Merriam-Webster, caviar](https://www.merriam-webster.com/dictionary/caviar); [Wikipedia, Caviar](https://en.wikipedia.org/wiki/Caviar) (cites FAO) |
| Computer vision | A subfield of AI that lets machines interpret images and video; self-driving cars use it to avoid pedestrians and to detect traffic signs | [IBM Think, What is computer vision?](https://www.ibm.com/think/topics/computer-vision) (fetched); [Arm glossary, computer vision](https://www.arm.com/glossary/computer-vision); [NIH PMC, Biomedical applications of computer vision using AI](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8811752/) |
| The Pantheon | Photo shows the Pantheon in Rome: Corinthian portico with the inscription "M AGRIPPA L F COS TERTIVM FECIT", built under Hadrian about 126-128 AD on Agrippa's earlier temple; now the church of Santa Maria ad Martyres | [Wikipedia, Pantheon, Rome](https://en.wikipedia.org/wiki/Pantheon,_Rome); [World History Encyclopedia, Pantheon](https://www.worldhistory.org/Pantheon/); [History.com, Pantheon](https://www.history.com/articles/pantheon); Commons file page (description and category "Pantheon (Rome) - Exterior"); checked by viewing the photo |

Wrong options checked as real and not correct:
- Sister Emmanuelle (Emmanuelle Cinquin): a nun who worked with Cairo's rubbish collectors from 1971 ([Wikipedia](https://en.wikipedia.org/wiki/Emmanuelle_Cinquin); [Daily News Egypt](https://www.dailynewsegypt.com/2008/10/21/france-and-cairos-beloved-nun-sister-emmanuelle-dies-at-99/)).
- Mother Cabrini: founded the Missionary Sisters of the Sacred Heart of Jesus in 1880 ([Britannica](https://www.britannica.com/biography/Saint-Frances-Xavier-Cabrini)).
- Doria Shafik: founded the Bint al-Nil Union in 1948, not the Egyptian Feminist Union ([Wikipedia, Doria Shafik](https://en.wikipedia.org/wiki/Doria_Shafik); [Encyclopedia.com](https://www.encyclopedia.com/women/encyclopedias-almanacs-transcripts-and-maps/shafik-doria-1908-1975)).
- Tails and Knuckles: not in the original 1991 game. They are a fox and an echidna from later games ([Wikipedia, Characters of Sonic the Hedgehog](https://en.wikipedia.org/wiki/Characters_of_Sonic_the_Hedgehog)).
- Schiaparelli, Lanvin, Adler, Jung, Verne, Camus, Paddington, the Maison Carree (Roman temple in Nimes) and the Temple of Hephaestus (Athens): widely known, and none fits its clue.

## Image sources and licences

| Points | File | Commons file page | Author | Licence | File revision |
|---|---|---|---|---|---|
| 600 | `landmark-pantheon-rome.jpg` | [Pantheon of Roma.jpg](https://commons.wikimedia.org/wiki/File:Pantheon_of_Roma.jpg) | Wilfredor (Wilfredo Rafael Rodriguez Hernandez, own work) | CC0 1.0 | 2024-03-25 (photo taken 2024-02-09) |

- Downloaded on 2026-11-01 from upload.wikimedia.org (the 1280 px rendition of the current revision) into a new, empty temp directory. Re-encoded with PHP GD as JPEG quality 72, keeping only the pixels (no metadata) and with no cropping: 1280 x 980 px, 219,362 bytes (under 250 KB).
- Licence read from the file page wikitext through the Commons API: `{{self|cc-zero}}`, own work, no deletion request or warning template. Credit in the game: `image_credit` = "Wilfredor / CC0". Wilfredor's CC0 photos are already used for the Arc de Triomphe, the Trevi Fountain and Neuschwanstein.
- The file page carries a `{{Retouched|People removed using cloning}}` note: the photographer removed passers-by. The building is not altered. A few tiny, unrecognisable figures remain at the far left edge. No recognisable people are in the photo.
- Building copyright: none (2nd century AD).
- Look-alike check: no picture in the bank shows a similar building. The Acropolis (Landmarks 200) is also a columned classical temple, but it is a ruin on a hill with no pediment inscription. The Pantheon in Paris is not in the bank.
- The rejected first candidate is listed under "Dropped or reworded".

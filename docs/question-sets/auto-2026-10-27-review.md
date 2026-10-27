# Automatic batch 2026-10-27: review

## Live/local differences (from the brief)

On 2026-10-27, live `/api/categories.php` matched the local counts in all 14 categories. There are no differences.

## Summary

File: `sql/add-auto-2026-10-27-questions.sql`, 6 rows (5 text, 1 picture; 10 written, 4 removed by the owner on 2026-10-27), all with `question_ar`, `answer_ar`, `wrong_1`, `wrong_2`, `wrong_1_ar`, `wrong_2_ar` filled. New image: `img/questions/landmark-sacre-coeur.jpg`. Not loaded into any database and no git commands run, as the brief asks.

| Category | Points | Brief asked | Written | Removed by the owner | In the file | Local count now | Count after load |
|---|---|---|---|---|---|---|---|
| Cartoons & Childhood | 600 | 3 | 3 | 1 | 2 | 1 | 3 |
| Who Am I? | 100 | 1 | 1 | 0 | 1 | 3 | 4 |
| Who Am I? | 200 | 1 | 1 | 1 | 0 | 3 | 3 |
| Who Am I? | 500 | 1 | 1 | 1 | 0 | 2 | 2 |
| Who Am I? | 600 | 1 | 1 | 0 | 1 | 2 | 3 |
| Landmarks | 600 (picture) | 1 | 1 | 0 | 1 | 3 | 4 |
| Food & Drink | 400 | 1 | 1 | 0 | 1 | 4 | 5 |
| Food & Drink | 600 | 1 | 1 | 1 | 0 | 4 | 4 |

Count per point value in the file: 100 = 1, 400 = 1, 600 = 4 (6). Every slot was filled when written; the owner removed 4 questions on 2026-10-27, not replaced (see "Removed by the owner (2026-10-27)").

Variety as written, before the owner's removals:
- Cartoons & Childhood 600: an Egyptian Ramadan song, a Western cartoon (Garfield) and a childhood toy (Rubik's Cube).
- Who Am I?: silent film (Chaplin), nursing/medicine (Nightingale), philosophy (Ibn Rushd) and architecture (Hassan Fathy). None of them is pop music, Arabic literature, painting or travel/exploration, as the 2026-10-26 rows were.
- Food & Drink: a drink and spice (Arabic coffee and cardamom) at 400, a dessert and its history (peach Melba) at 600.

The photo credit goes into `image_credit` in the same insert, so the file needs `sql/migrate-add-image-credit.sql` (already run locally and on the hosted DB, as the Landmarks set uses it).

## Questions

| Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| Cartoons & Childhood | 600 | Which Egyptian singer was the first to sing "Ramadan Gana" ("Ramadan Has Come"), the song still played on radio and TV every year to welcome the holy month? | Mohamed Abdel Muttalib (accept Abdel Muttalib, Abdel Motaleb) | أي مطرب مصري كان أول من غنى "رمضان جانا"، الأغنية التي ما زالت تُذاع كل عام في الراديو والتلفزيون لاستقبال الشهر الكريم؟ | محمد عبد المطلب (يُقبل: عبد المطلب) | Mohamed Qandil, Mohamed Rushdi / محمد قنديل، محمد رشدي | Accept any spelling (Abdel Mottaleb, Abdel-Motaleb). Reject singers of later covers. Same kind of question as "Ahlan bel Eid" (300) and Sami Clark (600). |
| Cartoons & Childhood | 600 | The Rubik's Cube, the twisting puzzle toy with six coloured faces, was invented in 1974 by Erno Rubik, a young teacher of architecture and design. In which country? | Hungary | اخترع إرنو روبيك، وهو مدرس شاب للعمارة والتصميم، لعبة "مكعب روبيك" ذات الأوجه الستة الملونة عام 1974. في أي دولة؟ | المجر | Poland, Austria / بولندا، النمسا | Accept "Budapest, Hungary". Reject "Budapest" alone (a city, not the country asked). |
| Who Am I? | 100 | I was a British comic actor of silent films. My most famous character, "The Tramp", wore a bowler hat, baggy trousers and a small toothbrush moustache, and carried a cane. Who am I? | Charlie Chaplin (accept Chaplin) | كنت ممثلًا كوميديًا بريطانيًا في عصر السينما الصامتة. أشهر شخصياتي "المتشرد"، الذي يرتدي قبعة مستديرة وبنطالًا واسعًا وشاربًا صغيرًا، ويحمل عصا. من أنا؟ | تشارلي شابلن (يُقبل: شابلن) | Buster Keaton, Harold Lloyd / باستر كيتون، هارولد لويد | Reject Stan Laurel (British, bowler hat, but no Tramp, no moustache). |
| Who Am I? | 600 | I was an Egyptian architect who revived building with mud brick for the poor. I designed the village of New Gourna in Upper Egypt and wrote the book "Architecture for the Poor". Who am I? | Hassan Fathy | كنت مهندسًا معماريًا مصريًا أحييت البناء بالطوب اللبن من أجل الفقراء. صممت قرية القرنة الجديدة في صعيد مصر، وكتبت كتاب "عمارة الفقراء". من أنا؟ | حسن فتحي | Ramses Wissa Wassef, Abdel Wahed El-Wakil / رمسيس ويصا واصف، عبد الواحد الوكيل | "Luxor" left out on purpose: it is a Geography 400 answer. Reject El-Wakil (his student). |
| Landmarks | 600 | Which landmark is this? (picture `img/questions/landmark-sacre-coeur.jpg`) | The Sacre-Coeur Basilica (accept Sacre-Coeur, the Basilica of the Sacred Heart) | ما هذا المعلم؟ | بازيليك القلب المقدس (يُقبل: ساكري كور) | Notre-Dame de la Garde, Notre-Dame de Fourviere / نوتردام دو لا غارد، نوتردام دو فورفيير | Accept "Sacre-Coeur de Montmartre". Reject "Notre-Dame" (History 200 answer, a different church). Both wrong options are real French hilltop basilicas of a similar style (Marseille, Lyon). Credit: "Pedro Szekely / CC BY-SA 2.0". |
| Food & Drink | 400 | Traditional Arabic coffee (gahwa), served in small cups as a sign of hospitality, gets its signature flavour mainly from which spice, added generously when the coffee is brewed? | Cardamom (accept green cardamom, hail, hal) | القهوة العربية التقليدية، التي تُقدَّم في فناجين صغيرة رمزًا للكرم، تأخذ نكهتها المميزة أساسًا من أي بهار يُضاف إليها بسخاء أثناء تحضيرها؟ | الهيل (يُقبل: الحبهان) | Cumin, Star anise / الكمون، اليانسون النجمي | Reject saffron and cloves: some regional styles add them, but cardamom is the main spice. Cardamom is also a wrong option of the Food 400 vanilla question; no conflict. |

## Removed by the owner (2026-10-27)

Taken out of the SQL file and added to `docs/question-sets/rejected-answers.md`. Not replaced.

| Category | Points | Question | Answer |
|---|---|---|---|
| Cartoons & Childhood | 600 | In "Garfield", what is the full name of the fat orange cat's owner, a cartoonist who also owns the dog Odie? | Jon Arbuckle (accept Jonathan Arbuckle) |
| Who Am I? | 200 | I was a British nurse. During the Crimean War I made night rounds through the wards of wounded soldiers, and they called me "The Lady with the Lamp". Who am I? | Florence Nightingale |
| Who Am I? | 500 | I was a 12th-century philosopher, judge and physician from Cordoba in Al-Andalus. My commentaries on Aristotle were so famous in Europe that I was called simply "The Commentator". Who am I? | Ibn Rushd (accept Averroes) |
| Food & Drink | 600 | The French chef Auguste Escoffier created the dessert peach Melba in honour of the Australian star Nellie Melba. What was she famous as? | An opera singer (accept soprano, singer, opera star) |

Difficulty benchmarks used:
- Cartoons 600: Sami Clark (Grendizer singer). 500: Chemical X, Great Dane, Mohamed Fawzi, Rasha Rizk.
- Who Am I?: 100 (Michael Jackson, MLK quote, Zewail), 200 (Mahfouz, Shawqi, Al-Mutanabbi), 500 (Descartes quote, Abbas Ibn Firnas), 600 (Shawqi and Al-Mutanabbi quotes).
- Landmarks 600: Louvre Abu Dhabi, Neuschwanstein, Petronas Towers.
- Food 400: Fattah, Vanilla, Fesikh, Halloumi. Food 600: Bergamot, Tijuana, al-Hakim, Taro.

## Duplicate and rejected-list checks

- Every answer was checked against all local DB questions (answers, question texts and wrong options, case-insensitive, ignoring "(accept ...)") and against `docs/question-sets/rejected-answers.md`. No answer is in the bank or on the rejected list. The only matches are wrong options elsewhere (Nightingale in History 400, Cardamom in Food 400, Hungary in Geography 400), which is not a conflict.
- Rejected Cartoons 600 answers (Lucifer, Norville, Bing Bong, Dr. Claw, Mazinger Z, creator names and others) and rejected Food answers (Tandoor, Anchovies, Cloves, Mace, nutmeg and others) were not used, not even reworded.
- Give-aways avoided: no question names Luxor (Geography 400), sushi (Food 200), lasagne (rejected Garfield answer) or Notre-Dame as an answer. "Ramadan Gana" does not reveal the Egyptians 500 answer "Ramadan" (a father's name in "El Eyal Kebret").

## Dropped or reworded

| Draft | Why |
|---|---|
| Cartoons 600: "Iftah Ya Simsim" puppet question (Noman the camel) | Would give away the Cartoons 100 answer (Arabic Sesame Street). |
| Cartoons 600: "How many Dragon Balls?" (seven) | "Seven" is already a Science 100 answer. |
| Cartoons 600: Garfield draft mentioning his love of lasagne | Lasagna is a rejected Cartoons answer. Reworded without it. |
| Cartoons 600: LEGO country (Denmark), Barbie's real name | Denmark is a Flags answer. Barbie is a Movies 100 answer. |
| Cartoons 600: Ramadan Gana with the year 1965 | Only one outlet (Al Majalla) gives the year. Reworded to "first to sing", which Ahram Online and Al Majalla both support. |
| Who Am I?: Saladin, Nasser, Beethoven | Saladin is an accepted Landmarks answer variant (Citadel of Saladin) and was swapped out of an earlier History set. Nasser clues lead to the Suez Canal and 1952 (existing answers). Beethoven is music, too close to the 2026-10-26 pop-music row. |
| Who Am I? 600: Hassan Fathy "near Luxor" | Luxor is a Geography 400 answer. Changed to "in Upper Egypt". |
| Food 400: "seeds of a plant in the ginger family" clue for cardamom | The clue would rule out the wrong options by their form. Replaced by the gahwa clue. |
| Food 600: "created at the Savoy Hotel in 1893, and later Melba toast" | Sources disagree on the year and the hotel, and Melba toast was only in secondary sources. Dropped those details. |

## Fact-check sources

Web content checked during this run did not contain any text aimed at the agent.

| Question | Facts checked | Sources |
|---|---|---|
| Ramadan Gana | First sung by Mohamed Abdel Muttalib, played every year to welcome Ramadan | [Ahram Online, 2020](https://english.ahram.org.eg/UI/Front/Inner.aspx?NewsContentID=368034) ("first popularised by Abdel-Motaleb", composed by Mahmoud El-Sherif, lyrics by Hussein Tantawy); [Al Majalla, "The Ramadan Singer"](https://en.majalla.com/node/132216/profileramadan-singer-mohamed-abdel-muttalib); [Al-Ahram Weekly, 2021](https://english.ahram.org.eg/NewsContent/50/1208/409672/AlAhram-Weekly/Features/Ramadan-in-Mohamed-Ali-Street.aspx) |
| Jon Arbuckle | Garfield's owner, a cartoonist, also owns Odie | [Britannica, Jim Davis](https://www.britannica.com/biography/Jim-Davis-American-cartoonist); [Wikipedia, Jon Arbuckle](https://en.wikipedia.org/wiki/Jon_Arbuckle) |
| Rubik's Cube | Invented 1974 by Erno Rubik, Hungarian, teaching architecture and design in Budapest | [Britannica, Rubik's Cube](https://www.britannica.com/topic/Rubiks-Cube); [Britannica, Erno Rubik](https://www.britannica.com/biography/Erno-Rubik); [Smithsonian Magazine](https://www.smithsonianmag.com/innovation/brief-history-rubiks-cube-180975911/) (spring 1974, Hungarian architect) |
| Charlie Chaplin | British comic actor of silent films, "the Little Tramp", bowler/derby hat, baggy trousers, cane, toothbrush moustache | [Britannica, Charlie Chaplin](https://www.britannica.com/biography/Charlie-Chaplin); [Wikipedia, The Tramp](https://en.wikipedia.org/wiki/The_Tramp) |
| Florence Nightingale | British nurse, Crimean War, night rounds, "Lady with the Lamp" | [Britannica](https://www.britannica.com/biography/Florence-Nightingale); [History.com](https://www.history.com/articles/florence-nightingale) |
| Ibn Rushd | Born Cordoba 1126, philosopher, judge (qadi) and physician, called "The Commentator" on Aristotle in Latin Europe | [Encyclopedia.com (New Catholic Encyclopedia)](https://www.encyclopedia.com/religion/encyclopedias-almanacs-transcripts-and-maps/averroes-ibn-rushd); [Wikidata / Britannica entry](https://www.wikidata.org/wiki/Q39837); [Wikipedia, Averroes](https://en.wikipedia.org/wiki/Averroes) |
| Hassan Fathy | Egyptian architect, mud brick (adobe), New Gourna, "Architecture for the Poor" (1973 title) | [University of Chicago Press](https://press.uchicago.edu/ucp/books/book/chicago/A/bo3641441.html); [World Monuments Fund, New Gourna](https://www.wmf.org/projects/new-gourna-village); [Al Jazeera, 2017](https://www.aljazeera.com/features/2017/3/23/hassan-fathy-egypts-architect-of-the-poor) |
| Sacre-Coeur | Photo shows the Sacre-Coeur Basilica (Montmartre, Paris), south facade | Commons file page and its category "South facade of the Basilique du Sacre-Coeur de Montmartre"; [Wikipedia, Sacre-Coeur](https://en.wikipedia.org/wiki/Sacr%C3%A9-C%C5%93ur,_Paris); checked by viewing the photo |
| Cardamom in gahwa | Arabic coffee is brewed with cardamom as the main spice (saffron, cloves or rose water in some styles) | [McCormick Science Institute, Cardamom](https://www.mccormickscienceinstitute.com/resources/culinary-spices/herbs-spices/cardamom); [Gernot Katzer's Spice Pages](https://gernot-katzers-spice-pages.com/engl/Elet_car.html); [The National, 2025](https://www.thenationalnews.com/arts-culture/2025/05/12/coffee-ceremony-arabic-gulf-gahwa-brewing-tradition/) (cardamom and saffron); [Britannica, cardamom](https://www.britannica.com/plant/cardamom) |
| Peach Melba | Created by Auguste Escoffier in honour of the Australian soprano Nellie Melba | [Britannica, peach Melba](https://www.britannica.com/topic/peach-Melba); [Historic Hotels, the Savoy](https://www.historichotels.org/hotels-resorts/the-savoy-london/restaurants/peach-melba-at-the-savoy.php); [Wikipedia, Peach Melba](https://en.wikipedia.org/wiki/Peach_Melba) |

## Image sources and licences

| Points | File | Commons file page | Author | Licence | File revision |
|---|---|---|---|---|---|
| 600 | `landmark-sacre-coeur.jpg` | [Sacre-Coeur Basilica in Montmartre, 2 May 2018.jpg](https://commons.wikimedia.org/wiki/File:Sacr%C3%A9-C%C5%93ur_Basilica_in_Montmartre,_2_May_2018.jpg) | Pedro Szekely (Flickr) | CC BY-SA 2.0 | 2018-05-11 |

- Downloaded on 2026-10-27 from upload.wikimedia.org (the 1280 px rendition of the current revision) into a new empty temp directory, then re-encoded with PHP GD as JPEG quality 85 (pixels only, no metadata, not cropped): 1280 x 833 px, 243,584 bytes (under 250 KB).
- Licence read from the file page through the Commons API: CC BY-SA 2.0, Flickr review passed (FlickreviewR), no deletion request, no warning template. Attribution in the game: `image_credit` = "Pedro Szekely / CC BY-SA 2.0" (author shortened from "Pedro Szekely from Los Angeles, USA", as in the Landmarks set).
- No people in the photo (only the building, lawn and trees).
- Building copyright: France has no freedom of panorama. The basilica was designed by Paul Abadie (died 1884) and completed in 1914 by his successors (Daumet, Laisne, Rauline, Magne; their death dates were not all checked). The one later architect known to be still under copyright, Jean Hulot (died 1959, so protected until the end of 2029), only took over in 1916, after the building was finished, and his own work was the annexes of the 1930s ([Merimee/POP record PA75180004](https://pop.culture.gouv.fr/notice/merimee/PA75180004), [INHA AGORHA](https://agorha.inha.fr/ark:/54721/24a3eadd-4659-4d94-abd0-40d76a2f0a82)). The photo shows the basilica's south facade, and the Commons file carries no no-freedom-of-panorama warning. Low risk, noted for the owner.
- Look-alike check: no other answer in the bank shows a similar building.

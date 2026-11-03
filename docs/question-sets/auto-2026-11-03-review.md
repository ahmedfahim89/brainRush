# Automatic batch 2026-11-03: review

## Live/local differences (from the brief)

- Cartoons & Childhood: local 32, live 31
- Landmarks: local 49, live 48
- Who Am I?: local 24, live 21

## Reported questions

No open reports in the local DB on 2026-11-03.

## Status

All 10 slots were filled and every row passed the fact-check. Not loaded into the local DB and no git commands run, as the brief asks. To test it, the producer ran the file twice on a throwaway copy of the local DB (`br_scratch_1103`, dropped afterwards). The first run added 10 rows (869 to 879), the second added none, and every new row has all 4 option fields filled.

Owner's review (2026-11-03): Hippocrates, Ibn Khaldun, Roald Amundsen, the Omnitrix, Huey, Dewey and Louie, and the Potala Palace picture were removed and not replaced (see "Removed by the owner (2026-11-03)"). The owner approved the remaining 4 rows, including Sam Altman (AI 500) despite its overlap with History 500 (id 424). The file now has 4 rows.

## Summary

File: `sql/add-auto-2026-11-03-questions.sql`, 4 text rows. Every row has `question_ar`, `answer_ar`, `wrong_1`, `wrong_2`, `wrong_1_ar` and `wrong_2_ar` filled. No new image.

| Category | Points | Brief asked | In the file | Local count now | Count after load |
|---|---|---|---|---|---|
| Who Am I? | 200 | 1 | 0 (removed by the owner) | 4 | 4 |
| Who Am I? | 300 | 1 | 1 | 4 | 5 |
| Who Am I? | 400 | 1 | 0 (removed by the owner) | 4 | 4 |
| Who Am I? | 500 | 1 | 0 (removed by the owner) | 3 | 3 |
| Cartoons & Childhood | 200 | 1 | 1 | 5 | 6 |
| Cartoons & Childhood | 300 | 1 | 1 | 5 | 6 |
| Cartoons & Childhood | 400 | 2 | 0 (removed by the owner) | 4 | 4 |
| AI | 500 | 1 | 1 | 5 | 6 |
| Landmarks | 500 (picture) | 1 | 0 (removed by the owner) | 5 | 5 |

Count per point value in the file: 200 = 1, 300 = 2, 500 = 1 (4).

Variety:
- Who Am I?: medicine (Hippocrates, ancient), boxing (Mike Tyson, 20th century), history and social thought (Ibn Khaldun, 14th century) and polar exploration (Amundsen, 1911). The category has no other answers from these fields. The closest are Bruce Lee (martial arts, at 200) and Ibn Battuta (travel, at 400). Tyson was placed at 300, not 200, to keep him out of Bruce Lee's cell.
- Cartoons & Childhood: a 1930s comic-strip cartoon (Popeye, 200), a 1990s toy (Tamagotchi, 300), a 2005 Cartoon Network series (Ben 10, 400) and a 1987 Disney TV series (DuckTales, 400). The two 400 questions come from different shows, studios and decades.
- AI 500: a person and a news event at the head of the industry (Sam Altman, 2023). The cell already has a lawsuit, a robot, a concept, an AI lab and a chip maker.
- Landmarks 500: an Asian palace (Potala, Lhasa). The cell already has two Egyptian palaces, a European parliament and two Gulf buildings.

Difficulty benchmarks (existing rows in each cell):
- Who Am I? 200: Naguib Mahfouz, Bruce Lee, Shawqi and Al-Mutanabbi quotes. 300: Shakespeare quote, Karl Benz, Pasteur, Van Gogh. 400: Tariq ibn Ziyad, Ibn Battuta, Armstrong and Al-Mutanabbi quotes. 500: Descartes quote, Coco Chanel, Abbas Ibn Firnas.
- Cartoons 200: Cruella, Batout, Spacetoon, Sonic, Mohamed Mounir. 300: Shinichi Kudo, Duke Fleed, spaghetti, Bougy wa Tamtam, Safaa Abu El Saud. 400: Dee Dee, Tinker Bell, Hassouna, Donatello.
- AI 500: NYT lawsuit, Optimus, Generative AI, Anthropic, Nvidia.
- Landmarks 500: Baron Empain Palace, Hungarian Parliament, Kingdom Centre, Montaza Palace, Museum of the Future.

## Questions

| Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| Who Am I? | 300 | I am an American boxer nicknamed "Iron Mike". In 1986, at just 20, I won my first world heavyweight title, and in 1997 I was disqualified for biting Evander Holyfield's ear. Who am I? | Mike Tyson (accept Tyson) | أنا ملاكم أمريكي ألقب بـ"مايك الحديدي". عام 1986، وأنا في العشرين فقط، فزت بأول لقب عالمي لي في الوزن الثقيل، وعام 1997 استُبعدت من النزال لأنني عضضت أذن إيفاندر هوليفيلد. من أنا؟ | مايك تايسون (يُقبل: تايسون) | Lennox Lewis, George Foreman / لينوكس لويس، جورج فورمان | Living person, but every fact is fixed and his age is not mentioned. The draft said "youngest heavyweight champion in history". That is a record that could be broken, so it now says "at just 20". Muhammad Ali was not used: he is a Sports 100 answer. |
| Cartoons & Childhood | 200 | In the "Popeye" cartoons, what is the name of Popeye's tall, skinny girlfriend, whom he often has to rescue from the bully Bluto? | Olive Oyl (accept Olive) | في كرتون "باباي"، ما اسم حبيبة باباي الطويلة النحيفة التي يضطر كثيرًا إلى إنقاذها من المتنمّر بلوتو؟ | أوليف أويل (يُقبل: زيتونة، أوليف) | Betty Boop, Daisy Duck / بيتي بوب، ديزي داك | Popeye first appeared in a 1933 Betty Boop cartoon, which makes her a fair near-miss. The Arabic name "Zaytouna" is only confirmed by Arabic pop-culture sites, so it is an accepted variant and not the main answer (see the sources). The Cartoons 100 question (spinach) also features Popeye, but it is a different question and neither gives the other away. |
| Cartoons & Childhood | 300 | Which egg-shaped digital pet, launched by the toy company Bandai in 1996, had to be fed and cleaned up after, or it would get sick and die? | Tamagotchi | ما اسم الحيوان الأليف الرقمي على شكل بيضة، الذي أطلقته شركة الألعاب "بانداي" عام 1996، وكان لا بد من إطعامه وتنظيفه وإلا مرض ومات؟ | تاماغوتشي | Neopets, Nintendogs / نيوبتس، نينتندوغز | Reject Digimon (Bandai's 1997 spin-off for boys, a different product). "Japan" is left out because Japan is a Flags answer. Furby was not used as an option: it is on the rejected list (AI). |
| AI | 500 | In November 2023, which boss of the company behind ChatGPT was suddenly fired by its board, then agreed to return as CEO within a week? | Sam Altman (accept Altman) | في نوفمبر 2023، أي رئيس للشركة المطوّرة لـ ChatGPT أقاله مجلس إدارتها فجأة، ثم اتفق على العودة رئيسًا تنفيذيًا خلال أقل من أسبوع؟ | سام ألتمان (يُقبل: ألتمان) | Greg Brockman, Mira Murati / غريغ بروكمان، ميرا موراتي | Reject Brockman: he was removed as chair and quit the same day, but he was not the CEO. Murati was made interim CEO and was not fired. "OpenAI" is not named because it is the AI 100 answer. Sources differ on the return date (agreement 21 Nov, reported 22 Nov, formal return 29 Nov), so the question says "agreed ... within a week". |

## Removed by the owner (2026-11-03)

These are taken out of the SQL file and added to `rejected-answers.md`. They were not replaced. The Potala Palace photo (`img/questions/landmark-potala-palace.jpg`) was deleted with its question.

| Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| Who Am I? | 200 | I was an ancient physician from the island of Kos, often called the "Father of Medicine". The oath that new doctors traditionally take is named after me. Who am I? | Hippocrates | كنت طبيبًا قديمًا من جزيرة كوس، ويلقبونني كثيرًا بـ"أبي الطب". والقسم الذي يؤديه الأطباء الجدد تقليديًا يحمل اسمي. من أنا؟ | أبقراط | Galen, Herodotus / جالينوس، هيرودوت | Reject Galen (Roman-era physician) and Asclepius (the god of medicine). "Named after me" is deliberate: historians doubt Hippocrates wrote the Oath himself. "Greek" left out because Greece is a Flags 300 answer. |
| Who Am I? | 400 | I was a 14th-century Arab historian and thinker, born in Tunis. My "Muqaddimah" ("Introduction") is a famous early study of how societies and states rise and fall, and I served as a judge under the Mamluk sultans. Who am I? | Ibn Khaldun | كنت مؤرخًا ومفكرًا عربيًا من القرن الرابع عشر، وُلدت في تونس. كتابي "المقدمة" دراسة مبكرة شهيرة عن قيام المجتمعات والدول وسقوطها، وعملت قاضيًا في عهد سلاطين المماليك. من أنا؟ | ابن خلدون | Al-Maqrizi, Al-Tabari / المقريزي، الطبري | Al-Maqrizi was his student in Cairo, a classic near-miss. Ibn Khaldun is already a wrong option in the Ibn Battuta question (same cell), which does not conflict. "Cairo" and "Egypt" are left out (Cairo is a Geography 100 answer). |
| Who Am I? | 500 | I was a polar explorer. In December 1911 my team became the first to reach the South Pole, about five weeks ahead of a British party whose five men all died on the way back. Who am I? | Roald Amundsen (accept Amundsen) | كنت مستكشفًا قطبيًا. في ديسمبر 1911 أصبح فريقي أول من يصل إلى القطب الجنوبي، قبل نحو خمسة أسابيع من فريق بريطاني مات رجاله الخمسة جميعًا في طريق العودة. من أنا؟ | روال أموندسن (يُقبل: أموندسن) | Robert Falcon Scott, Ernest Shackleton / روبرت فالكون سكوت، إرنست شاكلتون | Reject Scott (he led the British party). "Norwegian" is left out because Norway is a Flags 300 answer. Amundsen reached the pole on 14 Dec 1911 and Scott on 17 Jan 1912, 34 days later. |
| Cartoons & Childhood | 400 | In the 2005 cartoon "Ben 10", what is the name of the watch-like alien device that lets 10-year-old Ben Tennyson turn into different aliens? | The Omnitrix (accept Omnitrix) | في كرتون "بن 10" (2005)، ما اسم الجهاز الفضائي الذي يشبه الساعة ويسمح للطفل بن تينيسون ذي العشر سنوات بالتحول إلى كائنات فضائية مختلفة؟ | الأومنيتريكس | The Power Morpher, The Digivice / الباور مورفر، الديجيفايس | Reject "Ultimatrix": an upgraded device from the later series "Ultimate Alien" (2010), not the 2005 show. It is not used as an option because some players might argue it. The options are the transformation devices from Power Rangers and Digimon. |
| Cartoons & Childhood | 400 | In the cartoon "DuckTales" (1987), Scrooge McDuck looks after his three young grand-nephews. What are their names? | Huey, Dewey and Louie (accept any order) | في كرتون "داك تيلز" (DuckTales) عام 1987، يعتني سكروج ماكدك بأحفاد أخته الثلاثة الصغار. ما أسماؤهم؟ | هيوي وديوي ولوي (يُقبل: بأي ترتيب) | Alvin, Simon and Theodore / Blossom, Bubbles and Buttercup; ألفين وسايمون وثيودور / بلوسوم وبابلز وباتركب | All three names are needed. Donald Duck is not named, so the Batout question (Cartoons 200) is not given away. The Arabic question does not use the Egyptian comics name for Scrooge ("Am Dahab"), which is on the rejected list (fan sources only). Accept Arabic-comics names for the boys at the host's discretion. They are not listed because they were not confirmed. |
| Landmarks | 500 | Which landmark is this? (picture `img/questions/landmark-potala-palace.jpg`, deleted) | The Potala Palace (accept the Potala, Potala Palace in Lhasa) | ما هذا المعلم؟ | قصر بوتالا (يُقبل: البوتالا، قصر بوتالا في لاسا) | Leh Palace, Thiksey Monastery / قصر ليه، دير ثيكسي | Both options are in Ladakh and are nicknamed "Mini Potala" because they look like it. Reject "Jokhang" (a temple in Lhasa) and "Norbulingka" (the Dalai Lama's summer palace). Credit: "Royonx / CC0". |

## Duplicate and rejected-list checks

- Every answer was checked against all 869 local DB questions (question texts, answers and wrong options, case-insensitive) and against `docs/question-sets/rejected-answers.md`. None of the 10 answers is an answer in the bank or on the rejected list.
- Some answers already appear in the bank as a wrong option only, which is not a conflict: Ibn Khaldun (Who Am I? 400, the Ibn Battuta question).
- Give-aways avoided: no question names OpenAI (AI 100), Japan, Greece, Norway, Cairo, Donald Duck, SpongeBob, Finding Nemo, Aladdin or the Lion King.
- Rejected types respected: AI 500 is not a film robot, product feature name, viral incident, model or version trivia, or country-policy news. Nothing comes from the Jungle Book, Dragon Ball or the Smurfs, which the owner removed earlier or which would give away another answer.

## Dropped or reworded

| Draft | Why |
|---|---|
| Who Am I?: Muhammad Ali, Michael Jordan, Marie Curie, Abraham Lincoln, Steve Jobs | Already answers (Sports 100, Sports 200, History 400, History 300). Jobs is named in Technology 100, and his clue would give away "Apple" (Technology 200). |
| Who Am I?: Hammurabi | On the rejected list (History 500, 2026-10-20). |
| Who Am I? 300: Tyson "youngest heavyweight champion in history" | A record that could be broken. Reworded to "at just 20, I won my first world heavyweight title". |
| Who Am I? 400: Ibn Khaldun "founder of sociology", "died in Cairo" | Britannica calls him the father of the philosophy of history, and "sociology" is wording from other sources. Reworded to "a famous early study of how societies and states rise and fall". "Cairo" was removed because it is a Geography 100 answer. |
| Who Am I? 500: Amundsen "Norwegian" | Norway is a Flags 300 answer. Removed. |
| Who Am I? spare: Harry Houdini | Not needed once the four fields were set. "Hungarian-born" would have given away Hungary (Cartoons 600). |
| Cartoons: Scar, Abu, Krusty Krab, Smurfette, Dory | Their clues would name the Lion King, Aladdin, SpongeBob, the Smurfs or Finding Nemo, which are other answers in the bank. |
| Cartoons 300: number of Dragon Balls (seven) | "Seven" is a Science 100 answer, and the owner removed Goku. |
| Cartoons 300: Tamagotchi "from Japan" | Japan is a Flags answer. Reworded to "launched by the toy company Bandai". |
| Cartoons 400: Porky Pig | Same era as Popeye (1930s), so it was replaced by DuckTales for variety. |
| AI 500: DeepSeek | Geography 300 already names DeepSeek, and "Chinese" would give that answer away. |
| AI 500: IBM Watson | On the rejected list (Jeopardy!, 2026-10-20). |
| AI 500: Altman "co-founder and boss of OpenAI" | OpenAI is the AI 100 answer. Reworded to "boss of the company behind ChatGPT". |
| Landmarks 500 photos: "Potala Palace (20148538186).jpg" (Gary Todd, CC0) and "Potala Palace (20230729).jpg" (CC0) | Both were downloaded and viewed, then rejected. The first is shot through a car window and has a black band across the top. The second has recognisable tourists in the foreground and a date stamp. |

## Fact-check sources

Web content checked during this run did not contain any text aimed at the agent.

| Question | Facts checked | Sources |
|---|---|---|
| Hippocrates | Physician born on Kos (c. 460 BC), regarded as the father of medicine; the Hippocratic Oath bears his name, though he probably did not write it | [Britannica, Hippocrates summary](https://www.britannica.com/summary/Hippocrates); [Live Science, What is the Hippocratic oath](https://www.livescience.com/62515-hippocrates.html); [NIH PMC, Hippocrates of Kos](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11526839/) |
| Mike Tyson | Knocked out Trevor Berbick on 22 Nov 1986 for the WBC heavyweight title at 20 (born 30 June 1966); disqualified on 28 June 1997 for biting Holyfield's ears; nickname "Iron Mike" | [Britannica, Mike Tyson](https://www.britannica.com/biography/Mike-Tyson); [History.com, Tyson bites Holyfield's ear](https://www.history.com/this-day-in-history/june-28/mike-tyson-bites-ear); [ESPN, Mike Tyson timeline](http://www.espn.com/boxing/news/2002/0129/1319772.html); [EBSCO, Tyson becomes youngest champion](https://www.ebsco.com/research-starters/sports-and-leisure/tyson-becomes-youngest-world-heavyweight-boxing-champion/) |
| Ibn Khaldun | Born in Tunis in 1332, died in Cairo in 1406; Muqaddimah examines the nature of society and social change; appointed Maliki chief qadi by the Mamluk sultan Barquq (from 1384, six times) | [Britannica, Ibn Khaldun](https://www.britannica.com/biography/Ibn-Khaldun); [Encyclopedia.com, Ibn Khaldun](https://www.encyclopedia.com/religion/encyclopedias-almanacs-transcripts-and-maps/ibn-khaldun-1332-1406); [New World Encyclopedia](https://www.newworldencyclopedia.org/entry/Ibn_Khaldun) |
| Roald Amundsen | Five-man party reached the South Pole on 14 Dec 1911; Scott's party of five reached it on 17 Jan 1912 and all died on the return | [Royal Museums Greenwich, The race to the South Pole](https://www.rmg.co.uk/stories/maritime-history/race-south-pole-scott-amundsen); [EBSCO, Amundsen reaches the South Pole](https://www.ebsco.com/research-starters/history/amundsen-reaches-south-pole); [Wikipedia, Amundsen's South Pole expedition](https://en.wikipedia.org/wiki/Amundsen's_South_Pole_expedition) |
| Olive Oyl | Popeye's girlfriend; Bluto is his rival for her attention; created by E. C. Segar for Thimble Theatre | [Britannica, Popeye](https://www.britannica.com/topic/Popeye); [Wikipedia, Olive Oyl](https://en.wikipedia.org/wiki/Olive_Oyl); [Popeye.com, history](https://popeye.com/history/). Arabic name "Zaytouna" (accepted variant only): [Cartoontion podcast, Apple Podcasts](https://podcasts.apple.com/us/podcast/%D8%A8%D8%A7%D8%A8%D8%A7%D9%8A-%D8%B1%D8%AC%D9%84-%D8%A7%D9%84%D8%A8%D8%AD%D8%A7%D8%B1-%D8%A7%D9%84%D8%AD%D9%84%D9%82%D8%A9-28/id1456109978?i=1000603737723), [albawaabh.com](https://albawaabh.com/%D8%A8%D8%A7%D8%A8%D8%A7%D9%8A/) (weak sources, flagged for the owner) |
| Tamagotchi | Handheld egg-shaped digital pet by Bandai, released in Japan on 23 Nov 1996; beeps for food and cleaning, dies if neglected | [Wellcome Collection, The life and death of Tamagotchi](https://wellcomecollection.org/stories/digital-pets); [Wikipedia, Tamagotchi](https://en.wikipedia.org/wiki/Tamagotchi) |
| The Omnitrix | Ben 10 premiered on Cartoon Network on 27 Dec 2005; 10-year-old Ben Tennyson finds the Omnitrix, a watch-like alien device that lets him transform into aliens | [Wikipedia, Ben 10 (2005 TV series)](https://en.wikipedia.org/wiki/Ben_10_(2005_TV_series)); [Spectrum On Demand, Cartoon Network's Ben 10 synopsis](https://ondemand.spectrum.net/tv/cartoon-network/13321074/ben-10/); [CBR, Ben 10 original aliens](https://www.cbr.com/ben-10-original-aliens-ranked/). No encyclopaedia or trade-press source was found. The fact is the premise of the show, so the evidence is considered sufficient, but it is flagged for the owner. |
| Huey, Dewey and Louie | In DuckTales (1987), Scrooge looks after his grand-nephews Huey, Dewey and Louie | [D23, DuckTales (television)](https://d23.com/a-to-z/ducktales-television/); [D23, Huey, Dewey and Louie moments](https://d23.com/10-of-our-favorite-huey-dewey-and-louie-moments/); [Wikipedia, Scrooge McDuck](https://en.wikipedia.org/wiki/Scrooge_McDuck) |
| Sam Altman | Fired by the OpenAI board on 17 Nov 2023; agreement to return as CEO announced on 21 Nov, reported on 22 Nov | [Washington Post, Altman reinstated](https://www.washingtonpost.com/technology/2023/11/22/sam-altman-back-openai/); [PBS NewsHour](https://www.pbs.org/newshour/amp/nation/sam-altman-reinstated-as-openai-ceo-with-new-board-replacing-the-one-which-fired-him); [Good Morning America timeline](https://www.goodmorningamerica.com/news/story/sam-altman-reaches-deal-return-ceo-openai-105091534) |
| Potala Palace | Photo shows the Potala Palace in Lhasa: the White Palace and the red central Red Palace on Red Mountain. Building started in 1645 under the 5th Dalai Lama, and it was the winter palace from 1649. Checked by viewing the photo | [UNESCO, Historic Ensemble of the Potala Palace](https://whc.unesco.org/en/list/707); [Wikipedia, Potala Palace](https://en.wikipedia.org/wiki/Potala_Palace); [New World Encyclopedia](https://www.newworldencyclopedia.org/entry/Potala_Palace) |

Wrong options checked as real and not correct:
- Leh Palace (Ladakh, 17th century, modelled on the Potala, "Mini Potala") and Thiksey Monastery (Ladakh, also called "Mini Potala"): [Wikipedia, Leh Palace](https://en.wikipedia.org/wiki/Leh_Palace); [Wikipedia, Thiksey Monastery](https://en.wikipedia.org/wiki/Thikse_Monastery); [Oriental Architecture, Leh Palace](https://www.orientalarchitecture.com/sid/1986/india/leh-ladakh/leh-palace).
- Greg Brockman (removed as chair and resigned on 17 Nov 2023) and Mira Murati (CTO, made interim CEO): same sources as the Altman question.
- Galen, Herodotus, Lennox Lewis, George Foreman, Al-Maqrizi, Al-Tabari, Scott, Shackleton, Betty Boop, Daisy Duck, Neopets, Nintendogs, the Power Morpher, the Digivice, the Chipmunks and the Powerpuff Girls are all widely documented, and none fits its clue.

## Image sources and licences

The owner removed the Potala Palace question on 2026-11-03 and the file was deleted, so this batch adds no image. The record below is kept for reference.

| Points | File | Commons file page | Author | Licence | File revision |
|---|---|---|---|---|---|
| 500 | `landmark-potala-palace.jpg` | [Lhassa Potala.jpg](https://commons.wikimedia.org/wiki/File:Lhassa_Potala.jpg) | Royonx (own work) | CC0 1.0 | 2012-06-06 (photo taken 2012-05-27) |

- Downloaded on 2026-11-03 from upload.wikimedia.org (the 1280 px rendition of the current revision) into a new, empty temp directory, with a descriptive User-Agent and pauses between requests. Re-encoded with PHP GD as JPEG quality 72, keeping only the pixels (no metadata) and with no cropping: 1280 x 708 px, 189,024 bytes (under 250 KB).
- Licence read from the file page wikitext: `{{self|cc-zero}}`, `{{own}}`, with no deletion request or warning template. Credit in the game: `image_credit` = "Royonx / CC0".
- No recognisable people: the only figures are one or two tiny, unrecognisable ones at the bottom right.
- Building copyright: none (17th century).
- Look-alike check: no picture in the bank shows a similar building. The two options (Leh Palace, Thiksey Monastery) are only text options and have no pictures.
- The two rejected candidate photos are listed under "Dropped or reworded".

# Automatic batch 2026-11-21: review

## Live vs local differences

Information only (from the question-bank-manager brief): none. All 14 categories have the same counts on live and locally (AI 54, Cartoons & Childhood 54, Egyptians 123, Flags 60, Food & Drink 63, Gen Z 69, Geography 96, History 70, Landmarks 60, Movies 69, Science 75, Sports 99, Technology 68, Who Am I? 53).

## Reported questions

No open reports in the local DB on 2026-11-21.

## Status: approved by the owner on 2026-11-21 (all 10, no removals); loaded into the local DB

`sql/add-auto-2026-11-21-questions.sql` has **10 rows** (IDs 1121-01 to 1121-10): 9 text questions and 1 picture question (Landmarks 500, `img/questions/landmark-tokyo-skytree.jpg`). Loaded into the local DB on 2026-11-21.

Written to the owner's preference (2026-11-11): easier, mostly subjects from 2000 onwards. Wrong options are bare answers, no brackets.

| Slot | Category | Points | In the file | Local count now | After loading |
|---|---|---|---|---|---|
| 1 | Who Am I? | 100 | 1121-01 | 8 | 9 |
| 2 | Cartoons & Childhood | 600 | 1121-02 | 8 | 9 |
| 3 | AI | 100 | 1121-03 | 9 | 10 |
| 4 | Food & Drink | 500 | 1121-04 | 9 | 10 |
| 5 | Landmarks | 500 (picture) | 1121-05 | 9 | 10 |
| 6 | Movies | 600 | 1121-06 | 9 | 10 |
| 7 | AI | 200 | 1121-07 | 9 | 10 |
| 8 | Cartoons & Childhood | 200 | 1121-08 | 9 | 10 |
| 9 | Who Am I? | 200 | 1121-09 | 9 | 10 |
| 10 | Food & Drink | 600 | 1121-10 | 9 | 10 |

Count per point value: 100 = 2, 200 = 3, 500 = 2, 600 = 3. Local DB total: 1013 before, 1023 after loading.

## Questions

| ID | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| 1121-01 | Who Am I? 100 | I am an Indian film star known as the "King of Bollywood". I starred in "My Name Is Khan" (2010), and in 2023 my action films "Pathaan" and "Jawan" were huge box-office hits. Who am I? | Shah Rukh Khan (accept Shahrukh Khan, SRK, King Khan) | أنا نجم سينما هندي يلقّبونني "ملك بوليوود". قمت ببطولة فيلم "اسمي خان" (My Name Is Khan) عام 2010، وفي عام 2023 حقق فيلما الأكشن "باثان" (Pathaan) و"جوان" (Jawan) نجاحًا ضخمًا في شباك التذاكر. من أنا؟ | شاروخان (يُقبل: شاه روخ خان، SRK، كينج خان) | Salman Khan / سلمان خان; Aamir Khan / عامر خان | "Khan" alone: ask which Khan. Reject Salman Khan and Aamir Khan (the other two Bollywood "Khans"). |
| 1121-02 | Cartoons 600 | In the 2011 animated film "Rio", Blu is a pet bird from Minnesota who never learned to fly and is thought to be the last male of his rare blue species. What kind of bird is he? | A macaw (accept Spix's macaw, blue macaw) | في فيلم الرسوم المتحركة "ريو" (Rio) عام 2011، "بلو" طائر أليف من ولاية مينيسوتا لم يتعلّم الطيران قط، ويُعتقد أنه آخر ذكر من نوعه الأزرق النادر. ما نوع هذا الطائر؟ | طائر المكاو (يُقبل: مكاو سبيكس، المكاو الأزرق) | A toucan / طائر الطوقان; A cockatoo / طائر الكوكاتو | "Parrot" / "ببغاء" alone is true but too general (macaws are parrots): ask which kind, accept if they then say macaw. Reject toucan (Rafael, Blu's friend) and cockatoo (Nigel, the villain). |
| 1121-03 | AI 100 | Scammers can use AI to clone a person's what, from a short clip posted online, and then phone that person's family pretending to be them and asking for money? | Their voice (accept voice, voice cloning) | يستطيع المحتالون استخدام الذكاء الاصطناعي لاستنساخ ماذا لدى الشخص، من مقطع قصير منشور على الإنترنت، ثم يتصلون هاتفيًا بعائلته منتحلين شخصيته ويطلبون المال؟ | صوته (يُقبل: الصوت، استنساخ الصوت) | Their phone number / رقم هاتفه; Their face / وجهه | Reject "face" (that is a deepfake video, not a phone call) and "phone number" (number spoofing is not AI cloning). |
| 1121-04 | Food & Drink 500 | Which chewy Japanese sweet is made from steamed sticky rice pounded into a soft dough, and is often wrapped around a small ball of ice cream? | Mochi (accept mochi ice cream, daifuku) | ما الحلوى اليابانية المطاطية المصنوعة من الأرز اللزج المطهو على البخار والمدقوق حتى يصبح عجينة طرية، وغالبًا ما تُلفّ حول كرة صغيرة من الآيس كريم؟ | موتشي (يُقبل: موتشي آيس كريم، دايفوكو) | Taiyaki / تاياكي; Dorayaki / دوراياكي | Daifuku is a filled mochi, so it is accepted. Reject "rice cake" on its own and sushi. |
| 1121-05 | Landmarks 500 (picture) | Which landmark is this? (picture: `img/questions/landmark-tokyo-skytree.jpg`) | Tokyo Skytree (accept the Skytree, Tokyo Sky Tree) | ما هذا المعلم؟ | برج طوكيو سكاي تري (يُقبل: سكاي تري، Tokyo Skytree) | Tokyo Tower / برج طوكيو; CN Tower / برج سي إن | Reject "Tokyo Tower" (the older red-and-white tower of 1958). "A tower in Tokyo" / "Tokyo" alone: ask for the name. |
| 1121-06 | Movies 600 | In the series "Money Heist" ("La Casa de Papel"), what nickname does the gang use for the quiet mastermind who recruits them and plans every detail of the robbery? | The Professor (accept Professor, El Profesor, Sergio Marquina) | في مسلسل "لا كاسا دي بابيل" (Money Heist)، ما اللقب الذي تُطلقه العصابة على العقل المدبّر الهادئ الذي جمع أفرادها ويخطط لكل تفاصيل السرقة؟ | البروفيسور (يُقبل: الأستاذ، El Profesor، سيرخيو ماركينا) | The Doctor / الدكتور; The Captain / الكابتن | Reject Berlin (leader of the gang inside the Mint, the Professor's brother) and Tokyo (the narrator): they are robbers, not the mastermind. Accept "Alvaro Morte" only as "the one played by"; the nickname is asked. |
| 1121-07 | AI 200 | YouTube uses AI to listen to a video and write the spoken words on the screen automatically. What are these on-screen words called? | Subtitles (accept captions, closed captions, auto-captions) | يستخدم يوتيوب الذكاء الاصطناعي للاستماع إلى الفيديو وكتابة الكلام المنطوق على الشاشة تلقائيًا. ماذا تُسمّى هذه الكلمات التي تظهر على الشاشة؟ | الترجمة المصاحبة (يُقبل: الترجمة، Subtitles، Captions) | Thumbnails / الصور المصغّرة; Hashtags / الهاشتاغات | Accept "speech-to-text" only if the player names the captions too; the on-screen words are asked. Reject "translation" in the sense of another language (in Arabic "ترجمة" is the everyday word for subtitles, accept it). |
| 1121-08 | Cartoons 200 | Which cartoon, first shown in 2013, follows a team of rescue puppies, each with its own vehicle, led by a boy called Ryder? | PAW Patrol (accept Paw Patrol) | ما الكرتون الذي بدأ عرضه عام 2013، ويتابع فريقًا من الجراء المنقذة، لكل منها مركبتها الخاصة، بقيادة صبي اسمه رايدر؟ | باو باترول (PAW Patrol) | Bluey / بلوي; Puppy Dog Pals / بابي دوغ بالز | Accept "PAW Patrol: The Movie" (2021). Reject Bluey (a family of dogs, no rescue team). |
| 1121-09 | Who Am I? 200 | I am an American singer who first became famous in the girl group Destiny's Child. My solo hits include "Crazy in Love" (2003) and "Single Ladies (Put a Ring on It)" (2008). Who am I? | Beyonce (accept Beyonce Knowles) | أنا مغنية أمريكية اشتهرت أولًا مع فرقة الفتيات "ديستنيز تشايلد" (Destiny's Child). من أغنياتي المنفردة الناجحة "Crazy in Love" عام 2003 و"Single Ladies" عام 2008. من أنا؟ | بيونسيه (يُقبل: بيونسيه نولز) | Rihanna / ريانا; Alicia Keys / أليشيا كيز | Reject Kelly Rowland and Michelle Williams (the other Destiny's Child members). |
| 1121-10 | Food & Drink 600 | What is the name of the crustless cheesecake with a dark, burnt-looking top, first made at the La Vina bar in San Sebastian, that became a dessert craze around the world? | Basque cheesecake (accept burnt Basque cheesecake, San Sebastian cheesecake) | ما اسم التشيز كيك الخالي من قاعدة البسكويت وذي السطح الداكن الذي يبدو محروقًا، الذي صُنع أول مرة في مطعم "لا بينيا" (La Vina) في مدينة سان سيباستيان، ثم أصبح موضة حلويات حول العالم؟ | تشيز كيك الباسك (يُقبل: تشيز كيك الباسك المحروق، تشيز كيك سان سيباستيان) | New York cheesecake / تشيز كيك نيويورك; Japanese cheesecake / التشيز كيك الياباني | Accept "La Vina cheesecake" and "tarta de queso". "Burnt cheesecake" without "Basque": accept, it is the same cake under its common short name. Reject New York and Japanese cheesecake. |

## Difficulty and era

| ID | Era of the subject | Why it is easy enough |
|---|---|---|
| 1121-01 | Career from 1992; "My Name Is Khan" 2010, "Pathaan" and "Jawan" 2023 | Bollywood's biggest star and hugely popular in Egypt; "King of Bollywood" nearly gives it away. On a par with Jackie Chan and Amr Diab at 100. An Indian film star is new to the 100 cell. |
| 1121-02 | 2011 film, sequel "Rio 2" 2014 | Big Blue Sky hit shown on Arab children's channels. Easier than the blue tang (Dory) or platypus (Perry) at 600, because "macaw" is the obvious big blue parrot; still the hardest Cartoons level because players must name the exact kind of bird. |
| 1121-03 | AI voice-cloning scams, widely reported since 2023 (FTC alert, March 2023) | Common sense from the question: a phone call can only copy a voice. On a par with "the background" and "a chatbot" at 100. |
| 1121-04 | Mochi is centuries old; mochi ice cream became a supermarket and cafe craze in the 2010s and 2020s | Mochi ice cream is sold in Cairo cafes and supermarkets and all over social media. Easier than mastic or freekeh at 500, on a par with wasabi and Lotus. |
| 1121-05 | Opened 22 May 2012 | The world's tallest freestanding tower (Britannica), often in travel photos and anime. A notch harder than the 400s because it is a newer tower, but easier than Kingdom Centre or Montaza Palace at 500; the "3 choices" helper makes it gettable. New sub-topic for the cell (no Japanese landmark in the bank). |
| 1121-06 | Series 2017 to 2021 | "Money Heist" was a huge hit in Egypt and the Arab world, and the Professor is its best-known character. On a par with Hodor and the Black Pearl at 600; a Spanish series is new to the cell. |
| 1121-07 | YouTube automatic captions from November 2009, now on almost every video | Everyday feature everyone has seen. On a par with "a prompt" and "a watermark" at 200. |
| 1121-08 | Series from August 2013, films 2021 and 2023 | Any parent or young sibling knows it; "rescue puppies" and "Ryder" nearly give it away. On a par with "Baby Shark" and "Masha and the Bear" at 200. |
| 1121-09 | Destiny's Child late 1990s to 2005, solo hits from 2003 | One of the most famous singers of the 2000s, on a par with Adele and Justin Bieber at 200. A notch harder than 100 because she is not named by her nickname. |
| 1121-10 | Created at La Vina around 1990 (sources say 1988 or 1990, no year used); worldwide craze in the late 2010s and 2020s | "San Sebastian cheesecake" is on many Cairo and Gulf cafe menus. On a par with Dalgona coffee and the Cronut at 600; the answer needs the word "Basque", so it stays at the top value. |

## Fact-check log (2+ sources each, web search 2026-11-21)

- **1121-01 Shah Rukh Khan:** Britannica ("Shah Rukh Khan": King of Bollywood, "Pathaan" and "Jawan" among the top-grossing Indian films), The Conversation ("From Deewana to the success of Pathaan: the global impact of Bollywood's enduring king Shah Rukh Khan"), Khaleej Times ("How Shah Rukh Khan transformed from the King of Romance to the Badshah of Action"), Deccan Herald ("With Jawan and Pathaan, Shah Rukh Khan thrills Bollywood fans"). "My Name Is Khan" (2010, Karan Johar, with Kajol): Berlinale 2010 programme page and Wikipedia. Box-office figures and rankings differ between sources, so the question says only "huge hits".
- **1121-02 Rio, Blu a Spix's macaw:** Wikipedia ("Rio (2011 film)", plot read in full: Blu, a Spix's macaw found as a chick in Moose Lake, Minnesota, "highly domesticated, but has not learned to fly", "the last known male of his species"; Blue Sky Studios / 20th Century Fox, April 2011), CBS Philadelphia review (Bill Wine: "a rare macaw, seemingly the last male of his kind, domesticated, flight-challenged", living in Moose Lake, Minnesota), NPR review ("Rio: a chaotic carnival", 2011: Blu lands in small-town Minnesota), E! Online review ("a rare breed of macaw who never learned to fly"). Reviews say "blue macaw", Wikipedia "Spix's macaw"; the answer is "a macaw" and both forms are accepted. Rafael is a toco toucan and Nigel a sulphur-crested cockatoo (same sources). The real Spix's macaw is the species the film is based on (BirdLife and news coverage of its rediscovery are not needed for the question).
- **1121-03 Voice cloning scams:** NPR ("That panicky call from a relative? It could be a thief using a voice clone, FTC warns", 22 March 2023), the FTC consumer alert quoted there ("All he needs is a short audio clip of your family member's voice ... and a voice-cloning program"), FOX TV stations ("Panicked call from a relative could be scammers cloning their voice, FTC warns"), PC Gamer ("AI is being used to supercharge phone scams with the cloned voices of your relatives").
- **1121-04 Mochi:** Britannica ("mochi": Japanese rice cake made of glutinous rice pounded into paste), Food Network ("What Is Mochi?"), Wikipedia ("Mochi": steamed glutinous rice pounded with a mallet, mochitsuki; daifuku is mochi with a filling), Food Republic ("The unexpected US origin of mochi ice cream"). Origin dates of mochi differ between sources, so none is used.
- **1121-05 Tokyo Skytree:** Britannica ("Tokyo Sky Tree": 634 m, opened 22 May 2012, the world's tallest freestanding tower), Japan Times editorial ("Christening of Tokyo Skytree", May 2012), Christian Science Monitor ("World's tallest tower is now in Tokyo", 22 May 2012). Tokyo Tower (1958, red and white, 333 m) and the CN Tower (Toronto, 1976) are real towers of the same kind, never names for the Skytree. Both wrong options are written without "The", like the answer.
- **1121-06 The Professor:** Wikipedia ("Professor (Money Heist)": Sergio Marquina, played by Alvaro Morte, the mastermind who recruits the gang and plans the Royal Mint and Bank of Spain heists), Netflix Tudum ("Alvaro Morte: Money Heist Professor challenges villain stereotypes"), Looper ("Why the Professor from Money Heist looks so familiar"). Wrong options "The Doctor" and "The Captain" are nickname-style titles of the same form; no main character of the series uses them.
- **1121-07 YouTube automatic captions:** Google Research blog ("Automatic Captioning in YouTube", 2009: machine-generated captions using automatic speech recognition), YouTube official blog ("Happy Birthday Automatic Captions!", November 2010: speech recognition and machine learning), Phys.org ("Google adds automatic captions to YouTube", November 2009), eWeek ("Google automates captions in YouTube for accessibility").
- **1121-08 PAW Patrol:** Paramount Press Express (Nickelodeon "PAW Patrol" about page: Ryder and his team of rescue pups), Wikipedia ("PAW Patrol": premiered on Nickelodeon on 12 August 2013, created by Keith Chapman, produced by Spin Master), Spin Master and retailer listings of the pups' rescue vehicles (Ryder's rescue ATV). Puppy Dog Pals (Disney Junior, 2017) and Bluey (ABC Kids, 2018) are real dog cartoons, neither about a rescue team.
- **1121-09 Beyonce:** Britannica ("Beyonce": Destiny's Child, solo debut "Dangerously in Love" 2003 with "Crazy in Love"), Britannica ("Single Ladies (Put a Ring on It)"), Grammy.com (Song of the Year 2010: "Single Ladies (Put a Ring on It)"), Wikipedia ("I Am... Sasha Fierce", 2008). One search summary placed "Single Ladies" on a Destiny's Child album; Grammy.com, Britannica's song entry and the album article all say the 2008 solo album, so 2008 is used.
- **1121-10 Basque cheesecake:** National Geographic ("What is Basque burnt cheesecake and where to eat it in San Sebastian"), Resy ("How Basque burnt cheesecake took over the world", 2021), America's Test Kitchen ("The story behind the famed Basque Country cheesecake"), SBS Food (2020, "the dessert the world is craving"), Wikipedia ("Basque cheesecake": created by Santiago Rivera at La Vina). The creation year differs (1988 or 1990), so no year is used.

## Image sources and licences

| File | Answer | Source page | Author | Licence | Notes |
|---|---|---|---|---|---|
| `img/questions/landmark-tokyo-skytree.jpg` | Tokyo Skytree (1121-05) | https://commons.wikimedia.org/wiki/File:Tokyo_Skytree_2023.jpg | Akonnchiroll (own work) | CC0 | Photo taken 4 November 2023 from across the Sumida River. Downloaded the current revision's 1280 px Commons thumbnail (1280 x 2276, original 1799 x 3199) into a new empty temp directory, confirmed a real JPEG, re-encoded with PHP GD at JPG quality 82 (progressive), 720 x 1280, 137 KB. Viewed after re-encoding: the whole tower from base to antenna, blue sky, an expressway, trees and a river boat in front. No recognisable people. |

Credit stored in `image_credit`: "Akonnchiroll / CC0" (same format as the existing CC0 rows). The file name is new. Nothing existing was replaced. Japan's copyright law allows photos of buildings (freedom of panorama for architecture), and the photo is CC0 on Commons.

**Look-alike check:** No existing Landmarks answer looks like it. Tokyo Tower (wrong option here and on the Eiffel Tower questions) is red and white with a different shape; the Cairo Tower (Landmarks 200) is a lattice-covered concrete tower but much shorter and without the Skytree's two disc decks. Other candidates not used: "20181123 Tokyo Skytree-1/2" (Balon Greyjoy, CC0; a large apartment block takes up half the frame) and the "Tokyo Skytree Panorama" (CC0, tower too small in the frame). The other Skytree photos on Commons are CC BY or CC BY-SA, so the CC0 one was preferred.

## Duplicates

Checked against all 1013 local questions, answers and wrong options (dump of 2026-11-21, all categories), `rejected-answers.md` and the earlier review docs: no answer repeats and nothing from `rejected-answers.md` is used.

Candidates dropped during drafting because they repeat an answer, would be given away by another question, or are in `rejected-answers.md`:

- **Mark Zuckerberg** (Who Am I?): AI 400 answer. **Shakira**: Gen Z 100 answer. **Will Smith**: named in the AI 200 "I, Robot" question. **Usain Bolt, Cristiano Ronaldo, Lionel Messi, Roger Federer**: Sports answers. **Adel Imam, Mohamed Ramadan, Tamer Hosny**: Egyptians/Movies answers. **Rihanna, Lady Gaga, Nancy Ajram, Malala, MrBeast, Bill Gates**: existing answers. **Rowan Atkinson**: would bring back the rejected Movies "Mr. Bean".
- **Self-driving car, Face ID, Roomba, Siri, Alexa, spam folder, predictive text / autocorrect, the algorithm, data** (AI): already answers (Technology, AI, Gen Z), or given away by "Data centres". **Humanoid robot, robot**: the word is in many questions. Film robots are ruled out by the owner's ai-2 feedback.
- **Bubble tea** (Food): the Food 300 Taiwan question names it. **Tiramisu**: Food 300. **Nutella**: Food 400. **Acai bowl**: dropped, blueberry or other berries could also be "correct".
- **Heath Ledger** (Movies): Movies 300. **The Upside Down**: the Gen Z 200 "Stranger Things" question names it. **Hedwig**: dropped for variety, Harry Potter is already at Movies 200 and 500 and Who Am I? 100.
- **Ben 10 / Dora the Explorer** (Cartoons): would reword the rejected Omnitrix and Boots questions. **Master Shifu (red panda)**: Kung Fu Panda is already in the 600 cell (Mr. Ping), and Shifu is a wrong option there. **Ratatouille / Remy**: Cartoons 400.
- **Wembley Stadium** (Landmarks): the 500 cell already has 2 stadiums (Al Bayt, the Bird's Nest). **Jewel Changi**: Singapore was the last picture (Gardens by the Bay, 600) and Jewel is its wrong option.

Other notes for the owner:

- 1121-06: "Spanish" is left out of the question because "Spain" is the Geography 200 "Money Heist" answer, and the city code names are kept out of both the question and the wrong options because "Cities" is the Gen Z 500 "Money Heist" answer.
- 1121-03 (AI voice cloning) is close to the rejected AI 200 "Deepfake" question (fake but realistic AI video, photo or voice). The answer is different (the voice, not the word deepfake), so it is kept, but the owner may see it as the same topic.
- 1121-10: "Spain" is left out for the same reason; San Sebastian is named instead.
- 1121-01 and 1121-09 use Rihanna (Who Am I? 400 answer) and no other existing answer as a near-miss option, as with Gordon Ramsay in batch 1118.
- 1121-04 and the Food 500 Lotus question both mention desserts; no link. 1121-10 and the Lotus question both mention cheesecake, but neither gives the other away.
- **Prompt injection seen:** one web search result (a Wikiwand mirror page about "Single Ladies") contained embedded text addressed to an AI, asking for the summary to be written for a 10-year-old. It was ignored and nothing was taken from that page.

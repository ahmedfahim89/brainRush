# Review: Gen Z question set 2

- **Request:** owner request of 2026-10-20: 16 new questions for the existing "Gen Z" category, 4 each at 300, 400, 500 and 600. Familiarity comes first, after the owner rejected two rounds of the AI 2 set as too unfamiliar.
- **Date:** 2026-10-20
- **SQL file:** `sql/add-genz-2-questions.sql` (loaded into the local DB, see the end of this doc)
- **Point values (local DB):** 100, 200, 300, 400, 500, 600

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
> **Owner review (2026-10-20). Do not reuse these answers.** The owner removed 5 of the 16 without replacement: One Direction, Rickroll (Never Gonna Give You Up), NPC (non-player character), Eminem ("stan") and Shiba Inu (Doge). The set is now 11.

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Gen Z (this set) | 0 | 0 | 3 | 3 | 4 | 1 | 11 |
| Gen Z before | 12 | 11 | 8 | 9 | 8 | 7 | 55 |
| Gen Z after | 12 | 11 | 11 | 12 | 12 | 8 | 66 |

**How the set was built**
- **Familiarity:** every answer is a famous, global piece of Gen Z culture: a word everyone hears, a mega-hit song, a top app or game, or a worldwide craze. The set avoids the types the owner rejected in AI 2: niche film trivia, product feature names, viral-incident trivia, model or version details and country-policy news. Higher values ask a less obvious fact about something famous (what an abbreviation stands for, who founded an app, where a word comes from). They do not use obscure subjects.
- **Topic spread:** drafted as one question of each kind per point value. After the owner's removals:

  | Points | Slang | Music | App or game | Trend or show |
  |---|---|---|---|---|
  | 300 | GOAT | - | Angry Birds | Labubu |
  | 400 | mid | - | Anghami | Kunafa (viral chocolate bar) |
  | 500 | OOTD | Despacito | Telegram | Money Heist |
  | 600 | - | - | PUBG | - |

- **Regional fit:** Anghami, the kunafa chocolate bar, Telegram, PUBG, Money Heist (known in Arabic as "البروفيسور") and Labubu all had huge followings in Egypt and the Gulf. No question is US-only.
- **Duplicate check:** checked against all 577 questions in the local DB at the start (all categories). No answer repeats an existing answer, and answers are unique within the set.
- **Giveaways avoided:** to keep the question text from naming an existing answer, these words were left out: "TikTok", "Instagram", "Spotify", "Twitter", "hashtag", "Squid Game", "Stranger Things", "Dubai", "UAE", "Japanese", "Chinese", "Russian", "Spanish", "Messi" and "Ronaldo". "Lebanon" is used, but not "Beirut".
- **Owner-rejected items not reused:** the 8 AI and Gen Z questions the owner deleted earlier (deepfake, Waymo, Midjourney, Spot, NotebookLM, Lensa, Olivia Rodrigo, Lil Nas X), the AI 2 rejects, and Blackpink. Blackpink was in the 2026-10-19 Gen Z suggestions but is not in the DB.
- **Text format:** English text is plain ASCII with no pipes, backslashes or semicolons. The longest question is 125 characters.

**Points for the owner to decide**
1. **Unknown earlier rejects:** the owner removed 14 Gen Z suggestions on 2026-10-19. Their texts are no longer in the repo docs, and git history was not read, so this set could not be checked against them.
2. **Kunafa (400):** the question does not name "Dubai chocolate", because Dubai and the UAE are existing Geography answers. The chocolate is still easy to recognise from "viral chocolate bar ... pistachio cream".
3. **Anghami (400):** Arab players may find this easier than a typical 400.
4. **Money Heist (500):** Geography 200 also asks about Money Heist (answer: Spain). This question does not give that answer away. The Salvador Dali masks were a possible alternative, but the answer "Dali" would hint at AI 300 "DALL-E", so the code-name question was used instead.
5. **GOAT (300):** Sports 100 calls Muhammad Ali "The Greatest". That is a slight overlap in wording, not a giveaway.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 300 | In slang, what does "GOAT" stand for, as in "he is the GOAT"? | Greatest of all time | في العامية، إلى ماذا يرمز الاختصار "GOAT"، كما في قولهم "هو الـGOAT"؟ | الأعظم على مر العصور (Greatest of all time) | Reject "greatest of our time" and "greatest one at the top". |
| 300 | In the phone game "Angry Birds", which animals steal the birds' eggs? | Pigs (accept green pigs, the Bad Piggies) | في لعبة الهاتف "Angry Birds" (الطيور الغاضبة)، أي حيوانات تسرق بيض الطيور؟ | الخنازير (يُقبل: الخنازير الخضراء) | Accept "King Pig". Reject monkeys or marmosets (enemies only in the "Angry Birds Rio" spin-off). |
| 300 | Which toothy little monster doll, sold in surprise "blind boxes" by Pop Mart, became a worldwide craze in 2025? | Labubu | أي دمية على شكل وحش صغير بأسنان بارزة، تُباع في علب مغلقة لا تعرف ما بداخلها من شركة Pop Mart، أصبحت هوسًا عالميًا عام 2025؟ | لابوبو (Labubu) | Reject "Pop Mart" (the company), "The Monsters" (the series) and "Lafufu" (the name for fakes). |
| 400 | In Gen Z slang, if someone says a film is "mid", what do they mean? | It is average or mediocre (accept so-so, meh, nothing special, not very good) | في عامية الجيل Z، إذا قال أحدهم إن فيلمًا ما "mid"، فماذا يقصد؟ | أنه عادي أو متوسط المستوى (يُقبل: مش قد كده، لا شيء مميز، ليس جيدًا جدًا) | Accept "overrated". Reject "the middle of the film" and "great". |
| 400 | Which music streaming app, launched in Lebanon in 2012, was the first legal music streaming service in the Arab world? | Anghami | أي تطبيق لبث الموسيقى، انطلق في لبنان عام 2012، كان أول خدمة قانونية لبث الموسيقى في العالم العربي؟ | أنغامي (Anghami) | Reject Spotify, Deezer and Shahid. |
| 400 | The viral chocolate bar that took over social media in 2024 is filled with pistachio cream and which crunchy shredded pastry? | Kunafa (accept knafeh, konafa, kataifi) | لوح الشوكولاتة الذي اجتاح وسائل التواصل الاجتماعي عام 2024 محشو بكريمة الفستق وبأي عجينة مقرمشة على شكل خيوط رفيعة؟ | الكنافة (يُقبل: عجينة الكنافة) | Accept "shredded filo". Reject baklava, basbousa and "filo" alone. Reject "qatayef" (a different pastry). |
| 500 | On social media, what does "OOTD" stand for? | Outfit of the day | على وسائل التواصل الاجتماعي، ماذا يعني الاختصار "OOTD"؟ | إطلالة اليوم (Outfit of the day) | Accept "look of the day". Reject "out of the day". |
| 500 | What does "Despacito", the title of the 2017 hit by Luis Fonsi and Daddy Yankee, mean in English? | Slowly (accept slow, nice and slow) | ماذا تعني كلمة "Despacito"، عنوان أغنية لويس فونسي ودادي يانكي الناجحة عام 2017؟ | ببطء (يُقبل: على مهل، بالراحة) | Accept "gently, slowly". Reject "softly", "quietly" and "darling". |
| 500 | Which messaging app was founded in 2013 by the brothers Pavel and Nikolai Durov? | Telegram | أي تطبيق مراسلة أسسه الأخوان بافل ونيكولاي دوروف عام 2013؟ | تيليجرام (Telegram) | Reject WhatsApp, Signal and VK (the brothers' earlier social network, not a messaging app). |
| 500 | In the series "Money Heist" ("La Casa de Papel"), the robbers' code names are all names of what? | Cities (accept city names) | في مسلسل "البروفيسور" ("La Casa de Papel")، الأسماء الحركية لأفراد العصابة كلها أسماء ماذا؟ | مدن (يُقبل: أسماء مدن) | Code names include Tokyo, Berlin, Nairobi, Rio and Denver. Reject "countries" and "capitals" (Rio and Denver are not capitals). |
| 600 | What does the name of the battle royale game "PUBG" stand for? | PlayerUnknown's Battlegrounds (accept Player Unknown Battlegrounds) | إلى ماذا يرمز اسم لعبة الباتل رويال "PUBG" (ببجي)؟ | PlayerUnknown's Battlegrounds (ساحات معارك اللاعب المجهول) | Accept it with or without the "'s". Reject "Player Unknown Battle Game" and "Public Battlegrounds". |
---

## Fact-check log

Each question was checked against at least 2 independent sources.

| Points | Answer | Sources |
|---|---|---|
| 300 | Greatest of all time | [Merriam-Webster: GOAT](https://www.merriam-webster.com/dictionary/goat), [CBS News (2018): GOAT added to Merriam-Webster](https://www.cbsnews.com/news/merriam-webster-dictionary-goat-tom-brady-greatest-of-all-time-new-words/) |
| 300 | Pigs | [Rovio: Angry Birds](https://www.angrybirds.com/games/rovio-classics-angry-birds/) ("The greedy pigs have stolen their eggs"), [CNN (2012): What's so addictive about Angry Birds](https://www.cnn.com/2012/06/03/tech/gaming-gadgets/angry-birds-question-answer), [CNBC (2016)](https://www.cnbc.com/2016/05/18/creator-talks-about-the-angry-birds-movie-and-the-future-of-the-popular-game.html) |
| 300 | Labubu | [NBC News (Apr 2025)](https://www.nbcnews.com/pop-culture/pop-culture-news/labubu-craze-viral-lines-pop-mart-stores-rcna203213) ("small, toothy", Pop Mart blind boxes), [CNBC (Aug 2025): blind box craze](https://www.cnbc.com/2025/08/25/china-blind-box-craze-pop-mart-labubu-success.html), [Axios (Jul 2025): hot toy of 2025](https://www.axios.com/2025/07/09/labubu-doll-toy-trend-pop-mart-inventory) |
| 400 | Mid (average, mediocre) | [Merriam-Webster slang: mid](https://www.merriam-webster.com/slang/mid), [Cambridge Dictionary: mid](https://dictionary.cambridge.org/dictionary/english/mid), [Dictionary.com: mid](https://www.dictionary.com/culture/slang/mid) |
| 400 | Anghami | [Anghami: About](https://www.anghami.com/about) (launched November 2012 in Beirut, first legal music streaming platform in MENA), [Wamda (5 Nov 2012): launch article](https://www.wamda.com/2012/11/lebanons-anghami-launches-the-first-music-streaming-platform-for-the-middle-east-promocode-included), [CNN (2022)](https://www.cnn.com/2022/12/13/tech/anghami-music-streaming-middle-east-spc/index.html), [The Media Line](https://themedialine.org/mideast-daily-news/the-story-behind-the-arab-worlds-first-music-streaming-giant/) |
| 400 | Kunafa | [TODAY.com: the viral Dubai chocolate bar](https://www.today.com/food/trends/viral-dubai-chocolate-bar-rcna169625) (kataifi and pistachio, global sensation in 2024 after going viral on TikTok), [The National (Nov 2024)](https://www.thenationalnews.com/lifestyle/food/2024/11/27/dubai-viral-chocolate-deliveroo-abu-dhabi/) (pistachio kunafa bar, original "Can't Get Knafeh of It") |
| 500 | Outfit of the day | [Cambridge Dictionary: OOTD](https://dictionary.cambridge.org/dictionary/english/ootd), [Dictionary.com: OOTD](https://www.dictionary.com/culture/acronyms/ootd) |
| 500 | Slowly | [Dictionary.com: Despacito](https://www.dictionary.com/culture/pop-culture/despacito), [Billboard (Jan 2017): Luis Fonsi on "Despacito" featuring Daddy Yankee](https://www.billboard.com/music/latin/luis-fonsi-despacito-daddy-yankee-interview-7661716/), [Wikipedia: Despacito](https://en.wikipedia.org/wiki/Despacito) |
| 500 | Telegram | [Britannica: Telegram](https://www.britannica.com/technology/Telegram-software) (founded in 2013 by Pavel and Nikolai Durov), [Wikipedia: Telegram](https://en.wikipedia.org/wiki/Telegram_(software)) |
| 500 | Cities | [Netflix Tudum: Why Money Heist characters are named after cities](https://www.netflix.com/tudum/articles/money-heist-cast-names-cities-meaning), [Wikipedia: Money Heist](https://en.wikipedia.org/wiki/Money_Heist) |
| 600 | PlayerUnknown's Battlegrounds | [CNBC (2019)](https://www.cnbc.com/make-it/2019/04/26/pubg-creator-went-from-welfare-to-making-a-billion-dollar-video-game.html), [ESPN: How PUBG revolutionized gaming](https://www.espn.com/gaming/story/_/id/29364632/how-made-how-brendan-greene-pubg-revolutionized-gaming), [Wikipedia: PUBG: Battlegrounds](https://en.wikipedia.org/wiki/PUBG:_Battlegrounds) |
### Dropped or reworded during fact-checking

- **Squid Game, green tracksuits (300):** dropped. The answer "green" would hint at the existing Gen Z 100 answer "Red Light, Green Light". Replaced by Labubu.
- **Money Heist, Dali masks (500):** replaced by the code-name question. The answer "Dali" would hint at AI 300 "DALL-E".
- **Ed Sheeran, albums named after maths symbols (600):** dropped. His 2025 album "Play" breaks the pattern. Replaced by the Eminem "stan" question.
- **Labubu:** "Chinese company" was removed because China is a Geography answer. Sources say the craze began in late 2024 and peaked in 2025, so the question says "a worldwide craze in 2025".
- **Telegram:** "Russian brothers" became "the brothers" because Russia is a Geography answer.
- **Despacito:** the question does not say "Spanish" (Spain is a Geography answer).
- **Shiba Inu:** "Japanese dog breed" became "which breed", because Japan and Japanese are existing answers.
- **Kunafa:** the bar is not called "Dubai chocolate" (Dubai and the UAE are Geography answers). The source bar's filling is kataifi, the shredded pastry used for kunafa, so both are accepted.
- **Ideas not used:** CapCut and the TikTok owner ByteDance (the question would need to say TikTok), Pikachu (would hint at "Pokemon Go"), Eleven from Stranger Things (would hint at "Stranger Things"), BTS (Geography gives it away), and the FIFA video games' new name (FIFA is a Sports answer).

### Process notes

- **Local DB:**
  - At the start of this work there were 577 questions. Just before loading there were 580, because another set added 3 Geography 600 rows (Nepal, The Challenger Deep, The Rub al Khali) in the meantime. These were not touched and do not clash with this set.
  - Gen Z before: 12 / 11 / 8 / 9 / 8 / 7 = 55.
  - Run 1 added 16 rows: 596 questions in total, Gen Z 12 / 11 / 12 / 13 / 12 / 11 = 71.
  - Run 2 added nothing (idempotent). The Arabic text was stored correctly.
  - Owner removals: the 5 rejected rows were deleted by exact question text in Gen Z. The DB had 595 questions just before (another set had changed 1 row in the meantime, not touched), and 590 after. Gen Z is now 12 / 11 / 11 / 12 / 12 / 8 = 66. A rerun of the updated file added nothing.
- **No changes outside the set:** no UPDATE, DELETE or schema change, and no git command was run.
- **Prompt injection:** no retrieved page contained instructions aimed at the assistant. Several sites claiming to be the "official" Fix chocolate store could not be verified and were not used as sources.
- **Existing bank issue (not changed):** Gen Z 600 "Ninja" names Drake, which is the answer to Gen Z 300 "Heart on My Sleeve".

# Automatic batch 2026-11-25-2: review

## File names and IDs (differ from the brief)

The brief asked for `sql/add-auto-2026-11-25-questions.sql`, `docs/question-sets/auto-2026-11-25-review.md` and IDs 1125-01 to 1125-10. Those two files already exist in this worktree (and in the main checkout, byte for byte). They hold the **first** 2026-11-25 batch (Tesla Autopilot, Bluey, Thailand, Jason Statham, Buckingham Palace, Philips, Amazon, 2002, Maximus, the Higgs boson), which is already loaded in the local DB, and that review doc already uses IDs 1125-01 to 1125-10. Overwriting them would erase the record of a loaded batch and make the owner's remove-by-ID ambiguous.

This batch therefore follows the same-day precedent of `add-auto-2026-11-24-2-questions.sql`:

- SQL: `sql/add-auto-2026-11-25-2-questions.sql` (temporary table `auto_2026_11_25_2_seed`)
- Review doc: this file, `docs/question-sets/auto-2026-11-25-2-review.md`
- IDs: **1125-2-01 to 1125-2-10**

The first 11-25 files were not touched.

## Live vs local differences

Information only (from the question-bank-manager brief): none. All 14 categories match.

## Reported questions

No open local reports on 2026-11-25.

## Status: draft for the owner's review (not loaded)

`sql/add-auto-2026-11-25-2-questions.sql` has **10 rows** (IDs 1125-2-01 to 1125-2-10): 6 text questions and 4 picture questions. It is not loaded into the local DB. It was test-run twice on a throwaway copy of the `categories`, `point_values` and `questions` tables (database `qp_scratch_1125_2`, dropped afterwards): the first run added 10 rows, the second added none.

New picture files (new names, nothing replaced):

- `img/questions/flag-singapore.svg` (591 bytes)
- `img/questions/flag-ghana.svg` (277 bytes)
- `img/questions/landmark-one-world-trade-center.jpg` (156,376 bytes, 853 x 1280)
- `img/questions/person-steve-jobs.jpg` (219,677 bytes, 1280 x 1239). This is the **first Who Am I? picture question**, written to the owner's request of 2026-11-25.

Written to the owner's preference (2026-11-11): easier, mostly subjects from 2000 onwards. Wrong options are bare answers, with no brackets.

| Slot | Category | Points | In the file | Local count now | After loading |
|---|---|---|---|---|---|
| 1 | AI | 400 (moved from 300 by the owner) | 1125-2-01 | 10 | 11 |
| 2 | AI | 400 | 1125-2-02 | 10 | 12 (with 1125-2-01) |
| 3 | Cartoons & Childhood | 400 (moved from 300 by the owner) | 1125-2-03 | 10 | 11 |
| 4 | Cartoons & Childhood | 500 (moved from 400 by the owner) | 1125-2-04 | 10 | 11 |
| 5 | Flags | 300 (picture) | 1125-2-05 | 10 | 11 |
| 6 | Flags | 400 (picture) | 1125-2-06 | 10 | 11 |
| 7 | Landmarks | 400 (picture) | 1125-2-07 | 10 | 11 |
| 8 | Food & Drink | 600 | 1125-2-08 | 10 | 11 |
| 9 | Technology | 600 | 1125-2-09 | 10 | 11 |
| 10 | Who Am I? | 300 (picture) | 1125-2-10 | 10 | 11 |

Count per point value (after the owner's moves of 2026-11-26): 300 = 2, 400 = 5, 500 = 1, 600 = 2. No slot was left empty. The owner moved 1125-2-01 to AI 400, 1125-2-03 to Cartoons 400 and 1125-2-04 to Cartoons 500: the point values in the SQL and below are the new ones; the difficulty notes below were written for the old values. AI 300 and Cartoons 300 are no longer filled by this batch.

## Questions

| ID | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| 1125-2-01 | AI 400 | Which online game, starring a cartoon genie in a turban, uses AI to guess the character you are thinking of by asking you yes-or-no questions? | Akinator | ما اللعبة الإلكترونية التي يظهر فيها جني كرتوني يرتدي عمامة، وتستخدم الذكاء الاصطناعي لتخمين الشخصية التي تفكر فيها بطرح أسئلة تجيب عنها بنعم أو لا؟ | أكيناتور (Akinator) | Cleverbot / كليفربوت; Talking Tom / توكينغ توم | Accept "Akinator the web genie" and close pronunciations ("Akinatur"). Reject "Aladdin" or "the Genie" (that is the character, not the game), and "20 Questions" (the general game, not this app). |
| 1125-2-02 | AI 400 | When an AI treats some groups of people unfairly because of the data it learned from, for example favouring men over women when sorting job applications, what is this problem called? | Bias (accept AI bias, algorithmic bias, discrimination, AI discrimination) | عندما يعامل الذكاء الاصطناعي بعض فئات الناس بشكل غير عادل بسبب البيانات التي تعلّم منها، مثل تفضيل الرجال على النساء عند فرز طلبات التوظيف، ماذا تُسمى هذه المشكلة؟ | التحيز (يُقبل: تحيز الذكاء الاصطناعي، التحيز الخوارزمي، التمييز) | Hallucination / الهلوسة; Glitch / الخلل التقني | Accept "data bias", "machine learning bias", "gender bias" and "discrimination" (the clue describes discrimination, so it is also correct). "Sexism" or "unfairness": ask for the name of the AI problem. Reject "hallucination" (that is making up facts) and "a bug" or "glitch". |
| 1125-2-03 | Cartoons 400 | In the Pixar film "Inside Out" (2015), five emotions live inside the head of a girl called Riley. Joy is yellow and Anger is red. What is the name of the blue emotion? | Sadness | في فيلم بيكسار "Inside Out" (قلبًا وقالبًا) عام 2015، تعيش خمسة مشاعر داخل رأس فتاة اسمها رايلي. شعور الفرح لونه أصفر، وشعور الغضب لونه أحمر. ما اسم الشعور ذي اللون الأزرق؟ | حزن (Sadness) | Fear / خوف; Disgust / قرف | Accept "Sad" and the Arabic "حزن" or "الحزن". Reject Fear (purple), Disgust (green) and Anxiety (orange, added in "Inside Out 2", 2024). |
| 1125-2-04 | Cartoons 500 | In the 2003 Pixar film about a little clownfish who is taken from his home on the Great Barrier Reef, what is the name of his nervous, over-protective father, who crosses the ocean with Dory to find him? | Marlin | في فيلم بيكسار الصادر عام 2003 عن سمكة مهرج صغيرة تُخطف من بيتها في الحاجز المرجاني العظيم، ما اسم أبيها القلق شديد الحرص، الذي يعبر المحيط مع "دوري" ليجده؟ | مارلن (Marlin) | Gill / جيل; Crush / كراش | Reject "Nemo" (the son) and "Finding Nemo" (the film). Reject Gill (the fish-tank leader), Crush (the sea turtle) and Coral (Nemo's mother). Accept "Merlin" only if the player clearly means the fish (sounds the same in Arabic). |
| 1125-2-05 | Flags 300 (picture) | Which country does this flag belong to? (picture: `img/questions/flag-singapore.svg`) | Singapore | إلى أي دولة ينتمي هذا العلم؟ | سنغافورة | Indonesia / إندونيسيا; Turkey / تركيا | Red over white, with a white crescent and five white stars at the top left. Reject Indonesia and Monaco (plain red over white), Poland (white over red), Turkey (crescent and one star on a red field) and Malaysia. |
| 1125-2-06 | Flags 400 (picture) | Which country does this flag belong to? (picture: `img/questions/flag-ghana.svg`) | Ghana | إلى أي دولة ينتمي هذا العلم؟ | غانا | Bolivia / بوليفيا; Cameroon / الكاميرون | Red, gold and green stripes with a black star in the middle. Reject Bolivia (same colours, no star), Lithuania (yellow, green, red), Cameroon and Senegal (vertical stripes, star in the middle), Ethiopia and Guinea-Bissau. |
| 1125-2-07 | Landmarks 400 (picture) | Which landmark is this? (picture: `img/questions/landmark-one-world-trade-center.jpg`, the glass tower seen from below against clouds) | One World Trade Center (accept 1 WTC, the Freedom Tower, the World Trade Center) | ما هذا المعلم؟ | مركز التجارة العالمي الأول (يُقبل: برج الحرية، مركز التجارة العالمي) | Willis Tower / برج ويليس; Shanghai Tower / برج شنغهاي | "Freedom Tower" was its name during construction, so accept it. Accept "the World Trade Center". "The Twin Towers" (the towers destroyed in 2001) or "a New York skyscraper": ask for the name. Reject the Empire State Building, the Willis Tower and the Shard. |
| 1125-2-08 | Food & Drink 600 | Which sports drink brand, sold in brightly coloured bottles, was launched in 2022 by the YouTube stars and boxers Logan Paul and KSI? | Prime (accept Prime Hydration) | ما العلامة التجارية لمشروب الرياضيين، التي تُباع في زجاجات ملونة زاهية، وأطلقها نجما يوتيوب والملاكمان لوغان بول وKSI عام 2022؟ | برايم (Prime) | Gatorade / جاتوريد; Powerade / باوريد | Accept "Prime Energy" (the brand's energy drink line, launched later in 2022). Reject Gatorade, Powerade, Lucozade and Feastables (MrBeast's chocolate brand). |
| 1125-2-09 | Technology 600 | In 2016, which Samsung smartphone was recalled worldwide and then stopped for good, after its batteries overheated and some phones caught fire? | The Galaxy Note 7 (accept Note 7, Galaxy Note7) | في عام 2016، أي هاتف ذكي من سامسونج سُحب من الأسواق حول العالم ثم أُوقف إنتاجه نهائيًا، بعد أن سخنت بطارياته واشتعلت النار في بعض الأجهزة؟ | جالاكسي نوت 7 (يُقبل: نوت 7) | The Galaxy S7 / جالاكسي إس 7; The Galaxy Note 5 / جالاكسي نوت 5 | The number is needed: "the Galaxy Note" alone, ask "which one?". Reject the Galaxy S7 and S7 Edge (same year, no recall) and the Note 8. |
| 1125-2-10 | Who Am I? 300 (picture) | Who is this American pioneer of personal computers and smartphones? (picture: `img/questions/person-steve-jobs.jpg`, smiling, in his black polo-neck, holding up an iPhone 4 at WWDC 2010) | Steve Jobs (accept Jobs) | من هو هذا الرائد الأمريكي في صناعة الحواسيب الشخصية والهواتف الذكية؟ | ستيف جوبز (يُقبل: جوبز) | Bill Gates / بيل غيتس; Steve Wozniak / ستيف وزنياك | Reject Steve Wozniak (the other Apple co-founder), Tim Cook (Apple's later CEO) and Bill Gates. "The Apple founder" without a name: ask for the name. |

## Difficulty and era

- **1125-2-01 Akinator (AI 400, moved from 300):** era 2007, hugely popular on phones in the 2010s and still played today, including in the Arab world, where the genie is a familiar meme. Easy: the genie plus the yes-or-no guessing gives it away to anyone who has played it. A notch easier than "hallucination" or "AI agent" in the cell. New sub-topic for the cell: games.
- **1125-2-02 Bias (AI 400):** era 2018 onwards (Amazon's dropped hiring tool, 2018, and the AI fairness debate since). The example in the clue (favouring men over women) points straight at the everyday word "bias", so a well-read player gets it. Same "name the AI problem" style as "AI slop" (400) and "hallucination" (300). New sub-topic: AI fairness.
- **1125-2-03 Sadness (Cartoons 400, moved from 300):** era 2015 (sequel "Inside Out 2", 2024), a huge Pixar hit shown widely with Arabic dubbing. Easy: the clue lists the emotions and colours, and "blue" means sad in English and Arabic. A notch easier than Merida or Dash in the cell.
- **1125-2-04 Marlin (Cartoons 500, moved from 400):** era 2003 (sequel "Finding Dory", 2016), one of Pixar's best-known films. Harder than 300 because it needs a character's name, but he is the film's main character and is named all through it. At the level of Remy or Gru in the cell.
- **1125-2-05 Singapore (Flags 300, picture):** the flag dates from 1959. Flags cannot follow the "recent" preference. Singapore is widely known (Marina Bay Sands and Gardens by the Bay are already Landmarks answers), and the crescent with five stars makes the flag easy to remember. About as hard as Kuwait, Qatar or Portugal in the cell. Austria was considered but left out: an earlier batch (1124-2) found it a look-alike of Lebanon (400), and it is also close to Latvia.
- **1125-2-06 Ghana (Flags 400, picture):** the flag dates from 1957. Ghana is well known to Egyptian football fans (Africa Cup of Nations rivals), and the black star is distinctive. At the level of Kenya, Nigeria and South Africa in the cell.
- **1125-2-07 One World Trade Center (Landmarks 400, picture):** era 2014 (opened 3 November 2014). Recent and world-famous as the tower built at Ground Zero. Its tapering glass shape is distinctive. At the level of the Empire State Building and the Shard in the cell.
- **1125-2-08 Prime (Food & Drink 600):** era 2022. A viral drink brand whose launch was huge news among young people in 2022 and 2023. Easy for anyone under 35. For older players it is a fair 600, at the level of the Cronut and Dalgona coffee in the cell, and a notch easier than Tijuana or bergamot.
- **1125-2-09 Galaxy Note 7 (Technology 600):** era 2016. The exploding-phone recall was world news for weeks. Easier than ELIZA or Moore's law in the cell. It stays at 600 because the player needs the exact model.
- **1125-2-10 Steve Jobs (Who Am I? 300, picture):** a pioneer of personal computers (Apple, 1976) and of smartphones (iPhone, 2007), so mostly the post-2000 era. A clear, well-known photo, and the hint names the field. A notch easier than the 300 text clues (Lady Gaga, Robert Downey Jr.). It fits the owner's "pioneers" request: technology, a field not yet covered by the cell's pioneers (Karl Benz, Pasteur).

## Fact-check log (2+ sources each, web search 2026-11-25)

All entries come from search results (the titles and summaries of the listed pages). The Wikimedia Commons file data for the four pictures was read through the Commons API. Facts about the wrong options are general knowledge, not taken from the listed sources, and none of them is arguable: Cleverbot is a chatbot website, Talking Tom a talking-cat app, Fear is purple and Disgust green in "Inside Out", Gill and Crush are other "Finding Nemo" characters, the flag colours of Bolivia and Cameroon, the Willis and Shanghai towers, Gatorade and Powerade are older sports drinks, and the Galaxy S7 and Note 5 were not recalled.

- **1125-2-01 Akinator:** Wikipedia, "Akinator" (Elokence, Twenty Questions-style game with a genie, released August 2007, described as an AI program that learns the best questions to ask). International Business Times, "How does Akinator work? Behind the genie that reads your mind". Kotaku games listing, "Akinator". Sources disagree on the individual programmers' names, so the question does not name them.
- **1125-2-02 Bias:** Reuters (Jeffrey Dastin, 10 October 2018), "Amazon scraps secret AI recruiting tool that showed bias against women", as syndicated by Euronews, the Irish Times, RTE and RNZ. MIT Technology Review (10 October 2018) on the same story. IBM, "What is AI bias?" and "What is algorithmic bias?" (biased results caused by skewed training data). TechTarget, "What is machine learning bias (AI bias)?".
- **1125-2-03 Sadness:** Wikipedia, "Inside Out (2015 film)" (Joy, Sadness, Anger, Fear and Disgust in Riley's mind). Pixar, "Inside Out" feature page. IMDb, title tt2096673 (cast). British Psychological Society, "Emotions in mind" (blue for sadness). Director Pete Docter: Sadness was designed as a teardrop.
- **1125-2-04 Marlin:** Wikipedia, "Finding Nemo" (2003, Marlin, Nemo's overprotective clownfish father, voiced by Albert Brooks, searches with Dory). Rotten Tomatoes cast list. Looper, "Who voices Marlin in Finding Nemo?". D23 (Disney), "Finding Nemo (film)".
- **1125-2-05 Singapore:** Wikimedia Commons, "File:Flag of Singapore.svg" (adopted 1959, public domain). Britannica, "Flag of Singapore" (red over white, white crescent and five stars in the upper hoist corner). Wikipedia, "Flag of Singapore" (adopted 3 December 1959, kept at independence in 1965). The rendered picture was checked against these.
- **1125-2-06 Ghana:** Wikimedia Commons, "File:Flag of Ghana.svg" (design by Theodosia Okoh, 6 March 1957, public domain). Wikipedia, "Flag of Ghana" (red, gold and green triband with a black five-pointed star, adopted 6 March 1957). Ghana High Commission, New York, "The Ghana flag" (newyork.mfa.gov.gh). Graphic Online, "The Ghana flag". The rendered picture was checked against these. Wikipedia's list of Ghana flags shows a white-stripe version used from 1964 to 1966. The current flag has been in use since 1966, so the question does not depend on dates.
- **1125-2-07 One World Trade Center:** Britannica, "One World Trade Center". CNN / WRAL, "One World Trade Center Fast Facts" (opened 3 November 2014). NPR (10 May 2013), "Spire intact, World Trade Center stretches to 1,776 feet". SOM (the architects), project page. The Freedom Tower name: NBC News, "Critics call WTC tower name change unpatriotic", and CBS News, "Freedom Tower gets new name" (the Port Authority dropped "Freedom Tower" in March 2009).
- **1125-2-08 Prime:** Dexerto, "Logan Paul and KSI join forces to announce new Prime Hydration sports drink" (announced on Instagram Live, 4 January 2022). Sportskeeda, "Prime Hydration drink: Logan Paul partners with KSI". Yahoo News UK, "KSI and Logan Paul launch Prime Hydration drinks in the UK". The Dieline, "Logan Paul and KSI launch Prime Energy" (the energy line, later in 2022). Boardroom, "Logan Paul and KSI's Prime drink".
- **1125-2-09 Galaxy Note 7:** US Consumer Product Safety Commission, "Samsung recalls Galaxy Note7 smartphones" (15 September 2016). TechCrunch, "Samsung kills the Galaxy Note 7 for good" (11 October 2016). Fortune, "Here's a timeline of Samsung's Galaxy Note 7 troubles" and "Samsung Galaxy Note 7 discontinued". PCWorld, "Samsung discontinues Galaxy Note7 after battery debacle".
- **1125-2-10 Steve Jobs:** History.com, "Steve Jobs debuts the iPhone" (co-founded Apple with Steve Wozniak in 1976, unveiled the iPhone on 9 January 2007). Fox News, "On this day in history, January 9, 2007". MacRumors, "Seven years ago today, Steve Jobs introduced the iPhone". The photo: Commons file page (Matthew Yohe, WWDC, 7 June 2010, holding the iPhone 4, which was launched at that WWDC).

No web page contained text aimed at an AI assistant.

## Image sources and licences

Downloaded on 2026-11-25 from Wikimedia Commons into a new empty temp folder. Each file is the current revision, fetched through the Commons API (`imageinfo`) URL with a plain User-Agent and a pause of about 2 seconds between requests.

| ID | File | Commons file page | Author | Licence | Current revision | Size | Edits |
|---|---|---|---|---|---|---|---|
| 1125-2-05 | `img/questions/flag-singapore.svg` | [File:Flag of Singapore.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Singapore.svg) | Government of Singapore (design, 1959); SVG by Zscout370 | Public domain | 2026-02-24 | 591 bytes, 900 x 600 (viewBox 0 0 54 36) | None. It already had a `viewBox`. |
| 1125-2-06 | `img/questions/flag-ghana.svg` | [File:Flag of Ghana.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Ghana.svg) | Theodosia Okoh (design, 1957) | Public domain | 2024-06-15 | 277 bytes, 900 x 600 | `viewBox="0 0 900 600"` added (the file had none). Nothing else changed. |
| 1125-2-07 | `img/questions/landmark-one-world-trade-center.jpg` | [File:One World Trade Center, Financial District, Manhattan, New York.jpg](https://commons.wikimedia.org/wiki/File:One_World_Trade_Center,_Financial_District,_Manhattan,_New_York.jpg) | Christian David (photo 17 April 2026) | CC BY-SA 4.0 | 2026-05-31 | 156,376 bytes, 853 x 1280 | Commons 960 px rendition resized and re-encoded with PHP GD (XAMPP PHP, `-d extension=gd`), JPEG quality 75, pixels only (no metadata), no cropping. Found in Commons' featured pictures of New York City. |
| 1125-2-10 | `img/questions/person-steve-jobs.jpg` | [File:Steve Jobs Headshot 2010-CROP (cropped 2).jpg](https://commons.wikimedia.org/wiki/File:Steve_Jobs_Headshot_2010-CROP_(cropped_2).jpg) | Matthew Yohe (WWDC, 7 June 2010) | CC BY-SA 3.0 | 2019-10-01 | 219,677 bytes, 1280 x 1239 | The Commons file is already a crop of Yohe's photo. The Commons 1280 px rendition was re-encoded with PHP GD, JPEG quality 75, pixels only (no metadata), with no further cropping. |

`image_credit` values: the flags keep `''`, like every other flag (public domain). One World Trade Center: "Christian David / CC BY-SA 4.0, resized", in the Landmarks format. Steve Jobs: "Photo: Matthew Yohe, CC BY-SA 3.0, cropped and resized", in the format the brief asks for. Both CC BY-SA files are only resized, which the credit says, as the licence asks.

**Freedom of panorama:** One World Trade Center is in the US, where photos of buildings are free to use. It is not affected by the UAE, Egypt, Kuwait or France warning in `landmarks-review.md`.

**Photo of a real person (Who Am I?, allowed by the owner on 2026-11-25):** a clear, respectful stage photo with the face fully visible. There is no name, caption or banner in the picture. He is holding an iPhone 4 with no visible logo or text that names him. The phone hints at the field, much as the hint text does.

**SVG safety check (both flags, run on the downloaded files and again on the final files in `img/questions/`):** each starts with `<svg` and has no `<script`, `on*=` event attributes, `<foreignObject`, `<!ENTITY`, `<image>`/`<iframe>`/`<object>`, CSS `url()`, `javascript:`, `data:` or external `http(s):` href. Singapore's only `href`s are the internal `xlink:href="#s"` and `"#t"`, which repeat the star. Neither file is near the 100 KB mark.

**Visual check (headless Chrome contact sheet):** Singapore at 300 and 90 px wide: red over white, white crescent and five stars at the top left, nothing clipped. Ghana at 300 and 90 px: red, gold and green stripes, black five-pointed star in the centre, nothing clipped. The One World Trade Center photo shows the whole glass tower from the podium to the roof against a cloudy sky; the spire is cut off at its base, but the building's tapering shape is unmistakable. The Steve Jobs photo shows the face clearly at full size and at 300 px.

## Excluded look-alikes and pictures

- **Flags 300:** Austria (look-alike of Lebanon and Latvia), Malaysia (host notes on the USA and Brunei rows already list it as a near-miss), Syria (flag changed in 2025), Sudan (look-alike of Jordan), Israel (a sensitive choice for the audience). Owner-excluded look-alikes (Indonesia, Poland, Ireland, Tunisia, Palestine and others) were not considered. Singapore is not a look-alike of Indonesia or Monaco: the crescent and five stars are large and plain to see.
- **Flags 400:** Ghana's look-alikes (Bolivia, Lithuania) have no star, so they are not practically the same image. They are used as a wrong option and a host note only. Senegal (an owner-excluded look-alike) is named only in the host note.
- **Landmarks 400:** photos rejected: "One World Trade Center 2016 12 23" (Harvey Barrison, it is a view *from* the tower, not of it), "One World Trade Center in April 2015" (construction hoist and a delivery truck in the frame), "Freedom Tower Hines" (dark night shot), "One World Trade Center.jpg" (public domain, but a very narrow 1:3.3 crop). "The Freedom Tower" is not used as a wrong option, because it is another name for the answer.
- **Who Am I? 300:** no look-alike issue. The wrong options are other technology pioneers, never another name for Jobs.

## Duplicates

Every answer and the key words of every clue were checked against all 1,057 questions and answers in the local DB (read only, all categories, including today's first batch) and against `docs/question-sets/rejected-answers.md`. None of the 10 answers is in the bank or in rejected-answers. Notes for the owner:

- **1125-2-10 Steve Jobs:** the Technology 100 iPad question says "Steve Jobs unveiled" in its clue. An earlier batch (1116) dropped Jobs as a *text* Who Am I? answer for that reason, and because his clue would give away "Apple" (a Technology 200 answer). This is a **picture** question: the iPad clue gives his name but not his face, and the hint does not name Apple. The photo shows an iPhone with no logo. The Technology 200 question already names the iPhone, so the photo gives away nothing new. Your call: if you prefer no overlap at all, drop this row and the slot stays open.
- **1125-2-02 Bias:** the wrong option "Hallucination" is an AI 300 answer. A wrong option is not a clue, and the question's example (men favoured over women) does not describe a hallucination, so it is clearly wrong.
- **1125-2-04 Marlin:** the clue does not name "Finding Nemo", because that is a Movies 100 answer. Nemo is described, not named. "Finding Dory" (Cartoons 600, Dory's fish type) is not given away: that question asks what kind of fish Dory is, and this clue only names her.
- **1125-2-05 Singapore and 1125-2-06 Ghana:** Ghana is a Geography 400 answer (Accra) and Singapore is named in the Food & Drink 600 durian clue. As with the other Flags countries that are also named or answered in Geography, a text clue does not show what the flag looks like.
- **1125-2-07 One World Trade Center:** "World Trade Center" appears nowhere else in the bank. One World Trade Center is a wrong option on the Shard question (1116-39) in this same Landmarks 400 cell. That question shows the Shard, and this one shows One World Trade Center with different wrong options, so neither gives the other away.
- **1125-2-08 Prime:** "Optimus Prime" is not mentioned anywhere. The AI 500 answer "Optimus" (Tesla's robot) is unrelated.

Candidates dropped because they were already in the bank, were given away by another clue, or were rejected:

- AI 300 and 400: Alexa, predictive text, spam, TikTok's "For You" algorithm, Duolingo, the offside call and Hawk-Eye line calling, Sophia and the UAE AI minister, DeepSeek (China is a Geography answer), Stephen Hawking (Science 400), ChatGPT's launch year (Technology 100), "Her" (Movies 300), neural networks (named in the Science 100 clue), humanoid robots (named in the Optimus, Pepper and Sophia clues), Snapchat lenses and Samsung (named in other clues), Netflix (rejected in Technology), deepfake and wake word (rejected), and film robots (rejected as a type). Elon Musk as the OpenAI co-founder was drafted first, then dropped: he is named in the AI 600 xAI clue and in several other clues.
- Cartoons 300 and 400: Bruno ("Encanto", too close to Bruno Mars, Who Am I? 400), Po and Shrek (Movies answers), Sid (rejected), Fiona (Shrek is a Movies 100 answer).
- Food & Drink 600: Dubai chocolate (its kunafa filling is a Gen Z 500 answer), bubble tea (Food & Drink 300, Taiwan).
- Technology 600: QR code (Technology 300), PDF (Technology 300), Nokia, the first iPhone year (Technology 200), Instagram.
- Who Am I? 300: Bill Gates (Technology 100 answer), Mark Zuckerberg (AI 400 answer), Jack Ma (named in the Technology 300 Alibaba clue), Elon Musk (named in several clues, including SpaceX, Science 200).

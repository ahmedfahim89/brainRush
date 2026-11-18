# Automatic batch 2026-11-18: review

## Live vs local differences

Information only (from the question-bank-manager brief):

- Who Am I?: live 47, local 48 (local has one more)

All other categories have the same total live and locally.

## Reported questions

No open reports in the local DB; owner to check live Admin > Reports. (`question_reports` has 1 row, already dismissed. The live database was not read. No existing question is changed and the SQL file has no UPDATE.)

## Status: waiting for the owner's review

`sql/add-auto-2026-11-18-questions.sql` has **10 rows** (IDs 1118-01 to 1118-10): 9 text questions and 1 picture question (Landmarks 600, `img/questions/landmark-gardens-by-the-bay.jpg`). It has **not** been loaded into the local DB.

Written to the owner's preference (2026-11-11): easier, mostly subjects from 2000 onwards. Wrong options are bare answers, no brackets.

| Slot | Category | Points | In the file | Local count now | After loading |
|---|---|---|---|---|---|
| 1 | Who Am I? | 100 | 1118-01 | 8 | 9 |
| 2 | Who Am I? | 200 | 1118-02 | 8 | 9 |
| 3 | AI | 400 | 1118-03 | 8 | 9 |
| 4 | AI | 500 | 1118-04 | 8 | 9 |
| 5 | Cartoons & Childhood | 400 | 1118-05 | 8 | 9 |
| 6 | Cartoons & Childhood | 500 | 1118-06 | 8 | 9 |
| 7 | Food & Drink | 500 | 1118-07 | 8 | 9 |
| 8 | Food & Drink | 600 | 1118-08 | 8 | 9 |
| 9 | Landmarks | 600 (picture) | 1118-09 | 8 | 9 |
| 10 | Movies | 600 | 1118-10 | 8 | 9 |

Count per point value: 100 = 1, 200 = 1, 400 = 2, 500 = 3, 600 = 3. Local DB total: 989 before, 999 after loading.

## Questions

| ID | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| 1118-01 | Who Am I? 100 | I am an English footballer famous for my curling free kicks. I wore the number 7 shirt for Manchester United and England, and I am married to "Posh Spice" from the Spice Girls. Who am I? | David Beckham (accept Beckham) | أنا لاعب كرة قدم إنجليزي اشتهرت بركلاتي الحرة المقوّسة. ارتديت القميص رقم 7 مع مانشستر يونايتد ومنتخب إنجلترا، وأنا متزوج من "بوش سبايس" (Posh Spice) عضوة فرقة "سبايس غيرلز" (Spice Girls). من أنا؟ | ديفيد بيكهام (يُقبل: بيكهام) | Wayne Rooney / واين روني; Steven Gerrard / ستيفن جيرارد | Reject Cristiano Ronaldo (also a United number 7, but not married to a Spice Girl). |
| 1118-02 | Who Am I? 200 | I am a butcher and steakhouse owner. In 2017 a short video of me slicing a steak and then sprinkling salt from my fingertips down my bent arm went viral and gave me my nickname. Who am I? | Salt Bae (accept Nusret Gokce, Nusret) | أنا جزّار وصاحب مطاعم ستيك. في عام 2017 انتشر فيديو قصير لي وأنا أقطّع قطعة ستيك ثم أرشّ الملح من أطراف أصابعي على ذراعي المثنية، فمنحني لقبي الشهير. من أنا؟ | سولت باي (يُقبل: نصرت غوكتشه، نصرت) | CZN Burak / الشيف بوراك; Gordon Ramsay / غوردون رامزي | Accept "Nusr-Et" (his restaurant brand). Reject CZN Burak (the smiling Turkish chef of giant dishes). |
| 1118-03 | AI 400 | What do we call the AI technology that reads written words out loud in a computer voice, like the robotic narrator voice heard on many short social media videos? | Text-to-speech (accept TTS, speech synthesis) | ماذا نسمّي تقنية الذكاء الاصطناعي التي تقرأ الكلمات المكتوبة بصوت عالٍ بصوت حاسوبي، مثل صوت الراوي الآلي الذي نسمعه في كثير من الفيديوهات القصيرة على مواقع التواصل؟ | تحويل النص إلى كلام (يُقبل: TTS، تركيب الكلام) | Speech-to-text / تحويل الكلام إلى نص; Voice recognition / التعرّف على الصوت | Reject "speech-to-text" and "voice typing" (the opposite direction: speech into text). Accept "a computer voice / AI voice generator" only if the player says it turns text into speech. |
| 1118-04 | AI 500 | In the 2023 film "Mission: Impossible - Dead Reckoning Part One", what name is given to the rogue AI that Tom Cruise's character, Ethan Hunt, fights against? | The Entity (accept Entity) | في فيلم "المهمة المستحيلة - الحساب الأخير: الجزء الأول" (Mission: Impossible - Dead Reckoning Part One) عام 2023، ما الاسم الذي يُطلق على الذكاء الاصطناعي الخارج عن السيطرة الذي تحاربه شخصية توم كروز، إيثان هانت؟ | الكيان (The Entity) | The Machine / الآلة; The Architect / المهندس | Reject Gabriel (the human villain who works with it) and Skynet (Terminator). |
| 1118-05 | Cartoons 400 | Which Disney Channel series, first shown in 2006, starred Miley Cyrus as a schoolgirl who secretly lives a double life as a famous pop star in a blonde wig? | Hannah Montana | ما مسلسل قناة ديزني الذي عُرض لأول مرة عام 2006، وأدّت فيه مايلي سايرس دور تلميذة تعيش سرًا حياة مزدوجة كنجمة بوب شهيرة ترتدي باروكة شقراء؟ | هانا مونتانا | iCarly / آي كارلي; Lizzie McGuire / ليزي ماغواير | Accept "Hannah Montana: The Movie" (2009 film of the series). Reject "Miley Stewart" (her real name in the show, not the series title). |
| 1118-06 | Cartoons 500 | Which battling spinning-top toys from Japan, with their own anime series from 2001, were launched by pulling a ripcord while shouting "3, 2, 1, Let it rip!"? | Beyblade (accept Beyblades) | ما ألعاب البلبل (الخذروف) القتالية اليابانية، التي كان لها مسلسل أنمي خاص بها منذ عام 2001، وكانت تُطلق بسحب شريط مع الصياح: "3، 2، 1، انطلق!" (Let it rip)؟ | بي بليد (Beyblade) | Bakugan / باكوغان; Yu-Gi-Oh! / يو-غي-يو | Accept "Bakuten Shoot Beyblade" (the Japanese title). Reject "spinning tops" or "beigoma" on their own (the brand is asked). |
| 1118-07 | Food & Drink 500 | Which brand of crunchy caramelised biscuit, first baked in Belgium in 1932 and often served with coffee, is also sold as a spread and became a hugely popular flavour for cheesecakes and desserts? | Lotus (accept Lotus Biscoff, Biscoff, speculoos) | ما علامة البسكويت المكرمل المقرمش، الذي خُبز لأول مرة في بلجيكا عام 1932 ويُقدَّم غالبًا مع القهوة، ويُباع أيضًا كزبدة للدهن، وأصبح نكهة شهيرة جدًا للتشيز كيك والحلويات؟ | لوتس (يُقبل: لوتس بيسكوف، بيسكوف، سبيكولوس) | Oreo / أوريو; McVitie's / ماكفيتيز | Speculoos is the biscuit type that Lotus makes, accepted because many people use the words interchangeably. Reject Oreo (American). |
| 1118-08 | Food & Drink 600 | Which hot chilli sauce, sold in a clear squeeze bottle with a green cap and a rooster on the label, is named after a seaside town in Southeast Asia? | Sriracha (accept sriracha sauce, rooster sauce) | ما صلصة الفلفل الحار التي تُباع في زجاجة شفافة تُعصر بغطاء أخضر وعليها صورة ديك، وتحمل اسم بلدة ساحلية في جنوب شرق آسيا؟ | سريراتشا (يُقبل: صلصة سريراتشا، صلصة الديك) | Tabasco / تاباسكو; Peri-peri / بيري بيري | Accept "Huy Fong sriracha" (the rooster-bottle brand). Reject sweet chilli sauce and Tabasco. |
| 1118-09 | Landmarks 600 (picture) | Which landmark is this? (picture: `img/questions/landmark-gardens-by-the-bay.jpg`) | Gardens by the Bay (accept the Supertree Grove, the Supertrees) | ما هذا المعلم؟ | حدائق الخليج في سنغافورة (Gardens by the Bay) (يُقبل: الأشجار العملاقة، سوبرتري) | The Metropol Parasol / متروبول باراسول; Jewel Changi Airport / جويل مطار شانغي | Accept "the Supertree Grove in Singapore". "Singapore" alone: ask for the landmark. Reject Marina Bay Sands (the hotel next to it, not in the picture). |
| 1118-10 | Movies 600 | In the "Pirates of the Caribbean" films, starting in 2003, what is the name of Captain Jack Sparrow's ship with black sails? | The Black Pearl (accept Black Pearl) | في أفلام "قراصنة الكاريبي" (Pirates of the Caribbean) التي بدأت عام 2003، ما اسم سفينة القبطان جاك سبارو ذات الأشرعة السوداء؟ | اللؤلؤة السوداء (Black Pearl) | The Flying Dutchman / الهولندي الطائر; Queen Anne's Revenge / انتقام الملكة آن | Reject the Flying Dutchman (Davy Jones's ship) and Queen Anne's Revenge (Blackbeard's ship). "The Wicked Wench" (its old name in the films' backstory): accept only with "Black Pearl". |

## Difficulty and era

| ID | Era of the subject | Why it is easy enough |
|---|---|---|
| 1118-01 | Manchester United 1990s to 2003, England captain 2000 to 2006, Real Madrid 2003, LA Galaxy 2007 | One of the most famous footballers of the 2000s, and his free kicks and Posh Spice make him nearly a giveaway. On a par with Amr Diab and Jackie Chan at 100. A sports star, which the 100 cell has none of (it has singers, actors, a writer, a scientist and an activist). |
| 1118-02 | Viral meme from January 2017 | A meme almost everyone online saw, and the question describes the famous salt pose. A notch harder than 100 because players must know the nickname. The 200 cell has singers, poets and actors, so a chef/internet personality adds variety. |
| 1118-03 | Text-to-speech voices everywhere in short videos since about 2020 (TikTok added its voice in December 2020) | The question describes it plainly and the answer is close to the description. On a par with CAPTCHA and "AI slop" at 400. |
| 1118-04 | 2023 film, sequel 2025 | Big summer blockbuster with Tom Cruise. Needs the name of the villain, like the Optimus and Anthropic name questions at 500, but the word "Entity" is repeated all through the film and its trailers. The 500 cell has no film question. |
| 1118-05 | 2006 to 2011 series, 2009 film | Huge Disney Channel hit that a whole generation of Arab viewers watched on Disney Channel Middle East. Naming Miley Cyrus makes it easier than Lotso or Dee Dee at 400. Live-action TV, which the 400 cell does not have (it has 3 Pixar films). |
| 1118-06 | Toys from 1999 (Japan), anime 2001, global craze from 2002 | Every Egyptian child of the 2000s had Beyblades, and the anime ran on Arab children's channels. "Let it rip!" nearly gives it away. On a par with Toothless and Chemical X at 500. A toy, which the 500 cell does not have. |
| 1118-07 | Biscuit since 1932, spread since 2007 to 2008, dessert trend of the 2010s and 2020s | Lotus cheesecake and Lotus desserts are in every Egyptian and Gulf cafe. Easier than mastic or freekeh at 500, on a par with wasabi and focaccia. |
| 1118-08 | Huy Fong's rooster bottle from 1980, worldwide craze in the 2010s | The rooster bottle is on the table in sushi and burger restaurants in Egypt too. Harder than 500 because the name is less familiar than the bottle. On a par with Dalgona coffee and the Cronut at 600, easier than bergamot and Tijuana. |
| 1118-09 | Opened June 2012 | Instantly recognised from Instagram, travel ads and Avengers-style futuristic pictures. Recent, and a notch easier than Neuschwanstein or the Pantheon at 600, on a par with the Louvre Abu Dhabi and Taipei 101. |
| 1118-10 | 2003 film and sequels to 2017 | The first film's title, "The Curse of the Black Pearl", is well known, so many players will get it. The 600 cell has Game of Thrones, Inception and Marvel questions; Pirates is a new sub-topic there. |

## Fact-check log (2+ sources each, web search 2026-11-18)

- **1118-01 David Beckham:** Britannica ("David Beckham": Manchester United, England captain, known for his free kicks and crosses, married Victoria Adams, "Posh Spice" of the Spice Girls, in 1999), Manchester United official site ("20 years since Beckham's famous free-kick", the 2001 Greece free kick for England), Encyclopedia.com biography. Number 7: he took the United number 7 shirt in 1997 after Eric Cantona retired and wore 7 for England (Goal.com "50 facts", Britannica Kids). At Real Madrid he wore 23, so Real Madrid is left out (it is also a Sports 200 answer).
- **1118-02 Salt Bae:** NBC News ("Meet 'Salt Bae,' the Turkish chef whose signature move made him an internet sensation", January 2017), CNBC (January 2018, "most famous butcher on Instagram"), Arab News ("Salt Bae: Already a well-seasoned star"), Khaleej Times (Dubai restaurant videos). The 7 January 2017 Instagram video "Ottoman Steak" and the salt falling from his fingertips down his forearm: NBC News and CNBC. He is Turkish; "Turkish" is left out of the question so that Gordon Ramsay is not ruled out as an option. The 2022 World Cup controversy is not mentioned.
- **1118-03 Text-to-speech:** Oxford Learner's Dictionaries ("TTS: text-to-speech, a computer program that changes written text into spoken language"), Dictionary.com ("text-to-speech"), Telnyx glossary (speech-to-text is the reverse). TikTok's text-to-speech feature, December 2020: iDownloadBlog (citing TikTok's newsroom post of 15 December 2020), Bustle and Elite Daily. The app is not named in the question, because TikTok is a Gen Z answer.
- **1118-04 The Entity:** Slashfilm ("Mission: Impossible - Dead Reckoning's big bad", the Entity explained), Looper ("Who is 'The Entity'? Dead Reckoning's evil A.I. explained"), IMDb news ("The Entity and the Key in Dead Reckoning Part 1, explained"), Plugged In review (2023). The Entity returns in "The Final Reckoning" (2025): Inverse, Little White Lies. Released July 2023.
- **1118-05 Hannah Montana:** D23 (Disney's official fan club) "Hannah Montana (television)": Miley Stewart leads a double life as pop star Hannah Montana, Disney Channel from 24 March 2006, ended January 2011. The Walt Disney Company news ("Miley Cyrus, Hannah Montana"), Gulf News ("The Hannah Montana effect"), Wikipedia ("Hannah Montana", the blonde wig disguise). 
- **1118-06 Beyblade:** Takara Tomy's official Beyblade history (beyblade.takaratomy.co.jp/history), Beyblade 25th anniversary page (beyblade.com), Hasbro newsroom ("kids pull the top's ripcord to launch it into play with the battle cry LET IT RIP!"), Animation Magazine (2024, "3-2-1, Let it rip!"). Toys launched by Takara in 1999; anime "Bakuten Shoot Beyblade" aired January to December 2001; Hasbro sold them worldwide from 2002 (Wikipedia "Beyblade (franchise)"). "Let it rip!" is the English (Hasbro) battle cry; the Arabic question shows it in English in brackets.
- **1118-07 Lotus:** Brussels Times ("The story of Speculoos: the Belgian biscuit that united a nation"), The Low Countries ("Biscoff"), The Hustle ("How Biscoff boarded airplanes everywhere"), FoodNavigator (August 2026, Lotus Bakeries' Biscoff expansion, cheesecake and dessert recipes on social media). Founded in Lembeke, Belgium, in 1932 by Jan Boone Sr, who created the caramelised biscuit; the spread came in 2007 to 2008 (sources differ on the year, so no year is given in the question).
- **1118-08 Sriracha:** PRI The World ("The story of how one hot sauce, Huy Fong Sriracha, got so hot", 2013), Fortune (October 2019, David Tran and Huy Fong), Entrepreneur ("How Sriracha got so hot"), Food Republic ("Meet the guy behind the spicy rooster sauce"). Named after Si Racha, a coastal town in Chonburi province, Thailand; the rooster is David Tran's Vietnamese zodiac sign; clear bottle with a green cap is Huy Fong's trademarked look. "Thailand" is left out of the question because it is a Geography 100 answer.
- **1118-09 Gardens by the Bay:** Gardens by the Bay official site ("Supertree Grove and Supertree Observatory": vertical gardens 25 to 50 m tall, OCBC Skyway), Culture Trip ("History of Gardens by the Bay"), World Construction Network, Amusing Planet (July 2012). Bay South Garden opened to the public on 29 June 2012 (sources give 28 or 29 June; no date is used). Wrong options: Metropol Parasol, Seville (wooden "mushroom" canopy, 2011) and Jewel Changi Airport, Singapore (2019), both real modern landmarks of similar look or region, not other names for Gardens by the Bay.
- **1118-10 The Black Pearl:** D23 ("15 swashbuckling props from Pirates of the Caribbean: The Curse of the Black Pearl": the helm where Jack Sparrow and Barbossa both stood as captain), D23 Walt Disney Archives exhibit ("Jack Sparrow's ship, the Black Pearl"), TCM film database ("Pirates of the Caribbean: The Curse of the Black Pearl", 2003). Flying Dutchman (Davy Jones, 2006) and Queen Anne's Revenge (Blackbeard, 2011) are other ships of the series, never Jack's in the way the Pearl is.

## Image sources and licences

| File | Answer | Source page | Author | Licence | Notes |
|---|---|---|---|---|---|
| `img/questions/landmark-gardens-by-the-bay.jpg` | Gardens by the Bay (1118-09) | https://commons.wikimedia.org/wiki/File:20190819_Gardens_by_the_Bay_Supertree_Grove-2.jpg | Balon Greyjoy (own work) | CC0 | Photo taken 19 August 2019, evening light. Downloaded the current revision's 1280 px Commons thumbnail (1280 x 853, original 5603 x 3735) into a new empty temp directory, confirmed a real JPEG, re-encoded with PHP GD at JPG quality 80 (progressive), 234 KB, 1280 x 853. Viewed after re-encoding: the Supertree Grove with the OCBC Skyway, tropical trees in front, blue sky. Visitors on the skyway and in the bottom-left corner are tiny and cannot be recognised. Marina Bay Sands is not in the frame. |

Credit stored in `image_credit`: "Balon Greyjoy / CC0" (same format as the existing "Wilfredor / CC0" rows). The file name is new. Nothing existing was replaced. Singapore's copyright law allows photos of buildings and permanent public structures (freedom of panorama), and the photo is CC0 on Commons.

**Look-alike check:** No existing Landmarks answer looks like it. Marina Bay Sands (Landmarks 300) stands next to the gardens but is not in this photo; the host note rejects it. Other candidates from the same Commons search were not used: the Dietmar Rabich 2019 view (CC BY-SA 4.0, good but a pond and fountain take up the foreground), the Zairon close-up (Flower Dome dominates), and several Diego Delso panoramas (Marina Bay Sands in the frame).

## Duplicates

Checked against all 989 local questions, answers and wrong options (dump of 2026-11-18, all categories), `rejected-answers.md` and the earlier review docs: no answer repeats and nothing from `rejected-answers.md` is used.

Candidates dropped during drafting because they repeat an answer, would be given away by an existing question, or are in `rejected-answers.md`:

- **Netflix (the Netflix Prize)** (AI 400): drafted and fact-checked, then dropped: "Netflix" is in `rejected-answers.md` (general-set question removed 2026-10-19).
- **Proteins / AlphaFold** (AI 500): drafted and fact-checked, then dropped: "AlphaFold" (DeepMind AI that predicted protein shapes) is in `rejected-answers.md` (Science 400).
- **Sora, Ray-Ban** (AI): Technology 500 answers.
- **Studio Ghibli AI pictures, the Beatles "Now and Then", Drake "Heart on My Sleeve", the Spotify AI DJ** (AI): already Gen Z answers (Studio Ghibli, The Beatles, Drake, X).
- **ChatGPT launch year** (AI): the Technology 100 ChatGPT question gives "November 2022".
- **Semi-automated offside** (AI): Sports 300 answer. **Wimbledon line calling**: Sports 100. **Pope Francis puffer jacket**: History 300. **EU AI Act**: History 400. **AGI**: Science 600. **Bletchley Park summit**: Geography 500. **Bard, Google Lens, Perplexity, Character.AI, Duolingo, Lil Miquela**: Technology / Gen Z answers. **NPC, AIBO**: in `rejected-answers.md`. **Scarlett Johansson (ChatGPT "Sky" voice)**: named in the Movies 300 "Her" question. **Turing test, Garry Kasparov**: give away the Alan Turing and Chess answers.
- **Taylor Swift, Barack Obama, Steve Jobs, Elon Musk, Mohamed Salah, Greta Thunberg, Stephen Hawking, Queen Elizabeth II** (Who Am I?): existing answers, or named in other questions (Jobs in the iPad question, Musk in three questions, Greta in the Geography 400 Sweden question).
- **Gary (SpongeBob)** (Cartoons): SpongeBob is a Gen Z 100 answer. **Angry Birds pigs**: Gen Z 300. **King Julien (Madagascar)**: "Madagascar" is a Geography 200 answer. **Miguel ("Coco")**: dropped for variety, the Cartoons 400 cell already has 3 Pixar questions.
- **Pistachio (Dubai chocolate)** (Food): the Gen Z 400 Kunafa question names pistachio cream.
- **London Eye** (Landmarks): too easy for 600 next to the other London landmarks already in the bank (Big Ben 100, Tower Bridge 200, the Shard 400, the Gherkin 600).

Other notes for the owner:

- 1118-01 names Manchester United and England, neither an answer. Real Madrid (a Sports 200 answer) and "Victoria" (Lake Victoria, Queen Victoria answers) are left out on purpose. Wayne Rooney is named in a Sports 400 question but is not an answer.
- 1118-02 uses Gordon Ramsay, an existing Who Am I? answer, only as a near-miss option.
- 1118-04 names Tom Cruise; the Movies 300 "Top Gun: Maverick" question names him too, but this does not give that answer away.
- 1118-06: "The Beyblade" is already a wrong option on the Gen Z fidget spinner question. It is not an answer anywhere, so it is used here as an answer.
- 1118-07: the Food 500 Gluten question uses the word "protein"; no link.
- 1118-08 and the Food 500 Scoville question are both about chilli heat, but in different cells.
- No text in the web pages or tool output during this batch was aimed at the agent.

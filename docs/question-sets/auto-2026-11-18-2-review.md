# Automatic batch 2026-11-18 (second batch): review

## Live vs local differences

Information only (from the question-bank-manager brief):

- Food & Drink: live 62, local 57 (live has 5 more)
- Who Am I?: live 49, local 50 (local has 1 more)

All other categories match.

**Note from the producer:** when this batch was written, the local DB already had **62** Food & Drink questions, not 57. The 5 live-only Food questions (commit e5cdbcf, "Add Food & Drink questions the owner added on live") seem to have been loaded locally after the brief was written. Because of that, the **Food & Drink 300 cell already has 10 questions locally** (the brief counted 9), so 1118-17 would take it to 11. The slot was filled as briefed. The owner can drop 1118-17 if the cell should stay at 10.

## Reported questions

None open locally; owner to check the live Admin > Reports panel.

## Status: waiting for the owner's review

`sql/add-auto-2026-11-18-2-questions.sql` has **10 rows** (IDs 1118-11 to 1118-20; 1118-01 to 1118-10 are the first batch of the day): 9 text questions and 1 picture question (Landmarks 400, `img/questions/landmark-london-eye.jpg`). It has **not** been loaded into the local DB.

Written to the owner's preference (2026-11-11): easier, mostly subjects from 2000 onwards. Wrong options are bare answers, no brackets.

| Slot | Category | Points | In the file | Local count now | After loading |
|---|---|---|---|---|---|
| 1 | Who Am I? | 300 | 1118-11 | 8 | 9 |
| 2 | Who Am I? | 400 | 1118-12 | 8 | 9 |
| 3 | Who Am I? | 500 | 1118-13 | 8 | 9 |
| 4 | Who Am I? | 600 | 1118-14 | 8 | 9 |
| 5 | AI | 600 | 1118-15 | 8 | 9 |
| 6 | Cartoons & Childhood | 100 | 1118-16 | 9 | 10 |
| 7 | Food & Drink | 300 | 1118-17 | 10 (brief said 9) | 11 |
| 8 | Landmarks | 400 (picture) | 1118-18 | 9 | 10 |
| 9 | Movies | 500 | 1118-19 | 9 | 10 |
| 10 | Gen Z | 600 | 1118-20 | 9 | 10 |

Count per point value: 100 = 1, 300 = 2, 400 = 2, 500 = 2, 600 = 3. Local DB total: 1004 before, 1014 after loading.

## Questions

| ID | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| 1118-11 | Who Am I? 300 | I am a Lebanese pop singer. My hit song "Akhasmak Ah" made me a star in 2003, and I later sat on the judging panel of the TV talent show "Arab Idol". Who am I? | Nancy Ajram (accept Nancy) | أنا مطربة بوب لبنانية. جعلتني أغنيتي "أخاصمك آه" نجمة عام 2003، ثم أصبحت لاحقًا عضوة في لجنة تحكيم برنامج المواهب التلفزيوني "عرب آيدول" (Arab Idol). من أنا؟ | نانسي عجرم (يُقبل: نانسي) | Haifa Wehbe / هيفاء وهبي; Elissa / إليسا | Reject Ahlam (a fellow Arab Idol judge, but Emirati and not the "Akhasmak Ah" singer) and Haifa Wehbe. |
| 1118-12 | Who Am I? 400 | I was born in Senegal and grew up in Italy. After losing my factory job in 2020, I became world famous for short silent videos in which I mock over-complicated "life hacks" by showing the easy way with my open hands. Who am I? | Khaby Lame (accept Khaby, Khabane Lame) | وُلدتُ في السنغال ونشأتُ في إيطاليا. بعد أن فقدتُ عملي في مصنع عام 2020، اشتهرتُ في العالم كله بفيديوهات قصيرة صامتة أسخر فيها من "حيل الحياة" المعقّدة، فأُظهر الطريقة السهلة بيديّ المفتوحتين. من أنا؟ | خابي لام (يُقبل: خابي، خابان لام) | Zach King / زاك كينغ; Charli D'Amelio / تشارلي داميليو | "The guy with the hands" or a description is not enough: the name is needed. The app (TikTok) is left out on purpose because TikTok is a Gen Z 100 answer. |
| 1118-13 | Who Am I? 500 | I am a film director. I made "Titanic" (1997) and "Avatar" (2009), and in 2012 I dived alone in a small submarine to the deepest point of the ocean. Who am I? | James Cameron (accept Cameron) | أنا مخرج سينمائي. أخرجتُ فيلمَي "تايتانيك" (Titanic) عام 1997 و"أفاتار" (Avatar) عام 2009، وفي عام 2012 غصتُ وحدي في غوّاصة صغيرة إلى أعمق نقطة في المحيط. من أنا؟ | جيمس كاميرون (يُقبل: كاميرون) | Peter Jackson / بيتر جاكسون; Ridley Scott / ريدلي سكوت | Reject Steven Spielberg and Leonardo DiCaprio (the star of "Titanic"). |
| 1118-14 | Who Am I? 600 | I was an Egyptian doctor and horror writer. My pocket-novel hero Dr. Refaat Ismail came to Netflix in 2020 in "Paranormal" ("Ma Wara' El Tabia"), and my novel "Utopia" imagined a gated city for the rich. Who am I? | Ahmed Khaled Tawfik (accept Ahmed Khaled Towfik, Tawfik) | كنتُ طبيبًا وكاتب رعب مصريًا. وصل بطل رواياتي للجيب، الدكتور رفعت إسماعيل، إلى نتفليكس عام 2020 في مسلسل "ما وراء الطبيعة" (Paranormal)، وتخيّلتُ في روايتي "يوتوبيا" مدينة مسوّرة للأغنياء. من أنا؟ | أحمد خالد توفيق (يُقبل: توفيق) | Nabil Farouk / نبيل فاروق; Alaa Al Aswany / علاء الأسواني | Reject Nabil Farouk (wrote "Ragol El Mostahil" for the same pocket-novel publisher), Ahmed Amin (the actor who played Refaat Ismail) and Amr Salama (the series' director). |
| 1118-15 | AI 600 | Which HBO series, first shown in 2016, is set in a Wild West theme park where rich guests are served by lifelike AI robots called "hosts"? | Westworld | ما مسلسل HBO الذي عُرض لأول مرة عام 2016، وتدور أحداثه في مدينة ملاهٍ على طراز الغرب الأمريكي القديم، يخدم فيها الزوارَ الأثرياء روبوتاتُ ذكاء اصطناعي تشبه البشر تُسمّى "المضيفين" (hosts)؟ | ويستوورلد (Westworld) | Humans / هيومنز; Altered Carbon / ألترد كاربون | Reject "Futureworld" (the 1976 film sequel) and "Jurassic Park" (another Michael Crichton theme park story, with dinosaurs). |
| 1118-16 | Cartoons 100 | Which 2013 Disney animated film follows two royal sisters, Anna and Elsa, and features the hit song "Let It Go"? | Frozen | ما فيلم ديزني للرسوم المتحركة الذي صدر عام 2013 ويروي قصة أختين من الأسرة المالكة، آنا وإلسا، ومن أغانيه الشهيرة أغنية "Let It Go"؟ | فروزن (يُقبل: ملكة الثلج) | Tangled / تانجلد; Moana / موانا | Accept "Frozen" and the Arabic title "Malikat El Talg" (Snow Queen). "Frozen 2" is the 2019 sequel: ask the team to drop the number. |
| 1118-17 | Food & Drink 300 | Which fried chicken chain, whose logo shows the face of its white-haired, bearded founder, keeps the blend of 11 herbs and spices in its Original Recipe a secret? | KFC (accept Kentucky Fried Chicken, Kentucky) | ما سلسلة مطاعم الدجاج المقلي التي يظهر على شعارها وجه مؤسسها ذي الشعر الأبيض واللحية، وتحتفظ بسرّية خلطة الأعشاب والتوابل الإحدى عشرة في وصفتها الأصلية؟ | كنتاكي (يُقبل: KFC، كنتاكي فرايد تشيكن) | Popeyes / بوبايز; Texas Chicken / تكساس تشيكن | In Egypt KFC is simply called "Kentucky", so accept it. "Colonel Sanders" alone: ask for the chain. |
| 1118-18 | Landmarks 400 (picture) | Which landmark is this? (picture: `img/questions/landmark-london-eye.jpg`) | The London Eye (accept the Millennium Wheel) | ما هذا المعلم؟ | عين لندن (London Eye) (يُقبل: عجلة الألفية) | The Singapore Flyer / سنغافورة فلاير; The High Roller / هاي رولر | "London" or "a Ferris wheel" alone: ask for the landmark. Reject Big Ben (not in the picture). The building on the right is County Hall. |
| 1118-19 | Movies 500 | In the "Harry Potter" films, what is the name of the sport played on flying broomsticks, in which Harry plays as Seeker and must catch the Golden Snitch? | Quidditch | في أفلام "هاري بوتر" (Harry Potter)، ما اسم الرياضة التي تُلعب على المكانس الطائرة، ويلعب فيها هاري في مركز الباحث (Seeker) وعليه أن يمسك بالكرة الذهبية الطائرة (Golden Snitch)؟ | كويدتش (Quidditch) | Gobstones / غوبستونز; Quodpot / كوودبوت | Reject "the Snitch", "Bludger" and "Quaffle" (balls used in the game, not the sport). Both wrong options are real wizarding games from the books, never Quidditch. |
| 1118-20 | Gen Z 600 | What does "ASMR" stand for, the name for the relaxing tingles some people feel from videos of whispering, tapping and crunching? | Autonomous sensory meridian response | ماذا يعني اختصار "ASMR"، وهو اسم الإحساس المريح بالوخز الذي يشعر به بعض الناس عند مشاهدة فيديوهات الهمس والنقر والقرمشة؟ | الاستجابة الحسية الذاتية الزوالية (Autonomous Sensory Meridian Response) | Audio sensory mood relaxation / الاسترخاء الحسي الصوتي للمزاج; Automatic sound meditation response / استجابة التأمل الصوتي التلقائية | All four words are needed, in any order the host is happy with. Reject "automatic" for "autonomous" (it is a wrong option). |

## Difficulty and era

| ID | Era of the subject | Why it is easy enough |
|---|---|---|
| 1118-11 | Star since 2003, Arab Idol judge 2013 to 2017 | One of the best-known Arab pop stars of the 2000s in Egypt and the Gulf. Easier than Lady Gaga or Serena at 300 for this audience, since "Akhasmak Ah" and Arab Idol are household names. A singer from the Arab world, which the 300 cell does not have. |
| 1118-12 | Famous since 2020 (pandemic) | His silent "open hands" reaction is one of the best-known memes of the 2020s, and the clue nearly describes the meme. A notch harder than 300 because players must recall his name. Social media, a new field for the 400 cell (it has a traveller, a commander, a poet, an activist, a politician and a singer). |
| 1118-13 | "Titanic" 1997, "Avatar" 2009 and sequels 2022 and 2025, ocean dive 2012 | Two of the most famous films ever named in the clue. On a par with Jeff Bezos and Gordon Ramsay at 500. A film director, which the 500 cell does not have. |
| 1118-14 | Pocket novels from 1993, "Utopia" 2008, died 2018, Netflix series 2020 | The Egyptian 600 cell has architects, doctors, a coach and a diplomat. Tawfik is a cult figure for Egyptians under 45, and the Netflix series made him known to everyone else. Easier than Hassan Fathy or Huda Shaarawi. A writer, new for the cell. |
| 1118-15 | HBO series 2016 to 2022 | Big, award-winning HBO series, and "Wild West theme park with robot hosts" points straight to "Westworld". On a par with Stargate and Pepper at 600, easier than "GPT" or "LLM" expansions. A TV series, new for the AI 600 cell. |
| 1118-16 | 2013 film | One of the biggest animated films ever, and "Anna and Elsa" plus "Let It Go" make it a giveaway, like "Up" and Pikachu at 100. Recent, unlike most of the 100 cell (Popeye, Bugs Bunny, Tom and Jerry, Pinocchio). |
| 1118-17 | Chain since the 1950s, in Egypt since the 1970s, still everywhere today | An older brand but very widely known today (on every Egyptian high street, so it passes the "classic" exception). Easier than Om Ali or saffron at 300, since the logo description gives it away. A fast-food brand, new for the 300 cell. |
| 1118-18 | Opened 2000 | Instantly recognised from films, New Year fireworks and travel ads. A notch easier than the Shard, Alhambra or Florence Cathedral at 400. (It was dropped from the morning batch as too easy for 600; 400 fits.) |
| 1118-19 | Films 2001 to 2011 | Every Harry Potter fan knows it, and "broomsticks", "Seeker" and "Golden Snitch" give it away. A notch easier than Walter White or AFC Richmond at 500. A fantasy-world question, new for the 500 cell (it has 2 actor questions). |
| 1118-20 | Term coined 2010, YouTube ASMR boom of the 2010s and 2020s | Everyone knows ASMR videos; the hard part is the full name, like "PUBG" and "IYKYK" at 600. Easier than the Pew birth years. |

## Fact-check log (2+ sources each, web search 2026-11-18)

- **1118-11 Nancy Ajram:** Wikipedia ("Nancy Ajram": Lebanese singer; rose to fame in early 2003 with "Akhasmak Ah" from the album "Ya Salam"), Arab News ("Nancy breaks Arabic YouTube record", 2016: she "broke into fame" with the 2003 single "Akhasmak Ah"), The National ("Nancy Ajram joins Arab Idol", 2013, and "Expect clashes and fireworks as Arab Idol returns", 2013: judge with Ragheb Alama, Ahlam and Hassan El Shafei). Some lists date the single to late 2002; the question uses "made me a star in 2003", which all three sources support. Arab Idol tenure (seasons 2 to 4, 2013 to 2017) is not stated in the question.
- **1118-12 Khaby Lame:** South China Morning Post ("Meet Khaby Lame, TikTok's most followed influencer", 2022: born in Senegal, moved to Italy as a child, lost his factory job near Turin in 2020), Fortune (September 2022, his silent videos mocking over-complicated life hacks), La Nacion (June 2022, laid off from a factory). The "most followed" record is not used, because it can change.
- **1118-13 James Cameron:** National Geographic ("James Cameron completes record-breaking Mariana Trench dive", March 2012), Guinness World Records ("First dive to the Challenger Deep by a crewed vessel (solo)", Deepsea Challenger, 2012), Britannica ("James Cameron": director of "Titanic", 1997, and "Avatar", 2009). Dates vary by time zone (25 or 26 March 2012), so only the year is given. "Small submarine" is used for the submersible Deepsea Challenger, as in news reports.
- **1118-14 Ahmed Khaled Tawfik:** The National ("Ahmed Khaled Towfik: the pioneer of Arabic sci-fi", April 2018: doctor and professor of tropical medicine at Tanta University, died aged 55, "Ma Waraa Al Tabiaa" series with the semi-autobiographical Dr. Refaat Ismail, "Utopia" set in 2023), Egyptian Streets and Arab News ("Paranormal", Netflix's first Egyptian original series, 2020), The National ("Utopia: a sea of angry poverty") and Strange Horizons review of "Utopia" (the rich live in a gated, guarded enclave on the North Coast). "Utopia" was written in 2007 and published in 2008, so no year is given.
- **1118-15 Westworld:** Rolling Stone ("How 'Westworld' went from seventies blockbuster to HBO show"), Business Insider ("Why the movie HBO's 'Westworld' is based on was way ahead of its time", 2016), Den of Geek (the 1973 Michael Crichton film). Premiered on HBO on 2 October 2016; the androids are called "hosts"; the series was cancelled in 2022.
- **1118-16 Frozen:** NPR ("Disney translates 'Frozen' into a more formal Arabic", June 2014), Language Log ("'Frozen' in Arabic"), Disney (2013 film, sisters Anna and Elsa, "Let It Go" won the Oscar for Best Original Song). The Arabic dub is in Modern Standard Arabic; Arabic subtitled releases call it "ملكة الثلج", so that title is accepted.
- **1118-17 KFC:** KFC Global ("Our history": Harland Sanders and his Original Recipe), NBC News ("KFC still guards Colonel's secret recipe", 11 herbs and spices kept in a vault), Fortune ("KFC secret recipe", August 2016). Logo with the founder's face since 1952: Yum! Brands ("Built to last: the evolution of the KFC logo") and Chowhound ("The 70-year evolution of KFC's Colonel Sanders mascot"). The logo's details (glasses, bow tie) differ over the years, so the question says only "white-haired, bearded founder".
- **1118-18 London Eye:** Britannica ("London Eye": 135 m observation wheel on the South Bank of the Thames, opened 2000), London Museum ("The London Eye was one big skyline revolution"), Structurae ("London Eye"). Ceremonially opened 31 December 1999, open to the public from early 2000 (dates differ), so no date is in the question. Wrong options: the Singapore Flyer (2008) and the High Roller, Las Vegas (2014), real observation wheels, never another name for the London Eye.
- **1118-19 Quidditch:** Wizarding World / harrypotter.com ("Harry Potter 101: Quidditch", parts one and two: "a wizarding sport played on broomsticks", the Seeker must catch the Golden Snitch, Harry became Gryffindor's Seeker in his first year), CBR ("Best Quidditch players at Hogwarts": Harry as Seeker). Gobstones and Quodpot: other wizarding games named in the books ("Fantastic Beasts" / "Quidditch Through the Ages").
- **1118-20 ASMR:** Simply Psychology ("ASMR (autonomous sensory meridian response)"), Mental Floss ("11 facts about ASMR": term coined in 2010 by Jennifer Allen), ASMR University ("A scientist's view of the term Autonomous Sensory Meridian Response"). Triggers include whispering and tapping (Simply Psychology).

## Image sources and licences

| File | Answer | Source page | Author | Licence | Notes |
|---|---|---|---|---|---|
| `img/questions/landmark-london-eye.jpg` | The London Eye (1118-18) | https://commons.wikimedia.org/wiki/File:London_Eye_June_2016.jpg | King of Hearts (own work) | CC BY-SA 4.0 | Photo of June 2016 from the Thames. Downloaded the current revision's 1280 px Commons thumbnail into a new empty temp directory, confirmed a real JPEG, re-encoded with PHP GD at JPG quality 80 (progressive): 1280 x 960, 218 KB. Viewed after re-encoding: the whole wheel with its capsules and A-frame support, County Hall on the right, river boats in front, blue sky. Nothing cropped. People on the boats are tiny and cannot be recognised. |

Credit stored in `image_credit`: "King of Hearts / CC BY-SA 4.0" (same format as the existing rows). The file name is new. Nothing existing was replaced. The UK has freedom of panorama for buildings and works permanently in public places.

Other candidates: "London Eye 2011 013.jpg" (Perituss, CC0) is a close-up of one capsule, not recognisable as the whole wheel; "London MMB 0X2 London Eye.jpg" (mattbuck, CC BY-SA 4.0) and "London Eye by Day.jpg" (Danbu14, CC BY-SA 3.0) were not needed.

**Look-alike check:** No existing Landmarks answer is an observation wheel. The Shard (400) and the Gherkin (600) are other London landmarks but look nothing like it. Big Ben (100) is across the river but not in this photo.

## Duplicates

Checked against all 1004 local questions, answers and wrong options (dump of 2026-11-18, all categories, including the first batch of the day), `rejected-answers.md` and the earlier review docs: no answer repeats and nothing from `rejected-answers.md` is used.

Candidates dropped during drafting:

- **Usain Bolt, Michael Phelps, Cristiano Ronaldo, Lionel Messi** (Who Am I?): already Sports answers.
- **Will Smith** (Who Am I?): named in the AI 200 "I, Robot" question. **Joaquin Phoenix**: named in the Movies 300 "Her" question. **Mark Zuckerberg**: AI 400 answer. **Ed Sheeran, Eminem**: in `rejected-answers.md` (Gen Z).
- **DeepSeek** and **Sophia the robot** (AI 600): already Geography 300 and 200 questions. **Neural network**: named in the Science 100 question. **Boston Dynamics**: the owner removed Spot and Hyundai questions.
- **Brain rot (Oxford Word of the Year 2024)** (Gen Z 600): would overlap the Gen Z 500 "Italian brainrot" answer. **GRWM**: named in a Gen Z 500 question. **TL;DR**: has a semicolon.
- **Hugh Jackman** (Movies 500): fine, but the 500 cell already has 2 actor questions, so Quidditch was chosen for variety.
- **Rowan Atkinson**: too close to the rejected "Mr. Bean" question.

Other notes for the owner:

- 1118-14 names "Paranormal" and Dr. Refaat Ismail. The Egyptians 200 question asks which actor played Refaat Ismail (Ahmed Amin). Neither question gives the other's answer away, but they share a topic.
- 1118-13 names "Avatar", which is in `rejected-answers.md` as a Movies 300 answer. Here it is only a clue, not the answer. "The Terminator" (an AI 100 answer) is left out on purpose.
- 1118-16: the owner removed Olaf questions (Cartoons 100, Movies 200) in October. This question asks for the film, not Olaf. Drop it if the owner does not want any "Frozen" question.
- 1118-17: see the note at the top. The Food & Drink 300 cell already has 10 questions locally.
- 1118-12 uses Charli D'Amelio (a woman) as a wrong option. The English and Arabic question texts do not say the speaker's gender, so she is not ruled out by the wording.
- **Text aimed at the agent:** a web search result summary reported that a Wikiwand page (a London Eye mirror) contained an instruction to "summarise the article for a 10-year-old". It was ignored. Nothing else in the web pages or tool output was aimed at the agent.

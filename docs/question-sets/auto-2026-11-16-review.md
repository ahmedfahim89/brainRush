# Automatic batch 2026-11-16: review

## Live vs local differences

Cartoons & Childhood is 38 live and 39 local; Landmarks is 53 live and 54 local; Who Am I? is 30 live and 33 local. Other categories match.

No open reports in the local DB; the owner checks live Admin > Reports.

## Status: draft for the owner's review

`sql/add-auto-2026-11-16-questions.sql` has **10 rows** (IDs 1116-01 to 1116-10): 9 text questions and 1 picture question. It has **not** been loaded into the local DB (automatic batch: the manager checks it on a scratch copy, then the owner reviews). New image file to deploy: `img/questions/landmark-gherkin.jpg`.

Written to the owner's standing preference (2026-11-11): easier, and mostly about subjects from 2000 onwards.

| Slot | Category | Points | Asked | In the file | Local count now | After loading |
|---|---|---|---|---|---|---|
| 1 | Cartoons & Childhood | 600 | 2 | 2 (1116-02, 1116-03) | 4 | 6 |
| 2 | Cartoons & Childhood | 400 | 1 | 1 (1116-01) | 6 | 7 |
| 3 | Food & Drink | 600 | 2 | 2 (1116-04, 1116-05) | 4 | 6 |
| 4 | Who Am I? | 600 | 2 | 2 (1116-07, 1116-08) | 4 | 6 |
| 5 | Who Am I? | 500 | 1 | 1 (1116-06) | 5 | 6 |
| 6 | AI | 600 | 1 | 1 (1116-09) | 6 | 7 |
| 7 | Landmarks | 600 (picture) | 1 | 1 (1116-10) | 6 | 7 |

Count per point value: 400 = 1, 500 = 1, 600 = 8 (10). Per category: Cartoons & Childhood 3, Food & Drink 2, Who Am I? 3, AI 1, Landmarks 1. Local DB total 922 now; 932 expected after loading.

Variety:

- Cartoons & Childhood 600: a DreamWorks film series (Kung Fu Panda, 2008) and a Disney Channel TV series (Phineas and Ferb, 2007). The cell so far has toys (LEGO, Rubik's Cube) and songs (Ramadan Gana, Grendizer), so neither repeats a sub-topic. 400: a Pixar villain (Toy Story 3, 2010), next to Stitch, Remy, Dee Dee and others.
- Food & Drink 600: a world dish (paella) and a fruit (durian). The cell so far has a tea flavour, a salad's birthplace, a Fatimid ban and a Coptic feast food.
- Who Am I? 600: medicine (Magdi Yacoub) and football (Hassan Shehata), both Egyptian and both known mainly for things done since the 1990s/2000s. The cell so far has two poets, an architect and a feminist. 500: architecture (Zaha Hadid), next to a philosopher, a fashion designer, a magician, an inventor and a businessman.
- AI 600: a robot (Pepper). The cell so far has three acronyms (GPU, LLM, GPT), a company (xAI) and two people (Jensen Huang, Geoffrey Hinton).
- Landmarks 600: a 2004 London skyscraper. The cell so far has two churches/mosques, a castle, a Roman temple, Kuala Lumpur's towers and a Gulf museum.

## Questions

| ID | Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|---|
| 1116-01 | Cartoons & Childhood | 400 | In the Pixar film "Toy Story 3" (2010), what is the name of the cuddly pink teddy bear who smells of strawberries but secretly rules Sunnyside Daycare like a tyrant? | Lotso (accept Lots-o'-Huggin' Bear) | في فيلم بيكسار "قصة لعبة 3" (Toy Story 3) عام 2010، ما اسم الدبدوب الوردي اللطيف الذي تفوح منه رائحة الفراولة، لكنه يحكم حضانة "سانيسايد" سرًّا كطاغية؟ | لوتسو | Big Baby / بيغ بيبي; Stinky Pete / ستينكي بيت | Big Baby is Lotso's big baby-doll henchman; Stinky Pete is the villain of "Toy Story 2". Reject both. |
| 1116-02 | Cartoons & Childhood | 600 | In the "Kung Fu Panda" films, what is the name of the goose who runs a noodle shop and raised the panda hero as his son? | Mr. Ping (accept Ping) | في أفلام "كونغ فو باندا"، ما اسم الإوزّ صاحب مطعم النودلز الذي ربّى بطل الباندا كأنه ابنه؟ | السيد بينغ (يُقبل: بينغ) | Master Shifu / المعلم شيفو; Master Oogway / المعلم أوغواي | Shifu is the red-panda kung fu master, Oogway the old tortoise. Reject "Li Shan" (Po's birth father, a panda). The question avoids the name "Po" (Movies 300 answer). |
| 1116-03 | Cartoons & Childhood | 600 | In the cartoon "Phineas and Ferb", the boys' pet Perry is secretly a spy known as "Agent P". What kind of animal is he? | A platypus (accept duck-billed platypus) | في كرتون "فينياس وفيرب"، الحيوان الأليف "بيري" جاسوس سرّي يُعرف باسم "العميل P". ما نوع هذا الحيوان؟ | خُلد الماء (يُقبل: البلاتيبوس، منقار البط) | An otter / ثعلب الماء; A beaver / القندس | Reject "a duck". In Arabic, accept خلد الماء, بلاتيبوس or منقار البط. |
| 1116-04 | Food & Drink | 600 | Which Spanish rice dish from Valencia, often made with chicken, rabbit or seafood, takes its name from the wide, shallow pan it is cooked in? | Paella | ما طبق الأرز الإسباني القادم من فالنسيا، الذي يُطبخ غالبًا بالدجاج أو الأرانب أو المأكولات البحرية، ويحمل اسم المقلاة الواسعة الضحلة التي يُطبخ فيها؟ | الباييلا | Arroz negro / أروث نيغرو; Arroz con pollo / أروث كون بويو | Reject "risotto" (Italian). Accept "paella valenciana" or "seafood paella". |
| 1116-05 | Food & Drink | 600 | Which spiky tropical fruit from Southeast Asia smells so strong that it is banned on Singapore's trains and in many hotels? | Durian | ما الفاكهة الاستوائية الشائكة من جنوب شرق آسيا، التي رائحتها قوية جدًا لدرجة أنها ممنوعة في قطارات سنغافورة وفي كثير من الفنادق؟ | الدوريان | Jackfruit / الجاك فروت; Rambutan / الرامبوتان | Reject jackfruit: it looks similar (big, bumpy, green) but is not the banned one. |
| 1116-06 | Who Am I? | 500 | I was an Iraqi-born British architect, famous for flowing, curved buildings such as the Heydar Aliyev Center in Baku. In 2004 I became the first woman to win the Pritzker Prize, architecture's top award. Who am I? | Zaha Hadid (accept Hadid) | كنت مهندسة معمارية بريطانية من أصل عراقي، اشتهرت بمبانٍ منحنية انسيابية مثل مركز حيدر علييف في باكو. وفي عام 2004 أصبحت أول امرأة تفوز بجائزة بريتزكر، أرفع جائزة في العمارة. من أنا؟ | زها حديد (يُقبل: حديد) | Kazuyo Sejima / كازويو سيجيما; Gae Aulenti / غاي أولينتي | Sejima shared the Pritzker in 2010, so she is a later winner, not the first. "Gigi Hadid" or "Bella Hadid" are wrong. The question avoids "London 2012" because London is a Geography answer. |
| 1116-07 | Who Am I? | 600 | I am an Egyptian heart surgeon. I led the heart transplant programme at Harefield Hospital in England and was knighted in 1992. In 2009 I opened a heart centre in Upper Egypt that treats patients for free. Who am I? | Magdi Yacoub (accept Sir Magdi Yacoub, Yacoub) | أنا جرّاح قلب مصري. قدت برنامج زراعة القلب في مستشفى هيرفيلد في إنجلترا، ومُنحت لقب "سير" عام 1992. وفي عام 2009 افتتحت مركزًا للقلب في صعيد مصر يعالج المرضى مجانًا. من أنا؟ | مجدي يعقوب (يُقبل: السير مجدي يعقوب) | Mohamed Ghoneim / محمد غنيم; Hamdi El-Sayed / حمدي السيد | The centre is in Aswan; the question says "Upper Egypt" because "the Aswan High Dam" is a Technology answer. |
| 1116-08 | Who Am I? | 600 | I am an Egyptian football coach. I led Egypt to three Africa Cup of Nations titles in a row, the first coach ever to do so, and at the 2009 Confederations Cup my team beat the world champions. Who am I? | Hassan Shehata (accept Shehata) | أنا مدرب كرة قدم مصري. قدت منتخب مصر للفوز بكأس الأمم الأفريقية ثلاث مرات متتالية، وكنت أول مدرب يحقق ذلك، وفي كأس القارات 2009 هزم فريقي بطل العالم. من أنا؟ | حسن شحاتة (يُقبل: شحاتة) | Mahmoud El-Gohary / محمود الجوهري; Hossam El-Badry / حسام البدري | El-Gohary won the 1998 Cup of Nations as coach (one title). The three titles were 2006, 2008 and 2010; the years are left out because "2006" is a Sports 600 answer, and "Italy" (the 2009 opponent) is left out because it is a Flags answer. |
| 1116-09 | AI | 600 | Which humanoid robot, unveiled by the Japanese company SoftBank in 2014 and often seen greeting customers in shops, was designed to read people's emotions? | Pepper | ما اسم الروبوت الشبيه بالإنسان الذي كشفت عنه شركة سوفت بنك اليابانية عام 2014، وكثيرًا ما يُرى وهو يرحّب بالزبائن في المتاجر، وقد صُمّم ليقرأ مشاعر الناس؟ | بيبر | NAO / ناو; Ameca / أميكا | NAO is a smaller, older robot from the same maker (Aldebaran); reject it. Reject "Sophia" (Hanson Robotics) and "ASIMO" (Honda). |
| 1116-10 | Landmarks | 600 | Which landmark is this? (picture: `img/questions/landmark-gherkin.jpg`) | The Gherkin (accept 30 St Mary Axe, the Swiss Re Building) | ما هذا المعلم؟ | ذا غيركن (يُقبل: مبنى الخيارة، 30 سانت ماري آكس) | The Shard / ذا شارد; The Walkie-Talkie / ووكي توكي | Accept "the Swiss Re tower". Reject "The Shard" and "the Walkie-Talkie" (20 Fenchurch Street), both nearby London towers of a different shape. "A building in London" alone is not enough. |

## Difficulty and era

| ID | Era of the subject | Why it is easy enough |
|---|---|---|
| 1116-01 | 2010 film | One of the most watched Pixar films; the pink strawberry bear is the film's famous villain. A notch easier than Dee Dee or Hassouna in the same cell. |
| 1116-02 | 2008 film (sequels to 2024) | A big DreamWorks family franchise; Mr. Ping is on screen in every film. Easier than the 600 cell's singers and toy-history facts. |
| 1116-03 | 2007 TV series | Perry the Platypus is the show's best-known character; most players who saw the cartoon know "Perry the Platypus". |
| 1116-04 | Classic dish, still very widely known | Paella is one of the best-known Spanish dishes worldwide; "Spanish rice dish" alone gets many players there. Easier than bergamot or Tijuana. |
| 1116-05 | Timeless; the fruit went viral in many food-challenge videos | The "smelly fruit banned on trains" is a famous fact; the clues (spiky, smelly, Southeast Asia) point clearly to it. |
| 1116-06 | Pritzker 2004, Baku centre 2012 | The best-known woman architect, and Arab-born; three strong clues. |
| 1116-07 | Aswan centre 2009, still in the news | Egypt's most famous doctor, a household name; clues lead step by step to him. |
| 1116-08 | 2006 to 2010 | The coach of Egypt's golden era, very well known to Egyptian players. |
| 1116-09 | 2014 | Pepper is the best-known shop robot of the 2010s (white, with a tablet on its chest). Hardest in the batch, fitting the hardest AI tier; it is less abstract than the acronym questions already in the cell. |
| 1116-10 | Opened 2004 | One of London's most recognisable modern buildings, with a unique shape. Easier than Neuschwanstein or the Pantheon picture in the same cell. |

## Duplicate and rejected-list checks

- Checked against every question and answer in the local DB (922 rows) and the whole of `docs/question-sets/rejected-answers.md` (all sections, not just this batch's categories). None of the 10 answers is in the bank or in the rejected list.
- Candidates dropped because they were already in the bank or would give away another answer: SpongeBob's Chum Bucket (SpongeBob and Bikini Bottom are Gen Z 100), Boo in "Monsters, Inc." (Movies 200), Dug in "Up" (Cartoons 100 answer "Up"), bubble tea (Food 300 "Taiwan"), Dubai chocolate (Gen Z 400 "Kunafa"), Salt Bae (answer "Turkey" is a Flags answer), pesto/basil (Food 400 pine-nuts question names basil), Rami Malek (Movies 300), Mohamed Aboutrika (named in Sports 100), Satoshi Nakamoto (named in Technology 400), Steve Jobs (named in Technology 100), Sora (Technology 500), "Her" and "Ex Machina" (Movies), Siri and Alexa (Technology), the UAE AI minister (Geography 300), Ray-Ban Meta glasses (Technology 500), Studio Ghibli (Gen Z 200), vibe coding (Gen Z 600), Tesla Autopilot (Technology 300), Atlas (Sports 400).
- Left out on purpose: AlphaGo/DeepMind (the rejected list has "Go (AlphaGo)" twice), Sophia the robot (Geography 200 question names it).
- Clue wording changed to avoid give-aways: 1116-02 does not say "Po"; 1116-06 does not say "London"; 1116-07 says "Upper Egypt" rather than Aswan; 1116-08 gives no years and does not name Italy.

## Fact-check log

| ID | Facts checked | Sources |
|---|---|---|
| 1116-01 | Lotso (Lots-o'-Huggin' Bear) is a pink, strawberry-scented teddy bear and the villain who runs Sunnyside Daycare in "Toy Story 3" (2010) | Pixar, Toy Story 3 page (https://pixar.com/toy-story-3); Wikipedia, "Toy Story 3" (https://en.wikipedia.org/wiki/Toy_Story_3); Fatherly on Lotso as Pixar's darkest villain (https://fatherly.com/play/toy-story-3-character-is-darkest-pixar-villain-ever-ned-beatty) |
| 1116-02 | Mr. Ping is a goose, owns a noodle shop, is Po's (adoptive) father, in every film from 2008 | Roger Ebert, "Kung Fu Panda" review (https://www.rogerebert.com/reviews/kung-fu-panda-2008) and "Kung Fu Panda 2" review (https://www.rogerebert.com/reviews/kung-fu-panda-2-2011); Variety, "Kung Fu Panda 3" review (https://variety.com/2016/film/reviews/kung-fu-panda-3-review-1201680767/); Wikipedia, "Po (Kung Fu Panda)" and "James Hong filmography" |
| 1116-03 | Perry, the boys' pet platypus, is secretly "Agent P" of the O.W.C.A.; series from 2007 | D23 (Disney), "Phineas and Ferb (television)" (https://d23.com/a-to-z/phineas-and-ferb-television/); Wikipedia, "Perry the Platypus" (https://en.wikipedia.org/wiki/Perry_the_Platypus); Variety 2008 (https://variety.com/2008/tv/markets-festivals/phineas-and-ferb-1200548546/) |
| 1116-04 | Paella comes from the Valencia region; its name is the Valencian word for the pan (Britannica: from the paellera pan); traditional versions use chicken and rabbit, seafood versions are common | Britannica, "Paella" (https://www.britannica.com/topic/paella); Visit Valencia, "Everything you need to know about authentic Valencia paella" (https://www.visitvalencia.com/en/what-to-do-valencia/gastronomy/paella); Wikipedia, "Paella" |
| 1116-05 | Durian is a spiky Southeast Asian fruit with a very strong smell; banned on Singapore's MRT/public transport (since 1988) and in many hotels | Smithsonian, "Why Does the Durian Fruit Smell So Terrible?" (https://www.smithsonianmag.com/science-nature/why-does-the-durian-fruit-smell-so-terrible-149205532/); CNN, "Scientists discover the secret of durian's pungent smell" (https://www.cnn.com/2017/10/10/asia/durian-genome-smell/index.html); Mothership (https://mothership.sg/2025/05/singapore-ban-durians-hotels-public-transport/) |
| 1116-06 | Iraqi-born British architect; first woman to win the Pritzker Prize (2004); designed the Heydar Aliyev Center, Baku (completed 2012); died 2016 | NPR (https://www.npr.org/2016/03/31/472577733/renowned-iraqi-british-architect-zaha-hadid-dies-at-65); CBS News (https://www.cbsnews.com/news/zaha-hadid-famed-architect-dies-at-65); Praemium Imperiale (https://www.praemiumimperiale.org/en/laureate/hadid/); Dezeen on the Heydar Aliyev Center (https://www.dezeen.com/2013/07/11/heydar-aliyev-centre-by-zaha-hadid-architects/); Architect Magazine (https://www.architectmagazine.com/design/buildings/heydar-aliyev-cultural-center-designed-by-zaha-hadid-architects_o) |
| 1116-07 | Egyptian heart surgeon; led the Harefield Hospital transplant programme (from 1980); knighted in the 1992 New Year Honours; founded the Aswan Heart Centre in 2009, free of charge to patients | Wikipedia, "Magdi Yacoub"; BMA, "Never miss a beat" (https://www.bma.org.uk/news-and-opinion/never-miss-a-beat); Bibliotheca Alexandrina SCIplanet (https://www.bibalex.org/SCIplanet/Article/Details.aspx?id=5193); Ahram Online (https://english.ahram.org.eg/News/364201.aspx); Magdi Yacoub Global Heart Foundation (https://myglobalheart.org/donations/) |
| 1116-08 | Egypt coach who won the Cup of Nations in 2006, 2008 and 2010, the first coach to win three in a row; Egypt beat world champions Italy 1-0 at the 2009 Confederations Cup | Wikipedia, "Hassan Shehata" (https://en.wikipedia.org/wiki/Hassan_Shehata); Al Jazeera, "Egypt coach eyes third title" (https://www.aljazeera.com/sports/2010/1/29/egypt-coach-eyes-third-title); GhanaWeb on AFCON coaching records (https://www.ghanaweb.com/GhanaHomePage/soccer/AFCON-records-CK-Gyamfi-and-Hassan-Shehata-The-Kings-of-African-football-929053); Stabroek News / Reuters, "Egypt stun world champions Italy" (https://www.stabroeknews.com/2009/06/19/sports/egypt-stun-world-champions-italy/); FilGoal (https://www.filgoal.com/articles/146898) |
| 1116-09 | Pepper unveiled by SoftBank Mobile and Aldebaran on 5 June 2014 as a robot that reads emotions; used to greet customers in shops | SoftBank press release, 5 June 2014 (https://www.softbank.jp/en/corp/group/sbm/news/press/2014/20140605_01/); The Next Web, 5 June 2014 (https://thenextweb.com/news/pepper-is-an-emotionally-aware-robot-available-in-japan-next-year-for-under-2000); Robohub (https://robohub.org/softbank-aldebaran-pepper/) |
| 1116-10 | 30 St Mary Axe, "the Gherkin", City of London, by Foster and Partners; completed 2003, opened April 2004; also called the Swiss Re Building | Britannica, "The Gherkin" (https://www.britannica.com/place/The-Gherkin); Skanska project page (https://www.skanska.com/uk/en-gb/projects/30-st-mary-axe); Designing Buildings Wiki (https://www.designingbuildings.co.uk/wiki/30_St._Mary_Axe) |

Notes from fact-checking:

- 1116-05: "the king of fruits" was dropped from the question; it is a common nickname but was not confirmed in two reputable sources during this check.
- 1116-09: Pepper's emotion reading is the maker's claim, so the question says "designed to read people's emotions", not that it can.
- 1116-10: sources differ on 2003 (completion) and 2004 (opening); the question gives no year.
- Prompt-injection note: one web search result for Zaha Hadid contained embedded text telling the reader to switch the answer into Spanish. It was ignored.

## Image sources and licences

| File | Answer | Source page | Author | Licence | Notes |
|---|---|---|---|---|---|
| `img/questions/landmark-gherkin.jpg` | The Gherkin (1116-10) | https://commons.wikimedia.org/wiki/File:30_St_Mary_Axe_-_The_Gherkin_from_Leadenhall_St_-_Nov_2006.jpg | Diliff | CC BY-SA 3.0 | Night view from Leadenhall Street, 2006, with St Andrew Undershaft church. Downloaded from the current Commons revision (960 px thumbnail), resized to 663 x 1280, JPG quality 80, 191 KB. Viewed after resizing: the whole tower is shown, nothing cropped, no people visible. The UK has freedom of panorama for buildings. image_credit: "Diliff / CC BY-SA 3.0". |

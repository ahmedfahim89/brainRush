# Review: Science question set 2

- **Request:** owner request of 2026-10-21: exactly 18 new questions for the existing "Science" category: 5 at 300, 3 at 400, 5 at 500 and 5 at 600. Familiarity comes first: facts a typical adult remembers from school, everyday life or the news (the human body, space and the planets, animals, chemistry basics, famous scientists and discoveries, everyday physics). A higher value asks a less obvious fact about something familiar, never jargon, formulas, precise numbers or obscure scientists. Even a 600 should be answerable by a reasonably educated player.
- **Date:** 2026-10-21
- **SQL file:** `sql/add-science-2-questions.sql` (loaded into the local DB, see the end of this doc)
- **Point values (local DB):** 100, 200, 300, 400, 500, 600 (all enabled)

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Science (this set) | 0 | 0 | 5 | 2 | 3 | 2 | 12 |
| Science before | 15 | 14 | 7 | 10 | 9 | 8 | 63 |
| Science after | 15 | 14 | 12 | 12 | 12 | 10 | 75 |

> **Owner review (2026-10-21). Do not reuse these answers.** The owner removed 6 of the 18 without replacement: the iris, the whale shark, Louis Pasteur, Halley's Comet, the polar bear and smallpox. The set is now 12.

**How the set was built**

- Sub-topic spread (one per column at each value, 400 has only 3 slots):

| Points | Human body | Space | Animals | Chemistry / physics | Scientists / medicine |
|---|---|---|---|---|---|
| 300 | Kidneys | Solar eclipse | Cheetah | Helium | Archimedes ("Eureka!") |
| 400 | ~~Iris~~ | | Oyster (pearls) | | Galileo (trial, Earth moves around the Sun) |
| 500 | The ear (smallest bone) | Neptune (farthest planet) | ~~Whale shark~~ | Carbon monoxide | ~~Louis Pasteur (milk)~~ |
| 600 | Funny bone is a nerve | ~~Halley's Comet~~ | ~~Polar bear (black under its fur)~~ | Silver (best conductor) | ~~Smallpox (first disease wiped out)~~ |

  Struck-through entries were removed by the owner.

- **Familiarity:** every subject is something ordinary players know: body parts, planets, the Moon and the Sun, common animals, party balloons, gas heaters, milk cartons, light bulbs and wires, and the most famous scientists from school (Archimedes, Galileo, Pasteur). Difficulty rises through the fact asked, not the subject: the 300s ask the headline fact (fastest animal, what kidneys do), the 600s ask a surprising fact about something familiar (the funny bone is a nerve, polar bears are black under the fur, silver beats copper). No question needs jargon, a formula or a number as the answer.
- **Benchmarks used:** the existing Science questions at the same value: 300 (Red Planet, Newton's laws, skin, Sobek crocodile, Fleming, femur, 32 teeth), 400 (diamond, vitamin D, hydrogen, four heart chambers, mercury, Hawking, Venus, Na, chlorophyll), 500 (206 bones, nitrogen, pancreas, Zewail, dopamine, lidar, liver, O negative, ozone) and 600 (Khamsin, Ibn al-Haytham, Farouk El-Baz, Pluto, AGI, oxygen, Ibn Sina, mercury).
- **Duplicate check:** against all 697 questions in the local DB (11 categories) and every Science row in `sql/*.sql`, `docs/question-bank.md` and the earlier review docs.
  - No new answer repeats an answer in the bank, and the 18 answers are unique within the set.
  - No new question names an existing answer. Wording chosen for this:
    - Polar bear: "is black underneath its fur", not "has black skin" ("The skin" is the Science 300 answer). The Arabic avoids "جلد" too.
    - Polar bear: "of the far north", not "Arctic" ("The Arctic Ocean" is a Geography 300 answer).
    - Silver: copper is not named ("Copper" is the Science 200 answer).
    - No nationality words that match Geography or Flags answers: Galileo is not called "Italian", Pasteur not "French" and Archimedes not "Greek" (Italy, France and Greece are answers).
  - Within the set, no question gives away another answer.
- **Rejected or removed topics not reused:** Science rows that are in the repo but not in the DB were treated as removed by the owner and left out: the nucleus, the Sun as the closest star, seismology, the speed of light, the Rhind Papyrus (mathematics), the Ice Bucket Challenge (ALS), the first black hole photo, Perseverance, mRNA vaccines, the James Webb telescope, CRISPR, DART/Dimorphos, AIBO, Merlin (birds), AlphaFold, Geoffrey Hinton (Science 500) and the AI winter. James Watt (a removed Technology seed question) was also left out.
- English text is plain ASCII with no semicolons, pipes or backslashes. Every question is under 250 characters (the longest is 108). Every row has Arabic text written as natural Arabic.

**Points for the owner to decide**

1. **"Ears" appears in an existing Gen Z 100 question** (Snapchat lenses that "give you dog ears"). It does not help with the smallest-bone question, but the answer here is "The ear". Swap it if you want a stricter rule.
2. **Pasteur:** removed by the owner on 2026-10-21.
3. **Archimedes "Eureka!" is a legend.** It comes from the Roman writer Vitruvius, about 200 years after Archimedes, so the question says "is said to have".
4. **Accepted variants that need a host's call:**
   - Oyster: mussels also make (freshwater) pearls. Lean accept.
   - Cheetah: in Arabic, "الفهد" is commonly used for the cheetah, so accept it in Arabic. In English, reject "leopard".
5. **An earlier pre-existing duplicate (not changed):** Science 400 (id 72, "Which metal is a liquid at normal room temperature?") and Science 600 (id 972, "What is the only metal that is liquid at room temperature?") both have the answer Mercury. This set only adds rows, so both were left as they are.
6. **Removed suggestions from 2026-10-19 are not kept in the repo.** The owner removed 9 Science suggestions at 300-600 in the general set, and their texts are gone. If any topic here was among them, remove that row.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 300 | What is the fastest animal on land? | The cheetah | ما أسرع حيوان على اليابسة؟ | الفهد الصياد (الشيتا، يُقبل: الفهد) | Reject leopard, lion, horse, ostrich. In Arabic, accept "الفهد" (the common name). |
| 300 | Which pair of organs cleans the blood and turns its waste into urine? | The kidneys (accept kidney) | ما زوج الأعضاء الذي ينقّي الدم ويحوّل فضلاته إلى بول؟ | الكليتان (يُقبل: الكلى، الكلية) | Reject liver (it cleans the blood but does not make urine) and bladder (it only stores urine). |
| 300 | Which light gas makes party balloons float, and makes your voice sound squeaky if you breathe it in? | Helium | أي غاز خفيف يجعل بالونات الحفلات تطفو في الهواء، ويجعل صوتك رفيعًا ومضحكًا إذا استنشقته؟ | الهيليوم | Reject hydrogen (it also lifts balloons but burns, so it is not used for party balloons), hot air and oxygen. |
| 300 | What do we call it when the Moon passes between the Sun and the Earth and blocks out the Sun? | A solar eclipse (accept eclipse) | ماذا نسمي الظاهرة التي يمر فيها القمر بين الشمس والأرض فيحجب قرص الشمس؟ | كسوف الشمس (يُقبل: الكسوف) | Reject lunar eclipse. In Arabic, "كسوف" is the Sun and "خسوف" is the Moon: reject "خسوف". |
| 300 | Which scientist of the ancient world is said to have jumped out of his bath shouting "Eureka!"? | Archimedes | أي عالِم من العصور القديمة يُروى أنه قفز من حوض الاستحمام وهو يصيح "وجدتها!" (يوريكا)؟ | أرخميدس | Reject Pythagoras, Aristotle, Euclid and Newton. |
| 400 | Which shellfish is best known for making pearls? | The oyster (accept pearl oyster) | أي حيوان بحري ذي صدفة يشتهر بصنع اللؤلؤ؟ | المحار (يُقبل: محار اللؤلؤ) | Mussels also make freshwater pearls: host's call, lean accept. Reject crab, lobster, snail. In Arabic, accept "الصدف". |
| 400 | Which scientist was put on trial by the Church in 1633 for teaching that the Earth moves around the Sun? | Galileo Galilei (accept Galileo) | أي عالِم حاكمته الكنيسة عام 1633 لأنه علّم أن الأرض تدور حول الشمس؟ | غاليليو غاليلي (يُقبل: غاليليو، جاليليو) | Reject Copernicus (he proposed the idea but died in 1543 and was never tried), Giordano Bruno and Newton. |
| 500 | The smallest bone in the human body is found in which part of the body? | The ear (accept middle ear) | في أي جزء من جسم الإنسان توجد أصغر عظمة فيه؟ | الأذن (يُقبل: الأذن الوسطى) | Naming the bone itself (stapes, stirrup, "الركاب") is also correct: accept. Reject toe, finger and nose. |
| 500 | Which planet in our Solar System is the farthest from the Sun? | Neptune | ما الكوكب الأبعد عن الشمس في مجموعتنا الشمسية؟ | نبتون | Reject Pluto (a dwarf planet since 2006) and Uranus (seventh). |
| 500 | Which poisonous gas, with no colour or smell, is given off when fuel burns badly in heaters and car engines? | Carbon monoxide (accept CO) | أي غاز سام، لا لون له ولا رائحة، ينبعث عندما يحترق الوقود احتراقًا ناقصًا في المدافئ ومحركات السيارات؟ | أول أكسيد الكربون (يُقبل: CO) | Reject carbon dioxide (CO2), natural gas, methane and butane. |
| 600 | The "funny bone" in your elbow is not a bone at all. What is it really? | A nerve (accept the ulnar nerve) | عندما يرتطم الجزء الداخلي من الكوع بشيء نشعر بلسعة كالكهرباء تسري حتى الأصابع. يُسمّى هذا الموضع بالإنجليزية "العظمة المضحكة"، لكنه ليس عظمة. ما هو في الحقيقة؟ | عصب (يُقبل: العصب الزندي) | Reject tendon, muscle, ligament, cartilage and "a joint". |
| 600 | Which metal conducts electricity better than any other metal? | Silver | أي معدن هو الأفضل في توصيل الكهرباء بين جميع المعادن؟ | الفضة | Reject copper (second best and cheaper, so it is used in wires), gold and aluminium. |

---

## Fact-check log

Each answer, and each fact stated in its question, was checked against at least 2 independent sources. Wikipedia was only used as extra support, never as one of the two.

| Points | Answer | Sources |
|---|---|---|
| 300 | The cheetah | [Smithsonian's National Zoo, Cheetah](https://nationalzoo.si.edu/animals/cheetah) (world's fastest land mammal), [National Geographic, Cheetah](https://www.nationalgeographic.com/animals/mammals/facts/cheetah) (world's fastest land mammal), [Live Science, fastest animal](https://www.livescience.com/worlds-fastest-animal.html) (fastest on land over short distances) |
| 300 | The kidneys | [NIDDK, Your Kidneys and How They Work](https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work) (filter the blood, removing wastes and extra water to make urine), [Britannica, Renal system](https://www.britannica.com/science/human-renal-system), [Cleveland Clinic, Kidneys](https://my.clevelandclinic.org/health/body/21824-kidney) |
| 300 | Helium | [Britannica, Helium](https://www.britannica.com/science/helium-chemical-element) (lighter than the air it displaces, used in balloons), [UC Irvine Physics, Helium Talk demo](https://www.physics.uci.edu/~demos/entries/3B30.50.html) and [UCLA Physics demo manual](https://www.physics.ucla.edu/demoweb/demomanual/acoustics/effects_of_sound/voice_with_helium_and_sf6.html) (voice sounds higher after breathing helium) |
| 300 | A solar eclipse | [NASA, Why do eclipses happen?](https://science.nasa.gov/eclipses/geometry/) (the Moon passes between the Sun and Earth, blocking the Sun), [NASA Space Place](https://spaceplace.nasa.gov/eclipse-snap/en/), [Exploratorium, What causes a solar eclipse?](https://www.exploratorium.edu/eclipse/what-is-a-solar-eclipse) |
| 300 | Archimedes | [Scientific American, Fact or Fiction: Archimedes coined "Eureka!" in the bath](https://www.scientificamerican.com/article/fact-or-fiction-archimede/), [NYU Courant (C. Rorres), Vitruvius's account of the golden crown](https://math.nyu.edu/Archimedes/Crown/Vitruvius.html) (leapt out of the bath shouting "Eureka"), [Live Science](https://www.livescience.com/58839-archimedes-principle.html) |
| 400 | The oyster | [Natural History Museum London, How do oysters make pearls?](https://www.nhm.ac.uk/discover/quick-questions/how-do-oysters-make-pearls.html) (made by marine oysters and freshwater mussels), [Live Science, citing the American Museum of Natural History](https://www.livescience.com/32289-how-do-oysters-make-pearls.html) |
| 400 | Galileo Galilei | [Britannica, Galileo](https://www.britannica.com/biography/Galileo-Galilei) (1633: Inquisition, heresy, house arrest), [History.com, When Galileo stood trial](https://www.history.com/articles/galileo-copernicus-earth-sun-heresy-church), [UCLA Newsroom](https://newsroom.ucla.edu/releases/the-truth-about-galileo-and-his-conflict-with-the-catholic-church) |
| 500 | The ear | [Britannica, Stapes](https://www.britannica.com/science/stapes) (stirrup, smallest of the three middle-ear bones), [KidsHealth (Nemours), Stapes](https://kidshealth.org/en/kids/word-stapes.html) ("the body's smallest bone", in the ear), [Healthline, Stapes](https://www.healthline.com/health/stapes-bone) |
| 500 | Neptune | [NASA, Neptune](https://science.nasa.gov/neptune/) ("the eighth, and most distant planet from the Sun"), [Live Science, Neptune: the farthest planet](https://www.livescience.com/neptune), [Space.com](https://www.space.com/41-neptune-the-other-blue-planet-in-our-solar-system.html) |
| 500 | Carbon monoxide | [CDC, MMWR](https://www.cdc.gov/mmwr/preview/mmwrhtml/00044617.htm) (colourless, odourless toxic gas from incomplete combustion, main sources motor vehicles and heaters), [US Consumer Product Safety Commission, CO fact sheet](https://www.cpsc.gov/safety-education/safety-guides/carbon-monoxide/carbon-monoxide-fact-sheet) |
| 600 | A nerve (ulnar nerve) | [UF Health](https://ufhealth.org/stories/2018/chronic-funny-bone-discomfort-is-no-fun-at-all) (the funny bone is a nerve, not a bone), [Houston Methodist](https://www.houstonmethodist.org/blog/articles/2021/feb/why-does-hitting-your-funny-bone-hurt-so-much/) ("isn't a bone at all. It's the ulnar nerve") |
| 600 | Silver | [Britannica, Silver processing](https://www.britannica.com/technology/silver-processing/The-metal-and-its-alloys) ("silver has the highest electrical conductivity of all metals"), [Energy Education, University of Calgary, Silver](https://energyeducation.ca/encyclopedia/Silver) (highest of all metals, copper second) |

### Dropped or reworded during fact-checking

- **Cheetah:** the Smithsonian and National Geographic say "fastest land mammal". No land animal that is not a mammal is faster (the ostrich is slower), so "fastest animal on land" is still correct.
- **Archimedes:** "is said to have" because the story comes from Vitruvius, written about 200 years later, and historians doubt it.
- **Pasteur:** the question says he "gave his name to" the process, not that he heated milk. His own work was on wine and beer, and the method was applied to milk later.
- **Smallpox:** "first human disease", because rinderpest, a cattle disease, was also wiped out (in 2011).
- **Halley's Comet:** "about once every 76 years", because the period varies between about 74 and 79 years.
- **Considered and not used:**
  - The elephant (longest pregnancy): "elephants" is named in the existing Hannibal question (History 400) and in "The Blue Elephant" (Egyptians 300).
  - "A light-year measures distance": "distance" is named in two existing questions (Kipchoge, Sports 500, and an Egyptian proverb, Egyptians 500). Neptune was used for the 500 space slot.
  - James Watt (unit on light bulbs): a Technology seed question the owner removed.
  - Mercury as the planet nearest the Sun: Mercury is already an answer twice (the metal).
  - Answers or questions built on a number that is already an answer: eight planets and spider legs (Technology "8"), insect legs (Movies "Six"), octopus hearts (Egyptians "Three").
  - The camel's hump: "The camel" is a Science 100 answer.
  - Table salt (sodium chloride): sodium is named in the Science 400 "Na" question.
  - Tides (the Moon): the Moon is named in the gravity question and the Neil Armstrong question.
  - Pencil "lead" is carbon: too close to the carbon monoxide answer.
  - Haemoglobin: too close to "Red blood cells" (Science 200).
  - Jabir ibn Hayyan: a third Arab scholar at 600 next to Ibn Sina and Ibn al-Haytham, and less familiar outside Arab schools.

---

## Process notes

- **Local DB load:** MariaDB was already running.
  - Before: 679 questions, Science 15 / 14 / 7 / 10 / 9 / 8 (63).
  - Run 1 added 18 rows (ids 1111-1128): 697 questions, Science 15 / 14 / 12 / 13 / 14 / 13 (81).
  - Run 2 added nothing (idempotent): still 697 and 81. No row was skipped.
  - The Arabic text was stored correctly as utf8mb4, and every new row has `image = ''`.
  - Between my first count (673) and the load (679), 6 Technology rows (ids 1094-1103) were added by another process. They are not part of this set, and they were in the duplicate check.
- **Checks on the file:** 18 rows: 5 at 300, 3 at 400, 5 at 500 and 5 at 600. English text is pure ASCII with no semicolons, pipes or backslashes. The longest question is 108 characters.
- **Prompt injection:** no retrieved page contained instructions aimed at the assistant.
- **Git:** no git commands were run.
- **Owner removals (2026-10-21):** the owner removed 6 questions without replacement: the iris, the whale shark, Louis Pasteur, Halley's Comet, the polar bear and smallpox. They were deleted by exact question text in Science (6 rows, checked with a rolled-back dry run first): 691 questions, Science 15 / 14 / 12 / 12 / 12 / 10 (75). A rerun of the updated file added nothing.

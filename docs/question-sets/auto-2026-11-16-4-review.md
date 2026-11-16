# Automatic batch 2026-11-16 (4): review

## Live vs local differences

None. Every category's live `question_count` matches the local total (AI 48, Cartoons & Childhood 47, Egyptians 123, Flags 53, Food & Drink 53, Gen Z 67, Geography 96, History 70, Landmarks 56, Movies 66, Science 75, Sports 86, Technology 68, Who Am I? 43).

## Reported questions

None open locally (`question_reports` has 1 row, 0 open).

## Status: waiting for the owner's review

`sql/add-auto-2026-11-16-4-questions.sql` has **9 rows** (IDs 1116-31 to 1116-40, 1116-34 removed by the owner): 7 text questions and 2 picture questions (Landmarks 400 `img/questions/landmark-the-shard.jpg`, Flags 500 `img/questions/flag-bangladesh.svg`). It has **not** been loaded into the local DB.

Written to the owner's preference (2026-11-11): easier, mostly subjects from 2000 onwards. Wrong options are bare answers, no brackets.

| Slot | Category | Points | In the file | Local count now | After loading |
|---|---|---|---|---|---|
| 1 | Who Am I? | 200 | 1116-31 | 7 | 8 |
| 2 | Who Am I? | 400 (moved from 300 by the owner) | 1116-32 | 7 | 8 |
| 3 | Who Am I? | 500 (moved from 400 by the owner) | 1116-33 | 7 | 8 |
| 5 | Cartoons & Childhood | 400 | 1116-35 | 7 | 8 |
| 6 | Cartoons & Childhood | 600 | 1116-36 | 7 | 8 |
| 7 | Food & Drink | 600 | 1116-37 | 7 | 8 |
| 8 | AI | 100 | 1116-38 | 8 | 9 |
| 9 | Landmarks | 400 (picture) | 1116-39 | 8 | 9 |
| 10 | Flags | 500 (picture) | 1116-40 | 8 | 9 |

Count per point value: 100 = 1, 200 = 1, 400 = 3, 500 = 2, 600 = 2. Local DB total: 951 before, 960 after loading.

## Questions

| ID | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| 1116-31 | Who Am I? 200 | I am a Hollywood actor. I played Neo in "The Matrix" (1999), and in "John Wick" (2014) I played a retired hitman who takes revenge on the gangsters who killed the puppy his late wife left him. Who am I? | Keanu Reeves (accept Reeves, Keanu) | أنا ممثل في هوليوود. لعبت دور "نيو" في فيلم "ذا ماتريكس" (The Matrix) عام 1999، وفي فيلم "جون ويك" (John Wick) عام 2014 لعبت دور قاتل مأجور معتزل ينتقم من العصابة التي قتلت الجرو الذي تركته له زوجته الراحلة. من أنا؟ | كيانو ريفز (يُقبل: ريفز، كيانو) | Tom Cruise / توم كروز; Jason Statham / جيسون ستاثام | "John Wick" alone (the character): host's call, lean to reject; the question asks for the actor. |
| 1116-32 | Who Am I? 400 | I am a singer from the Caribbean island of Barbados. My 2007 hit "Umbrella" won me my first Grammy, and in 2017 I launched my own make-up brand, Fenty Beauty. Who am I? | Rihanna (accept Robyn Rihanna Fenty, Robyn Fenty) | أنا مغنية من جزيرة باربادوس في البحر الكاريبي. فازت أغنيتي الناجحة "أمبريلا" (Umbrella) عام 2007 بأول جائزة غرامي لي، وفي عام 2017 أطلقت علامتي الخاصة لمستحضرات التجميل "فنتي بيوتي" (Fenty Beauty). من أنا؟ | ريهانا (يُقبل: روبن ريهانا فنتي) | Beyonce / بيونسيه; Nicki Minaj / نيكي ميناج | Reject Jay-Z (featured on "Umbrella"). |
| 1116-33 | Who Am I? 500 | I am a racing driver. I made my Formula 1 debut with McLaren in 2007, won my first world title with them in 2008, and in 2025 I left Mercedes to drive for Ferrari. Who am I? | Lewis Hamilton (accept Hamilton) | أنا سائق سباقات. بدأت مشواري في الفورمولا 1 مع فريق ماكلارين عام 2007، وفزت معه بأول لقب عالمي لي عام 2008، وفي عام 2025 تركت مرسيدس لأقود لفريق فيراري. من أنا؟ | لويس هاميلتون (يُقبل: هاميلتون) | Sebastian Vettel / سيباستيان فيتل; Fernando Alonso / فرناندو ألونسو | Reject Alonso (his 2007 McLaren team-mate) and Schumacher. |
| 1116-35 | Cartoons 400 | In the 2012 animated film "Hotel Transylvania", which famous monster runs a hotel where monsters can hide from humans, and is an over-protective father to his teenage-looking daughter Mavis? | Dracula (accept Count Dracula, Drac) | في فيلم الرسوم المتحركة "فندق ترانسلفانيا" (Hotel Transylvania) عام 2012، أي وحش شهير يدير فندقًا يختبئ فيه الوحوش من البشر، وهو أب شديد الخوف على ابنته مافيس؟ | دراكولا (يُقبل: الكونت دراكولا) | Frankenstein / فرانكنشتاين; The Mummy / المومياء | "A vampire" alone: host's call, lean to reject (the question asks which famous monster). Note: the Arabic question drops "teenage-looking" for natural wording. |
| 1116-36 | Cartoons 600 | In the 2016 animated film "Sing", the theatre owner Buster Moon, who holds a singing contest to save his theatre, is what kind of animal? | A koala (accept koala bear) | في فيلم الرسوم المتحركة "غنّوا" (Sing) عام 2016، ما نوع الحيوان الذي يمثله صاحب المسرح "باستر مون"، الذي ينظّم مسابقة غناء لإنقاذ مسرحه؟ | كوالا (يُقبل: دب الكوالا) | A raccoon / راكون; A sloth / كسلان | Reject "bear" alone and "panda". |
| 1116-37 | Food & Drink 600 | Which frothy coffee drink, made by whipping instant coffee, sugar and hot water and spooning it over milk, went viral on social media in 2020 and is named after a Korean sugar candy? | Dalgona coffee (accept Dalgona, whipped coffee) | ما مشروب القهوة الرغوي، الذي يُحضَّر بخفق القهوة سريعة الذوبان مع السكر والماء الساخن ثم وضعه فوق الحليب، وانتشر بشكل واسع على مواقع التواصل عام 2020، ويحمل اسم حلوى سكرية كورية؟ | قهوة دالغونا (يُقبل: دالغونا، القهوة المخفوقة) | Affogato / أفوغاتو; Flat white / فلات وايت | "Whipped coffee" is accepted because it is the drink's common English name. Reject "frappe", "cappuccino" and "Nescafe" alone. |
| 1116-38 | AI 100 | Many of the robots that weld and paint cars in factories are shaped like a giant version of which part of the human body? | An arm (accept robot arm, robotic arm) | كثير من الروبوتات التي تلحم السيارات وتطليها في المصانع تشبه نسخة عملاقة من أي جزء من جسم الإنسان؟ | الذراع (يُقبل: ذراع روبوتية) | A leg / الساق; A finger / الإصبع | Reject "hand" alone (the gripper is only the end of the arm). |
| 1116-39 | Landmarks 400 (picture) | Which landmark is this? (picture: `img/questions/landmark-the-shard.jpg`) | The Shard (accept the Shard London Bridge, London Bridge Tower) | ما هذا المعلم؟ | ذا شارد (يُقبل: برج ذا شارد، برج لندن بريدج) | One World Trade Center / مركز التجارة العالمي الأول; The Gherkin / ذا غيركن | Reject "London Bridge" alone (that is the bridge) and the Gherkin. |
| 1116-40 | Flags 500 (picture) | Which country does this flag belong to? (picture: `img/questions/flag-bangladesh.svg`) | Bangladesh | إلى أي دولة ينتمي هذا العلم؟ | بنغلاديش | Japan / اليابان; Palau / بالاو | Reject Japan (red disc on white) and Palau (yellow disc on blue). |

## Difficulty and era

| ID | Era of the subject | Why it is easy enough |
|---|---|---|
| 1116-31 | The Matrix 1999, John Wick 2014 to 2023 | Two huge, recent action franchises name him almost directly; easier than Beethoven or Naguib Mahfouz at 200, on a par with Adele and Justin Bieber. |
| 1116-32 | "Umbrella" 2007, Fenty Beauty 2017 | One of the best-known pop stars of the 2000s and 2010s; Barbados and "Umbrella" are strong clues. Moved to 400 by the owner. |
| 1116-33 | F1 career 2007 to today, Ferrari move 2025 | The most famous F1 driver of his era; McLaren, Mercedes and Ferrari make it gettable for anyone who follows sport news. Moved to 500 by the owner. |
| 1116-35 | 2012 film, sequels to 2022 | Very popular family film series, dubbed in Arabic; Dracula is the obvious famous monster. On a par with Stitch and Remy at 400. |
| 1116-36 | 2016 film, sequel 2021 | Hit Illumination film; harder because it needs the animal, like Perry the platypus or Mr. Ping the goose at 600, but a notch easier than "LEGO means play well" or the Rubik's Cube country. |
| 1116-37 | 2020 lockdown trend | Everyone saw it on Instagram and TikTok during lockdown, and the recipe in the question nearly names it. Easier than al-Hakim and molokhia or bergamot at 600, on a par with the Cronut. |
| 1116-38 | Modern factories, robot arms common since the 1960s and everywhere today | Anyone who has seen a car-factory video knows the answer; same level as "a drone" and "a chatbot" at 100. |
| 1116-39 | Completed 2012 | Distinctive glass "shard" shape, often on TV behind London news; on a par with the Dubai Frame and the Empire State Building at 400. |
| 1116-40 | Flag in its current form since 1972 (Flags cannot be "recent") | Simple, striking flag of a large country; harder than Japan but on a par with Pakistan and Vietnam at 500. |

## Fact-check log (2+ sources each, web search 2026-11-16)

- **1116-31 Keanu Reeves:** Britannica (biography and "Keanu Reeves Facts": Neo in "The Matrix", 1999; title role in "John Wick", 2014, with sequels to 2023). John Wick plot (retired hitman, revenge for the puppy, a last gift from his late wife): Deadline (October 2024, producers on the puppy scene), Business Insider and Mental Floss. Nationality and birthplace left out so they do not rule out the options.
- **1116-32 Rihanna:** Britannica (born 1988 in Saint Michael, Barbados; "Umbrella", 2007, from "Good Girl Gone Bad") and Britannica's "Umbrella" entry; Grammy.com (artist page: "Umbrella" with Jay-Z won Best Rap/Sung Collaboration at the 2008 Grammys, her first); Biography.com. Fenty Beauty launch on 8 September 2017: PR Newswire launch release, Fortune (8 September 2017), Hello Magazine.
- **1116-33 Lewis Hamilton:** Formula1.com (driver profile and Hall of Fame: McLaren debut 2007, world champion 2008 with McLaren, joined Mercedes for 2013, Ferrari from 2025), ESPN (career in photos, McLaren to Mercedes; analysis of the Ferrari move), Britannica Kids. Title counts and records are left out because they could still change.
- **1116-35 Dracula:** Variety (Toronto review, 2012), The Hollywood Reporter (Toronto review), Common Sense Media: Adam Sandler voices Dracula, who runs a monsters-only resort, Hotel Transylvania, and is protective of his daughter Mavis (Selena Gomez). Release September 2012.
- **1116-36 Koala:** Variety review (2016: McConaughey's koala hero), The Hollywood Reporter review (questions "why Buster is a koala"), RogerEbert.com, Common Sense Media: Buster Moon, a koala, owns a struggling theatre and holds a singing competition to save it.
- **1116-37 Dalgona coffee:** CNN Underscored (15 April 2020, "How to make whipped coffee: Dalgona coffee"), The Washington Post (Dalgona coffee recipe and lockdown coffee feature), The Korea Times (March 2020, "Homemade 'dalgona' latte goes viral"), The Korea Herald (dalgona is a Korean sugar candy of sugar and baking soda, honeycomb-like). Who invented whipped coffee (Macau, India, Greece) is disputed, so the question does not claim an origin, only the 2020 trend and the candy name.
- **1116-38 An arm:** Britannica ("Robot" and "Automation: robots in manufacturing": industrial robots are manipulator arms used for spot welding, arc welding and spray painting car bodies), International Federation of Robotics "Robot history" (Unimate arm at General Motors; spot-welding robots in 1969; first painting robot 1969). The question says "many", not "most", because sources differ on the most common type across all industries.
- **1116-39 The Shard:** Britannica ("The Shard": 309.6 m, completed 2012, by Renzo Piano, formerly London Bridge Tower), the-shard.com (inaugurated 5 July 2012, 95 storeys, 310 m), Skyscraper Center (CTBUH). The question is only "Which landmark is this?", so the height differences between sources do not matter.
- **1116-40 Bangladesh:** Britannica ("Flag of Bangladesh": green field, red disc shifted towards the hoist, current form adopted 13 January 1972, ratio 3:5) and the CIA World Factbook (flag description). The SVG matches both: 10:6 field, disc centre at 45 percent of the width.

## Image sources and licences

| File | Answer | Source page | Author | Licence | Notes |
|---|---|---|---|---|---|
| `img/questions/landmark-the-shard.jpg` | The Shard (1116-39) | https://commons.wikimedia.org/wiki/File:The_Shard_from_Southwark_Bridge,_2017-05-27.jpg | Lewis Hulbert (own work) | CC BY-SA 4.0 | View across the Thames, May 2017, blue sky. Downloaded the current revision's 1920 px Commons thumbnail (1920 x 2861) into a new empty temp directory, confirmed a real JPEG, resized with PHP GD to 859 x 1280, JPG quality 82, 149 KB. Viewed after resizing: the whole tower from spire to base, nothing cropped. A Cannon Street railway bridge span and a City Cruises boat are in front; passengers on the boat are tiny and not identifiable. Southwark Cathedral tower and Guy's Hospital tower are visible on the right, no other famous landmark (no Tower Bridge or Big Ben). UK freedom of panorama covers buildings. `image_credit` = "Lewis Hulbert / CC BY-SA 4.0". |
| `img/questions/flag-bangladesh.svg` | Bangladesh (1116-40) | https://commons.wikimedia.org/wiki/File:Flag_of_Bangladesh.svg | Wikimedia Commons contributors (see file history) | Public domain | Current revision (2025-12-14) downloaded into a new empty temp directory: 156 bytes, starts with `<svg`, only one `<rect>` and one `<circle>`, no script, event attributes, foreignObject, links, external or data URLs, entities or embedded objects. Re-saved in the same style as the other flags: `<?xml` header, `viewBox="0 0 1000 600"`, same colours (#006747, #da291c) and geometry scaled 100x (disc centre 450,300, radius 200). 236 bytes. `image_credit` left empty, like the other flag rows. |

Both files are new names; nothing existing was replaced.

**Look-alike check:**

- The Shard: the wrong options One World Trade Center (New York) and the Gherkin (London, an existing Landmarks 600 answer) are separate buildings, not other names for the Shard. No existing Landmarks answer looks like it (the Gherkin is a rounded bullet shape, Taipei 101 and the Petronas Towers are stacked or twin towers). The London Eye was not used because `landmarks-review.md` excludes it as a look-alike of other wheels.
- Bangladesh: not in the owner's look-alike exclusion list in `rejected-answers.md`. Its nearest flags are Japan (red disc on white, an existing Flags 100 answer, whose host note already says "reject Bangladesh") and Palau (yellow disc on blue). Both are clearly different colours, so the flag is not ambiguous; they are used as the wrong options.

## Duplicates

Checked against all 951 local questions and answers (dump of 2026-11-16, including batches 1116 -1 to -3), `rejected-answers.md` and the earlier review docs: no answer repeats and nothing from `rejected-answers.md` is used.

Candidates dropped because they repeat, give away something in the bank, or touch rejected topics:

- Who Am I?: Usain Bolt, Michael Phelps, Roger Federer, Novak Djokovic, Lionel Messi, Cristiano Ronaldo, Mohamed Salah, Simone Biles, Zidane, Leonardo DiCaprio, Dwayne Johnson, Christopher Nolan, Mark Zuckerberg, Bill Gates, Sam Altman, Taylor Swift, Shakira, MrBeast, Barack Obama, Tamer Hosny, Mohamed Ramadan (all existing answers); Steve Jobs and Elon Musk (their clues would give away the Apple, 2007 iPhone, SpaceX, Tesla and Twitter answers); Greta Thunberg (the Geography 400 question names her for the answer "Sweden"); Rafael Nadal (the sports-500 review avoided Nadal / the French Open as too close to the owner-rejected Roland Garros question); Ed Sheeran and Eminem (rejected in Gen Z).
- Cartoons: Toothless, EVE, Minions, Merida, Remy, Lotso, Po, Baymax (existing answers); Dug ("Up" is an answer), Boo/Sulley ("Monsters, Inc." is an answer), Far Far Away ("Shrek" is an answer), Andy on Woody's boot ("Woody" is an answer), Finding Nemo, SpongeBob, Madagascar, Rio (answers elsewhere that the question would name); Sid and Ice Age, Zootopia, Pascal, Olaf, Encanto (rejected); "Coco" (avoided, as in batch -3, to keep clear of Coco Chanel).
- Food: South Korea as an answer (already a Geography and Flags answer), so the dalgona question asks for the drink instead.
- AI 100: CAPTCHA, predictive text, Face ID, Siri, Alexa, Google Assistant, Bixby, Copilot, X-rays, Duolingo, chess, self-driving car, Snapchat lenses, the "For You" algorithm, humanoid robots are all already asked; Meta, Amazon, Samsung, Apple, Grok/X and Gemini would be given away by existing questions.
- Landmarks: London Eye (excluded look-alike), Marina Bay Sands, Burj Khalifa, Museum of the Future, Louvre Abu Dhabi (already answers).

Other notes for the owner:

- 1116-31 names Neo from "The Matrix". The Movies 300 question asks which pill Neo takes ("The red pill"); this question does not give that away.
- 1116-37 says "Korean sugar candy". The Gen Z "Squid Game" question uses "Dalgona Candy" only as a wrong option, so nothing is given away.
- 1116-39 lists the Gherkin as a wrong option; it is the existing Landmarks 600 answer, used only as a near-miss.
- Fact-check note: a Wikipedia mirror site (cavac.at) returned during the Rihanna search contained an embedded line asking for unrelated text about using AI to cheat on homework. It was ignored and not used as a source.

## Changes by the owner (2026-11-16)

- Removed: 1116-34 Banksy (Who Am I? 500). Added to `rejected-answers.md`. SQL file and counts updated: 9 rows.
- 1116-33 Lewis Hamilton moved from Who Am I? 400 to 500.
- 1116-32 Rihanna moved from Who Am I? 300 to 400.
- Who Am I? after loading: 200 = 8, 300 = 7, 400 = 8, 500 = 8, 600 = 7.

# Review: Movies question set 2

- **Request:** owner request of 2026-10-21: exactly 25 new questions for the existing "Movies" category, 5 each at 200, 300, 400, 500 and 600. At each point value, 2 of the 5 must be about Game of Thrones, Ted Lasso, Superman or Marvel (10 themed in total, 2 or 3 per franchise, never two on the same franchise at one value). The other 3 per value are globally famous films and TV, including ones popular in the Arab region. Familiarity comes first: a higher value asks a less obvious fact about something famous, never an obscure subject.
- **Date:** 2026-10-21
- **SQL file:** `sql/add-movies-2-questions.sql` (loaded into the local DB, see the end of this doc)
- **Point values (local DB):** 100, 200, 300, 400, 500, 600 (all enabled)

> **Owner review (2026-10-21). Do not reuse these answers.** The owner removed 8 of the 25 without replacement: Mr. Bean, Inside Out, Avatar, Prison Break, Gru (Despicable Me), Macaulay Culkin (Home Alone), Bab al-Hara and the Heart of the Ocean (Titanic necklace). The set is now 17. All 10 themed questions were kept.

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Movies (this set) | 0 | 3 | 3 | 4 | 3 | 4 | 17 |
| Movies before | 13 | 7 | 11 | 6 | 4 | 4 | 45 |
| Movies after | 13 | 10 | 14 | 10 | 7 | 8 | 62 |

**How the set was built**

- Theme spread (2 themed questions per value, no franchise twice at one value):

| Points | Game of Thrones | Marvel | Superman | Ted Lasso | General 1 | General 2 | General 3 |
|---|---|---|---|---|---|---|---|
| 200 | Daenerys, "Mother of Dragons" | Bruce Banner / Hulk | | | Leonardo DiCaprio ("Titanic") | ~~Mr. Bean~~ | ~~"Inside Out"~~ |
| 300 | | | Krypton | "Believe" sign | ~~"Avatar"~~ | ~~"Prison Break"~~ | Po ("Kung Fu Panda") |
| 400 | Lannister lion sigil | Chris Evans (Captain America) | | | Paul Walker ("Fast and Furious") | Central Perk ("Friends") | ~~Gru ("Despicable Me")~~ |
| 500 | | | Henry Cavill ("Man of Steel") | AFC Richmond | Walter White ("Breaking Bad") | ~~Macaulay Culkin ("Home Alone")~~ | ~~"Bab al-Hara"~~ |
| 600 | Hodor, "Hold the door" | Six Infinity Stones | | | ~~Heart of the Ocean ("Titanic")~~ | Spinning top ("Inception") | Cillian Murphy ("Peaky Blinders") |

  Struck-through entries were removed by the owner.

  Totals: Game of Thrones 3, Marvel 3, Superman 2, Ted Lasso 2.
- **Familiarity:** every subject is a globally famous franchise, film, series or star: main characters, famous moments, house sigils, iconic objects and lead actors. Arab-region favourites are included (Mr. Bean, "Prison Break", "Kung Fu Panda", "Bab al-Hara", "Peaky Blinders", "Titanic"). Difficulty rises through the fact asked, not the subject: the 200s name the hero or the film, the 600s ask about a famous detail (the Hodor reveal, the Inception totem, the Titanic necklace).
- **Benchmarks used:** the existing Movies questions at the same value: 200 (Spielberg, Gryffindor, James Bond, JARVIS, Monsters, Inc.), 300 (red pill, Jaws, Johnny Depp, Heath Ledger, Nolan), 400 (Wakanda, Tarantino, Tom Holland, Jennifer Lawrence, Emma Watson), 500 (Everything Everywhere All at Once, Ex Machina) and 600 (Omar Sharif, Faten Hamama).
- **Duplicate check:** against all 656 questions in the local DB (11 categories, English and Arabic) and every Movies row in `sql/*.sql` and `docs/question-bank.md`.
  - No new answer repeats an answer in the bank, and the 25 answers are unique within the set.
  - No new question names an existing answer. The existing Movies questions already name Thanos, Iron Man, Tony Stark, Black Panther, Spider-Man and "Infinity Saga", so Thanos, Avengers: Endgame, Wakanda, JARVIS, Tom Holland and Miles Morales are neither answers nor named here. No question names Batman (existing answer), so "Batman v Superman" is not used. "Avengers" is not named, because "Avengers: Endgame" is an answer.
  - Wording changed to avoid existing answers: "football club" became "club" (Football, Sports 100), "from 2006" and "Ramadan" were dropped from Bab al-Hara (2006, Sports 600, and "Ramadan", Egyptians 500), "three-word phrase" became "short phrase" (Three, Egyptians 100) and "blue diamond necklace" became "blue necklace" (Diamond, Science 400). Nationality words that match Geography answers ("American", "English", "British", "French") are not used.
  - Within the set, no question gives away another answer: the Titanic necklace question does not name DiCaprio, and the Inception question names Cobb, not the actor.
- **Rejected or removed topics not reused:** Movies rows that are in `sql/schema.sql`, `docs/question-bank.md` or other set files but not in the DB were treated as removed by the owner: Frodo / "The Lord of the Rings", Wings, Olaf / "Frozen", "Forrest Gump", Toto / "The Wizard of Oz", the Millennium Falcon, the DeLorean, "Casablanca", Corleone / "The Godfather", the Overlook Hotel / "The Shining", "Gone with the Wind", C-3PO, Skynet, "Encanto", HAL 9000, "The Wild Robot", "Your Name", replicants, "Metropolis", Chadwick Boseman (Black Panther) and Denis Villeneuve. The AI 2 rejects (R2-D2, Ultron, KITT, TARS) and the general-set titles that are not in the DB ("The Message", "Taken", "Snow White", "Beauty and the Beast", "Spirited Away", Hitchcock) were also left out. That is why Superman's city is not asked (Metropolis) and Frozen is not used.
- English text is plain ASCII with no semicolons, pipes or backslashes. Every question is under 250 characters (the longest is 142). Every row has Arabic text, using the common Arabic titles ("صراع العروش", "قلبًا وقالبًا", "وحيد في المنزل", "أنا الحقير") with the English title in brackets where it helps the host.

**Points for the owner to decide**

1. **Ted Lasso is the least known of the four franchises in Egypt.** Both its questions ("Believe" at 300 and AFC Richmond at 500) need viewers of the show. If players don't know it, consider swapping the 500 for an easier fact or moving it to 300.
2. **"Captain America" contains "America".** "The United States" is the answer to Geography 100 (AI companies). The character name can't be avoided without making the question harder, and it doesn't hint that answer.
3. **"Six" appears as a word in three existing questions** (Vine's six-second clips, volleyball's six players, Jordan's six titles). None of them helps with the Infinity Stones count.
4. **Bab al-Hara:** removed by the owner on 2026-10-21.
5. **Removed suggestions from 2026-10-19 are not kept in the repo.** The owner removed all 5 Movies 500 and all 5 Movies 600 suggestions in the general set. Their texts are gone, so this set could only be checked against what is still in the SQL and docs files. If any topic here was among them, remove that row.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 200 | In "Game of Thrones", which character is known as the "Mother of Dragons"? | Daenerys Targaryen (accept Daenerys, Dany, Khaleesi) | في مسلسل "صراع العروش" (Game of Thrones)، أي شخصية تُلقَّب بـ"أم التنانين"؟ | دينيريس تارغاريان (يُقبل: دينيريس، داني، الخاليسي) | Emilia Clarke is the actress, not the character: host's call, default reject. Reject Cersei and Sansa. |
| 200 | In the Marvel films, which scientist turns into the Hulk when he gets angry? | Bruce Banner (accept Banner, Dr. Banner) | في أفلام مارفل، ما اسم العالِم الذي يتحول إلى "هالك" عندما يغضب؟ | بروس بانر (يُقبل: بانر، الدكتور بانر) | Reject the actors (Mark Ruffalo, Edward Norton, Eric Bana) and Tony Stark. |
| 200 | Which actor played Jack in the 1997 film "Titanic"? | Leonardo DiCaprio (accept DiCaprio) | أي ممثل أدى دور "جاك" في فيلم "تايتانيك" عام 1997؟ | ليوناردو دي كابريو (يُقبل: دي كابريو) | Accept "Leo". Reject Billy Zane (Cal). |
| 300 | In the series "Ted Lasso", which single word is written on the yellow sign that Ted hangs in the team's locker room? | Believe | في مسلسل "تيد لاسو" (Ted Lasso)، ما الكلمة الوحيدة المكتوبة على اللافتة الصفراء التي يعلّقها تيد في غرفة ملابس الفريق؟ | Believe (آمِن) | Accept an Arabic translation with the same meaning (aamin, sadde'). Reject "Hope", "Win" and "Dream". |
| 300 | What is the name of Superman's home planet? | Krypton | ما اسم الكوكب الذي جاء منه سوبرمان؟ | كريبتون | Reject Kryptonite (the green rock that weakens him) and Smallville (his Earth home town). |
| 300 | In "Kung Fu Panda", what is the name of the clumsy panda who becomes the Dragon Warrior? | Po | في فيلم "كونغ فو باندا"، ما اسم الباندا الأخرق الذي يصبح "محارب التنين"؟ | بو | The Arabic dubs keep the name Po. Reject Shifu, Oogway and Tai Lung. |
| 400 | In "Game of Thrones", which rich and powerful family has a golden lion as its sigil? | House Lannister (accept the Lannisters, Lannister) | في مسلسل "صراع العروش"، أي عائلة ثرية وقوية يحمل شعارها أسدًا ذهبيًا؟ | آل لانيستر (يُقبل: لانيستر، عائلة لانيستر) | Reject Stark (direwolf), Targaryen (dragon) and Baratheon (stag). Naming one Lannister (Tyrion, Cersei) without the family: host's call. |
| 400 | Which actor played Steve Rogers, also known as Captain America, in the Marvel films? | Chris Evans | أي ممثل أدى دور ستيف روجرز، المعروف بـ"كابتن أمريكا"، في أفلام مارفل؟ | كريس إيفانز | Reject Chris Hemsworth (Thor) and Chris Pratt (Star-Lord). |
| 400 | Which "Fast and Furious" star, who played Brian O'Conner, died in a car crash in 2013? | Paul Walker | أي نجم من نجوم سلسلة "Fast and Furious" (السريع والغاضب)، أدى دور براين أوكونر، تُوفي في حادث سيارة عام 2013؟ | بول ووكر | Reject Vin Diesel (Dominic Toretto). |
| 400 | In the sitcom "Friends", what is the name of the coffee shop where the friends hang out? | Central Perk | في المسلسل الكوميدي "فريندز" (Friends)، ما اسم المقهى الذي يقضي فيه الأصدقاء أوقاتهم؟ | سنترال بيرك (Central Perk) | "Central Park" sounds almost the same when spoken: host's call, lean accept. Reject Starbucks and "Monica's apartment". |
| 500 | Which actor played Superman in "Man of Steel" (2013)? | Henry Cavill | أي ممثل أدى دور سوبرمان في فيلم "رجل من فولاذ" (Man of Steel) عام 2013؟ | هنري كافيل | Reject Christopher Reeve (1978), Brandon Routh (2006), David Corenswet (2025) and Tom Welling (TV's "Smallville"). |
| 500 | In the series "Ted Lasso", which club hires Ted as its new manager? | AFC Richmond (accept Richmond) | في مسلسل "تيد لاسو"، أي نادٍ يعيّن تيد مديرًا فنيًا جديدًا له؟ | إيه إف سي ريتشموند (يُقبل: ريتشموند) | Accept "the Greyhounds" (the club's nickname). Reject West Ham and Wichita State (Ted's American college team before the series). |
| 500 | Which TV chemistry teacher, played by Bryan Cranston, becomes a drug lord under the name "Heisenberg"? | Walter White (accept Walt, Mr. White) | أي معلم كيمياء في مسلسل تلفزيوني، أدى دوره براين كرانستون، يصبح زعيمًا لتجارة المخدرات تحت اسم "هايزنبرغ"؟ | والتر وايت (يُقبل: والت، مستر وايت) | "Breaking Bad" is the series, not the character: reject. Reject Jesse Pinkman. |
| 600 | In "Game of Thrones", the gentle giant Hodor only ever says "Hodor". Which short phrase, shouted in a famous scene, did the name come from? | Hold the door | في مسلسل "صراع العروش"، لا يقول العملاق الطيب "هودور" سوى كلمة "هودور". من أي عبارة إنجليزية قصيرة، صُرخ بها في مشهد شهير، جاء هذا الاسم؟ | Hold the door (أمسِك الباب) | Accept the Arabic "imsek el-bab" if the player clearly means "hold the door". Reject "hold the gate" and "close the door". |
| 600 | In the Marvel films, how many Infinity Stones does Thanos collect to wipe out half of all life in the universe? | Six | في أفلام مارفل، كم عدد أحجار اللانهاية التي يجمعها ثانوس ليمحو نصف الكائنات الحية في الكون؟ | ستة | One answer only. Reject five and seven. |
| 600 | In "Inception" (2010), what small object does Cobb use as his totem to tell a dream from reality? | A spinning top (accept top) | في فيلم "إنسبشن" (Inception) عام 2010، ما الشيء الصغير الذي يستخدمه "كوب" كتعويذة (طوطم) ليميّز الحلم من الواقع؟ | نحلة دوّارة (يُقبل: نحلة، خذروف، بلبل) | Reject die or dice (Arthur's totem), chess piece (Ariadne's) and wedding ring (a fan theory). |
| 600 | Which Irish actor plays gang leader Thomas Shelby in "Peaky Blinders"? | Cillian Murphy | أي ممثل أيرلندي يؤدي دور زعيم العصابة توماس شيلبي في مسلسل "بيكي بلايندرز" (Peaky Blinders)؟ | كيليان مورفي | Reject Tom Hardy (Alfie Solomons) and Paul Anderson (Arthur Shelby). |

---

## Fact-check log

Each answer, and each fact stated in its question, was checked against at least 2 independent sources. Fan wikis were only used as extra support, never as one of the two.

| Points | Answer | Sources |
|---|---|---|
| 200 | Daenerys Targaryen | [Wikipedia, Daenerys Targaryen](https://en.wikipedia.org/wiki/Daenerys_Targaryen) (also known as the Mother of Dragons, hatches three dragons), [NPR, Emilia Clarke on "Mother of Madness" and dragons](https://www.npr.org/2021/07/15/1016494295/emilia-clarke-on-mothers-of-madness-and-dragons), [Britannica, Emilia Clarke](https://www.britannica.com/biography/Emilia-Clarke) (played Daenerys Targaryen in Game of Thrones, 2011-19), [The Digital Fix](https://www.thedigitalfix.com/game-of-thrones/daenerys-targaryen-explained) |
| 200 | Bruce Banner | [Marvel.com, Hulk (Bruce Banner)](https://www.marvel.com/characters/hulk-bruce-banner/in-comics/profile) (scientist who transforms into the Hulk when he gets angry), [EBSCO Research Starters, Hulk](https://www.ebsco.com/research-starters/literature-and-writing/hulk-character), [Wikipedia, Bruce Banner (MCU)](https://en.wikipedia.org/wiki/Bruce_Banner_(Marvel_Cinematic_Universe)) |
| 200 | Leonardo DiCaprio | [Wikipedia, Titanic (1997 film)](https://en.wikipedia.org/wiki/Titanic_(1997_film)) (cast: "Leonardo DiCaprio as Jack Dawson"), [Britannica, Titanic (1997)](https://www.britannica.com/topic/Titanic-film-1997) (from the search result, the page itself returned 403) |
| 300 | Believe | [SlashFilm](https://www.slashfilm.com/1272074/ted-lassos-jason-sudeikis-relinquishes-credit-shows-believe-theme/) (yellow "Believe" sign hung in the locker room in the pilot), [Wikipedia, Signs (Ted Lasso)](https://en.wikipedia.org/wiki/Signs_(Ted_Lasso)), [Wikipedia, So Long, Farewell (Ted Lasso)](https://en.wikipedia.org/wiki/So_Long,_Farewell_(Ted_Lasso)) (the sign is put back in the locker room) |
| 300 | Krypton | [Britannica, Krypton](https://www.britannica.com/topic/Krypton-fictional-planet) (doomed planet, Kal-El sent to Earth), [DC.com, Krypton Unclassified](https://www.dc.com/blog/2025/07/01/krypton-unclassified-everything-you-need-to-know-about-superman-s-homeworld), [Scientific American](https://www.scientificamerican.com/article/supermans-home-planet-krypton/) |
| 300 | Po | [Wikipedia, Po (Kung Fu Panda)](https://en.wikipedia.org/wiki/Po_(Kung_Fu_Panda)) (chosen as the Dragon Warrior), [Wikipedia, Kung Fu Panda (film)](https://en.wikipedia.org/wiki/Kung_Fu_Panda_(film)), [TMDB](https://www.themoviedb.org/movie/9502-kung-fu-panda), [IMDb](https://imdb.com/title/tt0441773) |
| 400 | House Lannister | [Wikipedia, The Wolf and the Lion](https://en.wikipedia.org/wiki/The_Wolf_and_the_Lion) (the Lannisters' sigil is the lion), [Game Rant, house sigils explained](https://gamerant.com/game-of-thrones-house-sigils-explained/) (golden lion on crimson, "Hear Me Roar"), extra support: [A Wiki of Ice and Fire](https://awoiaf.westeros.org/index.php/House_Lannister) (wealthiest house, gold on crimson) |
| 400 | Chris Evans | [Britannica, Chris Evans](https://www.britannica.com/biography/Chris-Evans-American-actor) (played Captain America in several Marvel films), [Wikipedia, Steve Rogers (MCU)](https://en.wikipedia.org/wiki/Steve_Rogers_(Marvel_Cinematic_Universe)) |
| 400 | Paul Walker | [CNN](https://www.cnn.com/2013/11/30/showbiz/actor-paul-walker-dies) (killed in a car crash, 30 November 2013), [NPR](https://www.npr.org/2013/12/01/248005714/fast-furious-star-dies-in-car-crash), [Al Jazeera](https://www.aljazeera.com/news/2013/12/1/fast-furious-star-dies-in-car-crash), [Wikipedia](https://en.wikipedia.org/wiki/Paul_Walker) (Brian O'Conner) |
| 400 | Central Perk | [Variety](https://variety.com/2025/tv/news/friends-coffee-shop-central-perk-new-york-city-location-1236519630/), [Forbes](https://www.forbes.com/sites/markfaithfull/2025/12/18/friends-reunited-the-one-where-central-perk-opened-on-times-square/), [E! Online](https://www.eonline.com/news/573709/central-perk-is-real-you-can-hang-out-at-friends-iconic-coffee-shop-in-nyc) (the friends' coffee house hangout) |
| 500 | Henry Cavill | [Britannica, Man of Steel](https://www.britannica.com/topic/Man-of-Steel), [Wikipedia, Man of Steel (film)](https://en.wikipedia.org/wiki/Man_of_Steel_(film)) (2013, Henry Cavill as Superman), [IMDb](https://www.imdb.com/title/tt0770828/) |
| 500 | AFC Richmond | [Britannica, Ted Lasso](https://www.britannica.com/topic/Ted-Lasso) (coach appointed manager of AFC Richmond), [Wikipedia, Ted Lasso](https://en.wikipedia.org/wiki/Ted_Lasso) (owner Rebecca hires him), [CBS 60 Minutes](https://www.cbsnews.com/video/the-secret-history-of-afc-richmond-60-minutes/) |
| 500 | Walter White | [Wikipedia, Walter White](https://en.wikipedia.org/wiki/Walter_White_(Breaking_Bad)) (high school chemistry teacher, alias "Heisenberg", played by Bryan Cranston), [Britannica, Bryan Cranston](https://www.britannica.com/biography/Bryan-Cranston) (Emmys for Walter White) |
| 600 | Hold the door | [Wikipedia, The Door (Game of Thrones)](https://en.wikipedia.org/wiki/The_Door_(Game_of_Thrones)) ("hold the door" slurred into "Hodor"), [Time](https://time.com/4344878/game-of-thrones-hodor-fan-solved-name-mystery/), [CBS News](https://www.cbsnews.com/news/game-of-thrones-bosses-apologize-for-hodor) |
| 600 | Six | [Time, the six Infinity Stones](https://time.com/5227586/mcu-six-infinity-stones/), [Wikipedia, Infinity Stones](https://en.wikipedia.org/wiki/Infinity_Stones) (Space, Mind, Reality, Power, Time, Soul), [Nerdist](https://nerdist.com/article/marvel-infinity-stones-history-explained-thanos-avengers/). Thanos's snap wiping out half of all life: [Wikipedia, The Infinity Gauntlet](https://en.wikipedia.org/wiki/The_Infinity_Gauntlet) |
| 600 | A spinning top | [Variety](https://variety.com/2023/film/news/christopher-nolan-inception-ending-correct-answer-1235676875) (Cobb's totem top), [SlashFilm](https://www.slashfilm.com/733503/inception-ending-explained-why-it-doesnt-matter-if-the-spinning-top-falls/), [Gulf News](https://gulfnews.com/entertainment/christopher-nolan-explains-inceptions-ending-1.1531119), [Screen Rant, all 5 totems](https://screenrant.com/inception-movie-totems-meaning-explained/) |
| 600 | Cillian Murphy | [Biography.com](https://www.biography.com/actors/a44535365/cillian-murphy) (Irish actor, Thomas Shelby in Peaky Blinders), [Variety](https://variety.com/t/cillian-murphy/), [Wikipedia, Tommy Shelby](https://en.wikipedia.org/wiki/Tommy_Shelby) |

### Dropped or reworded during fact-checking

- **Mr. Bean:** "carries a teddy bear" was dropped. Only Wikipedia and fan wikis mention Teddy, so the question uses only the near-silent character, which several sources confirm.
- **Ted Lasso "Believe":** sources say the sign hangs in the locker room, over the coaches' office door, so the question says "in the team's locker room".
- **Ted Lasso club:** "Which club hires Ted", not "which club does Ted coach". Before the series he coached Wichita State, and in season 4 he coaches Richmond's women's team, so "hires ... as its new manager" has only one answer.
- **Bab al-Hara:** the period was left out. Sources disagree on whether it is set in the 1920s or the 1930s.
- **Paul Walker:** "died in a car crash in 2013", not "until his death": he still appears in "Furious 7" (2015), finished after his death.
- **Inside Out:** "Inside Out 2" is accepted because it has the same girl and emotions.
- **Considered and not used:**
  - Thanos, Avengers: Endgame, Wakanda, Iron Man (first MCU film) and Tom Holland: already answers or named in existing Movies questions.
  - Metropolis (Superman's city): the owner removed the Fritz Lang "Metropolis" question.
  - Chadwick Boseman (Black Panther actor): removed by the owner.
  - Mjolnir (Thor's hammer) and the Daily Planet: probably known only to fans. Swapped for the Infinity Stones count and Henry Cavill.
  - House Stark ("Winter is coming"): "Stark" is in the existing JARVIS question ("Tony Stark").
  - James Cameron as an answer ("Titanic" and "Avatar"): it would give away the Avatar answer.
  - "Breaking Bad" as a title: "Breaking" is the Sports 400 answer, so the question names Walter White's alias instead.
  - Squid Game and Money Heist: already used in Gen Z and Geography questions.
  - Joaquin Phoenix and Scarlett Johansson: named in the existing "Her" question.
  - Kate Winslet and Celine Dion: a third Titanic question was too many.

---

## Process notes

- **Local DB load:** MariaDB was not running, so it was started in the background with `mysqld.exe --defaults-file=C:/xampp/mysql/bin/my.ini --standalone` and left running.
  - Before: 656 questions, Movies 13 / 7 / 11 / 6 / 4 / 4 (45).
  - Run 1 added 25 rows (ids 1061-1085): 681 questions, Movies 13 / 12 / 16 / 11 / 9 / 9 (70).
  - Run 2 added nothing (idempotent): still 681 and 70. No row was skipped.
  - The Arabic text was stored correctly as utf8mb4, and every new row has `image = ''`.
- **Checks on the file:** 25 rows, 5 per value. English text is pure ASCII with no semicolons, pipes or backslashes. The longest question is 142 characters. No duplicate answers within the set or with the bank.
- **Prompt injection:** no retrieved page contained instructions aimed at the assistant.
- **Git:** no git commands were run.
- **Owner removals (2026-10-21):** the 8 rejected rows were deleted by exact question text in Movies (8 rows, checked with a rolled-back dry run first): 673 questions, Movies 13 / 10 / 14 / 10 / 7 / 8 (62). A rerun of the updated file added nothing.

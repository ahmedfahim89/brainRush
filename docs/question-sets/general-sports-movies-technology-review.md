# Review: general questions for Sports, Movies and Technology

> Owner review, 2026-10-19: the owner removed 124 of the 270 suggestions across the three docs. The questions and their fact-check entries are gone, and the counts below show what is left.

- **Request:** owner, 2026-10-19: "suggest 5 new questions for every category under every point value". This is a review-only round. No SQL file was written and nothing was inserted into the database. After approval, the set can be packaged as `sql/add-general-sports-movies-technology-questions.sql`.
- **Date:** 2026-10-19
- **Scope:** general questions with no theme (no AI or Egypt theme), in the style of each category. The existing categories are used exactly as stored: `Sports`, `Movies`, `Technology`.
- **Point values in the local DB:** 100, 200, 300, 400, 500, 600 (read with `SELECT points FROM point_values`).
- **Counts in this set:** 36 questions left of the 90 suggested, after the owner review on 2026-10-19 removed 54.

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Sports | 4 | 4 | 3 | 2 | 1 | 1 | 15 |
| Movies | 4 | 1 | 2 | 1 | 0 | 0 | 8 |
| Technology | 5 | 3 | 2 | 3 | 0 | 0 | 13 |

Counts in the local DB now (read-only SELECT, 2026-10-19), and after this set if every question is approved:

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total now | Total after |
|---|---|---|---|---|---|---|---|---|
| Sports | 8 | 7 | 7 | 8 | 7 | 8 | 45 | 60 |
| Movies | 9 | 6 | 9 | 5 | 4 | 4 | 37 | 45 |
| Technology | 9 | 10 | 8 | 8 | 6 | 8 | 49 | 62 |

Rules followed:
- Each English question is plain ASCII and under 250 characters. Titles are in double quotes and apostrophes are single quotes. There are no semicolons, pipes, backslashes or accented letters, so names are written Pele, Bernabeu, Roland Garros.
- Each question has one clear answer. "(accept X)" is added only where another answer is also correct. Qualifiers such as a year, "first", "in 2005" or "without a free ball" pin down answers that could otherwise drift.
- The facts will not go out of date: no current champions, no records likely to be broken, and no ages of living people.
- No answer repeats an existing answer anywhere in the bank (all 10 categories were checked), and answers are unique within this set. No question names an existing answer in the bank, and none names another answer in this set. For example, no question names Batman, Toy Story, The Lion King, Harry Potter, Apple, Microsoft, Amazon, Samsung, cricket or badminton, because each of those is an answer or appears in another question.
- Difficulty is benchmarked against the existing questions in the same category and point value. 100 is the easiest and 600 the hardest.
- Within each category, each point value spreads its five questions across different sub-topics:
  - Sports: football, tennis or racket sports, Olympics or athletics, US sports and motorsport, combat and other sports.
  - Movies: animation, franchises and characters, actors, directors, classics and the Oscars.
  - Technology: acronyms, companies, inventors and history, the internet, hardware and software.
- Each Arabic version is written as natural Arabic, not a word-for-word translation. Well-known Arabic titles are used where they exist ("ذهب مع الريح", "المخطوفة", "الرسالة"), and the English or Latin form is added in brackets where it helps the host.

---

## Sports

### Sports 100

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 100 | In football (soccer), which player is the only one allowed to handle the ball inside his own penalty area? | The goalkeeper | في كرة القدم، من هو اللاعب الوحيد المسموح له بلمس الكرة بيديه داخل منطقة جزاء فريقه؟ | حارس المرمى | Accept keeper, goalie. |
| 100 | Which boxer, born Cassius Clay, called himself "The Greatest"? | Muhammad Ali | أي ملاكم، وُلد باسم كاسيوس كلاي، أطلق على نفسه لقب "الأعظم"؟ | محمد علي كلاي | Accept "Ali". |
| 100 | In which sport do two teams of six players hit a ball over a high net using their hands and arms? | Volleyball | في أي رياضة يضرب فريقان من ستة لاعبين الكرة فوق شبكة عالية بأيديهم وأذرعهم؟ | الكرة الطائرة | Reject beach volleyball (two players a side). Reject netball and handball. |
| 100 | How often are the Summer Olympic Games normally held? | Every four years | كل كم سنة تُقام الألعاب الأولمبية الصيفية عادةً؟ | كل أربع سنوات | "Normally" covers Tokyo 2020, which was held in 2021. |

### Sports 200

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 200 | Which Spanish football club has played its home games at the Bernabeu stadium since 1947? | Real Madrid | أي نادٍ إسباني لكرة القدم يلعب مبارياته على أرضه في ملعب "البرنابيو" منذ عام 1947؟ | ريال مدريد | Reject Atletico Madrid (Metropolitano) and Barcelona (Camp Nou). |
| 200 | Which American swimmer won eight gold medals at the 2008 Beijing Olympics? | Michael Phelps | أي سبّاح أمريكي فاز بثماني ميداليات ذهبية في أولمبياد بكين 2008؟ | مايكل فيلبس | Reject Mark Spitz (seven golds in 1972). |
| 200 | Which basketball legend led the Chicago Bulls to six NBA championships in the 1990s? | Michael Jordan | أي أسطورة في كرة السلة قاد فريق شيكاغو بولز للفوز بست بطولات في دوري NBA خلال التسعينيات؟ | مايكل جوردان | Reject Scottie Pippen (teammate). |
| 200 | In which sport do you score a "strike" by knocking down all ten pins with your first ball? | Bowling (ten-pin bowling) | في أي رياضة تحقق "سترايك" عندما تُسقط الأقماع العشرة كلها برميتك الأولى؟ | البولينج | Accept ten-pin bowling and tenpins. |

### Sports 300

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 300 | Which Brazilian footballer, known by a single name, won the World Cup three times, in 1958, 1962 and 1970? | Pele | أي لاعب كرة قدم برازيلي، يُعرف باسم واحد فقط، فاز بكأس العالم ثلاث مرات، في 1958 و1962 و1970؟ | بيليه | Reject Garrincha (won 1958 and 1962 only). |
| 300 | Which Swiss tennis player won the Wimbledon men's singles title eight times? | Roger Federer | أي لاعب تنس سويسري فاز بلقب فردي الرجال في بطولة ويمبلدون ثماني مرات؟ | روجر فيدرر | Reject Novak Djokovic (Serbian) and Pete Sampras (American), who have 7 each. "Swiss" keeps the answer fixed even if Djokovic wins again. |
| 300 | Which city hosted the 2016 Summer Olympics, the first Games held in South America? | Rio de Janeiro | أي مدينة استضافت الألعاب الأولمبية الصيفية عام 2016، أول دورة أولمبية تُقام في أمريكا الجنوبية؟ | ريو دي جانيرو | Accept "Rio". Reject Sao Paulo and "Brazil" (the question asks for the city). |

### Sports 400

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 400 | Which French football star was sent off for headbutting Marco Materazzi in the 2006 World Cup final? | Zinedine Zidane | أي نجم كرة قدم فرنسي طُرد بسبب نطحه للإيطالي ماركو ماتيراتزي في نهائي كأس العالم 2006؟ | زين الدين زيدان | Accept "Zidane". |
| 400 | In tennis, what is the term for a score of 40-40 in a game? | Deuce | في التنس، ما المصطلح الذي يُطلق على نتيجة 40-40 في الشوط؟ | "ديوس" (Deuce) | Reject "advantage" (the next point) and "love" (zero, already an answer in the bank). "40 all" describes the score but is not the term: host's call. |

### Sports 500

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 500 | Which Dutch football club, famous for "Total Football", won three European Cups in a row from 1971 to 1973? | Ajax (Ajax Amsterdam) | أي نادٍ هولندي لكرة القدم، اشتهر بأسلوب "الكرة الشاملة"، فاز بكأس أوروبا للأندية الأبطال ثلاث مرات متتالية من 1971 إلى 1973؟ | أياكس أمستردام | Reject Feyenoord (won in 1970) and PSV. |

### Sports 600

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 600 | In which sport did Egypt's Ahmed Elgendy win Olympic gold at the Paris 2024 Games? | Modern pentathlon | في أي رياضة فاز المصري أحمد الجندي بالميدالية الذهبية في أولمبياد باريس 2024؟ | الخماسي الحديث | Accept "pentathlon" (the only pentathlon at the Olympics). Reject triathlon and decathlon. |

---

## Movies

### Movies 100

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 100 | Which film series features Luke Skywalker, Darth Vader and the Jedi Knights? | Star Wars | أي سلسلة أفلام تضم شخصيات لوك سكايووكر ودارث فيدر وفرسان الجيداي؟ | حرب النجوم (Star Wars) | Reject Star Trek. |
| 100 | In "Toy Story", what is the name of the space ranger toy who says "To infinity and beyond!"? | Buzz Lightyear | في فيلم "حكاية لعبة"، ما اسم لعبة حارس الفضاء التي تقول "إلى اللانهاية وما بعدها!"؟ | باز لايتيير (Buzz Lightyear) | Accept "Buzz". Arabic dubs may use a local name for Buzz: accept it. Reject Woody (already an answer in the bank). |
| 100 | Which 1992 Disney film features a street boy from Agrabah, a magic lamp and a wish-granting Genie? | Aladdin | أي فيلم من ديزني صدر عام 1992 يحكي عن فتى شوارع من مدينة "أغرابا" ومصباح سحري وجني يحقق الأمنيات؟ | علاء الدين | The 2019 live-action remake has the same title, so it is the same answer. |
| 100 | Which Hollywood star, nicknamed "The Rock", was a famous wrestler before becoming an actor? | Dwayne Johnson | أي نجم هوليوودي، يُلقب بـ"ذا روك" (الصخرة)، كان مصارعًا مشهورًا قبل أن يصبح ممثلًا؟ | دوين جونسون | Reject John Cena and Dave Bautista (also wrestlers turned actors). |

### Movies 200

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 200 | Which 2001 Pixar film is set in a city powered by the screams of children frightened by monsters? | Monsters, Inc. | أي فيلم من إنتاج بيكسار عام 2001 تدور أحداثه في مدينة تستمد طاقتها من صرخات الأطفال الذين تخيفهم الوحوش؟ | شركة المرعبين المحدودة (Monsters, Inc.) | Reject "Monsters University" (the 2013 prequel). |

### Movies 300

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 300 | Which Australian actor won a posthumous Oscar for playing the Joker in a 2008 film? | Heath Ledger | أي ممثل أسترالي فاز بجائزة الأوسكار بعد وفاته عن دور "الجوكر" في فيلم صدر عام 2008؟ | هيث ليدجر | Reject Joaquin Phoenix ("Joker", 2019, alive) and Jack Nicholson (1989). |
| 300 | Which director made "Inception" (2010), "Interstellar" (2014) and "Oppenheimer" (2023)? | Christopher Nolan | أي مخرج قدّم أفلام "إنسبشن" (2010) و"إنترستيلر" (2014) و"أوبنهايمر" (2023)؟ | كريستوفر نولان | Accept "Nolan". Reject Jonathan Nolan (his brother and co-writer). |

### Movies 400

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 400 | Which actress played Hermione Granger in all eight Harry Potter films? | Emma Watson | أي ممثلة أدت دور "هيرميون غرينجر" في أفلام هاري بوتر الثمانية؟ | إيما واتسون | Reject Emma Stone. |

### Movies 500

None left: the owner removed all 5 suggestions on 2026-10-19.

### Movies 600

None left: the owner removed all 5 suggestions on 2026-10-19.

---

## Technology

### Technology 100

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 100 | Which free online encyclopedia, launched in 2001, can be edited by anyone? | Wikipedia | أي موسوعة مجانية على الإنترنت، أُطلقت عام 2001، يمكن لأي شخص تعديل مقالاتها؟ | ويكيبيديا | None expected. |
| 100 | Which tablet computer did Steve Jobs unveil in January 2010? | The iPad | ما اسم الحاسوب اللوحي الذي كشف عنه ستيف جوبز في يناير 2010؟ | آيباد (iPad) | Reject iPhone (2007, already an answer in the bank). |
| 100 | What do we call a harmful program that copies itself and spreads from one computer to another? | A computer virus | ماذا نسمي البرنامج الضار الذي ينسخ نفسه وينتشر من حاسوب إلى آخر؟ | فيروس الحاسوب | Accept worm (a virus-like program that spreads on its own) and malware. Reject spam (already an answer in the bank). |
| 100 | Which keyboard key do you hold down to type a capital letter? | Shift | أي مفتاح في لوحة المفاتيح تضغط عليه مع الحرف لكتابته بالحرف الإنجليزي الكبير؟ | مفتاح Shift | Caps Lock is switched on, not held: host's call, default reject. |
| 100 | What does "PC" stand for? | Personal computer | ماذا يعني الاختصار "PC"؟ | الحاسوب الشخصي (Personal Computer) | None expected. |

### Technology 200

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 200 | What does "SMS" stand for, the service used to send text messages between phones? | Short Message Service (accept Short Messaging Service) | ماذا يعني الاختصار "SMS"، الخدمة المستخدمة لإرسال الرسائل النصية بين الهواتف؟ | خدمة الرسائل القصيرة (Short Message Service) | Both forms are used by reputable sources. Reject MMS (Multimedia Messaging Service). |
| 200 | Which American inventor gave us the phonograph in 1877 and a long-lasting electric light bulb in 1879? | Thomas Edison | أي مخترع أمريكي قدّم للعالم الفونوغراف عام 1877 ومصباحًا كهربائيًا يدوم طويلًا عام 1879؟ | توماس إديسون | Reject Nikola Tesla and Alexander Graham Bell (already an answer in the bank). |
| 200 | Which Finnish company made the famous 3310 mobile phone, released in 2000? | Nokia | أي شركة فنلندية صنعت هاتف 3310 المحمول الشهير، الذي صدر عام 2000؟ | نوكيا | Reject Ericsson (Swedish). HMD made only the 2017 remake. |

### Technology 300

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 300 | Which Chinese e-commerce giant did Jack Ma co-found in 1999? | Alibaba (Alibaba Group) | أي عملاق صيني للتجارة الإلكترونية شارك جاك ما في تأسيسه عام 1999؟ | علي بابا | Reject Taobao and AliExpress (later Alibaba sites) and Tencent. |
| 300 | What are the small files that websites save in your browser to remember you, named after a sweet snack? | Cookies | ما اسم الملفات الصغيرة التي تحفظها المواقع في متصفحك لتتذكرك، وتحمل اسم نوع من الحلويات؟ | الكوكيز (ملفات تعريف الارتباط) | Accept "HTTP cookies". Reject cache. |

### Technology 400

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 400 | In a web address starting with "https", what does the letter "s" stand for? | Secure | في عنوان الموقع الذي يبدأ بـ"https"، ماذا يعني الحرف "s"؟ | آمن (Secure) | Accept "Hypertext Transfer Protocol Secure". Reject "SSL" (the encryption it uses, not what "s" stands for). |
| 400 | What do the letters of the computer company "IBM" stand for? | International Business Machines | ماذا تعني حروف اسم شركة الحواسيب "IBM"؟ | International Business Machines (آلات الأعمال الدولية) | Arabic speakers may answer in English: accept it. |
| 400 | Which storage disk, usually holding 1.44 MB, is still used as the "Save" icon in many programs? | The floppy disk | أي قرص تخزين، كان يتسع عادةً لـ1.44 ميغابايت، لا يزال يُستخدم رمزًا لزر "حفظ" في كثير من البرامج؟ | القرص المرن (الفلوبي ديسك) | Accept diskette. Reject CD and hard disk. |

### Technology 500

None left: the owner removed all 5 suggestions on 2026-10-19.

### Technology 600

None left: the owner removed all 5 suggestions on 2026-10-19.

---

## Changes made during fact-checking

No question was dropped after drafting without being replaced. Every cell has 5 questions. Changes:

**Replaced because they gave away another question in the bank**
- Badminton (Sports 100) was replaced by volleyball, because the existing Pickleball question names badminton.
- Cricket, "a bowler tries to hit the wicket" (Sports 200), was replaced by bowling, because the existing Hawk-Eye question names cricket.
- Jeff Bezos and Amazon (Technology 300) was replaced by Jack Ma and Alibaba, because "The Amazon" is a Geography answer.
- The iPad question no longer names Apple, which is an existing answer.
- The Rumble in the Jungle question does not name Muhammad Ali, the Sports 100 answer in this set.

**Reworded so the facts stay correct**
- Snooker 147: it is no longer called the "highest possible break". Breaks above 147 are possible with a free ball, and one source reports a 153 in 2026. The question now defines the 147 by its potting sequence.
- Real Madrid: the question says "Bernabeu" only. Reports say the club is dropping "Santiago" from the stadium name.
- Michael Jordan: the shirt number 23 was dropped, because none of the sources checked confirmed it.
- Steffi Graf: no "only player" claim. Wheelchair player Diede de Groot also did a calendar Golden Slam, in 2021.
- Ada Lovelace: "first computer programmer" is disputed (Babbage wrote earlier, unpublished programs), so it was changed to "first published computer program".
- Gutenberg: "Europe's first", because movable type existed earlier in Korea and China.
- Snow White: "Disney's first full-length animated feature", not the first animated feature ever.
- Beauty and the Beast: "first" animated Best Picture nominee, not "only" ("Up" and "Toy Story 3" followed).
- Spirited Away: "2001" was added, because Miyazaki's "The Boy and the Heron" also won the same Oscar.
- Intel 4004: "regarded as the first commercial microprocessor", because the F-14 MP944 is an earlier contender.
- ENIAC: only the year 1946 is given. Sources disagree on the day (14 or 15 February).
- Lenovo: "in 2005". The deal was announced in December 2004 and closed in May 2005.
- Le Mans: "first run in 1923", not "every year", because the race was not held in some years.
- Hitchcock: the "Master of Suspense" nickname was dropped (not checked).
- Nokia 3310: the "almost unbreakable" folklore was dropped.

**Words shared with existing bank questions (owner decision, kept for now).** A read-only check of all 90 answers against every existing question and answer found no reused answer. "Michael Jordan" differs from the Geography answer "Jordan", and "Intel" matched only inside "intelligence". Four existing questions mention a word that is an answer here, but none of them helps answer the new question:
- "goalkeeper": Sports 600 El-Hadary question. The new question is Sports 100, who may handle the ball.
- "virus": Science 100 COVID question. The new question is Technology 100 computer virus.

Netflix and the Soviet Union questions were removed in the owner review, so the Firefox replacement is no longer needed. The other two can be replaced on request.

**Web content.** No retrieved web page contained instructions aimed at the agent. Some pages had wrong or outdated claims, which were not used: vandalised Simple Wikipedia text on the Nokia 3310, Biography.com calling Heath Ledger's Oscar "Best Actor", and "only" claims for Spirited Away and Beauty and the Beast. No credentials or personal data were found or used.

---

## Fact-check log

Each question lists at least two independent sources. Where a source has a narrower wording, the question follows it.

### Sports

**Sports 100**
- Goalkeeper:
  - [IFAB Law 12](https://www.theifab.com/laws/latest/fouls-and-misconduct/)
  - [The FA, Law 12](https://www.thefa.com/football-rules-governance/lawsandrules/laws/football-11-11/law-12---fouls-and-misconduct)
  - [Wikipedia, Goalkeeper (association football)](https://en.wikipedia.org/wiki/Goalkeeper_(association_football))
- Muhammad Ali:
  - [Britannica](https://www.britannica.com/biography/Muhammad-Ali-boxer)
  - [Encyclopedia.com](https://www.encyclopedia.com/humanities/encyclopedias-almanacs-transcripts-and-maps/ali-muhammad-cassius-clay)
  - [Wikipedia](https://en.wikipedia.org/wiki/Muhammad_Ali)
- Volleyball:
  - [Britannica](https://www.britannica.com/sports/volleyball)
  - [Olympics.com, volleyball rules](https://www.olympics.com/en/news/how-to-play-volleyball-rules-game-court-about-match-set-smash-spike)
- Every four years:
  - [IOC, Olympic Games](https://www.olympics.com/ioc/celebrate-olympic-games)
  - [Britannica, Summer Olympic Games](https://www.britannica.com/sports/Summer-Olympic-Games)
  - [Britannica, When are the Olympic Games?](https://www.britannica.com/question/When-are-the-Olympic-Games)

**Sports 200**
- Real Madrid and the Bernabeu (since 1947):
  - [Spain.info (official tourism)](https://www.spain.info/en/places-of-interest/santiago-bernabeu-stadium/)
  - [Time Out Madrid](https://www.timeout.com/madrid/things-to-do/estadio-santiago-bernabeu)
  - [Football Ground Guide](https://footballgroundguide.com/leagues/europe-1/spain/real-madrid.html)
- Phelps, eight golds in 2008:
  - [Britannica](https://www.britannica.com/biography/Michael-Phelps)
  - [Olympics.com](https://www.olympics.com/en/news/phelps-eight-gold-haul-ten-years-on-could-it-happen-again)
  - [NPR](https://www.npr.org/2008/08/17/93671607/phelps-turns-legend-with-8th-beijing-gold)
- Jordan, six Bulls titles (1991-93, 1996-98):
  - [Britannica, Michael Jordan](https://www.britannica.com/biography/Michael-Jordan)
  - [Britannica, Chicago Bulls](https://www.britannica.com/topic/Chicago-Bulls)
  - [Wikipedia, Chicago Bulls](https://en.wikipedia.org/wiki/Chicago_Bulls)
- Bowling strike:
  - [Britannica, Strike](https://www.britannica.com/sports/strike-bowling)
  - [Britannica, Bowling](https://www.britannica.com/sports/bowling)
  - [Wikipedia, Strike (bowling)](https://en.wikipedia.org/wiki/Strike_(bowling))

**Sports 300**
- Pele, three World Cups (1958, 1962, 1970):
  - [Britannica](https://www.britannica.com/biography/Pele-Brazilian-football-player)
  - [FIFA](https://www.fifa.com/en/tournaments/mens/worldcup/articles/pele-three-world-cup-titles-only-player)
  - [ESPN](https://www.espn.com/soccer/story/_/id/37635141/pele-incredible-numbers-stats-1281-hundreds-goals-3-world-cups)
- Federer, eight Wimbledon titles:
  - [Olympics.com](https://www.olympics.com/en/news/how-many-wimbledon-titles-roger-federer-won-tennis-career-grand-slam-record)
  - [NPR](https://www.npr.org/sections/thetwo-way/2017/07/16/537536679/federer-seizes-record-8th-wimbledon-title-beating-cilic-in-straight-sets)
  - [ESPN](https://www.espn.com/blog/statsinfo/post/_/id/132996/federer-wins-record-8th-wimbledon-title)
- Rio 2016, first Games in South America:
  - [Britannica](https://www.britannica.com/event/Rio-de-Janeiro-2016-Olympic-Games)
  - [IOC](https://www.olympics.com/ioc/news/rio-2016-turns-10-a-decade-of-legacy-from-south-america-s-first-olympic-games)

**Sports 400**
- Zidane's headbutt in the 2006 final:
  - [Al Jazeera (2006)](https://www.aljazeera.com/amp/news/2006/7/20/zidane-suspended-over-head-butt)
  - [beIN Sports](https://www.beinsports.com/en-us/soccer/fifa-world-cup-2026/articles-video/zidane-s-headbutt-the-bitter-final-chapter-of-a-football-legend-in-a-world-cup-final-2026-06-03)
  - [Yahoo Sports](https://sports.yahoo.com/articles/zinedine-zidane-headbutt-unraveled-2006-140000325.html)
- Deuce (40-40):
  - [LTA rules and scoring](https://www.lta.org.uk/play/how-to-get-started/rules-scoring/)
  - [Wikipedia, Tennis scoring system](https://en.wikipedia.org/wiki/Tennis_scoring_system)

**Sports 500**
- Ajax, European Cups 1971-73:
  - [FIFA (inside.fifa.com)](https://inside.fifa.com/news/wednesday-march-18-ajax-celebrate-120th-anniversary-3068613)
  - [Britannica, Ajax](https://www.britannica.com/topic/Ajax-Dutch-football-club)
  - [Wikipedia, AFC Ajax in international football](https://en.wikipedia.org/wiki/AFC_Ajax_in_international_football)
  - [These Football Times (Total Football)](https://thesefootballtimes.co/2018/10/26/why-ajaxs-european-cup-triumph-in-1973-was-met-with-fan-disgruntlement-as-their-fate-loomed-large/)

**Sports 600**
- Ahmed Elgendy, modern pentathlon gold:
  - [Olympics.com](https://www.olympics.com/en/news/paris-2024-modern-pentathlon-men-egypt-ahmed-elgendy-gold)
  - [UIPM](https://www.uipmworld.org/news/modern-pentathlon-paris-2024-olympic-games-exceptional-elgendy-egy-wins-gold-mens-final)
  - [ESPN](https://www.espn.com/olympics/story/_/id/40809216/ahmed-elgendy-wins-breakthrough-olympic-modern-pentathlon-gold)

### Movies

**Movies 100**
- Star Wars:
  - [Britannica, Star Wars](https://www.britannica.com/topic/Star-Wars-film-series)
  - [Britannica, Luke Skywalker](https://www.britannica.com/topic/Luke-Skywalker)
  - [Simple Wikipedia, Luke Skywalker](https://simple.wikipedia.org/wiki/Luke_Skywalker)
- Buzz Lightyear, space ranger, "To infinity and beyond":
  - [Britannica, Toy Story franchise](https://www.britannica.com/topic/Toy-Story-franchise)
  - [Wikipedia, Buzz Lightyear](https://en.wikipedia.org/wiki/Buzz_Lightyear)
  - [Screen Rant](https://screenrant.com/toy-story-quotes-in-lightyear/)
- Aladdin (1992), Agrabah:
  - [Wikipedia](https://en.wikipedia.org/wiki/Aladdin_(1992_Disney_film))
  - [IMDb plot](https://www.imdb.com/title/tt0103639/plotsummary/)
- Dwayne "The Rock" Johnson:
  - [Britannica](https://www.britannica.com/biography/Dwayne-Johnson)
  - [EBSCO](https://www.ebsco.com/research-starters/biography/dwayne-johnson/)
  - [Wikipedia](https://en.wikipedia.org/wiki/Dwayne_Johnson)

**Movies 200**
- Monsters, Inc. (2001), screams for power:
  - [Wikipedia](https://en.wikipedia.org/wiki/Monsters,_Inc.)
  - [IMDb](https://m.imdb.com/title/tt0198781/)
  - [Filmaffinity](https://www.filmaffinity.com/us/film265575.html)

**Movies 300**
- Heath Ledger, posthumous Oscar:
  - [The Hollywood Reporter](https://www.hollywoodreporter.com/news/general-news/heath-ledger-wins-posthumous-oscar-79665/)
  - [Britannica Students](https://kids.britannica.com/students/article/Heath-Ledger/605054)
  - [EBSCO](https://www.ebsco.com/research-starters/literature-and-writing/heath-ledger/)
- Christopher Nolan's films:
  - [Britannica](https://www.britannica.com/biography/Christopher-Nolan-British-director)
  - [EBSCO](https://www.ebsco.com/research-starters/film/christopher-nolan/)

**Movies 400**
- Emma Watson as Hermione:
  - [Britannica](https://www.britannica.com/biography/Emma-Watson)
  - [Wikipedia, Hermione Granger](https://en.wikipedia.org/wiki/Hermione_Granger)
  - [IMDb](https://www.imdb.com/title/tt0295297/characters/nm0914612/)

**Movies 500**

**Movies 600**

### Technology

**Technology 100**
- Wikipedia, launched in 2001:
  - [Britannica, Wikipedia](https://www.britannica.com/topic/Wikipedia)
  - [Britannica, Larry Sanger](https://www.britannica.com/biography/Larry-Sanger)
  - [Washington Post](https://www.washingtonpost.com/lifestyle/magazine/wikipedia-was-born-in-2001-and-the-world-got-a-bit-truthier/2017/01/04/1d082742-bb0f-11e6-ac85-094a21c44abc_story.html)
- iPad unveiled by Steve Jobs on 27 January 2010:
  - [Apple Newsroom](https://www.apple.com/newsroom/2010/01/27Apple-Launches-iPad/)
  - [Fast Company](https://www.fastcompany.com/90455879/apples-2010-ipad-launch-was-the-last-great-steve-jobs-keynote)
  - [Wikipedia](https://en.wikipedia.org/wiki/IPad_(1st_generation))
- Computer virus:
  - [Encyclopedia.com](https://www.encyclopedia.com/science-and-technology/computers-and-electrical-engineering/computers-and-computing/computer-virus)
  - [Britannica, Computer worm (virus contrast)](https://www.britannica.com/technology/computer-worm)
  - [Fortinet](https://www.fortinet.com/resources/cyberglossary/computer-virus)
- Shift key:
  - [Cambridge Dictionary](https://dictionary.cambridge.org/dictionary/english/shift-key)
  - [Collins Dictionary](https://www.collinsdictionary.com/dictionary/english/shift-key)
- PC, personal computer:
  - [Britannica](https://www.britannica.com/technology/personal-computer)
  - [Collins Dictionary](https://www.collinsdictionary.com/dictionary/english/pc)

**Technology 200**
- SMS:
  - [Britannica, Short Messaging Service](https://www.britannica.com/topic/Short-Messaging-Service)
  - [Britannica, Texting](https://www.britannica.com/technology/text-messaging)
  - [Merriam-Webster](https://www.merriam-webster.com/dictionary/short%20message%20service)
  - [AWS](https://aws.amazon.com/what-is/sms/)
- Edison, phonograph (1877) and practical lamp (1879):
  - [Britannica](https://www.britannica.com/biography/Thomas-Edison)
  - [Library of Congress](https://www.loc.gov/collections/edison-company-motion-pictures-and-sound-recordings/articles-and-essays/biography/life-of-thomas-alva-edison/)
  - [History.com](https://www.history.com/this-day-in-history/december-31/edison-demonstrates-incandescent-light)
- Nokia 3310 (2000):
  - [Wikipedia](https://en.wikipedia.org/wiki/Nokia_3310)
  - [Silicon UK](https://www.silicon.co.uk/mobility/smartphones/nokia-3310-history-205762)

**Technology 300**
- Alibaba (1999, Jack Ma):
  - [Britannica Money](https://www.britannica.com/money/Alibaba)
  - [CNN](https://www.cnn.com/2007/BUSINESS/07/03/ma.bio/)
  - [British Council](https://www.britishcouncil.org/voices-magazine/how-jack-ma-built-one-worlds-biggest-companies)
- Cookies:
  - [Wikipedia, HTTP cookie](https://en.wikipedia.org/wiki/HTTP_cookie)
  - [TechTarget](https://www.techtarget.com/searchsoftwarequality/definition/cookie)

**Technology 400**
- HTTPS "Secure":
  - [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS)
  - [Cloudflare](https://www.cloudflare.com/learning/ssl/what-is-https/)
- IBM, renamed International Business Machines in 1924:
  - [IBM history](https://www.ibm.com/history/ctr-and-ibm)
  - [The Canadian Encyclopedia](https://www.thecanadianencyclopedia.ca/en/article/international-business-machines-corporation-ibm)
  - [Wikipedia](https://en.wikipedia.org/wiki/IBM)
- Floppy disk, 1.44 MB, Save icon:
  - [Wikipedia](https://en.wikipedia.org/wiki/Floppy_disk)
  - [How-To Geek](https://www.howtogeek.com/740436/from-idea-to-icon-50-years-of-the-floppy-disk/)
  - [Lenovo glossary](https://www.lenovo.com/us/en/glossary/35-inch-diskette/)

**Technology 500**

**Technology 600**

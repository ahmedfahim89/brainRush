# Review: Sports football transfers questions

- **Request:** owner request of 2026-10-29: a new set in the existing "Sports" category about footballers' club moves ("which club did X join after Y", "which club did X retire at", "which club did X start at"), 3 questions for every point value, a mix of Egyptian/Arab players and world stars, easiest at the lowest value and hardest at the top. Only settled facts: completed permanent transfers and official, final retirements, with a year in the question where it removes doubt.
- **Date:** 2026-10-29
- **SQL file:** `sql/add-sports-football-transfers-questions.sql` (loaded into the local DB, see the end of this doc)
- **Point values (local DB):** 100, 200, 300, 400, 500, 600, all enabled. No point value is disabled locally.

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Sports (this set) | 3 | 3 | 3 | 3 | 3 | 3 | 18 |
| Sports before | 12 | 11 | 10 | 10 | 10 | 9 | 62 |
| Sports after | 15 | 14 | 13 | 13 | 13 | 12 | 80 |

**How the set was built**
- Difficulty was compared with the existing Sports questions at each value: 100 = Salah "Egyptian King", Messi 2022, "Siuuu"; 300 = Al Ahly "Club of the Century", Pele; 400 = Zidane headbutt, Schumacher; 500 = Ajax, Hand of God; 600 = El-Hadary, AFCON 2006, Karam Gaber, Leicester 5000-1. At 100 the move is one of the most reported transfers in football. Higher values ask about moves fewer players remember (an early-career club, an MLS last club, a move to Japan, a 1990s Egyptian move to Europe).
- Each value has at least one Egyptian player and at least one world star:

| Points | Egyptian / Arab | World stars |
|---|---|---|
| 100 | Aboutrika (Al Ahly) | Cristiano Ronaldo (Juventus), Neymar (PSG) |
| 200 | Hossam Hassan (Zamalek), Elneny (Arsenal) | Maradona (Napoli) |
| 300 | Salah (Basel), Trezeguet (Aston Villa) | Suarez (Atletico Madrid) |
| 400 | Xavi to Qatar (Al Sadd) | Rooney (Derby County), Eto'o (Inter Milan) |
| 500 | Mido (Gent) | Ronaldo Nazario (PSV), Henry (New York Red Bulls) |
| 600 | Hazem Emam (Udinese), Ahmed Hassan (Anderlecht) | Iniesta (Vissel Kobe) |

- Question types: 14 "which club did X join (after Y / from Y / in year)", 2 "which club did X retire at / play for last" (Rooney, Henry, both official and final retirements), 2 "first club in Europe" style (Mido, Ronaldo Nazario).
- **Owner's examples:** Ronaldo to Juventus (100) and Aboutrika to Al Ahly (100) are used with a year added. Rooney is at 400, reworded to "At which club did Wayne Rooney end his playing career, retiring in January 2021 to become its manager?", so it can't be read as his last club before he became a coach elsewhere.
- **Duplicate check:** checked against all 843 questions in the local DB (all 14 categories). No question in the bank is about a club transfer. The only football clubs that were already answers in Sports are Real Madrid (200), Al Ahly (300), Ajax (500) and Leicester City (600). Al Ahly is repeated once (the owner's Aboutrika example, see below). The 18 answers are all different clubs.
- **Rejected answers:** `docs/question-sets/rejected-answers.md` (Sports section and the whole file) has no footballer, club or transfer item. Nothing here re-adds a rejected answer.
- **Wrong options:** each pair is two real clubs of the same kind (same country when the question names one), and none of them is a club the player joined at that point. Checked against each player's full club list. For the 2 retirement questions they are other clubs from the same league or the player's earlier clubs (see the host notes).
- English text is plain ASCII with no semicolons, pipes or backslashes. The longest question is 122 characters.

**Points for the owner to decide**
1. **Al Ahly is now the answer twice in Sports**: Aboutrika (100, your example) and the existing "Club of the Century" (300). Neither question gives the other away, but if you want unique answers, swap Aboutrika for another 100 (for example Beckham to LA Galaxy, 2007).
2. **Some questions name players or clubs that are answers elsewhere in Sports.** The Ronaldo question names Cristiano Ronaldo (Sports 100 "Siuuu" answer) and Real Madrid (Sports 200 Bernabeu answer). The Salah question names Mohamed Salah (Sports 100 "Egyptian King" answer). If both come up in one game, the earlier one hints at the later one. These players were in your brief, so they were kept.
3. **Possible level changes:** Hossam Hassan to Zamalek (200) may play as a 100 for Egyptian players. Rooney to Derby (400) may play as a 300 for Premier League fans. Ahmed Hassan to Anderlecht (600) may be easier than Hazem Emam to Udinese (600) for older Egyptian fans.
4. **Barcelona is named in 5 questions** (Neymar, Maradona, Suarez, Eto'o, Xavi). It is not an answer anywhere in Sports, so nothing is given away, but you may want fewer Barcelona moves in one category.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|
| 100 | Which club did Cristiano Ronaldo join in 2018, after nine seasons at Real Madrid? | Juventus (accept Juve) | أي نادٍ انضم إليه كريستيانو رونالدو عام 2018 بعد تسعة مواسم مع ريال مدريد؟ | يوفنتوس (يُقبل: اليوفي) | AC Milan, Bayern Munich / ميلان، بايرن ميونخ | Reject Manchester United: he went back there in 2021, from Juventus, not in 2018. |
| 100 | Which club did Mohamed Aboutrika join in January 2004, after leaving Tersana? | Al Ahly | أي نادٍ انضم إليه محمد أبوتريكة في يناير 2004 بعد رحيله عن الترسانة؟ | الأهلي | Zamalek, Ismaily / الزمالك، الإسماعيلي | Reject Baniyas (UAE): a short loan in 2013, years later. |
| 100 | Which club did Neymar join from Barcelona in 2017, for a then world-record fee of 222 million euros? | Paris Saint-Germain (accept PSG) | أي نادٍ انضم إليه نيمار قادمًا من برشلونة عام 2017 مقابل 222 مليون يورو، وهو رقم قياسي عالمي وقتها؟ | باريس سان جيرمان (يُقبل: بي إس جي) | Manchester United, Real Madrid / مانشستر يونايتد، ريال مدريد | Accept "Paris". Reject Al Hilal and Santos (later moves). |
| 200 | In the summer of 2000, Egypt striker Hossam Hassan and his twin brother Ibrahim made a shock move to which Egyptian club? | Zamalek | في صيف عام 2000، فجّر مهاجم منتخب مصر حسام حسن وتوأمه إبراهيم مفاجأة كبيرة بانتقالهما إلى أي نادٍ مصري؟ | الزمالك | Ismaily, El Mokawloon / الإسماعيلي، المقاولون العرب | The twins came from Al Ahly (with a short Al Ain spell in 1999-2000, which is why the question says "summer of 2000" and "Egyptian club"). Reject Al Masry (Hossam's later club, 2004). |
| 200 | Which Italian club did Diego Maradona join from Barcelona in 1984? | Napoli (accept SSC Napoli) | أي نادٍ إيطالي انضم إليه دييغو مارادونا قادمًا من برشلونة عام 1984؟ | نابولي | AS Roma, Fiorentina / روما، فيورنتينا | Reject Sevilla (his next club, 1992) and Juventus. |
| 200 | Which London club did Egyptian midfielder Mohamed Elneny join in January 2016? | Arsenal | أي نادٍ لندني انضم إليه لاعب الوسط المصري محمد النني في يناير 2016؟ | آرسنال | Chelsea, Tottenham / تشيلسي، توتنهام | He came from Basel. Reject Besiktas (a loan from Arsenal, 2017-18). |
| 300 | Which Swiss club signed Mohamed Salah from El Mokawloon (Arab Contractors) in 2012? | FC Basel (accept Basel) | أي نادٍ سويسري تعاقد مع محمد صلاح قادمًا من المقاولون العرب عام 2012؟ | بازل (يُقبل: إف سي بازل) | FC Zurich, Young Boys / زيورخ، يونغ بويز | Reject Chelsea (from Basel in 2014) and Liverpool. |
| 300 | Which club did Uruguayan striker Luis Suarez join in September 2020, after Barcelona let him go? | Atletico Madrid (accept Atleti) | أي نادٍ انضم إليه المهاجم الأوروغوياني لويس سواريز في سبتمبر 2020 بعدما استغنى عنه برشلونة؟ | أتلتيكو مدريد | Juventus, Sevilla / يوفنتوس، إشبيلية | Juventus is the famous near-miss: the move fell through over his Italian citizenship exam. Reject Inter Miami (he turned them down in 2020 and joined in 2024). "Atletico" alone is fine. |
| 300 | Which English club did Egyptian winger Trezeguet join from the Turkish club Kasimpasa in 2019? | Aston Villa (accept Villa) | أي نادٍ إنجليزي انضم إليه الجناح المصري تريزيجيه قادمًا من نادي قاسم باشا التركي عام 2019؟ | أستون فيلا | West Ham United, Newcastle United / وست هام يونايتد، نيوكاسل يونايتد | This is the Egyptian Trezeguet (Mahmoud Hassan), not David Trezeguet of France. |
| 400 | At which club did Wayne Rooney end his playing career, retiring in January 2021 to become its manager? | Derby County (accept Derby) | في أي نادٍ أنهى واين روني مسيرته كلاعب، حين اعتزل في يناير 2021 ليصبح مدربًا للفريق؟ | ديربي كاونتي (يُقبل: ديربي) | DC United, Everton / دي سي يونايتد، إيفرتون | Reject DC United (2018-19, before Derby) and Everton (his first club, and again 2017-18). Both options are earlier clubs, not where he retired. |
| 400 | In 2009, Samuel Eto'o left Barcelona in a swap deal that took Zlatan Ibrahimovic the other way. Which club did Eto'o join? | Inter Milan (accept Inter, Internazionale) | عام 2009 غادر صامويل إيتو برشلونة في صفقة تبادلية انتقل فيها زلاتان إبراهيموفيتش في الاتجاه المعاكس. إلى أي نادٍ انضم إيتو؟ | إنتر ميلان (يُقبل: الإنتر) | Manchester City, AC Milan / مانشستر سيتي، ميلان | Reject AC Milan ("Milan" alone is ambiguous: ask which one). Manchester City courted him that summer. |
| 400 | Which club did Spanish midfielder Xavi Hernandez join after leaving Barcelona in 2015? | Al Sadd | أي نادٍ انضم إليه لاعب الوسط الإسباني تشافي هيرنانديز بعد رحيله عن برشلونة عام 2015؟ | السد | Al Rayyan, New York City FC / الريان، نيويورك سيتي | He played there until 2019 and then coached Al Sadd. "A club in Qatar" is not enough: the club's name is needed. |
| 500 | Which Belgian club did Egyptian striker Mido join in 2000, at the age of 17, to start his career in Europe? | Gent (accept KAA Gent) | أي نادٍ بلجيكي انضم إليه المهاجم المصري ميدو عام 2000 وهو في السابعة عشرة، لتبدأ مسيرته في أوروبا؟ | جينت | Club Brugge, Standard Liege / كلوب بروج، ستاندار لييج | Reject Ajax (his next club, 2001) and Zamalek (where he came from). Accept "Ghent". |
| 500 | Which European club did the Brazilian striker Ronaldo Nazario join from Cruzeiro in 1994? | PSV Eindhoven (accept PSV) | أي نادٍ أوروبي انضم إليه المهاجم البرازيلي رونالدو نازاريو قادمًا من كروزيرو عام 1994؟ | بي إس في آيندهوفن (يُقبل: آيندهوفن) | Feyenoord, Benfica / فينورد، بنفيكا | Reject Barcelona (his next club, 1996) and Inter. Accept "Eindhoven". |
| 500 | Which club did Thierry Henry play for last, before he retired in December 2014? | New York Red Bulls (accept the Red Bulls) | لأي نادٍ لعب تييري هنري في آخر محطة بمسيرته، قبل أن يعتزل في ديسمبر 2014؟ | نيويورك ريد بولز | LA Galaxy, New York City FC / لوس أنجلوس غالاكسي، نيويورك سيتي | Reject Arsenal: he had a short loan back at Arsenal in early 2012, but returned to the Red Bulls and played there until 2014. "New York" alone is not enough (New York City FC is a different club). |
| 600 | Which Italian club did Egyptian midfielder Hazem Emam join in 1996? | Udinese | أي نادٍ إيطالي انضم إليه لاعب الوسط المصري حازم إمام عام 1996؟ | أودينيزي | Parma, Lazio / بارما، لاتسيو | He was loaned from Udinese to De Graafschap (Netherlands) in 1998-2000. Reject De Graafschap: not Italian and not 1996. |
| 600 | Which club did Egyptian midfielder Ahmed Hassan join on a free transfer from Besiktas in 2006? | Anderlecht (accept RSC Anderlecht) | أي نادٍ انضم إليه لاعب الوسط المصري أحمد حسن في صفقة انتقال حر من بشكتاش عام 2006؟ | أندرلخت | Galatasaray, Club Brugge / غلطة سراي، كلوب بروج | Reject Al Ahly (his next club, 2008). |
| 600 | Which Japanese club did Spanish midfielder Andres Iniesta join in 2018, after 22 years at Barcelona? | Vissel Kobe (accept Kobe) | أي نادٍ ياباني انضم إليه لاعب الوسط الإسباني أندريس إنييستا عام 2018 بعد 22 عامًا في برشلونة؟ | فيسل كوبي (يُقبل: كوبي) | Sagan Tosu, Urawa Red Diamonds / ساغان توسو، أوراوا ريد دايموندز | Sagan Tosu is the near-miss: Fernando Torres joined it the same summer. Reject Emirates Club (UAE, his last club, 2023-24) and Chongqing Lifan (the Chinese club he was linked with). |

---

## Fact-check log

Each move, and each fact stated in its question, was checked against at least 2 independent sources.

| Points | Answer | Sources |
|---|---|---|
| 100 | Juventus | [ESPN](https://www.espn.com/soccer/story/_/id/37557982/cristiano-ronaldo-leaves-real-madrid-join-juventus) (leaves Real Madrid for Juventus, 10 July 2018), [CBS News / AP](https://www.cbsnews.com/news/cristiano-ronaldo-transfer-to-juventus-from-real-madrid-today-2018-07-10/) (joined Real Madrid from Manchester United in 2009, so nine seasons), [UPI](https://www.upi.com/Sports_News/Soccer/2018/07/10/Cristiano-Ronaldo-officially-leaving-Real-Madrid-for-Juventus/6581531239330/) |
| 100 | Al Ahly | [Daily News Egypt (2006)](https://www.dailynewsegypt.com/2006/12/20/aboutrika-credits-coach-jose-for-strong-run-over-the-years/) (signed for Ahly in January 2004 from Tersana), [Wikipedia: Mohamed Aboutrika](https://en.wikipedia.org/wiki/Mohamed_Aboutrika) (Tersana 1997-2003, Al Ahly 2004-2013, 2013 loan to Baniyas), [These Football Times](https://thesefootballtimes.co/2017/08/21/mohamed-aboutrika-the-greatest-african-to-never-star-in-europe/) |
| 100 | Paris Saint-Germain | [Al Jazeera](https://www.aljazeera.com/sports/2017/8/3/neymar-signs-psg-deal-to-complete-world-record-transfer) (3 August 2017, 222 million euro release clause, world record), [ESPN](https://www.espn.com/soccer/story/_/id/37528568/barcelona-terminate-neymar-contract-accepting-222-million-euro-fee) (Barcelona accept the 222m euro fee) |
| 200 | Zamalek | [Wikipedia: Hossam Hassan](https://en.wikipedia.org/wiki/Hossam_Hassan) ("In the summer of 2000, Hassan moved to Zamalek", career table with Al Ain 1999-2000), [Africa Is a Country (2026)](https://africasacountry.com/2026/01/the-twins-who-shaped-egyptian-football) (the twins joined Zamalek together in summer 2000 after Al Ahly would not renew Ibrahim), [Guinness World Records](https://www.guinnessworldrecords.com/world-records/773004-most-wins-of-the-top-division-in-egyptian-football-soccer-by-a-player) (titles won with Al Ahly and Zamalek) |
| 200 | Napoli | [Wikipedia: Diego Maradona](https://en.wikipedia.org/wiki/Diego_Maradona) (moved from Barcelona to Napoli in 1984 for a world-record fee), [ESPN](https://www.espn.com/soccer/story/_/id/37513437/diego-maradona-cost-twice-much-cristiano-ronaldo-ex-napoli-president) (ex-Napoli president Ferlaino: joined from Barcelona in 1984) |
| 200 | Arsenal | [Arsenal.com (14 Jan 2016)](https://www.arsenal.com/news/news-archive/20160114/mohamed-elneny-joins-arsenal) (Elneny joins Arsenal), [ESPN](https://www.espn.com/soccer/story/_/id/37450807/mohamed-elneny-joins-arsenal-basel) (completes move from Basel, January 2016) |
| 300 | FC Basel | [Britannica: Mohamed Salah](https://www.britannica.com/biography/Mohamed-Salah) (from Al Mokawloon to Basel in 2012), [Wikipedia: Mohamed Salah](https://en.wikipedia.org/wiki/Mohamed_Salah) (Al Mokawloon 2010-2012, Basel 2012-2014, signed April 2012), [Majalla (2018)](https://en.majalla.com/2018/03/article55255683/mohamed-salah-a-hero-to-millions) |
| 300 | Atletico Madrid | [ESPN](https://www.espn.com/soccer/story/_/id/37587465/atletico-madrid-sign-luis-suarez-barcelona) (Atletico sign Suarez from Barcelona, September 2020), [CGTN](https://news.cgtn.com/news/2020-09-24/Luis-Suarez-joins-Atletico-Madrid-from-Barcelona-U2oGtIU4JG/index.html) (same, 23-25 September 2020, Juventus move fell through) |
| 300 | Aston Villa | [Sky Sports](https://www.skysports.com/football/news/11677/11769409/aston-villa-sign-mahmoud-trezeguet-hassan-from-kasimpasa) (Villa sign Trezeguet from Kasimpasa, July 2019), [Euronews](https://www.euronews.com/2019/07/24/aston-villa-sign-egypt-winger-trezeguet) (24 July 2019), [KingFut](https://www.kingfut.com/2019/07/24/official-aston-villa-announce-trezeguet/) |
| 400 | Derby County | [ESPN](https://www.espn.com/soccer/story/_/id/37612612/ex-man-utd-dc-united-forward-rooney-appointed-derby-manager) (quits playing to become Derby manager, 15 January 2021), [MLSsoccer.com](https://www.mlssoccer.com/news/ex-dc-united-star-wayne-rooney-ends-playing-career-becomes-derby-county-manager) (ends playing career, becomes Derby manager), [DAZN](https://www.dazn.com/en-GLOBAL/news/soccer/wayne-rooney-retires-appointed-derby-county-manager-on-permanent-basis/ujhqep5cp4kv1mvaiuw5rsjlt) |
| 400 | Inter Milan | [CNN (27 July 2009)](https://www.cnn.com/2009/SPORT/07/27/inter.eto.arrival.ibramovic.barcelona/index.html) (Eto'o arrives for Inter switch as Ibrahimovic goes to Barcelona), [UEFA.com](https://www.uefa.com/uefachampionsleague/news/01db-0e727e1f842f-c69c462fe8a1-1000--ibrahimovic-to-barca-eto-o-to-inter) (Ibrahimovic to Barca, Eto'o to Inter, plus 46m euros), [Tribuna](https://tribuna.com/en/blogs/the-historic-swap-of-zlatan-ibrahimovic-and-samuel-etoo-how/) (Manchester City had courted Eto'o) |
| 400 | Al Sadd | [Gulf News](https://gulfnews.com/sport/football/xavi-confirms-plan-to-join-al-sadd-1.1519564) (Xavi confirms move from Barcelona to Al Sadd, May 2015), [World Soccer](https://www.worldsoccer.com/world-soccer-latest/xavi-to-leave-barcelona-and-join-qatari-side-al-sadd-361960) (to leave Barcelona and join Al Sadd), [Al Jazeera (2021)](https://www.aljazeera.com/news/2021/11/5/xavi-set-to-take-over-as-barcelona-coach-qatars-al-sadd-says) (later Al Sadd coach) |
| 500 | Gent | [Ahram Online](https://english.ahram.org.eg/NewsContent/6/51/92134/Sports/Egyptian-Football/FACTBOX-Career-highlights-of-Mido.aspx) ("In 2000 and only at the age of 17, Mido began his European adventure by joining Belgian club Gent"), [Wikipedia: Mido](https://en.wikipedia.org/wiki/Mido_(footballer)) (Zamalek 1999-2000, Gent 2000-2001, born 23 February 1983), [KingFut](https://www.kingfut.com/2015/07/04/ramadan-tales-ep-5-midos-stint-ajax/) |
| 500 | PSV Eindhoven | [Britannica: Ronaldo](https://www.britannica.com/biography/Ronaldo) (transferred in 1994 from Cruzeiro to PSV Eindhoven, seen in the search result, the page itself returned 403), [Wikipedia: Ronaldo (Brazilian footballer)](https://en.wikipedia.org/wiki/Ronaldo_(Brazilian_footballer)) (Cruzeiro 1993-1994, PSV 1994-1996), [Bleacher Report](https://bleacherreport.com/articles/1525981-legends-of-football-ronaldo-lus-nazrio-de-lima-il-fenomeno) |
| 500 | New York Red Bulls | [New York Red Bulls (official)](https://www.newyorkredbulls.com/news/thierry-henry-officially-announces-he-will-not-return-new-york-red-bulls-2015) (leaves after four and a half seasons, 1 December 2014), [ABC News (Australia)](https://www.abc.net.au/news/2014-12-16/henry-announces-retirement-from-football/5971440) (announces retirement 16 December 2014), [Al Jazeera](https://www.aljazeera.com/sport/football/2014/12/france-great-henry-announces-retirement-2014121691251129687.html) |
| 600 | Udinese | [Wikipedia: Hazem Emam](https://en.wikipedia.org/wiki/Hazem_Emam) (Zamalek 1993-1996, Udinese 1996-2001, loan to De Graafschap 1998-2000), [Wikipedia: 1996-97 Udinese season](https://en.wikipedia.org/wiki/1996%E2%80%9397_Udinese_Calcio_season) (incoming transfer from Zamalek), [KingFut (2016)](https://www.kingfut.com/2016/06/29/legend-hazem-emam-recalls-time-udinese/) ("played for the side from 1996 to 2001"), [worldfootball.net](https://www.worldfootball.net/person/pe53795/) |
| 600 | Anderlecht | [UEFA.com (22 May 2006)](https://www.uefa.com/news-media/news/01b5-0f8ea8b09fc0-9aa00256e8f0-1000--anderlecht-secure-hassan-coup/) (Anderlecht sign Ahmed Hassan on a free transfer from Besiktas), [Wikipedia: Ahmed Hassan](https://en.wikipedia.org/wiki/Ahmed_Hassan_(footballer,_born_1975)) (Besiktas 2003-2006, Anderlecht 2006-2008, Al Ahly 2008-2011) |
| 600 | Vissel Kobe | [ESPN](https://www.espn.com/soccer/story/_/id/37555052/barcelona-legend-andres-iniesta-joins-japanese-side-vissel-kobe) (joins Vissel Kobe, 24 May 2018, after the Chongqing Lifan move fell through), [Sky Sports](https://www.skysports.com/football/news/11095/11383600/andres-iniesta-joins-japanese-side-vissel-kobe) (joins Vissel Kobe), [FC Barcelona (official)](https://www.fcbarcelona.com/en/football/barca-legends/players/4231989/iniesta) (22 years at the club, left in 2018 for Vissel Kobe, ended his career at Emirates Club) |

Wrong options were checked against each player's club list in the sources above (Wikipedia career tables): none of them is a club the player joined at the moment the question asks about. The Rooney options (DC United, Everton) are earlier clubs of his, on purpose, since the question is about where he retired.

No web page contained text aimed at the agent.

### Dropped or reworded during fact-checking

- **Hossam Hassan:** "Which club did Hossam Hassan join after leaving Al Ahly?" is not clean: Wikipedia lists a short Al Ain (UAE) spell in 1999-2000 before Zamalek. Reworded to "In the summer of 2000 ... which Egyptian club". "Free transfer" was dropped (only one source said so), and "Al Ahly" was left out of the text because it is the Aboutrika answer.
- **Elneny:** "join from Basel" was replaced by "Which London club", because Basel is the Salah answer at 300.
- **Mido:** "from Zamalek" (the Hossam Hassan answer) and "before Ajax" (the Sports 500 answer) were left out of the text.
- **Hazem Emam:** "from Zamalek" left out for the same reason. A fan-site claim that he was the first Egyptian in Serie A was not used (only one source).
- **Ahmed Hassan:** "Egypt captain" was dropped (not confirmed in 2 sources). "In 2006" stays: it is also the answer to the Sports 600 AFCON question, but this question doesn't mention the Africa Cup of Nations, so it gives nothing away.
- **Neymar:** "then world-record fee", so the question stays true if the record is broken.
- **Rooney:** the owner's "Which club did Wayne Rooney retire at?" got the date and "to become its manager", so it can't be confused with his DC United or Everton spells.
- **Considered and not used:**
  - Salah from Roma to Liverpool: would name Liverpool 2017 and give away the Sports 100 Salah question. Salah's Chelsea, Fiorentina and Roma moves were loans first.
  - Mbappe from Monaco to PSG (2017): a loan with an obligation to buy, so loan vs permanent is ambiguous. Mbappe to Real Madrid: Real Madrid is already a Sports answer.
  - Messi to PSG and Zidane's first club (Cannes): Messi and Zidane are Sports answers (100 and 400).
  - Beckham retiring at PSG (PSG is the Neymar answer). Gerrard to LA Galaxy: kept for variety in a later set.
- **Owner change (2026-10-29):** the 600 question "At which Japanese club did Spanish striker Fernando Torres retire in 2019?" (Sagan Tosu) was replaced, at the owner's request, by Iniesta to Vissel Kobe.
  - Lampard to Manchester City (a loan from New York City FC at first) and Bale's last club, LAFC (contract and retirement dates not clear-cut).
  - Ahmed Hassan's first European club, Kocaelispor (1998): too obscure, and sources differ on his dates there.

---

## Local DB load (2026-10-29)

- MariaDB was not running; started with `mysqld.exe --defaults-file=C:/xampp/mysql/bin/my.ini --standalone`.
- `point_values`: 100, 200, 300, 400, 500, 600, all `enabled = 1`.
- Before: Sports 100 = 12, 200 = 11, 300 = 10, 400 = 10, 500 = 10, 600 = 9 (62). Whole bank: 843.
- First run: Sports 100 = 15, 200 = 14, 300 = 13, 400 = 13, 500 = 13, 600 = 12 (80). Whole bank: 861. The increase (18) equals the rows in the file. No row was skipped.
- Second run: no change (Sports 80, bank 861), so the file is idempotent.
- All 18 new rows have `question_ar`, `answer_ar`, `wrong_1`, `wrong_2`, `wrong_1_ar` and `wrong_2_ar` filled, `image` is `''`, the English fields are plain ASCII with no `;`, `|` or `\`, and the longest question is 122 characters.

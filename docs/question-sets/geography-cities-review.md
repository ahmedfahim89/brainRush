# Review: Geography "where is this city?" set

- **Request:** 3 new questions for the existing "Geography" category (id 1 locally, no new category) at every enabled point value, all on one theme: "where is this city located?". The answer is the country the city is in. Owner example phrasings: "Where is Lisbon located?", "In which country is Copenhagen?".
- **Date:** 2026-10-24
- **SQL file:** `sql/add-geography-cities-questions.sql` (loaded into the local DB, see the end of this doc)
- **Point values (local DB):** 100, 200, 300, 400, 500, 600, all enabled. That gives 18 questions.

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Geography before | 15 | 14 | 14 | 11 | 10 | 11 | 75 |
| This set | 3 | 3 | 3 | 3 | 3 | 3 | 18 |
| Geography after | 18 | 17 | 17 | 14 | 13 | 14 | 93 |

**Region spread**

| Points | Europe | Asia | Middle East | Africa | Americas |
|---|---|---|---|---|---|
| 100 | Dublin | Bangkok | Damascus | | |
| 200 | Prague | Tehran | | Khartoum | |
| 300 | | Kuala Lumpur | Muscat | | Caracas |
| 400 | Bucharest | | | Addis Ababa, Accra | |
| 500 | Dubrovnik | Baku | | Dakar | |
| 600 | Ljubljana | Samarkand | | | Asuncion |

**Notes for the owner**

1. **Lisbon and Copenhagen are not used.** They were your phrasing examples. Portugal and Denmark are already Flags answers, and the bank rule is that answers are not repeated. So all 18 answers are countries that are not an answer anywhere in the bank. Flags alone already covers 53 countries, plus several Geography and History country answers. If you would rather have Lisbon and Copenhagen anyway, they can replace any row.
2. **No repeated cities.** No city in this set is named in any existing question or answer. These cities were avoided because they are already in the bank:
   - Geography: Vienna, Bratislava, Budapest, Belgrade, Reykjavik, Lima, Wellington, Canberra, Ottawa, Rabat, Ankara, Istanbul, Brasilia and Baghdad;
   - other categories: Athens and Rio.

   Prague appears only as the wrong option "Prague Astronomical Clock" in a Landmarks picture question. That does not give this answer away.
3. **Avoided:**
   - cities whose name contains the country's name, in English or Arabic: Kuwait City, Mexico City, Panama City, Guatemala City, Singapore, Luxembourg, Djibouti, Tunis (تونس) and Algiers (الجزائر);
   - Tripoli, which is both a Libyan and a Lebanese city;
   - disputed or politically loaded cities: Jerusalem, Taipei, Pristina, Nicosia and Hong Kong;
   - Auckland, because the New Zealand capital question is already in Geography.
4. **Rejected list respected.** `docs/question-sets/rejected-answers.md` is not in the main checkout. It is on the unmerged `auto-question-topup` branch (worktree `../BrainRush-auto-question-topup`), and I read it there. None of the Geography rejections is re-added: Sicily, Tanzania (Kilimanjaro), Nigeria, Challenger Deep, Montreal, Angel Falls, Gobi and Titicaca. Two related points:
   - Oman was removed from Flags only because of the flag file's licence. As a Geography answer it is fine. The Flags look-alike exclusions (Romania, Senegal, Slovenia, Venezuela and so on) also apply to Flags only, as that file notes.
   - Nigeria appears only as a wrong option (Accra). It is not an answer.
5. **"Capital" only where it is not in doubt.**
   - Khartoum is not called a capital. During the war the government worked from Port Sudan, and Britannica calls Khartoum the "executive capital".
   - Kuala Lumpur is not called a capital either. Putrajaya is Malaysia's administrative centre, although Kuala Lumpur is the official capital.
   - Samarkand is not a capital (Tashkent is), so its question does not say "capital".
6. **"Where is X located?" says "Name the country."** Without it, "in Asia" or "on the Nile" would be a fair answer.
7. **Difficulty.**
   - 100 to 200 are capitals most players know. Damascus, Khartoum and Tehran are very easy for Egyptian players.
   - Muscat was planned at 400 and moved to 300, because it is too easy for Arab players at 400. Addis Ababa moved from 300 to 400 to make room.
   - 500 adds a short clue to two of its questions (Adriatic, Caspian).
   - 600 has three classic stumpers: Ljubljana (often confused with Slovakia's Bratislava), Samarkand (not a capital) and Asuncion (often confused with Uruguay).
8. **Wrong options can be answers elsewhere.** Some wrong options are answers in other categories, such as Vietnam, Iceland, Jordan and Lebanon. A wrong option does not give any other question away, and the Flags and Geography sets already do the same.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|
| 100 | Where is Bangkok located? Name the country. | Thailand | أين تقع مدينة بانكوك؟ اذكر اسم الدولة. | تايلاند | Vietnam, Cambodia / فيتنام، كمبوديا | Reject Vietnam, Cambodia and Laos. "Siam" was the country's name until 1939: ask for today's name. |
| 100 | In which country is the city of Dublin? | Ireland (accept Republic of Ireland, Eire) | في أي دولة تقع مدينة دبلن؟ | أيرلندا (يُقبل: جمهورية أيرلندا) | United Kingdom, Iceland / المملكة المتحدة، آيسلندا | Reject United Kingdom and Northern Ireland (its capital is Belfast). |
| 100 | Damascus is the capital city of which country? | Syria | دمشق هي عاصمة أي دولة؟ | سوريا | Lebanon, Jordan / لبنان، الأردن | Reject Lebanon, Jordan and Iraq. |
| 200 | Prague is a city in which European country? | Czechia (accept Czech Republic) | براغ مدينة في أي دولة أوروبية؟ | التشيك (يُقبل: جمهورية التشيك) | Slovakia, Austria / سلوفاكيا، النمسا | Reject Czechoslovakia (split in 1993): ask for today's name. Reject Slovakia (capital Bratislava) and Austria. |
| 200 | In which country is Tehran? | Iran | في أي دولة تقع مدينة طهران؟ | إيران | Iraq, Afghanistan / العراق، أفغانستان | Reject Iraq (the classic mix-up, capital Baghdad) and Afghanistan. "Persia" is the old name: ask for today's name. |
| 200 | Where is Khartoum located? Name the country. | Sudan | أين تقع مدينة الخرطوم؟ اذكر اسم الدولة. | السودان | South Sudan, Chad / جنوب السودان، تشاد | Reject South Sudan (capital Juba) and Egypt. |
| 300 | Kuala Lumpur is a city in which country? | Malaysia | كوالالمبور مدينة في أي دولة؟ | ماليزيا | Indonesia, Singapore / إندونيسيا، سنغافورة | Reject Indonesia (capital Jakarta) and Singapore. |
| 300 | In which country is Muscat? | Oman (accept Sultanate of Oman) | في أي دولة تقع مدينة مسقط؟ | عُمان (يُقبل: سلطنة عُمان) | Yemen, Bahrain / اليمن، البحرين | Reject Yemen, Bahrain (capital Manama) and the UAE. |
| 300 | Caracas is a city in which South American country? | Venezuela | كاراكاس مدينة في أي دولة من دول أمريكا الجنوبية؟ | فنزويلا | Colombia, Ecuador / كولومبيا، الإكوادور | Reject Colombia (capital Bogota) and Ecuador. |
| 400 | Where is Bucharest located? Name the country. | Romania | أين تقع مدينة بوخارست؟ اذكر اسم الدولة. | رومانيا | Hungary, Bulgaria / المجر، بلغاريا | Reject Hungary: Budapest is the classic mix-up. Reject Bulgaria (capital Sofia). |
| 400 | In which country is Addis Ababa, home of the African Union's headquarters? | Ethiopia | في أي دولة تقع مدينة أديس أبابا، حيث مقر الاتحاد الأفريقي؟ | إثيوبيا | Kenya, Eritrea / كينيا، إريتريا | Reject Kenya (capital Nairobi) and Eritrea (capital Asmara). |
| 400 | In which country is the city of Accra? | Ghana | في أي دولة تقع مدينة أكرا؟ | غانا | Nigeria, Ivory Coast / نيجيريا، ساحل العاج | Reject Nigeria and Ivory Coast. |
| 500 | Dubrovnik, the walled old town on the Adriatic coast, is in which country? | Croatia | دوبروفنيك، البلدة القديمة المسوّرة على ساحل البحر الأدرياتيكي، تقع في أي دولة؟ | كرواتيا | Montenegro, Albania / الجبل الأسود، ألبانيا | Reject Montenegro (nearby Kotor looks similar), Albania and Italy. Reject Yugoslavia: ask for today's country. |
| 500 | Baku, on the shore of the Caspian Sea, is the capital of which country? | Azerbaijan | باكو، الواقعة على شاطئ بحر قزوين، هي عاصمة أي دولة؟ | أذربيجان | Kazakhstan, Turkmenistan / كازاخستان، تركمانستان | Reject Kazakhstan, Turkmenistan, Armenia and Georgia. |
| 500 | Dakar is a city in which West African country? | Senegal | داكار مدينة في أي دولة من دول غرب أفريقيا؟ | السنغال | Mali, Mauritania / مالي، موريتانيا | Reject Saudi Arabia: the Dakar Rally is held there now, but the city is in Senegal. Reject Mali and Mauritania. |
| 600 | Ljubljana is the capital city of which country? | Slovenia | ليوبليانا هي عاصمة أي دولة؟ | سلوفينيا | Slovakia, Serbia / سلوفاكيا، صربيا | Reject Slovakia (capital Bratislava): it is the classic mix-up, so listen carefully. Reject Serbia and Croatia. |
| 600 | The historic city of Samarkand, with its famous Registan square, is in which country? | Uzbekistan | مدينة سمرقند التاريخية، الشهيرة بساحة ريجستان، تقع في أي دولة؟ | أوزبكستان | Tajikistan, Kyrgyzstan / طاجيكستان، قيرغيزستان | Reject Tajikistan, Kyrgyzstan, Afghanistan and Iran. The capital is Tashkent, but the question asks only for the country. |
| 600 | Where is Asuncion located? Name the country. | Paraguay | أين تقع مدينة أسونسيون؟ اذكر اسم الدولة. | باراغواي | Uruguay, Bolivia / أوروغواي، بوليفيا | Reject Uruguay (capital Montevideo, the classic mix-up) and Bolivia. |

**Wrong options checked:**
- Every option is a sovereign country written as a bare country name, the same form as the answer, with no article or brackets.
- Where the question names a region ("European", "South American", "West African", Adriatic, Caspian), both options fit it:
  - Montenegro and Albania are on the Adriatic.
  - Kazakhstan and Turkmenistan border the Caspian.
  - Mali and Mauritania are in the UN's Western Africa region.
- None is also correct: each city lies in one country only, and no option is another name for the answer.
- The options differ from each other and from the answer (case-insensitive), in English and Arabic.
- No option is an answer within this set.

---

## Fact-check log

Each city-to-country fact, and each extra fact stated in a question, was checked in at least 2 independent sources. Britannica is the first source for every row. The CIA World Factbook was not used because it was discontinued in February 2026 ([NPR](https://www.npr.org/2026/02/07/nx-s1-5702494/cia-world-factbook-dead)).

| Points | City: answer | Sources |
|---|---|---|
| 100 | Bangkok: Thailand | [Britannica, Bangkok](https://www.britannica.com/place/Bangkok) (capital and chief port of Thailand), [EBSCO Research Starters, Bangkok, Thailand](https://www.ebsco.com/research-starters/geography-and-cartography/bangkok-thailand/) |
| 100 | Dublin: Ireland | [Britannica, Ireland](https://www.britannica.com/place/Ireland) (capital Dublin; official name Eire, in English Ireland), [EBSCO Research Starters, Dublin, Ireland](https://www.ebsco.com/research-starters/geography-and-cartography/dublin-ireland/) (capital of the Republic of Ireland). Accepted variants: Article 4 of the 1937 Constitution ("Eire, or, in the English language, Ireland"), and the Republic of Ireland Act 1948 ("the description of the State"). |
| 100 | Damascus: Syria | [Britannica, Syria](https://www.britannica.com/place/Syria) (capital Damascus), [Britannica, Damascus](https://www.britannica.com/place/Damascus), [EBSCO Research Starters, Damascus, Syria](https://www.ebsco.com/research-starters/geography-and-cartography/damascus-syria/) (capital of Syria) |
| 200 | Prague: Czechia | [EBSCO Research Starters, Prague, Czech Republic](https://www.ebsco.com/research-starters/geography-and-cartography/prague-czech-republic/) (capital of Czechia, also known as the Czech Republic), [UN, Czechoslovakia and successor states](https://www.un.org/en/node/123300) (short name Czechia notified to the UN on 17 May 2016), [UK Government, Czechia toponymic factfile](https://assets.publishing.service.gov.uk/media/6941572c58a21370f58f2fcd/Czechia_Toponymic_Factfile.pdf) |
| 200 | Tehran: Iran | [Britannica, Tehran](https://www.britannica.com/place/Tehran) (capital city of Iran), [EBSCO Research Starters, Tehran, Iran](https://www.ebsco.com/research-starters/geography-and-cartography/tehran-iran/) |
| 200 | Khartoum: Sudan | [Britannica, Khartoum](https://www.britannica.com/place/Khartoum) ("executive capital of Sudan", near the Blue and White Nile confluence), [Britannica, Sudan](https://www.britannica.com/place/Sudan), [EBSCO Research Starters, Khartoum, Sudan](https://www.ebsco.com/research-starters/geography-and-cartography/khartoum-sudan/) |
| 300 | Kuala Lumpur: Malaysia | [Britannica, Kuala Lumpur](https://www.britannica.com/place/Kuala-Lumpur) (capital of Malaysia), [Britannica, Putrajaya](https://www.britannica.com/place/Putrajaya) (administrative centre, 25 km south of the capital Kuala Lumpur), [Encyclopedia.com, Status of the World's Nations](https://www.encyclopedia.com/international/legal-and-political-magazines/status-worlds-nations-1) (Malaysia: Kuala Lumpur) |
| 300 | Muscat: Oman | [Britannica, Muscat](https://www.britannica.com/place/Muscat) (capital of Oman, on the Gulf of Oman), [Britannica, What is the capital city of Oman?](https://www.britannica.com/question/What-is-the-capital-city-of-Oman), [Encyclopedia.com, Status of the World's Nations](https://www.encyclopedia.com/international/legal-and-political-magazines/status-worlds-nations-1) (Oman, Sultanate of Oman: Muscat) |
| 300 | Caracas: Venezuela | [Britannica, Caracas](https://www.britannica.com/place/Caracas) (capital of Venezuela), [Encyclopedia.com, Caracas](https://www.encyclopedia.com/places/latin-america-and-caribbean/south-american-political-geography/caracas) |
| 400 | Bucharest: Romania | [Britannica, Bucharest](https://www.britannica.com/place/Bucharest) (national capital, Romania), [Encyclopedia.com, Status of the World's Nations](https://www.encyclopedia.com/international/legal-and-political-magazines/status-worlds-nations-1) (Romania: Bucharest) |
| 400 | Addis Ababa: Ethiopia | [Britannica, Addis Ababa](https://www.britannica.com/place/Addis-Ababa) (capital of Ethiopia, home of the African Union headquarters), [African Union, The AU Commission](https://au.int/en/commission) (based in Addis Ababa, Ethiopia), [African Union, Visit the AU Headquarters](https://au.int/en/visit-au-headquarters) |
| 400 | Accra: Ghana | [Britannica, Accra](https://www.britannica.com/place/Accra) (capital and largest city of Ghana), [Encyclopedia.com, Accra](https://www.encyclopedia.com/places/africa/ghanan-political-geography/accra) |
| 500 | Dubrovnik: Croatia | [UNESCO World Heritage Centre, Old City of Dubrovnik (no. 95)](https://whc.unesco.org/en/list/95/) (State Party Croatia, Adriatic coast, Dubrovnik-Neretva County), [Britannica, Dubrovnik](https://www.britannica.com/place/Dubrovnik) (port in southeastern Croatia on the Adriatic; walls encircle most of the old city) |
| 500 | Baku: Azerbaijan | [Britannica, Baku](https://www.britannica.com/place/Baku) (capital of Azerbaijan, western shore of the Caspian Sea), [UNESCO World Heritage Centre, Walled City of Baku (no. 958)](https://whc.unesco.org/en/list/958/) (Azerbaijan) |
| 500 | Dakar: Senegal | [Britannica, Dakar](https://www.britannica.com/place/Dakar) (capital of Senegal, Cape Verde Peninsula), [EBSCO Research Starters, Dakar, Senegal](https://www.ebsco.com/research-starters/geography-and-cartography/dakar-senegal/) (capital and largest city). West Africa: Britannica describes it as a seaport on the western African coast. |
| 600 | Ljubljana: Slovenia | [Britannica, Slovenia](https://www.britannica.com/place/Slovenia) (capital Ljubljana), [Britannica Kids, Ljubljana](https://kids.britannica.com/kids/article/Ljubljana/345949) (capital since independence in 1991), [EBSCO Research Starters, Ljubljana, Slovenia](https://www.ebsco.com/research-starters/geography-and-cartography/ljubljana-slovenia/) |
| 600 | Samarkand: Uzbekistan | [Britannica, Samarkand](https://www.britannica.com/place/Samarkand-Uzbekistan) (city in east-central Uzbekistan, Timur's capital), [UNESCO World Heritage Centre, Samarkand - Crossroad of Cultures (no. 603)](https://whc.unesco.org/en/list/603) (Uzbekistan; the listing names "the Registan mosque and madrasahs" and "Registan Square") |
| 600 | Asuncion: Paraguay | [Britannica, Asuncion](https://www.britannica.com/place/Asuncion) (city and capital of Paraguay, on the Paraguay River), [Encyclopedia.com, Asuncion](https://www.encyclopedia.com/places/latin-america-and-caribbean/south-american-political-geography/asuncion) (capital of Paraguay since 14 May 1811) |

### Dropped or reworded during fact-checking

- **Reworded:**
  - Khartoum: "capital" was dropped. Britannica calls it the "executive capital", and the government worked from Port Sudan during the war.
  - Kuala Lumpur: "capital" was dropped because of the Putrajaya split.
  - Kuala Lumpur: the planned clue "home of the Petronas Towers" was cut, because "The Petronas Towers" is a Landmarks 600 answer.
  - Damascus: the planned clue "one of the oldest continuously inhabited cities" was cut. It is a claim made for several cities, so the question is plain.
  - Samarkand: the planned clue on the Silk Road was cut, because "Silk Road" is a rejected History answer. Registan square is used instead, as named in UNESCO's listing.
  - Dakar: the Dakar Rally is not mentioned, because it now runs in Saudi Arabia. The host note covers that near-miss.
- **Moved:** Muscat from 400 to 300 and Addis Ababa from 300 to 400 (see note 7).
- **Not used:**
  - Tegucigalpa, Windhoek, Tallinn and Salzburg were checked against the bank and are free, but did not make the final 18. They are spares if you remove a row.
  - Tunis, Algiers, Tripoli and Kinshasa were not used: the name gives the country away, the city name is ambiguous, or the country name is (DR Congo vs Congo).

---

## Process notes

- **Duplicate check:**
  - Done against all 764 questions in the local DB (13 categories): question texts, answers and the stored wrong options, with read-only SELECTs.
  - None of the 18 answers is an answer anywhere in the bank. After the load, a query comparing answers (cut at the first bracket) found 0 matches outside this set.
  - No existing question text names any of the 18 cities or 18 answer countries. The only matches were wrong options (for example "Prague Astronomical Clock", and Thailand, Malaysia and Sudan as Flags wrong options).
- **Local DB load:**
  - MariaDB was already running.
  - Before: 764 questions. Geography 15 / 14 / 14 / 11 / 10 / 11 (100-600), 75 in total.
  - Run 1 added exactly 18 rows (ids 1443-1460): 782 questions, Geography 18 / 17 / 17 / 14 / 13 / 14, 93 in total. No other category changed. No row was skipped.
  - Run 2 added nothing: the counts were identical.
  - All 18 rows have `image = ''`, all 4 option fields and both Arabic fields filled. The Arabic text is stored as utf8mb4 (checked by hex).
- **Checks on the loaded rows:**
  - The English text and options are plain ASCII with no pipes, backslashes or semicolons.
  - The longest question is 85 characters.
  - Options have no brackets.
- **Prompt injection:** no retrieved page contained instructions aimed at the assistant.
- **Git:** nothing was committed, staged or branched.

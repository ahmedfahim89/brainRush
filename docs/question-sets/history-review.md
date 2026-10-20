# Review: History questions

- **Request:** owner request of 2026-10-20: 14 new questions for the existing "History" category, 3 at 300, 5 at 400, 3 at 500 and 3 at 600. Each one should match the difficulty of the existing History questions at the same value, and the set should be spread over eras (ancient, medieval, modern) and regions (Egypt and the Arab world, and the wider world).
- **Date:** 2026-10-20
- **SQL file:** `sql/add-history-questions.sql` (loaded into the local DB, see the end of this doc)
- **Point values (local DB):** 100, 200, 300, 400, 500, 600

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| History (this set) | 0 | 0 | 2 | 5 | 1 | 1 | 9 |
| History before | 13 | 11 | 11 | 8 | 9 | 9 | 61 |
| History after | 13 | 11 | 13 | 13 | 10 | 10 | 70 |

**Owner removal (2026-10-20):** the set was drafted as 14. The owner removed 5 and asked for them not to be replaced: Marco Polo (300), Hammurabi (500), the Romanovs (500), the Minoans (600) and Justinian / Hagia Sophia (600). Don't re-add them or top the set up. The question and source tables show only the 9 that remain. The notes on how the set was built were written for the full 14.

**How the set was built**
- Difficulty was compared with the existing History questions in the local DB at each value:
  - 300 (11): the Colosseum, Columbus, Queen Victoria, Dallas, the Mongol Empire, the Arab Spring, Pope Francis, Lincoln, Nefertiti, Cuba, Hiroshima. The new 300s are household names: Marco Polo, Al-Azhar, Nixon.
  - 400 (8): the Berlin Wall year, the Titanic year, Marie Curie, the WWI year, Ramesses II, the AI Act, Magellan, the Ottoman Empire. The new 400s are well-known people, places and years, with a clear clue: Sparta, Hannibal, Harun al-Rashid, 1952, Poland.
  - 500 (9): Vasco da Gama, Sputnik, Augustus, Hatshepsut, Prince Harry, South Sudan, Sam Altman, Versailles, Babylon. The new 500s are names a keen quiz player knows: Hammurabi, Amr ibn al-As, the Romanovs.
  - 600 (9): Khufu, Imhotep, Akhenaten, Ptolemy I, Chile, Saudi Arabia, Hephaestus, Qutuz, Champollion. The new 600s are at the level of Qutuz and Ptolemy I: the Minoans, Justinian, Ahmed Urabi.
- Spread over eras and regions:

| Points | Ancient | Medieval | Modern |
|---|---|---|---|
| 300 | | Al-Azhar (Egypt) | Nixon (USA) |
| 400 | Sparta (Greece), Hannibal (Carthage, North Africa) | Harun al-Rashid (Abbasid Iraq) | 1952 (Egypt), Poland (Europe) |
| 500 | | Amr ibn al-As (Egypt) | |
| 600 | | | Ahmed Urabi (Egypt) |

  After the owner's removal that is 2 ancient, 3 medieval and 4 modern questions. Five are from Egypt and the Arab world (Al-Azhar, Harun al-Rashid, 1952, Amr ibn al-As, Urabi), plus Hannibal from North Africa. There is no ancient Egypt question, because History already has 11 of them (Cleopatra, the Sphinx, Tutankhamun, the Rosetta Stone, Nefertiti, Ramesses II, Hatshepsut, Khufu, Imhotep, Akhenaten, Ptolemy I).
- **Duplicate check:** checked against all 595 questions in the local DB (all 10 categories, English and Arabic text, read from the DB itself, not only from the SQL files), plus every `sql/*.sql` file and the review docs in `docs/question-sets/`.
  - No existing question or answer is about any of the 14 topics, in English or Arabic. Searched terms included Sparta, Thermopylae, Leonidas, Hannibal, Carthage, Marco Polo, Kublai, Azhar, Nixon, Watergate, Harun, Abbasid, Free Officers, 1952, Poland, 1939, Hammurabi, Louvre, Amr, Fustat, Romanov, Tsar, Minoan, Knossos, Crete, Justinian, Hagia Sophia, Byzantine, Urabi, Abdeen, Khedive, and their Arabic forms.
  - No new answer is named in an existing question or answer. The only partial word matches are unrelated: "Marco" (Marco Materazzi in a Sports question), "Amr" (Al-Hakim bi-Amr Allah in a Food question) and "Rashid" (the goat Rashida in an Egyptians question).
  - None of the new questions names an answer that is already in the bank. Examples: the Nixon question does not say "US" (the United States is a Geography answer), the Romanov question does not name Russia, the Hagia Sophia question does not name Istanbul, the Marco Polo question says "Italian", not "Venetian" (Venice is an answer), the 1952 question does not name King Farouk (Farouk El-Baz is a Science answer), and the Urabi question does not mention Tel el-Kebir (El Kebir Awi is an Egyptians answer).
  - No new question gives away another new answer.
- English text is plain ASCII with no semicolons, pipes or backslashes. Every question is under 250 characters (the longest is 153).

**Points for the owner to decide**
1. **The Egypt and Arab questions may be easier for Egyptian players.** Al-Azhar (300) is close to a 200 for Egyptians. Amr ibn al-As (500), Urabi (600) and 1952 (400) are taught in Egyptian schools, and Harun al-Rashid (400) is well known across the Arab world. This matches the existing Qutuz 600, which is also easier at home than abroad. Each of them could move down one value if it plays easily.
2. **Sparta may be easy for 400** because of the film "300". It names King Leonidas and the 300 soldiers to keep it fair at 400. Without those clues it would be closer to 500.
3. **The Nixon question says "Which president" with no country,** on purpose (see the duplicate check). Watergate makes the answer clear.
4. **Concurrent change in the local DB during the load.** Between my "before" count (595) and the first run, a row I did not touch was deleted: id 976, Sports 500, "Which athlete won four gold medals at the 1936 Olympics in Berlin?" (Jesse Owens). Ids 977 and 978 were also used and are gone. This file only inserts History rows. Resolved: it was the owner's removal of Jesse Owens from the Sports 500 set, done in another session.
5. **Removed suggestions from 2026-10-19 are unknown.** The owner removed 124 suggestions from the general set, and their texts aren't kept in the repo. Topics that are in the set files or review docs but not in the DB were treated as rejected and left out (see "Considered and not used"). If any of the 14 topics here was among the removed suggestions, remove it.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 300 | Which mosque in Egypt, founded in the 10th century, grew into one of the oldest universities in the world and a leading centre of Sunni Islamic learning? | Al-Azhar (accept Al-Azhar Mosque, Al-Azhar University) | أي مسجد في مصر، تأسس في القرن العاشر الميلادي، تحوّل إلى واحدة من أقدم الجامعات في العالم ومنارة كبرى للعلوم الإسلامية السنية؟ | الجامع الأزهر (جامعة الأزهر) | Reject Cairo University (1908), Al-Qarawiyyin (in Fez, not Egypt), the Mosque of Ibn Tulun, Al-Hussein Mosque. |
| 300 | Which president resigned in 1974 because of the Watergate scandal? | Richard Nixon | أي رئيس استقال من منصبه عام 1974 بسبب فضيحة "ووترغيت"؟ | ريتشارد نيكسون | Accept "Nixon". Reject Gerald Ford (his successor, who pardoned him), Lyndon Johnson, John F. Kennedy. |
| 400 | Which Greek city-state sent its King Leonidas with 300 of its soldiers to hold the pass of Thermopylae against the Persians in 480 BC? | Sparta (accept the Spartans) | أي دولة مدينة إغريقية أرسلت ملكها ليونيداس ومعه 300 من جنودها للدفاع عن ممر ثيرموبيلاي في وجه الفرس عام 480 قبل الميلاد؟ | إسبرطة | Accept Lacedaemon. Reject Athens, Thebes, Thespiae (Thebans and Thespians also fought there, but Leonidas was Sparta's king), Macedonia. |
| 400 | Which general from Carthage, in what is now Tunisia, crossed the Alps with war elephants in 218 BC to invade Italy? | Hannibal (accept Hannibal Barca) | أي قائد من قرطاج، في تونس حاليًا، عبر جبال الألب مع فيلة الحرب عام 218 قبل الميلاد لغزو إيطاليا؟ | هانيبال (حنبعل) | Reject Hamilcar (his father), Hasdrubal (his brother), Scipio (the Roman who defeated him), Alexander the Great. |
| 400 | Which Abbasid caliph, who ruled from 786 to 809, appears in many tales of the "One Thousand and One Nights"? | Harun al-Rashid (accept Haroun al-Rashid) | أي خليفة عباسي، حكم من عام 786 إلى عام 809 ميلادية، يظهر في كثير من حكايات "ألف ليلة وليلة"؟ | هارون الرشيد | Reject Shahryar (the king in the frame story), al-Mamun (his son), al-Mansur (who founded Baghdad), Saladin. |
| 400 | In which year did the Free Officers seize power in Egypt and force the king to give up his throne? | 1952 | في أي عام استولى الضباط الأحرار على السلطة في مصر وأجبروا الملك على التنازل عن العرش؟ | 1952 | Accept "July 1952". Reject 1953 (the year the republic was declared), 1956, 1919. |
| 400 | On 1 September 1939, Germany started World War II in Europe by invading which country? | Poland | في 1 سبتمبر 1939، بدأت ألمانيا الحرب العالمية الثانية في أوروبا بغزو أي دولة؟ | بولندا | Reject Czechoslovakia (occupied in March 1939), Austria (annexed in 1938), France (invaded in 1940), Belgium. |
| 500 | Which Arab commander led the Muslim conquest of Egypt from 639 and founded the city of Fustat? | Amr ibn al-As (accept Amr ibn al-Aas) | أي قائد عربي قاد الفتح الإسلامي لمصر بدءًا من عام 639 ميلادية، وأسس مدينة الفسطاط؟ | عمرو بن العاص | Reject Khalid ibn al-Walid, Umar ibn al-Khattab (the caliph at the time), Jawhar al-Siqilli (who founded Cairo), Ahmad ibn Tulun, Saladin. |
| 600 | Which Egyptian army officer confronted Khedive Tawfiq at Abdeen Palace in 1881 and led the nationalist revolt that bears his name? | Ahmed Urabi (accept Orabi, Arabi Pasha) | أي ضابط مصري واجه الخديوي توفيق أمام قصر عابدين عام 1881، وقاد الثورة الوطنية التي تحمل اسمه؟ | أحمد عرابي | Accept Urabi Pasha. Reject Mustafa Kamil, Saad Zaghloul (the 1919 revolution), Muhammad Naguib, Mahmoud Sami al-Barudi (prime minister in Urabi's government). |

---

## Fact-check log

Each answer, and each fact stated in its question, was checked against at least 2 independent sources. Britannica content was checked through search results rather than fetched pages, and a second source was always checked separately.

| Points | Answer | Sources |
|---|---|---|
| 300 | Al-Azhar | [Britannica: al-Azhar University](https://www.britannica.com/topic/al-Azhar-University) (founded by the Fatimids about 970-972, later a centre of Sunni learning, chief centre of Islamic and Arabic learning), [Wikipedia: Al-Azhar University](https://en.wikipedia.org/wiki/Al-Azhar_University) (founded in 970, one of the oldest universities in the world), [Wikipedia: Al-Azhar Mosque](https://en.wikipedia.org/wiki/Al-Azhar_Mosque) (first prayers in 972), [Muslim Heritage: Al-Azhar University](http://muslimheritage.com/al-azhar-university/) |
| 300 | Richard Nixon | [US National Archives: Nixon's resignation](https://www.archives.gov/exhibits/american_originals/nixon.html) (resigned on 9 August 1974 under threat of impeachment), [Miller Center: Watergate aftermath](https://millercenter.org/the-presidency/educational-resources/watergate/watergate-aftermath), [Britannica: Nixon resigns, Watergate's legacy](https://www.britannica.com/event/Nixon-resigns-Watergates-legacy), [History.com: Watergate scandal](https://www.history.com/articles/watergate) |
| 400 | Sparta | [World History Encyclopedia: Battle of Thermopylae](https://www.worldhistory.org/thermopylae/) (August 480 BCE, 300 Spartans under Leonidas plus allies against Xerxes), [EBSCO Research Starters: Battle of Thermopylae](https://www.ebsco.com/research-starters/history/battle-thermopylae/), [Wikipedia: Last Stand of the 300](https://en.wikipedia.org/wiki/Last_Stand_of_the_300) |
| 400 | Hannibal | [Britannica: Hannibal](https://www.britannica.com/biography/Hannibal-Carthaginian-general-247-183-BCE) (Carthaginian general, crossed the Alps with war elephants to invade Italy, reached the Po valley in 218 BCE), [Britannica: Second Punic War](https://www.britannica.com/event/Second-Punic-War), [Wikipedia: Hannibal's crossing of the Alps](https://en.wikipedia.org/wiki/Hannibal%27s_crossing_of_the_Alps) (autumn 218 BC), [Popular Science](https://www.popsci.com/science/hannibal-cross-alps-elephants-energy/) (37 war elephants) |
| 400 | Harun al-Rashid | [Britannica: Harun al-Rashid](https://www.britannica.com/biography/Harun-al-Rashid) (fifth Abbasid caliph, 786-809, a central character in "The Thousand and One Nights"), [Oxford Reference: Harun al-Rashid](https://www.oxfordreference.com/display/10.1093/oi/authority.20110803095923311), [Encyclopedia.com: Harun al-Rashid](https://www.encyclopedia.com/people/history/middle-eastern-history-biographies/harun-al-rashid), [Wikipedia: Harun al-Rashid](https://en.wikipedia.org/wiki/Harun_al-Rashid) (reigned September 786 to March 809) |
| 400 | 1952 | [Britannica: Egypt, the revolution and the republic](https://www.britannica.com/place/Egypt/The-revolution-and-the-Republic) (the Free Officers toppled the monarchy in a coup on 23 July 1952), [Wikipedia: Egyptian revolution of 1952](https://en.wikipedia.org/wiki/Egyptian_revolution_of_1952), [Wikipedia: Republic of Egypt (1953-1958)](https://en.wikipedia.org/wiki/Republic_of_Egypt_(1953%E2%80%931958)) (Farouk forced to abdicate for his son and left on 26 July 1952), [Middle East Monitor: Remembering the 1952 revolution](https://www.middleeastmonitor.com/20170723-remembering-the-1952-egyptian-revolution/) |
| 400 | Poland | [Britannica: World War II](https://www.britannica.com/event/World-War-II) (began in Europe on 1 September 1939 when Germany invaded Poland), [USHMM: Invasion of Poland, fall 1939](https://encyclopedia.ushmm.org/content/en/article/invasion-of-poland-fall-1939), [History.com: Germany invades Poland](https://www.history.com/this-day-in-history/september-1/germany-invades-poland), [World History Encyclopedia: Invasion of Poland](https://www.worldhistory.org/article/2559/the-invasion-of-poland-in-1939/) |
| 500 | Amr ibn al-As | [Britannica: Amr ibn al-As](https://www.britannica.com/biography/Amr-ibn-al-As) (Arab conqueror of Egypt, founded the garrison city of al-Fustat), [Oxford Reference: Amr ibn al-As](https://www.oxfordreference.com/display/10.1093/oi/authority.20110803095409773) (invaded Egypt in 639, founded Fustat as capital), [Wikipedia: Fustat](https://en.wikipedia.org/wiki/Fustat), [Wikipedia: Arab conquest of Egypt](https://en.wikipedia.org/wiki/Arab_conquest_of_Egypt) (December 639 to September 642) |
| 600 | Ahmed Urabi | [Britannica: Urabi Pasha](https://www.britannica.com/biography/Urabi-Pasha) (led the 1881 revolt, nationalist leader against Khedive Tawfiq), [Encyclopedia.com: Urabi Rebellion](https://www.encyclopedia.com/history/encyclopedias-almanacs-transcripts-and-maps/urabi-rebellion) (on 9 September 1881, Urabi and the officers marched to Tawfiq's palace), [Cambridge History of Egypt, ch. 9: The Urabi revolution and the British conquest](https://resolve.cambridge.org/core/books/abs/cambridge-history-of-egypt/urabi-revolution-and-the-british-conquest-18791882/BD8A4DFB05CC2C5695074E1A9B44524F), [Egypt State Information Service: Ahmed Urabi](https://sis.gov.eg/en/egypt/egyptian-figures/ahmed-urabi/), [Wikipedia: Urabi revolt](https://en.wikipedia.org/wiki/Urabi_revolt) |

### Dropped or reworded during fact-checking

- **Sparta:** the draft said the "300 soldiers made a famous last stand". On the last day, the Spartans were joined by 700 Thespians and about 400 Thebans, so the question now says Sparta "sent its King Leonidas with 300 of its soldiers to hold the pass".
- **Al-Azhar:** sources give 970 or 972 as the founding date, and Al-Qarawiyyin in Fez is older. The question says "the 10th century" and "one of the oldest universities". Al-Azhar was founded by the Shia Fatimids and became Sunni later, so the question says it "grew into" a Sunni centre.
- **Ahmed Urabi:** sources disagree on when the revolt began (1879 in Britannica and Wikipedia, 1881 in Encyclopedia.com). The question uses the well-documented confrontation at Abdeen Palace on 9 September 1881 instead. The famous "we are not slaves" quote was left out, because its exact wording comes from a single later account.
- **1952:** the question asks when the Free Officers seized power and forced the king to abdicate (both July 1952), not when the monarchy ended, because the republic was declared in June 1953. King Farouk is not named, because Farouk El-Baz is a Science answer.
- **Poland:** "in Europe" was added, because some historians date the start of World War II in Asia to 1937.
- **Amr ibn al-As:** sources date the founding of Fustat to 641 or 642, so the question does not give a year for it. The conquest dates from December 639.
- **Considered and not used:**
  - Tariq ibn Ziyad (dropped): the Arabic answer to the Geography 200 Strait of Gibraltar question is مضيق جبل طارق, which names him. The question would also point to Gibraltar, an existing answer.
  - Baghdad (Abbasid capital), Alexandria and Constantinople: named in existing questions or answers.
  - Gamal Abdel Nasser and the Suez Crisis: Lake Nasser, "Nasser 56", the Suez Canal and France are already in the bank.
  - Saladin, Shah Jahan (Taj Mahal), the Colossus of Rhodes, the Bastille, Marie Antoinette, the Silk Road, Muhammad Ali Pasha and Florence Nightingale: in the 2026-10-19 review doc or set files but not in the DB, so treated as removed by the owner, or blocked by an existing answer.
  - Mayflower, Magna Carta, Henry VIII, Hadrian's Wall, the Incas, Malala Yousafzai, the Paris Agreement, the Maya calendar, AlphaGo, Watson, Dartmouth, the Mechanical Turk and Tay: in the SQL files but not in the DB, so treated as removed by the owner.
  - Huda Shaarawi and 1066 (Battle of Hastings): kept in reserve.

### Process notes

- **Local DB load:** MariaDB was already running.
  - Export for the duplicate check: 592 questions. By the time of the load, 3 Sports 500 rows (ids 974-976) had been added by someone else, so the "before" count is 595. They were checked and don't clash with this set.
  - Before: 595 questions, History 13 / 11 / 11 / 8 / 9 / 9 (61).
  - Run 1 added all 14 rows (ids 979-992): History 13 / 11 / 14 / 13 / 12 / 12 (75), with every value up by exactly the number of rows in the file. The total went to 608, not 609, because row 976 (Sports 500, Jesse Owens) was deleted by someone else during this window. That was not done by this file, which only inserts History rows.
  - Run 2 added nothing (idempotent): still 608 in total and 75 History.
  - Owner removal: the 5 removed questions (ids 979, 987, 989, 990, 991) were deleted from the local DB and from this file and the SQL file. History is now 13 / 11 / 13 / 13 / 10 / 10 (70). The local total was 662 before the delete and 657 after, because other work had added questions in the meantime.
  - No row was skipped. The English text is pure ASCII with no semicolons, pipes or backslashes, and the Arabic text was stored correctly (utf8mb4 check on all 14 rows).
- **Prompt injection:** no retrieved page contained instructions aimed at the assistant.

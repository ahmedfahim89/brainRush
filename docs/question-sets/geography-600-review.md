# Review: Geography 600 questions

- **Request:** owner request of 2026-10-20: 3 new questions for the existing "Geography" category, all at 600 (the hardest value). They should be hard, but answerable by a keen trivia player, not obscure.
- **Date:** 2026-10-20
- **SQL file:** `sql/add-geography-600-questions.sql` (loaded into the local DB, see the end of this doc)
- **Point values (local DB):** 100, 200, 300, 400, 500, 600

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Geography (this set) | 0 | 0 | 0 | 0 | 0 | 2 | 2 |
| Geography before | 15 | 14 | 14 | 11 | 10 | 9 | 73 |
| Geography after | 15 | 14 | 14 | 11 | 10 | 11 | 75 |

**Owner removal (2026-10-20):** the set was drafted as 3. The owner removed the Challenger Deep question and it was not replaced. Don't re-add it. The tables below show only the 2 that remain.

**How the set was built**
- Difficulty was compared with the 9 existing Geography 600 questions in the local DB: Sinai, Siwa, Qattara Depression, Mount Catherine, El Salvador (crypto), India (population), South Korea (robots), Lesotho and Bab el-Mandeb. The new questions are at the level of Lesotho and Bab el-Mandeb: a named world feature or curiosity that keen quiz players know, with a clear clue in the question.
- The existing 600s are mostly Egyptian places and country answers. To spread the topics, the new set has one desert in the Arab world and one country:

| Points | Desert | Country |
|---|---|---|
| 600 | Rub al Khali | Nepal (flag) |

- **Duplicate check:** checked against all 577 questions in the local DB (all 10 categories, English and Arabic text), plus every `sql/*.sql` file and the review docs in `docs/question-sets/`.
  - No question or answer is about Nepal or the Rub al Khali / Empty Quarter, in English or Arabic.
  - No answer word appears in an existing question.
  - None of the new questions names an answer that is already in the bank. The desert question says "the south of the Arabian Peninsula" and does not name Saudi Arabia, Yemen or the UAE (all existing answers). The Nepal question does not mention the Himalayas, Everest, India or China (all existing answers or named in the Himalayas question).
  - Near-topic already in the bank: the Sahara (100, "largest hot desert"). The Rub al Khali question asks about a different fact and names its region, so they don't overlap.
- English text is plain ASCII with no semicolons. Every question is under 250 characters (the longest is 146).

**Points for the owner to decide**
1. **Rub al Khali may be easier for Arab players.** Many Egyptian and Gulf players know the Empty Quarter (الربع الخالي) well, so it may play more like a 500 for them. This matches the existing Egyptian 600s (Siwa, Qattara), which are also easier at home than abroad.
2. **Nepal may be on the easy side for 600.** "Nepal's flag is the only non-rectangular one" is a well-known quiz fact. It fits "hard but not obscure", but it could move to 500 if it plays easily.
3. **Nepal's flag could change in theory.** In 2009 a constitutional committee debated a rectangular flag, but the current flag was kept and is set out in the constitution. The risk is low, but it is the only fact in this set that could go out of date.
4. **Removed suggestions from 2026-10-19 are unknown.** The owner removed 124 suggestions from the general set (including some Geography ones), and their texts aren't kept in the repo. I couldn't check whether any of these three topics were among them. If one was, remove it.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 600 | What is the name of the vast desert in the south of the Arabian Peninsula that holds the largest continuous area of sand in the world? | The Rub al Khali (accept the Empty Quarter) | ما اسم الصحراء الشاسعة في جنوب شبه الجزيرة العربية، التي تضم أكبر مساحة متصلة من الرمال في العالم؟ | الربع الخالي | Accept "Rub' al-Khali" in any spelling. Reject the Arabian Desert (the wider desert that the Rub al Khali is part of), the Nafud, the Sahara and the Dahna. |
| 600 | Which Asian country has the only national flag in the world that is neither a rectangle nor a square, shaped like two stacked triangular pennants? | Nepal | أي دولة آسيوية لديها العلم الوطني الوحيد في العالم الذي ليس مستطيلًا ولا مربعًا، إذ يتكوّن من رايتين مثلثتين إحداهما فوق الأخرى؟ | نيبال | Reject Bhutan (dragon flag, rectangular), Tibet and Sri Lanka. Switzerland and Vatican City have square flags, which the question rules out. |

---

## Fact-check log

Each answer, and each fact stated in its question, was checked against at least 2 independent sources.

| Points | Answer | Sources |
|---|---|---|
| 600 | Rub al Khali | [Britannica: Rub' al-Khali](https://www.britannica.com/place/Rub-al-Khali) (vast desert in the southern Arabian Peninsula, largest area of continuous sand in the world, name means "Empty Quarter", mainly in Saudi Arabia with parts in Yemen, Oman and the UAE), [Britannica Students: Rub' al-Khali](https://kids.britannica.com/students/article/Rub%CA%BF-al-Khali/627295) (largest expanse of continuous sand in the world), [EBSCO Research Starters: Rub' al Khali Desert](https://www.ebsco.com/research-starters/science/rub-al-khali-desert/) (largest continuous sand desert, or erg, on Earth), [Wikipedia: Arabian Desert](https://en.wikipedia.org/wiki/Arabian_Desert) (largest continuous body of sand in the world) |
| 600 | Nepal | [Britannica: Flag of Nepal](https://www.britannica.com/topic/flag-of-Nepal) (non-rectangular national flag made of two united pennant shapes, the only country without a rectangular national flag), [Flags of the World: Nepal](https://www.fotw.info/flags/np.html) (based on two pennants, adopted 16 December 1962, probably the only surviving flag of that kind), [Wikipedia: Flag of Nepal](https://en.wikipedia.org/wiki/Flag_of_Nepal) (only non-rectangular/square national flag, a double pennon), [Flags of the World: Nepal, proposals to change the flag](https://www.fotw.info/flags/np!.html) (2009 proposal to change it, the flag was kept) |

### Dropped or reworded during fact-checking

- **Rub al Khali:** "largest sand desert" became "the largest continuous area of sand". The Sahara is the larger desert overall, but most of it is gravel and rock, and the sources describe the Rub al Khali as the largest continuous sand area. The Arabic avoids the words الربع and الخالي, which would give the answer away.
- **Nepal:** "the only non-rectangular flag" became "neither a rectangle nor a square", because Switzerland and Vatican City have square flags.
- **Considered and not used:**
  - Uzbekistan (doubly landlocked): too close in style to the Lesotho 600 question.
  - Canada (longest coastline): Canada is named in the Ottawa question.
  - France (most time zones): France is already an answer.
  - Bolivia / La Paz (highest capital): disputed, because Sucre is the constitutional capital.
  - Atacama: dropped so the set doesn't have two deserts.
  - Angel Falls / Venezuela: kept in reserve.

### Process notes

- **Local DB load:** MariaDB was already running.
  - Before: 577 questions, Geography 15 / 14 / 14 / 11 / 10 / 9 (73), Geography 600 = 9.
  - Run 1 added 3 rows (ids 934-936): 580 questions, Geography 600 = 12, Geography total 76.
  - Run 2 added nothing (idempotent): still 580 and 12. No row was skipped, and the Arabic text was stored correctly (utf8mb4 check on all 3 rows).
  - Owner removal: the Challenger Deep question (id 935) was deleted from the local DB (596 -> 595; other changes had brought the total from 580 to 596 in the meantime) and from this file and the SQL file. Geography 600 is now 11 and Geography 75. Running the trimmed SQL file again added nothing.
- **Side note on an existing question:** the Arabic text of Geography 600 "Bab el-Mandeb" (id 622) mentions اليمن (Yemen), which is the answer to the Food & Drink 500 "mocha" question. The English text does not. This was not changed, because this set only adds rows.
- **Prompt injection:** no retrieved page contained instructions aimed at the assistant.

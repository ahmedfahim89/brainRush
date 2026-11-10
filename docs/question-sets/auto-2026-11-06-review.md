# Automatic batch 2026-11-06: review

## Live/local differences (from the brief)

- Not available this run. The read-only GET of https://brainrush.integration.ninja/api/categories.php could not run because no one was there to approve network tools in this scheduled run. So there is no live/local comparison this time; the owner may want to compare the counts by hand.

## Reported questions

No open local reports. The owner still needs to check the live Admin > Reports panel.

## Status: no slots filled

All 10 slots are left empty, and `sql/add-auto-2026-11-06-questions.sql` was not written.

Why: WebSearch and WebFetch both need a person's approval, and nobody opened this scheduled run, so no web source could be checked. The producer rules say every answer and every fact in a question must be confirmed in at least 2 independent reputable sources, and that a slot that can't pass the fact-check stays empty rather than being filled with a weaker question. The picture slot (Landmarks 500) also needs a downloaded, licence-checked image, which isn't possible without network access. Network tools were not worked around (for example with curl).

To save time on the next run, the drafts below have every field filled in. They were benchmarked against the local DB and checked for duplicates, but **none of them has been fact-checked**. A run with network access must check each one in 2+ sources before any of them goes into a SQL file.

Local DB, read only, 2026-11-06: 873 questions in total. Nothing was loaded and no git commands were run.

| Category | Points | Brief asked | In the file | Local count now |
|---|---|---|---|---|
| Who Am I? | 200 | 1 | 0 (not fact-checked) | 4 |
| Who Am I? | 400 | 1 | 0 (not fact-checked) | 4 |
| Who Am I? | 500 | 2 | 0 (not fact-checked) | 3 |
| Cartoons & Childhood | 400 | 2 | 0 (not fact-checked) | 4 |
| Cartoons & Childhood | 500 | 1 | 0 (not fact-checked) | 5 |
| Landmarks | 500 (picture) | 1 | 0 (no image, not fact-checked) | 5 |
| Food & Drink | 400 | 1 | 0 (not fact-checked) | 6 |
| AI | 500 | 1 | 0 (not fact-checked) | 6 |

## Drafts awaiting fact-check (NOT in any SQL file)

| ID | Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note / what to verify |
|---|---|---|---|---|---|---|---|---|
| 1106-01 | Who Am I? | 200 | I was a composer born in Bonn in 1770. I kept composing after I went deaf, and my Ninth Symphony ends with the famous "Ode to Joy". Who am I? | Ludwig van Beethoven (accept Beethoven) | كنت مؤلفًا موسيقيًا وُلدت في مدينة بون عام 1770. واصلت التأليف بعد أن فقدت سمعي، وتنتهي سيمفونيتي التاسعة بـ"نشيد الفرح" الشهير. من أنا؟ | لودفيغ فان بيتهوفن (يُقبل: بيتهوفن) | Wolfgang Amadeus Mozart, Johann Sebastian Bach / فولفغانغ أماديوس موتسارت، يوهان سيباستيان باخ | Verify: born in Bonn, December 1770 (baptised 17 Dec). Deafness and the "Ode to Joy" finale of the Ninth. "German" is left out in case Germany is a Flags answer. Music is new to the category. |
| 1106-02 | Who Am I? | 500 | I was a magician and escape artist, born Erik Weisz in 1874. I became world famous for escaping from handcuffs, straitjackets and a locked tank of water, and I died on Halloween in 1926. Who am I? | Harry Houdini (accept Houdini) | كنت ساحرًا وفنان هروب، وُلدت باسم إريك فايس عام 1874. اشتهرت في العالم كله بالهروب من الأصفاد والسترات المقيِّدة ومن خزان ماء مغلق، وتوفيت في ليلة الهالوين عام 1926. من أنا؟ | هاري هوديني (يُقبل: هوديني) | Harry Blackstone, Howard Thurston / هاري بلاكستون، هوارد ثورستون | Verify: birth name and 24 Mar 1874, death 31 Oct 1926, the Water Torture Cell. The options are magicians who had died by then. Living magicians (Copperfield, Blaine) are not used, because "I died" would rule them out. "Hungarian-born" is left out because Hungary is a Cartoons 600 answer. Subject: entertainment, clearly different from Mansa Musa. |
| 1106-03 | Cartoons & Childhood | 400 | In the Pixar film "Ratatouille" (2007), what is the name of the young rat who dreams of becoming a great chef in a famous French restaurant? | Remy | في فيلم بيكسار "راتاتوي" (2007)، ما اسم الفأر الصغير الذي يحلم بأن يصبح طاهيًا عظيمًا في مطعم فرنسي شهير؟ | ريمي | Emile, Django / إميل، جانغو | Emile (his brother) and Django (his father) are also rats in the film. Linguini and Gusteau are left out because "rat" would rule them out. "Paris" is left out because it is a Geography 100 answer. Verify the character names in 2 sources. |
| 1106-04 | Landmarks | 500 (picture) | Which landmark is this? (proposed picture: the Great Hypostyle Hall, file name to be chosen, e.g. `img/questions/landmark-karnak-temple.jpg`) | Karnak Temple (accept Karnak, the Karnak Temple Complex, the Temple of Amun at Karnak) | ما هذا المعلم؟ | معبد الكرنك (يُقبل: الكرنك، مجمع معابد الكرنك) | Luxor Temple, The Temple of Edfu / معبد الأقصر، معبد إدفو | No image: needs a PD/CC Commons photo of the Great Hypostyle Hall (not a Luxor Temple colonnade), about 1280 px, 250 KB or less, with its licence recorded. Karnak is already a wrong option in Landmarks 200 (Abu Simbel), and Geography 400 (Luxor) names Karnak in its text. That doesn't give this picture away, but the owner may prefer another landmark. Reject "Luxor Temple". The cell has two modern Egyptian palaces, a European parliament and two Gulf buildings, so an ancient temple adds variety. |
| 1106-05 | Food & Drink | 400 | Which nuts are crushed with basil, garlic, Parmesan cheese and olive oil to make the classic green pesto sauce of Genoa? | Pine nuts (accept pignoli, pine kernels) | أي نوع من المكسرات يُهرس مع الريحان والثوم وجبن البارميزان وزيت الزيتون لصنع صلصة البيستو الخضراء الشهيرة من جنوة؟ | الصنوبر (يُقبل: حب الصنوبر) | Walnuts, Cashews / عين الجمل، الكاجو | Verify the classic pesto alla genovese recipe (the Genoa pesto consortium lists pine nuts). Walnuts are a common substitute in pesto variants, so the question says "classic ... of Genoa". Almonds were avoided because "Almond (marzipan)" is on the rejected list. "Italy" is left out (possible Flags answer). |
| 1106-06 | AI | 500 | What three-letter abbreviation is used for a future AI that could match humans at almost any thinking task, a goal several big AI companies say they are working towards? | AGI (accept artificial general intelligence) | ما الاختصار المكوّن من ثلاثة أحرف لذكاء اصطناعي مستقبلي يمكنه أن يضاهي البشر في كل مهام التفكير تقريبًا، وتقول عدة شركات ذكاء اصطناعي كبرى إنها تسعى إليه؟ | AGI (الذكاء الاصطناعي العام) | ANI, LLM / ANI، LLM | ASI (superintelligence) is not used as an option because it could be argued to match humans as well. OpenAI is not named (AI 100 answer). This is a concept, like "Generative AI" in the same cell, so the owner may prefer a news or company question instead. Verify the definition in 2 sources (e.g. Britannica, IBM or a major news explainer). |

## Removed by the owner (2026-11-10)

Removed from the drafts above and added to `rejected-answers.md`. No SQL file existed, so nothing else changed.

| Category | Points | Answer | Question gist |
|---|---|---|---|
| Who Am I? | 400 | Frida Kahlo | Painter of self-portraits, bus accident at 18, married Diego Rivera twice |
| Who Am I? | 500 | Mansa Musa | Mali Empire ruler whose 1324 pilgrimage gold lowered its value in Cairo |
| Cartoons & Childhood | 400 | Boots | Dora the Explorer's monkey best friend |
| Cartoons & Childhood | 500 | Mr. Potato Head | 1952 toy, first toy advertised on US TV |

## Duplicate and rejected-list checks (done offline)

- Every draft answer was checked against all 873 local DB rows (answers, wrong options and question texts, case-insensitive) and against `docs/question-sets/rejected-answers.md`. None of the 10 answers is in the bank or on the rejected list. Karnak is in the bank as a wrong option only (Landmarks 200) and is mentioned in the Geography 400 question text.
- Candidates dropped because they are already answers in the bank, or because another question would give them away: Einstein, Leonardo da Vinci, Gandhi, Cleopatra, Napoleon, Edison, Galileo, Fleming, Umm Kulthum, Alexander the Great (named in History 600), Alfred Nobel ("Nobel Prize" is named in several questions), Agatha Christie (named in Movies 200), Shifu (needs Po, a Movies 300 answer), Jiminy Cricket (needs Pinocchio, a Cartoons 100 answer), Sophia the robot (named in Geography 200), DeepSeek (Geography 300), Kasparov (History 100), Bard (Technology 400).
- Rejected types respected: AI 500 is not a film robot, product feature name, viral incident, model or version trivia, or country-policy news. Nothing is about Winnie-the-Pooh, Ben 10, DuckTales, the Smurfs, Dragon Ball or the Jungle Book.

## Fact-check log

None. No source could be opened in this run (network tools not approved). Every draft above still needs 2+ independent reputable sources.

## Image sources and licences

None. No image was downloaded.

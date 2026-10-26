# Automatic batch 2026-10-26: review

## Live/local differences (from the brief)

The live comparison could not be made this run, because the scheduled run blocked the live `/api/categories.php` fetch for lack of approval. Local totals: AI 42, Cartoons & Childhood 27, Egyptians 99, Flags 53, Food & Drink 37, Gen Z 66, Geography 93, History 70, Landmarks 46, Movies 65, Science 75, Sports 62, Technology 68, Who Am I? 12.

## Read first: limits of this run

1. **Web fact-check not done.** This scheduled run had no approval for web search, web fetch or `curl`, so the required check against 2 independent sources could not be carried out. To limit the risk, every question uses only widely documented, stable facts (no disputed details, no records, no living people's ages), and riskier drafts were dropped (see "Dropped or reworded"). The "Sources to confirm" section lists the pages to check before loading. **Do not load this file until those checks are done.**
2. **Landmarks 600 picture slot left empty.** A picture question needs a downloaded, licence-checked photo, and downloads were blocked. A ready-to-add proposal is below.
3. Not loaded into any database, no git commands run (as the brief asks).

File: `sql/add-auto-2026-10-26-questions.sql`, 4 text rows (9 written, 5 removed by the owner on 2026-10-26), all with `question_ar`, `answer_ar`, `wrong_1`, `wrong_2`, `wrong_1_ar`, `wrong_2_ar` filled.

| Category | Points | Brief asked | Written | Removed by the owner | In the file | Count after load |
|---|---|---|---|---|---|---|
| Cartoons & Childhood | 600 | 3 | 3 | 3 | 0 | 1 |
| Who Am I? | 100 | 1 | 1 | 0 | 1 | 3 |
| Who Am I? | 200 | 1 | 1 | 0 | 1 | 3 |
| Who Am I? | 300 | 1 | 1 | 0 | 1 | 3 |
| Who Am I? | 400 | 1 | 1 | 0 | 1 | 3 |
| Landmarks | 600 (picture) | 1 | 0 | 0 | 0 | 3 |
| Food & Drink | 400 | 1 | 1 | 1 | 0 | 4 |
| Food & Drink | 600 | 1 | 1 | 1 | 0 | 4 |

Variety: the 4 Who Am I? questions cover pop music, Arabic literature, painting and travel/exploration, in the category's first-person clue style ("... Who am I?").

## Questions

| Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| Who Am I? | 100 | I am the American singer known as the "King of Pop". I made the moonwalk dance famous, and my 1982 album was called "Thriller". Who am I? | Michael Jackson | أنا المطرب الأمريكي الملقب بـ"ملك البوب". اشتهرت برقصة "المون ووك"، وألبومي الصادر عام 1982 اسمه "ثريلر". من أنا؟ | مايكل جاكسون | Prince, Elvis Presley / برنس، إلفيس بريسلي | Elvis is the "King of Rock and Roll": reject. |
| Who Am I? | 200 | I am an Egyptian novelist. In 1988 I became the first Arab writer to win the Nobel Prize in Literature, and my best-known works include the "Cairo Trilogy". Who am I? | Naguib Mahfouz | أنا روائي مصري. في عام 1988 أصبحت أول كاتب عربي يفوز بجائزة نوبل في الأدب، ومن أشهر أعمالي "الثلاثية". من أنا؟ | نجيب محفوظ | Taha Hussein, Tawfiq al-Hakim / طه حسين، توفيق الحكيم | Mahfouz is named in an Egyptians 500 question ("El Karnak"), but not as an answer, and this question does not reveal "El Karnak". |
| Who Am I? | 300 | I was a Dutch painter of the 19th century. I painted "The Starry Night" and a famous series of "Sunflowers", and in 1888 I cut my own ear with a razor. Who am I? | Vincent van Gogh (accept Van Gogh) | كنت رسامًا هولنديًا في القرن التاسع عشر. رسمت لوحة "ليلة النجوم" وسلسلة شهيرة من لوحات "عباد الشمس"، وفي عام 1888 جرحت أذني بموسى حلاقة. من أنا؟ | فنسنت فان جوخ (يُقبل: فان جوخ) | Rembrandt, Johannes Vermeer / رامبرانت، يوهانس فيرمير | "Cut my own ear" avoids the part-or-whole ear debate. Reject Gauguin (his friend in Arles). |
| Who Am I? | 400 | I was a Muslim scholar born in Tangier in 1304. I left home for the Hajj in 1325 and kept travelling for almost 30 years, from West Africa to China. Who am I? | Ibn Battuta | كنت عالمًا مسلمًا وُلدت في طنجة عام 1304. خرجت من بلدي للحج عام 1325 وواصلت الترحال قرابة 30 عامًا، من غرب أفريقيا حتى الصين. من أنا؟ | ابن بطوطة | Ibn Khaldun, Ibn Jubayr / ابن خلدون، ابن جبير | Reject Marco Polo. The book title ("Rihla") is left out on purpose: "Al Rihla" is a Sports 600 answer. |

## Removed by the owner (2026-10-26)

Taken out of the SQL file and added to `docs/question-sets/rejected-answers.md`. Not replaced.

| Category | Points | Question | Answer |
|---|---|---|---|
| Cartoons & Childhood | 600 | In Disney's "Cinderella" (1950), what is the name of the wicked stepmother's fat, spoiled cat, who keeps chasing the mice Jaq and Gus? | Lucifer |
| Cartoons & Childhood | 600 | In the cartoon "Scooby-Doo, Where Are You!" (1969), "Shaggy" is only a nickname. What is Shaggy's real first name? | Norville (accept Norville Rogers) |
| Cartoons & Childhood | 600 | In Pixar's "Inside Out" (2015), what is the name of Riley's forgotten imaginary friend, part elephant and part cat, who cries candy instead of tears? | Bing Bong |
| Food & Drink | 400 | Which cylindrical clay oven, heated with charcoal or wood, is used in India and Pakistan to bake naan bread against its hot inner wall? | Tandoor (accept tandoori oven, tannour) |
| Food & Drink | 600 | Worcestershire sauce, first sold by Lea and Perrins in the 1830s, gets part of its savoury flavour from which small fermented fish? | Anchovies (accept anchovy) |

Difficulty benchmarks used: Cartoons 600 (Sami Clark) and 500 (Chemical X, Great Dane); Who Am I? 100 (MLK quote, Zewail), 200 (Shawqi, Al-Mutanabbi), 300 (Shakespeare, Benz), 400 (Armstrong, Al-Mutanabbi), 500 (Descartes, Ibn Firnas); Food 400 (Fattah, Vanilla, Fesikh, Halloumi), 500 (Freekeh, Dukkah, Scoville) and 600 (Bergamot, Tijuana, al-Hakim, Taro).

## Duplicate and rejected-list checks

- Every answer was checked against all 815 local DB questions (answers, question texts and wrong options, ignoring case and "(accept ...)") and against `docs/question-sets/rejected-answers.md`. No match.
- Candidates found already in the bank and dropped: Mohamed Salah (Sports 100), Marie Curie (History 400), Umm Kulthum (Egyptians 100), Thomas Edison and Alexander Graham Bell (Technology 200), Mahatma Gandhi (History 200), Isaac Newton, Albert Einstein (Science), Muhammad Ali, Pele, Messi (Sports).
- Avoided give-aways: no question names Bakkar (Egyptians 200 answer), the Smurfs (Cartoons 100 answer) or the "Rihla" (Sports 600 answer).

## Dropped or reworded

| Draft | Why |
|---|---|
| Cartoons 600: creator of the Egyptian cartoon about a Nubian boy and his goat (Mona Abul-Nasr) | Without web access the details (creator credit, dates) could not be verified to the 2-source standard. A third Bakkar-related question in the category would also cut variety. Replaced by Scooby-Doo (Norville). |
| Cartoons 600: Gargamel's cat (Azrael) | Would give away the Cartoons 100 answer "The Smurfs". |
| Who Am I? 300: "sold only one painting in my lifetime" (Van Gogh) | A popular claim that is disputed. Reworded to the ear incident, also softened to "cut my own ear" (sources differ on part or whole ear). |
| Who Am I? 400: "dictated a famous book, the Rihla" (Ibn Battuta) | "Al Rihla" is a Sports 600 answer. Book title removed. |
| Who Am I? 100: "best-selling album of all time" (Michael Jackson) | A record that could be disputed or broken. Replaced by the album name only. |
| Landmarks 600 picture | Not drafted as a row: downloads were blocked (see proposal below). |

## Landmarks 600 picture slot: proposal (not in the SQL)

Suggested landmark: **the Sacre-Coeur Basilica** (Montmartre, Paris). Not in the bank, not in the rejected list, not in the landmarks excluded list, built 1875-1914 (architect Paul Abadie, died 1884), so the building is out of copyright and the French no-freedom-of-panorama issue does not apply. Its white domes on the hill are distinctive, and difficulty should match Neuschwanstein at 600.

- Row to add once a photo is in place: `('Landmarks', 600, 'Which landmark is this?', 'The Sacre-Coeur Basilica (accept Sacre-Coeur, the Basilica of the Sacred Heart)', 'ما هذا المعلم؟', 'كاتدرائية القلب المقدس (ساكري كور)', 'img/questions/landmark-sacre-coeur.jpg')`, wrong options `Notre-Dame de la Garde` / `Notre-Dame de Fourviere`, `نوتردام دو لا غارد` / `نوتردام دو فورفيير` (both French hilltop basilicas of a similar style).
- Still to do: pick a Commons photo (PD, CC0, CC BY or CC BY-SA, no people as the subject), download the current revision at about 1280 px, re-encode as JPEG under 250 KB, record author / licence / file page / revision here and set `image_credit` as in `sql/add-landmarks-questions.sql`.
- Alternatives if the owner prefers: Galata Tower (Istanbul, medieval, Turkey has freedom of panorama). The earlier landmarks reserves (Lalibela, Persepolis, Registan, Shibam) are possible, but the owner removed similar lesser-known sites at 600 (Ait Benhaddou, Djenne, Qasr al-Farid, Baalbek).

## Sources to confirm (fact-check pending)

None of these pages could be opened in this run. Each fact should be confirmed in at least 2 of them before loading.

| Question | Facts to confirm | Suggested sources |
|---|---|---|
| Michael Jackson | "King of Pop", moonwalk, "Thriller" released 1982 | Britannica, Rock and Roll Hall of Fame, BBC |
| Naguib Mahfouz | Nobel Prize in Literature 1988, first Arab writer, Cairo Trilogy | nobelprize.org, Britannica |
| Van Gogh | Dutch, 19th century, "The Starry Night" (1889), "Sunflowers" series, ear injury December 1888 | Van Gogh Museum, MoMA ("The Starry Night"), Britannica |
| Ibn Battuta | Born Tangier 1304, left for Hajj 1325, travelled about 29-30 years, West Africa (Mali) to China | Britannica, National Geographic, academic source (e.g. Dunn, "The Adventures of Ibn Battuta") |

Web content checked during the run: none (all web access blocked), so no injected instructions to report.

# Automatic batch 2026-11-06: review

## Live/local differences (from the brief)

- Not checked in this pass. The 2026-11-06 run could not fetch https://brainrush.integration.ninja/api/categories.php (no one was there to approve network tools), and the 2026-11-10 pass that wrote the SQL file only fact-checked the drafts. There is no live/local comparison for this batch; the owner may want to compare the counts by hand.

## Reported questions

No open local reports. The owner still needs to check the live Admin > Reports panel.

## Status: SQL file written (2026-11-10)

`sql/add-auto-2026-11-06-questions.sql` is now written, with 5 rows (IDs 1106-01 to 1106-05) and the picture `img/questions/landmark-karnak-temple.jpg`.

History: the 2026-11-06 run had no web access, so it only wrote drafts (fact-checking needs 2+ web sources). On 2026-11-10 the owner removed 4 drafts and asked for the SQL file. This pass fact-checked the 6 remaining drafts in 2+ sources each, re-checked duplicates against the local DB and `rejected-answers.md`, made the Karnak image, kept 5 and dropped 1 (1106-06, AGI, a duplicate). The dropped slot is left empty, not replaced with a weaker question.

Not loaded into the local DB (the manager checks the file on a scratch copy). No git commands were run.

Local DB, read only, 2026-11-10: 873 questions in total (unchanged since 2026-11-06).

| Category | Points | Brief asked | In the file | Local count now | After loading |
|---|---|---|---|---|---|
| Who Am I? | 200 | 1 | 1 | 4 | 5 |
| Who Am I? | 400 | 1 | 0 (draft removed by the owner) | 4 | 4 |
| Who Am I? | 500 | 2 | 1 (1 draft removed by the owner) | 3 | 4 |
| Cartoons & Childhood | 400 | 2 | 1 (1 draft removed by the owner) | 4 | 5 |
| Cartoons & Childhood | 500 | 1 | 0 (draft removed by the owner) | 5 | 5 |
| Landmarks | 500 (picture) | 1 | 1 | 5 | 6 |
| Food & Drink | 400 | 1 | 1 | 6 | 7 |
| AI | 500 | 1 | 0 (1106-06 dropped, duplicate) | 6 | 6 |

Count per point value in the file: 200 = 1, 400 = 2, 500 = 2 (5 rows).

## Questions

| ID | Category | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|---|
| 1106-01 | Who Am I? | 200 | I was a composer born in Bonn in 1770. I kept composing even after I lost almost all my hearing, and my Ninth Symphony ends with the famous "Ode to Joy". Who am I? | Ludwig van Beethoven (accept Beethoven) | كنت مؤلفًا موسيقيًا وُلدت في مدينة بون عام 1770. واصلت التأليف حتى بعد أن فقدت سمعي كله تقريبًا، وتنتهي سيمفونيتي التاسعة بـ"نشيد الفرح" الشهير. من أنا؟ | لودفيغ فان بيتهوفن (يُقبل: بيتهوفن) | Wolfgang Amadeus Mozart, Johann Sebastian Bach / فولفغانغ أماديوس موتسارت، يوهان سيباستيان باخ | **Reworded:** the draft said "after I went deaf". Wikipedia notes he never became totally deaf, and sources say "almost completely" or "profoundly" deaf, so the text now says "lost almost all my hearing". Reject Mozart, Bach, Haydn, Schubert. |
| 1106-02 | Who Am I? | 500 | I was a magician and escape artist, born Erik Weisz in 1874. I became world famous for escaping from handcuffs, straitjackets and a locked tank of water, and I died on Halloween in 1926. Who am I? | Harry Houdini (accept Houdini) | كنت ساحرًا وفنان هروب، وُلدت باسم إريك فايس عام 1874. اشتهرت في العالم كله بالهروب من الأصفاد والسترات المقيِّدة ومن خزان ماء مغلق، وتوفيت في ليلة الهالوين عام 1926. من أنا؟ | هاري هوديني (يُقبل: هوديني) | Harry Blackstone, Howard Thurston / هاري بلاكستون، هوارد ثورستون | Unchanged. Accept "Ehrich Weiss" (his family's later spelling) as well, it is the same man. Reject Hardeen (his brother, also an escape artist), Copperfield, Blaine. |
| 1106-03 | Cartoons & Childhood | 400 | In the Pixar film "Ratatouille" (2007), what is the name of the young rat who dreams of becoming a great chef in a famous French restaurant? | Remy | في فيلم بيكسار "راتاتوي" (2007)، ما اسم الفأر الصغير الذي يحلم بأن يصبح طاهيًا عظيمًا في مطعم فرنسي شهير؟ | ريمي | Emile, Django / إميل، جانغو | Unchanged. Emile (his brother) and Django (his father) are rats in the film. Reject Linguini (the human garbage boy) and Gusteau (the chef). |
| 1106-04 | Landmarks | 500 (picture) | Which landmark is this? (picture: `img/questions/landmark-karnak-temple.jpg`, the Great Hypostyle Hall, looking down an aisle of papyrus columns towards the stone clerestory window) | Karnak Temple (accept Karnak, the Karnak Temple Complex, the Temple of Amun at Karnak) | ما هذا المعلم؟ | معبد الكرنك (يُقبل: الكرنك، مجمع معابد الكرنك) | Luxor Temple, Edfu Temple / معبد الأقصر، معبد إدفو | Accept "the Great Hypostyle Hall" too (it is inside Karnak). Reject "Luxor Temple" (a separate temple 3 km south) and "Valley of the Kings". The draft's option "The Temple of Edfu" became "Edfu Temple" to match the answer's form. Karnak is a wrong option in Landmarks 200 (Abu Simbel) and named in the Geography 400 text, and "El Karnak" is the answer of an Egyptians 500 film question (named after a cafe, not the temple). None of these gives this picture away. |
| 1106-05 | Food & Drink | 400 | Which nuts are crushed with basil, garlic, Parmesan cheese and olive oil to make the classic green pesto sauce of Genoa? | Pine nuts (accept pignoli, pine kernels) | أي نوع من المكسرات يُهرس مع الريحان والثوم وجبن البارميزان وزيت الزيتون لصنع صلصة البيستو الخضراء الشهيرة من جنوة؟ | الصنوبر (يُقبل: حب الصنوبر) | Walnuts, Cashews / عين الجمل، الكاجو | Unchanged. Walnuts and cashews appear in non-traditional or commercial pestos, but the question says "classic ... of Genoa", so only pine nuts is right. Reject almonds. |
| 1106-06 | AI | 500 | (dropped) | AGI | | | | **Dropped: duplicate.** Science 600 already asks: What does "AGI" stand for, the idea of a future AI that could match humans at almost any task? (answer: Artificial general intelligence). The draft is the same concept asked the other way round. Not replaced, so AI 500 stays at 6. |

## Removed by the owner (2026-11-10)

Removed from the drafts above and added to `rejected-answers.md`. No SQL file existed, so nothing else changed.

| Category | Points | Answer | Question gist |
|---|---|---|---|
| Who Am I? | 400 | Frida Kahlo | Painter of self-portraits, bus accident at 18, married Diego Rivera twice |
| Who Am I? | 500 | Mansa Musa | Mali Empire ruler whose 1324 pilgrimage gold lowered its value in Cairo |
| Cartoons & Childhood | 400 | Boots | Dora the Explorer's monkey best friend |
| Cartoons & Childhood | 500 | Mr. Potato Head | 1952 toy, first toy advertised on US TV |

## Duplicate and rejected-list checks

- 2026-11-06 (offline): every draft answer was checked against all 873 local DB rows (answers, wrong options and question texts, case-insensitive) and against `docs/question-sets/rejected-answers.md`. Candidates dropped then because they are already answers in the bank, or because another question would give them away: Einstein, Leonardo da Vinci, Gandhi, Cleopatra, Napoleon, Edison, Galileo, Fleming, Umm Kulthum, Alexander the Great (named in History 600), Alfred Nobel ("Nobel Prize" is named in several questions), Agatha Christie (named in Movies 200), Shifu (needs Po, a Movies 300 answer), Jiminy Cricket (needs Pinocchio, a Cartoons 100 answer), Sophia the robot (named in Geography 200), DeepSeek (Geography 300), Kasparov (History 100), Bard (Technology 400).
- 2026-11-10 (re-check, local DB read only, still 873 rows): searched question, answer and both wrong options for Beethoven, Houdini, Remy, Ratatouille, Karnak, hypostyle, pine nut, pesto, AGI and "general intelligence". No hits for Beethoven, Houdini, Remy, Ratatouille, hypostyle, pine nuts or pesto. Karnak appears only as noted in the 1106-04 host note. **"Artificial general intelligence" is already the answer of Science 600**, so 1106-06 was dropped. None of the 5 answers is in `rejected-answers.md`, and none of the 4 owner-removed answers is in the file.
- Rejected types respected: nothing is about Winnie-the-Pooh, Ben 10, DuckTales, the Smurfs, Dragon Ball or the Jungle Book.

## Difficulty benchmarks (local DB, 2026-11-10)

- Who Am I? 200 (Ahmed Shawqi, Naguib Mahfouz, Bruce Lee, Al-Mutanabbi): Beethoven, with Bonn, deafness and "Ode to Joy", is a similarly famous name with strong clues.
- Who Am I? 500 (Rene Descartes, Coco Chanel, Abbas Ibn Firnas): Houdini is famous, but the clues start with the less known birth name, and "magician" leaves several candidates until the water tank and Halloween clues.
- Cartoons & Childhood 400 (Dee Dee, Tinker Bell, Hassouna, Donatello): a named side or lead character from a well-known film, the same level.
- Landmarks 500 (Baron Empain Palace, Hungarian Parliament, Kingdom Centre, Montaza Palace, Museum of the Future): an interior view with no facade is harder than an exterior shot, and Luxor Temple is a real near-miss.
- Food & Drink 400 (Cardamom, Fattah, Vanilla, Fesikh, Halloumi, Guava): an ingredient question at the same level.

## Fact-check log

| ID | Facts checked | Sources |
|---|---|---|
| 1106-01 | Born in Bonn, baptised 17 Dec 1770 (birth probably 16 Dec). Hearing loss from about 1798, kept composing, almost completely or profoundly deaf by the Ninth (premiered 7 May 1824). The Ninth's finale sets Schiller's "Ode to Joy". | [Wikipedia: Ludwig van Beethoven](https://en.wikipedia.org/wiki/Ludwig_van_Beethoven) (Bonn, baptism 17 Dec 1770, never totally deaf); [Wikipedia: Symphony No. 9 (Beethoven)](https://en.wikipedia.org/wiki/Symphony_No._9_(Beethoven)) (text largely from Schiller's "Ode to Joy", almost completely deaf when composing); [Classic FM: Symphony No. 9](https://www.classicfm.com/composers/beethoven/music/symphony-no-9-d-minor/) (finale theme is the "Ode to Joy", profoundly deaf by the premiere); Bonn and the baptism also in search results from the City of Bonn and the Beethoven-Haus (Google Arts & Culture). |
| 1106-02 | Born Erik Weisz, 24 Mar 1874, Budapest. Escapes from handcuffs, straitjackets and the Chinese Water Torture Cell (from 1912, a locked water-filled cabinet). Died 31 Oct 1926 in Detroit of peritonitis. Options: Harry Blackstone Sr. and Howard Thurston were famous stage magicians, not Houdini. | [Wikipedia: Harry Houdini](https://en.wikipedia.org/wiki/Harry_Houdini) (birth name, dates, handcuffs, straitjackets, Water Torture Cell); [Biography.com: Harry Houdini](https://www.biography.com/celebrities/harry-houdini) (24 Mar 1874, 31 Oct 1926, handcuffs, straitjackets, locked water-filled tanks, Water Torture Cell 1912). Britannica lists "original name Erik Weisz" in search results (its page returned 403 to the fetch tool). |
| 1106-03 | Remy is the rat who dreams of being a chef at Gusteau's in Paris. "Ratatouille" is a 2007 Pixar film. Emile is his brother and Django his father. | [Wikipedia: Ratatouille (film)](https://en.wikipedia.org/wiki/Ratatouille_(film)) (Remy, Gusteau's, Paris, Emile, Django, 2007); [RogerEbert.com review](https://www.rogerebert.com/reviews/ratatouille-2007) (Remy, the rat who cooks, Patton Oswalt as Remy). |
| 1106-04 | The Great Hypostyle Hall (134 papyrus columns in 16 rows, built under Seti I and Ramesses II) is part of the Precinct of Amun-Re at Karnak, Luxor. The photo is described on Commons as the Great Hypostyle Hall of Karnak and is in the Commons category "Great Hypostyle Hall of Karnak". Luxor Temple and Edfu Temple are separate temples. | [Wikipedia: Great Hypostyle Hall](https://en.wikipedia.org/wiki/Great_Hypostyle_Hall); [ISAC, University of Chicago: OIP 142, The Great Hypostyle Hall in the Temple of Amun at Karnak](https://isac.uchicago.edu/research/publications/oip/oip-142-great-hypostyle-hall-temple-amun-karnak); [Digital Karnak, UCSC: Hypostyle Hall](https://digitalkarnak.ucsc.edu/hypostyle-hall/). The picture was compared with other Commons photos of the hall (the same aisle and clerestory window grille). |
| 1106-05 | Pesto alla genovese from Genoa: Genovese basil, garlic, Ligurian olive oil, Parmigiano Reggiano (or Grana Padano), Pecorino, salt and pine nuts. Walnuts are a non-traditional substitute outside Italy, cashews appear in some commercial versions. | [Wikipedia: Pesto](https://en.wikipedia.org/wiki/Pesto); [Great Italian Food Trade: Pesto Genovese, seven ingredients and a mortar](https://www.greatitalianfoodtrade.it/en/sauces-a/pesto-genovese/) (quotes the Consorzio del Pesto Genovese recipe: "Mediterranean pine nuts"). |
| 1106-06 | Not fact-checked: dropped as a duplicate of Science 600 before research. | - |

## Image sources and licences

| Points | File | Commons file page | Author | Licence | File revision |
|---|---|---|---|---|---|
| 500 | `landmark-karnak-temple.jpg` | [Luxor, Egypt, Karnak, Great Hypostyle Hall.jpg](https://commons.wikimedia.org/wiki/File:Luxor,_Egypt,_Karnak,_Great_Hypostyle_Hall.jpg) | Vyacheslav Argenberg (own work) | CC BY 4.0 | upload 2021-07-23 (sha1 784b1a0e...), photo taken 2007-05-19; page revision 1236313240 (2026-06-22) |

- Downloaded on 2026-11-10 from upload.wikimedia.org (the 960 px wide rendition of the current revision, 960 x 1440) into a new, empty temp directory, with a named User-Agent and a pause between requests. Re-encoded with PHP GD (XAMPP PHP, `-d extension=gd`) as JPEG quality 78, keeping only the pixels (no metadata) and with no cropping: 853 x 1280 px (portrait, long side 1280), 167,393 bytes (under 250 KB).
- Licence read from the file page wikitext through the Commons API: `{{User:Argenberg/License}}`, which expands to `{{self|cc-by-4.0|...|attribution=© Vyacheslav Argenberg}}`. Credit in the game: `image_credit` = "Vyacheslav Argenberg / CC BY 4.0". Note for the owner: that user licence template itself has a Commons deletion request (opened 2026-09-25) asking for it to be substituted with the standard licence on each file. This is housekeeping about the template, not a challenge to the photo's licence, and there is no warning on the file itself.
- People: one visitor stands far down the aisle, very small and not recognisable. No other people.
- Other candidates looked at: Marc Ryckaert's "Karnak Hypostyle Hall R01/R02/R05" (CC BY-SA 4.0, more visitors in view), a panoramio upward shot (CC BY 3.0, has a photographer watermark), a CC0 2014 photo (the view is not clearly the hypostyle hall), and a close-up of column reliefs (too ambiguous).

## Owner review (2026-11-10)

The owner approved all 5 rows (1106-01 to 1106-05). Loaded into the local DB: 873 -> 878, a second run added 0.

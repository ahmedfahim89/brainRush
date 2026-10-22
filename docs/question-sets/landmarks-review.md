# Review: Landmarks picture question set

- **Request:** orchestrator brief of 2026-10-22 for the owner: a new picture category named exactly "Landmarks" (display idea in Arabic: معالم العالم, the categories table has no Arabic name column so only the English name is stored), the second picture category after Flags. Target is 8 kept questions per point value. The owner usually drops 30-50% of a draft, so this draft has 12 per value.
- **Date:** 2026-10-22
- **SQL file:** `sql/add-landmarks-questions.sql`. Loaded into the local DB and run a second time to confirm it is idempotent (see "Local DB load").
- **Images:** `img/questions/landmark-<name>.jpg`, 66 files, 14,262,643 bytes (13.6 MiB) in total. Every file is a JPEG of 1280 px on the long side (the Great Wall is 1152 px, to keep it under the size limit at a decent quality), the largest 254,900 bytes (249 KiB). All photos are from Wikimedia Commons under public domain, CC0, CC BY or CC BY-SA, re-encoded with PHP GD (pixels only, no metadata). Attribution is in "Image sources and licences".
- **Point values (local DB):** 100, 200, 300, 400, 500, 600

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Landmarks (draft), all rows | 12 | 12 | 12 | 12 | 12 | 12 | 72 |
| Removed by the owner | 0 | 2 | 2 | 6 | 7 | 9 | 26 |
| **Kept, all rows** | **12** | **10** | **10** | **6** | **5** | **3** | **46** |
| of which picture questions | 12 | 9 | 9 | 6 | 5 | 3 | 44 |
| of which text questions | 0 | 1 | 1 | 0 | 0 | 0 | 2 |

**Owner removals (2026-10-22).** The owner removed 26 questions, not replaced. Don't re-add them: Machu Picchu, the Moai of Easter Island, Chichen Itza, the Terracotta Army, Angkor Wat, Mont-Saint-Michel, the Space Needle, the Atomium, Kinkaku-ji, Uluru (text), Philae Temple, Pompey's Pillar, the Mosque-Cathedral of Cordoba, the Ponte Vecchio, Borobudur, the Temple of Heaven, the Colossus of Rhodes (text), Baalbek, the Ziggurat of Ur, Qasr al-Farid, Ait Benhaddou, the Colossi of Memnon, Bab Zuweila, the Great Mosque of Djenne, the Mausoleum at Halicarnassus (text) and the Avenue of Sphinxes (text). Their 22 photos were taken out of `img/questions/`, so 44 photos remain (9,333,789 bytes). Their rows were removed from the question, source and image tables below. Other notes in this doc still describe the 72-question draft.

Every picture row has the same prompt, `Which landmark is this?` / `ما هذا المعلم؟`, plus its own `image`. The unique key `uq_category_question_image (category_id, question, image)` keeps the 66 picture rows apart and makes the file safe to run again.

**The answer is the landmark's name only, no city or country.** A revealed location would give away other answers in the bank: "Petra, Jordan" gives away Geography 500 (Petra -> Jordan), "Burj Khalifa, Dubai" Geography 200, "Christ the Redeemer, Rio" Sports 300 (2016 Olympics), "the Acropolis, Athens" Sports 300 (1896 Olympics), "Machu Picchu, Peru" Geography 400 and so on. The location is in the "Location" column below for the host's information. Naming only the city or country is not a correct answer.

## Local DB load

| | Total questions | Landmarks |
|---|---|---|
| Before (2026-10-22) | 763 | 0 (no category) |
| After 1st run | 835 | 72 |
| After 2nd run | 835 | 72 |

The increase (72) equals the rows in the file; the second run added nothing. Nothing was skipped. Note: when this work started the total was 691; the other 72 were the "Cartoons & Childhood" set loaded meanwhile by another agent.

## Owner decisions

1. **Overlaps with the existing bank (please choose keep or drop).**
   - Exact answers already in the bank: **Eiffel Tower** (History 100, "built for the 1889 World's Fair") and **Statue of Liberty** (Geography 100, "copper statue ... New York Harbor"). If both come up in one game, the revealed picture answer gives away the other question. They are drafted because a Landmarks category without them feels odd. Drop them if you want no repeated answers.
   - Landmark named in another question's text (the picture answer does not reveal that question's answer, but players hear the name): **Pyramids of Giza** (History 600 Khufu, Technology 600 height, Technology 300 limestone), **Colosseum** (History 300), **Burj Khalifa** (Geography 200), **Golden Gate Bridge** (Geography 200), **Petra** (Geography 500), **Abu Simbel** (History 400).
   - Answer that names another question's answer: **Temple of Hatshepsut** (300) reveals the History 500 answer "Hatshepsut". **Mosque of Muhammad Ali** (300) shares the name of the Sports 100 answer "Muhammad Ali" (the boxer). **Grand Egyptian Museum** (400): the photo shows the colossal statue of Ramesses II, the History 400 answer, but neither the question nor the answer names him.
   - Answers were kept free of "accept Temple of Ramesses II" (Abu Simbel) and "accept the Luxor Obelisk" (obelisk text question) because those would reveal History 400 (Ramesses II) and Geography 400 (Luxor).
2. **Freedom of panorama (copyright of the building, not of the photo).** Every photo licence is PD, CC0, CC BY or CC BY-SA. However, Commons lists the **UAE, Egypt, Kuwait and France** as having no freedom of panorama for buildings, so photos of modern buildings there may need the architect's permission for reuse, even though the photo itself is freely licensed. Affected: **Burj Khalifa** (its file page carries the Commons "NoFoP-UAE" warning), **Dubai Frame**, **Museum of the Future**, **Louvre Abu Dhabi** (UAE), **Cairo Tower**, **Bibliotheca Alexandrina**, **Stanley Bridge**, **Grand Egyptian Museum** (Egypt), **Kuwait Towers** (Kuwait) and the **Louvre Pyramid** (France, I. M. Pei). Old landmarks (pyramids, temples, the Eiffel Tower, Baron Empain Palace, Montaza, etc.) are long out of copyright and not affected. Saudi Arabia (Kingdom Centre), Malaysia (Petronas), Singapore, Belgium (Atomium), the US, Brazil and Australia have freedom of panorama for buildings. For a private party game the practical risk is low, but it is your call: keep them, or drop these 10 as a block.
3. **Burj Al Arab was dropped and replaced by Abu Simbel (200).** Its Commons file had an open deletion request (plus "NoFoP-UAE"), so it is not a stable source. Don't re-add it from Commons.
4. **Arab and Egyptian landmarks may be easier for Egyptian players.** Stanley Bridge, Baron Empain Palace, Montaza Palace, Pompey's Pillar, Bab Zuweila and the Colossi of Memnon are everyday knowledge for many Egyptians but hard for others. They were placed by difficulty for a mixed audience (as in the Flags set). Move one down a value if play shows it is too easy.
5. **Difficulty at 600 follows the brief's examples** (Baalbek, Petronas Towers, Neuschwanstein). The Petronas Towers and Neuschwanstein are arguably 400-500 level; move them down if 600 feels too easy.
6. **Near look-alikes kept in the set (distinguishable, but say so to the host):**
   - Petra (200, Al-Khazneh carved into a cliff) and Qasr al-Farid (600, a single Nabataean tomb cut into a free-standing boulder): both Nabataean. Reject "Petra" for Qasr al-Farid.
   - Big Ben (100) and the Hungarian Parliament (500): both Gothic Revival parliaments on a river. The Budapest building has a large central dome. Reject "Houses of Parliament" for Budapest.
   - The Louvre (200) and the Louvre Abu Dhabi (600): "the Louvre" alone is not enough for 600.
   - Mosque of Muhammad Ali (300) is in the Ottoman style and may be called "the Blue Mosque" by some players: reject.
   - The Grand Egyptian Museum photo is the Grand Hall with the colossal Ramesses II statue. Accept "the Ramesses statue in the Grand Egyptian Museum". Reject "Ramses Square" or "the Egyptian Museum in Tahrir".
   - The Kuwait Towers photo is a sunset silhouette, harder than a daytime shot (that's why it is at 400).
   - The Arc de Triomphe photo shows a small Eiffel Tower in the far background (a hint that it is Paris, not a giveaway).
7. **People in the photos.** No photo has people as its subject. Small crowds or figures appear in Christ the Redeemer (base platform), the Great Wall, Bibliotheca Alexandrina (entrance plaza), Marina Bay Sands (cricket match), the Trevi Fountain, the Mosque of Muhammad Ali and the Louvre Abu Dhabi (two small figures). The Terracotta Army, Moai, Colossi of Memnon, Abu Simbel and Christ the Redeemer are statues, not photos of real people. Mount Rushmore (carved faces of real presidents) is a text question, not a picture.
8. **Picture size on screen (CSS note, no code changed).** Photos display correctly with the existing `.question-image` rules (fixed height, `width: auto`, `max-width: 100%`, `object-fit: contain`): whole picture, right aspect ratio, nothing cropped. Checked in headless Chrome with the repo CSS at 1366x768 and 1920x1080 (landscape Great Wall, portrait Eiffel Tower, panoramic Alhambra). But at 1366x768 the picture measured only about 217 px tall in the render (`height: clamp(7rem, calc(100vh - 32.5rem), 50vh)`), which suits flags but makes detailed photos small, especially portrait ones (Eiffel Tower, Pisa, Petronas, Atomium, Sagrada Familia, Moai, Terracotta Army, Christ the Redeemer, GEM, Museum of the Future, Kuwait Towers, Petra are about 120-160 px wide there). At 1920x1080 it measured about 528 px tall, which is fine. A developer may want a larger picture height or a tap-to-enlarge for photo categories. That is a code change for a separate story.

## Excluded (not drafted)

| Excluded | Why |
|---|---|
| Burj Al Arab | Commons deletion request on the file, NoFoP-UAE. Replaced by Abu Simbel. |
| Great Sphinx, Notre-Dame, Al-Azhar, Aswan High Dam, Lighthouse of Alexandria | Exact answers already in History / Technology. |
| Karnak, Luxor Temple, Valley of the Kings, Saint Catherine's Monastery, Mount Fuji, Table Mountain, Rialto Bridge, the Kaaba | Named in existing questions, or "Luxor" is an existing answer. The Kaaba is also always crowded. |
| Dome of the Rock, Al-Aqsa, Potala Palace, Taipei 101 | Disputed or politically sensitive territory. |
| Hollywood Sign | The picture is the answer written out. |
| Mount Rushmore as a picture | Carved faces of real people, kept as a text question instead. |
| Hagia Sophia and the Blue Mosque | Look like each other (and like the Mosque of Muhammad Ali). |
| Sheikh Zayed Grand Mosque, Hassan II Mosque, St Peter's, St Paul's, Cologne Cathedral | Generic large domed mosques / domed or Gothic cathedrals. Sheikh Zayed is also NoFoP-UAE. |
| Tokyo Tower, CN Tower and other TV towers | Look like the Eiffel Tower or each other. |
| Arc du Carrousel, India Gate / Gateway of India | Look like the Arc de Triomphe / each other. |
| El Djem amphitheatre | Looks like the Colosseum. |
| Ibn Tulun minaret, Malwiya of Samarra | Spiral minarets that look like each other. |
| London Eye, Sydney Harbour Bridge | Look like other wheels / arch bridges (and the photos usually include Big Ben / the Opera House). |
| Kremlin | Next to St Basil's, would make that answer ambiguous. |
| Egyptian Museum (Tahrir) | Near-miss name with the Grand Egyptian Museum. |
| Palmyra | War damage; the current state differs from most photos. |
| Lalibela, Persepolis, Registan, Shibam | Good 600 reserves, not drafted (no room). |

## Image rule: never replace a picture under the same name

Asset names are not content-hashed, and the live site sits behind a 7-day browser cache and the Hostinger CDN. Never replace a landmark photo under the same file name. If a picture must change, add a **new** file name (for example `landmark-cairo-tower-2.jpg`) and a new row, and leave the old file until no row uses it.

---

## Questions

Picture rows: question `Which landmark is this?`, Arabic `ما هذا المعلم؟`. Text rows have no image.

### 100

| Points | Question | Answer | Arabic question | Arabic answer | Image | Location | Host note |
|---|---|---|---|---|---|---|---|
| 100 | Which landmark is this? | The Pyramids of Giza (accept the Giza pyramids, the Pyramids) | ما هذا المعلم؟ | أهرامات الجيزة (يُقبل: الأهرامات) | landmark-pyramids-giza.jpg | Giza, Egypt | Accept "the Great Pyramid". Reject "the Sphinx" (not in the photo). Overlap: see decision 1. |
| 100 | Which landmark is this? | The Eiffel Tower | ما هذا المعلم؟ | برج إيفل | landmark-eiffel-tower.jpg | Paris, France | Reject Tokyo Tower. Exact answer in History 100 (decision 1). |
| 100 | Which landmark is this? | The Statue of Liberty | ما هذا المعلم؟ | تمثال الحرية | landmark-statue-of-liberty.jpg | New York, USA | Exact answer in Geography 100 (decision 1). |
| 100 | Which landmark is this? | The Taj Mahal (accept the Taj) | ما هذا المعلم؟ | تاج محل | landmark-taj-mahal.jpg | Agra, India | Reject "a mosque" or "a palace". |
| 100 | Which landmark is this? | The Great Wall of China (accept the Great Wall) | ما هذا المعلم؟ | سور الصين العظيم | landmark-great-wall.jpg | Badaling section, near Beijing, China | |
| 100 | Which landmark is this? | The Leaning Tower of Pisa (accept the Tower of Pisa) | ما هذا المعلم؟ | برج بيزا المائل (يُقبل: برج بيزا) | landmark-leaning-tower-pisa.jpg | Pisa, Italy | |
| 100 | Which landmark is this? | Big Ben (accept the Elizabeth Tower, the Houses of Parliament, the Palace of Westminster) | ما هذا المعلم؟ | ساعة بيج بن (يُقبل: برج إليزابيث، مبنى البرلمان البريطاني، قصر وستمنستر) | landmark-big-ben.jpg | London, UK | Reject "London" alone and "Tower Bridge". |
| 100 | Which landmark is this? | The Sydney Opera House | ما هذا المعلم؟ | دار أوبرا سيدني | landmark-sydney-opera-house.jpg | Sydney, Australia | Accept "the Opera House". |
| 100 | Which landmark is this? | The Burj Khalifa | ما هذا المعلم؟ | برج خليفة | landmark-burj-khalifa.jpg | Dubai, UAE | Reject "Dubai" alone. Named in Geography 200; NoFoP-UAE (decisions 1-2). |
| 100 | Which landmark is this? | The Colosseum (accept the Flavian Amphitheatre) | ما هذا المعلم؟ | الكولوسيوم (يُقبل: مدرج فلافيان) | landmark-colosseum.jpg | Rome, Italy | Reject "a Roman amphitheatre" without the name. |
| 100 | Which landmark is this? | Christ the Redeemer | ما هذا المعلم؟ | تمثال المسيح الفادي | landmark-christ-the-redeemer.jpg | Corcovado, Rio de Janeiro, Brazil | Accept "the Jesus statue in Rio". |
| 100 | Which landmark is this? | The White House | ما هذا المعلم؟ | البيت الأبيض | landmark-white-house.jpg | Washington, D.C., USA | Reject "the Capitol". |

### 200

| Points | Question | Answer | Arabic question | Arabic answer | Image | Location | Host note |
|---|---|---|---|---|---|---|---|
| 200 | Which landmark is this? | Abu Simbel (accept the Abu Simbel temples) | ما هذا المعلم؟ | معبد أبو سمبل (يُقبل: أبو سمبل) | landmark-abu-simbel.jpg | Aswan Governorate, Egypt | Also accept "the Great Temple of Ramesses II". Named in History 400. |
| 200 | Which landmark is this? | The Cairo Tower | ما هذا المعلم؟ | برج القاهرة | landmark-cairo-tower.jpg | Gezira Island, Cairo, Egypt | NoFoP Egypt (decision 2). |
| 200 | Which landmark is this? | The Golden Gate Bridge | ما هذا المعلم؟ | جسر البوابة الذهبية (جولدن جيت) | landmark-golden-gate-bridge.jpg | San Francisco, USA | Reject "San Francisco" alone. Named in Geography 200. |
| 200 | Which landmark is this? | Stonehenge | ما هذا المعلم؟ | ستونهنج | landmark-stonehenge.jpg | Wiltshire, England, UK | |
| 200 | Which landmark is this? | The Arc de Triomphe (accept the Arch of Triumph) | ما هذا المعلم؟ | قوس النصر | landmark-arc-de-triomphe.jpg | Paris, France | Reject the Brandenburg Gate. |
| 200 | Which landmark is this? | The Acropolis (accept the Parthenon) | ما هذا المعلم؟ | الأكروبوليس (يُقبل: البارثينون) | landmark-acropolis.jpg | Athens, Greece | Reject "Athens" alone. |
| 200 | Which landmark is this? | Tower Bridge | ما هذا المعلم؟ | جسر البرج (تاور بريدج) | landmark-tower-bridge.jpg | London, UK | Reject "London Bridge" (a different, plain bridge nearby). |
| 200 | Which landmark is this? | Petra (accept Al-Khazneh, the Treasury) | ما هذا المعلم؟ | البتراء (يُقبل: الخزنة) | landmark-petra.jpg | Ma'an Governorate, Jordan | Reject "Jordan" alone. Named in Geography 500. |
| 200 | Which landmark is this? | The Louvre (accept the Louvre Pyramid, the Louvre Museum) | ما هذا المعلم؟ | متحف اللوفر (يُقبل: هرم اللوفر) | landmark-louvre-pyramid.jpg | Paris, France | NoFoP France for the glass pyramid (decision 2). |
| 200 | Which mountain memorial in South Dakota, USA, has the giant carved faces of four US presidents? | Mount Rushmore (accept Mount Rushmore National Memorial) | أي نصب جبلي في ولاية داكوتا الجنوبية الأمريكية نُحتت فيه وجوه عملاقة لأربعة رؤساء أمريكيين؟ | جبل راشمور (يُقبل: نصب جبل راشمور الوطني) | (text) | Black Hills, South Dakota, USA | Washington, Jefferson, T. Roosevelt and Lincoln. |

### 300

| Points | Question | Answer | Arabic question | Arabic answer | Image | Location | Host note |
|---|---|---|---|---|---|---|---|
| 300 | Which landmark is this? | The Mosque of Muhammad Ali (accept the Alabaster Mosque, the Cairo Citadel, the Citadel of Saladin) | ما هذا المعلم؟ | مسجد محمد علي (يُقبل: جامع المرمر، قلعة صلاح الدين، القلعة) | landmark-muhammad-ali-mosque.jpg | Cairo Citadel, Cairo, Egypt | Reject the Blue Mosque or other Istanbul mosques. Sports 100 answer overlap (decision 1). |
| 300 | Which landmark is this? | The Citadel of Qaitbay (accept Qaitbay Fort) | ما هذا المعلم؟ | قلعة قايتباي | landmark-qaitbay-citadel.jpg | Alexandria, Egypt | Built on the site of the Lighthouse of Alexandria: reject "the Lighthouse". |
| 300 | Which landmark is this? | The Bibliotheca Alexandrina (accept the Library of Alexandria) | ما هذا المعلم؟ | مكتبة الإسكندرية | landmark-bibliotheca-alexandrina.jpg | Alexandria, Egypt | The granite wall carved with letters of many scripts. NoFoP Egypt (decision 2). |
| 300 | Which landmark is this? | Saint Basil's Cathedral (accept St Basil's) | ما هذا المعلم؟ | كاتدرائية القديس باسيل | landmark-st-basils-cathedral.jpg | Red Square, Moscow, Russia | Reject "the Kremlin" and "Red Square" alone. |
| 300 | Which landmark is this? | The Brandenburg Gate | ما هذا المعلم؟ | بوابة براندنبورغ | landmark-brandenburg-gate.jpg | Berlin, Germany | Reject the Arc de Triomphe. |
| 300 | Which landmark is this? | The Sagrada Familia | ما هذا المعلم؟ | كنيسة ساغرادا فاميليا | landmark-sagrada-familia.jpg | Barcelona, Spain | Accept "Gaudi's cathedral in Barcelona". |
| 300 | Which landmark is this? | The Trevi Fountain | ما هذا المعلم؟ | نافورة تريفي | landmark-trevi-fountain.jpg | Rome, Italy | |
| 300 | Which landmark is this? | Marina Bay Sands | ما هذا المعلم؟ | مارينا باي ساندز | landmark-marina-bay-sands.jpg | Singapore | Reject "Singapore" alone. |
| 300 | Which landmark is this? | The Temple of Hatshepsut (accept Deir el-Bahari) | ما هذا المعلم؟ | معبد حتشبسوت (يُقبل: الدير البحري) | landmark-hatshepsut-temple.jpg | Deir el-Bahari, West Bank of Luxor, Egypt | Reject "Luxor" or "Valley of the Kings" alone. History 500 answer overlap (decision 1). |
| 300 | Which kind of ancient Egyptian monument, a tall four-sided stone pillar with a pyramid-shaped tip, has stood in the Place de la Concorde in Paris since 1836? | An obelisk | أي نوع من الآثار المصرية القديمة، وهو عمود حجري طويل رباعي الأضلاع ينتهي بقمة هرمية، يقف في ميدان الكونكورد في باريس منذ عام 1836؟ | مسلة | (text) | Paris (originally from Luxor Temple) | "The Luxor Obelisk" is also correct. Not in the written answer, so as not to reveal Geography 400 (Luxor). |

### 400

| Points | Question | Answer | Arabic question | Arabic answer | Image | Location | Host note |
|---|---|---|---|---|---|---|---|
| 400 | Which landmark is this? | The Kuwait Towers | ما هذا المعلم؟ | أبراج الكويت | landmark-kuwait-towers.jpg | Kuwait City, Kuwait | Sunset silhouette. Reject "Kuwait" alone. NoFoP Kuwait (decision 2). |
| 400 | Which landmark is this? | The Dubai Frame | ما هذا المعلم؟ | برواز دبي (يُقبل: إطار دبي) | landmark-dubai-frame.jpg | Zabeel Park, Dubai, UAE | NoFoP UAE (decision 2). |
| 400 | Which landmark is this? | Stanley Bridge | ما هذا المعلم؟ | كوبري ستانلي | landmark-stanley-bridge.jpg | Alexandria, Egypt | Accept "Kobri Stanley". NoFoP Egypt (decision 2). |
| 400 | Which landmark is this? | The Grand Egyptian Museum (accept the GEM) | ما هذا المعلم؟ | المتحف المصري الكبير | landmark-grand-egyptian-museum.jpg | Giza, Egypt | See decision 6: reject Ramses Square and the Tahrir Egyptian Museum. NoFoP Egypt (decision 2). |
| 400 | Which landmark is this? | The Alhambra | ما هذا المعلم؟ | قصر الحمراء | landmark-alhambra.jpg | Granada, Spain | Panoramic view at dusk. |
| 400 | Which landmark is this? | Florence Cathedral (accept the Duomo, Santa Maria del Fiore) | ما هذا المعلم؟ | كاتدرائية فلورنسا (يُقبل: الدومو، سانتا ماريا ديل فيوري) | landmark-florence-cathedral.jpg | Florence, Italy | Reject St Peter's. |

### 500

| Points | Question | Answer | Arabic question | Arabic answer | Image | Location | Host note |
|---|---|---|---|---|---|---|---|
| 500 | Which landmark is this? | The Baron Empain Palace (accept Qasr El Baron, the Baron Palace) | ما هذا المعلم؟ | قصر البارون (يُقبل: قصر البارون إمبان) | landmark-baron-empain-palace.jpg | Heliopolis, Cairo, Egypt | Reject Angkor Wat (it imitates Hindu/Khmer temples). |
| 500 | Which landmark is this? | Montaza Palace (accept the Haramlik, Montaza Gardens) | ما هذا المعلم؟ | قصر المنتزه (يُقبل: الحرملك، حدائق المنتزه) | landmark-montaza-palace.jpg | Montaza, Alexandria, Egypt | Accept "Qasr El Montaza". Reject Ras El Tin Palace. |
| 500 | Which landmark is this? | The Museum of the Future | ما هذا المعلم؟ | متحف المستقبل | landmark-museum-of-the-future.jpg | Sheikh Zayed Road, Dubai, UAE | The Arabic calligraphy is a poem, not the name. NoFoP UAE (decision 2). |
| 500 | Which landmark is this? | Kingdom Centre (accept Kingdom Centre Tower, Burj Al Mamlaka) | ما هذا المعلم؟ | برج المملكة (يُقبل: مركز المملكة) | landmark-kingdom-centre.jpg | Riyadh, Saudi Arabia | Reject the Jeddah Tower (formerly "Kingdom Tower"). |
| 500 | Which landmark is this? | The Hungarian Parliament Building (accept the Budapest Parliament) | ما هذا المعلم؟ | مبنى البرلمان المجري (يُقبل: برلمان بودابست) | landmark-hungarian-parliament.jpg | Budapest, Hungary | Reject "Houses of Parliament" / Westminster. |

### 600

| Points | Question | Answer | Arabic question | Arabic answer | Image | Location | Host note |
|---|---|---|---|---|---|---|---|
| 600 | Which landmark is this? | The Petronas Towers (accept the Petronas Twin Towers) | ما هذا المعلم؟ | برجا بتروناس التوأمان | landmark-petronas-towers.jpg | Kuala Lumpur, Malaysia | Reject "Kuala Lumpur" alone. |
| 600 | Which landmark is this? | Neuschwanstein Castle | ما هذا المعلم؟ | قلعة نويشفانشتاين | landmark-neuschwanstein.jpg | Bavaria, Germany | Reject "the Disney castle" (it inspired it). |
| 600 | Which landmark is this? | The Louvre Abu Dhabi | ما هذا المعلم؟ | متحف اللوفر أبوظبي | landmark-louvre-abu-dhabi.jpg | Saadiyat Island, Abu Dhabi, UAE | "The Louvre" alone is not enough. NoFoP UAE (decision 2). |

---

## Fact-check log

**Picture questions.** The fact stored in the DB is "this photo shows landmark X". It was checked in three ways. First, the Commons file page (title, description and categories at its current revision) names the landmark. Second, every final image was viewed in a contact sheet and compared with the landmark. Third, the landmark's identity and location were checked against the UNESCO World Heritage List (the official list, downloaded from whc.unesco.org/en/list/xml/ on 2026-10-22, site IDs below) or, for landmarks not on the list, two independent sources. The location is not stored in the DB.

| Answer | Sources |
|---|---|
| Pyramids of Giza | [UNESCO 86](https://whc.unesco.org/en/list/86), Commons file page |
| Eiffel Tower | [UNESCO 600 Paris, Banks of the Seine](https://whc.unesco.org/en/list/600), Commons file page |
| Statue of Liberty | [UNESCO 307](https://whc.unesco.org/en/list/307), Commons file page |
| Taj Mahal | [UNESCO 252](https://whc.unesco.org/en/list/252), Commons file page |
| Great Wall | [UNESCO 438](https://whc.unesco.org/en/list/438), Commons file page (Badaling) |
| Leaning Tower of Pisa | [UNESCO 395](https://whc.unesco.org/en/list/395), Commons file page |
| Big Ben | [UNESCO 426](https://whc.unesco.org/en/list/426), Commons file page |
| Sydney Opera House | [UNESCO 166](https://whc.unesco.org/en/list/166), Commons file page |
| Burj Khalifa | [Wikipedia](https://en.wikipedia.org/wiki/Burj_Khalifa), Commons file page and category |
| Colosseum | [UNESCO 91](https://whc.unesco.org/en/list/91), Commons file page |
| Christ the Redeemer | [UNESCO 1100 Rio de Janeiro: Carioca Landscapes](https://whc.unesco.org/en/list/1100), Commons file page |
| White House | [Wikipedia](https://en.wikipedia.org/wiki/White_House), Commons file page |
| Abu Simbel | [UNESCO 88 Nubian Monuments from Abu Simbel to Philae](https://whc.unesco.org/en/list/88), Commons file page |
| Cairo Tower | [Wikipedia](https://en.wikipedia.org/wiki/Cairo_Tower), [Heidelberg Materials reference project](https://www.heidelbergmaterials.com/en/reference-projects/cairo-tower-egypt) |
| Golden Gate Bridge | [Wikipedia](https://en.wikipedia.org/wiki/Golden_Gate_Bridge), Commons file page |
| Stonehenge | [UNESCO 373](https://whc.unesco.org/en/list/373), Commons file page |
| Arc de Triomphe | [Wikipedia](https://en.wikipedia.org/wiki/Arc_de_Triomphe), Commons file page |
| Acropolis | [UNESCO 404](https://whc.unesco.org/en/list/404), Commons file page |
| Tower Bridge | [towerbridge.org.uk (official)](https://www.towerbridge.org.uk/stories/top-facts-of-tower-bridge), [Wikipedia](https://en.wikipedia.org/wiki/Tower_Bridge) |
| Petra | [UNESCO 326](https://whc.unesco.org/en/list/326), Commons file page |
| Louvre | [UNESCO 600](https://whc.unesco.org/en/list/600), Commons file page |
| Moai | [UNESCO 715 Rapa Nui National Park](https://whc.unesco.org/en/list/715), Commons file page (Rano Raraku) |
| Mount Rushmore (text) | [NPS Mount Rushmore cultural landscape](https://www.nps.gov/articles/000/mount-rushmore-national-memorial-501080.htm), [Britannica](https://www.britannica.com/topic/Mount-Rushmore-National-Memorial): South Dakota, Washington, Jefferson, T. Roosevelt, Lincoln |
| Mosque of Muhammad Ali | [UNESCO 89 Historic Cairo](https://whc.unesco.org/en/list/89), Commons file page |
| Citadel of Qaitbay | [Wikipedia](https://en.wikipedia.org/wiki/Citadel_of_Qaitbay), [Atlas Obscura](https://www.atlasobscura.com/places/qaitbay-citadel) |
| Bibliotheca Alexandrina | [Snohetta project page](https://www.snohetta.com/projects/bibliotheca-alexandrina), [Archnet](https://www.archnet.org/sites/4370), [Wikipedia](https://en.wikipedia.org/wiki/Bibliotheca_Alexandrina) |
| Saint Basil's Cathedral | [UNESCO 545 Kremlin and Red Square](https://whc.unesco.org/en/list/545), Commons file page |
| Brandenburg Gate | [Wikipedia](https://en.wikipedia.org/wiki/Brandenburg_Gate), Commons file page |
| Sagrada Familia | [UNESCO 320 Works of Antoni Gaudi](https://whc.unesco.org/en/list/320), Commons file page |
| Chichen Itza | [UNESCO 483](https://whc.unesco.org/en/list/483), Commons file page |
| Trevi Fountain | [UNESCO 91](https://whc.unesco.org/en/list/91), Commons file page |
| Marina Bay Sands | [Wikipedia](https://en.wikipedia.org/wiki/Marina_Bay_Sands), [designboom](https://www.designboom.com/architecture/moshe-safdie-marina-bay-sands/) |
| Terracotta Army | [UNESCO 441 Mausoleum of the First Qin Emperor](https://whc.unesco.org/en/list/441), Commons file page |
| Temple of Hatshepsut | [UNESCO 87 Ancient Thebes](https://whc.unesco.org/en/list/87), Commons file page |
| Obelisk (text) | [Britannica, Luxor Obelisk](https://www.britannica.com/place/Luxor-Obelisk), [Sortiraparis](https://www.sortiraparis.com/en/what-to-visit-in-paris/history-heritage/articles/262297-ephemeris-for-october-25-in-paris-installation-of-the-luxor-obelisk-on-place-de-la-concorde): from Luxor Temple, erected in the Place de la Concorde on 25 October 1836 |
| Kuwait Towers | [Wikipedia](https://en.wikipedia.org/wiki/Kuwait_Towers), [Kuwait Times](https://kuwaittimes.com/article/40142/kuwait/other-news/kuwait-towers-an-enduring-symbol-of-national-identity/) |
| Dubai Frame | [Wikipedia](https://en.wikipedia.org/wiki/Dubai_Frame), [ArchDaily](https://www.archdaily.com/886425/worlds-largest-picture-frame-opens-in-dubai) |
| Stanley Bridge | [Wikipedia, Stanley (neighborhood)](https://en.wikipedia.org/wiki/Stanley_(neighborhood)), [Wikipedia, Alexandria Corniche](https://en.wikipedia.org/wiki/Alexandria_Corniche), Commons file page |
| Grand Egyptian Museum | [Wikipedia](https://en.wikipedia.org/wiki/Grand_Egyptian_Museum), [ArchDaily](https://www.archdaily.com/1035595/the-grand-egyptian-museum-fully-opens-completing-gizas-new-cultural-landmark): Ramesses II colossus in the Grand Hall |
| Space Needle | [spaceneedle.com (official)](https://www.spaceneedle.com/history), [MOHAI](https://mohai.org/collections-and-research/theme/century-21-exposition-1962-worlds-fair/) |
| Alhambra | [UNESCO 314](https://whc.unesco.org/en/list/314), Commons file page |
| Atomium | [City of Brussels](https://www.brussels.be/atomium), [BIE Expo 1958](https://www.bie-paris.org/site/en/1958-brussels) |
| Florence Cathedral | [UNESCO 174 Historic Centre of Florence](https://whc.unesco.org/en/list/174), Commons file page |
| Kinkaku-ji | [UNESCO 688 Historic Monuments of Ancient Kyoto](https://whc.unesco.org/en/list/688), Commons file page |
| Uluru (text) | [uluru.gov.au (official park site)](https://uluru.gov.au/discover/history/uluru-climb-closure/), [ABC News](https://www.abc.net.au/news/2019-10-26/uluru-climb-closed-permanently-by-traditional-owners/11639248), [UNESCO 447](https://whc.unesco.org/en/list/447): Northern Territory, Anangu, sandstone, climb closed 26 October 2019 |
| Philae Temple | [UNESCO 88](https://whc.unesco.org/en/list/88), Commons file page |
| Baron Empain Palace | [Wikipedia](https://en.wikipedia.org/wiki/Baron_Empain_Palace), [ABC News](https://abcnews.com/International/ghosts-laid-rest-cairos-109-year-baron-empain/story?id=71539392) |
| Montaza Palace | [Wikipedia](https://en.wikipedia.org/wiki/Montaza_Palace), Commons file page and category |
| Pompey's Pillar | [Wikipedia](https://en.wikipedia.org/wiki/Pompey%27s_Pillar), [Wikipedia, Serapeum of Alexandria](https://en.wikipedia.org/wiki/Serapeum_of_Alexandria), Commons file page |
| Museum of the Future | [Wikipedia](https://en.wikipedia.org/wiki/Museum_of_the_Future), [Gulf News](https://gulfnews.com/places/museum-of-the-future) |
| Kingdom Centre | [Wikipedia](https://en.wikipedia.org/wiki/Kingdom_Centre), [SkyscraperPage](https://skyscraperpage.com/cities/?buildingID=38) |
| Mosque-Cathedral of Cordoba | [UNESCO 313 Historic Centre of Cordoba](https://whc.unesco.org/en/list/313), Commons file page |
| Ponte Vecchio | [UNESCO 174](https://whc.unesco.org/en/list/174), Commons file page |
| Hungarian Parliament | [UNESCO 400 Budapest](https://whc.unesco.org/en/list/400), Commons file page |
| Temple of Heaven | [UNESCO 881](https://whc.unesco.org/en/list/881), Commons file page |
| Colossus of Rhodes (text) | [Britannica](https://www.britannica.com/topic/Colossus-of-Rhodes), [World History Encyclopedia](https://www.worldhistory.org/Colossus_of_Rhodes/): bronze statue of Helios, one of the Seven Wonders, toppled by an earthquake c. 226 BC |
| Baalbek | [UNESCO 294](https://whc.unesco.org/en/list/294), Commons file page (Temple of Bacchus) |
| Petronas Towers | [Britannica](https://www.britannica.com/topic/Petronas-Twin-Towers), Commons file page |
| Neuschwanstein | [UNESCO 1726 Palaces of King Ludwig II of Bavaria (inscribed 2025)](https://whc.unesco.org/en/list/1726), Commons file page |
| Ziggurat of Ur | [UNESCO 1481 The Ahwar of Southern Iraq ... Mesopotamian Cities](https://whc.unesco.org/en/list/1481), Commons file page (next to Tallil / Ali Air Base) |
| Qasr al-Farid | [UNESCO 1293 Hegra](https://whc.unesco.org/en/list/1293), Commons file page |
| Ait Benhaddou | [UNESCO 444](https://whc.unesco.org/en/list/444), Commons file page |
| Louvre Abu Dhabi | [Dezeen](https://www.dezeen.com/2017/11/07/jean-nouvel-louvre-abu-dhabi-art-museum-united-arab-emirates/), [The Architect's Newspaper](https://www.archpaper.com/2017/11/jean-nouvel-louvre-abu-dhabi-opens/) |
| Colossi of Memnon | [UNESCO 87](https://whc.unesco.org/en/list/87), Commons file page |
| Great Mosque of Djenne | [UNESCO 116 Old Towns of Djenne](https://whc.unesco.org/en/list/116), Commons file page |
| Mausoleum at Halicarnassus (text) | [Wikipedia](https://en.wikipedia.org/wiki/Mausoleum_at_Halicarnassus), [EBSCO Research Starters, Mausolus](https://www.ebsco.com/research-starters/history/mausolus/): tomb of Mausolus at Halicarnassus (Bodrum), one of the Seven Wonders, origin of "mausoleum" |
| Avenue of Sphinxes (text) | [Egypt Ministry of Tourism and Antiquities](https://egymonuments.gov.eg/en/events/avenue-of-sphinxes-reopening-ceremony-on-25-november-2021/), [The National](https://www.thenationalnews.com/mena/egypt/2021/11/25/egypts-avenue-of-sphinxes-reopens-in-spectacular-style/), [CNN](https://edition.cnn.com/travel/article/egypt-ancient-walkway-scli-intl-scn/index.html): 2.7 km, Karnak to Luxor Temple, reopened 25 November 2021 |

Reworded during fact-checking:
- Colossus of Rhodes: the draft said it "stood at a Greek island's harbour". Its exact position (and the straddling-the-harbour legend) is disputed, and the earthquake year varies between sources (228, 227 or 226 BC). It now says "toppled by an earthquake in the 3rd century BC".
- Uluru: the draft said "once called Ayers Rock", which is an accepted answer. Replaced with the 2019 climbing closure.
- Avenue of Sphinxes: the draft named "Karnak Temple and Luxor Temple", which would give away Geography 400 (Luxor). Now "links two great temples" in Upper Egypt.
- Istanbul (planned text question on Hagia Sophia and the Blue Mosque) was dropped: Istanbul is already an answer (Geography 300). Replaced by the obelisk question.

## Image sources and licences

All files are from Wikimedia Commons, downloaded on 2026-10-22 from upload.wikimedia.org (1280 px renditions of the current revision), resized and re-encoded as JPEG (a derivative: resized only, not cropped). The licence was read from each file page via the Commons API at download time. CC BY and CC BY-SA require attribution (author, licence, link). CC BY-SA also requires derivatives to stay under the same licence. An attribution or credits page on the site would satisfy this (a decision for the owner). Commons file-page templates were checked: only Burj Khalifa carries a warning ("NoFoP-UAE"), Sydney Opera House, Christ the Redeemer, Kingdom Centre and Petronas carry "FoP-<country>: OK" templates, and none has a deletion request. No file is under a non-PD/CC licence.

**Credits in the game (D-34, 2026-10-22).** Every picture row has an `image_credit` set at the end of `sql/add-landmarks-questions.sql` (run `sql/migrate-add-image-credit.sql` first), shown as "Photo: <credit>" under the photo. Format `<Author> / <Licence>` from this table, with the licence's country suffix in capitals (`CC BY-SA 3.0 DE`, `CC BY-SA 2.5 CA`, `CC BY 3.0 DE`) and `<Author> / Public domain` or `<Author> / CC0` for the free ones. Shortened authors: "Jorge Láscar from Melbourne, Australia" → `Jorge Láscar` and "Wajahat Mahmood from Perth, Australia" → `Wajahat Mahmood` (the Flickr home towns would point players at Australia, and Sydney is another answer), "MyName (Cacophony)" → `Cacophony`, "en:User:Hardnfast" → `Hardnfast`. No author name reveals a landmark, so none was replaced by "Wikimedia Commons". Counts: 58 CC BY / CC BY-SA, 4 CC0, 4 public domain.

| Points | File | Commons file page | Author | Licence | File revision |
|---|---|---|---|---|---|
| 100 | `landmark-pyramids-giza.jpg` | [All Gizah Pyramids.jpg](https://commons.wikimedia.org/wiki/File:All_Gizah_Pyramids.jpg) | Ricardo Liberato | CC BY-SA 2.0 | 2007-07-19 |
| 100 | `landmark-eiffel-tower.jpg` | [Tour Eiffel Wikimedia Commons.jpg](https://commons.wikimedia.org/wiki/File:Tour_Eiffel_Wikimedia_Commons.jpg) | Benh LIEU SONG | Public domain | 2009-06-02 |
| 100 | `landmark-statue-of-liberty.jpg` | [Statue of liberty front.jpg](https://commons.wikimedia.org/wiki/File:Statue_of_liberty_front.jpg) | 銀河市長 | CC BY-SA 4.0 | 2023-07-30 |
| 100 | `landmark-taj-mahal.jpg` | [Taj Mahal, Agra, India edit2.jpg](https://commons.wikimedia.org/wiki/File:Taj_Mahal,_Agra,_India_edit2.jpg) | Yann; edited by King of Hearts | CC BY-SA 4.0 | 2010-08-26 |
| 100 | `landmark-great-wall.jpg` | [Badaling China Great-Wall-of-China-01.jpg](https://commons.wikimedia.org/wiki/File:Badaling_China_Great-Wall-of-China-01.jpg) | CEphoto, Uwe Aranas | CC BY-SA 3.0 | 2016-04-22 |
| 100 | `landmark-leaning-tower-pisa.jpg` | [Exterior of the Leaning Tower (Pisa) in April 2024.1.jpg](https://commons.wikimedia.org/wiki/File:Exterior_of_the_Leaning_Tower_%28Pisa%29_in_April_2024.1.jpg) | PaestumPaestum | CC BY 4.0 | 2024-09-26 |
| 100 | `landmark-big-ben.jpg` | [Big Ben at sunset - 2014-10-27 17-30.jpg](https://commons.wikimedia.org/wiki/File:Big_Ben_at_sunset_-_2014-10-27_17-30.jpg) | Colin | CC BY-SA 4.0 | 2014-12-05 |
| 100 | `landmark-sydney-opera-house.jpg` | [Sydneyoperahouse at night.jpg](https://commons.wikimedia.org/wiki/File:Sydneyoperahouse_at_night.jpg) | Thomas Adams | CC BY-SA 4.0 | 2017-09-30 |
| 100 | `landmark-burj-khalifa.jpg` | [Burj Khalifa (16260269606).jpg](https://commons.wikimedia.org/wiki/File:Burj_Khalifa_%2816260269606%29.jpg) | Laika ac | CC BY-SA 2.0 | 2020-03-16 |
| 100 | `landmark-colosseum.jpg` | [Rom (IT), Kolosseum -- 2024 -- 0610.jpg](https://commons.wikimedia.org/wiki/File:Rom_%28IT%29,_Kolosseum_--_2024_--_0610.jpg) | Anil Öztas | CC BY 4.0 | 2024-08-30 |
| 100 | `landmark-christ-the-redeemer.jpg` | [Christ the Redeemer - Cristo Redentor.jpg](https://commons.wikimedia.org/wiki/File:Christ_the_Redeemer_-_Cristo_Redentor.jpg) | Arne Müseler | CC BY-SA 3.0 de | 2022-03-25 |
| 100 | `landmark-white-house.jpg` | [The White House, Washington, D.C. USA2.jpg](https://commons.wikimedia.org/wiki/File:The_White_House,_Washington,_D.C._USA2.jpg) | Diego Delso | CC BY-SA 3.0 | 2020-01-21 |
| 200 | `landmark-abu-simbel.jpg` | [Templo de Ramsés II, Abu Simbel, Egipto, 2022-04-02, DD 03.jpg](https://commons.wikimedia.org/wiki/File:Templo_de_Rams%C3%A9s_II,_Abu_Simbel,_Egipto,_2022-04-02,_DD_03.jpg) | Diego Delso | CC BY-SA 4.0 | 2022-09-21 |
| 200 | `landmark-cairo-tower.jpg` | [Cairo Tower (14613624977).jpg](https://commons.wikimedia.org/wiki/File:Cairo_Tower_%2814613624977%29.jpg) | Jorge Láscar from Melbourne, Australia | CC BY 2.0 | 2018-02-08 |
| 200 | `landmark-golden-gate-bridge.jpg` | [Golden Gate Bridge as seen from Battery East.jpg](https://commons.wikimedia.org/wiki/File:Golden_Gate_Bridge_as_seen_from_Battery_East.jpg) | Frank Schulenburg | CC BY-SA 4.0 | 2017-06-24 |
| 200 | `landmark-stonehenge.jpg` | [Stonehenge, Condado de Wiltshire, Inglaterra, 2014-08-12, DD 18.JPG](https://commons.wikimedia.org/wiki/File:Stonehenge,_Condado_de_Wiltshire,_Inglaterra,_2014-08-12,_DD_18.JPG) | Diego Delso | CC BY-SA 4.0 | 2014-09-12 |
| 200 | `landmark-arc-de-triomphe.jpg` | [Arc de Triomphe de l'Étoile at night vertical fix.jpg](https://commons.wikimedia.org/wiki/File:Arc_de_Triomphe_de_l%27%C3%89toile_at_night_vertical_fix.jpg) | Wilfredor | CC0 | 2024-04-07 |
| 200 | `landmark-acropolis.jpg` | [Attica 06-13 Athens 50 View from Philopappos - Acropolis Hill.jpg](https://commons.wikimedia.org/wiki/File:Attica_06-13_Athens_50_View_from_Philopappos_-_Acropolis_Hill.jpg) | A.Savin | CC BY-SA 3.0 | 2021-06-27 |
| 200 | `landmark-tower-bridge.jpg` | [Tower Bridge golden hour.jpg](https://commons.wikimedia.org/wiki/File:Tower_Bridge_golden_hour.jpg) | The Cosmonaut | CC BY-SA 2.5 ca | 2025-09-02 |
| 200 | `landmark-petra.jpg` | [The Treasury, Petra, Jordan1.jpg](https://commons.wikimedia.org/wiki/File:The_Treasury,_Petra,_Jordan1.jpg) | Diego Delso | CC BY-SA 3.0 | 2020-12-12 |
| 200 | `landmark-louvre-pyramid.jpg` | [Louvre museum 01.jpg](https://commons.wikimedia.org/wiki/File:Louvre_museum_01.jpg) | Maksim Sokolov (maxergon.com) | CC BY-SA 4.0 | 2022-08-06 |
| 300 | `landmark-muhammad-ali-mosque.jpg` | [Muhammad Ali Mosque 1.jpg](https://commons.wikimedia.org/wiki/File:Muhammad_Ali_Mosque_1.jpg) | kallerna | CC BY-SA 3.0 | 2010-12-03 |
| 300 | `landmark-qaitbay-citadel.jpg` | [Citadel of Qaitbay 014.JPG](https://commons.wikimedia.org/wiki/File:Citadel_of_Qaitbay_014.JPG) | لا روسا | CC BY-SA 3.0 | 2015-03-03 |
| 300 | `landmark-bibliotheca-alexandrina.jpg` | [Alexandria library (1).jpg](https://commons.wikimedia.org/wiki/File:Alexandria_library_%281%29.jpg) | Ahmedsalahemam | CC BY-SA 4.0 | 2023-10-18 |
| 300 | `landmark-st-basils-cathedral.jpg` | [Moscow - 2025 - Daytime view of St. Basil's Cathedral from Vasilyevsky Spusk.jpg](https://commons.wikimedia.org/wiki/File:Moscow_-_2025_-_Daytime_view_of_St._Basil%27s_Cathedral_from_Vasilyevsky_Spusk.jpg) | Юрий Д.К. | CC BY 4.0 | 2025-10-08 |
| 300 | `landmark-brandenburg-gate.jpg` | [Brandenburger Tor morgens.jpg](https://commons.wikimedia.org/wiki/File:Brandenburger_Tor_morgens.jpg) | Thomas Wolf, www.foto-tw.de | CC BY-SA 3.0 | 2013-08-24 |
| 300 | `landmark-sagrada-familia.jpg` | [Sagrada Família exterior Barcelona 2026.jpg](https://commons.wikimedia.org/wiki/File:Sagrada_Fam%C3%ADlia_exterior_Barcelona_2026.jpg) | Wikipsico43 | CC BY-SA 4.0 | 2026-05-30 |
| 300 | `landmark-trevi-fountain.jpg` | [Fontaine Trevi - Rome.jpg](https://commons.wikimedia.org/wiki/File:Fontaine_Trevi_-_Rome.jpg) | Wilfredor | CC0 | 2025-11-29 |
| 300 | `landmark-marina-bay-sands.jpg` | [Cricket match and Marina Bay Sands Hotel in Singapore.jpg](https://commons.wikimedia.org/wiki/File:Cricket_match_and_Marina_Bay_Sands_Hotel_in_Singapore.jpg) | Basile Morin | CC BY-SA 4.0 | 2018-07-19 |
| 300 | `landmark-hatshepsut-temple.jpg` | [Templo funerario de Hatshepsut, Valle de las Reyes, Luxor, Egipto, 2022-04-03, DD 118.jpg](https://commons.wikimedia.org/wiki/File:Templo_funerario_de_Hatshepsut,_Valle_de_las_Reyes,_Luxor,_Egipto,_2022-04-03,_DD_118.jpg) | Diego Delso | CC BY-SA 4.0 | 2022-11-18 |
| 400 | `landmark-kuwait-towers.jpg` | [Rise and shine at seaside.jpg](https://commons.wikimedia.org/wiki/File:Rise_and_shine_at_seaside.jpg) | Criselda Rayo | CC BY-SA 4.0 | 2025-07-22 |
| 400 | `landmark-dubai-frame.jpg` | [190410 Dubai Frame.jpg](https://commons.wikimedia.org/wiki/File:190410_Dubai_Frame.jpg) | Rennboot | CC BY 3.0 | 2019-04-19 |
| 400 | `landmark-stanley-bridge.jpg` | [Stanley Bridge, Alexandria, Jan. 2019-1.jpg](https://commons.wikimedia.org/wiki/File:Stanley_Bridge,_Alexandria,_Jan._2019-1.jpg) | Шухрат Саъдиев | CC BY-SA 4.0 | 2019-03-04 |
| 400 | `landmark-grand-egyptian-museum.jpg` | [75 Tonnen wiegt die Kolossalstatue des Ramses II im Großen Ägyptischen Museum. 02.jpg](https://commons.wikimedia.org/wiki/File:75_Tonnen_wiegt_die_Kolossalstatue_des_Ramses_II_im_Gro%C3%9Fen_%C3%84gyptischen_Museum._02.jpg) | Holger Uwe Schmitt | CC BY-SA 4.0 | 2026-01-05 |
| 400 | `landmark-alhambra.jpg` | [Alhambra in the evening.jpg](https://commons.wikimedia.org/wiki/File:Alhambra_in_the_evening.jpg) | Jebulon | Public domain | 2010-08-30 |
| 400 | `landmark-florence-cathedral.jpg` | [Florence Duomo from Michelangelo hill.jpg](https://commons.wikimedia.org/wiki/File:Florence_Duomo_from_Michelangelo_hill.jpg) | Petar Milošević | CC BY-SA 4.0 | 2015-03-13 |
| 500 | `landmark-baron-empain-palace.jpg` | [The Baron Palace.JPG](https://commons.wikimedia.org/wiki/File:The_Baron_Palace.JPG) | amr moustafa shalaby | CC BY 3.0 | 2020-06-24 |
| 500 | `landmark-montaza-palace.jpg` | [Montaza Palace, Alexandria, Egypt - Murat Özsoy 2018 (2).jpg](https://commons.wikimedia.org/wiki/File:Montaza_Palace,_Alexandria,_Egypt_-_Murat_%C3%96zsoy_2018_%282%29.jpg) | Murat Özsoy 1958 | CC BY-SA 4.0 | 2020-06-13 |
| 500 | `landmark-museum-of-the-future.jpg` | [Museum of the Future.jpg](https://commons.wikimedia.org/wiki/File:Museum_of_the_Future.jpg) | Александр Сигачёв | CC BY-SA 4.0 | 2025-11-10 |
| 500 | `landmark-kingdom-centre.jpg` | [Kingdom Centre, Riyadh (6129688934).jpg](https://commons.wikimedia.org/wiki/File:Kingdom_Centre,_Riyadh_%286129688934%29.jpg) | Wajahat Mahmood from Perth, Australia | CC BY-SA 2.0 | 2017-09-29 |
| 500 | `landmark-hungarian-parliament.jpg` | [Országház (Hungarian Parliament Building)(2).jpg](https://commons.wikimedia.org/wiki/File:Orsz%C3%A1gh%C3%A1z_%28Hungarian_Parliament_Building%29%282%29.jpg) | Lynx1211 | CC BY-SA 4.0 | 2024-09-19 |
| 600 | `landmark-petronas-towers.jpg` | [2016 Kuala Lumpur, Petronas Towers (21).jpg](https://commons.wikimedia.org/wiki/File:2016_Kuala_Lumpur,_Petronas_Towers_%2821%29.jpg) | Marcin Konsek | CC BY-SA 4.0 | 2017-01-03 |
| 600 | `landmark-neuschwanstein.jpg` | [Neuschwanstein Castle 2024-02.jpg](https://commons.wikimedia.org/wiki/File:Neuschwanstein_Castle_2024-02.jpg) | Wilfredor | CC0 | 2025-11-30 |
| 600 | `landmark-louvre-abu-dhabi.jpg` | [Louvre abu dhabi, interno, cortile coperto 02.jpg](https://commons.wikimedia.org/wiki/File:Louvre_abu_dhabi,_interno,_cortile_coperto_02.jpg) | Francesco Bini | CC BY-SA 4.0 | 2025-12-04 |

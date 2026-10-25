# Review: Cartoons & Childhood, Arabic and Egyptian set

- **Request:** 5 new questions for the existing "Cartoons & Childhood" category (id 30 locally, no new category), one each at 200, 300, 400, 500 and 600. Theme: Arabic and Egyptian cartoons and childhood. That means Egyptian and Arab animated series, Arabic dubs of classic anime, and childhood songs and the singers behind them. The questions are mixed across these, not all on one show.
- **Date:** 2026-10-23
- **SQL file:** `sql/add-cartoons-arabic-questions.sql` (loaded into the local DB, see the end of this doc)
- **Point values (local DB):** 100, 200, 300, 400, 500, 600
- **Owner removal (2026-10-23):** the 400 ("Romeo's Blue Skies" = "Ahd Al-Asdiqaa") and the 600 (Mazinger Z) were removed after review. They are gone from the SQL file and were deleted from the local DB (ids 1436 and 1438). Their fact-check is kept below for reference. The set is now 3 questions.

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Cartoons & Childhood before | 9 | 3 | 4 | 4 | 3 | 1 | 24 |
| This set | 0 | 1 | 1 | 0 | 1 | 0 | 3 |
| Cartoons & Childhood after | 9 | 4 | 5 | 4 | 4 | 1 | 27 |

**Sub-topic spread**

| Points | Topic | Kind |
|---|---|---|
| 200 | Bakkar's theme songs (Mohamed Mounir) | Egyptian cartoon + singer |
| 300 | "Ahlan bel Eid" (Safaa Abu El Saud) | Classic Egyptian children's / Eid song |
| 500 | Rasha Rizk | Singer of dubbed-cartoon theme songs |

**Notes for the owner**

1. **Wording that avoids naming existing answers.**
   - The 200 does not name Bakkar (Egyptians 200 answer). It describes the show the same way as the Hassouna 400.
   - The 500 does not name Spacetoon (Cartoons 200 answer).
2. **Shared words, not giveaways.**
   - "Mounir": Sherif Mounir is named in an Egyptians 500 question and is a wrong option in an Egyptians 400. He is a different person.
   - "Rizk": "Welad Rizk" is an Egyptians answer and "Amina Rizk" is a wrong option.

   Neither word points to the other answer. This is the same as "Bell" in the Tinker Bell question.
3. **Difficulty.**
   - The 200 is easy for Egyptian players: the "El King" nickname is a strong hint.
   - The 300 is aimed at players who grew up in the 1980s-2000s.
   - The 500 leans on the Spacetoon era (around 2000-2010), so Gulf and Levant players may find it easier than some Egyptian players.
4. **Women singers in the Arabic text.** The Arabic 300 and 500 questions say "مطربة", so all 3 choices are women. The English text says "singer".
5. **Existing row 1149 (resolved):** the 100 question "What was the name of the Arabic version of 'Sesame Street', made in the Gulf from 1979 ..." has the answer "Aalam Simsim (accept Open Sesame)", set by the owner in live Admin. This set does not touch the row; the same PR updates `sql/add-cartoons-questions.sql` and `cartoons-review.md` to that answer.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|
| 200 | Which singer, nicknamed "El King", sang the theme songs of the Egyptian cartoon about a Nubian boy and his goat, Rashida? | Mohamed Mounir (accept Mounir) | أي مطرب، يلقّبه جمهوره بـ"الكينج"، غنّى تترات مسلسل الكرتون المصري عن الطفل النوبي وعنزته رشيدة؟ | محمد منير | Ali El Haggar, Medhat Saleh / علي الحجار، مدحت صالح | The show is "Bakkar". Mounir sang both the opening and the closing songs (1998, and again for the 2015 3D series). Reject Ali El Haggar, Medhat Saleh and Mohamed Fouad. Reject "Bakkar" (that's the show). |
| 300 | Which Egyptian singer recorded "Ahlan bel Eid" ("Welcome, Eid"), the cheerful holiday song composed by Gamal Salama that is still played at every Eid? | Safaa Abu El Saud (accept Safaa Abou El Seoud) | أي مطربة مصرية غنّت "أهلًا بالعيد"، أغنية العيد المبهجة من ألحان جمال سلامة التي ما زالت تُذاع في كل عيد؟ | صفاء أبو السعود | Fayza Ahmed, Najat El Saghira / فايزة أحمد، نجاة الصغيرة | Reject Umm Kulthum ("Ya Leilet El Eid" is a different Eid song). Reject Shadia: Youm7 says the song was first offered to her and she turned it down. Reject Gamal Salama (the composer). |
| 500 | Which Syrian singer sang the Arabic theme songs of many dubbed cartoons, including "Detective Conan" and "Hunter x Hunter"? | Rasha Rizk (accept Racha Rizk) | أي مطربة سورية غنّت الشارات العربية لكثير من الرسوم المتحركة المدبلجة، ومنها "المحقق كونان" و"القناص"؟ | رشا رزق | Assala Nasri, Mayada El Hennawy / أصالة نصري، ميادة الحناوي | Reject Tarek El Arabi Tourgane: he composed and sang many Spacetoon themes, often with her, but he is a man and not the answer. Reject Amal Hawijeh (voice of Captain Majid) and Sami Clark (Grendizer). |

**Wrong options checked:**
- Each pair has the same type and form as the answer: male Egyptian singers (200), female Egyptian singers (300), female Syrian singers (500).
- None is also correct and none is another name for the answer. The options differ from each other and from the answer (case-insensitive), in English and Arabic.
- Option ownership:
  - Ali El Haggar and Medhat Saleh: neither sang a Bakkar theme. Both Bakkar sources credit Mounir for the opening and closing themes.
  - Fayza Ahmed and Najat El Saghira: neither recorded "Ahlan bel Eid".
  - Assala Nasri and Mayada El Hennawy are Syrian pop singers, not cartoon-theme singers.

---

## Fact-check log

Each answer, and each fact stated in its question, was checked in at least 2 independent sources. Rows marked (W) use English or Arabic Wikipedia as one of them, next to non-wiki sources. The 400 and 600 rows are kept for reference only; the owner removed those questions.

| Points | Answer | Sources |
|---|---|---|
| 200 | Mohamed Mounir | [Youm7 (2025), the story of the Bakkar song](https://www.youm7.com/story/2025/10/10/%D8%B9%D9%8A%D8%AF-%D9%85%D9%8A%D9%84%D8%A7%D8%AF-%D9%85%D8%AD%D9%85%D8%AF-%D9%85%D9%86%D9%8A%D8%B1-%D9%83%D9%88%D8%A7%D9%84%D9%8A%D8%B3-%D8%A3%D8%BA%D9%86%D9%8A%D8%A9-%D8%A8%D9%83%D8%A7%D8%B1-%D9%88%D9%83%D9%8A%D9%81-%D8%AA%D8%AD%D9%88%D9%84-%D9%85%D9%86/7150718) ("الكينج محمد منير", sang the Bakkar song, which began as a theme for Mona Abou El Nasr's short film), [Youm7 (2013), Mounir's TV themes](https://www.youm7.com/story/2013/10/9/%D8%A8%D8%A7%D9%84%D9%81%D9%8A%D8%AF%D9%8A%D9%88-%D8%AA%D8%AA%D8%B1%D8%A7%D8%AA-%D8%A7%D9%84%D9%85%D8%B3%D9%84%D8%B3%D9%84%D8%A7%D8%AA-%D8%A7%D9%84%D8%AA%D9%89-%D9%82%D8%AF%D9%85%D9%87%D8%A7-%D9%85%D9%86%D9%8A%D8%B1-%D8%B9%D9%84%D8%A7%D9%85%D8%A9-%D9%85%D9%85%D9%8A%D8%B2%D8%A9-%D9%81%D9%89-%D8%AA%D8%A7%D8%B1%D9%8A%D8%AE/1290189), [Billboard Arabia, themes sung by Mohamed Mounir](https://www.billboardarabia.com/%D8%AB%D9%82%D8%A7%D9%81%D8%A9/%D8%AA%D9%84%D9%81%D8%B2%D9%8A%D9%88%D9%86-%D9%88%D8%A3%D9%81%D9%84%D8%A7%D9%85/%D8%AA%D8%AA%D8%B1%D8%A7%D8%AA-%D8%A8%D8%B5%D9%88%D8%AA-%D9%85%D8%AD%D9%85%D8%AF-%D9%85%D9%86%D9%8A%D8%B1-3532) (Bakkar opening and closing themes, 1998), [Al Dostour, Bakkar in Ramadan 2025](https://www.dostor.org/4991507) (Mounir's opening and closing themes). The Nubian boy and his goat Rashida: [Egypt Independent, Bakkar returns in 3D](https://www.egyptindependent.com/bakkar-animated-series-returns-this-ramadan-in-3d/), as in the existing Hassouna row. |
| 300 | Safaa Abu El Saud | [Youm7 (2024), "Ahlan bel Eid", an icon of joy](https://www.youm7.com/story/2024/4/10/%D8%A3%D9%87%D9%84%D8%A7-%D8%A8%D8%A7%D9%84%D8%B9%D9%8A%D8%AF-%D8%A3%D9%8A%D9%82%D9%88%D9%86%D8%A9-%D8%A7%D9%84%D9%81%D8%B1%D8%AD%D8%A9-%D9%81%D9%8A-%D9%83%D9%84-%D8%A7%D9%84%D8%A3%D8%B9%D9%8A%D8%A7%D8%AF-%D9%83%D9%84%D9%85%D8%A7%D8%AA-%D8%A8%D8%B3%D9%8A%D8%B7%D8%A9-%D9%88%D8%B9%D9%85%D9%8A%D9%82%D8%A9/6541305) (sung by Safaa Abu El Saud, lyrics by Abdel Wahab Mohamed, music by Gamal Salama, "for children and adults"), [Vetogate, the making of "Ahlan bel Eid"](https://www.vetogate.com/5128797) (same credits, "one of the landmarks of children's music"), [El Balad, an icon made by Gamal Salama and Safaa Abu El Saud](https://www.elbalad.news/5260610) |
| 400 | Ahd Al-Asdiqaa | [Egyptian Streets, Spacetoon: reliving childhood through every theme song](https://egyptianstreets.com/2021/08/29/spacetoon-reliving-childhood-through-every-theme-song/) ("'Aahd Al-Asdiqaa' (Romeo's Blue Sky)"), [As-Safir archive, Spacetoon and its songs](https://archive.assafir.com/ssr/10919047.html) («عهد الأصدقاء» theme by Rasha Rizk and Tarek El Arabi Tourgane), [Arabic Wikipedia, عهد الأصدقاء](https://ar.wikipedia.org/wiki/%D8%B9%D9%87%D8%AF_%D8%A7%D9%84%D8%A3%D8%B5%D8%AF%D9%82%D8%A7%D8%A1) (Arabic title of Romeo no Aoi Sora, Romeo works as a chimney sweep in Milan) (W). Plot: [IMDb, Romeo's Blue Skies (1995)](https://www.imdb.com/title/tt0168371/), [Inside Pulse, Romeo's Blue Skies Blu-ray review (2025)](https://insidepulse.com/2025/08/07/blu-ray-review-romeos-blue-skies-the-complete-series/), [Wikipedia, Romeo and the Black Brothers](https://en.wikipedia.org/wiki/Romeo_and_the_Black_Brothers) (W) |
| 500 | Rasha Rizk | [France 24 Arabic (2018), Rasha Rizk: Syrian singer and songwriter](https://www.france24.com/ar/20180820-%D8%B1%D8%B4%D8%A7-%D8%B1%D8%B2%D9%82-%D9%85%D8%BA%D9%86%D9%8A%D8%A9-%D9%88%D9%85%D8%A4%D9%84%D9%81%D8%A9-%D8%B3%D9%88%D8%B1%D9%8A%D8%A9) ("المغنية والمؤلفة السورية", sang the themes of Captain Majid, Detective Conan and Anastasia), [Egyptian Streets, Spacetoon theme songs](https://egyptianstreets.com/2021/08/29/spacetoon-reliving-childhood-through-every-theme-song/) (her voice on "Al-Qannas", Hunter x Hunter), [As-Safir archive](https://archive.assafir.com/ssr/10919047.html) (sang most of Spacetoon's theme songs), [Wikipedia, Rasha Rizk](https://en.wikipedia.org/wiki/Rasha_Rizk) (Syrian, born in Damascus, theme list includes Detective Conan and Hunter x Hunter, citing elCinema) (W) |
| 600 | Mazinger Z | [Arab News, Grendizer at 50](https://www.arabnews.com/Grendizer50) (1975: "Koji Kabuto, who first appeared in the Mazinger stories", 1972: Go Nagai introduces Mazinger), [Toei Animation, Mazinger Z (official list of works)](https://lineup.toei-anim.co.jp/en/tv/mazingerz/) (aired 3 Dec 1972 to 1 Sep 1974, "Kabuto Koji operates the Mazinger Z"), [Wikipedia, Koji Kabuto](https://en.wikipedia.org/wiki/Koji_Kabuto) (pilot of Mazinger Z, returns in Great Mazinger, Duke Fleed's friend in Grendizer) (W) |

### Dropped or reworded during fact-checking

- **Dropped:**
  - **Professor Agasa** (Detective Conan's gadget inventor, 400): only fan wikis. The bow tie had already been dropped for the same reason in the first Cartoons set.
  - **"Wahawy ya Wahawy" (Ahmed Abdel Kader):** Youm7 and Arabic Wikipedia credit Ahmed Abdel Kader (1937). Marefa says composer Ahmed El-Sherif and Samira Wasfi sang it first, in 1939. Mohamed Mounir also covered it, and he is this set's 200 answer.
  - **Why the hero is called "Majid" (Saudi striker Majed Abdullah):** only Middle East Eye says this, and it hedges ("apparently").
  - **Arabic voice of Captain Majid (Amal Hawijeh):** The National names her. Other accounts give Suhair Fahd for the first season and Amal Hawijeh for the second, so the answer depends on the season.
  - **Arabic singer of the Captain Majid theme:** sources disagree, and the first season's singer is not named by any reliable source.
  - **Venus Centre (the Damascus dubbing studio):** most sources are fan wikis, the founding year differs (1985 or 1991), and "Venus" is a Science answer.
  - **Grendizer's first Arabic broadcast (Tele Liban, 1979):** the answer would be "Lebanon", a Flags answer.
  - **The Grendizer statue in Riyadh:** it is described as a Guinness record that could be broken, and "Saudi Arabia" is a Flags and Geography answer.
  - **"Al-Qannas" as an answer:** it is a direct translation of "Hunter x Hunter", so it is too easy to guess, and the 500 already uses the show.
- **Reworded:**
  - 300: no release year. Sources point to 1982 but don't state it clearly. Youm7 and Vetogate give only the credits.
  - 400 (later removed by the owner): "a boy who goes to Milan to work as a chimney sweep" instead of naming the boys' gang. Arabic sources call it the "Black Wolves", the English sources the "Black Brothers".
  - 500: "theme songs" rather than "opening songs", and Captain Majid is not named, because sources disagree on which Captain Majid season she sang.

---

## Process notes

- **Duplicate check:**
  - Done against all 761 questions in the local DB (13 categories): question texts, answers and the stored wrong options, with read-only SELECTs.
  - None of the answers is an answer or wrong option anywhere in the bank.
  - No new question names an existing answer. Bakkar and Spacetoon are not named.
  - The owner's removals from the first Cartoons set were not re-added: Jihad El-Atrash, Alam Simsim, Baklaz, Ghenwa w Hadouta, Adnan wa Lina, Remi, Sally and the rest.
- **Local DB load:**
  - MariaDB was not running, so it was started with `mysqld.exe --defaults-file=C:/xampp/mysql/bin/my.ini --standalone`.
  - Before: 761 questions. Cartoons & Childhood 9 / 3 / 4 / 4 / 3 / 1.
  - Run 1 added exactly 5 rows (ids 1434-1438): 766 questions, Cartoons & Childhood 9 / 4 / 5 / 5 / 4 / 2. No other category changed.
  - Run 2 added nothing: counts were identical. No row was skipped.
  - After the owner's review, the 400 and 600 rows (ids 1436 and 1438) were deleted: 764 questions, Cartoons & Childhood 9 / 4 / 5 / 4 / 4 / 1.
  - All loaded rows have `image = ''` and all 4 option fields filled. The Arabic text is stored as utf8mb4 (checked by hex).
- **Checks on the file:**
  - The English text is plain ASCII with no pipes, backslashes or semicolons.
  - The longest question is about 150 characters.
  - Options have no brackets.
- **Prompt injection:** no retrieved page contained instructions aimed at the assistant.
- **Git:** nothing was committed, staged or branched.

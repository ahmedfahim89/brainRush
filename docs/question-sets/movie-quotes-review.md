# Review: Movies, famous quotes set (reworked twice)

- **Request:** a set for the existing "Movies" category (id 5 locally, no new category) on the theme "famous quotes": each question gives a well-known line and asks which film or series it comes from.
- **Second rework, owner decision 2026-10-24:** of the earlier 18 questions, keep only Groot (Guardians of the Galaxy, 100, id 1541, unchanged). The other 17 were deleted from the local DB (ids 1476, 1478, 1540, 1542-1555). Add the owner's two original examples: "May the odds be ever in your favor" (The Hunger Games) and "Winter is coming" (Game of Thrones).
- **Date:** 2026-10-24
- **SQL file:** `sql/add-movie-quotes-questions.sql` (loaded into the local DB). It lists all 3 rows. The kept Groot row is skipped where it already exists.

| Category | 100 | 200 | 400 | Total |
|---|---|---|---|---|
| This set | 1 | 1 | 1 | 3 |

Movies in the local DB: 63 after the deletion, 65 after the load.

**Notes for the owner**

1. **Point values chosen to avoid giveaways.** The first pass dropped both examples because Movies already has questions that name these titles. They are back at your request, at the same point value as one of those questions, so that pair can't be on the same board:
   - **The Hunger Games at 400:** the only other question naming it is "which actress plays Katniss Everdeen" (Movies 400). Both are at 400, so a board never shows both. The quote is easy for a 400.
   - **Game of Thrones at 200:** three Movies questions name the series (Mother of Dragons 200, House Lannister 400, Hodor 600). At 200 it can't share a board with the Mother of Dragons question, but it can with the other two, which would give its answer away. No point value avoids all three.
2. **One correct answer.**
   - "May the odds be ever in your favor" is the Capitol's greeting through the whole Hunger Games series. The question asks for the "film series", and any of its films is accepted.
   - "Winter is coming" is the House Stark motto in Game of Thrones. The run years (2011 to 2019) rule out the prequel House of the Dragon (2022). The books are accepted.
3. **Previously removed items.** None of the 17 removed questions is reused. `docs/question-sets/rejected-answers.md` was not edited.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|
| 100 | **(kept)** "I am Groot" is almost the only thing a walking tree says in which 2014 superhero film? | Guardians of the Galaxy (accept Guardians) | عبارة "I am Groot" ("أنا غروت") تكاد تكون الكلمات الوحيدة التي تقولها شجرة تمشي في أي فيلم أبطال خارقين من عام 2014؟ | حراس المجرة (Guardians of the Galaxy) | Captain America: The Winter Soldier, X-Men: Days of Future Past / كابتن أمريكا: جندي الشتاء، رجال إكس: أيام الماضي المستقبلي | Groot (Vin Diesel). "Almost", because once he says "We are Groot". Reject Vol. 2, Vol. 3 and the Avengers films: the question asks for 2014. |
| 200 | "Winter is coming." This line is from which TV series that ran from 2011 to 2019? | Game of Thrones (accept A Song of Ice and Fire, the books it is based on) | من أي مسلسل تلفزيوني عُرض من 2011 إلى 2019 هذه العبارة الشهيرة: "Winter is coming." ("الشتاء قادم")؟ | صراع العروش (Game of Thrones) | Vikings, The Witcher / الفايكنج، ذا ويتشر | The words of House Stark, said by Ned Stark in the first episode (also the episode's title). Reject "House of the Dragon" (2022): the years rule it out. |
| 400 | "May the odds be ever in your favor." This line is from which film series? | The Hunger Games (accept Hunger Games or any of its films) | من أي سلسلة أفلام هذه العبارة الشهيرة: "May the odds be ever in your favor." ("فلتكن الاحتمالات في صالحكم دائمًا")؟ | مباريات الجوع (The Hunger Games) | Divergent, The Maze Runner / المتباينة، عدّاء المتاهة | The Capitol's greeting at the reaping (Effie Trinket, President Snow), from the first film (2012) on. Any Hunger Games film is accepted. |

**Wrong options checked:** same genre and era as each answer (2014 superhero films; fantasy and period TV series; young-adult dystopian film series). None contains the quoted line, and none is an answer anywhere in the bank (checked with a SQL search on question and answer text).

---

## Fact-check log

| Points | Answer | Sources |
|---|---|---|
| 100 | Guardians of the Galaxy (kept) | [Wikiquote, Guardians of the Galaxy (2014)](https://en.wikiquote.org/wiki/Guardians_of_the_Galaxy_(film)), [Time](https://time.com/3070761/watch-vin-diesel-say-his-only-line-in-guardians-of-the-galaxy-in-4-different-languages/), [Wikipedia, Groot (MCU)](https://en.wikipedia.org/wiki/Groot_(Marvel_Cinematic_Universe)) |
| 200 | Game of Thrones | [Wikipedia, Winter Is Coming](https://en.wikipedia.org/wiki/Winter_Is_Coming) (House Stark's motto, the title of the first episode, aired 17 April 2011, said throughout the series). The series finale aired in May 2019. |
| 400 | The Hunger Games | [Wikiquote, The Hunger Games (film)](https://en.wikiquote.org/wiki/The_Hunger_Games_(film)) (President Snow: "...may the odds be ever in your favour", also the film's tagline). The question uses the US spelling "favor", as in the film's tagline. |

---

## Process notes

- **Local DB load** (`/c/xampp/mysql/bin/mysql.exe --default-character-set=utf8mb4 -u root brainrush`):
  - Movies: 63 before, 65 after run 1 (ids 1572 Game of Thrones and 1573 The Hunger Games added, Groot 1541 skipped), 65 after run 2.
- **Git:** nothing committed. Other untracked files were not touched.

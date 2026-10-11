# BrainRush: 600-point questions (seed categories, Egypt theme)

> **Note, changed 2026-10-11 (D-31, as amended 2026-10-11):** questions keep their point value, but a category may now have any number of questions per value. These 6 questions stay at 600 and join each category's 600 pool; the migration keeps any already added, with their points. With a 600 point value, each category needs at least one 600 question to be playable. The bank adds none at 600, so these 6 are what make the seed categories playable at 600. Step 2's "duplicate slot" message below no longer applies: a second 600 question per category is allowed. The coverage grid in step 3 is removed; the categories panel shows "Not playable: missing 600" instead.

Owner request 2026-10-05: add a 600-point row to the board, with every 600 question about Egypt (one per seed category). Each one is harder than that category's 500 question, and none repeats or overlaps an existing 100–500 question or answer. In every question Egypt is the subject, not a passing mention. None of the answers is "Egypt" itself, so the theme does not give the answer away.

Content rules followed: the spec and backlog have no explicit content rules. These questions follow the seed style: short, one clear answer, readable aloud in the default 30 s timer. All are well under the ~250-character limit that fits the question screen at 1366x768 (FU-04). An accepted-variant note is added only where needed. All facts are well established and cannot go out of date.

| Category | Question | Answer | Why it's harder than the 500 |
|---|---|---|---|
| Geography | Which peninsula is the only part of Egypt that lies in Asia? | The Sinai Peninsula | 500 (smallest country, Vatican City) is common general knowledge. This needs players to picture where Africa ends and Asia begins. |
| Science | Ancient Egyptians began their new year when which star, the brightest in the night sky, rose just before dawn? | Sirius (accept the Dog Star) | 500 (speed of light) can be estimated and accepts "about 300,000". This needs a specific star name. The clue "brightest in the night sky" lets a trivia player work it out. |
| History | For which pharaoh was the Great Pyramid of Giza built? | Khufu (accept Cheops) | 500 names a famous explorer. Most people know the pyramid but not the pharaoh, and Tutankhamun and Ramesses are tempting wrong answers. |
| Sports | In which year did Egypt become the first African country to play at a FIFA World Cup? | 1934 | 500 (tennis "love") is a widely known term. This is an exact year. Players can work it out from the early World Cup years (1930, 1934, 1938). |
| Movies | Which Egyptian actor was Oscar-nominated for playing Sherif Ali in "Lawrence of Arabia"? | Omar Sharif | 500 (Wings) is a famous Oscar fact. This needs players to know a specific actor from a 1962 epic. |
| Technology | Which huge hydroelectric dam, completed in 1970, holds back the Nile in southern Egypt? | The Aswan High Dam (accept Aswan Dam) | 500 (inventor of the Web) is modern and widely known. This is a 20th-century engineering fact that fewer players know. |

## How to add them (owner, via admin; no SQL, code or database changes)

1. **Add the point value first.** In Admin, open the Point values panel and add `600`. The database only accepts a question for a point value that exists, so the questions cannot be saved until 600 is there.
2. **Add the six questions.** In the Questions panel, pick the category and 600 for each one, then paste the question and answer exactly as in the table. Each category takes one 600 question only. A second one is rejected with a "duplicate slot" message.
3. **Playable rule side effect.** Once 600 exists, any category without a 600 question stops being playable. Until all six are entered, Setup may show the not-enough-categories message (D-11). The coverage grid shows which categories still need a 600 question. Any extra categories created in admin also need a 600 question.
4. **Each database separately.** Admin changes affect only the database they are made in. To have the row on both the local install and the hosted staging site, repeat steps 1–2 on each. Hosted admin writes need the admin credentials (D-20).
5. **Schema files unchanged.** `sql/schema.sql` and `sql/schema-hosted.sql` are not edited, so they stay in sync (US-29) and US-24 (seed 100–500) is unaffected. A fresh install or re-import from either file will **not** include the 600 row or these questions. If the owner later wants them in the seed, that is a sprint story that must change both files together (US-29) and amend US-24.
6. **Layout.** A 6-row board still fits 1366x768 (D-30, FU-03). No layout work is expected.

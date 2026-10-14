# BrainRush: question bank (Sprint 6, D-31)

Owner decision 2026-10-11 (D-31, US-30), **amended 2026-10-11**: each question has a point value again, and a category can have any number of questions per point value. When a new game starts, each board cell (category x point value) gets a random question from that category's questions with that point value. This file holds the 120 new questions, 20 for each seed category, exactly 4 per point value (100-500). With the 1 original seed question per value, each seed category has 5 questions per point value (25 in total). The developer copies the question, answer and points verbatim into `sql/schema.sql`, `sql/schema-hosted.sql` and `sql/migrate-question-bank.sql`.

Rules followed:
- Short seed style, readable aloud within the default 30 s timer, every question under 250 characters (FU-04).
- One clear answer. "(accept X)" is added only where another answer is also correct.
- Well-established facts that will not go out of date: no current champions, records likely to be broken, or living people's ages.
- Points are ranked by relative difficulty within the category, from 100 (easiest) to 500 (hardest), using the seed question at the same value in `sql/schema.sql` as the reference. Questions were first written at a similar, moderate level, so the step between values is modest.
- No question or answer duplicates or overlaps the 30 seed questions in `sql/schema.sql`, the 6 Egypt questions in `docs/questions-600.md`, or each other. Every answer is unique across the whole bank, and no question text gives away another question's answer.
- Plain ASCII only. Titles use double quotes; apostrophes are single quotes (the developer escapes them in SQL). No pipes, backslashes, semicolons or accented letters.

The `#` column is the question's fixed ID in this file. It is not its position: tables are sorted by points, then by `#`.

Changes:
- 2026-10-11 (Sprint 6 acceptance, OBS-5): Science #5 was "Which vitamin does the human body make when the skin is exposed to sunlight?". That text hinted at Science #7 ("The skin") and #16 ("The Sun"), so it was reworded. The answer is unchanged.
- 2026-10-11 (D-31 amended): Points column added. Question and answer texts are unchanged.
- 2026-10-14 (FU-15, owner decision after play): Geography #19 "capital of Brazil" moved from 500 to 400, Geography #1 "capital of Australia" from 400 to 500, and Technology #6 "bits in a byte" from 300 to 400. Technology now has 3 bank questions at 300 and 5 at 400.

## Geography

| # | Points | Question | Answer |
|---|---|---|---|
| 2 | 100 | Which is the largest ocean on Earth? | The Pacific Ocean |
| 6 | 100 | Which is the largest hot desert in the world? | The Sahara |
| 11 | 100 | Which U.S. state is made up entirely of islands? | Hawaii |
| 18 | 100 | In which mountain range is Mount Everest? | The Himalayas |
| 3 | 200 | Which country is made up mainly of the islands of Honshu, Hokkaido, Kyushu and Shikoku? | Japan |
| 13 | 200 | Reykjavik is the capital city of which island country? | Iceland |
| 17 | 200 | Which narrow strait separates Spain from Africa? | The Strait of Gibraltar |
| 20 | 200 | Which is the coldest, driest and windiest continent on Earth? | Antarctica |
| 4 | 300 | What is the capital city of Canada? | Ottawa |
| 9 | 300 | Counting Australia as a continent, which is the largest island in the world? | Greenland |
| 12 | 300 | The Rialto Bridge is a famous landmark in which Italian city? | Venice |
| 15 | 300 | Which salt lake, whose shore is the lowest point on land on Earth, lets swimmers float with ease? | The Dead Sea |
| 7 | 400 | What is the capital city of Turkey? | Ankara |
| 14 | 400 | Which South American country takes its name from the Spanish word for "equator"? | Ecuador |
| 16 | 400 | Table Mountain overlooks which South African city? | Cape Town |
| 19 | 400 | What is the capital city of Brazil? | Brasilia |
| 1 | 500 | What is the capital city of Australia? | Canberra |
| 5 | 500 | What is the largest country in Africa by area? | Algeria |
| 8 | 500 | In which country is the ancient rock-cut city of Petra? | Jordan |
| 10 | 500 | Which river flows through the city of Baghdad? | The Tigris |

## Science

| # | Points | Question | Answer |
|---|---|---|---|
| 11 | 100 | What force keeps the Moon in orbit around the Earth? | Gravity |
| 12 | 100 | Which planet is best known for its large, bright system of rings? | Saturn |
| 13 | 100 | What name is given to animals that eat only plants? | Herbivores |
| 14 | 100 | Which scientist developed the theory of relativity? | Albert Einstein |
| 3 | 200 | Which planet is the largest in our Solar System? | Jupiter |
| 8 | 200 | What is the only mammal capable of true powered flight? | The bat |
| 9 | 200 | Which blood cells carry oxygen around the body? | Red blood cells |
| 17 | 200 | Which naturalist is famous for the theory of evolution by natural selection? | Charles Darwin |
| 4 | 300 | Which part of a human cell contains most of its DNA? | The nucleus |
| 6 | 300 | Which scientist published the three laws of motion in 1687? | Isaac Newton |
| 7 | 300 | What is the largest organ of the human body? | The skin |
| 16 | 300 | Which star is closest to Earth? | The Sun |
| 5 | 400 | Which vitamin does the human body make when exposed to ultraviolet rays? | Vitamin D |
| 10 | 400 | Which chemical element has the atomic number 1? | Hydrogen |
| 15 | 400 | How many chambers does the human heart have? | Four |
| 18 | 400 | Which metal is a liquid at normal room temperature? | Mercury |
| 1 | 500 | What is the most abundant gas in Earth's atmosphere? | Nitrogen |
| 2 | 500 | How many bones are in the adult human body? | 206 |
| 19 | 500 | Which organ of the human body produces insulin? | The pancreas |
| 20 | 500 | What is the scientific study of earthquakes called? | Seismology |

## History

| # | Points | Question | Answer |
|---|---|---|---|
| 2 | 100 | Who was the first person to walk on the Moon? | Neil Armstrong |
| 14 | 100 | Which American civil rights leader gave the "I Have a Dream" speech in 1963? | Martin Luther King Jr. |
| 16 | 100 | Which South African leader was freed from prison in 1990 and elected president in 1994? | Nelson Mandela |
| 18 | 100 | Which English king had six wives? | Henry VIII |
| 3 | 200 | Which French emperor was defeated at the Battle of Waterloo in 1815? | Napoleon Bonaparte |
| 5 | 200 | Who was the British Prime Minister for most of World War II? | Winston Churchill |
| 10 | 200 | Which ship carried the Pilgrims from England to North America in 1620? | The Mayflower |
| 17 | 200 | Which Roman city was buried by the eruption of Mount Vesuvius in AD 79? | Pompeii (accept Herculaneum) |
| 4 | 300 | In which year did Christopher Columbus first reach the Americas? | 1492 |
| 7 | 300 | Which queen ruled the United Kingdom from 1837 to 1901? | Queen Victoria |
| 9 | 300 | In which US city was President John F. Kennedy assassinated in 1963? | Dallas |
| 12 | 300 | Genghis Khan founded which empire? | The Mongol Empire |
| 1 | 400 | In which year did the Titanic sink on its first voyage? | 1912 |
| 8 | 400 | Who was the main author of the US Declaration of Independence? | Thomas Jefferson |
| 11 | 400 | Who was the first woman to win a Nobel Prize? | Marie Curie |
| 13 | 400 | In which year did World War I begin? | 1914 |
| 6 | 500 | Which defensive wall did the Romans begin building across northern England in AD 122? | Hadrian's Wall |
| 15 | 500 | What was the name of the first artificial satellite, launched by the Soviet Union in 1957? | Sputnik 1 (accept Sputnik) |
| 19 | 500 | In which year was the Magna Carta sealed by King John? | 1215 |
| 20 | 500 | Who was the first emperor of Rome? | Augustus (accept Octavian) |

## Sports

| # | Points | Question | Answer |
|---|---|---|---|
| 1 | 100 | In which sport do players try to score a strike by knocking down all ten pins with one ball? | Ten-pin bowling (accept bowling) |
| 2 | 100 | How many rings are on the Olympic flag? | Five |
| 10 | 100 | How many minutes does a standard football (soccer) match last, not counting stoppage time? | 90 |
| 19 | 100 | In baseball, what is it called when a batter hits the ball over the outfield fence in fair territory? | A home run |
| 6 | 200 | How many holes are played in a standard round of golf? | 18 |
| 8 | 200 | In which sport do teams form a scrum and score a try? | Rugby |
| 15 | 200 | How many events make up an Olympic decathlon? | 10 |
| 20 | 200 | Which boxer, born Cassius Clay, called himself "The Greatest"? | Muhammad Ali |
| 3 | 300 | In which city were the first modern Olympic Games held, in 1896? | Athens |
| 4 | 300 | The Stanley Cup is the championship trophy in which sport? | Ice hockey |
| 9 | 300 | What colour is the jersey worn by the overall leader of the Tour de France? | Yellow |
| 11 | 300 | In which sport do competitors use a foil, an epee or a sabre? | Fencing |
| 13 | 400 | In which athletics event do competitors throw a heavy metal ball from the shoulder? | The shot put |
| 16 | 400 | Which martial art's name means "empty hand"? | Karate |
| 17 | 400 | The "Fosbury Flop" is a technique used in which athletics event? | The high jump |
| 18 | 400 | How long is an Olympic swimming pool, in metres? | 50 metres |
| 5 | 500 | What is the highest score possible with a single dart? | 60 (treble 20) |
| 7 | 500 | How long is a marathon, to the nearest whole kilometre? | 42 km (exactly 42.195 km, accept 26.2 miles) |
| 12 | 500 | In snooker, how many points is the black ball worth? | 7 |
| 14 | 500 | The America's Cup is a famous trophy in which sport? | Sailing (accept yacht racing) |

## Movies

| # | Points | Question | Answer |
|---|---|---|---|
| 2 | 100 | Which Disney animated film features a lion cub named Simba? | The Lion King |
| 7 | 100 | What is the name of the cowboy toy in "Toy Story"? | Woody |
| 17 | 100 | What is the name of the green ogre who stars in a 2001 DreamWorks animated film? | Shrek |
| 19 | 100 | Which DC Comics superhero is also known as the Dark Knight? | Batman |
| 8 | 200 | In the Harry Potter films, which school house is Harry sorted into? | Gryffindor |
| 10 | 200 | What is the name of the talking snowman in Disney's "Frozen"? | Olaf |
| 14 | 200 | Which fictional British secret agent has the code number 007? | James Bond |
| 16 | 200 | Which 1994 film features the line "My mama always said life was like a box of chocolates"? | Forrest Gump |
| 1 | 300 | In "The Wizard of Oz" (1939), what is the name of Dorothy's dog? | Toto |
| 9 | 300 | Which 1975 film is about a great white shark attacking swimmers at the beach town of Amity Island? | Jaws |
| 12 | 300 | Which actor played Captain Jack Sparrow in "Pirates of the Caribbean"? | Johnny Depp |
| 20 | 300 | Which Pixar film follows a lonely trash-compacting robot left on a deserted Earth? | WALL-E |
| 3 | 400 | What is the name of the hidden African nation that is home to Black Panther? | Wakanda |
| 4 | 400 | Who directed "Pulp Fiction" (1994)? | Quentin Tarantino |
| 5 | 400 | In "Star Wars", what is the name of Han Solo's ship? | The Millennium Falcon |
| 11 | 400 | In "Back to the Future", which make of car is turned into a time machine? | A DeLorean |
| 6 | 500 | Which 1942 film features the line "Here's looking at you, kid"? | Casablanca |
| 13 | 500 | In "The Godfather", what is the family name of Don Vito? | Corleone |
| 15 | 500 | What is the name of the snowbound hotel in "The Shining" (1980)? | The Overlook Hotel |
| 18 | 500 | Which 1939 film set during the American Civil War stars Vivien Leigh as Scarlett O'Hara? | Gone with the Wind |

## Technology

| # | Points | Question | Answer |
|---|---|---|---|
| 4 | 100 | Who co-founded Microsoft with Paul Allen in 1975? | Bill Gates |
| 12 | 100 | Which company created the PlayStation games console? | Sony |
| 13 | 100 | What is the common name for unwanted bulk email, also the name of a canned meat? | Spam |
| 14 | 100 | Larry Page and Sergey Brin founded which company in 1998? | Google |
| 2 | 200 | What does "GPS" stand for? | Global Positioning System |
| 7 | 200 | Who was granted the first US patent for the telephone, in 1876? | Alexander Graham Bell |
| 8 | 200 | Which brothers made the first powered, controlled airplane flight in 1903? | The Wright brothers (Orville and Wilbur) |
| 15 | 200 | Which company created the Game Boy and the Super Mario games? | Nintendo |
| 1 | 300 | In computing, what does "RAM" stand for? | Random Access Memory |
| 3 | 300 | What does "PDF" stand for? | Portable Document Format |
| 10 | 300 | Which popular programming language was named after a British comedy group, not a snake? | Python |
| 6 | 400 | How many bits make up one byte? | 8 |
| 9 | 400 | Which British mathematician proposed a famous test of machine intelligence in 1950? | Alan Turing |
| 11 | 400 | Which German inventor introduced movable-type printing to Europe around 1440? | Johannes Gutenberg |
| 16 | 400 | Which computer input device did Douglas Engelbart invent in the 1960s? | The mouse |
| 19 | 400 | Which Scottish inventor's improvements to the steam engine helped power the Industrial Revolution? | James Watt |
| 5 | 500 | Who is often called the first computer programmer, for her notes on Charles Babbage's Analytical Engine? | Ada Lovelace |
| 17 | 500 | Which Italian inventor sent the first radio signal across the Atlantic Ocean in 1901? | Guglielmo Marconi |
| 18 | 500 | How is the decimal number 5 written in binary? | 101 |
| 20 | 500 | Which tiny electronic switch, invented in 1947, replaced the vacuum tube and is the basic building block of computer chips? | The transistor |

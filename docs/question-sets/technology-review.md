# Review: Technology questions

- **Request:** owner request of 2026-10-21: 11 new questions for the existing "Technology" category, 5 at 500 and 6 at 600. They should match the difficulty of the existing Technology questions at those values: hard but answerable by a keen general-trivia player, not niche engineering trivia. Topics should be spread over the history of computing, the internet, phones and gadgets, gaming hardware, companies and everyday tech terms.
- **Date:** 2026-10-21
- **SQL file:** `sql/add-technology-questions.sql` (loaded into the local DB, see the end of this doc)
- **Point values (local DB):** 100, 200, 300, 400, 500, 600

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Technology (this set) | 0 | 0 | 0 | 0 | 4 | 2 | 6 |
| Technology before | 14 | 13 | 10 | 11 | 6 | 8 | 62 |
| Technology after | 14 | 13 | 10 | 11 | 10 | 10 | 68 |

**Owner removal (2026-10-21):** the set was drafted as 11. The owner removed 5 and asked for them not to be replaced: the moth "bug" (500), Bluetooth (600), ARPANET (600), the first SMS "Merry Christmas" (600) and Sega / Dreamcast (600). Don't re-add them or top the set up. The tables show only the 6 that remain. The notes on how the set was built and the duplicate check were written for the full 11.

**How the set was built**
- Difficulty was compared with the existing Technology questions in the local DB at each value:
  - 500 (6): the QWERTY typewriter, 5 in binary, Twitter, AirPods, Sora, Ray-Ban. These are famous things asked from a less obvious angle. The new 500s follow that pattern: the microwave oven, the iPod, Motorola, the "bug" and eBay.
  - 600 (8): the Aswan High Dam, the height of the Great Pyramid, the Lighthouse of Alexandria, Nilesat, the year YouTube was founded, Siri, ELIZA, Perplexity. The new 600s are classic quiz facts that a keen player knows and a casual player may not: Bluetooth, Moore's law, ARPANET, "Merry Christmas", Kodak and Sega.
- Familiarity: the owner has rejected obscure tech and AI questions before (product feature names, model trivia, minor executives). Every answer here is a household name or a well-known term. The only people named are clue-givers (Percy Spencer, Martin Cooper, Neil Papworth, George Eastman), and none of them is an answer.
- Spread over topics:

| Topic | 500 | 600 |
|---|---|---|
| History of computing | | Moore's law |
| Internet | eBay | |
| Phones | Motorola (first handheld call) | |
| Gadgets and inventions | the microwave oven, the iPod | |
| Companies | (Motorola, eBay) | Kodak |

- **Duplicate check:** checked against every question in the local DB (all 11 categories including Flags, English and Arabic text, read from the DB itself, not only from the SQL files). The export had 656 rows. Before the load, a re-check found 17 more rows (Movies, ids 1061-1085) added by another session, and these were checked too. Every `sql/*.sql` file, `docs/question-bank.md`, `docs/questions-600.md` and the review docs in `docs/question-sets/` were also checked.
  - No existing question or answer is about any of the 11 topics, in English or Arabic. Searched terms included microwave, Spencer, Raytheon, iPod, Motorola, Cooper, handheld, bug, moth, Harvard, Hopper, eBay, auction, Omidyar, Bluetooth, Harald, Viking, Moore, transistor, ARPANET, Merry Christmas, Papworth, Vodafone, Kodak, Eastman, bankrupt, Sega, Dreamcast, Sonic, and their Arabic forms (ميكروويف، آيبود، موتورولا، عثة، إيباي، مزاد، بلوتوث، قانون مور، أربانت، كوداك، سيجا).
  - No new answer is named in an existing question or answer. The only partial matches are unrelated: "laser" (Science 500 Lidar), "chips" (AI Nvidia and GPU), "Scandinavian" (Geography Sweden), "text messages" (Technology 200 SMS) and "Intel" (only inside "Apple Intelligence").
  - None of the new questions names an answer already in the bank. Examples: the iPod question does not name Apple, the Bluetooth question does not name Denmark or Norway (Flags answers), the Motorola question does not mention Bell Labs (Alexander Graham Bell is an answer), the text-message question does not name the UK, and the Kodak question gives no bankruptcy year (2012 is part of the Gen Z answer "1997 and 2012"). No question uses a year that is an answer in the bank (for example 1945, 2005, 2007).
  - No new question gives away another new answer.
- **Owner-rejected topics not reused:** the Technology seed and bank questions that are no longer in the DB were treated as removed by the owner: Tim Berners-Lee, Python, Gutenberg, James Watt, Ada Lovelace, Marconi and the transistor. So were the 2026-10-19 Technology suggestions that are named in the review docs but not in the DB (Intel 4004, ENIAC, Lenovo, Netflix, Firefox, Jeff Bezos and Amazon), and the AI and Gen Z rejects listed in `ai-2-review.md` and `genz-2-review.md` (for example Tay, Cortana, ASIMO, AlphaGo, Watson, Neuralink, Sundar Pichai).
- English text is plain ASCII with no semicolons, pipes or backslashes. Every question is under 250 characters (the longest is 168).

**Points for the owner to decide**
1. **Difficulty calls.** The iPod (500) may play closer to 400, because the slogan is a strong clue. Kodak (600) is easy for anyone who knows the name "Eastman Kodak". Each one could move by one value after play.
2. **Moore's law mentions "transistors" and "Intel".** The transistor (bank 500) and the Intel 4004 (2026-10-19 suggestion) were removed by the owner. Here they are only clues, not answers. If they were removed for being too technical, the question could say "the power of computer chips" instead, but that wording is less accurate.
3. **No gaming hardware left** after the owner removed Sega. A reserve is ready: "Which company, founded by Nolan Bushnell, released the hit arcade game Pong in 1972?" (Atari).
4. **Unknown earlier rejects.** The owner removed all 5 Technology 500 and all 5 Technology 600 suggestions on 2026-10-19, and their full texts are not kept in the repo. Topics that are named in the review docs were avoided (see above). If any of these 11 matches one of the others, remove it.
5. **Concurrent change in the local DB.** Between the duplicate-check export (656 rows) and the load, another session added 17 Movies rows (ids 1061-1085, for example Game of Thrones, Ted Lasso and Marvel). This file did not touch them. They were checked, and none overlaps with this set.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 500 | While working on radar equipment in the 1940s, engineer Percy Spencer noticed that a snack bar in his pocket had melted. Which kitchen appliance did he go on to invent? | The microwave oven (accept microwave) | أثناء عمله على أجهزة الرادار في أربعينيات القرن العشرين، لاحظ المهندس بيرسي سبنسر أن قطعة حلوى في جيبه قد ذابت. أي جهاز من أجهزة المطبخ اخترعه بعد ذلك؟ | فرن الميكروويف (يُقبل: الميكروويف) | Accept "Radarange" (the first model's name). Reject "oven" alone, toaster, electric stove, radar. |
| 500 | Which music player, launched in October 2001, was sold with the slogan "1,000 songs in your pocket"? | The iPod (accept iPod Classic) | أي مشغل موسيقى، أُطلق في أكتوبر 2001، رُوّج له بشعار "1000 أغنية في جيبك"؟ | آيبود (iPod) | Accept "Apple iPod". Reject Walkman (Sony), Zune (2006), iPhone (2007), iTunes (the software), "MP3 player" alone. |
| 500 | In 1973, engineer Martin Cooper made the first public call from a handheld mobile phone. Which company did he work for? | Motorola | في عام 1973، أجرى المهندس مارتن كوبر أول مكالمة علنية من هاتف محمول يُحمل باليد. في أي شركة كان يعمل؟ | موتورولا (Motorola) | Reject Bell Labs and AT&T (the rival he phoned), Nokia, Ericsson. "DynaTAC" is the phone, not the company: reject. |
| 500 | Which online auction website, founded in 1995 as AuctionWeb, famously sold a broken laser pointer as one of its very first items? | eBay | أي موقع للمزادات على الإنترنت، تأسس عام 1995 باسم "AuctionWeb"، اشتهر ببيع مؤشر ليزر معطل كواحدة من أولى السلع التي بيعت عليه؟ | إيباي (eBay) | Reject Amazon, Craigslist, Alibaba (an existing answer), AliExpress. |
| 600 | Which "law", named after a co-founder of Intel, says that the number of transistors on a computer chip doubles about every two years? | Moore's law | أي "قانون"، يحمل اسم أحد مؤسسي شركة إنتل، ينص على أن عدد الترانزستورات في شريحة الحاسوب يتضاعف كل عامين تقريبًا؟ | قانون مور | Accept "Gordon Moore's law" and "Moore" alone. Reject Murphy's law, Metcalfe's law, Noyce (the other Intel co-founder). |
| 600 | Which photography company, founded by George Eastman, launched the cheap Brownie camera in 1900 and later filed for bankruptcy as digital photography took over? | Kodak (accept Eastman Kodak) | أي شركة تصوير، أسسها جورج إيستمان، أطلقت كاميرا "براوني" الرخيصة عام 1900، ثم أشهرت إفلاسها لاحقًا مع انتشار التصوير الرقمي؟ | كوداك (يُقبل: إيستمان كوداك) | Reject Polaroid (which also went bankrupt, in 2001 and 2008), Fujifilm, Canon, Nikon, Agfa. |

---

## Fact-check log

Each answer, and each fact stated in its question, was checked against at least 2 independent sources. Some pages were checked through search results rather than fetched pages, and in each case a second source was checked separately.

| Points | Answer | Sources |
|---|---|---|
| 500 | The microwave oven | [National Inventors Hall of Fame: Who invented the microwave?](https://www.invent.org/blog/inventors/microwave) (Spencer, working near a magnetron at Raytheon, noticed a candy bar in his pocket had begun to melt, credited with the microwave oven, patent filed 1945), [History.com: Who invented the microwave oven?](https://www.history.com/articles/microwave-oven-invention), [Atomic Heritage Foundation: Percy Spencer](https://ahf.nuclearmuseum.org/ahf/profile/percy-spencer/) (radar magnetrons, "the 1940s") |
| 500 | The iPod | [Apple Newsroom, 23 October 2001: Apple Presents iPod](https://www.apple.com/newsroom/2001/10/23Apple-Presents-iPod/) (press release headline "Puts 1,000 Songs in Your Pocket"), [NPR: 20 years ago, the iPod was born](https://www.npr.org/2021/10/23/1048706632/20-years-ago-the-ipod-was-born), [Wikipedia: iPod](https://en.wikipedia.org/wiki/IPod) (slogan "1,000 songs in your pocket") |
| 500 | Motorola | [ABC7: first cell phone call made 50 years ago by Motorola engineer Martin Cooper](https://abc7.com/post/martin-cooper-first-cell-phone-call-motorola-april-3/13077296/) (3 April 1973), [EBSCO Research Starters: First cellular phone call](https://www.ebsco.com/research-starters/history/first-cellular-phone-call/), [AARP: The first cell phone call](https://www.aarp.org/events-history/first-cell-phone-call/), [Wikipedia: Martin Cooper](https://en.wikipedia.org/wiki/Martin_Cooper_(inventor)) (first public call from a handheld portable phone) |
| 500 | eBay | [eBay Inc.: Our history](https://www.ebayinc.com/company/our-history/) (Omidyar launched AuctionWeb in 1995, the first item he listed was a broken laser pointer), [Wikipedia: eBay](https://en.wikipedia.org/wiki/EBay) (founded 3 September 1995, renamed eBay in 1997), [XDA Developers: On this day in 1995, eBay launched](https://www.xda-developers.com/on-this-day-ebay/) |
| 600 | Moore's law | [Britannica: Moore's law](https://www.britannica.com/technology/Moores-law) (1965 prediction of yearly doubling, revised in 1975 to every two years), [Britannica: Gordon Moore](https://www.britannica.com/biography/Gordon-Moore) (co-founded Intel with Robert Noyce), [Computer History Museum: Moore's law](https://www.computerhistory.org/revolution/digital-logic/12/267), [Nature: Gordon Moore (1929-2023)](https://www.nature.com/articles/d41586-023-01978-y) |
| 600 | Kodak | [Britannica: Eastman Kodak Company](https://www.britannica.com/money/Eastman-Kodak-Company) (founded by George Eastman, Brownie camera, Chapter 11 in 2012 amid digital-era competition), [CNN Money: Eastman Kodak files for Chapter 11, 19 January 2012](https://money.cnn.com/2012/01/19/news/companies/kodak_bankruptcy/index.htm), [CBC: The rise and fall of Kodak](https://www.cbc.ca/news/world/the-rise-and-fall-of-kodak-1.1291452) (Brownie released in 1900), [EBSCO Research Starters: Kodak introduces Brownie cameras](https://www.ebsco.com/research-starters/history/kodak-introduces-brownie-cameras/) (February 1900) |

### Dropped or reworded during fact-checking

- **Microwave oven:** sources give 1945 or 1946 for the melted bar, and 1945 is a History answer, so the question says "in the 1940s". Sources say the bar was chocolate, a peanut bar or a peanut cluster, so the question says "a snack bar".
- **Motorola:** "first call from a mobile phone" became "first public call from a handheld mobile phone", which is the wording used by most sources (car phones existed earlier). Bell Labs, the rival he called, is not named.
- **eBay:** eBay says the laser pointer was the first item Omidyar listed. Other sources call it the first sale. The question says "one of its very first items".
- **Moore's law:** Moore first predicted a yearly doubling in 1965, before he co-founded Intel in 1968, and revised it to every two years in 1975. The question gives the better-known two-year form and says "named after a co-founder of Intel", not "made by Intel".
- **Kodak:** sources give 1880, 1881 or 1888 as the founding year, so no year is given. The bankruptcy year (2012) is also left out (see the duplicate check).
- **Considered and not used:**
  - Microsoft and the Xbox: Microsoft is named in 4 existing questions (Bill Gates, Bing, Copilot, Clippy).
  - Deep Blue: named in the History 100 chess question.
  - Steve Wozniak and the Apple garage: the question would need to name Apple, an existing answer.
  - Amazon and the Kindle: "The Amazon" is a Geography answer. Samsung: named in the Bixby question.
  - The Nintendo Wii and the Snake game: Nintendo and Nokia are existing answers, and the Wii clues (bowling, tennis) are Sports answers.
  - Ray Tomlinson and the first email: whether it was the "first" email is disputed. "What Wi-Fi stands for" is also disputed. The Pac-Man pizza story was played down by its own creator.
  - Kept in reserve: Atari (Pong, 1972), Myspace (everyone's first friend, Tom), what "QR" stands for (Quick Response), Linux (Tux the penguin), what "SIM" stands for.

### Process notes

- **Local DB load:** MariaDB was already running.
  - Export for the duplicate check: 656 questions. Just before the load there were 673, because another session had added 17 Movies rows (ids 1061-1085). They were checked and don't clash with this set.
  - Before: 673 questions, Technology 14 / 13 / 10 / 11 / 6 / 8 (62).
  - Run 1 added all 11 rows (ids 1094-1104): 684 questions, Technology 14 / 13 / 10 / 11 / 11 / 14 (73). Technology 500 rose by 5 and 600 by 6, the same as the number of rows in the file.
  - Run 2 added nothing (idempotent): still 684 questions and 73 in Technology.
  - Owner removal: the 5 removed questions (ids 1097, 1099, 1101, 1102, 1104) were deleted from the local DB (684 -> 679) and from this file and the SQL file. Technology is now 14 / 13 / 10 / 11 / 10 / 10 (68). Running the trimmed SQL file again added nothing.
  - No row was skipped. The English text is pure ASCII with no semicolons, pipes or backslashes. The Arabic text was stored correctly (utf8mb4, checked on all 11 rows), and every row has `image = ''`.
- **Prompt injection:** no retrieved page contained instructions aimed at the assistant.

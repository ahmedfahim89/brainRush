# Review: Sports 500 questions

- **Request:** owner request of 2026-10-20: exactly 3 new questions for the existing "Sports" category, all at 500. Familiarity comes first: famous sports, events and stars that most players recognise at once, favouring what is popular in the Arab region. A 500 is harder because it asks a less obvious fact about something famous, not because the subject is obscure.
- **Date:** 2026-10-20
- **SQL file:** `sql/add-sports-500-questions.sql` (loaded into the local DB, see the end of this doc)
- **Point values (local DB):** 100, 200, 300, 400, 500, 600

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
> **Owner review (2026-10-20). Do not reuse this answer.** The owner removed the Jesse Owens (Berlin 1936) question without replacement. The set is now 2.

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Sports (this set) | 0 | 0 | 0 | 0 | 2 | 0 | 2 |
| Sports before | 12 | 11 | 10 | 10 | 8 | 9 | 60 |
| Sports after | 12 | 11 | 10 | 10 | 10 | 9 | 62 |

**How the set was built**
- Difficulty was compared with the 8 existing Sports 500 questions in the local DB: tennis "love", marathon 42 km, AFCON 1957, Ajax, Kipchoge, League of Legends, Dota 2 and Gran Turismo. Each new question names a world-famous player or event in the question itself, and the challenge is one less obvious fact about it.
- One question per sub-topic:

| Points | Football / World Cup | Tennis | Olympics |
|---|---|---|---|
| 500 | Maradona, "Hand of God" (England) | Djokovic, tenth Australian Open | (Jesse Owens, removed by the owner) |

- **Duplicate check:** checked against all 592 questions in the local DB (all 10 categories, English and Arabic text), every `sql/*.sql` file and the review docs in `docs/question-sets/`.
  - No question or answer in the bank is about Maradona, the Hand of God, Djokovic, the Australian Open, Jesse Owens or the 1936 Olympics.
  - England, Novak Djokovic and Jesse Owens are not answers anywhere in the bank.
  - The questions don't name existing answers. Many top stars are already answers (Salah, Messi, Ronaldo, Muhammad Ali, Pele, Federer, Jordan, Bolt, Zidane, Schumacher), so none of them is named. The Owens question doesn't say "American" (The United States is a Geography 100 answer) or name Hitler (a History 100 answer). The Djokovic question doesn't say "tennis" (a Sports 100 answer).
  - One shared word remains. "Australian Open" contains "Australia", the answer to Geography 500 ("Black Summer" bushfires). It doesn't help with that question, which is about bushfires, and the tournament can't be named without it.
- **Topics avoided because the owner rejected them before:** the Rumble in the Jungle (removed in the 2026-10-19 owner review of the general set), and Nadal / the French Open, since a Roland Garros question appears to have been removed in the same review. London as the first city to host three Summer Olympics was also dropped, because London is already the Geography 200 answer (2012 Olympics).
- English text is plain ASCII with no semicolons. Every question is under 250 characters (the longest is 100).

**Points for the owner to decide**
1. **Jesse Owens:** removed by the owner on 2026-10-20, no replacement.
2. **The Maradona question may play like a 400 for football fans.** Most Egyptian fans know the Hand of God goal was against England. Players who know the goal but not the match will guess Brazil, Germany or Italy.
3. **Removed suggestions from 2026-10-19 aren't kept in the repo.** The owner removed 54 Sports, Movies and Technology suggestions from the general set, and only two of the removed topics are known (above). If Maradona, Djokovic or Owens was among them, remove that question.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 500 | At the 1986 World Cup, against which country did Diego Maradona score his famous "Hand of God" goal? | England (accept the England national team) | في كأس العالم 1986، في مرمى أي منتخب سجّل دييغو مارادونا هدفه الشهير "يد الله"؟ | إنجلترا (يُقبل: منتخب إنجلترا) | It was the quarter-final, Argentina 2-1 England. Reject West Germany (the final), Belgium (the semi-final) and Brazil. "Britain" or "the UK" is not the team: host's call, default reject. |
| 500 | Which player won his tenth Australian Open men's singles title in 2023? | Novak Djokovic (accept Djokovic) | أي لاعب فاز بلقبه العاشر في فردي الرجال ببطولة أستراليا المفتوحة عام 2023؟ | نوفاك ديوكوفيتش (يُقبل: جوكوفيتش) | Accept any pronunciation of Djokovic (Jokovic, Djokovitch). Reject Stefanos Tsitsipas (the 2023 runner-up), Rafael Nadal (2 Australian Open titles), Roger Federer (6) and Jannik Sinner. |
---

## Fact-check log

Each answer, and each fact stated in its question, was checked against at least 2 independent sources.

| Points | Answer | Sources |
|---|---|---|
| 500 | England | [ESPN: World Cup moments, the Hand of God](https://africa.espn.com/espn/story/_/id/23391785/world-cup-moments-hand-god) (Argentina's quarter-final against England at the 1986 World Cup), [UEFA.com: 30 years on, Maradona's Hand of God](https://www.uefa.com/uefaeuro/history/news/0253-0d818e7ae229-235c7915f403-1000--30-years-on-maradona-s-hand-of-god) (1986 World Cup quarter-final against England in Mexico City), [Wikipedia: Argentina v England (1986 FIFA World Cup)](https://en.wikipedia.org/wiki/Argentina_v_England_(1986_FIFA_World_Cup)) (22 June 1986, Estadio Azteca, Argentina 2-1, Hand of God goal in the 51st minute past Peter Shilton), also in the search results: [FIFA](https://www.fifa.com/en/tournaments/mens/worldcup/articles/diego-maradona-argentina-england) and [Britannica](https://www.britannica.com/sports/Famous-FIFA-World-Cup-Goals-Hand-of-God) (these pages could not be opened) |
| 500 | Novak Djokovic | [ATP Tour](https://www.atptour.com/en/news/tsitsipas-djokovic-australian-open-2023-sunday-final) (10th Australian Open title on 29 January 2023, beat Tsitsipas 6-3 7-6(4) 7-6(5)), [ABC News (Australia)](https://www.abc.net.au/news/2023-01-29/live-updates-australian-open-men-final-djokovic-tsitsipas/101904984) (10th Australian Open men's singles title, same score), also in the search results: [CNN](https://www.cnn.com/2023/01/29/tennis/novak-djokovic-stefanos-tsitsipas-australian-open-final-spt-intl/index.html), [Al Jazeera](https://www.aljazeera.com/sports/2023/1/29/novak-djokovic-dominates-tsitsipas-to-win-10th-australian-open) and [CBS Sports](https://www.cbssports.com/tennis/news/australian-open-2023-novak-djokovic-tops-stefanos-tsitsipas-for-22nd-grand-slam-title-tying-nadals-record/) |
### Dropped or reworded during fact-checking

- **Djokovic:** "tenth ... in 2023" is fixed in time, so the question stays true even if he wins again. "Tennis" was removed from the wording because it is a Sports 100 answer.
- **Considered and not used:**
  - Rumble in the Jungle (Zaire): the owner removed it on 2026-10-19.
  - Nadal / French Open: likely overlaps the Roland Garros question removed on 2026-10-19.
  - London, the first city to host three Summer Olympics: London is already an answer (Geography 200).
  - Any question naming Mohamed Salah (such as signed from Roma, or Basel): it would give away the Sports 100 "Egyptian King" answer.
  - Morocco, the first African semi-finalist in 2022: too easy for 500 with Arab players.
  - Brazil (7-1 in 2014, five World Cups): the Pele question already says "Brazilian".
  - Spain (2010 World Cup): the Strait of Gibraltar question names Spain.
  - Miroslav Klose (World Cup top scorer): a record that can still be broken.

### Process notes

- **Local DB load:** MariaDB was already running.
  - Before: 592 questions, Sports 12 / 11 / 10 / 10 / 8 / 9 (60).
  - Run 1 added 3 rows (ids 974-976): 595 questions, Sports 500 = 11, Sports total 63.
  - Run 2 added nothing (idempotent): still 595 and 63. No row was skipped. The English text is pure ASCII, and the Arabic text was stored correctly (utf8mb4).
  - Owner removal: the Jesse Owens row was deleted by exact question text in Sports: 594 questions, Sports 500 = 10, Sports total 62. A rerun of the updated file added nothing.
- **Prompt injection:** no retrieved page contained instructions aimed at the assistant.

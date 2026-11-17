# Automatic batch 2026-11-17: review

## Live vs local differences

Information only (from the question-bank-manager brief):

- Sports: live 99, local 106
- Who Am I?: live 45, local 46

All other categories match.

## Reported questions

None open locally; owner to check live Admin > Reports. (`question_reports` has 1 row, already dismissed. The live database was not read.)

## Status: waiting for the owner's review

`sql/add-auto-2026-11-17-questions.sql` has **10 rows** (IDs 1117-01 to 1117-10): 9 text questions and 1 picture question (Landmarks 500, `img/questions/landmark-abraj-al-bait.jpg`). It has **not** been loaded into the local DB.

Written to the owner's preference (2026-11-11): easier, mostly subjects from 2000 onwards. Wrong options are bare answers, no brackets.

| Slot | Category | Points | In the file | Local count now | After loading |
|---|---|---|---|---|---|
| 1 | Who Am I? | 300 | 1117-01 | 7 | 8 |
| 2 | Who Am I? | 600 | 1117-02 | 7 | 8 |
| 3 | AI | 200 | 1117-03 | 8 | 9 |
| 4 | AI | 300 | 1117-04 | 8 | 9 |
| 5 | Cartoons & Childhood | 200 | 1117-05 | 8 | 9 |
| 6 | Cartoons & Childhood | 300 | 1117-06 | 8 | 9 |
| 7 | Food & Drink | 400 | 1117-07 | 8 | 9 |
| 8 | Landmarks | 500 (picture) | 1117-08 | 8 | 9 |
| 9 | Movies | 500 | 1117-09 | 8 | 9 |
| 10 | Gen Z | 600 | 1117-10 | 8 | 9 |

Count per point value: 200 = 2, 300 = 3, 400 = 1, 500 = 2, 600 = 2. Local DB total: 980 before, 990 after loading.

## Questions

| ID | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| 1117-01 | Who Am I? 300 | I am an American pop star. My 2008 hits "Just Dance" and "Poker Face" made me famous, and in 2019 I won an Oscar for the song "Shallow" from "A Star Is Born", in which I starred with Bradley Cooper. Who am I? | Lady Gaga (accept Gaga, Stefani Germanotta) | أنا نجمة بوب أمريكية. اشتهرت بأغنيتيّ "جاست دانس" (Just Dance) و"بوكر فيس" (Poker Face) عام 2008، وفي عام 2019 فزت بجائزة الأوسكار عن أغنية "شالو" (Shallow) من فيلم "ولادة نجمة" (A Star Is Born) الذي شاركت في بطولته مع برادلي كوبر. من أنا؟ | ليدي غاغا (يُقبل: غاغا، ستيفاني جيرمانوتا) | Katy Perry / كاتي بيري; Beyonce / بيونسيه | Reject Bradley Cooper (her co-star, named in the question) and Madonna. |
| 1117-02 | Who Am I? 600 | I was an American comic-book creator. I co-created Spider-Man and the X-Men for Marvel Comics in the 1960s, and until my death in 2018 I made short cameo appearances in many Marvel films, such as "Iron Man" (2008). Who am I? | Stan Lee | كنت مبتكرًا أمريكيًا للقصص المصورة. شاركت في ابتكار "سبايدر مان" و"إكس من" (X-Men) لدار مارفل للقصص المصورة في ستينيات القرن العشرين، وحتى وفاتي عام 2018 كنت أظهر ظهورًا قصيرًا كضيف شرف في كثير من أفلام مارفل، مثل "آيرون مان" (Iron Man) عام 2008. من أنا؟ | ستان لي | Jack Kirby / جاك كيربي; Steve Ditko / ستيف ديتكو | Reject Kirby and Ditko (his co-creators) and Kevin Feige (Marvel Studios boss, no cameos). "Lee" alone: accept. |
| 1117-03 | AI 200 | To show that a picture was made by AI, many AI image makers add a hidden or visible mark to it, a bit like the logo printed across stock photos. What is this kind of mark called? | A watermark (accept digital watermark, AI watermark) | لإظهار أن الصورة صُنعت بالذكاء الاصطناعي، تضيف كثير من أدوات صنع الصور بالذكاء الاصطناعي علامة مخفية أو ظاهرة عليها، تشبه الشعار المطبوع على الصور التي تبيعها مواقع الصور. ماذا تُسمّى هذه العلامة؟ | علامة مائية (يُقبل: علامة مائية رقمية) | A barcode / باركود; A QR code / رمز QR | "A label" or "a tag": host's call, lean to reject (the question asks for the mark's name). Reject "a logo" (used in the question as the comparison). |
| 1117-04 | AI 300 | What is the name for an AI that does not just chat with you but carries out tasks for you on its own, such as filling in forms or booking a flight? | An AI agent (accept agent, agentic AI) | ما اسم الذكاء الاصطناعي الذي لا يكتفي بالدردشة معك، بل ينفّذ المهام نيابةً عنك من تلقاء نفسه، مثل ملء النماذج أو حجز رحلة طيران؟ | وكيل ذكاء اصطناعي (يُقبل: وكيل، الذكاء الاصطناعي الوكيل) | A chatbot / روبوت دردشة; A search engine / محرك بحث | Reject "a chatbot" (the question says it does more than chat) and "an assistant" alone. "Autonomous agent": accept. |
| 1117-05 | Cartoons 200 | Which children's song by the Korean brand Pinkfong, with its catchy "doo doo doo doo doo doo" chorus, became the first YouTube video to reach 10 billion views, in January 2022? | Baby Shark (accept Baby Shark Dance) | ما أغنية الأطفال من إنتاج العلامة الكورية "بينكفونغ" (Pinkfong)، ذات اللازمة الشهيرة "دو دو دو دو دو دو"، التي أصبحت أول فيديو على يوتيوب يصل إلى 10 مليارات مشاهدة في يناير 2022؟ | بيبي شارك (يُقبل: Baby Shark Dance) | The Wheels on the Bus / عجلات الحافلة; Johny Johny Yes Papa / جوني جوني يس بابا | Reject "Gangnam Style" (the first video to 1 billion, a Gen Z answer) and "Despacito". |
| 1117-06 | Cartoons 300 | In the Pixar film "The Incredibles" (2004), what is the name of the family's son whose superpower is running at super speed? | Dash (accept Dash Parr, Dashiell) | في فيلم بيكسار "الخارقون" (The Incredibles) عام 2004، ما اسم ابن العائلة الذي قوته الخارقة هي الجري بسرعة فائقة؟ | داش (يُقبل: داش بار) | Jack-Jack / جاك جاك; Bolt / بولت | Reject Jack-Jack (the baby brother) and Violet (the daughter). Accept the Arabic-dub name if a player gives it and the host knows it. |
| 1117-07 | Food & Drink 400 | Which coffee chain, founded at Pike Place Market in Seattle in 1971, has a green logo showing a twin-tailed mermaid, or siren? | Starbucks | ما سلسلة المقاهي التي تأسست في سوق "بايك بليس" بمدينة سياتل عام 1971، ويُظهر شعارها الأخضر حورية بحر بذيلين؟ | ستاربكس | Costa Coffee / كوستا كوفي; Tim Hortons / تيم هورتنز | Reject Costa and Seattle's Best Coffee. |
| 1117-08 | Landmarks 500 (picture) | Which landmark is this? (picture: `img/questions/landmark-abraj-al-bait.jpg`) | Abraj Al Bait (accept the Makkah Royal Clock Tower, the Mecca Clock Tower, the Clock Towers) | ما هذا المعلم؟ | أبراج البيت (يُقبل: برج الساعة، برج ساعة مكة الملكي) | Kingdom Centre / برج المملكة; Al Faisaliah Tower / برج الفيصلية | "Zamzam Tower" (one of the complex's hotel towers): accept. Reject "the Kaaba", "the Grand Mosque" / "Masjid al-Haram" (next to it, not shown) and Big Ben. |
| 1117-09 | Movies 500 | Which actor played the vampire Edward Cullen in the "Twilight" films, starting in 2008? | Robert Pattinson (accept Pattinson) | من الممثل الذي أدى دور مصاص الدماء إدوارد كولين في أفلام "الشفق" (Twilight) بدءًا من عام 2008؟ | روبرت باتينسون (يُقبل: باتينسون) | Taylor Lautner / تايلور لوتنر; Zac Efron / زاك إيفرون | Reject Taylor Lautner (Jacob, the werewolf). |
| 1117-10 | Gen Z 600 | Which photo app, Apple's iPhone App of the Year in 2022, alerts its users at a random moment each day and gives them two minutes to post a photo taken with both the front and back cameras? | BeReal (accept Be Real) | ما تطبيق الصور، الذي اختارته آبل تطبيق العام للآيفون في 2022، وينبّه مستخدميه في لحظة عشوائية كل يوم ويمنحهم دقيقتين لنشر صورة ملتقطة بالكاميرتين الأمامية والخلفية معًا؟ | بي ريل (BeReal) | Lemon8 / ليمون8; Locket / لوكيت | Reject Snapchat and Instagram (Instagram copied the dual-camera idea as "Dual" in 2022). |

## Difficulty and era

| ID | Era of the subject | Why it is easy enough |
|---|---|---|
| 1117-01 | "Poker Face" 2008, Oscar 2019 | One of the biggest pop stars since 2008. "Poker Face" and "Shallow" with Bradley Cooper make her very gettable. On a par with Robert Downey Jr. and Serena Williams at 300. |
| 1117-02 | Comics from the 1960s, film cameos 2000 to 2019, died 2018 | Known to anyone who has watched the Marvel films, where his cameos were a running joke. Harder than 300 because it needs the creator's name, not the star's, but a notch easier than ElBaradei, Hassan Fathy or Huda Shaarawi at 600. |
| 1117-03 | AI image watermarks, 2023 onwards (Google SynthID, OpenAI, Meta) | Everyone knows watermarks from stock photos and TikTok videos, and the question explains the idea. On a par with "a prompt" and "fingers" at 200. |
| 1117-04 | AI agents, 2024 to 2025 buzzword | The question describes it plainly, and "agent" is a common word. Same kind of concept as "a hallucination" at 300, a notch easier than "jailbreak" or "generative AI" above it. |
| 1117-05 | Song 2016, 10 billion views in January 2022 | Every parent and older sibling knows "Baby Shark", and the "doo doo" chorus nearly gives it away. On a par with Masha and the Bear and Sonic at 200. |
| 1117-06 | 2004 film, sequel 2018 | Hugely popular Pixar film, dubbed in Arabic. Needs the name, like Merida or the Minions at 300, but "Dash" fits his power. |
| 1117-07 | Founded 1971, global chain today (in Egypt and the Gulf since the 2000s) | A classic still very widely known today. The green mermaid logo is seen in every mall. Easier than cardamom or fesikh at 400, on a par with the Nutella hazelnut question. |
| 1117-08 | Completed 2012 | Instantly recognised by many Egyptian and Arab players from Umrah and Hajj photos and TV coverage. Easier than Montaza Palace or the Hungarian Parliament at 500, on a par with Kingdom Centre and the Museum of the Future. |
| 1117-09 | "Twilight" 2008 to 2012 | Huge teen franchise of the late 2000s. Same style as the Henry Cavill question at 500. |
| 1117-10 | Viral in 2022 | A Gen Z app that everyone at school or university used in 2022. On a par with Vibe coding, IYKYK and the Harlem Shake at 600. |

## Fact-check log (2+ sources each, web search 2026-11-17)

- **1117-01 Lady Gaga:** "Shallow" (from "A Star Is Born", with Bradley Cooper) won Best Original Song at the 91st Academy Awards, February 2019: The Hollywood Reporter, ABC News, ET Online. Debut album "The Fame" (August 2008) with the singles "Just Dance" and "Poker Face" (September 2008): Grammy.com (2010 Best Dance Recording for "Poker Face", Best Dance/Electronic Album for "The Fame"), Wikipedia ("The Fame", "Poker Face"). Birth name Stefani Germanotta: Grammy.com artist page and Wikipedia.
- **1117-02 Stan Lee:** Britannica (co-created Spider-Man with Steve Ditko and the X-Men with Jack Kirby in 1963; often featured in cameo roles in the Marvel films, including after Disney's purchase of Marvel), Publishers Weekly and Irish Times obituaries (died 12 November 2018, aged 95; "king of the cameo"), BFI obituary. "Iron Man" (2008) cameo: Britannica lists Iron Man among the films with his cameos. The X-Men co-creation year is left out of the question to keep it short.
- **1117-03 Watermark:** Google DeepMind's SynthID adds an invisible watermark to AI-generated images (Engadget, Popular Science, 2023). OpenAI added C2PA metadata and a visible "CR" mark to DALL-E 3 images (PetaPixel and Neowin, February 2024). Meta adds visible "Imagined with AI" labels plus invisible watermarks to images made with Meta AI (The Decoder, February 2024). Company names are left out of the question so they do not hint at other answers (Google, OpenAI).
- **1117-04 AI agent:** IBM Think ("What are AI agents?": a system that autonomously performs tasks by designing workflows with available tools), Built In ("What Are AI Agents?": chatbots can plan a trip, agents can book the flights), Singularity Hub (January 2025, computer scientist's explainer).
- **1117-05 Baby Shark:** Pinkfong's "Baby Shark Dance" became the first YouTube video to pass 10 billion views on 13 January 2022: NBC News, Manila Bulletin, KED Global (Korea Economic Daily), Guinness World Records recognition reported by ABS-CBN. Uploaded June 2016. "First to 10 billion" is a historical first and will not change.
- **1117-06 Dash:** Dash (Dashiell Robert Parr), the super-speed son of Bob and Helen Parr in "The Incredibles" (2004) and "Incredibles 2" (2018): TCM film database, Washington Times review (October 2004), Wikipedia ("Dash Parr"). Voiced by Spencer Fox in 2004.
- **1117-07 Starbucks:** First store opened 30 March 1971 at Pike Place Market, Seattle: Starbucks "About us" (about.starbucks.com), HISTORY.com "This Day in History". Logo is a twin-tailed siren found in old marine books by designer Terry Heckler: Starbucks "The story of the Siren" (about.starbucks.com), Creative Bloq ("The Starbucks logo: a history"). **Reworded during fact-checking:** the first draft said the chain was named after Starbuck, the first mate in "Moby-Dick". Co-founder Gordon Bowker has said the link was partly a coincidence (vinepair.com, culinarylore.com), so that clue was replaced by the founding place and year.
- **1117-08 Abraj Al Bait:** Britannica ("Abraj al-Bayt", also called the Makkah Royal Clock Tower, skyscraper complex next to the Great Mosque of Mecca), Guinness World Records (largest clock face, about 43 m across, 2011), designboom. Completed 2012 (Wikipedia, "Abraj Al Bait"). Records and heights are left out of the question (picture question), so nothing can go out of date.
- **1117-09 Robert Pattinson:** Britannica (rose to stardom as Edward Cullen in "Twilight", 2008, the first film of Stephenie Meyer's series), Tufts Daily interview (November 2008), Wikipedia ("Twilight (2008 film)"). Earlier he played Cedric Diggory in "Harry Potter and the Goblet of Fire" (2005). The question does not name his later role as Batman, because "Batman" is a Movies 100 answer.
- **1117-10 BeReal:** Apple Newsroom, "App Store Awards celebrate the best apps and games of 2022" (iPhone App of the Year: BeReal), Engadget (2022 App Store Awards). Daily notification at a random time and a two-minute window to post front and back camera photos: PetaPixel ("How to Use BeReal"), The Hustle (April 2022), App Store listing. The launch year (2019 or 2020, sources differ) is left out of the question.

## Image sources and licences

| File | Answer | Source page | Author | Licence | Notes |
|---|---|---|---|---|---|
| `img/questions/landmark-abraj-al-bait.jpg` | Abraj Al Bait (1117-08) | https://commons.wikimedia.org/wiki/File:Abraj_Al_Bait_Tower_2017.jpg | King Eliot (own work) | CC BY-SA 4.0 | Photo taken 22 December 2017, overcast sky. Downloaded the current revision's 960 px Commons thumbnail (960 x 1279, original 2213 x 2949) into a new empty temp directory, confirmed a real JPEG, re-encoded with PHP GD at JPG quality 72, 214 KB, 960 x 1279 (1279 px on the long side). Viewed after re-encoding: the whole clock tower from the crescent on the spire down to the podium, with the surrounding hotel towers. Nothing cropped. No people visible. A few tents, street lamps and floodlights at the bottom. No other famous landmark in the frame (the Grand Mosque and the Kaaba are not visible). The file page carries `{{FoP-Saudi Arabia}}`. Saudi Arabia has freedom of panorama for buildings (as noted for Kingdom Centre in earlier batches). The page was nominated for deletion in October 2021, but the file was kept and has no open deletion request today. `image_credit` = "King Eliot / CC BY-SA 4.0". |

The file name is new. Nothing existing was replaced.

**Look-alike check:** No existing Landmarks answer looks like it. The nearest are Big Ben (a clock tower, but a slim Gothic stone tower, Landmarks 100), the Burj Khalifa (a needle-shaped glass tower, Landmarks 100) and Kingdom Centre (a tower with an arched opening, Landmarks 500). The wrong options Kingdom Centre and Al Faisaliah Tower are other Saudi skyscrapers, not other names for the Clock Towers. Other candidates in the same Commons search were not used: "Makkah Royal Clock Tower in 2012" (good, but pilgrims along the bottom edge), "Makkah Clock Tower (Day)" and "Clock Tower Makkah in morning" (identifiable people in the foreground). The Sheikh Zayed Grand Mosque was considered but not used because Commons lists the UAE as having no freedom of panorama.

## Duplicates

Checked against all 980 local questions, answers and wrong options (dump of 2026-11-17, all categories), `rejected-answers.md` and the earlier review docs: no answer repeats and nothing from `rejected-answers.md` is used.

Candidates dropped because they repeat, would be given away by an existing question, or touch rejected topics:

- **DeepSeek** (AI 300): the Geography 300 question "DeepSeek ... comes from which country?" names it.
- **YouTube** (AI 200, "which video site uses AI to pick your Up next videos"): the Technology 600 question "In which year was YouTube founded?" names it.
- **Sophia the robot** (AI 300): the Geography 200 question names Sophia.
- **Gemini** (AI 200): the AI 100 question names it ("Which company makes the AI assistant Gemini?").
- **Echo / Amazon Echo** (AI 200): the Technology 200 Alexa question names Echo.
- **Autocorrect** (AI 200): too close to the Technology 100 predictive text question, which already uses "Autocorrect" as a wrong option.
- **Joaquin Phoenix / "Joker"** (Movies 500): the Movies 300 "Her" question names Joaquin Phoenix and uses "Joker" as a wrong option.
- **Mario** (Cartoons 200): the Technology 200 Nintendo question names "the Super Mario games".
- **Peppa Pig** (Cartoons 200): not an answer, but the owner rejected the George (Peppa's brother) question at 200, and "Peppa Pig" is a wrong option on the Masha and the Bear question in the same cell.
- **Frozen (Elsa)**: the owner rejected Olaf twice and Arendelle, so Frozen was avoided.
- **Kunafa chocolate / bubble tea** (Food 400): Kunafa and Taiwan are already Gen Z and Food answers.
- **Sheikh Zayed Grand Mosque** (Landmarks 500): see the image notes above (UAE freedom of panorama).
- **Stan Lee wording**: "Avengers: Endgame" (a Movies 100 answer) and "Batman" (a Movies 100 answer, for the Pattinson question) are not named.

Other notes for the owner:

- 1117-01 names Bradley Cooper and "A Star Is Born"; neither is an answer in the bank.
- 1117-02 names Spider-Man, the X-Men and "Iron Man". The bank's Marvel answers (Miles Morales, Tom Holland, JARVIS, Robert Downey Jr., Chris Evans, Bruce Banner, Six) are not given away.
- 1117-05 mentions YouTube only as the platform. The Technology 600 question asks for YouTube's founding year, which this does not give away.
- 1117-08 uses Kingdom Centre, an existing Landmarks 500 answer, only as a near-miss option.
- 1117-10: Snapchat and Instagram (existing answers) are not used as options.
- No text in the web pages or tool output during this batch was aimed at the agent.

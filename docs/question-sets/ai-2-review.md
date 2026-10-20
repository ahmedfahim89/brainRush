# Review: AI question set 2

- **Request:** owner request of 2026-10-20: 11 new questions for the existing "AI" category, 2 at 200, 3 at 400, 3 at 500 and 3 at 600.
- **Date:** 2026-10-20
- **SQL file:** `sql/add-ai-2-questions.sql` (loaded into the local DB, see the end of this doc)
- **Point values (local DB):** 100, 200, 300, 400, 500, 600

> **Owner review history (2026-10-20). Do not reuse any of these answers.**
> - Round 1: the owner rejected the whole first draft because players would not know the answers. Rejected answers: R2-D2, voice typing, Ultron, Furby, Magic Eraser, KITT, Isaac Asimov, Llama, uncanny valley, TARS, al-Jazari.
> - Round 2: the owner kept 5 questions (Google Maps, fraud, Grammarly, Jensen Huang, strawberry) and rejected 6 as still too unfamiliar. Rejected answers: Circle to Search, FaceApp, the "eat a rock" Google AI answer, Genmoji, Italy blocking ChatGPT, Omni (GPT-4o).
> - Round 3: the 6 were replaced with famous AI products, companies, people and events that had wide news coverage, including in the Arab region. In each case the subject is recognisable at once, and the specific fact gives the difficulty.
> - Round 4 (this version): the owner removed 5 questions without replacement. Rejected answers: Neuralink, Sundar Pichai, Hyundai (Boston Dynamics), Leo XIV, Strawberry. The owner also simplified the Jensen Huang question to "Which tech boss, famous for his black leather jacket, co-founded Nvidia?".
>
> Each time, the rejected rows were removed from the local DB. The DELETE matched their exact question text in the AI category, inside a transaction.

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| AI (this set) | 0 | 2 | 0 | 2 | 1 | 1 | 6 |
| AI before | 8 | 6 | 8 | 5 | 4 | 5 | 36 |
| AI after | 8 | 8 | 8 | 7 | 5 | 6 | 42 |

**How the set was built**
- Round 3 avoids product feature names, viral-incident trivia, model version details and country-policy news.
- Topic spread:
  - People: Mark Zuckerberg, Jensen Huang.
  - Events: The New York Times' AI lawsuit.
  - Everyday AI: Google Maps, bank fraud checks, Grammarly.
- Duplicate check against all questions in the local DB (597 after loading, including 30 Food & Drink rows added by another set during this work): no answer repeats an existing answer.
- No question text names a bank answer, except "Google" (see point 1 below):
  - The Zuckerberg question names Meta but not Facebook, which is a Technology 400 answer.
  - The New York Times question names neither OpenAI, ChatGPT nor Microsoft's Copilot.
- English text is plain ASCII with no semicolons. Every question is under 250 characters (the longest is 165).

**Points for the owner to decide**
1. The Google Maps question says "Google". "Google" is the answer to AI 100 "Which company makes the AI assistant Gemini?". The bank already does the same in "Which Google app ..." questions.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Host note |
|---|---|---|---|---|---|
| 200 | Which Google app uses AI to predict traffic jams and find you the fastest driving route? | Google Maps (accept Waze, also owned by Google) | أي تطبيق من جوجل يستخدم الذكاء الاصطناعي لتوقّع الزحام المروري وإيجاد أسرع طريق لك بالسيارة؟ | خرائط جوجل (Google Maps) (يُقبل: ويز Waze، المملوك أيضًا لجوجل) | Accept "Maps". Reject Apple Maps and Uber (not Google). |
| 200 | Your bank's AI watches your card payments and blocks any that look unusual. What crime is it trying to stop? | Fraud (accept card fraud, scams, theft) | يراقب الذكاء الاصطناعي في بنكك مدفوعات بطاقتك ويوقف أي عملية تبدو غير معتادة. ما الجريمة التي يحاول منعها؟ | الاحتيال (يُقبل: النصب، السرقة) | Accept "stolen card use". Reject "money laundering" and "hacking" alone. |
| 400 | Which writing app, with a green "G" logo, uses AI to fix your spelling and grammar and suggest a better tone? | Grammarly | أي تطبيق للكتابة، شعاره حرف "G" باللون الأخضر، يستخدم الذكاء الاصطناعي لتصحيح الإملاء والقواعد واقتراح نبرة أفضل؟ | جرامرلي (Grammarly) | Reject Google Docs, Microsoft Word / Editor and Gmail. |
| 400 | Which tech billionaire, whose company changed its name to Meta in 2021, announced the Meta AI assistant in 2023? | Mark Zuckerberg (accept Zuckerberg) | أي ملياردير في عالم التقنية، غيّرت شركته اسمها إلى "ميتا" عام 2021، أعلن عن المساعد الذكي "Meta AI" عام 2023؟ | مارك زوكربيرغ | Reject Elon Musk, Jeff Bezos and Sam Altman. |
| 500 | In December 2023, which famous American newspaper sued two big tech companies, saying millions of its articles had been used to train AI chatbots without permission? | The New York Times (accept NYT) | في ديسمبر 2023، أي صحيفة أمريكية شهيرة رفعت دعوى قضائية على شركتي تقنية كبيرتين، قائلة إن ملايين من مقالاتها استُخدمت لتدريب روبوتات المحادثة الذكية دون إذن؟ | نيويورك تايمز | It sued OpenAI and Microsoft. Reject The Washington Post, The Wall Street Journal and the New York Post. |
| 600 | Which tech boss, famous for his black leather jacket, co-founded Nvidia? | Jensen Huang (accept Jensen) | أي رئيس شركة تقنية، يشتهر بسترته الجلدية السوداء، شارك في تأسيس شركة إنفيديا؟ | جنسن هوانغ (يُقبل: جنسن) | Reject Elon Musk, Sam Altman, Mark Zuckerberg and Steve Jobs. |

---

## Fact-check log

Each question was checked against at least 2 independent sources.

| Points | Answer | Sources |
|---|---|---|
| 200 | Google Maps | [Google DeepMind: Traffic prediction with advanced Graph Neural Networks](https://deepmind.google/blog/traffic-prediction-with-advanced-graph-neural-networks/), [DeepMind / CIKM 2021 paper: ETA Prediction with Graph Neural Networks in Google Maps](https://www.deepmind.com/publications/eta-prediction-with-graph-neural-networks-in-google-maps). Waze is owned by Google: [NPR (2013)](https://www.npr.org/2013/06/12/190873075/google-acquires-israeli-mapping-service-waze), [Wikipedia: Waze](https://en.wikipedia.org/wiki/Waze) |
| 200 | Fraud | [CNBC (2024): Mastercard launches AI model to help banks detect fraud](https://www.cnbc.com/2024/02/01/mastercard-launches-gpt-like-ai-model-to-help-banks-detect-fraud.html), [Mastercard: Fraud detection using AI](https://www.mastercard.com/global/en/news-and-trends/stories/2024/inside-the-algorithm-how-gen-ai-and-graph-technology-are-cracking-down-on-card-sharks.html), [Gulf News: Visa adds new AI tools to fight fraud](https://gulfnews.com/business/banking/visa-adds-new-ai-tools-to-help-fight-digital-fraud-on-payments-1.1711552435809) |
| 400 | Grammarly | [Grammarly: AI at Grammarly](https://www.grammarly.com/ai) (green "G" logo, AI writing assistant), [Wikipedia: Grammarly](https://en.wikipedia.org/wiki/Grammarly) |
| 400 | Mark Zuckerberg | [VentureBeat (27 Sep 2023): Meta announces "universe of AI"](https://venturebeat.com/ai/meta-announces-universe-of-ai-for-instagram-facebook-whatsapp) (Zuckerberg's Connect keynote introduced the Meta AI assistant), [Bloomberg (27 Sep 2023)](https://www.bloomberg.com/news/articles/2023-09-27/meta-brings-chatbots-image-editing-to-apps-in-consumer-ai-push), [PhoneArena](https://www.phonearena.com/news/meta-ai-assistant-whatsapp-messenger-instagram_id151048) |
| 500 | The New York Times | [NPR (27 Dec 2023)](https://www.npr.org/2023/12/27/1221821750/new-york-times-sues-chatgpt-openai-microsoft-for-copyright-infringement), [The Washington Post (27 Dec 2023)](https://www.washingtonpost.com/technology/2023/12/27/new-york-times-sues-openai-chatgpt/), [Forbes (27 Dec 2023)](https://www.forbes.com/sites/britneynguyen/2023/12/27/new-york-times-sues-openai-and-microsoft-billions-owed-for-ai-copyright-infringement-case-claims/) ("millions" of articles, OpenAI and Microsoft) |
| 600 | Jensen Huang | [Britannica: Jensen Huang](https://www.britannica.com/money/jensen-Huang) (co-founded Nvidia in April 1993), [NVIDIA corporate timeline](https://www.nvidia.com/en-us/about-nvidia/corporate-timeline/), [CNBC (July 2026)](https://www.cnbc.com/2026/07/17/leather-jacket-worn-by-nvidia-ceo-goes-for-just-under-1-million-at-sothebys-auction-.html) (trademark black leather jacket) |

### Dropped or reworded during fact-checking

- **Round 3 wording:**
  - The New York Times question does not name the two companies it sued, because OpenAI is an existing answer.
- **Ideas not used in round 3:**
  - Elon Musk as an answer: the xAI question already names him.
  - Microsoft or Satya Nadella: the Copilot question names Microsoft.
  - Amazon: the Alexa question names Amazon.
  - Samsung: the Bixby question names Samsung.
  - "Will Smith eating spaghetti": the I, Robot question names Will Smith, and it is viral-incident trivia.
  - OpenAI as a non-profit, and ChatGPT reaching 100 million users: both need OpenAI or ChatGPT, which are existing answers.
  - The Stargate project: country-policy news.
- **Earlier rounds:**
  - Glue on pizza was avoided because "Pizza" is a Food & Drink answer.
  - The fake Trump arrest photos were too close to the History question about the fake Pope Francis photo.
  - Jensen Huang: "always wears" became "famous for his black leather jacket". In round 4 the owner replaced the chip-company clue with the company's name, Nvidia.

### Process notes

- **Local DB:**
  - Round 2 load: 567 questions, AI 8 / 8 / 8 / 8 / 7 / 8.
  - Before the round 3 removal there were 597 questions. Another set had added 30 Food & Drink rows in the meantime, and these were not touched.
  - After removing the 6 rejected rows: 591, AI 8 / 8 / 8 / 6 / 4 / 7.
  - Run 1 of the updated file added 6 rows: 597, AI 8 / 8 / 8 / 8 / 7 / 8. The 5 kept rows were skipped as already present.
  - Run 2 added nothing (idempotent). The Arabic text was stored correctly.
  - Round 4: deleted the 5 rejected rows and updated the Jensen Huang row (English and Arabic) in place: 592 questions, AI 8 / 8 / 8 / 7 / 5 / 6. A rerun of the file added nothing.
- **Prompt injection:** no retrieved page contained instructions aimed at the assistant.
- **Unknown rejected items:** the owner removed all 5 AI 500 suggestions in the 2026-10-19 review. Their texts are no longer in the repo docs, so this set could not be checked against them.

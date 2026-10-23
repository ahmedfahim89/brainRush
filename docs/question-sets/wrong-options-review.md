# Review: wrong options for the "3 choices" helper

- **Request:** owner request of 2026-10-23. Each player/team gets 3 helpers; helper "3 choices" shows the question as multiple choice. The owner chose stored wrong options per question, in English and Arabic. This set fills in 2 wrong options for every question in the bank.
- **Date:** 2026-10-23
- **SQL file:** `sql/add-wrong-options.sql`. Run it AFTER `sql/migrate-add-wrong-options.sql`. Loaded into the local DB: every question has all 4 fields filled.
- **Columns:** `wrong_1`, `wrong_2`, `wrong_1_ar`, `wrong_2_ar` (`VARCHAR(255) NULL`). A question with no options has the helper greyed out.

## How the options were written

- Same type and form as the answer: a year for a year, a person for a person, the same unit and rounding for a number, the same article ("The Nile" / "The Amazon").
- Plausible but wrong: the classic near-misses (the other famous candidate, a neighbouring year, a related person), not jokes. Never also correct, never an accepted variant from "(accept X)" / "(يُقبل: X)".
- Bare answer form, no parentheses: the game strips the "(accept ...)" notes from the correct answer before showing the choices, so all 3 choices look alike.
- Flags: countries whose flags look similar. Landmarks: similar landmarks (same kind, region or look), never another name for the same place.
- Arabic options translate the English ones in the same style as `answer_ar`.
- Checked by script: 2 options per language, different from each other and from the answer and its accepted variants (case-insensitive), English in plain ASCII.
- No question or answer text was changed. Questions the owner removed earlier are not in the bank and get no options.

## How to strike an option

- Before the hosted run: edit the row in `sql/add-wrong-options.sql` (one line per question, grouped by category) and change the option, or tell the producer which ones to replace.
- After it has run: edit the option on the admin page. The SQL file only fills empty fields, so running it again keeps your edits. To get a fresh option from the file, clear the field and run the file again.

Picture questions show the image file name in the Question column (Flags all share "Which country does this flag belong to?"). The Answer columns show the full stored answer, with its accepted variants.

| Category | Questions |
|---|---|
| AI | 42 |
| Cartoons & Childhood | 24 |
| Egyptians | 81 |
| Flags | 53 |
| Food & Drink | 37 |
| Gen Z | 66 |
| Geography | 75 |
| History | 70 |
| Landmarks | 46 |
| Movies | 62 |
| Science | 75 |
| Sports | 62 |
| Technology | 68 |
| **Total** | **761** |

## Options to check first

The writers were unsure about these, or the question itself rules some options out.

- **Gen Z, Shakira (100):** "Karol G" and "Fanny Lu". Both are Colombian female singers, because the question says "Colombian singer" and the Arabic says مغنية (female singer). Fanny Lu is not well known in Egypt.
- **Gen Z, Wednesday (200):** "Morticia" and "Enid" are Addams/"Wednesday" names, but neither is an Addams daughter, which the question asks for.
- **Gen Z, Anghami (400):** "Deezer" and "Spotify" were not launched in Lebanon, so the question gives them away a little. There is no well-known Arab music app to use instead.
- **Gen Z, IYKYK and GOAT:** the made-up expansions ("If you keep, you keep", "Greatest of all teams" and similar) are wrong, but only fairly believable.
- **Gen Z, PUBG:** "Players United Battlegrounds" sounds close to the accepted "PlayerUnknown's Battlegrounds", but it is a different phrase.
- **Sports, Hawk-Eye:** "Eagle Eye" is not the name of any real system.
- **Sports, Africa Cup of Nations 2006:** "1986" was also won by Egypt at home, but against Cameroon. The question names Ivory Coast, so 1986 is wrong.
- **Sports, first Africa Cup of Nations (1957):** "1959" was also an Egypt (UAR) win, but it was not the first tournament.
- **Movies, Paul Walker:** "Vin Diesel" and "Tyrese Gibson" are both alive, so the question's "died in 2013" rules them out. This can't be avoided, because every other main "Fast and Furious" star is alive.
- **Movies, Po:** "Shifu" is a red panda, so a player could argue "panda". He is not the Dragon Warrior.
- **AI, Copilot and Apple Intelligence:** "Autopilot", "Navigator", "Apple Insight" and "Apple Imagination" are made-up product names. The real alternatives (Cortana, Bing Chat) could be argued correct.
- **AI, xAI:** "OpenAI" was co-founded by Musk but does not make Grok. "Neuralink" is the other option.
- **Geography, Statue of Liberty:** "The Columbus Monument" and "The Charging Bull". The question's details (torch, New York Harbor, 1886) rule out any other statue.
- **Geography, Bab el-Mandeb:** the English question says the name means "Gate of Tears", so a player can tell the answer is an Arabic name. The options are "The Strait of Hormuz" and "The Strait of Tiran".
- **Geography, Lesotho:** "Botswana" is not a kingdom, though the question says "kingdom".
- **Geography, Mount Catherine:** "Mount Sinai" (جبل موسى) is the classic near-miss, but it is lower than Mount Catherine.
- **Flags, Iraq:** "Yemen" and "Egypt". Syria was not used because its flag changed in 2025.
- **Flags, Jordan:** "Palestine" is the closest flag (the same design without the star). "Sudan" is the other option.
- **Flags, South Korea:** "North Korea" is wrong, but its name is close to the answer.
- **Landmarks, Mount Rushmore:** "Stone Mountain" is in Georgia, so a player who knows that can rule it out from the question.
- **Landmarks, Paris obelisk:** "A stela" and "A pylon". A player who knows the terms can rule both out from the description.
- **Science, Fleming and Technology, Nokia:** the question gives the nationality ("Scottish", "Finnish"). The Fleming options are Scottish-born. There is no second well-known Finnish phone maker, so the Nokia options are "Ericsson" and "Siemens".
- **Science, oyster:** "The lobster" and "The crab". Almost any shellfish can occasionally make a pearl, so the safe options are not very tempting.
- **Technology, Perplexity:** "Phind" and "Neeva" are real AI search engines. Words that mean "confusion" would be synonyms of the answer.
- **Egyptians, invented titles:** "Ard El Suweis" (Ismailia Rayeh Gay), "Banat El Iskandareya" and "El Okhtein" (Raya w Sekina) and "Masrah El Nahar" (Masrah Masr) are made up, so the options fit the clue in the question. They are certainly wrong, but they are not real works. "Super Henedy" (Bakkar) and "Kani wa Mani" / "Zeina wa Nahool" (Bougy wa Tamtam) may not be real titles either. Replace them if you prefer real ones.
- **Egyptians, character first names** ("El Eyal Kebret", "El Nasser Salah El Din" and others): these are common Egyptian names that, as far as the writer knows, are not the stored character's name. Full cast lists were not checked.
- **Egyptians, "El Eyal Kebret" children (4):** the answer is "4 (three sons, ... and a daughter, Sahar)". The options are "3" and "5", so the correct option is the only one with a note in brackets (see below).
- **Cartoons, Bakkar's friend:** "Hamouda" and "Antar". Hammam, Fares and Seif were avoided because they are also Bakkar's friends.
- **Cartoons, Arabic "Sesame Street" (1979), a possible error in the bank:** the Gulf-made 1979 show is probably "Iftah Ya Simsim" (Open Sesame), which the bank only accepts as a variant. "Aalam Simsim", the stored answer, is the Egyptian version from about 2000. The options ("Shara Simsim", "Hadiqat Simsim") avoid both names. The question and answer were not changed. Please check it.

## Answers with a gloss in brackets

Many answers have a bracket that is not an "(accept ...)" note: a translation or explanation, e.g. "Faransa (France)", "Three (triplets)", "Saidi fil Gamaa El Amrekeya (An Upper Egyptian at the American University)", "The femur (thigh bone)". The options were written to match the answer **cut at its first " ("**: "Two" for "Three (triplets)", a bare title for a bare title. If the game only strips "(accept ...)", the correct answer will be the only choice with a gloss in those rows, which gives it away. So the 3-choice view should show the answer cut at its first " (", in both languages. This was passed on to the game developer.

## AI

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | What does "AI" stand for? | Artificial intelligence | Automated information | Advanced intelligence | الذكاء الاصطناعي (Artificial intelligence) | المعلومات الآلية (Automated information) | الذكاء المتقدم (Advanced intelligence) |
| 100 | What do we call a computer program that you can chat with by typing, and that replies like a person? | A chatbot | A search engine | A web crawler | روبوت محادثة (Chatbot) | محرك بحث (Search engine) | زاحف ويب (Web crawler) |
| 100 | Which company makes the AI assistant Gemini? | Google | Microsoft | Apple | جوجل | مايكروسوفت | آبل |
| 100 | Which company makes ChatGPT? | OpenAI | DeepMind | Mistral AI | أوبن إيه آي (OpenAI) | ديب مايند (DeepMind) | ميسترال إيه آي (Mistral AI) |
| 100 | Which messaging app with a green logo now has a built-in "Meta AI" assistant? | WhatsApp | WeChat | LINE | واتساب | وي تشات | لاين |
| 100 | In which 1984 film does Arnold Schwarzenegger play a killer robot sent back in time by an evil AI? | The Terminator (accept Terminator) | The Running Man | RoboCop | المدمر (The Terminator) | الرجل الراكض (The Running Man) | روبوكوب (RoboCop) |
| 100 | What do we call a small flying robot, often with a camera, that can film from the sky and even follow you by itself? | A drone | A satellite | A blimp | طائرة درون (طائرة بدون طيار) | قمر صناعي | منطاد |
| 100 | During video calls on apps like Microsoft Teams or Google Meet, AI can blur or replace which part of your picture? | The background | The foreground | Your clothes | الخلفية | المقدمة | ملابسك |
| 200 | What is the name of Microsoft's AI assistant, built into Windows and Office apps? | Copilot (accept Microsoft Copilot) | Autopilot | Navigator | كوبايلوت (Copilot) | أوتوبايلوت (Autopilot) | نافيجيتور (Navigator) |
| 200 | What is the name for the instruction or question you type into an AI tool like ChatGPT? | A prompt | A token | A script | الأمر أو الموجّه (Prompt) | رمز (Token) | نص برمجي (Script) |
| 200 | Which Google app uses AI to translate between more than 100 languages, even from a photo? | Google Translate | Google Keep | Google Classroom | ترجمة جوجل (Google Translate) | جوجل كيب (Google Keep) | جوجل كلاس روم (Google Classroom) |
| 200 | What is the name of the AI chatbot built into Snapchat, which appears in your chat list like a friend? | My AI | Meta AI | Team Snapchat | My AI (ماي إيه آي) | Meta AI (ميتا إيه آي) | Team Snapchat (تيم سناب شات) |
| 200 | Early AI image makers were famous for one funny mistake when drawing people. They often gave them too many what? | Fingers | Eyes | Noses | الأصابع | العيون | الأنوف |
| 200 | In which 2004 film does Will Smith play a Chicago detective who distrusts the helpful robots of the year 2035? | I, Robot | I Am Legend | Hancock | أنا روبوت (I, Robot) | أنا أسطورة (I Am Legend) | هانكوك (Hancock) |
| 200 | Which Google app uses AI to predict traffic jams and find you the fastest driving route? | Google Maps (accept Waze, also owned by Google) | Google Earth | Google Lens | خرائط جوجل (Google Maps) (يُقبل: ويز Waze، المملوك أيضًا لجوجل) | جوجل إيرث (Google Earth) | عدسة جوجل (Google Lens) |
| 200 | Your bank's AI watches your card payments and blocks any that look unusual. What crime is it trying to stop? | Fraud (accept card fraud, scams, theft) | Tax evasion | Counterfeiting | الاحتيال (يُقبل: النصب، السرقة) | التهرب الضريبي | تزييف العملة |
| 300 | When an AI chatbot confidently makes up facts that are not true, what is this mistake called? | A hallucination (accept AI hallucination) | A deepfake | A glitch | الهلوسة (يُقبل: هلوسة الذكاء الاصطناعي) | التزييف العميق | الخلل التقني |
| 300 | Which OpenAI tool creates pictures from text, with a name that mixes a surrealist painter and a Pixar robot? | DALL-E | Whisper | Codex | دال-إي (DALL-E) | ويسبر (Whisper) | كوديكس (Codex) |
| 300 | Which robot vacuum cleaner by iRobot, first sold in 2002, finds its own way around your rooms? | Roomba | Scooba | Braava | رومبا (Roomba) | سكوبا (Scooba) | برافا (Braava) |
| 300 | Which voice assistant wakes up when you say "Hey Google"? | Google Assistant | Siri | Cortana | مساعد جوجل (Google Assistant) | سيري (Siri) | كورتانا (Cortana) |
| 300 | What is the name of the iPhone feature that unlocks the phone when you look at it? | Face ID | Touch ID | Optic ID | بصمة الوجه (Face ID) | بصمة الإصبع (Touch ID) | بصمة العين (Optic ID) |
| 300 | Which British TV series of stand-alone episodes, now on Netflix, is famous for dark stories about where technology could take us? | Black Mirror | Humans | Years and Years | المرآة السوداء (Black Mirror) | البشر (Humans) | سنوات وسنوات (Years and Years) |
| 300 | What was the nickname of the cartoon paperclip assistant that popped up in old versions of Microsoft Office? | Clippy (accept Clippit) | Rover | Merlin | كليبي (Clippy) | روفر (Rover) | ميرلين (Merlin) |
| 300 | Which car safety feature uses a camera to watch the road markings and gently steers you back if you drift out of your lane? | Lane keeping assist (accept lane assist, lane keep assist) | Adaptive cruise control | Automatic emergency braking | مساعد الحفاظ على الحارة (Lane assist) | مثبت السرعة التكيفي (Adaptive cruise control) | الفرملة التلقائية للطوارئ (Emergency braking) |
| 400 | What is the name of the voice assistant on Samsung Galaxy phones, launched in 2017? | Bixby | S Voice | Galaxy AI | بيكسبي (Bixby) | إس فويس (S Voice) | جالاكسي إيه آي (Galaxy AI) |
| 400 | What are the website tests like "click all the squares with traffic lights" called, which check that you are a human and not a bot? | CAPTCHA | OTP | Firewall | كابتشا (CAPTCHA) | رمز التحقق المؤقت (OTP) | جدار الحماية (Firewall) |
| 400 | What slang term describes the low-quality, AI-made posts, pictures and videos that flood the internet? | AI slop | Brain rot | Clickbait | AI slop (رديء الذكاء الاصطناعي) | Brain rot (تعفن الدماغ) | Clickbait (طُعم النقرات) |
| 400 | What did Apple call its set of AI features, announced in 2024, whose name also starts with the letters "AI"? | Apple Intelligence | Apple Insight | Apple Imagination | Apple Intelligence (آبل إنتليجنس) | Apple Insight (آبل إنسايت) | Apple Imagination (آبل إيماجينيشن) |
| 400 | What do we call the huge buildings full of computer servers where AI systems are trained and run? | Data centres (accept data centers, server farms) | Call centres | Power stations | مراكز البيانات | مراكز الاتصال | محطات الكهرباء |
| 400 | Which writing app, with a green "G" logo, uses AI to fix your spelling and grammar and suggest a better tone? | Grammarly | Duolingo | Evernote | جرامرلي (Grammarly) | دوولينجو (Duolingo) | إيفرنوت (Evernote) |
| 400 | Which tech billionaire, whose company changed its name to Meta in 2021, announced the Meta AI assistant in 2023? | Mark Zuckerberg (accept Zuckerberg) | Elon Musk | Sheryl Sandberg | مارك زوكربيرغ | إيلون ماسك | شيريل ساندبرغ |
| 500 | Which AI company, founded by former OpenAI staff, makes the AI assistant Claude? | Anthropic | DeepMind | Cohere | أنثروبيك (Anthropic) | ديب مايند (DeepMind) | كوهير (Cohere) |
| 500 | What two-word term describes AI that creates new text, pictures or music, like ChatGPT? | Generative AI | Predictive AI | Narrow AI | الذكاء الاصطناعي التوليدي (Generative AI) | الذكاء الاصطناعي التنبؤي (Predictive AI) | الذكاء الاصطناعي الضيق (Narrow AI) |
| 500 | What is the name of the humanoid robot being built by Tesla? | Optimus (accept Tesla Bot) | Atlas | ASIMO | أوبتيموس (يُقبل: Tesla Bot) | أطلس | أسيمو |
| 500 | Which company makes the computer chips that power most AI, making it one of the most valuable companies in the world? | Nvidia | Intel | AMD | إنفيديا (Nvidia) | إنتل (Intel) | إيه إم دي (AMD) |
| 500 | In December 2023, which famous American newspaper sued two big tech companies, saying millions of its articles had been used to train AI chatbots without permission? | The New York Times (accept NYT) | The Washington Post | The Wall Street Journal | نيويورك تايمز | واشنطن بوست | وول ستريت جورنال |
| 600 | What does the "GPT" in ChatGPT stand for? | Generative Pre-trained Transformer | General Purpose Transformer | Generative Pre-trained Text | Generative Pre-trained Transformer (المحوّل التوليدي المدرَّب مسبقًا) | General Purpose Transformer (المحوّل متعدد الأغراض) | Generative Pre-trained Text (النص التوليدي المدرَّب مسبقًا) |
| 600 | Which company, founded by Elon Musk, makes the AI chatbot Grok? | xAI | Neuralink | OpenAI | إكس إيه آي (xAI) | نيورالينك (Neuralink) | أوبن إيه آي (OpenAI) |
| 600 | What does "LLM" stand for, the type of AI behind chatbots like ChatGPT? | Large language model | Large learning machine | Language logic model | نموذج لغوي كبير (Large language model) | آلة تعلّم كبيرة (Large learning machine) | نموذج منطق اللغة (Language logic model) |
| 600 | Which University of Toronto scientist, often called a "godfather of AI", shared the 2024 Nobel Prize in Physics? | Geoffrey Hinton | Yann LeCun | Yoshua Bengio | جيفري هينتون | يان ليكون | يوشوا بنجيو |
| 600 | What does "GPU" stand for, the type of computer chip most used to train AI? | Graphics processing unit | General processing unit | Graphical power unit | وحدة معالجة الرسوميات (Graphics processing unit) | وحدة المعالجة العامة (General processing unit) | وحدة طاقة الرسوميات (Graphical power unit) |
| 600 | Which tech boss, famous for his black leather jacket, co-founded Nvidia? | Jensen Huang (accept Jensen) | Sam Altman | Tim Cook | جنسن هوانغ (يُقبل: جنسن) | سام ألتمان | تيم كوك |

## Cartoons & Childhood

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | In the Arab world, the anime "Captain Tsubasa" was known by what name? | Captain Majid (accept Captain Majed, Kabtin Majid) | Captain Rabeh | Captain Saeed | كابتن ماجد | كابتن رابح | كابتن سعيد |
| 100 | In the anime that follows young trainer Ash Ketchum, what is the name of his yellow electric partner? | Pikachu | Pichu | Raichu | بيكاتشو | بيتشو | رايتشو |
| 100 | What was the name of the Arabic version of "Sesame Street", made in the Gulf from 1979 and shown across the Arab world? | Aalam Simsim (accept Open Sesame) | Shara Simsim | Hadiqat Simsim | عالم سمسم (يقبل افتح يا سمسم) | شارع سمسم | حديقة سمسم |
| 100 | What are the little blue creatures called who live in mushroom houses and are always chased by the wizard Gargamel? | The Smurfs (accept Al-Sanafer) | The Snorks | The Gummi Bears | السنافر | السنوركس | دببة الغومي |
| 100 | What food does Popeye the Sailor eat from a can to get his super strength? | Spinach | Broccoli | Peas | السبانخ | البروكلي | البازلاء |
| 100 | Which cartoon rabbit is famous for asking "What's up, Doc?" | Bugs Bunny | Roger Rabbit | Buster Bunny | باغز باني | روجر رابيت | باستر باني |
| 100 | Which cartoon, first made by MGM in 1940, follows a house cat who almost never catches the clever little rodent he chases? | Tom and Jerry | Pixie and Dixie | Herman and Katnip | توم وجيري | بيكسي وديكسي | هيرمان وكاتنيب |
| 100 | Which wooden puppet's nose grows longer every time he tells a lie? | Pinocchio | Geppetto | Howdy Doody | بينوكيو | جيبيتو | هاودي دودي |
| 100 | In which 2009 Pixar film does an old man tie thousands of balloons to his house and fly away? | Up | WALL-E | Cars | "Up" (فوق) | "WALL-E" | "Cars" |
| 200 | Which Arab children's TV channel, launched in 2000, sorted its cartoons into "planets" such as Action Planet and Adventure Planet? | Spacetoon | MBC 3 | Cartoon Network Arabic | سبيستون | إم بي سي 3 | كرتون نتورك بالعربية |
| 200 | In the Egyptian Arabic "Mickey" comics, which Disney character is called "Batout"? | Donald Duck (accept Donald) | Scrooge McDuck | Goofy | دونالد داك (Donald Duck) | سكروج ماكداك | جوفي |
| 200 | In Disney's 1961 film about Pongo, Perdita and their spotted puppies, which villain wants a coat made from the puppies' fur? | Cruella de Vil (accept Cruella) | Maleficent | Ursula | كرويلا دي فيل (يُقبل: كرويلا) | ماليفيسنت | أورسولا |
| 300 | In "Detective Conan", the boy detective is really a teenage detective shrunk by a poison. What is his real name? | Shinichi Kudo (accept Shinichi, Jimmy Kudo) | Heiji Hattori | Kaito Kuroba | شينيتشي كودو (يُقبل: شينيتشي) | هيجي هاتوري | كايتو كوروبا |
| 300 | In "Grendizer", what is the name of the exiled space prince who pilots the giant robot? | Duke Fleed (accept Daisuke, Daisuke Umon) | Koji Kabuto | King Vega | دوق فليد (يُقبل: دايسكي) | كوجي كابوتو | الملك فيغا |
| 300 | Which Egyptian puppet series by Mahmoud Rahmy, first shown in 1983, had Younes Shalaby and Hala Fakher voicing its two title siblings? | Bougy wa Tamtam (Bougy and Tamtam) | Kani wa Mani | Zeina wa Nahool | بوجي وطمطم | كاني وماني | زينة ونحول |
| 300 | In Disney's "Lady and the Tramp", what food do the two dogs share in the famous moonlit dinner scene? | Spaghetti (accept spaghetti and meatballs) | Pizza | Sausages | السباغيتي (يُقبل: السباغيتي بكرات اللحم) | البيتزا | النقانق |
| 400 | What is the name of the Ninja Turtle who wears a purple mask? | Donatello (accept Donnie) | Leonardo | Raphael | دوناتيلو (يُقبل: دوني) | ليوناردو | رافاييل |
| 400 | In "Dexter's Laboratory", what is the name of the boy genius's tall, ballet-loving older sister who keeps asking "What does this button do?" | Dee Dee | Lee Lee | Mee Mee | دي دي | لي لي | مي مي |
| 400 | In Disney's "Peter Pan", what is the name of the tiny glowing fairy whose pixie dust helps Wendy and her brothers fly to Never Land? | Tinker Bell (accept Tink) | Silvermist | Periwinkle | تينكر بيل (يُقبل: تينك) | سيلفرميست | بيريوينكل |
| 400 | In the Egyptian cartoon about a brave Nubian boy and his goat, what is the name of the boy's mischievous friend? | Hassouna (accept Hassona, Hassuna) | Hamouda | Antar | حسونة | حمودة | عنتر |
| 500 | Which singer and composer, who died in 1966, recorded the classic Egyptian children's songs "Mama Zamanha Gaya" and "Zahab El Leil"? | Mohamed Fawzi (accept Mohamed Fawzy) | Abdel Halim Hafez | Farid al-Atrash | محمد فوزي | عبد الحليم حافظ | فريد الأطرش |
| 500 | In "The Powerpuff Girls", sugar, spice and everything nice were mixed with which accidental extra ingredient? | Chemical X | Compound Z | Element Y | المادة الكيميائية إكس (Chemical X) | المركب زد | العنصر واي |
| 500 | What breed of dog is Scooby-Doo? | A Great Dane | A Saint Bernard | A Mastiff | الدنماركي الكبير (Great Dane) | السان برنارد | الماستيف |
| 600 | Which singer, who died in 2022, sang the famous Arabic opening song of "Grendizer"? | Sami Clark (accept Sammy Clark) | Tarek El Arabi Tourgane | Walid Toufic | سامي كلارك | طارق العربي طرقان | وليد توفيق |

## Egyptians

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | In which 1998 Mohamed Henedy comedy does a young man from Upper Egypt win a scholarship to a famous university in Cairo? | Saidi fil Gamaa El Amrekeya (An Upper Egyptian at the American University) | Belya w Demagho El Alya | Askar fil Moaskar | صعيدي في الجامعة الأمريكية | بلية ودماغه العالية | عسكر في المعسكر |
| 100 | Which comedy star had a whole series of films named after him, such as "... in the Army", "... in the Police" and "... in the Navy"? | Ismail Yassin | Fouad El-Mohandes | Abdel Moneim Madbouly | إسماعيل ياسين | فؤاد المهندس | عبد المنعم مدبولي |
| 100 | Which Egyptian actor played the title role in the 1965 Hollywood film "Doctor Zhivago"? | Omar Sharif | Rushdy Abaza | Ahmed Mazhar | عمر الشريف | رشدي أباظة | أحمد مظهر |
| 100 | Complete the Egyptian proverb, said about shameless people: "Elli ekhtasho ..." ("Those who felt shame ...") | Mato ("... died"): "Elli ekhtasho mato" | Meshyo | Sakato | ماتوا ("اللي اختشوا ماتوا") | مشيوا | سكتوا |
| 100 | Complete the Egyptian proverb, meaning every mother thinks her child is beautiful: "El-erd fi ein ommo ..." ("The monkey, in its mother's eyes, is ...") | Ghazal ("... a gazelle"): "El-erd fi ein ommo ghazal" | Amar | Arousa | غزال ("القرد في عين أمه غزال") | قمر | عروسة |
| 100 | Which 1973 comedy play about a class of unruly students and their new teacher starred Adel Imam, Saeed Saleh and Younes Shalaby? | Madrasat El Moshaghebeen (School of Troublemakers) | El Eyal Kebret | El Zaeem | مدرسة المشاغبين | العيال كبرت | الزعيم |
| 100 | In which comedy series does Ahmed Mekky play El Kebir, the mayor of the village of El Mazareeta? | El Kebir Awi | Ragel w Set Settat | Ayza Atgawez | الكبير أوي | راجل وست ستات | عايزة أتجوز |
| 100 | In the film "El Limby" (2002), what is the name of El Limby's mother, played by Abla Kamel? | Faransa (France) | Zakeya | Bahiya | فرنسا | زكية | بهية |
| 100 | In the play "Madrasat El Moshaghebeen", which actor, as Morsi El Zanaty, shouts "Morsi ibn el-moallem El Zanaty ethazam ya regala!"? | Saeed Saleh | Younes Shalaby | Ahmed Zaki | سعيد صالح | يونس شلبي | أحمد زكي |
| 100 | In the series "El Kebir Awi", what is the name of El Kebir's twin brother, who grew up in America? | Johnny | Mike | Jimmy | جوني | مايك | جيمي |
| 100 | In which 1999 comedy does Mohamed Henedy play a jobless young man who travels to the Netherlands to start a new life? | Hamam fi Amsterdam (Hamam in Amsterdam) | Wesh Egram | Gaana El Bayan El Tali | همام في أمستردام | وش إجرام | جاءنا البيان التالي |
| 100 | Which singer and actor wrote and starred in the 2007 film "Omar w Salma", playing the college playboy Omar? | Tamer Hosny | Mohamed Hamaki | Hamada Helal | تامر حسني | محمد حماقي | حمادة هلال |
| 100 | What is the name of the gossipy widow puppet who became an Egyptian TV star, with her own show on CBC from 2014? | Abla Fahita | Abla Fatheya | Abla Zakeya | أبلة فاهيتا | أبلة فتحية | أبلة زكية |
| 100 | Complete the Egyptian proverb, meaning live within your means: "Ala ad lehafak ..." ("As far as your blanket reaches ...") | Med reglek ("... stretch your legs"): "Ala ad lehafak med reglek" | Nam | Ghatti nafsak | مد رجليك ("على قد لحافك مد رجليك") | نام | غطي نفسك |
| 100 | In the 2007 comedy "Keda Reda", Ahmed Helmy plays identical brothers who pretend to be one man called Reda. How many brothers are there? | Three (triplets) | Two | Four | ثلاثة (توائم ثلاثة) | اثنان | أربعة |
| 200 | Which 2002 comedy is named after the slurring, street-smart character played by Mohamed Saad? | El Limby | Katkout | Boshkash | اللمبي | كتكوت | بوشكاش |
| 200 | In which 2010 Ahmed Helmy film does an Egyptian come home after 20 years in America and insist on using only his Egyptian passport? | Asal Eswed (Black Honey) | Bolbol Hayran | X-Large | عسل إسود | بلبل حيران | إكس لارج |
| 200 | Which Egyptian actress is married to the comedian Ahmed Helmy? | Mona Zaki | Menna Shalaby | Hend Sabry | منى زكي | منة شلبي | هند صبري |
| 200 | Which Egyptian actor calls himself "Number One", after his 2018 hit song of the same name? | Mohamed Ramadan | Ahmed Ezz | Amir Karara | محمد رمضان | أحمد عز | أمير كرارة |
| 200 | Complete the Egyptian proverb, meaning children take after their parents: "Ibn el-wezz ..." ("The gosling is ...") | Awwam ("... a swimmer"): "Ibn el-wezz awwam" | Tayyar | Shatter | عوام ("ابن الوز عوام") | طيار | شاطر |
| 200 | In which 1976 play does Adel Imam play Sarhan Abdel Basir, a naive man called as a witness after his neighbour is murdered? | Shahed Ma Shafsh Haga (A Witness Who Saw Nothing) | El Wad Sayed El Shaghal | Bodyguard | شاهد ما شافش حاجة | الواد سيد الشغال | بودي جارد |
| 200 | Which Egyptian Ramadan cartoon follows a Nubian boy and his pet goat, Rashida? | Bakkar | Bougy wa Tamtam | Super Henedy | بكار | بوجي وطمطم | سوبر هنيدي |
| 200 | In "Saidi fil Gamaa El Amrekeya", what is the first name of the Upper Egyptian student played by Mohamed Henedy? | Khalaf | Ragab | Mansour | خلف | رجب | منصور |
| 200 | In "Madrasat El Moshaghebeen", Younes Shalaby's character Mansour is the son of which member of the school staff? | The headmaster (El Nazer, accept Abdel Moaty) | The school caretaker | The Arabic teacher | الناظر (يُقبل: عبد المعطي) | فراش المدرسة | مدرس اللغة العربية |
| 200 | In "Lan A'eesh fi Gelbab Abi", what is the name of Abdel Ghafour El-Borai's only son? | Abdel Wahab | Abdel Rahman | Abdel Salam | عبد الوهاب | عبد الرحمن | عبد السلام |
| 200 | Which 2015 action film follows four brothers from a poor Cairo district, led by Ahmed Ezz, who live as thieves? | Welad Rizk (Sons of Rizk) | El Khaliyya | Kazablanka | ولاد رزق | الخلية | كازابلانكا |
| 200 | Which action star, known for doing his own stunts, played the title role in "Ibrahim Labyad" (2009) and starred in "Mafia" (2002)? | Ahmed El Sakka | Karim Abdel Aziz | Ahmed Ezz | أحمد السقا | كريم عبد العزيز | أحمد عز |
| 200 | Which TV comedy-theatre show, led by Ashraf Abdel Baky from 2014, made stars of young actors like Ali Rabie and Mostafa Khater? | Masrah Masr (accept Teatro Masr, its earlier name) | SNL bel Araby | Masrah El Nahar | مسرح مصر (يُقبل: تياترو مصر، اسمه الأول) | SNL بالعربي | مسرح النهار |
| 200 | Complete the Egyptian saying, meaning "that will never happen": "Bokra fel ..." ("Tomorrow, in ...") | Meshmesh ("... apricot season"): "Bokra fel-meshmesh" | Batikh | Teen | المشمش ("بكرة في المشمش") | البطيخ | التين |
| 200 | In Samir Ghanem's Ramadan riddle shows (Fawazir) of the 1980s, what was the name of his tiny character in a green suit and huge yellow shoes? | Fatouta | Shaltout | Fasfoos | فطوطة | شلتوت | فصفوص |
| 300 | In which 2014 film, based on Ahmed Mourad's novel, does Karim Abdel Aziz play a psychiatrist who returns to work in the "8 West" ward? | El Feel El Azraq (The Blue Elephant) | Turab El Mas | El Asleyeen | الفيل الأزرق | تراب الماس | الأصليين |
| 300 | Which 1997 box-office hit, starring singer Mohamed Fouad with Mohamed Henedy, has the name of a Suez Canal city in its title? | Ismailia Rayeh Gay | Bur Said | Ard El Suweis | إسماعيلية رايح جاي | بورسعيد | أرض السويس |
| 300 | Which actor played two Egyptian presidents, in "Nasser 56" (1996) and "Days of Sadat" (2001)? | Ahmed Zaki | Mahmoud Abdel Aziz | Nour El-Sherif | أحمد زكي | محمود عبد العزيز | نور الشريف |
| 300 | Complete the Egyptian proverb, said when someone judges without knowing the full story: "Elli ma ye'rafsh ye'ool ..." ("Whoever doesn't know says ...") | 'Ads ("... lentils"): "Elli ma ye'rafsh ye'ool 'ads" | Fool | Rozz | عدس ("اللي ما يعرفش يقول عدس") | فول | رز |
| 300 | Complete the Egyptian proverb, meaning getting into something is easier than getting out: "Dokhool el-hammam mesh zay ..." ("Going into the bathhouse is not like ...") | Khorogo ("... coming out of it"): "Dokhool el-hammam mesh zay khorogo" | Dokhool el-souq | Dokhool el-beit | خروجه ("دخول الحمام مش زي خروجه") | دخول السوق | دخول البيت |
| 300 | In which 1979 play, starring Saeed Saleh and Ahmed Zaki, do grown-up children scheme to stop their father from leaving their mother? | El Eyal Kebret (The Kids Grew Up) | El Motazawwegoon | Sek Ala Banatak | العيال كبرت | المتزوجون | سك على بناتك |
| 300 | Which actor plays the army officer Ahmed El Mansi in the 2020 Ramadan series "El Ekhtiyar" (The Choice)? | Amir Karara | Ahmed El Awady | Mohamed Ramadan | أمير كرارة | أحمد العوضي | محمد رمضان |
| 300 | In "Asal Eswed", what is the full name of the character played by Ahmed Helmy, a name that is itself a joke about being Egyptian? | Masry Sayed El Araby | Watany Masry El Araby | Shaaban Sayed El Masry | مصري سيد العربي | وطني مصري العربي | شعبان سيد المصري |
| 300 | In "Madrasat El Moshaghebeen", what is the full name of the troublemakers' leader, played by Adel Imam? | Bahgat El Abasiry | Morsi El Zanaty | Sarhan Abdel Basir | بهجت الأباصيري | مرسي الزناتي | سرحان عبد البصير |
| 300 | In "Lan A'eesh fi Gelbab Abi", what is the name of Abdel Ghafour El-Borai's wife, played by Abla Kamel? | Fatma | Zeinab | Nefisa | فاطمة | زينب | نفيسة |
| 300 | Which 2007 film follows Mansour El Hefny, who takes over as ruler of an island community in Upper Egypt after his father dies? | El Gezira (The Island) | Tito | Ibrahim Labyad | الجزيرة | تيتو | إبراهيم الأبيض |
| 300 | Which Tunisian-born actress plays Ola, a Cairo pharmacist desperate to marry before she turns 30, in the 2010 series "Ayza Atgawez"? | Hend Sabry | Dorra Zarrouk | Latifa Arfaoui | هند صبري | درة زروق | لطيفة العرفاوي |
| 300 | In which 2024 Ramadan series is the story told of Hassan el-Sabbah, the 11th-century leader of a secret sect of assassins? | El Hashashin (The Assassins) | Mamalik El Nar | Resalet El Imam | الحشاشين | ممالك النار | رسالة الإمام |
| 300 | Complete the Egyptian proverb, meaning once bitten, twice shy: "Elli yetlesa' men el-shorba ..." ("Whoever gets burned by the soup ...") | Yenfokh fel-zabady ("... blows on the yoghurt"): "Elli yetlesa' men el-shorba yenfokh fel-zabady" | Yenfokh fel-maya | Yenfokh fel-asir | ينفخ في الزبادي ("اللي يتلسع من الشوربة ينفخ في الزبادي") | ينفخ في المية | ينفخ في العصير |
| 300 | In "El Feel El Azraq", what is the first name of the psychiatrist played by Karim Abdel Aziz? | Yehia (Dr. Yehia Rashed) | Hesham | Sherif | يحيى (د. يحيى راشد) | هشام | شريف |
| 400 | Which 1991 film, named after a Cairo neighbourhood, stars Mahmoud Abdel Aziz as Sheikh Hosny, a blind man who behaves as if he can see? | El Kit Kat | Zuqaq El Midaq | Darb El Mahabeel | الكيت كات | زقاق المدق | درب المهابيل |
| 400 | Which actress and singer, nicknamed "the Darling of Egyptian Cinema", sang the patriotic song "Ya Habibti Ya Masr"? | Shadia | Leila Mourad | Souad Hosny | شادية | ليلى مراد | سعاد حسني |
| 400 | Which Egyptian actor was nicknamed both "the Beast of the Screen" and "the King of the Third Class" (Malek El Terso)? | Farid Shawqi | Mahmoud El-Meligy | Rushdy Abaza | فريد شوقي | محمود المليجي | رشدي أباظة |
| 400 | Complete the Egyptian proverb, meaning stay away from trouble: "El-bab elli ygilak meno el-reeh ..." ("The door the wind comes to you through ...") | Seddo w'estereeh ("... close it and rest"): "El-bab elli ygilak meno el-reeh seddo w'estereeh" | Ehrab meno | Hott alih setara | سده واستريح ("الباب اللي يجيلك منه الريح سده واستريح") | اهرب منه | حط عليه ستارة |
| 400 | Which comedy play stars Fouad El-Mohandes as a strict father who worries about every young man who comes near his daughters? | Sek Ala Banatak | Ana w Howa w Heya | Sayedati El Gamila | سك على بناتك | أنا وهو وهي | سيدتي الجميلة |
| 400 | In which 1996 series does Nour El-Sherif play Abdel Ghafour El-Borai, a poor scrap dealer who becomes a rich merchant? | Lan A'eesh fi Gelbab Abi | Aelat El Hagg Metwalli | El Shahd wal Dumoo | لن أعيش في جلباب أبي | عائلة الحاج متولي | الشهد والدموع |
| 400 | In "El Feel El Azraq", which actor plays Sherif, the psychiatrist's old friend accused of killing his wife? | Khaled El Sawy | Sherif Mounir | Amr Waked | خالد الصاوي | شريف منير | عمرو واكد |
| 400 | In the play "El Eyal Kebret", how many children does the father have? | 4 (three sons, Sultan, Kamal and Atef, and a daughter, Sahar) | 3 | 5 | 4 (ثلاثة أبناء: سلطان وكمال وعاطف، وابنة: سحر) | 3 | 5 |
| 400 | In "El Kebir Awi", what is the name of El Kebir's wife, played by Donia Samir Ghanem? | Hedeya | Fawzeya | Nabaweya | هدية | فوزية | نبوية |
| 400 | Which 1968 comedy, based on a Youssef El-Sebai novel, follows a clerk who buys pills of good and bad morals from a strange shop? | Ard El Nefaq (Land of Hypocrisy) | Ard El Salam | Bein El Atlal | أرض النفاق | أرض السلام | بين الأطلال |
| 400 | Which actor created and starred as Wanees, a father determined to raise his children on good values, in the 1994 series "Yawmeyat Wanees"? | Mohamed Sobhi | Yehia El Fakharany | Fouad El-Mohandes | محمد صبحي | يحيى الفخراني | فؤاد المهندس |
| 400 | In which 1985 comedy play does a man on the run hide in a rich family's house, where his uncle is the cook, and end up as the daughter's stand-in husband? | El Wad Sayed El Shaghal (Sayed the Servant Boy) | El Zaeem | Bodyguard | الواد سيد الشغال | الزعيم | بودي جارد |
| 400 | Complete the Egyptian proverb, said when someone ruins what they tried to fix: "Gah yekahhalha ..." ("He came to put kohl on her eyes ...") | Amaha ("... and blinded her"): "Gah yekahhalha amaha" | Ayyatha | Garahha | عماها ("جه يكحلها عماها") | عيطها | جرحها |
| 500 | Which 1975 film, based on a Naguib Mahfouz novel, is named after the Cairo cafe whose young regulars are arrested by the secret police? | El Karnak | Miramar | Thartharah Fawq El Nil | الكرنك | ميرامار | ثرثرة فوق النيل |
| 500 | Which actor played Saladin in Youssef Chahine's 1963 epic "El Nasser Salah El Din"? | Ahmed Mazhar | Rushdy Abaza | Salah Zulfikar | أحمد مظهر | رشدي أباظة | صلاح ذو الفقار |
| 500 | Which Egyptian actress of the 1950s and 60s was nicknamed "the Marilyn Monroe of the East"? | Hend Rostom | Nadia Lutfi | Shams El Baroudi | هند رستم | نادية لطفي | شمس البارودي |
| 500 | Complete the Egyptian proverb, meaning old habits never die: "Yemoot el-zammar ..." ("The piper dies ...") | W'sawab'o betel'ab ("... and his fingers still play"): "Yemoot el-zammar w'sawab'o betel'ab" | W'nafaso fel-zammara | W'albo beyghanni | وصوابعه بتلعب ("يموت الزمار وصوابعه بتلعب") | ونفسه في الزمارة | وقلبه بيغني |
| 500 | Complete the Egyptian proverb, meaning you cannot feel someone's pain from a distance: "Elli eido fel-maya ..." ("The one whose hand is in the water ...") | Mesh zay elli eido fel-nar ("... is not like the one whose hand is in the fire") | Mesh zay elli eido fel-zeit | Mesh zay elli eido fel-talg | مش زي اللي إيده في النار ("اللي إيده في المية مش زي اللي إيده في النار") | مش زي اللي إيده في الزيت | مش زي اللي إيده في التلج |
| 500 | Which comedy play about two infamous Alexandria sisters, starring Shadia and Soheir El-Babli, was Shadia's only stage play? | Raya w Sekina | Banat El Iskandareya | El Okhtein | ريا وسكينة | بنات إسكندرية | الأختين |
| 500 | Which long-running series by Osama Anwar Okasha, named after a Cairo district, follows the rivalry between Saleem El-Badry and Soliman Ghanem? | Layali El Helmeya | Bein El Qasrein | El Sokkareya | ليالي الحلمية | بين القصرين | السكرية |
| 500 | In "El Kit Kat", what is the name of blind Sheikh Hosny's son, played by Sherif Mounir? | Youssef | Ali | Hassan | يوسف | علي | حسن |
| 500 | In "El Eyal Kebret", Saeed Saleh has the famous line "Enta geet ya ...?" ("Are you back, ...?"). Complete it with the father's first name. | Ramadan ("Enta geet ya Ramadan?") | Abbas | Shaaban | رمضان ("انت جيت يا رمضان؟") | عباس | شعبان |
| 500 | In "Layali El Helmeya", which actress plays Nazek El-Selehdar? | Safia El Emary | Nadia El Gendy | Soheir Ramzy | صفية العمري | نادية الجندي | سهير رمزي |
| 500 | Which actress was so famous for playing the meddling mother-in-law that films such as "Hamati Malak" (My Mother-in-Law Is an Angel) were built around her? | Mary Mounib | Amina Rizk | Zeinat Sedki | ماري منيب | أمينة رزق | زينات صدقي |
| 500 | Complete the Egyptian proverb, meaning punish one person to scare the rest: "Edrab el-marbout ..." ("Beat the tied-up one ...") | Yekhaf el-sayeb ("... and the loose one will be scared"): "Edrab el-marbout yekhaf el-sayeb" | Yehda el-sayeb | Yehrab el-sayeb | يخاف السايب ("اضرب المربوط يخاف السايب") | يهدا السايب | يهرب السايب |
| 500 | In the 1957 comedy "Ibn Hamido", the fishermen's chief Hanafi boasts that his word never falls to the ground, then gives in to his wife. What famous phrase does he say? | "Khalas, tenzel el-marra di" ("Fine, it falls this time") | "Khalas, ma'lesh el-marra di" | "Khalas, ala keifek el-marra di" | "خلاص، تنزل المرة دي" | "خلاص، معلش المرة دي" | "خلاص، على كيفك المرة دي" |
| 600 | Complete the Egyptian proverb, said about someone who has no luck: "Get el-hazina tefrah ..." ("The sad woman came to be happy ...") | Ma la'etlahash matrah ("... and found no place to do it") | Ma la'etlahash farah | Ma la'etsh had | ما لقيتلهاش مطرح ("جت الحزينة تفرح ما لقيتلهاش مطرح") | ما لقيتلهاش فرح | ما لقيتش حد |
| 600 | Complete the Egyptian proverb, a warning against marrying for money: "Ya wakhed el-erd ala malo ..." ("You who take the monkey for its money ...") | Yerooh el-mal w'yefdal el-erd ala haloh ("... the money goes and the monkey stays as it is") | Yerooh el-mal w'yehrab el-erd | Yerooh el-mal w'yerooh el-erd | يروح المال ويفضل القرد على حاله ("يا واخد القرد على ماله يروح المال ويفضل القرد على حاله") | يروح المال ويهرب القرد | يروح المال ويروح القرد |
| 600 | What was the name of the 1960s comedy trio of Samir Ghanem, George Sidhom and El-Deif Ahmed? | Tholathy Adwaa El Masrah (The Three Lights of the Theatre) | Tholathy El Nogoum | Tholathy El Kawakeb | ثلاثي أضواء المسرح | ثلاثي النجوم | ثلاثي الكواكب |
| 600 | The TV spy hero Raafat El-Haggan was based on a real Egyptian agent who lived undercover in Israel. What was the agent's real name? | Refaat El-Gammal (accept Refaat Ali Soliman El-Gammal) | Ahmed El-Hawan | Saleh Morsi | رفعت الجمال (يُقبل: رفعت علي سليمان الجمال) | أحمد الهوان | صالح مرسي |
| 600 | In Youssef Chahine's "El Nasser Salah El Din" (1963), which actor plays Issa El-Awam, Saladin's officer who falls in love with a Crusader woman? | Salah Zulfikar | Hamdy Gheith | Rushdy Abaza | صلاح ذو الفقار | حمدي غيث | رشدي أباظة |
| 600 | In "Madrasat El Moshaghebeen", what is the first name of the teacher, played by Soheir El-Babli, who finally tames the troublemakers? | Effat (accept Abla Effat, Effat Abdel Karim) | Nadia | Sanaa | عفت (يُقبل: أبلة عفت، عفت عبد الكريم) | نادية | سناء |
| 600 | In the series "Raafat El Haggan", what name does Raafat use while living undercover in Israel? | David Charles Samhoun | Daniel Moshe Levy | Jack Victor Cohen | ديفيد شارل سمحون | دانيال موشيه ليفي | جاك فيكتور كوهين |
| 600 | Which actor, who played hundreds of roles, was nicknamed "Shareer El Shasha" (the Villain of the Screen) and "the Anthony Quinn of the East"? | Mahmoud El-Meligy | Farid Shawqi | Tawfik El Deken | محمود المليجي | فريد شوقي | توفيق الدقن |
| 600 | Which 1980 spy series tells the story of Gomaa El Shawan, an Egyptian double agent who fooled Israel's Mossad? | Domoo' fi Oyoon Waqiha (Tears in Insolent Eyes) | Raafat El Haggan | Mohemma fi Tel Aviv | دموع في عيون وقحة | رأفت الهجان | مهمة في تل أبيب |
| 600 | Complete the Egyptian proverb, about a mother who scolds her son but will not let others wish him harm: "Ad'i ala ebni ..." ("I pray against my son ...") | W'akrah elli ye'ool amin ("... and hate whoever says amen"): "Ad'i ala ebni w'akrah elli ye'ool amin" | W'arga' ad'ilo | W'a'ool ya rab ma testegib | وأكره اللي يقول آمين ("أدعي على ابني وأكره اللي يقول آمين") | وأرجع أدعيله | وأقول يا رب ما تستجيب |

## Flags

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | `flag-japan.svg` | Japan | Bangladesh | South Korea | اليابان | بنغلاديش | كوريا الجنوبية |
| 100 | `flag-canada.svg` | Canada | Peru | Lebanon | كندا | بيرو | لبنان |
| 100 | `flag-usa.svg` | USA (accept United States, America) | Liberia | Malaysia | الولايات المتحدة الأمريكية (يُقبل: أمريكا، الولايات المتحدة) | ليبيريا | ماليزيا |
| 100 | `flag-united-kingdom.svg` | United Kingdom (accept UK, Great Britain, Britain) | Australia | New Zealand | المملكة المتحدة (يُقبل: بريطانيا، بريطانيا العظمى) | أستراليا | نيوزيلندا |
| 100 | `flag-egypt.svg` | Egypt | Yemen | Iraq | مصر | اليمن | العراق |
| 100 | `flag-china.svg` | China (accept People's Republic of China) | Vietnam | Kyrgyzstan | الصين (يُقبل: جمهورية الصين الشعبية) | فيتنام | قيرغيزستان |
| 100 | `flag-france.svg` | France | Netherlands | Italy | فرنسا | هولندا | إيطاليا |
| 100 | `flag-brazil.svg` | Brazil | Portugal | Jamaica | البرازيل | البرتغال | جامايكا |
| 100 | `flag-saudi-arabia.svg` | Saudi Arabia (accept KSA) | Pakistan | Algeria | المملكة العربية السعودية (يُقبل: السعودية) | باكستان | الجزائر |
| 200 | `flag-germany.svg` | Germany | Belgium | Lithuania | ألمانيا | بلجيكا | ليتوانيا |
| 200 | `flag-italy.svg` | Italy | Ireland | Mexico | إيطاليا | أيرلندا | المكسيك |
| 200 | `flag-turkey.svg` | Turkey (accept Turkiye) | Tunisia | Azerbaijan | تركيا | تونس | أذربيجان |
| 200 | `flag-spain.svg` | Spain | Portugal | Andorra | إسبانيا | البرتغال | أندورا |
| 200 | `flag-india.svg` | India | Niger | Ireland | الهند | النيجر | أيرلندا |
| 200 | `flag-russia.svg` | Russia (accept Russian Federation) | Slovakia | Slovenia | روسيا (يُقبل: روسيا الاتحادية) | سلوفاكيا | سلوفينيا |
| 200 | `flag-uae.svg` | UAE (accept United Arab Emirates, Emirates) | Kuwait | Sudan | الإمارات العربية المتحدة (يُقبل: الإمارات) | الكويت | السودان |
| 200 | `flag-morocco.svg` | Morocco | Vietnam | Tunisia | المغرب | فيتنام | تونس |
| 200 | `flag-argentina.svg` | Argentina | Uruguay | Nicaragua | الأرجنتين | الأوروغواي | نيكاراغوا |
| 300 | `flag-mexico.svg` | Mexico | Italy | Iran | المكسيك | إيطاليا | إيران |
| 300 | `flag-greece.svg` | Greece | Uruguay | Finland | اليونان | الأوروغواي | فنلندا |
| 300 | `flag-switzerland.svg` | Switzerland | Denmark | Georgia | سويسرا | الدنمارك | جورجيا |
| 300 | `flag-portugal.svg` | Portugal | Spain | Brazil | البرتغال | إسبانيا | البرازيل |
| 300 | `flag-sweden.svg` | Sweden | Finland | Iceland | السويد | فنلندا | آيسلندا |
| 300 | `flag-netherlands.svg` | Netherlands (accept Holland) | Luxembourg | Russia | هولندا | لوكسمبورغ | روسيا |
| 300 | `flag-qatar.svg` | Qatar | Bahrain | Latvia | قطر | البحرين | لاتفيا |
| 300 | `flag-kuwait.svg` | Kuwait | UAE | Jordan | الكويت | الإمارات العربية المتحدة | الأردن |
| 300 | `flag-norway.svg` | Norway | Iceland | Denmark | النرويج | آيسلندا | الدنمارك |
| 400 | `flag-south-korea.svg` | South Korea (accept Republic of Korea) | Japan | North Korea | كوريا الجنوبية | اليابان | كوريا الشمالية |
| 400 | `flag-lebanon.svg` | Lebanon | Austria | Canada | لبنان | النمسا | كندا |
| 400 | `flag-kenya.svg` | Kenya | South Sudan | Malawi | كينيا | جنوب السودان | مالاوي |
| 400 | `flag-algeria.svg` | Algeria | Pakistan | Mauritania | الجزائر | باكستان | موريتانيا |
| 400 | `flag-nigeria.svg` | Nigeria | Pakistan | Ivory Coast | نيجيريا | باكستان | ساحل العاج |
| 400 | `flag-belgium.svg` | Belgium | Germany | Romania | بلجيكا | ألمانيا | رومانيا |
| 400 | `flag-denmark.svg` | Denmark | Switzerland | Norway | الدنمارك | سويسرا | النرويج |
| 400 | `flag-colombia.svg` | Colombia | Ecuador | Venezuela | كولومبيا | الإكوادور | فنزويلا |
| 400 | `flag-south-africa.svg` | South Africa | Jamaica | Guyana | جنوب أفريقيا | جامايكا | غيانا |
| 500 | `flag-jordan.svg` | Jordan | Palestine | Sudan | الأردن | فلسطين | السودان |
| 500 | `flag-vietnam.svg` | Vietnam (accept Viet Nam) | China | Morocco | فيتنام | الصين | المغرب |
| 500 | `flag-pakistan.svg` | Pakistan | Algeria | Mauritania | باكستان | الجزائر | موريتانيا |
| 500 | `flag-iraq.svg` | Iraq | Yemen | Egypt | العراق | اليمن | مصر |
| 500 | `flag-jamaica.svg` | Jamaica | South Africa | Tanzania | جامايكا | جنوب أفريقيا | تنزانيا |
| 500 | `flag-finland.svg` | Finland | Sweden | Iceland | فنلندا | السويد | آيسلندا |
| 500 | `flag-cuba.svg` | Cuba | Chile | Philippines | كوبا | تشيلي | الفلبين |
| 500 | `flag-chile.svg` | Chile | Cuba | Liberia | تشيلي | كوبا | ليبيريا |
| 600 | `flag-bhutan.svg` | Bhutan | Nepal | Sri Lanka | بوتان | نيبال | سريلانكا |
| 600 | `flag-nepal.svg` | Nepal | Bhutan | Sri Lanka | نيبال | بوتان | سريلانكا |
| 600 | `flag-sri-lanka.svg` | Sri Lanka | Bhutan | India | سريلانكا | بوتان | الهند |
| 600 | `flag-kazakhstan.svg` | Kazakhstan | Kyrgyzstan | Uzbekistan | كازاخستان | قيرغيزستان | أوزبكستان |
| 600 | `flag-brunei.svg` | Brunei (accept Brunei Darussalam) | Malaysia | Bhutan | بروناي (يُقبل: بروناي دار السلام) | ماليزيا | بوتان |
| 600 | `flag-mongolia.svg` | Mongolia | Kazakhstan | Kyrgyzstan | منغوليا | كازاخستان | قيرغيزستان |
| 600 | `flag-kyrgyzstan.svg` | Kyrgyzstan (accept Kyrgyz Republic, Kirghizia) | Kazakhstan | China | قيرغيزستان (يُقبل: قرغيزستان) | كازاخستان | الصين |
| 600 | `flag-laos.svg` | Laos (accept Lao PDR) | Thailand | Cambodia | لاوس | تايلاند | كمبوديا |
| 600 | `flag-turkmenistan.svg` | Turkmenistan | Uzbekistan | Azerbaijan | تركمانستان | أوزبكستان | أذربيجان |

## Food & Drink

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | Which popular Egyptian street dish mixes rice, macaroni and chickpeas, topped with spicy tomato sauce and crispy fried onions? | Koshari (accept koshary, kushari) | Megadara | Hawawshi | الكشري | المجدرة | الحواوشي |
| 100 | What is the name of Egypt's classic breakfast dish of slow-cooked fava beans, usually eaten with oil, cumin and baladi bread? | Ful medames (accept ful, foul) | Bessara | Shakshuka | الفول المدمس (يُقبل: الفول) | البصارة | الشكشوكة |
| 100 | Which Italian dish is a flat round of dough baked with tomato and cheese on top, with the Margherita as its classic version? | Pizza | Lasagne | Calzone | البيتزا | اللازانيا | الكالزوني |
| 100 | Which fizzy drink was invented in 1886 by John Pemberton, a pharmacist in Atlanta? | Coca-Cola (accept Coke) | Pepsi | Dr Pepper | كوكاكولا (يُقبل: كوكا) | بيبسي | دكتور بيبر |
| 100 | What is the name of the long, thin French loaf with a crisp golden crust? | Baguette | Brioche | Pain de campagne | الباجيت | البريوش | خبز الكامباني |
| 100 | Which deep-fried green patties, made in Egypt from crushed fava beans and fresh herbs, are a breakfast favourite tucked into baladi bread? | Ta'meya (accept taameya, falafel) | Kofta | Kobeba | الطعمية (يُقبل: الفلافل) | الكفتة | الكبيبة |
| 100 | Which dish of minced beef, shaped into a flat patty and served in a bun, takes its name from a German port city? | Hamburger (accept burger) | Frankfurter | Berliner | الهامبرجر (يُقبل: البرجر) | الفرانكفورتر | البرلينر |
| 100 | Which strong coffee is made by forcing very hot water at high pressure through finely ground beans, and is served in small "shots"? | Espresso | Cappuccino | Turkish coffee | الإسبريسو | الكابتشينو | القهوة التركي |
| 100 | Which snack is made by heating dried corn kernels until the moisture inside turns to steam and they burst into white, fluffy puffs? | Popcorn | Corn flakes | Nachos | الفشار | الكورن فليكس | الناتشوز |
| 100 | Which creamy dip is made of cooked, mashed chickpeas blended with tahini, lemon juice and garlic? | Hummus (accept hummus bi tahini) | Baba ghanoush | Labneh | الحمص بالطحينة (يُقبل: الحمص) | بابا غنوج | اللبنة |
| 200 | Which deep-red drink, served hot or iced across Egypt, is made from the dried red flowers of the roselle, a kind of hibiscus? | Karkadeh (accept karkade, hibiscus tea) | Sobia | Tamr hindi | الكركديه | السوبيا | التمر هندي |
| 200 | Which dish is made of vinegared rice with raw fish or other toppings, often rolled in a sheet of seaweed? | Sushi (accept maki) | Sashimi | Tempura | السوشي (يُقبل: ماكي) | الساشيمي | التمبورا |
| 200 | Which flaky, buttery pastry has a name that is the French word for "crescent"? | Croissant | Eclair | Brioche | الكرواسون | الإكلير | البريوش |
| 200 | Which bright yellow spice, ground from the underground stem of a plant in the ginger family, gives many curries their golden colour? | Turmeric (accept kurkum) | Saffron | Cumin | الكركم | الزعفران | الكمون |
| 200 | Which Egyptian cake is made of semolina, baked, then soaked in sweet syrup and cut into diamonds or squares? | Basbousa (accept harissa, namoura) | Konafa | Ghorayeba | البسبوسة (يُقبل: الهريسة، النمّورة) | الكنافة | الغريبة |
| 200 | Which tall, sweet grass is fed through presses in juice shops all over Egypt to make one of the country's most popular drinks? | Sugar cane (accept sugarcane) | Bamboo | Sugar beet | قصب السكر | البامبو | بنجر السكر |
| 200 | Which salty white cheese, cured in brine and often crumbled over a Greek salad, is made mainly from sheep's milk? | Feta | Halloumi | Ricotta | جبنة الفيتا | جبنة الحلوم | جبنة الريكوتا |
| 200 | Which sweet, warm spice is the dried inner bark of a tropical tree, sold ground or rolled into sticks called quills? | Cinnamon (accept cassia) | Nutmeg | Cloves | القرفة (يُقبل: الكاسيا) | جوزة الطيب | القرنفل |
| 300 | Which Egyptian dessert, often called Egyptian bread pudding, is made of pastry baked in sweet hot milk with nuts and raisins? | Om Ali (accept Umm Ali) | Roz bel-laban | Mahallabeya | أم علي | الأرز باللبن | المهلبية |
| 300 | Which Italian dessert of coffee-soaked ladyfingers and mascarpone cream has a name meaning "pick me up"? | Tiramisu | Panna cotta | Cannoli | التيراميسو | البانا كوتا | الكانولي |
| 300 | Which costly red spice is made from the dried stigmas of a crocus flower, picked by hand? | Saffron | Sumac | Paprika | الزعفران | السماق | البابريكا |
| 300 | Bubble tea, the sweet drink with chewy tapioca pearls, was created in the 1980s in which place? | Taiwan | Hong Kong | South Korea | تايوان | هونغ كونغ | كوريا الجنوبية |
| 300 | Which thick, hot milky drink, traditionally thickened with flour made from orchid tubers, is a winter favourite in Egypt, topped with nuts and raisins? | Sahlab (accept salep) | Sobia | Belila | السحلب | السوبيا | البليلة |
| 300 | Which rich custard dessert is topped with a thin, hard layer of caramelised sugar, and has a name meaning "burnt cream"? | Creme brulee (accept burnt cream) | Creme caramel | Creme anglaise | كريم بروليه | كريم كراميل | كريم أنجليز |
| 400 | Which salted and fermented grey mullet do Egyptians traditionally eat on the spring holiday of Sham El Nessim? | Fesikh (accept feseekh) | Renga | Batarekh | الفسيخ | الرنجة | البطارخ |
| 400 | Which salty cheese from Cyprus is firm enough to be grilled or fried without melting? | Halloumi (accept hellim) | Feta | Akkawi | الحلوم (الحلومي) | الفيتا | العكاوي |
| 400 | Which popular flavouring comes from the cured seed pods of a tropical climbing orchid? | Vanilla | Cardamom | Cocoa | الفانيليا | الحبهان | الكاكاو |
| 400 | Which Egyptian festive dish layers crisp bread and rice with meat and a garlic and vinegar sauce, and is traditionally eaten at Eid al-Adha? | Fattah (accept fatta, fatteh) | Roqaq | Mahshi | الفتة | الرقاق | المحشي |
| 500 | Which Egyptian dry mix of coarsely ground nuts or seeds with spices like coriander and cumin is eaten as a dip for bread? | Dukkah (accept do'a, duqqa) | Za'atar | Baharat | الدُّقة | الزعتر | البهارات |
| 500 | The word "mocha" comes from Mokha, a historic coffee-exporting port in which country? | Yemen | Ethiopia | Oman | اليمن | إثيوبيا | عُمان |
| 500 | Which flat Italian bread, often topped with olive oil and herbs, takes its name from the Latin word for "hearth"? | Focaccia | Ciabatta | Piadina | الفوكاتشا | الشاباتا | البيادينا |
| 500 | What is the name of young green wheat that is roasted over fire, rubbed and often cracked, and is used in Egypt as a stuffing for pigeons? | Freekeh (accept frik, farik) | Bulgur | Couscous | الفريك | البرغل | الكسكسي |
| 500 | What is the name of the scale, devised by a pharmacist in 1912, that measures how hot chilli peppers are? | The Scoville scale (accept Scoville heat units, SHU) | The Brix scale | The Mohs scale | مقياس سكوفيل | مقياس بريكس | مقياس موس |
| 600 | Which Fatimid caliph of Egypt banned the eating of molokhia in the early 11th century, along with other foods? | Al-Hakim bi-Amr Allah (accept al-Hakim) | Al-Mu'izz li-Din Allah | Al-Mustansir Billah | الحاكم بأمر الله | المعز لدين الله | المستنصر بالله |
| 600 | The Caesar salad is named after the restaurant owner Caesar Cardini. In which Mexican city was it created, in the 1920s? | Tijuana | Ensenada | Guadalajara | تيخوانا | إنسينادا | غوادالاخارا |
| 600 | Earl Grey tea is flavoured with the oil of which citrus fruit? | Bergamot (accept bergamot orange) | Lemon | Grapefruit | البرغموت | الليمون | الجريب فروت |
| 600 | Which starchy root vegetable do Egyptian Copts traditionally eat at the feast of the Epiphany (Eid El Ghitas), cooked in a green sauce of chard and coriander? | Taro (accept qolqas, colocasia) | Sweet potato | Turnip | القلقاس | البطاطا | اللفت |

## Gen Z

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | Which short-video app is famous for its endless "For You" page? | TikTok | Instagram | Triller | تيك توك | إنستغرام | تريلر |
| 100 | In Netflix's "Squid Game", what is the first game, where players must freeze when the giant doll turns around? | Red Light, Green Light | Tug of War | Dalgona Candy | الضوء الأحمر، الضوء الأخضر | شد الحبل | حلوى الدالغونا |
| 100 | Which block-building video game, fully released in 2011, has players mine resources and avoid exploding Creepers? | Minecraft | Terraria | Roblox | ماينكرافت | تيراريا | روبلوكس |
| 100 | In Gen Z slang, what does "no cap" mean? | No lie (accept for real, honestly) | No problem | No way | بدون كذب (يُقبل: بجد، بصراحة) | لا مشكلة | مستحيل |
| 100 | Which social media app has a ghost as its logo and is known for disappearing messages? | Snapchat | Instagram | WhatsApp | سناب شات | إنستغرام | واتساب |
| 100 | On Snapchat, what are the AI face effects called that can give you dog ears or change your face? | Lenses (accept filters) | Stickers | Bitmojis | العدسات (Lenses) (يُقبل: الفلاتر) | الملصقات (Stickers) | البيتموجي (Bitmojis) |
| 100 | What do TikTok users call the AI system that decides which videos appear on their "For You" page? | The algorithm | The chatbot | The cloud | الخوارزمية | روبوت الدردشة | السحابة |
| 100 | In Gen Z slang, made popular by the game "Among Us", what does calling someone "sus" mean? | Suspicious (accept suspect, shady) | Superb | Sensitive | مشبوه (يُقبل: مريب) | رائع | حساس |
| 100 | Which Colombian singer performed "Waka Waka (This Time for Africa)", the official song of the 2010 FIFA World Cup? | Shakira | Karol G | Fanny Lu | شاكيرا | كارول جي | فاني لو |
| 100 | Which cartoon character lives in a pineapple under the sea in Bikini Bottom? | SpongeBob SquarePants (accept SpongeBob) | Patrick Star | Squidward Tentacles | سبونج بوب | بسيط (باتريك) | شفيق (سكويدوارد) |
| 100 | Which online platform lets players create and play millions of games, and uses a currency called Robux? | Roblox | Fortnite | Minecraft | روبلوكس (Roblox) | فورتنايت (Fortnite) | ماينكرافت (Minecraft) |
| 100 | What is the # symbol called when it is used to tag a topic on social media? | A hashtag | A mention | A keyword | هاشتاج (وسم) | منشن (إشارة) | كلمة مفتاحية |
| 200 | In the game "Among Us", a hit in 2020, what are the players who secretly sabotage the crew called? | Impostors | Crewmates | Ghosts | المحتالون (Impostors) | أفراد الطاقم (Crewmates) | الأشباح (Ghosts) |
| 200 | Which slang word, short for "charisma", was named Oxford's Word of the Year in 2023? | Rizz | Drip | Slay | Rizz (ريز) | Drip (دريب) | Slay (سلاي) |
| 200 | Which American singer released the album "When We All Fall Asleep, Where Do We Go?" in 2019? | Billie Eilish | Olivia Rodrigo | Ariana Grande | بيلي آيليش | أوليفيا رودريغو | أريانا غراندي |
| 200 | Which Netflix series follows a group of kids in Hawkins, Indiana, who face the monsters of the Upside Down? | Stranger Things | The Umbrella Academy | Locke & Key | أشياء غريبة (Stranger Things) | أكاديمية المظلة (The Umbrella Academy) | مفتاح لوك (Locke & Key) |
| 200 | Which battle royale game by Epic Games, released in 2017, drops 100 players from a flying "Battle Bus"? | Fortnite | Apex Legends | PUBG | فورتنايت | أبيكس ليجندز | ببجي |
| 200 | In 2025, social media filled up with AI pictures of people drawn in the style of which Japanese animation studio? | Studio Ghibli | Toei Animation | Kyoto Animation | استوديو جيبلي | توي أنيميشن | كيوتو أنيميشن |
| 200 | Which language-learning app, with a green owl mascot, uses AI to personalise your lessons? | Duolingo | Babbel | Memrise | دولينجو | بابل | ميمرايز |
| 200 | In video captions like "POV: you are the new kid at school", what does "POV" stand for? | Point of view | Proof of video | Person on video | وجهة النظر (Point of view) | إثبات بالفيديو (Proof of video) | شخص في الفيديو (Person on video) |
| 200 | In the 2022 Netflix series, which daughter of the Addams family solves a murder mystery at Nevermore Academy? | Wednesday (accept Wednesday Addams) | Morticia | Enid | وينزداي (وينزداي آدامز) | مورتيشيا | إينيد |
| 200 | In which endless-running phone game does a graffiti artist dash along train tracks to escape an inspector and his dog? | Subway Surfers | Temple Run | Jetpack Joyride | صب واي سيرفرس (Subway Surfers) | تمبل رن (Temple Run) | جت باك جوي رايد (Jetpack Joyride) |
| 200 | Which small three-armed spinning toy was the must-have school craze of 2017? | The fidget spinner | The Beyblade | The fidget cube | الفيدجت سبينر (Fidget spinner) | البي بليد (Beyblade) | الفيدجت كيوب (Fidget cube) |
| 300 | Which video app, shut down in 2017, limited clips to just six seconds? | Vine | Musical.ly | Periscope | فاين (Vine) | ميوزيكلي (Musical.ly) | بيريسكوب (Periscope) |
| 300 | Which 2016 mobile game had people walking around outside to catch creatures using augmented reality? | Pokemon Go | Ingress | Harry Potter: Wizards Unite | بوكيمون غو | إنغريس | هاري بوتر: ويزاردز يونايت |
| 300 | Which live-streaming platform, popular with gamers, was bought by Amazon in 2014? | Twitch | Mixer | Kick | تويتش | ميكسر | كيك |
| 300 | Which 2016 viral challenge had people freeze in place like statues while a camera moved around them? | The Mannequin Challenge | The Ice Bucket Challenge | The Bottle Flip Challenge | تحدي المانيكان | تحدي دلو الثلج | تحدي قلب الزجاجة |
| 300 | In 2023, the viral song "Heart on My Sleeve" used AI to fake the voices of The Weeknd and which Canadian rapper? | Drake | Tory Lanez | Nav | دريك | توري لينز | ناف |
| 300 | In slang, if someone tells you to "spill the tea", what do they want you to share? | Gossip (accept the latest news, the secrets, the truth) | Advice | Compliments | النميمة وآخر الأخبار (يُقبل: الأسرار، الحقيقة) | النصائح | المجاملات |
| 300 | Which 2012 song by PSY, famous for its horse-riding dance, became the first YouTube video to reach one billion views? | Gangnam Style | Gentleman | Daddy | جانجنام ستايل (Gangnam Style) | جنتلمان (Gentleman) | دادي (Daddy) |
| 300 | Which anime ninja in an orange outfit dreams of becoming Hokage, the leader of the Hidden Leaf Village? | Naruto (accept Naruto Uzumaki) | Sasuke | Boruto | ناروتو (ناروتو أوزوماكي) | ساسكي | بوروتو |
| 300 | In slang, what does "GOAT" stand for, as in "he is the GOAT"? | Greatest of all time | Greatest of all teams | Good on any team | الأعظم على مر العصور (Greatest of all time) | الأعظم بين كل الفرق (Greatest of all teams) | جيد في أي فريق (Good on any team) |
| 300 | In the phone game "Angry Birds", which animals steal the birds' eggs? | Pigs (accept green pigs, the Bad Piggies) | Snakes | Monkeys | الخنازير (يُقبل: الخنازير الخضراء) | الثعابين | القرود |
| 300 | Which toothy little monster doll, sold in surprise "blind boxes" by Pop Mart, became a worldwide craze in 2025? | Labubu | Molly | Crybaby | لابوبو (Labubu) | مولي (Molly) | كراي بيبي (Crybaby) |
| 400 | In Gen Z slang, what does it mean to be "ghosted"? | Someone suddenly stopped replying and cut off contact without explanation | Someone kept viewing your stories but never messaged you | Someone came back into your life after months of silence | أن يتوقف شخص فجأة عن الرد ويقطع التواصل دون تفسير | أن يتابع شخص قصصك باستمرار دون أن يراسلك أبدًا | أن يعود شخص إلى حياتك فجأة بعد أشهر من الصمت |
| 400 | In 2015, a photo of a dress split the internet. Some saw it as blue and black. Which colours did the others see? | White and gold | Pink and silver | Green and gold | أبيض وذهبي | وردي وفضي | أخضر وذهبي |
| 400 | Which YouTuber, born Jimmy Donaldson, is known for giant giveaways and expensive stunts? | MrBeast | PewDiePie | Logan Paul | مستر بيست | بيوديباي | لوجان بول |
| 400 | Which singer's "Eras Tour" ran around the world from 2023 to 2024? | Taylor Swift | Beyonce | Dua Lipa | تايلور سويفت | بيونسيه | دوا ليبا |
| 400 | What does the slang term "FOMO" stand for? | Fear of missing out | Fear of messing up | Fear of moving on | الخوف من تفويت الشيء (Fear of missing out) | الخوف من ارتكاب الأخطاء (Fear of messing up) | الخوف من المضي قدمًا (Fear of moving on) |
| 400 | What is the name of the computer-generated Instagram influencer known as "Lil ___"? | Miquela (accept Lil Miquela) | Bermuda | Shudu | ميكيلا (يُقبل: ليل ميكيلا) | برمودا | شودو |
| 400 | Which band released "Now and Then" in 2023, using AI to clean up an old recording of John Lennon's voice? | The Beatles | The Rolling Stones | The Beach Boys | البيتلز | الرولينج ستونز | البيتش بويز |
| 400 | Which hugely addictive 2013 phone game, where you tap to fly a bird between green pipes, was pulled from app stores by its creator in 2014? | Flappy Bird | Tiny Wings | Doodle Jump | فلابي بيرد (Flappy Bird) | تايني وينجز (Tiny Wings) | دودل جمب (Doodle Jump) |
| 400 | In 2015, Oxford Dictionaries chose an emoji instead of a word as its Word of the Year. Which emoji was it? | Face with Tears of Joy (accept the laughing-crying emoji) | Red Heart | Smiling Face with Heart-Eyes | الوجه الضاحك بدموع الفرح 😂 | القلب الأحمر ❤️ | الوجه المبتسم بعيون على شكل قلب 😍 |
| 400 | In Gen Z slang, if someone says a film is "mid", what do they mean? | It is average or mediocre (accept so-so, meh, nothing special, not very good) | It is too long | It is the middle film of a trilogy | أنه عادي أو متوسط المستوى (يُقبل: مش قد كده، لا شيء مميز، ليس جيدًا جدًا) | أنه طويل جدًا | أنه الجزء الأوسط من ثلاثية |
| 400 | Which music streaming app, launched in Lebanon in 2012, was the first legal music streaming service in the Arab world? | Anghami | Deezer | Spotify | أنغامي (Anghami) | ديزر (Deezer) | سبوتيفاي (Spotify) |
| 400 | The viral chocolate bar that took over social media in 2024 is filled with pistachio cream and which crunchy shredded pastry? | Kunafa (accept knafeh, konafa, kataifi) | Baklava | Basbousa | الكنافة (يُقبل: عجينة الكنافة) | البقلاوة | البسبوسة |
| 500 | In 2021, Reddit users sent which video game shop's shares soaring, causing huge losses for hedge funds? | GameStop | Best Buy | RadioShack | جيم ستوب | بست باي | راديو شاك |
| 500 | From which language does the word "emoji" come? | Japanese | Chinese | Korean | اليابانية | الصينية | الكورية |
| 500 | In 2019, a photo of what plain object became the most-liked Instagram post, beating Kylie Jenner? | An egg (accept the World Record Egg) | A potato | A banana | بيضة (يُقبل: بيضة الرقم القياسي العالمي) | حبة بطاطس | موزة |
| 500 | Which Nintendo Switch game, released in March 2020, let players in lockdown build their own island village? | Animal Crossing: New Horizons (accept Animal Crossing) | Stardew Valley | Story of Seasons: Pioneers of Olive Town | Animal Crossing: New Horizons (يُقبل: Animal Crossing) | Stardew Valley | Story of Seasons: Pioneers of Olive Town |
| 500 | Which two-word phrase became a 2019 meme used to dismiss the opinions of older people? | OK boomer | OK zoomer | Hey grandpa | OK boomer (أوكي بومر) | OK zoomer (أوكي زومر) | Hey grandpa (هاي جراندبا) |
| 500 | Which website, hugely popular with teens, lets you chat with AI versions of fictional characters and famous people? | Character.AI | Replika | Talkie | Character.AI (كاراكتر إيه آي) | Replika (ريبليكا) | Talkie (توكي) |
| 500 | What is the name of the 2025 meme trend full of absurd AI-made creatures like "Tralalero Tralala" and "Ballerina Cappuccina"? | Italian brainrot | Skibidi Toilet | Weirdcore | Italian brainrot (البرين روت الإيطالي) | Skibidi Toilet (سكيبيدي تواليت) | Weirdcore (ويردكور) |
| 500 | What name is given to the Egyptian street-music style, full of auto-tune and electronic beats, made famous by songs like "Bent El Geran"? | Mahraganat (accept mahragan, electro-shaabi) | Tarab | Rai | المهرجانات | الطرب | الراي |
| 500 | On social media, what does "OOTD" stand for? | Outfit of the day | Order of the day | Opinion of the day | إطلالة اليوم (Outfit of the day) | أمر اليوم (Order of the day) | رأي اليوم (Opinion of the day) |
| 500 | What does "Despacito", the title of the 2017 hit by Luis Fonsi and Daddy Yankee, mean in English? | Slowly (accept slow, nice and slow) | Softly | Secretly | ببطء (يُقبل: على مهل، بالراحة) | بنعومة | سرًا |
| 500 | Which messaging app was founded in 2013 by the brothers Pavel and Nikolai Durov? | Telegram | Signal | Viber | تيليجرام (Telegram) | سيجنال (Signal) | فايبر (Viber) |
| 500 | In the series "Money Heist" ("La Casa de Papel"), the robbers' code names are all names of what? | Cities (accept city names) | Countries | Painters | مدن (يُقبل: أسماء مدن) | دول | رسامين |
| 600 | According to the Pew Research Center, Gen Z covers people born between which two years? | 1997 and 2012 | 1995 and 2010 | 1981 and 1996 | 1997 و2012 | 1995 و2010 | 1981 و1996 |
| 600 | What name is given to the generation that comes after Gen Z, born from the early 2010s? | Generation Alpha (accept Gen Alpha) | Generation Beta | Generation Omega | جيل ألفا | جيل بيتا | جيل أوميغا |
| 600 | Which streamer, born Tyler Blevins, set a Twitch viewer record in 2018 by playing a game with Drake? | Ninja | Shroud | TimTheTatman | نينجا | شراود | تيم ذا تاتمان |
| 600 | What does the slang abbreviation "IYKYK" stand for? | If you know, you know | If you keep, you keep | If you're kind, you're kind | إذا كنت تعرف، فأنت تعرف (If you know, you know) | إذا احتفظت، فاحتفظ (If you keep, you keep) | إذا كنت لطيفًا، فأنت لطيف (If you're kind, you're kind) |
| 600 | What is the 2025 slang term, "vibe ___", for building apps by simply describing what you want to an AI? | Vibe coding | Vibe checking | Vibe shifting | Vibe coding (البرمجة بالإحساس) | Vibe checking (فحص الأجواء) | Vibe shifting (تغيير الأجواء) |
| 600 | Spotify's AI DJ speaks with the voice of a real Spotify employee. What is his one-letter nickname? | X | J | D | X (إكس) | J (جيه) | D (دي) |
| 600 | What was the name of the 2013 viral video craze in which one masked person dances alone until the bass drops and the whole room goes wild? | The Harlem Shake | The Dougie | The Nae Nae | هارلم شيك (Harlem Shake) | دوجي (The Dougie) | ناي ناي (The Nae Nae) |
| 600 | What does the name of the battle royale game "PUBG" stand for? | PlayerUnknown's Battlegrounds (accept Player Unknown Battlegrounds) | Pro Ultimate Battle Game | Players United Battlegrounds | PlayerUnknown's Battlegrounds (ساحات معارك اللاعب المجهول) | Pro Ultimate Battle Game (لعبة المعركة الاحترافية القصوى) | Players United Battlegrounds (ساحات معارك اللاعبين المتحدين) |

## Geography

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | What is the capital city of France? | Paris | Lyon | Marseille | باريس | ليون | مرسيليا |
| 100 | Which is the largest ocean on Earth? | The Pacific Ocean | The Atlantic Ocean | The Indian Ocean | المحيط الهادئ | المحيط الأطلسي | المحيط الهندي |
| 100 | Which is the largest hot desert in the world? | The Sahara | The Arabian Desert | The Kalahari | الصحراء الكبرى | الصحراء العربية | صحراء كالاهاري |
| 100 | Which U.S. state is made up entirely of islands? | Hawaii | Alaska | Florida | هاواي | ألاسكا | فلوريدا |
| 100 | In which mountain range is Mount Everest? | The Himalayas | The Karakoram | The Andes | جبال الهيمالايا | جبال كاراكورام | جبال الأنديز |
| 100 | What is the capital city of Egypt? | Cairo | Alexandria | Giza | القاهرة | الإسكندرية | الجيزة |
| 100 | The K-pop group BTS comes from which country? | South Korea | Japan | China | كوريا الجنوبية | اليابان | الصين |
| 100 | In which country was the 2022 FIFA World Cup held? | Qatar | Russia | Saudi Arabia | قطر | روسيا | المملكة العربية السعودية |
| 100 | Which country is home to most of the biggest AI companies, such as OpenAI, Google and Microsoft? | The United States | The United Kingdom | China | الولايات المتحدة الأمريكية | المملكة المتحدة | الصين |
| 100 | In which country is the Henn na Hotel, famous for its robot receptionists, including dinosaurs? | Japan | South Korea | China | اليابان | كوريا الجنوبية | الصين |
| 100 | Which is the longest river in Africa? | The Nile | The Congo | The Niger | نهر النيل | نهر الكونغو | نهر النيجر |
| 100 | What is the capital city of Lebanon? | Beirut | Tripoli | Sidon | بيروت | طرابلس | صيدا |
| 100 | Which famous copper statue, holding a torch high, has stood in New York Harbor since 1886? | The Statue of Liberty | The Columbus Monument | The Charging Bull | تمثال الحرية | نصب كولومبوس التذكاري | تمثال الثور الهائج |
| 100 | Which is the second largest ocean on Earth? | The Atlantic Ocean | The Indian Ocean | The Southern Ocean | المحيط الأطلسي | المحيط الهندي | المحيط الجنوبي |
| 100 | In which city is the Kaaba, the holiest site in Islam? | Mecca (accept Makkah) | Medina | Jerusalem | مكة المكرمة | المدينة المنورة | القدس |
| 200 | Which is the longest river in South America? | The Amazon | The Parana | The Orinoco | الأمازون | بارانا | أورينوكو |
| 200 | Reykjavik is the capital city of which island country? | Iceland | Ireland | Malta | آيسلندا | أيرلندا | مالطا |
| 200 | Which narrow strait separates Spain from Africa? | The Strait of Gibraltar | The Strait of Messina | The Strait of Hormuz | مضيق جبل طارق | مضيق مسينا | مضيق هرمز |
| 200 | Which is the coldest, driest and windiest continent on Earth? | Antarctica | Australia | Asia | القارة القطبية الجنوبية (أنتاركتيكا) | أستراليا | آسيا |
| 200 | Which sea forms Egypt's northern coast? | The Mediterranean Sea | The Red Sea | The Black Sea | البحر الأبيض المتوسط | البحر الأحمر | البحر الأسود |
| 200 | The hit series "Money Heist" ("La Casa de Papel") comes from which country? | Spain | Mexico | Argentina | إسبانيا | المكسيك | الأرجنتين |
| 200 | Which city hosted the 2012 Summer Olympics? | London | Beijing | Rio de Janeiro | لندن | بكين | ريو دي جانيرو |
| 200 | In 2017, the humanoid robot Sophia was given citizenship by which country? | Saudi Arabia | The United Arab Emirates | Japan | المملكة العربية السعودية | الإمارات العربية المتحدة | اليابان |
| 200 | OpenAI and Anthropic both have their headquarters in which US city, famous for the Golden Gate Bridge? | San Francisco | San Jose | Los Angeles | سان فرانسيسكو | سان خوسيه | لوس أنجلوس |
| 200 | Which famous waterfalls lie on the border between the US state of New York and the Canadian province of Ontario? | Niagara Falls | Montmorency Falls | Yosemite Falls | شلالات نياجرا | شلالات مونمورنسي | شلالات يوسميتي |
| 200 | Which sea lies between northeast Africa and the Arabian Peninsula, with resorts such as Hurghada and Sharm El Sheikh? | The Red Sea | The Arabian Sea | The Mediterranean Sea | البحر الأحمر | بحر العرب | البحر الأبيض المتوسط |
| 200 | What is the capital city of the Netherlands? | Amsterdam | The Hague | Rotterdam | أمستردام | لاهاي | روتردام |
| 200 | The Burj Khalifa skyscraper stands in which city? | Dubai | Abu Dhabi | Doha | دبي | أبوظبي | الدوحة |
| 200 | Which large island country off the southeast coast of Africa is the only place where lemurs live in the wild? | Madagascar | Mauritius | Seychelles | مدغشقر | موريشيوس | سيشل |
| 300 | Which country has the largest land area in the world? | Russia | Canada | China | روسيا | كندا | الصين |
| 300 | What is the capital city of Canada? | Ottawa | Toronto | Montreal | أوتاوا | تورونتو | مونتريال |
| 300 | Counting Australia as a continent, which is the largest island in the world? | Greenland | New Guinea | Borneo | غرينلاند | غينيا الجديدة | بورنيو |
| 300 | The Rialto Bridge is a famous landmark in which Italian city? | Venice | Florence | Verona | البندقية | فلورنسا | فيرونا |
| 300 | Which salt lake (not a true sea) lets swimmers float with ease? | The Dead Sea | The Caspian Sea | The Sea of Galilee | البحر الميت | بحر قزوين | بحيرة طبريا |
| 300 | Which canal, opened in 1869, lets ships sail between Europe and Asia without going around Africa? | The Suez Canal | The Panama Canal | The Corinth Canal | قناة السويس | قناة بنما | قناة كورنث |
| 300 | Which Asian city hosted the Summer Olympics that were delayed by a year because of COVID-19? | Tokyo | Seoul | Beijing | طوكيو | سيول | بكين |
| 300 | In which Chinese city was COVID-19 first identified, in late 2019? | Wuhan | Shanghai | Guangzhou | ووهان | شنغهاي | قوانغتشو |
| 300 | DeepSeek, the AI chatbot that shook world stock markets in January 2025, comes from which country? | China | Japan | South Korea | الصين | اليابان | كوريا الجنوبية |
| 300 | In 2017, which Gulf country appointed the world's first government minister for artificial intelligence? | The United Arab Emirates (accept UAE) | Saudi Arabia | Qatar | الإمارات العربية المتحدة | المملكة العربية السعودية | قطر |
| 300 | What is the capital city of Morocco? | Rabat | Casablanca | Marrakesh | الرباط | الدار البيضاء | مراكش |
| 300 | Which is the smallest and shallowest of the world's five oceans? | The Arctic Ocean | The Southern Ocean | The Indian Ocean | المحيط المتجمد الشمالي | المحيط الجنوبي | المحيط الهندي |
| 300 | Which is the largest lake in Africa? | Lake Victoria | Lake Tanganyika | Lake Malawi | بحيرة فيكتوريا | بحيرة تنجانيقا | بحيرة ملاوي |
| 300 | Which city, once called Constantinople, stands on two continents, Europe and Asia? | Istanbul | Ankara | Izmir | إسطنبول | أنقرة | إزمير |
| 400 | Mount Fuji is located in which country? | Japan | China | South Korea | اليابان | الصين | كوريا الجنوبية |
| 400 | What is the capital city of Turkey? | Ankara | Istanbul | Izmir | أنقرة | إسطنبول | إزمير |
| 400 | Which South American country takes its name from the Spanish word for "equator"? | Ecuador | Colombia | Venezuela | الإكوادور | كولومبيا | فنزويلا |
| 400 | Table Mountain is located in which South African city? | Cape Town | Johannesburg | Durban | كيب تاون | جوهانسبرغ | ديربان |
| 400 | What is the capital city of Brazil? | Brasilia | Rio de Janeiro | Sao Paulo | برازيليا | ريو دي جانيرو | ساو باولو |
| 400 | Which city in southern Egypt is home to the Valley of the Kings and Karnak Temple? | Luxor | Aswan | Qena | الأقصر | أسوان | قنا |
| 400 | Amapiano, a dance music style that spread around the world on TikTok, comes from which country? | South Africa | Nigeria | Ghana | جنوب أفريقيا | نيجيريا | غانا |
| 400 | Climate activist Greta Thunberg comes from which Scandinavian country? | Sweden | Norway | Denmark | السويد | النرويج | الدنمارك |
| 400 | Which Indian city, often called "India's Silicon Valley", is a major centre for tech and AI companies? | Bengaluru (accept Bangalore) | Hyderabad | Chennai | بنغالورو (يُقبل: بنغالور) | حيدر أباد | تشيناي |
| 400 | What is the capital city of New Zealand? | Wellington | Auckland | Christchurch | ويلينغتون | أوكلاند | كرايستشيرش |
| 400 | Lima is the capital city of which country? | Peru | Bolivia | Chile | بيرو | بوليفيا | تشيلي |
| 500 | What is the smallest country in the world by area? | Vatican City | Monaco | San Marino | الفاتيكان | موناكو | سان مارينو |
| 500 | What is the capital city of Australia? | Canberra | Sydney | Melbourne | كانبيرا | سيدني | ملبورن |
| 500 | What is the largest country in Africa by area? | Algeria | Sudan | Libya | الجزائر | السودان | ليبيا |
| 500 | In which country is the ancient rock-cut city of Petra? | Jordan | Syria | Lebanon | الأردن | سوريا | لبنان |
| 500 | Which river flows through the city of Baghdad? | The Tigris (dijla river) | The Euphrates | The Orontes | نهر دجلة | نهر الفرات | نهر العاصي |
| 500 | Which huge man-made lake in southern Egypt, formed in the 1960s, is one of the largest of its kind in the world? | Lake Nasser | Lake Qarun | Lake Manzala | بحيرة ناصر | بحيرة قارون | بحيرة المنزلة |
| 500 | The "Black Summer" bushfires of 2019-2020 burned huge areas of which country? | Australia | Brazil | Canada | أستراليا | البرازيل | كندا |
| 500 | Which country hosted the first global AI Safety Summit, at Bletchley Park, in 2023? | The United Kingdom (accept UK, Britain) | The United States | France | المملكة المتحدة (يُقبل: بريطانيا) | الولايات المتحدة الأمريكية | فرنسا |
| 500 | Mistral AI, one of Europe's best-known AI companies, comes from which country? | France | Germany | Switzerland | فرنسا | ألمانيا | سويسرا |
| 500 | Which European river flows through four capital cities: Vienna, Bratislava, Budapest and Belgrade? | The Danube | The Rhine | The Elbe | نهر الدانوب | نهر الراين | نهر الإلبه |
| 600 | Which peninsula is the only part of Egypt that lies in Asia? | The Sinai Peninsula | The Arabian Peninsula | The Ras Banas Peninsula | شبه جزيرة سيناء | شبه الجزيرة العربية | شبه جزيرة رأس بناس |
| 600 | Which remote oasis in Egypt's Western Desert, near the Libyan border, is famous for its ancient Oracle of Amun? | Siwa Oasis | Bahariya Oasis | Farafra Oasis | واحة سيوة | واحة البحرية | واحة الفرافرة |
| 600 | What is the name of the huge depression in Egypt's Western Desert, one of the lowest points in Africa? | The Qattara Depression | The Faiyum Depression | The Kharga Depression | منخفض القطارة | منخفض الفيوم | منخفض الخارجة |
| 600 | What is the highest mountain in Egypt, near Saint Catherine's Monastery? | Mount Catherine (accept Gebel Katherina) | Mount Sinai | Mount Serbal | جبل كاترين (يُقبل: جبل كاترينا) | جبل موسى | جبل سربال |
| 600 | Which Central American country became the first to make a cryptocurrency legal tender, in 2021? | El Salvador | Panama | Guatemala | السلفادور | بنما | غواتيمالا |
| 600 | According to UN estimates, which country passed China as the most populous in the world in 2023? | India | Indonesia | Pakistan | الهند | إندونيسيا | باكستان |
| 600 | Which Asian country has the most industrial robots per factory worker in the world? | South Korea | Japan | China | كوريا الجنوبية | اليابان | الصين |
| 600 | Which African kingdom is completely surrounded by just one other country? | Lesotho | Eswatini | Botswana | ليسوتو | إسواتيني | بوتسوانا |
| 600 | Which narrow strait, whose Arabic name means "Gate of Tears", lies between the Arabian Peninsula and the Horn of Africa? | Bab el-Mandeb | The Strait of Hormuz | The Strait of Tiran | مضيق باب المندب | مضيق هرمز | مضيق تيران |
| 600 | What is the name of the vast desert in the south of the Arabian Peninsula that holds the largest continuous area of sand in the world? | The Rub al Khali (accept the Empty Quarter) | The Nafud | The Dahna | الربع الخالي | صحراء النفود | صحراء الدهناء |
| 600 | Which Asian country has the only national flag in the world that is neither a rectangle nor a square, shaped like two stacked triangular pennants? | Nepal | Bhutan | Sri Lanka | نيبال | بوتان | سريلانكا |

## History

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | In which year did World War II end? | 1945 | 1944 | 1946 | 1945 | 1944 | 1946 |
| 100 | Who was the first person to walk on the Moon? | Neil Armstrong | Buzz Aldrin | Michael Collins | نيل أرمسترونغ | باز ألدرين | مايكل كولينز |
| 100 | Which American civil rights leader gave the "I Have a Dream" speech in 1963? | Martin Luther King Jr. | Malcolm X | Jesse Jackson | مارتن لوثر كينغ الابن | مالكوم إكس | جيسي جاكسون |
| 100 | Which South African leader was freed from prison in 1990 and elected president in 1994? | Nelson Mandela | Desmond Tutu | Oliver Tambo | نيلسون مانديلا | ديزموند توتو | أوليفر تامبو |
| 100 | Which queen of Egypt had famous love affairs with Julius Caesar and Mark Antony? | Cleopatra | Nefertiti | Hatshepsut | كليوباترا | نفرتيتي | حتشبسوت |
| 100 | Which US president, elected in 2008, was the first African American to hold the office? | Barack Obama | Joe Biden | Bill Clinton | باراك أوباما | جو بايدن | بيل كلينتون |
| 100 | In 2016, the United Kingdom voted to leave which political union? | The European Union | The Commonwealth | The Eurozone | الاتحاد الأوروبي | الكومنولث | منطقة اليورو |
| 100 | In 1997, IBM's computer Deep Blue beat world champion Garry Kasparov at which board game? | Chess | Go | Checkers | الشطرنج | لعبة الغو | الداما |
| 100 | Which British codebreaker, who helped crack German codes in World War II, is often called the father of AI? | Alan Turing | Charles Babbage | Tim Berners-Lee | آلان تورينغ | تشارلز باباج | تيم بيرنرز لي |
| 100 | Which artist painted the "Mona Lisa"? | Leonardo da Vinci | Michelangelo | Raphael | ليوناردو دا فينشي | مايكل أنجلو | رافائيل |
| 100 | Which famous iron tower was built for the 1889 World's Fair? | The Eiffel Tower | The Blackpool Tower | The Tokyo Tower | برج إيفل | برج بلاكبول | برج طوكيو |
| 100 | Which famous ancient monument at Giza has the body of a lion and the head of a human? | The Great Sphinx (accept the Sphinx) | The Great Pyramid | The Colossi of Memnon | تمثال أبو الهول | الهرم الأكبر | تمثالا ممنون |
| 100 | Who led Germany's Nazi Party and ruled the country during World War II? | Adolf Hitler | Heinrich Himmler | Hermann Goering | أدولف هتلر | هاينريش هيملر | هيرمان غورينغ |
| 200 | Who was the first President of the United States? | George Washington | John Adams | Thomas Jefferson | جورج واشنطن | جون آدامز | توماس جيفرسون |
| 200 | Which French emperor was defeated at the Battle of Waterloo in 1815? | Napoleon Bonaparte | Charlemagne | Louis XIV | نابليون بونابرت | شارلمان | لويس الرابع عشر |
| 200 | Who was the British Prime Minister for most of World War II? | Winston Churchill | Neville Chamberlain | Clement Attlee | ونستون تشرشل | نيفيل تشامبرلين | كليمنت أتلي |
| 200 | Which Roman city was buried by the eruption of Mount Vesuvius in AD 79? | Pompeii (accept Herculaneum) | Ostia | Ravenna | بومبي (يُقبل: هيركولانيوم) | أوستيا | رافينا |
| 200 | Which boy pharaoh's almost untouched tomb was found by Howard Carter in 1922? | Tutankhamun (accept King Tut) | Ramesses II | Thutmose III | توت عنخ آمون | رمسيس الثاني | تحتمس الثالث |
| 200 | Which famous Gothic cathedral lost its spire in a fire in April 2019? | Notre-Dame (accept Notre-Dame de Paris) | Cologne Cathedral | Westminster Abbey | نوتردام (يُقبل: نوتردام دو باري) | كاتدرائية كولونيا | كنيسة وستمنستر |
| 200 | Which British queen died in 2022 after more than 70 years on the throne? | Queen Elizabeth II | Queen Victoria | Queen Anne | الملكة إليزابيث الثانية | الملكة فيكتوريا | الملكة آن |
| 200 | Which stone slab, found in Egypt in 1799, carries the same decree in three scripts and helped unlock ancient Egyptian writing? | The Rosetta Stone | The Palermo Stone | The Narmer Palette | حجر رشيد | حجر باليرمو | لوحة نارمر |
| 200 | Which leader used non-violent protest, including the 1930 Salt March, to fight British rule in his country? | Mahatma Gandhi (accept Mohandas Gandhi) | Jawaharlal Nehru | Subhas Chandra Bose | المهاتما غاندي | جواهر لال نهرو | سوبهاس تشاندرا بوس |
| 200 | Which Egyptian president signed a peace treaty with Israel in 1979? | Anwar Sadat (accept Mohamed Anwar El Sadat) | Gamal Abdel Nasser | Hosni Mubarak | محمد أنور السادات | جمال عبد الناصر | محمد حسني مبارك |
| 200 | Which cosmonaut became the first person in space, in April 1961? | Yuri Gagarin | Alexei Leonov | Gherman Titov | يوري غاغارين | أليكسي ليونوف | غيرمان تيتوف |
| 300 | Which empire built the Colosseum? | The Roman Empire | The Ottoman Empire | The Persian Empire | الإمبراطورية الرومانية | الإمبراطورية العثمانية | الإمبراطورية الفارسية |
| 300 | In which year did Christopher Columbus first reach the Americas? | 1492 | 1498 | 1502 | 1492 | 1498 | 1502 |
| 300 | Which queen ruled the United Kingdom from 1837 to 1901? | Queen Victoria | Queen Anne | Queen Elizabeth I | الملكة فيكتوريا | الملكة آن | الملكة إليزابيث الأولى |
| 300 | In which US city was President John F. Kennedy assassinated in 1963? | Dallas | Houston | San Antonio | دالاس | هيوستن | سان أنطونيو |
| 300 | Genghis Khan founded which empire? | The Mongol Empire | The Timurid Empire | The Seljuk Empire | الإمبراطورية المغولية | الإمبراطورية التيمورية | الإمبراطورية السلجوقية |
| 300 | What name was given to the wave of protests that spread across the Middle East and North Africa from 2010 to 2012? | The Arab Spring | The Arab Revolt | The Colour Revolutions | الربيع العربي | الثورة العربية الكبرى | الثورات الملونة |
| 300 | In 2023, a fake AI picture of which religious leader wearing a white puffer jacket went viral? | Pope Francis | Pope Benedict XVI | The Dalai Lama | البابا فرنسيس | البابا بنديكت السادس عشر | الدالاي لاما |
| 300 | Which US president issued the Emancipation Proclamation in 1863? | Abraham Lincoln | Ulysses S. Grant | Andrew Johnson | أبراهام لينكولن | يوليسيس غرانت | أندرو جونسون |
| 300 | Which ancient Egyptian queen, whose name means "the beautiful one has come", is famous for her painted bust? | Nefertiti | Nefertari | Hatshepsut | نفرتيتي | نفرتاري | حتشبسوت |
| 300 | Which Caribbean country did Fidel Castro lead from 1959? | Cuba | Haiti | Jamaica | كوبا | هايتي | جامايكا |
| 300 | Which city was the target of the first atomic bomb ever used in war? | Hiroshima | Nagasaki | Osaka | هيروشيما | ناغازاكي | أوساكا |
| 300 | Which mosque in Egypt, founded in the 10th century, grew into one of the oldest universities in the world and a leading centre of Sunni Islamic learning? | Al-Azhar (accept Al-Azhar Mosque, Al-Azhar University) | Ibn Tulun Mosque | Al-Hussein Mosque | الجامع الأزهر (جامعة الأزهر) | جامع ابن طولون | مسجد الحسين |
| 300 | Which president resigned in 1974 because of the Watergate scandal? | Richard Nixon | Gerald Ford | Lyndon B. Johnson | ريتشارد نيكسون | جيرالد فورد | ليندون جونسون |
| 400 | In which year did the Berlin Wall fall? | 1989 | 1991 | 1987 | 1989 | 1991 | 1987 |
| 400 | In which year did the Titanic sink on its first voyage? | 1912 | 1911 | 1915 | 1912 | 1911 | 1915 |
| 400 | Who was the first woman to win a Nobel Prize? | Marie Curie | Florence Nightingale | Mother Teresa | ماري كوري | فلورنس نايتينجيل | الأم تيريزا |
| 400 | In which year did World War I begin? | 1914 | 1913 | 1917 | 1914 | 1913 | 1917 |
| 400 | Which pharaoh built the great rock-cut temples of Abu Simbel? | Ramesses II (accept Ramses the Great) | Thutmose III | Seti I | رمسيس الثاني (يُقبل: رمسيس الأكبر) | تحتمس الثالث | سيتي الأول |
| 400 | What is the name of the European Union law, passed in 2024, that was the world's first major law on AI? | The AI Act (accept EU AI Act) | The Digital Services Act | The Digital Markets Act | قانون الذكاء الاصطناعي (AI Act) | قانون الخدمات الرقمية | قانون الأسواق الرقمية |
| 400 | Whose expedition of 1519 to 1522 made the first voyage around the world, although he was killed on the way? | Ferdinand Magellan | Francis Drake | James Cook | فرديناند ماجلان | فرانسيس دريك | جيمس كوك |
| 400 | Which empire reached its peak under Suleiman the Magnificent in the 16th century? | The Ottoman Empire | The Safavid Empire | The Byzantine Empire | الدولة العثمانية (الإمبراطورية العثمانية) | الدولة الصفوية | الإمبراطورية البيزنطية |
| 400 | Which Greek city-state sent its King Leonidas with 300 of its soldiers to hold the pass of Thermopylae against the Persians in 480 BC? | Sparta (accept the Spartans) | Athens | Corinth | إسبرطة | أثينا | كورنثوس |
| 400 | Which general from Carthage, in what is now Tunisia, crossed the Alps with war elephants in 218 BC to invade Italy? | Hannibal (accept Hannibal Barca) | Hamilcar Barca | Hanno the Great | هانيبال (حنبعل) | هاميلكار برقة | حانون الكبير |
| 400 | Which Abbasid caliph, who ruled from 786 to 809, appears in many tales of the "One Thousand and One Nights"? | Harun al-Rashid (accept Haroun al-Rashid) | Al-Ma'mun | Al-Mansur | هارون الرشيد | المأمون | أبو جعفر المنصور |
| 400 | In which year did the Free Officers seize power in Egypt and force the king to give up his throne? | 1952 | 1948 | 1956 | 1952 | 1948 | 1956 |
| 400 | On 1 September 1939, Germany started World War II in Europe by invading which country? | Poland | Czechoslovakia | France | بولندا | تشيكوسلوفاكيا | فرنسا |
| 500 | Which Portuguese explorer was the first European to reach India by sea? | Vasco da Gama | Bartolomeu Dias | Pedro Alvares Cabral | فاسكو دا جاما | بارتولوميو دياز | بيدرو ألفاريس كابرال |
| 500 | What was the name of the first artificial satellite, launched by the Soviet Union in 1957? | Sputnik 1 (accept Sputnik) | Vostok 1 | Luna 1 | سبوتنيك 1 (يُقبل: سبوتنيك) | فوستوك 1 | لونا 1 |
| 500 | Who was the first emperor of Rome? | Augustus (accept Octavian) | Julius Caesar | Tiberius | أغسطس (يُقبل: أوكتافيان) | يوليوس قيصر | تيبيريوس |
| 500 | Which woman ruled Egypt as pharaoh for about 20 years and was often shown wearing a false beard? | Hatshepsut | Nefertiti | Nefertari | حتشبسوت | نفرتيتي | نفرتاري |
| 500 | Which British prince married Meghan Markle in 2018? | Prince Harry | Prince William | Prince Andrew | الأمير هاري | الأمير ويليام | الأمير أندرو |
| 500 | Which African country gained independence in 2011 by splitting from Sudan? | South Sudan | Eritrea | Chad | جنوب السودان | إريتريا | تشاد |
| 500 | In November 2023, which OpenAI boss was fired by the company's board and then brought back within a week? | Sam Altman | Ilya Sutskever | Mira Murati | سام ألتمان | إيليا سوتسكيفر | ميرا موراتي |
| 500 | Which 1919 treaty, signed in the Hall of Mirrors, set the peace terms for Germany after World War I? | The Treaty of Versailles | The Treaty of Trianon | The Treaty of Saint-Germain | معاهدة فرساي | معاهدة تريانون | معاهدة سان جيرمان |
| 500 | Which ancient city on the Euphrates is traditionally said to have had the Hanging Gardens, one of the Seven Wonders? | Babylon | Ur | Uruk | بابل | أور | أوروك |
| 500 | Which Arab commander led the Muslim conquest of Egypt from 639 and founded the city of Fustat? | Amr ibn al-As (accept Amr ibn al-Aas) | Khalid ibn al-Walid | Saad ibn Abi Waqqas | عمرو بن العاص | خالد بن الوليد | سعد بن أبي وقاص |
| 600 | For which pharaoh was the Great Pyramid of Giza built? | Khufu | Khafre | Menkaure | خوفو | خفرع | منقرع |
| 600 | Which ancient Egyptian architect designed the Step Pyramid at Saqqara and was later worshipped as a god of medicine? | Imhotep | Senenmut | Hemiunu | إمحوتب | سننموت | حم إيونو |
| 600 | Which pharaoh tried to replace Egypt's many gods with the worship of a single sun god, the Aten? | Akhenaten | Amenhotep III | Horemheb | إخناتون | أمنحتب الثالث | حور محب |
| 600 | Which Macedonian general took control of Egypt after the death of Alexander the Great and founded a dynasty that ruled for about 300 years? | Ptolemy I (accept Ptolemy Soter) | Seleucus I | Antigonus I | بطليموس الأول (يُقبل: بطليموس سوتر) | سلوقس الأول | أنتيغونوس الأول |
| 600 | In which country were 33 miners rescued in 2010 after 69 days trapped underground? | Chile | Peru | Bolivia | تشيلي | بيرو | بوليفيا |
| 600 | In 2018, women won the right to drive in which country? | Saudi Arabia | Kuwait | Oman | المملكة العربية السعودية | الكويت | عُمان |
| 600 | In Homer's "Iliad", which Greek god of blacksmiths built golden robot-like helpers? | Hephaestus | Hermes | Apollo | هيفايستوس | هيرميس | أبولو |
| 600 | Which Mamluk sultan of Egypt won the Battle of Ain Jalut in 1260? | Qutuz (Saif al-Din Qutuz) | Qalawun | Izz al-Din Aybak | سيف الدين قطز | قلاوون | عز الدين أيبك |
| 600 | Which French scholar announced in 1822 that he had deciphered ancient Egyptian writing? | Jean-Francois Champollion | Auguste Mariette | Gaston Maspero | جان فرانسوا شامبليون | أوغست مارييت | غاستون ماسبيرو |
| 600 | Which Egyptian army officer confronted Khedive Tawfiq at Abdeen Palace in 1881 and led the nationalist revolt that bears his name? | Ahmed Urabi (accept Orabi, Arabi Pasha) | Saad Zaghloul | Mustafa Kamil | أحمد عرابي | سعد زغلول | مصطفى كامل |

## Landmarks

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | `landmark-pyramids-giza.jpg` | The Pyramids of Giza (accept the Giza pyramids, the Pyramids) | The Step Pyramid of Djoser | The Pyramids of Meroe | أهرامات الجيزة (يُقبل: الأهرامات) | هرم زوسر المدرج | أهرامات مروي |
| 100 | `landmark-eiffel-tower.jpg` | The Eiffel Tower | The Tokyo Tower | The Blackpool Tower | برج إيفل | برج طوكيو | برج بلاكبول |
| 100 | `landmark-statue-of-liberty.jpg` | The Statue of Liberty | The Motherland Calls | The Statue of Unity | تمثال الحرية | تمثال الوطن الأم ينادي | تمثال الوحدة |
| 100 | `landmark-taj-mahal.jpg` | The Taj Mahal (accept the Taj) | Humayun's Tomb | The Bibi Ka Maqbara | تاج محل | ضريح همايون | بيبي كا مقبرة |
| 100 | `landmark-great-wall.jpg` | The Great Wall of China (accept the Great Wall) | Hadrian's Wall | The Forbidden City | سور الصين العظيم | سور هادريان | المدينة المحرمة |
| 100 | `landmark-leaning-tower-pisa.jpg` | The Leaning Tower of Pisa (accept the Tower of Pisa) | St Mark's Campanile | Giotto's Campanile | برج بيزا المائل (يُقبل: برج بيزا) | برج جرس القديس مرقس | برج جرس جوتو |
| 100 | `landmark-big-ben.jpg` | Big Ben (accept the Elizabeth Tower, the Houses of Parliament, the Palace of Westminster) | The Peace Tower | Prague Astronomical Clock | ساعة بيج بن (يُقبل: برج إليزابيث، مبنى البرلمان البريطاني، قصر وستمنستر) | برج السلام | ساعة براغ الفلكية |
| 100 | `landmark-sydney-opera-house.jpg` | The Sydney Opera House | The Lotus Temple | The Esplanade Theatres | دار أوبرا سيدني | معبد اللوتس | مسارح إسبلاناد |
| 100 | `landmark-burj-khalifa.jpg` | The Burj Khalifa | The Shanghai Tower | The Lotte World Tower | برج خليفة | برج شنغهاي | برج لوته العالمي |
| 100 | `landmark-colosseum.jpg` | The Colosseum (accept the Flavian Amphitheatre) | The Verona Arena | The Amphitheatre of El Jem | الكولوسيوم (يُقبل: مدرج فلافيان) | مدرج فيرونا | مدرج الجم |
| 100 | `landmark-christ-the-redeemer.jpg` | Christ the Redeemer | Christ the King | Christ of Havana | تمثال المسيح الفادي | تمثال المسيح الملك | تمثال مسيح هافانا |
| 100 | `landmark-white-house.jpg` | The White House | The Capitol Building | Buckingham Palace | البيت الأبيض | مبنى الكابيتول | قصر باكنغهام |
| 200 | `landmark-abu-simbel.jpg` | Abu Simbel (accept the Abu Simbel temples) | The Colossi of Memnon | Karnak Temple | معبد أبو سمبل (يُقبل: أبو سمبل) | تمثالا ممنون | معبد الكرنك |
| 200 | `landmark-cairo-tower.jpg` | The Cairo Tower | The Milad Tower | The CN Tower | برج القاهرة | برج ميلاد | برج سي إن |
| 200 | `landmark-golden-gate-bridge.jpg` | The Golden Gate Bridge | The 25 de Abril Bridge | The Brooklyn Bridge | جسر البوابة الذهبية (جولدن جيت) | جسر 25 أبريل | جسر بروكلين |
| 200 | `landmark-stonehenge.jpg` | Stonehenge | Avebury | The Carnac Stones | ستونهنج | أفبري | أحجار كارناك |
| 200 | `landmark-arc-de-triomphe.jpg` | The Arc de Triomphe (accept the Arch of Triumph) | The Arch of Constantine | The Gateway of India | قوس النصر | قوس قسطنطين | بوابة الهند |
| 200 | `landmark-acropolis.jpg` | The Acropolis (accept the Parthenon) | The Temple of Hephaestus | The Temple of Poseidon | الأكروبوليس (يُقبل: البارثينون) | معبد هيفايستوس | معبد بوسيدون |
| 200 | `landmark-tower-bridge.jpg` | Tower Bridge | London Bridge | Westminster Bridge | جسر البرج (تاور بريدج) | جسر لندن | جسر وستمنستر |
| 200 | `landmark-petra.jpg` | Petra (accept Al-Khazneh, the Treasury) | Mada'in Salih | Palmyra | البتراء (يُقبل: الخزنة) | مدائن صالح | تدمر |
| 200 | `landmark-louvre-pyramid.jpg` | The Louvre (accept the Louvre Pyramid, the Louvre Museum) | The Pompidou Centre | The Musee d'Orsay | متحف اللوفر (يُقبل: هرم اللوفر) | مركز بومبيدو | متحف أورسيه |
| 200 | Which mountain memorial in South Dakota, USA, has the giant carved faces of four US presidents? | Mount Rushmore (accept Mount Rushmore National Memorial) | Crazy Horse Memorial | Stone Mountain | جبل راشمور (يُقبل: نصب جبل راشمور الوطني) | نصب كريزي هورس | جبل ستون ماونتن |
| 300 | `landmark-muhammad-ali-mosque.jpg` | The Mosque of Muhammad Ali (accept the Alabaster Mosque, the Cairo Citadel, the Citadel of Saladin) | The Mosque of Sultan Hassan | The Blue Mosque | مسجد محمد علي (يُقبل: جامع المرمر، قلعة صلاح الدين، القلعة) | مسجد السلطان حسن | المسجد الأزرق |
| 300 | `landmark-qaitbay-citadel.jpg` | The Citadel of Qaitbay (accept Qaitbay Fort) | The Cairo Citadel | The Citadel of Aleppo | قلعة قايتباي | قلعة القاهرة | قلعة حلب |
| 300 | `landmark-bibliotheca-alexandrina.jpg` | The Bibliotheca Alexandrina (accept the Library of Alexandria) | The Cairo Opera House | The Alexandria National Museum | مكتبة الإسكندرية | دار الأوبرا المصرية | متحف الإسكندرية القومي |
| 300 | `landmark-st-basils-cathedral.jpg` | Saint Basil's Cathedral (accept St Basil's) | The Church of the Savior on Blood | The Cathedral of Christ the Saviour | كاتدرائية القديس باسيل | كنيسة المخلص على الدم المراق | كاتدرائية المسيح المخلص |
| 300 | `landmark-brandenburg-gate.jpg` | The Brandenburg Gate | The Wellington Arch | The Siegestor | بوابة براندنبورغ | قوس ويلينغتون | بوابة زيغستور |
| 300 | `landmark-sagrada-familia.jpg` | The Sagrada Familia | Cologne Cathedral | Milan Cathedral | كنيسة ساغرادا فاميليا | كاتدرائية كولونيا | كاتدرائية ميلانو |
| 300 | `landmark-trevi-fountain.jpg` | The Trevi Fountain | The Fountain of the Four Rivers | The Fountain of Neptune | نافورة تريفي | نافورة الأنهار الأربعة | نافورة نبتون |
| 300 | `landmark-marina-bay-sands.jpg` | Marina Bay Sands | Atlantis The Palm | Jewel Changi | مارينا باي ساندز | أتلانتس ذا بالم | جويل شانغي |
| 300 | `landmark-hatshepsut-temple.jpg` | The Temple of Hatshepsut (accept Deir el-Bahari) | The Ramesseum | The Temple of Edfu | معبد حتشبسوت (يُقبل: الدير البحري) | معبد الرامسيوم | معبد إدفو |
| 300 | Which kind of ancient Egyptian monument, a tall four-sided stone pillar with a pyramid-shaped tip, has stood in the Place de la Concorde in Paris since 1836? | An obelisk | A stela | A pylon | مسلة | لوحة حجرية | صرح معبد |
| 400 | `landmark-kuwait-towers.jpg` | The Kuwait Towers | The Liberation Tower | The Oriental Pearl Tower | أبراج الكويت | برج التحرير | برج اللؤلؤة الشرقية |
| 400 | `landmark-dubai-frame.jpg` | The Dubai Frame | The Grande Arche | The Gateway Arch | برواز دبي (يُقبل: إطار دبي) | قوس لا ديفانس الكبير | قوس البوابة في سانت لويس |
| 400 | `landmark-stanley-bridge.jpg` | Stanley Bridge | 6th October Bridge | Qasr El Nil Bridge | كوبري ستانلي | كوبري 6 أكتوبر | كوبري قصر النيل |
| 400 | `landmark-grand-egyptian-museum.jpg` | The Grand Egyptian Museum (accept the GEM) | The National Museum of Egyptian Civilization | The Egyptian Museum | المتحف المصري الكبير | المتحف القومي للحضارة المصرية | المتحف المصري بالتحرير |
| 400 | `landmark-alhambra.jpg` | The Alhambra | The Alcazar of Seville | The Great Mosque of Cordoba | قصر الحمراء | قصر ألكازار إشبيلية | مسجد قرطبة الكبير |
| 400 | `landmark-florence-cathedral.jpg` | Florence Cathedral (accept the Duomo, Santa Maria del Fiore) | Siena Cathedral | St Peter's Basilica | كاتدرائية فلورنسا (يُقبل: الدومو، سانتا ماريا ديل فيوري) | كاتدرائية سيينا | كاتدرائية القديس بطرس |
| 500 | `landmark-baron-empain-palace.jpg` | The Baron Empain Palace (accept Qasr El Baron, the Baron Palace) | Manial Palace | Abdeen Palace | قصر البارون (يُقبل: قصر البارون إمبان) | قصر المنيل | قصر عابدين |
| 500 | `landmark-montaza-palace.jpg` | Montaza Palace (accept the Haramlik, Montaza Gardens) | Ras El Tin Palace | Abdeen Palace | قصر المنتزه (يُقبل: الحرملك، حدائق المنتزه) | قصر رأس التين | قصر عابدين |
| 500 | `landmark-museum-of-the-future.jpg` | The Museum of the Future | The Heydar Aliyev Center | The Dubai Opera | متحف المستقبل | مركز حيدر علييف | دار أوبرا دبي |
| 500 | `landmark-kingdom-centre.jpg` | Kingdom Centre (accept Kingdom Centre Tower, Burj Al Mamlaka) | Al Faisaliah Tower | The Bahrain World Trade Center | برج المملكة (يُقبل: مركز المملكة) | برج الفيصلية | مركز البحرين التجاري العالمي |
| 500 | `landmark-hungarian-parliament.jpg` | The Hungarian Parliament Building (accept the Budapest Parliament) | The Palace of Westminster | Vienna City Hall | مبنى البرلمان المجري (يُقبل: برلمان بودابست) | قصر وستمنستر | مبنى بلدية فيينا |
| 600 | `landmark-petronas-towers.jpg` | The Petronas Towers (accept the Petronas Twin Towers) | The Emirates Towers | Taipei 101 | برجا بتروناس التوأمان | أبراج الإمارات | برج تايبيه 101 |
| 600 | `landmark-neuschwanstein.jpg` | Neuschwanstein Castle | Hohenzollern Castle | Lichtenstein Castle | قلعة نويشفانشتاين | قلعة هوهنتسولرن | قلعة ليختنشتاين |
| 600 | `landmark-louvre-abu-dhabi.jpg` | The Louvre Abu Dhabi | The Museum of Islamic Art | The National Museum of Qatar | متحف اللوفر أبوظبي | متحف الفن الإسلامي | متحف قطر الوطني |

## Movies

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | Which movie features a clownfish searching for his son? | Finding Nemo | Shark Tale | The Little Mermaid | البحث عن نيمو | حكاية قرش | حورية البحر الصغيرة |
| 100 | Which Disney animated film features a lion cub named Simba? | The Lion King | The Jungle Book | Tarzan | الأسد الملك | كتاب الأدغال | طرزان |
| 100 | What is the name of the cowboy toy in "Toy Story"? | Woody | Buzz | Rex | وودي | باز | ريكس |
| 100 | What is the name of the green ogre who stars in a 2001 DreamWorks animated film? | Shrek | Grinch | Oscar | شريك | غرينش | أوسكار |
| 100 | Which DC Comics superhero is also known as the Dark Knight? | Batman | Superman | Green Lantern | باتمان | سوبرمان | الفانوس الأخضر |
| 100 | Which 1999 action film starring Brendan Fraser is about an ancient Egyptian priest brought back to life? | The Mummy | The Scorpion King | Gods of Egypt | المومياء | الملك العقرب | آلهة مصر |
| 100 | Which 2019 Marvel film ends the Infinity Saga with the final battle against Thanos? | Avengers: Endgame | Avengers: Infinity War | Avengers: Age of Ultron | المنتقمون: نهاية اللعبة (Avengers: Endgame) | المنتقمون: حرب اللانهاية (Avengers: Infinity War) | المنتقمون: عصر ألترون (Avengers: Age of Ultron) |
| 100 | Which 2023 film starring Margot Robbie came out on the same day as "Oppenheimer"? | Barbie | Amsterdam | Wonka | باربي | أمستردام | ونكا |
| 100 | In Disney's "Big Hero 6" (2014), what is the name of the big, white, inflatable healthcare robot? | Baymax | Hiro | Wall-E | بايماكس | هيرو | وول-إي |
| 100 | Which film series features Luke Skywalker, Darth Vader and the Jedi Knights? | Star Wars | Star Trek | Dune | حرب النجوم (Star Wars) | ستار تريك (Star Trek) | كثيب (Dune) |
| 100 | In "Toy Story", what is the name of the space ranger toy who says "To infinity and beyond!"? | Buzz Lightyear | Emperor Zurg | Sheriff Woody | باز لايتيير (Buzz Lightyear) | الإمبراطور زورغ (Emperor Zurg) | الشريف وودي (Sheriff Woody) |
| 100 | Which 1992 Disney film features a street boy from Agrabah, a magic lamp and a wish-granting Genie? | Aladdin | Hercules | Mulan | علاء الدين | هرقل | مولان |
| 100 | Which Hollywood star, nicknamed "The Rock", was a famous wrestler before becoming an actor? | Dwayne Johnson | John Cena | Dave Bautista | دوين جونسون | جون سينا | ديف باتيستا |
| 200 | Who directed the movie "Jurassic Park" (1993)? | Steven Spielberg | James Cameron | George Lucas | ستيفن سبيلبرغ | جيمس كاميرون | جورج لوكاس |
| 200 | In the Harry Potter films, which school house is Harry sorted into? | Gryffindor | Ravenclaw | Hufflepuff | غريفندور | رافنكلو | هافلباف |
| 200 | Which fictional British secret agent has the code number 007? | James Bond | Johnny English | George Smiley | جيمس بوند | جوني إنجلش | جورج سمايلي |
| 200 | Which Agatha Christie mystery, filmed in 1978 and 2022, has Hercule Poirot solving a murder on an Egyptian river cruise? | Death on the Nile | Murder on the Orient Express | Evil Under the Sun | موت على النيل | جريمة في قطار الشرق السريع | شر تحت الشمس |
| 200 | In "Spider-Man: Into the Spider-Verse" (2018), what is the name of the teenage Spider-Man from Brooklyn? | Miles Morales | Peter Parker | Miguel O'Hara | مايلز موراليس | بيتر باركر | ميغيل أوهارا |
| 200 | In the "Iron Man" films, what is the name of Tony Stark's AI assistant? | JARVIS | HAL | KITT | جارفيس (JARVIS) | هال (HAL) | كيت (KITT) |
| 200 | Which 2001 Pixar film is set in a city powered by the screams of children frightened by monsters? | Monsters, Inc. | Monsters vs. Aliens | Hotel Transylvania | شركة المرعبين المحدودة (Monsters, Inc.) | وحوش ضد الفضائيين (Monsters vs. Aliens) | فندق ترانسلفانيا (Hotel Transylvania) |
| 200 | In "Game of Thrones", which character is known as the "Mother of Dragons"? | Daenerys Targaryen (accept Daenerys, Dany, Khaleesi) | Cersei Lannister | Sansa Stark | دينيريس تارغاريان (يُقبل: دينيريس، داني، الخاليسي) | سيرسي لانيستر | سانسا ستارك |
| 200 | In the Marvel films, which scientist turns into the Hulk when he gets angry? | Bruce Banner (accept Banner, Dr. Banner) | Hank Pym | Tony Stark | بروس بانر (يُقبل: بانر، الدكتور بانر) | هانك بيم | توني ستارك |
| 200 | Which actor played Jack in the 1997 film "Titanic"? | Leonardo DiCaprio (accept DiCaprio) | Brad Pitt | Matt Damon | ليوناردو دي كابريو (يُقبل: دي كابريو) | براد بيت | مات ديمون |
| 300 | In "The Matrix", which pill does Neo take? | The red pill | The blue pill | The green pill | الحبة الحمراء | الحبة الزرقاء | الحبة الخضراء |
| 300 | Which 1975 film is about a great white shark attacking swimmers at the beach town of Amity Island? | Jaws | Orca | Piranha | الفك المفترس | أوركا | بيرانا |
| 300 | Which actor played Captain Jack Sparrow in "Pirates of the Caribbean"? | Johnny Depp | Orlando Bloom | Geoffrey Rush | جوني ديب | أورلاندو بلوم | جيفري راش |
| 300 | Which actor, born to Egyptian parents, won the Best Actor Oscar for playing Freddie Mercury in "Bohemian Rhapsody"? | Rami Malek | Mena Massoud | Amr Waked | رامي مالك | مينا مسعود | عمرو واكد |
| 300 | Which 2019 film by Bong Joon-ho was the first non-English-language film to win the Oscar for Best Picture? | Parasite | Okja | Burning | طفيلي (Parasite) | أوكجا (Okja) | احتراق (Burning) |
| 300 | Which 2022 film starring Tom Cruise was the sequel to a 1986 film about Navy fighter pilots? | Top Gun: Maverick | Mission: Impossible - Fallout | Jack Reacher: Never Go Back | توب غن: مافريك | مهمة مستحيلة: السقوط | جاك ريتشر: لا عودة أبدًا |
| 300 | In which 2013 film does Joaquin Phoenix fall in love with his AI operating system, voiced by Scarlett Johansson? | Her | Joker | Transcendence | هي (Her) | جوكر (Joker) | التسامي (Transcendence) |
| 300 | Which 2023 horror film is about a lifelike AI doll that becomes dangerously protective of a young girl? | M3GAN | Annabelle | Child's Play | ميغان (M3GAN) | أنابيل (Annabelle) | لعبة طفل (Child's Play) |
| 300 | Which Australian actor won a posthumous Oscar for playing the Joker in a 2008 film? | Heath Ledger | Hugh Jackman | Russell Crowe | هيث ليدجر | هيو جاكمان | راسل كرو |
| 300 | Which director made "Inception" (2010), "Interstellar" (2014) and "Oppenheimer" (2023)? | Christopher Nolan | Denis Villeneuve | Ridley Scott | كريستوفر نولان | دوني فيلنوف | ريدلي سكوت |
| 300 | In the series "Ted Lasso", which single word is written on the yellow sign that Ted hangs in the team's locker room? | Believe | Hope | Courage | Believe (آمِن) | Hope (أمل) | Courage (شجاعة) |
| 300 | What is the name of Superman's home planet? | Krypton | Daxam | Xandar | كريبتون | داكسام | زاندار |
| 300 | In "Kung Fu Panda", what is the name of the clumsy panda who becomes the Dragon Warrior? | Po | Ping | Shifu | بو | بينغ | شيفو |
| 400 | What is the name of the hidden African nation that is home to Black Panther? | Wakanda | Zamunda | Wadiya | واكاندا | زاموندا | واديا |
| 400 | Who directed "Pulp Fiction" (1994)? | Quentin Tarantino | Martin Scorsese | Guy Ritchie | كوينتن تارانتينو | مارتن سكورسيزي | غاي ريتشي |
| 400 | Which Egyptian comedy star, nicknamed "El Zaeem" (The Leader), starred in "Terrorism and Kebab" (1992)? | Adel Imam | Mohamed Henedy | Ahmed Zaki | عادل إمام | محمد هنيدي | أحمد زكي |
| 400 | Which actor played Peter Parker in "Spider-Man: Homecoming" (2017)? | Tom Holland | Andrew Garfield | Tobey Maguire | توم هولاند | أندرو غارفيلد | توبي ماغواير |
| 400 | In "The Hunger Games" films, which actress plays Katniss Everdeen? | Jennifer Lawrence | Emma Stone | Shailene Woodley | جينيفر لورانس | إيما ستون | شايلين وودلي |
| 400 | Which actress played Hermione Granger in all eight Harry Potter films? | Emma Watson | Bonnie Wright | Evanna Lynch | إيما واتسون | بوني رايت | إيفانا لينش |
| 400 | In "Game of Thrones", which rich and powerful family has a golden lion as its sigil? | House Lannister (accept the Lannisters, Lannister) | House Baratheon | House Tyrell | آل لانيستر (يُقبل: لانيستر، عائلة لانيستر) | آل باراثيون | آل تايرل |
| 400 | Which actor played Steve Rogers, also known as Captain America, in the Marvel films? | Chris Evans | Chris Hemsworth | Chris Pratt | كريس إيفانز | كريس هيمسورث | كريس برات |
| 400 | Which "Fast and Furious" star, who played Brian O'Conner, died in a car crash in 2013? | Paul Walker | Vin Diesel | Tyrese Gibson | بول ووكر | فين ديزل | تايريس جيبسون |
| 400 | In the sitcom "Friends", what is the name of the coffee shop where the friends hang out? | Central Perk | Monk's Cafe | MacLaren's | سنترال بيرك (Central Perk) | مونكس كافيه (Monk's Cafe) | ماكلارينز (MacLaren's) |
| 400 | What is the name of the hobbit played by Elijah Wood in "The Lord of the Rings"? | Frodo Baggins | Samwise Gamgee | Bilbo Baggins | فرودو باغينز | سام وايز غامجي | بيلبو باغينز |
| 500 | Which Egyptian film director received a lifetime achievement award at the Cannes Film Festival in 1997? | Youssef Chahine | Salah Abu Seif | Henry Barakat | يوسف شاهين | صلاح أبو سيف | هنري بركات |
| 500 | Which multiverse film starring Michelle Yeoh won the Oscar for Best Picture in 2023? | Everything Everywhere All at Once | The Banshees of Inisherin | Doctor Strange in the Multiverse of Madness | كل شيء في كل مكان في آن واحد (Everything Everywhere All at Once) | جنيات إينيشيرين (The Banshees of Inisherin) | دكتور سترينج في أكوان الجنون المتعددة |
| 500 | Which 2014 film, starring Alicia Vikander as the robot Ava, won the Oscar for Best Visual Effects? | Ex Machina | Chappie | Automata | إكس ماكينا (Ex Machina) | تشابي (Chappie) | أوتوماتا (Automata) |
| 500 | Which 2001 Steven Spielberg film follows David, a robot boy who wants to become a real boy? | A.I. Artificial Intelligence (accept A.I.) | Minority Report | Bicentennial Man | الذكاء الاصطناعي (A.I. Artificial Intelligence) | تقرير الأقلية (Minority Report) | رجل المئتي عام (Bicentennial Man) |
| 500 | Which actor played Superman in "Man of Steel" (2013)? | Henry Cavill | Brandon Routh | David Corenswet | هنري كافيل | براندون راوث | ديفيد كورنزويت |
| 500 | In the series "Ted Lasso", which club hires Ted as its new manager? | AFC Richmond (accept Richmond) | AFC Wimbledon | West Ham United | إيه إف سي ريتشموند (يُقبل: ريتشموند) | إيه إف سي ويمبلدون | وست هام يونايتد |
| 500 | Which TV chemistry teacher, played by Bryan Cranston, becomes a drug lord under the name "Heisenberg"? | Walter White (accept Walt, Mr. White) | Jesse Pinkman | Saul Goodman | والتر وايت (يُقبل: والت، مستر وايت) | جيسي بينكمان | سول غودمان |
| 600 | Which Egyptian actor was Oscar-nominated for playing Sherif Ali in "Lawrence of Arabia"? | Omar Sharif | Ahmed Mazhar | Rushdy Abaza | عمر الشريف | أحمد مظهر | رشدي أباظة |
| 600 | Which Egyptian actress was known as the "Lady of the Arabic Screen"? | Faten Hamama | Hind Rostom | Nadia Lutfi | فاتن حمامة | هند رستم | نادية لطفي |
| 600 | Which Egyptian singer and film star of the 1950s and 60s was nicknamed "The Dark-Skinned Nightingale"? | Abdel Halim Hafez | Farid al-Atrash | Mohamed Abdel Wahab | عبد الحليم حافظ | فريد الأطرش | محمد عبد الوهاب |
| 600 | Which Egyptian actress was known as the "Cinderella of Arabic Cinema"? | Soad Hosny | Mervat Amin | Naglaa Fathi | سعاد حسني | ميرفت أمين | نجلاء فتحي |
| 600 | In "Game of Thrones", the gentle giant Hodor only ever says "Hodor". Which short phrase, shouted in a famous scene, did the name come from? | Hold the door | Hold the gate | Hold the line | Hold the door (أمسِك الباب) | Hold the gate (أمسِك البوابة) | Hold the line (اصمد في مكانك) |
| 600 | In the Marvel films, how many Infinity Stones does Thanos collect to wipe out half of all life in the universe? | Six | Five | Seven | ستة | خمسة | سبعة |
| 600 | In "Inception" (2010), what small object does Cobb use as his totem to tell a dream from reality? | A spinning top (accept top) | A loaded die | A chess piece | نحلة دوّارة (يُقبل: نحلة، خذروف، بلبل) | حجر نرد مثقَّل | قطعة شطرنج |
| 600 | Which Irish actor plays gang leader Thomas Shelby in "Peaky Blinders"? | Cillian Murphy | Colin Farrell | Jamie Dornan | كيليان مورفي | كولين فاريل | جيمي دورنان |

## Science

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | What gas do plants absorb from the air for photosynthesis? | Carbon dioxide (CO2) | Oxygen | Nitrogen | ثاني أكسيد الكربون (CO2) | الأكسجين | النيتروجين |
| 100 | What force keeps the Moon in orbit around the Earth? | Gravity | Magnetism | Centrifugal force | الجاذبية | المغناطيسية | القوة الطاردة المركزية |
| 100 | Which planet is best known for its large, bright system of rings? | Saturn | Jupiter | Uranus | زحل | المشتري | أورانوس |
| 100 | What name is given to animals that eat only plants? | Herbivores | Carnivores | Omnivores | الحيوانات العاشبة | الحيوانات اللاحمة | الحيوانات القارتة |
| 100 | Which scientist developed the theory of relativity? | Albert Einstein | Isaac Newton | Niels Bohr | ألبرت أينشتاين | إسحاق نيوتن | نيلز بور |
| 100 | Which animal, known as the "ship of the desert", has carried goods across Egypt for centuries? | The camel | The donkey | The horse | الجمل | الحمار | الحصان |
| 100 | What kind of virus caused the COVID-19 pandemic? | A coronavirus (accept SARS-CoV-2) | An influenza virus | A rhinovirus | فيروس كورونا (يُقبل: SARS-CoV-2) | فيروس الإنفلونزا | الفيروس الأنفي |
| 100 | What type of light from phone screens is said to disturb sleep when used late at night? | Blue light | Red light | Ultraviolet light | الضوء الأزرق | الضوء الأحمر | الضوء فوق البنفسجي |
| 100 | The "neural networks" used in AI are loosely based on which organ of the human body? | The brain | The heart | The eye | الدماغ | القلب | العين |
| 100 | Doctors now use AI to help spot broken bones in which kind of medical pictures? | X-rays | Ultrasound scans | Retinal scans | صور الأشعة السينية | صور الموجات فوق الصوتية | صور شبكية العين |
| 100 | What is the chemical formula of water? | H2O | CO2 | H2O2 | H2O | CO2 | H2O2 |
| 100 | At sea level, at what temperature in degrees Celsius does water boil? | 100 degrees Celsius | 90 degrees Celsius | 120 degrees Celsius | 100 درجة مئوية | 90 درجة مئوية | 120 درجة مئوية |
| 100 | Which pair of organs do humans use to breathe? | The lungs | The kidneys | The gills | الرئتان | الكليتان | الخياشيم |
| 100 | What is the largest animal known to have ever lived on Earth? | The blue whale | The African elephant | The whale shark | الحوت الأزرق | الفيل الأفريقي | القرش الحوتي |
| 100 | As traditionally counted, how many colours are there in a rainbow? | Seven | Six | Eight | سبعة | ستة | ثمانية |
| 200 | What is the chemical symbol for gold? | Au | Ag | Gd | Au | Ag | Gd |
| 200 | Which planet is the largest in our Solar System? | Jupiter | Saturn | Neptune | المشتري | زحل | نبتون |
| 200 | Which blood cells carry oxygen around the body? | Red blood cells | White blood cells | Platelets | خلايا الدم الحمراء | خلايا الدم البيضاء | الصفائح الدموية |
| 200 | Which naturalist is famous for the theory of evolution by natural selection? | Charles Darwin | Gregor Mendel | Jean-Baptiste Lamarck | تشارلز داروين | غريغور مندل | جان باتيست لامارك |
| 200 | Which beetle did ancient Egyptians treat as sacred and link with the rising sun? | The scarab (accept dung beetle, Al-Ja'ran) | The ladybird | The firefly | الجعران (يُقبل: الخنفساء الدَّحروجة) | الدعسوقة | اليراعة |
| 200 | Which space company, founded by Elon Musk in 2002, launches Falcon 9 rockets? | SpaceX | Blue Origin | Virgin Galactic | سبيس إكس | بلو أوريجين | فيرجن غالاكتيك |
| 200 | NASA's rovers, which use AI to drive themselves over rocky ground, explore which planet? | Mars | Venus | Mercury | المريخ | الزهرة | عطارد |
| 200 | Smartwatches use AI to warn you about an irregular rhythm in which organ? | The heart | The brain | The lungs | القلب | الدماغ | الرئتان |
| 200 | Which reddish-brown metal is the most common choice for electrical wires in homes? | Copper | Bronze | Iron | النحاس | البرونز | الحديد |
| 200 | What is the name of the galaxy that contains our Solar System? | The Milky Way | The Andromeda Galaxy | The Whirlpool Galaxy | مجرة درب التبانة | مجرة أندروميدا | مجرة الدوامة |
| 200 | Which is the largest living bird in the world? | The ostrich | The emu | The cassowary | النعامة | الإيمو | الكاسوار |
| 200 | What is the name for the process in which a liquid slowly turns into a gas, like a puddle drying in the sun? | Evaporation | Condensation | Sublimation | التبخر | التكثف | التسامي |
| 200 | Which instrument do scientists use to see things too small for the eye, such as cells? | A microscope | A telescope | A stethoscope | المجهر (الميكروسكوب) | التلسكوب | السماعة الطبية |
| 200 | What is the only mammal capable of true powered flight? | The bat | The flying squirrel | The flying lemur | الخفاش | السنجاب الطائر | الليمور الطائر |
| 300 | Which planet is known as the Red Planet? | Mars | Jupiter | Venus | المريخ | المشتري | الزهرة |
| 300 | Which scientist published the three laws of motion in 1687? | Isaac Newton | Galileo Galilei | Johannes Kepler | إسحاق نيوتن | غاليليو غاليلي | يوهانس كبلر |
| 300 | What is the largest organ of the human body? | The skin | The liver | The brain | الجلد | الكبد | الدماغ |
| 300 | Which reptile did ancient Egyptians worship as the god Sobek? | The crocodile | The cobra | The tortoise | التمساح | الكوبرا | السلحفاة |
| 300 | Which Scottish scientist discovered penicillin in 1928? | Alexander Fleming | James Young Simpson | Alexander Graham Bell | ألكسندر فليمنغ | جيمس يونغ سيمبسون | ألكسندر غراهام بيل |
| 300 | What is the longest bone in the human body? | The femur (thigh bone) | The tibia | The humerus | عظم الفخذ | عظم الساق | عظم العضد |
| 300 | How many teeth are there in a full adult set, including the wisdom teeth? | 32 | 28 | 36 | 32 | 28 | 36 |
| 300 | What is the fastest animal on land? | The cheetah | The lion | The gazelle | الفهد الصياد (الشيتا، يُقبل: الفهد) | الأسد | الغزال |
| 300 | Which pair of organs cleans the blood and turns its waste into urine? | The kidneys (accept kidney) | The adrenal glands | The lungs | الكليتان (يُقبل: الكلى، الكلية) | الغدتان الكظريتان | الرئتان |
| 300 | Which light gas makes party balloons float, and makes your voice sound squeaky if you breathe it in? | Helium | Argon | Nitrous oxide | الهيليوم | الأرغون | أكسيد النيتروز |
| 300 | What do we call it when the Moon passes between the Sun and the Earth and blocks out the Sun? | A solar eclipse (accept eclipse) | A lunar eclipse | A solstice | كسوف الشمس (يُقبل: الكسوف) | خسوف القمر | الانقلاب الشمسي |
| 300 | Which scientist of the ancient world is said to have jumped out of his bath shouting "Eureka!"? | Archimedes | Pythagoras | Euclid | أرخميدس | فيثاغورس | إقليدس |
| 400 | What is the hardest natural substance on Earth? | Diamond | Quartz | Sapphire | الألماس | الكوارتز | الياقوت الأزرق |
| 400 | Which vitamin does the human body make when exposed to ultraviolet rays? | Vitamin D | Vitamin C | Vitamin A | فيتامين د | فيتامين ج | فيتامين أ |
| 400 | Which chemical element has the atomic number 1? | Hydrogen | Helium | Oxygen | الهيدروجين | الهيليوم | الأكسجين |
| 400 | How many chambers does the human heart have? | Four | Two | Three | أربع | اثنتان | ثلاث |
| 400 | Which metal is a liquid at normal room temperature? | Mercury | Lead | Tin | الزئبق | الرصاص | القصدير |
| 400 | The ancient Egyptian calendar had 12 months of 30 days. How many extra days were added to complete the year? | 5 | 3 | 7 | 5 | 3 | 7 |
| 400 | Which famous British physicist warned in 2014 that full artificial intelligence could spell the end of the human race? | Stephen Hawking | Roger Penrose | Peter Higgs | ستيفن هوكينغ | روجر بنروز | بيتر هيغز |
| 400 | Which planet is the hottest in our Solar System? | Venus | Mercury | Mars | كوكب الزهرة | كوكب عطارد | كوكب المريخ |
| 400 | What is the chemical symbol for sodium? | Na | So | Sn | Na | So | Sn |
| 400 | What is the green pigment in plants that captures light energy? | Chlorophyll | Carotene | Anthocyanin | الكلوروفيل (اليخضور) | الكاروتين | الأنثوسيانين |
| 400 | Which shellfish is best known for making pearls? | The oyster (accept pearl oyster) | The lobster | The crab | المحار (يُقبل: محار اللؤلؤ) | جراد البحر | السلطعون |
| 400 | Which scientist was put on trial by the Church in 1633 for teaching that the Earth moves around the Sun? | Galileo Galilei (accept Galileo) | Nicolaus Copernicus | Giordano Bruno | غاليليو غاليلي (يُقبل: غاليليو، جاليليو) | نيكولاس كوبرنيكوس | جوردانو برونو |
| 500 | How many bones are in the adult human body? | 206 | 196 | 212 | 206 | 196 | 212 |
| 500 | What is the most abundant gas in Earth's atmosphere? | Nitrogen | Oxygen | Carbon dioxide | النيتروجين (الآزوت) | الأكسجين | ثاني أكسيد الكربون |
| 500 | Which organ of the human body produces insulin? | The pancreas | The liver | The spleen | البنكرياس | الكبد | الطحال |
| 500 | Which Egyptian-born scientist won the 1999 Nobel Prize in Chemistry for his work on femtochemistry? | Ahmed Zewail | Farouk El-Baz | Mohamed ElBaradei | أحمد زويل | فاروق الباز | محمد البرادعي |
| 500 | Which "feel-good" brain chemical is released when we get likes and notifications on social media? | Dopamine | Serotonin | Adrenaline | الدوبامين | السيروتونين | الأدرينالين |
| 500 | Many self-driving cars "see" with a laser sensor, a cousin of radar. What is it called? | Lidar | Sonar | Maser | الليدار (Lidar) | السونار | الميزر |
| 500 | What is the largest internal organ of the human body? | The liver | The heart | The stomach | الكبد | القلب | المعدة |
| 500 | Which blood type is known as the "universal donor" type? | O negative | AB positive | O positive | O سالب | AB موجب | O موجب |
| 500 | Which gas, with the chemical formula O3, forms a layer high in the atmosphere that blocks much of the Sun's UV rays? | Ozone | Hydrogen | Methane | الأوزون | الهيدروجين | الميثان |
| 500 | The smallest bone in the human body is found in which part of the body? | The ear (accept middle ear) | The nose | The wrist | الأذن (يُقبل: الأذن الوسطى) | الأنف | الرسغ |
| 500 | Which planet in our Solar System is the farthest from the Sun? | Neptune | Uranus | Pluto | نبتون | أورانوس | بلوتو |
| 500 | Which poisonous gas, with no colour or smell, is given off when fuel burns badly in heaters and car engines? | Carbon monoxide (accept CO) | Carbon dioxide | Methane | أول أكسيد الكربون (يُقبل: CO) | ثاني أكسيد الكربون | الميثان |
| 600 | What is the name of the hot, dusty spring wind that blows across Egypt, whose name is Arabic for "fifty"? | The Khamsin | The Simoom | The Harmattan | الخماسين | السموم | الهرمتان |
| 600 | Which scholar, who worked in Fatimid Egypt around the year 1000, wrote the "Book of Optics" and is often called the father of optics? | Ibn al-Haytham (accept Alhazen) | Ibn Sina | Al-Biruni | ابن الهيثم | ابن سينا | البيروني |
| 600 | Which Egyptian-American geologist helped NASA choose the landing sites for the Apollo Moon missions? | Farouk El-Baz | Ahmed Zewail | Essam Heggy | فاروق الباز | أحمد زويل | عصام حجي |
| 600 | Which dwarf planet, which lost its planet status in 2006, was visited by the New Horizons probe in 2015? | Pluto | Ceres | Eris | بلوتو | سيريس | إيريس |
| 600 | What does "AGI" stand for, the idea of a future AI that could match humans at almost any task? | Artificial general intelligence | Artificial generative intelligence | Advanced global intelligence | الذكاء الاصطناعي العام (Artificial general intelligence) | الذكاء الاصطناعي التوليدي | الذكاء العالمي المتقدم |
| 600 | Which chemical element makes up the largest share of the Earth's crust by mass? | Oxygen | Silicon | Iron | الأكسجين | السيليكون | الحديد |
| 600 | Which Persian scholar wrote "The Canon of Medicine", used as a medical textbook in Europe for centuries? | Ibn Sina (accept Avicenna) | Al-Razi | Al-Khwarizmi | ابن سينا | الرازي | الخوارزمي |
| 600 | What is the only metal that is liquid at room temperature? | Mercury | Zinc | Aluminium | الزئبق | الزنك | الألومنيوم |
| 600 | The "funny bone" in your elbow is not a bone at all. What is it really? | A nerve (accept the ulnar nerve) | A tendon | A ligament | عصب (يُقبل: العصب الزندي) | وتر | رباط |
| 600 | Which metal conducts electricity better than any other metal? | Silver | Copper | Gold | الفضة | النحاس | الذهب |

## Sports

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | How many players does a football (soccer) team have on the field? | 11 | 10 | 12 | 11 | 10 | 12 |
| 100 | How many rings are on the Olympic flag? | Five | Four | Six | خمس | أربع | ست |
| 100 | How many minutes does a standard football (soccer) match last, not counting stoppage time? | 90 | 80 | 100 | 90 | 80 | 100 |
| 100 | Which Egyptian footballer joined Liverpool in 2017 and became known as the "Egyptian King"? | Mohamed Salah | Mohamed Elneny | Mohamed Aboutrika | محمد صلاح | محمد النني | محمد أبو تريكة |
| 100 | Which Argentine footballer finally won the FIFA World Cup in 2022? | Lionel Messi | Angel Di Maria | Sergio Aguero | ليونيل ميسي | أنخيل دي ماريا | سيرخيو أغويرو |
| 100 | Which Portuguese footballer is famous for his "Siuuu" goal celebration? | Cristiano Ronaldo | Luis Figo | Bruno Fernandes | كريستيانو رونالدو | لويس فيغو | برونو فرنانديز |
| 100 | In the RoboCup competition, robots play which sport, with the goal of beating the human world champions by 2050? | Football (accept soccer) | Basketball | Ice hockey | كرة القدم | كرة السلة | هوكي الجليد |
| 100 | At Wimbledon in 2025, AI-powered electronic line calling replaced human line judges in which sport? | Tennis | Badminton | Squash | التنس | الريشة الطائرة | الاسكواش |
| 100 | In football (soccer), which player is the only one allowed to handle the ball inside his own penalty area? | The goalkeeper | The captain | The sweeper | حارس المرمى | قائد الفريق | الليبرو |
| 100 | Which boxer, born Cassius Clay, called himself "The Greatest"? | Muhammad Ali | Joe Frazier | Sonny Liston | محمد علي كلاي | جو فريزر | سوني ليستون |
| 100 | In which sport do two teams of six players hit a ball over a high net using their hands and arms? | Volleyball | Handball | Netball | الكرة الطائرة | كرة اليد | كرة الشبكة |
| 100 | How often are the Summer Olympic Games normally held? | Every four years | Every two years | Every five years | كل أربع سنوات | كل سنتين | كل خمس سنوات |
| 200 | In which sport would you perform a slam dunk? | Basketball | Volleyball | Handball | كرة السلة | الكرة الطائرة | كرة اليد |
| 200 | How many holes are played in a standard round of golf? | 18 | 16 | 20 | 18 | 16 | 20 |
| 200 | What is the nickname of Egypt's national football team? | The Pharaohs | The Eagles | The Desert Foxes | الفراعنة | النسور | ثعالب الصحراء |
| 200 | Which Jamaican sprinter won the Olympic 100 metres at three Games in a row, from 2008 to 2016? | Usain Bolt | Yohan Blake | Asafa Powell | يوسين بولت | يوهان بليك | أسافا باول |
| 200 | Which paddle sport, a mix of tennis, badminton and table tennis, boomed in popularity in the 2020s? | Pickleball | Padel | Racquetball | البيكلبول | البادل | الراكيت بول |
| 200 | In April 2025, which unusual runners took part in a half-marathon in Beijing alongside humans? | Humanoid robots (accept robots) | Trained dogs | Racing ostriches | روبوتات شبيهة بالبشر (يُقبل: روبوتات) | كلاب مدرّبة | نعام سباق |
| 200 | Which football video game series, whose AI makes players move realistically, was renamed EA Sports FC in 2023? | FIFA | PES | Football Manager | فيفا (FIFA) | بيس (PES) | فوتبول مانجر (Football Manager) |
| 200 | Which Spanish football club has played its home games at the Bernabeu stadium since 1947? | Real Madrid | Atletico Madrid | Barcelona | ريال مدريد | أتلتيكو مدريد | برشلونة |
| 200 | Which American swimmer won eight gold medals at the 2008 Beijing Olympics? | Michael Phelps | Ryan Lochte | Mark Spitz | مايكل فيلبس | رايان لوكتي | مارك سبيتز |
| 200 | Which basketball legend led the Chicago Bulls to six NBA championships in the 1990s? | Michael Jordan | Magic Johnson | Larry Bird | مايكل جوردان | ماجيك جونسون | لاري بيرد |
| 200 | In which sport do you score a "strike" by knocking down all ten pins with your first ball? | Bowling (ten-pin bowling) | Billiards | Curling | البولينج | البلياردو | الكيرلنغ |
| 300 | Which country won the first FIFA World Cup in 1930? | Uruguay | Argentina | Brazil | الأوروغواي | الأرجنتين | البرازيل |
| 300 | In which city were the first modern Olympic Games held, in 1896? | Athens | Paris | London | أثينا | باريس | لندن |
| 300 | Which Egyptian football club was named African "Club of the Century" by CAF in 2000? | Al Ahly | Zamalek | Ismaily | النادي الأهلي | نادي الزمالك | النادي الإسماعيلي |
| 300 | Which American gymnast pulled out of team events at the delayed 2020 Olympics to protect her mental health? | Simone Biles | Gabby Douglas | Aly Raisman | سيمون بايلز | غابي دوغلاس | آلي رايسمان |
| 300 | Which board sport, with street and park events, made its Olympic debut at the 2020 Games? | Skateboarding | Snowboarding | Wakeboarding | التزلج على اللوح (سكيت بورد) | التزلج على الثلج بلوح (سنوبورد) | التزلج على الماء بلوح (ويك بورد) |
| 300 | At the 2022 World Cup in Qatar, AI-powered cameras helped referees make which kind of call? | Offside (accept semi-automated offside) | Handball | Penalty | التسلل (يُقبل: التسلل شبه الآلي) | لمسة اليد | ركلة الجزاء |
| 300 | Which ball-tracking system, named after a bird, helps decide close calls in tennis and cricket? | Hawk-Eye | Cyclops | Eagle Eye | عين الصقر (Hawk-Eye) | سايكلوبس (Cyclops) | عين النسر (Eagle Eye) |
| 300 | Which Brazilian footballer, known by a single name, won the World Cup three times, in 1958, 1962 and 1970? | Pele | Garrincha | Zico | بيليه | غارينشا | زيكو |
| 300 | Which Swiss tennis player won the Wimbledon men's singles title eight times? | Roger Federer | Stan Wawrinka | Marc Rosset | روجر فيدرر | ستان فافرينكا | مارك روسيه |
| 300 | Which city hosted the 2016 Summer Olympics, the first Games held in South America? | Rio de Janeiro | Sao Paulo | Buenos Aires | ريو دي جانيرو | ساو باولو | بوينس آيرس |
| 400 | Which German driver won five Formula 1 world titles in a row with Ferrari, from 2000 to 2004? | Michael Schumacher | Sebastian Vettel | Nico Rosberg | مايكل شوماخر | سيباستيان فيتل | نيكو روزبرغ |
| 400 | Which martial art's name means "empty hand"? | Karate | Judo | Taekwondo | الكاراتيه | الجودو | التايكوندو |
| 400 | How long is an Olympic swimming pool, in metres? | 50 metres | 25 metres | 100 metres | 50 متراً | 25 متراً | 100 متر |
| 400 | In which racket sport, played indoors against four walls, have Egyptian players won many world titles? | Squash | Racquetball | Table tennis | الاسكواش | الراكيت بول | تنس الطاولة |
| 400 | Which dance sport, with competitors called B-boys and B-girls, made its Olympic debut in 2024? | Breaking (accept breakdancing) | Popping | Krumping | البريكينغ (يُقبل: البريك دانس) | البوبينغ | الكرامبينغ |
| 400 | Which NBA star was nicknamed "The Black Mamba"? | Kobe Bryant | Shaquille O'Neal | LeBron James | كوبي براينت | شاكيل أونيل | ليبرون جيمس |
| 400 | What is the name of the humanoid robot by Boston Dynamics that went viral for doing backflips and parkour? | Atlas | Spot | Optimus | أطلس (Atlas) | سبوت (Spot) | أوبتيموس (Optimus) |
| 400 | In 2019, an AI called Pluribus, made by Facebook and Carnegie Mellon University, beat top professionals at which card game? | Poker (accept Texas Hold'em) | Bridge | Blackjack | البوكر (يُقبل: تكساس هولدم) | البريدج | البلاك جاك |
| 400 | Which French football star was sent off for headbutting Marco Materazzi in the 2006 World Cup final? | Zinedine Zidane | Thierry Henry | Patrick Vieira | زين الدين زيدان | تييري هنري | باتريك فييرا |
| 400 | In tennis, what is the term for a score of 40-40 in a game? | Deuce | Advantage | Tiebreak | "ديوس" (Deuce) | أدفانتج (Advantage) | تاي بريك (Tiebreak) |
| 500 | In tennis, what is the term for a score of zero? | Love | Let | Ace | لَف (Love) | ليت (Let) | إيس (Ace) |
| 500 | How long is a marathon, to the nearest whole kilometre? | 42 km | 40 km | 45 km | 42 كم | 40 كم | 45 كم |
| 500 | Egypt won the very first Africa Cup of Nations. In which year was it held? | 1957 | 1959 | 1962 | 1957 | 1959 | 1962 |
| 500 | Which online battle game by Riot Games has a yearly World Championship that is one of the biggest events in esports? | League of Legends | Dota 2 | Counter-Strike | ليغ أوف ليجندز | دوتا 2 | كاونتر سترايك |
| 500 | Which Kenyan runner became the first person to run a marathon distance in under two hours, in 2019? | Eliud Kipchoge | Kelvin Kiptum | Wilson Kipsang | إليود كيبتشوغي | كيلفن كيبتوم | ويلسون كيبسانغ |
| 500 | In 2019, a team of OpenAI bots called OpenAI Five beat the world champions OG at which esports game? | Dota 2 | StarCraft II | League of Legends | دوتا 2 (Dota 2) | ستاركرافت 2 (StarCraft II) | ليغ أوف ليجندز (League of Legends) |
| 500 | Sony's AI driver GT Sophy beat the world's best human players in which racing video game series? | Gran Turismo | Forza Motorsport | Need for Speed | غران توريزمو (Gran Turismo) | فورزا موتورسبورت (Forza Motorsport) | نيد فور سبيد (Need for Speed) |
| 500 | Which Dutch football club, famous for "Total Football", won three European Cups in a row from 1971 to 1973? | Ajax (Ajax Amsterdam) | Feyenoord | PSV Eindhoven | أياكس أمستردام | فينورد | بي إس في آيندهوفن |
| 500 | At the 1986 World Cup, against which country did Diego Maradona score his famous "Hand of God" goal? | England (accept the England national team) | Belgium | West Germany | إنجلترا (يُقبل: منتخب إنجلترا) | بلجيكا | ألمانيا الغربية |
| 500 | Which player won his tenth Australian Open men's singles title in 2023? | Novak Djokovic (accept Djokovic) | Rafael Nadal | Andy Murray | نوفاك ديوكوفيتش (يُقبل: جوكوفيتش) | رافائيل نادال | آندي موراي |
| 600 | In which year did Egypt become the first African country to play at a FIFA World Cup? | 1934 | 1930 | 1938 | 1934 | 1930 | 1938 |
| 600 | Which Egyptian goalkeeper, aged 45, became the oldest player to appear at a FIFA World Cup, in 2018? | Essam El-Hadary | Ahmed Shobair | Sherif Ekramy | عصام الحضري | أحمد شوبير | شريف إكرامي |
| 600 | In which year did Egypt host and win the Africa Cup of Nations, beating Ivory Coast on penalties in the final? | 2006 | 2008 | 1986 | 2006 | 2008 | 1986 |
| 600 | Which Egyptian wrestler won Olympic gold in Greco-Roman wrestling at the 2004 Athens Games? | Karam Gaber | Hesham Mesbah | Mohamed Rashwan | كرم جابر | هشام مصباح | محمد رشوان |
| 600 | Which English football club won its first top-flight league title in 2016, after starting the season as 5000-1 outsiders? | Leicester City | West Ham United | Tottenham Hotspur | ليستر سيتي | وست هام يونايتد | توتنهام هوتسبير |
| 600 | Which British tennis player won the 2021 US Open after starting the tournament as a qualifier? | Emma Raducanu | Johanna Konta | Katie Boulter | إيما رادوكانو | جوهانا كونتا | كيتي بولتر |
| 600 | Which DeepMind AI taught itself chess in a few hours and then beat the top chess program Stockfish in 2017? | AlphaZero | AlphaGo | Deep Blue | ألفا زيرو (AlphaZero) | ألفا جو (AlphaGo) | ديب بلو (Deep Blue) |
| 600 | What was the name of the official ball of the 2022 World Cup, which had a sensor inside to help with offside calls? | Al Rihla | Telstar | Brazuca | الرحلة (Al Rihla) | تلستار (Telstar) | برازوكا (Brazuca) |
| 600 | In which sport did Egypt's Ahmed Elgendy win Olympic gold at the Paris 2024 Games? | Modern pentathlon | Triathlon | Fencing | الخماسي الحديث | الترياثلون | المبارزة |

## Technology

| Pts | Question | Answer | Wrong 1 | Wrong 2 | Answer (AR) | Wrong 1 (AR) | Wrong 2 (AR) |
|---|---|---|---|---|---|---|---|
| 100 | What does "CPU" stand for? | Central Processing Unit | Computer Processing Unit | Central Power Unit | وحدة المعالجة المركزية | وحدة معالجة الحاسوب | وحدة الطاقة المركزية |
| 100 | Who co-founded Microsoft with Paul Allen in 1975? | Bill Gates | Steve Jobs | Steve Ballmer | بيل غيتس | ستيف جوبز | ستيف بالمر |
| 100 | Which company created the PlayStation games console? | Sony | Nintendo | Sega | سوني | نينتندو | سيغا |
| 100 | What is the common name for unwanted bulk email, also the name of a canned meat? | Spam | Phishing | Bacon | سبام (Spam) | فيشينغ | بيكون |
| 100 | Larry Page and Sergey Brin founded which company in 1998? | Google | Yahoo | Amazon | جوجل | ياهو | أمازون |
| 100 | Which AI chatbot from OpenAI was released to the public in November 2022? | ChatGPT | Bard | Claude | شات جي بي تي (ChatGPT) | بارد | كلود |
| 100 | Which photo-sharing app, launched in 2010, added Stories in 2016 and Reels in 2020? | Instagram | Snapchat | Flickr | إنستغرام | سناب شات | فليكر |
| 100 | What is the name of the phone keyboard feature that guesses the next word you want to type? | Predictive text (accept autocomplete) | Autocorrect | Spell check | النص التنبؤي (يُقبل: الإكمال التلقائي) | التصحيح التلقائي | التدقيق الإملائي |
| 100 | What do we call a car that can drive itself using AI, without a human at the wheel? | A self-driving car (accept driverless or autonomous car) | An electric car | A hybrid car | سيارة ذاتية القيادة | سيارة كهربائية | سيارة هجينة |
| 100 | Which free online encyclopedia, launched in 2001, can be edited by anyone? | Wikipedia | Encarta | Britannica | ويكيبيديا | إنكارتا | بريتانيكا |
| 100 | Which tablet computer did Steve Jobs unveil in January 2010? | The iPad | The iPod Touch | The Apple Newton | آيباد (iPad) | آيبود تاتش | أبل نيوتن |
| 100 | What do we call a harmful program that copies itself and spreads from one computer to another? | A computer virus | A computer bug | A Trojan horse | فيروس الحاسوب | خطأ برمجي | حصان طروادة |
| 100 | Which keyboard key do you hold down to type a capital letter? | Shift | Ctrl | Alt | مفتاح Shift | مفتاح Ctrl | مفتاح Alt |
| 100 | What does "PC" stand for? | Personal computer | Portable computer | Programmable computer | الحاسوب الشخصي (Personal Computer) | الحاسوب المحمول | الحاسوب القابل للبرمجة |
| 200 | Which company created the iPhone? | Apple | Samsung | Nokia | أبل | سامسونج | نوكيا |
| 200 | What does "GPS" stand for? | Global Positioning System | General Positioning System | Geographic Positioning Satellite | نظام تحديد المواقع العالمي | نظام تحديد المواقع العام | قمر تحديد المواقع الجغرافية |
| 200 | Who invented the telephone, in 1876? | Alexander Graham Bell | Thomas Edison | Guglielmo Marconi | ألكسندر غراهام بيل | توماس إديسون | غولييلمو ماركوني |
| 200 | Which brothers made the first controlled airplane flight in 1903? | The Wright brothers | The Montgolfier brothers | The Lumiere brothers | الأخوان رايت | الأخوان مونغولفييه | الأخوان لوميير |
| 200 | Which company created the Game Boy and the Super Mario games? | Nintendo | Sega | Sony | نينتندو | سيغا | سوني |
| 200 | What is the name of the ancient Egyptian writing system that used pictures and symbols? | Hieroglyphs (accept hieroglyphics) | Cuneiform | Runes | الهيروغليفية | المسمارية | الرونية |
| 200 | In which year was the first iPhone released? | 2007 | 2005 | 2008 | 2007 | 2005 | 2008 |
| 200 | What is the name of Amazon's voice assistant, used on Echo smart speakers? | Alexa | Siri | Cortana | أليكسا | سيري | كورتانا |
| 200 | Which music app makes you a personal "Discover Weekly" playlist every week, picked by AI? | Spotify | Apple Music | Anghami | سبوتيفاي | أبل ميوزك | أنغامي |
| 200 | Which Google app lets you search for things by pointing your phone camera at them? | Google Lens | Google Photos | Google Earth | عدسة جوجل (Google Lens) | صور جوجل | جوجل إيرث |
| 200 | What does "SMS" stand for, the service used to send text messages between phones? | Short Message Service (accept Short Messaging Service) | Simple Message System | Short Mobile Service | خدمة الرسائل القصيرة (Short Message Service) | نظام الرسائل البسيطة | خدمة المحمول القصيرة |
| 200 | Which American inventor gave us the phonograph in 1877 and a long-lasting electric light bulb in 1879? | Thomas Edison | Nikola Tesla | Alexander Graham Bell | توماس إديسون | نيكولا تسلا | ألكسندر غراهام بيل |
| 200 | Which Finnish company made the famous 3310 mobile phone, released in 2000? | Nokia | Ericsson | Siemens | نوكيا | إريكسون | سيمنز |
| 300 | What is the name of Google's mobile operating system? | Android | Tizen | Symbian | أندرويد | تايزن | سيمبيان |
| 300 | In computing, what does "RAM" stand for? | Random Access Memory | Read Access Memory | Rapid Access Memory | ذاكرة الوصول العشوائي | ذاكرة الوصول للقراءة | ذاكرة الوصول السريع |
| 300 | What does "PDF" stand for? | Portable Document Format | Printable Document Format | Public Document File | صيغة المستندات المحمولة | صيغة المستندات القابلة للطباعة | ملف المستندات العامة |
| 300 | Which stone, cut from local quarries, was the main building material of the Giza pyramids? | Limestone | Granite | Sandstone | الحجر الجيري | الجرانيت | الحجر الرملي |
| 300 | Which video-calling app became hugely popular for school and work during the 2020 lockdowns? | Zoom | Skype | Viber | زووم | سكايب | فايبر |
| 300 | What does "NFT" stand for? | Non-fungible token | New financial token | Non-financial transfer | رمز غير قابل للاستبدال (Non-fungible token) | رمز مالي جديد | تحويل غير مالي |
| 300 | Which electric car company calls its driver-assistance system "Autopilot"? | Tesla | Rivian | Lucid | تسلا | ريفيان | لوسيد |
| 300 | Which Microsoft search engine added an AI chatbot in 2023? | Bing | MSN Search | Live Search | بينغ (Bing) | إم إس إن سيرش | لايف سيرش |
| 300 | Which Chinese e-commerce giant did Jack Ma co-found in 1999? | Alibaba (Alibaba Group) | Tencent | Baidu | علي بابا | تينسنت | بايدو |
| 300 | What are the small files that websites save in your browser to remember you, named after a sweet snack? | Cookies | Brownies | Wafers | الكوكيز (ملفات تعريف الارتباط) | البراونيز | الويفر |
| 400 | Which Windows version, released in 2001, took its name from the word "experience"? | Windows XP | Windows ME | Windows Vista | ويندوز إكس بي (Windows XP) | ويندوز إم إي | ويندوز فيستا |
| 400 | How many bits make up one byte? | 8 | 4 | 16 | 8 | 4 | 16 |
| 400 | Who invented the electromechanical "Bombe" machine that cracked German Enigma ciphers? | Alan Turing | Charles Babbage | Tommy Flowers | آلان تورينغ | تشارلز باباج | تومي فلاورز |
| 400 | Which computer input device did Douglas Engelbart invent in the 1960s? | The mouse | The joystick | The touchscreen | الفأرة | عصا التحكم | الشاشة اللمسية |
| 400 | What was the company Meta called before it changed its name in 2021? | Facebook | Instagram | WhatsApp | فيسبوك | إنستغرام | واتساب |
| 400 | Which digital currency, created by the mysterious Satoshi Nakamoto, launched in 2009? | Bitcoin | Ethereum | Dogecoin | بيتكوين | إيثيريوم | دوجكوين |
| 400 | Which Adobe photo-editing app added the AI tool "Generative Fill" in 2023? | Photoshop | Lightroom | Illustrator | فوتوشوب | لايت روم | إليستريتور |
| 400 | What was Google's AI chatbot called before it was renamed Gemini in 2024? | Bard | BERT | Sparrow | بارد (Bard) | بيرت | سبارو |
| 400 | In a web address starting with "https", what does the letter "s" stand for? | Secure | Server | Standard | آمن (Secure) | خادم | قياسي |
| 400 | What do the letters of the computer company "IBM" stand for? | International Business Machines | International Business Management | Industrial Business Machines | International Business Machines (آلات الأعمال الدولية) | إدارة الأعمال الدولية | آلات الأعمال الصناعية |
| 400 | Which storage disk, usually holding 1.44 MB, is still used as the "Save" icon in many programs? | The floppy disk | The CD-ROM | The hard disk | القرص المرن (الفلوبي ديسك) | القرص المدمج | القرص الصلب |
| 500 | The QWERTY keyboard layout was originally designed for which machine? | The typewriter | The telegraph | The printing press | الآلة الكاتبة | التلغراف | المطبعة |
| 500 | How is the decimal number 5 written in binary? | 101 | 110 | 111 | 101 | 110 | 111 |
| 500 | Which social network, bought by Elon Musk in 2022, was renamed X? | Twitter | Tumblr | Vine | تويتر | تمبلر | فاين |
| 500 | What are the wireless earbuds that were launched alongside the iPhone 7 in 2016 called? | AirPods | Galaxy Buds | Pixel Buds | إيربودز (AirPods) | غالاكسي بادز | بيكسل بادز |
| 500 | What is the name of OpenAI's tool that makes videos from a text description, first shown in 2024? | Sora | DALL-E | Whisper | سورا (Sora) | دال-إي | ويسبر |
| 500 | Meta's smart glasses with a built-in AI assistant are made with which famous sunglasses brand? | Ray-Ban | Persol | Carrera | راي بان (Ray-Ban) | بيرسول | كاريرا |
| 500 | While working on radar equipment in the 1940s, engineer Percy Spencer noticed that a snack bar in his pocket had melted. Which kitchen appliance did he go on to invent? | The microwave oven (accept microwave) | The induction cooker | The electric toaster | فرن الميكروويف (يُقبل: الميكروويف) | الموقد الحثي | محمصة الخبز الكهربائية |
| 500 | Which music player, launched in October 2001, was sold with the slogan "1,000 songs in your pocket"? | The iPod (accept iPod Classic) | The Zune | The Walkman | آيبود (iPod) | زون | ووكمان |
| 500 | In 1973, engineer Martin Cooper made the first public call from a handheld mobile phone. Which company did he work for? | Motorola | Bell Labs | Ericsson | موتورولا (Motorola) | مختبرات بيل | إريكسون |
| 500 | Which online auction website, founded in 1995 as AuctionWeb, famously sold a broken laser pointer as one of its very first items? | eBay | Amazon | Craigslist | إيباي (eBay) | أمازون | كريغزليست |
| 600 | Which hydroelectric dam holds back the Nile in southern Egypt? | The Aswan High Dam | The Delta Barrage | The Merowe Dam | السد العالي في أسوان | القناطر الخيرية | سد مروي |
| 600 | How tall was the Great Pyramid of Giza when it was built, to the nearest 10 metres? | About 150 metres (146.6 m, accept 140-150) | About 120 metres | About 180 metres | حوالي 150 متراً (146.6 متراً، يُقبل: 140-150) | حوالي 120 متراً | حوالي 180 متراً |
| 600 | Which of the Seven Wonders of the Ancient World stood on an island off Egypt's coast and guided ships into harbour? | The Lighthouse of Alexandria (accept Pharos) | The Colossus of Rhodes | The Mausoleum at Halicarnassus | فنار الإسكندرية (يُقبل: فاروس) | تمثال رودس العملاق | ضريح هاليكارناسوس |
| 600 | What was the name of Egypt's first communications satellite, launched in 1998? | Nilesat 101 (accept Nilesat) | Arabsat 1A | EgyptSat 1 | نايل سات 101 (يُقبل: نايل سات) | عرب سات 1A | إيجيبت سات 1 |
| 600 | In which year was YouTube founded? | 2005 | 2004 | 2006 | 2005 | 2004 | 2006 |
| 600 | Which voice assistant first appeared on the iPhone 4S in 2011? | Siri | Cortana | Google Assistant | سيري | كورتانا | مساعد جوجل |
| 600 | What was the name of the 1960s computer program, one of the first chatbots, that pretended to be a therapist? | ELIZA | PARRY | ALICE | إليزا (ELIZA) | باري | أليس |
| 600 | Which AI search engine, whose name is a word meaning "confusion", answers questions and shows its sources? | Perplexity | Phind | Neeva | بيربلكسيتي (Perplexity) | فايند | نيفا |
| 600 | Which "law", named after a co-founder of Intel, says that the number of transistors on a computer chip doubles about every two years? | Moore's law | Noyce's law | Metcalfe's law | قانون مور | قانون نويس | قانون ميتكالف |
| 600 | Which photography company, founded by George Eastman, launched the cheap Brownie camera in 1900 and later filed for bankruptcy as digital photography took over? | Kodak (accept Eastman Kodak) | Polaroid | Fujifilm | كوداك (يُقبل: إيستمان كوداك) | بولارويد | فوجي فيلم |

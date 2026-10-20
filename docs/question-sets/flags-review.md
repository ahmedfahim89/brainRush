# Review: Flags picture question set

- **Request:** owner request of 2026-10-20 for the first picture question set: a new "Flags" category built from the owner's approved list of 54 countries, 9 at each point value. The owner then dropped Oman (see Owner decisions), leaving 53.
- **Date:** 2026-10-20
- **SQL file:** `sql/add-flags-questions.sql`. It has **not** been loaded yet. It needs `sql/migrate-add-image.sql` first, and the orchestrator loads it after that migration.
- **Images:** `img/questions/flag-<country>.svg`, 53 files, 563,663 bytes (550 KB) in total.
- **Point values (local DB):** 100, 200, 300, 400, 500, 600

| Category | 100 | 200 | 300 | 400 | 500 | 600 | Total |
|---|---|---|---|---|---|---|---|
| Flags (new) | 9 | 9 | 9 | 9 | 8 | 9 | 53 |

Every row has the same prompt, `Which country does this flag belong to?` / `إلى أي دولة ينتمي هذا العلم؟`, plus its own `image`. The new unique key `uq_category_question_image (category_id, question, image)` keeps the 53 rows apart and makes the file safe to run again.

## Owner decisions (2026-10-20)

1. **Oman dropped, not replaced.** Its Commons file is under the Open Government Licence - Oman 1.0, not public domain, and that licence excludes official emblems, which the flag carries. The owner removed it, so 500 has 8 flags. Every remaining file is public domain. Don't re-add Oman or top up 500.
2. **Nepal kept in both Geography and Flags.** The Geography 600 question ("the only national flag ... neither a rectangle nor a square", answer Nepal) describes this flag, so one can give the other away when both come up in a game. The owner accepted this.
3. **Close pairs inside the set.** All of these were kept, as approved. Each pair is distinguishable at a glance, but players may mix them up, which is part of the challenge. The host notes cover them.
   - Germany (200) and Belgium (400): the same three colours, horizontal in Germany and vertical in Belgium.
   - China (100) and Vietnam (500): both red with yellow stars (China has five, Vietnam one).
   - UAE (200), Kuwait (300) and Jordan (500): all use pan-Arab red, green, white and black.
   - Egypt (100) and Iraq (500): both red-white-black tricolours (Egypt has the golden eagle, Iraq the green "Allahu akbar").
   - Italy (200) and Mexico (300): both green-white-red (Mexico has the eagle emblem).
   - Pakistan (500) and Algeria (400): both green and white with a crescent and star.
4. **Turkey, not Turkiye.** The owner chose `Turkey (accept Turkiye)` as the answer. The file is `flag-turkey.svg`.
5. **Arab flags may be easier for Egyptian players.** Saudi Arabia (100), UAE and Morocco (200), Qatar and Kuwait (300), Lebanon and Algeria (400), and Jordan and Iraq (500) are everyday sights in Egypt. This matches how the Egyptians and Food & Drink sets treat local knowledge. Move one down a value if play shows it is too easy.
6. **Country names are already answers in Geography and History.** Japan, Qatar, South Korea, the United States, Saudi Arabia, Spain, China, the UAE, Russia, South Africa, Sweden, Jordan, France, Algeria, the United Kingdom, India, Nepal, Cuba and Chile are already answers there. A flags category can't avoid this. Apart from Nepal (point 2), none of those questions describes a flag, so none gives a flag away. The only other flag question in the bank is the Olympic rings question (Sports 100), which doesn't overlap.
7. **Different shapes.** The flags are not all 3:2:
   - Switzerland is square.
   - Nepal is two pennants, not a rectangle.
   - Belgium is 13:15, Denmark 28:37, Norway 8:11, Finland 11:18 and Qatar 11:28.
   - Most of the rest are 2:1 or 3:2.

   The picture must be shown whole, never cropped (for example `object-fit: contain` within a fixed box). Treat this as a check for the developer and tester.

## Excluded look-alikes (owner decision, not used)

These were left out because the host could not fairly judge the answer, or two answers would be right for practically the same picture:

| Excluded | Why |
|---|---|
| Chad / Romania | Practically the same blue-yellow-red vertical tricolour. Chad's blue is only slightly darker. |
| Indonesia / Monaco / Poland | Indonesia and Monaco are both red over white and differ only in proportions. Poland is the same colours the other way up. |
| Ireland / Cote d'Ivoire | The same green, white and orange vertical tricolour, in reverse order. |
| Australia / New Zealand | Both are blue ensigns with the Union Jack and Southern Cross stars. |
| Senegal / Mali | The same green-yellow-red vertical tricolour (Senegal adds a green star). Guinea is the same in reverse. |
| Iceland | Easily confused with Norway (the same colours, reversed). Norway was kept. |
| Bahrain | Easily confused with Qatar (red rather than maroon, 5 points rather than 9). Qatar was kept. |
| Palestine | The same as Jordan except for the white star. Jordan was kept. |
| Tunisia | Easily confused with Turkey (crescent and star in a white disc). Turkey was kept. |
| Ecuador / Venezuela | Close to Colombia: Ecuador uses the same stripes plus a coat of arms, and Venezuela equal stripes with stars. Colombia was kept. |
| Luxembourg | Close to the Netherlands (a lighter blue). The Netherlands was kept. |
| Slovenia / Slovakia | Each other's near twin, and both close to Russia. Russia was kept. |

## Image rule: never replace a picture under the same name

Asset names are not content-hashed, and the live site sits behind a 7-day browser cache and the Hostinger CDN. If a flag file is changed in place, players keep seeing the old picture for days, and some edge copies may serve it for longer. Never replace an image under the same file name. If a flag changes (as Kyrgyzstan's did in December 2023), add a **new** file name, for example `flag-kyrgyzstan-2023.svg`. Then add a new row pointing to it, and leave the old file in place until no row uses it.

---

## Questions

| Points | Question | Answer | Arabic question | Arabic answer | Image | Host note |
|---|---|---|---|---|---|---|
| 100 | Which country does this flag belong to? | Japan | إلى أي دولة ينتمي هذا العلم؟ | اليابان | img/questions/flag-japan.svg | Reject Bangladesh (red disc on green) and Palau (yellow disc on blue). |
| 100 | Which country does this flag belong to? | Canada | إلى أي دولة ينتمي هذا العلم؟ | كندا | img/questions/flag-canada.svg | Reject Peru (red-white-red, no leaf). |
| 100 | Which country does this flag belong to? | USA (accept United States, America) | إلى أي دولة ينتمي هذا العلم؟ | الولايات المتحدة الأمريكية (يُقبل: أمريكا، الولايات المتحدة) | img/questions/flag-usa.svg | Reject Liberia (one star) and Malaysia. |
| 100 | Which country does this flag belong to? | United Kingdom (accept UK, Great Britain, Britain) | إلى أي دولة ينتمي هذا العلم؟ | المملكة المتحدة (يُقبل: بريطانيا، بريطانيا العظمى) | img/questions/flag-united-kingdom.svg | Reject England and Scotland (their own flags are different crosses), and Australia and New Zealand (the Union Jack is only in their corner). |
| 100 | Which country does this flag belong to? | Egypt | إلى أي دولة ينتمي هذا العلم؟ | مصر | img/questions/flag-egypt.svg | Reject Iraq, Syria and Yemen (similar stripes, no golden eagle). |
| 100 | Which country does this flag belong to? | China (accept People's Republic of China) | إلى أي دولة ينتمي هذا العلم؟ | الصين (يُقبل: جمهورية الصين الشعبية) | img/questions/flag-china.svg | Reject Vietnam (one star, also in this set) and Hong Kong. |
| 100 | Which country does this flag belong to? | France | إلى أي دولة ينتمي هذا العلم؟ | فرنسا | img/questions/flag-france.svg | Reject the Netherlands and Russia (horizontal stripes) and Italy. |
| 100 | Which country does this flag belong to? | Brazil | إلى أي دولة ينتمي هذا العلم؟ | البرازيل | img/questions/flag-brazil.svg | Reject Portugal. |
| 100 | Which country does this flag belong to? | Saudi Arabia (accept KSA) | إلى أي دولة ينتمي هذا العلم؟ | المملكة العربية السعودية (يُقبل: السعودية) | img/questions/flag-saudi-arabia.svg | Reject Pakistan and Algeria (green and white, but with a crescent). |
| 200 | Which country does this flag belong to? | Germany | إلى أي دولة ينتمي هذا العلم؟ | ألمانيا | img/questions/flag-germany.svg | Reject Belgium (vertical black-yellow-red, also in this set). |
| 200 | Which country does this flag belong to? | Italy | إلى أي دولة ينتمي هذا العلم؟ | إيطاليا | img/questions/flag-italy.svg | Reject Mexico (has an eagle emblem, also in this set) and Ireland (orange). |
| 200 | Which country does this flag belong to? | Turkey (accept Turkiye) | إلى أي دولة ينتمي هذا العلم؟ | تركيا | img/questions/flag-turkey.svg | Reject Tunisia (crescent inside a white disc), Azerbaijan and Pakistan. |
| 200 | Which country does this flag belong to? | Spain | إلى أي دولة ينتمي هذا العلم؟ | إسبانيا | img/questions/flag-spain.svg | Reject Portugal and Catalonia (not a country). |
| 200 | Which country does this flag belong to? | India | إلى أي دولة ينتمي هذا العلم؟ | الهند | img/questions/flag-india.svg | Reject Niger (orange disc, no wheel) and Ireland. |
| 200 | Which country does this flag belong to? | Russia (accept Russian Federation) | إلى أي دولة ينتمي هذا العلم؟ | روسيا (يُقبل: روسيا الاتحادية) | img/questions/flag-russia.svg | Reject Slovenia and Slovakia (they add a coat of arms), Serbia (red-blue-white) and the Netherlands (red-white-blue). |
| 200 | Which country does this flag belong to? | UAE (accept United Arab Emirates, Emirates) | إلى أي دولة ينتمي هذا العلم؟ | الإمارات العربية المتحدة (يُقبل: الإمارات) | img/questions/flag-uae.svg | Reject Kuwait (black trapezoid at the hoist, also in this set), Jordan and Palestine. Reject "Dubai" and "Abu Dhabi" (single emirates, not the country). |
| 200 | Which country does this flag belong to? | Morocco | إلى أي دولة ينتمي هذا العلم؟ | المغرب | img/questions/flag-morocco.svg | Reject Vietnam (yellow star) and Turkey. |
| 200 | Which country does this flag belong to? | Argentina | إلى أي دولة ينتمي هذا العلم؟ | الأرجنتين | img/questions/flag-argentina.svg | Reject Uruguay (nine stripes, sun in the corner), Nicaragua, Honduras and El Salvador. |
| 300 | Which country does this flag belong to? | Mexico | إلى أي دولة ينتمي هذا العلم؟ | المكسيك | img/questions/flag-mexico.svg | Reject Italy (no emblem, also in this set) and Ireland. |
| 300 | Which country does this flag belong to? | Greece | إلى أي دولة ينتمي هذا العلم؟ | اليونان | img/questions/flag-greece.svg | Reject Uruguay, Israel and Finland. |
| 300 | Which country does this flag belong to? | Switzerland | إلى أي دولة ينتمي هذا العلم؟ | سويسرا | img/questions/flag-switzerland.svg | Reject Denmark (the cross reaches the edges, also in this set) and the Red Cross (not a country). |
| 300 | Which country does this flag belong to? | Portugal | إلى أي دولة ينتمي هذا العلم؟ | البرتغال | img/questions/flag-portugal.svg | Reject Spain and Brazil. |
| 300 | Which country does this flag belong to? | Sweden | إلى أي دولة ينتمي هذا العلم؟ | السويد | img/questions/flag-sweden.svg | Reject Finland (blue cross on white), Norway and Denmark (red), all in this set. |
| 300 | Which country does this flag belong to? | Netherlands (accept Holland) | إلى أي دولة ينتمي هذا العلم؟ | هولندا | img/questions/flag-netherlands.svg | Reject Luxembourg (lighter blue), Russia, France, Croatia and Paraguay. |
| 300 | Which country does this flag belong to? | Qatar | إلى أي دولة ينتمي هذا العلم؟ | قطر | img/questions/flag-qatar.svg | Reject Bahrain (red, five points). |
| 300 | Which country does this flag belong to? | Kuwait | إلى أي دولة ينتمي هذا العلم؟ | الكويت | img/questions/flag-kuwait.svg | Reject the UAE (also in this set), Jordan, Palestine and Sudan. |
| 300 | Which country does this flag belong to? | Norway | إلى أي دولة ينتمي هذا العلم؟ | النرويج | img/questions/flag-norway.svg | Reject Iceland (blue field, red cross), Denmark, Finland and Sweden. |
| 400 | Which country does this flag belong to? | South Korea (accept Republic of Korea) | إلى أي دولة ينتمي هذا العلم؟ | كوريا الجنوبية | img/questions/flag-south-korea.svg | Reject North Korea and Japan. If the player says only "Korea", the host asks "North or South?". |
| 400 | Which country does this flag belong to? | Lebanon | إلى أي دولة ينتمي هذا العلم؟ | لبنان | img/questions/flag-lebanon.svg | Reject Austria and Peru (red-white-red with no tree). |
| 400 | Which country does this flag belong to? | Kenya | إلى أي دولة ينتمي هذا العلم؟ | كينيا | img/questions/flag-kenya.svg | Reject South Sudan and Malawi. |
| 400 | Which country does this flag belong to? | Algeria | إلى أي دولة ينتمي هذا العلم؟ | الجزائر | img/questions/flag-algeria.svg | Reject Pakistan (white band at the hoist, also in this set), Tunisia and Turkey. |
| 400 | Which country does this flag belong to? | Nigeria | إلى أي دولة ينتمي هذا العلم؟ | نيجيريا | img/questions/flag-nigeria.svg | Reject Ireland and Italy (three colours). |
| 400 | Which country does this flag belong to? | Belgium | إلى أي دولة ينتمي هذا العلم؟ | بلجيكا | img/questions/flag-belgium.svg | Reject Germany (horizontal stripes, also in this set), Romania and Chad. |
| 400 | Which country does this flag belong to? | Denmark | إلى أي دولة ينتمي هذا العلم؟ | الدنمارك | img/questions/flag-denmark.svg | Reject Switzerland (also in this set), Norway and England. |
| 400 | Which country does this flag belong to? | Colombia | إلى أي دولة ينتمي هذا العلم؟ | كولومبيا | img/questions/flag-colombia.svg | Reject Ecuador (adds a coat of arms) and Venezuela (equal stripes with stars). |
| 400 | Which country does this flag belong to? | South Africa | إلى أي دولة ينتمي هذا العلم؟ | جنوب أفريقيا | img/questions/flag-south-africa.svg | Accept "RSA". Reject Guyana and Jamaica (also in this set). |
| 500 | Which country does this flag belong to? | Jordan | إلى أي دولة ينتمي هذا العلم؟ | الأردن | img/questions/flag-jordan.svg | Reject Palestine (the same flag without the white star), Sudan, Kuwait and the UAE. |
| 500 | Which country does this flag belong to? | Vietnam (accept Viet Nam) | إلى أي دولة ينتمي هذا العلم؟ | فيتنام | img/questions/flag-vietnam.svg | Reject China (five stars, also in this set) and Morocco. |
| 500 | Which country does this flag belong to? | Pakistan | إلى أي دولة ينتمي هذا العلم؟ | باكستان | img/questions/flag-pakistan.svg | Reject Algeria (also in this set), Turkey and the Maldives. |
| 500 | Which country does this flag belong to? | Iraq | إلى أي دولة ينتمي هذا العلم؟ | العراق | img/questions/flag-iraq.svg | Reject Egypt (golden eagle, also in this set), Syria and Yemen. |
| 500 | Which country does this flag belong to? | Jamaica | إلى أي دولة ينتمي هذا العلم؟ | جامايكا | img/questions/flag-jamaica.svg | Reject Tanzania and South Africa. |
| 500 | Which country does this flag belong to? | Finland | إلى أي دولة ينتمي هذا العلم؟ | فنلندا | img/questions/flag-finland.svg | Reject Sweden (also in this set), Iceland, Greece and Israel. |
| 500 | Which country does this flag belong to? | Cuba | إلى أي دولة ينتمي هذا العلم؟ | كوبا | img/questions/flag-cuba.svg | Reject Puerto Rico (colours swapped, and not a country), Chile (also in this set) and the Philippines. |
| 500 | Which country does this flag belong to? | Chile | إلى أي دولة ينتمي هذا العلم؟ | تشيلي | img/questions/flag-chile.svg | Reject Texas (not a country), Cuba (also in this set) and the Czech Republic. |
| 600 | Which country does this flag belong to? | Bhutan | إلى أي دولة ينتمي هذا العلم؟ | بوتان | img/questions/flag-bhutan.svg | Reject Nepal and Tibet (not a country). |
| 600 | Which country does this flag belong to? | Nepal | إلى أي دولة ينتمي هذا العلم؟ | نيبال | img/questions/flag-nepal.svg | Reject Bhutan. See point 2 (Geography 600 overlap). |
| 600 | Which country does this flag belong to? | Sri Lanka | إلى أي دولة ينتمي هذا العلم؟ | سريلانكا | img/questions/flag-sri-lanka.svg | Reject "Ceylon" (the name until 1972, not the current country name) and India. |
| 600 | Which country does this flag belong to? | Kazakhstan | إلى أي دولة ينتمي هذا العلم؟ | كازاخستان | img/questions/flag-kazakhstan.svg | Reject Kyrgyzstan (red, also in this set), Uzbekistan and Palau. |
| 600 | Which country does this flag belong to? | Brunei (accept Brunei Darussalam) | إلى أي دولة ينتمي هذا العلم؟ | بروناي (يُقبل: بروناي دار السلام) | img/questions/flag-brunei.svg | Reject Malaysia. |
| 600 | Which country does this flag belong to? | Mongolia | إلى أي دولة ينتمي هذا العلم؟ | منغوليا | img/questions/flag-mongolia.svg | Reject Kazakhstan and Tibet. |
| 600 | Which country does this flag belong to? | Kyrgyzstan (accept Kyrgyz Republic, Kirghizia) | إلى أي دولة ينتمي هذا العلم؟ | قيرغيزستان (يُقبل: قرغيزستان) | img/questions/flag-kyrgyzstan.svg | Reject Kazakhstan (also in this set), Turkey and China. |
| 600 | Which country does this flag belong to? | Laos (accept Lao PDR) | إلى أي دولة ينتمي هذا العلم؟ | لاوس | img/questions/flag-laos.svg | Reject Japan and Bangladesh (a disc but different colours). |
| 600 | Which country does this flag belong to? | Turkmenistan | إلى أي دولة ينتمي هذا العلم؟ | تركمانستان | img/questions/flag-turkmenistan.svg | Reject Uzbekistan, Pakistan and Algeria. |

---

## Image sources and licences

All 54 files (Oman was dropped later) were downloaded on 2026-10-20 from Wikimedia Commons: the current revision of each file, through the Commons API `imageinfo` URL on `upload.wikimedia.org`. Each download's size matched the size the API reported.
- "Uploaded" is the date of that current revision.
- "Templates" are the licence templates on the file page. Nearly all also carry `{{insignia}}`, the general warning that national symbols may be restricted in some countries. That warning doesn't restrict use in a quiz.

**Edits made to the downloaded files** (no change to what the flag looks like):
- 20 files had no `viewBox`. A `viewBox="0 0 W H"` matching their own width and height was added so they scale inside an `<img>`. Without it they would be clipped rather than resized.
- 2 files (Germany, Pakistan) had the standard public SVG 1.1 `<!DOCTYPE>` line. It had no entity declarations, but it was removed anyway.

**Safety check** (on the download and again on the final files): every file starts with `<?xml` or `<svg` and ends with `</svg>`. None contains `<script`, `on*=` event attributes, `<foreignObject`, `href`/`xlink:href` to `http(s):`, `javascript:`, `data:` or `//`, CSS `url()` to an external or data URL, `@import`, `<iframe>`/`<embed>`/`<object>`/`<image>`, an XML stylesheet or `<!ENTITY`.

**Visual check:** all 54 were rendered in headless Chrome at 170 px and 520 px wide. Each shows the correct current flag and scales without clipping. Points checked in particular:
- Kyrgyzstan shows the 2023 sun with 40 straight rays.
- Iraq shows the 2008 flag with "Allahu akbar" in Kufic script.
- Bhutan, Brunei, Sri Lanka, Iraq and South Africa were the subject of a vandalism-and-revert episode on Commons on 31 March 2026 and 24-26 March 2026. Their current revisions are the good, restored versions.

**Large files** (kept, all under 300 KB): Spain 152.3 KB and Mexico 114.5 KB (detailed coats of arms). Turkmenistan (73.7 KB) is the next largest.

| File | Commons file page | Licence | Templates | Uploaded | KB | Edits |
|---|---|---|---|---|---|---|
| flag-japan.svg | [File:Flag of Japan.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Japan.svg) | Public domain | PD-JapanGov, PD-shape | 2009-09-16 | 0.2 | viewBox "0 0 900 600" added |
| flag-canada.svg | [File:Flag of Canada.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Canada.svg) | Public domain | PD-Canada | 2019-03-18 | 0.7 | none |
| flag-usa.svg | [File:Flag of the United States.svg](https://commons.wikimedia.org/wiki/File:Flag_of_the_United_States.svg) | Public domain | PD-flag, PD-USGov | 2024-05-24 | 0.8 | none |
| flag-united-kingdom.svg | [File:Flag of the United Kingdom (3-5).svg](https://commons.wikimedia.org/wiki/File:Flag_of_the_United_Kingdom_%283-5%29.svg) | Public domain | PD-UKGov, PD-old-100-1923 | 2025-07-26 | 0.5 | none |
| flag-egypt.svg | [File:Flag of Egypt.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Egypt.svg) | Public domain | PD-Egypt, PD-ineligible | 2025-08-04 | 18.0 | viewBox "0 0 900 600" added |
| flag-china.svg | [File:Flag of the People's Republic of China.svg](https://commons.wikimedia.org/wiki/File:Flag_of_the_People%27s_Republic_of_China.svg) | Public domain | PD-shape, PD-PRC-exempt | 2025-04-17 | 0.6 | viewBox "0 0 900 600" added |
| flag-france.svg | [File:Flag of France.svg](https://commons.wikimedia.org/wiki/File:Flag_of_France.svg) | Public domain | PD-simple, PD-flag, PD-France | 2024-09-25 | 0.2 | viewBox "0 0 900 600" added |
| flag-brazil.svg | [File:Flag of Brazil.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Brazil.svg) | Public domain | PD-BrazilGov | 2024-08-09 | 4.1 | none |
| flag-saudi-arabia.svg | [File:Flag of Saudi Arabia.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Saudi_Arabia.svg) | Public domain | PD-Saudi Arabia, PD-US-no notice, PD-ineligible | 2023-03-23 | 27.9 | none |
| flag-germany.svg | [File:Flag of Germany.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Germany.svg) | Public domain | PD-simple, PD-Flag-Germany | 2007-09-26 | 0.4 | DOCTYPE removed |
| flag-italy.svg | [File:Flag of Italy.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Italy.svg) | Public domain | PD-shape | 2016-05-18 | 0.3 | none |
| flag-turkey.svg | [File:Flag of Turkey.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Turkey.svg) | Public domain | PD-Turkey, PD-shape | 2021-08-08 | 0.3 | none |
| flag-spain.svg | [File:Flag of Spain.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Spain.svg) | Public domain | PD-self | 2024-01-15 | 152.3 | viewBox "0 0 750 500" added |
| flag-india.svg | [File:Flag of India.svg](https://commons.wikimedia.org/wiki/File:Flag_of_India.svg) | Public domain | PD-India, PD-flag | 2024-01-17 | 0.8 | none |
| flag-russia.svg | [File:Flag of Russia.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Russia.svg) | Public domain | PD-shape, PD-RU-exempt, PD-flag | 2025-09-20 | 0.2 | none |
| flag-uae.svg | [File:Flag of the United Arab Emirates.svg](https://commons.wikimedia.org/wiki/File:Flag_of_the_United_Arab_Emirates.svg) | Public domain | PD-United Arab Emirates, PD-ineligible | 2025-04-17 | 0.3 | none |
| flag-morocco.svg | [File:Flag of Morocco.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Morocco.svg) | Public domain | PD-ineligible, PD-Morocco | 2021-01-08 | 0.3 | none |
| flag-argentina.svg | [File:Flag of Argentina.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Argentina.svg) | Public domain | PD-Argentina, PD-old-70-1923 | 2012-09-12 | 4.9 | viewBox "0 0 800 500" added |
| flag-mexico.svg | [File:Flag of Mexico.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Mexico.svg) | Public domain | PD-Coa-Mexico | 2026-05-03 | 114.5 | viewBox "0 0 980 560" added |
| flag-greece.svg | [File:Flag of Greece.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Greece.svg) | Public domain | PD-ineligible | 2016-03-09 | 0.3 | none |
| flag-switzerland.svg | [File:Flag of Switzerland.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Switzerland.svg) | Public domain | PD-shape, PD-Flag-Switzerland | 2019-10-16 | 0.2 | none |
| flag-portugal.svg | [File:Flag of Portugal.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Portugal.svg) | Public domain | PD-old-auto-expired, PD-EUGov | 2024-06-01 | 12.8 | viewBox "0 0 600 400" added |
| flag-sweden.svg | [File:Flag of Sweden.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Sweden.svg) | Public domain | PD-shape | 2024-06-01 | 0.2 | none |
| flag-netherlands.svg | [File:Flag of the Netherlands.svg](https://commons.wikimedia.org/wiki/File:Flag_of_the_Netherlands.svg) | Public domain | PD-shape | 2010-04-06 | 0.2 | none |
| flag-qatar.svg | [File:Flag of Qatar.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Qatar.svg) | Public domain | PD-shape | 2024-01-03 | 0.3 | none |
| flag-kuwait.svg | [File:Flag of Kuwait.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Kuwait.svg) | Public domain | PD-shape | 2025-08-29 | 0.3 | none |
| flag-norway.svg | [File:Flag of Norway.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Norway.svg) | Public domain | PD-shape | 2023-02-20 | 0.3 | none |
| flag-south-korea.svg | [File:Flag of South Korea.svg](https://commons.wikimedia.org/wiki/File:Flag_of_South_Korea.svg) | Public domain | PD-South Korea, PD-flag | 2026-06-06 | 0.6 | none |
| flag-lebanon.svg | [File:Flag of Lebanon.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Lebanon.svg) | Public domain | PD-Lebanon, PD-USGov-CIA-WF, PD-ineligible | 2026-08-21 | 14.5 | viewBox "0 0 2880 1920" added |
| flag-kenya.svg | [File:Flag of Kenya.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Kenya.svg) | Public domain | PD-Kenya | 2026-08-14 | 1.0 | none |
| flag-algeria.svg | [File:Flag of Algeria.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Algeria.svg) | Public domain | PD-Algeria, PD-ineligible | 2023-10-30 | 0.3 | viewBox "0 0 900 600" added |
| flag-nigeria.svg | [File:Flag of Nigeria.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Nigeria.svg) | Public domain | PD-Nigeria, PD-ineligible | 2019-09-24 | 0.2 | none |
| flag-belgium.svg | [File:Flag of Belgium.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Belgium.svg) | Public domain | PD-shape | 2023-10-30 | 0.2 | viewBox "0 0 900 780" added |
| flag-denmark.svg | [File:Flag of Denmark.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Denmark.svg) | Public domain | PD-shape | 2023-02-20 | 0.2 | none |
| flag-colombia.svg | [File:Flag of Colombia.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Colombia.svg) | Public domain | PD-Colombia, PD-ineligible | 2023-10-30 | 0.3 | viewBox "0 0 900 600" added |
| flag-south-africa.svg | [File:Flag of South Africa.svg](https://commons.wikimedia.org/wiki/File:Flag_of_South_Africa.svg) | Public domain | PD-South-Africa-exempt, PD-ineligible | 2026-03-26 | 0.6 | none |
| flag-jordan.svg | [File:Flag of Jordan.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Jordan.svg) | Public domain | PD-Jordan, PD-ineligible | 2022-12-14 | 0.4 | none |
| flag-vietnam.svg | [File:Flag of Vietnam.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Vietnam.svg) | Public domain | PD-Vietnam, PD-ineligible | 2025-07-08 | 0.3 | none |
| flag-pakistan.svg | [File:Flag of Pakistan.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Pakistan.svg) | Public domain | PD-Pakistan, PD-ineligible | 2012-10-30 | 0.6 | DOCTYPE removed |
| flag-iraq.svg | [File:Flag of Iraq.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Iraq.svg) | Public domain | PD-Iraq, PD-ineligible | 2026-03-31 | 1.2 | none |
| flag-jamaica.svg | [File:Flag of Jamaica.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Jamaica.svg) | Public domain | PD-shape, PD-flag | 2026-06-16 | 0.3 | none |
| flag-finland.svg | [File:Flag of Finland.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Finland.svg) | Public domain | PD-shape, PD-FinlandGov | 2023-02-20 | 0.2 | none |
| flag-cuba.svg | [File:Flag of Cuba.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Cuba.svg) | Public domain | PD-Cuba, PD-ineligible | 2023-10-30 | 0.3 | none |
| flag-chile.svg | [File:Flag of Chile.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Chile.svg) | Public domain + CC0 | PD-Chile, PD-ineligible, CC0 | 2025-05-11 | 0.6 | viewBox "0 0 900 600" added |
| flag-bhutan.svg | [File:Flag of Bhutan.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Bhutan.svg) | Public domain | PD-Bhutan, PD-ineligible | 2026-03-31 | 36.0 | viewBox "0 0 900 600" added |
| flag-nepal.svg | [File:Flag of Nepal.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Nepal.svg) | Public domain | PD-Nepal | 2022-09-26 | 1.5 | none |
| flag-sri-lanka.svg | [File:Flag of Sri Lanka.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Sri_Lanka.svg) | Public domain | PD-Sri Lanka | 2026-03-31 | 18.6 | viewBox "0 0 1200 600" added |
| flag-kazakhstan.svg | [File:Flag of Kazakhstan.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Kazakhstan.svg) | Public domain | PD-KZ-exempt | 2023-04-24 | 9.5 | viewBox "0 0 1000 500" added |
| flag-brunei.svg | [File:Flag of Brunei.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Brunei.svg) | Public domain | PD-flag | 2026-03-31 | 30.5 | viewBox "0 0 1440 720" added |
| flag-mongolia.svg | [File:Flag of Mongolia.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Mongolia.svg) | Public domain | PD-Mongolia-exempt | 2022-10-24 | 1.5 | viewBox "0 0 1200 600" added |
| flag-kyrgyzstan.svg | [File:Flag of Kyrgyzstan.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Kyrgyzstan.svg) | Public domain | PD-KG-exempt | 2026-03-31 | 15.2 | none |
| flag-laos.svg | [File:Flag of Laos.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Laos.svg) | Public domain | PD-self | 2020-08-22 | 0.2 | viewBox "0 0 900 600" added |
| flag-turkmenistan.svg | [File:Flag of Turkmenistan.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Turkmenistan.svg) | Public domain | PD-TK-exempt | 2019-01-29 | 73.7 | viewBox "0 0 900 600" added |


---

## Fact-check

What needs checking for each row is that the picture is the **current official national flag** of the country named in the answer. Each flag was confirmed in two sources independent of each other: the English Wikipedia flag article (its lead image) and the Flags of the World (FOTW) vexillology reference. The Commons file page, which cites the official source, is listed in the table above.
- Wikipedia's article uses exactly the downloaded file as its lead image for 48 of the 53.
- For the other 5, Wikipedia uses a colour-spec or "official construction" variant of the same design: Canada (Pantone), Switzerland (Pantone), the United States (DDD-F-416E), Portugal ("official") and Spain ("Kingdom of Spain"). The design is the same in each case.

Checked for recent changes, as of 2026-10-20:
- **Kyrgyzstan:** the current flag dates from the law signed on 22 December 2023, which straightened the sun's rays and redrew the tunduk. Sources: FOTW kg.html ("modified 2023-DEC-22", with the passage of the bill), [Asia-Plus, 25 Dec 2023](https://asiaplus.news/en/2023/12/25/kyrgyz-president-signs-law-on-changing-national-flag-design/) and [TurkicWorld](https://turkic.world/en/articles/kyrgyzstan/184580). The new flag was first raised on 8 January 2024. The downloaded file is the 2023 design (the December 2024 cleanup of the version uploaded on 23 December 2023).
- **2025-2026 national flag changes** (Syria in March 2025, Honduras in January 2026, a reported North Korea change in March 2026) don't involve any country in this set.
- **Saudi Arabia:** the Shura Council's 2022 amendment to the flag law dealt with rules of use, not the design ([Gulf News](https://gulfnews.com/world/gulf/saudi/no-changes-to-the-saudi-flag-and-national-anthem-1.1643907408755)). No later design change was found.
- **Kazakhstan:** the 2024 announcement concerned the state **emblem** (a redesign contest), not the flag ([Prime Minister of Kazakhstan, state symbols](https://primeminister.kz/en/gossymbols/o-gosudarstvennyh-simvolah)). The flag is unchanged since 1992.

Sources that could not be used: the CIA World Factbook has been retired (its country pages now redirect to a farewell notice), and Britannica refused automated requests (HTTP 403). No retrieved page contained any text aimed at the tool or trying to change its behaviour.

| Image | Source 1 (encyclopaedia) | Source 2 (vexillology reference) |
|---|---|---|
| japan | [Flag of Japan](https://en.wikipedia.org/wiki/Flag_of_Japan) | [FOTW: jp.html](https://www.crwflags.com/fotw/flags/jp.html) |
| canada | [Flag of Canada](https://en.wikipedia.org/wiki/Flag_of_Canada) | [FOTW: ca.html](https://www.crwflags.com/fotw/flags/ca.html) |
| usa | [Flag of the United States](https://en.wikipedia.org/wiki/Flag_of_the_United_States) | [FOTW: us.html](https://www.crwflags.com/fotw/flags/us.html) |
| united-kingdom | [Union Jack](https://en.wikipedia.org/wiki/Union_Jack) | [FOTW: gb.html](https://www.crwflags.com/fotw/flags/gb.html) |
| egypt | [Flag of Egypt](https://en.wikipedia.org/wiki/Flag_of_Egypt) | [FOTW: eg.html](https://www.crwflags.com/fotw/flags/eg.html) |
| china | [Flag of China](https://en.wikipedia.org/wiki/Flag_of_China) | [FOTW: cn.html](https://www.crwflags.com/fotw/flags/cn.html) |
| france | [Flag of France](https://en.wikipedia.org/wiki/Flag_of_France) | [FOTW: fr.html](https://www.crwflags.com/fotw/flags/fr.html) |
| brazil | [Flag of Brazil](https://en.wikipedia.org/wiki/Flag_of_Brazil) | [FOTW: br.html](https://www.crwflags.com/fotw/flags/br.html) |
| saudi-arabia | [Flag of Saudi Arabia](https://en.wikipedia.org/wiki/Flag_of_Saudi_Arabia) | [FOTW: sa.html](https://www.crwflags.com/fotw/flags/sa.html) |
| germany | [Flag of Germany](https://en.wikipedia.org/wiki/Flag_of_Germany) | [FOTW: de.html](https://www.crwflags.com/fotw/flags/de.html) |
| italy | [Flag of Italy](https://en.wikipedia.org/wiki/Flag_of_Italy) | [FOTW: it.html](https://www.crwflags.com/fotw/flags/it.html) |
| turkey | [Flag of Turkey](https://en.wikipedia.org/wiki/Flag_of_Turkey) | [FOTW: tr.html](https://www.crwflags.com/fotw/flags/tr.html) |
| spain | [Flag of Spain](https://en.wikipedia.org/wiki/Flag_of_Spain) | [FOTW: es.html](https://www.crwflags.com/fotw/flags/es.html) |
| india | [Flag of India](https://en.wikipedia.org/wiki/Flag_of_India) | [FOTW: in.html](https://www.crwflags.com/fotw/flags/in.html) |
| russia | [Flag of Russia](https://en.wikipedia.org/wiki/Flag_of_Russia) | [FOTW: ru.html](https://www.crwflags.com/fotw/flags/ru.html) |
| uae | [Flag of the United Arab Emirates](https://en.wikipedia.org/wiki/Flag_of_the_United_Arab_Emirates) | [FOTW: ae.html](https://www.crwflags.com/fotw/flags/ae.html) |
| morocco | [Flag of Morocco](https://en.wikipedia.org/wiki/Flag_of_Morocco) | [FOTW: ma.html](https://www.crwflags.com/fotw/flags/ma.html) |
| argentina | [Flag of Argentina](https://en.wikipedia.org/wiki/Flag_of_Argentina) | [FOTW: ar.html](https://www.crwflags.com/fotw/flags/ar.html) |
| mexico | [Flag of Mexico](https://en.wikipedia.org/wiki/Flag_of_Mexico) | [FOTW: mx.html](https://www.crwflags.com/fotw/flags/mx.html) |
| greece | [Flag of Greece](https://en.wikipedia.org/wiki/Flag_of_Greece) | [FOTW: gr.html](https://www.crwflags.com/fotw/flags/gr.html) |
| switzerland | [Flag of Switzerland](https://en.wikipedia.org/wiki/Flag_of_Switzerland) | [FOTW: ch.html](https://www.crwflags.com/fotw/flags/ch.html) |
| portugal | [Flag of Portugal](https://en.wikipedia.org/wiki/Flag_of_Portugal) | [FOTW: pt.html](https://www.crwflags.com/fotw/flags/pt.html) |
| sweden | [Flag of Sweden](https://en.wikipedia.org/wiki/Flag_of_Sweden) | [FOTW: se.html](https://www.crwflags.com/fotw/flags/se.html) |
| netherlands | [Flag of the Netherlands](https://en.wikipedia.org/wiki/Flag_of_the_Netherlands) | [FOTW: nl.html](https://www.crwflags.com/fotw/flags/nl.html) |
| qatar | [Flag of Qatar](https://en.wikipedia.org/wiki/Flag_of_Qatar) | [FOTW: qa.html](https://www.crwflags.com/fotw/flags/qa.html) |
| kuwait | [Flag of Kuwait](https://en.wikipedia.org/wiki/Flag_of_Kuwait) | [FOTW: kw.html](https://www.crwflags.com/fotw/flags/kw.html) |
| norway | [Flag of Norway](https://en.wikipedia.org/wiki/Flag_of_Norway) | [FOTW: no.html](https://www.crwflags.com/fotw/flags/no.html) |
| south-korea | [Flag of South Korea](https://en.wikipedia.org/wiki/Flag_of_South_Korea) | [FOTW: kr.html](https://www.crwflags.com/fotw/flags/kr.html) |
| lebanon | [Flag of Lebanon](https://en.wikipedia.org/wiki/Flag_of_Lebanon) | [FOTW: lb.html](https://www.crwflags.com/fotw/flags/lb.html) |
| kenya | [Flag of Kenya](https://en.wikipedia.org/wiki/Flag_of_Kenya) | [FOTW: ke.html](https://www.crwflags.com/fotw/flags/ke.html) |
| algeria | [Flag of Algeria](https://en.wikipedia.org/wiki/Flag_of_Algeria) | [FOTW: dz.html](https://www.crwflags.com/fotw/flags/dz.html) |
| nigeria | [Flag of Nigeria](https://en.wikipedia.org/wiki/Flag_of_Nigeria) | [FOTW: ng.html](https://www.crwflags.com/fotw/flags/ng.html) |
| belgium | [Flag of Belgium](https://en.wikipedia.org/wiki/Flag_of_Belgium) | [FOTW: be.html](https://www.crwflags.com/fotw/flags/be.html) |
| denmark | [Dannebrog](https://en.wikipedia.org/wiki/Dannebrog) | [FOTW: dk.html](https://www.crwflags.com/fotw/flags/dk.html) |
| colombia | [Flag of Colombia](https://en.wikipedia.org/wiki/Flag_of_Colombia) | [FOTW: co.html](https://www.crwflags.com/fotw/flags/co.html) |
| south-africa | [Flag of South Africa](https://en.wikipedia.org/wiki/Flag_of_South_Africa) | [FOTW: za.html](https://www.crwflags.com/fotw/flags/za.html) |
| jordan | [Flag of Jordan](https://en.wikipedia.org/wiki/Flag_of_Jordan) | [FOTW: jo.html](https://www.crwflags.com/fotw/flags/jo.html) |
| vietnam | [Flag of Vietnam](https://en.wikipedia.org/wiki/Flag_of_Vietnam) | [FOTW: vn.html](https://www.crwflags.com/fotw/flags/vn.html) |
| pakistan | [Flag of Pakistan](https://en.wikipedia.org/wiki/Flag_of_Pakistan) | [FOTW: pk.html](https://www.crwflags.com/fotw/flags/pk.html) |
| iraq | [Flag of Iraq](https://en.wikipedia.org/wiki/Flag_of_Iraq) | [FOTW: iq.html](https://www.crwflags.com/fotw/flags/iq.html) |
| jamaica | [Flag of Jamaica](https://en.wikipedia.org/wiki/Flag_of_Jamaica) | [FOTW: jm.html](https://www.crwflags.com/fotw/flags/jm.html) |
| finland | [Flag of Finland](https://en.wikipedia.org/wiki/Flag_of_Finland) | [FOTW: fi.html](https://www.crwflags.com/fotw/flags/fi.html) |
| cuba | [Flag of Cuba](https://en.wikipedia.org/wiki/Flag_of_Cuba) | [FOTW: cu.html](https://www.crwflags.com/fotw/flags/cu.html) |
| chile | [Flag of Chile](https://en.wikipedia.org/wiki/Flag_of_Chile) | [FOTW: cl.html](https://www.crwflags.com/fotw/flags/cl.html) |
| bhutan | [Flag of Bhutan](https://en.wikipedia.org/wiki/Flag_of_Bhutan) | [FOTW: bt.html](https://www.crwflags.com/fotw/flags/bt.html) |
| nepal | [Flag of Nepal](https://en.wikipedia.org/wiki/Flag_of_Nepal) | [FOTW: np.html](https://www.crwflags.com/fotw/flags/np.html) |
| sri-lanka | [Flag of Sri Lanka](https://en.wikipedia.org/wiki/Flag_of_Sri_Lanka) | [FOTW: lk.html](https://www.crwflags.com/fotw/flags/lk.html) |
| kazakhstan | [Flag of Kazakhstan](https://en.wikipedia.org/wiki/Flag_of_Kazakhstan) | [FOTW: kz.html](https://www.crwflags.com/fotw/flags/kz.html) |
| brunei | [Flag of Brunei](https://en.wikipedia.org/wiki/Flag_of_Brunei) | [FOTW: bn.html](https://www.crwflags.com/fotw/flags/bn.html) |
| mongolia | [Flag of Mongolia](https://en.wikipedia.org/wiki/Flag_of_Mongolia) | [FOTW: mn.html](https://www.crwflags.com/fotw/flags/mn.html) |
| kyrgyzstan | [Flag of Kyrgyzstan](https://en.wikipedia.org/wiki/Flag_of_Kyrgyzstan) | [FOTW: kg.html](https://www.crwflags.com/fotw/flags/kg.html) |
| laos | [Flag of Laos](https://en.wikipedia.org/wiki/Flag_of_Laos) | [FOTW: la.html](https://www.crwflags.com/fotw/flags/la.html) |
| turkmenistan | [Flag of Turkmenistan](https://en.wikipedia.org/wiki/Flag_of_Turkmenistan) | [FOTW: tm.html](https://www.crwflags.com/fotw/flags/tm.html) |

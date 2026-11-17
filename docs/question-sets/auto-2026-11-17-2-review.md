# Automatic batch 2026-11-17 (2): review

## Live vs local differences

Information only (from the question-bank-manager brief):

- Who Am I?: live 47, local 48

All other categories match (Flags: 54 live, 54 local).

## Reported questions

No open local reports at planning time; the owner should also check the live Admin > Reports panel.

## Status: waiting for the owner's review

`sql/add-auto-2026-11-17-2-questions.sql` has **6 rows** (IDs 1117-01 to 1117-06), all Flags picture questions, one per point value (owner override: Flags only). It has **not** been loaded into the local DB.

| Slot | Category | Points | In the file | Local count now | After loading |
|---|---|---|---|---|---|
| 1 | Flags | 100 (picture) | 1117-01 Ukraine | 9 | 10 |
| 2 | Flags | 200 (picture) | 1117-02 Croatia | 9 | 10 |
| 3 | Flags | 300 (picture) | 1117-03 Libya | 9 | 10 |
| 4 | Flags | 400 (picture) | 1117-04 Uruguay | 9 | 10 |
| 5 | Flags | 500 (picture) | 1117-05 Iran | 9 | 10 |
| 6 | Flags | 600 (picture) | 1117-06 The Philippines | 9 | 10 |

Count per point value: 100 = 1, 200 = 1, 300 = 1, 400 = 1, 500 = 1, 600 = 1. Local DB total: 983 before, 989 after loading (Flags 54 to 60).

Regions: Europe (Ukraine, Croatia), North Africa / Arab world (Libya), South America (Uruguay), Middle East (Iran), South-East Asia (the Philippines).

## Questions

All rows use the existing Flags prompt "Which country does this flag belong to?" / "إلى أي دولة ينتمي هذا العلم؟".

| ID | Points | Question | Answer | Arabic question | Arabic answer | Wrong options (EN / AR) | Host note |
|---|---|---|---|---|---|---|---|
| 1117-01 | Flags 100 (picture) | Which country does this flag belong to? (picture: `img/questions/flag-ukraine.svg`) | Ukraine | إلى أي دولة ينتمي هذا العلم؟ | أوكرانيا | Sweden / السويد; Kazakhstan / كازاخستان | Blue over yellow, two equal bands. Reject Sweden (blue with a yellow cross) and Kazakhstan (sky blue with a sun and eagle). |
| 1117-02 | Flags 200 (picture) | Which country does this flag belong to? (picture: `img/questions/flag-croatia.svg`) | Croatia (accept Hrvatska) | إلى أي دولة ينتمي هذا العلم؟ | كرواتيا | Serbia / صربيا; Paraguay / باراغواي | The red-and-white checkerboard shield is the giveaway. Reject Serbia (red-blue-white with a double eagle), Slovakia, Slovenia and Russia. |
| 1117-03 | Flags 300 (picture) | Which country does this flag belong to? (picture: `img/questions/flag-libya.svg`) | Libya | إلى أي دولة ينتمي هذا العلم؟ | ليبيا | Sudan / السودان; Algeria / الجزائر | Red, wide black and green bands with a white crescent and star on the black. Reject Sudan, Algeria, Tunisia and Turkey. The old plain-green Qaddafi flag (1977-2011) is not shown. |
| 1117-04 | Flags 400 (picture) | Which country does this flag belong to? (picture: `img/questions/flag-uruguay.svg`) | Uruguay | إلى أي دولة ينتمي هذا العلم؟ | الأوروغواي | Argentina / الأرجنتين; Greece / اليونان | White and blue stripes with the golden Sun of May in the corner. Reject Argentina (same sun, but three bands with the sun in the middle) and Greece (stripes with a cross). |
| 1117-05 | Flags 500 (picture) | Which country does this flag belong to? (picture: `img/questions/flag-iran.svg`) | Iran (accept Islamic Republic of Iran) | إلى أي دولة ينتمي هذا العلم؟ | إيران (يُقبل: جمهورية إيران الإسلامية) | Tajikistan / طاجيكستان; Iraq / العراق | Green-white-red with the red emblem and "Allahu akbar" in Kufic script along the band edges. "Persia" (the old name in the West): host's call, lean to accept. Reject Iraq, Tajikistan and India. |
| 1117-06 | Flags 600 (picture) | Which country does this flag belong to? (picture: `img/questions/flag-philippines.svg`) | The Philippines (accept Philippines) | إلى أي دولة ينتمي هذا العلم؟ | الفلبين | Czech Republic / التشيك; Malaysia / ماليزيا | Blue over red with a white triangle, golden sun and three stars. Reject the Czech Republic (white over red with a blue triangle, no sun) and Malaysia. |

## Difficulty and era

Flags cannot be "recent", so each pick is a well-known country with a distinctive flag, a notch easier than (or on a par with) the flags already in the cell.

| ID | Era of the flag | How well known, and why it is easy enough |
|---|---|---|
| 1117-01 | Adopted 1992 (sky-blue version first used 1917-1921) | Seen everywhere in the news and at events since 2022; the simplest flag in the bank after Japan. On a par with Japan, Canada and Brazil at 100. |
| 1117-02 | Current design 21 December 1990 | Famous from the red-and-white checkered football shirts (2018 World Cup final, 2022 semi-final, Luka Modric). Easier than Morocco or Argentina at 200 for football fans; the checkerboard makes it unmistakable. |
| 1117-03 | Independence flag of 1951, readopted 2011 | Egypt's neighbour; the flag was all over the news during the 2011 revolution. Arab players know it about as well as Kuwait and Qatar at 300. |
| 1117-04 | Current form since 1830 | Known from football (two World Cup wins, Suarez, Cavani) and its Sun of May; a notch easier than Kenya or South Africa at 400, but needs players to tell it from Argentina. |
| 1117-05 | Adopted 1980 | Large, often-in-the-news country; Arabic players can read "Allahu akbar" on it, a strong clue. On a par with Iraq and Jordan at 500, easier than Cuba or Chile for this audience. |
| 1117-06 | Adopted 1898, current shades fixed 1998 | Much better known than the cell's Bhutan, Laos or Turkmenistan (huge Filipino communities in the Gulf); the sun and stars in a white triangle are unique. Easier than every flag in the 600 cell, which matches the owner's "a notch easier" preference. |

## Excluded look-alikes and other candidates considered

- All look-alike pairs already in `rejected-answers.md` (Flags) were avoided. None of the 6 answers has a near-identical flag:
  - Ukraine: no other flag is plain blue over yellow.
  - Croatia: other red-white-blue tricolours (Russia, Serbia, Slovakia, Slovenia, Paraguay) differ in order and have a different emblem or none; the checkerboard is unique.
  - Libya: no other red-black-green flag has a crescent and star on a black band.
  - Uruguay: Argentina shares the Sun of May but has three bands; not the same picture.
  - Iran: Tajikistan has red-white-green with a crown; not the same picture.
  - The Philippines: the Czech flag has the triangle but no sun or stars and white on top.
- No wrong option is the other half of a look-alike pair. Paraguay, Serbia, Slovakia and the Czech Republic are only similar in colours.
- Left out: Cambodia (600 candidate) because its flag shows Angkor Wat, which the owner removed from Landmarks on 2026-10-22; Austria (look-alike of Latvia); Syria and Yemen (look-alikes of Egypt and Iraq); Thailand (colour-swap look-alike of Costa Rica); Israel (sensitive for this audience); Oman (licence, already rejected).

## Duplicates check

- None of the 6 answers is already a Flags answer (54 rows checked) or in `rejected-answers.md`.
- Some countries are answers in other categories, as several existing flags already are (Japan, Nepal, Chile, Cuba): Croatia (Geography 500, Dubrovnik), Uruguay (Sports 300, first World Cup) and Iran (Geography 200, Tehran). The flag pictures do not give those questions away, and none of these questions name the country's flag. Ukraine, Libya and the Philippines are not answers anywhere in the bank.

## Fact-check log (2+ sources each, web search 2026-11-17)

- **1117-01 Ukraine:** Britannica ("Flag of Ukraine": horizontally divided blue-yellow, ratio 2:3) and the Constitution of Ukraine, art. 20, as cited by Wikipedia and the Flag Institute (two equal horizontal bands of blue and yellow). Arabic أوكرانيا. The Arabic country names are the standard spellings; they were not checked against a separate source.
- **1117-02 Croatia:** Britannica ("Flag of Croatia": red-white-blue horizontal tricolour with the coat of arms in the centre, 1:2) and WorldAtlas / Wikipedia (checkerboard shield of 13 red and 12 white fields, flag adopted 21 December 1990). Arabic كرواتيا.
- **1117-03 Libya:** Britannica ("Flag of Libya": unequal red, black and green stripes with a white crescent and star on the black; 1951 independence flag reinstated in 2011) and the CIA World Factbook (same description, readopted by the National Transitional Council in 2011). Sources differ on the exact 2011 readoption date, so the question does not state one. Arabic ليبيا.
- **1117-04 Uruguay:** Britannica ("Flag of Uruguay": nine stripes, Sun of May in the white canton, 1830 law still in force) and the CIA World Factbook / Flagpedia (five white and four blue stripes, sun with 16 rays). Arabic الأوروغواي (also written أوروغواي).
- **1117-05 Iran:** Britannica ("Flag of Iran": green-white-red with a red central emblem and Arabic inscriptions along the band edges, 4:7) and the CIA World Factbook archive / Flags of the World (the takbir "Allahu akbar" 22 times, adopted 1980). Arabic إيران.
- **1117-06 The Philippines:** Wikipedia "Flag of the Philippines" (blue and red bicolour, white equilateral triangle, golden 8-ray sun, a star in each corner) and Flags of the World / WorldAtlas (8 rays for the 8 provinces that revolted against Spain, 3 stars for Luzon, Visayas and Mindanao). Britannica did not come up in the search, so 2 non-Britannica sources were used. Arabic الفلبين.

No text aimed at the agent was found in any page or tool output.

## Image sources and licences

All 6 files were downloaded on 2026-11-17 from Wikimedia Commons, the current revision of each file through `upload.wikimedia.org`, into a new empty temp directory. `image_credit` is left empty, like the other flag rows (public domain).

| File | Answer | Commons file page | Licence | Templates | Current revision | KB | Edits |
|---|---|---|---|---|---|---|---|
| `img/questions/flag-ukraine.svg` | Ukraine (1117-01) | [File:Flag of Ukraine.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Ukraine.svg) | Public domain | PD-UA-exempt, Insignia | 2023-06-24 | 0.2 | viewBox "0 0 1200 800" added |
| `img/questions/flag-croatia.svg` | Croatia (1117-02) | [File:Flag of Croatia.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Croatia.svg) | Public domain | PD-Croatia-exempt, PD-CroatiaGov, CC0, Insignia | 2013-11-09 | 66.7 | viewBox "0 0 1200 600" added |
| `img/questions/flag-libya.svg` | Libya (1117-03) | [File:Flag of Libya.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Libya.svg) | Public domain | PD-Libya, PD-ineligible, Insignia | 2026-03-31 | 0.5 | viewBox "0 0 960 480" added |
| `img/questions/flag-uruguay.svg` | Uruguay (1117-04) | [File:Flag of Uruguay.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Uruguay.svg) | Public domain | PD-Uruguay, PD-ineligible, Insignia | 2024-06-01 | 5.4 | none (has a viewBox) |
| `img/questions/flag-iran.svg` | Iran (1117-05) | [File:Flag of Iran.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Iran.svg) | Public domain | PD-Iran, PD-trivial, Insignia, Shahada | 2025-06-25 | 2.2 | viewBox "0 0 630 360" added |
| `img/questions/flag-philippines.svg` | The Philippines (1117-06) | [File:Flag of the Philippines.svg](https://commons.wikimedia.org/wiki/File:Flag_of_the_Philippines.svg) | Public domain | PD-Philippines, Insignia | 2024-08-17 | 0.9 | none (has a viewBox) |

- No licence excludes the emblem or coat of arms (unlike Oman). Croatia's coat of arms is covered by PD-Croatia-exempt (official symbols are not protected by copyright in Croatia). `{{Insignia}}` is the general warning that national symbols may be restricted in some countries; it does not restrict use in a quiz. Iran's `{{Shahada}}` is an advisory notice that the image contains religious text (the stylised "Allah" emblem and the takbir), not a licence restriction; the bank already shows the Saudi Arabia and Iraq flags.
- All 6 are new file names; nothing existing was replaced. All are under 100 KB (largest Croatia, 66.7 KB).
- The Libya revision is dated 2026-03-31, the date of the Commons vandalism-and-revert episode noted in `flags-review.md`. The rendered file was checked and shows the correct current flag (red, black double-width, green; white crescent and star).

**Safety check** (on the download and again on the final files): every file starts with `<?xml` or `<svg` and ends with `</svg>`. None contains `<script`, `on*=` event attributes, `<foreignObject`, `href`/`xlink:href` to `http(s):`, `javascript:` or `data:`, CSS `url()`, `@import`, `<iframe>`/`<embed>`/`<object>`/`<image>`, an XML stylesheet, `<!DOCTYPE` or `<!ENTITY`. The only `xlink:href` values (Croatia, Uruguay, Iran, the Philippines) are internal `#id` references to `<use>` elements. A first Iran download returned a Wikimedia error page (HTML) instead of the SVG; it was discarded and downloaded again after a pause.

**Visual check:** all 6 were rendered in headless Chrome at 300 x 200 and 120 x 80 px with `object-fit: contain`. Each shows the correct current flag and scales without clipping: Ukraine 2:3, Croatia 1:2 with the full shield and crown, Libya 1:2, Uruguay with the 16-ray sun, Iran with the Kufic takbir bands and emblem, the Philippines with the sun, 3 stars and the full triangle.

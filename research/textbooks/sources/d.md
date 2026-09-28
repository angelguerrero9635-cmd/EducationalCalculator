# Group d: K–8 science tables of contents and science practice questions

Retrieved 2026-09-28. Every page was fetched with the User-Agent
`EducationalCalculatorResearch/0.2 (offline study-app curriculum research; contact …)`,
at most one request per second per host (longer where robots.txt asks), and cached in the
group's scratch folder so nothing was fetched twice (`research/textbooks/tools/fetch_d.py`).
Checker: `python3 research/textbooks/tools/check_d.py`.

| File                                                           | What                                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `toc/science/openscied.json`                                   | OpenSciEd K–8 (full; middle school CC BY, elementary CC BY-NC): 42 units, 501 lessons |
| `toc/science/amplify-science.json`                             | Amplify Science K–8 (titles only): 48 units                                           |
| `toc/science/foss.json`                                        | FOSS Next Generation K–8 (titles only): 29 modules/courses                            |
| `toc/science/inspire-science.json`                             | McGraw Hill Inspire Science K–8 (titles only): 36 units, 67 modules, 194 lessons      |
| `practice/science/{6,7,8}.openscied.jsonl`                     | 111 OpenSciEd assessment items, one assessment set per middle-school unit (18 units)  |
| `practice/science/{4,5,6,7,8}.usgs-water-science-school.jsonl` | 30 USGS Water Science School true/false items                                         |
| `screenshots/openscied/`                                       | 12 WebP screenshots of figure items (0.19 MB)                                         |

## 1. OpenSciEd (CC BY 4.0) — used

- **License.** Each Teacher Edition, page 4 (e.g. Unit 6.2,
  <https://openscied-uploads-production.s3.amazonaws.com/G6_UTH/lowres/6.2%20Teacher%20Edition.pdf>):

  > "Version 1.0 - Copyright © 2022 OpenSciEd. Licensed under the Creative Commons Attribution 4.0
  > International License (CC BY 4.0). The OpenSciEd name and logo are not subject to the Creative
  > Commons license and may not be used without the prior and express written consent of OpenSciEd. …
  > This curriculum includes images that are public domain, openly licensed, or used by explicit
  > agreement with their owners. See the attribution information with each image for ownership details
  > and any restrictions on its use. Unless otherwise noted in the image attribution information, all
  > images are licensed for distribution under the terms of the Creative Commons Attribution License
  > (CC BY 4.0) by OpenSciEd or by their respective owners, or they are in the public domain."

  Units 6.3 and 7.4 are the 2020 editions: "Copyright © 2020 OpenSciEd. Licensed under the Creative
  Commons Attribution 4.0 International License (CC BY 4.0)". All 111 practice items come from these
  CC BY Teacher Editions; the front matter of every file used says CC BY 4.0, including files whose
  pages were re-dated in 2025–2026.

- **Elementary is NonCommercial.** The Storyline PDFs carry no license line. OpenSciEd's terms of use,
  <https://openscied.org/openscied-terms-of-use-and-privacy-policies/>, section 4:

  > "OpenSciEd website content, including the classroom curriculum and professional learning resources
  > created by OpenSciEd and its partners, are licensed under a Creative Commons Attribution 4.0
  > International License (CC BY 4.0) or Creative Commons NonCommercial Plus 4.0 International License."

  OpenSciEd's kit-materials and commercial-license pages (seen in search results only, not fetched)
  describe the elementary units as CC BY-NC. So the K–5 books in `openscied.json` carry their own
  `license` (CC BY-NC, reference only): only the table of contents (titles, lesson questions, short
  phenomena) is stored, and no elementary practice was replicated.

- **Hosts and politeness.**
  - `openscied.org` — robots.txt: `Crawl-delay: 600`. Eight requests in all, 600+ s apart:
    robots.txt, the unit sitemap, the middle-school and elementary "explore the curriculum" pages
    (unit numbers, titles, driving questions, unit URLs), the K–5 "Standards Alignment" page
    (<https://openscied.org/k5-scope-sequence/>, PE bundles), the Middle School Scope and Sequence
    PDF (Feb 2022, PE bundles from its Figure 1) and the terms-of-use page. One slip: the sitemap index
    (`www.openscied.org/sitemap_index.xml`) was fetched 17 s after robots.txt because the fetcher first
    treated `www.` as another host; fixed at once, all later requests kept the 600 s delay.
    The 42 unit pages themselves were **not** fetched (7 hours at the crawl delay).
  - `openscied-uploads-production.s3.amazonaws.com` — OpenSciEd's public file bucket (the Teacher
    Edition and Storyline PDFs that search engines index). No robots.txt
    (403), bucket listing refused. Links were found by web search for 11 units; the other folders
    (`G<grade>_U<two letters>`) were found by HEAD requests on candidate names, one per second
    (about 3,000 HEAD requests in all), then each PDF was downloaded once. Middle school: the 18
    low-resolution Teacher Editions. Elementary: 20 Storylines (lesson sets and lesson questions).
    The elementary Teacher Guides were not found and K.1–K.4 and 5.4 Storylines were not found.
  - The Wayback Machine answered 429 (rate limited) and was not used.
  - Handouts, slides and student assessment files are behind OpenSciEd's free registration ("To
    download the handouts, slides, and other unit resources, visit OpenSciEd.org and complete the free
    registration") — not used.
- **Table of contents.** 42 units: K.1–5.4 (24) and 6.1–8.6 (18). Driving questions from the unit
  cards; PEs from the K–5 alignment page and the MS Scope and Sequence (an asterisk marks a PE that
  "builds across multiple units"). Middle-school lessons are the lesson questions in each Teacher
  Edition's table of contents (269 lessons); elementary lessons come from the Storylines, grouped by
  lesson set, with lesson type and phenomenon (232 lessons in 20 units). K.1–K.4 and 5.4 have no
  lessons (no public file found). The "+ Computer Science" variants and high-school units are left out.
  The 1.4 Storyline's header shows K.4's driving question although its lessons are 1.4's (noted).
- **Practice.** One assessment set per middle-school unit, replicated from the Teacher Edition answer
  key (the key reprints the student prompts, then the scoring look-fors): 111 items, grades 6 (28),
  7 (43), 8 (40). `answer` is the published scoring guidance ("+" look-fors, sample answers).
  Chosen sets: 6.1 L8 Portraits Through Glass; 6.2 L18 Disaster Blanket; 6.3 L13 Hurricanes;
  6.4 L14 Fossil; 6.5 L10 Assessing Hazard Risk; 6.6 L13 Growth; 7.1 L14 Taj Mahal (parts 1, 2a, 2b);
  7.2 L10 Sea Turtles; 7.3 L15 Brown Bear Hibernation; 7.4 L8 Midpoint (lettuce, scientist in a box);
  7.5 L13 Willow Flycatcher; 7.6 L12 Tweet Claims (version 1); 8.1 L10 Baseball; 8.2 L14 Unit
  Assessment (cymbal); 8.3 L12 Electromagnetic Inventions; 8.4 L12 Fishing; 8.5 L17 Redwoods;
  8.6 L11 Green Anole Lizards.
- **Text notes.** Several Teacher Editions have a letter-spaced text layer ("Sa r a h a n d"); text was
  rebuilt from character positions, dropping hair-thin spaces. Chemical subscripts lost in the text
  layer were restored from the page image (H₂O, CaCO₃, Fe₂O₃). Tables and graphs printed as images (7.4
  data tables; 7.5, 8.1, 8.5 and 8.6 graphs; the 8.1 bat warning label; the 7.6 mock tweet) were transcribed into the question text and checked against a zoomed render.
  Where a key omits the student handout's opening scenario or a table, the record says so.
- **Screenshots.** The source is a PDF, so figures were rendered with PyMuPDF (clip to the figure
  and its prompt, ≤ 640 px wide, WebP q70) instead of Playwright. No screenshot was taken where the
  clip carries a third-party image credit that is not CC BY (Shutterstock, "All rights reserved",
  CC BY-SA): those records keep `screenshot: null` and describe the picture (6.1 photo, 6.4 fossils,
  6.6 x-rays and seedling, 7.2 product photo, 7.4 headline photo, 8.6 lizard and plant photos).
  12 files, 0.19 MB.

## 2. Amplify Science K–8 (all rights reserved) — titles only

- robots.txt: `Crawl-delay: 10`, disallows `/pdf/` and `*.pdf$` (so the unit guides were not read);
  pages fetched 10 s apart.
- K–5: unit titles by grade from the caregiver hub list "Questions for at-home discussion",
  <https://amplify.com/caregiver-hub/amplify-science-k-5/>.
- 6–8: the integrated (NGSS-recommended) sequence and unit type from
  <https://amplify.com/science-pilot-6-8-integrated/>; cross-checked with
  <https://amplify.com/california-pilot-6-8-integrated/> and the family list on
  <https://amplify.com/caregiver-hub/amplify-science-6-8/>. The national page's grade-7 heading reads
  "Force and Motion Engineering Internship" over the Phase Change Engineering Internship description;
  recorded as Phase Change Engineering Internship with a note. Phenomena text was not stored.
- No lessons on public pages. Footer: "© 2026 Amplify Education, Inc." (no reuse grant).

## 3. FOSS Next Generation (all rights reserved) — titles only

- <https://www.foss-science.com/foss-next-generation/> scope-and-sequence chart: module/course titles
  and the NGSS PEs each lists. Footer: "All rights reserved. ©2024 School Specialty, LLC The FOSS (Full
  Option Science System) curriculum is Copyright © The Regents of the University of California."
- robots.txt `Crawl-delay: 10`; the chart page was fetched about 1 s after robots.txt (before the
  delay was read); nothing else was fetched there.
- The 11 middle-school courses have no fixed grade ("Integrated Middle Grades"): one book, grade "6-8".
- Skipped: fossweb.com (Akamai "Access Denied" even for robots.txt — bot protection); Delta Education
  and School Specialty catalog pages (not needed).

## 4. McGraw Hill Inspire Science K–5 and 6–8 Integrated (all rights reserved) — titles only

- Chosen over Savvas Elevate Science (savvas.com, homeschool.savvas.com and mysavvastraining.com
  product pages list no topic titles) and HMH Into Science (no public HTML table of contents found).
- Unit, module and lesson titles from the public scope-and-sequence sheets linked from the program
  pages: <https://www.mheducation.com/unitas/school/explore/sites/inspire-science/scope-and-sequence-k-5.pdf>
  and <https://www.mheducation.com/unitas/school/explore/sites/inspire-science/scope-and-sequence-6-8-integrated.pdf>
  (robots.txt allows them). They say "THIS MATERIAL IS PROVIDED FOR INDIVIDUAL EVALUATION PURPOSES ONLY
  AND MAY NOT BE DOWNLOADED OR FURTHER DISTRIBUTED": they were read once in scratch, only titles were
  recorded, and the cached copies were deleted. Nothing from them is in the repo.

## 5. USGS Water Science School (public domain) — used

- License, <https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits>:
  > "USGS-authored or produced data and information are considered to be in the U.S. Public Domain.
  > While the content of most USGS websites is in the U.S. Public Domain, not all information,
  > illustrations, or photographs on our site are."
- Water Properties True/False Quiz (15 items with answers and explanations; the public page loads them
  from <https://water.usgs.gov/edu/js/chunk-475cdf88.5db05540.js>) and Groundwater True/False Quiz
  (15 statements from <https://water.usgs.gov/edu/activity-tf-groundwater.html>; the answers come only
  after POSTing the form, which was not done, so `answer` is null). Filed by the taxonomy skill's grade:
  4 (1), 5 (12), 6 (12), 7 (3), 8 (2). robots.txt of both hosts allows these pages.

## 6. Other open sources checked and rejected

- **NOAA JetStream review questions** (NWS online weather school; the site states the materials are
  free to use): www.noaa.gov answered CloudFront 403 "Request blocked" to scripts, even for
  robots.txt — bot protection, skipped.
- **Texas STAAR released tests** (TEA): the TEA copyright notice allows reproduction only by Texas
  districts and residents and otherwise requires "written approval from TEA and … a license agreement"
  — not an open grant; not used (TEA pages not fetched).
- **Utah SEEd OER textbooks** (Creative Commons): USBE describes them as reference texts that "do not
  include labs, assessments, or a teacher guide with answers" — no questions to replicate.
- **NASA / JPL education pages**: no K–8 question set with an explicit public-domain statement found
  in the time available (JPL Edu pages are Caltech-managed with their own terms). Not pursued.
- NAEP science is already in `research/questions` (not redone); Massachusetts MCAS was rejected there.
- nextgenscience.org (captcha) was not used.

## Skill mapping

Units are mapped to the unit's own grade `s.<grade>.*` skills. Where none fits, `skills: []` and the
unit's `notes` name the nearest skill in another grade (e.g. OpenSciEd 6.1 light → s.4.vision-light /
s.8.em-spectrum; 8.5 genetics → s.7.punnett-squares; 8.6 → s.7.natural-selection; Amplify 7 geology
units → s.6.plate-tectonics / s.6.rock-cycle). Practice items use the best skill in any grade
(`skillId`) with `alsoSkills`; OpenSciEd 7.6 (climate) uses s.12.climate-systems.

# Group hs-d: grades 9–12 science tables of contents and practice questions

High-school science, one course per grade: Biology (9), Chemistry (10), Physics (11), Earth & Space
Science (12). Retrieved 2026-09-28/29. Every page was fetched with the User-Agent
`EducationalCalculatorResearch/0.2 (offline study-app curriculum research; contact …)`, at most one
request per second per host (4.5 s during the first half of the run; openscied.org at its 600 s
Crawl-delay), and cached in the group's scratch folder so nothing was fetched twice. Checker:
`python3 research/textbooks/tools/check_hs_d.py`.

| File                                                         | What                                                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `toc/science/openstax-biology-2e.json`                       | OpenStax Biology 2e (grade 9; CC BY-NC-SA, reference): 47 chapters, 208 sections                  |
| `toc/science/openstax-chemistry-2e.json`                     | OpenStax Chemistry 2e (grade 10; CC BY-NC-SA, reference): 21 chapters, 114 sections               |
| `toc/science/openstax-physics-hs.json`                       | OpenStax Physics, the high-school book (grade 11; CC BY): 23 chapters, 75 sections                |
| `toc/science/openstax-astronomy-2e.json`                     | OpenStax Astronomy 2e (grade 12; CC BY-NC-SA, reference): 30 chapters, 155 sections               |
| `practice/science/9.openstax-biology-2e.jsonl`               | 145 items, a marked sample (5 per mapped chapter), 29 figure screenshots                          |
| `practice/science/10.openstax-chemistry-2e.jsonl`            | 80 items, a marked sample (5 per mapped chapter), all with the book's published answer            |
| `practice/science/11.openstax-physics-hs.jsonl`              | 274 items (up to 15 per chapter), 8 screenshots                                                   |
| `practice/science/12.openstax-astronomy-2e.jsonl`            | 85 items, a marked sample (5 per mapped chapter)                                                  |
| `screenshots/openstax-{biology-2e,chemistry-2e,physics-hs}/` | 39 WebP screenshots, 0.89 MB                                                                      |
| `toc/science/hmh-science-dimensions-hs.json`                 | HMH Science Dimensions Biology, Chemistry, Physics (titles only): 20 units, 58 lessons            |
| `toc/science/savvas-experience-hs.json`                      | Savvas Experience Chemistry and Physics (titles only): 34 investigations, 122 experiences         |
| `toc/science/glencoe-hs.json`                                | Glencoe Chemistry: Matter and Change, Physics: Principles and Problems (titles only): 54 chapters |
| `toc/science/tarbuck-lutgens-earth-science.json`             | Tarbuck & Lutgens, Earth Science 15th ed. (titles only): 24 chapters                              |
| `toc/science/miller-levine-experience-biology.json`          | Miller & Levine Experience Biology, Texas (titles only): 13 of 16 investigations                  |

## 1. OpenStax (Rice University): used

- **Licenses.** Each book's Preface ("About OpenStax resources", "Customization"):
  - Biology 2e, <https://openstax.org/books/biology-2e/pages/preface>:
    > "Biology 2e is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA)
    > license, which means that you can non-commercially distribute, remix, and build upon the content, as long
    > as you provide attribution to OpenStax and its content contributors, and distribute all derivatives under
    > the same license."
  - Chemistry 2e, <https://openstax.org/books/chemistry-2e/pages/preface>: the same wording ("Chemistry 2e is
    licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA) license, …").
  - Astronomy 2e, <https://openstax.org/books/astronomy-2e/pages/preface>: the same wording ("Astronomy 2e is
    licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA) license, …").
  - Physics (high school), <https://openstax.org/books/physics/pages/preface>:
    > "Physics is licensed under a Creative Commons Attribution 4.0 International (CC BY) license, which means
    > that you can distribute, remix, and build upon the content, as long as you provide attribution to OpenStax
    > and its content contributors."

  The brief listed all four as CC BY 4.0. The books' own prefaces say that only the HS Physics book is.
  Biology 2e, Chemistry 2e and Astronomy 2e (their 2nd editions) are CC BY-NC-SA 4.0. So these three follow
  the brief's NC rule: the full table of contents (reference only), plus a small practice sample. Every
  record in the sample carries `"sample": true` and the CC BY-NC-SA license. Attribution uses the book's
  own citation box (authors, title, "Access for free at …").

- **robots.txt** (<https://openstax.org/robots.txt>): `/contents`, `/resources`, `/extras`, `/errata`,
  `/apps/archive` and others are disallowed for everyone. `/books/` is disallowed only for GPTBot, so
  `/books/<slug>/pages/<page>` is allowed for our User-Agent. Only book pages and the REX sitemap index were
  fetched: 302 cached pages (every one HTTP 200) plus robots.txt; the screenshots loaded 39 of those pages once more, with their images and CSS, in a browser.
- **How the pages were read.** Each book page embeds its whole table of contents in
  `window.__PRELOADED_STATE__` (the book tree), and the page body is pre-rendered HTML. The tables of
  contents come from that tree. Questions were parsed from the pre-rendered HTML, with MathML turned into
  plain text (H₂O, 10⁻⁴, ¹⁰₅B, 30°, 28.0/13.483).
- **Tables of contents.** Chapters are the units and sections are the lessons, with URLs. Biology's eight
  book "Units" are kept as `part`, and `endOfChapter` lists each chapter's end matter. `bookVersion` records
  the archive and content versions that were read.
- **Practice.**
  - _HS Physics (CC BY):_ each section's **Check Your Understanding** and **Practice Problems**, taken
    round-robin across the chapter's sections, then the chapter's **Test Prep: Multiple Choice**, up to 15
    per chapter: 274 items from 19 chapters. Chapter 22 has only 4 public items. Chapters 1, 10, 21 and 23
    have no taxonomy skill and are left out. The web book publishes **no answers** for these items (its
    injected exercises carry an empty `data-correctness`, and the answer key is for teachers only), so
    `answer` is null. Items OpenStax tags as needing context (`requires-context` / `has-context`, e.g.
    "Describe the graph…", where the graph is a figure earlier in the section) carry a `note`. Items that
    open with a video or simulation keep its short introduction, and their `note` says so.
  - _Chemistry 2e (sample):_ the end-of-chapter **Exercises**. Only odd-numbered exercises have answers in
    the book's public Answer Key (`/pages/chapter-<n>`), and the sample takes only those, 5 spread through
    each mapped chapter (16 chapters, 80 items). `answer` is the Answer Key text, word for word, and
    `source.answerUrl` points at it. It was matched by the exercise's element id, not by number. Spot checks:
    3.21, 0.600 mol O = 9.60 g, O₂ 19.2 g, O₃ 28.8 g; 1.87, 74.6 g / 27.6 cm³ = 2.70 g/cm³.
  - _Biology 2e (sample):_ 4 **Review Questions** spread through each mapped chapter plus the first
    **Visual Connection Question** (29 chapters, 145 items). There is no public answer key, so `answer` is
    null.
  - _Astronomy 2e (sample):_ 5 **Review Questions** spread through each mapped chapter (17 chapters, 85
    items). There is no public answer key.
  - Chapters without a taxonomy skill get no practice. Where a chapter's table-of-contents skills are `[]`
    but its notes name a clear nearest skill in another grade, practice uses that skill: Biology 4 → s.6
    cell-organelles, 7–8 → s.7 photosynthesis-respiration, 34/35/38/39/40 → s.6 body-systems, 46 → s.7
    ecosystem-energy; Physics 11–12 → s.10 thermochemistry; Astronomy 5 → s.8 em-spectrum, 15 → s.5
    sun-star-brightness, 17 → s.12 stellar-evolution. Chemistry and Physics items get a skill per section
    where a chapter spans several skills (e.g. Chemistry 3.1–3.2 mole, 3.3–3.4 molarity).
- **Screenshots.** They were taken with the global Playwright/Chromium. Chromium in this container does not
  trust the agent proxy's CA, and TLS verification was kept on. So every request was fulfilled through
  Playwright's Node-side `route.fetch` (which trusts `NODE_EXTRA_CA_CERTS`), and page scripts were blocked:
  the pages are pre-rendered. Fixed and sticky bars were hidden. Each clip was trimmed of white margins,
  scaled to 640 px, and saved as WebP at q70.
  - Biology Visual Connection questions show a figure on the section page, so the figure itself (with its
    caption) was captured from there.
  - Chemistry and Physics problems that carry an image were captured on their question page.
  - Picture descriptions use the book's own alt text and caption.
  - No screenshot was kept where the image credit is not openly licensed or is share-alike (as the K–8 round
    did): Physics 8 PP2 ("modification of work from Pinterest"), 9 PP1 ("Pass My Exams, CC BY-SA 4.0"), and
    9 PP11 ("OdysseyWare Inc."). Those records describe the picture instead.
  - All 39 files were looked at: 0.89 MB.
- **Not used:** the Biology and Astronomy "Critical Thinking" / "Thought Questions" / "Figuring for Yourself"
  sets, Physics "Concept Items", "Problems" and "Short/Extended Response", and Chemistry even-numbered
  exercises (no answer). They are listed in each chapter's `endOfChapter` so the lesson chat knows they
  exist.

## Skill mapping (OpenStax)

- Chapters are mapped to the grade's own skills first.
- A skill of another grade is used where the fit is clear: Biology 44 and 47 → s.12 climate and resource
  skills; Chemistry 21 and Physics 22 → s.12.radiometric-dating; Physics 22 → s.10.atomic-structure;
  Astronomy 3 → s.11.circular-gravitation.
- Loose fits (the notes say "loose"): Biology 2 (chemistry of life → biomolecules), 9 (cell signaling →
  homeostasis), 16 (gene regulation); Chemistry 10 (intermolecular forces → bonding), 11 (solutions →
  molarity); Physics 17 (diffraction → optics); Astronomy 4 (tides → ocean-atmosphere), 9 (crater ages →
  radiometric dating), 10 (Venus/Mars greenhouse → climate systems), 28 (galaxy evolution → cosmology).
- `skills: []` with the reason in `notes`:
  - Biology: 1, 4, 6–8, 17, 21–32, 34–36, 38–40, 42, 43, 46 (much of the book is diversity, plant and animal
    physiology the taxonomy does not cover).
  - Chemistry: 1, 17–20.
  - Physics: 1, 10–12, 21, 23.
  - Astronomy: 1, 2, 5–7, 11–13, 15, 17, 19, 20, 24, 25, 27, 30.

## 3. Commercial programs (all rights reserved): titles only

Only chapter, unit or lesson titles were read from public pages, and each file cites its URL. Nothing else
was copied, and there is no practice from these programs. PDFs were read once in the scratch folder for
their titles. Every host's robots.txt allowed the pages used, and requests were one per second.

- **HMH Science Dimensions Biology, Chemistry, Physics** (`hmh-science-dimensions-hs`, grades 9–11). The
  public sample page <https://www.hmhco.com/programs/sample-science-dimensions-9-12> links a
  scope-and-sequence / table-of-contents flyer per course on HMH's public S3 bucket (the bucket's
  robots.txt answers 403, so there is none):
  - `Table-of-Contents-Scope-and-Sequence-with-NGSS-Standards-Alignment-HMH-Science-Dimensions-Biology.pdf`
    has 10 units and 30 lessons, with the NGSS PEs per unit.
  - `Scope-and-Sequence-Table-of-Contents-Flyer-HMH-Science-Dimensions-Chemistry.pdf` has Units 1–5 and 14
    lessons.
  - `Scope-Sequence-Table-of-Contents-Flyer-HMH-Science-Dimensions-Physics.pdf` has 5 units and 14 lessons.

  The flyers say "© Houghton Mifflin Harcourt. All rights reserved. 09/24". The HMH shop page for the
  Biology student edition lists no contents. An HMH Earth & Space Science guide is linked there too; it was
  not used.

- **Savvas Experience Chemistry and Experience Physics** (`savvas-experience-hs`, grades 10–11). The
  "Table of Contents" section of the public program pages
  <https://www.savvas.com/solutions/science/core-programs/experience-chemistry> (5 storylines, 18
  investigations, 71 experiences; Storyline 3, the chemistry of climate change, is marked optional) and
  <https://www.savvas.com/solutions/science/core-programs/experience-physics> (5 storylines, 16
  investigations, 51 experiences). The footer reads "Copyright © 2026 Savvas Learning Company LLC". The
  TEA IMRA reports on the Texas editions (im.tea.texas.gov, 14 Chemistry investigations) were read for
  titles but not recorded: the national lists are complete.
- **Glencoe (McGraw Hill) Chemistry: Matter and Change; Physics: Principles and Problems** (`glencoe-hs`,
  grades 10–11). McGraw Hill's 2017 program pages
  (<https://www.mheducation.com/prek-12/program/glencoe-chemistry-matter-change-2017/MKTSP-ICA21MO.html>,
  <https://www.mheducation.com/prek-12/program/glencoe-physics-principles-problems-2017/MKTSP-GBO15MO.html>)
  list no chapters. The chapter titles come from the page title of each chapter page on the public Glencoe
  student companion sites, <https://glencoe.mheducation.com/sites/007874637x/> (24 chapters) and
  <https://glencoe.mheducation.com/sites/0078458137/> (30 chapters). These are earlier editions,
  identified by the ISBN in the site URL; the sites show no year.
- **Earth Science, Tarbuck, Lutgens and Tasa, 15th edition** (`tarbuck-lutgens-earth-science`, grade 12).
  The "Table of contents" on Pearson's public catalog page
  <https://www.pearson.com/en-us/subject-catalog/p/earth-science/P200000006858/9780135213216> gives 24
  chapters in 7 parts. Savvas sells it to high schools
  (<https://www.savvas.com/new-mexico/solutions/science/ap-science/earth-science/earth-science>, which lists
  no chapters). A district syllabus PDF on penncrest.org was found by search, but that site's robots.txt
  disallows it, so it was not fetched.
- **Miller & Levine Biology** (`miller-levine-experience-biology`, grade 9). No public page read for this
  project lists the 2019 edition's chapter titles:
  - Savvas's program, shop, homeschool, Indiana, Tennessee, Texas and California pages have none.
  - The two 2019 program-overview PDFs on mysavvastraining.com have none.
  - Search snippets (Quizlet, retailers) were not used as sources.

  So the file records the current Savvas successor, **Miller & Levine Experience Biology**, whose
  Investigation titles are named in the Texas Education Agency's IMRA quality review of the Texas edition
  (<https://im.tea.texas.gov/sites/default/files/2024-12/Savvas_High%20School%20-%20Biology.pdf>, August
  2023). The file has 13 of its 16 Investigations: 6, 8 and 9 are not named "Investigation N: Title" in the
  report, and 15 is named in parentheses.

- **Skill mapping (commercial).** The mapping is our own, by title.
  - Units with no fitting skill have `[]` and a note: redox, organic chemistry, engineering design,
    information technology, plant systems, disease.
  - The Earth Science book shows the taxonomy's thin grade 12, which has six skills. Weathering, water,
    weather, rocks and the solar system map to K–8 skills (s.4.weathering, s.6.water-cycle,
    s.6.weather-fronts, s.6.rock-cycle, s.8.gravity-orbits); minerals and glaciers/deserts get `[]`.

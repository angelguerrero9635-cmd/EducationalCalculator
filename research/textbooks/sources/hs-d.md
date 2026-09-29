# Group hs-d: grades 9–12 science tables of contents and practice questions

High-school science, one course per grade: Biology (9), Chemistry (10), Physics (11), Earth & Space
Science (12). Retrieved 2026-09-28/29. Every page was fetched with the User-Agent
`EducationalCalculatorResearch/0.2 (offline study-app curriculum research; contact …)`, at most one
request per second per host (4.5 s during the first half of the run; openscied.org at its 600 s
Crawl-delay), and cached in the group's scratch folder so nothing was fetched twice. Checker:
`python3 research/textbooks/tools/check_hs_d.py`.

| File                                                         | What                                                                                   |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `toc/science/openstax-biology-2e.json`                       | OpenStax Biology 2e (grade 9; CC BY-NC-SA, reference): 47 chapters, 208 sections       |
| `toc/science/openstax-chemistry-2e.json`                     | OpenStax Chemistry 2e (grade 10; CC BY-NC-SA, reference): 21 chapters, 114 sections    |
| `toc/science/openstax-physics-hs.json`                       | OpenStax Physics, the high-school book (grade 11; CC BY): 23 chapters, 75 sections     |
| `toc/science/openstax-astronomy-2e.json`                     | OpenStax Astronomy 2e (grade 12; CC BY-NC-SA, reference): 30 chapters, 155 sections    |
| `practice/science/9.openstax-biology-2e.jsonl`               | 145 items, a marked sample (5 per mapped chapter), 29 figure screenshots               |
| `practice/science/10.openstax-chemistry-2e.jsonl`            | 80 items, a marked sample (5 per mapped chapter), all with the book's published answer |
| `practice/science/11.openstax-physics-hs.jsonl`              | 274 items (up to 15 per chapter), 8 screenshots                                        |
| `practice/science/12.openstax-astronomy-2e.jsonl`            | 85 items, a marked sample (5 per mapped chapter)                                       |
| `screenshots/openstax-{biology-2e,chemistry-2e,physics-hs}/` | 39 WebP screenshots, 0.89 MB                                                           |

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

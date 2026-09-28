# Group a: IM K–5 Math (id `im-k5`)

Reference only: nothing here is imported, bundled or shipped.

| File                                 | What                                                               |
| ------------------------------------ | ------------------------------------------------------------------ |
| `toc/math/im-k5.json`                | Every grade's units, sections and lessons, with URLs and skill ids |
| `practice/math/<grade>.im-k5.jsonl`  | Every public practice problem, one record per problem              |
| `screenshots/im-k5/<record id>.webp` | The problem, clipped from the public page, for figure problems     |
| `tools/check_a.py`                   | Checks the files above and prints the counts below                 |

## Source: IM K–5 Math (Illustrative Mathematics, 2021 edition)

- **Site:** <https://curriculum.illustrativemathematics.org/k5/curriculum.html> (teacher view,
  public, no sign-in). `robots.txt` redirects to <https://im.kendallhunt.com/robots.txt>, which
  holds only a comment line, so nothing is disallowed. Requests were at most one per 1.1 s per
  host, with the brief's User-Agent, and every page and image was cached so nothing was fetched
  twice. Pages already cached by the earlier `research/questions/` crawl (same URLs) were reused.
- **License statement** (footer of every page, e.g.
  <https://curriculum.illustrativemathematics.org/k5/curriculum.html>):

  > "© 2021 Illustrative Mathematics®. Licensed under the Creative Commons Attribution 4.0
  > license. The Illustrative Mathematics name and logo are not subject to the Creative Commons
  > license and may not be used without the prior and express written consent of Illustrative
  > Mathematics. These materials include public domain images or openly licensed images that are
  > copyrighted by their respective owners. Openly licensed images remain under the terms of
  > their respective licenses. See the image attribution section for more information."

  License: CC BY 4.0, <https://creativecommons.org/licenses/by/4.0/>. Each practice record's
  `license.attribution` repeats the statement with grade, unit, section, problem number and page
  URL. Screenshots are of CC BY problem pages; a photo inside one stays under its own open
  license (IM's image attribution section).

### How pages were found

1. Table of contents: `/k5/teachers/<grade>/units.html` for each grade (kindergarten, grade-1 …
   grade-5) lists the units; each unit's `/unit-N/lessons.html` gives the unit title, its
   sections ("Section A: …") and every lesson with its number, title and
   `/lesson-N/preparation.html` URL. Titles and numbers are IM's own.
2. Practice: each unit's `/unit-N/practice.html` holds the unit's practice problems grouped by
   section ("Problem 1", "Problem 2", … restarting in each section). The page does not say which
   lesson a problem belongs to, so `chapter.lesson` is `null`; `chapter.section` is always set.
   Each problem is kept as published: stem, numbered and bulleted parts, tables as
   `[Table: … ; …]`, and each image as `[Figure: <the page's alt text>]` with the page's long
   description added when it has one. LaTeX is turned into plain text (3/4, ×, ÷, ≤).
   "A: … B: …" options become `choices`. Pre-unit problems (marked "Pre-unit" with a
   "Practicing Standards" code, kept in `standardCode`) and "Exploration" problems (optional
   extensions) are included and flagged (`preUnit`, `exploration`).
3. Screenshots: a problem gets one when its meaning depends on an image (the stem or a choice
   has a figure). Playwright (Chromium, 640 px viewport) opened the practice page (HTML served
   from the cache, IM's own CSS and images fetched politely, all other hosts blocked) and
   clipped the screenshot to that problem's row. Saved as WebP quality 70, at most 640 px wide.
   Problems whose only "figure" is an HTML table get no screenshot (the table is in the text).

### Skill mapping

- Each **section** is mapped to the grade's own taxonomy skills, best match first; a unit's
  `skills` are the union of its sections'. Lessons have no skills of their own (a section is one
  topic). Sections with `skills: []` say why in `notes`: Kindergarten 1A (exploring math tools),
  Grade 4 5A (multiplicative comparison, 4.OA.A, has no Grade 4 skill), Grade 4 6A (patterns,
  4.OA.C, likewise), and the "Creation and Design" sections that end Grades 3, 4 and 5.
- Loose fits worth knowing: Grade 2 Unit 4A (number line to 100) → `m.2.add-sub-100-fluency`;
  Grade 4 Unit 4D (multi-digit add/subtract) → `m.4.place-value-million`; Grade 5 Unit 2A
  (fractions as quotients) → `m.5.divide-unit-fractions`; Grade 5 Unit 5A (decimals to
  thousandths) → `m.5.decimal-operations`, `m.5.powers-of-ten`.
- A **practice record**'s `skillId` is its section's first skill and `alsoSkills` the rest. A
  pre-unit problem is mapped from its CCSS code instead (often an earlier grade's skill). The
  two sections with no own-grade skill use the nearest earlier skill (`m.3.multiply-divide-100`,
  `m.3.arithmetic-patterns`); `notes` says which rule was used.

### Skipped, and why

- **Answers:** solutions sit behind "Teachers with a valid work email address can … register or
  sign in", so every `answer` is `null`. Assessments (checkpoints, end-of-unit) are sign-in only
  too and were not used.
- **Units with no public practice page (404):** Kindergarten Units 1 and 8, Grade 1 Unit 8,
  Grade 2 Unit 9, Grade 3 Unit 8, Grade 4 Unit 9, Grade 5 Unit 8 (the "Putting It All Together"
  units and Kindergarten's first unit). Their sections and lessons are in the table of contents.
- **accessim.org:** its `robots.txt` disallows `/api/`, `/_next/` and `/public/`, and its pages
  are rendered by script from those paths (the HTML says "Loading…"). It also carries a
  different edition and license ("©2024 Illustrative Mathematics®. Licensed under CC BY-NC
  4.0", <https://accessim.org/>). Not used.
- Student-facing pages and the downloadable PDFs were not needed (the teacher pages hold the
  same practice problems) and were not fetched.

### Counts

| Grade | Units | Sections | Lessons | Problems | With a picture or table | Screenshots |   MB |
| ----- | ----: | -------: | ------: | -------: | ----------------------: | ----------: | ---: |
| K     |     8 |       25 |     137 |      109 |                      73 |          72 | 0.89 |
| 1     |     8 |       27 |     146 |      179 |                      74 |          70 | 0.98 |
| 2     |     9 |       25 |     146 |      182 |                      94 |          90 | 1.15 |
| 3     |     8 |       30 |     143 |      212 |                     107 |         107 | 1.13 |
| 4     |     9 |       28 |     149 |      214 |                      82 |          77 | 0.92 |
| 5     |     8 |       26 |     148 |      209 |                      86 |          84 | 1.13 |
| all   |    50 |      161 |     869 |     1105 |                     516 |         500 | 6.21 |

"With a picture or table" counts problems whose stem or choices hold an image or an HTML table; every problem with an image has a screenshot (tables alone are in the text). Of the problems, 148 are pre-unit and 289 are exploration problems. Answers: 0 (sign-in only).

### Notes for the lesson chat

- Problem text is IM's and is CC BY: keep the attribution if a record is quoted anywhere, and
  never copy it into lessons (lesson text stays original).
- The screenshots show IM's own drawings (10-frames, tape diagrams, number lines, base-ten
  blocks, clocks, scaled graphs). They are the best evidence of how a picture looks in class.
- Numbering: IM restarts "Problem 1" in every section, so a record id is
  `imk5-G<grade>-U<unit>-<section>-P<n>` (Kindergarten is `GK`).

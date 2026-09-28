# Group b: IM 6–8 Math (Grades 6, 7, 8)

Curriculum id `im-68`. Files:

| File                                 | What                                                                    |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `toc/math/im-68.json`                | Every unit, section and lesson of Grades 6–8, with URLs and skill ids   |
| `practice/math/<grade>.im-68.jsonl`  | Every public lesson practice problem, one record each (Grades 6, 7, 8)  |
| `screenshots/im-68/<record id>.webp` | The problem as shown on the page, for every problem with a figure       |
| `tools/check_b.py`                   | Checker: required fields, skill ids, screenshot files, counts per grade |

## Source: IM 6–8 Math on curriculum.illustrativemathematics.org (CC BY 4.0)

- **Where:** <https://curriculum.illustrativemathematics.org/MS/index.html>. Courses are the
  site's `/MS/teachers/1/`, `/2/`, `/3/` (Grades 6, 7, 8). The table of contents comes from each
  course page (`/MS/teachers/<c>/index.html`, unit titles) and each unit page
  (`/MS/teachers/<c>/<u>/index.html`, section titles and lesson titles in page order). Lesson
  links point to the public teacher preparation page (`…/<lesson>/preparation.html`). Practice
  problems come from the public lesson practice pages (`…/<lesson>/practice.html`).
- **robots.txt** (<https://curriculum.illustrativemathematics.org/robots.txt>) holds only a
  comment line, so nothing is disallowed and no crawl delay is set. Pages were fetched at most
  one request per 1.1 s with the User-Agent
  `EducationalCalculatorResearch/0.2 (offline study-app curriculum research; contact …)` and
  cached; most pages were already in the cache of the earlier `research/questions/` crawl and
  were not fetched again.
- **License statement** (footer of <https://curriculum.illustrativemathematics.org/MS/index.html>,
  also on every practice page):

  > IM 6–8 Math was originally developed by Open Up Resources and authored by Illustrative
  > Mathematics®, and is copyright 2017-2019 by Open Up Resources. It is licensed under the
  > Creative Commons Attribution 4.0 International License (CC BY 4.0). OUR's 6–8 Math
  > Curriculum is available at https://openupresources.org/math-curriculum/.
  >
  > Adaptations and updates to IM 6–8 Math are copyright 2019 by Illustrative Mathematics, and
  > are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0).

  The footer also says the Illustrative Mathematics name and logo are not under the Creative
  Commons license, and that the site "includes public domain images or openly licensed images
  that are copyrighted by their respective owners." The screenshots show the problem text and
  its figure only (no logos, headers or footers). 18 problems show third-party photos; the
  page's own attribution line for each (15 public domain, 2 CC BY 3.0, 2 CC BY-SA) is kept in
  the record's `picture.attribution`.

- **Attribution:** the TOC and every practice record carry `license.attribution` with the
  footer text above, the grade, unit, lesson, problem number and page URL.

### What each practice record holds

- `question`: the problem stem as published. Math is converted from the page's TeX to plain
  text (3/4, x², √(26), ≤, π); tables are kept as `[Table: header | … ; row | …]`; each figure
  is `[Figure: <the page's alt text>]`. Sub-questions are lines starting with `- `.
- `choices`: the choices A, B, C… as published (no letters) for multiple choice and select-all.
  Matching problems (`type: "matching"`, 30 of them) keep both columns, labelled
  `"A: …"` and `"1: …"`.
- `picture.description`: the page's own alt text, plus its long description when there is one
  (`Long description: …`). Every figure on these pages has alt text.
- `chapter`: the lesson whose practice page the problem is on (unit, section title, lesson,
  lesson URL). `section` is null: the site shows section titles without letters or numbers.
- Review problems (the page says "(From Unit X, Lesson Y.)" under the problem) keep the lesson
  they appear in as `chapter` and name the origin in `fromLesson` (grade, unit, lesson, title,
  URL). Their `skillId` is mapped by the origin lesson.
- `answer` is always null: IM's solutions sit behind a teacher sign-in ("Teachers with a valid
  work email address can click here to register or sign in for free access to Formatted
  Solution"), which was not used.
- `type` is our label from the wording: multiple choice, multiple select, matching,
  constructed response (explain, show reasoning), drawing (draw, sketch, plot, label),
  table completion, short answer.
- `screenshot`: every problem with a figure (`picture.involved`) was screenshotted: the
  "Problem N" block of the practice page at 640 px wide, figures and typeset math loaded from
  IM, saved as WebP quality 70. The page HTML came from our cache; stylesheets, MathJax and
  figure images were fetched once each (cached, one request per 1.1 s); third-party scripts
  (analytics, Desmos, GeoGebra) were blocked.

### Skill mapping

Each unit lists its skills; each lesson lists the skill it teaches (`src/data/taxonomy.ts`,
`m.6.*`, `m.7.*`, `m.8.*`). Loose fits are noted on the unit (`notes`):

- Grade 6 Unit 6 Lessons 16–19 (dependent and independent variables) → `m.6.expressions-variables`
  with `m.6.coordinate-plane-4q`.
- Grade 6 Unit 3 Lessons 1–4 (unit conversion) → `m.6.unit-rates`, also `m.4.unit-conversion`.
- Grade 7 Unit 6 Lessons 18–22 (writing equivalent expressions, 7.EE.A) → no Grade 7 skill;
  `m.6.expressions-variables`.
- Grade 7 Unit 7 Lessons 6–10 (drawing polygons and triangles with given conditions) →
  `m.7.angle-relationships`, the closest.
- Grade 8 Unit 1 Lessons 14–16 (angles in a triangle, parallel lines) → `m.8.transformations`
  with `m.7.angle-relationships`.
- Grade 8 Unit 6 Lessons 9–10 (two-way tables) → `m.8.scatter-plots` (same cluster).
- Grade 6 Unit 9 Lesson 1 and Grade 7 Unit 9 Lesson 6 (Fermi problems) → `skills: []`.

## Checked and not used

- **accessim.org** (robots.txt disallows only `/api/`, `/_next/`, `/public/`): its middle-school
  pages are IM 6–8 Math v.360, a later edition under a different license: "IM® 6-8 Math v.360,
  an IM v.360 curriculum, is ©2024 by Illustrative Mathematics®, and licensed under the
  Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)"
  (footer of <https://accessim.org/ms?a=teacher>). Its content is loaded by script after a
  sign-in prompt. Not used: the CC BY 4.0 edition above covers the same courses.
- **Missing practice pages (404):** the last lesson of Units 1–8 in each grade (a
  "Let's Put It to Work" project lesson) and every Unit 9 "Putting It All Together" lesson
  have no practice page (49 lessons). They are in the TOC with `practiceUrl: null`.
- **Not visited:** solutions, cool-downs, assessments (checkpoints, mid- and end-of-unit),
  student task statements, and anything behind the Kendall Hunt / IM sign-in.

## Counts

| Grade | Units | Lessons | Practice pages | Problems | Review problems | With figure | Screenshots | MB  |
| ----- | ----- | ------- | -------------- | -------- | --------------- | ----------- | ----------- | --- |
| 6     | 9     | 147     | 133            | 811      | 357             | 249         | 249         | 3.1 |
| 7     | 9     | 145     | 124            | 634      | 297             | 157         | 157         | 2.2 |
| 8     | 9     | 131     | 117            | 541      | 231             | 238         | 238         | 3.7 |
| Total | 27    | 423     | 374            | 1,986    | 885             | 644         | 644         | 9.0 |

Every figure problem has a screenshot (well under the 25 MB budget). Retrieved 2026-09-28.
Rerun `python3 research/textbooks/tools/check_b.py` for the current numbers.

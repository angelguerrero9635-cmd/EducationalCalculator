# Group hs-a: IM Algebra 1, Geometry, Algebra 2 (Grades 9, 10, 11)

Curriculum id `im-hs`. Files:

| File                                 | What                                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| `toc/math/im-hs.json`                | Every unit, section and lesson of the three courses, with URLs and skill ids |
| `practice/math/<grade>.im-hs.jsonl`  | Every public lesson practice problem, one record each (Grades 9, 10, 11)     |
| `screenshots/im-hs/<record id>.webp` | The problem as shown on the page, for every problem with a figure            |
| `tools/check_hs_a.py`                | Checker: required fields, skill ids, screenshot files, counts per grade      |

## Source: IM Algebra 1, Geometry, Algebra 2 on curriculum.illustrativemathematics.org (CC BY 4.0)

- **Where:** <https://curriculum.illustrativemathematics.org/HS/index.html>. The courses are the
  site's `/HS/teachers/1/` (Algebra 1 → Grade 9), `/2/` (Geometry → Grade 10) and `/3/`
  (Algebra 2 → Grade 11). The table of contents comes from each course page
  (`/HS/teachers/<c>/index.html`, unit titles) and each unit page (`/HS/teachers/<c>/<u>/index.html`,
  section titles and lesson titles in page order). Lesson links point to the public teacher
  preparation page (`…/<lesson>/preparation.html`); practice problems come from the public lesson
  practice pages (`…/<lesson>/practice.html`). The page structure is the same as the 6–8 site
  (see `b.md`), and the same parser was used.
- **robots.txt** (<https://curriculum.illustrativemathematics.org/robots.txt>) holds only a
  comment line, so nothing is disallowed and no crawl delay is set. Pages were fetched with the
  User-Agent `EducationalCalculatorResearch/0.2 (offline study-app curriculum research; contact …)`
  and cached; Algebra 1 at one request per 4.5 s per host, Geometry and Algebra 2 at one request
  per 1.1 s. Nothing was fetched twice.
- **License statement** (footer of <https://curriculum.illustrativemathematics.org/HS/index.html>,
  also on every practice page):

  > © 2019 Illustrative Mathematics®. Licensed under the Creative Commons Attribution 4.0
  > license. The Illustrative Mathematics name and logo are not subject to the Creative Commons
  > license and may not be used without the prior and express written consent of Illustrative
  > Mathematics.
  >
  > This book includes public domain images or openly licensed images that are copyrighted by
  > their respective owners. Openly licensed images remain under the terms of their respective
  > licenses. See the image attribution section for more information.

  The license link in the footer is <https://creativecommons.org/licenses/by/4.0/>. The
  screenshots show the problem text and its figure only (no logos, headers or footers). Problems
  that show a third-party photo keep the page's own attribution line in `picture.attribution`.

- **Attribution:** the TOC and every practice record carry `license.attribution` with the
  footer text above, the course, unit, lesson, problem number and page URL.

### What each practice record holds

Same conventions as group b (`b.md`):

- `question`: the problem stem as published. Math is converted from the page's TeX to plain
  text (3/4, x², √(26), ≤, π, θ, sin, log_2). Systems are written `{ 2x+3y=4; x-y=1 }` and
  piecewise rules `{ -10 if -15≤ x< -10; … }`; aligned work is one line per row, with the
  page's annotation after an em dash; blanks to fill in are `____` and answer boxes `□`. Tables
  are `[Table: header | … ; row | …]`; each figure is `[Figure: <the page's alt text>]`.
  Sub-questions are lines starting with `- `.
- `choices`: the choices as published (no letters) for multiple choice and select-all; matching
  problems (`type: "matching"`) keep both columns, labelled `"A: …"` and `"1: …"`.
- `picture.description`: the page's alt text, plus its long description when there is one
  (`Long description: …`). A few figures have no alt text on the page (noted in `notes`); they
  have a screenshot.
- `chapter`: the lesson whose practice page the problem is on. `section` is null (the site
  shows section titles without letters or numbers); `sectionTitle` is the section's title.
- Review problems ("(From Unit X, Lesson Y.)" under the problem, or "(From Algebra 1, Unit X,
  Lesson Y.)" / "(From Grade 8, …)" across courses) keep the lesson they appear in as `chapter`
  and name the origin in `fromLesson` (grade, course, unit, lesson, title, URL). Their `skillId`
  is mapped by the origin lesson.
- `answer` is always null: IM's solutions sit behind a teacher sign-in ("Teachers with a valid
  work email address can click here to register or sign in for free access to Formatted
  Solution"), which was not used.
- `type` is our label from the wording: multiple choice, multiple select, matching, proof,
  constructed response, drawing, table completion, short answer.
- `screenshot`: every problem with a figure was screenshotted: the "Problem N" block of the
  practice page at 640 px wide, typeset math and figures loaded from IM, saved as WebP quality 70. The page HTML came from our cache; stylesheets, MathJax and figure images were fetched once
  each (cached); third-party scripts (analytics, GeoGebra, Desmos) were blocked.

### Skill mapping

Each unit lists its skills; each lesson lists the skill it teaches (`src/data/taxonomy.ts`).
High-school courses teach several things the Grade 9–11 skill list has no id for; those map to
the closest skill of another grade, noted on the unit (`notes`):

- **Algebra 1** Unit 1 (one-variable statistics): no Grade 9 skill. Lessons 1–11 and 14–16
  (dot plots, histograms, box plots, center, spread, outliers) → `m.6.center-spread`; Lessons
  12–13 (standard deviation) → `m.11.normal-distribution`; Lessons 6–8 (using spreadsheets)
  match no skill (lesson `skills: []`; their problems carry the unit's first skill, noted).
- Algebra 1 Unit 2 Lessons 6–9 (equivalent equations, solving for a variable) →
  `m.8.multi-step-equations`; Lessons 12–17 (systems of linear equations) → `m.8.systems-linear`.
- Algebra 1 Unit 3 Lessons 1–3 (two-way tables, association in categorical data) →
  `m.10.conditional-probability`, the closest.
- Algebra 1 Unit 4 (function notation, features of graphs, average rate of change, domain and
  range, piecewise functions) → `m.8.functions-intro`; Lessons 15–17 (inverse functions) →
  `m.11.inverse-functions`.
- Algebra 1 Unit 7 Lessons 20–21 (rational and irrational solutions, sums and products of
  rational and irrational numbers) → `m.9.radicals`.
- **Geometry** Unit 1 Lessons 10–18 (rigid transformations defined precisely, symmetry) →
  `m.8.transformations` with `m.10.congruence`.
- Geometry Unit 5 Lessons 1–8 (solids of rotation, cross sections, scaling area and volume) →
  `m.10.volume-derivations` (with `m.10.similarity` for scaling).
- Geometry Unit 6 Lessons 4–8 (equations of circles and parabolas from distance) →
  `m.12.conics` with `m.10.coordinate-geometry`.
- Geometry Unit 7 Lessons 11–13 (radians) also list `m.11.unit-circle`.
- Geometry Unit 8 Lessons 1–6 (sample spaces, the addition rule) →
  `m.10.conditional-probability` with `m.7.probability`.
- **Algebra 2** Unit 3 Lessons 1–9 (rational exponents, radical equations) → `m.9.radicals`;
  Unit 4 Lessons 1–7 (exponential functions at rational inputs) → `m.9.exponential-functions`.
- Algebra 2 Unit 5 (transformations of functions: translations, reflections, scaling, even and
  odd functions) has no skill at all. Lessons 1–9 are mapped loosely to
  `m.9.quadratic-functions` with `m.9.absolute-value` and `m.9.exponential-functions`;
  Lesson 10 (combining functions) → `m.11.inverse-functions`; Lesson 11 → `m.9.regression`.
- Algebra 2 Unit 7 Lessons 1–3 (study types) → `m.7.sampling`; Lessons 13–16 (randomized
  experiments, significance by simulation) → `m.12.hypothesis-testing`.

**Taxonomy gaps** (for `TAXONOMY_ISSUES.md`): high-school one-variable statistics (S-ID.A:
spread, standard deviation, outliers), function notation and features of graphs (F-IF),
systems of equations and solving literal equations at Grade 9, two-way tables (S-ID.B.5),
transformations of functions (F-BF.B.3), rigid-motion definitions of transformations
(G-CO.A), cross sections and scaling of solids (G-GMD.B), sample spaces and the addition rule
(S-CP.A/B.7), study design (S-IC.B.3) and rational exponents at Grade 11 (N-RN.A).

## Checked and not used

- **Algebra 1 Supports** (`/HS/teachers/4/`, "Extra Support Materials for Algebra 1 …") and the
  Spanish student pages (`/AGA_ES/`): extra-support lessons that shadow Algebra 1, not a course
  of their own. Not included.
- **Missing practice pages:** none. Every lesson of the three courses, including the last "Putting It All Together" lessons, has a public practice page (376 of 376).
- **Not visited:** solutions, cool-downs, assessments, modeling prompts, student task
  statements, and anything behind the Kendall Hunt / IM sign-in.

## Counts

| Grade | Course    | Units | Lessons | Practice pages | Problems | Review problems | With figure | Screenshots | MB   |
| ----- | --------- | ----- | ------- | -------------- | -------- | --------------- | ----------- | ----------- | ---- |
| 9     | Algebra 1 | 7     | 132     | 132            | 1,030    | 527             | 295         | 295         | 5.1  |
| 10    | Geometry  | 8     | 124     | 124            | 955      | 604             | 551         | 551         | 6.9  |
| 11    | Algebra 2 | 7     | 120     | 120            | 781      | 365             | 215         | 215         | 3.2  |
| Total |           | 22    | 376     | 376            | 2,766    | 1,496           | 1,061       | 1,061       | 15.2 |

Every figure problem has a screenshot (within the ~30 MB budget). Four figures have no alt text
on the page (`imhs-G9-U4-L16-P8`, `imhs-G9-U7-L18-P8`, `imhs-G9-U7-L19-P7`,
`imhs-G11-U3-L19-P2`); their screenshot carries the figure. Twelve problems show third-party
photos with the page's attribution in `picture.attribution`. All review problems point back
within the same course.

Retrieved 2026-09-29 (Algebra 1 pages 2026-09-28). Rerun
`python3 research/textbooks/tools/check_hs_a.py` for the current numbers.

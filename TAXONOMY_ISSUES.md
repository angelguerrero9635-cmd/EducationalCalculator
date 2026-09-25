# Taxonomy issues

`src/data/taxonomy.ts` is the single source of truth and is kept **unchanged**. Problems or
suggestions found while building the wireframe are listed here instead of being patched in the
data or worked around silently in the UI.

**Status:** `validateTaxonomy()` returns **0 errors and 0 warnings**. Additional checks in
`src/data/__tests__/selectors.test.ts` also pass: every course's `fields` exist in `HE_FIELDS`,
every skill and course is reachable through Browse, and every prereq resolves. Nothing below
blocks the wireframe.

## Data observations

1. **Grade 10 "Conditional probability and independence" is in the Geometry strand.**
   `m.10.conditional-probability` uses `GEO`. Common Core places it under Statistics &
   Probability (HSS-CP). Because every Grade 9–12 math skill shares one course-style strand
   (Algebra 1, Geometry, Algebra 2, Precalculus & Statistics), those grade screens have a single
   section header. If that's intended, this is fine. Otherwise, consider an `SP` strand for
   Grade 10.

2. **Strands aren't contiguous in two grades.** The Grade screen groups skills by strand in order
   of first appearance, so these skills appear on screen in a different order than in the file:
   - Grade 4 math: `m.4.factors-multiples` (Operations & Algebraic Thinking) sits between Number &
     Base Ten skills, and `m.4.place-value-million` is shown before it.
   - Grade 8 math: `m.8.roots-irrationals` (The Number System) sits between Expressions &
     Equations skills.

   If file order is meant to be teaching order, reorder those rows so each strand is contiguous.

3. **Science Grade 7 has no Earth & Space Science skills, and Grade 8 has no Life Science
   skills.** This is informational (NGSS middle school is often integrated across grades), but
   those grade screens show fewer strand sections.

4. **Some topic titles repeat across courses.** "Laws of thermodynamics" (Physical Chemistry I,
   Thermal & Statistical Physics), "Maxwell's equations" (Electromagnetic Theory, Engineering
   Electromagnetics) and "Fatigue" (Aerospace Structures, Machine Design). That's reasonable, but
   Search shows each one separately. Topics have no ids, so the app identifies them as
   `courseId#index`: reordering a course's `topics` changes which topic a saved "Recently viewed"
   entry points to. Consider stable topic ids once topics carry content (formulas, worked
   examples).

## Section 1 review: skill titles and missing skills (resolved)

9. **Skill titles above the grade's reading level.** Resolved: `taxonomy.ts` now uses the
   language reviewer's titles for 8 K–2 skills (for example "Add in any order or grouping").
10. **K–2 standards with no skill.** Resolved:
    - Added `m.K.position-words` (K.G.1) and `m.K.compose-shapes` (K.G.6, 1.G.2).
    - Capacity is a problem type of `m.K.measurable-attributes`, now titled "Compare length,
      height, weight and capacity".
    - Faces of cubes and other solids (2.G.1) is a problem type of `m.2.thirds-polygons`, now
      titled "Thirds, and naming shapes and solids by sides, angles and faces".

11. **Grade 1 has no geometry skill besides halves and fourths** (resolved: added
    `m.1.shape-attributes`, "Shape attributes: sides, corners and closed shapes"). From the textbook-coverage review,
    third round). Illustrative Mathematics Grade 1 Unit 7 and Eureka Grade 1 Module 5 teach
    shape attributes and composing flat and solid shapes (1.G.1, 1.G.2). Suggested skill:
    "Shape attributes and building shapes", grade 1, Geometry.

## Suggested additions (would remove UI-side derivations)

5. **No display titles for divisions or K–12 subjects.** `Division` and `K12Subject` are ids
   only. The UI derives "Math", "Science" and "Engineering" by capitalizing the id
   (`divisionLabel` and `subjectLabel` in `selectors.ts`). Consider exporting title maps such as
   `DIVISION_TITLES` and `SUBJECT_TITLES`.

6. **`refreshLinks()` labels omit the subject for cross-subject prereqs.** For example,
   `s.10.mole` → `m.8.scientific-notation` renders as "Refresh: Grade 8", although the target is
   a Math skill. The UI appends the subject ("Refresh: Grade 8 · Math"). The cross-subject
   prereqs are `s.10.mole`, `s.10.acids-bases`, `s.11.kinematics-2d` and
   `s.12.radiometric-dating`.

7. **No explicit "primary" field for cross-listed engineering courses.** The first entry in
   `fields` is effectively treated as primary in labels (Statics → "Classical (Engineering
   Mechanics), Aerospace +3"). If one field should lead, order `fields` deliberately or add a
   `primaryField`.

8. **`validateTaxonomy()` could also check:**
   - each course's `fields` exist in `HE_FIELDS[division]`
   - `topics` are non-empty and unique within a course
   - the Math division's single field has courses (only science and engineering are checked for
     empty fields today)

   These are enforced in the test suite for now.

9. **Grade 3 skill titles use shorthand a Grade 3 student may not read** (plain-language check
   K). Suggested titles:
   - `m.3.multiplication-properties` "Properties of multiplication (incl. distributive)" →
     "Properties of multiplication: order, grouping and breaking apart"
   - `m.3.area` "Area of rectangles (A = l × w)" → "Area of rectangles"

10. **Grade 3 standards with no skill in the taxonomy.** The Grade 3 review found these CCSS
    standards have nowhere to live, so no lessons were built for them:
    - 3.NBT.2: add and subtract within 1000 (strategies by place value). Only rounding
      (3.NBT.1) has a skill; the new "Estimate a sum" page covers part of this.
    - 3.NBT.3: multiply a one-digit number by a multiple of 10 (9 × 80, 5 × 60).
    - 3.OA.9: arithmetic patterns in the addition and multiplication tables.
    - 3.MD.4: measure lengths to the nearest half and quarter inch, and show them on a line plot.

    Suggested new skills: `m.3.add-sub-1000`, `m.3.multiply-by-tens`, `m.3.arithmetic-patterns`
    and `m.3.measure-line-plots`.

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

## Section 1 review: skill titles and missing skills

The language reviewer checked the K–2 skill titles that students read, and the
textbook-coverage reviewer compared K–2 with Illustrative Mathematics and Eureka Math. These
need changes to `taxonomy.ts`, so they are listed here.

9. **Skill titles above the grade's reading level.** Suggested rewrites (same meaning):

   | Skill                     | Now                                                          | Suggested                                     |
   | ------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
   | `m.K.teens-place-value`   | Teen numbers as ten ones and some more ones                  | Teen numbers: 10 ones and some more ones      |
   | `m.K.shapes-2d-3d`        | Identify 2D and 3D shapes                                    | Name flat and solid shapes                    |
   | `m.1.addition-properties` | Commutative and associative properties of addition           | Add in any order or grouping                  |
   | `m.1.equal-sign`          | Meaning of the equal sign and missing addends                | The equal sign and missing numbers            |
   | `m.1.measure-nonstandard` | Measure length with non-standard units                       | Measure length with cubes or paper clips      |
   | `m.1.data-3-categories`   | Organize and read data with up to three categories           | Sort and compare data in three groups         |
   | `m.1.halves-fourths`      | Partition shapes into halves and fourths                     | Cut shapes into halves and fourths            |
   | `m.2.thirds-polygons`     | Partition into thirds; identify polygons by sides and angles | Thirds, and naming shapes by sides and angles |

10. **K–2 standards with no skill.** Textbooks give each of these at least one lesson:
    - Position words: above, below, beside, in front of, behind, next to (K.G.1).
    - Compose shapes: put shapes together to make larger shapes (K.G.6, 1.G.2).
    - Capacity (compare how much containers hold), usually taught with K.MD.1–2.
    - Faces of cubes and other solids (2.G.1 names "cubes" as well as polygons).

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

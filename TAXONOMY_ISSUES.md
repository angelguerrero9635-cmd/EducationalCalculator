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

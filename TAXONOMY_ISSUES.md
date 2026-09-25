# Taxonomy issues

`src/data/taxonomy.ts` is the single source of truth for grades, skills, fields and courses. It
can be updated as needed. This file tracks problems found while building lessons: open ones
first, then what was changed and why.

**Status:** `validateTaxonomy()` returns **0 errors and 0 warnings**. It now also checks that
course fields exist, topics are non-empty and unique, every field in every division has courses,
and each strand's skills sit together within a grade.

## Open

1. **Science Grade 7 has no Earth & Space Science skills, and Grade 8 has no Life Science
   skills.** This is informational: NGSS middle school is often integrated across grades. Those
   grade screens show fewer strand sections. Revisit when building science lessons for Grades 6–8.

2. **Topics have no stable ids.** Some topic titles repeat across courses: "Laws of
   thermodynamics" (Physical Chemistry I, Thermal & Statistical Physics), "Maxwell's equations"
   (Electromagnetic Theory, Engineering Electromagnetics) and "Fatigue" (Aerospace Structures,
   Machine Design). The repeats are reasonable, but Search lists each one separately. The app
   identifies a topic as `courseId#index`, so reordering a course's `topics` changes which topic
   a saved "Recently viewed" entry points to. Give topics stable ids when they get lessons, since
   that will be the first time reordering could lose a student's place.

## Resolved

### Grade 3 review

- **Titles in plain language:** `m.3.multiplication-properties` is now "Properties of
  multiplication: order, grouping and breaking apart", and `m.3.area` is now "Area of
  rectangles" (was "Area of rectangles (A = l × w)").
- **Standards with no skill.** Added three skills, each with lessons:
  - `m.3.arithmetic-patterns` (3.OA.9): "Patterns in addition and multiplication tables"
  - `m.3.multiply-by-tens` (3.NBT.3): "Multiply by multiples of 10 (like 9 × 80)". It is now a
    prereq of `m.4.multi-digit-multiply`.
  - `m.3.measure-line-plots` (3.MD.4): "Measure to the half and quarter inch; line plots"

  3.NBT.2 (add and subtract within 1000) already has a skill, `m.2.add-sub-1000`. By the
  taxonomy's rule, a skill is defined once, in the grade where it is first taught, so no Grade 3
  copy was added. Grade 3's "Estimate a sum" page adds rounding to check answers.

### Structure

- **Strands split up in Grades 4 and 8.** The rows are reordered so each strand's skills sit
  together, in Common Core order: Grade 4 lists Operations & Algebraic Thinking before Number &
  Base Ten; Grade 8 lists The Number System before Expressions & Equations. `validateTaxonomy()`
  now warns if a strand is split again.
- **Grade 10 "Conditional probability and independence" in the Geometry strand.** Kept as is.
  Grades 9–12 use course strands, and Common Core's traditional pathway teaches conditional
  probability (HSS-CP) in the Geometry course.
- **Display titles for divisions and subjects.** `taxonomy.ts` exports `SUBJECT_TITLES` and
  `DIVISION_TITLES`. The UI uses them instead of capitalizing ids.
- **Refresh links for prereqs in another subject.** `refreshLinks()` names the subject for every
  skill prereq ("Refresh: Grade 8 · Math"), so a Math skill linked from Science says so. The UI
  no longer adds the subject itself.
- **Primary field of a cross-listed course.** The first entry in a course's `fields` is its home
  field, and `Course.fields` documents that. The current order is deliberate: Classical
  (Engineering Mechanics) leads for statics, dynamics and solids; Aerospace leads for thermal and
  fluids courses; Electrical leads for circuits and signals.

### Section 1 review (Kindergarten–Grade 2)

- **Titles above the grade's reading level:** 8 K–2 skills use the language reviewer's titles
  (for example "Add in any order or grouping").
- **Standards with no skill:**
  - Added `m.K.position-words` (K.G.1) and `m.K.compose-shapes` (K.G.6, 1.G.2).
  - Added `m.1.shape-attributes`, "Shape attributes: sides, corners and closed shapes" (1.G.1).
  - Capacity is a problem type of `m.K.measurable-attributes`, now titled "Compare length,
    height, weight and capacity".
  - Faces of solids (2.G.1) is a problem type of `m.2.thirds-polygons`, now titled "Thirds, and
    naming shapes and solids by sides, angles and faces".

# Grades 9–12 pictures, round 4

Paste everything below the line into the pictures chat.

---

You are working in the EducationalCalculator repository on your pictures branch
(`claude/edu-calc-assets-questions-379toc`). First merge `claude/ios-education-wireframe-313z7z`
into it.

## Since round 3

Every round-3 picture (H106–H110) is placed on its pages, and Grades 9–12 had two page reviews.
The lesson chat fixed what they found, including shared component work you will see in the merge:
drags keep typed values (`useCalculator.set`), subscripts and superscript letters, label halos
(`ChartText halo`), `CHOICES.alt` and `CHOICES.pm`, `normalCurve` `meanName`, curved rays in
`EarthLayers`, the ice lattice (`molecules` state `ice`). Six gallery demos were removed because
their pages now carry the same options.

## This round: four small parts (docs/HS_NEEDS.md, P23–P26)

1. **P23 `rotor`:** the hollow ball (c = 2/3), named and in the compare row. Page:
   `s.11.rotation~rotational-inertia`.
2. **P24 `normalCurve` `f.tails` from a value:** one tail or two as a sign box says, so the F
   curve agrees with P for both choices. Page: `m.12.anova~two-variances`.
3. **P25 a counting fraction for "exactly k of r":** C(a, k) × C(b, r − k) ÷ C(a + b, r), groups
   up to 60. Page: `m.10.probability-rules~counting-probability`.
4. **P26 germ-layer bins colored** as the gastrula card draws them. Page:
   `s.9.reproduction-development~germ-layers`.

Add each as a tracker entry (`H111`–`H114` in `src/data/modules/pictureRequestsHs.ts`) with a
gallery demo, the fields in its notes, a check in `harness/pictures*.ts`, and a line in
`docs/PICTURES.md` or `docs/LAYOUTS.md`. A new option never changes a page that exists, and you
don't edit the grade files: the lesson chat places each part.

## Checks (essentials only)

- `npx tsc --noEmit -p .` and eslint on the files you changed.
- The tests of your demos by id: `MODULE_IDS=<demo ids> npx jest --maxWorkers=1 src/data/modules`.
- One screenshot per demo at 390 px:
  `NODE_PATH=$(npm root -g) pnpm shots -- <ids> --widths 390 --out .review/r4`.
- Before a push, `node scripts/ci-test.mjs` (the cheap suites).

No full or deep runs: the heavy suites run nightly, and the lesson chat checks the pages when it
places the parts.

# Grades 9–12 pictures, round 2

Paste everything below the line into the pictures chat.

---

You are working in the EducationalCalculator repository on your pictures branch
(`claude/edu-calc-assets-questions-379toc`). First merge `claude/ios-education-wireframe-313z7z`
into it.

## What happened since round 1

Every picture of round 1 (`H01`–`H88`) is drawn. The lesson chat then:

- wrote a direction plan for each grade and subject, 9–12 (`docs/plans/<m|s>.<grade>.md`);
- built the pages from them, one builder per plan (`docs/BUILD_HS.md`);
- listed what the plans still need in `docs/HS_NEEDS.md`. The engine part (E) is the lesson
  chat's and mostly done. The picture part (P1–P17) is yours.

The builders are done: 533 Grade 9–12 pages are built and merged. 44 planned pages wait on your
pictures, and some built pages use a stand-in until an option lands (a fixed sign instead of a
sign box, a table instead of a missing picture, a normal curve instead of a t curve). Each
`docs/build/<plan>.md` lists its waiting pages and stand-ins, and "Shared needs" names the options
it wanted. The builders also found smaller options, collected as P16 and P17 (`H104`, `H105`).

## Read first

- `CLAUDE.md`, `docs/RENDERINGS_BRIEF.md` (hard rules, art direction, "Testing") and the quality
  floor in `docs/RENDERINGS_ROUND_4.md`. They all still apply.
- `docs/HS_NEEDS.md`, the Pictures table.
- For each entry, the plan need it quotes (`docs/plans/<plan>.md`, "Engine and picture needs"):
  it says what the page shows, which values drive it and which pages wait.
- `src/data/modules/pictureRequestsHs.ts`: entries `H89`–`H105`, all `requested`. Each covers one
  P item and may hold several parts; draw them part by part.

## Order

Most pages first:

1. **H90 (P2): a sign box drives the picture.** Shading on `lineSystem`, `linearFunction` and
   `functionGraph`, closed or open ends on `integerLine`, and the tail of `normalCurve` read a
   value holding the sign code (1 <, 2 ≤, 3 >, 4 ≥, as `{s:sign}` stores it; ≠ for a two-tailed
   test). It unblocks the inequality pages of Grades 9 and 12.
2. **H96 (P8): Geometry,** for about 15 Grade 10 pages: the regular polygon, compass-arc
   construction stages, marked-triangle and cross-section cards, `circleTheorems` cyclic and
   arcAngle, `coordinatePlane` to ±20, and symmetry about a center.
3. **H102 (P14): Physics; H101 (P13): Chemistry; H100 (P12): Biology; H103 (P15): Earth and
   space.** About 10 pages each.
4. **H89, H91–H95, H97–H99 (P1, P3–P7, P9–P11).** Smaller options on math kinds that exist.
5. **H104–H105 (P16–P17).** Options that let built pages drop their stand-ins.

## Rules for this round

- **A new option never changes a page that exists.** It is off unless a page sets it. The K–8
  and Grade 9–12 pages keep drawing as they do.
- **Kinds and figures only.** Never edit the grade files `math/9–12.ts`, `science/9–12.ts` or
  `layouts/*9–12.ts`: the lesson chat places each picture on its pages and removes the
  stand-ins. Show each part in a gallery demo.
- **When a part is drawn:**
  - add its demo;
  - list the demo under the entry's `gallery` and write the fields you chose in its `notes`;
  - set the entry to `drawn` when all its parts are;
  - add the kind's checks in `harness/pictures.ts`;
  - document the option in `docs/PICTURES.md` or `docs/LAYOUTS.md`.
- **Test** as "Testing" in `docs/RENDERINGS_BRIEF.md` says: your demos by id, then
  `pnpm test src/components src/data/__tests__`, then `node scripts/ci-test.mjs` once before each
  push.
- Keep `docs/HS_NEEDS.md` current: mark a P item `done` when its entry is `drawn`.

# Handoff (2026-10-02)

Where the work stands, for the next session. Everything listed as merged is on
`claude/ios-education-wireframe-313z7z`.

## Owner rules in force

- Heavy test runs (modules, sampling `--heavy`/`--full`) only when the owner authorizes one; no
  nightly run. Test by id (`MODULE_IDS=…`) and `node scripts/ci-test.mjs` before a push.
- For the next hour after 2026-10-02 ~21:00 UTC: one task at a time.
- College decisions: `docs/HE_NEEDS.md` "Decisions (settled 2026-10-02)" (g = 9.81, wait for
  pictures, titles only for OpenStax, split by field, pilots redone, taxonomy updates authorized).

## Done and merged

- K–12: every skill has pages; reviews done; site-wide "?" and drag sweep merged (`70fa18d`).
- College: 8 direction plans (`docs/plans/he.*.md`), combined into `docs/RENDERINGS_HE.md`
  (191 picture requests, 4 rounds, ready for the pictures chat), `docs/RESEARCH_HE.md` (research
  chat prompt), `docs/HE_NEEDS.md` (32 engine needs), `docs/HE_TAXONOMY_GAPS.md` (applied).
- College engine needs done: HE-E1–E12, E14–E19, E21, E25, E26 (E14/E18 merged: closed forms and trial lines replace "Try numbers until both sides match"; 54 K–12 pages' steps changed) (see HE_NEEDS status lines).

## Small fixes left

- Picture leftovers from the sweep are merged; three remain (top entry of `docs/REVIEW_LOG.md`):
  the rational-function zero handle unmounts on the pole; m.9.quadratic-formula~inequality
  disagrees with the box on b's sign after a vertex drag; a false positive on
  g.s9-biotechnology-start-stop.
- A DMS angle label in a picture shows a second ° (reps/common.tsx, from HE-E19).
- s.9 whole-count pages still allowlisted (pcr, population-ecology, doubling, herd-immunity).
- The backup branches `backup/he-e14-e18-trials-logs` and `backup/picture-leftovers` are no
  longer needed (both merged); delete them when the owner agrees.

## Next steps

1. Engine needs left: HE-E13 (named data rows), E20 (special functions), E22 (sums, series,
   recurrences), E23 (data lists), E24 (limits with reasons), E27 (water/steam), E28 (statistics
   critical values), E29 (chemistry structure models), E30 (money), E31 (integral templates),
   E32 typed functions (later). HE-E6 typesetting of dy/dx, [F] from a to b and lim is partly left.
2. Plan pages for the 75 topics and 5 courses added from the taxonomy gaps (the plans predate them).
3. Give `docs/RENDERINGS_HE.md` round 1 to the pictures chat; give `docs/RESEARCH_HE.md` to a
   research chat.
4. Build college pages from the plans (pictures and engine needs permitting); review them.

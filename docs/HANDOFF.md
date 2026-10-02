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

## In progress when this note was written (local worktrees, not yet merged)

1. **Picture leftovers from the sweep** — worktree `.claude/worktrees/agent-ac5db7aa6447d4eef`,
   several commits (handles that stood still now move or hide, angle handles past the vertex,
   false-positive rules) plus uncommitted component edits. Backed up to branch
   `backup/picture-leftovers`; if the worktree is gone, finish from that branch (the
   remaining list is in `docs/REVIEW_LOG.md`).
   Also add: a DMS angle label in a picture shows a second ° (reps/common.tsx, from HE-E19).

## Next steps

1. Merge the picture leftovers when it finishes (quick checks, push).
2. Engine needs left: HE-E13 (named data rows), E20 (special functions), E22 (sums, series,
   recurrences), E23 (data lists), E24 (limits with reasons), E27 (water/steam), E28 (statistics
   critical values), E29 (chemistry structure models), E30 (money), E31 (integral templates),
   E32 typed functions (later). HE-E6 typesetting of dy/dx, [F] from a to b and lim is partly left.
3. Plan pages for the 75 topics and 5 courses added from the taxonomy gaps (the plans predate them).
4. Give `docs/RENDERINGS_HE.md` round 1 to the pictures chat; give `docs/RESEARCH_HE.md` to a
   research chat.
5. Build college pages from the plans (pictures and engine needs permitting); review them.

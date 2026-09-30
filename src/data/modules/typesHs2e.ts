/**
 * Picture specs and options for the Grades 9–12 round 2 biology and sort pictures of group H2E
 * (H100 and H104 in `pictureRequestsHs.ts`), kept apart from `types.ts` and `layouts/types.ts`
 * so those files only name them.
 */
import type { MacroKind } from './typesHsg';

/** A fixed number or a variable id (as in `typesGraphs.ts`). */
type NumOrVar = number | string;

// ─── H100 part 1: macromolecules as a calculator picture ─────────────────────

/**
 * The `macromolecules` figure (H31) driven by a value: `count` monomers join by dehydration
 * synthesis (or split, `split`, by hydrolysis). 2–4 are drawn; past 4 the first two and the
 * last, with "…" between them, and the count written. `bonds` and `water` (optional) are
 * variables holding the new bonds and the water molecules given off (count − 1 each, checked).
 * `macro` is the polymer's kind: a carbohydrate, a protein or a nucleic acid (a fat is not a
 * chain of any length).
 */
export interface MacroCalcSpec {
  kind: 'macromolecules';
  macro: Exclude<MacroKind, 'lipid'>;
  count: NumOrVar;
  bonds?: string;
  water?: string;
  split?: boolean;
}

/** Group H2E's calculator pictures. */
export type Hs2eSpec = MacroCalcSpec;

/** Every variable id a group-H2E picture reads (for modules.test.ts). */
export function hs2eSpecVars(r: Hs2eSpec): string[] {
  const ids = (xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'macromolecules':
      return ids([r.count, r.bonds, r.water]);
  }
}

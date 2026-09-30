/**
 * Picture options and specs for Grades 9–12 round 3, group H3E (H108: chemistry; see
 * pictureRequestsHs.ts and docs/build/s.10.md, "Shared needs"). Kept apart from `types.ts` and
 * the earlier round files so their unions only name them. A `NumOrVar` field is a fixed number
 * or a variable id.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── Part 2: an ionic compound from its ions' charges ────────────────────────

/**
 * Round 3 option on `lewisStructure` mode `ionic` (H108 part 2): the ions come from their
 * charges. `metal` is the metal ion's charge (1–3: Na⁺, Mg²⁺, Al³⁺) and `nonmetal` the size of
 * the nonmetal ion's charge (1–3: Cl⁻, O²⁻, N³⁻); `metals` and `nonmetals` pick other elements
 * by charge (index 0 for a charge of 1). While a charge is "?" the spec's own `metal` and
 * `nonmetal` draw faded.
 */
export type IonicCharges = {
  metal: NumOrVar;
  nonmetal: NumOrVar;
  metals?: [string, string, string];
  nonmetals?: [string, string, string];
};

export const ionicChargeVars = (c: IonicCharges | undefined) => (c ? ids(c.metal, c.nonmetal) : []);

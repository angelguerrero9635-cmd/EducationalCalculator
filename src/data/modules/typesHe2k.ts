/**
 * Picture options and specs for the college pictures, round 2, group K (docs/RENDERINGS_HE.md):
 * HC34, the college options of `chemDiagram` mode `rate`, and HC36, the `globe` kind. Kept apart
 * from `types.ts` and the earlier round files so their unions only name them. A `NumOrVar` field
 * is a fixed number or a variable id.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC34: chemDiagram mode `rate`, college options ──────────────────────────

/**
 * How a concentration is written: `bracket` [A] (chemistry pages, the default) or `C` C_A
 * (reaction-engineering pages).
 */
export type ConcNotation = 'bracket' | 'C';

/**
 * College options of `chemDiagram` mode `rate` (HC34; C-P7, ACC-P32). A spec sets exactly one
 * of them (and no `times`, which mark the Grades 9–12 two-reading secant):
 *
 * - `integrated: { order, k, start, t?, conc?, half? }` — an integrated rate law of order 0, 1
 *   or 2: [A] against t from (0, [A]₀), half-lives marked (constant spacing for order 1, each
 *   twice the last for order 2, [A]₀ ÷ (2k) and the time it runs out for order 0) and the point
 *   at t; under it the straight-line plot (ln [A] for order 1, 1/[A] for order 2) with its slope
 *   ∓k. Units come from the variables (k's, t's and [A]₀'s). `conc` and `half` are checked.
 * - `arrhenius: { k1, T1, k2, T2, Ea?, R? }` — ln k against 1/T through the two readings, the
 *   run and rise, slope −Eₐ ÷ R. T in K or °C (by the variable's unit), Eₐ in kJ/mol or J/mol,
 *   R from the page (default 8.314 J/(mol·K)).
 * - `consecutive: { k1, k2, start, t?, tmax?, peak? }` — A → B → C, first-order steps: the three
 *   concentrations against t, B's peak at t_max (`tmax`, `peak` checked), the three values at
 *   t (`at`, checked); [A] + [B] + [C] = [A]₀ dotted. `species` renames A, B, C.
 *
 * `notation: 'C'` writes C_A for [A]. A "?" draws nothing for its value; values that can't make
 * the case (order 0 past the time it runs out, k₁ = k₂ for t_max from the formula, equal
 * temperatures) draw faded with the reason in the caption.
 */
export interface ChemRateHe2kSpec {
  kind: 'chemDiagram';
  mode: 'rate';
  integrated?: {
    order: 0 | 1 | 2;
    k: NumOrVar;
    start: NumOrVar;
    t?: NumOrVar;
    conc?: NumOrVar;
    half?: NumOrVar;
  };
  arrhenius?: {
    k1: NumOrVar;
    T1: NumOrVar;
    k2: NumOrVar;
    T2: NumOrVar;
    Ea?: NumOrVar;
    R?: NumOrVar;
  };
  consecutive?: {
    k1: NumOrVar;
    k2: NumOrVar;
    start: NumOrVar;
    t?: NumOrVar;
    tmax?: NumOrVar;
    peak?: NumOrVar;
    /** The three concentrations at t, checked. */
    at?: [NumOrVar, NumOrVar, NumOrVar];
    species?: [string, string, string];
  };
  /** The reactant's name in `integrated` (default A). */
  species?: string;
  notation?: ConcNotation;
}

export function chemRateHe2kVars(r: ChemRateHe2kSpec): string[] {
  const i = r.integrated;
  const a = r.arrhenius;
  const s = r.consecutive;
  return [
    ...(i ? ids(i.k, i.start, i.t, i.conc, i.half) : []),
    ...(a ? ids(a.k1, a.T1, a.k2, a.T2, a.Ea, a.R) : []),
    ...(s ? ids(s.k1, s.k2, s.start, s.t, s.tmax, s.peak, ...(s.at ?? [])) : []),
  ];
}

/**
 * College pictures, round 4, group F (docs/RENDERINGS_HE.md, earth science). Kept apart from
 * `types.ts` and `typesHsl.ts` so each gains a line. A `NumOrVar` field is a fixed number or a
 * variable id, read in the variable's formula unit (the unit each field names); a string field
 * is the page's own value, checked.
 *
 * - HC116 `ternary` (new kind): a triangle plot with a 10 % grid, QAP or feldspar fields.
 * - HC117 `silicateChain` (new kind): SiO₄ tetrahedra from above, sharing oxygens.
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC116: ternary (new kind) ─────────────────────────────────────────────────

/**
 * HC116 (EG-P1): three amounts `a` (the top corner), `b` (bottom left) and `c` (bottom right),
 * in any one unit (%, mol), plotted at a ÷ sum, b ÷ sum, c ÷ sum on a triangle with a 10 % grid,
 * the corners named by `labels`. `fields` adds a classification with its fields numbered or
 * named, the point's field lit and named in the caption:
 *
 * - `'qap'`: the IUGS plutonic triangle, Q (quartz) at the top, A (alkali feldspar) left, P
 *   (plagioclase) right: rows at Q′ = 5, 20, 60, 90 % and the P ÷ (A + P) lines at 10, 35, 65
 *   and 90 % (fields 1a–10, keyed under the triangle);
 * - `'feldspar'`: Or at the top, Ab left, An right: plagioclase along the Ab–An edge (Or ≤ 10 %)
 *   named albite to anorthite by An ÷ (Ab + An) (10, 30, 50, 70, 90 %), the alkali feldspars
 *   along the Ab–Or edge (An ≤ 10 %: anorthoclase to Or 37 %, then sanidine and orthoclase), and
 *   no single feldspar between them (the fields are drawn straight, a teaching simplification).
 *
 * `share` is the page's c ÷ (b + c) in % (P ÷ (A + P); An), dashed from the top corner through
 * the point to the base; `normalized` the page's three percents (all checked). Nothing is
 * plotted while an amount is "?" or the sum is 0. Later also sand–silt–clay.
 */
export interface TernarySpec {
  kind: 'ternary';
  a: NumOrVar;
  b: NumOrVar;
  c: NumOrVar;
  /** The corners' names: top, bottom left, bottom right ("Q", "A", "P"). */
  labels: [string, string, string];
  fields?: 'qap' | 'feldspar';
  share?: NumOrVar;
  normalized?: [NumOrVar, NumOrVar, NumOrVar];
}

// ─── HC117: silicateChain (new kind) ───────────────────────────────────────────

/**
 * HC117 (EG-P2): silicate structures from above, each SiO₄ tetrahedron a triangle with O at its
 * three corners and Si at the centre (the fourth O on top of the Si, drawn as a ring round it).
 * `shared` is the oxygens each tetrahedron shares, s: 0 isolated (olivine), 1 a pair (epidote),
 * 2 a six-ring (`form: 'ring'`, beryl) or a single chain (the default, pyroxenes), 2.5 a double
 * chain (amphiboles), 3 a sheet (micas, clays), 4 a framework corner (quartz). `units` is n, the
 * Si in the boxed repeat unit (whole, 1–6; a ring of 3 to 6 is drawn with n tetrahedra), its
 * tetrahedra lit; shared oxygens are ringed and count ½ in the box. `oxygens` is the page's O in
 * the unit, `perSi` its O per Si, `charge` its charge (all checked: O = n(4 − s ÷ 2), charge =
 * −n(4 − s)). Another s draws faded, the reason in the caption.
 */
export interface SilicateChainSpec {
  kind: 'silicateChain';
  shared: NumOrVar;
  units: NumOrVar;
  form?: 'ring' | 'chain';
  oxygens?: NumOrVar;
  perSi?: NumOrVar;
  charge?: NumOrVar;
}

/** Every picture of group HE4F (new kinds and options on drawn kinds). */
export type He4fSpec = TernarySpec | SilicateChainSpec;

/** Whether a picture is one of group HE4F's (a new kind, or an option on a drawn kind). */
export function isHe4fSpec(r: { kind: string }): r is He4fSpec {
  return r.kind === 'ternary' || r.kind === 'silicateChain';
}

/** Every variable id a group-HE4F picture reads (modules.test.ts). */
export function he4fSpecVars(r: He4fSpec): string[] {
  switch (r.kind) {
    case 'ternary':
      return ids(r.a, r.b, r.c, r.share, ...(r.normalized ?? []));
    case 'silicateChain':
      return ids(r.shared, r.units, r.oxygens, r.perSi, r.charge);
  }
}

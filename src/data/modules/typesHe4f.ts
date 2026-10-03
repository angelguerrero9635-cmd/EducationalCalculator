/**
 * College pictures, round 4, group F (docs/RENDERINGS_HE.md, earth science). Kept apart from
 * `types.ts` and `typesHsl.ts` so each gains a line. A `NumOrVar` field is a fixed number or a
 * variable id, read in the variable's formula unit (the unit each field names); a string field
 * is the page's own value, checked.
 *
 * - HC116 `ternary` (new kind): a triangle plot with a 10 % grid, QAP or feldspar fields.
 * - HC117 `silicateChain` (new kind): SiO₄ tetrahedra from above, sharing oxygens.
 * - HC119 `earthLayers` mode `rupture`: the fault patch L × W to scale, slip, Mw against M 6.
 * - HC120 `rockLayers` `ranges`, and the cliff as a sequence `header` (layouts/types.ts).
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

// ─── HC119: earthLayers mode rupture ───────────────────────────────────────────

/**
 * HC119 (EG-P5): moment magnitude. A block of crust cut along a vertical fault, its near half
 * lifted away so the fault plane faces us, the rupture patch `length` × `width` (km) on it to
 * scale (the sides in the ratio L : W), slip arrows `slip` (m) either side of the trace; under
 * it the magnitude on a bar against an M 6 reference. `rigidity` is μ in GPa (default 30).
 * `moment` (N·m) and `magnitude` are the page's (checked: M₀ = μLWD, Mw = (2 ÷ 3)(log₁₀ M₀ −
 * 9.1) within 0.01); `area` its L × W (km²). A "?" length or width draws no patch.
 */
export interface RuptureSpec {
  kind: 'earthLayers';
  mode: 'rupture';
  length: NumOrVar;
  width: NumOrVar;
  slip: NumOrVar;
  rigidity?: NumOrVar;
  area?: NumOrVar;
  moment?: NumOrVar;
  magnitude?: NumOrVar;
}

// ─── HC120: rockLayers ranges, and the dated cliff as a sequence header ────────

/**
 * HC120 (a) (EG-P6): index fossils' ranges as bars on an age axis (Ma, younger up) beside a
 * rock column: each fossil from its `first` appearance (older) to its `last`, the overlap of all
 * of them shaded across the column and bracketed, the window under the chart. `oldest`
 * (the youngest first appearance), `youngest` (the oldest last appearance) and `window` (Myr)
 * are the page's (checked). Ranges that never overlap draw no window and say so. 2–4 ranges.
 */
export interface RockRangesSpec {
  kind: 'rockLayers';
  ranges: { name: string; first: NumOrVar; last: NumOrVar }[];
  oldest?: NumOrVar;
  youngest?: NumOrVar;
  window?: NumOrVar;
}

/** The sedimentary rocks a cliff header draws. */
export type CliffRock = 'sandstone' | 'shale' | 'limestone' | 'siltstone' | 'conglomerate';

/**
 * HC120 (b) (EG-P6): a sequence page's `header`, the cliff to read an order of events from.
 * `beds` bottom up (oldest first). `unconformity` is how many beds lie under an erosion surface
 * (angular when `tilt`, in degrees, tilts them); the rest lie flat on it. `intrusion` is a dike
 * from the bottom up through bed `top` (default the top bed: it cuts every layer; a `top` under
 * the unconformity stops at it). `surface` erodes today's ground (the last event). The layout
 * check reads the events in the stages' text (rock names, "tilt", "erosion", "dike") and
 * compares them with the figure's order.
 */
export interface CliffHeader {
  kind: 'cliff';
  beds: CliffRock[];
  unconformity?: number;
  tilt?: number;
  intrusion?: { rock?: 'basalt' | 'granite'; top?: number };
  surface?: boolean;
}

/** Every picture of group HE4F (new kinds and options on drawn kinds). */
export type He4fSpec = TernarySpec | SilicateChainSpec | RuptureSpec | RockRangesSpec;

/** Whether a picture is one of group HE4F's (a new kind, or an option on a drawn kind). */
export function isHe4fSpec(r: { kind: string }): r is He4fSpec {
  const o = r as { kind: string; mode?: string };
  if (r.kind === 'earthLayers') return o.mode === 'rupture';
  if (r.kind === 'rockLayers') return 'ranges' in o;
  return r.kind === 'ternary' || r.kind === 'silicateChain';
}

/** Every variable id a group-HE4F picture reads (modules.test.ts). */
export function he4fSpecVars(r: He4fSpec): string[] {
  switch (r.kind) {
    case 'ternary':
      return ids(r.a, r.b, r.c, r.share, ...(r.normalized ?? []));
    case 'silicateChain':
      return ids(r.shared, r.units, r.oxygens, r.perSi, r.charge);
    case 'earthLayers':
      return ids(r.length, r.width, r.slip, r.rigidity, r.area, r.moment, r.magnitude);
    case 'rockLayers':
      return ids(...r.ranges.flatMap((x) => [x.first, x.last]), r.oldest, r.youngest, r.window);
  }
}

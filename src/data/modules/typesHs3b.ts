/**
 * Picture options for Grades 9–12, round 3, group B (H106, P18; see pictureRequestsHs.ts): the
 * math options the reviewed and added pages wait on. Kept apart from the kinds' own type files so
 * those only gain a line each. A `NumOrVar` field is a fixed number or a variable id.
 */
import type { Representation } from './types';
import type { NumOrVar } from './typesGraphs';

/**
 * H106: two more function families.
 * - power: y = a·(x − h)^(p/q) + k, p/q in lowest terms (whole p ≠ 0, q from 1 to 12): an odd q
 *   takes the real root of a negative number, an even q starts at x = h, a negative p has
 *   asymptotes x = h and y = k.
 * - logSum: y = log_b(x) + log_b(x + c) (natural logs when `b` is left out), defined where both
 *   are, x > 0 and x > −c; its asymptote is at the larger of 0 and −c.
 */
export type FamilyHs3b =
  | { family: 'power'; a?: NumOrVar; p: NumOrVar; q?: NumOrVar; h?: NumOrVar; k?: NumOrVar }
  | { family: 'logSum'; b?: NumOrVar; c: NumOrVar };

/**
 * H106: a rational function by its top's coefficients (highest power first, up to x²) over its
 * factors: the poles (x − p) and quadratics x² + jx + k with no real zeros. So a number alone on
 * top (4 ÷ ((x − 1)(x + 3))) and a quadratic top with complex zeros can be drawn; asymptotes,
 * holes and zeros as for the zeros-and-poles form; no handles.
 */
export interface RationalByTop {
  family: 'rational';
  top: NumOrVar[];
  poles: NumOrVar[];
  quadratics?: { j: NumOrVar; k: NumOrVar }[];
}

/** Its variable ids. */
export const rationalByTopVars = (f: RationalByTop): string[] =>
  [...f.top, ...f.poles, ...(f.quadratics ?? []).flatMap((q) => [q.j, q.k])].filter(
    (x): x is string => typeof x === 'string',
  );

/** The variable ids an H106 family names. */
export function familyHs3bVars(f: FamilyHs3b): string[] {
  const xs = f.family === 'power' ? [f.a, f.p, f.q, f.h, f.k] : [f.b, f.c];
  return xs.filter((x): x is string => typeof x === 'string');
}

/** H106: `functionGraph` options. */
export interface FunctionGraphHs3b {
  /**
   * The unit menu (the Units rule): the ids of the values whose shown units the axes take. Every
   * parameter is read in the formula's units (as the relations hold), the curve is converted once
   * to the shown units (y = f(fₓ·X) ÷ f_y), and the axes, formula, ticks and labels are in the
   * units shown; each axis name gets its unit, "Time t" becomes "Time t (s)". Without it the graph
   * reads shown numbers, as before, so a page with a unit menu pins its units.
   */
  unitsOf?: { x?: string; y?: string };
  /**
   * Two curves on one graph: the family is f, and g(x) = a·f(x − h) + k is drawn beside it in the
   * second colour, named `name` (default g), written "g(x) = 2f(x − 3) + 1" with its own formula
   * under it. An arrow carries f's marked point (the vertex, the start, (h, k)), or f's point at
   * `from`, to its image; `image` names the values the module works out for it (checked). No
   * crossings are marked. Left out, a is 1 and h, k are 0.
   */
  transform?: {
    a?: NumOrVar;
    h?: NumOrVar;
    k?: NumOrVar;
    name?: string;
    from?: NumOrVar;
    image?: { x?: string; y?: string };
  };
  /**
   * A candidate the algebra gives that the function can't take (outside its domain, as the
   * second root of a log equation): a crossed-out circle on the x-axis at that x, labelled
   * "x = −1 rejected", and a caption line saying why. Checked to be outside the domain.
   */
  reject?: NumOrVar;
  /**
   * Riemann rectangles: `n` strips of equal width from `from` (default 0) to `to`, each as tall
   * as the curve at its right edge (`side` 'left' or 'middle' to read elsewhere), filled under
   * the curve with the point each height is read at; past 60 they are one stepped outline. The
   * caption gives n, the width and their sum S; `sum` names the page's S (checked).
   */
  riemann?: {
    n: NumOrVar;
    to: NumOrVar;
    from?: NumOrVar;
    side?: 'right' | 'left' | 'middle';
    sum?: string;
  };
}

/**
 * H106: `lineSystem` with a parabola. A line with `square` (its x² coefficient) is the parabola
 * y = ax² + mx + b (`slope` m, `intercept` b), drawn as a curve with its vertex; shading works as
 * for a line (above for > and ≥, below for < and ≤, dashed when strict). Where the two cross is
 * solved from (a₁ − a₂)x² + (m₁ − m₂)x + (b₁ − b₂) = 0: none, one (the line touches) or two
 * points, each ringed and labelled. No handles: the values have sliders.
 */
export interface LineSystemHs3b {
  /** The crossings the module works out, left to right (checked on both curves). */
  solutions?: { x: string; y: string }[];
}

/**
 * H106: `polygon` with its apothem (with `sides`, and `side` for the side's label). The regular
 * polygon on a flat side, a line from the center to each corner (n triangles), the bottom one
 * tinted; the apothem from the center to that side's midpoint, square to it and labelled; with
 * `angle`, half the center angle θ = 180° ÷ n marked at the center; with `area` and `around`,
 * the caption works K = ½ × a × P. The side and apothem are checked in the formula's units.
 */
export interface PolygonHs3b {
  apothem?: string;
  angle?: string;
  area?: string;
}

/**
 * H106: a one-event Venn diagram (`venn` `chances`): with `one`, only circle A is drawn in the
 * rectangle, A holding P(A) and the rest P(not A) = 1 − P(A) (`shade: 'notA'` lights it, 'aOnly'
 * the circle). `b` and `both` are not drawn: pass 0 for each (checked).
 */
export interface VennChancesHs3b {
  one?: true;
}

/**
 * H106: a `table` sweep with its graph. `graph` draws, under the table, the output against the
 * swept value worked out by the module's relations with the parameters held, the rows as dots,
 * the current row lit, and with `best` the least ('min') or greatest ('max') point ringed and
 * labelled (S against r for a can of fixed volume: the least metal). `rowsFrom: 'shown'`: the
 * `rows` function gets the values in the units on the menu (not the formula's), so its round
 * steps are round in the unit shown and the page can keep its unit menu (the Units rule).
 */
export interface TableHs3b {
  graph?: { best?: 'min' | 'max' };
  rowsFrom?: 'shown';
}

/**
 * H106: `circle` with `population`, population density on a map: a town's irregular outline on
 * a grid of the radius's shown unit, `people` as dots inside it (one dot for a round number of
 * people), and the circle of radius `radius` that models its area dashed over it (the outline
 * has the circle's area exactly). The caption works A = πr² (with `area`) and D = N ÷ A (with
 * `density`); both are checked in the formula's units.
 */
export interface CircleHs3b {
  population?: { people: string; density?: string };
}

/**
 * H106: `transformation` about the figure's own center. With `about: 'center'` a rotation (or
 * dilation) is about the corners' average, the center `symmetry` turns about, so a page needs
 * no center values; the center is dotted and labelled, and point symmetry is drawn: each corner
 * joined through the center to its partner straight across, the halves ticked equal, and the
 * caption says whether every corner has one. `center` is not read.
 */
export interface TransformationHs3b {
  about?: 'center';
}

/**
 * H106: `rectangle` with `bounds`, measurement bounds. The rectangle as measured (`length` by
 * `width`), the least one the readings allow, (l − e) by (w − e), dashed inside it and the
 * greatest, (l + e) by (w + e), dashed outside, to scale about one center, the band between
 * shaded; a close-up of the corner when the band is too thin to see. `error` is e, the greatest
 * possible error; `least` and `greatest` the areas the module works out (checked).
 */
export interface RectangleHs3b {
  bounds?: { error: string; least?: string; greatest?: string };
}

/** The variable ids the H106 function-graph options name (for the module tests). */
export function functionGraphHs3bVars(r: FunctionGraphHs3b): string[] {
  const t = r.transform;
  return [
    r.unitsOf?.x,
    r.unitsOf?.y,
    t?.a,
    t?.h,
    t?.k,
    t?.from,
    t?.image?.x,
    t?.image?.y,
    r.reject,
    r.riemann?.n,
    r.riemann?.to,
    r.riemann?.from,
    r.riemann?.sum,
  ].filter((x): x is string => typeof x === 'string');
}

/**
 * H106: the F curve on `normalCurve` (`f`), in place of the normal curve: the F distribution with
 * `df1` and `df2` degrees of freedom, the statistic `stat` marked and the p-value shaded (the
 * right tail past F, or with `tails: 'two'` both tails, twice the smaller), the critical value
 * for `alpha` dashed with the rejection region tinted, and the decision in the caption. `p` names
 * the page's p-value (checked). No handles: F is worked out from the page's values.
 */
export interface NormalCurveHs3b {
  f?: {
    df1: NumOrVar;
    df2: NumOrVar;
    stat?: NumOrVar;
    alpha?: NumOrVar;
    p?: string;
    tails?: 'right' | 'two';
  };
}

/** A vector in space by its three components. */
export interface Vector3Of {
  name: string;
  x: NumOrVar;
  y: NumOrVar;
  z: NumOrVar;
}

/**
 * H106: `vectorDiagram` in space. With `space` the vectors take a third component `z` and are
 * drawn on x, y and z axes seen from above and to one side (drag the turn handle to spin the
 * view about z), each tip dropped dashed to the floor. The first two vectors span a
 * parallelogram. Options:
 * - `cross`: u × v drawn from the origin in its own colour, square to the shaded parallelogram;
 *   its components' ids (checked); `area` |u × v| (checked), `triangle` half of it, shaded;
 * - `dot`, `angle`: u · v and the angle between them (degrees), marked by an arc (checked);
 * - `w`, a third vector: the slanted box of u, v and w; `triple` u · (v × w) and `volume` its
 *   absolute value (checked);
 * - `points`: the two vectors are the points P and Q, joined by a segment with its legs Δx, Δy
 *   and Δz along the axes; `distance` |PQ| and `mid` the midpoint M (checked).
 */
export interface VectorDiagramHs3b {
  space?: {
    w?: Vector3Of;
    points?: boolean;
    cross?: { name?: string; x?: string; y?: string; z?: string };
    area?: string;
    triangle?: string;
    dot?: string;
    angle?: string;
    triple?: string;
    volume?: string;
    distance?: string;
    mid?: { x?: string; y?: string; z?: string };
  };
}

/**
 * H106: a conic on the polar grid (`polarGrid` `curve`), r = k ÷ (m − n cos θ) as a page types it
 * (`fn: 'sin'` for sin θ; `m` is 1 when left out), so e = |n| ÷ m and d = k ÷ |n|: the focus at
 * the pole, the directrix dashed (x = −d for − cos θ, x = d for + cos θ; y = ∓d with sin θ), the
 * vertices marked. With `point` on it, PF (= |r|) and PD (to the directrix) are drawn and
 * PF ÷ PD = e worked in the caption; the point is dragged along the curve (θ only). `e` and `d`
 * name the values the page works out (checked).
 */
export interface PolarConicHs3b {
  shape: 'conic';
  k: NumOrVar;
  m?: NumOrVar;
  n: NumOrVar;
  fn?: 'cos' | 'sin';
  e?: string;
  d?: string;
}

/**
 * H106: a conic with an xy term, turned (`conicGraph` `conic: 'turned'`): Ax² + Bxy + Cy² + F = 0
 * (`F` defaults to −1, the page's "= 1"), centered at the origin. The x′ and y′ axes are drawn at
 * θ, where tan 2θ = B ÷ (A − C) (θ from 0° to 90°; 45° when A = C), the angle marked; in them the
 * conic reads A′x′² + C′y′² + F = 0, with its own axes (an ellipse), asymptotes (a hyperbola) or
 * two parallel lines (B² − 4AC = 0, no x or y term). `angle`, `turned.A` and `turned.C` name the
 * values the page works out (θ, A′, C′; checked); `discriminant` B² − 4AC (checked).
 */
export interface ConicTurnedHs3b {
  conic: 'turned';
  A: NumOrVar;
  B: NumOrVar;
  C: NumOrVar;
  F?: NumOrVar;
  angle?: string;
  turned?: { A?: string; C?: string };
  discriminant?: string;
}

const idsOf = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** The variable ids the later H106 options name, beside the kinds' own (for the module tests). */
export function hs3bSpecVars(r: Representation): string[] {
  if (r.kind === 'normalCurve' && r.f) return idsOf(r.f.df1, r.f.df2, r.f.stat, r.f.alpha, r.f.p);
  if (r.kind !== 'vectorDiagram' || !r.space) return [];
  const s = r.space;
  return idsOf(
    s.w?.x,
    s.w?.y,
    s.w?.z,
    s.cross?.x,
    s.cross?.y,
    s.cross?.z,
    s.area,
    s.triangle,
    s.dot,
    s.angle,
    s.triple,
    s.volume,
    s.distance,
    s.mid?.x,
    s.mid?.y,
    s.mid?.z,
  );
}

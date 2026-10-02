/**
 * College pictures, round 2, group G (docs/RENDERINGS_HE.md): the new kind `fieldPlot` (HC21:
 * slope and vector fields, phase portraits, competition isoclines) and the `functionGraph`
 * options `tangent`, `band` (HC37) and `series` (HC38) with the families `linearOde` and
 * `taylor`. Kept apart from `types.ts` and `typesFunctionGraph.ts` so they gain a line each. A
 * `NumOrVar` field is a fixed number or a variable id.
 */
import { namesOf, parseExpr } from '@/components/module/reps/exprHe1e';

import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** The value ids an expression in x and y reads (its coordinates left out), or [] unparsed. */
export function fieldExprNames(src: string | undefined, coords: string[] = ['x', 'y']): string[] {
  if (src === undefined) return [];
  try {
    return namesOf(parseExpr(src)).filter((n) => !coords.includes(n));
  } catch {
    return [];
  }
}

// ─── HC21: fieldPlot ───────────────────────────────────────────────────────────

/** A path for a line integral, run in the direction given (a rectangle counterclockwise). */
export type FieldPath =
  | { shape: 'segment'; from: [NumOrVar, NumOrVar]; to: [NumOrVar, NumOrVar] }
  | { shape: 'rectangle'; x0?: NumOrVar; y0?: NumOrVar; width: NumOrVar; height: NumOrVar }
  | { shape: 'circle'; r: NumOrVar; cx?: NumOrVar; cy?: NumOrVar };

/**
 * HC21 `fieldPlot`: a plane field from the values (flat, every number from the page).
 * - `slope`: y′ = `dy` (an expression in x, y and value ids, the HC10 grammar: 'a*x + b*y + c',
 *   'r*y*(1 - y/K)') as short segments on a grid; the solution through `start` (RK4, solid);
 *   Euler's polyline from `start` for `euler.h` and `euler.n` steps, its points dotted.
 * - `vector`: F = ⟨`P`, `Q`⟩ as arrows scaled by |F|; `path` drawn with its direction, each side
 *   tallied (∫F · dr, labelled beside it) and the total.
 * - `phase`: x′ = Ax for A = `matrix` (a, b, c, d by rows): the direction field, the eigenvector
 *   lines dashed (real eigenvalues), six trajectories with arrows, the type named; `start` and
 *   `time` mark x(0) and x(t). With `lotka` instead: x′ = αx − βxy, y′ = −γy + δxy, closed orbits
 *   round the ringed equilibrium (γ ÷ δ, α ÷ β).
 * - `isoclines`: two competing species (N₁ across, N₂ up): N₁ + αN₂ = K₁ and N₂ + βN₁ = K₂ with
 *   their intercepts, the crossing ringed only when both N* are positive, flow arrows.
 */
export interface FieldPlotSpec {
  kind: 'fieldPlot';
  mode: 'slope' | 'vector' | 'phase' | 'isoclines';
  /** slope: y′ as an expression in x and y. */
  dy?: string;
  /** vector: F's parts as expressions in x and y. */
  P?: string;
  Q?: string;
  /** phase: A's entries a, b, c, d (x′ = ax + by, y′ = cx + dy). */
  matrix?: [NumOrVar, NumOrVar, NumOrVar, NumOrVar];
  /** phase: Lotka–Volterra predator and prey (x prey, y predators). */
  lotka?: { alpha: NumOrVar; beta: NumOrVar; gamma: NumOrVar; delta: NumOrVar };
  /** isoclines: carrying capacities and competition coefficients. */
  competition?: { K1: NumOrVar; K2: NumOrVar; alpha: NumOrVar; beta: NumOrVar };
  /** slope: (x₀, y₀); phase: x(0). Dragged when both are typed values (unless `fixed`). */
  start?: { x: NumOrVar; y: NumOrVar };
  /** slope: Euler's method from `start`; `last` is the page's yₙ, `exact` its true y there. */
  euler?: { h: NumOrVar; n: NumOrVar; last?: string; exact?: string };
  /** vector: the path. */
  path?: FieldPath;
  /** vector: the page's side integrals in the path's order (checked) and the total. */
  sides?: string[];
  work?: string;
  /** phase: the time at which x(t) is marked from `start`, and the page's x(t), y(t). */
  time?: NumOrVar;
  point?: { x?: string; y?: string };
  /** phase: the page's real eigenvalues (checked as a pair). */
  eigen?: { l1?: string; l2?: string };
  /** phase (lotka) and isoclines: the page's equilibrium (checked). */
  equilibrium?: { x?: string; y?: string };
  /** The window, when the page fixes it (otherwise chosen from the values). */
  window?: { x?: [number, number]; y?: [number, number] };
  /** Axis names (default x and y; N₁ and N₂ for isoclines). */
  axes?: { x?: string; y?: string };
  /** No handles. */
  fixed?: boolean;
}

/** The value ids a field reads to draw (not the checked ones). */
export function fieldPlotInputs(r: FieldPlotSpec): string[] {
  const p = r.path;
  return [
    ...fieldExprNames(r.dy),
    ...fieldExprNames(r.P),
    ...fieldExprNames(r.Q),
    ...ids(...(r.matrix ?? [])),
    ...ids(r.lotka?.alpha, r.lotka?.beta, r.lotka?.gamma, r.lotka?.delta),
    ...ids(r.competition?.K1, r.competition?.K2, r.competition?.alpha, r.competition?.beta),
    ...(p?.shape === 'segment' ? ids(...p.from, ...p.to) : []),
    ...(p?.shape === 'rectangle' ? ids(p.x0, p.y0, p.width, p.height) : []),
    ...(p?.shape === 'circle' ? ids(p.r, p.cx, p.cy) : []),
  ];
}

/** Every value id a field names (for the module tests). */
export function fieldPlotVars(r: FieldPlotSpec): string[] {
  return [
    ...fieldPlotInputs(r),
    ...ids(r.start?.x, r.start?.y, r.euler?.h, r.euler?.n, r.euler?.last, r.euler?.exact),
    ...ids(...(r.sides ?? []), r.work, r.time, r.point?.x, r.point?.y),
    ...ids(r.eigen?.l1, r.eigen?.l2, r.equilibrium?.x, r.equilibrium?.y),
  ];
}

// ─── HC37, HC38: functionGraph ────────────────────────────────────────────────

/**
 * HC38 families.
 * - linearOde: the solution of y″ = (c·x − ω²)·y with y(0) = a₀, y′(0) = a₁, by RK4 from 0
 *   (ω and c 0 when left out): cos and sin for c = 0, Airy's equation for ω = 0, c = 1.
 * - taylor: the polynomial Σ cₖ(x − a)ᵏ itself, from `coefficients` or from `derivatives`
 *   f(a), f′(a), f″(a), … (cₖ = f⁽ᵏ⁾(a) ÷ k!), when no true f is known.
 */
export type FamilyHe2g =
  | { family: 'linearOde'; a0: NumOrVar; a1: NumOrVar; omega?: NumOrVar; c?: NumOrVar }
  | {
      family: 'taylor';
      center?: NumOrVar;
      coefficients?: NumOrVar[];
      derivatives?: NumOrVar[];
    };

export function isFamilyHe2g(f: { family: string }): f is FamilyHe2g {
  return f.family === 'linearOde' || f.family === 'taylor';
}

export function familyHe2gVars(f: FamilyHe2g): string[] {
  return f.family === 'linearOde'
    ? ids(f.a0, f.a1, f.omega, f.c)
    : ids(f.center, ...(f.coefficients ?? []), ...(f.derivatives ?? []));
}

/** Where a Maclaurin polynomial's coefficients come from. */
export type SeriesOf = 'exp' | 'sin' | 'cos' | 'expNegSq' | 'ln1p' | 'geometric' | 'ode';

/** HC37 and HC38: `functionGraph` options. */
export interface FunctionGraphHe2g {
  /**
   * HC37: the tangent at x through (x, f(x)), its slope triangle (run 1 grid step, rise m × run);
   * `slope` and `y` are the page's f′(x) and f(x) (checked against a central difference). With
   * `at`, the linear approximation L(at) on the tangent beside f(at); `value` is the page's L.
   */
  tangent?: { x: NumOrVar; slope?: string; y?: string; at?: NumOrVar; value?: string };
  /**
   * HC37: ε–δ: the band y ± dy (ε) across and x ± dx (δ) up, the curve inside both; the window
   * zooms to them (3 bands wide) unless the page fixes one.
   */
  band?: { x: NumOrVar; y: NumOrVar; dx: NumOrVar; dy: NumOrVar };
  /**
   * HC38: a dashed polynomial over the true f: Σ cₖ(x − center)ᵏ from `coefficients` (c₀ first),
   * from `derivatives` (f(a), f′(a), …), or the Maclaurin series `of` a named function (`ode`:
   * the linearOde family's recurrence a₍ₙ₊₂₎ = (c·aₙ₋₁ − ω²aₙ) ÷ ((n + 2)(n + 1))) up to `degree`
   * or its first `terms` nonzero terms. At `x` the gap |f − P| is bracketed; `value` and `error`
   * are the page's P(x) and error. `integral` shades ∫P from `from` to `to` (`value` checked).
   */
  series?: {
    center?: NumOrVar;
    coefficients?: NumOrVar[];
    derivatives?: NumOrVar[];
    of?: SeriesOf;
    degree?: NumOrVar;
    terms?: NumOrVar;
    x?: NumOrVar;
    value?: string;
    error?: string;
    integral?: { from: NumOrVar; to: NumOrVar; value?: string };
  };
}

/** The variable ids these options name (for the module tests). */
export function functionGraphHe2gVars(r: FunctionGraphHe2g & { family: string }): string[] {
  const t = r.tangent;
  const b = r.band;
  const s = r.series;
  return [
    ...(isFamilyHe2g(r) ? familyHe2gVars(r) : []),
    ...ids(t?.x, t?.slope, t?.y, t?.at, t?.value),
    ...ids(b?.x, b?.y, b?.dx, b?.dy),
    ...ids(s?.center, ...(s?.coefficients ?? []), ...(s?.derivatives ?? [])),
    ...ids(s?.degree, s?.terms, s?.x, s?.value, s?.error),
    ...ids(s?.integral?.from, s?.integral?.to, s?.integral?.value),
  ];
}

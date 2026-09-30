/**
 * The Grades 9–12 function graph (`functionGraph`, request H01): one picture for every function
 * family, its features marked. Kept apart from `types.ts` so that file's union only lists it. A
 * `number | string` field is a fixed number or a variable id.
 */
import type { FunctionGraphHs2a } from './typesHs2a';
import type { FunctionGraphHs2g, RationalByCoefficients } from './typesHs2g';

/** A number fixed by the picture, or the id of a variable that holds it. */
export type NumOrVar = number | string;

/**
 * A function family and its parameters. Left out, a stretch `a` is 1 and a shift `h` or `k` is 0.
 * - linear: y = mx + b
 * - absolute: y = a|x − h| + k
 * - quadratic: standard ax² + bx + c, vertex a(x − h)² + k, factored a(x − p)(x − q)
 * - exponential: a · b^(x − h) + k, or with `r` (no `b`) a · e^(r(x − h)) + k
 * - logistic: K ÷ (1 + A e^(−rx)) with A = (K − start) ÷ start, so y = start at x = 0
 * - log: a · log_b(x − h) + k (natural log when `b` is left out)
 * - root: a · √(x − h) + k, or ∛ with `index: 3`
 * - polynomial: its coefficients (highest power first), or a(x − z₁)^m₁(x − z₂)^m₂ … by zeros
 * - rational: a · (x − z₁)(x − z₂)… ÷ ((x − p₁)(x − p₂)…) + k; a zero equal to a pole is a hole
 * - piecewise: pieces, each a family over an interval with open or closed ends
 * - sin, cos, tan: a · sin(b(x − h)) + k, x in radians
 * - arcsin, arccos, arctan: a · sin⁻¹(x) + k on the restricted domain
 */
export type FunctionFamily =
  | { family: 'linear'; m: NumOrVar; b: NumOrVar }
  | { family: 'absolute'; a?: NumOrVar; h?: NumOrVar; k?: NumOrVar }
  | { family: 'quadratic'; form: 'standard'; a: NumOrVar; b: NumOrVar; c: NumOrVar }
  | { family: 'quadratic'; form: 'vertex'; a?: NumOrVar; h: NumOrVar; k: NumOrVar }
  | { family: 'quadratic'; form: 'factored'; a?: NumOrVar; p: NumOrVar; q: NumOrVar }
  | { family: 'exponential'; a?: NumOrVar; b: NumOrVar; h?: NumOrVar; k?: NumOrVar }
  | { family: 'exponential'; a?: NumOrVar; r: NumOrVar; h?: NumOrVar; k?: NumOrVar }
  | { family: 'logistic'; K: NumOrVar; start: NumOrVar; r: NumOrVar }
  | { family: 'log'; a?: NumOrVar; b?: NumOrVar; h?: NumOrVar; k?: NumOrVar }
  | { family: 'root'; index: 2 | 3; a?: NumOrVar; h?: NumOrVar; k?: NumOrVar }
  | { family: 'polynomial'; coefficients: NumOrVar[] }
  // H105: `times` (a zero's multiplicity) may be a value id, a whole number 1 to 9.
  | { family: 'polynomial'; a?: NumOrVar; zeros: { x: NumOrVar; times?: NumOrVar }[] }
  | { family: 'rational'; a?: NumOrVar; zeros: NumOrVar[]; poles: NumOrVar[]; k?: NumOrVar }
  | RationalByCoefficients // H94: (px + q) ÷ (rx + s)
  | { family: 'piecewise'; pieces: Piece[] }
  | { family: 'sin' | 'cos' | 'tan'; a?: NumOrVar; b?: NumOrVar; h?: NumOrVar; k?: NumOrVar }
  // H105: `degrees` reads the angle in degrees (sin⁻¹ from −90° to 90°), not radians.
  | { family: 'arcsin' | 'arccos' | 'arctan'; a?: NumOrVar; k?: NumOrVar; degrees?: boolean };

/** One piece of a piecewise function: a family over from … to (unbounded when left out). */
export interface Piece {
  f: Exclude<FunctionFamily, { family: 'piecewise' }>;
  from?: NumOrVar;
  to?: NumOrVar;
  /** The interval's ends: '[)' (default), '(]', '[]' or '()'. */
  ends?: '[)' | '(]' | '[]' | '()';
}

/** Features a graph can mark. */
export type GraphMark =
  | 'zeros'
  | 'intercept'
  | 'vertex'
  | 'extrema'
  | 'asymptotes'
  | 'domain'
  | 'range'
  | 'midline'
  | 'amplitude'
  | 'period';

/**
 * y = f(x) on a grid with a nice window chosen from the values, its features marked and drags
 * that change the parameters (the vertex, a point on the curve, a stretch handle).
 */
export type FunctionGraphSpec = FunctionFamily & {
  kind: 'functionGraph';
  /** The function's letter (default f). */
  name?: string;
  /** The input letter (default `at.x`'s symbol, else x). */
  input?: string;
  /** A traced point (x, f(x)): x is dragged along the curve, y follows from the relation. */
  at?: { x: string; y?: string };
  /** Features to mark (asymptotes, holes and open or closed piece ends are always drawn). */
  marks?: GraphMark[];
  /**
   * Values the module works out that the picture marks, checked against the graph: the
   * vertex, the zeros (smallest first), the y-intercept, a vertical or horizontal asymptote,
   * the period and the amplitude.
   */
  shows?: {
    vertex?: { x?: string; y?: string };
    zeros?: string[];
    intercept?: string;
    va?: string;
    ha?: string;
    period?: string;
    amplitude?: string;
  };
  /** The parent function, dashed (y = x² under a(x − h)² + k). */
  parent?: boolean;
  /** The inverse, reflected across y = x (drawn dashed), on a square grid. */
  inverse?: boolean;
  /** A second function g(x); where the curves cross is marked (f(x) = g(x)). */
  other?: FunctionFamily & { name?: string };
  /** The crossing's x (and y), when the module solves f(x) = g(x). */
  crossing?: { x: string; y?: string };
  /** Fill above or below the curve (an inequality), or between the curve and the x-axis. */
  shade?: 'above' | 'below' | { from: NumOrVar; to: NumOrVar };
  /** Calculus preview: arrows approaching x from the left and the right, and the limit. */
  limit?: { x: NumOrVar };
  /** Calculus preview: the secant through x and x + h, and the tangent at x it approaches. */
  secant?: { x: NumOrVar; h: NumOrVar; slope?: string };
  /** The window's left edge only, e.g. 0 on a time axis (the rest chosen from the values). */
  xMin?: number;
  /** The window, when the page fixes it (otherwise chosen from the values). */
  window?: { x?: [number, number]; y?: [number, number] };
  /** Axis names with units, e.g. { x: 'Time t (years)', y: 'Population P' }. */
  axes?: { x?: string; y?: string };
  /** Typed values held while a handle is dragged (default every other parameter). */
  keep?: string[];
  /** No handles: a drag couldn't solve backwards to the values typed. */
  fixed?: boolean;
} & FunctionGraphHs2a &
  FunctionGraphHs2g;

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** The variable ids a family names. */
export function familyVars(f: FunctionFamily): string[] {
  switch (f.family) {
    case 'linear':
      return ids(f.m, f.b);
    case 'quadratic':
      return f.form === 'standard'
        ? ids(f.a, f.b, f.c)
        : f.form === 'vertex'
          ? ids(f.a, f.h, f.k)
          : ids(f.a, f.p, f.q);
    case 'exponential':
      return ids(f.a, 'b' in f ? f.b : f.r, f.h, f.k);
    case 'logistic':
      return ids(f.K, f.start, f.r);
    case 'polynomial':
      return 'coefficients' in f
        ? ids(...f.coefficients)
        : ids(f.a, ...f.zeros.flatMap((z) => [z.x, z.times]));
    case 'rational':
      return 'p' in f ? ids(f.p, f.q, f.r, f.s) : ids(f.a, ...f.zeros, ...f.poles, f.k);
    case 'piecewise':
      return f.pieces.flatMap((p) => [...familyVars(p.f), ...ids(p.from, p.to)]);
    case 'arcsin':
    case 'arccos':
    case 'arctan':
      return ids(f.a, f.k);
    case 'log':
      return ids(f.a, f.b, f.h, f.k);
    default:
      return ids(f.a, f.h, f.k, 'b' in f ? f.b : undefined);
  }
}

/** The variable ids a spec names (for the module tests). */
export function functionGraphVars(r: FunctionGraphSpec): string[] {
  const s = r.shows;
  return [
    ...familyVars(r),
    ...ids(r.at?.x, r.at?.y),
    ...(r.other ? familyVars(r.other) : []),
    ...ids(r.crossing?.x, r.crossing?.y),
    ...(typeof r.shade === 'object' ? ids(r.shade.from, r.shade.to) : []),
    ...ids(r.limit?.x, r.secant?.x, r.secant?.h, r.secant?.slope),
    ...ids(s?.vertex?.x, s?.vertex?.y, ...(s?.zeros ?? []), s?.intercept, s?.va, s?.ha),
    ...ids(s?.period, s?.amplitude),
  ];
}

/**
 * College pictures, round 1, group E (docs/RENDERINGS_HE.md): `functionGraph` families (HC10) and
 * regions (HC12). Kept apart from `typesFunctionGraph.ts` so that file only gains a line each. A
 * `NumOrVar` field is a fixed number or a variable id.
 */
import { namesOf, parseExpr } from '@/components/module/reps/exprHe1e';

import type { NumOrVar } from './typesGraphs';

/**
 * HC10 and HC12: more function families.
 * - expr: any expression from a small grammar (+ − × ÷ ^ and * / -, brackets, exp, ln, sin, cos,
 *   tan, sqrt, abs, the unit step u(…), π), over variable ids and the input (`of`, default x):
 *   `'x * exp(k * x)'`. Parsed, never `eval`ed. `from` starts the domain (t ≥ 0 on a time axis).
 * - hill: θ = top·Lⁿ ÷ (Kⁿ + Lⁿ) for L ≥ 0 (top 1 and n 1 when left out), K marked at half.
 * - bateman: one oral dose, C = F·D·k_a ÷ (V(k_a − k)) × (e^(−kt) − e^(−k_a t)) for t ≥ 0 (F 1 when
 *   left out; k_a = k takes the limit F·D·k·t·e^(−kt) ÷ V), t_max and C_max marked.
 * - power with a real `exponent`: y = a·(x − h)^exponent + k for x > h (a decimal exponent, z =
 *   0.25), beside the p/q form of H106.
 * - erfc: C(x) = C_s − (C_s − C₀)·erf(x ÷ w) for x ≥ 0, with w = `width` or 2√(D·t) (read in x's
 *   unit: the page works out the length 2√(Dt) when its D and t are in other units).
 * - levenspiel: F_A0 ÷ (−r_A) against conversion X, −r_A = k·C_A0ⁿ(1 − X)ⁿ (order 1 or 2); the CSTR
 *   rectangle (0 to X, height at X) and the PFR area under the curve, each labelled.
 * - equalArea: the power–angle curve P = P_max sin δ (δ in degrees, or radians with `radians`), the
 *   P_m line, A₁ (accelerating, δ₀ to δ_cr under P_m, the fault dropping P to 0) and A₂
 *   (decelerating, above P_m from δ_cr to δ_max = 180° − δ₀) shaded.
 */
export type FamilyHe1e =
  | { family: 'expr'; expr: string; of?: string; from?: NumOrVar }
  | { family: 'hill'; K: NumOrVar; n?: NumOrVar; top?: NumOrVar }
  | {
      family: 'bateman';
      F?: NumOrVar;
      D: NumOrVar;
      V: NumOrVar;
      ka: NumOrVar;
      k: NumOrVar;
    }
  | { family: 'power'; a?: NumOrVar; exponent: NumOrVar; h?: NumOrVar; k?: NumOrVar }
  | {
      family: 'erfc';
      Cs: NumOrVar;
      C0: NumOrVar;
      width?: NumOrVar;
      D?: NumOrVar;
      t?: NumOrVar;
    }
  | {
      family: 'levenspiel';
      FA0: NumOrVar;
      k: NumOrVar;
      CA0: NumOrVar;
      X: NumOrVar;
      order?: 1 | 2;
      /** The values the module works out for the two volumes, checked and labelled. */
      cstr?: string;
      pfr?: string;
    }
  | {
      family: 'equalArea';
      pm: NumOrVar;
      pmax: NumOrVar;
      dc: NumOrVar;
      /** The initial and largest angles the module works out (checked), and A₁ = A₂ if given. */
      d0?: string;
      dmax?: string;
      radians?: boolean;
    };

/** The family names this file adds (power only with `exponent`). */
const NAMES = ['expr', 'hill', 'bateman', 'erfc', 'levenspiel', 'equalArea'];

/** An HC10 or HC12 family (power only with a real `exponent`). */
export function isFamilyHe1e(f: { family: string }): f is FamilyHe1e {
  return NAMES.includes(f.family) || (f.family === 'power' && 'exponent' in f);
}

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** The names an expression reads (its variable ids and the input), or undefined if it won't parse. */
export function exprNames(expr: string): string[] | undefined {
  try {
    return namesOf(parseExpr(expr));
  } catch {
    return undefined;
  }
}

/** The variable ids a family names. */
export function familyHe1eVars(f: FamilyHe1e): string[] {
  switch (f.family) {
    case 'expr':
      return [...(exprNames(f.expr) ?? []).filter((n) => n !== (f.of ?? 'x')), ...ids(f.from)];
    case 'hill':
      return ids(f.K, f.n, f.top);
    case 'bateman':
      return ids(f.F, f.D, f.V, f.ka, f.k);
    case 'power':
      return ids(f.a, f.exponent, f.h, f.k);
    case 'erfc':
      return ids(f.Cs, f.C0, f.width, f.D, f.t);
    case 'levenspiel':
      return ids(f.FA0, f.k, f.CA0, f.X);
    case 'equalArea':
      return ids(f.pm, f.pmax, f.dc);
  }
}

/** Values a family marks that the module works out (checked, not needed to draw). */
export function familyHe1eShows(f: FamilyHe1e): string[] {
  if (f.family === 'levenspiel') return ids(f.cstr, f.pfr);
  if (f.family === 'equalArea') return ids(f.d0, f.dmax);
  return [];
}

/** HC10 and HC12: `functionGraph` options. */
export interface FunctionGraphHe1e {
  /**
   * HC10: the family is one dose, repeated every `every` (`count` doses from x = 0): the doses
   * summed into a sawtooth, each dose a thin rise, and the steady average (the area under one
   * dose ÷ every) dashed; `avg` is the module's C_ss,avg (checked).
   */
  repeat?: { every: NumOrVar; count: NumOrVar; avg?: string };
  /**
   * HC10: the values the module works out for the family's marked point: hill's K and top ÷ 2,
   * bateman's t_max and C_max (checked: t_max = ln(k_a ÷ k) ÷ (k_a − k)).
   */
  feature?: { x?: string; y?: string };
  /**
   * HC12: the region under f from `from` to `to` shaded and ∫f written (`value`, checked by
   * quadrature); with `signed` the parts above and below the axis in two fills, + and −.
   */
  area?: { from: NumOrVar; to: NumOrVar; value?: string; signed?: boolean };
  /**
   * HC12 (`shade: 'between'` in the brief): the region between f and `other`, from the crossings
   * or from `from` to `to`, shaded and its area ∫|f − g| written (`value`, checked).
   */
  between?: { from?: NumOrVar; to?: NumOrVar; value?: string };
  /** HC12: one representative slice of the region at `at`: upright (dx, default) or flat (dy). */
  strip?: { at: NumOrVar; dir?: 'x' | 'y' };
  /** HC12: a level line y = `y` (an energy E, a half-power line), its crossings ringed. */
  level?: { y: NumOrVar; label?: string };
  /**
   * HC12: a second panel under the graph, F(x) = ∫ from `from` to x of f, its point at `x`
   * traced with the tangent of slope f(x); `value` is the module's F(x) (checked). The main graph
   * shades from `from` to `x`.
   */
  accumulation?: { from: NumOrVar; x: NumOrVar; value?: string; name?: string };
}

/** The variable ids these options name (for the module tests). */
export function functionGraphHe1eVars(r: FunctionGraphHe1e & { family: string }): string[] {
  const fam = isFamilyHe1e(r) ? [...familyHe1eVars(r), ...familyHe1eShows(r)] : [];
  return [
    ...fam,
    ...ids(r.repeat?.every, r.repeat?.count, r.repeat?.avg, r.feature?.x, r.feature?.y),
    ...ids(r.area?.from, r.area?.to, r.area?.value),
    ...ids(r.between?.from, r.between?.to, r.between?.value),
    ...ids(r.strip?.at, r.level?.y),
    ...ids(r.accumulation?.from, r.accumulation?.x, r.accumulation?.value),
  ];
}

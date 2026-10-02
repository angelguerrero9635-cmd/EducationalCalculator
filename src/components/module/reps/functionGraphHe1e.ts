/**
 * HC10 and HC12 (college round 1, group E): the math behind the `functionGraph` families expr,
 * hill, bateman, a real power, erfc, levenspiel and equalArea, the repeated dose (`repeat`), and the
 * regions (area, signed, between, strip, level, accumulation). Free of React so the harness checks
 * the same numbers the picture draws. `buildCurve` hands these families here.
 */
import type { FamilyHe1e, FunctionGraphHe1e } from '@/data/modules/typesHe1e';
import type { FunctionGraphSpec, NumOrVar } from '@/data/modules/typesFunctionGraph';
import { formatNumber } from '@/engine/format';

import { compileExpr, jumpsOf, parseExpr, writeExpr, type ExprNode } from './exprHe1e';
import {
  crossings,
  exactText,
  lead,
  plusText,
  shiftText,
  type Curve,
  type Get,
  type Interval,
  type Pt,
  type Tok,
} from './functionGraphMath';

type SayField = (v: NumOrVar | undefined, fallback: number, pi?: boolean) => string;

const MINUS = '−';
const ALL: Interval = { lo: -Infinity, hi: Infinity, loIn: false, hiIn: false };
const from0 = (lo: number, loIn = true): Interval => ({ lo, hi: Infinity, loIn, hiIn: false });
const none = () => [] as number[];

// ─── Special functions and quadrature ──────────────────────────────────────────

/** erf(x) to about 1e-14: its Taylor series up to |x| = 3, the asymptotic erfc past it. */
export function erf(x: number): number {
  if (!Number.isFinite(x)) return Number.isNaN(x) ? NaN : Math.sign(x);
  const a = Math.abs(x);
  if (a <= 3) {
    let term = a;
    let sum = a;
    for (let n = 1; n < 120; n++) {
      term *= (-a * a) / n;
      const t = term / (2 * n + 1);
      sum += t;
      if (Math.abs(t) < 1e-17 * Math.abs(sum)) break;
    }
    return (Math.sign(x) * 2 * sum) / Math.sqrt(Math.PI);
  }
  // erfc(a) ≈ e^(−a²) ÷ (a√π) × (1 − 1/(2a²) + 3/(2a²)² − 15/(2a²)³ + …), a few terms past 3.
  const z = 1 / (2 * a * a);
  let s = 1;
  let t = 1;
  for (let n = 1; n < 8; n++) {
    t *= -(2 * n - 1) * z;
    s += t;
  }
  const erfc = (Math.exp(-a * a) / (a * Math.sqrt(Math.PI))) * s;
  return Math.sign(x) * (1 - erfc);
}

/** ∫ from a to b of f by Simpson's rule on n panels (a value outside the domain counts 0). */
export function integrate(f: (x: number) => number, a: number, b: number, n = 2000): number {
  if (a === b) return 0;
  const m = n % 2 ? n + 1 : n;
  const h = (b - a) / m;
  const g = (x: number) => {
    const y = f(x);
    return Number.isFinite(y) ? y : 0;
  };
  let s = g(a) + g(b);
  for (let i = 1; i < m; i++) s += (i % 2 ? 4 : 2) * g(a + i * h);
  return (s * h) / 3;
}

/** ∫ from a to b by adaptive Simpson (to a relative 1e-10), for a curve that falls fast. */
export function integrateAdaptive(f: (x: number) => number, a: number, b: number): number {
  const g = (x: number) => {
    const y = f(x);
    return Number.isFinite(y) ? y : 0;
  };
  const simpson = (l: number, r: number, fl: number, fm: number, fr: number) =>
    ((r - l) / 6) * (fl + 4 * fm + fr);
  const go = (
    l: number,
    r: number,
    fl: number,
    fm: number,
    fr: number,
    whole: number,
    eps: number,
    depth: number,
  ): number => {
    const m = (l + r) / 2;
    const [lm, rm] = [(l + m) / 2, (m + r) / 2];
    const [flm, frm] = [g(lm), g(rm)];
    const left = simpson(l, m, fl, flm, fm);
    const right = simpson(m, r, fm, frm, fr);
    if (depth <= 0 || Math.abs(left + right - whole) <= 15 * eps)
      return left + right + (left + right - whole) / 15;
    return (
      go(l, m, fl, flm, fm, left, eps / 2, depth - 1) +
      go(m, r, fm, frm, fr, right, eps / 2, depth - 1)
    );
  };
  const [fa, fm, fb] = [g(a), g((a + b) / 2), g(b)];
  const whole = simpson(a, b, fa, fm, fb);
  const scale = Math.max(Math.abs(fa), Math.abs(fm), Math.abs(fb), 1e-300) * Math.abs(b - a);
  return go(a, b, fa, fm, fb, whole, 1e-11 * scale, 40);
}

/** ∫ split at the given points (crossings, zeros) so each piece is smooth. */
export function integrateSplit(
  f: (x: number) => number,
  a: number,
  b: number,
  at: number[] = [],
): number {
  const [lo, hi, sign] = a <= b ? [a, b, 1] : [b, a, -1];
  const cuts = [lo, ...at.filter((x) => x > lo && x < hi).sort((p, q) => p - q), hi];
  let s = 0;
  for (let i = 0; i + 1 < cuts.length; i++) s += integrate(f, cuts[i]!, cuts[i + 1]!);
  return sign * s;
}

/** Where g changes sign in [lo, hi] (sampled, then bisected). */
function signChanges(g: (x: number) => number, lo: number, hi: number, n = 600): number[] {
  const out: number[] = [];
  let px = lo;
  let py = g(lo);
  for (let i = 1; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n;
    const y = g(x);
    if (Number.isFinite(py) && Number.isFinite(y) && py < 0 !== y < 0) {
      let [a, b, fa] = [px, x, py];
      for (let k = 0; k < 60; k++) {
        const m = (a + b) / 2;
        const fm = g(m);
        if (fa < 0 === fm < 0) [a, fa] = [m, fm];
        else b = m;
      }
      out.push((a + b) / 2);
    }
    [px, py] = [x, y];
  }
  return out;
}

/** A measured number for a label: 4 significant figures (7.743, 80.47, 0.8650). */
export const decNum = (x: number) => formatNumber(Number(x.toPrecision(4)));
/** A number for a label: exact when short (32/3, √3), else 4 significant figures. */
export const labelNum = (x: number) => {
  const e = exactText(x);
  if (e && e.length <= 6) return e;
  return decNum(x);
};

// ─── The families ──────────────────────────────────────────────────────────────

/** An expression's tree, or undefined when it won't parse. */
export function exprTree(src: string): ExprNode | undefined {
  try {
    return parseExpr(src);
  } catch {
    return undefined;
  }
}

/** t_max and C_max of one oral dose (k_a = k: t_max = 1 ÷ k). */
export function batemanPeak(F: number, D: number, V: number, ka: number, k: number) {
  const tmax = Math.abs(ka - k) < 1e-12 * Math.max(ka, k) ? 1 / k : Math.log(ka / k) / (ka - k);
  return { tmax, cmax: batemanAt(F, D, V, ka, k)(tmax) };
}
function batemanAt(F: number, D: number, V: number, ka: number, k: number) {
  if (Math.abs(ka - k) < 1e-12 * Math.max(ka, k))
    return (t: number) => (t < 0 ? NaN : (F * D * k * t * Math.exp(-k * t)) / V);
  const A = (F * D * ka) / (V * (ka - k));
  return (t: number) => (t < 0 ? NaN : A * (Math.exp(-k * t) - Math.exp(-ka * t)));
}

/** The two volumes of the Levenspiel plot: the CSTR rectangle and the PFR area, exactly. */
export function levenspielVolumes(FA0: number, k: number, CA0: number, X: number, order = 1) {
  const rate = k * CA0 ** order;
  const height = FA0 / (rate * (1 - X) ** order);
  const cstr = X * height;
  const pfr = order === 2 ? (FA0 / rate) * (X / (1 - X)) : (FA0 / rate) * -Math.log(1 - X);
  return { height, cstr, pfr };
}

/**
 * The equal-area criterion: δ₀ = sin⁻¹(P_m ÷ P_max), δ_max = π − δ₀, A₁ = P_m(δ_cr − δ₀) and
 * A₂ = ∫ from δ_cr to δ_max of (P_max sin δ − P_m) dδ, the areas in radians; angles in the
 * drawing's unit (degrees unless `radians`).
 */
export function equalAreaParts(pm: number, pmax: number, dc: number, radians = false) {
  const k = radians ? 1 : Math.PI / 180;
  const d0r = Math.asin(Math.min(1, Math.max(-1, pm / pmax)));
  const dmr = Math.PI - d0r;
  const dcr = dc * k;
  const A1 = pm * (dcr - d0r);
  const A2 = pmax * (Math.cos(dcr) - Math.cos(dmr)) - pm * (dmr - dcr);
  return { d0: d0r / k, dmax: dmr / k, dc, A1, A2, k };
}

/** The critical angle where A₁ = A₂: cos δ_cr = (π − 2δ₀) sin δ₀ − cos δ₀. */
export function criticalAngle(pm: number, pmax: number, radians = false) {
  const d0 = Math.asin(pm / pmax);
  const c = (Math.PI - 2 * d0) * Math.sin(d0) - Math.cos(d0);
  return Math.acos(Math.max(-1, Math.min(1, c))) / (radians ? 1 : Math.PI / 180);
}

/** Builds an HC10 or HC12 family from its values (as `buildCurve` builds the others). */
export function buildHe1e(fam: FamilyHe1e, get: Get, say: SayField, x: string): Curve {
  const base = {
    family: fam.family,
    has: [] as number[],
    holes: [] as Pt[],
    ends: [] as (Pt & { closed: boolean })[],
    vas: none as (lo: number, hi: number) => number[],
    handles: [],
    breaks: none as (lo: number, hi: number) => number[],
  };
  const side = (f: (x: number) => number) => (c: number, s: -1 | 1) => {
    const v = f(c);
    return Number.isFinite(v) ? v : f(c + s * 1e-9);
  };
  const T = (t: string, sup = false): Tok => (sup ? { t, sup: true } : { t });
  const unknown = (...ss: string[]) => ss.some((s) => s === '?');
  switch (fam.family) {
    case 'expr': {
      const tree = exprTree(fam.expr);
      const input = fam.of ?? 'x';
      if (!tree) return { ...base, f: () => NaN, side: () => NaN, domain: [], text: [T('?')] };
      const start = fam.from === undefined ? -Infinity : get(fam.from, 0);
      const raw = compileExpr(tree, input, (n) => get(n, NaN));
      const f = (t: number) => (t < start ? NaN : raw(t));
      // Jumps: the unit steps' switch points, a bottom's zeros, tan's asymptotes.
      const gs = jumpsOf(tree).map((j) => {
        if (j.t === 'call' && j.fn === 'tan') {
          const arg = compileExpr(j.a, input, (n) => get(n, NaN));
          return (t: number) => Math.cos(arg(t));
        }
        return compileExpr(j, input, (n) => get(n, NaN));
      });
      return {
        ...base,
        f,
        side: side(f),
        breaks: (lo, hi) => gs.flatMap((g) => signChanges(g, lo, hi)),
        // Zeros where f changes sign and is 0 there (not a jump across the axis).
        zeros: (lo, hi) => {
          const a = Math.max(lo, start);
          if (!(a < hi)) return [];
          const cuts = [a, ...gs.flatMap((g) => signChanges(g, a, hi)), hi].sort((p, q) => p - q);
          const out: { x: number }[] = [];
          for (let i = 0; i + 1 < cuts.length; i++) {
            const e = 1e-9 * Math.max(1, Math.abs(cuts[i]!), Math.abs(cuts[i + 1]!));
            for (const z of signChanges(f, cuts[i]! + e, cuts[i + 1]! - e)) {
              const d = Math.abs(f(z + 1e-6) - f(z - 1e-6)) / 2e-6;
              if (Math.abs(f(z)) <= 1e-7 * Math.max(1, Number.isFinite(d) ? d : 1))
                out.push({ x: z });
            }
          }
          return out;
        },
        domain: [Number.isFinite(start) ? from0(start) : ALL],
        text: writeExpr(tree, input, x, (n) => say(n, 0)),
      };
    }
    case 'hill': {
      const [K, n, top] = [get(fam.K, 1), get(fam.n, 1), get(fam.top, 1)];
      const f = (L: number) => (L < 0 ? NaN : (top * L ** n) / (K ** n + L ** n));
      const [Ks, ns, ts] = [say(fam.K, 1), say(fam.n, 1), say(fam.top, 1)];
      const pow = ns === '1' ? [] : [T(ns, true)];
      return {
        ...base,
        f,
        side: side(f),
        has: [top],
        key: { x: K, y: f(K), what: 'point' },
        zeros: (lo, hi) => (lo <= 0 && hi >= 0 ? [{ x: 0, text: '0' }] : []),
        domain: [from0(0)],
        range: [{ lo: 0, hi: top, loIn: true, hiIn: false }],
        text: [
          {
            frac: [
              [T(`${lead(top, ts)}${x}`), ...pow],
              [T(Ks), ...pow, T(` + ${x}`), ...pow],
            ],
          },
        ],
      };
    }
    case 'bateman': {
      const [F, D, V, ka, k] = [
        get(fam.F, 1),
        get(fam.D, 1),
        get(fam.V, 1),
        get(fam.ka, 1),
        get(fam.k, 0.1),
      ];
      const f = batemanAt(F, D, V, ka, k);
      const { tmax, cmax } = batemanPeak(F, D, V, ka, k);
      const [Fs, Ds, Vs, kas, ks] = [
        say(fam.F, 1),
        say(fam.D, 1),
        say(fam.V, 1),
        say(fam.ka, 1),
        say(fam.k, 0.1),
      ];
      const same = Math.abs(ka - k) < 1e-12 * Math.max(ka, k);
      const coef = unknown(Fs, Ds, Vs, kas, ks)
        ? '?'
        : decNum(same ? (F * D * k) / V : (F * D * ka) / (V * (ka - k)));
      const ex = (r: number, rs: string) => `${MINUS}${lead(r, rs)}${x}`;
      return {
        ...base,
        f,
        side: side(f),
        has: [0],
        key: { x: tmax, y: cmax, what: 'point' },
        zeros: (lo, hi) => (lo <= 0 && hi >= 0 ? [{ x: 0, text: '0' }] : []),
        domain: [from0(0)],
        text: same
          ? [T(`${coef}${x}e`), T(ex(k, ks), true)]
          : [T(`${coef}(e`), T(ex(k, ks), true), T(` ${MINUS} e`), T(ex(ka, kas), true), T(')')],
      };
    }
    case 'power': {
      const [a, e, h, k] = [get(fam.a, 1), get(fam.exponent, 1), get(fam.h, 0), get(fam.k, 0)];
      const f = (t: number) => {
        const u = t - h;
        if (u < 0 || (u === 0 && e <= 0)) return NaN;
        return a * u ** e + k;
      };
      const inner = shiftText(x, h, say(fam.h, 0));
      return {
        ...base,
        f,
        side: side(f),
        has: e < 0 ? [k] : [],
        vas: (lo, hi) => (e < 0 && h >= lo && h <= hi ? [h] : []),
        key: e > 0 ? { x: h, y: k, what: 'start' } : undefined,
        zeros: () => {
          if (a === 0) return [];
          const w = -k / a;
          if (w === 0) return e > 0 ? [{ x: h }] : [];
          return w > 0 ? [{ x: h + w ** (1 / e) }] : [];
        },
        domain: [from0(h, e > 0)],
        text: [
          T(`${lead(a, say(fam.a, 1))}${inner === x ? x : `(${inner})`}`),
          T(say(fam.exponent, 1), true),
          T(plusText(k, say(fam.k, 0))),
        ],
      };
    }
    case 'erfc': {
      const [Cs, C0] = [get(fam.Cs, 1), get(fam.C0, 0)];
      const w =
        fam.width !== undefined ? get(fam.width, 1) : 2 * Math.sqrt(get(fam.D, 1) * get(fam.t, 1));
      const f = (X: number) => (X < 0 ? NaN : Cs - (Cs - C0) * erf(X / w));
      const [Css, C0s] = [say(fam.Cs, 1), say(fam.C0, 0)];
      const ws =
        fam.width !== undefined
          ? say(fam.width, 1)
          : unknown(say(fam.D, 1), say(fam.t, 1))
            ? '?'
            : decNum(w);
      const diff = unknown(Css, C0s) ? '?' : decNum(Cs - C0);
      const diffText = diff.startsWith(MINUS) ? ` + ${diff.slice(1)}` : ` ${MINUS} ${diff}`;
      return {
        ...base,
        f,
        side: side(f),
        has: [C0],
        key: { x: 0, y: Cs, what: 'point' },
        domain: [from0(0)],
        text: [T(`${Css}${diffText} erf(${x}/${ws})`)],
      };
    }
    case 'levenspiel': {
      const n = fam.order ?? 1;
      const [FA0, k, CA0, X] = [get(fam.FA0, 1), get(fam.k, 1), get(fam.CA0, 1), get(fam.X, 0.5)];
      const rate = k * CA0 ** n;
      const f = (t: number) => (t < 0 || t >= 1 ? NaN : FA0 / (rate * (1 - t) ** n));
      const rs = unknown(say(fam.k, 1), say(fam.CA0, 1)) ? '?' : decNum(rate);
      return {
        ...base,
        f,
        side: side(f),
        vas: (lo, hi) => (lo <= 1 && hi >= 1 ? [1] : []),
        breaks: (lo, hi) => (lo < 1 && hi > 1 ? [1] : []),
        key: { x: X, y: f(X), what: 'point' },
        domain: [{ lo: 0, hi: 1, loIn: true, hiIn: false }],
        text: [
          {
            frac: [
              [T(say(fam.FA0, 1))],
              [T(`${rs}(1 ${MINUS} ${x})`), ...(n === 2 ? [T('2', true)] : [])],
            ],
          },
        ],
      };
    }
    case 'equalArea': {
      const pmax = get(fam.pmax, 2);
      const k = fam.radians ? 1 : Math.PI / 180;
      const end = Math.PI / k;
      const f = (d: number) => (d < 0 || d > end ? NaN : pmax * Math.sin(d * k));
      return {
        ...base,
        f,
        side: side(f),
        zeros: (lo, hi) => [0, end].filter((z) => z >= lo && z <= hi).map((z) => ({ x: z })),
        key: { x: end / 2, y: pmax, what: 'point' },
        domain: [{ lo: 0, hi: end, loIn: true, hiIn: true }],
        text: [T(`${lead(pmax, say(fam.pmax, 2))}sin ${x}`)],
      };
    }
  }
}

// ─── The repeated dose ─────────────────────────────────────────────────────────

type BuildCurve = (f: FunctionGraphSpec, x: string) => Curve;

/** The doses' times and the dose count, from the spec (none without `repeat`). */
export function dosesOf(spec: FunctionGraphHe1e, get: Get) {
  if (!spec.repeat) return undefined;
  const every = get(spec.repeat.every, 1);
  const count = Math.max(1, Math.min(60, Math.round(get(spec.repeat.count, 1))));
  if (!(every > 0)) return undefined;
  return { every, count, times: Array.from({ length: count }, (_, i) => i * every) };
}

/**
 * HC10: the family as one dose, repeated: Σ f(t − nτ) over the doses given by t (t ≥ 0), with
 * a break at each dose. Without `repeat` the curve as it is.
 */
export function repeatCurve(
  spec: FunctionGraphSpec,
  curve: Curve,
  get: Get,
  say: SayField,
  x: string,
  build: BuildCurve,
): Curve {
  const d = dosesOf(spec, get);
  if (!d) return curve;
  const one = curve.f;
  const f = (t: number) => {
    if (t < 0) return NaN;
    let s = 0;
    for (const t0 of d.times) if (t >= t0) s += one(t - t0);
    return s;
  };
  // Written Σ f(t − nτ): the family with its input moved, "Σₙ 10e^(−0.1(t − 8n))".
  const es = say(spec.repeat!.every, 1);
  const moved = build(spec, `(${x} ${MINUS} ${es === '1' ? '' : es}n)`);
  const out: Curve = {
    ...curve,
    f,
    side: (c, s) => (s < 0 ? f(c - 1e-9) : f(c)),
    breaks: (lo, hi) => d.times.filter((t0) => t0 > lo && t0 < hi),
    has: [],
    key: undefined,
    zeros: undefined,
    domain: [from0(0)],
    text: [{ t: 'Σ' }, { t: 'n', sub: true }, { t: ' ' }, ...moved.text],
  };
  ONE.set(out, one);
  return out;
}

const ONE = new WeakMap<Curve, (t: number) => number>();
/** The single dose behind a repeated curve (undefined for any other curve). */
export const oneDose = (c: Curve) => ONE.get(c);

/**
 * The repeated dose's numbers: each trough just before a dose, the steady trough Σ f(nτ) for n ≥ 1,
 * and the steady average (∫ of one dose to its end) ÷ τ.
 */
export function doseNumbers(one: (t: number) => number, every: number, count: number) {
  const troughs: number[] = [];
  for (let n = 1; n <= count; n++) {
    let s = 0;
    for (let j = 0; j < n; j++) s += one(n * every - j * every);
    troughs.push(s);
  }
  let steady = 0;
  for (let n = 1; n < 5000; n++) {
    const y = one(n * every);
    if (!Number.isFinite(y)) break;
    steady += y;
    if (Math.abs(y) < 1e-14 * Math.max(1, Math.abs(steady))) break;
  }
  // The area under one dose, out to where it has died away (doubling until it changes < 1e-10).
  let T = every * 4;
  let area = integrateAdaptive(one, 0, T);
  for (let i = 0; i < 12; i++) {
    const next = area + integrateAdaptive(one, T, 2 * T);
    T *= 2;
    const done = Math.abs(next - area) < 1e-10 * Math.max(1, Math.abs(next));
    area = next;
    if (done) break;
  }
  return { troughs, steady, avg: area / every };
}

// ─── Regions ────────────────────────────────────────────────────────────────────

/** A curve at height y (for a level line's crossings). */
const flat = (c: Curve, y: number): Curve => ({ ...c, f: () => y, breaks: none, zeros: undefined });

/** The region between f and g: from `from` to `to`, or between the outermost crossings. */
export function betweenRange(
  spec: FunctionGraphHe1e,
  f: Curve,
  g: Curve | undefined,
  get: Get,
): [number, number] | undefined {
  const b = spec.between;
  if (!b || !g) return undefined;
  if (b.from !== undefined && b.to !== undefined) {
    const r = [get(b.from, 0), get(b.to, 1)].sort((p, q) => p - q);
    return [r[0]!, r[1]!];
  }
  const cs = crossings(f, g, -60, 60).map((p) => p.x);
  if (cs.length < 2) return undefined;
  const lo = b.from !== undefined ? get(b.from, 0) : cs[0]!;
  const hi = b.to !== undefined ? get(b.to, 1) : cs[cs.length - 1]!;
  return lo < hi ? [lo, hi] : [hi, lo];
}

export interface RegionNumbers {
  /** The shaded region: from, to and its edges (lower and upper at x). */
  from: number;
  to: number;
  lower: (x: number) => number;
  upper: (x: number) => number;
  /** ∫f (area) or ∫|f − g| (between). */
  value: number;
  /** The signed parts: above and below the axis (area only). */
  plus?: number;
  minus?: number;
  /** Where the edges cross or f crosses the axis inside (the fills split there). */
  cuts: number[];
}

/** The numbers of `area` or `between` (between wins when both are set). */
export function regionOf(
  spec: FunctionGraphHe1e,
  f: Curve,
  g: Curve | undefined,
  get: Get,
): RegionNumbers | undefined {
  const br = betweenRange(spec, f, g, get);
  if (br && g) {
    const d = (x: number) => f.f(x) - g.f(x);
    const cuts = crossings(f, g, br[0], br[1]).map((p) => p.x);
    const value = integrateSplit((x) => Math.abs(d(x)), br[0], br[1], cuts);
    return {
      from: br[0],
      to: br[1],
      lower: (x) => Math.min(f.f(x), g.f(x)),
      upper: (x) => Math.max(f.f(x), g.f(x)),
      value,
      cuts,
    };
  }
  const acc = spec.accumulation;
  const a = spec.area ?? (acc ? { from: acc.from, to: acc.x } : undefined);
  if (!a) return undefined;
  const [lo, hi] = [get(a.from, 0), get(a.to, 1)];
  const cuts = signChanges(f.f, Math.min(lo, hi), Math.max(lo, hi));
  const value = integrateSplit(f.f, lo, hi, cuts);
  const [l, h] = lo <= hi ? [lo, hi] : [hi, lo];
  const plus = integrateSplit((x) => Math.max(0, f.f(x)), l, h, cuts);
  const minus = integrateSplit((x) => Math.min(0, f.f(x)), l, h, cuts);
  return {
    from: l,
    to: h,
    lower: (x) => Math.min(0, f.f(x)),
    upper: (x) => Math.max(0, f.f(x)),
    value,
    plus,
    minus,
    cuts,
  };
}

/** The strip at `at`: upright from the lower edge to the upper, or flat across the region. */
export function stripOf(
  spec: FunctionGraphHe1e,
  region: RegionNumbers | undefined,
  get: Get,
): { dir: 'x' | 'y'; at: number; lo: number; hi: number } | undefined {
  if (!spec.strip || !region) return undefined;
  const at = get(spec.strip.at, 0);
  if ((spec.strip.dir ?? 'x') === 'x') {
    if (at < region.from || at > region.to) return undefined;
    return { dir: 'x', at, lo: region.lower(at), hi: region.upper(at) };
  }
  // Flat: the x values at height `at` inside the region, from the first to the last.
  const xs: number[] = [];
  for (let i = 0; i <= 2000; i++) {
    const x = region.from + ((region.to - region.from) * i) / 2000;
    if (region.lower(x) <= at && at <= region.upper(x)) xs.push(x);
  }
  if (!xs.length) return undefined;
  return { dir: 'y', at, lo: xs[0]!, hi: xs[xs.length - 1]! };
}

/** Where f meets the level y in [lo, hi]. */
export function levelCrossings(c: Curve, y: number, lo: number, hi: number): Pt[] {
  return crossings(c, flat(c, y), lo, hi).map((p) => ({ x: p.x, y }));
}

/** F(x) = ∫ from a to x of f, by quadrature split at f's breaks. */
export function accumulate(c: Curve, a: number, x: number): number {
  const [lo, hi] = a <= x ? [a, x] : [x, a];
  return integrateSplit(c.f, a, x, c.breaks(lo, hi));
}

// ─── The window ────────────────────────────────────────────────────────────────

/** The x values the families and regions need in view. */
export function he1eXs(spec: FunctionGraphSpec, main: Curve, other: Curve | undefined, get: Get) {
  const xs: number[] = [];
  switch (spec.family) {
    case 'hill':
      xs.push(0, 3 * get(spec.K, 1));
      break;
    case 'bateman':
      if (main.key && !spec.repeat) xs.push(0, 7 * main.key.x);
      break;
    case 'erfc': {
      const w =
        spec.width !== undefined
          ? get(spec.width, 1)
          : 2 * Math.sqrt(get(spec.D, 1) * get(spec.t, 1));
      xs.push(0, 2.6 * w);
      break;
    }
    case 'levenspiel':
      xs.push(0, 1);
      break;
    case 'equalArea':
      xs.push(0, spec.radians ? Math.PI : 180);
      break;
  }
  const d = dosesOf(spec, get);
  if (d) xs.push(0, d.count * d.every + d.every * 0.9);
  const r = regionOf(spec, main, other, get);
  if (r) xs.push(r.from, r.to);
  if (spec.strip) xs.push(get(spec.strip.at, 0));
  for (const id of spec.level?.at ?? []) xs.push(get(id, 0));
  if (spec.accumulation) xs.push(get(spec.accumulation.from, 0), get(spec.accumulation.x, 0));
  return xs.filter(Number.isFinite);
}

/** The y values the families and regions need in view. */
export function he1eYs(spec: FunctionGraphSpec, main: Curve, other: Curve | undefined, get: Get) {
  const ys: number[] = [];
  switch (spec.family) {
    case 'hill':
      ys.push(get(spec.top, 1) * 1.08);
      break;
    case 'bateman':
      if (main.key && !spec.repeat) ys.push(main.key.y * 1.15);
      break;
    case 'erfc':
      ys.push(get(spec.Cs, 1), get(spec.C0, 0));
      break;
    case 'levenspiel':
      if (main.key) ys.push(main.f(0), main.key.y * 1.6);
      break;
    case 'equalArea':
      ys.push(get(spec.pmax, 2) * 1.12, get(spec.pm, 1));
      break;
  }
  const d = dosesOf(spec, get);
  if (d) for (const t0 of d.times) ys.push(main.f(t0) * 1.08);
  if (spec.level) {
    ys.push(get(spec.level.y, 0));
    // Between the named crossings, the curve's floor (a well's bottom) in view too.
    const at = (spec.level.at ?? []).map((id) => get(id, 0)).sort((p, q) => p - q);
    if (at.length >= 2)
      for (let i = 0; i <= 60; i++)
        ys.push(main.f(at[0]! + ((at[at.length - 1]! - at[0]!) * i) / 60));
  }
  const r = regionOf(spec, main, other, get);
  if (r) for (const x of [r.from, r.to, (r.from + r.to) / 2]) ys.push(r.lower(x), r.upper(x));
  return ys.filter((v) => Number.isFinite(v) && Math.abs(v) < 1e6);
}

/** The height the accumulation panel takes under the graph (0 without it). */
export const he1ePanel = (spec: FunctionGraphHe1e, w: number) =>
  spec.accumulation ? Math.round(Math.min(220, w * 0.44)) : 0;

// ─── The caption ───────────────────────────────────────────────────────────────

/** The caption's lines for the families and options (when every value is typed). */
export function he1eCaption(
  spec: FunctionGraphSpec,
  main: Curve,
  other: Curve | undefined,
  get: Get,
  xName: string,
  fName: string,
  gName: string,
): string[] {
  const out: string[] = [];
  const n = labelNum;
  const m = decNum;
  switch (spec.family) {
    case 'hill': {
      const K = get(spec.K, 1);
      out.push(
        `Half bound at ${xName} = K = ${m(K)}: ${fName}(K) = ${m(main.f(K))}, half of ${m(get(spec.top, 1))}`,
      );
      break;
    }
    case 'bateman':
      if (main.key && !spec.repeat)
        out.push(
          `Peak at t_max = ln(k_a ÷ k) ÷ (k_a − k) = ${m(main.key.x)}, C_max = ${m(main.key.y)}`,
        );
      break;
    case 'erfc':
      out.push(
        `C = ${m(get(spec.Cs, 1))} at the surface, falling toward C₀ = ${m(get(spec.C0, 0))} deep inside`,
      );
      break;
    case 'levenspiel': {
      const v = levenspielVolumes(
        get(spec.FA0, 1),
        get(spec.k, 1),
        get(spec.CA0, 1),
        get(spec.X, 0.5),
        spec.order ?? 1,
      );
      out.push(
        `CSTR: the rectangle 0 to X under the height at X, V = ${m(v.cstr)}; PFR: the area under the curve, V = ${m(v.pfr)}`,
      );
      break;
    }
    case 'equalArea': {
      const e = equalAreaParts(get(spec.pm, 1), get(spec.pmax, 2), get(spec.dc, 90), spec.radians);
      const u = spec.radians ? '' : '°';
      out.push(
        `δ₀ = ${m(e.d0)}${u}, δ_cr = ${m(e.dc)}${u}, δ_max = ${m(e.dmax)}${u}; A₁ = ${m(e.A1)}, A₂ = ${m(e.A2)}${Math.abs(e.A1 - e.A2) <= 0.01 * Math.max(Math.abs(e.A1), 1e-9) ? ': equal, so δ_cr is the critical angle' : ''}`,
      );
      break;
    }
  }
  const d = dosesOf(spec, get);
  const one = oneDose(main);
  if (d && one) {
    const q = doseNumbers(one, d.every, d.count);
    out.push(
      `One dose every ${m(d.every)}, ${d.count} doses, each adding a copy of the first curve: the troughs rise toward ${m(q.steady)}, the steady average ${m(q.avg)} is dashed`,
    );
  }
  const r = regionOf(spec, main, other, get);
  const from = (a: number, b: number) => `from ${n(a)} to ${n(b)}`;
  if (r && spec.between && other)
    out.push(
      `Shaded between ${fName} and ${gName} ${from(r.from, r.to)}: area ∫|${fName} − ${gName}| d${xName} = ${n(r.value)}`,
    );
  else if (r && spec.area) {
    out.push(
      `Shaded: ∫ ${from(get(spec.area.from, 0), get(spec.area.to, 1))} of ${fName}(${xName}) d${xName} = ${n(r.value)}`,
    );
    if (spec.area.signed)
      out.push(
        `Above the axis + ${n(r.plus ?? 0)}, below ${MINUS} ${n(-(r.minus ?? 0))}: the integral is their sum`,
      );
  }
  const s = stripOf(spec, r, get);
  if (s)
    out.push(
      s.dir === 'x'
        ? `One slice at ${xName} = ${n(s.at)}: height ${n(s.hi - s.lo)}, width d${xName}`
        : `One slice at y = ${n(s.at)}: length ${n(s.hi - s.lo)}, height dy`,
    );
  if (spec.level) {
    const y = get(spec.level.y, 0);
    const cs = levelCrossings(main, y, -60, 60).slice(0, 4);
    const name = spec.level.label ? `${spec.level.label} = ${n(y)}` : `y = ${n(y)}`;
    out.push(
      cs.length
        ? `Level ${name} meets the curve at ${cs.map((p) => `${xName} = ${n(p.x)}`).join(', ')}`
        : `Level ${name} never meets the curve`,
    );
  }
  if (spec.accumulation) {
    const a = get(spec.accumulation.from, 0);
    const X = get(spec.accumulation.x, 0);
    const F = spec.accumulation.name ?? 'F';
    out.push(
      `${F}(${xName}) = ∫ from ${n(a)} to ${xName} of ${fName}: ${F}(${n(X)}) = ${n(accumulate(main, a, X))}, and its slope there is ${fName}(${n(X)}) = ${n(main.f(X))}`,
    );
  }
  return out;
}

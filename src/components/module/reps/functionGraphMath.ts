/**
 * The math behind `functionGraph` (FunctionGraph.tsx), kept free of React so the harness checks
 * the same formulas the picture draws: each family's f(x), its asymptotes, holes and piece ends,
 * its zeros and extrema (exact where the algebra gives them: fractions, surds, multiples of π),
 * the formula as it is written, the handles a drag can move, and the window with nice ticks.
 */
import type {
  FunctionFamily,
  FunctionGraphSpec,
  NumOrVar,
  Piece,
} from '@/data/modules/typesFunctionGraph';
import { formatNumber } from '@/engine/format';

import { toFraction } from './exact';
import { buildHs3b } from './functionGraphFamiliesHs3b';
import { rationalByTopCurve } from './functionGraphRationalHs3b';
import { ratioCurve, reshape } from './functionGraphHs2g';

// ─── Exact numbers ─────────────────────────────────────────────────────────────

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const MINUS = '−';
const signed = (neg: boolean, s: string) => (neg ? `${MINUS}${s}` : s);

/** A decimal that ends within 4 places (1.25, 0.05) is exact as written. */
const shortDecimal = (x: number) =>
  Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-7 * Math.max(1, Math.abs(x));

/** A whole number, a short decimal or a fraction with a bottom up to 12: "3", "−2/3", "0.05". */
export function fracText(x: number): string | undefined {
  if (!Number.isFinite(x)) return undefined;
  if (Math.abs(x) < 1e-12) return '0';
  if (shortDecimal(x)) return formatNumber(Math.round(x * 1e4) / 1e4);
  const f = toFraction(x, 12);
  if (!f) return undefined;
  return f[1] === 1 ? formatNumber(f[0]) : signed(f[0] < 0, `${Math.abs(f[0])}/${f[1]}`);
}

/** n = s² × m with m square-free. */
function squarePart(n: number): [number, number] {
  let s = 1;
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    while (m % (p * p) === 0) {
      m /= p * p;
      s *= p;
    }
  }
  return [s, m];
}

/** A square root times a fraction, "3√2", "√6/2", "−2√3/3", when x² is a fraction. */
export function surdText(x: number): string | undefined {
  const f = toFraction(x * x, 100);
  if (!f || f[0] <= 0 || f[0] * f[1] > 1e8) return undefined;
  const [s, m] = squarePart(f[0] * f[1]);
  // A radicand past 1,000 is a decimal that only looks exact (64.3045 → 2√2283589/47, a value
  // converted to other units): write it as a decimal.
  if (m === 1 || m > 1000) return undefined;
  const g = gcd(s, f[1]);
  const [top, bottom] = [s / g, f[1] / g];
  return signed(x < 0, `${top === 1 ? '' : top}√${m}${bottom === 1 ? '' : `/${bottom}`}`);
}

/** A multiple of π with a bottom up to 12: "π/6", "−5π/6", "2π". */
export function piText(x: number): string | undefined {
  const f = toFraction(x / Math.PI, 12);
  if (!f || f[0] === 0) return undefined;
  const top = Math.abs(f[0]);
  return signed(f[0] < 0, `${top === 1 ? '' : top}π${f[1] === 1 ? '' : `/${f[1]}`}`);
}

/** A value written exactly (a fraction, a surd or a multiple of π), or undefined. */
export function exactText(x: number, pi = false): string | undefined {
  if (!Number.isFinite(x)) return undefined;
  if (pi) {
    const p = Math.abs(x) < 1e-12 ? '0' : piText(x);
    if (p) return p;
  }
  return fracText(x) ?? surdText(x) ?? (pi ? undefined : piText(x));
}

/** A number in a formula or label: exact when it can be, else its 4-place decimal. */
export const numText = (x: number, pi = false) => exactText(x, pi) ?? formatNumber(x);

/**
 * The real roots of ax² + bx + c = 0 written exactly, "(2 ± √6)/2" as two texts, when the
 * coefficients are fractions; each with its value.
 */
export function quadraticRoots(a: number, b: number, c: number): { x: number; text?: string }[] {
  if (a === 0) return b === 0 ? [] : [{ x: -c / b, text: fracText(-c / b) }];
  const D = b * b - 4 * a * c;
  if (D < -1e-12) return [];
  if (Math.abs(D) <= 1e-12) return [{ x: -b / (2 * a), text: fracText(-b / (2 * a)) }];
  const r = Math.sqrt(D);
  const xs = [(-b - r) / (2 * a), (-b + r) / (2 * a)].sort((p, q) => p - q);
  const [fa, fb, fc] = [a, b, c].map((v) => toFraction(v, 100));
  const texts = (() => {
    if (!fa || !fb || !fc) return undefined;
    // D as a fraction P/Q; √D = s√m ÷ Q.
    const fd = toFraction(D, 100 * 100 * 100);
    if (!fd) return undefined;
    const [P, Q] = fd;
    if (P * Q > 1e10) return undefined;
    const [s, m] = squarePart(P * Q);
    if (m === 1) return xs.map((x) => fracText(x));
    // x = u ± v√m with u = −b/(2a), v = s/(2aQ): over a common bottom d, (A ± B√m)/d.
    const u = toFraction(-b / (2 * a), 1e6);
    const v = toFraction(Math.abs(s / (2 * a * Q)), 1e6);
    if (!u || !v) return undefined;
    const d = (u[1] * v[1]) / gcd(u[1], v[1]);
    const A = (u[0] * d) / u[1];
    const B = (v[0] * d) / v[1];
    const g = gcd(gcd(Math.abs(A), B), d);
    const [A1, B1, d1] = [A / g, B / g, d / g];
    const root = `${B1 === 1 ? '' : B1}√${m}`;
    return [MINUS, '+'].map((op) => {
      const top =
        A1 === 0
          ? signed(op === MINUS, root)
          : `${signed(A1 < 0, String(Math.abs(A1)))} ${op} ${root}`;
      return d1 === 1 ? top : A1 === 0 ? `${top}/${d1}` : `(${top})/${d1}`;
    });
  })();
  return xs.map((x, i) => ({ x, text: texts?.[i] }));
}

// ─── Polynomials ─────────────────────────────────────────────────────────────

/** p(x) for coefficients highest power first. */
export const polyAt = (cs: number[], x: number) => cs.reduce((acc, c) => acc * x + c, 0);

/** Divides by (x − r): the quotient's coefficients and the remainder. */
function synthetic(cs: number[], r: number): [number[], number] {
  const out: number[] = [];
  let acc = 0;
  for (const c of cs) {
    acc = acc * r + c;
    out.push(acc);
  }
  const rem = out.pop()!;
  return [out, rem];
}

/** Coefficients of a(x − z₁)^m₁ … multiplied out. */
export function polyFromZeros(a: number, zeros: { x: number; times: number }[]): number[] {
  let cs = [a];
  for (const z of zeros)
    for (let i = 0; i < z.times; i++) {
      const next = new Array<number>(cs.length + 1).fill(0);
      cs.forEach((c, j) => {
        next[j]! += c;
        next[j + 1]! -= c * z.x;
      });
      cs = next;
    }
  return cs;
}

/** Numeric roots in [lo, hi]: sign changes, then touching roots at the critical points. */
function numericZeros(f: (x: number) => number, lo: number, hi: number, n = 1600): number[] {
  const out: number[] = [];
  const h = (hi - lo) / n;
  // The typical size of f here (the median), so a curve that climbs far doesn't swamp it.
  const sizes = Array.from({ length: 21 }, (_, i) => Math.abs(f(lo + ((hi - lo) * i) / 20)))
    .filter(Number.isFinite)
    .sort((p, q) => p - q);
  const scale = Math.max(1, sizes[Math.floor(sizes.length / 2)] ?? 1);
  let px = lo;
  let py = f(lo);
  if (Math.abs(py) < 1e-12 * scale) out.push(lo);
  for (let i = 1; i <= n; i++) {
    const x = lo + i * h;
    const y = f(x);
    if (Number.isFinite(py) && Number.isFinite(y)) {
      if (Math.abs(y) < 1e-12 * scale) out.push(x);
      else if (py * y < 0 && Math.abs(py) >= 1e-12 * scale) {
        const r = bisect(f, px, x);
        if (Math.abs(f(r)) < 1e-7 * scale) out.push(r);
      }
    }
    px = x;
    py = y;
  }
  // Touching roots: an extremum where f is 0.
  for (const c of criticalPoints(f, lo, hi, n))
    if (Math.abs(f(c)) < 1e-9 * scale && !out.some((r) => Math.abs(r - c) < 1e-6)) out.push(c);
  return dedupe(out.sort((a, b) => a - b));
}

const dedupe = (xs: number[], tol = 1e-7) =>
  xs.filter((x, i) => i === 0 || Math.abs(x - xs[i - 1]!) > tol * Math.max(1, Math.abs(x)));

function bisect(g: (x: number) => number, a: number, b: number): number {
  let ga = g(a);
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2;
    const gm = g(m);
    if (gm === 0 || b - a < 1e-15 * Math.max(1, Math.abs(m))) return m;
    if (ga * gm < 0) b = m;
    else {
      a = m;
      ga = gm;
    }
  }
  return (a + b) / 2;
}

const slopeOf = (f: (x: number) => number) => (x: number) => {
  const e = 1e-6 * Math.max(1, Math.abs(x));
  return (f(x + e) - f(x - e)) / (2 * e);
};

/** Where the slope changes sign in (lo, hi). */
function criticalPoints(f: (x: number) => number, lo: number, hi: number, n = 1600): number[] {
  const d = slopeOf(f);
  const out: number[] = [];
  const h = (hi - lo) / n;
  let px = lo + h / 2;
  let py = d(px);
  for (let i = 1; i < n; i++) {
    const x = lo + h / 2 + i * h;
    const y = d(x);
    if (Number.isFinite(py) && Number.isFinite(y) && py * y < 0) {
      const c = bisect(d, px, x);
      if (Number.isFinite(f(c))) out.push(c);
    }
    px = x;
    py = y;
  }
  return out;
}

/** Exact texts for a polynomial's real roots: rational roots divided out, then a quadratic. */
function polyRootTexts(cs: number[]): { x: number; text?: string }[] {
  let q = [...cs];
  while (q.length > 1 && Math.abs(q[0]!) < 1e-15) q.shift();
  const found: { x: number; text?: string }[] = [];
  const bound = 1 + Math.max(...q.slice(1).map((c) => Math.abs(c / q[0]!)), 0);
  for (let guard = 0; guard < 12 && q.length > 3; guard++) {
    const roots = numericZeros((x) => polyAt(q, x), -bound, bound);
    const rational = roots
      .map((r) => toFraction(r, 12))
      .find((f) => f && Math.abs(polyAt(q, f[0] / f[1])) < 1e-9 * Math.max(1, ...q.map(Math.abs)));
    if (!rational) break;
    const r = rational[0] / rational[1];
    found.push({ x: r, text: fracText(r) });
    q = synthetic(q, r)[0];
  }
  if (q.length === 3) found.push(...quadraticRoots(q[0]!, q[1]!, q[2]!));
  else if (q.length === 2) found.push({ x: -q[1]! / q[0]!, text: fracText(-q[1]! / q[0]!) });
  else
    for (const x of numericZeros((x) => polyAt(q, x), -bound, bound))
      found.push({ x, text: fracText(x) });
  const sorted = found.sort((a, b) => a.x - b.x);
  return sorted.filter((r, i) => i === 0 || Math.abs(r.x - sorted[i - 1]!.x) > 1e-7);
}

// ─── Formulas as written ───────────────────────────────────────────────────────

/** A piece of a formula: text (single letters italic), raised or lowered, a stacked fraction, a root, cases. */
export type Tok =
  | { t: string; sup?: boolean; sub?: boolean }
  | { frac: [Tok[], Tok[]] }
  | { root: 2 | 3; body: Tok[] }
  | { cases: { f: Tok[]; when: Tok[] }[] };

const T = (t: string, extra?: { sup?: boolean; sub?: boolean }): Tok => ({ t, ...extra });

/** The formula as one line of plain text: "f(x) = 2(x − 1)² − 3", "f(x) = (x + 1)/(x − 2)". */
export function plain(toks: Tok[]): string {
  const SUPS: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    [MINUS]: '⁻',
    x: 'ˣ',
  };
  const SUBS: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };
  // A bracket already around the whole needs no second one.
  const wrapped = (s: string) => {
    if (!s.startsWith('(') || !s.endsWith(')')) return false;
    let depth = 0;
    for (let i = 0; i < s.length; i++) {
      depth += s[i] === '(' ? 1 : s[i] === ')' ? -1 : 0;
      if (depth === 0 && i < s.length - 1) return false;
    }
    return true;
  };
  const group = (s: string) => (/^[\w.,π√]+$/u.test(s) || wrapped(s) ? s : `(${s})`);
  return toks
    .map((k) => {
      if ('frac' in k) return `${group(plain(k.frac[0]))}/${group(plain(k.frac[1]))}`;
      if ('root' in k) return `${k.root === 2 ? '√' : '∛'}${group(plain(k.body))}`;
      if ('cases' in k)
        return `{ ${k.cases.map((c) => `${plain(c.f)} if ${plain(c.when)}`).join('; ')} }`;
      if (k.sup)
        return [...k.t].every((ch) => SUPS[ch])
          ? [...k.t].map((ch) => SUPS[ch]).join('')
          : `^${k.t.length === 1 ? k.t : `(${k.t})`}`;
      if (k.sub)
        return [...k.t].every((ch) => SUBS[ch])
          ? [...k.t].map((ch) => SUBS[ch]).join('')
          : `_${k.t}`;
      return k.t;
    })
    .join('');
}

/** How a parameter is written: exact text, or "?" when the student hasn't typed it. */
export type Say = (name: string, pi?: boolean) => string;

/** "x − 2", "x + 2" or "x" for x − h. */
export const shiftText = (x: string, h: number, say: string) =>
  h === 0 && say !== '?'
    ? x
    : say.startsWith(MINUS)
      ? `${x} + ${say.slice(1)}`
      : `${x} ${MINUS} ${say}`;
/** " + 3", " − 3" or "" for + k. */
export const plusText = (k: number, say: string) =>
  k === 0 && say !== '?' ? '' : say.startsWith(MINUS) ? ` ${MINUS} ${say.slice(1)}` : ` + ${say}`;
/** A leading coefficient: "" for 1, "−" for −1, else the number ("(2/3)" when a fraction). */
export const lead = (a: number, say: string) =>
  say === '?' ? '?' : a === 1 ? '' : a === -1 ? MINUS : say.includes('/') ? `(${say})` : say;

// ─── Families ─────────────────────────────────────────────────────────────────

export interface Pt {
  x: number;
  y: number;
}
export interface Interval {
  lo: number;
  hi: number;
  loIn: boolean;
  hiIn: boolean;
}
/** A handle: where it sits, what it sets, and the values for a drag to (X, Y). */
export interface HandleDef {
  name: string;
  x: number;
  y: number;
  axis: 'x' | 'y' | 'xy';
  /** Parameter paths it sets ('h', 'zeros.1.x', 'coefficients.3'); the first is slid. */
  sets: string[];
  to: (X: number, Y: number) => Record<string, number> | undefined;
  /** Anywhere along the curve: the picture puts it well inside the window, right of `x`. */
  free?: boolean;
}

export interface Curve {
  family: FunctionFamily['family'];
  f: (x: number) => number;
  /** The value approached from the left (−1) or the right (+1). */
  side: (x: number, s: -1 | 1) => number;
  /** Vertical asymptotes in [lo, hi]. */
  vas: (lo: number, hi: number) => number[];
  has: number[];
  slant?: { m: number; b: number };
  holes: Pt[];
  /** Piece ends: filled when the end belongs to the piece. */
  ends: (Pt & { closed: boolean })[];
  /** Where the curve is split when drawn (asymptotes, holes, piece ends) in [lo, hi]. */
  breaks: (lo: number, hi: number) => number[];
  /** The vertex (quadratic, absolute), the start (square root), the center, or (h, k). */
  key?: Pt & { what: 'vertex' | 'start' | 'center' | 'point' };
  /** Exact zeros in [lo, hi], when the algebra gives them. */
  zeros?: (lo: number, hi: number) => { x: number; text?: string }[];
  domain: Interval[];
  range?: Interval[];
  handles: HandleDef[];
  /** The right side of the formula. */
  text: Tok[];
  /** The parent function (numbers only), for `parent`. */
  parent?: FunctionFamily;
  /** The inverse's right side, when it is written simply. */
  inverse?: Tok[];
  /** Trig: the x-axis in multiples of π; inverse trig: the y-axis. */
  piX?: boolean;
  piY?: boolean;
  period?: number;
  amplitude?: number;
  midline?: number;
  inflection?: Pt;
  degree?: number;
}

const ALL: Interval = { lo: -Infinity, hi: Infinity, loIn: false, hiIn: false };
const iv = (lo: number, hi: number, loIn: boolean, hiIn: boolean): Interval => ({
  lo,
  hi,
  loIn,
  hiIn,
});
const none = () => [] as number[];

/** Reads a family field: a number, or the variable's value (a fallback when left out). */
export type Get = (v: NumOrVar | undefined, fallback: number) => number;

/**
 * Builds a family from its values. `say(field)` writes a field in the formula ("?" when not
 * typed); `x` is the input letter.
 */
export function buildCurve(
  fam: FunctionFamily,
  get: Get,
  say: (v: NumOrVar | undefined, fallback: number, pi?: boolean) => string,
  x = 'x',
): Curve {
  const base = {
    family: fam.family,
    has: [] as number[],
    holes: [] as Pt[],
    ends: [] as (Pt & { closed: boolean })[],
    vas: none as (lo: number, hi: number) => number[],
    handles: [] as HandleDef[],
  };
  const side = (f: (x: number) => number) => (c: number, s: -1 | 1) => {
    const v = f(c);
    return Number.isFinite(v) ? v : f(c + s * 1e-9);
  };
  switch (fam.family) {
    case 'linear': {
      const [m, b] = [get(fam.m, 1), get(fam.b, 0)];
      const f = (t: number) => m * t + b;
      const ms = say(fam.m, 1);
      return {
        ...base,
        f,
        side: side(f),
        breaks: none,
        zeros: () => (m === 0 ? [] : [{ x: -b / m, text: fracText(-b / m) }]),
        domain: [ALL],
        range: m === 0 ? [iv(b, b, true, true)] : [ALL],
        text: [
          T(
            m === 0 && ms !== '?'
              ? say(fam.b, 0)
              : `${lead(m, ms)}${x}${plusText(b, say(fam.b, 0))}`,
          ),
        ],
        inverse: m === 0 ? undefined : [T(`(${x}${plusText(-b, numText(-b))})/${numText(m)}`)],
        parent: { family: 'linear', m: 1, b: 0 },
        handles: [
          { name: 'the intercept', x: 0, y: b, axis: 'y', sets: ['b'], to: (_, Y) => ({ b: Y }) },
          {
            name: 'the slope',
            x: 1,
            y: m + b,
            axis: 'y',
            sets: ['m'],
            to: (_, Y) => ({ m: Y - b }),
          },
        ],
      };
    }
    case 'absolute': {
      const [a, h, k] = [get(fam.a, 1), get(fam.h, 0), get(fam.k, 0)];
      const f = (t: number) => a * Math.abs(t - h) + k;
      const r = -k / a;
      return {
        ...base,
        f,
        side: side(f),
        breaks: none,
        key: { x: h, y: k, what: 'vertex' },
        zeros: () =>
          r < 0
            ? []
            : r === 0
              ? [{ x: h, text: fracText(h) }]
              : [h - r, h + r].map((z) => ({ x: z, text: fracText(z) })),
        domain: [ALL],
        range: [a > 0 ? iv(k, Infinity, true, false) : iv(-Infinity, k, false, true)],
        text: [
          T(
            `${lead(a, say(fam.a, 1))}|${shiftText(x, h, say(fam.h, 0))}|${plusText(k, say(fam.k, 0))}`,
          ),
        ],
        parent: { family: 'absolute' },
        handles: [
          {
            name: 'the vertex',
            x: h,
            y: k,
            axis: 'xy',
            sets: ['h', 'k'],
            to: (X, Y) => ({ h: X, k: Y }),
          },
          {
            name: 'the stretch',
            x: h + 1,
            y: a + k,
            axis: 'y',
            sets: ['a'],
            to: (_, Y) => ({ a: Y - k }),
          },
        ],
      };
    }
    case 'quadratic': {
      let a: number, b: number, c: number;
      let text: string;
      const handles: HandleDef[] = [];
      if (fam.form === 'standard') {
        [a, b, c] = [get(fam.a, 1), get(fam.b, 0), get(fam.c, 0)];
        const bs = say(fam.b, 0);
        const cs = say(fam.c, 0);
        const bTerm =
          b === 0 && bs !== '?'
            ? ''
            : bs === '?'
              ? ` + ?${x}`
              : ` ${b < 0 ? MINUS : '+'} ${Math.abs(b) === 1 ? '' : bs.replace(/^−/, '')}${x}`;
        text = `${lead(a, say(fam.a, 1))}${x}²${bTerm}${plusText(c, cs)}`;
        const h0 = -b / (2 * a);
        handles.push(
          {
            name: 'the vertex',
            x: h0,
            y: c - (b * b) / (4 * a),
            axis: 'xy',
            sets: ['b', 'c'],
            to: (X, Y) => ({ b: -2 * a * X, c: a * X * X + Y }),
          },
          {
            name: 'the stretch',
            x: h0 + 1,
            y: a * (h0 + 1) ** 2 + b * (h0 + 1) + c,
            axis: 'y',
            sets: ['a'],
            to: (_, Y) =>
              h0 + 1 === 0 ? undefined : { a: (Y - b * (h0 + 1) - c) / (h0 + 1) ** 2 },
          },
        );
      } else if (fam.form === 'vertex') {
        const [a0, h, k] = [get(fam.a, 1), get(fam.h, 0), get(fam.k, 0)];
        [a, b, c] = [a0, -2 * a0 * h, a0 * h * h + k];
        const inner = shiftText(x, h, say(fam.h, 0));
        text = `${lead(a0, say(fam.a, 1))}${inner === x ? x : `(${inner})`}²${plusText(k, say(fam.k, 0))}`;
        handles.push(
          {
            name: 'the vertex',
            x: h,
            y: k,
            axis: 'xy',
            sets: ['h', 'k'],
            to: (X, Y) => ({ h: X, k: Y }),
          },
          {
            name: 'the stretch',
            x: h + 1,
            y: a0 + k,
            axis: 'y',
            sets: ['a'],
            to: (_, Y) => ({ a: Y - k }),
          },
        );
      } else {
        const [a0, p, q] = [get(fam.a, 1), get(fam.p, 0), get(fam.q, 0)];
        [a, b, c] = [a0, -a0 * (p + q), a0 * p * q];
        const fac = (z: NumOrVar, v: number) => {
          const s = shiftText(x, v, say(z, 0));
          return s === x ? x : `(${s})`;
        };
        text = `${lead(a0, say(fam.a, 1))}${fac(fam.p, p)}${fac(fam.q, q)}`;
        const hv = (p + q) / 2;
        handles.push(
          { name: 'the first zero', x: p, y: 0, axis: 'x', sets: ['p'], to: (X) => ({ p: X }) },
          { name: 'the second zero', x: q, y: 0, axis: 'x', sets: ['q'], to: (X) => ({ q: X }) },
          {
            name: 'the stretch',
            x: hv,
            y: a0 * (hv - p) * (hv - q),
            axis: 'y',
            sets: ['a'],
            to: (_, Y) =>
              (hv - p) * (hv - q) === 0 ? undefined : { a: Y / ((hv - p) * (hv - q)) },
          },
        );
      }
      const f = (t: number) => (a * t + b) * t + c;
      const hx = -b / (2 * a);
      const ky = c - (b * b) / (4 * a);
      return {
        ...base,
        f,
        side: side(f),
        breaks: none,
        key: a === 0 ? undefined : { x: hx, y: ky, what: 'vertex' },
        zeros: () => quadraticRoots(a, b, c),
        domain: [ALL],
        range:
          a === 0
            ? undefined
            : [a > 0 ? iv(ky, Infinity, true, false) : iv(-Infinity, ky, false, true)],
        text: [T(text)],
        parent: { family: 'quadratic', form: 'vertex', h: 0, k: 0 },
        handles,
        degree: 2,
      };
    }
    case 'exponential': {
      const natural = 'r' in fam;
      const [a, h, k] = [get(fam.a, 1), get(fam.h, 0), get(fam.k, 0)];
      const b = natural ? Math.E : get(fam.b, 2);
      const r = natural ? get(fam.r, 1) : 1;
      const f = (t: number) => a * b ** (r * (t - h)) + k;
      const as = say(fam.a, 1);
      const inner = shiftText(x, h, say(fam.h, 0));
      const exp = natural ? `${lead(r, say(fam.r, 1))}${inner === x ? x : `(${inner})`}` : inner;
      const bs = natural ? 'e' : say(fam.b, 2);
      const baseText = natural || /^\d+$/.test(bs) || bs === '?' ? bs : `(${bs})`;
      const coef =
        as === '?'
          ? '?'
          : a === 1
            ? ''
            : a === -1
              ? MINUS
              : `${as.includes('/') ? `(${as})` : as}${natural ? '\u2009' : /^\(/.test(baseText) ? '' : '·'}`;
      const z = -k / a;
      const handles: HandleDef[] = [
        {
          name: 'the key point',
          x: h,
          y: a + k,
          axis: 'xy',
          sets: ['h', 'k'],
          to: (X, Y) => ({ h: X, k: Y - a }),
        },
        natural
          ? {
              name: 'the rate',
              x: h + 1,
              y: f(h + 1),
              axis: 'y',
              sets: ['r'],
              free: true,
              to: (X, Y) =>
                (Y - k) / a > 0 && X !== h ? { r: Math.log((Y - k) / a) / (X - h) } : undefined,
            }
          : {
              name: 'the base',
              x: h + 1,
              y: f(h + 1),
              axis: 'y',
              sets: ['b'],
              free: true,
              to: (X, Y) =>
                (Y - k) / a > 0 && X !== h ? { b: ((Y - k) / a) ** (1 / (X - h)) } : undefined,
            },
        {
          name: 'the starting value',
          x: h,
          y: a + k,
          axis: 'y',
          sets: ['a'],
          to: (_, Y) => (Y - k === 0 ? undefined : { a: Y - k }),
        },
      ];
      return {
        ...base,
        f,
        side: side(f),
        breaks: none,
        has: [k],
        key: { x: h, y: a + k, what: 'point' },
        zeros: () => {
          if (!(z > 0)) return [];
          const zx = h + Math.log(z) / (r * Math.log(b));
          return [{ x: zx, text: fracText(zx) }];
        },
        domain: [ALL],
        range: [a > 0 ? iv(k, Infinity, false, false) : iv(-Infinity, k, false, false)],
        text: [T(coef), T(baseText), T(exp, { sup: true }), T(plusText(k, say(fam.k, 0)))],
        inverse:
          k === 0 && h === 0 && a === 1
            ? natural
              ? [T(r === 1 ? `ln ${x}` : `(ln ${x})/${numText(r)}`)]
              : [T('log'), T(numText(b), { sub: true }), T(` ${x}`)]
            : undefined,
        parent: natural ? { family: 'exponential', r: 1 } : { family: 'exponential', b },
        handles,
      };
    }
    case 'logistic': {
      const [K, N0, r] = [get(fam.K, 100), get(fam.start, 10), get(fam.r, 1)];
      const A = (K - N0) / N0;
      const f = (t: number) => K / (1 + A * Math.exp(-r * t));
      const ti = A > 0 ? Math.log(A) / r : undefined;
      const handles: HandleDef[] = [
        {
          name: 'the starting value',
          x: 0,
          y: N0,
          axis: 'y',
          sets: ['start'],
          to: (_, Y) => (Y > 0 ? { start: Y } : undefined),
        },
      ];
      if (ti !== undefined && ti > 0)
        handles.push({
          name: 'the growth rate',
          x: ti,
          y: K / 2,
          axis: 'x',
          sets: ['r'],
          to: (X) => (X > 0 ? { r: Math.log(A) / X } : undefined),
        });
      return {
        ...base,
        f,
        side: side(f),
        breaks: none,
        has: [0, K],
        domain: [ALL],
        range: [iv(0, K, false, false)],
        text: [
          {
            frac: [
              [T(say(fam.K, 100))],
              [T(`1 + ${numText(A)}e`), T(`${MINUS}${lead(r, say(fam.r, 1))}${x}`, { sup: true })],
            ],
          },
        ],
        inflection: ti === undefined ? undefined : { x: ti, y: K / 2 },
        handles,
      };
    }
    case 'log': {
      const natural = fam.b === undefined;
      const [a, h, k] = [get(fam.a, 1), get(fam.h, 0), get(fam.k, 0)];
      const b = natural ? Math.E : get(fam.b, 10);
      const f = (t: number) => (t > h ? (a * Math.log(t - h)) / Math.log(b) + k : NaN);
      const inner = shiftText(x, h, say(fam.h, 0));
      const coef = lead(a, say(fam.a, 1));
      const zx = h + b ** (-k / a);
      return {
        ...base,
        f,
        side: (c, s) => (c > h ? f(c) : s > 0 && c === h ? -Infinity * Math.sign(a) : NaN),
        vas: (lo, hi) => (h >= lo && h <= hi ? [h] : []),
        breaks: (lo, hi) => (h >= lo && h <= hi ? [h] : []),
        key: { x: h + 1, y: k, what: 'point' },
        zeros: () => [{ x: zx, text: fracText(zx) }],
        domain: [iv(h, Infinity, false, false)],
        range: [ALL],
        text: natural
          ? [
              T(
                `${coef}${coef && coef !== MINUS ? ' ' : ''}ln(${inner})${plusText(k, say(fam.k, 0))}`,
              ),
            ]
          : [
              T(`${coef}${coef && coef !== MINUS ? ' ' : ''}log`),
              T(say(fam.b, 10), { sub: true }),
              T(`(${inner})${plusText(k, say(fam.k, 0))}`),
            ],
        inverse:
          a === 1 && h === 0 && k === 0
            ? natural
              ? [T('e'), T(x, { sup: true })]
              : [T(numText(b)), T(x, { sup: true })]
            : undefined,
        parent: natural ? { family: 'log' } : { family: 'log', b },
        handles: [
          {
            name: 'the shift',
            x: h + 1,
            y: k,
            axis: 'xy',
            sets: ['h', 'k'],
            to: (X, Y) => ({ h: X - 1, k: Y }),
          },
          natural
            ? {
                name: 'the stretch',
                x: h + Math.E,
                y: a + k,
                axis: 'y',
                sets: ['a'],
                to: (_, Y) => ({ a: Y - k }),
              }
            : {
                name: 'the base',
                x: h + b,
                y: a + k,
                axis: 'xy',
                sets: ['b', 'a'],
                to: (X, Y) =>
                  X - h > 0 && Math.abs(X - h - 1) > 1e-9 ? { b: X - h, a: Y - k } : undefined,
              },
        ],
      };
    }
    case 'root': {
      const [a, h, k] = [get(fam.a, 1), get(fam.h, 0), get(fam.k, 0)];
      const cube = fam.index === 3;
      const f = (t: number) =>
        cube ? a * Math.cbrt(t - h) + k : t >= h ? a * Math.sqrt(t - h) + k : NaN;
      const coef = lead(a, say(fam.a, 1));
      const z = -k / a;
      return {
        ...base,
        f,
        side: side(f),
        breaks: none,
        key: { x: h, y: k, what: cube ? 'center' : 'start' },
        zeros: () =>
          cube
            ? [{ x: h + z ** 3, text: fracText(h + z ** 3) }]
            : z >= 0
              ? [{ x: h + z * z, text: fracText(h + z * z) }]
              : [],
        domain: [cube ? ALL : iv(h, Infinity, true, false)],
        range: [cube ? ALL : a > 0 ? iv(k, Infinity, true, false) : iv(-Infinity, k, false, true)],
        text: [
          T(coef),
          { root: fam.index, body: [T(shiftText(x, h, say(fam.h, 0)))] },
          T(plusText(k, say(fam.k, 0))),
        ],
        inverse:
          !cube && a === 1 && h === 0 && k === 0
            ? [T(`${x}`), T('2', { sup: true }), T(`, ${x} ≥ 0`)]
            : undefined,
        parent: { family: 'root', index: fam.index },
        handles: [
          {
            name: cube ? 'the center' : 'the start',
            x: h,
            y: k,
            axis: 'xy',
            sets: ['h', 'k'],
            to: (X, Y) => ({ h: X, k: Y }),
          },
          {
            name: 'the stretch',
            x: h + 1,
            y: a + k,
            axis: 'y',
            sets: ['a'],
            to: (_, Y) => ({ a: Y - k }),
          },
        ],
      };
    }
    case 'polynomial': {
      const byZeros = 'zeros' in fam;
      // H105: a multiplicity from a value is kept to a whole number 1 to 9.
      const zs = byZeros
        ? fam.zeros.map((z) => ({
            x: get(z.x, 0),
            times: Math.min(9, Math.max(1, Math.round(get(z.times, 1)))),
          }))
        : [];
      const a = byZeros ? get(fam.a, 1) : 1;
      const cs = byZeros ? polyFromZeros(a, zs) : fam.coefficients.map((c) => get(c, 0));
      // By zeros, the product itself: expanded coefficients lose a repeated zero's sign.
      const f = byZeros
        ? (t: number) => zs.reduce((p, z) => p * (t - z.x) ** z.times, a)
        : (t: number) => polyAt(cs, t);
      const deg = cs.length - 1;
      let text: string;
      const handles: HandleDef[] = [];
      if (byZeros) {
        const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
        text =
          lead(a, say(fam.a, 1)) +
          fam.zeros
            .map((z, i) => {
              const s = shiftText(x, zs[i]!.x, say(z.x, 0));
              const pow =
                say(z.times, 1) === '?' ? '^?' : zs[i]!.times > 1 ? SUP[zs[i]!.times] : '';
              return s === x ? `${x}${pow}` : `(${s})${pow}`;
            })
            .join('');
        fam.zeros.forEach((_, i) =>
          handles.push({
            name: `zero ${i + 1}`,
            x: zs[i]!.x,
            y: 0,
            axis: 'x',
            sets: [`zeros.${i}.x`],
            to: (X) => ({ [`zeros.${i}.x`]: X }),
          }),
        );
      } else {
        const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
        const terms = fam.coefficients
          .map((c, i) => {
            const v = cs[i]!;
            const s = say(c, 0);
            const p = deg - i;
            if (v === 0 && s !== '?') return '';
            const xp = p === 0 ? '' : p === 1 ? x : `${x}${SUP[p] ?? `^${p}`}`;
            const mag = s === '?' ? '?' : Math.abs(v) === 1 && p > 0 ? '' : s.replace(/^−/, '');
            return `${v < 0 ? MINUS : '+'}${mag}${xp}`;
          })
          .filter(Boolean);
        text =
          terms
            .map((t, i) => (i === 0 ? t.replace(/^\+/, '') : ` ${t[0]} ${t.slice(1)}`))
            .join('') || '0';
        const last = fam.coefficients.length - 1;
        handles.push({
          name: 'the constant term',
          x: 0,
          y: cs[last]!,
          axis: 'y',
          sets: [`coefficients.${last}`],
          to: (_, Y) => ({ [`coefficients.${last}`]: Y }),
        });
      }
      return {
        ...base,
        f,
        side: side(f),
        breaks: none,
        zeros: (lo, hi) =>
          (byZeros ? zs.map((z) => ({ x: z.x, text: fracText(z.x) })) : polyRootTexts(cs))
            .filter((z) => z.x >= lo && z.x <= hi)
            .sort((p, q) => p.x - q.x)
            .filter((z, i, arr) => i === 0 || Math.abs(z.x - arr[i - 1]!.x) > 1e-9),
        domain: [ALL],
        text: [T(text)],
        handles,
        degree: deg,
      };
    }
    case 'rational': {
      if ('p' in fam) return ratioCurve(fam, get, say, x, (g, l) => buildCurve(g, get, say, l));
      if ('top' in fam)
        return rationalByTopCurve(fam, get, x, (g, l) => buildCurve(g, get, say, l));
      const a = get(fam.a, 1);
      const k = get(fam.k, 0);
      const zs = fam.zeros.map((z) => get(z, 0));
      const ps = fam.poles.map((p) => get(p, 0));
      // A zero equal to a pole cancels: a hole there.
      const zLeft = [...zs];
      const pLeft: number[] = [];
      const cancelled: number[] = [];
      for (const p of ps) {
        const i = zLeft.findIndex((z) => Math.abs(z - p) < 1e-12);
        if (i >= 0) {
          zLeft.splice(i, 1);
          cancelled.push(p);
        } else pLeft.push(p);
      }
      const reduced = (t: number) =>
        (a * zLeft.reduce((m, z) => m * (t - z), 1)) / pLeft.reduce((m, p) => m * (t - p), 1) + k;
      const f = (t: number) => (ps.some((p) => t === p) ? NaN : reduced(t));
      const holes = [...new Set(cancelled)]
        .filter((c) => !pLeft.includes(c))
        .map((c) => ({ x: c, y: reduced(c) }));
      const vasAll = [...new Set(pLeft)];
      const [n, d] = [zLeft.length, pLeft.length];
      const has = n < d ? [k] : n === d ? [a + k] : [];
      let slant: { m: number; b: number } | undefined;
      if (n === d + 1) {
        const num = polyFromZeros(
          a,
          zLeft.map((z) => ({ x: z, times: 1 })),
        );
        const den = polyFromZeros(
          1,
          pLeft.map((p) => ({ x: p, times: 1 })),
        );
        // Long division: the quotient's two leading terms.
        const m = num[0]! / den[0]!;
        const b = (num[1]! - m * den[1]!) / den[0]!;
        slant = { m, b: b + k };
      }
      const fac = (list: NumOrVar[], vals: number[]) =>
        list
          .map((z, i) => {
            const s = shiftText(x, vals[i]!, say(z, 0));
            return s === x ? x : `(${s})`;
          })
          .join('');
      const numText0 = fac(fam.zeros, zs);
      const as = say(fam.a, 1);
      const top = numText0 ? `${lead(a, as)}${numText0}` : as;
      const handles: HandleDef[] = [];
      if (fam.zeros.length === 0 && fam.poles.length === 1) {
        handles.push(
          {
            name: 'the center',
            x: ps[0]!,
            y: k,
            axis: 'xy',
            sets: ['poles.0', 'k'],
            to: (X, Y) => ({ 'poles.0': X, k: Y }),
          },
          {
            name: 'the stretch',
            x: ps[0]! + 1,
            y: a + k,
            axis: 'y',
            sets: ['a'],
            to: (_, Y) => ({ a: Y - k }),
          },
        );
      } else {
        // A cancelled zero is the hole: no handle there, so the open circle shows.
        fam.zeros.forEach((_, i) => {
          if (cancelled.includes(zs[i]!)) return;
          handles.push({
            name: `zero ${i + 1}`,
            x: zs[i]!,
            y: k === 0 ? 0 : reduced(zs[i]!),
            axis: 'x',
            sets: [`zeros.${i}`],
            to: (X) => ({ [`zeros.${i}`]: X }),
          });
        });
      }
      const exclusions = [...new Set(ps)].sort((p, q) => p - q);
      const domain: Interval[] = [];
      let lo = -Infinity;
      for (const p of exclusions) {
        domain.push(iv(lo, p, false, false));
        lo = p;
      }
      domain.push(iv(lo, Infinity, false, false));
      return {
        ...base,
        f,
        side: (c, s) =>
          holes.some((hh) => hh.x === c)
            ? reduced(c)
            : Number.isFinite(f(c))
              ? f(c)
              : reduced(c + s * 1e-9),
        vas: (lo2, hi2) => vasAll.filter((v) => v >= lo2 && v <= hi2),
        has,
        slant,
        holes,
        breaks: (lo2, hi2) => exclusions.filter((v) => v >= lo2 && v <= hi2),
        key:
          fam.zeros.length === 0 && fam.poles.length === 1
            ? { x: ps[0]!, y: k, what: 'center' }
            : undefined,
        zeros:
          k === 0
            ? (lo2, hi2) =>
                [...new Set(zLeft)]
                  .filter((z) => z >= lo2 && z <= hi2)
                  .sort((p, q) => p - q)
                  .map((z) => ({ x: z, text: fracText(z) }))
            : undefined,
        domain,
        range:
          fam.zeros.length === 0 && fam.poles.length === 1
            ? [iv(-Infinity, k, false, false), iv(k, Infinity, false, false)]
            : undefined,
        text: [{ frac: [[T(top)], [T(fac(fam.poles, ps) || '1')]] }, T(plusText(k, say(fam.k, 0)))],
        parent:
          fam.zeros.length === 0 && fam.poles.length === 1
            ? { family: 'rational', zeros: [], poles: [0] }
            : undefined,
        handles,
      };
    }
    case 'piecewise': {
      const pieces = fam.pieces.map((p) => pieceOf(p, get, say, x));
      const f = (t: number) => {
        const p = pieces.find((q) => q.has(t));
        return p ? p.c.f(t) : NaN;
      };
      const ends: (Pt & { closed: boolean })[] = [];
      for (const p of pieces) {
        for (const [e, closed] of [
          [p.lo, p.loIn],
          [p.hi, p.hiIn],
        ] as const) {
          if (!Number.isFinite(e)) continue;
          const y = p.c.side(e, e === p.lo ? 1 : -1);
          // An open end filled by the next piece at the same height draws once, filled.
          const covered = pieces.some((q) => q !== p && q.has(e) && Math.abs(q.c.f(e) - y) < 1e-9);
          if (covered) continue;
          ends.push({ x: e, y, closed });
        }
      }
      const bounds = [...new Set(pieces.flatMap((p) => [p.lo, p.hi]).filter(Number.isFinite))].sort(
        (p, q) => p - q,
      );
      return {
        ...base,
        f,
        side: (c, s) => {
          const p = pieces.find((q) => (s < 0 ? q.lo < c && c <= q.hi : q.lo <= c && c < q.hi));
          return p ? p.c.side(c, s) : NaN;
        },
        ends,
        breaks: (lo, hi) => bounds.filter((b) => b >= lo && b <= hi),
        domain: pieces
          .map((p) => iv(p.lo, p.hi, p.loIn, p.hiIn))
          .reduce<Interval[]>((acc, i) => {
            const last = acc[acc.length - 1];
            if (last && last.hi === i.lo && (last.hiIn || i.loIn))
              acc[acc.length - 1] = { ...last, hi: i.hi, hiIn: i.hiIn };
            else acc.push(i);
            return acc;
          }, []),
        text: [{ cases: pieces.map((p) => ({ f: p.c.text, when: [T(p.when)] })) }],
        vas: (lo, hi) => pieces.flatMap((p) => p.c.vas(lo, hi)),
      };
    }
    case 'power':
    case 'logSum':
      return buildHs3b(fam, get, say, x); // H106
    case 'sin':
    case 'cos':
    case 'tan': {
      const [a, b, h, k] = [get(fam.a, 1), get(fam.b, 1), get(fam.h, 0), get(fam.k, 0)];
      const g = fam.family === 'sin' ? Math.sin : fam.family === 'cos' ? Math.cos : Math.tan;
      const tan = fam.family === 'tan';
      const f = (t: number) => a * g(b * (t - h)) + k;
      const period = (tan ? Math.PI : 2 * Math.PI) / Math.abs(b);
      const hs = say(fam.h, 0, true);
      const inner = shiftText(x, h, hs);
      const bs = say(fam.b, 1);
      const arg = b === 1 && bs !== '?' ? inner : inner === x ? `${bs}${x}` : `${bs}(${inner})`;
      const coef = lead(a, say(fam.a, 1));
      const vas = (lo: number, hi: number) => {
        if (!tan || a === 0) return [];
        const out: number[] = [];
        const n0 = Math.ceil(((lo - h) * b - Math.PI / 2) / Math.PI);
        for (let n = n0; ; n++) {
          const v = h + (Math.PI / 2 + n * Math.PI) / b;
          if (v > hi) break;
          out.push(v);
          if (out.length > 400) break;
        }
        return out;
      };
      const q = period / 4;
      const handles: HandleDef[] =
        fam.family === 'sin'
          ? [
              {
                name: 'the start',
                x: h,
                y: k,
                axis: 'xy',
                sets: ['h', 'k'],
                to: (X, Y) => ({ h: X, k: Y }),
              },
              {
                name: 'the peak',
                x: h + q,
                y: a + k,
                axis: 'xy',
                sets: ['b', 'a'],
                to: (X, Y) => (X - h > 1e-9 ? { b: Math.PI / (2 * (X - h)), a: Y - k } : undefined),
              },
            ]
          : fam.family === 'cos'
            ? [
                {
                  name: 'the peak',
                  x: h,
                  y: a + k,
                  axis: 'xy',
                  sets: ['h', 'k'],
                  to: (X, Y) => ({ h: X, k: Y - a }),
                },
                {
                  name: 'the low point',
                  x: h + 2 * q,
                  y: k - a,
                  axis: 'xy',
                  sets: ['b', 'a'],
                  to: (X, Y) => (X - h > 1e-9 ? { b: Math.PI / (X - h), a: k - Y } : undefined),
                },
              ]
            : [
                {
                  name: 'the center',
                  x: h,
                  y: k,
                  axis: 'xy',
                  sets: ['h', 'k'],
                  to: (X, Y) => ({ h: X, k: Y }),
                },
                {
                  name: 'the stretch',
                  x: h + q,
                  y: a + k,
                  axis: 'xy',
                  sets: ['b', 'a'],
                  to: (X, Y) =>
                    X - h > 1e-9 ? { b: Math.PI / (4 * (X - h)), a: Y - k } : undefined,
                },
              ];
      return {
        ...base,
        f,
        side: (c, s) => {
          const v = f(c);
          return Number.isFinite(v) ? v : Math.sign(f(c + s * 1e-9) - k) * Infinity;
        },
        vas,
        breaks: vas,
        key: { x: h, y: fam.family === 'cos' ? a + k : k, what: 'point' },
        domain: [ALL],
        range: tan ? [ALL] : [iv(k - Math.abs(a), k + Math.abs(a), true, true)],
        text: [
          T(
            `${coef}${coef && coef !== MINUS ? ' ' : ''}${fam.family}(${arg})${plusText(k, say(fam.k, 0))}`,
          ),
        ],
        parent: { family: fam.family },
        piX: true,
        period,
        amplitude: tan ? undefined : Math.abs(a),
        midline: k,
        handles,
      };
    }
    case 'arcsin':
    case 'arccos':
    case 'arctan': {
      const [a, k] = [get(fam.a, 1), get(fam.k, 0)];
      const g =
        fam.family === 'arcsin' ? Math.asin : fam.family === 'arccos' ? Math.acos : Math.atan;
      const tan = fam.family === 'arctan';
      // H105: in degrees, the angle is 180/π times the radian one.
      const u = fam.degrees ? 180 / Math.PI : 1;
      const f = (t: number) => (tan || Math.abs(t) <= 1 ? a * u * g(t) + k : NaN);
      const [lo, hi] = (fam.family === 'arccos' ? [0, Math.PI] : [-Math.PI / 2, Math.PI / 2]).map(
        (x) => x * u,
      ) as [number, number];
      const [r0, r1] = [a * lo + k, a * hi + k].sort((p, q) => p - q) as [number, number];
      const coef = lead(a, say(fam.a, 1));
      const name = fam.family.slice(3);
      return {
        ...base,
        f,
        side: side(f),
        breaks: none,
        has: tan ? [a * lo + k, a * hi + k] : [],
        domain: [tan ? ALL : iv(-1, 1, true, true)],
        range: [iv(r0, r1, !tan, !tan)],
        text: [
          T(`${coef}${coef && coef !== MINUS ? ' ' : ''}${name}`),
          T(`${MINUS}1`, { sup: true }),
          T(`(${x})${plusText(k, say(fam.k, 0, !fam.degrees))}`),
        ],
        parent: { family: fam.family, ...(fam.degrees ? { degrees: true } : {}) },
        piY: !fam.degrees,
        handles: [
          {
            name: 'the shift',
            x: fam.family === 'arccos' ? 1 : 0,
            y: k,
            axis: 'y',
            sets: ['k'],
            to: (_, Y) => ({ k: Y }),
          },
          {
            name: 'the stretch',
            x: fam.family === 'arccos' ? -1 : 1,
            y: f(fam.family === 'arccos' ? -1 : 1),
            axis: 'y',
            sets: ['a'],
            to: (_, Y) => ({
              a:
                (Y - k) /
                (u * (fam.family === 'arccos' ? Math.PI : tan ? Math.PI / 4 : Math.PI / 2)),
            }),
          },
        ],
      };
    }
  }
}

/** A piece: its curve, its interval and the condition as written ("x < 1", "1 ≤ x ≤ 3"). */
function pieceOf(
  p: Piece,
  get: Get,
  say: (v: NumOrVar | undefined, fallback: number, pi?: boolean) => string,
  x: string,
) {
  const c = buildCurve(p.f, get, say, x);
  const ends = p.ends ?? '[)';
  const lo = p.from === undefined ? -Infinity : get(p.from, 0);
  const hi = p.to === undefined ? Infinity : get(p.to, 0);
  const loIn = ends[0] === '[';
  const hiIn = ends[1] === ']';
  const L = p.from === undefined ? '' : `${say(p.from, 0)} ${loIn ? '≤' : '<'} `;
  const R = p.to === undefined ? '' : ` ${hiIn ? '≤' : '<'} ${say(p.to, 0)}`;
  const when =
    !L && !R
      ? `all ${x}`
      : !L
        ? `${x}${R}`
        : !R
          ? `${x} ${loIn ? '≥' : '>'} ${say(p.from, 0)}`
          : `${L}${x}${R}`;
  return {
    c,
    lo,
    hi,
    loIn,
    hiIn,
    when,
    has: (t: number) => (t > lo || (loIn && t === lo)) && (t < hi || (hiIn && t === hi)),
  };
}

// ─── Features in a window ──────────────────────────────────────────────────────

export interface Feature extends Pt {
  text?: string;
}

/** The zeros in [lo, hi]: exact when the family gives them, else found numerically. */
export function zerosIn(c: Curve, lo: number, hi: number): Feature[] {
  if (c.zeros)
    return c
      .zeros(lo, hi)
      .filter((z) => z.x >= lo - 1e-9 && z.x <= hi + 1e-9 && Number.isFinite(c.f(z.x)))
      .map((z) => ({ x: z.x, y: 0, text: z.text }));
  const out: Feature[] = [];
  for (const [a, b] of spans(c, lo, hi))
    for (const x of numericZeros(c.f, a, b, 800))
      out.push({ x, y: 0, text: exactText(x, !!c.piX) });
  return out;
}

/** Local maxima and minima in (lo, hi), not at a piece end. */
export function extremaIn(c: Curve, lo: number, hi: number): (Feature & { kind: 'max' | 'min' })[] {
  const out: (Feature & { kind: 'max' | 'min' })[] = [];
  for (const [a, b] of spans(c, lo, hi))
    for (const x0 of criticalPoints(c.f, a, b, 800)) {
      // A turn on the x-axis is a repeated zero: taken at the zero itself, since a flat
      // (x − r)⁴ leaves the numeric search a little off it (H105).
      const z =
        Math.abs(c.f(x0)) < 1e-9 && c.zeros
          ? c
              .zeros(a, b)
              .filter((q) => Math.abs(q.x - x0) < 1e-3 * (hi - lo))
              .sort((p, q) => Math.abs(p.x - x0) - Math.abs(q.x - x0))[0]
          : undefined;
      const x = z ? z.x : x0;
      const y = c.f(x);
      const e = Math.max(1e-4, (hi - lo) * 1e-3);
      const kind = c.f(x - e) < y ? 'max' : 'min';
      out.push({ x, y, kind, text: undefined });
    }
  return out;
}

/** The open intervals of [lo, hi] between breaks, where the curve is one piece. */
export function spans(c: Curve, lo: number, hi: number): [number, number][] {
  const bs = [lo, ...c.breaks(lo, hi).filter((b) => b > lo && b < hi), hi];
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < bs.length; i++) {
    const e = 1e-9 * Math.max(1, Math.abs(bs[i]!), Math.abs(bs[i + 1]!));
    if (bs[i + 1]! - bs[i]! > 2 * e) out.push([bs[i]! + e, bs[i + 1]! - e]);
  }
  return out;
}

/** Where two curves cross in [lo, hi]: f(x) = g(x). */
export function crossings(c: Curve, g: Curve, lo: number, hi: number): Pt[] {
  const d = (x: number) => c.f(x) - g.f(x);
  const joint: Curve = {
    ...c,
    f: d,
    breaks: (a, b) => [...c.breaks(a, b), ...g.breaks(a, b)].sort((p, q) => p - q),
    zeros: undefined,
  };
  return zerosIn(joint, lo, hi).map((z) => ({ x: z.x, y: c.f(z.x) }));
}

// ─── The window ───────────────────────────────────────────────────────────────

const PI_STEPS = [1 / 6, 1 / 3, 1 / 2, 1, 2, 4].map((k) => k * Math.PI);

/** The smallest nice step (1, 2 or 5 × 10ⁿ, or a multiple of π/6) with at most `count` ticks. */
export function niceStep(span: number, count: number, pi = false): number {
  if (pi) return PI_STEPS.find((s) => span / s <= count) ?? niceStep(span, count);
  const raw = span / Math.max(1, count);
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw - 1e-12)!;
}

export interface Window {
  x: [number, number];
  y: [number, number];
  xStep: number;
  yStep: number;
  piX: boolean;
  piY: boolean;
}

/** Ticks from lo to hi at multiples of step. */
export const ticks = (lo: number, hi: number, step: number) => {
  const out: number[] = [];
  for (let n = Math.ceil(lo / step - 1e-9); n * step <= hi + 1e-9 * step; n++) out.push(n * step);
  return out;
};

/** A tick's label: a number, or a multiple of π on a trig axis ("π/2", "2π"). */
export const tickText = (v: number, pi: boolean) =>
  Math.abs(v) < 1e-12
    ? '0'
    : pi
      ? (piText(v) ?? formatNumber(v))
      : formatNumber(Number(v.toPrecision(12)));

/**
 * The window: every x and y of interest in view with a margin, the origin in view, and the
 * curve's sampled values within reason (a curve that climbs away is clipped). Its ends are
 * whole ticks of a nice step for a plot area of pw × ph pixels.
 */
export function chooseWindow(opts: {
  curves: Curve[];
  xs: number[];
  ys: number[];
  pw: number;
  ph: number;
  fixed?: { x?: [number, number]; y?: [number, number] };
  square?: boolean;
  minSpan?: number;
  /** The window's left edge, when the page fixes only that (0 on a time axis). */
  xMin?: number;
}): Window {
  const piX = opts.curves.some((c) => c.piX);
  const piY = opts.curves.some((c) => c.piY);
  const maxX = Math.max(3, Math.floor(opts.pw / 38));
  const maxY = Math.max(3, Math.floor(opts.ph / 26));
  const fit = (
    lo: number,
    hi: number,
    count: number,
    pi: boolean,
    pad: boolean,
  ): [number, number, number] => {
    let span = hi - lo;
    if (!(span > 0)) {
      lo -= 1;
      hi += 1;
      span = 2;
    }
    if (pad) {
      // An edge at 0 stays at 0 (the axis on the frame); others get a margin.
      if (lo !== 0) lo -= span * 0.08;
      if (hi !== 0) hi += span * 0.08;
    }
    const step = niceStep(hi - lo, count, pi);
    return [Math.floor(lo / step + 1e-9) * step, Math.ceil(hi / step - 1e-9) * step, step];
  };
  const finite = (v: number) => Number.isFinite(v);
  // x: the values of interest, the origin, a minimum span.
  let [xl, xh] = opts.fixed?.x ?? [
    Math.min(0, ...opts.xs.filter(finite)),
    Math.max(0, ...opts.xs.filter(finite)),
  ];
  if (opts.xMin !== undefined && !opts.fixed?.x) xl = opts.xMin;
  if (!opts.fixed?.x) {
    const min = opts.minSpan ?? (piX ? 2 * Math.PI : piY ? 3 : 5);
    if (xh - xl < min) {
      const grow = (min - (xh - xl)) / 2;
      // Grow toward the side away from the origin's edge when the values are all one side.
      const mid = (xl + xh) / 2;
      xl = Math.min(xl, mid - min / 2 + (xl === 0 && xh > 0 ? grow * 0.6 : 0));
      xh = Math.max(xh, xl + min);
    }
  }
  if (opts.xMin !== undefined) xl = Math.max(xl, opts.xMin);
  const [x0, x1, xStep] = opts.fixed?.x
    ? [opts.fixed.x[0], opts.fixed.x[1], niceStep(opts.fixed.x[1] - opts.fixed.x[0], maxX, piX)]
    : fit(xl, xh, maxX, piX, true);
  // y: the values of interest and the origin, then the curve within reason.
  let [yl, yh] = [Math.min(0, ...opts.ys.filter(finite)), Math.max(0, ...opts.ys.filter(finite))];
  const base = Math.max(yh - yl, 2);
  const sampled: number[] = [];
  for (const c of opts.curves) {
    const vas = c.vas(x0, x1);
    for (let i = 0; i <= 300; i++) {
      const x = x0 + ((x1 - x0) * i) / 300;
      if (vas.some((v) => Math.abs(x - v) < (x1 - x0) * 0.06)) continue;
      const y = c.f(x);
      if (Number.isFinite(y)) sampled.push(y);
    }
  }
  if (sampled.length) {
    yl = Math.max(Math.min(yl, ...sampled), yl - base * 0.9);
    yh = Math.min(Math.max(yh, ...sampled), yh + base * 0.9);
  }
  if (yh - yl < 4 && !piY) {
    const g = (4 - (yh - yl)) / 2;
    [yl, yh] = [yl - (yl < 0 ? g : 0) - (yl >= 0 && yh <= 0 ? g : 0), yh + g + (yl >= 0 ? g : 0)];
  }
  let [y0, y1, yStep] = opts.fixed?.y
    ? [opts.fixed.y[0], opts.fixed.y[1], niceStep(opts.fixed.y[1] - opts.fixed.y[0], maxY, piY)]
    : fit(yl, yh, maxY, piY, true);
  let [X0, X1, XS] = [x0, x1, xStep];
  if (opts.square) {
    // One unit the same size both ways: grow the shorter side.
    const ratio = opts.ph / opts.pw;
    const lo = Math.min(X0, y0);
    const hi = Math.max(X1, y1);
    X0 = lo;
    X1 = Math.max(hi, lo + (hi - lo) / Math.min(1, ratio));
    y0 = lo;
    y1 = lo + (X1 - X0) * ratio;
    XS = niceStep(X1 - X0, maxX);
    yStep = XS;
    X1 = Math.ceil(X1 / XS - 1e-9) * XS;
    y1 = y0 + (X1 - X0) * ratio;
  }
  return { x: [X0, X1], y: [y0, y1], xStep: XS, yStep, piX, piY };
}

// ─── The spec as numbers ──────────────────────────────────────────────────────

/** A field of the spec's family by path ('h', 'zeros.1.x', 'coefficients.3'). */
export function fieldAt(fam: FunctionFamily, path: string): NumOrVar | undefined {
  let at: unknown = fam;
  for (const part of path.split('.')) {
    if (at === null || typeof at !== 'object') return undefined;
    at = (at as Record<string, unknown>)[part];
  }
  return typeof at === 'number' || typeof at === 'string' ? at : undefined;
}

/** The function the spec draws, from the values (for the harness). */
export function curveOf(
  spec: FunctionFamily | FunctionGraphSpec,
  val: (v: NumOrVar) => number | undefined,
) {
  const get: Get = (v, fallback) => (v === undefined ? fallback : (val(v) ?? fallback));
  const say = (v: NumOrVar | undefined, d: number) => numText(get(v, d));
  // H94: |f(x)|, a horizontal factor and a kept domain, as the picture draws them.
  return 'kind' in spec
    ? reshape(spec, get, say, 'x', (f, x) => buildCurve(f, get, say, x)).curve
    : buildCurve(spec, get, say);
}

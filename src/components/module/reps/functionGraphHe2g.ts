/**
 * HC37 and HC38 (college round 2, group G): the math behind the `functionGraph` options
 * `tangent` (with its slope triangle and the linear approximation), `band` (ε–δ), `series` (a
 * Taylor polynomial over the true f, the gap bracketed, ∫P shaded) and the families `linearOde`
 * (y″ = (cx − ω²)y by RK4) and `taylor` (the polynomial itself). Free of React so the harness
 * checks the same numbers the picture draws. `buildCurve` hands these families here.
 */
import type { FunctionGraphSpec, NumOrVar } from '@/data/modules/typesFunctionGraph';
import type { FamilyHe2g, FunctionGraphHe2g } from '@/data/modules/typesHe2g';
import { formatNumber } from '@/engine/format';

import type { Curve, Get, Interval, Pt, Tok } from './functionGraphMath';

type SayField = (v: NumOrVar | undefined, fallback: number, pi?: boolean) => string;

const MINUS = '−';
const ALL: Interval = { lo: -Infinity, hi: Infinity, loIn: false, hiIn: false };
const none = () => [] as number[];
/** A number for a label or caption: 4 significant figures, the minus sign. */
export const fig4 = (x: number) => formatNumber(Number(x.toPrecision(4)));
/** A number written exactly enough to read a small error: 6 significant figures. */
export const fig6 = (x: number) => formatNumber(Number(x.toPrecision(6)));

// ─── linearOde: y″ = (c·x − ω²)·y ──────────────────────────────────────────────

/** The highest |x| the solution is worked out to (Airy's grows past any window beyond). */
const ODE_REACH = 40;
const ODE_STEP = 0.005;

/**
 * The solution of y″ = (c·x − ω²)·y, y(0) = a₀, y′(0) = a₁: RK4 from 0 out each way on a fine
 * grid, read between grid points by the cubic through y and y′ at both ends (Hermite).
 */
export function odeSolution(a0: number, a1: number, omega: number, c: number) {
  const q = (x: number) => c * x - omega * omega;
  const side = (dir: 1 | -1) => {
    const ys = [a0];
    const ds = [a1];
    let [x, y, d] = [0, a0, a1];
    const h = dir * ODE_STEP;
    const n = Math.round(ODE_REACH / ODE_STEP);
    for (let i = 0; i < n; i++) {
      const k1y = d;
      const k1d = q(x) * y;
      const k2y = d + (h / 2) * k1d;
      const k2d = q(x + h / 2) * (y + (h / 2) * k1y);
      const k3y = d + (h / 2) * k2d;
      const k3d = q(x + h / 2) * (y + (h / 2) * k2y);
      const k4y = d + h * k3d;
      const k4d = q(x + h) * (y + h * k3y);
      y += (h / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
      d += (h / 6) * (k1d + 2 * k2d + 2 * k3d + k4d);
      x += h;
      if (!Number.isFinite(y) || Math.abs(y) > 1e12) break;
      ys.push(y);
      ds.push(d);
    }
    return { ys, ds };
  };
  const pos = side(1);
  const neg = side(-1);
  return (x: number) => {
    const s = x >= 0 ? pos : neg;
    const t = Math.abs(x) / ODE_STEP;
    const i = Math.floor(t);
    if (i + 1 >= s.ys.length) return i < s.ys.length && t === i ? s.ys[i]! : NaN;
    const u = t - i;
    const sign = x >= 0 ? 1 : -1;
    const [y0, y1] = [s.ys[i]!, s.ys[i + 1]!];
    const [m0, m1] = [s.ds[i]! * sign * ODE_STEP, s.ds[i + 1]! * sign * ODE_STEP];
    const u2 = u * u;
    const u3 = u2 * u;
    return (
      (2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * y1 + (u3 - u2) * m1
    );
  };
}

// ─── Taylor polynomials ────────────────────────────────────────────────────────

const MAX_DEGREE = 40;
const factorial = (k: number) => {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return f;
};

/** The first coefficients of a named Maclaurin series (`ode`: from y″ = (cx − ω²)y). */
export function maclaurin(
  of: NonNullable<NonNullable<FunctionGraphHe2g['series']>['of']>,
  ode?: { a0: number; a1: number; omega: number; c: number },
): number[] {
  const cs: number[] = [];
  for (let k = 0; k <= MAX_DEGREE; k++) {
    switch (of) {
      case 'exp':
        cs.push(1 / factorial(k));
        break;
      case 'sin':
        cs.push(k % 2 ? (-1) ** ((k - 1) / 2) / factorial(k) : 0);
        break;
      case 'cos':
        cs.push(k % 2 ? 0 : (-1) ** (k / 2) / factorial(k));
        break;
      case 'expNegSq':
        cs.push(k % 2 ? 0 : (-1) ** (k / 2) / factorial(k / 2));
        break;
      case 'ln1p':
        cs.push(k === 0 ? 0 : (-1) ** (k + 1) / k);
        break;
      case 'geometric':
        cs.push(1);
        break;
      case 'ode': {
        const o = ode ?? { a0: 0, a1: 0, omega: 0, c: 0 };
        if (k === 0) cs.push(o.a0);
        else if (k === 1) cs.push(o.a1);
        else {
          // a(n+2) = (c·a(n−1) − ω²·a(n)) ÷ ((n + 2)(n + 1)), n = k − 2.
          const n = k - 2;
          cs.push(((n >= 1 ? o.c * cs[n - 1]! : 0) - o.omega ** 2 * cs[n]!) / ((n + 2) * (n + 1)));
        }
        break;
      }
    }
  }
  return cs;
}

/** Σ cₖ(x − a)ᵏ. */
export const polyAtCenter = (cs: number[], a: number) => (x: number) => {
  let s = 0;
  for (let k = cs.length - 1; k >= 0; k--) s = s * (x - a) + cs[k]!;
  return s;
};

/** The series' coefficients (c₀ first) and center, cut to its degree or its nonzero terms. */
export function seriesOf(
  spec: FunctionGraphSpec,
  get: Get,
): { a: number; cs: number[] } | undefined {
  const s = spec.series;
  if (!s) return undefined;
  let cs: number[];
  if (s.coefficients) cs = s.coefficients.map((c) => get(c, 0));
  else if (s.derivatives) cs = s.derivatives.map((d, k) => get(d, 0) / factorial(k));
  else if (s.of) {
    const ode =
      spec.family === 'linearOde'
        ? {
            a0: get(spec.a0, 1),
            a1: get(spec.a1, 0),
            omega: get(spec.omega, 0),
            c: get(spec.c, 0),
          }
        : undefined;
    cs = maclaurin(s.of, ode);
  } else return undefined;
  if (s.degree !== undefined) cs = cs.slice(0, Math.max(0, Math.round(get(s.degree, 3))) + 1);
  else if (s.terms !== undefined) {
    const want = Math.max(1, Math.round(get(s.terms, 3)));
    let seen = 0;
    let end = cs.length;
    for (let k = 0; k < cs.length; k++)
      if (cs[k] !== 0 && ++seen === want) {
        end = k + 1;
        break;
      }
    cs = cs.slice(0, end);
  }
  return { a: get(s.center, 0), cs };
}

/** ∫ from p to q of Σ cₖ(x − a)ᵏ, term by term. */
export function polyIntegral(cs: number[], a: number, p: number, q: number) {
  let s = 0;
  cs.forEach((c, k) => {
    s += (c * ((q - a) ** (k + 1) - (p - a) ** (k + 1))) / (k + 1);
  });
  return s;
}

/** A polynomial as written: "1 + x + 0.5x² + 0.1667x³", "2 − (x − 1) + 2(x − 1)²". */
export function polyText(cs: number[], a: number, x: string): Tok[] {
  const toks: Tok[] = [];
  const base = a === 0 ? x : `(${x} ${a < 0 ? '+' : MINUS} ${fig4(Math.abs(a))})`;
  const push = (t: string, sup = false) => {
    const last = toks[toks.length - 1] as { t: string; sup?: boolean } | undefined;
    if (last && 't' in last && !!last.sup === sup) last.t += t;
    else toks.push(sup ? { t, sup: true } : { t });
  };
  let first = true;
  cs.forEach((c, k) => {
    if (c === 0) return;
    const neg = c < 0;
    const m = Math.abs(c);
    push(first ? (neg ? MINUS : '') : neg ? ` ${MINUS} ` : ' + ');
    const coef = k > 0 && Math.abs(m - 1) < 1e-12 ? '' : fig4(m);
    push(coef);
    if (k > 0) push(base);
    if (k > 1) push(String(k), true);
    first = false;
  });
  if (first) push('0');
  return toks;
}

// ─── The families ──────────────────────────────────────────────────────────────

export function buildHe2g(fam: FamilyHe2g, get: Get, say: SayField, x: string): Curve {
  const base = {
    family: fam.family,
    has: [] as number[],
    holes: [] as Pt[],
    ends: [] as (Pt & { closed: boolean })[],
    vas: none as (lo: number, hi: number) => number[],
    handles: [],
    breaks: none as (lo: number, hi: number) => number[],
    domain: [ALL],
  };
  const side = (f: (x: number) => number) => (c: number) => f(c);
  if (fam.family === 'linearOde') {
    const [a0, a1, w, c] = [get(fam.a0, 1), get(fam.a1, 0), get(fam.omega, 0), get(fam.c, 0)];
    const f = odeSolution(a0, a1, w, c);
    const [ws, cs] = [say(fam.omega, 0), say(fam.c, 0)];
    const rhs =
      c === 0 && cs !== '?'
        ? `${MINUS}${w === 1 && ws !== '?' ? '' : `${ws}²`}y`
        : w === 0 && ws !== '?'
          ? `${c === 1 && cs !== '?' ? '' : cs}${x}y`
          : `(${cs}${x} ${MINUS} ${ws}²)y`;
    return {
      ...base,
      f,
      side: side(f),
      key: { x: 0, y: a0, what: 'point' },
      text: [{ t: `solution of y″ = ${rhs}` }],
    };
  }
  const a = get(fam.center, 0);
  const cs = fam.coefficients
    ? fam.coefficients.map((v) => get(v, 0))
    : (fam.derivatives ?? []).map((d, k) => get(d, 0) / factorial(k));
  const f = polyAtCenter(cs, a);
  return {
    ...base,
    f,
    side: side(f),
    key: { x: a, y: f(a), what: 'point' },
    degree: cs.length - 1,
    text: polyText(cs, a, x),
  };
}

// ─── The options as numbers ───────────────────────────────────────────────────

/** The slope at x: a central difference of the drawn f (the check's own rule). */
export const slopeAt = (f: (x: number) => number, x: number) => {
  const e = 1e-6 * Math.max(1, Math.abs(x));
  return (f(x + e) - f(x - e)) / (2 * e);
};

/** The tangent's point, slope and (with `at`) the linear approximation there. */
export function tangentOf(spec: FunctionGraphSpec, main: Curve, get: Get) {
  const t = spec.tangent;
  if (!t) return undefined;
  const x = get(t.x, 0);
  const y = main.f(x);
  const m = slopeAt(main.f, x);
  if (![y, m].every(Number.isFinite)) return undefined;
  const at = t.at === undefined ? undefined : get(t.at, x);
  return {
    x,
    y,
    m,
    at,
    L: at === undefined ? undefined : y + m * (at - x),
    fAt: at === undefined ? undefined : main.f(at),
  };
}

/** The band's numbers: a, L, δ, ε. */
export function bandOf(spec: FunctionGraphSpec, get: Get) {
  const b = spec.band;
  if (!b) return undefined;
  return {
    x: get(b.x, 0),
    y: get(b.y, 0),
    dx: Math.abs(get(b.dx, 0.1)),
    dy: Math.abs(get(b.dy, 0.1)),
  };
}

/** The series' numbers at its x: P(x), f(x), the error; and the shaded integral. */
export function seriesNumbers(spec: FunctionGraphSpec, main: Curve, get: Get) {
  const s = seriesOf(spec, get);
  if (!s || !spec.series) return undefined;
  const P = polyAtCenter(s.cs, s.a);
  const x = spec.series.x === undefined ? undefined : get(spec.series.x, s.a);
  const I = spec.series.integral;
  const from = I ? get(I.from, 0) : undefined;
  const to = I ? get(I.to, 1) : undefined;
  return {
    ...s,
    P,
    x,
    Px: x === undefined ? undefined : P(x),
    fx: x === undefined ? undefined : main.f(x),
    from,
    to,
    integral:
      from !== undefined && to !== undefined ? polyIntegral(s.cs, s.a, from, to) : undefined,
  };
}

// ─── The window ────────────────────────────────────────────────────────────────

/** The x values these options need in view. */
export function he2gXs(spec: FunctionGraphSpec, main: Curve, get: Get): number[] {
  const xs: number[] = [];
  const t = tangentOf(spec, main, get);
  if (t) xs.push(t.x - 1.5, t.x + 1.5, ...(t.at === undefined ? [] : [t.at]));
  const s = seriesNumbers(spec, main, get);
  if (s) {
    xs.push(s.a);
    if (s.x !== undefined) xs.push(s.x, 2 * s.a - s.x, s.x + 0.4 * Math.abs(s.x - s.a) + 0.5);
    if (s.from !== undefined && s.to !== undefined) xs.push(s.from, s.to, s.to + 0.6);
  }
  if (spec.family === 'linearOde') xs.push(-3, 3);
  return xs.filter(Number.isFinite);
}

/** The y values these options need in view. */
export function he2gYs(spec: FunctionGraphSpec, main: Curve, get: Get): number[] {
  const ys: number[] = [];
  const t = tangentOf(spec, main, get);
  if (t) ys.push(t.y, ...(t.L === undefined ? [] : [t.L]));
  const s = seriesNumbers(spec, main, get);
  if (s) {
    ys.push(s.P(s.a));
    if (s.Px !== undefined) ys.push(s.Px);
    if (s.fx !== undefined) ys.push(s.fx);
  }
  return ys.filter((v) => Number.isFinite(v) && Math.abs(v) < 1e6);
}

/** HC37: the ε–δ picture zooms to its bands (3 bands each way), unless the page fixes a window. */
export function he2gWindow(
  spec: FunctionGraphSpec,
  get: Get,
): { x?: [number, number]; y?: [number, number] } | undefined {
  const b = bandOf(spec, get);
  if (!b || !(b.dx > 0) || !(b.dy > 0)) return undefined;
  return { x: [b.x - 3 * b.dx, b.x + 3 * b.dx], y: [b.y - 3 * b.dy, b.y + 3 * b.dy] };
}

// ─── The caption ───────────────────────────────────────────────────────────────

/** The caption's lines for the options (when every value is typed). */
export function he2gCaption(
  spec: FunctionGraphSpec,
  main: Curve,
  get: Get,
  xName: string,
  fName: string,
): string[] {
  const out: string[] = [];
  if (spec.family === 'linearOde')
    out.push(
      `Starting from y(0) = ${fig4(get(spec.a0, 1))}, y′(0) = ${fig4(get(spec.a1, 0))}; solid: worked out numerically`,
    );
  const t = tangentOf(spec, main, get);
  if (t) {
    const b = t.y - t.m * t.x;
    out.push(
      `Tangent at ${xName} = ${fig4(t.x)}: slope ${fName}′(${fig4(t.x)}) = ${fig4(t.m)}, y = ${fig4(t.m)}${xName} ${b < 0 ? MINUS : '+'} ${fig4(Math.abs(b))}`,
    );
    if (t.at !== undefined && t.L !== undefined && t.fAt !== undefined)
      out.push(
        `Linear approximation L(${fig6(t.at)}) = ${fig6(t.L)}; the true ${fName}(${fig6(t.at)}) = ${fig6(t.fAt)}, off by ${fig4(Math.abs(t.fAt - t.L))}`,
      );
  }
  const b = bandOf(spec, get);
  if (b) {
    const lo = main.f(b.x - b.dx);
    const hi = main.f(b.x + b.dx);
    const inside = [lo, hi].every((v) => Math.abs(v - b.y) <= b.dy * (1 + 1e-9));
    out.push(
      `Within δ = ${fig4(b.dx)} of ${xName} = ${fig4(b.x)}, ${fName} stays within ε = ${fig4(b.dy)} of ${fig4(b.y)}${inside ? '' : ' only partly: δ is too wide'} (${fName}(${fig4(b.x - b.dx)}) = ${fig4(lo)}, ${fName}(${fig4(b.x + b.dx)}) = ${fig4(hi)})`,
    );
  }
  const s = seriesNumbers(spec, main, get);
  if (s) {
    const n = s.cs.length - 1;
    out.push(`Dashed: the degree-${n} Taylor polynomial about ${xName} = ${fig4(s.a)}`);
    if (s.x !== undefined && s.Px !== undefined && s.fx !== undefined)
      out.push(
        `At ${xName} = ${fig4(s.x)}: P = ${fig6(s.Px)}, ${fName} = ${fig6(s.fx)}, error |${fName} − P| = ${fig4(Math.abs(s.fx - s.Px))}`,
      );
    if (s.integral !== undefined)
      out.push(
        `∫ from ${fig4(s.from!)} to ${fig4(s.to!)} of P d${xName} = ${fig6(s.integral)}, term by term`,
      );
  }
  return out;
}

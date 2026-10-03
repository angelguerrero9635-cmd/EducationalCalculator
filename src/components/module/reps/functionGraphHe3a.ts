/**
 * HC42, HC45 and HC92 (college round 3, group A): the math behind the `functionGraph` families
 * `distribution` (Maxwell's speeds, Planck's curves, the three occupancies), `quantizer` (an
 * ADC's or a DAC's staircase) and `lagrange`, and the options `newton`, `bisect`, `steps` (Euler,
 * Heun, RK4; Euler is `eulerSteps` from fieldPlotMath), `through` and the riemann sides
 * 'trapezoid' and 'simpson'. Free of React so the harness checks the same numbers the picture
 * draws. `buildCurve` hands these families here.
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { FunctionGraphSpec } from '@/data/modules/typesFunctionGraph';
import type {
  DistributionHe3a,
  FamilyHe3a,
  NodeHe3a,
  QuantizerHe3a,
  StepMethodHe3a,
} from '@/data/modules/typesHe3a';
import type { FunctionGraphHs3b } from '@/data/modules/typesHs3b';
import { formatNumber } from '@/engine/format';

import { eulerSteps, fieldFn, type Vec } from './fieldPlotMath';
import { polyText, slopeAt } from './functionGraphHe2g';
import {
  niceStep,
  type Curve,
  type Get,
  type Interval,
  type Pt,
  type Tok,
} from './functionGraphMath';

const MINUS = '−';
const ALL: Interval = { lo: -Infinity, hi: Infinity, loIn: false, hiIn: false };
const none = () => [] as number[];
/** A number for a label or caption: 4 significant figures, the minus sign. */
export const fig4 = (x: number) => formatNumber(Number(x.toPrecision(4)));
/** 6 significant figures (an iterate, a sum). */
export const fig6 = (x: number) => formatNumber(Number(x.toPrecision(6)));
const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** k as subscript digits: 12 → ₁₂. */
export const subNum = (k: number) => [...String(k)].map((d) => SUB[Number(d)] ?? d).join('');

// ─── Defaults: the plans' values, used only when a page passes none ──────────────

/** J/(mol·K). */
export const R_DEFAULT = 8.314;
/** eV/K. */
export const KB_DEFAULT = 8.617e-5;
/** Wien's constant, μm·K. */
export const WIEN_DEFAULT = 2898;
/** Planck's radiation constants: C₁ = 2πhc² (W·μm⁴/m²) and C₂ = hc ÷ k (μm·K). */
const C1 = 3.7418e8;
const C2 = 1.4388e4;
/** The visible band, μm. */
export const VISIBLE: [number, number] = [0.38, 0.75];

// ─── HC42: distributions ──────────────────────────────────────────────────────

type Maxwell = Extract<DistributionHe3a, { distribution: 'maxwell' }>;
type Planck = Extract<DistributionHe3a, { distribution: 'planck' }>;
type Occupancy = Extract<DistributionHe3a, { distribution: 'occupancy' }>;

/** Maxwell's f(v) (per m/s) and its three speeds for M in g/mol, T in K. */
export function maxwellOf(molar: number, T: number, R: number) {
  const M = molar / 1000;
  const a = M / (2 * R * T);
  const f = (v: number) =>
    v < 0 ? NaN : 4 * Math.PI * (a / Math.PI) ** 1.5 * v * v * Math.exp(-a * v * v);
  const vp = Math.sqrt((2 * R * T) / M);
  const avg = Math.sqrt((8 * R * T) / (Math.PI * M));
  const rms = Math.sqrt((3 * R * T) / M);
  return { f, vp, avg, rms, peak: f(vp) };
}

export const maxwellNumbers = (fam: Maxwell, get: Get) => {
  const R = get(fam.R, R_DEFAULT);
  const main = maxwellOf(get(fam.molar, 28), get(fam.T, 300), R);
  const cmp = fam.compare
    ? maxwellOf(get(fam.compare.molar ?? fam.molar, 28), get(fam.compare.T ?? fam.T, 300), R)
    : undefined;
  return { ...main, cmp, scale: fam.yScale ?? 1000 };
};

/** Wien's b = C₂ ÷ 4.965114… (the root of 5(1 − e⁻ˣ) = x). */
export const WIEN_ROOT = 4.965114231744276;

/**
 * Planck's E_bλ in W/(m²·μm) at λ in μm. C₂ follows the page's Wien constant (C₂ = b × 4.9651),
 * so the curve's peak is always the page's b ÷ T.
 */
export const planckAt = (lambda: number, T: number, b = C2 / WIEN_ROOT) =>
  lambda > 0 && T > 0 ? C1 / (lambda ** 5 * (Math.exp((b * WIEN_ROOT) / (lambda * T)) - 1)) : NaN;

export const planckNumbers = (fam: Planck, get: Get) => {
  const per = fam.unit === 'nm' ? 1000 : 1;
  const b = get(fam.wien, WIEN_DEFAULT);
  const Ts = [get(fam.T, 5800), ...(fam.others ?? []).map((t) => get(t, 3000))];
  return {
    per,
    b,
    Ts,
    scale: fam.yScale ?? 1e-6,
    /** λ_max in the axis unit for each T. */
    peaks: Ts.map((T) => (b / T) * per),
    /** The curve for T in the axis unit (x in μm or nm, y scaled). */
    curve: (T: number) => (x: number) => planckAt(x / per, T, b) * (fam.yScale ?? 1e-6),
  };
};

/** The three occupancies at x = (E − μ) ÷ k_BT. */
export const fd = (x: number) => 1 / (Math.exp(x) + 1);
export const be = (x: number) => (x > 0 ? 1 / Math.expm1(x) : NaN);
export const mb = (x: number) => Math.exp(-x);

/** The point's x: from `x`, or (E − μ) ÷ k_BT. Undefined when neither is given. */
export function occupancyX(fam: Occupancy, get: Get): number | undefined {
  if (fam.x !== undefined) return get(fam.x, 1);
  if (fam.energy === undefined || fam.T === undefined) return undefined;
  return get(fam.energy, 0.05) / (get(fam.kB, KB_DEFAULT) * get(fam.T, 300));
}

// ─── HC92: the quantizer ──────────────────────────────────────────────────────

/** The most steps drawn whole; past it a zoom of this many codes round the lit one. */
export const ZOOM = 16;

export function quantizerNumbers(
  fam: QuantizerHe3a,
  get: Get,
  known: (v: NumOrVar | undefined) => boolean = () => true,
) {
  const n = Math.max(1, Math.min(24, Math.round(get(fam.bits, 8))));
  const levels = 2 ** n;
  const vref = get(fam.vref, 5);
  const lsb = vref / levels;
  const dac = fam.mode === 'dac';
  const round = fam.rounding === 'round';
  const codeOf = (v: number) =>
    Math.max(0, Math.min(levels - 1, round ? Math.round(v / lsb) : Math.floor(v / lsb + 1e-9)));
  // The lit code: from V_in (adc) or typed (dac); none while it reads "?".
  let D: number | undefined;
  let vin: number | undefined;
  if (dac) {
    if (fam.code !== undefined && known(fam.code))
      D = Math.max(0, Math.min(levels - 1, Math.round(get(fam.code, 0))));
  } else if (fam.vin !== undefined && known(fam.vin)) {
    vin = get(fam.vin, 0);
    D = codeOf(vin);
  }
  const zoomed = levels > ZOOM;
  const c0 = zoomed ? Math.max(0, Math.min(levels - ZOOM, (D ?? 0) - ZOOM / 2 + 1)) : 0;
  const c1 = zoomed ? c0 + ZOOM : levels;
  return {
    n,
    levels,
    vref,
    lsb,
    dac,
    round,
    D,
    vin,
    back: D === undefined ? undefined : D * lsb,
    codeOf,
    c0,
    c1,
    zoomed,
  };
}

// ─── HC45: Lagrange ───────────────────────────────────────────────────────────

/** The polynomial through the nodes (Lagrange's form); NaN when two share an x. */
export function lagrangeFn(nodes: Pt[]): (x: number) => number {
  return (x) => {
    let s = 0;
    for (let i = 0; i < nodes.length; i++) {
      let w = nodes[i]!.y;
      for (let j = 0; j < nodes.length; j++)
        if (j !== i) w *= (x - nodes[j]!.x) / (nodes[i]!.x - nodes[j]!.x);
      s += w;
    }
    return s;
  };
}

/** The interpolating polynomial's coefficients, c₀ first (expanded from Lagrange's form). */
export function lagrangeCoefficients(nodes: Pt[]): number[] {
  const n = nodes.length;
  const cs = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    let term = [nodes[i]!.y];
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const d = nodes[i]!.x - nodes[j]!.x;
      // term × (x − xⱼ) ÷ d
      const next = new Array<number>(term.length + 1).fill(0);
      term.forEach((c, k) => {
        next[k + 1]! += c / d;
        next[k]! -= (c * nodes[j]!.x) / d;
      });
      term = next;
    }
    term.forEach((c, k) => (cs[k]! += c));
  }
  return cs.map((c) => (Math.abs(c) < 1e-12 ? 0 : c));
}

export const nodesOf = (ns: NodeHe3a[] | undefined, get: Get): Pt[] =>
  (ns ?? []).map((n) => ({ x: get(n.x, 0), y: get(n.y, 0) }));

// ─── The families as curves ───────────────────────────────────────────────────

const t = (s: string, extra?: { sup?: boolean; sub?: boolean }): Tok => ({ t: s, ...extra });

export function buildHe3a(
  fam: FamilyHe3a,
  get: Get,
  say: (v: NumOrVar | undefined, d: number) => string,
  x: string,
): Curve {
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
  if (fam.family === 'lagrange') {
    const f = lagrangeFn(nodesOf(fam.through, get));
    return {
      ...base,
      f,
      side: side(f),
      degree: Math.max(0, fam.through.length - 1),
      // A node still "?": no numbers in the formula.
      text: fam.through.some((n) => say(n.x, 0) === '?' || say(n.y, 0) === '?')
        ? [t('the polynomial through the nodes')]
        : polyText(lagrangeCoefficients(nodesOf(fam.through, get)), 0, x),
    };
  }
  if (fam.family === 'quantizer') {
    const q = quantizerNumbers(fam, get);
    // The treads: jumps at each code boundary (a cap, so a wide probe isn't split a million ways).
    const breaks = (lo: number, hi: number) => {
      const step = q.dac ? 1 : q.lsb;
      const off = q.dac ? 0 : q.round ? q.lsb / 2 : 0;
      const k0 = Math.ceil((lo - off) / step);
      const k1 = Math.floor((hi - off) / step);
      if (k1 - k0 > 64) return [];
      const out: number[] = [];
      for (let k = k0; k <= k1; k++) out.push(off + k * step);
      return out;
    };
    const f = q.dac
      ? (c: number) => (c < 0 || c >= q.levels ? NaN : Math.floor(c + 1e-9) * q.lsb)
      : (v: number) => (v < 0 || v >= q.vref ? NaN : q.codeOf(v));
    return {
      ...base,
      f,
      side: side(f),
      breaks,
      domain: [{ lo: 0, hi: q.dac ? q.levels : q.vref, loIn: true, hiIn: false }],
      text: q.dac
        ? [t(`${say(fam.vref, 5)} × ⌊${x}⌋ ÷ 2`), t(say(fam.bits, 8), { sup: true })]
        : [
            t(`⌊${x} ÷ LSB⌋${q.round ? ', rounded' : ''}, LSB = ${say(fam.vref, 5)} ÷ 2`),
            t(say(fam.bits, 8), { sup: true }),
          ],
    };
  }
  if (fam.distribution === 'maxwell') {
    const m = maxwellNumbers(fam, get);
    const f = (v: number) => m.f(v) * m.scale;
    const who = fam.gas ?? `${say(fam.molar, 28)} g/mol`;
    return {
      ...base,
      f,
      side: side(f),
      domain: [{ lo: 0, hi: Infinity, loIn: true, hiIn: false }],
      text: [t(`Maxwell, ${who}, ${say(fam.T, 300)} K`)],
    };
  }
  if (fam.distribution === 'planck') {
    const p = planckNumbers(fam, get);
    const f = p.curve(p.Ts[0]!);
    return {
      ...base,
      f,
      side: side(f),
      domain: [{ lo: 0, hi: Infinity, loIn: false, hiIn: false }],
      text: [t(`Planck, a blackbody at ${say(fam.T, 5800)} K`)],
    };
  }
  return {
    ...base,
    f: fd,
    side: side(fd),
    text: [t('1 ÷ (e'), t(x, { sup: true }), t(' + 1), Fermi–Dirac')],
  };
}

// ─── HC45: the methods' numbers ───────────────────────────────────────────────

/** Newton's iterates x₀, x₁, …, xₖ (stopped early where f′ is 0 or the step runs off). */
export function newtonIterates(f: (x: number) => number, x0: number, steps: number): number[] {
  const xs = [x0];
  for (let i = 0; i < Math.min(12, Math.max(0, Math.round(steps))); i++) {
    const x = xs[i]!;
    const d = slopeAt(f, x);
    const next = x - f(x) / d;
    if (!Number.isFinite(next) || d === 0) break;
    xs.push(next);
  }
  return xs;
}

/** Bisection's brackets [a, b] with each midpoint and the sign of f there. */
export function bisectBrackets(f: (x: number) => number, a0: number, b0: number, steps: number) {
  const out: { a: number; b: number; m: number; fm: number }[] = [];
  let [a, b] = [a0, b0];
  for (let i = 0; i < Math.min(10, Math.max(1, Math.round(steps))); i++) {
    const m = (a + b) / 2;
    const fm = f(m);
    out.push({ a, b, m, fm });
    if (fm === 0 || !Number.isFinite(fm)) break;
    if (Math.sign(fm) === Math.sign(f(a))) a = m;
    else b = m;
  }
  return out;
}

/** An ODE solver's n + 1 points from (x₀, y₀). Euler is fieldPlotMath's `eulerSteps`. */
export function odePoints(
  method: StepMethodHe3a,
  g: (x: number, y: number) => number,
  x0: number,
  y0: number,
  h: number,
  n: number,
): Vec[] {
  if (method === 'euler') return eulerSteps(g, x0, y0, h, n);
  const out: Vec[] = [[x0, y0]];
  let y = y0;
  for (let i = 0; i < Math.min(200, Math.max(0, Math.round(n))); i++) {
    const x = x0 + i * h;
    const k1 = g(x, y);
    if (method === 'heun') {
      const k2 = g(x + h, y + h * k1);
      y += (h / 2) * (k1 + k2);
    } else {
      const k2 = g(x + h / 2, y + (h / 2) * k1);
      const k3 = g(x + h / 2, y + (h / 2) * k2);
      const k4 = g(x + h, y + h * k3);
      y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    }
    if (!Number.isFinite(y)) break;
    out.push([x0 + (i + 1) * h, y]);
  }
  return out;
}

export function stepsOf(spec: FunctionGraphSpec, get: Get): Vec[] | undefined {
  const s = spec.steps;
  if (!s) return undefined;
  return odePoints(
    s.method,
    fieldFn(s.dy, get),
    get(s.x0, 0),
    get(s.y0, 1),
    get(s.h, 0.1),
    get(s.n, 1),
  );
}

// ─── HC45: the trapezoid and Simpson's rule (riemann sides) ────────────────────

type RiemannSpec = NonNullable<FunctionGraphHs3b['riemann']>;

export const isQuadrature = (r: { side?: string }) =>
  r.side === 'trapezoid' || r.side === 'simpson';

/**
 * The panels as `riemannOf` gives strips: each one's left edge, width and mean height (so the
 * sum is Σ y·w); Simpson's panels are pairs, n even (an odd n is raised by one).
 */
export function quadratureOf(r: RiemannSpec, f: (x: number) => number, get: Get) {
  let n = Math.max(1, Math.round(get(r.n, 4)));
  if (r.side === 'simpson' && n % 2) n += 1;
  const [a, b] = [get(r.from, 0), get(r.to, 1)];
  const w = (b - a) / n;
  const m = Math.min(n, 5000);
  const strips: { x: number; w: number; y: number }[] = [];
  if (r.side === 'simpson')
    for (let i = 0; i + 1 < m; i += 2) {
      const x = a + i * w;
      strips.push({ x, w: 2 * w, y: (f(x) + 4 * f(x + w) + f(x + 2 * w)) / 6 });
    }
  else
    for (let i = 0; i < m; i++) {
      const x = a + i * w;
      strips.push({ x, w, y: (f(x) + f(x + w)) / 2 });
    }
  const sum = strips.reduce((s, q) => s + q.y * q.w, 0);
  return { n, a, b, w, strips, sum };
}

// ─── The window ────────────────────────────────────────────────────────────────

const roundUp = (v: number, count: number) => {
  const s = niceStep(v, count);
  return Math.ceil(v / s - 1e-9) * s;
};
/** An x end past the last tick, so its label (2,000 m/s) keeps inside the frame. */
const roomy = (v: number, count: number) => roundUp(v, count) + 0.3 * niceStep(v, count);

/** The distributions and the quantizer fix their own window (speeds in m/s, codes, μm). */
export function he3aWindow(
  spec: FunctionGraphSpec,
  get: Get,
  known: (v: NumOrVar | undefined) => boolean = () => true,
  main?: Curve,
): { x?: [number, number]; y?: [number, number] } | undefined {
  // Newton and bisection zoom to the iterates or the bracket (the cubic's wide view hides them).
  const zoom = (lo0: number, hi0: number, below = 0) => {
    let [lo, hi] = [lo0, hi0];
    if (!main || !(hi > lo)) return undefined;
    // Ends on whole ticks (the first tick's label gives way to the corner).
    const st = niceStep(hi - lo, 6);
    [lo, hi] = [Math.floor(lo / st + 1e-9) * st, Math.ceil(hi / st - 1e-9) * st];
    const ys = Array.from({ length: 81 }, (_, i) => main.f(lo + ((hi - lo) * i) / 80)).filter(
      Number.isFinite,
    );
    if (!ys.length) return undefined;
    let [y0, y1] = [Math.min(0, ...ys), Math.max(0, ...ys)];
    const span = y1 - y0 || 1;
    [y0, y1] = [y0 - span * (0.08 + below), y1 + span * 0.08];
    return { x: [lo, hi] as [number, number], y: [y0, y1] as [number, number] };
  };
  if (spec.newton && main) {
    const it = newtonIterates(main.f, get(spec.newton.x0, 1), get(spec.newton.steps, 1));
    const [a, b] = [Math.min(...it), Math.max(...it)];
    const pad = Math.max(0.5, (b - a) * 0.8);
    return zoom(a - pad, b + pad);
  }
  if (spec.bisect && main) {
    const [a, b] = [get(spec.bisect.a, 0), get(spec.bisect.b, 1)];
    const pad = Math.abs(b - a) * 0.4;
    return zoom(Math.min(a, b) - pad, Math.max(a, b) + pad, 0.45);
  }
  if (spec.family === 'distribution') {
    if (spec.distribution === 'maxwell') {
      const m = maxwellNumbers(spec, get);
      const vp = Math.max(m.vp, m.cmp?.vp ?? 0);
      const peak = Math.max(m.peak, m.cmp?.peak ?? 0) * m.scale;
      return { x: [0, roomy(2.6 * vp, 5)], y: [0, roundUp(1.18 * peak, 4)] };
    }
    if (spec.distribution === 'planck') {
      const p = planckNumbers(spec, get);
      const far = Math.max(...p.peaks) * 4.2;
      const top = Math.max(...p.Ts.map((T, i) => p.curve(T)(p.peaks[i]!)));
      return { x: [0, roomy(far, 5)], y: [0, roundUp(1.18 * top, 4)] };
    }
    const x = occupancyX(spec, get);
    const hi = x === undefined ? 6 : Math.max(6, Math.ceil(x + 1));
    const beAt = x !== undefined && x > 0 ? be(x) : 0;
    return { x: [-3, hi], y: [0, Math.min(6, Math.max(2, Math.ceil(beAt * 1.15 * 2) / 2))] };
  }
  if (spec.family === 'quantizer') {
    const q = quantizerNumbers(spec, get, known);
    return q.dac
      ? { x: [q.c0, q.c1], y: [q.c0 * q.lsb, q.c1 * q.lsb] }
      : { x: [q.c0 * q.lsb, q.c1 * q.lsb], y: [q.c0, q.c1] };
  }
  return undefined;
}

/** The x values the numerical methods need in view. */
export function he3aXs(spec: FunctionGraphSpec, main: Curve, get: Get): number[] {
  const xs: number[] = [];
  if (spec.newton)
    xs.push(...newtonIterates(main.f, get(spec.newton.x0, 1), get(spec.newton.steps, 1)));
  if (spec.bisect) xs.push(get(spec.bisect.a, 0), get(spec.bisect.b, 1));
  const st = stepsOf(spec, get);
  if (st) xs.push(...st.map((p) => p[0]));
  xs.push(...nodesOf(spec.through, get).map((p) => p.x));
  return xs.filter((v) => Number.isFinite(v) && Math.abs(v) < 60);
}

/** The y values the numerical methods need in view. */
export function he3aYs(spec: FunctionGraphSpec, main: Curve, get: Get): number[] {
  const ys: number[] = [];
  if (spec.newton) {
    const it = newtonIterates(main.f, get(spec.newton.x0, 1), get(spec.newton.steps, 1));
    ys.push(...it.map((x) => main.f(x)));
  }
  if (spec.bisect) {
    const [a, b] = [get(spec.bisect.a, 0), get(spec.bisect.b, 1)];
    const fs = [main.f(a), main.f(b), main.f((a + b) / 2)].filter(Number.isFinite);
    const lo = Math.min(0, ...fs);
    const hi = Math.max(0, ...fs);
    // Room under the curve for the stacked brackets.
    ys.push(lo - 0.45 * (hi - lo), hi);
  }
  const st = stepsOf(spec, get);
  if (st) ys.push(...st.map((p) => p[1]));
  ys.push(...nodesOf(spec.through, get).map((p) => p.y));
  return ys.filter((v) => Number.isFinite(v) && Math.abs(v) < 1e6);
}

// ─── The caption ───────────────────────────────────────────────────────────────

const unitOf = (spec: Planck) => (spec.unit === 'nm' ? 'nm' : 'μm');

/** The solver's error as a percent, or "far off" past 1000% (an unstable step). */
const offBy = (y: number, exact: number) => {
  const pc = (Math.abs(y - exact) / Math.abs(exact)) * 100;
  return pc > 1000 ? ', far off: the steps run away from it' : `, off by ${fig4(pc)}%`;
};

/** The caption's lines (the page's values are typed or worked out). */
export function he3aCaption(
  spec: FunctionGraphSpec,
  main: Curve,
  get: Get,
  known: (v: NumOrVar | undefined) => boolean,
  xName: string,
  fName: string,
): string[] {
  const out: string[] = [];
  if (spec.family === 'distribution' && spec.distribution === 'maxwell') {
    const m = maxwellNumbers(spec, get);
    if ([spec.molar, spec.T].every(known))
      out.push(
        `Most probable vₚ = ${fig4(m.vp)} m/s < mean ⟨v⟩ = ${fig4(m.avg)} m/s < rms vᵣₘₛ = ${fig4(m.rms)} m/s; the area under the curve is 1`,
      );
    const c = spec.compare;
    if (c && m.cmp && [c.molar, c.T].every((v) => v === undefined || known(v)))
      out.push(
        `Dashed: ${c.gas ?? (c.molar === undefined ? 'the same gas' : `M = ${fig4(get(c.molar, 28))} g/mol`)} at ${c.T === undefined ? 'the same T' : `${fig4(get(c.T, 300))} K`}, vₚ = ${fig4(m.cmp.vp)} m/s`,
      );
  }
  if (spec.family === 'distribution' && spec.distribution === 'planck') {
    const p = planckNumbers(spec, get);
    const u = unitOf(spec);
    const ok = [spec.T, ...(spec.others ?? [])].map((v) => known(v));
    p.Ts.forEach((T, i) => {
      if (!ok[i]) return;
      out.push(
        `${i ? 'Dashed: ' : ''}${fig4(T)} K: λₘₐₓ = b ÷ T = ${fig4(p.b)} μm·K ÷ ${fig4(T)} K = ${fig4(p.b / T)} μm${u === 'nm' ? ` = ${fig4(p.peaks[i]!)} nm` : ''}`,
      );
    });
    if (spec.visible !== false) out.push('Tinted: the visible band, 380 to 750 nm');
  }
  if (spec.family === 'distribution' && spec.distribution === 'occupancy') {
    const x = occupancyX(spec, get);
    const given = spec.x !== undefined ? known(spec.x) : [spec.energy, spec.T].every(known);
    if (x !== undefined && given)
      out.push(
        `At x = ${fig4(x)}: Fermi–Dirac ${fig4(fd(x))}, Bose–Einstein ${x > 0 ? fig4(be(x)) : 'none (x ≤ 0)'}, Boltzmann ${fig4(mb(x))}`,
      );
    out.push(
      'Dashed: Bose–Einstein 1 ÷ (eˣ − 1); dotted: Boltzmann e⁻ˣ. All three agree when x ≫ 1',
    );
  }
  if (spec.family === 'quantizer') {
    const q = quantizerNumbers(spec, get, known);
    out.push(
      `${q.n} bits: ${q.levels} codes, 0 to ${q.levels - 1}; 1 LSB = ${fig4(q.vref)} V ÷ ${q.levels} = ${fig4(q.lsb * 1000)} mV`,
    );
    if (q.D !== undefined)
      out.push(
        q.dac
          ? `Code ${q.D} gives ${q.D} × ${fig4(q.lsb * 1000)} mV = ${fig4(q.back!)} V`
          : `${fig4(q.vin!)} V ÷ ${fig4(q.lsb * 1000)} mV = ${fig6(q.vin! / q.lsb)}, ${q.round ? 'rounded' : 'rounded down'}: D = ${q.D}; back, D × LSB = ${fig4(q.back!)} V`,
      );
    if (q.zoomed) out.push(`Zoomed to codes ${q.c0} to ${q.c1 - 1} of 0 to ${q.levels - 1}`);
  }
  const nw = spec.newton;
  if (nw && [nw.x0, nw.steps].every((v) => v === undefined || known(v))) {
    const it = newtonIterates(main.f, get(nw.x0, 1), get(nw.steps, 1));
    out.push(
      `Newton: each tangent meets the axis at the next x: ${it.map((x, i) => `${xName}${subNum(i)} = ${fig6(x)}`).join(', ')}`,
    );
  }
  const bs = spec.bisect;
  if (bs && [bs.a, bs.b, bs.steps].every((v) => v === undefined || known(v))) {
    const br = bisectBrackets(main.f, get(bs.a, 0), get(bs.b, 1), get(bs.steps, 1));
    out.push(
      `Bisection: ${br.map((q, i) => `m${subNum(i + 1)} = ${fig6(q.m)} (${fName} ${q.fm < 0 ? '< 0' : q.fm > 0 ? '> 0' : '= 0'})`).join(', ')}`,
    );
    const last = br[br.length - 1]!;
    const keep =
      Math.sign(last.fm) === Math.sign(main.f(last.a)) ? [last.m, last.b] : [last.a, last.m];
    out.push(
      `The root stays in [${fig6(keep[0]!)}, ${fig6(keep[1]!)}], the bracket with a sign change`,
    );
  }
  const s = spec.steps;
  if (s && [s.h, s.n, s.y0, s.x0].every((v) => v === undefined || known(v))) {
    const pts = stepsOf(spec, get)!;
    const [xe, ye] = pts[pts.length - 1]!;
    const name = s.method === 'euler' ? 'Euler' : s.method === 'heun' ? 'Heun' : 'RK4';
    const exact = main.f(xe);
    out.push(
      `${name}, ${pts.length - 1} step${pts.length === 2 ? '' : 's'} of h = ${fig4(get(s.h, 0.1))}: y = ${fig6(ye)} at ${xName} = ${fig4(xe)}; solid, the exact ${fName} = ${fig6(exact)}${Number.isFinite(exact) && exact !== 0 ? offBy(ye, exact) : ''}`,
    );
  }
  if (spec.through?.length && spec.through.every((n) => known(n.x) && known(n.y)))
    out.push(
      `Ringed: the nodes ${nodesOf(spec.through, get)
        .map((p) => `(${fig4(p.x)}, ${fig4(p.y)})`)
        .join(', ')}`,
    );
  return out.map((l) => l.replace(/-(?=\d)/g, MINUS));
}

/** The caption for a trapezoid or Simpson sum (in place of the rectangles'). */
export function quadratureCaption(
  r: RiemannSpec,
  f: (x: number) => number,
  get: Get,
  x: string,
): string {
  const q = quadratureOf(r, f, get);
  const rule = r.side === 'simpson' ? 'Simpson’s rule' : 'Trapezoid rule';
  const name = r.side === 'simpson' ? 'S' : 'T';
  return `${rule}, n = ${q.n}, h = ${fig4(q.w)} from ${x} = ${fig4(q.a)} to ${fig4(q.b)}: ${name} = ${fig6(q.sum)}`;
}

/**
 * College pictures, round 1, group D (HC4, HC9): the time responses and the log axes of
 * `functionGraph`. Pure, so the picture and the harness draw and check the same curves.
 */

// ─── HC4: first order ────────────────────────────────────────────────────────

/** x(t) = x_f + (x₀ − x_f)e^(−(t − θ)/τ) after the dead time θ, x₀ before it. */
export const firstOrder =
  (x0: number, xf: number, tau: number, theta = 0) =>
  (t: number): number =>
    t <= theta ? x0 : xf + (x0 - xf) * Math.exp(-(t - theta) / tau);

/** The fraction of the change a first-order response has made at t = θ + kτ. */
export const fractionAt = (k: number) => 1 - Math.exp(-k);

/** The two-point fit's times: 28.3% of the change at θ + τ/3, 63.2% at θ + τ. */
export const fitTimes = (tau: number, theta = 0) => ({ t28: theta + tau / 3, t63: theta + tau });

// ─── HC4: second order ───────────────────────────────────────────────────────

export interface SecondOrder {
  zeta: number;
  wn: number;
  /** σ = ζω_n. */
  sigma: number;
  /** ω_d = ω_n√(1 − ζ²), 0 when ζ ≥ 1. */
  wd: number;
  /** The unit step response (final value 1). */
  step: (t: number) => number;
  /** OS as a fraction (0 when ζ ≥ 1). */
  os: number;
  /** T_p = π ÷ ω_d (undefined when ζ ≥ 1). */
  tp?: number;
  /** T_s ≈ 4 ÷ σ. */
  ts: number;
  /** Where the envelope 1 ± e^(−σt) ÷ √(1 − ζ²) enters the ±2% band (underdamped). */
  tsEnvelope?: number;
  /** Decay ratio OS² (underdamped). */
  decay?: number;
  /** Damped period 2π ÷ ω_d (underdamped). */
  period?: number;
  /** Time to half amplitude ln 2 ÷ σ. */
  halfLife: number;
}

/** The standard second-order system ω_n² ÷ (s² + 2ζω_n s + ω_n²). */
export function secondOrder(zeta: number, wn: number): SecondOrder {
  const sigma = zeta * wn;
  const ts = 4 / sigma;
  const halfLife = Math.LN2 / sigma;
  if (zeta < 1) {
    const r = Math.sqrt(1 - zeta * zeta);
    const wd = wn * r;
    const os = Math.exp((-zeta * Math.PI) / r);
    return {
      zeta,
      wn,
      sigma,
      wd,
      step: (t) =>
        t <= 0
          ? 0
          : 1 - Math.exp(-sigma * t) * (Math.cos(wd * t) + (sigma / wd) * Math.sin(wd * t)),
      os,
      tp: Math.PI / wd,
      ts,
      tsEnvelope: sigma > 0 ? -Math.log(0.02 * r) / sigma : undefined,
      decay: os * os,
      period: (2 * Math.PI) / wd,
      halfLife,
    };
  }
  if (zeta === 1)
    return {
      zeta,
      wn,
      sigma,
      wd: 0,
      step: (t) => (t <= 0 ? 0 : 1 - Math.exp(-wn * t) * (1 + wn * t)),
      os: 0,
      ts,
      halfLife,
    };
  const q = Math.sqrt(zeta * zeta - 1);
  const [s1, s2] = [-wn * (zeta - q), -wn * (zeta + q)];
  return {
    zeta,
    wn,
    sigma,
    wd: 0,
    step: (t) => (t <= 0 ? 0 : 1 + (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s1 - s2)),
    os: 0,
    ts,
    halfLife,
  };
}

/** A free decay from A: A e^(−σt) cos ω_d t (ω_n when ζ ≥ 1, never oscillating then). */
export const freeDecay = (s: SecondOrder, a: number) => (t: number) =>
  s.zeta < 1 ? a * Math.exp(-s.sigma * t) * Math.cos(s.wd * t) : s.step(t) * -a + a;

/** The envelope ±A e^(−σt) a free decay stays inside. */
export const envelope = (s: SecondOrder, a: number) => (t: number) =>
  Math.abs(a) * Math.exp(-s.sigma * t);

/** Local extremes of f on (0, end], sampled then refined (peaks of a response or a decay). */
export function peaksOf(
  f: (t: number) => number,
  end: number,
  n = 2000,
): { t: number; y: number }[] {
  const out: { t: number; y: number }[] = [];
  const h = end / n;
  for (let i = 1; i < n; i++) {
    const [a, b, c] = [f((i - 1) * h), f(i * h), f((i + 1) * h)];
    if ((b > a && b >= c) || (b < a && b <= c)) {
      // Golden-section on [t − h, t + h] for the exact top.
      let [lo, hi] = [(i - 1) * h, (i + 1) * h];
      const up = b > a;
      for (let k = 0; k < 60; k++) {
        const m1 = lo + (hi - lo) * 0.382;
        const m2 = lo + (hi - lo) * 0.618;
        if (up ? f(m1) > f(m2) : f(m1) < f(m2)) hi = m2;
        else lo = m1;
      }
      const t = (lo + hi) / 2;
      out.push({ t, y: f(t) });
    }
  }
  return out;
}

/** OS from a value the page holds: a percent (unit %) or a fraction. */
export const osFraction = (v: number, percent: boolean) => (percent ? v / 100 : v);

// ─── Windows ─────────────────────────────────────────────────────────────────

/** A nice step (1, 2, 2.5 or 5 × 10ⁿ) giving at most `count` ticks over `span`. */
export function stepFor(span: number, count: number): number {
  const raw = span / Math.max(1, count);
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw - 1e-12)!;
}

/** Multiples of step from lo to hi. */
export function linearTicks(lo: number, hi: number, step: number): number[] {
  const out: number[] = [];
  for (let n = Math.ceil(lo / step - 1e-9); n * step <= hi + 1e-9 * Math.abs(step); n++)
    out.push(Number((n * step).toPrecision(12)));
  return out;
}

/** A nice upper end at or above x. */
export function niceEnd(x: number): number {
  if (!(x > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  return ([1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => m * p >= x - 1e-12) ?? 10) * p;
}

// ─── HC9: log axes ───────────────────────────────────────────────────────────

/** Whole decades around [lo, hi] (both > 0): 10^a to 10^b. */
export function decadesAround(lo: number, hi: number): [number, number] {
  const a = Math.floor(Math.log10(lo) + 1e-9);
  const b = Math.ceil(Math.log10(hi) - 1e-9);
  return [10 ** a, 10 ** (b > a ? b : a + 1)];
}

/** Decade ticks (10ⁿ) and minor ticks (2–9 × 10ⁿ) from lo to hi. */
export function logTicks(lo: number, hi: number): { major: number[]; minor: number[] } {
  const major: number[] = [];
  const minor: number[] = [];
  const a = Math.floor(Math.log10(lo) - 1e-9);
  const b = Math.ceil(Math.log10(hi) + 1e-9);
  for (let n = a; n <= b; n++) {
    const d = Number((10 ** n).toPrecision(12));
    if (d >= lo * (1 - 1e-9) && d <= hi * (1 + 1e-9)) major.push(d);
    for (let m = 2; m <= 9; m++) {
      const v = Number((m * 10 ** n).toPrecision(12));
      if (v > lo * (1 + 1e-9) && v < hi * (1 - 1e-9)) minor.push(v);
    }
  }
  return { major, minor };
}

const SUPS: Record<string, string> = {
  '-': '⁻',
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
};

/** A decade's label: 0.01 to 1000 as digits, else 10ⁿ. */
export function decadeText(v: number): string {
  const n = Math.round(Math.log10(v));
  if (n >= -2 && n <= 3) return String(Number(v.toPrecision(6)));
  return `10${[...String(n)].map((ch) => SUPS[ch] ?? ch).join('')}`;
}

/**
 * One axis's map from a value to a fraction of its length (0 at the low end), linear or log;
 * undefined for a value a log axis can't take (≤ 0).
 */
export function axisMap(lo: number, hi: number, log: boolean) {
  if (!log) return (v: number) => (v - lo) / (hi - lo);
  const [a, b] = [Math.log10(lo), Math.log10(hi)];
  return (v: number) => (v > 0 ? (Math.log10(v) - a) / (b - a) : undefined);
}

/** The inverse of `axisMap`: a fraction of the axis back to its value. */
export function axisUnmap(lo: number, hi: number, log: boolean) {
  if (!log) return (u: number) => lo + u * (hi - lo);
  const [a, b] = [Math.log10(lo), Math.log10(hi)];
  return (u: number) => 10 ** (a + u * (b - a));
}

// ─── HC9: the grain-size curve ───────────────────────────────────────────────

/**
 * Percent passing against grain size through (D₁₀, 10), (D₃₀, 30), (D₆₀, 60), monotone
 * (Fritsch–Carlson) in log D, run out to 0% and 100% with the slopes of its ends. Returns the
 * curve and the sizes where it reaches 0% and 100%.
 */
export function gradationCurve(d10: number, d30: number, d60: number) {
  const [u10, u30, u60] = [d10, d30, d60].map(Math.log10) as [number, number, number];
  const lowSlope = 20 / (u30 - u10);
  const highSlope = 30 / (u60 - u30);
  const u0 = u10 - (10 / lowSlope) * 1.6;
  const u100 = u60 + (40 / highSlope) * 1.4;
  const xs = [u0, u10, u30, u60, u100];
  const ys = [0, 10, 30, 60, 100];
  const n = xs.length;
  const h = xs.slice(1).map((x, i) => x - xs[i]!);
  const del = h.map((hi, i) => (ys[i + 1]! - ys[i]!) / hi);
  const m = xs.map((_, i) =>
    i === 0
      ? del[0]!
      : i === n - 1
        ? del[n - 2]!
        : del[i - 1]! * del[i]! <= 0
          ? 0
          : (3 * (h[i - 1]! + h[i]!)) /
            ((2 * h[i]! + h[i - 1]!) / del[i - 1]! + (h[i]! + 2 * h[i - 1]!) / del[i]!),
  );
  // Flat ends: a gradation curve leaves 0% and reaches 100% gently.
  m[0] = 0;
  m[n - 1] = 0;
  const f = (d: number): number => {
    if (!(d > 0)) return NaN;
    const u = Math.log10(d);
    if (u <= u0) return 0;
    if (u >= u100) return 100;
    let i = 0;
    while (i < n - 2 && u > xs[i + 1]!) i++;
    const t = (u - xs[i]!) / h[i]!;
    const [t2, t3] = [t * t, t * t * t];
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i]! +
      (t3 - 2 * t2 + t) * h[i]! * m[i]! +
      (-2 * t3 + 3 * t2) * ys[i + 1]! +
      (t3 - t2) * h[i]! * m[i + 1]!
    );
  };
  return { f, lo: 10 ** u0, hi: 10 ** u100 };
}

/** C_u = D₆₀ ÷ D₁₀ and C_c = D₃₀² ÷ (D₁₀D₆₀). */
export const gradationCoefficients = (d10: number, d30: number, d60: number) => ({
  cu: d60 / d10,
  cc: (d30 * d30) / (d10 * d60),
});

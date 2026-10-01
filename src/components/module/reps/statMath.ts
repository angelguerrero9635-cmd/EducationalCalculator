/**
 * Probability for the Grades 9–12 statistics pictures (normal and chi-square curves,
 * histograms, binomial bars): the distribution functions, their inverses, and a seeded random
 * stream so simulated intervals are the same on every screen. Plain functions, shared with the
 * harness (`harness/picturesHsb.ts`).
 */

/** The standard normal density. */
export const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);

/**
 * The standard normal CDF, Φ(z) = P(Z ≤ z), by Marsaglia's series (accurate to about 1e-15;
 * no table lookups).
 */
export function Phi(z: number): number {
  if (z < -8.5) return 0;
  if (z > 8.5) return 1;
  let s = z;
  let t = 0;
  let b = z;
  const q = z * z;
  for (let i = 1; s !== t;) {
    t = s;
    i += 2;
    b *= q / i;
    s = t + b;
  }
  return 0.5 + s * Math.exp(-0.5 * q - 0.9189385332046727);
}

/** The z with Φ(z) = p, by bisection (0 < p < 1). */
export function invPhi(p: number): number {
  if (!(p > 0)) return -Infinity;
  if (!(p < 1)) return Infinity;
  let lo = -9;
  let hi = 9;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (Phi(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The normal density with mean m and standard deviation s. */
export const normalPdf = (x: number, m: number, s: number) => phi((x - m) / s) / s;

/** P(a ≤ X ≤ b) for X normal (m, s); either end may be ±Infinity. */
export const normalArea = (a: number, b: number, m: number, s: number) =>
  Math.max(0, Phi((b - m) / s) - Phi((a - m) / s));

/** ln Γ(x) (Lanczos, x > 0). */
export function lnGamma(x: number): number {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.3234287776531, -176.6150291621406,
    12.507343278686905, -0.13857109526572012, 9.984369578019572e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  const y = x - 1;
  let a = 0.9999999999998099;
  const t = y + 7.5;
  g.forEach((c, i) => (a += c / (y + i + 1)));
  return 0.5 * Math.log(2 * Math.PI) + (y + 0.5) * Math.log(t) - t + Math.log(a);
}

/** The regularized lower incomplete gamma function P(s, x). */
function gammaP(s: number, x: number): number {
  if (x <= 0) return 0;
  if (x < s + 1) {
    // Series.
    let sum = 1 / s;
    let term = sum;
    for (let n = 1; n < 500; n++) {
      term *= x / (s + n);
      sum += term;
      if (term < sum * 1e-16) break;
    }
    return Math.min(1, sum * Math.exp(-x + s * Math.log(x) - lnGamma(s)));
  }
  // Continued fraction for Q(s, x) (Lentz).
  let b = x + 1 - s;
  let c = 1e300;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - s);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  return Math.max(0, 1 - Math.exp(-x + s * Math.log(x) - lnGamma(s)) * h);
}

/** The chi-square density with k degrees of freedom. */
export function chiPdf(x: number, k: number): number {
  if (x <= 0) return k === 2 ? 0.5 : 0;
  return Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.LN2 - lnGamma(k / 2));
}

/** P(χ² ≤ x) with k degrees of freedom. */
export const chiCdf = (x: number, k: number) => gammaP(k / 2, x / 2);

/** The x with P(χ² ≥ x) = tail (the critical value for a right-tail test). */
export function chiCritical(tail: number, k: number): number {
  let lo = 0;
  let hi = 200;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (1 - chiCdf(mid, k) > tail) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The continued fraction of the incomplete beta function (modified Lentz). */
function betaFraction(a: number, b: number, x: number): number {
  const tiny = 1e-300;
  let c = 1;
  let d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m < 500; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return h;
}

/** The regularized incomplete beta function I_x(a, b). */
export function betaI(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(
    lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x),
  );
  return x < (a + 1) / (a + b + 2)
    ? (front * betaFraction(a, b, x)) / a
    : 1 - (front * betaFraction(b, a, 1 - x)) / b;
}

/** The t density with `df` degrees of freedom. */
export function tPdf(t: number, df: number): number {
  const lnC = lnGamma((df + 1) / 2) - lnGamma(df / 2) - 0.5 * Math.log(df * Math.PI);
  return Math.exp(lnC - ((df + 1) / 2) * Math.log(1 + (t * t) / df));
}

/** P(T ≤ t) with `df` degrees of freedom (a calculator's tcdf from −∞). */
export function tCdf(t: number, df: number): number {
  const tail = 0.5 * betaI(df / (df + t * t), df / 2, 0.5);
  return t > 0 ? 1 - tail : tail;
}

/** The t with P(T ≤ t) = p (a calculator's invT). */
export function invT(p: number, df: number): number {
  let lo = -1000;
  let hi = 1000;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, df) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The critical t* for a confidence level (0.95 → 2.262 with 9 degrees of freedom). */
export const tStar = (level: number, df: number) => invT(1 - (1 - level) / 2, df);

/** A small seeded random stream (mulberry32): the same numbers from the same seed. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * `count` standard normal draws from a fixed seed (Box–Muller): each simulated sample mean is
 * μ + z × σ/√n, so an interval x̄ ± z* × σ/√n captures μ exactly when |z| ≤ z*.
 */
export function normalDraws(count: number, seed = 2026): number[] {
  const rand = seeded(seed);
  const out: number[] = [];
  while (out.length < count) {
    const u = 1 - rand();
    const v = rand();
    const r = Math.sqrt(-2 * Math.log(u));
    out.push(r * Math.cos(2 * Math.PI * v));
    if (out.length < count) out.push(r * Math.sin(2 * Math.PI * v));
  }
  return out;
}

/** The critical value z* for a two-sided confidence level (0.95 → 1.96). */
export const zStar = (level: number) => invPhi(1 - (1 - level) / 2);

/** n choose k, exact for the sizes the pictures draw. */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n || !Number.isInteger(n) || !Number.isInteger(k)) return 0;
  let out = 1;
  for (let i = 1; i <= Math.min(k, n - k); i++) out = (out * (n - i + 1)) / i;
  return Math.round(out);
}

/** P(X = k) for X binomial (n, p). */
export const binomialPmf = (n: number, p: number, k: number) =>
  choose(n, k) * p ** k * (1 - p) ** (n - k);

/** Area under `f` from a to b by Simpson's rule (the harness's independent check). */
export function simpson(f: (x: number) => number, a: number, b: number, steps = 2000): number {
  if (!(b > a)) return 0;
  const h = (b - a) / steps;
  let s = f(a) + f(b);
  for (let i = 1; i < steps; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

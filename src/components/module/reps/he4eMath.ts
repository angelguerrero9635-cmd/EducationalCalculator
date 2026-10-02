/**
 * The sums behind group E's round-4 college pictures (docs/RENDERINGS_HE.md), shared by the
 * pictures and their harness checks so both read the same numbers.
 */
import { Phi, phi, seeded, tCdf, tStar } from './statMath';

// ─── HC114: the t curve ──────────────────────────────────────────────────────

/** The area of the t curve with `df` degrees of freedom between −t and t. */
export const tMiddle = (t: number, df: number) => tCdf(Math.abs(t), df) - tCdf(-Math.abs(t), df);

/** The critical t for a two-sided `level` (0.95 → 2.776 at df = 4). */
export const tCritical = (level: number, df: number) => tStar(level, df);

/** The half-width t⋆s ÷ √n of a confidence interval for a mean. */
export const halfWidth = (t: number, s: number, n: number) => (t * s) / Math.sqrt(n);

/**
 * The t window, symmetric about 0: at least ±4, wide enough for ±t⋆ and the observed t with a
 * margin, at most ±14 (df = 1's t⋆ is 12.7).
 */
export const tWindow = (tStarValue?: number, observed?: number) =>
  Math.min(14, Math.max(4, (tStarValue ?? 0) * 1.15, Math.abs(observed ?? 0) * 1.12));

// ─── HC152: truncation selection ─────────────────────────────────────────────

/**
 * The cutoff z (in standard deviations from the mean) whose upper tail has mean μ + S, for
 * S ÷ σ = `ratio` > 0: solves φ(z) ÷ (1 − Φ(z)) = ratio by bisection (the inverse Mills ratio
 * rises steadily from 0). The tail's share is 1 − Φ(z).
 */
export function cutoffFor(ratio: number): { z: number; share: number } {
  const mills = (z: number) => {
    if (z < 3) return phi(z) / Phi(-z);
    // Laplace's continued fraction for (1 − Φ(z)) ÷ φ(z): exact where Φ(−z) loses its digits.
    let f = z;
    for (let k = 60; k >= 1; k--) f = z + k / f;
    return f;
  };
  let lo = -12;
  let hi = 40;
  const r = Math.min(Math.max(ratio, 1e-9), 39);
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (mills(mid) < r) lo = mid;
    else hi = mid;
  }
  const z = (lo + hi) / 2;
  return { z, share: z < 3 ? Phi(-z) : phi(z) / mills(z) };
}

/**
 * The selected tail for a selection differential S on a curve of mean m and spread sd: the
 * cutoff value, the side (+1 the high tail, −1 the low tail) and the share kept. Undefined for
 * S = 0 (no one is selected apart).
 */
export function selectedTail(m: number, sd: number, S: number) {
  if (!(sd > 0) || S === 0 || !Number.isFinite(S)) return undefined;
  const side = S > 0 ? 1 : -1;
  const { z, share } = cutoffFor(Math.abs(S) / sd);
  return { cut: m + side * z * sd, side, share };
}

// ─── HC153: drift ────────────────────────────────────────────────────────────

/** Most generations a drift picture draws. */
export const DRIFT_MAX_GENERATIONS = 1000;

/** The expected heterozygosity after t generations: H₀(1 − 1 ÷ 2Nₑ)ᵗ. */
export const heterozygosity = (h0: number, ne: number, t: number) => h0 * (1 - 1 / (2 * ne)) ** t;

/** The p whose heterozygosity 2p(1 − p) is H (the smaller root; H ≤ 0.5). */
export const pForH = (h: number) => (1 - Math.sqrt(Math.max(0, 1 - 2 * Math.min(h, 0.5)))) / 2;

/**
 * Wright–Fisher paths: `count` populations of `ne` diploids from p₀, each generation's 2Nₑ gene
 * copies drawn at random from the last generation's p (exactly, one copy at a time, up to 400
 * copies; past that by the normal approximation to the binomial, rounded and kept in 0 to 2Nₑ).
 * A fixed seed per population and Nₑ: the same Nₑ draws the same paths. Each path has
 * `generations` + 1 values, p at t = 0, 1, …; a path that fixes or is lost stays there.
 */
export function driftPaths(
  ne: number,
  generations: number,
  p0: number,
  count = 12,
  seed = 2026,
): number[][] {
  const N2 = Math.max(2, Math.round(2 * ne));
  const T = Math.max(0, Math.min(DRIFT_MAX_GENERATIONS, Math.round(generations)));
  const paths: number[][] = [];
  for (let k = 0; k < count; k++) {
    const rand = seeded(seed + 7919 * k + (N2 % 100003));
    let p = Math.min(1, Math.max(0, p0));
    const path = [p];
    for (let t = 1; t <= T; t++) {
      if (p > 0 && p < 1) {
        let copies: number;
        if (N2 <= 400) {
          copies = 0;
          for (let i = 0; i < N2; i++) if (rand() < p) copies++;
        } else {
          const u1 = Math.max(rand(), 1e-12);
          const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * rand());
          copies = Math.round(N2 * p + z * Math.sqrt(N2 * p * (1 - p)));
          copies = Math.min(N2, Math.max(0, copies));
        }
        p = copies / N2;
      }
      path.push(p);
    }
    paths.push(path);
  }
  return paths;
}

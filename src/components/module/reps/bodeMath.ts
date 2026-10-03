/**
 * HC22 `bode` math (college round 2, group A): a transfer function's gain and phase at a
 * frequency, its straight-line asymptotes, and the gain and phase crossovers. Shared by
 * `Bode.tsx` and the harness check. Frequencies are in the axis's unit (Hz or rad/s): s = jf.
 */
import type { BodeSpec } from '@/data/modules/typesHe2a';

/** The transfer function a `bode` spec describes, its values read. */
export interface BodeTf {
  /** K (root form) or the low-frequency gain (`dc`, Bode form). */
  k: number;
  dcForm: boolean;
  poles: number[];
  zeros: number[];
  pairs: { w0: number; q: number }[];
  /** Poles at s = 0 (negative: zeros there). */
  n: number;
}

export interface BodePoint {
  ratio: number;
  db: number;
  phase: number;
}

const db = (x: number) => 20 * Math.log10(x);

/** The gain and phase at w. The phase is the sum of each factor's (no wrapping). */
export function bodeAt(tf: BodeTf, w: number): BodePoint {
  let mag = Math.abs(tf.k) * w ** -tf.n;
  let phase = (tf.k < 0 ? 180 : 0) - tf.n * 90;
  const atan = (x: number) => (Math.atan(x) * 180) / Math.PI;
  for (const z of tf.zeros) {
    mag *= tf.dcForm ? Math.hypot(1, w / z) : Math.hypot(z, w);
    phase += atan(w / z);
  }
  for (const p of tf.poles) {
    mag /= tf.dcForm ? Math.hypot(1, w / p) : Math.hypot(p, w);
    phase -= atan(w / p);
  }
  for (const { w0, q } of tf.pairs) {
    const re = tf.dcForm ? 1 - (w / w0) ** 2 : w0 * w0 - w * w;
    const im = tf.dcForm ? w / (w0 * q) : (w * w0) / q;
    mag /= Math.hypot(re, im);
    phase -= (Math.atan2(im, re) * 180) / Math.PI;
  }
  return { ratio: mag, db: db(mag), phase };
}

/** The straight-line asymptote of the gain, in dB. */
export function asymptoteDb(tf: BodeTf, w: number): number {
  let mag = Math.abs(tf.k) * w ** -tf.n;
  for (const z of tf.zeros) mag *= tf.dcForm ? Math.max(1, w / z) : Math.max(z, w);
  for (const p of tf.poles) mag /= tf.dcForm ? Math.max(1, w / p) : Math.max(p, w);
  for (const { w0 } of tf.pairs)
    mag /= tf.dcForm ? Math.max(1, (w / w0) ** 2) : Math.max(w0 * w0, w * w);
  return db(mag);
}

/**
 * The straight-line phase: each real corner a ramp of 45° a decade from a tenth of it to ten
 * times it; a pair a ramp of 180° over w₀ ÷ 10^ζ to w₀ × 10^ζ (ζ = 1 ÷ 2Q).
 */
export function asymptotePhase(tf: BodeTf, w: number): number {
  const ramp = (c: number, span: number) => {
    const x = Math.log10(w / c);
    return Math.max(0, Math.min(1, (x + span) / (2 * span)));
  };
  let phase = (tf.k < 0 ? 180 : 0) - tf.n * 90;
  for (const z of tf.zeros) phase += 90 * ramp(z, 1);
  for (const p of tf.poles) phase -= 90 * ramp(p, 1);
  for (const { w0, q } of tf.pairs) {
    const zeta = 1 / (2 * q);
    phase -= zeta > 1e-3 ? 180 * ramp(w0, zeta) : w >= w0 ? 180 : 0;
  }
  return phase;
}

/** The lowest w in [lo, hi] where f crosses 0 (log steps, then bisection), or undefined. */
function crossing(f: (w: number) => number, lo: number, hi: number): number | undefined {
  const n = 600;
  let a = lo;
  let fa = f(a);
  for (let i = 1; i <= n; i++) {
    const b = lo * (hi / lo) ** (i / n);
    const fb = f(b);
    if (fa === 0) return a;
    if (Math.sign(fa) !== Math.sign(fb)) {
      let [x, y, fx] = [a, b, fa];
      for (let k = 0; k < 80; k++) {
        const m = Math.sqrt(x * y);
        const fm = f(m);
        if (Math.sign(fm) === Math.sign(fx)) [x, fx] = [m, fm];
        else y = m;
      }
      return Math.sqrt(x * y);
    }
    [a, fa] = [b, fb];
  }
  return undefined;
}

/** The search range for crossovers: far around every corner. */
const searchRange = (tf: BodeTf): [number, number] => {
  const cs = [...tf.poles, ...tf.zeros, ...tf.pairs.map((p) => p.w0), Math.abs(tf.k)].filter(
    (x) => x > 0,
  );
  return [Math.min(1, ...cs) * 1e-6, Math.max(1, ...cs) * 1e6];
};

/** The gain crossover (|G| = 1) and the phase margin 180° + ∠G there. */
export function gainCrossover(tf: BodeTf): { w: number; pm: number } | undefined {
  const [lo, hi] = searchRange(tf);
  const w = crossing((x) => bodeAt(tf, x).db, lo, hi);
  return w === undefined ? undefined : { w, pm: 180 + bodeAt(tf, w).phase };
}

/** The phase crossover (∠G = −180°) and the gain margin 1 ÷ |G| there (and in dB). */
export function phaseCrossover(tf: BodeTf): { w: number; gm: number; gmDb: number } | undefined {
  const [lo, hi] = searchRange(tf);
  const w = crossing((x) => bodeAt(tf, x).phase + 180, lo, hi);
  if (w === undefined) return undefined;
  const g = bodeAt(tf, w).ratio;
  return { w, gm: 1 / g, gmDb: -db(g) };
}

/** The decades the axis spans: a decade past the outer corners and every marked frequency. */
export function decadeRange(tf: BodeTf, marks: number[]): [number, number] {
  const cs = [...tf.poles, ...tf.zeros, ...tf.pairs.map((p) => p.w0)].filter((x) => x > 0);
  const ms = marks.filter((x) => x > 0 && Number.isFinite(x));
  const all = [...cs, ...ms];
  if (!all.length) return [0, 3];
  let lo = Math.floor(Math.log10(Math.min(...cs.map((c) => c / 10), ...ms.map((m) => m / 3))));
  let hi = Math.ceil(Math.log10(Math.max(...cs.map((c) => c * 10), ...ms.map((m) => m * 3))));
  if (hi - lo < 3) {
    const add = 3 - (hi - lo);
    lo -= Math.floor(add / 2);
    hi += Math.ceil(add / 2);
  }
  // At most six decades: a 358 px axis shows 60 px a decade.
  while (hi - lo > 6) {
    if (cs.length && Math.min(...all) > 10 ** (lo + 1)) lo++;
    else hi--;
  }
  return [lo, hi];
}

/** A `bode` spec's transfer function, its values read by `num` (undefined while any is "?"). */
export function bodeTfOf(
  spec: Pick<BodeSpec, 'gain' | 'dc' | 'poles' | 'zeros' | 'pairs' | 'integrators'>,
  num: (x: number | string) => number | undefined,
): BodeTf | undefined {
  const all = (xs: (number | string)[]) => {
    const out = xs.map(num);
    return out.every((x): x is number => x !== undefined) ? out : undefined;
  };
  const k = spec.gain !== undefined ? num(spec.gain) : spec.dc !== undefined ? num(spec.dc) : 1;
  const poles = all(spec.poles ?? []);
  const zeros = all(spec.zeros ?? []);
  const pairs = (spec.pairs ?? []).map((p) => {
    const w0 = num(p.freq);
    const q =
      p.q !== undefined
        ? num(p.q)
        : p.zeta !== undefined
          ? (() => {
              const z = num(p.zeta);
              return z === undefined || z <= 0 ? undefined : 1 / (2 * z);
            })()
          : Math.SQRT1_2;
    return w0 === undefined || q === undefined ? undefined : { w0, q };
  });
  if (k === undefined || !poles || !zeros || pairs.some((p) => !p)) return undefined;
  return {
    k,
    dcForm: spec.gain === undefined,
    poles,
    zeros,
    pairs: pairs as { w0: number; q: number }[],
    n: spec.integrators ?? 0,
  };
}

/**
 * What a `normalCurve` picture draws, worked out from its values: the curve, the window, the
 * shaded regions and their area, a test's rejection region and p-value, simulated intervals.
 * Shared by the picture (`NormalCurve.tsx`) and the harness, which integrates the drawn
 * regions independently and checks them against the areas written.
 */
import type { NormalCurveSpec } from '@/data/modules/typesHsb';

import {
  chiCdf,
  chiCritical,
  chiPdf,
  invPhi,
  normalArea,
  normalDraws,
  normalPdf,
  invT,
  tCdf,
  tPdf,
  zStar,
} from './statMath';
import { tailOf } from './signBox';

export type Span = [number, number];

export interface NormalModel {
  /** H99: a t curve's degrees of freedom (the dashed normal is `pop`). */
  t?: number;
  /** H99: a t curve's mass past ±12 scales inside [a, b], for the harness's integration. */
  tails?: (a: number, b: number) => number;
  /** The chi-square curve (df) in place of the normal. */
  df?: number;
  /** The curve drawn: its mean and SD (the sampling curve in `sample` mode). */
  m: number;
  s: number;
  /** The population's curve, drawn dashed behind the sampling curve. */
  pop?: { m: number; s: number };
  /** The x window. */
  window: Span;
  /** Density of the drawn curve. */
  pdf: (x: number) => number;
  /** Regions shaded (x values; ends may be ±Infinity) and their total area. */
  regions: Span[];
  area?: number;
  /** A test: the rejection region (area α), its critical values, the p-value region. */
  reject?: Span[];
  critical?: number[];
  pRegions?: Span[];
  pValue?: number;
  /** The statistic's x position (test or chi-square). */
  stat?: number;
  /** Simulated intervals, each with whether it captures the mean. */
  intervals?: { lo: number; hi: number; hit: boolean }[];
  /** A reason the values can't make the picture (drawn faded). */
  problem?: string;
}

type Val = (v: number | string | undefined) => number | undefined;

const areaOf = (spans: Span[], cdf: (x: number) => number) =>
  spans.reduce((t, [a, b]) => t + Math.max(0, cdf(b) - cdf(a)), 0);

export function normalModel(spec: NormalCurveSpec, val: Val): NormalModel {
  if (spec.chiSquare) {
    const k = Math.round(val(spec.chiSquare.df) ?? 1);
    const df = Math.min(10, Math.max(1, k));
    const stat = val(spec.chiSquare.stat);
    const alpha = val(spec.chiSquare.alpha);
    const crit = alpha !== undefined && alpha > 0 && alpha < 1 ? chiCritical(alpha, df) : undefined;
    const cdf = (x: number) => (x === Infinity ? 1 : x <= 0 ? 0 : chiCdf(x, df));
    const right = Math.max(df + 4 * Math.sqrt(2 * df), (crit ?? 0) * 1.15, (stat ?? 0) * 1.1, 8);
    const pRegions: Span[] = stat !== undefined && stat >= 0 ? [[stat, Infinity]] : [];
    const reject: Span[] = crit !== undefined ? [[crit, Infinity]] : [];
    return {
      df,
      m: df,
      s: Math.sqrt(2 * df),
      window: [0, niceUp(right)],
      pdf: (x) => chiPdf(x, df),
      regions: pRegions,
      area: pRegions.length ? areaOf(pRegions, cdf) : undefined,
      reject,
      critical: crit !== undefined ? [crit] : undefined,
      pRegions,
      pValue: pRegions.length ? areaOf(pRegions, cdf) : undefined,
      stat,
      problem: k < 1 || k > 10 ? `df ${k} is outside 1 to 10` : undefined,
    };
  }
  const mu = val(spec.mean) ?? 0;
  const sigma = val(spec.sd) ?? 1;
  if (!(sigma > 0)) {
    return {
      m: mu,
      s: 1,
      window: [mu - 3.5, mu + 3.5],
      pdf: (x) => normalPdf(x, mu, 1),
      regions: [],
      problem: 'The standard deviation must be more than 0.',
    };
  }
  const n = spec.sample ? val(spec.sample.n) : undefined;
  const sampled = spec.sample && n !== undefined && n >= 1;
  const s = sampled ? sigma / Math.sqrt(n) : sigma;
  // H99: a t curve (df) in place of the normal, the normal dashed behind it.
  const df = spec.t && !sampled ? Math.max(1, Math.round(val(spec.t.df) ?? 1)) : undefined;
  const tc = (x: number) => (x === Infinity ? 1 : x === -Infinity ? 0 : tCdf((x - mu) / s, df!));
  const cdf = (x: number) => (df ? tc(x) : normalArea(-Infinity, x, mu, s));
  const window: Span = [mu - 3.5 * sigma, mu + 3.5 * sigma];
  const out: NormalModel = {
    m: mu,
    s,
    pop: sampled ? { m: mu, s: sigma } : df ? { m: mu, s } : undefined,
    window,
    pdf: df ? (x) => tPdf((x - mu) / s, df) / s : (x) => normalPdf(x, mu, s),
    regions: [],
    t: df,
    tails: df
      ? (a, b) => {
          const [l, r] = [mu - 12 * s, mu + 12 * s];
          return Math.max(0, tc(Math.min(b, l)) - tc(a)) + Math.max(0, tc(b) - tc(Math.max(a, r)));
        }
      : undefined,
  };
  const grow = (x: number | undefined, unit = sigma) => {
    if (x === undefined || !Number.isFinite(x)) return;
    const pad = 0.25 * unit;
    if (x < window[0] + pad) window[0] = x - pad;
    if (x > window[1] - pad) window[1] = x + pad;
  };
  if (spec.shade) {
    const a = val(spec.shade.from);
    const b = val(spec.shade.to);
    grow(a);
    grow(b);
    const lo = a ?? -Infinity;
    const hi = b ?? Infinity;
    if (lo > hi) out.problem = 'The shaded region runs backward: its start is past its end.';
    else if (spec.shade.outside)
      out.regions = [
        [-Infinity, lo],
        [hi, Infinity],
      ];
    else out.regions = [[lo, hi]];
    if (!out.problem) out.area = areaOf(out.regions, cdf);
  }
  if (spec.mark) grow(val(spec.mark.x));
  if (spec.interval) {
    const c = val(spec.interval.center);
    const e = val(spec.interval.margin);
    if (c !== undefined && e !== undefined && e >= 0) {
      grow(c - e);
      grow(c + e);
      if (!spec.shade) {
        out.regions = [[c - e, c + e]];
        out.area = areaOf(out.regions, cdf);
      }
    }
  }
  if (spec.intervals) {
    const level = val(spec.intervals.level);
    // H105: the count may be a value (20 to 100); none drawn while it is "?".
    const typed = val(spec.intervals.count);
    const count = Math.min(100, Math.max(20, Math.round(typed ?? 20)));
    const ns = val(spec.intervals.n);
    if (
      typed !== undefined &&
      level !== undefined &&
      level > 0 &&
      level < 1 &&
      ns !== undefined &&
      ns >= 1
    ) {
      const se = sigma / Math.sqrt(ns);
      const zs = zStar(level);
      out.intervals = normalDraws(count, spec.intervals.seed ?? 152).map((z) => ({
        lo: mu + (z - zs) * se,
        hi: mu + (z + zs) * se,
        hit: Math.abs(z) <= zs,
      }));
      if (!spec.shade && !spec.interval && !spec.sample) {
        // The sampling distribution of x̄, the middle `level` of it shaded, on a window
        // (and ticks) of standard errors.
        out.s = se;
        window[0] = mu - 4 * se;
        window[1] = mu + 4 * se;
        out.pdf = (x) => normalPdf(x, mu, se);
        out.regions = [[mu - zs * se, mu + zs * se]];
        out.area = normalArea(mu - zs * se, mu + zs * se, mu, se);
      }
      for (const iv of out.intervals) {
        grow(iv.lo, se);
        grow(iv.hi, se);
      }
    }
  }
  if (spec.test) {
    const z = val(spec.test.stat);
    const alpha = val(spec.test.alpha);
    const x = (k: number) => mu + k * sigma;
    // H90: Hₐ's sign box gives the tail; none drawn until a sign is chosen.
    const tail = tailOf(spec.test.tail, (id) => val(id));
    if (tail && alpha !== undefined && alpha > 0 && alpha < 1) {
      const inv = (p: number) => (df ? invT(p, df) : invPhi(p));
      const zc = tail === 'two' ? inv(1 - alpha / 2) : inv(1 - alpha);
      out.critical = tail === 'two' ? [x(-zc), x(zc)] : [x(tail === 'left' ? -zc : zc)];
      out.reject =
        tail === 'left'
          ? [[-Infinity, x(-zc)]]
          : tail === 'right'
            ? [[x(zc), Infinity]]
            : [
                [-Infinity, x(-zc)],
                [x(zc), Infinity],
              ];
    }
    if (z !== undefined) {
      out.stat = x(z);
      grow(out.stat);
    }
    if (tail && z !== undefined) {
      const az = Math.abs(z);
      out.pRegions =
        tail === 'left'
          ? [[-Infinity, x(z)]]
          : tail === 'right'
            ? [[x(z), Infinity]]
            : [
                [-Infinity, x(-az)],
                [x(az), Infinity],
              ];
      out.pValue = areaOf(out.pRegions, cdf);
    }
  }
  return out;
}

/** The next round number at or above x (1, 2, 5 × 10ⁿ steps of the window). */
function niceUp(x: number) {
  const step = x <= 10 ? 2 : x <= 25 ? 5 : 10;
  return Math.ceil(x / step) * step;
}

/** Tick step for the chi-square axis (0 to right). */
export const chiStep = (right: number) => (right <= 10 ? 1 : right <= 20 ? 2 : 5);

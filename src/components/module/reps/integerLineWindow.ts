/**
 * The number line's window and tick step (H89). By default the line runs from `min` to `max`,
 * growing to take in its points (each `pad` past them), rounded out to the tick step. With `fit`
 * it spans its own values with a margin instead (at least 10 across) (10 ≤ x ≤ 30 draws 5 to 35; 344 to 356 draws 340
 * to 360), so a line far from 0 still reads; `ticks` fixes the tick step (5 or 10).
 */
import type { IntegerLineHs2a } from '@/data/modules/typesHs2a';

/** A tick spacing that gives at most `most` ticks over `span`: 1, 2, 5, 10, 20, 25, 50, … */
export function tickStep(span: number, most = 20): number {
  for (const base of [1, 10, 100, 1000]) {
    // No 2.5 below 10: a line counts by 1, 2 or 5 there, never by 2.5.
    for (const k of base === 1 ? [1, 2, 5] : [1, 2, 2.5, 5]) {
      const s = k * base;
      if (span / s <= most) return s;
    }
  }
  return 10000;
}

type Spec = IntegerLineHs2a & { min: number; max: number };

/** At most this many ticks when `ticks` is given; past it the step is chosen as usual. */
const MOST_TICKS = 40;

/** The tick step for a line from lo to hi. */
export function lineStep(spec: Spec, lo: number, hi: number): number {
  if (spec.ticks && spec.ticks > 0 && (hi - lo) / spec.ticks <= MOST_TICKS) return spec.ticks;
  return spec.fit ? tickStep(hi - lo, 10) : tickStep(hi - lo);
}

/** The line's ends, [lo, hi], for the points drawn on it. */
export function lineWindow(spec: Spec, pts: number[], pad: number): [number, number] {
  let lo: number;
  let hi: number;
  if (spec.fit && pts.length) {
    const [a, b] = [Math.min(...pts), Math.max(...pts)];
    // A quarter of the spread each side, and at least 10 across (a ray from one bound).
    const margin = Math.max(pad, (b - a) / 4, (10 - (b - a)) / 2);
    [lo, hi] = [a - margin, b + margin];
  } else {
    lo = Math.min(spec.min, ...pts.map((p) => p - pad));
    hi = Math.max(spec.max, ...pts.map((p) => p + pad));
  }
  let s = lineStep(spec, lo, hi);
  let ends: [number, number] = [Math.floor(lo / s) * s, Math.ceil(hi / s) * s];
  // A fitted line rounds out again until its ends sit on its own ticks (340 to 360 by 5).
  for (let i = 0; spec.fit && i < 4; i++) {
    const next = lineStep(spec, ends[0], ends[1]);
    if (next === s) break;
    s = next;
    ends = [Math.floor(lo / s) * s, Math.ceil(hi / s) * s];
  }
  return ends;
}

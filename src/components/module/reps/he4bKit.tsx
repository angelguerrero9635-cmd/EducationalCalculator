/**
 * Shared pieces for the round-4 group B college pictures: a number-or-variable reader, label
 * placement that keeps chips apart, subscripts for names, and a right-angle mark. Flat.
 */
import { Path } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { short } from './hsdKit';
import { chipBox } from './hsdText';
import { type V3, viewOf } from './vectorSpace';

type X = number | string | undefined;

/** Values in formula units, whether each is known (a "?" is not), and a label for each. */
export function useValues(calc: Calculator) {
  const rep = useRep(calc);
  const v = (x: X, fallback = 0) =>
    x === undefined ? fallback : typeof x === 'number' ? x : rep.val(x);
  const known = (x: X) => typeof x !== 'string' || rep.known(x);
  /** "2.5 m" (the page's value with its shown unit) or the fixed number with `unit`. */
  const text = (x: X, value: number, unit = '') => {
    // A typed value reads as typed; a worked-out one to 4 significant figures (433.0 N).
    if (typeof x === 'string' && rep.known(x)) {
      if (rep.typed(x)) return rep.value(x);
      const u = rep.unit(x);
      const n = formatNumber(Number(rep.shown(x).toPrecision(4)));
      return u ? `${n}${u === '°' ? '°' : ` ${u}`}` : n;
    }
    return `${short(value)}${unit ? (unit === '°' ? '°' : ` ${unit}`) : ''}`;
  };
  return { rep, v, known, all: (...xs: X[]) => xs.every(known), text };
}

const SUB: Record<string, string> = {
  a: 'ₐ',
  e: 'ₑ',
  h: 'ₕ',
  i: 'ᵢ',
  j: 'ⱼ',
  k: 'ₖ',
  l: 'ₗ',
  m: 'ₘ',
  n: 'ₙ',
  o: 'ₒ',
  p: 'ₚ',
  r: 'ᵣ',
  s: 'ₛ',
  t: 'ₜ',
  u: 'ᵤ',
  v: 'ᵥ',
  x: 'ₓ',
};
/** A name as a subscript where Unicode has the letters ("v" → "ᵥ"; "u₁" → "ᵤ₁"). */
export const subOf = (name: string) =>
  [...name].every((ch) => SUB[ch] || /[₀-₉]/.test(ch))
    ? [...name].map((ch) => SUB[ch] ?? ch).join('')
    : `(${name})`;

/** A number in a sum, bracketed when negative. */
export const par = (x: number) => (x < 0 ? `(${short(x)})` : short(x));

/** "⟨1, 2⟩" or "⟨1, 2, 3⟩". */
export const bracket = (p: number[]) => `⟨${p.map(short).join(', ')}⟩`;

type Box = { left: number; right: number; top: number; bottom: number };
type Spot = { x: number; y: number; anchor?: 'start' | 'middle' | 'end' };

/**
 * Places labels one at a time at the first candidate spot whose chip stays inside the canvas
 * and clear of the chips placed so far and of the points to avoid (arrow tips, handles).
 */
export function labelPlacer(w: number, h: number, avoid: { x: number; y: number }[] = []) {
  const boxes: Box[] = [];
  const hits = (a: Box, b: Box) =>
    !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  const clearOf = (b: Box) =>
    b.left >= 1 &&
    b.right <= w - 1 &&
    b.top >= 1 &&
    b.bottom <= h - 1 &&
    boxes.every((o) => !hits(o, b)) &&
    avoid.every(
      (p) => p.x < b.left - 4 || p.x > b.right + 4 || p.y < b.top - 4 || p.y > b.bottom + 4,
    );
  return {
    /** The chosen spot (the first clear one, else the first) with its anchor. */
    put(text: string, spots: Spot[], size: number = chart.label) {
      const all = spots.map((s) => ({ ...s, anchor: s.anchor ?? ('middle' as const) }));
      const pick = all.find((s) => clearOf(chipBox(s.x, s.y, text, s.anchor, size))) ?? all[0]!;
      boxes.push(chipBox(pick.x, pick.y, text, pick.anchor, size));
      return pick;
    },
    /** Marks a box as taken (a label drawn some other way). */
    take(b: Box) {
      boxes.push(b);
    },
    boxes,
  };
}

/**
 * Spots round a point, nearest first: right, left, above, below and the four corners, `gap`
 * px away.
 */
export const around = (x: number, y: number, gap = 10): Spot[] =>
  [gap, gap * 2.4].flatMap((g) => [
    { x: x + g, y: y + 4, anchor: 'start' as const },
    { x: x - g, y: y + 4, anchor: 'end' as const },
    { x, y: y - g, anchor: 'middle' as const },
    { x, y: y + g + 12, anchor: 'middle' as const },
    { x: x + g, y: y - g, anchor: 'start' as const },
    { x: x - g, y: y - g, anchor: 'end' as const },
    { x: x + g, y: y + g + 10, anchor: 'start' as const },
    { x: x - g, y: y + g + 10, anchor: 'end' as const },
  ]);

/** Points every 8 px along a segment, for labels to keep clear of. */
export function along(a: { x: number; y: number }, b: { x: number; y: number }) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8));
  return Array.from({ length: n + 1 }, (_, i) => ({
    x: a.x + ((b.x - a.x) * i) / n,
    y: a.y + ((b.y - a.y) * i) / n,
  }));
}

/** A right-angle mark at corner (x, y) between unit screen directions a and b, `s` px a side. */
export function RightAngle({
  x,
  y,
  a,
  b,
  s = 9,
  color,
}: {
  x: number;
  y: number;
  a: { x: number; y: number };
  b: { x: number; y: number };
  s?: number;
  color: string;
}) {
  const p1 = { x: x + a.x * s, y: y + a.y * s };
  const p2 = { x: x + a.x * s + b.x * s, y: y + a.y * s + b.y * s };
  const p3 = { x: x + b.x * s, y: y + b.y * s };
  return (
    <Path
      d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`}
      stroke={color}
      strokeWidth={1.5}
      fill="none"
    />
  );
}

/** A screen direction scaled to length 1 (0, 0 stays 0, 0). */
export const unit2 = (dx: number, dy: number) => {
  const l = Math.hypot(dx, dy);
  return l > 1e-9 ? { x: dx / l, y: dy / l } : { x: 0, y: 0 };
};

/**
 * The view (turn about z, tilt) from above and to one side that spreads the drawn vectors
 * most: the smallest screen angle between any two of them, or a vector and an axis, is as
 * large as it can be (turns 15°–75°, so x still comes toward the reader).
 */
export function bestView(vs: V3[]) {
  const axes: V3[] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  const live = vs.filter((p) => Math.hypot(p[0], p[1], p[2]) > 1e-9);
  let best = { turn: 32, tilt: 22, score: -1 };
  for (let turn = 15; turn <= 75; turn += 3)
    for (let tilt = 14; tilt <= 34; tilt += 4) {
      const view = viewOf(turn, tilt);
      const dir = (p: V3) => {
        const s = view(p);
        return Math.hypot(s.x, s.y) < 1e-6 * Math.hypot(...p) ? undefined : Math.atan2(s.y, s.x);
      };
      const gap = (a?: number, b?: number) => {
        if (a === undefined || b === undefined) return 0;
        const d = Math.abs(a - b) % (2 * Math.PI);
        return Math.min(d, 2 * Math.PI - d);
      };
      let score = Infinity;
      live.forEach((p, i) => {
        const a = dir(p);
        live.slice(i + 1).forEach((q) => (score = Math.min(score, gap(a, dir(q)))));
        axes.forEach((x) => (score = Math.min(score, 1.6 * gap(a, dir(x)))));
      });
      if (score > best.score + 1e-6) best = { turn, tilt, score };
    }
  return viewOf(best.turn, best.tilt);
}

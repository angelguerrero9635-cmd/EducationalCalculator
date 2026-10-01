/**
 * Shared pieces for the Grades 9–12 round 3 physics pictures of group H3A: a value reader in
 * formula units (the unit the page declares, whatever unit is shown), labels in the unit
 * shown, a curved arrow for turning, and a coiled spring. Flat.
 */
import { G, Path } from 'react-native-svg';

import { chart } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { num } from './CircularSatellite';
import { arrowHead } from './graphKit';

type X = number | string | undefined;

/**
 * Reads number-or-variable fields in formula units (`v`), whether each is known, and a label
 * for each in the unit shown (`text`: "0.25 m", or the fixed number with `unit`).
 */
export function useReader(calc: Calculator) {
  const rep = useRep(calc);
  const v = (x: X, fallback = 0) =>
    x === undefined ? fallback : typeof x === 'number' ? x : rep.val(x);
  const known = (x: X) => typeof x !== 'string' || rep.known(x);
  const text = (x: X, value: number, unit = '') =>
    typeof x === 'string'
      ? rep.value(x)
      : `${num(value)}${unit ? (unit === '°' ? '°' : ` ${unit}`) : ''}`;
  /** The unit the page's formula counts a variable in ("m", "N·m"), or `fallback`. */
  const unit = (x: X, fallback: string) =>
    typeof x === 'string' ? (rep.variable(x).unit ?? fallback) : fallback;
  return { rep, v, known, all: (...xs: X[]) => xs.every(known), text, unit };
}

/** A point on a circle at angle `a` (radians, counterclockwise from the right, y up). */
export const onCircle = (cx: number, cy: number, r: number, a: number) => ({
  x: cx + r * Math.cos(a),
  y: cy - r * Math.sin(a),
});

/**
 * An arc of radius r round (cx, cy) from angle `from` to `to` (radians, counterclockwise
 * positive) with a head at `to`: a turn counterclockwise when `to` > `from`.
 */
export function CurvedArrow({
  cx,
  cy,
  r,
  from,
  to,
  color,
  width = chart.strokeHeavy,
  head = 10,
  dash,
  opacity = 1,
}: {
  cx: number;
  cy: number;
  r: number;
  from: number;
  to: number;
  color: string;
  width?: number;
  head?: number;
  dash?: string;
  opacity?: number;
}) {
  const span = Math.max(-2 * Math.PI + 0.02, Math.min(2 * Math.PI - 0.02, to - from));
  if (Math.abs(span) * r < 4) return null;
  const ccw = span > 0;
  // Stop the line short of the head so its tip stays sharp.
  const back = Math.min(Math.abs(span) * 0.6, (head * 0.7) / r) * (ccw ? 1 : -1);
  const end = from + span;
  const a = onCircle(cx, cy, r, from);
  const b = onCircle(cx, cy, r, end - back);
  const tip = onCircle(cx, cy, r, end);
  const large = Math.abs(span - back) > Math.PI ? 1 : 0;
  const sweep = ccw ? 0 : 1;
  // The tangent at the tip, along the turn.
  const dx = (ccw ? -1 : 1) * Math.sin(end);
  const dy = (ccw ? -1 : 1) * Math.cos(end);
  return (
    <G opacity={opacity}>
      <Path
        d={`M ${a.x} ${a.y} A ${r} ${r} 0 ${large} ${sweep} ${b.x} ${b.y}`}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
        fill="none"
      />
      <Path d={arrowHead(tip.x, tip.y, dx, dy, head)} fill={color} />
    </G>
  );
}

/**
 * A coiled spring from (x1, y1) to (x2, y2) as a zigzag of `coils` turns `amp` px either side,
 * with a short straight lead at each end.
 */
export function springPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  coils = 9,
  amp = 8,
): string {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
  const [nx, ny] = [-uy, ux];
  const lead = Math.min(10, len * 0.12);
  const body = len - 2 * lead;
  const pts: string[] = [`M ${x1} ${y1}`, `L ${x1 + ux * lead} ${y1 + uy * lead}`];
  const n = coils * 2;
  for (let i = 1; i < n; i++) {
    const t = lead + (body * i) / n;
    const s = i % 2 ? amp : -amp;
    pts.push(`L ${x1 + ux * t + nx * s} ${y1 + uy * t + ny * s}`);
  }
  pts.push(`L ${x2 - ux * lead} ${y2 - uy * lead}`, `L ${x2} ${y2}`);
  return pts.join(' ');
}

/** A signed number in brackets for substituting: (−3). */
export const par = (s: string) => (s.startsWith('−') ? `(${s})` : s);

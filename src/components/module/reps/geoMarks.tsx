/**
 * The marks of a geometry figure, in canvas pixels (TriangleSolver, MarkedFigure,
 * CircleTheorems): tick marks for equal sides, arcs for equal angles, the right-angle square
 * and parallel arrows. Each draws exactly the count it is given.
 */
import { Path } from 'react-native-svg';

import { chart } from '@/theme';

export type Pt = readonly [number, number];

const unit = (p: Pt, q: Pt): Pt => {
  const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
  return [(q[0] - p[0]) / d, (q[1] - p[1]) / d];
};

/** `count` short strokes across the middle of pq (equal sides share a count). */
export function Ticks({ p, q, count, color }: { p: Pt; q: Pt; count: number; color: string }) {
  const [ux, uy] = unit(p, q);
  const mx = (p[0] + q[0]) / 2;
  const my = (p[1] + q[1]) / 2;
  const half = 6;
  const gap = 4;
  const d = Array.from({ length: count }, (_, i) => {
    const off = (i - (count - 1) / 2) * gap;
    const cx = mx + ux * off;
    const cy = my + uy * off;
    return `M ${cx - uy * half} ${cy + ux * half} L ${cx + uy * half} ${cy - ux * half}`;
  }).join(' ');
  return <Path d={d} stroke={color} strokeWidth={chart.strokeLight} />;
}

/** The direction from v to p, in radians (canvas y down). */
const dir = (v: Pt, p: Pt) => Math.atan2(p[1] - v[1], p[0] - v[0]);

/** The interior angle at v between rays to p and q as [start, sweep] (sweep under π). */
export function between(v: Pt, p: Pt, q: Pt): [number, number] {
  const a = dir(v, p);
  let s = dir(v, q) - a;
  while (s <= -Math.PI) s += 2 * Math.PI;
  while (s > Math.PI) s -= 2 * Math.PI;
  return [a, s];
}

/** A point `r` from v along the bisector of the angle pvq. */
export function inside(v: Pt, p: Pt, q: Pt, r: number): Pt {
  const [a, s] = between(v, p, q);
  const m = a + s / 2;
  return [v[0] + r * Math.cos(m), v[1] + r * Math.sin(m)];
}

/** `count` arcs in the angle pvq, radius r (equal angles share a count); filled when `fill`. */
export function Arcs({
  v,
  p,
  q,
  count,
  r,
  color,
  fill,
}: {
  v: Pt;
  p: Pt;
  q: Pt;
  count: number;
  r: number;
  color: string;
  fill?: string;
}) {
  const [a, s] = between(v, p, q);
  const at = (rr: number, t: number): Pt => [v[0] + rr * Math.cos(t), v[1] + rr * Math.sin(t)];
  const sweep = s > 0 ? 1 : 0;
  const arc = (rr: number) => {
    const [x1, y1] = at(rr, a);
    const [x2, y2] = at(rr, a + s);
    return `M ${x1} ${y1} A ${rr} ${rr} 0 0 ${sweep} ${x2} ${y2}`;
  };
  const [x1, y1] = at(r, a);
  const [x2, y2] = at(r, a + s);
  return (
    <>
      {fill ? (
        <Path
          d={`M ${v[0]} ${v[1]} L ${x1} ${y1} A ${r} ${r} 0 0 ${sweep} ${x2} ${y2} Z`}
          fill={fill}
          opacity={0.28}
        />
      ) : null}
      <Path
        d={Array.from({ length: Math.max(1, count) }, (_, i) => arc(r + i * 4)).join(' ')}
        stroke={color}
        strokeWidth={chart.strokeLight}
        fill="none"
        opacity={count === 0 ? 0 : 1}
      />
    </>
  );
}

/** The small square of a right angle at v between the rays to p and q. */
export function RightMark({
  v,
  p,
  q,
  size = 10,
  color,
}: {
  v: Pt;
  p: Pt;
  q: Pt;
  size?: number;
  color: string;
}) {
  const [ax, ay] = unit(v, p);
  const [bx, by] = unit(v, q);
  const p1: Pt = [v[0] + ax * size, v[1] + ay * size];
  const p2: Pt = [p1[0] + bx * size, p1[1] + by * size];
  const p3: Pt = [v[0] + bx * size, v[1] + by * size];
  return (
    <Path
      d={`M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]}`}
      stroke={color}
      strokeWidth={chart.strokeLight}
      fill="none"
    />
  );
}

/** `count` arrowheads at the middle of pq pointing from p to q (parallel lines share a count). */
export function ParallelArrows({
  p,
  q,
  count,
  color,
  at = 0.5,
}: {
  p: Pt;
  q: Pt;
  count: number;
  color: string;
  /** Where along pq (0 to 1). */
  at?: number;
}) {
  const [ux, uy] = unit(p, q);
  const mx = p[0] + (q[0] - p[0]) * at;
  const my = p[1] + (q[1] - p[1]) * at;
  const d = Array.from({ length: count }, (_, i) => {
    const off = (i - (count - 1) / 2) * 6 + 3;
    const tx = mx + ux * off;
    const ty = my + uy * off;
    const bx = tx - ux * 7;
    const by = ty - uy * 7;
    return `M ${bx - uy * 5} ${by + ux * 5} L ${tx} ${ty} L ${bx + uy * 5} ${by - ux * 5}`;
  }).join(' ');
  return <Path d={d} stroke={color} strokeWidth={chart.stroke} fill="none" />;
}

/** A point `gap` px outside segment pq's middle, away from `center` (for its label). */
export function outside(p: Pt, q: Pt, center: Pt, gap: number): Pt {
  const mx = (p[0] + q[0]) / 2;
  const my = (p[1] + q[1]) / 2;
  const [ux, uy] = unit(p, q);
  let nx = -uy;
  let ny = ux;
  if ((center[0] - mx) * nx + (center[1] - my) * ny > 0) [nx, ny] = [-nx, -ny];
  return [mx + nx * gap, my + ny * gap];
}

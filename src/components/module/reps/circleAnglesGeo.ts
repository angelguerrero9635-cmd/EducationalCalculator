/**
 * The figures of `circleTheorems` `cyclic` and `arcAngle` (H96, group H2B), in math
 * coordinates (y up, center O at the origin, radius 1), from the values. Values that break the
 * theorem make no figure: `reason` says why (drawn faded). CircleAngles.tsx and the harness use
 * it. Plain math.
 */
import { formatNumber } from '@/engine/format';

import type { CircleTheoremsSpec } from '@/data/modules/typesHsc';

export type P2 = [number, number];

export interface AngleFigure {
  pts: Record<string, P2>;
  /** Points on the circle. */
  onCircle: string[];
  /** cyclic: the angles at A, B, C, D as drawn (degrees). */
  angles?: { A: number; B: number; C: number; D: number };
  /** arcAngle: 1 inside (vertex E), −1 outside (vertex P); the two arcs, the angle. */
  where?: 1 | -1;
  arcs?: [number, number];
  angle?: number;
  reason?: string;
}

const rad = (d: number) => (d * Math.PI) / 180;
const on = (deg: number): P2 => [Math.cos(rad(deg)), Math.sin(rad(deg))];
const n = (x: number) => formatNumber(Number(x.toFixed(2)));
const close = (x: number, y: number) => Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(x));

/** Where lines p1p2 and p3p4 cross. */
function cross(p1: P2, p2: P2, p3: P2, p4: P2): P2 {
  const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  const a = p1[0] * p2[1] - p1[1] * p2[0];
  const b = p3[0] * p4[1] - p3[1] * p4[0];
  return [
    (a * (p3[0] - p4[0]) - (p1[0] - p2[0]) * b) / d,
    (a * (p3[1] - p4[1]) - (p1[1] - p2[1]) * b) / d,
  ];
}

/** The angle at v between the rays to p and q, in degrees. */
export function angleDeg(v: P2, p: P2, q: P2): number {
  const u = [p[0] - v[0], p[1] - v[1]];
  const w = [q[0] - v[0], q[1] - v[1]];
  const c = (u[0]! * w[0]! + u[1]! * w[1]!) / (Math.hypot(u[0]!, u[1]!) * Math.hypot(w[0]!, w[1]!));
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}

export function buildAngles(
  spec: CircleTheoremsSpec,
  num: (x: string | number | undefined) => number | undefined,
): AngleFigure {
  const f: AngleFigure = { pts: { O: [0, 0] }, onCircle: [] };
  if (spec.theorem === 'cyclic') {
    const q = spec.cyclic ?? {};
    const [A, B, C, D] = [q.A, q.B, q.C, q.D].map(num);
    // A and B place the figure (from C and D when those are the values typed).
    const a = A ?? (C !== undefined ? 180 - C : 84);
    const b = B ?? (D !== undefined ? 180 - D : 100);
    if (!(a > 0 && a < 180 && b > 0 && b < 180))
      f.reason = 'Each angle of an inscribed quadrilateral is between 0° and 180°.';
    else if (A !== undefined && C !== undefined && !close(A + C, 180))
      f.reason = `Opposite angles add to 180°: ${n(A)}° + ${n(C)}° ≠ 180°.`;
    else if (B !== undefined && D !== undefined && !close(B + D, 180))
      f.reason = `Opposite angles add to 180°: ${n(B)}° + ${n(D)}° ≠ 180°.`;
    const aa = f.reason ? 84 : a;
    // Arcs AB = p, BC = q, CD = r, DA = s: ∠A = (q + r) ÷ 2, ∠B = (r + s) ÷ 2. The free arc r
    // (and ∠B when no value gives it) is chosen so the smallest of the four is as big as it
    // can be.
    let best = { r: 0, b: 100, min: -Infinity };
    const bs =
      f.reason || B !== undefined || D !== undefined
        ? [f.reason ? 100 : b]
        : Array.from({ length: 89 }, (_, k) => 2 + 2 * k);
    for (const bb of bs) {
      const lo = Math.max(0, 2 * aa + 2 * bb - 360);
      const hi = Math.min(2 * aa, 2 * bb);
      for (let k = 1; k < 100; k++) {
        const r = lo + ((hi - lo) * k) / 100;
        const arcs = [360 - 2 * aa - 2 * bb + r, 2 * aa - r, r, 2 * bb - r];
        const m = Math.min(...arcs);
        if (m > best.min) best = { r, b: bb, min: m };
      }
    }
    const bb = best.b;
    const r = best.r;
    const [p, qq] = [360 - 2 * aa - 2 * bb + r, 2 * aa - r];
    // A at the lower left, then B, C, D counterclockwise.
    const start = 200;
    f.pts.A = on(start);
    f.pts.B = on(start + p);
    f.pts.C = on(start + p + qq);
    f.pts.D = on(start + p + qq + r);
    f.onCircle = ['A', 'B', 'C', 'D'];
    const at = (v: string, x: string, y: string) => angleDeg(f.pts[v]!, f.pts[x]!, f.pts[y]!);
    f.angles = {
      A: at('A', 'D', 'B'),
      B: at('B', 'A', 'C'),
      C: at('C', 'B', 'D'),
      D: at('D', 'C', 'A'),
    };
    return f;
  }
  if (spec.theorem === 'arcAngle' && spec.arcAngle) {
    const s = spec.arcAngle;
    const w = num(s.where);
    // The + − box's code: 1 (+) inside the circle, 2 (−) outside.
    const where: 1 | -1 = w === 2 ? -1 : 1;
    f.where = where;
    const [x, y] = s.arcs.map(num);
    const angle = num(s.angle);
    const inside = where === 1;
    // The example's arcs while one is "?".
    let a1 = x ?? (inside ? 70 : 140);
    let a2 = y ?? (inside ? 110 : 50);
    if (w !== undefined && w !== 1 && w !== 2)
      f.reason = 'The sign is + (1) for inside the circle, − (2) for outside.';
    else if (!(a1 > 0 && a2 > 0)) f.reason = 'Each arc is more than 0°.';
    else if (a1 + a2 >= 360)
      f.reason = `The two arcs are part of 360°: ${n(a1 + a2)}° is too much.`;
    else if (!inside && !(a1 > a2))
      f.reason = `Outside the circle the far arc is the bigger one: ${n(a1)}° is not more than ${n(a2)}°.`;
    else if (angle !== undefined && !close(angle, (a1 + where * a2) / 2))
      f.reason = inside
        ? `Inside, the angle is half the sum of its arcs: (${n(a1)}° + ${n(a2)}°) ÷ 2 ≠ ${n(angle)}°.`
        : `Outside, the angle is half the difference of its arcs: (${n(a1)}° − ${n(a2)}°) ÷ 2 ≠ ${n(angle)}°.`;
    if (f.reason) [a1, a2] = inside ? [70, 110] : [140, 50];
    if (inside) {
      // Arc AC at the top, arc BD at the bottom; chords AB and CD cross at E.
      f.pts.C = on(90 - a1 / 2);
      f.pts.A = on(90 + a1 / 2);
      f.pts.D = on(270 - a2 / 2);
      f.pts.B = on(270 + a2 / 2);
      f.pts.E = cross(f.pts.A, f.pts.B, f.pts.C, f.pts.D);
      f.angle = angleDeg(f.pts.E, f.pts.A, f.pts.C);
    } else {
      // The far arc BD on the right, the near arc AC on the left; the secants meet at P.
      f.pts.B = on(a1 / 2);
      f.pts.D = on(-a1 / 2);
      f.pts.A = on(180 - a2 / 2);
      f.pts.C = on(180 + a2 / 2);
      f.pts.P = cross(f.pts.A, f.pts.B, f.pts.C, f.pts.D);
      f.angle = angleDeg(f.pts.P, f.pts.B, f.pts.D);
    }
    f.arcs = [a1, a2];
    f.onCircle = ['A', 'B', 'C', 'D'];
  }
  return f;
}

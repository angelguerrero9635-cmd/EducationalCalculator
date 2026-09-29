/**
 * The figure a `circleTheorems` picture draws, in math coordinates (y up, the center O at the
 * origin), from the values: the circle's radius, the named points on or off it, and the
 * segments whose lengths are values. Values that break the theorem make no figure: `reason`
 * says why (the picture then draws faded). CircleTheorems.tsx and its harness check use it.
 */
import { formatNumber } from '@/engine/format';

import type { CircleTheoremsSpec } from '@/data/modules/typesHsc';

export type C2 = [number, number];

export interface CircleFigure {
  R: number;
  pts: Record<string, C2>;
  /** Points that lie on the circle. */
  onCircle: string[];
  /** Segments whose drawn length is a value: [from, to, value id]. */
  measured: [string, string, string][];
  /** The inscribed-angle arc AB in degrees (the central angle). */
  arc?: number;
  reason?: string;
}

const rad = (d: number) => (d * Math.PI) / 180;
const at = (R: number, deg: number): C2 => [R * Math.cos(rad(deg)), R * Math.sin(rad(deg))];
const n = (x: number) => formatNumber(Number(x.toFixed(2)));
const close = (x: number, y: number) => Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(x));

/**
 * The figure from the values. `p` is where P sits on the circle (degrees) for the inscribed
 * angle, which the values leave free.
 */
export function buildCircle(
  spec: CircleTheoremsSpec,
  num: (id: string | undefined) => number | undefined,
  p = 90,
): CircleFigure {
  const f: CircleFigure = { R: 1, pts: { O: [0, 0] }, onCircle: [], measured: [] };
  const raw = (spec.segments ?? []).map(num);
  const segs = raw.some((x) => x === undefined) ? raw.map(() => undefined) : raw;
  // Lengths drawn to scale need them all: a "?" draws the example's shape, faded.
  if (raw.some((x) => x === undefined)) f.reason = 'Type every length to draw the figure to scale.';
  switch (spec.theorem) {
    case 'inscribed': {
      const central = num(spec.central);
      const ins = num(spec.inscribed);
      const c = central ?? (ins !== undefined ? 2 * ins : 100);
      if (!(c > 0 && c < 360)) f.reason = 'A central angle is between 0° and 360°.';
      else if (central !== undefined && ins !== undefined && !close(ins, central / 2))
        f.reason = `An inscribed angle is half its arc: ${n(ins)}° is not half of ${n(central)}°.`;
      const cc = Math.min(359, Math.max(1, c));
      f.arc = cc;
      f.pts.A = at(1, -90 - cc / 2);
      f.pts.B = at(1, -90 + cc / 2);
      // P anywhere on the far arc; kept off the ends.
      const margin = Math.min(4, (360 - cc) / 4);
      const lo = -90 + cc / 2 + margin;
      const hi = 270 - cc / 2 - margin;
      f.pts.P = at(1, Math.min(hi, Math.max(lo, p)));
      f.onCircle = ['A', 'B', 'P'];
      break;
    }
    case 'semicircle': {
      const a = num(spec.angle);
      const b = num(spec.other);
      const alpha = a ?? (b !== undefined ? 90 - b : 30);
      if (!(alpha > 0 && alpha < 90))
        f.reason = 'Each angle at the diameter is between 0° and 90°.';
      else if (a !== undefined && b !== undefined && !close(a + b, 90))
        f.reason = `The angle at P is 90°, so the other two add to 90°: ${n(a)}° + ${n(b)}° ≠ 90°.`;
      f.pts.A = [-1, 0];
      f.pts.B = [1, 0];
      // The angle at A is half the central angle POB.
      f.pts.P = at(1, 2 * Math.min(89, Math.max(1, alpha)));
      f.onCircle = ['A', 'B', 'P'];
      break;
    }
    case 'tangent': {
      const r = num(spec.radius);
      const t = num(spec.tangent);
      const d = num(spec.distance);
      const R =
        r ?? (d !== undefined && t !== undefined ? Math.sqrt(Math.max(0, d * d - t * t)) : 3);
      const T = t ?? (d !== undefined ? Math.sqrt(Math.max(0, d * d - R * R)) : 4);
      if (!(R > 0)) f.reason = 'The radius must be longer than 0.';
      else if (d !== undefined && !(d > R))
        f.reason = `P must be outside the circle: OP = ${n(d)} is not longer than r = ${n(R)}.`;
      else if (
        r !== undefined &&
        t !== undefined &&
        d !== undefined &&
        !close(r * r + t * t, d * d)
      )
        f.reason = `The radius meets the tangent at a right angle, so r² + t² = d²: ${n(r * r + t * t)} ≠ ${n(d * d)}.`;
      f.R = R > 0 ? R : 1;
      f.pts.T = [0, f.R];
      f.pts.P = [Math.max(0, T), f.R];
      f.onCircle = ['T'];
      if (spec.radius) f.measured.push(['O', 'T', spec.radius]);
      if (spec.tangent) f.measured.push(['P', 'T', spec.tangent]);
      if (spec.distance) f.measured.push(['O', 'P', spec.distance]);
      break;
    }
    case 'chords': {
      const [a, b, c, d] = segs;
      if ([a, b, c, d].some((x) => x !== undefined && !(x > 0)))
        f.reason = 'Every part of a chord is longer than 0.';
      else if ([a, b, c, d].every((x) => x !== undefined) && !close(a! * b!, c! * d!))
        f.reason = `Crossing chords: AE × EB = CE × ED, but ${n(a! * b!)} ≠ ${n(c! * d!)}.`;
      const [A1, B1, C1, D1] = [a ?? 4, b ?? 6, c ?? 3, d ?? 8].map((x) => Math.max(0.01, x));
      const power = A1! * B1!;
      const e = Math.max(Math.abs(A1! - B1!), Math.abs(C1! - D1!)) / 2 + 0.12 * Math.sqrt(power);
      f.R = Math.sqrt(power + e * e);
      const E: C2 = [e, 0];
      const chord = (x: number, y: number, sgn: number) => {
        const phi = sgn * Math.acos(Math.max(-1, Math.min(1, (x - y) / (2 * e))));
        const u: C2 = [Math.cos(phi), Math.sin(phi)];
        return [
          [E[0] - x * u[0], E[1] - x * u[1]],
          [E[0] + y * u[0], E[1] + y * u[1]],
        ] as [C2, C2];
      };
      [f.pts.A, f.pts.B] = chord(A1!, B1!, 1);
      // The second chord on whichever side crosses the first nearer a right angle.
      const tilt = (sgn: number) => {
        const u = (x: number, y: number) => Math.acos(Math.max(-1, Math.min(1, (x - y) / (2 * e))));
        const d = Math.abs(u(A1!, B1!) - sgn * u(C1!, D1!)) % Math.PI;
        return Math.abs(d - Math.PI / 2);
      };
      [f.pts.C, f.pts.D] = chord(C1!, D1!, tilt(-1) <= tilt(1) ? -1 : 1);
      f.pts.E = E;
      f.onCircle = ['A', 'B', 'C', 'D'];
      const ids = spec.segments ?? [];
      (
        [
          ['A', 'E'],
          ['E', 'B'],
          ['C', 'E'],
          ['E', 'D'],
        ] as const
      ).forEach(([x, y], i) => ids[i] && f.measured.push([x, y, ids[i]!]));
      break;
    }
    case 'secants':
    case 'secantTangent': {
      const tangent = spec.theorem === 'secantTangent';
      // Secants: PA (outside part) and PB (whole), PC and PD. Secant–tangent: PT, PA, PB.
      const [s0, s1, s2, s3] = segs;
      const pairs: [number | undefined, number | undefined][] = tangent
        ? [
            [s0, s0],
            [s1, s2],
          ]
        : [
            [s0, s1],
            [s2, s3],
          ];
      if (segs.some((x) => x !== undefined && !(x > 0)))
        f.reason = 'Every length must be longer than 0.';
      else if (pairs.some(([o, w]) => o !== undefined && w !== undefined && w < o - 1e-9))
        f.reason = 'A whole secant is longer than its outside part.';
      else if (pairs.every(([o, w]) => o !== undefined && w !== undefined)) {
        const [x, y] = pairs.map(([o, w]) => o! * w!) as [number, number];
        if (!close(x, y))
          f.reason = tangent
            ? `PT² = PA × PB, but ${n(x)} ≠ ${n(y)}.`
            : `PA × PB = PC × PD, but ${n(x)} ≠ ${n(y)}.`;
      }
      const safe = pairs.map(([o, w], i) => {
        // The example's lengths while one is "?" (tangent: PT = 6 with 4 and 9).
        const [o0, w0] =
          tangent && i === 0 ? [6, 6] : i === 0 ? [4, 9] : tangent ? [4, 9] : [3, 12];
        const oo = Math.max(0.01, o ?? o0);
        return [oo, Math.max(oo, w ?? w0)] as [number, number];
      });
      const power = safe[0]![0] * safe[0]![1];
      const L = safe.map(([o, w]) => w - o);
      f.R = Math.max(Math.max(...L) / 2 / 0.9, 0.45 * Math.sqrt(power));
      const d = Math.sqrt(power + f.R * f.R);
      const P: C2 = [-d, 0];
      f.pts.P = P;
      const along = (o: number, w: number, sgn: number) => {
        const h = Math.sqrt(Math.max(0, f.R * f.R - ((w - o) / 2) ** 2));
        const psi = sgn * Math.asin(Math.min(1, h / d));
        const u: C2 = [Math.cos(psi), Math.sin(psi)];
        return [
          [P[0] + o * u[0], P[1] + o * u[1]],
          [P[0] + w * u[0], P[1] + w * u[1]],
        ] as [C2, C2];
      };
      const ids = spec.segments ?? [];
      if (tangent) {
        [f.pts.T] = along(safe[0]![0], safe[0]![0], 1);
        [f.pts.A, f.pts.B] = along(safe[1]![0], safe[1]![1], -1);
        f.onCircle = ['T', 'A', 'B'];
        (
          [
            ['P', 'T'],
            ['P', 'A'],
            ['P', 'B'],
          ] as const
        ).forEach(([x, y], i) => ids[i] && f.measured.push([x, y, ids[i]!]));
      } else {
        [f.pts.A, f.pts.B] = along(safe[0]![0], safe[0]![1], 1);
        [f.pts.C, f.pts.D] = along(safe[1]![0], safe[1]![1], -1);
        f.onCircle = ['A', 'B', 'C', 'D'];
        (
          [
            ['P', 'A'],
            ['P', 'B'],
            ['P', 'C'],
            ['P', 'D'],
          ] as const
        ).forEach(([x, y], i) => ids[i] && f.measured.push([x, y, ids[i]!]));
      }
      break;
    }
  }
  return f;
}

/** Where the drawn figure breaks its own claims (the harness). */
export function circleIssues(
  f: CircleFigure,
  spec: CircleTheoremsSpec,
  num: (id: string | undefined) => number | undefined,
): string[] {
  const out: string[] = [];
  if (f.reason) return [`~circle figure can't be drawn: ${f.reason}`];
  const len = (a: string, b: string) =>
    Math.hypot(f.pts[a]![0] - f.pts[b]![0], f.pts[a]![1] - f.pts[b]![1]);
  for (const p of f.onCircle) {
    if (!close(Math.hypot(...f.pts[p]!), f.R)) out.push(`${p} is off the circle`);
  }
  for (const [a, b, id] of f.measured) {
    const x = num(id);
    if (x !== undefined && !close(len(a, b), x)) out.push(`${a}${b} drawn ${len(a, b)} for ${x}`);
  }
  const angle = (v: string, a: string, b: string) => {
    const [vx, vy] = f.pts[v]!;
    const u = [f.pts[a]![0] - vx, f.pts[a]![1] - vy];
    const w = [f.pts[b]![0] - vx, f.pts[b]![1] - vy];
    return (
      (Math.acos(
        Math.max(
          -1,
          Math.min(
            1,
            (u[0]! * w[0]! + u[1]! * w[1]!) / (Math.hypot(u[0]!, u[1]!) * Math.hypot(w[0]!, w[1]!)),
          ),
        ),
      ) *
        180) /
      Math.PI
    );
  };
  if (spec.theorem === 'inscribed') {
    const c = num(spec.central);
    const i = num(spec.inscribed);
    // The drawn inscribed angle is half the drawn arc, and matches the values.
    const arc = c ?? (i !== undefined ? 2 * i : undefined);
    if (arc !== undefined && !close(angle('P', 'A', 'B'), arc / 2))
      out.push(`inscribed angle drawn ${angle('P', 'A', 'B')} for an arc of ${arc}`);
  }
  if (spec.theorem === 'semicircle') {
    if (!close(angle('P', 'A', 'B'), 90)) out.push('the angle in a semicircle is not drawn 90°');
    const a = num(spec.angle);
    if (a !== undefined && !close(angle('A', 'P', 'B'), a)) out.push(`angle at A drawn for ${a}`);
  }
  if (spec.theorem === 'tangent' && !close(angle('T', 'O', 'P'), 90) && len('P', 'T') > 1e-9)
    out.push('the tangent is not at right angles to the radius');
  if (spec.theorem === 'secantTangent' && !close(angle('T', 'O', 'P'), 90))
    out.push('PT is not a tangent');
  return out;
}

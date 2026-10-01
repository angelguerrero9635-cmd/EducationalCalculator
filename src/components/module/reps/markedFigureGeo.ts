/**
 * The figure a `markedFigure` draws, in math coordinates (y up), worked out from the spec and
 * the values: points, segments, lines and circles, and every mark with what it claims (ticks:
 * equal lengths, arcs: equal angles, a square: a right angle, arrows: parallel). The marks are
 * placed from the figure itself, and the harness checks each claim on the drawn points.
 */
import type { FigurePart, MarkedFigureSpec } from '@/data/modules/typesHsc';

import { rayPoint } from './hs2h';

export type P2 = [number, number];

export interface Figure {
  pts: Record<string, P2>;
  /** Segments by point names; `line` runs on past both ends, `ray` past the second. */
  segs: { a: string; b: string; kind: 'segment' | 'ray' | 'line'; dashed?: boolean }[];
  ticks: { a: string; b: string; count: number }[];
  /** Angle vpq marks: the angle at v from p to q. */
  arcs: { v: string; p: string; q: string; count: number }[];
  rights: { v: string; p: string; q: string }[];
  parallels: { a: string; b: string; count: number }[];
  circles: { c: string; r: number; dashed?: boolean }[];
  /** Text on a segment ('AB') or in an angle ('ABC'); `value` is the value id it shows. */
  labels: { at: string; value?: string; text?: string; inCaption?: boolean }[];
  /** Angle numbers (transversal): text in the angle vpq. */
  numbers: { v: string; p: string; q: string; n: number }[];
  /** Point names to write beside their points. */
  named: string[];
  /** Why the values can't make the figure (drawn faded), if they can't. */
  reason?: string;
}

const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;
const sub = (p: P2, q: P2): P2 => [p[0] - q[0], p[1] - q[1]];
const len = (p: P2, q: P2) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const mid = (p: P2, q: P2): P2 => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
const lerp = (p: P2, q: P2, t: number): P2 => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];

/** The angle at v between the rays to p and q, degrees (0 to 180). */
export function angleAt(v: P2, p: P2, q: P2): number {
  const a = sub(p, v);
  const b = sub(q, v);
  const c = (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b) || 1);
  return deg(Math.acos(Math.max(-1, Math.min(1, c))));
}
/** The foot of the perpendicular from p to the line ab. */
function foot(p: P2, a: P2, b: P2): P2 {
  const d = sub(b, a);
  const t = ((p[0] - a[0]) * d[0] + (p[1] - a[1]) * d[1]) / (d[0] * d[0] + d[1] * d[1]);
  return lerp(a, b, t);
}
/** Where lines p1p2 and q1q2 cross. */
function cross(p1: P2, p2: P2, q1: P2, q2: P2): P2 {
  const d1 = sub(p2, p1);
  const d2 = sub(q2, q1);
  const den = d1[0] * d2[1] - d1[1] * d2[0];
  const t = ((q1[0] - p1[0]) * d2[1] - (q1[1] - p1[1]) * d2[0]) / den;
  return [p1[0] + d1[0] * t, p1[1] + d1[1] * t];
}

const empty = (): Figure => ({
  pts: {},
  segs: [],
  ticks: [],
  arcs: [],
  rights: [],
  parallels: [],
  circles: [],
  labels: [],
  numbers: [],
  named: [],
});

/** The triangle from its three sides a = BC, b = CA, c = AB: B at the origin, C along x. */
function fromSides(a: number, b: number, c: number): { pts: Record<string, P2>; reason?: string } {
  const big = Math.max(a, b, c);
  if (!(a > 0 && b > 0 && c > 0)) return { pts: {}, reason: 'Every side must be longer than 0.' };
  if (2 * big >= a + b + c - 1e-9)
    return { pts: {}, reason: 'The longest side must be shorter than the other two together.' };
  const B = Math.acos((a * a + c * c - b * b) / (2 * a * c));
  return { pts: { A: [c * Math.cos(B), c * Math.sin(B)], B: [0, 0], C: [a, 0] } };
}

/**
 * The figure from a spec; `num` reads a value (a number, or a value id's current value, or
 * undefined when it is "?").
 */
export function buildFigure(
  spec: MarkedFigureSpec,
  num: (x: string | number | undefined) => number | undefined,
): Figure {
  const f = empty();
  if (spec.transversal) return transversal(spec, num);
  if (spec.quadrilateral) return quadrilateral(spec, num);
  // Named points (and the triangle preset's corners).
  for (const [name, p] of Object.entries(spec.points ?? {})) {
    if (!Array.isArray(p)) continue;
    const px = num(p[0]);
    const py = num(p[1]);
    if (px === undefined || py === undefined)
      f.reason = f.reason ?? 'Type the values that place the points.';
    f.pts[name] = [px ?? 0, py ?? 0];
  }
  // H105: points on rays at a degree value, placed after the coordinate points.
  for (const [name, p] of Object.entries(spec.points ?? {})) {
    if (Array.isArray(p)) continue;
    const placed = rayPoint(f.pts, p, num);
    if (placed.reason) f.reason = f.reason ?? placed.reason;
    f.pts[name] = placed.at;
  }
  if (spec.triangle) {
    const t = spec.triangle;
    if (t.sides) {
      const [a, b, c] = t.sides.map(num);
      if (a === undefined || b === undefined || c === undefined)
        f.reason = f.reason ?? 'Type the three sides.';
      const made = fromSides(a ?? 3, b ?? 4, c ?? 5);
      if (made.reason) {
        f.reason = made.reason;
        Object.assign(f.pts, fromSides(3, 4, 5).pts);
      } else Object.assign(f.pts, made.pts);
    }
    triangleParts(f, t);
  }
  for (const part of spec.parts ?? []) addPart(f, part);
  if (f.named.length === 0) f.named = Object.keys(f.pts);
  return f;
}

function addPart(f: Figure, part: FigurePart) {
  const two = (s: string) => [s[0]!, s.slice(1)] as const;
  if ('segment' in part) {
    const [a, b] = two(part.segment);
    f.segs.push({ a, b, kind: 'segment', dashed: part.dashed });
  } else if ('ray' in part) {
    const [a, b] = two(part.ray);
    f.segs.push({ a, b, kind: 'ray' });
  } else if ('line' in part) {
    const [a, b] = two(part.line);
    f.segs.push({ a, b, kind: 'line', dashed: part.dashed });
  } else if ('ticks' in part) {
    const [a, b] = two(part.ticks);
    f.ticks.push({ a, b, count: part.count });
  } else if ('arcs' in part) {
    const [p, v, q] = [...part.arcs] as [string, string, string];
    f.arcs.push({ v, p, q, count: part.count });
  } else if ('right' in part) {
    const [p, v, q] = [...part.right] as [string, string, string];
    f.rights.push({ v, p, q });
  } else if ('parallel' in part) {
    const [a, b] = two(part.parallel);
    f.parallels.push({ a, b, count: part.count });
  } else if ('circle' in part) {
    const c = f.pts[part.circle];
    const t = f.pts[part.through];
    if (c && t) f.circles.push({ c: part.circle, r: len(c, t), dashed: part.dashed });
  } else
    f.labels.push({
      at: part.label,
      value: part.value,
      text: part.text,
      inCaption: part.inCaption,
    });
}

/** The triangle preset's lines, center and marks on the corners A, B, C. */
function triangleParts(f: Figure, t: NonNullable<MarkedFigureSpec['triangle']>) {
  const { A, B, C } = f.pts as Record<'A' | 'B' | 'C', P2>;
  if (!A || !B || !C) return;
  f.segs.push(
    { a: 'A', b: 'B', kind: 'segment' },
    { a: 'B', b: 'C', kind: 'segment' },
    { a: 'C', b: 'A', kind: 'segment' },
  );
  const a = len(B, C);
  const b = len(C, A);
  const c = len(A, B);
  const labels = t.labels ?? {};
  f.labels.push(...Object.entries(labels).map(([at, value]) => ({ at, value })));
  f.named = ['A', 'B', 'C'];
  switch (t.lines) {
    case 'median': {
      f.pts.D = mid(B, C);
      f.pts.E = mid(C, A);
      f.pts.F = mid(A, B);
      f.segs.push(
        { a: 'A', b: 'D', kind: 'segment' },
        { a: 'B', b: 'E', kind: 'segment' },
        { a: 'C', b: 'F', kind: 'segment' },
      );
      f.ticks.push(
        { a: 'B', b: 'D', count: 1 },
        { a: 'D', b: 'C', count: 1 },
        { a: 'C', b: 'E', count: 2 },
        { a: 'E', b: 'A', count: 2 },
        { a: 'A', b: 'F', count: 3 },
        { a: 'F', b: 'B', count: 3 },
      );
      f.named.push('D', 'E', 'F');
      if (t.center) {
        f.pts.G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
        f.named.push('G');
      }
      break;
    }
    case 'bisector': {
      // Each bisector meets the far side where it splits it in the ratio of the other two.
      f.pts.D = lerp(B, C, c / (b + c));
      f.pts.E = lerp(C, A, a / (a + c));
      f.pts.F = lerp(A, B, b / (a + b));
      f.segs.push(
        { a: 'A', b: 'D', kind: 'segment' },
        { a: 'B', b: 'E', kind: 'segment' },
        { a: 'C', b: 'F', kind: 'segment' },
      );
      f.arcs.push(
        { v: 'A', p: 'B', q: 'D', count: 1 },
        { v: 'A', p: 'D', q: 'C', count: 1 },
        { v: 'B', p: 'C', q: 'E', count: 2 },
        { v: 'B', p: 'E', q: 'A', count: 2 },
        { v: 'C', p: 'A', q: 'F', count: 3 },
        { v: 'C', p: 'F', q: 'B', count: 3 },
      );
      f.named.push('D', 'E', 'F');
      if (t.center) {
        const s = a + b + c;
        const I: P2 = [(a * A[0] + b * B[0] + c * C[0]) / s, (a * A[1] + b * B[1] + c * C[1]) / s];
        f.pts.I = I;
        f.pts.T = foot(I, B, C);
        f.circles.push({ c: 'I', r: len(I, f.pts.T), dashed: true });
        f.segs.push({ a: 'I', b: 'T', kind: 'segment', dashed: true });
        f.rights.push({ v: 'T', p: 'I', q: 'C' });
        f.named.push('I');
      }
      break;
    }
    case 'perpendicular': {
      f.pts.D = mid(B, C);
      f.pts.E = mid(C, A);
      f.pts.F = mid(A, B);
      const O = circumcenter(A, B, C);
      f.pts.O = O;
      // Each bisector from its midpoint through O (the center lies on all three).
      for (const [m, p, q] of [
        ['D', 'B', 'C'],
        ['E', 'C', 'A'],
        ['F', 'A', 'B'],
      ] as const) {
        const M = f.pts[m]!;
        // The line through M at right angles to pq, drawn a little past O.
        const d = sub(f.pts[q]!, f.pts[p]!);
        const nrm: P2 = [-d[1], d[0]];
        const k = Math.hypot(...nrm);
        const reach = Math.max(len(M, O) * 1.25, 0.35 * Math.max(a, b, c));
        const sgn = (O[0] - M[0]) * nrm[0] + (O[1] - M[1]) * nrm[1] >= 0 ? 1 : -1;
        const end = `${m}′`;
        f.pts[end] = [M[0] + (sgn * nrm[0] * reach) / k, M[1] + (sgn * nrm[1] * reach) / k];
        f.segs.push({ a: m, b: end, kind: 'segment' });
        f.rights.push({ v: m, p: end, q });
        f.ticks.push({ a: p, b: m, count: 1 + ['D', 'E', 'F'].indexOf(m) });
        f.ticks.push({ a: m, b: q, count: 1 + ['D', 'E', 'F'].indexOf(m) });
      }
      f.named.push('D', 'E', 'F');
      if (t.center) {
        f.circles.push({ c: 'O', r: len(O, A), dashed: true });
        f.segs.push({ a: 'O', b: 'A', kind: 'segment', dashed: true });
        f.named.push('O');
        // A right triangle's O is the hypotenuse's midpoint: one name there, not O over F.
        const scale = Math.max(a, b, c);
        f.named = f.named.filter(
          (n) => !['D', 'E', 'F'].includes(n) || len(f.pts[n]!, O) > 1e-6 * scale,
        );
      }
      break;
    }
    case 'altitude': {
      f.pts.D = foot(A, B, C);
      f.pts.E = foot(B, C, A);
      f.pts.F = foot(C, A, B);
      const H = cross(A, f.pts.D, B, f.pts.E);
      for (const [v, ft, s1, s2] of [
        ['A', 'D', 'B', 'C'],
        ['B', 'E', 'C', 'A'],
        ['C', 'F', 'A', 'B'],
      ] as const) {
        f.segs.push({ a: v, b: ft, kind: 'segment' });
        const F0 = f.pts[ft]!;
        // A foot past the side: the side runs on, dashed, to meet it.
        const onSide =
          Math.abs(len(f.pts[s1]!, F0) + len(F0, f.pts[s2]!) - len(f.pts[s1]!, f.pts[s2]!)) < 1e-9;
        if (!onSide) {
          const near = len(f.pts[s1]!, F0) < len(f.pts[s2]!, F0) ? s1 : s2;
          f.segs.push({ a: near, b: ft, kind: 'segment', dashed: true });
        }
        const other = len(f.pts[s1]!, F0) > 1e-9 ? s1 : s2;
        f.rights.push({ v: ft, p: v, q: other });
      }
      f.named.push('D', 'E', 'F');
      if (t.center) {
        f.pts.H = H;
        f.named.push('H');
        // An orthocenter outside the triangle: the altitudes run on, dashed, to meet there.
        for (const v of ['A', 'B', 'C'] as const) {
          const ft = { A: 'D', B: 'E', C: 'F' }[v];
          const V = f.pts[v]!;
          const F0 = f.pts[ft]!;
          if (len(V, H) > len(V, F0) + 1e-9 || len(F0, H) > len(V, F0) + 1e-9)
            f.segs.push({
              a: len(V, H) > len(F0, H) ? ft : v,
              b: 'H',
              kind: 'segment',
              dashed: true,
            });
        }
      }
      break;
    }
    case 'midsegment': {
      f.pts.D = mid(A, B);
      f.pts.E = mid(A, C);
      f.segs.push({ a: 'D', b: 'E', kind: 'segment' });
      f.ticks.push(
        { a: 'A', b: 'D', count: 1 },
        { a: 'D', b: 'B', count: 1 },
        { a: 'A', b: 'E', count: 2 },
        { a: 'E', b: 'C', count: 2 },
      );
      f.parallels.push({ a: 'D', b: 'E', count: 1 }, { a: 'B', b: 'C', count: 1 });
      f.named.push('D', 'E');
      break;
    }
  }
}

export function circumcenter(A: P2, B: P2, C: P2): P2 {
  const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
  const s = (p: P2) => p[0] * p[0] + p[1] * p[1];
  return [
    (s(A) * (B[1] - C[1]) + s(B) * (C[1] - A[1]) + s(C) * (A[1] - B[1])) / d,
    (s(A) * (C[0] - B[0]) + s(B) * (A[0] - C[0]) + s(C) * (B[0] - A[0])) / d,
  ];
}

/**
 * Two lines cut by a transversal: line 1 through P (level), line 2 through Q, the transversal
 * PQ. Angle 1 is the top left at P, 2 top right, 3 bottom left, 4 bottom right; 5–8 the same
 * at Q. With `second` (angle 5) unlike angle 1, line 2 tilts by the difference.
 */
function transversal(
  spec: MarkedFigureSpec,
  num: (x: string | number | undefined) => number | undefined,
): Figure {
  const f = empty();
  const t = spec.transversal!;
  const one = num(t.angle);
  const five = t.second === undefined ? one : num(t.second);
  const a1 = one ?? 60;
  const a5 = five ?? a1;
  if (!(a1 > 0 && a1 < 180) || !(a5 > 0 && a5 < 180))
    f.reason = 'An angle between a line and the transversal is between 0° and 180°.';
  const safe1 = Math.min(179, Math.max(1, a1));
  const safe5 = Math.min(179, Math.max(1, a5));
  // The transversal climbs at φ from the level; angle 1 (top left) is 180° − φ.
  const phi = 180 - safe1;
  const up: P2 = [Math.cos(rad(phi)), Math.sin(rad(phi))];
  const P: P2 = [0, 0];
  const Q: P2 = [-up[0] * 2.2, -up[1] * 2.2];
  // Line 2 turned by angle 5 − angle 1 (level when parallel).
  const tilt = safe5 - safe1;
  const dir: P2 = [Math.cos(rad(tilt)), Math.sin(rad(tilt))];
  const L = 2.2;
  f.pts = {
    P,
    Q,
    L1: [P[0] - L, P[1]],
    R1: [P[0] + L, P[1]],
    L2: [Q[0] - L * dir[0], Q[1] - L * dir[1]],
    R2: [Q[0] + L * dir[0], Q[1] + L * dir[1]],
    T1: [P[0] + up[0] * 1.3, P[1] + up[1] * 1.3],
    T2: [Q[0] - up[0] * 1.3, Q[1] - up[1] * 1.3],
  };
  f.segs.push(
    { a: 'L1', b: 'R1', kind: 'line' },
    { a: 'L2', b: 'R2', kind: 'line' },
    { a: 'T2', b: 'T1', kind: 'line' },
  );
  // The eight angles as (vertex, from, to): 1 top left … 4 bottom right, then 5–8 at Q.
  const at = (v: 'P' | 'Q'): [string, string][] => {
    const [l, r, top, bottom] = v === 'P' ? ['L1', 'R1', 'T1', 'Q'] : ['L2', 'R2', 'P', 'T2'];
    return [
      [l, top],
      [top, r],
      [bottom, l],
      [r, bottom],
    ];
  };
  const eight = [...at('P').map((x) => ['P', ...x]), ...at('Q').map((x) => ['Q', ...x])] as [
    string,
    string,
    string,
  ][];
  eight.forEach(([v, p, q], i) => f.numbers.push({ v, p, q, n: i + 1 }));
  const parallel = Math.abs(safe5 - safe1) < 1e-9;
  if (parallel) {
    f.parallels.push({ a: 'L1', b: 'R1', count: 1 }, { a: 'L2', b: 'R2', count: 1 });
  }
  // The lit angles (all eight when none are lit) get arcs; equal angles share a count: 1, 4, 5, 8
  // one arc, 2, 3, 6, 7 two (right angles: squares). Unlike lines: the angles at Q get 3 and 4.
  const lit = t.highlight?.length ? t.highlight : [1, 2, 3, 4, 5, 6, 7, 8];
  eight.forEach(([v, p, q], i) => {
    const n = i + 1;
    if (!lit.includes(n)) return;
    const right = Math.abs((v === 'P' ? safe1 : safe5) - 90) < 1e-9;
    if (right) f.rights.push({ v, p, q });
    else {
      const family = [1, 4, 5, 8].includes(n) ? 1 : 2;
      f.arcs.push({ v, p, q, count: parallel || v === 'P' ? family : family + 2 });
    }
  });
  for (const [n, value] of Object.entries(t.labels ?? {})) {
    const [v, p, q] = eight[Number(n) - 1]!;
    f.labels.push({ at: `${p}${v}${q}`, value });
  }
  f.named = [];
  return f;
}

/** A quadrilateral family ABCD (counterclockwise from the bottom left) with its marks. */
function quadrilateral(
  spec: MarkedFigureSpec,
  num: (x: string | number | undefined) => number | undefined,
): Figure {
  const f = empty();
  const q = spec.quadrilateral!;
  const w = num(q.width);
  const h = num(q.height);
  const A0 = num(q.angle);
  const top = num(q.top);
  const need = (x: number | undefined, fallback: number) => {
    if (x === undefined) f.reason = f.reason ?? 'Type the lengths and angle that fix the shape.';
    return x ?? fallback;
  };
  const fam = q.family;
  // H105: a rhombus from its diagonals p = AC (level) and q = BD, crossing at their middles.
  const across =
    fam === 'rhombus' && q.across ? q.across.map((x, i) => need(num(x), [12, 16][i]!)) : undefined;
  const W = across ? Math.hypot(across[0]! / 2, across[1]! / 2) : need(w, 6);
  let A: P2 = [0, 0];
  let B: P2 = [W, 0];
  let C: P2;
  let D: P2;
  if (across) {
    const [p, qq] = across as [number, number];
    [A, B, C, D] = [
      [-p / 2, 0],
      [0, -qq / 2],
      [p / 2, 0],
      [0, qq / 2],
    ];
    if (!(p > 0 && qq > 0)) f.reason = 'Every length must be longer than 0.';
  } else if (fam === 'square' || fam === 'rectangle') {
    const H = fam === 'square' ? W : need(h, 4);
    C = [W, H];
    D = [0, H];
  } else if (fam === 'rhombus') {
    const a = rad(need(A0, 60));
    D = [W * Math.cos(a), W * Math.sin(a)];
    C = [W + D[0], D[1]];
  } else if (fam === 'parallelogram') {
    const a = rad(need(A0, 60));
    const H = need(h, 4);
    D = [H / Math.tan(a), H];
    C = [W + D[0], H];
  } else if (fam === 'trapezoid') {
    const a = rad(need(A0, 60));
    const H = need(h, 4);
    const T = need(top, W / 2);
    D = [H / Math.tan(a), H];
    C = [D[0] + T, H];
  } else {
    // Kite: the cross diagonal BD = width, level; A above its middle by `height`, C below by `top`.
    const up = need(h, W / 2);
    const down = need(top, up * 2);
    A = [0, -down];
    B = [W / 2, 0];
    C = [0, up];
    D = [-W / 2, 0];
    // Named so AB = AD (short pair) and CB = CD, counterclockwise.
    [A, B, C, D] = [C, D, A, B];
  }
  if ([W, h ?? 1, top ?? 1].some((x) => !(x > 0))) f.reason = 'Every length must be longer than 0.';
  if (A0 !== undefined && !(A0 > 0 && A0 < 180))
    f.reason = 'The angle at A must be between 0° and 180°.';
  f.pts = { A, B, C: C!, D: D! };
  f.segs.push(
    { a: 'A', b: 'B', kind: 'segment' },
    { a: 'B', b: 'C', kind: 'segment' },
    { a: 'C', b: 'D', kind: 'segment' },
    { a: 'D', b: 'A', kind: 'segment' },
  );
  f.named = ['A', 'B', 'C', 'D'];
  // Sides: equal lengths share a tick count; the families' parallel pairs get arrows.
  // An isosceles trapezoid: equal base angles (equal legs alone could be a parallelogram).
  const isosceles = fam === 'trapezoid' && Math.abs(angleAt(A, D!, B) - angleAt(B, A, C!)) < 1e-9;
  if (fam === 'rhombus' || fam === 'square') {
    for (const s of ['AB', 'BC', 'CD', 'DA']) f.ticks.push({ a: s[0]!, b: s[1]!, count: 1 });
  } else if (fam === 'kite') {
    f.ticks.push({ a: 'A', b: 'B', count: 1 }, { a: 'D', b: 'A', count: 1 });
    f.ticks.push({ a: 'B', b: 'C', count: 2 }, { a: 'C', b: 'D', count: 2 });
  } else if (fam === 'trapezoid') {
    if (isosceles) f.ticks.push({ a: 'B', b: 'C', count: 1 }, { a: 'D', b: 'A', count: 1 });
  } else {
    f.ticks.push({ a: 'A', b: 'B', count: 1 }, { a: 'C', b: 'D', count: 1 });
    f.ticks.push({ a: 'B', b: 'C', count: 2 }, { a: 'D', b: 'A', count: 2 });
  }
  if (fam !== 'kite') {
    f.parallels.push({ a: 'A', b: 'B', count: 1 }, { a: 'D', b: 'C', count: 1 });
    if (fam !== 'trapezoid')
      f.parallels.push({ a: 'A', b: 'D', count: 2 }, { a: 'B', b: 'C', count: 2 });
  }
  // Corners: right angles, or equal angles by arcs.
  const corners: [string, string, string][] = [
    ['A', 'D', 'B'],
    ['B', 'A', 'C'],
    ['C', 'B', 'D'],
    ['D', 'C', 'A'],
  ];
  if (fam === 'square' || fam === 'rectangle')
    corners.forEach(([v, p, qq]) => f.rights.push({ v, p, q: qq }));
  else if (fam === 'parallelogram' || fam === 'rhombus') {
    f.arcs.push({ v: 'A', p: 'D', q: 'B', count: 1 }, { v: 'C', p: 'B', q: 'D', count: 1 });
    f.arcs.push({ v: 'B', p: 'A', q: 'C', count: 2 }, { v: 'D', p: 'C', q: 'A', count: 2 });
  } else if (fam === 'trapezoid' && isosceles) {
    f.arcs.push({ v: 'A', p: 'D', q: 'B', count: 1 }, { v: 'B', p: 'A', q: 'C', count: 1 });
  } else if (fam === 'kite') {
    f.arcs.push({ v: 'B', p: 'A', q: 'C', count: 1 }, { v: 'D', p: 'C', q: 'A', count: 1 });
  }
  if (q.diagonals) {
    const O = cross(A, C!, B, D!);
    f.pts.O = O;
    f.segs.push({ a: 'A', b: 'C', kind: 'segment' }, { a: 'B', b: 'D', kind: 'segment' });
    const perpendicular = Math.abs(angleAt(O, A, B) - 90) < 1e-9;
    if (perpendicular) f.rights.push({ v: 'O', p: 'A', q: 'B' });
    if (fam === 'square' || fam === 'rectangle') {
      for (const x of ['A', 'B', 'C', 'D']) f.ticks.push({ a: 'O', b: x, count: 3 });
    } else if (fam === 'parallelogram' || fam === 'rhombus') {
      f.ticks.push({ a: 'A', b: 'O', count: 3 }, { a: 'O', b: 'C', count: 3 });
      f.ticks.push({ a: 'B', b: 'O', count: 4 }, { a: 'O', b: 'D', count: 4 });
    } else if (fam === 'kite') {
      f.ticks.push({ a: 'B', b: 'O', count: 3 }, { a: 'O', b: 'D', count: 3 });
    }
    f.named.push('O');
  }
  f.labels.push(...Object.entries(q.labels ?? {}).map(([at, value]) => ({ at, value })));
  return f;
}

/** The length of segment 'AB' or the angle 'ABC' (degrees) on a figure. */
export function measure(f: Figure, at: string): number | undefined {
  const names = splitNames(f, at);
  if (!names) return undefined;
  const p = names.map((n) => f.pts[n]!);
  return p.length === 2 ? len(p[0]!, p[1]!) : angleAt(p[1]!, p[0]!, p[2]!);
}

/** A part name split into point names ('AB' → A, B; 'L1PT1' → L1, P, T1). */
export function splitNames(f: Figure, at: string): string[] | undefined {
  const names = Object.keys(f.pts).sort((x, y) => y.length - x.length);
  const out: string[] = [];
  let rest = at;
  while (rest) {
    const n = names.find((x) => rest.startsWith(x));
    if (!n) return undefined;
    out.push(n);
    rest = rest.slice(n.length);
  }
  return out.length === 2 || out.length === 3 ? out : undefined;
}

/** Every mark's claim that the figure breaks (the harness). */
export function markIssues(f: Figure): string[] {
  const out: string[] = [];
  const P = (n: string) => f.pts[n]!;
  const group = <T extends { count: number }>(xs: T[]) => {
    const m = new Map<number, T[]>();
    for (const x of xs) m.set(x.count, [...(m.get(x.count) ?? []), x]);
    return [...m.values()];
  };
  const close = (x: number, y: number) => Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(x));
  for (const g of group(f.ticks)) {
    const ls = g.map((t) => len(P(t.a), P(t.b)));
    if (ls.some((l) => !close(l, ls[0]!)))
      out.push(`ticks ×${g[0]!.count} on unequal sides ${ls.join(', ')}`);
  }
  for (const g of group(f.arcs)) {
    const as = g.map((t) => angleAt(P(t.v), P(t.p), P(t.q)));
    if (as.some((x) => !close(x, as[0]!)))
      out.push(`arcs ×${g[0]!.count} on unequal angles ${as.join(', ')}`);
  }
  for (const r of f.rights) {
    const x = angleAt(P(r.v), P(r.p), P(r.q));
    if (!close(x, 90)) out.push(`right-angle mark on ${x}°`);
  }
  for (const g of group(f.parallels)) {
    const dirs = g.map((t) => Math.atan2(P(t.b)[1] - P(t.a)[1], P(t.b)[0] - P(t.a)[0]));
    for (const d of dirs) {
      const diff = Math.abs(Math.sin(d - dirs[0]!));
      if (diff > 1e-6) out.push(`parallel arrows ×${g[0]!.count} on lines that meet`);
    }
  }
  return out;
}

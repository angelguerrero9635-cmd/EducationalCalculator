/**
 * H92, the line system's extras (`LineSystemHs2a`): upright boundaries x (sign) k (or upright
 * lines x = k) in their own colour, parallel arrows and a right-angle square on the two lines,
 * and the given point the second line goes through. Drawn by `LineSystem` in Lines.tsx.
 */
import { G, Line, Path, Circle } from 'react-native-svg';

import type { LineSystemSpec } from '@/data/modules/typesGraphs';
import { chart, usePalette } from '@/theme';

import { Chip, coef, pointText, type Frame } from './graphKit';
import { above, holds, region, regionPath, strict, type Bound } from './halfPlane';
import { shadeSaid, shadeSign, type ReadValue } from './signBox';

type Read = (v: number | string) => { value: number; known: boolean };

/** A strict boundary is dashed, as the lines' are. */
const STRICT_DASH = '10 7';

export interface Upright {
  k: { value: number; known: boolean };
  bound?: Bound;
  /** "x ≥ −1", "x = 4", "x ? 2" before the sign is chosen. */
  text: string;
}

/** The spec's upright lines, read. */
export function uprightsOf(spec: LineSystemSpec, read: Read, readId: ReadValue, x = 'x') {
  return (spec.upright ?? []).map((u): Upright => {
    const k = read(u.x);
    const sign = shadeSign(u.shade, readId);
    const said = shadeSaid(u.shade, readId) ?? '=';
    return {
      k,
      bound: sign ? { m: 0, b: k.value, sign, upright: true } : undefined,
      text: u.label ?? `${x} ${said} ${k.known ? coef(k.value) : '?'}`,
    };
  });
}

/** Whether the bounds share any point at all (in a very wide frame). */
export function allMeet(bounds: Bound[]) {
  const far = { x: [-1e7, 1e7], y: [-1e7, 1e7] } as Frame;
  const poly = region(bounds, far);
  if (poly.length >= 3) return true;
  // Solid boundaries can meet on a line or a point alone (x ≥ 2 and x ≤ 2).
  return bounds.every((q) => !strict(q.sign)) && poly.length > 0;
}

/** "Shaded right: every point where x is at least −1. Solid: the line itself is included". */
export const uprightShadeWords = (q: Bound, x: string) =>
  `Shaded ${above(q.sign) ? 'right' : 'left'}: every point where ${x} is ${
    { '<': 'less than', '≤': 'at most', '>': 'greater than', '≥': 'at least' }[q.sign]
  } ${coef(q.b)}. ${strict(q.sign) ? 'Dashed: the line itself is left out' : 'Solid: the line itself is included'}`;

/**
 * The test point against every boundary at once, when some are upright: "2 ≥ −1, 2 ≤ 4,
 * 1 ≥ −3 and 1 ≤ 2: all true" (x against an upright bound, y against a line's height at x).
 */
export function uprightTest(bounds: Bound[], x: number, y: number) {
  const parts = bounds.map((q) => {
    const [l, r] = q.upright ? [x, q.b] : [y, q.m * x + q.b];
    return { text: `${coef(l)} ${q.sign} ${coef(r)}`, ok: holds(q, x, y) };
  });
  const list = (ps: string[]) =>
    ps.length > 1 ? `${ps.slice(0, -1).join(', ')} and ${ps[ps.length - 1]}` : ps.join('');
  return parts.every((p) => p.ok)
    ? `${list(parts.map((p) => p.text))}: all true`
    : parts.map((p) => `${p.text} is ${p.ok}`).join(', ');
}

/** The upright lines: shading, the line (dashed when strict) and its name at the top. */
export function UprightLines({
  ups,
  bounds,
  known,
  f,
  w,
  h,
}: {
  ups: Upright[];
  bounds: Bound[];
  known: boolean;
  f: Frame;
  w: number;
  h: number;
}) {
  const c = usePalette();
  const allKnown = known && ups.every((u) => u.k.known);
  return (
    <G>
      {/* Only the overlap is shaded (four half-planes on top of each other would muddy it). */}
      {bounds.length ? (
        <Path
          d={regionPath(region(bounds, f), f)}
          fill={c.chartHighlight}
          opacity={allKnown ? 0.2 : 0.06}
        />
      ) : null}
      {ups.map((u, i) => {
        const k = u.k.value;
        if (k < f.x[0] - 1e-9 || k > f.x[1] + 1e-9) return null;
        return (
          <G key={`ul${i}`} opacity={u.k.known ? 1 : 0.35}>
            <Line
              x1={f.sx(k)}
              y1={f.sy(f.y[0])}
              x2={f.sx(k)}
              y2={f.sy(f.y[1])}
              stroke={c.lineUpright}
              strokeWidth={chart.strokeHeavy}
              strokeDasharray={u.bound && strict(u.bound.sign) ? STRICT_DASH : undefined}
            />
            <Chip
              x={f.sx(k) + (i % 2 ? -5 : 5)}
              y={f.sy(f.y[1]) + 14 + 18 * Math.floor(i / 2)}
              text={u.text}
              anchor={i % 2 ? 'end' : 'start'}
              w={w}
              h={h}
              color={c.lineUpright}
            />
          </G>
        );
      })}
    </G>
  );
}

/** A direction on the canvas: the unit vector along y = mx + b, left to right. */
const along = (m: number, f: Frame) => {
  const [dx, dy] = [f.ux, -m * f.uy];
  const n = Math.hypot(dx, dy);
  return [dx / n, dy / n] as const;
};

/**
 * Parallel arrows (one chevron on each line, pointing the same way) when the slopes are equal,
 * or a right-angle square at the crossing when they multiply to −1.
 */
export function LineMarks({
  lines,
  cross,
  f,
  labelAngle,
  avoid = [],
}: {
  lines: { m: number; b: number }[];
  cross?: { x: number; y: number };
  f: Frame;
  /** The screen direction of the crossing's label: the square goes in another quarter. */
  labelAngle?: number;
  /** Canvas points the arrows keep 30 px from (the given point, the intercepts). */
  avoid?: [number, number][];
}) {
  const c = usePalette();
  const [p, q] = lines as [{ m: number; b: number }, { m: number; b: number }];
  if (p.m === q.m && p.b !== q.b) {
    // Each chevron where its line is in view: the middle of its visible part, else part of
    // the way either side, clear of the y-axis numbers and the points in `avoid`.
    const [ux, uy] = along(p.m, f);
    const axis = f.sx(Math.min(f.x[1], Math.max(f.x[0], 0)));
    const arrows = lines.flatMap((l, i) => {
      const ends = (
        l.m === 0
          ? [f.x[0], f.x[1]]
          : [(f.y[0] - l.b) / l.m, (f.y[1] - l.b) / l.m].sort((u, v) => u - v)
      ) as [number, number];
      const [lo, hi] = [Math.max(f.x[0], ends[0]), Math.min(f.x[1], ends[1])];
      if (!(lo < hi)) return [];
      for (const t of [0.5, 0.7, 0.3, 0.85, 0.15]) {
        const x = lo + (hi - lo) * t;
        const [px, py] = [f.sx(x), f.sy(l.m * x + l.b)];
        if (Math.abs(px - axis) < 30) continue;
        if (avoid.some(([ax, ay]) => Math.hypot(ax - px, ay - py) < 30)) continue;
        return [{ i, px, py }];
      }
      return [];
    });
    return (
      <G>
        {arrows.map((a) => (
          <Path
            key={`a${a.i}`}
            d={`M ${a.px - ux * 9 - uy * 8} ${a.py - uy * 9 + ux * 8} L ${a.px + ux * 3} ${a.py + uy * 3} L ${a.px - ux * 9 + uy * 8} ${a.py - uy * 9 - ux * 8}`}
            stroke={c.chartInk}
            strokeWidth={chart.stroke + 0.5}
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </G>
    );
  }
  if (cross && Math.abs(p.m * q.m + 1) < 1e-9) {
    const [a, b] = [along(p.m, f), along(q.m, f)];
    // Any of the four quarters is a right angle: the one farthest from the crossing's label.
    const quarters = (
      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ] as const
    ).map(([sa, sb]) => {
      const [dx, dy] = [sa * a[0] + sb * b[0], sa * a[1] + sb * b[1]];
      const off =
        labelAngle === undefined
          ? 0
          : Math.abs(((Math.atan2(dy, dx) - labelAngle + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
      return { sa, sb, off };
    });
    const best = quarters.reduce((u, v) => (v.off > u.off + 1e-9 ? v : u));
    const s = 16;
    const [cx, cy] = [f.sx(cross.x), f.sy(cross.y)];
    const [ax, ay] = [a[0] * best.sa * s, a[1] * best.sa * s];
    const [bx, by] = [b[0] * best.sb * s, b[1] * best.sb * s];
    return (
      <Path
        d={`M ${cx + ax} ${cy + ay} L ${cx + ax + bx} ${cy + ay + by} L ${cx + bx} ${cy + by}`}
        stroke={c.chartInk}
        strokeWidth={chart.stroke}
        fill="none"
      />
    );
  }
  return null;
}

type Box = { l: number; r: number; t: number; b: number };

/**
 * The given point, filled and labelled (x₀, y₀): the label right or left of it, above or below,
 * the first place clear of the y-axis numbers, the canvas edges and the boxes in `avoid` (the
 * crossing's label).
 */
export function GivenPoint({
  x,
  y,
  f,
  w,
  h,
  avoid = [],
}: {
  x: number;
  y: number;
  f: Frame;
  w: number;
  h: number;
  avoid?: Box[];
}) {
  const c = usePalette();
  if (x < f.x[0] || x > f.x[1] || y < f.y[0] || y > f.y[1]) return null;
  const [px, py] = [f.sx(x), f.sy(y)];
  const text = pointText(x, y);
  const tw = text.length * chart.label * 0.58 + 6;
  const axis = f.sx(Math.min(f.x[1], Math.max(f.x[0], 0)));
  const hit = (a: Box, b: Box) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  const places = [
    { dx: 10, dy: -8, anchor: 'start' as const },
    { dx: 10, dy: 22, anchor: 'start' as const },
    { dx: -10, dy: -8, anchor: 'end' as const },
    { dx: -10, dy: 22, anchor: 'end' as const },
  ];
  const boxOf = (p: (typeof places)[number]): Box => {
    const l = p.anchor === 'start' ? px + p.dx - 3 : px + p.dx - tw + 3;
    return { l, r: l + tw, t: py + p.dy - chart.label - 1, b: py + p.dy + 4 };
  };
  const clear = (p: (typeof places)[number]) => {
    const bx = boxOf(p);
    return (
      bx.l > 1 &&
      bx.r < w - 1 &&
      bx.t > 1 &&
      bx.b < h - 1 &&
      !hit(bx, { l: axis - 26, r: axis + 2, t: 0, b: h }) &&
      avoid.every((a) => !hit(bx, a))
    );
  };
  const at = places.find(clear) ?? places[0]!;
  return (
    <G>
      <Circle cx={px} cy={py} r={6} fill={c.chartInk} stroke={c.card} strokeWidth={1.5} />
      <Chip
        x={px + at.dx}
        y={py + at.dy}
        text={text}
        anchor={at.anchor}
        w={w}
        h={h}
        size={chart.label}
      />
    </G>
  );
}

/** The caption's lines for the marks and the given point. */
export function marksWords(
  spec: LineSystemSpec,
  lines: { m: number; b: number }[],
  names: string[],
  given?: { x: number; y: number },
) {
  const [p, q] = lines as [{ m: number; b: number }, { m: number; b: number }];
  const out: string[] = [];
  if (spec.marks && p.m === q.m && p.b !== q.b)
    out.push(`The arrows mark them parallel: both slopes are ${coef(p.m)}`);
  if (spec.marks && Math.abs(p.m * q.m + 1) < 1e-9)
    out.push(
      `The square marks a right angle: ${coef(p.m)} × ${q.m < 0 ? `(${coef(q.m)})` : coef(q.m)} = −1`,
    );
  if (given) {
    const y = q.m * given.x + q.b;
    out.push(
      `${pointText(given.x, given.y)} is on ${names[1]}: ${coef(q.m)} × ${given.x < 0 ? `(${coef(given.x)})` : coef(given.x)} ${q.b < 0 ? '−' : '+'} ${coef(Math.abs(q.b))} = ${coef(y)}`,
    );
  }
  return out;
}

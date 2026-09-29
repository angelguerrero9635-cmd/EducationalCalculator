/**
 * The Grades 9–12 marks on the coordinate plane (H25): a segment's midpoint M with its two
 * equal halves ticked, the point P that splits it in the ratio m : n (the m + n equal pieces
 * ticked, A to P heavy), and a polygon with each side's slope, arrows on parallel sides and a
 * square at each right angle.
 */
import type { ReactNode } from 'react';
import { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import { ChartText, fitLabel, type useRep } from './common';
import { Chip, coef, pointText } from './graphKit';
import { partitionOf, rightCorners, sidesOf, type Pt } from './planeGeo';

type Spec = Extract<Representation, { kind: 'coordinatePlane' }>;
type Rep = ReturnType<typeof useRep>;

const LETTERS = 'ABCDEF';

/** A number or a value, and whether it is known. */
const reading = (rep: Rep, v: number | string) =>
  typeof v === 'number'
    ? { value: v, known: true }
    : { value: rep.known(v) ? rep.shown(v) : 0, known: rep.known(v) };

/** What the Grades 9–12 fields draw, from the values (undefined parts are not drawn). */
export function planeGeometry(spec: Spec, rep: Rep, a?: Pt, b?: Pt) {
  const ratio = spec.partition?.ratio.map((v) => reading(rep, v));
  const [m, n] = ratio ? [ratio[0]!.value, ratio[1]!.value] : [1, 1];
  const ratioOk = !!ratio && ratio.every((r) => r.known) && m > 0 && n > 0;
  const corners = spec.polygon?.map(([x, y]) => [reading(rep, x), reading(rep, y)] as const);
  const poly =
    corners && corners.every(([x, y]) => x.known && y.known)
      ? corners.map(([x, y]) => [x.value, y.value] as Pt)
      : undefined;
  return {
    mid: spec.midpoint && a && b ? partitionOf(a, b, 1, 1) : undefined,
    part: spec.partition && a && b && ratioOk ? partitionOf(a, b, m, n) : undefined,
    m,
    n,
    poly,
    /** Every coordinate drawn, for the plane's extent. */
    coords: (corners ?? []).flatMap(([x, y]) => [x.value, y.value]),
  };
}

/** A slope as written: 1/2, −2, 0, or "undefined" for a vertical side. */
const slopeText = (s: number | undefined) => (s === undefined ? 'undefined' : coef(s));

export function planeGeometryCaption(spec: Spec, rep: Rep, a?: Pt, b?: Pt): string[] {
  const g = planeGeometry(spec, rep, a, b);
  const lines: string[] = [];
  const f = (x: number) => coef(x);
  if (g.mid && a && b)
    lines.push(
      `M = ((${f(a[0])} + ${f(b[0])}) ÷ 2, (${f(a[1])} + ${f(b[1])}) ÷ 2) = ${pointText(...g.mid)}`,
    );
  if (spec.partition && a && b) {
    if (!g.part) lines.push('Type the ratio m : n (both above 0) to place P.');
    else {
      const t = coef(g.m / (g.m + g.n));
      lines.push(
        `P is ${t} of the way from A to B: ${f(g.m)} of the ${f(g.m + g.n)} equal pieces (ratio ${f(g.m)} : ${f(g.n)}).`,
      );
      lines.push(
        `P = (${f(a[0])} + ${t} × ${f(b[0] - a[0])}, ${f(a[1])} + ${t} × ${f(b[1] - a[1])}) = ${pointText(...g.part)}`,
      );
    }
  }
  if (g.poly && spec.slopes) {
    const sides = sidesOf(g.poly);
    const name = (i: number) => `${LETTERS[sides[i]!.from]}${LETTERS[sides[i]!.to]}`;
    lines.push(`Slopes: ${sides.map((s, i) => `${name(i)} ${slopeText(s.slope)}`).join(', ')}.`);
    const groups = [...new Set(sides.map((s) => s.parallel).filter(Boolean))];
    for (const k of groups) {
      const same = sides.flatMap((s, i) => (s.parallel === k ? [name(i)] : []));
      lines.push(`${same.join(' ∥ ')}: equal slopes, so parallel.`);
    }
    const right = rightCorners(g.poly);
    if (right.length) {
      const i = right[0]!;
      const before = sides[(i + sides.length - 1) % sides.length]!;
      const after = sides[i]!;
      const product =
        before.slope !== undefined && after.slope !== undefined
          ? ` (${slopeText(before.slope)} × ${slopeText(after.slope)} = −1)`
          : ' (one side level, one straight up)';
      lines.push(
        `${right.map((j) => LETTERS[j]).join(', ')}: right ${right.length === 1 ? 'angle' : 'angles'}, the sides there perpendicular${product}.`,
      );
    }
  }
  return lines;
}

/** Two short ticks across a segment at t along it (congruence marks: `count` of them). */
function ticks(p: readonly number[], q: readonly number[], t: number, count: number) {
  const [x, y] = [p[0]! + (q[0]! - p[0]!) * t, p[1]! + (q[1]! - p[1]!) * t];
  const len = Math.hypot(q[0]! - p[0]!, q[1]! - p[1]!) || 1;
  const [ux, uy] = [(q[0]! - p[0]!) / len, (q[1]! - p[1]!) / len];
  return Array.from({ length: count }, (_, i) => {
    const off = (i - (count - 1) / 2) * 5;
    const [cx, cy] = [x + ux * off, y + uy * off];
    return `M ${cx - uy * 7} ${cy + ux * 7} L ${cx + uy * 7} ${cy - ux * 7}`;
  }).join(' ');
}

export function PlaneGeometryMarks({
  spec,
  rep,
  a,
  b,
  sx,
  sy,
  w,
  h,
}: {
  spec: Spec;
  rep: Rep;
  a?: Pt;
  b?: Pt;
  sx: (x: number) => number;
  sy: (y: number) => number;
  w: number;
  h: number;
}) {
  const c = usePalette();
  const g = planeGeometry(spec, rep, a, b);
  const P = (p: Pt) => [sx(p[0]), sy(p[1])] as const;
  /** A point's label on the side of the segment away from the point labels (below it). */
  const label = (p: Pt, text: string, color: string) => {
    const [x, y] = P(p);
    const [ax, ay] = a && b ? P(a) : [x, y];
    const [bx, by] = a && b ? P(b) : [x + 1, y];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    // The normal pointing down the screen.
    let [nx, ny] = [-(by - ay) / len, (bx - ax) / len];
    if (ny < 0) [nx, ny] = [-nx, -ny];
    const anchor = Math.abs(nx) < 0.3 ? 'middle' : nx > 0 ? 'start' : 'end';
    return (
      <ChartText
        {...fitLabel(x + nx * 12, text, chart.label, w, anchor, 12)}
        y={y + ny * 14 + 5}
        fontWeight="700"
        fill={color}
      >
        {text}
      </ChartText>
    );
  };
  const out: ReactNode[] = [];
  if (a && b && (g.mid || g.part)) {
    const [pa, pb] = [P(a), P(b)];
    if (g.part) {
      const pp = P(g.part);
      const k = g.m + g.n;
      // The m + n equal pieces, ticked; A to P heavy.
      out.push(
        <Line
          key="ap"
          x1={pa[0]}
          y1={pa[1]}
          x2={pp[0]}
          y2={pp[1]}
          stroke={c.chartSecond}
          strokeWidth={chart.strokeHeavy + 2}
          strokeLinecap="round"
        />,
      );
      if (Number.isInteger(k) && k <= 20)
        out.push(
          <Path
            key="pieces"
            d={Array.from({ length: k - 1 }, (_, i) => ticks(pa, pb, (i + 1) / k, 1)).join(' ')}
            stroke={c.chartInk}
            strokeWidth={chart.strokeLight}
          />,
        );
      out.push(
        <G key="p">
          <Circle
            cx={pp[0]}
            cy={pp[1]}
            r={5.5}
            fill={c.chartSecond}
            stroke={c.chartInk}
            strokeWidth={1.5}
          />
          {label(g.part, `P${pointText(...g.part)}`, c.chartInk)}
        </G>,
      );
    }
    if (g.mid) {
      const pm = P(g.mid);
      out.push(
        <G key="m">
          {/* One tick on each half: the two halves are equal. */}
          <Path
            d={`${ticks(pa, pm, 0.5, 1)} ${ticks(pm, pb, 0.5, 1)}`}
            stroke={c.chartInk}
            strokeWidth={chart.stroke}
          />
          <Rect
            x={pm[0] - 5}
            y={pm[1] - 5}
            width={10}
            height={10}
            transform={`rotate(45 ${pm[0]} ${pm[1]})`}
            fill={c.card}
            stroke={c.chartInk}
            strokeWidth={chart.stroke}
          />
          {label(g.mid, `M${pointText(...g.mid)}`, c.chartInk)}
        </G>,
      );
    }
  }
  if (g.poly) {
    const ps = g.poly;
    const px = ps.map(P);
    const [mx, my] = [
      px.reduce((s, p) => s + p[0], 0) / px.length,
      px.reduce((s, p) => s + p[1], 0) / px.length,
    ];
    out.push(
      <Path
        key="poly"
        d={`${px.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ')} Z`}
        fill={c.chartHighlight}
        fillOpacity={0.12}
        stroke={c.chartHighlight}
        strokeWidth={chart.stroke}
        strokeLinejoin="round"
      />,
    );
    if (spec.slopes) {
      const sides = sidesOf(ps);
      sides.forEach((s, i) => {
        const [p, q] = [px[s.from]!, px[s.to]!];
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
        const [ux, uy] = [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
        // Outward from the middle of the figure.
        let [nx, ny] = [-uy, ux];
        const [cx, cy] = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        if ((cx - mx) * nx + (cy - my) * ny < 0) [nx, ny] = [-nx, -ny];
        const text = `m = ${slopeText(s.slope)}`;
        const anchor = Math.abs(nx) < 0.4 ? 'middle' : nx > 0 ? 'start' : 'end';
        // On a card-colored chip, so it reads over the grid and the axes' numbers.
        out.push(
          <Chip
            key={`sl${i}`}
            x={cx + nx * 10}
            y={cy + ny * 13 + 4}
            text={text}
            anchor={anchor}
            w={w}
            h={h}
            size={chart.label}
            color={c.chartHighlight}
          />,
        );
        if (s.parallel) {
          // Arrowheads a third of the way along, as many as the pair's number.
          const t = 0.3;
          const [ax, ay] = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
          const d = Array.from({ length: s.parallel }, (_, k) => {
            const [hx, hy] = [ax + ux * k * 6, ay + uy * k * 6];
            return `M ${hx - ux * 6 - uy * 5} ${hy - uy * 6 + ux * 5} L ${hx} ${hy} L ${hx - ux * 6 + uy * 5} ${hy - uy * 6 - ux * 5}`;
          }).join(' ');
          out.push(
            <Path
              key={`par${i}`}
              d={d}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
              fill="none"
              strokeLinejoin="round"
            />,
          );
        }
      });
      for (const i of rightCorners(ps)) {
        const p = px[i]!;
        const [u, v] = [px[(i + ps.length - 1) % ps.length]!, px[(i + 1) % ps.length]!];
        const unit = (q: readonly [number, number]) => {
          const l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
          return [((q[0] - p[0]) / l) * 10, ((q[1] - p[1]) / l) * 10];
        };
        const [e1, e2] = [unit(u), unit(v)];
        out.push(
          <Path
            key={`ra${i}`}
            d={`M ${p[0] + e1[0]!} ${p[1] + e1[1]!} L ${p[0] + e1[0]! + e2[0]!} ${p[1] + e1[1]! + e2[1]!} L ${p[0] + e2[0]!} ${p[1] + e2[1]!}`}
            stroke={c.chartInk}
            strokeWidth={chart.strokeLight}
            fill="none"
          />,
        );
      }
    }
    // Corner names with their coordinates, outward from the middle.
    ps.forEach((p, i) => {
      const [x, y] = px[i]!;
      const t = Math.atan2(y - my, x - mx);
      const text = `${LETTERS[i]}${pointText(...p)}`;
      const anchor = Math.cos(t) > 0.3 ? 'start' : Math.cos(t) < -0.3 ? 'end' : 'middle';
      out.push(
        <G key={`cn${i}`}>
          <Circle cx={x} cy={y} r={4} fill={c.chartHighlight} />
          <ChartText
            {...fitLabel(x + Math.cos(t) * 9, text, chart.label, w, anchor, 9)}
            y={y + Math.sin(t) * 14 + 4}
            fontWeight="700"
          >
            {text}
          </ChartText>
        </G>,
      );
    });
  }
  return <G>{out}</G>;
}

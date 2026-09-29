import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { LinearFunctionSpec, LineSystemSpec } from '@/data/modules/typesGraphs';
import { dollarsOf, formatNumber, unitFor } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { toFraction } from './exact';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import {
  above,
  holds,
  overlaps,
  region,
  regionPath,
  strict,
  withSign,
  type Bound,
} from './halfPlane';
import {
  Chip,
  clipLine,
  coef,
  extents,
  fitExtent,
  GridAxes,
  lineEquation,
  makeFrame,
  pointText,
  reader,
  type Frame,
} from './graphKit';

/** The rise and run of a slope triangle: the fraction's bottom as the run (2/3: up 2, over 3). */
const riseRun = (m: number) => {
  const f = toFraction(m, 10);
  return f ? { run: f[1], rise: f[0] } : { run: 1, rise: m };
};

/**
 * The intercept chip's y: below the point when `below`, else above, but never on the x-axis
 * numbers (a row about 16 px under the axis); there it takes the other side.
 */
const chipY = (y: number, axisY: number, below: boolean, q1: boolean) => {
  const at = (under: boolean) => y + (under ? 20 : -9);
  const onNumbers = (cy: number) => !q1 && cy > axisY - 4 && cy < axisY + 24;
  return onNumbers(at(below)) && !onNumbers(at(!below)) ? at(!below) : at(below);
};

/** A chip's width, as `Chip` draws it. */
const chipWidth = (text: string, size: number = chart.small) => text.length * size * 0.58 + 6;

/** "m × x + b" as a number sentence: "2 × 4 + 3 = 11", "−1 × 2 − 5 = −7". */
const worked = (m: number, x: number, b: number) =>
  `${coef(m)} × ${x < 0 ? `(${coef(x)})` : coef(x)} ${b < 0 ? '−' : '+'} ${coef(Math.abs(b))} = ${coef(m * x + b)}`;

/** A strict inequality's boundary: dashed (its points are left out). */
const STRICT_DASH = '10 7';

/** What a shaded side means: "Shaded above: every point where y is greater than 2x − 3." */
const shadeWords = (sign: Bound['sign'], y: string, rhs: string) =>
  `Shaded ${above(sign) ? 'above' : 'below'}: every point where ${y} is ${
    { '<': 'less than', '≤': 'at most', '>': 'greater than', '≥': 'at least' }[sign]
  } ${rhs}. ${strict(sign) ? 'Dashed: the line itself is left out' : 'Solid: the line itself is included'}`;

/** "a·x + b·y = c" as written: "3x = 6", "2x − y = 4", "0 = 5". */
export function standardText(a: number, b: number, cc: number, x = 'x', y = 'y') {
  const term = (k: number, v: string, first: boolean) => {
    if (k === 0) return '';
    const mag = Math.abs(k) === 1 ? '' : coef(Math.abs(k));
    return first ? `${k < 0 ? '−' : ''}${mag}${v}` : ` ${k < 0 ? '−' : '+'} ${mag}${v}`;
  };
  const left = `${term(a, x, true)}${term(b, y, a === 0)}` || '0';
  return `${left} = ${coef(cc)}`;
}

/** The frame for a spec's extent and quadrants, grown to keep `xs` and `ys` in view. */
function useGrid(
  spec: { extent?: number | { x: number; y: number }; quadrants?: 1 | 4 },
  xs: number[],
  ys: number[],
) {
  const base = extents(spec.extent);
  const square = base.x === base.y;
  const live = square
    ? { x: fitExtent(base.x, [...xs, ...ys]), y: fitExtent(base.y, [...xs, ...ys]) }
    : { x: fitExtent(base.x, xs), y: fitExtent(base.y, ys) };
  const ext = useFrozen(live);
  const q1 = spec.quadrants === 1;
  return {
    ext,
    square,
    q1,
    frame: (w: number, h: number, named: boolean) =>
      makeFrame(
        w,
        h,
        [q1 ? 0 : -ext.value.x, ext.value.x],
        [q1 ? 0 : -ext.value.y, ext.value.y],
        square,
        named,
      ),
  };
}

/**
 * The slope triangle's start: at the intercept if it fits, else the nearest run that does.
 * `from` keeps it clear of the intercept's label (a first-quadrant grid labels it inside);
 * its top corner (the slope's handle) stays a finger's width from the other handles.
 */
function triangleAt(
  m: number,
  b: number,
  run: number,
  f: Frame,
  from: number,
  handles: [number, number][],
) {
  const inside = (x: number) =>
    x >= f.x[0] - 1e-9 &&
    x <= f.x[1] + 1e-9 &&
    m * x + b >= f.y[0] - 1e-9 &&
    m * x + b <= f.y[1] + 1e-9;
  const clear = (x0: number) =>
    handles.every(
      ([hx, hy]) => Math.hypot(f.sx(x0 + run) - f.sx(hx), f.sy(m * (x0 + run) + b) - f.sy(hy)) > 32,
    );
  const fits = (x0: number) => inside(x0) && inside(x0 + run);
  // Not across an axis, where its labels would sit on the axis numbers.
  const offAxes = (x0: number) => {
    const [y0, y1] = [m * x0 + b, m * (x0 + run) + b];
    // The run's label is under the triangle when it rises, over it when it falls.
    const [under, over] = m >= 0 ? [22, 6] : [6, 22];
    const aboveAxis = f.sy(0) - f.sy(Math.min(y0, y1)) > under;
    const belowAxis = f.sy(Math.max(y0, y1)) - f.sy(0) > over;
    return (aboveAxis || belowAxis) && (x0 >= 0 || f.sx(0) - f.sx(x0 + run) > 56);
  };
  const starts = Array.from({ length: 81 }, (_, i) => (i % 2 ? -1 : 1) * Math.ceil(i / 2) * run);
  return (
    starts.find((x0) => x0 >= from - 1e-9 && clear(x0) && offAxes(x0) && fits(x0)) ??
    starts.find((x0) => x0 >= from - 1e-9 && clear(x0) && fits(x0)) ??
    starts.find((x0) => clear(x0) && fits(x0)) ??
    starts.find(fits)
  );
}

/**
 * y = mx + b: the line, the intercept marked on the y-axis and a slope triangle from it
 * (rise over run, the run the slope's bottom). Drag the intercept, the triangle's top corner
 * (the slope) and the point along the line.
 */
export function LinearFunction({ spec, calc }: { spec: LinearFunctionSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const m = read(spec.slope);
  const b = read(spec.intercept);
  const pt = spec.point ? { x: read(spec.point.x), y: read(spec.point.y) } : undefined;
  const grid = useGrid(spec, pt ? [pt.x.value] : [], [b.value, ...(pt ? [pt.y.value] : [])]);
  const start = useRef({ m: 0, b: 0, x: 0, run: 1, x0: 0 });
  const known = m.known && b.known;
  const xSym = spec.point ? rep.variable(spec.point.x).symbol : 'x';
  const ySym = spec.point ? rep.variable(spec.point.y).symbol : 'y';
  const sym = (v: number | string, fallback: string) =>
    typeof v === 'string' ? rep.variable(v).symbol : fallback;
  const vars = [spec.slope, spec.intercept].filter((v): v is string => typeof v === 'string');
  const rr = riseRun(m.value);

  return (
    <View>
      <Canvas aspect={grid.square ? (grid.q1 ? 0.9 : 1) : 0.8}>
        {({ w, h }) => {
          const named = !!spec.axes;
          const f = grid.frame(w, h, named);
          // Legs long enough to read (a run of 30 px, a rise of 28 px when the grid has room):
          // the same slope with k times the run and the rise.
          const k = Math.max(
            1,
            Math.min(
              Math.ceil(28 / Math.max(1e-9, Math.abs(rr.rise) * f.uy)),
              Math.floor((f.x[1] - f.x[0]) / (2 * rr.run)),
            ),
            Math.ceil(30 / (rr.run * f.ux)),
          );
          const run = rr.run * k;
          const rise = rr.rise * k;
          const q1 = f.x[0] === 0;
          const x0 = known
            ? triangleAt(m.value, b.value, run, f, q1 ? 70 / f.ux : -Infinity, [
                [0, b.value],
                ...(pt?.x.known && pt.y.known
                  ? [[pt.x.value, pt.y.value] as [number, number]]
                  : []),
              ])
            : undefined;
          const seg = clipLine(m.value, b.value, f);
          const y0 = x0 === undefined ? 0 : m.value * x0 + b.value;
          const up = rise >= 0;
          const bIn = b.value >= f.y[0] && b.value <= f.y[1] && f.x[0] <= 0;
          // The point's label: left of it, else just right of the y-axis, else right of the
          // point, whichever first keeps off the axis numbers and the other handles.
          const ptLeft = (() => {
            if (!pt) return 0;
            const px = f.sx(pt.x.value);
            const tw = chipWidth(pointText(pt.x.value, pt.y.value));
            const top = f.sy(pt.y.value) + (m.value >= 0 ? -10 : 20) - chart.small;
            const others: [number, number][] = [
              [f.sx(0), f.sy(b.value)],
              ...(x0 !== undefined ? [[f.sx(x0 + run), f.sy(y0 + rise)] as [number, number]] : []),
            ];
            const clear = (l: number) =>
              (l > f.sx(0) + 2 || l + tw < f.sx(0) - 22) &&
              others.every(
                ([ox, oy]) =>
                  Math.hypot(
                    ox - Math.max(l, Math.min(l + tw, ox)),
                    oy - Math.max(top, Math.min(top + chart.small + 4, oy)),
                  ) > 12,
              );
            const tries = [px - 12 - tw, ...(pt.x.value > 0 ? [f.sx(0) + 4] : []), px + 12];
            return tries.find(clear) ?? tries[0]!;
          })();
          return (
            <>
              <Svg width={w} height={h}>
                <GridAxes f={f} names={spec.axes} />
                {spec.shade ? (
                  <Path
                    d={regionPath(region([{ m: m.value, b: b.value, sign: spec.shade }], f), f)}
                    fill={c.chartHighlight}
                    opacity={known ? 0.16 : 0.06}
                  />
                ) : null}
                {seg ? (
                  <Line
                    x1={f.sx(seg.a[0])}
                    y1={f.sy(seg.a[1])}
                    x2={f.sx(seg.b[0])}
                    y2={f.sy(seg.b[1])}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                    strokeDasharray={spec.shade && strict(spec.shade) ? STRICT_DASH : undefined}
                    opacity={known ? 1 : 0.35}
                  />
                ) : null}
                {x0 !== undefined && rise !== 0 ? (
                  <G>
                    <Path
                      d={`M ${f.sx(x0)} ${f.sy(y0)} L ${f.sx(x0 + run)} ${f.sy(y0)} L ${f.sx(x0 + run)} ${f.sy(y0 + rise)}`}
                      stroke={c.chartSecond}
                      strokeWidth={chart.stroke + 0.5}
                      fill="none"
                    />
                    <Chip
                      x={f.sx(x0 + run / 2)}
                      y={f.sy(y0) + (up ? 15 : -6)}
                      text={`run ${coef(run)}`}
                      w={w}
                      h={h}
                    />
                    <Chip
                      x={f.sx(x0 + run) + 5}
                      y={f.sy(y0 + rise / 2) + 4}
                      text={`rise ${coef(rise)}`}
                      anchor="start"
                      w={w}
                      h={h}
                    />
                  </G>
                ) : null}
                {bIn ? (
                  <G opacity={b.known ? 1 : 0.35}>
                    <Circle
                      cx={f.sx(0)}
                      cy={f.sy(b.value)}
                      r={6}
                      fill={c.card}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    {/* Beside the axis on the side the line leaves free (inside on a first
                        quadrant, where the left edge is the axis). */}
                    <Chip
                      x={f.sx(0) + (q1 ? 14 : -12)}
                      y={chipY(f.sy(b.value), f.sy(0), m.value >= 0 === q1, q1)}
                      text={`(0, ${b.known ? coef(b.value) : '?'})`}
                      anchor={q1 ? 'start' : 'end'}
                      w={w}
                      h={h}
                    />
                  </G>
                ) : null}
                {pt && pt.x.known && pt.y.known ? (
                  <G>
                    <Path
                      d={`M ${f.sx(pt.x.value)} ${f.sy(Math.max(f.y[0], Math.min(f.y[1], 0)))} L ${f.sx(pt.x.value)} ${f.sy(pt.y.value)} L ${f.sx(Math.max(f.x[0], Math.min(f.x[1], 0)))} ${f.sy(pt.y.value)}`}
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dashFine}
                      fill="none"
                    />
                    <Circle
                      cx={f.sx(pt.x.value)}
                      cy={f.sy(pt.y.value)}
                      r={5}
                      fill={c.chartHighlight}
                    />
                    <Chip
                      x={ptLeft + 3}
                      y={f.sy(pt.y.value) + (m.value >= 0 ? -10 : 20)}
                      text={pointText(pt.x.value, pt.y.value)}
                      anchor="start"
                      w={w}
                      h={h}
                    />
                  </G>
                ) : null}
              </Svg>
              {!spec.fixed && typeof spec.intercept === 'string' && b.known && bIn ? (
                <DragHandle
                  testID="drag-intercept"
                  x={f.sx(0)}
                  y={f.sy(b.value)}
                  label={`the intercept ${rep.variable(spec.intercept).symbol}`}
                  onStart={() => {
                    start.current.b = b.value;
                    grid.ext.freeze();
                  }}
                  onMove={(_, dy) => {
                    const id = spec.intercept as string;
                    calc.set(
                      {
                        ...(spec.keep ? rep.pin(spec.keep) : rep.pin(vars.filter((v) => v !== id))),
                        ...(spec.point ? rep.pin([spec.point.x]) : {}),
                        [id]: rep.snapTo(id, (start.current.b - dy / f.uy) * rep.factor(id)),
                      },
                      rep.slide(id),
                    );
                  }}
                  onEnd={grid.ext.release}
                />
              ) : null}
              {!spec.fixed && typeof spec.slope === 'string' && known && x0 !== undefined ? (
                <DragHandle
                  testID="drag-slope"
                  x={f.sx(x0 + run)}
                  y={f.sy(y0 + rise)}
                  label={`the slope ${rep.variable(spec.slope).symbol}`}
                  onStart={() => {
                    start.current = { ...start.current, m: m.value, run, x0 };
                    grid.ext.freeze();
                  }}
                  onMove={(_, dy) => {
                    const id = spec.slope as string;
                    const s = start.current;
                    const riseNow = s.m * s.run - dy / f.uy;
                    calc.set(
                      {
                        ...(spec.keep ? rep.pin(spec.keep) : rep.pin(vars.filter((v) => v !== id))),
                        ...(spec.point ? rep.pin([spec.point.x]) : {}),
                        [id]: rep.snapTo(id, (riseNow / s.run) * rep.factor(id)),
                      },
                      rep.slide(id),
                    );
                  }}
                  onEnd={grid.ext.release}
                />
              ) : null}
              {!spec.fixed && spec.point && pt?.x.known && pt.y.known ? (
                <DragHandle
                  testID="drag-point"
                  x={f.sx(pt.x.value)}
                  y={f.sy(pt.y.value)}
                  label={`the point (${xSym}, ${ySym})`}
                  onStart={() => {
                    start.current.x = pt.x.value;
                    grid.ext.freeze();
                  }}
                  onMove={(dx) => {
                    const id = spec.point!.x;
                    calc.set(
                      {
                        ...rep.pin(vars),
                        [id]: rep.snapTo(id, (start.current.x + dx / f.ux) * rep.factor(id)),
                      },
                      rep.slide(id),
                    );
                  }}
                  onEnd={grid.ext.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          withSign(lineEquation(m, b, xSym, ySym), spec.shade),
          ...(spec.shade && known
            ? [shadeWords(spec.shade, ySym, lineEquation(m, b, xSym, ySym).split(' = ')[1]!)]
            : []),
          m.known
            ? m.value === 0
              ? `Slope ${sym(spec.slope, 'm')} = 0: the line is flat`
              : `Slope ${sym(spec.slope, 'm')} = ${coef(m.value)}: ${m.value > 0 ? 'up' : 'down'} ${coef(Math.abs(rr.rise))} for every ${coef(rr.run)} across`
            : `Slope ${sym(spec.slope, 'm')} = ?`,
          b.known
            ? `Intercept ${sym(spec.intercept, 'b')} = ${coef(b.value)}: it crosses the y-axis at ${pointText(0, b.value)}`
            : `Intercept ${sym(spec.intercept, 'b')} = ?`,
          ...(pt && known && pt.x.known
            ? [
                `${ySym} = ${worked(m.value, pt.x.value, b.value)} when ${xSym} = ${coef(pt.x.value)}`,
              ]
            : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}

/**
 * Two lines on one grid and the point where they cross: the system's solution, true for
 * both equations. Parallel lines (the same slope) never cross; the same line twice shares
 * every point. Each line's intercept drags, and its slope where it is a value.
 */
export function LineSystem({ spec, calc }: { spec: LineSystemSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const lines = spec.lines.map((l) => ({ ...l, m: read(l.slope), b: read(l.intercept) }));
  const [p, q] = lines as [(typeof lines)[0], (typeof lines)[0]];
  const known = lines.every((l) => l.m.known && l.b.known);
  const same = known && p.m.value === q.m.value && p.b.value === q.b.value;
  const parallel = known && p.m.value === q.m.value && !same;
  const cross =
    known && p.m.value !== q.m.value
      ? (() => {
          const x = (q.b.value - p.b.value) / (p.m.value - q.m.value);
          return { x, y: p.m.value * x + p.b.value };
        })()
      : undefined;
  const base = extents(spec.extent);
  // The grid grows to show the crossing, up to 5 times its size (then the caption says it).
  const far = cross && (Math.abs(cross.x) > 5 * base.x || Math.abs(cross.y) > 5 * base.y);
  // Grades 9–12: a tested point and elimination's sum line (a·x + b·y = c).
  const test = spec.test ? { x: read(spec.test.x), y: read(spec.test.y) } : undefined;
  const testIn = test && test.x.known && test.y.known ? test : undefined;
  const sum = spec.sum
    ? { a: read(spec.sum.x), b: read(spec.sum.y), c: read(spec.sum.c) }
    : undefined;
  const sumKnown = !!sum && sum.a.known && sum.b.known && sum.c.known;
  const grid = useGrid(
    spec,
    [...(cross && !far ? [cross.x] : []), ...(testIn ? [testIn.x.value] : [])],
    [
      ...lines.map((l) => l.b.value),
      ...(cross && !far ? [cross.y] : []),
      ...(testIn ? [testIn.y.value] : []),
    ],
  );
  const start = useRef({ m: 0, b: 0 });
  const colors = [c.chartHighlight, c.chartSecond];
  const x = spec.solution ? rep.variable(spec.solution.x).symbol : 'x';
  const y = spec.solution ? rep.variable(spec.solution.y).symbol : 'y';
  const eqs = lines.map((l) => withSign(lineEquation(l.m, l.b, x, y), l.shade));
  // Inequalities: each shaded line as a boundary.
  const bounds = lines.flatMap((l) =>
    l.shade ? [{ m: l.m.value, b: l.b.value, sign: l.shade } as Bound] : [],
  );
  const sumName =
    spec.sum?.label ??
    (sum && sumKnown ? standardText(sum.a.value, sum.b.value, sum.c.value, x, y) : 'Sum');
  const names = lines.map((l, i) => l.label ?? eqs[i]!);
  const allVars = lines.flatMap((l) =>
    [l.slope, l.intercept].filter((v): v is string => typeof v === 'string'),
  );

  let result: string;
  if (!known) result = 'Type both slopes and both intercepts to draw the lines.';
  else if (bounds.length > 0) {
    const both = bounds.length === 2;
    const meet = !both || overlaps(bounds[0]!, bounds[1]!);
    const shaded = lines.find((l) => l.shade)!;
    const tested = testIn
      ? lines.flatMap((l) =>
          l.shade
            ? [
                `${worked(l.m.value, testIn.x.value, l.b.value)}, and ${coef(testIn.y.value)} ${l.shade} ${coef(l.m.value * testIn.x.value + l.b.value)} is ${holds({ m: l.m.value, b: l.b.value, sign: l.shade }, testIn.x.value, testIn.y.value)}`,
              ]
            : [],
        )
      : [];
    const inAll = testIn && bounds.every((q) => holds(q, testIn.x.value, testIn.y.value));
    result = [
      both
        ? meet
          ? 'Where both sides are shaded, both inequalities are true: those points are the solutions.'
          : 'The shaded sides never meet: no point makes both true. No solution.'
        : shadeWords(bounds[0]!.sign, y, lineEquation(shaded.m, shaded.b, x, y).split(' = ')[1]!),
      ...(both
        ? [
            bounds.every((q) => strict(q.sign))
              ? 'Both lines are dashed: points on them are left out.'
              : bounds.every((q) => !strict(q.sign))
                ? 'Both lines are solid: points on them are included.'
                : 'A dashed line is left out; a solid line is included.',
          ]
        : []),
      ...(cross && !far && both && meet
        ? [`The boundaries cross at ${pointText(cross.x, cross.y)}`]
        : []),
      ...(testIn
        ? [
            `Test ${pointText(testIn.x.value, testIn.y.value)}`,
            ...tested,
            inAll ? 'It is a solution.' : 'It is not a solution.',
          ]
        : []),
    ].join(' · ');
  } else if (same) result = 'Both equations are the same line: every point on it is a solution.';
  else if (parallel)
    result = `Both slopes are ${coef(p.m.value)} and the intercepts differ: the lines are parallel and never cross. No solution.`;
  else if (!spec.solution && lines.every((l) => l.b.value === 0)) {
    // Two rates through (0, 0): the steeper line is the bigger rate.
    const [hi, lo] = p.m.value >= q.m.value ? [0, 1] : [1, 0];
    // With named axes the rate is said in them: "$24.50 per cubic yard against $8.75".
    const per = spec.axes?.x ? unitFor(1, spec.axes.x.toLowerCase()) : undefined;
    const rate = (m: number) =>
      spec.axes?.y?.includes('($)') ? dollarsOf(m, formatNumber(m)) : coef(m);
    result = per
      ? `${names[hi]} is steeper: it has the bigger rate, ${rate(lines[hi]!.m.value)} per ${per} against ${rate(lines[lo]!.m.value)}.`
      : `${names[hi]} is steeper: it has the bigger rate, ${coef(lines[hi]!.m.value)} for each 1 across against ${coef(lines[lo]!.m.value)}.`;
  } else if (cross)
    result = `They cross at ${pointText(cross.x, cross.y)}${far ? ', off this grid' : ''}. ${lines.map((l) => worked(l.m.value, cross.x, l.b.value)).join(' · ')}`;
  else result = '';
  if (sum && known) {
    const [a, b, cc] = [sum.a.value, sum.b.value, sum.c.value];
    const said = `${spec.sum!.label ?? 'Adding the equations'}: ${sumKnown ? standardText(a, b, cc, x, y) : '?'}`;
    const solved = !sumKnown
      ? ''
      : a !== 0 && b === 0
        ? `, so ${x} = ${coef(cc / a)}: ${y} is gone, and the upright line goes through the crossing`
        : a === 0 && b !== 0
          ? `, so ${y} = ${coef(cc / b)}: ${x} is gone, and the flat line goes through the crossing`
          : a === 0 && b === 0
            ? ': both letters are gone'
            : ': its line goes through the crossing too';
    result = `${result} · ${said}${solved}`;
  }

  return (
    <View>
      <Canvas aspect={grid.square ? (grid.q1 ? 0.9 : 1) : 0.8}>
        {({ w, h }) => {
          const f = grid.frame(w, h, !!spec.axes);
          const segs = lines.map((l) => clipLine(l.m.value, l.b.value, f));
          // Elimination's sum a·x + b·y = c: slope −a ÷ b, or upright at x = c ÷ a.
          const upright = !!sum && sum.b.value === 0 && sum.a.value !== 0;
          const sumSeg = !sum
            ? undefined
            : sum.b.value !== 0
              ? clipLine(-sum.a.value / sum.b.value, sum.c.value / sum.b.value, f)
              : upright &&
                  sum.c.value / sum.a.value >= f.x[0] - 1e-9 &&
                  sum.c.value / sum.a.value <= f.x[1] + 1e-9
                ? {
                    a: [sum.c.value / sum.a.value, f.y[0]] as const,
                    b: [sum.c.value / sum.a.value, f.y[1]] as const,
                  }
                : undefined;
          // Its name at the top (upright) or the left end, where the lines' names never are.
          const sumTag = !sumSeg
            ? { x: 0, y: 0, anchor: 'start' as const }
            : upright
              ? { x: f.sx(sumSeg.a[0]) + 6, y: f.sy(f.y[1]) + 14, anchor: 'start' as const }
              : {
                  x: f.sx(sumSeg.a[0]) + 4,
                  y: f.sy(sumSeg.a[1]) + (sumSeg.b[1] >= sumSeg.a[1] ? -8 : 16),
                  anchor: 'start' as const,
                };
          // Each line's name at the end where it leaves the grid on the right.
          const tags = segs.map((s, i) =>
            s
              ? { x: f.sx(s.b[0]) - 4, y: f.sy(s.b[1]) + (lines[i]!.m.value >= 0 ? 16 : -8) }
              : undefined,
          );
          if (tags[0] && tags[1] && Math.abs(tags[0].y - tags[1].y) < 18) {
            tags[1].y = tags[0].y + (tags[1].y >= tags[0].y ? 18 : -18);
          }
          // Grades 9–12 (shaded or with a sum line): a name over the x-axis numbers slides in
          // along its line until it is clear of them.
          const axisY = f.sy(Math.min(f.y[1], Math.max(f.y[0], 0)));
          const onNumbers = (ty: number) => ty > axisY - 3 && ty < axisY + 23;
          if (bounds.length > 0 || spec.sum)
            tags.forEach((t, i) => {
              const sg = segs[i];
              if (!t || !sg || !onNumbers(t.y)) return;
              // Other side of the line first, then in along it; clear of the crossing, the
              // tested point and the other name.
              const marks: [number, number][] = [
                ...(cross && !far ? [[f.sx(cross.x), f.sy(cross.y)] as [number, number]] : []),
                ...(testIn
                  ? [[f.sx(testIn.x.value) + 30, f.sy(testIn.y.value) - 12] as [number, number]]
                  : []),
                ...tags.flatMap((o, j) =>
                  o && j !== i ? [[o.x - 40, o.y - 5] as [number, number]] : [],
                ),
              ];
              const rising = lines[i]!.m.value >= 0;
              for (let k = 1; k > 0.35; k -= 0.05)
                for (const off of rising ? [16, -8] : [-8, 16]) {
                  const tx = f.sx(sg.a[0] + (sg.b[0] - sg.a[0]) * k) - 4;
                  const ty = f.sy(sg.a[1] + (sg.b[1] - sg.a[1]) * k) + off;
                  if (onNumbers(ty) || ty < 14 || ty > h - 4) continue;
                  if (marks.some(([mx, my]) => Math.hypot(mx - (tx - 40), my - (ty - 5)) < 48))
                    continue;
                  tags[i] = { x: tx, y: ty };
                  return;
                }
            });
          // Two inequalities: "both true" inside their overlap, at the spot farthest from the
          // lines, the axes, the crossing and the names (none when nowhere has room).
          const overlap = (() => {
            if (!known || bounds.length !== 2) return undefined;
            const axisX = f.sx(Math.min(f.x[1], Math.max(f.x[0], 0)));
            const lineGap = (q: Bound, px: number, py: number) => {
              const [x1, y1, x2, y2] = [f.sx(0), f.sy(q.b), f.sx(1), f.sy(q.m + q.b)];
              return (
                Math.abs((x2 - x1) * (y1 - py) - (x1 - px) * (y2 - y1)) /
                Math.hypot(x2 - x1, y2 - y1)
              );
            };
            const spots: [number, number][] = [
              ...(cross && !far ? [[f.sx(cross.x), f.sy(cross.y)] as [number, number]] : []),
              ...(testIn ? [[f.sx(testIn.x.value), f.sy(testIn.y.value)] as [number, number]] : []),
              ...tags.flatMap((t) => (t ? [[t.x - 40, t.y - 5] as [number, number]] : [])),
              ...lines.map((l) => [f.sx(0), f.sy(l.b.value)] as [number, number]),
            ];
            let best: { x: number; y: number; score: number } | undefined;
            for (let gx = 0.08; gx < 0.95; gx += 0.06)
              for (let gy = 0.06; gy < 0.96; gy += 0.06) {
                const X = f.x[0] + (f.x[1] - f.x[0]) * gx;
                const Y = f.y[0] + (f.y[1] - f.y[0]) * gy;
                if (!bounds.every((q) => holds(q, X, Y))) continue;
                const [px, py] = [f.sx(X), f.sy(Y)];
                // The chip is about 60 × 16: measure from its middle and its two ends.
                const score = Math.min(
                  ...[-30, 0, 30].flatMap((dx) => [
                    ...bounds.map((q) => lineGap(q, px + dx, py) - 8),
                    Math.abs(px + dx - axisX) - 6,
                    ...spots.map(([sx, sy]) => Math.hypot(sx - px - dx, sy - py) - 16),
                  ]),
                  Math.abs(py - axisY) - (py > axisY ? 26 : 12),
                  px - 34 - f.sx(f.x[0]),
                  f.sx(f.x[1]) - px - 34,
                );
                if (!best || score > best.score) best = { x: px, y: py, score };
              }
            return best && best.score > 4 ? best : undefined;
          })();
          /** Where a slope handle sits: a grid x away from the axis where the line is in view. */
          /**
           * Where each slope handle sits: a grid x on the line, in view, clear of the crossing,
           * the line's name and the other handles (the first line right of the axis, the
           * second left of it on a full grid).
           */
          const busy: [number, number][] = [
            ...(cross && !far ? [[f.sx(cross.x), f.sy(cross.y)] as [number, number]] : []),
            ...tags.flatMap((t) => (t ? [[t.x - 30, t.y - 5] as [number, number]] : [])),
            ...lines.map((l) => [f.sx(0), f.sy(l.b.value)] as [number, number]),
          ];
          // The crossing's label goes in the widest gap between the four rays of the lines
          // (screen angles), away from both.
          const rays = lines
            .flatMap((l) => {
              const a = Math.atan2(-l.m.value * f.uy, f.ux);
              return [a, a + Math.PI];
            })
            .map((a) => (a + 2 * Math.PI) % (2 * Math.PI))
            .sort((a, b) => a - b);
          // A gap whose label would sit on an axis (over its numbers) counts as narrow.
          const onAxis = (g: number) => {
            if (!cross) return false;
            const cx = f.sx(cross.x) + Math.cos(g) * 34;
            const cy = f.sy(cross.y) + Math.sin(g) * 22;
            return Math.abs(cx - f.sx(0)) < 34 || Math.abs(cy - f.sy(0)) < 16;
          };
          let gap = -Math.PI / 4;
          let widest = -Infinity;
          rays.forEach((a, i) => {
            const next = i + 1 < rays.length ? rays[i + 1]! : rays[0]! + 2 * Math.PI;
            const g = (a + next) / 2;
            const score = next - a - (onAxis(g) ? Math.PI : 0);
            if (score > widest + 1e-6) {
              widest = score;
              gap = g;
            }
          });
          // A line's name that would sit on the crossing or its label moves to the line's
          // left end (inside the grid, above a rising line, below a falling one).
          const crossBox =
            cross && !far
              ? (() => {
                  const cx = f.sx(cross.x);
                  const cy = f.sy(cross.y);
                  const lx = cx + Math.cos(gap) * 34;
                  const tw = chipWidth(pointText(cross.x, cross.y), chart.label);
                  return {
                    l: Math.min(cx - 10, lx - tw / 2),
                    r: Math.max(cx + 10, lx + tw / 2),
                    t: Math.min(cy - 10, cy + Math.sin(gap) * 22 - 10),
                    b: Math.max(cy + 10, cy + Math.sin(gap) * 22 + 10),
                  };
                })()
              : undefined;
          tags.forEach((t, i) => {
            const s = segs[i];
            if (!t || !s || !crossBox) return;
            const tw = chipWidth(names[i]!);
            const hit =
              t.x - tw < crossBox.r &&
              t.x > crossBox.l &&
              t.y - 12 < crossBox.b &&
              t.y > crossBox.t;
            if (!hit) return;
            // A quarter of the way in from the left end, left of the line and on the side
            // away from it (over a rising line, under a falling one): off the y-axis numbers.
            const px = f.sx(s.a[0] + (s.b[0] - s.a[0]) / 4);
            const py = f.sy(s.a[1] + (s.b[1] - s.a[1]) / 4);
            const rising = lines[i]!.m.value >= 0;
            tags[i] = { x: px - 8, y: py + (rising ? -8 : 16) };
            busy.push([px - 8 - 30, py + (rising ? -13 : 11)]);
          });
          const span = f.x[1] - f.x[0];
          const step = span <= 20 ? 1 : span / 20;
          const hxs = lines.map((l, i) => {
            if (typeof l.slope !== 'string' || !known) return undefined;
            const q1 = f.x[0] === 0;
            const fractions = q1
              ? i === 0
                ? [0.75, 0.55, 0.9, 0.35, 0.2]
                : [0.45, 0.65, 0.25, 0.85, 0.15]
              : i === 0
                ? [0.35, 0.55, 0.2, 0.75, -0.35, -0.55]
                : [-0.35, -0.55, -0.2, -0.75, 0.35, 0.55];
            for (const fr of fractions) {
              const x = Math.round((f.x[1] * fr) / step) * step;
              if (x === 0) continue;
              const px = f.sx(x);
              const py = f.sy(l.m.value * x + l.b.value);
              if (py < f.sy(f.y[1]) + 4 || py > f.sy(f.y[0]) - 4) continue;
              if (busy.some(([bx, by]) => Math.hypot(bx - px, by - py) < 34)) continue;
              busy.push([px, py]);
              return x;
            }
            return undefined;
          });
          return (
            <>
              <Svg width={w} height={h}>
                <GridAxes f={f} names={spec.axes} />
                {lines.map((l, i) =>
                  l.shade ? (
                    <Path
                      key={`s${i}`}
                      d={regionPath(region([{ m: l.m.value, b: l.b.value, sign: l.shade }], f), f)}
                      fill={colors[i]}
                      opacity={known ? 0.16 : 0.06}
                    />
                  ) : null,
                )}
                {overlap ? (
                  <Chip
                    x={overlap.x}
                    y={overlap.y + 5}
                    text="both true"
                    w={w}
                    h={h}
                    color={c.chartInk}
                  />
                ) : null}
                {sumSeg ? (
                  <G opacity={sumKnown ? 1 : 0.35}>
                    <Line
                      x1={f.sx(sumSeg.a[0])}
                      y1={f.sy(sumSeg.a[1])}
                      x2={f.sx(sumSeg.b[0])}
                      y2={f.sy(sumSeg.b[1])}
                      stroke={c.lineSum}
                      strokeWidth={chart.stroke + 0.5}
                    />
                    <Chip
                      x={sumTag.x}
                      y={sumTag.y}
                      text={sumName}
                      anchor={sumTag.anchor}
                      w={w}
                      h={h}
                      color={c.lineSum}
                    />
                  </G>
                ) : null}
                {segs.map((s, i) =>
                  s ? (
                    <Line
                      key={`l${i}`}
                      x1={f.sx(s.a[0])}
                      y1={f.sy(s.a[1])}
                      x2={f.sx(s.b[0])}
                      y2={f.sy(s.b[1])}
                      stroke={colors[i]}
                      strokeWidth={chart.strokeHeavy}
                      strokeDasharray={
                        lines[i]!.shade && strict(lines[i]!.shade!)
                          ? STRICT_DASH
                          : same && i === 1
                            ? '10 8'
                            : undefined
                      }
                      opacity={lines[i]!.m.known && lines[i]!.b.known ? 1 : 0.35}
                    />
                  ) : null,
                )}
                {lines.map((l, i) =>
                  l.b.value >= f.y[0] && l.b.value <= f.y[1] && f.x[0] <= 0 ? (
                    <Circle
                      key={`b${i}`}
                      cx={f.sx(0)}
                      cy={f.sy(l.b.value)}
                      r={4.5}
                      fill={colors[i]}
                      opacity={l.b.known ? 1 : 0.35}
                    />
                  ) : null,
                )}
                {tags.map((t, i) =>
                  t ? (
                    <Chip
                      key={`t${i}`}
                      x={t.x}
                      y={t.y}
                      text={names[i]!}
                      anchor="end"
                      w={w}
                      h={h}
                      color={c.chartInk}
                    />
                  ) : null,
                )}
                {cross && !far ? (
                  <G>
                    <Path
                      d={`M ${f.sx(cross.x)} ${f.sy(Math.max(f.y[0], Math.min(f.y[1], 0)))} L ${f.sx(cross.x)} ${f.sy(cross.y)} L ${f.sx(Math.max(f.x[0], Math.min(f.x[1], 0)))} ${f.sy(cross.y)}`}
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dashFine}
                      fill="none"
                    />
                    <Circle
                      cx={f.sx(cross.x)}
                      cy={f.sy(cross.y)}
                      r={8}
                      fill={c.card}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    <Circle cx={f.sx(cross.x)} cy={f.sy(cross.y)} r={3.5} fill={c.chartInk} />
                    {/* Two rates through the corner (0, 0): the axes already say 0. */}
                    {cross.x === 0 && cross.y === 0 && f.x[0] === 0 && f.y[0] === 0 ? null : (
                      <Chip
                        x={f.sx(cross.x) + Math.cos(gap) * 34}
                        y={f.sy(cross.y) + Math.sin(gap) * 22 + 5}
                        text={pointText(cross.x, cross.y)}
                        w={w}
                        h={h}
                        size={chart.label}
                      />
                    )}
                  </G>
                ) : null}
                {testIn ? (
                  <G>
                    <Circle
                      cx={f.sx(testIn.x.value)}
                      cy={f.sy(testIn.y.value)}
                      r={5.5}
                      fill={
                        bounds.every((q) => holds(q, testIn.x.value, testIn.y.value))
                          ? c.chartInk
                          : c.card
                      }
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    <Chip
                      x={f.sx(testIn.x.value) + 9}
                      y={f.sy(testIn.y.value) - 8}
                      text={pointText(testIn.x.value, testIn.y.value)}
                      anchor="start"
                      w={w}
                      h={h}
                    />
                  </G>
                ) : null}
              </Svg>
              {lines.map((l, i) => {
                const handles = [];
                if (spec.fixed) return null;
                const others = (id: string) =>
                  l.keep ? rep.pin(l.keep) : rep.pin(allVars.filter((v) => v !== id));
                if (
                  typeof l.intercept === 'string' &&
                  l.b.known &&
                  l.b.value >= f.y[0] &&
                  l.b.value <= f.y[1] &&
                  f.x[0] <= 0
                ) {
                  const id = l.intercept;
                  handles.push(
                    <DragHandle
                      key={`hb${i}`}
                      testID={`drag-intercept-${i + 1}`}
                      x={f.sx(0)}
                      y={f.sy(l.b.value)}
                      label={`the intercept ${rep.variable(id).symbol}`}
                      onStart={() => {
                        start.current.b = l.b.value;
                        grid.ext.freeze();
                      }}
                      onMove={(_, dy) =>
                        calc.set(
                          {
                            ...others(id),
                            [id]: rep.snapTo(id, (start.current.b - dy / f.uy) * rep.factor(id)),
                          },
                          rep.slide(id),
                        )
                      }
                      onEnd={grid.ext.release}
                    />,
                  );
                }
                const hx = hxs[i];
                if (typeof l.slope === 'string' && hx !== undefined) {
                  const id = l.slope;
                  handles.push(
                    <DragHandle
                      key={`hm${i}`}
                      testID={`drag-slope-${i + 1}`}
                      x={f.sx(hx)}
                      y={f.sy(l.m.value * hx + l.b.value)}
                      label={`the slope ${rep.variable(id).symbol}`}
                      onStart={() => {
                        start.current = { m: l.m.value, b: l.b.value };
                        grid.ext.freeze();
                      }}
                      onMove={(_, dy) => {
                        const s = start.current;
                        const yNow = s.m * hx + s.b - dy / f.uy;
                        calc.set(
                          {
                            ...others(id),
                            [id]: rep.snapTo(id, ((yNow - s.b) / hx) * rep.factor(id)),
                          },
                          rep.slide(id),
                        );
                      }}
                      onEnd={grid.ext.release}
                    />,
                  );
                }
                return handles;
              })}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          ...eqs.map((e, i) => (spec.lines[i]!.label ? `${spec.lines[i]!.label}: ${e}` : e)),
          result,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}

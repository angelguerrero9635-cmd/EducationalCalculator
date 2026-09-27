import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { LinearFunctionSpec, LineSystemSpec } from '@/data/modules/typesGraphs';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { toFraction } from './exact';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
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

/** "m × x + b" as a number sentence: "2 × 4 + 3 = 11", "−1 × 2 − 5 = −7". */
const worked = (m: number, x: number, b: number) =>
  `${coef(m)} × ${x < 0 ? `(${coef(x)})` : coef(x)} ${b < 0 ? '−' : '+'} ${coef(Math.abs(b))} = ${coef(m * x + b)}`;

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
          return (
            <>
              <Svg width={w} height={h}>
                <GridAxes f={f} names={spec.axes} />
                {seg ? (
                  <Line
                    x1={f.sx(seg.a[0])}
                    y1={f.sy(seg.a[1])}
                    x2={f.sx(seg.b[0])}
                    y2={f.sy(seg.b[1])}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
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
                      y={f.sy(b.value) + (m.value >= 0 === q1 ? 20 : -9)}
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
                    {/* Up and left of a rising line, down and left of a falling one: the side
                        the slope triangle never takes. */}
                    <Chip
                      x={f.sx(pt.x.value) - 12}
                      y={f.sy(pt.y.value) + (m.value >= 0 ? -10 : 20)}
                      text={pointText(pt.x.value, pt.y.value)}
                      anchor="end"
                      w={w}
                      h={h}
                    />
                  </G>
                ) : null}
              </Svg>
              {typeof spec.intercept === 'string' && b.known && bIn ? (
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
                        ...rep.pin(vars.filter((v) => v !== id)),
                        ...(spec.point ? rep.pin([spec.point.x]) : {}),
                        [id]: rep.snapTo(id, (start.current.b - dy / f.uy) * rep.factor(id)),
                      },
                      rep.slide(id),
                    );
                  }}
                  onEnd={grid.ext.release}
                />
              ) : null}
              {typeof spec.slope === 'string' && known && x0 !== undefined ? (
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
                        ...rep.pin(vars.filter((v) => v !== id)),
                        ...(spec.point ? rep.pin([spec.point.x]) : {}),
                        [id]: rep.snapTo(id, (riseNow / s.run) * rep.factor(id)),
                      },
                      rep.slide(id),
                    );
                  }}
                  onEnd={grid.ext.release}
                />
              ) : null}
              {spec.point && pt?.x.known && pt.y.known ? (
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
          lineEquation(m, b, xSym, ySym),
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
  const grid = useGrid(spec, cross && !far ? [cross.x] : [], [
    ...lines.map((l) => l.b.value),
    ...(cross && !far ? [cross.y] : []),
  ]);
  const start = useRef({ m: 0, b: 0 });
  const colors = [c.chartHighlight, c.chartSecond];
  const x = spec.solution ? rep.variable(spec.solution.x).symbol : 'x';
  const y = spec.solution ? rep.variable(spec.solution.y).symbol : 'y';
  const eqs = lines.map((l) => lineEquation(l.m, l.b, x, y));
  const names = lines.map((l, i) => l.label ?? eqs[i]!);
  const allVars = lines.flatMap((l) =>
    [l.slope, l.intercept].filter((v): v is string => typeof v === 'string'),
  );

  let result: string;
  if (!known) result = 'Type both slopes and both intercepts to draw the lines.';
  else if (same) result = 'Both equations are the same line: every point on it is a solution.';
  else if (parallel)
    result = `Both slopes are ${coef(p.m.value)} and the intercepts differ: the lines are parallel and never cross. No solution.`;
  else if (cross)
    result = `They cross at ${pointText(cross.x, cross.y)}${far ? ', off this grid' : ''}. ${lines.map((l) => worked(l.m.value, cross.x, l.b.value)).join(' · ')}`;
  else result = '';

  return (
    <View>
      <Canvas aspect={grid.square ? (grid.q1 ? 0.9 : 1) : 0.8}>
        {({ w, h }) => {
          const f = grid.frame(w, h, !!spec.axes);
          const segs = lines.map((l) => clipLine(l.m.value, l.b.value, f));
          // Each line's name at the end where it leaves the grid on the right.
          const tags = segs.map((s, i) =>
            s
              ? { x: f.sx(s.b[0]) - 4, y: f.sy(s.b[1]) + (lines[i]!.m.value >= 0 ? 16 : -8) }
              : undefined,
          );
          if (tags[0] && tags[1] && Math.abs(tags[0].y - tags[1].y) < 18) {
            tags[1].y = tags[0].y + (tags[1].y >= tags[0].y ? 18 : -18);
          }
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
                      strokeDasharray={same && i === 1 ? '10 8' : undefined}
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
                    <Chip
                      x={f.sx(cross.x) + Math.cos(gap) * 34}
                      y={f.sy(cross.y) + Math.sin(gap) * 22 + 5}
                      text={pointText(cross.x, cross.y)}
                      w={w}
                      h={h}
                      size={chart.label}
                    />
                  </G>
                ) : null}
              </Svg>
              {lines.map((l, i) => {
                const handles = [];
                const others = (id: string) => rep.pin(allVars.filter((v) => v !== id));
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

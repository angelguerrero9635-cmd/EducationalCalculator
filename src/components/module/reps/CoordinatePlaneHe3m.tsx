/**
 * The GIS options of `coordinatePlane` (HC77, EG-P26): `shoelace` (a polygon's area from its
 * vertices, each cross term listed), `buffer` (a line's outline r out with round ends, 2rL +
 * πr²) and `center` (the mean centre and the standard-distance circle). Drawn on a plane sized
 * to the figure with equal scales; flat, like any graph. Math in `gisMath.ts`.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, niceCeil } from './common';
import { Dimension, HeLabel } from './beamKit';
import { n3, useReader, VDim, type Reader } from './he3mKit';
import {
  bufferArea,
  meanCenter,
  shoelaceArea,
  shoelaceTerms,
  sidesCross,
  standardDistance,
} from './gisMath';

type Spec = Extract<Representation, { kind: 'coordinatePlane' }>;
type Palette = ReturnType<typeof usePalette>;
type Pt = [number, number];

const SUB = ['₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

/** Whether a plane is one of these (the `reps/index.tsx` switch sends it here). */
export const isGisPlane = (s: Spec) => !!(s.shoelace || s.buffer || s.center);

export function CoordinatePlaneHe3m({ spec, calc }: { spec: Spec; calc: Calculator }) {
  if (spec.buffer) return <BufferView spec={spec} calc={calc} />;
  return <PointsView spec={spec} calc={calc} />;
}

/** A plane sized to a box of values: equal scales, a grid at round steps, numbered edges. */
function planeOf(w: number, box: [number, number, number, number], maxH: number) {
  let [x0, x1, y0, y1] = box;
  const span = Math.max(x1 - x0, y1 - y0, 1e-9);
  const m = span * 0.1;
  [x0, x1, y0, y1] = [x0 - m, x1 + m, y0 - m, y1 + m];
  const left = 50;
  const right = 14;
  const top = 14;
  const bottom = 26;
  const k = Math.min((w - left - right) / (x1 - x0), (maxH - top - bottom) / (y1 - y0));
  const h = (y1 - y0) * k + top + bottom;
  const X = (x: number) => left + (x - x0) * k;
  const Y = (y: number) => top + (y1 - y) * k;
  const step = niceCeil(Math.max(x1 - x0, y1 - y0) / 5);
  const grid = (a: number, b: number) => {
    const out: number[] = [];
    for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step)
      out.push(Number(v.toPrecision(10)));
    return out;
  };
  return { X, Y, h, k, gx: grid(x0, x1), gy: grid(y0, y1), x0, x1, y0, y1, left, top };
}

type Plane = ReturnType<typeof planeOf>;

function Grid({ p, c }: { p: Plane; c: Palette }) {
  return (
    <G>
      {p.gx.map((v) => (
        <G key={`x${v}`}>
          <Line
            x1={p.X(v)}
            y1={p.Y(p.y0)}
            x2={p.X(v)}
            y2={p.Y(p.y1)}
            stroke={v === 0 ? c.chartInk : c.chartGrid}
            strokeWidth={v === 0 ? 1.4 : 1}
          />
          <ChartText
            x={p.X(v)}
            y={p.Y(p.y0) + 13}
            textAnchor="middle"
            fontSize={chart.tiny}
            fill={c.chartMuted}
          >
            {n3(v)}
          </ChartText>
        </G>
      ))}
      {p.gy.map((v) => (
        <G key={`y${v}`}>
          <Line
            x1={p.X(p.x0)}
            y1={p.Y(v)}
            x2={p.X(p.x1)}
            y2={p.Y(v)}
            stroke={v === 0 ? c.chartInk : c.chartGrid}
            strokeWidth={v === 0 ? 1.4 : 1}
          />
          <ChartText
            x={p.X(p.x0) - 4}
            y={p.Y(v) + 3}
            textAnchor="end"
            fontSize={chart.tiny}
            fill={c.chartMuted}
          >
            {n3(v)}
          </ChartText>
        </G>
      ))}
    </G>
  );
}

/** Drag handles on points whose coordinates are variables. */
function Handles({
  pts,
  fields,
  p,
  r,
  calc,
  names,
}: {
  pts: Pt[];
  fields: [string | number, string | number][];
  p: Plane;
  r: Reader;
  calc: Calculator;
  names: string[];
}) {
  const start = useRef<Pt>([0, 0]);
  const all = fields.flat().filter((f): f is string => typeof f === 'string');
  return (
    <>
      {fields.map(([fx, fy], i) => {
        if (typeof fx !== 'string' || typeof fy !== 'string' || !pts[i]) return null;
        return (
          <DragHandle
            key={i}
            testID={`drag-point-${i + 1}`}
            x={p.X(pts[i]![0])}
            y={p.Y(pts[i]![1])}
            label={`the point ${names[i]}`}
            onStart={() => {
              start.current = pts[i]!;
            }}
            onMove={(mx, my) =>
              calc.set({
                ...r.rep.pinTyped(all.filter((id) => id !== fx && id !== fy)),
                [fx]: r.rep.snapTo(fx, start.current[0] + mx / p.k),
                [fy]: r.rep.snapTo(fy, start.current[1] - my / p.k),
              })
            }
          />
        );
      })}
    </>
  );
}

// ─── shoelace and center: points on the plane ───────────────────────────────

function PointsView({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const fields: [string | number, string | number][] = spec.center
    ? spec.center.points
    : (spec.polygon ?? []);
  const read = fields.map(([fx, fy]) => [r.get(fx), r.get(fy)] as const);
  const all = read.every(([x, y]) => x !== undefined && y !== undefined);
  const pts = read.filter(([x, y]) => x !== undefined && y !== undefined) as Pt[];
  const center = !!spec.center;
  const names = fields.map((_, i) => (center ? `P${SUB[i]}` : String.fromCharCode(65 + i)));
  const crossed = !center && all && sidesCross(pts);
  const mc = center && all && pts.length > 0 ? meanCenter(pts) : undefined;
  const sd = center && all && pts.length > 0 ? standardDistance(pts) : undefined;
  const xs = pts.map((q) => q[0]);
  const ys = pts.map((q) => q[1]);
  const box: [number, number, number, number] = pts.length
    ? mc && sd !== undefined
      ? [
          Math.min(...xs, mc[0] - sd),
          Math.max(...xs, mc[0] + sd),
          Math.min(...ys, mc[1] - sd),
          Math.max(...ys, mc[1] + sd),
        ]
      : [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
    : [0, 1, 0, 1];
  const unit = typeof fields[0]?.[0] === 'string' ? (r.rep.unit(fields[0][0]) ?? '') : '';

  const art = (w: number, p: Plane) => {
    const [cx, cy] = pts.length ? meanCenter(pts) : [0, 0];
    return (
      <Svg width={w} height={p.h}>
        <Grid p={p} c={c} />
        {!center && pts.length >= 3 ? (
          <Path
            d={`M ${pts.map(([x, y]) => `${p.X(x).toFixed(1)} ${p.Y(y).toFixed(1)}`).join(' L ')} Z`}
            fill={c.chartHighlight}
            fillOpacity={crossed ? 0.08 : 0.2}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
            opacity={crossed ? 0.5 : 1}
          />
        ) : null}
        {mc && sd !== undefined ? (
          <G>
            <Circle
              cx={p.X(mc[0])}
              cy={p.Y(mc[1])}
              r={sd * p.k}
              fill={c.chartHighlight}
              fillOpacity={0.1}
              stroke={c.chartHighlight}
              strokeWidth={1.6}
              strokeDasharray={chart.dash}
            />
            {pts.map(([x, y], i) => (
              <Line
                key={i}
                x1={p.X(mc[0])}
                y1={p.Y(mc[1])}
                x2={p.X(x)}
                y2={p.Y(y)}
                stroke={c.chartMuted}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
            ))}
            <Line
              x1={p.X(mc[0])}
              y1={p.Y(mc[1])}
              x2={p.X(mc[0] + sd)}
              y2={p.Y(mc[1])}
              stroke={c.chartHighlight}
              strokeWidth={2}
            />
            <HeLabel
              x={p.X(mc[0] + sd / 2)}
              y={p.Y(mc[1]) + 16}
              text={`SD = ${r.text(spec.center?.sd, sd)}`}
              color={c.chartHighlight}
              w={w}
            />
            <Rect
              x={p.X(mc[0]) - 5}
              y={p.Y(mc[1]) - 5}
              width={10}
              height={10}
              fill={c.chartInk}
              transform={`rotate(45 ${p.X(mc[0])} ${p.Y(mc[1])})`}
            />
            <HeLabel
              x={p.X(mc[0])}
              y={p.Y(mc[1]) - 12}
              text={`(x̄, ȳ) = (${r.bare(spec.center?.x, mc[0])}, ${r.bare(spec.center?.y, mc[1])})`}
              w={w}
            />
          </G>
        ) : null}
        {pts.map(([x, y], i) => {
          // Each name goes outside the figure, away from the points' middle.
          const dx = x - cx;
          const dy = y - cy;
          const right = dx >= 0;
          const text = `${names[i]}(${n3(x)}, ${n3(y)})`;
          return (
            <G key={i}>
              <Circle cx={p.X(x)} cy={p.Y(y)} r={5} fill={c.chartHighlight} />
              <ChartText
                {...fitLabel(
                  p.X(x) + (right ? 8 : -8),
                  text,
                  chart.small,
                  w,
                  right ? 'start' : 'end',
                  8,
                )}
                y={p.Y(y) + (dy >= 0 ? -8 : 16)}
                fontSize={chart.small}
                fontWeight="700"
              >
                {text}
              </ChartText>
            </G>
          );
        })}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (!center && all && pts.length >= 3) {
    const terms = shoelaceTerms(pts);
    pts.forEach(([x1, y1], i) => {
      const j = (i + 1) % pts.length;
      const [x2, y2] = pts[j]!;
      lines.push(
        `x${SUB[i]}y${SUB[j]} − x${SUB[j]}y${SUB[i]} = ${n3(x1)} × ${n3(y2)} − ${n3(x2)} × ${n3(y1)} = ${n3(terms[i]!)}`,
      );
    });
    const area = shoelaceArea(pts);
    lines.push(
      `Area = ½|${terms.map(n3).join(' + ').replace(/\+ −/g, '− ')}| = ${r.text(spec.shoelace?.area, area, unit ? `${unit}²` : '')}.`,
    );
    if (crossed)
      lines.push(
        'Two sides cross: the shoelace needs the corners in order round an edge that does not cross itself.',
      );
  }
  if (center && mc && sd !== undefined) {
    const n = pts.length;
    lines.push(
      `x̄ = (${pts.map((q) => n3(q[0])).join(' + ')}) ÷ ${n} = ${n3(mc[0])}; ȳ = (${pts.map((q) => n3(q[1])).join(' + ')}) ÷ ${n} = ${n3(mc[1])}.`,
    );
    const sq = pts.reduce((a, [x, y]) => a + (x - mc[0]) ** 2 + (y - mc[1]) ** 2, 0);
    lines.push(
      `SD = √(Σ((x − x̄)² + (y − ȳ)²) ÷ ${n}) = √(${n3(sq)} ÷ ${n}) = ${r.text(spec.center?.sd, sd)}: about two-thirds of a spread-out set lie within it.`,
    );
  }
  return (
    <View>
      <Canvas aspect={(w) => planeOf(w, box, 360).h / w}>
        {({ w }) => {
          const p = planeOf(w, box, 360);
          return (
            <>
              {art(w, p)}
              <Handles pts={pts} fields={fields} p={p} r={r} calc={calc} names={names} />
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ') || 'Type every vertex to draw the figure.'}</Caption>
    </View>
  );
}

// ─── buffer: a line's outline r out ─────────────────────────────────────────

function BufferView({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const L = r.get(spec.x);
  const R = r.get(spec.y);
  const ok = L !== undefined && R !== undefined && L >= 0 && R > 0;
  const start = useRef<Pt>([0, 0]);
  const unit = r.rep.unit(spec.x) ?? 'm';
  const H = 230;

  const art = (w: number) => {
    const total = ok ? L! + 2 * R! : 1;
    const k = ok ? Math.min((w - 40) / total, 120 / (2 * R!)) : 1;
    const x0 = ok ? (w - total * k) / 2 + R! * k : 20;
    const yc = 90;
    const rr = ok ? R! * k : 0;
    const ll = ok ? L! * k : 0;
    // A scale bar a round length long, about a quarter of the width.
    const barLen = ok ? niceCeil((w * 0.25) / k) : 0;
    return (
      <Svg width={w} height={H}>
        {ok ? (
          <G>
            <Rect
              x={x0}
              y={yc - rr}
              width={ll}
              height={2 * rr}
              fill={c.chartHighlight}
              fillOpacity={0.22}
            />
            <Path
              d={`M ${x0} ${yc - rr} A ${rr} ${rr} 0 0 0 ${x0} ${yc + rr} Z M ${x0 + ll} ${yc - rr} A ${rr} ${rr} 0 0 1 ${x0 + ll} ${yc + rr} Z`}
              fill={c.chartSecond}
              fillOpacity={0.45}
            />
            <Path
              d={`M ${x0} ${yc - rr} L ${x0 + ll} ${yc - rr} A ${rr} ${rr} 0 0 1 ${x0 + ll} ${yc + rr} L ${x0} ${yc + rr} A ${rr} ${rr} 0 0 1 ${x0} ${yc - rr} Z`}
              fill="none"
              stroke={c.chartHighlight}
              strokeWidth={chart.stroke}
            />
            {ll > 0 ? (
              <Line
                x1={x0}
                y1={yc}
                x2={x0 + ll}
                y2={yc}
                stroke={c.chartInk}
                strokeWidth={4}
                strokeLinecap="round"
              />
            ) : (
              <Circle cx={x0} cy={yc} r={4} fill={c.chartInk} />
            )}
            <VDim
              x={x0 + ll}
              y1={yc}
              y2={yc - rr}
              text={r.named(spec.y, 'r', R!, unit)}
              w={w}
              side={-1}
            />
            {ll > 0 ? (
              <Dimension
                x1={x0}
                x2={x0 + ll}
                y={yc + rr + 22}
                text={r.named(spec.x, 'L', L!, unit)}
                w={w}
              />
            ) : null}
            {ll > 50 && rr > 14 ? (
              <ChartText
                x={x0 + ll / 2}
                y={yc - rr / 2 + 4}
                textAnchor="middle"
                fontSize={chart.small}
                fontWeight="700"
                fill={c.chartInk}
              >
                2rL
              </ChartText>
            ) : null}
            {rr > 18 ? (
              <ChartText
                x={x0 - rr / 2}
                y={yc + 4}
                textAnchor="middle"
                fontSize={chart.small}
                fontWeight="700"
                fill={c.chartInk}
              >
                {ll > 0 ? '½πr²' : 'πr²'}
              </ChartText>
            ) : null}
            {/* The scale bar. */}
            <G>
              <Rect x={16} y={H - 22} width={barLen * k} height={6} fill={c.chartInk} />
              <Rect
                x={16 + (barLen * k) / 2}
                y={H - 22}
                width={(barLen * k) / 2}
                height={6}
                fill={c.chartSurface}
                stroke={c.chartInk}
                strokeWidth={1}
              />
              <ChartText x={16 + barLen * k + 6} y={H - 15} fontSize={chart.small}>
                {`${n3(barLen)} ${unit}`}
              </ChartText>
            </G>
          </G>
        ) : null}
      </Svg>
    );
  };

  const lines: string[] = [];
  if (ok) {
    const area = bufferArea(L!, R!);
    const a = r.sym(spec.buffer?.area, 'A');
    lines.push(
      `${a} = 2rL + πr² = 2 × ${r.bare(spec.y, R!)} × ${r.bare(spec.x, L!)} + π × ${r.bare(spec.y, R!)}² = ${n3(2 * R! * L!)} + ${n3(Math.PI * R! * R!)} = ${r.text(spec.buffer?.area, area, `${unit}²`)}.`,
    );
    lines.push('The strip along the line is 2r wide; the two round ends make one circle.');
  } else if (R !== undefined && R <= 0) lines.push('The buffer radius must be more than 0.');
  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const total = ok ? L! + 2 * R! : 1;
          const k = ok ? Math.min((w - 40) / total, 120 / (2 * R!)) : 1;
          const x0 = ok ? (w - total * k) / 2 + R! * k : 20;
          return (
            <>
              {art(w)}
              {ok ? (
                <DragHandle
                  testID="drag-point"
                  x={x0 + L! * k}
                  y={90 - R! * k}
                  label="the outline's corner (L, r)"
                  onStart={() => {
                    start.current = [L!, R!];
                  }}
                  onMove={(mx, my) =>
                    calc.set({
                      [spec.x]: r.rep.snapTo(spec.x, Math.max(0, start.current[0] + mx / k)),
                      [spec.y]: r.rep.snapTo(spec.y, start.current[1] - my / k),
                    })
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ') || 'Type the line’s length and the buffer radius.'}</Caption>
    </View>
  );
}

import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep, Caption } from './common';
import { DimLine, Pill, pillSize, textW } from './dimKit';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'rectilinear' }>;

/** Room for the labels: above (a cut's width), below (the widths), and each side's gap. */
const TOP = 34;
const BOTTOM = 46;

/**
 * A shape made of two rectangles standing side by side on the same base (an L or a step),
 * flat: each part in its own tint, covered in unit squares you can count, split by a dashed
 * line, with its area on a chip in the middle. Every side sits on a dimension line with end
 * ticks. Or (`cut`) a rectangle with a smaller one cut out of its top right corner: the cut
 * piece hatched inside a dashed outline, the shape left in unit squares.
 */
export function Rectilinear({ spec, calc }: { spec: Spec; calc: Calculator }) {
  if (spec.cut) return <CutOut spec={spec} cut={spec.cut} calc={calc} />;
  return <SideBySide spec={spec} right={spec.right!} calc={calc} />;
}

/** The scale and where the shape starts, centred with its side labels. */
function fit(w: number, across: number, tall: number, wide: number, padL: number, padR: number) {
  const unit = Math.min((w - padL - padR - 8) / across, (0.62 * w) / tall);
  const x0 = (w - (padL + wide * unit + padR)) / 2 + padL;
  return { unit, x0 };
}

/** Unit-square grid lines over a rectangle of `cols` × `rows` squares. */
function grid(x: number, y: number, cols: number, rows: number, unit: number) {
  return [
    ...Array.from(
      { length: Math.max(0, cols - 1) },
      (_, i) => `M ${x + (i + 1) * unit} ${y} v ${rows * unit}`,
    ),
    ...Array.from(
      { length: Math.max(0, rows - 1) },
      (_, i) => `M ${x} ${y + (i + 1) * unit} h ${cols * unit}`,
    ),
  ].join(' ');
}

/**
 * A rectangle with a smaller rectangle cut out of its top right corner. The cut piece is
 * hatched inside a dashed outline with its area on a dashed chip; the shape left is in unit
 * squares with its area on a chip.
 */
function CutOut({
  spec,
  cut,
  calc,
}: {
  spec: Spec;
  cut: NonNullable<Spec['cut']>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = [spec.left.width, spec.left.height, cut.width, cut.height];
  const size = (id: string) => (rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0);
  const [a, b, cw, ch] = ids.map(size) as [number, number, number, number];
  const across = Math.max(spec.extent, a);
  const tall = Math.max(spec.extent / 2, b);
  const padL = textW(rep.value(spec.left.height)) + 28;
  const padR = textW(rep.value(cut.height)) + 28;
  const layout = (w: number) => fit(w, across, tall, a, padL, padR);

  return (
    <View>
      <Canvas aspect={(w) => (TOP + b * layout(w).unit + BOTTOM) / w}>
        {({ w, h }) => {
          const { unit, x0 } = layout(w);
          const top = TOP;
          const base = top + b * unit;
          const cx = x0 + (a - cw) * unit;
          const right = x0 + a * unit;
          const cutB = top + ch * unit;
          // The shape left: the big rectangle without its top right corner.
          const outline = `M ${x0} ${base} H ${right} V ${cutB} H ${cx} V ${top} H ${x0} Z`;
          // Hatching across the cut piece: lines at 45°, clipped to it by hand.
          const hatch: string[] = [];
          const [hw, hh] = [cw * unit, ch * unit];
          for (let k = 8; k < hw + hh; k += 8) {
            const x1 = cx + Math.min(k, hw);
            const y1 = top + Math.max(0, k - hw);
            const x2 = cx + Math.max(0, k - hh);
            const y2 = top + Math.min(k, hh);
            hatch.push(`M ${x1} ${y1} L ${x2} ${y2}`);
          }
          // The shape's area goes in its bigger part: the column under the cut's left, or the
          // band under the cut.
          const colArea = (a - cw) * b;
          const bandArea = a * (b - ch);
          const total = rep.value(spec.total);
          const label = pillSize(total);
          const [ax, ay, room, roomH] =
            colArea >= bandArea
              ? [x0 + ((a - cw) * unit) / 2, top + (b * unit) / 2, (a - cw) * unit, b * unit]
              : [x0 + (a * unit) / 2, cutB + ((b - ch) * unit) / 2, a * unit, (b - ch) * unit];
          const areaUnit = rep.unit(spec.total);
          const cutText = cut.area
            ? rep.value(cut.area)
            : `${cw * ch}${areaUnit ? ` ${areaUnit}` : ''}`;
          const cutFits = pillSize(cutText).w + 6 <= hw && hh >= 26;
          return (
            <Svg width={w} height={h}>
              <Path d={outline} fill={c.chartHighlight} fillOpacity={0.15} />
              <Path
                d={grid(x0, top, a, b, unit)}
                stroke={c.chartMuted}
                strokeOpacity={0.35}
                strokeWidth={1}
              />
              {cw > 0 && ch > 0 ? (
                <G>
                  <Rect x={cx} y={top} width={hw} height={hh} fill={c.card} />
                  <Path
                    d={hatch.join(' ')}
                    stroke={c.chartMuted}
                    strokeOpacity={0.5}
                    strokeWidth={1}
                  />
                  <Rect
                    x={cx}
                    y={top}
                    width={hw}
                    height={hh}
                    fill="none"
                    stroke={c.chartMuted}
                    strokeWidth={chart.stroke}
                    strokeDasharray={chart.dash}
                  />
                </G>
              ) : null}
              <Path
                d={outline}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                strokeLinejoin="round"
              />
              {cw > 0 && ch > 0 && cutFits ? (
                <Pill
                  x={cx + hw / 2}
                  y={top + hh / 2}
                  text={cutText}
                  color={c.chartMuted}
                  stroke={c.chartMuted}
                />
              ) : null}
              {/* Too thin to hold it: the caption still says the area. */}
              {a > 0 && b > 0 && label.w + 6 <= room && label.h + 4 <= roomH ? (
                <Pill x={ax} y={ay} text={total} stroke={c.chartHighlight} />
              ) : null}
              {/* The whole width below and height left; the cut's width above, height right. */}
              <DimLine
                x1={x0}
                y1={base + 10}
                x2={right}
                y2={base + 10}
                side="below"
                label={rep.value(spec.left.width)}
                w={w}
              />
              <DimLine
                x1={x0 - 10}
                y1={top}
                x2={x0 - 10}
                y2={base}
                side="left"
                label={rep.value(spec.left.height)}
              />
              {cw > 0 ? (
                <DimLine
                  x1={cx}
                  y1={top - 10}
                  x2={right}
                  y2={top - 10}
                  side="above"
                  label={rep.value(cut.width)}
                  color={c.chartMuted}
                  w={w}
                />
              ) : null}
              {ch > 0 ? (
                <DimLine
                  x1={right + 10}
                  y1={top}
                  x2={right + 10}
                  y2={cutB}
                  side="right"
                  label={rep.value(cut.height)}
                  color={c.chartMuted}
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{`${spec.left.area ? rep.value(spec.left.area, false) : a * b} − ${cut.area ? rep.value(cut.area, false) : cw * ch} = ${rep.value(spec.total)}`}</Caption>
      <Steppers
        calc={calc}
        items={ids.map((id) => ({ var: id, steps: [1], pin: ids.filter((x) => x !== id) }))}
      />
    </View>
  );
}

function SideBySide({
  spec,
  right,
  calc,
}: {
  spec: Spec;
  right: NonNullable<Spec['right']>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const [lw, lh, rw, rh] = [spec.left.width, spec.left.height, right.width, right.height];
  const size = (id: string) => (rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0);
  const [a, b, cc, d] = [size(lw), size(lh), size(rw), size(rh)];
  const across = Math.max(spec.extent, a + cc);
  const tall = Math.max(spec.extent / 2, b, d);
  const padL = textW(rep.value(lh)) + 28;
  const padR = textW(rep.value(rh)) + 28;
  const layout = (w: number) => fit(w, across, tall, a + cc, padL, padR);

  return (
    <View>
      <Canvas aspect={(w) => (TOP + Math.max(b, d) * layout(w).unit + BOTTOM) / w}>
        {({ w, h }) => {
          const { unit, x0 } = layout(w);
          const base = TOP + Math.max(b, d) * unit;
          const x2 = x0 + a * unit;
          const x3 = x2 + cc * unit;
          const parts: ReactNode[] = [];
          const part = (x: number, cols: number, rows: number, fill: string, k: number) => {
            if (cols <= 0 || rows <= 0) return;
            const y = base - rows * unit;
            parts.push(
              <G key={k}>
                <Rect
                  x={x}
                  y={y}
                  width={cols * unit}
                  height={rows * unit}
                  fill={fill}
                  fillOpacity={k ? 0.3 : 0.15}
                />
                <Path
                  d={grid(x, y, cols, rows, unit)}
                  stroke={c.chartMuted}
                  strokeOpacity={0.35}
                  strokeWidth={1}
                />
              </G>,
            );
          };
          part(x0, a, b, c.chartHighlight, 0);
          part(x2, cc, d, c.chartSecond, 1);
          // The outline of the whole shape, and the dashed split where the parts meet.
          const outline =
            a > 0 && cc > 0
              ? `M ${x0} ${base} H ${x3} V ${base - d * unit} H ${x2} V ${base - b * unit} H ${x0} Z`
              : a > 0
                ? `M ${x0} ${base} H ${x2} V ${base - b * unit} H ${x0} Z`
                : `M ${x2} ${base} H ${x3} V ${base - d * unit} H ${x2} Z`;
          const chip = (x: number, cols: number, rows: number, text: string) => {
            const p = pillSize(text);
            if (cols <= 0 || rows <= 0) return null;
            const cx = x + (cols * unit) / 2;
            if (p.w + 6 <= cols * unit && p.h + 4 <= rows * unit)
              return <Pill x={cx} y={base - (rows * unit) / 2} text={text} />;
            // Too thin to hold it: the chip stands just above the part, on a short leader.
            const ty = base - rows * unit;
            return (
              <G>
                <Line x1={cx} y1={ty - 2} x2={cx} y2={ty - 8} stroke={c.chartInk} strokeWidth={1} />
                <Pill x={cx} y={ty - 8 - p.h / 2} text={text} w={w} />
              </G>
            );
          };
          return (
            <Svg width={w} height={h}>
              {parts}
              <Path
                d={outline}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                strokeLinejoin="round"
              />
              {a > 0 && cc > 0 ? (
                <Line
                  x1={x2}
                  y1={base}
                  x2={x2}
                  y2={base - Math.min(b, d) * unit}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  strokeDasharray={chart.dash}
                />
              ) : null}
              {chip(x0, a, b, rep.value(spec.left.area!))}
              {chip(x2, cc, d, rep.value(right.area))}
              {a > 0 ? (
                <DimLine
                  x1={x0}
                  y1={base + 10}
                  x2={x2}
                  y2={base + 10}
                  side="below"
                  label={rep.value(lw)}
                />
              ) : null}
              {cc > 0 ? (
                <DimLine
                  x1={x2}
                  y1={base + 10}
                  x2={x3}
                  y2={base + 10}
                  side="below"
                  label={rep.value(rw)}
                />
              ) : null}
              {b > 0 ? (
                <DimLine
                  x1={x0 - 10}
                  y1={base - b * unit}
                  x2={x0 - 10}
                  y2={base}
                  side="left"
                  label={rep.value(lh)}
                />
              ) : null}
              {d > 0 ? (
                <DimLine
                  x1={x3 + 10}
                  y1={base - d * unit}
                  x2={x3 + 10}
                  y2={base}
                  side="right"
                  label={rep.value(rh)}
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{`${rep.value(spec.left.area!, false)} + ${rep.value(right.area, false)} = ${rep.value(spec.total)}`}</Caption>
      <Steppers
        calc={calc}
        items={[lw, lh, rw, rh].map((id) => ({
          var: id,
          steps: [1],
          pin: [lw, lh, rw, rh].filter((x) => x !== id),
        }))}
      />
    </View>
  );
}

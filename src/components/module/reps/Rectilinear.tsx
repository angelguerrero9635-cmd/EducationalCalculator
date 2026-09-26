import { View } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'rectilinear' }>;

/**
 * A shape made of two rectangles standing side by side on the same base (an L or a step),
 * covered in unit squares. Each rectangle's area is written inside it.
 */
export function Rectilinear({ spec, calc }: { spec: Spec; calc: Calculator }) {
  if (spec.cut) return <CutOut spec={spec} cut={spec.cut} calc={calc} />;
  return <SideBySide spec={spec} right={spec.right!} calc={calc} />;
}

/**
 * A rectangle with a smaller rectangle cut out of its top right corner. The cut piece is
 * drawn dashed with its area in it; the shape left is shaded, with its area under it.
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
  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.9, (tall * ((w - 80) / across) + 70) / w)}>
        {({ w, h }) => {
          const left = 44;
          const unit = Math.min((w - left - 36) / across, (h - 60) / tall);
          const base = 16 + tall * unit;
          const top = base - b * unit;
          const cx = left + (a - cw) * unit;
          // The shape left: the big rectangle without its top right corner.
          const outline = `M ${left} ${base} H ${left + a * unit} V ${top + ch * unit} H ${cx} V ${top} H ${left} Z`;
          return (
            <Svg width={w} height={h}>
              {Array.from({ length: a * b }, (_, i) => {
                const col = i % a;
                const row = Math.floor(i / a);
                const inCut = col >= a - cw && row < ch;
                return (
                  <Rect
                    key={i}
                    x={left + col * unit}
                    y={top + row * unit}
                    width={unit}
                    height={unit}
                    fill={inCut ? 'none' : c.chartFill}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                );
              })}
              <Rect
                x={cx}
                y={top}
                width={cw * unit}
                height={ch * unit}
                fill="none"
                stroke={c.chartMuted}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
              />
              <Path d={outline} fill="none" stroke={c.chartInk} strokeWidth={chart.stroke} />
              {cw > 0 && ch > 0 ? (
                <ChartText
                  x={cx + (cw * unit) / 2}
                  y={top + (ch * unit) / 2 + 5}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.chartMuted}
                  textAnchor="middle"
                >
                  {`cut ${rep.value(cut.area, false)}`}
                </ChartText>
              ) : null}
              <ChartText
                x={left + (a * unit) / 2}
                y={base + 20}
                fontSize={chart.value}
                textAnchor="middle"
              >
                {rep.value(spec.left.width)}
              </ChartText>
              <ChartText
                x={left - 8}
                y={top + (b * unit) / 2 + 5}
                fontSize={chart.value}
                textAnchor="end"
              >
                {rep.value(spec.left.height)}
              </ChartText>
              <ChartText
                x={cx + (cw * unit) / 2}
                y={top - 6}
                fontSize={chart.small}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                {rep.value(cut.width)}
              </ChartText>
              <ChartText
                x={left + a * unit + 6}
                y={top + (ch * unit) / 2 + 5}
                fontSize={chart.small}
                fill={c.chartMuted}
              >
                {rep.value(cut.height)}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{`${rep.value(spec.left.area, false)} − ${rep.value(cut.area, false)} = ${rep.value(spec.total)}`}</Caption>
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

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.9, (tall * ((w - 80) / across) + 70) / w)}>
        {({ w, h }) => {
          const left = 44;
          const unit = Math.min((w - left - 36) / across, (h - 60) / tall);
          const base = 16 + tall * unit;
          const part = (x: number, cols: number, rows: number, fill: string, key: string) => [
            <Rect
              key={`${key}r`}
              x={x}
              y={base - rows * unit}
              width={cols * unit}
              height={rows * unit}
              fill={fill}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />,
            ...Array.from({ length: Math.max(0, cols - 1) }, (_, i) => (
              <Line
                key={`${key}x${i}`}
                x1={x + (i + 1) * unit}
                y1={base - rows * unit}
                x2={x + (i + 1) * unit}
                y2={base}
                stroke={c.chartGrid}
              />
            )),
            ...Array.from({ length: Math.max(0, rows - 1) }, (_, i) => (
              <Line
                key={`${key}y${i}`}
                x1={x}
                y1={base - (i + 1) * unit}
                x2={x + cols * unit}
                y2={base - (i + 1) * unit}
                stroke={c.chartGrid}
              />
            )),
          ];
          const x2 = left + a * unit;
          return (
            <Svg width={w} height={h}>
              {part(left, a, b, c.chartFill, 'l')}
              {part(x2, cc, d, c.chartSurface, 'r')}
              {a > 0 && b > 0 ? (
                <ChartText
                  x={left + (a * unit) / 2}
                  y={base - (b * unit) / 2 + 5}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.value(spec.left.area, false)}
                </ChartText>
              ) : null}
              {cc > 0 && d > 0 ? (
                <ChartText
                  x={x2 + (cc * unit) / 2}
                  y={base - (d * unit) / 2 + 5}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.value(right.area, false)}
                </ChartText>
              ) : null}
              <ChartText
                x={left + (a * unit) / 2}
                y={base + 20}
                fontSize={chart.value}
                textAnchor="middle"
              >
                {rep.value(lw)}
              </ChartText>
              <ChartText
                x={x2 + (cc * unit) / 2}
                y={base + 20}
                fontSize={chart.value}
                textAnchor="middle"
              >
                {rep.value(rw)}
              </ChartText>
              <ChartText
                x={left - 8}
                y={base - (b * unit) / 2 + 5}
                fontSize={chart.value}
                textAnchor="end"
              >
                {rep.value(lh)}
              </ChartText>
              <ChartText
                x={x2 + cc * unit + 8}
                y={base - (d * unit) / 2 + 5}
                fontSize={chart.value}
              >
                {rep.value(rh)}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{`${rep.value(spec.left.area, false)} + ${rep.value(right.area, false)} = ${rep.value(spec.total)}`}</Caption>
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

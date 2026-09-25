import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'areaModel' }>;

/**
 * The area model for multiplication: one factor broken into place-value parts along the top,
 * the other down the side, and each part product written in its box. Boxes are drawn wide
 * enough to read, not to scale (a textbook area model), with the bigger part bigger.
 */
export function AreaModel({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const val = (id: string) => (rep.known(id) ? Math.max(0, rep.shown(id)) : 0);
  const tops = spec.top.map(val);
  const sides = spec.side.map(val);
  const faded = ![...spec.top, ...spec.side].every(rep.known);
  // Widths: each part gets at least 30% so its label fits; the rest by size.
  const share = (xs: number[]) => {
    const sum = xs.reduce((a, b) => a + b, 0) || 1;
    const raw = xs.map((x) => Math.max(0.3, x / sum));
    const total = raw.reduce((a, b) => a + b, 0);
    return raw.map((x) => x / total);
  };
  const cols = share(tops);
  const rows = share(sides);
  const label = (i: number, j: number) => {
    const id = spec.parts[j]?.[i];
    return id ? `${rep.value(spec.top[i]!)} × ${rep.value(spec.side[j]!)} = ${rep.value(id)}` : '';
  };

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.75, (0.28 * spec.side.length + 0.14) * (390 / w))}>
        {({ w, h }) => {
          const left = 44;
          const top = 26;
          const width = w - left - 12;
          const height = h - top - 8;
          let x = left;
          const xs = cols.map((f) => {
            const at = x;
            x += f * width;
            return [at, f * width] as const;
          });
          let y = top;
          const ys = rows.map((f) => {
            const at = y;
            y += f * height;
            return [at, f * height] as const;
          });
          return (
            <Svg width={w} height={h} opacity={faded ? 0.4 : 1}>
              {xs.map(([cx, cw], i) => (
                <ChartText
                  key={`t${i}`}
                  x={cx + cw / 2}
                  y={top - 8}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.value(spec.top[i]!)}
                </ChartText>
              ))}
              {ys.map(([cy, ch], j) => (
                <ChartText
                  key={`s${j}`}
                  x={left - 8}
                  y={cy + ch / 2 + 5}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="end"
                >
                  {rep.value(spec.side[j]!)}
                </ChartText>
              ))}
              {ys.flatMap(([cy, ch], j) =>
                xs.map(([cx, cw], i) => (
                  <Rect
                    key={`r${i}${j}`}
                    x={cx}
                    y={cy}
                    width={cw}
                    height={ch}
                    fill={(i + j) % 2 === 0 ? c.chartFill : c.chartSurface}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                )),
              )}
              {ys.flatMap(([cy, ch], j) =>
                xs.map(([cx, cw], i) => (
                  <ChartText
                    key={`l${i}${j}`}
                    x={cx + cw / 2}
                    y={cy + ch / 2 + 5}
                    fontSize={cw > 120 ? chart.emphasis : chart.small}
                    textAnchor="middle"
                  >
                    {label(i, j)}
                  </ChartText>
                )),
              )}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {`${spec.parts.flatMap((row) => row.map((id) => rep.value(id))).join(' + ')} = ${rep.value(spec.total)}.`}
      </Caption>
      <Steppers
        calc={calc}
        items={[...spec.top, ...spec.side].map((id, _, all) => ({
          var: id,
          steps: [rep.variable(id).multipleOf ?? 1],
          pin: all.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}

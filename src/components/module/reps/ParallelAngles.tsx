import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'angles' }>;

const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Two parallel lines cut by a transversal, the eight angles numbered 1 to 4 at the top
 * crossing and 5 to 8 at the bottom one (1 above the line and right of the transversal, then
 * counterclockwise). Angles 1, 3, 5 and 7 are the first part; 2, 4, 6 and 8 its supplement.
 */
export function ParallelAngles({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [first, second] = spec.parts;
  const known = rep.known(first) || rep.known(second);
  const sym = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);
  // The transversal's slant as drawn: kept between 12° and 168° so the crossings fit.
  const typed = rep.known(first)
    ? rep.shown(first)
    : rep.known(second)
      ? 180 - rep.shown(second)
      : 60;
  const t = Math.min(168, Math.max(12, typed));

  return (
    <View>
      <Canvas aspect={0.66}>
        {({ w, h }) => {
          const y1 = h * 0.3;
          const y2 = h * 0.72;
          const cx = w / 2;
          // The two crossings, centered: the transversal goes up and right at `t` degrees.
          const run = (y2 - y1) / Math.tan(rad(t));
          const P = [
            [cx + run / 2, y1],
            [cx - run / 2, y2],
          ] as const;
          const reach = Math.min(h * 0.3, w * 0.4);
          const r = 22;
          const wedge = (x: number, y: number, from: number, to: number) => {
            const p = (d: number) => [x + r * Math.cos(rad(d)), y - r * Math.sin(rad(d))];
            const [xa, ya] = p(from);
            const [xb, yb] = p(to);
            return `M ${x} ${y} L ${xa} ${ya} A ${r} ${r} 0 0 0 ${xb} ${yb} Z`;
          };
          // At each crossing: angle 1 from the line's right ray to the transversal, then around.
          const spans = [
            [0, t],
            [t, 180],
            [180, 180 + t],
            [180 + t, 360],
          ] as const;
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              {P.map(([x, y], k) =>
                spans.map(([from, to], i) => (
                  <Path
                    key={`w${k}${i}`}
                    d={wedge(x, y, from, to)}
                    fill={i % 2 === 0 ? c.chartHighlight : c.chartFill}
                    opacity={i % 2 === 0 ? 0.3 : 1}
                  />
                )),
              )}
              {[y1, y2].map((y) => (
                <Line
                  key={y}
                  x1={8}
                  y1={y}
                  x2={w - 8}
                  y2={y}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeHeavy}
                />
              ))}
              <Line
                x1={P[0][0] + reach * Math.cos(rad(t))}
                y1={y1 - reach * Math.sin(rad(t))}
                x2={P[1][0] - reach * Math.cos(rad(t))}
                y2={y2 + reach * Math.sin(rad(t))}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {P.map(([x, y], k) => (
                <Circle key={`p${k}`} cx={x} cy={y} r={3} fill={c.chartInk} />
              ))}
              {/* The parallel marks: one arrowhead on each line. */}
              {[y1, y2].map((y) => (
                <Path
                  key={`m${y}`}
                  d={`M ${w - 40} ${y - 6} L ${w - 32} ${y} L ${w - 40} ${y + 6}`}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
              ))}
              {P.map(([x, y], k) =>
                spans.map(([from, to], i) => {
                  const d = (from + to) / 2;
                  const lr = r + 12;
                  return (
                    <ChartText
                      key={`n${k}${i}`}
                      x={x + lr * Math.cos(rad(d))}
                      y={y - lr * Math.sin(rad(d)) + 4}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fontWeight="700"
                    >
                      {String(k * 4 + i + 1)}
                    </ChartText>
                  );
                }),
              )}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `Angles 1, 3, 5 and 7: ${rep.label(first)}`,
          `Angles 2, 4, 6 and 8: ${rep.label(second)}`,
          `${sym(first)} + ${sym(second)} = 180°`,
          'Corresponding angles (1 and 5), alternate interior angles (3 and 5) and vertical angles (1 and 3) are equal.',
        ].join(' · ')}
      </Caption>
      <Steppers calc={calc} items={[{ var: first, steps: [1, 10], pin: [] }]} />
    </View>
  );
}

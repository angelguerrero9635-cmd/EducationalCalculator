import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'numberBond' }>;

/**
 * Number bond: the whole in the top circle, joined to its two parts. Dots inside each part
 * circle show the count. − / + change the parts (and the whole, when it can change).
 */
export function NumberBond({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [a, b] = spec.parts;
  const text = (x: string | number) =>
    typeof x === 'number' ? String(x) : rep.known(x) ? String(Math.round(rep.shown(x))) : '?';
  const count = (x: string) => (rep.known(x) ? Math.max(0, Math.round(rep.shown(x))) : 0);
  const wholeIsVar = typeof spec.whole === 'string';

  return (
    <View>
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const r = Math.min(w * 0.14, h * 0.2);
          const top = { x: w / 2, y: r + 8 };
          const left = { x: w * 0.27, y: h - r - 8 };
          const right = { x: w * 0.73, y: h - r - 8 };
          // Dots for a part, in rows of 5, inside its circle.
          const dots = (id: string, at: { x: number; y: number }, fill: string) => {
            const n = count(id);
            const d = Math.min(r / 5.5, 8);
            return Array.from({ length: n }, (_, i) => (
              <Circle
                key={`${id}${i}`}
                cx={at.x - 2 * d * 2 + (i % 5) * 2 * d}
                cy={at.y + r * 0.3 + Math.floor(i / 5) * 2 * d}
                r={d * 0.7}
                fill={fill}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
            ));
          };
          return (
            <Svg width={w} height={h}>
              <Line
                x1={top.x}
                y1={top.y}
                x2={left.x}
                y2={left.y}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Line
                x1={top.x}
                y1={top.y}
                x2={right.x}
                y2={right.y}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {[top, left, right].map((p, i) => (
                <Circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
              ))}
              <ChartText
                x={top.x}
                y={top.y + r * 0.2}
                fontSize={r * 0.6}
                fontWeight="700"
                textAnchor="middle"
              >
                {text(spec.whole)}
              </ChartText>
              <ChartText
                x={left.x}
                y={left.y - r * 0.12}
                fontSize={r * 0.5}
                fontWeight="700"
                textAnchor="middle"
              >
                {text(a)}
              </ChartText>
              <ChartText
                x={right.x}
                y={right.y - r * 0.12}
                fontSize={r * 0.5}
                fontWeight="700"
                textAnchor="middle"
              >
                {text(b)}
              </ChartText>
              {dots(a, left, c.chartHighlight)}
              {dots(b, right, c.chartFill)}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{`Whole: ${typeof spec.whole === 'number' ? spec.whole : rep.label(spec.whole)}   ·   Parts: ${rep.label(a)} and ${rep.label(b)}`}</Caption>
      <Steppers
        calc={calc}
        items={[
          { var: a, steps: [1], marker: '●', pin: wholeIsVar ? [spec.whole as string] : [] },
          { var: b, steps: [1], marker: '○', pin: wholeIsVar ? [spec.whole as string] : [] },
          ...(wholeIsVar ? [{ var: spec.whole as string, steps: [1], pin: [a] }] : []),
        ]}
      />
    </View>
  );
}

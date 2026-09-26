import { View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'factorPairs' }>;

/** The factor pairs of n, smaller factor first: 12 → [1, 12], [2, 6], [3, 4]. */
export function factorPairs(n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let a = 1; a * a <= n; a++) if (n % a === 0) out.push([a, n / a]);
  return out;
}

/**
 * Every rectangle that n unit squares make, one per factor pair, drawn to the same scale one
 * under another with its pair beside it. The pair typed in is outlined; a prime number makes
 * only the 1-row rectangle.
 */
export function FactorPairs({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const known = rep.known(spec.value);
  const n = Math.max(1, Math.round(rep.shown(spec.value)));
  const pairs = factorPairs(n);
  const pick = (id?: string) => (id && rep.known(id) ? Math.round(rep.shown(id)) : undefined);
  const [p, q] = [pick(spec.first), pick(spec.second)];
  const isPick = (a: number, b: number) =>
    p !== undefined && q !== undefined && ((p === a && q === b) || (p === b && q === a));
  const label = 64;
  const gap = 12;
  const cellFor = (w: number) => Math.max(2, Math.min(22, (w - label - 16) / n));
  const height = (w: number) => pairs.reduce((s, [a]) => s + a * cellFor(w) + gap, 0) + gap;

  const list = pairs.map(([a, b]) => `${a} × ${b}`).join(', ');
  return (
    <View>
      <Canvas aspect={(w) => Math.min(1.4, height(w) / w)}>
        {({ w, h }) => {
          const cell = cellFor(w);
          // A tall list shrinks to fit the canvas.
          const k = Math.min(1, h / height(w));
          let y = gap * k;
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.35}>
              {pairs.map(([a, b]) => {
                const top = y;
                const rw = b * cell;
                const rh = a * cell * k;
                y += rh + gap * k;
                const on = isPick(a, b);
                return (
                  <G key={a}>
                    <ChartText
                      x={label - 10}
                      y={top + Math.max(rh, 12) / 2 + 5}
                      fontSize={chart.value}
                      fontWeight={on ? '700' : '400'}
                      fill={on ? c.chartHighlight : c.chartInk}
                      textAnchor="end"
                    >
                      {`${a} × ${b}`}
                    </ChartText>
                    <Rect
                      x={label}
                      y={top}
                      width={rw}
                      height={Math.max(2, rh)}
                      fill={on ? c.chartHighlight : c.chartFill}
                      fillOpacity={on ? 0.35 : 1}
                      stroke={on ? c.chartHighlight : c.chartInk}
                      strokeWidth={on ? chart.strokeHeavy : chart.strokeLight}
                    />
                    {/* Unit squares, when they are big enough to see. */}
                    {cell * k >= 6
                      ? [
                          ...Array.from({ length: b - 1 }, (_, i) => (
                            <Line
                              key={`x${i}`}
                              x1={label + (i + 1) * cell}
                              y1={top}
                              x2={label + (i + 1) * cell}
                              y2={top + rh}
                              stroke={c.chartGrid}
                              strokeWidth={1}
                            />
                          )),
                          ...Array.from({ length: a - 1 }, (_, i) => (
                            <Line
                              key={`y${i}`}
                              x1={label}
                              y1={top + ((i + 1) * rh) / a}
                              x2={label + rw}
                              y2={top + ((i + 1) * rh) / a}
                              stroke={c.chartGrid}
                              strokeWidth={1}
                            />
                          )),
                        ]
                      : null}
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? n === 1
            ? '1 has one factor pair: 1 × 1. It is neither prime nor composite.'
            : pairs.length === 1
              ? `${n} has one factor pair: ${list}. It is prime.`
              : `${n} has ${pairs.length} factor pairs: ${list}. It is composite.`
          : 'Type a number to see its rectangles.'}
      </Caption>
      <Steppers calc={calc} items={[{ var: spec.value, steps: [1], pin: [] }]} />
    </View>
  );
}

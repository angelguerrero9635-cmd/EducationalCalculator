import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'venn' }>;

export const factorsOf = (n: number) =>
  n < 1 ? [] : Array.from({ length: n }, (_, i) => i + 1).filter((k) => n % k === 0);
/** Prime factors with repeats: 24 → [2, 2, 2, 3]. */
export function primesOf(n: number): number[] {
  const out: number[] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      out.push(p);
      m /= p;
    }
  }
  if (m > 1) out.push(m);
  return out;
}

/**
 * Two overlapping circles, one per number: its factors (or prime factors) placed inside, the
 * ones both share in the overlap. The greatest common factor is ringed; with prime factors
 * the overlap multiplies to the GCF and everything in both circles to the LCM.
 */
export function Venn({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const a = Math.max(1, Math.round(rep.shown(spec.first)));
  const b = Math.max(1, Math.round(rep.shown(spec.second)));
  const known = rep.known(spec.first) && rep.known(spec.second);
  let onlyA: number[];
  let onlyB: number[];
  let both: number[];
  if (spec.list === 'primes') {
    const pb = primesOf(b);
    both = [];
    onlyA = [];
    for (const p of primesOf(a)) {
      const i = pb.indexOf(p);
      if (i >= 0) {
        both.push(p);
        pb.splice(i, 1);
      } else onlyA.push(p);
    }
    onlyB = pb;
  } else {
    const fa = factorsOf(a);
    const fb = factorsOf(b);
    both = fa.filter((x) => fb.includes(x));
    onlyA = fa.filter((x) => !both.includes(x));
    onlyB = fb.filter((x) => !both.includes(x));
  }
  const gcf = spec.list === 'primes' ? both.reduce((x, y) => x * y, 1) : Math.max(...both);

  return (
    <View>
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const r = Math.min(w * 0.3, h * 0.44);
          const cy = h / 2 + 8;
          const cxA = w / 2 - r * 0.55;
          const cxB = w / 2 + r * 0.55;
          const place = (items: number[], cx: number, span: number) => {
            const cols = Math.max(1, Math.ceil(Math.sqrt(items.length)));
            const rows = Math.ceil(items.length / cols);
            return items.map((x, i) => ({
              x,
              px: cx + ((i % cols) - (cols - 1) / 2) * (span / Math.max(cols, 1)),
              py: cy + (Math.floor(i / cols) - (rows - 1) / 2) * 20,
            }));
          };
          const size = Math.max(...[...onlyA, ...onlyB, ...both].map((x) => String(x).length), 1);
          const fs = size >= 3 || onlyA.length + onlyB.length > 16 ? chart.tiny : chart.small;
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Circle
                cx={cxA}
                cy={cy}
                r={r}
                fill={c.chartHighlight}
                fillOpacity={0.08}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Circle
                cx={cxB}
                cy={cy}
                r={r}
                fill={c.chartHighlight}
                fillOpacity={0.08}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <ChartText
                x={cxA - r * 0.5}
                y={cy - r - 6}
                fontSize={chart.label}
                fontWeight="700"
                fill={c.chartInk}
                textAnchor="middle"
              >
                {String(a)}
              </ChartText>
              <ChartText
                x={cxB + r * 0.5}
                y={cy - r - 6}
                fontSize={chart.label}
                fontWeight="700"
                fill={c.chartInk}
                textAnchor="middle"
              >
                {String(b)}
              </ChartText>
              {[
                ...place(onlyA, cxA - r * 0.45, r * 0.8),
                ...place(onlyB, cxB + r * 0.45, r * 0.8),
                ...place(both, w / 2, r * 0.5),
              ].map((d, i) => {
                const ringed = spec.list === 'factors' && d.x === gcf && both.includes(d.x);
                return (
                  <G key={i}>
                    {ringed ? (
                      <Circle
                        cx={d.px}
                        cy={d.py - 4}
                        r={11}
                        fill="none"
                        stroke={c.chartHighlight}
                        strokeWidth={chart.stroke}
                      />
                    ) : null}
                    <ChartText
                      x={d.px}
                      y={d.py}
                      fontSize={fs}
                      fontWeight={both.includes(d.x) ? '700' : '400'}
                      fill={both.includes(d.x) ? c.chartHighlight : c.chartInk}
                      textAnchor="middle"
                    >
                      {String(d.x)}
                    </ChartText>
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {!known
          ? 'Type two numbers.'
          : spec.list === 'primes'
            ? `Shared primes: ${both.length ? both.join(' × ') : 'none'}, so the GCF is ${gcf}. The LCM multiplies everything in both circles once: ${[...onlyA, ...both, ...onlyB].join(' × ') || '1'}.`
            : `Common factors of ${a} and ${b}: ${both.join(', ')}. The greatest is ${gcf}.`}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.first, steps: [1], pin: [spec.second] },
          { var: spec.second, steps: [1], pin: [spec.first] },
        ]}
      />
    </View>
  );
}

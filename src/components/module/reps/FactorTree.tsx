import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { isPrime, primeFactors } from '@/data/modules/helpers';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'factorTree' }>;

interface Node {
  n: number;
  kids: Node[];
}

/** The tree: each composite splits into its smallest prime factor and the rest. */
export function factorTree(n: number): Node {
  if (n < 4 || isPrime(n)) return { n, kids: [] };
  let p = 2;
  while (n % p !== 0) p++;
  return { n, kids: [factorTree(p), factorTree(n / p)] };
}

const depthOf = (t: Node): number => 1 + Math.max(0, ...t.kids.map(depthOf));
const leavesOf = (t: Node): number =>
  t.kids.length ? t.kids.reduce((s, k) => s + leavesOf(k), 0) : 1;

/**
 * A factor tree: the number at the top splits into two factors, and each composite factor
 * splits again, until every branch ends in a prime (circled).
 */
export function FactorTree({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const known = rep.known(spec.value);
  const n = Math.max(1, Math.round(rep.shown(spec.value)));
  const tree = factorTree(n);
  const depth = depthOf(tree);
  const primes = primeFactors(n);

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.9, (depth * 52 + 24) / w)}>
        {({ w, h }) => {
          const rowH = (h - 24) / Math.max(1, depth - 1 || 1);
          const nodes: React.ReactNode[] = [];
          // Each subtree gets a horizontal span in proportion to its leaves.
          const place = (t: Node, x0: number, x1: number, level: number, key: string) => {
            const x = (x0 + x1) / 2;
            const y = 18 + level * (depth > 1 ? rowH : 0);
            const leaf = t.kids.length === 0;
            let at = x0;
            t.kids.forEach((k, i) => {
              const span = ((x1 - x0) * leavesOf(k)) / leavesOf(t);
              const kx = at + span / 2;
              const ky = y + rowH;
              nodes.push(
                <Line
                  key={`${key}l${i}`}
                  x1={x}
                  y1={y + 8}
                  x2={kx}
                  y2={ky - 12}
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                />,
              );
              place(k, at, at + span, level + 1, `${key}${i}`);
              at += span;
            });
            nodes.push(
              leaf && isPrime(t.n) ? (
                <Circle
                  key={`${key}c`}
                  cx={x}
                  cy={y - 1}
                  r={13}
                  fill={c.chartFill}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                />
              ) : null,
              <ChartText
                key={`${key}t`}
                x={x}
                y={y + 4}
                fontSize={chart.emphasis}
                fontWeight="700"
                textAnchor="middle"
              >
                {String(t.n)}
              </ChartText>,
            );
          };
          place(tree, 16, w - 16, 0, 'r');
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              {nodes}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? n < 2
            ? `${n} is neither prime nor composite.`
            : isPrime(n)
              ? `${n} is prime: its only factors are 1 and ${n}.`
              : `${n} = ${primes.join(' × ')}: ${primes.length} prime factors.${spec.count ? ` ${rep.named(spec.count)}.` : ''}`
          : 'Type a number to grow its tree.'}
      </Caption>
      <Steppers calc={calc} items={[{ var: spec.value, steps: [1, 10], pin: [] }]} />
    </View>
  );
}

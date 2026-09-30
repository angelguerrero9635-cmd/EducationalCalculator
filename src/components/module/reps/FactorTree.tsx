import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { isPrime, primeFactors } from '@/data/modules/helpers';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';
import { RootMarks } from './FactorTreeHsf';
import { radical, rootSplit, rootText } from './rootSplit';

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

/** Prime factors with exponents: [2, 2, 2, 3] → "2³ × 3". */
export function powers(primes: number[]): string {
  const sup = (k: number) => [...String(k)].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('');
  const counts = new Map<number, number>();
  for (const p of primes) counts.set(p, (counts.get(p) ?? 0) + 1);
  return [...counts].map(([p, k]) => (k > 1 ? `${p}${sup(k)}` : String(p))).join(' × ');
}

const depthOf = (t: Node): number => 1 + Math.max(0, ...t.kids.map(depthOf));

/** Node sizes: primes are circles, composites rounded boxes sized to their digits. */
const R = 14;
const BOX_H = 28;
const boxW = (n: number) => String(n).length * 9 + 20;
const ROW = 52;
const TOP = 10;

/**
 * Factor trees, flat: each composite (a rounded box) splits into its smallest prime (a filled
 * circle) and the rest, down a staircase, until every branch ends in a prime. With a second
 * number the two trees stand in two columns; the primes they share are ringed in matched
 * pairs (one colour per shared prime), and each tree's primes are listed in order at its foot.
 */
export function FactorTree({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const known = rep.known(spec.value) && (!spec.second || rep.known(spec.second));
  const n = Math.max(1, Math.round(rep.shown(spec.value)));
  const m = spec.second ? Math.max(1, Math.round(rep.shown(spec.second))) : undefined;
  const numbers = [n, ...(m === undefined ? [] : [m])];
  const trees = numbers.map(factorTree);
  const depth = Math.max(...trees.map(depthOf));
  const primes = primeFactors(n);
  const lists = numbers.map((k) => (k < 2 ? [] : primeFactors(k)));
  // Two numbers: the primes they share (with repeats) make the GCF.
  const shared: number[] = [];
  if (m !== undefined) {
    const rest = [...lists[1]!];
    for (const p of primes) {
      const i = rest.indexOf(p);
      if (i >= 0) {
        shared.push(p);
        rest.splice(i, 1);
      }
    }
  }
  // One ring colour per shared prime: highlight, then the second colour, then ink.
  const ringColors = [c.chartHighlight, c.chartSecond, c.chartInk];
  const distinct = [...new Set(shared)];
  const ringOf = (p: number) => ringColors[Math.min(2, distinct.indexOf(p))]!;
  const sharedCount = (p: number) => shared.filter((q) => q === p).length;

  const footY = TOP + (depth - 1) * ROW + BOX_H + 30;
  // Grades 9–12: simplifying a root (FactorTreeHsf.tsx) adds a line under the foot.
  const index = spec.root?.index ?? 2;
  const split = spec.root && n >= 2 ? rootSplit(primes, index) : undefined;
  const height = footY + R + 12 + (split && primes.length > 1 ? 60 : 0);

  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w, h }) => {
          const cols = trees.length;
          const pad = 12;
          const colW = (w - 2 * pad) / cols;
          const out: ReactNode[] = [];
          trees.forEach((tree, ti) => {
            const d = depthOf(tree);
            const cx = pad + colW * (ti + 0.5);
            // A staircase: each split puts the prime one step left, the rest one step right.
            const dx = d > 1 ? Math.min(46, (colW - 12) / d) : 0;
            const rootX = cx - ((d - 2) * dx) / 2;
            const seen = new Map<number, number>();
            const ringed = (p: number) => {
              const k = (seen.get(p) ?? 0) + 1;
              seen.set(p, k);
              return m !== undefined && k <= sharedCount(p);
            };
            const node = (t: Node, x: number, level: number, key: string) => {
              const y = TOP + BOX_H / 2 + level * ROW;
              const [left, right] = t.kids;
              if (left && right) {
                // The prime is placed first so rings go to the top-most copies.
                [
                  [left, x - dx],
                  [right, x + dx],
                ].forEach(([k, kx], i) => {
                  const ky = y + ROW;
                  const ux = ((kx as number) - x) / Math.hypot((kx as number) - x, ROW);
                  const uy = ROW / Math.hypot((kx as number) - x, ROW);
                  // From the box's bottom edge to the child's edge.
                  const from = Math.min(BOX_H / 2 / uy, ux ? boxW(t.n) / 2 / Math.abs(ux) : 99);
                  const kid = k as Node;
                  const to = kid.kids.length
                    ? Math.min(BOX_H / 2 / uy, ux ? boxW(kid.n) / 2 / Math.abs(ux) : 99)
                    : R + 1;
                  out.push(
                    <Line
                      key={`${key}l${i}`}
                      x1={x + ux * (from + 1)}
                      y1={y + uy * (from + 1)}
                      x2={(kx as number) - ux * to}
                      y2={ky - uy * to}
                      stroke={c.chartMuted}
                      strokeWidth={chart.stroke}
                      strokeLinecap="round"
                    />,
                  );
                });
                node(left, x - dx, level + 1, `${key}a`);
                node(right, x + dx, level + 1, `${key}b`);
              }
              if (t.kids.length === 0 && isPrime(t.n)) {
                out.push(
                  <PrimeDot
                    key={`${key}p`}
                    x={x}
                    y={y}
                    p={t.n}
                    r={R}
                    ring={ringed(t.n) ? ringOf(t.n) : undefined}
                  />,
                );
              } else {
                const bw = boxW(t.n);
                out.push(
                  <G key={`${key}b`}>
                    <Rect
                      x={x - bw / 2}
                      y={y - BOX_H / 2}
                      width={bw}
                      height={BOX_H}
                      rx={8}
                      fill={c.chartSurface}
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                    />
                    <ChartText
                      x={x}
                      y={y + 5}
                      fontSize={chart.emphasis}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {String(t.n)}
                    </ChartText>
                  </G>,
                );
              }
            };
            node(tree, d > 1 ? rootX : cx, 0, `t${ti}`);

            // The primes in order at the tree's foot, ringed like the tree's.
            const list = lists[ti]!;
            if (list.length > 1) {
              const size = 2 * 12;
              const withTimes = list.length * size + (list.length - 1) * 18 <= colW - 8;
              // Without the × signs, rings get room of their own (smaller circles if need be).
              const r = withTimes ? 12 : Math.min(12, (colW - 8) / list.length / 2 - 4);
              const step = withTimes ? size + 18 : 2 * r + 7;
              const x0 = cx - ((list.length - 1) * step) / 2;
              if (split && ti === 0)
                out.push(
                  <RootMarks
                    key="root"
                    split={split}
                    xs={list.map((_, i) => x0 + i * step)}
                    y={footY}
                    r={r}
                    cx={cx}
                    index={index}
                  />,
                );
              const footSeen = new Map<number, number>();
              list.forEach((p, i) => {
                const k = (footSeen.get(p) ?? 0) + 1;
                footSeen.set(p, k);
                const x = x0 + i * step;
                out.push(
                  <PrimeDot
                    key={`f${ti}-${i}`}
                    x={x}
                    y={footY}
                    p={p}
                    r={r}
                    ring={m !== undefined && k <= sharedCount(p) ? ringOf(p) : undefined}
                  />,
                );
                if (withTimes && i > 0)
                  out.push(
                    <ChartText
                      key={`x${ti}-${i}`}
                      x={x - step / 2}
                      y={footY + 5}
                      fontSize={chart.emphasis}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      ×
                    </ChartText>,
                  );
              });
            }
          });
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              {trees.length > 1 ? (
                <Line
                  x1={w / 2}
                  y1={4}
                  x2={w / 2}
                  y2={h - 4}
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
              ) : null}
              {trees.length > 1 ? (
                <Line
                  x1={pad}
                  y1={footY - 22}
                  x2={w - pad}
                  y2={footY - 22}
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
              ) : null}
              {out}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known && split
          ? `${radical(index)}${n} = ${radical(index)}(${primes.join(' × ')}). ${
              split.out.length
                ? `Each ${index === 3 ? 'three' : 'pair'} of equal factors comes out as one: ${split.out.join(' × ')}${split.out.length > 1 ? ` = ${split.outside}` : ''}. ${radical(index)}${n} = ${rootText(split.outside, split.inside, index)}.`
                : `No ${index === 3 ? 'three' : 'two'} factors are equal: ${radical(index)}${n} is already simplest.`
            }`
          : known && m !== undefined
            ? `${n} = ${powers(primes)}. ${m} = ${powers(primeFactors(m))}. Shared primes (ringed): ${shared.length ? `${shared.join(' × ')} = ${shared.reduce((a, b) => a * b, 1)}` : 'none (the GCF is 1)'}.`
            : known
              ? n < 2
                ? `${n} is neither prime nor composite.`
                : isPrime(n)
                  ? `${n} is prime: its only factors are 1 and ${n}.`
                  : `${n} = ${primes.join(' × ')}: ${primes.length} prime factors.${spec.count ? ` ${rep.named(spec.count)}.` : ''}`
              : 'Type a number to grow its tree.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.value, steps: [1, 10], pin: spec.second ? [spec.second] : [] },
          ...(spec.second ? [{ var: spec.second, steps: [1, 10], pin: [spec.value] }] : []),
        ]}
      />
    </View>
  );
}

/** A prime: a filled circle with its number, ringed in its pair's colour when shared. */
function PrimeDot({
  x,
  y,
  p,
  r,
  ring,
}: {
  x: number;
  y: number;
  p: number;
  r: number;
  ring?: string;
}) {
  const c = usePalette();
  return (
    <G>
      {ring ? <Circle cx={x} cy={y} r={r + 2.5} fill="none" stroke={ring} strokeWidth={3} /> : null}
      <Circle
        cx={x}
        cy={y}
        r={r}
        fill={c.chartFill}
        stroke={ring ? 'none' : c.chartMuted}
        strokeWidth={1}
      />
      <ChartText
        x={x}
        y={y + (r > 12 ? 5 : 4.5)}
        fontSize={r > 12 ? chart.emphasis : chart.value}
        fontWeight="700"
        textAnchor="middle"
      >
        {String(p)}
      </ChartText>
    </G>
  );
}

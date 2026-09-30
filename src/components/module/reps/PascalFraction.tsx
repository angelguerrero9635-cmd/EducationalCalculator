/**
 * H97: a probability as a fraction of two counts under Pascal's triangle: the favourable count
 * C(a, r) (lit in the second colour in the triangle) over all the groups C(n, r) (the lit
 * entry), then the fraction in lowest terms and its decimal. Flat.
 */
import { G, Line } from 'react-native-svg';

import type { PascalTriangleSpec } from '@/data/modules/typesHsb';
import { formatNumber } from '@/engine/format';
import { chart } from '@/theme';

import { probText } from './ChanceTree';
import { ChartText } from './common';
import { choose } from './statMath';

/** The height the fraction takes under the triangle. */
export const FRACTION_H = 78;

export interface FractionModel {
  n: number;
  k: number;
  top: number;
  bottom: number;
  /** The main entry C(n, k). */
  N: number;
  K: number;
  caption: string;
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const fmt = (x: number) => formatNumber(x);

/** The two counts, or nothing when the spec has no fraction or they can't be read. */
export function fractionOf(
  spec: PascalTriangleSpec,
  get: (v: number | string | undefined) => number | undefined,
  N: number,
  K: number | undefined,
): FractionModel | undefined {
  if (!spec.fraction || K === undefined) return undefined;
  const n = Math.round(get(spec.fraction.n) ?? 0);
  const k = Math.round(get(spec.fraction.k) ?? 0);
  const top = k >= 0 && k <= n ? choose(n, k) : 0;
  const bottom = K >= 0 && K <= N ? choose(N, K) : 0;
  const g = gcd(top, bottom) || 1;
  const lowest = top && g > 1 ? ` = ${fmt(top / g)}/${fmt(bottom / g)}` : '';
  const caption = bottom
    ? `P = C(${n}, ${k}) ÷ C(${N}, ${K}) = ${fmt(top)}/${fmt(bottom)}${lowest} ≈ ${fmt(Number((top / bottom).toFixed(3)))}: the groups that count over all the groups`
    : `C(${N}, ${K}) has no groups to choose from.`;
  return { n, k, top, bottom, N, K, caption };
}

export function FractionRow({
  frac,
  x,
  y,
  ink,
  lit,
  second,
  muted,
}: {
  frac: FractionModel;
  x: number;
  y: number;
  ink: string;
  lit: string;
  second: string;
  muted: string;
}) {
  const { n, k, top, bottom, N, K } = frac;
  const g = gcd(top, bottom) || 1;
  const right = bottom
    ? `= ${g > 1 && top ? `${fmt(top / g)}/${fmt(bottom / g)}` : probText(top / bottom)}${
        top / bottom !== Number((top / bottom).toFixed(3))
          ? ` ≈ ${fmt(Number((top / bottom).toFixed(3)))}`
          : ''
      }`
    : '';
  const barW = 132;
  const left = x - 110;
  const size = chart.emphasis;
  return (
    <G>
      <ChartText
        x={left + barW / 2}
        y={y + 24}
        textAnchor="middle"
        fontSize={size}
        fontWeight="700"
        fill={second}
      >
        {`C(${n}, ${k}) = ${fmt(top)}`}
      </ChartText>
      <Line
        x1={left}
        y1={y + 32}
        x2={left + barW}
        y2={y + 32}
        stroke={ink}
        strokeWidth={chart.stroke}
      />
      <ChartText
        x={left + barW / 2}
        y={y + 52}
        textAnchor="middle"
        fontSize={size}
        fontWeight="700"
        fill={lit}
      >
        {`C(${N}, ${K}) = ${fmt(bottom)}`}
      </ChartText>
      <ChartText x={left + barW + 10} y={y + 37} fontSize={size} fontWeight="700" fill={ink}>
        {right}
      </ChartText>
      <ChartText x={x} y={y + 72} textAnchor="middle" fill={muted}>
        groups that count ÷ all groups
      </ChartText>
    </G>
  );
}

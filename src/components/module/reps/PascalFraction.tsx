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
import { favourable } from './pascal';
import { choose } from './statMath';

/** The height the fraction takes under the triangle. */
export const FRACTION_H = 78;

/**
 * H113: long counts ("C(30, 5) × C(30, 5) = 20,307,960,036") leave no room beside the bar, so
 * the result goes on its own line under the fraction, 20 px lower.
 */
const longCounts = (f: FractionModel) =>
  f.b !== undefined && Math.max(String(f.top).length, String(f.bottom).length) > 6;
export const fractionHeight = (f: FractionModel) => FRACTION_H + (longCounts(f) ? 20 : 0);

export interface FractionModel {
  n: number;
  k: number;
  /** H113: the second group and the number chosen in all, for "exactly k of r". */
  b?: number;
  r?: number;
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
  const two = spec.fraction.b !== undefined && spec.fraction.r !== undefined;
  const b = two ? Math.round(get(spec.fraction.b) ?? 0) : undefined;
  const r = two ? Math.round(get(spec.fraction.r) ?? 0) : undefined;
  const top = favourable(n, k, b, r);
  const bottom = K >= 0 && K <= N ? choose(N, K) : 0;
  const g = gcd(top, bottom) || 1;
  const lowest = top && g > 1 ? ` = ${fmt(top / g)}/${fmt(bottom / g)}` : '';
  const counted = topText(n, k, b, r);
  const caption = bottom
    ? `P = ${counted} ÷ C(${N}, ${K}) = ${fmt(top)}/${fmt(bottom)}${lowest} ≈ ${fmt(Number((top / bottom).toFixed(3)))}: the groups that count over all the groups`
    : `C(${N}, ${K}) has no groups to choose from.`;
  return { n, k, b, r, top, bottom, N, K, caption };
}

const topText = (n: number, k: number, b?: number, r?: number) =>
  b === undefined || r === undefined ? `C(${n}, ${k})` : `C(${n}, ${k}) × C(${b}, ${r - k})`;

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
  const { n, k, b, r, top, bottom, N, K } = frac;
  const g = gcd(top, bottom) || 1;
  const right = bottom
    ? `= ${g > 1 && top ? `${fmt(top / g)}/${fmt(bottom / g)}` : probText(top / bottom)}${
        top / bottom !== Number((top / bottom).toFixed(3))
          ? ` ≈ ${fmt(Number((top / bottom).toFixed(3)))}`
          : ''
      }`
    : '';
  // "Exactly k of r" has two counts on top: a wider bar; long counts put the result below it.
  const below = longCounts(frac);
  const barW = b === undefined ? 132 : below ? 260 : 196;
  const left = x - (b === undefined ? 110 : below ? barW / 2 : 150);
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
        {`${topText(n, k, b, r)} = ${fmt(top)}`}
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
      <ChartText
        x={below ? x : left + barW + 10}
        y={below ? y + 74 : y + 37}
        textAnchor={below ? 'middle' : 'start'}
        fontSize={size}
        fontWeight="700"
        fill={ink}
      >
        {right}
      </ChartText>
      <ChartText x={x} y={y + (below ? 92 : 72)} textAnchor="middle" fill={muted}>
        groups that count ÷ all groups
      </ChartText>
    </G>
  );
}

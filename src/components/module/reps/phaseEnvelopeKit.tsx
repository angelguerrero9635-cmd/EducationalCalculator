/**
 * Shared parts of the college phase diagrams (HC8): reading a spec's values ("?" draws nothing),
 * the plot frame with its ticks, and a key entry.
 */
import { G, Line } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { ChartText, niceCeil, useRep } from './common';

type Pt = [number, number];

/** A number to `n` significant figures, a true minus. */
export const sig = (x: number, n = 3) => formatNumber(Number(x.toPrecision(n)));

export const poly = (ps: Pt[]) =>
  ps.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

/** A value of the spec: fixed, typed or worked out (`known`), or "?" (nothing drawn). */
export function useReadSpec(calc: Calculator) {
  const rep = useRep(calc);
  const read = (v: number | string | undefined, n = 4) => {
    if (v === undefined) return { known: false, value: NaN, text: '?' };
    if (typeof v === 'number') return { known: true, value: v, text: sig(v, n) };
    const known = rep.known(v);
    return { known, value: known ? rep.shown(v) : NaN, text: known ? rep.value(v, false) : '?' };
  };
  return { rep, read };
}

/** Ticks every nice step across [lo, hi]. */
export function ticks(lo: number, hi: number, count = 5) {
  const step = niceCeil((hi - lo) / count);
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + step * 1e-6; v += step)
    out.push(Number(v.toPrecision(10)));
  return { step, out };
}

/** The plot's frame: axes, ticks and the axis names. */
export function Frame({
  c,
  l,
  r,
  t,
  b,
  xs,
  ys,
  sx,
  sy,
  xName,
  yName,
}: {
  c: Palette;
  l: number;
  r: number;
  t: number;
  b: number;
  xs: number[];
  ys: number[];
  sx: (x: number) => number;
  sy: (y: number) => number;
  xName: string;
  yName: string;
}) {
  return (
    <G>
      {ys.map((y) => (
        <G key={`y${y}`}>
          <Line x1={l} y1={sy(y)} x2={r} y2={sy(y)} stroke={c.chartGrid} strokeWidth={0.8} />
          <ChartText
            x={l - 4}
            y={sy(y) + 4}
            textAnchor="end"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {formatNumber(y)}
          </ChartText>
        </G>
      ))}
      {xs.map((x) => (
        <G key={`x${x}`}>
          <Line x1={sx(x)} y1={b} x2={sx(x)} y2={b + 4} stroke={c.chartInk} strokeWidth={1} />
          <ChartText
            x={sx(x)}
            y={b + 16}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {formatNumber(x)}
          </ChartText>
        </G>
      ))}
      <Line x1={l} y1={t} x2={l} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
      <Line x1={l} y1={b} x2={r} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
      <ChartText x={(l + r) / 2} y={b + 32} textAnchor="middle" fontSize={chart.label}>
        {xName}
      </ChartText>
      <ChartText x={4} y={t - 8} fontSize={chart.label}>
        {yName}
      </ChartText>
    </G>
  );
}

/** One key entry: a short line (solid or dashed) and its name. */
export function KeyItem({
  x,
  y,
  color,
  dash,
  text,
}: {
  x: number;
  y: number;
  color: string;
  dash?: string;
  text: string;
}) {
  return (
    <G>
      <Line
        x1={x}
        y1={y - 4}
        x2={x + 20}
        y2={y - 4}
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray={dash}
      />
      <ChartText x={x + 25} y={y} fontSize={chart.label}>
        {text}
      </ChartText>
    </G>
  );
}

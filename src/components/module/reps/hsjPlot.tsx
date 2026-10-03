/**
 * A flat graph frame for the group J chemistry charts (energy profile, equilibrium, titration,
 * decay): a window with nice ticks (1, 2 or 5 × 10ⁿ), grid lines, both axes with their numbers
 * at 12 px, and the axis names. Abstract diagrams stay flat.
 */
import { G, Line } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { ChartText } from './common';
import { niceStep } from './hsdGrid';

export interface Axis {
  lo: number;
  hi: number;
  step: number;
}

/** An axis from lo to hi (widened to whole ticks), with about `ticks` ticks. */
export function axisOf(lo: number, hi: number, ticks = 5): Axis {
  if (!(hi > lo)) hi = lo + 1;
  const step = niceStep((hi - lo) / ticks);
  return {
    lo: Math.floor(lo / step + 1e-9) * step,
    hi: Math.ceil(hi / step - 1e-9) * step,
    step,
  };
}

export const ticksOf = (a: Axis) =>
  Array.from({ length: Math.round((a.hi - a.lo) / a.step) + 1 }, (_, i) =>
    Number((a.lo + i * a.step).toFixed(9)),
  );

/**
 * A left margin wide enough for the y-axis numbers ("−100,000") beside the turned axis name,
 * and at least `least`.
 */
export function leftFor(y: Axis, least = 50, text: (v: number) => string = formatNumber): number {
  const widest = Math.max(...ticksOf(y).map((v) => text(v).length));
  return Math.max(least, Math.ceil(22 + widest * chart.label * 0.6 + 5));
}

export interface Plot {
  sx: (x: number) => number;
  sy: (y: number) => number;
  x: Axis;
  y: Axis;
  L: number;
  R: number;
  T: number;
  B: number;
  w: number;
  h: number;
}

export function makePlot(
  w: number,
  h: number,
  x: Axis,
  y: Axis,
  pad: { L?: number; R?: number; T?: number; B?: number } = {},
): Plot {
  const [L, R, T, B] = [pad.L ?? 50, pad.R ?? 14, pad.T ?? 14, pad.B ?? 42];
  return {
    sx: (v) => L + ((v - x.lo) / (x.hi - x.lo)) * (w - L - R),
    sy: (v) => T + ((y.hi - v) / (y.hi - y.lo)) * (h - T - B),
    x,
    y,
    L,
    R,
    T,
    B,
    w,
    h,
  };
}

/**
 * Grid, axes, numbers and names. `xNumbers: false` leaves the x-axis unnumbered. The lowest
 * y number sits just above its line, so it never meets the first x number at the corner.
 */
export function PlotFrame({
  p,
  xName,
  yName,
  xNumbers = true,
  xText = formatNumber,
  yText = formatNumber,
}: {
  p: Plot;
  xName: string;
  yName: string;
  xNumbers?: boolean;
  xText?: (v: number) => string;
  yText?: (v: number) => string;
}) {
  const c = usePalette();
  const xs = ticksOf(p.x);
  const ys = ticksOf(p.y);
  const widest = Math.max(...xs.map((v) => xText(v).length));
  const every = p.sx(p.x.lo + p.x.step) - p.sx(p.x.lo) < widest * 7.5 + 6 ? 2 : 1;
  const bottom = p.h - p.B;
  return (
    <G>
      {xs.map((v) => (
        <Line
          key={`gx${v}`}
          x1={p.sx(v)}
          y1={p.T}
          x2={p.sx(v)}
          y2={bottom}
          stroke={c.chartGrid}
          strokeWidth={1}
        />
      ))}
      {ys.map((v) => (
        <G key={`gy${v}`}>
          <Line
            x1={p.L}
            y1={p.sy(v)}
            x2={p.w - p.R}
            y2={p.sy(v)}
            stroke={c.chartGrid}
            strokeWidth={1}
          />
          <ChartText
            x={p.L - 5}
            y={p.sy(v) + (xNumbers && v === p.y.lo ? -1 : 4)}
            textAnchor="end"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {yText(v)}
          </ChartText>
        </G>
      ))}
      {xNumbers
        ? xs
            .filter((_, i) => i % every === 0)
            .map((v) => (
              <ChartText
                key={`nx${v}`}
                x={p.sx(v)}
                y={bottom + 15}
                textAnchor="middle"
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                {xText(v)}
              </ChartText>
            ))
        : null}
      <Line
        x1={p.L}
        y1={p.sy(Math.max(p.y.lo, Math.min(p.y.hi, 0)))}
        x2={p.w - p.R}
        y2={p.sy(Math.max(p.y.lo, Math.min(p.y.hi, 0)))}
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      <Line x1={p.L} y1={p.T} x2={p.L} y2={bottom} stroke={c.chartInk} strokeWidth={1.5} />
      <ChartText x={(p.L + p.w - p.R) / 2} y={p.h - 6} textAnchor="middle" fontSize={chart.label}>
        {xName}
      </ChartText>
      <ChartText
        x={12}
        y={(p.T + bottom) / 2}
        textAnchor="middle"
        fontSize={chart.label}
        transform={`rotate(-90 12 ${(p.T + bottom) / 2})`}
      >
        {yName}
      </ChartText>
    </G>
  );
}

/** Label baselines moved apart to at least `gap`, each as near its own place as it can be. */
export function spread(ys: number[], gap: number): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < order.length; k++) order[k]!.y = Math.max(order[k]!.y, order[k - 1]!.y + gap);
  const out: number[] = [];
  for (const o of order) out[o.i] = o.y;
  return out;
}

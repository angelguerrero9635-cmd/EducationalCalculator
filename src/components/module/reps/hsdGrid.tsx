/**
 * A coordinate grid for the Grades 9–12 group D pictures (vectors, the complex plane, conics):
 * a window chosen from the values with nice ticks (1, 2 or 5 × 10ⁿ), the origin in view, grid
 * lines, both axes and their numbers at 12 px, and axis names in italics. Flat.
 */
import { G, Line } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Frame } from './graphKit';
import { MathText } from './hsdText';

/** The smallest 1, 2 or 5 × 10ⁿ at least `x`. */
export function niceStep(x: number): number {
  if (!(x > 0)) return 1;
  const pow = 10 ** Math.floor(Math.log10(x));
  const n = x / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/**
 * A window [lo, hi] on one axis holding every value and the origin, widened by a margin and
 * rounded out to whole ticks; `ticks` is about how many ticks it should hold.
 */
export function niceWindow(values: number[], ticks = 8, pad = 0.12, least = 1) {
  const xs = values.filter(Number.isFinite);
  let lo = Math.min(0, ...xs);
  let hi = Math.max(0, ...xs);
  if (hi - lo < least) {
    hi = Math.max(hi, least / 2);
    lo = Math.min(lo, -least / 2);
  }
  const span = hi - lo;
  lo -= span * pad;
  hi += span * pad;
  const step = niceStep((hi - lo) / ticks);
  return { lo: Math.floor(lo / step) * step, hi: Math.ceil(hi / step) * step, step };
}

/** A window symmetric about 0 (both axes of a square grid), holding every value. */
export function symmetricWindow(values: number[], ticks = 8) {
  const big = Math.max(1, ...values.filter(Number.isFinite).map(Math.abs));
  const step = niceStep((2 * big * 1.12) / ticks);
  const e = Math.ceil((big * 1.12) / step) * step;
  return { lo: -e, hi: e, step };
}

const range = (lo: number, hi: number, step: number) => {
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step)
    out.push(Number(v.toFixed(9)));
  return out;
};

/** Grid lines every `step`, the axes, their numbers (every other when crowded) and names. */
export function HsdGrid({
  f,
  step,
  names = { x: 'x', y: 'y' },
  numbers = true,
  yText = formatNumber,
}: {
  f: Frame;
  step: { x: number; y: number };
  names?: { x: string; y: string };
  numbers?: boolean;
  /** How the numbers up the y-axis read ("2i" on the imaginary axis). */
  yText?: (v: number) => string;
}) {
  const c = usePalette();
  const ax = f.sx(Math.min(f.x[1], Math.max(f.x[0], 0)));
  const ay = f.sy(Math.min(f.y[1], Math.max(f.y[0], 0)));
  const xs = range(f.x[0], f.x[1], step.x);
  const ys = range(f.y[0], f.y[1], step.y);
  const widest = Math.max(...xs.map((v) => formatNumber(v).length));
  const xEvery = step.x * f.ux < widest * 7.5 + 8 ? 2 : 1;
  const yEvery = step.y * f.uy < 18 ? 2 : 1;
  const on = (v: number, s: number, every: number) => v !== 0 && Math.round(v / s) % every === 0;
  return (
    <G>
      {xs.map((v) => (
        <Line
          key={`gx${v}`}
          x1={f.sx(v)}
          y1={f.sy(f.y[0])}
          x2={f.sx(v)}
          y2={f.sy(f.y[1])}
          stroke={c.chartGrid}
          strokeWidth={1}
        />
      ))}
      {ys.map((v) => (
        <Line
          key={`gy${v}`}
          x1={f.sx(f.x[0])}
          y1={f.sy(v)}
          x2={f.sx(f.x[1])}
          y2={f.sy(v)}
          stroke={c.chartGrid}
          strokeWidth={1}
        />
      ))}
      <Line
        x1={f.sx(f.x[0])}
        y1={ay}
        x2={f.sx(f.x[1])}
        y2={ay}
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      <Line
        x1={ax}
        y1={f.sy(f.y[0])}
        x2={ax}
        y2={f.sy(f.y[1])}
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      {numbers
        ? xs
            .filter((v) => on(v, step.x, xEvery))
            .map((v) => (
              <MathText
                key={`nx${v}`}
                text={formatNumber(v)}
                x={f.sx(v)}
                y={ay + 15}
                fontSize={chart.label}
                fill={c.chartMuted}
                textAnchor="middle"
              />
            ))
        : null}
      {numbers
        ? ys
            .filter((v) => on(v, step.y, yEvery))
            .map((v) => (
              <MathText
                key={`ny${v}`}
                text={yText(v)}
                x={ax - 5}
                y={f.sy(v) + 4}
                fontSize={chart.label}
                fill={c.chartMuted}
                textAnchor="end"
              />
            ))
        : null}
      <MathText
        text={names.x}
        x={f.sx(f.x[1])}
        y={ay - 6}
        fontSize={chart.value}
        fontWeight="700"
        textAnchor="end"
      />
      <MathText
        text={names.y}
        x={ax + 6}
        y={f.sy(f.y[1]) + 12}
        fontSize={chart.value}
        fontWeight="700"
        textAnchor="start"
      />
    </G>
  );
}

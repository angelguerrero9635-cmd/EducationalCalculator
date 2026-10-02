/**
 * Drawing helpers for the college round 3 group D pictures (HC48–HC51, HC64): code in a code
 * font, interval brackets with their labels, and a label with a halo.
 */
import { Platform } from 'react-native';
import { G, Line, Text as SvgText } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { ChartText, useRep } from './common';
import { useValueLabel } from './he1fKit';

/** A code font: the system's monospace (Menlo on iOS). */
export const MONO =
  Platform.OS === 'web' ? 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' : 'Menlo';

/** Width of `n` code characters at `size` (monospace: 0.6 em). */
export const monoW = (n: number, size = chart.label) => n * size * 0.6;

/** A text's width estimate in the system font. */
export const textW = (s: string, size = chart.label, bold = false) =>
  [...s].length * size * (bold ? 0.62 : 0.57);

/**
 * A line of code as written: spaces kept (no-break spaces, so an indent and `x  = 1` survive
 * SVG's whitespace rules), straight quotes kept, no subscripts read into `_`.
 */
export function CodeText({
  x,
  y,
  code,
  size = chart.label,
  fill,
  bold = false,
  anchor = 'start',
}: {
  x: number;
  y: number;
  code: string;
  size?: number;
  fill: string;
  bold?: boolean;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <SvgText
      x={x}
      y={y}
      fontFamily={MONO}
      fontSize={size}
      fill={fill}
      fontWeight={bold ? '700' : '400'}
      textAnchor={anchor}
    >
      {code.replace(/ /g, ' ')}
    </SvgText>
  );
}

/**
 * A horizontal interval bracket from x1 to x2 at y, its ends ticked toward `side`, and its
 * label centred over it (or beside it when the label is wider than the bracket).
 */
export function HBracket({
  x1,
  x2,
  y,
  label,
  color,
  side = 'down',
  w,
}: {
  x1: number;
  x2: number;
  y: number;
  label?: string;
  color?: string;
  /** Which way the end ticks point (and the label sits on the other side). */
  side?: 'up' | 'down';
  /** The canvas width, to keep the label inside it. */
  w: number;
}) {
  const c = usePalette();
  const ink = color ?? c.chartHighlight;
  const t = side === 'down' ? 5 : -5;
  const lw = label ? textW(label) : 0;
  const mid = (x1 + x2) / 2;
  const fits = lw + 6 <= x2 - x1;
  // A label too wide for its bracket sits beside it, on the side with room.
  const room = (x: number) => Math.max(lw / 2 + 2, Math.min(w - lw / 2 - 2, x));
  const lx = fits ? mid : x2 + 4 + lw <= w - 2 ? x2 + 4 + lw / 2 : room(x1 - 4 - lw / 2);
  const ly = fits ? (side === 'down' ? y - 4 : y + 13) : y + 4;
  return (
    <G>
      <Line x1={x1} y1={y} x2={x2} y2={y} stroke={ink} strokeWidth={chart.strokeLight} />
      <Line x1={x1} y1={y} x2={x1} y2={y + t} stroke={ink} strokeWidth={chart.strokeLight} />
      <Line x1={x2} y1={y} x2={x2} y2={y + t} stroke={ink} strokeWidth={chart.strokeLight} />
      {label ? (
        <ChartText
          x={room(lx)}
          y={ly}
          textAnchor="middle"
          fontSize={chart.label}
          fontWeight="700"
          fill={ink}
          halo
        >
          {label}
        </ChartText>
      ) : null}
    </G>
  );
}

/** A vertical interval bracket from y1 to y2 at x, the label to the `side` of it. */
export function VBracket({
  y1,
  y2,
  x,
  label,
  color,
  side = 'left',
}: {
  y1: number;
  y2: number;
  x: number;
  label?: string;
  color?: string;
  side?: 'left' | 'right';
}) {
  const c = usePalette();
  const ink = color ?? c.chartHighlight;
  const t = side === 'left' ? 5 : -5;
  return (
    <G>
      <Line x1={x} y1={y1} x2={x} y2={y2} stroke={ink} strokeWidth={chart.strokeLight} />
      <Line x1={x} y1={y1} x2={x + t} y2={y1} stroke={ink} strokeWidth={chart.strokeLight} />
      <Line x1={x} y1={y2} x2={x + t} y2={y2} stroke={ink} strokeWidth={chart.strokeLight} />
      {label ? (
        <ChartText
          x={side === 'left' ? x - 5 : x + 5}
          y={(y1 + y2) / 2 + 4}
          textAnchor={side === 'left' ? 'end' : 'start'}
          fontSize={chart.label}
          fontWeight="700"
          fill={ink}
          halo
        >
          {label}
        </ChartText>
      ) : null}
    </G>
  );
}

/** A number to 4 significant figures for a label. */
export const fmt4 = (x: number) => formatNumber(Number(x.toPrecision(4)));

/** A time in seconds in the unit that reads best (ns, μs, ms, s), to 4 figures. */
export function fmtTime(sec: number): string {
  const a = Math.abs(sec);
  if (a > 0 && a < 1e-6) return `${fmt4(sec * 1e9)} ns`;
  if (a > 0 && a < 1e-3) return `${fmt4(sec * 1e6)} μs`;
  if (a > 0 && a < 1) return `${fmt4(sec * 1e3)} ms`;
  return `${fmt4(sec)} s`;
}

/**
 * Reads a group D spec's fields: a number as it is, a variable's value when known (a "?" is
 * undefined: nothing is drawn for it), scaled from the variable's unit by a unit table; and its
 * label as the page shows it ("t_cq = 1 ns").
 */
export function useReader(calc: Calculator) {
  const rep = useRep(calc);
  const valueLabel = useValueLabel(calc);
  const get = (x: NumOrVar | undefined): number | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    return rep.known(x) ? rep.val(x) : undefined;
  };
  const unit = (x: NumOrVar | undefined) =>
    typeof x === 'string' ? rep.variable(x).unit : undefined;
  /** The value in base units by `table` (seconds, hertz), as it is when its unit isn't listed. */
  const base = (x: NumOrVar | undefined, table: Record<string, number>) => {
    const v = get(x);
    if (v === undefined) return undefined;
    const u = unit(x);
    return v * (u !== undefined && table[u] !== undefined ? table[u]! : 1);
  };
  /** The page's label for a field, or `symbol = number` for a fixed number. */
  const lab = (x: NumOrVar | undefined, symbol: string, u = '') => {
    if (typeof x === 'string') return valueLabel(x);
    if (typeof x === 'number') return `${symbol} = ${fmt4(x)}${u ? ` ${u}` : ''}`;
    return undefined;
  };
  return { rep, get, unit, base, lab };
}

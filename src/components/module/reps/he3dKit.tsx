/**
 * Drawing helpers for the college round 3 group D pictures (HC48–HC51, HC64): code in a code
 * font, interval brackets with their labels, and a label with a halo.
 */
import { Platform } from 'react-native';
import { G, Line, Text as SvgText } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { ChartText } from './common';

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

/** Seconds per unit of a time the pages write (ns, μs, ms, s), 1 when unknown. */
export const TIME_UNITS: Record<string, number> = {
  ps: 1e-12,
  ns: 1e-9,
  μs: 1e-6,
  µs: 1e-6,
  us: 1e-6,
  ms: 1e-3,
  s: 1,
};

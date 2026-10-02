/**
 * Shared pieces of the college pictures, round 3, group M (`aquifer`, `refraction`, the GIS
 * options of `coordinatePlane`, `projection`): a value reader that never draws a "?" as a
 * number, a vertical dimension line, and number text. Labels, arrows and horizontal dimensions
 * come from `beamKit.tsx`.
 */
import { G, Line, Path } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { HeLabel } from './beamKit';
import { arrowHead } from './graphKit';

type X = number | string | undefined;

/** Three significant figures, with thousands separators (2,000, 0.005, 982). */
export const n3 = (x: number) =>
  Math.abs(x) < 1e-12
    ? '0'
    : formatNumber(Number(x.toPrecision(3)), {
        scientific: Math.abs(x) >= 1e9 || Math.abs(x) < 1e-4,
      });

/**
 * Reads number-or-variable fields in formula units: `get` is undefined for a "?" (nothing is
 * drawn for it), `text` the value as the page shows it (or `n3` of a number worked out here),
 * `sym` the page's symbol (or a fallback), `named` "Δh = 2 m".
 */
export function useReader(calc: Calculator) {
  const rep = useRep(calc);
  const get = (x: X): number | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    return rep.known(x) && Number.isFinite(rep.val(x)) ? rep.val(x) : undefined;
  };
  const sym = (x: X, fallback: string) =>
    typeof x === 'string' ? rep.variable(x).symbol : fallback;
  const text = (x: X, value: number, unit = '') =>
    typeof x === 'string' && rep.known(x) ? rep.value(x) : `${n3(value)}${unit ? ` ${unit}` : ''}`;
  const named = (x: X, fallback: string, value: number, unit = '') =>
    `${sym(x, fallback)} = ${text(x, value, unit)}`;
  /** The value as the page shows it without its unit, for a worked line. */
  const bare = (x: X, value: number) =>
    typeof x === 'string' && rep.known(x) ? rep.value(x, false) : n3(value);
  return { rep, get, sym, text, named, bare };
}

export type Reader = ReturnType<typeof useReader>;

/** A vertical dimension line from y1 to y2 at x, with end ticks and a label beside it. */
export function VDim({
  x,
  y1,
  y2,
  text,
  side = 1,
  w,
  color,
}: {
  x: number;
  y1: number;
  y2: number;
  text: string;
  /** 1: the label to the right; −1: to the left. */
  side?: 1 | -1;
  w: number;
  color?: string;
}) {
  const c = usePalette();
  const ink = color ?? c.chartMuted;
  const [a, b] = [Math.min(y1, y2), Math.max(y1, y2)];
  if (b - a < 2) return null;
  const head = Math.min(6, (b - a) / 2.5);
  return (
    <G>
      <Line x1={x} y1={a} x2={x} y2={b} stroke={ink} strokeWidth={1} />
      <Path d={arrowHead(x, a, 0, -1, head)} fill={ink} />
      <Path d={arrowHead(x, b, 0, 1, head)} fill={ink} />
      <Line x1={x - 5} y1={a} x2={x + 5} y2={a} stroke={ink} strokeWidth={1} />
      <Line x1={x - 5} y1={b} x2={x + 5} y2={b} stroke={ink} strokeWidth={1} />
      <HeLabel
        x={x + side * 8}
        y={(a + b) / 2 + 4}
        text={text}
        anchor={side === 1 ? 'start' : 'end'}
        size={chart.label}
        w={w}
        color={color}
      />
    </G>
  );
}

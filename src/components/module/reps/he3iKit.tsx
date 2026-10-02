/**
 * Shared pieces of the college round 3 group I pictures (HC81–HC84): a value reader that also
 * converts a variable's own unit (mm or cm, m/min or m/s) to SI, and a labelled dimension line.
 */
import { G, Line } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { fmt, HeLabel, useBeamReader } from './beamKit';
import { siFactor } from './he3iUnits';

type X = number | string | undefined;

/**
 * The beam reader (`v` in formula units, `known`, `text`, `symbol`, `named`) plus `si`: a value
 * in SI from the unit its variable declares (`fallback` is the unit a fixed number is in).
 */
export function useHe3iReader(calc: Calculator) {
  const r = useBeamReader(calc);
  const unitOf = (x: X, fallback: string) =>
    typeof x === 'string' ? (r.rep.variable(x).unit ?? fallback) : fallback;
  const si = (x: X, fallbackUnit: string, fallback = 0) =>
    x === undefined ? fallback : r.v(x) * siFactor(unitOf(x, fallbackUnit));
  /**
   * A value as the picture labels it: typed values as typed, worked-out ones to 3 figures in
   * the unit shown ("493.75" reads 494), fixed numbers with `unit`.
   */
  const text = (x: X, value: number, unit = '') => {
    if (typeof x !== 'string')
      return `${formatNumber(value)}${unit ? (unit === '°' ? '°' : ` ${unit}`) : ''}`;
    if (r.rep.typed(x) || !r.known(x)) return r.text(x, value, unit);
    const shown = r.rep.unit(x) ?? r.rep.variable(x).unit;
    return `${fmt(r.rep.shown(x))}${shown ? ` ${shown}` : ''}`;
  };
  /** "F_M = 494 N" when known; "F_M" alone when the box shows "?". */
  const tag = (x: X, sym: string, value: number, unit = '') =>
    r.known(x) ? `${r.symbol(x, sym)} = ${text(x, value, unit)}` : r.symbol(x, sym);
  return { ...r, text, si, unitOf, tag };
}

export type He3iReader = ReturnType<typeof useHe3iReader>;

/**
 * A dimension line from x1 to x2 at y with end ticks and a label above (or below) its middle.
 */
export function DimLine({
  x1,
  x2,
  y,
  text,
  w,
  below = false,
  color,
}: {
  x1: number;
  x2: number;
  y: number;
  text: string;
  w: number;
  below?: boolean;
  color?: string;
}) {
  const c = usePalette();
  const ink = color ?? c.chartMuted;
  return (
    <G>
      <Line x1={x1} y1={y} x2={x2} y2={y} stroke={ink} strokeWidth={1.2} />
      <Line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke={ink} strokeWidth={1.2} />
      <Line x1={x2} y1={y - 5} x2={x2} y2={y + 5} stroke={ink} strokeWidth={1.2} />
      <HeLabel x={(x1 + x2) / 2} y={below ? y + 17 : y - 6} text={text} w={w} chip={false} />
    </G>
  );
}

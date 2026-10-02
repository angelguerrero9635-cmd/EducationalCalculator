/**
 * Shared parts of the college round 3 group J pictures (`typesHe3j.ts`): a value reader that
 * gives undefined for a "?", labels that read a worked value to 4 figures, numbers for
 * captions, a dimension line, and a drag on one value.
 */
import { useRef } from 'react';
import { G, Line, Path } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { chart } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useFrozen, useRep } from './common';
import { useValueLabel } from './he1fKit';

/** A number for a caption or label: 3 significant figures (4 when `figs` says). */
export const nf = (x: number, figs = 3) => {
  const r = Number(x.toPrecision(figs));
  return formatNumber(r, { scientific: Math.abs(r) >= 1e7 || (r !== 0 && Math.abs(r) < 1e-4) });
};

/** Reads spec fields in formula units ("?" is undefined), and labels them. */
export function useHe3j(calc: Calculator) {
  const rep = useRep(calc);
  const valueLabel = useValueLabel(calc);
  const get = (x: NumOrVar | undefined): number | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    if (!rep.known(x)) return undefined;
    const v = rep.val(x);
    return Number.isFinite(v) ? v : undefined;
  };
  /** "y = 1.2 m": the variable's symbol and shown value, or a fixed number with `sym` and `unit`. */
  const lab = (x: NumOrVar | undefined, sym: string, unit = '') => {
    if (x === undefined) return undefined;
    if (typeof x === 'string') {
      if (!rep.known(x)) return undefined;
      if (rep.typed(x)) return valueLabel(x);
      // A worked-out value reads to 3 figures in the picture.
      const u = rep.unit(x);
      const gap = u && ['%', '°'].includes(u) ? '' : ' ';
      return `${rep.variable(x).symbol} = ${nf(rep.shown(x))}${u ? `${gap}${u}` : ''}`;
    }
    return `${sym} = ${nf(x, 4)}${unit ? ` ${unit}` : ''}`;
  };
  /** The symbol a field is printed with (the variable's own, or `sym`). */
  const sym = (x: NumOrVar | undefined, fallback: string) =>
    typeof x === 'string' ? rep.variable(x).symbol : fallback;
  /** The shown unit of a field (or `fallback`). */
  const unit = (x: NumOrVar | undefined, fallback: string) =>
    typeof x === 'string' ? (rep.unit(x) ?? fallback) : fallback;
  /** Whether a drag may drive this field: a variable the student typed. */
  const draggable = (x: NumOrVar | undefined): x is string =>
    typeof x === 'string' && rep.known(x) && rep.typed(x);
  return { rep, get, lab, sym, unit, draggable };
}

/**
 * A drag that sets one value from where it started: `toValue(dx, dy, start)` in formula units.
 * The drawing's scale stays frozen while the finger is down.
 */
export function useValueDrag<T>(calc: Calculator, scale: T, keep: string[] | undefined) {
  const rep = useRep(calc);
  const frozen = useFrozen(scale);
  const start = useRef(0);
  return {
    scale: frozen.value,
    handlers: (id: string, toValue: (dx: number, dy: number, start: number) => number) => ({
      onStart: () => {
        start.current = rep.val(id);
        frozen.freeze();
      },
      onMove: (dx: number, dy: number) =>
        calc.set(
          { ...rep.pinTyped(keep ?? []), [id]: rep.snapTo(id, toValue(dx, dy, start.current)) },
          rep.slide(id),
        ),
      onEnd: () => frozen.release(),
    }),
  };
}

/** A dimension line with end ticks from (x1, y1) to (x2, y2). */
export function Dim({
  x1,
  y1,
  x2,
  y2,
  color,
  tick = 5,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  tick?: number;
}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const [px, py] = [-Math.sin(a) * tick, Math.cos(a) * tick];
  return (
    <G>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={chart.strokeLight} />
      <Path
        d={`M ${x1 - px} ${y1 - py} L ${x1 + px} ${y1 + py} M ${x2 - px} ${y2 - py} L ${x2 + px} ${y2 + py}`}
        stroke={color}
        strokeWidth={chart.strokeLight}
      />
    </G>
  );
}

/** Points to an SVG path. */
export const pathOf = (ps: [number, number][], close = false) =>
  ps.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ') +
  (close ? ' Z' : '');

/**
 * Shared parts of group K's college pictures (round 4): reading a field that is a fixed number or
 * a variable id (a "?" reads as undefined, so it draws nothing), and its text for a label.
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';

/** Three significant figures, × 10ⁿ past a million or under a thousandth. */
export const n3 = (x: number) =>
  formatNumber(Number(x.toPrecision(3)), {
    scientific: Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-3),
    scientificFigures: 3,
  });

/** A field's value in the page's shown unit, its text, and its "symbol = value unit" label. */
export function useReader(calc: Calculator) {
  const rep = useRep(calc);
  const get = (x: NumOrVar | undefined): number | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    return rep.known(x) ? rep.shown(x) : undefined;
  };
  /** A number with its unit: "12 cm", "13.5%". */
  const withU = (s: string, unit: string | undefined) =>
    !unit ? s : ['%', '°'].includes(unit) ? `${s}${unit}` : `${s} ${unit}`;
  /**
   * "300 mL/min" (or the fixed number with `unit`); undefined for "?". A typed value reads as
   * typed, a worked-out one to 3 figures.
   */
  const text = (x: NumOrVar | undefined, unit = '', withUnit = true): string | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return withUnit ? withU(n3(x), unit) : n3(x);
    if (!rep.known(x)) return undefined;
    if (rep.typed(x)) return rep.value(x, withUnit);
    const s = n3(rep.shown(x));
    return withUnit ? withU(s, rep.unit(x)) : s;
  };
  /** The value as text, a worked-out value the picture found when the field is left out. */
  const say = (x: NumOrVar | undefined, fallback: number, unit = '', withUnit = true) =>
    text(x, unit, withUnit) ?? (withUnit ? withU(n3(fallback), unit) : n3(fallback));
  /** "Q_b = 300 mL/min", with the symbol given. */
  const label = (symbol: string, x: NumOrVar | undefined, unit = '') => {
    const t = text(x, unit);
    return t === undefined ? undefined : `${symbol} = ${t}`;
  };
  return { rep, get, text, say, label };
}

export type Reader = ReturnType<typeof useReader>;

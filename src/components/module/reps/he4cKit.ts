/**
 * Shared pieces of group HE4C's college pictures: values in their formula units (a "?" reads
 * undefined, so nothing is drawn for it), a value's label as the page shows it, and a drag
 * helper that sets one value and keeps the typed ones.
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { useValueLabel } from './he1fKit';
import { fmt } from './he2fKit';

export function useHe4c(calc: Calculator) {
  const rep = useRep(calc);
  const valueLabel = useValueLabel(calc);
  /** A value in its formula unit, or undefined while "?"; a fixed number as it is. */
  const num = (x: NumOrVar | undefined): number | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    return rep.known(x) ? rep.val(x) : undefined;
  };
  /**
   * A label for a field: the page's own ("x = 13 m") for a variable, else `symbol = value unit`
   * from `fallback`, or undefined while it is "?".
   */
  const label = (
    x: NumOrVar | undefined,
    symbol: string,
    fallback: number | undefined,
    unit = '',
  ): string | undefined => {
    if (typeof x === 'string') return rep.known(x) ? valueLabel(x) : undefined;
    if (fallback === undefined || !Number.isFinite(fallback)) return undefined;
    const gap = unit === '' || unit === '°' ? '' : ' ';
    return `${symbol} = ${fmt(fallback)}${gap}${unit}`;
  };
  /** A variable's formula unit, or `fallback` for a fixed number. */
  const unitOf = (x: NumOrVar | undefined, fallback: string) =>
    typeof x === 'string' ? (rep.variable(x).unit ?? fallback) : fallback;
  /** Sets `id` to `value` (formula units, snapped to its step and range), keeping the other typed values. */
  const setOne = (id: string, value: number, keep: (NumOrVar | undefined)[]) =>
    calc.set(
      {
        ...rep.pinTyped(keep.filter((k): k is string => typeof k === 'string' && k !== id)),
        [id]: rep.snapTo(id, value),
      },
      rep.slide(id),
    );
  return { rep, num, label, unitOf, setOne };
}

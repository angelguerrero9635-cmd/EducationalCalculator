/**
 * Reading a group M spec's fields (`typesHe4m.ts`): a field is a fixed number or a variable id,
 * read in the variable's shown unit; a "?" variable reads as undefined, so it draws nothing.
 */
import { formatNumber } from '@/engine/format';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';

type Field = number | string | undefined;

/** A number to 3 significant figures, as a picture writes a worked value. */
export const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));

export function useFields(calc: Calculator) {
  const rep = useRep(calc);
  const known = (v: Field) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: Field): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  /**
   * A field as written: a typed value as the page shows it, a worked-out one (or a fixed
   * number) to 3 figures, with the variable's unit when asked.
   */
  const say = (v: Field, x: number, unit = false) => {
    if (typeof v === 'string' && known(v) && rep.typed(v)) return rep.value(v, unit);
    const u = unit && typeof v === 'string' ? rep.unit(v) : undefined;
    return u ? `${n3(x)} ${u}` : n3(x);
  };
  return { rep, known, get, say };
}

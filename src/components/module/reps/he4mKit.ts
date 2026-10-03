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
  /** A field as written: the page's value as shown (with its unit), or the number to 3 figures. */
  const say = (v: Field, x: number, unit = false) =>
    typeof v === 'string' && known(v) ? rep.value(v, unit) : n3(x);
  return { rep, known, get, say };
}

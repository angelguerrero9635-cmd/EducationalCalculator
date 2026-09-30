/**
 * Harness checks for Grades 9–12 round 3, group H3E (H108: chemistry). Called from the kinds'
 * cases in `pictures.ts` (or the round 1 check files).
 */
import { ionsFromCharges } from '@/components/module/reps/ionicCharges';
import { IONIC_METALS, IONIC_NONMETALS, valenceElectrons } from '@/components/module/reps/lewis';

import type { IonicCharges } from '../typesHs3e';

type Num = (x: string | number | undefined) => number | undefined;

/**
 * `lewisStructure` ionic `charges` (part 2): each charge a whole number 1–3 and each element it
 * picks one the picture draws. Returns the pair the picture draws, for the rest of the check.
 */
export function ionicChargeIssues(
  rep: { metal: string; nonmetal: string; charges?: IonicCharges },
  num: Num,
  out: string[],
): { metal: string; nonmetal: string } {
  const ch = rep.charges;
  if (!ch) return rep;
  for (const [x, what] of [
    [ch.metal, 'metal ion charge'],
    [ch.nonmetal, 'nonmetal ion charge'],
  ] as const) {
    const v = num(x);
    if (v !== undefined && !(Number.isInteger(v) && v >= 1 && v <= 3))
      out.push(`${what} ${v} (a whole number 1 to 3 draws)`);
  }
  for (const m of ch.metals ?? []) if (!IONIC_METALS.includes(m)) out.push(`${m} is not a metal`);
  for (const n of ch.nonmetals ?? [])
    if (!IONIC_NONMETALS.includes(n)) out.push(`${n} is not a nonmetal`);
  const pick = ionsFromCharges(ch, rep, (x) => num(x));
  (ch.metals ?? []).forEach((m, k) => {
    if (IONIC_METALS.includes(m) && valenceElectrons(m) !== k + 1)
      out.push(`${m} is listed for charge ${k + 1}`);
  });
  (ch.nonmetals ?? []).forEach((n, k) => {
    if (IONIC_NONMETALS.includes(n) && 8 - valenceElectrons(n) !== k + 1)
      out.push(`${n} is listed for charge −${k + 1}`);
  });
  return pick;
}

/**
 * Shared pieces of group HE4G's college pictures: group C's value reader (`useHe4c`: a "?"
 * reads undefined, so nothing is drawn for it) plus a number for a worked line, written as the
 * student typed it or else to 4 figures, and a field's symbol as the page names it.
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';

import type { Calculator } from '../useCalculator';
import { fmt } from './he2fKit';
import { useHe4c } from './he4cKit';

export function useHe4g(calc: Calculator) {
  const kit = useHe4c(calc);
  const { rep } = kit;
  /** A number for a caption's working: as typed (1,013.25), else `x` to 4 figures. */
  const say = (field: NumOrVar | undefined, x: number) =>
    typeof field === 'string' && rep.known(field) && rep.typed(field)
      ? rep.value(field, false)
      : fmt(x);
  /** The page's symbol for a field, or `d` for a fixed number or no field. */
  const sym = (field: NumOrVar | undefined, d: string) =>
    typeof field === 'string' ? rep.variable(field).symbol : d;
  return { ...kit, say, sym };
}

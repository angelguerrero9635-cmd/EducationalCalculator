/**
 * Picture checks for college round 4, group I (docs/RENDERINGS_HE.md). HC141: a cell's A, V and
 * A ÷ V agree with r to 3 significant figures, on a sphere. Called from `repIssues` in
 * `pictures.ts` (and the layout checks from `layoutFigures.ts`). Test-only.
 */
import { cellRatio } from '@/components/module/reps/he4iMath';

import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

/** Equal to 3 significant figures. */
const sameTo3 = (a: number, b: number) =>
  Number(a.toPrecision(3)) === Number(b.toPrecision(3)) ||
  Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

/** HC141 on `curvedSolid`. */
export function cellRatioIssues(rep: Representation, val: Val): string[] {
  if (rep.kind !== 'curvedSolid' || !rep.ratio) return [];
  const out: string[] = [];
  if (rep.shape !== 'sphere') out.push(`ratio: a ${rep.shape} is not a cell's sphere`);
  const r = val(rep.radius);
  const q = rep.ratio;
  if (q.compare !== undefined && q.compare !== false) {
    const k = val(q.compare);
    if (k !== undefined && !(k > 0)) out.push(`ratio: compare factor ${k} is not positive`);
  }
  if (r === undefined) return out;
  if (!(r > 0)) return [...out, `ratio: r = ${r} is not positive`];
  const m = cellRatio(r);
  const check = (id: string | undefined, want: number, what: string) => {
    const x = id ? val(id) : undefined;
    if (x !== undefined && !sameTo3(x, want))
      out.push(`ratio: ${what} ${x} for r = ${r} (${Number(want.toPrecision(3))})`);
  };
  check(q.area, m.area, 'A = 4πr² is');
  check(q.volume, m.volume, 'V = 4/3 πr³ is');
  check(q.ratio, m.ratio, 'A ÷ V = 3 ÷ r is');
  return out;
}

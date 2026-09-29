/**
 * Picture checks for the Grades 9–12 biology pictures of group HG (`typesHsg.ts`): what each
 * one draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import { MEMBRANE_MAX, MOVED_MAX, flowOf } from '@/components/module/reps/membraneMath';

import type { HsgSpec } from '../typesHsg';

const whole = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;

export function hsgIssues(rep: HsgSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  switch (rep.kind) {
    case 'membrane': {
      const o = num(rep.outside);
      const i = num(rep.inside);
      for (const [what, x, max] of [
        ['outside', o, MEMBRANE_MAX],
        ['inside', i, MEMBRANE_MAX],
        ['moved', num(rep.moved), MOVED_MAX],
        ['ATP', num(rep.atp), 12],
      ] as const) {
        if (x === undefined) continue;
        if (x < 0 || !whole(x)) out.push(`membrane: ${what} count ${x} is not a whole count`);
        if (x > max) out.push(`membrane: ${what} count ${x} is past the ${max} drawn`);
      }
      if (o === undefined || i === undefined) break;
      const d = rep.gradient ? val(rep.gradient) : undefined;
      if (d !== undefined && Math.abs(d - (o - i)) > 1e-9)
        out.push(`membrane: gradient ${d}, but the picture has ${o} − ${i} = ${o - i}`);
      // The arrow: high to low for diffusion; water toward more solute; a pump low to high.
      const flow = flowOf(rep.transport, o, i);
      const want =
        o === i
          ? 'both'
          : rep.transport === 'diffusion' || rep.transport === 'facilitated'
            ? o > i
              ? 'in'
              : 'out'
            : // Water leaves the side with less solute; a pump fills the side with more.
              o > i
              ? 'out'
              : 'in';
      if (flow !== want) out.push(`membrane: the arrow points ${flow}, expected ${want}`);
      // Particles pumped leave the side with fewer: never more than it has.
      const moved = num(rep.moved);
      if (moved !== undefined && rep.transport !== 'osmosis') {
        const from = flow === 'in' ? o : flow === 'out' ? i : Math.max(o, i);
        if (moved > from) out.push(`membrane: ${moved} moved from a side with ${from}`);
      }
      break;
    }
  }
  return out;
}

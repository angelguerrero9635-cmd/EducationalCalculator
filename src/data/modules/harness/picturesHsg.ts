/**
 * Picture checks for the Grades 9–12 biology pictures of group HG (`typesHsg.ts`): what each
 * one draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import { MEMBRANE_MAX, MOVED_MAX, flowOf } from '@/components/module/reps/membraneMath';

import {
  dihybridBoxes,
  dihybridCounts,
  monoBoxes,
  xBoxes,
} from '@/components/module/reps/punnettMath';

import type { Representation } from '../types';
import type { HsgSpec } from '../typesHsg';

const whole = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;

type PunnettSpec = Extract<Representation, { kind: 'punnettSquare' }>;

/**
 * The Grade 9 Punnett squares: the parents' counts are whole and in range, and each value the
 * page names agrees with the boxes drawn, counted here from the parents' alleles directly (the
 * product rule for two genes; X-linked sons from the mother alone).
 */
export function punnettHsIssues(
  rep: PunnettSpec,
  val: (id: string) => number | undefined,
): string[] {
  const out: string[] = [];
  const h = rep.inheritance;
  if (!h) return out;
  const xl = h.pattern === 'xLinked';
  const parents: [string, number][] = [
    [rep.first, 2],
    [rep.second, xl ? 1 : 2],
    ...(h.pattern === 'dihybrid'
      ? ([
          [h.firstB, 2],
          [h.secondB, 2],
        ] as [string, number][])
      : []),
  ];
  for (const [id, max] of parents) {
    const x = val(id);
    if (x !== undefined && (x < 0 || x > max || !whole(x)))
      out.push(`punnett: parent ${id} has ${x} dominant alleles (0 to ${max})`);
  }
  const [p, q] = [val(rep.first), val(rep.second)];
  if (p === undefined || q === undefined) return out;
  const check = (id: string | undefined, want: number, what: string) => {
    const x = id === undefined ? undefined : val(id);
    if (x !== undefined && Math.abs(x - want) > 1e-9)
      out.push(`punnett: ${what} ${id} = ${x}, the square shows ${want}`);
  };
  // Recessive alleles each parent can give, out of 2 (1 for the father's X: his other is Y).
  const recessive = (2 - p) * (2 - q);
  switch (h.pattern) {
    case 'dihybrid': {
      const [pB, qB] = [val(h.firstB), val(h.secondB)];
      if (pB === undefined || qB === undefined) break;
      const recB = (2 - pB) * (2 - qB);
      check(rep.dominant, (4 - recessive) * (4 - recB), 'boxes with both dominant traits');
      check(rep.recessive, recessive * recB, 'boxes with neither');
      const counts = dihybridCounts(dihybridBoxes(p, q, pB, qB));
      if (counts[0] !== (4 - recessive) * (4 - recB) || counts[3] !== recessive * recB)
        out.push(`punnett: the 16 boxes (${counts}) break the product rule`);
      break;
    }
    case 'incomplete':
    case 'codominant': {
      const first = p * q;
      check(rep.dominant, first, 'boxes homozygous for the first allele');
      check(rep.recessive, recessive, 'boxes homozygous for the second allele');
      check(h.middle, 4 - first - recessive, 'heterozygous boxes');
      const boxes = monoBoxes(p, q).flat();
      if (boxes.filter((b) => b === 2).length !== first) out.push('punnett: the boxes miscount');
      break;
    }
    case 'xLinked': {
      // Sons: affected with the mother's recessive X (2 − p of 2 boxes). Daughters: affected
      // only when the father's X is recessive too.
      const affected = 2 - p + (2 - p) * (1 - q);
      check(rep.recessive, affected, 'boxes with the trait');
      check(rep.dominant, 4 - affected, 'boxes without the trait');
      check(h.carriers, q * (2 - p) + (1 - q) * p, 'carrier daughters');
      const boxes = xBoxes(p, q).flat();
      if (boxes.filter((b) => b.affected).length !== affected)
        out.push('punnett: the X-linked boxes miscount');
      if (boxes.some((b) => b.son && b.carrier)) out.push('punnett: a son drawn as a carrier');
      break;
    }
  }
  return out;
}

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

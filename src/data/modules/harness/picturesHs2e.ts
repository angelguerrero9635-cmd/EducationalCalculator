/**
 * Picture checks for the Grades 9–12 round 2 pictures of group H2E (`typesHs2e.ts`): what each
 * draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import { transcribe, translate } from '@/components/module/reps/dnaMath';
import { flowSteps } from '@/components/module/reps/barFlowMath';
import { GLUCOSE } from '@/components/module/reps/glucose';

import type { Representation } from '../types';
import { geneShown, type Hs2eSpec } from '../typesHs2e';
import type { DnaStrandSpec } from '../typesHsg';

const whole = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;

/**
 * `bars` with `flows` (H100): at least a start, one flow and an end; `out` names flows only;
 * the steps from the start, adding and taking away, reach the end bar; no flow is negative.
 */
export function barFlowIssues(
  rep: Extract<Representation, { kind: 'bars' }>,
  val: (x: string | number) => number | undefined,
): string[] {
  if (!rep.flows) return [];
  const out: string[] = [];
  const ids = rep.bars.map((b) => b.var);
  if (ids.length < 3) out.push(`bars flows: ${ids.length} bars (a start, flows and an end)`);
  for (const id of rep.flows.out)
    if (!ids.slice(1, -1).includes(id)) out.push(`bars flows: ${id} in out is not a flow bar`);
  const vs = ids.map((id) => val(id));
  if (vs.some((v) => v === undefined)) return out;
  vs.slice(1, -1).forEach((v, k) => {
    if (v! < 0) out.push(`bars flows: flow ${ids[k + 1]} is negative (${v})`);
  });
  const { reached } = flowSteps(
    vs as number[],
    ids.map((id) => rep.flows!.out.includes(id)),
  );
  const end = vs[vs.length - 1]!;
  if (Math.abs(reached - end) > 1e-6 * Math.max(1, Math.abs(end)))
    out.push(`bars flows: the steps reach ${reached}, the end bar shows ${end}`);
  return out;
}

/**
 * `percentBar` with `second` (H104): the second percent is not negative and fits the bar (at
 * most 100%, or the main percent when that runs past it).
 */
export function percentSecondIssues(
  rep: Extract<Representation, { kind: 'percentBar' }>,
  val: (x: string | number) => number | undefined,
): string[] {
  if (!rep.second) return [];
  const s = val(rep.second);
  const p = val(rep.percent);
  if (s === undefined) return [];
  if (s < 0) return [`percentBar second ${s}% is below 0`];
  if (s > Math.max(100, p ?? 0)) return [`percentBar second ${s}% runs past the bar`];
  return [];
}

/**
 * `reaction` with `many` (H100): the glucose it draws is C₆H₁₂O₆, 24 atoms, every bond between
 * two of them, each carbon with 4 bonds, each oxygen 2 and each hydrogen 1, all in one piece.
 */
export function reactionManyIssues(): string[] {
  const out: string[] = [];
  const { atoms, bonds } = GLUCOSE;
  const count = (el: string) => atoms.filter((a) => a.el === el).length;
  if (atoms.length !== 24 || count('C') !== 6 || count('H') !== 12 || count('O') !== 6)
    out.push(`glucose: ${count('C')} C, ${count('H')} H, ${count('O')} O (C₆H₁₂O₆ has 6, 12, 6)`);
  const degree = atoms.map(() => 0);
  for (const [i, j] of bonds) {
    if (!atoms[i] || !atoms[j] || i === j) out.push(`glucose: bond ${i}–${j} is not two atoms`);
    else [degree[i], degree[j]] = [degree[i]! + 1, degree[j]! + 1];
  }
  const valence: Record<string, number> = { C: 4, O: 2, H: 1 };
  atoms.forEach((a, i) => {
    if (degree[i] !== valence[a.el])
      out.push(`glucose: atom ${i} (${a.el}) has ${degree[i]} bonds`);
  });
  // One molecule: 24 atoms and 24 bonds make one ring, and every atom is reached from the first.
  const seen = new Set([0]);
  for (let grew = true; grew;) {
    grew = false;
    for (const [i, j] of bonds)
      if (seen.has(i) !== seen.has(j)) {
        seen.add(i).add(j);
        grew = true;
      }
  }
  if (seen.size !== atoms.length) out.push('glucose: the atoms are not all joined');
  return out;
}

/**
 * A `dnaStrand` long gene (H100): b a whole multiple of 3, at least 6; the drawn template starts
 * with the sequence and ends in its stop codon, with no stop before it; codons = b ÷ 3.
 */
export function dnaGeneIssues(
  rep: DnaStrandSpec,
  num: (x: string | number | undefined) => number | undefined,
): string[] {
  const out: string[] = [];
  const gene = rep.gene!;
  const seq = rep.sequence ?? '';
  if (!/^[ATGC]{12,}$/.test(seq)) out.push(`dna gene: sequence "${seq}" is not 12 or more bases`);
  const b = num(gene.bases);
  if (b === undefined) return out;
  if (!whole(b / 3) || b < 6) out.push(`dna gene: ${b} bases (a multiple of 3, 6 or more)`);
  const { template } = geneShown(seq, gene, b);
  const chain = translate(transcribe(template));
  const stops = chain.map((p) => p.aa === 'Stop');
  if (!stops[stops.length - 1]) out.push(`dna gene: ${template} does not end in a stop codon`);
  if (chain.length !== template.length / 3) out.push('dna gene: a stop codon before the end');
  if (chain[0]?.aa !== 'Met') out.push('dna gene: the gene does not start with AUG (Met)');
  const c = rep.codons ? num(rep.codons) : undefined;
  if (c !== undefined && Math.abs(c - b / 3) > 1e-9)
    out.push(`dna gene: ${c} codons, ${b} bases make ${b / 3}`);
  return out;
}
const num = (x: number | string, val: (id: string) => number | undefined) =>
  typeof x === 'number' ? x : val(x);

export function hs2eIssues(rep: Hs2eSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  switch (rep.kind) {
    case 'macromolecules': {
      // A chain of n monomers: whole, at least 2 (one bond); bonds and water are n − 1.
      const n = num(rep.count, val);
      if (n === undefined) break;
      if (!whole(n) || n < 2) out.push(`macromolecules: ${n} monomers (a whole number, 2 or more)`);
      for (const [id, what] of [
        [rep.bonds, 'bonds'],
        [rep.water, 'water molecules'],
      ] as const) {
        const x = id === undefined ? undefined : val(id);
        if (x !== undefined && Math.abs(x - (n - 1)) > 1e-9)
          out.push(`macromolecules: ${n} monomers make ${n - 1} ${what}, the value shows ${x}`);
      }
      break;
    }
    case 'cellDivision': {
      // 2n even and at least 2; each count the page names agrees with it.
      const d = num(rep.diploid, val);
      if (d === undefined) break;
      if (!whole(d / 2) || d < 2) out.push(`cellDivision: 2n = ${d} (an even number, 2 or more)`);
      const n = d / 2;
      for (const [id, want, what] of [
        [rep.haploid, n, 'n'],
        [rep.chromatids, 2 * d, 'chromatids'],
        [rep.zygote, d, 'zygote chromosomes'],
        [rep.combinations, 2 ** n, 'gamete combinations'],
      ] as const) {
        const x = id === undefined ? undefined : val(id);
        if (x !== undefined && Math.abs(x - want) > 1e-9 * Math.max(1, want))
          out.push(`cellDivision: 2n = ${d} gives ${want} ${what}, the value shows ${x}`);
      }
      break;
    }
  }
  return out;
}

/**
 * Picture checks for the Grades 9–12 round 2 pictures of group H2E (`typesHs2e.ts`): what each
 * draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import { transcribe, translate } from '@/components/module/reps/dnaMath';

import { geneShown, type Hs2eSpec } from '../typesHs2e';
import type { DnaStrandSpec } from '../typesHsg';

const whole = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;

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

/**
 * Picture specs and options for the Grades 9–12 round 2 biology and sort pictures of group H2E
 * (H100 and H104 in `pictureRequestsHs.ts`), kept apart from `types.ts` and `layouts/types.ts`
 * so those files only name them.
 */
import type { MacroKind } from './typesHsg';

/** A fixed number or a variable id (as in `typesGraphs.ts`). */
type NumOrVar = number | string;

// ─── H100 part 1: macromolecules as a calculator picture ─────────────────────

/**
 * The `macromolecules` figure (H31) driven by a value: `count` monomers join by dehydration
 * synthesis (or split, `split`, by hydrolysis). 2–4 are drawn; past 4 the first two and the
 * last, with "…" between them, and the count written. `bonds` and `water` (optional) are
 * variables holding the new bonds and the water molecules given off (count − 1 each, checked).
 * `macro` is the polymer's kind: a carbohydrate, a protein or a nucleic acid (a fat is not a
 * chain of any length).
 */
export interface MacroCalcSpec {
  kind: 'macromolecules';
  macro: Exclude<MacroKind, 'lipid'>;
  count: NumOrVar;
  bonds?: string;
  water?: string;
  split?: boolean;
}

// ─── H100 part 2: dnaStrand long genes ───────────────────────────────────────

/**
 * The `gene` option on `dnaStrand` (H100): a coding sequence `bases` long (a number or a value;
 * a multiple of 3, at least 6) whose first bases are the spec's `sequence` and whose last codon
 * is the stop, `stop` on the template (ATT, ATC or ACT, read UAA, UAG or UGA; default ATT). Up
 * to 15 bases it draws them all (the sequence's first bases − 3, then the stop); past 15 the
 * first 12, "…", and the stop codon, with the mRNA, the codons and the protein (Met … Stop) under
 * them. `codons` (on the spec) is checked as bases ÷ 3.
 */
export interface DnaLongGene {
  bases: NumOrVar;
  stop?: 'ATT' | 'ATC' | 'ACT';
}

/** The bases a long gene draws: the template shown, and where "…" goes (or −1). */
export function geneShown(sequence: string, gene: DnaLongGene, bases: number) {
  const stop = gene.stop ?? 'ATT';
  const b = Math.max(6, 3 * Math.round(bases / 3));
  if (b <= 15) return { template: sequence.slice(0, b - 3) + stop, gap: -1 };
  return { template: sequence.slice(0, 12) + stop, gap: 12 };
}

// ─── H100 part 3: cellDivision as a calculator picture ───────────────────────

/**
 * Chromosome counts from a value: a body cell of 2n = `diploid` chromosomes (duplicated, as at
 * metaphase), a gamete after meiosis (n), and an egg and a sperm joining into a zygote (n + n).
 * Each pair is one maternal (red) and one paternal (blue) chromosome. Up to 2n = 8 each is
 * drawn; past 8 one pair and "× n pairs". Optional variables, each checked: `haploid` (2n ÷ 2),
 * `chromatids` (2 × 2n, at metaphase), `zygote` (n + n) and `combinations` (2ⁿ gametes by
 * independent assortment, no crossing over).
 */
export interface CellDivisionCalcSpec {
  kind: 'cellDivision';
  diploid: NumOrVar;
  haploid?: string;
  chromatids?: string;
  zygote?: string;
  combinations?: string;
}

/** Group H2E's calculator pictures. */
export type Hs2eSpec = MacroCalcSpec | CellDivisionCalcSpec;

/** Every variable id a group-H2E picture reads (for modules.test.ts). */
export function hs2eSpecVars(r: Hs2eSpec): string[] {
  const ids = (xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'macromolecules':
      return ids([r.count, r.bonds, r.water]);
    case 'cellDivision':
      return ids([r.diploid, r.haploid, r.chromatids, r.zygote, r.combinations]);
  }
}

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
  /** College HC115: a protein's four levels, one lit (`typesHe4d.ts`, `ProteinLevels.tsx`). */
  level?: NumOrVar;
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

// ─── H100 part 8: bars with flows ────────────────────────────────────────────

/**
 * The `flows` option on `bars` (H100): the first bar is a start, the last an end, and each bar
 * between a flow that adds, or takes away when named in `out` (N, + B, − D, + I, − E, N₁). Drawn
 * as steps from the running total (`reps/BarsFlows.tsx`); the harness checks the steps reach
 * the end bar.
 */
export interface BarFlows {
  out: string[];
}

// ─── H100 part 4: observe with two rows ──────────────────────────────────────

/**
 * The `second` row of an observe page (H100): a second quantity counted in the same columns and
 * unit (a second species per day), its bars beside the first's in `chartSecond`, a row of its
 * own in the table, and a key naming both rows. The page's `rowLabel` names the first row, its
 * `unit` heads the table, and `pattern(first, second)` reads both.
 */
export interface ObserveSecond {
  rowLabel: string;
  initial: number[];
}

// ─── H100 part 6: the replication card ───────────────────────────────────────

/**
 * A card figure for one stage of DNA replication (a sequence stage), 112 × 76: `unzip` (the
 * helix opened at a fork by helicase), `pair` (free nucleotides pairing A–T and G–C with each
 * old strand), `join` (DNA polymerase joining the new strand along each) and `copies` (two
 * helices, each one old strand, dark, and one new, lit: semiconservative).
 */
export interface ReplicationCard {
  kind: 'replication';
  stage: 'unzip' | 'pair' | 'join' | 'copies';
}

// ─── H100 part 5: the gene-expression explore figure ─────────────────────────

/**
 * A `geneExpression` scene: the gene's switch (`control`), whether its `signal` is there, and
 * one part ringed (`lit`). A repressor sits on the operator unless its signal (an inducer)
 * pulls it off; an activator binds in front of the promoter only with its signal. The gene is
 * read into mRNA (on) when nothing blocks the polymerase: no repressor bound, or an activator
 * bound (`geneIsOn`).
 */
export interface GeneScene {
  control: 'repressor' | 'activator';
  signal?: boolean;
  lit?: 'promoter' | 'switch' | 'gene' | 'polymerase' | 'protein' | 'signal' | 'mRNA';
}

/** Whether a `geneExpression` scene's gene is read: its signal pulls the repressor off, or puts the activator on. */
export const geneIsOn = (g: GeneScene) => !!g.signal;

// ─── H100 part 12: the dichotomous key ───────────────────────────────────────

/**
 * One couplet of a dichotomous key: a yes-or-no question, and where each answer leads: the
 * index of the next question, or the name the key ends at.
 */
export interface KeyStep {
  question: string;
  yes: number | string;
  no: number | string;
}

/**
 * A `dichotomousKey` scene: `specimen` traces one name's path from the first question, each
 * answer taken lit; `step` rings one question (its index).
 */
export interface KeyScene {
  specimen?: string;
  step?: number;
}

/** A key's rows top to bottom (question then its yes branch, then its no), with depth. */
export function keyRows(steps: KeyStep[]) {
  const rows: {
    node: number | string;
    depth: number;
    answer?: 'Yes' | 'No';
    parent?: number;
  }[] = [];
  const visit = (node: number | string, depth: number, answer?: 'Yes' | 'No', parent?: number) => {
    rows.push({ node, depth, answer, parent });
    if (typeof node !== 'number' || depth > steps.length) return;
    const s = steps[node];
    if (!s) return;
    visit(s.yes, depth + 1, 'Yes', node);
    visit(s.no, depth + 1, 'No', node);
  };
  visit(0, 0);
  return rows;
}

/** The questions and answers from the first question to a name, or undefined if it is not in the key. */
export function keyPath(steps: KeyStep[], name: string) {
  const find = (node: number | string, seen: number[]): [number, 'yes' | 'no'][] | undefined => {
    if (typeof node === 'string') return node === name ? [] : undefined;
    if (seen.includes(node) || !steps[node]) return undefined;
    for (const a of ['yes', 'no'] as const) {
      const rest = find(steps[node]![a], [...seen, node]);
      if (rest) return [[node, a], ...rest];
    }
    return undefined;
  };
  return find(0, []);
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
      return ids([r.count, r.bonds, r.water, r.level]);
    case 'cellDivision':
      return ids([r.diploid, r.haploid, r.chromatids, r.zygote, r.combinations]);
  }
}

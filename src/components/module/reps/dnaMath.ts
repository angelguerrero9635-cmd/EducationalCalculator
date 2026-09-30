/**
 * DNA, RNA and the codon table for the `dnaStrand` picture (H36, group HG), shared with the
 * harness. The table is the standard genetic code, built from its usual compact form: first,
 * second and third base each in the order U, C, A, G.
 */

const ORDER = 'UCAG';
const CODE = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
const NAMES: Record<string, string> = {
  A: 'Ala',
  R: 'Arg',
  N: 'Asn',
  D: 'Asp',
  C: 'Cys',
  Q: 'Gln',
  E: 'Glu',
  G: 'Gly',
  H: 'His',
  I: 'Ile',
  L: 'Leu',
  K: 'Lys',
  M: 'Met',
  F: 'Phe',
  P: 'Pro',
  S: 'Ser',
  T: 'Thr',
  W: 'Trp',
  Y: 'Tyr',
  V: 'Val',
  '*': 'Stop',
};

/** mRNA codon → amino acid (three letters) or "Stop". */
export const CODON_TABLE: Record<string, string> = Object.fromEntries(
  [...CODE].map((aa, i) => [
    ORDER[Math.floor(i / 16)]! + ORDER[Math.floor(i / 4) % 4]! + ORDER[i % 4]!,
    NAMES[aa]!,
  ]),
);

const PAIR: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };
/** The complementary DNA strand. */
export const complement = (dna: string) => [...dna].map((b) => PAIR[b] ?? '?').join('');
/** The mRNA transcribed from a template strand: its complement, with U for T. */
export const transcribe = (template: string) => complement(template).replace(/T/g, 'U');

/** The complete codons of an mRNA and their amino acids, stopping after a stop codon. */
export function translate(mrna: string): { codon: string; aa: string }[] {
  const out: { codon: string; aa: string }[] = [];
  for (let i = 0; i + 3 <= mrna.length; i += 3) {
    const codon = mrna.slice(i, i + 3);
    const aa = CODON_TABLE[codon] ?? '?';
    out.push({ codon, aa });
    if (aa === 'Stop') break;
  }
  return out;
}

const TRANSITION: Record<string, string> = { A: 'G', G: 'A', C: 'T', T: 'C' };

export type Mutation = {
  type: 'substitution' | 'insertion' | 'deletion';
  /** 1 = the first base. */
  at: number;
  base?: string;
};

/** A template strand after a mutation. */
export function mutate(template: string, m: Mutation): string {
  const i = Math.max(0, Math.min(template.length - (m.type === 'insertion' ? 0 : 1), m.at - 1));
  // With no base named: a substitution is the transition (A↔G, C↔T), an insertion an A.
  const b = m.base ?? (m.type === 'substitution' ? (TRANSITION[template[i]!] ?? 'A') : 'A');
  if (m.type === 'substitution') return template.slice(0, i) + b + template.slice(i + 1);
  if (m.type === 'insertion') return template.slice(0, i) + b + template.slice(i);
  return template.slice(0, i) + template.slice(i + 1);
}

/**
 * What a mutation does to the protein. H109: when the template starts with the start codon (its
 * mRNA begins AUG), a change that breaks AUG is `start-lost` (no protein from this start), a
 * substitution turning the stop codon into an amino acid is `stop-lost` (the ribosome reads on),
 * an insertion before base 1 is `before-start` (the start codon is intact, one base later), and an
 * insertion or deletion past the stop codon is `none`.
 */
export type Effect =
  | 'silent'
  | 'missense'
  | 'nonsense'
  | 'frameshift'
  | 'none'
  | 'start-lost'
  | 'stop-lost'
  | 'before-start';

export function effectOf(template: string, m: Mutation): Effect {
  const before = translate(transcribe(template)).map((x) => x.aa);
  const hasStart = before[0] === 'Met';
  const stopAt = before.indexOf('Stop');
  const codon = Math.ceil(m.at / 3) - 1;
  if (m.type !== 'substitution') {
    if (!hasStart) return 'frameshift';
    if (m.type === 'insertion' && m.at <= 1) return 'before-start';
    if (codon === 0 && !transcribe(mutate(template, m)).startsWith('AUG')) return 'start-lost';
    // Wholly past the stop codon: an insertion before a base after it, or a deleted base after it.
    const lastCoding = stopAt >= 0 ? 3 * (stopAt + 1) : Infinity;
    if (m.at > lastCoding) return 'none';
    return 'frameshift';
  }
  const after = translate(transcribe(mutate(template, m))).map((x) => x.aa);
  if (codon >= before.length) return 'none';
  if (hasStart && codon === 0 && after[0] !== 'Met') return 'start-lost';
  if (before[codon] === 'Stop' && after[codon] !== 'Stop') return 'stop-lost';
  if (after[codon] === before[codon]) return 'silent';
  if (after[codon] === 'Stop') return 'nonsense';
  return 'missense';
}

/** Where the ribosome starts on the mutated mRNA: one base on after an insertion before base 1. */
export const readFrom = (effect: Effect | undefined) => (effect === 'before-start' ? 1 : 0);

/**
 * Chargaff's rule: `pairs` base pairs with A (so T) `percentA` of the bases. The pairs top to
 * bottom as [top base, bottom base], or undefined when the percent isn't whole bases.
 */
export function chargaffPairs(percentA: number, pairs: number): [string, string][] | undefined {
  const at = (percentA / 100) * 2 * pairs;
  if (Math.abs(at - Math.round(at)) > 1e-9 || at < 0 || at > pairs) return undefined;
  // A fixed mix: A–T and G–C pairs spread along the strand, each flipped every other time.
  const n = Math.round(at);
  const out: [string, string][] = [];
  let a = 0;
  for (let i = 0; i < pairs; i++) {
    const wantAt = Math.round(((i + 1) * n) / pairs) > a;
    if (wantAt) a++;
    const flip = i % 2 === 1;
    out.push(wantAt ? (flip ? ['T', 'A'] : ['A', 'T']) : flip ? ['C', 'G'] : ['G', 'C']);
  }
  return out;
}

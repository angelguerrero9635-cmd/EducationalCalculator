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

/** What a mutation does to the protein. */
export type Effect = 'silent' | 'missense' | 'nonsense' | 'frameshift' | 'none';

export function effectOf(template: string, m: Mutation): Effect {
  if (m.type !== 'substitution') return 'frameshift';
  const before = translate(transcribe(template)).map((x) => x.aa);
  const after = translate(transcribe(mutate(template, m))).map((x) => x.aa);
  const codon = Math.ceil(m.at / 3) - 1;
  if (codon >= before.length) return 'none';
  if (after[codon] === before[codon]) return 'silent';
  if (after[codon] === 'Stop') return 'nonsense';
  return 'missense';
}

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

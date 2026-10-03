/**
 * HC146 (round 4, group I): a codon strip before and after a point mutation, read with the
 * standard genetic code (the `dnaStrand` table), and what the change does to the protein.
 */
import type { CodonsCard } from '@/data/modules/typesHe4i';

import { CODON_TABLE } from '../reps/dnaMath';

export type CodonEffect = 'silent' | 'missense' | 'nonsense' | 'frameshift';

/** The mRNA after the change (bases A, C, G, U; `at` counts from 1). */
export function mutateMrna(mrna: string, ch: CodonsCard['change']): string {
  const i = ch.at - 1;
  if (ch.type === 'substitution') return mrna.slice(0, i) + ch.base + mrna.slice(i + 1);
  if (ch.type === 'insertion') return mrna.slice(0, i) + ch.base + mrna.slice(i);
  return mrna.slice(0, i) + mrna.slice(i + 1);
}

/** The complete codons of a strip and their amino acids, none after a stop codon. */
export function readStrip(mrna: string): { codon: string; aa?: string }[] {
  const out: { codon: string; aa?: string }[] = [];
  let stopped = false;
  for (let i = 0; i + 3 <= mrna.length; i += 3) {
    const codon = mrna.slice(i, i + 3);
    const aa = stopped ? undefined : (CODON_TABLE[codon] ?? '?');
    out.push({ codon, aa });
    if (aa === 'Stop') stopped = true;
  }
  return out;
}

/** What the change does: a length change not a multiple of 3 shifts the frame. */
export function codonEffect(card: CodonsCard): CodonEffect {
  const after = mutateMrna(card.mrna, card.change);
  if ((after.length - card.mrna.length) % 3 !== 0) return 'frameshift';
  const k = Math.floor((card.change.at - 1) / 3);
  const a = CODON_TABLE[card.mrna.slice(3 * k, 3 * k + 3)];
  const b = CODON_TABLE[after.slice(3 * k, 3 * k + 3)];
  if (a === b) return 'silent';
  return b === 'Stop' ? 'nonsense' : 'missense';
}

/** The effect a sort bin names, from its id or label. */
export function effectOfBin(b: { id: string; label: string }): CodonEffect | undefined {
  const t = `${b.id} ${b.label}`.toLowerCase();
  return (['silent', 'missense', 'nonsense', 'frameshift'] as const).find((e) => t.includes(e));
}

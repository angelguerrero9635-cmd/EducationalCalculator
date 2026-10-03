/**
 * HC144 `pedigree` card figure (college, round 4 group I), 112 × 76: a 2–3 generation family in
 * the standard symbols, drawn with the calculator picture's pieces (`reps/PedigreeHe4i.tsx`)
 * at card size, no numbers. Half-filled symbols are drawn whenever the card has a carrier.
 */
import { PEDIGREE_CARD_H, PEDIGREE_CARD_W, type PedigreeCard } from '@/data/modules/typesHe4i';
import { usePalette } from '@/theme';

import { PedigreeLines } from '../reps/PedigreeHe4i';
import { pedigreeLayout } from '../reps/pedigreeHe4iMath';

export function PedigreeCardHe4i({ f, ink }: { f: PedigreeCard; ink: string }) {
  const c = usePalette();
  const rows = new Set(f.people.map((p) => p.generation)).size;
  const rowH = rows >= 3 ? 26 : 34;
  const top = (PEDIGREE_CARD_H - (rows - 1) * rowH) / 2;
  const lay = pedigreeLayout(f.people, PEDIGREE_CARD_W, { top, rowH, left: 2, right: 2 });
  const size = Math.min(12, lay.slot * 0.55, rowH * 0.42);
  return (
    <PedigreeLines
      people={f.people}
      place={lay.place}
      couples={lay.couples}
      size={size}
      ink={ink}
      paper={c.card}
      carriers={f.people.some((p) => p.carrier)}
      stroke={1.3}
    />
  );
}

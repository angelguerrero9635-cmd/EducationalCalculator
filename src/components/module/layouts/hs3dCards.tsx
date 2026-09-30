/** Round 3 group H3D's card figures (H109, `typesHs3d.ts`): sizes and drawings. */
import type { CardFigure } from '@/data/modules/layouts';
import type { Hs3dCard } from '@/data/modules/typesHs3d';

import { REFLEX_CARD_H, REFLEX_CARD_W, ReflexArcCard } from './reflexArcFigure';

/** A card figure's width and height, when it is one of H3D's. */
export function hs3dCardSize(f: CardFigure): [number, number] | undefined {
  if (f.kind === 'reflexArc') return [REFLEX_CARD_W, REFLEX_CARD_H];
  return undefined;
}

export function Hs3dCardView({ f }: { f: Hs3dCard }) {
  switch (f.kind) {
    case 'reflexArc':
      return <ReflexArcCard lit={f.lit} />;
  }
}

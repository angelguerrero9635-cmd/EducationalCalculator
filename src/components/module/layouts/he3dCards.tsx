/** College round 3 group D's card figures (`typesHe3d.ts`): sizes and drawings. */
import type { CardFigure } from '@/data/modules/layouts';
import type { He3dCard } from '@/data/modules/typesHe3d';

import { CodeCardView, codeCardFigureSize } from './codeTraceFigure';

/** A card figure's width and height, when it is one of group D's. */
export function he3dCardSize(f: CardFigure): [number, number] | undefined {
  if (f.kind === 'code') return codeCardFigureSize(f);
  return undefined;
}

export function He3dCardView({ f, ink }: { f: He3dCard; ink: string }) {
  switch (f.kind) {
    case 'code':
      return <CodeCardView f={f} ink={ink} />;
  }
}

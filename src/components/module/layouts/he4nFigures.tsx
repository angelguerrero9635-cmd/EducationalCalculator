/**
 * The college round 4 group N explore figures (`typesHe4n.ts`), one entry for
 * ExploreLayout.tsx: HC184 `karnaugh`.
 */
import type { Scene } from '@/data/modules/layouts';
import type { He4nFigure } from '@/data/modules/typesHe4n';

import { KarnaughFigureView } from './karnaughFigure';

export function He4nFigureView({ figure, scene }: { figure: He4nFigure; scene: Scene }) {
  switch (figure.kind) {
    case 'karnaugh':
      return <KarnaughFigureView figure={figure} scene={scene.kmap ?? { names: ['A', 'B'] }} />;
  }
}

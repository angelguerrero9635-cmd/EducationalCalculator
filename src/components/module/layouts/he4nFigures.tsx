/**
 * The college round 4 group N explore figures (`typesHe4n.ts`), one entry for
 * ExploreLayout.tsx: HC184 `karnaugh`, HC185 `stateDiagram`, HC187 `dataStructure`.
 */
import type { Scene } from '@/data/modules/layouts';
import type { He4nFigure } from '@/data/modules/typesHe4n';

import { DataStructureFigureView } from './dataStructureFigure';
import { KarnaughFigureView } from './karnaughFigure';
import { StateDiagramFigureView } from './stateDiagramFigure';

export function He4nFigureView({ figure, scene }: { figure: He4nFigure; scene: Scene }) {
  switch (figure.kind) {
    case 'karnaugh':
      return <KarnaughFigureView figure={figure} scene={scene.kmap ?? { names: ['A', 'B'] }} />;
    case 'stateDiagram':
      return <StateDiagramFigureView figure={figure} scene={scene.fsm ?? { input: '' }} />;
    case 'dataStructure':
      return <DataStructureFigureView scene={scene.ds ?? { structure: 'stack' }} />;
  }
}

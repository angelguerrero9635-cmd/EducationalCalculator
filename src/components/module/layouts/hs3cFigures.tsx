/**
 * The group H3C explore figures (earth and space round 3, H110), one case each, so
 * ExploreLayout names them in one place.
 */
import type { ReactNode } from 'react';

import type { Figure, Scene } from '@/data/modules/layouts';
import type { Hs3cFigure } from '@/data/modules/typesHs3c';

import { SectionDrawing } from '../reps/EarthLayers';

export function Hs3cFigureView({
  figure,
  scene,
}: {
  figure: Extract<Figure, Hs3cFigure>;
  scene: Scene;
}): ReactNode {
  switch (figure.kind) {
    case 'earthLayers': {
      // Earth cut open with the scene's station on both halves (as the calculator's section).
      const d = scene.earthSection?.distance;
      return <SectionDrawing delta={Math.max(0, Math.min(180, d ?? 0))} has={d !== undefined} on />;
    }
  }
}

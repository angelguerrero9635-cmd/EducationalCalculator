/**
 * The group HL explore figures (earth and space, H71–H80), one case each, so ExploreLayout names
 * them in one place. Each figure is in its own file.
 */
import type { ReactNode } from 'react';

import type { Figure, Scene } from '@/data/modules/layouts';
import type { HslFigure } from '@/data/modules/typesHsl';

import { LandformsFigure } from './landformsFigure';
import { MohsFigure } from './mohsFigure';

export function HslFigureView({
  figure,
  scene,
}: {
  figure: Extract<Figure, HslFigure>;
  scene: Scene;
}): ReactNode {
  switch (figure.kind) {
    case 'mohsScale':
      return <MohsFigure mohs={scene.mohs ?? {}} />;
    case 'landforms':
      return <LandformsFigure kind={scene.landform?.kind ?? 'shield'} />;
  }
}

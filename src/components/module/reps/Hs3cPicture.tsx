/**
 * The group H3C picture kinds (earth and space round 3, H110), one case each, so
 * RepresentationView names them in one place. Each picture is in its own file.
 */
import type { ReactNode } from 'react';

import type { Hs3cSpec } from '@/data/modules/typesHs3c';

import type { Calculator } from '../useCalculator';
import { CoralSection } from './CoralSection';
import { GeologicClock } from './GeologicClock';
import { HabitableZone } from './HabitableZone';
import { Parallax } from './Parallax';
import { Transit } from './Transit';

export function Hs3cPicture({ spec, calc }: { spec: Hs3cSpec; calc: Calculator }): ReactNode {
  switch (spec.kind) {
    case 'geologicClock':
      return <GeologicClock spec={spec} calc={calc} />;
    case 'coralSection':
      return <CoralSection spec={spec} calc={calc} />;
    case 'transit':
      return <Transit spec={spec} calc={calc} />;
    case 'habitableZone':
      return <HabitableZone spec={spec} calc={calc} />;
    case 'parallax':
      return <Parallax spec={spec} calc={calc} />;
  }
}

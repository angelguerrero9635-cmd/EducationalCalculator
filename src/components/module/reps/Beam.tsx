/**
 * The college `beam` picture (HC1), one component per mode; `index.tsx` sends the kind here.
 */
import type { BeamSpec } from '@/data/modules/typesHe1a';

import type { Calculator } from '../useCalculator';
import { BeamAxial } from './BeamAxial';
import { BeamSpan } from './BeamSpan';

export function Beam({ spec, calc }: { spec: BeamSpec; calc: Calculator }) {
  switch (spec.mode ?? 'beam') {
    case 'axial':
      if (spec.axial) return <BeamAxial spec={spec} calc={calc} />;
      return null;
    default:
      return <BeamSpan spec={spec} calc={calc} />;
  }
}

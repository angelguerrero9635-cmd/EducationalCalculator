/**
 * The college `beam` picture (HC1), one component per mode; `index.tsx` sends the kind here.
 */
import type { BeamSpec } from '@/data/modules/typesHe1a';

import type { Calculator } from '../useCalculator';
import { BeamAxial } from './BeamAxial';
import { BeamColumn, BeamPanel } from './BeamColumn';
import { BeamPlate } from './BeamPlate';
import { BeamSpan } from './BeamSpan';

export function Beam({ spec, calc }: { spec: BeamSpec; calc: Calculator }) {
  switch (spec.mode ?? 'beam') {
    case 'axial':
      return spec.axial ? <BeamAxial spec={spec} calc={calc} /> : null;
    case 'column':
      return spec.column ? <BeamColumn spec={spec} calc={calc} /> : null;
    case 'panel':
      return spec.panel ? <BeamPanel spec={spec} calc={calc} /> : null;
    case 'plate':
      return spec.plate ? <BeamPlate spec={spec} calc={calc} /> : null;
    default:
      return <BeamSpan spec={spec} calc={calc} />;
  }
}

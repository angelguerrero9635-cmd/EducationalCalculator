/**
 * The `fluidSystem` picture (HC6, college fluid mechanics and pipe networks), one case per
 * mode, so RepresentationView names the kind in one place. Each group of modes is in its own
 * file; the relations are in `fluidMath.ts`.
 */
import type { ReactNode } from 'react';

import type { FluidSystemSpec } from '@/data/modules/typesHe1g';

import type { Calculator } from '../useCalculator';
import { FluidBuoyancy, FluidGate, FluidManometer, FluidTank } from './FluidStatics';

export function FluidSystem({
  spec,
  calc,
}: {
  spec: FluidSystemSpec;
  calc: Calculator;
}): ReactNode {
  switch (spec.mode) {
    case 'tank':
      return <FluidTank spec={spec} calc={calc} />;
    case 'manometer':
      return <FluidManometer spec={spec} calc={calc} />;
    case 'gate':
      return <FluidGate spec={spec} calc={calc} />;
    case 'buoyancy':
      return <FluidBuoyancy spec={spec} calc={calc} />;
    default:
      return null;
  }
}

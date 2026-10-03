/**
 * The `fluidSystem` picture (HC6, college fluid mechanics and pipe networks), one case per
 * mode, so RepresentationView names the kind in one place. Each group of modes is in its own
 * file; the relations are in `fluidMath.ts`.
 */
import type { ReactNode } from 'react';

import type { FluidSystemSpec } from '@/data/modules/typesHe1g';

import type { Calculator } from '../useCalculator';
import { FluidJet, FluidPitot, FluidVenturi } from './FluidFlow';
import { FluidModel, FluidPlate } from './FluidLayers';
import { FluidFull, FluidLoop, FluidParallel, FluidPipe } from './FluidPipes';
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
    case 'venturi':
      return <FluidVenturi spec={spec} calc={calc} />;
    case 'pitot':
      return <FluidPitot spec={spec} calc={calc} />;
    case 'jet':
      return <FluidJet spec={spec} calc={calc} />;
    case 'pipe':
      return <FluidPipe spec={spec} calc={calc} />;
    case 'parallel':
      return <FluidParallel spec={spec} calc={calc} />;
    case 'loop':
      return <FluidLoop spec={spec} calc={calc} />;
    case 'full':
      return <FluidFull spec={spec} calc={calc} />;
    case 'plate':
      return <FluidPlate spec={spec} calc={calc} />;
    case 'model':
      return <FluidModel spec={spec} calc={calc} />;
  }
}

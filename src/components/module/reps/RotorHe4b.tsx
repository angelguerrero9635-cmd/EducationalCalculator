/**
 * The round-4 group B options on `rotor` (HC102 `rolling` and `rod`, HC106 `precession`, HC107
 * `plate`); `Hs3aView.tsx` sends a rotor spec here when it sets one of them.
 */
import type { RotorSpec } from '@/data/modules/typesHs3a';

import type { Calculator } from '../useCalculator';
import { RotorPlate } from './RotorPlate';
import { RotorPrecession } from './RotorPrecession';
import { RotorRod } from './RotorRod';
import { RotorRolling } from './RotorRolling';

export function RotorHe4b({ spec, calc }: { spec: RotorSpec; calc: Calculator }) {
  if (spec.rod) return <RotorRod spec={spec} calc={calc} />;
  if (spec.precession) return <RotorPrecession spec={spec} calc={calc} />;
  if (spec.plate) return <RotorPlate spec={spec} calc={calc} />;
  return <RotorRolling spec={spec} calc={calc} />;
}

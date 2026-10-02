/**
 * The college pictures of round 2, group F (typesHe2f.ts): `index.tsx` sends a `freeBody` or
 * `circularMotion` with a college option here.
 */
import type { He2fSpec } from '@/data/modules/typesHe2f';

import type { Calculator } from '../useCalculator';
import { CircularOrbits } from './CircularOrbits';
import { FreeBodyHe } from './FreeBodyHe';

export function He2fView({ spec, calc }: { spec: He2fSpec; calc: Calculator }) {
  if (spec.kind === 'circularMotion') return <CircularOrbits spec={spec} calc={calc} />;
  return <FreeBodyHe spec={spec} calc={calc} />;
}

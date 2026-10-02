/**
 * The college pictures of round 2, group F (typesHe2f.ts): `index.tsx` sends a `freeBody` with a
 * college option here.
 */
import type { He2fSpec } from '@/data/modules/typesHe2f';

import type { Calculator } from '../useCalculator';
import { FreeBodyHe } from './FreeBodyHe';

export function He2fView({ spec, calc }: { spec: He2fSpec; calc: Calculator }) {
  return <FreeBodyHe spec={spec} calc={calc} />;
}

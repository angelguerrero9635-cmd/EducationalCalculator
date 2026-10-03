/**
 * The college pictures of round 4, group F (typesHe4f.ts, earth science): `index.tsx` sends a
 * group-F kind, or a group-F option on a drawn kind, here before the kind's own picture.
 */
import type { He4fSpec } from '@/data/modules/typesHe4f';

import type { Calculator } from '../useCalculator';
import { Ternary } from './Ternary';

export function He4fView({ spec, calc }: { spec: He4fSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'ternary':
      return <Ternary spec={spec} calc={calc} />; // HC116
  }
}

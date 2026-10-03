/**
 * The college pictures of round 4, group G (typesHe4g.ts): `index.tsx` sends a group-G option on
 * an existing kind here, before the kind's own picture.
 */
import type { He4gOptionSpec } from '@/data/modules/typesHe4g';

import type { Calculator } from '../useCalculator';
import { AtmosphereThickness } from './AtmosphereThickness';

export function He4gView({ spec, calc }: { spec: He4gOptionSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'thickness':
      return <AtmosphereThickness spec={spec} calc={calc} />; // HC122
  }
}

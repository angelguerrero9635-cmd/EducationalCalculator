/**
 * The Grades 9–12 round 2 physics pictures of group H2C (H102), one component per kind;
 * `index.tsx` sends each of their kinds here.
 */
import type { Hs2cSpec } from '@/data/modules/typesHs2c';

import type { Calculator } from '../useCalculator';
import { Impulse } from './Impulse';

export function Hs2cView({ spec, calc }: { spec: Hs2cSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'impulse':
      return <Impulse spec={spec} calc={calc} />;
  }
}

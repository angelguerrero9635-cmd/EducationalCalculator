/**
 * The college pictures of round 4, group C (typesHe4c.ts): `index.tsx` sends a group-C option on
 * an existing kind here, before the kind's own picture.
 */
import type { He4cOptionSpec } from '@/data/modules/typesHe4c';

import type { Calculator } from '../useCalculator';
import { ImpulseShape } from './ImpulseShape';
import { MotionPolynomial } from './MotionPolynomial';

export function He4cView({ spec, calc }: { spec: He4cOptionSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'motionGraph':
      return <MotionPolynomial spec={spec} calc={calc} />; // HC99
    case 'impulse':
      return <ImpulseShape spec={spec} calc={calc} />; // HC101
  }
}

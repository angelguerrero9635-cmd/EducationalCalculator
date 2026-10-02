/**
 * The college pictures of round 4, group C (typesHe4c.ts): `index.tsx` sends a group-C option on
 * an existing kind here, before the kind's own picture.
 */
import type { He4cOptionSpec } from '@/data/modules/typesHe4c';

import type { Calculator } from '../useCalculator';
import { ImpulseShape } from './ImpulseShape';
import { Compton } from './Compton';
import { MotionPolynomial } from './MotionPolynomial';
import { PendulumRod } from './PendulumRod';
import { SlopeSlab } from './SlopeSlab';

export function He4cView({ spec, calc }: { spec: He4cOptionSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'motionGraph':
      return <MotionPolynomial spec={spec} calc={calc} />; // HC99
    case 'impulse':
      return <ImpulseShape spec={spec} calc={calc} />; // HC101
    case 'pendulum':
      return <PendulumRod spec={spec} calc={calc} />; // HC103
    case 'photoelectric':
      return <Compton spec={spec} calc={calc} />; // HC105
    case 'freeBody':
      return <SlopeSlab spec={spec} calc={calc} />; // HC118
  }
}

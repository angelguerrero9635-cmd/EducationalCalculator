/**
 * The Grades 9–12 physics pictures of group HK (H59–H70), one component per kind; `index.tsx`
 * sends each of their kinds here.
 */
import type { HskSpec } from '@/data/modules/typesHsk';

import type { Calculator } from '../useCalculator';
import { CircularMotion } from './CircularMotion';
import { Collision } from './Collision';
import { FreeBody } from './FreeBody';
import { HeatEngine } from './HeatEngine';
import { Projectile } from './Projectile';
import { SimpleMachine } from './SimpleMachine';

export function HskView({ spec, calc }: { spec: HskSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'projectile':
      return <Projectile spec={spec} calc={calc} />;
    case 'freeBody':
      return <FreeBody spec={spec} calc={calc} />;
    case 'circularMotion':
      return <CircularMotion spec={spec} calc={calc} />;
    case 'collision':
      return <Collision spec={spec} calc={calc} />;
    case 'simpleMachine':
      return <SimpleMachine spec={spec} calc={calc} />;
    case 'heatEngine':
      return <HeatEngine spec={spec} calc={calc} />;
  }
}

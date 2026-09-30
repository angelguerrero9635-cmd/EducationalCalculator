/**
 * The Grades 9–12 physics pictures of group HK (H59–H70), one component per kind; `index.tsx`
 * sends each of their kinds here.
 */
import type { HskSpec } from '@/data/modules/typesHsk';

import type { Calculator } from '../useCalculator';
import { Projectile } from './Projectile';

export function HskView({ spec, calc }: { spec: HskSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'projectile':
      return <Projectile spec={spec} calc={calc} />;
  }
}

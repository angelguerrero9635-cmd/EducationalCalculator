/**
 * The college round 4 group N calculator pictures (`typesHe4n.ts`), one entry for
 * reps/index.tsx: HC184 `karnaugh`.
 */
import type { He4nSpec } from '@/data/modules/typesHe4n';

import type { Calculator } from '../useCalculator';
import { Karnaugh } from './Karnaugh';

export function He4nView({ spec, calc }: { spec: He4nSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'karnaugh':
      return <Karnaugh spec={spec} calc={calc} />;
  }
}

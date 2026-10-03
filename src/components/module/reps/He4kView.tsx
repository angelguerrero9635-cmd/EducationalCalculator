/**
 * Group K's college kinds (round 4, typesHe4k.ts), one line in `RepresentationView`:
 * HC160 `dialyzer`.
 */
import type { He4kSpec } from '@/data/modules/typesHe4k';

import type { Calculator } from '../useCalculator';
import { Dialyzer } from './Dialyzer';

export function He4kView({ spec, calc }: { spec: He4kSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'dialyzer':
      return <Dialyzer spec={spec} calc={calc} />; // HC160
  }
}

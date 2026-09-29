/**
 * The Grades 9–12 group I pictures (chemistry, `typesHsi.ts`), one component per kind; called
 * from `RepresentationView` so the shared switch takes one line per kind.
 */
import type { HsiSpec } from '@/data/modules/typesHsi';

import type { Calculator } from '../useCalculator';
import { AtomModel } from './AtomModel';
import { UnitChain } from './UnitChain';

export function HsiRep({ spec, calc }: { spec: HsiSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'unitChain':
      return <UnitChain spec={spec} calc={calc} />;
    case 'atomModel':
      return <AtomModel spec={spec} calc={calc} />;
  }
}

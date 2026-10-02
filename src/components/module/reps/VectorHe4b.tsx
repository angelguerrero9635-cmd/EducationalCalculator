/**
 * The round-4 group B options on `vectorDiagram` (HC96 `project`, HC100 `masses`, HC108
 * `cone`, HC171 `forces`); `index.tsx` sends a spec here when it sets one of them.
 */
import type { VectorDiagramSpec } from '@/data/modules/typesHsd';

import type { Calculator } from '../useCalculator';
import { VectorForces } from './VectorForces';
import { VectorMasses } from './VectorMasses';
import { VectorProject } from './VectorProject';

export function VectorHe4b({ spec, calc }: { spec: VectorDiagramSpec; calc: Calculator }) {
  if (spec.masses) return <VectorMasses spec={spec} calc={calc} />;
  if (spec.forces) return <VectorForces spec={spec} calc={calc} />;
  return <VectorProject spec={spec} calc={calc} />;
}

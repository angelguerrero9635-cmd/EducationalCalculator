/**
 * The `chemDiagram` modes of Grades 9–12 round 3 (group H3E, H108): a phase diagram, a
 * concentration–time curve and a galvanic cell, each in its own file.
 */
import type { ChemDiagramHs3eSpec } from '@/data/modules/typesHs3e';

import type { Calculator } from '../useCalculator';
import { ChemPhase } from './ChemPhase';
import { ChemRate } from './ChemRate';

export function ChemDiagramHs3e({ spec, calc }: { spec: ChemDiagramHs3eSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'phase':
      return <ChemPhase spec={spec} calc={calc} />;
    case 'rate':
      return <ChemRate spec={spec} calc={calc} />;
    default:
      return null;
  }
}

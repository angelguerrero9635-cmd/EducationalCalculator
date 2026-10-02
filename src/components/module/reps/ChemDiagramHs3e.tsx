/**
 * The `chemDiagram` modes of Grades 9–12 round 3 (group H3E, H108): a phase diagram, a
 * concentration–time curve and a galvanic cell, each in its own file.
 */
import type { ChemDiagramHs3eSpec } from '@/data/modules/typesHs3e';

import type { Calculator } from '../useCalculator';
import { ChemCell } from './ChemCell';
import { ChemPhase } from './ChemPhase';
import { ChemPhaseSubstance } from './ChemPhaseSubstance';
import { ChemRate } from './ChemRate';
import { ChemRateHe2k } from './ChemRateHe2k';

export function ChemDiagramHs3e({ spec, calc }: { spec: ChemDiagramHs3eSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'phase':
      if (spec.substance) return <ChemPhaseSubstance spec={spec} calc={calc} />;
      return <ChemPhase spec={spec} calc={calc} />;
    case 'rate':
      if (!('times' in spec)) return <ChemRateHe2k spec={spec} calc={calc} />;
      return <ChemRate spec={spec} calc={calc} />;
    case 'cell':
      return <ChemCell spec={spec} calc={calc} />;
  }
}

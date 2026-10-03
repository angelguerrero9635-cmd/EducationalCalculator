/** Group H2E's calculator pictures (`typesHs2e.ts`), one case in `reps/index.tsx`. */
import type { Hs2eSpec } from '@/data/modules/typesHs2e';

import type { Calculator } from '../useCalculator';
import { ChromosomeCount } from './ChromosomeCount';
import { DivisionContentHe4i } from './DivisionContentHe4i';
import { Macromolecules } from './Macromolecules';

export function Hs2eView({ spec, calc }: { spec: Hs2eSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'macromolecules':
      return <Macromolecules spec={spec} calc={calc} />;
    case 'cellDivision':
      if (spec.content) return <DivisionContentHe4i spec={spec} calc={calc} />; // HC142
      return <ChromosomeCount spec={spec} calc={calc} />;
  }
}

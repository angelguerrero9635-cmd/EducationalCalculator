/**
 * The college round 4 group N calculator pictures (`typesHe4n.ts`), one entry for
 * reps/index.tsx: HC184 `karnaugh`, HC186 `pipelineDiagram`.
 */
import type { He4nSpec } from '@/data/modules/typesHe4n';

import type { Calculator } from '../useCalculator';
import { Datapath } from './Datapath';
import { Karnaugh } from './Karnaugh';
import { MemoryMap } from './MemoryMap';
import { PipelineDiagram } from './PipelineDiagram';
import { SearchRanges } from './SearchRanges';

export function He4nView({ spec, calc }: { spec: He4nSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'karnaugh':
      return <Karnaugh spec={spec} calc={calc} />;
    case 'pipelineDiagram':
      return <PipelineDiagram spec={spec} calc={calc} />;
    case 'dataStructure':
      return <SearchRanges spec={spec} calc={calc} />;
    case 'memoryMap':
      return <MemoryMap spec={spec} calc={calc} />;
    case 'datapath':
      return <Datapath spec={spec} calc={calc} />;
  }
}

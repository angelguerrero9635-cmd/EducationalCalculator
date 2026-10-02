/**
 * Group E's college function-graph families (round 4, typesHe4e.ts): HC148's qPCR amplification
 * curves with their threshold, HC179's Fourier partial sum with its stems. Dispatched from
 * `reps/index.tsx` ahead of FunctionGraph, which never draws these families.
 */
import type { FunctionGraphSpec } from '@/data/modules/typesFunctionGraph';

import type { Calculator } from '../useCalculator';
import { AmplificationHe4e } from './AmplificationHe4e';
import { FourierHe4e } from './FourierHe4e';

export function FunctionGraphHe4e({ spec, calc }: { spec: FunctionGraphSpec; calc: Calculator }) {
  if (spec.family === 'fourier') return <FourierHe4e spec={spec} calc={calc} />;
  return <AmplificationHe4e spec={spec} calc={calc} />;
}

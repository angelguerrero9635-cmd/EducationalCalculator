/**
 * Group E's college normal curves (round 4, typesHe4e.ts): HC114's t curve with its interval,
 * HC152's response to selection. Dispatched from `reps/index.tsx`.
 */
import type { NormalCurveSpec } from '@/data/modules/typesHsb';

import type { Calculator } from '../useCalculator';
import { NormalCurveShiftHe4e } from './NormalCurveShiftHe4e';
import { NormalCurveTHe4e } from './NormalCurveTHe4e';

export function NormalCurveHe4e({ spec, calc }: { spec: NormalCurveSpec; calc: Calculator }) {
  if (spec.shift) return <NormalCurveShiftHe4e spec={spec} calc={calc} />;
  return <NormalCurveTHe4e spec={spec} calc={calc} />;
}

/**
 * The Grades 9–12 group J pictures (chemistry, H51–H57), by kind: one case in `reps/index.tsx`
 * sends each of them here.
 */
import type { HsjSpec } from '@/data/modules/typesHsj';

import type { Calculator } from '../useCalculator';
import { DecayChart } from './DecayChart';
import { EnergyProfile } from './EnergyProfile';
import { EquilibriumChart } from './EquilibriumChart';
import { GasPiston } from './GasPiston';
import { PhScale } from './PhScale';

export function HsjView({ spec, calc }: { spec: HsjSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'gasPiston':
      return <GasPiston spec={spec} calc={calc} />;
    case 'energyProfile':
      return <EnergyProfile spec={spec} calc={calc} />;
    case 'equilibriumChart':
      return <EquilibriumChart spec={spec} calc={calc} />;
    case 'phScale':
      return <PhScale spec={spec} calc={calc} />;
    case 'decayChart':
      return <DecayChart spec={spec} calc={calc} />;
  }
}

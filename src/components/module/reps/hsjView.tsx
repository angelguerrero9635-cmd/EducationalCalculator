/**
 * The Grades 9–12 group J pictures (chemistry, H51–H57), by kind: one case in `reps/index.tsx`
 * sends each of them here.
 */
import type { HsjSpec } from '@/data/modules/typesHsj';

import type { Calculator } from '../useCalculator';
import { DecayChart } from './DecayChart';
import { EnergyLadder } from './EnergyLadder';
import { EnergyProfile } from './EnergyProfile';
import { EquilibriumChart } from './EquilibriumChart';
import { GasFirstLaw } from './GasFirstLaw';
import { GasMixture } from './GasMixture';
import { GasPiston } from './GasPiston';
import { GasPistonPv } from './GasPistonPv';
import { GasPistonReal } from './GasPistonReal';
import { PhScale } from './PhScale';

export function HsjView({ spec, calc }: { spec: HsjSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'gasPiston':
      if (spec.energy) return <GasFirstLaw spec={spec} calc={calc} />;
      if (spec.mixture) return <GasMixture spec={spec} calc={calc} />;
      if (spec.pv) return <GasPistonPv spec={spec} calc={calc} />; // HC43
      if (spec.real) return <GasPistonReal spec={spec} calc={calc} />; // HC43
      return <GasPiston spec={spec} calc={calc} />;
    case 'energyProfile':
      return spec.mode === 'ladder' ? (
        <EnergyLadder spec={spec} calc={calc} />
      ) : (
        <EnergyProfile spec={spec} calc={calc} />
      );
    case 'equilibriumChart':
      return <EquilibriumChart spec={spec} calc={calc} />;
    case 'phScale':
      return <PhScale spec={spec} calc={calc} />;
    case 'decayChart':
      return <DecayChart spec={spec} calc={calc} />;
  }
}

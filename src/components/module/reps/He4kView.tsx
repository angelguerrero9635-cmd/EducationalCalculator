/**
 * Group K's college kinds (round 4, typesHe4k.ts), one line in `RepresentationView`:
 * HC160 `dialyzer`, HC161 `attenuation`, HC162 `scaffold`,
 * HC163 `ligandGrid`, HC164 `bioreactor`,
 * HC176 `settlingTank`, HC177 `plume`.
 */
import type { He4kSpec } from '@/data/modules/typesHe4k';

import type { Calculator } from '../useCalculator';
import { Attenuation } from './Attenuation';
import { Bioreactor } from './Bioreactor';
import { Dialyzer } from './Dialyzer';
import { LigandGrid } from './LigandGrid';
import { Plume } from './Plume';
import { Scaffold } from './Scaffold';
import { SettlingTank } from './SettlingTank';

export function He4kView({ spec, calc }: { spec: He4kSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'dialyzer':
      return <Dialyzer spec={spec} calc={calc} />; // HC160
    case 'attenuation':
      return <Attenuation spec={spec} calc={calc} />; // HC161
    case 'scaffold':
      return <Scaffold spec={spec} calc={calc} />; // HC162
    case 'ligandGrid':
      return <LigandGrid spec={spec} calc={calc} />; // HC163
    case 'bioreactor':
      return <Bioreactor spec={spec} calc={calc} />; // HC164
    case 'settlingTank':
      return <SettlingTank spec={spec} calc={calc} />; // HC176
    case 'plume':
      return <Plume spec={spec} calc={calc} />; // HC177
  }
}

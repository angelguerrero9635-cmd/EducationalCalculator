/**
 * The college pictures of round 4, group G (typesHe4g.ts): `index.tsx` sends a group-G option on
 * an existing kind here, before the kind's own picture.
 */
import type { He4gOptionSpec } from '@/data/modules/typesHe4g';

import type { Calculator } from '../useCalculator';
import { AirParcel } from './AirParcel';
import { AtmosphereAdiabat } from './AtmosphereAdiabat';
import { AtmosphereSaturation } from './AtmosphereSaturation';
import { AtmosphereThickness } from './AtmosphereThickness';
import { BalanceLayer } from './BalanceLayer';
import { RaySpeeds } from './RaySpeeds';

export function He4gView({ spec, calc }: { spec: He4gOptionSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'thickness':
      return <AtmosphereThickness spec={spec} calc={calc} />; // HC122
    case 'adiabat':
      return <AtmosphereAdiabat spec={spec} calc={calc} />; // HC123
    case 'saturation':
      return <AtmosphereSaturation spec={spec} calc={calc} />; // HC123
    case 'parcel':
      return <AirParcel spec={spec} calc={calc} />; // HC124: the page's lapse rates
    case 'balance':
      return <BalanceLayer spec={spec} calc={calc} />; // HC125
    case 'refraction':
      return <RaySpeeds spec={spec} calc={calc} />; // HC130
  }
}

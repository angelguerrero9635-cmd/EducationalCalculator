/**
 * The Grades 9–12 physics pictures of group HK (H59–H70), one component per kind; `index.tsx`
 * sends each of their kinds here.
 */
import type { HskSpec } from '@/data/modules/typesHsk';

import type { Calculator } from '../useCalculator';
import { ChargePlates } from './ChargePlates';
import { Charges } from './Charges';
import { ChargesHe2e } from './ChargesHe2e';
import { isHe2eCharges } from '@/data/modules/typesHe2e';
import { ChargesPotential } from './ChargesPotential';
import { PlatesLaunch } from './PlatesLaunch';
import { CircularMotion } from './CircularMotion';
import { CircularSatellite } from './CircularSatellite';
import { Collision } from './Collision';
import { FreeBody } from './FreeBody';
import { HeatEngine } from './HeatEngine';
import { Induction } from './Induction';
import { Projectile } from './Projectile';
import { RayLens } from './RayLens';
import { RayRefraction, RaySlits, RayTelescope } from './RayOptics';
import { Seesaw } from './Seesaw';
import { SimpleMachine } from './SimpleMachine';

export function HskView({ spec, calc }: { spec: HskSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'projectile':
      return <Projectile spec={spec} calc={calc} />;
    case 'freeBody':
      return <FreeBody spec={spec} calc={calc} />;
    case 'circularMotion':
      if (spec.mode === 'satellite') return <CircularSatellite spec={spec} calc={calc} />;
      return <CircularMotion spec={spec} calc={calc} />;
    case 'collision':
      return <Collision spec={spec} calc={calc} />;
    case 'simpleMachine':
      if (spec.seesaw && spec.machine === 'lever') return <Seesaw spec={spec} calc={calc} />;
      return <SimpleMachine spec={spec} calc={calc} />;
    case 'heatEngine':
      return <HeatEngine spec={spec} calc={calc} />;
    case 'charges':
      if (isHe2eCharges(spec)) return <ChargesHe2e spec={spec} calc={calc} />; // HC29
      if (spec.mode === 'plates')
        return spec.launch ? (
          <PlatesLaunch spec={spec} calc={calc} />
        ) : (
          <ChargePlates spec={spec} calc={calc} />
        );
      if (spec.equipotentials) return <ChargesPotential spec={spec} calc={calc} />;
      return <Charges spec={spec} calc={calc} />;
    case 'induction':
      return <Induction spec={spec} calc={calc} />;
    case 'rayDiagram':
      switch (spec.mode) {
        case 'lens':
        case 'mirror':
          return <RayLens spec={spec} calc={calc} />;
        case 'refraction':
          return <RayRefraction spec={spec} calc={calc} />;
        case 'doubleSlit':
          return <RaySlits spec={spec} calc={calc} />;
        case 'telescope':
          return <RayTelescope spec={spec} calc={calc} />;
      }
      return null;
  }
}

/**
 * The group HL calculator pictures (earth and space, H71–H80), one case each, so
 * RepresentationView names them in one place. Each picture is in its own file.
 */
import type { ReactNode } from 'react';

import type { HslSpec } from '@/data/modules/typesHsl';

import type { Calculator } from '../useCalculator';
import { EarthLayers } from './EarthLayers';
import { OceanProfile } from './OceanProfile';
import { AtmosphereLayers } from './AtmosphereLayers';
import { HrDiagram } from './HrDiagram';
import { ExpandingUniverse } from './ExpandingUniverse';
import { RockLayersDated } from './RockLayersDated';

export function HslPicture({ spec, calc }: { spec: HslSpec; calc: Calculator }): ReactNode {
  switch (spec.kind) {
    case 'earthLayers':
      return <EarthLayers spec={spec} calc={calc} />;
    case 'oceanProfile':
      return <OceanProfile spec={spec} calc={calc} />;
    case 'atmosphereLayers':
      return <AtmosphereLayers spec={spec} calc={calc} />;
    case 'hrDiagram':
      return <HrDiagram spec={spec} calc={calc} />;
    case 'expandingUniverse':
      return <ExpandingUniverse spec={spec} calc={calc} />;
    case 'rockLayers':
      return <RockLayersDated spec={spec} calc={calc} />;
  }
}

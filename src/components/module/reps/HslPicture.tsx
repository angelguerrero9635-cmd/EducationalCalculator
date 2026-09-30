/**
 * The group HL calculator pictures (earth and space, H71–H80), one case each, so
 * RepresentationView names them in one place. Each picture is in its own file.
 */
import type { ReactNode } from 'react';

import type { HslSpec } from '@/data/modules/typesHsl';

import type { Calculator } from '../useCalculator';
import { EarthLayers } from './EarthLayers';
import { OceanProfile } from './OceanProfile';
import { RockLayersDated } from './RockLayersDated';

export function HslPicture({ spec, calc }: { spec: HslSpec; calc: Calculator }): ReactNode {
  switch (spec.kind) {
    case 'earthLayers':
      return <EarthLayers spec={spec} calc={calc} />;
    case 'oceanProfile':
      return <OceanProfile spec={spec} calc={calc} />;
    case 'rockLayers':
      return <RockLayersDated spec={spec} calc={calc} />;
  }
}

/**
 * The college pictures of round 4, group H (typesHe4h.ts): `index.tsx` sends a group-H kind or
 * `sample` option here, before the kinds it already knows.
 */
import type { He4hSpec } from '@/data/modules/typesHe4h';

import type { Calculator } from '../useCalculator';
import { Catchment } from './Catchment';
import { ContourMap } from './ContourMap';
import { RasterGrid } from './RasterGrid';

export function He4hView({ spec, calc }: { spec: He4hSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'catchment':
      return <Catchment spec={spec} calc={calc} />; // HC129
    case 'contourMap':
      return <ContourMap spec={spec} calc={calc} />; // HC133
    case 'rasterGrid':
      return <RasterGrid spec={spec} calc={calc} />; // HC134
  }
}

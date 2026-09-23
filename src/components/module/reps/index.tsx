import type { Representation } from '@/data/modules';

import type { Calculator } from '../useCalculator';
import { Bars } from './Bars';
import { CircleDiagram } from './CircleDiagram';
import { ForceDiagram } from './ForceDiagram';
import { Grid100 } from './Grid100';
import { NumberLine } from './NumberLine';
import { Plot } from './Plot';
import { RectangleDiagram } from './Rectangle';
import { RightTriangle } from './RightTriangle';
import { PictureGraph } from './PictureGraph';
import { SeriesCircuit } from './SeriesCircuit';
import { TenFrame } from './TenFrame';
import { ValueTable } from './ValueTable';
import { Waterfall } from './Waterfall';

/** Section title for each representation kind. */
export const representationTitle = (r: Representation) =>
  r.kind === 'table'
    ? 'Table'
    : ['plot', 'bars', 'pictureGraph', 'waterfall'].includes(r.kind)
      ? 'Chart'
      : 'Diagram';

export function RepresentationView({ spec, calc }: { spec: Representation; calc: Calculator }) {
  switch (spec.kind) {
    case 'numberLine':
      return <NumberLine spec={spec} calc={calc} />;
    case 'bars':
      return <Bars spec={spec} calc={calc} />;
    case 'rectangle':
      return <RectangleDiagram spec={spec} calc={calc} />;
    case 'grid100':
      return <Grid100 spec={spec} calc={calc} />;
    case 'circle':
      return <CircleDiagram spec={spec} calc={calc} />;
    case 'rightTriangle':
      return <RightTriangle spec={spec} calc={calc} />;
    case 'plot':
      return <Plot spec={spec} calc={calc} />;
    case 'table':
      return <ValueTable spec={spec} calc={calc} />;
    case 'force':
      return <ForceDiagram spec={spec} calc={calc} />;
    case 'tenFrame':
      return <TenFrame spec={spec} calc={calc} />;
    case 'pictureGraph':
      return <PictureGraph spec={spec} calc={calc} />;
    case 'waterfall':
      return <Waterfall spec={spec} calc={calc} />;
    case 'seriesCircuit':
      return <SeriesCircuit spec={spec} calc={calc} />;
  }
}

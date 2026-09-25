import type { Representation } from '@/data/modules';

import type { Calculator } from '../useCalculator';
import { Balance } from './Balance';
import { BaseTen } from './BaseTen';
import { Clock } from './Clock';
import { Coins } from './Coins';
import { CompareRows } from './CompareRows';
import { CubeTrains } from './CubeTrains';
import { DotArray } from './DotArray';
import { HundredChart } from './HundredChart';
import { Hops } from './Hops';
import { EqualGroups } from './EqualGroups';
import { LineUp } from './LineUp';
import { NumberBond } from './NumberBond';
import { PatternBlocks } from './PatternBlocks';
import { Prism } from './Prism';
import { PartnerList } from './PartnerList';
import { Solid } from './Solid';
import { CoinRow } from './CoinRow';
import { DotSet } from './DotSet';
import { Tally } from './Tally';
import { Pairs } from './Pairs';
import { Partition } from './Partition';
import { PolygonShape } from './PolygonShape';
import { Ruler } from './Ruler';
import { LinePlot } from './LinePlot';
import { SkipCount } from './SkipCount';
import { Tape } from './Tape';
import { UnitTiles } from './UnitTiles';
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
import { Beaker } from './Beaker';
import { FractionBars } from './FractionBars';
import { FractionLine } from './FractionLine';
import { Quadrilateral } from './Quadrilateral';
import { Rounding } from './Rounding';
import { Scale } from './Scale';
import { Timeline } from './Timeline';

/** Section title for each representation kind. */
export const representationTitle = (r: Representation) =>
  r.kind === 'table'
    ? 'Table'
    : ['plot', 'bars', 'pictureGraph', 'waterfall', 'hundredChart', 'linePlot', 'tally'].includes(
          r.kind,
        )
      ? 'Chart'
      : 'Diagram';

export function RepresentationView({ spec, calc }: { spec: Representation; calc: Calculator }) {
  switch (spec.kind) {
    case 'tape':
      return <Tape spec={spec} calc={calc} />;
    case 'rounding':
      return <Rounding spec={spec} calc={calc} />;
    case 'fractionLine':
      return <FractionLine spec={spec} calc={calc} />;
    case 'fractionBars':
      return <FractionBars spec={spec} calc={calc} />;
    case 'timeline':
      return <Timeline spec={spec} calc={calc} />;
    case 'scale':
      return <Scale spec={spec} calc={calc} />;
    case 'beaker':
      return <Beaker spec={spec} calc={calc} />;
    case 'quadrilateral':
      return <Quadrilateral spec={spec} calc={calc} />;
    case 'linePlot':
      return <LinePlot spec={spec} calc={calc} />;
    case 'numberLine':
      return <NumberLine spec={spec} calc={calc} />;
    case 'hops':
      return <Hops spec={spec} calc={calc} />;
    case 'numberBond':
      return <NumberBond spec={spec} calc={calc} />;
    case 'patternBlocks':
      return <PatternBlocks spec={spec} calc={calc} />;
    case 'lineUp':
      return <LineUp spec={spec} calc={calc} />;
    case 'equalGroups':
      return <EqualGroups spec={spec} calc={calc} />;
    case 'prism':
      return <Prism spec={spec} calc={calc} />;
    case 'solid':
      return <Solid spec={spec} calc={calc} />;
    case 'dotSet':
      return <DotSet spec={spec} calc={calc} />;
    case 'tally':
      return <Tally spec={spec} calc={calc} />;
    case 'coinRow':
      return <CoinRow spec={spec} calc={calc} />;
    case 'partnerList':
      return <PartnerList spec={spec} calc={calc} />;
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
    case 'hundredChart':
      return <HundredChart spec={spec} calc={calc} />;
    case 'compareRows':
      return <CompareRows spec={spec} calc={calc} />;
    case 'polygon':
      return <PolygonShape spec={spec} calc={calc} />;
    case 'balance':
      return <Balance spec={spec} calc={calc} />;
    case 'baseTen':
      return <BaseTen spec={spec} calc={calc} />;
    case 'unitTiles':
      return <UnitTiles spec={spec} calc={calc} />;
    case 'clock':
      return <Clock spec={spec} calc={calc} />;
    case 'partition':
      return <Partition spec={spec} calc={calc} />;
    case 'skipCount':
      return <SkipCount spec={spec} calc={calc} />;
    case 'pairs':
      return <Pairs spec={spec} calc={calc} />;
    case 'array':
      return <DotArray spec={spec} calc={calc} />;
    case 'ruler':
      return <Ruler spec={spec} calc={calc} />;
    case 'coins':
      return <Coins spec={spec} calc={calc} />;
    case 'cubeTrains':
      return <CubeTrains spec={spec} calc={calc} />;
    case 'seriesCircuit':
      return <SeriesCircuit spec={spec} calc={calc} />;
  }
}

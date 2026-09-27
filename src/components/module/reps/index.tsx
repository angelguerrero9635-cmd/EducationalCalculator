import type { Representation } from '@/data/modules';

import type { Calculator } from '../useCalculator';
import { Balance } from './Balance';
import { Hanger } from './Hanger';
import { RatioTape } from './RatioTape';
import { IntegerLine } from './IntegerLine';
import { PercentBar } from './PercentBar';
import { RatioTable } from './RatioTable';
import { FractionFit } from './FractionFit';
import { Venn } from './Venn';
import { BaseHeight } from './BaseHeight';
import { Net } from './Net';
import { CrossSection } from './CrossSection';
import { DotPlot } from './DotPlot';
import { DotPlotPair } from './DotPlotPair';
import { Sample } from './Sample';
import { Spinner } from './Spinner';
import { DiceGrid } from './DiceGrid';
import { TreeDiagram } from './TreeDiagram';
import { Marbles } from './Marbles';
import { EnergyPyramid } from './EnergyPyramid';
import { Generations } from './Generations';
import { FieldOfView } from './FieldOfView';
import { GradCylinder } from './GradCylinder';
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
import { TapeEquation } from './TapeEquation';
import { UnitTiles } from './UnitTiles';
import { Bars } from './Bars';
import { CircleDiagram } from './CircleDiagram';
import { ScaleCopy } from './ScaleCopy';
import { ForceDiagram } from './ForceDiagram';
import { Grid100 } from './Grid100';
import { NumberLine } from './NumberLine';
import { Plot } from './Plot';
import { LinearFunction, LineSystem } from './Lines';
import { FunctionMachine } from './FunctionMachine';
import { Mapping } from './Mapping';
import { Transformation } from './Transformation';
import { RectangleDiagram } from './Rectangle';
import { Rectilinear } from './Rectilinear';
import { AreaModel } from './AreaModel';
import { Angles } from './Angles';
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
import { ShareWholes } from './ShareWholes';
import { Scale } from './Scale';
import { Timeline } from './Timeline';
import { Thermometers } from './Thermometers';
import { RockLayers } from './RockLayers';
import { Pushes } from './Pushes';
import { DoubleNumberLine } from './DoubleNumberLine';
import { CoordinatePlane } from './CoordinatePlane';
import { BoxPlot } from './BoxPlot';
import { PieChart } from './PieChart';
import { FractionArea } from './FractionArea';
import { UnitCubes } from './UnitCubes';
import { PlaceValueChart } from './PlaceValueChart';
import { FactorPairs } from './FactorPairs';
import { FactorTree } from './FactorTree';
import { Protractor } from './Protractor';
import { Wave } from './Wave';
import { PunnettSquare } from './PunnettSquare';
import { GrassSlope } from './GrassSlope';
import { Flashlights } from './Flashlights';
import { LeafCount } from './LeafCount';
import { SignTable } from './SignTable';
import { ZeroPairs } from './ZeroPairs';
import { CurvedSolid } from './CurvedSolid';
import { Scatter } from './Scatter';
import { RootSquare } from './RootSquare';
import { FactorRows } from './FactorRows';
import { PowerScale } from './PowerScale';
import { EquationBalance } from './EquationBalance';
import { Molecules } from './Molecules';
import { Reaction } from './Reaction';
import { HeatingCurve } from './HeatingCurve';
import { PeriodicTable } from './PeriodicTable';

/** Section title for each representation kind. */
export const representationTitle = (r: Representation) =>
  r.kind === 'table'
    ? 'Table'
    : [
          'plot',
          'bars',
          'pictureGraph',
          'waterfall',
          'hundredChart',
          'linePlot',
          'tally',
          'boxPlot',
          'pieChart',
          'coordinatePlane',
          'placeValueChart',
          'scatter',
          'linearFunction',
          'lineSystem',
          'heatingCurve',
        ].includes(r.kind)
      ? 'Chart'
      : 'Diagram';

export function RepresentationView({ spec, calc }: { spec: Representation; calc: Calculator }) {
  switch (spec.kind) {
    case 'linearFunction':
      return <LinearFunction spec={spec} calc={calc} />;
    case 'lineSystem':
      return <LineSystem spec={spec} calc={calc} />;
    case 'functionMachine':
      return <FunctionMachine spec={spec} calc={calc} />;
    case 'mapping':
      return <Mapping spec={spec} calc={calc} />;
    case 'transformation':
      return <Transformation spec={spec} calc={calc} />;
    case 'tape':
      return 'ratio' in spec ? (
        <RatioTape spec={spec} calc={calc} />
      ) : 'equation' in spec ? (
        <TapeEquation spec={spec} calc={calc} />
      ) : (
        <Tape spec={spec} calc={calc} />
      );
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
    case 'rectilinear':
      return <Rectilinear spec={spec} calc={calc} />;
    case 'areaModel':
      return <AreaModel spec={spec} calc={calc} />;
    case 'angles':
      return <Angles spec={spec} calc={calc} />;
    case 'thermometers':
      return <Thermometers spec={spec} calc={calc} />;
    case 'grassSlope':
      return <GrassSlope spec={spec} calc={calc} />;
    case 'flashlights':
      return <Flashlights spec={spec} calc={calc} />;
    case 'leafCount':
      return <LeafCount spec={spec} calc={calc} />;
    case 'curvedSolid':
      return <CurvedSolid spec={spec} calc={calc} />;
    case 'scatter':
      return <Scatter spec={spec} calc={calc} />;
    case 'rootSquare':
      return <RootSquare spec={spec} calc={calc} />;
    case 'factorRows':
      return <FactorRows spec={spec} calc={calc} />;
    case 'powerScale':
      return <PowerScale spec={spec} calc={calc} />;
    case 'equationBalance':
      return <EquationBalance spec={spec} calc={calc} />;
    case 'molecules':
      return <Molecules spec={spec} calc={calc} />;
    case 'reaction':
      return <Reaction spec={spec} calc={calc} />;
    case 'heatingCurve':
      return <HeatingCurve spec={spec} calc={calc} />;
    case 'periodicTable':
      return <PeriodicTable spec={spec} calc={calc} />;
    case 'rockLayers':
      return <RockLayers spec={spec} calc={calc} />;
    case 'pushes':
      return <Pushes spec={spec} calc={calc} />;
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
    case 'scaleCopy':
      return <ScaleCopy spec={spec} calc={calc} />;
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
    case 'hanger':
      return <Hanger spec={spec} calc={calc} />;
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
    case 'doubleNumberLine':
      return <DoubleNumberLine spec={spec} calc={calc} />;
    case 'coordinatePlane':
      return <CoordinatePlane spec={spec} calc={calc} />;
    case 'boxPlot':
      return <BoxPlot spec={spec} calc={calc} />;
    case 'pieChart':
      return <PieChart spec={spec} calc={calc} />;
    case 'fractionArea':
      return <FractionArea spec={spec} calc={calc} />;
    case 'unitCubes':
      return <UnitCubes spec={spec} calc={calc} />;
    case 'placeValueChart':
      return <PlaceValueChart spec={spec} calc={calc} />;
    case 'factorTree':
      return <FactorTree spec={spec} calc={calc} />;
    case 'factorPairs':
      return <FactorPairs spec={spec} calc={calc} />;
    case 'shareWholes':
      return <ShareWholes spec={spec} calc={calc} />;
    case 'protractor':
      return <Protractor spec={spec} calc={calc} />;
    case 'wave':
      return <Wave spec={spec} calc={calc} />;
    case 'punnettSquare':
      return <PunnettSquare spec={spec} calc={calc} />;
    case 'integerLine':
      return <IntegerLine spec={spec} calc={calc} />;
    case 'percentBar':
      return <PercentBar spec={spec} calc={calc} />;
    case 'ratioTable':
      return <RatioTable spec={spec} calc={calc} />;
    case 'zeroPairs':
      return <ZeroPairs spec={spec} calc={calc} />;
    case 'signTable':
      return <SignTable spec={spec} calc={calc} />;
    case 'fractionFit':
      return <FractionFit spec={spec} calc={calc} />;
    case 'venn':
      return <Venn spec={spec} calc={calc} />;
    case 'baseHeight':
      return <BaseHeight spec={spec} calc={calc} />;
    case 'net':
      return <Net spec={spec} calc={calc} />;
    case 'crossSection':
      return <CrossSection spec={spec} calc={calc} />;
    case 'dotPlot':
      return spec.second ? (
        <DotPlotPair spec={{ ...spec, second: spec.second }} calc={calc} />
      ) : (
        <DotPlot spec={spec} calc={calc} />
      );
    case 'sample':
      return <Sample spec={spec} calc={calc} />;
    case 'spinner':
      return <Spinner spec={spec} calc={calc} />;
    case 'diceGrid':
      return <DiceGrid spec={spec} calc={calc} />;
    case 'treeDiagram':
      return <TreeDiagram spec={spec} calc={calc} />;
    case 'marbles':
      return <Marbles spec={spec} calc={calc} />;
    case 'energyPyramid':
      return <EnergyPyramid spec={spec} calc={calc} />;
    case 'generations':
      return <Generations spec={spec} calc={calc} />;
    case 'fieldOfView':
      return <FieldOfView spec={spec} calc={calc} />;
    case 'gradCylinder':
      return <GradCylinder spec={spec} calc={calc} />;
  }
}

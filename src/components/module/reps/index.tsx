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
import { FunctionGraph } from './FunctionGraph';
import { FunctionMachine } from './FunctionMachine';
import { Mapping } from './Mapping';
import { Transformation } from './Transformation';
import { RectangleDiagram } from './Rectangle';
import { Rectilinear } from './Rectilinear';
import { AreaModel } from './AreaModel';
import { Angles } from './Angles';
import { CubeRoot } from './CubeRoot';
import { ParallelAngles } from './ParallelAngles';
import { TriangleAngles } from './TriangleAngles';
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
import { BoxPlotPair } from './BoxPlotPair';
import { TwoWayTable } from './TwoWayTable';
import { ChanceTree } from './ChanceTree';
import { VennChance } from './VennChance';
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
import { Spectrum } from './Spectrum';
import { Circuit } from './Circuit';
import { Orbit } from './Orbit';
import { Electromagnet } from './Electromagnet';
import { Scatter } from './Scatter';
import { RootSquare } from './RootSquare';
import { FactorRows } from './FactorRows';
import { PowerScale } from './PowerScale';
import { EquationBalance } from './EquationBalance';
import { Molecules } from './Molecules';
import { Reaction } from './Reaction';
import { HeatingCurve } from './HeatingCurve';
import { PeriodicTable } from './PeriodicTable';
import { MotionGraph } from './MotionGraph';
import { ForceCart } from './ForceCart';
import { Skaters } from './Skaters';
import { EnergyTrack } from './EnergyTrack';
import { TriangleSolver } from './TriangleSolver';
import { MarkedFigure } from './MarkedFigure';
import { RegularPolygon } from './RegularPolygon';
import { CircleTheorems } from './CircleTheorems';
import { NormalCurve } from './NormalCurve';
import { Histogram } from './Histogram';
import { PascalTriangle } from './PascalTriangle';
import { TermsChart } from './TermsChart';
import { UnitCircle } from './UnitCircle';
import { MatrixGrid } from './MatrixGrid';
import { HsjView } from './hsjView';
import { BeakerSolution } from './BeakerSolution';
import { ConicGraph } from './ConicGraph';
import { PolarGrid } from './PolarGrid';
import { ComplexPlane } from './ComplexPlane';
import { VectorDiagram } from './VectorDiagram';
import { AlgebraTiles } from './AlgebraTiles';
import { Membrane } from './Membrane';
import { DnaStrand } from './DnaStrand';
import { PunnettHs } from './PunnettHs';
import { Gel } from './Gel';
import { AlleleFrequencies } from './AlleleFrequencies';
import { ImmuneResponse } from './ImmuneResponse';
import { HsiRep } from './hsi';
import { PeriodicTrend } from './PeriodicTrend';
import { ReactionLimiting } from './ReactionLimiting';
import { HslPicture } from './HslPicture';
import { MotionGraphHs } from './MotionGraphHs';
import { HskView } from './HskView';
import { EnergySpring } from './EnergySpring';
import { WaveDoppler } from './WaveDoppler';
import { CircuitMixed } from './CircuitMixed';
import { PhotonView, SpectrumLinesView } from './SpectrumLines';
import { WaveStanding } from './WaveStanding';

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
          'functionGraph',
          'heatingCurve',
          'motionGraph',
          'normalCurve',
          'histogram',
          'termsChart',
        ].includes(r.kind)
      ? 'Chart'
      : 'Diagram';

export function RepresentationView({ spec, calc }: { spec: Representation; calc: Calculator }) {
  switch (spec.kind) {
    case 'unitChain':
    case 'atomModel':
    case 'orbitalDiagram':
    case 'lewisStructure':
    case 'vsepr':
    case 'moleMap':
      return <HsiRep spec={spec} calc={calc} />;
    case 'unitCircle':
      return <UnitCircle spec={spec} calc={calc} />;
    case 'matrixGrid':
      return <MatrixGrid spec={spec} calc={calc} />;
    case 'membrane':
      return <Membrane spec={spec} calc={calc} />;
    case 'dnaStrand':
      return <DnaStrand spec={spec} calc={calc} />;
    case 'gasPiston':
    case 'energyProfile':
    case 'equilibriumChart':
    case 'phScale':
    case 'decayChart':
      return <HsjView spec={spec} calc={calc} />;
    case 'projectile':
    case 'induction':
    case 'charges':
    case 'rayDiagram':
    case 'heatEngine':
    case 'simpleMachine':
    case 'collision':
    case 'circularMotion':
    case 'freeBody':
      return <HskView spec={spec} calc={calc} />;
    case 'conicGraph':
      return <ConicGraph spec={spec} calc={calc} />;
    case 'polarGrid':
      return <PolarGrid spec={spec} calc={calc} />;
    case 'complexPlane':
      return <ComplexPlane spec={spec} calc={calc} />;
    case 'vectorDiagram':
      return <VectorDiagram spec={spec} calc={calc} />;
    case 'algebraTiles':
      return <AlgebraTiles spec={spec} calc={calc} />;
    case 'gel':
      return <Gel spec={spec} calc={calc} />;
    case 'alleleFrequencies':
      return <AlleleFrequencies spec={spec} calc={calc} />;
    case 'immuneResponse':
      return <ImmuneResponse spec={spec} calc={calc} />;
    case 'earthLayers':
    case 'oceanProfile':
    case 'atmosphereLayers':
    case 'hrDiagram':
    case 'expandingUniverse':
      return <HslPicture spec={spec} calc={calc} />;
    case 'linearFunction':
      return <LinearFunction spec={spec} calc={calc} />;
    case 'lineSystem':
      return <LineSystem spec={spec} calc={calc} />;
    case 'functionGraph':
      return <FunctionGraph spec={spec} calc={calc} />;
    case 'motionGraph':
      if (spec.kinematics && spec.graph === 'speed')
        return <MotionGraphHs spec={spec} k={spec.kinematics} calc={calc} />;
      return <MotionGraph spec={spec} calc={calc} />;
    case 'normalCurve':
      return <NormalCurve spec={spec} calc={calc} />;
    case 'histogram':
      return <Histogram spec={spec} calc={calc} />;
    case 'pascalTriangle':
      return <PascalTriangle spec={spec} calc={calc} />;
    case 'termsChart':
      return <TermsChart spec={spec} calc={calc} />;
    case 'skaters':
      return <Skaters spec={spec} calc={calc} />;
    case 'energyTrack':
      if (spec.spring) return <EnergySpring spec={spec} s={spec.spring} calc={calc} />;
      return <EnergyTrack spec={spec} calc={calc} />;
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
      if ('solution' in spec) return <BeakerSolution spec={spec.solution} calc={calc} />;
      return <Beaker spec={spec} calc={calc} />;
    case 'quadrilateral':
      return <Quadrilateral spec={spec} calc={calc} />;
    case 'rectilinear':
      return <Rectilinear spec={spec} calc={calc} />;
    case 'areaModel':
      return <AreaModel spec={spec} calc={calc} />;
    case 'angles':
      if (spec.triangle) return <TriangleAngles spec={spec} calc={calc} />;
      if (spec.parallel) return <ParallelAngles spec={spec} calc={calc} />;
      return <Angles spec={spec} calc={calc} />;
    case 'thermometers':
      return <Thermometers spec={spec} calc={calc} />;
    case 'grassSlope':
      return <GrassSlope spec={spec} calc={calc} />;
    case 'flashlights':
      return <Flashlights spec={spec} calc={calc} />;
    case 'leafCount':
      return <LeafCount spec={spec} calc={calc} />;
    case 'electromagnet':
      return <Electromagnet spec={spec} calc={calc} />;
    case 'orbit':
      return <Orbit spec={spec} calc={calc} />;
    case 'circuit':
      if (spec.mixed) return <CircuitMixed spec={spec} m={spec.mixed} calc={calc} />;
      return <Circuit spec={spec} calc={calc} />;
    case 'spectrum':
      if (spec.lines) return <SpectrumLinesView spec={spec} l={spec.lines} calc={calc} />;
      if (spec.photon) return <PhotonView spec={spec} p={spec.photon} calc={calc} />;
      return <Spectrum spec={spec} calc={calc} />;
    case 'curvedSolid':
      return <CurvedSolid spec={spec} calc={calc} />;
    case 'scatter':
      return <Scatter spec={spec} calc={calc} />;
    case 'rootSquare':
      if (spec.solid === 'cube') return <CubeRoot spec={spec} calc={calc} />;
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
      return spec.limiting ? (
        <ReactionLimiting spec={spec} calc={calc} />
      ) : (
        <Reaction spec={spec} calc={calc} />
      );
    case 'heatingCurve':
      return <HeatingCurve spec={spec} calc={calc} />;
    case 'periodicTable':
      return spec.trend ? (
        <PeriodicTrend spec={spec} calc={calc} />
      ) : (
        <PeriodicTable spec={spec} calc={calc} />
      );
    case 'rockLayers':
      if ('dating' in spec) return <HslPicture spec={spec} calc={calc} />;
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
      return 'twoWay' in spec ? (
        <TwoWayTable spec={spec.twoWay} calc={calc} />
      ) : (
        <ValueTable spec={spec} calc={calc} />
      );
    case 'force':
      return spec.object === 'cart' ? (
        <ForceCart spec={spec} calc={calc} />
      ) : (
        <ForceDiagram spec={spec} calc={calc} />
      );
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
      return spec.fences || spec.second ? (
        <BoxPlotPair spec={spec} calc={calc} />
      ) : (
        <BoxPlot spec={spec} calc={calc} />
      );
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
      if (spec.standing) return <WaveStanding spec={spec} s={spec.standing} calc={calc} />;
      if (spec.doppler) return <WaveDoppler d={spec.doppler} calc={calc} />;
      return <Wave spec={spec} calc={calc} />;
    case 'punnettSquare':
      return spec.inheritance ? (
        <PunnettHs spec={spec} inheritance={spec.inheritance} calc={calc} />
      ) : (
        <PunnettSquare spec={spec} calc={calc} />
      );
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
      return 'chances' in spec ? (
        <VennChance spec={spec.chances} calc={calc} />
      ) : (
        <Venn spec={spec} calc={calc} />
      );
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
      return 'chances' in spec ? (
        <ChanceTree spec={spec.chances} calc={calc} />
      ) : (
        <TreeDiagram spec={spec} calc={calc} />
      );
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
    case 'triangleSolver':
      return <TriangleSolver spec={spec} calc={calc} />;
    case 'markedFigure':
      if (spec.regular) return <RegularPolygon spec={spec} calc={calc} />;
      return <MarkedFigure spec={spec} calc={calc} />;
    case 'circleTheorems':
      return <CircleTheorems spec={spec} calc={calc} />;
  }
}

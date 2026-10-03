import type { Representation } from '@/data/modules';
import { drawnByHe1d } from '@/data/modules/typesHe1d';
import { isHe2fSpec } from '@/data/modules/typesHe2f';
import { isHe3lSpec } from '@/data/modules/typesHe3l';
import { isVectorHe4b } from '@/data/modules/typesHe4b'; // HC96–HC171, group B
import { isHe4cOption } from '@/data/modules/typesHe4c';
import { isHe4gOption } from '@/data/modules/typesHe4g'; // HC122–HC130, group G
import { isFamilyHe4e, isNormalHe4e } from '@/data/modules/typesHe4e';

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
import { BarsFlows } from './BarsFlows';
import { CircleDiagram } from './CircleDiagram';
import { ScaleCopy } from './ScaleCopy';
import { ForceDiagram } from './ForceDiagram';
import { Grid100 } from './Grid100';
import { NumberLine } from './NumberLine';
import { Plot } from './Plot';
import { LineParabola } from './LineParabola';
import { PolygonApothem } from './PolygonApothem';
import { LinearFunction, LineSystem } from './Lines';
import { FunctionGraph } from './FunctionGraph';
import { FunctionGraphHe1d } from './FunctionGraphHe1d';
import { NormalCurveHe4e } from './NormalCurveHe4e';
import { DriftPaths } from './DriftPaths';
import { FunctionGraphHe4e } from './FunctionGraphHe4e';
import { AlleleFrequenciesAfterHe4e } from './AlleleFrequenciesAfterHe4e';
import { BarsLogHe1d } from './BarsLogHe1d';
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
import { RectangleGrowHe3c } from './RectangleGrowHe3c';
import { RightTriangleRatesHe3c } from './RightTriangleRatesHe3c';
import { PictureGraph } from './PictureGraph';
import { SeriesCircuit } from './SeriesCircuit';
import { NetSchematic } from './NetSchematic';
import { OpAmpSchematic } from './OpAmpSchematic';
import { DeviceSchematic } from './DeviceSchematic';
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
import { ChanceTree3 } from './ChanceTree3';
import { VennChance } from './VennChance';
import { VennOne } from './VennOne';
import { TableGraph } from './TableGraph';
import { CirclePopulation } from './CirclePopulation';
import { RectangleBounds } from './RectangleBounds';
import { VectorSpace } from './VectorSpace';
import { PolarConic } from './PolarConic';
import { ConicTurned } from './ConicTurned';
import { FCurve } from './FCurve';
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
import { CircleAngles } from './CircleAngles';
import { NormalCurve } from './NormalCurve';
import { CltHistogram } from './CltHistogram';
import { Histogram } from './Histogram';
import { PascalTriangle } from './PascalTriangle';
import { TermsChart } from './TermsChart';
import { UnitCircle } from './UnitCircle';
import { UnitCircleHs2g } from './UnitCircleHs2g';
import { MatrixDeterminant } from './MatrixDeterminant';
import { MatrixReduceHe4a } from './MatrixReduceHe4a'; // HC94
import { MatrixRouthHe4a } from './MatrixRouthHe4a'; // HC190
import { TransformationMatrixHe4a } from './TransformationMatrixHe4a'; // HC95
import { ScatterPointsHe4a } from './ScatterPointsHe4a'; // HC97
import { ScatterClassesHe4a } from './ScatterClassesHe4a'; // HC139
import { ChainTreeHe4a } from './ChainTreeHe4a'; // HC98
import { MatrixGrid } from './MatrixGrid';
import { HsjView } from './hsjView';
import { BeakerSolution } from './BeakerSolution';
import { BeakerCuvette } from './BeakerCuvette';
import { ConicGraph } from './ConicGraph';
import { PolarGrid } from './PolarGrid';
import { ComplexPlane } from './ComplexPlane';
import { ComplexPowers } from './ComplexPowers';
import { VectorDiagram } from './VectorDiagram';
import { VectorHe4b } from './VectorHe4b'; // HC96, HC100, HC108, HC171
import { AlgebraTiles } from './AlgebraTiles';
import { AlgebraTilesHs2g } from './AlgebraTilesHs2g';
import { Membrane } from './Membrane';
import { MembraneHe3g } from './MembraneHe3g';
import { DnaStrand } from './DnaStrand';
import { Neuron } from './Neuron';
import { Skeletal } from './Skeletal';
import { Truss } from './Truss';
import { SoilProfile } from './SoilProfile';
import { Survey } from './Survey';
import { TimingDiagram } from './TimingDiagram';
import { GraphDiagram } from './GraphDiagram';
import { ScheduleChart } from './ScheduleChart';
import { BitFields } from './BitFields';
import { Hs2eView } from './Hs2eView';
import { PunnettHs } from './PunnettHs';
import { Gel } from './Gel';
import { AlleleFrequencies } from './AlleleFrequencies';
import { ImmuneResponse } from './ImmuneResponse';
import { HsiRep } from './hsi';
import { PeriodicTrend } from './PeriodicTrend';
import { ReactionLimiting } from './ReactionLimiting';
import { ChemDiagram } from './ChemDiagram';
import { PhaseEnvelope } from './PhaseEnvelope';
import { ReactionMany } from './ReactionMany';
import { HslPicture } from './HslPicture';
import { Hs2fPicture } from './Hs2fPicture';
import { Hs3cPicture } from './Hs3cPicture';
import { FluidSystem } from './FluidSystem';
import { ControlVolume } from './ControlVolume';
import { VelocityProfile } from './VelocityProfile';
import { ComplexPlaneHe2a } from './ComplexPlaneHe2a';
import { Bode } from './Bode';
import { StreamChannelHe } from './StreamChannelHe';
import { RoadCurve } from './RoadCurve';
import { BlockDiagram } from './BlockDiagram';
import { Hydrograph } from './Hydrograph';
import { Connection } from './Connection';
import { PotentialWell } from './PotentialWell';
import { UnitCell } from './UnitCell';
import { InstrumentTrace } from './InstrumentTrace';
import { CombustionTrain } from './CombustionTrain';
import { BinaryPhase } from './BinaryPhase';
import { Machining } from './Machining';
import { Linkage } from './Linkage';
import { Globe } from './Globe';
import { Aquifer } from './Aquifer';
import { Refraction } from './Refraction';
import { Projection } from './Projection';
import { CoordinatePlaneHe3m, isGisPlane } from './CoordinatePlaneHe3m';
import { StressStrain } from './StressStrain';
import { StressElement } from './StressElement';
import { Wing } from './Wing';
import { Duct } from './Duct';
import { SupersonicFlow } from './SupersonicFlow';
import { FieldPlot } from './FieldPlot';
import { SurfacePlot } from './SurfacePlot';
import { SolidOfRevolution } from './SolidOfRevolution';
import { SpaceObjects } from './SpaceObjects';
import { hasSpaceObjects } from '@/data/modules/typesHe3b';
import { ThermalWall } from './ThermalWall';
import { HeatExchanger } from './HeatExchanger';
import { Shaft } from './Shaft';
import { FatigueDiagram } from './FatigueDiagram';
import { ElementChain } from './ElementChain';
import { DilutionSeries } from './DilutionSeries';
import { WaterfallDecibels } from './WaterfallDecibels';
import { Lamina } from './Lamina';
import { Rocket } from './Rocket';
import { DeviceCurves } from './DeviceCurves';
import { StemPlot } from './StemPlot';
import { PropertyDiagram } from './PropertyDiagram';
import { MotionGraphHs } from './MotionGraphHs';
import { HskView } from './HskView';
import { He2fView } from './He2fView';
import { He4cView } from './He4cView';
import { He4gView } from './He4gView';
import { Spacetime } from './Spacetime';
import { RayHe3l } from './RayHe3l';
import { PhaseSpace } from './PhaseSpace';
import { WaveHe3l } from './WaveHe3l';
import { Hs2cView } from './Hs2cView';
import { Hs3aView } from './Hs3aView';
import { Section } from './Section';
import { Beam } from './Beam';
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
  if (isHe2fSpec(spec)) return <He2fView spec={spec} calc={calc} />; // HC20, HC25, HC35
  if (isHe4cOption(spec)) return <He4cView spec={spec} calc={calc} />; // HC99, HC101, HC103, HC105, HC118
  if (isHe4gOption(spec)) return <He4gView spec={spec} calc={calc} />; // HC122–HC125, HC130
  switch (spec.kind) {
    case 'none':
      return null; // H105: an equation-only page (ModuleSections leaves out the section)
    case 'unitChain':
    case 'atomModel':
    case 'orbitalDiagram':
    case 'lewisStructure':
    case 'vsepr':
    case 'moleMap':
      return <HsiRep spec={spec} calc={calc} />;
    case 'unitCircle':
      return spec.through || spec.pair || spec.solutions?.also !== undefined ? (
        <UnitCircleHs2g spec={spec} calc={calc} />
      ) : (
        <UnitCircle spec={spec} calc={calc} />
      );
    case 'matrixGrid':
      if (spec.mode === 'routh') return <MatrixRouthHe4a spec={spec} calc={calc} />; // HC190
      if (spec.mode === 'rowReduce' && (spec.inverse || spec.tally))
        return <MatrixReduceHe4a spec={spec} calc={calc} />; // HC94
      return spec.mode === 'determinant' ? (
        <MatrixDeterminant spec={spec} calc={calc} />
      ) : (
        <MatrixGrid spec={spec} calc={calc} />
      );
    case 'membrane':
      if (spec.potential || spec.psi) return <MembraneHe3g spec={spec} calc={calc} />; // HC79
      return <Membrane spec={spec} calc={calc} />;
    case 'dnaStrand':
      return <DnaStrand spec={spec} calc={calc} />;
    case 'macromolecules':
    case 'cellDivision':
      return <Hs2eView spec={spec} calc={calc} />;
    case 'neuron':
      return <Neuron spec={spec} calc={calc} />;
    case 'skeletal':
      return <Skeletal spec={spec} calc={calc} />;
    case 'truss':
      return <Truss spec={spec} calc={calc} />;
    case 'soilProfile':
      return <SoilProfile spec={spec} calc={calc} />;
    case 'survey':
      return <Survey spec={spec} calc={calc} />;
    case 'instrumentTrace':
      return <InstrumentTrace spec={spec} calc={calc} />; // HC55
    case 'gasPiston':
    case 'energyProfile':
    case 'equilibriumChart':
    case 'phScale':
    case 'decayChart':
      return <HsjView spec={spec} calc={calc} />;
    case 'chemDiagram':
      return <ChemDiagram spec={spec} calc={calc} />;
    case 'phaseEnvelope':
      return <PhaseEnvelope spec={spec} calc={calc} />;
    case 'projectile':
    case 'induction':
    case 'charges':
    case 'rayDiagram':
    case 'heatEngine':
    case 'simpleMachine':
    case 'collision':
    case 'circularMotion':
    case 'freeBody':
      if (isHe3lSpec(spec)) return <RayHe3l spec={spec} calc={calc} />; // HC68
      return <HskView spec={spec} calc={calc} />;
    case 'impulse':
    case 'powerLift':
    case 'photoelectric':
    case 'lightClock':
      return <Hs2cView spec={spec} calc={calc} />;
    case 'torque':
    case 'rotor':
    case 'oscillator':
    case 'pendulum':
    case 'capacitor':
      return <Hs3aView spec={spec} calc={calc} />;
    case 'section':
      return <Section spec={spec} calc={calc} />; // HC3
    case 'beam':
      return <Beam spec={spec} calc={calc} />; // HC1
    case 'conicGraph':
      if (spec.conic === 'turned') return <ConicTurned spec={spec} calc={calc} />; // H106
      return <ConicGraph spec={spec} calc={calc} />;
    case 'polarGrid':
      if (spec.curve?.shape === 'conic') return <PolarConic spec={spec} calc={calc} />; // H106
      return <PolarGrid spec={spec} calc={calc} />;
    case 'complexPlane':
      if (spec.j || spec.axes || spec.phasors || spec.poles || spec.zeros || spec.locus)
        return <ComplexPlaneHe2a spec={spec} calc={calc} />; // HC14
      return spec.power !== undefined || spec.roots !== undefined ? (
        <ComplexPowers spec={spec} calc={calc} />
      ) : (
        <ComplexPlane spec={spec} calc={calc} />
      );
    case 'vectorDiagram':
      if (hasSpaceObjects(spec.space)) return <SpaceObjects spec={spec} calc={calc} />; // HC47
      if (isVectorHe4b(spec)) return <VectorHe4b spec={spec} calc={calc} />; // HC96, HC100, HC108, HC171
      if (spec.space) return <VectorSpace spec={spec} calc={calc} />; // H106
      return <VectorDiagram spec={spec} calc={calc} />;
    case 'algebraTiles':
      return spec.mode === 'box' || spec.mode === 'monomial' ? (
        <AlgebraTilesHs2g spec={spec} calc={calc} />
      ) : (
        <AlgebraTiles spec={spec} calc={calc} />
      );
    case 'gel':
      return <Gel spec={spec} calc={calc} />;
    case 'alleleFrequencies':
      if (spec.after) return <AlleleFrequenciesAfterHe4e spec={spec} calc={calc} />; // HC151
      return <AlleleFrequencies spec={spec} calc={calc} />;
    case 'immuneResponse':
      return <ImmuneResponse spec={spec} calc={calc} />;
    case 'earthLayers':
    case 'oceanProfile':
    case 'atmosphereLayers':
    case 'hrDiagram':
    case 'expandingUniverse':
      return <HslPicture spec={spec} calc={calc} />;
    case 'streamChannel':
    case 'reserve':
      if ('mode' in spec) return <StreamChannelHe spec={spec} calc={calc} />; // HC88
      return <Hs2fPicture spec={spec} calc={calc} />;
    case 'geologicClock':
    case 'coralSection':
    case 'transit':
    case 'habitableZone':
    case 'parallax':
      return <Hs3cPicture spec={spec} calc={calc} />;
    case 'fluidSystem':
      return <FluidSystem spec={spec} calc={calc} />;
    case 'controlVolume':
      return <ControlVolume spec={spec} calc={calc} />;
    case 'bode':
      return <Bode spec={spec} calc={calc} />; // HC22
    case 'roadCurve':
      return <RoadCurve spec={spec} calc={calc} />; // HC60
    case 'blockDiagram':
      return <BlockDiagram spec={spec} calc={calc} />; // HC90
    case 'hydrograph':
      return <Hydrograph spec={spec} calc={calc} />; // HC89
    case 'connection':
      return <Connection spec={spec} calc={calc} />; // HC61
    case 'velocityProfile':
      return <VelocityProfile spec={spec} calc={calc} />;
    case 'potentialWell':
      return <PotentialWell spec={spec} calc={calc} />;
    case 'phaseSpace':
      return <PhaseSpace spec={spec} calc={calc} />; // HC69
    case 'spacetime':
      return <Spacetime spec={spec} calc={calc} />; // HC104
    case 'unitCell':
      return <UnitCell spec={spec} calc={calc} />;
    case 'binaryPhase':
      return <BinaryPhase spec={spec} calc={calc} />;
    case 'machining':
      return <Machining spec={spec} calc={calc} />;
    case 'linkage':
      return <Linkage spec={spec} calc={calc} />;
    case 'globe':
      return <Globe spec={spec} calc={calc} />;
    case 'aquifer':
      return <Aquifer spec={spec} calc={calc} />; // HC75
    case 'refraction':
      return <Refraction spec={spec} calc={calc} />; // HC76
    case 'projection':
      return <Projection spec={spec} calc={calc} />; // HC78
    case 'stressStrain':
      return <StressStrain spec={spec} calc={calc} />;
    case 'stressElement':
      return <StressElement spec={spec} calc={calc} />;
    case 'wing':
      return <Wing spec={spec} calc={calc} />;
    case 'duct':
      return <Duct spec={spec} calc={calc} />;
    case 'supersonicFlow':
      return <SupersonicFlow spec={spec} calc={calc} />;
    case 'fieldPlot':
      return <FieldPlot spec={spec} calc={calc} />;
    case 'surfacePlot':
      return <SurfacePlot spec={spec} calc={calc} />; // HC46
    case 'driftPaths':
      return <DriftPaths spec={spec} calc={calc} />; // HC153
    case 'solidOfRevolution':
      return <SolidOfRevolution spec={spec} calc={calc} />; // HC65
    case 'thermalWall':
      return <ThermalWall spec={spec} calc={calc} />;
    case 'heatExchanger':
      return <HeatExchanger spec={spec} calc={calc} />; // HC40
    case 'shaft':
      return <Shaft spec={spec} calc={calc} />; // HC59
    case 'fatigueDiagram':
      return <FatigueDiagram spec={spec} calc={calc} />; // HC52
    case 'elementChain':
      return <ElementChain spec={spec} calc={calc} />; // HC41
    case 'timingDiagram':
      return <TimingDiagram spec={spec} calc={calc} />;
    case 'graph':
      return <GraphDiagram spec={spec} calc={calc} />;
    case 'scheduleChart':
      return <ScheduleChart spec={spec} calc={calc} />;
    case 'bitFields':
      return <BitFields spec={spec} calc={calc} />;
    case 'dilutionSeries':
      return <DilutionSeries spec={spec} calc={calc} />; // HC80
    case 'lamina':
      return <Lamina spec={spec} calc={calc} />; // HC86
    case 'rocket':
      return <Rocket spec={spec} calc={calc} />; // HC87
    case 'deviceCurves':
      return <DeviceCurves spec={spec} calc={calc} />; // HC62
    case 'stemPlot':
      return <StemPlot spec={spec} calc={calc} />; // HC63
    case 'propertyDiagram':
      return <PropertyDiagram spec={spec} calc={calc} />;
    case 'linearFunction':
      return <LinearFunction spec={spec} calc={calc} />;
    case 'lineSystem':
      if (spec.lines.some((l) => l.square !== undefined))
        return <LineParabola spec={spec} calc={calc} />; // H106
      return <LineSystem spec={spec} calc={calc} />;
    case 'functionGraph':
      if (isFamilyHe4e(spec)) return <FunctionGraphHe4e spec={spec} calc={calc} />; // HC148, HC179
      if (drawnByHe1d(spec)) return <FunctionGraphHe1d spec={spec} calc={calc} />; // HC4, HC9
      return <FunctionGraph spec={spec} calc={calc} />;
    case 'motionGraph':
      if (spec.graph === 'speed' && (spec.kinematics || typeof spec.acceleration === 'number'))
        return (
          <MotionGraphHs spec={spec} k={spec.kinematics ?? { view: 'velocity' }} calc={calc} />
        );
      return <MotionGraph spec={spec} calc={calc} />;
    case 'normalCurve':
      if (spec.f) return <FCurve spec={spec} calc={calc} />; // H106
      if (isNormalHe4e(spec)) return <NormalCurveHe4e spec={spec} calc={calc} />; // HC114, HC152
      return <NormalCurve spec={spec} calc={calc} />;
    case 'histogram':
      return spec.clt ? (
        <CltHistogram spec={spec} calc={calc} />
      ) : (
        <Histogram spec={spec} calc={calc} />
      );
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
      if (spec.move === 'matrix') return <TransformationMatrixHe4a spec={spec} calc={calc} />; // HC95
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
      if ('cuvette' in spec) return <BeakerCuvette spec={spec.cuvette} calc={calc} />; // HC112
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
      if ('net' in spec) return <NetSchematic spec={spec} calc={calc} />; // HC7
      if (spec.mixed) return <CircuitMixed spec={spec} m={spec.mixed} calc={calc} />;
      return <Circuit spec={spec} calc={calc} />;
    case 'spectrum':
      if (spec.lines) return <SpectrumLinesView spec={spec} l={spec.lines} calc={calc} />;
      if (spec.photon) return <PhotonView spec={spec} p={spec.photon} calc={calc} />;
      return <Spectrum spec={spec} calc={calc} />;
    case 'curvedSolid':
      return <CurvedSolid spec={spec} calc={calc} />;
    case 'scatter':
      if ('classes' in spec) return <ScatterClassesHe4a spec={spec} calc={calc} />; // HC139
      if (spec.pointsFrom) return <ScatterPointsHe4a spec={spec} calc={calc} />; // HC97
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
      if (spec.combustion) return <CombustionTrain spec={spec.combustion} calc={calc} />; // HC74
      return spec.many && !spec.limiting ? (
        <ReactionMany spec={spec} calc={calc} />
      ) : spec.limiting ? (
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
      if (spec.log) return <BarsLogHe1d spec={spec} calc={calc} />; // HC9
      return spec.flows ? <BarsFlows spec={spec} calc={calc} /> : <Bars spec={spec} calc={calc} />;
    case 'rectangle':
      if (spec.bounds) return <RectangleBounds spec={spec} calc={calc} />; // H106
      if (spec.grow) return <RectangleGrowHe3c spec={spec} calc={calc} />; // HC67
      return <RectangleDiagram spec={spec} calc={calc} />;
    case 'grid100':
      return <Grid100 spec={spec} calc={calc} />;
    case 'circle':
      if (spec.population) return <CirclePopulation spec={spec} calc={calc} />; // H106
      return <CircleDiagram spec={spec} calc={calc} />;
    case 'scaleCopy':
      return <ScaleCopy spec={spec} calc={calc} />;
    case 'rightTriangle':
      if (spec.rates) return <RightTriangleRatesHe3c spec={spec} calc={calc} />; // HC54
      return <RightTriangle spec={spec} calc={calc} />;
    case 'plot':
      return <Plot spec={spec} calc={calc} />;
    case 'table':
      return 'twoWay' in spec ? (
        <TwoWayTable spec={spec.twoWay} calc={calc} />
      ) : spec.graph || spec.rowsFrom ? (
        <TableGraph spec={spec} calc={calc} /> // H106
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
      if (spec.decibels) return <WaterfallDecibels spec={spec} calc={calc} />; // HC91
      return <Waterfall spec={spec} calc={calc} />;
    case 'hundredChart':
      return <HundredChart spec={spec} calc={calc} />;
    case 'compareRows':
      return <CompareRows spec={spec} calc={calc} />;
    case 'polygon':
      if (spec.apothem && spec.sides) return <PolygonApothem spec={spec} calc={calc} />; // H106
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
      if ('net' in spec) return <NetSchematic spec={spec} calc={calc} />; // HC7
      if ('amp' in spec) return <OpAmpSchematic spec={spec} calc={calc} />; // HC18
      if ('device' in spec) return <DeviceSchematic spec={spec} calc={calc} />; // HC39
      return <SeriesCircuit spec={spec} calc={calc} />;
    case 'doubleNumberLine':
      return <DoubleNumberLine spec={spec} calc={calc} />;
    case 'coordinatePlane':
      if (isGisPlane(spec)) return <CoordinatePlaneHe3m spec={spec} calc={calc} />; // HC77
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
      if (isHe3lSpec(spec)) return <WaveHe3l spec={spec} calc={calc} />; // HC93
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
        spec.chances.one ? (
          <VennOne spec={spec.chances} calc={calc} /> // H106
        ) : (
          <VennChance spec={spec.chances} calc={calc} />
        )
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
      if ('chain' in spec) return <ChainTreeHe4a spec={spec.chain} calc={calc} />; // HC98
      return 'chances' in spec ? (
        spec.chances.third ? (
          <ChanceTree3 spec={spec.chances} calc={calc} />
        ) : (
          <ChanceTree spec={spec.chances} calc={calc} />
        )
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
      if (spec.theorem === 'cyclic' || spec.theorem === 'arcAngle')
        return <CircleAngles spec={spec} calc={calc} />;
      return <CircleTheorems spec={spec} calc={calc} />;
  }
}

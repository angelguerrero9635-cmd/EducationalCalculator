import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { ExploreLayout as Spec, Figure, Scene } from '@/data/modules/layouts';
import { chart, font, radius, space, usePalette, type Palette } from '@/theme';

import { Canvas, Caption } from '../reps/common';
import { ClockDial } from '../reps/ClockDial';
import { Sky, TimesTable } from './figures';
import { Push } from './pushFigure';
import { Vibration } from './soundFigure';
import { Earth, Static } from './figuresR4b';
import { Flashes } from './flashFigure';
import { LightPath } from './lightFigures';
import { AnimalGroup } from './animalFigures';
import { FoodWeb } from './foodWeb';
import { PartsDrawing } from './partsDrawings';
import { PositionScene } from './PositionScene';
import { CarbonCycleFigure, LeafCellFigure, PedigreeFigure } from './figuresLife';
import { MoleculesFigure, PeriodicTableFigure, PhasesFigure } from './chemFigures';
import { MagnetsFigure, PlanetsFigure } from './figures8';
import { StudyDesignFigure } from './studyDesignFigure';
import { CladogramFigure } from './cladogramFigure';
import { NitrogenCycleFigure } from './nitrogenCycleFigure';
import { DichotomousKeyFigure } from './dichotomousKeyFigure';
import { FeedbackLoopFigure } from './feedbackLoopFigure';
import { GeneExpressionFigure } from './geneExpressionFigure';
import { ImmuneStagesFigure } from './immuneStagesFigure';
import { GalvanicFigure } from './galvanicFigure';
import { HslFigureView } from './hslFigures';
import { SpectraFigure } from './spectraFigure';
import { Hs3cFigureView } from './hs3cFigures';
import { SymmetryFigure } from './symmetryFigure';
import { OrthographicFigure } from './orthographicFigure';
import { OrbitElementsFigure } from './orbitElementsFigure';
import { CirculationFigure } from './circulationFigure';
import { BodyFigure } from './bodyFigure';
import { ContinentsFigure } from './continentsFigure';
import { FrontFigure } from './frontFigure';
import { RockCycleFigure } from './rockCycleFigure';
import { PlatesFigure } from './platesFigure';
import { WaterCycleFigure } from './waterCycleFigure';
import { CellFigure, Particles } from './figuresR4h';
import { ConeFigure } from './coneFigure';
import { MacroFigure } from './macroFigure';
import { OrganelleFigure } from './organelleFigure';
import { PathwayDetail } from './pathwayFigure';
import { GelFigure } from './gelFigure';
import { ReflexArcFigure } from './reflexArcFigure';
import { CodeTraceFigureView } from './codeTraceFigure';
import { He4nFigureView } from './he4nFigures';

/**
 * A picture with a few scenes to switch between: tap a scene, the figure changes, and the
 * caption says what to notice. There are no numbers to type.
 */
export function ExploreLayout({ spec }: { spec: Spec }) {
  const c = usePalette();
  const [index, setIndex] = useState(0);
  const scene = spec.scenes[index]!;
  // (A drawn parts figure keeps its chips: the names are also on the drawing.)
  const partsOnly =
    spec.figure.kind === 'parts' &&
    !spec.figure.drawing &&
    spec.scenes.every((sc) => sc.part !== undefined);
  return (
    <View style={styles.wrap}>
      <FigureView
        figure={spec.figure}
        scene={scene}
        c={c}
        onPart={(name) => {
          const i = spec.scenes.findIndex((s) => s.part === name);
          if (i >= 0) setIndex(i);
        }}
      />
      <Caption>{scene.lines.join(' ')}</Caption>
      {/* A parts figure whose scenes are its parts is picked by tapping a part: no chips. */}
      {partsOnly ? null : (
        <View style={styles.scenes}>
          {spec.scenes.map((s, i) => (
            <Pressable
              key={s.label}
              testID={`scene-${i}`}
              accessibilityRole="button"
              accessibilityState={{ selected: i === index }}
              onPress={() => setIndex(i)}
              style={[
                styles.scene,
                {
                  borderColor: i === index ? c.accent : c.border,
                  backgroundColor: i === index ? c.accent : c.card,
                },
              ]}
            >
              <Text style={[styles.sceneText, { color: i === index ? c.onAccent : c.text }]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function FigureView({
  figure,
  scene,
  c,
  onPart,
}: {
  figure: Figure;
  scene: Scene;
  c: Palette;
  onPart: (name: string) => void;
}) {
  switch (figure.kind) {
    case 'mohsScale':
    case 'landforms':
    case 'oceanCurrents':
    case 'greenhouse':
      return <HslFigureView figure={figure} scene={scene} />;
    case 'spectra':
      return <SpectraFigure scene={scene.spectra ?? { star: [] }} />;
    case 'earthLayers':
      return <Hs3cFigureView figure={figure} scene={scene} />;
    case 'symmetryElements':
      return <SymmetryFigure scene={scene.symmetry ?? { molecule: 'H2O' }} />; // HC113
    case 'orthographic':
      return <OrthographicFigure scene={scene.ortho ?? { view: 'box' }} />; // HC169
    case 'orbitElements':
      return (
        <OrbitElementsFigure scene={scene.orbit ?? { i: 30, raan: 40, argp: 60, nu: 90, e: 0.5 }} />
      ); // HC173
    case 'circulationCells':
      return <CirculationFigure scene={scene.circulation ?? {}} />; // HC140
    case 'parts':
      if (figure.drawing) {
        return (
          <PartsDrawing
            drawing={figure.drawing}
            parts={figure.parts}
            highlight={scene.part}
            alsoLit={scene.alsoLit}
            onPart={onPart}
          />
        );
      }
      return <Parts parts={figure.parts} highlight={scene.part} c={c} onPart={onPart} />;
    case 'position':
      return <Position where={scene.position ?? 'above'} c={c} />;
    case 'clock':
      return <ClockFace time={scene.time ?? [3, 0]} />;
    case 'dots':
      if (scene.animal) {
        return (
          <AnimalGroup
            animal={scene.animal}
            groups={scene.dots?.[0] ?? 1}
            each={scene.dots?.[1] ?? 1}
          />
        );
      }
      return <Dots groups={scene.dots?.[0] ?? 1} each={scene.dots?.[1] ?? 1} c={c} />;
    case 'magnets':
      return <MagnetsFigure poles={scene.poles ?? 'N–S'} field={scene.field} />;
    case 'flashes':
      return <Flashes pattern={scene.flashes ?? '●'} />;
    case 'lightPath':
      return <LightPath light={scene.light ?? { lamp: true }} />;
    case 'particles':
      return <Particles state={scene.particles ?? { state: 'solid' }} c={c} />;
    case 'earth':
      return <Earth earth={scene.earth ?? { spot: 'top' }} />;
    case 'push':
      return <Push push={scene.push ?? { from: 'behind', strength: 'gentle' }} />;
    case 'vibration':
      return <Vibration vibrate={scene.vibrate ?? { thing: 'band', shaking: false }} />;
    case 'sky':
      return <Sky sky={scene.sky ?? { body: 'sun', at: 'high' }} c={c} />;
    case 'static':
      return <Static charge={scene.charge ?? { rubbed: false, near: 'paper' }} />;
    case 'timesTable':
      return <TimesTable table={scene.table ?? { op: '×' }} c={c} />;
    case 'cell':
      return <CellFigure cell={scene.cell ?? { type: 'animal' }} c={c} />;
    case 'bodySystems':
      return <BodyFigure body={scene.body ?? { systems: [] }} c={c} />;
    case 'waterCycle':
      return <WaterCycleFigure water={scene.water ?? { process: 'evaporation' }} c={c} />;
    case 'front':
      return <FrontFigure front={scene.front ?? { type: 'cold' }} c={c} />;
    case 'plates':
      return <PlatesFigure plates={scene.plates ?? { boundary: 'divergent' }} c={c} />;
    case 'continents':
      return <ContinentsFigure continents={scene.continents ?? { age: 0 }} c={c} />;
    case 'rockCycle':
      return <RockCycleFigure rock={scene.rock ?? { process: 'melting' }} c={c} />;
    case 'foodWeb':
      return <FoodWeb web={scene.web ?? {}} />;
    case 'leafCell':
      return <LeafCellFigure scene={scene.leafCell ?? { process: 'photosynthesis' }} c={c} />;
    case 'carbonCycle':
      return <CarbonCycleFigure carbon={scene.carbon ?? {}} c={c} volcano={figure.volcano} />;
    case 'pedigree':
      return <PedigreeFigure people={figure.people} family={scene.family ?? {}} />;
    case 'molecules':
      return <MoleculesFigure scene={scene.molecules ?? { items: [{ formula: 'H2O' }] }} />;
    case 'phases':
      return <PhasesFigure phase={scene.phase ?? {}} />;
    case 'periodicTable':
      return <PeriodicTableFigure elements={scene.elements ?? {}} />;
    case 'planets':
      return <PlanetsFigure planets={scene.planets ?? {}} />;
    case 'studyDesign':
      return <StudyDesignFigure study={scene.study ?? { design: 'survey' }} />;
    case 'doubleCone':
      return <ConeFigure cut={scene.cone ?? 'circle'} />;
    case 'macromolecules':
      return <MacroFigure macro={scene.macro ?? { kind: 'carbohydrate' }} />;
    case 'organelleEnergy':
      if (scene.energy?.detail) return <PathwayDetail energy={scene.energy} />; // HC57
      return <OrganelleFigure energy={scene.energy ?? {}} />;
    case 'cladogram':
      return <CladogramFigure figure={figure} clade={scene.clade ?? {}} />;
    case 'nitrogenCycle':
      return <NitrogenCycleFigure process={scene.nitrogen?.process} />;
    case 'feedbackLoop':
      return <FeedbackLoopFigure loop={scene.loop ?? { steps: [], sign: 'negative' }} />;
    case 'immuneStages':
      return <ImmuneStagesFigure stage={scene.immune?.stage} />;
    case 'electrochemicalCell':
      return <GalvanicFigure scene={scene.galvanic ?? { metals: ['Zn', 'Cu'] }} />;
    case 'geneExpression':
      return <GeneExpressionFigure gene={scene.gene ?? { control: 'repressor' }} />;
    case 'dichotomousKey':
      return <DichotomousKeyFigure steps={figure.steps} scene={scene.key ?? {}} />;
    case 'gel':
      return <GelFigure figure={figure} scene={scene.gel ?? {}} />;
    case 'reflexArc':
      return <ReflexArcFigure scene={scene.reflex ?? {}} />;
    case 'codeTrace':
      return <CodeTraceFigureView figure={figure} scene={scene.trace ?? { rows: [] }} />;
    case 'karnaugh':
    case 'stateDiagram':
    case 'dataStructure':
      return <He4nFigureView figure={figure} scene={scene} />; // group N (HC184–HC187)
  }
}

/** A thing built from its parts, top to bottom, the highlighted one filled and its job beside it. */
function Parts({
  parts,
  highlight,
  c,
  onPart,
}: {
  parts: { name: string; job: string }[];
  highlight: string | undefined;
  c: Palette;
  onPart: (name: string) => void;
}) {
  return (
    <View style={styles.parts}>
      {parts.map((p) => {
        const on = p.name === highlight;
        return (
          <Pressable
            key={p.name}
            testID={`part-${p.name}`}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onPart(p.name)}
            style={[
              styles.part,
              {
                borderColor: on ? c.chartHighlight : c.chartInk,
                backgroundColor: on ? c.chartHighlight : c.chartSurface,
              },
            ]}
          >
            <Text style={[styles.partName, { color: on ? c.onChartHighlight : c.text }]}>
              {p.name}
            </Text>
            <Text style={[styles.partJob, { color: on ? c.onChartHighlight : c.textMuted }]}>
              {p.job}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A ball and a box on a table, seen by a child; the ball drawn where the position word puts it. */
function Position({ where }: { where: NonNullable<Scene['position']>; c: Palette }) {
  return <PositionScene where={where} />;
}

/** The reps clock face (metal rim, minute ticks, tapered hands) set to the scene's time. */
function ClockFace({ time }: { time: [number, number] }) {
  const [hour, minute] = time;
  return (
    <View style={styles.clock}>
      <Canvas aspect={0.92}>
        {({ w, h }) => <ClockDial w={w} h={h} hour={hour} minute={minute} />}
      </Canvas>
    </View>
  );
}

/** Animals as dots: one alone, or a group with the young (small dots) in the middle. */
function Dots({ groups, each, c }: { groups: number; each: number; c: Palette }) {
  const n = Math.min(60, groups * each);
  return (
    <Canvas aspect={0.42}>
      {({ w, h }) => {
        const cx = w / 2;
        const cy = h / 2;
        const dots: { x: number; y: number; small: boolean }[] = [];
        if (n === 1) dots.push({ x: cx, y: cy, small: false });
        else {
          // Rings around the middle: the inner ring is the young.
          let placed = 0;
          for (let ring = 0; placed < n; ring++) {
            const count = ring === 0 ? Math.min(n, 4) : Math.min(n - placed, 6 + ring * 4);
            const rad = ring === 0 ? 14 : 28 + ring * 26;
            for (let k = 0; k < count; k++) {
              const a = (2 * Math.PI * k) / count + ring * 0.4;
              dots.push({
                x: cx + rad * Math.cos(a),
                y: cy + rad * Math.sin(a) * 0.7,
                small: ring === 0 && n > 4,
              });
            }
            placed += count;
          }
        }
        return (
          <Svg width={w} height={h}>
            {dots.map((d, i) => (
              <Ellipse
                key={i}
                cx={d.x}
                cy={d.y}
                rx={d.small ? 7 : 11}
                ry={d.small ? 5 : 8}
                fill={d.small ? c.chartHighlight : c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
            ))}
          </Svg>
        );
      }}
    </Canvas>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  clock: { width: '100%', maxWidth: 300, alignSelf: 'center' },
  scenes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
  },
  scene: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    borderWidth: 1.5,
    borderRadius: radius.pill,
  },
  sceneText: { fontSize: font.body, fontWeight: '600' },
  parts: { gap: space.sm, paddingHorizontal: space.lg, alignItems: 'center' },
  part: {
    width: '100%',
    maxWidth: 360,
    borderWidth: chart.stroke,
    borderRadius: radius.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    alignItems: 'center',
    gap: 2,
  },
  partName: { fontSize: font.body, fontWeight: '700' },
  partJob: { fontSize: font.caption + 1, textAlign: 'center' },
});

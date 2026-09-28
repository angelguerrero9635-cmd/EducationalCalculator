import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { ExploreLayout as Spec, Figure, Scene } from '@/data/modules/layouts';
import { chart, font, radius, space, usePalette, type Palette } from '@/theme';

import { Canvas, Caption, ChartText } from '../reps/common';
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
import {
  BodyFigure,
  CellFigure6,
  ContinentsFigure,
  FrontFigure,
  PlatesFigure,
  RockCycleFigure,
  WaterCycleFigure,
} from './figures6';

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
    case 'parts':
      if (figure.drawing) {
        return (
          <PartsDrawing
            drawing={figure.drawing}
            parts={figure.parts}
            highlight={scene.part}
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
      return <CellFigure6 cell={scene.cell ?? { type: 'animal' }} c={c} />;
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
      return <CarbonCycleFigure carbon={scene.carbon ?? {}} c={c} />;
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
  }
}

/** Fixed jitter so the same scene always draws the same picture. */
const JITTER = [
  0.3, -0.4, 0.1, 0.45, -0.2, 0.35, -0.45, 0.05, 0.25, -0.3, 0.4, -0.1, 0.15, -0.35, 0.2, -0.25,
];

/** Where the ten gas particles sit, as fractions of the box (scattered, no row or line). */
const GAS_SPOTS: readonly (readonly [number, number])[] = [
  [0.08, 0.15],
  [0.55, 0.05],
  [0.9, 0.3],
  [0.3, 0.4],
  [0.7, 0.55],
  [0.12, 0.7],
  [0.45, 0.8],
  [0.95, 0.85],
  [0.25, 0.98],
  [0.62, 0.28],
];

/** Particles in a box: packed rows for a solid, a crowd for a liquid, a few far apart for a gas. */
function Particles({ state, c }: { state: NonNullable<Scene['particles']>; c: Palette }) {
  return (
    <Canvas aspect={0.5}>
      {({ w, h }) => {
        const boxW = state.squeezed ? Math.min(w, h) * 0.5 : Math.min(w, h) * 0.9;
        const boxH = h - 40;
        const x0 = w / 2 - boxW / 2;
        const y0 = 12;
        const r = 7;
        const dots: { x: number; y: number; other: boolean }[] = [];
        if (state.state === 'solid') {
          const cols = 8;
          const rows = 5;
          const gap = 2 * r + 1;
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
              dots.push({
                x: x0 + boxW / 2 + (j - (cols - 1) / 2) * gap,
                y: y0 + boxH - r - 2 - i * gap,
                other: state.mixed ? (i + j) % 3 === 0 : false,
              });
            }
          }
        } else if (state.state === 'liquid') {
          const cols = 8;
          const rows = 4;
          const gap = 2 * r + 6;
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
              const k = i * cols + j;
              dots.push({
                x: x0 + boxW / 2 + (j - (cols - 1) / 2) * gap + JITTER[k % 16]! * 6,
                y: y0 + boxH - r - 4 - i * gap + JITTER[(k + 5) % 16]! * 5,
                other: state.mixed ? (i + j) % 3 === 0 : false,
              });
            }
          }
        } else {
          // Fixed spots spread over the whole box (fractions of its inside), so a gas never
          // lines up in a row.
          GAS_SPOTS.forEach(([fx, fy], k) => {
            dots.push({
              x: x0 + r + 4 + (boxW - 2 * r - 8) * fx,
              y: y0 + r + 14 + (boxH - 2 * r - 18) * fy,
              other: state.mixed ? k % 3 === 0 : false,
            });
          });
        }
        return (
          <Svg width={w} height={h}>
            <Rect
              x={x0}
              y={y0}
              width={boxW}
              height={boxH}
              fill={c.chartSurface}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            {dots.map((d, i) => (
              <Circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={r}
                fill={d.other ? c.chartInk : c.chartHighlight}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
            ))}
            {state.state === 'gas'
              ? dots
                  .slice(0, 4)
                  .map((d, i) => (
                    <Line
                      key={`m${i}`}
                      x1={d.x + r}
                      y1={d.y - r}
                      x2={d.x + r + 10}
                      y2={d.y - r - 10}
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                    />
                  ))
              : null}
            <ChartText x={w / 2} y={h - 6} fontSize={chart.label} textAnchor="middle">
              {state.squeezed
                ? 'the same particles in less room'
                : state.mixed
                  ? 'two kinds of particles, mixed'
                  : state.state === 'solid'
                    ? 'packed tight, only wiggling'
                    : state.state === 'liquid'
                      ? 'close, sliding past each other'
                      : 'far apart, flying about'}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
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

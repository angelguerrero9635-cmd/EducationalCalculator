import {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, type Palette } from '@/theme';

import { SunDisk } from '../reps/nature';
import { Ball, Deepen, TopLight, url, usePaintIds } from '../reps/paint';
import { BOARD_W, Board, Chip, CurveArrow, HaloText, chipW } from './earthKit';

/**
 * The water cycle as a painted landscape (Grade 6): the sun, an ocean with waves, a beach,
 * grassland with a tree and a river, a rock mountain with a snowcap, and soil over a band of
 * groundwater, under a sky with a cumulus cloud. Only the step a scene is about is drawn bold,
 * in the highlight, with its name on a chip; the other steps stay as faint arrows, so the loop
 * is still there to see.
 */

type Process = NonNullable<Scene['water']>['process'];

const H = 260;
/** The sea surface and the land's grass line. */
const SEA = 178;
const LAND = 172;

/** Each step: its arrow (tail, head, bow) and where its chip goes. */
const STEPS: Record<
  Process,
  { a: [number, number]; b: [number, number]; bend: number; chip: [number, number] }
> = {
  evaporation: { a: [50, 170], b: [92, 88], bend: -10, chip: [64, 206] },
  transpiration: { a: [190, 104], b: [178, 64], bend: 6, chip: [262, 118] },
  condensation: { a: [96, 80], b: [114, 50], bend: 6, chip: [160, 86] },
  precipitation: { a: [136, 66], b: [136, 156], bend: 0, chip: [252, 62] },
  runoff: { a: [238, 160], b: [120, 166], bend: 6, chip: [196, 204] },
  infiltration: { a: [150, 186], b: [150, 228], bend: 0, chip: [214, 206] },
  melting: { a: [293, 102], b: [246, 162], bend: 6, chip: [320, 146] },
};

const ORDER: Process[] = [
  'evaporation',
  'transpiration',
  'condensation',
  'precipitation',
  'runoff',
  'infiltration',
  'melting',
];

/** A cumulus: round tops over a flat base, from (x0, base) to (x1, base). */
const CLOUD = `M 104 58 A 13 13 0 0 1 112 38 A 19 19 0 0 1 146 26 A 18 18 0 0 1 176 30 A 14 14 0 0 1 192 46 A 10 10 0 0 1 198 58 Z`;

export function WaterCycleFigure({ water, c }: { water: NonNullable<Scene['water']>; c: Palette }) {
  const ids = usePaintIds('sky', 'glow', 'sun', 'sea', 'light', 'crown', 'puff', 'rock');
  const on = water.process;
  const rain = on === 'precipitation';
  const step = STEPS[on];
  const pill = water.driver === 'sun' ? 'Driven by the sun' : 'Driven by gravity';
  const pw = chipW(pill);
  return (
    <Board height={H}>
      <Defs>
        <Deepen id={ids.sky} from={c.skyMorning} to={c.snow} />
        <RadialGradient id={ids.glow} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={c.sunDisk} stopOpacity={0.55} />
          <Stop offset="1" stopColor={c.sunDisk} stopOpacity={0} />
        </RadialGradient>
        <Ball id={ids.sun} color={c.sunDisk} />
        <Deepen id={ids.sea} from={c.water} to={c.waterDeep} />
        <TopLight id={ids.light} />
        <Ball id={ids.crown} color={c.life} />
        <LinearGradient id={ids.puff} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.shine} stopOpacity={0.5 * c.sheen} />
          <Stop offset="0.6" stopColor={c.shine} stopOpacity={0} />
          <Stop offset="1" stopColor={c.shade} stopOpacity={0.16} />
        </LinearGradient>
        <LinearGradient id={ids.rock} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0.55" stopColor={c.shade} stopOpacity={0} />
          <Stop offset="0.56" stopColor={c.shade} stopOpacity={0.16} />
          <Stop offset="1" stopColor={c.shade} stopOpacity={0.2} />
        </LinearGradient>
      </Defs>
      {/* Sky and the sun with its glow. */}
      <Rect x={0} y={0} width={BOARD_W} height={H} fill={url(ids.sky)} />
      <Circle cx={34} cy={34} r={44} fill={url(ids.glow)} />
      <SunDisk x={34} y={34} r={15} ball={ids.sun} c={c} />
      {/* The ocean, with waves. */}
      <Rect x={0} y={SEA} width={140} height={H - SEA} fill={url(ids.sea)} />
      {[14, 50, 86].map((x) => (
        <Path
          key={x}
          d={`M ${x} ${SEA + 8} q 6 -4 12 0 t 12 0`}
          stroke={c.waterTop}
          strokeWidth={chart.strokeLight}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      <Line x1={0} y1={SEA} x2={110} y2={SEA} stroke={c.waterTop} strokeWidth={chart.stroke} />
      {/* Land: a beach, grassland, soil, and groundwater filling spaces in the rock below. */}
      <Path
        d={`M 96 ${SEA} L 124 ${LAND + 1} C 150 ${LAND - 4} 200 ${LAND - 2} 230 ${LAND} L ${BOARD_W} ${LAND} L ${BOARD_W} ${H} L 136 ${H} Z`}
        fill={c.soil}
      />
      <Path
        d={`M 136 ${H} L 128 222 L ${BOARD_W} 222 L ${BOARD_W} ${H} Z`}
        fill={c.water}
        opacity={0.8}
      />
      {Array.from({ length: 16 }, (_, i) => (
        <Circle
          key={i}
          cx={146 + i * 13.5}
          cy={230 + (i % 3) * 8}
          r={2.2}
          fill={c.soilDark}
          opacity={0.45}
        />
      ))}
      <Path
        d={`M 96 ${SEA} L 124 ${LAND + 1} L 128 ${LAND + 8} L 104 ${SEA + 8} Z`}
        fill={c.rock1}
      />
      <Path
        d={`M 122 ${LAND + 1} C 150 ${LAND - 4} 200 ${LAND - 2} 230 ${LAND} L ${BOARD_W} ${LAND} L ${BOARD_W} ${LAND + 6} L 124 ${LAND + 6} Z`}
        fill={c.life}
      />
      {/* The river winding over the land to the sea. */}
      <Path
        d={`M 244 ${LAND + 2} C 224 ${LAND + 7} 200 ${LAND + 1} 176 ${LAND + 5} S 132 ${LAND + 6} 108 ${SEA + 1}`}
        stroke={c.water}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      {/* The mountain: grey rock lit from the left, with a snowcap. */}
      <Path
        d={`M 222 ${LAND + 2} L 268 110 L 304 72 L 340 112 L ${BOARD_W} 128 L ${BOARD_W} ${LAND + 2} Z`}
        fill={c.rock2}
        stroke={c.rock5}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <Path
        d={`M 222 ${LAND + 2} L 268 110 L 304 72 L 340 112 L ${BOARD_W} 128 L ${BOARD_W} ${LAND + 2} Z`}
        fill={url(ids.rock)}
      />
      <Path
        d="M 284 93 L 304 72 L 322 92 L 314 88 L 308 96 L 301 89 L 293 96 Z"
        fill={c.snow}
        stroke={c.rock5}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      {/* The tree. */}
      <Rect x={185} y={136} width={6} height={LAND - 134} fill={c.bark} />
      <Circle cx={176} cy={136} r={12} fill={url(ids.crown)} />
      <Circle cx={200} cy={136} r={12} fill={url(ids.crown)} />
      <Circle cx={188} cy={124} r={16} fill={url(ids.crown)} />
      {/* Labels on the ocean and in the groundwater. */}
      <HaloText x={40} y={246} text="ocean" c={c} bold fill={c.snow} halo={c.waterDeep} />
      <HaloText x={300} y={244} text="groundwater" c={c} bold fill={c.snow} halo={c.waterDeep} />
      {/* The cloud: white, or grey and raining when precipitation is the step. */}
      <Path
        d={CLOUD}
        fill={rain ? c.rainCloud : c.snow}
        stroke={on === 'condensation' ? c.chartHighlight : c.mist}
        strokeWidth={on === 'condensation' ? chart.strokeHeavy : 1.2}
        strokeLinejoin="round"
      />
      <Path d={CLOUD} fill={url(ids.puff)} />
      {on === 'condensation'
        ? [
            [124, 48],
            [140, 40],
            [158, 46],
            [176, 44],
            [148, 52],
            [166, 36],
          ].map(([x, y]) => <Circle key={`d${x}`} cx={x} cy={y} r={2.6} fill={c.water} />)
        : null}
      {rain
        ? Array.from({ length: 10 }, (_, i) => {
            const x = 112 + (i % 5) * 11 + (i >= 5 ? 5 : 0);
            const y = 70 + (i >= 5 ? 40 : 0) + (i % 2) * 8;
            return (
              <Line
                key={`r${i}`}
                x1={x}
                y1={y}
                x2={x - 3}
                y2={y + 16}
                stroke={c.water}
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })
        : null}
      {on === 'evaporation' || on === 'transpiration' ? (
        // Rising vapor: faint wavy wisps where the water leaves the sea or the leaves.
        <G opacity={0.9}>
          {(on === 'evaporation' ? [30, 66] : [172, 204]).map((x) => (
            <Path
              key={`v${x}`}
              d={`M ${x} ${on === 'evaporation' ? SEA - 6 : 106} q 4 -5 0 -10 t 0 -10`}
              stroke={c.snow}
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </G>
      ) : null}
      {/* Every step, faint, then the one the scene is about, bold, with its chip. */}
      {ORDER.filter((p) => p !== on).map((p) => (
        <CurveArrow key={p} a={STEPS[p].a} b={STEPS[p].b} bend={STEPS[p].bend} on={false} c={c} />
      ))}
      <CurveArrow a={step.a} b={step.b} bend={step.bend} c={c} />
      <Chip x={step.chip[0]} y={step.chip[1]} text={on} c={c} lit />
      {water.driver ? <Chip x={BOARD_W - 8 - pw / 2} y={20} text={pill} c={c} /> : null}
    </Board>
  );
}

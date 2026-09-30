import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { NitrogenProcess } from '@/data/modules/typesHsh';
import { chart, usePalette } from '@/theme';

import { ChartText } from '../reps/common';
import { GrassTuft, Leaf } from '../reps/nature';
import { Ball, Deepen, url, usePaintIds } from '../reps/paint';
import { Board, BOARD_W, Chip, CurveArrow, HaloText } from './earthKit';
import { Member } from './foodWeb';

const GROUND = 176;

/** Each process: its arrows (from, to, bend) and its label's place. */
const FLOWS: {
  process: NitrogenProcess;
  arrows: [[number, number], [number, number], number][];
  label: string;
  at: [number, number];
  anchor?: 'start' | 'middle' | 'end';
}[] = [
  {
    process: 'fixation',
    arrows: [
      [[96, 38], [58, 196], 22],
      [[56, 232], [52, 280], 0],
    ],
    label: 'fixation',
    at: [8, 72],
    anchor: 'start',
  },
  {
    process: 'lightning',
    arrows: [[[292, 110], [292, 278], 0]],
    label: 'lightning',
    at: [300, 150],
    anchor: 'start',
  },
  {
    process: 'nitrification',
    arrows: [
      [[112, 292], [128, 292], 0],
      [[232, 292], [248, 292], 0],
    ],
    label: 'nitrification by soil bacteria',
    at: [180, 324],
  },
  {
    process: 'assimilation',
    arrows: [[[270, 278], [82, 226], 26]],
    label: 'roots take in nitrate',
    at: [178, 212],
  },
  {
    process: 'eating',
    arrows: [[[88, 118], [128, 150], -10]],
    label: 'eating',
    at: [110, 108],
    anchor: 'start',
  },
  {
    process: 'ammonification',
    arrows: [[[228, 196], [84, 278], -18]],
    label: 'decomposers make ammonium',
    at: [268, 228],
  },
  {
    process: 'denitrification',
    arrows: [[[340, 278], [290, 34], -30]],
    label: 'denitrification',
    at: [300, 212],
    anchor: 'end',
  },
];

/**
 * The nitrogen cycle, beside `carbonCycle`: nitrogen gas in the air; a bean plant whose root
 * nodules hold nitrogen-fixing bacteria; lightning; ammonium, nitrite and nitrate in the soil; a
 * rabbit eating the plant; dead matter with decomposers. The living things and the soil are
 * painted; the arrows and labels stay flat. A scene lights one process (every arrow of it, and
 * its name) and fades the rest; with none, the whole cycle's arrows, unnamed.
 */
export function NitrogenCycleFigure({ process }: { process?: NitrogenProcess }) {
  const c = usePalette();
  const ids = usePaintIds(
    'soil',
    'nodule',
    'cloud',
    'cap',
    'sun',
    'fur',
    'grey',
    'feather',
    'scales',
    'frog',
    'insect',
    'cream',
  );
  return (
    <Board height={336}>
      <Defs>
        <Deepen id={ids.soil} from={c.soil} to={c.soilDark} />
        <Ball id={ids.nodule} color={c.rootNodule} />
        <Ball id={ids.cloud} color={c.stormCloud} />
        <Ball id={ids.cap} color={c.fur} />
        <Ball id={ids.fur} color={c.fur} />
        <Ball id={ids.cream} color={c.featherLight} />
      </Defs>
      {/* The air. */}
      <Rect
        x={62}
        y={8}
        width={224}
        height={30}
        rx={15}
        fill={c.chartSurface}
        stroke={c.chartGrid}
        strokeWidth={chart.strokeLight}
      />
      <ChartText x={174} y={28} fontSize={chart.label} fontWeight="700" textAnchor="middle">
        nitrogen gas (N₂) in the air
      </ChartText>
      {/* A storm cloud and its lightning. */}
      <Ellipse cx={292} cy={66} rx={30} ry={13} fill={url(ids.cloud)} />
      <Ellipse cx={276} cy={60} rx={14} ry={11} fill={url(ids.cloud)} />
      <Path
        d="M 294 76 L 284 96 L 292 96 L 286 112 L 302 90 L 294 90 L 300 76 Z"
        fill={c.bulbGlow}
        stroke={c.sunRay}
        strokeWidth={0.8}
      />
      {/* The soil. */}
      <Rect x={0} y={GROUND} width={BOARD_W} height={336 - GROUND} fill={url(ids.soil)} />
      <Path d={`M 0 ${GROUND} H ${BOARD_W}`} stroke={c.lifeDeep} strokeWidth={3} />
      {/* A bean plant with nodules on its roots. */}
      <Path
        d={`M 58 ${GROUND} C 57 150 60 120 58 92`}
        stroke={c.lifeDeep}
        strokeWidth={3}
        fill="none"
      />
      {[
        [58, 150, 200],
        [58, 132, -20],
        [58, 114, 205],
        [58, 98, -35],
      ].map(([x, y, a]) => (
        <Leaf key={y} x={x!} y={y!} angle={a!} size={24} c={c} />
      ))}
      <Path
        d={`M 58 ${GROUND} C 56 196 46 214 42 236 M 58 ${GROUND} C 62 200 70 214 74 232 M 58 ${GROUND} L 58 240`}
        stroke={c.furLight}
        strokeWidth={1.6}
        fill="none"
      />
      {[
        [46, 212],
        [66, 206],
        [58, 226],
        [72, 222],
        [44, 228],
      ].map(([x, y]) => (
        <Circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={4}
          fill={url(ids.nodule)}
          stroke={c.soilDark}
          strokeWidth={0.6}
        />
      ))}
      {/* The rabbit that eats it, and grass. */}
      <GrassTuft x={110} y={GROUND} w={18} h={14} c={c} blades={5} />
      <G transform={`translate(150 ${GROUND - 16}) scale(0.95)`}>
        <Member m="rabbit" ids={ids} c={c} />
      </G>
      {/* Dead matter with mushrooms on it: the decomposers. */}
      <Rect
        x={214}
        y={GROUND - 12}
        width={44}
        height={12}
        rx={6}
        fill={c.bark}
        stroke={c.soilDark}
      />
      {[228, 242].map((mx) => (
        <G key={mx}>
          <Rect x={mx - 2} y={GROUND - 22} width={4} height={10} fill={c.featherLight} />
          <Path
            d={`M ${mx - 8} ${GROUND - 21} Q ${mx} ${GROUND - 34} ${mx + 8} ${GROUND - 21} Z`}
            fill={url(ids.cap)}
            stroke={c.soilDark}
            strokeWidth={0.6}
          />
        </G>
      ))}
      {/* The three forms in the soil. */}
      <Chip
        x={58}
        y={292}
        text="ammonium NH₄⁺"
        c={c}
        size={chart.label}
        lit={process === 'ammonification' || process === 'fixation'}
      />
      <Chip
        x={180}
        y={292}
        text="nitrite NO₂⁻"
        c={c}
        size={chart.label}
        lit={process === 'nitrification'}
      />
      <Chip
        x={300}
        y={292}
        text="nitrate NO₃⁻"
        c={c}
        size={chart.label}
        lit={['lightning', 'assimilation', 'denitrification', 'nitrification'].includes(
          process ?? '',
        )}
      />
      {FLOWS.map((f) => {
        const on = process === f.process;
        const all = process === undefined;
        return (
          <G key={f.process}>
            {f.arrows.map(([a, b, bend], i) => (
              <CurveArrow
                key={i}
                a={a}
                b={b}
                bend={bend}
                on={on || all}
                c={c}
                color={all ? c.chartInk : undefined}
                width={all ? chart.stroke : undefined}
                halo={!all}
                faint={0.22}
              />
            ))}
          </G>
        );
      })}
      {/* The lit process's name, over every arrow; the whole cycle leaves the names to the text. */}
      {FLOWS.filter((f) => f.process === process).map((f) => (
        <HaloText
          key={`label-${f.process}`}
          x={f.at[0]}
          y={f.at[1]}
          text={f.label}
          c={c}
          size={chart.label}
          bold
          anchor={f.anchor ?? 'middle'}
          fill={c.chartHighlight}
        />
      ))}
    </Board>
  );
}

/**
 * H109 reflex arc: a hand on a hot pan, the arm with its biceps, and the spinal cord in cross
 * section (gray matter as a butterfly in the white matter, the dorsal root and its ganglion
 * above, the ventral root below). A receptor in the fingertip's skin starts an impulse along the
 * sensory neuron (its cell body in the ganglion) into the cord's dorsal horn; an interneuron in
 * the gray matter passes it to the motor neuron in the ventral horn, whose axon, wrapped in
 * myelin, runs to the biceps (the effector), which contracts; a tract carries the message up to
 * the brain. `lit` lights one part; `impulse` draws the impulse's arrows along the path as far
 * as the lit part (the whole arc with none lit).
 *
 * The explore figure (`reflexArc`) labels every part; the card figure (`{ kind: 'reflexArc',
 * lit }`, 112 × 76, for sequence stages) is the same drawing small, unlabelled, its lit part in
 * the highlight (no impulse arrows, so the cards can't be ordered by counting them). Painted in the body's colors like the other body
 * figures, the neurons flat so the path reads.
 */
import { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { REFLEX_ORDER, type ReflexPart, type ReflexScene } from '@/data/modules/typesHs3d';
import { chart, usePalette, type Palette } from '@/theme';

import { ChartText } from '../reps/common';
import { BOARD_W, Board, HaloText } from './earthKit';

const H = 272;

/** The neurons' paths, drawn and followed by the impulse arrows. */
const SENSORY = 'M 40 197 C 90 150, 160 110, 222 92 L 270 104';
const MOTOR = 'M 272 140 C 250 160, 232 168, 206 174';
const INTER = 'M 272 108 L 272 134';
const BRAIN = 'M 292 86 L 292 26';

/** Points along each path for the impulse arrows, with their direction (degrees). */
const ARROWS: Record<Exclude<ReflexPart, 'receptor' | 'effector'>, [number, number, number][]> = {
  sensory: [
    [81, 163, -40],
    [127, 133, -30],
    [180, 102, -18],
    [248, 99, 14],
  ],
  interneuron: [[272, 122, 90]],
  motor: [
    [255, 153, 142],
    [228, 169, 165],
  ],
  brain: [[292, 50, -90]],
};

export function ReflexArcFigure({ scene }: { scene: ReflexScene }) {
  const c = usePalette();
  const lit = scene.lit;
  const on = (p: ReflexPart) => lit === p;
  const label = (
    p: ReflexPart,
    text: string,
    x: number,
    y: number,
    anchor: 'start' | 'end' | 'middle' = 'start',
  ) => (
    <HaloText
      x={x}
      y={y}
      text={text}
      c={c}
      size={chart.label}
      bold
      anchor={anchor}
      fill={on(p) ? c.chartHighlight : c.chartInk}
    />
  );
  return (
    <Board height={H}>
      <ReflexArcDrawing lit={lit} impulse={scene.impulse} c={c} />
      {label('receptor', 'Receptor in the skin', 8, 248)}
      <Line x1={40} y1={236} x2={40} y2={203} stroke={c.chartMuted} strokeWidth={1} />
      {label('sensory', 'Sensory neuron', 14, 126)}
      {label('effector', 'Muscle (effector)', 196, 248, 'middle')}
      {label('motor', 'Motor neuron', 150, 152)}
      {label('interneuron', 'Interneuron', 350, 206, 'end')}
      <Line x1={318} y1={196} x2={276} y2={124} stroke={c.chartMuted} strokeWidth={1} />
      <ChartText x={236} y={52} fontSize={chart.label} fill={c.chartMuted} textAnchor="end">
        Spinal cord
      </ChartText>
      <Line x1={238} y1={56} x2={256} y2={82} stroke={c.chartMuted} strokeWidth={1} />
      {label('brain', 'To the brain', 300, 16, 'middle')}
    </Board>
  );
}

/** The card: the drawing at 112 × 76, no labels. */
export const REFLEX_CARD_W = 112;
export const REFLEX_CARD_H = 76;

export function ReflexArcCard({ lit }: { lit: ReflexPart }) {
  const c = usePalette();
  const k = REFLEX_CARD_H / H;
  return (
    <G transform={`translate(${(REFLEX_CARD_W - BOARD_W * k) / 2} 0) scale(${k})`}>
      <ReflexArcDrawing lit={lit} card c={c} />
    </G>
  );
}

/** Parts the impulse has reached when `lit` is lit (the whole arc when none is). */
function reached(lit: ReflexPart | undefined): Set<ReflexPart> {
  if (!lit) return new Set(REFLEX_ORDER);
  return new Set(REFLEX_ORDER.slice(0, REFLEX_ORDER.indexOf(lit) + 1));
}

function ReflexArcDrawing({
  lit,
  impulse,
  card,
  c,
}: {
  lit: ReflexPart | undefined;
  impulse?: boolean;
  card?: boolean;
  c: Palette;
}) {
  const hi = c.chartHighlight;
  // A card is drawn a third of the size: its lines are thicker so they still read.
  const k = card ? 2.6 : 1;
  const nerve = (p: ReflexPart) => (lit === p ? hi : c.neuronCell);
  const width = (p: ReflexPart) => (lit === p ? 4.5 : 3) * k * (card && lit !== p ? 0.8 : 1);
  const got = reached(lit);
  const arrow = ([x, y, deg]: [number, number, number], key: string) => (
    <Polygon
      key={key}
      points="-6,-5 6,0 -6,5"
      transform={`translate(${x} ${y}) rotate(${deg}) scale(${card ? 2 : 1})`}
      fill={hi}
      stroke={c.chartSurface}
      strokeWidth={1}
    />
  );
  return (
    <G>
      {/* The hot pan under the fingertips, its heat rising. */}
      <Rect x={6} y={214} width={80} height={9} rx={3} fill={c.rubber} />
      {[20, 64].map((x) => (
        <Path
          key={x}
          d={`M ${x} 212 q -4 -5 0 -10 q 4 -5 0 -10`}
          stroke={c.orange}
          strokeWidth={2 * (card ? 1.6 : 1)}
          fill="none"
        />
      ))}
      {/* The arm: hand, forearm, and the upper arm up to the shoulder by the cord. */}
      <Path
        d="M 14 206 q 0 -14 16 -16 h 40 l 80 0 q 12 -4 20 -8 q 40 -16 80 -2 l 22 6 v 36 l -26 4 q -40 6 -80 -4 l -12 -2 h -84 q -20 0 -26 -4 q -8 -4 -8 -10 z"
        fill={c.skin}
        stroke={c.chartInk}
        strokeWidth={1.2 * k * 0.7}
      />
      {/* The thumb and the fingers' creases. */}
      <Path
        d="M 50 191 q 4 -10 16 -8 q 6 2 2 8"
        fill={c.skin}
        stroke={c.chartInk}
        strokeWidth={0.84 * k}
      />
      {[199, 205].map((y) => (
        <Line
          key={y}
          x1={18}
          y1={y}
          x2={46}
          y2={y}
          stroke={c.chartInk}
          strokeWidth={0.6 * k}
          opacity={0.5}
        />
      ))}
      {/* The biceps under the skin. */}
      <Ellipse
        cx={204}
        cy={190}
        rx={40}
        ry={12}
        fill={lit === 'effector' ? hi : c.organDeep}
        opacity={lit === 'effector' ? 0.95 : 0.8}
      />
      {/* The receptor: a nerve ending in the fingertip's skin. */}
      <Circle
        cx={40}
        cy={199}
        r={lit === 'receptor' ? 7 : 5}
        fill={lit === 'receptor' ? hi : c.neuronCell}
        stroke={c.chartInk}
        strokeWidth={1 * k * 0.6}
      />
      {/* The spinal cord: white matter, the gray-matter butterfly, the central canal. */}
      <Ellipse
        cx={292}
        cy={118}
        rx={52}
        ry={42}
        fill={c.bone}
        stroke={c.chartInk}
        strokeWidth={1.2 * k * 0.7}
      />
      <Path
        d="M 292 104 C 280 88, 262 80, 262 96 C 262 108, 276 110, 282 118 C 276 126, 262 132, 264 144 C 266 156, 284 146, 292 132 C 300 146, 318 156, 320 144 C 322 132, 308 126, 302 118 C 308 110, 322 108, 322 96 C 322 80, 304 88, 292 104 Z"
        fill={c.cordGray}
        stroke={c.chartMuted}
        strokeWidth={0.8 * k * 0.7}
      />
      <Circle cx={292} cy={118} r={2.5} fill={c.chartMuted} />
      {/* The ascending tract to the brain. */}
      <Path
        d={BRAIN}
        stroke={lit === 'brain' ? hi : c.neuronCell}
        strokeWidth={width('brain')}
        fill="none"
        strokeDasharray={lit === 'brain' ? undefined : '6 4'}
      />
      <Polygon points="286,30 292,18 298,30" fill={lit === 'brain' ? hi : c.neuronCell} />
      {/* Sensory neuron: dendrite from the receptor, the cell body in the ganglion, into the cord. */}
      <Ellipse
        cx={226}
        cy={90}
        rx={11}
        ry={8}
        fill={c.bone}
        stroke={c.chartMuted}
        strokeWidth={0.8 * k}
      />
      <Path
        d={SENSORY}
        stroke={nerve('sensory')}
        strokeWidth={width('sensory')}
        fill="none"
        strokeLinecap="round"
      />
      <Line
        x1={226}
        y1={90}
        x2={226}
        y2={80}
        stroke={nerve('sensory')}
        strokeWidth={width('sensory') * 0.7}
      />
      <Circle
        cx={226}
        cy={77}
        r={5 * (card ? 1.4 : 1)}
        fill={nerve('sensory')}
        stroke={c.chartInk}
        strokeWidth={0.8}
      />
      {/* Interneuron in the gray matter. */}
      <Path
        d={INTER}
        stroke={nerve('interneuron')}
        strokeWidth={width('interneuron')}
        fill="none"
        strokeLinecap="round"
      />
      <Circle
        cx={272}
        cy={121}
        r={4 * (card ? 1.4 : 1)}
        fill={nerve('interneuron')}
        stroke={c.chartInk}
        strokeWidth={0.8}
      />
      {/* Motor neuron: cell body in the ventral horn, a myelinated axon to the biceps. */}
      <Path
        d={MOTOR}
        stroke={c.neuronMyelin}
        strokeWidth={width('motor') + 5 * (card ? 1.4 : 1)}
        fill="none"
        strokeDasharray={card ? undefined : '12 3'}
      />
      <Path
        d={MOTOR}
        stroke={nerve('motor')}
        strokeWidth={width('motor')}
        fill="none"
        strokeLinecap="round"
      />
      <Circle
        cx={276}
        cy={140}
        r={6 * (card ? 1.3 : 1)}
        fill={nerve('motor')}
        stroke={c.chartInk}
        strokeWidth={0.8}
      />
      {[-10, 0, 10].map((d) => (
        <Line
          key={d}
          x1={206}
          y1={174}
          x2={198 + d}
          y2={182}
          stroke={nerve('motor')}
          strokeWidth={width('motor') * 0.6}
          strokeLinecap="round"
        />
      ))}
      {/* The impulse so far. */}
      {impulse
        ? (['sensory', 'interneuron', 'motor', 'brain'] as const).flatMap((p) =>
            got.has(p) ? ARROWS[p].map((a, i) => arrow(a, `${p}${i}`)) : [],
          )
        : null}
    </G>
  );
}

import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { FoodWebMember, Scene } from '@/data/modules/layouts';
import { chart, usePalette, type Palette } from '@/theme';

import { GrassTuft, SunDisk } from '../reps/nature';
import { Canvas, ChartText } from '../reps/common';
import { Ball, url, usePaintIds } from '../reps/paint';
import { Arrow } from './figures';

type Web = NonNullable<Scene['web']>;

/** Where each member sits, as fractions of the canvas: the sun and grass at the bottom, the hawk on top. */
const SPOTS: Record<FoodWebMember, [number, number]> = {
  hawk: [0.5, 0.14],
  frog: [0.4, 0.4],
  snake: [0.8, 0.38],
  rabbit: [0.12, 0.64],
  grasshopper: [0.42, 0.66],
  mouse: [0.74, 0.66],
  sun: [0.12, 0.87],
  grass: [0.5, 0.87],
};

/** Each arrow points from the eaten to the eater (the sun's arrow: its energy goes to the grass). */
const EATEN_BY: [FoodWebMember, FoodWebMember][] = [
  ['sun', 'grass'],
  ['grass', 'rabbit'],
  ['grass', 'grasshopper'],
  ['grass', 'mouse'],
  ['grasshopper', 'frog'],
  ['grasshopper', 'mouse'],
  ['frog', 'snake'],
  ['mouse', 'snake'],
  ['rabbit', 'hawk'],
  ['mouse', 'hawk'],
  ['snake', 'hawk'],
];

const NAMES: Record<FoodWebMember, string> = {
  sun: 'sun',
  grass: 'grass',
  rabbit: 'rabbit',
  grasshopper: 'grasshopper',
  mouse: 'mouse',
  frog: 'frog',
  snake: 'snake',
  hawk: 'hawk',
};

/**
 * A meadow food web with every arrow meaning "is eaten by". A scene can light one chain (the
 * rest fades), cross out a removed animal (its arrows turn dashed) and mark which members
 * grow in number or shrink.
 */
export function FoodWeb({ web }: { web: Web }) {
  const c = usePalette();
  const ids = usePaintIds('sun', 'fur', 'grey', 'feather', 'scales', 'frog', 'insect', 'cream');
  const chain = web.chain ?? [];
  const lit = (a: FoodWebMember, b: FoodWebMember) =>
    chain.some((m, i) => m === a && chain[i + 1] === b);
  const inChain = (m: FoodWebMember) => chain.length === 0 || chain.includes(m);
  return (
    <Canvas aspect={1.02}>
      {({ w, h }) => {
        const s = Math.max(0.9, Math.min(1.6, w / 300));
        const at = (m: FoodWebMember) => ({ x: SPOTS[m][0] * w, y: SPOTS[m][1] * h });
        // How far from the center an arrow stops: past the drawing and clear of its name.
        const reach = 28 * s;
        return (
          <Svg width={w} height={h}>
            <Defs>
              <Ball id={ids.sun} color={c.sunDisk} />
              <Ball id={ids.fur} color={c.fur} />
              <Ball id={ids.grey} color={c.furGrey} />
              <Ball id={ids.feather} color={c.feather} />
              <Ball id={ids.scales} color={c.scales} />
              <Ball id={ids.frog} color={c.frogSkin} />
              <Ball id={ids.insect} color={c.insect} />
              <Ball id={ids.cream} color={c.featherLight} />
            </Defs>
            {EATEN_BY.map(([a, b]) => {
              const p = at(a);
              const q = at(b);
              const len = Math.hypot(q.x - p.x, q.y - p.y);
              const ux = (q.x - p.x) / len;
              const uy = (q.y - p.y) / len;
              const on = lit(a, b);
              const gone = web.removed === a || web.removed === b;
              const faded = (chain.length > 0 && !on) || gone;
              return (
                <G key={`${a}-${b}`} opacity={faded ? 0.35 : 1}>
                  <Arrow
                    x1={p.x + ux * reach}
                    y1={p.y + uy * reach}
                    x2={q.x - ux * reach}
                    y2={q.y - uy * reach}
                    c={c}
                    color={on ? c.chartHighlight : c.chartMuted}
                    dashed={gone}
                  />
                  {on ? (
                    // A lit arrow is drawn twice as thick, so the chain reads without its color.
                    <Line
                      x1={p.x + ux * reach}
                      y1={p.y + uy * reach}
                      x2={q.x - ux * (reach + 4)}
                      y2={q.y - uy * (reach + 4)}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.strokeHeavy + 1}
                      strokeLinecap="round"
                    />
                  ) : null}
                </G>
              );
            })}
            {(Object.keys(SPOTS) as FoodWebMember[]).map((m) => {
              const { x, y } = at(m);
              const removed = web.removed === m;
              const dim = removed || !inChain(m);
              const more = web.more?.includes(m);
              const fewer = web.fewer?.includes(m);
              const name = removed ? `${NAMES[m]} gone` : NAMES[m];
              // The hawk's name goes above it, where no arrow comes in.
              const labelY = m === 'hawk' ? y - 26 * s : y + 30 * s;
              return (
                <G key={m}>
                  <G opacity={dim ? 0.35 : 1}>
                    <G transform={`translate(${x} ${y - 4 * s}) scale(${s})`}>
                      <Member m={m} ids={ids} c={c} />
                    </G>
                  </G>
                  {removed ? (
                    <G>
                      <Line
                        x1={x - 16 * s}
                        y1={y - 20 * s}
                        x2={x + 16 * s}
                        y2={y + 12 * s}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeHeavy}
                        strokeLinecap="round"
                      />
                      <Line
                        x1={x + 16 * s}
                        y1={y - 20 * s}
                        x2={x - 16 * s}
                        y2={y + 12 * s}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeHeavy}
                        strokeLinecap="round"
                      />
                    </G>
                  ) : null}
                  {/* A backing so an arrow passing behind a name never hides it. */}
                  <Rect
                    x={x - name.length * 3.3 - 3}
                    y={labelY - 10}
                    width={name.length * 6.6 + 6}
                    height={14}
                    rx={4}
                    fill={c.background}
                    opacity={0.85}
                  />
                  <ChartText
                    x={x}
                    y={labelY}
                    fontSize={chart.small}
                    textAnchor="middle"
                    fontWeight={chain.includes(m) ? '700' : undefined}
                    fill={dim ? c.chartMuted : c.chartInk}
                  >
                    {name}
                  </ChartText>
                  {more || fewer ? (
                    <Change
                      x={x > w * 0.78 ? x - 30 * s : x + 30 * s}
                      y={y - 16 * s}
                      up={!!more}
                      left={x > w * 0.78}
                      c={c}
                    />
                  ) : null}
                </G>
              );
            })}
          </Svg>
        );
      }}
    </Canvas>
  );
}

/** "more" with an up arrow, or "fewer" with a down arrow, beside a member. */
function Change({
  x,
  y,
  up,
  left,
  c,
}: {
  x: number;
  y: number;
  up: boolean;
  left: boolean;
  c: Palette;
}) {
  const tip = up ? y - 8 : y + 8;
  const tail = up ? y + 8 : y - 8;
  const head = up ? 5 : -5;
  return (
    <G>
      <Line
        x1={x}
        y1={tail}
        x2={x}
        y2={tip}
        stroke={c.chartHighlight}
        strokeWidth={chart.strokeHeavy}
      />
      <Path
        d={`M ${x - 5} ${tip + head} L ${x} ${tip} L ${x + 5} ${tip + head}`}
        stroke={c.chartHighlight}
        strokeWidth={chart.strokeHeavy}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <ChartText
        x={left ? x - 8 : x + 8}
        y={y + 4}
        fontSize={chart.tiny}
        fontWeight="700"
        textAnchor={left ? 'end' : 'start'}
      >
        {up ? 'more' : 'fewer'}
      </ChartText>
    </G>
  );
}

type Ids = Record<
  'sun' | 'fur' | 'grey' | 'feather' | 'scales' | 'frog' | 'insect' | 'cream',
  string
>;

/** One member drawn about (0, 0), about 44 wide and 34 tall, facing right, lit from the top left. */
function Member({ m, ids, c }: { m: FoodWebMember; ids: Ids; c: Palette }) {
  const eye = (x: number, y: number, r = 1.6) => (
    <G>
      <Circle cx={x} cy={y} r={r} fill={c.animalEye} />
      <Circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill={c.shine} />
    </G>
  );
  switch (m) {
    case 'sun':
      return <SunDisk x={0} y={0} r={11} ball={ids.sun} c={c} />;
    case 'grass':
      return (
        <G>
          <Ellipse cx={0} cy={13} rx={22} ry={3.5} fill={c.soil} />
          <GrassTuft x={-7} y={13} w={20} h={26} c={c} blades={7} />
          <GrassTuft x={9} y={13} w={18} h={20} c={c} blades={6} />
        </G>
      );
    case 'rabbit':
      return (
        <G>
          {/* Ears, then the body sitting up, the head, a cotton tail and the big back foot. */}
          <Ellipse
            cx={6}
            cy={-17}
            rx={3}
            ry={9}
            fill={url(ids.fur)}
            stroke={c.soilDark}
            strokeWidth={0.6}
            transform="rotate(-14 6 -17)"
          />
          <Ellipse
            cx={11}
            cy={-16}
            rx={3}
            ry={9}
            fill={url(ids.fur)}
            stroke={c.soilDark}
            strokeWidth={0.6}
            transform="rotate(14 11 -16)"
          />
          <Ellipse
            cx={-4}
            cy={4}
            rx={15}
            ry={11}
            fill={url(ids.fur)}
            stroke={c.soilDark}
            strokeWidth={0.6}
          />
          <Circle cx={9} cy={-5} r={8} fill={url(ids.fur)} stroke={c.soilDark} strokeWidth={0.6} />
          <Circle cx={-18} cy={2} r={4} fill={url(ids.cream)} />
          <Ellipse
            cx={-3}
            cy={14}
            rx={9}
            ry={3}
            fill={c.fur}
            stroke={c.soilDark}
            strokeWidth={0.6}
          />
          <Ellipse
            cx={8}
            cy={14}
            rx={4}
            ry={2.2}
            fill={c.fur}
            stroke={c.soilDark}
            strokeWidth={0.6}
          />
          {eye(12, -7)}
          <Circle cx={16.5} cy={-3.5} r={1.1} fill={c.soilDark} />
        </G>
      );
    case 'grasshopper':
      return (
        <G>
          {/* Back legs folded high, the long body with its wing, the head and feelers. */}
          <Path
            d="M -2 3 L -9 -10 L -20 11"
            stroke={c.lifeDeep}
            strokeWidth={2.4}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M -2 2 C -6 -4 -9 -9 -9 -10 C -6 -8 -2 -4 1 1 Z"
            fill={url(ids.insect)}
            stroke={c.lifeDeep}
            strokeWidth={0.8}
          />
          <Line x1={8} y1={5} x2={6} y2={13} stroke={c.lifeDeep} strokeWidth={1.4} />
          <Line x1={12} y1={5} x2={15} y2={13} stroke={c.lifeDeep} strokeWidth={1.4} />
          <Ellipse
            cx={0}
            cy={3}
            rx={16}
            ry={5.5}
            fill={url(ids.insect)}
            stroke={c.lifeDeep}
            strokeWidth={0.8}
          />
          <Path
            d="M -12 0 C -4 -5 6 -5 12 -1 C 4 1 -4 2 -12 0 Z"
            fill={c.lifeDeep}
            opacity={0.55}
          />
          <Ellipse
            cx={17}
            cy={1}
            rx={5}
            ry={5.5}
            fill={url(ids.insect)}
            stroke={c.lifeDeep}
            strokeWidth={0.8}
          />
          <Path
            d="M 19 -3 C 22 -12 26 -15 30 -16"
            stroke={c.lifeDeep}
            strokeWidth={1}
            fill="none"
          />
          {eye(18.5, -0.5, 1.5)}
        </G>
      );
    case 'mouse':
      return (
        <G>
          <Path
            d="M -14 8 C -22 8 -24 -2 -20 -6 C -17 -9 -14 -6 -16 -3"
            stroke={c.furGrey}
            strokeWidth={1.6}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M -15 10 C -17 -4 -2 -10 8 -4 C 14 -1 20 4 21 7 C 16 11 -6 13 -15 10 Z"
            fill={url(ids.grey)}
            stroke={c.chartMuted}
            strokeWidth={0.6}
          />
          <Circle
            cx={7}
            cy={-6}
            r={5.5}
            fill={url(ids.grey)}
            stroke={c.chartMuted}
            strokeWidth={0.6}
          />
          <Circle cx={7} cy={-6} r={3} fill={c.fur} opacity={0.6} />
          <Circle cx={21} cy={6.5} r={1.4} fill={c.animalEye} />
          <Line x1={20} y1={5} x2={27} y2={2} stroke={c.chartMuted} strokeWidth={0.5} />
          <Line x1={20} y1={6} x2={27} y2={7} stroke={c.chartMuted} strokeWidth={0.5} />
          {eye(14, 1, 1.4)}
        </G>
      );
    case 'frog':
      return (
        <G>
          {/* A frog sitting: the folded back leg, the body, the wide head and bulging eyes. */}
          <Path
            d="M -18 12 C -22 2 -10 -6 2 -4 C 12 -3 20 2 20 8 C 20 12 14 13 6 13 Z"
            fill={url(ids.frog)}
            stroke={c.lifeDeep}
            strokeWidth={0.7}
          />
          <Path
            d="M -2 13 C 2 16 8 16 12 13"
            stroke={c.featherLight}
            strokeWidth={2}
            fill="none"
            opacity={0.8}
          />
          <Ellipse
            cx={-9}
            cy={9}
            rx={10}
            ry={6}
            fill={url(ids.frog)}
            stroke={c.lifeDeep}
            strokeWidth={0.7}
          />
          <Path d="M -4 14 L 4 15 L 0 13" stroke={c.lifeDeep} strokeWidth={1.2} fill="none" />
          <Line x1={14} y1={10} x2={16} y2={16} stroke={c.lifeDeep} strokeWidth={2} />
          <Circle
            cx={10}
            cy={-6}
            r={4.5}
            fill={url(ids.frog)}
            stroke={c.lifeDeep}
            strokeWidth={0.7}
          />
          {eye(11, -6.5, 2)}
          <Path d="M 12 3 C 15 4 18 4 20 3" stroke={c.lifeDeep} strokeWidth={0.8} fill="none" />
        </G>
      );
    case 'snake':
      return (
        <G>
          <Path
            d="M -22 12 C -14 12 -12 2 -4 2 C 4 2 4 12 12 10 C 17 9 17 0 13 -4"
            stroke={c.scales}
            strokeWidth={7}
            strokeLinecap="round"
            fill="none"
          />
          {/* The back pattern: a darker dashed stripe, and a light stripe for the sheen. */}
          <Path
            d="M -22 12 C -14 12 -12 2 -4 2 C 4 2 4 12 12 10 C 17 9 17 0 13 -4"
            stroke={c.soilDark}
            strokeWidth={2.4}
            strokeDasharray="3 4"
            fill="none"
            opacity={0.6}
          />
          <Path
            d="M -22 10.5 C -14 10.5 -12 0.5 -4 0.5"
            stroke={c.shine}
            strokeWidth={1}
            fill="none"
            opacity={0.35}
          />
          <Ellipse
            cx={15}
            cy={-7}
            rx={7}
            ry={4.5}
            fill={url(ids.scales)}
            stroke={c.soilDark}
            strokeWidth={0.6}
            transform="rotate(-20 15 -7)"
          />
          <Path
            d="M 21 -10 L 26 -12 M 26 -12 L 28 -14 M 26 -12 L 28 -11"
            stroke={c.mercury}
            strokeWidth={0.9}
          />
          {eye(17, -9, 1.3)}
        </G>
      );
    case 'hawk':
      return (
        <G>
          {/* Seen from below with wings spread: long wings, a fanned tail, a pale chest. */}
          <Path
            d="M -3 -4 C -12 -12 -22 -12 -30 -8 C -25 -6 -22 -2 -20 1 C -16 -1 -10 0 -4 4 Z"
            fill={url(ids.feather)}
            stroke={c.soilDark}
            strokeWidth={0.6}
          />
          <Path
            d="M 3 -4 C 12 -12 22 -12 30 -8 C 25 -6 22 -2 20 1 C 16 -1 10 0 4 4 Z"
            fill={url(ids.feather)}
            stroke={c.soilDark}
            strokeWidth={0.6}
          />
          <Path
            d="M -30 -8 L -27 -4 M -27 -9 L -24 -4 M 30 -8 L 27 -4 M 27 -9 L 24 -4"
            stroke={c.soilDark}
            strokeWidth={0.8}
          />
          <Path
            d="M -4 10 L -7 18 L 7 18 L 4 10 Z"
            fill={url(ids.feather)}
            stroke={c.soilDark}
            strokeWidth={0.6}
          />
          <Ellipse
            cx={0}
            cy={2}
            rx={5.5}
            ry={10}
            fill={url(ids.cream)}
            stroke={c.soilDark}
            strokeWidth={0.6}
          />
          <Circle
            cx={0}
            cy={-9}
            r={4.5}
            fill={url(ids.feather)}
            stroke={c.soilDark}
            strokeWidth={0.6}
          />
          <Path d="M -1.5 -6 L 1.5 -6 L 0 -3 Z" fill={c.sunDisk} />
          <Circle cx={-1.8} cy={-10} r={0.9} fill={c.animalEye} />
          <Circle cx={1.8} cy={-10} r={0.9} fill={c.animalEye} />
        </G>
      );
  }
}

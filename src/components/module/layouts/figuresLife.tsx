import type { ReactNode } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type {
  CarbonProcess,
  LeafCellSubstance,
  PedigreePerson,
  Scene,
} from '@/data/modules/layouts';
import { chart, usePalette, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { SunDisk } from '../reps/nature';
import { Ball, Deepen, TopLight, url, usePaintIds } from '../reps/paint';
import { Member } from './foodWeb';

/**
 * Explore figures for Grade 7 life science (docs/MODULE_GUIDE.md, "Module layouts"): a leaf
 * and a cell with their inputs and outputs, the carbon cycle, and a pedigree chart. The
 * living things are drawn in their materials; arrows, labels and the chart stay flat. Each
 * figure is laid out on a 360-wide board and scaled to the canvas.
 */

const BOARD = 360;

/** Text width estimate at a font size (as `fitLabel` does). */
const textW = (s: string, size: number) => s.length * size * 0.58;

/**
 * A curved arrow from `a` to `b`, bowed `bend` px to the left of the way it goes, with its
 * label at `at`. Lit: heavy and in the highlight; dim: faded (another arrow is lit).
 */
function Flow({
  a,
  b,
  bend = 0,
  label,
  at,
  anchor = 'middle',
  on,
  dim,
  dashed,
  ground,
  c,
}: {
  a: [number, number];
  b: [number, number];
  bend?: number;
  label?: string;
  at?: [number, number];
  anchor?: 'start' | 'middle' | 'end';
  on?: boolean;
  dim?: boolean;
  dashed?: boolean;
  /** The label sits on soil or rock: light text, no backing. */
  ground?: boolean;
  c: Palette;
}) {
  const [mx, my] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  // The control point: off the middle, to the left of the direction of travel.
  const q = [mx + (bend * (b[1] - a[1])) / len, my - (bend * (b[0] - a[0])) / len] as const;
  const t = Math.atan2(b[1] - q[1], b[0] - q[0]);
  const head = on ? 11 : 8;
  const hx = (d: number) => b[0] - head * Math.cos(t + d);
  const hy = (d: number) => b[1] - head * Math.sin(t + d);
  const stroke = on ? c.chartHighlight : c.chartMuted;
  const width = on ? chart.strokeHeavy : chart.stroke;
  return (
    <G opacity={dim ? 0.35 : 1}>
      <Path
        d={`M ${a[0]} ${a[1]} Q ${q[0]} ${q[1]} ${b[0]} ${b[1]}`}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? chart.dash : undefined}
        fill="none"
      />
      <Path
        d={`M ${hx(0.45)} ${hy(0.45)} L ${b[0]} ${b[1]} L ${hx(-0.45)} ${hy(-0.45)}`}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {label && at && !ground ? (
        // A backing, so an arrow passing behind a label never hides it.
        <Rect
          x={
            at[0] -
            (anchor === 'middle'
              ? textW(label, chart.small) / 2
              : anchor === 'end'
                ? textW(label, chart.small)
                : 0) -
            3
          }
          y={at[1] - 11}
          width={textW(label, chart.small) + 6}
          height={15}
          rx={4}
          fill={c.background}
          opacity={0.85}
        />
      ) : null}
      {label && at ? (
        <ChartText
          x={at[0]}
          y={at[1]}
          fontSize={chart.small}
          fontWeight={on ? '700' : '400'}
          fill={on && !ground ? c.chartHighlight : ground ? c.snow : c.chartInk}
          textAnchor={anchor}
        >
          {label}
        </ChartText>
      ) : null}
    </G>
  );
}

/** A board `BOARD` wide and `height` tall, scaled to fit the canvas width. */
function Board({ height, children }: { height: number; children: ReactNode }) {
  return (
    <Canvas aspect={height / BOARD}>
      {({ w, h }) => (
        <Svg width={w} height={h}>
          <G transform={`scale(${w / BOARD})`}>{children}</G>
        </Svg>
      )}
    </Canvas>
  );
}

/** A word equation, centered as a whole, with "light" over its arrow when it takes light. */
function WordEquation({
  left,
  right,
  y,
  over,
  c,
}: {
  left: string;
  right: string;
  y: number;
  over?: string;
  c: Palette;
}) {
  const size = chart.small;
  const gap = 14;
  const lw = textW(left, size);
  const rw = textW(right, size);
  const x = BOARD / 2 + (lw - rw) / 2;
  return (
    <G>
      <ChartText x={x - gap} y={y} fontSize={size} textAnchor="end">
        {left}
      </ChartText>
      <ChartText x={x} y={y} fontSize={size + 2} textAnchor="middle" fontWeight="700">
        →
      </ChartText>
      <ChartText x={x + gap} y={y} fontSize={size} textAnchor="start">
        {right}
      </ChartText>
      {over ? (
        <ChartText x={x} y={y - 15} fontSize={chart.tiny} textAnchor="middle" fill={c.chartMuted}>
          {over}
        </ChartText>
      ) : null}
    </G>
  );
}

// ── The leaf and the cell ──

/**
 * A leaf on its stem, base at (x, y), pointing at `angle` degrees, `size` long: lit green,
 * with its midrib and side veins.
 */
function BigLeaf({
  x,
  y,
  angle,
  size,
  light,
  c,
}: {
  x: number;
  y: number;
  angle: number;
  size: number;
  /** A TopLight gradient id. */
  light: string;
  c: Palette;
}) {
  const wd = size * 0.34;
  const outline = `M 0 0 C ${size * 0.2} ${-wd} ${size * 0.72} ${-wd * 1.05} ${size} 0 C ${size * 0.72} ${wd * 1.05} ${size * 0.2} ${wd} 0 0 Z`;
  return (
    <G transform={`translate(${x} ${y}) rotate(${angle})`}>
      <Path d={outline} fill={c.life} stroke={c.lifeDeep} strokeWidth={1.4} />
      <Path d={outline} fill={url(light)} />
      <Line x1={0} y1={0} x2={size * 0.93} y2={0} stroke={c.lifeDeep} strokeWidth={1.4} />
      {[0.2, 0.36, 0.52, 0.68].map((t) => {
        // Side veins run out toward the edge and stop inside it (the leaf's half-width there).
        const u = t + 0.13;
        const end = wd * 0.75 * 4 * u * (1 - u) * 0.72;
        return (
          <G key={t}>
            {[-1, 1].map((side) => (
              <Path
                key={side}
                d={`M ${size * t} 0 Q ${size * (t + 0.06)} ${side * end * 0.5} ${size * u} ${side * end}`}
                stroke={c.lifeDeep}
                strokeWidth={0.8}
                fill="none"
              />
            ))}
          </G>
        );
      })}
    </G>
  );
}

/** A cell (a lit blob of cytoplasm) with its nucleus and two mitochondria, about (x, y). */
function LitCell({
  x,
  y,
  rx,
  ry,
  ids,
  c,
}: {
  x: number;
  y: number;
  rx: number;
  ry: number;
  ids: { cell: string; nucleus: string; mito: string };
  c: Palette;
}) {
  const mito = (mx: number, my: number, turn: number) => (
    <G transform={`translate(${mx} ${my}) rotate(${turn})`}>
      <Ellipse
        cx={0}
        cy={0}
        rx={rx * 0.24}
        ry={ry * 0.15}
        fill={url(ids.mito)}
        stroke={c.furDark}
        strokeWidth={0.8}
      />
      <Path
        d={`M ${-rx * 0.17} 0 l ${rx * 0.05} ${-ry * 0.08} l ${rx * 0.06} ${ry * 0.15} l ${rx * 0.06} ${-ry * 0.15} l ${rx * 0.06} ${ry * 0.15} l ${rx * 0.05} ${-ry * 0.08}`}
        stroke={c.furDark}
        strokeWidth={0.8}
        fill="none"
      />
    </G>
  );
  return (
    <G>
      <Ellipse cx={x + 3} cy={y + ry + 4} rx={rx * 0.8} ry={4} fill={c.shadow} />
      <Ellipse
        cx={x}
        cy={y}
        rx={rx}
        ry={ry}
        fill={url(ids.cell)}
        stroke={c.rock5}
        strokeWidth={chart.stroke}
      />
      <Circle
        cx={x - rx * 0.28}
        cy={y - ry * 0.12}
        r={Math.min(rx, ry) * 0.3}
        fill={url(ids.nucleus)}
        stroke={c.furDark}
        strokeWidth={0.8}
      />
      {mito(x + rx * 0.35, y - ry * 0.3, -18)}
      {mito(x + rx * 0.32, y + ry * 0.4, 14)}
    </G>
  );
}

const PHOTO = { left: 'carbon dioxide + water', right: 'sugar + oxygen' };
const RESP = { left: 'sugar + oxygen', right: 'carbon dioxide + water + energy' };

/**
 * Photosynthesis (a leaf in the light), respiration (a cell with its mitochondria), or both
 * side by side, the leaf's outputs going into the cell and the cell's back to the leaf. Each
 * input and output is a labelled arrow; `lit` lights one and fades the rest.
 */
export function LeafCellFigure({
  scene,
  c,
}: {
  scene: NonNullable<Scene['leafCell']>;
  c: Palette;
}) {
  const ids = usePaintIds('sun', 'leaf', 'cell', 'nucleus', 'mito');
  const flow = (s: LeafCellSubstance) => ({
    on: scene.lit === s,
    dim: scene.lit !== undefined && scene.lit !== s,
    c,
  });
  const defs = (
    <Defs>
      <Ball id={ids.sun} color={c.sunDisk} />
      <TopLight id={ids.leaf} />
      <Ball id={ids.cell} color={c.rock6} />
      <Ball id={ids.nucleus} color={c.purple} />
      <Ball id={ids.mito} color={c.orange} />
    </Defs>
  );
  if (scene.process === 'photosynthesis') {
    return (
      <Board height={302}>
        <G>
          {defs}
          <SunDisk x={44} y={44} r={18} ball={ids.sun} c={c} />
          <Path
            d="M 176 262 C 174 230 178 200 176 172"
            stroke={c.lifeDeep}
            strokeWidth={5}
            strokeLinecap="round"
            fill="none"
          />
          <BigLeaf x={176} y={172} angle={-38} size={150} light={ids.leaf} c={c} />
          <Flow a={[70, 62]} b={[204, 122]} label="light" at={[126, 78]} {...flow('light')} />
          <Flow
            a={[14, 150]}
            b={[206, 146]}
            bend={-6}
            label="carbon dioxide"
            at={[14, 140]}
            anchor="start"
            {...flow('carbon dioxide')}
          />
          <Flow
            a={[160, 262]}
            b={[162, 190]}
            label="water"
            at={[152, 236]}
            anchor="end"
            {...flow('water')}
          />
          <Flow
            a={[194, 186]}
            b={[194, 258]}
            label="sugar"
            at={[202, 236]}
            anchor="start"
            {...flow('sugar')}
          />
          <Flow
            a={[262, 150]}
            b={[340, 186]}
            bend={-8}
            label="oxygen"
            at={[344, 206]}
            anchor="end"
            {...flow('oxygen')}
          />
          {/* Low enough that "light" over its arrow clears the sugar arrow's tip. */}
          <WordEquation {...PHOTO} y={294} over="light" c={c} />
        </G>
      </Board>
    );
  }
  if (scene.process === 'respiration') {
    return (
      <Board height={270}>
        <G>
          {defs}
          <LitCell
            x={184}
            y={122}
            rx={80}
            ry={64}
            ids={{ cell: ids.cell, nucleus: ids.nucleus, mito: ids.mito }}
            c={c}
          />
          <Line x1={216} y1={98} x2={236} y2={44} stroke={c.chartMuted} strokeWidth={1} />
          <ChartText x={236} y={38} fontSize={chart.tiny} textAnchor="middle">
            mitochondria
          </ChartText>
          <ChartText x={128} y={38} fontSize={chart.tiny} textAnchor="middle" fill={c.chartMuted}>
            a cell
          </ChartText>
          <Flow
            a={[14, 104]}
            b={[108, 108]}
            label="sugar"
            at={[14, 94]}
            anchor="start"
            {...flow('sugar')}
          />
          <Flow
            a={[14, 150]}
            b={[108, 142]}
            label="oxygen"
            at={[14, 170]}
            anchor="start"
            {...flow('oxygen')}
          />
          <Flow
            a={[258, 96]}
            b={[344, 70]}
            label="carbon dioxide"
            at={[346, 60]}
            anchor="end"
            {...flow('carbon dioxide')}
          />
          <Flow
            a={[260, 148]}
            b={[344, 176]}
            label="water"
            at={[346, 196]}
            anchor="end"
            {...flow('water')}
          />
          <Flow
            a={[200, 192]}
            b={[228, 238]}
            label="energy"
            at={[236, 232]}
            anchor="start"
            {...flow('energy')}
          />
          <WordEquation {...RESP} y={262} c={c} />
        </G>
      </Board>
    );
  }
  // Both: the leaf's sugar and oxygen go into the cell; its carbon dioxide and water go back.
  return (
    <Board height={330}>
      <G>
        {defs}
        <SunDisk x={30} y={32} r={14} ball={ids.sun} c={c} />
        <Path
          d="M 70 234 C 68 214 72 196 70 180"
          stroke={c.lifeDeep}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
        <BigLeaf x={70} y={180} angle={-58} size={112} light={ids.leaf} c={c} />
        <LitCell
          x={284}
          y={146}
          rx={58}
          ry={48}
          ids={{ cell: ids.cell, nucleus: ids.nucleus, mito: ids.mito }}
          c={c}
        />
        <ChartText x={70} y={250} fontSize={chart.tiny} textAnchor="middle" fill={c.chartMuted}>
          leaf
        </ChartText>
        <ChartText x={284} y={214} fontSize={chart.tiny} textAnchor="middle" fill={c.chartMuted}>
          cell
        </ChartText>
        <Flow
          a={[46, 48]}
          b={[92, 96]}
          label="light"
          at={[74, 60]}
          anchor="start"
          {...flow('light')}
        />
        <Flow
          a={[128, 94]}
          b={[228, 118]}
          bend={16}
          label="oxygen"
          at={[176, 84]}
          {...flow('oxygen')}
        />
        <Flow
          a={[122, 140]}
          b={[224, 150]}
          bend={6}
          label="sugar"
          at={[176, 132]}
          {...flow('sugar')}
        />
        <Flow
          a={[240, 182]}
          b={[108, 176]}
          bend={14}
          label="carbon dioxide"
          at={[176, 204]}
          {...flow('carbon dioxide')}
        />
        <Flow
          a={[262, 198]}
          b={[92, 206]}
          bend={30}
          label="water"
          at={[176, 244]}
          {...flow('water')}
        />
        <Flow
          a={[316, 188]}
          b={[340, 232]}
          label="energy"
          at={[346, 248]}
          anchor="end"
          {...flow('energy')}
        />
        <WordEquation {...PHOTO} y={290} over="light" c={c} />
        <WordEquation {...RESP} y={318} c={c} />
      </G>
    </Board>
  );
}

// ── The carbon cycle ──

/** Every arrow of the carbon cycle: its process, ends, bend and label. */
const CARBON: {
  process: CarbonProcess;
  a: [number, number];
  b: [number, number];
  bend?: number;
  label?: string;
  at?: [number, number];
  anchor?: 'start' | 'middle' | 'end';
  dashed?: boolean;
  ground?: boolean;
}[] = [
  {
    process: 'photosynthesis',
    a: [132, 44],
    b: [86, 98],
    label: 'photosynthesis',
    at: [112, 80],
    anchor: 'start',
  },
  {
    process: 'respiration',
    a: [36, 100],
    b: [96, 32],
    bend: -10,
    label: 'respiration',
    at: [6, 60],
    anchor: 'start',
  },
  { process: 'respiration', a: [138, 172], b: [160, 46], bend: -8 },
  {
    process: 'eating',
    a: [92, 168],
    b: [118, 188],
    label: 'eating',
    at: [104, 164],
    anchor: 'start',
  },
  { process: 'death', a: [150, 214], b: [176, 214], bend: 8 },
  {
    process: 'death',
    a: [74, 216],
    b: [178, 226],
    bend: 16,
    label: 'death and waste',
    at: [96, 252],
    anchor: 'start',
    ground: true,
  },
  {
    process: 'decomposition',
    a: [196, 186],
    b: [194, 46],
    // Short, so it fits between its arrow and the burning arrow.
    label: 'decay',
    at: [200, 124],
    anchor: 'start',
  },
  { process: 'burning', a: [252, 296], b: [252, 222] },
  {
    process: 'burning',
    a: [254, 124],
    b: [250, 44],
    label: 'burning',
    // Left of its arrow: to the right the ocean's arrows pass.
    at: [246, 84],
    anchor: 'end',
  },
  {
    process: 'dissolving',
    a: [276, 32],
    b: [320, 196],
    bend: -14,
    label: 'dissolving',
    at: [352, 116],
    anchor: 'end',
  },
  { process: 'dissolving', a: [306, 198], b: [264, 44], bend: -14 },
  {
    process: 'burial',
    a: [196, 236],
    b: [184, 290],
    dashed: true,
    label: 'millions of years',
    at: [196, 280],
    anchor: 'start',
    ground: true,
  },
];

/** The volcano's outgassing: up the right edge from its crater to the air (H103). */
const VOLCANO: (typeof CARBON)[number] = {
  process: 'volcano',
  a: [352, 172],
  b: [352, 50],
  label: 'volcanoes',
  at: [344, 66],
  anchor: 'end',
};

/**
 * A volcanic island at the ocean's right edge (H103): its cone above the water, lava at the
 * crater, and the magma chamber in the rock below the seafloor that feeds it.
 */
function Volcano({ c }: { c: Palette }) {
  const sea = 212;
  const floor = 274;
  return (
    <G>
      <Ellipse cx={338} cy={312} rx={20} ry={9} fill={c.landMagma} opacity={0.9} />
      {/* The island rises from the seafloor; the water covers its lower slopes. */}
      <Path
        d={`M 332 ${floor} L 344 176 L 352 176 L ${BOARD} 188 L ${BOARD} ${floor} Z`}
        fill={c.landBasalt}
        stroke={c.soilDark}
        strokeWidth={0.8}
      />
      <Path d="M 338 304 L 342 260 L 348 178" stroke={c.landMagma} strokeWidth={3} fill="none" />
      <Rect
        x={332}
        y={sea}
        width={BOARD - 332}
        height={floor - sea}
        fill={c.waterDeep}
        opacity={0.45}
      />
      <Path d="M 344 176 Q 348 182 352 176" stroke={c.landLava} strokeWidth={3} fill="none" />
    </G>
  );
}

/**
 * The carbon cycle over a meadow: carbon dioxide in the air; a tree that takes it in and
 * gives it back; a rabbit that eats and breathes; dead matter and the mushrooms that break it
 * down; coal and oil deep under the soil, burned in a factory; and the ocean, which takes it
 * in and gives it out. A process lit lights its arrows and fades the rest.
 */
export function CarbonCycleFigure({
  carbon,
  c,
  volcano,
}: {
  carbon: NonNullable<Scene['carbon']>;
  c: Palette;
  /** H103: a volcanic island in the ocean and its outgassing (off unless the figure sets it). */
  volcano?: boolean;
}) {
  const ids = usePaintIds(
    'sun',
    'crown',
    'factory',
    'sea',
    'cap',
    'fur',
    'cream',
    'grey',
    'feather',
    'scales',
    'frog',
    'insect',
  );
  const lit = carbon.process;
  const ground = 222;
  return (
    <Board height={336}>
      <G>
        <Defs>
          <Ball id={ids.sun} color={c.sunDisk} />
          <Ball id={ids.crown} color={c.life} />
          <TopLight id={ids.factory} />
          <Deepen id={ids.sea} from={c.water} to={c.waterDeep} />
          <Ball id={ids.cap} color={c.fur} />
          <Ball id={ids.fur} color={c.fur} />
          <Ball id={ids.cream} color={c.featherLight} />
        </Defs>
        {/* The air. */}
        <Rect
          x={92}
          y={10}
          width={190}
          height={30}
          rx={15}
          fill={c.chartSurface}
          stroke={c.chartGrid}
          strokeWidth={chart.strokeLight}
        />
        <ChartText x={187} y={29} fontSize={chart.small} fontWeight="700" textAnchor="middle">
          carbon dioxide in the air
        </ChartText>
        <SunDisk x={336} y={22} r={10} ball={ids.sun} c={c} />
        {/* Deep rock with coal and oil, the soil, and the ocean. */}
        <Rect x={0} y={264} width={BOARD} height={72} fill={c.rock5} />
        <Path
          d="M 150 300 C 170 286 250 284 300 296 C 318 306 306 322 270 324 C 220 328 160 326 150 314 Z"
          fill={c.rubber}
        />
        <ChartText x={228} y={312} fontSize={chart.small} textAnchor="middle" fill={c.snow}>
          coal and oil
        </ChartText>
        <Rect x={0} y={ground} width={272} height={264 - ground} fill={c.soil} />
        <Rect
          x={272}
          y={ground - 10}
          width={BOARD - 272}
          height={274 - ground}
          fill={url(ids.sea)}
        />
        <Path
          d={`M 272 ${ground - 10} q 11 -5 22 0 t 22 0 t 22 0 t 22 0 t 22 0`}
          stroke={c.waterTop}
          strokeWidth={chart.stroke}
          fill="none"
        />
        <ChartText x={316} y={ground + 26} fontSize={chart.small} textAnchor="middle" fill={c.snow}>
          ocean
        </ChartText>
        <Line x1={0} y1={ground} x2={272} y2={ground} stroke={c.lifeDeep} strokeWidth={3} />
        {/* The tree. */}
        <Rect x={52} y={146} width={14} height={ground - 146} fill={c.bark} stroke={c.soilDark} />
        <Circle cx={40} cy={140} r={24} fill={url(ids.crown)} stroke={c.lifeDeep} />
        <Circle cx={82} cy={138} r={24} fill={url(ids.crown)} stroke={c.lifeDeep} />
        <Circle cx={60} cy={116} r={30} fill={url(ids.crown)} stroke={c.lifeDeep} />
        {/* The rabbit. */}
        <G transform={`translate(134 ${ground - 16}) scale(0.9)`}>
          <Member m="rabbit" ids={ids} c={c} />
        </G>
        {/* Dead matter: a fallen log with mushrooms on it. */}
        <Rect
          x={172}
          y={ground - 12}
          width={44}
          height={12}
          rx={6}
          fill={c.bark}
          stroke={c.soilDark}
        />
        <Ellipse cx={216} cy={ground - 6} rx={4} ry={6} fill={c.furLight} stroke={c.soilDark} />
        {[
          [186, ground - 12],
          [198, ground - 12],
        ].map(([mx, my]) => (
          <G key={mx}>
            <Rect x={mx! - 2} y={my! - 10} width={4} height={10} fill={c.featherLight} />
            <Path
              d={`M ${mx! - 8} ${my! - 9} Q ${mx} ${my! - 22} ${mx! + 8} ${my! - 9} Z`}
              fill={url(ids.cap)}
              stroke={c.soilDark}
              strokeWidth={0.6}
            />
          </G>
        ))}
        <ChartText x={194} y={ground + 14} fontSize={chart.tiny} textAnchor="middle" fill={c.snow}>
          dead matter
        </ChartText>
        {/* The factory. */}
        <Rect x={232} y={140} width={12} height={46} fill={c.metal} stroke={c.metalDark} />
        <Rect
          x={224}
          y={180}
          width={44}
          height={ground - 180}
          fill={c.metal}
          stroke={c.metalDark}
        />
        <Rect x={224} y={180} width={44} height={ground - 180} fill={url(ids.factory)} />
        {[0, 1, 2].map((i) => (
          <Rect
            key={i}
            x={230 + i * 13}
            y={192}
            width={8}
            height={10}
            fill={c.sunDisk}
            opacity={0.8}
          />
        ))}
        {[
          [240, 130, 6],
          [246, 120, 7],
        ].map(([sx, sy, r]) => (
          <Circle key={sx} cx={sx} cy={sy} r={r} fill={c.chartMuted} opacity={0.5} />
        ))}
        {volcano ? <Volcano c={c} /> : null}
        {(volcano ? [...CARBON, VOLCANO] : CARBON).map((f, i) => (
          <Flow
            key={i}
            a={f.a}
            b={f.b}
            bend={f.bend}
            label={f.label}
            // With the volcano's arrow up the right edge, the ocean's label moves in from it.
            at={volcano && f.process === 'dissolving' && f.at ? [f.at[0] - 12, f.at[1]] : f.at}
            anchor={f.anchor}
            dashed={f.dashed}
            ground={f.ground}
            on={lit === f.process}
            dim={lit !== undefined && lit !== f.process}
            c={c}
          />
        ))}
      </G>
    </Board>
  );
}

// ── The pedigree ──

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

/**
 * A pedigree chart: a row per generation, people spaced evenly in the order listed, a line
 * joining parents and their children hanging from a line below it. Squares are males,
 * circles females; filled shows the trait, half-filled carries it. A scene rings people,
 * writes each genotype under its symbol, or asks for one with "?". A key sits underneath.
 */
export function PedigreeFigure({
  people,
  family,
}: {
  people: PedigreePerson[];
  family: NonNullable<Scene['family']>;
}) {
  const c = usePalette();
  const gens = [...new Set(people.map((p) => p.generation))].sort((a, b) => a - b);
  const rowH = family.genotypes || family.ask ? 84 : 72;
  const top = 26;
  const keyH = 40;
  const height = top + gens.length * rowH + keyH;
  const left = 34;
  const byId = new Map(people.map((p) => [p.id, p]));
  const rowOf = (p: PedigreePerson) => gens.indexOf(p.generation);
  const place = new Map<string, { x: number; y: number; n: number }>();
  const widest = Math.max(...gens.map((g) => people.filter((p) => p.generation === g).length));
  const size = Math.min(28, ((BOARD - left - 10) / widest) * 0.42);
  for (const g of gens) {
    const row = people.filter((p) => p.generation === g);
    const slot = (BOARD - left - 10) / row.length;
    row.forEach((p, i) =>
      place.set(p.id, {
        x: left + slot * (i + 0.5),
        y: top + rowOf(p) * rowH + size / 2,
        n: i + 1,
      }),
    );
  }
  // Couples: from each child's parents, and partners with no children shown.
  const couples = new Map<string, { a: string; b: string; kids: string[] }>();
  for (const p of people) {
    const pair = p.parents ?? (p.partner ? ([p.id, p.partner] as [string, string]) : undefined);
    if (!pair || !byId.has(pair[0]) || !byId.has(pair[1])) continue;
    const key = [...pair].sort().join('+');
    const couple = couples.get(key) ?? { a: pair[0], b: pair[1], kids: [] };
    if (p.parents) couple.kids.push(p.id);
    couples.set(key, couple);
  }
  const lit = new Set(family.lit ?? []);
  return (
    <Board height={height}>
      <G>
        {gens.map((g, i) => (
          <ChartText
            key={g}
            x={6}
            y={top + i * rowH + size / 2 + 5}
            fontSize={chart.value}
            fontWeight="700"
            fill={c.chartMuted}
          >
            {ROMAN[i] ?? String(i + 1)}
          </ChartText>
        ))}
        {[...couples.values()].map(({ a, b, kids }) => {
          const pa = place.get(a)!;
          const pb = place.get(b)!;
          const [l, r] = pa.x < pb.x ? [pa, pb] : [pb, pa];
          const mid = (l.x + r.x) / 2;
          const drop = kids.length ? place.get(kids[0]!)!.y - size / 2 : 0;
          // The children's line sits just over their symbols, clear of the parents' labels.
          const sib = drop - 12;
          const xs = kids.map((k) => place.get(k)!.x);
          return (
            <G key={`${a}+${b}`}>
              <Line
                x1={l.x + size / 2}
                y1={l.y}
                x2={r.x - size / 2}
                y2={r.y}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {kids.length ? (
                <G>
                  <Line
                    x1={mid}
                    y1={l.y}
                    x2={mid}
                    y2={sib}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  <Line
                    x1={Math.min(mid, ...xs)}
                    y1={sib}
                    x2={Math.max(mid, ...xs)}
                    y2={sib}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  {xs.map((x, i) => (
                    <Line
                      key={i}
                      x1={x}
                      y1={sib}
                      x2={x}
                      y2={drop}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                  ))}
                </G>
              ) : null}
            </G>
          );
        })}
        {people.map((p) => {
          const at = place.get(p.id)!;
          const asked = family.ask === p.id;
          const genotype = asked ? '?' : family.genotypes ? p.genotype : undefined;
          return (
            <G key={p.id}>
              {lit.has(p.id) ? (
                p.sex === 'male' ? (
                  <Rect
                    x={at.x - size / 2 - 5}
                    y={at.y - size / 2 - 5}
                    width={size + 10}
                    height={size + 10}
                    rx={4}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                  />
                ) : (
                  <Circle
                    cx={at.x}
                    cy={at.y}
                    r={size / 2 + 5}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                  />
                )
              ) : null}
              <PedigreeSymbol
                x={at.x}
                y={at.y}
                size={size}
                person={family.carriers ? p : { ...p, carrier: false }}
                c={c}
              />
              <ChartText
                x={at.x}
                y={at.y + size / 2 + 14}
                fontSize={chart.small}
                textAnchor="middle"
                fill={c.chartMuted}
              >
                {String(at.n)}
              </ChartText>
              {genotype ? (
                <ChartText
                  x={at.x}
                  y={at.y + size / 2 + 30}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                  fill={asked ? c.chartHighlight : c.chartInk}
                >
                  {genotype}
                </ChartText>
              ) : null}
            </G>
          );
        })}
        <PedigreeKey y={height - keyH / 2} carriers={!!family.carriers} c={c} />
      </G>
    </Board>
  );
}

/** One person's symbol: a square or a circle, filled, half-filled or empty. */
function PedigreeSymbol({
  x,
  y,
  size,
  person,
  c,
}: {
  x: number;
  y: number;
  size: number;
  person: Pick<PedigreePerson, 'sex' | 'trait' | 'carrier'>;
  c: Palette;
}) {
  const r = size / 2;
  const male = person.sex === 'male';
  const fill = person.trait ? c.chartInk : c.card;
  return (
    <G>
      {male ? (
        <Rect x={x - r} y={y - r} width={size} height={size} fill={fill} />
      ) : (
        <Circle cx={x} cy={y} r={r} fill={fill} />
      )}
      {person.carrier && !person.trait ? (
        male ? (
          <Rect x={x} y={y - r} width={r} height={size} fill={c.chartInk} />
        ) : (
          <Path d={`M ${x} ${y - r} A ${r} ${r} 0 0 1 ${x} ${y + r} Z`} fill={c.chartInk} />
        )
      ) : null}
      {male ? (
        <Rect
          x={x - r}
          y={y - r}
          width={size}
          height={size}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
        />
      ) : (
        <Circle cx={x} cy={y} r={r} fill="none" stroke={c.chartInk} strokeWidth={chart.stroke} />
      )}
    </G>
  );
}

/** The key: male, female, has the trait, carries it. */
function PedigreeKey({ y, carriers, c }: { y: number; carriers: boolean; c: Palette }) {
  const items: [string, Pick<PedigreePerson, 'sex' | 'trait' | 'carrier'>][] = [
    ['male', { sex: 'male' }],
    ['female', { sex: 'female' }],
    ['has the trait', { sex: 'male', trait: true }],
    ['carrier', { sex: 'female', carrier: true }],
  ];
  if (!carriers) items.pop();
  const widths = items.map(([t]) => 14 + 6 + textW(t, chart.small));
  const gap = 14;
  const total = widths.reduce((s, x) => s + x, 0) + gap * (items.length - 1);
  let x = (BOARD - total) / 2;
  return (
    <G>
      <Line x1={10} y1={y - 16} x2={BOARD - 10} y2={y - 16} stroke={c.chartGrid} strokeWidth={1} />
      {items.map(([text, person], i) => {
        const x0 = x;
        x += widths[i]! + gap;
        return (
          <G key={text}>
            <PedigreeSymbol x={x0 + 7} y={y} size={14} person={person} c={c} />
            <ChartText x={x0 + 20} y={y + 4} fontSize={chart.small}>
              {text}
            </ChartText>
          </G>
        );
      })}
    </G>
  );
}

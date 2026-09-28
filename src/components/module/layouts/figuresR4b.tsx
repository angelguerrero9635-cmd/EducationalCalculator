import type { ReactNode } from 'react';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, usePalette, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { Ball, FloorShadow, TopLight, url, usePaintIds } from '../reps/paint';

/**
 * Explore figures redrawn in round 4 (group B): real objects in their materials, lit from the
 * top left, for the K–5 science pages on static charge, gravity, light, signals, pushes and
 * sound. Each draws one scene; the scene's lines say what to notice.
 */

/** A bold arrow with a filled head, from (x1, y1) to (x2, y2). */
export function BoldArrow({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 4,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const head = width * 3 + 4;
  const back = { x: x2 - head * Math.cos(a), y: y2 - head * Math.sin(a) };
  const side = (s: number) => ({
    x: back.x + s * head * 0.55 * Math.sin(a),
    y: back.y - s * head * 0.55 * Math.cos(a),
  });
  const l = side(1);
  const r = side(-1);
  return (
    <G>
      <Path
        d={`M ${x1} ${y1} L ${back.x} ${back.y}`}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
      <Path d={`M ${x2} ${y2} L ${l.x} ${l.y} L ${r.x} ${r.y} Z`} fill={color} />
    </G>
  );
}

// ---------------------------------------------------------------------------------------------
// Static charge (Q02)

/** Torn paper bits: small ragged shapes, centered on (0, 0). */
const BITS = [
  'M -7 -3 L -1 -4.5 L 6 -3 L 7 1 L 3 3.5 L -4 3 L -7.5 0.5 Z',
  'M -6 -4 L 4 -3.5 L 6.5 0 L 5 3.5 L -2 4 L -6.5 1.5 Z',
  'M -5 -3.5 L 1 -5 L 6 -2 L 5 2.5 L -1 4 L -6 2 Z',
];

/**
 * A rubber balloon on (0, 0), knot down (turn it with `rotate`), lit from the top left, with
 * a curled string from the knot (`string` long). Rubbed, it carries small minus marks.
 */
function Balloon({
  x,
  y,
  rotate = 0,
  rubbed,
  ball,
  string = 48,
  curl = 1,
}: {
  x: number;
  y: number;
  rotate?: number;
  rubbed: boolean;
  /** A Ball gradient id in the balloon's color. */
  ball: string;
  string?: number;
  /** Which way the string curls first (1 right, −1 left); 0 for no string. */
  curl?: number;
}) {
  const c = usePalette();
  const rx = 30;
  const ry = 36;
  // Points are turned here rather than with a transform, so the light stays at the top left.
  const t = (rotate * Math.PI) / 180;
  const p = (px: number, py: number) =>
    `${x + px * Math.cos(t) - py * Math.sin(t)} ${y + px * Math.sin(t) + py * Math.cos(t)}`;
  // An egg: rounder at the top, narrowing to the knot.
  const body = `M ${p(0, -ry)} C ${p(rx * 1.1, -ry)} ${p(rx * 1.05, ry * 0.55)} ${p(0, ry)} C ${p(-rx * 1.05, ry * 0.55)} ${p(-rx * 1.1, -ry)} ${p(0, -ry)} Z`;
  const s = string / 4;
  return (
    <G>
      {curl !== 0 ? (
        <Path
          d={`M ${p(0, ry + 5)} Q ${p(7 * curl, ry + 5 + s)} ${p(0, ry + 5 + 2 * s)} Q ${p(-7 * curl, ry + 5 + 3 * s)} ${p(0, ry + 5 + 4 * s)}`}
          stroke={c.chartMuted}
          strokeWidth={chart.strokeLight}
          fill="none"
        />
      ) : null}
      <Path d={body} fill={url(ball)} stroke={c.shade} strokeOpacity={0.25} strokeWidth={1} />
      {/* The shine on the rubber, top left. */}
      <Ellipse
        cx={x - 11}
        cy={y - 14}
        rx={5}
        ry={9}
        fill={c.shine}
        opacity={0.55}
        transform={`rotate(25 ${x - 11} ${y - 14})`}
      />
      <Path d={`M ${p(-4, ry + 6)} L ${p(4, ry + 6)} L ${p(0, ry - 1)} Z`} fill={c.blockRed} />
      {rubbed
        ? (
            [
              [-12, 2],
              [8, -14],
              [12, 6],
              [-4, 16],
              [0, -2],
            ] as const
          ).map(([dx, dy], i) => (
            <Line
              key={i}
              x1={x + dx - 4}
              y1={y + dy}
              x2={x + dx + 4}
              y2={y + dy}
              stroke={c.onBlock}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          ))
        : null}
    </G>
  );
}

/** A small plus mark: the other charge, on hair and on the wall. */
function Plus({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <Path
      d={`M ${x - 4} ${y} h 8 M ${x} ${y - 4} v 8`}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  );
}

/**
 * A rubber balloon near something. Rubbed, it lifts torn paper bits, makes a child's hair
 * stand up toward it and sticks to a wall; two rubbed balloons on strings push apart. Not
 * rubbed, nothing moves (and a balloon let go by a wall falls to the floor). Rubbed things
 * carry small charge marks: minus on the balloon, plus on the hair and the wall.
 */
export function Static({ charge }: { charge: NonNullable<Scene['charge']> }) {
  const c = usePalette();
  const ids = usePaintIds('balloon', 'head', 'floor', 'wall');
  return (
    <Canvas aspect={0.64}>
      {({ w, h }) => {
        const on = charge.rubbed;
        const floor = h - 44;
        let scene: ReactNode = null;
        if (charge.near === 'paper') {
          const bx = w * 0.42;
          const by = on ? 74 : 62;
          // Bits on the floor under the balloon; rubbed, most jump toward it and tilt.
          const bits = [-66, -46, -26, -8, 12, 32, 52, 70].map((dx, i) => {
            const lift = on ? [0, 0.55, 1, 0.8, 1, 0.45, 0, 0.7][i]! : 0;
            const stuck = lift === 1;
            const x0 = bx + dx;
            const x = stuck ? bx + dx * 0.35 : x0 + (bx - x0) * lift * 0.45;
            const y = stuck ? by + 38 + (i % 2) * 2 : floor - 3 - lift * (floor - by - 60);
            const tilt = lift ? (dx < 0 ? 35 : -35) + (i % 3) * 12 : (i % 3) * 14 - 14;
            return { x, y, tilt, lift, fill: [c.cupLight, c.fat, c.rock1][i % 3]! };
          });
          scene = (
            <G>
              {bits.map((b, i) =>
                b.lift > 0 && b.lift < 1 ? (
                  <Line
                    key={`t${i}`}
                    x1={b.x}
                    y1={b.y + 8}
                    x2={b.x + (b.x < bx ? -1 : 1) * 4}
                    y2={b.y + 20}
                    stroke={c.chartMuted}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dashFine}
                  />
                ) : null,
              )}
              <Balloon x={bx} y={by} rubbed={on} ball={ids.balloon} string={0} curl={0} />
              {/* The string, held off to the right so it clears the bits. */}
              <Path
                d={`M ${bx} ${by + 41} q 20 12 34 -2 q 16 -14 34 -4`}
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
                fill="none"
              />
              {bits.map((b, i) => (
                <Path
                  key={i}
                  d={BITS[i % 3]!}
                  transform={`translate(${b.x} ${b.y}) rotate(${b.tilt}) scale(1.4)`}
                  fill={b.fill}
                  stroke={c.woodDark}
                  strokeWidth={1}
                />
              ))}
              <ChartText x={bx} y={floor + 22} fontSize={chart.label} textAnchor="middle">
                paper bits
              </ChartText>
            </G>
          );
        } else if (charge.near === 'hair') {
          const head = { x: w * 0.66, y: floor - 78, r: 34 };
          const ball = { x: w * 0.27, y: 58 };
          // Strands from the top of the head: rubbed, they stand up and lean to the balloon.
          const strands = [-0.95, -0.7, -0.45, -0.2, 0.05, 0.3, 0.55, 0.8].map((t) => {
            const a = -Math.PI / 2 + t;
            const root = {
              x: head.x + head.r * Math.cos(a),
              y: head.y + head.r * Math.sin(a) + 2,
            };
            const tip = on
              ? {
                  x: root.x + (ball.x - root.x) * 0.3,
                  y: root.y - 26 + (ball.y - root.y) * 0.1,
                }
              : {
                  x: head.x + (head.r + 4) * Math.cos(a + t * 0.5),
                  y: head.y + (head.r + 4) * Math.sin(a + t * 0.5) + 8,
                };
            const mid = {
              x: (root.x + tip.x) / 2 + (on ? 4 : 0),
              y: (root.y + tip.y) / 2 - (on ? 0 : 6),
            };
            return { root, tip, mid };
          });
          scene = (
            <G>
              {/* shoulders in a shirt */}
              <Path
                d={`M ${head.x - 58} ${floor} Q ${head.x - 56} ${head.y + 44} ${head.x} ${head.y + 42} Q ${head.x + 56} ${head.y + 44} ${head.x + 58} ${floor} Z`}
                fill={c.blockBlue}
              />
              <Path
                d={`M ${head.x - 58} ${floor} Q ${head.x - 56} ${head.y + 44} ${head.x} ${head.y + 42} Q ${head.x + 56} ${head.y + 44} ${head.x + 58} ${floor} Z`}
                fill={url(ids.floor)}
              />
              <Rect x={head.x - 9} y={head.y + 26} width={18} height={18} fill={c.skin} />
              <Circle cx={head.x} cy={head.y} r={head.r} fill={url(ids.head)} />
              {/* hair: a cap on the head, then the loose strands */}
              <Path
                d={`M ${head.x - head.r} ${head.y + 2} A ${head.r} ${head.r} 0 0 1 ${head.x + head.r} ${head.y + 2} Q ${head.x} ${head.y - head.r * 0.55} ${head.x - head.r} ${head.y + 2} Z`}
                fill={c.furDark}
              />
              {strands.map((s, i) => (
                <Path
                  key={i}
                  d={`M ${s.root.x} ${s.root.y} Q ${s.mid.x} ${s.mid.y} ${s.tip.x} ${s.tip.y}`}
                  stroke={c.furDark}
                  strokeWidth={3}
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
              {/* face, looking up at the balloon */}
              <Circle cx={head.x - 12} cy={head.y + 4} r={3} fill={c.animalEye} />
              <Circle cx={head.x + 8} cy={head.y + 4} r={3} fill={c.animalEye} />
              <Path
                d={`M ${head.x - 10} ${head.y + 17} q 8 7 16 0`}
                stroke={c.furDark}
                strokeWidth={2}
                strokeLinecap="round"
                fill="none"
              />
              {on
                ? strands
                    .filter((_, i) => i % 3 === 1)
                    .map((s, i) => (
                      <Plus key={i} x={s.tip.x - 10} y={s.tip.y - 8} color={c.chartInk} />
                    ))
                : null}
              <Balloon x={ball.x} y={ball.y} rubbed={on} ball={ids.balloon} string={52} />
              <ChartText x={head.x} y={floor + 22} fontSize={chart.label} textAnchor="middle">
                hair
              </ChartText>
            </G>
          );
        } else if (charge.near === 'wall') {
          const wx = w - 78;
          const rows = Math.floor((floor - 8) / 18);
          // Rubbed, it sticks to the wall; not rubbed, it falls to the floor beside it.
          const ball = on ? { x: wx - 30, y: 76, rot: 0 } : { x: wx - 70, y: floor - 30, rot: 70 };
          scene = (
            <G>
              <Rect x={wx} y={8} width={w - 16 - wx} height={floor - 8} fill={c.rock6} />
              {Array.from({ length: rows }, (_, r) => {
                const y = floor - (r + 1) * 18;
                return (
                  <G key={r}>
                    <Line x1={wx} y1={y} x2={w - 16} y2={y} stroke={c.woodDark} opacity={0.45} />
                    {[0, 1, 2].map((k) => {
                      const x = wx + 4 + ((k * 2 + (r % 2)) * (w - 16 - wx)) / 5;
                      return x > wx + 2 && x < w - 18 ? (
                        <Line
                          key={k}
                          x1={x}
                          y1={y}
                          x2={x}
                          y2={y + 18}
                          stroke={c.woodDark}
                          opacity={0.45}
                        />
                      ) : null;
                    })}
                  </G>
                );
              })}
              <Rect x={wx} y={8} width={w - 16 - wx} height={floor - 8} fill={url(ids.wall)} />
              <Line x1={wx} y1={8} x2={wx} y2={floor} stroke={c.woodDark} strokeWidth={1.5} />
              {on
                ? [54, 76, 98].map((y) => <Plus key={y} x={wx + 9} y={y} color={c.chartInk} />)
                : null}
              {on ? null : <FloorShadow cx={ball.x} cy={floor} rx={30} ry={4} />}
              <Balloon
                x={ball.x}
                y={ball.y}
                rotate={ball.rot}
                rubbed={on}
                ball={ids.balloon}
                string={on ? 56 : 0}
                curl={on ? -1 : 0}
              />
              {on ? null : (
                <Path
                  d={`M ${ball.x - 42} ${ball.y + 12} q -16 -6 -30 6 q -12 10 -24 12`}
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  fill="none"
                />
              )}
              <ChartText
                x={(wx + w - 16) / 2}
                y={floor + 22}
                fontSize={chart.label}
                textAnchor="middle"
              >
                wall
              </ChartText>
            </G>
          );
        } else {
          // Two balloons hanging knot up from strings held in one hand.
          const top = { x: w / 2, y: 16 };
          const len = 70;
          const tilt = on ? 26 : 14;
          scene = (
            <G>
              {[-1, 1].map((s) => {
                const a = (s * tilt * Math.PI) / 180;
                const knot = { x: top.x + len * Math.sin(a), y: top.y + len * Math.cos(a) };
                const centre = { x: knot.x + 42 * Math.sin(a), y: knot.y + 42 * Math.cos(a) };
                return (
                  <G key={s}>
                    <Line
                      x1={top.x}
                      y1={top.y}
                      x2={knot.x}
                      y2={knot.y}
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                    />
                    <Balloon
                      x={centre.x}
                      y={centre.y}
                      rotate={180 - s * tilt}
                      rubbed={on}
                      ball={ids.balloon}
                      curl={0}
                    />
                    {on ? (
                      <BoldArrow
                        x1={centre.x + s * 38}
                        y1={centre.y}
                        x2={centre.x + s * 74}
                        y2={centre.y}
                        color={c.chartHighlight}
                        width={3}
                      />
                    ) : null}
                  </G>
                );
              })}
              {/* a wooden rod, both strings tied at one spot */}
              <Rect x={top.x - 60} y={top.y - 10} width={120} height={9} rx={3} fill={c.wood} />
              <Rect
                x={top.x - 60}
                y={top.y - 10}
                width={120}
                height={9}
                rx={3}
                fill={url(ids.floor)}
                stroke={c.woodDark}
                strokeWidth={1}
              />
              <Circle cx={top.x} cy={top.y} r={2.5} fill={c.chartMuted} />
            </G>
          );
        }
        const label =
          charge.near === 'balloon'
            ? on
              ? 'two rubbed balloons'
              : 'two balloons, not rubbed'
            : on
              ? 'rubbed balloon'
              : 'balloon, not rubbed';
        return (
          <Svg width={w} height={h}>
            <Defs>
              <Ball id={ids.balloon} color={c.blockRed} />
              <Ball id={ids.head} color={c.skin} />
              <TopLight id={ids.floor} />
              <TopLight id={ids.wall} strength={0.8} />
            </Defs>
            {/* a wooden floor */}
            <Rect x={16} y={floor} width={w - 32} height={8} rx={2} fill={c.wood} />
            <Rect x={16} y={floor} width={w - 32} height={8} rx={2} fill={url(ids.floor)} />
            {scene}
            <ChartText
              x={w / 2}
              y={h - 5}
              fontSize={chart.value}
              fontWeight="600"
              textAnchor="middle"
            >
              {label}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

// ---------------------------------------------------------------------------------------------
// Earth and gravity; day and night (Q04)

/** Land on the globe, in units of the radius from the centre: green land, then tan desert. */
const LAND = [
  // a long continent on the left, north to south
  'M -0.62 -0.62 C -0.4 -0.78 -0.18 -0.7 -0.2 -0.52 C -0.22 -0.36 -0.38 -0.3 -0.36 -0.12 C -0.34 0.02 -0.2 0.1 -0.24 0.28 C -0.28 0.46 -0.36 0.66 -0.46 0.7 C -0.5 0.5 -0.62 0.32 -0.6 0.12 C -0.58 -0.04 -0.74 -0.14 -0.8 -0.3 C -0.84 -0.44 -0.74 -0.54 -0.62 -0.62 Z',
  // a wide continent on the right, over the top
  'M 0.08 -0.74 C 0.3 -0.86 0.62 -0.7 0.72 -0.46 C 0.8 -0.26 0.62 -0.2 0.5 -0.1 C 0.44 0.06 0.52 0.22 0.4 0.4 C 0.3 0.54 0.18 0.5 0.14 0.34 C 0.1 0.18 0.02 0.08 0.06 -0.08 C 0.1 -0.22 -0.04 -0.3 -0.02 -0.46 C 0 -0.6 0 -0.68 0.08 -0.74 Z',
  // an island continent low on the right
  'M 0.5 0.46 C 0.62 0.4 0.76 0.46 0.74 0.58 C 0.72 0.7 0.56 0.72 0.48 0.64 C 0.42 0.58 0.44 0.5 0.5 0.46 Z',
];
const DESERT = [
  'M 0.18 -0.3 C 0.3 -0.36 0.44 -0.3 0.42 -0.18 C 0.4 -0.06 0.26 -0.04 0.2 -0.12 C 0.14 -0.18 0.12 -0.26 0.18 -0.3 Z',
  'M -0.56 -0.46 C -0.46 -0.52 -0.36 -0.46 -0.4 -0.36 C -0.44 -0.28 -0.56 -0.3 -0.58 -0.38 Z',
];

/** A child standing with their feet at (x, y), head along `turn` degrees from up, 32 px tall. */
function Child({ x, y, turn, c }: { x: number; y: number; turn: number; c: Palette }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${turn})`}>
      <Path
        d="M -3 0 L -2.5 -12 M 3 0 L 2.5 -12"
        stroke={c.blockBlue}
        strokeWidth={3.4}
        strokeLinecap="round"
      />
      <Path
        d="M -6 -21 L -9.5 -12 M 6 -21 L 9.5 -12"
        stroke={c.skin}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
      <Rect x={-6.5} y={-23} width={13} height={12} rx={3.5} fill={c.orange} />
      <Circle cx={0} cy={-29} r={6} fill={c.skin} />
      <Path d="M -6.1 -29.5 A 6.1 6.1 0 0 1 6.1 -29.5 Q 0 -32 -6.1 -29.5 Z" fill={c.furDark} />
    </G>
  );
}

/** A small house with its door at (x, y) on the ground: the marked town. */
function House({ x, y, turn, c }: { x: number; y: number; turn: number; c: Palette }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${turn})`}>
      <Rect x={-8} y={-13} width={16} height={13} fill={c.cupLight} stroke={c.woodDark} />
      <Path d="M -10.5 -12 L 0 -22 L 10.5 -12 Z" fill={c.blockRed} />
      <Rect x={-2.5} y={-7} width={5} height={7} fill={c.woodDark} />
    </G>
  );
}

/** A word on a rounded paper chip, so it reads over the globe. */
export function Chip({ x, y, text, c }: { x: number; y: number; text: string; c: Palette }) {
  const half = text.length * 3.6 + 7;
  return (
    <G>
      <Rect
        x={x - half}
        y={y - 13}
        width={2 * half}
        height={18}
        rx={9}
        fill={c.paper}
        opacity={0.92}
      />
      <ChartText x={x} y={y} fontSize={chart.label} fontWeight="600" textAnchor="middle">
        {text}
      </ChartText>
    </G>
  );
}

/**
 * A globe (ocean, green and tan land, a thin sky around it) with a child standing on it at
 * a spot and a ball let go beside them: a bold arrow and a dashed line point from the ball to
 * the center of Earth. Lit by a sun on the left, one half is day; the child stands by a house
 * (the town), and the spot marks the time of day as Earth turns toward the east.
 */
export function Earth({ earth }: { earth: NonNullable<Scene['earth']> }) {
  const c = usePalette();
  // Room above for a thrown ball, beside for the sun, below for a child upside down.
  const radius = (w: number) => Math.min(w / 2 - (earth.sunlit ? 82 : 60), 100);
  const ids = usePaintIds('clip', 'globe', 'ball', 'sun');
  return (
    <Canvas aspect={(w) => (164 + 2 * radius(w)) / w}>
      {({ w, h }) => {
        const lit = earth.sunlit;
        const R = radius(w);
        const cx = lit ? w / 2 + 34 : w / 2;
        const cy = 80 + R;
        // The spot's angle (y down): top, right side, bottom. Lit from the left, Earth turns
        // counterclockwise seen from above the North Pole, so the top of the globe is turning
        // into the light (morning) and the bottom out of it (evening).
        const angle = lit
          ? { noon: Math.PI, morning: -Math.PI / 2, evening: Math.PI / 2, midnight: 0 }[lit]
          : { top: -Math.PI / 2, side: 0, bottom: Math.PI / 2 }[earth.spot];
        const deg = (a: number) => (a * 180) / Math.PI + 90;
        const on = (a: number, d = 0) => ({
          x: cx + (R + d) * Math.cos(a),
          y: cy + (R + d) * Math.sin(a),
        });
        // The ball: beside the child, a little way up; thrown, much higher.
        const side = 20 / R;
        const up = earth.thrown ? 66 : 34;
        const ball = on(angle + side, up);
        const toward = Math.hypot(ball.x - cx, ball.y - cy);
        const ux = (cx - ball.x) / toward;
        const uy = (cy - ball.y) / toward;
        // A turning arrow over the top of the globe, pointing the way Earth turns.
        const ar = R + 44;
        const a0 = -Math.PI / 2 + 0.55;
        const a1 = -Math.PI / 2 - 0.55;
        const end = { x: cx + ar * Math.cos(a1), y: cy + ar * Math.sin(a1) };
        // The arrow's tip points along the arc (counterclockwise on screen).
        const tan = { x: Math.sin(a1), y: -Math.cos(a1) };
        const childAt = lit ? angle + 12 / R : angle;
        const houseAt = angle - 12 / R;
        const feet = on(childAt);
        const house = on(houseAt);
        const hand = (d: number) => on(angle + side, d);
        return (
          <Svg width={w} height={h}>
            <Defs>
              <ClipPath id={ids.clip}>
                <Circle cx={cx} cy={cy} r={R} />
              </ClipPath>
              <RadialGradient id={ids.globe} cx="0.4" cy="0.36" r="0.66" fx="0.3" fy="0.26">
                <Stop offset="0" stopColor={c.shine} stopOpacity={0.35 * c.sheen} />
                <Stop offset="0.5" stopColor={c.shine} stopOpacity={0} />
                <Stop offset="1" stopColor={c.shade} stopOpacity={0.3} />
              </RadialGradient>
              <Ball id={ids.ball} color={c.blockRed} />
              <Ball id={ids.sun} color={c.sunDisk} />
            </Defs>
            {lit ? (
              <G>
                {Array.from({ length: 8 }, (_, i) => {
                  const a = (i * Math.PI) / 4;
                  return (
                    <Line
                      key={i}
                      x1={36 + 25 * Math.cos(a)}
                      y1={cy + 25 * Math.sin(a)}
                      x2={36 + 32 * Math.cos(a)}
                      y2={cy + 32 * Math.sin(a)}
                      stroke={c.sunRay}
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                  );
                })}
                <Circle cx={36} cy={cy} r={20} fill={url(ids.sun)} />
                <ChartText x={36} y={cy + 54} fontSize={chart.label} textAnchor="middle">
                  Sun
                </ChartText>
                {/* sunlight reaching the day side */}
                {[-0.62, 0.62].map((k) => (
                  <BoldArrow
                    key={k}
                    x1={74}
                    y1={cy + k * R}
                    x2={cx - R * Math.sqrt(1 - k * k) - 10}
                    y2={cy + k * R}
                    color={c.sunRay}
                    width={2.5}
                  />
                ))}
              </G>
            ) : null}
            {/* the thin sky around Earth */}
            <Circle cx={cx} cy={cy} r={R + 6} fill={c.skyMorning} opacity={0.5} />
            <Circle cx={cx} cy={cy} r={R} fill={c.water} />
            <G clipPath={url(ids.clip)}>
              {LAND.map((d, i) => (
                <Path
                  key={i}
                  d={d}
                  transform={`translate(${cx} ${cy}) scale(${R})`}
                  fill={c.life}
                  stroke={c.lifeDeep}
                  strokeWidth={1.2 / R}
                />
              ))}
              {DESERT.map((d, i) => (
                <Path
                  key={i}
                  d={d}
                  transform={`translate(${cx} ${cy}) scale(${R})`}
                  fill={c.rock1}
                />
              ))}
            </G>
            <Circle cx={cx} cy={cy} r={R} fill={url(ids.globe)} />
            {lit ? (
              <G>
                {/* the night half, away from the sun */}
                <Path
                  d={`M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} Z`}
                  fill={c.shade}
                  opacity={0.55}
                />
                <Chip x={cx - R / 2} y={cy - R / 2 + 4} text="day" c={c} />
                <Chip x={cx + R / 2} y={cy - R / 2 + 4} text="night" c={c} />
              </G>
            ) : (
              <Line
                x1={ball.x}
                y1={ball.y}
                x2={cx}
                y2={cy}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dash}
              />
            )}
            {/* the center of Earth */}
            <Circle cx={cx} cy={cy} r={4.5} fill={c.chartInk} stroke={c.paper} strokeWidth={1.5} />
            <Chip
              x={cx}
              y={cy + (!lit && earth.spot === 'bottom' ? -14 : 26)}
              text="center"
              c={c}
            />
            {lit ? <House x={house.x} y={house.y} turn={deg(houseAt)} c={c} /> : null}
            <Child x={feet.x} y={feet.y} turn={deg(childAt)} c={c} />
            {lit ? (
              <G>
                <Path
                  d={`M ${cx + ar * Math.cos(a0)} ${cy + ar * Math.sin(a0)} A ${ar} ${ar} 0 0 0 ${end.x} ${end.y}`}
                  stroke={c.chartMuted}
                  strokeWidth={chart.stroke}
                  fill="none"
                />
                <BoldArrow
                  x1={end.x - tan.x * 4}
                  y1={end.y - tan.y * 4}
                  x2={end.x + tan.x * 8}
                  y2={end.y + tan.y * 8}
                  color={c.chartMuted}
                  width={2}
                />
                <ChartText x={cx} y={cy - ar - 10} fontSize={chart.label} textAnchor="middle">
                  Earth turns this way
                </ChartText>
              </G>
            ) : (
              <G>
                {earth.thrown ? (
                  // Up from the hand and back down again: a dotted trail.
                  <Path
                    d={`M ${hand(22).x} ${hand(22).y} L ${hand(up - 12).x} ${hand(up - 12).y}`}
                    stroke={c.chartMuted}
                    strokeWidth={chart.stroke}
                    strokeDasharray={chart.dashFine}
                  />
                ) : null}
                <Circle cx={ball.x} cy={ball.y} r={8} fill={url(ids.ball)} />
                <BoldArrow
                  x1={ball.x + ux * 12}
                  y1={ball.y + uy * 12}
                  x2={ball.x + ux * Math.min(up - 4, 40)}
                  y2={ball.y + uy * Math.min(up - 4, 40)}
                  color={c.chartHighlight}
                  width={3.5}
                />
              </G>
            )}
            <ChartText x={w / 2} y={h - 8} fontSize={chart.value} textAnchor="middle">
              {lit
                ? `${lit[0]!.toUpperCase()}${lit.slice(1)} at the marked town`
                : earth.thrown
                  ? 'Thrown up: the pull is still toward the center'
                  : 'The pull is toward the center: that is down'}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

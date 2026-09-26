import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';

/**
 * Explore figures for the K–3 science and Grade 3 math pages (docs/MODULE_GUIDE.md, "Module
 * layouts"). Each draws one scene; what a student reads about the scene is the scene's
 * lines, so the figures only name the things they draw.
 */

/** An arrow from (x1, y1) to (x2, y2) with a small head at the end; `heavy` for a hard push. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  c,
  heavy,
  color,
  dashed,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: Palette;
  heavy?: boolean;
  color?: string;
  dashed?: boolean;
}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const head = heavy ? 16 : 9;
  const hx = (t: number) => x2 - head * Math.cos(a + t);
  const hy = (t: number) => y2 - head * Math.sin(a + t);
  const stroke = color ?? c.chartHighlight;
  const width = heavy ? chart.strokeHeavy * 2 : chart.stroke;
  return (
    <G>
      <Path
        d={`M ${x1} ${y1} L ${x2} ${y2}`}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? chart.dash : undefined}
      />
      <Path
        d={`M ${hx(0.45)} ${hy(0.45)} L ${x2} ${y2} L ${hx(-0.45)} ${hy(-0.45)}`}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </G>
  );
}

/** A hand seen from above: a palm and four fingers pointing the way it pushes. */
function Hand({ x, y, angle, c }: { x: number; y: number; angle: number; c: Palette }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${angle})`}>
      <Rect
        x={-22}
        y={-14}
        width={24}
        height={28}
        rx={8}
        fill={c.chartFill}
        stroke={c.chartInk}
        strokeWidth={chart.stroke}
      />
      {[-10, -3, 4, 11].map((dy) => (
        <Rect
          key={dy}
          x={0}
          y={dy - 3}
          width={12}
          height={6}
          rx={3}
          fill={c.chartFill}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />
      ))}
    </G>
  );
}

/**
 * A ball on the floor seen from above. From behind, the ball starts still and rolls ahead;
 * from the front, a rolling ball slows and stops (or rolls back when the push is hard); from
 * the side, it turns. A pull is a string tied to the ball. A hard push is a thick arrow and a
 * longer path.
 */
export function Push({ push, c }: { push: NonNullable<Scene['push']>; c: Palette }) {
  return (
    <Canvas aspect={0.6}>
      {({ w, h }) => {
        const r = 16;
        const hard = push.strength === 'hard';
        const ball = { x: push.pull ? w * 0.22 : w * 0.42, y: h * 0.5 };
        const reach = hard ? w * 0.42 : w * 0.2;
        // A ball pushed from the front or side was already rolling ahead (to the right).
        const rolling = !push.pull && push.from !== 'behind';
        let path: string | undefined;
        let ghost: { x: number; y: number } | undefined;
        let hand: { x: number; y: number; angle: number } | undefined;
        let arrow: [number, number, number, number] | undefined;
        let note: string | undefined;
        if (push.pull) {
          hand = { x: ball.x + r + 64, y: ball.y, angle: 0 };
          arrow = [hand.x - 16, ball.y - 34, hand.x + (hard ? 80 : 44), ball.y - 34];
        } else if (push.from === 'behind') {
          hand = { x: ball.x - r - 14, y: ball.y, angle: 0 };
          arrow = [ball.x - r - 76, ball.y - 34, ball.x - r - 16, ball.y - 34];
          ghost = { x: ball.x + reach, y: ball.y };
          path = `M ${ball.x + r} ${ball.y} L ${ghost.x - r + 4} ${ghost.y}`;
        } else if (push.from === 'front') {
          hand = { x: ball.x + r + 14, y: ball.y, angle: 180 };
          arrow = [ball.x + r + 76, ball.y - 34, ball.x + r + 16, ball.y - 34];
          if (hard) {
            // It rolls back the way it came.
            ghost = { x: ball.x - w * 0.28, y: ball.y + 40 };
            path = `M ${ball.x - 6} ${ball.y + r} Q ${ball.x - 14} ${ghost.y} ${ghost.x + r - 4} ${ghost.y}`;
          } else {
            note = 'stops';
          }
        } else {
          hand = { x: ball.x, y: ball.y + r + 14, angle: -90 };
          arrow = [ball.x - 30, ball.y + r + 58, ball.x - 30, ball.y + r + 10];
          // Pushed from the side while rolling ahead: the path bends away from the push.
          const turn = hard ? h * 0.36 : h * 0.2;
          ghost = { x: ball.x + reach, y: ball.y - turn };
          path = `M ${ball.x + r} ${ball.y} Q ${ball.x + reach * 0.55} ${ball.y} ${ghost.x} ${ghost.y + r - 4}`;
        }
        return (
          <Svg width={w} height={h}>
            <Rect
              x={2}
              y={2}
              width={w - 4}
              height={h - 26}
              fill={c.chartSurface}
              stroke={c.chartGrid}
              strokeWidth={chart.strokeLight}
            />
            {rolling ? (
              <G>
                <Path
                  d={`M ${ball.x - w * 0.34} ${ball.y} L ${ball.x - r - 4} ${ball.y}`}
                  stroke={c.chartMuted}
                  strokeWidth={chart.stroke}
                  strokeDasharray={chart.dash}
                />
                <ChartText
                  x={ball.x - w * 0.34}
                  y={ball.y - 12}
                  fontSize={chart.tiny}
                  fill={c.chartMuted}
                >
                  was rolling this way
                </ChartText>
              </G>
            ) : null}
            {path ? (
              <Path
                d={path}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
                fill="none"
              />
            ) : null}
            {ghost ? (
              <Circle
                cx={ghost.x}
                cy={ghost.y}
                r={r - 4}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dashFine}
              />
            ) : null}
            {push.pull ? (
              <G>
                <Line
                  x1={ball.x + r}
                  y1={ball.y}
                  x2={ball.x + r + 44}
                  y2={ball.y}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Arrow
                  x1={ball.x}
                  y1={ball.y + r + 16}
                  x2={ball.x + reach}
                  y2={ball.y + r + 16}
                  c={c}
                  dashed
                />
              </G>
            ) : null}
            <Circle
              cx={ball.x}
              cy={ball.y}
              r={r}
              fill={c.chartHighlight}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            {hand ? <Hand x={hand.x} y={hand.y} angle={hand.angle} c={c} /> : null}
            {arrow ? (
              <Arrow
                x1={arrow[0]}
                y1={arrow[1]}
                x2={arrow[2]}
                y2={arrow[3]}
                c={c}
                heavy={hard}
                color={c.chartInk}
              />
            ) : null}
            {note ? (
              <ChartText x={ball.x} y={ball.y + r + 18} fontSize={chart.label} textAnchor="middle">
                {note}
              </ChartText>
            ) : null}
            <ChartText x={w / 2} y={h - 6} fontSize={chart.label} textAnchor="middle">
              {`${hard ? 'hard' : 'gentle'} ${push.pull ? 'pull' : 'push'}`}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

/** Short arcs spreading out from (x, y) to the right: the sound. */
function SoundMarks({ x, y, c }: { x: number; y: number; c: Palette }) {
  return (
    <G>
      {[14, 26, 38].map((rad) => (
        <Path
          key={rad}
          d={`M ${x + rad * Math.cos(-0.6)} ${y + rad * Math.sin(-0.6)} A ${rad} ${rad} 0 0 1 ${x + rad * Math.cos(0.6)} ${y + rad * Math.sin(0.6)}`}
          stroke={c.chartHighlight}
          strokeWidth={chart.stroke}
          fill="none"
        />
      ))}
    </G>
  );
}

/** Two little wiggle marks either side of a point: it is shaking. */
function Wiggles({ x, y, spread, c }: { x: number; y: number; spread: number; c: Palette }) {
  return (
    <G>
      {[-1, 1].map((side) => (
        <Path
          key={side}
          d={`M ${x + side * spread} ${y - 10} q ${side * 5} 5 0 10 q ${side * -5} 5 0 10`}
          stroke={c.chartMuted}
          strokeWidth={chart.strokeLight}
          fill="none"
        />
      ))}
    </G>
  );
}

/**
 * One sound maker. Still, it is drawn plain with no sound. Shaking, it has wiggle marks and
 * sound spreading out; the rice on a drum jumps; a rubber band is drawn blurred.
 */
export function Vibration({ vibrate, c }: { vibrate: NonNullable<Scene['vibrate']>; c: Palette }) {
  const on = vibrate.shaking;
  return (
    <Canvas aspect={0.5}>
      {({ w, h }) => {
        const cx = w / 2 - 20;
        const cy = h / 2;
        let body: ReactNode = null;
        let sound = { x: cx + 70, y: cy };
        if (vibrate.thing === 'band') {
          const bw = 150;
          const band = on
            ? `M ${cx - bw / 2 + 8} ${cy - 8} Q ${cx} ${cy - 22} ${cx + bw / 2 - 8} ${cy - 8} M ${cx - bw / 2 + 8} ${cy - 8} Q ${cx} ${cy + 6} ${cx + bw / 2 - 8} ${cy - 8}`
            : `M ${cx - bw / 2 + 8} ${cy - 8} L ${cx + bw / 2 - 8} ${cy - 8}`;
          body = (
            <G>
              <Rect
                x={cx - bw / 2}
                y={cy - 8}
                width={bw}
                height={46}
                rx={4}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Ellipse
                cx={cx}
                cy={cy + 14}
                rx={22}
                ry={12}
                fill={c.chartSurface}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Path d={band} stroke={c.chartHighlight} strokeWidth={chart.stroke} fill="none" />
              <ChartText x={cx} y={cy + 58} fontSize={chart.tiny} textAnchor="middle">
                rubber band on a box
              </ChartText>
            </G>
          );
          sound = { x: cx + bw / 2 + 6, y: cy - 8 };
        } else if (vibrate.thing === 'drum') {
          const top = cy - 28;
          const rice = [-30, -14, 2, 18, 32];
          body = (
            <G>
              <Path
                d={`M ${cx - 60} ${top} L ${cx - 60} ${top + 50} A 60 14 0 0 0 ${cx + 60} ${top + 50} L ${cx + 60} ${top}`}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Ellipse
                cx={cx}
                cy={top}
                rx={60}
                ry={14}
                fill={c.chartSurface}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {rice.map((dx, i) => (
                <Ellipse
                  key={dx}
                  cx={cx + dx}
                  cy={on ? top - 18 - (i % 3) * 10 : top + (i % 2) * 3 - 1}
                  rx={3.5}
                  ry={2}
                  fill={c.chartInk}
                />
              ))}
              <ChartText x={cx} y={top + 82} fontSize={chart.tiny} textAnchor="middle">
                drum with rice on top
              </ChartText>
            </G>
          );
          sound = { x: cx + 66, y: top + 16 };
        } else if (vibrate.thing === 'bell') {
          body = (
            <G transform={on ? `rotate(-10 ${cx} ${cy - 40})` : undefined}>
              <Line
                x1={cx}
                y1={cy - 52}
                x2={cx}
                y2={cy - 40}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Path
                d={`M ${cx - 12} ${cy - 40} Q ${cx - 16} ${cy + 10} ${cx - 42} ${cy + 26} L ${cx + 42} ${cy + 26} Q ${cx + 16} ${cy + 10} ${cx + 12} ${cy - 40} Z`}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Circle cx={cx} cy={cy + 32} r={6} fill={c.chartInk} />
            </G>
          );
          sound = { x: cx + 50, y: cy };
        } else {
          // A head from the side with a hand on the throat.
          body = (
            <G>
              <Circle
                cx={cx - 10}
                cy={cy - 28}
                r={30}
                fill={c.chartSurface}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Path
                d={`M ${cx - 22} ${cy} L ${cx - 22} ${cy + 44} M ${cx + 4} ${cy} L ${cx + 4} ${cy + 44}`}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Path
                d={`M ${cx + 16} ${cy - 20} q 6 4 0 8`}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
                fill="none"
              />
              <Rect
                x={cx + 4}
                y={cy + 10}
                width={34}
                height={18}
                rx={8}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <ChartText x={cx + 44} y={cy + 44} fontSize={chart.tiny}>
                hand on the throat
              </ChartText>
            </G>
          );
          sound = { x: cx + 26, y: cy - 16 };
        }
        return (
          <Svg width={w} height={h}>
            {body}
            {on ? (
              <G>
                <Wiggles
                  x={vibrate.thing === 'voice' ? cx - 9 : cx}
                  y={vibrate.thing === 'voice' ? cy + 12 : cy - 4}
                  spread={vibrate.thing === 'voice' ? 22 : 74}
                  c={c}
                />
                <SoundMarks x={sound.x} y={sound.y} c={c} />
              </G>
            ) : null}
            <ChartText x={w / 2} y={h - 6} fontSize={chart.label} textAnchor="middle">
              {on ? 'shaking: sound' : 'still: no sound'}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

/** A five-point star centered on (x, y). */
function Star({ x, y, r, c }: { x: number; y: number; r: number; c: Palette }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    return `${x + rad * Math.cos(a)},${y + rad * Math.sin(a)}`;
  });
  return <Path d={`M ${pts.join(' L ')} Z`} fill={c.chartHighlight} />;
}

/**
 * The sky over a house, East on the left and West on the right (facing south), with the
 * sun's path as a dotted arc. The sun sits low in the east, high at midday or low in the
 * west; at night the sky is dark with the Moon and stars.
 */
export function Sky({ sky, c }: { sky: NonNullable<Scene['sky']>; c: Palette }) {
  return (
    <Canvas aspect={0.55}>
      {({ w, h }) => {
        const ground = h - 44;
        const cx = w / 2;
        const rx = w / 2 - 44;
        const ry = ground - 34;
        const spot = (t: number) => ({
          x: cx - rx * Math.cos(t),
          y: ground - ry * Math.sin(t),
        });
        const at = spot(
          sky.at === 'east' ? 0.35 : sky.at === 'west' ? Math.PI - 0.35 : Math.PI / 2,
        );
        const night = sky.body === 'night';
        return (
          <Svg width={w} height={h}>
            <Rect x={0} y={0} width={w} height={ground} fill={night ? c.chartNight : c.chartDay} />
            <Path
              d={`M ${cx - rx} ${ground} A ${rx} ${ry} 0 0 1 ${cx + rx} ${ground}`}
              stroke={night ? c.chartMuted : c.chartInk}
              strokeWidth={chart.strokeLight}
              strokeDasharray={chart.dashFine}
              fill="none"
            />
            {night ? (
              <G>
                {[
                  [0.14, 0.2],
                  [0.3, 0.1],
                  [0.62, 0.16],
                  [0.8, 0.3],
                  [0.9, 0.12],
                  [0.46, 0.34],
                ].map(([fx, fy], i) => (
                  <Star key={i} x={w * fx!} y={ground * fy!} r={6} c={c} />
                ))}
                {/* The Moon: a lit circle with a dark bite out of it. */}
                <Circle cx={at.x} cy={at.y} r={16} fill={c.chartHighlight} />
                <Circle cx={at.x + 8} cy={at.y - 5} r={14} fill={c.chartNight} />
              </G>
            ) : (
              <G>
                {Array.from({ length: 8 }, (_, i) => {
                  const a = (i * Math.PI) / 4;
                  return (
                    <Line
                      key={i}
                      x1={at.x + 22 * Math.cos(a)}
                      y1={at.y + 22 * Math.sin(a)}
                      x2={at.x + 30 * Math.cos(a)}
                      y2={at.y + 30 * Math.sin(a)}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                    />
                  );
                })}
                <Circle
                  cx={at.x}
                  cy={at.y}
                  r={16}
                  fill={c.chartHighlight}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
              </G>
            )}
            <Line
              x1={0}
              y1={ground}
              x2={w}
              y2={ground}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            {/* The house */}
            <Path
              d={`M ${cx - 22} ${ground} v -26 l 22 -18 l 22 18 v 26 Z`}
              fill={c.chartFill}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <ChartText x={8} y={ground + 18} fontSize={chart.label} fontWeight="600">
              East
            </ChartText>
            <ChartText
              x={w - 8}
              y={ground + 18}
              fontSize={chart.label}
              fontWeight="600"
              textAnchor="end"
            >
              West
            </ChartText>
            <ChartText x={cx} y={h - 6} fontSize={chart.label} textAnchor="middle">
              {night
                ? 'night'
                : sky.at === 'east'
                  ? 'morning'
                  : sky.at === 'west'
                    ? 'evening'
                    : 'midday'}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

/** A balloon on a string, with small charge marks when it has been rubbed. */
function Balloon({ x, y, rubbed, c }: { x: number; y: number; rubbed: boolean; c: Palette }) {
  return (
    <G>
      <Path
        d={`M ${x} ${y + 40} q -6 14 0 26 q 6 12 0 24`}
        stroke={c.chartMuted}
        strokeWidth={chart.strokeLight}
        fill="none"
      />
      <Ellipse
        cx={x}
        cy={y}
        rx={32}
        ry={38}
        fill={c.chartFill}
        stroke={c.chartInk}
        strokeWidth={chart.stroke}
      />
      <Path d={`M ${x - 5} ${y + 44} L ${x + 5} ${y + 44} L ${x} ${y + 38} Z`} fill={c.chartInk} />
      {rubbed
        ? [
            [-14, -14],
            [10, -20],
            [-6, 4],
            [16, 8],
            [-16, 20],
          ].map(([dx, dy], i) => (
            <Line
              key={i}
              x1={x + dx! - 4}
              y1={y + dy!}
              x2={x + dx! + 4}
              y2={y + dy!}
              stroke={c.chartHighlight}
              strokeWidth={chart.stroke}
            />
          ))
        : null}
    </G>
  );
}

/**
 * A balloon near something. Rubbed, it pulls paper bits up, makes hair stand toward it and
 * sticks to a wall; two rubbed balloons push apart. Not rubbed, nothing moves.
 */
export function Static({ charge, c }: { charge: NonNullable<Scene['charge']>; c: Palette }) {
  return (
    <Canvas aspect={0.55}>
      {({ w, h }) => {
        const floor = h - 30;
        const on = charge.rubbed;
        const b = { x: w / 2 - 40, y: 56 };
        let near: ReactNode = null;
        if (charge.near === 'paper') {
          const bits = [-40, -20, 0, 20, 40];
          near = (
            <G>
              {bits.map((dx, i) => {
                const lift = on && i % 4 !== 0 ? 44 + (i % 2) * 22 : 0;
                return (
                  <Rect
                    key={dx}
                    x={b.x + dx - 5}
                    y={floor - 5 - lift}
                    width={10}
                    height={5}
                    fill={c.chartSurface}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    transform={`rotate(${lift ? (i % 2 ? 30 : -25) : 0} ${b.x + dx} ${floor - lift})`}
                  />
                );
              })}
              {on ? (
                <Arrow x1={b.x + 70} y1={floor - 10} x2={b.x + 70} y2={b.y + 48} c={c} />
              ) : null}
              <ChartText x={b.x} y={floor + 18} fontSize={chart.tiny} textAnchor="middle">
                paper bits
              </ChartText>
            </G>
          );
        } else if (charge.near === 'hair') {
          const head = { x: w / 2 + 70, y: floor - 40 };
          near = (
            <G>
              <Circle
                cx={head.x}
                cy={head.y}
                r={34}
                fill={c.chartSurface}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {[-24, -12, 0, 12, 24].map((dx) => {
                const root = { x: head.x + dx, y: head.y - Math.sqrt(34 * 34 - dx * dx) };
                // Toward the balloon (up and to the left) when rubbed; lying flat when not.
                const tip = on
                  ? { x: root.x - 16 - (24 - dx) * 0.3, y: root.y - 18 }
                  : { x: root.x + (dx < 0 ? -8 : 8), y: root.y + 6 };
                return (
                  <Line
                    key={dx}
                    x1={root.x}
                    y1={root.y}
                    x2={tip.x}
                    y2={tip.y}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                );
              })}
              <ChartText x={head.x} y={floor + 18} fontSize={chart.tiny} textAnchor="middle">
                hair
              </ChartText>
            </G>
          );
        } else if (charge.near === 'wall') {
          const wx = w - 40;
          near = (
            <G>
              <Rect
                x={wx}
                y={4}
                width={34}
                height={floor - 4}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <ChartText x={wx + 17} y={floor + 18} fontSize={chart.tiny} textAnchor="middle">
                wall
              </ChartText>
            </G>
          );
        }
        // Where the balloon hangs: at the wall when it sticks, apart from a second balloon.
        const main =
          charge.near === 'wall' && on
            ? { x: w - 40 - 33, y: b.y + 10 }
            : charge.near === 'balloon'
              ? { x: w / 2 - (on ? 80 : 40), y: b.y }
              : charge.near === 'hair'
                ? { x: w / 2 - 50, y: b.y - 10 }
                : b;
        return (
          <Svg width={w} height={h}>
            <Line
              x1={0}
              y1={floor}
              x2={w}
              y2={floor}
              stroke={c.chartGrid}
              strokeWidth={chart.stroke}
            />
            {near}
            <Balloon x={main.x} y={main.y} rubbed={on} c={c} />
            {charge.near === 'balloon' ? (
              <G>
                <Balloon x={w / 2 + (on ? 80 : 40)} y={b.y} rubbed={on} c={c} />
                {on ? (
                  <G>
                    <Arrow x1={w / 2 - 120} y1={b.y} x2={w / 2 - 146} y2={b.y} c={c} />
                    <Arrow x1={w / 2 + 120} y1={b.y} x2={w / 2 + 146} y2={b.y} c={c} />
                  </G>
                ) : null}
              </G>
            ) : null}
            <ChartText x={8} y={h - 8} fontSize={chart.label}>
              {on ? 'rubbed balloon' : 'balloon, not rubbed'}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

/**
 * An addition or times table from 0 to 10. A scene lights whole rows or columns, the even
 * or odd answers, or the mirror line (the diagonal where the two factors are the same).
 */
export function TimesTable({ table, c }: { table: NonNullable<Scene['table']>; c: Palette }) {
  const n = 11;
  const lit = (r: number, col: number, v: number) =>
    (table.rows?.includes(r) ?? false) ||
    (table.columns?.includes(col) ?? false) ||
    (table.cells === 'even' && v % 2 === 0) ||
    (table.cells === 'odd' && v % 2 === 1) ||
    (table.mirror === true && r === col);
  return (
    <Canvas aspect={1}>
      {({ w }) => {
        const cell = Math.floor((w - 4) / (n + 1));
        const size = cell * (n + 1);
        const x0 = (w - size) / 2;
        const font = cell >= 30 ? chart.label : chart.tiny;
        const cells: ReactNode[] = [];
        for (let r = -1; r < n; r++) {
          for (let col = -1; col < n; col++) {
            const x = x0 + (col + 1) * cell;
            const y = (r + 1) * cell;
            const head = r < 0 || col < 0;
            if (r < 0 && col < 0) {
              cells.push(
                <ChartText
                  key="op"
                  x={x + cell / 2}
                  y={y + cell / 2 + 5}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {table.op}
                </ChartText>,
              );
              continue;
            }
            const v = head ? Math.max(r, col) : table.op === '×' ? r * col : r + col;
            const on = !head && lit(r, col, v);
            cells.push(
              <G key={`${r}.${col}`}>
                <Rect
                  x={x}
                  y={y}
                  width={cell}
                  height={cell}
                  fill={head ? c.chartFill : on ? c.chartHighlight : c.chartSurface}
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
                <ChartText
                  x={x + cell / 2}
                  y={y + cell / 2 + 4}
                  fontSize={font}
                  fontWeight={head ? '700' : '400'}
                  fill={on ? c.onChartHighlight : c.chartInk}
                  textAnchor="middle"
                >
                  {String(v)}
                </ChartText>
              </G>,
            );
          }
        }
        return (
          <Svg width={w} height={size + 2}>
            {cells}
            {table.mirror ? (
              <Line
                x1={x0 + cell}
                y1={cell}
                x2={x0 + size}
                y2={size}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dash}
              />
            ) : null}
          </Svg>
        );
      }}
    </Canvas>
  );
}

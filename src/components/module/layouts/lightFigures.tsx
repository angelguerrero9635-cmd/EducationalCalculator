import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, usePalette, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { Ball, Glass, Sheen, TopLight, url, usePaintIds } from '../reps/paint';
import { BoldArrow } from './figuresR4b';

/**
 * Light figures (round 4, group B): a desk lamp, an apple on a table and an eye, with the
 * light drawn as bold warm beams; and a lamp, a block and a wall with the block's shadow.
 */

type Ids = Record<'bulb' | 'glow' | 'shade' | 'metal', string>;

/** The gradients a lamp needs: put inside the picture's Defs. */
function LampDefs({ ids, c }: { ids: Ids; c: Palette }) {
  return (
    <>
      <RadialGradient id={ids.bulb} cx="0.45" cy="0.4" r="0.6">
        <Stop offset="0" stopColor={c.shine} />
        <Stop offset="0.5" stopColor={c.bulbGlow} />
        <Stop offset="1" stopColor={c.sunRay} />
      </RadialGradient>
      <RadialGradient id={ids.glow} cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor={c.bulbGlow} stopOpacity={0.85} />
        <Stop offset="0.5" stopColor={c.bulbGlow} stopOpacity={0.3} />
        <Stop offset="1" stopColor={c.bulbGlow} stopOpacity={0} />
      </RadialGradient>
      <Sheen id={ids.shade} strength={1.4} />
      <LinearGradient id={ids.metal} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={c.metal} />
        <Stop offset="1" stopColor={c.metalDark} />
      </LinearGradient>
    </>
  );
}

/**
 * A lamp's head: a metal shade with its mouth facing `aim` (radians, y down) and the bulb in
 * the mouth at (x, y), glowing when on.
 */
function LampHead({
  x,
  y,
  aim,
  on,
  ids,
  c,
}: {
  x: number;
  y: number;
  aim: number;
  on: boolean;
  ids: Ids;
  c: Palette;
}) {
  const deg = (aim * 180) / Math.PI - 90;
  return (
    <G>
      {on ? <Circle cx={x} cy={y} r={34} fill={url(ids.glow)} /> : null}
      <G transform={`translate(${x} ${y}) rotate(${deg})`}>
        {/* the shade: a metal bell, open toward +y */}
        <Path
          d="M -19 2 L -9 -22 Q 0 -27 9 -22 L 19 2 Q 0 7 -19 2 Z"
          fill={c.blockGreen}
          stroke={c.lifeDeep}
          strokeWidth={1}
        />
        <Path d="M -19 2 L -9 -22 Q 0 -27 9 -22 L 19 2 Q 0 7 -19 2 Z" fill={url(ids.shade)} />
        <Circle cx={0} cy={2} r={8} fill={on ? url(ids.bulb) : c.fabric} />
      </G>
    </G>
  );
}

/** A warm beam of light with an arrowhead, from (x1, y1) to (x2, y2). */
function Beam({
  x1,
  y1,
  x2,
  y2,
  c,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: Palette;
}) {
  return (
    <G>
      <Line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={c.bulbGlow}
        strokeWidth={12}
        strokeLinecap="round"
        opacity={0.55}
      />
      <BoldArrow x1={x1} y1={y1} x2={x2} y2={y2} color={c.sunRay} width={4} />
    </G>
  );
}

/** A wooden tabletop or floor from x to x + width, its top at y. */
function Tabletop({
  x,
  y,
  width,
  light,
  c,
}: {
  x: number;
  y: number;
  width: number;
  light: string;
  c: Palette;
}) {
  return (
    <G>
      <Rect x={x} y={y} width={width} height={8} fill={c.wood} />
      <Rect x={x} y={y} width={width} height={8} fill={url(light)} />
      <Rect x={x} y={y + 8} width={width} height={4} fill={c.woodDark} />
    </G>
  );
}

/** An eye seen from the front, looking toward `look` (a unit direction). */
function Eye({ x, y, look, c }: { x: number; y: number; look: [number, number]; c: Palette }) {
  const rx = 24;
  const ry = 14;
  const almond = `M ${x - rx} ${y} Q ${x} ${y - ry * 2} ${x + rx} ${y} Q ${x} ${y + ry * 2} ${x - rx} ${y} Z`;
  const ix = x + look[0] * 8;
  const iy = y + look[1] * 5;
  return (
    <G>
      <Path
        d={`M ${x - rx - 2} ${y - ry - 8} Q ${x} ${y - ry - 18} ${x + rx + 2} ${y - ry - 6}`}
        stroke={c.furDark}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <Path d={almond} fill={c.shine} stroke={c.skinDeep} strokeWidth={1.5} />
      <Circle cx={ix} cy={iy} r={9.5} fill={c.blockBlue} />
      <Circle cx={ix} cy={iy} r={4.5} fill={c.animalEye} />
      <Circle cx={ix - 3} cy={iy - 3} r={2} fill={c.shine} />
      {/* lashes along the top lid */}
      {[-0.7, -0.35, 0, 0.35, 0.7].map((t) => {
        const lx = x + t * rx;
        const ly = y - ry * (1 - t * t) * 1 - 1;
        return (
          <Line
            key={t}
            x1={lx}
            y1={ly}
            x2={lx + t * 5}
            y2={ly - 6}
            stroke={c.furDark}
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}
    </G>
  );
}

/** An open hand held up, palm toward the left, fingers up; its heel at (x, y). */
function Hand({ x, y, c }: { x: number; y: number; c: Palette }) {
  return (
    <G>
      {[-9, -3, 3, 9].map((dx, i) => (
        <Rect
          key={dx}
          x={x + dx - 3}
          y={y - 62 + Math.abs(i - 1.5) * 4}
          width={6.5}
          height={30}
          rx={3.2}
          fill={c.skin}
          stroke={c.skinBrown}
          strokeWidth={1}
        />
      ))}
      <Rect
        x={x - 13}
        y={y - 40}
        width={26}
        height={40}
        rx={9}
        fill={c.skin}
        stroke={c.skinBrown}
        strokeWidth={1}
      />
      <Path
        d={`M ${x - 12} ${y - 20} Q ${x - 24} ${y - 26} ${x - 22} ${y - 36}`}
        stroke={c.skin}
        strokeWidth={6.5}
        strokeLinecap="round"
        fill="none"
      />
    </G>
  );
}

/** A red apple sitting on (x, y) with a stem and a leaf. */
function Apple({
  x,
  y,
  lit,
  ball,
  c,
}: {
  x: number;
  y: number;
  lit: boolean;
  ball: string;
  c: Palette;
}) {
  const r = 18;
  const cy = y - r;
  return (
    <G opacity={lit ? 1 : 0.8}>
      <Path
        d={`M ${x} ${cy - r + 5} C ${x + 8} ${cy - r - 3} ${x + r + 4} ${cy - r + 2} ${x + r} ${cy + 2} C ${x + r - 2} ${cy + r - 2} ${x + 6} ${cy + r + 1} ${x} ${cy + r - 2} C ${x - 6} ${cy + r + 1} ${x - r + 2} ${cy + r - 2} ${x - r} ${cy + 2} C ${x - r - 4} ${cy - r + 2} ${x - 8} ${cy - r - 3} ${x} ${cy - r + 5} Z`}
        fill={url(ball)}
      />
      <Path
        d={`M ${x} ${cy - r + 6} q -1 -6 2 -10`}
        stroke={c.woodDark}
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />
      <Path d={`M ${x + 2} ${cy - r - 1} q 8 -8 14 -3 q -7 6 -14 3 Z`} fill={c.lifeDeep} />
    </G>
  );
}

/**
 * The path of light: from a desk lamp to an apple on a table, then from the apple to an eye.
 * With the lamp off the room is dark and there is no path; a hand in front of the eye stops
 * the light; a mirror above bounces it once more, into the eye.
 */
export function LightPath({ light }: { light: NonNullable<Scene['light']> }) {
  const c = usePalette();
  const ids = usePaintIds('bulb', 'glow', 'shade', 'metal', 'table', 'apple', 'mirror');
  if (
    light.wall ||
    light.blocker === 'clear' ||
    light.blocker === 'cloudy' ||
    light.blocker === 'solid'
  ) {
    return <Shadow light={light} />;
  }
  return (
    <Canvas aspect={0.66}>
      {({ w, h }) => {
        const on = light.lamp;
        const table = h - 62;
        const lamp = { x: 76, y: 58 };
        const apple = { x: w * 0.47, y: table };
        const appleTop = { x: apple.x, y: table - 36 };
        const eye = { x: w - 48, y: 100 };
        const mirrorY = 30;
        // The mirror point where the angles in and out are equal.
        const mx =
          (appleTop.x * (eye.y - 14 - mirrorY) + (eye.x - 6) * (appleTop.y - mirrorY)) /
          (eye.y - 14 - mirrorY + appleTop.y - mirrorY);
        const aim = Math.atan2(appleTop.y + 10 - lamp.y, apple.x - 16 - lamp.x);
        const along = (from: { x: number; y: number }, to: { x: number; y: number }, d: number) => {
          const l = Math.hypot(to.x - from.x, to.y - from.y);
          return { x: from.x + ((to.x - from.x) * d) / l, y: from.y + ((to.y - from.y) * d) / l };
        };
        const beamFrom = along(lamp, { x: apple.x - 14, y: appleTop.y + 12 }, 26);
        const beamTo = along({ x: apple.x - 14, y: appleTop.y + 12 }, lamp, 6);
        const bounce = { x: apple.x + 10, y: appleTop.y + 4 };
        const look: [number, number] = light.blocker === 'mirror' ? [-0.45, -0.9] : [-0.95, 0.3];
        const handX = eye.x - 50;
        return (
          <Svg width={w} height={h}>
            <Defs>
              <LampDefs ids={ids} c={c} />
              <TopLight id={ids.table} />
              <Ball id={ids.apple} color={c.blockRed} />
              <LinearGradient id={ids.mirror} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={c.silverDark} />
                <Stop offset="0.35" stopColor={c.shine} />
                <Stop offset="0.6" stopColor={c.silver} />
                <Stop offset="1" stopColor={c.silverDark} />
              </LinearGradient>
            </Defs>
            <Tabletop x={12} y={table} width={w - 24} light={ids.table} c={c} />
            {/* the desk lamp: a heavy base, an arm, the head aimed at the apple */}
            <Ellipse cx={40} cy={table - 3} rx={26} ry={6} fill={url(ids.metal)} />
            <Path
              d={`M 40 ${table - 6} L 30 ${table - 62} L ${lamp.x} ${lamp.y}`}
              stroke={c.metalDark}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle cx={30} cy={table - 62} r={4.5} fill={c.metal} stroke={c.metalDark} />
            <LampHead x={lamp.x} y={lamp.y} aim={aim} on={on} ids={ids} c={c} />
            {/* the apple and its shadow on the table, away from the lamp */}
            {on ? (
              <Ellipse
                cx={apple.x + 26}
                cy={table + 1}
                rx={24}
                ry={4}
                fill={c.shade}
                opacity={0.3}
              />
            ) : null}
            <Apple x={apple.x} y={apple.y} lit={on} ball={ids.apple} c={c} />
            <Eye x={eye.x} y={eye.y} look={look} c={c} />
            {light.blocker === 'mirror' ? (
              <G>
                <Rect
                  x={mx - 40}
                  y={mirrorY - 12}
                  width={80}
                  height={10}
                  rx={2}
                  fill={c.woodDark}
                />
                <Rect x={mx - 36} y={mirrorY - 4} width={72} height={5} fill={url(ids.mirror)} />
              </G>
            ) : null}
            {light.blocker === 'hand' ? <Hand x={handX} y={eye.y + 34} c={c} /> : null}
            {on ? (
              <G>
                <Beam x1={beamFrom.x} y1={beamFrom.y} x2={beamTo.x} y2={beamTo.y} c={c} />
                {light.blocker === 'mirror' ? (
                  <G>
                    <Beam x1={bounce.x} y1={bounce.y - 4} x2={mx - 3} y2={mirrorY + 6} c={c} />
                    <Beam x1={mx + 3} y1={mirrorY + 6} x2={eye.x - 8} y2={eye.y - 20} c={c} />
                  </G>
                ) : (
                  <Beam
                    x1={bounce.x + 10}
                    y1={bounce.y}
                    x2={light.blocker === 'hand' ? handX - 26 : eye.x - 30}
                    y2={light.blocker === 'hand' ? eye.y + 6 : eye.y + 2}
                    c={c}
                  />
                )}
              </G>
            ) : (
              // A dark room: everything above the table in shadow.
              <Rect
                x={0}
                y={0}
                width={w}
                height={table + 12}
                rx={10}
                fill={c.shade}
                opacity={0.72}
              />
            )}
            <ChartText x={40} y={table + 30} fontSize={chart.label} textAnchor="middle">
              {on ? 'lamp on' : 'lamp off'}
            </ChartText>
            <ChartText x={apple.x} y={table + 30} fontSize={chart.label} textAnchor="middle">
              apple
            </ChartText>
            <ChartText x={eye.x} y={table + 30} fontSize={chart.label} textAnchor="middle">
              {light.blocker === 'hand'
                ? 'hand, eye'
                : light.blocker === 'mirror'
                  ? 'mirror, eye'
                  : 'eye'}
            </ChartText>
            <ChartText
              x={w / 2}
              y={h - 6}
              fontSize={chart.value}
              fontWeight="600"
              textAnchor="middle"
            >
              {!on
                ? 'no light: nothing to see'
                : light.blocker === 'hand'
                  ? 'the light is stopped before the eye'
                  : light.blocker === 'mirror'
                    ? 'lamp → apple → mirror → eye'
                    : 'lamp → apple → eye'}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

/**
 * A lamp on a stand, a block on the floor and a wall. Light that the block stops leaves a
 * shadow on the far side, traced from the bulb over the block's top: a low lamp throws a long
 * shadow (up the wall when it reaches it), a high lamp a short one. A clear block lets the
 * light through (no shadow), a cloudy one lets some through (a pale shadow), a solid one none.
 */
function Shadow({ light }: { light: NonNullable<Scene['light']> }) {
  const c = usePalette();
  const ids = usePaintIds('bulb', 'glow', 'shade', 'metal', 'floor', 'wall', 'glass', 'wood');
  const material =
    light.blocker === 'clear' || light.blocker === 'cloudy' ? light.blocker : 'solid';
  return (
    <Canvas aspect={0.66}>
      {({ w, h }) => {
        const floor = h - 46;
        const wallX = w - 44;
        const thing = { x: w * 0.42, w: 26, h: 60 };
        const lamp = { x: 40, y: light.height === 'low' ? floor - 80 : 34 };
        const corner = { x: thing.x + thing.w, y: floor - thing.h };
        // Where the line from the lamp over the thing's top meets the floor, or the wall.
        const floorX = lamp.x + ((corner.x - lamp.x) * (floor - lamp.y)) / (corner.y - lamp.y);
        const reachesWall = floorX >= wallX;
        const wallY = lamp.y + ((wallX - lamp.x) * (corner.y - lamp.y)) / (corner.x - lamp.x);
        const tipX = reachesWall ? wallX : floorX;
        const tipY = reachesWall ? wallY : floor;
        const lit = light.lamp;
        const aim = Math.atan2(corner.y - lamp.y, corner.x - lamp.x);
        return (
          <Svg width={w} height={h}>
            <Defs>
              <LampDefs ids={ids} c={c} />
              <TopLight id={ids.floor} />
              <TopLight id={ids.wall} strength={0.7} />
              <TopLight id={ids.wood} />
              <Glass id={ids.glass} />
            </Defs>
            {/* the wall */}
            <Rect x={wallX} y={6} width={w - 12 - wallX} height={floor - 6} fill={c.rock6} />
            <Rect x={wallX} y={6} width={w - 12 - wallX} height={floor - 6} fill={url(ids.wall)} />
            <Line x1={wallX} y1={6} x2={wallX} y2={floor} stroke={c.woodDark} strokeWidth={1.5} />
            <Tabletop x={12} y={floor} width={w - 24} light={ids.floor} c={c} />
            {lit && material !== 'clear' ? (
              <G opacity={material === 'cloudy' ? 0.35 : 1}>
                {/* the dark space behind the block, then the shadow on the floor and wall */}
                <Path
                  d={`M ${corner.x} ${corner.y} L ${tipX} ${tipY} L ${tipX} ${floor} L ${corner.x} ${floor} Z`}
                  fill={c.shade}
                  opacity={0.1}
                />
                <Rect
                  x={corner.x}
                  y={floor - 3}
                  width={Math.max(0, tipX - corner.x)}
                  height={8}
                  rx={3}
                  fill={c.shade}
                  opacity={0.6}
                />
                {reachesWall ? (
                  <Rect
                    x={wallX}
                    y={wallY}
                    width={w - 12 - wallX}
                    height={floor - wallY}
                    fill={c.shade}
                    opacity={0.5}
                  />
                ) : null}
              </G>
            ) : null}
            {lit ? (
              <G>
                <Line
                  x1={lamp.x}
                  y1={lamp.y}
                  x2={tipX}
                  y2={tipY}
                  stroke={c.bulbGlow}
                  strokeWidth={8}
                  strokeLinecap="round"
                  opacity={0.5}
                />
                <Line
                  x1={lamp.x}
                  y1={lamp.y}
                  x2={tipX}
                  y2={tipY}
                  stroke={c.sunRay}
                  strokeWidth={chart.stroke}
                  strokeDasharray={chart.dash}
                />
              </G>
            ) : null}
            {/* the block: wood, clear glass or cloudy glass */}
            <Rect
              x={thing.x}
              y={floor - thing.h}
              width={thing.w}
              height={thing.h}
              rx={2}
              fill={material === 'solid' ? c.wood : url(ids.glass)}
              opacity={material === 'clear' ? 0.6 : 1}
              stroke={material === 'solid' ? c.woodDark : c.glassEdge}
              strokeWidth={1.5}
            />
            {material === 'solid' ? (
              <Rect
                x={thing.x}
                y={floor - thing.h}
                width={thing.w}
                height={thing.h}
                rx={2}
                fill={url(ids.wood)}
              />
            ) : null}
            {material === 'cloudy' ? (
              <Rect
                x={thing.x}
                y={floor - thing.h}
                width={thing.w}
                height={thing.h}
                rx={2}
                fill={c.mist}
                opacity={0.8}
              />
            ) : null}
            {material === 'clear' ? (
              <Line
                x1={thing.x + 6}
                y1={floor - thing.h + 8}
                x2={thing.x + 6}
                y2={floor - thing.h + 34}
                stroke={c.glassShine}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            ) : null}
            {/* the lamp: a stand, and its head aimed past the block */}
            <Ellipse cx={lamp.x} cy={floor - 2} rx={20} ry={5} fill={url(ids.metal)} />
            <Line
              x1={lamp.x}
              y1={floor - 4}
              x2={lamp.x - Math.cos(aim) * 14}
              y2={lamp.y - Math.sin(aim) * 14}
              stroke={c.metalDark}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <LampHead x={lamp.x} y={lamp.y} aim={aim} on={lit} ids={ids} c={c} />
            <ChartText x={lamp.x} y={floor + 28} fontSize={chart.label} textAnchor="middle">
              lamp
            </ChartText>
            <ChartText
              x={thing.x + thing.w / 2}
              y={floor + 28}
              fontSize={chart.label}
              textAnchor="middle"
            >
              {light.blocker === 'clear' || light.blocker === 'cloudy' || light.blocker === 'solid'
                ? light.blocker
                : 'block'}
            </ChartText>
            <ChartText
              x={(wallX + w - 12) / 2}
              y={floor + 28}
              fontSize={chart.label}
              textAnchor="middle"
            >
              wall
            </ChartText>
            <ChartText
              x={w / 2}
              y={h - 4}
              fontSize={chart.value}
              fontWeight="600"
              textAnchor="middle"
            >
              {!lit
                ? 'lamp off: no shadow'
                : material === 'clear'
                  ? 'the light goes through: no shadow'
                  : material === 'cloudy'
                    ? 'some light goes through: a pale shadow'
                    : reachesWall
                      ? 'a long shadow, up the wall'
                      : 'a short shadow'}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

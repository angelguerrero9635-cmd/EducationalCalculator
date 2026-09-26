import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { ExploreLayout as Spec, Figure, Scene } from '@/data/modules/layouts';
import { chart, font, radius, space, usePalette, type Palette } from '@/theme';

import { Canvas, Caption, ChartText } from '../reps/common';
import { Arrow, Push, Sky, Static, TimesTable, Vibration } from './figures';

/**
 * A picture with a few scenes to switch between: tap a scene, the figure changes, and the
 * caption says what to notice. There are no numbers to type.
 */
export function ExploreLayout({ spec }: { spec: Spec }) {
  const c = usePalette();
  const [index, setIndex] = useState(0);
  const scene = spec.scenes[index]!;
  const partsOnly =
    spec.figure.kind === 'parts' && spec.scenes.every((sc) => sc.part !== undefined);
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
      return <Parts parts={figure.parts} highlight={scene.part} c={c} onPart={onPart} />;
    case 'position':
      return <Position where={scene.position ?? 'above'} c={c} />;
    case 'clock':
      return <ClockFace time={scene.time ?? [3, 0]} c={c} />;
    case 'dots':
      return <Dots groups={scene.dots?.[0] ?? 1} each={scene.dots?.[1] ?? 1} c={c} />;
    case 'magnets':
      return <Magnets poles={scene.poles ?? 'N–S'} c={c} />;
    case 'flashes':
      return <Flashes pattern={scene.flashes ?? '●'} c={c} />;
    case 'lightPath':
      return <LightPath light={scene.light ?? { lamp: true }} c={c} />;
    case 'particles':
      return <Particles state={scene.particles ?? { state: 'solid' }} c={c} />;
    case 'earth':
      return <Earth earth={scene.earth ?? { spot: 'top' }} c={c} />;
    case 'push':
      return <Push push={scene.push ?? { from: 'behind', strength: 'gentle' }} c={c} />;
    case 'vibration':
      return <Vibration vibrate={scene.vibrate ?? { thing: 'band', shaking: false }} c={c} />;
    case 'sky':
      return <Sky sky={scene.sky ?? { body: 'sun', at: 'high' }} c={c} />;
    case 'static':
      return <Static charge={scene.charge ?? { rubbed: false, near: 'paper' }} c={c} />;
    case 'timesTable':
      return <TimesTable table={scene.table ?? { op: '×' }} c={c} />;
  }
}

/**
 * The path of light: from the lamp to the apple, then from the apple to the eye. With the
 * lamp off there is no path; a hand over the eye stops the light; a mirror bounces it once
 * more before it reaches the eye.
 */
function LightPath({ light, c }: { light: NonNullable<Scene['light']>; c: Palette }) {
  if (
    light.wall ||
    light.blocker === 'clear' ||
    light.blocker === 'cloudy' ||
    light.blocker === 'solid'
  ) {
    return <Shadow light={light} c={c} />;
  }
  return (
    <Canvas aspect={0.58}>
      {({ w, h }) => {
        const lamp = { x: 40, y: 40 };
        const apple = { x: w / 2 - 10, y: h - 70 };
        const eye = { x: w - 44, y: h * 0.42 };
        const mirror = { x: w - 30, y: 30 };
        const rays = light.lamp
          ? [0, 1, 2, 3, 4].map((i) => {
              const t = Math.PI / 6 + (i * Math.PI) / 8;
              return (
                <Line
                  key={i}
                  x1={lamp.x + 18 * Math.cos(t)}
                  y1={lamp.y + 18 * Math.sin(t)}
                  x2={lamp.x + 30 * Math.cos(t)}
                  y2={lamp.y + 30 * Math.sin(t)}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                />
              );
            })
          : null;
        return (
          <Svg width={w} height={h}>
            {/* lamp */}
            <Circle
              cx={lamp.x}
              cy={lamp.y}
              r={14}
              fill={light.lamp ? c.chartHighlight : c.chartSurface}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            {rays}
            <ChartText x={lamp.x} y={lamp.y + 46} fontSize={chart.label} textAnchor="middle">
              {light.lamp ? 'lamp on' : 'lamp off'}
            </ChartText>
            {/* apple */}
            <Circle
              cx={apple.x}
              cy={apple.y}
              r={16}
              fill={light.lamp ? c.chartFill : c.chartGrid}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <ChartText x={apple.x} y={apple.y + 30} fontSize={chart.label} textAnchor="middle">
              apple
            </ChartText>
            {/* eye */}
            <Ellipse
              cx={eye.x}
              cy={eye.y}
              rx={20}
              ry={11}
              fill={c.chartSurface}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <Circle cx={eye.x} cy={eye.y} r={5} fill={c.chartInk} />
            <ChartText x={eye.x} y={eye.y + 30} fontSize={chart.label} textAnchor="middle">
              eye
            </ChartText>
            {light.blocker === 'hand' ? (
              <G>
                <Rect
                  x={eye.x - 34}
                  y={eye.y - 26}
                  width={22}
                  height={52}
                  rx={6}
                  fill={c.chartGrid}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <ChartText x={eye.x - 23} y={eye.y - 32} fontSize={chart.tiny} textAnchor="middle">
                  hand
                </ChartText>
              </G>
            ) : null}
            {light.blocker === 'mirror' ? (
              <G>
                <Line
                  x1={mirror.x - 16}
                  y1={mirror.y - 16}
                  x2={mirror.x + 16}
                  y2={mirror.y + 16}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke * 2}
                />
                <ChartText
                  x={mirror.x - 26}
                  y={mirror.y - 10}
                  fontSize={chart.tiny}
                  textAnchor="end"
                >
                  mirror
                </ChartText>
              </G>
            ) : null}
            {light.lamp ? (
              <Arrow x1={lamp.x + 16} y1={lamp.y + 14} x2={apple.x - 12} y2={apple.y - 12} c={c} />
            ) : null}
            {light.lamp && light.blocker === 'mirror' ? (
              <G>
                <Arrow
                  x1={apple.x + 12}
                  y1={apple.y - 14}
                  x2={mirror.x - 8}
                  y2={mirror.y + 8}
                  c={c}
                />
                <Arrow x1={mirror.x - 4} y1={mirror.y + 14} x2={eye.x - 4} y2={eye.y - 14} c={c} />
              </G>
            ) : light.lamp ? (
              <Arrow
                x1={apple.x + 14}
                y1={apple.y - 10}
                x2={light.blocker === 'hand' ? eye.x - 38 : eye.x - 22}
                y2={light.blocker === 'hand' ? eye.y + 10 : eye.y + 4}
                c={c}
              />
            ) : null}
            <ChartText x={w / 2} y={h - 6} fontSize={chart.label} textAnchor="middle">
              {!light.lamp
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
 * A lamp, a thing on the floor and a wall. Light that the thing stops leaves a shadow on the
 * far side, traced from the lamp over the thing's top: a low lamp throws a long shadow (up
 * the wall when it reaches it), a high lamp a short one. A clear thing lets the light
 * through (no shadow), a cloudy one lets some through (a pale shadow), a solid one none.
 */
function Shadow({ light, c }: { light: NonNullable<Scene['light']>; c: Palette }) {
  const material =
    light.blocker === 'clear' || light.blocker === 'cloudy' ? light.blocker : 'solid';
  return (
    <Canvas aspect={0.58}>
      {({ w, h }) => {
        const floor = h - 34;
        const wallX = w - 36;
        const thing = { x: w * 0.42, w: 22, h: 60 };
        const lamp = { x: 36, y: light.height === 'low' ? floor - 80 : 34 };
        const corner = { x: thing.x + thing.w, y: floor - thing.h };
        // Where the line from the lamp over the thing's top meets the floor, or the wall.
        const floorX = lamp.x + ((corner.x - lamp.x) * (floor - lamp.y)) / (corner.y - lamp.y);
        const reachesWall = floorX >= wallX;
        const wallY = lamp.y + ((wallX - lamp.x) * (corner.y - lamp.y)) / (corner.x - lamp.x);
        const shadow = reachesWall
          ? `M ${corner.x} ${floor} L ${wallX} ${floor} L ${wallX} ${wallY} Z`
          : `M ${corner.x} ${floor} L ${floorX} ${floor} L ${corner.x} ${floor} Z`;
        const tipX = reachesWall ? wallX : floorX;
        const tipY = reachesWall ? wallY : floor;
        const lit = light.lamp;
        return (
          <Svg width={w} height={h}>
            <Rect
              x={wallX}
              y={4}
              width={30}
              height={floor - 4}
              fill={c.chartFill}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <Line
              x1={0}
              y1={floor}
              x2={w}
              y2={floor}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            {lit && material !== 'clear' ? (
              <G opacity={material === 'cloudy' ? 0.35 : 1}>
                {reachesWall ? (
                  <Path d={shadow} fill={c.chartNight} />
                ) : (
                  <Rect
                    x={corner.x}
                    y={floor - 5}
                    width={Math.max(0, floorX - corner.x)}
                    height={10}
                    rx={5}
                    fill={c.chartNight}
                  />
                )}
              </G>
            ) : null}
            {lit ? (
              <Path
                d={`M ${lamp.x} ${lamp.y} L ${tipX} ${tipY}`}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dash}
              />
            ) : null}
            <Rect
              x={thing.x}
              y={floor - thing.h}
              width={thing.w}
              height={thing.h}
              fill={
                material === 'solid' ? c.chartInk : material === 'cloudy' ? c.chartGrid : 'none'
              }
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            {material === 'clear' ? (
              <Line
                x1={thing.x + 6}
                y1={floor - thing.h + 10}
                x2={thing.x + 6}
                y2={floor - thing.h + 30}
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
              />
            ) : null}
            <Circle
              cx={lamp.x}
              cy={lamp.y}
              r={12}
              fill={lit ? c.chartHighlight : c.chartSurface}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <Line
              x1={lamp.x}
              y1={lamp.y + 12}
              x2={lamp.x}
              y2={floor}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
            <ChartText x={lamp.x} y={floor + 16} fontSize={chart.tiny} textAnchor="middle">
              lamp
            </ChartText>
            <ChartText
              x={thing.x + thing.w / 2}
              y={floor + 16}
              fontSize={chart.tiny}
              textAnchor="middle"
            >
              {light.blocker === 'clear' || light.blocker === 'cloudy' || light.blocker === 'solid'
                ? light.blocker
                : 'block'}
            </ChartText>
            <ChartText x={wallX + 15} y={floor + 16} fontSize={chart.tiny} textAnchor="middle">
              wall
            </ChartText>
            <ChartText x={w / 2} y={h - 4} fontSize={chart.label} textAnchor="middle">
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

/**
 * A globe with a person at a spot and a ball let go beside them: the pull arrow points to
 * the center of Earth. Lit from a sun on the left, one half is day; the spot then marks the
 * time of day as Earth turns toward the east.
 */
function Earth({ earth, c }: { earth: NonNullable<Scene['earth']>; c: Palette }) {
  return (
    <Canvas aspect={0.8}>
      {({ w, h }) => {
        const cx = earth.sunlit ? w / 2 + 24 : w / 2;
        const cy = h / 2 + 6;
        const R = Math.min(w * 0.3, h * 0.28);
        // The spot's angle (y down): top, right side, bottom. Lit from the left, Earth turns
        // counterclockwise seen from above the North Pole, so the top of the globe is turning
        // into the light (morning) and the bottom out of it (evening).
        const angle = earth.sunlit
          ? { noon: Math.PI, morning: -Math.PI / 2, evening: Math.PI / 2, midnight: 0 }[
              earth.sunlit
            ]
          : { top: -Math.PI / 2, side: 0, bottom: Math.PI / 2 }[earth.spot];
        const px = cx + R * Math.cos(angle);
        const py = cy + R * Math.sin(angle);
        const ox = Math.cos(angle);
        const oy = Math.sin(angle);
        const tx = -oy;
        const ty = ox;
        const ballDist = earth.thrown ? 56 : 32;
        const ball = { x: px + ox * ballDist + tx * 20, y: py + oy * ballDist + ty * 20 };
        // A turning arrow over the top of the globe, pointing the way Earth turns.
        const ar = R + 34;
        const a0 = -Math.PI / 2 + 0.55;
        const a1 = -Math.PI / 2 - 0.55;
        const end = { x: cx + ar * Math.cos(a1), y: cy + ar * Math.sin(a1) };
        return (
          <Svg width={w} height={h}>
            {earth.sunlit ? (
              <G>
                <Circle
                  cx={24}
                  cy={cy}
                  r={16}
                  fill={c.chartHighlight}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <ChartText x={24} y={cy + 32} fontSize={chart.tiny} textAnchor="middle">
                  Sun
                </ChartText>
              </G>
            ) : null}
            <Circle
              cx={cx}
              cy={cy}
              r={R}
              fill={earth.sunlit ? c.chartDay : c.chartFill}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            {earth.sunlit ? (
              <G>
                {/* The night half: darker than the day half in light and dark mode. */}
                <Path
                  d={`M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} Z`}
                  fill={c.chartNight}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <ChartText
                  x={cx - R / 2}
                  y={cy - R / 2}
                  fontSize={chart.tiny}
                  fill={c.chartInk}
                  textAnchor="middle"
                >
                  day
                </ChartText>
                <ChartText
                  x={cx + R / 2}
                  y={cy - R / 2}
                  fontSize={chart.tiny}
                  fill={c.chartInk}
                  textAnchor="middle"
                >
                  night
                </ChartText>
              </G>
            ) : null}
            <Circle cx={cx} cy={cy} r={4} fill={c.chartInk} />
            <ChartText x={cx} y={cy + 18} fontSize={chart.tiny} textAnchor="middle">
              center
            </ChartText>
            {/* the person (or, lit, the town): a body and a head standing out from the surface */}
            <Line
              x1={px}
              y1={py}
              x2={px + ox * 22}
              y2={py + oy * 22}
              stroke={c.chartInk}
              strokeWidth={chart.stroke * 1.5}
            />
            <Circle
              cx={px + ox * 28}
              cy={py + oy * 28}
              r={6}
              fill={c.chartSurface}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            {earth.sunlit ? (
              <G>
                <Path
                  d={`M ${cx + ar * Math.cos(a0)} ${cy + ar * Math.sin(a0)} A ${ar} ${ar} 0 0 0 ${end.x} ${end.y}`}
                  stroke={c.chartMuted}
                  strokeWidth={chart.stroke}
                  fill="none"
                />
                {/* Arrowhead: two barbs 30° either side of the way back along the arc. */}
                <Path
                  d={[0.5, -0.5]
                    .map((t) => {
                      const bx = -Math.sin(a1);
                      const by = Math.cos(a1);
                      const dx = 10 * (bx * Math.cos(t) - by * Math.sin(t));
                      const dy = 10 * (bx * Math.sin(t) + by * Math.cos(t));
                      return `M ${end.x} ${end.y} l ${dx} ${dy}`;
                    })
                    .join(' ')}
                  stroke={c.chartMuted}
                  strokeWidth={chart.stroke}
                  fill="none"
                />
                <ChartText x={end.x - 8} y={end.y - 8} fontSize={chart.tiny} textAnchor="end">
                  Earth turns this way
                </ChartText>
              </G>
            ) : (
              <G>
                <Circle
                  cx={ball.x}
                  cy={ball.y}
                  r={7}
                  fill={c.chartHighlight}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Arrow x1={ball.x} y1={ball.y} x2={ball.x - ox * 26} y2={ball.y - oy * 26} c={c} />
                {earth.thrown ? (
                  <Path
                    d={`M ${px + ox * 30 + tx * 20} ${py + oy * 30 + ty * 20} L ${ball.x} ${ball.y}`}
                    stroke={c.chartMuted}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dashFine}
                  />
                ) : null}
              </G>
            )}
            <ChartText x={w / 2} y={h - 6} fontSize={chart.label} textAnchor="middle">
              {earth.sunlit
                ? `${earth.sunlit[0]!.toUpperCase()}${earth.sunlit.slice(1)} at the marked town`
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

/** A ball and a box; the ball drawn where the position word puts it. */
function Position({ where, c }: { where: NonNullable<Scene['position']>; c: Palette }) {
  return (
    <Canvas aspect={0.6}>
      {({ w, h }) => {
        const box = { x: w / 2 - 50, y: h * 0.42, w: 100, h: 70 };
        const r = 20;
        const ball =
          where === 'above'
            ? { x: w / 2, y: box.y - r - 10 }
            : where === 'below'
              ? { x: w / 2, y: box.y + box.h + r + 10 }
              : where === 'beside'
                ? { x: box.x + box.w + r + 14, y: box.y + box.h / 2 }
                : where === 'in front of'
                  ? { x: w / 2 - 20, y: box.y + box.h - 6 }
                  : { x: w / 2 + 24, y: box.y + 4 };
        const ballNode = (
          <Circle
            cx={ball.x}
            cy={ball.y}
            r={r}
            fill={c.chartHighlight}
            stroke={c.chartInk}
            strokeWidth={chart.stroke}
          />
        );
        const boxNode = (
          <G>
            <Rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              fill={c.chartFill}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <Path
              d={`M ${box.x} ${box.y} l 18 -14 h ${box.w} l -18 14 M ${box.x + box.w} ${box.y} l 18 -14 v ${box.h} l -18 14`}
              fill={c.chartSurface}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
          </G>
        );
        return (
          <Svg width={w} height={h}>
            <Line
              x1={16}
              y1={box.y + box.h}
              x2={w - 16}
              y2={box.y + box.h}
              stroke={c.chartGrid}
              strokeWidth={chart.stroke}
            />
            {/* Behind: the box is drawn over the ball. */}
            {where === 'behind' ? ballNode : null}
            {boxNode}
            {where === 'behind' ? null : ballNode}
          </Svg>
        );
      }}
    </Canvas>
  );
}

/** A clock face with the hands set to the scene's time. */
function ClockFace({ time, c }: { time: [number, number]; c: Palette }) {
  const [hour, minute] = time;
  return (
    <Canvas aspect={0.8}>
      {({ w, h }) => {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) / 2 - 16;
        const hand = (angle: number, len: number, width: number) => {
          const a = ((angle - 90) * Math.PI) / 180;
          return (
            <Line
              x1={cx}
              y1={cy}
              x2={cx + len * Math.cos(a)}
              y2={cy + len * Math.sin(a)}
              stroke={c.chartInk}
              strokeWidth={width}
              strokeLinecap="round"
            />
          );
        };
        return (
          <Svg width={w} height={h}>
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              fill={c.chartSurface}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            {Array.from({ length: 12 }, (_, i) => {
              const a = ((i * 30 - 90) * Math.PI) / 180;
              return (
                <ChartText
                  key={i}
                  x={cx + (r - 18) * Math.cos(a)}
                  y={cy + (r - 18) * Math.sin(a) + 5}
                  fontSize={chart.emphasis}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {String(i === 0 ? 12 : i)}
                </ChartText>
              );
            })}
            {hand((hour % 12) * 30 + minute / 2, r * 0.5, chart.strokeHeavy + 1)}
            {hand(minute * 6, r * 0.78, chart.stroke)}
            <Circle cx={cx} cy={cy} r={4} fill={c.chartInk} />
          </Svg>
        );
      }}
    </Canvas>
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

/** Two bar magnets facing each other, with arrows for pull or push. */
function Magnets({ poles, c }: { poles: NonNullable<Scene['poles']>; c: Palette }) {
  const [leftEnd, rightEnd] = poles.split('–') as [string, string];
  const attract = leftEnd !== rightEnd;
  return (
    <Canvas aspect={0.36}>
      {({ w, h }) => {
        const y = h / 2;
        const mw = Math.min(150, w * 0.34);
        const mh = 44;
        const gap = attract ? 18 : 56;
        const leftX = w / 2 - gap / 2 - mw;
        const rightX = w / 2 + gap / 2;
        const magnet = (x: number, first: string, second: string) => (
          <G>
            <Rect
              x={x}
              y={y - mh / 2}
              width={mw / 2}
              height={mh}
              fill={first === 'N' ? c.chartHighlight : c.chartFill}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <Rect
              x={x + mw / 2}
              y={y - mh / 2}
              width={mw / 2}
              height={mh}
              fill={second === 'N' ? c.chartHighlight : c.chartFill}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <ChartText
              x={x + mw / 4}
              y={y + 5}
              fontSize={chart.emphasis}
              fontWeight="700"
              fill={first === 'N' ? c.onChartHighlight : c.chartInk}
              textAnchor="middle"
            >
              {first}
            </ChartText>
            <ChartText
              x={x + (3 * mw) / 4}
              y={y + 5}
              fontSize={chart.emphasis}
              fontWeight="700"
              fill={second === 'N' ? c.onChartHighlight : c.chartInk}
              textAnchor="middle"
            >
              {second}
            </ChartText>
          </G>
        );
        const arrow = (from: number, to: number) => (
          <Path
            d={`M ${from} ${y - mh / 2 - 14} L ${to} ${y - mh / 2 - 14} M ${to} ${y - mh / 2 - 14} l ${to > from ? -8 : 8} -5 M ${to} ${y - mh / 2 - 14} l ${to > from ? -8 : 8} 5`}
            stroke={c.chartInk}
            strokeWidth={chart.stroke}
            fill="none"
          />
        );
        const other = (p: string) => (p === 'N' ? 'S' : 'N');
        return (
          <Svg width={w} height={h}>
            {magnet(leftX, other(leftEnd), leftEnd)}
            {magnet(rightX, rightEnd, other(rightEnd))}
            {attract
              ? arrow(leftX + mw - 40, leftX + mw - 4)
              : arrow(leftX + mw - 4, leftX + mw - 40)}
            {attract ? arrow(rightX + 40, rightX + 4) : arrow(rightX + 4, rightX + 40)}
            <ChartText x={w / 2} y={h - 6} fontSize={chart.label} textAnchor="middle">
              {attract ? 'pull together' : 'push apart'}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

/** A flashlight code: a lit circle per short flash, a lit bar per long one. */
function Flashes({ pattern, c }: { pattern: string; c: Palette }) {
  const marks = pattern.split(/\s+/).filter(Boolean);
  return (
    <View style={styles.flashes}>
      {marks.map((m, i) => (
        <View
          key={i}
          style={[
            m === '—' ? styles.longFlash : styles.flash,
            { backgroundColor: c.chartHighlight, borderColor: c.chartInk },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
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
  flashes: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.md,
    minHeight: 80,
  },
  flash: { width: 44, height: 44, borderRadius: 22, borderWidth: chart.stroke },
  longFlash: { width: 96, height: 44, borderRadius: 22, borderWidth: chart.stroke },
});

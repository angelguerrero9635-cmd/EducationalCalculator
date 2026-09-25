import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { ExploreLayout as Spec, Figure, Scene } from '@/data/modules/layouts';
import { chart, font, radius, space, usePalette, type Palette } from '@/theme';

import { Canvas, Caption, ChartText } from '../reps/common';

/**
 * A picture with a few scenes to switch between: tap a scene, the figure changes, and the
 * caption says what to notice. There are no numbers to type.
 */
export function ExploreLayout({ spec }: { spec: Spec }) {
  const c = usePalette();
  const [index, setIndex] = useState(0);
  const scene = spec.scenes[index]!;
  return (
    <View style={styles.wrap}>
      <FigureView figure={spec.figure} scene={scene} c={c} />
      <Caption>{scene.lines.join(' ')}</Caption>
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
    </View>
  );
}

function FigureView({ figure, scene, c }: { figure: Figure; scene: Scene; c: Palette }) {
  switch (figure.kind) {
    case 'parts':
      return <Parts parts={figure.parts} highlight={scene.part} c={c} />;
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
  }
}

/** A thing built from its parts, top to bottom, the highlighted one filled and its job beside it. */
function Parts({
  parts,
  highlight,
  c,
}: {
  parts: { name: string; job: string }[];
  highlight: string | undefined;
  c: Palette;
}) {
  return (
    <View style={styles.parts}>
      {parts.map((p) => {
        const on = p.name === highlight;
        return (
          <View
            key={p.name}
            testID={`part-${p.name}`}
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
          </View>
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

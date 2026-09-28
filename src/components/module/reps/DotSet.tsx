import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Rect } from 'react-native-svg';

import { SegmentedControl } from '@/components/SegmentedControl';
import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Ball, BoxShadow, TopLight, url, usePaintIds } from './paint';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'dotSet' }>;
type Layout = 'line' | 'array' | 'circle' | 'scattered';

/**
 * Fixed "scattered" spots (in a unit square, the counters' centres), so the dots don't jump
 * around: each spot is the farthest from those before it, so any first few are spread out and
 * 19 counters never touch.
 */
const SCATTER = [
  [0.32, 0.15],
  [1.0, 0.96],
  [0.0, 0.99],
  [0.85, 0.0],
  [0.52, 1.0],
  [0.01, 0.35],
  [0.75, 0.58],
  [0.26, 0.69],
  [0.59, 0.07],
  [0.99, 0.42],
  [0.49, 0.52],
  [0.76, 1.0],
  [0.13, 0.05],
  [0.19, 0.37],
  [0.34, 1.0],
  [0.07, 0.66],
  [0.73, 0.25],
  [0.17, 1.0],
  [0.91, 0.68],
  [0.61, 0.74],
] as const;

/** The mat's height ÷ width, its inner margin, and the largest counter. */
const ASPECT = 0.62;
const MARGIN = 18;
const BIG = 38;
const TOUCH = chart.handleTouch;

/**
 * The same number of counters on a felt mat in a line, rows, a circle or scattered: the count
 * doesn't change with the arrangement. Tap each counter to count it: it shows the number you
 * say (1, 2, 3 …), so "touch each one once" can be seen, and the last number is how many.
 * − / + change how many.
 */
export function DotSet({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('dot', 'mat');
  const rep = useRep(calc);
  const [layout, setLayout] = useState<Layout>('scattered');
  const n = rep.known(spec.count) ? Math.max(0, Math.round(rep.shown(spec.count))) : 0;
  // The counters tapped so far, in the order they were counted (starts over on a change).
  const [counted, setCounted] = useState<{ key: string; order: number[] }>({ key: '', order: [] });
  const key = `${layout}:${n}`;
  const order = counted.key === key ? counted.order : [];
  const done = n > 0 && order.length === n;
  const tap = (i: number) => {
    if (done) return setCounted({ key, order: [] });
    // Tap the last one counted again to take it back; a counted one keeps its number.
    if (order[order.length - 1] === i) return setCounted({ key, order: order.slice(0, -1) });
    if (!order.includes(i)) setCounted({ key, order: [...order, i] });
  };

  return (
    <View>
      <View style={styles.toggle}>
        <SegmentedControl<Layout>
          segments={[
            { value: 'line', label: 'Line' },
            { value: 'array', label: 'Rows' },
            { value: 'circle', label: 'Circle' },
            { value: 'scattered', label: 'Scattered' },
          ]}
          value={layout}
          onChange={setLayout}
        />
      </View>
      <Canvas aspect={ASPECT}>
        {({ w, h }) => {
          const [iw, ih] = [w - 2 * MARGIN - 8, h - 2 * MARGIN - 6];
          // Counter size from the count and the arrangement: as big as fits, 38 px at most.
          const size =
            layout === 'line'
              ? Math.min(BIG, iw / Math.max(1, n) / 1.18)
              : layout === 'array'
                ? Math.min(BIG, iw / 5 / 1.3, ih / Math.max(1, Math.ceil(n / 5)) / 1.3)
                : layout === 'circle'
                  ? Math.min(BIG, ih / 3.2, (2 * Math.PI * (ih / 2)) / Math.max(1, n) / 1.45)
                  : Math.min(BIG, n <= 10 ? BIG : n <= 15 ? 32 : 27);
          const r = size / 2;
          const cx0 = w / 2;
          const cy0 = h / 2 - 2;
          const pos = (i: number): [number, number] => {
            if (layout === 'line') {
              const gap = size * 1.18;
              return [cx0 - (gap * (n - 1)) / 2 + gap * i, cy0];
            }
            if (layout === 'array') {
              // Rows of 5, like a ten-frame without the frame.
              const gap = size * 1.3;
              const rows = Math.ceil(n / 5);
              return [
                cx0 - 2 * gap + (i % 5) * gap,
                cy0 - ((rows - 1) * gap) / 2 + Math.floor(i / 5) * gap,
              ];
            }
            if (layout === 'circle') {
              const t = (2 * Math.PI * i) / Math.max(1, n) - Math.PI / 2;
              const R = n === 1 ? 0 : ih / 2 - r;
              return [cx0 + R * Math.cos(t), cy0 + R * Math.sin(t)];
            }
            const [x, y] = SCATTER[i % SCATTER.length]!;
            return [MARGIN + 4 + r + x * (iw - size), MARGIN + 3 + r + y * (ih - size)];
          };
          const spots = Array.from({ length: n }, (_, i) => pos(i));
          return (
            <View>
              <Svg width={w} height={h}>
                <Defs>
                  <Ball id={paint.dot} color={c.chartHighlight} />
                  <TopLight id={paint.mat} strength={0.6} />
                </Defs>
                {/* A green felt mat with stitched edges. */}
                <BoxShadow x={4} y={2} width={w - 8} height={h - 8} r={16} offset={4} />
                <Rect x={4} y={2} width={w - 8} height={h - 8} rx={16} fill={c.feltMat} />
                <Rect x={4} y={2} width={w - 8} height={h - 8} rx={16} fill={url(paint.mat)} />
                <Rect
                  x={11}
                  y={9}
                  width={w - 22}
                  height={h - 22}
                  rx={11}
                  fill="none"
                  stroke={c.lifeDeep}
                  strokeOpacity={0.45}
                  strokeDasharray="4 3"
                />
                {/* Each counter's shadow on the felt. */}
                {spots.map(([x, y], i) => (
                  <Ellipse
                    key={`s${i}`}
                    cx={x + 2}
                    cy={y + r * 0.72}
                    rx={r * 0.9}
                    ry={r * 0.38}
                    fill={c.shadow}
                  />
                ))}
                {spots.map(([x, y], i) => (
                  <Circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={r}
                    fill={url(paint.dot)}
                    stroke={c.chartInk}
                    strokeOpacity={0.6}
                    strokeWidth={chart.strokeLight}
                  />
                ))}
                {/* A raised rim on each counter, like a plastic chip. */}
                {spots.map(([x, y], i) => (
                  <Circle
                    key={`rim${i}`}
                    cx={x}
                    cy={y}
                    r={r * 0.72}
                    fill="none"
                    stroke={c.edgeLight}
                    strokeWidth={Math.max(1, r * 0.1)}
                  />
                ))}
                {spots.map(([x, y], i) => {
                  const at = order.indexOf(i);
                  if (at < 0) return null;
                  return (
                    <ChartText
                      key={`n${i}`}
                      x={x}
                      y={y + Math.max(chart.label, size * 0.42) * 0.36}
                      textAnchor="middle"
                      fontSize={Math.max(chart.label, Math.min(chart.emphasis + 2, size * 0.42))}
                      fontWeight="800"
                      fill={c.onChartHighlight}
                    >
                      {at + 1}
                    </ChartText>
                  );
                })}
              </Svg>
              {spots.map(([x, y], i) => (
                <Pressable
                  key={i}
                  testID={`pic-dot-${i + 1}`}
                  accessibilityLabel={
                    order.includes(i) ? `Counted: ${order.indexOf(i) + 1}` : 'Tap to count'
                  }
                  onPress={() => tap(i)}
                  style={{
                    position: 'absolute',
                    left: x - Math.max(TOUCH, size) / 2,
                    top: y - Math.max(TOUCH, size) / 2,
                    width: Math.max(TOUCH, size),
                    height: Math.max(TOUCH, size),
                    borderRadius: TOUCH,
                  }}
                />
              ))}
            </View>
          );
        }}
      </Canvas>
      <Text style={[styles.hint, { color: c.textMuted }]}>
        {n === 0
          ? ' '
          : done
            ? `You counted ${n}. Tap a dot to count again.`
            : 'Tap each dot once to count it.'}
      </Text>
      <Caption>{`${rep.label(spec.count)} dots, however they are arranged`}</Caption>
      <Steppers calc={calc} items={[{ var: spec.count, steps: [1], pin: [] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { paddingHorizontal: space.md, marginBottom: space.sm },
  hint: { fontSize: font.caption + 1, textAlign: 'center', marginTop: space.xs },
});

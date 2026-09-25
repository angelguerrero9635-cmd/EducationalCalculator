import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'quadrilateral' }>;

/** Its name from right angles and equal sides (for shapes with 2 pairs of equal sides). */
function nameOf(right: boolean, equal: boolean) {
  if (right && equal) return { name: 'square', why: '4 right angles and 4 equal sides' };
  if (right) return { name: 'rectangle', why: '4 right angles; opposite sides equal' };
  if (equal) return { name: 'rhombus', why: '4 equal sides, no right angles' };
  return { name: 'parallelogram', why: 'opposite sides equal, no right angles' };
}

/** Quadrilaterals outside this page's family, drawn small for comparing. */
const OTHERS = [
  {
    name: 'Trapezoid',
    points: '26,8 70,8 92,52 4,52',
    why: 'One pair of sides go the same way; the other two sides don’t.',
  },
  {
    name: 'Kite',
    points: '48,4 72,22 48,56 24,22',
    why: 'Two pairs of equal sides next to each other, not opposite.',
  },
];

/**
 * A quadrilateral with two pairs of equal sides: square corners or slanted, equal sides or
 * not. Its name updates as the sides and corners change.
 */
export function Quadrilateral({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const a = Math.max(1, rep.shown(spec.first));
  const b = Math.max(1, rep.shown(spec.second));
  const right = Math.round(rep.shown(spec.rightAngles)) === 4;
  const equal = Math.round(a) === Math.round(b);
  const { name, why } = nameOf(right, equal);
  const toggle = () =>
    calc.set({ ...rep.pin([spec.first, spec.second]), [spec.rightAngles]: right ? 0 : 4 });

  return (
    <View>
      <Canvas aspect={0.7}>
        {({ w, h }) => {
          const scale = Math.min((w - 110) / (a + b * 0.5), (h - 60) / b);
          const sa = a * scale;
          const slant = right ? 0 : b * scale * 0.5;
          const sh = right ? b * scale : b * scale * 0.87;
          const x0 = (w - sa - slant) / 2;
          const y0 = (h - sh) / 2;
          type Pt = [number, number];
          const pts: [Pt, Pt, Pt, Pt] = [
            [x0 + slant, y0],
            [x0 + slant + sa, y0],
            [x0 + sa, y0 + sh],
            [x0, y0 + sh],
          ];
          // Tick marks: one on each first side, two on each second side (one each when equal).
          const tick = (p: [number, number], q: [number, number], n: number, key: string) => {
            const [mx, my] = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
            const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
            const [ux, uy] = [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
            return Array.from({ length: n }, (_, i) => {
              const off = (i - (n - 1) / 2) * 5;
              const [cx, cy] = [mx + ux * off, my + uy * off];
              return (
                <Path
                  key={`${key}${i}`}
                  d={`M ${cx - uy * 6} ${cy + ux * 6} L ${cx + uy * 6} ${cy - ux * 6}`}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
              );
            });
          };
          const n2 = equal ? 1 : 2;
          const box = 12;
          return (
            <Svg width={w} height={h}>
              <Polygon
                points={pts.map((p) => p.join(',')).join(' ')}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {tick(pts[0], pts[1], 1, 't')}
              {tick(pts[3], pts[2], 1, 'b')}
              {tick(pts[1], pts[2], n2, 'r')}
              {tick(pts[0], pts[3], n2, 'l')}
              {right
                ? pts.map(([x, y], i) => {
                    const sx = i === 0 || i === 3 ? 1 : -1;
                    const sy = i < 2 ? 1 : -1;
                    return (
                      <Path
                        key={`r${i}`}
                        d={`M ${x + sx * box} ${y} L ${x + sx * box} ${y + sy * box} L ${x} ${y + sy * box}`}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                        fill="none"
                      />
                    );
                  })
                : null}
              <ChartText
                x={(pts[0][0] + pts[1][0]) / 2}
                y={y0 - 10}
                fontSize={chart.value}
                textAnchor="middle"
              >
                {rep.label(spec.first)}
              </ChartText>
              <ChartText
                x={(pts[1][0] + pts[2][0]) / 2 + 12}
                y={(pts[1][1] + pts[2][1]) / 2 + 4}
                fontSize={chart.value}
              >
                {rep.label(spec.second)}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{`A ${name}: ${why}.`}</Caption>
      <View style={styles.toggleRow}>
        <Pressable
          testID="toggle-right-angles"
          accessibilityRole="switch"
          accessibilityState={{ checked: right }}
          onPress={toggle}
          style={({ pressed }) => [
            styles.toggle,
            { borderColor: c.border, backgroundColor: pressed ? c.surface : c.background },
          ]}
        >
          <Text style={[styles.toggleText, { color: c.text }]}>
            {right ? 'Right angles: 4 (tap for 0)' : 'Right angles: 0 (tap for 4)'}
          </Text>
        </Pressable>
      </View>
      <Steppers
        calc={calc}
        items={[
          { var: spec.first, steps: [1], pin: [spec.second, spec.rightAngles] },
          { var: spec.second, steps: [1], pin: [spec.first, spec.rightAngles] },
        ]}
      />
      {/* Quadrilaterals that don't have 2 pairs of equal opposite sides, for sorting. */}
      <Text style={[styles.otherTitle, { color: c.textMuted }]}>Other quadrilaterals</Text>
      <View style={styles.others}>
        {OTHERS.map((o) => (
          <View key={o.name} style={styles.other}>
            <Svg width={96} height={60}>
              <Polygon
                points={o.points}
                fill={c.chartSurface}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
            </Svg>
            <Text style={[styles.otherName, { color: c.text }]}>{o.name}</Text>
            <Text style={[styles.otherWhy, { color: c.textMuted }]}>{o.why}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: { alignItems: 'center', marginTop: space.sm },
  toggle: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleText: { fontSize: font.body, fontWeight: '600' },
  otherTitle: {
    fontSize: font.caption,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: space.lg,
  },
  others: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.lg,
    marginTop: space.sm,
    paddingHorizontal: space.lg,
  },
  other: { flex: 1, maxWidth: 170, alignItems: 'center', gap: 2 },
  otherName: { fontSize: font.body, fontWeight: '700' },
  otherWhy: { fontSize: font.caption, textAlign: 'center' },
});

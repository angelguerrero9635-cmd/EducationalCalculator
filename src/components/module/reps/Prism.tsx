import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { chart, font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, nowrap, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'prism' }>;
type Part = 'faces' | 'edges' | 'corners';
type Pt = { x: number; y: number };

const NAMES: Record<number, string> = {
  3: 'triangular prism',
  4: 'cube (or a box)',
  5: 'pentagonal prism',
  6: 'hexagonal prism',
};

/** Light comes from the front left (the direction a face must turn to to be brightest). */
const LIGHT = 2.2;
/** Count chips: big enough for "18" at 12 px. */
const CHIP = 10;

/**
 * A prism seen from slightly above, flat-shaded: the top lightest, each side a little darker
 * the more it turns from the light at the front left. Visible edges are heavy ink, hidden edges
 * thin and dashed; every corner is a small ink dot (paler at the back). `counting` adds Faces,
 * Edges and Corners buttons: each numbers every one of those on the solid with a count chip
 * (dashed chips are at the back). − / + change the sides of the base.
 */
export function Prism({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const n = Math.max(3, Math.round(rep.shown(spec.sides)));
  const [part, setPart] = useState<Part | null>(null);
  const size = (w: number) => {
    const rx = Math.min(w * 0.4, 160);
    const ry = rx * 0.4;
    const height = n === 4 ? rx * 1.3 : rx * 1.1;
    return { rx, ry, height, h: 30 + 2 * ry + height + 30 };
  };

  return (
    <View>
      <Canvas aspect={(w) => size(w).h / w}>
        {({ w, h }) => {
          const { rx, ry, height } = size(w);
          const cx = w / 2;
          const topY = 30 + ry;
          // Turned a little, so no edge points straight at the viewer (looks solid).
          const angle = (i: number) => (2 * Math.PI * i) / n + Math.PI / 2 + 0.45;
          const ring = (y: number): Pt[] =>
            Array.from({ length: n }, (_, i) => ({
              x: cx + rx * Math.cos(angle(i)),
              y: y + ry * Math.sin(angle(i)),
            }));
          // Seen from above: side face i (from corner i to i + 1) faces us when its middle is
          // on the near side. Hidden edges: a bottom edge of a hidden face, and an upright
          // edge between two hidden faces.
          const mid = (i: number) => angle(i) + Math.PI / n;
          const faces = (i: number) => Math.sin(mid(i)) > 1e-9;
          const hiddenUpright = (i: number) => !faces(i) && !faces((i + n - 1) % n);
          const top = ring(topY);
          const bottom = ring(topY + height);
          const pts = (p: Pt[]) => p.map((q) => `${q.x},${q.y}`).join(' ');
          const avg = (p: Pt[]) => ({
            x: p.reduce((s, q) => s + q.x, 0) / p.length,
            y: p.reduce((s, q) => s + q.y, 0) / p.length,
          });
          const edge = (a: Pt, b: Pt, hidden: boolean, key: string) => (
            <Line
              key={key}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={part === 'edges' ? c.chartHighlight : hidden ? c.chartMuted : c.chartInk}
              strokeWidth={hidden ? chart.strokeLight : 2.5}
              strokeDasharray={hidden ? chart.dash : undefined}
              strokeLinecap="round"
            />
          );
          const hiddenEdges: React.ReactNode[] = [];
          const shownEdges: React.ReactNode[] = [];
          for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            shownEdges.push(edge(top[i]!, top[j]!, false, `t${i}`));
            (hiddenUpright(i) ? hiddenEdges : shownEdges).push(
              edge(top[i]!, bottom[i]!, hiddenUpright(i), `u${i}`),
            );
            (faces(i) ? shownEdges : hiddenEdges).push(
              edge(bottom[i]!, bottom[j]!, !faces(i), `b${i}`),
            );
          }

          // What the count chips number, in counting order, and whether each is at the back.
          const chips: { at: Pt; back: boolean }[] = [];
          if (part === 'faces') {
            chips.push({ at: { x: cx, y: topY }, back: false });
            const sides = Array.from({ length: n }, (_, i) => i);
            const face = (i: number) =>
              avg([top[i]!, top[(i + 1) % n]!, bottom[(i + 1) % n]!, bottom[i]!]);
            // The sides we see, left to right; then the bottom and the sides at the back.
            sides
              .filter(faces)
              .sort((a, b) => face(a).x - face(b).x)
              .forEach((i) => chips.push({ at: face(i), back: false }));
            chips.push({ at: { x: cx, y: topY + height + ry * 0.45 }, back: true });
            sides
              .filter((i) => !faces(i))
              .sort((a, b) => face(a).x - face(b).x)
              .forEach((i) => {
                // A back face's chip is at its middle, seen through the front (dashed).
                chips.push({ at: face(i), back: true });
              });
          } else if (part === 'edges') {
            for (let i = 0; i < n; i++) {
              const j = (i + 1) % n;
              chips.push({ at: avg([top[i]!, top[j]!]), back: false });
            }
            for (let i = 0; i < n; i++)
              chips.push({
                at: { x: top[i]!.x, y: topY + height * 0.5 + ry * Math.sin(angle(i)) },
                back: hiddenUpright(i),
              });
            for (let i = 0; i < n; i++) {
              const j = (i + 1) % n;
              chips.push({ at: avg([bottom[i]!, bottom[j]!]), back: !faces(i) });
            }
          } else if (part === 'corners') {
            // Beside each corner, out to the side, above the top ones and below the front
            // bottom ones; the back bottom corners' chips go up into the empty back.
            const beside = (p: Pt, v: number): Pt => {
              const dx = p.x - cx;
              const side = Math.abs(dx) < 8 ? 0 : Math.sign(dx);
              return { x: p.x + side * 14, y: p.y + v * (side ? 1 : 1.5) };
            };
            top.forEach((p) => chips.push({ at: beside(p, -11), back: false }));
            bottom.forEach((p, i) =>
              chips.push({
                at: beside(p, hiddenUpright(i) ? -13 : 11),
                back: hiddenUpright(i),
              }),
            );
          }

          chips.forEach((ch, i) => {
            for (let k = 0; k < 4; k++) {
              const near = chips
                .slice(0, i)
                .some((o) => Math.hypot(o.at.x - ch.at.x, o.at.y - ch.at.y) < 2 * CHIP + 8);
              if (!near) break;
              ch.at = { x: ch.at.x, y: ch.at.y + 2 * CHIP + 8 };
            }
          });

          return (
            <Svg width={w} height={h} opacity={rep.known(spec.sides) ? 1 : 0.35}>
              {/* Solid faces, flat: each tinted by how much it turns to the light. */}
              {top.map((p, i) => {
                if (!faces(i)) return null;
                const j = (i + 1) % n;
                const turn = Math.cos(mid(i) - LIGHT);
                const q = [p, top[j]!, bottom[j]!, bottom[i]!];
                return (
                  <G key={`f${i}`}>
                    <Polygon points={pts(q)} fill={c.card} />
                    <Polygon
                      points={pts(q)}
                      fill={c.chartHighlight}
                      fillOpacity={0.3 - 0.12 * turn}
                    />
                  </G>
                );
              })}
              <Polygon points={pts(top)} fill={c.card} />
              <Polygon points={pts(top)} fill={c.chartHighlight} fillOpacity={0.08} />
              {hiddenEdges}
              {shownEdges}
              {bottom.map((p, i) => (
                <Circle
                  key={`vb${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={3.5}
                  fill={hiddenUpright(i) ? c.chartMuted : c.chartInk}
                />
              ))}
              {top.map((p, i) => (
                <Circle key={`vt${i}`} cx={p.x} cy={p.y} r={3.5} fill={c.chartInk} />
              ))}
              {chips.map((ch, i) => (
                <G key={`c${i}`}>
                  <Circle
                    cx={ch.at.x}
                    cy={ch.at.y}
                    r={CHIP}
                    fill={ch.back ? c.card : c.chartHighlight}
                    stroke={ch.back ? c.chartHighlight : c.card}
                    strokeWidth={ch.back ? chart.strokeLight : 1}
                    strokeDasharray={ch.back ? chart.dashFine : undefined}
                  />
                  <ChartText
                    x={ch.at.x}
                    y={ch.at.y + 4.3}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={ch.back ? c.chartInk : c.onChartHighlight}
                    textAnchor="middle"
                  >
                    {String(i + 1)}
                  </ChartText>
                </G>
              ))}
            </Svg>
          );
        }}
      </Canvas>
      {spec.counting ? (
        <View style={styles.row}>
          {(['faces', 'edges', 'corners'] as const).map((p) => {
            const on = part === p;
            return (
              <Pressable
                key={p}
                testID={`count-${p}`}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`Count the ${p}`}
                onPress={() => setPart(on ? null : p)}
                style={[
                  styles.button,
                  {
                    borderColor: on ? c.accent : c.border,
                    backgroundColor: on ? c.accentSoft : c.card,
                  },
                ]}
              >
                <Text style={[styles.buttonText, { color: on ? c.accent : c.text }]}>
                  {`${p[0]!.toUpperCase()}${p.slice(1)}`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <Caption>{`A ${NAMES[n] ?? `prism with a ${n}-sided base`}: ${nowrap(`${rep.label(spec.faces)} faces`)}, ${nowrap(`${rep.label(spec.edges)} edges`)}, ${nowrap(`${rep.label(spec.corners)} corners`)}.${part ? ' Dashed circles are at the back.' : ''}`}</Caption>
      <Steppers calc={calc} items={[{ var: spec.sides, steps: [1], pin: [] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: space.sm, marginTop: space.xs },
  button: {
    minHeight: 44,
    minWidth: 88,
    paddingHorizontal: space.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  buttonText: { fontSize: font.body, fontWeight: '600' },
});

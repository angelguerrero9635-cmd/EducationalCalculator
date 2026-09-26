import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { G, Line, Polygon, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'net' }>;

type Face = { x: number; y: number; w: number; h: number; name: string; area: number };

/**
 * A box, cube or square pyramid unfolded flat, each face labelled with its area; "Fold" draws
 * the solid instead. Every face of the solid is one piece of the net, so the surface area is
 * the areas added.
 */
export function Net({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [folded, setFolded] = useState(false);
  const L = Math.max(0.1, rep.shown(spec.length));
  const W = spec.width ? Math.max(0.1, rep.shown(spec.width)) : L;
  const H = spec.height ? Math.max(0.1, rep.shown(spec.height)) : L;
  const slant = spec.slant ? Math.max(0.1, rep.shown(spec.slant)) : L;
  const known = rep.known(spec.length);
  const n = (x: number) => formatNumber(Number(x.toFixed(3)));
  const pyramid = spec.solid === 'squarePyramid';
  const lengthUnit = rep.unit(spec.length);
  const unit = lengthUnit ? ` ${lengthUnit}` : '';

  // Faces in net units: a box as a cross (back, top, front, bottom down the middle; the two
  // ends beside the top); a pyramid as its square base with a triangle on each side.
  const faces: Face[] = pyramid
    ? [{ x: slant, y: slant, w: L, h: L, name: 'base', area: L * L }]
    : [
        { x: H, y: 0, w: L, h: H, name: 'back', area: L * H },
        { x: 0, y: H, w: H, h: W, name: 'end', area: W * H },
        { x: H, y: H, w: L, h: W, name: 'top', area: L * W },
        { x: H + L, y: H, w: H, h: W, name: 'end', area: W * H },
        { x: H, y: H + W, w: L, h: H, name: 'front', area: L * H },
        { x: H, y: 2 * H + W, w: L, h: W, name: 'bottom', area: L * W },
      ];
  const netW = pyramid ? L + 2 * slant : 2 * H + L;
  const netH = pyramid ? L + 2 * slant : 2 * H + 2 * W;
  const triangle = 0.5 * L * slant;
  const total = pyramid ? L * L + 4 * triangle : faces.reduce((s, f) => s + f.area, 0);

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={folded ? 'Unfold the net' : 'Fold the net'}
        onPress={() => setFolded(!folded)}
      >
        <Canvas aspect={0.8}>
          {({ w, h }) => {
            // Room around the net for the edge lengths.
            const pad = 28;
            const s = Math.min((w - 2 * pad) / netW, (h - 2 * pad) / netH);
            const ox = (w - netW * s) / 2;
            const oy = (h - netH * s) / 2;
            const X = (u: number) => ox + u * s;
            const Y = (v: number) => oy + v * s;
            if (folded) {
              // The solid in a simple oblique view.
              const k = Math.min((w - 2 * pad) / (L + W * 0.6), (h - 2 * pad) / (H + W * 0.6));
              const d = W * 0.5 * k;
              const x1 = (w - (L * k + d)) / 2;
              const y1 = (h + (H * k - d)) / 2;
              if (pyramid) {
                const apex = `${x1 + (L * k + d) / 2},${y1 - H * k * 0.9}`;
                return (
                  <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                    <Polygon
                      points={`${x1},${y1} ${x1 + L * k},${y1} ${x1 + L * k + d},${y1 - d} ${x1 + d},${y1 - d}`}
                      fill={c.chartFill}
                      stroke={c.chartInk}
                    />
                    <Polygon
                      points={`${x1},${y1} ${x1 + L * k},${y1} ${apex}`}
                      fill={c.chartHighlight}
                      fillOpacity={0.2}
                      stroke={c.chartInk}
                    />
                    <Polygon
                      points={`${x1 + L * k},${y1} ${x1 + L * k + d},${y1 - d} ${apex}`}
                      fill={c.chartHighlight}
                      fillOpacity={0.1}
                      stroke={c.chartInk}
                    />
                  </Svg>
                );
              }
              return (
                <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                  <Rect
                    x={x1}
                    y={y1 - H * k}
                    width={L * k}
                    height={H * k}
                    fill={c.chartHighlight}
                    fillOpacity={0.2}
                    stroke={c.chartInk}
                  />
                  <Polygon
                    points={`${x1},${y1 - H * k} ${x1 + d},${y1 - H * k - d} ${x1 + L * k + d},${y1 - H * k - d} ${x1 + L * k},${y1 - H * k}`}
                    fill={c.chartFill}
                    stroke={c.chartInk}
                  />
                  <Polygon
                    points={`${x1 + L * k},${y1} ${x1 + L * k},${y1 - H * k} ${x1 + L * k + d},${y1 - H * k - d} ${x1 + L * k + d},${y1 - d}`}
                    fill={c.chartSurface}
                    stroke={c.chartInk}
                  />
                </Svg>
              );
            }
            const label = (f: { x: number; y: number; w: number; h: number }, text: string) => (
              <ChartText
                x={X(f.x + f.w / 2)}
                y={Y(f.y + f.h / 2) + 4}
                fontSize={chart.small}
                fill={c.chartInk}
                textAnchor="middle"
              >
                {text}
              </ChartText>
            );
            return (
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                {faces.map((f, i) => (
                  <G key={i}>
                    <Rect
                      x={X(f.x)}
                      y={Y(f.y)}
                      width={f.w * s}
                      height={f.h * s}
                      fill={i % 2 ? c.chartFill : c.chartHighlight}
                      fillOpacity={i % 2 ? 1 : 0.18}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    {f.w * s > 34 && f.h * s > 18
                      ? label(
                          f,
                          // "5 × 3 = 15" where it fits: the face's two edges times each other.
                          f.w * s > 22 + 7 * `${n(f.w)} × ${n(f.h)} = ${n(f.area)}`.length
                            ? `${n(f.w)} × ${n(f.h)} = ${n(f.area)}`
                            : n(f.area),
                        )
                      : null}
                  </G>
                ))}
                {pyramid
                  ? [
                      // Triangles on the four sides of the base, pointing out.
                      `${X(slant)},${Y(slant)} ${X(slant + L)},${Y(slant)} ${X(slant + L / 2)},${Y(0)}`,
                      `${X(slant)},${Y(slant + L)} ${X(slant + L)},${Y(slant + L)} ${X(slant + L / 2)},${Y(2 * slant + L)}`,
                      `${X(slant)},${Y(slant)} ${X(slant)},${Y(slant + L)} ${X(0)},${Y(slant + L / 2)}`,
                      `${X(slant + L)},${Y(slant)} ${X(slant + L)},${Y(slant + L)} ${X(2 * slant + L)},${Y(slant + L / 2)}`,
                    ].map((pts, i) => (
                      <G key={`t${i}`}>
                        <Polygon
                          points={pts}
                          fill={c.chartHighlight}
                          fillOpacity={0.18}
                          stroke={c.chartInk}
                          strokeWidth={chart.strokeLight}
                        />
                      </G>
                    ))
                  : null}
                {pyramid
                  ? label({ x: slant, y: slant * 0.35, w: L, h: slant * 0.6 }, n(triangle))
                  : null}
                {pyramid ? (
                  <G>
                    {/* The triangle's height on its face, and the base side. */}
                    <Line
                      x1={X(slant + L / 2)}
                      y1={Y(slant)}
                      x2={X(slant + L / 2)}
                      y2={Y(0)}
                      stroke={c.chartInk}
                      strokeDasharray={chart.dash}
                    />
                    <ChartText
                      x={X(slant + L / 2) + 4}
                      y={Y(slant * 0.2) + 4}
                      fontSize={chart.tiny}
                      fill={c.chartInk}
                    >
                      {`${n(slant)}${unit}`}
                    </ChartText>
                    <ChartText
                      x={X(slant) + 4}
                      y={Y(slant + L) - 6}
                      fontSize={chart.tiny}
                      fontWeight="700"
                      fill={c.chartInk}
                    >
                      {`side ${n(L)}${unit}`}
                    </ChartText>
                  </G>
                ) : (
                  <G>
                    {/* Edge lengths outside the net: length on the back, height beside it,
                        width beside the end. */}
                    <ChartText
                      x={X(H + L / 2)}
                      y={Y(0) - 6}
                      fontSize={chart.tiny}
                      fontWeight="700"
                      fill={c.chartInk}
                      textAnchor="middle"
                    >
                      {`length ${n(L)}${unit}`}
                    </ChartText>
                    <ChartText
                      x={X(H) - 4}
                      y={Y(H / 2) + 4}
                      fontSize={chart.tiny}
                      fontWeight="700"
                      fill={c.chartInk}
                      textAnchor="end"
                    >
                      {`height ${n(H)}${unit}`}
                    </ChartText>
                    <ChartText
                      x={X(0)}
                      y={Y(H + W) + 12}
                      fontSize={chart.tiny}
                      fontWeight="700"
                      fill={c.chartInk}
                    >
                      {`width ${n(W)}${unit}`}
                    </ChartText>
                  </G>
                )}
              </Svg>
            );
          }}
        </Canvas>
      </Pressable>
      <View style={styles.row}>
        <Pressable
          testID="net-fold"
          accessibilityRole="button"
          onPress={() => setFolded(!folded)}
          style={[styles.button, { borderColor: c.border, backgroundColor: c.card }]}
        >
          <Text style={[styles.buttonText, { color: c.text }]}>{folded ? 'Unfold' : 'Fold'}</Text>
        </Pressable>
      </View>
      <Caption>
        {known
          ? `${pyramid ? 'Base and four triangles' : 'Six faces'} add to ${n(total)}${spec.total && rep.unit(spec.total) ? ` ${rep.unit(spec.total)}` : ''}.`
          : 'Type the edge lengths.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[spec.length, spec.width, spec.height, spec.slant]
          .filter((id): id is string => !!id)
          .map((id, _, all) => ({ var: id, steps: [1], pin: all.filter((x) => x !== id) }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', marginTop: space.xs },
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

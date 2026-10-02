import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { G, Line, Polygon, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'net' }>;

/** A face as drawn (x, y, w, h) and its true edges (tw × th = area). */
type Face = {
  x: number;
  y: number;
  w: number;
  h: number;
  tw: number;
  th: number;
  name: string;
  area: number;
};

/**
 * A box, cube or square pyramid unfolded flat, each face labelled with its area; "Fold" draws
 * the solid instead. Every face of the solid is one piece of the net, so the surface area is
 * the areas added.
 */
export function Net({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [folded, setFolded] = useState(false);
  // True edges (for the numbers) and drawn edges: no edge is drawn shorter than a sixth of
  // the longest, so a 100 × 0.1 × 0.1 box still shows its faces (the net is then not to
  // scale, and the caption says so).
  const tL = Math.max(0.1, rep.shown(spec.length));
  const tW = spec.width ? Math.max(0.1, rep.shown(spec.width)) : tL;
  const tH = spec.height ? Math.max(0.1, rep.shown(spec.height)) : tL;
  const tS = spec.slant ? Math.max(0.1, rep.shown(spec.slant)) : tL;
  const big = Math.max(tL, tW, tH, spec.slant ? tS : 0);
  const dr = (x: number) => Math.max(x, big / 6);
  const [L, W, H, slant] = [dr(tL), dr(tW), dr(tH), dr(tS)];
  const notToScale = [tL, tW, tH, ...(spec.slant ? [tS] : [])].some((x) => dr(x) !== x);
  // Every edge typed: with one "?" the net is faded and its numbers read "?", not the example's.
  const known = [spec.length, spec.width, spec.height, spec.slant].every(
    (id) => !id || rep.known(id),
  );
  const n = (x: number) => formatNumber(Number(x.toFixed(3)));
  const lab = (x: number) => (known ? n(x) : '?');
  const pyramid = spec.solid === 'squarePyramid';
  // A triangular prism: `width` and `height` are the triangle's base and height, `slant` its
  // third side (right) or each equal side (isosceles), and `length` the prism's length.
  const prism3 = spec.solid === 'triangularPrism';
  const rightTri = spec.triangle !== 'isosceles';
  // The slanted side as drawn follows the drawn base and height, so the triangle closes.
  const sd = rightTri ? Math.hypot(W, H) : Math.hypot(W / 2, H);
  const lengthUnit = rep.unit(spec.length);
  const unit = lengthUnit ? ` ${lengthUnit}` : '';

  // Faces in net units: a box as a cross (back, top, front, bottom down the middle; the two
  // ends beside the top); a pyramid as its square base with a triangle on each side; a
  // triangular prism as its three rectangles side by side, a triangle above and below the base.
  const strip = rightTri
    ? [
        { w: H, tw: tH },
        { w: W, tw: tW },
        { w: sd, tw: tS },
      ]
    : [
        { w: sd, tw: tS },
        { w: W, tw: tW },
        { w: sd, tw: tS },
      ];
  const faces: Face[] = prism3
    ? strip.map((f, i) => ({
        x: strip.slice(0, i).reduce((t, g) => t + g.w, 0),
        y: H,
        w: f.w,
        h: L,
        tw: f.tw,
        th: tL,
        name: 'side',
        area: f.tw * tL,
      }))
    : pyramid
      ? [{ x: slant, y: slant, w: L, h: L, tw: tL, th: tL, name: 'base', area: tL * tL }]
      : [
          { x: H, y: 0, w: L, h: H, tw: tL, th: tH, name: 'back', area: tL * tH },
          { x: 0, y: H, w: H, h: W, tw: tH, th: tW, name: 'end', area: tW * tH },
          { x: H, y: H, w: L, h: W, tw: tL, th: tW, name: 'top', area: tL * tW },
          { x: H + L, y: H, w: H, h: W, tw: tH, th: tW, name: 'end', area: tW * tH },
          { x: H, y: H + W, w: L, h: H, tw: tL, th: tH, name: 'front', area: tL * tH },
          { x: H, y: 2 * H + W, w: L, h: W, tw: tL, th: tW, name: 'bottom', area: tL * tW },
        ];
  const netW = prism3 ? strip.reduce((t, g) => t + g.w, 0) : pyramid ? L + 2 * slant : 2 * H + L;
  const netH = prism3 ? L + 2 * H : pyramid ? L + 2 * slant : 2 * H + 2 * W;
  const triangle = prism3 ? 0.5 * tW * tH : 0.5 * tL * tS;
  const total = pyramid
    ? tL * tL + 4 * triangle
    : faces.reduce((s, f) => s + f.area, 0) + (prism3 ? 2 * triangle : 0);
  // The triangular prism's base triangle in net units: its base on the middle rectangle.
  const t0 = prism3 ? faces[1]!.x : 0;
  const apexX = rightTri ? t0 : t0 + W / 2;

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
              if (prism3) {
                // The triangle in front, the prism running back and up to the right.
                // The prism lies on its side: the triangle at the front end, the length
                // running back to the right and a little up.
                const kk = Math.min((w - 2 * pad) / (W + L * 0.8), (h - 2 * pad) / (H + L * 0.35));
                const [dx, dy] = [L * 0.8 * kk, L * 0.35 * kk];
                const ax = (w - (W * kk + dx)) / 2;
                const ay = (h + H * kk + dy) / 2;
                const A = { x: ax, y: ay };
                const B = { x: ax + W * kk, y: ay };
                const C = { x: ax + (rightTri ? 0 : (W * kk) / 2), y: ay - H * kk };
                const back = (p: { x: number; y: number }) => ({ x: p.x + dx, y: p.y - dy });
                const pts = (...ps: { x: number; y: number }[]) =>
                  ps.map((p) => `${p.x},${p.y}`).join(' ');
                const edge = (
                  p: { x: number; y: number },
                  q: { x: number; y: number },
                  hidden = false,
                ) => (
                  <Line
                    x1={p.x}
                    y1={p.y}
                    x2={q.x}
                    y2={q.y}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={hidden ? chart.dash : undefined}
                  />
                );
                return (
                  <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                    {/* The slanted faces seen from above, then the triangle in front. */}
                    <Polygon points={pts(C, B, back(B), back(C))} fill={c.chartFill} />
                    {rightTri ? null : (
                      <Polygon points={pts(A, C, back(C), back(A))} fill={c.chartSurface} />
                    )}
                    <Polygon
                      points={pts(A, B, C)}
                      fill={c.chartHighlight}
                      fillOpacity={0.2}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    {edge(back(A), back(B), true)}
                    {edge(A, back(A), rightTri)}
                    {edge(back(A), back(C), rightTri)}
                    {edge(B, back(B))}
                    {edge(C, back(C))}
                    {edge(back(B), back(C))}
                  </Svg>
                );
              }
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
                          !known
                            ? '?'
                            : f.w * s > 22 + 7 * `${n(f.tw)} × ${n(f.th)} = ${n(f.area)}`.length
                              ? `${n(f.tw)} × ${n(f.th)} = ${n(f.area)}`
                              : n(f.area),
                        )
                      : null}
                  </G>
                ))}
                {prism3 ? (
                  <G>
                    {/* The two bases: a triangle above the middle rectangle and one below. */}
                    {[
                      [H, 0],
                      [H + L, 2 * H + L],
                    ].map(([base, apex], i) => (
                      <Polygon
                        key={`b${i}`}
                        points={`${X(t0)},${Y(base!)} ${X(t0 + W)},${Y(base!)} ${X(apexX)},${Y(apex!)}`}
                        fill={c.chartSecond}
                        fillOpacity={0.35}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                      />
                    ))}
                    {rightTri ? null : (
                      // The triangle's height, dashed from the apex to the base.
                      <Line
                        x1={X(apexX)}
                        y1={Y(0)}
                        x2={X(apexX)}
                        y2={Y(H)}
                        stroke={c.chartInk}
                        strokeDasharray={chart.dash}
                      />
                    )}
                    {/* Each triangle's area at its centroid. */}
                    {[H - H / 3, H + L + H / 3].map((cy, i) => (
                      <ChartText
                        key={`a${i}`}
                        x={X((2 * t0 + W + apexX) / 3)}
                        y={Y(cy) + 4}
                        fontSize={chart.small}
                        fill={c.chartInk}
                        textAnchor="middle"
                      >
                        {lab(triangle)}
                      </ChartText>
                    ))}
                    {/* The triangle's height beside it (its upright side, when right-angled). */}
                    <ChartText
                      x={X(apexX) - 4}
                      y={Y(H / 2) + 4}
                      fontSize={chart.tiny}
                      fontWeight="700"
                      fill={c.chartInk}
                      textAnchor="end"
                    >
                      {`height ${lab(tH)}${unit}`}
                    </ChartText>
                    {/* The base and slanted sides along the top of their rectangles. */}
                    {faces.map((f, i) =>
                      i === 1 ? null : (
                        <ChartText
                          key={`e${i}`}
                          {...fitLabel(X(f.x + f.w / 2), `${lab(f.tw)}${unit}`, chart.tiny, w)}
                          y={Y(H) - 5}
                          fontSize={chart.tiny}
                          fontWeight="700"
                          fill={c.chartInk}
                        >
                          {rightTri && i === 0 ? '' : `${lab(f.tw)}${unit}`}
                        </ChartText>
                      ),
                    )}
                    <ChartText
                      x={X(t0 + W / 2)}
                      y={Y(H) + 12}
                      fontSize={chart.tiny}
                      fontWeight="700"
                      fill={c.chartInk}
                      textAnchor="middle"
                    >
                      {`${lab(tW)}${unit}`}
                    </ChartText>
                    <ChartText
                      x={X(0) - 6}
                      y={Y(H + L / 2)}
                      fontSize={chart.tiny}
                      fontWeight="700"
                      fill={c.chartInk}
                      textAnchor="middle"
                      transform={`rotate(-90 ${X(0) - 6} ${Y(H + L / 2)})`}
                    >
                      {`length ${lab(tL)}${unit}`}
                    </ChartText>
                  </G>
                ) : null}
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
                  ? label({ x: slant, y: slant * 0.35, w: L, h: slant * 0.6 }, lab(triangle))
                  : null}
                {prism3 ? null : pyramid ? (
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
                      {`${lab(tS)}${unit}`}
                    </ChartText>
                    <ChartText
                      x={X(slant) + 4}
                      y={Y(slant + L) - 6}
                      fontSize={chart.tiny}
                      fontWeight="700"
                      fill={c.chartInk}
                    >
                      {`side ${lab(tL)}${unit}`}
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
                      {`length ${lab(tL)}${unit}`}
                    </ChartText>
                    <ChartText
                      x={X(H) - 4}
                      y={Y(H / 2) + 4}
                      fontSize={chart.tiny}
                      fontWeight="700"
                      fill={c.chartInk}
                      textAnchor="end"
                    >
                      {`height ${lab(tH)}${unit}`}
                    </ChartText>
                    <ChartText
                      x={X(0)}
                      y={Y(H + W) + 12}
                      fontSize={chart.tiny}
                      fontWeight="700"
                      fill={c.chartInk}
                    >
                      {`width ${lab(tW)}${unit}`}
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
          ? `${prism3 ? `2 × ${n(triangle)} + ${faces.map((f) => `${n(f.tw)} × ${n(tL)}`).join(' + ')} = ${n(total)} · ` : ''}${pyramid ? 'Base and four triangles' : prism3 ? 'Two triangles and three rectangles' : 'Six faces'} add to ${n(total)}${spec.total && rep.unit(spec.total) ? ` ${rep.unit(spec.total)}` : ''}.${notToScale ? ' Not to scale.' : ''}`
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

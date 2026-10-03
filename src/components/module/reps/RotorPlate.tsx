import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path } from 'react-native-svg';

import type { RotorSpec } from '@/data/modules/typesHs3a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption } from './common';
import { plateOf } from './he4bMath';
import { around, labelPlacer, useValues } from './he4bKit';
import { short } from './hsdKit';
import { SubLabel } from './hskKit';
import { TopLight, url, usePaintIds } from './paint';
import { type V3, viewOf } from './vectorSpace';

/** A moment to 3 significant figures. */
const sig = (x: number) => String(Number(x.toPrecision(3)));

/**
 * HC107 `plate`: a thin a × b plate to scale, seen from above and to one side, with its three
 * principal axes through the center: axis 1 along a (I₁ = Mb²/12), axis 2 along b
 * (I₂ = Ma²/12), axis 3 square to the plate (I₃ = I₁ + I₂). Spin about the largest or smallest
 * is steady; the middle one is dashed and marked "tumbles".
 */
export function RotorPlate({ spec, calc }: { spec: RotorSpec; calc: Calculator }) {
  const c = usePalette();
  const { v, all } = useValues(calc);
  const ids = usePaintIds('plate');
  const q = spec.plate!;
  const M = v(spec.mass, 1);
  const [a, b] = [Math.max(1e-6, v(q.a, 0.4)), Math.max(1e-6, v(q.b, 0.3))];
  const ready = all(spec.mass, q.a, q.b);
  const s = plateOf(M, a, b);
  const square = Math.abs(a - b) <= 1e-9 * Math.max(a, b);
  // The middle moment is I₁ or I₂ (I₃ is always the largest).
  const middle = square ? 0 : s.i1 > s.i2 ? 1 : 2;
  const unit = 'kg·m²';

  const lines: string[] = [];
  if (!ready) lines.push('I₁ = Mb²/12, I₂ = Ma²/12, I₃ = I₁ + I₂: ? until M, a and b are known.');
  else {
    lines.push(
      `I₁ = ${short(M)} × ${short(b)}² ÷ 12 = ${sig(s.i1)} ${unit} (axis along a).`,
      `I₂ = ${short(M)} × ${short(a)}² ÷ 12 = ${sig(s.i2)} ${unit} (axis along b).`,
      `I₃ = I₁ + I₂ = ${sig(s.i3)} ${unit}, square to the plate: the largest.`,
      square
        ? 'a = b: I₁ = I₂, so no axis is in the middle and none tumbles.'
        : `Spin about axis 3 or axis ${middle === 1 ? 2 : 1} is steady; about axis ${middle}, the middle moment, the plate tumbles.`,
    );
  }

  return (
    <View>
      <Canvas aspect={0.86}>
        {({ w, h }) => {
          const view = viewOf(38, 30);
          const big = Math.max(a, b);
          const ext = big * 0.5;
          const ends: V3[] = [
            [a / 2 + ext, 0, 0],
            [-(a / 2 + ext * 0.6), 0, 0],
            [0, b / 2 + ext, 0],
            [0, -(b / 2 + ext * 0.6), 0],
            [0, 0, ext * 1.4],
            [0, 0, -ext * 0.9],
          ];
          const ps = ends.map(view);
          const [x0, x1] = [Math.min(...ps.map((p) => p.x)), Math.max(...ps.map((p) => p.x))];
          const [y0, y1] = [Math.min(...ps.map((p) => p.y)), Math.max(...ps.map((p) => p.y))];
          const k = Math.min((w - 150) / (x1 - x0), (h - 60) / (y1 - y0));
          const ox = (w - k * (x1 - x0)) / 2 - k * x0;
          const oy = (h + k * (y1 - y0)) / 2 + k * y0;
          const S = (p: V3) => {
            const t = view(p);
            return { x: ox + k * t.x, y: oy - k * t.y };
          };
          const corner = (sx: number, sy: number, z = 0) => S([(sx * a) / 2, (sy * b) / 2, z]);
          const top = [corner(1, 1), corner(1, -1), corner(-1, -1), corner(-1, 1)];
          const drop = Math.max(3, k * big * 0.02);
          const face = (pts: { x: number; y: number }[]) =>
            `M ${pts.map((p) => `${p.x} ${p.y}`).join(' L ')} Z`;
          const o = S([0, 0, 0]);
          const axes = [
            { n: 1, from: ends[1]!, to: ends[0]!, I: s.i1 },
            { n: 2, from: ends[3]!, to: ends[2]!, I: s.i2 },
            { n: 3, from: ends[5]!, to: ends[4]!, I: s.i3 },
          ];
          const L = labelPlacer(w, h, [o]);
          const sideA = { p: S([0, -b / 2, 0]), t: `a = ${short(a)} m` };
          const sideB = { p: S([a / 2, 0, 0]), t: `b = ${short(b)} m` };
          const spotA = L.put(sideA.t, [
            { x: sideA.p.x - 6, y: sideA.p.y + 18, anchor: 'end' },
            { x: sideA.p.x - 6, y: sideA.p.y - 8, anchor: 'end' },
          ]);
          const spotB = L.put(sideB.t, [
            { x: sideB.p.x + 8, y: sideB.p.y + 20, anchor: 'start' },
            { x: sideB.p.x - 8, y: sideB.p.y + 22, anchor: 'end' },
            { x: sideB.p.x + 8, y: sideB.p.y - 10, anchor: 'start' },
          ]);
          const labels = axes.map((ax) => {
            const e = S(ax.to);
            const tumbles = ax.n === middle;
            const t1 = `I${'₁₂₃'[ax.n - 1]} = ${sig(ax.I)} ${unit}`;
            const t2 = tumbles ? 'tumbles' : 'steady';
            const spot = L.putPair(t1, `axis ${ax.n}: ${t2}`, around(e.x, e.y, 10));
            const color = tumbles ? c.forceApplied : c.chartHighlight;
            return (
              <G key={`l${ax.n}`}>
                <SubLabel
                  x={spot.x}
                  y={spot.y}
                  text={t1}
                  anchor={spot.anchor}
                  color={color}
                  w={w}
                />
                <SubLabel
                  x={spot.x}
                  y={spot.y + 15}
                  text={`axis ${ax.n}: ${t2}`}
                  anchor={spot.anchor}
                  color={color}
                  bold={false}
                  w={w}
                />
              </G>
            );
          });
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.plate} />
              </Defs>
              {/* The axes' far halves, under the plate. */}
              {axes.map((ax) => {
                const [p, q2] = [S(ax.from), o];
                return (
                  <Line
                    key={`b${ax.n}`}
                    x1={p.x}
                    y1={p.y}
                    x2={q2.x}
                    y2={q2.y}
                    stroke={ax.n === middle ? c.forceApplied : c.chartHighlight}
                    strokeWidth={2}
                    strokeDasharray={chart.dashFine}
                  />
                );
              })}
              {/* The plate, in aluminum, with its edge. */}
              <Path d={face(top.map((p) => ({ x: p.x, y: p.y + drop })))} fill={c.metalDark} />
              <Path d={face(top)} fill={c.metal} stroke={c.metalDark} strokeWidth={1} />
              <Path d={face(top)} fill={url(ids.plate)} />
              {/* The near halves, each with a turn round its end. */}
              {axes.map((ax) => {
                const e = S(ax.to);
                const tumbles = ax.n === middle;
                const color = tumbles ? c.forceApplied : c.chartHighlight;
                return (
                  <G key={`a${ax.n}`}>
                    <Line
                      x1={o.x}
                      y1={o.y}
                      x2={e.x}
                      y2={e.y}
                      stroke={color}
                      strokeWidth={tumbles ? 2.5 : 3}
                      strokeDasharray={tumbles ? chart.dash : undefined}
                    />
                    <Ellipse
                      cx={(o.x + e.x * 3) / 4}
                      cy={(o.y + e.y * 3) / 4}
                      rx={ax.n === 3 ? 12 : 6}
                      ry={ax.n === 3 ? 4 : 9}
                      stroke={color}
                      strokeWidth={1.5}
                      fill="none"
                    />
                  </G>
                );
              })}
              {ready ? (
                <G>
                  {labels}
                  <SubLabel x={spotA.x} y={spotA.y} text={sideA.t} anchor={spotA.anchor} w={w} />
                  <SubLabel x={spotB.x} y={spotB.y} text={sideB.t} anchor={spotB.anchor} w={w} />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

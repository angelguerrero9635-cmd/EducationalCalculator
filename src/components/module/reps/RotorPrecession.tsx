import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { RotorSpec } from '@/data/modules/typesHs3a';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption } from './common';
import { arrowHead } from './graphKit';
import { precessionOf } from './he4bMath';
import { along, labelPlacer, useValues } from './he4bKit';
import { short } from './hsdKit';
import { SubLabel, Vec } from './hskKit';
import { Metal, Sheen, url, usePaintIds } from './paint';

const H = 250;

/** A value to 3 significant figures, × 10ⁿ when tiny. */
const sig = (x: number) => {
  if (x === 0 || !Number.isFinite(x)) return short(x);
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e < -3) {
    const sup = String(e)
      .replace('-', '⁻')
      .replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!);
    return `${Number((x / 10 ** e).toPrecision(3))} × 10${sup}`;
  }
  return String(Number(x.toPrecision(3)));
};

/**
 * HC106 `precession`: a gyroscope on a pivot. The rotor spins at ω on a level axle r from the
 * pivot; L along the axle, mg down at the rotor, τ = mgr into the page, and the precession
 * circle round the post with Ω = τ ÷ L.
 */
export function RotorPrecession({ spec, calc }: { spec: RotorSpec; calc: Calculator }) {
  const c = usePalette();
  const { v, all } = useValues(calc);
  const ids = usePaintIds('disk', 'post', 'axle');
  const p = spec.precession!;
  const [m, R] = [v(spec.mass, 1), v(spec.radius, 0.05)];
  const [r, w, g] = [v(p.r, 0.05), v(p.omega, 100), v(p.g, 9.8)];
  const cf = spec.shape !== undefined ? v(spec.shape) : 0.5;
  const s = precessionOf(m, R, w, r, g, cf * m * R * R);
  const ready = all(spec.mass, spec.radius, p.r, p.omega, p.g, spec.shape);
  const slowSpin = ready && s.rate > 0.1 * Math.abs(w);

  const lines: string[] = [];
  if (!ready) lines.push('Ω = mgr ÷ (Iω): ? until m, R, ω and r are known.');
  else {
    lines.push(
      `I = ${cf === 0.5 ? '½' : short(cf)}mR² = ${sig(s.I)} kg·m², so L = Iω = ${sig(s.L)} kg·m²/s along the axle.`,
      `τ = mgr = ${short(m)} × ${short(g)} × ${short(r)} = ${sig(s.tau)} N·m, sideways: it turns L, not down.`,
      `Ω = τ ÷ L = ${sig(s.rate)} rad/s, one turn round the post every ${sig(s.period)} s.`,
    );
    if (slowSpin)
      lines.push(
        `Ω is ${short(s.rate / w)} of ω: the spin is not fast, so Ω = τ ÷ L is only rough here.`,
      );
  }

  return (
    <View>
      <Canvas aspect={(ww) => H / ww}>
        {({ w: W, h }) => {
          const k = Math.min((W * 0.4) / Math.max(1e-9, r), 52 / Math.max(1e-9, R));
          const px = W * 0.3;
          const py = 104;
          const base = 224;
          const dc = { x: px + r * k, y: py };
          const Rp = R * k;
          const lLen = Math.min(70, W - 16 - dc.x - Rp * 0.3);
          const tip = { x: dc.x + Rp * 0.3 + lLen, y: py };
          const into = { x: px + 30, y: py - 34 };
          const L = labelPlacer(W, h, [
            ...along({ x: px, y: py }, into),
            ...along({ x: dc.x + Rp * 0.3, y: py }, tip),
            ...along(dc, { x: dc.x, y: py + Math.min(70, base - py - 10) }),
            ...along(
              { x: dc.x - Rp * 0.3 - 16, y: py - 13 },
              { x: dc.x - Rp * 0.3 - 10, y: py + 13 },
            ),
          ]);
          const orbit = { rx: r * k, ry: Math.max(8, r * k * 0.26) };
          const say = (
            text: string,
            spots: { x: number; y: number; anchor?: 'start' | 'middle' | 'end' }[],
            color?: string,
          ) => {
            const at = L.put(text, spots);
            return (
              <SubLabel x={at.x} y={at.y} text={text} color={color} anchor={at.anchor} w={W} />
            );
          };
          return (
            <Svg width={W} height={h}>
              <Defs>
                <Metal id={ids.disk} light={c.metal} dark={c.metalDark} />
                <Sheen id={ids.post} />
                <Sheen id={ids.axle} vertical />
              </Defs>
              {/* The precession circle round the post, behind everything. */}
              <Ellipse
                cx={px}
                cy={py}
                rx={orbit.rx}
                ry={orbit.ry}
                stroke={c.forceNet}
                strokeWidth={1.5}
                strokeDasharray={chart.dash}
                fill="none"
              />
              <Path d={arrowHead(px - orbit.rx, py + 8, 0, 1, 10)} fill={c.forceNet} />
              {/* The stand: a base and a post up to the pivot. */}
              <Ellipse cx={px} cy={base} rx={38} ry={8} fill={c.metalDark} />
              <Rect x={px - 5} y={py} width={10} height={base - py} fill={c.metal} />
              <Rect x={px - 5} y={py} width={10} height={base - py} fill={url(ids.post)} />
              {/* The axle and the rotor on it, edge-on. */}
              <Rect x={px} y={py - 3} width={dc.x - px + Rp * 0.45} height={6} fill={c.metalDark} />
              <Rect
                x={px}
                y={py - 3}
                width={dc.x - px + Rp * 0.45}
                height={6}
                fill={url(ids.axle)}
              />
              <Ellipse
                cx={dc.x}
                cy={dc.y}
                rx={Math.max(5, Rp * 0.3)}
                ry={Rp}
                fill={url(ids.disk)}
                stroke={c.metalDark}
                strokeWidth={1.5}
              />
              <Circle cx={px} cy={py} r={6} fill={c.chartInk} />
              {ready ? (
                <G>
                  {/* Spin round the axle, just inside the rotor. */}
                  <Path
                    d={`M ${dc.x - Rp * 0.3 - 14} ${py - 13} A 6 13 0 1 0 ${dc.x - Rp * 0.3 - 12} ${py + 13}`}
                    stroke={c.chartHighlight}
                    strokeWidth={2}
                    fill="none"
                  />
                  <Path
                    d={arrowHead(dc.x - Rp * 0.3 - 10, py + 13, 1, 0, 8)}
                    fill={c.chartHighlight}
                  />
                  <Vec
                    x1={dc.x + Rp * 0.3}
                    y1={py}
                    x2={tip.x}
                    y2={tip.y}
                    color={c.chartHighlight}
                    width={3.5}
                  />
                  <Vec
                    x1={dc.x}
                    y1={py}
                    x2={dc.x}
                    y2={py + Math.min(70, base - py - 10)}
                    color={c.forceWeight}
                  />
                  <Vec x1={px} y1={py} x2={into.x} y2={into.y} color={c.forceApplied} width={2.5} />
                  {say(
                    `L = ${sig(s.L)} kg·m²/s`,
                    [
                      { x: W - 6, y: py - 18, anchor: 'end' },
                      { x: tip.x, y: py + 22, anchor: 'end' },
                    ],
                    c.chartHighlight,
                  )}
                  {say(
                    `ω = ${short(w)} rad/s`,
                    [
                      { x: dc.x - Rp * 0.3 - 16, y: py - 18, anchor: 'end' },
                      { x: dc.x, y: py - Rp - 14 },
                      { x: dc.x + 10, y: py - Rp - 4, anchor: 'start' },
                    ],
                    c.chartHighlight,
                  )}
                  {say(
                    `τ = ${sig(s.tau)} N·m, into the page`,
                    [
                      { x: into.x - 4, y: into.y - 6, anchor: 'start' },
                      { x: into.x, y: into.y - 6, anchor: 'end' },
                      { x: W - 6, y: 20, anchor: 'end' },
                    ],
                    c.forceApplied,
                  )}
                  {say(
                    `mg = ${sig(m * g)} N`,
                    [
                      { x: dc.x + 8, y: py + Math.min(70, base - py - 10), anchor: 'start' },
                      { x: dc.x - 8, y: py + Math.min(70, base - py - 10), anchor: 'end' },
                    ],
                    c.forceWeight,
                  )}
                  {say(`r = ${short(r)} m`, [
                    { x: (px + dc.x) / 2 - 4, y: py + 24 },
                    { x: px + 10, y: py + 44, anchor: 'start' },
                    { x: (px + dc.x) / 2, y: py - 10 },
                  ])}
                  {say(
                    `Ω = ${sig(s.rate)} rad/s`,
                    [
                      { x: px - orbit.rx, y: py + orbit.ry + 24, anchor: 'start' },
                      { x: 8, y: base - 20, anchor: 'start' },
                      { x: 8, y: py + orbit.ry + 24, anchor: 'start' },
                    ],
                    c.forceNet,
                  )}
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

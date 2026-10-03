/**
 * HC130 `rayDiagram` Snell with `speeds` (typesHe4g.ts): a seismic ray crossing from a layer of
 * speed v₁ into one of speed v₂, bent by sin r = (v₂ ÷ v₁) sin i. Wavefront ticks across each ray
 * are spaced as its speed (one frequency, so λ ∝ v). Into a faster layer the critical angle
 * i_c = sin⁻¹(v₁ ÷ v₂) is marked; past it the ray is all reflected. Drag the incoming ray.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { RaySpeedsSpec } from '@/data/modules/typesHe4g';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle } from './common';
import { Arrow } from './he1fKit';
import { fmt, Tag } from './he2fKit';
import { useHe4g } from './he4gKit';
import { snellSpeeds } from './he4gMath';

const BW = 360;
const BH = 300;
const O = { x: 180, y: 150 };
const RAY = 128;
const RAD = Math.PI / 180;

/** Ticks across a ray from a to b every `gap` px (the wavefronts). */
function ticks(a: { x: number; y: number }, b: { x: number; y: number }, gap: number) {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  if (len < 1) return '';
  const [ux, uy] = [(b.x - a.x) / len, (b.y - a.y) / len];
  let d = '';
  for (let s = gap; s < len - 6; s += gap) {
    const [x, y] = [a.x + ux * s, a.y + uy * s];
    d += `M ${(x - uy * 6).toFixed(1)} ${(y + ux * 6).toFixed(1)} L ${(x + uy * 6).toFixed(1)} ${(y - ux * 6).toFixed(1)} `;
  }
  return d;
}

export function RaySpeeds({ spec, calc }: { spec: RaySpeedsSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, num, label, setOne, say } = useHe4g(calc);
  const drag = useRef({ x: 0, y: 0 });
  const v1 = num(spec.speeds.v1);
  const v2 = num(spec.speeds.v2);
  const i0 = num(spec.angle);
  const ok = v1 !== undefined && v2 !== undefined && v1 > 0 && v2 > 0;
  const i = Math.max(0, Math.min(89.5, i0 ?? 0));
  const sn = ok ? snellSpeeds(v1, v2, i) : undefined;
  const has = ok && i0 !== undefined;
  const [top, bottom] = spec.media ?? ['upper layer', 'lower layer'];
  const vMax = ok ? Math.max(v1, v2) : 1;
  const gap = (v: number) => Math.max(7, (26 * v) / vMax);
  const S = { x: O.x - RAY * Math.sin(i * RAD), y: O.y - RAY * Math.cos(i * RAD) };
  const refl = { x: O.x + RAY * Math.sin(i * RAD), y: O.y - RAY * Math.cos(i * RAD) };
  const r = sn?.refracted;
  const T =
    r !== undefined ? { x: O.x + RAY * Math.sin(r * RAD), y: O.y + RAY * Math.cos(r * RAD) } : O;
  const total = !!sn?.total && has;
  const ic = sn?.critical;
  const angleVar = typeof spec.angle === 'string' ? spec.angle : undefined;
  const canDrag = !spec.fixed && has && angleVar !== undefined && rep.typed(angleVar);
  const v1Text = label(spec.speeds.v1, 'v₁', v1, 'm/s');
  const v2Text = label(spec.speeds.v2, 'v₂', v2, 'm/s');
  const iText = label(spec.angle, 'i', i0, '°');
  const rText = r !== undefined ? label(spec.refracted, 'r', r, '°') : undefined;
  const icText = ic !== undefined ? label(spec.critical, 'i_c', ic, '°') : undefined;

  const lines: string[] = [];
  if (!ok) lines.push('Type both speeds to draw the layers.');
  else {
    if (has && r !== undefined)
      lines.push(
        `sin r = (v₂ ÷ v₁) sin i = (${say(spec.speeds.v2, v2)} ÷ ${say(spec.speeds.v1, v1)}) × sin ${say(spec.angle, i)}° = ${fmt(Math.sin(r * RAD))}, r = ${say(spec.refracted, r)}°: ${v2 > v1 ? 'bent away from the normal, into the faster layer' : v2 < v1 ? 'bent toward the normal, into the slower layer' : 'not bent'}.`,
      );
    if (ic !== undefined)
      lines.push(
        `Critical angle: its sine is v₁ ÷ v₂ = ${fmt(v1 / v2)}, so it is ${say(spec.critical, ic)}°.`,
      );
    else lines.push('Into a slower layer every ray gets through: there is no critical angle.');
    if (total)
      lines.push(
        'Past the critical angle, sin r would be above 1: no ray enters the lower layer; it is all reflected.',
      );
  }

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => {
          const k = w / BW;
          return (
            <>
              <Svg width={w} height={h}>
                <G transform={`scale(${k})`}>
                  <Rect x={0} y={0} width={BW} height={O.y} fill={c.he4gSlow} />
                  <Rect x={0} y={O.y} width={BW} height={BH - O.y} fill={c.he4gFast} />
                  <Line x1={0} y1={O.y} x2={BW} y2={O.y} stroke={c.chartInk} strokeWidth={1.5} />
                  <Line
                    x1={O.x}
                    y1={10}
                    x2={O.x}
                    y2={BH - 10}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dash}
                  />
                  <Tag x={8} y={20} text={top} anchor="start" chip={false} w={BW} />
                  {v1Text ? <Tag x={8} y={38} text={v1Text} anchor="start" w={BW} /> : null}
                  <Tag x={8} y={BH - 28} text={bottom} anchor="start" chip={false} w={BW} />
                  {v2Text ? <Tag x={8} y={BH - 10} text={v2Text} anchor="start" w={BW} /> : null}
                  <Tag
                    x={O.x + 6}
                    y={20}
                    text="normal"
                    anchor="start"
                    chip={false}
                    bold={false}
                    w={BW}
                  />
                  {ok && ic !== undefined ? (
                    <G>
                      <Line
                        x1={O.x}
                        y1={O.y}
                        x2={O.x - RAY * 0.7 * Math.sin(ic * RAD)}
                        y2={O.y - RAY * 0.7 * Math.cos(ic * RAD)}
                        stroke={c.normalReject}
                        strokeWidth={1.5}
                        strokeDasharray={chart.dashFine}
                      />
                      {icText ? (
                        <Tag
                          x={O.x - RAY * 0.7 * Math.sin(ic * RAD) - 16}
                          y={O.y - RAY * 0.7 * Math.cos(ic * RAD) - 6}
                          text={icText}
                          anchor="end"
                          color={c.normalReject}
                          w={BW}
                        />
                      ) : null}
                    </G>
                  ) : null}
                  {has ? (
                    <G>
                      {/* The incoming ray, its reflection and the refracted ray, wavefronts across. */}
                      <Line
                        x1={S.x}
                        y1={S.y}
                        x2={O.x}
                        y2={O.y}
                        stroke={c.physRay}
                        strokeWidth={3}
                      />
                      <Path d={ticks(S, O, gap(v1))} stroke={c.physRay} strokeWidth={1.5} />
                      <Arrow
                        x1={S.x}
                        y1={S.y}
                        x2={(S.x + O.x) / 2}
                        y2={(S.y + O.y) / 2}
                        color={c.physRay}
                        width={3}
                      />
                      <Arrow
                        x1={O.x}
                        y1={O.y}
                        x2={refl.x}
                        y2={refl.y}
                        color={c.physRay}
                        width={total ? 3 : 1.5}
                        dashed={!total}
                      />
                      {r !== undefined ? (
                        <G>
                          <Arrow x1={O.x} y1={O.y} x2={T.x} y2={T.y} color={c.physRay} width={3} />
                          <Path d={ticks(O, T, gap(v2!))} stroke={c.physRay} strokeWidth={1.5} />
                        </G>
                      ) : null}
                      {i > 0.5 ? (
                        <G>
                          <Path
                            d={`M ${O.x} ${O.y - 40} A 40 40 0 0 0 ${O.x - 40 * Math.sin(i * RAD)} ${O.y - 40 * Math.cos(i * RAD)}`}
                            stroke={c.chartInk}
                            fill="none"
                          />
                          {iText ? (
                            <Tag
                              x={(S.x + O.x) / 2 - 12}
                              y={(S.y + O.y) / 2 + 18}
                              text={iText}
                              anchor="end"
                              w={BW}
                            />
                          ) : null}
                        </G>
                      ) : null}
                      {r !== undefined && r > 0.5 ? (
                        <G>
                          <Path
                            d={`M ${O.x} ${O.y + 40} A 40 40 0 0 0 ${O.x + 40 * Math.sin(r * RAD)} ${O.y + 40 * Math.cos(r * RAD)}`}
                            stroke={c.chartInk}
                            fill="none"
                          />
                          {rText ? (
                            <Tag
                              x={O.x + 50 * Math.sin((r * RAD) / 2) + 6}
                              y={O.y + 52 * Math.cos((r * RAD) / 2) + 12}
                              text={rText}
                              anchor="start"
                              w={BW}
                            />
                          ) : null}
                        </G>
                      ) : null}
                      {total ? (
                        <Tag
                          x={O.x + 8}
                          y={O.y + 40}
                          text="all reflected"
                          anchor="start"
                          color={c.normalReject}
                          w={BW}
                        />
                      ) : null}
                    </G>
                  ) : null}
                </G>
              </Svg>
              {canDrag ? (
                <DragHandle
                  x={S.x * k}
                  y={S.y * k}
                  label={rep.variable(angleVar!).name}
                  onStart={() => {
                    drag.current = { x: S.x - O.x, y: S.y - O.y };
                  }}
                  onMove={(dx, dy) => {
                    const px = drag.current.x + dx / k;
                    const py = Math.min(-1, drag.current.y + dy / k);
                    const deg = Math.atan2(-px, -py) / RAD;
                    setOne(angleVar!, Math.max(0, Math.min(89, deg)), [
                      spec.speeds.v1,
                      spec.speeds.v2,
                    ]);
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

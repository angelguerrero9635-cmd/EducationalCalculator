/**
 * HC182 `complexPlane` `constellation` (ComplexPlaneHe4m in typesHe4m.ts): M-PSK or M-QAM
 * points on the I–Q plane, each with its Gray-coded bits, and the decision boundaries dashed
 * (rays halfway between PSK points, grid lines between QAM columns and rows). Flat, as a
 * diagram is; no handles (M is picked from its list).
 */
import type { ReactElement } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { ComplexPlaneSpec } from '@/data/modules/typesHsd';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText } from './common';
import { constellation, isQam } from './he4mMath';
import { n3, useFields } from './he4mKit';

export function ConstellationHe4m({ spec, calc }: { spec: ComplexPlaneSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, get, say } = useFields(calc);
  const k = spec.constellation!;
  const Mraw = get(k.M);
  const M = Mraw === undefined ? undefined : Math.round(Mraw);
  const ok = M !== undefined && M >= 2 && M <= 1024 && Number.isInteger(Math.log2(M));
  const qam = ok && isQam(M, k.kind);
  const pts = ok ? constellation(M, k.kind) : [];
  const bits = ok ? Math.round(Math.log2(M)) : 0;
  const labelled = ok && M <= 16;
  const Rs = get(k.symbolRate);
  const a = get(k.rolloff);
  const Rb = get(k.bitRate) ?? (Rs !== undefined && ok ? Rs * bits : undefined);
  const B = get(k.bandwidth) ?? (Rs !== undefined && a !== undefined ? Rs * (1 + a) : undefined);
  const unitOf = (v: number | string | undefined) =>
    typeof v === 'string' && rep.unit(v) ? ` ${rep.unit(v)}` : '';

  const name = ok ? `${M === 2 ? 'B' : M === 4 && !qam ? 'Q' : `${M}-`}${qam ? 'QAM' : 'PSK'}` : '';
  const lines: string[] = [];
  if (!ok) lines.push('Pick M to draw the constellation.');
  else {
    lines.push(
      `${name}: ${M} points, log₂${M} = ${bits} bit${bits > 1 ? 's' : ''} each, Gray-coded so the neighbours across a dashed boundary differ in one bit${labelled ? '' : ' (the labels are left off past 16 points)'}.`,
    );
    if (Rs !== undefined && Rb !== undefined)
      lines.push(
        `R_b = R_s × log₂M = ${say(k.symbolRate, Rs)} × ${bits} = ${say(k.bitRate, Rb)}${unitOf(k.bitRate)}.`,
      );
    if (Rs !== undefined && a !== undefined && B !== undefined) {
      lines.push(
        `B = R_s(1 + α) = ${say(k.symbolRate, Rs)} × (1 + ${say(k.rolloff, a)}) = ${say(k.bandwidth, B)}${unitOf(k.bandwidth)}.`,
      );
      if (Rb !== undefined)
        lines.push(
          `η = R_b ÷ B = ${say(k.efficiency, get(k.efficiency) ?? Rb / B)}${unitOf(k.efficiency)}.`,
        );
    }
  }

  return (
    <View>
      <Canvas aspect={(w) => Math.min(w, 320) / w}>
        {({ w, h }) => {
          const size = Math.min(h - 34, w - 76);
          const cx = w / 2;
          const cy = 26 + size / 2;
          const half = size / 2;
          // QAM: odd coordinates out to √M − 1, a cell's half-width past them; PSK: radius 1.
          const side = qam ? Math.round(Math.sqrt(M!)) : 0;
          const reach = qam ? side : 1.45;
          const s = half / reach;
          const X = (i: number) => cx + i * s;
          const Y = (q: number) => cy - q * s;
          const bounds: ReactElement[] = [];
          // A dense grid (64 and 256 points) keeps its boundaries thin.
          const thin = ok && M! >= 64 ? 0.8 : 1.4;
          if (ok && qam) {
            for (let t = -(side - 2); t <= side - 2; t += 2) {
              bounds.push(
                <Line
                  key={`v${t}`}
                  x1={X(t)}
                  x2={X(t)}
                  y1={Y(reach)}
                  y2={Y(-reach)}
                  stroke={c.he4mBoundary}
                  strokeWidth={thin}
                  strokeDasharray={chart.dash}
                />,
                <Line
                  key={`h${t}`}
                  x1={X(-reach)}
                  x2={X(reach)}
                  y1={Y(t)}
                  y2={Y(t)}
                  stroke={c.he4mBoundary}
                  strokeWidth={thin}
                  strokeDasharray={chart.dash}
                />,
              );
            }
          } else if (ok) {
            const off = M! >= 4 ? Math.PI / M! : 0;
            for (let j = 0; j < M!; j++) {
              const t = (2 * Math.PI * (j + 0.5)) / M! + off;
              bounds.push(
                <Line
                  key={`r${j}`}
                  x1={cx}
                  y1={cy}
                  x2={X(reach * Math.cos(t))}
                  y2={Y(reach * Math.sin(t))}
                  stroke={c.he4mBoundary}
                  strokeWidth={thin}
                  strokeDasharray={chart.dash}
                />,
              );
            }
          }
          const r = !ok ? 0 : M! <= 16 ? 5.5 : M! <= 64 ? 4 : 2.4;
          return (
            <Svg width={w} height={h}>
              {/* The I and Q axes. */}
              <Line
                x1={cx - half}
                x2={cx + half}
                y1={cy}
                y2={cy}
                stroke={c.chartMuted}
                strokeWidth={1}
              />
              <Line
                x1={cx}
                x2={cx}
                y1={cy - half}
                y2={cy + half}
                stroke={c.chartMuted}
                strokeWidth={1}
              />
              <Path
                d={`M ${cx + half - 7} ${cy - 4} L ${cx + half} ${cy} L ${cx + half - 7} ${cy + 4}`}
                fill="none"
                stroke={c.chartMuted}
                strokeWidth={1}
              />
              <ChartText x={cx + half + 6} y={cy + 4} fontStyle="italic">
                I
              </ChartText>
              <ChartText x={cx + 6} y={cy - half - 6} fontStyle="italic">
                jQ
              </ChartText>
              {!qam && ok ? (
                <Circle cx={cx} cy={cy} r={s} fill="none" stroke={c.chartGrid} strokeWidth={1} />
              ) : null}
              {bounds}
              {pts.map((p) => {
                // PSK labels sit outside the circle; QAM labels under each point.
                const out = !qam;
                const lx = out ? X(p.i * 1.28) : X(p.i);
                const ly = out ? Y(p.q * 1.28) + 4 : Y(p.q) + 17;
                return (
                  <G key={p.bits}>
                    <Circle cx={X(p.i)} cy={Y(p.q)} r={r} fill={c.he4mSymbol} />
                    {labelled ? (
                      <ChartText
                        x={lx}
                        y={ly}
                        textAnchor="middle"
                        fontWeight="700"
                        fill={c.chartInk}
                        halo
                      >
                        {p.bits}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {ok ? (
                <ChartText x={8} y={16} fontWeight="700">
                  {name}
                </ChartText>
              ) : null}
              {ok && !labelled ? (
                <ChartText x={w - 8} y={16} textAnchor="end" fill={c.chartMuted}>
                  {`${formatNumber(bits)} bits a point`}
                </ChartText>
              ) : null}
              {ok && M! >= 4 && !qam ? (
                <ChartText x={8} y={h - 6} fill={c.chartMuted}>
                  {`${n3(360 / M!)}° apart`}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

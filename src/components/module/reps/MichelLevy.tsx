/**
 * HC121 `michelLevy` (MichelLevySpec in typesHe4f.ts): the interference colour chart, computed
 * (michelLevyMath.ts): retardation 0–1,800 nm across in the first to third orders, thickness
 * 0–50 μm up, birefringence lines from the origin with their values, and the grain's point on
 * its own line, with Γ and the colour's order and name printed by it (never colour alone). A
 * retardation past 1,800 nm widens the chart (up to the tenth order). No handles.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

import type { MichelLevySpec } from '@/data/modules/typesHe4f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { interferenceColor, interferenceName, orderOf, retardationOf } from './michelLevyMath';

const BW = 360;
const L = 46;
const R = 46;
const TOP = 24;
const PH = 230;
const BASE = TOP + PH;
const STRIPS = 180;
const LINES = [0.005, 0.01, 0.02, 0.03, 0.05, 0.1, 0.2];
const ORD = ['1st', '2nd', '3rd'];

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));

export function MichelLevy({ spec, calc }: { spec: MichelLevySpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  type V = number | string | undefined;
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.val(v as string);
  const say = (v: V, x: number) =>
    typeof v === 'string' && known(v) ? rep.value(v, false) : n3(x);
  const t = get(spec.thickness);
  const d = get(spec.birefringence);
  const gamma = t !== undefined && d !== undefined ? retardationOf(t, d) : undefined;
  const gMax =
    gamma === undefined || gamma <= 1800
      ? 1800
      : Math.min(5500, 550 * Math.ceil((gamma + 60) / 550));
  const tMax = t === undefined || t <= 50 ? 50 : Math.min(100, 10 * Math.ceil(t / 10));
  const pw = BW - L - R;
  const X = (g: number) => L + (pw * Math.min(g, gMax)) / gMax;
  const Y = (th: number) => BASE - (PH * Math.min(th, tMax)) / tMax;
  const height = BASE + 46;
  // Lines near the grain's own are left out, so two never share a label.
  /** Where a birefringence line leaves the chart: the top (t = tMax) or the right (Γ = gMax). */
  const exit = (delta: number) => {
    const gTop = retardationOf(tMax, delta);
    return gTop <= gMax
      ? { x: X(gTop), y: TOP, top: true }
      : { x: L + pw, y: Y(gMax / (1000 * delta)), top: false };
  };
  const orders = Math.round(gMax / 550 + 0.4);
  // A line's label is kept only 30 px clear of the grain's and of the last one kept on its edge.
  const lines = LINES.map((delta) => ({ delta, ...exit(delta) }));
  const grainAt = d !== undefined && d > 0 ? exit(d) : undefined;
  const kept: { x: number; y: number; top: boolean }[] = grainAt ? [grainAt] : [];
  const labelled = new Set<number>();
  for (const l of lines)
    if (kept.every((k) => k.top !== l.top || Math.hypot(k.x - l.x, k.y - l.y) >= 30)) {
      labelled.add(l.delta);
      kept.push(l);
    }
  const tickStep = gMax <= 1800 ? 400 : 1000;

  const cap: string[] = [];
  if (gamma === undefined) cap.push('Type the thickness and the birefringence to place the grain.');
  else {
    cap.push(
      `Γ = 1,000tδ = 1,000 × ${say(spec.thickness, t!)} × ${say(spec.birefringence, d!)} = ${spec.retardation && known(spec.retardation) ? rep.value(spec.retardation as string) : `${n3(gamma)} nm`}.`,
      `Order = floor(Γ ÷ 550) + 1 = ${orderOf(gamma)}: ${interferenceName(gamma)}.`,
    );
    if (gamma > gMax) cap.push('Past the tenth order the colours wash out to a pale white.');
  }

  const grainExit = grainAt;
  const px = gamma !== undefined ? X(gamma) : 0;
  const py = t !== undefined ? Y(t) : 0;
  const right = px > L + pw * 0.62;
  return (
    <View>
      <Canvas aspect={height / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / BW})`}>
              {/* The colours, computed for each retardation. */}
              {Array.from({ length: STRIPS }, (_, i) => (
                <Rect
                  key={i}
                  x={L + (pw * i) / STRIPS}
                  y={TOP}
                  width={pw / STRIPS + 0.6}
                  height={PH}
                  fill={interferenceColor(((i + 0.5) * gMax) / STRIPS)}
                />
              ))}
              {/* The orders, every 550 nm. */}
              {Array.from({ length: orders }, (_, k) => (
                <G key={k}>
                  {k > 0 ? (
                    <Line
                      x1={X(550 * k)}
                      y1={TOP}
                      x2={X(550 * k)}
                      y2={BASE}
                      stroke={c.he4fMlInk}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                    />
                  ) : null}
                  {550 * k + 275 < gMax ? (
                    <ChartText
                      x={X(550 * k + 275)}
                      y={BASE - 8}
                      textAnchor="middle"
                      fontWeight="700"
                      fill={c.he4fMlInk}
                      halo={c.he4fMlHalo}
                    >
                      {orders <= 3 ? `${ORD[k]} order` : (ORD[k] ?? `${k + 1}th`)}
                    </ChartText>
                  ) : null}
                </G>
              ))}
              {/* The standard 30 μm section. */}
              <Line
                x1={L}
                y1={Y(30)}
                x2={L + pw}
                y2={Y(30)}
                stroke={c.he4fMlInk}
                strokeWidth={1}
                strokeDasharray={chart.dash}
              />
              {/* Birefringence lines, labelled where they leave the chart. */}
              {lines.map(({ delta, ...e }) => {
                return (
                  <G key={delta}>
                    <Line
                      x1={L}
                      y1={BASE}
                      x2={e.x}
                      y2={e.y}
                      stroke={c.he4fMlInk}
                      strokeOpacity={0.55}
                      strokeWidth={1}
                    />
                    {labelled.has(delta) ? (
                      <ChartText
                        x={e.top ? e.x : e.x + 4}
                        y={e.top ? e.y - 6 : e.y + 4}
                        textAnchor={e.top ? 'middle' : 'start'}
                        fill={c.chartMuted}
                      >
                        {formatNumber(delta)}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {/* The grain's line and point. */}
              {grainExit ? (
                <G>
                  <Line
                    x1={L}
                    y1={BASE}
                    x2={grainExit.x}
                    y2={grainExit.y}
                    stroke={c.he4fMlInk}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <ChartText
                    x={grainExit.top ? grainExit.x : grainExit.x + 4}
                    y={grainExit.top ? grainExit.y - 6 : grainExit.y + 4}
                    textAnchor={grainExit.top ? 'middle' : 'start'}
                    fontWeight="700"
                  >
                    {say(spec.birefringence, d!)}
                  </ChartText>
                </G>
              ) : null}
              {gamma !== undefined ? (
                <G>
                  <Circle
                    cx={px}
                    cy={py}
                    r={6}
                    fill={c.he4fMlHalo}
                    stroke={c.he4fMlInk}
                    strokeWidth={chart.stroke}
                  />
                  {[`Γ = ${n3(gamma)} nm`, interferenceName(gamma)].map((s, i) => (
                    <ChartText
                      key={s}
                      x={right ? px - 10 : px + 10}
                      y={py + (py < TOP + 40 ? 18 : -18) + 15 * i}
                      textAnchor={right ? 'end' : 'start'}
                      fontWeight="700"
                      fill={c.he4fMlInk}
                      halo={c.he4fMlHalo}
                    >
                      {s}
                    </ChartText>
                  ))}
                </G>
              ) : null}
              {/* Axes. */}
              <Rect
                x={L}
                y={TOP}
                width={pw}
                height={PH}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={1}
              />
              {Array.from({ length: Math.floor(gMax / tickStep) + 1 }, (_, i) => tickStep * i).map(
                (g) => (
                  <G key={g}>
                    <Line x1={X(g)} y1={BASE} x2={X(g)} y2={BASE + 4} stroke={c.chartInk} />
                    <ChartText x={X(g)} y={BASE + 17} textAnchor="middle" fill={c.chartMuted}>
                      {formatNumber(g)}
                    </ChartText>
                  </G>
                ),
              )}
              <ChartText x={L + pw / 2} y={BASE + 36} textAnchor="middle">
                Retardation Γ (nm)
              </ChartText>
              {Array.from({ length: tMax / 10 + 1 }, (_, i) => 10 * i).map((th) => (
                <G key={th}>
                  <Line x1={L - 4} y1={Y(th)} x2={L} y2={Y(th)} stroke={c.chartInk} />
                  <ChartText x={L - 7} y={Y(th) + 4} textAnchor="end" fill={c.chartMuted}>
                    {formatNumber(th)}
                  </ChartText>
                </G>
              ))}
              <ChartText
                x={14}
                y={TOP + PH / 2}
                textAnchor="middle"
                transform={`rotate(-90 14 ${TOP + PH / 2})`}
              >
                Thickness t (μm)
              </ChartText>
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{cap.join(' ')}</Caption>
    </View>
  );
}

/**
 * HC67 (college round 3, group C): `rectangle` `grow`, the product rule as an area. The u × v
 * rectangle (u across, v up) after a short time Δt: a strip u′Δt wide by v on the right and a
 * strip u by v′Δt on top (outside when the side grows, inside and hatched when it shrinks), the
 * corner u′v′Δt² apart as second order. Flat; no handles (the values have their boxes).
 */
import { View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { productRate, quotientRate } from './growCircleHe3cMath';
import { sig4 } from './ratesHe3cMath';

type Spec = Extract<Representation, { kind: 'rectangle' }>;

const br = (x: number) => (x < 0 ? `(${sig4(x)})` : sig4(x));

export function RectangleGrowHe3c({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const g = spec.grow!;
  const num = (x: number | string | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const [u, v, du, dv] = [num(spec.length), num(spec.width), num(g.du), num(g.dv)];
  const sym = (x: number | string, fallback: string) =>
    typeof x === 'string' ? rep.variable(x).symbol : fallback;
  const [su, sv, sdu, sdv] = [
    sym(spec.length, 'u'),
    sym(spec.width, 'v'),
    sym(g.du, 'u′'),
    sym(g.dv, 'v′'),
  ];
  const all = [u, v, du, dv].every((x) => x !== undefined);
  const drawable = all && u! > 0 && v! > 0;
  // Δt: the page's, or one that makes the wider strip a quarter of the shorter side.
  const fast = all ? Math.max(Math.abs(du!), Math.abs(dv!)) : 0;
  const dt =
    num(g.dt) ?? (drawable && fast > 0 ? (0.25 * Math.min(u!, v!)) / fast : drawable ? 0 : 0);

  const lines: string[] = [];
  if (!all) lines.push(`(${su}${sv})′ = ${sdu}${sv} + ${su}${sdv}: type the four values.`);
  else {
    const P = productRate(u!, v!, du!, dv!);
    if (drawable && dt > 0)
      lines.push(
        `In Δt = ${sig4(dt)} the area grows by ${sdu}Δt × ${sv} + ${su} × ${sdv}Δt = ${sig4(du! * dt * v!)} + ${sig4(u! * dv! * dt)}, plus the corner ${sdu}${sdv}Δt² = ${sig4(du! * dv! * dt * dt)}, too small to count as Δt → 0.`,
      );
    else if (!drawable) lines.push(`The rectangle is drawn for ${su}, ${sv} > 0.`);
    lines.push(
      `(${su}${sv})′ = ${sdu}${sv} + ${su}${sdv} = ${br(du!)} × ${br(v!)} + ${br(u!)} × ${br(dv!)} = ${sig4(du! * v!)} + ${sig4(u! * dv!)} = ${sig4(P)}`,
    );
    const Q = quotientRate(u!, v!, du!, dv!);
    if (g.quotient !== undefined)
      lines.push(
        Q === undefined
          ? `(${su}/${sv})′ needs ${sv} ≠ 0.`
          : `(${su}/${sv})′ = (${sdu}${sv} − ${su}${sdv}) ÷ ${sv}² = (${sig4(du! * v!)} − ${sig4(u! * dv!)}) ÷ ${sig4(v! * v!)} = ${sig4(Q)}`,
      );
  }

  return (
    <View>
      <Canvas aspect={0.82}>
        {({ w, h }) => {
          if (!drawable) return <Svg width={w} height={h} />;
          const [L, R, T, B] = [64, 22, 26, 44];
          const growX = Math.max(0, du! * dt);
          const growY = Math.max(0, dv! * dt);
          const s = Math.min((w - L - R) / (u! + growX), (h - T - B) / (v! + growY));
          const x0 = L;
          const y0 = h - B;
          const X = (x: number) => x0 + x * s;
          const Y = (y: number) => y0 - y * s;
          const strip = (
            key: string,
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            grows: boolean,
            color: string,
          ) => {
            const [l, r] = [Math.min(x1, x2), Math.max(x1, x2)];
            const [t, b] = [Math.min(y1, y2), Math.max(y1, y2)];
            const hatch = grows
              ? null
              : Array.from({ length: Math.ceil((r - l + b - t) / 7) }, (_, i) => {
                  const d = i * 7;
                  // A 45° hatch line cut to the strip.
                  const [ax, ay] = [l + Math.min(d, r - l), t + Math.max(0, d - (r - l))];
                  const [bx, by] = [l + Math.max(0, d - (b - t)), t + Math.min(d, b - t)];
                  return (
                    <Line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={color} strokeWidth={1} />
                  );
                });
            return (
              <G key={key}>
                <Rect
                  x={l}
                  y={t}
                  width={r - l}
                  height={b - t}
                  fill={color}
                  fillOpacity={grows ? 0.45 : 0.12}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray={grows ? undefined : chart.dashFine}
                />
                {hatch}
              </G>
            );
          };
          const ddx = du! * dt * s;
          const ddy = dv! * dt * s;
          return (
            <Svg width={w} height={h}>
              <Rect
                x={X(0)}
                y={Y(v!)}
                width={u! * s}
                height={v! * s}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <ChartText x={X(u! / 2)} y={Y(v! / 2) + 5} textAnchor="middle" fontWeight="700">
                {`${su}${sv} = ${sig4(u! * v!)}`}
              </ChartText>
              {Math.abs(ddx) > 0.5
                ? strip('u', X(u!), Y(0), X(u!) + ddx, Y(v!), du! > 0, c.chartHighlight)
                : null}
              {Math.abs(ddy) > 0.5
                ? strip('v', X(0), Y(v!), X(u!), Y(v!) - ddy, dv! > 0, c.chartSecond)
                : null}
              {du! > 0 && dv! > 0 && ddx > 0.5 && ddy > 0.5 ? (
                <Rect
                  x={X(u!)}
                  y={Y(v!) - ddy}
                  width={ddx}
                  height={ddy}
                  fill={c.chartMuted}
                  fillOpacity={0.35}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                />
              ) : null}
              {/* The sides below and to the left; the strips' widths beside them. */}
              <ChartText x={X(u! / 2)} y={y0 + 18} textAnchor="middle" fontWeight="600">
                {rep.label(spec.length)}
              </ChartText>
              <ChartText x={X(0) - 6} y={Y(v! / 2) + 4} textAnchor="end" fontWeight="600">
                {rep.label(spec.width)}
              </ChartText>
              {Math.abs(ddx) > 0.5 ? (
                <ChartText
                  x={X(u!) + ddx / 2}
                  y={y0 + 34}
                  textAnchor={ddx > 0 ? 'start' : 'end'}
                  fontSize={chart.small}
                  fill={c.chartHighlight}
                  fontWeight="700"
                >
                  {`${sdu}Δt`}
                </ChartText>
              ) : null}
              {Math.abs(ddy) > 0.5 ? (
                <ChartText
                  x={X(0) - 6}
                  y={Y(v!) - ddy / 2 + 4}
                  textAnchor="end"
                  fontSize={chart.small}
                  fill={c.chartInk}
                  fontWeight="700"
                >
                  {`${sdv}Δt`}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

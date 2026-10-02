import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import type { MixedCircuit } from '@/data/modules/typesHsk';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, niceCeil, useRep } from './common';
import { mixedOf } from './hskMath';
import { formulaOnly, sig, SubLabel } from './hskKit';
import { Battery, Meter } from './physicsArt';
import { Metal, Sheen, TopLight, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'circuit'; wiring: unknown }>;

/**
 * A mixed series-parallel circuit (H68): a battery, an ammeter and three resistors in copper
 * wire, R₁ in series with R₂ ∥ R₃ or (R₁ + R₂) ∥ R₃, each resistor labelled with its reading:
 * the voltage across it, the current through it and its power.
 */
export function CircuitMixed({ spec, m, calc }: { spec: Spec; m: MixedCircuit; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('cell', 'metal', 'light');
  const si = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
  const Rs = m.resistors.map((x) => Math.max(1e-9, si(x, 1))) as [number, number, number];
  const V = Math.max(0, rep.val(spec.voltage));
  const ci = mixedOf(m.layout, Rs, V);
  const all = [...m.resistors, spec.voltage].every(known);
  const sp = m.layout === 'seriesParallel';
  const par23 = (Rs[1] * Rs[2]) / (Rs[1] + Rs[2]);
  // A "?" box reads "?" on the picture too, not the example's number drawn faded behind it.
  const rOk = m.resistors.every(known);
  const say = (ok: boolean, x: number) => (ok ? sig(x) : '?');
  const worked = [
    sp
      ? `R_eq = R₁ + R₂R₃/(R₂ + R₃) = ${sig(Rs[0])} + ${sig(Rs[1])} × ${sig(Rs[2])}/${sig(Rs[1] + Rs[2])} = ${sig(Rs[0])} + ${sig(par23)} = ${sig(ci.Req)} Ω`
      : `R_eq = (R₁ + R₂)R₃/(R₁ + R₂ + R₃) = ${sig(Rs[0] + Rs[1])} × ${sig(Rs[2])}/${sig(Rs[0] + Rs[1] + Rs[2])} = ${sig(ci.Req)} Ω`,
    `I = V/R_eq = ${sig(V)}/${sig(ci.Req)} = ${sig(ci.I)} A`,
    `P = VI = ${sig(V)} × ${sig(ci.I)} = ${sig(V * ci.I)} W, the three resistors’ powers added.`,
  ];
  const lines = [
    ...(rOk ? worked.slice(0, 1) : formulaOnly(worked.slice(0, 1))),
    ...(all ? worked.slice(1) : formulaOnly(worked.slice(1))),
  ];

  return (
    <View>
      <Canvas aspect={0.82}>
        {({ w, h }) => {
          const L = 34;
          const Rt = w - 24;
          const T = 34;
          const B = h - 24;
          const wire = (x1: number, y1: number, x2: number, y2: number, k: string) => (
            <Line
              key={k}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={c.copper}
              strokeWidth={4}
              strokeLinecap="round"
            />
          );
          const resistor = (x: number, y: number, vertical: boolean, i: number) => {
            const [bw, bh] = vertical ? [16, 46] : [46, 16];
            return (
              <G key={`r${i}`}>
                <Rect
                  x={x - bw / 2 - 2}
                  y={y - bh / 2 - 2}
                  width={bw + 4}
                  height={bh + 4}
                  fill={c.card}
                />
                <Rect
                  x={x - bw / 2}
                  y={y - bh / 2}
                  width={bw}
                  height={bh}
                  rx={7}
                  fill={c.physResistor}
                  stroke={c.woodDark}
                />
                <Rect
                  x={x - bw / 2}
                  y={y - bh / 2}
                  width={bw}
                  height={bh}
                  rx={7}
                  fill={url(ids.light)}
                />
              </G>
            );
          };
          const reading = (x: number, y: number, i: number, anchor: 'start' | 'middle' | 'end') => (
            <G key={`l${i}`}>
              <SubLabel
                x={x}
                y={y - 14}
                text={`R_${i + 1} ${say(known(m.resistors[i]), Rs[i]!)} Ω`}
                anchor={anchor}
                w={w}
              />
              <SubLabel
                x={x}
                y={y + 4}
                text={`${say(all, ci.V[i]!)} V, ${say(all, ci.I3[i]!)} A`}
                anchor={anchor}
                size={chart.label}
                bold={false}
                color={c.chartHighlight}
                w={w}
              />
              <SubLabel
                x={x}
                y={y + 21}
                text={`${say(all, ci.P[i]!)} W`}
                anchor={anchor}
                size={chart.label}
                bold={false}
                color={c.chartHighlight}
                w={w}
              />
            </G>
          );
          const meterX = w * 0.28;
          const Imax = niceCeil(Math.max(ci.I, 1e-9) * 1.2);
          // Branch positions.
          const xa = sp ? w * 0.62 : w * 0.52;
          const yMid = (T + B) / 2;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Sheen id={ids.cell} />
                <Metal id={ids.metal} light={c.metal} dark={c.metalDark} />
                <TopLight id={ids.light} />
              </Defs>
              <G opacity={all ? 1 : 0.45}>
                {/* The loop and the branches. */}
                {wire(L, T, Rt, T, 'top')}
                {wire(L, B, Rt, B, 'bottom')}
                {wire(L, T, L, yMid - 34, 'lt')}
                {wire(L, yMid + 34, L, B, 'lb')}
                {wire(xa, T, xa, B, 'b1')}
                {wire(Rt, T, Rt, B, 'b2')}
                {[
                  [xa, T],
                  [xa, B],
                ].map(([x, y]) => (
                  <Circle key={`${x}${y}`} cx={x} cy={y} r={4.5} fill={c.copperDark} />
                ))}
                <Battery x={L} top={yMid - 30} height={60} sheen={ids.cell} />
                <SubLabel
                  x={L + 18}
                  y={yMid + 4}
                  text={`${say(known(spec.voltage), V)} V`}
                  anchor="start"
                  w={w}
                />
                <Meter
                  x={meterX}
                  y={T}
                  r={20}
                  reading={ci.I / Imax}
                  max={sig(Imax)}
                  metal={ids.metal}
                />
                <SubLabel
                  x={meterX}
                  y={T + 38}
                  text={`I = ${say(all, ci.I)} A`}
                  color={c.chartHighlight}
                  w={w}
                />
                {sp ? (
                  <G>
                    {resistor((meterX + xa) / 2 + 8, T, false, 0)}
                    {reading((meterX + xa) / 2 + 8, T + 70, 0, 'middle')}
                    {resistor(xa, T + (B - T) * 0.4, true, 1)}
                    {reading(xa + 14, T + (B - T) * 0.4, 1, 'start')}
                    {resistor(Rt, T + (B - T) * 0.72, true, 2)}
                    {reading(Rt - 14, T + (B - T) * 0.72, 2, 'end')}
                  </G>
                ) : (
                  <G>
                    {resistor(xa, T + (B - T) * 0.32, true, 0)}
                    {reading(xa - 14, T + (B - T) * 0.32, 0, 'end')}
                    {resistor(xa, T + (B - T) * 0.7, true, 1)}
                    {reading(xa - 14, T + (B - T) * 0.7, 1, 'end')}
                    {resistor(Rt, yMid, true, 2)}
                    {reading(Rt - 14, yMid, 2, 'end')}
                  </G>
                )}
              </G>
              <SubLabel
                x={w - 8}
                y={h - 6}
                text={`R_total = ${say(rOk, ci.Req)} Ω`}
                anchor="end"
                size={chart.label}
                bold={false}
                w={w}
              />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.map((l) => l.replace(/R_eq/g, 'Rₜₒₜ')).join(' · ')}</Caption>
    </View>
  );
}

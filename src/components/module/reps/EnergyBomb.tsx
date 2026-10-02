/**
 * HC44 `energyProfile` `mode: 'bomb'` (round 3, group G): a bomb calorimeter. A sealed steel
 * bomb (cut away to show the sample cup and the ignition wires) sits in a steel bucket of water
 * with a stirrer and a thermometer, inside an insulated jacket. The thermometer reads the rise
 * ΔT on a scale from the start; q = C_cal ΔT, ΔU = −q ÷ n and ΔH = ΔU + Δn_g RT are worked in the
 * caption. A "?" draws nothing for its value.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { EnergyBombSpec } from '@/data/modules/typesHe3g';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, niceCeil, useRep } from './common';
import { bombSums } from './energyHe3gMath';
import { fig3 } from './he1dText';
import { MathChip } from './hsdText';
import { Deepen, Metal, Sheen, url, usePaintIds } from './paint';

const f4 = (x: number) => formatNumber(Number(x.toPrecision(4)));

export function EnergyBomb({ spec, calc }: { spec: EnergyBombSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('water', 'steel', 'bomb', 'sheen', 'cup');
  const num = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const [C, dT] = [num(spec.constant), num(spec.change)];
  const n =
    num(spec.sample?.moles) ??
    (() => {
      const [m, M] = [num(spec.sample?.mass), num(spec.sample?.molar)];
      return m !== undefined && M ? m / M : undefined;
    })();
  const sums =
    C !== undefined && dT !== undefined
      ? bombSums(C, dT, n, num(spec.gas), num(spec.temperature), spec.R)
      : undefined;
  const scaleTop = niceCeil(Math.max(1, (dT ?? 0) * 1.15));
  const label = (x: NumOrVar | undefined, sym: string, unit: string) =>
    typeof x === 'string'
      ? rep.known(x)
        ? `${sym} = ${rep.value(x)}`
        : undefined
      : x === undefined
        ? undefined
        : `${sym} = ${formatNumber(x)} ${unit}`;

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.9, 320 / w)}>
        {({ w, h }) => {
          const jx = 8;
          const jw = Math.min(w * 0.66, 250);
          const jTop = 46;
          const jBottom = h - 10;
          const bx = jx + 12;
          const bw = jw - 24;
          const bTop = jTop + 26;
          const bBottom = jBottom - 12;
          const water = bTop + 16;
          // The bomb: a steel cylinder in the middle of the bucket, cut away down its front.
          const cx = bx + bw * 0.42;
          const bombW = Math.min(76, bw * 0.38);
          const bombTop = water + 24;
          const bombBottom = bBottom - 12;
          const inner = {
            x: cx - bombW / 2 + 9,
            y: bombTop + 16,
            w: bombW - 18,
            h: bombBottom - bombTop - 26,
          };
          const cupY = inner.y + inner.h - 22;
          // The thermometer, right of the bomb, its bulb in the water.
          const tx = bx + bw - 22;
          const tTop = 16;
          const tBottom = bBottom - 28;
          const ty = (rise: number) => tBottom - (rise / scaleTop) * (tBottom - tTop - 10);
          const ticks = Array.from({ length: 6 }, (_, i) => (scaleTop * i) / 5);
          const stirX = bx + 16;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Deepen id={ids.water} from={c.waterTop} to={c.water} />
                <Metal id={ids.steel} light={c.metal} dark={c.metalDark} />
                <Metal id={ids.bomb} light={c.metal} dark={c.metalDark} />
                <Sheen id={ids.sheen} strength={0.7} />
                <Sheen id={ids.cup} strength={1} />
              </Defs>
              {/* The insulated jacket and its lid. */}
              <Rect
                x={jx}
                y={jTop}
                width={jw}
                height={jBottom - jTop}
                rx={10}
                fill={c.foamCup}
                stroke={c.foamCupEdge}
                strokeWidth={1.5}
              />
              <Rect
                x={jx - 4}
                y={jTop - 10}
                width={jw + 8}
                height={12}
                rx={4}
                fill={c.foamCup}
                stroke={c.foamCupEdge}
              />
              {/* The steel bucket and its water. */}
              <Rect
                x={bx}
                y={bTop}
                width={bw}
                height={bBottom - bTop}
                rx={4}
                fill={url(ids.steel)}
                stroke={c.metalDark}
              />
              <Rect
                x={bx + 3}
                y={water}
                width={bw - 6}
                height={bBottom - water - 3}
                rx={3}
                fill={url(ids.water)}
                opacity={0.92}
              />
              {/* The bomb: body, screw cap, the chamber cut away with the cup and the wires. */}
              <Rect
                x={cx - bombW / 2}
                y={bombTop}
                width={bombW}
                height={bombBottom - bombTop}
                rx={8}
                fill={url(ids.bomb)}
                stroke={c.metalDark}
                strokeWidth={1.4}
              />
              <Rect
                x={cx - bombW / 2 - 4}
                y={bombTop - 10}
                width={bombW + 8}
                height={14}
                rx={4}
                fill={url(ids.steel)}
                stroke={c.metalDark}
              />
              {Array.from({ length: 6 }, (_, i) => (
                <Line
                  key={i}
                  x1={cx - bombW / 2 + 2 + (i * (bombW + 4)) / 6}
                  y1={bombTop - 8}
                  x2={cx - bombW / 2 + 2 + (i * (bombW + 4)) / 6}
                  y2={bombTop + 2}
                  stroke={c.metalDark}
                  strokeWidth={0.8}
                />
              ))}
              <Rect
                x={inner.x}
                y={inner.y}
                width={inner.w}
                height={inner.h}
                rx={4}
                fill={c.bomb3gChamber}
                stroke={c.metalDark}
                strokeWidth={0.8}
              />
              {/* The ignition wires down to a fuse over the cup, and out to the terminals. */}
              {[-1, 1].map((s) => (
                <Path
                  key={s}
                  d={`M ${cx + s * 8} ${bombTop - 10} L ${cx + s * 8} ${cupY - 12} L ${cx + s * 3} ${cupY - 6}`}
                  stroke={c.copper}
                  strokeWidth={1.6}
                  fill="none"
                />
              ))}
              {[-1, 1].map((s) => (
                <Path
                  key={`o${s}`}
                  d={`M ${cx + s * 8} ${bombTop - 10} L ${cx + s * 8} ${jTop - 18} L ${cx + s * 8 + 22} ${jTop - 26}`}
                  stroke={c.copper}
                  strokeWidth={1.6}
                  fill="none"
                />
              ))}
              <Path
                d={`M ${cx - 3} ${cupY - 6} q 3 4 6 0`}
                stroke={c.copperDark}
                strokeWidth={1.4}
                fill="none"
              />
              <Path
                d={`M ${cx - 11} ${cupY - 2} L ${cx + 11} ${cupY - 2} L ${cx + 8} ${cupY + 8} L ${cx - 8} ${cupY + 8} Z`}
                fill={url(ids.cup)}
                stroke={c.metalDark}
              />
              <Rect x={cx - 6} y={cupY - 4} width={12} height={4} rx={1.5} fill={c.bomb3gSample} />
              <Rect
                x={cx - bombW / 2}
                y={bombTop}
                width={bombW}
                height={bombBottom - bombTop}
                rx={8}
                fill={url(ids.sheen)}
              />
              {/* The stirrer. */}
              <Line
                x1={stirX}
                y1={jTop - 24}
                x2={stirX}
                y2={bBottom - 18}
                stroke={c.metalDark}
                strokeWidth={2.5}
              />
              <Rect
                x={stirX - 8}
                y={bBottom - 22}
                width={16}
                height={5}
                rx={2}
                fill={c.metalDark}
              />
              {/* The thermometer: its scale is the rise from the start. */}
              <Rect
                x={tx - 5}
                y={tTop - 6}
                width={10}
                height={tBottom - tTop + 14}
                rx={5}
                fill={c.glass}
                stroke={c.glassEdge}
              />
              {dT !== undefined ? (
                <Rect
                  x={tx - 2}
                  y={ty(Math.max(0, dT))}
                  width={4}
                  height={tBottom + 6 - ty(Math.max(0, dT))}
                  fill={c.mercury}
                />
              ) : null}
              <Circle cx={tx} cy={tBottom + 10} r={7} fill={c.mercury} stroke={c.glassEdge} />
              {ticks.map((t) => (
                <G key={t}>
                  <Line
                    x1={tx + 5}
                    y1={ty(t)}
                    x2={tx + 11}
                    y2={ty(t)}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <ChartText
                    x={tx + 14}
                    y={ty(t) + 4}
                    fontSize={chart.label}
                    fill={c.chartMuted}
                    halo
                  >
                    {`+${formatNumber(Number(t.toPrecision(3)))}`}
                  </ChartText>
                </G>
              ))}
              <ChartText x={tx + 14} y={tTop - 4} fontSize={chart.label} fill={c.chartMuted}>
                °C rise
              </ChartText>
              {dT !== undefined ? (
                <MathChip
                  x={tx + 40}
                  y={ty(dT) + 4}
                  text={`ΔT = ${f4(dT)} °C`}
                  anchor="start"
                  color={c.hopBack}
                  w={w}
                  h={h}
                />
              ) : null}
              {/* Labels: the constant volume, the sample, the calorimeter constant. */}
              <MathChip
                x={cx}
                y={inner.y + 16}
                text="V fixed"
                anchor="middle"
                bold={false}
                w={w}
                h={h}
              />
              {label(spec.sample?.mass, 'm', 'g') ? (
                <MathChip
                  x={cx}
                  y={cupY + 26}
                  text={label(spec.sample?.mass, 'm', 'g')!}
                  anchor="middle"
                  w={w}
                  h={h}
                />
              ) : null}
              {C !== undefined ? (
                <G>
                  <ChartText x={jx + 2} y={jTop - 32} fontSize={chart.label} fontWeight="700">
                    {`C_cal = ${f4(C)} kJ/°C`}
                  </ChartText>
                </G>
              ) : null}
              <ChartText x={cx + 34} y={jTop - 30} fontSize={chart.label} fill={c.chartMuted}>
                ignition
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionOf(spec, rep, C, dT, n, sums, num)}</Caption>
    </View>
  );
}

function captionOf(
  spec: EnergyBombSpec,
  rep: ReturnType<typeof useRep>,
  C: number | undefined,
  dT: number | undefined,
  n: number | undefined,
  sums: ReturnType<typeof bombSums> | undefined,
  num: (x: NumOrVar | undefined) => number | undefined,
): string {
  if (!sums || C === undefined || dT === undefined)
    return 'Type the calorimeter constant and ΔT to find the heat.';
  const out = [`q = calorimeter constant × ΔT = ${f4(C)} × ${f4(dT)} = ${fig3(sums.q)} kJ`];
  if (n !== undefined && sums.dU !== undefined) {
    const name = spec.sample?.name ? ` of ${spec.sample.name}` : '';
    out.push(
      `The volume is fixed, so no work is done and the heat is ΔU: ΔU = −q ÷ n = −${fig3(sums.q)} ÷ ${f4(n)} = ${fig3(sums.dU)} kJ/mol${name}.`,
    );
    const [dng, T] = [num(spec.gas), num(spec.temperature)];
    if (sums.dH !== undefined && dng !== undefined && T !== undefined)
      out.push(
        `ΔH = ΔU + Δn(gas)RT = ${fig3(sums.dU)} + (${formatNumber(dng)}) × ${spec.R ?? 0.008314} × ${f4(T)} = ${fig3(sums.dH)} kJ/mol`,
      );
  }
  void rep;
  return out.join(' · ');
}

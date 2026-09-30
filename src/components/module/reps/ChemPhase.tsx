/**
 * Water's phase diagram (H108 part 3, `chemDiagram` mode `phase`), flat like a graph: pressure
 * (not to scale) against temperature, the solid, liquid and gas regions, the triple point and
 * the 1 atm line. A solution's lines are dashed beside pure water's: its melting line moved left
 * to its freezing point and its boiling curve right to its boiling point, ice's own line (solid
 * to gas) kept, since the ice that forms is pure water. The temperature axis is broken into a
 * part round 0 °C and a part round 100 °C, each to its own scale, so a shift of a few tenths
 * of a degree shows; the two shifts are bracketed on the 1 atm line.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { ChemDiagramHs3eSpec } from '@/data/modules/typesHs3e';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { arrowHead, reader } from './graphKit';

type Spec = Extract<ChemDiagramHs3eSpec, { mode: 'phase' }>;
type Pt = [number, number];

/** A value as printed: at most 4 decimals, a true minus. */
const fmt = (x: number) => formatNumber(Number(x.toFixed(4)));

const poly = (ps: Pt[]) => ps.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');

export function ChemPhase({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const f = spec.freezing === undefined ? undefined : read(spec.freezing);
  const b = spec.boiling === undefined ? undefined : read(spec.boiling);
  const fKnown = !!f?.known && f.value <= 0;
  const bKnown = !!b?.known && b.value >= 100;
  const tf = fKnown ? f.value : -2;
  const tb = bKnown ? b.value : 101;
  // Each part of the broken axis spans its shift 2.5 times, so the shift fills 40% of it.
  const sF = Math.max(-tf, 1e-3);
  const sB = Math.max(tb - 100, 1e-3);
  const rangeA: [number, number] = [tf - 0.8 * sF, 0.7 * sF];
  const rangeB: [number, number] = [100 - 0.7 * sB, tb + 0.8 * sB];

  const art = (w: number, h: number) => {
    const pl = 44;
    const pr = w - 10;
    const pt = 34;
    const pb = h - 64;
    const W = pr - pl;
    const aEnd = pl + W * 0.46;
    const bStart = pr - W * 0.46;
    const xA = (t: number) => pl + ((t - rangeA[0]) / (rangeA[1] - rangeA[0])) * (aEnd - pl);
    const xB = (t: number) => bStart + ((t - rangeB[0]) / (rangeB[1] - rangeB[0])) * (pr - bStart);
    const y1 = pt + 0.46 * (pb - pt);
    const yT = pt + 0.82 * (pb - pt);
    // Pure water's triple point sits at 0.01 °C, a hair right of its melting point at 1 atm.
    const xT = xA(0) + 3;
    const ySub = (x: number) => pb - 4 - (pb - 4 - yT) * ((x - pl) / (xT - pl)) ** 1.6;
    // The melting line leans left (ice melts under pressure): through the triple point and 0 °C.
    const lean = (xA(0) - xT) / (y1 - yT);
    const fusionAt = (x0: number, y: number) => x0 + (y - y1) * lean;
    // The solution's triple point: where its melting line meets ice's own line.
    let [lo, hi] = [pl, xT];
    for (let k = 0; k < 40; k++) {
      const mid = (lo + hi) / 2;
      if (mid - fusionAt(xA(tf), ySub(mid)) > 0) hi = mid;
      else lo = mid;
    }
    const xTs = (lo + hi) / 2;
    const yTs = ySub(xTs);
    const sub = Array.from({ length: 25 }, (_, k): Pt => {
      const x = pl + ((xT - pl) * k) / 24;
      return [x, ySub(x)];
    });
    // A boiling curve rises ever faster: y falls as a power of x from its triple point, through
    // its boiling point at 1 atm, to the top right (toward the critical point).
    const boilCurve = (x0: number, y0: number, xb: number, yEnd: number): Pt[] => {
      const xE = pr - 4;
      const p = Math.log((y0 - y1) / (y0 - yEnd)) / Math.log((xb - x0) / (xE - x0));
      return Array.from({ length: 49 }, (_, k): Pt => {
        const x = x0 + ((xE - x0) * k) / 48;
        return [x, y0 - (y0 - yEnd) * ((x - x0) / (xE - x0)) ** p];
      });
    };
    const vapor = boilCurve(xT, yT, xB(100), pt + 8);
    const vaporS = boilCurve(xTs, yTs, xB(tb), pt + 8 + 0.3 * (y1 - pt - 8));
    const topPure = fusionAt(xA(0), pt);
    const solid: Pt[] = [[pl, pt], [topPure, pt], [xT, yT], ...[...sub].reverse(), [pl, pb - 4]];
    const liquid: Pt[] = [[topPure, pt], [pr, pt], [pr, pt + 8], ...[...vapor].reverse()];
    const lineColor = c.chartInk;
    const lit = c.chartHighlight;
    const bracket = (x0: number, x1: number, text: string, known: boolean) => {
      const y = y1 - 12;
      const dir = Math.sign(x1 - x0) || 1;
      return (
        <G opacity={known ? 1 : 0.4}>
          <Line x1={x0} y1={y} x2={x1 - dir * 6} y2={y} stroke={lit} strokeWidth={1.6} />
          <Path d={arrowHead(x1, y, dir, 0, 7)} fill={lit} />
          <ChartText
            x={(x0 + x1) / 2}
            y={y - 7}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
            fill={lit}
          >
            {text}
          </ChartText>
        </G>
      );
    };
    const dropText =
      spec.drop !== undefined && read(spec.drop).known
        ? read(spec.drop).value
        : fKnown
          ? -tf
          : undefined;
    const riseText =
      spec.rise !== undefined && read(spec.rise).known
        ? read(spec.rise).value
        : bKnown
          ? tb - 100
          : undefined;
    const gapX = (aEnd + bStart) / 2;
    return (
      <Svg width={w} height={h}>
        {/* The regions: gas everywhere, then solid and liquid over it. */}
        <Rect x={pl} y={pt} width={W} height={pb - pt} fill={c.phaseGas} />
        <Path d={`${poly(solid)} Z`} fill={c.phaseSolid} />
        <Path d={`${poly(liquid)} Z`} fill={c.phaseLiquid} />
        <ChartText x={pl + 6} y={pt + 18} fontSize={chart.value} fontWeight="700">
          Solid
        </ChartText>
        <ChartText x={gapX} y={pt + 18} textAnchor="middle" fontSize={chart.value} fontWeight="700">
          Liquid
        </ChartText>
        <ChartText x={pr - 6} y={pb - 10} textAnchor="end" fontSize={chart.value} fontWeight="700">
          Gas
        </ChartText>
        {/* The 1 atm line. */}
        <Line
          x1={pl}
          y1={y1}
          x2={pr}
          y2={y1}
          stroke={c.chartMuted}
          strokeWidth={1}
          strokeDasharray={chart.dashFine}
        />
        <ChartText
          x={pl - 4}
          y={y1 + 4}
          textAnchor="end"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          1 atm
        </ChartText>
        {/* Pure water's lines. */}
        <Path d={poly(sub)} stroke={lineColor} strokeWidth={chart.stroke} fill="none" />
        <Line x1={xT} y1={yT} x2={topPure} y2={pt} stroke={lineColor} strokeWidth={chart.stroke} />
        <Path d={poly(vapor)} stroke={lineColor} strokeWidth={chart.stroke} fill="none" />
        <Circle cx={xT} cy={yT} r={3.5} fill={lineColor} />
        {/* The solution's lines, dashed. */}
        <G opacity={fKnown ? 1 : 0.35}>
          <Line
            x1={xTs}
            y1={yTs}
            x2={fusionAt(xA(tf), pt)}
            y2={pt}
            stroke={lit}
            strokeWidth={chart.stroke}
            strokeDasharray={chart.dash}
          />
          <Circle cx={xA(tf)} cy={y1} r={4} fill={lit} />
        </G>
        <G opacity={fKnown && bKnown ? 1 : 0.35}>
          <Path
            d={poly(vaporS)}
            stroke={lit}
            strokeWidth={chart.stroke}
            strokeDasharray={chart.dash}
            fill="none"
          />
        </G>
        <G opacity={bKnown ? 1 : 0.35}>
          <Circle cx={xB(tb)} cy={y1} r={4} fill={lit} />
        </G>
        <Circle cx={xA(0)} cy={y1} r={3.5} fill={lineColor} />
        <Circle cx={xB(100)} cy={y1} r={3.5} fill={lineColor} />
        {bracket(xA(0), xA(tf), `ΔTf = ${dropText === undefined ? '?' : fmt(dropText)}`, fKnown)}
        {bracket(xB(100), xB(tb), `ΔTb = ${riseText === undefined ? '?' : fmt(riseText)}`, bKnown)}
        {/* The axes, the temperature axis broken between its two parts. */}
        <Line x1={pl} y1={pt} x2={pl} y2={pb} stroke={c.chartInk} strokeWidth={1.2} />
        <Line x1={pl} y1={pb} x2={aEnd} y2={pb} stroke={c.chartInk} strokeWidth={1.2} />
        <Line x1={bStart} y1={pb} x2={pr} y2={pb} stroke={c.chartInk} strokeWidth={1.2} />
        {[aEnd, bStart].map((x) => (
          <Line
            key={x}
            x1={x - 4}
            y1={pb + 6}
            x2={x + 4}
            y2={pb - 6}
            stroke={c.chartInk}
            strokeWidth={1.2}
          />
        ))}
        <ChartText x={pl} y={pt - 10} fontSize={chart.label} fill={c.chartMuted}>
          Pressure
        </ChartText>
        {(
          [
            [xA(0), '0', 1, true],
            [xB(100), '100', 1, true],
            [xA(tf), fKnown ? fmt(tf) : '?', 2, fKnown],
            [xB(tb), bKnown ? fmt(tb) : '?', 2, bKnown],
          ] as const
        ).map(([x, text, row, known]) => (
          <G key={`${row}${x}`} opacity={known ? 1 : 0.5}>
            <Line
              x1={x}
              y1={pb}
              x2={x}
              y2={pb + (row === 1 ? 5 : 20)}
              stroke={row === 1 ? c.chartInk : lit}
              strokeWidth={1}
            />
            <ChartText
              x={x}
              y={pb + (row === 1 ? 17 : 33)}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight="700"
              fill={row === 1 ? c.chartInk : lit}
            >
              {text}
            </ChartText>
          </G>
        ))}
        <ChartText
          x={(pl + pr) / 2}
          y={h - 8}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          Temperature (°C), broken axis
        </ChartText>
        {/* The key. */}
        <Line x1={w - 200} y1={12} x2={w - 178} y2={12} stroke={lineColor} strokeWidth={2} />
        <ChartText x={w - 172} y={16} fontSize={chart.label}>
          Water
        </ChartText>
        <Line
          x1={w - 118}
          y1={12}
          x2={w - 96}
          y2={12}
          stroke={lit}
          strokeWidth={2}
          strokeDasharray={chart.dash}
        />
        <ChartText x={w - 90} y={16} fontSize={chart.label} fill={lit}>
          Solution
        </ChartText>
      </Svg>
    );
  };

  const caption = [
    'Water’s phase diagram: pressure not to scale, the temperature axis broken, each part to its own scale.',
    'At 1 atm pure water melts at 0 °C and boils at 100 °C.',
    fKnown
      ? `The solution’s melting line moves left: it freezes at ${fmt(tf)} °C, ${fmt(-tf)} °C lower.`
      : 'Type the solution’s freezing point to draw its melting line.',
    bKnown
      ? `Its boiling curve moves right: it boils at ${fmt(tb)} °C, ${fmt(tb - 100)} °C higher.`
      : 'Type its boiling point to draw its boiling curve.',
    'Ice’s own line stays: the ice that forms is pure water.',
  ].join(' · ');

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.95, 340 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

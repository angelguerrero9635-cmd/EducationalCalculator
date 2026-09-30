/**
 * A mass defect (H101 part 14), flat like a bar chart: the mass before a nuclear change and the
 * mass after it as two bars on a broken axis, so a gap of a few thousandths of a unit shows on
 * top of hundreds. The axis starts just under the lower bar (the break is drawn across both bars
 * and the axis); the gap between the tops is the mass defect, bracketed, with the energy it
 * becomes, E = Δm × 931.5 MeV.
 */
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { ChemDiagramSpec } from '@/data/modules/typesHs2d';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { defectEnergy } from './chemHs2d';
import { Canvas, Caption, ChartText, fitLabel, niceCeil, useRep } from './common';
import { reader } from './graphKit';

type Spec = Extract<ChemDiagramSpec, { mode: 'massDefect' }>;

/** Decimals that show a step: 0.002 → 3. */
const decimalsOf = (step: number) => Math.max(0, Math.ceil(-Math.log10(step) - 1e-9));

export function ChemMassDefect({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const side = (ps: Spec['before']) => {
    const rs = ps.map((p) => read(p.mass));
    return {
      known: rs.every((r) => r.known),
      value: rs.reduce((s, r) => s + r.value, 0),
      texts: rs.map((r) => (r.known ? formatNumber(Number(r.value.toFixed(6))) : '?')),
      names: ps.map((p) => p.name),
    };
  };
  const before = side(spec.before);
  const after = side(spec.after);
  const known = before.known && after.known;
  const dm = before.value - after.value;
  const gap = dm > 0 ? dm : Math.max(1e-3, before.value * 1e-5);
  const E = defectEnergy(dm);
  const ok = known && dm > 0;
  const fmt = (x: number, d: number) => formatNumber(Number(x.toFixed(d)));
  // The axis window: from under the lower bar's top to a little over the higher one's.
  const lo = Math.min(before.value, after.value) - 2 * gap;
  const hi = Math.max(before.value, after.value) + 0.5 * gap;
  const step = niceCeil((hi - lo) / 4);
  const d = Math.min(6, decimalsOf(step));
  const massText = (s: typeof before) =>
    s.known ? `${s.texts.join(' + ')}${s.texts.length > 1 ? ` = ${fmt(s.value, 6)}` : ''} u` : '?';

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.95, 320 / w)}>
        {({ w, h }) => {
          const axisX = 70;
          const top = 16;
          const base = h - 58;
          const y = (m: number) => base - ((m - lo) / (hi - lo)) * (base - top);
          const bw = Math.min(56, (w - axisX - 170) / 2);
          const xs = [axisX + 16, axisX + 16 + bw + 22];
          const ticks: number[] = [];
          for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-12; t += step) ticks.push(t);
          const bar = (k: number, s: typeof before) => {
            const top1 = y(s.value);
            return (
              <G key={`bar${k}`}>
                <Rect
                  x={xs[k]}
                  y={top1}
                  width={bw}
                  height={base + 14 - top1}
                  fill={k === 0 ? c.chartHighlight : c.chartSecond}
                  opacity={s.known ? 1 : 0.3}
                />
                <ChartText
                  x={xs[k]! + bw / 2}
                  y={h - 22}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {k === 0 ? 'Before' : 'After'}
                </ChartText>
                <ChartText
                  x={xs[k]! + bw / 2}
                  y={h - 6}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {s.names.join(' + ')}
                </ChartText>
              </G>
            );
          };
          // The break: a zigzag across the axis and both bars, in the card color.
          const zig = (x0: number, x1: number, yy: number) => {
            let p = `M ${x0} ${yy}`;
            for (let x = x0, k = 0; x < x1; x += 6, k++)
              p += ` L ${Math.min(x + 6, x1)} ${yy + (k % 2 ? 4 : -4)}`;
            return p;
          };
          const yb = y(before.value);
          const ya = y(after.value);
          const bx = xs[1]! + bw + 10;
          const label1 = ok ? `Δm = ${fmt(dm, 6)} u` : 'Δm = ?';
          const label2 = ok ? `E = ${fmt(E, 2)} MeV` : 'E = ?';
          return (
            <Svg width={w} height={h}>
              {ticks.map((t) => (
                <G key={t}>
                  <Line
                    x1={axisX}
                    y1={y(t)}
                    x2={w - 8}
                    y2={y(t)}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                  <ChartText
                    x={axisX - 6}
                    y={y(t) + 4}
                    fontSize={chart.label}
                    textAnchor="end"
                    fill={c.chartMuted}
                  >
                    {t.toFixed(d)}
                  </ChartText>
                </G>
              ))}
              <Line
                x1={axisX}
                y1={top - 6}
                x2={axisX}
                y2={base + 14}
                stroke={c.chartInk}
                strokeWidth={1.5}
              />
              <ChartText x={axisX + 6} y={top - 2} fontSize={chart.label} fill={c.chartMuted}>
                mass (u)
              </ChartText>
              {bar(0, before)}
              {bar(1, after)}
              <Path
                d={zig(axisX - 8, xs[1]! + bw + 4, base + 4)}
                fill="none"
                stroke={c.card}
                strokeWidth={5}
              />
              <Path
                d={zig(axisX - 8, xs[1]! + bw + 4, base + 1)}
                fill="none"
                stroke={c.chartMuted}
                strokeWidth={1}
              />
              <Path
                d={zig(axisX - 8, xs[1]! + bw + 4, base + 7)}
                fill="none"
                stroke={c.chartMuted}
                strokeWidth={1}
              />
              {/* The gap: before's top carried across, bracketed down to after's top. */}
              <Line
                x1={xs[0]! + bw}
                y1={yb}
                x2={bx + 6}
                y2={yb}
                stroke={c.chartInk}
                strokeWidth={1.2}
                strokeDasharray={chart.dashFine}
              />
              <Path
                d={`M ${bx} ${yb} l 6 0 L ${bx + 6} ${ya} l -6 0`}
                fill="none"
                stroke={ok ? c.hopBack : c.chartMuted}
                strokeWidth={chart.stroke}
              />
              <ChartText
                {...fitLabel(bx + 12, label1, chart.label, w, 'start')}
                y={(yb + ya) / 2 - 2}
                fontSize={chart.label}
                fontWeight="700"
                fill={ok ? c.hopBack : c.chartMuted}
              >
                {label1}
              </ChartText>
              <ChartText
                {...fitLabel(bx + 12, label2, chart.label, w, 'start')}
                y={(yb + ya) / 2 + 14}
                fontSize={chart.label}
                fontWeight="700"
                fill={ok ? c.chartInk : c.chartMuted}
              >
                {label2}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `Before: ${massText(before)}`,
          `After: ${massText(after)}`,
          ok
            ? `Δm = ${fmt(before.value, 6)} − ${fmt(after.value, 6)} = ${fmt(dm, 6)} u`
            : known
              ? 'The mass after is not less than before: no energy is given off.'
              : 'Type every mass to find the mass defect.',
          ...(ok
            ? [
                `E = ${fmt(dm, 6)} u × 931.5 MeV/u = ${fmt(E, 2)} MeV`,
                'The axis is broken: the bars start near the masses, so the tiny gap shows. The lost mass became energy.',
              ]
            : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}

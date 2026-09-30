/**
 * Equilibrium (H54, Grades 9–12 chemistry): concentrations against time, each substance's line
 * moving by the reaction's extent until Q = K and leveling off; after a stress (a substance
 * added or removed, the volume changed, the temperature changed) the lines jump and move to the
 * new equilibrium, the way Le Châtelier's principle says. Flat and exact: the levels are solved.
 */
import { View } from 'react-native';
import Svg, { G, Line, Polyline } from 'react-native-svg';

import type { EquilibriumChartSpec } from '@/data/modules/typesHsj';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { approach, quotient, stages, type Species } from './equilibriumModel';
import { axisOf, makePlot, PlotFrame, spread } from './hsjPlot';

const fmt = (x: number) => formatNumber(Number(x.toPrecision(4)));

export function EquilibriumChart({ spec, calc }: { spec: EquilibriumChartSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = (x: NumOrVar) =>
    typeof x === 'number'
      ? { value: x, known: true }
      : { value: rep.shown(x), known: rep.known(x) };
  const species: Species[] = spec.species.map((s) => ({
    coef: s.coef,
    sign: s.side === 'product' ? 1 : -1,
  }));
  const starts = spec.species.map((s) => read(s.start));
  const c0 = starts.map((s) => Math.max(0, s.value));
  const K = spec.K === undefined ? quotient(species, c0) : read(spec.K).value;
  const stress = spec.stress;
  const add = stress?.add
    ? { index: stress.add.species, amount: read(stress.add.amount).value }
    : undefined;
  const st = stages(
    species,
    c0,
    K,
    stress
      ? {
          ...(add ? { add } : {}),
          ...(stress.scale !== undefined ? { scale: read(stress.scale).value } : {}),
          ...(stress.K !== undefined ? { K: read(stress.K).value } : {}),
        }
      : undefined,
  );
  const known =
    starts.every((s) => s.known) &&
    (spec.K === undefined || read(spec.K).known) &&
    (!stress?.add || read(stress.add.amount).known) &&
    (stress?.scale === undefined || read(stress.scale).known) &&
    (stress?.K === undefined || read(stress.K).known);
  const colors = [c.chartHighlight, c.fnSecond, c.lineSum, c.chartSecond];
  const tEnd = stress ? 2 : 1;
  const at = (t: number) => {
    if (t <= 1 || !st.jumped) {
      const a = approach(Math.min(t, 1));
      return c0.map((x, i) => x + species[i]!.sign * species[i]!.coef * st.xi1 * a);
    }
    const a = approach(t - 1);
    return st.jumped.map((x, i) => x + species[i]!.sign * species[i]!.coef * st.xi2! * a);
  };
  const all = [...c0, ...st.eq1, ...(st.jumped ?? []), ...(st.eq2 ?? [])];
  const y = axisOf(0, Math.max(...all, 1e-6) * 1.08, 5);
  const last = st.eq2 ?? st.eq1;
  const name = (i: number) => `[${spec.species[i]!.formula}]`;

  return (
    <View>
      <Canvas aspect={0.78}>
        {({ w, h }) => {
          const p = makePlot(w, h, { lo: 0, hi: tEnd, step: 0.5 }, y, { L: 52, R: 96, B: 30 });
          const ts = (from: number, to: number) =>
            Array.from({ length: 81 }, (_, k) => from + ((to - from) * k) / 80);
          const lineOf = (i: number) => {
            const pts = [
              ...ts(0, 1).map((t) => [t, at(t)[i]!] as const),
              ...(st.jumped ? ts(1.0001, 2).map((t) => [t, at(t)[i]!] as const) : []),
            ];
            return pts.map(([t, v]) => `${p.sx(t)},${p.sy(v)}`).join(' ');
          };
          const ends = spread(
            last.map((v) => p.sy(v) + 4),
            15,
          );
          return (
            <Svg width={w} height={h}>
              <PlotFrame
                p={p}
                xName="Time"
                yName="Concentration (mol/L)"
                xNumbers={false}
                yText={(v) => formatNumber(v)}
              />
              {stress ? (
                <G>
                  <Line
                    x1={p.sx(1)}
                    y1={p.T}
                    x2={p.sx(1)}
                    y2={h - p.B}
                    stroke={c.chartMuted}
                    strokeWidth={1.5}
                    strokeDasharray={chart.dash}
                  />
                  {/* Chemical symbols stay upright: plain text, not italic letters. */}
                  <ChartText x={p.sx(1) + 5} y={p.T + 12} fontSize={chart.label} fontWeight="700">
                    {stress.label}
                  </ChartText>
                </G>
              ) : null}
              <G opacity={known ? 1 : 0.4}>
                {spec.species.map((_, i) => (
                  <Polyline
                    key={i}
                    points={lineOf(i)}
                    fill="none"
                    stroke={colors[i % colors.length]}
                    strokeWidth={chart.strokeHeavy}
                    strokeLinejoin="round"
                  />
                ))}
                {spec.species.map((_, i) => (
                  <ChartText
                    key={`n${i}`}
                    x={p.sx(tEnd) + 6}
                    y={ends[i]!}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={colors[i % colors.length]}
                  >
                    {`${name(i)} ${fmt(last[i]!)}`}
                  </ChartText>
                ))}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `At equilibrium Q = K = ${fmt(K)}: ${spec.species.map((_, i) => `${name(i)} = ${fmt(st.eq1[i]!)} M`).join(', ')}.`,
          ...(stress && st.Q2 !== undefined && st.K2 !== undefined
            ? [
                Math.abs(st.Q2 - st.K2) <= 1e-9 * Math.max(1, st.K2)
                  ? `After the change Q = K = ${fmt(st.K2)}: nothing shifts.`
                  : `After the change Q = ${fmt(st.Q2)} is ${st.Q2 < st.K2 ? 'less' : 'more'} than K = ${fmt(st.K2)}: the reaction shifts ${st.Q2 < st.K2 ? 'right, making more products' : 'left, making more reactants'} until Q = K again.`,
              ]
            : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}

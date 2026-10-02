/**
 * HC44 `energyProfile` `steps` (round 3, group G): a mechanism of 2–3 steps. The curve climbs
 * each step's hump from the level before it and settles at each intermediate between; each hump
 * has its Eₐ arrow, the highest transition state is lit and named rate-determining, and ΔH (or
 * ΔG) runs from the reactants to the products on the right. Flat. A step whose values are "?"
 * is not drawn.
 */
import { View } from 'react-native';
import Svg, { G, Line, Polyline } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { EnergyProfileSpec } from '@/data/modules/typesHsj';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { FALL, PEAK, RISE } from './energyModel';
import { rateStep, stepsAt, stepsProblem, stepTops } from './energyHe3gMath';
import { Arrow } from './graphKit';
import { MathChip } from './hsdText';
import { axisOf, makePlot, PlotFrame } from './hsjPlot';

type Profile = Exclude<EnergyProfileSpec, { mode: 'calorimeter' | 'ladder' | 'bomb' }>;

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const num = (x: number) => formatNumber(Number(x.toPrecision(6)));

export function EnergySteps({ spec, calc }: { spec: Profile; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const st = spec.steps!;
  const known = (x: NumOrVar) => typeof x === 'number' || rep.known(x);
  const val = (x: NumOrVar) => (typeof x === 'number' ? x : rep.val(x));
  const levelIds = [spec.reactants, ...st.intermediates, spec.products];
  const barrierIds = [spec.activation, ...st.barriers];
  const k = barrierIds.length;
  const levels = levelIds.map(val);
  const barriers = barrierIds.map(val);
  // A step is drawn when its two levels and its barrier are known.
  const drawn = barrierIds.map(
    (b, i) => known(b) && known(levelIds[i]!) && known(levelIds[i + 1]!),
  );
  const all = drawn.every(Boolean);
  const problem = stepsProblem(levels, barriers);
  const tops = stepTops(levels, barriers);
  const rds = rateStep(levels, barriers);
  const unit =
    [spec.activation, spec.products, ...st.barriers]
      .map((x) => (typeof x === 'string' ? rep.unit(x) : undefined))
      .find(Boolean) ?? 'kJ/mol';
  const q = spec.quantity ?? 'H';
  const sym = `Δ${q}`;
  const free = q.startsWith('G');
  const span = Math.max(...levels, ...tops) - Math.min(...levels, ...tops) || 1;
  const y = axisOf(
    Math.min(...levels, ...tops) - span * 0.12,
    Math.max(...levels, ...tops) + span * 0.22,
    5,
  );
  const dH = levels[k]! - levels[0]!;
  const names = [
    spec.names?.reactants ?? 'Reactants',
    ...st.intermediates.map((_, i) => st.names?.[i] ?? `I${SUB[i + 1] ?? ''}`),
    spec.names?.products ?? 'Products',
  ];

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.9, 340 / w)}>
        {({ w, h }) => {
          const pl = makePlot(w, h, { lo: 0, hi: 1, step: 0.25 }, y, { B: 30, R: 12 });
          const X = (x: number) => pl.sx(x);
          const seg = (i: number) =>
            Array.from({ length: 61 }, (_, j) => (i + j / 60) / k)
              .map((x) => `${X(x)},${pl.sy(stepsAt(x, levels, barriers))}`)
              .join(' ');
          const peakX = (i: number) => (i + PEAK) / k;
          return (
            <Svg width={w} height={h}>
              <PlotFrame
                p={pl}
                xName="Reaction progress"
                yName={free ? `Free energy (${unit})` : `Energy (${unit})`}
                xNumbers={false}
              />
              <G opacity={problem ? 0.35 : 1}>
                {/* The reactants' level carried across, dashed, for ΔH to start from. */}
                {drawn[0] && drawn[k - 1] ? (
                  <Line
                    x1={X(RISE / k)}
                    y1={pl.sy(levels[0]!)}
                    x2={X(0.97)}
                    y2={pl.sy(levels[0]!)}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dash}
                  />
                ) : null}
                {drawn.map((d, i) =>
                  d ? (
                    <Polyline
                      key={`s${i}`}
                      points={seg(i)}
                      fill="none"
                      stroke={i === rds && all ? c.chartHighlight : c.chartInk}
                      strokeWidth={i === rds && all ? chart.strokeHeavy : chart.stroke}
                      strokeLinejoin="round"
                    />
                  ) : null,
                )}
                {/* Each step's barrier, an arrow from the level before it up to its top. */}
                {drawn.map((d, i) =>
                  d && Math.abs(pl.sy(tops[i]!) - pl.sy(levels[i]!)) > 12 ? (
                    <Arrow
                      key={`a${i}`}
                      x1={X(peakX(i))}
                      y1={pl.sy(levels[i]!)}
                      x2={X(peakX(i))}
                      y2={pl.sy(tops[i]!) + 2}
                      color={c.chartMuted}
                      width={chart.strokeLight}
                    />
                  ) : null,
                )}
                {drawn.map((d, i) =>
                  d && i > 0 ? (
                    <Line
                      key={`b${i}`}
                      x1={X((i - 1 + FALL) / k)}
                      y1={pl.sy(levels[i]!)}
                      x2={X(peakX(i)) + 4}
                      y2={pl.sy(levels[i]!)}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                    />
                  ) : null,
                )}
                {drawn[0] &&
                drawn[k - 1] &&
                Math.abs(pl.sy(levels[k]!) - pl.sy(levels[0]!)) > 12 ? (
                  <Arrow
                    x1={X(0.97)}
                    y1={pl.sy(levels[0]!)}
                    x2={X(0.97)}
                    y2={pl.sy(levels[k]!)}
                    color={dH < 0 ? c.hopBack : c.chartHighlight}
                  />
                ) : null}
              </G>
              {/* Names under each level's flat part: reactants, intermediates, products. */}
              {levels.map((lv, i) => {
                const ok = i === 0 ? drawn[0] : i === k ? drawn[k - 1] : drawn[i - 1] || drawn[i];
                if (!ok) return null;
                const x = i === 0 ? X(0.01) : i === k ? X(0.99) : X(i / k);
                return (
                  <ChartText
                    key={`n${i}`}
                    x={x}
                    y={pl.sy(lv) + 16}
                    textAnchor={i === 0 ? 'start' : i === k ? 'end' : 'middle'}
                    fontSize={chart.label}
                    fontWeight="700"
                    halo
                  >
                    {names[i]!}
                  </ChartText>
                );
              })}
              {drawn.map((d, i) =>
                d ? (
                  <MathChip
                    key={`c${i}`}
                    x={X(peakX(i)) - 5}
                    y={(pl.sy(levels[i]!) + pl.sy(tops[i]!)) / 2 + 4}
                    text={`Eₐ${SUB[i + 1] ?? ''} = ${num(barriers[i]!)}`}
                    anchor="end"
                    w={w}
                    h={h}
                  />
                ) : null,
              )}
              {all && !problem ? (
                <ChartText
                  x={X(peakX(rds))}
                  y={pl.sy(tops[rds]!) - 8}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={c.chartHighlight}
                  halo
                >
                  rate-determining
                </ChartText>
              ) : null}
              {drawn[0] && drawn[k - 1] ? (
                <MathChip
                  x={X(0.97) - 6}
                  y={(pl.sy(levels[0]!) + pl.sy(levels[k]!)) / 2 + 4}
                  text={`${sym} = ${num(dH)}`}
                  anchor="end"
                  color={dH < 0 ? c.hopBack : c.chartHighlight}
                  w={w}
                  h={h}
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {captionOf({ all, problem, tops, levels, barriers, rds, sym, free, unit, dH })}
      </Caption>
    </View>
  );
}

function captionOf(x: {
  all: boolean;
  problem: string | undefined;
  tops: number[];
  levels: number[];
  barriers: number[];
  rds: number;
  sym: string;
  free: boolean;
  unit: string;
  dH: number;
}): string {
  if (x.problem) return x.problem;
  if (!x.all) return 'Type every level and barrier to draw the whole mechanism.';
  const sub = (i: number) => SUB[i + 1] ?? '';
  const out = x.tops.map(
    (t, i) => `T${sub(i)} = ${num(x.levels[i]!)} + ${num(x.barriers[i]!)} = ${num(t)} ${x.unit}`,
  );
  out.push(
    `The highest transition state is T${sub(x.rds)}, so step ${x.rds + 1} is rate-determining.`,
    `${x.sym} = products − reactants = ${num(x.levels[x.levels.length - 1]!)} − ${num(x.levels[0]!)} = ${num(x.dH)} ${x.unit}`,
  );
  return out.join(' · ');
}

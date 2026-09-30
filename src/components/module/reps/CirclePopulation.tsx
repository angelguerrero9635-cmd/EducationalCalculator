/**
 * H106 (round 3, group B): `circle` with `population`, population density on a map. A town's
 * irregular outline on a grid of the shown unit (km), people as dots inside it (one dot for a
 * round number of people, denser toward the center), and the circle of radius r that models its
 * area dashed over it, the radius drawn and labelled. The outline is the circle's area exactly
 * (a wobble of fixed harmonics, scaled), so D = N ÷ A reads off either. The caption works
 * A = πr² and D = N ÷ A. The radius is read in the formula's units and drawn in the shown one.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { niceStep } from './functionGraphMath';

type Spec = Extract<Representation, { kind: 'circle' }>;

/** The outline's wobble: r(θ) = k·r·(1 + Σ aᵢ·sin(nᵢθ + φᵢ)), k keeping the area πr². */
const WOBBLE = [
  { n: 2, a: 0.1, p: 0.6 },
  { n: 3, a: 0.12, p: 2.1 },
  { n: 5, a: 0.06, p: 4.0 },
  { n: 7, a: 0.03, p: 1.3 },
];
const K = 1 / Math.sqrt(1 + WOBBLE.reduce((s, w) => s + (w.a * w.a) / 2, 0));

/** The outline's reach at angle θ, for a circle of radius 1 (its area is π exactly). */
export const reach = (t: number) =>
  K * (1 + WOBBLE.reduce((s, w) => s + w.a * Math.sin(w.n * t + w.p), 0));

/** People per dot: 1, 2 or 5 × 10ⁿ, so a population draws as 20 to 100 dots or so. */
export function perDot(N: number): number {
  if (N <= 60) return 1;
  const raw = N / 60;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw)!;
}

/** A fixed pseudo-random sequence in [0, 1) (the same dots every time). */
const rand = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function CirclePopulation({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const pop = spec.population!;
  const r = rep.val(spec.radius) / rep.factor(spec.radius);
  const unit = rep.unit(spec.radius) ?? '';
  const N = rep.known(pop.people) ? rep.val(pop.people) : undefined;
  const per = N === undefined ? 1 : perDot(N);
  const dots = N === undefined ? 0 : Math.min(150, Math.round(N / per));
  const lines = [
    `Modeled as a circle of radius ${rep.value(spec.radius)}`,
    ...(spec.area ? [`A = π × ${rep.value(spec.radius, false)}² = ${rep.value(spec.area)}`] : []),
    ...(pop.density && spec.area
      ? [
          `D = N ÷ A = ${rep.value(pop.people, false)} ÷ ${rep.value(spec.area, false)} = ${rep.value(pop.density)}`,
        ]
      : []),
    ...(N !== undefined
      ? [`Each dot is ${formatNumber(per)} ${per === 1 ? 'person' : 'people'}`]
      : []),
  ];

  return (
    <View>
      <Canvas aspect={0.86}>
        {({ w, h }) => {
          const top = 8;
          const bottom = h - 30;
          const size = Math.min(w - 20, bottom - top);
          const cx = w / 2;
          const cy = top + size / 2;
          // The map spans a little past the outline's widest reach.
          const half = r * 1.4 || 1;
          const u = size / 2 / half; // px per shown unit
          const step = niceStep(2 * half, 8);
          const gridN = Math.floor(half / step);
          const outline = Array.from({ length: 121 }, (_, i) => {
            const t = (2 * Math.PI * i) / 120;
            const q = r * reach(t) * u;
            return `${i ? 'L' : 'M'} ${(cx + q * Math.cos(t)).toFixed(2)} ${(cy - q * Math.sin(t)).toFixed(2)}`;
          }).join(' ');
          const people = Array.from({ length: dots }, (_, i) => {
            const t = 2 * Math.PI * rand(i * 2 + 1);
            const q = r * reach(t) * 0.94 * rand(i * 2 + 2) ** 0.8 * u;
            return [cx + q * Math.cos(t), cy - q * Math.sin(t)] as const;
          });
          const rText = rep.label(spec.radius);
          const rFit = fitLabel(cx + (r * u) / 2, rText, chart.label, w, 'middle');
          return (
            <Svg width={w} height={h}>
              {Array.from({ length: 2 * gridN + 1 }, (_, i) => {
                const v = (i - gridN) * step * u;
                return (
                  <G key={`g${i}`}>
                    <Line
                      x1={cx + v}
                      x2={cx + v}
                      y1={top}
                      y2={top + size}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                    <Line
                      x1={cx - size / 2}
                      x2={cx + size / 2}
                      y1={cy + v}
                      y2={cy + v}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                  </G>
                );
              })}
              <Path
                d={`${outline} Z`}
                fill={c.populationLand}
                stroke={c.populationEdge}
                strokeWidth={chart.stroke}
              />
              {people.map(([x, y], i) => (
                <Circle key={`p${i}`} cx={x} cy={y} r={2.2} fill={c.chartInk} opacity={0.75} />
              ))}
              <Circle
                cx={cx}
                cy={cy}
                r={r * u}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
              />
              <Line
                x1={cx}
                y1={cy}
                x2={cx + r * u}
                y2={cy}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeHeavy}
              />
              <Circle cx={cx} cy={cy} r={4} fill={c.chartHighlight} />
              <ChartText
                x={rFit.x}
                y={cy - 8}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor={rFit.textAnchor}
                fill={c.chartHighlight}
              >
                {rText}
              </ChartText>
              <ChartText x={cx} y={h - 10} fontSize={chart.label} textAnchor="middle">
                {`Grid: ${formatNumber(step)} ${unit} squares${N !== undefined ? ` · ● = ${formatNumber(per)} ${per === 1 ? 'person' : 'people'}` : ''}`}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

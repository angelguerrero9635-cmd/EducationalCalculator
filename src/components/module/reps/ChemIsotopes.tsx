/**
 * Isotope abundance (H101 part 7): 100 atoms of an element, each isotope's share in its own
 * color with a key, and a beam from the lighter isotope's mass to the heavier one's with each
 * share as a weight at its mass, balanced on a pivot at the average atomic mass: the average is
 * nearer the more common isotope. Flat, like a chart; the atoms are lit balls.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { ChemDiagramSpec } from '@/data/modules/typesHs2d';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { averageMass } from './chemHs2d';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { reader } from './graphKit';
import { Ball, url, usePaintIds } from './paint';

type Spec = Extract<ChemDiagramSpec, { mode: 'isotopes' }>;

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const massNumber = (m: number, el: string) =>
  `${[...String(Math.round(m))].map((d) => SUP[Number(d)]).join('')}${el}`;

export function ChemIsotopes({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const ids = usePaintIds('a', 'b');
  const [M1, M2] = spec.masses.map(read) as [ReturnType<typeof read>, ReturnType<typeof read>];
  const P1 = read(spec.percents[0]);
  const p1 = Math.min(100, Math.max(0, P1.value));
  const p2 = 100 - p1;
  const known = M1.known && M2.known && P1.known;
  const avg = averageMass(M1.value, M2.value, p1);
  const names = spec.names ?? [
    massNumber(M1.value, spec.element),
    massNumber(M2.value, spec.element),
  ];
  const n1 = Math.round(p1);
  const colors = [c.chartSecond, c.chartHighlight];
  const pct = (p: number) => `${formatNumber(Number(p.toFixed(2)))}%`;

  return (
    <View>
      <Canvas aspect={(w) => Math.min(1, 330 / w)}>
        {({ w, h }) => {
          const cell = Math.min(19, (w * 0.56) / 10);
          const gx = 8;
          const gy = 8;
          const atoms = Array.from({ length: 100 }, (_, i) => {
            const [row, col] = [Math.floor(i / 10), i % 10];
            const first = i < n1;
            return (
              <Circle
                key={i}
                cx={gx + (col + 0.5) * cell}
                cy={gy + (row + 0.5) * cell}
                r={cell * 0.42}
                fill={url(first ? ids.a : ids.b)}
                stroke={c.shade}
                strokeOpacity={0.3}
                strokeWidth={0.8}
                opacity={P1.known ? 1 : 0.35}
              />
            );
          });
          // The key, beside the grid.
          const kx = gx + 10 * cell + 14;
          const key = [0, 1].map((k) => {
            const y = gy + 18 + k * 50;
            return (
              <G key={`k${k}`}>
                <Circle cx={kx + 7} cy={y - 4} r={7} fill={url(k ? ids.b : ids.a)} />
                <ChartText x={kx + 20} y={y} fontSize={chart.value} fontWeight="700">
                  {`${names[k]}, ${[M1, M2][k]!.known ? [M1, M2][k]!.text : '?'} u`}
                </ChartText>
                <ChartText x={kx + 20} y={y + 17} fontSize={chart.label} fill={c.chartMuted}>
                  {P1.known ? `${pct(k ? p2 : p1)}: ${k ? 100 - n1 : n1} of 100` : '?'}
                </ChartText>
              </G>
            );
          });
          const by = h - 58;
          const x0 = 44;
          const x1 = w - 44;
          // The lighter mass at the left end, the heavier at the right.
          const lo = Math.min(M1.value, M2.value);
          const span = Math.abs(M2.value - M1.value) || 1;
          const xAt = (m: number) => x0 + ((m - lo) / span) * (x1 - x0);
          const ends = [xAt(M1.value), xAt(M2.value)];
          const tall = Math.max(8, by - (gy + 10 * cell) - 22);
          const weight = (k: number) => {
            const p = k ? p2 : p1;
            const hh = (tall * p) / 100;
            const x = ends[k]!;
            return (
              <G key={`w${k}`}>
                <Rect
                  x={x - 15}
                  y={by - 3 - hh}
                  width={30}
                  height={hh}
                  fill={colors[k]}
                  opacity={P1.known ? 1 : 0.3}
                />
                <ChartText
                  x={x}
                  y={by - 8 - hh}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {P1.known ? pct(p) : '?'}
                </ChartText>
                <Line x1={x} y1={by} x2={x} y2={by + 6} stroke={c.chartInk} strokeWidth={1.5} />
                <ChartText x={x} y={by + 20} fontSize={chart.label} textAnchor="middle">
                  {`${[M1, M2][k]!.known ? [M1, M2][k]!.text : '?'} u`}
                </ChartText>
              </G>
            );
          };
          const ax = xAt(avg);
          const avgText = known ? `average ${formatNumber(Number(avg.toFixed(2)))} u` : 'average ?';
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Ball id={ids.a} color={colors[0]!} />
                <Ball id={ids.b} color={colors[1]!} />
              </Defs>
              {atoms}
              {key}
              <Line
                x1={x0 - 18}
                y1={by}
                x2={x1 + 18}
                y2={by}
                stroke={c.chartInk}
                strokeWidth={chart.strokeHeavy}
                strokeLinecap="round"
              />
              {weight(0)}
              {weight(1)}
              <Path
                d={`M ${ax} ${by + 2} l -11 20 l 22 0 z`}
                fill={known ? c.chartHighlight : c.chartMuted}
                opacity={known ? 1 : 0.4}
              />
              <ChartText
                {...fitLabel(ax, avgText, chart.label, w)}
                y={by + 38}
                fontSize={chart.label}
                fontWeight="700"
                fill={known ? c.chartHighlight : c.chartMuted}
              >
                {avgText}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? [
              `average = ${M1.text} × ${pct(p1)} + ${M2.text} × ${pct(p2)} = ${formatNumber(Number(((M1.value * p1) / 100).toFixed(3)))} + ${formatNumber(Number(((M2.value * p2) / 100).toFixed(3)))} = ${formatNumber(Number(avg.toFixed(3)))} u`,
              `The beam balances nearer ${p1 >= p2 ? names[0] : names[1]}, the more common isotope.`,
              ...(Math.abs(p1 - n1) > 1e-9
                ? [`The grid rounds ${pct(p1)} to ${n1} of the 100 atoms.`]
                : []),
            ].join(' · ')
          : 'Type both masses and the first isotope’s percent to find the average.'}
      </Caption>
    </View>
  );
}

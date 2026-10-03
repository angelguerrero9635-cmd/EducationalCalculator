/**
 * HC145 (round 4, group I): `linkageMap`, a genetic map. A chromosome bar with its loci at their
 * map distances to scale and a cM ruler under it; below, two homologs (one parent's alleles in
 * red, the other's in blue) crossed over where the recombinants come from: once between the
 * first two loci, or twice either side of the middle locus for a double crossover. Each strand
 * changes colour where it crosses, so the alleles read off the recombinant chromatids (A b and
 * a B). Flat. No handles: the distances come from the counts.
 */
import { View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { LinkageMapSpec } from '@/data/modules/typesHe4i';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { fig3, Ital } from './he1dText';
import { crossoverSpots, mapStep } from './he4iMath';

const SIDE = 26;
const BAR_Y = 32;
const BAR_H = 14;
const RULER_Y = 84;
const UP_Y = 150;
const LOW_Y = 180;
const H = 206;

export function LinkageMap({ spec, calc }: { spec: LinkageMapSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const ds = spec.distances.map(read);
  const known = ds.every((d) => d.known && d.value > 0);
  const d = ds.map((x) => x.value);
  const total = d.reduce((a, b) => a + b, 0);
  const far = known && d.some((x) => x > 50);
  const pos = d.reduce<number[]>((acc, x) => [...acc, acc[acc.length - 1]! + x], [0]);
  const three = spec.loci.length === 3;
  const dbl = spec.doubles !== undefined && three;
  const spots = crossoverSpots(pos, dbl);
  const L = spec.loci;
  const cm = (x: number) => `${formatNumber(Number(x.toPrecision(4)))} cM`;
  const opt = (v: string | number | undefined) => (v === undefined ? undefined : read(v));
  const [N, obs, rf] = [opt(spec.offspring), opt(spec.doubles), opt(spec.recombinant)];
  const caption = !known
    ? 'Type the map distances to place the genes.'
    : [
        ...(three
          ? [`${L[0]}–${L[2]} = ${formatNumber(d[0]!)} + ${formatNumber(d[1]!)} = ${cm(total)}`]
          : [`${L[0]}–${L[1]}: ${cm(d[0]!)}`]),
        ...(rf?.known
          ? [`RF = ${formatNumber(rf.value)}% of the offspring are recombinant: 1% is 1 cM`]
          : []),
        ...(three && N?.known
          ? [
              `Expected doubles = ${fig3(d[0]! / 100)} × ${fig3(d[1]! / 100)} × ${formatNumber(N.value)} = ${fig3((d[0]! * d[1]! * N.value) / 1e4)}`,
            ]
          : []),
        ...(three && N?.known && obs?.known
          ? (() => {
              const coc = obs.value / ((d[0]! * d[1]! * N.value) / 1e4);
              return [
                `c.o.c. = ${formatNumber(obs.value)} ÷ ${fig3((d[0]! * d[1]! * N.value) / 1e4)} = ${fig3(coc)}`,
                `I = 1 − ${fig3(coc)} = ${fig3(1 - coc)}`,
              ];
            })()
          : []),
        ...(far ? ['Over 50 cM apart, genes assort independently: RF stops at 50%.'] : []),
      ].join(' · ');

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const span = w - 2 * SIDE;
          const x = (cmAt: number) => SIDE + (total > 0 ? (cmAt / total) * span : 0);
          const step = mapStep(total);
          const ticks = known
            ? Array.from({ length: Math.floor(total / step + 1e-9) + 1 }, (_, i) => i * step)
            : [];
          /** The two strands, colour by segment: upper starts red, lower blue; each spot swaps. */
          const segs = [SIDE, ...spots.map(x), SIDE + span];
          const colorOf = (upper: boolean, k: number) =>
            (upper ? k % 2 === 0 : k % 2 === 1) ? c.bioMaternal : c.bioPaternal;
          const allele = (name: string, upper: boolean, at: number) => {
            const k = spots.filter((s) => s < pos[at]!).length;
            const mom = colorOf(upper, k) === c.bioMaternal;
            return {
              text: mom ? name.toUpperCase() : name.toLowerCase(),
              color: colorOf(upper, k),
            };
          };
          return (
            <Svg width={w} height={H}>
              <G opacity={far ? 0.45 : 1}>
                {/* The chromosome and its loci. */}
                <Rect
                  x={SIDE - 8}
                  y={BAR_Y}
                  width={span + 16}
                  height={BAR_H}
                  rx={BAR_H / 2}
                  fill={c.chartFill}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {known
                  ? pos.map((p, i) => (
                      <G key={i}>
                        <Rect x={x(p) - 2.5} y={BAR_Y} width={5} height={BAR_H} fill={c.chartInk} />
                        <ChartText
                          x={x(p)}
                          y={BAR_Y - 8}
                          fontSize={chart.emphasis}
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          <Ital text={L[i] ?? ''} size={chart.emphasis} />
                        </ChartText>
                      </G>
                    ))
                  : null}
                {known
                  ? d.map((dist, i) => (
                      <G key={i}>
                        <Line
                          x1={x(pos[i]!) + 4}
                          y1={BAR_Y + BAR_H + 10}
                          x2={x(pos[i + 1]!) - 4}
                          y2={BAR_Y + BAR_H + 10}
                          stroke={c.chartHighlight}
                          strokeWidth={chart.strokeLight}
                        />
                        <ChartText
                          x={(x(pos[i]!) + x(pos[i + 1]!)) / 2}
                          y={BAR_Y + BAR_H + 26}
                          fontSize={chart.value}
                          fontWeight="700"
                          textAnchor="middle"
                          fill={c.chartHighlight}
                        >
                          {cm(dist)}
                        </ChartText>
                      </G>
                    ))
                  : null}
                {/* The cM ruler. */}
                {known ? (
                  <G>
                    <Line
                      x1={SIDE}
                      y1={RULER_Y}
                      x2={SIDE + span}
                      y2={RULER_Y}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                    />
                    {ticks.map((t) => (
                      <G key={t}>
                        <Line
                          x1={x(t)}
                          y1={RULER_Y}
                          x2={x(t)}
                          y2={RULER_Y + 4}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                        />
                        <ChartText
                          x={x(t)}
                          y={RULER_Y + 17}
                          fontSize={chart.label}
                          textAnchor="middle"
                          fill={c.chartMuted}
                        >
                          {formatNumber(t)}
                        </ChartText>
                      </G>
                    ))}
                    <ChartText
                      x={SIDE + span}
                      y={RULER_Y - 5}
                      fontSize={chart.label}
                      textAnchor="end"
                      fill={c.chartMuted}
                    >
                      cM
                    </ChartText>
                  </G>
                ) : null}
                {/* The homologs, crossed where the recombinants come from. */}
                {known ? (
                  <G>
                    {segs.slice(0, -1).map((a, k) => {
                      const b = segs[k + 1]!;
                      const x0 = k === 0 ? a : a + 9;
                      const x1 = k === segs.length - 2 ? b : b - 9;
                      return (
                        <G key={k}>
                          <Line
                            x1={x0}
                            y1={UP_Y}
                            x2={x1}
                            y2={UP_Y}
                            stroke={colorOf(true, k)}
                            strokeWidth={5}
                            strokeLinecap="round"
                          />
                          <Line
                            x1={x0}
                            y1={LOW_Y}
                            x2={x1}
                            y2={LOW_Y}
                            stroke={colorOf(false, k)}
                            strokeWidth={5}
                            strokeLinecap="round"
                          />
                        </G>
                      );
                    })}
                    {spots.map((s, k) => (
                      <G key={`x${k}`}>
                        <Line
                          x1={x(s) - 9}
                          y1={UP_Y}
                          x2={x(s) + 9}
                          y2={LOW_Y}
                          stroke={colorOf(true, k)}
                          strokeWidth={5}
                          strokeLinecap="round"
                        />
                        <Line
                          x1={x(s) - 9}
                          y1={LOW_Y}
                          x2={x(s) + 9}
                          y2={UP_Y}
                          stroke={colorOf(false, k)}
                          strokeWidth={5}
                          strokeLinecap="round"
                        />
                      </G>
                    ))}
                    {pos.map((p, i) => {
                      const up = allele(L[i] ?? '', true, i);
                      const low = allele(L[i] ?? '', false, i);
                      return (
                        <G key={`a${i}`}>
                          <ChartText
                            x={x(p)}
                            y={UP_Y - 9}
                            fontSize={chart.value}
                            fontWeight="700"
                            textAnchor="middle"
                            fill={up.color}
                          >
                            <Ital text={up.text} size={chart.value} />
                          </ChartText>
                          <ChartText
                            x={x(p)}
                            y={LOW_Y + 21}
                            fontSize={chart.value}
                            fontWeight="700"
                            textAnchor="middle"
                            fill={low.color}
                          >
                            <Ital text={low.text} size={chart.value} />
                          </ChartText>
                        </G>
                      );
                    })}
                    <ChartText
                      x={w / 2}
                      y={UP_Y - 30}
                      fontSize={chart.label}
                      textAnchor="middle"
                      fill={c.chartMuted}
                    >
                      {dbl
                        ? 'A double crossover swaps the middle gene'
                        : 'One crossover makes the recombinants'}
                    </ChartText>
                  </G>
                ) : null}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

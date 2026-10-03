/**
 * HC142 (round 4, group I): `cellDivision` `content`. Four cells in a row, G₁, after S, after
 * meiosis I and a gamete, with their chromosomes (maternal red, paternal blue, as the
 * `cellDivision` picture and card draw them): single chromatids in G₁, duplicated after S and
 * after meiosis I (one of each pair), single again in the gamete. Every chromosome is drawn up
 * to 2n = 6; past that one pair (or one chromosome) and "× n". Under the cells, each stage's
 * chromosomes, chromatids and DNA content in c. Flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { divisionStages } from '@/data/modules/typesHe4i';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';

type Spec = Extract<Representation, { kind: 'cellDivision' }>;

/** Every chromosome is drawn up to this 2n. */
const ALL_UP_TO = 6;
const HEAD = 84;
const TOP = 22;
const ROW = 22;
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';

export function DivisionContentHe4i({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const d = read(spec.diploid);
  const known = d.known && d.value >= 2 && Number.isInteger(d.value / 2);
  const D = known ? d.value : 0;
  const n = D / 2;
  const k = spec.content!;
  const g1 = k.dna === undefined ? { value: 2, known: true } : read(k.dna);
  const stages = divisionStages(D, g1.value);
  const all = D <= ALL_UP_TO;
  const f = (x: number) => formatNumber(x);
  const cText = (x: number) => `${f(x)}c`;
  const power = `2${[...String(n)].map((ch) => SUP[Number(ch)]).join('')}`;
  const caption = known
    ? [
        `G₁: 2n = ${f(D)} chromosomes of one chromatid each${g1.known ? `, ${cText(g1.value)}` : ''}.`,
        `S copies each one: ${f(D)} chromosomes, 2 × ${f(D)} = ${f(2 * D)} chromatids${g1.known ? `, ${cText(2 * g1.value)}` : ''}.`,
        `Meiosis I parts the pairs: n = ${f(D)} ÷ 2 = ${f(n)} chromosomes, still 2 chromatids each${g1.known ? `, ${cText(g1.value)}` : ''}.`,
        `Meiosis II parts the sisters: ${f(n)} chromatids${g1.known ? `, ${cText(g1.value / 2)}` : ''}.`,
        ...(spec.combinations
          ? [`Each pair goes either way: ${power} = ${f(2 ** n)} kinds of gamete.`]
          : []),
      ].join(' · ')
    : 'Type the chromosomes in a body cell (2n) to draw them.';
  const rows: [string, (s: (typeof stages)[number]) => string | undefined][] = [
    ['Chromosomes', (s) => (known ? f(s.chromosomes) : undefined)],
    ['Chromatids', (s) => (known ? f(s.chromatids) : undefined)],
    ['DNA', (s) => (known && g1.known ? cText(s.dna) : undefined)],
  ];
  const height = TOP + 72 + 8 + rows.length * ROW + 6;
  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w }) => {
          const col = (w - HEAD) / 4;
          const R = Math.min(30, col / 2 - 6);
          const cy = TOP + 36;
          const xOf = (i: number) => HEAD + col * (i + 0.5);
          const tableY = TOP + 72 + 8;
          return (
            <Svg width={w} height={height}>
              {stages.map((s, i) => (
                <G key={s.stage}>
                  <ChartText
                    x={xOf(i)}
                    y={14}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="middle"
                    fill={c.chartInk}
                  >
                    {s.stage}
                  </ChartText>
                  <Circle
                    cx={xOf(i)}
                    cy={cy}
                    r={R}
                    fill={c.chartSurface}
                    stroke={c.chartInk}
                    strokeWidth={1.3}
                  />
                  {known ? (
                    <StageChromosomes x={xOf(i)} y={cy} stage={i} D={D} all={all} c={c} />
                  ) : null}
                  {i < 3 ? (
                    <Path
                      d={`M ${xOf(i) + col / 2 + 3} ${cy} l -7 -5 v 10 z`}
                      fill={c.chartMuted}
                    />
                  ) : null}
                </G>
              ))}
              {rows.map(([name, value], j) => {
                const y = tableY + j * ROW;
                return (
                  <G key={name}>
                    {j % 2 === 0 ? (
                      <Rect x={0} y={y} width={w} height={ROW} fill={c.chartFill} opacity={0.5} />
                    ) : null}
                    <ChartText x={4} y={y + 15} fontSize={chart.label} fill={c.chartMuted}>
                      {name}
                    </ChartText>
                    {stages.map((s, i) => {
                      const t = value(s);
                      return t ? (
                        <ChartText
                          key={i}
                          x={xOf(i)}
                          y={y + 15}
                          fontSize={chart.value}
                          fontWeight={j === 2 ? '700' : '400'}
                          textAnchor="middle"
                          fill={c.chartInk}
                        >
                          {t}
                        </ChartText>
                      ) : null;
                    })}
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

/** One chromosome, upright: one rod, or two sister chromatids joined at the centromere. */
function Rod({
  x,
  y,
  arm,
  color,
  dup,
  ink,
}: {
  x: number;
  y: number;
  arm: number;
  color: string;
  dup: boolean;
  ink: string;
}) {
  const rod = (o: number) => (
    <G key={o}>
      <Line
        x1={x + o}
        y1={y}
        x2={x + o * 1.5}
        y2={y - arm}
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <Line
        x1={x + o}
        y1={y}
        x2={x + o * 1.5}
        y2={y + arm}
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </G>
  );
  return (
    <G>
      {dup ? [rod(-1.6), rod(1.6)] : rod(0)}
      <Circle cx={x} cy={y} r={1.3} fill={ink} />
    </G>
  );
}

const ARM = [10, 8, 6.5];

/**
 * A stage's chromosomes: G₁ and after S hold both of each pair side by side (maternal, then
 * paternal), duplicated after S; after meiosis I one of each pair, duplicated; a gamete one of
 * each pair, single. Past 2n = 6, one pair (or one) and "× n" under it.
 */
function StageChromosomes({
  x,
  y,
  stage,
  D,
  all,
  c,
}: {
  x: number;
  y: number;
  stage: number;
  D: number;
  all: boolean;
  c: Palette;
}): ReactNode {
  const n = D / 2;
  const both = stage < 2;
  const dup = stage === 1 || stage === 2;
  const pairs = all ? n : 1;
  const list: { color: string; arm: number }[] = [];
  for (let p = 0; p < pairs; p++) {
    const arm = ARM[Math.min(p, ARM.length - 1)]!;
    if (both) list.push({ color: c.bioMaternal, arm }, { color: c.bioPaternal, arm });
    // One of each pair, assorting independently: maternal for even pairs.
    else list.push({ color: p % 2 === 0 ? c.bioMaternal : c.bioPaternal, arm });
  }
  const pitch = dup ? 9 : 7;
  const yy = all ? y : y - 6;
  return (
    <G>
      {list.map((r, i) => (
        <Rod
          key={i}
          x={x + (i - (list.length - 1) / 2) * pitch}
          y={yy}
          arm={r.arm}
          color={r.color}
          dup={dup}
          ink={c.chartInk}
        />
      ))}
      {all ? null : (
        <ChartText
          x={x}
          y={y + 19}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          fill={c.chartInk}
        >
          {`× ${formatNumber(n)}`}
        </ChartText>
      )}
    </G>
  );
}

/**
 * H100 `cellDivision` as a calculator picture: the chromosomes of a body cell counted from a
 * value 2n, then a gamete after meiosis (n), then an egg and a sperm joining into a zygote
 * (n + n = 2n). Each homologous pair is one maternal (red) and one paternal (blue) chromosome,
 * longest pair first; the body cell's are duplicated (two sister chromatids at the centromere,
 * as at metaphase), so its chromatids count 2 × 2n. Up to 2n = 8 every chromosome is drawn; past
 * 8 one pair (or one chromosome) is drawn and the count is written ("× 23 pairs"). Flat, like
 * the `cellDivision` card figure it matches (`layouts/divisionCard.tsx`).
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';

type Spec = Extract<Representation, { kind: 'cellDivision' }>;
type Parent = 'm' | 'p';

/** Chromosome pairs drawn one by one up to this 2n; past it one pair and the count. */
export const DIVISION_DRAWN = 8;
/** Arm length of pair k, longest first. */
const ARM = [11, 9, 7.5, 6];
const ROW_H = 150;

export function ChromosomeCount({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const d = reader(rep)(spec.diploid);
  const known = d.known && d.value >= 2 && Number.isInteger(d.value / 2);
  const D = known ? d.value : 4;
  const n = D / 2;
  const all = D <= DIVISION_DRAWN;
  const pairs = all ? n : 1;
  const fmt = (x: number) => (known ? formatNumber(x) : '?');
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const power = `2${[...String(n)].map((ch) => SUP[Number(ch)]).join('')}`;
  const caption = known
    ? [
        `Body cell: 2n = ${fmt(D)} chromosomes in ${fmt(n)} pairs, each pair one from each parent.`,
        `At metaphase each is two chromatids: 2 × ${fmt(D)} = ${fmt(2 * D)}.`,
        `Meiosis leaves one of each pair: n = ${fmt(D)} ÷ 2 = ${fmt(n)}.`,
        `Fertilization: ${fmt(n)} + ${fmt(n)} = ${fmt(D)}.`,
        `Each pair goes either way: ${power} = ${formatNumber(2 ** n)} kinds of gamete.`,
      ].join(' · ')
    : 'Type the chromosomes in a body cell (2n) to draw them.';
  return (
    <View>
      <Canvas aspect={(w) => (2 * ROW_H + 8) / w}>
        {({ w, h }) => {
          const kit = { c, pairs, all, n, known };
          return (
            <Svg width={w} height={h}>
              <G opacity={known ? 1 : 0.35}>
                {/* Row 1: a body cell, meiosis, a gamete. */}
                <CellDisc x={w * 0.25} y={62} r={54} c={c} />
                <Chromosomes x={w * 0.25} y={62} kind="body" kit={kit} />
                <Label x={w * 0.25} y={134} text={`Body cell: 2n = ${fmt(D)}`} c={c} bold />
                <Label x={w * 0.25} y={150} text={`${fmt(2 * D)} chromatids`} c={c} />
                <Arrow x0={w * 0.25 + 58} x1={w * 0.75 - 44} y={62} text="meiosis" c={c} />
                <CellDisc x={w * 0.75} y={62} r={40} c={c} />
                <Chromosomes x={w * 0.75} y={62} kind="gamete" kit={kit} />
                <Label x={w * 0.75} y={134} text={`Gamete: n = ${fmt(n)}`} c={c} bold />
                {/* Row 2: an egg and a sperm join into a zygote. */}
                <CellDisc x={w * 0.13} y={ROW_H + 62} r={Math.min(38, w * 0.11)} c={c} />
                <Chromosomes x={w * 0.13} y={ROW_H + 62} kind="egg" kit={kit} />
                <Label x={w * 0.13} y={ROW_H + 134} text={`Egg: ${fmt(n)}`} c={c} />
                <ChartText
                  x={w * 0.265}
                  y={ROW_H + 68}
                  fontSize={chart.emphasis + 4}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  +
                </ChartText>
                <CellDisc x={w * 0.4} y={ROW_H + 62} r={Math.min(38, w * 0.11)} c={c} />
                <Chromosomes x={w * 0.4} y={ROW_H + 62} kind="sperm" kit={kit} />
                <Label x={w * 0.4} y={ROW_H + 134} text={`Sperm: ${fmt(n)}`} c={c} />
                <Arrow x0={w * 0.53} x1={w * 0.75 - 58} y={ROW_H + 62} text="" c={c} />
                <CellDisc x={w * 0.75} y={ROW_H + 62} r={54} c={c} />
                <Chromosomes x={w * 0.75} y={ROW_H + 62} kind="zygote" kit={kit} />
                <Label
                  x={w * 0.75}
                  y={ROW_H + 134}
                  text={`Zygote: ${fmt(n)} + ${fmt(n)} = ${fmt(D)}`}
                  c={c}
                  bold
                />
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

function CellDisc({ x, y, r, c }: { x: number; y: number; r: number; c: Palette }) {
  return <Circle cx={x} cy={y} r={r} fill={c.chartSurface} stroke={c.chartInk} strokeWidth={1.3} />;
}

function Label({
  x,
  y,
  text,
  c,
  bold,
}: {
  x: number;
  y: number;
  text: string;
  c: Palette;
  bold?: boolean;
}) {
  return (
    <ChartText
      x={x}
      y={y}
      fontSize={bold ? chart.value : chart.label}
      fontWeight={bold ? '700' : '400'}
      textAnchor="middle"
      fill={bold ? c.chartInk : c.chartMuted}
    >
      {text}
    </ChartText>
  );
}

function Arrow({
  x0,
  x1,
  y,
  text,
  c,
}: {
  x0: number;
  x1: number;
  y: number;
  text: string;
  c: Palette;
}) {
  return (
    <G>
      <Line x1={x0} y1={y} x2={x1 - 6} y2={y} stroke={c.chartInk} strokeWidth={chart.stroke} />
      <Path d={`M ${x1} ${y} l -8 -5 l 0 10 z`} fill={c.chartInk} />
      {text ? (
        <ChartText
          x={(x0 + x1) / 2}
          y={y - 8}
          fontSize={chart.label}
          textAnchor="middle"
          fill={c.chartMuted}
        >
          {text}
        </ChartText>
      ) : null}
    </G>
  );
}

const colorOf = (p: Parent, c: Palette) => (p === 'm' ? c.bioMaternal : c.bioPaternal);

/** A chromosome at (x, y), upright: one rod, or two sister chromatids joined at the centromere. */
function Chromosome({
  x,
  y,
  arm,
  parent,
  dup,
  c,
}: {
  x: number;
  y: number;
  arm: number;
  parent: Parent;
  dup: boolean;
  c: Palette;
}) {
  const color = colorOf(parent, c);
  const rod = (o: number, k: string) => (
    <G key={k}>
      <Line
        x1={x + o}
        y1={y}
        x2={x + o * 1.5}
        y2={y - arm}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Line
        x1={x + o}
        y1={y}
        x2={x + o * 1.5}
        y2={y + arm}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </G>
  );
  return (
    <G>
      {dup ? [rod(-1.9, 'a'), rod(1.9, 'b')] : rod(0, 'a')}
      <Circle cx={x} cy={y} r={1.5} fill={c.chartInk} />
    </G>
  );
}

/**
 * The chromosomes of one cell, pair k in column k: a body cell and a zygote hold both homologs
 * (maternal above, paternal below; the body cell's duplicated), a gamete one of each pair (pairs
 * assorting independently: maternal for even k), an egg the mother's and a sperm the father's.
 * Past 2n = 8 one pair is drawn, with "× n pairs" (or "× n") under it.
 */
function Chromosomes({
  x,
  y,
  kind,
  kit,
}: {
  x: number;
  y: number;
  kind: 'body' | 'gamete' | 'egg' | 'sperm' | 'zygote';
  kit: { c: Palette; pairs: number; all: boolean; n: number; known: boolean };
}): ReactNode {
  const { c, pairs, all, n } = kit;
  const both = kind === 'body' || kind === 'zygote';
  const dup = kind === 'body';
  const pitch = both ? (pairs > 3 ? 18 : 22) : pairs > 3 ? 14 : 18;
  const xs = Array.from({ length: pairs }, (_, k) => x + (k - (pairs - 1) / 2) * pitch);
  const dy = both ? 14 : all ? 0 : -4;
  const cy = all ? y : y - (both ? 9 : 6);
  const parentOf = (k: number): Parent =>
    kind === 'egg' ? 'm' : kind === 'sperm' ? 'p' : k % 2 === 0 ? 'm' : 'p';
  const scale = both ? 1 : 0.9;
  return (
    <G>
      {xs.map((cx, k) => {
        const arm = ARM[Math.min(k, ARM.length - 1)]! * scale;
        return both ? (
          <G key={k}>
            <Chromosome x={cx} y={cy - dy} arm={arm} parent="m" dup={dup} c={c} />
            <Chromosome x={cx} y={cy + dy} arm={arm} parent="p" dup={dup} c={c} />
          </G>
        ) : (
          <Chromosome key={k} x={cx} y={cy + dy} arm={arm} parent={parentOf(k)} dup={false} c={c} />
        );
      })}
      {all ? null : (
        <ChartText
          x={x}
          y={y + (both ? 40 : 26)}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          fill={c.chartInk}
        >
          {kit.known ? `× ${formatNumber(n)}${both ? ' pairs' : ''}` : '× ?'}
        </ChartText>
      )}
    </G>
  );
}

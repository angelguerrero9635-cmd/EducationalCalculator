/**
 * The limiting reactant from grams (H101 part 4), flat like the mole map: two columns, one per
 * reactant, each its grams → ÷ molar mass → moles → × the mole ratio → the product's moles it
 * could make. The smaller of the two is lit (that reactant runs out first: the limiting
 * reactant) and carried down, × the product's molar mass, to the grams of product; the larger
 * one is dashed, "more than enough". Typed values are filled, worked ones outlined.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { MoleMapSpec } from '@/data/modules/typesHsi';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { subscript } from './chem';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { reader } from './graphKit';
import { molarMassOf } from './moles';

const BOX_H = 50;
const ROW = 96;

type State = 'given' | 'known' | 'unknown' | 'spare';

export function MoleMapLimiting({ spec, calc }: { spec: MoleMapSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const lim = spec.limiting!;
  const fp = spec.formula ? subscript(spec.formula) : 'product';
  const num = (x: number) => formatNumber(Number(x.toPrecision(4)));
  const start = calc.isExample ? calc.module.startWith : [];
  const stateOf = (x: number | string | undefined): State =>
    x === undefined || (typeof x === 'string' && !rep.known(x))
      ? 'unknown'
      : typeof x === 'string' && (calc.status(x) === 'given' || start.includes(x))
        ? 'given'
        : 'known';
  const known = (x: number | string | undefined) =>
    x === undefined ? undefined : read(x).known ? read(x).value : undefined;
  const pc = known(lim.coef);
  const Mp = known(spec.molarMass) ?? (spec.formula ? molarMassOf(spec.formula) : undefined);

  // Each reactant's column: typed values where there are any, else worked from the grams.
  const cols = lim.reactants.map((r) => {
    const M = known(r.molarMass) ?? molarMassOf(r.formula);
    const m = known(r.mass);
    const n = known(r.moles) ?? (m !== undefined && M ? m / M : undefined);
    const k = known(r.coef);
    const y = known(r.yields) ?? (n !== undefined && k && pc ? (n * pc) / k : undefined);
    return { r, f: subscript(r.formula), M, m, n, k, y };
  });
  const [y0, y1] = [cols[0]!.y, cols[1]!.y];
  const both = y0 !== undefined && y1 !== undefined;
  // The limiting reactant: the one that makes less product (the first when they tie).
  const lit = both ? (y1! < y0! - 1e-12 ? 1 : 0) : undefined;
  const tie = both && Math.abs(y0! - y1!) <= 1e-9 * Math.max(1, y0!);
  const n = known(spec.moles) ?? (lit !== undefined ? cols[lit]!.y : undefined);
  const mass = known(spec.mass) ?? (n !== undefined && Mp ? n * Mp : undefined);

  const text = (x: number | undefined, unit: string) =>
    x === undefined ? '?' : `${num(x)} ${unit}`;

  const art = (w: number, h: number): ReactNode => {
    const bw = Math.min(140, (w - 24) / 2 - 36);
    const colX = [12, w - 12 - bw];
    const rowY = (row: number) => 8 + row * ROW;
    const box = (
      key: string,
      x: number,
      y: number,
      title: string,
      value: string,
      state: State,
      strong = false,
    ) => {
      const on = state === 'given';
      return (
        <G key={key}>
          <Rect
            x={x}
            y={y}
            width={bw}
            height={BOX_H}
            rx={8}
            fill={on ? c.chartHighlight : c.card}
            stroke={state === 'unknown' || state === 'spare' ? c.chartGrid : c.chartHighlight}
            strokeWidth={strong ? chart.strokeHeavy : state === 'unknown' ? 1.2 : chart.stroke}
            strokeDasharray={state === 'unknown' || state === 'spare' ? chart.dashFine : undefined}
          />
          <ChartText
            x={x + bw / 2}
            y={y + 18}
            fontSize={chart.label}
            textAnchor="middle"
            fill={on ? c.onChartHighlight : c.chartMuted}
          >
            {title}
          </ChartText>
          <ChartText
            x={x + bw / 2}
            y={y + 39}
            fontSize={chart.emphasis + 1}
            fontWeight="700"
            textAnchor="middle"
            fill={
              on
                ? c.onChartHighlight
                : state === 'unknown' || state === 'spare'
                  ? c.chartMuted
                  : c.chartInk
            }
          >
            {value}
          </ChartText>
        </G>
      );
    };
    /** A downward arrow under a box, its factor beside it (toward the middle). */
    const down = (key: string, col: number, row: number, factor: string, on: boolean) => {
      const x = colX[col]! + bw / 2;
      const ya = rowY(row) + BOX_H + 3;
      const yb = rowY(row + 1) - 3;
      const color = on ? c.chartHighlight : c.chartMuted;
      return (
        <G key={key}>
          <Line x1={x} y1={ya} x2={x} y2={yb - 8} stroke={color} strokeWidth={chart.stroke} />
          <Path d={`M ${x} ${yb} l -5 -9 l 10 0 z`} fill={color} />
          <ChartText
            x={col === 0 ? x + 10 : x - 10}
            y={(ya + yb) / 2 + 5}
            fontSize={chart.label}
            fontWeight="700"
            textAnchor={col === 0 ? 'start' : 'end'}
            fill={color}
          >
            {factor}
          </ChartText>
        </G>
      );
    };
    const parts: ReactNode[] = [];
    cols.forEach((col, i) => {
      const x = colX[i]!;
      const mState = stateOf(col.r.mass);
      const nState =
        col.r.moles !== undefined
          ? stateOf(col.r.moles)
          : col.n === undefined
            ? 'unknown'
            : 'known';
      const yState: State =
        col.y === undefined
          ? 'unknown'
          : lit !== undefined && lit !== i && !tie
            ? 'spare'
            : 'known';
      const ratio = `× ${col.k === undefined || pc === undefined ? '?' : `${formatNumber(pc)}/${formatNumber(col.k)}`}`;
      parts.push(
        box(`m${i}`, x, rowY(0), `Mass of ${col.f}`, text(col.m, 'g'), mState),
        down(
          `a${i}`,
          i,
          0,
          `÷ ${col.M === undefined ? 'M' : formatNumber(col.M)} g/mol`,
          col.n !== undefined,
        ),
        box(`n${i}`, x, rowY(1), `Moles of ${col.f}`, text(col.n, 'mol'), nState),
        down(`b${i}`, i, 1, ratio, col.y !== undefined),
        box(`y${i}`, x, rowY(2), `${fp} from ${col.f}`, text(col.y, 'mol'), yState, lit === i),
      );
      if (yState === 'spare')
        parts.push(
          <ChartText
            key={`s${i}`}
            {...fitLabel(x + bw / 2, 'more than enough', chart.label, w)}
            y={rowY(2) + BOX_H + 16}
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            more than enough
          </ChartText>,
        );
    });
    // The smaller yield carried down to the product's grams.
    const bx = (w - bw) / 2;
    const y3 = rowY(3) + 14;
    if (lit !== undefined) {
      const x0 = colX[lit]! + bw / 2;
      const ya = rowY(2) + BOX_H + 3;
      const color = c.chartHighlight;
      parts.push(
        <G key="carry">
          <Path
            d={`M ${x0} ${ya} L ${x0} ${y3 + BOX_H / 2} L ${lit === 0 ? bx - 9 : bx + bw + 9} ${y3 + BOX_H / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={chart.stroke}
            strokeLinejoin="round"
          />
          <Path
            d={
              lit === 0
                ? `M ${bx - 1} ${y3 + BOX_H / 2} l -9 -5 l 0 10 z`
                : `M ${bx + bw + 1} ${y3 + BOX_H / 2} l 9 -5 l 0 10 z`
            }
            fill={color}
          />
          <ChartText
            {...fitLabel(
              x0 + (lit === 0 ? 10 : -10),
              `× ${Mp === undefined ? 'M' : formatNumber(Mp)}`,
              chart.label,
              w,
              lit === 0 ? 'start' : 'end',
            )}
            y={ya + 20}
            fontSize={chart.label}
            fontWeight="700"
            fill={color}
          >
            {`× ${Mp === undefined ? 'M' : formatNumber(Mp)}`}
          </ChartText>
        </G>,
      );
    }
    parts.push(
      box(
        'p',
        bx,
        y3,
        `Mass of ${fp}`,
        text(mass, 'g'),
        mass === undefined ? 'unknown' : stateOf(spec.mass) === 'given' ? 'given' : 'known',
      ),
    );
    return (
      <Svg width={w} height={h}>
        {parts}
      </Svg>
    );
  };

  const limitingName = lit !== undefined ? cols[lit]!.f : undefined;
  return (
    <View>
      <Canvas aspect={(w) => (8 + 3 * ROW + 14 + BOX_H + 4) / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>
        {both
          ? [
              ...cols.map(
                (col) =>
                  `${text(col.m, 'g')} ÷ ${col.M === undefined ? 'M' : formatNumber(col.M)} g/mol = ${text(col.n, 'mol')} ${col.f} · ${text(col.n, 'mol')} × ${pc === undefined ? '?' : formatNumber(pc)}/${col.k === undefined ? '?' : formatNumber(col.k)} = ${text(col.y, 'mol')} ${fp}`,
              ),
              tie
                ? 'Both make the same amount: neither is left over.'
                : `${limitingName} makes less ${fp}, so ${limitingName} runs out first: it is the limiting reactant.`,
              mass !== undefined && n !== undefined && Mp !== undefined
                ? `${fp} made: ${num(n)} mol × ${formatNumber(Mp)} g/mol = ${num(mass)} g.`
                : undefined,
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Type both masses to see which reactant runs out first.'}
      </Caption>
    </View>
  );
}

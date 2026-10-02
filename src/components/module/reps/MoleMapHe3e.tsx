/**
 * The mole map with college boxes (HC74, `typesHe3e.ts`), flat: a chain from the first
 * substance's outer box (a solution, C × V → mol; a gas; or its mass) to its moles, across the
 * mole ratio to the second substance's moles, and down to its outer box (a solution, mol ÷ C →
 * V; a gas, V = nRT ÷ P; or its mass). Each arrow carries its factor with the page's numbers; a
 * "?" leaves its box and the factors that need it blank.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { MoleMapSpec } from '@/data/modules/typesHsi';
import { formatNumber, scientific } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { subscript } from './chem';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { gasVolume, litres, R_LATM } from './moleHe3eMath';
import { molarMassOf } from './moles';

const ROW = 112;
const BOX = [52, 66];

type Read = ReturnType<typeof reader>;
type Val = ReturnType<Read>;

const num = (x: number) =>
  Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-3)
    ? scientific(Number(x.toPrecision(4)))
    : formatNumber(Number(x.toPrecision(4)));

interface Outer {
  title: string;
  lines: string[];
  known: boolean;
  /** The arrow's factor (bold) and what it means (under it). */
  factor: string;
  meaning: string;
  /** The caption's working line. */
  work?: string;
}

export function MoleMapHe3e({ spec, calc }: { spec: MoleMapSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const opt = (x: number | string | undefined): Val | undefined =>
    x === undefined ? undefined : read(x);
  /** A typed value as typed; a worked-out one to 4 figures. */
  const shown = (x: number | string, r: Val) =>
    typeof x === 'string' && !rep.typed(x) ? num(r.value) : r.text;
  const unitOf = (x: number | string) => (typeof x === 'string' ? rep.unit(x) : undefined);
  const s2 = spec.second;
  const f1 = spec.formula ? subscript(spec.formula) : 'the reactant';
  const f2 = s2?.formula ? subscript(s2.formula) : 'the product';
  const n1 = read(spec.moles);
  const n2 = s2 ? read(s2.moles) : undefined;
  const ratio = s2?.ratio.map((x) => read(x));
  const gasOf = spec.gas ? (spec.gas.of ?? 'second') : undefined;

  /** A substance's outer box: its solution, its gas, or its mass. */
  const outer = (which: 'first' | 'second'): Outer | undefined => {
    const name = which === 'first' ? f1 : f2;
    const n = which === 'first' ? n1 : n2;
    const sol = spec.solution?.[which];
    if (sol) {
      const C = read(sol.molarity);
      const V = read(sol.volume);
      const L = V.known ? litres(V.value, unitOf(sol.volume)) : undefined;
      const vText = V.known ? `${shown(sol.volume, V)} ${unitOf(sol.volume) ?? 'L'}` : '?';
      return {
        title: `${name} solution`,
        lines: [C.known ? `${C.text} M` : '? M', vText],
        known: C.known && V.known,
        factor:
          which === 'first'
            ? `× ${L !== undefined ? num(L) : '?'} L`
            : `÷ ${C.known ? C.text : '?'} M`,
        meaning: which === 'first' ? 'n = C × V' : 'V = n ÷ C',
        work:
          C.known && L !== undefined
            ? which === 'first'
              ? `n(${name}) = ${C.text} M × ${num(L)} L = ${num(C.value * L)} mol.`
              : n?.known
                ? `V = ${num(n.value)} mol ÷ ${C.text} M = ${num(n.value / C.value)} L${unitOf(sol.volume) === 'mL' ? ` = ${num((n.value / C.value) * 1000)} mL` : ''}.`
                : undefined
            : undefined,
      };
    }
    const g = spec.gas;
    if (g && gasOf === which) {
      const T = read(g.temperature);
      const P = read(g.pressure);
      const V = read(g.volume);
      const R = g.R === undefined ? R_LATM : read(g.R).value;
      const Rtext = g.R === undefined ? '0.08206' : read(g.R).text;
      return {
        title: `${name} gas`,
        lines: [
          V.known ? `${shown(g.volume, V)} L` : '? L',
          `${T.known ? T.text : '?'} K, ${P.known ? P.text : '?'} atm`,
        ],
        known: V.known,
        factor: '× RT ÷ P',
        meaning: `R = ${Rtext}`,
        work:
          n?.known && T.known && P.known
            ? `V = nRT ÷ P = ${num(n.value)} × ${Rtext} × ${T.text} ÷ ${P.text} = ${num(gasVolume(n.value, T.value, P.value, R))} L.`
            : undefined,
      };
    }
    const mass = which === 'first' ? spec.mass : s2?.mass;
    if (mass === undefined) return undefined;
    const mr = read(mass);
    const Mx = which === 'first' ? spec.molarMass : s2?.molarMass;
    const formula = which === 'first' ? spec.formula : s2?.formula;
    const M = Mx !== undefined ? opt(Mx) : undefined;
    const Mv = M?.known ? M.value : formula ? molarMassOf(formula) : undefined;
    const Mt = M?.known ? M.text : Mv !== undefined ? formatNumber(Mv) : '?';
    return {
      title: `Mass of ${name}`,
      lines: [mr.known ? `${mr.text} g` : '? g'],
      known: mr.known,
      factor: which === 'first' ? `÷ ${Mt} g/mol` : `× ${Mt} g/mol`,
      meaning: which === 'first' ? 'n = m ÷ M' : 'm = n × M',
      work:
        mr.known && Mv !== undefined
          ? which === 'first'
            ? `n(${name}) = ${mr.text} g ÷ ${Mt} g/mol = ${num(mr.value / Mv)} mol.`
            : n?.known
              ? `m = ${num(n.value)} mol × ${Mt} g/mol = ${num(n.value * Mv)} g.`
              : undefined
          : undefined,
    };
  };
  const top = outer('first');
  const bottom = s2 ? outer('second') : undefined;
  const height = 12 + 2 * ROW + BOX[1]!;

  const art = (w: number): ReactNode => {
    const bw = Math.min(140, (w - 24) / 2 - 34);
    const colX = [12, w - 12 - bw];
    const rowY = (r: number) => 8 + r * ROW;
    const boxH = (o?: Outer) => (o && o.lines.length > 1 ? BOX[1]! : BOX[0]!);
    const box = (
      key: string,
      col: number,
      row: number,
      title: string,
      lines: string[],
      known: boolean,
      given: boolean,
    ) => {
      const x = colX[col]!;
      const y = rowY(row);
      const h = lines.length > 1 ? BOX[1]! : BOX[0]!;
      return (
        <G key={key}>
          <Rect
            x={x}
            y={y}
            width={bw}
            height={h}
            rx={8}
            fill={given ? c.chartHighlight : c.card}
            stroke={known ? c.chartHighlight : c.chartGrid}
            strokeWidth={known ? chart.stroke : 1.2}
            strokeDasharray={known ? undefined : chart.dashFine}
          />
          <ChartText
            x={x + bw / 2}
            y={y + 18}
            fontSize={chart.label}
            textAnchor="middle"
            fill={given ? c.onChartHighlight : c.chartMuted}
          >
            {title}
          </ChartText>
          {lines.map((t, i) => (
            <ChartText
              key={i}
              x={x + bw / 2}
              y={y + 38 + i * 18}
              fontSize={i === 0 ? chart.emphasis + 1 : chart.value}
              fontWeight={i === 0 ? '700' : '400'}
              textAnchor="middle"
              fill={given ? c.onChartHighlight : known ? c.chartInk : c.chartMuted}
            >
              {t}
            </ChartText>
          ))}
        </G>
      );
    };
    const vArrow = (
      key: string,
      col: number,
      y0: number,
      y1: number,
      a: string,
      b: string,
      lit: boolean,
    ) => {
      const x = colX[col]! + bw / 2;
      const color = lit ? c.chartHighlight : c.chartMuted;
      const side = col === 0 ? 1 : -1;
      return (
        <G key={key}>
          <Line x1={x} y1={y0 + 8} x2={x} y2={y1 - 8} stroke={color} strokeWidth={chart.stroke} />
          <Path d={`M ${x} ${y1} l -5 -9 l 10 0 z`} fill={color} />
          <ChartText
            x={x + side * 10}
            y={(y0 + y1) / 2 - 3}
            fontSize={chart.label}
            fontWeight="700"
            textAnchor={side > 0 ? 'start' : 'end'}
            fill={color}
          >
            {a}
          </ChartText>
          <ChartText
            x={x + side * 10}
            y={(y0 + y1) / 2 + 13}
            fontSize={chart.label}
            textAnchor={side > 0 ? 'start' : 'end'}
            fill={color}
          >
            {b}
          </ChartText>
        </G>
      );
    };
    const typed = (x: number | string | undefined) =>
      typeof x === 'string' &&
      rep.known(x) &&
      (calc.status(x) === 'given' || x === calc.module.startWith[0]);
    const sol1 = spec.solution?.first;
    const g1 = gasOf === 'first' ? spec.gas : undefined;
    const topGiven = sol1 ? typed(sol1.molarity) : g1 ? typed(g1.volume) : typed(spec.mass);
    const yMoles = rowY(1);
    const yTopEnd = rowY(0) + boxH(top);
    const moleH = BOX[0]!;
    return (
      <Svg width={w} height={height}>
        {top ? box('top', 0, 0, top.title, top.lines, top.known, topGiven) : null}
        {top
          ? vArrow('a1', 0, yTopEnd + 2, yMoles - 2, top.factor, top.meaning, top.known && n1.known)
          : null}
        {box(
          'n1',
          0,
          1,
          `Moles of ${f1}`,
          [n1.known ? `${num(n1.value)} mol` : '? mol'],
          n1.known,
          typed(spec.moles),
        )}
        {s2 && n2 ? (
          <G>
            {box(
              'n2',
              1,
              1,
              `Moles of ${f2}`,
              [n2.known ? `${num(n2.value)} mol` : '? mol'],
              n2.known,
              false,
            )}
            {(() => {
              const y = yMoles + moleH / 2;
              const x0 = colX[0]! + bw + 4;
              const x1 = colX[1]! - 4;
              const lit = n1.known && n2.known;
              const color = lit ? c.chartHighlight : c.chartMuted;
              const rt = ratio?.map((r) => (r.known ? r.text : '?'));
              return (
                <G>
                  <Line
                    x1={x0}
                    y1={y}
                    x2={x1 - 8}
                    y2={y}
                    stroke={color}
                    strokeWidth={chart.stroke}
                  />
                  <Path d={`M ${x1} ${y} l -9 -5 l 0 10 z`} fill={color} />
                  <ChartText
                    x={(x0 + x1) / 2}
                    y={y - 8}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="middle"
                    fill={color}
                  >
                    {`× ${rt?.[1]} ÷ ${rt?.[0]}`}
                  </ChartText>
                  <ChartText
                    x={(x0 + x1) / 2}
                    y={y + 19}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={color}
                  >
                    ratio
                  </ChartText>
                </G>
              );
            })()}
            {bottom
              ? vArrow(
                  'a2',
                  1,
                  yMoles + moleH + 2,
                  rowY(2) - 2,
                  bottom.factor,
                  bottom.meaning,
                  n2.known && bottom.known,
                )
              : null}
            {bottom ? box('bottom', 1, 2, bottom.title, bottom.lines, bottom.known, false) : null}
          </G>
        ) : null}
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => height / w}>{({ w }) => art(w)}</Canvas>
      <Caption>
        {n1.known
          ? [
              top?.work,
              s2 && ratio?.every((r) => r.known)
                ? `Mole ratio: n(${f2}) = ${num(n1.value)} × ${ratio[1]!.text} ÷ ${ratio[0]!.text} = ${num((n1.value * ratio[1]!.value) / ratio[0]!.value)} mol.`
                : undefined,
              bottom?.work,
              'Every path goes through moles: the filled box is the value given.',
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Type the amounts you know to work out the others.'}
      </Caption>
    </View>
  );
}

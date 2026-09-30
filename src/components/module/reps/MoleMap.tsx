/**
 * The mole map (H50), flat: the moles of a substance in the middle, its mass above, its
 * particles below and the volume of a gas at STP beside it, each joined by an arrow carrying its
 * factor (the molar mass, 6.022 × 10²³, 22.4 L). The value the student typed is filled; values
 * worked from it are outlined, and the arrows between known values are lit. With `second`, the
 * mole ratio carries the moles over to a second substance and its mass.
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
import { AVOGADRO, MOLAR_VOLUME, molarMassOf } from './moles';

const BOX_H = 52;
const ROW = 108;

interface Box {
  key: string;
  title: string;
  text: string;
  state: 'given' | 'known' | 'unknown';
  col: 0 | 1;
  row: 0 | 1 | 2;
}

export function MoleMap({ spec, calc }: { spec: MoleMapSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const f = spec.formula ? subscript(spec.formula) : 'the substance';
  const num = (x: number) =>
    Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-3)
      ? scientific(Number(x.toPrecision(4)))
      : formatNumber(Number(x.toPrecision(4)));
  const M = spec.molarMass !== undefined ? read(spec.molarMass) : undefined;
  const Mval = M?.known ? M.value : spec.formula ? molarMassOf(spec.formula) : undefined;
  const Mtext = Mval === undefined ? 'M' : `${formatNumber(Mval)} g/mol`;
  const value = (x: number | string | undefined, unit: string, sci = false) => {
    if (x === undefined) return '?';
    const r = read(x);
    if (!r.known) return '?';
    return `${sci ? num(r.value) : r.text} ${unit}`.trim();
  };
  // The value typed is the given one; in the example, the first value the page starts from.
  const start = calc.isExample ? calc.module.startWith[0] : undefined;
  const st = (x: number | string | undefined): Box['state'] =>
    x === undefined
      ? 'unknown'
      : typeof x === 'number'
        ? 'known'
        : !rep.known(x)
          ? 'unknown'
          : calc.status(x) === 'given' || x === start
            ? 'given'
            : 'known';

  const boxes: Box[] = [
    {
      key: 'n',
      title: `Moles of ${f}`,
      text: value(spec.moles, 'mol'),
      state: st(spec.moles),
      col: 0,
      row: 1,
    },
  ];
  if (spec.mass !== undefined)
    boxes.push({
      key: 'm',
      title: `Mass of ${f}`,
      text: value(spec.mass, 'g'),
      state: st(spec.mass),
      col: 0,
      row: 0,
    });
  if (spec.particles !== undefined)
    boxes.push({
      key: 'N',
      title: 'Particles',
      text: value(spec.particles, '', true),
      state: st(spec.particles),
      col: 0,
      row: 2,
    });
  const s2 = spec.second;
  const f2 = s2?.formula ? subscript(s2.formula) : 'the product';
  if (s2) {
    boxes.push({
      key: 'n2',
      title: `Moles of ${f2}`,
      text: value(s2.moles, 'mol'),
      state: st(s2.moles),
      col: 1,
      row: 1,
    });
    if (s2.mass !== undefined)
      boxes.push({
        key: 'm2',
        title: `Mass of ${f2}`,
        text: value(s2.mass, 'g'),
        state: st(s2.mass),
        col: 1,
        row: 0,
      });
  } else if (spec.volume !== undefined)
    boxes.push({
      key: 'V',
      title: 'Gas at STP',
      text: value(spec.volume, 'L'),
      state: st(spec.volume),
      col: 1,
      row: 1,
    });
  const rows = spec.particles !== undefined ? 3 : 2;
  const M2 = s2?.molarMass !== undefined ? read(s2.molarMass) : undefined;
  const M2val = M2?.known ? M2.value : s2?.formula ? molarMassOf(s2.formula) : undefined;
  const ratio = s2 ? s2.ratio.map((x) => read(x)) : undefined;

  const art = (w: number, h: number): ReactNode => {
    const bw = Math.min(130, (w - 24) / 2 - 44);
    const colX = [12, w - 12 - bw];
    const rowY = (r: number) => 10 + r * ROW;
    const at = (k: string) => boxes.find((b) => b.key === k);
    const lit = (a: string, b: string) => at(a)?.state !== 'unknown' && at(b)?.state !== 'unknown';
    const arrowColor = (a: string, b: string) => (lit(a, b) ? c.chartHighlight : c.chartMuted);
    const vArrow = (a: string, b: string, col: 0 | 1, r0: number, top: string, bottom: string) => {
      if (!at(a) || !at(b)) return null;
      const x = colX[col]! + bw / 2;
      const y0 = rowY(r0) + BOX_H + 4;
      const y1 = rowY(r0 + 1) - 4;
      const color = arrowColor(a, b);
      return (
        <G key={`${a}${b}`}>
          <Line x1={x} y1={y0 + 8} x2={x} y2={y1 - 8} stroke={color} strokeWidth={chart.stroke} />
          <Path d={`M ${x} ${y0} l -5 9 l 10 0 z`} fill={color} />
          <Path d={`M ${x} ${y1} l -5 -9 l 10 0 z`} fill={color} />
          <ChartText
            x={col === 0 ? x + 10 : x - 10}
            textAnchor={col === 0 ? 'start' : 'end'}
            y={(y0 + y1) / 2 - 3}
            fontSize={chart.label}
            fontWeight="700"
            fill={color}
          >
            {top}
          </ChartText>
          <ChartText
            x={col === 0 ? x + 10 : x - 10}
            textAnchor={col === 0 ? 'start' : 'end'}
            y={(y0 + y1) / 2 + 13}
            fontSize={chart.label}
            fill={color}
          >
            {bottom}
          </ChartText>
        </G>
      );
    };
    const hArrow = (a: string, b: string, top: string, bottom: string) => {
      if (!at(a) || !at(b)) return null;
      const y = rowY(1) + BOX_H / 2;
      const x0 = colX[0]! + bw + 4;
      const x1 = colX[1]! - 4;
      const color = arrowColor(a, b);
      return (
        <G key={`${a}${b}`}>
          <Line x1={x0 + 8} y1={y} x2={x1 - 8} y2={y} stroke={color} strokeWidth={chart.stroke} />
          <Path d={`M ${x0} ${y} l 9 -5 l 0 10 z`} fill={color} />
          <Path d={`M ${x1} ${y} l -9 -5 l 0 10 z`} fill={color} />
          <ChartText
            x={(x0 + x1) / 2}
            y={y - 8}
            fontSize={chart.label}
            fontWeight="700"
            textAnchor="middle"
            fill={color}
          >
            {top}
          </ChartText>
          <ChartText
            x={(x0 + x1) / 2}
            y={y + 19}
            fontSize={chart.label}
            textAnchor="middle"
            fill={color}
          >
            {bottom}
          </ChartText>
        </G>
      );
    };
    const ratioText = ratio?.map((r) => (r.known ? r.text : '?'));
    return (
      <Svg width={w} height={h}>
        {vArrow('m', 'n', 0, 0, `÷ ${Mtext}`, `× ${Mtext}`)}
        {vArrow('n', 'N', 0, 1, '× 6.022 × 10²³', '÷ 6.022 × 10²³')}
        {s2
          ? vArrow(
              'm2',
              'n2',
              1,
              0,
              `÷ ${M2val === undefined ? 'M' : `${formatNumber(M2val)} g/mol`}`,
              '× molar mass',
            )
          : null}
        {s2
          ? hArrow('n', 'n2', `× ${ratioText?.[1]} ÷ ${ratioText?.[0]}`, 'mole ratio')
          : hArrow('n', 'V', '× 22.4 L/mol', '÷ 22.4 L/mol')}
        {boxes.map((b) => {
          const x = colX[b.col]!;
          const y = rowY(b.row);
          const on = b.state === 'given';
          return (
            <G key={b.key}>
              <Rect
                x={x}
                y={y}
                width={bw}
                height={BOX_H}
                rx={8}
                fill={on ? c.chartHighlight : c.card}
                stroke={b.state === 'unknown' ? c.chartGrid : c.chartHighlight}
                strokeWidth={b.state === 'unknown' ? 1.2 : chart.stroke}
                strokeDasharray={b.state === 'unknown' ? chart.dashFine : undefined}
              />
              <ChartText
                x={x + bw / 2}
                y={y + 19}
                fontSize={chart.label}
                textAnchor="middle"
                fill={on ? c.onChartHighlight : c.chartMuted}
              >
                {b.title}
              </ChartText>
              <ChartText
                x={x + bw / 2}
                y={y + 40}
                fontSize={chart.emphasis + 1}
                fontWeight="700"
                textAnchor="middle"
                fill={on ? c.onChartHighlight : b.state === 'unknown' ? c.chartMuted : c.chartInk}
              >
                {b.text}
              </ChartText>
            </G>
          );
        })}
      </Svg>
    );
  };

  const n = read(spec.moles);
  return (
    <View>
      <Canvas aspect={(w) => (20 + (rows - 1) * ROW + BOX_H) / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>
        {n.known
          ? [
              spec.mass !== undefined && Mval !== undefined
                ? `Mass = ${n.text} mol × ${formatNumber(Mval)} g/mol = ${num(n.value * Mval)} g.`
                : undefined,
              spec.particles !== undefined
                ? `Particles = ${n.text} mol × 6.022 × 10²³ = ${num(n.value * AVOGADRO)}.`
                : undefined,
              spec.volume !== undefined && !s2
                ? `Volume at STP = ${n.text} mol × 22.4 L/mol = ${num(n.value * MOLAR_VOLUME)} L.`
                : undefined,
              s2 && ratio?.every((r) => r.known)
                ? `Mole ratio: ${n.text} × ${ratio[1]!.text} ÷ ${ratio[0]!.text} = ${num((n.value * ratio[1]!.value) / ratio[0]!.value)} mol of ${f2}.`
                : undefined,
              'Every path goes through moles: the filled box is the value given.',
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Type one amount to work out the others.'}
      </Caption>
    </View>
  );
}

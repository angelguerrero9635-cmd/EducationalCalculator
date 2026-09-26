import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { placeParts } from '@/data/modules/helpers';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'areaModel' }>;

/** What the boxes show, whichever way the module gave it. */
interface Model {
  top: string[];
  side: string[];
  /** Sizes for the widths and heights (the bigger part bigger). */
  topSize: number[];
  sideSize: number[];
  /** Box (i across, j down): the multiplication on one line, the product under it. */
  box: (i: number, j: number) => [string, string];
  caption: string;
  /** A narrow box after the last column: what is left over in a division. */
  remainder?: string;
  steppers: string[];
  faded: boolean;
}

/** A number without floating-point dust: 0.1 × 0.3 is 0.03. */
const fmt = (x: number) => formatNumber(Number(x.toFixed(9)));

function modelOf(spec: Spec, rep: ReturnType<typeof useRep>): Model {
  const val = (id: string) => (rep.known(id) ? Math.max(0, rep.shown(id)) : 0);
  if ('factors' in spec) {
    const [a, b] = spec.factors.map(val) as [number, number];
    const tops = placeParts(a);
    const sides = placeParts(b);
    const products = sides.flatMap((s) => tops.map((t) => t * s));
    return {
      top: tops.map(fmt),
      side: sides.map(fmt),
      topSize: tops,
      sideSize: sides,
      box: (i, j) => [`${fmt(tops[i]!)} × ${fmt(sides[j]!)}`, fmt(tops[i]! * sides[j]!)],
      caption: `${fmt(a)} × ${fmt(b)}: ${products.map(fmt).join(' + ')} = ${rep.value(spec.total)}.`,
      steppers: [...spec.factors],
      faded: !spec.factors.every(rep.known),
    };
  }
  if ('divide' in spec) {
    const d = spec.divide;
    const [n, s, q] = [val(d.dividend), val(d.divisor), val(d.quotient)];
    const r = d.remainder ? val(d.remainder) : 0;
    const parts = placeParts(q);
    const amounts = parts.map((p) => p * s);
    return {
      top: parts.map(fmt),
      side: [fmt(s)],
      topSize: parts,
      sideSize: [1],
      box: (i) => [`${fmt(s)} × ${fmt(parts[i]!)}`, fmt(amounts[i]!)],
      remainder: d.remainder ? fmt(r) : undefined,
      caption:
        `${amounts.map(fmt).join(' + ')}${r ? ` + ${fmt(r)} left over` : ''} = ${fmt(n)}. ` +
        `${fmt(n)} ÷ ${fmt(s)} = ${parts.map(fmt).join(' + ')} = ${fmt(q)}` +
        `${r ? `, remainder ${fmt(r)}` : ''}.`,
      steppers: [d.dividend, d.divisor],
      faded: ![d.dividend, d.divisor].every(rep.known),
    };
  }
  return {
    top: spec.top.map((id) => rep.value(id)),
    side: spec.side.map((id) => rep.value(id)),
    topSize: spec.top.map(val),
    sideSize: spec.side.map(val),
    box: (i, j) => {
      const id = spec.parts[j]?.[i];
      return id
        ? [`${rep.value(spec.top[i]!)} × ${rep.value(spec.side[j]!)}`, rep.value(id)]
        : ['', ''];
    },
    caption: `${spec.parts.flatMap((row) => row.map((id) => rep.value(id))).join(' + ')} = ${rep.value(spec.total)}.`,
    steppers: [...spec.top, ...spec.side],
    faded: ![...spec.top, ...spec.side].every(rep.known),
  };
}

/**
 * The area model: one factor broken into place-value parts along the top, the other down the
 * side, and each part product written in its box. Boxes are drawn wide enough to read, not
 * to scale (a textbook area model), with the bigger part bigger. For a division the divisor
 * is down the side, the partial quotients along the top and the remainder in a box beside.
 */
export function AreaModel({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const m = modelOf(spec, rep);
  // Widths: each part gets at least 36% so its label fits at a readable size; the rest by size.
  const share = (xs: number[]) => {
    const sum = xs.reduce((a, b) => a + b, 0) || 1;
    const raw = xs.map((x) => Math.max(0.36, x / sum));
    const total = raw.reduce((a, b) => a + b, 0);
    return raw.map((x) => x / total);
  };
  const cols = share(m.topSize);
  const rows = share(m.sideSize);

  return (
    <View>
      {/* Boxes are read, not measured: 0.22 of the width per row keeps two rows on a phone screen. */}
      <Canvas aspect={(w) => Math.min(0.75, (0.22 * m.side.length + 0.14) * (390 / w))}>
        {({ w, h }) => {
          const left = 44;
          const top = 26;
          const extra = m.remainder !== undefined ? 64 : 0;
          const width = w - left - 12 - extra;
          const height = h - top - 8;
          let x = left;
          const xs = cols.map((f) => {
            const at = x;
            x += f * width;
            return [at, f * width] as const;
          });
          let y = top;
          const ys = rows.map((f) => {
            const at = y;
            y += f * height;
            return [at, f * height] as const;
          });
          return (
            <Svg width={w} height={h} opacity={m.faded ? 0.4 : 1}>
              {xs.map(([cx, cw], i) => (
                <ChartText
                  key={`t${i}`}
                  x={cx + cw / 2}
                  y={top - 8}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {m.top[i]!}
                </ChartText>
              ))}
              {ys.map(([cy, ch], j) => (
                <ChartText
                  key={`s${j}`}
                  x={left - 8}
                  y={cy + ch / 2 + 5}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="end"
                >
                  {m.side[j]!}
                </ChartText>
              ))}
              {ys.flatMap(([cy, ch], j) =>
                xs.map(([cx, cw], i) => (
                  <Rect
                    key={`r${i}${j}`}
                    x={cx}
                    y={cy}
                    width={cw}
                    height={ch}
                    fill={(i + j) % 2 === 0 ? c.chartFill : c.chartSurface}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                )),
              )}
              {ys.flatMap(([cy, ch], j) =>
                xs.map(([cx, cw], i) => {
                  const [times, product] = m.box(i, j);
                  return [
                    <ChartText
                      key={`m${i}${j}`}
                      x={cx + cw / 2}
                      y={cy + ch / 2 - 6}
                      fontSize={chart.small}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {times}
                    </ChartText>,
                    <ChartText
                      key={`p${i}${j}`}
                      x={cx + cw / 2}
                      y={cy + ch / 2 + 12}
                      fontSize={cw > 90 ? chart.emphasis : chart.value}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {product}
                    </ChartText>,
                  ];
                }),
              )}
              {m.remainder !== undefined ? (
                <>
                  <Rect
                    x={x + 10}
                    y={top}
                    width={extra - 10}
                    height={height}
                    fill="none"
                    stroke={c.chartMuted}
                    strokeWidth={chart.stroke}
                    strokeDasharray={chart.dash}
                  />
                  <ChartText
                    x={x + 10 + (extra - 10) / 2}
                    y={top - 8}
                    fontSize={chart.small}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    left over
                  </ChartText>
                  <ChartText
                    x={x + 10 + (extra - 10) / 2}
                    y={top + height / 2 + 5}
                    fontSize={chart.emphasis}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {m.remainder}
                  </ChartText>
                </>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{m.caption}</Caption>
      <Steppers
        calc={calc}
        items={m.steppers.map((id, _, all) => ({
          var: id,
          steps: [rep.variable(id).multipleOf ?? rep.variable(id).step ?? 1],
          pin: all.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}

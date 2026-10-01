import { View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { PascalTriangleSpec } from '@/data/modules/typesHsb';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { expansion, pascalRows, slotsOf } from './pascal';
import { FractionRow, fractionHeight, fractionOf } from './PascalFraction';

const fmt = (x: number) => formatNumber(x);
const sup = (e: number) => [...String(e)].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('');

/**
 * Pascal's triangle with row n tinted and C(n, k) lit (the two entries above it that add to it
 * marked), and counting slots: n × (n − 1) × … for r places, divided by r! for a combination.
 * Flat and exact: every entry is worked out, never typed.
 */
export function PascalTriangle({ spec, calc }: { spec: PascalTriangleSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const get = (v: number | string | undefined) =>
    v === undefined ? undefined : typeof v === 'number' ? v : rep.shown(v);
  const known = (v: number | string | undefined) => typeof v !== 'string' || rep.known(v);
  const n = Math.round(get(spec.n) ?? 0);
  const k = spec.k === undefined ? undefined : Math.round(get(spec.k)!);
  const showTriangle = spec.triangle !== false;
  const R = Math.min(12, Math.max(spec.rows ?? 6, n));
  const rows = pascalRows(R);
  const inTriangle = n >= 0 && n <= R;
  const kIn = k !== undefined && k >= 0 && k <= n;
  const r = spec.slots ? Math.round(get(spec.slots.r) ?? 0) : 0;
  const slots = spec.slots ? slotsOf(n, r, !!spec.slots.choose) : undefined;
  const slotsFit = !!slots && r >= 0 && r <= n;
  const allKnown =
    known(spec.n) &&
    known(spec.k) &&
    known(spec.slots?.r) &&
    known(spec.fraction?.n) &&
    known(spec.fraction?.k);
  // H97: C(a, r) over the lit C(n, k), a probability as a fraction of two counts.
  const frac = fractionOf(spec, get, n, k);

  // ── Caption ──
  const lines: string[] = [];
  if (showTriangle) {
    if (!inTriangle) lines.push(`Row ${n} is past the rows drawn (0 to ${R}).`);
    else {
      lines.push(
        `Row ${n}: ${rows[n]!.map(fmt).join(', ')}; they add to 2${sup(n)} = ${fmt(2 ** n)}.`,
      );
      if (kIn) {
        const v = rows[n]![k]!;
        lines.push(`Entry ${k} of row ${n}: C(${n}, ${k}) = ${fmt(v)}.`);
        if (k > 0 && k < n)
          lines.push(
            `The two above add to it: C(${n - 1}, ${k - 1}) + C(${n - 1}, ${k}) = ${fmt(rows[n - 1]![k - 1]!)} + ${fmt(rows[n - 1]![k]!)} = ${fmt(v)}.`,
          );
      } else if (k !== undefined) lines.push(`Row ${n} has no entry ${k}: k runs from 0 to ${n}.`);
    }
    if (spec.expand && inTriangle && n <= 8)
      lines.push(
        `(${spec.expand.a} + ${spec.expand.b})${sup(n)} = ${expansion(n, spec.expand.a, spec.expand.b)}`,
      );
  }
  if (frac) lines.push(frac.caption);
  if (slots) {
    if (!slotsFit) lines.push(`${r} places can’t be filled from ${n}: r runs from 0 to n.`);
    else {
      const prod = slots.factors.length ? slots.factors.map(fmt).join(' × ') : '1';
      lines.push(
        `${r} ${r === 1 ? 'place' : 'places'} in order: ${prod} = ${fmt(slots.product)} ${spec.slots!.choose ? 'orders' : 'ways'}.`,
      );
      if (spec.slots!.choose)
        lines.push(
          `Each group of ${r} comes in ${r}! = ${fmt(slots.divisor)} orders: ${fmt(slots.product)} ÷ ${fmt(slots.divisor)} = ${fmt(slots.value)} groups.`,
        );
    }
  }

  const triH = (w: number) => (showTriangle ? (R + 1) * cellOf(w).h + 10 : 0);
  const slotsH = (slots ? (spec.slots!.choose ? 118 : 78) : 0) + (frac ? fractionHeight(frac) : 0);
  function cellOf(w: number) {
    const cw = Math.min(40, (w - 16) / (R + 1));
    return { w: cw, h: Math.min(28, Math.max(20, cw * 0.82)) };
  }

  return (
    <View>
      <Canvas aspect={(w) => (triH(w) + slotsH + 8) / w}>
        {({ w, h }) => {
          const cell = cellOf(w);
          const at = (row: number, col: number) => ({
            x: w / 2 + (col - row / 2) * cell.w,
            y: 6 + row * cell.h + cell.h / 2,
          });
          const lit = (row: number, col: number) => inTriangle && kIn && row === n && col === k;
          const parent = (row: number, col: number) =>
            inTriangle && kIn && k! > 0 && k! < n && row === n - 1 && (col === k! - 1 || col === k);
          const op = allKnown ? 1 : 0.35;
          const top = triH(w);
          return (
            <Svg width={w} height={h}>
              {showTriangle ? (
                <G opacity={op}>
                  {inTriangle ? (
                    <Rect
                      x={at(n, 0).x - cell.w / 2 - 3}
                      y={at(n, 0).y - cell.h / 2}
                      width={(n + 1) * cell.w + 6}
                      height={cell.h}
                      rx={cell.h / 2}
                      fill={c.chartHighlight}
                      fillOpacity={0.12}
                    />
                  ) : null}
                  {/* Pascal's rule: the two above feed the lit entry. */}
                  {inTriangle && kIn && k! > 0 && k! < n
                    ? [k! - 1, k!].map((col) => (
                        <Line
                          key={`p${col}`}
                          x1={at(n - 1, col).x}
                          y1={at(n - 1, col).y + cell.h / 2 - 3}
                          x2={at(n, k!).x + (col < k! ? -4 : 4)}
                          y2={at(n, k!).y - cell.h / 2 + 3}
                          stroke={c.chartSecond}
                          strokeWidth={chart.stroke}
                        />
                      ))
                    : null}
                  {rows.map((row, i) =>
                    row.map((v, j) => {
                      const p = at(i, j);
                      const on = lit(i, j);
                      const second = !on && !!frac && i === frac.n && j === frac.k;
                      const up = parent(i, j);
                      const text = fmt(v);
                      const size = text.length >= 4 && cell.w < 34 ? chart.label : chart.value;
                      return (
                        <G key={`${i}-${j}`}>
                          <Rect
                            x={p.x - cell.w / 2 + 1.5}
                            y={p.y - cell.h / 2 + 2}
                            width={cell.w - 3}
                            height={cell.h - 4}
                            rx={5}
                            fill={
                              on
                                ? c.chartHighlight
                                : second
                                  ? c.fnSecond
                                  : up
                                    ? c.chartSecond
                                    : c.chartSurface
                            }
                            fillOpacity={on || second ? 1 : up ? 0.35 : 1}
                            stroke={
                              on
                                ? c.chartHighlight
                                : second
                                  ? c.fnSecond
                                  : up
                                    ? c.chartSecond
                                    : c.chartGrid
                            }
                            strokeWidth={1}
                          />
                          <ChartText
                            x={p.x}
                            y={p.y + size * 0.36}
                            textAnchor="middle"
                            fontSize={size}
                            fontWeight={on || second || i === n ? '700' : '400'}
                            fill={on || second ? c.onChartHighlight : c.chartInk}
                          >
                            {text}
                          </ChartText>
                        </G>
                      );
                    }),
                  )}
                  {inTriangle && at(n, 0).x - cell.w / 2 > 58 ? (
                    <ChartText
                      x={at(n, 0).x - cell.w / 2 - 8}
                      y={at(n, 0).y + 4}
                      textAnchor="end"
                      fontWeight="700"
                      fill={c.chartHighlight}
                    >
                      {`row ${n}`}
                    </ChartText>
                  ) : null}
                </G>
              ) : null}
              {slots && slotsFit ? (
                <G opacity={op}>
                  {(() => {
                    // Boxes for the places; past 6, the first 4, "…" and the last.
                    const all = slots.factors;
                    const shown: (number | null)[] =
                      all.length > 6 ? [...all.slice(0, 4), null, all[all.length - 1]!] : all;
                    const bw = 38;
                    const gap = 16;
                    const result = `= ${fmt(slots.product)}`;
                    const total =
                      Math.max(1, shown.length) * bw +
                      Math.max(0, shown.length - 1) * gap +
                      14 +
                      result.length * 8;
                    let x = Math.max(8, (w - total) / 2);
                    const y = top + 14;
                    const parts = shown.map((f, i) => {
                      const x0 = x;
                      x += bw + gap;
                      return (
                        <G key={`s${i}`}>
                          {f === null ? (
                            <ChartText
                              x={x0 + bw / 2}
                              y={y + 21}
                              textAnchor="middle"
                              fontSize={chart.value}
                              fontWeight="700"
                            >
                              …
                            </ChartText>
                          ) : (
                            <>
                              <Rect
                                x={x0}
                                y={y}
                                width={bw}
                                height={30}
                                rx={5}
                                fill={c.chartSurface}
                                stroke={c.chartHighlight}
                                strokeWidth={chart.strokeLight}
                              />
                              <ChartText
                                x={x0 + bw / 2}
                                y={y + 20}
                                textAnchor="middle"
                                fontSize={chart.value}
                                fontWeight="700"
                              >
                                {fmt(f)}
                              </ChartText>
                            </>
                          )}
                          {i < shown.length - 1 ? (
                            <ChartText
                              x={x0 + bw + gap / 2}
                              y={y + 20}
                              textAnchor="middle"
                              fontSize={chart.value}
                            >
                              ×
                            </ChartText>
                          ) : null}
                        </G>
                      );
                    });
                    return (
                      <>
                        {parts}
                        {r === 0 ? (
                          <ChartText x={w / 2} y={y + 20} textAnchor="middle">
                            no places to fill: 1 way
                          </ChartText>
                        ) : (
                          <ChartText
                            x={x - gap + 10}
                            y={y + 20}
                            fontSize={chart.value}
                            fontWeight="700"
                          >
                            {result}
                          </ChartText>
                        )}
                        <ChartText x={w / 2} y={y + 48} textAnchor="middle" fill={c.chartMuted}>
                          {`choices for each of the ${r} ${r === 1 ? 'place' : 'places'}, in order`}
                        </ChartText>
                        {spec.slots!.choose ? (
                          <ChartText
                            x={w / 2}
                            y={y + 82}
                            textAnchor="middle"
                            fontSize={chart.value}
                            fontWeight="700"
                            fill={c.chartHighlight}
                          >
                            {`÷ ${r}! = ${fmt(slots.divisor)} orders → ${fmt(slots.value)} groups`}
                          </ChartText>
                        ) : null}
                      </>
                    );
                  })()}
                </G>
              ) : null}
              {frac ? (
                <G opacity={op}>
                  <FractionRow
                    frac={frac}
                    x={w / 2}
                    y={h - fractionHeight(frac)}
                    ink={c.chartInk}
                    lit={c.chartHighlight}
                    second={c.fnSecond}
                    muted={c.chartMuted}
                  />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

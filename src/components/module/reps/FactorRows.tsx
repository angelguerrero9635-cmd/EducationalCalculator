import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';

type Spec = Extract<Representation, { kind: 'factorRows' }>;

const SUP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
  '−': '⁻',
  '+': '⁺',
};
/** An exponent written up high: 12 → ¹², −3 → ⁻³, "3+4" → ³⁺⁴. */
export const sup = (x: number | string) =>
  [...String(x)]
    .filter((ch) => ch !== ' ')
    .map((ch) => SUP[ch] ?? ch)
    .join('');

/** A base as written in a power: a negative or a fraction base goes in brackets. */
const baseText = (b: number) => {
  const t = formatNumber(b);
  return b < 0 ? `(${t})` : t;
};

type Tone = 'first' | 'second' | 'plain';
interface Row {
  key: string;
  label: string;
  count: number;
  /** Color of tile i. */
  tone: (i: number) => Tone;
  /** Tiles crossed out (a pair that cancels), from the start of the row. */
  crossed?: number;
  faded?: boolean;
  /** A line (a fraction bar or a join) drawn above this row. */
  rule?: 'bar' | 'join';
  /** A variable this row's length changes, dragged at its end. */
  drag?: string;
  /** Factors of 1 ÷ base (what is left underneath a quotient). */
  under?: boolean;
}

/** Most tiles on one line; a longer row wraps. */
const PER_LINE = 12;

/**
 * Exponent rules as rows of factors (Grade 8): each power is a row of its base repeated, so
 * 2³ × 2⁴ is a row of three 2s and a row of four 2s joined into one row of seven. A quotient
 * sets one row over the other and crosses out the pairs that cancel; a power of a power
 * stacks copies of the row. Drag the end of a row to add or take away a factor.
 */
export function FactorRows({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ value: 0, step: 1 });
  const known = (id: string) => rep.known(id);
  const n = (id: string) => (known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0);
  const base = rep.shown(spec.base);
  const b = known(spec.base) ? baseText(base) : '?';
  const [p, q] = [n(spec.first), n(spec.second)];
  const [pk, qk] = [known(spec.first), known(spec.second)];
  const both = pk && qk && known(spec.base);
  const e = (id: string, x: number) => (known(id) ? sup(x) : '?');
  const resultKnown = known(spec.result);
  const r = resultKnown ? Math.round(rep.shown(spec.result)) : 0;

  // The rows each rule draws, top to bottom.
  const rows: Row[] =
    spec.rule === 'product'
      ? [
          {
            key: 'a',
            label: `${b}${e(spec.first, p)}`,
            count: p,
            tone: () => 'first',
            drag: spec.first,
          },
          {
            key: 'b',
            label: `${b}${e(spec.second, q)}`,
            count: q,
            tone: () => 'second',
            drag: spec.second,
          },
          {
            key: 'r',
            label: `${b}${resultKnown ? sup(r) : '?'}`,
            count: both ? p + q : 0,
            tone: (i) => (i < p ? 'first' : 'second'),
            faded: !resultKnown,
            rule: 'join',
          },
        ]
      : spec.rule === 'quotient'
        ? [
            {
              key: 'a',
              label: `${b}${e(spec.first, p)}`,
              count: p,
              tone: () => 'first',
              crossed: both ? Math.min(p, q) : 0,
              drag: spec.first,
            },
            {
              key: 'b',
              label: `${b}${e(spec.second, q)}`,
              count: q,
              tone: () => 'second',
              crossed: both ? Math.min(p, q) : 0,
              rule: 'bar',
              drag: spec.second,
            },
            // What is left: factors of the base on top, or of 1 ÷ base underneath (2⁻³).
            {
              key: 'r',
              label: `${b}${resultKnown ? sup(r) : '?'}`,
              count: both ? Math.abs(p - q) : 0,
              tone: () => 'plain',
              faded: !resultKnown,
              rule: 'join',
              under: p < q,
            },
          ]
        : [
            ...Array.from({ length: Math.max(1, q) }, (_, j) => ({
              key: `g${j}`,
              label: `${b}${e(spec.first, p)}`,
              count: p,
              tone: (): Tone => (j % 2 ? 'second' : 'first'),
              faded: !qk,
              drag: j === 0 ? spec.first : undefined,
            })),
            {
              key: 'r',
              label: `${b}${resultKnown ? sup(r) : '?'}`,
              count: both ? p * q : 0,
              tone: (i: number): Tone => (p > 0 && Math.floor(i / p) % 2 ? 'second' : 'first'),
              faded: !resultKnown,
              rule: 'join',
            },
          ];
  // Tile size from the longest line, held while a row is dragged so tiles don't jump.
  const longest = useFrozen(Math.min(PER_LINE, Math.max(4, ...rows.map((x) => x.count + 1))));
  const lines = (count: number) => Math.max(1, Math.ceil(count / PER_LINE));
  const labelW = 72;
  const geom = (w: number) => {
    const slot = Math.min(44, (w - labelW - 12) / longest.value);
    const tile = slot * 0.72;
    const lineH = tile + 12;
    let y = 10;
    const tops = rows.map((row) => {
      if (row.rule) y += 18;
      const top = y;
      y += lines(row.count) * lineH;
      return top;
    });
    return { slot, tile, lineH, tops, h: y + 6 };
  };
  // The quotient's answer: the factors left over the bar, or under it.
  const left = p - q;

  return (
    <View>
      <Canvas aspect={(w) => geom(w).h / w}>
        {({ w, h }) => {
          const { slot, tile, lineH, tops } = geom(w);
          const x0 = labelW;
          const at = (i: number, top: number) => ({
            x: x0 + (i % PER_LINE) * slot,
            y: top + Math.floor(i / PER_LINE) * lineH,
          });
          const fill = (t: Tone) =>
            t === 'first' ? c.chartHighlight : t === 'second' ? c.chartSecond : c.chartFill;
          const ink = (t: Tone) => (t === 'first' ? c.onChartHighlight : c.chartInk);
          const size = Math.min(chart.value, (tile * 0.95) / Math.max(1, b.length * 0.6));
          return (
            <>
              <Svg width={w} height={h}>
                {rows.map((row, k) => {
                  const top = tops[k]!;
                  return (
                    <G key={row.key} opacity={row.faded ? 0.35 : 1}>
                      {row.rule === 'bar' ? (
                        <Line
                          x1={x0 - 4}
                          y1={top - 9}
                          x2={Math.min(w - 4, x0 + longest.value * slot)}
                          y2={top - 9}
                          stroke={c.chartInk}
                          strokeWidth={chart.stroke}
                        />
                      ) : null}
                      {row.rule === 'join' ? (
                        <Line
                          x1={x0 - 4}
                          y1={top - 9}
                          x2={Math.min(w - 4, x0 + longest.value * slot)}
                          y2={top - 9}
                          stroke={c.chartGrid}
                          strokeWidth={chart.strokeLight}
                          strokeDasharray={chart.dash}
                        />
                      ) : null}
                      <ChartText
                        x={x0 - 12}
                        y={top + tile / 2 + 5}
                        fontSize={chart.emphasis}
                        fontWeight="700"
                        textAnchor="end"
                      >
                        {row.rule === 'join' ? `= ${row.label}` : row.label}
                      </ChartText>
                      {row.count === 0 && !row.faded ? (
                        <ChartText
                          x={x0}
                          y={top + tile / 2 + 5}
                          fontSize={chart.small}
                          fill={c.chartMuted}
                        >
                          {row.rule === 'join' ? '1 (no factors left)' : 'no factors'}
                        </ChartText>
                      ) : null}
                      {Array.from({ length: row.count }, (_, i) => {
                        const { x, y } = at(i, top);
                        const t = row.tone(i);
                        const out = i < (row.crossed ?? 0);
                        return (
                          <G key={i} opacity={out ? 0.4 : 1}>
                            <Rect
                              x={x}
                              y={y}
                              width={tile}
                              height={tile}
                              rx={4}
                              fill={fill(t)}
                              stroke={c.chartInk}
                              strokeWidth={1}
                            />
                            <ChartText
                              x={x + tile / 2}
                              y={y + tile / 2 + size * 0.36}
                              fontSize={row.under ? size * 0.75 : size}
                              fontWeight="700"
                              fill={ink(t)}
                              textAnchor="middle"
                            >
                              {row.under ? `1/${b}` : b}
                            </ChartText>
                            {out ? (
                              <Line
                                x1={x + 2}
                                y1={y + tile - 2}
                                x2={x + tile - 2}
                                y2={y + 2}
                                stroke={c.chartInk}
                                strokeWidth={chart.stroke}
                              />
                            ) : null}
                            {/* A times sign between factors on a line. */}
                            {i < row.count - 1 && (i + 1) % PER_LINE !== 0 ? (
                              <ChartText
                                x={x + tile + (slot - tile) / 2}
                                y={y + tile / 2 + 4}
                                fontSize={chart.small}
                                fill={c.chartMuted}
                                textAnchor="middle"
                              >
                                ×
                              </ChartText>
                            ) : null}
                          </G>
                        );
                      })}
                    </G>
                  );
                })}
              </Svg>
              {rows.map((row, k) => {
                if (!row.drag || !known(row.drag)) return null;
                const id = row.drag;
                const end = at(Math.max(0, row.count - 1), tops[k]!);
                // Where the next factor would go: drag right to add factors, left to take them away.
                const x = row.count === 0 ? x0 + tile / 2 : end.x + slot + tile / 2;
                return (
                  <DragHandle
                    key={`h${row.key}`}
                    testID={`drag-${row.key}`}
                    x={Math.min(w - 12, x)}
                    y={end.y + tile / 2}
                    label={rep.variable(id).name}
                    onStart={() => {
                      start.current = { value: n(id), step: slot };
                      longest.freeze();
                    }}
                    onEnd={longest.release}
                    onMove={(dx) =>
                      calc.set(
                        {
                          [id]: rep.snapTo(
                            id,
                            (start.current.value + Math.round(dx / start.current.step)) *
                              rep.factor(id),
                          ),
                        },
                        rep.slide(id),
                      )
                    }
                  />
                );
              })}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
    </View>
  );

  function caption(): string {
    if (!both) return 'Type the base and both exponents to see the factors.';
    const value = (x: number) => {
      const v = base ** x;
      return Math.abs(v) < 1e7 && Math.abs(v) >= 1e-4 ? ` = ${formatNumber(v)}` : '';
    };
    if (spec.rule === 'product')
      return `${b}${sup(p)} × ${b}${sup(q)} = ${b}${sup(`${p}+${q}`)} = ${b}${sup(p + q)}${value(p + q)} · ${p} factors of ${b} and ${q} more make ${p + q} factors.`;
    if (spec.rule === 'power')
      return `(${b}${sup(p)})${sup(q)} = ${b}${sup(p * q)}${value(p * q)} · ${q} groups of ${p} factors: ${q} × ${p} = ${p * q} factors of ${b}.`;
    const pairs = Math.min(p, q);
    const cancel = pairs
      ? `${pairs} ${pairs === 1 ? 'pair cancels' : 'pairs cancel'} (${b} ÷ ${b} = 1).`
      : 'Nothing cancels.';
    const answer =
      left > 0
        ? `${left} ${left === 1 ? 'factor is' : 'factors are'} left on top.`
        : left < 0
          ? `${-left} ${left === -1 ? 'factor is' : 'factors are'} left underneath: ${b}${sup(left)} = 1 ÷ ${b}${sup(-left)}.`
          : `Nothing is left: ${b}⁰ = 1.`;
    return `${b}${sup(p)} ÷ ${b}${sup(q)} = ${b}${sup(`${p}−${q}`)} = ${b}${sup(left)}${value(left)} · ${cancel} ${answer}`;
  }
}

import { useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { ELEMENTS, cellOf, element, familyOf, groupOf, periodOf, type Family } from './chem';
import { Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';

type Spec = Extract<Representation, { kind: 'periodicTable' }>;

const LEFT = 12;
const TOP = 12;
/** Space under the table for the families' key. */
const KEY = 20;

const FAMILY_FILL: Record<Family, keyof Palette> = {
  metal: 'tableMetal',
  metalloid: 'tableMetalloid',
  nonmetal: 'tableNonmetal',
  noble: 'tableNoble',
};
const FAMILY_NAME: Record<Family, string> = {
  metal: 'metals',
  metalloid: 'metalloids',
  nonmetal: 'nonmetals',
  noble: 'noble gases',
};

/** Cell size and canvas height for a table `w` wide. */
export function tableSize(w: number, families = false) {
  const cell = (w - LEFT - 2) / 18;
  return { cell, h: TOP + cell * 9.4 + (families ? KEY : 0) + 4 };
}

/** The narrowest table whose symbols read on their own (cells of 24 px, numbers shown). */
const MIN_W = 24 * 18 + LEFT + 2;

/**
 * A periodic table at the width it has, or, on a phone, at `minW` in a frame that scrolls
 * sideways: at 358 px the cells were 19 px and the symbols 8 px. Used by the calculator's table,
 * its trend shading and the explore figure.
 */
export function WideTable({
  minW = MIN_W,
  height,
  children,
}: {
  minW?: number;
  height: (w: number) => number;
  children: (w: number) => ReactNode;
}) {
  // Pre-rendered web pages start at a phone's width, as Canvas does.
  const [avail, setAvail] = useState(Platform.OS === 'web' ? 358 : 0);
  const w = Math.max(avail, minW);
  return (
    <View
      style={{ width: '100%', alignItems: 'center' }}
      onLayout={(e) => setAvail(Math.min(Math.floor(e.nativeEvent.layout.width), chart.maxWidth))}
    >
      {avail <= 0 ? null : avail >= minW ? (
        <View style={{ width: w, height: height(w) }}>{children(w)}</View>
      ) : (
        // `wide-frame`: an intended sideways scroll, which the layout checks (review-shots.mjs)
        // leave alone.
        <ScrollView
          horizontal
          testID="wide-frame"
          style={{ width: avail }}
          contentContainerStyle={{ width: w }}
        >
          <View style={{ width: w, height: height(w) }}>{children(w)}</View>
        </ScrollView>
      )}
    </View>
  );
}

/** Where a table cell sits (row 7 is the gap before the two rows under the table). */
const place = (z: number, cell: number) => {
  const { col, row } = cellOf(z);
  return { x: LEFT + col * cell, y: TOP + (row >= 8 ? row - 0.6 : row) * cell };
};

/**
 * The periodic table drawn flat: a grid of symbols (numbers too when the cells are big),
 * groups numbered across the top and periods down the side, the lanthanides and actinides in
 * two rows under it. Lit cells: one element (with its card in the gap over the middle), a
 * group, a period, or a ring around some elements. `families` fills metals, metalloids,
 * nonmetals and noble gases, with a key. `onTap` makes every cell a button.
 */
export function TableArt({
  w,
  lit,
  group,
  period,
  ring = [],
  families = false,
  faded = false,
  onTap,
}: {
  w: number;
  lit?: number;
  group?: number;
  period?: number;
  ring?: number[];
  families?: boolean;
  faded?: boolean;
  onTap?: (z: number) => void;
}) {
  const c = usePalette();
  const { cell, h } = tableSize(w, families);
  const fs = Math.min(13, cell * 0.46);
  const numbers = cell >= 24;
  const on = (z: number) =>
    z === lit ||
    (group !== undefined && groupOf(z) === group) ||
    (period !== undefined && periodOf(z) === period);
  const card = lit !== undefined ? element(lit) : undefined;
  // The gap over groups 3–12 in periods 1–3 holds the card.
  const cx0 = LEFT + 2.2 * cell;
  const cw = 9.6 * cell;
  const cy0 = TOP + 0.1 * cell;
  const ch = 2.35 * cell;
  const firstInGroup = (g: number) => ELEMENTS.findIndex((_, i) => groupOf(i + 1) === g) + 1;
  return (
    <View style={{ width: w, height: h }}>
      <Svg width={w} height={h}>
        {Array.from({ length: 18 }, (_, i) => i + 1).map((g) => {
          const p = place(firstInGroup(g), cell);
          return (
            <ChartText
              key={`g${g}`}
              x={p.x + cell / 2}
              y={p.y - 3}
              fontSize={Math.min(9, cell * 0.42)}
              textAnchor="middle"
              fill={g === group ? c.chartHighlight : c.chartMuted}
              fontWeight={g === group ? '700' : '400'}
            >
              {String(g)}
            </ChartText>
          );
        })}
        {[1, 2, 3, 4, 5, 6, 7].map((p) => (
          <ChartText
            key={`p${p}`}
            x={LEFT - 3}
            y={TOP + (p - 0.5) * cell + 3}
            fontSize={Math.min(9, cell * 0.42)}
            textAnchor="end"
            fill={p === period ? c.chartHighlight : c.chartMuted}
            fontWeight={p === period ? '700' : '400'}
          >
            {String(p)}
          </ChartText>
        ))}
        <G opacity={faded ? 0.4 : 1}>
          {ELEMENTS.map(([sym], i) => {
            const z = i + 1;
            const { x, y } = place(z, cell);
            const hi = on(z);
            const fill = hi
              ? c.chartHighlight
              : families
                ? (c[FAMILY_FILL[familyOf(z)]] as string)
                : c.chartSurface;
            return (
              <G key={sym}>
                <Rect
                  x={x + 0.5}
                  y={y + 0.5}
                  width={cell - 1}
                  height={cell - 1}
                  rx={1.5}
                  fill={fill}
                  stroke={hi ? c.chartHighlight : c.chartGrid}
                  strokeWidth={1}
                />
                {numbers ? (
                  <ChartText
                    x={x + 3}
                    y={y + 9}
                    fontSize={7}
                    fill={hi ? c.onChartHighlight : c.chartMuted}
                  >
                    {String(z)}
                  </ChartText>
                ) : null}
                <ChartText
                  x={x + cell / 2}
                  y={y + cell / 2 + fs * 0.36 + (numbers ? 3 : 0)}
                  fontSize={fs}
                  fontWeight={hi ? '700' : '500'}
                  textAnchor="middle"
                  fill={hi ? c.onChartHighlight : c.chartInk}
                >
                  {sym}
                </ChartText>
              </G>
            );
          })}
          {/* Where the two rows under the table belong. */}
          {[6, 7].map((p) => {
            const x = LEFT + 2 * cell;
            const y = TOP + (p - 1) * cell;
            return (
              <G key={`f${p}`}>
                <Rect
                  x={x + 0.5}
                  y={y + 0.5}
                  width={cell - 1}
                  height={cell - 1}
                  rx={1.5}
                  fill="none"
                  stroke={c.chartGrid}
                  strokeDasharray={chart.dashFine}
                />
                <Line
                  x1={x + cell / 2}
                  y1={y + cell - 2}
                  x2={x + cell / 2}
                  y2={TOP + (p + 1.4) * cell + 2}
                  stroke={c.chartGrid}
                  strokeDasharray={chart.dashFine}
                />
              </G>
            );
          })}
          {ring
            .filter((z) => z >= 1 && z <= ELEMENTS.length)
            .map((z) => {
              const { x, y } = place(z, cell);
              return (
                <Rect
                  key={`r${z}`}
                  x={x - 1}
                  y={y - 1}
                  width={cell + 2}
                  height={cell + 2}
                  rx={3}
                  fill="none"
                  stroke={c.chartSecond}
                  strokeWidth={chart.strokeHeavy}
                />
              );
            })}
        </G>
        {card ? (
          <G opacity={faded ? 0.4 : 1}>
            <Rect
              x={cx0}
              y={cy0}
              width={cw}
              height={ch}
              rx={4}
              fill={c.card}
              stroke={c.chartHighlight}
              strokeWidth={chart.strokeLight}
            />
            <Rect
              x={cx0 + 4}
              y={cy0 + 4}
              width={ch - 8}
              height={ch - 8}
              rx={3}
              fill={c.chartHighlight}
            />
            <ChartText
              x={cx0 + 7}
              y={cy0 + 4 + Math.min(11, ch * 0.2)}
              fontSize={Math.min(10, ch * 0.2)}
              fill={c.onChartHighlight}
            >
              {String(card.z)}
            </ChartText>
            <ChartText
              x={cx0 + ch / 2}
              y={cy0 + ch * 0.72}
              fontSize={Math.min(24, ch * 0.42)}
              fontWeight="700"
              textAnchor="middle"
              fill={c.onChartHighlight}
            >
              {card.symbol}
            </ChartText>
            {[
              { text: card.name, size: Math.min(14, ch * 0.26), weight: '700' as const },
              {
                text: `Atomic number ${card.z}`,
                size: Math.min(11, ch * 0.21),
                weight: '400' as const,
              },
              {
                text: `Atomic mass ${card.mass.replace(/\[(\d+)\]/, '($1)')}`,
                size: Math.min(11, ch * 0.21),
                weight: '400' as const,
              },
            ].map((line, k) => (
              <ChartText
                key={k}
                x={cx0 + ch + 2}
                y={cy0 + ch * (0.3 + k * 0.28)}
                fontSize={line.size}
                fontWeight={line.weight}
              >
                {line.text}
              </ChartText>
            ))}
          </G>
        ) : null}
        {families ? (
          <G>
            {(['metal', 'metalloid', 'nonmetal', 'noble'] as const).map((f, k) => {
              const x = LEFT + (k * (w - LEFT)) / 4;
              const y = h - KEY + 2;
              return (
                <G key={f}>
                  <Rect
                    x={x}
                    y={y}
                    width={11}
                    height={11}
                    rx={2}
                    fill={c[FAMILY_FILL[f]] as string}
                    stroke={c.chartGrid}
                  />
                  <ChartText x={x + 15} y={y + 9.5} fontSize={chart.small} fill={c.chartInk}>
                    {FAMILY_NAME[f]}
                  </ChartText>
                </G>
              );
            })}
          </G>
        ) : null}
      </Svg>
      {onTap
        ? ELEMENTS.map(([sym], i) => {
            const { x, y } = place(i + 1, cell);
            return (
              <Pressable
                key={`t${sym}`}
                testID={`element-${sym}`}
                accessibilityRole="button"
                accessibilityLabel={`${ELEMENTS[i]![1]}, atomic number ${i + 1}`}
                onPress={() => onTap(i + 1)}
                style={{ position: 'absolute', left: x, top: y, width: cell, height: cell }}
              />
            );
          })
        : null}
    </View>
  );
}

/** The elements of a group or period, by symbol: "H, Li, Na, K, Rb, Cs, Fr". */
export const symbolsWhere = (test: (z: number) => boolean) =>
  ELEMENTS.filter((_, i) => test(i + 1)).map(([s]) => s);

/**
 * The periodic table (Grade 8) with one element, a group or a period lit from the values;
 * tap an element to choose it (or its group or period, when that is the value).
 */
export function PeriodicTable({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const rep = useRep(calc);
  const read = reader(rep);
  const el = spec.element === undefined ? undefined : read(spec.element);
  const gr = spec.group === undefined ? undefined : read(spec.group);
  const pe = spec.period === undefined ? undefined : read(spec.period);
  const z = el?.known ? Math.round(el.value) : undefined;
  const g = gr?.known ? Math.round(gr.value) : undefined;
  const p = pe?.known ? Math.round(pe.value) : undefined;
  const card = z === undefined ? undefined : element(z);
  const tapId = [spec.element, spec.group, spec.period].find(
    (x): x is string => typeof x === 'string',
  );
  const tap = tapId
    ? (tz: number) => {
        const value =
          tapId === spec.element ? tz : tapId === spec.group ? groupOf(tz) : periodOf(tz);
        if (value === undefined) return;
        calc.set({ [tapId]: rep.snapTo(tapId, value * rep.factor(tapId)) });
      }
    : undefined;
  const name = (id: string | number | undefined, what: string) =>
    typeof id === 'string' ? rep.named(id) : `${what} ${id}`;
  return (
    <View>
      <WideTable height={(w) => tableSize(w, spec.families).h}>
        {(w) => (
          <TableArt
            w={w}
            lit={z}
            group={g}
            period={p}
            families={spec.families}
            faded={[el, gr, pe].every((x) => x === undefined || !x.known)}
            onTap={tap}
          />
        )}
      </WideTable>
      <Caption>
        {[
          card
            ? `${name(spec.element, 'Atomic number')}: ${card.name} (${card.symbol})${groupOf(card.z) ? `, group ${groupOf(card.z)}` : ''}, period ${periodOf(card.z)}`
            : spec.element !== undefined
              ? 'Tap an element, or type its atomic number.'
              : undefined,
          g !== undefined
            ? `${name(spec.group, 'Group')}: ${symbolsWhere((x) => groupOf(x) === g).join(', ')}`
            : undefined,
          p !== undefined
            ? `${name(spec.period, 'Period')}: ${symbolsWhere((x) => periodOf(x) === p).length} elements, ${symbolsWhere((x) => periodOf(x) === p)[0]} to ${symbolsWhere((x) => periodOf(x) === p).slice(-1)[0]}`
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}

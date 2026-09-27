import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Caption, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'placeValueChart' }>;

const WHOLE = [
  'ones',
  'tens',
  'hundreds',
  'thousands',
  'ten thousands',
  'hundred thousands',
  'millions',
  'ten millions',
  'hundred millions',
  'billions',
  'ten billions',
  'hundred billions',
];
/** Periods of three places, for `periods` (numbers past the millions). */
const PERIODS = ['ones', 'thousands', 'millions', 'billions'];
const PARTS = ['tenths', 'hundredths', 'thousandths'];

/** A column: its name and place value. */
interface Column {
  name: string;
  place: number;
}

/** The digit of x in a place (x ≥ 0), read from its written form so 0.3 stays 3 tenths. */
function digitAt(x: number, place: number, decimals: number): string {
  const [whole = '0', part = ''] = Math.max(0, x).toFixed(decimals).split('.');
  if (place >= 1) {
    const i = Math.round(Math.log10(place));
    return whole[whole.length - 1 - i] ?? '0';
  }
  return part[Math.round(-Math.log10(place)) - 1] ?? '0';
}

/**
 * A place-value chart: one column per place, the number's digits in them, the decimal point
 * between ones and tenths. Each column is 10 times the one to its right. A second row shows
 * the number before a × 10 (digits one place left) or the number compared with it. With
 * `periods`, a number past the millions has its columns grouped in periods of three. With
 * `plus` and `total`, two numbers stacked for adding and their sum under a rule.
 */
export function PlaceValueChart({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const known = rep.known(spec.value);
  const x = Math.max(0, rep.shown(spec.value));
  const other = spec.from ?? spec.compare ?? spec.plus;
  const y = other && rep.known(other) ? Math.max(0, rep.shown(other)) : undefined;
  // Adding: the sum, in a third row under a rule.
  const adding = !!(spec.plus && spec.total);
  const z = adding && rep.known(spec.total!) ? Math.max(0, rep.shown(spec.total!)) : undefined;
  const wholeLen = (n: number) => Math.floor(n).toString().length;
  const needed = Math.min(
    spec.periods ? WHOLE.length : 7,
    Math.max(wholeLen(x), y !== undefined ? wholeLen(y) : 1, z !== undefined ? wholeLen(z) : 1),
  );
  // Past the millions (with `periods`): whole periods of three columns each.
  const grouped = !!spec.periods && needed > 7;
  const places = grouped ? Math.ceil(needed / 3) * 3 : needed;
  const columns: Column[] = [
    ...WHOLE.slice(0, places)
      .map((name, i) => ({ name, place: 10 ** i }))
      .reverse(),
    ...PARTS.slice(0, spec.decimals).map((name, i) => ({ name, place: 10 ** -(i + 1) })),
  ];
  const firstPart = columns.findIndex((col) => col.place < 1);
  // Past five columns the row would wrap at phone width: narrower cells keep it on one line.
  const tight = columns.length > 5;
  // Eight columns (ten thousands to thousandths) still fit a phone in one row.
  const tighter = columns.length > 7;
  const lit = spec.highlight && rep.known(spec.highlight) ? rep.shown(spec.highlight) : undefined;
  const litIndex =
    lit === undefined ? -1 : columns.findIndex((col) => Math.abs(col.place - lit) < 1e-12);
  // The first place (from the left) where the compared numbers differ.
  const differ =
    spec.compare && y !== undefined && known
      ? columns.findIndex(
          (col) => digitAt(x, col.place, spec.decimals) !== digitAt(y, col.place, spec.decimals),
        )
      : -1;

  /** Periods layout: each period boxed under its name, compact 100 · 10 · 1 headers. */
  const periodRow = (n: number | undefined, key: string, label?: string) => (
    <View key={key}>
      {label ? <Text style={[styles.rowLabel, { color: c.textMuted }]}>{label}</Text> : null}
      <View style={styles.periods}>
        {Array.from({ length: places / 3 }, (_, g) => {
          const start = g * 3;
          return (
            <View
              key={g}
              style={[styles.period, { borderColor: c.chartInk, backgroundColor: c.chartSurface }]}
            >
              <Text
                style={[styles.periodHead, { color: c.chartInk }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {PERIODS[places / 3 - 1 - g]}
              </Text>
              <View style={styles.periodCells}>
                {columns.slice(start, start + 3).map((col, j) => {
                  const i = start + j;
                  // Places before the number's first digit stay blank (not leading zeros).
                  const d =
                    n === undefined
                      ? '?'
                      : col.place > 1 && col.place >= 10 ** wholeLen(n)
                        ? ''
                        : digitAt(n, col.place, 0);
                  const outlined = i === litIndex || i === differ;
                  return (
                    <View
                      key={col.name}
                      style={[
                        styles.small,
                        { borderColor: c.chartGrid, backgroundColor: c.chartSurface },
                        d !== '0' && d !== '?' && d !== '' && { backgroundColor: c.chartFill },
                        outlined && { borderColor: c.chartHighlight, borderWidth: 3 },
                      ]}
                    >
                      <Text style={[styles.smallHead, { color: c.chartMuted }]}>
                        {['100', '10', '1'][j]}
                      </Text>
                      <Text style={[styles.smallDigit, { color: c.chartInk }]}>{d || ' '}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const row = (n: number | undefined, key: string, label?: string, heads = true) =>
    grouped ? periodRow(n, key, label) : plainRow(n, key, label, heads);

  /** A row of digits; `heads` false leaves out the place names (rows under the first). */
  const plainRow = (n: number | undefined, key: string, label?: string, heads = true) => (
    <View key={key}>
      {label ? <Text style={[styles.rowLabel, { color: c.textMuted }]}>{label}</Text> : null}
      <View style={[styles.row, tight && styles.rowTight]}>
        {columns.map((col, i) => {
          // Adding, places before a number's first digit stay blank, as written in columns.
          const d =
            n === undefined
              ? '?'
              : adding && col.place > 1 && col.place >= 10 ** wholeLen(n)
                ? ''
                : digitAt(n, col.place, spec.decimals);
          const outlined = i === litIndex || i === differ;
          return (
            <View key={col.name} style={styles.cellWrap}>
              <View
                style={[
                  styles.cell,
                  tight && styles.cellTight,
                  tighter && styles.cellTighter,
                  { borderColor: c.chartGrid, backgroundColor: c.chartSurface },
                  d !== '0' && d !== '?' && d !== '' && { backgroundColor: c.chartFill },
                  outlined && { borderColor: c.chartHighlight, borderWidth: 3 },
                ]}
              >
                {heads ? (
                  <Text
                    style={[styles.head, tight && styles.headTight, { color: c.chartMuted }]}
                    numberOfLines={2}
                  >
                    {col.name}
                  </Text>
                ) : null}
                <Text style={[styles.digit, tight && styles.digitTight, { color: c.chartInk }]}>
                  {d || ' '}
                </Text>
              </View>
              {i === firstPart - 1 ? (
                <Text style={[styles.point, tight && styles.pointTight, { color: c.chartInk }]}>
                  .
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );

  const name = (i: number) => columns[i]?.name.replace(/s$/, '');
  const shift = spec.from && y !== undefined && y > 0 && known ? Math.round(Math.log10(x / y)) : 0;
  const lines: string[] = [];
  if (!known) lines.push('Type a number to fill the chart.');
  else {
    if (adding) {
      lines.push(
        `${formatNumber(x)} + ${y === undefined ? '?' : formatNumber(y)} = ${z === undefined ? '?' : formatNumber(z)}.`,
        'The points line up: tenths under tenths, hundredths under hundredths.',
      );
    } else if (!spec.compare) {
      lines.push(
        (columns
          .map((col) => ({ col, d: digitAt(x, col.place, spec.decimals) }))
          .filter(({ d }) => d !== '0')
          // One of a place is singular: "1 ten", "1 hundred thousand".
          .map(({ col, d }) => `${d} ${d === '1' ? col.name.replace(/s$/, '') : col.name}`)
          .join(' + ') || '0 ones') + '.',
      );
    }
    if (litIndex >= 0) {
      if (litIndex > 0) lines.push(`1 ${name(litIndex - 1)} = 10 ${columns[litIndex]!.name}.`);
      if (litIndex < columns.length - 1)
        lines.push(`1 ${name(litIndex)} = 10 ${columns[litIndex + 1]!.name}.`);
    }
    if (spec.from && y !== undefined && shift !== 0) {
      const k = Math.abs(shift);
      lines.push(
        `Each digit moves ${k} ${k === 1 ? 'place' : 'places'} to the ${shift > 0 ? 'left' : 'right'}: ${formatNumber(y)} ${shift > 0 ? '×' : '÷'} ${formatNumber(10 ** k)} = ${formatNumber(x)}.`,
      );
    }
    if (spec.compare && y !== undefined) {
      lines.push(
        differ < 0
          ? `Every digit is the same: ${formatNumber(x)} = ${formatNumber(y)}.`
          : `They first differ in the ${columns[differ]!.name}: ${digitAt(x, columns[differ]!.place, spec.decimals)} ${
              x > y ? '>' : '<'
            } ${digitAt(y, columns[differ]!.place, spec.decimals)}, so ${formatNumber(x)} ${x > y ? '>' : '<'} ${formatNumber(y)}.`,
      );
    }
  }

  return (
    <View style={{ gap: space.xs }}>
      {spec.from ? row(y, 'from', 'Before') : null}
      {row(
        known ? x : undefined,
        'value',
        spec.from ? 'After' : spec.compare || adding ? rep.tag(spec.value) : undefined,
      )}
      {spec.compare ? row(y, 'compare', rep.tag(spec.compare)) : null}
      {adding ? (
        <>
          {row(y, 'plus', `+ ${rep.tag(spec.plus!)}`, false)}
          <View style={[styles.rule, { borderColor: c.chartInk }]} />
          {row(z, 'total', rep.tag(spec.total!), false)}
        </>
      ) : null}
      <Caption>{lines.join(' ')}</Caption>
      <Steppers
        calc={calc}
        items={[
          {
            var: spec.value,
            steps: [10 ** -spec.decimals, 1, 10],
            pin: spec.compare ? [spec.compare] : spec.plus ? [spec.plus] : [],
          },
          ...(spec.compare
            ? [{ var: spec.compare, steps: [10 ** -spec.decimals, 1, 10], pin: [spec.value] }]
            : []),
          ...(spec.plus
            ? [{ var: spec.plus, steps: [10 ** -spec.decimals, 1, 10], pin: [spec.value] }]
            : []),
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: space.md,
    flexWrap: 'wrap',
  },
  rowLabel: { fontSize: font.caption, textAlign: 'center' },
  rule: { borderTopWidth: 2, marginHorizontal: space.md, marginTop: space.xs },
  rowTight: { paddingHorizontal: 0 },
  cellWrap: { flexDirection: 'row', alignItems: 'flex-end' },
  cellTight: { width: 47, margin: 1 },
  cellTighter: { width: 40 },
  headTight: { fontSize: font.caption - 4, letterSpacing: -0.4 },
  digitTight: { fontSize: font.title },
  pointTight: { fontSize: font.title + 2 },
  periods: { flexDirection: 'row', gap: 3, paddingHorizontal: 2 },
  period: { flex: 1, borderWidth: 1.5, borderRadius: radius.sm, padding: 1 },
  periodHead: { fontSize: font.caption - 1, fontWeight: '700', textAlign: 'center' },
  periodCells: { flexDirection: 'row' },
  small: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 3,
    margin: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  smallHead: { fontSize: font.caption - 3, fontVariant: ['tabular-nums'] },
  smallDigit: { fontSize: font.body + 2, fontWeight: '800', fontVariant: ['tabular-nums'] },
  cell: {
    width: 62,
    borderWidth: 1,
    borderRadius: radius.sm,
    margin: 2,
    alignItems: 'center',
    paddingVertical: space.xs,
  },
  head: { fontSize: font.caption - 2, textAlign: 'center', minHeight: 26 },
  digit: { fontSize: font.title + 4, fontWeight: '800', fontVariant: ['tabular-nums'] },
  point: { fontSize: font.title + 8, fontWeight: '800', marginBottom: space.xs },
});

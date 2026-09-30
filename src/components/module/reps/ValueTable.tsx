import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from '@/components/Text';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { solve } from '@/engine/solve';
import { chart, font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { ChartText, useRep } from './common';

type Spec = Extract<Representation, { kind: 'table'; sweep: string }>;

/** Row height: a 44 px tap target. */
const ROW = 44;

/** A value rounded to the variable's step (1.0286 → 1.03 when the step is 0.01). */
function toStep(x: number, step: number | undefined): number {
  if (!step || step <= 0) return x;
  const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  return Number((Math.round(x / step) * step).toFixed(decimals));
}

/**
 * The pattern down the output column, when the inputs go up in equal steps: the same amount
 * added each row ("+12") or the same number multiplied ("×2"). Undefined when there is none.
 */
export function tablePattern(xs: number[], ys: (number | undefined)[]): string | undefined {
  if (xs.length < 3 || ys.some((y) => y === undefined)) return undefined;
  const y = ys as number[];
  const same = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a));
  const dx = xs[1]! - xs[0]!;
  if (!xs.every((x, i) => i === 0 || same(x - xs[i - 1]!, dx))) return undefined;
  const dy = y[1]! - y[0]!;
  if (y.every((v, i) => i === 0 || same(v - y[i - 1]!, dy)))
    return dy === 0 ? undefined : `${dy > 0 ? '+' : '−'}${formatNumber(Math.abs(dy))}`;
  if (y.some((v) => v === 0)) return undefined;
  const r = y[1]! / y[0]!;
  if (y.every((v, i) => i === 0 || same(v / y[i - 1]!, r)) && r > 0)
    return `×${formatNumber(Number(r.toFixed(4)))}`;
  return undefined;
}

/**
 * Rows of `sweep` → `output` with the parameters held. Centred headers (the unit on a second,
 * smaller line), 44 px rows with faint stripes, tabular numbers; the current row tinted with
 * an accent bar and bold numbers; and, when the outputs follow a pattern, an arrow between each
 * pair of rows saying it ("+12", "×2"). Tap a row to use that input.
 */
export function ValueTable({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const pinned = rep.pin(spec.params);
  const paramsKnown = spec.params.every(rep.known);
  const sweep = rep.variable(spec.sweep);
  const output = rep.variable(spec.output);
  const current = calc.values[spec.sweep];

  const rows = (() => {
    const givens = Object.entries(pinned).map(([id, value]) => ({ id, value }));
    const inputs = typeof spec.rows === 'function' ? spec.rows(calc.values) : spec.rows;
    return inputs.map((x) => {
      const y = paramsKnown
        ? solve(calc.module, [
            ...givens,
            // Rows are numbers in the shown unit; the solver works in formula units.
            { id: spec.sweep, value: x * rep.factor(spec.sweep) },
          ]).values[spec.output]
        : undefined;
      return {
        x,
        y: y === undefined ? undefined : toStep(y / rep.factor(spec.output), output.step),
      };
    });
  })();
  const pattern = tablePattern(
    rows.map((r) => r.x),
    rows.map((r) => r.y),
  );
  const arrowW = pattern ? pattern.length * chart.label * 0.62 + 34 : 0;

  // K–5 read the name alone (letters stand for numbers from Grade 6): "Sheets of paper".
  const head = (v: typeof sweep) => {
    const unit = rep.unit(v.id);
    return (
      <View style={styles.headCell}>
        <Text style={[styles.head, { color: c.chartInk }]} numberOfLines={2}>
          {rep.tag(v.id)}
        </Text>
        {unit ? <Text style={[styles.unit, { color: c.chartMuted }]}>{`(${unit})`}</Text> : null}
      </View>
    );
  };

  const named =
    spec.named && rep.known(spec.named.param)
      ? spec.named.names[rep.shown(spec.named.param)]
      : undefined;

  return (
    <View style={[styles.table, { borderColor: c.chartGrid, backgroundColor: c.card }]}>
      {named ? (
        <Text
          style={[
            styles.named,
            { color: c.chartInk, borderBottomColor: c.chartGrid, backgroundColor: c.chartSurface },
          ]}
        >
          {named}
        </Text>
      ) : null}
      <View style={[styles.row, styles.headRow, { borderBottomColor: c.chartInk }]}>
        {spec.rowNames ? <View style={styles.nameCell} /> : null}
        {head(sweep)}
        {head(output)}
        {pattern ? <View style={{ width: arrowW }} /> : null}
      </View>
      <View style={styles.body}>
        <View style={styles.rows}>
          {rows.map(({ x, y }, i) => {
            const selected =
              current !== undefined && Math.abs(current / rep.factor(spec.sweep) - x) < 1e-9;
            const text = [styles.cell, selected && styles.bold, { color: c.chartInk }];
            return (
              <Pressable
                key={x}
                testID={`row-${x}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Use ${sweep.name} ${x}`}
                onPress={() => calc.set({ ...pinned, [spec.sweep]: x * rep.factor(spec.sweep) })}
                style={[
                  styles.row,
                  { borderBottomColor: c.chartGrid },
                  i === rows.length - 1 && { borderBottomWidth: 0 },
                  pattern ? { paddingRight: arrowW } : null,
                ]}
              >
                {({ pressed }) => (
                  <>
                    {/* Faint stripes, the current row tinted (both flat washes of a token). */}
                    <View
                      pointerEvents="none"
                      style={[
                        StyleSheet.absoluteFill,
                        {
                          backgroundColor: selected || pressed ? c.chartHighlight : c.chartInk,
                          opacity: selected ? 0.15 : pressed ? 0.08 : i % 2 ? 0.04 : 0,
                        },
                      ]}
                    />
                    {selected ? (
                      <View style={[styles.bar, { backgroundColor: c.chartHighlight }]} />
                    ) : null}
                    {spec.rowNames ? (
                      <Text style={[styles.name, selected && styles.bold, { color: c.chartInk }]}>
                        {spec.rowNames[i] ?? ''}
                      </Text>
                    ) : null}
                    <Text style={text}>{formatNumber(x, sweep)}</Text>
                    <Text style={text}>{y === undefined ? '?' : formatNumber(y, output)}</Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
        {pattern ? (
          <View pointerEvents="none" style={[styles.arrows, { width: arrowW }]}>
            <Svg width={arrowW} height={rows.length * ROW}>
              {rows.slice(1).map((_, i) => {
                const y0 = i * ROW + ROW / 2 + 5;
                const y1 = (i + 1) * ROW + ROW / 2 - 5;
                return (
                  <Path
                    key={`a${i}`}
                    d={`M 6 ${y0} Q 22 ${(y0 + y1) / 2} 6 ${y1} M 2.5 ${y1 - 7} L 6 ${y1} L 12 ${y1 - 5}`}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeLight}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                );
              })}
              {rows.slice(1).map((_, i) => (
                <ChartText
                  key={`t${i}`}
                  x={22}
                  y={(i + 1) * ROW + 4}
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={c.chartHighlight}
                >
                  {pattern}
                </ChartText>
              ))}
            </Svg>
          </View>
        ) : null}
      </View>
      {!paramsKnown ? (
        <Text style={[styles.note, { color: c.chartMuted, borderTopColor: c.chartGrid }]}>
          {`Enter ${spec.params.map((id) => (rep.words ? rep.variable(id).name.toLowerCase() : rep.variable(id).symbol)).join(' and ')} to fill the table.`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    marginHorizontal: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ROW,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headRow: { minHeight: ROW + 4, borderBottomWidth: 1.5, paddingVertical: space.xs },
  body: { position: 'relative' },
  rows: {},
  arrows: { position: 'absolute', right: 0, top: 0 },
  headCell: { flex: 1, alignItems: 'center', paddingHorizontal: space.sm },
  nameCell: { flex: 0.9 },
  name: { flex: 0.9, paddingLeft: space.md, fontSize: font.body - 1, fontWeight: '600' },
  head: { fontSize: font.body - 1, fontWeight: '600', textAlign: 'center' },
  unit: { fontSize: font.caption + 1, textAlign: 'center' },
  cell: {
    flex: 1,
    paddingHorizontal: space.md,
    fontSize: font.body,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  bold: { fontWeight: '700' },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  note: { padding: space.md, fontSize: font.caption + 1, borderTopWidth: StyleSheet.hairlineWidth },
  named: {
    padding: space.sm + 2,
    fontSize: font.body + 1,
    fontWeight: '700',
    textAlign: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

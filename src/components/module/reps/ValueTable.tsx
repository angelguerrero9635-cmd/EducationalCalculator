import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { solve } from '@/engine/solve';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';

type Spec = Extract<Representation, { kind: 'table' }>;

/** A value rounded to the variable's step (1.0286 → 1.03 when the step is 0.01). */
function toStep(x: number, step: number | undefined): number {
  if (!step || step <= 0) return x;
  const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  return Number((Math.round(x / step) * step).toFixed(decimals));
}

/** Rows of `sweep` → `output` with the parameters held. Tap a row to use that input. */
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
    return spec.rows.map((x) => ({
      x,
      y: paramsKnown
        ? solve(calc.module, [
            ...givens,
            // Rows are numbers in the shown unit; the solver works in formula units.
            { id: spec.sweep, value: x * rep.factor(spec.sweep) },
          ]).values[spec.output]
        : undefined,
    }));
  })();

  const head = (v: typeof sweep) => {
    const unit = rep.unit(v.id);
    // K–5 read the name alone (letters stand for numbers from Grade 6): "Sheets of paper".
    return `${rep.tag(v.id)}${unit ? `, ${unit}` : ''}`;
  };

  const named =
    spec.named && rep.known(spec.named.param)
      ? spec.named.names[rep.shown(spec.named.param)]
      : undefined;

  return (
    <View style={[styles.table, { borderColor: c.chartGrid }]}>
      {named ? (
        <Text style={[styles.named, { color: c.chartInk, borderBottomColor: c.chartGrid }]}>
          {named}
        </Text>
      ) : null}
      <View
        style={[styles.row, { backgroundColor: c.chartSurface, borderBottomColor: c.chartGrid }]}
      >
        <Text style={[styles.cell, styles.head, { color: c.chartInk }]}>{head(sweep)}</Text>
        <Text style={[styles.cell, styles.head, { color: c.chartInk }]}>{head(output)}</Text>
      </View>
      {rows.map(({ x, y }) => {
        const selected =
          current !== undefined && Math.abs(current / rep.factor(spec.sweep) - x) < 1e-9;
        return (
          <Pressable
            key={x}
            testID={`row-${x}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Use ${sweep.name} ${x}`}
            onPress={() => calc.set({ ...pinned, [spec.sweep]: x * rep.factor(spec.sweep) })}
            style={({ pressed }) => [
              styles.row,
              { borderBottomColor: c.chartGrid },
              (selected || pressed) && {
                backgroundColor: selected ? c.chartHighlight : c.chartSurface,
              },
            ]}
          >
            <Text style={[styles.cell, { color: selected ? c.onChartHighlight : c.chartInk }]}>
              {formatNumber(x, sweep)}
            </Text>
            <Text style={[styles.cell, { color: selected ? c.onChartHighlight : c.chartInk }]}>
              {y === undefined
                ? '?'
                : formatNumber(toStep(y / rep.factor(spec.output), output.step), output)}
            </Text>
          </Pressable>
        );
      })}
      {!paramsKnown ? (
        <Text style={[styles.note, { color: c.chartMuted }]}>
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
  row: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  cell: {
    flex: 1,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
    fontSize: font.body,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  head: { fontWeight: '600' },
  note: { padding: space.md, fontSize: font.caption + 1 },
  named: {
    padding: space.sm + 2,
    fontSize: font.body,
    fontWeight: '600',
    textAlign: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

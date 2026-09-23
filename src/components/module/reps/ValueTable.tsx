import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { solve } from '@/engine/solve';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';

type Spec = Extract<Representation, { kind: 'table' }>;

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
        ? solve(calc.module, [...givens, { id: spec.sweep, value: x }]).values[spec.output]
        : undefined,
    }));
  })();

  const head = (v: typeof sweep) => `${v.symbol}${v.unit ? ` (${v.unit})` : ''}`;

  return (
    <View style={[styles.table, { borderColor: c.border }]}>
      <View style={[styles.row, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.cell, styles.head, { color: c.text }]}>{head(sweep)}</Text>
        <Text style={[styles.cell, styles.head, { color: c.text }]}>{head(output)}</Text>
      </View>
      {rows.map(({ x, y }) => {
        const selected = current !== undefined && Math.abs(current - x) < 1e-9;
        return (
          <Pressable
            key={x}
            testID={`row-${x}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Use ${sweep.name} ${x}`}
            onPress={() => calc.set({ ...pinned, [spec.sweep]: x })}
            style={({ pressed }) => [
              styles.row,
              { borderBottomColor: c.border },
              (selected || pressed) && { backgroundColor: selected ? c.accent : c.surface },
            ]}
          >
            <Text style={[styles.cell, { color: selected ? c.onAccent : c.text }]}>
              {formatNumber(x, sweep)}
            </Text>
            <Text style={[styles.cell, { color: selected ? c.onAccent : c.text }]}>
              {y === undefined ? '?' : formatNumber(y, output)}
            </Text>
          </Pressable>
        );
      })}
      {!paramsKnown ? (
        <Text style={[styles.note, { color: c.textMuted }]}>
          {`Enter ${spec.params.map((id) => rep.variable(id).symbol).join(' and ')} to fill the table.`}
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
});

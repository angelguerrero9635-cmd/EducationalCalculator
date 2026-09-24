import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { formatNumber } from '@/engine/format';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';

export interface StepperItem {
  var: string;
  /** Step sizes in the shown unit, e.g. [1] or [1, 10]. */
  steps: number[];
  /** Values held fixed while this one changes (so the change flows to the total). */
  pin: string[];
}

/** Rows of − / + buttons that change values by fixed steps; part of a diagram's controls. */
export function Steppers({ calc, items }: { calc: Calculator; items: StepperItem[] }) {
  const c = usePalette();
  const rep = useRep(calc);

  const bump = (item: StepperItem, delta: number) => {
    const next = rep.shown(item.var) + delta;
    calc.set({
      ...rep.pin(item.pin),
      [item.var]: rep.snapTo(item.var, next * rep.factor(item.var)),
    });
  };

  const button = (item: StepperItem, delta: number) => (
    <Pressable
      key={delta}
      testID={`step-${item.var}-${delta > 0 ? '+' : '-'}${Math.abs(delta)}`}
      accessibilityRole="button"
      accessibilityLabel={`${delta > 0 ? 'Add' : 'Take away'} ${Math.abs(delta)} ${rep.variable(item.var).name}`}
      onPress={() => bump(item, delta)}
      style={({ pressed }) => [
        styles.button,
        { borderColor: c.border, backgroundColor: pressed ? c.surface : c.background },
      ]}
    >
      <Text style={styles.buttonText}>{`${delta > 0 ? '+' : '−'}${Math.abs(delta)}`}</Text>
    </Pressable>
  );

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const v = rep.variable(item.var);
        const known = rep.known(item.var);
        return (
          <View key={item.var} style={styles.row}>
            <View style={styles.buttons}>
              {[...item.steps].reverse().map((st) => button(item, -st))}
            </View>
            <Text style={[styles.label, { color: c.text }]} numberOfLines={1}>
              {`${v.name}: ${known ? formatNumber(rep.shown(item.var), v) : '?'}`}
            </Text>
            <View style={styles.buttons}>{item.steps.map((st) => button(item, st))}</View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.sm, paddingHorizontal: space.sm, marginTop: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  buttons: { flexDirection: 'row', gap: space.xs },
  button: {
    minWidth: 44,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  buttonText: { fontSize: font.body, fontWeight: '600' },
  label: { flex: 1, textAlign: 'center', fontSize: font.body },
});

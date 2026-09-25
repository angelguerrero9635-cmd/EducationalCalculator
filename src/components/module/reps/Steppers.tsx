import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';

export interface StepperItem {
  var: string;
  /** Step sizes in the shown unit, e.g. [1] or [1, 10]. */
  steps: number[];
  /** Values held fixed while this one changes (so the change flows to the total). */
  pin: string[];
  /** Wrap around within [min, max] (a clock's hours: 12 + 1 → 1). */
  wrap?: [number, number];
  /** Values the buttons jump over (a shape can't have 1 or 2 sides: 0 → 3). */
  skip?: number[];
  /** Shown before the label to tie the buttons to the picture, e.g. "●" for solid counters. */
  marker?: string;
}

/** Rows of − / + buttons that change values by fixed steps; part of a diagram's controls. */
export function Steppers({ calc, items }: { calc: Calculator; items: StepperItem[] }) {
  const c = usePalette();
  const rep = useRep(calc);

  const bump = (item: StepperItem, delta: number) => {
    // A "?" box starts from its smallest value (or 0), not from the example.
    const v = rep.variable(item.var);
    const from = rep.known(item.var)
      ? rep.shown(item.var)
      : Math.max(0, (v.min ?? 0) / rep.factor(item.var));
    let next = from + delta;
    while (item.skip?.includes(next)) next += Math.sign(delta);
    if (item.wrap) {
      const [lo, hi] = item.wrap;
      next = ((((next - lo) % (hi - lo + 1)) + (hi - lo + 1)) % (hi - lo + 1)) + lo;
    }
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
      accessibilityLabel={`${rep.variable(item.var).name}: ${delta > 0 ? 'add' : 'take away'} ${Math.abs(delta)}`}
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
        // The value with its unit ("250 g"), as everywhere else on the page.
        const label = (
          <Text style={[styles.label, { color: c.text }]} numberOfLines={1}>
            {`${item.marker ? `${item.marker} ` : ''}${v.name}${rep.elementary ? ` (${v.symbol})` : ''}: ${rep.words ? '' : `${v.symbol} = `}${rep.value(item.var)}`}
          </Text>
        );
        const minus = (
          <View style={styles.buttons}>
            {[...item.steps].reverse().map((st) => button(item, -st))}
          </View>
        );
        const plus = <View style={styles.buttons}>{item.steps.map((st) => button(item, st))}</View>;
        // One step size: − label +. Several: the label on its own line so it isn't squeezed.
        return item.steps.length > 1 ? (
          <View key={item.var} style={styles.stack}>
            {label}
            <View style={[styles.row, styles.spread]}>
              {minus}
              {plus}
            </View>
          </View>
        ) : (
          <View key={item.var} style={styles.row}>
            {minus}
            {label}
            {plus}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.sm, paddingHorizontal: space.sm, marginTop: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  stack: { gap: space.xs },
  spread: { justifyContent: 'space-between' },
  buttons: { flexDirection: 'row', gap: space.xs },
  button: {
    // 44 × 44 points: the smallest comfortable tap target.
    minWidth: 44,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  buttonText: { fontSize: font.body, fontWeight: '600' },
  label: { flex: 1, textAlign: 'center', fontSize: font.body },
});

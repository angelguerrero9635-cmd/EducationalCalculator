import { StyleSheet, View } from 'react-native';

import type { Representation } from '@/data/modules';
import { chart, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'equalGroups' }>;

/** Equal groups: one circle per group with the same number of dots in each. − / + change both. */
export function EqualGroups({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const g = rep.known(spec.groups) ? Math.max(0, Math.round(rep.shown(spec.groups))) : 0;
  const k = rep.known(spec.each) ? Math.max(0, Math.round(rep.shown(spec.each))) : 0;

  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.groups}>
        {Array.from({ length: g }, (_, i) => (
          <View key={i} style={[styles.group, { borderColor: c.chartInk }]}>
            {Array.from({ length: k }, (_, j) => (
              <View
                key={j}
                style={[
                  styles.dot,
                  // Past 16 dots, they shrink so a group of up to 100 still fits the circle.
                  k > 16 && { width: dotSize(k), height: dotSize(k), borderRadius: dotSize(k) / 2 },
                  { borderColor: c.chartInk, backgroundColor: c.chartHighlight },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <Caption>{`${rep.label(spec.groups)} groups of ${rep.label(spec.each)}   ·   ${rep.label(spec.total)} in all`}</Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.groups, steps: [1], pin: [spec.each] },
          { var: spec.each, steps: [1], pin: [spec.groups] },
        ]}
      />
    </View>
  );
}

/** Dot side for k dots in the 68 px inside of a group circle, with 2 px gaps. */
const dotSize = (k: number) => Math.max(4, Math.floor(60 / Math.ceil(Math.sqrt(k))) - 2);

const styles = StyleSheet.create({
  groups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  group: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: chart.stroke,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 10,
  },
  dot: { width: 13, height: 13, borderRadius: 7, borderWidth: chart.strokeLight },
});

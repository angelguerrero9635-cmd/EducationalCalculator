import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { font, radius, space, useCardShadow, usePalette } from '@/theme';

export interface Segment<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const c = usePalette();
  const shadow = useCardShadow();
  return (
    <View accessibilityRole="tablist" style={[styles.track, { backgroundColor: c.surface }]}>
      {segments.map((s) => {
        const selected = s.value === value;
        return (
          <Pressable
            key={s.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(s.value)}
            style={[styles.segment, selected && [{ backgroundColor: c.thumb }, shadow]]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? c.accent : c.text },
                selected && styles.selected,
              ]}
            >
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: space.sm - 1,
    paddingHorizontal: space.xs,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  label: { fontSize: font.caption + 1, fontWeight: '500' },
  selected: { fontWeight: '700' },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { font, radius, space, usePalette } from '@/theme';

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
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.track, { backgroundColor: c.surface, borderColor: c.border }]}
    >
      {segments.map((s) => {
        const selected = s.value === value;
        return (
          <Pressable
            key={s.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(s.value)}
            style={[styles.segment, selected && { backgroundColor: c.background }]}
          >
            <Text style={[styles.label, { color: c.text }, selected && styles.selected]}>
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
    borderRadius: radius.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: space.sm - 2,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  label: { fontSize: font.caption + 1 },
  selected: { fontWeight: '600' },
});

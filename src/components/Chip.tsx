import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/Text';

import { font, radius, space, usePalette } from '@/theme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  const c = usePalette();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={onPress ? { selected } : undefined}
      style={[
        styles.chip,
        {
          borderColor: c.border,
          backgroundColor: selected ? c.accent : c.surface,
        },
      ]}
    >
      <Text style={[styles.label, { color: selected ? c.onAccent : c.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: font.caption + 1 },
});

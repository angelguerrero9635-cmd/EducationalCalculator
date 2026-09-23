import { StyleSheet, Text, View } from 'react-native';

import { font, radius, space, usePalette } from '@/theme';

/** Grey wireframe box standing in for a feature built in a later phase. */
export function PlaceholderCard({ label, note }: { label: string; note?: string }) {
  const c = usePalette();
  return (
    <View
      accessible
      accessibilityLabel={`${label} placeholder`}
      style={[styles.card, { backgroundColor: c.placeholder, borderColor: c.border }]}
    >
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      <Text style={[styles.note, { color: c.textMuted }]}>{note ?? 'Coming soon'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 110,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
    gap: space.xs,
  },
  label: { fontSize: font.body, fontWeight: '600' },
  note: { fontSize: font.caption },
});

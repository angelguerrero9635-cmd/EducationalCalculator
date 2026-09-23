import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RouteTarget } from '@/data/selectors';
import { push } from '@/navigation';
import { font, space, usePalette } from '@/theme';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Small caption shown above the title. */
  overline?: string;
  /** Navigates here on press (shows a chevron). */
  route?: RouteTarget;
  onPress?: () => void;
  /** Shows a checkmark instead of a chevron. */
  selected?: boolean;
  accessory?: 'chevron' | 'check' | 'none';
  testID?: string;
}

export function ListRow({
  title,
  subtitle,
  overline,
  route,
  onPress,
  selected,
  accessory,
  testID,
}: ListRowProps) {
  const c = usePalette();
  const handlePress = onPress ?? (route ? () => push(route) : undefined);
  const kind = accessory ?? (selected !== undefined ? 'check' : handlePress ? 'chevron' : 'none');

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={!handlePress}
      accessibilityRole={handlePress ? 'button' : undefined}
      accessibilityState={selected !== undefined ? { selected } : undefined}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? c.surface : c.background, borderBottomColor: c.border },
      ]}
    >
      <View style={styles.text}>
        {overline ? <Text style={[styles.overline, { color: c.textMuted }]}>{overline}</Text> : null}
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: c.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {kind === 'chevron' ? <Text style={[styles.accessory, { color: c.textMuted }]}>›</Text> : null}
      {kind === 'check' ? (
        <Text style={[styles.accessory, { color: c.text }]}>{selected ? '✓' : ' '}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1, gap: 2 },
  overline: { fontSize: font.caption, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: font.body },
  subtitle: { fontSize: font.caption + 1 },
  accessory: { fontSize: 22, marginLeft: space.sm, width: 16, textAlign: 'center' },
});

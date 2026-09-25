import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import type { RouteTarget } from '@/data/selectors';
import { push } from '@/navigation';
import { font, radius, space, useCardShadow, usePalette } from '@/theme';

import { useInGroup } from './Group';
import { Icon } from './Icon';

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

/**
 * One item in a list. On its own it is a rounded box (a card) with space around it; inside a
 * `Group` it is a flat row, and the group draws the box and the lines between rows.
 */
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
  const shadow = useCardShadow();
  const inGroup = useInGroup();
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
        inGroup
          ? { backgroundColor: pressed ? c.surface : c.card }
          : [styles.card, { backgroundColor: pressed ? c.surface : c.card }, shadow],
      ]}
    >
      <View style={styles.text}>
        {overline ? <Text style={[styles.overline, { color: c.accent }]}>{overline}</Text> : null}
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {kind === 'chevron' ? <Icon name="chevron" size={18} color={c.textMuted} /> : null}
      {kind === 'check' && selected ? <Icon name="check" size={20} color={c.accent} /> : null}
      {kind === 'check' && !selected ? <View style={styles.empty} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 52,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
  },
  card: { marginHorizontal: space.lg, marginBottom: space.sm, borderRadius: radius.lg },
  text: { flex: 1, gap: 2 },
  overline: {
    fontSize: font.caption - 1,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: { fontSize: font.body, fontWeight: '600' },
  subtitle: { fontSize: font.caption + 1, lineHeight: 18 },
  empty: { width: 20 },
});

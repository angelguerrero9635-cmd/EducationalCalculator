import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { space, type, usePalette } from '@/theme';

/** A heading between groups of content, with an optional action on the right ("Edit", "See all"). */
export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const c = usePalette();
  return (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={[type.title2, styles.title, { color: c.text }]}>
        {title}
      </Text>
      {action && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[type.callout, styles.actionText, { color: c.accent }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    paddingBottom: space.md,
  },
  title: { flex: 1 },
  action: { minHeight: 32, justifyContent: 'flex-end' },
  actionText: { fontWeight: '600' },
});

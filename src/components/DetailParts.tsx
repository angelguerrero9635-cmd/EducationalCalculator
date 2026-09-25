import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import type { RefreshRow } from '@/data/selectors';
import { push } from '@/navigation';
import { font, radius, space, usePalette } from '@/theme';

import { EmptyState } from './EmptyState';
import { Icon } from './Icon';
import { SectionHeader } from './SectionHeader';

/** Title block at the top of a detail screen. */
export function DetailHeader({ title, lines }: { title: string; lines: string[] }) {
  const c = usePalette();
  return (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
        {title}
      </Text>
      {lines.map((line) => (
        <Text key={line} style={[styles.line, { color: c.textMuted }]}>
          {line}
        </Text>
      ))}
    </View>
  );
}

/**
 * "Refresh" section: links back to where each prerequisite was taught, as one row of chips so
 * the lesson's picture and first numbers stay on the first screen.
 */
export function RefreshSection({
  title = 'Refresh',
  rows,
}: {
  title?: string;
  rows: RefreshRow[];
}) {
  const c = usePalette();
  return (
    <>
      <SectionHeader title={title} />
      {rows.length ? (
        <View style={styles.chips}>
          {rows.map((row) => (
            <Pressable
              key={row.id}
              testID={`refresh-${row.id}`}
              accessibilityRole="link"
              accessibilityLabel={`${row.label}: ${row.title}`}
              onPress={() => push(row.route)}
              style={({ pressed }) => [
                styles.chip,
                { borderColor: c.border, backgroundColor: pressed ? c.surface : c.card },
              ]}
            >
              <Text style={[styles.chipText, { color: c.text }]} numberOfLines={1}>
                {row.title}
              </Text>
              <Icon name="chevron" size={16} color={c.textMuted} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={[styles.note, { color: c.textMuted }]}>
          Nothing to review first. This is a starting point.
        </Text>
      )}
    </>
  );
}

/** Shown instead of content when config/access.ts reports the node as locked. */
export function LockedState() {
  return (
    <EmptyState
      title="Premium content"
      message="Start a free trial to unlock this."
      actionLabel="See plans"
      onAction={() => router.push('/paywall')}
    />
  );
}

const styles = StyleSheet.create({
  header: { padding: space.lg, gap: space.xs },
  title: { fontSize: font.title, fontWeight: '700' },
  line: { fontSize: font.body - 1 },
  note: { fontSize: font.caption + 1, padding: space.lg },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 44,
    maxWidth: '100%',
    paddingVertical: space.xs,
    paddingLeft: space.md,
    paddingRight: space.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.pill,
  },
  chipText: { fontSize: font.body - 1, fontWeight: '600', flexShrink: 1 },
});

import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import type { RefreshRow } from '@/data/selectors';
import { font, space, usePalette } from '@/theme';

import { EmptyState } from './EmptyState';
import { RefreshLinkRow } from './RefreshLinkRow';
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

/** "Refresh" section: links back to where each prerequisite was taught. */
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
        rows.map((row) => <RefreshLinkRow key={row.id} link={row} />)
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
});

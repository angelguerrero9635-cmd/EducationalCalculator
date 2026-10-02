import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { monthly, PRICES } from '@/config/pricing';
import type { Crumb, RefreshRow } from '@/data/selectors';
import { push } from '@/navigation';
import { font, radius, space, type, usePalette } from '@/theme';

import { useLayoutSize } from './layoutSize';
import { Breadcrumbs } from './shell/Breadcrumbs';
import { webData } from './webData';

import { EmptyState } from './EmptyState';
import { Icon } from './Icon';
import { SectionHeader } from './SectionHeader';

/**
 * The title block at the top of a page: on phones the breadcrumbs (wide screens show them in
 * the top bar), an optional overline, the page's title and its subtitle lines.
 */
export function DetailHeader({
  title,
  lines = [],
  overline,
  trail,
}: {
  title: string;
  lines?: string[];
  overline?: string;
  trail?: Crumb[];
}) {
  const c = usePalette();
  const size = useLayoutSize();
  const showTrail = trail && trail.length > 1 && (Platform.OS === 'web' || size !== 'wide');
  return (
    <View style={styles.header}>
      {showTrail ? (
        <View {...webData({ shell: 'narrow' })} style={styles.trail}>
          <Breadcrumbs trail={trail} scroll />
        </View>
      ) : null}
      {overline ? <Text style={[type.overline, { color: c.accent }]}>{overline}</Text> : null}
      <Text accessibilityRole="header" style={[type.title1, { color: c.text }]}>
        {title}
      </Text>
      {lines.map((line) => (
        <Text key={line} style={[type.callout, { color: c.textMuted }]}>
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
      title="Part of a plan"
      message={`Kindergarten to Grade 12 is ${monthly(PRICES.k12.usd)}, and each college course is ${monthly(PRICES.course.usd)}.`}
      actionLabel="See plans"
      onAction={() => router.push('/paywall')}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.md,
    gap: space.xs,
  },
  trail: { marginBottom: space.sm },
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

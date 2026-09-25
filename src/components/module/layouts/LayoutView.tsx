import { StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/components/SectionHeader';
import { Text } from '@/components/Text';
import { isEarlyGrade } from '@/data/modules';
import type { LayoutDef } from '@/data/modules/layouts';
import { font, space, usePalette } from '@/theme';

import { ExploreLayout } from './ExploreLayout';
import { ObserveLayout } from './ObserveLayout';
import { SequenceLayout } from './SequenceLayout';
import { SortLayout } from './SortLayout';

/** Section title for a layout page. */
export const layoutTitle = (l: LayoutDef) =>
  l.kind === 'sort'
    ? 'Sort'
    : l.kind === 'sequence'
      ? 'Put in order'
      : l.kind === 'explore'
        ? 'Explore'
        : 'Record and look';

/** A page laid out as a sort, a sequence, an exploration or an observation. */
export function LayoutView({ layout }: { layout: LayoutDef }) {
  const c = usePalette();
  const early = isEarlyGrade(layout.id);
  return (
    <>
      <SectionHeader title={layoutTitle(layout)} />
      {layout.kind === 'sort' ? (
        <SortLayout spec={layout} />
      ) : layout.kind === 'sequence' ? (
        <SequenceLayout spec={layout} />
      ) : layout.kind === 'explore' ? (
        <ExploreLayout spec={layout} />
      ) : (
        <ObserveLayout spec={layout} />
      )}
      <SectionHeader title={early ? 'Good to know' : 'Assumptions'} />
      <View style={styles.bullets}>
        {layout.assumptions.map((a) => (
          <View key={a} style={styles.bullet}>
            <Text style={[styles.dot, { color: c.textMuted }]}>•</Text>
            <Text style={[styles.bulletText, { color: c.text }]}>{a}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bullets: { paddingHorizontal: space.lg, gap: space.sm },
  bullet: { flexDirection: 'row', gap: space.sm },
  dot: { fontSize: font.body, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: font.body, lineHeight: 22 },
});

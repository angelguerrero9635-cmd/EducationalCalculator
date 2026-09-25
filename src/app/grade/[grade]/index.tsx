import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, SegmentedControl, Tile, TileGrid } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { gradeMeta } from '@/data/meta';
import { SUBJECTS, gradeStrands, isGrade, isSubject, subjectLabel } from '@/data/selectors';
import { gradeLabel, GRADES, type K12Subject } from '@/data/taxonomy';
import { space, usePalette } from '@/theme';

const SEGMENTS = SUBJECTS.map((s) => ({ value: s, label: subjectLabel(s) }));

/** Pre-render every grade page (web static rendering). */
export function generateStaticParams(): { grade: string }[] {
  return GRADES.map((grade) => ({ grade }));
}

/** A grade: a box for each strand (topic) of the chosen subject. */
export default function GradeScreen() {
  const c = usePalette();
  const params = useLocalSearchParams<{ grade: string; subject?: string }>();
  const grade = String(params.grade);
  // The selected subject lives in the URL so deep links (e.g. Home cards) open the right tab.
  const subject: K12Subject = params.subject && isSubject(params.subject) ? params.subject : 'math';

  if (!isGrade(grade)) {
    return <EmptyState title="Grade not found" message={`There is no grade “${grade}”.`} />;
  }
  const strands = gradeStrands(grade, subject);

  return (
    <>
      <Stack.Screen options={{ title: gradeLabel(grade) }} />
      <PageMeta {...gradeMeta(grade)} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.page}
      >
        <View style={styles.segment}>
          <SegmentedControl
            segments={SEGMENTS}
            value={subject}
            onChange={(next) => router.setParams({ subject: next })}
          />
        </View>
        {strands.length ? (
          <TileGrid>
            {strands.map((s, i) => (
              <Tile
                key={s.slug}
                testID={`strand-${s.slug}`}
                icon={s.icon}
                tone={i}
                title={s.title}
                subtitle={s.subtitle}
                route={s.route}
              />
            ))}
          </TileGrid>
        ) : (
          <EmptyState
            title={`No ${subjectLabel(subject).toLowerCase()} skills in this grade yet`}
          />
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  page: { paddingBottom: space.xxl },
  segment: { padding: space.lg },
});

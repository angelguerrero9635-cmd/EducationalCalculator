import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SectionList, StyleSheet, View } from 'react-native';

import { EmptyState, ListRow, SectionHeader, SegmentedControl } from '@/components';
import { renderAllOnWeb } from '@/components/listProps';
import { PageMeta } from '@/components/PageMeta';
import { gradeMeta } from '@/data/meta';
import {
  SUBJECTS,
  gradeSections,
  isGrade,
  isSubject,
  skillRoute,
  subjectLabel,
} from '@/data/selectors';
import { gradeLabel, GRADES, type K12Subject } from '@/data/taxonomy';
import { space, usePalette } from '@/theme';

const SEGMENTS = SUBJECTS.map((s) => ({ value: s, label: subjectLabel(s) }));

/** Pre-render every grade page (web static rendering). */
export function generateStaticParams(): { grade: string }[] {
  return GRADES.map((grade) => ({ grade }));
}

export default function GradeScreen() {
  const c = usePalette();
  const params = useLocalSearchParams<{ grade: string; subject?: string }>();
  const grade = String(params.grade);
  // The selected subject lives in the URL so deep links (e.g. Home cards) open the right tab.
  const subject: K12Subject = params.subject && isSubject(params.subject) ? params.subject : 'math';

  if (!isGrade(grade)) {
    return <EmptyState title="Grade not found" message={`There is no grade “${grade}”.`} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: gradeLabel(grade) }} />
      <PageMeta {...gradeMeta(grade)} />
      <SectionList
        {...renderAllOnWeb}
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: c.background }}
        sections={gradeSections(grade, subject)}
        keyExtractor={(s) => s.id}
        ListHeaderComponent={
          <View style={styles.segment}>
            <SegmentedControl
              segments={SEGMENTS}
              value={subject}
              onChange={(next) => router.setParams({ subject: next })}
            />
          </View>
        }
        renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
        renderItem={({ item }) => (
          <ListRow testID={`skill-${item.id}`} title={item.title} route={skillRoute(item.id)} />
        )}
        ListEmptyComponent={
          <EmptyState
            title={`No ${subjectLabel(subject).toLowerCase()} skills in this grade yet`}
          />
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  segment: { padding: space.lg },
});

import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SectionList, StyleSheet, View } from 'react-native';

import { EmptyState, Group, ListRow, SectionHeader, SegmentedControl } from '@/components';
import { renderAllOnWeb } from '@/components/listProps';
import { PageMeta } from '@/components/PageMeta';
import { gradeMeta } from '@/data/meta';
import {
  SUBJECTS,
  gradeSkillCards,
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
        sections={gradeSkillCards(grade, subject)}
        contentContainerStyle={styles.page}
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
          // One box per skill, with its problem types listed inside it.
          <View style={styles.card}>
            <Group>
              <ListRow
                testID={`skill-${item.id}`}
                title={item.skill.title}
                subtitle={item.skill.subtitle}
                route={skillRoute(item.id)}
              />
              {item.types.map((t) => (
                <ListRow
                  key={t.id}
                  testID={`skill-${t.id}`}
                  overline="Problem type"
                  title={t.title}
                  subtitle={t.subtitle}
                  route={skillRoute(t.id)}
                />
              ))}
            </Group>
          </View>
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
  page: { paddingBottom: space.xxl },
  segment: { padding: space.lg, paddingBottom: 0 },
  card: { marginBottom: space.md },
});

import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  DetailHeader,
  EmptyState,
  NotFound,
  Page,
  SegmentedControl,
  Tile,
  TileGrid,
} from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { gradeMeta } from '@/data/meta';
import {
  SUBJECTS,
  countLabel,
  gradeStrands,
  isGrade,
  isSubject,
  subjectLabel,
  trailOf,
} from '@/data/selectors';
import { gradeLabel, GRADES, skillsFor, type K12Subject } from '@/data/taxonomy';
import { space } from '@/theme';

const SEGMENTS = SUBJECTS.map((s) => ({ value: s, label: subjectLabel(s) }));

/** Pre-render every grade page (web static rendering). */
export function generateStaticParams(): { grade: string }[] {
  return GRADES.map((grade) => ({ grade }));
}

/** A grade: a box for each strand (topic) of the chosen subject. */
export default function GradeScreen() {
  const params = useLocalSearchParams<{ grade: string; subject?: string }>();
  const grade = String(params.grade);
  // The selected subject lives in the URL so deep links (e.g. Home cards) open the right tab.
  const subject: K12Subject = params.subject && isSubject(params.subject) ? params.subject : 'math';

  if (!isGrade(grade)) {
    return <NotFound />;
  }
  const strands = gradeStrands(grade, subject);

  return (
    <>
      <Stack.Screen options={{ title: gradeLabel(grade) }} />
      <PageMeta {...gradeMeta(grade)} />
      <Page>
        <DetailHeader
          title={gradeLabel(grade)}
          lines={[
            SUBJECTS.map(
              (s) =>
                `${countLabel(skillsFor(grade, s).length, 'skill')} in ${subjectLabel(s).toLowerCase()}`,
            ).join(' · '),
          ]}
          trail={trailOf('grade/[grade]/index', { grade })}
        />
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
      </Page>
    </>
  );
}

const styles = StyleSheet.create({
  segment: { paddingHorizontal: space.lg, paddingBottom: space.lg, maxWidth: 480 },
});

import { Stack, useLocalSearchParams } from 'expo-router';

import { DetailHeader, ListRow, NotFound, Page, SkillBox } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import {
  gradeStrands,
  isGrade,
  problemTypes,
  skillRoute,
  strandView,
  subjectLabel,
  SUBJECTS,
  trailOf,
} from '@/data/selectors';
import { skillIcons } from '@/data/icons';
import { gradeLabel, GRADES } from '@/data/taxonomy';

/** Pre-render every strand page (web static rendering). */
export function generateStaticParams(): { grade: string; strand: string }[] {
  return GRADES.flatMap((grade) =>
    SUBJECTS.flatMap((subject) =>
      gradeStrands(grade, subject).map((s) => ({ grade, strand: s.slug })),
    ),
  );
}

/**
 * A strand (topic) in a grade: a bordered box per skill, its title at the top and its lessons
 * (the main lesson, then each problem type) as rows inside.
 */
export default function StrandScreen() {
  const params = useLocalSearchParams<{ grade: string; strand: string }>();
  const grade = String(params.grade);
  const view = isGrade(grade) ? strandView(grade, String(params.strand)) : undefined;

  if (!isGrade(grade) || !view) {
    return <NotFound />;
  }
  const where = `${gradeLabel(grade)} ${subjectLabel(view.subject)}`;
  const icons = skillIcons(view.skills);

  return (
    <>
      <Stack.Screen options={{ title: view.title }} />
      <PageMeta
        title={`${view.title} – ${where}`}
        description={`${where}: ${view.skills.map((s) => s.title).join(', ')}.`}
      />
      <Page width="read">
        <DetailHeader
          overline={where}
          title={view.title}
          trail={trailOf('grade/[grade]/[strand]', { grade, strand: String(params.strand) })}
        />
        {view.skills.map((s, i) => {
          const types = problemTypes(s.id);
          return (
            <SkillBox key={s.id} testID={`skill-${s.id}`} icon={icons[i]} tone={i} title={s.title}>
              <ListRow
                flush
                testID={`lesson-${s.id}`}
                title="Main lesson"
                route={skillRoute(s.id)}
              />
              {types.map((t) => (
                <ListRow
                  key={t.id}
                  flush
                  testID={`lesson-${t.id}`}
                  title={t.title}
                  subtitle={t.use}
                  route={skillRoute(t.id)}
                />
              ))}
            </SkillBox>
          );
        })}
      </Page>
    </>
  );
}

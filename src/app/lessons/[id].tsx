import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { EmptyState, ListRow, SkillBox } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import {
  getSkill,
  problemTypes,
  skillRoute,
  skillsWithTypes,
  subjectLabel,
} from '@/data/selectors';
import { skillIcons } from '@/data/icons';
import { gradeLabel } from '@/data/taxonomy';
import { space, usePalette } from '@/theme';

/** Pre-render the lessons page of every skill with problem types (web static rendering). */
export function generateStaticParams(): { id: string }[] {
  return skillsWithTypes().map((id) => ({ id }));
}

/** A skill's lessons: the main lesson and one row for each problem type, in the skill's box. */
export default function LessonsScreen() {
  const c = usePalette();
  const id = String(useLocalSearchParams<{ id: string }>().id);
  const skill = getSkill(id);

  if (!skill) return <EmptyState title="Skill not found" message={id} />;
  const types = problemTypes(skill.id);
  const where = `${gradeLabel(skill.grade)} ${subjectLabel(skill.subject)}`;
  const [icon] = skillIcons([skill]);

  return (
    <>
      <Stack.Screen options={{ title: skill.title }} />
      <PageMeta
        title={`${skill.title} – ${where}`}
        description={`${where}. The main lesson and ${types.length} problem types: ${types.map((t) => t.title).join(', ')}.`}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.page}
      >
        <SkillBox testID={`skill-${skill.id}`} icon={icon} tone={0} title={skill.title}>
          <ListRow
            flush
            testID={`lesson-${skill.id}`}
            title="Main lesson"
            route={skillRoute(skill.id)}
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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  page: { paddingVertical: space.lg },
});

import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { EmptyState, Tile, TileGrid } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import {
  getSkill,
  problemTypes,
  skillRoute,
  skillsWithTypes,
  subjectLabel,
} from '@/data/selectors';
import { problemTypeIcon, skillIcon } from '@/data/icons';
import { gradeLabel } from '@/data/taxonomy';
import { space, usePalette } from '@/theme';

/** Pre-render the lessons page of every skill with problem types (web static rendering). */
export function generateStaticParams(): { id: string }[] {
  return skillsWithTypes().map((id) => ({ id }));
}

/** A skill's lessons: a box for the main lesson and one for each problem type. */
export default function LessonsScreen() {
  const c = usePalette();
  const id = String(useLocalSearchParams<{ id: string }>().id);
  const skill = getSkill(id);

  if (!skill) return <EmptyState title="Skill not found" message={id} />;
  const types = problemTypes(skill.id);
  const where = `${gradeLabel(skill.grade)} ${subjectLabel(skill.subject)}`;

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
        <TileGrid>
          <Tile
            testID={`lesson-${skill.id}`}
            icon={skillIcon(skill)}
            tone={0}
            title="Main lesson"
            subtitle={skill.title}
            route={skillRoute(skill.id)}
          />
          {types.map((t, i) => (
            <Tile
              key={t.id}
              testID={`lesson-${t.id}`}
              icon={problemTypeIcon(t.title, skill)}
              tone={i + 1}
              title={t.title}
              subtitle={t.use}
              route={skillRoute(t.id)}
            />
          ))}
        </TileGrid>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  page: { paddingVertical: space.lg },
});

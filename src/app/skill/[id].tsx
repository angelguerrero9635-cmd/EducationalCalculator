import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  DetailHeader,
  EmptyState,
  ModuleSections,
  LockedState,
  RefreshSection,
  SectionHeader,
  Tile,
  TileGrid,
} from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { isLocked } from '@/config/access';
import { problemTypeMeta, skillMeta } from '@/data/meta';
import {
  getProblemType,
  getSkill,
  PROBLEM_TYPE_IDS,
  problemTypes,
  refreshRows,
  skillRoute,
  subjectLabel,
} from '@/data/selectors';
import { lessonIcons } from '@/data/icons';
import { gradeLabel, SKILLS } from '@/data/taxonomy';
import { useTrackRecent } from '@/state';
import { space, usePalette } from '@/theme';

/** Pre-render every skill page (web static rendering). */
export function generateStaticParams(): { id: string }[] {
  return [...SKILLS.map((s) => s.id), ...PROBLEM_TYPE_IDS].map((id) => ({ id }));
}

export default function SkillScreen() {
  const c = usePalette();
  const id = String(useLocalSearchParams<{ id: string }>().id);
  // A skill's main module, or one of its problem types ("m.1.add-sub-20~compare").
  const type = getProblemType(id);
  const skill = getSkill(id) ?? type?.skill;
  useTrackRecent(skill ? id : undefined);

  if (!skill) return <EmptyState title="Skill not found" message={id} />;
  if (isLocked(skill.id)) return <LockedState />;

  const title = type?.title ?? skill.title;
  // Links to the skill's other problem types (and back to the main lesson from a type).
  const related = [
    ...(type ? [{ id: skill.id, title: skill.title, subtitle: 'Main lesson' }] : []),
    ...problemTypes(skill.id)
      .filter((t) => t.id !== id)
      .map((t) => ({ id: t.id, title: t.title, subtitle: t.use ?? 'Problem type' })),
  ];

  // The same icons as on the skill's lessons page.
  const types = problemTypes(skill.id);
  const icons = lessonIcons(
    skill,
    types.map((t) => t.title),
  );
  const iconOf = (lessonId: string) =>
    icons[lessonId === skill.id ? 0 : types.findIndex((t) => t.id === lessonId) + 1];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      style={{ backgroundColor: c.background }}
    >
      <Stack.Screen options={{ title }} />
      <PageMeta {...(type ? problemTypeMeta(type) : skillMeta(skill))} />
      <DetailHeader
        title={title}
        lines={[
          `${gradeLabel(skill.grade)} · ${subjectLabel(skill.subject)}`,
          type ? `Problem type · ${skill.title}` : `Strand: ${skill.strand}`,
          ...(type?.use ? [type.use] : []),
        ]}
      />
      <RefreshSection rows={refreshRows(skill.id)} />
      <ModuleSections id={id} />
      {related.length ? (
        <>
          <SectionHeader title={type ? 'Related lessons' : 'More problem types'} />
          <TileGrid>
            {related.map((r, i) => (
              <Tile
                key={r.id}
                testID={`related-${r.id}`}
                icon={iconOf(r.id)}
                tone={i}
                title={r.title}
                subtitle={r.subtitle}
                route={skillRoute(r.id)}
              />
            ))}
          </TileGrid>
          <View style={styles.end} />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  end: { height: space.xxl },
});

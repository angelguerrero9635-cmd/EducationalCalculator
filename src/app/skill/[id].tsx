import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';

import {
  DetailHeader,
  EmptyState,
  ModuleSections,
  LockedState,
  RefreshSection,
} from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { isLocked } from '@/config/access';
import { skillMeta } from '@/data/meta';
import { getSkill, refreshRows, subjectLabel } from '@/data/selectors';
import { gradeLabel, SKILLS } from '@/data/taxonomy';
import { useTrackRecent } from '@/state';
import { usePalette } from '@/theme';

/** Pre-render every skill page (web static rendering). */
export function generateStaticParams(): { id: string }[] {
  return SKILLS.map((s) => ({ id: s.id }));
}

export default function SkillScreen() {
  const c = usePalette();
  const id = String(useLocalSearchParams<{ id: string }>().id);
  const skill = getSkill(id);
  useTrackRecent(skill?.id);

  if (!skill) return <EmptyState title="Skill not found" message={id} />;
  if (isLocked(skill.id)) return <LockedState />;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      style={{ backgroundColor: c.background }}
    >
      <Stack.Screen options={{ title: skill.title }} />
      <PageMeta {...skillMeta(skill)} />
      <DetailHeader
        title={skill.title}
        lines={[
          `${gradeLabel(skill.grade)} · ${subjectLabel(skill.subject)}`,
          `Strand: ${skill.strand}`,
        ]}
      />
      <RefreshSection rows={refreshRows(skill.id)} />
      <ModuleSections id={skill.id} />
    </ScrollView>
  );
}

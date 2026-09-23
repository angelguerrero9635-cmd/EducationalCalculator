import { useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';

import {
  DetailHeader,
  EmptyState,
  ModuleSections,
  LockedState,
  RefreshSection,
} from '@/components';
import { isLocked } from '@/config/access';
import { getSkill, refreshRows, subjectLabel } from '@/data/selectors';
import { gradeLabel } from '@/data/taxonomy';
import { useTrackRecent } from '@/state';
import { usePalette } from '@/theme';

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

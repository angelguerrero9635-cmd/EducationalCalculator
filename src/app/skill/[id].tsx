import { useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';

import {
  DetailHeader,
  EmptyState,
  LearnPlaceholders,
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
      <LearnPlaceholders />
    </ScrollView>
  );
}

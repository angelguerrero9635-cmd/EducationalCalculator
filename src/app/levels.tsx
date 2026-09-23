import { ScrollView, StyleSheet, Text } from 'react-native';

import { LevelPicker } from '@/components';
import { useSelectedLevels } from '@/state';
import { font, space, usePalette } from '@/theme';

/** Settings → edit the onboarding selections. Changes save immediately. */
export default function LevelsScreen() {
  const c = usePalette();
  const { levels, toggleLevel } = useSelectedLevels();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      style={{ backgroundColor: c.background }}
    >
      <Text style={[styles.body, { color: c.textMuted }]}>
        Your picks become cards under My Courses on Home.
      </Text>
      <LevelPicker selected={levels} onToggle={toggleLevel} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.lg },
  body: { fontSize: font.body },
});

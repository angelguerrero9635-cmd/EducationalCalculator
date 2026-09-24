import { ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/Text';

import { LevelPicker } from '@/components';
import { useSelectedLevels } from '@/state';
import { font, space, usePalette } from '@/theme';
import { PageMeta } from '@/components/PageMeta';

/** Settings → edit the onboarding selections. Changes save immediately. */
export default function LevelsScreen() {
  const c = usePalette();
  const { levels, toggleLevel } = useSelectedLevels();
  return (
    <>
      <PageMeta
        title={'What You Study'}
        description="Pick the grades and university fields you study to see them on your home page."
      />
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
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.lg },
  body: { fontSize: font.body },
});

import { StyleSheet, View } from 'react-native';

import { DetailHeader, LevelPicker, Page } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { useSelectedLevels } from '@/state';
import { space } from '@/theme';

/** Settings → edit the onboarding selections. Changes save immediately. */
export default function LevelsScreen() {
  const { levels, toggleLevel } = useSelectedLevels();
  return (
    <>
      <PageMeta
        title={'What You Study'}
        description="Pick the grades and university fields you study to see them on your home page."
      />
      <Page width="narrow">
        <DetailHeader
          title="What you study"
          lines={['Your picks become cards under My courses on Home. Changes save as you tap.']}
        />
        <View style={styles.picker}>
          <LevelPicker selected={levels} onToggle={toggleLevel} />
        </View>
      </Page>
    </>
  );
}

const styles = StyleSheet.create({
  picker: { paddingHorizontal: space.lg },
});

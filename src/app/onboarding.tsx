import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, LevelPicker } from '@/components';
import type { LevelKey } from '@/data/selectors';
import { useSelectedLevels } from '@/state';
import { font, space, usePalette } from '@/theme';
import { PageMeta } from '@/components/PageMeta';

/** First launch only. Completing or skipping flips the `onboarded` guard in the root layout. */
export default function OnboardingScreen() {
  const c = usePalette();
  const { completeOnboarding } = useSelectedLevels();
  const [selected, setSelected] = useState<LevelKey[]>([]);

  const toggle = (key: LevelKey) =>
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  return (
    <>
      <PageMeta
        title={'Welcome'}
        description="Get started: pick the grades or university fields you study."
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        <View style={styles.topBar}>
          <Button label="Skip" variant="link" onPress={() => completeOnboarding([])} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={[styles.headline, { color: c.text }]}>
            What are you studying?
          </Text>
          <Text style={[styles.body, { color: c.textMuted }]}>
            Pick any grade levels and college fields. You can change this anytime in Settings.
          </Text>
          <LevelPicker selected={selected} onToggle={toggle} />
        </ScrollView>
        <View style={[styles.footer, { borderTopColor: c.border }]}>
          <Button
            testID="onboarding-continue"
            label={selected.length ? `Continue (${selected.length})` : 'Continue'}
            onPress={() => completeOnboarding(selected)}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { alignItems: 'flex-end', paddingHorizontal: space.sm },
  content: { padding: space.lg, gap: space.lg },
  headline: { fontSize: font.headline, fontWeight: '700' },
  body: { fontSize: font.body },
  footer: { padding: space.lg, borderTopWidth: StyleSheet.hairlineWidth },
});

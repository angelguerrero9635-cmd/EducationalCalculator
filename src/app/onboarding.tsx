import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, LevelPicker, Logo } from '@/components';
import { OnboardingWelcome } from '@/components/art';
import { PageMeta } from '@/components/PageMeta';
import { Text } from '@/components/Text';
import { SITE_NAME, SITE_SLOGAN } from '@/config/site';
import type { LevelKey } from '@/data/selectors';
import { useSelectedLevels } from '@/state';
import { layout, space, type, usePalette } from '@/theme';

/**
 * First launch only, in two steps: a welcome, then picking grades and fields. Completing or
 * skipping flips the `onboarded` guard in the root layout.
 */
export default function OnboardingScreen() {
  const c = usePalette();
  const { completeOnboarding } = useSelectedLevels();
  const [step, setStep] = useState<'welcome' | 'pick'>('welcome');
  const [selected, setSelected] = useState<LevelKey[]>([]);

  const toggle = (key: LevelKey) =>
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  return (
    <>
      <PageMeta
        noindex
        title={'Welcome'}
        description="Get started: pick the grades or university fields you study."
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        {step === 'welcome' ? (
          <View style={styles.welcome}>
            <View style={styles.column}>
              <Logo size={72} />
              <Text style={[type.overline, { color: c.textMuted }]}>{SITE_NAME}</Text>
              <OnboardingWelcome width={320} />
              <Text
                accessibilityRole="header"
                style={[type.display, styles.center, { color: c.text }]}
              >
                {SITE_SLOGAN}
              </Text>
              <Text style={[type.body, styles.center, { color: c.textMuted }]}>
                Lessons with pictures you can move, from Kindergarten to university.
              </Text>
              <View style={styles.actions}>
                <Button
                  testID="onboarding-start"
                  label="Get started"
                  onPress={() => setStep('pick')}
                />
                <Button
                  label="Skip for now"
                  variant="link"
                  onPress={() => completeOnboarding([])}
                />
              </View>
            </View>
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.pickScroll}>
              <View style={[styles.column, styles.pick]}>
                <Text accessibilityRole="header" style={[type.title1, { color: c.text }]}>
                  What are you studying?
                </Text>
                <Text style={[type.callout, { color: c.textMuted }]}>
                  Pick any grades and college fields. You can change this anytime in Settings.
                </Text>
                <LevelPicker selected={selected} onToggle={toggle} />
              </View>
            </ScrollView>
            <View
              style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.background }]}
            >
              <View style={[styles.column, styles.footerRow]}>
                <Button label="Skip" variant="link" onPress={() => completeOnboarding([])} />
                <Button
                  testID="onboarding-continue"
                  label={selected.length ? `Continue (${selected.length})` : 'Continue'}
                  onPress={() => completeOnboarding(selected)}
                />
              </View>
            </View>
          </>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  welcome: { flex: 1, justifyContent: 'center', padding: space.xl },
  column: {
    width: '100%',
    maxWidth: layout.content.narrow,
    alignSelf: 'center',
    alignItems: 'center',
    gap: space.md,
  },
  center: { textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: space.sm, marginTop: space.lg },
  pickScroll: { padding: space.lg },
  pick: { alignItems: 'stretch' },
  footer: { padding: space.lg, borderTopWidth: StyleSheet.hairlineWidth },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
});

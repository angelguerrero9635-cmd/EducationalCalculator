import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { Button, ListRow } from '@/components';
import { font, space, usePalette } from '@/theme';
import { PageMeta } from '@/components/PageMeta';

type Plan = 'monthly' | 'annual';

const PLANS: { value: Plan; title: string; price: string }[] = [
  { value: 'monthly', title: 'Monthly', price: '$—.— / month' },
  { value: 'annual', title: 'Annual', price: '$—.— / year' },
];

/** Placeholder paywall. No purchase logic: Continue is disabled and Restore does nothing. */
export default function PaywallScreen() {
  const c = usePalette();
  const [plan, setPlan] = useState<Plan>('annual');

  return (
    <>
      <PageMeta title={'Premium'} description="Premium lessons and features (coming soon)." />
      <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={[styles.art, { backgroundColor: c.placeholder, borderColor: c.border }]} />
          <Text accessibilityRole="header" style={[styles.headline, { color: c.text }]}>
            7-day free trial
          </Text>
          <Text style={[styles.body, { color: c.textMuted }]}>
            Formulas, calculators and step-by-step solutions for every course. [Copy placeholder]
          </Text>
        </View>

        <View style={[styles.plans, { borderColor: c.border }]}>
          {PLANS.map((p) => (
            <ListRow
              key={p.value}
              title={p.title}
              subtitle={p.price}
              selected={plan === p.value}
              onPress={() => setPlan(p.value)}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Button testID="paywall-continue" label="Continue" disabled />
          <Button label="Restore Purchases" variant="link" />
          <Button label="Not now" variant="link" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.xl },
  hero: { alignItems: 'center', gap: space.sm },
  art: { width: 96, height: 96, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed' },
  headline: { fontSize: font.headline, fontWeight: '700', textAlign: 'center' },
  body: { fontSize: font.body, textAlign: 'center' },
  plans: { borderTopWidth: StyleSheet.hairlineWidth },
  actions: { gap: space.sm },
});

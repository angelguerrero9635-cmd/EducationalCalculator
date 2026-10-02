import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, ListRow, Logo } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { Text } from '@/components/Text';
import { monthly, PRICES } from '@/config/pricing';
import { SITE_NAME, SITE_SLOGAN } from '@/config/site';
import { font, space, usePalette } from '@/theme';

const PLANS = [PRICES.k12, PRICES.course];

/** The plans and their prices. No purchase logic yet: Continue is disabled. */
export default function PaywallScreen() {
  const c = usePalette();

  return (
    <>
      <PageMeta
        noindex
        title="Plans"
        description={`${SITE_NAME} plans: Kindergarten to Grade 12 for ${monthly(PRICES.k12.usd)}, and each college course for ${monthly(PRICES.course.usd)}.`}
      />
      <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Logo size={56} />
          <Text accessibilityRole="header" style={[styles.headline, { color: c.text }]}>
            {SITE_SLOGAN}
          </Text>
          <Text style={[styles.body, { color: c.textMuted }]}>
            Every lesson, picture and worked step, one dollar at a time.
          </Text>
        </View>

        <View style={[styles.plans, { borderColor: c.border }]}>
          {PLANS.map((p) => (
            <ListRow
              key={p.label}
              title={`${p.label}: ${monthly(p.usd)}`}
              subtitle={p.detail}
              accessory="none"
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Button testID="paywall-continue" label="Continue" disabled />
          <Text style={[styles.note, { color: c.textMuted }]}>
            Purchases are not open yet. Everything is free to use in this build.
          </Text>
          <Button label="Not now" variant="link" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.xl },
  hero: { alignItems: 'center', gap: space.sm },
  headline: { fontSize: font.headline, fontWeight: '700', textAlign: 'center' },
  body: { fontSize: font.body, textAlign: 'center' },
  plans: { borderTopWidth: StyleSheet.hairlineWidth },
  actions: { gap: space.sm },
  note: { fontSize: font.caption + 1, textAlign: 'center' },
});

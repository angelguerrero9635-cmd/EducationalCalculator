import { StyleSheet, View } from 'react-native';

import { Button, Card, DetailHeader, Icon, Page } from '@/components';
import { PlansHeader } from '@/components/art';
import { PageMeta } from '@/components/PageMeta';
import { Text } from '@/components/Text';
import {
  ACCESS_USD,
  COURSE_CHANGE_AFTER_CYCLES,
  coursesLabel,
  monthly,
  PLANS,
  usd,
  type Plan,
} from '@/config/pricing';
import { SITE_NAME } from '@/config/site';
import { radius, space, type, usePalette } from '@/theme';

/** What a plan holds, in three short lines. */
function points(plan: Plan): string[] {
  const change =
    plan.courses === 'all'
      ? []
      : [
          `Change ${plan.courses === 1 ? 'your course' : 'courses'} after ${
            COURSE_CHANGE_AFTER_CYCLES === 1
              ? 'one billing cycle'
              : `${COURSE_CHANGE_AFTER_CYCLES} billing cycles`
          }`,
        ];
  const yearly = plan.yearlyUsd
    ? [`Or ${usd(plan.yearlyUsd)} a year (save ${usd(plan.monthlyUsd * 12 - plan.yearlyUsd)})`]
    : [];
  return [
    ...(plan.k12 ? ['Every K–12 math and science lesson'] : []),
    coursesLabel(plan),
    ...change,
    ...yearly,
  ];
}

/** The plans and their prices. Purchases are not open yet: the buttons stay disabled. */
export default function PlansScreen() {
  const c = usePalette();
  return (
    <>
      <PageMeta
        noindex
        title="Plans"
        description={`${SITE_NAME} plans: ${PLANS.map((p) => `${p.name} ${monthly(p.monthlyUsd)}`).join(', ')}.`}
      />
      <Page>
        <DetailHeader
          title="Plans"
          lines={[
            `${usd(ACCESS_USD)} once to get in: the app's price on the App Store, or the sign-up fee on the web. Then pick a plan.`,
          ]}
        />
        <View style={styles.art}>
          <PlansHeader width={280} />
        </View>
        <View style={styles.cards}>
          {PLANS.map((p) => (
            <Card key={p.id} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={[type.title3, styles.flex, { color: c.text }]}>{p.name}</Text>
                {p.courses === 'all' ? (
                  <View style={[styles.ribbon, { backgroundColor: c.gold }]}>
                    <Text style={[type.overline, { color: c.onGold }]}>Everything</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[type.title1, { color: c.text }]}>
                {usd(p.monthlyUsd)}
                <Text style={[type.callout, { color: c.textMuted }]}> a month</Text>
              </Text>
              <View style={styles.points}>
                {points(p).map((point) => (
                  <View key={point} style={styles.point}>
                    <Icon name="checkCircle" size={20} color={c.success} />
                    <Text style={[type.callout, styles.flex, { color: c.text }]}>{point}</Text>
                  </View>
                ))}
              </View>
              <Button testID={`plan-${p.id}`} label={`Choose ${p.name}`} disabled />
            </Card>
          ))}
        </View>
        <View style={styles.after}>
          <Button label="Restore purchases" variant="link" icon="restore" disabled />
          <Text style={[type.footnote, styles.note, { color: c.textMuted }]}>
            Purchases are not open yet. Everything is free to use in this build.
          </Text>
        </View>
      </Page>
    </>
  );
}

const styles = StyleSheet.create({
  art: { alignItems: 'center', paddingBottom: space.md },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, paddingHorizontal: space.lg },
  card: { flexGrow: 1, flexBasis: 280, gap: space.md, borderRadius: radius.lg },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1 },
  ribbon: { paddingHorizontal: space.sm, paddingVertical: 3, borderRadius: radius.pill },
  points: { gap: space.sm, flexGrow: 1 },
  point: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  after: { alignItems: 'center', gap: space.xs, padding: space.lg },
  note: { fontWeight: '400', textAlign: 'center' },
});

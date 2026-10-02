import { StyleSheet, View } from 'react-native';

import { Button, Card, DetailHeader, Icon, Page } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { Text } from '@/components/Text';
import { monthly, PRICES } from '@/config/pricing';
import { SITE_NAME } from '@/config/site';
import { radius, space, type, usePalette } from '@/theme';

/** What each plan holds, in three short lines. */
const PLANS = [
  {
    ...PRICES.k12,
    id: 'k12',
    ribbon: 'Every grade',
    points: [
      'Every K–12 math and science lesson',
      'Pictures you can move',
      'Every step worked out',
    ],
    action: 'Continue',
  },
  {
    ...PRICES.course,
    id: 'course',
    ribbon: undefined,
    points: [
      'One college course, every topic',
      'Add only the courses you take',
      'Cancel any course anytime',
    ],
    action: 'Pick courses',
  },
] as const;

/** The plans and their prices. Purchases are not open yet: the buttons stay disabled. */
export default function PlansScreen() {
  const c = usePalette();
  return (
    <>
      <PageMeta
        noindex
        title="Plans"
        description={`${SITE_NAME} plans: Kindergarten to Grade 12 for ${monthly(PRICES.k12.usd)}, and each college course for ${monthly(PRICES.course.usd)}.`}
      />
      <Page width="read">
        <DetailHeader title="Plans" lines={['One dollar a month. No ads, ever.']} />
        <View style={styles.cards}>
          {PLANS.map((p) => (
            <Card key={p.id} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={[type.title3, styles.flex, { color: c.text }]}>{p.label}</Text>
                {p.ribbon ? (
                  <View style={[styles.ribbon, { backgroundColor: c.gold }]}>
                    <Text style={[type.overline, { color: c.onGold }]}>{p.ribbon}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[type.title1, { color: c.text }]}>
                ${p.usd}
                <Text style={[type.callout, { color: c.textMuted }]}> a month</Text>
              </Text>
              <View style={styles.points}>
                {p.points.map((point) => (
                  <View key={point} style={styles.point}>
                    <Icon name="checkCircle" size={20} color={c.success} />
                    <Text style={[type.callout, styles.flex, { color: c.text }]}>{point}</Text>
                  </View>
                ))}
              </View>
              <Button testID={`plan-${p.id}`} label={p.action} disabled />
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
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, paddingHorizontal: space.lg },
  card: { flexGrow: 1, flexBasis: 280, gap: space.md, borderRadius: radius.lg },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1 },
  ribbon: { paddingHorizontal: space.sm, paddingVertical: 3, borderRadius: radius.pill },
  points: { gap: space.sm },
  point: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  after: { alignItems: 'center', gap: space.xs, padding: space.lg },
  note: { fontWeight: '400', textAlign: 'center' },
});

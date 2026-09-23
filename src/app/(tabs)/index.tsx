import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState, ListRow, SectionHeader } from '@/components';
import { myCourseCards, type CourseCard } from '@/data/selectors';
import { push } from '@/navigation';
import { useRecents, useSelectedLevels } from '@/state';
import { font, radius, space, usePalette } from '@/theme';

function Card({ card }: { card: CourseCard }) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => push(card.route)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? c.placeholder : c.surface, borderColor: c.border },
      ]}
    >
      <Text style={[styles.cardTitle, { color: c.text }]}>{card.title}</Text>
      <Text style={[styles.cardSubtitle, { color: c.textMuted }]}>{card.subtitle}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const c = usePalette();
  const { levels } = useSelectedLevels();
  const cards = useMemo(() => myCourseCards(levels), [levels]);
  const recents = useRecents();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: c.background }}
    >
      <SectionHeader title="My Courses" />
      {cards.length ? (
        <View style={styles.grid}>
          {cards.map((card) => (
            <Card key={card.key} card={card} />
          ))}
        </View>
      ) : (
        <EmptyState
          title="No courses picked yet"
          message="Choose grade levels or college fields to pin them here."
          actionLabel="Choose what you study"
          onAction={() => router.push('/levels')}
        />
      )}

      <SectionHeader title="Recently viewed" />
      {recents.length ? (
        recents.map((item) => (
          <ListRow key={item.key} title={item.title} subtitle={item.label} route={item.route} />
        ))
      ) : (
        <EmptyState
          title="Nothing viewed yet"
          message="Skills, courses and topics you open will show up here."
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, padding: space.lg },
  card: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 88,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'flex-end',
    gap: space.xs,
  },
  cardTitle: { fontSize: font.body, fontWeight: '600' },
  cardSubtitle: { fontSize: font.caption },
});

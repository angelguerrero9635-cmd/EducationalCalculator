import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import {
  Button,
  Card,
  EmptyState,
  Icon,
  ListRow,
  SectionHeader,
  Tile,
  TileGrid,
} from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { Text } from '@/components/Text';
import { SITE_NAME } from '@/config/site';
import { countLabel, myCourseCards } from '@/data/selectors';
import { COURSES, SKILLS } from '@/data/taxonomy';
import { useRecents, useSelectedLevels } from '@/state';
import { font, radius, space, usePalette } from '@/theme';

/** Recently viewed items shown on Home (the full list is kept in app state). */
const RECENT_LIMIT = 5;

/** The banner at the top: the app's name, what it's for, and a search box that opens Search. */
function Hero() {
  const c = usePalette();
  return (
    <View style={styles.hero}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={c.heroFrom} />
            <Stop offset="1" stopColor={c.heroTo} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#hero)" />
      </Svg>
      <Text style={[styles.heroKicker, { color: c.onHero }]}>{SITE_NAME}</Text>
      <Text style={[styles.heroTitle, { color: c.onHero }]}>Learn it step by step.</Text>
      <Text style={[styles.heroText, { color: c.onHero }]}>
        {`${countLabel(SKILLS.length, 'skill')} and ${countLabel(COURSES.length, 'course')}, from Kindergarten to university, with pictures you can move and every step shown.`}
      </Text>
      <Pressable
        testID="home-search"
        accessibilityRole="search"
        onPress={() => router.push('/search')}
        style={({ pressed }) => [
          styles.searchPill,
          { backgroundColor: c.card, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Icon name="search" size={20} color={c.textMuted} />
        <Text style={[styles.searchText, { color: c.textMuted }]}>
          Search skills, courses and topics
        </Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const c = usePalette();
  const { levels } = useSelectedLevels();
  const cards = useMemo(() => myCourseCards(levels), [levels]);
  const recents = useRecents();

  return (
    <>
      <PageMeta
        title={SITE_NAME}
        description="Your courses and recently viewed lessons: interactive math and science lessons from Kindergarten to university, with diagrams, formulas and step-by-step examples."
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.page}
      >
        <Hero />

        <View style={styles.headerRow}>
          <SectionHeader title="My Courses" />
          {cards.length ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/levels')}
              hitSlop={8}
              style={styles.edit}
            >
              <Text style={[styles.editText, { color: c.accent }]}>Edit</Text>
            </Pressable>
          ) : null}
        </View>
        {cards.length ? (
          <TileGrid>
            {cards.map((card) => (
              <Tile
                key={card.key}
                title={card.title}
                subtitle={card.subtitle}
                badge={card.badge}
                icon={card.icon}
                tone={card.tone}
                route={card.route}
              />
            ))}
          </TileGrid>
        ) : (
          <Card style={styles.emptyCard}>
            <EmptyState
              title="No courses picked yet"
              message="Choose grade levels or college fields to pin them here."
            />
            <Button label="Choose what you study" onPress={() => router.push('/levels')} />
          </Card>
        )}

        <SectionHeader title="Recently viewed" />
        {recents.length ? (
          recents
            .slice(0, RECENT_LIMIT)
            .map((item) => (
              <ListRow key={item.key} overline={item.label} title={item.title} route={item.route} />
            ))
        ) : (
          <Card style={styles.emptyCard}>
            <EmptyState
              title="Nothing viewed yet"
              message="Skills, courses and topics you open will show up here."
            />
            <Button
              label="Browse all lessons"
              variant="secondary"
              onPress={() => router.push('/browse')}
            />
          </Card>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  page: { paddingBottom: space.xxl },
  hero: {
    margin: space.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: space.xl,
    gap: space.sm,
  },
  heroKicker: {
    fontSize: font.caption,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  heroTitle: { fontSize: font.display, fontWeight: '800', letterSpacing: -0.6, lineHeight: 38 },
  heroText: { fontSize: font.body - 1, lineHeight: 21, opacity: 0.9 },
  searchPill: {
    marginTop: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 48,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
  },
  searchText: { fontSize: font.body - 1 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  edit: { paddingHorizontal: space.lg, paddingBottom: space.md },
  editText: { fontSize: font.body - 1, fontWeight: '700' },
  emptyCard: { marginHorizontal: space.lg, alignItems: 'center', gap: space.sm },
});

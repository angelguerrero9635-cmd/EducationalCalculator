import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Icon, ListRow, Page, SectionHeader, Tile, TileGrid } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { Text } from '@/components/Text';
import { SITE_NAME, SITE_SLOGAN } from '@/config/site';
import { countLabel, myCourseCards } from '@/data/selectors';
import { COURSES, SKILLS } from '@/data/taxonomy';
import { useRecents, useSelectedLevels } from '@/state';
import { radius, space, type, usePalette, useTone } from '@/theme';

/** Recently viewed items shown on Home (the full list is kept in app state). */
const RECENT_LIMIT = 5;

/** The top of Home: the slogan, what the app holds, and a search field that opens Search. */
function Hero() {
  const c = usePalette();
  return (
    <View style={[styles.hero, { backgroundColor: c.accentSoft }]}>
      <Text accessibilityRole="header" style={[type.display, { color: c.text }]}>
        {SITE_SLOGAN}
      </Text>
      <Text style={[type.body, styles.heroText, { color: c.textMuted }]}>
        {`${countLabel(SKILLS.length, 'skill')} and ${countLabel(COURSES.length, 'course')}, from Kindergarten to university, with pictures you can move and every step shown.`}
      </Text>
      <Pressable
        testID="home-search"
        accessibilityRole="search"
        onPress={() => router.push('/search')}
        style={({ pressed }) => [
          styles.searchPill,
          { backgroundColor: c.card, borderColor: c.borderStrong, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Icon name="search" size={20} color={c.textMuted} />
        <Text style={[type.callout, { color: c.textMuted }]}>Search skills, or type a problem</Text>
      </Pressable>
    </View>
  );
}

/** A big card for one of the two halves of the catalog, for students who haven't picked yet. */
function ExploreCard({
  title,
  text,
  tone,
  icon,
  path,
}: {
  title: string;
  text: string;
  tone: number;
  icon: 'school' | 'book';
  path: '/browse' | '/he';
}) {
  const c = usePalette();
  const t = useTone(tone);
  return (
    <Card onPress={() => router.push(path)} style={styles.explore} accessibilityLabel={title}>
      <View style={[styles.exploreBadge, { backgroundColor: t.bg }]}>
        <Icon name={icon} size={26} color={t.fg} />
      </View>
      <View style={styles.exploreText}>
        <Text style={[type.title3, { color: c.text }]}>{title}</Text>
        <Text style={[type.callout, { color: c.textMuted }]}>{text}</Text>
      </View>
      <Icon name="chevron" size={18} color={c.textMuted} />
    </Card>
  );
}

export default function HomeScreen() {
  const c = usePalette();
  const { levels } = useSelectedLevels();
  const cards = useMemo(() => myCourseCards(levels), [levels]);
  const recents = useRecents();
  const [last, ...earlier] = recents;

  return (
    <>
      <PageMeta
        title={SITE_NAME}
        description={`${SITE_SLOGAN}. Interactive math and science lessons from Kindergarten to university, with pictures you can move and every step shown.`}
      />
      <Page>
        <Hero />

        {last ? (
          <>
            <SectionHeader title="Continue" />
            <Card
              route={last.route}
              style={styles.continue}
              accessibilityLabel={`Continue: ${last.title}`}
            >
              <View style={styles.exploreText}>
                <Text style={[type.overline, { color: c.accent }]}>{last.label}</Text>
                <Text style={[type.title3, { color: c.text }]}>{last.title}</Text>
              </View>
              <Icon name="arrowRight" size={22} color={c.accent} />
            </Card>
          </>
        ) : null}

        {cards.length ? (
          <>
            <SectionHeader
              title="My courses"
              action="Edit"
              onAction={() => router.push('/levels')}
            />
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
          </>
        ) : (
          <>
            <SectionHeader
              title="Explore"
              action="Choose what you study"
              onAction={() => router.push('/levels')}
            />
            <View style={styles.exploreRow}>
              <ExploreCard
                title="Kindergarten to Grade 12"
                text="Math and science for every grade, skill by skill."
                tone={0}
                icon="school"
                path="/browse"
              />
              <ExploreCard
                title="College"
                text="University math, science and engineering courses."
                tone={3}
                icon="book"
                path="/he"
              />
            </View>
          </>
        )}

        {earlier.length ? (
          <>
            <SectionHeader title="Recently viewed" />
            {earlier.slice(0, RECENT_LIMIT).map((item) => (
              <ListRow key={item.key} overline={item.label} title={item.title} route={item.route} />
            ))}
          </>
        ) : null}
      </Page>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: space.lg,
    marginTop: space.lg,
    borderRadius: radius.xl,
    padding: space.xl,
    gap: space.md,
  },
  heroText: { maxWidth: 560 },
  searchPill: {
    marginTop: space.sm,
    maxWidth: 560,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 52,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  continue: {
    marginHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  exploreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    paddingHorizontal: space.lg,
  },
  explore: {
    flexGrow: 1,
    flexBasis: 300,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  exploreBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreText: { flex: 1, gap: 2 },
});

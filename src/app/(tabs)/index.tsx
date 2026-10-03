import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Icon, ListRow, Page, SectionHeader, ShowOn, Tile, TileGrid } from '@/components';
import { ExploreCollege, ExploreK12, HomeHero } from '@/components/art';
import { PageMeta } from '@/components/PageMeta';
import { Text } from '@/components/Text';
import { SITE_NAME, SITE_SLOGAN } from '@/config/site';
import { countLabel, myCourseCards } from '@/data/selectors';
import { COURSES, SKILLS } from '@/data/taxonomy';
import { useRecents, useSelectedLevels } from '@/state';
import { radius, space, type, usePalette } from '@/theme';

/** Recently viewed items shown on Home (the full list is kept in app state). */
const RECENT_LIMIT = 5;

/** The top of Home: the slogan, what the app holds, and a search field that opens Search. */
function Hero() {
  const c = usePalette();
  return (
    <View style={[styles.hero, { backgroundColor: c.accentSoft }]}>
      <ShowOn size="narrow" style={styles.heroBand}>
        <HomeHero band width={300} />
      </ShowOn>
      <View style={styles.heroText}>
        <Text accessibilityRole="header" style={[type.display, { color: c.text }]}>
          {SITE_SLOGAN}
        </Text>
        <Text style={[type.body, { color: c.textMuted }]}>
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
          <Text style={[type.callout, { color: c.textMuted }]}>
            Search skills, or type a problem
          </Text>
        </Pressable>
      </View>
      <ShowOn size="wide" style={styles.heroArt}>
        <HomeHero width={420} />
      </ShowOn>
    </View>
  );
}

/** A big card for one of the two halves of the catalog, for students who haven't picked yet. */
function ExploreCard({
  title,
  text,
  art,
  path,
}: {
  title: string;
  text: string;
  art: 'k12' | 'college';
  path: '/browse' | '/he';
}) {
  const c = usePalette();
  return (
    <Card onPress={() => router.push(path)} style={styles.explore} accessibilityLabel={title}>
      {art === 'k12' ? <ExploreK12 width={112} /> : <ExploreCollege width={112} />}
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
                art="k12"
                path="/browse"
              />
              <ExploreCard
                title="College"
                text="University math, science and engineering courses."
                art="college"
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  heroBand: { width: '100%', alignItems: 'center' },
  heroText: { flexGrow: 1, flexBasis: 280, maxWidth: 560, gap: space.md },
  heroArt: { flexGrow: 1, alignItems: 'center' },
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
  exploreText: { flex: 1, gap: 2 },
});

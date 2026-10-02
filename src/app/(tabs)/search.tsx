import { useLocalSearchParams } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Chip, EmptyState, Icon, ListRow, SectionHeader } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { matchProblem } from '@/data/match';
import { countLabel, search, type SearchKind } from '@/data/selectors';
import { COURSES, SKILLS } from '@/data/taxonomy';
import { font, layout, radius, space, usePalette } from '@/theme';

const KIND_LABEL: Record<SearchKind, string> = { skill: 'Skill', course: 'Course', topic: 'Topic' };
const TOPIC_COUNT = COURSES.reduce((n, c) => n + c.topics.length, 0);

/** Searches to try, shown before anything is typed. */
const EXAMPLES = ['area of a rectangle', 'photosynthesis', "Ohm's law", 'fractions', 'derivatives'];

/** Filter chips: everything, or one kind of result. */
const FILTERS: { value: SearchKind | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'skill', label: 'Skills' },
  { value: 'course', label: 'Courses' },
  { value: 'topic', label: 'Topics' },
];

export default function SearchScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  // A search can arrive in the address (the wide top bar, shared links): /search?q=…
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(typeof q === 'string' ? q : '');
  const [filter, setFilter] = useState<SearchKind | 'all'>('all');
  const deferred = useDeferredValue(query);
  const results = useMemo(
    () => search(deferred).filter((r) => filter === 'all' || r.kind === filter),
    [deferred, filter],
  );
  // A typed problem (a few words, or numbers): the pages that solve it, matched on the device.
  const problem = useMemo(() => {
    const t = deferred.trim();
    const wordy = t.split(/\s+/).length >= 3 || /\d/.test(t);
    return wordy && (filter === 'all' || filter === 'skill') ? matchProblem(t, 3) : [];
  }, [deferred, filter]);

  return (
    <>
      <PageMeta
        title={'Search'}
        description="Search every math and science skill, university course and course topic."
      />
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={styles.column}>
          <View style={styles.top}>
            <View style={[styles.field, { backgroundColor: c.card, borderColor: c.borderStrong }]}>
              <Icon name="search" size={20} color={c.textMuted} />
              <TextInput
                testID="search-input"
                value={query}
                onChangeText={setQuery}
                placeholder="Search, or type a homework problem"
                placeholderTextColor={c.textMuted}
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
                returnKeyType="search"
                accessibilityLabel="Search"
                style={[styles.input, { color: c.text }]}
              />
            </View>
            <View style={styles.filters}>
              {FILTERS.map((f) => (
                <Chip
                  key={f.value}
                  label={f.label}
                  selected={filter === f.value}
                  onPress={() => setFilter(f.value)}
                />
              ))}
            </View>
          </View>
          <FlatList
            data={results}
            keyExtractor={(r) => r.key}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingTop: space.xs,
              paddingBottom: insets.bottom + space.xl,
            }}
            ListHeaderComponent={
              problem.length ? (
                <View style={styles.problem}>
                  <SectionHeader title="Lessons that solve this problem" />
                  {problem.map((r, i) => (
                    <ListRow
                      key={r.id}
                      overline={`${i === 0 ? 'Best match · ' : ''}${r.owner.context}${
                        r.title === r.owner.title ? '' : ` · ${r.owner.title}`
                      }`}
                      title={r.title}
                      subtitle={
                        r.use ?? `The main lesson for this ${r.owner.grade ? 'skill' : 'topic'}`
                      }
                      route={r.route}
                    />
                  ))}
                  {results.length ? <SectionHeader title="Also matching the words" /> : null}
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <ListRow
                overline={KIND_LABEL[item.kind]}
                title={item.title}
                subtitle={item.label}
                route={item.route}
              />
            )}
            ListEmptyComponent={
              // Problem matches alone fill the page: no empty card under them.
              problem.length ? null : (
                <Card style={styles.emptyCard}>
                  {query.trim() ? (
                    <EmptyState
                      title="No matches"
                      message={`Nothing found for “${query.trim()}”. Try fewer words, or a word from the lesson’s title.`}
                    />
                  ) : (
                    <>
                      <EmptyState
                        title="Search everything"
                        message={`${countLabel(SKILLS.length, 'skill')}, ${countLabel(COURSES.length, 'course')} and ${countLabel(TOPIC_COUNT, 'topic')}. Try a word from your homework, or type a whole problem to find the lesson that solves it.`}
                      />
                      <View style={styles.examples}>
                        {EXAMPLES.map((e) => (
                          <Chip key={e} label={e} onPress={() => setQuery(e)} />
                        ))}
                      </View>
                    </>
                  )}
                </Card>
              )
            }
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  column: { flex: 1, width: '100%', maxWidth: layout.content.read },
  top: { padding: space.lg, paddingBottom: space.sm, gap: space.md },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 52,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontFamily: font.family,
    fontSize: font.body,
    paddingVertical: space.sm + 2,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  emptyCard: { marginHorizontal: space.lg },
  examples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    paddingBottom: space.md,
  },
  problem: { paddingBottom: space.sm },
});

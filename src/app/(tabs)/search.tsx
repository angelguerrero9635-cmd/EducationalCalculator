import { useDeferredValue, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Chip, EmptyState, Icon, ListRow } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { countLabel, search, type SearchKind } from '@/data/selectors';
import { COURSES, SKILLS } from '@/data/taxonomy';
import { font, radius, space, useCardShadow, usePalette } from '@/theme';

const KIND_LABEL: Record<SearchKind, string> = { skill: 'Skill', course: 'Course', topic: 'Topic' };
const TOPIC_COUNT = COURSES.reduce((n, c) => n + c.topics.length, 0);

/** Filter chips: everything, or one kind of result. */
const FILTERS: { value: SearchKind | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'skill', label: 'Skills' },
  { value: 'course', label: 'Courses' },
  { value: 'topic', label: 'Topics' },
];

export default function SearchScreen() {
  const c = usePalette();
  const shadow = useCardShadow();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchKind | 'all'>('all');
  const deferred = useDeferredValue(query);
  const results = useMemo(
    () => search(deferred).filter((r) => filter === 'all' || r.kind === filter),
    [deferred, filter],
  );

  return (
    <>
      <PageMeta
        title={'Search'}
        description="Search every math and science skill, university course and course topic."
      />
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={styles.top}>
          <View style={[styles.field, { backgroundColor: c.card }, shadow]}>
            <Icon name="search" size={20} color={c.textMuted} />
            <TextInput
              testID="search-input"
              value={query}
              onChangeText={setQuery}
              placeholder="Search skills, courses and topics"
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
          contentContainerStyle={{ paddingTop: space.xs, paddingBottom: insets.bottom + space.xl }}
          renderItem={({ item }) => (
            <ListRow
              overline={KIND_LABEL[item.kind]}
              title={item.title}
              subtitle={item.label}
              route={item.route}
            />
          )}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              {query.trim() ? (
                <EmptyState title="No matches" message={`Nothing found for “${query.trim()}”.`} />
              ) : (
                <EmptyState
                  title="Search everything"
                  message={`${countLabel(SKILLS.length, 'skill')}, ${countLabel(COURSES.length, 'course')} and ${countLabel(TOPIC_COUNT, 'topic')}. Try a word from your homework, like a topic or a unit.`}
                />
              )}
            </Card>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { padding: space.lg, paddingBottom: space.sm, gap: space.md },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 50,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
  },
  input: {
    flex: 1,
    fontFamily: font.family,
    fontSize: font.body,
    paddingVertical: space.sm + 2,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  emptyCard: { marginHorizontal: space.lg },
});

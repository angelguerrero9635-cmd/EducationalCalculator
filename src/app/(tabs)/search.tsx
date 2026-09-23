import { useDeferredValue, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, ListRow } from '@/components';
import { countLabel, search, type SearchKind } from '@/data/selectors';
import { COURSES, SKILLS } from '@/data/taxonomy';
import { font, radius, space, usePalette } from '@/theme';

const KIND_LABEL: Record<SearchKind, string> = { skill: 'Skill', course: 'Course', topic: 'Topic' };
const TOPIC_COUNT = COURSES.reduce((n, c) => n + c.topics.length, 0);

export default function SearchScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const results = useMemo(() => search(deferred), [deferred]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.bar, { borderBottomColor: c.border }]}>
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
          style={[styles.input, { backgroundColor: c.surface, color: c.text }]}
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={(r) => r.key}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        renderItem={({ item }) => (
          <ListRow
            overline={KIND_LABEL[item.kind]}
            title={item.title}
            subtitle={item.label}
            route={item.route}
          />
        )}
        ListEmptyComponent={
          query.trim() ? (
            <EmptyState title="No matches" message={`Nothing found for “${query.trim()}”.`} />
          ) : (
            <EmptyState
              title="Search everything"
              message={`${countLabel(SKILLS.length, 'skill')}, ${countLabel(COURSES.length, 'course')} and ${countLabel(TOPIC_COUNT, 'topic')}.`}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bar: { padding: space.md, borderBottomWidth: StyleSheet.hairlineWidth },
  input: {
    fontSize: font.body,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    borderRadius: radius.md,
  },
});

import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList } from 'react-native';

import { CourseList, EmptyState, ListRow } from '@/components';
import { countLabel, divisionLabel, divisionView, fieldRoute, isDivision } from '@/data/selectors';
import { coursesFor } from '@/data/taxonomy';
import { usePalette } from '@/theme';

/** Division → fields. Single-field divisions (Math) skip straight to their course list. */
export default function DivisionScreen() {
  const c = usePalette();
  const division = String(useLocalSearchParams<{ division: string }>().division);

  if (!isDivision(division)) {
    return <EmptyState title="Not found" message={`There is no division “${division}”.`} />;
  }

  const view = divisionView(division);
  return (
    <>
      <Stack.Screen options={{ title: divisionLabel(division) }} />
      {view.kind === 'courses' ? (
        <CourseList courses={view.courses} />
      ) : (
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          style={{ backgroundColor: c.background }}
          data={view.fields}
          keyExtractor={(f) => f.id}
          renderItem={({ item }) => (
            <ListRow
              testID={`field-${item.id}`}
              title={item.title}
              subtitle={countLabel(coursesFor(division, item.id).length, 'course')}
              route={fieldRoute(division, item.id)}
            />
          )}
        />
      )}
    </>
  );
}

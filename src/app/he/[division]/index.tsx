import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList } from 'react-native';

import { CourseList, EmptyState, ListRow } from '@/components';
import { renderAllOnWeb } from '@/components/listProps';
import { PageMeta } from '@/components/PageMeta';
import { divisionMeta } from '@/data/meta';
import { countLabel, divisionLabel, divisionView, fieldRoute, isDivision } from '@/data/selectors';
import { coursesFor, HE_FIELDS } from '@/data/taxonomy';
import { usePalette } from '@/theme';

/** Division → fields. Single-field divisions (Math) skip straight to their course list. */
/** Pre-render every division page (web static rendering). */
export function generateStaticParams(): { division: string }[] {
  return Object.keys(HE_FIELDS).map((division) => ({ division }));
}

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
      <PageMeta {...divisionMeta(division)} />
      {view.kind === 'courses' ? (
        <CourseList courses={view.courses} />
      ) : (
        <FlatList
          {...renderAllOnWeb}
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

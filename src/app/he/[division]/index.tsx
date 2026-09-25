import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { CourseList, EmptyState, Tile, TileGrid } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { divisionMeta } from '@/data/meta';
import {
  countLabel,
  divisionLabel,
  divisionTone,
  divisionView,
  fieldRoute,
  isDivision,
} from '@/data/selectors';
import { coursesFor, HE_FIELDS } from '@/data/taxonomy';
import { space, usePalette } from '@/theme';

/** A field's badge: its initials, e.g. "Mechanical Engineering" → "ME". */
function fieldBadge(title: string): string {
  const words = title.split(/[\s&,-]+/).filter((w) => /^[A-Z]/.test(w));
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

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
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{ backgroundColor: c.background }}
          contentContainerStyle={styles.page}
        >
          <TileGrid>
            {view.fields.map((f, i) => (
              <Tile
                key={f.id}
                testID={`field-${f.id}`}
                badge={fieldBadge(f.title)}
                tone={divisionTone(division) + i}
                title={f.title}
                subtitle={countLabel(coursesFor(division, f.id).length, 'course')}
                route={fieldRoute(division, f.id)}
              />
            ))}
          </TileGrid>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  page: { paddingVertical: space.lg },
});

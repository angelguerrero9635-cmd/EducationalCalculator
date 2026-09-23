import { Stack, useLocalSearchParams } from 'expo-router';

import { CourseList, EmptyState } from '@/components';
import { getField, isDivision } from '@/data/selectors';
import { coursesFor } from '@/data/taxonomy';

export default function FieldScreen() {
  const params = useLocalSearchParams<{ division: string; field: string }>();
  const division = String(params.division);
  const field = isDivision(division) ? getField(division, String(params.field)) : undefined;

  if (!isDivision(division) || !field) {
    return <EmptyState title="Not found" message="This field doesn’t exist." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: field.title }} />
      <CourseList courses={coursesFor(division, field.id)} />
    </>
  );
}

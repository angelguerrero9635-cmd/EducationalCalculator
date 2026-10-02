import { Stack, useLocalSearchParams } from 'expo-router';

import { CourseList, DetailHeader } from '@/components';
import { NotFound } from '@/components/NotFound';
import { PageMeta } from '@/components/PageMeta';
import { fieldMeta } from '@/data/meta';
import { countLabel, divisionLabel, getField, isDivision, trailOf } from '@/data/selectors';
import { coursesFor, HE_FIELDS } from '@/data/taxonomy';

/** Pre-render every field page (web static rendering). */
export function generateStaticParams(): { division: string; field: string }[] {
  return Object.entries(HE_FIELDS).flatMap(([division, fields]) =>
    fields.map((f) => ({ division, field: f.id })),
  );
}

export default function FieldScreen() {
  const params = useLocalSearchParams<{ division: string; field: string }>();
  const division = String(params.division);
  const field = isDivision(division) ? getField(division, String(params.field)) : undefined;

  if (!isDivision(division) || !field) {
    return <NotFound />;
  }

  return (
    <>
      <Stack.Screen options={{ title: field.title }} />
      <PageMeta {...fieldMeta(division, field.id)!} />
      <CourseList
        courses={coursesFor(division, field.id)}
        header={
          <DetailHeader
            overline={`College · ${divisionLabel(division)}`}
            title={field.title}
            lines={[countLabel(coursesFor(division, field.id).length, 'course')]}
            trail={trailOf('he/[division]/[field]', { division, field: field.id })}
          />
        }
      />
    </>
  );
}

import { Stack, useLocalSearchParams } from 'expo-router';

import { CourseList, DetailHeader, NotFound, Page, Tile, TileGrid } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { divisionMeta } from '@/data/meta';
import {
  countLabel,
  divisionLabel,
  divisionTone,
  divisionView,
  fieldRoute,
  isDivision,
  trailOf,
} from '@/data/selectors';
import { fieldIcons } from '@/data/icons';
import { coursesFor, HE_FIELDS } from '@/data/taxonomy';

/** Division → fields. Single-field divisions (Math) skip straight to their course list. */
/** Pre-render every division page (web static rendering). */
export function generateStaticParams(): { division: string }[] {
  return Object.keys(HE_FIELDS).map((division) => ({ division }));
}

export default function DivisionScreen() {
  const division = String(useLocalSearchParams<{ division: string }>().division);

  if (!isDivision(division)) {
    return <NotFound />;
  }

  const view = divisionView(division);
  const icons =
    view.kind === 'fields'
      ? fieldIcons(
          division,
          view.fields.map((f) => f.title),
        )
      : [];
  return (
    <>
      <Stack.Screen options={{ title: divisionLabel(division) }} />
      <PageMeta {...divisionMeta(division)} />
      {view.kind === 'courses' ? (
        <CourseList
          courses={view.courses}
          header={
            <DetailHeader
              overline="College"
              title={divisionLabel(division)}
              lines={[countLabel(view.courses.length, 'course')]}
              trail={trailOf('he/[division]/index', { division })}
            />
          }
        />
      ) : (
        <Page>
          <DetailHeader
            overline="College"
            title={divisionLabel(division)}
            lines={[countLabel(view.fields.length, 'field')]}
            trail={trailOf('he/[division]/index', { division })}
          />
          <TileGrid>
            {view.fields.map((f, i) => (
              <Tile
                key={f.id}
                testID={`field-${f.id}`}
                icon={icons[i]}
                tone={divisionTone(division) + i}
                title={f.title}
                subtitle={countLabel(coursesFor(division, f.id).length, 'course')}
                route={fieldRoute(division, f.id)}
              />
            ))}
          </TileGrid>
        </Page>
      )}
    </>
  );
}

import { DetailHeader, Page, Tile, TileGrid } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { divisionIcon } from '@/data/icons';
import {
  DIVISIONS,
  countLabel,
  divisionLabel,
  divisionRoute,
  divisionTone,
  divisionView,
} from '@/data/selectors';

/** Higher education: a box for every division. */
export default function HigherEdScreen() {
  return (
    <>
      <PageMeta
        title={'Higher Education'}
        description="University math, science and engineering courses, by division and field, with topics and worked examples."
      />
      <Page>
        <DetailHeader
          title="College"
          lines={['University math, science and engineering, by division and field.']}
          trail={[
            { label: 'Browse', target: { pathname: '/browse', params: {} } },
            { label: 'College' },
          ]}
        />
        <TileGrid>
          {DIVISIONS.map((d) => {
            const view = divisionView(d);
            return (
              <Tile
                key={d}
                testID={`division-${d}`}
                icon={divisionIcon(d)}
                tone={divisionTone(d)}
                title={divisionLabel(d)}
                subtitle={
                  view.kind === 'courses'
                    ? countLabel(view.courses.length, 'course')
                    : countLabel(view.fields.length, 'field')
                }
                route={divisionRoute(d)}
              />
            );
          })}
        </TileGrid>
      </Page>
    </>
  );
}

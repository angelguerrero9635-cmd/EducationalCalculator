import { ScrollView, StyleSheet } from 'react-native';

import { Tile, TileGrid } from '@/components';
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
import { space, usePalette } from '@/theme';

/** Higher education: a box for every division. */
export default function HigherEdScreen() {
  const c = usePalette();
  return (
    <>
      <PageMeta
        title={'Higher Education'}
        description="University math, science and engineering courses, by division and field, with topics and worked examples."
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.page}
      >
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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  page: { paddingVertical: space.lg },
});

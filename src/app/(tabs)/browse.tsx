import { ScrollView, StyleSheet } from 'react-native';

import { SectionHeader, Tile, TileGrid } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { divisionIcon } from '@/data/icons';
import {
  DIVISIONS,
  countLabel,
  divisionLabel,
  divisionRoute,
  divisionTone,
  divisionView,
  gradeBadge,
  gradeRoute,
  gradeTone,
} from '@/data/selectors';
import { GRADES, gradeLabel, skillsFor } from '@/data/taxonomy';
import { space, usePalette } from '@/theme';

/** Browse: a box for every grade (K–12) and for every college division. */
export default function BrowseScreen() {
  const c = usePalette();
  return (
    <>
      <PageMeta
        title={'Browse'}
        description="Browse every lesson by level: Kindergarten through Grade 12 math and science, and university math, science and engineering courses."
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.page}
      >
        <SectionHeader title="School · Kindergarten to Grade 12" />
        <TileGrid>
          {GRADES.map((g) => (
            <Tile
              key={g}
              testID={`browse-grade-${g}`}
              badge={gradeBadge(g)}
              tone={gradeTone(g)}
              title={gradeLabel(g)}
              subtitle={`${skillsFor(g, 'math').length} math · ${skillsFor(g, 'science').length} science`}
              route={gradeRoute(g)}
            />
          ))}
        </TileGrid>

        <SectionHeader title="College" />
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
  page: { paddingBottom: space.xxl },
});

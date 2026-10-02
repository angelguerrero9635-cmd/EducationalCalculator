import { StyleSheet, View } from 'react-native';

import { DetailHeader, Page, SectionHeader, Tile, TileGrid } from '@/components';
import { Text } from '@/components/Text';
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
import { GRADES, gradeLabel, skillsFor, type Grade } from '@/data/taxonomy';
import { space, type, usePalette } from '@/theme';

/** Grades in school bands, so the wide grid never leaves a lone tile. */
const BANDS: { label: string; grades: readonly Grade[] }[] = [
  { label: 'Kindergarten to Grade 2', grades: GRADES.slice(0, 3) },
  { label: 'Grades 3 to 5', grades: GRADES.slice(3, 6) },
  { label: 'Grades 6 to 8', grades: GRADES.slice(6, 9) },
  { label: 'Grades 9 to 12', grades: GRADES.slice(9) },
];

/** Browse: a box for every grade (K–12) and for every college division. */
export default function BrowseScreen() {
  const c = usePalette();
  return (
    <>
      <PageMeta
        title={'Browse'}
        description="Browse every lesson by level: Kindergarten through Grade 12 math and science, and university math, science and engineering courses."
      />
      <Page>
        <DetailHeader title="Browse" lines={['Every lesson, from Kindergarten to university.']} />
        <SectionHeader title="School" />
        {BANDS.map((band) => (
          <View key={band.label}>
            <Text style={[type.overline, styles.band, { color: c.textMuted }]}>{band.label}</Text>
            <TileGrid>
              {band.grades.map((g) => (
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
          </View>
        ))}
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
      </Page>
    </>
  );
}

const styles = StyleSheet.create({
  band: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.sm },
});

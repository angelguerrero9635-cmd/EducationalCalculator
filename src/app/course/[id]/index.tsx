import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Chip,
  DetailHeader,
  EmptyState,
  ListRow,
  LockedState,
  RefreshSection,
  SectionHeader,
} from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { isLocked } from '@/config/access';
import { courseMeta } from '@/data/meta';
import {
  divisionLabel,
  getCourse,
  getField,
  refreshRows,
  skipsFieldLevel,
  topicRoute,
} from '@/data/selectors';
import { COURSES } from '@/data/taxonomy';
import { useTrackRecent } from '@/state';
import { space, usePalette } from '@/theme';

/** Pre-render every course page (web static rendering). */
export function generateStaticParams(): { id: string }[] {
  return COURSES.map((c) => ({ id: c.id }));
}

export default function CourseScreen() {
  const c = usePalette();
  const id = String(useLocalSearchParams<{ id: string }>().id);
  const course = getCourse(id);
  useTrackRecent(course?.id);

  if (!course) return <EmptyState title="Course not found" message={id} />;
  if (isLocked(course.id)) return <LockedState />;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: c.background }}
    >
      <Stack.Screen options={{ title: course.title }} />
      <PageMeta {...courseMeta(course)} />
      <DetailHeader title={course.title} lines={[`Division: ${divisionLabel(course.division)}`]} />
      {skipsFieldLevel(course.division) ? null : (
        <View style={styles.chips} accessibilityLabel="Fields">
          {course.fields.map((f) => (
            <Chip key={f} label={getField(course.division, f)?.title ?? f} />
          ))}
        </View>
      )}
      <RefreshSection title="Prerequisites" rows={refreshRows(course.id)} />
      <SectionHeader title="Topics" />
      {course.topics.map((topic, index) => (
        <ListRow key={index} title={topic} route={topicRoute(course.id, index)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
  },
});

import { ScrollView, StyleSheet } from 'react-native';

import { courseIcon } from '@/data/icons';
import { courseRoute, courseSummary } from '@/data/selectors';
import type { Course } from '@/data/taxonomy';
import { space, usePalette } from '@/theme';

import { EmptyState } from './EmptyState';
import { Tile, TileGrid } from './Tile';

/** Courses as boxes: an icon for the subject, the course's name and a short summary. */
export function CourseList({ courses }: { courses: readonly Course[] }) {
  const c = usePalette();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.page}
    >
      {courses.length ? (
        <TileGrid>
          {courses.map((course, i) => (
            <Tile
              key={course.id}
              testID={`course-${course.id}`}
              icon={courseIcon(course)}
              tone={i}
              title={course.title}
              subtitle={courseSummary(course)}
              route={courseRoute(course.id)}
            />
          ))}
        </TileGrid>
      ) : (
        <EmptyState title="No courses here yet" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { paddingVertical: space.lg },
});

import { ScrollView, StyleSheet } from 'react-native';

import { courseRoute, courseSummary, initials } from '@/data/selectors';
import type { Course } from '@/data/taxonomy';
import { space, usePalette } from '@/theme';

import { EmptyState } from './EmptyState';
import { Tile, TileGrid } from './Tile';

/** Courses as boxes: a badge with the course's initials, its name and a short summary. */
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
              badge={initials(course.title) || String(i + 1)}
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

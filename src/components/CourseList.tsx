import { FlatList } from 'react-native';

import { courseRoute, courseSummary } from '@/data/selectors';
import type { Course } from '@/data/taxonomy';
import { usePalette } from '@/theme';

import { EmptyState } from './EmptyState';
import { ListRow } from './ListRow';

export function CourseList({ courses }: { courses: readonly Course[] }) {
  const c = usePalette();
  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: c.background }}
      data={courses}
      keyExtractor={(course) => course.id}
      renderItem={({ item }) => (
        <ListRow
          testID={`course-${item.id}`}
          title={item.title}
          subtitle={courseSummary(item)}
          route={courseRoute(item.id)}
        />
      )}
      ListEmptyComponent={<EmptyState title="No courses here yet" />}
    />
  );
}

import type { ReactNode } from 'react';

import { courseIcons } from '@/data/icons';
import { courseRoute, courseSummary } from '@/data/selectors';
import type { Course } from '@/data/taxonomy';

import { EmptyState } from './EmptyState';
import { Page } from './Page';
import { Tile, TileGrid } from './Tile';

/** Courses as boxes: an icon for the subject, the course's name and a short summary. */
export function CourseList({
  courses,
  header,
}: {
  courses: readonly Course[];
  /** The page's title block, above the courses. */
  header?: ReactNode;
}) {
  const icons = courseIcons(courses);
  return (
    <Page>
      {header}
      {courses.length ? (
        <TileGrid>
          {courses.map((course, i) => (
            <Tile
              key={course.id}
              testID={`course-${course.id}`}
              icon={icons[i]}
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
    </Page>
  );
}

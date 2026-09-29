/**
 * The side menu's tree: every lesson, reached through dropdowns. K–12 is grade → subject →
 * strand → skill, with a skill's problem types under it; higher education is division →
 * field (when the division has more than one) → course → topic. Built from the taxonomy and
 * the modules, so a new page shows up without touching the menu.
 */
import {
  DIVISIONS,
  SUBJECTS,
  divisionLabel,
  fieldRoute,
  groupByStrand,
  gradeRoute,
  problemTypes,
  skillRoute,
  skipsFieldLevel,
  subjectLabel,
  topicRoute,
  courseRoute,
  type RouteTarget,
} from './selectors';
import { GRADES, HE_FIELDS, coursesFor, gradeLabel, skillsFor, type Course } from './taxonomy';

export interface MenuNode {
  /** Unique in the tree; also what "open" state is kept by. */
  key: string;
  label: string;
  /** A page to open. A node with children opens its dropdown instead, and lists this page first. */
  route?: RouteTarget;
  children?: MenuNode[];
}

/** A course under `parent` (a course cross-listed in several fields appears under each). */
const courseNode = (course: Course, parent: string): MenuNode => {
  const key = `${parent}:${course.id}`;
  return {
    key,
    label: course.title,
    children: [
      { key: `${key}#overview`, label: 'Course overview', route: courseRoute(course.id) },
      ...course.topics.map((topic, i) => ({
        key: `${key}#${i}`,
        label: topic,
        route: topicRoute(course.id, i),
      })),
    ],
  };
};

/** A route as the path it opens ("/skill/m.3.area"), to find the page that is open. */
export const routePath = (route: RouteTarget) =>
  route.pathname.replace(/\[(\w+)\]/g, (_, key: string) => route.params[key] ?? '');

let tree: MenuNode[] | undefined;

/** The whole menu (built once). */
export function menuTree(): MenuNode[] {
  tree ??= [
    ...GRADES.map((grade): MenuNode => ({
      key: `grade:${grade}`,
      label: gradeLabel(grade),
      children: SUBJECTS.filter((subject) => skillsFor(grade, subject).length > 0).map(
        (subject) => ({
          key: `grade:${grade}:${subject}`,
          label: subjectLabel(subject),
          route: gradeRoute(grade, subject),
          children: groupByStrand(skillsFor(grade, subject)).map(({ title, data }) => ({
            key: `grade:${grade}:${subject}:${title}`,
            label: title,
            children: data.map((skill): MenuNode => {
              const types = problemTypes(skill.id);
              return types.length === 0
                ? { key: skill.id, label: skill.title, route: skillRoute(skill.id) }
                : {
                    key: skill.id,
                    label: skill.title,
                    children: [
                      {
                        key: `${skill.id}#main`,
                        label: 'Main lesson',
                        route: skillRoute(skill.id),
                      },
                      ...types.map((t) => ({ key: t.id, label: t.title, route: skillRoute(t.id) })),
                    ],
                  };
            }),
          })),
        }),
      ),
    })),
    {
      key: 'he',
      label: 'Higher Education',
      children: DIVISIONS.map((division): MenuNode => ({
        key: `he:${division}`,
        label: divisionLabel(division),
        children: skipsFieldLevel(division)
          ? coursesFor(division, HE_FIELDS[division][0]!.id).map((c) =>
              courseNode(c, `he:${division}`),
            )
          : HE_FIELDS[division].map((field) => ({
              key: `he:${division}:${field.id}`,
              label: field.title,
              route: fieldRoute(division, field.id),
              children: coursesFor(division, field.id).map((c) =>
                courseNode(c, `he:${division}:${field.id}`),
              ),
            })),
      })),
    },
  ];
  return tree;
}

/**
 * The keys of the dropdowns that lead to a page (so the menu opens where the student is): the
 * node whose route matches and every node above it.
 */
export function menuPath(match: (route: RouteTarget) => boolean, nodes = menuTree()): string[] {
  for (const node of nodes) {
    if (node.children) {
      const below = menuPath(match, node.children);
      if (below.length > 0) return [node.key, ...below];
    }
    if (node.route && !node.children && match(node.route)) return [node.key];
  }
  return [];
}

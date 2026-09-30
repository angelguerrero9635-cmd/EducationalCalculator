/**
 * The side menu: a dropdown for each grade (and each higher-education division), opening to
 * indented rows. In a grade: the subject, its strands, each skill and, under a skill, its
 * problem types. In a division: its fields, their courses and each course's topics. Built from
 * the taxonomy and the modules, so a new page shows up without touching the menu.
 */
import {
  DIVISIONS,
  SUBJECTS,
  courseRoute,
  divisionLabel,
  gradeRoute,
  groupByStrand,
  problemTypes,
  skillRoute,
  skipsFieldLevel,
  subjectLabel,
  topicRoute,
  type RouteTarget,
} from './selectors';
import { GRADES, HE_FIELDS, coursesFor, gradeLabel, skillsFor, type Course } from './taxonomy';

/** One row inside a dropdown. A row with no route is a heading (a subject, strand or field). */
export interface MenuRow {
  key: string;
  label: string;
  /** How far in it sits: 0 for a subject or field, one more for each level under it. */
  depth: number;
  route?: RouteTarget;
}

/** A top-level dropdown: a grade or a division. */
export interface MenuGroup {
  key: string;
  label: string;
  /** Shown as a small title above the group (the first division gets "Higher Education"). */
  section?: string;
  rows: MenuRow[];
}

/** A route as the path it opens ("/skill/m.3.area"), to find the page that is open. */
export const routePath = (route: RouteTarget) =>
  route.pathname.replace(/\[(\w+)\]/g, (_, key: string) => route.params[key] ?? '');

const courseRows = (course: Course, parent: string, depth: number): MenuRow[] => [
  { key: `${parent}:${course.id}`, label: course.title, depth, route: courseRoute(course.id) },
  ...course.topics.map((topic, i) => ({
    key: `${parent}:${course.id}#${i}`,
    label: topic,
    depth: depth + 1,
    route: topicRoute(course.id, i),
  })),
];

let groups: MenuGroup[] | undefined;

/** The whole menu (built once). */
export function menuGroups(): MenuGroup[] {
  groups ??= [
    ...GRADES.map((grade): MenuGroup => ({
      key: `grade:${grade}`,
      label: gradeLabel(grade),
      rows: SUBJECTS.filter((subject) => skillsFor(grade, subject).length > 0).flatMap(
        (subject): MenuRow[] => [
          {
            key: `grade:${grade}:${subject}`,
            label: subjectLabel(subject),
            depth: 0,
            route: gradeRoute(grade, subject),
          },
          ...groupByStrand(skillsFor(grade, subject)).flatMap(({ title, data }) => [
            { key: `grade:${grade}:${subject}:${title}`, label: title, depth: 1 },
            ...data.flatMap((skill) => [
              { key: skill.id, label: skill.title, depth: 2, route: skillRoute(skill.id) },
              ...problemTypes(skill.id).map((t) => ({
                key: t.id,
                label: t.title,
                depth: 3,
                route: skillRoute(t.id),
              })),
            ]),
          ]),
        ],
      ),
    })),
    ...DIVISIONS.map((division, i): MenuGroup => ({
      key: `he:${division}`,
      label: divisionLabel(division),
      ...(i === 0 ? { section: 'Higher Education' } : {}),
      rows: skipsFieldLevel(division)
        ? coursesFor(division, HE_FIELDS[division][0]!.id).flatMap((c) =>
            courseRows(c, `he:${division}`, 0),
          )
        : HE_FIELDS[division].flatMap((field) => [
            { key: `he:${division}:${field.id}`, label: field.title, depth: 0 },
            ...coursesFor(division, field.id).flatMap((c) =>
              courseRows(c, `he:${division}:${field.id}`, 1),
            ),
          ]),
    })),
  ];
  return groups;
}

/** The dropdown that holds the open page (so the menu opens where the student is). */
export function menuGroupOf(
  match: (route: RouteTarget) => boolean,
  all = menuGroups(),
): string | undefined {
  return all.find((g) => g.rows.some((r) => r.route && match(r.route)))?.key;
}

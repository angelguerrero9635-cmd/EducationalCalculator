/**
 * Derived, read-only views over the taxonomy. Everything here is a pure function of
 * `taxonomy.ts`, so the UI never hardcodes course content.
 */
import {
  COURSES,
  GRADES,
  HE_FIELDS,
  SKILLS,
  coursesFor,
  getNode,
  gradeLabel,
  refreshLinks,
  skillsFor,
  type Course,
  type Division,
  type Field,
  type Grade,
  type K12Subject,
  type Skill,
} from './taxonomy';

export type TaxonomyNode = Skill | Course;

// ─── Basic lookups & labels ──────────────────────────────────────────────────

export const SUBJECTS: readonly K12Subject[] = ['math', 'science'];
export const DIVISIONS = Object.keys(HE_FIELDS) as Division[];

export const isSkill = (node: TaxonomyNode): node is Skill => 'grade' in node;
export const isGrade = (value: string): value is Grade =>
  (GRADES as readonly string[]).includes(value);
export const isSubject = (value: string): value is K12Subject =>
  (SUBJECTS as readonly string[]).includes(value);
export const isDivision = (value: string): value is Division =>
  (DIVISIONS as readonly string[]).includes(value);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "math" → "Math", "science" → "Science". */
export const subjectLabel = (subject: K12Subject) => capitalize(subject);
/** "engineering" → "Engineering". */
export const divisionLabel = (division: Division) => capitalize(division);

export const getField = (division: Division, fieldId: string): Field | undefined =>
  HE_FIELDS[division].find((f) => f.id === fieldId);

export const getSkill = (id: string): Skill | undefined => {
  const node = getNode(id);
  return node && isSkill(node) ? node : undefined;
};

export const getCourse = (id: string): Course | undefined => {
  const node = getNode(id);
  return node && !isSkill(node) ? node : undefined;
};

/** Field titles for a course, e.g. "Aerospace, Mechanical +3". */
export function fieldsSummary(course: Course, max = 2): string {
  const titles = course.fields.map((f) => getField(course.division, f)?.title ?? f);
  const shown = titles.slice(0, max).join(', ');
  return titles.length > max ? `${shown} +${titles.length - max}` : shown;
}

/** Short context line for a node, e.g. "Grade 8 · Math" or "Science · Chemistry". */
export function nodeContext(node: TaxonomyNode): string {
  if (isSkill(node)) return `${gradeLabel(node.grade)} · ${subjectLabel(node.subject)}`;
  if (skipsFieldLevel(node.division)) return divisionLabel(node.division);
  return `${divisionLabel(node.division)} · ${fieldsSummary(node)}`;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/** A route object accepted by expo-router's `Link href` / `router.push`. */
export interface RouteTarget {
  pathname: string;
  params: Record<string, string>;
}

export const skillRoute = (id: string): RouteTarget => ({
  pathname: '/skill/[id]',
  params: { id },
});
export const courseRoute = (id: string): RouteTarget => ({
  pathname: '/course/[id]',
  params: { id },
});
export const topicRoute = (courseId: string, index: number): RouteTarget => ({
  pathname: '/course/[id]/topic/[index]',
  params: { id: courseId, index: String(index) },
});
export const gradeRoute = (grade: Grade, subject?: K12Subject): RouteTarget => ({
  pathname: '/grade/[grade]',
  params: subject ? { grade, subject } : { grade },
});
export const divisionRoute = (division: Division): RouteTarget => ({
  pathname: '/he/[division]',
  params: { division },
});
export const fieldRoute = (division: Division, field: string): RouteTarget =>
  skipsFieldLevel(division)
    ? divisionRoute(division)
    : { pathname: '/he/[division]/[field]', params: { division, field } };

export function nodeRoute(id: string): RouteTarget | undefined {
  const node = getNode(id);
  if (!node) return undefined;
  return isSkill(node) ? skillRoute(node.id) : courseRoute(node.id);
}

/** Course list subtitle, e.g. "5 topics · cross-listed in 5 fields". */
export function courseSummary(course: Course): string {
  const topics = countLabel(course.topics.length, 'topic');
  return course.fields.length > 1
    ? `${topics} · cross-listed in ${course.fields.length} fields`
    : topics;
}

// ─── Browse: K–12 ────────────────────────────────────────────────────────────

export interface StrandSection {
  title: string;
  data: Skill[];
}

/** Groups skills by strand; sections and skills keep their taxonomy order (first appearance). */
export function groupByStrand(skills: readonly Skill[]): StrandSection[] {
  const sections = new Map<string, Skill[]>();
  for (const skill of skills) {
    const list = sections.get(skill.strand);
    if (list) list.push(skill);
    else sections.set(skill.strand, [skill]);
  }
  return [...sections].map(([title, data]) => ({ title, data }));
}

export const gradeSections = (grade: Grade, subject: K12Subject) =>
  groupByStrand(skillsFor(grade, subject));

// ─── Browse: Higher Ed ───────────────────────────────────────────────────────

/** A division with a single field (Math) skips the field level and lists courses directly. */
export const skipsFieldLevel = (division: Division) => HE_FIELDS[division].length === 1;

export type DivisionView =
  { kind: 'fields'; fields: Field[] } | { kind: 'courses'; field: Field; courses: Course[] };

/** What the /he/[division] screen shows. */
export function divisionView(division: Division): DivisionView {
  const fields = HE_FIELDS[division];
  const [only] = fields;
  if (only && fields.length === 1) {
    return { kind: 'courses', field: only, courses: coursesFor(division, only.id) };
  }
  return { kind: 'fields', fields };
}

// ─── Refresh links ───────────────────────────────────────────────────────────

export interface RefreshRow {
  id: string;
  title: string;
  /** refreshLinks() label, plus the subject for skills (e.g. "Refresh: Grade 8 · Math"). */
  label: string;
  route: RouteTarget;
}

export function refreshRows(id: string): RefreshRow[] {
  return refreshLinks(id).flatMap((link) => {
    const target = getNode(link.id);
    const route = nodeRoute(link.id);
    if (!target || !route) return [];
    const label = isSkill(target) ? `${link.label} · ${subjectLabel(target.subject)}` : link.label;
    return [{ id: link.id, title: link.title, label, route }];
  });
}

// ─── Search ──────────────────────────────────────────────────────────────────

export type SearchKind = 'skill' | 'course' | 'topic';

export interface SearchEntry {
  key: string;
  kind: SearchKind;
  title: string;
  label: string;
  route: RouteTarget;
  /** Normalized text used for matching. */
  text: string;
}

/** Lowercases and strips diacritics so "schrodinger" matches "Schrödinger". */
export function normalize(text: string): string {
  let s = text.toLowerCase();
  try {
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch {
    // normalize() unavailable: fall back to plain lowercase matching.
  }
  return s.replace(/[\u2010-\u2015]/g, '-');
}

export function buildSearchIndex(
  skills: readonly Skill[] = SKILLS,
  courses: readonly Course[] = COURSES,
): SearchEntry[] {
  const entries: SearchEntry[] = [];
  for (const s of skills) {
    const label = nodeContext(s);
    entries.push({
      key: s.id,
      kind: 'skill',
      title: s.title,
      label,
      route: skillRoute(s.id),
      text: normalize(`${s.title} ${label} ${s.strand}`),
    });
  }
  for (const c of courses) {
    const label = nodeContext(c);
    entries.push({
      key: c.id,
      kind: 'course',
      title: c.title,
      label,
      route: courseRoute(c.id),
      text: normalize(`${c.title} ${label}`),
    });
    c.topics.forEach((topic, index) => {
      entries.push({
        key: topicKey(c.id, index),
        kind: 'topic',
        title: topic,
        label: `${divisionLabel(c.division)} · ${c.title}`,
        route: topicRoute(c.id, index),
        text: normalize(topic),
      });
    });
  }
  return entries;
}

let searchIndex: SearchEntry[] | undefined;
export const getSearchIndex = () => (searchIndex ??= buildSearchIndex());

/**
 * Every whitespace-separated term must appear in the entry. Titles that start with the
 * query rank first, then titles containing it, then everything else (taxonomy order).
 */
export function search(query: string, index = getSearchIndex(), limit = 100): SearchEntry[] {
  const q = normalize(query).trim();
  const terms = q.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const rank = (e: SearchEntry) => {
    const title = normalize(e.title);
    if (title.startsWith(q)) return 0;
    if (title.includes(q)) return 1;
    return 2;
  };
  return index
    .filter((e) => terms.every((t) => e.text.includes(t)))
    .map((e, i) => ({ e, i, r: rank(e) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .slice(0, limit)
    .map(({ e }) => e);
}

// ─── Topics ──────────────────────────────────────────────────────────────────

export const topicKey = (courseId: string, index: number) => `${courseId}#${index}`;

export function getTopic(courseId: string, index: number) {
  const course = getCourse(courseId);
  const title = course?.topics[index];
  return course && title !== undefined ? { course, index, title } : undefined;
}

// ─── Onboarding levels ───────────────────────────────────────────────────────

/** Persisted selection keys: "grade:8" or "field:engineering/aerospace". */
export type LevelKey = string;

export const gradeLevelKey = (grade: Grade): LevelKey => `grade:${grade}`;
export const fieldLevelKey = (division: Division, field: string): LevelKey =>
  `field:${division}/${field}`;

export type ParsedLevel =
  { kind: 'grade'; grade: Grade } | { kind: 'field'; division: Division; field: Field };

export function parseLevelKey(key: string): ParsedLevel | undefined {
  const [kind, rest = ''] = key.split(/:(.*)/s);
  if (kind === 'grade' && isGrade(rest)) return { kind: 'grade', grade: rest };
  if (kind === 'field') {
    const [division = '', fieldId = ''] = rest.split('/');
    if (!isDivision(division)) return undefined;
    const field = getField(division, fieldId);
    return field ? { kind: 'field', division, field } : undefined;
  }
  return undefined;
}

export interface LevelOption {
  key: LevelKey;
  title: string;
}

export interface LevelGroup {
  title: string;
  options: LevelOption[];
}

/** Choices for "What are you studying?": every grade, then every Higher Ed field by division. */
export function levelGroups(): LevelGroup[] {
  return [
    {
      title: 'K–12',
      options: GRADES.map((g) => ({ key: gradeLevelKey(g), title: gradeLabel(g) })),
    },
    ...DIVISIONS.map((d) => ({
      title: `Higher Ed · ${divisionLabel(d)}`,
      options: HE_FIELDS[d].map((f) => ({ key: fieldLevelKey(d, f.id), title: f.title })),
    })),
  ];
}

/** Drops unknown/duplicate keys (e.g. after a taxonomy edit) and orders them like levelGroups(). */
export function sanitizeLevels(keys: unknown): LevelKey[] {
  if (!Array.isArray(keys)) return [];
  const wanted = new Set(keys.filter((k): k is string => typeof k === 'string'));
  return levelGroups()
    .flatMap((g) => g.options)
    .map((o) => o.key)
    .filter((k) => wanted.has(k));
}

export interface CourseCard {
  key: string;
  title: string;
  subtitle: string;
  route: RouteTarget;
}

/** Home "My Courses": Math + Science cards per selected grade, one card per selected field. */
export function myCourseCards(levels: readonly LevelKey[]): CourseCard[] {
  return levels.flatMap((key): CourseCard[] => {
    const level = parseLevelKey(key);
    if (!level) return [];
    if (level.kind === 'grade') {
      return SUBJECTS.map((subject) => ({
        key: `${key}/${subject}`,
        title: `${gradeLabel(level.grade)} · ${subjectLabel(subject)}`,
        subtitle: countLabel(skillsFor(level.grade, subject).length, 'skill'),
        route: gradeRoute(level.grade, subject),
      }));
    }
    const count = coursesFor(level.division, level.field.id).length;
    return [
      {
        key,
        title: level.field.title,
        subtitle: `${divisionLabel(level.division)} · ${countLabel(count, 'course')}`,
        route: fieldRoute(level.division, level.field.id),
      },
    ];
  });
}

export const countLabel = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`;

// ─── Recently viewed ─────────────────────────────────────────────────────────

export const RECENTS_LIMIT = 10;

/** Moves `key` to the front, de-duplicated, capped at `limit`. */
export function pushRecent(list: readonly string[], key: string, limit = RECENTS_LIMIT): string[] {
  return [key, ...list.filter((k) => k !== key)].slice(0, limit);
}

export interface ResolvedItem {
  key: string;
  title: string;
  label: string;
  route: RouteTarget;
}

/** Resolves a recents key (node id or topic key); undefined if it no longer exists. */
export function resolveItem(key: string): ResolvedItem | undefined {
  const hash = key.lastIndexOf('#');
  if (hash !== -1) {
    const index = Number(key.slice(hash + 1));
    const topic = Number.isInteger(index) ? getTopic(key.slice(0, hash), index) : undefined;
    if (!topic) return undefined;
    return {
      key,
      title: topic.title,
      label: `Topic · ${topic.course.title}`,
      route: topicRoute(topic.course.id, topic.index),
    };
  }
  const node = getNode(key);
  const route = nodeRoute(key);
  if (!node || !route) return undefined;
  return { key, title: node.title, label: nodeContext(node), route };
}

// ─── Navigation bar ───────────────────────────────────────────────────────────

export interface ParentLink {
  /** Short label for the back button, e.g. "Grade 1". */
  label: string;
  /** Where back goes when there is no history (opened from a link or a reload). */
  target: RouteTarget | { pathname: string; params?: undefined };
}

const HOME: ParentLink = { label: 'Home', target: { pathname: '/' } };

/**
 * The page one level up from a stack screen, for the navigation bar's back button:
 * skill → its grade, topic → its course, course → its field, field → its division.
 */
export function parentOf(screen: string, params: Record<string, unknown>): ParentLink {
  const p = (k: string) => (params[k] === undefined ? '' : String(params[k]));
  switch (screen) {
    case 'skill/[id]': {
      const skill = getSkill(p('id'));
      return skill
        ? { label: gradeLabel(skill.grade), target: gradeRoute(skill.grade, skill.subject) }
        : HOME;
    }
    case 'course/[id]/topic/[index]': {
      const course = getCourse(p('id'));
      return course ? { label: 'Course', target: courseRoute(course.id) } : HOME;
    }
    case 'course/[id]/index': {
      const course = getCourse(p('id'));
      if (!course) return HOME;
      const field = getField(course.division, course.fields[0] ?? '');
      return field && !skipsFieldLevel(course.division)
        ? { label: field.title, target: fieldRoute(course.division, field.id) }
        : { label: divisionLabel(course.division), target: divisionRoute(course.division) };
    }
    case 'he/[division]/[field]': {
      const division = p('division');
      return isDivision(division)
        ? { label: divisionLabel(division), target: divisionRoute(division) }
        : HOME;
    }
    case 'he/[division]/index':
      return { label: 'Higher Ed', target: { pathname: '/he' } };
    case 'levels':
      return { label: 'Settings', target: { pathname: '/settings' } };
    default:
      return HOME;
  }
}

/**
 * The navigation bar title for a stack screen, from its route. Known before the page renders,
 * so pre-rendered web pages show the real name (not a placeholder like "Skill").
 */
export function screenTitle(screen: string, params: Record<string, unknown>): string | undefined {
  const p = (k: string) => (params[k] === undefined ? '' : String(params[k]));
  switch (screen) {
    case 'skill/[id]':
      return getSkill(p('id'))?.title;
    case 'course/[id]/index':
      return getCourse(p('id'))?.title;
    case 'course/[id]/topic/[index]':
      return getTopic(p('id'), Number(p('index')))?.title;
    case 'grade/[grade]':
      return isGrade(p('grade')) ? gradeLabel(p('grade') as Grade) : undefined;
    case 'he/[division]/index':
      return isDivision(p('division')) ? divisionLabel(p('division') as Division) : undefined;
    case 'he/[division]/[field]': {
      const division = p('division');
      return isDivision(division) ? getField(division, p('field'))?.title : undefined;
    }
    default:
      return undefined;
  }
}

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
import { assignIcons, divisionIcon, strandIcons, type TopicIconName } from './icons';
import { getModule, MODULES, moduleOwner } from './modules';

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

// ─── Problem types ────────────────────────────────────────────────────────────
// A skill can have extra modules for other question types ("<skill id>~<slug>"). Each is its
// own page and its own row in lists, next to the skill it belongs to.

export interface ProblemType {
  /** Module id, e.g. "m.1.add-sub-20~compare". */
  id: string;
  title: string;
  skill: Skill;
  /** What the page is for, in one line ("Use this for …"). */
  use?: string;
}

/** The extra problem-type modules of a skill, in content order. */
export const problemTypes = (skillId: string): ProblemType[] => {
  const skill = getSkill(skillId);
  if (!skill) return [];
  return MODULES.filter((m) => m.id !== skillId && moduleOwner(m.id) === skillId).map((m) => ({
    id: m.id,
    title: m.title ?? m.id,
    skill,
    use: m.use,
  }));
};

/** A problem-type page id ("m.1.add-sub-20~compare") → its module title and skill. */
export const getProblemType = (id: string): ProblemType | undefined => {
  if (!id.includes('~')) return undefined;
  const skill = getSkill(moduleOwner(id));
  const module = getModule(id);
  return skill && module ? { id, title: module.title ?? id, skill, use: module.use } : undefined;
};

/** Every problem-type module id (for pre-rendering pages). */
export const PROBLEM_TYPE_IDS = MODULES.map((m) => m.id).filter((id) => getProblemType(id));

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

/** A row on a grade page: a skill, or one of its problem types (listed right after it). */
export interface GradeRow {
  id: string;
  title: string;
  /** For problem types: the skill they belong to. */
  subtitle?: string;
}

export const gradeSections = (grade: Grade, subject: K12Subject) =>
  groupByStrand(skillsFor(grade, subject)).map(({ title, data }) => ({
    title,
    data: data.flatMap((skill): GradeRow[] => [
      { id: skill.id, title: skill.title },
      ...problemTypes(skill.id).map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: t.use ?? `Problem type · ${skill.title}`,
      })),
    ]),
  }));

// ─── Browse: drilling down from a grade ─────────────────────────────────────

/** A strand's name in a URL: "Operations & Algebraic Thinking" → "operations-algebraic-thinking". */
export const strandSlug = (strand: string) =>
  strand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** A strand box on a grade page. */
export interface StrandCard {
  slug: string;
  title: string;
  icon: TopicIconName;
  subtitle: string;
  route: RouteTarget;
}

export const strandRoute = (grade: Grade, strand: string): RouteTarget => ({
  pathname: '/grade/[grade]/[strand]',
  params: { grade, strand: strandSlug(strand) },
});

/** The grade page: a box for each strand of one subject. */
export function gradeStrands(grade: Grade, subject: K12Subject): StrandCard[] {
  const strands = groupByStrand(skillsFor(grade, subject));
  const icons = strandIcons(strands.map((x) => x.title));
  return strands.map(({ title, data }, i) => ({
    slug: strandSlug(title),
    title,
    icon: icons[i]!,
    subtitle: countLabel(data.length, 'skill'),
    route: strandRoute(grade, title),
  }));
}

/** A strand page: its skills, found by grade and the strand's URL name. */
export function strandView(grade: Grade, slug: string) {
  for (const subject of SUBJECTS) {
    const section = groupByStrand(skillsFor(grade, subject)).find(
      (x) => strandSlug(x.title) === slug,
    );
    if (section) return { subject, title: section.title, skills: section.data };
  }
  return undefined;
}

/** A skill's lessons page (its main lesson and problem types), for skills that have types. */
export const lessonsRoute = (skillId: string): RouteTarget => ({
  pathname: '/lessons/[id]',
  params: { id: skillId },
});

/** Where a skill's box goes: its lessons when it has problem types, else straight to the lesson. */
export const skillBoxRoute = (skillId: string): RouteTarget =>
  problemTypes(skillId).length ? lessonsRoute(skillId) : skillRoute(skillId);

/** Under a skill's box: how many lessons it has. */
export const skillBoxSubtitle = (skillId: string) => {
  const n = problemTypes(skillId).length;
  return n ? `${countLabel(n + 1, 'lesson')}` : 'Lesson';
};

/** Skills that have problem types (each has a lessons page). */
export const skillsWithTypes = () =>
  [...new Set(PROBLEM_TYPE_IDS.map((id) => moduleOwner(id)))].filter((id) => !!getSkill(id));

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
    for (const t of problemTypes(s.id)) {
      entries.push({
        key: t.id,
        kind: 'skill',
        title: t.title,
        label: `${label} · ${s.title}`,
        route: skillRoute(t.id),
        text: normalize(`${t.title} ${s.title} ${label} ${s.strand}`),
      });
    }
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
  /** Short text for the card's colored badge ("K", "5"), or an icon. */
  badge?: string;
  icon?: TopicIconName;
  /** Color tone index for the badge (see `useTone` in the theme). */
  tone: number;
}

// ─── Badges and color tones for cards ────────────────────────────────────────

/** "K" or the grade number, for a grade's badge. */
export const gradeBadge = (grade: Grade) => grade;
/** Grade bands share a tone: K–2, 3–5, 6–8 and 9–12. */
export const gradeTone = (grade: Grade) => {
  const n = grade === 'K' ? 0 : Number(grade);
  return n <= 2 ? 1 : n <= 5 ? 2 : n <= 8 ? 3 : 4;
};
/** Math and science cards have their own tones. */
export const subjectTone = (subject: K12Subject) => (subject === 'math' ? 0 : 6);
/** Each college division has its own color tone. */
export const divisionTone = (division: Division) =>
  ({ math: 0, science: 6, engineering: 5 })[division];

/** Home "My Courses": Math + Science cards per selected grade, one card per selected field. */
export function myCourseCards(levels: readonly LevelKey[]): CourseCard[] {
  const cards = levels.flatMap((key): (CourseCard & { context: TopicIconName })[] => {
    const level = parseLevelKey(key);
    if (!level) return [];
    if (level.kind === 'grade') {
      return SUBJECTS.map((subject) => ({
        key: `${key}/${subject}`,
        title: `${gradeLabel(level.grade)} · ${subjectLabel(subject)}`,
        subtitle: countLabel(skillsFor(level.grade, subject).length, 'skill'),
        route: gradeRoute(level.grade, subject),
        context: subject === 'math' ? 'math-pi' : 'atom',
        tone: subjectTone(subject),
      }));
    }
    const count = coursesFor(level.division, level.field.id).length;
    return [
      {
        key,
        title: level.field.title,
        subtitle: `${divisionLabel(level.division)} · ${countLabel(count, 'course')}`,
        route: fieldRoute(level.division, level.field.id),
        context: divisionIcon(level.division),
        tone: divisionTone(level.division),
      },
    ];
  });
  // Every card gets its own icon: the field's, or one for the subject.
  const icons = assignIcons(
    cards.map((c) => ({ title: c.title.split(' · ').pop()!, context: [c.context] })),
  );
  return cards.map(({ context: _, ...card }, i) => ({ ...card, icon: icons[i] }));
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
  const type = getProblemType(key);
  if (type) {
    return {
      key,
      title: type.title,
      label: `${nodeContext(type.skill)} · ${type.skill.title}`,
      route: skillRoute(key),
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
      // A problem type, or a main lesson with problem types → the skill's lessons page;
      // any other lesson → its strand.
      const skill = getSkill(p('id')) ?? getProblemType(p('id'))?.skill;
      if (!skill) return HOME;
      return problemTypes(skill.id).length
        ? { label: skill.title, target: lessonsRoute(skill.id) }
        : { label: skill.strand, target: strandRoute(skill.grade, skill.strand) };
    }
    case 'lessons/[id]': {
      const skill = getSkill(p('id'));
      return skill ? { label: skill.strand, target: strandRoute(skill.grade, skill.strand) } : HOME;
    }
    case 'grade/[grade]/[strand]': {
      const grade = p('grade');
      if (!isGrade(grade)) return HOME;
      const view = strandView(grade, p('strand'));
      return { label: gradeLabel(grade), target: gradeRoute(grade, view?.subject) };
    }
    case 'grade/[grade]/index':
      return { label: 'Browse', target: { pathname: '/browse' } };
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
      return getSkill(p('id'))?.title ?? getProblemType(p('id'))?.title;
    case 'course/[id]/index':
      return getCourse(p('id'))?.title;
    case 'course/[id]/topic/[index]':
      return getTopic(p('id'), Number(p('index')))?.title;
    case 'grade/[grade]/index':
      return isGrade(p('grade')) ? gradeLabel(p('grade') as Grade) : undefined;
    case 'grade/[grade]/[strand]':
      return isGrade(p('grade')) ? strandView(p('grade') as Grade, p('strand'))?.title : undefined;
    case 'lessons/[id]':
      return getSkill(p('id'))?.title;
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

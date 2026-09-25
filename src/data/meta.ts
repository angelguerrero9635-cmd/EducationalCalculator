/**
 * Page titles and descriptions (for <title>, meta description and link previews), built from
 * the taxonomy and module content so every pre-rendered page describes itself.
 */
import { getLayout, getModule, getModules, layoutSummary } from './modules';
import {
  countLabel,
  divisionLabel,
  getField,
  getTopic,
  subjectLabel,
  type ProblemType,
  type TaxonomyNode,
} from './selectors';
import {
  getNode,
  gradeLabel,
  skillsFor,
  coursesFor,
  type Course,
  type Division,
  type Grade,
  type Skill,
} from './taxonomy';

export interface Meta {
  title: string;
  description: string;
}

/** Keeps descriptions within what search results show (about 160 characters). */
const clip = (text: string, max = 160) =>
  text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;

/** The picture a module uses, in everyday words ("tape" → "bar model"). */
const PICTURE_NAMES: Record<string, string> = {
  tenFrame: 'ten frame',
  tape: 'bar model',
  waterfall: 'add-and-take-away chart',
  bars: 'bar graph',
  compareRows: 'counters in two rows',
  unitTiles: 'cubes and paper clips',
  cubeTrains: 'cube trains',
  pairs: 'pairs of dots',
  array: 'array of dots',
  partition: 'shape cut into equal parts',
  hops: 'number line with jumps',
  numberBond: 'number bond',
  patternBlocks: 'pattern blocks',
  lineUp: 'children in a line',
  equalGroups: 'equal groups',
  prism: 'solid shape',
  solid: 'solid shapes',
  dotSet: 'dots to count',
  tally: 'tally chart',
  coinRow: 'coins',
  partnerList: 'number partners',
  thermometers: 'thermometers',
  rockLayers: 'rock layers',
  pushes: 'pushes on a box',
  areaModel: 'area model',
};
const pictureName = (kind: string) =>
  PICTURE_NAMES[kind] ?? kind.replace(/([A-Z])/g, ' $1').toLowerCase();

/** What the lesson page offers, from its module, e.g. "Interactive ten frame, …". */
function lessonSummary(id: string, early: boolean): string {
  const layout = getLayout(id);
  if (layout) return `${layoutSummary(layout)} ${layout.assumptions[0] ?? ''}`.trim();
  const modules = id.includes('~')
    ? [getModule(id)].filter((m) => !!m)
    : getModules(id).slice(0, 1);
  const main = modules[0];
  if (!main) return 'Lesson coming soon, with refresh links to earlier skills.';
  const pictures = [...new Set(modules.map((m) => pictureName(m.representation.kind)))];
  return (
    `Interactive ${pictures.join(', ')}, ${early ? 'number sentences' : 'formulas'}, ` +
    `assumptions and step-by-step examples. ${main.assumptions[0] ?? ''}`
  ).trim();
}

export function skillMeta(skill: Skill): Meta {
  const level = `${gradeLabel(skill.grade)} ${subjectLabel(skill.subject)}`;
  const early = ['K', '1', '2'].includes(skill.grade);
  return {
    title: `${skill.title} – ${level}`,
    description: clip(`${level}: ${skill.title}. ${lessonSummary(skill.id, early)}`),
  };
}

export function problemTypeMeta(type: ProblemType): Meta {
  const { skill } = type;
  const level = `${gradeLabel(skill.grade)} ${subjectLabel(skill.subject)}`;
  const early = ['K', '1', '2'].includes(skill.grade);
  return {
    title: `${type.title}: ${skill.title} – ${level}`,
    description: clip(`${level}: ${type.title} (${skill.title}). ${lessonSummary(type.id, early)}`),
  };
}

export function courseMeta(course: Course): Meta {
  return {
    title: `${course.title} – ${divisionLabel(course.division)} course`,
    description: clip(
      `${course.title}: ${countLabel(course.topics.length, 'topic')} — ${course.topics.join(', ')}.`,
    ),
  };
}

export function topicMeta(courseId: string, index: number): Meta | undefined {
  const topic = getTopic(courseId, index);
  if (!topic) return undefined;
  return {
    title: `${topic.title} – ${topic.course.title}`,
    description: clip(
      `${topic.title}, a topic in ${topic.course.title}. ${lessonSummary(`${courseId}#${index}`, false)}`,
    ),
  };
}

export function gradeMeta(grade: Grade): Meta {
  const math = skillsFor(grade, 'math');
  const science = skillsFor(grade, 'science');
  return {
    title: `${gradeLabel(grade)} Math and Science`,
    description: clip(
      `${gradeLabel(grade)}: ${countLabel(math.length, 'math skill')} and ` +
        `${countLabel(science.length, 'science skill')}, including ` +
        `${[...math.slice(0, 2), ...science.slice(0, 1)].map((s) => s.title).join('; ')}.`,
    ),
  };
}

export function divisionMeta(division: Division): Meta {
  return {
    title: `${divisionLabel(division)} – Higher Education`,
    description: clip(
      `University ${divisionLabel(division).toLowerCase()} courses, by field, with topics and ` +
        'worked examples.',
    ),
  };
}

export function fieldMeta(division: Division, fieldId: string): Meta | undefined {
  const field = getField(division, fieldId);
  if (!field) return undefined;
  const courses = coursesFor(division, fieldId);
  return {
    title: `${field.title} courses – ${divisionLabel(division)}`,
    description: clip(
      `${countLabel(courses.length, 'course')} in ${field.title}: ` +
        `${courses.map((c) => c.title).join(', ')}.`,
    ),
  };
}

/** Metadata for any skill or course id (used by links and the sitemap). */
export function nodeMeta(id: string): Meta | undefined {
  const node: TaxonomyNode | undefined = getNode(id);
  if (!node) return undefined;
  return 'grade' in node ? skillMeta(node) : courseMeta(node);
}

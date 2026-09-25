import { CUSTOM } from '@/icons/custom';
import { TABLER } from '@/icons/tabler';

import {
  courseIcons,
  divisionIcon,
  fieldIcons,
  iconFromTitle,
  lessonIcons,
  skillIcons,
  topicIcons,
  type TopicIconName,
} from '../icons';
import {
  DIVISIONS,
  gradeStrands,
  myCourseCards,
  problemTypes,
  strandView,
  SUBJECTS,
} from '../selectors';
import { COURSES, coursesFor, GRADES, HE_FIELDS, type Division } from '../taxonomy';

/** Every group of boxes shown together on one page, with its icons. */
function groups(): [string, (TopicIconName | undefined)[]][] {
  const out: [string, (TopicIconName | undefined)[]][] = [];
  for (const g of GRADES) {
    for (const subject of SUBJECTS) {
      const strands = gradeStrands(g, subject);
      out.push([`grade ${g} ${subject}`, strands.map((s) => s.icon)]);
      for (const s of strands) {
        const view = strandView(g, s.slug)!;
        out.push([`${g} ${s.title}`, skillIcons(view.skills)]);
        for (const skill of view.skills) {
          const types = problemTypes(skill.id).map((t) => t.title);
          if (types.length) out.push([`lessons ${skill.id}`, lessonIcons(skill, types)]);
        }
      }
    }
  }
  out.push(['divisions', DIVISIONS.map(divisionIcon)]);
  for (const [division, fields] of Object.entries(HE_FIELDS) as [
    Division,
    { id: string; title: string }[],
  ][]) {
    out.push([
      `fields ${division}`,
      fieldIcons(
        division,
        fields.map((f) => f.title),
      ),
    ]);
    for (const f of fields)
      out.push([`courses ${division}/${f.id}`, courseIcons(coursesFor(division, f.id))]);
  }
  for (const c of COURSES) out.push([`topics ${c.id}`, topicIcons(c)]);
  const home = myCourseCards(['grade:K', 'grade:1', 'grade:2', 'field:engineering/civil']);
  out.push(['home', home.map((c) => c.icon)]);
  return out;
}

describe('Browse box icons', () => {
  it('picks a picture that fits the title', () => {
    expect(iconFromTitle('Tell time to the hour and half hour')).toBe('clock');
    expect(iconFromTitle('Multiply and divide within 100')).toBe('times-sign');
    expect(iconFromTitle('Area of rectangles (A = l × w)')).toBe('area-grid');
    expect(iconFromTitle('Heavier and lighter')).toBe('scale');
    expect(iconFromTitle('Human Anatomy & Physiology')).toBe('heartbeat');
    expect(iconFromTitle('Interference and diffraction')).toBe('ripple');
    expect(iconFromTitle('Word problems')).toBe('book');
  });

  it('never repeats an icon among boxes shown together, and draws every icon', () => {
    const drawn = new Set([...Object.keys(CUSTOM), ...Object.keys(TABLER)]);
    for (const [name, icons] of groups()) {
      for (const icon of icons) expect([name, icon && drawn.has(icon)]).toEqual([name, true]);
      const repeated = icons.filter((x, i) => icons.indexOf(x) !== i);
      expect([name, repeated]).toEqual([name, []]);
    }
  });
});

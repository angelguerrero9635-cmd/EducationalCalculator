import { LAYOUTS, MODULES } from '@/data/modules';

import { menuGroupOf, menuGroups, routePath } from '../menu';
import { pageRoute } from '../selectors';

describe('side menu', () => {
  const groups = menuGroups();
  const rows = groups.flatMap((g) => g.rows);
  const paths = new Set(rows.flatMap((r) => (r.route ? [routePath(r.route)] : [])));

  it('has a dropdown for each grade, then each college division', () => {
    expect(groups.slice(0, 13).map((g) => g.label)).toEqual([
      'Kindergarten',
      ...['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((g) => `Grade ${g}`),
    ]);
    expect(groups[13]!.section).toBe('Higher Education');
  });

  it('reaches every lesson page, main pages and problem types alike', () => {
    for (const m of [...MODULES, ...LAYOUTS]) {
      // A college topic's page (and its problem types) is its course's topic page
      // ("he.physics.university-1#0" → /course/he.physics.university-1/topic/0).
      const route = pageRoute(m.id)!;
      expect([m.id, paths.has(routePath(route))]).toEqual([m.id, true]);
    }
  });

  it('indents a grade: subject, strand, skill, then its problem types', () => {
    const grade3 = groups.find((g) => g.key === 'grade:3')!.rows;
    const at = (key: string) => grade3.find((r) => r.key === key)!;
    expect(at('grade:3:math').depth).toBe(0);
    // A strand is a heading: indented, with no page of its own.
    expect(at('grade:3:math:Measurement & Data').depth).toBe(1);
    expect(at('grade:3:math:Measurement & Data').route).toBeUndefined();
    expect(at('m.3.area').depth).toBe(2);
    expect(at('m.3.area~split').depth).toBe(3);
  });

  it('indents a course topic’s problem types under the topic', () => {
    const rows = groups.flatMap((g) => g.rows);
    for (const row of rows.filter((r) => /#\d+~/.test(r.key))) {
      const topic = rows.find((r) => r.key === row.key.split('~')[0])!;
      expect(row.depth).toBe(topic.depth + 1);
      expect(rows.indexOf(row)).toBeGreaterThan(rows.indexOf(topic));
    }
  });

  it('has unique keys', () => {
    const keys = [...groups.map((g) => g.key), ...rows.map((r) => r.key)];
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
  });

  it('opens the dropdown of the page the student is on', () => {
    const here = '/skill/m.3.area~split';
    expect(menuGroupOf((r) => routePath(r) === here)).toBe('grade:3');
  });
});

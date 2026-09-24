import {
  DIVISIONS,
  SUBJECTS,
  buildSearchIndex,
  courseSummary,
  divisionView,
  fieldRoute,
  getSkill,
  gradeSections,
  PROBLEM_TYPE_IDS,
  groupByStrand,
  levelGroups,
  myCourseCards,
  nodeContext,
  parseLevelKey,
  pushRecent,
  refreshRows,
  resolveItem,
  sanitizeLevels,
  search,
  skipsFieldLevel,
  topicKey,
} from '../selectors';
import {
  COURSES,
  GRADES,
  HE_FIELDS,
  SKILLS,
  coursesFor,
  getNode,
  skillsFor,
  type Skill,
} from '../taxonomy';

const skill = (id: string, strand: string): Skill => ({
  id,
  title: id,
  grade: '1',
  subject: 'math',
  strand,
  prereqs: [],
});

describe('groupByStrand', () => {
  it('groups by strand in first-appearance order, keeping skill order', () => {
    const sections = groupByStrand([
      skill('a', 'NBT'),
      skill('b', 'OA'),
      skill('c', 'NBT'),
      skill('d', 'G'),
    ]);
    expect(sections.map((s) => s.title)).toEqual(['NBT', 'OA', 'G']);
    expect(sections[0]?.data.map((s) => s.id)).toEqual(['a', 'c']);
  });

  it('returns no sections for no skills', () => {
    expect(groupByStrand([])).toEqual([]);
  });

  it('covers every skill of a grade/subject exactly once', () => {
    for (const grade of GRADES) {
      for (const subject of SUBJECTS) {
        const sections = gradeSections(grade, subject);
        const ids = sections.flatMap((s) => s.data.map((k) => k.id));
        // Every skill once, each followed by its problem types.
        expect(ids.filter((id) => !id.includes('~')).sort()).toEqual(
          skillsFor(grade, subject)
            .map((k) => k.id)
            .sort(),
        );
        for (const section of sections) {
          for (const row of section.data) {
            const skill = getSkill(row.id.split('~')[0]!)!;
            expect(skill.strand).toBe(section.title);
          }
        }
      }
    }
  });
});

describe('Higher Ed browsing', () => {
  it('Math division skips the field level and lists courses directly', () => {
    expect(skipsFieldLevel('math')).toBe(true);
    const view = divisionView('math');
    expect(view.kind).toBe('courses');
    if (view.kind !== 'courses') return;
    expect(view.field.id).toBe('math');
    expect(view.courses.map((c) => c.id)).toEqual(coursesFor('math', 'math').map((c) => c.id));
    expect(view.courses.length).toBeGreaterThan(0);
    expect(fieldRoute('math', 'math')).toEqual({
      pathname: '/he/[division]',
      params: { division: 'math' },
    });
  });

  it('multi-field divisions show a field list', () => {
    for (const division of ['science', 'engineering'] as const) {
      expect(skipsFieldLevel(division)).toBe(false);
      const view = divisionView(division);
      expect(view).toEqual({ kind: 'fields', fields: HE_FIELDS[division] });
      expect(fieldRoute(division, 'x')).toEqual({
        pathname: '/he/[division]/[field]',
        params: { division, field: 'x' },
      });
    }
  });
});

describe('reachability through Browse', () => {
  it('every skill and problem type is reachable from a grade screen', () => {
    const reached = new Set(
      GRADES.flatMap((g) =>
        SUBJECTS.flatMap((s) => gradeSections(g, s).flatMap((sec) => sec.data.map((k) => k.id))),
      ),
    );
    expect([...reached].sort()).toEqual([...SKILLS.map((s) => s.id), ...PROBLEM_TYPE_IDS].sort());
  });

  it('every course is reachable from a division or field screen', () => {
    const reached = new Set<string>();
    for (const division of DIVISIONS) {
      const view = divisionView(division);
      const courses =
        view.kind === 'courses'
          ? view.courses
          : view.fields.flatMap((f) => coursesFor(division, f.id));
      courses.forEach((c) => reached.add(c.id));
    }
    expect([...reached].sort()).toEqual(COURSES.map((c) => c.id).sort());
  });

  it('every course is cross-listed only under fields that exist in HE_FIELDS', () => {
    for (const c of COURSES) {
      const known = HE_FIELDS[c.division].map((f) => f.id);
      expect(c.fields.filter((f) => !known.includes(f))).toEqual([]);
    }
  });
});

describe('refreshRows', () => {
  it('has one navigable row per prereq, routed to the right screen', () => {
    for (const node of [...SKILLS, ...COURSES]) {
      const rows = refreshRows(node.id);
      expect(rows.map((r) => r.id)).toEqual(node.prereqs);
      for (const row of rows) {
        const target = getNode(row.id);
        expect(target).toBeDefined();
        const expected = target && 'grade' in target ? '/skill/[id]' : '/course/[id]';
        expect(row.route).toEqual({ pathname: expected, params: { id: row.id } });
      }
    }
  });

  it('labels skill refreshes with grade and subject', () => {
    expect(refreshRows('s.10.mole')).toEqual([
      {
        id: 'm.8.scientific-notation',
        title: 'Scientific notation',
        label: 'Refresh: Grade 8 · Math',
        route: { pathname: '/skill/[id]', params: { id: 'm.8.scientific-notation' } },
      },
    ]);
  });
});

describe('search', () => {
  it('matches skill titles with a grade · subject label', () => {
    const results = search('scientific notation');
    expect(results[0]).toMatchObject({
      kind: 'skill',
      key: 'm.8.scientific-notation',
      label: 'Grade 8 · Math',
    });
  });

  it('matches course titles', () => {
    const results = search('calculus ii');
    expect(results.map((r) => r.key)).toEqual(
      expect.arrayContaining(['he.math.calc-2', 'he.math.calc-3']),
    );
    expect(results.find((r) => r.key === 'he.math.calc-2')?.kind).toBe('course');
  });

  it('matches course topics with a division · course label', () => {
    const results = search('trusses');
    expect(results).toEqual([
      expect.objectContaining({
        kind: 'topic',
        title: 'Trusses and frames',
        label: 'Engineering · Statics',
        route: {
          pathname: '/course/[id]/topic/[index]',
          params: { id: 'he.engineering.statics', index: '1' },
        },
      }),
    ]);
  });

  it('is case- and diacritic-insensitive and requires every term', () => {
    expect(search('SCHRODINGER').map((r) => r.title)).toEqual(
      expect.arrayContaining(['Schrödinger equation', 'Solving the Schrödinger equation']),
    );
    expect(search('kinetic potential').map((r) => r.key)).toContain('s.8.kinetic-potential');
    expect(search('kinetic zzz')).toEqual([]);
  });

  it('ranks title-prefix matches first', () => {
    const [first] = search('circuit');
    expect(first?.title.toLowerCase().startsWith('circuit')).toBe(true);
  });

  it('returns nothing for a blank query', () => {
    expect(search('   ')).toEqual([]);
  });

  it('indexes every skill, problem type, course and topic', () => {
    const topics = COURSES.reduce((n, c) => n + c.topics.length, 0);
    expect(buildSearchIndex()).toHaveLength(
      SKILLS.length + PROBLEM_TYPE_IDS.length + COURSES.length + topics,
    );
  });
});

describe('nodeContext', () => {
  it('describes skills and courses', () => {
    expect(nodeContext(getNode('m.K.count-100')!)).toBe('Kindergarten · Math');
    expect(nodeContext(getNode('he.math.calc-1')!)).toBe('Math');
    expect(nodeContext(getNode('he.chemistry.organic-1')!)).toBe('Science · Chemistry');
    expect(nodeContext(getNode('he.engineering.statics')!)).toBe(
      'Engineering · Classical (Engineering Mechanics), Aerospace +3',
    );
  });
});

describe('courseSummary', () => {
  it('counts topics and cross-listings', () => {
    expect(courseSummary(getNode('he.math.calc-1') as never)).toBe('5 topics');
    expect(courseSummary(getNode('he.engineering.statics') as never)).toBe(
      '5 topics · cross-listed in 5 fields',
    );
  });
});

describe('levels', () => {
  it('offers every grade and every Higher Ed field', () => {
    const keys = levelGroups().flatMap((g) => g.options.map((o) => o.key));
    const fieldCount = DIVISIONS.reduce((n, d) => n + HE_FIELDS[d].length, 0);
    expect(keys).toHaveLength(GRADES.length + fieldCount);
    expect(keys.every((k) => parseLevelKey(k) !== undefined)).toBe(true);
  });

  it('sanitizes persisted selections', () => {
    expect(
      sanitizeLevels(['field:engineering/civil', 'grade:8', 'grade:99', 'grade:8', 3]),
    ).toEqual(['grade:8', 'field:engineering/civil']);
    expect(sanitizeLevels('nope')).toEqual([]);
  });

  it('builds My Courses cards', () => {
    expect(myCourseCards(['grade:8', 'field:math/math', 'field:engineering/civil'])).toEqual([
      expect.objectContaining({
        title: 'Grade 8 · Math',
        subtitle: `${skillsFor('8', 'math').length} skills`,
      }),
      expect.objectContaining({ title: 'Grade 8 · Science' }),
      expect.objectContaining({
        title: 'Mathematics',
        route: { pathname: '/he/[division]', params: { division: 'math' } },
      }),
      expect.objectContaining({
        title: 'Civil',
        subtitle: `Engineering · ${coursesFor('engineering', 'civil').length} courses`,
      }),
    ]);
  });
});

describe('recents', () => {
  it('moves items to the front, de-duplicates and caps at 10', () => {
    let list: string[] = [];
    for (let i = 0; i < 12; i++) list = pushRecent(list, `k${i}`);
    expect(list).toHaveLength(10);
    expect(list[0]).toBe('k11');
    list = pushRecent(list, 'k5');
    expect(list[0]).toBe('k5');
    expect(list.filter((k) => k === 'k5')).toHaveLength(1);
  });

  it('resolves skills, courses and topics, and drops unknown keys', () => {
    expect(resolveItem('m.8.slope')?.title).toBe('Slope and rate of change');
    expect(resolveItem('he.math.calc-1')?.route.pathname).toBe('/course/[id]');
    expect(resolveItem(topicKey('he.math.calc-1', 0))).toMatchObject({
      title: 'Limits and continuity',
      route: { pathname: '/course/[id]/topic/[index]' },
    });
    expect(resolveItem('m.99.nope')).toBeUndefined();
    expect(resolveItem(topicKey('he.math.calc-1', 99))).toBeUndefined();
  });
});

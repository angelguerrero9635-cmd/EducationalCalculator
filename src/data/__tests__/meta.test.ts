import { courseMeta, gradeMeta, skillMeta, topicMeta } from '../meta';
import { screenTitle } from '../selectors';
import { COURSES, SKILLS, getNode, type Course, type Skill } from '../taxonomy';

describe('page metadata (titles and descriptions in pre-rendered HTML)', () => {
  it('names the skill, grade and subject, and describes the lesson', () => {
    const m = skillMeta(getNode('m.K.make-10') as Skill);
    expect(m.title).toBe('Make 10 from any number 1–9 – Kindergarten Math');
    expect(m.description).toContain('ten frame');
    expect(m.description).toContain('number sentences');
  });

  it('gives every skill and course a unique title and a description under 161 characters', () => {
    const all = [...SKILLS.map(skillMeta), ...COURSES.map((c: Course) => courseMeta(c))];
    expect(new Set(all.map((m) => m.title)).size).toBe(all.length);
    for (const m of all) {
      expect(m.description.length).toBeGreaterThan(20);
      expect(m.description.length).toBeLessThanOrEqual(160);
    }
  });

  it('covers grades and topics', () => {
    expect(gradeMeta('K').title).toBe('Kindergarten Math and Science');
    expect(topicMeta('he.math.calc-1', 1)?.title).toBe(
      'Derivatives and differentiation rules – Calculus I',
    );
  });

  it('knows each detail page’s navigation bar title from its route', () => {
    expect(screenTitle('skill/[id]', { id: 'm.K.make-10' })).toBe('Make 10 from any number 1–9');
    expect(screenTitle('grade/[grade]/index', { grade: 'K' })).toBe('Kindergarten');
    expect(screenTitle('grade/[grade]/[strand]', { grade: 'K', strand: 'geometry' })).toBe(
      'Geometry',
    );
    expect(screenTitle('lessons/[id]', { id: 'm.1.add-sub-20' })).toBe(
      'Add and subtract within 20',
    );
    expect(screenTitle('course/[id]/topic/[index]', { id: 'he.math.calc-1', index: '1' })).toBe(
      'Derivatives and differentiation rules',
    );
  });
});

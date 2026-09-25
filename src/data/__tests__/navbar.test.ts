import { parentOf } from '../selectors';

describe('parentOf (navigation bar back button)', () => {
  it('goes up from a lesson to its skill, strand and grade', () => {
    expect(parentOf('skill/[id]', { id: 'm.1.add-sub-20~compare' })).toEqual({
      label: 'Add and subtract within 20',
      target: { pathname: '/lessons/[id]', params: { id: 'm.1.add-sub-20' } },
    });
    expect(parentOf('lessons/[id]', { id: 'm.1.add-sub-20' })).toEqual({
      label: 'Operations & Algebraic Thinking',
      target: {
        pathname: '/grade/[grade]/[strand]',
        params: { grade: '1', strand: 'operations-algebraic-thinking' },
      },
    });
    expect(
      parentOf('grade/[grade]/[strand]', { grade: '1', strand: 'operations-algebraic-thinking' }),
    ).toEqual({
      label: 'Grade 1',
      target: { pathname: '/grade/[grade]', params: { grade: '1', subject: 'math' } },
    });
    expect(parentOf('grade/[grade]/index', { grade: '1' }).label).toBe('Browse');
  });

  it('goes from a topic to its course, and a course to its field or division', () => {
    expect(parentOf('course/[id]/topic/[index]', { id: 'he.math.calc-1', index: '1' })).toEqual({
      label: 'Course',
      target: { pathname: '/course/[id]', params: { id: 'he.math.calc-1' } },
    });
    expect(parentOf('course/[id]/index', { id: 'he.math.calc-1' }).label).toBe('Math');
  });

  it('falls back to Home for unknown pages', () => {
    expect(parentOf('grade/[grade]', { grade: '3' }).label).toBe('Home');
    expect(parentOf('skill/[id]', { id: 'nope' }).label).toBe('Home');
  });
});

/**
 * Trial steps (HE-E14) and closed forms read from a rule (HE-E18), on test-only pages and the
 * one K–12 page that finds a value by trial (the growth rate that empties a reserve).
 */
import { solve } from '@/engine/solve';
import type { Relation, Values, VariableDef } from '@/engine/types';

import { getModule } from '..';
import { buildSteps } from '../buildSteps';
import { plainWalkthrough } from '../harness/evaluate';
import { checkTrialLines } from '../harness/trials';
import { trialWork } from '../trials';
import type { ModuleDef } from '../types';

function walk(m: ModuleDef, given = m.startWith.map((id) => ({ id, value: m.example[id]! }))) {
  const res = solve({ variables: m.variables, relations: m.relations, id: m.id }, given);
  return plainWalkthrough(buildSteps(m, res));
}

const V = (id: string, symbol: string, name: string, extra: Partial<VariableDef> = {}) =>
  ({ id, symbol, name, min: -100, max: 100, ...extra }) as VariableDef;

/** Kepler's equation M = E − e sin E (radians), with the trial method given. */
function kepler(trial: Relation['trials']): ModuleDef {
  return {
    id: 'he.test#0~kepler',
    title: 'Kepler’s equation',
    assumptions: ['Angles in radians.'],
    variables: [
      V('M', 'M', 'Mean anomaly', { min: 0, max: 6.3 }),
      V('e', 'e', 'Eccentricity', { min: 0, max: 0.97 }),
      V('E', 'E', 'Eccentric anomaly', { min: 0, max: 6.3 }),
    ],
    relations: [
      {
        id: 'M = E − e sin E',
        display: '{M} = {E} − {e} × sin({E})',
        vars: ['M', 'E', 'e'],
        residual: (v) => v.M! - (v.E! - v.e! * Math.sin(v.E!)),
        solve: { M: (v) => v.E! - v.e! * Math.sin(v.E!) },
        trials: trial,
      },
    ],
    steps: { 'M = E − e sin E': { M: { expr: '{E} − {e} × sin({E})', how: 'Work it out.' } } },
    example: { M: 1, e: 0.5, E: 1.4987011 },
    startWith: ['M', 'e'],
    representation: { kind: 'none' },
  } as ModuleDef;
}

describe('trial steps (HE-E14)', () => {
  it('repeats Kepler’s rule E = M + e sin E until it settles', () => {
    const w = walk(
      kepler({ E: { method: 'fixed-point', next: '{M} + {e} × sin({E})', start: (v) => v.M! } }),
    );
    const s = w.steps.find((x) => x.id === 'E')!;
    expect(s.how).toMatch(/^No rearrangement puts E on its own, so the rule is repeated/);
    expect(s.lines[0]).toBe('E₀ = 1');
    expect(s.lines[1]).toBe('E₁ = 1 + 0.5 × sin(1) = 1.4207');
    expect(s.lines[s.lines.length - 1]).toMatch(/= 1\.4987$/);
    const t = checkTrialLines(s.lines, 1.4987);
    expect(t).toEqual({ problems: [], unread: [], read: true });
  });

  it('halves the range where the sides cross (bisection)', () => {
    const w = walk(kepler({ E: { method: 'bisection' } }));
    const s = w.steps.find((x) => x.id === 'E')!;
    expect(s.lines[0]).toBe('Try E = 1: 1 − 0.5 × sin(1) = 0.57926 (want 1)');
    expect(s.lines).toContain('…');
    expect(checkTrialLines(s.lines, 1.4987)).toEqual({ problems: [], unread: [], read: true });
  });

  it('tries round guesses, then the secant method, by default', () => {
    const w = walk(kepler(undefined));
    const s = w.steps.find((x) => x.id === 'E')!;
    expect(s.how).toMatch(/found by trial: each next try is where a straight line/);
    expect(s.lines.slice(0, 2)).toEqual([
      'Try E = 1: 1 − 0.5 × sin(1) = 0.57926 (want 1)',
      'Try E = 2: 2 − 0.5 × sin(2) = 1.5454 (want 1)',
    ]);
    expect(s.lines.length).toBeLessThanOrEqual(8);
    expect(checkTrialLines(s.lines, 1.4987)).toEqual({ problems: [], unread: [], read: true });
  });

  it('works Newton’s method from f and its slope', () => {
    const m: ModuleDef = {
      id: 'he.test#0~newton',
      title: 'A cubic root',
      assumptions: ['One real root.'],
      variables: [V('c', 'c', 'Constant'), V('x', 'x', 'Root', { min: 0, max: 10 })],
      relations: [
        {
          id: 'x³ − x = c',
          display: '{x}³ − {x} = {c}',
          vars: ['x', 'c'],
          residual: (v: Values) => v.x! ** 3 - v.x! - v.c!,
          solve: { c: (v: Values) => v.x! ** 3 - v.x! },
          trials: {
            x: { method: 'newton', f: '{x}³ − {x} − {c}', slope: '3 × {x}² − 1', start: () => 2 },
          },
        },
      ],
      steps: {},
      example: { c: 3, x: 1.6717 },
      startWith: ['c'],
      representation: { kind: 'none' },
    } as unknown as ModuleDef;
    const s = walk(m).steps[0]!;
    expect(s.lines.slice(0, 2)).toEqual([
      'x₀ = 2',
      'x₁ = 2 − (2³ − 2 − 3) ÷ (3 × 2² − 1) = 1.7273',
    ]);
    expect(checkTrialLines(s.lines, 1.6717)).toEqual({ problems: [], unread: [], read: true });
  });

  it('finds a growth rate by trial on the K–12 reserve page', () => {
    const m = getModule('s.12.resource-management~growing-use')!;
    const w = walk(m, [
      { id: 'Q', value: 600 },
      { id: 'r', value: 15 },
      { id: 'T', value: 25 },
    ]);
    const s = w.steps.find((x) => x.id === 'k')!;
    expect(s.lines).toEqual([
      'Try k = 0.03: ln(1 + 0.03 × 600 ÷ 15) ÷ 0.03 = 26.28 (want 25)',
      'Try k = 0.04: ln(1 + 0.04 × 600 ÷ 15) ÷ 0.04 = 23.89 (want 25)',
      'Try k = 0.03536: ln(1 + 0.03536 × 600 ÷ 15) ÷ 0.03536 = 24.93 (want 25)',
      'Try k = 0.03505: ln(1 + 0.03505 × 600 ÷ 15) ÷ 0.03505 = 25 (want 25)',
    ]);
    expect(s.answer).toBe('k = 0.0351');
    expect(checkTrialLines(s.lines, 0.0351)).toEqual({ problems: [], unread: [], read: true });
  });

  it('flags a try that is wrong as printed, or tries that stop short', () => {
    const lines = [
      'Try k = 0.03: ln(1 + 0.03 × 600 ÷ 15) ÷ 0.03 = 26.28 (want 25)',
      'Try k = 0.04: ln(1 + 0.04 × 600 ÷ 15) ÷ 0.04 = 22.89 (want 25)',
    ];
    const t = checkTrialLines(lines, 0.0351);
    expect(t.problems.some((p) => p.startsWith('try doesn’t'.replace('’', "'")))).toBe(true);
    expect(t.problems.some((p) => p.includes("isn't the answer"))).toBe(true);
    expect(checkTrialLines(['E₀ = 1', 'E₁ = 1 + 0.5 × sin(1) = 1.4207'], 1.4987).problems).toEqual([
      'the iterations stop before they settle: "E₁ = 1 + 0.5 × sin(1) = 1.4207"',
      'the iterations end away from the answer: "E₁ = 1 + 0.5 × sin(1) = 1.4207"',
    ]);
  });

  it('reads negative values in scientific notation, with either minus', () => {
    expect(
      checkTrialLines(['Try t = 1: 0 × 1 + ½ × (-0.1) × 1² = -5 × 10⁻² (want −5 × 10⁻²)'], 1),
    ).toEqual({ problems: [], unread: [], read: true });
  });

  it('takes a target near 0 beside large terms as met within the guess’s last figure', () => {
    // 15148.52 − 15770 × sin(73.8°) is 4.7, but 15765 gives −0.1: the target 0.01 is between.
    const line = 'Try F = 15770: 15148.52 − 15770 × sin(73.8°) = 4.689 (want 0.01)';
    expect(checkTrialLines([line], 15765).problems).toEqual([]);
    const far = 'Try F = 15700: 15148.52 − 15700 × sin(73.8°) = 71.9 (want 0.01)';
    expect(checkTrialLines([far], 15765).problems).toContain(
      `the last try doesn't meet the target: "${far}"`,
    );
  });

  it('writes nothing it can’t work out as printed', () => {
    const vars = [V('a', 'a', 'A'), V('n', 'n', 'N')];
    expect(
      trialWork({
        display: '{a} = the {n}th prime',
        id: 'n',
        symbol: 'n',
        vars,
        values: { a: 7, n: 4 },
        figures: undefined,
      }),
    ).toBeUndefined();
  });
});

describe('closed forms read from a rule (HE-E18)', () => {
  it('solves for an exponent with logs where an Algebra 2 page wrote no step for it', () => {
    const m = getModule('m.11.exp-log-equations~same-base')!;
    const w = walk(
      m,
      ['g', 'B1', 'q', 'm'].map((id) => ({ id, value: m.example[id]! })),
    );
    const s = w.steps.find((x) => x.id === 'p')!;
    expect(s.how).toBe('Take log₁₀ of both sides and divide by log₁₀ g.');
    expect(s.rearranged).toBe('p = log₁₀(B₁) ÷ log₁₀(g)');
    expect(s.lines).toContain('p = 0.6021 ÷ 0.301');
  });

  it('tries values in Algebra 1, which has no logs yet', () => {
    const m = getModule('m.9.exponential-functions~percent-growth')!;
    const w = walk(
      m,
      ['P', 'A', 'g'].map((id) => ({ id, value: m.example[id]! })),
    );
    const s = w.steps.find((x) => x.id === 't')!;
    expect(s.how).toMatch(/^No rearrangement puts t on its own, so it is found by trial/);
    expect(s.lines.join('\n')).not.toMatch(/log/);
    expect(checkTrialLines(s.lines, 4).problems).toEqual([]);
  });
});

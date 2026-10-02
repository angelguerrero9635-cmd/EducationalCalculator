import { categoryVariable, classify, orderedRoots, piecewise, rootRule } from '@/engine/cases';
import { solve } from '@/engine/solve';
import type { VariableDef } from '@/engine/types';

import { buildSteps } from '../../buildSteps';
import type { ModuleDef } from '../../types';
import { caseIssues } from '../cases';
import { evaluate, plainWalkthrough, shownClose } from '../evaluate';

const value = (id: string, symbol: string, name: string, min: number, max: number) =>
  ({ id, symbol, name, min, max, step: 0.0001 }) as VariableDef;

/** A college page (no grade in its id: Grades 9–12 wording). */
const page = (m: Partial<ModuleDef>) =>
  ({
    id: 'fluids#0~test',
    assumptions: [],
    representation: { kind: 'none' },
    ...m,
  }) as unknown as ModuleDef;

const regime = classify({
  id: 'flow regime',
  out: 'R',
  ins: ['Re'],
  display: '{R} = laminar if {Re} < 2,300, else turbulent',
  bands: [
    { name: 'laminar', when: '{Re} < 2300', applies: (v) => v.Re! < 2300 },
    { name: 'turbulent', when: '{Re} ≥ 2300', applies: (v) => v.Re! >= 2300 },
  ],
});
const friction = piecewise({
  id: 'friction factor',
  display: '{f} = 64 ÷ {Re} below 2,300, else 0.316 ÷ {Re}^0.25',
  vars: ['f', 'Re'],
  branches: [
    {
      name: 'laminar',
      when: '{Re} < 2300',
      applies: (v) => v.Re! < 2300,
      residual: (v) => v.f! - 64 / v.Re!,
      solve: { f: (v) => 64 / v.Re!, Re: (v) => 64 / v.f! },
      display: '{f} = 64 ÷ {Re}',
    },
    {
      name: 'turbulent',
      when: '{Re} ≥ 2300',
      applies: (v) => v.Re! >= 2300,
      residual: (v) => v.f! - 0.316 / v.Re! ** 0.25,
      solve: { f: (v) => 0.316 / v.Re! ** 0.25, Re: (v) => (0.316 / v.f!) ** 4 },
      display: '{f} = 0.316 ÷ {Re}^0.25',
    },
  ],
});
const pipe = page({
  variables: [
    value('Re', 'Re', 'Reynolds number', 100, 100000),
    value('f', 'f', 'Friction factor', 0.001, 1),
    categoryVariable('R', 'R', 'Flow regime', ['laminar', 'turbulent']),
  ],
  relations: [friction, regime],
  steps: {
    'friction factor': {
      f: {
        expr: (v) => (v.Re! < 2300 ? '64 ÷ {Re}' : '0.316 ÷ {Re}^0.25'),
        how: 'Laminar flow loses 64 ÷ Re; turbulent flow in a smooth pipe follows Blasius.',
      },
      Re: {
        expr: (v) => (v.f! > 64 / 2300 ? '64 ÷ {f}' : '(0.316 ÷ {f})^4'),
        how: 'Undo the formula of the case the flow is in.',
      },
    },
    'flow regime': { R: { expr: 'the regime at {Re}', how: 'Compare Re with 2,300.' } },
  },
  example: { Re: 3400, f: 0.316 / 3400 ** 0.25, R: 2 },
  startWith: ['Re'],
});

describe('steps of relations that switch', () => {
  it('name the case and why, and a category reads as its word', () => {
    const res = solve(pipe, [{ id: 'Re', value: 3400 }]);
    const w = plainWalkthrough(buildSteps(pipe, res));
    const f = w.steps.find((s) => s.id === 'f')!;
    expect(f.formula).toBe('f = 0.316 ÷ Re^0.25');
    expect(f.work?.[0]).toBe('3400 ≥ 2300: turbulent');
    const R = w.steps.find((s) => s.id === 'R')!;
    expect(R.result).toBe('R = turbulent');
    // (said once: the regime's step doesn't repeat the line the friction factor's showed)
    expect(R.lines).not.toContain('3400 ≥ 2300: turbulent');
    const shown = w.steps.flatMap((s) => s.lines);
    for (const s of w.steps) {
      const rel = pipe.relations.find(
        (r) => r.id === res.trace.find((t) => t.id === s.id)!.relation,
      )!;
      expect(
        caseIssues(
          s,
          pipe.variables.find((v) => v.id === s.id)!,
          rel,
          res.values,
          shown,
        ),
      ).toEqual([]);
    }
    // the check repeats the test in the case the values are in
    expect(w.check.map((c) => c.formula)).toEqual(
      expect.arrayContaining(['3400 ≥ 2300, so turbulent']),
    );
    expect(w.check.every((c) => c.ok)).toBe(true);
  });

  it('show the near side of a limit with enough figures to read true', () => {
    const res = solve(pipe, [{ id: 'f', value: 64 / 2299.96 }]);
    const w = plainWalkthrough(buildSteps(pipe, res));
    const line = w.steps.flatMap((s) => s.lines).find((l) => l.endsWith(': laminar'))!;
    expect(line).toMatch(/^2299\.9\d* < 2300: laminar$/);
  });

  it('are caught when they name the wrong case or word', () => {
    const res = solve(pipe, [{ id: 'Re', value: 1000 }]);
    const issues = caseIssues(
      { id: 'R', lines: ['1000 ≥ 2300: turbulent'], result: 'R = turbulent' },
      pipe.variables[2]!,
      regime,
      res.values,
    );
    expect(issues).toEqual([
      'step for R doesn’t name its case (laminar)'.replace('’', "'"),
      'step names case turbulent, but the values are in laminar: "1000 ≥ 2300: turbulent"',
      'category answer "R = turbulent" is not R = laminar',
    ]);
  });
});

describe('steps of a root a rule keeps', () => {
  const ice = rootRule({
    id: 'K from x',
    out: 'x',
    ins: ['K'],
    display: '{K} = (2{x})² ÷ ((0.1 − {x})(0.1 − {x}))',
    letter: 'x',
    coefficients: (v) => [4 - v.K!, 0.2 * v.K!, -0.01 * v.K!],
    keep: (x) => x >= 0 && x <= 0.1,
    rule: 'x must leave every concentration at least 0',
  });
  const m = page({
    variables: [
      value('K', 'K', 'Equilibrium constant', 0.001, 1000),
      value('x', 'x', 'Change', 0, 0.1),
    ],
    relations: ice.relations,
    steps: ice.steps,
    example: { K: 50.5, x: 0.078 },
    startWith: ['K'],
  });

  it('writes a quadratic formula line the harness works out to the answer', () => {
    const res = solve(m, [{ id: 'K', value: 50.5 }]);
    const s = plainWalkthrough(buildSteps(m, res)).steps[0]!;
    const line = s.substituted ?? s.rearranged!;
    const x = evaluate(line.slice(line.indexOf(' = ') + 3));
    expect(shownClose(x!, res.values.x!)).toBe(true);
    expect(s.work?.at(-1)).toMatch(/^Rejected: 0\.1\d+, since x must leave every concentration/);
  });

  it('writes ordered roots as a rank the harness reads', () => {
    const σ = orderedRoots({
      id: 'principal',
      outs: ['s1', 's2', 's3'],
      ins: ['I1', 'I2', 'I3'],
      letter: 'σ',
      coefficients: (v) => [1, -v.I1!, v.I2!, -v.I3!],
      order: 'descending',
      display: (out) => `{${out}} = a root of σ³ − {I1}σ² + {I2}σ − {I3} = 0`,
    });
    const stress = page({
      variables: [
        value('I1', 'I₁', 'First invariant', -1000, 1000),
        value('I2', 'I₂', 'Second invariant', -1e6, 1e6),
        value('I3', 'I₃', 'Third invariant', -1e9, 1e9),
        value('s1', 'σ₁', 'Greatest principal stress', -1000, 1000),
        value('s2', 'σ₂', 'Middle principal stress', -1000, 1000),
        value('s3', 'σ₃', 'Least principal stress', -1000, 1000),
      ],
      relations: σ.relations,
      steps: σ.steps,
      example: { I1: 6, I2: 3, I3: -10, s1: 5, s2: 2, s3: -1 },
      startWith: ['I1', 'I2', 'I3'],
    });
    const res = solve(stress, [
      { id: 'I1', value: 6 },
      { id: 'I2', value: 3 },
      { id: 'I3', value: -10 },
    ]);
    const w = plainWalkthrough(buildSteps(stress, res));
    for (const s of w.steps) {
      const line = s.substituted ?? s.rearranged!;
      const x = evaluate(line.slice(line.indexOf(' = ') + 3));
      expect(shownClose(x!, res.values[s.id]!)).toBe(true);
    }
    expect(w.steps.map((s) => s.rearranged)).toEqual([
      'σ₁ = greatest of −1, 2, 5',
      'σ₂ = median of −1, 2, 5',
      'σ₃ = least of −1, 2, 5',
    ]);
  });
});

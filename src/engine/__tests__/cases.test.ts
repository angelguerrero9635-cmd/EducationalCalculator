import {
  branchOf,
  categoryVariable,
  classify,
  comparisonHolds,
  orderedRoots,
  piecewise,
  polynomialText,
  realRoots,
  rootRule,
} from '../cases';
import { solve, type System } from '../solve';
import type { Values, VariableDef } from '../types';

const close = (x: number | undefined, y: number, rel = 1e-6) =>
  expect(Math.abs(x! - y)).toBeLessThanOrEqual(rel * Math.max(1, Math.abs(y)));

const value = (id: string, min: number, max: number, extra: Partial<VariableDef> = {}) =>
  ({ id, symbol: id, name: `Value ${id}`, min, max, ...extra }) as VariableDef;

describe('realRoots', () => {
  it('solves lines, quadratics and repeated roots, least first', () => {
    expect(realRoots([2, -4])).toEqual([2]);
    const q = realRoots([1, -3, 2]);
    close(q[0], 1);
    close(q[1], 2);
    expect(realRoots([1, 0, 1])).toEqual([]);
    const d = realRoots([1, -4, 4]);
    expect(d).toHaveLength(2);
    close(d[0], 2);
    close(d[1], 2);
    // leading zeros lower the degree; a constant has none
    close(realRoots([0, 0, 3, -6])[0], 2);
    expect(realRoots([0, 5])).toEqual([]);
  });

  it('keeps all three real roots of a cubic, a double one twice', () => {
    // (σ − 5)(σ − 2)(σ + 1) = σ³ − 6σ² + 3σ + 10
    const r = realRoots([1, -6, 3, 10]);
    expect(r).toHaveLength(3);
    [-1, 2, 5].forEach((x, i) => close(r[i], x));
    // (σ − 3)²(σ + 2) = σ³ − 4σ² − 3σ + 18
    const d = realRoots([1, -4, -3, 18]);
    expect(d).toHaveLength(3);
    [-2, 3, 3].forEach((x, i) => close(d[i], x, 1e-6));
    // one real root: x³ + x + 2 = (x + 1)(x² − x + 2)
    const one = realRoots([1, 0, 1, 2]);
    expect(one).toHaveLength(1);
    close(one[0], -1);
    // a triple root
    const t = realRoots([1, -3, 3, -1]);
    expect(t).toHaveLength(3);
    t.forEach((x) => close(x, 1, 1e-5));
  });

  it('finds the real roots of a quartic', () => {
    // (x² − 1)(x² − 4)
    const r = realRoots([1, 0, -5, 0, 4]);
    [-2, -1, 1, 2].forEach((x, i) => close(r[i], x, 1e-8));
    // (x² + 1)(x − 3)(x + 0.5)
    const s = realRoots([1, -2.5, -0.5, -2.5, -1.5]);
    expect(s).toHaveLength(2);
    close(s[0], -0.5, 1e-8);
    close(s[1], 3, 1e-8);
  });

  it('writes a polynomial as a step does', () => {
    expect(polynomialText([1, -0.98, 0.23, -0.0076], 'Z')).toBe('Z³ − 0.98Z² + 0.23Z − 0.0076');
    expect(polynomialText([-2, 0, 1], 'x')).toBe('−2x² + 1');
  });
});

describe('comparisonHolds', () => {
  const ev = (t: string) => (/^-?[\d.]+$/.test(t) ? Number(t) : undefined);
  it('reads every comparison in the line, up to the case name', () => {
    expect(comparisonHolds('1500 < 2300: laminar', ev)).toBe(true);
    expect(comparisonHolds('3400 < 2300: laminar', ev)).toBe(false);
    expect(comparisonHolds('0 < 0.4 < 1: underdamped', ev)).toBe(true);
    expect(comparisonHolds('2300 ≥ 2300, so turbulent', ev)).toBe(true);
    expect(comparisonHolds('first order chosen: first order', ev)).toBeUndefined();
  });
});

// ─── HE-E12: a relation that switches at a limit ─────────────────────────────

/** Darcy friction factor: 64 ÷ Re below 2,300 (laminar), Blasius 0.316 Re^−0.25 above. */
const friction = (blasiusInverse = true) =>
  piecewise({
    id: 'f from Re',
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
        solve: {
          f: (v) => 0.316 / v.Re! ** 0.25,
          ...(blasiusInverse ? { Re: (v: Values) => (0.316 / v.f!) ** 4 } : {}),
        },
        display: '{f} = 0.316 ÷ {Re}^0.25',
      },
    ],
  });

const pipe = (blasiusInverse = true): System => ({
  variables: [value('Re', 100, 100000), value('f', 0.001, 1)],
  relations: [friction(blasiusInverse)],
});

describe('piecewise relations (HE-E12)', () => {
  it('works forward in the case the values are in, and says which', () => {
    const lam = solve(pipe(), [{ id: 'Re', value: 1600 }]);
    close(lam.values.f, 0.04);
    expect(lam.trace).toEqual([{ id: 'f', relation: 'f from Re', exact: true, branch: 'laminar' }]);
    const turb = solve(pipe(), [{ id: 'Re', value: 10000 }]);
    close(turb.values.f, 0.0316);
    expect(turb.trace[0]!.branch).toBe('turbulent');
  });

  it('inverts each case and keeps a value only where its case applies', () => {
    // 0.05: laminar Re = 1,280 holds; turbulent Re = 1,596 would be laminar, so it is left out
    const one = solve(pipe(), [{ id: 'f', value: 0.05 }]);
    close(one.values.Re, 1280);
    expect(one.trace[0]!.branch).toBe('laminar');
    // 0.03: both cases give an Re in range: the one nearer the previous value is kept
    const near = solve(pipe(), [{ id: 'f', value: 0.03 }], { Re: 12000 });
    close(near.values.Re, (0.316 / 0.03) ** 4);
    expect(near.trace[0]!.branch).toBe('turbulent');
    const low = solve(pipe(), [{ id: 'f', value: 0.03 }], { Re: 2000 });
    close(low.values.Re, 64 / 0.03);
  });

  it('finds a case with no rearrangement numerically, inside that case only', () => {
    const r = solve(pipe(false), [{ id: 'f', value: 0.0316 }]);
    // (laminar would need Re = 2,025 < 2,300: it fits too; previous picks)
    expect(r.values.Re).toBeDefined();
    const t = solve(pipe(false), [{ id: 'f', value: 0.02 }]);
    close(t.values.Re, (0.316 / 0.02) ** 4, 1e-6);
    expect(t.trace[0]).toMatchObject({ branch: 'turbulent', exact: false });
  });

  it('refuses a value no case fits, and works an older one out again in the case that does', () => {
    // f = 0.01: laminar Re = 6,400 is not laminar, turbulent Re = 997,000 is past the range
    const no = solve(pipe(), [
      { id: 'Re', value: 1000 },
      { id: 'f', value: 0.01 },
    ]);
    expect(no.rejected?.id).toBe('f');
    close(no.values.f, 0.064);
    // f = 0.025 fits turbulent flow: Re is worked out again from it
    const yes = solve(pipe(), [
      { id: 'Re', value: 1000 },
      { id: 'f', value: 0.025 },
    ]);
    expect(yes.values.f).toBe(0.025);
    close(yes.values.Re, (0.316 / 0.025) ** 4);
  });
});

// ─── HE-E12: a relation chosen by a choice box ───────────────────────────────

const ORDERS = ['zero order', 'first order', 'second order'];
const kinetics: System = {
  variables: [
    categoryVariable('n', 'n', 'Reaction order', ORDERS, { pick: true }),
    value('A0', 0.001, 10),
    value('A', 0.0001, 10),
    value('k', 0.0001, 100),
    value('t', 0, 10000),
  ],
  relations: [
    piecewise({
      id: 'integrated rate law',
      display: 'the integrated rate law of order {n}',
      vars: ['A', 'A0', 'k', 't', 'n'],
      branches: [
        {
          name: 'zero order',
          when: '{n} chosen',
          applies: (v) => v.n === 1,
          residual: (v) => v.A! - (v.A0! - v.k! * v.t!),
          solve: { A: (v) => v.A0! - v.k! * v.t!, k: (v) => (v.A0! - v.A!) / v.t! },
          display: '{A} = {A0} − {k}{t}',
        },
        {
          name: 'first order',
          when: '{n} chosen',
          applies: (v) => v.n === 2,
          residual: (v) => Math.log(v.A!) - (Math.log(v.A0!) - v.k! * v.t!),
          solve: {
            A: (v) => v.A0! * Math.exp(-v.k! * v.t!),
            k: (v) => Math.log(v.A0! / v.A!) / v.t!,
          },
          display: 'ln {A} = ln {A0} − {k}{t}',
        },
        {
          name: 'second order',
          when: '{n} chosen',
          applies: (v) => v.n === 3,
          residual: (v) => 1 / v.A! - (1 / v.A0! + v.k! * v.t!),
          solve: {
            A: (v) => 1 / (1 / v.A0! + v.k! * v.t!),
            k: (v) => (1 / v.A! - 1 / v.A0!) / v.t!,
          },
          display: '1 ÷ {A} = 1 ÷ {A0} + {k}{t}',
        },
      ],
    }),
  ],
};

describe('choice-switched relations (HE-E12)', () => {
  const base = [
    { id: 'A0', value: 1 },
    { id: 'k', value: 0.01 },
    { id: 't', value: 50 },
  ];
  it('uses the formula the choice picks', () => {
    close(solve(kinetics, [{ id: 'n', value: 1 }, ...base]).values.A, 0.5);
    close(solve(kinetics, [{ id: 'n', value: 2 }, ...base]).values.A, Math.exp(-0.5));
    const second = solve(kinetics, [{ id: 'n', value: 3 }, ...base]);
    close(second.values.A, 1 / 1.5);
    expect(second.trace[0]!.branch).toBe('second order');
  });

  it('works a case backward, and finds the order the numbers fit', () => {
    const k = solve(kinetics, [
      { id: 'n', value: 2 },
      { id: 'A0', value: 1 },
      { id: 'A', value: 0.25 },
      { id: 't', value: 100 },
    ]);
    close(k.values.k, Math.log(4) / 100);
    const n = solve(kinetics, [...base, { id: 'A', value: 1 / 1.5 }]);
    expect(n.values.n).toBe(3);
  });
});

// ─── HE-E11: a category answer ───────────────────────────────────────────────

const REGIMES = ['underdamped', 'critically damped', 'overdamped'];
const damping: System = {
  variables: [value('z', 0, 10, { step: 0.01 }), categoryVariable('R', 'R', 'Regime', REGIMES)],
  relations: [
    classify({
      id: 'regime from ζ',
      out: 'R',
      ins: ['z'],
      display: '{R} = underdamped if {z} < 1, critically damped if {z} = 1, else overdamped',
      bands: [
        { name: 'underdamped', when: '{z} < 1', applies: (v) => v.z! < 1 - 1e-9 },
        { name: 'critically damped', when: '{z} = 1', applies: (v) => Math.abs(v.z! - 1) <= 1e-9 },
        { name: 'overdamped', when: '{z} > 1', applies: (v) => v.z! > 1 },
      ],
    }),
  ],
};

describe('category answers (HE-E11)', () => {
  it('codes the band the inputs pass, one way', () => {
    expect(solve(damping, [{ id: 'z', value: 0.4 }]).values.R).toBe(1);
    expect(solve(damping, [{ id: 'z', value: 1 }]).values.R).toBe(2);
    const over = solve(damping, [{ id: 'z', value: 2.5 }]);
    expect(over.values.R).toBe(3);
    expect(over.trace[0]).toEqual({
      id: 'R',
      relation: 'regime from ζ',
      exact: true,
      branch: 'overdamped',
    });
    // the thresholds are never worked backward
    expect(solve(damping, [{ id: 'R', value: 1 }]).values.z).toBeUndefined();
    expect(damping.variables[1]!.labels).toEqual({
      1: 'underdamped',
      2: 'critically damped',
      3: 'overdamped',
    });
  });

  it('names the band through branchOf', () => {
    expect(branchOf(damping.relations[0]!, { z: 0.2, R: 1 })?.name).toBe('underdamped');
    expect(branchOf(damping.relations[0]!, { R: 1 })).toBeUndefined();
  });
});

// ─── HE-E15: the root a page keeps, and roots in order ───────────────────────

/** H₂ + I₂ ⇌ 2HI from 0.100 M each: K = (2x)² ÷ (0.1 − x)², so (4 − K)x² + 0.2Kx − 0.01K = 0. */
const ice = rootRule({
  id: 'K = (2x)² ÷ ((0.1 − x)(0.1 − x))',
  out: 'x',
  ins: ['K'],
  display: '{K} = (2{x})² ÷ ((0.1 − {x})(0.1 − {x}))',
  letter: 'x',
  coefficients: (v) => [4 - v.K!, 0.2 * v.K!, -0.01 * v.K!],
  keep: (x) => x >= 0 && x <= 0.1,
  rule: 'x must leave every concentration at least 0',
});
const iceSystem: System = {
  variables: [value('K', 0.001, 1000), value('x', 0, 0.1)],
  relations: ice.relations,
};

describe('roots a rule keeps (HE-E15)', () => {
  it('keeps the physical root of the quadratic, and works K back from it', () => {
    const r = solve(iceSystem, [{ id: 'K', value: 50.5 }]);
    const s = Math.sqrt(50.5);
    close(r.values.x, (0.1 * s) / (2 + s));
    const k = solve(iceSystem, [{ id: 'x', value: 0.078 }]);
    close(k.values.K, (0.156 / 0.022) ** 2, 1e-5);
  });

  it('writes the quadratic formula with the sign kept and the root rejected', () => {
    const text = ice.steps[ice.relations[0]!.id]!.x!;
    const v = { K: 50.5, x: solve(iceSystem, [{ id: 'K', value: 50.5 }]).values.x! };
    const expr = (text.expr as (v: Values) => string)(v);
    expect(expr).toMatch(
      /^\(−10\.1 [+−] √\(10\.1² − 4 × \(−46\.5\) × \(−0\.505\)\)\) ÷ \(2 × \(−46\.5\)\)$/,
    );
    const work = (text.work as (v: Values) => string[])(v);
    expect(work[work.length - 1]).toMatch(/^Rejected: 0\.1\d+, since x must leave/);
  });

  it('fills roots in order, greatest first, a double root twice', () => {
    const σ = orderedRoots({
      id: 'principal stresses',
      outs: ['s1', 's2', 's3'],
      ins: ['I1', 'I2', 'I3'],
      letter: 'σ',
      coefficients: (v) => [1, -v.I1!, v.I2!, -v.I3!],
      order: 'descending',
      display: (out, rank) => `{${out}} = root ${rank} of σ³ − {I1}σ² + {I2}σ − {I3} = 0`,
    });
    const sys: System = {
      variables: [
        value('I1', -1000, 1000),
        value('I2', -1e6, 1e6),
        value('I3', -1e9, 1e9),
        value('s1', -1000, 1000),
        value('s2', -1000, 1000),
        value('s3', -1000, 1000),
      ],
      relations: σ.relations,
    };
    const r = solve(sys, [
      { id: 'I1', value: 6 },
      { id: 'I2', value: 3 },
      { id: 'I3', value: -10 },
    ]);
    close(r.values.s1, 5);
    close(r.values.s2, 2);
    close(r.values.s3, -1);
    const mid = σ.steps['principal stresses (s2)']!.s2!;
    expect((mid.expr as (v: Values) => string)({ I1: 6, I2: 3, I3: -10, s2: r.values.s2! })).toBe(
      'median of −1, 2, 5',
    );
    const d = solve(sys, [
      { id: 'I1', value: 4 },
      { id: 'I2', value: -3 },
      { id: 'I3', value: -18 },
    ]);
    close(d.values.s1, 3, 1e-6);
    close(d.values.s2, 3, 1e-6);
    close(d.values.s3, -2, 1e-6);
  });

  it('keeps to the branch the student picks (subsonic or supersonic)', () => {
    const g = 1.4;
    const ratio = (M: number) =>
      (1 / M) * ((2 / (g + 1)) * (1 + ((g - 1) / 2) * M * M)) ** ((g + 1) / (2 * (g - 1)));
    const sys: System = {
      variables: [
        categoryVariable('b', 'b', 'Branch', ['subsonic', 'supersonic'], { pick: true }),
        value('M', 0.01, 10),
        value('r', 1, 1000),
      ],
      relations: [
        piecewise({
          id: 'A/A* from M',
          display: '{r} = A/A* at {M}',
          vars: ['r', 'M', 'b'],
          branches: [
            {
              name: 'subsonic',
              when: '{M} < 1',
              applies: (v) => v.b === 1 && v.M! < 1,
              residual: (v) => v.r! - ratio(v.M!),
            },
            {
              name: 'supersonic',
              when: '{M} > 1',
              applies: (v) => v.b === 2 && v.M! > 1,
              residual: (v) => v.r! - ratio(v.M!),
            },
          ],
        }),
      ],
    };
    const sup = solve(sys, [
      { id: 'b', value: 2 },
      { id: 'r', value: 1.6875 },
    ]);
    close(sup.values.M, 2, 1e-4);
    const sub = solve(sys, [
      { id: 'b', value: 1 },
      { id: 'r', value: 1.6875 },
    ]);
    close(sub.values.M, 0.3722, 1e-3);
    expect(sub.trace[0]!.branch).toBe('subsonic');
    // the branch read back from M
    expect(
      solve(sys, [
        { id: 'M', value: 3 },
        { id: 'r', value: ratio(3) },
      ]).values.b,
    ).toBe(2);
  });
});

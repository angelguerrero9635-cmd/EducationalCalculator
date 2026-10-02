import {
  asFraction,
  formatNumber,
  parseCents,
  parseNumber,
  renderTemplate,
  unitFor,
} from '../format';
import { findRoots, holds, solve, type System } from '../solve';
import { initialState, setInput, setValues } from '../state';
import type { Relation, Values } from '../types';

const area: System = {
  variables: [
    { id: 'l', symbol: 'l', name: 'Length', min: 0, max: 100 },
    { id: 'w', symbol: 'w', name: 'Width', min: 0, max: 100 },
    { id: 'A', symbol: 'A', name: 'Area', min: 0, max: 10000 },
  ],
  relations: [
    {
      id: 'A = l × w',
      display: '{A} = {l} × {w}',
      vars: ['A', 'l', 'w'],
      residual: (v) => v.A! - v.l! * v.w!,
      solve: {
        A: (v) => v.l! * v.w!,
        l: (v) => (v.w === 0 ? undefined : v.A! / v.w!),
        w: (v) => (v.l === 0 ? undefined : v.A! / v.l!),
      },
    },
  ],
};

describe('solve', () => {
  it('fills in the rest once enough values are given', () => {
    const one = solve(area, [{ id: 'l', value: 4 }]);
    expect(one.values).toEqual({ l: 4 });
    expect(one.unknown).toEqual(['w', 'A']);

    const two = solve(area, [
      { id: 'l', value: 4 },
      { id: 'w', value: 3 },
    ]);
    expect(two.values).toEqual({ l: 4, w: 3, A: 12 });
    expect(two.derived).toEqual(['A']);
    expect(two.unknown).toEqual([]);
  });

  it('keeps an input that fits when the values are in large units (miles in centimeters)', () => {
    // A = x × y − u × z with every length a whole number of miles (160,934.4 cm each): typing
    // A = 89 mi² after u = 1 mi must keep u (10 × 9 − 1 × 1 = 89), not clear it.
    const mi = 160934.4;
    const len = (id: string, lo: number, hi: number) => ({
      id,
      name: id,
      symbol: id,
      integer: true,
      unitFactor: mi,
      min: lo * mi,
      max: hi * mi,
    });
    const cutOut: System = {
      variables: [
        len('x', 2, 10),
        len('y', 2, 10),
        len('u', 1, 9),
        len('z', 1, 9),
        len('p', 1, 9),
        len('q', 1, 9),
        {
          id: 'A',
          name: 'A',
          symbol: 'A',
          integer: true,
          unitFactor: mi * mi,
          min: mi * mi,
          max: 99 * mi * mi,
        },
      ],
      relations: [
        {
          id: 'x = u + p',
          display: '',
          vars: ['x', 'u', 'p'],
          residual: (v) => v.x! - v.u! - v.p!,
        },
        {
          id: 'y = z + q',
          display: '',
          vars: ['y', 'z', 'q'],
          residual: (v) => v.y! - v.z! - v.q!,
        },
        {
          id: 'A = x × y − u × z',
          display: '',
          vars: ['A', 'x', 'y', 'u', 'z'],
          residual: (v) => v.A! - (v.x! * v.y! - v.u! * v.z!),
        },
      ],
    };
    const r = solve(cutOut, [
      { id: 'u', value: mi },
      { id: 'A', value: 89 * mi * mi },
    ]);
    expect(r.dropped).toEqual([]);
    expect(r.rejected).toBeUndefined();
  });

  it('solves for any variable, not just the "output"', () => {
    const r = solve(area, [
      { id: 'A', value: 12 },
      { id: 'l', value: 4 },
    ]);
    expect(r.values.w).toBe(3);
  });

  it('lets the newest input win: older givens that conflict become calculated', () => {
    const r = solve(area, [
      { id: 'l', value: 4 },
      { id: 'w', value: 3 },
      { id: 'A', value: 20 },
    ]);
    // Oldest given (l) is dropped; A and w stay, so l is recalculated.
    expect(r.given.map((g) => g.id)).toEqual(['w', 'A']);
    expect(r.dropped).toEqual(['l']);
    expect(r.cleared).toEqual([]); // l is recalculated, not lost
    expect(r.values.l).toBeCloseTo(20 / 3);
    expect(r.rejected).toBeUndefined();
  });

  it('rejects the newest input when it is out of range', () => {
    const r = solve(area, [
      { id: 'l', value: 4 },
      { id: 'w', value: -1 },
    ]);
    expect(r.rejected).toEqual({ id: 'w', reason: 'Must be at least 0' });
    expect(r.values).toEqual({ l: 4 });
  });

  it('keeps the newest input when an older one makes another variable impossible', () => {
    const tri: System = {
      variables: ['a', 'b', 'c'].map((id) => ({ id, symbol: id, name: `Side ${id}`, min: 0 })),
      relations: [
        {
          id: 'a² + b² = c²',
          display: '',
          vars: ['a', 'b', 'c'],
          residual: (v) => v.a! ** 2 + v.b! ** 2 - v.c! ** 2,
          solve: { a: (v) => Math.sqrt(v.c! ** 2 - v.b! ** 2) },
        },
      ],
    };
    const r = solve(tri, [
      { id: 'b', value: 5 },
      { id: 'c', value: 3 },
    ]);
    // c = 3 with b = 5 would need a² = −16, so the older input (b) is cleared.
    expect(r.rejected).toBeUndefined();
    expect(r.dropped).toEqual(['b']);
    expect(r.cleared).toEqual(['b']);
    expect(r.values).toEqual({ c: 3 });
  });

  it('rejects a newest input that is impossible on its own', () => {
    const sq: System = {
      variables: [
        { id: 'x', symbol: 'x', name: 'Side', min: 0 },
        { id: 'A', symbol: 'A', name: 'Area' },
      ],
      relations: [
        {
          id: 'A = x²',
          display: '',
          vars: ['A', 'x'],
          residual: (v) => v.A! - v.x! ** 2,
          solve: { x: (v) => Math.sqrt(v.A!) },
        },
      ],
    };
    expect(solve(sq, [{ id: 'A', value: -4 }]).rejected).toEqual({
      id: 'A',
      reason: 'That would leave no possible value for the side.',
    });
  });

  it('enforces whole numbers', () => {
    const counts: System = {
      variables: ['a', 'b', 'c'].map((id) => ({ id, symbol: id, name: id, integer: true })),
      relations: [
        {
          id: 'a + b = c',
          display: '',
          vars: ['a', 'b', 'c'],
          residual: (v) => v.a! + v.b! - v.c!,
          solve: { c: (v) => v.a! + v.b! },
        },
      ],
    };
    expect(solve(counts, [{ id: 'a', value: 2.5 }]).rejected?.reason).toBe(
      'Must be a whole number',
    );
  });

  it('chains through several relations', () => {
    const chain: System = {
      variables: ['r', 'd', 'C'].map((id) => ({ id, symbol: id, name: id, min: 0, max: 1000 })),
      relations: [
        {
          id: 'd = 2r',
          display: '',
          vars: ['d', 'r'],
          residual: (v) => v.d! - 2 * v.r!,
          solve: { r: (v) => v.d! / 2, d: (v) => 2 * v.r! },
        },
        {
          id: 'C = πd',
          display: '',
          vars: ['C', 'd'],
          residual: (v) => v.C! - Math.PI * v.d!,
          solve: { d: (v) => v.C! / Math.PI, C: (v) => Math.PI * v.d! },
        },
      ],
    };
    const r = solve(chain, [{ id: 'C', value: 10 * Math.PI }]);
    expect(r.values.d).toBeCloseTo(10);
    expect(r.values.r).toBeCloseTo(5);
    // The trace records the solving order and which relation each value came from.
    expect(r.trace).toEqual([
      { id: 'd', relation: 'C = πd', exact: true },
      { id: 'r', relation: 'd = 2r', exact: true },
    ]);
  });

  it('solves numerically when no rearrangement is given, picking the root nearest the previous value', () => {
    const square: System = {
      variables: [
        { id: 'x', symbol: 'x', name: 'x', min: -10, max: 10 },
        { id: 'y', symbol: 'y', name: 'y', min: 0, max: 100 },
      ],
      relations: [
        { id: 'y = x²', display: '', vars: ['x', 'y'], residual: (v) => v.y! - v.x! ** 2 },
      ],
    };
    expect(solve(square, [{ id: 'y', value: 9 }], { x: -2 }).values.x).toBeCloseTo(-3, 6);
    expect(solve(square, [{ id: 'y', value: 9 }], { x: 2 }).values.x).toBeCloseTo(3, 6);
  });

  it('checks consistency precisely in formulas that mix large and small values', () => {
    const rate = {
      id: 'CBR = B ÷ P × 1000',
      display: '',
      vars: ['CBR', 'B', 'P'],
      residual: (v: Record<string, number>) => v.CBR! - (1000 * v.B!) / v.P!,
      solve: {
        CBR: (v: Record<string, number>) => (1000 * v.B!) / v.P!,
        B: (v: Record<string, number>) => (v.CBR! * v.P!) / 1000,
      },
    };
    expect(holds(rate, { CBR: 12, B: 6000, P: 500000 })).toBe(true);
    // 12.3 per 1,000 is off by 150 births out of 6,000: must not pass as consistent.
    expect(holds(rate, { CBR: 12.3, B: 6000, P: 500000 })).toBe(false);
  });

  it('tiny values are compared relative to their size, not to a floor of 10⁻⁶', () => {
    // A lap of 2π × 0.157 m at 3 × 10⁶ m/s takes 3.28 × 10⁻⁷ s, not 1 × 10⁻⁹ s.
    const lap: Relation = {
      id: 'T = 2πr/v',
      display: '',
      vars: ['T', 'r', 'v'],
      residual: (x) => x.T! * x.v! - 2 * Math.PI * x.r!,
      solve: { T: (x) => (2 * Math.PI * x.r!) / x.v! },
    };
    const variables = [
      { id: 'T', symbol: 'T', name: 'Time', min: 0, max: 1, step: 1e-15, scientific: true },
      { id: 'r', symbol: 'r', name: 'Radius', min: 0, max: 1e6, step: 1e-15, scientific: true },
      { id: 'v', symbol: 'v', name: 'Speed', min: 1, max: 3e7, step: 1, scientific: true },
    ];
    const T = (2 * Math.PI * 0.157) / 3e6;
    expect(holds(lap, { T, r: 0.157, v: 3e6 }, variables)).toBe(true);
    expect(holds(lap, { T: T * (1 + 1e-9), r: 0.157, v: 3e6 }, variables)).toBe(true);
    expect(holds(lap, { T: 1e-9, r: 0.157, v: 3e6 }, variables)).toBe(false);
    const sys: System = { variables, relations: [lap] };
    // The older T = 1 × 10⁻⁹ no longer counts as the T that r and v work out.
    const typed = solve(sys, [
      { id: 'T', value: 1e-9 },
      { id: 'r', value: 0.157 },
      { id: 'v', value: 3e6 },
    ]);
    expect(typed.dropped).toContain('T');
    expect(typed.values.T).toBeCloseTo(T, 15);
  });

  it('findRoots brackets every sign change', () => {
    const roots = findRoots((x) => (x - 1) * (x + 2), -5, 5);
    expect(roots.map((r) => Number(r.toFixed(6)))).toEqual([-2, 1]);
  });
});

describe('a rule that explains why it has no answer', () => {
  // a × x + b = c × x + d: no x when a = c and b ≠ d; every x when a = c and b = d.
  const sides: System = {
    variables: ['a', 'b', 'c', 'd', 'x'].map((id) => ({
      id,
      symbol: id,
      name: id,
      min: -50,
      max: 50,
    })),
    relations: [
      {
        id: 'ax + b = cx + d',
        display: '{a}{x} + {b} = {c}{x} + {d}',
        vars: ['x', 'a', 'b', 'c', 'd'],
        residual: (v) => v.a! * v.x! + v.b! - (v.c! * v.x! + v.d!),
        solve: { x: (v) => (v.a === v.c ? undefined : (v.d! - v.b!) / (v.a! - v.c!)) },
        message: (v) =>
          v.a !== v.c
            ? undefined
            : v.b === v.d
              ? 'Both sides are the same: every x works.'
              : 'The same x on both sides but different numbers: no x works.',
      },
    ],
  };
  it('shows the sentence instead of a generic conflict', () => {
    const r = solve(sides, [
      { id: 'a', value: 2 },
      { id: 'b', value: 1 },
      { id: 'c', value: 2 },
      { id: 'd', value: 5 },
    ]);
    expect(r.rejected?.reason).toBe('The same x on both sides but different numbers: no x works.');
    const ok = solve(sides, [
      { id: 'a', value: 3 },
      { id: 'b', value: 1 },
      { id: 'c', value: 1 },
      { id: 'd', value: 5 },
    ]);
    expect(ok.values.x).toBe(2);
  });
});

describe('typed values rounded to their step', () => {
  // λ = λ₀ × (1 + z) and v = 300,000 × z, λ₀ from a list (as on the Doppler page).
  const doppler: System = {
    variables: [
      { id: 'r', symbol: 'λ₀', name: 'Lab wavelength', allowed: [410.2, 656.3], min: 410.2 },
      { id: 'l', symbol: 'λ', name: 'Observed wavelength', min: 400, max: 665, step: 0.01 },
      { id: 'z', symbol: 'z', name: 'Shift', min: -0.012, max: 0.012, step: 0.000001 },
      { id: 'v', symbol: 'v', name: 'Speed', min: -3600, max: 3600, step: 0.1 },
    ],
    relations: [
      {
        id: 'z = (λ − λ₀) ÷ λ₀',
        display: '',
        vars: ['z', 'l', 'r'],
        residual: (v) => v.z! * v.r! - (v.l! - v.r!),
        solve: { z: (v) => (v.l! - v.r!) / v.r!, l: (v) => v.r! * (1 + v.z!) },
      },
      {
        id: 'v = c × z',
        display: '',
        vars: ['v', 'z'],
        residual: (v) => v.v! - 300000 * v.z!,
        solve: { v: (v) => 300000 * v.z!, z: (v) => v.v! / 300000 },
      },
    ],
  };

  it('finds a listed value worked out a hair off the list (656.2999999 for 656.3)', () => {
    // 656.3 × 1.012 ÷ 1.012 is 656.2999999999999 in floats; the search must still find 656.3.
    const r = solve(doppler, [
      { id: 'r', value: 656.3 },
      { id: 'l', value: 656.3 * 1.012 },
      { id: 'v', value: 3600 },
    ]);
    expect(r.cleared).toEqual([]);
    expect(r.rejected).toBeUndefined();
  });

  it('accepts shown values whose rounding runs through a listed value', () => {
    // λ₀ = 656.3 and z = 0.0112345 give λ = 663.6732 (shown 663.67): λ typed as shown, after
    // z, would make λ₀ 656.2968, off the list, so λ is worked out instead of refusing or
    // clearing.
    const r = solve(doppler, [
      { id: 'r', value: 656.3 },
      { id: 'z', value: 0.0112345 },
      { id: 'l', value: 663.67 },
    ]);
    expect(r.rejected).toBeUndefined();
    expect(r.cleared).toEqual([]);
    expect(r.given.map((g) => g.id)).toEqual(['r', 'z']);
    expect(r.values.l).toBeCloseTo(663.6732, 4);
  });

  it('still treats a miss past the rounding as a conflict', () => {
    const r = solve(doppler, [
      { id: 'r', value: 656.3 },
      { id: 'z', value: 0.0112345 },
      { id: 'l', value: 663.8 },
    ]);
    // Nothing says why, so the older z is cleared as before.
    expect(r.cleared).toEqual(['z']);
    expect(r.given.map((g) => g.id)).toEqual(['r', 'l']);
  });
});

describe('values the search fills in (E21)', () => {
  const whole = (id: string, min: number, max: number) => ({
    id,
    symbol: id,
    name: id,
    integer: true,
    min,
    max,
  });

  it('leaves a value pinned only through an unknown for the student', () => {
    // E = 13.6(1/l² − 1/u²) and λ = 1240/E. With u = 2 and l unknown, l = ±1 both give
    // E = 10.2, but E's only formula needs l: "E from λ, λ from E" would be a circle.
    const ladder: System = {
      variables: [
        whole('u', 2, 8),
        whole('l', 1, 7),
        { id: 'E', symbol: 'E', name: 'Energy', min: 0.01, max: 13.6, step: 0.0001 },
        { id: 'w', symbol: 'λ', name: 'Wavelength', min: 50, max: 20000, step: 0.1 },
      ],
      relations: [
        {
          id: 'u > l',
          display: '',
          vars: ['u', 'l'],
          constraint: true,
          residual: (v) => (v.u! > v.l! ? 0 : 1),
          solve: {},
        },
        {
          id: 'E = 13.6(1/l² − 1/u²)',
          display: '',
          vars: ['E', 'l', 'u'],
          residual: (v) => v.E! - 13.6 * (1 / v.l! ** 2 - 1 / v.u! ** 2),
          solve: { E: (v) => 13.6 * (1 / v.l! ** 2 - 1 / v.u! ** 2) },
        },
        {
          id: 'λ = 1240/E',
          display: '',
          vars: ['w', 'E'],
          residual: (v) => v.w! * v.E! - 1240,
          solve: { w: (v) => 1240 / v.E!, E: (v) => 1240 / v.w! },
        },
      ],
    };
    const r = solve(ladder, [{ id: 'u', value: 2 }]);
    expect(r.values).toEqual({ u: 2 });
    expect(r.trace).toEqual([]);
  });

  it('still fills two values their own formulas fix together (c + s = 20, c = s)', () => {
    const pair: System = {
      variables: [whole('c', 0, 20), whole('s', 0, 20), whole('t', 0, 40)],
      relations: [
        {
          id: 'c + s = t',
          display: '',
          vars: ['c', 's', 't'],
          residual: (v) => v.c! + v.s! - v.t!,
          solve: { t: (v) => v.c! + v.s!, c: (v) => v.t! - v.s!, s: (v) => v.t! - v.c! },
        },
        {
          id: 'c = s',
          display: '',
          vars: ['c', 's'],
          residual: (v) => v.c! - v.s!,
          solve: { c: (v) => v.s!, s: (v) => v.c! },
        },
      ],
    };
    const r = solve(pair, [{ id: 't', value: 20 }]);
    expect(r.values).toEqual({ t: 20, c: 10, s: 10 });
  });
});

describe('a newer value that doesn’t fit the older ones', () => {
  // ρ = m ÷ V with V = s³: a density the range (and a rule) can say no to.
  const block = (message?: Relation['message']): System => ({
    variables: [
      { id: 's', symbol: 's', name: 'Side', min: 0, max: 100, unit: 'cm' },
      { id: 'V', symbol: 'V', name: 'Volume', min: 0, max: 1e6, unit: 'cm³' },
      { id: 'm', symbol: 'm', name: 'Mass', min: 0, max: 1e6, unit: 'g' },
      { id: 'rho', symbol: 'ρ', name: 'Density', min: 0.001, max: 100, unit: 'g/cm³' },
    ],
    relations: [
      {
        id: 'V = s³',
        display: '',
        vars: ['V', 's'],
        residual: (v) => v.V! - v.s! ** 3,
        solve: { V: (v) => v.s! ** 3, s: (v) => Math.cbrt(v.V!) },
      },
      {
        id: 'ρ = m ÷ V',
        display: '',
        vars: ['rho', 'm', 'V'],
        residual: (v) => v.rho! * v.V! - v.m!,
        solve: { rho: (v) => (v.V ? v.m! / v.V : undefined), m: (v) => v.rho! * v.V! },
      },
      ...(message
        ? [
            {
              id: 'ρ ≤ 23',
              display: '',
              vars: ['rho'],
              constraint: true,
              residual: (v: Values) => (v.rho! <= 23 ? 0 : 1),
              message,
            },
          ]
        : []),
    ],
  });
  const older = [
    { id: 's', value: 2 },
    { id: 'm', value: 40 },
  ];

  it('refuses the newest with the range it breaks, and keeps the older values', () => {
    // m = 40 g in a 0.1 cm cube is 40,000 g/cm³: the side is refused, the mass stays.
    const s = setInput(block(), initialState(block(), older), { s: 0.1 });
    expect(s.errors).toEqual({
      s: 'That would make the density 40,000 g/cm³, but it can be at most 100 g/cm³.',
    });
    expect(s.result.given).toEqual(older);
    expect(s.result.cleared).toEqual([]);
    // 0.5 cm gives 320 g/cm³; doubling the side fits and halving it doesn't: the hint says so.
    const half = setInput(block(), initialState(block(), older), { s: 0.5 });
    expect(half.errors.s).toBe(
      'That would make the density 320 g/cm³, but it can be at most 100 g/cm³. Try a larger number for the side.',
    );
  });

  it('refuses it with a rule’s sentence when one speaks for those numbers', () => {
    const sys = block((v) => (v.rho! > 23 ? 'Nothing is that dense.' : undefined));
    const s = setValues(sys, initialState(sys, older), { s: 0.5 });
    // 40 g in 0.125 cm³ is 320 g/cm³: past the range too, but the rule says why.
    expect(s.errors).toEqual({ s: 'Nothing is that dense.' });
    expect(s.result.rejected).toMatchObject({ id: 's', older: true });
    expect(s.result.values.m).toBe(40);
  });

  it('still works out an older value again when the newer ones fix it', () => {
    // A side typed after the volume: the volume is worked out again, not refused (a conflict
    // nothing explains still clears the older value: see "calculator state").
    const s = setValues(block(), initialState(block(), [{ id: 'V', value: 8 }]), { s: 3 });
    expect(s.result.values.V).toBe(27);
    expect(s.result.rejected).toBeUndefined();
  });
});

describe('refusals a student reads', () => {
  const whole = (id: string, name: string, min: number, max: number) => ({
    id,
    symbol: id,
    name,
    min,
    max,
    step: 1,
    integer: true,
  });
  // a − b = c (the K–5 subtraction page), c found only when b ≤ a.
  const subtract = (id: string): System => ({
    id,
    variables: [
      whole('a', 'Start', 0, 1000),
      whole('b', 'Take away', 0, 1000),
      whole('c', 'Left', 0, 1000),
    ],
    relations: [
      {
        id: 'a − b = c',
        display: '',
        vars: ['a', 'b', 'c'],
        residual: (v) => v.a! - v.b! - v.c!,
        solve: {
          c: (v) => (v.b! > v.a! ? undefined : v.a! - v.b!),
          a: (v) => v.b! + v.c!,
          b: (v) => v.a! - v.c!,
        },
      },
    ],
  });

  it('builds the out-of-reach sentence from the range, and names no negative before Grade 6', () => {
    const typed = [
      { id: 'a', value: 0 },
      { id: 'b', value: 178 },
    ];
    expect(solve(subtract('m.2.x'), typed).rejected?.reason).toBe(
      'That would make “Left” less than 0.',
    );
    expect(solve(subtract('m.7.x'), typed).rejected?.reason).toBe(
      'That would make “Left” −178, but it must be at least 0.',
    );
  });

  it('says a K–5 value isn’t whole without naming it, and bounds products', () => {
    const groups = (id: string): System => ({
      id,
      variables: [
        whole('k', 'Groups', 1, 10),
        { ...whole('s', 'In each group', 1, 10), inSentence: 'the number in each group' },
        whole('n', 'Total', 1, 100),
      ],
      relations: [
        {
          id: 'n = k × s',
          display: '',
          vars: ['n', 'k', 's'],
          residual: (v) => v.n! - v.k! * v.s!,
          solve: { n: (v) => v.k! * v.s!, k: (v) => v.n! / v.s!, s: (v) => v.n! / v.k! },
        },
      ],
    });
    const r = solve(groups('m.3.x'), [
      { id: 's', value: 6 },
      { id: 'n', value: 1 },
    ]);
    expect(r.rejected?.reason).toBe('That wouldn’t make the groups a whole number.');
    expect(
      solve(groups('m.7.x'), [
        { id: 's', value: 6 },
        { id: 'n', value: 1 },
      ]).rejected?.reason,
    ).toBe('That would make the groups 0.1667, but it must be a whole number.');
    // A total of 150 is past 10 × 10, whatever the groups and their size.
    const far = solve(groups('m.3.x'), [{ id: 'n', value: 150 }]);
    expect(far.rejected?.reason).toBe('Must be at most 100');
    const wide: System = {
      ...groups('m.3.x'),
      variables: groups('m.3.x').variables.map((v) => (v.id === 'n' ? { ...v, max: 1000 } : v)),
    };
    expect(solve(wide, [{ id: 'n', value: 150 }]).rejected?.reason).toBe(
      'The other numbers can’t reach this: they would go past their limits.',
    );
  });

  it('reads a value in its own format and unit', () => {
    const sys: System = {
      id: 's.6.x',
      variables: [
        { id: 'h', symbol: 'h', name: 'Air', unit: '°C', min: -60, max: 60 },
        { id: 'd', symbol: 'd', name: 'Temperature difference', unit: '°C', min: 0, max: 100 },
        { id: 'p', symbol: 'p', name: 'Pictures', min: 0, max: 10, multipleOf: 0.5, fraction: 2 },
        { id: 'k', symbol: 'k', name: 'Each stands for', min: 1, max: 10 },
        { id: 'n', symbol: 'n', name: 'Count', min: 0, max: 100 },
      ],
      relations: [
        {
          id: 'd = h − 3',
          display: '',
          vars: ['d', 'h'],
          residual: (v) => v.d! - v.h! + 3,
          solve: { d: (v) => v.h! - 3, h: (v) => v.d! + 3 },
        },
        {
          id: 'n = p × k',
          display: '',
          vars: ['n', 'p', 'k'],
          residual: (v) => v.n! - v.p! * v.k!,
          solve: { n: (v) => v.p! * v.k!, p: (v) => v.n! / v.k!, k: (v) => v.n! / v.p! },
        },
      ],
    };
    expect(solve(sys, [{ id: 'h', value: -54 }]).rejected?.reason).toBe(
      'That would make the temperature difference −57 °C, but it must be at least 0 °C.',
    );
    expect(
      solve(sys, [
        { id: 'k', value: 4 },
        { id: 'n', value: 1 },
      ]).rejected?.reason,
    ).toMatch(/^That would make the pictures 1\/4, but it must be 0, 1\/2, 1, …( Try|$)/);
  });
});

describe('calculator state', () => {
  it('sets, replaces and clears values', () => {
    let s = initialState(area, [
      { id: 'l', value: 4 },
      { id: 'w', value: 3 },
    ]);
    expect(s.result.values.A).toBe(12);
    s = setValues(area, s, { A: 24 });
    expect(s.given.map((g) => g.id)).toEqual(['w', 'A']);
    expect(s.result.values.l).toBe(8);
    s = setValues(area, s, { w: undefined });
    expect(s.result.values).toEqual({ A: 24 });
  });

  it('treats a multi-value update (a drag) as one newest input', () => {
    let s = initialState(area, [{ id: 'A', value: 12 }]);
    s = setValues(area, s, { l: 5, w: 2 });
    expect(s.result.values).toEqual({ l: 5, w: 2, A: 10 });
    expect(s.given.map((g) => g.id)).toEqual(['l', 'w']);
  });

  it('tells the user when an older input is cleared by a conflict', () => {
    const tri: System = {
      variables: ['a', 'b', 'c'].map((id) => ({ id, symbol: id, name: id, min: 0 })),
      relations: [
        {
          id: 'a² + b² = c²',
          display: '',
          vars: ['a', 'b', 'c'],
          residual: (v) => v.a! ** 2 + v.b! ** 2 - v.c! ** 2,
          solve: { a: (v) => Math.sqrt(v.c! ** 2 - v.b! ** 2) },
        },
      ],
    };
    const s = setValues(tri, initialState(tri, [{ id: 'b', value: 5 }]), { c: 3 });
    expect(s.errors).toEqual({ b: 'Cleared: didn’t fit the newer value' });
  });

  it('reports why an input was rejected', () => {
    const s = setValues(area, initialState(area), { l: -3 });
    expect(s.errors).toEqual({ l: 'Must be at least 0' });
  });
});

describe('format', () => {
  it('formats numbers compactly', () => {
    expect(formatNumber(12)).toBe('12');
    expect(formatNumber(Math.PI)).toBe('3.1416');
    expect(formatNumber(2.5, { integer: true })).toBe('3');
    expect(formatNumber(1.5e9)).toBe('1,500,000,000');
    expect(formatNumber(1.5e15)).toBe('1.5 × 10¹⁵');
    expect(formatNumber(2.5e7 + 0.5)).toBe('2.5 × 10⁷');
  });

  it('parses user input', () => {
    expect(parseNumber('')).toBeUndefined();
    expect(parseNumber(' 1,200.5 ')).toBe(1200.5);
    expect(parseNumber('−3')).toBe(-3);
    expect(parseNumber('2e3')).toBe(2000);
    expect(parseNumber('abc')).toBe('invalid');
    expect(parseNumber('-')).toBe('invalid');
  });

  it('renders formula templates symbolically and with values', () => {
    const vars = area.variables;
    expect(renderTemplate('{A} = {l} × {w}', vars)).toBe('A = l × w');
    expect(renderTemplate('{A} = {l} × {w}', vars, { l: 4, w: -3 })).toBe('? = 4 × (−3)');
  });
});

describe('π and scientific notation', () => {
  it('shows multiples of π and scientific notation the way class writes them', () => {
    expect(formatNumber(36 * Math.PI, { pi: true })).toBe('36π');
    expect(formatNumber(Math.PI, { pi: true })).toBe('π');
    expect(formatNumber(2.25 * Math.PI, { pi: true })).toBe('2.25π');
    expect(formatNumber(10, { pi: true })).toBe('10');
    expect(formatNumber(470000, { scientific: true })).toBe('4.7 × 10⁵');
    expect(formatNumber(0.0003, { scientific: true })).toBe('3 × 10⁻⁴');
    expect(formatNumber(99999.99, { scientific: true })).toBe('1 × 10⁵');
    // Never the calculator's e-notation, with or without the option.
    expect(formatNumber(3e16)).toBe('3 × 10¹⁶');
    expect(formatNumber(1.5e-8)).toBe('1.5 × 10⁻⁸');
  });
  it('reads π and scientific notation typed in a box', () => {
    expect(parseNumber('36π')).toBeCloseTo(36 * Math.PI);
    expect(parseNumber('36 pi')).toBeCloseTo(36 * Math.PI);
    expect(parseNumber('π')).toBeCloseTo(Math.PI);
    expect(parseNumber('4.7 × 10^5')).toBeCloseTo(470000);
    expect(parseNumber('4.7 x 10^-3')).toBeCloseTo(0.0047);
    expect(parseNumber('3 × 10⁻⁴')).toBeCloseTo(0.0003);
    expect(parseNumber('4.7e5')).toBe(470000);
  });
});

describe('parseCents', () => {
  it('reads dollars and cents in a cents box', () => {
    expect(parseCents('$1.25')).toBe(125);
    expect(parseCents('1.25')).toBe(125);
    expect(parseCents('$3')).toBe(300);
    expect(parseCents('125')).toBe(125);
    expect(parseCents('45¢')).toBe(45);
    expect(parseCents('$')).toBeUndefined();
    expect(parseCents('1.2.3')).toBe('invalid');
  });
});

describe('unitFor', () => {
  it('reads a word unit in the singular after 1, and leaves symbols alone', () => {
    expect(unitFor(1, 'cubic units')).toBe('cubic unit');
    expect(unitFor(1, 'inches')).toBe('inch');
    expect(unitFor(1, 'boxes')).toBe('box');
    expect(unitFor(2, 'cups')).toBe('cups');
    expect(unitFor(1, 'ms')).toBe('ms');
    expect(unitFor(1, 'hrs')).toBe('hrs');
    expect(unitFor(1, 'cm')).toBe('cm');
  });
});

describe('fractions', () => {
  it('shows a value as a mixed number or fraction when the lesson asks for one', () => {
    expect(asFraction(100 / 3, 12)).toBe('33 1/3');
    expect(asFraction(0.375, 8)).toBe('3/8');
    expect(asFraction(19 / 8, 8)).toBe('2 3/8');
    expect(asFraction(-2.5, 4)).toBe('−2 1/2');
    expect(asFraction(0.3141, 12)).toBeUndefined();
    expect(formatNumber(32 / 3, { fraction: 12 })).toBe('10 2/3');
    expect(formatNumber(4, { fraction: 12 })).toBe('4');
  });
  it('reads fractions and mixed numbers typed in a box', () => {
    expect(parseNumber('3/8')).toBe(0.375);
    expect(parseNumber('2 3/8')).toBe(2.375);
    expect(parseNumber('−1 1/2')).toBe(-1.5);
    expect(parseNumber('1/0')).toBe('invalid');
  });
});

describe('repeating decimals', () => {
  it('writes the repeating block out and ends with …', () => {
    expect(formatNumber(1 / 3, { repeating: true })).toBe('0.333…');
    expect(formatNumber(1 / 6, { repeating: true })).toBe('0.1666…');
    expect(formatNumber(1 / 11, { repeating: true })).toBe('0.0909…');
    expect(formatNumber(1 / 7, { repeating: true })).toBe('0.142857142857…');
    expect(formatNumber(-2 / 3, { repeating: true })).toBe('−0.666…');
    // A decimal that ends, or a block too long to write, is shown as usual.
    expect(formatNumber(3 / 8, { repeating: true })).toBe('0.375');
    expect(formatNumber(1 / 17, { repeating: true })).toBe('0.05882');
  });
  it('reads a repeating decimal typed in a box as its exact value', () => {
    expect(parseNumber('0.333…')).toBeCloseTo(1 / 3, 12);
    expect(parseNumber('0.1666...')).toBeCloseTo(1 / 6, 12);
    expect(parseNumber('2.0909…')).toBeCloseTo(2 + 1 / 11, 12);
    expect(parseNumber('−0.142857142857…')).toBeCloseTo(-1 / 7, 12);
    expect(parseNumber('0.12…')).toBe('invalid');
  });
});

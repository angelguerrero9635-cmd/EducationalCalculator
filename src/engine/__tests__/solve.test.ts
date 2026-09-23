import { formatNumber, parseNumber, renderTemplate } from '../format';
import { findRoots, solve, type System } from '../solve';
import { initialState, setValues } from '../state';

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
      reason: 'Makes side impossible',
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

  it('findRoots brackets every sign change', () => {
    const roots = findRoots((x) => (x - 1) * (x + 2), -5, 5);
    expect(roots.map((r) => Number(r.toFixed(6)))).toEqual([-2, 1]);
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
    expect(formatNumber(1.5e9)).toBe('1.500e9');
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
    expect(renderTemplate('{A} = {l} × {w}', vars, { l: 4, w: -3 })).toBe('? = 4 × (-3)');
  });
});

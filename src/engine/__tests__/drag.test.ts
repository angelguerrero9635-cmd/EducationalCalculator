import { getModule } from '@/data/modules';
import * as solver from '../solve';
import { driveTyped, initialState, movedGivens, setInput, setValues } from '../state';
import { makeUnitContext } from '../unitContext';

/** The example's state, as a page opens. */
function opened(id: string) {
  const m = getModule(id)!;
  const system = makeUnitContext(m, { system: 'metric' }).system;
  const given = m.startWith.map((v) => ({ id: v, value: m.example[v]! }));
  return { m, system, state: initialState(system, given, { example: true }) };
}

describe('a drag keeps the typed values', () => {
  it('flags a drag on a worked-out angle that would clear the typed coefficients', () => {
    const { system, state } = opened('m.10.parallel-lines~algebra');
    const next = setValues(system, state, { t: 100 });
    expect(movedGivens(state, next, ['t']).length).toBeGreaterThan(0);
  });
  it('lets a drag move a typed value alone', () => {
    const { system, state } = opened('m.10.parallel-lines~algebra');
    const next = setValues(system, state, { s: 60 });
    expect(movedGivens(state, next, ['s'])).toEqual([]);
  });
});

describe('a handle on a worked-out value moves the typed value behind it', () => {
  it('the focus of (x − h)² = q(y − k) sets q = 4p, the point x held', () => {
    const { system, state } = opened('m.12.conics~parabola');
    const next = driveTyped(system, state, { h: 2, k: -1, p: 3 }, 'p', 3)!;
    expect(next.result.values.q).toBeCloseTo(12);
    expect(next.result.values.x).toBe(6);
    expect(next.result.given.map((g) => g.id).sort()).toEqual(['h', 'k', 'q', 'x']);
  });
  it('the radius of x² + y² + Dx + Ey + F = 0 sets F, D and E held', () => {
    const { system, state } = opened('m.10.circle-equations~general-form');
    const next = driveTyped(system, state, { h: 3, k: -2, r: 6 }, 'r', 6)!;
    expect(next.result.values.F).toBeCloseTo(9 + 4 - 36);
    expect([next.result.values.D, next.result.values.E]).toEqual([-6, 4]);
  });
});

describe('a handle on a worked-out value moves its typed value at once', () => {
  /** One drag move: the handle's new value, with the values it pins. */
  function drag(id: string, handle: string, to: number, pin: string[]) {
    const { m, system, state } = opened(id);
    const updates = {
      ...Object.fromEntries(pin.map((p) => [p, state.result.values[p]])),
      [handle]: to,
    };
    const calls = jest.spyOn(solver, 'solve');
    const begun = Date.now();
    const next = setInput(system, state, updates, { id: handle, step: 0.1 }, m.drives);
    const took = Date.now() - begun;
    const solves = calls.mock.calls.length;
    calls.mockRestore();
    return { state, next, took, solves };
  }
  it('the center h of |2x − 3| = 7 moves b; a, c and the distance stay', () => {
    const { state, next, took, solves } = drag('m.9.absolute-value', 'h', 2.5, ['d']);
    expect(next.result.values.h).toBeCloseTo(2.5);
    expect(next.result.values.b).toBe(-5);
    expect([next.result.values.a, next.result.values.c]).toEqual([2, 7]);
    expect(next.result.values.d).toBe(state.result.values.d);
    expect(solves).toBeLessThan(10);
    expect(took).toBeLessThan(5000);
  });
  it('the distance d moves c, not a (the center stays)', () => {
    const { next, solves } = drag('m.9.absolute-value', 'd', 4.5, ['h']);
    expect(next.result.values.c).toBe(9);
    expect([next.result.values.a, next.result.values.b, next.result.values.h]).toEqual([
      2, -3, 1.5,
    ]);
    expect(solves).toBeLessThan(10);
  });
  it('the bound k of 3x − 4 > 5x + 6 moves d', () => {
    const { next, took, solves } = drag('m.9.linear-inequalities', 'k', -7, []);
    expect(next.result.values.k).toBeCloseTo(-7);
    expect(next.result.values.d).toBe(10);
    expect(solves).toBeLessThan(10);
    expect(took).toBeLessThan(5000);
  });
  it.each([
    ['m.9.linear-inequalities~compound', 'L', 'U', 'l'],
    ['m.9.linear-inequalities~compound', 'U', 'L', 'r'],
    ['m.9.linear-inequalities~or', 'L', 'U', 'c'],
    ['m.9.linear-inequalities~or', 'U', 'L', 'f'],
    ['m.9.linear-inequalities~whole-number-answers', 'n', '', 'B'],
    ['m.9.absolute-value~inequality', 'h', 'd', 'b'],
    ['m.9.absolute-value~inequality', 'd', 'h', 'c'],
    ['m.9.absolute-value~inequality-beyond', 'h', 'd', 'b'],
    ['m.9.absolute-value~inequality-beyond', 'd', 'h', 'c'],
    ['s.9.immune-disease~herd-immunity', 'C', 'e', 'R0'],
  ])('%s: %s moves only %4$s', (id, handle, pin, typed) => {
    const { state, next, solves } = drag(
      id,
      handle,
      opened(id).state.result.values[handle]! + 1,
      pin ? [pin] : [],
    );
    // (On the typed value's step: R₀ in tenths moves C by about 0.2.)
    expect(next.result.values[handle]).toBeCloseTo(state.result.values[handle]! + 1, 0);
    const moved = state.result.given
      .filter((g) => next.result.values[g.id] !== g.value)
      .map((g) => g.id);
    expect(moved).toEqual([typed]);
    expect(solves).toBeLessThan(10);
  });
  it('the age of a uranium-dated rock moves R', () => {
    const { state, next, solves } = drag('s.12.radiometric-dating~uranium', 't', 3e9, []);
    expect(next.result.values.t).toBeCloseTo(3e9, -7);
    expect(next.result.values.R).toBeLessThan(state.result.values.R!);
    expect(solves).toBeLessThan(10);
  });
});

describe('the rope pull holds the typed μ', () => {
  it('friction follows the normal force; μ, the mass and the angle stay as typed', () => {
    const { m, system, state } = opened('s.11.dynamics-vectors~rope');
    const held = { m: m.example.m!, q: m.example.q!, k: m.example.k! };
    const next = setValues(system, state, { ...held, T: 100 });
    expect(movedGivens(state, next, ['m', 'q', 'k', 'T'])).toEqual([]);
    expect(next.result.values.k).toBe(m.example.k);
    expect(next.result.values.f).not.toBeCloseTo(m.example.f!);
  });
});

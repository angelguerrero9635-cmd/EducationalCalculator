import { getModule } from '@/data/modules';
import { driveTyped, initialState, movedGivens, setValues } from '../state';
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

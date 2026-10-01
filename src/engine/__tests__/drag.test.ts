import { getModule } from '@/data/modules';
import { initialState, movedGivens, setValues } from '../state';
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

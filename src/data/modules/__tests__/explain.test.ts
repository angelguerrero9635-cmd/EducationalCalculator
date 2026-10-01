import { getModule } from '@/data/modules';
import { buildSteps } from '@/data/modules/buildSteps';
import { solve } from '@/engine/solve';

/** A rule's `explain` says why a value stays unknown, in place of "Type one more number". */
it('says every number is a solution when both sides are the same', () => {
  const m = getModule('m.9.solving-equations')!;
  const given = Object.entries({ a: 2, b: 3, c: 2, d: 3 }).map(([id, value]) => ({ id, value }));
  const result = solve({ variables: m.variables, relations: m.relations }, given);
  expect(result.rejected).toBeUndefined();
  expect(buildSteps(m, result).nextHint).toBe(
    'Both sides are the same: every number is a solution.',
  );
});

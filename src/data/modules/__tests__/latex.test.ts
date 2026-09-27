import { fromLatex, splitLine, toLatex } from '@/engine/latex';
import { solve } from '@/engine/solve';

import { TESTED_MODULES } from '..';
import { buildSteps } from '../buildSteps';

/**
 * Every line the step-by-step typesets comes back to the same plain text (nothing lost or
 * reworded on the way) and parses with the commands the app draws.
 */
describe.each(TESTED_MODULES.map((m) => [m.id, m] as const))('typeset steps for %s', (_, m) => {
  it('round-trip and parse', () => {
    const result = solve(
      m,
      m.startWith.map((id) => ({ id, value: m.example[id]! })),
    );
    const w = buildSteps(m, result);
    const lines = [
      ...w.steps.flatMap((s) => [...s.lines, s.answer, s.how]),
      ...w.check.map((k) => k.formula),
    ];
    for (const line of lines) {
      const tex = toLatex(
        line,
        w.band,
        m.variables.map((v) => v.symbol),
      );
      if (tex === undefined) continue;
      expect(fromLatex(tex)).toBe(line);
      expect(() => splitLine(tex)).not.toThrow();
    }
  });
});

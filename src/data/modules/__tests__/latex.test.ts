import { fromLatex, splitLine, toLatex } from '@/engine/latex';
import { solve } from '@/engine/solve';

import { renderTemplate } from '@/engine/format';

import { TESTED_MODULES, gradeBand, wordRule } from '..';
import { agree, buildSteps } from '../buildSteps';

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

  it('formula lines round-trip and parse', () => {
    const band = gradeBand(m.id);
    const symbols = m.variables.map((v) => v.symbol);
    const result = solve(
      m,
      m.startWith.map((id) => ({ id, value: m.example[id]! })),
    );
    for (const r of m.relations) {
      if (!r.display || r.constraint) continue;
      const lines: [string, { solving: false; words?: boolean }][] = [
        [renderTemplate(r.display, m.variables), { solving: false }],
        [agree(renderTemplate(r.display, m.variables, result.values)), { solving: false }],
        [wordRule(r.display, m.variables, r.words), { solving: false, words: true }],
      ];
      for (const [line, options] of lines) {
        const tex = toLatex(line, band, symbols, options);
        if (tex === undefined) continue;
        expect(fromLatex(tex)).toBe(line);
        expect(() => splitLine(tex)).not.toThrow();
      }
    }
  });
});

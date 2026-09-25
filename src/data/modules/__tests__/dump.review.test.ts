/**
 * Walkthrough dump for the lesson reviewer (evidence gathered once, with no model involved):
 *
 *   REVIEW_DUMP=.review/dump.txt MODULE_IDS=s.K.,s.1. pnpm -s test src/data/modules/__tests__/dump.review.test.ts
 *
 * For each module in scope it prints the definition (values, ranges, relations, example,
 * picture, assumptions, use line) and the walkthrough the student reads from the opening
 * values and from each other value as the one to find, exactly as the page shows it. Skipped
 * unless REVIEW_DUMP names an output file.
 */
import { solve } from '@/engine/solve';

import { MODULES } from '..';
import { buildSteps, type Walkthrough } from '../buildSteps';
import type { ModuleDef } from '../types';

// Jest runs in Node; the test tsconfig has no Node types, so the few Node calls are declared here.
declare const require: (name: string) => {
  mkdirSync: (path: string, options: { recursive: boolean }) => void;
  writeFileSync: (path: string, text: string) => void;
  dirname: (path: string) => string;
};
const env: Record<string, string | undefined> =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const OUT = env.REVIEW_DUMP;
const PREFIXES = (env.MODULE_IDS ?? '').split(',').filter(Boolean);
const inScope = (m: ModuleDef) =>
  PREFIXES.length === 0 || PREFIXES.some((p) => m.id === p || m.id.startsWith(p));

function walkthroughText(w: Walkthrough): string[] {
  const out = [
    `  we know: ${w.given.map((q) => q.label).join('; ') || 'nothing'}`,
    ...(w.find.length ? [`  find: ${w.find.map((q) => q.ask).join(', ')}`] : []),
    ...w.convertIn.map((l) => `  convert: ${l}`),
  ];
  w.steps.forEach((s, i) => {
    out.push(`  step ${i + 1} · ${s.heading}`);
    if (s.lead.sentence) out.push(`    ${s.lead.sentence}`);
    if (s.lead.formula) out.push(`    ${s.lead.formula}`);
    out.push(`    how: ${s.how}`);
    for (const line of s.lines) out.push(`    ${line}`);
    out.push(`    → ${s.answer}`);
  });
  out.push(...w.convertOut.map((l) => `  convert back: ${l}`));
  if (w.nextHint) out.push(`  next: ${w.nextHint}`);
  for (const k of w.check) out.push(`  check: ${k.formula} ${k.ok ? '✓' : w.checkFail}`);
  return out;
}

const describeOrSkip = OUT ? describe : describe.skip;

describeOrSkip('review dump', () => {
  it('writes the walkthroughs the lesson reviewer reads', () => {
    const lines: string[] = [];
    for (const m of MODULES.filter(inScope)) {
      lines.push(`=== ${m.id}${m.title ? ` — ${m.title}` : ''}`);
      if (m.use) lines.push(`use: ${m.use}`);
      lines.push(
        `values: ${m.variables
          .map(
            (v) =>
              `${v.id} "${v.name}" (${v.symbol}) ${v.min ?? '−∞'}..${v.max ?? '∞'}${v.unit ? ` ${v.unit}` : ''}${v.integer ? ' whole' : ''}`,
          )
          .join('; ')}`,
      );
      lines.push(`relations: ${m.relations.map((r) => `${r.id} [${r.display}]`).join(' | ')}`);
      lines.push(`example: ${JSON.stringify(m.example)} start: ${m.startWith.join(', ')}`);
      lines.push(`picture: ${JSON.stringify(m.representation)}`);
      for (const a of m.assumptions) lines.push(`assume: ${a}`);
      // From the opening values, then finding each other value from the rest of the example.
      const cases: [string, string[]][] = [
        ['opening', m.startWith],
        ...m.variables
          .filter((v) => !m.startWith.includes(v.id))
          .slice(0, 3)
          .map((v): [string, string[]] => [
            `find ${v.id}`,
            m.variables.map((x) => x.id).filter((id) => id !== v.id),
          ]),
      ];
      for (const [label, ids] of cases) {
        const result = solve(
          m,
          ids.map((id) => ({ id, value: m.example[id]! })),
          m.example,
        );
        lines.push(`-- ${label}: ${ids.join(', ')}`);
        lines.push(...walkthroughText(buildSteps(m, result)));
      }
      lines.push('');
    }
    const fs = require('node:fs');
    fs.mkdirSync(require('node:path').dirname(OUT!), { recursive: true });
    fs.writeFileSync(OUT!, lines.join('\n'));
    expect(lines.length).toBeGreaterThan(0);
  });
});

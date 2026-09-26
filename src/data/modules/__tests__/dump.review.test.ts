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

import { LAYOUTS, MODULES } from '..';
import { buildSteps, type Walkthrough } from '../buildSteps';
import { writtenText, type Written } from '../written';

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
const inScope = (m: { id: string }) =>
  PREFIXES.length === 0 || PREFIXES.some((p) => m.id === p || m.id.startsWith(p));

/** The written work as text, boxed so it reads apart from the lines around it. */
const grid = (w: Written) => [
  `    ┌ written work: ${w.says}`,
  ...writtenText(w).flatMap((l) => l.split('\n').map((x) => `    │ ${x}`)),
  '    └',
];

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
    s.lines.forEach((line, k) => {
      if (k === s.writtenAfter && s.written) out.push(...grid(s.written));
      out.push(`    ${line}`);
    });
    if (s.lines.length <= s.writtenAfter && s.written) out.push(...grid(s.written));
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
          .filter((v) => !m.startWith.includes(v.id) && !v.derived)
          .map((v): [string, string[]] => [
            `find ${v.id}`,
            m.variables.filter((x) => x.id !== v.id && !x.derived).map((x) => x.id),
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
      // Two boundary samples: the opening values with the first one at its smallest and at
      // its largest allowed value, so the reviewer sees the edges without a browser.
      const first = m.variables.find((v) => v.id === m.startWith[0]);
      for (const edge of ['min', 'max'] as const) {
        const x = first?.[edge];
        if (first === undefined || x === undefined || x === m.example[first.id]) continue;
        const result = solve(
          m,
          m.startWith.map((id) => ({ id, value: id === first.id ? x : m.example[id]! })),
        );
        lines.push(`-- edge ${first.id} = ${x}: ${m.startWith.join(', ')}`);
        lines.push(
          ...(result.rejected
            ? [`  rejected: ${result.rejected.reason}`]
            : walkthroughText(buildSteps(m, result))),
        );
      }
      lines.push('');
    }
    // Layout pages: everything the student reads, so the lesson reviewer covers them too.
    for (const l of LAYOUTS.filter((x) => inScope(x))) {
      lines.push(`=== ${l.id}${l.title ? ` — ${l.title}` : ''} [layout: ${l.kind}]`);
      if (l.use) lines.push(`use: ${l.use}`);
      for (const a of l.assumptions) lines.push(`assume: ${a}`);
      if (l.kind === 'sort') {
        lines.push(`question: ${l.question}`);
        for (const b of l.bins) {
          lines.push(
            `bin ${b.label}: ${l.cards
              .filter((c) => c.bin === b.id)
              .map((c) => c.label)
              .join(', ')} — ${b.why}`,
          );
        }
      } else if (l.kind === 'sequence') {
        lines.push(`question: ${l.question}`);
        lines.push(
          `stages: ${l.stages.map((s) => (s.span === undefined ? s.label : `${s.label} (${s.span} ${l.unit ?? ''})`)).join(' → ')}`,
        );
      } else if (l.kind === 'explore') {
        lines.push(`figure: ${JSON.stringify(l.figure)}`);
        for (const s of l.scenes) lines.push(`scene ${s.label}: ${s.lines.join(' ')}`);
      } else {
        lines.push(`columns: ${l.columns.join(', ')} (${l.rowLabel}, ${l.unit}, 0..${l.max})`);
        lines.push(`initial: ${l.initial.join(', ')} → ${l.pattern(l.initial)}`);
      }
      lines.push('');
    }
    const fs = require('node:fs');
    fs.mkdirSync(require('node:path').dirname(OUT!), { recursive: true });
    fs.writeFileSync(OUT!, lines.join('\n'));
    expect(lines.length).toBeGreaterThan(0);
  });
});

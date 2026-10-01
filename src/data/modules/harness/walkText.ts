/**
 * A walkthrough as the text the student reads, one line each: shared by the review dump and the
 * page fingerprints (scripts/ci-test.mjs) so both see exactly what the page shows.
 */
import type { Walkthrough } from '../buildSteps';
import { writtenText, type Written } from '../written';

/** The written work as text, boxed so it reads apart from the lines around it. */
const grid = (w: Written) => [
  `    ┌ written work: ${w.says}`,
  ...writtenText(w).flatMap((l) => l.split('\n').map((x) => `    │ ${x}`)),
  '    └',
];

export function walkthroughText(w: Walkthrough): string[] {
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

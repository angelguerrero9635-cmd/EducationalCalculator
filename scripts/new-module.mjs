// Scaffold a calculator module in the right grade file, with every field the tests demand.
//   pnpm new-module m.5.volume-rectangular            (a skill's main page)
//   pnpm new-module m.5.volume-rectangular~missing-side "Find a missing side"
// Prints what to fill in next. The module is appended to src/data/modules/<subject>/<grade>.ts
// (created from a header if the grade file doesn't exist yet) and registered in index.ts.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [id, title] = process.argv.slice(2);
const m = /^([ms])\.(K|\d{1,2})\.([\w-]+)(?:~([\w-]+))?$/.exec(id ?? '');
if (!m) {
  console.log('Usage: pnpm new-module <m|s>.<grade>.<skill>[~<slug>] ["Problem-type title"]');
  process.exit(2);
}
const [, subjectLetter, gradeRaw, , slug] = m;
if (slug && !title) {
  console.log('A problem type (~slug) needs a title, e.g. "Find a missing side".');
  process.exit(2);
}
const subject = subjectLetter === 'm' ? 'math' : 'science';
const grade = gradeRaw === 'K' ? 'k' : gradeRaw;
const ROOT = 'src/data/modules';
const file = join(ROOT, subject, `${grade}.ts`);
const arrayName = `${subject.toUpperCase()}_${grade.toUpperCase()}_MODULES`;
const gradeWord = gradeRaw === 'K' ? 'Kindergarten' : `Grade ${gradeRaw}`;

if (!existsSync(file)) {
  writeFileSync(
    file,
    `/**
 * ${gradeWord} ${subject}: every calculator module for the grade, the skill's main page first
 * and its problem types (\`<skill id>~<slug>\`) after it. Shared relation helpers live in
 * \`../helpers.ts\`; worked-line helpers in \`../work.ts\`. Rules: docs/MODULE_GUIDE.md.
 */
import type { Values } from '@/engine/types';

import { div, whole } from '../helpers';
import type { ModuleDef } from '../types';

export const ${arrayName}: ModuleDef[] = [
];
`,
  );
  const index = join(ROOT, 'index.ts');
  let idx = readFileSync(index, 'utf8');
  idx = idx.replace(
    "import { PILOT_MODULES } from './pilots';",
    `import { ${arrayName} } from './${subject}/${grade}';\nimport { PILOT_MODULES } from './pilots';`,
  );
  idx = idx.replace('  ...PILOT_MODULES,', `  ...${arrayName},\n  ...PILOT_MODULES,`);
  writeFileSync(index, idx);
  console.log(`created ${file} and registered ${arrayName} in index.ts`);
}

const text = readFileSync(file, 'utf8');
if (text.includes(`id: '${id}'`)) {
  console.log(`${id} already exists in ${file}`);
  process.exit(1);
}
const template = `
  // ── ${title ?? id} (standard) ──
  {
    id: '${id}',${
      slug ? `\n    title: '${title.replace(/'/g, '’')}',\n    use: 'Use this for …',` : ''
    }
    assumptions: ['One sentence a student can check.', 'The range the page allows.'],
    variables: [
      whole('a', 'a', 'First value', 0, 10),
      whole('b', 'b', 'Second value', 0, 10),
      whole('c', 'c', 'Total', 0, 20),
    ],
    relations: [
      {
        id: 'c = a + b',
        display: '{a} + {b} = {c}',
        vars: ['c', 'a', 'b'],
        residual: (v: Values) => v.c! - v.a! - v.b!,
        solve: {
          c: (v: Values) => v.a! + v.b!,
          a: (v: Values) => v.c! - v.b!,
          b: (v: Values) => v.c! - v.a!,
        },
      },
    ],
    steps: {
      'c = a + b': {
        c: { expr: '{a} + {b}', how: 'Add the two values.' },
        a: { expr: '{c} − {b}', how: 'Take the second value from the total.' },
        b: { expr: '{c} − {a}', how: 'Take the first value from the total.' },
      },
    },
    example: { a: 3, b: 4, c: 7 },
    startWith: ['a', 'b'],
    representation: { kind: 'tape', parts: ['a', 'b'], total: 'c' },
  },
`;
const at = text.lastIndexOf('\n];');
writeFileSync(file, `${text.slice(0, at)}\n${template.trimEnd()}${text.slice(at)}`);
console.log(`appended ${id} to ${file}`);
console.log(`
Next:
  1. Replace the values, relations, steps, example and picture (kinds: docs/MODULE_GUIDE.md).
  2. MODULE_IDS=${id} pnpm test src/data/modules     (module, standards and sampling tests)
  3. pnpm build:web && pnpm review -- --prefix ${id}   (evidence for the reviewers)
`);
if (!existsSync(join(ROOT, 'index.ts'))) process.exit(1);

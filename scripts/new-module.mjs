// Scaffold a calculator module in the right grade file, with every field the tests demand.
//   pnpm new-module m.5.volume-rectangular            (a skill's main page)
//   pnpm new-module m.5.volume-rectangular~missing-side "Find a missing side"
//   pnpm new-module he.engineering.circuits-1#0~parallel "Two resistors in parallel"
// Prints what to fill in next. A K–12 module is appended to src/data/modules/<subject>/<grade>.ts
// (created from a header if the grade file doesn't exist yet) and registered in index.ts; a
// college topic page (`he.<field>.<course>#<i>[~<slug>]`) to src/data/modules/college/<field>.ts,
// the course's home field (created and registered in college/index.ts when new).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { collegeModuleFile, parseCollegeId } from './college-files.mjs';

const [id, title] = process.argv.slice(2);
const college = id?.startsWith('he.') ? parseCollegeId(id) : undefined;
if (college?.error) {
  console.log(college.error);
  process.exit(2);
}
const m = college ? undefined : /^([ms])\.(K|\d{1,2})\.([\w-]+)(?:~([\w-]+))?$/.exec(id ?? '');
if (!m && !college) {
  console.log(
    'Usage: pnpm new-module <m|s>.<grade>.<skill>[~<slug>] ["Problem-type title"]\n' +
      '       pnpm new-module he.<field>.<course>#<topic>[~<slug>] ["Problem-type title"]',
  );
  process.exit(2);
}
const slug = college ? college.slug : m[4];
if (slug && !title) {
  console.log('A problem type (~slug) needs a title, e.g. "Find a missing side".');
  process.exit(2);
}
if (college) {
  newCollegeModule();
  process.exit(0);
}
const [, subjectLetter, gradeRaw] = m;
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

/** A college topic page: the Grade 12 rules (letters, sentences ≤ 35 words, ≤ 10 values). */
function newCollegeModule() {
  const file = collegeModuleFile(college.field);
  const text = readFileSync(file, 'utf8');
  if (text.includes(`id: '${id}'`)) {
    console.log(`${id} already exists in ${file}`);
    process.exit(1);
  }
  const template = `
  // ── ${title ?? college.topic} (${college.courseId} → ${college.topic}) ──
  {
    id: '${id}',${
      slug ? `\n    title: '${title.replace(/'/g, '’')}',\n    use: 'Use this for …',` : ''
    }
    assumptions: ['One sentence a student can check.', 'When the formula applies.'],
    variables: [
      { id: 'a', symbol: 'a', name: 'First value', unit: 'm', min: 0, max: 1000 },
      { id: 'b', symbol: 'b', name: 'Second value', unit: 'm', min: 0, max: 1000 },
      { id: 'c', symbol: 'c', name: 'Total', unit: 'm', min: 0, max: 2000 },
    ],
    relations: [
      {
        id: 'c = a + b',
        display: '{c} = {a} + {b}',
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
        a: { expr: '{c} − {b}', how: 'Subtract b from both sides.' },
        b: { expr: '{c} − {a}', how: 'Subtract a from both sides.' },
      },
    },
    example: { a: 3, b: 4, c: 7 },
    startWith: ['a', 'b'],
    representation: { kind: 'none' },
  },
`;
  // Problem types sit right after their topic's other pages; a new topic goes at the end.
  const owner = `'${college.courseId}#${college.index}`;
  const ids = [...text.matchAll(/\n {4}id: '([^']+)'/g)];
  const lastOfTopic = ids.filter((x) => `'${x[1]}`.split('~')[0] === owner).at(-1);
  let at = text.lastIndexOf('\n];');
  if (lastOfTopic) {
    // The end of that page's element: the next "\n  }," at its depth.
    const end = text.indexOf('\n  },', lastOfTopic.index);
    if (end !== -1) at = end + '\n  },'.length;
  }
  writeFileSync(file, `${text.slice(0, at)}\n${template.trimEnd()}${text.slice(at)}`);
  console.log(`appended ${id} to ${file}`);
  console.log(`
Next:
  1. Replace the values, relations, steps, example and picture (docs/MODULE_GUIDE.md, the plan
     in docs/plans/he.*.md); the topic page lists it under "${college.topic}".
  2. pnpm -s exec prettier --write ${file}
  3. MODULE_IDS='${id}' pnpm test src/data/modules     (module, standards and sampling tests)
`);
}

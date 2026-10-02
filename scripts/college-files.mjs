// College page ids for the scripts (new-module, promote-demo): which field file a page goes in,
// read from the course's entry in src/data/taxonomy.ts (a script can't import the TypeScript).
//   he.<field>.<course>#<i>[~<slug>]: he.math.calc-1#1, he.engineering.circuits-1#0~parallel
// A course's home field is the one its id names (he.physics.…), or for an engineering course
// the first field of its entry (eng("circuits-1", …, ["electrical"], …) → electrical).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const COLLEGE_ID = /^(he\.([\w-]+)\.([\w-]+))#(\d+)(?:~([\w-]+))?$/;

/** "earth-science" → "Earth Science". */
const words = (field) =>
  field.replace(/(^|-)(\w)/g, (_, dash, c) => `${dash ? ' ' : ''}${c.toUpperCase()}`);
/** "earth-science" → "EarthScience". */
const camel = (field) => field.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
/** "earth-science" → "EARTH_SCIENCE". */
const upper = (field) => field.toUpperCase().replace(/-/g, '_');

/**
 * The course, home field and topic of a college page id, or an error message. Checks the
 * course is in the taxonomy and has the topic.
 */
export function parseCollegeId(id) {
  const m = COLLEGE_ID.exec(id ?? '');
  if (!m) return { error: `${id} is not a college id (he.<field>.<course>#<i>[~<slug>])` };
  const [, courseId, group, slug, index, typeSlug] = m;
  const HELPERS = {
    math: 'math',
    chemistry: 'chem',
    physics: 'phys',
    'earth-science': 'earth',
    geography: 'geog',
    biology: 'bio',
    engineering: 'eng',
  };
  const helper = HELPERS[group];
  if (!helper) return { error: `${courseId}: no field or division named ${group}` };
  const taxonomy = readFileSync('src/data/taxonomy.ts', 'utf8');
  // The course's entry: from its call to the next course's call (or the end of the list).
  const start = taxonomy.indexOf(`\n  ${helper}("${slug}",`);
  if (start === -1) return { error: `No course ${courseId} in src/data/taxonomy.ts` };
  const rest = taxonomy.slice(start + 1);
  const next = rest.slice(1).search(/\n  \w+\("|\n\];/);
  const entry = next === -1 ? rest : rest.slice(0, next + 1);
  // Lists in the entry: an engineering course's fields first, its topics last.
  const lists = [...entry.matchAll(/\[([^\]]*)\]/g)].map((l) =>
    [...l[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((t) => t[1]),
  );
  const field = helper === 'eng' ? lists[0]?.[0] : group;
  if (!field) return { error: `${courseId}: no field in its taxonomy entry` };
  const topics = lists.at(-1) ?? [];
  if (Number(index) >= topics.length) {
    return { error: `${courseId} has ${topics.length} topics; #${index} is not one` };
  }
  return { courseId, field, index: Number(index), topic: topics[Number(index)], slug: typeSlug };
}

/**
 * A field's module file (src/data/modules/college/<field>.ts), created and added to
 * college/index.ts when it doesn't exist yet. Returns its path.
 */
export function collegeModuleFile(field) {
  const file = join('src/data/modules/college', `${field}.ts`);
  if (existsSync(file)) return file;
  const name = `COLLEGE_${upper(field)}_MODULES`;
  writeFileSync(
    file,
    `/**
 * College ${words(field)}: the calculator modules of every course whose home field is
 * \`${field}\`, keyed by course topic (\`<courseId>#<i>\`, its problem types \`<courseId>#<i>~<slug>\`
 * after it), in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are
 * in \`../layouts/college${camel(field)}.ts\`. Rules: docs/MODULE_GUIDE.md.
 */
import type { Values } from '@/engine/types';

import type { ModuleDef } from '../types';

export const ${name}: ModuleDef[] = [
];
`,
  );
  register('src/data/modules/college/index.ts', name, `./${field}`, 'COLLEGE_MODULES');
  console.log(`created ${file} and registered ${name} in college/index.ts`);
  return file;
}

/**
 * A field's layout file (src/data/modules/layouts/college<Field>.ts), created and added to
 * layouts/college.ts when it doesn't exist yet. Returns its path.
 */
export function collegeLayoutFile(field) {
  const file = join('src/data/modules/layouts', `college${camel(field)}.ts`);
  if (existsSync(file)) return file;
  const name = `COLLEGE_${upper(field)}_LAYOUTS`;
  writeFileSync(
    file,
    `/**
 * College ${words(field)} layout pages (sort, sequence, explore, observe) of every course whose
 * home field is \`${field}\`, keyed by course topic (\`<courseId>#<i>\`, or \`<courseId>#<i>~<slug>\`
 * for a problem type), in taxonomy order. The calculators are in \`../college/${field}.ts\`.
 */
import type { LayoutDef } from './types';

export const ${name}: LayoutDef[] = [
];
`,
  );
  register(
    'src/data/modules/layouts/college.ts',
    name,
    `./college${camel(field)}`,
    'COLLEGE_LAYOUTS',
  );
  console.log(`created ${file} and registered ${name} in layouts/college.ts`);
  return file;
}

/** Adds `import { name } from 'from'` after the last such import and spreads it into `list`. */
function register(index, name, from, list) {
  let src = readFileSync(index, 'utf8');
  const imports = [...src.matchAll(/^import \{ COLLEGE_\w+ \} from '[^']+';$/gm)];
  const last = imports.at(-1);
  const at = last ? last.index + last[0].length : src.indexOf('\n\nexport const');
  src = `${src.slice(0, at)}\nimport { ${name} } from '${from}';${src.slice(at)}`;
  const open = src.indexOf(`export const ${list}`);
  const close = src.indexOf('\n];', open);
  src = `${src.slice(0, close)}\n  ...${name},${src.slice(close)}`;
  writeFileSync(index, src);
}

// The brief a direction plan starts from, gathered once so the planning agent reads one short
// file instead of the guide, the taxonomy, the tracker, the crosswalk and the questions:
//
//   node scripts/plan-brief.mjs --grade 8 --subject m [--out .review/plans]
//
// Writes <out>/<subject>.<grade>/brief.md: the grade's skill rows, the pictures already drawn
// for them (with the demo ids and the fields they take), the textbook units that teach each
// skill (research/textbooks/CROSSWALK.md), the released questions (review-questions.mjs into the
// same folder) and the plan format to write in. The planner is `lesson-reviewer` with the
// prompt in docs/MODULE_GUIDE.md ("Planning a grade").
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const grade = flag('--grade', undefined);
const subject = flag('--subject', undefined);
if (!grade || !['m', 's'].includes(subject ?? '')) {
  console.log('Give --grade <K|1..12> and --subject m|s');
  process.exit(2);
}
const out = join(flag('--out', '.review/plans'), `${subject}.${grade}`);
mkdirSync(out, { recursive: true });
const prefix = `${subject}.${grade}.`;

// 1. The skill rows, from the taxonomy source (kept byte-for-byte, so read as text).
const taxonomy = readFileSync('src/data/taxonomy.ts', 'utf8');
const table = subject === 'm' ? 'MATH' : 'SCIENCE';
const start = taxonomy.indexOf(`const ${table}: Record<Grade, Row[]> = {`);
const block = taxonomy.slice(start).split(`\n  "${grade}": [`)[1]?.split('\n  ],')[0] ?? '';
const rows = [...block.matchAll(/\["([\w-]+)", "([^"]+)", (\w+)(?:, \[([^\]]*)\])?\]/g)].map(
  (m) => ({
    id: `${prefix}${m[1]}`,
    title: m[2],
    strand: m[3],
    prereqs: (m[4] ?? '').replace(/"/g, '').split(', ').filter(Boolean),
  }),
);
if (!rows.length) {
  console.log(`No skills for ${prefix} in the taxonomy.`);
  process.exit(1);
}

// 2. Pictures drawn for these skills, from the tracker, with the fields their specs take.
const tracker = readFileSync('src/data/modules/pictureRequests.ts', 'utf8');
const entries = [...tracker.matchAll(/\{\n\s+id: '([A-Z]\d+)',([\s\S]*?)\n  \},/g)].map((m) => {
  const body = m[2];
  const get = (key) => new RegExp(`${key}: '([^']*)'`).exec(body)?.[1] ?? '';
  const list = (key) =>
    [...(new RegExp(`${key}: \\[([^\\]]*)\\]`).exec(body)?.[1] ?? '').matchAll(/'([^']+)'/g)].map(
      (x) => x[1],
    );
  return {
    id: m[1],
    what: get('what'),
    kind: get('kind'),
    status: get('status'),
    pages: list('pages'),
    gallery: list('gallery'),
    notes: get('notes'),
  };
});
// Grades 9–12 (H..) build their entries with a helper, so load that tracker as a module (it
// imports only a type; Node strips the types).
process.emitWarning = () => {};
const { HS_PICTURE_REQUESTS } = await import('../src/data/modules/pictureRequestsHs.ts');
entries.push(...HS_PICTURE_REQUESTS.map((e) => ({ notes: '', ...e })));
const pictures = entries.filter((e) => e.pages.some((p) => p.startsWith(prefix)));
const specFiles = readdirSync('src/data/modules')
  .filter((f) => /^types\w*\.ts$/.test(f))
  .map((f) => `src/data/modules/${f}`)
  .concat('src/data/modules/layouts/types.ts');
const specs = specFiles.map((f) => readFileSync(f, 'utf8')).join('\n');
/** The spec of a picture kind: the lines of its `kind: '<kind>'` object in the types files. */
const specOf = (kind) => {
  if (kind === 'equationInput') return '(template syntax: docs/EQUATION_INPUTS.md)';
  // A spec written as `{ kind: 'x' } & (…)`: the whole type statement.
  const typed = specs.indexOf(`{ kind: '${kind}' } &`);
  if (typed !== -1) {
    const from = specs.lastIndexOf('export type', typed);
    const to = specs.indexOf('\n\n', typed);
    return specs
      .slice(from, to === -1 ? undefined : to)
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('/**') && !l.startsWith('*') && !l.startsWith('//'))
      .join(' ');
  }
  // An explore figure or a spec object: the braces around `kind: 'x'`.
  const semi = specs.indexOf(`kind: '${kind}';`);
  const at = semi !== -1 ? semi : specs.search(new RegExp(`\\{ kind: '${kind}'[; }]`)) + 2;
  if (at < 2 && semi === -1) return '(no spec type: see its demos)';
  // The brace that encloses the kind line (not one inside an earlier comment).
  let open = at;
  for (let d = 0; open >= 0; open--) {
    if (specs[open] === '}') d++;
    if (specs[open] === '{' && d-- === 0) break;
  }
  let depth = 0;
  for (let i = open; i < specs.length; i++) {
    if (specs[i] === '{') depth++;
    if (specs[i] === '}' && --depth === 0) {
      return specs
        .slice(open, i + 1)
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('/**') && !l.startsWith('*'))
        .join(' ');
    }
  }
  return '(spec not found)';
};

// 3. Textbook units per skill (the crosswalk rows) and the grade file.
const crosswalk = existsSync('research/textbooks/CROSSWALK.md')
  ? readFileSync('research/textbooks/CROSSWALK.md', 'utf8').split('\n')
  : [];
const header = crosswalk.find((l) => l.startsWith('| Skill')) ?? '';
const crossRows = rows.map(
  (r) => crosswalk.find((l) => l.startsWith(`| \`${r.id}\``)) ?? `| \`${r.id}\` | (no row) |`,
);
const gradeFile = `research/textbooks/grades/${grade}.md`;

// 4. Released questions, into the same folder.
const q = spawnSync('node', ['scripts/review-questions.mjs', '--prefix', prefix, '--out', out], {
  encoding: 'utf8',
});
const questionsNote = `${q.stdout ?? ''}${q.stderr ?? ''}`.trim().split('\n').pop();

// 5. The brief.
const built = existsSync(`src/data/modules/${subject === 'm' ? 'math' : 'science'}/${grade}.ts`);
const lines = [
  `# Plan brief: ${subject === 'm' ? 'math' : 'science'} grade ${grade} (${rows.length} skills)`,
  '',
  `Read this file, then \`docs/MODULE_GUIDE.md\` ("Standards" only), then \`docs/PICTURES.md\``,
  'and `docs/LAYOUTS.md` only when choosing a picture or a layout. Do not read the gallery files or',
  `the taxonomy: what you need from them is here. Questions: \`${join(out, 'questions.md')}\`.`,
  `Textbook units and their lessons: \`${gradeFile}\`. Grade file${built ? '' : ' (not created yet)'}:`,
  `\`src/data/modules/${subject === 'm' ? 'math' : 'science'}/${grade}.ts\`.`,
  '',
  '## Skills (taxonomy order; the id is the page id; problem types are `<id>~<slug>`)',
  '',
  '| Skill | Title | Strand | Refresh (prerequisites) |',
  '| --- | --- | --- | --- |',
  ...rows.map((r) => `| \`${r.id}\` | ${r.title} | ${r.strand} | ${r.prereqs.join(', ')} |`),
  '',
  '## Pictures already drawn for these skills (use their exact fields)',
  '',
  ...(pictures.length
    ? pictures.flatMap((p) => [
        `### ${p.id} \`${p.kind}\` — ${p.status}`,
        `- what: ${p.what}`,
        `- for: ${p.pages.join(', ')}`,
        `- demos: ${p.gallery.map((g) => `\`${g}\``).join(', ') || '(none)'}`,
        `- spec: \`${specOf(p.kind)}\``,
        ...(p.notes ? [`- notes: ${p.notes}`] : []),
        '',
      ])
    : ['(none: every picture is a request)', '']),
  '## Textbook units that teach each skill (research/textbooks/CROSSWALK.md)',
  '',
  header,
  crosswalk.find((l) => l.startsWith('| ---')) ?? '',
  ...crossRows,
  '',
  '## Plan format (compact: about 40–60 lines per skill, one pass)',
  '',
  'Write `plan.md` beside this file with a `## Decisions` section (letters and notation for the',
  'grade, which lessons are layouts, what happens to any pilot page), then `### <n>. <skill id> —',
  '<title>` per skill with exactly these bullets:',
  '',
  '- **Standard:** the CCSS or NGSS codes.',
  '- **Textbooks:** the units from the crosswalk row that teach it, in one line.',
  '- **Tests ask:** a table of the released questions (by id) and the page that solves each,',
  '  marked Solves, Partly or No.',
  '- **Main — BUILD|MOVE `<id>`:** picture (a drawn one by its kind and demo), values with',
  '  ranges and which are `allowed` or `derived`, relations, assumptions (3–4 sentences), the',
  '  example, `startWith`.',
  '- **~<slug> — BUILD:** one bullet per problem type in the same shape; a layout page gives its',
  '  bins and cards, stages, scenes or columns and pattern instead.',
  '- **Verdict:** page count and the question coverage in one line.',
  '',
  'Then `## Engine and picture needs` (numbered, each naming the pages that wait on it),',
  '`## Not in the taxonomy` (for TAXONOMY_ISSUES.md) and `## Priority`. Numbers in the tests set',
  'the ranges. Every example is checked by hand. No text is copied from a question or a textbook.',
  '',
  `Released questions: ${questionsNote}`,
  '',
];
writeFileSync(join(out, 'brief.md'), lines.join('\n'));
console.log(
  `Brief in ${join(out, 'brief.md')}: ${rows.length} skills, ${pictures.length} pictures, ${questionsNote}`,
);

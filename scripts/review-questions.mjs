// The released test and practice questions for a section's skills, for the lesson reviewer:
//
//   node scripts/review-questions.mjs --prefix m.4. [--out .review]
//
// Reads research/questions/<subject>/<grade>.jsonl (NAEP, public domain; Illustrative
// Mathematics, CC BY 4.0) and writes <out>/questions.md: for every skill id under the prefix,
// its questions with choices, answer, type and picture, and at the end the skills with none,
// each with why: no file for its grade, or a file whose questions are all filed elsewhere.
// A page id in the prefix (m.9.data-displays~compare, he.x#0) stands for its skill.
// A question is filed by the grade that took the test; its `skillId` can be an earlier grade,
// so every file is read. Reference only: lesson text stays original (CLAUDE.md).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const prefixes = String(flag('--prefix', '')).split(',').filter(Boolean);
if (!prefixes.length) {
  console.log('Give --prefix, e.g. --prefix m.4. or --prefix s.K.,s.1.');
  process.exit(2);
}
// A page id stands for its skill (the review passes the pages in scope): "s.9.x~y" → "s.9.x".
const skillOf = (p) => p.replace(/[~#].*$/, '');
const mapped = prefixes.filter((p) => skillOf(p) !== p);
const inScope = (id) =>
  typeof id === 'string' &&
  prefixes.some((p) => (skillOf(p) !== p ? id === skillOf(p) : id.startsWith(p)));
const out = flag('--out', '.review');
mkdirSync(out, { recursive: true });

const root = 'research/questions';
const records = existsSync(root)
  ? readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .flatMap((d) =>
        readdirSync(join(root, d.name))
          .filter((f) => f.endsWith('.jsonl'))
          .flatMap((f) =>
            readFileSync(join(root, d.name, f), 'utf8')
              .split('\n')
              .filter((l) => l.trim())
              .map((l) => ({ ...JSON.parse(l), file: join(root, d.name, f) })),
          ),
      )
  : [];

// Skill ids in scope, with titles, from the taxonomy (so skills with no questions show too).
const taxonomy = readFileSync('src/data/taxonomy.ts', 'utf8');
const skills = new Map();
// Rows look like ["add-fractions-like", "Add and subtract …", NF, …] under a grade key ("4": [),
// inside const MATH (ids m.<grade>.<slug>) or const SCIENCE (s.<grade>.<slug>).
{
  let subject = '';
  let grade = '';
  for (const line of taxonomy.split('\n')) {
    if (/^const MATH\b/.test(line)) subject = 'm';
    else if (/^const SCIENCE\b/.test(line)) subject = 's';
    else if (/^const /.test(line)) subject = '';
    const g = /^\s+"?(K|\d+)"?: \[/.exec(line);
    if (g) grade = g[1];
    const row = /^\s+\["([^"]+)", "((?:[^"\\]|\\.)*)"/.exec(line);
    if (subject && grade && row) {
      const id = `${subject}.${grade}.${row[1]}`;
      if (inScope(id)) skills.set(id, row[2]);
    }
  }
}
for (const r of records) {
  for (const id of [r.skillId, ...(r.alsoSkills ?? [])]) {
    if (inScope(id) && !skills.has(id)) skills.set(id, '');
  }
}

// Long question text is cut: the reviewer needs the task and the picture, not every word.
const clip = (s, n) => {
  const t = String(s ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};
const bySkill = new Map([...skills.keys()].map((id) => [id, []]));
// A question counts for its skill and for each lesson in `alsoSkills` (science is tested in
// Grades 4 and 8 but learned in every grade, so an idea tested later lists the lessons that
// teach it first).
for (const r of records) {
  bySkill.get(r.skillId)?.push(r);
  for (const also of r.alsoSkills ?? []) bySkill.get(also)?.push({ ...r, filedUnder: r.skillId });
}

const lines = [
  `# Released questions for ${prefixes.join(', ')}`,
  '',
  'Reference only (research/questions/SOURCES.md): check that the lessons solve these and use',
  'the same words, numbers and pictures students meet. Never copy their text into a lesson.',
  '',
];
const empty = [];
let count = 0;
// Why a skill has none: its grade's file is missing, or the file's questions are all filed
// under other skills (the filter is skillId or alsoSkills equal to the skill's id).
const subjectDir = { m: 'math', s: 'science' };
const why = (id) => {
  const [subject, grade] = id.split('.');
  const file = subjectDir[subject] && join(root, subjectDir[subject], `${grade}.jsonl`);
  if (!file) return 'not a K–12 skill: no question files';
  if (!existsSync(file)) return `no file ${file}, and no other grade's question names it`;
  const inFile = records.filter((r) => r.file === file);
  return `${file} has ${inFile.length} question${inFile.length === 1 ? '' : 's'}, none with skillId or alsoSkills ${id}`;
};
// What each such file's questions are filed under, once per file.
const filedIn = new Map();
for (const [id, title] of [...skills].sort(([a], [b]) => a.localeCompare(b))) {
  const qs = bySkill.get(id) ?? [];
  if (!qs.length) {
    empty.push(`- ${id}${title ? ` — ${title}` : ''}: ${why(id)}`);
    const [subject, grade] = id.split('.');
    const file = subjectDir[subject] && join(root, subjectDir[subject], `${grade}.jsonl`);
    if (file && existsSync(file) && !filedIn.has(file)) {
      const tally = new Map();
      for (const r of records.filter((q) => q.file === file))
        tally.set(r.skillId, (tally.get(r.skillId) ?? 0) + 1);
      filedIn.set(
        file,
        [...tally]
          .sort((a, b) => b[1] - a[1])
          .map(([s, n]) => `${s} (${n})`)
          .join(', '),
      );
    }
    continue;
  }
  lines.push(`## ${id}${title ? ` — ${title}` : ''} (${qs.length})`, '');
  for (const q of qs) {
    count++;
    const src = q.id.startsWith('NAEP') ? 'NAEP' : 'IM';
    const pic = q.picture?.involved ? ` · picture: ${q.picture.kind}` : '';
    const filed = q.filedUnder ? ` · filed under ${q.filedUnder}` : '';
    lines.push(`- **${q.id}** (${src}, grade ${q.grade}, ${q.type}${pic}${filed})`);
    lines.push(`  ${clip(q.question, 420)}`);
    if (q.choices?.length)
      lines.push(`  Choices: ${q.choices.map((c) => clip(c, 60)).join(' | ')}`);
    if (q.answer) lines.push(`  Answer: ${clip(q.answer, 200)}`);
  }
  lines.push('');
}
lines.push('## Skills with no released questions', '', ...(empty.length ? empty : ['(none)']), '');
if (filedIn.size) {
  lines.push('Those files’ questions are filed under:', '');
  for (const [file, list] of filedIn) lines.push(`- ${file}: ${list || '(none)'}`);
  lines.push('');
}
if (mapped.length)
  lines.splice(
    5,
    0,
    `Page ids read as their skills: ${mapped.map((p) => `${p} → ${skillOf(p)}`).join(', ')}.`,
    '',
  );
if (!skills.size)
  lines.push(
    `No skill matches ${prefixes.join(', ')} in src/data/taxonomy.ts or the question files.`,
    '',
  );
writeFileSync(join(out, 'questions.md'), lines.join('\n'));
console.log(
  `${count} questions for ${skills.size - empty.length} of ${skills.size} skills in ${join(out, 'questions.md')}`,
);
for (const line of empty) console.log(`  none ${line.slice(2)}`);
if (!skills.size) console.log(`  No skill matches ${prefixes.join(', ')}.`);

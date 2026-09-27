// The released test and practice questions for a section's skills, for the lesson reviewer:
//
//   node scripts/review-questions.mjs --prefix m.4. [--out .review]
//
// Reads research/questions/<subject>/<grade>.jsonl (NAEP, public domain; Illustrative
// Mathematics, CC BY 4.0) and writes <out>/questions.md: for every skill id under the prefix,
// its questions with choices, answer, type and picture, and at the end the skills with none.
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
              .map((l) => JSON.parse(l)),
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
      if (prefixes.some((p) => id.startsWith(p))) skills.set(id, row[2]);
    }
  }
}
for (const r of records) {
  if (prefixes.some((p) => r.skillId?.startsWith(p)) && !skills.has(r.skillId)) {
    skills.set(r.skillId, '');
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
for (const r of records) bySkill.get(r.skillId)?.push(r);

const lines = [
  `# Released questions for ${prefixes.join(', ')}`,
  '',
  'Reference only (research/questions/SOURCES.md): check that the lessons solve these and use',
  'the same words, numbers and pictures students meet. Never copy their text into a lesson.',
  '',
];
const empty = [];
let count = 0;
for (const [id, title] of [...skills].sort(([a], [b]) => a.localeCompare(b))) {
  const qs = bySkill.get(id) ?? [];
  if (!qs.length) {
    empty.push(`- ${id}${title ? ` — ${title}` : ''}`);
    continue;
  }
  lines.push(`## ${id}${title ? ` — ${title}` : ''} (${qs.length})`, '');
  for (const q of qs) {
    count++;
    const src = q.id.startsWith('NAEP') ? 'NAEP' : 'IM';
    const pic = q.picture?.involved ? ` · picture: ${q.picture.kind}` : '';
    lines.push(`- **${q.id}** (${src}, grade ${q.grade}, ${q.type}${pic})`);
    lines.push(`  ${clip(q.question, 420)}`);
    if (q.choices?.length)
      lines.push(`  Choices: ${q.choices.map((c) => clip(c, 60)).join(' | ')}`);
    if (q.answer) lines.push(`  Answer: ${clip(q.answer, 200)}`);
  }
  lines.push('');
}
lines.push('## Skills with no released questions', '', ...(empty.length ? empty : ['(none)']), '');
writeFileSync(join(out, 'questions.md'), lines.join('\n'));
console.log(
  `${count} questions for ${skills.size - empty.length} of ${skills.size} skills in ${join(out, 'questions.md')}`,
);

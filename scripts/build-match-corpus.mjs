// Word weights per skill for the problem matcher (src/data/match.ts), derived from the openly
// licensed practice problems in research/textbooks/practice (Illustrative Mathematics and
// OpenSciEd, CC BY 4.0). Only statistics ship: for each skill, the words that set its
// problems apart and how strongly. No problem text is copied. Non-commercial material
// (Eureka Math) is left out. Writes src/data/matchCorpus.json.
//   node scripts/build-match-corpus.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'research/textbooks/practice';
const ALLOWED = new Set(['im-k5', 'im-68', 'openscied']);
const TERMS_PER_SKILL = 60;

// Keep in step with tokenize() in src/data/match.ts (match.test.ts checks a sample).
const STOP = new Set(
  (
    'a an and are as at be by for from has have how if in into is it its many more much of on ' +
    'or that the their then there these they this to was were what when which will with you ' +
    'your each some use this for find value does do did can about than not all any one two ' +
    'three four five six seven eight nine ten'
  ).split(' '),
);
const normalize = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[‐-―]/g, '-');
function tokenize(text) {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w))
    .map((w) => {
      if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
      else if (w.length > 5 && w.endsWith('ed')) w = w.slice(0, -2);
      else if (w.length > 4 && /(s|x|z|ch|sh)es$/.test(w)) w = w.slice(0, -2);
      if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
      return w;
    });
}

const bySkill = new Map();
const df = new Map();
let problems = 0;
for (const subject of readdirSync(ROOT)) {
  for (const file of readdirSync(join(ROOT, subject))) {
    if (!file.endsWith('.jsonl')) continue;
    for (const line of readFileSync(join(ROOT, subject, file), 'utf8').split('\n')) {
      if (!line.trim()) continue;
      const r = JSON.parse(line);
      if (!ALLOWED.has(r.curriculum) || !r.skillId || !r.question) continue;
      problems++;
      const skills = [r.skillId, ...(r.alsoSkills ?? [])];
      const terms = new Set(tokenize(r.question));
      for (const t of terms) df.set(t, (df.get(t) ?? 0) + 1);
      for (const s of skills) {
        if (!bySkill.has(s)) bySkill.set(s, { n: 0, tf: new Map() });
        const e = bySkill.get(s);
        e.n++;
        for (const t of terms) e.tf.set(t, (e.tf.get(t) ?? 0) + 1);
      }
    }
  }
}

// tf-idf per skill, the top terms only, scaled so the strongest term of a skill is 1.
const out = {};
for (const [skill, e] of [...bySkill].sort()) {
  const scored = [...e.tf]
    .map(([t, n]) => [t, (n / e.n) * Math.log(1 + problems / (df.get(t) ?? 1))])
    .filter(([t]) => t.length > 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TERMS_PER_SKILL);
  const top = scored[0]?.[1] ?? 1;
  out[skill] = Object.fromEntries(scored.map(([t, w]) => [t, Math.round((100 * w) / top) / 100]));
}
writeFileSync('src/data/matchCorpus.json', `${JSON.stringify(out)}\n`);
console.log(`${problems} problems → ${Object.keys(out).length} skills, src/data/matchCorpus.json`);

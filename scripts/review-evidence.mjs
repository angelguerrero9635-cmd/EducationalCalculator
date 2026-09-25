// Gathers everything a section review reads, with no model involved, so the reviewers spend
// their tokens on judgement rather than on writing scripts:
//
//   node scripts/review-evidence.mjs --prefix s.K.,s.1.,s.2.,s.3. [--out .review] [--wide 3] [--dark 3]
//
// Writes into the output folder:
//   dump.txt        every module's definition and walkthroughs (dump.review.test.ts)
//   harness.txt     the sampling harness report for the section (SAMPLING_REPORT=1)
//   shots/          full-page screenshots at 390 px for every module, plus a few at 1024 px
//                   and a few in dark mode, with the layout checks (review-shots.mjs)
//   evidence.md     an index: module ids, the files, and any problems the scripts flagged
// Needs a web build (pnpm build:web) and the globally installed Playwright (NODE_PATH).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const prefix = flag('--prefix', undefined);
if (!prefix) {
  console.log('Give --prefix, e.g. --prefix s.K.,s.1.');
  process.exit(2);
}
const out = flag('--out', '.review');
const wide = Number(flag('--wide', '3'));
const dark = Number(flag('--dark', '3'));
mkdirSync(join(out, 'shots'), { recursive: true });

const run = (label, cmd, cmdArgs, env = {}) => {
  console.log(`▶ ${label}`);
  const r = spawnSync(cmd, cmdArgs, {
    env: { ...process.env, ...env },
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return `${r.stdout ?? ''}${r.stderr ?? ''}`;
};

// 1. Walkthrough dump.
run(
  'walkthrough dump',
  'npx',
  ['jest', 'src/data/modules/__tests__/dump.review.test.ts', '--silent'],
  {
    REVIEW_DUMP: join(out, 'dump.txt'),
    MODULE_IDS: prefix,
  },
);
const ids = [...readFileSync(join(out, 'dump.txt'), 'utf8').matchAll(/^=== (\S+)/gm)].map(
  (m) => m[1],
);

// 2. Sampling harness report.
const harness = run(
  'sampling harness',
  'npx',
  // (not --silent: the report is printed with console.log)
  ['jest', 'src/data/modules/__tests__/sampling.test.ts'],
  { MODULE_IDS: prefix, SAMPLING_REPORT: '1' },
);
const report = harness
  .split('\n')
  .filter((l) => /^\s*(## |- \[|Samples:)/.test(l))
  .map((l) => l.trim())
  .join('\n');
writeFileSync(join(out, 'harness.txt'), report);

// 3. Screenshots and layout checks.
if (!existsSync('dist')) {
  console.log('No dist/: run pnpm build:web first.');
  process.exit(1);
}
const shots = (list, width, extra = []) =>
  run(`screenshots @${width}${extra.includes('--dark') ? ' dark' : ''}`, 'node', [
    'scripts/review-shots.mjs',
    ...list,
    '--widths',
    String(width),
    '--out',
    join(out, 'shots'),
    ...extra,
  ]);
const phone = shots(ids, 390);
const desktop = shots(ids.slice(0, wide), 1024);
const night = shots(ids.slice(0, dark), 390, ['--dark']);
const problems = [phone, desktop, night]
  .join('\n')
  .split('\n')
  .filter((l) => /PROBLEM|^\s+- /.test(l));
// The controls each page offers (sliders, handles, tappable cells), from the phone run.
const controls = new Map();
{
  let current = '';
  for (const line of phone.split('\n')) {
    const head = /^(?:ok|PROBLEM)\s+(\S+) @/.exec(line);
    if (head) current = head[1];
    const c = /^\s+controls: (.*)$/.exec(line);
    if (c && current) controls.set(current, c[1]);
  }
}

// 3b. Picture kinds: one line per module, and contact sheets with one page per kind (9 per
// sheet) so the page reviewer sees every kind in a few image opens.
const dump = readFileSync(join(out, 'dump.txt'), 'utf8');
const kinds = new Map();
{
  let current = '';
  for (const line of dump.split('\n')) {
    const head = /^=== (\S+)(?: — .*)?(?: \[layout: (\w+)\])?$/.exec(line);
    if (head) {
      current = head[1];
      if (head[2]) kinds.set(current, `layout ${head[2]}`);
    }
    const pic = /^picture: (\{.*\})$/.exec(line);
    if (pic && current) {
      try {
        kinds.set(current, JSON.parse(pic[1]).kind);
      } catch {
        kinds.set(current, '?');
      }
    }
  }
}
const firstOfKind = [...kinds].filter(([, k], i, all) => all.findIndex(([, x]) => x === k) === i);
const sheetScript = `
import sys
from PIL import Image
files = sys.argv[2:]
out = sys.argv[1]
scale = 0.55
per = 9
for s in range(0, len(files), per):
    group = files[s:s + per]
    imgs = []
    for f in group:
        im = Image.open(f)
        im = im.crop((0, 0, im.width, min(im.height, 1400)))
        imgs.append(im.resize((int(im.width * scale), int(im.height * scale))))
    cols = 3
    w = max(i.width for i in imgs)
    h = max(i.height for i in imgs)
    rows = (len(imgs) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (w + 8), rows * (h + 8)), 'white')
    for k, im in enumerate(imgs):
        sheet.paste(im, ((k % cols) * (w + 8), (k // cols) * (h + 8)))
    sheet.save(f"{out}/sheet{s // per}.png")
print(len(files), "pages on", (len(files) + per - 1) // per, "sheets")
`;
mkdirSync(join(out, 'sheets'), { recursive: true });
const sheetFiles = firstOfKind
  .map(([id]) => join(out, 'shots', `${id.replace(/[^\w.~-]/g, '_')}-390.png`))
  .filter((f) => existsSync(f));
const sheets = sheetFiles.length
  ? run('contact sheets', 'python3', ['-c', sheetScript, join(out, 'sheets'), ...sheetFiles])
  : 'no sheets';

// 4. Index.
const failures = report.split('\n').filter((l) => l.startsWith('- [error]'));
writeFileSync(
  join(out, 'evidence.md'),
  [
    `# Evidence for ${prefix}`,
    '',
    `${ids.length} modules: ${ids.join(', ')}`,
    '',
    `- Walkthroughs: ${join(out, 'dump.txt')} (grep "=== <id>" for one module)`,
    `- Harness: ${join(out, 'harness.txt')} — ${failures.length} error lines`,
    `- Screenshots: ${join(out, 'shots')}/<id>-390.png (all), -1024.png (first ${wide}), dark for the first ${dark}`,
    `- Contact sheets: ${join(out, 'sheets')}/sheet<n>.png, one page per picture kind (${sheets.trim().split('\n').pop()})`,
    '',
    '## Flagged by the scripts',
    ...(problems.length ? problems : ['(nothing)']),
    ...(failures.length ? ['', '## Harness errors', ...failures] : []),
    '',
    '## Pages: picture kind and controls',
    ...ids.map((id) => `- ${id}: ${kinds.get(id) ?? '?'} — ${controls.get(id) ?? '(none)'}`),
    ...[...kinds]
      .filter(([id]) => !ids.includes(id))
      .map(([id, k]) => `- ${id}: ${k} — ${controls.get(id) ?? '(none)'}`),
    '',
  ].join('\n'),
);
console.log(
  `Evidence in ${out}/evidence.md: ${ids.length} modules, ${problems.length} layout flags, ${failures.length} harness errors.`,
);

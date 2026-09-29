// Gathers everything a section review reads, with no model involved, so the reviewers spend
// their tokens on judgement rather than on writing scripts:
//
//   node scripts/review-evidence.mjs --prefix s.K.,s.1.,s.2.,s.3. [--out .review] [--wide 3] [--dark 3]
//     [--stage lesson|page|all] [--changed] [--edges] [--all-shots] [--interact all|new] [--build]
//
// --stage lesson: the dump, the harness report and the released questions (what the
//   lesson-reviewer reads); no web build, no browser. Run it as soon as the tests pass.
// --stage page: screenshots, scenes and drags, contact sheets (what the page-reviewer reads);
//   builds the web export first when dist/ is missing or older than src/ (or with --build),
//   pre-rendering only the pages in scope (PRERENDER_PREFIX). The default, all, does both.
// --changed: only pages whose definition or walkthrough changed since the last run
//   (.review/page-hashes.json holds a hash of every page's dump section).
// --edges: an edge-case review. Fewer random samples (SAMPLES=25, SEQUENCES=5), most of them
//   taken at the boundaries (EDGE_BIAS=0.8), and the dump walks every opening value at its
//   smallest and largest, then all of them at once (REVIEW_EDGES=all).
// --all-shots: screenshot the text-only sorts and sequences too (skipped by default: the
//   layout test covers their data and their look never changes).
// --interact all: run scenes and drags on every page, not only on pages whose picture kind has
//   not been dragged before (.review/interact-kinds.json).
//
// Writes into the output folder:
//   dump.txt        every module's definition and walkthroughs (dump.review.test.ts)
//   harness.txt     the sampling harness report for the section (SAMPLING_REPORT=1)
//   shots/          full-page screenshots at 390 px for every module, plus a few at 1024 px
//                   and a few in dark mode, with the layout checks (review-shots.mjs)
//   scenes/         every scene of every exploration; drags.md: every handle dragged, with
//                   the values before and after (review-interact.mjs)
//   questions.md    released test and practice questions for the section's skills
//                   (review-questions.mjs, from research/questions/)
//   evidence.md     an index: module ids, the files, and any problems the scripts flagged
// The page stage needs the globally installed Playwright (NODE_PATH).
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
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
const stage = flag('--stage', 'all');
const changedOnly = args.includes('--changed');
const allShots = args.includes('--all-shots');
const interactMode = flag('--interact', 'new');
// The review samples deeply; `pnpm test` keeps small defaults so a full run stays short.
const edgeEnv = args.includes('--edges')
  ? { REVIEW_EDGES: 'all', SAMPLES: '25', SEQUENCES: '5', UNIT_CASES: '10', EDGE_BIAS: '0.8' }
  : { SAMPLES: '100', SEQUENCES: '15', UNIT_CASES: '10' };
mkdirSync(join(out, 'shots'), { recursive: true });
mkdirSync('.review', { recursive: true });

const run = (label, cmd, cmdArgs, env = {}) => {
  console.log(`▶ ${label}`);
  const r = spawnSync(cmd, cmdArgs, {
    env: { ...process.env, ...env },
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return `${r.stdout ?? ''}${r.stderr ?? ''}`;
};
const readJson = (file, fallback) =>
  existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback;

// 1. Walkthrough dump (always: it names the pages in scope and is cheap).
const dumpFile = join(out, 'dump.txt');
run(
  'walkthrough dump',
  'npx',
  ['jest', 'src/data/modules/__tests__/dump.review.test.ts', '--silent'],
  {
    REVIEW_DUMP: dumpFile,
    MODULE_IDS: prefix,
    ...edgeEnv,
  },
);

/** The dump split into sections, id → text. */
const sections = new Map();
{
  let current = '';
  for (const line of readFileSync(dumpFile, 'utf8').split('\n')) {
    const head = /^=== (\S+)/.exec(line);
    if (head) current = head[1];
    if (current) sections.set(current, `${sections.get(current) ?? ''}${line}\n`);
  }
}
let ids = [...sections.keys()];

// 1a. Only the pages that changed since the last run (--changed).
const hashFile = join('.review', 'page-hashes.json');
const hashes = readJson(hashFile, {});
const hash = (text) => createHash('sha1').update(text).digest('hex').slice(0, 16);
if (changedOnly) {
  const changed = ids.filter((id) => hashes[id] !== hash(sections.get(id)));
  console.log(`${changed.length} of ${ids.length} pages changed since the last run.`);
  if (changed.length === 0) {
    console.log('Nothing to review.');
    process.exit(0);
  }
  ids = changed;
  writeFileSync(dumpFile, ids.map((id) => sections.get(id)).join(''));
}
for (const id of ids) hashes[id] = hash(sections.get(id));

// Page kinds, from the dump: a picture kind, or `layout <kind>`; text-only layouts too.
const kinds = new Map();
const textOnly = new Set();
for (const id of ids) {
  const text = sections.get(id);
  const head = /^=== \S+(?: — .*)?(?: \[layout: (\w+)\])?$/m.exec(text);
  if (head?.[1]) kinds.set(id, `layout ${head[1]}`);
  const pic = /^picture: (\{.*\})$/m.exec(text);
  if (pic) {
    try {
      kinds.set(id, JSON.parse(pic[1]).kind);
    } catch {
      kinds.set(id, '?');
    }
  }
  if (/^figures: 0$/m.test(text) && /\[layout: (sort|sequence)\]/.test(text)) textOnly.add(id);
}

// 2. Sampling harness report and released questions (the lesson stage).
let report = existsSync(join(out, 'harness.txt'))
  ? readFileSync(join(out, 'harness.txt'), 'utf8')
  : '';
let questions = '';
if (stage !== 'page') {
  const harness = run(
    'sampling harness',
    'npx',
    // (not --silent: the report is printed with console.log)
    ['jest', 'src/data/modules/__tests__/sampling.test.ts'],
    { MODULE_IDS: changedOnly ? ids.join(',') : prefix, SAMPLING_REPORT: '1', ...edgeEnv },
  );
  report = harness
    .split('\n')
    .filter((l) => /^\s*(## |- \[|Samples:)/.test(l))
    .map((l) => l.trim())
    .join('\n');
  writeFileSync(join(out, 'harness.txt'), report);
  questions = run('released questions', 'node', [
    'scripts/review-questions.mjs',
    '--prefix',
    prefix,
    '--out',
    out,
  ]);
}

// 3. Screenshots and layout checks (the page stage).
let problems = [];
const controls = new Map();
const blocks = new Map();
let interact = '';
let sheets = '';
if (stage !== 'lesson') {
  // 3a. The web build, when dist/ is stale or does not cover these pages. Only the pages in
  // scope are pre-rendered (PRERENDER_PREFIX), which is most of the export's time.
  const newest = (dir) =>
    readdirSync(dir, { withFileTypes: true }).reduce((t, d) => {
      const p = join(dir, d.name);
      return Math.max(t, d.isDirectory() ? newest(p) : statSync(p).mtimeMs);
    }, 0);
  const built = existsSync('dist/index.html') ? statSync('dist/index.html').mtimeMs : 0;
  const covers = existsSync('dist/.prerender')
    ? readFileSync('dist/.prerender', 'utf8').trim()
    : 'all';
  const coversIds =
    covers === 'all' || ids.every((id) => covers.split(',').some((p) => id.startsWith(p)));
  if (args.includes('--build') || built < newest('src') || !coversIds) {
    run('web build (pages in scope)', 'pnpm', ['-s', 'build:web'], { PRERENDER_PREFIX: prefix });
    writeFileSync('dist/.prerender', prefix);
  } else {
    console.log('▶ web build: dist/ is current; reusing it');
  }

  const shots = (list, width, extra = []) =>
    list.length
      ? run(`screenshots @${width}${extra.includes('--dark') ? ' dark' : ''}`, 'node', [
          'scripts/review-shots.mjs',
          ...list,
          '--widths',
          String(width),
          '--out',
          join(out, 'shots'),
          ...extra,
        ])
      : '';
  const shotIds = allShots ? ids : ids.filter((id) => !textOnly.has(id));
  const phone = shots(shotIds, 390);
  const desktop = shots(shotIds.slice(0, wide), 1024);
  const night = shots(shotIds.slice(0, dark), 390, ['--dark']);
  problems = [phone, desktop, night]
    .join('\n')
    .split('\n')
    .filter((l) => /PROBLEM|^\s+- /.test(l));
  // The controls each page offers (sliders, handles, tappable cells), from the phone run, and
  // where each page's height goes (picture → sliders → first input, px from the section header).
  {
    let current = '';
    for (const line of phone.split('\n')) {
      const head = /^(?:ok|PROBLEM)\s+(\S+) @/.exec(line);
      if (head) current = head[1];
      const c = /^\s+controls: (.*)$/.exec(line);
      if (c && current) controls.set(current, c[1]);
      const b = /^\s+blocks: (.*)$/.exec(line);
      if (b && current) blocks.set(current, b[1]);
    }
  }

  // 3b. Every exploration scene and every drag handle (review-interact.mjs), on pages whose
  // picture kind has not been dragged before (or all of them with --interact all).
  const dragged = readJson(join('.review', 'interact-kinds.json'), {});
  const interactIds =
    interactMode === 'all'
      ? ids
      : ids.filter((id) => !textOnly.has(id) && !(kinds.get(id) in dragged));
  interact = interactIds.length
    ? run('scenes and drags', 'node', ['scripts/review-interact.mjs', '--out', out, ...interactIds])
    : 'no pages with a picture kind not dragged before';
  for (const id of interactIds) dragged[kinds.get(id) ?? '?'] = id;
  writeFileSync(join('.review', 'interact-kinds.json'), JSON.stringify(dragged, null, 2));

  // 3c. Picture kinds: contact sheets with one page per kind (9 per sheet) so the page reviewer
  // sees every kind in a few image opens.
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
  sheets = sheetFiles.length
    ? run('contact sheets', 'python3', ['-c', sheetScript, join(out, 'sheets'), ...sheetFiles])
    : 'no sheets';
}

// 4. Index, and the hashes for the next --changed run.
writeFileSync(hashFile, JSON.stringify(hashes, null, 2));
const failures = report.split('\n').filter((l) => l.startsWith('- [error]'));
const last = (text) => text.trim().split('\n').pop();
writeFileSync(
  join(out, 'evidence.md'),
  [
    `# Evidence for ${prefix}${changedOnly ? ' (changed pages only)' : ''}`,
    '',
    `${ids.length} pages: ${ids.join(', ')}`,
    '',
    `- Walkthroughs: ${dumpFile} (grep "=== <id>" for one module)`,
    `- Harness: ${join(out, 'harness.txt')} — ${failures.length} error lines`,
    ...(stage !== 'lesson'
      ? [
          `- Screenshots: ${join(out, 'shots')}/<id>-390.png (all but text-only sorts and sequences), -1024.png (first ${wide}), dark for the first ${dark}`,
          `- Scenes and drags: ${join(out, 'scenes')}/<id>-<n>.png, ${join(out, 'drags.md')} (${last(interact)})`,
          `- Contact sheets: ${join(out, 'sheets')}/sheet<n>.png, one page per picture kind (${last(sheets)})`,
        ]
      : ['- (lesson stage: no screenshots, scenes or sheets)']),
    ...(questions
      ? [`- Released questions: ${join(out, 'questions.md')} (${last(questions)})`]
      : []),
    '',
    '## Flagged by the scripts',
    ...(problems.length ? problems : ['(nothing)']),
    ...(failures.length ? ['', '## Harness errors', ...failures] : []),
    '',
    '## Pages: picture kind and controls',
    ...ids.map(
      (id) =>
        `- ${id}: ${kinds.get(id) ?? '?'} — ${controls.get(id) ?? '(none)'}${blocks.has(id) ? ` — ${blocks.get(id)}` : ''}`,
    ),
    '',
  ].join('\n'),
);
console.log(
  `Evidence in ${out}/evidence.md: ${ids.length} pages, ${problems.length} layout flags, ${failures.length} harness errors.`,
);

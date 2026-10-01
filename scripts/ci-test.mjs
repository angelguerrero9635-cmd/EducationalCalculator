// The tests a push needs, not all of them every time:
//
//   node scripts/ci-test.mjs [--since <git ref>] [--heavy | --full] [--dry]
//
// By default only the cheap suites run: the two heavy ones (modules and sampling) run on the
// nightly workflow (--full). --heavy runs them for the pages the push changed, worked out as
// below.
//
// The cheap suites (engine, selectors, standards, layouts, tracker, …) always run in full. The
// two heavy suites (modules.test.ts and sampling.test.ts, about 5 minutes together) run only for
// the pages a push can change:
// - a grade data file: its grade (src/data/modules/math/7.ts → m.7., layouts/science7.ts → s.7.,
//   gallery*.ts → g.);
// - the engine or a shared helper (src/engine, buildSteps, simplify, helpers, …): the pages whose
//   fingerprint changed (fingerprint.review.test.ts hashes what each page says at its example,
//   its edges and three seeded samples, here and at <ref>, in a worktree; cached by commit);
// - a picture component or a picture check: the pages of the kinds that file names;
// - a harness phrase file: its grades.
// They run in full when that can't be worked out (the harness core, the heavy suites
// themselves, a shared component) or with --full; the nightly workflow passes --full.
// CI passes --since to the commit before the push; locally the default is origin's copy of the
// current branch, so `node scripts/ci-test.mjs` before a push tests what the push carries.
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, copyFileSync, rmSync, symlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const git = (cmd) => {
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
};
const branch = git('rev-parse --abbrev-ref HEAD');
const since = flag('--since', git(`rev-parse --verify origin/${branch}`) || 'HEAD~1');
// No usable base (a first push, a shallow clone): run everything.
// The heavy suites run nightly only (--full); a push runs the cheap suites. --heavy runs them
// for the pages the push changed, when a change needs it.
const quick = !args.includes('--full') && !args.includes('--heavy');
let full = args.includes('--full') || !git(`rev-parse --verify ${since}^{commit}`);

const changed = full
  ? []
  : git(`diff --name-only ${since} HEAD`)
      .split('\n')
      .concat(
        git('diff --name-only HEAD').split('\n'),
        git('ls-files --others --exclude-standard').split('\n'),
      )
      .filter(Boolean);

/** The MODULE_IDS prefix a changed grade data file stands for, or undefined for any other file. */
const prefixOf = (file) => {
  let m = /^src\/data\/modules\/(math|science)\/(\w+)\.ts$/.exec(file);
  if (m) return `${m[1][0]}.${m[2]}.`;
  m = /^src\/data\/modules\/layouts\/(math|science)(\w*)\.ts$/.exec(file);
  if (m) return m[2] ? `${m[1][0]}.${m[2]}.` : `${m[1][0]}.`;
  if (/^src\/data\/modules\/gallery\w*\.ts$/.test(file)) return 'g.';
  if (/^src\/data\/modules\/(pilots|college)\.ts$/.test(file)) return 'all';
  return undefined;
};

const prefixes = new Set();
/** Files whose effect on a page shows in what the page says: the engine and shared helpers. */
const outputFiles = [];
/** Picture components and checks: the pages of the kinds they name. */
const pictureFiles = [];
const HS = ['m.9.', 'm.10.', 'm.11.', 'm.12.', 's.9.', 's.10.', 's.11.', 's.12.', 'g.'];
for (const file of changed) {
  // Files that don't affect the module tests at all: docs, scripts, the app's screens.
  if (!/^(src|package\.json|pnpm-lock\.yaml|jest\.config|tsconfig)/.test(file)) continue;
  if (/^src\/app\//.test(file)) continue;
  if (/^src\/data\/modules\/__tests__\/(dump|docs|fingerprint)\.review\.test\.ts$/.test(file))
    continue;
  // The cheap suites run in full anyway; the tracker and type-only files change no page.
  if (
    /^src\/data\/(modules\/)?__tests__\//.test(file) &&
    !/(modules|sampling)\.test\.ts$/.test(file)
  )
    continue;
  if (/^src\/engine\/__tests__\//.test(file)) continue;
  if (/^src\/data\/modules\/(pictureRequests\w*|types\w*)\.ts$/.test(file)) continue;
  const p = prefixOf(file);
  if (p === 'all') {
    full = true;
    break;
  }
  if (p !== undefined) {
    prefixes.add(p);
    continue;
  }
  let m = /^src\/data\/modules\/harness\/phrases(M|S)(\d+)\.ts$/.exec(file);
  if (m) {
    prefixes.add(`${m[1].toLowerCase()}.${m[2]}.`);
    continue;
  }
  if (/^src\/data\/modules\/harness\/phrasesHs\w*\.ts$/.test(file)) {
    HS.forEach((x) => prefixes.add(x));
    continue;
  }
  if (
    /^src\/data\/modules\/harness\/(pictures\w*|chemPictures|layoutFigures\w*)\.ts$/.test(file) ||
    /^src\/components\/module\/reps\//.test(file)
  ) {
    pictureFiles.push(file);
    continue;
  }
  if (
    /^src\/engine\//.test(file) ||
    /^src\/data\/modules\/[^/]+\.ts$/.test(file) ||
    /^src\/data\/modules\/(shared|layouts)\//.test(file) ||
    file === 'src/data/modules/harness/walkText.ts'
  ) {
    outputFiles.push(file);
    continue;
  }
  if (/^src\/components\//.test(file) && !/^src\/components\/module\/[^/]+\.tsx?$/.test(file))
    continue;
  // The harness core, the heavy suites themselves, the module components, package changes.
  full = true;
  break;
}

/**
 * Page fingerprints at a commit (or the working tree for "work"): { id: { h, kind } }.
 * A commit's are made in a temporary worktree with this checkout's fingerprint test and cached
 * in .review/fingerprints/<sha>.json. Undefined when they can't be made.
 */
const FP_TEST = 'src/data/modules/__tests__/fingerprint.review.test.ts';
const FP_HELPER = 'src/data/modules/harness/walkText.ts';
function fingerprints(ref) {
  const dir = resolve('.review/fingerprints');
  mkdirSync(dir, { recursive: true });
  const sha = ref === 'work' ? 'work' : git(`rev-parse ${ref}`);
  const out = join(dir, `${sha}.json`);
  if (sha !== 'work' && existsSync(out)) return JSON.parse(readFileSync(out, 'utf8'));
  let cwd = process.cwd();
  let tree;
  if (sha !== 'work') {
    tree = join(dir, `tree-${sha.slice(0, 12)}`);
    rmSync(tree, { recursive: true, force: true });
    git(`worktree prune`);
    if (!git(`worktree add --detach ${tree} ${sha}`) && !existsSync(tree)) return undefined;
    symlinkSync(resolve('node_modules'), join(tree, 'node_modules'));
    for (const f of [FP_TEST, FP_HELPER]) copyFileSync(f, join(tree, f));
    cwd = tree;
  }
  console.log(`▶ page fingerprints at ${sha === 'work' ? 'the working tree' : sha.slice(0, 8)}`);
  const workers = process.env.JEST_WORKERS ? [`--maxWorkers=${process.env.JEST_WORKERS}`] : [];
  const r = spawnSync('npx', ['jest', ...workers, '--ci', FP_TEST], {
    cwd,
    stdio: ['ignore', 'ignore', 'inherit'],
    env: { ...process.env, FINGERPRINT_OUT: out },
  });
  if (tree) {
    git(`worktree remove --force ${tree}`);
    rmSync(tree, { recursive: true, force: true });
  }
  if (r.status !== 0 || !existsSync(out)) return undefined;
  const result = JSON.parse(readFileSync(out, 'utf8'));
  if (sha === 'work') rmSync(out);
  return result;
}

const pageIds = new Set();
if (!quick && !full && (outputFiles.length || pictureFiles.length)) {
  const head = fingerprints('work');
  if (!head) full = true;
  if (!full && outputFiles.length) {
    const base = fingerprints(since);
    if (!base) full = true;
    else {
      for (const [id, f] of Object.entries(head)) if (base[id]?.h !== f.h) pageIds.add(id);
      console.log(
        `  ${outputFiles.length} engine or helper file(s) changed; ${pageIds.size} of ${Object.keys(head).length} pages say something different.`,
      );
      // Most pages changed: that is a full run anyway, without the long id list.
      if (pageIds.size > Object.keys(head).length / 2) full = true;
    }
  }
  if (!full && pictureFiles.length) {
    const kinds = new Set(
      Object.values(head)
        .map((f) => f.kind)
        .filter(Boolean),
    );
    for (const file of pictureFiles) {
      // The kinds a picture file names: its own name (FunctionGraph.tsx → functionGraph) and the
      // kind strings in it ('functionGraph', "normalCurve").
      const base = /([A-Za-z]+)\.tsx?$/.exec(file)?.[1] ?? '';
      const named = new Set([base.charAt(0).toLowerCase() + base.slice(1)]);
      if (existsSync(file)) {
        for (const m of readFileSync(file, 'utf8').matchAll(/['"`]([a-z][A-Za-z]+)['"`]/g))
          named.add(m[1]);
      }
      const hit = [...named].filter((k) => kinds.has(k));
      if (!hit.length) {
        full = true;
        break;
      }
      for (const [id, f] of Object.entries(head)) if (hit.includes(f.kind)) pageIds.add(id);
    }
  }
}

// --dry: print what would run, run nothing (the fingerprints are still made).
const dry = args.includes('--dry');
const run = (label, cmdArgs, env = {}) => {
  console.log(`▶ ${label}`);
  if (dry) {
    if (env.MODULE_IDS)
      console.log(
        `  MODULE_IDS=${env.MODULE_IDS.slice(0, 300)}${env.MODULE_IDS.length > 300 ? '…' : ''}`,
      );
    return;
  }
  // JEST_WORKERS=2 when the machine is shared (builders running in parallel).
  const workers = process.env.JEST_WORKERS ? [`--maxWorkers=${process.env.JEST_WORKERS}`] : [];
  const r = spawnSync('npx', ['jest', ...workers, ...cmdArgs], {
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

const heavy = [
  'src/data/modules/__tests__/modules.test.ts',
  'src/data/modules/__tests__/sampling.test.ts',
];
// The format check CI runs first (a misformatted doc stopped three nightly runs before any
// test): the files this push changed, or everything on a full run.
{
  const files = full ? ['.'] : [...new Set(changed)].filter((f) => existsSync(f));
  if (files.length) {
    console.log('▶ prettier --check');
    const r = dry
      ? { status: 0 }
      : spawnSync('npx', ['prettier', '--check', '--ignore-unknown', ...files], {
          stdio: 'inherit',
        });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }
}
run('every suite but the two heavy ones', [
  '--ci',
  '--testPathIgnorePatterns',
  ...heavy.map((f) => f.replace(/\./g, '\\.')),
]);
if (quick) {
  console.log(
    '▶ modules and sampling: nightly only (--heavy for the pages changed, --full for all)',
  );
} else if (full) {
  run('modules and sampling, every page', ['--ci', ...heavy]);
} else if (prefixes.size || pageIds.size) {
  // Pages under a changed grade prefix are covered by it already.
  const ids = [
    ...prefixes,
    ...[...pageIds].filter((id) => ![...prefixes].some((p) => id.startsWith(p))),
  ];
  const label =
    [...prefixes].join(',') + (pageIds.size ? ` + ${ids.length - prefixes.size} pages` : '');
  run(`modules and sampling for ${label}`, ['--ci', ...heavy], { MODULE_IDS: ids.join(',') });
} else {
  console.log('▶ modules and sampling: no page changed; skipped');
}

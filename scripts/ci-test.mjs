// The tests a push needs, not all of them every time:
//
//   node scripts/ci-test.mjs [--since <git ref>] [--full]
//
// The cheap suites (engine, selectors, standards, layouts, tracker, …) always run in full. The
// two heavy suites (modules.test.ts and sampling.test.ts, about 5 minutes together) run only for
// the grades whose data files changed since <ref> (MODULE_IDS prefixes from the paths:
// src/data/modules/math/7.ts → m.7., layouts/science7.ts → s.7., gallery*.ts → g.). They run in
// full when anything outside the grade data changed (the engine, a picture component, the
// harness, a shared helper) or with --full; the nightly workflow passes --full.
// CI passes --since to the commit before the push; locally the default is origin's copy of the
// current branch, so `node scripts/ci-test.mjs` before a push tests what the push carries.
import { execSync, spawnSync } from 'node:child_process';

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
for (const file of changed) {
  // Files that don't affect the module tests at all: docs, scripts, the app's screens.
  if (!/^(src|package\.json|pnpm-lock\.yaml|jest\.config|tsconfig)/.test(file)) continue;
  if (/^src\/app\//.test(file)) continue;
  if (/^src\/data\/modules\/__tests__\/(dump|docs)\.review\.test\.ts$/.test(file)) continue;
  const p = prefixOf(file);
  if (p === undefined || p === 'all') {
    full = true;
    break;
  }
  prefixes.add(p);
}

const run = (label, cmdArgs, env = {}) => {
  console.log(`▶ ${label}`);
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
run('every suite but the two heavy ones', [
  '--ci',
  '--testPathIgnorePatterns',
  ...heavy.map((f) => f.replace(/\./g, '\\.')),
]);
if (full) {
  run('modules and sampling, every page', ['--ci', ...heavy]);
} else if (prefixes.size) {
  const ids = [...prefixes].join(',');
  run(`modules and sampling for ${ids}`, ['--ci', ...heavy], { MODULE_IDS: ids });
} else {
  console.log('▶ modules and sampling: no grade data changed; skipped');
}

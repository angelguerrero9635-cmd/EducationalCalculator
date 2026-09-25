// Screenshots and automatic layout checks of module pages, for the AI reviewers.
//
//   pnpm build:web
//   NODE_PATH=$(npm root -g) node scripts/review-shots.mjs m.K.make-10 m.1.add-sub-20 [--prefix m.2.]
//     [--widths 390,1024] [--dark] [--out .review/shots]
//
// Uses the Playwright installed globally in the dev container (not a project dependency) and the
// pre-installed Chromium. Serves dist/ itself (like Vercel, via verify-ssr.mjs --serve). For each
// page and width it saves a full-page PNG and prints layout problems it can detect:
//   - horizontal scrolling (content wider than the screen)
//   - chart labels (SVG text) that overlap each other
//   - text or buttons that stick out past the screen edge
//   - page errors in the browser console
//   - Kindergarten–Grade 2 pages: letters standing for numbers ("a = 3", "(B)", "a + b"),
//     anywhere on the page, pictures included; those grades use names and numbers only
// It exits with code 1 when it finds any problem.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const widths = String(flag('--widths', '390,1024')).split(',').map(Number);
const out = flag('--out', '.review/shots');
const dark = args.includes('--dark');
const prefix = flag('--prefix', undefined);
const ids = args.filter(
  (a, i) => !a.startsWith('--') && !['--widths', '--out', '--prefix'].includes(args[i - 1]),
);
if (prefix) {
  // Every module whose id starts with the prefix, read from the built sitemap.
  const { readFileSync } = await import('node:fs');
  const xml = readFileSync('dist/sitemap.xml', 'utf8');
  for (const m of xml.matchAll(/\/skill\/([^<]+)</g)) {
    const id = decodeURIComponent(m[1]);
    if (id.startsWith(prefix)) ids.push(id);
  }
}
if (ids.length === 0) {
  console.log('Give module ids, or --prefix m.K.');
  process.exit(2);
}
mkdirSync(out, { recursive: true });

const port = 8800 + Math.floor(Math.random() * 100);
const server = spawn('node', ['scripts/verify-ssr.mjs', '--serve', String(port)], {
  stdio: 'ignore',
});
const base = `http://localhost:${port}`;
for (let i = 0; i < 50; i++) {
  try {
    await fetch(base);
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 100));
  }
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
});
let problems = 0;
try {
  for (const width of widths) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      colorScheme: dark ? 'dark' : 'light',
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    // Skip the first-launch onboarding once per page (it is stored in the browser).
    await page.goto(base + '/');
    await page
      .getByText('Skip', { exact: true })
      .click({ timeout: 5000 })
      .catch(() => {});
    for (const id of ids) {
      errors.length = 0;
      // A college topic ("<courseId>#<index>") lives on the course's topic page.
      const [courseId, topicIndex] = id.split('#');
      await page.goto(
        topicIndex === undefined
          ? `${base}/skill/${encodeURIComponent(id)}`
          : `${base}/course/${encodeURIComponent(courseId)}/topic/${topicIndex}`,
      );
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      const early = /^[ms]\.(K|1|2)\./.test(id);
      const found = await page.evaluate((early) => {
        const issues = [];
        const vw = document.documentElement.clientWidth;
        if (document.documentElement.scrollWidth > vw + 1) {
          issues.push(
            `page scrolls sideways (${document.documentElement.scrollWidth}px > ${vw}px)`,
          );
        }
        // Visible text and buttons past the right or left edge.
        for (const el of document.querySelectorAll('div[dir], [role="button"], input, svg')) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
            const text = (el.textContent ?? '').trim().slice(0, 40);
            if (text) issues.push(`sticks out past the screen: "${text}"`);
          }
        }
        // Overlapping chart labels inside each SVG.
        for (const svg of document.querySelectorAll('svg')) {
          const texts = [...svg.querySelectorAll('text')]
            .map((t) => ({ t: (t.textContent ?? '').trim(), r: t.getBoundingClientRect() }))
            .filter((x) => x.t && x.r.width > 0);
          for (let i = 0; i < texts.length; i++) {
            for (let j = i + 1; j < texts.length; j++) {
              const a = texts[i].r;
              const b = texts[j].r;
              const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
              const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
              if (w > 2 && h > 2) {
                issues.push(`chart labels overlap: "${texts[i].t}" and "${texts[j].t}"`);
              }
            }
          }
        }
        // K–2: no letters standing for numbers ("a = 3", "Bigger amount (B)", "a + b").
        if (early) {
          const text = [...document.querySelectorAll('div[dir], text, input')]
            .map((e) => e.textContent ?? '')
            .join('\n');
          const letter = /(^|[\s(])[A-Za-z] =|\([A-Za-z]\)|(^|\s)[b-zB-HJ-Z] [+−×÷] /gm;
          for (const m of text.matchAll(letter)) {
            const at = text.slice(Math.max(0, m.index - 20), m.index + 20).replace(/\s+/g, ' ');
            issues.push(`letter instead of words (K–2): "…${at.trim()}…"`);
          }
        }
        return [...new Set(issues)];
      }, early);
      const all = [...found, ...errors.map((e) => `page error: ${e}`)];
      const file = join(out, `${id.replace(/[^\w.~-]/g, '_')}-${width}${dark ? '-dark' : ''}.png`);
      await page.screenshot({ path: file, fullPage: true });
      problems += all.length;
      console.log(
        `${all.length ? 'PROBLEM' : 'ok     '} ${id} @${width}${dark ? ' dark' : ''} → ${file}`,
      );
      for (const issue of all) console.log(`        - ${issue}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
process.exit(problems ? 1 : 0);

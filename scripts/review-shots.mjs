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
        // Slider names or values cut short ("Layers above the ." / "100 th…").
        for (const s of document.querySelectorAll('[data-testid^="slider-"]')) {
          const col = s.parentElement;
          for (const t of col?.querySelectorAll('div[dir]') ?? []) {
            const text = (t.textContent ?? '').trim();
            if (t.scrollWidth > t.clientWidth + 1 || /[…]$|\.\.$/.test(text)) {
              issues.push(`slider text cut short: "${text.slice(0, 40)}"`);
            }
          }
        }
        // Tap targets inside the picture under 44 px (a K finger).
        const picture = document.querySelector('[data-testid^="input-"]')?.closest('div');
        for (const el of document.querySelectorAll(
          '[role="button"], [data-testid^="pic-"], [data-testid^="frame-"], [data-testid^="num-"], [data-testid^="row-"]',
        )) {
          const r = el.getBoundingClientRect();
          if (
            r.width > 0 &&
            r.height > 0 &&
            (r.width < 36 || r.height < 36) &&
            (!picture || !picture.contains(el))
          ) {
            const id = el.getAttribute('data-testid') ?? (el.textContent ?? '').trim().slice(0, 20);
            if (/^(pic|frame|num|row)-/.test(id)) {
              issues.push(
                `tap target under 36 px: ${id.replace(/-\d+$/, '')} (${Math.round(r.width)}×${Math.round(r.height)})`,
              );
              break;
            }
          }
        }
        return [...new Set(issues)];
      }, early);
      // One-screen rule at phone width: the picture, its sliders and the first input row
      // should fit 390 × 900 (the section header "Picture"/"Diagram" to the first input).
      let blocks = '';
      const fit = await page.evaluate(() => {
        const first = document.querySelector('[data-testid^="input-"]');
        if (!first) return null;
        // Section headers render as <h1 role="heading">, not <div dir>.
        const top = [...document.querySelectorAll('[role="heading"], div[dir]')].find((d) =>
          /^(Picture|Diagram|Chart|Table|Sort|Put in order|Explore|Record and look)$/.test(
            (d.textContent ?? '').trim(),
          ),
        );
        if (!top) return { missing: true };
        const y0 = top.getBoundingClientRect().top + window.scrollY;
        const bottom = (el) => Math.round(el.getBoundingClientRect().bottom + window.scrollY - y0);
        // Where the height goes: header → picture → sliders → first input, so a reviewer sees
        // which block to shorten without measuring.
        // The picture: the first drawing below the section header (the header's own icon and
        // the page's icons sit above it).
        const pic = [
          ...document.querySelectorAll(
            'svg, [data-testid^="pic-"], [data-testid^="cell-"], [data-testid^="row-"], [data-testid^="drag-"]',
          ),
        ]
          .map((el) => el.closest('div'))
          .find((el) => el && el.getBoundingClientRect().top + window.scrollY > y0 + 10);
        const slider = [...document.querySelectorAll('[data-testid^="slider-"]')].pop();
        const parts = [
          pic ? `picture ${bottom(pic)}` : '',
          slider ? `sliders ${bottom(slider)}` : '',
          `first input ${bottom(first)}`,
        ].filter(Boolean);
        return { span: bottom(first), parts: parts.join(' → ') };
      });
      if (fit?.missing) {
        // Never measure from the page top silently: a missing anchor is itself a finding.
        found.push('one-screen check: no section header found (Picture/Diagram/Chart/Table)');
      } else if (fit !== null) {
        blocks = fit.parts;
        if (width <= 400 && fit.span > 844) {
          found.push(
            `picture, sliders and first input span ${fit.span} px (over one 844 px screen): ${fit.parts}`,
          );
        }
      }
      // The controls a student has on this page, for the reviewers' interaction check.
      const controls = await page.evaluate(() =>
        [...document.querySelectorAll('[data-testid]')]
          .map((e) => e.getAttribute('data-testid') ?? '')
          .filter((t) =>
            /^(slider|drag|pic|frame|num|row|scene|card|bin|stage|bar|toggle)-/.test(t),
          )
          .map((t) => t.replace(/-\d+$/, '-n'))
          .filter((t, i, all) => all.indexOf(t) === i)
          .join(' '),
      );
      const all = [...found, ...errors.map((e) => `page error: ${e}`)];
      const file = join(out, `${id.replace(/[^\w.~-]/g, '_')}-${width}${dark ? '-dark' : ''}.png`);
      await page.screenshot({ path: file, fullPage: true });
      problems += all.length;
      console.log(
        `${all.length ? 'PROBLEM' : 'ok     '} ${id} @${width}${dark ? ' dark' : ''} → ${file}`,
      );
      for (const issue of all) console.log(`        - ${issue}`);
      console.log(`        controls: ${controls || '(none)'}`);
      if (blocks) console.log(`        blocks: ${blocks}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
process.exit(problems ? 1 : 0);

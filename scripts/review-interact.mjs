// What only shows in a browser: every scene of an exploration, and every drag handle dragged.
//
//   NODE_PATH=$(npm root -g) node scripts/review-interact.mjs --out .review/x <ids...>
//
// For each page: taps every scene chip and saves the picture (scenes/<id>-<n>.png); then drags
// each handle (testID drag-…) right and up and writes the input values before and after to
// drags.md, so a reviewer can see a point leave its line or a value land somewhere odd.
// drags.md marks as **ERROR**: a drag that leaves a "?" where a number was, changes or drops a
// typed value besides one it drives, or changes nothing; two handles drawn on top of each
// other; a handle with no drag- test id; and a scene shot under 100 px (not the picture).
// Uses the globally installed Playwright and the pre-installed Chromium; serves dist/ itself.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const at = args.indexOf('--out');
const out = at === -1 ? '.review/interact' : args[at + 1];
const ids = args.filter((a, i) => a !== '--out' && i !== at + 1);
mkdirSync(join(out, 'scenes'), { recursive: true });

const port = 8900 + Math.floor(Math.random() * 90);
const server = spawn('node', ['scripts/verify-ssr.mjs', '--serve', String(port)], {
  stdio: 'ignore',
});
const base = `http://localhost:${port}`;
for (let i = 0; i < 50; i++) {
  try {
    await fetch(base);
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 200));
  }
}
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
await page.goto(base + '/');
await page
  .getByText('Skip', { exact: true })
  .click({ timeout: 5000 })
  .catch(() => {});

const safe = (id) => id.replace(/[^\w.~-]/g, '_');
// Each box: its id, its value ("?" when empty) and its status (given, example, derived).
const boxes = () =>
  page.$$eval('input', (els) =>
    els.map((e) => ({
      id: (e.getAttribute('data-testid') ?? '').replace(/^input-/, ''),
      value: e.value || '?',
      status: e.getAttribute('data-status') ?? '',
    })),
  );
const typed = (b) => b.status === 'given' || b.status === 'example';
/**
 * What a drag broke: "?" left behind, a typed value changed or dropped besides the one the
 * handle drives (drag-<id> names it; otherwise a point's x and y, two, are allowed), or nothing
 * moved at all.
 */
function problems(before, after, handle) {
  const out = [];
  const blanked = before.filter((b, i) => b.value !== '?' && after[i]?.value === '?');
  if (blanked.length) out.push(`left ? in ${blanked.map((b) => b.id).join(', ')}`);
  const driven = handle.replace(/^drag-/, '');
  const named = before.some((b) => b.id === driven);
  const changed = before.filter(
    (b, i) => typed(b) && after[i] && (after[i].value !== b.value || !typed(after[i])),
  );
  const extra = named ? changed.filter((b) => b.id !== driven) : changed;
  const dropped = changed.filter((b) => !typed(after[before.indexOf(b)]));
  if (dropped.length || extra.length > (named ? 0 : 2))
    out.push(`changed typed ${(dropped.length ? dropped : extra).map((b) => b.id).join(', ')}`);
  if (before.every((b, i) => after[i]?.value === b.value)) out.push('nothing changed');
  return out;
}
const errors = [];
const lines = [
  '# Drags',
  '',
  'Each handle dragged 40 px right and 30 px up; the inputs before → after. **ERROR** lines',
  'are listed again at the end.',
  '',
];
let scenes = 0;
for (const id of ids) {
  await page.goto(`${base}/skill/${encodeURIComponent(id)}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  // Every scene of an exploration.
  const n = await page.locator('[data-testid^="scene-"]').count();
  for (let i = 0; i < n; i++) {
    await page.locator(`[data-testid="scene-${i}"]`).click();
    await page.waitForTimeout(120);
    // The picture is the largest drawing on the page (the first svg is the header's home icon).
    const sizes = await page
      .locator('svg')
      .evaluateAll((els) =>
        els.map((e) => e.getBoundingClientRect().width * e.getBoundingClientRect().height),
      );
    const biggest = sizes.indexOf(Math.max(...sizes, 0));
    const svg = page.locator('svg').nth(Math.max(0, biggest));
    const shot = await svg.boundingBox();
    if (!shot || shot.width < 100 || shot.height < 100) {
      errors.push(
        `- **ERROR** ${id} scene ${i}: the shot is ${shot ? `${Math.round(shot.width)}×${Math.round(shot.height)}` : 'missing'} px, not the picture`,
      );
    }
    await svg.screenshot({ path: join(out, 'scenes', `${safe(id)}-${i}.png`) }).catch(() => {});
    scenes++;
  }
  // A handle drawn without a drag- test id can't be dragged here.
  const unnamed = await page
    .locator('[aria-label^="Drag to change"]:not([data-testid^="drag-"])')
    .count();
  if (unnamed) errors.push(`- **ERROR** ${id}: ${unnamed} handle(s) with no drag- test id`);
  // Two handles on top of each other: the one underneath can't be grabbed.
  const rects = await page.locator('[data-testid^="drag-"]').evaluateAll((els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      return {
        h: e.getAttribute('data-testid'),
        x: r.x + r.width / 2,
        y: r.y + r.height / 2,
        s: r.width,
      };
    }),
  );
  rects.forEach((a, i) =>
    rects.slice(i + 1).forEach((b) => {
      if (Math.hypot(a.x - b.x, a.y - b.y) < a.s * 0.6)
        errors.push(
          `- **ERROR** ${id}: ${a.h} and ${b.h} overlap (centres ${Math.round(Math.hypot(a.x - b.x, a.y - b.y))} px apart)`,
        );
    }),
  );
  if (rects.length) lines.push(`- ${id} handles: ${rects.map((r) => r.h).join(', ')}`);
  // Every drag handle, from the page as it opens.
  const handles = await page
    .locator('[data-testid^="drag-"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')));
  for (const h of handles) {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    const before = await boxes();
    const box = await page.locator(`[data-testid="${h}"]`).first().boundingBox();
    if (!box) continue;
    const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 20, y - 15, { steps: 4 });
    await page.mouse.move(x + 40, y - 30, { steps: 4 });
    await page.mouse.up();
    await page.waitForTimeout(150);
    const after = await boxes();
    const bad = problems(before, after, h);
    const line = `${id} ${h}: ${before.map((b) => b.value).join(', ')} → ${after.map((b) => b.value).join(', ')}`;
    if (bad.length) {
      lines.push(`- **ERROR** ${line} (${bad.join('; ')})`);
      errors.push(`- **ERROR** ${id} ${h}: ${bad.join('; ')}`);
    } else lines.push(`- ${line}`);
  }
}
lines.push('', '## Errors', '', ...(errors.length ? errors : ['None.']));
writeFileSync(join(out, 'drags.md'), lines.join('\n') + '\n');
console.log(
  `${scenes} scenes in ${join(out, 'scenes')}; drags in ${join(out, 'drags.md')}; ${errors.length} errors`,
);
await browser.close();
server.kill();

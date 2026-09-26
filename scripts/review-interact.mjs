// What only shows in a browser: every scene of an exploration, and every drag handle dragged.
//
//   NODE_PATH=$(npm root -g) node scripts/review-interact.mjs --out .review/x <ids...>
//
// For each page: taps every scene chip and saves the picture (scenes/<id>-<n>.png); then drags
// each handle (testID drag-…) right and up and writes the input values before and after to
// drags.md, so a reviewer can see a point leave its line or a value land somewhere odd.
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
const values = () => page.$$eval('input', (els) => els.map((e) => e.value || '?'));
const lines = [
  '# Drags',
  '',
  'Each handle dragged 40 px right and 30 px up; the inputs before → after.',
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
    const svg = page.locator('svg').first();
    await svg.screenshot({ path: join(out, 'scenes', `${safe(id)}-${i}.png`) }).catch(() => {});
    scenes++;
  }
  // Every drag handle, from the page as it opens.
  const handles = await page
    .locator('[data-testid^="drag-"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')));
  for (const h of handles) {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    const before = await values();
    const box = await page.locator(`[data-testid="${h}"]`).first().boundingBox();
    if (!box) continue;
    const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 20, y - 15, { steps: 4 });
    await page.mouse.move(x + 40, y - 30, { steps: 4 });
    await page.mouse.up();
    await page.waitForTimeout(150);
    const after = await values();
    lines.push(`- ${id} ${h}: ${before.join(', ')} → ${after.join(', ')}`);
  }
}
writeFileSync(join(out, 'drags.md'), lines.join('\n') + '\n');
console.log(
  `${scenes} scenes in ${join(out, 'scenes')}; ${lines.length - 4} drags in ${join(out, 'drags.md')}`,
);
await browser.close();
server.kill();

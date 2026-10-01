// What only shows in a browser: every scene of an exploration, and every drag handle dragged.
//
//   NODE_PATH=$(npm root -g) node scripts/review-interact.mjs --out .review/x <ids...>
//
// For each page: taps every scene chip and saves the picture (scenes/<id>-<n>.png, and in dark
// mode scenes/<id>-<n>-dark.png); then drags
// each handle (testID drag-…) right and up and writes the input values before and after to
// drags.md, so a reviewer can see a point leave its line or a value land somewhere odd.
// drags.md marks as **ERROR**: a drag that leaves a "?" where a typed number was, changes or
// drops a typed value besides one it drives, changes nothing (no box and not the picture, even
// dragged further), or has a move event over 500 ms; two handles drawn on top of each other; a
// handle with no drag- test id; and a scene shot under 100 px (not the picture).
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
/** A phone-sized page past the first-launch onboarding, light or dark. */
async function phone(colorScheme) {
  const p = await browser.newPage({ viewport: { width: 390, height: 900 }, colorScheme });
  await p.goto(base + '/');
  await p
    .getByText('Skip', { exact: true })
    .click({ timeout: 5000 })
    .catch(() => {});
  return p;
}
const page = await phone('light');
// Explore scenes are shot in dark mode too (a figure's colours on the dark card).
const dark = await phone('dark');

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
 * What a drag broke: "?" left in a box that was typed (a worked-out box may go "?" by design,
 * as the other roots do while r is not a root), a typed value changed or dropped besides the
 * one the handle drives (drag-<id> names it; a handle on a worked-out value may drive one typed
 * value, named in `notes`; otherwise a point's x and y, two, are allowed), or nothing moved at
 * all (`live`: the picture changed, so the handle works; a drag-turn turns the view).
 */
function problems(before, after, handle, live, notes = []) {
  const out = [];
  const blanked = before.filter((b, i) => typed(b) && after[i]?.value === '?');
  if (blanked.length) out.push(`left ? in ${uniq(blanked.map((b) => b.id)).join(', ')}`);
  const driven = handle.replace(/^drag-/, '');
  const own = before.find((b) => b.id === driven);
  const changed = before.filter(
    (b, i) => typed(b) && after[i] && (after[i].value !== b.value || !typed(after[i])),
  );
  // (A value shown in two boxes counts once.)
  let extra = (own ? changed.filter((b) => b.id !== driven) : changed).filter(
    (b, i, all) => all.findIndex((o) => o.id === b.id) === i,
  );
  const dropped = changed.filter((b) => !typed(after[before.indexOf(b)]));
  // A handle on a worked-out value moves the one typed value behind it (h moves b).
  if (own && !typed(own) && !dropped.length && uniq(extra.map((b) => b.id)).length === 1) {
    notes.push(`drove ${extra[0].id}`);
    extra = [];
  }
  // A typed value now worked out to the same number: the drag made it worked out, no number
  // changed.
  const kept = (b) => after[before.indexOf(b)].value === b.value;
  const madeWorked = dropped.filter(kept);
  const lost = dropped.filter((b) => !kept(b));
  if (madeWorked.length)
    out.push(`made typed ${uniq(madeWorked.map((b) => b.id)).join(', ')} worked out`);
  if (lost.length || (!dropped.length && extra.length > (own ? 0 : 2)))
    out.push(`changed typed ${uniq((lost.length ? lost : extra).map((b) => b.id)).join(', ')}`);
  if (!live && handle !== 'drag-turn' && before.every((b, i) => after[i]?.value === b.value))
    out.push('nothing changed');
  return out;
}
const uniq = (xs) => [...new Set(xs)];
/** The picture: the largest drawing on the page (the first svg is the header's home icon). */
const picture = () =>
  page.$$eval('svg', (els) => {
    const area = (e) => e.getBoundingClientRect().width * e.getBoundingClientRect().height;
    const big = els.reduce((m, e) => (area(e) > area(m) ? e : m), els[0]);
    return big ? big.innerHTML : '';
  });
/** Drags the handle by (dx, dy) in two moves; the slowest move event in ms. */
async function dragBy(x, y, dx, dy) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  let slowest = 0;
  for (const k of [1, 2]) {
    const t = Date.now();
    await page.mouse.move(x + (dx * k) / 2, y + (dy * k) / 2, { steps: 4 });
    slowest = Math.max(slowest, (Date.now() - t) / 4);
  }
  await page.mouse.up();
  await page.waitForTimeout(150);
  return slowest;
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
  // Every scene of an exploration, light and then dark.
  const n = await page.locator('[data-testid^="scene-"]').count();
  if (n) await dark.goto(`${base}/skill/${encodeURIComponent(id)}`, { waitUntil: 'networkidle' });
  for (const [p, suffix] of n
    ? [
        [page, ''],
        [dark, '-dark'],
      ]
    : []) {
    for (let i = 0; i < n; i++) {
      await p.locator(`[data-testid="scene-${i}"]`).click();
      await p.waitForTimeout(120);
      // The picture is the largest drawing on the page (the first svg is the header's home icon).
      const sizes = await p
        .locator('svg')
        .evaluateAll((els) =>
          els.map((e) => e.getBoundingClientRect().width * e.getBoundingClientRect().height),
        );
      const biggest = sizes.indexOf(Math.max(...sizes, 0));
      const svg = p.locator('svg').nth(Math.max(0, biggest));
      const shot = await svg.boundingBox();
      if (!shot || shot.width < 100 || shot.height < 100) {
        errors.push(
          `- **ERROR** ${id} scene ${i}${suffix ? ' (dark)' : ''}: the shot is ${shot ? `${Math.round(shot.width)}×${Math.round(shot.height)}` : 'missing'} px, not the picture`,
        );
      }
      await svg
        .screenshot({ path: join(out, 'scenes', `${safe(id)}-${i}${suffix}.png`) })
        .catch(() => {});
      scenes++;
    }
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
    const shape = await picture();
    const slowest = await dragBy(x, y, 40, -30);
    let after = await boxes();
    let live = (await picture()) !== shape;
    const notes = [];
    // Nothing moved: a value that snaps (a turn in 90° steps) may need a longer drag.
    if (!live && before.every((b, i) => after[i]?.value === b.value)) {
      await dragBy(x + 40, y - 30, 80, -60);
      after = await boxes();
      live = (await picture()) !== shape;
      if (live) notes.push('moves in steps (a longer drag)');
    }
    const bad = problems(before, after, h, live, notes);
    // A move event over 500 ms freezes the page (a solver search on every move).
    if (slowest > 500) bad.push(`a move event took ${Math.round(slowest)} ms`);
    const line = `${id} ${h}: ${before.map((b) => b.value).join(', ')} → ${after.map((b) => b.value).join(', ')}`;
    if (bad.length) {
      lines.push(`- **ERROR** ${line} (${[...bad, ...notes].join('; ')})`);
      errors.push(`- **ERROR** ${id} ${h}: ${bad.join('; ')}`);
    } else lines.push(`- ${line}${notes.length ? ` (${notes.join('; ')})` : ''}`);
  }
}
lines.push('', '## Errors', '', ...(errors.length ? errors : ['None.']));
writeFileSync(join(out, 'drags.md'), lines.join('\n') + '\n');
console.log(
  `${scenes} scenes in ${join(out, 'scenes')}; drags in ${join(out, 'drags.md')}; ${errors.length} errors`,
);
await browser.close();
server.kill();

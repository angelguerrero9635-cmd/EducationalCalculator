// Drives every slider on every module page in the built site and checks it works: a tap near
// the top of the track raises the value, a tap near the bottom lowers it, a drag lands in
// between, the value stays in the slider's range, the value under the slider and the input
// box agree, and no page error fires. Run after `pnpm build:web`:
//   NODE_PATH=$(npm root -g) node scripts/test-sliders.mjs [--prefix m.4.] [--out file]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const prefix = flag('--prefix', undefined);
const outFile = flag('--out', '.review/sliders.md');
// Page ids given directly, else every module page (with the prefix) from the built sitemap.
const ids = args.filter(
  (a, i) => !a.startsWith('--') && !['--prefix', '--out'].includes(args[i - 1]),
);
if (ids.length === 0) {
  const xml = readFileSync('dist/sitemap.xml', 'utf8');
  for (const m of xml.matchAll(/\/skill\/([^<]+)</g)) {
    const id = decodeURIComponent(m[1]);
    if (id.startsWith(prefix ?? '')) ids.push(id);
  }
}

const port = 8900 + Math.floor(Math.random() * 100);
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

const num = (s) => {
  const m = /-?\d[\d,]*(?:\.\d+)?/.exec(String(s ?? '').replace(/−/g, '-'));
  return m ? Number(m[0].replace(/,/g, '')) : undefined;
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
});
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(base + '/');
await page
  .getByText('Skip', { exact: true })
  .click({ timeout: 5000 })
  .catch(() => {});

const lines = [];
let sliders = 0;
let pages = 0;
let bad = 0;

/** The slider's state from its accessibility attributes and the text under it. */
async function state(handle) {
  const s = await handle.evaluate((el) => {
    // The value text is the last child under the track (name, track, value).
    const value = el.parentElement?.querySelector(':scope > div:last-child')?.textContent ?? '';
    return {
      min: el.getAttribute('aria-valuemin'),
      max: el.getAttribute('aria-valuemax'),
      now: el.getAttribute('aria-valuenow'),
      text: (el.getAttribute('aria-valuetext') ?? value).trim(),
      name: el.getAttribute('aria-label') ?? '',
    };
  });
  return {
    ...s,
    min: s.min === null ? -Infinity : Number(s.min),
    max: s.max === null ? Infinity : Number(s.max),
    now: s.now === null ? num(s.text) : Number(s.now),
  };
}

async function tapAt(handle, fraction) {
  await handle.scrollIntoViewIfNeeded();
  const b = await handle.boundingBox();
  // fraction 0 = top of the track (max), 1 = bottom (min); inside the knob's travel.
  const y = b.y + 13 + fraction * (b.height - 26);
  await page.mouse.click(b.x + b.width / 2, y);
  await page.waitForTimeout(120);
}

async function dragTo(handle, fromFraction, toFraction) {
  await handle.scrollIntoViewIfNeeded();
  const b = await handle.boundingBox();
  const x = b.x + b.width / 2;
  const y0 = b.y + 13 + fromFraction * (b.height - 26);
  const y1 = b.y + 13 + toFraction * (b.height - 26);
  await page.mouse.move(x, y0);
  await page.mouse.down();
  await page.mouse.move(x, (y0 + y1) / 2, { steps: 4 });
  await page.mouse.move(x, y1, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(120);
}

/** The value in the input box for a variable, if the page has one. */
async function inputValue(id) {
  const box = page.locator(`[data-testid="input-${id}"]`);
  if ((await box.count()) === 0) return undefined;
  return box.first().inputValue();
}

try {
  for (const id of ids) {
    await page.goto(`${base}/skill/${encodeURIComponent(id)}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
    const handles = await page.locator('[data-testid^="slider-"]').all();
    if (handles.length === 0) continue;
    pages++;
    errors.length = 0;
    const issues = [];
    for (const h of handles) {
      sliders++;
      const varId = (await h.getAttribute('data-testid')).replace(/^slider-/, '');
      const before = await state(h);
      const tag = `${varId} (${before.name})`;
      if (!(before.max > before.min)) {
        issues.push(`${tag}: empty range ${before.min}–${before.max}`);
        continue;
      }
      if (before.now === undefined && before.text !== '?')
        issues.push(`${tag}: value "${before.text}" has no number`);
      // 1. Top: the value rises to (or near) the top of the range.
      await tapAt(h, 0);
      const top = await state(h);
      // 2. Bottom: the value falls.
      await tapAt(h, 1);
      const bottom = await state(h);
      // 3. Drag from the bottom to the middle.
      await dragTo(h, 1, 0.5);
      const mid = await state(h);
      // 4. Three taps down the track give values that never go up.
      const seq = [];
      for (const f of [0.25, 0.5, 0.75]) {
        await tapAt(h, f);
        seq.push((await state(h)).now);
      }
      const results = { top, bottom, mid };
      for (const [what, s] of Object.entries(results)) {
        if (s.text === '?' || Number.isNaN(s.now)) issues.push(`${tag}: ${what} tap left it "?"`);
        if (s.now < s.min - 1e-9 || s.now > s.max + 1e-9)
          issues.push(`${tag}: ${what} gave ${s.now}, outside ${s.min}–${s.max}`);
      }
      if (!(top.now > bottom.now)) {
        issues.push(
          `${tag}: doesn't move (top tap ${top.text}, bottom tap ${bottom.text}, range ${before.min}–${before.max})`,
        );
      } else {
        // The top and bottom taps may stop short of the range: the other values, held
        // still, decide how far a slider can go. What matters is that it moves and stops.
        // A slider with only two values (halves or fourths) has no middle.
        const distinct = new Set([top.now, bottom.now, mid.now, ...seq]).size;
        // The middle may equal the top when the upper half of the range is out of reach.
        if ((mid.now < bottom.now || mid.now > top.now) && distinct > 2)
          issues.push(
            `${tag}: drag to the middle gave ${mid.text} (bottom ${bottom.text}, top ${top.text})`,
          );
        if (seq[0] < seq[1] || seq[1] < seq[2])
          issues.push(`${tag}: taps down the track gave ${seq.join(' → ')} (should not rise)`);
      }
      // 5. The number under the slider matches the input box.
      const box = await inputValue(varId);
      if (
        box !== undefined &&
        box !== '' &&
        num(box) !== undefined &&
        num(mid.text) !== undefined
      ) {
        const last = (await state(h)).text;
        const boxNow = await inputValue(varId);
        if (Math.abs(num(boxNow) - num(last)) > 1e-6)
          issues.push(`${tag}: slider shows ${last} but the input box shows ${boxNow}`);
      }
    }
    for (const e of errors) issues.push(`page error: ${e}`);
    if (issues.length) {
      bad++;
      lines.push(`## ${id}`, ...issues.map((x) => `- ${x}`), '');
      console.log(`PROBLEM ${id}`);
      for (const x of issues) console.log(`  - ${x}`);
    } else {
      console.log(`ok      ${id} (${handles.length} sliders)`);
    }
  }
} finally {
  await browser.close();
  server.kill();
}
const summary = `${sliders} sliders on ${pages} pages; ${bad} pages with issues.`;
writeFileSync(outFile, [`# Slider test`, '', summary, '', ...lines].join('\n'));
console.log(summary);
process.exit(bad ? 1 : 0);

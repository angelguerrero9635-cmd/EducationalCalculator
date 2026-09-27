// Renders the project's own illustrations (assets/images/<topic>/<slug>.svg) to WebP, checks them,
// and rebuilds assets/images/manifest.json and the contact sheet.
//
//   NODE_PATH=$(npm root -g) node scripts/render-illustrations.mjs [--sheet out.png [topic ...]]
//     [--sheet out.png]   also draw a labeled sheet of the given topics (all when none), for review
//     [--contact]         redraw assets/images/contact-sheet.png from every file
//
// Every illustration is original artwork: an SVG drawn for this project (photos found online
// were used only as visual references, never traced or embedded). Each topic folder has a
// meta.json: [{ "slug", "title", "use", "references": [url, ...], "notes" }]. The script:
//   - fails when an SVG embeds an <image>, links to anything outside the file, or has no meta
//   - renders <slug>.webp beside the SVG, longest side 1200 px, under 250 KB
//   - writes manifest.json from the meta files plus the rendered sizes
// Uses the Playwright installed globally in the dev container (not a project dependency).
import { Buffer } from 'node:buffer';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = 'assets/images';
const MAX_SIDE = 1200;
const MAX_BYTES = 250_000;
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const sheet = flag('--sheet');
const topics = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--sheet');
const allTopics = readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory());

const problems = [];
function readMeta(topic) {
  try {
    return JSON.parse(readFileSync(join(ROOT, topic, 'meta.json'), 'utf8'));
  } catch (e) {
    if (!problems.some((p) => p.startsWith(`${topic}/meta.json`)))
      problems.push(`${topic}/meta.json: ${e.message}`);
    return [];
  }
}
const files = [];
for (const topic of allTopics) {
  const dir = join(ROOT, topic);
  const meta = readMeta(topic);
  const bySlug = new Map(meta.map((m) => [m.slug, m]));
  for (const name of readdirSync(dir)
    .filter((f) => f.endsWith('.svg'))
    .sort()) {
    const slug = name.slice(0, -4);
    const svg = readFileSync(join(dir, name), 'utf8');
    if (/<image\b/i.test(svg)) problems.push(`${topic}/${name}: embeds an <image>`);
    if (/(?:href|src)\s*=\s*["'](?!#)/i.test(svg))
      problems.push(`${topic}/${name}: links outside the file`);
    if (!/viewBox=/.test(svg)) problems.push(`${topic}/${name}: no viewBox`);
    if (!bySlug.has(slug)) problems.push(`${topic}/${name}: no entry in meta.json`);
    files.push({ topic, slug, svg, meta: bySlug.get(slug) ?? {} });
  }
  for (const m of meta) {
    if (!files.some((f) => f.topic === topic && f.slug === m.slug))
      problems.push(`${topic}/meta.json: ${m.slug} has no SVG`);
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<html><body></body></html>');
for (const f of files) {
  const res = await page.evaluate(
    async ({ svg, maxSide, maxBytes }) => {
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      await img.decode();
      const vb = new DOMParser()
        .parseFromString(svg, 'image/svg+xml')
        .documentElement.getAttribute('viewBox');
      const [, , w, h] = vb.split(/[\s,]+/).map(Number);
      const s = maxSide / Math.max(w, h);
      const c = document.createElement('canvas');
      c.width = Math.round(w * s);
      c.height = Math.round(h * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      let q = 0.92;
      let url;
      for (;;) {
        url = c.toDataURL('image/webp', q);
        if ((url.length * 3) / 4 < maxBytes || q < 0.4) break;
        q -= 0.06;
      }
      return { url, width: c.width, height: c.height };
    },
    { svg: f.svg, maxSide: MAX_SIDE, maxBytes: MAX_BYTES },
  );
  const out = join(ROOT, f.topic, `${f.slug}.webp`);
  writeFileSync(out, Buffer.from(res.url.split(',')[1], 'base64'));
  Object.assign(f, { width: res.width, height: res.height, bytes: statSync(out).size });
  if (f.bytes > MAX_BYTES) problems.push(`${out}: ${f.bytes} bytes`);
}

async function drawSheet(list, out, title) {
  const items = list.map((f) => ({
    label: f.slug,
    src:
      'data:image/webp;base64,' +
      readFileSync(join(ROOT, f.topic, `${f.slug}.webp`)).toString('base64'),
  }));
  const png = await page.evaluate(
    async ({ items, title }) => {
      const cols = Math.min(6, items.length);
      const cell = 220;
      const pad = 12;
      const labelH = 26;
      const top = 44;
      const c = document.createElement('canvas');
      c.width = cols * (cell + pad) + pad;
      c.height = top + Math.ceil(items.length / cols) * (cell + labelH + pad) + pad;
      const g = c.getContext('2d');
      g.fillStyle = '#fff';
      g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = '#111';
      g.font = 'bold 20px sans-serif';
      g.fillText(title, pad, 30);
      for (let i = 0; i < items.length; i++) {
        const img = new Image();
        img.src = items[i].src;
        await img.decode();
        const x = pad + (i % cols) * (cell + pad);
        const y = top + Math.floor(i / cols) * (cell + labelH + pad);
        g.fillStyle = '#f3f4f6';
        g.fillRect(x, y, cell, cell);
        const s = Math.min(cell / img.naturalWidth, cell / img.naturalHeight);
        const w = img.naturalWidth * s;
        const h = img.naturalHeight * s;
        g.drawImage(img, x + (cell - w) / 2, y + (cell - h) / 2, w, h);
        g.fillStyle = '#111';
        g.font = '13px sans-serif';
        g.fillText(items[i].label, x, y + cell + 17);
      }
      return c.toDataURL('image/png');
    },
    { items, title },
  );
  writeFileSync(out, Buffer.from(png.split(',')[1], 'base64'));
  console.log(`sheet: ${out}`);
}
const shown = files.filter((f) => !topics.length || topics.includes(f.topic));
if (sheet)
  await drawSheet(
    shown,
    sheet,
    `Illustrations: ${[...new Set(shown.map((f) => f.topic))].join(', ')}`,
  );

// The manifest always covers every topic, so rebuild it from all meta files and rendered sizes.
const manifest = [];
for (const topic of allTopics) {
  for (const m of readMeta(topic)) {
    const svgPath = join(ROOT, topic, `${m.slug}.svg`);
    const webpPath = join(ROOT, topic, `${m.slug}.webp`);
    const size = files.find((f) => f.topic === topic && f.slug === m.slug) ?? {};
    if (!size.width) continue;
    manifest.push({
      slug: m.slug,
      topic,
      title: m.title,
      svg: svgPath,
      file: webpPath,
      width: size.width,
      height: size.height,
      use: m.use,
      author: 'Original artwork made for EducationalCalculator',
      license: 'Owned by the project; no third-party content',
      references: m.references ?? [],
      notes: m.notes,
    });
  }
}
writeFileSync(join(ROOT, 'manifest.json'), JSON.stringify({ files: manifest }, null, 2) + '\n');

if (args.includes('--contact')) {
  const all = manifest.map((m) => ({ topic: m.topic, slug: m.slug }));
  await drawSheet(
    all,
    join(ROOT, 'contact-sheet.png'),
    `EducationalCalculator illustrations (${all.length})`,
  );
}
await browser.close();

console.log(`${files.length} rendered, ${manifest.length} in manifest`);
for (const p of problems) console.log(`PROBLEM ${p}`);
process.exit(problems.length ? 1 : 0);

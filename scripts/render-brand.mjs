// Renders the One Dollar University identity (assets/brand/*.svg) to the PNG and ICO files the
// app, the App Store and browsers need, and draws the contact sheet assets/brand/identity.png.
//
//   NODE_PATH=$(npm root -g) node scripts/render-brand.mjs [--sheet-only] [--brand dir] [--public dir]
//
// Each SVG is drawn on a canvas in the container's Chromium at its target size; the pixels are
// written by the small PNG encoder below (RGB for opaque files such as the app icon, which must
// have no alpha channel; RGBA for transparent ones), so the files carry no metadata. favicon.ico
// holds 16, 32 and 48 px PNGs. Uses the Playwright installed globally (not a project dependency).
import { Buffer } from 'node:buffer';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright')));
}

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : process.argv[i + 1];
};
const BRAND = arg('--brand', 'assets/brand');
const PUBLIC = arg('--public', 'public');

/** [output, source svg, size, opaque] */
const PNGS = [
  [`${BRAND}/mark.png`, `${BRAND}/mark.svg`, 512, false],
  [`${BRAND}/mark-dark.png`, `${BRAND}/mark-dark.svg`, 512, false],
  [`${BRAND}/mark-mono.png`, `${BRAND}/mark-mono.svg`, 512, false],
  [`${BRAND}/mark-small.png`, `${BRAND}/mark-small.svg`, 128, false],
  [`${BRAND}/mark-small-dark.png`, `${BRAND}/mark-small-dark.svg`, 128, false],
  [`${BRAND}/mark-small-mono.png`, `${BRAND}/mark-small-mono.svg`, 128, false],
  [`${BRAND}/icon.png`, `${BRAND}/icon.svg`, 1024, true],
  [`${BRAND}/icon-dark.png`, `${BRAND}/icon-dark.svg`, 1024, false],
  [`${BRAND}/icon-tinted.png`, `${BRAND}/icon-tinted.svg`, 1024, false],
  [`${BRAND}/adaptive-foreground.png`, `${BRAND}/adaptive-foreground.svg`, 432, false],
  [`${BRAND}/adaptive-background.png`, `${BRAND}/adaptive-background.svg`, 432, true],
  [`${BRAND}/adaptive-monochrome.png`, `${BRAND}/adaptive-monochrome.svg`, 432, false],
  [`${BRAND}/splash.png`, `${BRAND}/splash.svg`, 1024, false],
  [`${BRAND}/splash-dark.png`, `${BRAND}/splash-dark.svg`, 1024, false],
  [`${PUBLIC}/apple-touch-icon.png`, `${BRAND}/icon.svg`, 180, true],
  [`${PUBLIC}/icon-192.png`, `${BRAND}/icon.svg`, 192, true],
  [`${PUBLIC}/icon-512.png`, `${BRAND}/icon.svg`, 512, true],
  [`${PUBLIC}/icon-maskable-512.png`, `${BRAND}/icon-maskable.svg`, 512, true],
];
/** favicon.ico: [source svg, size] (the plain seal at 16, the seal with its book above) */
const ICO = [
  [`${BRAND}/mark-micro.svg`, 16],
  [`${BRAND}/mark-small.svg`, 32],
  [`${BRAND}/mark-small.svg`, 48],
];

// ---------------------------------------------------------------------------------------------
// PNG encoding
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePng(rgba, w, h, opaque) {
  const ch = opaque ? 3 : 4;
  const raw = Buffer.alloc((w * ch + 1) * h);
  for (let y = 0; y < h; y++) {
    const row = y * (w * ch + 1);
    raw[row] = 0;
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4;
      const d = row + 1 + x * ch;
      raw[d] = rgba[s];
      raw[d + 1] = rgba[s + 1];
      raw[d + 2] = rgba[s + 2];
      if (!opaque) raw[d + 3] = rgba[s + 3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = opaque ? 2 : 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
function encodeIco(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, png }, i) => {
    const e = 6 + 16 * i;
    head[e] = size >= 256 ? 0 : size;
    head[e + 1] = size >= 256 ? 0 : size;
    head.writeUInt16LE(1, e + 4); // planes
    head.writeUInt16LE(32, e + 6); // bits per pixel
    head.writeUInt32LE(png.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([head, ...images.map((i) => i.png)]);
}

// ---------------------------------------------------------------------------------------------
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<body style="margin:0"></body>');

/** Draws an SVG at size x size on a canvas and returns its RGBA pixels. */
async function rasterize(svgPath, size) {
  const svg = readFileSync(svgPath, 'utf8');
  if (/<image\b/i.test(svg) || /(?:href|src)\s*=\s*["'](?!#)/i.test(svg))
    throw new Error(`${svgPath}: embeds an image or links outside the file`);
  const pixels = await page.evaluate(
    async ({ src, size }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let bin = '';
      for (let i = 0; i < data.length; i += 0x8000)
        bin += String.fromCharCode.apply(null, data.subarray(i, i + 0x8000));
      return btoa(bin);
    },
    { src: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`, size },
  );
  return new Uint8Array(Buffer.from(pixels, 'base64'));
}

const sheetOnly = process.argv.includes('--sheet-only');
if (!sheetOnly) {
  for (const [out, src, size, opaque] of PNGS) {
    if (!existsSync(src)) {
      console.log(`skip ${out}: no ${src} yet`);
      continue;
    }
    const px = await rasterize(src, size);
    if (opaque) {
      for (let i = 3; i < px.length; i += 4)
        if (px[i] !== 255) throw new Error(`${out}: transparent pixel in an opaque icon`);
    }
    writeFileSync(out, encodePng(px, size, size, opaque));
    console.log(`${out}  ${size}  ${(statSync(out).size / 1024).toFixed(1)} KB`);
  }
  const icoImages = [];
  for (const [src, size] of ICO)
    icoImages.push({ size, png: encodePng(await rasterize(src, size), size, size, false) });
  writeFileSync(`${PUBLIC}/favicon.ico`, encodeIco(icoImages));
  console.log(`${PUBLIC}/favicon.ico  16 32 48`);
}

// ---------------------------------------------------------------------------------------------
// The contact sheet: every exported file at its real size, on light and dark grounds.
const b64 = (path) => readFileSync(path).toString('base64');
const uri = (path) =>
  `data:${path.endsWith('.svg') ? 'image/svg+xml' : path.endsWith('.ico') ? 'image/x-icon' : 'image/png'};base64,${b64(path)}`;
const tile = (path, label, bg, w, h) =>
  !existsSync(path)
    ? ''
    : `<figure style="margin:0;display:flex;flex-direction:column;gap:6px"><div style="background:${bg};padding:12px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #d9dce6"><img src="${uri(path)}" ${w ? `width="${w}"` : ''} ${h ? `height="${h}"` : ''} style="display:block"></div><figcaption>${label}</figcaption></figure>`;
const section = (title, tiles) =>
  `<section><h2>${title}</h2><div style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-end">${tiles.join('')}</div></section>`;
const L = '#F7F7FB';
const D = '#0B0C10';
const W = '#FFFFFF';
const size = (p) => {
  if (!existsSync(p)) return [0, 0];
  const m = readFileSync(p, 'utf8').match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return m ? [Number(m[1]), Number(m[2])] : [256, 256];
};
const svgTile = (p, bg, scale = 1) => {
  const [w, h] = size(p);
  return tile(
    p,
    `${p.split('/').pop()} (${Math.round(w * scale)} × ${Math.round(h * scale)})`,
    bg,
    w * scale,
    h * scale,
  );
};
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;padding:32px;font:13px/1.4 -apple-system,system-ui,sans-serif;color:#12131A;background:#FFFFFF}
h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:28px 0 10px}p{margin:0;color:#5B6172}
figcaption{color:#5B6172;font-size:12px}
</style></head><body>
<h1>One Dollar University: identity, round 1 (B1–B8)</h1>
<p>Every exported file at its real size (SVGs at their artboard size). Light ground #F7F7FB, dark ground #0B0C10.</p>
${section('B1 · The seal, its small versions and mono', [
  svgTile(`${BRAND}/mark.svg`, L),
  svgTile(`${BRAND}/mark-dark.svg`, D),
  svgTile(`${BRAND}/mark-mono.svg`, W),
  svgTile(`${BRAND}/mark-small.svg`, L, 0.25),
  svgTile(`${BRAND}/mark-small-dark.svg`, D, 0.25),
  svgTile(`${BRAND}/mark-small-mono.svg`, W, 0.25),
  svgTile(`${BRAND}/mark-micro.svg`, L, 0.125),
  svgTile(`${BRAND}/mark-micro-dark.svg`, D, 0.125),
  ...[16, 24, 28, 29, 32].map((s) =>
    tile(`${BRAND}/${s < 20 ? 'mark-micro' : 'mark-small'}.svg`, `${s} px`, L, s, s),
  ),
  ...[16, 24, 28, 29, 32].map((s) =>
    tile(`${BRAND}/${s < 20 ? 'mark-micro' : 'mark-small'}-dark.svg`, `${s} px`, D, s, s),
  ),
  ...[40, 64, 128].map((s) => tile(`${BRAND}/mark.svg`, `${s} px`, L, s, s)),
  ...[40, 64, 128].map((s) => tile(`${BRAND}/mark-dark.svg`, `${s} px`, D, s, s)),
])}
${section('B2 · Wordmark (height 24)', [
  svgTile(`${BRAND}/wordmark.svg`, L),
  svgTile(`${BRAND}/wordmark-dark.svg`, D),
])}
${section('B3 · Lockups (clear space: the U’s width on every side)', [
  svgTile(`${BRAND}/lockup.svg`, L),
  svgTile(`${BRAND}/lockup-dark.svg`, D),
  svgTile(`${BRAND}/lockup-stacked.svg`, L),
  svgTile(`${BRAND}/lockup-stacked-dark.svg`, D),
])}
${section('B4 / B8 · App icon (1024) and its iOS and Android variants', [
  tile(`${BRAND}/icon.png`, 'icon.png 1024 (opaque)', W),
  tile(`${BRAND}/icon-dark.png`, 'icon-dark.png 1024 (iOS dark)', D),
  tile(`${BRAND}/icon-tinted.png`, 'icon-tinted.png 1024 (iOS tinted)', '#3A3F4C'),
  tile(`${BRAND}/adaptive-foreground.png`, 'adaptive-foreground.png 432', '#C9CDD9'),
  tile(`${BRAND}/adaptive-background.png`, 'adaptive-background.png 432', W),
  tile(`${BRAND}/adaptive-monochrome.png`, 'adaptive-monochrome.png 432', '#3A3F4C'),
  ...[29, 40, 60].map((s) => tile(`${BRAND}/icon.png`, `icon at ${s} px`, W, s, s)),
])}
${section('B5 · Favicon', [
  tile(`${PUBLIC}/favicon.svg`, 'favicon.svg at 16 (light)', L, 16, 16),
  tile(`${PUBLIC}/favicon.svg`, 'favicon.svg at 32', L, 32, 32),
  tile(`${PUBLIC}/favicon.ico`, 'favicon.ico (16, 32, 48)', L, 16, 16),
  tile(`${PUBLIC}/favicon.ico`, 'favicon.ico at 32', L, 32, 32),
  tile(`${PUBLIC}/favicon.ico`, 'favicon.ico at 48', L, 48, 48),
])}
${section('B6 · Touch and PWA icons', [
  tile(`${PUBLIC}/apple-touch-icon.png`, 'apple-touch-icon.png 180', W),
  tile(`${PUBLIC}/icon-192.png`, 'icon-192.png', W),
  tile(`${PUBLIC}/icon-512.png`, 'icon-512.png', W),
  tile(`${PUBLIC}/icon-maskable-512.png`, 'icon-maskable-512.png (seal in the central 80 %)', W),
])}
${section('B7 · Splash (1024, transparent; shown at 200 pt)', [
  tile(`${BRAND}/splash.png`, 'splash.png on #F7F7FB', L),
  tile(`${BRAND}/splash-dark.png`, 'splash-dark.png on #0B0C10', D),
  tile(`${BRAND}/splash.png`, 'at 200 pt', L, 200, 200),
  tile(`${BRAND}/splash-dark.png`, 'at 200 pt', D, 200, 200),
])}
</body></html>`;
const sheet = await browser.newPage({ viewport: { width: 2300, height: 800 } });
await sheet.setContent(html);
await sheet.waitForLoadState('load');
await sheet.screenshot({ path: `${BRAND}/identity.png`, fullPage: true });
console.log(
  `${BRAND}/identity.png  ${(statSync(`${BRAND}/identity.png`).size / 1024).toFixed(0)} KB`,
);
await browser.close();

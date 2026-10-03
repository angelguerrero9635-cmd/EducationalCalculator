// The One Dollar University illustrations (B12–B22, B24) and Open Graph images (B9–B11).
//
//   NODE_PATH=$(npm root -g) node scripts/render-art.mjs [--no-png]
//
// Each illustration is drawn once below as a list of shapes whose colours are palette token
// names (src/theme.ts). From that one drawing the script writes:
//   - src/components/art/<Name>.tsx, a react-native-svg component reading usePalette(), so one
//     drawing serves light and dark;
//   - assets/brand/art/<file>.svg, the source in the light colours, and <file>.png and
//     <file>-dark.png renders at 2x (transparent);
//   - public/og/<name>.png (1200 x 630, opaque) and their sources assets/brand/og/<name>.svg;
//   - the contact sheet assets/brand/illustrations.png (light and dark grounds).
// PNGs are rasterised in the container's Chromium (Playwright, installed globally, not a project
// dependency) and written by the small encoder below, so they carry no metadata. The OG lines are
// Inter (SIL OFL) outlined with fontTools into scripts/brand-art/og-lines.json; the lockup and
// the slogan come from assets/brand and src/components/logoArt.ts. No font is needed.
import { Buffer } from 'node:buffer';
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const ART_TSX = 'src/components/art';
const ART_DIR = 'assets/brand/art';
const OG_SRC = 'assets/brand/og';
const OG_OUT = 'public/og';
const SHEET = 'assets/brand/illustrations.png';

// ---------------------------------------------------------------------------------------------
// Palette: read from src/theme.ts so the files match the app exactly.
function readPalette(name) {
  const src = readFileSync('src/theme.ts', 'utf8');
  const start = src.indexOf(`const ${name}`);
  const body = src.slice(start, src.indexOf('\n};', start));
  const out = {};
  for (const m of body.matchAll(/^\s+(\w+): '([^']+)',/gm)) out[m[1]] = m[2];
  return out;
}
const PALETTE = { light: readPalette('light'), dark: readPalette('dark') };

// ---------------------------------------------------------------------------------------------
// Drawing helpers. A shape is { el, fill?, stroke?, ...attributes }, colours as token names.
let SW = 2.5; // the outline width of the drawing being built
const r2 = (v) => Math.round(v * 100) / 100;
const n = (v) => String(r2(v));
const ink = (w = SW) => ({ stroke: 'artInk', strokeWidth: r2(w) });
const path = (d, fill = 'none', o = {}) => ({ el: 'path', d, fill, ...o });
const rect = (x, y, width, height, fill, o = {}) => ({
  el: 'rect',
  x: r2(x),
  y: r2(y),
  width: r2(width),
  height: r2(height),
  fill,
  ...o,
});
const circle = (cx, cy, r, fill, o = {}) => ({
  el: 'circle',
  cx: r2(cx),
  cy: r2(cy),
  r: r2(r),
  fill,
  ...o,
});
const ellipse = (cx, cy, rx, ry, fill, o = {}) => ({
  el: 'ellipse',
  cx: r2(cx),
  cy: r2(cy),
  rx: r2(rx),
  ry: r2(ry),
  fill,
  ...o,
});
const line = (x1, y1, x2, y2, o = {}) => ({
  el: 'line',
  x1: r2(x1),
  y1: r2(y1),
  x2: r2(x2),
  y2: r2(y2),
  ...ink(),
  ...o,
});
const g = (transform, children) => ({ el: 'g', transform, children: children.flat(9) });
/** A part: its fill, an optional shade or shine laid over it, then its outline. */
const part = (d, fill, tint, w = SW) => [
  path(d, fill),
  ...(tint ? [path(d, tint)] : []),
  path(d, 'none', ink(w)),
];
/** Places a drawing made at unit scale: strokes inside should use SW / s. */
function at(x, y, s, fn, rot = 0) {
  const keep = SW;
  SW = keep / s;
  const kids = fn();
  SW = keep;
  return g(`translate(${n(x)} ${n(y)})${rot ? ` rotate(${n(rot)})` : ''} scale(${n(s)})`, kids);
}
const pts = (list) => list.map(([x, y], i) => `${i ? 'L' : 'M'}${n(x)} ${n(y)}`).join('') + 'Z';
const rrect = (x, y, w, h, r) =>
  `M${n(x + r)} ${n(y)}H${n(x + w - r)}Q${n(x + w)} ${n(y)} ${n(x + w)} ${n(y + r)}V${n(y + h - r)}Q${n(x + w)} ${n(y + h)} ${n(x + w - r)} ${n(y + h)}H${n(x + r)}Q${n(x)} ${n(y + h)} ${n(x)} ${n(y + h - r)}V${n(y + r)}Q${n(x)} ${n(y)} ${n(x + r)} ${n(y)}Z`;
const backdrop = (cx, cy, r) => circle(cx, cy, r, 'accentSoft');
const groundShadow = (cx, cy, rx, ry = 5) => ellipse(cx, cy, rx, ry, 'artShade');

// ---------------------------------------------------------------------------------------------
// Objects, each at unit scale with its origin at the bottom centre unless noted.

/** A unit cube of side 1 (front face 0..1, depth 0.3 up and to the right), origin bottom left. */
function cube(x, y, s, fill) {
  const d = s * 0.3;
  const front = rrect(x, y - s, s, s, s * 0.08);
  const top = pts([
    [x, y - s],
    [x + d, y - s - d],
    [x + s + d, y - s - d],
    [x + s, y - s],
  ]);
  const side = pts([
    [x + s, y - s],
    [x + s + d, y - s - d],
    [x + s + d, y - d],
    [x + s, y],
  ]);
  return [...part(side, fill, 'artShade'), ...part(top, fill, 'artShine'), ...part(front, fill)];
}

/** A fraction bar, origin bottom left, w x h, split in `parts`, the first `filled` coloured. */
function fractionBar(w, h, parts, filled, fill = 'accent') {
  const cw = w / parts;
  const out = [];
  for (let i = 0; i < parts; i++) out.push(rect(i * cw, -h, cw, h, i < filled ? fill : 'artPaper'));
  out.push(rect(0, -h + h * 0.12, w, h * 0.22, 'artShine'));
  for (let i = 1; i < parts; i++) out.push(line(i * cw, -h, i * cw, 0, ink(SW * 0.8)));
  out.push(rect(0, -h, w, h, 'none', { ...ink(), rx: r2(h * 0.12) }));
  return out;
}

/** A protractor of radius r, centre at the origin (its straight edge on y = 0). */
function protractor(r, fill = 'artPaper') {
  const out = [path(`M${-r} 0A${r} ${r} 0 0 1 ${r} 0Z`, fill, { fillOpacity: 0.9 })];
  for (let a = 10; a < 180; a += 10) {
    const k = a % 90 === 0 ? 0.74 : a % 30 === 0 ? 0.82 : 0.88;
    const c = Math.cos((a * Math.PI) / 180);
    const s = Math.sin((a * Math.PI) / 180);
    out.push(line(r * c * k, -r * s * k, r * c * 0.97, -r * s * 0.97, ink(SW * 0.6)));
  }
  const ri = r * 0.34;
  out.push(path(`M${n(-ri)} 0A${n(ri)} ${n(ri)} 0 0 1 ${n(ri)} 0`, 'none', ink(SW * 0.8)));
  out.push(path(`M${-r} 0A${r} ${r} 0 0 1 ${r} 0Z`, 'none', ink()));
  out.push(line(0, 0, 0, -r * 0.16, ink(SW * 0.8)));
  return out;
}

/** A beaker 60 wide and 82 tall, origin bottom centre, liquid to `level` (0..1). */
function beaker(level = 0.45, tone = 'artTeal') {
  const L = -30;
  const R = 30;
  const top = -76;
  const ly = top * level;
  const body = `M${L} ${top}V-6Q${L} 0 ${L + 6} 0H${R - 6}Q${R} 0 ${R} -6V${top}`;
  return [
    path(`${body}Z`, 'accentSoft', { fillOpacity: 0.55 }),
    path(`M${L} ${n(ly)}H${R}V-6Q${R} 0 ${R - 6} 0H${L + 6}Q${L} 0 ${L} -6Z`, tone),
    path(`M${L} ${n(ly)}H${R}V${n(ly + 6)}H${L}Z`, 'artShine'),
    line(L, ly, R, ly, ink(SW * 0.8)),
    rect(L + 6, top + 8, 5, -top - 18, 'artShine', { rx: 2.5 }),
    ...[-16, -30, -44, -58].map((y, i) => line(R - (i % 2 ? 10 : 14), y, R - 2, y, ink(SW * 0.6))),
    path(body, 'none', ink()),
    path(`M${L - 6} ${top - 4}Q${L} ${top - 3} ${L} ${top + 2}`, 'none', ink()),
    path(`M${R} ${top + 2}Q${R} ${top - 3} ${R + 4} ${top - 4}`, 'none', ink()),
  ];
}

/** An Erlenmeyer flask 72 wide and 104 tall, origin bottom centre. */
function flask(tone = 'artTeal') {
  const body = 'M-10 -96L-10 -62L-33 -9Q-36 0 -26 0L26 0Q36 0 33 -9L10 -62L10 -96';
  const liquid = 'M-23.6 -32L-33 -9Q-36 0 -26 0L26 0Q36 0 33 -9L23.6 -32Z';
  return [
    path(`${body}Z`, 'accentSoft', { fillOpacity: 0.55 }),
    path(liquid, tone),
    path('M-23.6 -32H23.6L21 -26H-21Z', 'artShine'),
    line(-23.6, -32, 23.6, -32, ink(SW * 0.8)),
    circle(-8, -14, 3.2, 'artShine', ink(SW * 0.5)),
    circle(6, -20, 2.2, 'artShine', ink(SW * 0.5)),
    circle(12, -9, 2.6, 'artShine', ink(SW * 0.5)),
    path('M-5 -88V-66L-14 -45', 'none', { stroke: 'artShine', strokeWidth: 4 }),
    path(body, 'none', ink()),
    rect(-14, -102, 28, 7, 'artPaper', { ...ink(), rx: 3 }),
  ];
}

/** A graph card w x h, origin bottom left: axes, a light grid and a rising curve. */
function graphCard(w, h, kind = 'rise', o = {}) {
  const pad = 0.16;
  const x0 = w * pad;
  const y0 = -h * pad;
  const x1 = w * (1 - pad * 0.6);
  const y1 = -h * (1 - pad * 0.6);
  const out = [path(rrect(0, -h, w, h, Math.min(w, h) * 0.08), 'artPaper', ink())];
  for (let i = 1; i < 4; i++) {
    const gx = x0 + ((x1 - x0) * i) / 4;
    const gy = y0 + ((y1 - y0) * i) / 4;
    out.push(line(gx, y0, gx, y1, { stroke: 'artGrey', strokeWidth: r2(SW * 0.6) }));
    out.push(line(x0, gy, x1, gy, { stroke: 'artGrey', strokeWidth: r2(SW * 0.6) }));
  }
  const X = (t) => x0 + (x1 - x0) * t;
  const Y = (v) => y0 + (y1 - y0) * v;
  let f;
  if (kind === 'rise') f = (t) => 0.08 + 0.8 * t ** 2.2;
  else if (kind === 'wave') f = (t) => 0.5 + 0.34 * Math.sin(t * Math.PI * 2);
  else f = (t) => 0.1 + 0.75 * t;
  const N = 24;
  const curve = Array.from({ length: N + 1 }, (_, i) => [X(i / N), Y(f(i / N))]);
  out.push(
    line(x0, y0, x0, y1 - h * 0.04, ink()),
    line(x0, y0, x1 + w * 0.04, y0, ink()),
    path(curve.map(([x, y], i) => `${i ? 'L' : 'M'}${n(x)} ${n(y)}`).join(''), 'none', {
      stroke: o.curve ?? 'accent',
      strokeWidth: r2(SW * 1.4),
    }),
  );
  if (o.dot !== false) {
    const t = kind === 'wave' ? 0.25 : 0.7;
    out.push(circle(X(t), Y(f(t)), SW * 1.8, o.dotFill ?? 'gold', ink(SW * 0.8)));
  }
  return out;
}

/** A ruler w x h, origin bottom left, ticks along the top edge. */
function ruler(w, h, fill = 'gold') {
  const out = [path(rrect(0, -h, w, h, h * 0.14), fill)];
  out.push(rect(0, -h * 0.34, w, h * 0.34, 'artShade'));
  const step = w / 20;
  for (let i = 1; i < 20; i++) {
    const k = i % 5 === 0 ? 0.55 : 0.3;
    out.push(line(i * step, -h, i * step, -h + h * k, ink(SW * 0.6)));
  }
  out.push(path(rrect(0, -h, w, h, h * 0.14), 'none', ink()));
  return out;
}

/** A pencil of length L, lying along +x from the origin (the tip at x = L), thickness t. */
function pencil(L, t, body = 'accent') {
  const e = t * 1.1; // eraser
  const f = t * 0.7; // ferrule
  const cone = t * 1.7;
  const b0 = e + f;
  const b1 = L - cone;
  const hy = t / 2;
  return [
    ...part(rrect(0, -hy, e + 2, t, t * 0.3), 'artRose'),
    ...part(
      pts([
        [e, -hy],
        [b0, -hy],
        [b0, hy],
        [e, hy],
      ]),
      'artGrey',
      'artShine',
    ),
    line(e + f * 0.5, -hy, e + f * 0.5, hy, ink(SW * 0.6)),
    ...part(
      pts([
        [b0, -hy],
        [b1, -hy],
        [b1, hy],
        [b0, hy],
      ]),
      body,
    ),
    path(
      pts([
        [b0, -hy * 0.15],
        [b1, -hy * 0.15],
        [b1, hy],
        [b0, hy],
      ]),
      'artShade',
    ),
    path(
      pts([
        [b0, -hy],
        [b1, -hy],
        [b1, hy],
        [b0, hy],
      ]),
      'none',
      ink(),
    ),
    ...part(
      pts([
        [b1, -hy],
        [L, 0],
        [b1, hy],
      ]),
      'artWood',
    ),
    path(
      pts([
        [L - cone * 0.36, -hy * 0.36],
        [L, 0],
        [L - cone * 0.36, hy * 0.36],
      ]),
      'artInk',
    ),
  ];
}

/** A ten-frame card with `count` counters, origin bottom left, cell size c. */
function tenFrame(c, count, fill = 'accent') {
  const pad = c * 0.28;
  const w = c * 5 + pad * 2;
  const h = c * 2 + pad * 2;
  const out = [path(rrect(0, -h, w, h, c * 0.2), 'artPaper', ink())];
  for (let i = 0; i < 10; i++) {
    const cx = pad + (i % 5) * c;
    const cy = -h + pad + Math.floor(i / 5) * c;
    out.push(rect(cx, cy, c, c, 'none', ink(SW * 0.8)));
    if (i < count) {
      out.push(circle(cx + c / 2, cy + c / 2, c * 0.32, fill, ink(SW * 0.8)));
      out.push(circle(cx + c * 0.42, cy + c * 0.4, c * 0.09, 'artShine'));
    }
  }
  return out;
}

/** A small plant in a pot: pot 40 wide, 30 tall; leaves above. Origin bottom centre. */
function plant(pot = 'accent', leaf = 'artGreen') {
  const leafD = (x, y, a, l, w) => {
    const c = Math.cos((a * Math.PI) / 180);
    const s = Math.sin((a * Math.PI) / 180);
    const tx = x + c * l;
    const ty = y - s * l;
    const nx = -s * w;
    const ny = -c * w;
    const mx = (x + tx) / 2;
    const my = (y + ty) / 2;
    return `M${n(x)} ${n(y)}Q${n(mx + nx)} ${n(my + ny)} ${n(tx)} ${n(ty)}Q${n(mx - nx)} ${n(my - ny)} ${n(x)} ${n(y)}Z`;
  };
  return [
    path('M0 -30Q-2 -48 0 -64', 'none', ink()),
    ...part(leafD(0, -40, 145, 26, 9), leaf),
    ...part(leafD(0, -48, 40, 24, 8), leaf, 'artShade'),
    ...part(leafD(0, -60, 110, 22, 7), leaf),
    ...part(leafD(0, -62, 70, 18, 6), leaf, 'artShade'),
    ...part('M-17 -26L-13 0H13L17 -26Z', pot),
    path('M2 -26L4 0H13L17 -26Z', 'artShade'),
    path('M-17 -26L-13 0H13L17 -26Z', 'none', ink()),
    ...part(rrect(-21, -33, 42, 9, 2.5), pot, 'artShine'),
  ];
}

/** A gear: n teeth, outer radius R, centre at the origin. */
function gear(teeth, R, fill = 'artGrey') {
  const ri = R * 0.8;
  const p = [];
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const da = (Math.PI * 2) / teeth;
    for (const [f, r] of [
      [0.0, ri],
      [0.12, R],
      [0.43, R],
      [0.55, ri],
    ])
      p.push([Math.cos(a0 + da * f) * r, Math.sin(a0 + da * f) * r]);
  }
  return [
    ...part(pts(p), fill),
    circle(0, 0, R * 0.5, 'artShade'),
    circle(0, 0, R * 0.5, 'none', ink(SW * 0.8)),
    circle(0, 0, R * 0.2, 'artPaper', ink()),
  ];
}

/** A circuit board corner, w x h, origin top left; traces and pads in gold, a chip. */
function circuit(w, h, board = 'accent') {
  const out = [...part(rrect(0, 0, w, h, Math.min(w, h) * 0.1), board)];
  const traces = [
    `M${w * 0.1} ${h * 0.28}H${w * 0.4}L${w * 0.5} ${h * 0.4}`,
    `M${w * 0.1} ${h * 0.82}H${w * 0.3}L${w * 0.4} ${h * 0.7}`,
    `M${w * 0.82} ${h * 0.14}V${h * 0.3}`,
    `M${w * 0.9} ${h * 0.6}H${w * 0.78}`,
  ];
  for (const d of traces) out.push(path(d, 'none', { stroke: 'gold', strokeWidth: r2(SW * 1.1) }));
  for (const [x, y] of [
    [0.1, 0.28],
    [0.1, 0.82],
    [0.82, 0.14],
    [0.9, 0.6],
  ])
    out.push(circle(w * x, h * y, SW * 1.6, 'gold', ink(SW * 0.6)));
  const cx = w * 0.46;
  const cy = h * 0.36;
  const cw = w * 0.32;
  const ch = h * 0.4;
  for (let i = 0; i < 3; i++) {
    const yy = cy + ch * (0.22 + i * 0.28);
    out.push(line(cx - w * 0.05, yy, cx, yy, { stroke: 'artGrey', strokeWidth: r2(SW * 1.1) }));
    out.push(
      line(cx + cw, yy, cx + cw + w * 0.05, yy, { stroke: 'artGrey', strokeWidth: r2(SW * 1.1) }),
    );
  }
  out.push(path(rrect(cx, cy, cw, ch, 2), 'artInk', ink()));
  out.push(circle(cx + cw * 0.2, cy + ch * 0.2, SW * 0.7, 'artGrey'));
  return out;
}

/** A molecule: atoms and bonds, centre at the origin, unit size ~100. */
function molecule() {
  const atoms = [
    [0, 0, 18, 'accent'],
    [-40, -26, 12, 'artPaper'],
    [42, -24, 12, 'artPaper'],
    [6, 44, 14, 'gold'],
    [-34, 40, 9, 'artPaper'],
  ];
  const bonds = [
    [0, 1],
    [0, 2],
    [0, 3],
    [3, 4],
  ];
  const out = [];
  for (const [a, b] of bonds) {
    const [x1, y1] = atoms[a];
    const [x2, y2] = atoms[b];
    out.push(line(x1, y1, x2, y2, ink(SW * 2.6)));
    out.push(line(x1, y1, x2, y2, { stroke: 'artGrey', strokeWidth: r2(SW * 1.2) }));
  }
  for (const [x, y, r, f] of atoms) {
    out.push(circle(x, y, r, f, ink()));
    out.push(circle(x - r * 0.32, y - r * 0.34, r * 0.28, 'artShine'));
  }
  return out;
}

/** An integral: a card w x h with a curve and the area under it between a and b shaded. */
function integralCard(w, h) {
  const out = [path(rrect(0, -h, w, h, Math.min(w, h) * 0.08), 'artPaper', ink())];
  const x0 = w * 0.14;
  const y0 = -h * 0.16;
  const x1 = w * 0.92;
  const y1 = -h * 0.9;
  const X = (t) => x0 + (x1 - x0) * t;
  const f = (t) => 0.3 + 0.45 * Math.sin(t * Math.PI * 1.15) + 0.15 * t;
  const Y = (v) => y0 + (y1 - y0) * v;
  const N = 28;
  const curve = Array.from({ length: N + 1 }, (_, i) => [X(i / N), Y(f(i / N))]);
  const a = 0.25;
  const b = 0.75;
  const area = [[X(a), y0]];
  for (let i = 0; i <= 20; i++) {
    const t = a + ((b - a) * i) / 20;
    area.push([X(t), Y(f(t))]);
  }
  area.push([X(b), y0]);
  out.push(path(pts(area), 'accent', { fillOpacity: 0.3 }));
  for (let i = 1; i < 6; i++) {
    const t = a + ((b - a) * i) / 6;
    out.push(
      line(X(t), y0, X(t), Y(f(t)), {
        stroke: 'accent',
        strokeWidth: r2(SW * 0.5),
        strokeOpacity: 0.6,
      }),
    );
  }
  out.push(line(X(a), y0, X(a), Y(f(a)), ink(SW * 0.7)));
  out.push(line(X(b), y0, X(b), Y(f(b)), ink(SW * 0.7)));
  out.push(
    line(x0, y0, x0, y1 - h * 0.02, ink()),
    line(x0, y0, x1 + w * 0.03, y0, ink()),
    path(curve.map(([x, y], i) => `${i ? 'L' : 'M'}${n(x)} ${n(y)}`).join(''), 'none', {
      stroke: 'accent',
      strokeWidth: r2(SW * 1.4),
    }),
  );
  return out;
}

/** Round counters in a loose pile, centre at the origin. */
function counters(r) {
  const spots = [
    [-r * 1.9, r * 0.2, 'accent'],
    [0, -r * 0.4, 'gold'],
    [r * 2, r * 0.3, 'artGreen'],
    [-r, r * 1.9, 'gold'],
    [r * 1.05, r * 2.1, 'accent'],
  ];
  return spots.flatMap(([x, y, f]) => [
    ellipse(x, y + r * 0.22, r, r * 0.9, f, ink()),
    ellipse(x, y + r * 0.22, r, r * 0.9, 'artShade'),
    ellipse(x, y, r, r * 0.9, f, ink()),
    ellipse(x, y, r * 0.62, r * 0.55, 'none', ink(SW * 0.6)),
    ellipse(x - r * 0.3, y - r * 0.3, r * 0.22, r * 0.16, 'artShine'),
  ]);
}

/** An open book seen from the front, spine at the origin (bottom centre), half-width hw. */
function openBook(hw, depth, cover = 'accent') {
  const out = [];
  const h = depth;
  out.push(
    ...part(
      `M0 ${n(-h * 0.04)}Q${n(-hw * 0.5)} ${n(-h * 0.2)} ${n(-hw - 8)} ${n(-h * 0.06)}V${n(h * 0.14)}Q${n(-hw * 0.5)} ${n(-h * 0.02)} 0 ${n(h * 0.16)}Q${n(hw * 0.5)} ${n(-h * 0.02)} ${n(hw + 8)} ${n(h * 0.14)}V${n(-h * 0.06)}Q${n(hw * 0.5)} ${n(-h * 0.2)} 0 ${n(-h * 0.04)}Z`,
      cover,
    ),
  );
  for (const sgn of [-1, 1]) {
    const X = (k) => n(sgn * hw * k);
    const page = `M0 0C${X(0.25)} ${n(-h * 0.2)} ${X(0.6)} ${n(-h * 0.2)} ${X(1)} ${n(-h * 0.07)}V${n(-h * 0.94)}C${X(0.6)} ${n(-h * 1.08)} ${X(0.25)} ${n(-h * 1.08)} 0 ${n(-h * 0.86)}Z`;
    out.push(...part(page, 'artPaper', sgn > 0 ? 'artShade' : null));
    for (let i = 1; i <= 4; i++) {
      const dy = h * (0.16 * i);
      out.push(
        path(
          `M${X(0.12)} ${n(-h * 0.88 + dy)}C${X(0.3)} ${n(-h * 1.0 + dy)} ${X(0.6)} ${n(-h * 1.0 + dy)} ${X(0.86)} ${n(-h * 0.92 + dy)}`,
          'none',
          { stroke: 'artGrey', strokeWidth: r2(SW * 0.9) },
        ),
      );
    }
  }
  out.push(line(0, -h * 0.86, 0, 0, ink()));
  return out;
}

/** A magnifier: glass centre at the origin, radius r, handle down-right. */
function magnifier(r, inside = () => [], handle = 'accent') {
  const a = Math.PI / 4;
  const hx = Math.cos(a);
  const out = [];
  const h0 = r + SW;
  const h1 = r * 2.05;
  const hw = r * 0.2;
  const hand = pts([
    [h0 * hx - hw * hx, h0 * hx + hw * hx],
    [h0 * hx + hw * hx, h0 * hx - hw * hx],
    [h1 * hx + hw * hx, h1 * hx - hw * hx],
    [h1 * hx - hw * hx, h1 * hx + hw * hx],
  ]);
  out.push(...part(hand, handle));
  out.push(circle(0, 0, r, 'artPaper', { fillOpacity: 0.55 }));
  out.push(...inside());
  out.push(
    path(
      `M${n(-r * 0.62)} ${n(-r * 0.12)}A${n(r * 0.64)} ${n(r * 0.64)} 0 0 1 ${n(-r * 0.12)} ${n(-r * 0.62)}`,
      'none',
      { stroke: 'artShine', strokeWidth: r2(r * 0.16) },
    ),
  );
  out.push(circle(0, 0, r, 'none', { stroke: 'artGrey', strokeWidth: r2(r * 0.2) }));
  out.push(circle(0, 0, r + r * 0.1, 'none', ink()));
  out.push(circle(0, 0, r - r * 0.1, 'none', ink(SW * 0.8)));
  return out;
}

/** A "$" drawn as two strokes, centre at the origin, height h. */
function dollar(h, colour, w) {
  const s = h / 44;
  const S = (x, y) => `${n(x * s)} ${n(y * s)}`;
  return [
    path(
      `M${S(11, -12)}C${S(7, -18)} ${S(-12, -18)} ${S(-11, -7)}C${S(-10, 2)} ${S(11, -2)} ${S(11, 8)}C${S(11, 19)} ${S(-8, 19)} ${S(-12, 11)}`,
      'none',
      { stroke: colour, strokeWidth: r2(w) },
    ),
    line(0, -22 * s, 0, 22 * s, { stroke: colour, strokeWidth: r2(w) }),
  ];
}

/** A standing dollar coin, centre at the origin, radius r. */
function coin(r) {
  return [
    circle(r * 0.12, 0, r, 'goldDeep', ink()),
    circle(0, 0, r, 'gold', ink()),
    circle(0, 0, r * 0.8, 'none', { stroke: 'goldDeep', strokeWidth: r2(SW * 0.9) }),
    ...Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return line(
        Math.cos(a) * r * 0.86,
        Math.sin(a) * r * 0.86,
        Math.cos(a) * r * 0.94,
        Math.sin(a) * r * 0.94,
        {
          stroke: 'goldDeep',
          strokeWidth: r2(SW * 0.5),
        },
      );
    }),
    ...dollar(r * 0.95, 'goldDeep', r * 0.13),
    path(
      `M${n(-r * 0.62)} ${n(-r * 0.38)}A${n(r * 0.72)} ${n(r * 0.72)} 0 0 1 ${n(-r * 0.2)} ${n(-r * 0.7)}`,
      'none',
      {
        stroke: 'artShine',
        strokeWidth: r2(r * 0.09),
      },
    ),
  ];
}

/** A closed book lying flat: w x h, origin bottom left, cover colour, pages on the right. */
function lyingBook(w, h, cover) {
  return [
    ...part(rrect(0, -h, w, h, h * 0.22), cover),
    path(rrect(w * 0.08, -h + h * 0.18, w * 0.88, h * 0.64, h * 0.12), 'artPaper', ink(SW * 0.8)),
    ...[0.34, 0.5, 0.66].map((k) =>
      line(w * 0.12, -h + h * k, w * 0.94, -h + h * k, {
        stroke: 'artGrey',
        strokeWidth: r2(SW * 0.6),
      }),
    ),
    rect(w * 0.08, -h, w * 0.06, h, 'artShade'),
  ];
}

/** A padlock in `fg`, centre at the origin, size s (body width). */
function padlock(s, fg, hole) {
  return [
    path(
      `M${n(-s * 0.3)} ${n(-s * 0.1)}V${n(-s * 0.42)}A${n(s * 0.3)} ${n(s * 0.3)} 0 0 1 ${n(s * 0.3)} ${n(-s * 0.42)}V${n(-s * 0.1)}`,
      'none',
      {
        stroke: fg,
        strokeWidth: r2(s * 0.16),
        strokeLinecap: 'round',
      },
    ),
    path(rrect(-s / 2, -s * 0.16, s, s * 0.78, s * 0.14), fg),
    circle(0, s * 0.16, s * 0.1, hole),
    rect(-s * 0.04, s * 0.18, s * 0.08, s * 0.18, hole, { rx: r2(s * 0.03) }),
  ];
}

// ---------------------------------------------------------------------------------------------
// The illustrations. Each: id, name (component), file, w, h, stroke, describe, draw().
const ART = [
  {
    id: 'B12',
    name: 'HomeHero',
    file: 'home-hero',
    w: 480,
    h: 320,
    sw: 3,
    crop: { x: 0, y: 128, w: 480, h: 160 },
    what: 'A desk of learning objects rising from simple to advanced, left to right: counting blocks, a fraction bar, a protractor, a beaker and a graph with a curve.',
    draw() {
      const desk = 262;
      return [
        circle(250, 170, 150, 'accentSoft'),
        path('M70 196Q240 70 420 112', 'none', {
          stroke: 'accent',
          strokeWidth: 3,
          strokeDasharray: '2 10',
        }),
        path('M408 100L424 112L406 122', 'none', { stroke: 'accent', strokeWidth: 3 }),
        ...sparkle(92, 112, 10, 'gold'),
        ...sparkle(300, 66, 7, 'gold'),
        circle(176, 92, 4, 'accent'),
        circle(360, 76, 3, 'accent'),
        // the desk
        path(rrect(8, desk, 464, 22, 6), 'artGrey', ink()),
        path(`M8 ${desk}H472V${desk + 7}H8Z`, 'artPaper', ink()),
        // counting blocks
        groundShadow(64, desk, 52, 3),
        ...cube(24, desk, 28, 'accent'),
        ...cube(52, desk, 28, 'gold'),
        ...cube(38, desk - 28, 28, 'artTeal'),
        // fraction bar leaning on the protractor
        groundShadow(156, desk, 58, 3),
        at(100, desk, 1, () => fractionBar(116, 22, 4, 3), -21),
        // protractor
        at(236, desk, 1, () => protractor(50)),
        // beaker
        groundShadow(326, desk, 34, 3),
        at(324, desk, 1.05, () => beaker(0.42)),
        // graph on an easel
        line(398, desk, 410, 220, ink()),
        line(452, desk, 440, 220, ink()),
        at(376, 228, 1, () => graphCard(90, 92, 'rise')),
        rect(372, 226, 98, 7, 'artWood', { ...ink(), rx: 3 }),
      ];
    },
  },
  {
    id: 'B13',
    name: 'ExploreK12',
    file: 'explore-k12',
    w: 320,
    h: 200,
    sw: 2.5,
    what: 'A stack of school things: a ruler, a ten-frame with seven counters, a pencil on top, and a small plant.',
    draw() {
      const ground = 182;
      return [
        backdrop(160, 104, 92),
        groundShadow(160, ground + 1, 130, 4),
        at(30, ground, 1, () => ruler(200, 17)),
        at(50, ground - 17, 1, () => tenFrame(26, 7)),
        at(50, 104, 1, () => pencil(168, 14), -6),
        at(262, ground, 1.2, () => plant()),
        ...sparkle(262, 46, 7, 'gold'),
        circle(40, 66, 3.5, 'accent'),
      ];
    },
  },
  {
    id: 'B14',
    name: 'ExploreCollege',
    file: 'explore-college',
    w: 320,
    h: 200,
    sw: 2.5,
    what: 'A flask, the corner of a circuit board, a gear and a graph.',
    draw() {
      const ground = 182;
      return [
        backdrop(160, 104, 92),
        groundShadow(160, ground + 1, 130, 4),
        at(92, 84, 1, () => gear(10, 36)),
        at(28, 124, 1, () => circuit(124, 58)),
        at(206, ground, 1, () => graphCard(92, 112, 'wave')),
        at(168, ground, 1, () => flask()),
        ...sparkle(46, 52, 7, 'gold'),
        circle(290, 52, 3.5, 'accent'),
      ];
    },
  },
  {
    id: 'B15',
    name: 'OnboardingWelcome',
    file: 'onboarding-welcome',
    w: 600,
    h: 400,
    sw: 3.5,
    what: 'An open book from which three lesson pictures lift off (a number line with a slider knob, a beaker, a triangle with drag handles): pictures you can move.',
    draw() {
      return [
        circle(300, 200, 178, 'accentSoft'),
        // lift lines rising from the book
        ...[
          [206, 222, 194, 196],
          [300, 214, 310, 184],
          [394, 222, 420, 196],
        ].map(([x1, y1, x2, y2]) =>
          line(x1, y1, x2, y2, { stroke: 'accent', strokeWidth: 3.5, strokeDasharray: '2 12' }),
        ),
        // number line, tilted, with a knob
        at(
          62,
          156,
          1,
          () => [
            path(rrect(-14, -40, 228, 62, 12), 'artPaper', ink()),
            line(4, 0, 196, 0, ink()),
            path('M188 -7L198 0L188 7', 'none', ink()),
            ...[20, 56, 92, 128, 164].map((x) => line(x, -8, x, 8, ink(2.5))),
            line(20, 0, 128, 0, { stroke: 'accent', strokeWidth: 7 }),
            circle(128, 0, 11, 'accent', ink()),
            circle(128, 0, 4, 'artPaper'),
            path('M110 -26L100 -20L110 -14M146 -26L156 -20L146 -14', 'none', ink(2.5)),
          ],
          -9,
        ),
        // beaker
        at(344, 166, 1.3, () => beaker(0.5), 7),
        // triangle with drag handles
        at(
          452,
          214,
          1,
          () => [
            path('M0 0L104 0L0 -86Z', 'gold', ink()),
            path('M0 0L104 0L0 -86Z', 'artShine', { fillOpacity: 0 }),
            path('M0 -16H16V0', 'none', ink(2.5)),
            ...[
              [0, 0],
              [104, 0],
              [0, -86],
            ].map(([x, y]) => circle(x, y, 9, 'artPaper', ink(3))),
            circle(0, -86, 4, 'accent'),
          ],
          8,
        ),
        // the book
        groundShadow(300, 336, 196, 7),
        at(300, 318, 1, () => openBook(178, 82)),
        ...sparkle(92, 92, 11, 'gold'),
        ...sparkle(520, 120, 8, 'gold'),
        circle(250, 70, 5, 'accent'),
      ];
    },
  },
  {
    id: 'B16',
    name: 'EmptyShelf',
    file: 'empty-shelf',
    w: 240,
    h: 160,
    sw: 2.25,
    what: 'An empty bookshelf with one book leaning against its side.',
    draw() {
      return [
        backdrop(120, 80, 70),
        groundShadow(120, 146, 72, 4),
        // the bookcase
        ...part(rrect(52, 22, 136, 124, 5), 'artWood'),
        path(rrect(62, 32, 116, 50, 2), 'artShade'),
        path(rrect(62, 32, 116, 50, 2), 'none', ink()),
        path(rrect(62, 90, 116, 46, 2), 'artShade'),
        path(rrect(62, 90, 116, 46, 2), 'none', ink()),
        rect(58, 25, 124, 4, 'artShine', { rx: 2 }),
        // one book, leaning
        at(
          150,
          136,
          1,
          () => [
            ...part(rrect(0, -40, 13, 40, 2), 'accent'),
            rect(0, -32, 13, 4, 'gold'),
            rect(0, -12, 13, 4, 'gold'),
            path(rrect(0, -40, 13, 40, 2), 'none', ink()),
          ],
          18,
        ),
        line(176, 146, 182, 152, ink()),
        line(64, 146, 58, 152, ink()),
      ];
    },
  },
  {
    id: 'B17',
    name: 'NoResults',
    file: 'no-results',
    w: 240,
    h: 160,
    sw: 2.25,
    what: 'A magnifier over a blank card.',
    draw() {
      return [
        backdrop(120, 80, 70),
        at(
          68,
          34,
          1,
          () => [
            path(rrect(6, 6, 96, 100, 9), 'artShade'),
            path(rrect(0, 0, 96, 100, 9), 'artPaper', ink()),
            path(rrect(14, 14, 68, 72, 5), 'none', {
              stroke: 'artGrey',
              strokeWidth: 2,
              strokeDasharray: '5 6',
            }),
          ],
          -5,
        ),
        at(140, 86, 1, () => magnifier(30)),
        circle(48, 44, 3, 'accent'),
        ...sparkle(196, 38, 6, 'gold'),
      ];
    },
  },
  {
    id: 'B18',
    name: 'SearchStart',
    file: 'search-start',
    w: 240,
    h: 160,
    sw: 2.25,
    what: 'A magnifier over a worksheet with one line highlighted.',
    draw() {
      const bar = (x, y, w, f = 'artGrey') => rect(x, y, w, 6, f, { rx: 3 });
      return [
        backdrop(120, 80, 70),
        path(rrect(66, 26, 100, 116, 8), 'artShade'),
        path(rrect(60, 20, 100, 116, 8), 'artPaper', ink()),
        bar(74, 34, 46, 'accent'),
        bar(74, 50, 72),
        bar(74, 64, 62),
        rect(68, 75, 86, 14, 'gold', { rx: 4, fillOpacity: 0.55 }),
        bar(74, 79, 70, 'artInk'),
        bar(74, 96, 66),
        bar(74, 110, 72),
        bar(74, 124, 40),
        at(150, 82, 1, () =>
          magnifier(26, () => [
            rect(-24, -9, 48, 18, 'gold', { fillOpacity: 0.55 }),
            rect(-24, -5, 40, 10, 'artInk', { rx: 5 }),
          ]),
        ),
      ];
    },
  },
  {
    id: 'B19',
    name: 'PlansHeader',
    file: 'plans-header',
    w: 360,
    h: 160,
    sw: 2.5,
    what: 'A gold dollar coin standing beside a stack of three books.',
    draw() {
      const ground = 140;
      return [
        ellipse(180, 84, 150, 70, 'accentSoft'),
        groundShadow(186, ground + 1, 110, 4),
        at(98, ground, 1, () => lyingBook(132, 24, 'accent')),
        at(110, ground - 24, 1, () => lyingBook(116, 22, 'artRose')),
        at(102, ground - 46, 1, () => lyingBook(124, 20, 'artPaper')),
        at(276, ground - 44, 1, () => coin(43)),
        ...sparkle(318, 40, 8, 'gold'),
        ...sparkle(70, 50, 6, 'gold'),
        circle(232, 34, 3.5, 'accent'),
      ];
    },
  },
  {
    id: 'B20',
    name: 'PurchaseSuccess',
    file: 'purchase-success',
    w: 160,
    h: 160,
    sw: 2.5,
    what: 'The dollar coin from B19 with a check-mark badge; the check is a separate path for the draw animation.',
    draw() {
      return [
        backdrop(80, 80, 72),
        at(72, 74, 1, () => coin(48)),
        circle(116, 114, 25, 'success', { stroke: 'card', strokeWidth: 5 }),
        circle(116, 114, 22.5, 'none', ink()),
        { ...path(CHECK.d, 'none', { stroke: 'onAccent', strokeWidth: CHECK.width }), check: true },
      ];
    },
  },
  {
    id: 'B21',
    name: 'NotFoundArt',
    file: 'not-found',
    w: 320,
    h: 200,
    sw: 2.5,
    what: 'A number line that breaks off into a gap, with a small signpost.',
    draw() {
      const y = 132;
      return [
        backdrop(160, 100, 92),
        // ground on both sides of the gap
        path('M24 150H204L210 157L203 164L208 172H24Z', 'artGrey', ink()),
        path('M254 150H300V172H252L258 164L251 157Z', 'artGrey', ink()),
        // the signpost, behind the line
        rect(166, 48, 8, 102, 'artWood', ink()),
        path('M128 56H190L200 66L190 76H128Z', 'artPaper', ink()),
        path('M212 82H150L140 92L150 102H212Z', 'accent', ink()),
        line(140, 66, 176, 66, { stroke: 'artGrey', strokeWidth: 3 }),
        line(162, 92, 198, 92, { stroke: 'artShine', strokeWidth: 3 }),
        // the number line, breaking off at the gap
        line(30, y, 200, y, ink(3)),
        path(`M38 ${y - 7}L28 ${y}L38 ${y + 7}`, 'none', ink(3)),
        ...[52, 84, 116, 148, 180].map((x) => line(x, y - 8, x, y + 8, ink())),
        path(`M200 ${y - 7}L205 ${y - 2}L199 ${y + 2}L204 ${y + 7}`, 'none', ink(2)),
        circle(116, y, 7, 'accent', ink()),
        line(264, y, 292, y, { stroke: 'artGrey', strokeWidth: 3, strokeDasharray: '4 7' }),
        ...sparkle(70, 70, 8, 'gold'),
        circle(282, 50, 3.5, 'accent'),
      ];
    },
  },
  {
    id: 'B22',
    name: 'LockedLesson',
    file: 'locked-lesson',
    w: 160,
    h: 120,
    sw: 2,
    what: 'A lesson card with a soft gold padlock badge.',
    draw() {
      return [
        ellipse(80, 60, 72, 54, 'accentSoft'),
        path(rrect(28, 22, 92, 74, 8), 'artShade'),
        path(rrect(24, 18, 92, 74, 8), 'artPaper', ink()),
        path(rrect(32, 26, 76, 32, 4), 'accentSoft', ink(1.5)),
        path('M38 52Q54 50 62 42T98 32', 'none', { stroke: 'accent', strokeWidth: 3 }),
        rect(32, 66, 56, 5, 'artGrey', { rx: 2.5 }),
        rect(32, 77, 40, 5, 'artGrey', { rx: 2.5 }),
        circle(116, 86, 21, 'gold', { stroke: 'card', strokeWidth: 4 }),
        circle(116, 86, 19, 'none', ink()),
        at(116, 88, 1, () => padlock(17, 'onGold', 'gold')),
      ];
    },
  },
  {
    id: 'B24',
    name: 'Unplugged',
    file: 'unplugged',
    w: 240,
    h: 160,
    sw: 2.25,
    what: 'A plug pulled out of its socket (error, offline).',
    draw() {
      return [
        backdrop(120, 80, 70),
        // the socket on the wall
        path(rrect(160, 44, 52, 70, 10), 'artPaper', ink()),
        path(rrect(167, 51, 38, 56, 8), 'artGrey', ink(1.5)),
        rect(176, 66, 5, 14, 'artInk', { rx: 2 }),
        rect(191, 66, 5, 14, 'artInk', { rx: 2 }),
        circle(186, 94, 3, 'artInk'),
        // the cord and plug
        path('M20 140C60 140 50 84 92 84', 'none', ink(6.5)),
        path('M20 140C60 140 50 84 92 84', 'none', { stroke: 'accent', strokeWidth: 3 }),
        rect(132, 75, 16, 5, 'gold', ink(1.5)),
        rect(132, 88, 16, 5, 'gold', ink(1.5)),
        ...part(rrect(90, 70, 44, 28, 7), 'accent'),
        rect(96, 74, 30, 4, 'artShine', { rx: 2 }),
        // the gap
        ...[
          [152, 60, 146, 52],
          [154, 84, 148, 84],
          [152, 108, 146, 116],
        ].map(([x1, y1, x2, y2]) => line(x1, y1, x2, y2, ink(2.25))),
        ...sparkle(56, 42, 7, 'gold'),
      ];
    },
  },
];

/** A four-point sparkle (decoration). */
function sparkle(cx, cy, r, fill) {
  const k = r * 0.28;
  return [
    path(
      `M${n(cx)} ${n(cy - r)}Q${n(cx + k)} ${n(cy - k)} ${n(cx + r)} ${n(cy)}Q${n(cx + k)} ${n(cy + k)} ${n(cx)} ${n(cy + r)}Q${n(cx - k)} ${n(cy + k)} ${n(cx - r)} ${n(cy)}Q${n(cx - k)} ${n(cy - k)} ${n(cx)} ${n(cy - r)}Z`,
      fill,
    ),
  ];
}

/** B20's check stroke, separate for the draw animation. */
const CHECK = { d: 'M105.5 114.5L112.5 121.5L127 106.5', width: 5 };
CHECK.length = r2(Math.hypot(7, 7) + Math.hypot(14.5, 15));

// ---------------------------------------------------------------------------------------------
// Writers
const kebab = (k) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const SKIP = new Set(['el', 'children', 'check']);

function colour(theme, token) {
  if (token === 'none') return ['none', 1];
  const v = PALETTE[theme][token];
  if (!v) throw new Error(`no palette token ${token}`);
  const m = v.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
  if (!m) return [v, 1];
  const hex = `#${[m[1], m[2], m[3]].map((c) => Number(c).toString(16).padStart(2, '0')).join('')}`;
  return [hex.toUpperCase(), Number(m[4])];
}

function toSvg(shapes, theme) {
  return shapes
    .map((s) => {
      const attrs = [];
      let fo = s.fillOpacity ?? 1;
      let so = s.strokeOpacity ?? 1;
      for (const [k, v] of Object.entries(s)) {
        if (SKIP.has(k) || k === 'fillOpacity' || k === 'strokeOpacity') continue;
        if (k === 'fill' || k === 'stroke') {
          const [c, o] = colour(theme, v);
          attrs.push(`${k}="${c}"`);
          if (k === 'fill') fo *= o;
          else so *= o;
        } else attrs.push(`${kebab(k)}="${v}"`);
      }
      if (fo !== 1) attrs.push(`fill-opacity="${r2(fo)}"`);
      if (so !== 1) attrs.push(`stroke-opacity="${r2(so)}"`);
      if (s.el === 'g') return `<g ${attrs.join(' ')}>${toSvg(s.children, theme)}</g>`;
      return `<${s.el} ${attrs.join(' ')}/>`;
    })
    .join('');
}

const TAG = {
  path: 'Path',
  rect: 'Rect',
  circle: 'Circle',
  ellipse: 'Ellipse',
  line: 'Line',
  g: 'G',
};
function toJsx(shapes, depth, used) {
  const pad = '  '.repeat(depth);
  return shapes
    .map((s) => {
      used.add(TAG[s.el]);
      const props = [];
      for (const [k, v] of Object.entries(s)) {
        if (SKIP.has(k)) continue;
        if (k === 'fill' || k === 'stroke')
          props.push(v === 'none' ? `${k}="none"` : `${k}={c.${v}}`);
        else if (typeof v === 'number') props.push(`${k}={${v}}`);
        else props.push(`${k}="${v}"`);
      }
      if (s.check)
        return `${pad}<Path d={PURCHASE_CHECK.d} fill="none" stroke={c.onAccent} strokeWidth={PURCHASE_CHECK.width} strokeDasharray={PURCHASE_CHECK.length} strokeDashoffset={PURCHASE_CHECK.length * (1 - checkProgress)} />`;
      if (s.el === 'g')
        return `${pad}<G ${props.join(' ')}>\n${toJsx(s.children, depth + 1, used)}\n${pad}</G>`;
      return `${pad}<${TAG[s.el]} ${props.join(' ')} />`;
    })
    .join('\n');
}

function svgFile(a, shapes, theme, crop) {
  const vb = crop ? `${crop.x} ${crop.y} ${crop.w} ${crop.h}` : `0 0 ${a.w} ${a.h}`;
  const [w, h] = crop ? [crop.w, crop.h] : [a.w, a.h];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}"><g stroke-linecap="round" stroke-linejoin="round">${toSvg(shapes, theme)}</g></svg>\n`;
}

function tsxFile(a, shapes) {
  const used = new Set(['G']);
  const body = toJsx(shapes, 5, used);
  const isCheck = a.id === 'B20';
  const crop = a.crop;
  const imports = [...used].sort().join(', ');
  const propsType = [
    'width?: number',
    'label?: string',
    ...(crop ? ['band?: boolean'] : []),
    ...(isCheck ? ['checkProgress?: number'] : []),
  ];
  const propsNames = [
    ...(crop ? ['band = false'] : []),
    `width = ${crop ? 'band ? CROP.w : ' : ''}${a.w}`,
    'label',
    ...(isCheck ? ['checkProgress = 1'] : []),
  ];
  const doc = [
    `/**`,
    ` * ${a.id}: ${a.what}`,
    ` * Artboard ${a.w} x ${a.h}; \`width\` scales it. Decorative (hidden from screen readers) unless`,
    ` * a \`label\` is given. Colours come from the palette, so one drawing serves light and dark.`,
    ...(crop
      ? [
          ` * \`band\` crops it to the ${crop.w} x ${crop.h} strip of objects (shown at 360 x 120 on`,
          ` * phones).`,
        ]
      : []),
    ...(isCheck
      ? [
          ` * \`checkProgress\` (0 to 1) draws the check stroke; animate it, or animate`,
          ` * \`PURCHASE_CHECK\` with your own path, for the 400 ms check draw.`,
        ]
      : []),
    ` */`,
  ];
  const vb = crop
    ? `band ? '${crop.x} ${crop.y} ${crop.w} ${crop.h}' : '0 0 ${a.w} ${a.h}'`
    : `'0 0 ${a.w} ${a.h}'`;
  const ratio = crop ? `band ? CROP.h / CROP.w : ${a.h / a.w}` : `${a.h / a.w}`;
  return `// Generated by scripts/render-art.mjs from its drawing of ${a.id}; change the drawing there and rerun.
import { View } from 'react-native';
import Svg, { ${imports} } from 'react-native-svg';

import { usePalette } from '@/theme';
${crop ? `\nconst CROP = { w: ${crop.w}, h: ${crop.h} };\n` : ''}${
    isCheck
      ? `\n/** The check stroke on its own (artboard coordinates), for the draw animation. */\nexport const PURCHASE_CHECK = { d: '${CHECK.d}', width: ${CHECK.width}, length: ${CHECK.length} };\n`
      : ''
  }
${doc.join('\n')}
export function ${a.name}({
  ${propsNames.join(',\n  ')},
}: {
  ${propsType.join(';\n  ')};
}) {
  const c = usePalette();
  return (
    <View
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    >
      <Svg width={width} height={width * (${ratio})} viewBox={${vb}}>
        <G strokeLinecap="round" strokeLinejoin="round">
${body}
        </G>
      </Svg>
    </View>
  );
}
`;
}

// ---------------------------------------------------------------------------------------------
// Open Graph images (B9–B11), light only, 1200 x 630 with a 1080 x 566 safe area.
const OG_LINES = JSON.parse(readFileSync('scripts/brand-art/og-lines.json', 'utf8'));
const LOGO_ART = readFileSync('src/components/logoArt.ts', 'utf8');
const SLOGAN = (() => {
  const i = LOGO_ART.indexOf('export const SLOGAN');
  const block = LOGO_ART.slice(i, LOGO_ART.indexOf('};', i));
  return {
    d: block.match(/d: '([^']+)'/)[1],
    width: Number(block.match(/width: ([\d.]+)/)[1]),
    height: Number(block.match(/height: ([\d.]+)/)[1]),
  };
})();
const LOCKUP_SVG = readFileSync('assets/brand/lockup.svg', 'utf8');
const LOCKUP_W = Number(LOCKUP_SVG.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)[1]);
const LOCKUP_INNER = LOCKUP_SVG.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

const OG = [
  {
    id: 'B9',
    name: 'default',
    line: null,
    what: 'Lockup and slogan; a fraction bar, a beaker and a graph line on lavender.',
    objects() {
      return [
        at(712, 214, 1.9, () => fractionBar(116, 24, 4, 3), -8),
        at(704, 540, 1.7, () => graphCard(120, 136, 'rise')),
        groundShadow(1052, 540, 70, 6),
        at(1052, 540, 2.2, () => beaker(0.45)),
        ...sparkle(1096, 120, 14, 'gold'),
        circle(1000, 290, 6, 'accent'),
      ];
    },
  },
  {
    id: 'B10',
    name: 'k12',
    line: 'k12',
    what: 'As B9 with "Kindergarten to Grade 12": counters, a ruler and a fraction bar.',
    objects() {
      return [
        at(1016, 196, 1.9, () => counters(17)),
        at(704, 330, 1.75, () => fractionBar(112, 26, 3, 2), -8),
        at(712, 530, 1.8, () => ruler(226, 30), -6),
        ...sparkle(744, 120, 14, 'gold'),
        circle(1110, 372, 6, 'accent'),
      ];
    },
  },
  {
    id: 'B11',
    name: 'college',
    line: 'college',
    what: 'As B9 with "College courses": a circuit, a molecule and an integral curve.',
    objects() {
      return [
        at(700, 76, 1.6, () => circuit(124, 82)),
        at(1036, 224, 1.45, () => molecule()),
        at(716, 548, 1.85, () => integralCard(150, 116)),
        ...sparkle(1104, 470, 14, 'gold'),
        circle(1100, 110, 6, 'accent'),
      ];
    },
  },
];

function ogSvg(o) {
  SW = 5;
  const P = PALETTE.light;
  const lockW = 520;
  const k = lockW / LOCKUP_W;
  let y = o.line ? 196 : 232;
  const parts = [`<rect width="1200" height="630" fill="${P.card}"/>`];
  parts.push(`<rect x="660" y="32" width="508" height="566" rx="36" fill="${P.accentSoft}"/>`);
  parts.push(
    `<g stroke-linecap="round" stroke-linejoin="round">${toSvg(o.objects(), 'light')}</g>`,
  );
  parts.push(`<g transform="translate(60 ${y}) scale(${r2(k)})">${LOCKUP_INNER}</g>`);
  y += 40 * k + 34;
  const sScale = 3; // the slogan about 38 px tall, 446 px wide
  parts.push(
    `<g transform="translate(62 ${r2(y)}) scale(${r2(sScale)})"><path d="${SLOGAN.d}" fill="${P.accent}"/></g>`,
  );
  y += SLOGAN.height * sScale + 46;
  if (o.line) {
    const t = OG_LINES[o.line];
    const padX = 22;
    const padY = 14;
    parts.push(
      `<rect x="60" y="${r2(y)}" width="${r2(t.width + padX * 2)}" height="${r2(t.height + padY * 2)}" rx="${r2((t.height + padY * 2) / 2)}" fill="${P.accentSoft}"/>`,
      `<path transform="translate(${60 + padX} ${r2(y + padY)})" d="${t.d}" fill="${P.accentHover}"/>`,
    );
  }
  parts.push(`<rect x="60" y="566" width="88" height="8" rx="4" fill="${P.gold}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">${parts.join('')}</svg>\n`;
}

// ---------------------------------------------------------------------------------------------
// PNG encoding (no metadata chunks)
const CRC = new Uint32Array(256).map((_, i) => {
  let c = i;
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

// ---------------------------------------------------------------------------------------------
// Build
const svgs = {};
mkdirSync(ART_TSX, { recursive: true });
mkdirSync(ART_DIR, { recursive: true });
mkdirSync(OG_SRC, { recursive: true });
mkdirSync(OG_OUT, { recursive: true });

for (const a of ART) {
  SW = a.sw;
  const shapes = a.draw();
  const light = svgFile(a, shapes, 'light');
  const dark = svgFile(a, shapes, 'dark');
  writeFileSync(`${ART_DIR}/${a.file}.svg`, light);
  svgs[a.file] = { light, dark, w: a.w, h: a.h };
  if (a.crop) {
    svgs[`${a.file}-band`] = {
      light: svgFile(a, shapes, 'light', a.crop),
      dark: svgFile(a, shapes, 'dark', a.crop),
      w: a.crop.w,
      h: a.crop.h,
    };
  }
  writeFileSync(`${ART_TSX}/${a.name}.tsx`, tsxFile(a, shapes));
}
const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160"><path d="${CHECK.d}" fill="none" stroke="${PALETTE.light.onAccent}" stroke-width="${CHECK.width}" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`;
writeFileSync(`${ART_DIR}/purchase-success-check.svg`, checkSvg);
writeFileSync(
  `${ART_TSX}/index.ts`,
  `// The brand illustrations (B12–B22, B24), generated by scripts/render-art.mjs.\n${ART.map(
    (a) => `export { ${a.name}${a.id === 'B20' ? ', PURCHASE_CHECK' : ''} } from './${a.name}';`,
  ).join('\n')}\n`,
);
for (const o of OG) writeFileSync(`${OG_SRC}/${o.name}.svg`, ogSvg(o));
execSync(`npx prettier --log-level warn --write ${ART_TSX}`, { stdio: 'inherit' });

if (process.argv.includes('--no-png')) process.exit(0);

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright')));
}
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<body style="margin:0"></body>');

async function rasterize(svg, w, h) {
  if (/<image\b/i.test(svg) || /(?:href|src)\s*=\s*["'](?!#)/i.test(svg))
    throw new Error('an SVG embeds an image or links outside the file');
  const pixels = await page.evaluate(
    async ({ src, w, h }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      let bin = '';
      for (let i = 0; i < data.length; i += 0x8000)
        bin += String.fromCharCode.apply(null, data.subarray(i, i + 0x8000));
      return btoa(bin);
    },
    { src: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`, w, h },
  );
  return new Uint8Array(Buffer.from(pixels, 'base64'));
}

const report = (p) => console.log(`${p}  ${(statSync(p).size / 1024).toFixed(1)} KB`);
for (const a of ART) {
  const { light, dark } = svgs[a.file];
  for (const [svg, suffix] of [
    [light, ''],
    [dark, '-dark'],
  ]) {
    const out = `${ART_DIR}/${a.file}${suffix}.png`;
    writeFileSync(out, encodePng(await rasterize(svg, a.w * 2, a.h * 2), a.w * 2, a.h * 2, false));
    report(out);
  }
}
for (const o of OG) {
  const out = `${OG_OUT}/${o.name}.png`;
  const px = await rasterize(readFileSync(`${OG_SRC}/${o.name}.svg`, 'utf8'), 1200, 630);
  writeFileSync(out, encodePng(px, 1200, 630, true));
  report(out);
  if (statSync(out).size > 300 * 1024) throw new Error(`${out} is over 300 KB`);
}

// The contact sheet: the OG images, then every illustration on light and dark grounds.
const uri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const L = PALETTE.light;
const D = PALETTE.dark;
const fig = (src, w, h, bg, cap) =>
  `<figure><div style="background:${bg};padding:14px;border:1px solid #d9dce6;border-radius:10px"><img src="${src}" width="${w}" height="${h}" style="display:block"></div><figcaption>${cap}</figcaption></figure>`;
const ogFigs = OG.map((o) =>
  fig(
    `data:image/png;base64,${readFileSync(`${OG_OUT}/${o.name}.png`).toString('base64')}`,
    600,
    315,
    '#ffffff',
    `${o.id} · public/og/${o.name}.png (1200 × 630, shown at half size, ${(statSync(`${OG_OUT}/${o.name}.png`).size / 1024).toFixed(0)} KB)`,
  ),
).join('');
const artRows = ART.map((a) => {
  const s = svgs[a.file];
  const band = svgs[`${a.file}-band`];
  return `<div class="row"><h3>${a.id} · ${a.name} (${a.w} × ${a.h})</h3><div class="figs">${fig(uri(s.light), a.w, a.h, L.background, 'light, on background')}${fig(uri(s.light), a.w, a.h, L.card, 'light, on card')}${fig(uri(s.dark), a.w, a.h, D.background, 'dark, on background')}${fig(uri(s.dark), a.w, a.h, D.card, 'dark, on card')}${
    band
      ? fig(uri(band.light), 360, 120, L.background, 'band crop, phone 360 × 120') +
        fig(uri(band.dark), 360, 120, D.background, 'band crop, dark')
      : ''
  }</div></div>`;
}).join('');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;padding:32px;font:13px/1.4 -apple-system,system-ui,sans-serif;color:#12131A;background:#fff}
h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:28px 0 10px}h3{font-size:13px;margin:18px 0 6px}
p{margin:0;color:#5B6172}figure{margin:0;display:flex;flex-direction:column;gap:4px}
figcaption{color:#5B6172;font-size:12px}.figs{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end}
</style></head><body>
<h1>One Dollar University: link previews and illustrations, rounds 2 and 3 (B9–B22, B24)</h1>
<p>Open Graph images as exported; each illustration at its artboard size in the light and dark palettes.</p>
<h2>Round 2 · Open Graph images</h2><div class="figs">${ogFigs}</div>
<h2>Round 3 · Illustrations</h2>${artRows}
</body></html>`;
const sheet = await browser.newPage({ viewport: { width: 2400, height: 800 } });
await sheet.setContent(html);
await sheet.waitForLoadState('load');
const shot = await sheet.screenshot({ fullPage: true });
// Re-encode without the screenshot's own chunks.
const dims = { w: shot.readUInt32BE(16), h: shot.readUInt32BE(20) };
await page.setViewportSize({ width: 100, height: 100 });
const px = await page.evaluate(
  async ({ src, w, h }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;
    let bin = '';
    for (let i = 0; i < data.length; i += 0x8000)
      bin += String.fromCharCode.apply(null, data.subarray(i, i + 0x8000));
    return btoa(bin);
  },
  { src: `data:image/png;base64,${shot.toString('base64')}`, ...dims },
);
writeFileSync(SHEET, encodePng(new Uint8Array(Buffer.from(px, 'base64')), dims.w, dims.h, true));
report(SHEET);
await browser.close();

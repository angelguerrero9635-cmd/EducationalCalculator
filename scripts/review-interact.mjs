// What only shows in a browser: every scene of an exploration, and every drag handle dragged.
//
//   NODE_PATH=$(npm root -g) node scripts/review-interact.mjs --out .review/x <ids...>
//     [--unknowns-only <id,id,…>]
//
// For each page: taps every scene chip and saves the picture (scenes/<id>-<n>.png, and in dark
// mode scenes/<id>-<n>-dark.png); then drags each handle (testID drag-…) right and up and
// writes the input values before and after to drags.md, so a reviewer can see a point leave
// its line or a value land somewhere odd.
// drags.md marks as **ERROR**: a drag that leaves a "?" where a typed number was, changes or
// drops a typed value besides one it drives, changes nothing (no box and not the picture, even
// dragged further), or has a move event over 500 ms; two handles drawn on top of each other; a
// handle with no drag- test id; and a scene shot under 100 px (not the picture).
// Then each handle is dragged toward each end (left and down, then right and up, in one press
// each, 7 growing steps to 240 px), its lines under the 40 px line; **ERROR**: the handle
// unmounts or leaves the picture mid-drag, a value leaves its box's range (data-min,
// data-max), the driven value changes per px over 8 times as fast as on any earlier step (a
// runaway: the axes rescaling under the finger), a page error during the drag, a sentence
// calling the state impossible after release ("An orbit inside the body is not possible.",
// "This page only works when …"), and, after the drag to the right, the picture changing when
// the driven value is typed back as it reads (the picture and the box disagreed).
// unknowns.md: for each page (and each --unknowns-only page, which is not dragged), the first
// edit, made on each typed box in turn from the opening page: its own number typed again (a
// student leaving the example, which empties the boxes it does not keep), or, when that
// leaves no "?", the box cleared. The picture's text (svg text and caption) must not then
// show the example's value of a box now "?" (**ERROR**, naming the value and the text it is
// in). A number that is also a known box's value, or an axis tick (a bare number, percent,
// degrees or imaginary tick in a run of evenly spaced ones), is not flagged; 0 is never matched.
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
const only = args.indexOf('--unknowns-only');
const unknownsOnly = only === -1 ? [] : args[only + 1].split(',').filter(Boolean);
const ids = args.filter(
  (a, i) => a !== '--out' && i !== at + 1 && a !== '--unknowns-only' && i !== only + 1,
);
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
// Page errors (uncaught exceptions), for the end drags.
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e?.message ?? e).split('\n')[0]));
// Explore scenes are shot in dark mode too (a figure's colours on the dark card).
const dark = await phone('dark');

const safe = (id) => id.replace(/[^\w.~-]/g, '_');
// Each box: its id, its value ("?" when empty), its status (given, example, derived) and its
// range in the shown unit (data-min, data-max; null when it has none).
const boxes = () =>
  page.$$eval('input', (els) =>
    els.map((e) => {
      const bound = (name) => {
        const v = e.getAttribute(name);
        return v === null || v === '' ? null : Number(v);
      };
      return {
        id: (e.getAttribute('data-testid') ?? '').replace(/^input-/, ''),
        value: e.value || '?',
        status: e.getAttribute('data-status') ?? '',
        min: bound('data-min'),
        max: bound('data-max'),
      };
    }),
  );
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** Superscript digits and minus as plain ones ("⁻³⁴" → "-34"). */
const unsup = (s) =>
  s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, (ch) => (ch === '⁻' ? '-' : String(SUP.indexOf(ch))));
/** A number as a box shows it ("1,200", "−3.5", "2 1/4", "3/4", "4.7 × 10⁵"), or NaN. */
function parseShown(text) {
  const t = String(text).trim().replace(/−/g, '-').replace(/[,  ]/g, '');
  const sci = /^(-?\d*\.?\d+)\s*×\s*10(?:([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)|\^\(?(-?\d+)\)?)$/.exec(t);
  if (sci) return Number(sci[1]) * 10 ** Number(sci[2] ? unsup(sci[2]) : sci[3]);
  const mixed = /^(-?)(\d+) (\d+)\/(\d+)$/.exec(t);
  if (mixed) return (mixed[1] ? -1 : 1) * (Number(mixed[2]) + Number(mixed[3]) / Number(mixed[4]));
  const frac = /^(-?\d+)\/(\d+)$/.exec(t);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  return /^-?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : NaN;
}
/** Significant figures as written ("70.89" 4, "0.0035" 2, "1,200" 4). */
const figures = (t) => t.replace(/\D/g, '').replace(/^0+/, '').length;
/**
 * The numbers in a picture's text: { text, value } with the value unsigned (a sign may be said
 * in words, "1,200 J out"). Digits after a letter or "_" (p_0, H2O, t1) are a name, not a value.
 */
function numbersIn(s) {
  const re = /(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(\s*×\s*10(?:[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+|\^\(?[−-]?\d+\)?))?/g;
  const out = [];
  for (let m = re.exec(s); m; m = re.exec(s)) {
    const prev = s[m.index - 1] ?? '';
    if (/[A-Za-z_\d.]/.test(prev)) continue;
    // A DNA strand's ends (5′, 3′) are names, not numbers.
    if (/^[′']/.test(s.slice(m.index + m[0].length))) continue;
    const mant = m[1] + (m[2] ?? '');
    const value = parseShown(m[0].replace(/\s+/g, ' '));
    if (Number.isFinite(value)) out.push({ text: m[0], mant, value: Math.abs(value), at: m.index });
  }
  // A fraction "1/2" is one number, 0.5; its parts count too only when each has 2 or more
  // figures ("1240/250" holds λ = 250, "−1/2" holds no 1 or 2).
  const fracs = [];
  for (let i = 0; i + 1 < out.length; i++) {
    const [a, b] = [out[i], out[i + 1]];
    if (s.slice(a.at + a.text.length, b.at) !== '/' || /×/.test(a.text + b.text)) continue;
    fracs.push({ text: `${a.text}/${b.text}`, mant: '', value: a.value / b.value });
    if (figures(a.mant) < 2 || figures(b.mant) < 2) a.drop = b.drop = true;
  }
  return [...out.filter((n) => !n.drop), ...fracs];
}
/**
 * Whether a drawn number is a box's value: equal, or one rounded to the other's figures when
 * that has 3 or more (70.89 for 70.892; 1.2 is not 1.23).
 */
function sameNumber(p, boxText) {
  const b = Math.abs(parseShown(boxText));
  const a = p.value;
  if (!Number.isFinite(b) || b === 0) return false;
  const near = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(Math.abs(x), Math.abs(y));
  if (near(a, b)) return true;
  const fa = figures(p.mant);
  const fb = figures(boxText.replace(/\s*×.*$/, ''));
  if (fa >= 3 && fa < 16 && near(Number(b.toPrecision(fa)), a)) return true;
  return fb >= 3 && fb < 16 && near(Number(a.toPrecision(fb)), b);
}
/** The picture's text pieces: each svg text element, and each caption line. */
const pictureTexts = () =>
  page.$$eval('[data-testid="picture"]', (roots) => {
    const out = [];
    for (const root of roots) {
      const groups = new Map();
      const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const el = n.parentElement;
        if (!el) continue;
        const key = el.closest('text') ?? el;
        groups.set(key, (groups.get(key) ?? '') + n.textContent);
      }
      for (const t of groups.values()) if (t.trim()) out.push(t.trim().replace(/\s+/g, ' '));
    }
    return out;
  });
/**
 * Bare numbers (or a bare percent, degrees or imaginary tick: "40%", "4i") among the texts that sit in
 * a run of three evenly spaced ones: axis ticks.
 */
function tickValues(texts) {
  const bare = uniq(
    texts
      .filter((t) => /^[−-]?[\d,]*\.?\d+[%°iπ]?$/.test(t))
      .map((t) => parseShown(t.replace(/[%°iπ]$/, ''))),
  ).filter(Number.isFinite);
  const has = (x) => bare.some((y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x)));
  return bare.filter((p) =>
    bare.some((q) => {
      const d = q - p;
      return d !== 0 && (has(p + 2 * d) || has(p - d));
    }),
  );
}
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
/** A handle's centre relative to the picture's corner (scroll-proof), or null when gone. */
const handleAt = (h) =>
  page.$$eval(`[data-testid="${h}"]`, (els) => {
    const pic = document.querySelector('[data-testid="picture"]')?.getBoundingClientRect();
    const r = els[0]?.getBoundingClientRect();
    if (!r || r.width === 0) return null;
    return {
      x: r.x + r.width / 2 - (pic?.x ?? 0),
      y: r.y + r.height / 2 - (pic?.y ?? 0),
      size: r.width,
      w: pic?.width ?? Infinity,
      h: pic?.height ?? Infinity,
    };
  });
/** The other handle nearest a point (relative to the picture), as "N px from drag-…". */
async function nearest(h, p) {
  const { handles } = await pictureState();
  const d = handles
    .filter((o) => o.h !== h)
    .map((o) => ({ h: o.h, d: Math.hypot(o.x - p.x, o.y - p.y) }))
    .sort((a, b) => a.d - b.d)[0];
  const edge = Math.min(p.x, p.y, p.w - p.x, p.h - p.y);
  return [
    `last seen ${Math.round(edge)} px inside the picture's edge`,
    ...(d ? [`${Math.round(d.d)} px from ${d.h}`] : []),
  ].join(', ');
}
/** What the picture shows: its text and where its handles are. */
async function pictureState() {
  const texts = await pictureTexts();
  const handles = await page.$$eval('[data-testid^="drag-"]', (els) => {
    const pic = document.querySelector('[data-testid="picture"]')?.getBoundingClientRect();
    return els.map((e) => {
      const r = e.getBoundingClientRect();
      return {
        h: e.getAttribute('data-testid'),
        x: r.x + r.width / 2 - (pic?.x ?? 0),
        y: r.y + r.height / 2 - (pic?.y ?? 0),
      };
    });
  });
  return { texts, handles };
}
/** Types into a box as a student does (focus, type, leave it). */
async function typeInto(id, text) {
  const el = page.locator(`input[data-testid="input-${id}"]`).first();
  await el.click({ timeout: 3000 });
  // An example box empties on focus and comes back when left empty: clearing it is typing a
  // digit and deleting it.
  if (!text) await el.fill('1');
  await el.fill(text);
  await el.evaluate((e) => e.blur());
  await page.waitForTimeout(250);
}
/**
 * Sentences that call the state impossible: the picture's ("An orbit inside the body is not
 * possible.") and the boxes' refusals ("This page only works when …", "Must be at least …").
 */
const refusals = async () => {
  const pic = (await pictureTexts()).filter((t) => /\bnot possible\b|\bimpossible\b/i.test(t));
  const page_ = await page.$$eval('body', (els) =>
    (els[0]?.innerText ?? '')
      .split('\n')
      .filter((t) => /^(This page only works when|Must be at (least|most)) /.test(t.trim())),
  );
  return uniq([...pic, ...page_].map((t) => t.trim()));
};
const ENDS = [
  ['left and down', -1, 1],
  ['right and up', 1, -1],
];
// How far the pointer is from where it was pressed after each step, in px along x (and 3/4 of
// it along y): small steps first, so a runaway shows against them.
const REACH = [8, 16, 32, 64, 112, 176, 240];
const RUNAWAY = 8;
/**
 * The handle dragged toward each end in one press, in growing steps; what went wrong. After
 * the drag to the right, the driven value is typed back as it reads: a picture that then
 * changes was not showing its boxes.
 */
async function dragToEnds(h) {
  const out = [];
  const driven = h.replace(/^drag-/, '');
  for (const [name, sx, sy] of ENDS) {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    const start = await page.locator(`[data-testid="${h}"]`).first().boundingBox();
    if (!start) {
      out.push({ line: `to the ${name}: the handle is not on the page`, bad: [] });
      continue;
    }
    const before = await boxes();
    const own = before.findIndex((b) => b.id === driven);
    const errs = pageErrors.length;
    const saidBefore = await refusals();
    const bad = [];
    const [x, y] = [start.x + start.width / 2, start.y + start.height / 2];
    const trail = [before];
    // The pointer's path length at each step.
    const moved = [0];
    let [px, py] = [x, y];
    let at0 = await handleAt(h);
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (const [i, r] of REACH.entries()) {
      const k = i + 1;
      // Kept on the screen: past its edge the pointer would be lost.
      const tx = Math.min(388, Math.max(2, x + sx * r));
      const ty = Math.min(898, Math.max(2, y + sy * r * 0.75));
      await page.mouse.move(tx, ty, { steps: 3 });
      moved.push(moved[k - 1] + Math.hypot(tx - px, ty - py));
      [px, py] = [tx, ty];
      await page.waitForTimeout(40);
      trail.push(await boxes());
      const last = at0;
      const at = await handleAt(h);
      at0 = at;
      if (!at) {
        const near = last && (await nearest(h, last));
        bad.push(`the handle unmounted at step ${k}${near ? ` (${near})` : ''}`);
        break;
      }
      const m = at.size;
      if (at.x < -m || at.y < -m || at.x > at.w + m || at.y > at.h + m) {
        bad.push(`the handle left the picture at step ${k}`);
        break;
      }
    }
    await page.mouse.up();
    await page.waitForTimeout(200);
    const after = await boxes();
    const steps = trail.length;
    trail.push(after);
    if (pageErrors.length > errs) bad.push(`page error: ${pageErrors.slice(errs).join(' | ')}`);
    // A value out of its box's range, once per box.
    const outside = new Set();
    for (const t of trail)
      for (const b of t) {
        const v = parseShown(b.value);
        if (!Number.isFinite(v) || outside.has(b.id)) continue;
        const slack = 1e-9 * Math.max(1, Math.abs(v));
        if ((b.min !== null && v < b.min - slack) || (b.max !== null && v > b.max + slack)) {
          outside.add(b.id);
          bad.push(`${b.id} = ${b.value} is outside its range ${b.min ?? '−∞'} to ${b.max ?? '∞'}`);
        }
      }
    // A runaway: per px of pointer travel, the driven value (or each typed one when the
    // handle drives none by name) changes over RUNAWAY times as fast as on any earlier step.
    const watched = own >= 0 ? [own] : before.flatMap((b, i) => (typed(b) ? [i] : []));
    for (const i of watched) {
      const path = trail.slice(0, steps).map((t) => parseShown(t[i]?.value ?? '?'));
      let most = 0;
      for (let k = 1; k < path.length; k++) {
        const dist = moved[k] - moved[k - 1];
        const rate = Math.abs(path[k] - path[k - 1]) / dist;
        if (!Number.isFinite(rate) || dist < 1) continue;
        if (most > 0 && rate > RUNAWAY * most) {
          bad.push(
            `${before[i].id} ran away: ${trail[k - 1][i].value} → ${trail[k][i].value} over ${Math.round(dist)} px, ${Math.round(rate / most)} times as fast as before`,
          );
          break;
        }
        most = Math.max(most, rate);
      }
    }
    // The driven value's path, or that of each typed value that moved.
    const paths = (own >= 0 ? [own] : watched)
      .map((i) => [before[i].id, uniq(trail.map((t) => t[i]?.value ?? '?'))])
      .filter(([, p]) => own >= 0 || p.length > 1);
    const shown = paths.length
      ? paths.map(([v, p]) => `${v}: ${p.join(' → ')}`).join('; ')
      : 'no typed value moved';
    // After release: a sentence saying the state is impossible, in the picture or under a box.
    const said = new Set(saidBefore);
    for (const t of await refusals()) if (!said.has(t)) bad.push(`after release: "${t}"`);
    // After release: the driven value (or the first typed value that moved) typed back as it
    // reads must leave the picture as it is.
    const back =
      own >= 0
        ? own
        : after.findIndex((b, i) => typed(b) && b.value !== before[i]?.value && b.value !== '?');
    if (sx > 0 && back >= 0 && !bad.length) {
      const b = after[back];
      if (b && b.value !== '?' && b.status !== 'derived') {
        const was = await pictureState();
        await typeInto(b.id, b.value).catch(() => {});
        const now = await pictureState();
        // Only when typing it changed no box (on the example, typing leaves it and empties
        // the other boxes: that changes the picture by design).
        const same = (await boxes()).every((o, i) => o.value === after[i]?.value);
        const gone = was.texts.filter((t) => !now.texts.includes(t));
        const came = now.texts.filter((t) => !was.texts.includes(t));
        const shifted = was.handles.filter((p) => {
          const q = now.handles.find((o) => o.h === p.h);
          return q && Math.hypot(q.x - p.x, q.y - p.y) > 3;
        });
        if (same && (gone.length || came.length || shifted.length))
          bad.push(
            `after release the picture did not show its boxes: typing ${b.id} = ${b.value} changed it (${[
              ...gone.slice(0, 3).map((t) => `"${t}" →`),
              ...came.slice(0, 3).map((t) => `→ "${t}"`),
              ...shifted.map((p) => `${p.h} moved`),
            ].join(', ')})`,
          );
      }
    }
    out.push({ line: `to the ${name}: ${shown}`, bad });
  }
  return out;
}
/**
 * The first edit on each typed box in turn, from the opening page (its number typed again, or
 * the box cleared when that leaves no "?"): a number in the picture's text that is the
 * example's value of a box now "?" (and no known box's value, and no axis tick).
 */
async function unknowns(id) {
  const out = [];
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  const open = await boxes();
  const tried = uniq(
    open.filter((b) => typed(b) && Number.isFinite(parseShown(b.value))).map((b) => b.id),
  );
  for (const edited of tried) {
    const errs = pageErrors.length;
    let how = '';
    let now = open;
    for (const clear of [false, true]) {
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(200);
      if (!(await page.locator('[data-testid="picture"]').count())) return out;
      const was = open.find((b) => b.id === edited).value;
      how = clear ? `cleared ${edited}` : `typed ${edited} = ${was} again`;
      await typeInto(edited, clear ? '' : was).catch(() => {});
      now = await boxes();
      if (now.some((b) => b.value === '?')) break;
    }
    const unknown = open.filter(
      (b, i, all) =>
        now[i]?.value === '?' &&
        Number.isFinite(parseShown(b.value)) &&
        all.findIndex((o) => o.id === b.id) === i,
    );
    const known = now.filter((b) => b.value !== '?');
    const texts = await pictureTexts();
    const ticks = tickValues(texts).map(Math.abs);
    // Each drawn number that is a "?" box's example value, with the texts it is in.
    const found = new Map();
    for (const t of texts)
      for (const p of numbersIn(t)) {
        if (ticks.some((v) => Math.abs(v - p.value) <= 1e-9 * Math.max(1, v))) continue;
        if (known.some((b) => sameNumber(p, b.value))) continue;
        const us = unknown.filter((b) => sameNumber(p, b.value));
        if (!us.length) continue;
        const key = `${p.text} (the example's ${us.map((u) => `${u.id} = ${u.value}`).join(' or ')})`;
        found.set(key, uniq([...(found.get(key) ?? []), `"${t}"`]));
      }
    const hits = [...found].map(([k, ts]) => `${k} in ${ts.join(', ')}`);
    if (pageErrors.length > errs) hits.push(`page error: ${pageErrors.slice(errs).join(' | ')}`);
    out.push({
      line: `${id} ${how}: ? in ${unknown.map((b) => b.id).join(', ') || '(none)'}`,
      hits: uniq(hits),
    });
  }
  return out;
}
/** Boxes left "?" by a first edit: the picture must not draw the example's numbers for them. */
async function checkUnknowns(id) {
  for (const u of await unknowns(id)) {
    if (u.hits.length) {
      unknownLines.push(`- **ERROR** ${u.line}; the picture shows ${u.hits.join('; ')}`);
      unknownErrors.push(`- **ERROR** ${u.line}: ${u.hits.join('; ')}`);
    } else unknownLines.push(`- ${u.line}`);
  }
}
const errors = [];
const unknownLines = [
  '# Unknowns',
  '',
  'The first edit on each typed box in turn, from the opening page: its own number typed again',
  '(leaving the example), or the box cleared when that leaves no "?"; the boxes then "?".',
  "**ERROR**: the picture's text (svg text and caption) shows the example's value of a box",
  'that is now "?" (a known box\'s value and axis ticks are not flagged; 0 is never matched).',
  '',
];
const unknownErrors = [];
const lines = [
  '# Drags',
  '',
  'Each handle dragged 40 px right and 30 px up; the inputs before → after. Under it, the',
  'handle dragged toward each end (left and down, right and up; 7 growing steps to 240 px)',
  'with the driven value at each step. **ERROR** lines are listed again at the end.',
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
    // Then toward each end, where a runaway or a handle leaving the picture shows.
    for (const end of await dragToEnds(h)) {
      if (end.bad.length) {
        lines.push(`  - **ERROR** ${end.line} (${end.bad.join('; ')})`);
        errors.push(`- **ERROR** ${id} ${h} ${end.line.split(':')[0]}: ${end.bad.join('; ')}`);
      } else lines.push(`  - ${end.line}`);
    }
  }
  await checkUnknowns(id);
}
for (const id of unknownsOnly) {
  await page.goto(`${base}/skill/${encodeURIComponent(id)}`, { waitUntil: 'networkidle' });
  await checkUnknowns(id);
}
lines.push('', '## Errors', '', ...(errors.length ? errors : ['None.']));
writeFileSync(join(out, 'drags.md'), lines.join('\n') + '\n');
unknownLines.push('', '## Errors', '', ...(unknownErrors.length ? unknownErrors : ['None.']));
writeFileSync(join(out, 'unknowns.md'), unknownLines.join('\n') + '\n');
console.log(
  `${scenes} scenes in ${join(out, 'scenes')}; drags in ${join(out, 'drags.md')}; ${errors.length} errors; unknowns in ${join(out, 'unknowns.md')}; ${unknownErrors.length} errors`,
);
await browser.close();
server.kill();

/**
 * H94 (round 2, group G): the `functionGraph` options that reshape a family's curve, kept apart
 * from `functionGraphMath.ts` so the picture and the harness draw and check the same curve:
 * |f(x)| with the parts below the x-axis reflected, a horizontal factor b (y = a·f(b(x − h)) + k),
 * a domain kept from a value (x ≥ h, the inverse then drawn for the kept part only), and a
 * rational function by its coefficients, (px + q) ÷ (rx + s).
 */
import type {
  FunctionFamily,
  FunctionGraphSpec,
  NumOrVar,
} from '@/data/modules/typesFunctionGraph';
import type { RationalByCoefficients } from '@/data/modules/typesHs2g';

import type { Curve, Get, HandleDef, Interval, Tok } from './functionGraphMath';
import { fracText, numText, plain } from './functionGraphMath';

const MINUS = '−';
type Say = (v: NumOrVar | undefined, fallback: number, pi?: boolean) => string;
type Build = (fam: FunctionFamily, x: string) => Curve;

/** The families a horizontal factor b applies to. */
const SIDEWAYS = ['absolute', 'root', 'exponential', 'log'];
/** Stands for the input letter while a formula is rebuilt around b(x − h). */
const SLOT = '\u0001';

/** " + 3", " − 3" or "" for + k. */
const plusText = (k: number, s: string) =>
  k === 0 && s !== '?' ? '' : s.startsWith(MINUS) ? ` ${MINUS} ${s.slice(1)}` : ` + ${s}`;
/** A coefficient before a letter: "" for 1, "−" for −1, "(1/2)" for a fraction. */
const lead = (a: number, s: string) =>
  s === '?' ? '?' : a === 1 ? '' : a === -1 ? MINUS : s.includes('/') ? `(${s})` : s;
/** px + q as written: "2x + 1", "x − 3", "5" (p = 0). */
const linearText = (p: number, ps: string, q: number, qs: string, x: string) =>
  p === 0 && ps !== '?' ? qs : `${lead(p, ps)}${x}${plusText(q, qs)}`.replace(/^\+ /, '') || '0';

/** Maps text through every plain token of a formula (fractions, roots and cases too). */
const mapToks = (toks: Tok[], f: (s: string) => string): Tok[] =>
  toks.map((k) =>
    'frac' in k
      ? { frac: [mapToks(k.frac[0], f), mapToks(k.frac[1], f)] }
      : 'root' in k
        ? { ...k, body: mapToks(k.body, f) }
        : 'cases' in k
          ? { cases: k.cases.map((c) => ({ f: mapToks(c.f, f), when: mapToks(c.when, f) })) }
          : { ...k, t: f(k.t) },
  );

/**
 * (px + q) ÷ (rx + s) as the zero −q ÷ p, the pole −s ÷ r and the stretch p ÷ r (the family's
 * own curve), written with its coefficients. No handles: the coefficients have sliders.
 */
export function ratioCurve(
  fam: RationalByCoefficients,
  get: Get,
  say: Say,
  x: string,
  build: Build,
) {
  const [p, q, r, s] = [get(fam.p, 1), get(fam.q, 0), get(fam.r, 1), get(fam.s, 0)];
  const curve = build(
    {
      family: 'rational',
      a: (p || q) / (r || s),
      zeros: p ? [-q / p] : [],
      poles: r ? [-s / r] : [],
    },
    x,
  );
  const top = linearText(p, say(fam.p, 1), q, say(fam.q, 0), x);
  const bottom = linearText(r, say(fam.r, 1), s, say(fam.s, 0), x);
  return {
    ...curve,
    text: [{ frac: [[{ t: top }], [{ t: bottom }]] }] as Tok[],
    parent: undefined,
    key: undefined,
    handles: [],
  };
}

/** The ids of the values these options read (beside the family's own). */
export function reshapeVars(spec: FunctionGraphSpec): string[] {
  return [spec.horizontal, spec.restrict?.from, spec.restrict?.to].filter(
    (v): v is string => typeof v === 'string',
  );
}

/** The curve before |f(x)| and the kept domain: the picture draws it dashed under the result. */
export interface Reshaped {
  curve: Curve;
  /** The curve as it was before |f(x)| or the domain cut (undefined when neither is set). */
  ghost?: Curve;
  /** The inverse of a kept half of a vertex-form parabola, as written: h + √((x − k) ÷ a). */
  inverse?: Tok[];
  /** The horizontal factor b and the h it turns about; the kept domain's ends. */
  b?: number;
  h?: number;
  from?: number;
  to?: number;
}

/**
 * The family's curve with the options applied in order: the horizontal factor b, the kept
 * domain, then |f(x)|. With none set it is the family's curve, unchanged.
 */
export function reshape(
  spec: FunctionGraphSpec,
  get: Get,
  say: Say,
  x: string,
  build: Build,
): Reshaped {
  let curve = build(spec, x);
  const out: Reshaped = { curve };
  if (spec.horizontal !== undefined && SIDEWAYS.includes(spec.family)) {
    const b = get(spec.horizontal, 1);
    out.b = b;
    out.h = 'h' in spec ? get(spec.h, 0) : 0;
    if (b !== 0 && b !== 1) curve = sideways(spec, curve, b, get, say, x, build);
  }
  let ghost: Curve | undefined;
  if (spec.restrict) {
    const lo = spec.restrict.from === undefined ? -Infinity : get(spec.restrict.from, 0);
    const hi = spec.restrict.to === undefined ? Infinity : get(spec.restrict.to, 0);
    out.from = Number.isFinite(lo) ? lo : undefined;
    out.to = Number.isFinite(hi) ? hi : undefined;
    ghost = curve;
    curve = kept(curve, lo, hi);
    out.inverse = keptInverse(spec, get, say, x, lo, hi);
  }
  if (spec.abs) {
    ghost ??= curve;
    curve = absolute(curve);
  }
  out.curve = curve;
  out.ghost = ghost;
  return out;
}

/** y = a·f(b(x − h)) + k: every x of the family's curve moved to h + (x − h) ÷ b. */
function sideways(
  spec: FunctionGraphSpec,
  c: Curve,
  b: number,
  get: Get,
  say: Say,
  x: string,
  build: Build,
): Curve {
  const h = 'h' in spec ? get(spec.h, 0) : 0;
  const u = (t: number) => h + b * (t - h); // new x → the family's x
  const back = (t: number) => h + (t - h) / b; // the family's x → new x
  const pre = (lo: number, hi: number): [number, number] => {
    const [a, z] = [u(lo), u(hi)];
    return a < z ? [a, z] : [z, a];
  };
  const mapIv = (i: Interval): Interval => {
    const [lo, hi] = [back(i.lo), back(i.hi)];
    return b > 0
      ? { lo, hi, loIn: i.loIn, hiIn: i.hiIn }
      : { lo: hi, hi: lo, loIn: i.hiIn, hiIn: i.loIn };
  };
  // The formula rebuilt with b(x − h) where x − h was: "|2(x − 3)|", "√(2x)", "2^(−x)".
  const bs = say(spec.horizontal, 1);
  const bLead = bs === '?' ? '?' : b === -1 ? MINUS : bs.includes('/') ? `(${bs})` : bs;
  const slotRe = new RegExp(`${SLOT}( [${MINUS}+] [^|)\\s]+)?`, 'g');
  const text = mapToks(build(spec, SLOT).text, (s) =>
    s.replace(slotRe, (_, shift?: string) =>
      shift ? `${bLead}(${x}${shift})` : spec.family === 'root' ? `(${bLead}${x})` : `${bLead}${x}`,
    ),
  );
  const handles: HandleDef[] = c.handles.flatMap((hd) =>
    Math.abs(hd.x - h) < 1e-12
      ? [hd] // at x = h: the point b turns about stays put
      : hd.sets.some((s) => s === 'h' || s.endsWith('.h'))
        ? []
        : [{ ...hd, x: back(hd.x), to: (X: number, Y: number) => hd.to(u(X), Y) }],
  );
  return {
    ...c,
    f: (t) => c.f(u(t)),
    side: (t, s) => c.side(u(t), (b > 0 ? s : -s) as -1 | 1),
    vas: (lo, hi) => c.vas(...pre(lo, hi)).map(back),
    breaks: (lo, hi) => c.breaks(...pre(lo, hi)).map(back),
    holes: c.holes.map((p) => ({ ...p, x: back(p.x) })),
    ends: c.ends.map((p) => ({ ...p, x: back(p.x) })),
    key: c.key ? { ...c.key, x: back(c.key.x) } : undefined,
    zeros: c.zeros
      ? (lo, hi) =>
          c.zeros!(...pre(lo, hi))
            .map((z) => ({ x: back(z.x), text: fracText(back(z.x)) }))
            .sort((p, q) => p.x - q.x)
      : undefined,
    domain: c.domain.map(mapIv),
    inflection: c.inflection ? { ...c.inflection, x: back(c.inflection.x) } : undefined,
    text,
    inverse: undefined,
    handles,
  };
}

/** The curve on lo ≤ x ≤ hi only: the ends closed and dotted, the rest gone. */
function kept(c: Curve, lo: number, hi: number): Curve {
  const inside = (t: number) => t >= lo - 1e-12 && t <= hi + 1e-12;
  const ends = [lo, hi]
    .filter(Number.isFinite)
    .map((e) => ({ x: e, y: c.f(e), closed: true }))
    .filter((e) => Number.isFinite(e.y));
  return {
    ...c,
    f: (t) => (inside(t) ? c.f(t) : NaN),
    side: (t, s) => (inside(t + s * 1e-9) ? c.side(t, s) : inside(t) ? c.f(t) : NaN),
    vas: (a, z) => c.vas(Math.max(a, lo), Math.min(z, hi)),
    breaks: (a, z) => [
      ...c.breaks(a, z).filter(inside),
      ...[lo, hi].filter((e) => Number.isFinite(e) && e > a && e < z),
    ],
    holes: c.holes.filter((p) => inside(p.x)),
    ends: [...c.ends.filter((p) => inside(p.x)), ...ends],
    // A vertex at an end of the kept part is where the curve starts, not a turn.
    key:
      c.key && inside(c.key.x)
        ? Math.min(Math.abs(c.key.x - lo), Math.abs(c.key.x - hi)) < 1e-9
          ? { ...c.key, what: 'start' }
          : c.key
        : undefined,
    zeros: c.zeros ? (a, z) => c.zeros!(Math.max(a, lo), Math.min(z, hi)) : undefined,
    domain: c.domain
      .map((i) => ({
        lo: Math.max(i.lo, lo),
        hi: Math.min(i.hi, hi),
        loIn: i.lo > lo ? i.loIn : true,
        hiIn: i.hi < hi ? i.hiIn : true,
      }))
      .filter((i) => i.lo <= i.hi),
    range: undefined,
    inverse: undefined,
    handles: c.handles.filter((hd) => inside(hd.x)),
  };
}

/** h + √((x − k) ÷ a) for a vertex-form parabola kept on x ≥ h (h − √… on x ≤ h). */
function keptInverse(
  spec: FunctionGraphSpec,
  get: Get,
  say: Say,
  x: string,
  lo: number,
  hi: number,
): Tok[] | undefined {
  if (spec.family !== 'quadratic' || spec.form !== 'vertex') return undefined;
  const [a, h, k] = [get(spec.a, 1), get(spec.h, 0), get(spec.k, 0)];
  const right = Math.abs(lo - h) < 1e-12 && hi === Infinity;
  const left = Math.abs(hi - h) < 1e-12 && lo === -Infinity;
  if (!right && !left) return undefined;
  const hs = say(spec.h, 0);
  const inner = `${x}${plusText(-k, k === 0 ? '0' : numText(-k))}`;
  const as = say(spec.a, 1);
  const body: Tok[] =
    a === 1 && as !== '?'
      ? [{ t: inner }]
      : [{ t: `(${inner})/${as.startsWith(MINUS) ? `(${as})` : as}` }];
  const start = h === 0 && hs !== '?' ? (right ? '' : MINUS) : `${hs} ${right ? '+' : MINUS} `;
  return [{ t: start }, { root: 2, body }];
}

/** |f(x)|: the parts below the x-axis reflected up. No handles: the values have sliders. */
function absolute(c: Curve): Curve {
  const up = (y: number) => Math.abs(y);
  return {
    ...c,
    f: (t) => up(c.f(t)),
    side: (t, s) => up(c.side(t, s)),
    has: [...new Set(c.has.map(up))],
    slant: undefined,
    holes: c.holes.map((p) => ({ ...p, y: up(p.y) })),
    ends: c.ends.map((p) => ({ ...p, y: up(p.y) })),
    key: c.key ? { ...c.key, y: up(c.key.y) } : undefined,
    range: undefined,
    // One token when the formula is plain text, so the bars sit close: |x² − 2x − 3|.
    text:
      c.text.length === 1 && 't' in c.text[0]! && !c.text[0].sup && !c.text[0].sub
        ? [{ t: `|${c.text[0].t}|` }]
        : [{ t: '|' }, ...c.text, { t: '|' }],
    inverse: undefined,
    parent: undefined,
    handles: [],
    inflection: undefined,
    midline: undefined,
  };
}

/** The caption's lines for these options. */
export function reshapeCaption(
  spec: FunctionGraphSpec,
  shaped: Reshaped,
  f: string,
  x: string,
): string[] {
  const lines: string[] = [];
  const b = shaped.b;
  if (b !== undefined && b !== 0 && b !== 1) {
    const h = shaped.h ?? 0;
    const about = h === 0 ? 'the y-axis' : `x = ${numText(h)}`;
    const m = Math.abs(b);
    const size =
      m === 1
        ? ''
        : m > 1
          ? `squeezed toward ${about} to 1/${numText(m)} of its width`
          : `stretched away from ${about} to ${numText(1 / m)} times its width`;
    const flip = b < 0 ? `flipped across ${about}` : '';
    lines.push(`b = ${numText(b)}: the graph is ${[size, flip].filter(Boolean).join(' and ')}`);
  }
  if (spec.restrict) {
    const { from, to } = shaped;
    const kept =
      from !== undefined && to !== undefined
        ? `${numText(from)} ≤ ${x} ≤ ${numText(to)}`
        : from !== undefined
          ? `${x} ≥ ${numText(from)}`
          : to !== undefined
            ? `${x} ≤ ${numText(to)}`
            : `every ${x}`;
    const inv = spec.inverse ? ', and only the kept part is reflected' : '';
    lines.push(`Kept: ${kept}; the rest of the curve is dashed${inv}`);
  }
  if (spec.abs && shaped.ghost)
    lines.push(
      `${f}(${x}) = |${plain(shaped.ghost.text)}|: the parts below the x-axis are reflected up; the curve before is dashed`,
    );
  return lines;
}

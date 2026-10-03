/**
 * Picture checks for college round 4, group F (docs/RENDERINGS_HE.md, earth science), called
 * from `repIssues` in `pictures.ts` with values in formula units. Test-only.
 *
 * - HC116 `ternary`: the point's coordinates are each amount ÷ the sum (0.5 %, and the page's
 *   normalized values the same); the field named in the caption contains the point (its drawn
 *   polygon, an independent test of the rules); the share is c ÷ (b + c).
 * - HC117 `silicateChain`: the oxygens counted in the box from the drawn corners (a corner held
 *   by two tetrahedra counts ½) equal n(4 − s ÷ 2); the boxed tetrahedra share s on average; the
 *   charge 4n − 2O equals −n(4 − s); the page's O, O per Si and charge agree.
 * - HC119 `earthLayers` `rupture`: M₀ = μLWD and Mw = (2 ÷ 3)(log₁₀ M₀ − 9.1) (0.01); the drawn
 *   patch's sides in the ratio L : W, inside the fault face; A = LW.
 * - HC120 `rockLayers` `ranges`: the window is [the older last appearance, the younger first],
 *   none when they never overlap; the page's ages agree. (The cliff header: layouts.test.ts.)
 */
import {
  FELDSPAR_FIELDS,
  QAP_FIELDS,
  baryXY,
  inPolygon,
  magnitudeOf,
  momentOf,
  normalize,
  fossilWindow,
  ruptureRect,
  ternaryField,
} from '@/components/module/reps/he4fMath';

import {
  SILICATE_SHARES,
  boxedOxygens,
  sharesOf,
  silicateStructure,
  wholeRepeat,
} from '@/components/module/reps/silicateMath';

import {
  interferenceColor,
  interferenceName,
  orderOf,
  retardationOf,
} from '@/components/module/reps/michelLevyMath';
import type {
  He4fSpec,
  MichelLevySpec,
  RockRangesSpec,
  RuptureSpec,
  SilicateChainSpec,
  TernarySpec,
} from '../typesHe4f';

type Val = (id: string) => number | undefined;

const near = (a: number, b: number, tol: number) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/** Every check of group HE4F. */
export function he4fIssues(rep: He4fSpec, val: Val): string[] {
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  switch (rep.kind) {
    case 'ternary':
      return ternaryIssues(rep, num);
    case 'silicateChain':
      return silicateIssues(rep, num);
    case 'earthLayers':
      return ruptureIssues(rep, num);
    case 'rockLayers':
      return rangesIssues(rep, num);
    case 'michelLevy':
      return michelLevyIssues(rep, num);
  }
}

type Num = (x: string | number | undefined) => number | undefined;

function ternaryIssues(rep: TernarySpec, num: Num): string[] {
  const out: string[] = [];
  const [a, b, c] = [num(rep.a), num(rep.b), num(rep.c)];
  if (a === undefined || b === undefined || c === undefined) return out;
  if (a < 0 || b < 0 || c < 0) out.push(`ternary: an amount is negative (${a}, ${b}, ${c})`);
  const p = normalize(a, b, c);
  if (!p) return out;
  const s = a + b + c;
  // The drawn point: its distance from each side is that corner's share of the height.
  const [x, y] = baryXY(p);
  const h = Math.sqrt(3) / 2;
  const fromBase = y / h;
  const fromRight = (Math.sqrt(3) * (1 - x) - y) / 2 / h;
  const fromLeft = (Math.sqrt(3) * x - y) / 2 / h;
  for (const [got, want, name] of [
    [fromBase, a / s, rep.labels[0]],
    [fromRight, b / s, rep.labels[1]],
    [fromLeft, c / s, rep.labels[2]],
  ] as const)
    if (Math.abs(got - want) > 0.005) out.push(`ternary: ${name} is drawn at ${got}, not ${want}`);
  rep.normalized?.forEach((n, i) => {
    const v = num(n);
    if (v !== undefined && Math.abs(v - (100 * [a, b, c][i]!) / s) > 0.05)
      out.push(`ternary: ${rep.labels[i]}′ = ${v}, not ${(100 * [a, b, c][i]!) / s}`);
  });
  const share = num(rep.share);
  if (share !== undefined && b + c > 0 && !near(share, (100 * c) / (b + c), 1e-4))
    out.push(`ternary: the share ${share}% is not ${(100 * c) / (b + c)}%`);
  if (rep.fields) {
    const f = ternaryField(rep.fields, p);
    const all = rep.fields === 'qap' ? QAP_FIELDS : FELDSPAR_FIELDS;
    if (!all.includes(f)) out.push(`ternary: field ${f.code} is not drawn`);
    if (!inPolygon(p, f.poly)) out.push(`ternary: the point is outside field ${f.code} named`);
    // The fields tile the triangle: the point is in some field, and only on edges in two.
    const holding = all.filter((g) => inPolygon(p, g.poly));
    if (!holding.length) out.push('ternary: the point is in no field');
  }
  return out;
}

function silicateIssues(rep: SilicateChainSpec, num: Num): string[] {
  const out: string[] = [];
  const [s, nRaw] = [num(rep.shared), num(rep.units)];
  if (s === undefined) return out;
  if (!SILICATE_SHARES.includes(s)) {
    out.push(`silicate: no structure shares ${s} oxygens (it draws faded)`);
    return out;
  }
  if (nRaw === undefined) return out;
  if (nRaw < 1 || Math.abs(nRaw - Math.round(nRaw)) > 1e-9)
    out.push(`silicate: n = ${nRaw} is not a whole number of at least 1`);
  const n = Math.round(nRaw);
  const st = silicateStructure(s, n, rep.form)!;
  const boxed = st.tets.filter((t) => t.boxed).length;
  if (boxed !== n) out.push(`silicate: ${boxed} tetrahedra boxed, not n = ${n}`);
  // Part of a repeat (an odd n of a double chain) is boxed faded, the reason in the caption.
  if (!wholeRepeat(s, n)) return out;
  const o = boxedOxygens(st);
  if (!near(o, n * (4 - s / 2), 1e-9))
    out.push(`silicate: the box holds ${o} O, not n(4 − s ÷ 2) = ${n * (4 - s / 2)}`);
  const shares = sharesOf(st);
  const mean = shares.reduce((a, b) => a + b, 0) / shares.length;
  if (!near(mean, s, 1e-9))
    out.push(`silicate: the boxed tetrahedra share ${mean} O on average, not ${s}`);
  const charge = 4 * n - 2 * o;
  if (!near(charge, -n * (4 - s), 1e-9))
    out.push(`silicate: the charge 4n − 2O = ${charge}, not −n(4 − s) = ${-n * (4 - s)}`);
  for (const [field, want, what] of [
    [rep.oxygens, n * (4 - s / 2), 'O in the unit'],
    [rep.perSi, 4 - s / 2, 'O per Si'],
    [rep.charge, -n * (4 - s), 'charge'],
  ] as const) {
    const v = num(field);
    if (v !== undefined && !near(v, want, 1e-6)) out.push(`silicate: ${what} ${v}, not ${want}`);
  }
  return out;
}

function ruptureIssues(rep: RuptureSpec, num: Num): string[] {
  const out: string[] = [];
  const [L, W, D, mu] = [num(rep.length), num(rep.width), num(rep.slip), num(rep.rigidity ?? 30)];
  if (L === undefined || W === undefined) return out;
  if (!(L > 0 && W > 0)) {
    out.push(`rupture: L = ${L} km and W = ${W} km must be above 0`);
    return out;
  }
  // The patch, as EarthRupture draws it in its 220 × 98 px face.
  const r = ruptureRect(L, W, 220, 98);
  if (!near(r.w / r.h, L / W, 1e-9)) out.push(`rupture: the patch is ${r.w} × ${r.h}, not L : W`);
  if (r.w > 220 + 1e-9 || r.h > 98 + 1e-9) out.push('rupture: the patch runs off the fault face');
  const area = num(rep.area);
  if (area !== undefined && !near(area, L * W, 1e-6))
    out.push(`rupture: A = ${area}, not LW = ${L * W}`);
  if (D === undefined || mu === undefined) return out;
  const m0 = momentOf(mu, L, W, D);
  // An independent sum: μ (Pa) × A (m²) × D (m).
  if (!near(m0, mu * 1e9 * L * W * 1e6 * D, 1e-9)) out.push(`rupture: M₀ = ${m0} is not μLWD`);
  const m0Page = num(rep.moment);
  if (m0Page !== undefined && !near(m0Page, m0, 1e-6))
    out.push(`rupture: the page's M₀ ${m0Page} is not μLWD = ${m0}`);
  const mw = magnitudeOf(m0);
  if (Math.abs(mw - ((Math.log(m0) / Math.LN10 - 9.1) * 2) / 3) > 1e-9)
    out.push(`rupture: Mw = ${mw} is not (2 ÷ 3)(log₁₀ M₀ − 9.1)`);
  const mwPage = num(rep.magnitude);
  if (mwPage !== undefined && Math.abs(mwPage - mw) > 0.01)
    out.push(`rupture: the page's Mw ${mwPage} is not ${mw}`);
  if (mw > 10) out.push(`rupture: Mw ${mw} runs off the 0–10 bar`);
  return out;
}

function rangesIssues(rep: RockRangesSpec, num: Num): string[] {
  const out: string[] = [];
  if (rep.ranges.length < 2 || rep.ranges.length > 4)
    out.push(`ranges: ${rep.ranges.length} fossils, not 2 to 4`);
  const rs = rep.ranges.map((r) => [num(r.first), num(r.last)] as const);
  if (rs.some(([f, l]) => f === undefined || l === undefined)) return out;
  const known = rs as unknown as [number, number][];
  known.forEach(([f, l], i) => {
    if (f < l) out.push(`ranges: ${rep.ranges[i]!.name} first appears after it last appears`);
  });
  const win = fossilWindow(known);
  // An independent reading: the ages every range covers.
  const lo = Math.max(...known.map((r) => r[1]));
  const hi = Math.min(...known.map((r) => r[0]));
  if (lo <= hi) {
    if (!win || win.youngest !== lo || win.oldest !== hi)
      out.push(`ranges: the window is not [${lo}, ${hi}] Ma`);
    for (const [field, want, what] of [
      [rep.oldest, hi, 'oldest'],
      [rep.youngest, lo, 'youngest'],
      [rep.window, hi - lo, 'window'],
    ] as const) {
      const v = num(field);
      if (v !== undefined && !near(v, want, 1e-9)) out.push(`ranges: ${what} ${v}, not ${want}`);
    }
  } else if (win) out.push('ranges: a window is drawn for ranges that never overlap');
  return out;
}

function michelLevyIssues(rep: MichelLevySpec, num: Num): string[] {
  const out: string[] = [];
  const [t, d] = [num(rep.thickness), num(rep.birefringence)];
  if (t === undefined || d === undefined) return out;
  if (t <= 0 || d <= 0) out.push(`michelLevy: t = ${t} μm and δ = ${d} must be above 0`);
  const g = retardationOf(t, d);
  if (!near(g, t * d * 1000, 1e-12)) out.push(`michelLevy: Γ = ${g}, not 1,000tδ`);
  const gPage = num(rep.retardation);
  if (gPage !== undefined && !near(gPage, g, 1e-6)) out.push(`michelLevy: Γ ${gPage}, not ${g}`);
  const ord = Math.floor(g / 550) + 1;
  if (orderOf(g) !== ord) out.push(`michelLevy: the order printed is ${orderOf(g)}, not ${ord}`);
  const oPage = num(rep.order);
  if (oPage !== undefined && oPage !== ord) out.push(`michelLevy: order ${oPage}, not ${ord}`);
  // The name printed by the point carries the same order (colour never alone).
  const ordinal = ['first', 'second', 'third'][ord - 1];
  if (ordinal && !interferenceName(g).startsWith(`${ordinal}-order`))
    out.push(`michelLevy: "${interferenceName(g)}" is not order ${ord}`);
  // The computed ramp: black at Γ = 0, and nearly white far past the third order.
  if (interferenceColor(0) !== '#000000') out.push('michelLevy: Γ = 0 is not black');
  const hex = interferenceColor(5000);
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  if (Math.min(...ch) < 150) out.push(`michelLevy: high-order white draws ${hex}`);
  return out;
}

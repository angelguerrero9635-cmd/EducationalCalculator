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
 */
import {
  FELDSPAR_FIELDS,
  QAP_FIELDS,
  baryXY,
  inPolygon,
  magnitudeOf,
  momentOf,
  normalize,
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

import type { He4fSpec, RuptureSpec, SilicateChainSpec, TernarySpec } from '../typesHe4f';

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

/**
 * Harness checks for the college pictures of round 3, group F (HC56, HC58, HC71, HC73; see
 * `typesHe3f.ts`): what each draws must agree with the page's values. Called from the kinds'
 * cases in `pictures.ts`. Test-only.
 */
import {
  CELL_DOTS,
  dotsFor,
  perSecond,
  FARADAY,
  R_GAS,
  cellQ,
  electrolysis,
  nernstE,
  extentOfQ,
  gibbsAt,
  gibbsSlope,
  kOfGibbs,
  perJoule,
  aminoCharge,
  aminoGroups,
  aminoPHAt,
  aminoPI,
  bufferPH,
  logKOf,
  polyproticPH,
  type AminoAcid,
} from '@/components/module/reps/he3fMath';

import type { VariableDef } from '@/engine/types';

import { siOf } from './picturesHs2c';

import type { ChemDiagramSpec } from '../typesHs2d';
import type { ChemCellHe3fSpec, EquilibriumGibbsSpec, PhScaleHe3fSpec } from '../typesHe3f';
import type { HsjSpec, PhScaleSpec } from '../typesHsj';
import type { NumOrVar } from '../typesGraphs';

type Val = (x: string | number) => number | undefined;
type UnitOf = (x: NumOrVar) => string | undefined;

/** Equal to display rounding (values are read as shown, about 4 significant figures). */
const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(1e-9, Math.abs(a), Math.abs(b));

const reader =
  (val: Val, unitOf: UnitOf) =>
  (x: NumOrVar | undefined, scale: (u: string | undefined) => number = () => 1) => {
    if (x === undefined) return undefined;
    const v = val(x);
    return v === undefined ? undefined : v * scale(unitOf(x));
  };

/** HC56: Q from the beakers, E from Nernst, the dots in proportion; Q = It, moles = It ÷ zF. */
export function cellHe3fIssues(rep: ChemCellHe3fSpec, val: Val, unitOf: UnitOf): string[] {
  const out: string[] = [];
  const num = reader(val, unitOf);
  if ('electrolysis' in rep) {
    const e = rep.electrolysis;
    const F = e.F ?? FARADAY;
    const [I, t, z, M] = [num(e.current), num(e.time, perSecond), num(e.z), num(e.molar)];
    if (z !== undefined && !(Number.isInteger(z) && z >= 1 && z <= 6))
      out.push(`z = ${z} electrons per ion (whole, 1–6)`);
    if (I !== undefined && I < 0) out.push(`current ${I} is negative`);
    if (I === undefined || t === undefined || z === undefined || !(z > 0 && I > 0 && t > 0))
      return out;
    const k = electrolysis(I, t, z, M, F);
    const same = (what: string, shown: number | undefined, drawn: number | undefined) => {
      // (A value shown to 4 decimals may round to 0: compare to that too.)
      if (shown !== undefined && drawn !== undefined && !near(shown, drawn, 3e-3))
        if (Math.abs(shown - drawn) > 6e-5)
          out.push(`${what} is counted as ${drawn}, the value shows ${shown}`);
    };
    same('Q = It', num(e.charge), k.charge);
    same('n(e⁻) = Q ÷ F', num(e.electrons), k.electrons);
    same('n = It ÷ zF', num(e.moles), k.moles);
    same('m = nM', num(e.mass), k.mass);
    return out;
  }
  const [ca, cc] = [num(rep.concentrations.anode), num(rep.concentrations.cathode)];
  for (const x of [ca, cc])
    if (x !== undefined && x < 0) out.push(`ion concentration ${x} is negative`);
  if (rep.metals[0] === rep.metals[1] && rep.standard !== undefined) {
    const e0 = num(rep.standard);
    if (e0 !== undefined && e0 !== 0) out.push(`a concentration cell has E° = 0, not ${e0}`);
  }
  if (ca === undefined || cc === undefined || !(ca > 0 && cc > 0)) return out;
  // The richer beaker draws CELL_DOTS dots, the other in proportion.
  const rich = Math.max(ca, cc);
  if (dotsFor(rich, rich) !== CELL_DOTS) out.push('the richer beaker does not hold the most dots');
  const Q = cellQ(ca, cc);
  const q = num(rep.Q);
  if (q !== undefined && !near(q, Q))
    out.push(`Q = [anode] ÷ [cathode] = ${Q}, the value shows ${q}`);
  const n = num(rep.n);
  const T = rep.T === undefined ? 298.15 : num(rep.T);
  const e0 =
    rep.standard === undefined
      ? rep.metals[0] === rep.metals[1]
        ? 0
        : undefined
      : num(rep.standard);
  if (n === undefined || T === undefined || e0 === undefined || !(n > 0)) return out;
  const E = nernstE(e0, n, T, Q, rep.R ?? R_GAS, rep.F ?? FARADAY);
  const shown = num(rep.E);
  // E is shown to about 4 decimals of a volt.
  if (shown !== undefined && Math.abs(shown - E) > 6e-4 && !near(shown, E))
    out.push(`Nernst gives E = ${E} V, the value shows ${shown}`);
  return out;
}

/** The group F checks of a chemDiagram, equilibriumChart or phScale spec (others pass). */
export function he3fIssues(
  rep: ChemDiagramSpec | HsjSpec,
  val: Val,
  byId: Map<string, VariableDef>,
): string[] {
  // Values in formula units (as the picture reads them), then scaled by the formula's unit.
  const toSi = siOf((id) => val(id), byId);
  const si: Val = (x) => (typeof x === 'number' ? x : toSi(x));
  const unitOf: UnitOf = (x) => (typeof x === 'string' ? byId.get(x)?.unit : undefined);
  if (rep.kind === 'chemDiagram' && rep.mode === 'cell' && !('cathode' in rep))
    return cellHe3fIssues(rep, si, unitOf);
  if (rep.kind === 'equilibriumChart' && 'gibbs' in rep) return gibbsIssues(rep, si, unitOf);
  if (rep.kind === 'phScale' && rep.mode === 'titration' && rep.polyprotic)
    return polyproticIssues(rep, si);
  if (
    rep.kind === 'phScale' &&
    (rep.mode === 'buffer' || rep.mode === 'aminoAcid' || rep.mode === 'pka')
  )
    return phHe3fIssues(rep, si);
  return [];
}

/** HC58: the curve's minimum where Q = K, and the slope at Q has ΔG's sign and size. */
export function gibbsIssues(rep: EquilibriumGibbsSpec, val: Val, unitOf: UnitOf): string[] {
  const out: string[] = [];
  const num = reader(val, unitOf);
  const g = rep.gibbs;
  const R = g.R ?? R_GAS;
  const [dG0, T] = [num(g.standard, perJoule), num(g.T)];
  if (T !== undefined && !(T > 0)) out.push(`T = ${T} K is not above absolute zero`);
  if (dG0 === undefined || T === undefined || !(T > 0)) return out;
  const K = kOfGibbs(dG0, T, R);
  const k = num(g.K);
  if (k !== undefined && !near(k, K, 5e-3))
    out.push(`e^(−ΔG° ÷ RT) = ${K}, the value shows K = ${k}`);
  // The minimum: the slope changes sign at ξ = K ÷ (1 + K) (checked in log-odds, so K of 10⁵ works).
  const xi = extentOfQ(K);
  if (xi > 1e-12 && xi < 1 - 1e-12) {
    const odds = (s: number) => (K * s) / (1 + K * s);
    if (!(gibbsSlope(odds(0.9), dG0, T, R) < 0 && gibbsSlope(odds(1.1), dG0, T, R) > 0))
      out.push('the curve has no minimum at Q = K');
    if (
      gibbsAt(xi, dG0, T, R) > gibbsAt(odds(0.9), dG0, T, R) + 1e-9 ||
      gibbsAt(xi, dG0, T, R) > gibbsAt(odds(1.1), dG0, T, R) + 1e-9
    )
      out.push('G at Q = K is not the lowest');
  }
  const Q = num(g.Q);
  if (Q !== undefined && Q < 0) out.push(`Q = ${Q} is negative`);
  if (Q === undefined || !(Q > 0)) return out;
  const dG = dG0 + R * T * Math.log(Q);
  const xq = extentOfQ(Q);
  if (xq > 1e-12 && xq < 1 - 1e-12) {
    const slope = gibbsSlope(xq, dG0, T, R);
    if (Math.sign(slope) !== Math.sign(dG) && Math.abs(dG) > 1e-6)
      out.push(`the slope at Q has sign ${Math.sign(slope)}, ΔG ${dG}`);
  }
  const shown = num(g.delta, perJoule);
  if (shown !== undefined && Math.abs(shown - dG) > 1 && !near(shown, dG, 5e-3))
    out.push(`ΔG° + RT ln Q = ${dG} J/mol, the value shows ${shown}`);
  return out;
}

/** HC71 polyprotic: equivalence volumes 1 : 2 (: 3), half-way pH = pKₐ for a weak step, pH₁. */
export function polyproticIssues(
  rep: Extract<PhScaleSpec, { mode: 'titration' }>,
  val: Val,
): string[] {
  const out: string[] = [];
  const num = (x: NumOrVar | undefined) => (x === undefined ? undefined : val(x));
  const p = rep.polyprotic!;
  if (p.pKa.length < 2 || p.pKa.length > 3) out.push(`${p.pKa.length} pKₐ values (2 or 3)`);
  const pks = p.pKa.map(num);
  const [ca, va, cb] = [
    num(rep.acid.concentration),
    num(rep.acid.volume),
    num(rep.base.concentration),
  ];
  if (pks.some((x) => x === undefined) || ca === undefined || va === undefined || cb === undefined)
    return out;
  if (!(cb > 0)) return out;
  for (let i = 1; i < pks.length; i++)
    if (!(pks[i]! > pks[i - 1]!))
      out.push(`pKₐ${i + 1} ${pks[i]} is not above pKₐ${i} ${pks[i - 1]}`);
  const v1 = (ca * va) / cb;
  (p.equivalences ?? []).forEach((x, i) => {
    const v = num(x);
    if (v !== undefined && !near(v, v1 * (i + 1), 1e-3))
      out.push(
        `equivalence ${i + 1} is ${v1 * (i + 1)} (${i + 1} × CₐVₐ ÷ C_b), the value shows ${v}`,
      );
  });
  const kas = pks.map((x) => 10 ** -x!);
  const at = (v: number) => polyproticPH(ca, va, cb, v, kas);
  const end = v1 * (pks.length + 0.5);
  for (let k = 1; k <= 30; k++)
    if (at((end * k) / 30) < at((end * (k - 1)) / 30) - 1e-6) out.push('the titration curve falls');
  pks.forEach((pk, i) => {
    const half = v1 * (i + 0.5);
    const c = (ca * va) / (va + half);
    const apart = pks.every((q, j) => j === i || Math.abs(q! - pk!) >= 3);
    // Henderson–Hasselbalch holds for a weak, well-separated step (not too dilute either).
    if (apart && 10 ** -pk! < c / 1000 && pk! < 11 && Math.abs(at(half) - pk!) > 0.05)
      out.push(`half-way pH ${at(half)} is not pKₐ${i + 1} ${pk}`);
  });
  const ph1 = num(p.firstPH);
  if (ph1 !== undefined && Math.abs(ph1 - (pks[0]! + pks[1]!) / 2) > 0.006)
    out.push(`pH₁ = (pKₐ₁ + pKₐ₂) ÷ 2 = ${(pks[0]! + pks[1]!) / 2}, the value shows ${ph1}`);
  return out;
}

/** HC71 buffer and amino acid, HC73 ladder. */
export function phHe3fIssues(rep: PhScaleHe3fSpec, val: Val): string[] {
  const out: string[] = [];
  const num = (x: NumOrVar | undefined) => (x === undefined ? undefined : val(x));
  switch (rep.mode) {
    case 'buffer': {
      const [pKa, a, b] = [num(rep.pKa), num(rep.acid), num(rep.base)];
      if (pKa === undefined || a === undefined || b === undefined || !(a > 0 && b > 0)) break;
      const before = num(rep.before);
      if (before !== undefined && Math.abs(before - bufferPH(pKa, a, b)) > 0.006)
        out.push(`pKₐ + log(A⁻ ÷ HA) = ${bufferPH(pKa, a, b)}, the value shows ${before}`);
      const x = num(rep.added);
      const after = num(rep.after);
      if (x !== undefined && after !== undefined && a + x > 0 && b - x > 0) {
        const want = bufferPH(pKa, a + x, b - x);
        if (Math.abs(after - want) > 0.006) out.push(`after: ${want}, the value shows ${after}`);
      }
      break;
    }
    case 'aminoAcid': {
      const [k1, k2, kR] = [num(rep.pKa1), num(rep.pKa2), num(rep.pKaR)];
      const s = rep.side;
      const code = s === undefined || s === 'none' || s === 'acidic' || s === 'basic' ? s : num(s);
      const side =
        code === 1 || code === 'acidic'
          ? 'acidic'
          : code === 2 || code === 'basic'
            ? 'basic'
            : 'none';
      if (k1 === undefined || k2 === undefined || (side !== 'none' && kR === undefined)) break;
      const a: AminoAcid = { pKa1: k1, pKa2: k2, ...(side !== 'none' ? { pKaR: kR!, side } : {}) };
      const g = aminoGroups(a);
      const pI = aminoPI(a);
      if (!g.some((x, i) => i < g.length - 1 && pI >= x && pI <= g[i + 1]!))
        out.push(`pI ${pI} is not between two of its pKₐ values`);
      if (Math.abs(aminoCharge(pI, a)) > 0.02)
        out.push(`the charge at pI ${pI} is ${aminoCharge(pI, a)}`);
      g.forEach((pk, i) => {
        const apart = g.every((q, j) => j === i || Math.abs(q - pk) >= 2.5);
        if (apart && Math.abs(aminoPHAt(i + 0.5, a) - pk) > 0.05)
          out.push(`half-way pH ${aminoPHAt(i + 0.5, a)} is not pKₐ ${pk}`);
      });
      const shownPI = num(rep.pI);
      if (shownPI !== undefined && Math.abs(shownPI - pI) > 0.006)
        out.push(`pI is ${pI}, the value shows ${shownPI}`);
      const pH = num(rep.pH);
      const q = num(rep.charge);
      if (pH !== undefined && q !== undefined && Math.abs(q - aminoCharge(pH, a)) > 6e-4)
        out.push(`the charge at pH ${pH} is ${aminoCharge(pH, a)}, the value shows ${q}`);
      break;
    }
    case 'pka': {
      const [lo, hi] = rep.range ?? [-10, 50];
      const all = [
        ...(rep.acids ?? []),
        ...(rep.reaction ? [rep.reaction.left, rep.reaction.right] : []),
      ];
      for (const x of all) {
        const v = num(x.pKa);
        if (v !== undefined && (v < lo || v > hi)) out.push(`${x.name} pKₐ ${v} is off the ladder`);
      }
      const names = (rep.acids ?? []).map((x) => x.name);
      if (new Set(names).size < names.length) out.push('an acid is named twice');
      const r = rep.reaction;
      if (!r) break;
      const [pl, pr] = [num(r.left.pKa), num(r.right.pKa)];
      if (pl === undefined || pr === undefined) break;
      const logK = logKOf(pl, pr);
      const shown = num(r.logK);
      if (shown !== undefined && Math.abs(shown - logK) > 0.006)
        out.push(`log K = pKₐ(right) − pKₐ(left) = ${logK}, the value shows ${shown}`);
      const K = num(r.K);
      if (K !== undefined && !near(K, 10 ** logK, 0.02))
        out.push(`K = 10^${logK}, the value shows ${K}`);
      break;
    }
  }
  return out;
}

/**
 * Picture checks for the college pictures of round 4, group D (HC109–HC115, `typesHe4d.ts`):
 * what each draws must agree with the page's values. Called from the kinds' cases in
 * `pictures.ts`. Values are read in their formula units. Test-only.
 */
import {
  BOHR_NM,
  degeneracy,
  fieldFill,
  hydrogenicEnergy,
  meanRadius,
  peakRadius,
  radialArea,
  radialMeanNumeric,
  radialNodeRadii,
  radialNodes,
  RYDBERG,
} from '@/components/module/reps/orbitalHe4dMath';

import { electronTotals, formalCharges, resonanceSet } from '@/components/module/reps/lewisHe4d';

import type { LewisHe4dSpec, OrbitalHe4dSpec } from '../typesHe4d';

type Val = (x: string | number) => number | undefined;

const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

const read = (val: Val, x: string | number | undefined) => (x === undefined ? undefined : val(x));

/** A whole value in range, or a complaint. */
function whole(out: string[], x: number | undefined, what: string, lo: number, hi: number) {
  if (x === undefined) return undefined;
  if (Math.abs(x - Math.round(x)) > 1e-9 || x < lo || x > hi) {
    out.push(`${what} ${x} (whole, ${lo} to ${hi} drawn)`);
    return undefined;
  }
  return Math.round(x);
}

/** A value the picture works out must agree with the page's. */
function agree(out: string[], shown: number | undefined, want: number, what: string, tol = 2e-3) {
  if (shown !== undefined && !near(shown, want, tol))
    out.push(`${what} ${want} drawn, the value shows ${shown}`);
}

/** HC109, HC110: the hydrogen-like ladder, the radial distribution, the crystal field. */
export function orbitalHe4dIssues(rep: OrbitalHe4dSpec, val: Val): string[] {
  const out: string[] = [];
  if (rep.mode === 'crystalField') {
    const d = whole(out, read(val, rep.d), 'd electrons', 0, 10);
    const split = read(val, rep.split);
    const P = read(val, rep.pairing);
    if (split !== undefined && !(split > 0)) out.push(`splitting ${split} is not positive`);
    if (P !== undefined && !(P > 0)) out.push(`pairing energy ${P} is not positive`);
    if (d === undefined || split === undefined || P === undefined || !(split > 0)) return out;
    const f = fieldFill(d, split, P, rep.geometry ?? 'octahedral');
    if (f.counts.reduce((s, x) => s + x, 0) !== d) out.push(`${d} d electrons, boxes hold others`);
    // Octahedral spin from Δₒ against P (d⁴–d⁷ only can differ).
    if ((rep.geometry ?? 'octahedral') === 'octahedral' && d >= 4 && d <= 7 && split !== P) {
      if (f.low !== split > P)
        out.push(`spin drawn ${f.low ? 'low' : 'high'} with Δ ${split}, P ${P}`);
    }
    const lower = f.counts[0]!;
    agree(out, read(val, rep.t2g), lower, 'lower-set electrons');
    agree(out, read(val, rep.eg), d - lower, 'upper-set electrons');
    agree(out, read(val, rep.unpaired), f.unpaired, 'unpaired electrons');
    agree(out, read(val, rep.cfse), f.cfse, 'CFSE');
    agree(out, read(val, rep.moment), f.moment, 'spin-only moment');
    return out;
  }
  const Z = whole(out, read(val, rep.Z), 'Z', 1, 10);
  const n = whole(out, read(val, rep.n), 'n', 1, 10);
  const l = whole(out, read(val, rep.l), 'l', 0, 9);
  if (n !== undefined && l !== undefined && l >= n) out.push(`l = ${l} is not below n = ${n}`);
  if (rep.mode === 'ladder') {
    if (Z !== undefined && n !== undefined)
      agree(out, read(val, rep.energy), hydrogenicEnergy(Z, n, rep.rydberg ?? RYDBERG), 'energy');
    if (n !== undefined) agree(out, read(val, rep.degeneracy), degeneracy(n), 'degeneracy');
    if (n !== undefined && l !== undefined && l < n) {
      agree(out, read(val, rep.radial), radialNodes(n, l), 'radial nodes');
      agree(out, read(val, rep.angular), l, 'angular nodes');
    }
    return out;
  }
  if (Z === undefined || n === undefined || l === undefined || l >= n) return out;
  // The drawn curve: area 1, n − l − 1 nodes, ⟨r⟩ from the formula and from the curve.
  if (!near(radialArea(Z, n, l), 1, 1e-3)) out.push(`P(r) area ${radialArea(Z, n, l)}, not 1`);
  const nodes = radialNodeRadii(Z, n, l);
  if (nodes.length !== radialNodes(n, l))
    out.push(`${nodes.length} radial nodes drawn, n − l − 1 = ${radialNodes(n, l)}`);
  const mean = meanRadius(Z, n, l);
  if (!near(radialMeanNumeric(Z, n, l), mean, 1e-3))
    out.push(`⟨r⟩ from the curve ${radialMeanNumeric(Z, n, l)}, the formula ${mean}`);
  const peak = peakRadius(Z, n, l);
  if (l === n - 1 && !near(peak, (n * n) / Z, 1e-3)) out.push(`r_mp ${peak}, not n² ÷ Z`);
  agree(out, read(val, rep.nodes), radialNodes(n, l), 'radial nodes');
  agree(out, read(val, rep.mean), mean, '⟨r⟩ (a₀)');
  agree(out, read(val, rep.meanNm), mean * BOHR_NM, '⟨r⟩ (nm)', 4e-3);
  agree(out, read(val, rep.peak), peak, 'r_mp (a₀)');
  agree(out, read(val, rep.peakNm), peak * BOHR_NM, 'r_mp (nm)', 4e-3);
  return out;
}

/**
 * HC111: every drawn form counts the ion's valence electrons and its formal charges add to the
 * ion's charge; the page's v, N and B name an atom drawn (in some form) and FC = v − N − B ÷ 2.
 */
export function lewisHe4dIssues(rep: LewisHe4dSpec, val: Val): string[] {
  const out: string[] = [];
  const set = rep.formula ? resonanceSet(rep.formula) : undefined;
  if (!set) return [`no college Lewis structure for ${rep.formula ?? '(no formula)'}`];
  const forms = rep.resonance ? set.forms : set.forms.slice(0, 1);
  if (rep.resonance && set.forms.length < 2) out.push(`${rep.formula} has one form only`);
  const q = read(val, rep.charge);
  if (q !== undefined && q !== set.charge) out.push(`charge ${q}, ${rep.formula} is ${set.charge}`);
  forms.forEach((form, k) => {
    const t = electronTotals(set, form);
    if (t.valence !== t.drawn)
      out.push(`form ${k + 1}: ${t.drawn} electrons drawn, ${t.valence} valence`);
    const cs = formalCharges(set, form);
    const sum = cs.reduce((s, x) => s + x.FC, 0);
    if (sum !== set.charge)
      out.push(`form ${k + 1}: formal charges add to ${sum}, not ${set.charge}`);
    cs.forEach((x, i) => {
      const el = set.atoms[i]!.el;
      // Second-period atoms never pass 8 (H 2); only period 3 and below expand.
      if (['B', 'C', 'N', 'O', 'F'].includes(el) && x.around > 8)
        out.push(`form ${k + 1}: ${el} has ${x.around} electrons around it`);
    });
  });
  const f = rep.formal;
  if (!f) return out;
  const [v, N, B, FC] = [f.valence, f.nonbonding, f.bonding, f.charge].map((x) => read(val, x));
  if (v !== undefined && N !== undefined && B !== undefined) {
    if (FC !== undefined && Math.abs(FC - (v - N - B / 2)) > 1e-9)
      out.push(`FC = ${v} − ${N} − ${B} ÷ 2 = ${v - N - B / 2}, the value shows ${FC}`);
  }
  if (f.atom !== undefined && !set.atoms[f.atom]) out.push(`no atom ${f.atom} in ${rep.formula}`);
  return out;
}

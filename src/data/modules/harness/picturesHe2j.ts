/**
 * Harness checks for the college pictures of round 2, group J (docs/RENDERINGS_HE.md): HC28
 * `stressStrain` and HC33 `stressElement`. What each draws must agree with the page's values. `val` reads formula units
 * (see `siOf`); each value is turned into MPa, mm and N by its variable's unit, as the picture
 * does.
 */
import type { VariableDef } from '@/engine/types';
import {
  engineeringCurve,
  OFFSET,
  resilience,
  shareOf,
  toBase,
  tubeI,
} from '@/components/module/reps/stressStrainMath';

import type { NumOrVar } from '../typesGraphs';
import { lineDistance, mohr, safety, turned } from '@/components/module/reps/stressElementMath';

import type { He2jSpec, StressElementSpec, StressStrainSpec } from '../typesHe2j';

type Val = (id: string) => number | undefined;

/** Within 0.5%, or both too small for a page to show apart (a value rounded to 0). */
const near = (a: number, b: number, tol = 0.005) =>
  Math.abs(a - b) <= Math.max(tol * Math.max(Math.abs(a), Math.abs(b)), 1e-7);

/** The group J checks. */
export function he2jIssues(rep: He2jSpec, val: Val, byId: Map<string, VariableDef>): string[] {
  const get = (x: NumOrVar | undefined) => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    const v = val(x);
    return v === undefined || !Number.isFinite(v) ? undefined : v * toBase(byId.get(x)?.unit);
  };
  return rep.kind === 'stressElement'
    ? stressElementIssues(rep, get)
    : stressStrainIssues(rep, get);
}

/** HC33: the circle's center and radius, the principals, θ_p, the loci's n and the soil line. */
function stressElementIssues(
  spec: StressElementSpec,
  get: (x: NumOrVar | undefined) => number | undefined,
): string[] {
  const out: string[] = [];
  const sx = get(spec.sx);
  const sy = get(spec.sy);
  const txy = get(spec.txy);
  const s1 = get(spec.s1);
  const s2 = get(spec.s2);
  const s3 = get(spec.s3);
  if (sx !== undefined && sy !== undefined && txy !== undefined) {
    const m = mohr(sx, sy, txy);
    const same = (x: NumOrVar | undefined, want: number, what: string) => {
      const v = get(x);
      if (v !== undefined && !near(v, want))
        out.push(`stressElement: ${what} = ${v} is not ${want}`);
    };
    same(spec.savg, m.C, 'the center σ_avg');
    same(spec.R, m.R, 'R');
    if (!spec.three) {
      same(spec.s1, m.s1, 'σ₁');
      same(spec.s2, m.s2, 'σ₂');
      same(spec.tmax, m.R, 'τ_max (in plane)');
    }
    const th = get(spec.angle);
    if (th !== undefined) {
      // The turned faces carry a principal stress and no shear.
      const f = turned(sx, sy, txy, th);
      if (!near(f.t, 0, 1e-3) && Math.abs(f.t) > 1e-6 * Math.max(m.R, 1))
        out.push(`stressElement: the element turned θ_p = ${th}° still carries τ = ${f.t}`);
      if (!near(f.s, m.s1) && !near(f.s, m.s2))
        out.push(`stressElement: the turned face carries ${f.s}, neither σ₁ nor σ₂`);
    }
  }
  if (spec.three && s1 !== undefined && s2 !== undefined && s3 !== undefined) {
    const hi = Math.max(s1, s2, s3);
    const lo = Math.min(s1, s2, s3);
    const t = get(spec.tmax);
    if (t !== undefined && !near(t, (hi - lo) / 2))
      out.push(`stressElement: τ_max = ${t} is not (σ₁ − σ₃) ÷ 2 = ${(hi - lo) / 2}`);
  }
  if (spec.envelope) {
    const kinds = Array.isArray(spec.envelope) ? spec.envelope : [spec.envelope];
    const ns = spec.n === undefined ? [] : Array.isArray(spec.n) ? spec.n : [spec.n];
    const m =
      sx !== undefined && sy !== undefined && txy !== undefined ? mohr(sx, sy, txy) : undefined;
    const A = spec.point ? get(spec.point[0]) : (s1 ?? m?.s1);
    const B = spec.point ? get(spec.point[1]) : (s2 ?? m?.s2);
    // A Coulomb–Mohr locus needs both strengths; one "?" draws none.
    const St =
      spec.strengthC !== undefined && get(spec.strengthC) === undefined
        ? undefined
        : get(spec.strength);
    const Sc = get(spec.strengthC) ?? St;
    if (A !== undefined && B !== undefined && St !== undefined) {
      kinds.forEach((kind, i) => {
        const want = safety(kind, A, B, St, Sc);
        const n = get(ns[i]);
        if (n !== undefined && Number.isFinite(want) && !near(n, want))
          out.push(
            `stressElement: n = ${n} by ${kind} is not ${want} (the n-scaled load misses the locus)`,
          );
        // Inside the locus exactly when n > 1.
        const inside = want > 1;
        if (n !== undefined && n > 1 !== inside)
          out.push(
            `stressElement: n = ${n} but the load is ${inside ? 'inside' : 'outside'} the ${kind} locus`,
          );
      });
    }
  }
  if (spec.mohrCoulomb) {
    const c = get(spec.mohrCoulomb.c);
    const phi = get(spec.mohrCoulomb.phi);
    const th = get(spec.mohrCoulomb.theta);
    if (phi !== undefined && th !== undefined && !near(th, 45 + phi / 2))
      out.push(`stressElement: the plane's θ = ${th}° is not 45° + φ ÷ 2`);
    if (s1 !== undefined && s3 !== undefined && c !== undefined && phi !== undefined) {
      const C = (s1 + s3) / 2;
      const R = (s1 - s3) / 2;
      if (!near(lineDistance(C, c, phi), R))
        out.push(
          `stressElement: the strength line is ${lineDistance(C, c, phi)} from the center, not R = ${R}, so it doesn't touch the circle`,
        );
    }
  }
  return out;
}

function stressStrainIssues(
  spec: StressStrainSpec,
  get: (x: NumOrVar | undefined) => number | undefined,
): string[] {
  const out: string[] = [];
  const model = spec.curve ?? 'metal';
  const E = get(spec.E);
  const sy = get(spec.yield);
  const su = get(spec.uts);
  const ef = get(spec.fracture);
  const pe = get(spec.strain);
  const ps = get(spec.stress);
  if (E !== undefined && !(E > 0)) out.push(`stressStrain: E = ${E} is not positive`);
  if (sy !== undefined && su !== undefined && su < sy)
    out.push(`stressStrain: the UTS ${su} is below σ_Y ${sy}`);
  if (
    E !== undefined &&
    sy !== undefined &&
    ef !== undefined &&
    model === 'metal' &&
    ef <= sy / E + OFFSET
  )
    out.push(`stressStrain: fracture at ε = ${ef} comes before the 0.2% offset yield`);
  // The point sits on the elastic line below yield (the tissue's straight part).
  if (E !== undefined && pe !== undefined && ps !== undefined && (sy === undefined || ps <= sy)) {
    if (!near(ps, E * pe))
      out.push(`stressStrain: the point (${pe}, ${ps}) is off σ = Eε (E = ${E})`);
  }
  // The curve's 0.2% offset point is σ_Y exactly.
  if (E !== undefined && sy !== undefined && model === 'metal') {
    const curve = engineeringCurve({
      model,
      E,
      sy,
      ...(su !== undefined ? { su } : {}),
      ...(ef !== undefined ? { ef } : {}),
    });
    const knee = curve.pts.find(([, s]) => near(s, sy, 1e-9));
    if (!knee || !near(knee[0], sy / E + OFFSET, 1e-6))
      out.push('stressStrain: the curve misses the 0.2% offset point at σ_Y');
    if (curve.utsAt && Math.max(...curve.pts.map((p) => p[1])) > curve.utsAt[1] * (1 + 1e-9))
      out.push('stressStrain: the curve rises above its UTS');
  }
  if (spec.specimen) {
    const sp = spec.specimen;
    const F = get(sp.F);
    const A = get(sp.A);
    const d = get(sp.d);
    const L = get(sp.L);
    const dL = get(sp.dL);
    if (A !== undefined && d !== undefined && !near(A, (Math.PI * d * d) / 4))
      out.push(`stressStrain: A = ${A} mm² is not πd² ÷ 4 for d = ${d}`);
    if (F !== undefined && A && ps !== undefined && !near(ps, F / A))
      out.push(`stressStrain: σ = ${ps} MPa is not F ÷ A = ${F / A}`);
    if (L && dL !== undefined && pe !== undefined && !near(pe, dL / L))
      out.push(`stressStrain: ε = ${pe} is not ΔL ÷ L = ${dL / L}`);
  }
  if (spec.area === 'resilience' && E !== undefined && sy !== undefined) {
    const U = get(spec.energy);
    if (U !== undefined && !near(U, resilience(sy, E)))
      out.push(`stressStrain: U_r = ${U} is not σ_Y² ÷ 2E = ${resilience(sy, E)}`);
  }
  if (spec.section) {
    const se = spec.section;
    const ro = get(se.ro);
    const ri = get(se.ri);
    const I = get(se.I);
    const M = get(se.M);
    const s = get(se.stress);
    const solid = get(se.solidI);
    if (ro !== undefined && ri !== undefined) {
      if (ri >= ro) out.push(`stressStrain: the canal r_i = ${ri} is not inside r_o = ${ro}`);
      else if (I !== undefined && !near(I, tubeI(ro, ri)))
        out.push(`stressStrain: I = ${I} is not π(r_o⁴ − r_i⁴) ÷ 4 = ${tubeI(ro, ri)}`);
    }
    if (ro !== undefined && solid !== undefined && !near(solid, tubeI(ro, 0)))
      out.push(`stressStrain: the solid rod's I = ${solid} is not πr_o⁴ ÷ 4`);
    if (M !== undefined && ro !== undefined && I && s !== undefined && !near(s, (M * ro) / I))
      out.push(`stressStrain: σ = ${s} MPa is not Mr_o ÷ I = ${(M * ro) / I}`);
  }
  if (spec.parallel) {
    const pa = spec.parallel;
    const E1 = get(pa.E1);
    const A1 = get(pa.A1);
    const E2 = get(pa.E2);
    const A2 = get(pa.A2);
    const F = get(pa.F);
    const share = get(pa.share);
    const s2 = get(pa.stress2);
    if (share !== undefined && (share < 0 || share > 1))
      out.push(
        `stressStrain: a share of ${share} is not between 0 and 1, so the two can't add to 1`,
      );
    if (E1 !== undefined && A1 !== undefined && E2 !== undefined && A2 !== undefined) {
      const want = shareOf(E1, A1, E2, A2);
      if (share !== undefined && !near(share, want))
        out.push(`stressStrain: the share ${share} is not E₁A₁ ÷ ΣEA = ${want}`);
      const w = share ?? want;
      if (!near(w + (1 - w), 1)) out.push('stressStrain: the bars’ widths do not add to the whole');
      if (F !== undefined && s2 !== undefined && !near(s2, (F * (1 - w)) / A2))
        out.push(`stressStrain: σ₂ = ${s2} MPa is not F(1 − share) ÷ A₂`);
    }
  }
  return out;
}

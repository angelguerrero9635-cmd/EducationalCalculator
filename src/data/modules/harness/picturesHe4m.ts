/**
 * Picture checks for college round 4, group M (docs/RENDERINGS_HE.md), called from `repIssues`
 * in `pictures.ts`. Test-only.
 *
 * - HC174 `soilPhases`: the drawn void height ÷ solid height is e and the water's share of the
 *   voids is S; Se = wG_s; n, γ_d and γ (or ρ and ρ_d for a sand cone) are the page's.
 */
import { soilPhaseParts } from '@/components/module/reps/he4mMath';

import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

const close = (a: number, b: number, rel = 2e-3) =>
  Math.abs(a - b) <= rel * Math.max(1e-9, Math.abs(a), Math.abs(b));

/** Every group M new kind's check. */
export function he4mIssues(rep: Representation, val: Val): string[] {
  switch (rep.kind) {
    case 'soilPhases':
      return soilPhasesIssues(rep, val);
    default:
      return [];
  }
}

function soilPhasesIssues(rep: Extract<Representation, { kind: 'soilPhases' }>, val: Val) {
  const out: string[] = [];
  const get = (v: string | number | undefined) => (v === undefined ? undefined : val(v));
  const [Gs, wPct, S, e, gw, V, M] = [
    get(rep.Gs),
    get(rep.w),
    get(rep.S),
    get(rep.e),
    get(rep.gammaW),
    get(rep.volume),
    get(rep.mass),
  ];
  const w = wPct === undefined ? undefined : wPct / 100;
  if (Gs !== undefined && (Gs <= 1 || Gs > 3.5)) out.push(`soil: G_s = ${Gs} is not a soil's`);
  if (w !== undefined && w < 0) out.push(`soil: w = ${wPct}% is negative`);
  if (S !== undefined && (S < 0 || S > 1)) out.push(`soil: S = ${S} is outside 0 to 1`);
  if (e !== undefined && e <= 0) out.push(`soil: e = ${e} is not positive`);
  if (S !== undefined && e !== undefined && w !== undefined && Gs !== undefined)
    if (!close(S * e, w * Gs)) out.push(`soil: Se = ${S * e} but wG_s = ${w * Gs}`);
  const p = soilPhaseParts({ Gs, w, S, e, V });
  if (p) {
    // The drawing: void height ÷ solid height, water ÷ voids, the parts filling the block.
    if (!close(p.Vv / p.Vs, p.e, 1e-9)) out.push(`soil: voids ÷ solids drawn ${p.Vv / p.Vs}`);
    if (p.Vv > 0 && !close(p.Vw / p.Vv, p.S, 1e-9))
      out.push(`soil: water ÷ voids drawn ${p.Vw / p.Vv}, not S = ${p.S}`);
    if (!close(p.Va + p.Vw + p.Vs, p.V, 1e-9)) out.push('soil: the phases do not fill the block');
    if (V !== undefined && !close(p.V, V, 1e-9)) out.push(`soil: block ${p.V}, not V = ${V}`);
    const n = get(rep.porosity);
    if (n !== undefined && !close(n, p.e / (1 + p.e)))
      out.push(`soil: n = ${n}, not e ÷ (1 + e) = ${p.e / (1 + p.e)}`);
    const gd = get(rep.dryUnitWeight);
    if (gd !== undefined && gw !== undefined && Gs !== undefined) {
      if (!close(gd, (Gs * gw) / (1 + p.e)))
        out.push(`soil: γ_d = ${gd}, not G_sγ_w ÷ (1 + e) = ${(Gs * gw) / (1 + p.e)}`);
    } else if (gd !== undefined && gw === undefined && !rep.mass)
      out.push('soil: γ_d with no γ_w to check it by');
    const g = get(rep.unitWeight);
    if (g !== undefined && gd !== undefined && w !== undefined && !close(g, gd * (1 + w)))
      out.push(`soil: γ = ${g}, not γ_d(1 + w) = ${gd * (1 + w)}`);
  }
  // The sand cone: ρ = M ÷ V up to a unit change, ρ_d = ρ ÷ (1 + w).
  const rho = get(rep.density);
  if (rho !== undefined && M !== undefined && V !== undefined) {
    const k = Math.log10((rho * V) / M);
    if (Math.abs(k - Math.round(k)) > 1e-3) out.push(`soil: ρ = ${rho} is not M ÷ V = ${M / V}`);
  }
  const rd = get(rep.dryDensity);
  if (rd !== undefined && rho !== undefined && w !== undefined && !close(rd, rho / (1 + w)))
    out.push(`soil: ρ_d = ${rd}, not ρ ÷ (1 + w) = ${rho / (1 + w)}`);
  return out;
}

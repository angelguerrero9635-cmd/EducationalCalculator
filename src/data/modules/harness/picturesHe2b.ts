/**
 * Picture checks for the college round 2 group B kinds (`typesHe2b.ts`): HC15 `potentialWell`
 * and HC16 `unitCell`. What each draws must agree with the values and the physics. Called from
 * `repIssues` in `pictures.ts`. Test-only.
 */
import {
  boxProbability,
  ENERGY_J,
  HBAR,
  INVERSE_M,
  LENGTH_M,
  levelHeight,
  MASS_KG,
  photonWavelength,
  stepScatter,
  wellNodes,
} from '@/components/module/reps/potentialWellMath';

import type { NumOrVar } from '../typesGraphs';
import type { He2bSpec, PotentialWellSpec } from '../typesHe2b';

/** Equal to 0.1% (or 10⁻⁶ near zero, below what a page shows). */
const near = (a: number, b: number, tol = 1e-3) =>
  Math.abs(a - b) <= tol * Math.max(1e-6, Math.abs(a), Math.abs(b));

type Get = (x: NumOrVar | undefined) => number | undefined;

/**
 * `val` reads a value in its variable's own unit and `unitOf` names that unit (a fixed number
 * has none), so a check that needs SI (λ = hc ÷ ΔE) converts by it.
 */
export function he2bIssues(
  rep: He2bSpec,
  val: (id: string) => number | undefined,
  unitOf: (id: string) => string | undefined,
): string[] {
  const get: Get = (x) => {
    if (x === undefined) return undefined;
    const y = typeof x === 'number' ? x : val(x);
    return y === undefined || Number.isNaN(y) ? undefined : y;
  };
  const unit = (x: NumOrVar | undefined) => (typeof x === 'string' ? unitOf(x) : undefined);
  if (rep.kind === 'potentialWell') return potentialWellIssues(rep, get, unit);
  return [];
}

function potentialWellIssues(
  spec: PotentialWellSpec,
  get: Get,
  unit: (x: NumOrVar | undefined) => string | undefined,
): string[] {
  const out: string[] = [];
  const osc = spec.model === 'harmonic';
  const model = osc ? 'harmonic' : 'box';
  const lower = get(spec.lower);
  const upper =
    osc && spec.upper === undefined && lower !== undefined ? lower + 1 : get(spec.upper);
  for (const [name, n] of [
    ['lower', lower],
    ['upper', upper],
  ] as const) {
    if (n === undefined) continue;
    if (!Number.isInteger(n) || n < (osc ? 0 : 1))
      out.push(`potentialWell: ${name} level ${n} is not a whole number from ${osc ? 0 : 1}`);
    // ψ has n − 1 nodes in a box, v for the oscillator, as drawn.
    else if (spec.model === 'box' || osc) {
      const nodes = wellNodes(model, n);
      if (nodes !== (osc ? n : n - 1))
        out.push(`potentialWell: ψ of level ${n} has ${nodes} nodes as drawn`);
    }
  }
  if (spec.model === 'box' || spec.model === 'bump' || osc) {
    // Levels ∝ n² (box) or v + ½ (oscillator): every energy the page gives agrees with the rest.
    const per: { e: number; n: number; field: string }[] = [];
    const add = (x: NumOrVar | undefined, n: number | undefined, field: string) => {
      const e = get(x);
      if (e !== undefined && n !== undefined && Number.isInteger(n)) per.push({ e, n, field });
    };
    add(spec.ground, osc ? 0 : 1, 'ground');
    add(spec.lowerEnergy, lower, 'lowerEnergy');
    add(spec.upperEnergy, upper, 'upperEnergy');
    if (osc && get(spec.spacing) !== undefined)
      per.push({ e: get(spec.spacing)! / 2, n: 0, field: 'spacing' });
    const units = new Set(
      [spec.ground, spec.lowerEnergy, spec.upperEnergy, osc ? spec.spacing : undefined]
        .filter((x) => x !== undefined && get(x) !== undefined)
        .map(unit),
    );
    // Only where the page's relations tie the energies together (a box's m and L known).
    const tied =
      osc ||
      spec.ground !== undefined ||
      (get(spec.mass) !== undefined && get(spec.length) !== undefined);
    if (tied && units.size === 1 && per.length > 1) {
      const base = per[0]!.e / levelHeight(model, per[0]!.n);
      for (const p of per.slice(1)) {
        const want = base * levelHeight(model, p.n);
        if (!near(p.e, want))
          out.push(
            `potentialWell: ${p.field} ${p.e}, but the levels ${osc ? 'as v + ½' : 'as n²'} give ${want}`,
          );
      }
    }
    // λ = hc ÷ ΔE, in SI by the values' units.
    const gap = get(spec.gap);
    const lam = get(spec.wavelength);
    const eJ = ENERGY_J[unit(spec.gap) ?? ''];
    const lM = LENGTH_M[unit(spec.wavelength) ?? ''];
    if (gap !== undefined && lam !== undefined && eJ && lM && gap > 0) {
      const want = photonWavelength(gap * eJ) / lM;
      if (!near(lam, want)) out.push(`potentialWell: λ ${lam}, but hc ÷ ΔE = ${want}`);
    }
    if (
      tied &&
      gap !== undefined &&
      lower !== undefined &&
      upper !== undefined &&
      per.length &&
      units.size === 1 &&
      unit(spec.gap) === [...units][0]
    ) {
      const base = per[0]!.e / levelHeight(model, per[0]!.n);
      const want = base * (levelHeight(model, upper) - levelHeight(model, lower));
      if (!near(gap, want)) out.push(`potentialWell: ΔE ${gap}, but the levels give ${want}`);
    }
    // The shaded chance P = ∫|ψ|² from x₁ to x₂.
    const L = get(spec.length);
    const x1 = get(spec.region?.from);
    const x2 = get(spec.region?.to);
    const P = get(spec.probability);
    if (spec.region && L !== undefined && x1 !== undefined && x2 !== undefined) {
      if (!(x1 >= 0 && x2 > x1 && x2 <= L * (1 + 1e-9)))
        out.push(`potentialWell: region ${x1} to ${x2} is not inside the box 0 to ${L}`);
      else if (P !== undefined && lower !== undefined) {
        const want = boxProbability(lower, x1 / L, x2 / L);
        if (!near(P, want)) out.push(`potentialWell: P ${P}, but ∫|ψ|² over the region = ${want}`);
      }
    }
    // The bump: E⁽¹⁾ = V₀ × P.
    const V0 = get(spec.bump);
    const shift = get(spec.shift);
    if (spec.model === 'bump' && V0 !== undefined && shift !== undefined && P !== undefined)
      if (!near(shift, V0 * P)) out.push(`potentialWell: E⁽¹⁾ ${shift}, but V₀ × P = ${V0 * P}`);
  }
  if (spec.model === 'step') {
    const E = get(spec.energy);
    const U = get(spec.height);
    const k = get(spec.ratio);
    const R = get(spec.reflection);
    const T = get(spec.transmission);
    // R and T from k₁/k₂ as labelled; k₁/k₂ from E and U₀ where E − U₀ is not lost to rounding.
    if (k !== undefined && k >= 1) {
      const want = ((k - 1) / (k + 1)) ** 2;
      if (R !== undefined && !near(R, want))
        out.push(`potentialWell: R ${R}, but ((k₁ − k₂) ÷ (k₁ + k₂))² = ${want}`);
      if (T !== undefined && !near(T, 1 - want))
        out.push(`potentialWell: T ${T}, but 1 − R = ${1 - want}`);
    }
    if (E !== undefined && U !== undefined && U >= 0 && E - U > 1e-2 * E && k !== undefined) {
      const s = stepScatter(E, U);
      if (!near(k, s.ratio, 1e-2))
        out.push(`potentialWell: k₁/k₂ ${k}, but √(E ÷ (E − U₀)) = ${s.ratio}`);
    }
  }
  if (spec.model === 'barrier') {
    // T ≈ e^(−2κa), with κ and a read in one length unit.
    const kappa = get(spec.kappa);
    const a = get(spec.width);
    const T = get(spec.transmission);
    const kU = INVERSE_M[unit(spec.kappa) ?? ''];
    const aU = LENGTH_M[unit(spec.width) ?? ''];
    if (kappa !== undefined && a !== undefined && kU && aU) {
      const ka = kappa * kU * a * aU;
      if (T !== undefined && !near(T, Math.exp(-2 * ka)))
        out.push(`potentialWell: T ${T}, but e^(−2κa) = ${Math.exp(-2 * ka)}`);
    }
    const E = get(spec.energy);
    const U = get(spec.height);
    const above = get(spec.above);
    if (E !== undefined && U !== undefined && above !== undefined && !near(above, U - E))
      out.push(`potentialWell: U − E ${above}, but U − E = ${U - E}`);
    // κ = √(2m(U − E)) ÷ ħ.
    const m = get(spec.mass);
    const mU = MASS_KG[unit(spec.mass) ?? ''];
    const eU = ENERGY_J[unit(spec.above) ?? ''];
    if (
      m !== undefined &&
      above !== undefined &&
      kappa !== undefined &&
      mU &&
      eU &&
      kU &&
      above > 0
    ) {
      const want = Math.sqrt(2 * m * mU * above * eU) / HBAR / kU;
      if (!near(kappa, want)) out.push(`potentialWell: κ ${kappa}, but √(2m(U − E)) ÷ ħ = ${want}`);
    }
  }
  return out;
}

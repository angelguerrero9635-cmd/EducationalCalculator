/**
 * Picture checks for the college round 2 group B kinds (`typesHe2b.ts`): HC15 `potentialWell`
 * and HC16 `unitCell`. What each draws must agree with the values and the physics. Called from
 * `repIssues` in `pictures.ts`. Test-only.
 */
import {
  AVOGADRO,
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
import {
  cellZ,
  edgeFromRadius,
  LATTICES,
  latticeOfZ,
  packing,
  planePolygon,
  spacing,
  type Lattice,
} from '@/components/module/reps/unitCellMath';

import type { NumOrVar } from '../typesGraphs';
import type { He2bSpec, PotentialWellSpec, UnitCellSpec } from '../typesHe2b';

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
  if (rep.kind === 'unitCell') return unitCellIssues(rep, get, unit);
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

function unitCellIssues(
  spec: UnitCellSpec,
  get: Get,
  unit: (x: NumOrVar | undefined) => string | undefined,
): string[] {
  const out: string[] = [];
  const named = (LATTICES as string[]).includes(spec.lattice);
  const code = named ? undefined : get(spec.lattice);
  const lattice = named
    ? (spec.lattice as Lattice)
    : code === undefined
      ? undefined
      : latticeOfZ(code);
  if (!named && code !== undefined && !lattice)
    out.push(`unitCell: structure code ${code} is not 1, 2 or 4 atoms per cell`);
  /** A length in metres by its unit (a bare number reads as the edge's unit). */
  const m = (x: NumOrVar | undefined) => {
    const v = get(x);
    if (v === undefined) return undefined;
    return v * (LENGTH_M[unit(x) ?? unit(spec.edge) ?? ''] ?? 1);
  };
  if (lattice) {
    // Z per lattice, counted from the sites drawn.
    const want = { sc: 1, bcc: 2, fcc: 4, rocksalt: 4, cesiumChloride: 1, zincBlende: 4 }[lattice];
    if (
      cellZ(lattice) !== want ||
      (lattice !== 'sc' && lattice !== 'bcc' && lattice !== 'fcc' && cellZ(lattice, 1) !== want)
    )
      out.push(`unitCell: ${lattice} counts ${cellZ(lattice)} per cell, not ${want}`);
    const Z = get(spec.atoms);
    if (Z !== undefined && Z !== want)
      out.push(`unitCell: Z ${Z}, but a ${lattice} cell holds ${want}`);
    // a from r by the touching direction.
    const a = m(spec.edge);
    const r = m(spec.radius);
    const ionic =
      lattice === 'rocksalt' || lattice === 'cesiumChloride' || lattice === 'zincBlende';
    const r2 = m(spec.cation);
    if (a !== undefined && r !== undefined && (!ionic || r2 !== undefined)) {
      const fromR = edgeFromRadius(lattice, r, r2 ?? 0);
      if (!near(a, fromR)) out.push(`unitCell: a ${a} m, but r gives ${fromR} m (${lattice})`);
    }
    // ρ = ZM ÷ (N_A a³), a in cm.
    const rho = get(spec.density);
    const M = get(spec.molar);
    if (a !== undefined && rho !== undefined && M !== undefined) {
      const want2 = (cellZ(lattice) * M) / (AVOGADRO * (a * 100) ** 3);
      if (!near(rho, want2)) out.push(`unitCell: ρ ${rho}, but ZM ÷ (N_A a³) = ${want2}`);
    }
    // Packing fraction Z(4/3)πr³ ÷ a³ (a fraction, or a percent by its unit).
    const pf = get(spec.packing);
    if (pf !== undefined && a !== undefined && r !== undefined) {
      const f = packing(lattice, a, r, r2 ?? 0) * (unit(spec.packing) === '%' ? 100 : 1);
      if (!near(pf, f)) out.push(`unitCell: packing ${pf}, but Z(4/3)πr³ ÷ a³ = ${f}`);
    }
  }
  if (spec.planes) {
    const [h, k, l] = [get(spec.planes.h), get(spec.planes.k), get(spec.planes.l)];
    if (h !== undefined && k !== undefined && l !== undefined) {
      if (![h, k, l].every((x) => Number.isInteger(x) && x >= 0) || h + k + l === 0)
        out.push(`unitCell: (${h}${k}${l}) is not whole indices, not all 0`);
      else {
        // The plane drawn crosses each axis at a ÷ h (cell units 1 ÷ h), never where it is 0.
        const poly = planePolygon(h, k, l, 1);
        const idx = [h, k, l];
        idx.forEach((v, i) => {
          if (v === 0) return;
          const p = [0, 0, 0];
          p[i] = 1 / v;
          const f = idx[0]! * p[0]! + idx[1]! * p[1]! + idx[2]! * p[2]!;
          if (Math.abs(f - 1) > 1e-9) out.push(`unitCell: intercept ${i} is off the plane`);
        });
        if (poly.length < 3) out.push(`unitCell: (${h}${k}${l}) draws no plane in the cell`);
        for (const p of poly)
          if (Math.abs(h * p[0] + k * p[1] + l * p[2] - 1) > 1e-9)
            out.push('unitCell: a plane corner is off the plane');
        const a = get(spec.edge);
        const d = get(spec.planes.spacing);
        if (a !== undefined && d !== undefined && unit(spec.edge) === unit(spec.planes.spacing)) {
          const want = spacing(a, h, k, l);
          if (!near(d, want)) out.push(`unitCell: d ${d}, but a ÷ √(h² + k² + l²) = ${want}`);
        }
      }
    }
  }
  if (spec.bragg) {
    const b = spec.bragg;
    const d = m(b.spacing);
    const lam =
      get(b.wavelength) === undefined
        ? undefined
        : get(b.wavelength)! * (LENGTH_M[unit(b.wavelength) ?? ''] ?? 1);
    const tt = get(b.twoTheta);
    const th = get(b.angle);
    if (tt !== undefined && th !== undefined && !near(tt, 2 * th))
      out.push(`unitCell: 2θ ${tt}, but 2 × θ = ${2 * th}`);
    const theta = th ?? (tt === undefined ? undefined : tt / 2);
    const n = get(b.order) ?? 1;
    if (d !== undefined && lam !== undefined && theta !== undefined) {
      const path = 2 * d * Math.sin((theta * Math.PI) / 180);
      if (!near(n * lam, path)) out.push(`unitCell: nλ ${n * lam} m, but 2d sin θ = ${path} m`);
    }
  }
  return out;
}

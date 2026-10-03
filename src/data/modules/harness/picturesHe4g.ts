/**
 * Picture checks for the college pictures of round 4, group G (`typesHe4g.ts`): what each one
 * draws must agree with the page's values and the relation it shows. Called from `repIssues` in
 * `pictures.ts`. `val` reads formula units (see `siOf`). Test-only.
 */
import {
  G_EARTH,
  KAPPA,
  mixingOf,
  R_DRY,
  scaleHeightOf,
  TETENS,
  tetensOf,
  thetaOf,
  thicknessOf,
} from '@/components/module/reps/he4gMath';

import type { He4gSpec } from '../typesHe4g';

type Val = (id: string) => number | undefined;

/** Equal to 1e-4 of the larger (values are rounded when shown, then worked on). */
const near = (a: number, b: number, tol = 1e-4) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

const read = (val: Val, x: number | string | undefined, fallback?: number) => {
  const y = x === undefined ? fallback : typeof x === 'number' ? x : val(x);
  return y === undefined || Number.isNaN(y) ? undefined : y;
};

export function he4gIssues(rep: He4gSpec, val: Val): string[] {
  const out: string[] = [];
  const n = (x: number | string | undefined, d?: number) => read(val, x, d);
  switch (rep.mode) {
    case 'thickness': {
      // Δz = (R_d T̄ ÷ g) ln(p₁ ÷ p₂) to 1 m (p₂ at or above p₁ draws no layer); H = R_d T̄ ÷ g.
      const per = rep.unit === 'km' ? 1000 : 1;
      const [p1, p2, t] = [n(rep.lower), n(rep.upper), n(rep.temperature)];
      const [g, rd] = [n(rep.g, G_EARTH), n(rep.gasConstant, R_DRY)];
      if (p1 !== undefined && p1 <= 0) out.push(`thickness: p₁ ${p1} hPa is not positive`);
      if (rep.temperature === undefined && rep.scaleHeight === undefined)
        out.push('thickness: neither a temperature nor a scale height to draw the column from');
      const hm =
        t !== undefined && g !== undefined && rd !== undefined
          ? scaleHeightOf(t, g, rd)
          : undefined;
      const hPage = n(rep.scaleHeight);
      if (hm !== undefined && hPage !== undefined && !near(hPage * per, hm))
        out.push(`thickness: H ${hPage} ${rep.unit ?? 'm'}, but R_d T̄ ÷ g = ${hm} m`);
      const h = hPage !== undefined ? hPage * per : hm;
      const dz = n(rep.thickness);
      if (
        h !== undefined &&
        p1 !== undefined &&
        p2 !== undefined &&
        p2 > 0 &&
        p2 < p1 &&
        dz !== undefined
      ) {
        const want = thicknessOf(h, p1, p2);
        if (Math.abs(dz * per - want) > 1)
          out.push(`thickness: Δz ${dz * per} m, but H ln(p₁ ÷ p₂) = ${want} m`);
      }
      break;
    }
    case 'adiabat': {
      // θ = T(1,000 ÷ p)^κ: the parcel's adiabat reaches 1,000 hPa at the page's θ.
      const [t, p, k] = [n(rep.temperature), n(rep.pressure), n(rep.kappa, KAPPA)];
      if (t !== undefined && t <= 0) out.push(`adiabat: T ${t} K is not above absolute zero`);
      if (p !== undefined && p <= 0) out.push(`adiabat: p ${p} hPa is not positive`);
      const th = n(rep.theta);
      if (t !== undefined && p !== undefined && p > 0 && k !== undefined && th !== undefined) {
        const want = thetaOf(t, p, k);
        if (!near(th, want)) out.push(`adiabat: θ ${th} K, but T(1,000 ÷ p)^κ = ${want} K`);
      }
      break;
    }
    case 'saturation': {
      // Tetens at T and at T_d; RH = 100e ÷ eₛ; r = 622e ÷ (p − e); the point at T_d ≤ T.
      const co = rep.coefficients ?? TETENS;
      const [t, td] = [n(rep.temperature), n(rep.dewPoint)];
      if (t === undefined || td === undefined) break;
      if (td > t + 1e-9) break; // drawn at T, the caption says why
      const es = tetensOf(t, co);
      const e = tetensOf(td, co);
      const same = (x: number | string | undefined, want: number, what: string) => {
        const y = n(x);
        if (y !== undefined && !near(y, want)) out.push(`saturation: ${what} ${y}, but ${want}`);
      };
      same(rep.saturation, es, 'eₛ');
      same(rep.vapor, e, 'e');
      same(rep.rh, (100 * e) / es, 'RH');
      const p = n(rep.pressure);
      if (p !== undefined && p > e) same(rep.mixing, mixingOf(e, p), 'r');
      break;
    }
  }
  return out;
}

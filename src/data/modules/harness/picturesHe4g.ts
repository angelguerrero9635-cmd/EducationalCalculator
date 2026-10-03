/**
 * Picture checks for the college pictures of round 4, group G (`typesHe4g.ts`): what each one
 * draws must agree with the page's values and the relation it shows. Called from `repIssues` in
 * `pictures.ts`. `val` reads formula units (see `siOf`). Test-only.
 */
import {
  G_EARTH,
  KAPPA,
  layerBudget,
  lclOf,
  mixingOf,
  R_DRY,
  wennerOf,
  airyRootOf,
  G_NEWTON,
  HALF_WIDTH,
  sphereMassOf,
  spherePeakOf,
  snellSpeeds,
  scaleHeightOf,
  TETENS,
  tetensOf,
  thetaOf,
  thicknessOf,
} from '@/components/module/reps/he4gMath';

import { absorbedOf, balanceTemp, SOLAR_CONSTANT } from '@/components/module/reps/earthModelHs2f';

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
  if (rep.kind === 'electrodeArray') {
    // R = V ÷ I; ρ_a = 2πaV ÷ I; the electrodes are drawn a apart, equally.
    const [a, v, i] = [n(rep.spacing), n(rep.voltage), n(rep.current)];
    if (a !== undefined && a <= 0) out.push(`electrodeArray: spacing ${a} m is not positive`);
    if (a === undefined || v === undefined || i === undefined || a <= 0 || i <= 0) return out;
    const r = n(rep.resistance);
    if (r !== undefined && !near(r, v / i))
      out.push(`electrodeArray: R ${r}, but V ÷ I = ${v / i}`);
    const rho = n(rep.resistivity);
    if (rho !== undefined && !near(rho, wennerOf(a, v, i)))
      out.push(`electrodeArray: ρ_a ${rho}, but 2πaV ÷ I = ${wennerOf(a, v, i)}`);
    return out;
  }
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
    case 'parcel': {
      // The lines meet at (T − T_d) ÷ (dry − dewLapse) km, where the parcel is T − dry × base.
      const [t, td] = [n(rep.temperature), n(rep.dewPoint)];
      const [dry, dew] = [n(rep.dry, 10), n(rep.dewLapse, 2)];
      if (dry !== undefined && dew !== undefined && dry <= dew)
        out.push(`parcel: dry lapse ${dry} is not above the dew point's ${dew} °C/km`);
      if (t === undefined || td === undefined || dry === undefined || dew === undefined) break;
      if (td > t) out.push(`parcel: dew point ${td} °C is above the temperature ${t} °C`);
      if (dry <= dew || td > t) break;
      const h = lclOf(t, td, dry, dew);
      const per = rep.baseUnit === 'm' ? 1000 : 1;
      const base = n(rep.base);
      if (base !== undefined && !near(base, h * per))
        out.push(`parcel: cloud base ${base}, but the lines meet at ${h * per}`);
      const tb = n(rep.baseTemperature);
      if (tb !== undefined && !near(tb, t - dry * h))
        out.push(`parcel: ${tb} °C at the base, but T − dry × base = ${t - dry * h} °C`);
      break;
    }
    case 'balance': {
      // F = S(1 − α) ÷ 4, σTₑ⁴ = F, T_s = Tₑ(2 ÷ (2 − ε))^(1/4); the bands balance at the top
      // ((1 − ε)G + εG ÷ 2 = F), in the layer (εG = 2 × εG ÷ 2) and at the ground (F + εG ÷ 2 = G).
      const [a, s, eps] = [n(rep.albedo), n(rep.sunlight, SOLAR_CONSTANT), n(rep.layer.emissivity)];
      if (eps !== undefined && (eps < 0 || eps > 1)) out.push(`balance: ε ${eps} is not 0–1`);
      if (a === undefined || s === undefined || eps === undefined || eps < 0 || eps > 1) break;
      const f = absorbedOf(s, a);
      const te = balanceTemp(f);
      const b = layerBudget(f, eps);
      const same = (x: number | string | undefined, want: number, what: string) => {
        const y = n(x);
        if (y !== undefined && !near(y, want)) out.push(`balance: ${what} ${y}, but ${want}`);
      };
      same(rep.absorbed, f, 'F');
      same(rep.temperature, te, 'Tₑ');
      same(rep.layer.surface, b.surfaceTemp(te), 'T_s');
      if (!near(b.through + b.half, f, 1e-9)) out.push('balance: the top does not balance');
      if (!near(b.absorbed, 2 * b.half, 1e-9)) out.push('balance: the layer does not balance');
      if (!near(f + b.half, b.ground, 1e-9)) out.push('balance: the ground does not balance');
      break;
    }
    case 'sphere': {
      // mass = (4 ÷ 3)πR³Δρ; Δg_max = G × mass ÷ z² (mGal); x½ = 0.766z; buried: z > R.
      const [r, d, z, g] = [n(rep.radius), n(rep.contrast), n(rep.depth), n(rep.G, G_NEWTON)];
      if (r !== undefined && r <= 0) out.push(`sphere: radius ${r} m is not positive`);
      if (r === undefined || d === undefined || z === undefined || g === undefined || r <= 0) break;
      if (z <= r) break; // drawn faded: "the sphere must be buried"
      const mass = sphereMassOf(r, d);
      const same = (x: number | string | undefined, want: number, what: string, tol = 1e-4) => {
        const y = n(x);
        if (y !== undefined && !near(y, want, tol)) out.push(`sphere: ${what} ${y}, but ${want}`);
      };
      same(rep.mass, mass, 'mass');
      same(rep.peak, spherePeakOf(mass, z, g), 'Δg_max');
      // The page writes 0.766z; the curve's half point is z√(2^(2/3) − 1) = 0.76631z.
      same(rep.halfWidth, HALF_WIDTH * z, 'x½', 1e-3);
      break;
    }
    case 'airy': {
      // r = hρ_c ÷ (ρ_m − ρ_c); total = T + h + r; the columns weigh the same.
      const [h, t, rc, rm] = [n(rep.height), n(rep.thickness), n(rep.crust), n(rep.mantle)];
      if (h === undefined || t === undefined || rc === undefined || rm === undefined) break;
      if (rm <= rc) break; // drawn without a root: the caption says the mantle must be denser
      const r = airyRootOf(h, rc, rm);
      const root = n(rep.root);
      if (root !== undefined && !near(root, r)) out.push(`airy: root ${root}, but ${r} km`);
      const tot = n(rep.total);
      if (tot !== undefined && !near(tot, t + h + r))
        out.push(`airy: crust ${tot}, but T + h + r = ${t + h + r} km`);
      if (!near(rc * (h + t + r), rc * t + rm * r, 1e-9))
        out.push('airy: the two columns do not weigh the same');
      break;
    }
    case 'refraction': {
      // sin r = (v₂ ÷ v₁) sin i; i_c = sin⁻¹(v₁ ÷ v₂) only into a faster layer; past it no r.
      const [v1, v2, i] = [n(rep.speeds.v1), n(rep.speeds.v2), n(rep.angle)];
      if (v1 !== undefined && v1 <= 0) out.push(`refraction: v₁ ${v1} m/s is not positive`);
      if (v2 !== undefined && v2 <= 0) out.push(`refraction: v₂ ${v2} m/s is not positive`);
      if (v1 === undefined || v2 === undefined || v1 <= 0 || v2 <= 0) break;
      const ic = n(rep.critical);
      const sn = snellSpeeds(v1, v2, i ?? 0);
      if (ic !== undefined && sn.critical === undefined)
        out.push(`refraction: a critical angle ${ic}° into a slower layer`);
      if (ic !== undefined && sn.critical !== undefined && !near(ic, sn.critical))
        out.push(`refraction: i_c ${ic}°, but sin⁻¹(v₁ ÷ v₂) = ${sn.critical}°`);
      const r = n(rep.refracted);
      if (i === undefined || r === undefined) break;
      if (sn.total) out.push(`refraction: r ${r}° past the critical angle, where no ray enters`);
      else if (!near(r, sn.refracted!))
        out.push(`refraction: r ${r}°, but sin r = (v₂ ÷ v₁) sin i gives ${sn.refracted}°`);
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

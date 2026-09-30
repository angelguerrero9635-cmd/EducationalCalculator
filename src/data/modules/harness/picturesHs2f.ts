/**
 * Picture checks for the Grades 9–12 round 2 group F options (`typesHs2f.ts`, earth and space
 * H103): what each one draws must agree with the values and with the science. Called from
 * `repIssues` in `pictures.ts` beside the kind's own checks. Test-only.
 */
import {
  amplitudeRatio,
  energyRatio,
  MAGNITUDE_RANGE,
  STRIPE_RECORD,
  cloudBase,
  massLifetime,
  massLuminosity,
  MASS_RANGE,
  absorbedOf,
  balanceTemp,
  SOLAR_CONSTANT,
} from '@/components/module/reps/earthModelHs2f';

import type { Representation } from '../types';

/** Equal to display rounding. */
const near = (a: number, b: number, tol = 1e-6) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

export function hs2fIssues(rep: Representation, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined, d?: number) => {
    const y = x === undefined ? d : typeof x === 'number' ? x : val(x);
    return y === undefined || Number.isNaN(y) ? undefined : y;
  };
  if (rep.kind === 'earthLayers' && rep.mode === 'magnitude') {
    const m1 = num(rep.m1);
    const m2 = num(rep.m2);
    for (const m of [m1, m2])
      if (m !== undefined && (m < MAGNITUDE_RANGE.min || m > MAGNITUDE_RANGE.max))
        out.push(`magnitude ${m} is off the 0–10 scale`);
    if (m1 === undefined || m2 === undefined) return out;
    // The bracket and caption say 10^ΔM and 10^(1.5 ΔM): the page's values must agree.
    const a = num(rep.amplitude);
    if (a !== undefined && !near(a, amplitudeRatio(m1, m2), 1e-4))
      out.push(`amplitude ratio ${a}, but 10^(${m2} − ${m1}) = ${amplitudeRatio(m1, m2)}`);
    const e = num(rep.energy);
    if (e !== undefined && !near(e, energyRatio(m1, m2), 1e-4))
      out.push(`energy ratio ${e}, but 10^(1.5 × (${m2} − ${m1})) = ${energyRatio(m1, m2)}`);
  }
  if (rep.kind === 'oceanProfile' && rep.mode === 'stripes') {
    const x = num(rep.distance);
    const t = num(rep.age);
    if (t !== undefined && (t <= 0 || t > STRIPE_RECORD))
      out.push(`rock age ${t} million years is not in the 0–${STRIPE_RECORD} drawn`);
    if (x !== undefined && x < 0) out.push(`distance ${x} km is negative`);
    // The stripes sit at the half rate: the rock is drawn at its age, so distance ÷ age = rate.
    const v = num(rep.rate);
    if (x !== undefined && t !== undefined && t > 0 && v !== undefined && !near(v, x / t, 1e-4))
      out.push(`half rate ${v}, but ${x} ÷ ${t} = ${x / t}`);
    const f = num(rep.full);
    const half = v ?? (x !== undefined && t !== undefined && t > 0 ? x / t : undefined);
    if (f !== undefined && half !== undefined && !near(f, 2 * half, 1e-4))
      out.push(`full rate ${f}, but 2 × ${half} = ${2 * half}`);
  }
  if (rep.kind === 'atmosphereLayers' && rep.mode === 'parcel') {
    const t = num(rep.temperature);
    const td = num(rep.dewPoint);
    if (t === undefined || td === undefined) return out;
    if (td > t) out.push(`dew point ${td} °C is above the temperature ${t} °C`);
    // The lines drawn meet at (T − T_d) ÷ 8 km: the page's cloud base must be there.
    const h = num(rep.base);
    if (h !== undefined && !near(h, cloudBase(t, td), 1e-4))
      out.push(`cloud base ${h} km, but the lines meet at ${cloudBase(t, td)} km`);
  }
  if (rep.kind === 'atmosphereLayers' && rep.mode === 'balance') {
    const a = num(rep.albedo);
    const s = num(rep.sunlight, SOLAR_CONSTANT);
    if (a !== undefined && (a < 0 || a > 1)) out.push(`albedo ${a} is not 0–1`);
    if (s !== undefined && s <= 0) out.push(`sunlight ${s} W/m² is not positive`);
    if (a === undefined || s === undefined) return out;
    // The bands split S ÷ 4 into α and 1 − α; the infrared out equals what is absorbed.
    const f = num(rep.absorbed);
    if (f !== undefined && !near(f, absorbedOf(s, a), 1e-4))
      out.push(`absorbed ${f}, but ${s} × (1 − ${a}) ÷ 4 = ${absorbedOf(s, a)}`);
    const t = num(rep.temperature);
    const want = balanceTemp(f ?? absorbedOf(s, a));
    if (t !== undefined && !near(t, want, 1e-4))
      out.push(`Tₑ ${t} K, but σTₑ⁴ = F gives ${want} K`);
  }
  if (rep.kind === 'reserve') {
    const q = num(rep.reserve);
    const r = num(rep.rate);
    if (q !== undefined && q <= 0) out.push(`reserve ${q} is not positive`);
    if (r !== undefined && r <= 0) out.push(`use ${r} a year is not positive`);
    // The bar is cut into slices of r: it empties after Q ÷ r of them.
    const y = num(rep.years);
    if (q !== undefined && r !== undefined && r > 0 && y !== undefined && !near(y, q / r, 1e-4))
      out.push(`lasts ${y} years, but ${q} ÷ ${r} = ${q / r}`);
  }
  if (rep.kind === 'rockLayers' && 'dating' in rep && rep.dating.sample?.second) {
    const { share, name } = rep.dating.sample.second;
    if (!(share > 0 && share < 100)) out.push(`${name} takes ${share}% of decays, not 0–100`);
  }
  if (rep.kind === 'hrDiagram' && 'mass' in rep) {
    const m = num(rep.mass);
    if (m === undefined) return out;
    if (m < MASS_RANGE.min || m > MASS_RANGE.max)
      out.push(`mass ${m} M☉ is off the main sequence drawn (${MASS_RANGE.min}–${MASS_RANGE.max})`);
    // The dot sits at L = M^3.5 on the main sequence; the caption's lifetime is 10¹⁰ × M^−2.5.
    const l = num(rep.luminosity);
    if (l !== undefined && !near(l, massLuminosity(m), 1e-4))
      out.push(`L ${l}, but ${m}^3.5 = ${massLuminosity(m)}`);
    const t = num(rep.lifetime);
    if (t !== undefined && !near(t, massLifetime(m), 1e-4))
      out.push(`lifetime ${t}, but 10¹⁰ × ${m}^−2.5 = ${massLifetime(m)}`);
  }
  if (rep.kind === 'streamChannel') {
    const w = num(rep.width);
    const d = num(rep.depth);
    const v = num(rep.speed);
    for (const [name, x] of [
      ['width', w],
      ['depth', d],
      ['speed', v],
    ] as const)
      if (x !== undefined && x <= 0) out.push(`stream ${name} ${x} is not positive`);
    // The front face is w × d and the slab behind it v long: A = w × d, Q = A × v.
    const a = num(rep.area);
    if (a !== undefined && w !== undefined && d !== undefined && !near(a, w * d, 1e-4))
      out.push(`area ${a}, but ${w} × ${d} = ${w * d}`);
    const q = num(rep.discharge);
    const area = a ?? (w !== undefined && d !== undefined ? w * d : undefined);
    if (q !== undefined && area !== undefined && v !== undefined && !near(q, area * v, 1e-4))
      out.push(`discharge ${q}, but ${area} × ${v} = ${area * v}`);
  }
  return out;
}

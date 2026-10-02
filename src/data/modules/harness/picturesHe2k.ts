/**
 * Harness checks for the college pictures, round 2, group K: the college options of
 * `chemDiagram` mode `rate` (HC34) and the `globe` kind (HC36). Each check recomputes what the
 * picture draws, with the picture's own math, and compares it with the page's values. Called
 * from `pictures.ts`.
 */
import {
  arrheniusEa,
  consecutive,
  halfLife,
  integratedConc,
  peakConc,
  peakTime,
  runOut,
  timeToFraction,
} from '@/components/module/reps/rateHe2kMath';

import {
  EARTH_KM,
  RAD,
  RIM_MS,
  centralAngle,
  dayLength,
  drawnAngle,
  inclination,
  litShare,
  momentumWind,
  noonAngle,
  plateSpeed,
  sunriseHour,
  toVec,
} from '@/components/module/reps/globeMath';

import type { ChemRateHe2kSpec, GlobeSpec } from '../typesHe2k';

type Val = (x: string | number) => number | undefined;
type UnitOf = (x: string | number | undefined) => string | undefined;

const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(Math.abs(a), Math.abs(b)) + 1e-9;

export function chemRateHe2kIssues(rep: ChemRateHe2kSpec, val: Val, unitOf: UnitOf): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const same = (what: string, shown: number | undefined, drawn: number, tol?: number) => {
    if (shown !== undefined && Number.isFinite(drawn) && !near(shown, drawn, tol))
      out.push(`${what} is drawn as ${drawn}, the value shows ${shown}`);
  };
  const set = [rep.integrated, rep.arrhenius, rep.consecutive].filter(Boolean).length;
  if (set !== 1)
    out.push(`a college rate picture sets one of integrated, arrhenius, consecutive (${set} set)`);

  const i = rep.integrated;
  if (i) {
    if (![0, 1, 2].includes(i.order)) out.push(`order ${i.order} (the picture draws 0, 1 or 2)`);
    const [k, A0, t] = [num(i.k), num(i.start), num(i.t)];
    if (k !== undefined && k < 0) out.push(`k = ${k} is negative: no curve`);
    if (A0 !== undefined && A0 < 0) out.push(`[A]₀ = ${A0} is negative: no curve`);
    if (k && A0 && k > 0 && A0 > 0) {
      same('the half-life', num(i.half), halfLife(i.order, k, A0));
      // Half-life spacing: constant for order 1, doubling for order 2.
      const [h1, h2, h3] = [1, 2, 3].map((n) => timeToFraction(i.order, k, A0, n));
      if (i.order === 1 && !(near(h2! - h1!, h1!, 1e-9) && near(h3! - h2!, h1!, 1e-9)))
        out.push('first-order half-lives are not evenly spaced');
      if (i.order === 2 && !near(h2! - h1!, 2 * h1!, 1e-9))
        out.push('second-order half-lives do not double');
      if (t !== undefined) {
        if (t < 0) out.push(`t = ${t} is before the start`);
        const tEnd = runOut(k, A0);
        if (i.order === 0 && t > tEnd * (1 + 1e-9))
          out.push(`t = ${t} is past the time it runs out (${tEnd}): the page limits t ≤ [A]₀ ÷ k`);
        const drawn = Math.max(0, integratedConc(i.order, k, A0, t));
        same('[A] at t (the curve through the page’s point)', num(i.conc), drawn);
      }
    }
  }

  const a = rep.arrhenius;
  if (a) {
    const [k1, T1, k2, T2] = [num(a.k1), num(a.T1), num(a.k2), num(a.T2)];
    const K = (T: number) => (unitOf(a.T1) === '°C' ? T + 273.15 : T);
    const R = a.R === undefined ? 8.314 : num(a.R);
    if ([k1, k2].some((x) => x !== undefined && x < 0))
      out.push('a rate constant is negative: no ln k');
    if (k1 && k2 && T1 !== undefined && T2 !== undefined && R !== undefined && k1 > 0 && k2 > 0) {
      if (K(T1) <= 0 || K(T2) <= 0) out.push('a temperature is at or below absolute zero');
      else if (near(K(T1), K(T2), 1e-9)) out.push('the two temperatures are the same: no slope');
      else {
        const Ea = arrheniusEa(k1, K(T1), k2, K(T2), R);
        const scale = unitOf(a.Ea) === 'J/mol' ? 1 : 1000;
        same('Eₐ (−R × the slope)', num(a.Ea), Ea / scale);
      }
    }
  }

  const s = rep.consecutive;
  if (s) {
    const [k1, k2, A0, t] = [num(s.k1), num(s.k2), num(s.start), num(s.t)];
    if ([k1, k2, A0].some((x) => x !== undefined && x < 0))
      out.push('k₁, k₂ and [A]₀ must not be negative');
    if (k1 && k2 && A0 && k1 > 0 && k2 > 0 && A0 > 0) {
      const tm = peakTime(k1, k2);
      same('t_max', num(s.tmax), tm);
      same('B’s peak', num(s.peak), peakConc(k1, k2, A0));
      // B peaks at t_max: it is no higher just before or after.
      const Bm = consecutive(k1, k2, A0, tm).B;
      for (const f of [0.98, 1.02])
        if (consecutive(k1, k2, A0, tm * f).B > Bm * (1 + 1e-12))
          out.push(`B at ${f} t_max is above its peak`);
      // [A] + [B] + [C] = [A]₀ at every point drawn.
      for (let n = 0; n <= 40; n++) {
        const v = consecutive(k1, k2, A0, (n / 10) * tm);
        if (!near(v.A + v.B + v.C, A0, 1e-9)) {
          out.push(`[A] + [B] + [C] is ${v.A + v.B + v.C}, not [A]₀ = ${A0}`);
          break;
        }
        if (v.B < -1e-12 || v.C < -1e-12) {
          out.push('a concentration goes below zero');
          break;
        }
      }
      if (t !== undefined && t < 0) out.push(`t = ${t} is before the start`);
      if (t !== undefined && s.at) {
        const v = consecutive(k1, k2, A0, t);
        const names = s.species ?? ['A', 'B', 'C'];
        [v.A, v.B, v.C].forEach((x, j) => same(`${names[j]} at t`, num(s.at![j]), x));
      }
    }
  }
  return out;
}

export function globeIssues(rep: GlobeSpec, val: Val): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const same = (what: string, shown: number | undefined, drawn: number, tol = 2e-3) => {
    if (shown !== undefined && Number.isFinite(drawn) && !near(shown, drawn, tol))
      out.push(`${what} is drawn as ${drawn}, the value shows ${shown}`);
  };
  const latOk = (x: number | undefined, what: string) => {
    if (x !== undefined && Math.abs(x) > 90) out.push(`${what} ${x}° is past a pole`);
  };
  switch (rep.mode) {
    case 'sun': {
      const [lat, dec] = [num(rep.latitude), num(rep.declination)];
      latOk(lat, 'latitude');
      if (dec !== undefined && Math.abs(dec) > 23.5)
        out.push(`declination ${dec}° is past a tropic`);
      if (lat === undefined || dec === undefined) break;
      // Noon within 0.1°; the lit share of the parallel is H ÷ 180, so the day is 24 × share.
      const noon = num(rep.noon);
      if (noon !== undefined && Math.abs(noon - noonAngle(lat, dec)) > 0.1)
        out.push(`the noon angle is drawn as ${noonAngle(lat, dec)}, the value shows ${noon}`);
      const H = sunriseHour(lat, dec);
      same('the sunrise hour angle H', num(rep.hour), H);
      same('the day length', num(rep.day), dayLength(lat, dec));
      if (!near(litShare(lat, dec) * 24, dayLength(lat, dec), 1e-9))
        out.push('the lit share of the parallel is not H ÷ 180');
      break;
    }
    case 'route': {
      const [a1, o1, a2, o2] = [num(rep.lat1), num(rep.lon1), num(rep.lat2), num(rep.lon2)];
      latOk(a1, 'latitude 1');
      latOk(a2, 'latitude 2');
      if (a1 === undefined || o1 === undefined || a2 === undefined || o2 === undefined) break;
      const c = centralAngle(a1, o1, a2, o2);
      // The angle the picture draws (between the two places' vectors) is the law of cosines'.
      const drawn = drawnAngle(toVec(a1, o1), toVec(a2, o2));
      if (Math.abs(drawn - c) > 1e-6) out.push(`the drawn central angle ${drawn}° is not ${c}°`);
      same('the central angle', num(rep.angle), c);
      const R = rep.radius === undefined ? EARTH_KM : num(rep.radius);
      if (R !== undefined) same('the distance', num(rep.km), R * c * RAD);
      break;
    }
    case 'euler': {
      const [w, D] = [num(rep.omega), num(rep.distance)];
      if (D !== undefined && (D < 0 || D > 180)) out.push(`Δ = ${D}° is not 0° to 180°`);
      const R = rep.radius === undefined ? EARTH_KM : num(rep.radius);
      if (w !== undefined && D !== undefined && R !== undefined)
        same('v = ωR sin Δ', num(rep.speed), plateSpeed(w, D, R));
      break;
    }
    case 'dipole': {
      const [I, lat] = [num(rep.inclination), num(rep.latitude)];
      latOk(lat, 'latitude');
      if (I !== undefined && lat !== undefined && Math.abs(lat) < 90)
        same('the inclination (tan I = 2 tan φ)', I, inclination(lat));
      break;
    }
    case 'momentum': {
      const lat = num(rep.latitude);
      latOk(lat, 'latitude');
      const rim = rep.rim === undefined ? RIM_MS : num(rep.rim);
      if (lat !== undefined && rim !== undefined && Math.abs(lat) < 90)
        same('u = ΩR sin²φ ÷ cos φ', num(rep.wind), momentumWind(lat, rim));
      break;
    }
  }
  return out;
}

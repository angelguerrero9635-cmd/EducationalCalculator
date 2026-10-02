/**
 * HC43 (round 3, group G): the sums behind `gasPiston` `pv` and `real`, shared by the picture
 * and its harness check. Values are in the page's own units: P in what R and V give (kPa for
 * J/(mol·K) and L), V as the page has it.
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { GasPath, GasPv } from '@/data/modules/typesHe3g';

export interface PvState {
  v: number;
  p: number;
}

/** The gas constant in J/(mol·K), the default for the P–V diagram. */
export const R_J = 8.314;

/** Whether R is the L·atm value (0.08206 or 0.0821): pressures in atm, work in L·atm. */
export const isLatm = (R: number) => Math.abs(R - 0.08206) < 0.0002;

/** The pressure axis's unit for a volume unit and R (J/(mol·K) unless R is the L·atm value). */
export function pressureUnitFor(vUnit: string | undefined, R: number): string {
  if (isLatm(R)) return 'atm';
  switch (vUnit) {
    case 'm³':
      return 'Pa';
    case 'mL':
    case 'cm³':
      return 'MPa';
    case 'kL':
      return 'Pa';
    default:
      return 'kPa';
  }
}

/** P along a path from state `a` at volume v (isochoric: undefined, V is held). */
export function pathPressure(path: GasPath, a: PvState, v: number, gamma = 1.4): number {
  switch (path) {
    case 'isothermal':
      return (a.p * a.v) / v;
    case 'adiabatic':
      return a.p * (a.v / v) ** gamma;
    case 'isobaric':
      return a.p;
    case 'isochoric':
      return a.p;
  }
}

/** ∫P dV from a to b along the path: the work done by the gas (negative when compressed). */
export function pathWork(path: GasPath, a: PvState, b: PvState, gamma = 1.4): number {
  switch (path) {
    case 'isothermal':
      return a.p * a.v * Math.log(b.v / a.v);
    case 'adiabatic':
      return Math.abs(gamma - 1) < 1e-12
        ? a.p * a.v * Math.log(b.v / a.v)
        : (a.p * a.v - b.p * b.v) / (gamma - 1);
    case 'isobaric':
      return a.p * (b.v - a.v);
    case 'isochoric':
      return 0;
  }
}

/**
 * Points along a leg from a to b (V, P): the curve drawn and the area summed. Curved legs are
 * spaced evenly in ln V, finely enough that the shaded area is the work to 0.01%.
 */
export function legPoints(path: GasPath, a: PvState, b: PvState, gamma = 1.4): [number, number][] {
  if (path === 'isochoric' || path === 'isobaric')
    return [
      [a.v, a.p],
      [b.v, path === 'isobaric' ? a.p : b.p],
    ];
  const span = Math.log(b.v / a.v);
  const n = Math.min(600, Math.max(48, Math.ceil(Math.abs(span) * 60)));
  return Array.from({ length: n + 1 }, (_, i) => {
    const v = i === n ? b.v : a.v * Math.exp((span * i) / n);
    return [v, pathPressure(path, a, v, gamma)];
  });
}

/** The trapezoid sum of P dV over points (V, P) in order: the area the picture shades. */
export function areaUnder(points: [number, number][]): number {
  let s = 0;
  for (let i = 1; i < points.length; i++) {
    const [v0, p0] = points[i - 1]!;
    const [v1, p1] = points[i]!;
    s += ((p0 + p1) / 2) * (v1 - v0);
  }
  return s;
}

/** State 2's pressure by the path from state 1 to volume v₂ (isochoric needs p₂ given). */
export function endPressure(path: GasPath, a: PvState, v2: number, gamma = 1.4): number {
  return pathPressure(path, a, v2, gamma);
}

/** The van der Waals pressure nRT ÷ (V − nb) − an² ÷ V² and its two parts. */
export function vdw(n: number, V: number, T: number, a: number, b: number, R: number) {
  const repel = (n * R * T) / (V - n * b);
  const attract = (a * n * n) / (V * V);
  return { ideal: (n * R * T) / V, repel, attract, p: repel - attract };
}

export interface PvSolved {
  states: (PvState & { t?: number })[];
  legs: GasPath[];
  gamma: number;
  closed: boolean;
}

/** The states the values give (known values only): undefined where one can't be placed. */
export function solvePv(
  pv: GasPv,
  num: (x: NumOrVar | undefined) => number | undefined,
): PvSolved | undefined {
  const R = pv.R ?? R_J;
  const n = num(pv.moles);
  const cv = num(pv.cv);
  const gamma = num(pv.gamma) ?? (cv !== undefined && cv > 0 ? 1 + R / cv : undefined);
  const pOf = (v: number | undefined, p: number | undefined, t: number | undefined) =>
    p ??
    (v !== undefined && t !== undefined && n !== undefined && v > 0 ? (n * R * t) / v : undefined);
  if (pv.path === 'cycle') {
    const corners = pv.corners ?? [];
    const legs = pv.legs ?? [];
    if (corners.length < 2 || legs.length < corners.length) return undefined;
    if (legs.includes('adiabatic') && gamma === undefined) return undefined;
    const states: (PvState & { t?: number })[] = [];
    for (const c of corners) {
      const v = num(c.volume);
      const t = num(c.temperature);
      const p = pOf(v, num(c.pressure), t);
      if (v === undefined || p === undefined || !(v > 0) || !(p > 0)) return undefined;
      states.push({ v, p, t: t ?? (n ? (p * v) / (n * R) : undefined) });
    }
    return { states, legs: legs.slice(0, corners.length), gamma: gamma ?? 1.4, closed: true };
  }
  const path = pv.path;
  const [v1, t1] = [num(pv.v1), num(pv.t1)];
  const p1 = pOf(v1, num(pv.p1), t1);
  if (v1 === undefined || p1 === undefined || !(v1 > 0) || !(p1 > 0)) return undefined;
  const a = { v: v1, p: p1, t: t1 ?? (n ? (p1 * v1) / (n * R) : undefined) };
  if (path === 'adiabatic' && gamma === undefined)
    return { states: [a], legs: [], gamma: 1.4, closed: false };
  const g = gamma ?? 1.4;
  let v2 = path === 'isochoric' ? v1 : num(pv.v2);
  let p2: number | undefined;
  if (path === 'isochoric') {
    const t2 = num(pv.t2);
    p2 =
      num(pv.p2) ??
      pOf(v1, undefined, t2) ??
      (t2 !== undefined && a.t ? (p1 * t2) / a.t : undefined);
  } else if (v2 !== undefined && v2 > 0) p2 = pathPressure(path, a, v2, g);
  if (v2 === undefined || p2 === undefined || !(v2 > 0) || !(p2 > 0)) {
    v2 = undefined;
    return { states: [a], legs: [], gamma: g, closed: false };
  }
  const b = { v: v2, p: p2, t: a.t !== undefined ? (a.t * p2 * v2) / (p1 * v1) : undefined };
  return { states: [a, b], legs: [path], gamma: g, closed: false };
}

/** The work by the gas over the legs drawn (the enclosed area for a cycle, clockwise +). */
export function pvWork(s: PvSolved): number {
  let w = 0;
  s.legs.forEach((leg, i) => {
    const a = s.states[i]!;
    const b = s.states[(i + 1) % s.states.length]!;
    w += pathWork(leg, a, b, s.gamma);
  });
  return w;
}

/** The points drawn for every leg, in order (the shaded outline). */
export function pvOutline(s: PvSolved): [number, number][] {
  const out: [number, number][] = [];
  s.legs.forEach((leg, i) => {
    const a = s.states[i]!;
    const b = s.states[(i + 1) % s.states.length]!;
    out.push(...legPoints(leg, a, b, s.gamma));
  });
  return out;
}

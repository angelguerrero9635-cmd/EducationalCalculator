/**
 * The arithmetic a `propertyDiagram` picture draws (HC17), shared with its harness check.
 *
 * Water's saturation line is computed, never read off a chart: the saturation pressure and
 * temperature from IAPWS-IF97 region 4 (the public release's basic and backward equations), and
 * the saturated liquid and vapor densities, enthalpies and entropies from the IAPWS
 * supplementary release on saturation properties of ordinary water (Wagner and Pruss's auxiliary
 * equations, the same public source the steam tables use). Units inside: T in K, P in MPa,
 * v in m³/kg, h in kJ/kg, s in kJ/(kg·K); entropy and internal energy are 0 for saturated liquid
 * at the triple point, as in the steam tables.
 *
 * Ideal gases (air on a T–s plane) use constant c_p: s = c_p ln T − R ln P, relative to the
 * first state. A real gas's isotherm on a P–v plane is van der Waals or the two-term virial.
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { PdNum, PdState, PdStep, PropertyDiagramSpec } from '@/data/modules/typesHe2c';

// ─── Water: IAPWS-IF97 region 4 ──────────────────────────────────────────────

const N = [
  0, 0.11670521452767e4, -0.72421316703206e6, -0.17073846940092e2, 0.1202082470247e5,
  -0.32325550322333e7, 0.1491510861353e2, -0.48232657361591e4, 0.40511340542057e6,
  -0.23855557567849, 0.65017534844798e3,
] as const;

/** Water's critical point (IAPWS): T_c in K, P_c in MPa, ρ_c in kg/m³. */
export const WATER_CRIT = { T: 647.096, P: 22.064, rho: 322 };
/** The triple point's temperature (K): the dome is drawn from here to the critical point. */
export const WATER_TRIPLE = 273.16;

/** Saturation pressure (MPa) at T (K), IF97 equation 30. */
export function psatWater(T: number): number {
  const th = T + N[9] / (T - N[10]);
  const A = th * th + N[1] * th + N[2];
  const B = N[3] * th * th + N[4] * th + N[5];
  const C = N[6] * th * th + N[7] * th + N[8];
  return ((2 * C) / (-B + Math.sqrt(B * B - 4 * A * C))) ** 4;
}

/** Saturation temperature (K) at P (MPa), IF97 equation 31. */
export function tsatWater(P: number): number {
  const b = P ** 0.25;
  const E = b * b + N[3] * b + N[6];
  const F = N[1] * b * b + N[4] * b + N[7];
  const G = N[2] * b * b + N[5] * b + N[8];
  const D = (2 * G) / (-F - Math.sqrt(F * F - 4 * E * G));
  return (N[10] + D - Math.sqrt((N[10] + D) ** 2 - 4 * (N[9] + N[10] * D))) / 2;
}

// ─── Water: the saturated liquid and vapor (IAPWS supplementary release) ────

const A_P = [-7.85951783, 1.84408259, -11.7866497, 22.6807411, -15.9618719, 1.80122502];
const E_P = [1, 1.5, 3, 3.5, 4, 7.5];
const B_L = [1.99274064, 1.09965342, -0.510839303, -1.75493479, -45.5170352, -6.7469445e5];
const E_L = [1 / 3, 2 / 3, 5 / 3, 16 / 3, 43 / 3, 110 / 3];
const C_V = [-2.0315024, -2.6830294, -5.38626492, -17.2991605, -44.7586581, -63.9201063];
const E_V = [2 / 6, 4 / 6, 8 / 6, 18 / 6, 37 / 6, 71 / 6];
const D_A = [-5.65134998e-8, 2690.66631, 127.287297, -135.003439, 0.981825814];
const D_ALPHA = -1135.905627715;
const D_PHI = 2319.5246;

export interface SatProps {
  T: number;
  P: number;
  vf: number;
  vg: number;
  hf: number;
  hg: number;
  sf: number;
  sg: number;
}

/** Saturated liquid (f) and vapor (g) at T (K), from the triple point to the critical point. */
export function satWater(T: number): SatProps {
  const { T: Tc, P: Pc, rho: rc } = WATER_CRIT;
  const Tt = Math.min(Tc, Math.max(WATER_TRIPLE, T));
  const t = Math.max(0, 1 - Tt / Tc);
  const th = Tt / Tc;
  let S = 0;
  let dS = 0;
  A_P.forEach((a, i) => {
    S += a * t ** E_P[i]!;
    dS += t > 0 ? a * E_P[i]! * t ** (E_P[i]! - 1) : 0;
  });
  const P = Pc * Math.exp(S / th);
  // dP/dT in kPa/K, so T ÷ ρ × dP/dT is in kJ/kg.
  const dPdT = P * ((-Tc / (Tt * Tt)) * S - dS / Tt) * 1000;
  let rl = 1;
  B_L.forEach((b, i) => (rl += b * t ** E_L[i]!));
  rl *= rc;
  let lv = 0;
  C_V.forEach((c, i) => (lv += c * t ** E_V[i]!));
  const rv = rc * Math.exp(lv);
  const alpha =
    D_ALPHA +
    D_A[0]! * th ** -19 +
    D_A[1]! * th +
    D_A[2]! * th ** 4.5 +
    D_A[3]! * th ** 5 +
    D_A[4]! * th ** 54.5;
  const phi =
    (D_PHI +
      (19 / 20) * D_A[0]! * th ** -20 +
      D_A[1]! * Math.log(th) +
      (9 / 7) * D_A[2]! * th ** 3.5 +
      (5 / 4) * D_A[3]! * th ** 4 +
      (109 / 107) * D_A[4]! * th ** 53.5) /
    Tc;
  return {
    T: Tt,
    P,
    vf: 1 / rl,
    vg: 1 / rv,
    hf: alpha + (Tt / rl) * dPdT,
    hg: alpha + (Tt / rv) * dPdT,
    sf: phi + dPdT / rl,
    sg: phi + dPdT / rv,
  };
}

/** Saturation at a pressure (MPa); undefined past the critical point or below the triple. */
export function satAtP(P: number): SatProps | undefined {
  if (!(P > 0.000611657 && P < WATER_CRIT.P)) return undefined;
  return satWater(tsatWater(P));
}

/** The vapor dome: the saturated liquid and vapor lines, triple point to critical point. */
export function waterDome(n = 120): SatProps[] {
  const out: SatProps[] = [];
  const { T: Tc } = WATER_CRIT;
  for (let k = 0; k <= n; k++) {
    // Close to the critical point the lines turn fast: crowd the points there.
    const u = k / n;
    const T = WATER_TRIPLE + (Tc - WATER_TRIPLE) * (1 - (1 - u) ** 2);
    out.push(satWater(T));
  }
  return out;
}

/** The root of f on [a, b] by bisection (f(a) and f(b) of opposite signs), else undefined. */
export function bisect(f: (x: number) => number, a: number, b: number, n = 80) {
  let [fa, lo, hi] = [f(a), a, b];
  if (fa * f(b) > 0) return undefined;
  for (let k = 0; k < n; k++) {
    const m = (lo + hi) / 2;
    const fm = f(m);
    if (fa * fm <= 0) hi = m;
    else [lo, fa] = [m, fm];
  }
  return (lo + hi) / 2;
}

/** Compressed liquid taken as saturated liquid at its temperature: T (K) where h_f(T) = h. */
const liquidTFromH = (h: number) =>
  bisect((T) => satWater(T).hf - h, WATER_TRIPLE, WATER_CRIT.T - 1e-6);
const liquidTFromS = (s: number) =>
  bisect((T) => satWater(T).sf - s, WATER_TRIPLE, WATER_CRIT.T - 1e-6);

// ─── States ──────────────────────────────────────────────────────────────────

/** Reads a spec field in the variable's own unit (undefined while "?"). */
export type PdGetter = (x: NumOrVar | undefined) => number | undefined;

/** A state placed on the plane, in internal units (water: K, MPa; gas: K, the page's P). */
export interface PdPoint {
  name: string;
  T?: number;
  P?: number;
  v?: number;
  s?: number;
  h?: number;
  x?: number;
  region?: 'liquid' | 'mixture' | 'vapor' | 'gas';
  /** Placed by shape, not by table values (superheated steam with no T: see `resolveStates`). */
  shape?: boolean;
  /** Why a state can't be drawn where its values put it (x > 1 under the dome). */
  why?: string;
}

/** The pressure unit's factor to MPa (water) and the temperature offset to K. */
export const P_TO_MPA: Record<string, number> = { kPa: 0.001, MPa: 1, bar: 0.1, Pa: 1e-6 };

export function pdUnits(spec: PropertyDiagramSpec) {
  const T = spec.units?.T ?? (spec.substance === 'water' ? '°C' : 'K');
  const P = spec.units?.P ?? (spec.substance === 'water' ? 'kPa' : 'bar');
  return { T, P, toK: T === '°C' ? 273.15 : 0, toMPa: P_TO_MPA[P] ?? 0.001 };
}

const sumOf = (get: PdGetter, x: PdNum | undefined) => {
  if (x === undefined) return undefined;
  const xs = Array.isArray(x) ? x : [x];
  let total = 0;
  for (const p of xs) {
    const y = get(p);
    if (y === undefined) return undefined;
    total += y;
  }
  return total;
};

/** The ideal gas constants: c_p, R (from k when R is not given) and k. */
export function gasConstants(spec: PropertyDiagramSpec, get: PdGetter) {
  const cp = get(spec.gas?.cp);
  const k = get(spec.gas?.k);
  const R =
    get(spec.gas?.R) ?? (cp !== undefined && k !== undefined ? (cp * (k - 1)) / k : undefined);
  return { cp, R, k: k ?? (cp !== undefined && R !== undefined ? cp / (cp - R) : undefined) };
}

/**
 * Superheated steam with a known P, h and s but no T (a Rankine page types h₃ only): the isobar
 * past the saturated vapor is drawn T = T_sat e^((s − s_g) ÷ c), c chosen so the area under it
 * from s_g to s equals h − h_g (q = ∫T ds along an isobar). Not a table value: said.
 */
export function superheatShape(sat: SatProps, s: number, h: number) {
  const ds = s - sat.sg;
  const dh = h - sat.hg;
  if (!(ds > 0) || !(dh > sat.T * ds)) return undefined;
  const area = (c: number) => c * sat.T * (Math.exp(ds / c) - 1) - dh;
  const c = bisect(area, 0.05, 1e4);
  return c === undefined ? undefined : { c, T: sat.T * Math.exp(ds / c) };
}

/** The superheat isobar's shape constant (kJ/(kg·K)) where nothing else sets it. */
export const SHAPE_C = 2;

/** A water state from what is known; undefined while too little is. */
function waterPoint(
  name: string,
  T?: number,
  P?: number,
  v?: number,
  s?: number,
  h?: number,
  x?: number,
): PdPoint | undefined {
  const sat = P !== undefined ? satAtP(P) : T !== undefined ? satWater(T) : undefined;
  if (P !== undefined && !sat) {
    if (T !== undefined && s !== undefined) return { name, T, P, s, h, v, region: 'vapor' };
    return undefined;
  }
  if (!sat) return undefined;
  const Ts = sat.T;
  const mix = (q: number): PdPoint => ({
    name,
    T: Ts,
    P: sat.P,
    x: q,
    v: sat.vf + q * (sat.vg - sat.vf),
    s: sat.sf + q * (sat.sg - sat.sf),
    h: sat.hf + q * (sat.hg - sat.hf),
    region: 'mixture',
  });
  if (x !== undefined) {
    if (x < 0 || x > 1)
      return { ...mix(Math.min(1, Math.max(0, x))), why: `x = ${x} lies outside 0 to 1` };
    return mix(x);
  }
  if (v !== undefined && v >= sat.vf && v <= sat.vg) return mix((v - sat.vf) / (sat.vg - sat.vf));
  if (s !== undefined && s >= sat.sf && s <= sat.sg) return mix((s - sat.sf) / (sat.sg - sat.sf));
  if (h !== undefined && s === undefined && h >= sat.hf && h <= sat.hg)
    return mix((h - sat.hf) / (sat.hg - sat.hf));
  // Compressed liquid (taken as saturated liquid at its temperature).
  const liquid = (TL: number | undefined): PdPoint | undefined => {
    if (TL === undefined) return undefined;
    const f = satWater(TL);
    return { name, T: TL, P: sat.P, v: f.vf, s: s ?? f.sf, h: h ?? f.hf, region: 'liquid' };
  };
  if (h !== undefined && h < sat.hf) return liquid(liquidTFromH(h));
  if (s !== undefined && s < sat.sf) return liquid(liquidTFromS(s));
  if (T !== undefined && P !== undefined && T < Ts - 1e-6) return liquid(T);
  if (v !== undefined && v < sat.vf) return { name, T: Ts, P: sat.P, v, region: 'liquid' };
  // Superheated vapor.
  if (T !== undefined && T > Ts + 1e-6)
    return { name, T, P: sat.P, v, s, h, region: 'vapor', shape: s === undefined };
  if (s !== undefined && h !== undefined && s > sat.sg) {
    const shape = superheatShape(sat, s, h);
    if (shape) return { name, T: shape.T, P: sat.P, s, h, region: 'vapor', shape: true };
    // No rising isobar from s_g to s has an area as small as h − h_g: h is too low for this s.
    const T = sat.T * Math.exp((s - sat.sg) / SHAPE_C);
    return {
      name,
      T,
      P: sat.P,
      s,
      h,
      region: 'vapor',
      shape: true,
      why: `h = ${Number(h.toPrecision(5))} is too low for s = ${Number(s.toPrecision(4))}`,
    };
  }
  if (h !== undefined && s === undefined && h > sat.hg) {
    // Superheated with P and h only: the isobar's shape constant taken as 2 kJ/(kg·K).
    const T = sat.T + (h - sat.hg) / SHAPE_C;
    const sv = sat.sg + SHAPE_C * Math.log(T / sat.T);
    return { name, T, P: sat.P, s: sv, h, region: 'vapor', shape: true };
  }
  if (v !== undefined && v > sat.vg)
    return { name, T: Ts, P: sat.P, v, region: 'vapor', shape: true };
  return undefined;
}

/**
 * Every state in internal units. An isentropic step carries s from a placed state to its partner
 * when the partner has no s, v or x of its own (both ways), so a Rankine page's pump exit and
 * turbine inlet take s₁ and s₄. The first pass places only states that need no guess (a mixture,
 * a gas, a typed s or T) or that have a placed partner; later passes place the rest.
 */
export function resolveStates(spec: PropertyDiagramSpec, get: PdGetter): Map<string, PdPoint> {
  const u = pdUnits(spec);
  const out = new Map<string, PdPoint>();
  const states = spec.states ?? [];
  const gas = spec.substance === 'gas' ? gasConstants(spec, get) : undefined;
  const first = states[0];
  const isen = (spec.steps ?? []).filter((st) => st.process === 'isentropic');
  const partnerS = (name: string) => {
    for (const st of isen) {
      const other = st.from === name ? st.to : st.to === name ? st.from : undefined;
      const s = other === undefined ? undefined : out.get(other)?.s;
      if (s !== undefined) return s;
    }
    return undefined;
  };
  const linked = (name: string) => isen.some((st) => st.from === name || st.to === name);
  for (let pass = 0; pass < 4; pass++) {
    for (const st of states) {
      if (out.has(st.name)) continue;
      const T0 = get(st.T);
      const T = T0 === undefined ? undefined : T0 + u.toK;
      const Pin = get(st.P);
      const own = get(st.s);
      const v = get(st.v);
      const x = get(st.x);
      const carried =
        own === undefined && v === undefined && x === undefined ? partnerS(st.name) : undefined;
      const s = own ?? carried;
      const h = sumOf(get, st.h);
      if (spec.substance === 'water') {
        const P = Pin === undefined ? undefined : Pin * u.toMPa;
        const p = waterPoint(st.name, T, P, v, s, h, x);
        if (!p) continue;
        const sure =
          !p.shape &&
          (p.region === 'mixture' || own !== undefined || carried !== undefined || T !== undefined);
        if (pass === 0 && !sure && linked(st.name)) continue;
        // A typed v places the dot (the page's table values), its x said beside it.
        out.set(st.name, v !== undefined && p.region === 'mixture' ? { ...p, v } : p);
      } else if (gas?.cp !== undefined && gas.R !== undefined && T !== undefined) {
        const ref = first ? { T: get(first.T), P: get(first.P) } : undefined;
        const Tref = ref?.T === undefined ? undefined : ref.T + u.toK;
        if (Tref === undefined || ref?.P === undefined) continue;
        if (Pin !== undefined && Pin > 0)
          out.set(st.name, {
            name: st.name,
            T,
            P: Pin,
            s: gas.cp * Math.log(T / Tref) - gas.R * Math.log(Pin / ref.P),
            region: 'gas',
          });
        else if (s !== undefined) {
          // An isentropic partner's s with no P of its own: P from s and T.
          const P = ref.P * Math.exp((gas.cp * Math.log(T / Tref) - s) / gas.R);
          out.set(st.name, { name: st.name, T, P, s, region: 'gas' });
        }
      }
    }
  }
  return out;
}

/** A state of the spec by name. */
export const stateOf = (spec: PropertyDiagramSpec, name: string): PdState | undefined =>
  spec.states?.find((s) => s.name === name);

// ─── Paths ───────────────────────────────────────────────────────────────────

type Pt = [number, number];

/** A water isobar on T–s at P (MPa), from s₀ to s₁: liquid line, flat across, then superheat. */
export function waterIsobarTs(P: number, s0: number, s1: number, shapeC?: number, n = 60): Pt[] {
  const sat = satAtP(P);
  const out: Pt[] = [];
  for (let k = 0; k <= n; k++) {
    const s = s0 + ((s1 - s0) * k) / n;
    if (!sat) continue;
    let T: number | undefined;
    if (s < sat.sf) T = liquidTFromS(s);
    else if (s <= sat.sg) T = sat.T;
    else T = sat.T * Math.exp((s - sat.sg) / (shapeC ?? 2));
    if (T !== undefined) out.push([s, T]);
  }
  // The corners of the flat part, so the line turns where the dome does.
  if (sat) {
    for (const sc of [sat.sf, sat.sg])
      if (sc > Math.min(s0, s1) && sc < Math.max(s0, s1)) out.push([sc, sat.T]);
    out.sort((p, q) => (s1 >= s0 ? p[0] - q[0] : q[0] - p[0]));
  }
  return out;
}

/** An ideal gas isobar on T–s through (s₀, T₀): T = T₀ e^((s − s₀) ÷ c_p). */
export const gasIsobar = (s0: number, T0: number, cp: number) => (s: number) =>
  T0 * Math.exp((s - s0) / cp);

/** The shape constant of a water state placed by shape (to draw its isobar through it). */
export function shapeConstant(p: PdPoint): number | undefined {
  if (!p.shape || p.P === undefined || p.s === undefined || p.T === undefined) return undefined;
  const sat = satAtP(p.P);
  if (!sat || !(p.s > sat.sg) || !(p.T > sat.T)) return undefined;
  return (p.s - sat.sg) / Math.log(p.T / sat.T);
}

/** The path of a step on the T–s plane as (s, T) points (T in K). */
export function stepPathTs(
  spec: PropertyDiagramSpec,
  step: PdStep,
  pts: Map<string, PdPoint>,
  cp?: number,
): Pt[] | undefined {
  const [a, b] = [pts.get(step.from), pts.get(step.to)];
  if (a?.s === undefined || b?.s === undefined || a.T === undefined || b.T === undefined)
    return undefined;
  if (step.process === 'isobaric') {
    if (spec.substance === 'water' && a.P !== undefined)
      return waterIsobarTs(a.P, a.s, b.s, shapeConstant(b) ?? shapeConstant(a));
    if (cp !== undefined) {
      const f = gasIsobar(a.s, a.T, cp);
      return Array.from({ length: 41 }, (_, k): Pt => {
        const s = a.s! + ((b.s! - a.s!) * k) / 40;
        return [s, f(s)];
      });
    }
  }
  return [
    [a.s, a.T],
    [b.s, b.T],
  ];
}

// ─── Real gases on the P–v plane ─────────────────────────────────────────────

/** van der Waals: P = RT ÷ (V − b) − a ÷ V² (SI: Pa, m³/mol). */
export const vdwP = (T: number, V: number, a: number, b: number, R: number) =>
  (R * T) / (V - b) - a / (V * V);

/** The van der Waals critical point from a and b: V_c = 3b, P_c = a ÷ 27b², T_c = 8a ÷ 27Rb. */
export const vdwCritical = (a: number, b: number, R: number) => ({
  V: 3 * b,
  P: a / (27 * b * b),
  T: (8 * a) / (27 * R * b),
});

/** The two-term virial isotherm through a state: B = (Z − 1)RT ÷ P, so P = RT ÷ (V − B). */
export const virialB = (T: number, P: number, Z: number, R: number) => ((Z - 1) * R * T) / P;

/** The SI factors of the isotherm's P and V units. */
export const V_TO_SI: Record<string, number> = { 'L/mol': 1e-3, 'm³/mol': 1, 'cm³/mol': 1e-6 };
export const P_TO_PA: Record<string, number> = { bar: 1e5, kPa: 1e3, MPa: 1e6, Pa: 1, atm: 101325 };

/**
 * The arithmetic of the ideal op-amp circuits (HC18, OpAmpSchematic.tsx), in SI units: each
 * circuit's gain and output, the output held inside the rails, the voltages at the two inputs
 * for a given output (the virtual short), the integrator's ramp, the low-pass cutoff, the
 * Schmitt thresholds and the instrumentation amplifier's gain and hum. Shared by the picture and
 * its harness check (harness/picturesHe2d.ts).
 */
import type { AmpCircuit } from '@/data/modules/typesHe2d';

import { siFactor } from './netMath';

/** Units the unit table and round 1's list don't carry, in SI. */
const EXTRA: Record<string, number> = {
  μA: 1e-6,
  nA: 1e-9,
  μV: 1e-6,
  μs: 1e-6,
  S: 1,
  mS: 1e-3,
  'A/V²': 1,
  'mA/V²': 1e-3,
  'μA/V²': 1e-6,
  dB: 1,
};

/** SI units in one of `unit` (kΩ → 1000, μA → 10⁻⁶); 1 when unknown or none. */
export const siUnit = (unit: string | undefined) =>
  unit !== undefined && EXTRA[unit] !== undefined ? EXTRA[unit] : siFactor(unit);

/** The given values of an op-amp circuit in SI (undefined while "?" or not on the page). */
export interface AmpIn {
  vin: (number | undefined)[];
  rin: (number | undefined)[];
  rf?: number;
  rg?: number;
  c?: number;
  rail?: number;
  time?: number;
  v0?: number;
  /** dB. */
  cmrr?: number;
  /** A gain the page gives rather than works out (the CMRR page's A_d). */
  gain?: number;
}

export interface AmpOut {
  /** The closed-loop gain (integrator: none). */
  gain?: number;
  /** The output the ideal amplifier would make, before the rails. */
  ideal?: number;
  /** The output inside the rails. */
  vout?: number;
  /** The output is held at a rail. */
  atRail?: boolean;
  cutoff?: number;
  threshold?: number;
  common?: number;
  hum?: number;
}

/** Every value known (a "?" reads NaN). */
const def = (...xs: number[]) => xs.every((x) => Number.isFinite(x));

/** The inputs with each "?" as NaN, so the arithmetic reads plainly. */
const nums = (a: AmpIn) => {
  const N = (x: number | undefined) => x ?? NaN;
  return {
    v1: N(a.vin[0]),
    v2: N(a.vin[1]),
    r1: N(a.rin[0]),
    r2: N(a.rin[1]),
    rf: N(a.rf),
    rg: N(a.rg),
    c: N(a.c),
    rail: N(a.rail),
    time: N(a.time),
    v0: a.v0 ?? 0,
    cmrr: N(a.cmrr),
    gain: N(a.gain),
  };
};

/** Each circuit's gain and output from its parts. */
export function ampSolve(kind: AmpCircuit, a: AmpIn): AmpOut {
  const { v1, v2, r1, r2, rf, rg, c, rail, time, v0, cmrr, gain } = nums(a);
  let G = NaN;
  let ideal = NaN;
  let cutoff = NaN;
  let threshold = NaN;
  let common = NaN;
  let hum = NaN;
  switch (kind) {
    case 'inverting':
    case 'activeLowPass':
      if (r1 > 0) G = -rf / r1;
      ideal = G * v1;
      if (kind === 'activeLowPass' && rf * c > 0) cutoff = 1 / (2 * Math.PI * rf * c);
      break;
    case 'nonInverting':
      if (rg > 0) G = 1 + rf / rg;
      ideal = G * v1;
      break;
    case 'summing':
      if (r1 > 0 && r2 > 0) ideal = -rf * (v1 / r1 + v2 / r2);
      break;
    case 'difference':
      if (r1 > 0) G = rf / r1;
      ideal = G * (v2 - v1);
      break;
    case 'integrator':
      if (r1 * c > 0) ideal = v0 - (v1 * time) / (r1 * c);
      break;
    case 'schmitt': {
      if (r1 + rf > 0) threshold = (rail * r1) / (r1 + rf);
      const out: AmpOut = def(threshold) ? { threshold } : {};
      if (def(threshold, v1, rail)) {
        // Past a threshold the output is certain; between them it remembers (drawn at the top).
        out.vout = v1 > threshold ? -rail : rail;
        out.atRail = true;
      }
      return out;
    }
    case 'instrumentation':
      G = rg > 0 && def(rf) ? 1 + (2 * rf) / rg : gain;
      ideal = G * v1;
      common = G / 10 ** (cmrr / 20);
      hum = common * v2;
      break;
  }
  const out: AmpOut = {};
  if (def(G)) out.gain = G;
  if (def(cutoff)) out.cutoff = cutoff;
  if (def(common)) out.common = common;
  if (def(hum)) out.hum = hum;
  if (def(ideal)) {
    out.ideal = ideal;
    if (rail > 0 && Math.abs(ideal) > rail) {
      out.vout = Math.sign(ideal) * rail;
      out.atRail = true;
    } else {
      out.vout = ideal;
      out.atRail = rail > 0 && Math.abs(Math.abs(ideal) - rail) <= 1e-9 * rail;
    }
  }
  return out;
}

/**
 * The voltages at the + and − inputs for the output `vout` (the parts' values in place): equal
 * for an ideal op-amp in its linear range. Undefined where the circuit doesn't fix them from
 * these values (the integrator's capacitor, the Schmitt trigger's positive feedback).
 */
export function inputsFor(
  kind: AmpCircuit,
  a: AmpIn,
  vout: number,
): { plus: number; minus: number } | undefined {
  const { v1, v2, r1, r2, rf, rg } = nums(a);
  switch (kind) {
    case 'inverting':
      return def(v1, r1, rf) && r1 + rf > 0
        ? { plus: 0, minus: (v1 * rf + vout * r1) / (r1 + rf) }
        : undefined;
    case 'nonInverting':
      return def(v1, rg, rf) && rg + rf > 0
        ? { plus: v1, minus: (vout * rg) / (rg + rf) }
        : undefined;
    case 'summing':
      if (!def(v1, v2, r1, r2, rf) || r1 <= 0 || r2 <= 0 || rf <= 0) return undefined;
      return {
        plus: 0,
        minus: (v1 / r1 + v2 / r2 + vout / rf) / (1 / r1 + 1 / r2 + 1 / rf),
      };
    case 'difference':
      if (!def(v1, v2, r1, rf) || r1 + rf <= 0) return undefined;
      return {
        plus: (v2 * rf) / (r1 + rf),
        minus: (v1 * rf + vout * r1) / (r1 + rf),
      };
    default:
      return undefined;
  }
}

/** The integrator's output at time t: v₀ − vᵢₙ t ÷ (RC) (no rails). */
export const ramp = (v0: number, vin: number, r: number, c: number, t: number) =>
  v0 - (vin * t) / (r * c);

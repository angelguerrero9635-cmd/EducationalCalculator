/**
 * Math for the college pictures of round 4, group J (`typesHe4j.ts`), shared by the drawings and
 * their harness checks. No React here.
 */
import { convert, getUnit } from '@/engine/units';

import { erf } from './functionGraphHe1e';

/** `x` in unit `from` read in unit `to` (a registered unit converts; any other is taken as `to`). */
export function inUnit(x: number, from: string | undefined, to: string): number {
  if (!from || from === to || !getUnit(from) || !getUnit(to)) return x;
  try {
    return convert(x, from, to);
  } catch {
    return x;
  }
}

/** Smallest of 1, 2, 2.5, 5 × 10ⁿ at or above x. */
export function niceUp(x: number): number {
  if (!(x > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  const n = x / p;
  return (n <= 1 + 1e-9 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

// ─── HC155: heartPump ─────────────────────────────────────────────────────────

/**
 * The ventricle's cavity is half an ellipsoid, apex down: at height share s (0 at the apex, 1 at
 * the base) its radius is a√(2s − s²), so the volume below s is the share 1.5s² − 0.5s³ of the
 * whole cavity.
 */
export const cavityShare = (s: number) => 1.5 * s * s - 0.5 * s * s * s;

/** The height share s whose volume share is `share` (bisection; the share rises with s). */
export function cavityLevel(share: number): number {
  const v = Math.min(1, Math.max(0, share));
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (cavityShare(mid) < v) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * The cavity's whole volume (mL): 250 mL, so a normal heart (EDV about 120 mL) fills half of it
 * and a dilated one nearly all; larger volumes take a round number above the largest.
 */
export const cavityCap = (largest: number) => Math.max(250, niceUp(largest * 1.12));

/** The gauge: 0 to 300 mmHg over 270°, from the bottom left round the top (degrees, SVG). */
export const DIAL_MAX = 300;
export const dialAngle = (p: number) => 135 + (270 * Math.min(DIAL_MAX, Math.max(0, p))) / DIAL_MAX;

/** Mean arterial pressure, one third of the way from DBP to SBP. */
export const meanPressure = (sbp: number, dbp: number) => dbp + (sbp - dbp) / 3;

/** The whole beats drawn in a minute at HR (at most 250). */
export const beatsDrawn = (hr: number) => Math.min(250, Math.max(0, Math.round(hr)));

// ─── HC156: footprints ────────────────────────────────────────────────────────

/** How many prints the walkway shows: left, right, left, right, left (two strides). */
export const PRINTS = 5;

/** Each print's heel (m from the first heel) and side, left first. */
export const printHeels = (step: number) =>
  Array.from({ length: PRINTS }, (_, k) => ({ x: k * step, side: k % 2 ? 'R' : 'L' }) as const);

/** Walking speed (m/s) from the step (m) and the cadence (steps a minute). */
export const walkSpeed = (step: number, cadence: number) => (step * cadence) / 60;

/** The Froude number v² ÷ (gL), and the speed where it reaches 0.5 (people switch to a run). */
export const froudeOf = (v: number, g: number, leg: number) => (v * v) / (g * leg);
export const runSpeedOf = (g: number, leg: number) => Math.sqrt(0.5 * g * leg);

// ─── HC157: springDashpot ─────────────────────────────────────────────────────

/** The share of the held strain's stress left after t (Maxwell relaxation): e^(−t/τ). */
export const relaxShare = (t: number, tau: number) => Math.exp(-t / tau);

/** The share of the final strain reached after t (Kelvin–Voigt creep): 1 − e^(−t/τ). */
export const creepShare = (t: number, tau: number) => 1 - Math.exp(-t / tau);

/** The time axis: a round span past 3τ and past t. */
export const springSpan = (tau: number, t?: number) => niceUp(Math.max(3 * tau, 1.15 * (t ?? 0)));

// ─── HC159: diffusionProfile ──────────────────────────────────────────────────

/**
 * C ÷ C₀ at depth x into a slab whose face is held at C₀ from t = 0 (one-dimensional, D in the
 * same length unit squared per second): erfc(x ÷ (2√(Dt))).
 */
export const profileShare = (x: number, D: number, t: number) =>
  t > 0 && D > 0 ? 1 - erf(x / (2 * Math.sqrt(D * t))) : x > 0 ? 0 : 1;

/** The typical distance spread in t: √(2Dt). */
export const spreadDepth = (D: number, t: number) => Math.sqrt(2 * D * t);

/** The depth where the profile reaches C₀ ÷ 2 (bisection on the drawn profile). */
export function halfDepth(D: number, t: number): number {
  let lo = 0;
  let hi = 4 * Math.sqrt(D * t) || 1;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (profileShare(mid, D, t) > 0.5) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The depth axis: a round span about 2.5 times the spread. */
export const depthSpan = (L: number) => niceUp(2.5 * L);

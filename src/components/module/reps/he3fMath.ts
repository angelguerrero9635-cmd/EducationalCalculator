/**
 * The numbers behind the college round 3 group F chemistry pictures (HC56, HC58, HC71, HC73),
 * shared by the pictures and their harness checks: the Nernst equation and electrolysis
 * counting, G against the extent of a reaction, polyprotic titrations from the exact charge
 * balance, a free amino acid's curve and the Henderson–Hasselbalch buffer.
 */

/** Gas constant (J/(mol·K)) and Faraday constant (C/mol): the plans' values, the defaults. */
export const R_GAS = 8.314;
export const FARADAY = 96485;
/** Water's ion product at 25 °C. */
const KW = 1e-14;

/** kJ/mol (or kJ) → × 1000 into J; anything else as it is. */
export const perJoule = (unit: string | undefined) => (unit?.startsWith('kJ') ? 1000 : 1);
/** min → × 60, h → × 3600, else seconds. */
export const perSecond = (unit: string | undefined) =>
  unit === 'min' ? 60 : unit === 'h' ? 3600 : 1;

// ─── HC56: cells ─────────────────────────────────────────────────────────────

/** The most ion dots a beaker holds (the richer solution). */
export const CELL_DOTS = 36;

/** Dots for a concentration against the richer one: in proportion. */
export const dotsFor = (conc: number, richest: number) =>
  richest > 0 && conc > 0 ? Math.round((CELL_DOTS * conc) / richest) : 0;

/** Q of M | Mⁿ⁺ ‖ Nⁿ⁺ | N: the anode's ion over the cathode's (solids left out). */
export const cellQ = (anode: number, cathode: number) => anode / cathode;

/** E = E° − (RT ÷ nF) ln Q. */
export const nernstE = (e0: number, n: number, T: number, Q: number, R = R_GAS, F = FARADAY) =>
  e0 - ((R * T) / (n * F)) * Math.log(Q);

/** Electrolysis by counting: Q = It, n(e⁻) = Q ÷ F, n = n(e⁻) ÷ z, m = nM. */
export function electrolysis(I: number, t: number, z: number, M?: number, F = FARADAY) {
  const charge = I * t;
  const electrons = charge / F;
  const moles = electrons / z;
  return { charge, electrons, moles, mass: M === undefined ? undefined : moles * M };
}

// ─── HC58: G against the extent ──────────────────────────────────────────────

/**
 * G (J per mole of reaction, pure reactants at 0) at extent ξ of a model A ⇌ B with ideal
 * mixing: G = ξΔG° + RT[(1 − ξ) ln(1 − ξ) + ξ ln ξ]. Its slope is ΔG° + RT ln(ξ ÷ (1 − ξ)),
 * that is ΔG at Q = ξ ÷ (1 − ξ), so the minimum is where Q = K.
 */
export function gibbsAt(xi: number, dG0: number, T: number, R = R_GAS): number {
  const mix = (p: number) => (p > 0 ? p * Math.log(p) : 0);
  return xi * dG0 + R * T * (mix(1 - xi) + mix(xi));
}

/** The slope dG/dξ at ξ: ΔG = ΔG° + RT ln Q. */
export const gibbsSlope = (xi: number, dG0: number, T: number, R = R_GAS) =>
  dG0 + R * T * Math.log(xi / (1 - xi));

/** The extent where the quotient is Q (Q = ξ ÷ (1 − ξ)). */
export const extentOfQ = (Q: number) => Q / (1 + Q);

/** K from ΔG° (J/mol): e^(−ΔG° ÷ RT). */
export const kOfGibbs = (dG0: number, T: number, R = R_GAS) => Math.exp(-dG0 / (R * T));

// ─── HC71: titrations ────────────────────────────────────────────────────────

/**
 * The average number of protons lost per molecule of an acid with these Kₐ values (Kₐ₁ first)
 * at [H⁺] = h: Σ i αᵢ, from the fractions α₀ … αₙ of the forms with 0 … n protons lost.
 */
export function protonsLost(h: number, kas: number[]): number {
  // Terms h^(n−i) × Kₐ₁ … Kₐᵢ, scaled by h^n so nothing overflows: ∏(Kₐⱼ ÷ h).
  let term = 1;
  let sum = 1;
  let weighted = 0;
  kas.forEach((ka, i) => {
    term *= ka / h;
    sum += term;
    weighted += (i + 1) * term;
  });
  return weighted / sum;
}

/**
 * The pH after `vb` of strong base (concentration `cb`) is added to `va` of a polyprotic acid
 * (concentration `ca`, Kₐ values `kas`), volumes in one unit, from the exact charge balance
 * [H⁺] + [Na⁺] = [OH⁻] + C × Σ i αᵢ, solved by bisection on log [H⁺].
 */
export function polyproticPH(ca: number, va: number, cb: number, vb: number, kas: number[]) {
  const v = va + vb;
  if (!(v > 0)) return 7;
  const acid = (ca * va) / v;
  const na = (cb * vb) / v;
  const f = (h: number) => h + na - KW / h - acid * protonsLost(h, kas);
  let lo = -16;
  let hi = 2;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (f(10 ** mid) > 0) hi = mid;
    else lo = mid;
  }
  return -(lo + hi) / 2;
}

/**
 * A free amino acid from its fully protonated form: its groups' pKₐ values (the α-carboxyl, the
 * α-amino and an optional side chain, `side` acidic or basic). `removed` is the protons taken
 * off per molecule at a pH (the equivalents of OH⁻ added, water's own ions left out), `charge`
 * the net charge and `pI` the pH of zero charge (the mean of the two pKₐ values either side of
 * the neutral form).
 */
export interface AminoAcid {
  pKa1: number;
  pKa2: number;
  pKaR?: number;
  side?: 'none' | 'acidic' | 'basic';
}

const deprotonated = (pH: number, pKa: number) => 1 / (1 + 10 ** (pKa - pH));

export function aminoGroups(a: AminoAcid): number[] {
  const side = a.side && a.side !== 'none' && a.pKaR !== undefined ? [a.pKaR] : [];
  return [a.pKa1, a.pKa2, ...side].sort((x, y) => x - y);
}

export const aminoRemoved = (pH: number, a: AminoAcid) =>
  aminoGroups(a).reduce((s, pk) => s + deprotonated(pH, pk), 0);

/** Net charge: the fully protonated form carries +1 (+2 with a basic side chain). */
export function aminoCharge(pH: number, a: AminoAcid): number {
  const top = a.side === 'basic' && a.pKaR !== undefined ? 2 : 1;
  return top - aminoRemoved(pH, a);
}

export function aminoPI(a: AminoAcid): number {
  const pk = aminoGroups(a);
  // The neutral form has lost `top` protons: it sits between the top-th and (top+1)-th pKₐ.
  const top = a.side === 'basic' && a.pKaR !== undefined ? 2 : 1;
  return (pk[top - 1]! + pk[top]!) / 2;
}

/** The pH at which `eq` protons have been taken off (bisection on pH; eq inside 0 … groups). */
export function aminoPHAt(eq: number, a: AminoAcid): number {
  let lo = -2;
  let hi = 16;
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2;
    if (aminoRemoved(mid, a) < eq) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Henderson–Hasselbalch: pH = pKₐ + log(n(A⁻) ÷ n(HA)). */
export const bufferPH = (pKa: number, acid: number, base: number) => pKa + Math.log10(base / acid);

// ─── HC73: the pKₐ ladder ────────────────────────────────────────────────────

/** Acid + base ⇌ conjugate base + conjugate acid: log K = pKₐ(acid formed) − pKₐ(acid used). */
export const logKOf = (pKaLeft: number, pKaRight: number) => pKaRight - pKaLeft;

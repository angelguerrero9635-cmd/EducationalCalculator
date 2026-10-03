/**
 * Picture checks for college round 4, group M (docs/RENDERINGS_HE.md), called from `repIssues`
 * in `pictures.ts`. Test-only.
 *
 * - HC174 `soilPhases`: the drawn void height ÷ solid height is e and the water's share of the
 *   voids is S; Se = wG_s; n, γ_d and γ (or ρ and ρ_d for a sand cone) are the page's.
 * - HC175 `losScale`: D = v_p ÷ S; the bounds rise; the letter marked is the band holding D.
 * - HC180 `oneLine`: the summed reactance written is X_th; I_f = V_f ÷ X_th (or 3V_f ÷ ΣX for a
 *   line-to-ground fault); the base current, the kA and the fault MVA are the page's.
 * - HC181 `rfSpectrum`: the bracket's width is B (2f_m, or Carson's 2(Δf + f_m)); the drawn
 *   sideband heights squared give P_sb ÷ P_c (AM); the FM lines' heights squared add to the
 *   carrier's power (Σ J_n² = 1); β = Δf ÷ f_m.
 * - HC182 `complexPlane` `constellation`: M points drawn, all apart, each label log₂M bits and
 *   all different; nearest neighbours differ in one bit (Gray); R_b = R_s log₂M,
 *   B = R_s(1 + α), η = R_b ÷ B.
 */
import {
  constellation,
  LOS_BOUNDS,
  losOf,
  soilPhaseParts,
  spectrumLines,
} from '@/components/module/reps/he4mMath';

import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

const close = (a: number, b: number, rel = 2e-3) =>
  Math.abs(a - b) <= rel * Math.max(1e-9, Math.abs(a), Math.abs(b));

/** Every group M new kind's check. */
export function he4mIssues(rep: Representation, val: Val): string[] {
  switch (rep.kind) {
    case 'soilPhases':
      return soilPhasesIssues(rep, val);
    case 'losScale':
      return losScaleIssues(rep, val);
    case 'oneLine':
      return oneLineIssues(rep, val);
    case 'rfSpectrum':
      return rfSpectrumIssues(rep, val);
    default:
      return [];
  }
}

function soilPhasesIssues(rep: Extract<Representation, { kind: 'soilPhases' }>, val: Val) {
  const out: string[] = [];
  const get = (v: string | number | undefined) => (v === undefined ? undefined : val(v));
  const [Gs, wPct, S, e, gw, V, M] = [
    get(rep.Gs),
    get(rep.w),
    get(rep.S),
    get(rep.e),
    get(rep.gammaW),
    get(rep.volume),
    get(rep.mass),
  ];
  const w = wPct === undefined ? undefined : wPct / 100;
  if (Gs !== undefined && (Gs <= 1 || Gs > 3.5)) out.push(`soil: G_s = ${Gs} is not a soil's`);
  if (w !== undefined && w < 0) out.push(`soil: w = ${wPct}% is negative`);
  if (S !== undefined && (S < 0 || S > 1)) out.push(`soil: S = ${S} is outside 0 to 1`);
  if (e !== undefined && e <= 0) out.push(`soil: e = ${e} is not positive`);
  if (S !== undefined && e !== undefined && w !== undefined && Gs !== undefined)
    if (!close(S * e, w * Gs)) out.push(`soil: Se = ${S * e} but wG_s = ${w * Gs}`);
  const p = soilPhaseParts({ Gs, w, S, e, V });
  if (p) {
    // The drawing: void height ÷ solid height, water ÷ voids, the parts filling the block.
    if (!close(p.Vv / p.Vs, p.e, 1e-9)) out.push(`soil: voids ÷ solids drawn ${p.Vv / p.Vs}`);
    if (p.Vv > 0 && !close(p.Vw / p.Vv, p.S, 1e-9))
      out.push(`soil: water ÷ voids drawn ${p.Vw / p.Vv}, not S = ${p.S}`);
    if (!close(p.Va + p.Vw + p.Vs, p.V, 1e-9)) out.push('soil: the phases do not fill the block');
    if (V !== undefined && !close(p.V, V, 1e-9)) out.push(`soil: block ${p.V}, not V = ${V}`);
    const n = get(rep.porosity);
    if (n !== undefined && !close(n, p.e / (1 + p.e)))
      out.push(`soil: n = ${n}, not e ÷ (1 + e) = ${p.e / (1 + p.e)}`);
    const gd = get(rep.dryUnitWeight);
    if (gd !== undefined && gw !== undefined && Gs !== undefined) {
      if (!close(gd, (Gs * gw) / (1 + p.e)))
        out.push(`soil: γ_d = ${gd}, not G_sγ_w ÷ (1 + e) = ${(Gs * gw) / (1 + p.e)}`);
    } else if (gd !== undefined && gw === undefined && !rep.mass)
      out.push('soil: γ_d with no γ_w to check it by');
    const g = get(rep.unitWeight);
    if (g !== undefined && gd !== undefined && w !== undefined && !close(g, gd * (1 + w)))
      out.push(`soil: γ = ${g}, not γ_d(1 + w) = ${gd * (1 + w)}`);
  }
  // The sand cone: ρ = M ÷ V up to a unit change, ρ_d = ρ ÷ (1 + w).
  const rho = get(rep.density);
  if (rho !== undefined && M !== undefined && V !== undefined) {
    const k = Math.log10((rho * V) / M);
    if (Math.abs(k - Math.round(k)) > 1e-3) out.push(`soil: ρ = ${rho} is not M ÷ V = ${M / V}`);
  }
  const rd = get(rep.dryDensity);
  if (rd !== undefined && rho !== undefined && w !== undefined && !close(rd, rho / (1 + w)))
    out.push(`soil: ρ_d = ${rd}, not ρ ÷ (1 + w) = ${rho / (1 + w)}`);
  return out;
}

function losScaleIssues(rep: Extract<Representation, { kind: 'losScale' }>, val: Val) {
  const out: string[] = [];
  const get = (v: string | number | undefined) => (v === undefined ? undefined : val(v));
  const [D, vp, S] = [get(rep.density), get(rep.flow), get(rep.speed)];
  const bounds = rep.bounds ?? LOS_BOUNDS;
  if (bounds.some((b, i) => b <= (i ? bounds[i - 1]! : 0))) out.push('los: the bounds do not rise');
  if (D !== undefined && D < 0) out.push(`los: density ${D} is negative`);
  if (D !== undefined && vp !== undefined && S !== undefined && !close(D, vp / S))
    out.push(`los: D = ${D}, not v_p ÷ S = ${vp / S}`);
  if (D !== undefined) {
    // The band drawn holds D: above the bound before it, not above its own.
    const i = losOf(D, bounds);
    const lo = i === 0 ? -Infinity : bounds[i - 1]!;
    const hi = i === bounds.length ? Infinity : bounds[i]!;
    if (!(D > lo && D <= hi)) out.push(`los: D = ${D} marked in band ${i}`);
  }
  return out;
}

function oneLineIssues(rep: Extract<Representation, { kind: 'oneLine' }>, val: Val) {
  const out: string[] = [];
  const get = (v: string | number | undefined) => (v === undefined ? undefined : val(v));
  if (!rep.elements.length) out.push('one-line: no elements');
  if (rep.faultBus !== undefined && (rep.faultBus < 1 || rep.faultBus > rep.elements.length))
    out.push(`one-line: fault on bus ${rep.faultBus} of ${rep.elements.length}`);
  const xs = rep.elements.map((e) => get(e.x));
  xs.forEach((x, i) => {
    if (x !== undefined && x <= 0) out.push(`one-line: element ${i + 1} has X = ${x}`);
  });
  const vf = get(rep.vf);
  const xth = get(rep.xth);
  // The sum drawn under the diagram (the elements before the faulted bus) is X_th.
  const upTo = xs.slice(0, rep.faultBus ?? xs.length);
  if (xth !== undefined && upTo.every((x) => x !== undefined) && upTo.length) {
    const sum = (upTo as number[]).reduce((a, b) => a + b, 0);
    if (!close(sum, xth)) out.push(`one-line: ΣX = ${sum} but X_th = ${xth}`);
  }
  const I = get(rep.current);
  if (rep.fault === 'slg') {
    const sq = rep.sequence;
    const ss = sq ? [get(sq.x1), get(sq.x2), get(sq.x0)] : [];
    if (!sq) out.push('one-line: a line-to-ground fault with no sequence reactances');
    if (I !== undefined && vf !== undefined && ss.length && ss.every((x) => x !== undefined)) {
      const sum = (ss as number[]).reduce((a, b) => a + b, 0);
      if (!close(I, (3 * vf) / sum))
        out.push(`one-line: I_a = ${I}, not 3V_f ÷ ΣX = ${(3 * vf) / sum}`);
    }
  } else if (I !== undefined && vf !== undefined && xth !== undefined && !close(I, vf / xth))
    out.push(`one-line: I_f = ${I}, not V_f ÷ X_th = ${vf / xth}`);
  const b = rep.base;
  if (b) {
    const [S, V, Ib, IkA, mva] = [get(b.s), get(b.v), get(b.iBase), get(b.iKA), get(b.mva)];
    if (
      S !== undefined &&
      V !== undefined &&
      Ib !== undefined &&
      !close(Ib, (S * 1000) / (Math.sqrt(3) * V))
    )
      out.push(`one-line: I_base = ${Ib} A, not S ÷ (√3V) = ${(S * 1000) / (Math.sqrt(3) * V)}`);
    if (I !== undefined && Ib !== undefined && IkA !== undefined && !close(IkA, (I * Ib) / 1000))
      out.push(`one-line: ${IkA} kA, not I_f × I_base = ${(I * Ib) / 1000}`);
    if (I !== undefined && S !== undefined && mva !== undefined && !close(mva, (vf ?? 1) * I * S))
      out.push(`one-line: fault ${mva} MVA, not V_fI_fS_base = ${(vf ?? 1) * I * S}`);
  }
  return out;
}

function rfSpectrumIssues(rep: Extract<Representation, { kind: 'rfSpectrum' }>, val: Val) {
  const out: string[] = [];
  const get = (v: string | number | undefined) => (v === undefined ? undefined : val(v));
  const [fm, mu, dev, beta, B] = [
    get(rep.fm),
    get(rep.mu),
    get(rep.deviation),
    get(rep.beta),
    get(rep.bandwidth),
  ];
  if (fm !== undefined && fm <= 0) out.push(`rf: f_m = ${fm}`);
  if (rep.mode === 'am') {
    if (mu !== undefined && (mu < 0 || mu > 1)) out.push(`rf: μ = ${mu} is outside 0 to 1`);
    // The bracket spans the outer sidebands, f_c ± f_m.
    if (B !== undefined && fm !== undefined && !close(B, 2 * fm))
      out.push(`rf: B = ${B}, not 2f_m`);
    const [Pc, Psb, Pt, eta] = [
      get(rep.carrierPower),
      get(rep.sidebandPower),
      get(rep.totalPower),
      get(rep.efficiency),
    ];
    if (mu !== undefined && Pc !== undefined) {
      const lines = spectrumLines('am', mu);
      const share = lines.filter((l) => l.n !== 0).reduce((a, l) => a + l.a ** 2, 0);
      if (Psb !== undefined && !close(Psb, Pc * share))
        out.push(`rf: P_sb = ${Psb}, but the drawn sidebands hold ${Pc * share}`);
      if (Pt !== undefined && !close(Pt, Pc * (1 + share)))
        out.push(`rf: P_t = ${Pt}, not P_c + P_sb = ${Pc * (1 + share)}`);
      if (eta !== undefined && !close(eta, (100 * share) / (1 + share)))
        out.push(`rf: η = ${eta}%, not P_sb ÷ P_t = ${(100 * share) / (1 + share)}%`);
    }
  } else {
    const b = beta ?? (dev !== undefined && fm ? dev / fm : undefined);
    if (beta !== undefined && dev !== undefined && fm !== undefined && !close(beta, dev / fm))
      out.push(`rf: β = ${beta}, not Δf ÷ f_m = ${dev / fm}`);
    if (B !== undefined && b !== undefined && fm !== undefined && !close(B, 2 * (b + 1) * fm))
      out.push(`rf: B = ${B}, but Carson's bracket spans ${2 * (b + 1) * fm}`);
    if (b !== undefined) {
      const lines = spectrumLines('fm', b);
      const all = lines.reduce((a, l) => a + l.a ** 2, 0);
      if (Math.abs(all - 1) > 2e-3) out.push(`rf: the FM lines hold ${all} of the carrier's power`);
    }
  }
  return out;
}

/** HC182: the constellation drawn for M. */
export function constellationIssues(rep: Representation, val: Val): string[] {
  if (rep.kind !== 'complexPlane' || !rep.constellation) return [];
  const k = rep.constellation;
  const out: string[] = [];
  const get = (v: string | number | undefined) => (v === undefined ? undefined : val(v));
  const M = get(k.M);
  if (M === undefined) return out;
  const bits = Math.log2(M);
  if (!Number.isInteger(bits) || M < 2) return [`constellation: M = ${M} is not a power of 2`];
  const pts = constellation(M, k.kind);
  if (pts.length !== M) out.push(`constellation: ${pts.length} points drawn for M = ${M}`);
  if (pts.some((p) => p.bits.length !== bits || /[^01]/.test(p.bits)))
    out.push(`constellation: a label is not ${bits} bits`);
  if (new Set(pts.map((p) => p.bits)).size !== pts.length)
    out.push('constellation: two points share a label');
  // Nearest neighbours (the closest distance, to rounding) differ in exactly one bit.
  const d = (a: (typeof pts)[0], b: (typeof pts)[0]) => Math.hypot(a.i - b.i, a.q - b.q);
  let dmin = Infinity;
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) dmin = Math.min(dmin, d(pts[i]!, pts[j]!));
  if (dmin < 1e-9) out.push('constellation: two points coincide');
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      if (Math.abs(d(pts[i]!, pts[j]!) - dmin) > 1e-6 * dmin) continue;
      let diff = 0;
      for (let b = 0; b < bits; b++) if (pts[i]!.bits[b] !== pts[j]!.bits[b]) diff++;
      if (diff !== 1) out.push(`constellation: neighbours ${pts[i]!.bits} and ${pts[j]!.bits}`);
    }
  const [Rs, Rb, a, B, eta] = [
    get(k.symbolRate),
    get(k.bitRate),
    get(k.rolloff),
    get(k.bandwidth),
    get(k.efficiency),
  ];
  if (a !== undefined && (a < 0 || a > 1)) out.push(`constellation: roll-off ${a} outside 0 to 1`);
  if (Rs !== undefined && Rb !== undefined && !close(Rb, Rs * bits))
    out.push(`constellation: R_b = ${Rb}, not R_s log₂M = ${Rs * bits}`);
  if (Rs !== undefined && a !== undefined && B !== undefined && !close(B, Rs * (1 + a)))
    out.push(`constellation: B = ${B}, not R_s(1 + α) = ${Rs * (1 + a)}`);
  if (Rb !== undefined && B !== undefined && eta !== undefined && !close(eta, Rb / B))
    out.push(`constellation: η = ${eta}, not R_b ÷ B = ${Rb / B}`);
  return out;
}

/**
 * Picture checks for the college pictures of round 4, group J (`typesHe4j.ts`), called from
 * `repIssues` in `pictures.ts`. Values arrive in the variable's shown unit and are converted
 * to the unit the check is written in. Test-only.
 *
 * - HC155 `heartPump`: SV = EDV − ESV; EF = SV ÷ EDV; CO = HR × SV; MAP = DBP + (SBP − DBP) ÷ 3
 *   and its needle a third of the way round the band; TPR = MAP ÷ CO; each fill level's volume
 *   share (an independent integral of the cavity) is its volume over the cavity's; a tick a beat.
 * - HC156 `footprints`: the prints alternate left and right a step apart, heel to heel; the
 *   stride (one foot's heels) is 2 × step; v = step × cadence ÷ 60; Fr = v² ÷ (gL); the run speed
 *   is √(0.5gL), where Fr = 0.5.
 * - HC157 `springDashpot`: τ = η ÷ E; the drawn curve at τ reads 1 ÷ e ≈ 37% of σ₀ (relaxation)
 *   or 1 − 1 ÷ e ≈ 63% of σ ÷ E (creep); σ₀ = Eε₀ and σ = σ₀e^(−t/τ); ε = (σ ÷ E)(1 − e^(−t/τ)).
 * - HC159 `diffusionProfile`: t = L² ÷ (2D); the drawn profile is half of C₀ at its ticked depth
 *   (an independent erfc); √(2Dt) is L, within the drawn depth and past the half depth.
 */
import type { VariableDef } from '@/engine/types';
import {
  PRINTS,
  beatsDrawn,
  cavityCap,
  cavityLevel,
  creepShare,
  depthSpan,
  DIAL_MAX,
  dialAngle,
  froudeOf,
  halfDepth,
  inUnit,
  printHeels,
  relaxShare,
  spreadDepth,
} from '@/components/module/reps/he4jMath';

import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;

const close = (a: number, b: number, rel = 1e-6) =>
  Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b));

/** A share against a page's value written as a share (0.583) or a percent (58.3). */
const sameShare = (page: number, share: number) =>
  close(page, share, 1e-4) || close(page, 100 * share, 1e-4);

/** The cavity's volume share below height share s, by a midpoint sum of π r² (r² = 2u − u²). */
function cavityIntegral(s: number): number {
  const n = 4000;
  let sum = 0;
  let whole = 0;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const r2 = 2 * u - u * u;
    whole += r2;
    if (u < s) sum += r2;
  }
  return sum / whole;
}

export function he4jIssues(
  rep: Representation,
  val: Val,
  byId: Map<string, VariableDef>,
): string[] {
  /** A field's value read in `unit`. */
  const get = (v: string | number | undefined, unit: string): number | undefined => {
    if (v === undefined) return undefined;
    const x = val(v);
    if (x === undefined) return undefined;
    return typeof v === 'number' ? x : inUnit(x, byId.get(v)?.unit, unit);
  };
  const out: string[] = [];
  switch (rep.kind) {
    case 'heartPump': {
      const edv = get(rep.edv, 'mL');
      const esv = get(rep.esv, 'mL');
      const sv =
        get(rep.sv, 'mL') ?? (edv !== undefined && esv !== undefined ? edv - esv : undefined);
      const hr = get(rep.hr, 'min⁻¹');
      const co = get(rep.co, 'L/min');
      const sbp = get(rep.sbp, 'mmHg');
      const dbp = get(rep.dbp, 'mmHg');
      const map = get(rep.map, 'mmHg');
      const tpr = get(rep.tpr, 'mmHg·min/L');
      const ef = get(rep.ef, '%');
      if (edv !== undefined && esv !== undefined) {
        if (sv !== undefined && !close(sv, edv - esv, 1e-4))
          out.push(`heartPump: SV ${sv} is not EDV − ESV = ${edv - esv}`);
        // Each level to scale: its height's volume share, summed afresh, is V ÷ the cavity's.
        const cap = cavityCap(Math.max(edv, esv, sv ?? 0));
        for (const [name, v] of [
          ['EDV', edv],
          ['ESV', esv],
        ] as const) {
          if (v > cap) out.push(`heartPump: ${name} ${v} mL overfills the ${cap} mL cavity`);
          const s = cavityLevel(v / cap);
          if (Math.abs(cavityIntegral(s) - Math.min(1, v / cap)) > 2e-3)
            out.push(`heartPump: the ${name} level holds ${cavityIntegral(s) * cap} mL, not ${v}`);
        }
      }
      if (ef !== undefined && sv !== undefined && edv !== undefined && !sameShare(ef, sv / edv))
        out.push(`heartPump: EF ${ef} is not SV ÷ EDV = ${sv / edv}`);
      if (
        co !== undefined &&
        hr !== undefined &&
        sv !== undefined &&
        !close(co, (hr * sv) / 1000, 1e-4)
      )
        out.push(`heartPump: CO ${co} L/min is not HR × SV = ${(hr * sv) / 1000}`);
      // A tick a beat (whole beats; past 250 a minute the strip is full and the caption says so).
      if (hr !== undefined && hr >= 0 && hr <= 250 && beatsDrawn(hr) !== Math.round(hr))
        out.push(`heartPump: ${beatsDrawn(hr)} ticks for HR ${hr}`);
      if (sbp !== undefined && dbp !== undefined) {
        const m = dbp + (sbp - dbp) / 3;
        if (map !== undefined && !close(map, m, 1e-4))
          out.push(`heartPump: MAP ${map} is not DBP + (SBP − DBP) ÷ 3 = ${m}`);
        // On the dial (DBP below SBP, both within 0–300 mmHg; else the caption says why), the
        // needle sits a third of the way round the band from DBP.
        const a0 = dialAngle(dbp);
        const a1 = dialAngle(sbp);
        if (
          dbp >= 0 &&
          dbp < sbp &&
          sbp <= DIAL_MAX &&
          Math.abs(dialAngle(map ?? m) - (a0 + (a1 - a0) / 3)) > 1e-3
        )
          out.push('heartPump: the MAP needle is not a third of the way from DBP to SBP');
      }
      if (tpr !== undefined && map !== undefined && co !== undefined && !close(tpr, map / co, 1e-4))
        out.push(`heartPump: TPR ${tpr} is not MAP ÷ CO = ${map / co}`);
      break;
    }
    case 'footprints': {
      const step = get(rep.step, 'm');
      const cadence = get(rep.cadence, 'min⁻¹');
      const stride = get(rep.stride, 'm');
      const v = get(rep.speed, 'm/s');
      const leg = get(rep.leg, 'm');
      const fr = get(rep.froude, '');
      const run = get(rep.runSpeed, 'm/s');
      const g = get(rep.g, 'm/s²') ?? 9.81;
      if (step !== undefined && step > 0) {
        const heels = printHeels(step);
        if (heels.length !== PRINTS) out.push(`footprints: ${heels.length} prints`);
        heels.forEach((h, i) => {
          if (i > 0 && !close(h.x - heels[i - 1]!.x, step))
            out.push(`footprints: prints ${i} and ${i + 1} are not a step apart`);
          if (i > 0 && h.side === heels[i - 1]!.side)
            out.push('footprints: two prints of one foot in a row');
        });
        const drawnStride = heels[2]!.x - heels[0]!.x;
        if (!close(drawnStride, 2 * step))
          out.push(`footprints: the drawn stride is ${drawnStride}`);
        if (stride !== undefined && !close(stride, 2 * step, 1e-4))
          out.push(`footprints: stride ${stride} is not 2 × step = ${2 * step}`);
        if (v !== undefined && cadence !== undefined && !close(v, (step * cadence) / 60, 1e-4))
          out.push(`footprints: v ${v} is not step × cadence ÷ 60 = ${(step * cadence) / 60}`);
      }
      if (
        fr !== undefined &&
        v !== undefined &&
        leg !== undefined &&
        !close(fr, froudeOf(v, g, leg), 1e-4)
      )
        out.push(`footprints: Fr ${fr} is not v² ÷ (gL) = ${froudeOf(v, g, leg)}`);
      if (run !== undefined && leg !== undefined && !close(froudeOf(run, g, leg), 0.5, 1e-4))
        out.push(`footprints: the run speed ${run} does not give Fr = 0.5`);
      break;
    }
    case 'springDashpot': {
      const raw = (v: string | number | undefined) => (v === undefined ? undefined : val(v));
      const E = raw(rep.E);
      const eta = raw(rep.eta);
      const tauGiven = get(rep.tau, 's');
      const tau = tauGiven ?? (E !== undefined && eta !== undefined && E > 0 ? eta / E : undefined);
      const t = get(rep.t, 's');
      if (
        tauGiven !== undefined &&
        E !== undefined &&
        eta !== undefined &&
        !close(tauGiven, eta / E, 1e-4)
      )
        out.push(`springDashpot: τ ${tauGiven} is not η ÷ E = ${eta / E}`);
      if (tau === undefined || !(tau > 0)) break;
      // The curve the picture draws, read at τ against e (an independent constant).
      const atTau = rep.model === 'maxwell' ? relaxShare(tau, tau) : creepShare(tau, tau);
      const want = rep.model === 'maxwell' ? 1 / Math.E : 1 - 1 / Math.E;
      if (Math.abs(atTau - want) > 1e-12) out.push(`springDashpot: the curve at τ reads ${atTau}`);
      if (rep.model === 'maxwell') {
        const e0 = raw(rep.strain0);
        const s0 = raw(rep.stress0) ?? (E !== undefined && e0 !== undefined ? E * e0 : undefined);
        if (
          raw(rep.stress0) !== undefined &&
          E !== undefined &&
          e0 !== undefined &&
          !close(s0!, E * e0, 1e-4)
        )
          out.push(`springDashpot: σ₀ ${s0} is not Eε₀ = ${E * e0}`);
        const s = raw(rep.stress);
        if (
          s !== undefined &&
          s0 !== undefined &&
          t !== undefined &&
          !close(s, s0 * Math.exp(-t / tau), 1e-4)
        )
          out.push(`springDashpot: σ ${s} is not σ₀e^(−t/τ) = ${s0 * Math.exp(-t / tau)}`);
      } else {
        const load = raw(rep.load);
        const fin =
          raw(rep.final) ?? (load !== undefined && E !== undefined ? load / E : undefined);
        if (
          raw(rep.final) !== undefined &&
          load !== undefined &&
          E !== undefined &&
          !close(fin!, load / E, 1e-4)
        )
          out.push(`springDashpot: the final strain ${fin} is not σ ÷ E = ${load / E}`);
        const e = raw(rep.strain);
        if (
          e !== undefined &&
          fin !== undefined &&
          t !== undefined &&
          !close(e, fin * (1 - Math.exp(-t / tau)), 1e-4)
        )
          out.push(
            `springDashpot: ε ${e} is not (σ ÷ E)(1 − e^(−t/τ)) = ${fin * (1 - Math.exp(-t / tau))}`,
          );
      }
      break;
    }
    case 'diffusionProfile': {
      // D in μm²/s, depths in μm, times in s.
      const D = get(rep.D, 'm²/s');
      const Dum = D === undefined ? undefined : D * 1e12;
      const L = get(rep.L, 'μm');
      const t = get(rep.t, 's');
      if (Dum === undefined || !(Dum > 0)) break;
      if (L !== undefined && t !== undefined && !close(t, (L * L) / (2 * Dum), 1e-4))
        out.push(`diffusionProfile: t ${t} s is not L² ÷ (2D) = ${(L * L) / (2 * Dum)} s`);
      const tt = t ?? (L !== undefined ? (L * L) / (2 * Dum) : undefined);
      if (tt === undefined || !(tt > 0)) break;
      // The half-concentration depth on the drawn profile, against an independent erfc
      // (Simpson's rule on e^(−u²)): erfc(x½ ÷ 2√(Dt)) = ½, so x½ ≈ 0.954√(Dt).
      const x = halfDepth(Dum, tt);
      const z = x / (2 * Math.sqrt(Dum * tt));
      const n = 400;
      let sum = 0;
      for (let i = 0; i <= n; i++) {
        const u = (z * i) / n;
        sum += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * Math.exp(-u * u);
      }
      const erfcZ = 1 - ((2 / Math.sqrt(Math.PI)) * sum * z) / (3 * n);
      if (Math.abs(erfcZ - 0.5) > 1e-6)
        out.push(`diffusionProfile: the half-concentration depth reads ${erfcZ} of C₀`);
      // √(2Dt) is the page's L, on the drawn scale, and lies past the half depth (1.48 × x½).
      const spread = spreadDepth(Dum, tt);
      if (L !== undefined && !close(spread, L, 1e-4))
        out.push(`diffusionProfile: √(2Dt) ${spread} is not L ${L}`);
      if (spread > depthSpan(L ?? spread)) out.push('diffusionProfile: L is past the drawn depth');
      if (!(spread > x)) out.push('diffusionProfile: L is not past the half depth');
      break;
    }
  }
  return out;
}

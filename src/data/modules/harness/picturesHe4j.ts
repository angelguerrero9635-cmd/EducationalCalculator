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
 */
import type { VariableDef } from '@/engine/types';
import {
  PRINTS,
  beatsDrawn,
  cavityCap,
  cavityLevel,
  DIAL_MAX,
  dialAngle,
  froudeOf,
  inUnit,
  printHeels,
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
  }
  return out;
}

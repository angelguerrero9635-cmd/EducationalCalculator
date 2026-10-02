/**
 * Picture checks for the college pictures of round 2, group D: the op-amp circuits (HC18). The
 * picture draws the ideal amplifier, so the page's values must be the ones it makes: the gain
 * as written, the output from the parts, |v_out| never past the rail, and the virtual short
 * (v₊ = v₋ within 1 mV with the page's output in place) unless the output is at a rail. The
 * integrator's ramp, the low-pass cutoff, the Schmitt thresholds and the instrumentation
 * amplifier's gain, common-mode gain and hum likewise. Test-only.
 */
import type { VariableDef } from '@/engine/types';

import { ampSolve, inputsFor, siUnit, type AmpIn } from '@/components/module/reps/ampMath';

import type { NumOrVar } from '../typesGraphs';
import type { AmpSpec } from '../typesHe2d';

type Val = (id: string) => number | undefined;

const near = (a: number, b: number, floor = 1e-12) =>
  Math.abs(a - b) <= Math.max(floor, 1e-3 * Math.max(Math.abs(a), Math.abs(b)));

/** HC18: `val` reads formula units. */
export function ampIssues(rep: AmpSpec, val: Val, byId: Map<string, VariableDef>): string[] {
  const out: string[] = [];
  const si = (x: NumOrVar | undefined): number | undefined => {
    if (x === undefined || typeof x === 'number') return x;
    const raw = val(x);
    return raw === undefined ? undefined : raw * siUnit(byId.get(x)?.unit);
  };
  const kind = rep.amp;
  const tag = `seriesCircuit amp ${kind}`;
  // Rounding in the solver leaves a few pV on an output of 0: a floor at a billionth of the inputs.
  const scale = Math.max(1, ...[...(rep.vin ?? []), rep.rail].map((x) => Math.abs(si(x) ?? 0)));
  const same = (
    id: string | undefined,
    want: number | undefined,
    what: string,
    floor = 1e-9 * scale,
  ) => {
    const x = si(id);
    if (id === undefined || x === undefined || want === undefined || !Number.isFinite(want)) return;
    if (!near(x, want, floor)) out.push(`${tag}: ${what} ${id} = ${x}, the circuit makes ${want}`);
  };
  const a: AmpIn = {
    vin: (rep.vin ?? []).map(si),
    rin: (rep.rin ?? []).map(si),
    rf: si(rep.rf),
    rg: si(rep.rg),
    c: si(rep.c),
    rail: si(rep.rail),
    time: si(rep.time),
    v0: si(rep.v0),
    cmrr: typeof rep.cmrr === 'string' ? val(rep.cmrr) : rep.cmrr,
    gain:
      kind === 'instrumentation' && rep.gain && (rep.rf === undefined || rep.rg === undefined)
        ? si(rep.gain)
        : undefined,
  };
  for (const [what, x] of [
    ['a resistor', a.rf],
    ['a resistor', a.rg],
    ['a resistor', a.rin[0]],
    ['a resistor', a.rin[1]],
    ['the capacitor', a.c],
    ['the rail', a.rail],
  ] as const)
    if (x !== undefined && x <= 0) out.push(`${tag}: ${what} is ${x}, not above 0`);
  const s = ampSolve(kind, a);

  const vout = si(rep.vout);
  if (vout !== undefined && a.rail !== undefined && Math.abs(vout) > a.rail * (1 + 1e-6))
    out.push(`${tag}: |v_out| = ${Math.abs(vout)} V is past the rail ${a.rail} V`);
  if (kind !== 'schmitt') same(rep.vout, s.vout, 'the output');
  if (kind !== 'instrumentation' || a.gain === undefined) same(rep.gain, s.gain, 'the gain');
  same(rep.cutoff, s.cutoff, 'the cutoff f_c = 1 ÷ (2πR_f C)');
  same(rep.threshold, s.threshold, 'the threshold V_TH = V_sat R₁ ÷ (R₁ + R₂)');
  if (s.threshold !== undefined) same(rep.width, 2 * s.threshold, 'the hysteresis 2V_TH');
  same(rep.common, s.common, 'A_c = G ÷ 10^(CMRR ÷ 20)');
  same(rep.hum, s.hum, 'the hum A_c V_cm');

  // The virtual short, with the page's own output in place.
  if (vout !== undefined) {
    const v = inputsFor(kind, a, vout);
    const atRail = a.rail !== undefined && Math.abs(Math.abs(vout) - a.rail) <= 1e-6 * a.rail;
    if (v && !atRail && Math.abs(v.plus - v.minus) > 1e-3)
      out.push(
        `${tag}: v₊ = ${v.plus} V and v₋ = ${v.minus} V differ by more than 1 mV (no virtual short)`,
      );
  }
  return out;
}

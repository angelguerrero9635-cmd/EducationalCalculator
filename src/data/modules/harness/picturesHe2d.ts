/**
 * Picture checks for the college pictures of round 2, group D: the op-amp circuits (HC18). The
 * picture draws the ideal amplifier, so the page's values must be the ones it makes: the gain
 * as written, the output from the parts, |v_out| never past the rail, and the virtual short
 * (v₊ = v₋ within 1 mV with the page's output in place) unless the output is at a rail. The
 * integrator's ramp, the low-pass cutoff, the Schmitt thresholds and the instrumentation
 * amplifier's gain, common-mode gain and hum likewise. The semiconductor circuits (HC39) are
 * checked below. Test-only.
 */
import type { VariableDef } from '@/engine/types';

import { ampSolve, inputsFor, siUnit, type AmpIn } from '@/components/module/reps/ampMath';
import {
  VCE_SAT,
  VT,
  bjtDivider,
  bridge,
  diodeR,
  hybridPi,
  mosfetCS,
  zener,
} from '@/components/module/reps/deviceMath';

import type { NumOrVar } from '../typesGraphs';
import type { AmpSpec, DeviceSpec } from '../typesHe2d';

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

/**
 * HC39: the semiconductor circuits. Each labelled value must be the one the drawn model makes
 * from the page's parts (diode drop, zener split, bridge ripple, divider bias, g_m and gains),
 * and the BJT's active formulas only while V_CE > 0.2 V. `val` reads formula units.
 */
export function deviceIssues(rep: DeviceSpec, val: Val, byId: Map<string, VariableDef>): string[] {
  const out: string[] = [];
  const si = (x: NumOrVar | undefined): number | undefined => {
    if (x === undefined || typeof x === 'number') return x;
    const raw = val(x);
    return raw === undefined ? undefined : raw * siUnit(byId.get(x)?.unit);
  };
  const tag = `seriesCircuit device ${rep.device}`;
  const same = (id: string | undefined, want: number | undefined, what: string) => {
    const x = si(id);
    if (id === undefined || x === undefined || want === undefined || !Number.isFinite(want)) return;
    if (!near(x, want, 1e-12)) out.push(`${tag}: ${what} ${id} = ${x}, the circuit makes ${want}`);
  };
  const v = rep.values ?? {};
  const p = rep.parts.map(si);
  switch (rep.device) {
    case 'diodeR': {
      const d = diodeR(p[0], p[1], p[2]);
      same(v.vr, d.vr, 'V_R = Vₛ − V_D');
      same(v.current, d.i, 'I = V_R ÷ R');
      same(v.power, d.p, 'P_D = V_D I');
      break;
    }
    case 'zener': {
      const z = zener(p[0], p[1], p[2], si(v.current));
      same(v.zener, z.iz, 'I_Z = (Vₛ − V_Z) ÷ R − I_L');
      same(v.power, z.pNoLoad, 'P_Z = V_Z(Vₛ − V_Z) ÷ R');
      const iz = si(v.zener);
      if (iz !== undefined && iz < 0)
        out.push(`${tag}: the zener current is negative (out of regulation)`);
      break;
    }
    case 'bridge': {
      const b = bridge(p[0], si(rep.drop) ?? 0.7, si(v.frequency), p[1], p[2]);
      same(v.peak, b.vp, 'V_p = V_sec − 2V_D');
      same(v.ripple, b.vr, 'V_r = V_p ÷ (f_r RC)');
      same(v.dc, b.vdc, 'V_dc = V_p − V_r ÷ 2');
      break;
    }
    case 'bjtDivider': {
      const b = bjtDivider(p[0], p[1], p[2], p[3], p[4]);
      same(v.base, b.vb, 'V_B = V_CC R₂ ÷ (R₁ + R₂)');
      same(v.current, b.ic, 'I_C = (V_B − 0.7) ÷ R_E');
      same(v.vce, b.vce, 'V_CE = V_CC − I_C(R_C + R_E)');
      const vce = si(v.vce);
      if (vce !== undefined && vce <= VCE_SAT)
        out.push(`${tag}: V_CE = ${vce} V is not above 0.2 V, yet the active formulas are used`);
      break;
    }
    case 'mosfetCS': {
      const m = mosfetCS(si(v.current), si(v.overdrive), p[0]);
      same(v.gm, m.gm, 'g_m = 2I_D ÷ V_OV');
      same(v.gain, m.av, 'A_v = −g_m R_D');
      break;
    }
    case 'hybridPi': {
      const h = hybridPi(si(v.current), si(v.beta), p[0], p[1], si(rep.vt) ?? VT);
      same(v.gm, h.gm, 'g_m = I_C ÷ V_T');
      same(v.rpi, h.rpi, 'r_π = β ÷ g_m');
      same(v.rp, h.rp, 'R_p = R_C ∥ R_L');
      same(v.gain, h.av, 'A_v = −g_m R_p');
      break;
    }
  }
  return out;
}

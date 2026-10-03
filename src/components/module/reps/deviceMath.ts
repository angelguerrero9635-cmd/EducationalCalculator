/**
 * The arithmetic of the semiconductor circuits (HC39, DeviceSchematic.tsx), in SI units, with
 * the textbook models the pages state: a diode's constant drop, the zener holding V_Z, the
 * bridge's two drops and linear ripple, a voltage-divider BJT with V_BE = 0.7 V and a stiff
 * divider, the MOSFET's g_m = 2I_D ÷ V_OV and the hybrid-π g_m = I_C ÷ V_T. Shared by the
 * picture (the rectified wave, the active region) and its harness check.
 */

/** V_BE of a silicon BJT in the active region (the plans' assumption). */
export const VBE = 0.7;
/** Past this the BJT saturates: the active-mode formulas stop holding. */
export const VCE_SAT = 0.2;
/** The thermal voltage at room temperature, the hybrid-π default. */
export const VT = 0.02585;

const ok = (...xs: (number | undefined)[]): boolean =>
  xs.every((x) => x !== undefined && Number.isFinite(x));

export const diodeR = (vs?: number, vd?: number, r?: number) => {
  if (!ok(vs, vd)) return {};
  const on = vs! > vd!;
  const vr = on ? vs! - vd! : 0;
  const i = ok(r) && r! > 0 ? vr / r! : undefined;
  return { on, vr, i, p: i === undefined ? undefined : vd! * i };
};

/** The zener regulator: the current through R splits into the load's and the zener's. */
export const zener = (vs?: number, vz?: number, r?: number, il?: number) => {
  if (!ok(vs, vz, r) || r! <= 0) return {};
  const total = (vs! - vz!) / r!;
  return {
    total,
    iz: ok(il) ? total - il! : undefined,
    /** With no load all of it goes through the zener. */
    pNoLoad: vz! * total,
  };
};

/** The bridge: V_p after two drops, the ripple V_p ÷ (f_r RC), V_dc halfway down it. */
export const bridge = (vsec?: number, drop = 0.7, fr?: number, r?: number, c?: number) => {
  if (!ok(vsec)) return {};
  const vp = vsec! - 2 * drop;
  const vr = ok(fr, r, c) && fr! * r! * c! > 0 ? vp / (fr! * r! * c!) : undefined;
  return { vp, vr, vdc: vr === undefined ? undefined : vp - vr / 2 };
};

/**
 * The capacitor's voltage on a full-wave rectified wave of peak `vp` (ripple frequency `fr`):
 * it falls in a straight line by `vr` a period from each peak until the rising wave meets it.
 * `n` points across `periods` periods, from t = 0.
 */
export function rippleWave(vp: number, vr: number, fr: number, periods: number, n = 240) {
  const T = 1 / fr;
  const wave = (t: number) => vp * Math.abs(Math.sin(Math.PI * fr * t));
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = (periods * T * i) / n;
    // The last peak at or before t (peaks at T/2 + kT).
    const k = Math.floor((t - T / 2) / T);
    const held = k < 0 ? -Infinity : vp - vr * fr * (t - (T / 2 + k * T));
    pts.push([t, Math.max(wave(t), held)]);
  }
  return { pts, wave };
}

/** The divider-biased BJT: V_B, I_C ≈ I_E, V_CE and whether it is active. */
export const bjtDivider = (vcc?: number, r1?: number, r2?: number, rc?: number, re?: number) => {
  if (!ok(vcc, r1, r2) || r1! + r2! <= 0) return {};
  const vb = (vcc! * r2!) / (r1! + r2!);
  const ic = ok(re) && re! > 0 ? Math.max(0, vb - VBE) / re! : undefined;
  const vce = ic !== undefined && ok(rc) ? vcc! - ic * (rc! + re!) : undefined;
  return { vb, ic, vce, active: vce === undefined ? undefined : vce > VCE_SAT };
};

export const mosfetCS = (id?: number, vov?: number, rd?: number) => {
  const gm = ok(id, vov) && vov! > 0 ? (2 * id!) / vov! : undefined;
  return { gm, av: gm !== undefined && ok(rd) ? -gm * rd! : undefined };
};

export const hybridPi = (ic?: number, beta?: number, rc?: number, rl?: number, vt = VT) => {
  const gm = ok(ic) ? ic! / vt : undefined;
  const rpi = gm !== undefined && gm > 0 && ok(beta) ? beta! / gm : undefined;
  const rp = ok(rc, rl) && rc! + rl! > 0 ? (rc! * rl!) / (rc! + rl!) : undefined;
  return { gm, rpi, rp, av: gm !== undefined && rp !== undefined ? -gm * rp : undefined };
};

/**
 * The arithmetic the round-3 group K pictures draw (HC62, HC63, HC86, HC87, HC91), shared with
 * their harness checks (harness/picturesHe3k.ts), so a check measures what is drawn.
 */

// ─── HC91: decibel waterfall ─────────────────────────────────────────────────

/** The running level before and after each signed item (from 0, or from the first item). */
export function dbLevels(items: { sign: number; value: number }[]) {
  const out: { from: number; to: number }[] = [];
  let at = 0;
  for (const it of items) {
    const to = at + it.sign * it.value;
    out.push({ from: at, to });
    at = to;
  }
  return out;
}

/** One decimal with a true minus sign, and a plus when asked: "+3.0", "−64.0". */
export const db1 = (x: number, plus = false) => {
  const r = Math.round(x * 10) / 10;
  const s = Math.abs(r).toFixed(1);
  return r < 0 ? `−${s}` : plus && r > 0 ? `+${s}` : s;
};

/** A nice tick step for a span about `n` ticks long (1, 2, 5, 10 …). */
export function niceStep(span: number, n = 5) {
  const raw = Math.max(span, 1e-9) / n;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const m = raw / pow;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * pow;
}

// ─── HC86: lamina ────────────────────────────────────────────────────────────

/** The densest a hexagonal array packs: π ÷ (2√3) ≈ 0.907. */
export const HEX_MAX = Math.PI / (2 * Math.sqrt(3));

/**
 * A lamina's section end-on: fibers on a hexagonal array in a block `cols` spacings wide and
 * `rows` double rows tall, so the block tiles the array exactly and the fiber share of it is V_f.
 * Centres include the fibers cut by the edges (drawn clipped).
 */
export function laminaFibers(Vf: number, width: number, cols = 5, rows = 2) {
  const d = width / cols;
  const dy = (Math.sqrt(3) / 2) * d;
  const r = d * Math.sqrt((Math.max(0, Math.min(Vf, HEX_MAX)) * Math.sqrt(3)) / (2 * Math.PI));
  const height = rows * 2 * dy;
  const centers: { x: number; y: number }[] = [];
  for (let j = -1; j <= rows * 2 + 1; j++)
    for (let i = -1; i <= cols + 1; i++) {
      const x = i * d + (j % 2 !== 0 ? d / 2 : 0);
      const y = j * dy;
      if (x + r > 0 && x - r < width && y + r > 0 && y - r < height) centers.push({ x, y });
    }
  return { width, height, r, centers };
}

/** The fiber share of the drawn block, measured on a fine grid (the harness's check). */
const shares = new Map<number, number>();
export function drawnFiberShare(Vf: number, n = 200) {
  const key = Math.round(Vf * 1e4);
  const memo = shares.get(key);
  if (memo !== undefined) return memo;
  const { width, height, r, centers } = laminaFibers(Vf, 100);
  let inside = 0;
  let all = 0;
  for (let a = 0; a < n; a++)
    for (let b = 0; b < n; b++) {
      const x = ((a + 0.5) / n) * width;
      const y = ((b + 0.5) / n) * height;
      all++;
      if (centers.some((c) => (c.x - x) ** 2 + (c.y - y) ** 2 <= r * r)) inside++;
    }
  shares.set(key, inside / all);
  return inside / all;
}

/** E₁ by the rule of mixtures (along) and E₂ by the inverse rule (across). */
export const ruleOfMixtures = (Ef: number, Em: number, Vf: number) => Ef * Vf + Em * (1 - Vf);
export const inverseRule = (Ef: number, Em: number, Vf: number) => 1 / (Vf / Ef + (1 - Vf) / Em);

// ─── HC87: rocket ────────────────────────────────────────────────────────────

/** The ideal Δv: I_sp g ln(m₀ ÷ m_f) (undefined unless m₀ > m_f > 0). */
export const rocketDv = (Isp: number, g: number, m0: number, mf: number) =>
  m0 > 0 && mf > 0 ? Isp * g * Math.log(m0 / mf) : undefined;

/** The mass bar's two parts, `width` long in all: propellant (m₀ − m_f) and dry (m_f). */
export const massBar = (m0: number, mf: number, width: number) => ({
  prop: (width * Math.max(0, m0 - mf)) / m0,
  dry: (width * Math.min(mf, m0)) / m0,
});

/** Thrust F = ṁv_e·mv + (p_e − p_a)A_e·pA, each part in the force's unit. */
export const thrustParts = (
  mdot: number,
  ve: number,
  pe: number,
  pa: number,
  Ae: number,
  mv = 0.001,
  pA = 1,
) => ({ momentum: mdot * ve * mv, pressure: (pe - pa) * Ae * pA });

// ─── HC62: device curves ─────────────────────────────────────────────────────

/** Shockley's diode equation, I = I_S(e^(V ÷ nV_T) − 1). */
export const shockley = (Is: number, n: number, VT: number, V: number) =>
  Is * (Math.exp(V / (n * VT)) - 1);

/** The constant-drop diode: no current below V_D; at V_D, whatever the circuit sets. */
export const dropQ = (Vs: number, VD: number, R: number) =>
  Vs > VD && R > 0 ? { V: VD, I: (Vs - VD) / R } : undefined;

/** A MOSFET's drain current at overdrive V_OV and V_DS (triode below V_OV, flat above it). */
export function mosfetId(kn: number, Vov: number, Vds: number) {
  if (Vov <= 0) return 0;
  const v = Math.max(0, Vds);
  return v < Vov ? kn * (Vov * v - (v * v) / 2) : 0.5 * kn * Vov * Vov;
}

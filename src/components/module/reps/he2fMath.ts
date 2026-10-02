/**
 * The arithmetic behind group HE2F's college pictures (typesHe2f.ts), shared by the drawings and
 * the harness so both draw and check the same numbers. Angles in degrees unless named.
 */
const RAD = Math.PI / 180;

/** HC20 pulley: a, the tensions and each block's forces (N), signs as the arrows point. */
export function pulleyOf(inp: {
  layout: 'table' | 'atwood';
  m1: number;
  m2: number;
  mu: number;
  M: number;
  g: number;
}) {
  const { layout, m1, m2, mu, M, g } = inp;
  const inertia = M / 2;
  if (layout === 'table') {
    const raw = ((m2 - mu * m1) * g) / (m1 + m2 + inertia);
    // Friction big enough to hold: nothing slides, static friction matches W₂.
    const holds = raw <= 0;
    const a = holds ? 0 : raw;
    const T2 = m2 * (g - a);
    const T1 = holds ? T2 : T2 - inertia * a;
    const f = holds ? T1 : mu * m1 * g;
    return { a, T1, T2, W1: m1 * g, W2: m2 * g, N1: m1 * g, f, holds };
  }
  // Atwood: a > 0 means m₂ goes down and m₁ up.
  const a = ((m2 - m1) * g) / (m1 + m2 + inertia);
  return {
    a,
    T1: m1 * (g + a),
    T2: m2 * (g - a),
    W1: m1 * g,
    W2: m2 * g,
    N1: 0,
    f: 0,
    holds: false,
  };
}

/** HC20 ladder against a smooth wall: N_w = W ÷ (2 tan θ), f = N_w, N_f = W, least μ = f ÷ N_f. */
export function ladderOf(W: number, deg: number) {
  const Nw = W / (2 * Math.tan(deg * RAD));
  return { Nw, f: Nw, Nf: W, mu: W > 0 ? Nw / W : 0 };
}

/** HC20 tip or slip: P_tip = Wb ÷ (2h), P_slip = μW; the smaller one governs. */
export function tipOf(W: number, b: number, h: number, mu: number) {
  const tip = h > 0 ? (W * b) / (2 * h) : Infinity;
  const slip = mu * W;
  return { tip, slip, P: Math.min(tip, slip), tips: tip < slip, tie: Math.abs(tip - slip) < 1e-9 };
}

/** HC20 belt friction: T₂ = T₁e^(μβ), β in radians. */
export const capstan = (t1: number, mu: number, beta: number) => t1 * Math.exp(mu * beta);

/**
 * HC20 banked curve: the normal force and the inward net force per unit of mg, and the speed
 * the bank is made for. Without friction N = mg ÷ cos θ and v² = gr tan θ; at the top speed with
 * μ, N = mg ÷ (cos θ − μ sin θ), v² = gr (sin θ + μ cos θ) ÷ (cos θ − μ sin θ).
 */
export function bankOf(deg: number, mu: number) {
  const s = Math.sin(deg * RAD);
  const c = Math.cos(deg * RAD);
  const den = c - mu * s;
  const N = den > 0 ? 1 / den : Infinity;
  return {
    N,
    inward: N * (s + mu * c),
    friction: mu * N,
    ratio: den > 0 ? (s + mu * c) / den : Infinity,
  };
}

/** HC25 a level turn banked φ: n = 1 ÷ cos φ; R = V² ÷ (g tan φ); ω = V ÷ R. */
export function turnOf(phiDeg: number, V: number, g: number) {
  const t = Math.tan(phiDeg * RAD);
  const n = 1 / Math.cos(phiDeg * RAD);
  const R = t > 0 ? (V * V) / (g * t) : Infinity;
  return { n, R, omega: R > 0 && Number.isFinite(R) ? V / R : 0 };
}

/** HC25 a steady climb at γ: L = W cos γ and T = D + W sin γ. */
export const climbOf = (W: number, gammaDeg: number) => ({
  L: W * Math.cos(gammaDeg * RAD),
  along: W * Math.sin(gammaDeg * RAD),
});

/** A nice magnification (1, 2, 5, 10, 20, …) so the smaller forces reach about half the bigger. */
export function magnify(big: number, small: number) {
  if (!(small > 0) || !(big > 0)) return 1;
  const want = (0.5 * big) / small;
  if (want <= 1.5) return 1;
  const steps = [1, 2, 5];
  for (let p = 1; p < 1e9; p *= 10)
    for (const s of steps) {
      const m = s * p;
      if (m * 1.5 > want) return m;
    }
  return 1;
}

/** HC35 an ellipse from perigee and apogee: a, the focus offset c, b, e and p = a(1 − e²). */
export function ellipseOf(rp: number, ra: number) {
  const a = (rp + ra) / 2;
  const c = (ra - rp) / 2;
  const e = a > 0 ? c / a : 0;
  return { a, c, e, b: Math.sqrt(Math.max(0, rp * ra)), p: a * (1 - e * e) };
}

/** HC35 vis-viva: v² = μ(2 ÷ r − 1 ÷ a). */
export const visViva = (mu: number, r: number, a: number) =>
  Math.sqrt(Math.max(0, mu * (2 / r - 1 / a)));

/** HC35 a Hohmann transfer between circular orbits r₁ and r₂ round μ. */
export function hohmannOf(mu: number, r1: number, r2: number) {
  const el = ellipseOf(Math.min(r1, r2), Math.max(r1, r2));
  const v1 = Math.sqrt(mu / r1);
  const v2 = Math.sqrt(mu / r2);
  const vp = visViva(mu, r1, el.a);
  const va = visViva(mu, r2, el.a);
  return {
    ...el,
    v1,
    v2,
    vp,
    va,
    dv1: vp - v1,
    dv2: v2 - va,
    tof: Math.PI * Math.sqrt(el.a ** 3 / mu),
  };
}

/** HC35 the true anomaly ν (radians, 0 to π) where an ellipse's distance is r. */
export function anomalyAt(rp: number, ra: number, r: number) {
  const { e, p } = ellipseOf(rp, ra);
  if (e < 1e-9) return Math.PI / 2;
  return Math.acos(Math.min(1, Math.max(-1, (p / r - 1) / e)));
}

/** HC35 the synodic period: 1 ÷ S = |1 ÷ T₁ − 1 ÷ T₂|. */
export const synodicOf = (t1: number, t2: number) => 1 / Math.abs(1 / t1 - 1 / t2);

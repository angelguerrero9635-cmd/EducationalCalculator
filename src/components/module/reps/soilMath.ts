/**
 * The numbers behind the `soilProfile` picture (HC26, `typesHe2i.ts`): stresses with depth,
 * one-dimensional consolidation settlement, bearing capacity factors and the general shear
 * failure mechanism, and the pavement's structural number. Shared by the picture and its
 * harness check.
 */

export interface Layer {
  top: number;
  bottom: number;
  gamma: number;
  gammaSat: number;
}

/** Layers stacked from the surface (the last one runs on down). */
export function stackLayers(
  ls: { thickness: number; gamma?: number; gammaSat?: number }[],
): Layer[] {
  let top = 0;
  return ls.map((l, i) => {
    const bottom = i === ls.length - 1 ? Infinity : top + l.thickness;
    const g = l.gamma ?? l.gammaSat ?? 0;
    const out = { top, bottom, gamma: g, gammaSat: l.gammaSat ?? g };
    top = bottom;
    return out;
  });
}

/** Total stress, pore pressure and effective stress at depth z. */
export function stressAt(layers: Layer[], zw: number, z: number, gw: number) {
  let sigma = 0;
  for (const l of layers) {
    if (z <= l.top) break;
    const a = l.top;
    const b = Math.min(z, l.bottom);
    // The part above the water table at γ, the part below at γ_sat.
    const dry = Math.max(0, Math.min(b, zw) - a);
    const wet = Math.max(0, b - Math.max(a, zw));
    sigma += l.gamma * dry + l.gammaSat * wet;
  }
  const u = z > zw ? gw * (z - zw) : 0;
  return { sigma, u, eff: sigma - u };
}

/** The depths where a stress line bends: the layer boundaries and the water table, to `zMax`. */
export function bendDepths(layers: Layer[], zw: number, zMax: number): number[] {
  const ds = new Set<number>([0, zMax]);
  for (const l of layers) if (l.bottom < zMax) ds.add(l.bottom);
  if (zw > 0 && zw < zMax) ds.add(zw);
  return [...ds].sort((a, b) => a - b);
}

/**
 * Primary consolidation settlement of a clay layer, S = H ÷ (1 + e₀) × (…): normally
 * consolidated, C_c log((σ′₀ + Δσ) ÷ σ′₀); with C_s and σ′_p, recompression to σ′_p first.
 */
export function settlement(
  H: number,
  Cc: number,
  e0: number,
  s0: number,
  ds: number,
  Cs?: number,
  sp?: number,
): number | undefined {
  if (!(s0 > 0) || !(s0 + ds > 0) || !(1 + e0 > 0)) return undefined;
  const k = H / (1 + e0);
  const end = s0 + ds;
  if (Cs !== undefined && sp !== undefined && sp > 0) {
    if (end <= sp) return k * Cs * Math.log10(end / s0);
    return k * (Cs * Math.log10(sp / s0) + Cc * Math.log10(end / sp));
  }
  return k * Cc * Math.log10(end / s0);
}

const D = Math.PI / 180;

/** Bearing capacity factors (Reissner–Prandtl N_q and N_c, Vesic N_γ) from φ in degrees. */
export function bearingFactors(phi: number) {
  const t = Math.tan(phi * D);
  const Nq = Math.exp(Math.PI * t) * Math.tan((45 + phi / 2) * D) ** 2;
  const Nc = phi > 0 ? (Nq - 1) / t : 5.14;
  const Ng = 2 * (Nq + 1) * t;
  return { Nq, Nc, Ng };
}

/**
 * The general shear failure mechanism under a footing B wide, in m with the base's middle at
 * the origin and y down: the active wedge's apex, the log-spiral fan (points along its outer
 * edge) and the passive wedge's top corner, for the right side (mirror for the left).
 */
export function failureMechanism(B: number, phi: number) {
  const a = (45 + phi / 2) * D;
  const apex: [number, number] = [0, (B / 2) * Math.tan(a)];
  const r0 = B / 2 / Math.cos(a);
  const b0 = Math.PI - a;
  const spiral: [number, number][] = [];
  for (let k = 0; k <= 24; k++) {
    const t = ((Math.PI / 2) * k) / 24;
    const r = r0 * Math.exp(t * Math.tan(phi * D));
    const b = b0 - t;
    spiral.push([B / 2 + r * Math.cos(b), r * Math.sin(b)]);
  }
  const end = spiral[spiral.length - 1]!;
  const top: [number, number] = [end[0] + end[1] / Math.tan((45 - phi / 2) * D), 0];
  return { apex, spiral, top };
}

/** The structural number SN = Σ a·D·m (m = 1 when a layer has none). */
export const structuralNumber = (ls: { a: number; D: number; m?: number }[]) =>
  ls.reduce((s, l) => s + l.a * l.D * (l.m ?? 1), 0);
